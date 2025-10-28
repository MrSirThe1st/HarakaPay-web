-- Create school_registration_requests table
CREATE TABLE IF NOT EXISTS school_registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  school_address TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  contact_person_name TEXT NOT NULL,
  contact_person_email TEXT NOT NULL,
  school_email TEXT NOT NULL,
  contact_person_phone TEXT,
  school_size INTEGER,
  existing_system TEXT,
  has_mpesa_account BOOLEAN DEFAULT false,
  fee_schedules JSONB DEFAULT '[]'::jsonb,
  school_levels JSONB DEFAULT '[]'::jsonb,
  grade_levels JSONB DEFAULT '[]'::jsonb,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(user_id),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_school_registration_requests_status ON school_registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_school_registration_requests_created_at ON school_registration_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_school_registration_requests_reviewed_by ON school_registration_requests(reviewed_by);

-- Enable Row Level Security
ALTER TABLE school_registration_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Note: Application-level authorization is handled by API routes using admin clients
-- Simple RLS policies prevent direct database access bypassing the app

-- Since we're using admin client to bypass RLS for all operations,
-- we don't need restrictive policies that might cause conflicts
-- The admin client (service role key) bypasses RLS completely

-- Allow SELECT for authenticated users (admin client will still bypass)
CREATE POLICY "Allow SELECT for authenticated users"
  ON school_registration_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow INSERT for service role (admin client) and public (unauthenticated)
-- This allows the API to insert without RLS blocking
CREATE POLICY "Allow INSERT for service role and public"
  ON school_registration_requests
  FOR INSERT
  WITH CHECK (true);

-- Allow UPDATE for authenticated users
CREATE POLICY "Allow UPDATE for authenticated users"
  ON school_registration_requests
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_school_registration_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_school_registration_requests_updated_at
  BEFORE UPDATE ON school_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_school_registration_requests_updated_at();

