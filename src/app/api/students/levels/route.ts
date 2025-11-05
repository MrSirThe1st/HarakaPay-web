import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { CONGOLESE_GRADES, getGradeByValue } from '@/lib/congoleseGrades';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user using cookies (for school dashboard)
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in students/levels:', authError);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('Authenticated user:', user.id);

    // Get user's school with grade_levels
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('school_id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
    }

    if (!profile || !profile.school_id) {
      console.log('No profile or school_id for user:', user.id);
      return NextResponse.json({
        success: true,
        grades: [],
        message: 'No school associated with user'
      });
    }

    // Get school's configured grade levels
    console.log('Fetching school with ID:', profile.school_id);

    const { data: school, error: schoolError } = await adminClient
      .from('schools')
      .select('id, name, grade_levels')
      .eq('id', profile.school_id)
      .single();

    console.log('School data:', school);
    console.log('School error:', schoolError);

    if (schoolError) {
      console.error('Error fetching school:', schoolError);
      return NextResponse.json({
        error: 'Failed to fetch school data',
        details: schoolError.message
      }, { status: 500 });
    }

    // Get grade details from the school's configured grade_levels
    const gradeLevels = school?.grade_levels || [];
    console.log('Grade levels from school:', gradeLevels);
    console.log('Type of grade_levels:', typeof gradeLevels, Array.isArray(gradeLevels));

    // Map grade values to full grade objects with labels
    const grades = gradeLevels
      .map(value => {
        const grade = getGradeByValue(value);
        console.log(`Mapping grade value '${value}' to:`, grade);
        return grade ? {
          value: grade.value,
          label: grade.label,
          level: grade.level,
          order: grade.order
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.order - b!.order);

    console.log('Final grades to return:', grades);

    return NextResponse.json({
      success: true,
      grades
    });

  } catch (error) {
    console.error('Error in students/levels API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
