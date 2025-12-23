import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin', 'platform_admin'],
      requireActive: true
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

    console.log('Permission check passed for user role:', profile.role);

    // Parse and validate request
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

    // Use the provided contact email if available, otherwise generate one
    let email = schoolData.contactEmail?.trim();
    
    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format provided" },
        { status: 400 }
      );
    }
    
    // Use provided email or generate one
    email = email || generateSchoolEmail(schoolData.name);
    const password = generatePassword();

    // Step 6: Check for existing email using admin client
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const emailExists = existingUsers.users.some((u: any) => u.email === email);
    
    if (emailExists) {
      return NextResponse.json(
        { success: false, error: "A school admin with this email already exists" },
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
          grade_levels: schoolData.gradeLevels || [],
          status: "approved",
          verification_status: "pending"
        } as any)
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

      console.log('School created:', (school as any)?.id);

      // Step 9: Create profile using admin client (bypasses RLS)
      const { error: profileInsertError } = await adminClient
        .from("profiles")
        .insert({
          user_id: authData.user.id,
          first_name: schoolData.contactFirstName,
          last_name: schoolData.contactLastName,
          role: "school_admin", // Make them admin of their school
          admin_type: null, // School admins are not platform-level admins
          school_id: (school as any).id,
          phone: schoolData.contactPhone || null,
          avatar_url: null,
          permissions: {},
          is_active: true
        } as any);

      if (profileInsertError) {
        console.error("Profile creation error:", profileInsertError);
        // Cleanup: delete both school and auth user
        await adminClient.from("schools").delete().eq("id", (school as any).id);
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
        entity_id: (school as any).id,
        details: {
          school_name: schoolData.name,
          created_by_role: profile.role,
          admin_name: `${profile.first_name} ${profile.last_name}`
        }
      } as any);

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