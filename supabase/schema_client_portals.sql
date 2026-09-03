-- ==============================================================================
-- MULTI-TENANT CLIENT PORTAL ENGINE (Supabase SQL)
-- Directs clients to dedicated portals based on their assigned business_type
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    business_type TEXT NOT NULL CHECK (business_type IN ('XEROX', 'PRINTING_PRESS', 'RETAIL_ERP')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICY: Clients can only read their own row
DROP POLICY IF EXISTS "Clients read own profile" ON public.clients;
CREATE POLICY "Clients read own profile"
ON public.clients
FOR SELECT
USING (auth.uid() = id);

-- 5. RLS POLICY: Clients can only update their own profile
DROP POLICY IF EXISTS "Clients update own profile" ON public.clients;
CREATE POLICY "Clients update own profile"
ON public.clients
FOR UPDATE
USING (auth.uid() = id);

-- 6. RLS POLICY: Super Admin master access (using service role or is_super_admin check)
DROP POLICY IF EXISTS "Super admin full access on clients" ON public.clients;
CREATE POLICY "Super admin full access on clients"
ON public.clients
FOR ALL
USING (
    COALESCE((auth.jwt()->'app_metadata'->>'is_super_admin')::BOOLEAN, false) = true
    OR auth.role() = 'service_role'
);

-- 7. Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_clients_updated_at ON public.clients;
CREATE TRIGGER tr_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.set_clients_updated_at();
