// src/app/api/admin/create-school/route.ts
// Made consistent with your existing /api/schools route pattern

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAdminClient } from "@/lib/supabaseServerOnly";

export async function POST(request: NextRequest) {
  try {
    // Step 1: Use the same auth pattern as /api/schools
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check authentication using cookies (same as other routes)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error in create-school:', authError);
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log('Authenticated user:', user.id);

    // Step 2: Check permissions using admin client (bypasses RLS)
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, is_active, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { success: false, error: "User profile not found" },
        { status: 403 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { success: false, error: "Account inactive" },
        { status: 403 }
      );
    }

    // Step 3: Check if user can create schools (application-level check)
    const canCreateSchools = profile.role === 'super_admin' || profile.role === 'platform_admin';
    if (!canCreateSchools) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient permissions. Role '${profile.role}' cannot create schools.` 
        },
        { status: 403 }
      );
    }

    console.log('Permission check passed for user role:', profile.role);

    // Step 4: Parse and validate request
    const schoolData = await request.json();
    console.log('Received school data:', schoolData);

    const requiredFields = ['name', 'contactFirstName', 'contactLastName'];
    const missingFields = requiredFields.filter(field => !schoolData[field]?.trim());
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Step 5: Generate credentials
    const generateSchoolEmail = (schoolName: string) => {
      const cleanName = schoolName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, '') // Remove spaces
        .substring(0, 20); // Limit length
      
      return `${cleanName}.school@harakapay.com`;
    };

    const generatePassword = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*";
      return Array.from({ length: 12 }, () => 
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    };

    const email = generateSchoolEmail(schoolData.name);
    const password = generatePassword();

    // Step 6: Check for existing email using admin client
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const emailExists = existingUsers.users.some(u => u.email === email);
    
    if (emailExists) {
      return NextResponse.json(
        { success: false, error: "A school with this name already exists" },
        { status: 400 }
      );
    }

    console.log('Creating auth user with email:', email);

    // Step 7: Create auth user using admin client
    const { data: authData, error: createAuthError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: schoolData.contactFirstName,
        last_name: schoolData.contactLastName,
        role: "school_admin",
      },
    });

    if (createAuthError) {
      console.error("Auth creation error:", createAuthError);
      return NextResponse.json(
        { success: false, error: `Failed to create user account: ${createAuthError.message}` },
        { status: 400 }
      );
    }

    console.log('Auth user created:', authData.user.id);

    try {
      // Step 8: Create school record using admin client (bypasses RLS)
      const { data: school, error: schoolError } = await adminClient
        .from("schools")
        .insert({
          name: schoolData.name,
          address: schoolData.address || null,
          contact_email: email,
          contact_phone: schoolData.contactPhone || null,
          registration_number: schoolData.registrationNumber || null,
          status: "approved",
          verification_status: "pending"
        })
        .select()
        .single();

      if (schoolError) {
        console.error("School creation error:", schoolError);
        await adminClient.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json(
          { success: false, error: `Failed to create school: ${schoolError.message}` },
          { status: 400 }
        );
      }

      console.log('School created:', school.id);

      // Step 9: Create profile using admin client (bypasses RLS)
      const { error: profileInsertError } = await adminClient
        .from("profiles")
        .insert({
          user_id: authData.user.id,
          first_name: schoolData.contactFirstName,
          last_name: schoolData.contactLastName,
          role: "school_admin", // Make them admin of their school
          admin_type: null,
          school_id: school.id,
          phone: schoolData.contactPhone || null,
          avatar_url: null,
          permissions: {},
          is_active: true
        });

      if (profileInsertError) {
        console.error("Profile creation error:", profileInsertError);
        // Cleanup: delete both school and auth user
        await adminClient.from("schools").delete().eq("id", school.id);
        await adminClient.auth.admin.deleteUser(authData.user.id);
        
        return NextResponse.json(
          { success: false, error: `Failed to create profile: ${profileInsertError.message}` },
          { status: 400 }
        );
      }

      console.log('Profile created successfully');

      // Step 10: Log the action for audit trail
      await adminClient.from("audit_logs").insert({
        user_id: user.id,
        action: "CREATE_SCHOOL",
        entity_type: "school",
        entity_id: school.id,
        details: {
          school_name: schoolData.name,
          created_by_role: profile.role,
          admin_name: `${profile.first_name} ${profile.last_name}`
        }
      });

      console.log('School creation completed successfully');

      return NextResponse.json({
        success: true,
        school,
        credentials: { email, password },
      });

    } catch (error) {
      console.error("Transaction error:", error);
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { success: false, error: "Failed to complete school creation" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Unexpected error in create-school:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}