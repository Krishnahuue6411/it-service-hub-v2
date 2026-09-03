-- ==============================================================================
-- MULTI-TENANT B2B BILLING & ERP PLATFORM DATABASE SCHEMA (PostgreSQL / Supabase)
-- Architecture: "Vyapar" / "myBillBook" Style Multi-Tenant Accounting & Operations
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BUSINESSES (Tenant Root Entity)
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trade_name TEXT,
    gstin VARCHAR(15),
    state_code VARCHAR(2),
    address TEXT,
    city TEXT,
    state TEXT,
    pincode VARCHAR(10),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    logo_url TEXT,
    
    -- Banking & UPI Settlement Info
    bank_name TEXT,
    account_no TEXT,
    ifsc_code VARCHAR(15),
    branch_name TEXT,
    upi_id VARCHAR(100),
    
    -- Dynamic Feature Flags & Customizations (JSONB)
    settings JSONB NOT NULL DEFAULT '{
        "enable_gst": true,
        "print_format": "A4",
        "enable_bom": false,
        "enable_po": true,
        "enable_barcode": false,
        "show_vehicle_no": false,
        "invoice_prefix": "INV/26-27/",
        "next_invoice_number": 1001,
        "terms_and_conditions": "1. Goods once sold will not be taken back.\n2. Interest @18% p.a. will be charged if payment is delayed.\n3. Subject to local jurisdiction only.",
        "signature_url": null,
        "theme_color": "#0F172A"
    }'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BUSINESS_MEMBERS (Multi-Tenant Team RBAC)
CREATE TABLE IF NOT EXISTS public.business_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'OPERATOR' CHECK (role IN ('OWNER', 'ADMIN', 'ACCOUNTANT', 'OPERATOR', 'SALES_REP')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(business_id, user_id)
);

-- 3. PARTIES (Khata / Ledger: Customers & Suppliers)
CREATE TABLE IF NOT EXISTS public.parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CUSTOMER', 'SUPPLIER')),
    name TEXT NOT NULL,
    company_name TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    gstin VARCHAR(15),
    state_code VARCHAR(2),
    billing_address TEXT,
    shipping_address TEXT,
    credit_limit NUMERIC(12, 2) DEFAULT 0.00,
    -- positive = receivable (Customer owes money), negative = payable (We owe Supplier)
    current_balance NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ITEMS (Inventory, Raw Materials, Finished Goods & Services)
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    item_type VARCHAR(20) NOT NULL DEFAULT 'FINISHED_GOOD' CHECK (item_type IN ('FINISHED_GOOD', 'RAW_MATERIAL', 'SERVICE')),
    sku_barcode VARCHAR(100),
    hsn_sac_code VARCHAR(20),
    unit VARCHAR(10) NOT NULL DEFAULT 'PCS' CHECK (unit IN ('PCS', 'NOS', 'KG', 'MTR', 'PKT', 'LTR', 'BOX', 'BAG', 'SET')),
    purchase_price NUMERIC(12, 2) DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00 CHECK (tax_rate IN (0, 0.25, 3, 5, 12, 18, 28)),
    current_stock NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    low_stock_threshold NUMERIC(12, 3) DEFAULT 5.000,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PURCHASE_ORDERS (PO Procurement Workflow)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE RESTRICT,
    po_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ISSUED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED')),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(business_id, po_number)
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 3) NOT NULL DEFAULT 1.000,
    received_quantity NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL
);

-- 6. BOM_RECIPES & INGREDIENTS (Manufacturing & Bill of Materials)
CREATE TABLE IF NOT EXISTS public.bom_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    output_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    recipe_name TEXT NOT NULL,
    output_quantity NUMERIC(12, 3) NOT NULL DEFAULT 1.000,
    production_cost_overhead NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bom_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES public.bom_recipes(id) ON DELETE CASCADE,
    raw_material_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
    required_quantity NUMERIC(12, 3) NOT NULL DEFAULT 1.000,
    waste_percentage NUMERIC(5, 2) DEFAULT 0.00
);

-- 7. INVOICES & INVOICE_ITEMS (B2B Tax Invoices & Sales Operations)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('PAID', 'PARTIALLY_PAID', 'UNPAID', 'CANCELLED')),
    payment_mode VARCHAR(20) NOT NULL DEFAULT 'CREDIT' CHECK (payment_mode IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT')),
    
    -- Subtotals & Tax Breakdown
    taxable_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    igst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    round_off NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Logistics & Transporter Details
    vehicle_number VARCHAR(30),
    transporter_name VARCHAR(100),
    lr_rr_number VARCHAR(50),
    eway_bill_number VARCHAR(50),
    
    -- Print Template & Metadata
    print_format VARCHAR(20) NOT NULL DEFAULT 'A4' CHECK (print_format IN ('A4', 'A5', 'THERMAL_3INCH')),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(business_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
    item_name TEXT NOT NULL,
    hsn_sac_code VARCHAR(20),
    quantity NUMERIC(12, 3) NOT NULL DEFAULT 1.000,
    unit VARCHAR(10) NOT NULL DEFAULT 'PCS',
    unit_price NUMERIC(12, 2) NOT NULL,
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    taxable_value NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    cgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    igst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL
);

-- 8. STOCK_MOVEMENTS (Inventory Ledger & Audit Trail)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('PURCHASE_IN', 'SALE_OUT', 'BOM_MANUFACTURE_IN', 'BOM_CONSUMPTION_OUT', 'ADJUSTMENT_ADD', 'ADJUSTMENT_REDUCE', 'DAMAGE')),
    quantity NUMERIC(12, 3) NOT NULL,
    unit_cost NUMERIC(12, 2),
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) MULTI-TENANT ISOLATION POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Helper Security Function: Check if auth user is member or owner of business
CREATE OR REPLACE FUNCTION public.is_business_member(b_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.businesses WHERE id = b_id AND owner_user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.business_members WHERE business_id = b_id AND user_id = auth.uid() AND is_active = true
    );
