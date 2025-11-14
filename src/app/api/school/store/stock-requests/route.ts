// src/app/api/school/store/stock-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { StockRequest, StoreApiResponse, StorePaginationData, StoreStatsData, StockRequestFilters, StockRequestFormData } from '@/types/store';

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

    // Build filters
    const filters: StockRequestFilters = {
      status: searchParams.get('status') || undefined,
      itemId: searchParams.get('itemId') || undefined,
      parentId: searchParams.get('parentId') || undefined,
      studentId: searchParams.get('studentId') || undefined,
    };

    // Build query based on user role
    let query = adminClient
      .from('stock_requests')
      .select(`
        *,
        store_items (
          id,
          name,
          description,
          item_type,
          price,
          images
        ),
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
      `, { count: 'exact' });

    if (['school_admin', 'school_staff'].includes(profile.role)) {
      // School staff can see all stock requests for their school's items
      query = query.eq('store_items.school_id', profile.school_id);
    } else if (profile.role === 'parent') {
      // Parents can only see their own stock requests
      query = query.eq('parent_id', profile.id);
    } else {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Apply additional filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.itemId) {
      query = query.eq('item_id', filters.itemId);
    }
    if (filters.parentId) {
      query = query.eq('parent_id', filters.parentId);
    }
    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    // Apply pagination and ordering
    const { data: requests, error: requestsError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (requestsError) {
      console.error('Error fetching stock requests:', requestsError);
      return NextResponse.json({ success: false, error: 'Failed to fetch stock requests' }, { status: 500 });
    }

    // Get stats (only for school staff)
    let stats: StoreStatsData = { total: count || 0 };
    if (['school_admin', 'school_staff'].includes(profile.role)) {
      const { data: statsData } = await adminClient
        .from('stock_requests')
        .select('status')
        .eq('store_items.school_id', profile.school_id);

      stats = {
        total: count || 0,
        pendingRequests: statsData?.filter(r => r.status === 'pending').length || 0,
      };
    }

    const pagination: StorePaginationData = {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    };

    const response: StoreApiResponse<{
      requests: StockRequest[];
      pagination: StorePaginationData;
      stats: StoreStatsData;
    }> = {
      success: true,
      data: {
        requests: requests || [],
        pagination,
        stats,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in stock requests GET:', error);
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

    // Parse request body
    interface StockRequestBody {
      itemId?: string;
      studentId?: string;
      requestedQuantity?: number;
      message?: string;
      [key: string]: unknown;
    }
    const reqBody = await request.json() as StockRequestBody;
    const { itemId, studentId, requestedQuantity, message } = reqBody;

    // Validate required fields
    if (!itemId) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
    }
    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
    }
    if (!requestedQuantity || requestedQuantity <= 0) {
      return NextResponse.json({ success: false, error: 'Valid quantity is required' }, { status: 400 });
    }

    // Verify item exists
    const { data: item, error: itemError } = await adminClient
      .from('store_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 400 });
    }

    // Verify student exists and is linked to parent (for parents)
    if (profile.role === 'parent') {
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

    // Check if there's already a pending request for this item and student
    const { data: existingRequest } = await adminClient
      .from('stock_requests')
      .select('id')
      .eq('item_id', itemId)
      .eq('parent_id', profile.id)
      .eq('student_id', studentId)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return NextResponse.json({ success: false, error: 'You already have a pending request for this item' }, { status: 400 });
    }

    // Create stock request
    const { data: stockRequest, error: createError } = await adminClient
      .from('stock_requests')
      .insert({
        item_id: itemId,
        parent_id: profile.id,
        student_id: studentId,
        requested_quantity: requestedQuantity,
        message: message?.trim() || null,
        status: 'pending',
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating stock request:', createError);
      return NextResponse.json({ success: false, error: 'Failed to create stock request' }, { status: 500 });
    }

    const response: StoreApiResponse<{ request: StockRequest }> = {
      success: true,
      data: { request: stockRequest },
      message: 'Stock request created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error in stock requests POST:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { requestId, status } = body;

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['pending', 'acknowledged', 'fulfilled', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Valid status is required' }, { status: 400 });
    }

    // Check if request exists and user has permission to update it
    let query = adminClient
      .from('stock_requests')
      .select('*')
      .eq('id', requestId);

    if (['school_admin', 'school_staff'].includes(profile.role)) {
      // School staff can update any request for their school's items
      query = query.eq('store_items.school_id', profile.school_id);
    } else if (profile.role === 'parent') {
      // Parents can only update their own requests
      query = query.eq('parent_id', profile.id);
    } else {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: existingRequest, error: fetchError } = await query.single();

    if (fetchError || !existingRequest) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    // Update request status
    const { data: updatedRequest, error: updateError } = await adminClient
      .from('stock_requests')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating stock request:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update request' }, { status: 500 });
    }

    const response: StoreApiResponse<{ request: StockRequest }> = {
      success: true,
      data: { request: updatedRequest },
      message: 'Request updated successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in stock requests PUT:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
