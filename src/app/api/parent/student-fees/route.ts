import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerAuthClient } from '@/lib/supabaseServerOnly';

export async function GET(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const authClient = createServerAuthClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Use admin client for data access
    const supabase = createAdminClient();

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
      .eq('parent_id', parent.id);

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
    const studentIds = linkedStudents.map(rel => rel.students.id);
    
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
          academic_years!inner(name, start_date, end_date)
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

    // Get fee template categories for each template
    const templateIds = feeAssignments?.map(assignment => assignment.template_id) || [];
    
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

    // Structure the response
    const studentsWithFees = linkedStudents.map(rel => {
      const student = rel.students;
      const studentAssignments = feeAssignments?.filter(assignment => assignment.student_id === student.id) || [];
      
      return {
        student: {
          id: student.id,
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          grade_level: student.grade_level,
          school_id: student.school_id,
          school_name: student.schools.name,
          parent_name: student.parent_name,
          parent_email: student.parent_email,
          parent_phone: student.parent_phone,
        },
        fee_assignments: studentAssignments.map(assignment => {
          const templateCategoriesForThisTemplate = templateCategories?.filter(
            tc => tc.template_id === assignment.template_id
          ) || [];

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
              id: assignment.fee_templates.id,
              name: assignment.fee_templates.name,
              grade_level: assignment.fee_templates.grade_level,
              program_type: assignment.fee_templates.program_type,
              total_amount: assignment.fee_templates.total_amount,
              status: assignment.fee_templates.status,
              academic_year: {
                id: assignment.fee_templates.academic_years.id,
                name: assignment.fee_templates.academic_years.name,
                start_date: assignment.fee_templates.academic_years.start_date,
                end_date: assignment.fee_templates.academic_years.end_date,
              },
              categories: templateCategoriesForThisTemplate.map(tc => ({
                id: tc.fee_categories.id,
                name: tc.fee_categories.name,
                description: tc.fee_categories.description,
                amount: tc.amount,
                is_mandatory: tc.fee_categories.is_mandatory,
                is_recurring: tc.fee_categories.is_recurring,
                category_type: tc.fee_categories.category_type,
              }))
            },
            payment_schedule: {
              id: assignment.payment_schedules.id,
              name: assignment.payment_schedules.name,
              schedule_type: assignment.payment_schedules.schedule_type,
              discount_percentage: assignment.payment_schedules.discount_percentage,
              installments: assignment.payment_schedules.payment_installments?.map(installment => ({
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
    });

    return NextResponse.json({ 
      students: studentsWithFees,
      count: studentsWithFees.length,
      summary: {
        total_students: studentsWithFees.length,
        total_assignments: feeAssignments?.length || 0,
        total_amount_due: feeAssignments?.reduce((sum, assignment) => 
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
