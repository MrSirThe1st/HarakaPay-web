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

    // Only school admins and staff can view academic years
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

    // Build query for academic years
    let query = adminClient
      .from('academic_years')
      .select('*', { count: 'exact' })
      .eq('school_id', profile.school_id);

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('start_date', { ascending: false });

    const { data: academicYears, error: academicYearsError, count } = await query;

    if (academicYearsError) {
      console.error('Error fetching academic years:', academicYearsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch academic years' }, 
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalYears = count || 0;
    const activeYears = academicYears?.filter(y => y.is_active).length || 0;

    return NextResponse.json({
      success: true,
      data: {
        academicYears: academicYears || [],
        pagination: {
          page,
          limit,
          total: totalYears,
          pages: Math.ceil(totalYears / limit)
        },
        stats: {
          total: totalYears,
          active: activeYears
        }
      }
    });

  } catch (error) {
    console.error('Academic years API error:', error);
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

    // Only school admins can create academic years
    if (profile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only school admins can create academic years' }, 
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
      start_date, 
      end_date, 
      term_structure,
      is_active = false
    } = body;

    // Validate required fields
    if (!name || !start_date || !end_date || !term_structure) {
      return NextResponse.json(
        { success: false, error: 'Name, start date, end date, and term structure are required' }, 
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date must be before end date' }, 
        { status: 400 }
      );
    }

    // If setting as active, deactivate other years
    if (is_active) {
      await adminClient
        .from('academic_years')
        .update({ is_active: false })
        .eq('school_id', profile.school_id);
    }

    // Create academic year
    const { data: newAcademicYear, error: createError } = await adminClient
      .from('academic_years')
      .insert({
        name,
        start_date,
        end_date,
        term_structure,
        is_active,
        school_id: profile.school_id
      })
      .select('*')
      .single();

    if (createError) {
      console.error('Academic year creation error:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create academic year' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        academicYear: newAcademicYear
      },
      message: 'Academic year created successfully'
    });

  } catch (error) {
    console.error('Create academic year error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
