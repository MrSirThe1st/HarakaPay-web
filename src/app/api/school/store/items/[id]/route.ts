// src/app/api/school/store/items/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StoreItem, StoreApiResponse } from '@/types/store';

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
      `)
      .eq('id', params.id);

    if (['school_admin', 'school_staff'].includes(profile.role)) {
      // School staff can see all items from their school
      query = query.eq('school_id', profile.school_id);
    } else if (profile.role === 'parent') {
      // Parents can only see available items
      query = query.eq('is_available', true);
    } else {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: item, error: itemError } = await query.single();

    if (itemError || !item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    const response: StoreApiResponse<{ item: StoreItem }> = {
      success: true,
      data: { item },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in store items GET by ID:', error);
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

    // Check if item exists and belongs to school
    const { data: existingItem, error: fetchError } = await supabase
      .from('store_items')
      .select('*')
      .eq('id', params.id)
      .eq('school_id', profile.school_id)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
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

    // Update item
    const { data: item, error: updateError } = await supabase
      .from('store_items')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        category_id: categoryId,
        item_type: itemType,
        price: price,
        stock_quantity: stockQuantity,
        low_stock_threshold: lowStockThreshold || 10,
        is_available: isAvailable !== false,
        images: images || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('school_id', profile.school_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating store item:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
    }

    // Update hire settings if item type is hire
    if (itemType === 'hire' && hireSettings) {
      const { data: existingHireSettings } = await supabase
        .from('hire_settings')
        .select('id')
        .eq('item_id', params.id)
        .single();

      if (existingHireSettings) {
        // Update existing hire settings
        const { error: hireSettingsError } = await supabase
          .from('hire_settings')
          .update({
            duration_type: hireSettings.durationType,
            min_duration_days: hireSettings.minDurationDays,
            max_duration_days: hireSettings.maxDurationDays,
            deposit_amount: hireSettings.depositAmount || null,
            late_fee_per_day: hireSettings.lateFeePerDay || null,
            updated_at: new Date().toISOString(),
          })
          .eq('item_id', params.id);

        if (hireSettingsError) {
          console.error('Error updating hire settings:', hireSettingsError);
          return NextResponse.json({ success: false, error: 'Failed to update hire settings' }, { status: 500 });
        }
      } else {
        // Create new hire settings
        const { error: hireSettingsError } = await supabase
          .from('hire_settings')
          .insert({
            item_id: params.id,
            duration_type: hireSettings.durationType,
            min_duration_days: hireSettings.minDurationDays,
            max_duration_days: hireSettings.maxDurationDays,
            deposit_amount: hireSettings.depositAmount || null,
            late_fee_per_day: hireSettings.lateFeePerDay || null,
          });

        if (hireSettingsError) {
          console.error('Error creating hire settings:', hireSettingsError);
          return NextResponse.json({ success: false, error: 'Failed to create hire settings' }, { status: 500 });
        }
      }
    } else if (existingItem.item_type === 'hire' && itemType === 'sale') {
      // Remove hire settings if changing from hire to sale
      await supabase
        .from('hire_settings')
        .delete()
        .eq('item_id', params.id);
    }

    const response: StoreApiResponse<{ item: StoreItem }> = {
      success: true,
      data: { item },
      message: 'Item updated successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in store items PUT:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Check if item exists and belongs to school
    const { data: existingItem, error: fetchError } = await supabase
      .from('store_items')
      .select('*')
      .eq('id', params.id)
      .eq('school_id', profile.school_id)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    // Check if item has associated orders
    const { data: ordersCount, error: ordersError } = await supabase
      .from('store_order_items')
      .select('id', { count: 'exact' })
      .eq('item_id', params.id);

    if (ordersError) {
      console.error('Error checking item orders:', ordersError);
      return NextResponse.json({ success: false, error: 'Failed to check item orders' }, { status: 500 });
    }

    if (ordersCount && ordersCount.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete item with associated orders. Please cancel or complete the orders first.' 
      }, { status: 400 });
    }

    // Delete hire settings first (if exists)
    await supabase
      .from('hire_settings')
      .delete()
      .eq('item_id', params.id);

    // Delete item
    const { error: deleteError } = await supabase
      .from('store_items')
      .delete()
      .eq('id', params.id)
      .eq('school_id', profile.school_id);

    if (deleteError) {
      console.error('Error deleting store item:', deleteError);
      return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
    }

    const response: StoreApiResponse<null> = {
      success: true,
      data: null,
      message: 'Item deleted successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in store items DELETE:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
