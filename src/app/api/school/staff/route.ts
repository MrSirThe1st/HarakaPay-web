import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { generatePassword } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get user profile to check role and school
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' }, 
        { status: 404 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account inactive' }, 
        { status: 403 }
      );
    }

    // Only school admins can view staff
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can view staff' }, 
        { status: 403 }
      );
    }

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: 'School not found' }, 
        { status: 404 }
      );
    }

    // Get URL parameters for search and filtering
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query for school staff
    let query = adminClient
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('school_id', profile.school_id)
      .eq('role', 'school_staff');

    // Apply search filter
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data: staff, error: staffError, count } = await query;

    if (staffError) {
      console.error('Error fetching staff:', staffError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch staff' }, 
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalStaff = count || 0;
    const activeStaff = staff?.filter(s => s.is_active).length || 0;
    const inactiveStaff = staff?.filter(s => !s.is_active).length || 0;

    return NextResponse.json({
      success: true,
      data: {
        staff: staff || [],
        pagination: {
          page,
          limit,
          total: totalStaff,
          pages: Math.ceil(totalStaff / limit)
        },
        stats: {
          total: totalStaff,
          active: activeStaff,
          inactive: inactiveStaff
        }
      }
    });

  } catch (error) {
    console.error('Staff API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get user profile to check role and school
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' }, 
        { status: 404 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account inactive' }, 
        { status: 403 }
      );
    }

    // Only school admins can create staff
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can create staff' }, 
        { status: 403 }
      );
    }

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: 'School not found' }, 
        { status: 404 }
      );
    }

    const body = await req.json();
    const { 
      email, 
      first_name, 
      last_name, 
      permissions = {}
    } = body;

    // Validate required fields
    if (!email || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, error: 'Email, first name, and last name are required' }, 
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const emailExists = existingUsers.users.some(u => u.email === email);
    
    if (emailExists) {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists' }, 
        { status: 409 }
      );
    }

    // Generate password
    const password = generatePassword();

    // Create auth user
    const { data: authData, error: createAuthError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        role: 'school_staff',
      },
    });

    if (createAuthError) {
      console.error('Auth creation error:', createAuthError);
      return NextResponse.json(
        { success: false, error: `Failed to create user account: ${createAuthError.message}` }, 
        { status: 400 }
      );
    }

    // Create profile
    const { data: newStaff, error: createProfileError } = await adminClient
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        first_name,
        last_name,
        role: 'school_staff',
        school_id: profile.school_id,
        is_active: true,
        permissions: permissions
      })
      .select('*')
      .single();

    if (createProfileError) {
      console.error('Profile creation error:', createProfileError);
      // Clean up auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { success: false, error: 'Failed to create staff profile' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        staff: newStaff,
        credentials: {
          email,
          password
        }
      },
      message: 'Staff member created successfully'
    });

  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
