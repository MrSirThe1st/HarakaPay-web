import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    // Only school admins and staff can view fee templates
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

    // Get fee template with categories
    const { data: feeTemplate, error: feeTemplateError } = await adminClient
      .from('fee_templates')
      .select(`
        *,
        academic_years(name),
        fee_template_categories(
          amount,
          fee_categories(name, description, is_mandatory, is_recurring)
        )
      `)
      .eq('id', params.id)
      .eq('school_id', profile.school_id)
      .single();

    if (feeTemplateError) {
      console.error('Error fetching fee template:', feeTemplateError);
      return NextResponse.json(
        { success: false, error: 'Fee template not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        feeTemplate
      }
    });

  } catch (error) {
    console.error('Fee template API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    // Only school admins can update fee templates
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can update fee templates' }, 
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
      program_type,
      total_amount,
      status,
      categories = []
    } = body;

    // Validate required fields
    if (!name || !academic_year_id || !grade_level || !program_type || !total_amount) {
      return NextResponse.json(
        { success: false, error: 'Name, academic year, grade level, program type, and total amount are required' }, 
        { status: 400 }
      );
    }

    // Check if template exists and belongs to school
    const { data: existingTemplate } = await adminClient
      .from('fee_templates')
      .select('id')
      .eq('id', params.id)
      .eq('school_id', profile.school_id)
      .single();

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Fee template not found' }, 
        { status: 404 }
      );
    }

    // Validate academic year exists and belongs to school
    const { data: academicYear } = await adminClient
      .from('academic_years')
      .select('id')
      .eq('id', academic_year_id)
      .eq('school_id', profile.school_id)
      .single();

    if (!academicYear) {
      return NextResponse.json(
        { success: false, error: 'Academic year not found' }, 
        { status: 404 }
      );
    }

    // Validate categories
    if (categories.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one fee category is required' }, 
        { status: 400 }
      );
    }

    // Validate category amounts sum to total
    const categoryTotal = categories.reduce((sum: number, cat: any) => sum + (cat.amount || 0), 0);
    if (Math.abs(categoryTotal - total_amount) > 0.01) {
      return NextResponse.json(
        { success: false, error: 'Category amounts must sum to total amount' }, 
        { status: 400 }
      );
    }

    // Update fee template
    const { data: updatedTemplate, error: updateError } = await adminClient
      .from('fee_templates')
      .update({
        name,
        academic_year_id,
        grade_level,
        program_type,
        total_amount,
        status: status || 'draft'
      })
      .eq('id', params.id)
      .eq('school_id', profile.school_id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Fee template update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update fee template' }, 
        { status: 500 }
      );
    }

    // Update fee template categories
    // First, delete existing categories
    await adminClient
      .from('fee_template_categories')
      .delete()
      .eq('template_id', params.id);

    // Then, insert new categories
    const templateCategories = categories.map((cat: any) => ({
      template_id: params.id,
      category_id: cat.category_id,
      amount: cat.amount
    }));

    const { error: categoriesError } = await adminClient
      .from('fee_template_categories')
      .insert(templateCategories);

    if (categoriesError) {
      console.error('Fee template categories update error:', categoriesError);
      return NextResponse.json(
        { success: false, error: 'Failed to update fee template categories' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        feeTemplate: updatedTemplate
      },
      message: 'Fee template updated successfully'
    });

  } catch (error) {
    console.error('Update fee template error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

    // Only school admins can delete fee templates
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can delete fee templates' }, 
        { status: 403 }
      );
    }

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: 'School not found' }, 
        { status: 404 }
      );
    }

    // Check if template exists and belongs to school
    const { data: existingTemplate } = await adminClient
      .from('fee_templates')
      .select('id, status')
      .eq('id', params.id)
      .eq('school_id', profile.school_id)
      .single();

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Fee template not found' }, 
        { status: 404 }
      );
    }

    // Check if template is published and has student assignments
    if (existingTemplate.status === 'published') {
      const { data: studentAssignments } = await adminClient
        .from('student_fee_assignments')
        .select('id')
        .eq('template_id', params.id)
        .limit(1);

      if (studentAssignments && studentAssignments.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete published template with student assignments. Please archive it instead.' }, 
          { status: 400 }
        );
      }
    }

    // Delete fee template categories first
    await adminClient
      .from('fee_template_categories')
      .delete()
      .eq('template_id', params.id);

    // Delete fee template
    const { error: deleteError } = await adminClient
      .from('fee_templates')
      .delete()
      .eq('id', params.id)
      .eq('school_id', profile.school_id);

    if (deleteError) {
      console.error('Fee template deletion error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete fee template' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fee template deleted successfully'
    });

  } catch (error) {
    console.error('Delete fee template error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
