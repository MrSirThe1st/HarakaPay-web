-- Messaging System Migration
-- Parent→School and School→Admin communication
-- Authorization handled at API layer using adminClient (service role)

-- Table: parent_school_messages
CREATE TABLE IF NOT EXISTS parent_school_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: school_admin_messages
CREATE TABLE IF NOT EXISTS school_admin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  sent_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_parent_school_messages_school ON parent_school_messages(school_id, created_at DESC);
CREATE INDEX idx_parent_school_messages_parent ON parent_school_messages(parent_id, created_at DESC);
CREATE INDEX idx_parent_school_messages_status ON parent_school_messages(status) WHERE status = 'unread';
CREATE INDEX idx_school_admin_messages_created ON school_admin_messages(created_at DESC);
CREATE INDEX idx_school_admin_messages_status ON school_admin_messages(status) WHERE status = 'unread';

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_parent_school_messages_updated_at
  BEFORE UPDATE ON parent_school_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_admin_messages_updated_at
  BEFORE UPDATE ON school_admin_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
-- Enable RLS for security (even though API uses service role which bypasses RLS)
-- All authorization is handled at API layer in route handlers

ALTER TABLE parent_school_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_admin_messages ENABLE ROW LEVEL SECURITY;

-- No policies needed - API routes use createAdminClient() (service role) which bypasses RLS
-- All authorization checks are done in API routes before DB operations

-- Comments
COMMENT ON TABLE parent_school_messages IS 'Messages sent from parents to school about their children';
COMMENT ON TABLE school_admin_messages IS 'Messages sent from schools to platform administrators';
COMMENT ON COLUMN parent_school_messages.student_id IS 'Which child the message is regarding';
COMMENT ON COLUMN school_admin_messages.sent_by IS 'Profile ID of school staff who sent the message';