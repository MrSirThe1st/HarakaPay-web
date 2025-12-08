// src/app/api/admin/create-admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin'],
      requireActive: true
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

    // Parse and validate request
    const adminData = await request.json();
    console.log('Received admin data:', adminData);

    const requiredFields = ['email', 'firstName', 'lastName', 'role'];
    const missingFields = requiredFields.filter(field => !adminData[field]?.trim());
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['platform_admin', 'support_admin', 'super_admin'];
    if (!validRoles.includes(adminData.role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Step 5: Generate password
    const generatePassword = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*";
      return Array.from({ length: 12 }, () => 
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    };

    const password = generatePassword();

    // Step 6: Check for existing email
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const emailExists = existingUsers.users.some(u => u.email === adminData.email);
    
    if (emailExists) {
      return NextResponse.json(
        { error: "An admin with this email already exists" },
        { status: 400 }
      );
    }

    console.log('Creating admin user with email:', adminData.email);

    // Step 7: Create auth user
    const { data: authData, error: createAuthError } = await adminClient.auth.admin.createUser({
      email: adminData.email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: adminData.firstName,
        last_name: adminData.lastName,
        role: adminData.role,
      },
    });

    if (createAuthError) {
      console.error("Auth creation error:", createAuthError);
      return NextResponse.json(
        { error: `Failed to create user account: ${createAuthError.message}` },
        { status: 400 }
      );
    }

    console.log('Auth user created:', authData.user.id);

    try {
      // Step 8: Create profile
      const { error: profileInsertError } = await adminClient
        .from("profiles")
        .insert({
          user_id: authData.user.id,
          first_name: adminData.firstName,
          last_name: adminData.lastName,
          role: adminData.role,
          admin_type: adminData.role, // Set admin_type to match role
          school_id: null, // Platform admins don't belong to a specific school
          phone: adminData.phone || null,
          avatar_url: null,
          permissions: adminData.permissions || {},
          is_active: true
        });

      if (profileInsertError) {
        console.error("Profile creation error:", profileInsertError);
        // Cleanup: delete auth user
        await adminClient.auth.admin.deleteUser(authData.user.id);
        
        return NextResponse.json(
          { error: `Failed to create profile: ${profileInsertError.message}` },
          { status: 400 }
        );
      }

      console.log('Profile created successfully');

      // Step 9: Log the action for audit trail
      await adminClient.from("audit_logs").insert({
        user_id: user.id,
        action: "CREATE_PLATFORM_ADMIN",
        entity_type: "profile",
        entity_id: authData.user.id,
        details: {
          admin_email: adminData.email,
          admin_role: adminData.role,
          created_by_role: profile.role,
          creator_name: `${profile.first_name} ${profile.last_name}`
        }
      });

      console.log('Platform admin creation completed successfully');

      return NextResponse.json({
        success: true,
        admin: {
          id: authData.user.id,
          email: adminData.email,
          first_name: adminData.firstName,
          last_name: adminData.lastName,
          role: adminData.role,
          admin_type: adminData.role
        },
        credentials: { 
          email: adminData.email, 
          password 
        },
      });

    } catch (error) {
      console.error("Transaction error:", error);
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to complete admin creation" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Unexpected error in create-admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}