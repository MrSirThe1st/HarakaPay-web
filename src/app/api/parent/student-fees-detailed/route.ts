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

    // Get detailed fee assignments with all related data using NEW fee structure system
    const { data: studentFeeAssignments, error: assignmentsError } = await adminClient
      .from('student_fee_assignments')
      .select(`
        id,
        student_id,
        paid_amount,
        status,
        academic_year_id,
        structure_id,
        payment_plan_id,
        total_due,
        students!inner(
          id,
          student_id,
          first_name,
          last_name,
          grade_level,
          school_id,
          schools!inner(name)
        ),
        fee_structures!inner(
          id,
          name,
          grade_level,
          applies_to,
          total_amount,
          is_active,
          academic_years!inner(
            id,
            name,
            start_date,
            end_date,
            term_structure
          ),
          fee_structure_items(
            id,
            amount,
            is_mandatory,
            is_recurring,
            payment_modes,
            fee_categories(
              id,
              name,
              description,
              is_mandatory,
              is_recurring,
              category_type
            )
          ),
          payment_plans(
            id,
            type,
            discount_percentage,
            currency,
            installments,
            is_active
          )
        ),
        payment_plans!inner(
          id,
          type,
          discount_percentage,
          currency,
          installments,
          is_active
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

    // Process and structure the data by student
    const studentFeesMap: { [key: string]: any } = {};

    studentFeeAssignments?.forEach(assignment => {
      const student = assignment.students;
      const feeStructure = assignment.fee_structures;
      const paymentPlan = assignment.payment_plans;
      const academicYear = feeStructure?.academic_years;

      if (!student || !feeStructure) return;

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
          fee_template: {
            id: feeStructure.id,
            name: feeStructure.name,
            grade_level: feeStructure.grade_level,
            applies_to: feeStructure.applies_to,
            total_amount: feeStructure.total_amount,
            status: feeStructure.is_active ? 'active' : 'inactive',
            academic_year: {
              id: academicYear?.id,
              name: academicYear?.name,
              start_date: academicYear?.start_date,
              end_date: academicYear?.end_date,
              term_structure: academicYear?.term_structure,
            }
          },
          fee_categories: [],
          payment_schedules: [],
          summary: {
            total_amount: feeStructure.total_amount,
            paid_amount: assignment.paid_amount || 0,
            outstanding_amount: (feeStructure.total_amount || 0) - (assignment.paid_amount || 0),
            total_installments: 0,
            paid_installments: 0,
            upcoming_payments: 0
          }
        };
      }

      // Process fee categories from fee structure items
      const feeItems = feeStructure?.fee_structure_items || [];
      feeItems.forEach(item => {
        const category = item.fee_categories;
        if (!category) return;

        // Check if category already exists for this student
        const existingCategory = studentFeesMap[student.id].fee_categories.find(
          (cat: any) => cat.id === category.id
        );

        if (!existingCategory) {
          // Add new category
          studentFeesMap[student.id].fee_categories.push({
            id: category.id,
            name: category.name,
            description: category.description,
            amount: item.amount,
            is_mandatory: item.is_mandatory,
            supports_recurring: item.is_recurring,
            supports_one_time: item.payment_modes?.includes('one_time') || false,
            category_type: category.category_type
          });
        }
      });

      // Process ALL payment plans from the fee structure (not just the assigned one)
      const allPaymentPlans = feeStructure?.payment_plans || [];
      allPaymentPlans.forEach(plan => {
        // Check if this payment plan is already added for this student
        const existingPlan = studentFeesMap[student.id].payment_schedules.find(
          (p: any) => p.id === plan.id
        );
        
        if (!existingPlan) {
          const installments = Array.isArray(plan.installments) ? plan.installments : [];
          
          const scheduleData = {
            id: plan.id,
            name: `${plan.type} Plan`,
            schedule_type: plan.type,
            discount_percentage: plan.discount_percentage,
            template_name: feeStructure.name,
            installments: installments.map((inst: any, index: number) => ({
              id: `${plan.id}_${index}`,
              installment_number: inst.installment_number || (index + 1),
              name: inst.label || `Installment ${index + 1}`,
              amount: inst.amount || 0,
              percentage: 0, // Not used in new system
              due_date: inst.due_date,
              term_id: null, // Not used in new system
              paid: false // TODO: Calculate from payment records
            }))
          };

          studentFeesMap[student.id].payment_schedules.push(scheduleData);

          // Update summary totals
          studentFeesMap[student.id].summary.total_installments += installments.length;
          studentFeesMap[student.id].summary.paid_installments += 0; // TODO: Calculate from payment records
          
          // Count upcoming payments (unpaid installments with future due dates)
          const now = new Date();
          studentFeesMap[student.id].summary.upcoming_payments += installments.filter((inst: any) => 
            new Date(inst.due_date) > now
          ).length;
        }
      });
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