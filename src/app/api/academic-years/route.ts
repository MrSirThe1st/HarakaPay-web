import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

type AcademicYearInsert = Database['public']['Tables']['academic_years']['Insert'];
type AcademicYearUpdate = Database['public']['Tables']['academic_years']['Update'];

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
    const { name, start_date, end_date, term_structure = 'semester' } = body;

    // Validate required fields
    if (!name || !start_date || !end_date) {
      return NextResponse.json({ 
        error: 'Name, start date, and end date are required' 
      }, { status: 400 });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (startDate >= endDate) {
      return NextResponse.json({ 
        error: 'End date must be after start date' 
      }, { status: 400 });
    }

    // Check for overlapping academic years
    const { data: existingYears, error: checkError } = await supabase
      .from('academic_years')
      .select('id, name, start_date, end_date')
      .eq('school_id', profile.school_id)
      .or(`and(start_date.lte.${end_date},end_date.gte.${start_date})`);

    if (checkError) {
      console.error('Error checking existing academic years:', checkError);
      return NextResponse.json({ error: 'Failed to validate academic year' }, { status: 500 });
    }

    if (existingYears && existingYears.length > 0) {
      return NextResponse.json({ 
        error: 'Academic year overlaps with existing year(s)' 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData: AcademicYearInsert = {
      school_id: profile.school_id,
      name,
      start_date,
      end_date,
      term_structure,
      is_active: true,
    };

    // Create academic year
    const { data: newAcademicYear, error: insertError } = await supabase
      .from('academic_years')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating academic year:', insertError);
      return NextResponse.json({ error: 'Failed to create academic year' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      academic_year: newAcademicYear 
    });

  } catch (error) {
    console.error('Error in academic year creation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    // Get academic years
    const { data: academicYears, error: academicYearsError } = await supabase
      .from('academic_years')
      .select('*')
      .eq('school_id', profile.school_id)
      .order('start_date', { ascending: false });

    if (academicYearsError) {
      console.error('Error fetching academic years:', academicYearsError);
      return NextResponse.json({ error: 'Failed to fetch academic years' }, { status: 500 });
    }

    return NextResponse.json({ academic_years: academicYears });

  } catch (error) {
    console.error('Error in academic years get API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    // Check if user has permission to update academic years
    if (!['school_admin', 'school_staff'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school associated with user' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { id, name, start_date, end_date, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Academic year ID is required' }, { status: 400 });
    }

    // Validate dates if provided
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (startDate >= endDate) {
        return NextResponse.json({ 
          error: 'End date must be after start date' 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: AcademicYearUpdate = {
      name,
      start_date,
      end_date,
      is_active,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof AcademicYearUpdate] === undefined) {
        delete updateData[key as keyof AcademicYearUpdate];
      }
    });

    // Update academic year
    const { data: updatedAcademicYear, error: updateError } = await supabase
      .from('academic_years')
      .update(updateData)
      .eq('id', id)
      .eq('school_id', profile.school_id) // Ensure user can only update their school's academic years
      .select()
      .single();

    if (updateError) {
      console.error('Error updating academic year:', updateError);
      return NextResponse.json({ error: 'Failed to update academic year' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      academic_year: updatedAcademicYear 
    });

  } catch (error) {
    console.error('Error in academic year update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
