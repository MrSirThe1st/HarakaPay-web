// src/app/api/cron/process-scheduled-notifications/route.js
import { NextResponse } from 'next/server';
import scheduledNotificationService from '@/services/scheduledNotificationService';
import { createAdminClient } from '@/lib/supabaseServerOnly';

export const dynamic = 'force-dynamic';

/**
 * Cron job to process scheduled notifications
 * This should be called every 5-10 minutes by Vercel Cron
 */
export async function GET(request) {
  try {
    // Verify this is a legitimate cron request (optional security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('⏰ Starting scheduled notifications processing...');

    // Get all scheduled notifications that are due to be sent
    const result = await scheduledNotificationService.getNotificationsToSend();

    if (!result.success) {
      console.error('Error fetching notifications to send:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    const { notifications } = result;
    console.log(`📬 Found ${notifications.length} scheduled notifications to send`);

    if (notifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No notifications to send',
        processed: 0
      });
    }

    const adminClient = createAdminClient();
    let successCount = 0;
    let errorCount = 0;

    // Process each scheduled notification
    for (const scheduled of notifications) {
      try {
        console.log(`📤 Processing scheduled notification: ${scheduled.id}`);

        // Get target recipients based on target_audience
        const targetAudience = scheduled.target_audience || {};
        let recipientsQuery = adminClient
          .from('profiles')
          .select('user_id, first_name, last_name, school_id')
          .eq('role', 'parent')
          .eq('is_active', true)
          .eq('school_id', scheduled.school_id);

        // Filter by grade levels if specified
        if (targetAudience.gradeLevels && targetAudience.gradeLevels.length > 0) {
          // Get students in those grade levels
          const { data: students } = await adminClient
            .from('students')
            .select('parent_id')
            .eq('school_id', scheduled.school_id)
            .in('level', targetAudience.gradeLevels);

          if (students && students.length > 0) {
            const parentIds = [...new Set(students.map(s => s.parent_id))];

            // Get profiles for those parents
            const { data: parentProfiles } = await adminClient
              .from('profiles')
              .select('user_id, first_name, last_name, school_id')
              .eq('role', 'parent')
              .eq('is_active', true)
              .in('id', parentIds);

            if (parentProfiles && parentProfiles.length > 0) {
              recipientsQuery = { data: parentProfiles, error: null };
            } else {
              recipientsQuery = { data: [], error: null };
            }
          } else {
            recipientsQuery = { data: [], error: null };
          }
        } else {
          recipientsQuery = await recipientsQuery;
        }

        const { data: recipients, error: recipientsError } = recipientsQuery;

        if (recipientsError || !recipients || recipients.length === 0) {
          console.log(`⚠️ No recipients found for scheduled notification ${scheduled.id}`);
          await scheduledNotificationService.updateAfterSend(scheduled.id);
          continue;
        }

        console.log(`👥 Sending to ${recipients.length} recipients`);

        // Create the main notification record
        const { data: notification, error: notificationError } = await adminClient
          .from('notifications')
          .insert({
            school_id: scheduled.school_id,
            title: scheduled.subject || 'Scheduled Notification',
            message: scheduled.body,
            type: scheduled.category || 'general',
            notification_channel: 'in_app',
            sent_at: new Date().toISOString()
          })
          .select()
          .single();

        if (notificationError || !notification) {
          console.error(`❌ Error creating notification for ${scheduled.id}:`, notificationError);
          errorCount++;
          continue;
        }

        // Create notification_recipients records for each recipient
        const recipientRecords = recipients.map(recipient => ({
          notification_id: notification.id,
          user_id: recipient.user_id,
          delivery_status: 'delivered',
          delivery_channel: 'in_app',
          delivered_at: new Date().toISOString()
        }));

        const { error: recipientsInsertError } = await adminClient
          .from('notification_recipients')
          .insert(recipientRecords);

        if (recipientsInsertError) {
          console.error(`❌ Error creating recipients for ${scheduled.id}:`, recipientsInsertError);
          errorCount++;
          continue;
        }

        // Update the scheduled notification (set last_sent_at, calculate next_send_at)
        await scheduledNotificationService.updateAfterSend(scheduled.id);

        console.log(`✅ Successfully sent scheduled notification ${scheduled.id} to ${recipients.length} recipients`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error processing scheduled notification ${scheduled.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${notifications.length} scheduled notifications`,
      successCount,
      errorCount,
      totalProcessed: notifications.length
    });

  } catch (error) {
    console.error('💥 Error in scheduled notifications cron job:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
