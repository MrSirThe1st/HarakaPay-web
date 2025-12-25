import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { searchType, parentName, parentEmail, parentPhone, childName, schoolId } = await req.json();

    if (!searchType) {
      return NextResponse.json({ error: 'Search type is required' }, { status: 400 });
    }

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    console.log('🔍 Auth header received:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid authorization header');
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔍 Token extracted:', token.substring(0, 20) + '...');
    
    // Create auth client to verify the token
    const supabase = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    console.log('✅ User authenticated:', user.id);

    // User is authenticated - that's sufficient for student searching
    console.log('✅ User authenticated for student search:', user.id);


    // Get parent record to find already linked students
    const { data: parent } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Get already linked student IDs
    let linkedStudentIds: string[] = [];
    if (parent) {
      const typedParent = parent as { id: string };
      const { data: linkedStudents } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', typedParent.id);

      const typedLinkedStudents = linkedStudents as { student_id: string }[] | null;
      linkedStudentIds = typedLinkedStudents?.map(ls => ls.student_id) || [];
    }

    let students: Array<{
      id: string;
      student_id: string;
      first_name: string;
      last_name: string;
      grade_level: string | null;
      school_id: string | null;
      parent_name: string | null;
      parent_email: string | null;
      parent_phone: string | null;
      schools: { name: string } | { name: string }[];
    }> = [];

    if (searchType === 'automatic') {
      // Search for students by parent information (phone + name)
      if (!parentName || !parentPhone) {
        return NextResponse.json({ error: 'Parent name and phone are required for automatic search' }, { status: 400 });
      }

      // Normalize phone for comparison
      const normalizedParentPhone = normalizePhone(parentPhone);

      const { data, error } = await supabase
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
        .or(`parent_name.ilike.%${parentName}%,parent_phone.ilike.%${normalizedParentPhone}%`);

      if (error) {
        console.error('Error searching students:', error);
        return NextResponse.json({ error: 'Failed to search students' }, { status: 500 });
      }

      students = data || [];

    } else if (searchType === 'manual') {
      // Search for students by child name and school
      if (!childName || !schoolId) {
        return NextResponse.json({ error: 'Child name and school ID are required for manual search' }, { status: 400 });
      }

      const { data, error } = await supabase
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
        .eq('school_id', schoolId)
        .or(`first_name.ilike.%${childName}%,last_name.ilike.%${childName}%`);

      if (error) {
        console.error('Error searching students:', error);
        return NextResponse.json({ error: 'Failed to search students' }, { status: 500 });
      }

      students = data || [];
    }

    // Filter out already linked students
    students = students.filter((student: { id: string }) => !linkedStudentIds.includes(student.id));

    // Calculate match confidence and reasons
    const matches = students.map((student) => {
      const matchReasons: string[] = [];
      let confidence: 'high' | 'medium' | 'low' = 'low';

      if (searchType === 'automatic') {
        // Check phone match (primary identifier)
        if (parentPhone && student.parent_phone && normalizePhone(student.parent_phone) === normalizePhone(parentPhone)) {
          matchReasons.push('Phone number matches');
          confidence = 'high';
        } else if (parentPhone && student.parent_phone && normalizePhone(student.parent_phone).includes(normalizePhone(parentPhone))) {
          matchReasons.push('Phone number partially matches');
          confidence = 'medium';
        }

        // Check name match (secondary identifier)
        if (student.parent_name && normalizeName(student.parent_name) === normalizeName(parentName)) {
          matchReasons.push('Parent name matches exactly');
          if (confidence === 'low') confidence = 'medium';
          if (confidence === 'medium') confidence = 'high';
        } else if (student.parent_name && normalizeName(student.parent_name).includes(normalizeName(parentName))) {
          matchReasons.push('Parent name partially matches');
          if (confidence === 'low') confidence = 'medium';
        }

        // If both phone and name match, this is the highest confidence
        if (parentPhone && student.parent_phone && normalizePhone(student.parent_phone) === normalizePhone(parentPhone) &&
            student.parent_name && normalizeName(student.parent_name) === normalizeName(parentName)) {
          confidence = 'high';
        }
      } else {
        // Manual search - check name match
        const normalizedChildName = normalizeName(childName);
        const normalizedStudentName = normalizeName(`${student.first_name} ${student.last_name}`);
        
        if (normalizedStudentName.includes(normalizedChildName)) {
          matchReasons.push('Student name matches');
          confidence = 'high';
        } else if (normalizedStudentName.includes(normalizedChildName.split(' ')[0])) {
          matchReasons.push('First name matches');
          confidence = 'medium';
        }
      }

      // Handle schools as array or single object (Supabase type inference issue)
      const schools = Array.isArray(student.schools) ? student.schools[0] : student.schools;
      
      return {
        id: student.id,
        student_id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        grade_level: student.grade_level,
        school_id: student.school_id,
        school_name: schools?.name || '',
        parent_name: student.parent_name,
        parent_email: student.parent_email,
        parent_phone: student.parent_phone,
        match_confidence: confidence,
        match_reasons: matchReasons,
      };
    });

    // Sort by confidence (high first)
    const sortedMatches = matches.sort((a, b) => {
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      return confidenceOrder[b.match_confidence] - confidenceOrder[a.match_confidence];
    });

    return NextResponse.json({ matches: sortedMatches });

  } catch (error) {
    console.error('Error in search-students API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, ''); // Remove all non-digits
}
