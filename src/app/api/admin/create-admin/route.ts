import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAdminClient } from "@/lib/supabaseServerOnly";

export async function POST(request: NextRequest) {
  try {
    console.log('Create admin API called'); // Debug log
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Auth error:', authError); // Debug log
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', user.id); // Debug log

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['super_admin', 'platform_admin'].includes(profile.role)) {
      console.log('Permission denied for role:', profile?.role); // Debug log
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    const adminData = await request.json();
    console.log('Admin data received:', adminData); // Debug log
    
    // Use admin client for all operations
    const adminClient = createAdminClient();

    const generateRandomPassword = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let password = "";
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const password = adminData.password || generateRandomPassword();

    console.log('Creating auth user with email:', adminData.email); // Debug log
    // Create the admin user account
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: adminData.email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: adminData.firstName,
        last_name: adminData.lastName,
        role: adminData.role,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json({
        success: false,
        error: `Failed to create admin account: ${authError.message}`,
      }, { status: 400 });
    }

    console.log('Auth user created successfully:', authData.user.id); // Debug log

    // Create profile using admin client (bypasses RLS)
    console.log('Creating profile...'); // Debug log
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        first_name: adminData.firstName,
        last_name: adminData.lastName,
        role: adminData.role,
        is_active: true,
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Clean up the auth user if profile creation failed
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({
        success: false,
        error: `Failed to create profile: ${profileError.message}`,
      }, { status: 500 });
    }

    console.log('Admin creation completed successfully'); // Debug log
    return NextResponse.json({
      success: true,
      admin: {
        id: authData.user.id,
        email: adminData.email,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: adminData.role,
      },
      credentials: {
        email: adminData.email,
        password,
      },
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


