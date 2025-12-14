import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function GET(req: Request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    // Get URL parameters for filtering
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    const studentId = searchParams.get('student_id');
    const academicYearId = searchParams.get('academic_year_id');
    const status = searchParams.get('status');

    // Build query for student fee assignments
    let query = adminClient
      .from('student_fee_assignments')
      .select('*', { count: 'exact' });

    // Apply filters
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('id', { ascending: false });

    const { data: studentFeeAssignments, error: studentFeeAssignmentsError, count } = await query;

    if (studentFeeAssignmentsError) {
      console.error('Error fetching student fee assignments:', studentFeeAssignmentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch student fee assignments' }, 
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalAssignments = count || 0;
    const activeAssignments = studentFeeAssignments?.filter(a => a.status === 'active').length || 0;
    const completedAssignments = studentFeeAssignments?.filter(a => a.status === 'completed').length || 0;

    return NextResponse.json({
      success: true,
      data: {
        studentFeeAssignments: studentFeeAssignments || [],
        pagination: {
          page,
          limit,
          total: totalAssignments,
          pages: Math.ceil(totalAssignments / limit)
        },
        stats: {
          total: totalAssignments,
          active: activeAssignments,
          completed: completedAssignments
        }
      }
    });

  } catch (error) {
    console.error('Student fee assignments API error:', error);
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
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    const body = await req.json();
    const { 
      student_id,
      template_id,
      schedule_id,
      academic_year_id,
      total_amount,
      status = 'active'
    } = body;

    // Validate required fields
    if (!student_id || !template_id || !schedule_id || !academic_year_id || !total_amount) {
      return NextResponse.json(
        { success: false, error: 'Student ID, template ID, schedule ID, academic year ID, and total amount are required' }, 
        { status: 400 }
      );
    }

    // Validate student exists and belongs to school
    const { data: student } = await adminClient
      .from('students')
      .select('id')
      .eq('id', student_id)
      .eq('school_id', profile.school_id)
      .single();

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' }, 
        { status: 404 }
      );
    }

    // Validate template exists and belongs to school
    const { data: template } = await adminClient
      .from('fee_templates')
      .select('id')
      .eq('id', template_id)
      .eq('school_id', profile.school_id)
      .single();

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Fee template not found' }, 
        { status: 404 }
      );
    }

    // Validate schedule exists and belongs to school
    const { data: schedule } = await adminClient
      .from('payment_schedules')
      .select('id')
      .eq('id', schedule_id)
      .eq('school_id', profile.school_id)
      .single();

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Payment schedule not found' }, 
        { status: 404 }
      );
    }

    // Validate academic year exists and belongs to school
    const { data: academicYear } = await adminClient
      .from('academic_years')
      .select('id')
      .eq('id', academic_year_id)
      .eq('school_id', profile.school_id)
      .single();

    if (!academicYear) {
      return NextResponse.json(
        { success: false, error: 'Academic year not found' }, 
        { status: 404 }
      );
    }

    // Check if assignment already exists for this student and academic year
    const { data: existingAssignment } = await adminClient
      .from('student_fee_assignments')
      .select('id')
      .eq('student_id', student_id)
      .eq('academic_year_id', academic_year_id)
      .eq('status', 'active')
      .single();

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Student already has an active fee assignment for this academic year' }, 
        { status: 409 }
      );
    }

    // Create student fee assignment
    const { data: newAssignment, error: createError } = await adminClient
      .from('student_fee_assignments')
      .insert({
        student_id,
        template_id,
        schedule_id,
        academic_year_id,
        total_amount,
        paid_amount: 0,
        status
      } as any)
      .select('*')
      .single();

    if (createError) {
      console.error('Student fee assignment creation error:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create student fee assignment' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        studentFeeAssignment: newAssignment
      },
      message: 'Student fee assignment created successfully'
    });

  } catch (error) {
    console.error('Create student fee assignment error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
