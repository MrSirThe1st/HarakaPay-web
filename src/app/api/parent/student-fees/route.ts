import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function GET(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const supabase = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }


    // Get parent's linked students
    const { data: parent } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!parent) {
      return NextResponse.json({
        error: 'Parent record not found',
        details: 'No parent record exists for this user'
      }, { status: 404 });
    }

    const typedParent = parent as { id: string };

    // Get parent's linked students with their fee assignments
    const { data: linkedStudents, error: studentsError } = await supabase
      .from('parent_students')
      .select(`
        student_id,
        students!inner(
          id,
          student_id,
          first_name,
          last_name,
          grade_level,
          school_id,
          parent_name,
          parent_email,
          parent_phone,
          schools!inner(name)
        )
      `)
      .eq('parent_id', typedParent.id);

    if (studentsError) {
      console.error('Error fetching linked students:', studentsError);
      return NextResponse.json({ 
        error: 'Failed to fetch linked students',
        details: studentsError.message
      }, { status: 500 });
    }

    if (!linkedStudents || linkedStudents.length === 0) {
      return NextResponse.json({ 
        students: [],
        message: 'No linked students found'
      });
    }

    // Get fee assignments for each student
    // Handle students as array or single object (Supabase type inference issue)
    const studentIds = linkedStudents.map((rel) => {
      const student = Array.isArray(rel.students) ? rel.students[0] : rel.students;
      return student?.id;
    }).filter((id): id is string => id !== undefined);
    
    const { data: feeAssignments, error: assignmentsError } = await supabase
      .from('student_fee_assignments')
      .select(`
        id,
        student_id,
        academic_year_id,
        structure_id,
        payment_plan_id,
        total_due,
        paid_amount,
        status,
        assigned_at,
        fee_structures(
          id,
          name,
          grade_level,
          total_amount,
          status
        ),
        payment_plans(
          id,
          type,
          fee_category_id,
          fee_categories(
            id,
            name,
            description
          )
        ),
        academic_years(
          id,
          name,
          start_date,
          end_date
        )
      `)
      .in('student_id', studentIds)
      .in('status', ['active', 'fully_paid']); // Include active and fully paid (exclude cancelled)

    if (assignmentsError) {
      console.error('Error fetching fee assignments:', assignmentsError);
      return NextResponse.json({
        error: 'Failed to fetch fee assignments',
        details: assignmentsError.message
      }, { status: 500 });
    }

    interface FeeAssignment {
      id: string;
      student_id: string;
      academic_year_id?: string;
      structure_id?: string | null;
      payment_plan_id?: string | null;
      total_due: number | null;
      paid_amount: number | null;
      status?: string;
      assigned_at?: string;
      fee_structures?: unknown;
      payment_plans?: unknown;
      academic_years?: unknown;
      [key: string]: unknown;
    }

    const typedFeeAssignments = feeAssignments as FeeAssignment[] | null;

    // Structure the response
    const studentsWithFees = linkedStudents.map((rel) => {
      // Handle students as array or single object (Supabase type inference issue)
      const studentData = rel.students;
      const student = Array.isArray(studentData) ? studentData[0] : studentData;
      if (!student?.id) {
        return null;
      }
      const studentAssignments = typedFeeAssignments?.filter(assignment => assignment.student_id === student.id) || [];

      // Handle schools as array or single object
      const schools = student?.schools
        ? (Array.isArray(student.schools) ? student.schools[0] : student.schools)
        : undefined;

      return {
        student: {
          id: student?.id,
          student_id: student?.student_id,
          first_name: student?.first_name,
          last_name: student?.last_name,
          grade_level: student?.grade_level,
          school_id: student?.school_id,
          school_name: schools?.name || '',
          parent_name: student?.parent_name,
          parent_email: student?.parent_email,
          parent_phone: student?.parent_phone,
        },
        fee_assignments: studentAssignments.map(assignment => {
          // Handle fee_structures as array or single object (Supabase type inference issue)
          const feeStructure = Array.isArray(assignment.fee_structures) ? assignment.fee_structures[0] : assignment.fee_structures;

          // Handle payment_plans as array or single object
          const paymentPlan = Array.isArray(assignment.payment_plans) ? assignment.payment_plans[0] : assignment.payment_plans;

          // Handle fee_categories as array or single object
          const feeCategory = paymentPlan?.fee_categories
            ? (Array.isArray(paymentPlan.fee_categories) ? paymentPlan.fee_categories[0] : paymentPlan.fee_categories)
            : undefined;

          // Handle academic_years as array or single object
          const academicYear = Array.isArray(assignment.academic_years) ? assignment.academic_years[0] : assignment.academic_years;

          const totalDue = assignment.total_due || 0;
          const paidAmount = assignment.paid_amount || 0;

          return {
            id: assignment.id,
            structure_id: assignment.structure_id,
            payment_plan_id: assignment.payment_plan_id,
            academic_year_id: assignment.academic_year_id,
            total_due: totalDue,
            paid_amount: paidAmount,
            remaining_amount: totalDue - paidAmount,
            status: assignment.status,
            assigned_at: assignment.assigned_at,
            fee_structure: {
              id: feeStructure?.id,
              name: feeStructure?.name,
              grade_level: feeStructure?.grade_level,
              total_amount: feeStructure?.total_amount,
              status: feeStructure?.status,
            },
            payment_plan: {
              id: paymentPlan?.id,
              type: paymentPlan?.type,
              fee_category: {
                id: feeCategory?.id,
                name: feeCategory?.name,
                description: feeCategory?.description,
              }
            },
            academic_year: {
              id: academicYear?.id,
              name: academicYear?.name,
              start_date: academicYear?.start_date,
              end_date: academicYear?.end_date,
            }
          };
        })
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    return NextResponse.json({
      students: studentsWithFees,
      count: studentsWithFees.length,
      summary: {
        total_students: studentsWithFees.length,
        total_assignments: typedFeeAssignments?.length || 0,
        total_amount_due: typedFeeAssignments?.reduce((sum, assignment) => {
          const totalDue = assignment.total_due || 0;
          const paidAmount = assignment.paid_amount || 0;
          return sum + (totalDue - paidAmount);
        }, 0) || 0,
      }
    });

  } catch (error) {
    console.error('Error in student-fees API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
