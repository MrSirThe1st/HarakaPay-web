import { NextRequest, NextResponse } from 'next/server';
import { createServerAuthClient, createAdminClient } from '@/lib/supabaseServerOnly';

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

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('student_id');
    const categoryId = searchParams.get('category_id');
    const academicYearId = searchParams.get('academic_year_id');

    if (!studentId || !categoryId || !academicYearId) {
      return NextResponse.json({ 
        error: 'Missing required parameters',
        details: 'student_id, category_id, and academic_year_id are required'
      }, { status: 400 });
    }

    // Use admin client for data access
    const adminClient = createAdminClient();

    // Get parent's linked students to verify access
    const { data: parent } = await adminClient
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

    // Verify the student is linked to this parent
    const { data: parentStudent } = await adminClient
      .from('parent_students')
      .select('student_id')
      .eq('parent_id', parent.id)
      .eq('student_id', studentId)
      .single();

    if (!parentStudent) {
      return NextResponse.json({ 
        error: 'Access denied',
        details: 'Student is not linked to this parent'
      }, { status: 403 });
    }

    // Fetch payment installments for the specific student, category, and academic year
    const { data: studentFeeAssignments, error: assignmentsError } = await adminClient
      .from('student_fee_assignments')
      .select(`
        id,
        student_id,
        paid_amount,
        status,
        academic_year_id,
        students!inner(
          id,
          student_id,
          first_name,
          last_name,
          grade_level,
          school_id,
          schools!inner(name)
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
            term_id,
            is_active
          ),
          fee_templates!inner(
            id,
            name,
            grade_level,
            program_type,
            status,
            fee_template_categories(
              amount,
              fee_categories!inner(
                id,
                name,
                description,
                is_mandatory,
                is_recurring,
                category_type
              )
            )
          )
        ),
        academic_years!inner(
          id,
          name,
          start_date,
          end_date,
          term_structure
        )
      `)
      .eq('student_id', studentId)
      .eq('academic_year_id', academicYearId)
      .eq('status', 'active');

    if (assignmentsError) {
      console.error('Error fetching student fee assignments:', assignmentsError);
      return NextResponse.json({ 
        error: 'Failed to fetch student fee assignments',
        details: assignmentsError.message
      }, { status: 500 });
    }

    if (!studentFeeAssignments || studentFeeAssignments.length === 0) {
      return NextResponse.json({ 
        installments: [],
        message: 'No fee assignments found for this student'
      });
    }

    // Filter assignments that contain the specific category
    const relevantAssignments = studentFeeAssignments.filter(assignment => {
      const feeTemplate = assignment.payment_schedules?.fee_templates;
      const categories = feeTemplate?.fee_template_categories || [];
      return categories.some(ftc => ftc.fee_categories?.id === categoryId);
    });

    if (relevantAssignments.length === 0) {
      return NextResponse.json({ 
        installments: [],
        message: 'No installments found for this category'
      });
    }

    // Process installments from all relevant assignments
    const allInstallments = [];
    const now = new Date();

    relevantAssignments.forEach(assignment => {
      const paymentSchedule = assignment.payment_schedules;
      const installments = paymentSchedule?.payment_installments || [];
      
      installments.forEach(installment => {
        // Determine if this is the current installment
        const dueDate = new Date(installment.due_date);
        const isCurrent = dueDate <= now && installment.is_active;
        
        allInstallments.push({
          id: installment.id,
          installment_number: installment.installment_number,
          name: installment.name,
          amount: installment.amount,
          percentage: installment.percentage,
          due_date: installment.due_date,
          term_id: installment.term_id,
          is_current: isCurrent,
          is_paid: false, // TODO: Implement payment tracking
          schedule_name: paymentSchedule?.name,
          schedule_type: paymentSchedule?.schedule_type,
        });
      });
    });

    // Sort installments by installment number
    allInstallments.sort((a, b) => a.installment_number - b.installment_number);

    // Get student and academic year info
    const student = studentFeeAssignments[0]?.students;
    const academicYear = studentFeeAssignments[0]?.academic_years;

    return NextResponse.json({ 
      installments: allInstallments,
      student: {
        id: student?.id,
        student_id: student?.student_id,
        first_name: student?.first_name,
        last_name: student?.last_name,
        grade_level: student?.grade_level,
        school_id: student?.school_id,
        school_name: student?.schools?.name,
      },
      academic_year: {
        id: academicYear?.id,
        name: academicYear?.name,
        start_date: academicYear?.start_date,
        end_date: academicYear?.end_date,
        term_structure: academicYear?.term_structure,
      },
      count: allInstallments.length
    });

  } catch (error) {
    console.error('Payment installments API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
