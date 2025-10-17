-- Create store system tables
-- Migration: create-store-system.sql

-- Create enums for store system
CREATE TYPE item_type AS ENUM ('sale', 'hire');
CREATE TYPE duration_type AS ENUM ('daily', 'weekly', 'monthly', 'per_term', 'per_year', 'custom');
CREATE TYPE order_type AS ENUM ('purchase', 'hire');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE hire_status AS ENUM ('active', 'returned', 'overdue', 'lost');
CREATE TYPE request_status AS ENUM ('pending', 'acknowledged', 'fulfilled', 'cancelled');

-- Store categories table
CREATE TABLE store_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store items table
CREATE TABLE store_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES store_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    item_type item_type NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER DEFAULT 10 CHECK (low_stock_threshold >= 0),
    is_available BOOLEAN DEFAULT true,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hire settings table
CREATE TABLE hire_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES store_items(id) ON DELETE CASCADE,
    duration_type duration_type NOT NULL,
    min_duration_days INTEGER NOT NULL CHECK (min_duration_days > 0),
    max_duration_days INTEGER NOT NULL CHECK (max_duration_days >= min_duration_days),
    deposit_amount NUMERIC(10,2) CHECK (deposit_amount >= 0),
    late_fee_per_day NUMERIC(10,2) CHECK (late_fee_per_day >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id)
);

-- Store orders table
CREATE TABLE store_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    order_type order_type NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_method TEXT,
    payment_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store order items table
CREATE TABLE store_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES store_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hire records table
CREATE TABLE hire_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES store_order_items(id) ON DELETE CASCADE,
    hire_start_date DATE NOT NULL,
    hire_end_date DATE NOT NULL,
    expected_return_date DATE NOT NULL,
    actual_return_date DATE,
    deposit_paid NUMERIC(10,2) DEFAULT 0 CHECK (deposit_paid >= 0),
    deposit_returned BOOLEAN DEFAULT false,
    late_fees NUMERIC(10,2) DEFAULT 0 CHECK (late_fees >= 0),
    status hire_status DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (hire_end_date >= hire_start_date),
    CHECK (expected_return_date >= hire_end_date)
);

-- Stock requests table
CREATE TABLE stock_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES store_items(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
    message TEXT,
    status request_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_store_categories_school_id ON store_categories(school_id);
CREATE INDEX idx_store_items_school_id ON store_items(school_id);
CREATE INDEX idx_store_items_category_id ON store_items(category_id);
CREATE INDEX idx_store_items_item_type ON store_items(item_type);
CREATE INDEX idx_store_items_is_available ON store_items(is_available);
CREATE INDEX idx_store_orders_school_id ON store_orders(school_id);
CREATE INDEX idx_store_orders_parent_id ON store_orders(parent_id);
CREATE INDEX idx_store_orders_student_id ON store_orders(student_id);
CREATE INDEX idx_store_orders_status ON store_orders(status);
CREATE INDEX idx_store_orders_payment_status ON store_orders(payment_status);
CREATE INDEX idx_store_order_items_order_id ON store_order_items(order_id);
CREATE INDEX idx_store_order_items_item_id ON store_order_items(item_id);
CREATE INDEX idx_hire_records_order_item_id ON hire_records(order_item_id);
CREATE INDEX idx_hire_records_status ON hire_records(status);
CREATE INDEX idx_stock_requests_item_id ON stock_requests(item_id);
CREATE INDEX idx_stock_requests_parent_id ON stock_requests(parent_id);
CREATE INDEX idx_stock_requests_status ON stock_requests(status);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_store_categories_updated_at BEFORE UPDATE ON store_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_items_updated_at BEFORE UPDATE ON store_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hire_settings_updated_at BEFORE UPDATE ON hire_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_orders_updated_at BEFORE UPDATE ON store_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hire_records_updated_at BEFORE UPDATE ON hire_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_requests_updated_at BEFORE UPDATE ON stock_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    order_num TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 10) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM store_orders
    WHERE order_number LIKE 'ORD-' || year_part || '-%';
    
    -- Format as 6-digit number
    order_num := 'ORD-' || year_part || '-' || LPAD(sequence_part::TEXT, 6, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-generate order numbers
CREATE TRIGGER set_store_orders_order_number 
    BEFORE INSERT ON store_orders 
    FOR EACH ROW 
    EXECUTE FUNCTION set_order_number();

-- RLS Policies

-- Enable RLS on all tables
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hire_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hire_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_requests ENABLE ROW LEVEL SECURITY;

-- Store categories policies
CREATE POLICY "School staff can manage store categories" ON store_categories
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.school_id = store_categories.school_id
        AND profiles.role IN ('school_admin', 'school_staff')
        AND profiles.is_active = true
    )
);

CREATE POLICY "Platform admins can manage all store categories" ON store_categories
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role IN ('super_admin', 'platform_admin', 'support_admin')
        AND profiles.is_active = true
    )
);

CREATE POLICY "Parents can view store categories" ON store_categories
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM parents 
        WHERE parents.user_id = auth.uid()
    )
);

CREATE POLICY "Service role full access" ON store_categories
FOR ALL USING (auth.role() = 'service_role');

-- Store items policies
CREATE POLICY "School staff can manage store items" ON store_items
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.school_id = store_items.school_id
        AND profiles.role IN ('school_admin', 'school_staff')
        AND profiles.is_active = true
    )
);

CREATE POLICY "Platform admins can manage all store items" ON store_items
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role IN ('super_admin', 'platform_admin', 'support_admin')
        AND profiles.is_active = true
    )
);

CREATE POLICY "Parents can view available store items" ON store_items
FOR SELECT USING (
    is_available = true AND
    EXISTS (
        SELECT 1 FROM parents 
        WHERE parents.user_id = auth.uid()
    )
);

CREATE POLICY "Service role full access" ON store_items
FOR ALL USING (auth.role() = 'service_role');

-- Store orders policies
CREATE POLICY "School staff can manage store orders" ON store_orders
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.school_id = store_orders.school_id
        AND profiles.role IN ('school_admin', 'school_staff')
        AND profiles.is_active = true
    )
);

CREATE POLICY "Platform admins can manage all store orders" ON store_orders
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role IN ('super_admin', 'platform_admin', 'support_admin')
        AND profiles.is_active = true
    )
);

CREATE POLICY "Parents can manage their own orders" ON store_orders
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM parents 
        WHERE parents.user_id = auth.uid()
        AND parents.id = store_orders.parent_id
    )
);

CREATE POLICY "Service role full access" ON store_orders
FOR ALL USING (auth.role() = 'service_role');