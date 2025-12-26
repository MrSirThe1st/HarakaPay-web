import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const gradeLevel = searchParams.get('grade_level'); // Optional filter by grade

    // Get fee assignments with student data using join filter instead of IN clause
    let feeAssignmentsQuery = adminClient
      .from('student_fee_assignments')
      .select(`
        id,
        student_id,
        total_due,
        paid_amount,
        status,
        students!inner(
          id,
          first_name,
          last_name,
          student_id,
          grade_level,
          school_id
        )
      `)
      .eq('students.school_id', profile.school_id)
      .in('status', ['active', 'fully_paid']);

    if (gradeLevel) {
      feeAssignmentsQuery = feeAssignmentsQuery.eq('students.grade_level', gradeLevel);
    }

    const { data: feeAssignments, error: feeAssignmentsError } = await feeAssignmentsQuery;

    interface Student {
      id: string;
      first_name: string;
      last_name: string;
      student_id: string;
      grade_level: string;
      school_id: string;
    }

    interface FeeAssignment {
      id: string;
      student_id: string;
      total_due: number;
      paid_amount: number;
      status: string;
      students: Student;
    }
    const typedFeeAssignments = feeAssignments as FeeAssignment[] | null;

    if (feeAssignmentsError) {
      console.error('Error fetching fee assignments:', {
        message: feeAssignmentsError.message,
        details: feeAssignmentsError.details,
        hint: feeAssignmentsError.hint,
        code: feeAssignmentsError.code
      });
      return NextResponse.json(
        { success: false, error: 'Failed to fetch fee assignments' },
        { status: 500 }
      );
    }

    if (!typedFeeAssignments || typedFeeAssignments.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          byGrade: {},
          students: []
        }
      });
    }

    // Extract unique students from fee assignments
    const studentMap = new Map<string, Student>();
    typedFeeAssignments.forEach(fa => {
      if (!studentMap.has(fa.student_id)) {
        studentMap.set(fa.student_id, fa.students);
      }
    });
    const typedStudents = Array.from(studentMap.values());

    // Get payment transactions using join filter instead of IN clause
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
          student_id,
          students!inner(
            school_id
          )
        ),
        payment_plans(
          id,
          type,
          installments
        )
      `)
      .eq('student_fee_assignments.students.school_id', profile.school_id)
      .eq('transaction_status', 'completed');

    const { data: transactions, error: transactionsError } = await transactionsQuery;

    interface Transaction {
      student_fee_assignments?: {
        student_id: string;
        students: {
          school_id: string;
        };
      };
      payments?: {
        payment_date?: string;
        amount?: number;
        payment_method?: string;
        [key: string]: unknown;
      };
      payment_plans?: {
        type: string;
        installments?: unknown[];
        [key: string]: unknown;
      };
      installment_number?: number;
      installment_label?: string;
      amount_paid?: number;
      created_at?: string;
      [key: string]: unknown;
    }
    const typedTransactions = transactions as Transaction[] | null;

    if (transactionsError) {
      console.error('Error fetching transactions:', {
        message: transactionsError.message,
        details: transactionsError.details,
        hint: transactionsError.hint,
        code: transactionsError.code
      });
      return NextResponse.json(
        { success: false, error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    // Organize data by student
    const studentPaymentMap = new Map();

    // Initialize all students
    typedStudents.forEach(student => {
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
    typedFeeAssignments?.forEach(fa => {
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
    typedTransactions?.forEach(transaction => {
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

