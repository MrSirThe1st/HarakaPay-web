-- Migration: Create scheduled_notifications table
-- Created: 2025-01-11

-- Create scheduled_notifications table
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES notification_templates(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly')),
  schedule_time TEXT NOT NULL, -- HH:MM format (24-hour)
  schedule_days INTEGER[], -- For weekly: [0,1,2,3,4,5,6] where Sunday=0
  schedule_date TEXT, -- For monthly (1-31) or once (full date)
  target_audience JSONB DEFAULT '{}'::jsonb,
  next_send_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_school_id ON scheduled_notifications(school_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_template_id ON scheduled_notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_next_send_at ON scheduled_notifications(next_send_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_active ON scheduled_notifications(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_frequency ON scheduled_notifications(frequency);

-- Enable RLS
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "School staff can view their school scheduled notifications"
  ON scheduled_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('school_admin', 'school_staff')
      AND profiles.school_id = scheduled_notifications.school_id
    )
  );

CREATE POLICY "School staff can create scheduled notifications"
  ON scheduled_notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('school_admin', 'school_staff')
      AND profiles.school_id = scheduled_notifications.school_id
    )
  );

CREATE POLICY "School staff can update their school scheduled notifications"
  ON scheduled_notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('school_admin', 'school_staff')
      AND profiles.school_id = scheduled_notifications.school_id
    )
  );

CREATE POLICY "School staff can delete their school scheduled notifications"
  ON scheduled_notifications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('school_admin', 'school_staff')
      AND profiles.school_id = scheduled_notifications.school_id
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_scheduled_notifications_updated_at
  BEFORE UPDATE ON scheduled_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add table comment
COMMENT ON TABLE scheduled_notifications IS 'Stores recurring/scheduled notification configurations';
COMMENT ON COLUMN scheduled_notifications.schedule_days IS 'Array of weekdays (0=Sunday, 6=Saturday) for weekly notifications';
COMMENT ON COLUMN scheduled_notifications.schedule_date IS 'Day of month (1-31) for monthly, or full date (YYYY-MM-DD) for once';
COMMENT ON COLUMN scheduled_notifications.next_send_at IS 'Calculated timestamp for next notification send';