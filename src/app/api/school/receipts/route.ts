// src/app/api/school/receipts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { ReceiptTemplate, ReceiptTemplateForm } from '@/types/receipt';

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

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    // Fetch receipt templates for the school
    const { data: templates, error: templatesError } = await adminClient
      .from('receipt_templates')
      .select('*')
      .eq('school_id', profile.school_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (templatesError) {
      console.error('Error fetching receipt templates:', templatesError);
      return NextResponse.json({ success: false, error: 'Failed to fetch receipt templates' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { templates: templates || [] } 
    });

  } catch (error) {
    console.error('Error in GET /api/school/receipts:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    const body: ReceiptTemplateForm = await request.json();

    // Validate required fields
    if (!body.template_name || !body.template_type) {
      return NextResponse.json({ success: false, error: 'Template name and type are required' }, { status: 400 });
    }

    // Check if template name already exists for this school
    const { data: existingTemplate } = await adminClient
      .from('receipt_templates')
      .select('id')
      .eq('school_id', profile.school_id)
      .eq('template_name', body.template_name)
      .eq('is_active', true)
      .single();

    if (existingTemplate) {
      return NextResponse.json({ success: false, error: 'Template name already exists' }, { status: 400 });
    }

    // Validate template_type exists in fee_categories
    const { data: categoryExists } = await adminClient
      .from('fee_categories')
      .select('id')
      .eq('school_id', profile.school_id)
      .eq('name', body.template_type)
      .eq('is_active', true)
      .single();

    if (!categoryExists) {
      return NextResponse.json({ success: false, error: 'Fee category does not exist' }, { status: 400 });
    }

    // Create new receipt template
    const { data: newTemplate, error: createError } = await adminClient
      .from('receipt_templates')
      .insert({
        school_id: profile.school_id,
        template_name: body.template_name,
        template_type: body.template_type,
        show_logo: body.show_logo,
        logo_position: body.logo_position,
        visible_fields: body.visible_fields,
        style_config: body.style_config,
        is_default: false,
        is_active: true,
        created_by: profile.user_id || null,  // Use profile.user_id or null if not available
      } as never)
      .select()
      .single();

    if (createError) {
      console.error('Error creating receipt template:', createError);
      return NextResponse.json({ success: false, error: 'Failed to create receipt template' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { template: newTemplate },
      message: 'Receipt template created successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/school/receipts:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
