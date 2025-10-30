import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { initiateC2BPayment } from '@/lib/mpesa/c2b-payment';

export async function POST(request) {
  try {
    // Use service role client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { 
      studentId, 
      amount, 
      phoneNumber, 
      paymentPlanId,
      installmentNumber 
    } = body;
    
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
    
    // Get student fee assignment
    const { data: feeAssignment } = await supabaseAdmin
      .from('student_fee_assignments')
      .select('*, students(*), payment_plans(*)')
      .eq('student_id', studentId)
      .eq('payment_plan_id', paymentPlanId)
      .single();
    
    if (!feeAssignment) {
      return NextResponse.json({ error: 'Fee assignment not found' }, { status: 404 });
    }
    
    // Create pending payment record
    const { data: pendingPayment, error: insertError } = await supabaseAdmin
      .from('payments')
      .insert({
        student_id: studentId,
        parent_id: parent.id,
        amount: amount,
        payment_method: 'm_pesa',
        status: 'pending',
        description: `Payment for ${feeAssignment.students.first_name} ${feeAssignment.students.last_name}`,
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
    
    return NextResponse.json({
      success: paymentResult.success,
      paymentId: pendingPayment.id,
      transactionId: paymentResult.transactionId,
      message: paymentResult.responseDesc
    });
    
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ 
      error: 'Payment initiation failed',
      details: error.message 
    }, { status: 500 });
  }
}