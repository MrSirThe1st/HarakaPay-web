import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT: Mark message as read (school staff only)
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff']
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    const params = await context.params;
    const messageId = params.id;

    if (!profile.school_id) {
      return NextResponse.json(
        { success: false, error: 'No school assigned to this account' },
        { status: 400 }
      );
    }

    // Update message status
    const { error: updateError } = await adminClient
      .from('parent_school_messages')
      .update({
        status: 'read',
        read_at: new Date().toISOString(),
      } as never)
      .eq('id', messageId)
      .eq('school_id', profile.school_id);

    if (updateError) {
      console.error('Error updating message:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to mark message as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    console.error('Error in PUT /api/messages/parent-to-school/[id]/read:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}