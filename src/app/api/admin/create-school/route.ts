import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAdminClient } from "@/lib/supabaseServerOnly";

export async function POST(request: NextRequest) {
  try {
    console.log('Create school API called'); // Debug log
    
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

    const schoolData = await request.json();
    console.log('School data received:', schoolData); // Debug log
    
    const adminSupabase = createAdminClient();

    // Generate random credentials
    const generateRandomPassword = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let password = "";
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const email = `${schoolData.name
      .toLowerCase()
      .replace(/\s+/g, ".")}@${schoolData.name
      .toLowerCase()
      .replace(/\s+/g, "")}.school`;
    const password = generateRandomPassword();

    // Create the school user account in Supabase
    console.log('Creating auth user with email:', email); // Debug log
    const { data: authData, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: schoolData.contactFirstName,
          last_name: schoolData.contactLastName,
          role: "school_staff",
        },
      });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create user account: ${authError.message}`,
        },
        { status: 400 }
      );
    }

    console.log('Auth user created successfully:', authData.user.id); // Debug log

    // Create the school record
    console.log('Creating school record...'); // Debug log
    const { data: school, error: schoolError } = await adminSupabase
      .from("schools")
      .insert({
        name: schoolData.name,
        address: schoolData.address,
        contact_email: email,
        contact_phone: schoolData.contactPhone,
        registration_number: schoolData.registrationNumber,
        status: "approved",
      })
      .select()
      .single();

    if (schoolError) {
      console.error("School creation error:", schoolError);
      // Clean up the auth user if school creation failed
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create school record: ${schoolError.message}`,
        },
        { status: 400 }
      );
    }

    console.log('School record created successfully:', school.id); // Debug log

    // Update the user profile with school_id
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .update({
        school_id: school.id,
        first_name: schoolData.contactFirstName,
        last_name: schoolData.contactLastName,
      })
      .eq("user_id", authData.user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update profile: ${profileError.message}`,
        },
        { status: 400 }
      );
    }

    console.log('School creation completed successfully'); // Debug log
    return NextResponse.json({
      success: true,
      school,
      credentials: {
        email,
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
