import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
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

    // Get URL parameters for search and filtering
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const grade = searchParams.get('grade') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Determine which school to fetch students for
    let targetSchoolId = profile.school_id;
    
    // If user is platform admin, they can specify a school_id
    if (['super_admin', 'platform_admin', 'support_admin'].includes(profile.role)) {
      const schoolId = searchParams.get('school_id');
      if (schoolId) {
        targetSchoolId = schoolId;
      }
    }

    if (!targetSchoolId) {
      return NextResponse.json(
        { success: false, error: 'School not specified' }, 
        { status: 400 }
      );
    }

    // Build query
    let query = adminClient
      .from('students')
      .select('*', { count: 'exact' })
      .eq('school_id', targetSchoolId);

    // Apply search filter
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,student_id.ilike.%${search}%`);
    }

    // Apply grade filter
    if (grade && grade !== 'all') {
      query = query.eq('grade_level', grade);
    }

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data: students, error: studentsError, count } = await query;

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch students' }, 
        { status: 500 }
      );
    }

    // Get statistics
    const { data: stats, error: statsError } = await adminClient
      .from('students')
      .select('status, grade_level, created_at')
      .eq('school_id', targetSchoolId);

    if (statsError) {
      console.error('Error fetching stats:', statsError);
    }

    // Calculate statistics
    const totalStudents = count || 0;
    const activeStudents = stats?.filter(s => s.status === 'active').length || 0;
    const inactiveStudents = stats?.filter(s => s.status === 'inactive').length || 0;
    const graduatedStudents = stats?.filter(s => s.status === 'graduated').length || 0;
    
    // New students this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const newThisMonth = stats?.filter(s => 
      new Date(s.created_at) >= currentMonth
    ).length || 0;

    // Graduating students (assuming grade 12)
    const graduatingStudents = stats?.filter(s => 
      s.grade_level === 'Grade 12' || s.grade_level === 'grade 12'
    ).length || 0;

    return NextResponse.json({
      success: true,
      data: {
        students: students || [],
        pagination: {
          page,
          limit,
          total: totalStudents,
          pages: Math.ceil(totalStudents / limit)
        },
        stats: {
          total: totalStudents,
          active: activeStudents,
          inactive: inactiveStudents,
          graduated: graduatedStudents,
          newThisMonth,
          graduating: graduatingStudents
        }
      }
    });

  } catch (error) {
    console.error('Students API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
