// src/app/api/school/store/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { StoreCategory, StoreApiResponse, StorePaginationData, StoreStatsData } from '@/types/store';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Get categories with pagination
    const { data: categories, error: categoriesError, count } = await adminClient
      .from('store_categories')
      .select('*', { count: 'exact' })
      .eq('school_id', profile.school_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (categoriesError) {
      console.error('Error fetching store categories:', categoriesError);
      return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
    }

    // Get stats
    const { data: statsData } = await adminClient
      .from('store_categories')
      .select('is_active')
      .eq('school_id', profile.school_id);

    const stats: StoreStatsData = {
      total: count || 0,
      active: statsData?.filter(c => c.is_active).length || 0,
      inactive: statsData?.filter(c => !c.is_active).length || 0,
    };

    const pagination: StorePaginationData = {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    };

    const response: StoreApiResponse<{
      categories: StoreCategory[];
      pagination: StorePaginationData;
      stats: StoreStatsData;
    }> = {
      success: true,
      data: {
        categories: categories || [],
        pagination,
        stats,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in store categories GET:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    // Parse request body
    const body = await request.json();
    const { name, description, isActive = true } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    // Check if category with same name already exists
    const { data: existingCategory } = await adminClient
      .from('store_categories')
      .select('id')
      .eq('school_id', profile.school_id)
      .eq('name', name.trim())
      .single();

    if (existingCategory) {
      return NextResponse.json({ success: false, error: 'Category with this name already exists' }, { status: 400 });
    }

    // Create category
    const { data: category, error: createError } = await adminClient
      .from('store_categories')
      .insert({
        school_id: profile.school_id,
        name: name.trim(),
        description: description?.trim() || null,
        is_active: isActive,
      } as any)
      .select()
      .single();

    if (createError) {
      console.error('Error creating store category:', createError);
      return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
    }

    const response: StoreApiResponse<{ category: StoreCategory }> = {
      success: true,
      data: { category },
      message: 'Category created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error in store categories POST:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
