// src/app/api/school/fees/payment-plans/route.ts
import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function GET(req: Request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
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

    const typedPaymentPlans = paymentPlans as { is_active: boolean; type: string }[] | null;

    // Calculate statistics
    const totalPlans = count || 0;
    const activePlans = typedPaymentPlans?.filter(p => p.is_active).length || 0;
    const monthlyPlans = typedPaymentPlans?.filter(p => p.type === 'monthly').length || 0;
    const upfrontPlans = typedPaymentPlans?.filter(p => p.type === 'upfront').length || 0;
    const perTermPlans = typedPaymentPlans?.filter(p => p.type === 'per-term').length || 0;

    return NextResponse.json({
      success: true,
      data: {
        paymentPlans: typedPaymentPlans || [],
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
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient, user } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    const body = await req.json();
    const {
      structure_id,
      type,
      discount_percentage = 0,
      installments = [],
      currency = 'USD',
      is_active = true,
      fee_category_id = null
    } = body;

    console.log('📝 Creating payment plan:', { structure_id, type, fee_category_id });

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
    interface Installment {
      installment_number?: number;
      amount?: number;
      due_date?: string;
      [key: string]: unknown;
    }
    if (installments.length > 0) {
      const validInstallments = installments.every((inst: Installment) => 
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
        fee_category_id,  // Add the category link
        created_by: user.id || null  // Use user.id or null if not available
      } as any)
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
