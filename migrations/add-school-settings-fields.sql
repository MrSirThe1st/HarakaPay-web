-- Add new fields to schools table for enhanced settings
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_provider_config JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN schools.logo_url IS 'URL of the school logo image';
COMMENT ON COLUMN schools.currency IS 'Default currency code (ISO 4217) for the school';
COMMENT ON COLUMN schools.payment_provider IS 'Primary payment provider (mpesa, airtel_money, orange_money, etc.)';
COMMENT ON COLUMN schools.payment_provider_config IS 'Configuration settings for the payment provider';

-- Update the updated_at trigger to include new fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger exists for schools table
DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
