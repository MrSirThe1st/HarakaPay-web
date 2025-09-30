import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
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

    // Only school admins and staff can view fee categories
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

    // Calculate statistics
    const totalCategories = count || 0;
    const mandatoryCategories = feeCategories?.filter(c => c.is_mandatory).length || 0;
    const recurringCategories = feeCategories?.filter(c => c.is_recurring).length || 0;

    return NextResponse.json({
      success: true,
      data: {
        feeCategories: feeCategories || [],
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
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
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

    // Only school admins can create fee categories
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can create fee categories' }, 
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
      description, 
      is_mandatory = false,
      is_recurring = false,
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
        category_type,
        school_id: profile.school_id
      })
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
