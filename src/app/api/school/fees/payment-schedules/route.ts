import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function GET(req: Request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    // Get URL parameters for filtering
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    const scheduleType = searchParams.get('schedule_type');

    // Build query for payment schedules
    let query = adminClient
      .from('payment_schedules')
      .select(`
        *,
        payment_installments(*)
      `, { count: 'exact' });

    // Apply filters
    if (scheduleType) {
      query = query.eq('schedule_type', scheduleType);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('id', { ascending: false });

    const { data: paymentSchedules, error: paymentSchedulesError, count } = await query;

    if (paymentSchedulesError) {
      console.error('Error fetching payment schedules:', paymentSchedulesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payment schedules' },
        { status: 500 }
      );
    }

    const typedPaymentSchedules = paymentSchedules as { schedule_type: string }[] | null;

    // Calculate statistics
    const totalSchedules = count || 0;
    const upfrontSchedules = typedPaymentSchedules?.filter(s => s.schedule_type === 'upfront').length || 0;
    const installmentSchedules = typedPaymentSchedules?.filter(s => s.schedule_type === 'per-term' || s.schedule_type === 'monthly').length || 0;

    return NextResponse.json({
      success: true,
      data: {
        paymentSchedules: typedPaymentSchedules || [],
        pagination: {
          page,
          limit,
          total: totalSchedules,
          pages: Math.ceil(totalSchedules / limit)
        },
        stats: {
          total: totalSchedules,
          upfront: upfrontSchedules,
          installments: installmentSchedules
        }
      }
    });

  } catch (error) {
    console.error('Payment schedules API error:', error);
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
    const { profile, adminClient } = authResult;

    const body = await req.json();
    const { 
      name,
      schedule_type,
      discount_percentage = 0,
      template_id,
      installments = []
    } = body;

    // Validate required fields
    if (!name || !schedule_type || !template_id) {
      return NextResponse.json(
        { success: false, error: 'Name, schedule type, and template ID are required' }, 
        { status: 400 }
      );
    }

    // Validate schedule type
    const validScheduleTypes = ['upfront', 'per-term', 'monthly', 'custom'];
    if (!validScheduleTypes.includes(schedule_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid schedule type' }, 
        { status: 400 }
      );
    }

    // Validate installments for non-upfront schedules
    if (schedule_type !== 'upfront' && installments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Installments are required for non-upfront schedules' }, 
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

    // Create payment schedule
    const { data: newPaymentSchedule, error: createError } = await adminClient
      .from('payment_schedules')
      .insert({
        name,
        schedule_type,
        discount_percentage,
        template_id
      } as any)
      .select('*')
      .single();

    if (createError) {
      console.error('Payment schedule creation error:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create payment schedule' },
        { status: 500 }
      );
    }

    const typedNewPaymentSchedule = newPaymentSchedule as { id: string };

    // Create payment installments if provided
    if (installments.length > 0) {
      const scheduleInstallments = installments.map((inst: {
        description: string;
        amount: number;
        percentage: number;
        due_date: string;
        term_id?: string;
      }, index: number) => ({
        schedule_id: typedNewPaymentSchedule.id,
        installment_number: index + 1,
        name: inst.description || `Installment ${index + 1}`,
        amount: inst.amount,
        percentage: inst.percentage,
        due_date: inst.due_date || new Date().toISOString().split('T')[0], // Use today's date if empty
        term_id: inst.term_id || null
      }));

      const { error: installmentsError } = await adminClient
        .from('payment_installments')
        .insert(scheduleInstallments as any);

      if (installmentsError) {
        console.error('Payment installments creation error:', installmentsError);
        // Clean up the schedule if installments fail
        await adminClient
          .from('payment_schedules')
          .delete()
          .eq('id', typedNewPaymentSchedule.id);

        return NextResponse.json(
          { success: false, error: 'Failed to create payment installments' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentSchedule: typedNewPaymentSchedule
      },
      message: 'Payment schedule created successfully'
    });

  } catch (error) {
    console.error('Create payment schedule error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
