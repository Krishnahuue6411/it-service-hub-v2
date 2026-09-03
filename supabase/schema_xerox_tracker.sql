-- ==============================================================================
-- XEROX & PRINTING DAILY TRACKER MODULE (Supabase SQL)
-- For Client 1 (Xerox & Photocopy Center)
-- Tracks machine meter readings, paper rim consumption, revenue, and net profit
-- ==============================================================================

-- 1. Create xerox_daily_logs table
CREATE TABLE IF NOT EXISTS public.xerox_daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    paper_rims_bought NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paper_cost_per_rim NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_paper_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    machine_start_reading NUMERIC(12, 0) NOT NULL DEFAULT 0,
    machine_end_reading NUMERIC(12, 0) NOT NULL DEFAULT 0,
    total_prints_done NUMERIC(12, 0) NOT NULL DEFAULT 0,
    rate_per_print NUMERIC(8, 2) NOT NULL DEFAULT 2.00,
    gross_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    other_expenses NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    net_profit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(client_id, log_date)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.xerox_daily_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: Clients can only view, insert, update, or delete their own logs
DROP POLICY IF EXISTS "Clients manage own xerox logs" ON public.xerox_daily_logs;
CREATE POLICY "Clients manage own xerox logs"
ON public.xerox_daily_logs
FOR ALL
USING (auth.uid() = client_id);

-- 4. Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.set_xerox_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_xerox_logs_updated_at ON public.xerox_daily_logs;
CREATE TRIGGER tr_xerox_logs_updated_at
    BEFORE UPDATE ON public.xerox_daily_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.set_xerox_logs_updated_at();
