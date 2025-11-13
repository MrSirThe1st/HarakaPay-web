// src/app/api/school/fees/structures/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { Database } from '@/types/supabase';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: structureId } = await params;
    const supabase = createRouteHandlerClient<Database>({ cookies: async () => await cookies() });
    
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

    // Fetch the fee structure with all related data
    const { data: feeStructure, error: feeStructureError } = await adminClient
      .from('fee_structures')
      .select(`
        *,
        academic_years(
          id,
          name,
          start_date,
          end_date,
          term_structure,
          is_active
        ),
        fee_structure_items(
          id,
          amount,
          is_mandatory,
          is_recurring,
          payment_modes,
          fee_categories(
            id,
            name,
            description,
            is_mandatory,
            is_recurring,
            category_type
          )
        ),
        payment_plans(
          id,
          type,
          discount_percentage,
          currency,
          installments,
          is_active,
          created_at
        )
      `)
      .eq('id', structureId)
      .eq('school_id', profile.school_id)
      .single();

    if (feeStructureError) {
      console.error('Error fetching fee structure:', feeStructureError);
      if (feeStructureError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Fee structure not found' }, 
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch fee structure' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        feeStructure
      }
    });

  } catch (error) {
    console.error('Fee structure API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: structureId } = await params;
    const supabase = createRouteHandlerClient<Database>({ cookies: async () => await cookies() });
    
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

    // Only school admins can update fee structures
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can update fee structures' }, 
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

    // Update the fee structure
    const { data: updatedStructure, error: updateError } = await adminClient
      .from('fee_structures')
      .update({
        name: body.name,
        grade_level: body.grade_level,
        applies_to: body.applies_to,
        total_amount: body.total_amount,
        is_active: body.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', structureId)
      .eq('school_id', profile.school_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating fee structure:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update fee structure' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        feeStructure: updatedStructure
      }
    });

  } catch (error) {
    console.error('Fee structure update API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: structureId } = await params;
    const supabase = createRouteHandlerClient<Database>({ cookies: async () => await cookies() });
    
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

    // Delete the fee structure (cascade will handle related records)
    const { error: deleteError } = await adminClient
      .from('fee_structures')
      .delete()
      .eq('id', structureId)
      .eq('school_id', profile.school_id);

    if (deleteError) {
      console.error('Error deleting fee structure:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete fee structure' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fee structure deleted successfully'
    });

  } catch (error) {
    console.error('Fee structure delete API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
