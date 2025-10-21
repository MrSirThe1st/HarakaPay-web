import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerAuthClient } from '@/lib/supabaseServerOnly';

// Handle CORS preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/parent/link-students-batch called');
  try {
    const { students } = await request.json();
    console.log('📥 Received students data:', students);

    // Validate required fields
    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: 'Students array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate each student object
    for (const student of students) {
      if (!student.school_id || !student.student_id) {
        return NextResponse.json(
          { error: 'Each student must have school_id and student_id' },
          { status: 400 }
        );
      }
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('🔐 Auth header present:', !!authHeader);
    console.log('🔐 Auth header starts with Bearer:', authHeader?.startsWith('Bearer '));
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid authorization header');
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔐 Token extracted, length:', token.length);
    
    // Verify the token
    const authClient = createServerAuthClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    
    console.log('🔐 Auth verification result:', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message 
    });
    
    if (authError || !user) {
      console.log('❌ Invalid token or auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Use admin client for data access
    const adminClient = createAdminClient();

    // First, find or create the parent record
    console.log('🔍 Looking up parent record for user_id:', user.id);
    
    const { data: existingParent, error: parentCheckError } = await adminClient
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let parentId;

    if (parentCheckError && parentCheckError.code === 'PGRST116') {
      // Parent record doesn't exist, create it
      console.log('🔍 Parent record not found, creating one...');
      
      // Get user profile data to create parent record
      const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('❌ Could not find profile for parent:', profileError);
        return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 });
      }

      // Create parent record
      const { data: newParent, error: createParentError } = await adminClient
        .from('parents')
        .insert({
          user_id: user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email || user.email,
          phone: profile.phone,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createParentError) {
        console.error('❌ Error creating parent record:', createParentError);
        return NextResponse.json({ error: 'Failed to create parent record' }, { status: 500 });
      }

      parentId = newParent.id;
      console.log('✅ Parent record created:', newParent);
    } else if (parentCheckError) {
      console.error('❌ Error checking parent record:', parentCheckError);
      return NextResponse.json({ error: 'Failed to check parent record' }, { status: 500 });
    } else {
      parentId = existingParent.id;
      console.log('✅ Parent record exists:', existingParent);
    }

    // Now lookup all students and create relationships
    const linkedStudents = [];
    const errors = [];

    for (const studentInput of students) {
      try {
        // Look up the student by school_id and student_id
        const { data: student, error: studentError } = await adminClient
          .from('students')
          .select('id, student_id, first_name, last_name, grade_level, school_id')
          .eq('school_id', studentInput.school_id)
          .eq('student_id', studentInput.student_id.trim())
          .single();

        if (studentError || !student) {
          errors.push({
            school_id: studentInput.school_id,
            student_id: studentInput.student_id,
            error: 'Student not found'
          });
          continue;
        }

        // Check if relationship already exists
        const { data: existingRelationship } = await adminClient
          .from('parent_students')
          .select('id')
          .eq('parent_id', parentId)
          .eq('student_id', student.id)
          .single();

        if (existingRelationship) {
          errors.push({
            school_id: studentInput.school_id,
            student_id: studentInput.student_id,
            error: 'Student already linked to this parent'
          });
          continue;
        }

        // Create the parent-student relationship
        console.log('🔗 Creating relationship for:', {
          parent_id: parentId,
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          student_number: student.student_id
        });

        const { data: relationship, error: relationshipError } = await adminClient
          .from('parent_students')
          .insert({
            parent_id: parentId,
            student_id: student.id,
            relationship: 'parent',
            is_primary: true,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (relationshipError) {
          console.error('❌ Error creating relationship:', relationshipError);
          console.error('❌ Relationship data attempted:', {
            parent_id: parentId,
            student_id: student.id,
            relationship: 'parent',
            is_primary: true,
            created_at: new Date().toISOString(),
          });
          errors.push({
            school_id: studentInput.school_id,
            student_id: studentInput.student_id,
            error: `Failed to create relationship: ${relationshipError.message}`
          });
          continue;
        }

        console.log('✅ Relationship created successfully:', relationship);

        linkedStudents.push({
          id: student.id,
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          grade_level: student.grade_level,
          school_id: student.school_id,
          relationship_id: relationship.id
        });

        console.log('✅ Student linked:', student.first_name, student.last_name);

      } catch (error) {
        console.error('❌ Error processing student:', studentInput, error);
        errors.push({
          school_id: studentInput.school_id,
          student_id: studentInput.student_id,
          error: 'Unexpected error occurred'
        });
      }
    }

    const response = NextResponse.json({
      success: true,
      linked_students: linkedStudents,
      errors: errors,
      summary: {
        total_requested: students.length,
        successfully_linked: linkedStudents.length,
        failed: errors.length
      }
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error('Unexpected error in link-students-batch:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
}
