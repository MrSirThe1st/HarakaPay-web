// src/app/api/notifications/scheduled/[id]/route.js
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { cookies } from 'next/headers';
import scheduledNotificationService from '@/services/scheduledNotificationService';

// PUT - Update scheduled notification
export async function PUT(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies: async () => await cookies() });

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
    const supabase = createRouteHandlerClient({ cookies: async () => await cookies() });

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
