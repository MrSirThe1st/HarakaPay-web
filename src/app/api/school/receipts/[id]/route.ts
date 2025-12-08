// src/app/api/school/receipts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { ReceiptTemplateForm } from '@/types/receipt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authenticate request
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    // Fetch specific receipt template
    const { data: template, error: templateError } = await adminClient
      .from('receipt_templates')
      .select('*')
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .single();

    if (templateError) {
      console.error('Error fetching receipt template:', templateError);
      return NextResponse.json({ success: false, error: 'Receipt template not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { template } 
    });

  } catch (error) {
    console.error('Error in GET /api/school/receipts/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authenticate request
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    const body: ReceiptTemplateForm = await request.json();

    // Validate required fields
    if (!body.template_name || !body.template_type) {
      return NextResponse.json({ success: false, error: 'Template name and type are required' }, { status: 400 });
    }

    // Check if template exists and belongs to school
    const { data: existingTemplate } = await adminClient
      .from('receipt_templates')
      .select('id, template_name')
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .single();

    if (!existingTemplate) {
      return NextResponse.json({ success: false, error: 'Receipt template not found' }, { status: 404 });
    }

    // Check if template name already exists for this school (excluding current template)
    const { data: duplicateTemplate } = await adminClient
      .from('receipt_templates')
      .select('id')
      .eq('school_id', profile.school_id)
      .eq('template_name', body.template_name)
      .eq('is_active', true)
      .neq('id', id)
      .single();

    if (duplicateTemplate) {
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

    // Update receipt template
    const { data: updatedTemplate, error: updateError } = await adminClient
      .from('receipt_templates')
      .update({
        template_name: body.template_name,
        template_type: body.template_type,
        show_logo: body.show_logo,
        logo_position: body.logo_position,
        visible_fields: body.visible_fields,
        style_config: body.style_config,
      })
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating receipt template:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update receipt template' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { template: updatedTemplate },
      message: 'Receipt template updated successfully'
    });

  } catch (error) {
    console.error('Error in PUT /api/school/receipts/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authenticate request
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    // Check if template exists and belongs to school
    const { data: existingTemplate } = await adminClient
      .from('receipt_templates')
      .select('id, is_default')
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .single();

    if (!existingTemplate) {
      return NextResponse.json({ success: false, error: 'Receipt template not found' }, { status: 404 });
    }

    // Prevent deletion of default template
    if (existingTemplate.is_default) {
      return NextResponse.json({ success: false, error: 'Cannot delete default template' }, { status: 400 });
    }

    // Soft delete by setting is_active to false
    const { error: deleteError } = await adminClient
      .from('receipt_templates')
      .update({ is_active: false })
      .eq('id', id)
      .eq('school_id', profile.school_id);

    if (deleteError) {
      console.error('Error deleting receipt template:', deleteError);
      return NextResponse.json({ success: false, error: 'Failed to delete receipt template' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Receipt template deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/school/receipts/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
