// src/app/api/school/receipts/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { cookies } from 'next/headers';
import { FeeCategory } from '@/types/receipt';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const adminClient = createAdminClient();

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

    // Fetch fee categories for the school
    const { data: categories, error: categoriesError } = await adminClient
      .from('fee_categories')
      .select('id, name, description, is_mandatory, is_recurring, category_type')
      .eq('school_id', profile.school_id)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching fee categories:', categoriesError);
      return NextResponse.json({ success: false, error: 'Failed to fetch fee categories' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { categories: categories || [] } 
    });

  } catch (error) {
    console.error('Error in GET /api/school/receipts/categories:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
