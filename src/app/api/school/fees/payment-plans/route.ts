// src/app/api/school/fees/payment-plans/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { Database } from '@/types/supabase';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get user profile to check role and school
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' }, 
        { status: 404 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account inactive' }, 
        { status: 403 }
      );
    }

    // Only school admins can view payment plans
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can view payment plans' }, 
        { status: 403 }
      );
    }

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: 'School not found' }, 
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const structureId = searchParams.get('structure_id');
    const type = searchParams.get('type');

    const offset = (page - 1) * limit;

    // Build query for payment plans
    let query = adminClient
      .from('payment_plans')
      .select(`
        *,
        fee_structures!inner(
          id,
          name,
          grade_level,
          school_id
        )
      `, { count: 'exact' })
      .eq('fee_structures.school_id', profile.school_id);

    // Apply filters
    if (structureId) {
      query = query.eq('structure_id', structureId);
    }
    if (type) {
      query = query.eq('type', type);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('id', { ascending: false });

    const { data: paymentPlans, error: paymentPlansError, count } = await query;

    if (paymentPlansError) {
      console.error('Error fetching payment plans:', paymentPlansError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payment plans' }, 
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalPlans = count || 0;
    const activePlans = paymentPlans?.filter(p => p.is_active).length || 0;
    const monthlyPlans = paymentPlans?.filter(p => p.type === 'monthly').length || 0;
    const upfrontPlans = paymentPlans?.filter(p => p.type === 'upfront').length || 0;
    const perTermPlans = paymentPlans?.filter(p => p.type === 'per-term').length || 0;

    return NextResponse.json({
      success: true,
      data: {
        paymentPlans: paymentPlans || [],
        pagination: {
          page,
          limit,
          total: totalPlans,
          pages: Math.ceil(totalPlans / limit)
        },
        stats: {
          total: totalPlans,
          active: activePlans,
          monthly: monthlyPlans,
          upfront: upfrontPlans,
          per_term: perTermPlans
        }
      }
    });

  } catch (error) {
    console.error('Payment plans API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get user profile to check role and school
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' }, 
        { status: 404 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account inactive' }, 
        { status: 403 }
      );
    }

    // Only school admins can create payment plans
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can create payment plans' }, 
        { status: 403 }
      );
    }

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: 'School not found' }, 
        { status: 404 }
      );
    }

    const body = await req.json();
    const { 
      structure_id,
      type,
      discount_percentage = 0,
      installments = [],
      currency = 'USD',
      is_active = true
    } = body;

    // Validate required fields
    if (!structure_id || !type) {
      return NextResponse.json(
        { success: false, error: 'Structure ID and type are required' }, 
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['monthly', 'per-term', 'upfront', 'custom'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment plan type' }, 
        { status: 400 }
      );
    }

    // Validate installments for non-upfront plans
    if (type !== 'upfront' && installments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Installments are required for non-upfront plans' }, 
        { status: 400 }
      );
    }

    // Validate discount percentage
    if (discount_percentage < 0 || discount_percentage > 100) {
      return NextResponse.json(
        { success: false, error: 'Discount percentage must be between 0 and 100' }, 
        { status: 400 }
      );
    }

    // Validate that fee structure exists and belongs to school
    const { data: feeStructure } = await adminClient
      .from('fee_structures')
      .select('id, school_id')
      .eq('id', structure_id)
      .eq('school_id', profile.school_id)
      .single();

    if (!feeStructure) {
      return NextResponse.json(
        { success: false, error: 'Fee structure not found' }, 
        { status: 404 }
      );
    }

    // Validate installments JSONB structure
    if (installments.length > 0) {
      const validInstallments = installments.every((inst: any) => 
        inst.installment_number && 
        inst.amount && 
        inst.due_date &&
        typeof inst.installment_number === 'number' &&
        typeof inst.amount === 'number'
      );

      if (!validInstallments) {
        return NextResponse.json(
          { success: false, error: 'Invalid installment structure' }, 
          { status: 400 }
        );
      }
    }

    // Create payment plan
    const { data: newPaymentPlan, error: createError } = await adminClient
      .from('payment_plans')
      .insert({
        school_id: profile.school_id,
        structure_id,
        type,
        discount_percentage,
        installments: installments,
        currency,
        is_active,
        created_by: profile.user_id || null  // Use profile.user_id or null if not available
      })
      .select('*')
      .single();

    if (createError) {
      console.error('Payment plan creation error:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create payment plan' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentPlan: newPaymentPlan
      },
      message: 'Payment plan created successfully'
    });

  } catch (error) {
    console.error('Create payment plan error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
