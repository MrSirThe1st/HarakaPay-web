// src/app/api/school/fees/structures/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { Database } from '@/types/supabase';

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

    // Only school admins can view fee structures
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can view fee structures' }, 
        { status: 403 }
      );
    }

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: 'School not found' }, 
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const academicYearId = searchParams.get('academic_year_id');
    const gradeLevel = searchParams.get('grade_level');
    const appliesTo = searchParams.get('applies_to');

    const offset = (page - 1) * limit;

    // Build query for fee structures
    let query = adminClient
      .from('fee_structures')
      .select(`
        *,
        academic_years(name),
        fee_structure_items(
          id,
          amount,
          is_mandatory,
          is_recurring,
          payment_modes,
          fee_categories(name, description, is_mandatory, is_recurring, category_type)
        )
      `, { count: 'exact' })
      .eq('school_id', profile.school_id);

    // Apply filters
    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }
    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel);
    }
    if (appliesTo) {
      query = query.eq('applies_to', appliesTo);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('id', { ascending: false });

    const { data: feeStructures, error: feeStructuresError, count } = await query;

    if (feeStructuresError) {
      console.error('Error fetching fee structures:', feeStructuresError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch fee structures' }, 
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalStructures = count || 0;
    const activeStructures = feeStructures?.filter(s => s.is_active).length || 0;
    const inactiveStructures = feeStructures?.filter(s => !s.is_active).length || 0;

    return NextResponse.json({
      success: true,
      data: {
        feeStructures: feeStructures || [],
        pagination: {
          page,
          limit,
          total: totalStructures,
          pages: Math.ceil(totalStructures / limit)
        },
        stats: {
          total: totalStructures,
          active: activeStructures,
          inactive: inactiveStructures
        }
      }
    });

  } catch (error) {
    console.error('Fee structures API error:', error);
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

    // Only school admins can create fee structures
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can create fee structures' }, 
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
      academic_year_id,
      grade_level,
      applies_to = 'school',
      total_amount,
      is_active = true,
      is_published = false,
      items = []
    } = body;

    // Validate required fields
    if (!name || !academic_year_id || !grade_level || !total_amount) {
      return NextResponse.json(
        { success: false, error: 'Name, academic year, grade level, and total amount are required' }, 
        { status: 400 }
      );
    }

    // Skip academic year validation - we trust the data from the wizard
    console.log('Creating fee structure with academic_year_id:', academic_year_id);

    // Check for duplicate grade-level assignment in the same academic year
    const { data: existingStructure } = await adminClient
      .from('fee_structures')
      .select('id, name, grade_level, applies_to')
      .eq('academic_year_id', academic_year_id)
      .eq('grade_level', grade_level)
      .eq('applies_to', applies_to)
      .single();

    if (existingStructure) {
      return NextResponse.json(
        { 
          success: false, 
          error: `A fee structure already exists for ${grade_level} (${applies_to}) in this academic year. Please edit the existing structure or choose a different grade/scope combination.` 
        }, 
        { status: 409 }
      );
    }

    // Validate items
    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one fee item is required' }, 
        { status: 400 }
      );
    }

    // Validate item amounts sum to total
    const itemTotal = items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
    if (Math.abs(itemTotal - total_amount) > 0.01) {
      return NextResponse.json(
        { success: false, error: 'Item amounts must sum to total amount' }, 
        { status: 400 }
      );
    }

    // Create fee structure
    const { data: newFeeStructure, error: createError } = await adminClient
      .from('fee_structures')
      .insert({
        name,
        academic_year_id,
        grade_level,
        applies_to,
        total_amount,
        is_active,
        is_published,
        school_id: profile.school_id,
        created_by: profile.user_id || null  // Use profile.user_id or null if not available
      })
      .select('*')
      .single();

    if (createError) {
      console.error('Fee structure creation error:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create fee structure' }, 
        { status: 500 }
      );
    }

    // Create fee structure items
    const structureItems = items.map((item: any) => ({
      structure_id: newFeeStructure.id,
      category_id: item.category_id,
      amount: item.amount,
      is_mandatory: item.is_mandatory || false,
      is_recurring: item.is_recurring || true,
      payment_modes: item.payment_modes || ['per-term']
    }));

    const { error: itemsError } = await adminClient
      .from('fee_structure_items')
      .insert(structureItems);

    if (itemsError) {
      console.error('Fee structure items creation error:', itemsError);
      return NextResponse.json(
        { success: false, error: 'Failed to create fee structure items' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        feeStructure: newFeeStructure
      },
      message: 'Fee structure created successfully'
    });

  } catch (error) {
    console.error('Create fee structure error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
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

    // Only school admins can delete fee structures
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can delete fee structures' },
        { status: 403 }
      );
    }

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Get structure ID from query params
    const { searchParams } = new URL(req.url);
    const structureId = searchParams.get('id');

    if (!structureId) {
      return NextResponse.json(
        { success: false, error: 'Structure ID is required' },
        { status: 400 }
      );
    }

    // Verify structure belongs to school
    const { data: structure } = await adminClient
      .from('fee_structures')
      .select('id, school_id')
      .eq('id', structureId)
      .eq('school_id', profile.school_id)
      .single();

    if (!structure) {
      return NextResponse.json(
        { success: false, error: 'Fee structure not found' },
        { status: 404 }
      );
    }

    // Delete related records in order (due to foreign key constraints)
    console.log('🗑️ Deleting fee structure:', structureId);

    // 1. Delete student fee assignments
    const { error: assignmentsError } = await adminClient
      .from('student_fee_assignments')
      .delete()
      .eq('structure_id', structureId);

    if (assignmentsError) {
      console.error('Error deleting student assignments:', assignmentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete student assignments' },
        { status: 500 }
      );
    }

    // 2. Delete payment plans
    const { error: plansError } = await adminClient
      .from('payment_plans')
      .delete()
      .eq('structure_id', structureId);

    if (plansError) {
      console.error('Error deleting payment plans:', plansError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete payment plans' },
        { status: 500 }
      );
    }

    // 3. Delete fee structure items
    const { error: itemsError } = await adminClient
      .from('fee_structure_items')
      .delete()
      .eq('structure_id', structureId);

    if (itemsError) {
      console.error('Error deleting fee structure items:', itemsError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete fee structure items' },
        { status: 500 }
      );
    }

    // 4. Finally, delete the fee structure itself
    const { error: deleteError } = await adminClient
      .from('fee_structures')
      .delete()
      .eq('id', structureId);

    if (deleteError) {
      console.error('Error deleting fee structure:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete fee structure' },
        { status: 500 }
      );
    }

    console.log('✅ Fee structure deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Fee structure deleted successfully'
    });

  } catch (error) {
    console.error('Delete fee structure error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
