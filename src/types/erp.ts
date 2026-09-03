// ==============================================================================
// MULTI-TENANT B2B BILLING & ERP PLATFORM - DOMAIN TYPE DEFINITIONS
// Architecture: Vyapar / myBillBook Compatible Business Objects
// ==============================================================================

export type PrintFormat = 'A4' | 'A5' | 'THERMAL_3INCH';

export type PartyType = 'CUSTOMER' | 'SUPPLIER';

export type ItemType = 'FINISHED_GOOD' | 'RAW_MATERIAL' | 'SERVICE';

export type ItemUnit = 'PCS' | 'NOS' | 'KG' | 'MTR' | 'PKT' | 'LTR' | 'BOX' | 'BAG' | 'SET';

export type InvoiceStatus = 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'CANCELLED';

export type PaymentMode = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT';

export type PurchaseOrderStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export type StockMovementType = 
  | 'PURCHASE_IN'
  | 'SALE_OUT'
  | 'BOM_MANUFACTURE_IN'
  | 'BOM_CONSUMPTION_OUT'
  | 'ADJUSTMENT_ADD'
  | 'ADJUSTMENT_REDUCE'
  | 'DAMAGE';

export type UserRole = 'OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'OPERATOR' | 'SALES_REP';

// Dynamic Feature Flags stored in businesses.settings (JSONB)
export interface BusinessSettings {
  enable_gst: boolean;
  print_format: PrintFormat;
  enable_bom: boolean;
  enable_po: boolean;
  enable_barcode: boolean;
  show_vehicle_no: boolean;
  invoice_prefix: string;
  next_invoice_number: number;
  terms_and_conditions: string;
  signature_url?: string | null;
  theme_color?: string;
}

// 1. Business Tenant Entity
export interface Business {
  id: string;
  owner_user_id?: string;
  name: string;
  trade_name?: string;
  gstin?: string;
  state_code?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone: string;
  email?: string;
  logo_url?: string;
  
  // Bank & UPI Settlement
  bank_name?: string;
  account_no?: string;
  ifsc_code?: string;
  branch_name?: string;
  upi_id?: string;
  
  settings: BusinessSettings;
  created_at: string;
  updated_at: string;
}

// 2. Party (Khata / Ledger: Customer or Supplier)
export interface Party {
  id: string;
  business_id: string;
  type: PartyType;
  name: string;
  company_name?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  state_code?: string;
  billing_address?: string;
  shipping_address?: string;
  credit_limit: number;
  current_balance: number; // Positive = Receivable, Negative = Payable
  created_at: string;
  updated_at: string;
}

// 3. Item (Finished Good, Raw Material, or Service)
export interface Item {
  id: string;
  business_id: string;
  name: string;
  item_type: ItemType;
  sku_barcode?: string;
  hsn_sac_code?: string;
  unit: ItemUnit;
  purchase_price: number;
  selling_price: number;
  tax_rate: number; // 0, 5, 12, 18, 28%
  current_stock: number;
  low_stock_threshold: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// 4. Purchase Order & Line Items
export interface PurchaseOrderItem {
  id?: string;
  purchase_order_id?: string;
  item_id: string;
  item?: Item;
  quantity: number;
  received_quantity?: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
}

export interface PurchaseOrder {
  id: string;
  business_id: string;
  supplier_id: string;
  supplier?: Party;
  po_number: string;
  status: PurchaseOrderStatus;
  order_date: string;
  expected_delivery_date?: string;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  items?: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}

// 5. Bill of Materials (BOM) Recipe & Ingredients
export interface BomIngredient {
  id?: string;
  recipe_id?: string;
  raw_material_item_id: string;
  raw_material_item?: Item;
  required_quantity: number;
  waste_percentage?: number;
}

export interface BomRecipe {
  id: string;
  business_id: string;
  output_item_id: string;
  output_item?: Item;
  recipe_name: string;
  output_quantity: number;
  production_cost_overhead: number;
  notes?: string;
  ingredients: BomIngredient[];
  created_at: string;
  updated_at: string;
}

// 6. Tax Invoice & Invoice Items
export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  item_id: string;
  item_name: string;
  hsn_sac_code?: string;
  quantity: number;
  unit: ItemUnit;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  taxable_value: number;
  tax_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount: number;
}

export interface Invoice {
  id: string;
  business_id: string;
  customer_id: string;
  customer?: Party;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  status: InvoiceStatus;
  payment_mode: PaymentMode;
  
  // Financial Tax Summary
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  discount_amount: number;
  round_off: number;
  grand_total: number;
  paid_amount: number;
  balance_amount: number;
  
  // Logistics / Transporter Metadata
  vehicle_number?: string;
  transporter_name?: string;
  lr_rr_number?: string;
  eway_bill_number?: string;
  
