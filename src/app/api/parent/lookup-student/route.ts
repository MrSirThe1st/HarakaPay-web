import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface School {
  name: string;
}

interface Student {
  id: string;
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  grade_level: string | null;
  school_id: string;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  schools: School | School[];
}

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

    const typedStudent = student as Student;

    // Return student information with parent details
    // Handle schools as either array or single object (Supabase type inference issue)
    const schools = Array.isArray(typedStudent.schools) ? typedStudent.schools[0] : typedStudent.schools;
    const response = NextResponse.json({
      found: true,
      student: {
        id: typedStudent.id,
        student_id: typedStudent.student_id,
        first_name: typedStudent.first_name,
        last_name: typedStudent.last_name,
        grade_level: typedStudent.grade_level,
        school_id: typedStudent.school_id,
        school_name: schools?.name || '',
        parent_name: typedStudent.parent_name,
        parent_email: typedStudent.parent_email,
        parent_phone: typedStudent.parent_phone
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
