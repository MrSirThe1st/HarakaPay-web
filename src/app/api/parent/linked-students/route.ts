import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerAuthClient } from '@/lib/supabaseServerOnly';

export async function GET(req: NextRequest) {
  console.log("🔥 /api/parent/linked-students - Request received");
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    console.log("Authorization header:", authHeader ? "Present" : "Missing");
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
    console.log('🔍 Looking up parent record for user_id:', user.id);
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('id, user_id, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parent) {
      console.error('❌ Parent record not found:', parentError);
      console.error('❌ User ID:', user.id);
      return NextResponse.json({ 
        error: 'Parent record not found',
        details: 'No parent record exists for this user',
        user_id: user.id,
        parentError: parentError?.message
      }, { status: 404 });
    }

    console.log('✅ Parent record found:', parent.id);

    // Get linked students
    console.log('🔍 Fetching linked students for parent_id:', parent.id);
    const { data: relationships, error } = await supabase
      .from('parent_students')
      .select(`
        id,
        parent_id,
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
      console.error('❌ Error fetching linked students:', error);
      console.error('❌ Parent ID used:', parent.id);
      return NextResponse.json({ 
        error: 'Failed to fetch linked students',
        details: error.message,
        parent_id: parent.id
      }, { status: 500 });
    }

    console.log('📊 Found relationships:', relationships?.length || 0);
    if (relationships && relationships.length > 0) {
      console.log('📊 Relationship details:', relationships.map((r: { id: string; parent_id: string; student_id: string; students: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] }) => {
        const student = Array.isArray(r.students) ? r.students[0] : r.students;
        return {
          relationship_id: r.id,
          parent_id: r.parent_id,
          student_id: r.student_id,
          student_name: `${student.first_name} ${student.last_name}`
        };
      }));
    }

    if (!relationships || relationships.length === 0) {
      // Also check if there are ANY parent_students records for debugging
      const { data: allRelationships } = await supabase
        .from('parent_students')
        .select('id, parent_id, student_id')
        .limit(10);
      
      console.log('⚠️ No linked students found for parent_id:', parent.id);
      console.log('🔍 Sample parent_students records (first 10):', allRelationships);
      
      return NextResponse.json({ 
        students: [],
        message: 'No linked students found',
        parent_id: parent.id,
        debug: {
          sample_records: allRelationships
        }
      });
    }

    interface RelationshipStudent {
      id: string;
      student_id: string;
      first_name: string;
      last_name: string;
      grade_level: string;
      school_id: string;
      parent_name?: string;
      parent_email?: string;
      parent_phone?: string;
      schools?: { name: string } | { name: string }[];
    }

    interface Relationship {
      id: string;
      parent_id: string;
      student_id: string;
      students: RelationshipStudent | RelationshipStudent[];
    }

    const students = relationships.map((rel: Relationship) => {
      const student = Array.isArray(rel.students) ? rel.students[0] : rel.students;
      const schools = Array.isArray(student?.schools) ? student.schools[0] : (student?.schools || { name: '' });
      return {
        id: student?.id,
        student_id: student?.student_id,
        first_name: student?.first_name,
        last_name: student?.last_name,
        grade_level: student?.grade_level,
        school_id: student?.school_id,
        school_name: schools?.name || '',
        parent_name: student?.parent_name,
        parent_email: student?.parent_email,
        parent_phone: student?.parent_phone,
        match_confidence: 'high' as const,
        match_reasons: ['Already linked'],
      };
    });

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
