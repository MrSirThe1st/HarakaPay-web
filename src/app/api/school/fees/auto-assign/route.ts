import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function POST(req: NextRequest) {
  try {
    console.log('Auto-assign API called');
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check - user:', user?.id, 'error:', authError);
    
    if (authError || !user) {
      console.log('Authentication failed');
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

    // Only school admins can perform automatic fee assignments
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can perform automatic fee assignments' }, 
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

    // Validate template exists and belongs to school
    const { data: template, error: templateError } = await adminClient
      .from('fee_templates')
      .select('id, name, grade_level, program_type, total_amount, school_id')
      .eq('id', template_id)
      .eq('school_id', profile.school_id)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { success: false, error: 'Fee template not found' }, 
        { status: 404 }
      );
    }

    // Validate schedules exist and belong to school (through template)
    console.log('Looking for schedules:', schedule_ids);
    console.log('School ID:', profile.school_id);
    
    const { data: schedules, error: schedulesError } = await adminClient
      .from('payment_schedules')
      .select(`
        id, 
        name, 
        schedule_type, 
        template_id,
        fee_templates!inner(school_id)
      `)
      .in('id', schedule_ids)
      .eq('fee_templates.school_id', profile.school_id);

    console.log('Schedule query result:', { schedules, error: schedulesError });

    if (schedulesError || !schedules || schedules.length === 0) {
      console.log('No valid payment schedules found');
      return NextResponse.json(
        { success: false, error: 'No valid payment schedules found' }, 
        { status: 404 }
      );
    }

    // Check if all requested schedules were found
    if (schedules.length !== schedule_ids.length) {
      const foundIds = schedules.map(s => s.id);
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

    console.log('All grade levels in database:', allStudents?.map(s => s.grade_level));

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
    
    console.log('Student query result:', { 
      matchingStudents, 
      error: studentsError,
      count: matchingStudents?.length || 0 
    });

    if (studentsError) {
      console.error('Error fetching matching students:', studentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch students' }, 
        { status: 500 }
      );
    }

    if (!matchingStudents || matchingStudents.length === 0) {
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

    // Check existing assignments for these students with this specific template
    const studentIds = matchingStudents.map(student => student.id);
    const { data: existingAssignments, error: assignmentsError } = await adminClient
      .from('student_fee_assignments')
      .select('student_id, status, template_id')
      .in('student_id', studentIds)
      .eq('template_id', template_id)
      .eq('academic_year_id', academic_year_id)
      .eq('status', 'active');

    if (assignmentsError) {
      console.error('Error checking existing assignments:', assignmentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing assignments' }, 
        { status: 500 }
      );
    }

    const existingStudentIds = new Set(existingAssignments?.map(a => a.student_id) || []);
    const studentsToAssign = matchingStudents.filter(student => !existingStudentIds.has(student.id));
    
    console.log(`Found ${existingAssignments?.length || 0} existing assignments for this template`);
    console.log(`Students to assign: ${studentsToAssign.length}, Students already assigned: ${existingStudentIds.size}`);

    if (dry_run) {
      // Return what would be assigned without actually assigning
      const assignments = [];
      studentsToAssign.forEach(student => {
        schedules.forEach(schedule => {
          assignments.push({
            student_id: student.id,
            student_name: `${student.first_name} ${student.last_name}`,
            student_id_display: student.student_id,
            grade_level: student.grade_level,
            template_name: template.name,
            schedule_id: schedule.id,
            schedule_name: schedule.name,
            schedule_type: schedule.schedule_type,
            template_total_amount: template.total_amount, // For preview display only
            status: 'would_be_assigned'
          });
        });
      });

      return NextResponse.json({
        success: true,
        data: {
          assignments,
          summary: {
            total_students: matchingStudents.length,
            new_assignments: studentsToAssign.length,
            total_assignments: assignments.length,
            existing_assignments: existingStudentIds.size,
            skipped: 0,
            schedules_count: schedules.length
          }
        },
        message: `Dry run: Would assign fees to ${studentsToAssign.length} students across ${schedules.length} payment schedules`
      });
    }

    // Actually create the assignments
    const assignmentsToCreate = [];
    studentsToAssign.forEach(student => {
      schedules.forEach(schedule => {
        assignmentsToCreate.push({
          student_id: student.id,
          template_id: template_id,
          schedule_id: schedule.id,
          academic_year_id: academic_year_id,
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
            total_students: matchingStudents.length,
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
        .insert(batch)
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
          template_name: template.name,
          schedules: schedules.map(schedule => ({
            schedule_id: schedule.id,
            schedule_name: schedule.name,
            schedule_type: schedule.schedule_type
          })),
          // total_amount removed - calculated from installments
          status: 'assigned'
        })),
        summary: {
          total_students: matchingStudents.length,
          new_assignments: studentsToAssign.length,
          total_assignments: totalCreated,
          existing_assignments: existingStudentIds.size,
          skipped: 0,
          schedules_count: schedules.length
        }
      },
      message: `Successfully assigned fees to ${studentsToAssign.length} students across ${schedules.length} payment schedules (${totalCreated} total assignments)`
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
