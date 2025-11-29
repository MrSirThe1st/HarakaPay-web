import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: staffId } = await params;
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
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

    // Only school admins can view staff details
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can view staff details' }, 
        { status: 403 }
      );
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
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
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

    // Only school admins can update staff
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can update staff' }, 
        { status: 403 }
      );
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

    if (staffError || !existingStaff) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' }, 
        { status: 404 }
      );
    }

    // Check if staff_id already exists (if provided and different from current)
    if (staff_id && staff_id !== existingStaff.staff_id) {
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
      is_active: is_active !== undefined ? is_active : existingStaff.is_active,
      permissions: permissions || existingStaff.permissions,
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
      .update(updateData)
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
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
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

    // Only school admins can delete staff
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can delete staff' }, 
        { status: 403 }
      );
    }

    // First, get the staff member to check permissions
    const { data: staff, error: staffError } = await adminClient
      .from('profiles')
      .select('id, school_id, first_name, last_name, user_id')
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

    // Delete the auth user first
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(staff.user_id);
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
      message: `Staff member ${staff.first_name} ${staff.last_name} deleted successfully`
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


