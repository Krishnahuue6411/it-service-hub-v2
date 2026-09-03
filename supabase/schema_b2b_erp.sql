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

-- ==============================================================================
-- ATOMIC TRANSACTION PROCEDURE: create_sales_invoice
-- Atomically creates invoice, inserts line items, decrements item stock,
-- records stock_movements (SALE_OUT), updates party ledger balance, and
-- advances the sequential invoice number.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_sales_invoice(p_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_business_id UUID := (p_data->>'business_id')::UUID;
    v_customer_id UUID := (p_data->>'customer_id')::UUID;
    v_invoice_id UUID := uuid_generate_v4();
    v_invoice_number TEXT := p_data->>'invoice_number';
    v_grand_total NUMERIC := (p_data->>'grand_total')::NUMERIC;
    v_paid_amount NUMERIC := COALESCE((p_data->>'paid_amount')::NUMERIC, 0.00);
    v_balance_amount NUMERIC := v_grand_total - v_paid_amount;
    v_item JSONB;
    v_item_id UUID;
    v_qty NUMERIC;
    v_next_number INT;
BEGIN
    -- 1. Insert Invoices Header
    INSERT INTO public.invoices (
        id,
        business_id,
        customer_id,
        invoice_number,
        invoice_date,
        due_date,
        status,
        payment_mode,
        taxable_amount,
        cgst_amount,
        sgst_amount,
        igst_amount,
        discount_amount,
        round_off,
        grand_total,
        paid_amount,
        balance_amount,
        vehicle_number,
        transporter_name,
        lr_rr_number,
        eway_bill_number,
        print_format,
        notes
    ) VALUES (
        v_invoice_id,
        v_business_id,
        v_customer_id,
        v_invoice_number,
        COALESCE((p_data->>'invoice_date')::DATE, CURRENT_DATE),
        (p_data->>'due_date')::DATE,
        CASE 
            WHEN v_balance_amount <= 0 THEN 'PAID'
            WHEN v_paid_amount > 0 THEN 'PARTIALLY_PAID'
            ELSE 'UNPAID'
        END,
        COALESCE(p_data->>'payment_mode', 'CASH'),
        (p_data->>'taxable_amount')::NUMERIC,
        COALESCE((p_data->>'cgst_amount')::NUMERIC, 0.00),
        COALESCE((p_data->>'sgst_amount')::NUMERIC, 0.00),
        COALESCE((p_data->>'igst_amount')::NUMERIC, 0.00),
        COALESCE((p_data->>'discount_amount')::NUMERIC, 0.00),
        COALESCE((p_data->>'round_off')::NUMERIC, 0.00),
        v_grand_total,
        v_paid_amount,
        v_balance_amount,
        p_data->>'vehicle_number',
        p_data->>'transporter_name',
        p_data->>'lr_rr_number',
        p_data->>'eway_bill_number',
        COALESCE(p_data->>'print_format', 'A4'),
        p_data->>'notes'
    );

    -- 2. Insert Invoice Items and Atomically Decrement Item Inventory
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_data->'items')
    LOOP
        v_item_id := (v_item->>'item_id')::UUID;
        v_qty := (v_item->>'quantity')::NUMERIC;

        INSERT INTO public.invoice_items (
            invoice_id,
            item_id,
            item_name,
            hsn_sac_code,
            quantity,
            unit,
            unit_price,
            discount_percent,
            discount_amount,
            taxable_value,
            tax_rate,
            cgst_amount,
            sgst_amount,
            igst_amount,
            total_amount
        ) VALUES (
            v_invoice_id,
            v_item_id,
            v_item->>'item_name',
            v_item->>'hsn_sac_code',
            v_qty,
            COALESCE(v_item->>'unit', 'PCS'),
            (v_item->>'unit_price')::NUMERIC,
            COALESCE((v_item->>'discount_percent')::NUMERIC, 0.00),
            COALESCE((v_item->>'discount_amount')::NUMERIC, 0.00),
            (v_item->>'taxable_value')::NUMERIC,
            COALESCE((v_item->>'tax_rate')::NUMERIC, 18.00),
            COALESCE((v_item->>'cgst_amount')::NUMERIC, 0.00),
            COALESCE((v_item->>'sgst_amount')::NUMERIC, 0.00),
            COALESCE((v_item->>'igst_amount')::NUMERIC, 0.00),
            (v_item->>'total_amount')::NUMERIC
        );

        -- Decrement physical inventory stock
        UPDATE public.items
        SET current_stock = current_stock - v_qty,
            updated_at = NOW()
        WHERE id = v_item_id;

        -- Record stock movement ledger entry
        INSERT INTO public.stock_movements (
            business_id,
            item_id,
            movement_type,
            quantity,
            unit_cost,
            reference_id,
            notes
        ) VALUES (
            v_business_id,
            v_item_id,
            'SALE_OUT',
            -v_qty,
            (v_item->>'unit_price')::NUMERIC,
            v_invoice_id,
            'Sold in Tax Invoice #' || v_invoice_number
        );
    END LOOP;

    -- 3. Update Customer Khata Ledger Balance if Credit or Partial Payment
    IF v_balance_amount > 0 THEN
        UPDATE public.parties
        SET current_balance = current_balance + v_balance_amount,
            updated_at = NOW()
        WHERE id = v_customer_id;
    END IF;

    -- 4. Advance the Next Invoice Number in businesses.settings
    v_next_number := COALESCE(((SELECT settings->>'next_invoice_number' FROM public.businesses WHERE id = v_business_id)::INT), 1000) + 1;
    UPDATE public.businesses
    SET settings = jsonb_set(settings, '{next_invoice_number}', to_jsonb(v_next_number)),
        updated_at = NOW()
    WHERE id = v_business_id;

    RETURN jsonb_build_object(
        'success', true,
        'invoice_id', v_invoice_id,
        'invoice_number', v_invoice_number,
        'balance_amount', v_balance_amount
    );
