-- Migration: Remove notification templates feature
-- Created: 2025-01-13
-- Description: Removes notification_templates table but keeps scheduled_notifications
--              by redesigning it to store content directly instead of referencing templates

-- 1. Remove template_id foreign key from scheduled_notifications and add content columns
ALTER TABLE scheduled_notifications
DROP COLUMN IF EXISTS template_id,
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS body TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- 2. Drop template_id column from notifications table
ALTER TABLE notifications
DROP COLUMN IF EXISTS template_id;

-- 3. Drop notification_templates table
DROP TABLE IF EXISTS notification_templates CASCADE;

-- 4. Add check constraint for scheduled notifications category
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'scheduled_notifications_category_check'
  ) THEN
    ALTER TABLE scheduled_notifications
    ADD CONSTRAINT scheduled_notifications_category_check
    CHECK (category IN ('general', 'fees', 'academic', 'events', 'urgent', 'attendance', 'other'));
  END IF;
END $$;

-- Note: Scheduled notifications now store their content directly.
-- Any existing scheduled notifications will need to be recreated with content.
