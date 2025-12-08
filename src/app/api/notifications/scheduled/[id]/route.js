// src/app/api/notifications/scheduled/[id]/route.js
import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import scheduledNotificationService from '@/services/scheduledNotificationService';

// PUT - Update scheduled notification
export async function PUT(request, { params }) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff']
    });
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

    const { id } = params;
    const body = await request.json();

    const result = await scheduledNotificationService.updateScheduledNotification(id, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      scheduledNotification: result.scheduledNotification
    });

  } catch (error) {
    console.error('Error updating scheduled notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete (deactivate) scheduled notification
export async function DELETE(request, { params }) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff']
    });
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

    const { id } = params;
    const result = await scheduledNotificationService.deleteScheduledNotification(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Scheduled notification deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting scheduled notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
