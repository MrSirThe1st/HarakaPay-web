// src/app/api/school/store/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StoreItem, StoreApiResponse, StorePaginationData, StoreStatsData, StoreItemFilters } from '@/types/store';

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
    const filters: StoreItemFilters = {
      categoryId: searchParams.get('categoryId') || undefined,
      itemType: searchParams.get('itemType') as 'sale' | 'hire' || undefined,
      isAvailable: searchParams.get('isAvailable') === 'true' ? true : searchParams.get('isAvailable') === 'false' ? false : undefined,
      lowStock: searchParams.get('lowStock') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
    };

    // Build query
    let query = supabase
      .from('store_items')
      .select(`
        *,
        store_categories (
          id,
          name,
          description
        ),
        hire_settings (
          id,
          duration_type,
          min_duration_days,
          max_duration_days,
          deposit_amount,
          late_fee_per_day
        )
      `, { count: 'exact' });

    // Apply filters based on user role
    if (['school_admin', 'school_staff'].includes(profile.role)) {
      // School staff can see all items
      query = query.eq('school_id', profile.school_id);
    } else if (profile.role === 'parent') {
      // Parents can only see available items
      query = query.eq('is_available', true);
    } else {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Apply additional filters
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters.itemType) {
      query = query.eq('item_type', filters.itemType);
    }
    if (filters.isAvailable !== undefined) {
      query = query.eq('is_available', filters.isAvailable);
    }
    if (filters.lowStock) {
      query = query.lte('stock_quantity', supabase.raw('low_stock_threshold'));
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply pagination and ordering
    const { data: items, error: itemsError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (itemsError) {
      console.error('Error fetching store items:', itemsError);
      return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 });
    }

    // Get stats (only for school staff)
    let stats: StoreStatsData = { total: count || 0 };
    if (['school_admin', 'school_staff'].includes(profile.role)) {
      const { data: statsData } = await supabase
        .from('store_items')
        .select('is_available, stock_quantity, low_stock_threshold')
        .eq('school_id', profile.school_id);

      stats = {
        total: count || 0,
        active: statsData?.filter(i => i.is_available).length || 0,
        inactive: statsData?.filter(i => !i.is_available).length || 0,
        lowStock: statsData?.filter(i => i.stock_quantity <= i.low_stock_threshold).length || 0,
      };
    }

    const pagination: StorePaginationData = {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    };

    const response: StoreApiResponse<{
      items: StoreItem[];
      pagination: StorePaginationData;
      stats: StoreStatsData;
    }> = {
      success: true,
      data: {
        items: items || [],
        pagination,
        stats,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in store items GET:', error);
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

    // Check if user has school-level access
    if (!profile.school_id || !['school_admin', 'school_staff'].includes(profile.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { 
      name, 
      description, 
      categoryId, 
      itemType, 
      price, 
      stockQuantity, 
      lowStockThreshold, 
      isAvailable, 
      images,
      hireSettings 
    } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Item name is required' }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ success: false, error: 'Category is required' }, { status: 400 });
    }
    if (!itemType || !['sale', 'hire'].includes(itemType)) {
      return NextResponse.json({ success: false, error: 'Valid item type is required' }, { status: 400 });
    }
    if (price === undefined || price < 0) {
      return NextResponse.json({ success: false, error: 'Valid price is required' }, { status: 400 });
    }
    if (stockQuantity === undefined || stockQuantity < 0) {
      return NextResponse.json({ success: false, error: 'Valid stock quantity is required' }, { status: 400 });
    }

    // Verify category exists and belongs to school
    const { data: category, error: categoryError } = await supabase
      .from('store_categories')
      .select('id')
      .eq('id', categoryId)
      .eq('school_id', profile.school_id)
      .single();

    if (categoryError || !category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 400 });
    }

    // Validate hire settings if item type is hire
    if (itemType === 'hire' && hireSettings) {
      const { durationType, minDurationDays, maxDurationDays } = hireSettings;
      if (!durationType || !['daily', 'weekly', 'monthly', 'per_term', 'per_year', 'custom'].includes(durationType)) {
        return NextResponse.json({ success: false, error: 'Valid duration type is required for hire items' }, { status: 400 });
      }
      if (minDurationDays === undefined || minDurationDays <= 0) {
        return NextResponse.json({ success: false, error: 'Valid minimum duration is required for hire items' }, { status: 400 });
      }
      if (maxDurationDays === undefined || maxDurationDays < minDurationDays) {
        return NextResponse.json({ success: false, error: 'Maximum duration must be greater than or equal to minimum duration' }, { status: 400 });
      }
    }

    // Create item
    const { data: item, error: createError } = await supabase
      .from('store_items')
      .insert({
        school_id: profile.school_id,
        category_id: categoryId,
        name: name.trim(),
        description: description?.trim() || null,
        item_type: itemType,
        price: price,
        stock_quantity: stockQuantity,
        low_stock_threshold: lowStockThreshold || 10,
        is_available: isAvailable !== false,
        images: images || [],
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating store item:', createError);
      return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 });
    }

    // Create hire settings if item type is hire
    if (itemType === 'hire' && hireSettings) {
      const { data: hireSettingsData, error: hireSettingsError } = await supabase
        .from('hire_settings')
        .insert({
          item_id: item.id,
          duration_type: hireSettings.durationType,
          min_duration_days: hireSettings.minDurationDays,
          max_duration_days: hireSettings.maxDurationDays,
          deposit_amount: hireSettings.depositAmount || null,
          late_fee_per_day: hireSettings.lateFeePerDay || null,
        })
        .select()
        .single();

      if (hireSettingsError) {
        console.error('Error creating hire settings:', hireSettingsError);
        // Rollback item creation
        await supabase.from('store_items').delete().eq('id', item.id);
        return NextResponse.json({ success: false, error: 'Failed to create hire settings' }, { status: 500 });
      }
    }

    const response: StoreApiResponse<{ item: StoreItem }> = {
      success: true,
      data: { item },
      message: 'Item created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error in store items POST:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
