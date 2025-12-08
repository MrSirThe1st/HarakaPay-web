import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { z } from 'zod';
import type { ParentSchoolMessageWithDetails, MessageListResponse } from '@/types/message.types';

const sendMessageSchema = z.object({
  student_id: z.string().uuid(),
  subject: z.string().min(1).max(255),
  message: z.string().min(1),
});

// POST: Parent sends message to school
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await authenticateRequest({}, request);
    if (isAuthError(authResult)) return authResult;
    const { user, adminClient } = authResult;

    const body = await request.json();
    const validation = sendMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { student_id, subject, message } = validation.data;

    // Get parent record
    const { data: parent, error: parentError } = await adminClient
      .from('parents')
      .select('id, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parent) {
      return NextResponse.json(
        { success: false, error: 'Parent record not found' },
        { status: 404 }
      );
    }

    // Verify parent-student relationship and get school_id
    const { data: relationship, error: relError } = await adminClient
      .from('parent_students')
      .select('student:students(id, school_id)')
      .eq('parent_id', parent.id)
      .eq('student_id', student_id)
      .single();

    if (relError || !relationship) {
      return NextResponse.json(
        { success: false, error: 'Student not linked to this parent' },
        { status: 403 }
      );
    }

    const student = (relationship.student as unknown) as { id: string; school_id: string };

    // Insert message
    const { data: newMessage, error: insertError } = await adminClient
      .from('parent_school_messages')
      .insert({
        parent_id: parent.id,
        school_id: student.school_id,
        student_id,
        subject,
        message,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error in POST /api/messages/parent-to-school:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: List messages (school staff view or parent view)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await authenticateRequest({}, request);
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('parent_school_messages')
      .select(`
        *,
        parent:parents(id, first_name, last_name, email, phone),
        student:students(id, first_name, last_name, grade_level, student_id)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter based on role
    if (profile.role === 'school_admin' || profile.role === 'school_staff') {
      if (!profile.school_id) {
        return NextResponse.json(
          { success: false, error: 'School not found' },
          { status: 404 }
        );
      }
      query = query.eq('school_id', profile.school_id);
    } else {
      // Parent view - get parent record
      const { data: parent } = await adminClient
        .from('parents')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!parent) {
        return NextResponse.json(
          { success: false, error: 'Parent record not found' },
          { status: 404 }
        );
      }
      query = query.eq('parent_id', parent.id);
    }

    const { data: messages, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('Error fetching messages:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Count unread messages
    let filterKey: string;
    let filterValue: string | undefined;

    if (profile.role === 'school_admin' || profile.role === 'school_staff') {
      filterKey = 'school_id';
      filterValue = profile.school_id || undefined;
    } else {
      filterKey = 'parent_id';
      const { data: parent } = await adminClient.from('parents').select('id').eq('user_id', user.id).single();
      filterValue = parent?.id;
    }

    const { count: unreadCount } = await adminClient
      .from('parent_school_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unread')
      .eq(filterKey, filterValue);

    const response: MessageListResponse<ParentSchoolMessageWithDetails> = {
      success: true,
      messages: messages as unknown as ParentSchoolMessageWithDetails[],
      unreadCount: unreadCount || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/messages/parent-to-school:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}