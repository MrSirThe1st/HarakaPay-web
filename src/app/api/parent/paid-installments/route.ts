import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerAuthClient } from '@/lib/supabaseServerOnly';

/**
 * Get paid installments for a student's payment plan
 * Returns which installments have been paid based on payment_transactions
 */
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

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const paymentPlanId = searchParams.get('paymentPlanId');

    if (!studentId || !paymentPlanId) {
      return NextResponse.json(
        { error: 'studentId and paymentPlanId are required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Verify parent owns this student
    const { data: parent } = await adminClient
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    const { data: parentStudent } = await adminClient
      .from('parent_students')
      .select('student_id')
      .eq('parent_id', parent.id)
      .eq('student_id', studentId)
      .single();

    if (!parentStudent) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get fee assignment for this student and payment plan's structure
    const { data: paymentPlan } = await adminClient
      .from('payment_plans')
      .select('structure_id')
      .eq('id', paymentPlanId)
      .single();

    if (!paymentPlan) {
      return NextResponse.json({ error: 'Payment plan not found' }, { status: 404 });
    }

    // Get fee assignment (for reference, but we'll calculate per-category amounts)
    const { data: feeAssignment } = await adminClient
      .from('student_fee_assignments')
      .select('id')
      .eq('student_id', studentId)
      .eq('structure_id', paymentPlan.structure_id)
      .in('status', ['active', 'fully_paid'])
      .maybeSingle();

    if (!feeAssignment) {
      return NextResponse.json({ 
        paid_installments: [],
        paid_amount: 0,
        total_due: 0,
        remaining_balance: 0
      });
    }

    // Get the payment plan details to calculate total due for THIS category
    const { data: fullPaymentPlan, error: planError } = await adminClient
      .from('payment_plans')
      .select('installments, fee_category_id')
      .eq('id', paymentPlanId)
      .single();

    if (planError || !fullPaymentPlan) {
      return NextResponse.json({ error: 'Payment plan details not found' }, { status: 404 });
    }

    // Calculate total due for THIS payment plan (category) from installments
    const installments = (fullPaymentPlan.installments as any[]) || [];
    const totalDueForCategory = installments.reduce((sum, inst) => {
      return sum + parseFloat(inst.amount?.toString() || '0');
    }, 0);

    // Get all paid installments for THIS payment plan only (category-specific)
    const { data: paidTransactions, error: transactionsError } = await adminClient
      .from('payment_transactions')
      .select('installment_number, installment_label, amount_paid, transaction_status, created_at, payment_id')
      .eq('student_fee_assignment_id', feeAssignment.id)
      .eq('payment_plan_id', paymentPlanId) // Only payments for THIS payment plan (category)
      .eq('transaction_status', 'completed')
      .order('created_at', { ascending: true }); // Get first payment to determine method

    if (transactionsError) {
      console.error('Error fetching paid transactions:', transactionsError);
      return NextResponse.json({ error: 'Failed to fetch paid installments' }, { status: 500 });
    }

    // Group by installment_number to handle multiple payments for same installment
    const paidInstallmentsMap = new Map<number, {
      installment_number: number;
      installment_label: string | null;
      total_paid: number;
      payment_count: number;
      last_paid_date: string;
    }>();

    // Calculate total paid for THIS payment plan (category) only
    let totalPaidForCategory = 0;

    paidTransactions?.forEach((transaction) => {
      const amount = parseFloat(transaction.amount_paid.toString());
      totalPaidForCategory += amount;

      const installmentNum = transaction.installment_number;
      if (installmentNum) {
        const existing = paidInstallmentsMap.get(installmentNum);
        if (existing) {
          existing.total_paid += amount;
          existing.payment_count += 1;
          if (transaction.created_at > existing.last_paid_date) {
            existing.last_paid_date = transaction.created_at;
          }
        } else {
          paidInstallmentsMap.set(installmentNum, {
            installment_number: installmentNum,
            installment_label: transaction.installment_label,
            total_paid: amount,
            payment_count: 1,
            last_paid_date: transaction.created_at
          });
        }
      }
    });

    const paidInstallments = Array.from(paidInstallmentsMap.values());
    const remainingBalance = Math.max(0, totalDueForCategory - totalPaidForCategory);

    return NextResponse.json({
      paid_installments: paidInstallments,
      paid_amount: totalPaidForCategory, // Amount paid for THIS category only
      total_due: totalDueForCategory, // Total due for THIS category only
      remaining_balance: remainingBalance, // Remaining for THIS category only
      fee_assignment_id: feeAssignment.id
    });

  } catch (error) {
    console.error('Paid installments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

