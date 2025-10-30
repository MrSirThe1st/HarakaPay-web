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
  existing_systems TEXT[], -- Array of existing systems
  has_mpesa_account BOOLEAN DEFAULT false,
  fee_schedules TEXT[], -- Array of fee schedule types
  school_levels TEXT[], -- Array of school levels
  grade_levels TEXT[], -- Array of grade levels
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected')),
  reviewed_by UUID,
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

-- Allow SELECT for authenticated users
CREATE POLICY "Allow SELECT for authenticated users"
  ON school_registration_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow INSERT for service role and public
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