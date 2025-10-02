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

    // Get URL parameters for filtering
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    const academicYearId = searchParams.get('academic_year_id');
    const gradeLevel = searchParams.get('grade_level');
    const programType = searchParams.get('program_type');

    // Build query for fee templates
    let query = adminClient
      .from('fee_templates')
      .select(`
        *,
        academic_years(name),
        fee_template_categories(
          amount,
          fee_categories(name, description, is_mandatory, is_recurring)
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
    if (programType) {
      query = query.eq('program_type', programType);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('id', { ascending: false });

    const { data: feeTemplates, error: feeTemplatesError, count } = await query;

    if (feeTemplatesError) {
      console.error('Error fetching fee templates:', feeTemplatesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch fee templates' }, 
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalTemplates = count || 0;
    const publishedTemplates = feeTemplates?.filter(t => t.status === 'published').length || 0;
    const draftTemplates = feeTemplates?.filter(t => t.status === 'draft').length || 0;

    return NextResponse.json({
      success: true,
      data: {
        feeTemplates: feeTemplates || [],
        pagination: {
          page,
          limit,
          total: totalTemplates,
          pages: Math.ceil(totalTemplates / limit)
        },
        stats: {
          total: totalTemplates,
          published: publishedTemplates,
          draft: draftTemplates
        }
      }
    });

  } catch (error) {
    console.error('Fee templates API error:', error);
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

    // Only school admins can create fee templates
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can create fee templates' }, 
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
      status = 'draft',
      categories = []
    } = body;

    // Validate required fields
    if (!name || !academic_year_id || !grade_level || !program_type || !total_amount) {
      return NextResponse.json(
        { success: false, error: 'Name, academic year, grade level, program type, and total amount are required' }, 
        { status: 400 }
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

    // Check for duplicate grade-level assignment in the same academic year
    const { data: existingTemplate } = await adminClient
      .from('fee_templates')
      .select('id, name, grade_level, program_type')
      .eq('academic_year_id', academic_year_id)
      .eq('grade_level', grade_level)
      .eq('program_type', program_type)
      .single();

    if (existingTemplate) {
      return NextResponse.json(
        { 
          success: false, 
          error: `A fee structure already exists for ${grade_level} (${program_type}) in this academic year. Please edit the existing structure or choose a different grade/program combination.` 
        }, 
        { status: 409 }
      );
    }

    // If creating an "All Programs" template, check if any grade-specific templates exist
    if (program_type === 'all') {
      const { data: gradeSpecificTemplates } = await adminClient
        .from('fee_templates')
        .select('id, grade_level, program_type')
        .eq('academic_year_id', academic_year_id)
        .neq('program_type', 'all');

      if (gradeSpecificTemplates && gradeSpecificTemplates.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Cannot create an "All Programs" template because grade-specific templates already exist for this academic year. Please create grade-specific templates instead.` 
          }, 
          { status: 409 }
        );
      }
    } else {
      // If creating a grade-specific template, check if an "All Programs" template exists
      const { data: allProgramsTemplate } = await adminClient
        .from('fee_templates')
        .select('id, name')
        .eq('academic_year_id', academic_year_id)
        .eq('program_type', 'all')
        .single();

      if (allProgramsTemplate) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Cannot create a grade-specific template because an "All Programs" template already exists for this academic year. Please edit the existing template or delete it first.` 
          }, 
          { status: 409 }
        );
      }
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

    // Create fee template
    const { data: newFeeTemplate, error: createError } = await adminClient
      .from('fee_templates')
      .insert({
        name,
        academic_year_id,
        grade_level,
        program_type,
        total_amount,
        status,
        school_id: profile.school_id
      })
      .select('*')
      .single();

    if (createError) {
      console.error('Fee template creation error:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create fee template' }, 
        { status: 500 }
      );
    }

    // Create fee template categories
    const templateCategories = categories.map((cat: any) => ({
      template_id: newFeeTemplate.id,
      category_id: cat.category_id,
      amount: cat.amount
    }));

    const { error: categoriesError } = await adminClient
      .from('fee_template_categories')
      .insert(templateCategories);

    if (categoriesError) {
      console.error('Fee template categories creation error:', categoriesError);
      // Clean up the template if categories fail
      await adminClient
        .from('fee_templates')
        .delete()
        .eq('id', newFeeTemplate.id);
      
      return NextResponse.json(
        { success: false, error: 'Failed to create fee template categories' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        feeTemplate: newFeeTemplate
      },
      message: 'Fee template created successfully'
    });

  } catch (error) {
    console.error('Create fee template error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
