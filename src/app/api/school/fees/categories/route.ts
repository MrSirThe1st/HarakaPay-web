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

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    // Get URL parameters for filtering
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query for fee categories
    let query = adminClient
      .from('fee_categories')
      .select('*', { count: 'exact' })
      .eq('school_id', profile.school_id);

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('id', { ascending: false });

    const { data: feeCategories, error: feeCategoriesError, count } = await query;

    if (feeCategoriesError) {
      console.error('Error fetching fee categories:', feeCategoriesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch fee categories' },
        { status: 500 }
      );
    }

    const typedFeeCategories = feeCategories as { is_mandatory: boolean; is_recurring: boolean }[] | null;

    // Calculate statistics
    const totalCategories = count || 0;
    const mandatoryCategories = typedFeeCategories?.filter(c => c.is_mandatory).length || 0;
    const recurringCategories = typedFeeCategories?.filter(c => c.is_recurring).length || 0;

    return NextResponse.json({
      success: true,
      data: {
        feeCategories: typedFeeCategories || [],
        pagination: {
          page,
          limit,
          total: totalCategories,
          pages: Math.ceil(totalCategories / limit)
        },
        stats: {
          total: totalCategories,
          mandatory: mandatoryCategories,
          recurring: recurringCategories
        }
      }
    });

  } catch (error) {
    console.error('Fee categories API error:', error);
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

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    const body = await req.json();
    const { 
      name, 
      description, 
      is_mandatory = false,
      is_recurring = false,
      supports_one_time = true,
      category_type = 'custom'
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' }, 
        { status: 400 }
      );
    }

    // Check if category name already exists for this school
    const { data: existingCategory } = await adminClient
      .from('fee_categories')
      .select('id')
      .eq('school_id', profile.school_id)
      .eq('name', name)
      .single();

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'A fee category with this name already exists' }, 
        { status: 409 }
      );
    }

    // Create fee category
    const { data: newFeeCategory, error: createError } = await adminClient
      .from('fee_categories')
      .insert({
        name,
        description: description || '',
        is_mandatory,
        is_recurring,
        supports_one_time,
        category_type,
        school_id: profile.school_id
      } as any)
      .select('*')
      .single();

    if (createError) {
      console.error('Fee category creation error:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create fee category' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        feeCategory: newFeeCategory
      },
      message: 'Fee category created successfully'
    });

  } catch (error) {
    console.error('Create fee category error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
