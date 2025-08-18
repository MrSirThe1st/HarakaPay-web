import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

type StudentImport = {
  student_id: string;
  first_name: string;
  last_name: string;
  grade_level?: string | null;
  enrollment_date?: string;
  status?: "active" | "inactive" | "graduated";
  parent_name?: string | null;
  parent_phone?: string | null;
  parent_email?: string | null;
};

export async function POST(req: Request) {
  try {
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' }, 
        { status: 404 }
      );
    }

    const { students, school_id } = await req.json();

    // Validate request data
    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No students provided' }, 
        { status: 400 }
      );
    }

    // Determine which school to use
    let targetSchoolId = school_id;
    // If user is school staff, they can only import to their own school
    if (profile.role === 'school_staff') {
      if (!profile.school_id) {
        return NextResponse.json(
          { success: false, error: 'School staff must be associated with a school' }, 
          { status: 403 }
        );
      }
      targetSchoolId = profile.school_id;
    } else if (profile.role === 'admin' && !school_id) {
      return NextResponse.json(
        { success: false, error: 'Admins must specify a school_id' }, 
        { status: 400 }
      );
    }

    // Validate that the school exists
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id')
      .eq('id', targetSchoolId)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { success: false, error: 'School not found' }, 
        { status: 404 }
      );
    }

    // Check for duplicate student IDs in the import
    const studentIds = students.map((s: StudentImport) => s.student_id);
    const duplicateIds = studentIds.filter((id, index) => studentIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      return NextResponse.json(
        { success: false, error: `Duplicate student IDs in import: ${duplicateIds.join(', ')}` }, 
        { status: 400 }
      );
    }

    // Check for existing student IDs in the database
    const { data: existingStudents, error: existingError } = await supabase
      .from('students')
      .select('student_id')
      .eq('school_id', targetSchoolId)
      .in('student_id', studentIds);

    if (existingError) {
      console.error('Error checking existing students:', existingError);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing students' }, 
        { status: 500 }
      );
    }

    if (existingStudents && existingStudents.length > 0) {
      const existingIds = existingStudents.map(s => s.student_id);
      return NextResponse.json(
        { success: false, error: `Student IDs already exist: ${existingIds.join(', ')}` }, 
        { status: 409 }
      );
    }

    // Prepare students for database insertion
    const studentsForDb = students.map((student: StudentImport) => ({
      school_id: targetSchoolId,
      student_id: student.student_id.trim(),
      first_name: student.first_name.trim(),
      last_name: student.last_name.trim(),
      grade_level: student.grade_level?.trim() || null,
      enrollment_date: student.enrollment_date || new Date().toISOString().split('T')[0],
      status: student.status || 'active',
      parent_name: student.parent_name?.trim() || null,
      parent_phone: student.parent_phone?.trim() || null,
      parent_email: student.parent_email?.trim() || null,
    }));

    // Insert students in batches to avoid hitting limits
    const batchSize = 100;
    let totalInserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < studentsForDb.length; i += batchSize) {
      const batch = studentsForDb.slice(i, i + batchSize);
      const { data: insertedStudents, error: insertError } = await supabase
        .from('students')
        .insert(batch)
        .select('student_id');
      if (insertError) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError);
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`);
      } else {
        totalInserted += insertedStudents?.length || 0;
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Partial import failed. ${totalInserted} students imported successfully. Errors: ${errors.join('; ')}`,
        count: totalInserted
      }, { status: 207 });
    }

    return NextResponse.json({
      success: true,
      count: totalInserted,
      message: `Successfully imported ${totalInserted} students`
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
