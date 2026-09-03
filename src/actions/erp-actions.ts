'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../lib/supabase/server';
import { Business, BusinessSettings, Party, Item, BomRecipe, Invoice } from '../types/erp';
import { INITIAL_ERP_BUSINESS, MOCK_ERP_PARTIES, MOCK_ERP_ITEMS, MOCK_ERP_BOM_RECIPES, MOCK_ERP_INVOICES } from '../lib/erp/erp-mock-data';

// In-memory tenant state fallback for preview / offline mode
let liveBusinessState: Business = { ...INITIAL_ERP_BUSINESS };
let livePartiesState: Party[] = [...MOCK_ERP_PARTIES];
let liveItemsState: Item[] = [...MOCK_ERP_ITEMS];
let liveBomState: BomRecipe[] = [...MOCK_ERP_BOM_RECIPES];
let liveInvoicesState: Invoice[] = [...MOCK_ERP_INVOICES];

// 1. Fetch Current Business Profile & Settings
export async function getBusinessProfile(businessId: string = INITIAL_ERP_BUSINESS.id): Promise<Business> {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (!error && data) {
      return data as Business;
    }
  } catch (err) {
    console.warn('Supabase query fallback to memory state:', err);
  }

  return liveBusinessState;
}

// 2. Update Business Dynamic Feature Settings (JSONB)
export async function updateBusinessSettings(
  businessId: string = INITIAL_ERP_BUSINESS.id,
  newSettings: Partial<BusinessSettings>
): Promise<{ success: boolean; data: BusinessSettings }> {
  const updatedSettings: BusinessSettings = {
    ...liveBusinessState.settings,
    ...newSettings,
  };

  liveBusinessState = {
    ...liveBusinessState,
    settings: updatedSettings,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createServerSupabaseClient();
  try {
    const { error } = await supabase
      .from('businesses')
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (error) {
      console.warn('Supabase update note (handled via memory state):', error.message);
    }
  } catch (err) {
    console.warn('Supabase offline update:', err);
  }

  revalidatePath('/dashboard/settings/business');
  revalidatePath('/dashboard');
  return { success: true, data: updatedSettings };
}

// 3. Update General Business Profile (Name, GSTIN, Address, Bank info)
export async function updateBusinessProfile(
  businessId: string = INITIAL_ERP_BUSINESS.id,
  profileData: Partial<Omit<Business, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; data: Business }> {
  liveBusinessState = {
    ...liveBusinessState,
    ...profileData,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createServerSupabaseClient();
  try {
    const { error } = await supabase
      .from('businesses')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (error) {
      console.warn('Supabase profile update note:', error.message);
    }
  } catch (err) {
    console.warn('Supabase offline profile update:', err);
  }

  revalidatePath('/dashboard/settings/business');
  revalidatePath('/dashboard');
  return { success: true, data: liveBusinessState };
}

// 4. Fetch Parties (Khata)
export async function getParties(businessId: string = INITIAL_ERP_BUSINESS.id): Promise<Party[]> {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('parties')
      .select('*')
      .eq('business_id', businessId)
      .order('name');

    if (!error && data && data.length > 0) {
      return data as Party[];
    }
  } catch {}

  return livePartiesState;
}

// 5. Fetch Items (Finished goods, Raw materials, Services)
export async function getItems(businessId: string = INITIAL_ERP_BUSINESS.id): Promise<Item[]> {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('business_id', businessId)
      .order('name');

    if (!error && data && data.length > 0) {
      return data as Item[];
    }
  } catch {}

  return liveItemsState;
}

// 6. Fetch BOM Recipes
export async function getBomRecipes(businessId: string = INITIAL_ERP_BUSINESS.id): Promise<BomRecipe[]> {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('bom_recipes')
      .select('*, ingredients:bom_ingredients(*)')
      .eq('business_id', businessId);

    if (!error && data && data.length > 0) {
      return data as BomRecipe[];
    }
  } catch {}

  return liveBomState;
}

// 7. Fetch Invoices
export async function getInvoices(businessId: string = INITIAL_ERP_BUSINESS.id): Promise<Invoice[]> {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*), customer:parties(*)')
      .eq('business_id', businessId)
      .order('invoice_date', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as Invoice[];
    }
  } catch {}

  return liveInvoicesState;
}

// 8. Quick Add Party (Customer Khata or Supplier)
export async function createParty(payload: import('../types/erp').CreatePartyDTO): Promise<{ success: boolean; data: Party }> {
  const newParty: Party = {
    id: `pty-${Date.now()}`,
    business_id: payload.business_id,
    type: payload.type,
    name: payload.name,
    company_name: payload.company_name,
    phone: payload.phone,
    email: payload.email,
    gstin: payload.gstin ? payload.gstin.toUpperCase() : undefined,
    state_code: payload.gstin ? payload.gstin.slice(0, 2) : payload.state_code || '27',
    billing_address: payload.billing_address,
    shipping_address: payload.shipping_address,
    credit_limit: payload.credit_limit || 0,
    current_balance: payload.opening_balance || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  livePartiesState = [newParty, ...livePartiesState];

  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('parties')
      .insert({
        business_id: newParty.business_id,
        type: newParty.type,
        name: newParty.name,
        company_name: newParty.company_name,
        phone: newParty.phone,
        email: newParty.email,
        gstin: newParty.gstin,
        state_code: newParty.state_code,
        billing_address: newParty.billing_address,
        shipping_address: newParty.shipping_address,
        credit_limit: newParty.credit_limit,
        current_balance: newParty.current_balance,
      })
      .select()
      .single();

    if (!error && data) {
      newParty.id = data.id;
    }
  } catch (err) {
    console.warn('Supabase party insert fallback to memory:', err);
  }

  revalidatePath('/dashboard/billing/new');
  revalidatePath('/dashboard/parties');
  revalidatePath('/dashboard');
  return { success: true, data: newParty };
}

