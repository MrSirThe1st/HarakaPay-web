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
    
    // Find payment by transaction reference
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*, student_fee_assignments(*)')
      .eq('transaction_reference', input_TransactionID)
      .single();
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
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
    
    // If successful, update student_fee_assignments
    if (isSuccessful) {
      const newPaidAmount = parseFloat(payment.student_fee_assignments.paid_amount) + parseFloat(payment.amount);
      
      await supabaseAdmin
        .from('student_fee_assignments')
        .update({
          paid_amount: newPaidAmount,
          status: newPaidAmount >= payment.student_fee_assignments.total_due 
            ? 'fully_paid' 
            : 'partially_paid'
        })
        .eq('id', payment.student_fee_assignments.id);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}