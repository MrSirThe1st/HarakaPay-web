// @ts-nocheck
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
    const academicYearId = searchParams.get('academic_year_id');
    const gradeLevel = searchParams.get('grade_level');
    const programType = searchParams.get('program_type');

    // Build query for fee templates
    let query = adminClient
      .from('fee_structures')
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

    interface FeeTemplate {
      status: string;
      [key: string]: unknown;
    }
    const typedFeeTemplates = feeTemplates as FeeTemplate[] | null;

    if (feeTemplatesError) {
      console.error('Error fetching fee templates:', feeTemplatesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch fee templates' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalTemplates = count || 0;
    const publishedTemplates = typedFeeTemplates?.filter(t => t.status === 'published').length || 0;
    const draftTemplates = typedFeeTemplates?.filter(t => t.status === 'draft').length || 0;

    return NextResponse.json({
      success: true,
      data: {
        feeTemplates: typedFeeTemplates || [],
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
      .from('fee_structures')
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
        .from('fee_structures')
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
        .from('fee_structures')
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
    interface Category {
      amount?: number;
      [key: string]: unknown;
    }
    const categoryTotal = categories.reduce((sum: number, cat: Category) => sum + (cat.amount || 0), 0);
    if (Math.abs(categoryTotal - total_amount) > 0.01) {
      return NextResponse.json(
        { success: false, error: 'Category amounts must sum to total amount' }, 
        { status: 400 }
      );
    }

    // Create fee template
    const { data: newFeeTemplate, error: createError } = await adminClient
      .from('fee_structures')
      .insert({
        name,
        academic_year_id,
        grade_level,
        program_type,
        total_amount,
        status,
        school_id: profile.school_id
      } as any)
      .select('*')
      .single();

    interface NewFeeTemplate {
      id: string;
      [key: string]: unknown;
    }
    const typedNewFeeTemplate = newFeeTemplate as NewFeeTemplate | null;

    if (createError || !typedNewFeeTemplate) {
      console.error('Fee template creation error:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create fee template' },
        { status: 500 }
      );
    }

    // Create fee template categories
    const templateCategories = categories.map((cat: { category_id: string; amount: number }) => ({
      template_id: typedNewFeeTemplate.id,
      category_id: cat.category_id,
      amount: cat.amount
    }));

    const { error: categoriesError } = await adminClient
      .from('fee_structure_items')
      .insert(templateCategories as any);

    if (categoriesError) {
      console.error('Fee template categories creation error:', categoriesError);
      // Clean up the template if categories fail
      await adminClient
        .from('fee_structures')
        .delete()
        .eq('id', typedNewFeeTemplate.id);
      
      return NextResponse.json(
        { success: false, error: 'Failed to create fee template categories' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        feeTemplate: typedNewFeeTemplate
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
