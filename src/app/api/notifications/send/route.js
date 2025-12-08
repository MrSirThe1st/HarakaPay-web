// src/app/api/notifications/send/route.js
import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import notificationService from '@/services/notificationService';

export async function POST(request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff']
    });
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

    // Get request data
    const body = await request.json();
    const {
      title,
      message,
      templateId,
      targetAudience,
      channel,
      scheduledAt,
      metadata
    } = body;

    // 5. Validate required fields
    if (!title || !message) {
      return NextResponse.json({
        error: 'Title and message are required'
      }, { status: 400 });
    }

    // 6. Send notification
    const result = await notificationService.sendNotification({
      schoolId: profile.school_id,
      title,
      message,
      templateId,
      targetAudience: targetAudience || {},
      channel: channel || 'in_app',
      scheduledAt,
      createdBy: user.id,
      metadata: metadata || {}
    });

    if (!result.success) {
      return NextResponse.json({
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      notificationId: result.notificationId,
      recipientCount: result.recipientCount,
      message: `Notification sent to ${result.recipientCount} parent(s)`
    });

  } catch (error) {
    console.error('Error in send notification API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
