import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { generatePassword } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireActive: true
    });

    if (isAuthError(authResult)) {
      return authResult;
    }

    const { profile, adminClient } = authResult;

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
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin'],
      requireActive: true
    });

    if (isAuthError(authResult)) {
      return authResult;
    }

    const { profile, adminClient, user } = authResult;

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
      permissions = {},
      gender,
      work_email,
      home_address,
      phone,
      position,
      staff_id
    } = body;

    // Validate required fields
    if (!email || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, error: 'Email, first name, and last name are required' }, 
        { status: 400 }
      );
    }

    // Validate gender if provided
    if (gender && !['M', 'F'].includes(gender)) {
      return NextResponse.json(
        { success: false, error: 'Gender must be M or F' }, 
        { status: 400 }
      );
    }

    // Validate position if provided
    if (position && !['teacher', 'principal', 'nurse', 'security', 'cashier', 'prefect'].includes(position)) {
      return NextResponse.json(
        { success: false, error: 'Invalid position. Must be one of: teacher, principal, nurse, security, cashier, prefect' }, 
        { status: 400 }
      );
    }

    // Check if staff_id already exists (if provided)
    if (staff_id) {
      const { data: existingStaffId } = await adminClient
        .from('profiles')
        .select('id')
        .eq('staff_id', staff_id)
        .eq('role', 'school_staff')
        .single();
      
      if (existingStaffId) {
        return NextResponse.json(
          { success: false, error: 'Staff ID already exists' }, 
          { status: 409 }
        );
      }
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
        permissions: permissions,
        gender: gender || null,
        work_email: work_email?.trim() || null,
        home_address: home_address?.trim() || null,
        phone: phone?.trim() || null,
        position: position || null,
        staff_id: staff_id?.trim() || null
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