END;
$$;

-- ==============================================================================
-- PHASE 3: PURCHASE INVOICES (Vendor Bills & Supplier Inward Ledger)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.purchase_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE RESTRICT,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    bill_number VARCHAR(50) NOT NULL,
    vendor_invoice_number VARCHAR(50),
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('PAID', 'PARTIALLY_PAID', 'UNPAID')),
    payment_mode VARCHAR(20) NOT NULL DEFAULT 'CREDIT' CHECK (payment_mode IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT')),
    taxable_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sgst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    igst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(business_id, bill_number)
);

CREATE TABLE IF NOT EXISTS public.purchase_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_invoice_id UUID NOT NULL REFERENCES public.purchase_invoices(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
    item_name TEXT NOT NULL,
    hsn_sac_code VARCHAR(20),
    quantity NUMERIC(12, 3) NOT NULL,
    unit VARCHAR(10) NOT NULL DEFAULT 'PCS',
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL
);

ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Purchase invoices multi-tenant isolation"
ON public.purchase_invoices
FOR ALL
USING (public.is_business_member(business_id));

CREATE POLICY "Purchase invoice items isolation"
ON public.purchase_invoice_items
FOR ALL
USING (EXISTS (SELECT 1 FROM public.purchase_invoices pi WHERE pi.id = purchase_invoice_id AND public.is_business_member(pi.business_id)));

