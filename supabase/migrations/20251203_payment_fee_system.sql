-- -- Payment Fee System Migration
-- -- Creates tables for managing platform payment fees with dual approval workflow

-- -- 1. Payment Fee Rates Table (stores rate configurations per school)
-- CREATE TABLE payment_fee_rates (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
--   fee_percentage DECIMAL(5,2) NOT NULL CHECK (fee_percentage >= 0 AND fee_percentage <= 100),

--   -- Approval tracking
--   status TEXT NOT NULL DEFAULT 'pending_school'
--     CHECK (status IN ('pending_school', 'pending_admin', 'active', 'rejected_by_school', 'rejected_by_admin', 'expired')),

--   -- Dual approval fields
--   proposed_by_id UUID NOT NULL REFERENCES profiles(id),
--   proposed_by_role TEXT NOT NULL CHECK (proposed_by_role IN ('platform_admin', 'school_admin')),
--   school_approved_at TIMESTAMPTZ,
--   school_approved_by UUID REFERENCES profiles(id),
--   admin_approved_at TIMESTAMPTZ,
--   admin_approved_by UUID REFERENCES profiles(id),
--   rejection_reason TEXT,
--   rejected_by UUID REFERENCES profiles(id),
--   rejected_at TIMESTAMPTZ,

--   -- Lifecycle management
--   effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   effective_until TIMESTAMPTZ,
--   expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'), -- Proposal expires in 7 days

--   -- Audit
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

--   -- Business rules
--   CONSTRAINT valid_approval_logic CHECK (
--     (status = 'active' AND school_approved_at IS NOT NULL AND admin_approved_at IS NOT NULL)
--     OR status != 'active'
--   ),

--   -- Only one active rate per school at a time
--   CONSTRAINT unique_active_rate_per_school UNIQUE NULLS NOT DISTINCT (school_id, status)
--     DEFERRABLE INITIALLY DEFERRED
-- );

-- -- Index for quick lookups
-- CREATE INDEX idx_payment_fee_rates_school_active ON payment_fee_rates(school_id, status)
--   WHERE status = 'active';
-- CREATE INDEX idx_payment_fee_rates_pending ON payment_fee_rates(school_id, status)
--   WHERE status LIKE 'pending%';
-- CREATE INDEX idx_payment_fee_rates_effective ON payment_fee_rates(school_id, effective_from DESC)
--   WHERE status = 'active';

-- -- 2. Payment Fee Rate History (immutable audit trail)
-- CREATE TABLE payment_fee_rate_history (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   rate_id UUID NOT NULL REFERENCES payment_fee_rates(id) ON DELETE CASCADE,
--   school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
--   fee_percentage DECIMAL(5,2) NOT NULL,
--   status TEXT NOT NULL,
--   changed_by UUID REFERENCES profiles(id),
--   change_type TEXT NOT NULL CHECK (change_type IN ('created', 'approved_school', 'approved_admin', 'rejected', 'activated', 'expired', 'updated')),
--   change_details JSONB,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- CREATE INDEX idx_payment_fee_history_rate ON payment_fee_rate_history(rate_id, created_at DESC);
-- CREATE INDEX idx_payment_fee_history_school ON payment_fee_rate_history(school_id, created_at DESC);

-- -- 3. Transaction Fee Snapshots (locked at transaction time)
-- CREATE TABLE transaction_fee_snapshots (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
--   student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
--   school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,

--   -- Immutable fee data at transaction time
--   fee_rate_id UUID REFERENCES payment_fee_rates(id),
--   fee_percentage DECIMAL(5,2) NOT NULL,
--   base_amount DECIMAL(10,2) NOT NULL, -- Amount before fee
--   fee_amount DECIMAL(10,2) NOT NULL, -- Calculated platform fee
--   total_amount DECIMAL(10,2) NOT NULL, -- What parent pays (base + fee)

--   -- Metadata
--   payment_method TEXT NOT NULL,
--   payment_status TEXT NOT NULL,
--   locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- CREATE UNIQUE INDEX idx_transaction_snapshots_payment ON transaction_fee_snapshots(payment_id);
-- CREATE INDEX idx_transaction_snapshots_school ON transaction_fee_snapshots(school_id, created_at DESC);
-- CREATE INDEX idx_transaction_snapshots_student ON transaction_fee_snapshots(student_id, created_at DESC);

-- -- RLS Policies
-- ALTER TABLE payment_fee_rates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payment_fee_rate_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transaction_fee_snapshots ENABLE ROW LEVEL SECURITY;

-- -- Platform admins can view/manage all rates
-- CREATE POLICY payment_fee_rates_admin_full_access ON payment_fee_rates
--   FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.user_id = auth.uid()
--       AND profiles.role IN ('super_admin', 'platform_admin')
--       AND profiles.is_active = true
--     )
--   )
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.user_id = auth.uid()
--       AND profiles.role IN ('super_admin', 'platform_admin')
--       AND profiles.is_active = true
--     )
--   );

