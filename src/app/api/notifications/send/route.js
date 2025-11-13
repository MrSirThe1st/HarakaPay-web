// src/app/api/notifications/send/route.js
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { cookies } from 'next/headers';
import notificationService from '@/services/notificationService';

export async function POST(request) {
  try {
    // 1. Authenticate user
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check permissions
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, school_id, is_active')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.is_active) {
      return NextResponse.json({ error: 'Account inactive' }, { status: 403 });
    }

    // 3. Verify user can send notifications
    const allowedRoles = ['school_admin', 'school_staff'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({
        error: 'Insufficient permissions to send notifications'
      }, { status: 403 });
    }

    // 4. Get request data
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
