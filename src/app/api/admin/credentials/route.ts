// src/app/api/admin/credentials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Get user profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, is_active, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.is_active) {
      return NextResponse.json({ error: 'Account inactive' }, { status: 403 });
    }

    // Check if user can view credentials
    const canViewCredentials = profile.role === 'super_admin' || profile.role === 'platform_admin';
    if (!canViewCredentials) {
      return NextResponse.json({ 
        error: `Role '${profile.role}' cannot view admin credentials` 
      }, { status: 403 });
    }

    // Get school ID from query params
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json({ 
        error: 'School ID is required' 
      }, { status: 400 });
    }

    // Get school admin profile
    const { data: schoolAdmin, error: adminError } = await adminClient
      .from('profiles')
      .select(`
        user_id,
        first_name,
        last_name,
        role,
        admin_type,
        school_id,
        phone,
        is_active,
        created_at
      `)
      .eq('school_id', schoolId)
      .eq('role', 'school_admin')
      .single();

    if (adminError || !schoolAdmin) {
      return NextResponse.json({ 
        error: 'School admin not found' 
      }, { status: 404 });
    }

    // Get the auth user details (we can't get the password, but we can get the email)
    const { data: authUser, error: authUserError } = await adminClient.auth.admin.getUserById(schoolAdmin.user_id);

    if (authUserError || !authUser.user) {
      return NextResponse.json({ 
        error: 'Auth user not found' 
      }, { status: 404 });
    }

    // Log the action for audit trail
    await adminClient.from("audit_logs").insert({
      user_id: user.id,
      action: "VIEW_ADMIN_CREDENTIALS",
      entity_type: "profile",
      entity_id: schoolAdmin.user_id,
      details: {
        school_admin_name: `${schoolAdmin.first_name} ${schoolAdmin.last_name}`,
        school_id: schoolId,
        viewed_by_role: profile.role,
        admin_name: `${profile.first_name} ${profile.last_name}`
      }
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: schoolAdmin.user_id,
        email: authUser.user.email,
        first_name: schoolAdmin.first_name,
        last_name: schoolAdmin.last_name,
        role: schoolAdmin.role,
        admin_type: schoolAdmin.admin_type,
        phone: schoolAdmin.phone,
        is_active: schoolAdmin.is_active,
        created_at: schoolAdmin.created_at
      },
      note: "Password cannot be retrieved for security reasons. Use the 'Reset Password' feature if needed."
    });

  } catch (error) {
    console.error('API error in /api/admin/credentials:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Reset password endpoint
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Get user profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, is_active, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.is_active) {
      return NextResponse.json({ error: 'Account inactive' }, { status: 403 });
    }

    // Check if user can reset passwords
    const canResetPasswords = profile.role === 'super_admin' || profile.role === 'platform_admin';
    if (!canResetPasswords) {
      return NextResponse.json({ 
        error: `Role '${profile.role}' cannot reset passwords` 
      }, { status: 403 });
    }

    // Parse request body
    const { adminId, newPassword } = await request.json();

    if (!adminId || !newPassword) {
      return NextResponse.json({ 
        error: 'Admin ID and new password are required' 
      }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }

    // Update the user's password
    const { data: updateResult, error: updateError } = await adminClient.auth.admin.updateUserById(adminId, {
      password: newPassword
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json({ 
        error: `Failed to update password: ${updateError.message}` 
      }, { status: 500 });
    }

    // Log the action for audit trail
    await adminClient.from("audit_logs").insert({
      user_id: user.id,
      action: "RESET_ADMIN_PASSWORD",
      entity_type: "profile",
      entity_id: adminId,
      details: {
        admin_email: updateResult.user?.email,
        reset_by_role: profile.role,
        admin_name: `${profile.first_name} ${profile.last_name}`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      admin: {
        id: updateResult.user?.id,
        email: updateResult.user?.email
      }
    });

  } catch (error) {
    console.error('API error in /api/admin/credentials POST:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
