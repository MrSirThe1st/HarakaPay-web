// src/app/api/school/receipts/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { FeeCategory } from '@/types/receipt';

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

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
