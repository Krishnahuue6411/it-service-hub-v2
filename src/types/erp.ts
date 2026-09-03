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

