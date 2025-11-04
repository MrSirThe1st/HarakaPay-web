// src/app/api/notifications/templates/route.js
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { cookies } from 'next/headers';
import templateService from '@/services/templateService';

// GET - Fetch all templates for a school
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active')
      .eq('user_id', user.id)
      .single();

    if (!profile || !profile.is_active) {
      return NextResponse.json({ error: 'Profile not found or inactive' }, { status: 403 });
    }

    const allowedRoles = ['school_admin', 'school_staff'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({
        error: 'Insufficient permissions'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const result = await templateService.getTemplatesBySchool(
      profile.school_id,
      { category, activeOnly }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      templates: result.templates
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new template
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active')
      .eq('user_id', user.id)
      .single();

    if (!profile || !profile.is_active) {
      return NextResponse.json({ error: 'Profile not found or inactive' }, { status: 403 });
    }

    const allowedRoles = ['school_admin', 'school_staff'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({
        error: 'Insufficient permissions'
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, subject, body: templateBody, category, variables, isActive } = body;

    if (!name || !templateBody) {
      return NextResponse.json({
        error: 'Name and body are required'
      }, { status: 400 });
    }

    // Validate template
    const validation = templateService.validateTemplate({
      name,
      subject,
      body: templateBody
    });

    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Validation failed',
        errors: validation.errors
      }, { status: 400 });
    }

    const result = await templateService.createTemplate({
      schoolId: profile.school_id,
      name,
      subject,
      body: templateBody,
      category: category || 'general',
      variables: variables || [],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: user.id
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      template: result.template
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
