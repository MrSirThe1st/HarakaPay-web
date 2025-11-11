import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { initiateC2BPayment } from '@/lib/mpesa/c2b-payment';

export async function POST(request) {
  try {
    console.log('💳 Payment API: Starting payment initiation...');

    // Use service role client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get authenticated user - handle both cookie and bearer token auth
    let user = null;
    const authHeader = request.headers.get('authorization');

    if (authHeader?.startsWith('Bearer ')) {
      // Bearer token authentication (for mobile apps)
      const token = authHeader.substring(7);
      const { data: { user: tokenUser }, error: tokenError } = await supabaseAdmin.auth.getUser(token);

      if (tokenError || !tokenUser) {
        console.log('❌ Payment API: Bearer token authentication failed:', tokenError?.message);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      user = tokenUser;
      console.log('✅ Payment API: Authenticated via bearer token');
    } else {
      // Cookie-based authentication (for web)
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !cookieUser) {
        console.log('❌ Payment API: Cookie authentication failed:', authError?.message);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      user = cookieUser;
      console.log('✅ Payment API: Authenticated via cookies');
    }

    if (!user) {
      console.log('❌ Payment API: No authentication provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { 
      studentId, 
      amount, 
      phoneNumber, 
      paymentPlanId,
      installmentNumber,
      paymentType,
      selectedMonth
    } = body;
    
    console.log('💳 Payment API: Request data:', { 
      studentId, amount, phoneNumber, paymentPlanId, paymentType, selectedMonth 
    });
    
    // APPLICATION-LEVEL CHECK: Verify user owns this student
    const { data: parent } = await supabaseAdmin
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }
    
    const { data: parentStudent } = await supabaseAdmin
      .from('parent_students')
      .select('*')
      .eq('parent_id', parent.id)
      .eq('student_id', studentId)
      .single();
    
    if (!parentStudent) {
      // YOUR permission check prevents unauthorized access
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Get student fee assignment with payment plan details
    const { data: feeAssignment } = await supabaseAdmin
      .from('student_fee_assignments')
      .select('*, students(*), payment_plans(*)')
      .eq('student_id', studentId)
      .eq('payment_plan_id', paymentPlanId)
      .single();
    
    if (!feeAssignment) {
      return NextResponse.json({ error: 'Fee assignment not found' }, { status: 404 });
    }
    
    // Get installment label from payment plan if installmentNumber is provided
    let installmentLabel = null;
    if (installmentNumber && feeAssignment.payment_plans?.installments) {
      const installment = feeAssignment.payment_plans.installments.find(
        (inst) => inst.installment_number === installmentNumber
      );
      installmentLabel = installment?.label || installment?.name || selectedMonth || null;
    } else if (selectedMonth) {
      installmentLabel = selectedMonth;
    } else if (feeAssignment.payment_plans?.type === 'one_time' || feeAssignment.payment_plans?.type === 'upfront') {
      installmentLabel = 'Full Payment';
    }
    
    // Create pending payment record with installment info
    const { data: pendingPayment, error: insertError } = await supabaseAdmin
      .from('payments')
      .insert({
        student_id: studentId,
        parent_id: parent.id,
        amount: amount,
        payment_method: 'mobile_money', // M-Pesa is a type of mobile money
        status: 'pending',
        description: `Payment for ${feeAssignment.students.first_name} ${feeAssignment.students.last_name}${installmentLabel ? ` - ${installmentLabel}` : ''}`,
        installment_number: installmentNumber || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) {
      throw new Error(`Failed to create payment record: ${insertError.message}`);
    }
    
    // Initiate M-Pesa payment
    const paymentResult = await initiateC2BPayment({
      customerMSISDN: phoneNumber,
      amount: amount,
      studentId: studentId,
      parentId: parent.id,
      feeAssignmentId: feeAssignment.id,
      description: `School fees payment for student ${feeAssignment.students.student_id}`
    });
    
    // Update payment record with M-Pesa details
    await supabaseAdmin
      .from('payments')
      .update({
        transaction_reference: paymentResult.transactionId,
        payment_gateway_response: paymentResult,
        status: paymentResult.success ? 'pending' : 'failed'
      })
      .eq('id', pendingPayment.id);

    console.log('💳 Payment API: Payment result:', {
      success: paymentResult.success,
      code: paymentResult.responseCode,
      description: paymentResult.responseDesc
    });

    return NextResponse.json({
      success: paymentResult.success,
      paymentId: pendingPayment.id,
      transactionId: paymentResult.transactionId,
      message: paymentResult.responseDesc,
      responseCode: paymentResult.responseCode,
      details: paymentResult.rawResponse // Include full M-Pesa response for debugging
    });
    
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ 
      error: 'Payment initiation failed',
      details: error.message 
    }, { status: 500 });
  }
}