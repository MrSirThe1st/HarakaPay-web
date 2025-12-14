import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

/**
 * Get payment history for a student
 * Returns all payment transactions with details
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
    const supabase = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
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

    const typedParent = parent as { id: string };

    const { data: parentStudent } = await adminClient
      .from('parent_students')
      .select('student_id')
      .eq('parent_id', typedParent.id)
      .eq('student_id', studentId)
      .single();

    if (!parentStudent) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get fee assignment for this student
    const { data: feeAssignment } = await adminClient
      .from('student_fee_assignments')
      .select('id')
      .eq('student_id', studentId)
      .in('status', ['active', 'fully_paid'])
      .maybeSingle();

    if (!feeAssignment) {
      return NextResponse.json({
        payments: [],
        total_paid: 0,
        total_count: 0
      });
    }

    const typedFeeAssignment = feeAssignment as { id: string };

    // Get all payment transactions for this student
    const { data: transactions, error: transactionsError } = await adminClient
      .from('payment_transactions')
      .select(`
        id,
        payment_id,
        installment_number,
        installment_label,
        amount_paid,
        transaction_status,
        mpesa_transaction_id,
        payment_plan_id,
        notes,
        created_at,
        updated_at,
        payments!inner(
          id,
          amount,
          payment_method,
          status,
          description,
          payment_date,
          transaction_reference
        ),
        payment_plans(
          id,
          type,
          fee_category_id,
          fee_categories(
            id,
            name
          )
        )
      `)
      .eq('student_fee_assignment_id', typedFeeAssignment.id)
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.error('Error fetching payment transactions:', transactionsError);
      return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 });
    }

    // Transform the data for easier consumption
    const paymentHistory = (transactions || []).map((transaction: {
      id: string;
      payment_id: string;
      installment_number: number;
      installment_label: string;
      amount_paid?: number | string;
      transaction_status: string;
      mpesa_transaction_id?: string;
      notes?: string;
      created_at: string;
      updated_at: string;
      payments?: { payment_method?: string; transaction_reference?: string; description?: string; payment_date?: string } | { payment_method?: string; transaction_reference?: string; description?: string; payment_date?: string }[];
      payment_plans?: { type?: string; fee_category_id?: string; fee_categories?: { name?: string } | { name?: string }[] } | { type?: string; fee_category_id?: string; fee_categories?: { name?: string } | { name?: string }[] }[];
    }) => {
      // Handle nested objects that might be arrays (Supabase type inference issue)
      const payment = Array.isArray(transaction.payments) ? transaction.payments[0] : transaction.payments;
      const paymentPlan = Array.isArray(transaction.payment_plans) ? transaction.payment_plans[0] : transaction.payment_plans;
      const feeCategory = paymentPlan?.fee_categories 
        ? (Array.isArray(paymentPlan.fee_categories) ? paymentPlan.fee_categories[0] : paymentPlan.fee_categories)
        : undefined;
      
      return {
        id: transaction.id,
        payment_id: transaction.payment_id,
        installment_number: transaction.installment_number,
        installment_label: transaction.installment_label,
        amount: parseFloat(transaction.amount_paid?.toString() || '0'),
        status: transaction.transaction_status,
        payment_method: payment?.payment_method || 'unknown',
        mpesa_transaction_id: transaction.mpesa_transaction_id || payment?.transaction_reference,
        category_name: feeCategory?.name || 'Unknown',
        category_id: paymentPlan?.fee_category_id,
        payment_plan_type: paymentPlan?.type,
        description: payment?.description || transaction.notes,
        payment_date: payment?.payment_date || transaction.created_at,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
      };
    });

    // Calculate totals
    const totalPaid = paymentHistory
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      payments: paymentHistory,
      total_paid: totalPaid,
      total_count: paymentHistory.length,
      student_id: studentId
    });

  } catch (error) {
    console.error('Payment history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

