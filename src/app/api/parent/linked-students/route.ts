import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerAuthClient } from '@/lib/supabaseServerOnly';

export async function GET(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const authClient = createServerAuthClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Use admin client for data access
    const supabase = createAdminClient();

    // First, find the parent ID using the user_id
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parent) {
      return NextResponse.json({ 
        error: 'Parent record not found',
        details: 'No parent record exists for this user'
      }, { status: 404 });
    }

    // Get linked students
    const { data: relationships, error } = await supabase
      .from('parent_students')
      .select(`
        student_id,
        students!inner(
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
        )
      `)
      .eq('parent_id', parent.id);

    if (error) {
      console.error('Error fetching linked students:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch linked students',
        details: error.message
      }, { status: 500 });
    }

    if (!relationships || relationships.length === 0) {
      return NextResponse.json({ 
        students: [],
        message: 'No linked students found'
      });
    }

    const students = relationships.map((rel: any) => ({
      id: rel.students.id,
      student_id: rel.students.student_id,
      first_name: rel.students.first_name,
      last_name: rel.students.last_name,
      grade_level: rel.students.grade_level,
      school_id: rel.students.school_id,
      school_name: rel.students.schools.name,
      parent_name: rel.students.parent_name,
      parent_email: rel.students.parent_email,
      parent_phone: rel.students.parent_phone,
      match_confidence: 'high' as const,
      match_reasons: ['Already linked'],
    }));

    return NextResponse.json({ 
      students,
      count: students.length
    });

  } catch (error) {
    console.error('Error in linked-students API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
