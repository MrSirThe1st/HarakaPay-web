import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies: async () => await cookies() });
    
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

    // Only school admins and staff can view payment schedules
    if (!['school_admin', 'school_staff'].includes(profile.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' }, 
        { status: 403 }
      );
    }

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: 'School not found' }, 
        { status: 404 }
      );
    }

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

    // Calculate statistics
    const totalSchedules = count || 0;
    const upfrontSchedules = paymentSchedules?.filter(s => s.schedule_type === 'upfront').length || 0;
    const installmentSchedules = paymentSchedules?.filter(s => s.schedule_type === 'per-term' || s.schedule_type === 'monthly').length || 0;

    return NextResponse.json({
      success: true,
      data: {
        paymentSchedules: paymentSchedules || [],
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
    const supabase = createRouteHandlerClient<Database>({ cookies: async () => await cookies() });
    
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

    // Only school admins can create payment schedules
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can create payment schedules' }, 
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
      })
      .select('*')
      .single();

    if (createError) {
      console.error('Payment schedule creation error:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create payment schedule' }, 
        { status: 500 }
      );
    }

    // Create payment installments if provided
    if (installments.length > 0) {
      const scheduleInstallments = installments.map((inst: {
        description: string;
        amount: number;
        percentage: number;
        due_date: string;
        term_id?: string;
      }, index: number) => ({
        schedule_id: newPaymentSchedule.id,
        installment_number: index + 1,
        name: inst.description || `Installment ${index + 1}`,
        amount: inst.amount,
        percentage: inst.percentage,
        due_date: inst.due_date || new Date().toISOString().split('T')[0], // Use today's date if empty
        term_id: inst.term_id || null
      }));

      const { error: installmentsError } = await adminClient
        .from('payment_installments')
        .insert(scheduleInstallments);

      if (installmentsError) {
        console.error('Payment installments creation error:', installmentsError);
        // Clean up the schedule if installments fail
        await adminClient
          .from('payment_schedules')
          .delete()
          .eq('id', newPaymentSchedule.id);
        
        return NextResponse.json(
          { success: false, error: 'Failed to create payment installments' }, 
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentSchedule: newPaymentSchedule
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
