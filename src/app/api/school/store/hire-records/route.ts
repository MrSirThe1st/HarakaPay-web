// src/app/api/school/store/hire-records/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { HireRecord, StoreApiResponse, StorePaginationData, StoreStatsData } from '@/types/store';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile using admin client
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
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
    const status = searchParams.get('status') || undefined;

    // Build query based on user role
    let query = adminClient
      .from('hire_records')
      .select(`
        *,
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
          store_orders (
            id,
            order_number,
            parent_id,
            student_id,
            status,
            payment_status,
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
            )
          )
        )
      `, { count: 'exact' });

    if (['school_admin', 'school_staff'].includes(profile.role)) {
      // School staff can see all hire records for their school
      query = query.eq('store_order_items.store_orders.school_id', profile.school_id);
    } else if (profile.role === 'parent') {
      // Parents can only see their own hire records
      query = query.eq('store_order_items.store_orders.parent_id', profile.id);
    } else {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination and ordering
    const { data: records, error: recordsError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (recordsError) {
      console.error('Error fetching hire records:', recordsError);
      return NextResponse.json({ success: false, error: 'Failed to fetch hire records' }, { status: 500 });
    }

    // Get stats (only for school staff)
    let stats: StoreStatsData = { total: count || 0 };
    if (['school_admin', 'school_staff'].includes(profile.role)) {
      const { data: statsData } = await adminClient
        .from('hire_records')
        .select('status')
        .eq('store_order_items.store_orders.school_id', profile.school_id);

      stats = {
        total: count || 0,
        activeHires: statsData?.filter(r => r.status === 'active').length || 0,
        overdueHires: statsData?.filter(r => r.status === 'overdue').length || 0,
      };
    }

    const pagination: StorePaginationData = {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    };

    const response: StoreApiResponse<{
      records: HireRecord[];
      pagination: StorePaginationData;
      stats: StoreStatsData;
    }> = {
      success: true,
      data: {
        records: records || [],
        pagination,
        stats,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in hire records GET:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
