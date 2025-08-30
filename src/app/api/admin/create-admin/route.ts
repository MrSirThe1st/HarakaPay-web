import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServerOnly";
import { checkUserPermission } from "@/lib/authUtils";
import { createServerAuthClient } from "@/lib/supabaseServerOnly";

export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract user ID from JWT (you'll need to implement this based on your auth setup)
    const currentUserId = await getUserIdFromAuthHeader(authHeader);
    
    // Check if current user can create admin accounts
    const { allowed, profile } = await checkUserPermission(currentUserId, 'create_admin_accounts');
    
    if (!allowed) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    const adminData = await request.json();
    
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

    // Create profile using admin client (bypasses RLS)
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        first_name: adminData.firstName,
        last_name: adminData.lastName,
        role: adminData.role,
        admin_type: adminData.admin_type,
        school_id: adminData.school_id || null,
        is_active: true,
        permissions: adminData.permissions || {}
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return NextResponse.json({
        success: false,
        error: `Failed to create profile: ${profileError.message}`,
      }, { status: 500 });
    }

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

// Helper function to extract user ID from auth header
async function getUserIdFromAuthHeader(authHeader: string): Promise<string> {
  // Remove 'Bearer ' prefix
  const token = authHeader.replace('Bearer ', '');
  
  // Use regular auth client to verify token
  const authClient = createServerAuthClient();
  const { data: { user }, error } = await authClient.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid token');
  }
  
  return user.id;
}
