import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { createClient } from '@supabase/supabase-js';
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
      const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
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
      selectedMonth,
      paymentMethod
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
    
    // First, get the payment plan to find its structure_id and fee_category_id
    const { data: paymentPlan, error: planError } = await supabaseAdmin
      .from('payment_plans')
      .select('id, structure_id, fee_category_id')
      .eq('id', paymentPlanId)
      .single();
    
    if (planError || !paymentPlan) {
      return NextResponse.json({ error: 'Payment plan not found' }, { status: 404 });
    }
    
    // Get student fee assignment - find by structure_id (not payment_plan_id)
    // A student has one fee assignment per fee structure, but multiple payment plans per structure
    const { data: feeAssignment, error: assignmentError } = await supabaseAdmin
      .from('student_fee_assignments')
      .select('*, students(*), payment_plans(*)')
      .eq('student_id', studentId)
      .eq('structure_id', paymentPlan.structure_id)
      .in('status', ['active', 'fully_paid'])
      .maybeSingle();
    
    if (assignmentError) {
      console.error('Error fetching fee assignment:', assignmentError);
      return NextResponse.json({ error: 'Failed to fetch fee assignment' }, { status: 500 });
    }
    
    if (!feeAssignment) {
      return NextResponse.json({
        error: 'Fee assignment not found',
        details: `No fee assignment found for student ${studentId} with structure ${paymentPlan.structure_id}`
      }, { status: 404 });
    }

    // Get active payment fee rate for the school
    const { data: activeFeeRate } = await supabaseAdmin
      .from('payment_fee_rates')
      .select('id, fee_percentage')
      .eq('school_id', feeAssignment.students.school_id)
      .eq('status', 'active')
      .gte('effective_from', new Date().toISOString())
      .or(`effective_until.is.null,effective_until.gt.${new Date().toISOString()}`)
      .order('effective_from', { ascending: false })
      .limit(1)
      .maybeSingle();

    const feePercentage = activeFeeRate?.fee_percentage ?? 2.5;
    const baseAmount = parseFloat(amount);
    const feeAmount = Number((baseAmount * (feePercentage / 100)).toFixed(2));
    const totalAmountWithFee = baseAmount + feeAmount;
    // Parent pays total (base + fee), school receives total, school later pays fee to platform

    console.log('💰 Payment Fee Calculation:', {
      baseAmount,
      feePercentage,
      feeAmount,
      totalAmountWithFee,
      schoolReceives: totalAmountWithFee,
      schoolOwes: feeAmount,
      schoolId: feeAssignment.students.school_id,
      feeRateId: activeFeeRate?.id
    });

    // Get the full payment plan details for the selected payment plan (not the one in fee assignment)
    const { data: selectedPaymentPlan } = await supabaseAdmin
      .from('payment_plans')
      .select('installments, type')
      .eq('id', paymentPlanId)
      .single();
    
    // Get installment label from the selected payment plan if installmentNumber is provided
    let installmentLabel = null;
    if (installmentNumber && selectedPaymentPlan?.installments) {
      const installment = selectedPaymentPlan.installments.find(
        (inst) => inst.installment_number === installmentNumber
      );
      installmentLabel = installment?.label || installment?.name || selectedMonth || null;
    } else if (selectedMonth) {
      installmentLabel = selectedMonth;
    } else if (selectedPaymentPlan?.type === 'one_time' || selectedPaymentPlan?.type === 'upfront') {
      installmentLabel = 'Full Payment';
    }
    
    // Use the provided payment method, or default to mobile_money
    const finalPaymentMethod = paymentMethod || 'mobile_money';

    // Create pending payment record with installment info (includes platform fee)
    const { data: pendingPayment, error: insertError } = await supabaseAdmin
      .from('payments')
      .insert({
        student_id: studentId,
        parent_id: parent.id,
        amount: totalAmountWithFee, // Parent pays base + platform fee
        payment_method: finalPaymentMethod,
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

    // Create transaction fee snapshot (immutable record for auditing)
    // Parent pays total (base + fee), school receives total, school owes fee to platform
    const { error: snapshotError } = await supabaseAdmin
      .from('transaction_fee_snapshots')
      .insert({
        payment_id: pendingPayment.id,
        student_id: studentId,
        school_id: feeAssignment.students.school_id,
        fee_rate_id: activeFeeRate?.id,
        fee_percentage: feePercentage,
        base_amount: baseAmount,
        fee_amount: feeAmount,
        total_amount: totalAmountWithFee, // What parent actually pays
        payment_method: finalPaymentMethod,
        payment_status: 'pending'
      });

    if (snapshotError) {
      console.error('❌ Failed to create fee snapshot:', snapshotError);
      // Don't fail the payment, just log the error
    } else {
      console.log('✅ Transaction fee snapshot created');
    }

    // Initiate M-Pesa payment (with platform fee included)
    const paymentResult = await initiateC2BPayment({
      customerMSISDN: phoneNumber,
      amount: totalAmountWithFee, // Parent pays base + platform fee
      studentId: studentId,
      parentId: parent.id,
      feeAssignmentId: feeAssignment.id,
      description: `School fees payment for student ${feeAssignment.students.student_id} (incl. ${feePercentage}% platform fee)`
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

    // Auto-simulate webhook in sandbox mode if enabled
    const autoSimulate = process.env.MPESA_ENVIRONMENT === 'sandbox' && process.env.AUTO_SIMULATE_WEBHOOK === 'true';
    
    if (autoSimulate && paymentResult.success && paymentResult.transactionId) {
      console.log('🧪 Auto-simulating webhook for sandbox mode...');
      try {
        // Simulate webhook by calling the simulate endpoint
        const baseUrl = request.url.split('/api')[0]; // Get base URL
        const simulateUrl = `${baseUrl}/api/payments/simulate-webhook?paymentId=${pendingPayment.id}`;
        
        const simulateResponse = await fetch(simulateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (simulateResponse.ok) {
          const simulateData = await simulateResponse.json();
          console.log('✅ Auto-simulation completed:', simulateData);
        } else {
          console.warn('⚠️ Auto-simulation returned non-OK status:', simulateResponse.status);
        }
      } catch (simulateError) {
        console.error('⚠️ Auto-simulation failed:', simulateError);
        // Don't fail the request if simulation fails
      }
    }

    return NextResponse.json({
      success: paymentResult.success,
      paymentId: pendingPayment.id,
      transactionId: paymentResult.transactionId,
      message: paymentResult.responseDesc,
      responseCode: paymentResult.responseCode,
      details: paymentResult.rawResponse, // Include full M-Pesa response for debugging
      simulated: autoSimulate, // Indicate if webhook was auto-simulated
      feeInfo: {
        baseAmount,
        feePercentage,
        feeAmount,
        totalAmount: totalAmountWithFee, // What parent pays
        schoolReceives: totalAmountWithFee, // What school receives
        schoolOwes: feeAmount // What school owes to platform
      }
    });
    
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ 
      error: 'Payment initiation failed',
      details: error.message 
    }, { status: 500 });
  }
}