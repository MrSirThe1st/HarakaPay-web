import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import { z } from 'zod';
import type { SupportTicketWithDetails, TicketListResponse } from '@/types/message.types';

const createTicketSchema = z.object({
  subject: z.string().min(1).max(255),
  description: z.string().min(1),
});

// POST: School staff submits support ticket
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    const body = await request.json();
    const validation = createTicketSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { subject, description } = validation.data;

    // Insert ticket (maps to school_admin_messages table)
    const { data: newTicket, error: insertError } = await adminClient
      .from('school_admin_messages')
      .insert({
        school_id: profile.school_id,
        sent_by: profile.id,
        subject,
        message: description,
        status: 'unread', // unread = open ticket
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create support ticket' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Support ticket submitted successfully',
      ticket: newTicket,
    });
  } catch (error) {
    console.error('Error in POST /api/messages/school-to-admin:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: List support tickets (admin view or school view)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await authenticateRequest({}, request);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('school_admin_messages')
      .select(`
        *,
        school:schools(id, name),
        submitter:profiles!school_admin_messages_sent_by_fkey(id, first_name, last_name, role)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter based on role
    if (profile.role === 'super_admin' || profile.role === 'platform_admin' || profile.role === 'support_admin') {
      // Admin sees all tickets
    } else if (profile.role === 'school_admin' || profile.role === 'school_staff') {
      // School staff sees their own school's tickets
      if (!profile.school_id) {
        return NextResponse.json(
          { success: false, error: 'School not found' },
          { status: 404 }
        );
      }
      query = query.eq('school_id', profile.school_id);
    } else {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { data: rawTickets, error: fetchError, count } = await query;

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch support tickets' },
        { status: 500 }
      );
    }

    // Map DB columns to ticket format
    const tickets: SupportTicketWithDetails[] = (rawTickets || []).map((ticket) => ({
      id: ticket.id,
      school_id: ticket.school_id,
      submitted_by: ticket.sent_by,
      subject: ticket.subject,
      description: ticket.message,
      status: ticket.status === 'unread' ? 'open' : 'resolved',
      resolved_at: ticket.read_at,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      school: ticket.school,
      submitter: ticket.submitter,
    }));

    // Count open tickets (only for admins)
    let openCount = 0;
    if (profile.role === 'super_admin' || profile.role === 'platform_admin' || profile.role === 'support_admin') {
      const { count: open } = await adminClient
        .from('school_admin_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');
      openCount = open || 0;
    }

    const response: TicketListResponse = {
      success: true,
      tickets,
      openCount,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/messages/school-to-admin:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}