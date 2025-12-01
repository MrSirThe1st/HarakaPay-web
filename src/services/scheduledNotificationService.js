// src/services/scheduledNotificationService.js
import { createAdminClient } from '@/lib/supabaseServerOnly';

class ScheduledNotificationService {
  /**
   * Get all scheduled notifications for a school
   */
  async getScheduledNotifications(schoolId, activeOnly = true) {
    try {
      const adminClient = createAdminClient();

      let query = adminClient
        .from('scheduled_notifications')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching scheduled notifications:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        scheduledNotifications: data || []
      };
    } catch (error) {
      console.error('Error in getScheduledNotifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new scheduled notification
   */
  async createScheduledNotification(data) {
    try {
      const {
        schoolId,
        subject,
        body,
        category = 'general',
        frequency,
        scheduleTime,
        scheduleDays,
        scheduleDate,
        targetAudience = {},
        createdBy
      } = data;

      // Validate required fields
      if (!schoolId || !body || !frequency || !scheduleTime) {
        return {
          success: false,
          error: 'School ID, message body, frequency, and schedule time are required'
        };
      }

      // Validate frequency-specific fields
      if (frequency === 'weekly' && (!scheduleDays || scheduleDays.length === 0)) {
        return {
          success: false,
          error: 'Schedule days are required for weekly notifications'
        };
      }

      if (frequency === 'monthly' && !scheduleDate) {
        return {
          success: false,
          error: 'Schedule date is required for monthly notifications'
        };
      }

      // Calculate next_send_at
      const nextSendAt = this.calculateNextSendTime(
        frequency,
        scheduleTime,
        scheduleDays,
        scheduleDate
      );

      const adminClient = createAdminClient();
      const { data: scheduledNotification, error } = await adminClient
        .from('scheduled_notifications')
        .insert({
          school_id: schoolId,
          subject,
          body,
          category,
          frequency,
          schedule_time: scheduleTime,
          schedule_days: scheduleDays,
          schedule_date: scheduleDate,
          target_audience: targetAudience,
          next_send_at: nextSendAt,
          is_active: true,
          created_by: createdBy
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating scheduled notification:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        scheduledNotification
      };
    } catch (error) {
      console.error('Error in createScheduledNotification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a scheduled notification
   */
  async updateScheduledNotification(id, updates) {
    try {
      const {
        subject,
        body,
        category,
        frequency,
        scheduleTime,
        scheduleDays,
        scheduleDate,
        targetAudience,
        isActive
      } = updates;

      const updateData = {};

      if (subject !== undefined) updateData.subject = subject;
      if (body !== undefined) updateData.body = body;
      if (category !== undefined) updateData.category = category;
      if (frequency !== undefined) updateData.frequency = frequency;
      if (scheduleTime !== undefined) updateData.schedule_time = scheduleTime;
      if (scheduleDays !== undefined) updateData.schedule_days = scheduleDays;
      if (scheduleDate !== undefined) updateData.schedule_date = scheduleDate;
      if (targetAudience !== undefined) updateData.target_audience = targetAudience;
      if (isActive !== undefined) updateData.is_active = isActive;

      // Recalculate next_send_at if scheduling parameters changed
      if (frequency || scheduleTime || scheduleDays || scheduleDate) {
        const adminClient = createAdminClient();
        const { data: existing } = await adminClient
          .from('scheduled_notifications')
          .select('frequency, schedule_time, schedule_days, schedule_date')
          .eq('id', id)
          .single();

        if (existing) {
          updateData.next_send_at = this.calculateNextSendTime(
            frequency || existing.frequency,
            scheduleTime || existing.schedule_time,
            scheduleDays || existing.schedule_days,
            scheduleDate || existing.schedule_date
          );
        }
      }

      const adminClient = createAdminClient();
      const { data: scheduledNotification, error } = await adminClient
        .from('scheduled_notifications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating scheduled notification:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        scheduledNotification
      };
    } catch (error) {
      console.error('Error in updateScheduledNotification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete (deactivate) a scheduled notification
   */
  async deleteScheduledNotification(id) {
    try {
      const adminClient = createAdminClient();
      const { error } = await adminClient
        .from('scheduled_notifications')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting scheduled notification:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteScheduledNotification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate the next send time based on frequency and schedule parameters
   */
  calculateNextSendTime(frequency, scheduleTime, scheduleDays, scheduleDate) {
    const now = new Date();
    const [hours, minutes] = scheduleTime.split(':').map(Number);

    switch (frequency) {
      case 'daily': {
        const nextSend = new Date(now);
        nextSend.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (nextSend <= now) {
          nextSend.setDate(nextSend.getDate() + 1);
        }
        return nextSend.toISOString();
      }

      case 'weekly': {
        // scheduleDays is an array like [1, 3, 5] (Monday, Wednesday, Friday)
        const nextSend = new Date(now);
        nextSend.setHours(hours, minutes, 0, 0);

        const currentDay = now.getDay();
        let daysUntilNext = 7; // Default to next week

        // Find the next scheduled day
        for (const day of scheduleDays.sort((a, b) => a - b)) {
          let diff = day - currentDay;
          if (diff < 0) diff += 7; // Next week
          if (diff === 0 && nextSend <= now) diff = 7; // If today but time passed, next week

          if (diff < daysUntilNext) {
            daysUntilNext = diff;
          }
        }

        nextSend.setDate(nextSend.getDate() + daysUntilNext);
        return nextSend.toISOString();
      }

      case 'monthly': {
        // scheduleDate is day of month (1-31)
        const dayOfMonth = parseInt(scheduleDate);
        const nextSend = new Date(now);
        nextSend.setDate(dayOfMonth);
        nextSend.setHours(hours, minutes, 0, 0);

        // If this month's date has passed, go to next month
        if (nextSend <= now) {
          nextSend.setMonth(nextSend.getMonth() + 1);
        }

        // Handle months with fewer days
        if (nextSend.getDate() !== dayOfMonth) {
          nextSend.setDate(0); // Last day of previous month
        }

        return nextSend.toISOString();
      }

      default:
        return now.toISOString();
    }
  }

  /**
   * Get scheduled notifications ready to be sent
   */
  async getNotificationsToSend() {
    try {
      const adminClient = createAdminClient();
      const now = new Date().toISOString();

      const { data, error } = await adminClient
        .from('scheduled_notifications')
        .select('*')
        .eq('is_active', true)
        .lte('next_send_at', now);

      if (error) {
        console.error('Error fetching notifications to send:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        notifications: data || []
      };
    } catch (error) {
      console.error('Error in getNotificationsToSend:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update last_sent_at and calculate next_send_at after sending
   */
  async updateAfterSend(id) {
    try {
      const adminClient = createAdminClient();

      // Get the current scheduled notification
      const { data: scheduled, error: fetchError } = await adminClient
        .from('scheduled_notifications')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !scheduled) {
        return { success: false, error: 'Scheduled notification not found' };
      }

      const now = new Date().toISOString();
      const updateData = {
        last_sent_at: now
      };

      // Calculate next send time for recurring notifications (all are recurring now)
      updateData.next_send_at = this.calculateNextSendTime(
        scheduled.frequency,
        scheduled.schedule_time,
        scheduled.schedule_days,
        scheduled.schedule_date
      );

      const { error: updateError } = await adminClient
        .from('scheduled_notifications')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        console.error('Error updating after send:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateAfterSend:', error);
      return { success: false, error: error.message };
    }
  }
}

const service = new ScheduledNotificationService();
export default service;
