// src/app/api/school/fees/structures/[id]/activate/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { Database } from '@/types/supabase';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
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
      .select('role, school_id, is_active, user_id')
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

    // Only school admins can activate fee structures
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can activate fee structures' }, 
        { status: 403 }
      );
    }

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: 'School not found' }, 
        { status: 404 }
      );
    }

    const { id: structureId } = await params;
    const body = await req.json();
    // Get all payment plans for this structure automatically
    const { payment_plan_ids = [] } = body;

    // Fetch the fee structure with academic year info and all payment plans
    const { data: feeStructure, error: structureError } = await adminClient
      .from('fee_structures')
      .select(`
        *,
        academic_years(
          id,
          name,
          start_date,
          end_date,
          is_active
        ),
        payment_plans(
          id,
          type,
          discount_percentage,
          currency,
          installments,
          is_active
        )
      `)
      .eq('id', structureId)
      .eq('school_id', profile.school_id)
      .single();

    if (structureError || !feeStructure) {
      console.error('Error fetching fee structure:', structureError);
      return NextResponse.json(
        { success: false, error: 'Fee structure not found' }, 
        { status: 404 }
      );
    }

    // Get students that match the fee structure criteria
    let studentsQuery = adminClient
      .from('students')
      .select('id, student_id, first_name, last_name, grade_level')
      .eq('school_id', profile.school_id)
      .eq('status', 'active');

    // Apply grade level filter if applies_to is 'grade'
    if (feeStructure.applies_to === 'grade') {
      studentsQuery = studentsQuery.eq('grade_level', feeStructure.grade_level);
    }
    // If applies_to is 'school', we get all students (no additional filter)

    const { data: students, error: studentsError } = await studentsQuery;

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch students' }, 
        { status: 500 }
      );
    }

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          activated_students: 0,
          academic_year_activated: false,
          message: 'No students found matching the criteria'
        }
      });
    }

    // Check for existing assignments to avoid duplicates
    const studentIds = students.map(student => student.id);
    const { data: existingAssignments, error: assignmentsError } = await adminClient
      .from('student_fee_assignments')
      .select('student_id')
      .in('student_id', studentIds)
      .eq('structure_id', structureId) // Using correct field name
      .eq('academic_year_id', feeStructure.academic_year_id)
      .eq('status', 'active');

    if (assignmentsError) {
      console.error('Error checking existing assignments:', assignmentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing assignments' }, 
        { status: 500 }
      );
    }

    const existingStudentIds = new Set(existingAssignments?.map(a => a.student_id) || []);
    const newStudentIds = studentIds.filter(id => !existingStudentIds.has(id));

    if (newStudentIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          activated_students: 0,
          academic_year_activated: false,
          message: 'All eligible students already have this fee structure activated'
        }
      });
    }

    // Get all payment plans for this structure (automatically include all)
    const structurePaymentPlans = feeStructure.payment_plans || [];
    if (structurePaymentPlans.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No payment plans found for this fee structure. Please create payment plans first.'
      }, { status: 400 });
    }

    // Create student fee assignments for new students
    // For now, we'll assign the first payment plan to all students
    // In the future, we could implement logic to distribute students across different payment plans
    const primaryPaymentPlan = structurePaymentPlans[0];
    
    const assignments = newStudentIds.map(studentId => ({
      student_id: studentId,
      structure_id: structureId, // Using correct field name
      payment_plan_id: primaryPaymentPlan.id, // Using correct field name
      academic_year_id: feeStructure.academic_year_id,
      total_due: feeStructure.total_amount, // Using correct field name
      paid_amount: 0,
      status: 'active' as const,
      assigned_by: profile.user_id
    }));

    const { data: newAssignments, error: createError } = await adminClient
      .from('student_fee_assignments')
      .insert(assignments)
      .select('id, student_id');

    if (createError) {
      console.error('Error creating student assignments:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to activate fee structure for students' }, 
        { status: 500 }
      );
    }

    // Activate the academic year if it's not already active
    let academicYearActivated = false;
    if (feeStructure.academic_years && !feeStructure.academic_years.is_active) {
      const { error: activateYearError } = await adminClient
        .from('academic_years')
        .update({ is_active: true })
        .eq('id', feeStructure.academic_year_id);

      if (activateYearError) {
        console.error('Error activating academic year:', activateYearError);
        // Don't fail the whole operation, just log the error
      } else {
        academicYearActivated = true;
      }
    }

    // Mark the fee structure as active
    const { error: activateStructureError } = await adminClient
      .from('fee_structures')
      .update({ is_active: true })
      .eq('id', structureId);

    if (activateStructureError) {
      console.error('Error activating fee structure:', activateStructureError);
      // Don't fail the whole operation, just log the error
    }

    return NextResponse.json({
      success: true,
      data: {
        activated_students: newAssignments?.length || 0,
        academic_year_activated: academicYearActivated,
        total_eligible_students: students.length,
        already_activated: existingStudentIds.size,
        payment_plans_used: structurePaymentPlans.length,
        primary_payment_plan: primaryPaymentPlan.type
      },
      message: `Successfully activated fee structure for ${newAssignments?.length || 0} students using ${structurePaymentPlans.length} payment plan(s)${academicYearActivated ? ' and activated the academic year' : ''}`
    });

  } catch (error) {
    console.error('Fee structure activation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