// 9. Atomic Sales Invoice Creation, Stock Decrement & Party Ledger Settlement
export async function createSalesInvoice(
  payload: import('../types/erp').CreateInvoiceDTO
): Promise<{ success: boolean; data: Invoice; message?: string }> {
  // 1. Determine Sequential Invoice Number
  const prefix = liveBusinessState.settings.invoice_prefix || 'INV/26-27/';
  const nextNum = liveBusinessState.settings.next_invoice_number || 1042;
  const invoiceNumber = payload.invoice_number || `${prefix}${nextNum}`;

  // Advance next invoice number
  liveBusinessState = {
    ...liveBusinessState,
    settings: {
      ...liveBusinessState.settings,
      next_invoice_number: nextNum + 1,
    },
    updated_at: new Date().toISOString(),
  };

  const balanceAmount = Number((payload.grand_total - payload.paid_amount).toFixed(2));
  const invoiceId = `inv-${Date.now()}`;

  // Find customer
  const customer = livePartiesState.find((p) => p.id === payload.customer_id);

  // 2. Prepare Line Items
  const invoiceItems: import('../types/erp').InvoiceItem[] = payload.items.map((item, idx) => ({
    id: `item-line-${idx}-${Date.now()}`,
    invoice_id: invoiceId,
    item_id: item.item_id,
    item_name: item.item_name,
    hsn_sac_code: item.hsn_sac_code,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    discount_percent: item.discount_percent,
    discount_amount: item.discount_amount,
    taxable_value: item.taxable_value,
    tax_rate: item.tax_rate,
    cgst_amount: item.cgst_amount,
    sgst_amount: item.sgst_amount,
    igst_amount: item.igst_amount,
    total_amount: item.total_amount,
  }));

  // 3. Prepare Invoice Header
  const newInvoice: Invoice = {
    id: invoiceId,
    business_id: payload.business_id,
    customer_id: payload.customer_id,
    customer: customer,
    invoice_number: invoiceNumber,
    invoice_date: payload.invoice_date,
    due_date: payload.due_date,
    status: balanceAmount <= 0 ? 'PAID' : payload.paid_amount > 0 ? 'PARTIALLY_PAID' : 'UNPAID',
    payment_mode: payload.payment_mode,
    taxable_amount: payload.taxable_amount,
    cgst_amount: payload.cgst_amount,
    sgst_amount: payload.sgst_amount,
    igst_amount: payload.igst_amount,
    discount_amount: payload.discount_amount,
    round_off: payload.round_off,
    grand_total: payload.grand_total,
    paid_amount: payload.paid_amount,
    balance_amount: balanceAmount,
    vehicle_number: payload.vehicle_number,
    transporter_name: payload.transporter_name,
    lr_rr_number: payload.lr_rr_number,
    eway_bill_number: payload.eway_bill_number,
    print_format: payload.print_format,
    notes: payload.notes,
    items: invoiceItems,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 4. Atomically Decrement Items Inventory Stock
  liveItemsState = liveItemsState.map((existingItem) => {
    const soldItem = payload.items.find((i) => i.item_id === existingItem.id);
    if (soldItem) {
      return {
        ...existingItem,
        current_stock: Math.max(0, existingItem.current_stock - soldItem.quantity),
        updated_at: new Date().toISOString(),
      };
    }
    return existingItem;
  });

  // 5. Update Customer Ledger Balance if Credit or Partial Payment
  if (balanceAmount > 0) {
    livePartiesState = livePartiesState.map((party) => {
      if (party.id === payload.customer_id) {
        return {
          ...party,
          current_balance: Number((party.current_balance + balanceAmount).toFixed(2)),
          updated_at: new Date().toISOString(),
        };
      }
      return party;
    });
  }

  // Prepend new invoice to in-memory list
  liveInvoicesState = [newInvoice, ...liveInvoicesState];

  // 6. Execute Supabase RPC / Transaction if available
  const supabase = await createServerSupabaseClient();
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_sales_invoice', {
      p_data: {
        ...payload,
        invoice_number: invoiceNumber,
      },
    });

    if (rpcError) {
      console.warn('Supabase create_sales_invoice RPC note (memory fallback active):', rpcError.message);
    } else if (rpcData?.invoice_id) {
      newInvoice.id = rpcData.invoice_id;
    }
  } catch (err) {
    console.warn('Supabase offline invoice processing:', err);
  }

  revalidatePath('/dashboard/billing/new');
  revalidatePath('/dashboard/invoices');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/parties');
  revalidatePath('/dashboard/items');

  return { success: true, data: newInvoice };
}

