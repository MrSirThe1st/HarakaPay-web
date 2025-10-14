// src/app/api/school/store/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StoreCategory, StoreApiResponse } from '@/types/store';

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
    const { name, description, isActive } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    // Check if category exists and belongs to the school
    const { data: existingCategory, error: fetchError } = await supabase
      .from('store_categories')
      .select('*')
      .eq('id', params.id)
      .eq('school_id', profile.school_id)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Check if another category with same name already exists (excluding current one)
    const { data: duplicateCategory } = await supabase
      .from('store_categories')
      .select('id')
      .eq('school_id', profile.school_id)
      .eq('name', name.trim())
      .neq('id', params.id)
      .single();

    if (duplicateCategory) {
      return NextResponse.json({ success: false, error: 'Category with this name already exists' }, { status: 400 });
    }

    // Update category
    const { data: category, error: updateError } = await supabase
      .from('store_categories')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('school_id', profile.school_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating store category:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
    }

    const response: StoreApiResponse<{ category: StoreCategory }> = {
      success: true,
      data: { category },
      message: 'Category updated successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in store categories PUT:', error);
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

    // Check if category exists and belongs to the school
    const { data: existingCategory, error: fetchError } = await supabase
      .from('store_categories')
      .select('*')
      .eq('id', params.id)
      .eq('school_id', profile.school_id)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Check if category has associated items
    const { data: itemsCount, error: itemsError } = await supabase
      .from('store_items')
      .select('id', { count: 'exact' })
      .eq('category_id', params.id);

    if (itemsError) {
      console.error('Error checking category items:', itemsError);
      return NextResponse.json({ success: false, error: 'Failed to check category items' }, { status: 500 });
    }

    if (itemsCount && itemsCount.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete category with associated items. Please move or delete the items first.' 
      }, { status: 400 });
    }

    // Delete category
    const { error: deleteError } = await supabase
      .from('store_categories')
      .delete()
      .eq('id', params.id)
      .eq('school_id', profile.school_id);

    if (deleteError) {
      console.error('Error deleting store category:', deleteError);
      return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
    }

    const response: StoreApiResponse<null> = {
      success: true,
      data: null,
      message: 'Category deleted successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in store categories DELETE:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
