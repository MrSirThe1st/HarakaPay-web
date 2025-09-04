import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
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

    const studentId = params.id;

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
