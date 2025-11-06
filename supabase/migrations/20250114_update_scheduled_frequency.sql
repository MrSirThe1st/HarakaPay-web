-- Migration: Update scheduled notifications frequency constraint
-- Created: 2025-01-14
-- Description: Remove 'once' frequency option (use regular notifications for one-time sends)

-- Drop the old constraint
ALTER TABLE scheduled_notifications DROP CONSTRAINT IF EXISTS scheduled_notifications_frequency_check;

-- Add new constraint without 'once'
ALTER TABLE scheduled_notifications
ADD CONSTRAINT scheduled_notifications_frequency_check
CHECK (frequency IN ('daily', 'weekly', 'monthly'));

-- Update schedule_date column comment
COMMENT ON COLUMN scheduled_notifications.schedule_date IS 'Day of month (1-31) for monthly notifications';
