import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    console.log('Auto-assign API called');
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
    console.log('Request body:', body);
    
    const { 
      academic_year_id,
      grade_level,
      program_type,
      template_id,
      schedule_ids, // Changed to array
      dry_run = false // If true, only show what would be assigned without actually assigning
    } = body;

    // Validate required fields
    if (!academic_year_id || !template_id || !schedule_ids || !Array.isArray(schedule_ids) || schedule_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Academic year ID, template ID, and at least one schedule ID are required' }, 
        { status: 400 }
      );
    }

    // Validate structure exists and belongs to school
    const { data: template, error: templateError } = await adminClient
      .from('fee_structures')
      .select('id, name, grade_level, applies_to, total_amount, school_id')
      .eq('id', template_id)
      .eq('school_id', profile.school_id)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { success: false, error: 'Fee structure not found' },
        { status: 404 }
      );
    }

    interface Template {
      id: string;
      name: string;
      grade_level: string;
      applies_to: string;
      total_amount: number;
      school_id: string;
    }

    const typedTemplate = template as Template;

    // Validate payment plans exist and belong to school
    console.log('Looking for payment plans:', schedule_ids);
    console.log('School ID:', profile.school_id);

    const { data: schedules, error: schedulesError } = await adminClient
      .from('payment_plans')
      .select(`
        id,
        type,
        fee_category_id,
        school_id
      `)
      .in('id', schedule_ids)
      .eq('school_id', profile.school_id);

    console.log('Payment plan query result:', { schedules, error: schedulesError });

    if (schedulesError || !schedules || schedules.length === 0) {
      console.log('No valid payment plans found');
      return NextResponse.json(
        { success: false, error: 'No valid payment plans found' },
        { status: 404 }
      );
    }

    interface Schedule {
      id: string;
      type: string | null;
      fee_category_id: string | null;
      school_id: string;
    }

    const typedSchedules = schedules as Schedule[];

    // Check if all requested schedules were found
    if (typedSchedules.length !== schedule_ids.length) {
      const foundIds = typedSchedules.map(s => s.id);
      const missingIds = schedule_ids.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        { success: false, error: `Some payment schedules not found: ${missingIds.join(', ')}` },
        { status: 404 }
      );
    }

    // Validate academic year exists and belongs to school
    const { data: academicYear, error: academicYearError } = await adminClient
      .from('academic_years')
      .select('id, name, school_id')
      .eq('id', academic_year_id)
      .eq('school_id', profile.school_id)
      .single();

    if (academicYearError || !academicYear) {
      return NextResponse.json(
        { success: false, error: 'Academic year not found' }, 
        { status: 404 }
      );
    }

    // First, let's see what grade levels exist in the database
    const { data: allStudents, error: allStudentsError } = await adminClient
      .from('students')
      .select('grade_level')
      .eq('school_id', profile.school_id)
      .eq('status', 'active');

    const typedAllStudents = allStudents as { grade_level: string }[] | null;
    console.log('All grade levels in database:', typedAllStudents?.map(s => s.grade_level));

    // Find students that match the criteria
    console.log('Student search criteria:', {
      school_id: profile.school_id,
      grade_level: grade_level,
      status: 'active'
    });

    let studentsQuery = adminClient
      .from('students')
      .select('id, student_id, first_name, last_name, grade_level')
      .eq('school_id', profile.school_id)
      .eq('status', 'active');

    // Apply filters if provided - use case-insensitive matching
    if (grade_level) {
      // Normalize the input to lowercase for case-insensitive matching
      const normalizedGradeLevel = grade_level.toLowerCase();
      
      // Use case-insensitive search with ilike
      studentsQuery = studentsQuery.ilike('grade_level', normalizedGradeLevel);
      
      console.log(`Searching for grade level (case-insensitive): "${normalizedGradeLevel}"`);
    }
    // Note: program_type filter is not applicable since students don't have program_type
    // The program_type is determined by the fee template, not the student

    const { data: matchingStudents, error: studentsError } = await studentsQuery;

    interface Student {
      id: string;
      student_id: string;
      first_name: string;
      last_name: string;
      grade_level: string;
    }

    const typedMatchingStudents = matchingStudents as Student[] | null;

    console.log('Student query result:', {
      matchingStudents: typedMatchingStudents,
      error: studentsError,
      count: typedMatchingStudents?.length || 0
    });

    if (studentsError) {
      console.error('Error fetching matching students:', studentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    if (!typedMatchingStudents || typedMatchingStudents.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          assignments: [],
          summary: {
            total_students: 0,
            new_assignments: 0,
            existing_assignments: 0,
            skipped: 0
          }
        },
        message: 'No students found matching the criteria'
      });
    }

    // Check existing assignments for these students with this specific structure
    const studentIds = typedMatchingStudents.map(student => student.id);
    const { data: existingAssignments, error: assignmentsError } = await adminClient
      .from('student_fee_assignments')
      .select('student_id, status, structure_id')
      .in('student_id', studentIds)
      .eq('structure_id', template_id)
      .eq('academic_year_id', academic_year_id)
      .eq('status', 'active');

    if (assignmentsError) {
      console.error('Error checking existing assignments:', assignmentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing assignments' },
        { status: 500 }
      );
    }

    const typedExistingAssignments = existingAssignments as { student_id: string }[] | null;
    const existingStudentIds = new Set(typedExistingAssignments?.map(a => a.student_id) || []);
    const studentsToAssign = typedMatchingStudents.filter(student => !existingStudentIds.has(student.id));

    console.log(`Found ${typedExistingAssignments?.length || 0} existing assignments for this template`);
    console.log(`Students to assign: ${studentsToAssign.length}, Students already assigned: ${existingStudentIds.size}`);

    if (dry_run) {
      // Return what would be assigned without actually assigning
      interface AssignmentPreview {
        student_id: string;
        student_name: string;
        student_id_display: string;
        grade_level: string;
        structure_name: string;
        payment_plan_id: string;
        payment_plan_type: string | null;
        structure_total_amount: number;
        status: string;
      }
      const assignments: AssignmentPreview[] = [];
      studentsToAssign.forEach(student => {
        typedSchedules.forEach(schedule => {
          assignments.push({
            student_id: student.id,
            student_name: `${student.first_name} ${student.last_name}`,
            student_id_display: student.student_id,
            grade_level: student.grade_level,
            structure_name: typedTemplate.name,
            payment_plan_id: schedule.id,
            payment_plan_type: schedule.type,
            structure_total_amount: typedTemplate.total_amount, // For preview display only
            status: 'would_be_assigned'
          });
        });
      });

      return NextResponse.json({
        success: true,
        data: {
          assignments,
          summary: {
            total_students: typedMatchingStudents.length,
            new_assignments: studentsToAssign.length,
            total_assignments: assignments.length,
            existing_assignments: existingStudentIds.size,
            skipped: 0,
            schedules_count: typedSchedules.length
          }
        },
        message: `Dry run: Would assign fees to ${studentsToAssign.length} students across ${typedSchedules.length} payment schedules`
      });
    }

    // Actually create the assignments
    interface AssignmentToCreate {
      student_id: string;
      structure_id: string;
      payment_plan_id: string;
      academic_year_id: string;
      total_due: number;
      paid_amount: number;
      status: string;
    }
    const assignmentsToCreate: AssignmentToCreate[] = [];
    studentsToAssign.forEach(student => {
      typedSchedules.forEach(schedule => {
        assignmentsToCreate.push({
          student_id: student.id,
          structure_id: template_id,
          payment_plan_id: schedule.id,
          academic_year_id: academic_year_id,
          total_due: typedTemplate.total_amount,
          paid_amount: 0,
          status: 'active'
        });
      });
    });

    if (assignmentsToCreate.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          assignments: [],
          summary: {
            total_students: typedMatchingStudents.length,
            new_assignments: 0,
            existing_assignments: existingStudentIds.size,
            skipped: 0
          }
        },
        message: 'All matching students already have fee assignments for this academic year'
      });
    }

    // Insert assignments in batches
    const batchSize = 50;
    let totalCreated = 0;
    const errors: string[] = [];

    for (let i = 0; i < assignmentsToCreate.length; i += batchSize) {
      const batch = assignmentsToCreate.slice(i, i + batchSize);
      const { data: createdAssignments, error: insertError } = await adminClient
        .from('student_fee_assignments')
        .insert(batch as any)
        .select('id, student_id');

      if (insertError) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError);
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`);
      } else {
        totalCreated += createdAssignments?.length || 0;
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Partial assignment failed. ${totalCreated} assignments created successfully. Errors: ${errors.join('; ')}`,
        count: totalCreated
      }, { status: 207 });
    }

    return NextResponse.json({
      success: true,
      data: {
        assignments: studentsToAssign.map(student => ({
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          student_id_display: student.student_id,
          grade_level: student.grade_level,
          structure_name: typedTemplate.name,
          payment_plans: typedSchedules.map(schedule => ({
            payment_plan_id: schedule.id,
            payment_plan_type: schedule.type
          })),
          // total_amount removed - calculated from installments
          status: 'assigned'
        })),
        summary: {
          total_students: typedMatchingStudents.length,
          new_assignments: studentsToAssign.length,
          total_assignments: totalCreated,
          existing_assignments: existingStudentIds.size,
          skipped: 0,
          payment_plans_count: typedSchedules.length
        }
      },
      message: `Successfully assigned fees to ${studentsToAssign.length} students across ${typedSchedules.length} payment plans (${totalCreated} total assignments)`
    });

  } catch (error) {
    console.error('Automatic fee assignment error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
