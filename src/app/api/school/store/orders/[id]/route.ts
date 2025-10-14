// src/app/api/school/store/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StoreOrder, StoreApiResponse } from '@/types/store';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Build query based on user role
    let query = supabase
      .from('store_orders')
      .select(`
        *,
        parents (
          id,
          first_name,
          last_name,
          email
        ),
        students (
          id,
          first_name,
          last_name,
          student_id
        ),
        store_order_items (
          id,
          quantity,
          unit_price,
          subtotal,
          store_items (
            id,
            name,
            description,
            item_type,
            price,
            images
          ),
          hire_records (
            id,
            hire_start_date,
            hire_end_date,
            expected_return_date,
            actual_return_date,
            deposit_paid,
            deposit_returned,
            late_fees,
            status,
            notes
          )
        )
      `)
      .eq('id', params.id);

    if (['school_admin', 'school_staff'].includes(profile.role)) {
      // School staff can see orders from their school
      query = query.eq('school_id', profile.school_id);
    } else if (profile.role === 'parent') {
      // Parents can only see their own orders
      query = query.eq('parent_id', profile.id);
    } else {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: order, error: orderError } = await query.single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const response: StoreApiResponse<{ order: StoreOrder }> = {
      success: true,
      data: { order },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in store orders GET by ID:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has school-level access
    if (!profile.school_id || !['school_admin', 'school_staff'].includes(profile.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { status, paymentStatus, paymentMethod, paymentReference, notes } = body;

    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    // Validate payment status if provided
    const validPaymentStatuses = ['pending', 'paid', 'refunded'];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid payment status' }, { status: 400 });
    }

    // Check if order exists and belongs to school
    const { data: existingOrder, error: fetchError } = await supabase
      .from('store_orders')
      .select('*')
      .eq('id', params.id)
      .eq('school_id', profile.school_id)
      .single();

    if (fetchError || !existingOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.payment_status = paymentStatus;
    if (paymentMethod !== undefined) updateData.payment_method = paymentMethod;
    if (paymentReference !== undefined) updateData.payment_reference = paymentReference;
    if (notes !== undefined) updateData.notes = notes;

    // Update order
    const { data: order, error: updateError } = await supabase
      .from('store_orders')
      .update(updateData)
      .eq('id', params.id)
      .eq('school_id', profile.school_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating store order:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
    }

    // If order is confirmed, update stock quantities
    if (status === 'confirmed' && existingOrder.status !== 'confirmed') {
      const { data: orderItems } = await supabase
        .from('store_order_items')
        .select('item_id, quantity')
        .eq('order_id', params.id);

      if (orderItems) {
        for (const item of orderItems) {
          await supabase.rpc('decrement_stock', {
            item_id: item.item_id,
            quantity: item.quantity
          });
        }
      }
    }

    // If order is cancelled, restore stock quantities
    if (status === 'cancelled' && existingOrder.status !== 'cancelled') {
      const { data: orderItems } = await supabase
        .from('store_order_items')
        .select('item_id, quantity')
        .eq('order_id', params.id);

      if (orderItems) {
        for (const item of orderItems) {
          await supabase.rpc('increment_stock', {
            item_id: item.item_id,
            quantity: item.quantity
          });
        }
      }
    }

    const response: StoreApiResponse<{ order: StoreOrder }> = {
      success: true,
      data: { order },
      message: 'Order updated successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in store orders PUT:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