  print_format: PrintFormat;
  notes?: string;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

// 7. Stock Movement
export interface StockMovement {
  id: string;
  business_id: string;
  item_id: string;
  item?: Item;
  movement_type: StockMovementType;
  quantity: number;
  unit_cost?: number;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

// 8. Phase 2 DTOs (Data Transfer Objects)
export interface CreateInvoiceItemDTO {
  item_id: string;
  item_name: string;
  hsn_sac_code?: string;
  quantity: number;
  unit: ItemUnit;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  taxable_value: number;
  tax_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount: number;
}

export interface CreateInvoiceDTO {
  business_id: string;
  customer_id: string;
  invoice_number?: string;
  invoice_date: string;
  due_date?: string;
  payment_mode: PaymentMode;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  discount_amount: number;
  round_off: number;
  grand_total: number;
  paid_amount: number;
  vehicle_number?: string;
  transporter_name?: string;
  lr_rr_number?: string;
  eway_bill_number?: string;
  print_format: PrintFormat;
  notes?: string;
  items: CreateInvoiceItemDTO[];
}

export interface CreatePartyDTO {
  business_id: string;
  type: PartyType;
  name: string;
  company_name?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  state_code?: string;
  billing_address?: string;
  shipping_address?: string;
  credit_limit?: number;
  opening_balance?: number;
}

// 9. Phase 3: Vendor Purchase Invoices & DTOs
export interface PurchaseInvoiceItem {
  id?: string;
  purchase_invoice_id?: string;
  item_id: string;
  item_name: string;
  hsn_sac_code?: string;
  quantity: number;
  unit: ItemUnit;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
}

export interface PurchaseInvoice {
  id: string;
  business_id: string;
  supplier_id: string;
  supplier?: Party;
  purchase_order_id?: string;
  bill_number: string;
  vendor_invoice_number?: string;
  bill_date: string;
  due_date?: string;
  status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';
  payment_mode: PaymentMode;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  grand_total: number;
  paid_amount: number;
  balance_amount: number;
  notes?: string;
  items?: PurchaseInvoiceItem[];
  created_at: string;
  updated_at: string;
}

export interface CreatePurchaseOrderItemDTO {
  item_id: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

export interface CreatePurchaseOrderDTO {
  business_id: string;
  supplier_id: string;
  po_number?: string;
  order_date: string;
  expected_delivery_date?: string;
  notes?: string;
  items: CreatePurchaseOrderItemDTO[];
}

export interface ConvertPoToBillDTO {
  po_id: string;
  bill_number: string;
  vendor_invoice_number?: string;
  bill_date: string;
  due_date?: string;
  payment_mode: PaymentMode;
  paid_amount: number;
  notes?: string;
  items: {
    item_id: string;
    item_name: string;
    hsn_sac_code?: string;
    received_quantity: number;
    unit: ItemUnit;
    unit_price: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;
  }[];
}

export interface CreateBomIngredientDTO {
  raw_material_item_id: string;
  required_quantity: number;
  waste_percentage?: number;
}

export interface CreateBomRecipeDTO {
  business_id: string;
  output_item_id: string;
  recipe_name: string;
  output_quantity: number;
  production_cost_overhead: number;
  notes?: string;
  ingredients: CreateBomIngredientDTO[];
}

export interface ExecuteProductionRunDTO {
  business_id: string;
  recipe_id: string;
  quantity: number;
}

// 10. Phase 4: Payments, Ledgers & Financial Reporting
export type PaymentType = 'PAYMENT_IN' | 'PAYMENT_OUT';

export interface Payment {
  id: string;
  business_id: string;
  party_id: string;
  party?: Party;
  invoice_id?: string;
  purchase_invoice_id?: string;
  payment_type: PaymentType;
  amount: number;
  payment_mode: PaymentMode;
  reference_number?: string;
  payment_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RecordPaymentDTO {
  business_id: string;
  party_id: string;
  payment_type: PaymentType;
  amount: number;
  payment_mode: PaymentMode;
  reference_number?: string;
  payment_date: string;
  invoice_id?: string;
  purchase_invoice_id?: string;
  notes?: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'INVOICE' | 'PAYMENT_IN' | 'PURCHASE_BILL' | 'PAYMENT_OUT' | 'OPENING_BALANCE';
  reference_number: string;
  description: string;
  debit: number;   // Money customer owes us (or money we gave)
  credit: number;  // Money customer paid us (or vendor bill owed)
  running_balance: number;
}

export interface Gstr1B2BInvoice {
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_gstin: string;
  place_of_supply: string;
  taxable_value: number;
  tax_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_invoice_value: number;
}

export interface Gstr1HsnItem {
  hsn_code: string;
  description: string;
  uqc: string;
  total_quantity: number;
  total_value: number;
  taxable_value: number;
  integrated_tax: number;
  central_tax: number;
  state_tax: number;
}

export interface Gstr1Summary {
  b2b_invoices: Gstr1B2BInvoice[];
  b2c_invoices: {
    invoice_number: string;
    invoice_date: string;
    taxable_value: number;
    cgst_amount: number;
    sgst_amount: number;
    grand_total: number;
  }[];
  hsn_summary: Gstr1HsnItem[];
  total_taxable_turnover: number;
  total_cgst: number;
  total_sgst: number;
  total_igst: number;
  total_tax_collected: number;
}

export interface Gstr3bSummary {
  outward_taxable_supplies: {
    total_taxable_value: number;
    igst: number;
    cgst: number;
    sgst: number;
  };
  eligible_itc: {
    total_taxable_value: number;
    igst: number;
    cgst: number;
    sgst: number;
  };
  net_tax_payable: {
    igst: number;
    cgst: number;
    sgst: number;
    total: number;
  };
}

export interface DaybookTransaction {
  id: string;
  time: string;
  type: 'CASH_SALE' | 'DIGITAL_SALE' | 'CUSTOMER_PAYMENT' | 'SUPPLIER_PAYMENT' | 'PURCHASE_EXPENSE';
  entity_name: string;
  reference_no: string;
  inflow: number;
  outflow: number;
  mode: PaymentMode;
  notes?: string;
}

export interface DaybookSummary {
  date: string;
  opening_cash_balance: number;
  cash_inflows: number;
  cash_outflows: number;
  closing_cash_drawer: number;
  digital_receipts_upi: number;
  digital_receipts_bank: number;
  transactions: DaybookTransaction[];
}

export interface ProfitLossStatement {
  sales_revenue: number;
  cost_of_goods_sold: number;
  gross_profit: number;
  gross_margin_percentage: number;
  operating_expenses: number;
  net_profit: number;
  net_profit_percentage: number;
}



