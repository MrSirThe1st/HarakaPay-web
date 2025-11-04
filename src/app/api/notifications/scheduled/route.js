// src/app/api/notifications/scheduled/route.js
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { cookies } from 'next/headers';
import scheduledNotificationService from '@/services/scheduledNotificationService';

// GET - Fetch all scheduled notifications for a school
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active')
      .eq('user_id', user.id)
      .single();

    if (!profile || !profile.is_active) {
      return NextResponse.json({ error: 'Profile not found or inactive' }, { status: 403 });
    }

    const allowedRoles = ['school_admin', 'school_staff'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({
        error: 'Insufficient permissions'
      }, { status: 403 });
    }

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
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active')
      .eq('user_id', user.id)
      .single();

    if (!profile || !profile.is_active) {
      return NextResponse.json({ error: 'Profile not found or inactive' }, { status: 403 });
    }

    const allowedRoles = ['school_admin', 'school_staff'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({
        error: 'Insufficient permissions'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      templateId,
      frequency,
      scheduleTime,
      scheduleDays,
      scheduleDate,
      targetAudience
    } = body;

    if (!templateId || !frequency || !scheduleTime) {
      return NextResponse.json({
        error: 'Template ID, frequency, and schedule time are required'
      }, { status: 400 });
    }

    const result = await scheduledNotificationService.createScheduledNotification({
      schoolId: profile.school_id,
      templateId,
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
