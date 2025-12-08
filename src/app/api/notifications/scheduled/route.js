// src/app/api/notifications/scheduled/route.js
import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';
import scheduledNotificationService from '@/services/scheduledNotificationService';

// GET - Fetch all scheduled notifications for a school
export async function GET(request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff']
    });
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // Default to true

    const result = await scheduledNotificationService.getScheduledNotifications(
      profile.school_id,
      activeOnly
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      scheduledNotifications: result.scheduledNotifications
    });

  } catch (error) {
    console.error('Error fetching scheduled notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new scheduled notification
export async function POST(request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff']
    });
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

    const body = await request.json();
    const {
      subject,
      body: messageBody,
      category,
      frequency,
      scheduleTime,
      scheduleDays,
      scheduleDate,
      targetAudience
    } = body;

    if (!messageBody || !frequency || !scheduleTime) {
      return NextResponse.json({
        error: 'Message body, frequency, and schedule time are required'
      }, { status: 400 });
    }

    const result = await scheduledNotificationService.createScheduledNotification({
      schoolId: profile.school_id,
      subject,
      body: messageBody,
      category: category || 'general',
      frequency,
      scheduleTime,
      scheduleDays,
      scheduleDate,
      targetAudience: targetAudience || {},
      createdBy: user.id
    });

    if (!result.success) {
      return NextResponse.json({
        error: result.error
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      scheduledNotification: result.scheduledNotification
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating scheduled notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
