import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

/**
 * Test endpoint to simulate M-Pesa webhook confirmation
 * Call this with paymentId to simulate successful payment confirmation
 * Usage: POST /api/payments/simulate-webhook?paymentId=<payment-id>
 *
 * NOTE: This endpoint is for testing only and should be disabled in production
 * or protected with a secret key
 */
export async function POST(request) {
  try {
    // Use service role for webhook simulation (bypass RLS)
    const supabaseAdmin = createAdminClient();

    // Optional: Add a simple secret check for security (only in production)
    // For now, allow access in all environments for testing
    const authHeader = request.headers.get('x-test-secret');
    const testSecret = process.env.TEST_WEBHOOK_SECRET;
    
    // Only check secret if it's set in env (optional security)
    if (testSecret && authHeader !== testSecret) {
      // Allow access if no secret is configured (for development)
      // Uncomment below to require secret:
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId query parameter is required' }, { status: 400 });
    }

    console.log('🧪 Simulating webhook for payment:', paymentId);

    // Find payment by ID - first try without join to see if payment exists
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      console.error('❌ Error fetching payment:', paymentError);
      return NextResponse.json({ 
        error: 'Payment not found',
        details: paymentError.message 
      }, { status: 404 });
    }

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    console.log('✅ Payment found:', { id: payment.id, status: payment.status, student_id: payment.student_id });

    // Now get the student_fee_assignment separately
    let feeAssignment = null;
    if (payment.student_id) {
      const { data: assignment, error: assignmentError } = await supabaseAdmin
        .from('student_fee_assignments')
        .select('*')
        .eq('student_id', payment.student_id)
        .eq('status', 'active')
        .maybeSingle();

      if (assignmentError) {
        console.error('⚠️ Error fetching fee assignment:', assignmentError);
      } else {
        feeAssignment = assignment;
        console.log('✅ Fee assignment found:', { id: assignment?.id, payment_plan_id: assignment?.payment_plan_id });
      }
    }

    // Attach fee assignment to payment object for compatibility
    payment.student_fee_assignments = feeAssignment;

    // Check if already completed
    if (payment.status === 'completed') {
      return NextResponse.json({ 
        message: 'Payment already completed',
        payment: payment 
      });
    }

    // Get transaction reference (use payment ID if not set)
    const transactionId = payment.transaction_reference || payment.id;

    // Get payment plan details to extract installment info
    let installmentLabel = null;
    let paymentPlanId = null;

    if (!feeAssignment) {
      console.warn('⚠️ No fee assignment found for payment, proceeding without installment details');
    } else if (feeAssignment.payment_plan_id) {
      paymentPlanId = feeAssignment.payment_plan_id;

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

    // Simulate successful M-Pesa webhook response
    const simulatedWebhookBody = {
      input_OriginalConversationID: `SIM-${Date.now()}`,
      input_TransactionID: transactionId,
      input_ResultCode: 'INS-0',
      input_ResultDesc: 'Successfully Accepted Request (Simulated)',
      input_ThirdPartyConversationID: payment.mpesa_third_party_id || `SIM-${payment.id}`
    };

    // Update payment status
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'completed',
        payment_date: new Date().toISOString(),
        payment_gateway_response: {
          ...simulatedWebhookBody,
          simulated: true,
          simulated_at: new Date().toISOString()
        },
        transaction_reference: transactionId
      })
      .eq('id', payment.id);

    if (updateError) {
      throw new Error(`Failed to update payment: ${updateError.message}`);
    }

    // Update student_fee_assignments and create payment_transaction record
    let newPaidAmount = null;
    let assignmentStatus = null;

    if (feeAssignment) {
      newPaidAmount = parseFloat(feeAssignment.paid_amount || 0) + parseFloat(payment.amount);
      const totalDue = parseFloat(feeAssignment.total_due) || 0;

      // Update student_fee_assignments
      // Keep status as 'active' until fully paid, then change to 'fully_paid'
      const { error: assignmentError } = await supabaseAdmin
        .from('student_fee_assignments')
        .update({
          paid_amount: newPaidAmount,
          status: newPaidAmount >= totalDue ? 'fully_paid' : 'active'
        })
        .eq('id', feeAssignment.id);

      if (assignmentError) {
        console.error('Error updating student_fee_assignments:', assignmentError);
      } else {
        assignmentStatus = newPaidAmount >= totalDue ? 'fully_paid' : 'active';
        console.log('✅ Updated student_fee_assignments:', { paid_amount: newPaidAmount, status: assignmentStatus });
      }
    } else {
      console.warn('⚠️ Skipping student_fee_assignments update - no assignment found');
    }

    // Create payment_transaction record for installment tracking
    let transactionRecord = null;
    const { data: insertedTransaction, error: transactionError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        payment_id: payment.id,
        student_fee_assignment_id: feeAssignment?.id || null,
        installment_number: payment.installment_number || null,
        installment_label: installmentLabel,
        amount_paid: parseFloat(payment.amount),
        transaction_status: 'completed',
        mpesa_transaction_id: transactionId,
        payment_plan_id: paymentPlanId,
        notes: `Payment completed via M-Pesa (SIMULATED) for ${installmentLabel || 'installment'}`
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating payment_transaction:', transactionError);
    } else {
      transactionRecord = insertedTransaction;
      console.log('✅ Created payment_transaction:', transactionRecord);
    }

    // Return success even if transaction record creation failed (payment is still updated)
    if (transactionError) {
      console.error('Error creating payment_transaction:', transactionError);
      return NextResponse.json({
        success: true,
        message: 'Payment updated but failed to create transaction record',
        error: transactionError.message,
        payment: {
          id: payment.id,
          status: 'completed'
        },
        warning: 'Transaction record not created - check logs for details'
      });
    }

    console.log('✅ Simulated webhook completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully (simulated)',
      payment: {
        id: payment.id,
        status: 'completed',
        amount: payment.amount,
        installment_number: payment.installment_number,
        installment_label: installmentLabel
      },
      transaction: transactionRecord,
      student_fee_assignment: feeAssignment ? {
        id: feeAssignment.id,
        paid_amount: newPaidAmount,
        status: assignmentStatus
      } : null
    });

  } catch (error) {
    console.error('Simulate webhook error:', error);
    return NextResponse.json({
      error: 'Webhook simulation failed',
      details: error.message
    }, { status: 500 });
  }
}