-- -- School admins can view their own rates
-- CREATE POLICY payment_fee_rates_school_access ON payment_fee_rates
--   FOR SELECT
--   TO authenticated
--   USING (
--     school_id IN (
--       SELECT school_id FROM profiles
--       WHERE user_id = auth.uid()
--       AND role = 'school_admin'
--       AND is_active = true
--     )
--   );

-- -- History is read-only for authorized users
-- CREATE POLICY payment_fee_history_read ON payment_fee_rate_history
--   FOR SELECT
--   TO authenticated
--   USING (
--     school_id IN (
--       SELECT school_id FROM profiles
--       WHERE user_id = auth.uid()
--       AND is_active = true
--     )
--     OR EXISTS (
--       SELECT 1 FROM profiles
--       WHERE user_id = auth.uid()
--       AND role IN ('super_admin', 'platform_admin')
--     )
--   );

-- -- Transaction snapshots readable by school staff and admins
-- CREATE POLICY transaction_snapshots_read ON transaction_fee_snapshots
--   FOR SELECT
--   TO authenticated
--   USING (
--     school_id IN (
--       SELECT school_id FROM profiles
--       WHERE user_id = auth.uid()
--       AND is_active = true
--     )
--     OR EXISTS (
--       SELECT 1 FROM profiles
--       WHERE user_id = auth.uid()
--       AND role IN ('super_admin', 'platform_admin')
--     )
--   );

-- -- Trigger to maintain history automatically
-- CREATE OR REPLACE FUNCTION track_payment_fee_rate_changes()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO payment_fee_rate_history (
--     rate_id,
--     school_id,
--     fee_percentage,
--     status,
--     changed_by,
--     change_type,
--     change_details
--   ) VALUES (
--     COALESCE(NEW.id, OLD.id),
--     COALESCE(NEW.school_id, OLD.school_id),
--     COALESCE(NEW.fee_percentage, OLD.fee_percentage),
--     COALESCE(NEW.status, OLD.status),
--     COALESCE(NEW.admin_approved_by, NEW.school_approved_by, NEW.proposed_by_id),
--     CASE
--       WHEN TG_OP = 'INSERT' THEN 'created'
--       WHEN NEW.status = 'active' AND OLD.status != 'active' THEN 'activated'
--       WHEN NEW.status LIKE 'rejected%' THEN 'rejected'
--       WHEN NEW.school_approved_at IS NOT NULL AND OLD.school_approved_at IS NULL THEN 'approved_school'
--       WHEN NEW.admin_approved_at IS NOT NULL AND OLD.admin_approved_at IS NULL THEN 'approved_admin'
--       ELSE 'updated'
--     END,
--     jsonb_build_object(
--       'old_status', OLD.status,
--       'new_status', NEW.status,
--       'old_percentage', OLD.fee_percentage,
--       'new_percentage', NEW.fee_percentage
--     )
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER payment_fee_rate_history_trigger
-- AFTER INSERT OR UPDATE ON payment_fee_rates
-- FOR EACH ROW EXECUTE FUNCTION track_payment_fee_rate_changes();

-- -- Function to get active payment fee rate for a school
-- CREATE OR REPLACE FUNCTION get_active_payment_fee_rate(p_school_id UUID)
-- RETURNS DECIMAL(5,2) AS $$
-- DECLARE
--   v_rate DECIMAL(5,2);
-- BEGIN
--   SELECT fee_percentage INTO v_rate
--   FROM payment_fee_rates
--   WHERE school_id = p_school_id
--     AND status = 'active'
--     AND effective_from <= NOW()
--     AND (effective_until IS NULL OR effective_until > NOW())
--   ORDER BY effective_from DESC
--   LIMIT 1;

--   RETURN COALESCE(v_rate, 2.5); -- Default 2.5% if no rate found
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- -- Auto-update updated_at timestamp
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER update_payment_fee_rates_updated_at
-- BEFORE UPDATE ON payment_fee_rates
-- FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -- Function to expire old pending proposals
-- CREATE OR REPLACE FUNCTION expire_pending_fee_proposals()
-- RETURNS void AS $$
-- BEGIN
--   UPDATE payment_fee_rates
--   SET status = 'expired'
--   WHERE status LIKE 'pending%'
--     AND expires_at < NOW();
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- -- Comments for documentation
-- COMMENT ON TABLE payment_fee_rates IS 'Stores platform payment fee percentages per school with dual approval workflow';
-- COMMENT ON TABLE payment_fee_rate_history IS 'Immutable audit trail of all changes to payment fee rates';
-- COMMENT ON TABLE transaction_fee_snapshots IS 'Locked snapshot of fee calculation at transaction time for dispute resolution';
-- COMMENT ON FUNCTION get_active_payment_fee_rate(UUID) IS 'Returns active payment fee percentage for a school, defaults to 2.5%';
-- COMMENT ON FUNCTION expire_pending_fee_proposals() IS 'Expires pending proposals older than 7 days';
