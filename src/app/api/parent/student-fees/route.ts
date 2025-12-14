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
    interface LinkedStudent {
      id?: string;
      parent_id?: string;
      student_id?: string;
      students?: {
        id?: string;
        student_id?: string;
        first_name?: string;
        last_name?: string;
        grade_level?: string;
        school_id?: string;
        parent_name?: string;
        parent_email?: string;
        parent_phone?: string;
        schools?: { name?: string } | { name?: string }[];
      } | {
        id?: string;
        student_id?: string;
        first_name?: string;
        last_name?: string;
        grade_level?: string;
        school_id?: string;
        parent_name?: string;
        parent_email?: string;
        parent_phone?: string;
        schools?: { name?: string } | { name?: string }[];
      }[];
      [key: string]: unknown;
    }
    const studentIds = linkedStudents.map((rel: LinkedStudent) => {
      const student = Array.isArray(rel.students) ? rel.students[0] : rel.students;
      return student?.id;
    }).filter((id): id is string => id !== undefined);
    
    const { data: feeAssignments, error: assignmentsError } = await supabase
      .from('student_fee_assignments')
      .select(`
        id,
        student_id,
        template_id,
        schedule_id,
        academic_year_id,
        total_amount,
        paid_amount,
        status,
        created_at,
        updated_at,
        fee_templates!inner(
          id,
          name,
          grade_level,
          program_type,
          total_amount,
          status,
          academic_years!inner(id, name, start_date, end_date)
        ),
        payment_schedules!inner(
          id,
          name,
          schedule_type,
          discount_percentage,
          payment_installments(
            id,
            installment_number,
            name,
            amount,
            percentage,
            due_date,
            term_id
          )
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
      template_id: string;
      schedule_id?: string;
      academic_year_id?: string;
      total_amount: number;
      paid_amount: number;
      status?: string;
      created_at?: string;
      updated_at?: string;
      fee_templates?: unknown;
      payment_schedules?: unknown;
      [key: string]: unknown;
    }

    const typedFeeAssignments = feeAssignments as FeeAssignment[] | null;

    // Get fee template categories for each template
    const templateIds = typedFeeAssignments?.map(assignment => assignment.template_id) || [];
    
    const { data: templateCategories, error: categoriesError } = await supabase
      .from('fee_template_categories')
      .select(`
        template_id,
        amount,
        fee_categories!inner(
          id,
          name,
          description,
          is_mandatory,
          is_recurring,
          category_type
        )
      `)
      .in('template_id', templateIds);

    if (categoriesError) {
      console.error('Error fetching template categories:', categoriesError);
      // Continue without categories - not critical
    }

    interface TemplateCategory {
      template_id: string;
      [key: string]: unknown;
    }

    const typedTemplateCategories = templateCategories as TemplateCategory[] | null;

    // Structure the response
    const studentsWithFees = linkedStudents.map((rel: LinkedStudent) => {
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
          const templateCategoriesForThisTemplate = typedTemplateCategories?.filter(
            tc => tc.template_id === assignment.template_id
          ) || [];

          // Handle fee_templates and academic_years as array or single object (Supabase type inference issue)
          const feeTemplate = Array.isArray(assignment.fee_templates) ? assignment.fee_templates[0] : assignment.fee_templates;
          const academicYear = feeTemplate?.academic_years
            ? (Array.isArray(feeTemplate.academic_years) ? feeTemplate.academic_years[0] : feeTemplate.academic_years)
            : undefined;
          const paymentSchedule = Array.isArray(assignment.payment_schedules) ? assignment.payment_schedules[0] : assignment.payment_schedules;

          return {
            id: assignment.id,
            template_id: assignment.template_id,
            schedule_id: assignment.schedule_id,
            academic_year_id: assignment.academic_year_id,
            total_amount: assignment.total_amount,
            paid_amount: assignment.paid_amount,
            remaining_amount: assignment.total_amount - assignment.paid_amount,
            status: assignment.status,
            created_at: assignment.created_at,
            updated_at: assignment.updated_at,
            fee_template: {
              id: feeTemplate?.id,
              name: feeTemplate?.name,
              grade_level: feeTemplate?.grade_level,
              program_type: feeTemplate?.program_type,
              total_amount: feeTemplate?.total_amount,
              status: feeTemplate?.status,
              academic_year: {
                id: academicYear?.id,
                name: academicYear?.name,
                start_date: academicYear?.start_date,
                end_date: academicYear?.end_date,
              },
              categories: templateCategoriesForThisTemplate.map(tc => {
                const feeCategory = Array.isArray(tc.fee_categories) ? tc.fee_categories[0] : tc.fee_categories;
                return {
                  id: feeCategory?.id,
                  name: feeCategory?.name,
                  description: feeCategory?.description,
                  amount: tc.amount,
                  is_mandatory: feeCategory?.is_mandatory,
                  is_recurring: feeCategory?.is_recurring,
                  category_type: feeCategory?.category_type,
                };
              })
            },
            payment_schedule: {
              id: paymentSchedule?.id,
              name: paymentSchedule?.name,
              schedule_type: paymentSchedule?.schedule_type,
              discount_percentage: paymentSchedule?.discount_percentage,
              installments: paymentSchedule?.payment_installments?.map((installment: {
                id: string;
                installment_number: number;
                name: string;
                amount: number;
                percentage: number;
                due_date: string;
                term_id: string | null;
              }) => ({
                id: installment.id,
                installment_number: installment.installment_number,
                name: installment.name,
                amount: installment.amount,
                percentage: installment.percentage,
                due_date: installment.due_date,
                term_id: installment.term_id,
              })) || []
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
        total_amount_due: typedFeeAssignments?.reduce((sum, assignment) => 
          sum + (assignment.total_amount - assignment.paid_amount), 0) || 0,
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