-- ==============================================================================
-- STORED PROCEDURE 1: convert_po_to_purchase_bill
-- Converts PO to vendor bill, increments stock, logs stock movement, and
-- updates supplier accounts payable balance.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.convert_po_to_purchase_bill(
    p_po_id UUID,
    p_bill_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_po RECORD;
    v_bill_id UUID := uuid_generate_v4();
    v_bill_number TEXT := p_bill_data->>'bill_number';
    v_vendor_inv_num TEXT := p_bill_data->>'vendor_invoice_number';
    v_grand_total NUMERIC := (p_bill_data->>'grand_total')::NUMERIC;
    v_paid_amount NUMERIC := COALESCE((p_bill_data->>'paid_amount')::NUMERIC, 0.00);
    v_balance_amount NUMERIC := v_grand_total - v_paid_amount;
    v_item JSONB;
    v_item_id UUID;
    v_received_qty NUMERIC;
    v_all_received BOOLEAN := true;
BEGIN
    -- 1. Fetch Purchase Order
    SELECT * INTO v_po FROM public.purchase_orders WHERE id = p_po_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase Order % not found', p_po_id;
    END IF;

    -- 2. Create Purchase Invoice Record
    INSERT INTO public.purchase_invoices (
        id,
        business_id,
        supplier_id,
        purchase_order_id,
        bill_number,
        vendor_invoice_number,
        bill_date,
        due_date,
        status,
        payment_mode,
        taxable_amount,
        cgst_amount,
        sgst_amount,
        igst_amount,
        grand_total,
        paid_amount,
        balance_amount,
        notes
    ) VALUES (
        v_bill_id,
        v_po.business_id,
        v_po.supplier_id,
        p_po_id,
        v_bill_number,
        v_vendor_inv_num,
        COALESCE((p_bill_data->>'bill_date')::DATE, CURRENT_DATE),
        (p_bill_data->>'due_date')::DATE,
        CASE 
            WHEN v_balance_amount <= 0 THEN 'PAID'
            WHEN v_paid_amount > 0 THEN 'PARTIALLY_PAID'
            ELSE 'UNPAID'
        END,
        COALESCE(p_bill_data->>'payment_mode', 'CREDIT'),
        (p_bill_data->>'taxable_amount')::NUMERIC,
        COALESCE((p_bill_data->>'cgst_amount')::NUMERIC, 0.00),
        COALESCE((p_bill_data->>'sgst_amount')::NUMERIC, 0.00),
        COALESCE((p_bill_data->>'igst_amount')::NUMERIC, 0.00),
        v_grand_total,
        v_paid_amount,
        v_balance_amount,
        p_bill_data->>'notes'
    );

    -- 3. Process Received Items, Increment Stock & Record Inward Movement
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_bill_data->'items')
    LOOP
        v_item_id := (v_item->>'item_id')::UUID;
        v_received_qty := (v_item->>'received_quantity')::NUMERIC;

        INSERT INTO public.purchase_invoice_items (
            purchase_invoice_id,
            item_id,
            item_name,
            hsn_sac_code,
            quantity,
            unit,
            unit_price,
            tax_rate,
            tax_amount,
            total_amount
        ) VALUES (
            v_bill_id,
            v_item_id,
            v_item->>'item_name',
            v_item->>'hsn_sac_code',
            v_received_qty,
            COALESCE(v_item->>'unit', 'PCS'),
            (v_item->>'unit_price')::NUMERIC,
            COALESCE((v_item->>'tax_rate')::NUMERIC, 18.00),
            COALESCE((v_item->>'tax_amount')::NUMERIC, 0.00),
            (v_item->>'total_amount')::NUMERIC
        );

        -- Atomically increment items inventory
        UPDATE public.items
        SET current_stock = current_stock + v_received_qty,
            updated_at = NOW()
        WHERE id = v_item_id;

        -- Record stock movement ledger entry
        INSERT INTO public.stock_movements (
            business_id,
            item_id,
            movement_type,
            quantity,
            unit_cost,
            reference_id,
            notes
        ) VALUES (
            v_po.business_id,
            v_item_id,
            'PURCHASE_IN',
            v_received_qty,
            (v_item->>'unit_price')::NUMERIC,
            v_bill_id,
            'Goods Received from PO #' || v_po.po_number || ' (Bill #' || v_bill_number || ')'
        );

        -- Update PO Item received quantity
        UPDATE public.purchase_order_items
        SET received_quantity = received_quantity + v_received_qty
        WHERE purchase_order_id = p_po_id AND item_id = v_item_id;
    END LOOP;

    -- 4. Update PO Status
    UPDATE public.purchase_orders
    SET status = 'COMPLETED',
        updated_at = NOW()
    WHERE id = p_po_id;

    -- 5. Update Supplier Accounts Payable Balance (Negative balance represents our liability to supplier)
    IF v_balance_amount > 0 THEN
        UPDATE public.parties
        SET current_balance = current_balance - v_balance_amount,
            updated_at = NOW()
        WHERE id = v_po.supplier_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'purchase_invoice_id', v_bill_id,
        'bill_number', v_bill_number,
        'balance_amount', v_balance_amount
    );
