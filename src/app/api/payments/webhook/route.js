import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for webhook (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    
    // M-Pesa sends async response with these fields
    const {
      input_OriginalConversationID,
      input_TransactionID,
      input_ResultCode,
      input_ResultDesc,
      input_ThirdPartyConversationID
    } = body;
    
    // Find payment by transaction reference with related data
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*, student_fee_assignments(*)')
      .eq('transaction_reference', input_TransactionID)
      .single();
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    // Get payment plan details to extract installment info
    let installmentLabel = null;
    let paymentPlanId = null;
    
    if (payment.student_fee_assignments?.payment_plan_id) {
      paymentPlanId = payment.student_fee_assignments.payment_plan_id;
      
      const { data: paymentPlan } = await supabaseAdmin
        .from('payment_plans')
        .select('installments, type')
        .eq('id', paymentPlanId)
        .single();
      
      if (paymentPlan && payment.installment_number && paymentPlan.installments) {
        const installment = paymentPlan.installments.find(
          (inst) => inst.installment_number === payment.installment_number
        );
        installmentLabel = installment?.label || installment?.name || null;
      } else if (paymentPlan?.type === 'one_time' || paymentPlan?.type === 'upfront') {
        installmentLabel = 'Full Payment';
      }
    }
    
    // Update payment status
    const isSuccessful = input_ResultCode === 'INS-0';
    
    await supabaseAdmin
      .from('payments')
      .update({
        status: isSuccessful ? 'completed' : 'failed',
        payment_date: isSuccessful ? new Date().toISOString() : null,
        payment_gateway_response: body
      })
      .eq('id', payment.id);
    
    // If successful, update student_fee_assignments and create payment_transaction record
    if (isSuccessful) {
      const newPaidAmount = parseFloat(payment.student_fee_assignments.paid_amount || 0) + parseFloat(payment.amount);
      const totalDue = parseFloat(payment.student_fee_assignments.total_due) || 0;
      
      // Update student_fee_assignments
      // Keep status as 'active' until fully paid, then change to 'fully_paid'
      await supabaseAdmin
        .from('student_fee_assignments')
        .update({
          paid_amount: newPaidAmount,
          status: newPaidAmount >= totalDue ? 'fully_paid' : 'active'
        })
        .eq('id', payment.student_fee_assignments.id);
      
      // Create payment_transaction record for installment tracking
      await supabaseAdmin
        .from('payment_transactions')
        .insert({
          payment_id: payment.id,
          student_fee_assignment_id: payment.student_fee_assignments.id,
          installment_number: payment.installment_number || null,
          installment_label: installmentLabel,
          amount_paid: parseFloat(payment.amount),
          transaction_status: 'completed',
          mpesa_transaction_id: input_TransactionID,
          payment_plan_id: paymentPlanId,
          notes: `Payment completed via M-Pesa for ${installmentLabel || 'installment'}`
        });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}