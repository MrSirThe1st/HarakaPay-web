import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Cookie setting might fail in some contexts
            }
          },
          remove(name: string, options: Record<string, unknown>) {
            try {
              cookieStore.set({ name, value: '', ...options, maxAge: 0 });
            } catch {
              // Cookie removal might fail in some contexts
            }
          },
        },
      }
    );

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

    // Only school admins and staff can view parents
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

    // Get URL parameters for search
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    console.log('🔍 Parent search API called:', {
      schoolId: profile.school_id,
      search,
      userRole: profile.role
    });

    // Get parents linked to students in this school
    // First, get all students in the school
    const { data: students, error: studentsError } = await adminClient
      .from('students')
      .select('id')
      .eq('school_id', profile.school_id);

    if (studentsError) {
      console.error('❌ Error fetching students:', studentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch students' },
        { status: 500 }
      );
    }

    console.log(`📚 Found ${students?.length || 0} students in school`);

    if (!students || students.length === 0) {
      console.log('⚠️ No students found in school');
      return NextResponse.json({
        success: true,
        parents: [],
        debug: { message: 'No students found in this school' }
      });
    }

    const studentIds = students.map(s => s.id);

    console.log(`🔗 Looking for parents of ${studentIds.length} students`);

    // Get parent-student relationships
    const { data: parentStudents, error: parentStudentsError } = await adminClient
      .from('parent_students')
      .select(`
        parent_id,
        student_id,
        parents!inner(
          id,
          user_id,
          first_name,
          last_name,
          phone,
          email
        )
      `)
      .in('student_id', studentIds);

    if (parentStudentsError) {
      console.error('❌ Error fetching parent-student relationships:', parentStudentsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch parent relationships' },
        { status: 500 }
      );
    }

    console.log(`👪 Found ${parentStudents?.length || 0} parent-student relationships`);

    // Get unique parents and their students
    const parentMap = new Map<string, {
      id: string;
      user_id: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      email: string | null;
      student_ids: string[];
    }>();

    parentStudents?.forEach((ps) => {
      const parent = Array.isArray(ps.parents) ? ps.parents[0] : ps.parents;
      if (!parent) return;

      if (!parentMap.has(parent.id)) {
        parentMap.set(parent.id, {
          id: parent.id,
          user_id: parent.user_id,
          first_name: parent.first_name,
          last_name: parent.last_name,
          phone: parent.phone,
          email: parent.email,
          student_ids: []
        });
      }

      const parentData = parentMap.get(parent.id);
      if (parentData) {
        parentData.student_ids.push(ps.student_id);
      }
    });

    let parents = Array.from(parentMap.values());

    console.log(`👥 Total unique parents: ${parents.length}`);

    // DEBUG: Log actual parent names
    console.log('📋 Parent names in DB:', parents.map(p => ({
      firstName: p.first_name,
      lastName: p.last_name,
      email: p.email,
      phone: p.phone
    })));

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      const beforeFilter = parents.length;
      parents = parents.filter(p =>
        p.first_name?.toLowerCase().includes(searchLower) ||
        p.last_name?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower) ||
        p.phone?.includes(search)
      );
      console.log(`🔎 Search "${search}": ${beforeFilter} → ${parents.length} parents match`);
    }

    // Get student details for each parent
    const parentsWithStudents = await Promise.all(
      parents.map(async (parent) => {
        const { data: studentData } = await adminClient
          .from('students')
          .select('id, student_id, first_name, last_name, grade_level')
          .in('id', parent.student_ids)
          .eq('school_id', profile.school_id);

        return {
          ...parent,
          students: studentData || []
        };
      })
    );

    console.log(`✅ Returning ${parentsWithStudents.length} parents to frontend`);

    return NextResponse.json({
      success: true,
      parents: parentsWithStudents
    });

  } catch (error) {
    console.error('Parents API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

