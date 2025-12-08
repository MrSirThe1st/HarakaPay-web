import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT: Resolve support ticket (admin only)
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin', 'platform_admin', 'support_admin']
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { adminClient } = authResult;

    const params = await context.params;
    const ticketId = params.id;

    // Resolve ticket (status: read = resolved)
    const { error: updateError } = await adminClient
      .from('school_admin_messages')
      .update({
        status: 'read',
        read_at: new Date().toISOString(),
      })
      .eq('id', ticketId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to resolve support ticket' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Support ticket resolved successfully',
    });
  } catch (error) {
    console.error('Error in PUT /api/messages/school-to-admin/[id]/read:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}