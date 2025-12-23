import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
    const supabase = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
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
    
    // Get user profile data first (needed for creating parent if it doesn't exist)
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('❌ Could not find profile for parent:', profileError);
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 });
    }

    // Use upsert to ensure we get the existing parent record or create a new one
    // This handles race conditions where the parent might be created between check and insert
    const { data: parentRecord, error: parentUpsertError } = await adminClient
      .from('parents')
      .upsert({
        user_id: user.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: user.email,
        phone: profile.phone,
        is_active: true,
        updated_at: new Date().toISOString(),
      } as never, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (parentUpsertError) {
      console.error('❌ Error upserting parent record:', parentUpsertError);
      return NextResponse.json({ error: 'Failed to get or create parent record' }, { status: 500 });
    }

    const typedParentRecord = parentRecord as { id: string };
    const parentId = typedParentRecord.id;
    console.log('✅ Parent record ready:', {
      id: parentId,
      user_id: user.id,
      name: `${profile.first_name} ${profile.last_name}`,
      email: user.email
    });
    console.log('🔍 Will use this parent_id for linking students:', parentId);

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

        const typedStudent = student as { id: string; student_id: string; first_name: string | null; last_name: string | null; grade_level: string | null; school_id: string };

        // Check if relationship already exists
        const { data: existingRelationship } = await adminClient
          .from('parent_students')
          .select('id')
          .eq('parent_id', parentId)
          .eq('student_id', typedStudent.id)
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
          user_id: user.id,
          student_id: typedStudent.id,
          student_name: `${typedStudent.first_name} ${typedStudent.last_name}`,
          student_number: typedStudent.student_id
        });

        const { data: relationship, error: relationshipError } = await adminClient
          .from('parent_students')
          .insert({
            parent_id: parentId,
            student_id: typedStudent.id,
            relationship: 'parent',
            is_primary: true,
            created_at: new Date().toISOString(),
          } as any)
          .select()
          .single();

        if (relationshipError) {
          console.error('❌ Error creating relationship:', relationshipError);
          console.error('❌ Relationship data attempted:', {
            parent_id: parentId,
            user_id: user.id,
            student_id: typedStudent.id,
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

        const typedRelationship = relationship as { id: string };
        console.log('✅ Relationship created successfully:', relationship);
        console.log('✅ Relationship details:', {
          relationship_id: typedRelationship.id,
          parent_id: parentId,
          student_id: typedStudent.id,
          student_name: `${typedStudent.first_name} ${typedStudent.last_name}`
        });

        linkedStudents.push({
          id: typedStudent.id,
          student_id: typedStudent.student_id,
          first_name: typedStudent.first_name,
          last_name: typedStudent.last_name,
          grade_level: typedStudent.grade_level,
          school_id: typedStudent.school_id,
          relationship_id: typedRelationship.id
        });

        console.log('✅ Student linked:', typedStudent.first_name, typedStudent.last_name, 'to parent_id:', parentId);

      } catch (error) {
        console.error('❌ Error processing student:', studentInput, error);
        errors.push({
          school_id: studentInput.school_id,
          student_id: studentInput.student_id,
          error: 'Unexpected error occurred'
        });
      }
    }

    console.log('📊 Batch linking summary:', {
      parent_id: parentId,
      user_id: user.id,
      total_requested: students.length,
      successfully_linked: linkedStudents.length,
      failed: errors.length
    });

    const response = NextResponse.json({
      success: true,
      linked_students: linkedStudents,
      errors: errors,
      summary: {
        total_requested: students.length,
        successfully_linked: linkedStudents.length,
        failed: errors.length
      },
      parent_id: parentId // Include parent_id in response for debugging
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
