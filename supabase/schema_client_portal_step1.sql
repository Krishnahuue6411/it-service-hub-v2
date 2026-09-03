-- ==============================================================================
-- STEP 1: CUSTOM MULTI-CLIENT BUSINESS PORTAL SCHEMA (Supabase SQL)
-- Creates clients table and RLS policies for multi-tenant software redirection
-- ==============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    business_type TEXT CHECK (business_type IN ('XEROX', 'PRINTING_PRESS', 'RETAIL_ERP')) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 4. Policy 1: Client can read and update only their own profile
DROP POLICY IF EXISTS "Clients read own profile" ON public.clients;
CREATE POLICY "Clients read own profile"
ON public.clients
FOR SELECT
USING (id = auth.uid());

DROP POLICY IF EXISTS "Clients update own profile" ON public.clients;
CREATE POLICY "Clients update own profile"
ON public.clients
FOR UPDATE
USING (id = auth.uid());

-- 5. Policy 2: Super Admin has full master access to all rows
DROP POLICY IF EXISTS "Super Admin master access on clients" ON public.clients;
CREATE POLICY "Super Admin master access on clients"
ON public.clients
FOR ALL
USING (
    COALESCE((auth.jwt()->'app_metadata'->>'is_super_admin')::BOOLEAN, false) = true
    OR auth.role() = 'service_role'
);
