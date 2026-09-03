-- ==============================================================================
-- IT SERVICE HUB (AHILYANAGAR MIDC) - PRODUCTION SUPABASE / POSTGRES SCHEMA
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. USERS, PROFILES & B2B CLIENTS
-- ==============================================================================
CREATE TYPE user_role AS ENUM ('customer', 'technician', 'admin');

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role user_role DEFAULT 'customer',
    company_name VARCHAR(255),
    gstin VARCHAR(15), -- B2B GST Verification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    address_type VARCHAR(50) DEFAULT 'Business', -- 'Home', 'Office', 'Factory'
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    flat_plot_no VARCHAR(255) NOT NULL,
    street_area VARCHAR(255) NOT NULL, -- e.g. M45 MIDC Nagapur
    city VARCHAR(100) DEFAULT 'Ahilyanagar',
    state VARCHAR(100) DEFAULT 'Maharashtra',
    pincode VARCHAR(10) DEFAULT '414111',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 2. PRODUCTS, CATEGORIES & INVENTORY
-- ==============================================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    brand VARCHAR(100) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    hsn_code VARCHAR(20) DEFAULT '847170', -- Default IT Hardware HSN
    description TEXT,
    specs JSONB DEFAULT '{}'::jsonb, -- e.g. {"capacity": "1TB", "read_speed": "3500MB/s"}
    purchase_price DECIMAL(10, 2) NOT NULL,
    mrp DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    gst_rate DECIMAL(5, 2) DEFAULT 18.00, -- 18%, 12%, 5%
    stock_qty INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 3,
    is_refurbished BOOLEAN DEFAULT false,
    warranty_period VARCHAR(100) DEFAULT '3 Years Brand Warranty',
    image_urls TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. ORDERS, CHECKOUT & B2B GST INVOICES
-- ==============================================================================
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'b2b_credit');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. IT-SH-2026-8894
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    total_gst DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_charge DECIMAL(10, 2) DEFAULT 0.00,
    grand_total DECIMAL(10, 2) NOT NULL,
    is_b2b_gst_order BOOLEAN DEFAULT false,
    client_gstin VARCHAR(15),
    client_company_name VARCHAR(255),
    payment_method VARCHAR(50) DEFAULT 'UPI', -- 'UPI', 'Card', 'COD', 'NetBanking'
    payment_status payment_status DEFAULT 'pending',
    order_status order_status DEFAULT 'confirmed',
    delivery_type VARCHAR(50) DEFAULT 'MIDC_2HR_EXPRESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    gst_rate DECIMAL(5, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10, 2) NOT NULL
);

-- ==============================================================================
-- 4. DIGITAL REPAIR JOB CARDS & TICKETING
-- ==============================================================================
CREATE TYPE job_status AS ENUM ('received', 'diagnosing', 'quote_approved', 'repairing', 'ready_for_dispatch', 'delivered');

CREATE TABLE repair_job_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_card_no VARCHAR(50) UNIQUE NOT NULL, -- e.g. #JOB-8941
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    device_type VARCHAR(100) NOT NULL, -- 'Laptop', 'Desktop PC', 'CCTV DVR', 'Printer'
    device_model VARCHAR(255) NOT NULL, -- e.g. 'Dell Latitude 3420'
    serial_no VARCHAR(100),
    reported_issue TEXT NOT NULL,
    technician_notes TEXT,
    parts_consumed JSONB DEFAULT '[]'::jsonb, -- e.g. [{"part": "512GB NVMe SSD", "cost": 2400}]
    estimated_cost DECIMAL(10, 2) DEFAULT 0.00,
    final_amount DECIMAL(10, 2) DEFAULT 0.00,
    status job_status DEFAULT 'received',
    received_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================================================
-- 5. B2B AMC (ANNUAL MAINTENANCE CONTRACTS)
-- ==============================================================================
CREATE TYPE amc_status AS ENUM ('active', 'expired', 'renewed', 'cancelled');

CREATE TABLE amc_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_no VARCHAR(50) UNIQUE NOT NULL, -- e.g. #AMC-MIDC-2026-04
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    contract_title VARCHAR(255) NOT NULL, -- e.g. 'Annual IT & CCTV Maintenance - Plant 1'
    covered_assets JSONB NOT NULL, -- e.g. {"pcs": 12, "cameras": 8, "printers": 3, "routers": 2}
    total_annual_fee DECIMAL(10, 2) NOT NULL,
    total_visits_allocated INT DEFAULT 4,
    visits_completed INT DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    next_visit_date DATE,
    status amc_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. TECHNICIAN REVIEWS & RATINGS (Extracted from service_platform)
-- ==============================================================================
CREATE TABLE technician_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_card_id UUID REFERENCES repair_job_cards(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE amc_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_reviews ENABLE ROW LEVEL SECURITY;

-- Customers can view their own profile, orders, and repair jobs
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = orders.profile_id));
CREATE POLICY "Users can view their own repair jobs" ON repair_job_cards FOR SELECT USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = repair_job_cards.customer_id));
CREATE POLICY "Public read for products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read for technician reviews" ON technician_reviews FOR SELECT USING (true);

