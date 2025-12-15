import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: staffId } = await params;
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin'],
      requireSchool: true,
      requireActive: true
    }, _req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    // Get the staff member
    const { data: staff, error: staffError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', staffId)
      .eq('school_id', profile.school_id)
      .eq('role', 'school_staff')
      .single();

    if (staffError || !staff) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: staff
    });

  } catch (error) {
    console.error('Get staff error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: staffId } = await params;
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    const body = await req.json();
    const { 
      first_name, 
      last_name, 
      is_active,
      permissions,
      gender,
      work_email,
      home_address,
      phone,
      position,
      staff_id
    } = body;

    // Validate required fields
    if (!first_name || !last_name) {
      return NextResponse.json(
        { success: false, error: 'First name and last name are required' }, 
        { status: 400 }
      );
    }

    // Validate gender if provided
    if (gender !== undefined && gender !== null && !['M', 'F'].includes(gender)) {
      return NextResponse.json(
        { success: false, error: 'Gender must be M or F' }, 
        { status: 400 }
      );
    }

    // Validate position if provided
    if (position !== undefined && position !== null && !['teacher', 'principal', 'nurse', 'security', 'cashier', 'prefect'].includes(position)) {
      return NextResponse.json(
        { success: false, error: 'Invalid position. Must be one of: teacher, principal, nurse, security, cashier, prefect' }, 
        { status: 400 }
      );
    }

    // First, get the staff member to check permissions
    const { data: existingStaff, error: staffError } = await adminClient
      .from('profiles')
      .select('id, school_id, user_id, is_active, permissions, staff_id')
      .eq('id', staffId)
      .eq('school_id', profile.school_id)
      .eq('role', 'school_staff')
      .single();

    interface ExistingStaff {
      id: string;
      school_id: string;
      user_id: string;
      is_active: boolean;
      permissions: unknown;
      staff_id: string | null;
    }
    const typedExistingStaff = existingStaff as ExistingStaff | null;

    if (staffError || !typedExistingStaff) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' }, 
        { status: 404 }
      );
    }

    // Check if staff_id already exists (if provided and different from current)
    if (staff_id && staff_id !== typedExistingStaff.staff_id) {
      const { data: existingStaffId } = await adminClient
        .from('profiles')
        .select('id')
        .eq('staff_id', staff_id)
        .eq('role', 'school_staff')
        .neq('id', staffId)
        .single();
      
      if (existingStaffId) {
        return NextResponse.json(
          { success: false, error: 'Staff ID already exists' }, 
          { status: 409 }
        );
      }
    }

    // Update the staff member
    const updateData: Record<string, unknown> = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      is_active: is_active !== undefined ? is_active : typedExistingStaff.is_active,
      permissions: permissions || typedExistingStaff.permissions,
    };

    // Add new fields if provided
    if (gender !== undefined) updateData.gender = gender || null;
    if (work_email !== undefined) updateData.work_email = work_email?.trim() || null;
    if (home_address !== undefined) updateData.home_address = home_address?.trim() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (position !== undefined) updateData.position = position || null;
    if (staff_id !== undefined) updateData.staff_id = staff_id?.trim() || null;

    const { data: updatedStaff, error: updateError } = await adminClient
      .from('profiles')
      .update(updateData as never)
      .eq('id', staffId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating staff:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update staff member' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedStaff,
      message: 'Staff member updated successfully'
    });

  } catch (error) {
    console.error('Update staff error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: staffId } = await params;
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    // First, get the staff member to check permissions
    const { data: staff, error: staffError } = await adminClient
      .from('profiles')
      .select('id, school_id, first_name, last_name, user_id')
      .eq('id', staffId)
      .eq('school_id', profile.school_id)
      .eq('role', 'school_staff')
      .single();

    interface Staff {
      id: string;
      school_id: string;
      first_name: string;
      last_name: string;
      user_id: string;
    }
    const typedStaff = staff as Staff | null;

    if (staffError || !typedStaff) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Delete the auth user first
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(typedStaff.user_id);
    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete staff account' }, 
        { status: 500 }
      );
    }

    // Delete the profile (this should cascade due to foreign key)
    const { error: deleteProfileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', staffId);

    if (deleteProfileError) {
      console.error('Error deleting profile:', deleteProfileError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete staff profile' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Staff member ${typedStaff.first_name} ${typedStaff.last_name} deleted successfully`
    });

  } catch (error) {
    console.error('Delete staff error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}


