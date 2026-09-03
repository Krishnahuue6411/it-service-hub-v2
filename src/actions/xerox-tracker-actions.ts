'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../lib/supabase/server';
import { XeroxDailyLog, CreateXeroxLogDTO } from '../types/xerox-tracker';

// Preloaded mock records for instant out-of-the-box shopkeeper experience
let liveXeroxLogsStore: XeroxDailyLog[] = [
  {
    id: 'xlog-101',
    client_id: 'c-001',
    log_date: '2026-09-03',
    paper_rims_bought: 2,
    paper_cost_per_rim: 250,
    total_paper_cost: 500,
    machine_start_reading: 42100,
    machine_end_reading: 43350,
    total_prints_done: 1250,
    rate_per_print: 2.0,
    gross_revenue: 2500,
    other_expenses: 150,
    net_profit: 1850,
    notes: 'JK Copier 75 GSM paper + Black toner refill',
    created_at: '2026-09-03T18:00:00Z',
    updated_at: '2026-09-03T18:00:00Z',
  },
  {
    id: 'xlog-102',
    client_id: 'c-001',
    log_date: '2026-09-02',
    paper_rims_bought: 3,
    paper_cost_per_rim: 240,
    total_paper_cost: 720,
    machine_start_reading: 40650,
    machine_end_reading: 42100,
    total_prints_done: 1450,
    rate_per_print: 2.0,
    gross_revenue: 2900,
    other_expenses: 120,
    net_profit: 2060,
    notes: 'Exam hall ticket printing rush',
    created_at: '2026-09-02T18:30:00Z',
    updated_at: '2026-09-02T18:30:00Z',
  },
  {
    id: 'xlog-103',
    client_id: 'c-001',
    log_date: '2026-09-01',
    paper_rims_bought: 1,
    paper_cost_per_rim: 250,
    total_paper_cost: 250,
    machine_start_reading: 39550,
    machine_end_reading: 40650,
    total_prints_done: 1100,
    rate_per_print: 2.0,
    gross_revenue: 2200,
    other_expenses: 60,
    net_profit: 1890,
    notes: 'Regular court stamp & legal docs copy',
    created_at: '2026-09-01T17:45:00Z',
    updated_at: '2026-09-01T17:45:00Z',
  },
  {
    id: 'xlog-104',
    client_id: 'c-001',
    log_date: '2026-08-31',
    paper_rims_bought: 4,
    paper_cost_per_rim: 240,
    total_paper_cost: 960,
    machine_start_reading: 38000,
    machine_end_reading: 39550,
    total_prints_done: 1550,
    rate_per_print: 2.0,
    gross_revenue: 3100,
    other_expenses: 250,
    net_profit: 1890,
    notes: 'Bulk project thesis binding & print copies',
    created_at: '2026-08-31T19:00:00Z',
    updated_at: '2026-08-31T19:00:00Z',
  },
];

// 1. Fetch chronological logs
export async function getXeroxDailyLogs(clientId?: string): Promise<XeroxDailyLog[]> {
  const supabase = await createServerSupabaseClient();
  try {
    let query = supabase.from('xerox_daily_logs').select('*').order('log_date', { ascending: false });
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as XeroxDailyLog[];
    }
  } catch (err) {
    console.warn('Supabase getXeroxDailyLogs offline fallback active');
  }

  return liveXeroxLogsStore;
}

// 2. Insert new daily log
export async function createXeroxDailyLog(
  payload: CreateXeroxLogDTO
): Promise<{ success: boolean; data?: XeroxDailyLog; error?: string }> {
  try {
    const total_paper_cost = payload.paper_rims_bought * payload.paper_cost_per_rim;
    const total_prints_done = Math.max(0, payload.machine_end_reading - payload.machine_start_reading);
    const gross_revenue = total_prints_done * payload.rate_per_print;
    const net_profit = gross_revenue - total_paper_cost - payload.other_expenses;

    const newLog: XeroxDailyLog = {
      id: `xlog-${Date.now()}`,
      client_id: payload.client_id || 'c-001',
      log_date: payload.log_date,
      paper_rims_bought: payload.paper_rims_bought,
      paper_cost_per_rim: payload.paper_cost_per_rim,
      total_paper_cost,
      machine_start_reading: payload.machine_start_reading,
      machine_end_reading: payload.machine_end_reading,
      total_prints_done,
      rate_per_print: payload.rate_per_print,
      gross_revenue,
      other_expenses: payload.other_expenses,
      net_profit,
      notes: payload.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update in-memory state
    liveXeroxLogsStore = [newLog, ...liveXeroxLogsStore.filter((l) => l.log_date !== payload.log_date)];

    // Attempt Supabase insert
    const supabase = await createServerSupabaseClient();
    try {
      await supabase.from('xerox_daily_logs').upsert({
        client_id: newLog.client_id,
        log_date: newLog.log_date,
        paper_rims_bought: newLog.paper_rims_bought,
        paper_cost_per_rim: newLog.paper_cost_per_rim,
        total_paper_cost: newLog.total_paper_cost,
        machine_start_reading: newLog.machine_start_reading,
        machine_end_reading: newLog.machine_end_reading,
        total_prints_done: newLog.total_prints_done,
        rate_per_print: newLog.rate_per_print,
        gross_revenue: newLog.gross_revenue,
        other_expenses: newLog.other_expenses,
        net_profit: newLog.net_profit,
        notes: newLog.notes,
      });
    } catch (dbErr) {
      console.warn('Supabase insert offline note:', dbErr);
    }

    revalidatePath('/portal/xerox');
    return { success: true, data: newLog };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save daily entry' };
  }
}

// 3. Delete a daily log entry
export async function deleteXeroxDailyLog(
  logId: string
): Promise<{ success: boolean; error?: string }> {
  liveXeroxLogsStore = liveXeroxLogsStore.filter((l) => l.id !== logId);

  const supabase = await createServerSupabaseClient();
  try {
    await supabase.from('xerox_daily_logs').delete().eq('id', logId);
  } catch {}

  revalidatePath('/portal/xerox');
  return { success: true };
}
