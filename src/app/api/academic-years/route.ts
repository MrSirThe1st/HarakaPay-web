import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

type AcademicYearInsert = Database['public']['Tables']['academic_years']['Insert'];

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to check school access
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has permission to view academic years
    if (!['school_admin', 'school_staff'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school associated with user' }, { status: 400 });
    }

    // Get academic years for this school
    const { data: academicYears, error: yearsError } = await supabase
      .from('academic_years')
      .select('*')
      .eq('school_id', profile.school_id)
      .order('start_date', { ascending: false });

    if (yearsError) {
      console.error('Error fetching academic years:', yearsError);
      return NextResponse.json({ error: 'Failed to fetch academic years' }, { status: 500 });
    }

    return NextResponse.json({ academic_years: academicYears || [] });

  } catch (error) {
    console.error('Error in academic years get API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to check school access
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has permission to create academic years
    if (!['school_admin', 'school_staff'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school associated with user' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { name, start_date, end_date } = body;

    // Validate required fields
    if (!name || !start_date || !end_date) {
      return NextResponse.json({
        error: 'Name, start date, and end date are required'
      }, { status: 400 });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({
        error: 'Invalid date format'
      }, { status: 400 });
    }

    if (endDate <= startDate) {
      return NextResponse.json({
        error: 'End date must be after start date'
      }, { status: 400 });
    }

    // Check if there's already an active academic year
    const { data: existingActiveYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('school_id', profile.school_id)
      .eq('is_active', true)
      .single();

    // Prepare insert data
    const insertData: AcademicYearInsert = {
      school_id: profile.school_id,
      name,
      start_date,
      end_date,
      is_active: !existingActiveYear, // Set as active if no other active year exists
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Create academic year
    const { data: newYear, error: createError } = await supabase
      .from('academic_years')
      .insert(insertData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating academic year:', createError);
      return NextResponse.json({ error: 'Failed to create academic year' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      academic_year: newYear
    });

  } catch (error) {
    console.error('Error in academic year create API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}