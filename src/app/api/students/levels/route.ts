import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { getGradeByValue } from '@/lib/congoleseGrades';

// Cache this data for 5 minutes (grade levels rarely change)
export const revalidate = 300;

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireActive: true
    }, req);

    if (isAuthError(authResult)) {
      return authResult;
    }

    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
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
      .map((value: string) => {
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
      .sort((a: unknown, b: unknown) => {
        const gradeA = a as { order: number };
        const gradeB = b as { order: number };
        return gradeA.order - gradeB.order;
      });

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
