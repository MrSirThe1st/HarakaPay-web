import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function GET(req: Request) {
  try {
    // Authenticate and get user profile
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff', 'super_admin', 'platform_admin', 'support_admin'],
      requireSchool: false, // Platform admins might not have a school
      requireActive: true
    });

    // Check if authentication failed
    if (isAuthError(authResult)) {
      return authResult; // Return error response
    }

    const { profile, adminClient } = authResult;

    // Get URL parameters for search and filtering
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const grade = searchParams.get('grade') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Determine which school to fetch students for
    let targetSchoolId = profile.school_id;
    
    // If user is platform admin, they can specify a school_id
    if (['super_admin', 'platform_admin', 'support_admin'].includes(profile.role)) {
      const schoolId = searchParams.get('school_id');
      if (schoolId) {
        targetSchoolId = schoolId;
      }
    }

    if (!targetSchoolId) {
      return NextResponse.json(
        { success: false, error: 'School not specified' }, 
        { status: 400 }
      );
    }

    // Build query
    let query = adminClient
      .from('students')
      .select('*', { count: 'exact' })
      .eq('school_id', targetSchoolId);

    // Apply search filter
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,student_id.ilike.%${search}%`);
    }

    // Apply grade filter
    if (grade && grade !== 'all') {
      // Convert grade to lowercase to match database format
      const normalizedGrade = grade.toLowerCase();
      query = query.eq('grade_level', normalizedGrade);
    }

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data: students, error: studentsError, count } = await query;

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch students' }, 
        { status: 500 }
      );
    }

    // Get statistics
    const { data: stats, error: statsError } = await adminClient
      .from('students')
      .select('status, grade_level, created_at')
      .eq('school_id', targetSchoolId);

    if (statsError) {
      console.error('Error fetching stats:', statsError);
    }

    // Calculate statistics
    const totalStudents = count || 0;
    const activeStudents = stats?.filter(s => s.status === 'active').length || 0;
    const inactiveStudents = stats?.filter(s => s.status === 'inactive').length || 0;
    const graduatedStudents = stats?.filter(s => s.status === 'graduated').length || 0;
    
    // New students this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const newThisMonth = stats?.filter(s => 
      new Date(s.created_at) >= currentMonth
    ).length || 0;

    // Graduating students (assuming grade 12)
    const graduatingStudents = stats?.filter(s => 
      s.grade_level === 'Grade 12' || s.grade_level === 'grade 12'
    ).length || 0;

    return NextResponse.json({
      success: true,
      data: {
        students: students || [],
        pagination: {
          page,
          limit,
          total: totalStudents,
          pages: Math.ceil(totalStudents / limit)
        },
        stats: {
          total: totalStudents,
          active: activeStudents,
          inactive: inactiveStudents,
          graduated: graduatedStudents,
          newThisMonth,
          graduating: graduatingStudents
        }
      }
    });

  } catch (error) {
    console.error('Students API error:', error);
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
    // Authenticate and get user profile
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true, // Must have a school to create students
      requireActive: true
    });

    // Check if authentication failed
    if (isAuthError(authResult)) {
      return authResult;
    }

    const { profile, adminClient } = authResult;

    const body = await req.json();
    const { 
      student_id, 
      first_name, 
      last_name, 
      grade_level, 
      enrollment_date, 
      status = 'active',
      parent_name,
      parent_phone,
      parent_email,
      school_id 
    } = body;

    // Validate required fields
    if (!student_id || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, error: 'Student ID, first name, and last name are required' }, 
        { status: 400 }
      );
    }

    // Determine which school to use
    let targetSchoolId = school_id;
    // If user is school staff, they can only add to their own school
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

    // Check if student ID already exists in this school
    const { data: existingStudent, error: checkError } = await adminClient
      .from('students')
      .select('id')
      .eq('school_id', targetSchoolId)
      .eq('student_id', student_id.trim())
      .single();

    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student ID already exists in this school' }, 
        { status: 409 }
      );
    }

    // Create the student
    const studentData = {
      school_id: targetSchoolId,
      student_id: student_id.trim(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      grade_level: grade_level?.trim() || null,
      enrollment_date: enrollment_date || new Date().toISOString().split('T')[0],
      status: status || 'active',
      parent_name: parent_name?.trim() || null,
      parent_phone: parent_phone?.trim() || null,
      parent_email: parent_email?.trim() || null,
    };

    const { data: newStudent, error: insertError } = await adminClient
      .from('students')
      .insert(studentData)
      .select('*')
      .single();

    if (insertError) {
      console.error('Error creating student:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create student' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newStudent,
      message: 'Student created successfully'
    });

  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
