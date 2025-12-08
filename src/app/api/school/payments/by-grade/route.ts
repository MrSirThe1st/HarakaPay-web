import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const gradeLevel = searchParams.get('grade_level'); // Optional filter by grade

    // Get all students for this school
    let studentsQuery = adminClient
      .from('students')
      .select('id, first_name, last_name, student_id, grade_level')
      .eq('school_id', profile.school_id);

    if (gradeLevel) {
      studentsQuery = studentsQuery.eq('grade_level', gradeLevel);
    }

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
          byGrade: {},
          students: []
        }
      });
    }

    const studentIds = students.map(s => s.id);

    // Get fee assignments for these students
    const { data: feeAssignments, error: feeAssignmentsError } = await adminClient
      .from('student_fee_assignments')
      .select(`
        id,
        student_id,
        total_due,
        paid_amount,
        status,
        students!inner(
          id,
          grade_level
        )
      `)
      .in('student_id', studentIds)
      .in('status', ['active', 'fully_paid']);

    if (feeAssignmentsError) {
      console.error('Error fetching fee assignments:', feeAssignmentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch fee assignments' }, 
        { status: 500 }
      );
    }

    // Get payment transactions for these fee assignments
    const feeAssignmentIds = feeAssignments?.map(fa => fa.id) || [];
    
    let transactionsQuery = adminClient
      .from('payment_transactions')
      .select(`
        *,
        payments!inner(
          id,
          amount,
          payment_method,
          status,
          payment_date,
          created_at
        ),
        student_fee_assignments!inner(
          student_id
        ),
        payment_plans(
          id,
          type,
          installments
        )
      `)
      .eq('transaction_status', 'completed');

    if (feeAssignmentIds.length > 0) {
      transactionsQuery = transactionsQuery.in('student_fee_assignment_id', feeAssignmentIds);
    } else {
      // No fee assignments, return empty
      return NextResponse.json({
        success: true,
        data: {
          byGrade: {},
          students: students.map(s => ({
            ...s,
            paymentStatus: 'no_fees_assigned',
            totalDue: 0,
            paidAmount: 0,
            remainingBalance: 0,
            paymentPlanType: null,
            paidInstallments: []
          }))
        }
      });
    }

    const { data: transactions, error: transactionsError } = await transactionsQuery;

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch transactions' }, 
        { status: 500 }
      );
    }

    // Organize data by student
    const studentPaymentMap = new Map();

    // Initialize all students
    students.forEach(student => {
      studentPaymentMap.set(student.id, {
        ...student,
        paymentStatus: 'not_paid',
        totalDue: 0,
        paidAmount: 0,
        remainingBalance: 0,
        paymentPlanType: null,
        paidInstallments: [],
        feeAssignments: []
      });
    });

    // Process fee assignments
    feeAssignments?.forEach(fa => {
      const studentData = studentPaymentMap.get(fa.student_id);
      if (studentData) {
        const totalDue = parseFloat(fa.total_due?.toString() || '0');
        const paidAmount = parseFloat(fa.paid_amount?.toString() || '0');
        const remainingBalance = totalDue - paidAmount;

        studentData.totalDue += totalDue;
        studentData.paidAmount += paidAmount;
        studentData.remainingBalance += remainingBalance;

        if (paidAmount > 0 && paidAmount < totalDue) {
          studentData.paymentStatus = 'partially_paid';
        } else if (paidAmount >= totalDue && totalDue > 0) {
          studentData.paymentStatus = 'fully_paid';
        }

        studentData.feeAssignments.push({
          id: fa.id,
          totalDue,
          paidAmount,
          remainingBalance,
          status: fa.status
        });
      }
    });

    // Process transactions to get payment details
    transactions?.forEach(transaction => {
      const studentId = transaction.student_fee_assignments?.student_id;
      const studentData = studentPaymentMap.get(studentId);
      
      if (studentData) {
        const paymentPlan = transaction.payment_plans;
        const installmentNumber = transaction.installment_number;
        const installmentLabel = transaction.installment_label;
        const amountPaid = parseFloat(transaction.amount_paid?.toString() || '0');

        // Determine payment plan type from first transaction
        if (!studentData.paymentPlanType && paymentPlan) {
          studentData.paymentPlanType = paymentPlan.type;
        }

        // Add paid installment info
        studentData.paidInstallments.push({
          installmentNumber,
          installmentLabel: installmentLabel || `Installment ${installmentNumber}`,
          amountPaid,
          paymentDate: transaction.payments?.payment_date || transaction.created_at,
          paymentMethod: transaction.payments?.payment_method,
          paymentPlanType: paymentPlan?.type
        });
      }
    });

    // Group by grade level
    interface StudentPaymentData {
      student_id: string;
      student_name: string;
      grade_level: string;
      total_paid: number;
      payment_count: number;
      [key: string]: unknown;
    }
    const byGrade: Record<string, StudentPaymentData[]> = {};
    studentPaymentMap.forEach((studentData) => {
      const grade = studentData.grade_level || 'Unknown';
      if (!byGrade[grade]) {
        byGrade[grade] = [];
      }
      byGrade[grade].push(studentData);
    });

    // Sort students within each grade
    Object.keys(byGrade).forEach(grade => {
      byGrade[grade].sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        byGrade,
        students: Array.from(studentPaymentMap.values())
      }
    });

  } catch (error) {
    console.error('Payments by grade API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