END;
$$;

-- ==============================================================================
-- STORED PROCEDURE 2: execute_production_run
-- Atomically checks raw material inventory, deducts consumption with wastage,
-- increments target finished good stock, and logs stock movements.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.execute_production_run(
    p_recipe_id UUID,
    p_quantity NUMERIC,
    p_business_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_recipe RECORD;
    v_ing RECORD;
    v_required_qty NUMERIC;
    v_current_stock NUMERIC;
    v_item_name TEXT;
    v_run_id UUID := uuid_generate_v4();
BEGIN
    -- 1. Fetch BOM Recipe
    SELECT * INTO v_recipe FROM public.bom_recipes WHERE id = p_recipe_id AND business_id = p_business_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'BOM Recipe % not found for business %', p_recipe_id, p_business_id;
    END IF;

    -- 2. Validate Stock for all raw materials before executing run
    FOR v_ing IN SELECT * FROM public.bom_ingredients WHERE recipe_id = p_recipe_id
    LOOP
        v_required_qty := v_ing.required_quantity * p_quantity * (1 + COALESCE(v_ing.waste_percentage, 0.0) / 100);
        
        SELECT current_stock, name INTO v_current_stock, v_item_name 
        FROM public.items WHERE id = v_ing.raw_material_item_id;

        IF v_current_stock < v_required_qty THEN
            RAISE EXCEPTION 'Insufficient stock for raw material "%": Required %, Available %',
                v_item_name, v_required_qty, v_current_stock;
        END IF;
    END LOOP;

    -- 3. Deduct Raw Materials (BOM_CONSUMPTION_OUT)
    FOR v_ing IN SELECT * FROM public.bom_ingredients WHERE recipe_id = p_recipe_id
    LOOP
        v_required_qty := v_ing.required_quantity * p_quantity * (1 + COALESCE(v_ing.waste_percentage, 0.0) / 100);

        UPDATE public.items
        SET current_stock = current_stock - v_required_qty,
            updated_at = NOW()
        WHERE id = v_ing.raw_material_item_id;

        INSERT INTO public.stock_movements (
            business_id,
            item_id,
            movement_type,
            quantity,
            reference_id,
            notes
        ) VALUES (
            p_business_id,
            v_ing.raw_material_item_id,
            'BOM_CONSUMPTION_OUT',
            -v_required_qty,
            v_run_id,
            'Consumed in Production Run of ' || p_quantity || ' units of recipe: ' || v_recipe.recipe_name
        );
    END LOOP;

    -- 4. Increment Finished Good Stock (BOM_MANUFACTURE_IN)
    UPDATE public.items
    SET current_stock = current_stock + (p_quantity * v_recipe.output_quantity),
        updated_at = NOW()
    WHERE id = v_recipe.output_item_id;

    INSERT INTO public.stock_movements (
        business_id,
        item_id,
        movement_type,
        quantity,
        reference_id,
        notes
    ) VALUES (
        p_business_id,
        v_recipe.output_item_id,
        'BOM_MANUFACTURE_IN',
        p_quantity * v_recipe.output_quantity,
        v_run_id,
        'Manufactured via BOM Recipe: ' || v_recipe.recipe_name
    );

    RETURN jsonb_build_object(
        'success', true,
        'run_id', v_run_id,
        'recipe_id', p_recipe_id,
        'quantity_produced', p_quantity * v_recipe.output_quantity,
        'finished_good_id', v_recipe.output_item_id
    );
END;
$$;

-- ==============================================================================
-- PHASE 4: PAYMENTS & UDHAARI LEDGER SETTLEMENT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    purchase_invoice_id UUID REFERENCES public.purchase_invoices(id) ON DELETE SET NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('PAYMENT_IN', 'PAYMENT_OUT')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_mode VARCHAR(20) NOT NULL DEFAULT 'CASH' CHECK (payment_mode IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE')),
    reference_number VARCHAR(100),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments multi-tenant isolation"
ON public.payments
FOR ALL
USING (public.is_business_member(business_id));

-- ==============================================================================
-- STORED PROCEDURE 3: record_party_payment
-- Records payment in / out, adjusts party current_balance atomically,
-- and updates invoice paid status if linked.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.record_party_payment(
    p_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_payment_id UUID := uuid_generate_v4();
    v_business_id UUID := (p_data->>'business_id')::UUID;
    v_party_id UUID := (p_data->>'party_id')::UUID;
    v_invoice_id UUID := (p_data->>'invoice_id')::UUID;
    v_purchase_inv_id UUID := (p_data->>'purchase_invoice_id')::UUID;
    v_payment_type VARCHAR(20) := p_data->>'payment_type';
    v_amount NUMERIC := (p_data->>'amount')::NUMERIC;
    v_payment_mode VARCHAR(20) := COALESCE(p_data->>'payment_mode', 'CASH');
    v_ref_no TEXT := p_data->>'reference_number';
    v_date DATE := COALESCE((p_data->>'payment_date')::DATE, CURRENT_DATE);
    v_notes TEXT := p_data->>'notes';
    v_new_balance NUMERIC;
BEGIN
    -- 1. Insert Payment Record
    INSERT INTO public.payments (
        id,
        business_id,
        party_id,
        invoice_id,
        purchase_invoice_id,
        payment_type,
        amount,
        payment_mode,
        reference_number,
        payment_date,
        notes
    ) VALUES (
        v_payment_id,
        v_business_id,
        v_party_id,
        v_invoice_id,
        v_purchase_inv_id,
        v_payment_type,
        v_amount,
        v_payment_mode,
        v_ref_no,
        v_date,
        v_notes
    );

    -- 2. Atomically Adjust Party Balance
    -- PAYMENT_IN (Customer pays us): current_balance decreases (receivable drops)
    -- PAYMENT_OUT (We pay supplier): current_balance increases towards 0 (liability drops)
    IF v_payment_type = 'PAYMENT_IN' THEN
        UPDATE public.parties
        SET current_balance = current_balance - v_amount,
            updated_at = NOW()
        WHERE id = v_party_id
        RETURNING current_balance INTO v_new_balance;
    ELSE
        UPDATE public.parties
        SET current_balance = current_balance + v_amount,
            updated_at = NOW()
        WHERE id = v_party_id
        RETURNING current_balance INTO v_new_balance;
    END IF;

    -- 3. If linked to a specific sales invoice, update invoice paid amount and status
    IF v_invoice_id IS NOT NULL THEN
        UPDATE public.invoices
        SET paid_amount = paid_amount + v_amount,
            balance_amount = GREATEST(0, balance_amount - v_amount),
            status = CASE 
                WHEN (balance_amount - v_amount) <= 0 THEN 'PAID'
                ELSE 'PARTIALLY_PAID'
            END,
            updated_at = NOW()
        WHERE id = v_invoice_id;
    END IF;

    -- 4. If linked to a purchase bill, update purchase invoice paid status
    IF v_purchase_inv_id IS NOT NULL THEN
        UPDATE public.purchase_invoices
        SET paid_amount = paid_amount + v_amount,
            balance_amount = GREATEST(0, balance_amount - v_amount),
            status = CASE 
                WHEN (balance_amount - v_amount) <= 0 THEN 'PAID'
                ELSE 'PARTIALLY_PAID'
            END,
            updated_at = NOW()
        WHERE id = v_purchase_inv_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'payment_id', v_payment_id,
        'new_balance', v_new_balance
    );
END;
$$;



