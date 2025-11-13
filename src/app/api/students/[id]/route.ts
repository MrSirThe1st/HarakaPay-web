import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const supabase = createRouteHandlerClient<Database>({ cookies: async () => await cookies() });
    
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

    // First, get the student to check permissions
    const { data: student, error: studentError } = await adminClient
      .from('students')
      .select('id, school_id, first_name, last_name')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' }, 
        { status: 404 }
      );
    }

    // Check if user has permission to delete this student
    if (['school_admin', 'school_staff'].includes(profile.role)) {
      if (!profile.school_id || profile.school_id !== student.school_id) {
        return NextResponse.json(
          { success: false, error: 'You can only delete students from your own school' }, 
          { status: 403 }
        );
      }
    }

    // Delete the student
    const { error: deleteError } = await adminClient
      .from('students')
      .delete()
      .eq('id', studentId);

    if (deleteError) {
      console.error('Error deleting student:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete student' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Student ${student.first_name} ${student.last_name} deleted successfully`
    });

  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const supabase = createRouteHandlerClient<Database>({ cookies: async () => await cookies() });
    
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

    // Get the student
    const { data: student, error: studentError } = await adminClient
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' }, 
        { status: 404 }
      );
    }

    // Check if user has permission to view this student
    if (['school_admin', 'school_staff'].includes(profile.role)) {
      if (!profile.school_id || profile.school_id !== student.school_id) {
        return NextResponse.json(
          { success: false, error: 'You can only view students from your own school' }, 
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: student
    });

  } catch (error) {
    console.error('Get student error:', error);
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
    const { id: studentId } = await params;
    const supabase = createRouteHandlerClient<Database>({ cookies: async () => await cookies() });
    
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
    const body = await req.json();
    const { 
      student_id, 
      first_name, 
      last_name, 
      grade_level, 
      enrollment_date, 
      status,
      parent_name,
      parent_phone,
      parent_email
    } = body;

    // Validate required fields
    if (!student_id || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, error: 'Student ID, first name, and last name are required' }, 
        { status: 400 }
      );
    }

    // First, get the student to check permissions
    const { data: existingStudent, error: studentError } = await adminClient
      .from('students')
      .select('id, school_id, first_name, last_name, enrollment_date, status')
      .eq('id', studentId)
      .single();

    if (studentError || !existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' }, 
        { status: 404 }
      );
    }

    // Check if user has permission to update this student
    if (['school_admin', 'school_staff'].includes(profile.role)) {
      if (!profile.school_id || profile.school_id !== existingStudent.school_id) {
        return NextResponse.json(
          { success: false, error: 'You can only update students from your own school' }, 
          { status: 403 }
        );
      }
    }

    // Check if student ID already exists in this school (excluding current student)
    const { data: duplicateStudent, error: checkError } = await adminClient
      .from('students')
      .select('id')
      .eq('school_id', existingStudent.school_id)
      .eq('student_id', student_id.trim())
      .neq('id', studentId)
      .single();

    if (duplicateStudent) {
      return NextResponse.json(
        { success: false, error: 'Student ID already exists in this school' }, 
        { status: 409 }
      );
    }

    // Update the student
    const updateData = {
      student_id: student_id.trim(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      grade_level: grade_level?.trim() || null,
      enrollment_date: enrollment_date || existingStudent.enrollment_date,
      status: status || existingStudent.status,
      parent_name: parent_name?.trim() || null,
      parent_phone: parent_phone?.trim() || null,
      parent_email: parent_email?.trim() || null,
    };

    const { data: updatedStudent, error: updateError } = await adminClient
      .from('students')
      .update(updateData)
      .eq('id', studentId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating student:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update student' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedStudent,
      message: 'Student updated successfully'
    });

  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
