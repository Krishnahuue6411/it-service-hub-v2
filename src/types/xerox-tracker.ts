// ==============================================================================
// XEROX DAILY TRACKER TYPES
// ==============================================================================

export interface XeroxDailyLog {
  id: string;
  client_id: string;
  log_date: string;
  paper_rims_bought: number;
  paper_cost_per_rim: number;
  total_paper_cost: number;
  machine_start_reading: number;
  machine_end_reading: number;
  total_prints_done: number;
  rate_per_print: number;
  gross_revenue: number;
  other_expenses: number;
  net_profit: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateXeroxLogDTO {
  client_id?: string;
  log_date: string;
  paper_rims_bought: number;
  paper_cost_per_rim: number;
  machine_start_reading: number;
  machine_end_reading: number;
  rate_per_print: number;
  other_expenses: number;
  notes?: string;
}
