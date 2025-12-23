import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { Database } from '@/types/supabase';
import { normalizeLevelValue } from '@/lib/csvParser';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type StudentImport = {
  student_id: string;
  first_name: string;
  last_name: string;
  gender?: string | null;
  grade_level?: string | null;
  level?: string | null;
  enrollment_date?: string;
  status?: "active" | "inactive" | "graduated";
  parent_name?: string | null;
  parent_phone?: string | null;
  parent_email?: string | null;
  home_address?: string | null;
  date_of_birth?: string | null;
  blood_type?: string | null;
  allergies?: string | null;
  guardian_relationship?: string | null;
  chronic_conditions?: string | null;
};

export async function POST(req: Request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireActive: true
    }, req);

    if (isAuthError(authResult)) {
      return authResult;
    }

    const { profile, adminClient } = authResult;

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
    if (['school_admin', 'school_staff'].includes(profile.role)) {
      if (!profile.school_id) {
        return NextResponse.json(
          { success: false, error: 'School staff must be associated with a school' }, 
          { status: 403 }
        );
      }
      targetSchoolId = profile.school_id;
    } else if (['super_admin', 'platform_admin', 'support_admin'].includes(profile.role) && !school_id) {
      return NextResponse.json(
        { success: false, error: 'Admins must specify a school_id' }, 
        { status: 400 }
      );
    }

    // Validate that the school exists
    const { data: school, error: schoolError } = await adminClient
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
    const { data: existingStudents, error: existingError } = await adminClient
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

    // Prepare students for database insertion (including parent info and new fields)
    const studentsForDb = students.map((student: StudentImport) => {
      // Convert comma-separated allergies to array
      let allergiesArray = null;
      if (student.allergies && student.allergies.trim()) {
        allergiesArray = student.allergies.split(',').map(item => item.trim()).filter(item => item.length > 0);
        if (allergiesArray.length === 0) allergiesArray = null;
      }

      // Convert comma-separated chronic_conditions to array
      let chronicConditionsArray = null;
      if (student.chronic_conditions && student.chronic_conditions.trim()) {
        chronicConditionsArray = student.chronic_conditions.split(',').map(item => item.trim()).filter(item => item.length > 0);
        if (chronicConditionsArray.length === 0) chronicConditionsArray = null;
      }

      // Normalize level value to match database constraint
      const normalizedLevel = normalizeLevelValue(student.level || undefined);

      return {
        school_id: targetSchoolId,
        student_id: student.student_id.trim(),
        first_name: student.first_name.trim(),
        last_name: student.last_name.trim(),
        gender: student.gender?.trim() || null,
        grade_level: student.grade_level?.trim() || null,
        level: normalizedLevel || null,
        enrollment_date: student.enrollment_date || new Date().toISOString().split('T')[0],
        status: student.status || 'active',
        parent_name: student.parent_name?.trim() || null,
        parent_phone: student.parent_phone?.trim() || null,
        parent_email: student.parent_email?.trim() || null,
        home_address: student.home_address?.trim() || null,
        date_of_birth: student.date_of_birth || null,
        blood_type: student.blood_type?.trim() || null,
        allergies: allergiesArray,
        guardian_relationship: student.guardian_relationship?.trim() || null,
        chronic_conditions: chronicConditionsArray
      };
    });

    // Insert students in batches to avoid hitting limits
    const batchSize = 100;
    let totalInserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < studentsForDb.length; i += batchSize) {
      const batch = studentsForDb.slice(i, i + batchSize);
      const { data: insertedStudents, error: insertError } = await adminClient
        .from('students')
        .insert(batch as any)
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