$$;

-- RLS: businesses
CREATE POLICY "Users can view and manage their own businesses"
ON public.businesses
FOR ALL
USING (owner_user_id = auth.uid() OR id IN (SELECT business_id FROM public.business_members WHERE user_id = auth.uid()));

-- RLS: business_members
CREATE POLICY "Business members access policy"
ON public.business_members
FOR ALL
USING (public.is_business_member(business_id));

-- RLS: parties
CREATE POLICY "Parties multi-tenant isolation"
ON public.parties
FOR ALL
USING (public.is_business_member(business_id));

-- RLS: items
CREATE POLICY "Items multi-tenant isolation"
ON public.items
FOR ALL
USING (public.is_business_member(business_id));

-- RLS: purchase_orders
CREATE POLICY "Purchase orders multi-tenant isolation"
ON public.purchase_orders
FOR ALL
USING (public.is_business_member(business_id));

-- RLS: purchase_order_items
CREATE POLICY "Purchase order items isolation"
ON public.purchase_order_items
FOR ALL
USING (EXISTS (SELECT 1 FROM public.purchase_orders po WHERE po.id = purchase_order_id AND public.is_business_member(po.business_id)));

-- RLS: bom_recipes
CREATE POLICY "BOM recipes multi-tenant isolation"
ON public.bom_recipes
FOR ALL
USING (public.is_business_member(business_id));

-- RLS: bom_ingredients
CREATE POLICY "BOM ingredients isolation"
ON public.bom_ingredients
FOR ALL
USING (EXISTS (SELECT 1 FROM public.bom_recipes br WHERE br.id = recipe_id AND public.is_business_member(br.business_id)));

-- RLS: invoices
CREATE POLICY "Invoices multi-tenant isolation"
ON public.invoices
FOR ALL
USING (public.is_business_member(business_id));

-- RLS: invoice_items
CREATE POLICY "Invoice items isolation"
ON public.invoice_items
FOR ALL
USING (EXISTS (SELECT 1 FROM public.invoices inv WHERE inv.id = invoice_id AND public.is_business_member(inv.business_id)));

-- RLS: stock_movements
CREATE POLICY "Stock movements isolation"
ON public.stock_movements
FOR ALL
USING (public.is_business_member(business_id));

-- ==============================================================================
-- INDEXES FOR MAXIMUM ERP QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_parties_business_type ON public.parties(business_id, type);
CREATE INDEX IF NOT EXISTS idx_items_business_type ON public.items(business_id, item_type);
CREATE INDEX IF NOT EXISTS idx_items_sku ON public.items(business_id, sku_barcode);
CREATE INDEX IF NOT EXISTS idx_invoices_business_date ON public.invoices(business_id, invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(business_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_po_business ON public.purchase_orders(business_id, status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON public.stock_movements(business_id, item_id, created_at DESC);

-- ==============================================================================
-- SAMPLE SEED DATA (Ahilyanagar MIDC Manufacturing & Trading Demo Business)
-- ==============================================================================
INSERT INTO public.businesses (
    id,
    name,
    trade_name,
    gstin,
    state_code,
    address,
    city,
    state,
    pincode,
    phone,
    email,
    bank_name,
    account_no,
    ifsc_code,
    branch_name,
    upi_id,
    settings
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'PAIS Industrial Automation & IT Solutions',
    'PAIS Automation MIDC',
    '27AAAAA0000A1Z5',
    '27',
    'Plot No. M-45, Phase II, MIDC Industrial Area, Nagapur',
    'Ahilyanagar',
    'Maharashtra',
    '414111',
    '+91 8787828888',
    'accounts@paisautomation.com',
    'HDFC Bank Ltd',
    '50200088994411',
    'HDFC0001234',
    'MIDC Nagapur Branch',
    'paisautomation@okhdfcbank',
    '{
        "enable_gst": true,
        "print_format": "A4",
        "enable_bom": true,
        "enable_po": true,
        "enable_barcode": true,
        "show_vehicle_no": true,
        "invoice_prefix": "PAIS/26-27/",
        "next_invoice_number": 1042,
        "terms_and_conditions": "1. Goods once sold will not be taken back.\n2. Payment terms: Net 30 days.\n3. Warranty as per manufacturer terms.\n4. Subject to Ahilyanagar jurisdiction only.",
        "theme_color": "#0F172A"
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;
