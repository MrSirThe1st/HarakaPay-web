import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

// Handle CORS preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const { school_id, student_id } = await request.json();

    // Validate required fields
    if (!school_id || !student_id) {
      return NextResponse.json(
        { error: 'School ID and Student ID are required' },
        { status: 400 }
      );
    }

    // Create admin client to bypass RLS
    const adminClient = createAdminClient();

    // Look up the student by school_id and student_id
    const { data: student, error } = await adminClient
      .from('students')
      .select(`
        id,
        student_id,
        first_name,
        last_name,
        grade_level,
        school_id,
        parent_name,
        parent_email,
        parent_phone,
        schools!inner(name)
      `)
      .eq('school_id', school_id)
      .eq('student_id', student_id.trim())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Student not found
        return NextResponse.json({
          found: false,
          error: 'Student not found'
        });
      }
      
      console.error('Student lookup error:', error);
      return NextResponse.json(
        { error: 'Failed to lookup student' },
        { status: 500 }
      );
    }

    if (!student) {
      return NextResponse.json({
        found: false,
        error: 'Student not found'
      });
    }

    // Return student information with parent details
    // Handle schools as either array or single object (Supabase type inference issue)
    const schools = Array.isArray(student.schools) ? student.schools[0] : student.schools;
    const response = NextResponse.json({
      found: true,
      student: {
        id: student.id,
        student_id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        grade_level: student.grade_level,
        school_id: student.school_id,
        school_name: schools?.name || '',
        parent_name: student.parent_name,
        parent_email: student.parent_email,
        parent_phone: student.parent_phone
      }
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;

  } catch (error) {
    console.error('Unexpected error in lookup-student:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  }
}
