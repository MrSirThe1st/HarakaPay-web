// src/app/api/school/store/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StoreOrder, StoreApiResponse, StorePaginationData, StoreStatsData, StoreOrderFilters, CreateOrderData } from '@/types/store';

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build filters
    const filters: StoreOrderFilters = {
      status: searchParams.get('status') || undefined,
      paymentStatus: searchParams.get('paymentStatus') || undefined,
      orderType: searchParams.get('orderType') as 'purchase' | 'hire' || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      parentId: searchParams.get('parentId') || undefined,
      studentId: searchParams.get('studentId') || undefined,
    };

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
            item_type
          )
        )
      `, { count: 'exact' });

    if (['school_admin', 'school_staff'].includes(profile.role)) {
      // School staff can see all orders from their school
      query = query.eq('school_id', profile.school_id);
    } else if (profile.role === 'parent') {
      // Parents can only see their own orders
      query = query.eq('parent_id', profile.id);
    } else {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Apply additional filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus);
    }
    if (filters.orderType) {
      query = query.eq('order_type', filters.orderType);
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }
    if (filters.parentId) {
      query = query.eq('parent_id', filters.parentId);
    }
    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    // Apply pagination and ordering
    const { data: orders, error: ordersError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (ordersError) {
      console.error('Error fetching store orders:', ordersError);
      return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Get stats (only for school staff)
    let stats: StoreStatsData = { total: count || 0 };
    if (['school_admin', 'school_staff'].includes(profile.role)) {
      const { data: statsData } = await supabase
        .from('store_orders')
        .select('status, payment_status')
        .eq('school_id', profile.school_id);

      stats = {
        total: count || 0,
        pendingOrders: statsData?.filter(o => o.status === 'pending').length || 0,
      };
    }

    const pagination: StorePaginationData = {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    };

    const response: StoreApiResponse<{
      orders: StoreOrder[];
      pagination: StorePaginationData;
      stats: StoreStatsData;
    }> = {
      success: true,
      data: {
        orders: orders || [],
        pagination,
        stats,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in store orders GET:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { studentId, orderType, items, notes }: CreateOrderData = body;

    // Validate required fields
    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
    }
    if (!orderType || !['purchase', 'hire'].includes(orderType)) {
      return NextResponse.json({ success: false, error: 'Valid order type is required' }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one item is required' }, { status: 400 });
    }

    // Verify student exists and belongs to parent (for parents) or school (for staff)
    let studentQuery = supabase
      .from('students')
      .select('*, schools(id)')
      .eq('id', studentId);

    if (profile.role === 'parent') {
      // For parents, verify student is linked to them
      const { data: parentStudent } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', profile.id)
        .eq('student_id', studentId)
        .single();

      if (!parentStudent) {
        return NextResponse.json({ success: false, error: 'Student not found or not linked to parent' }, { status: 400 });
      }
    }

    const { data: student, error: studentError } = await studentQuery.single();

    if (studentError || !student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 400 });
    }

    // Determine school ID
    const schoolId = profile.role === 'parent' ? student.school_id : profile.school_id;
    const parentId = profile.role === 'parent' ? profile.id : profile.id; // For now, assuming staff can create orders for parents

    // Validate items and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const { data: storeItem, error: itemError } = await supabase
        .from('store_items')
        .select('*')
        .eq('id', item.itemId)
        .eq('school_id', schoolId)
        .eq('is_available', true)
        .single();

      if (itemError || !storeItem) {
        return NextResponse.json({ success: false, error: `Item ${item.itemId} not found or unavailable` }, { status: 400 });
      }

      if (storeItem.stock_quantity < item.quantity) {
        return NextResponse.json({ success: false, error: `Insufficient stock for item ${storeItem.name}` }, { status: 400 });
      }

      if (orderType === 'hire' && storeItem.item_type !== 'hire') {
        return NextResponse.json({ success: false, error: `Item ${storeItem.name} is not available for hire` }, { status: 400 });
      }

      if (orderType === 'purchase' && storeItem.item_type !== 'sale') {
        return NextResponse.json({ success: false, error: `Item ${storeItem.name} is not available for purchase` }, { status: 400 });
      }

      const subtotal = storeItem.price * item.quantity;
      totalAmount += subtotal;

      validatedItems.push({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: storeItem.price,
        subtotal,
        hireStartDate: item.hireStartDate,
        hireEndDate: item.hireEndDate,
      });
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('store_orders')
      .insert({
        school_id: schoolId,
        parent_id: parentId,
        student_id: studentId,
        order_type: orderType,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating store order:', orderError);
      return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    const orderItems = [];
    for (const item of validatedItems) {
      const { data: orderItem, error: itemError } = await supabase
        .from('store_order_items')
        .insert({
          order_id: order.id,
          item_id: item.itemId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: item.subtotal,
        })
        .select()
        .single();

      if (itemError) {
        console.error('Error creating order item:', itemError);
        // Rollback order creation
        await supabase.from('store_orders').delete().eq('id', order.id);
        return NextResponse.json({ success: false, error: 'Failed to create order items' }, { status: 500 });
      }

      orderItems.push(orderItem);

      // Create hire record if order type is hire
      if (orderType === 'hire' && item.hireStartDate && item.hireEndDate) {
        const { error: hireError } = await supabase
          .from('hire_records')
          .insert({
            order_item_id: orderItem.id,
            hire_start_date: item.hireStartDate,
            hire_end_date: item.hireEndDate,
            expected_return_date: item.hireEndDate, // For now, same as end date
            deposit_paid: 0, // Will be updated when payment is processed
          });

        if (hireError) {
          console.error('Error creating hire record:', hireError);
          // Rollback order creation
          await supabase.from('store_orders').delete().eq('id', order.id);
          return NextResponse.json({ success: false, error: 'Failed to create hire record' }, { status: 500 });
        }
      }
    }

    const response: StoreApiResponse<{ order: StoreOrder }> = {
      success: true,
      data: { order: { ...order, orderItems } },
      message: 'Order created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error in store orders POST:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
