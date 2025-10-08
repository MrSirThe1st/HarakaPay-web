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
    const adminClient = createAdminClient();

    // First, find the parent ID using the user_id
    const { data: parent, error: parentError } = await adminClient
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parent) {
      return NextResponse.json({ 
        error: 'Parent record not found',
        details: 'No parent record exists for this user'
      }, { status: 404 });
    }

    // Get linked students
    const { data: linkedStudentsData, error: linkedStudentsError } = await adminClient
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
          schools!inner(name)
        )
      `)
      .eq('parent_id', parent.id);

    if (linkedStudentsError) {
      console.error('Error fetching linked students:', linkedStudentsError);
      return NextResponse.json({ 
        error: 'Failed to fetch linked students',
        details: linkedStudentsError.message
      }, { status: 500 });
    }

    if (!linkedStudentsData || linkedStudentsData.length === 0) {
      return NextResponse.json({ student_fees: [] });
    }

    const studentIds = linkedStudentsData.map(ls => ls.student_id);

    // Get detailed fee assignments with all related data
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
            total_amount,
            status,
            fee_template_categories(
              amount,
              fee_categories!inner(
                id,
                name,
                description,
                is_mandatory,
                is_recurring,
                supports_one_time,
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
      .in('student_id', studentIds)
      .eq('status', 'active');

    if (assignmentsError) {
      console.error('Error fetching student fee assignments:', assignmentsError);
      return NextResponse.json({ 
        error: 'Failed to fetch student fee assignments',
        details: assignmentsError.message
      }, { status: 500 });
    }

    // Process and structure the data by student and category
    const studentFeesMap: { [key: string]: any } = {};

    studentFeeAssignments?.forEach(assignment => {
      const student = assignment.students;
      const paymentSchedule = assignment.payment_schedules;
      const feeTemplate = paymentSchedule.fee_templates;
      const academicYear = assignment.academic_years;

      if (!student) return;

      // Initialize student if not exists
      if (!studentFeesMap[student.id]) {
        studentFeesMap[student.id] = {
          student: {
            id: student.id,
            student_id: student.student_id,
            first_name: student.first_name,
            last_name: student.last_name,
            grade_level: student.grade_level,
            school_id: student.school_id,
            school_name: student.schools?.name || 'N/A',
          },
          academic_year: {
            id: academicYear?.id,
            name: academicYear?.name,
            start_date: academicYear?.start_date,
            end_date: academicYear?.end_date,
            term_structure: academicYear?.term_structure,
          },
          fee_categories: [],
          payment_schedules: [],
          summary: {
            total_amount: 0,
            paid_amount: 0,
            outstanding_amount: 0,
            total_installments: 0,
            paid_installments: 0,
            upcoming_payments: 0
          }
        };
      }

      // Process fee categories
      const categories = feeTemplate?.fee_template_categories || [];
      categories.forEach(ftc => {
        const category = ftc.fee_categories;
        if (!category) return;

        // Check if category already exists for this student
        const existingCategory = studentFeesMap[student.id].fee_categories.find(
          (cat: any) => cat.id === category.id
        );

        if (existingCategory) {
          // Don't add amounts - each category should show its individual amount
          // The category already exists, so we skip it to avoid duplication
          return;
        } else {
          // Add new category with its individual amount
          studentFeesMap[student.id].fee_categories.push({
            id: category.id,
            name: category.name,
            description: category.description,
            amount: ftc.amount,
            is_mandatory: category.is_mandatory,
            supports_recurring: category.is_recurring,
            supports_one_time: category.supports_one_time,
            category_type: category.category_type
          });
        }
      });

      // Process payment schedule and installments
      const installments = paymentSchedule?.payment_installments || [];
      
      // For now, we'll assume installments are not paid since we don't have payment tracking yet
      // In a real implementation, you would join with student_fee_payments table
      const scheduleData = {
        id: paymentSchedule?.id,
        name: paymentSchedule?.name,
        schedule_type: paymentSchedule?.schedule_type,
        discount_percentage: paymentSchedule?.discount_percentage,
        template_name: feeTemplate?.name,
        installments: installments.map(pi => ({
          id: pi.id,
          installment_number: pi.installment_number,
          name: pi.name,
          amount: pi.amount,
          percentage: pi.percentage,
          due_date: pi.due_date,
          term_id: pi.term_id,
          paid: false // TODO: Calculate from student_fee_payments table
        }))
      };

      studentFeesMap[student.id].payment_schedules.push(scheduleData);

      // Update summary totals from categories (not installments)
      const categoryTotal = categories.reduce((sum, ftc) => sum + ftc.amount, 0);
      const paidAmount = 0; // TODO: Calculate from student_fee_payments table
      const outstandingAmount = categoryTotal - paidAmount;

      // Don't add to total_amount - we don't want to show totals
      studentFeesMap[student.id].summary.paid_amount += paidAmount;
      studentFeesMap[student.id].summary.outstanding_amount += outstandingAmount;
      studentFeesMap[student.id].summary.total_installments += installments.length;
      studentFeesMap[student.id].summary.paid_installments += 0; // TODO: Calculate from student_fee_payments table
      
      // Count upcoming payments (unpaid installments with future due dates)
      const now = new Date();
      studentFeesMap[student.id].summary.upcoming_payments += installments.filter(inst => 
        new Date(inst.due_date) > now
      ).length;
    });

    // Convert to array and sort by student name
    const studentFees = Object.values(studentFeesMap).sort((a: any, b: any) => 
      `${a.student.first_name} ${a.student.last_name}`.localeCompare(`${b.student.first_name} ${b.student.last_name}`)
    );

    return NextResponse.json({ 
      student_fees: studentFees,
      count: studentFees.length,
      summary: {
        total_students: studentFees.length,
        total_paid: studentFees.reduce((sum: number, sf: any) => sum + sf.summary.paid_amount, 0),
        total_outstanding: studentFees.reduce((sum: number, sf: any) => sum + sf.summary.outstanding_amount, 0)
      }
    });

  } catch (error) {
    console.error('Error in student-fees-detailed API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
