// src/app/api/notifications/history/route.js
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

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

    // 3. Verify user can view notifications
    const allowedRoles = ['school_admin', 'school_staff'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({
        error: 'Insufficient permissions to view notification history'
      }, { status: 403 });
    }

    // 4. Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 5. Fetch notifications for this school
    const { data: notifications, error: notificationsError } = await adminClient
      .from('notifications')
      .select('*')
      .eq('school_id', profile.school_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
      return NextResponse.json({
        error: 'Failed to fetch notification history'
      }, { status: 500 });
    }

    // 6. Get total count for pagination
    const { count, error: countError } = await adminClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', profile.school_id);

    if (countError) {
      console.error('Error counting notifications:', countError);
    }

    // 7. Group notifications by batch (notifications sent at the same time with same title/message)
    const groupedNotifications = new Map();

    notifications.forEach(notification => {
      // Create a unique key for grouping (based on title, message, and sent time rounded to minute)
      const sentAt = notification.sent_at || notification.created_at;
      const timeKey = sentAt ? new Date(sentAt).toISOString().slice(0, 16) : 'scheduled';
      const groupKey = `${notification.title}_${timeKey}`;

      if (!groupedNotifications.has(groupKey)) {
        groupedNotifications.set(groupKey, {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          notification_channel: notification.notification_channel,
          sent_at: notification.sent_at,
          created_at: notification.created_at,
          target_audience: notification.target_audience,
          recipients: [],
          total_recipients: 0,
          read_count: 0
        });
      }

      const group = groupedNotifications.get(groupKey);
      group.recipients.push({
        user_id: notification.user_id,
        is_read: notification.is_read,
        read_at: notification.read_at
      });
      group.total_recipients++;
      if (notification.is_read) {
        group.read_count++;
      }
    });

    const historyItems = Array.from(groupedNotifications.values());

    return NextResponse.json({
      success: true,
      data: {
        notifications: historyItems,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in notification history API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}