'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../lib/supabase/server';
import { Business, BusinessSettings, Party, Item, BomRecipe, Invoice, PurchaseOrder, PurchaseInvoice, CreatePurchaseOrderDTO, ConvertPoToBillDTO, CreateBomRecipeDTO, ExecuteProductionRunDTO } from '../types/erp';
import { 
  INITIAL_ERP_BUSINESS, 
  MOCK_ERP_PARTIES, 
  MOCK_ERP_ITEMS, 
  MOCK_ERP_BOM_RECIPES, 
  MOCK_ERP_INVOICES,
  MOCK_ERP_PURCHASE_ORDERS,
  MOCK_ERP_PURCHASE_INVOICES 
} from '../lib/erp/erp-mock-data';

// In-memory tenant state fallback for preview / offline mode
let liveBusinessState: Business = { ...INITIAL_ERP_BUSINESS };
let livePartiesState: Party[] = [...MOCK_ERP_PARTIES];
let liveItemsState: Item[] = [...MOCK_ERP_ITEMS];
let liveBomState: BomRecipe[] = [...MOCK_ERP_BOM_RECIPES];
let liveInvoicesState: Invoice[] = [...MOCK_ERP_INVOICES];
let livePurchaseOrdersState: PurchaseOrder[] = [...MOCK_ERP_PURCHASE_ORDERS];
let livePurchaseInvoicesState: PurchaseInvoice[] = [...MOCK_ERP_PURCHASE_INVOICES];

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

// 10. Fetch Purchase Orders (PO Pipeline)
export async function getPurchaseOrders(businessId: string = INITIAL_ERP_BUSINESS.id): Promise<PurchaseOrder[]> {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, supplier:parties(*), items:purchase_order_items(*)')
      .eq('business_id', businessId)
      .order('order_date', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as PurchaseOrder[];
    }
  } catch {}

  return livePurchaseOrdersState;
}

// 11. Create Purchase Order (PO Generation)
export async function createPurchaseOrder(
  payload: CreatePurchaseOrderDTO
): Promise<{ success: boolean; data: PurchaseOrder }> {
  const poNumber = payload.po_number || `PO/26-27/${String(livePurchaseOrdersState.length + 42).padStart(4, '0')}`;
  const poId = `po-${Date.now()}`;

  const supplier = livePartiesState.find((p) => p.id === payload.supplier_id);

  let subtotal = 0;
  let totalTax = 0;

  const poItems = payload.items.map((item) => {
    const itmObj = liveItemsState.find((i) => i.id === item.item_id);
    const lineSubtotal = item.quantity * item.unit_price;
    const lineTax = (lineSubtotal * item.tax_rate) / 100;
    const lineTotal = lineSubtotal + lineTax;

    subtotal += lineSubtotal;
    totalTax += lineTax;

    return {
      id: `po-item-${Date.now()}-${Math.random()}`,
      purchase_order_id: poId,
      item_id: item.item_id,
      item: itmObj,
      quantity: item.quantity,
      received_quantity: 0,
      unit_price: item.unit_price,
      tax_rate: item.tax_rate,
      tax_amount: Number(lineTax.toFixed(2)),
      total_amount: Number(lineTotal.toFixed(2)),
    };
  });

  const newPO: PurchaseOrder = {
    id: poId,
    business_id: payload.business_id,
    supplier_id: payload.supplier_id,
    supplier: supplier,
    po_number: poNumber,
    status: 'ISSUED',
    order_date: payload.order_date,
    expected_delivery_date: payload.expected_delivery_date,
    subtotal_amount: Number(subtotal.toFixed(2)),
    tax_amount: Number(totalTax.toFixed(2)),
    total_amount: Number((subtotal + totalTax).toFixed(2)),
    notes: payload.notes,
    items: poItems,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  livePurchaseOrdersState = [newPO, ...livePurchaseOrdersState];

  const supabase = await createServerSupabaseClient();
  try {
    await supabase.from('purchase_orders').insert({
      id: newPO.id,
      business_id: newPO.business_id,
      supplier_id: newPO.supplier_id,
      po_number: newPO.po_number,
      status: newPO.status,
      order_date: newPO.order_date,
      expected_delivery_date: newPO.expected_delivery_date,
      subtotal_amount: newPO.subtotal_amount,
      tax_amount: newPO.tax_amount,
      total_amount: newPO.total_amount,
      notes: newPO.notes,
    });
  } catch (err) {
    console.warn('Supabase PO insert offline fallback:', err);
  }

  revalidatePath('/dashboard/purchases');
  revalidatePath('/dashboard');
  return { success: true, data: newPO };
}

// 12. Convert PO to Purchase Bill (GRN Inward + Stock Increment + Supplier Payable)
export async function convertPoToPurchaseBill(
  poId: string,
  billData: ConvertPoToBillDTO
): Promise<{ success: boolean; data: PurchaseInvoice; message?: string }> {
  const targetPO = livePurchaseOrdersState.find((p) => p.id === poId);
  if (!targetPO) {
    throw new Error('Purchase Order not found');
  }

  const billId = `pb-${Date.now()}`;
  const grandTotal = billData.items.reduce((sum, item) => sum + item.total_amount, 0);
  const taxableAmount = billData.items.reduce((sum, item) => sum + (item.received_quantity * item.unit_price), 0);
  const totalTax = grandTotal - taxableAmount;
  const balanceAmount = Number((grandTotal - billData.paid_amount).toFixed(2));

  // 1. Create Purchase Invoice Record
  const newPurchaseInvoice: PurchaseInvoice = {
    id: billId,
    business_id: targetPO.business_id,
    supplier_id: targetPO.supplier_id,
    supplier: targetPO.supplier,
    purchase_order_id: poId,
    bill_number: billData.bill_number,
    vendor_invoice_number: billData.vendor_invoice_number,
    bill_date: billData.bill_date,
    due_date: billData.due_date,
    status: balanceAmount <= 0 ? 'PAID' : billData.paid_amount > 0 ? 'PARTIALLY_PAID' : 'UNPAID',
    payment_mode: billData.payment_mode,
    taxable_amount: Number(taxableAmount.toFixed(2)),
    cgst_amount: Number((totalTax / 2).toFixed(2)),
    sgst_amount: Number((totalTax / 2).toFixed(2)),
    igst_amount: 0.00,
    grand_total: Number(grandTotal.toFixed(2)),
    paid_amount: billData.paid_amount,
    balance_amount: balanceAmount,
    notes: billData.notes,
    items: billData.items.map((i) => ({
      item_id: i.item_id,
      item_name: i.item_name,
      hsn_sac_code: i.hsn_sac_code,
      quantity: i.received_quantity,
      unit: i.unit,
      unit_price: i.unit_price,
      tax_rate: i.tax_rate,
      tax_amount: i.tax_amount,
      total_amount: i.total_amount,
    })),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  livePurchaseInvoicesState = [newPurchaseInvoice, ...livePurchaseInvoicesState];

  // 2. Atomically Increment Inventory Stock for Received Items
  liveItemsState = liveItemsState.map((existingItem) => {
    const received = billData.items.find((i) => i.item_id === existingItem.id);
    if (received && received.received_quantity > 0) {
      return {
        ...existingItem,
        current_stock: existingItem.current_stock + received.received_quantity,
        updated_at: new Date().toISOString(),
      };
    }
    return existingItem;
  });

  // 3. Update PO Status to COMPLETED
  livePurchaseOrdersState = livePurchaseOrdersState.map((p) => {
    if (p.id === poId) {
      return {
        ...p,
        status: 'COMPLETED' as const,
        updated_at: new Date().toISOString(),
      };
    }
    return p;
  });

  // 4. Update Supplier Accounts Payable Balance (- payable)
  if (balanceAmount > 0) {
    livePartiesState = livePartiesState.map((party) => {
      if (party.id === targetPO.supplier_id) {
        return {
          ...party,
          current_balance: Number((party.current_balance - balanceAmount).toFixed(2)),
          updated_at: new Date().toISOString(),
        };
      }
      return party;
    });
  }

  // 5. Run Supabase RPC if configured
  const supabase = await createServerSupabaseClient();
  try {
    await supabase.rpc('convert_po_to_purchase_bill', {
      p_po_id: poId,
      p_bill_data: {
        ...billData,
        grand_total: grandTotal,
        taxable_amount: taxableAmount,
      },
    });
  } catch (err) {
    console.warn('Supabase convert_po_to_purchase_bill RPC note (memory fallback active):', err);
  }

  revalidatePath('/dashboard/purchases');
  revalidatePath('/dashboard/items');
  revalidatePath('/dashboard/parties');
  revalidatePath('/dashboard');

  return { success: true, data: newPurchaseInvoice };
}

// 13. Fetch Purchase Invoices
export async function getPurchaseInvoices(businessId: string = INITIAL_ERP_BUSINESS.id): Promise<PurchaseInvoice[]> {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('purchase_invoices')
      .select('*, supplier:parties(*), items:purchase_invoice_items(*)')
      .eq('business_id', businessId)
      .order('bill_date', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as PurchaseInvoice[];
    }
  } catch {}

  return livePurchaseInvoicesState;
}

// 14. Create BOM Recipe Builder
export async function createBomRecipe(
  payload: CreateBomRecipeDTO
): Promise<{ success: boolean; data: BomRecipe }> {
  const recipeId = `bom-${Date.now()}`;
  const outputItem = liveItemsState.find((i) => i.id === payload.output_item_id);

  const ingredients = payload.ingredients.map((ing) => {
    const rawItem = liveItemsState.find((i) => i.id === ing.raw_material_item_id);
    return {
      id: `ing-${Date.now()}-${Math.random()}`,
      recipe_id: recipeId,
      raw_material_item_id: ing.raw_material_item_id,
      raw_material_item: rawItem,
      required_quantity: ing.required_quantity,
      waste_percentage: ing.waste_percentage || 0,
    };
  });

  const newRecipe: BomRecipe = {
    id: recipeId,
    business_id: payload.business_id,
    output_item_id: payload.output_item_id,
    output_item: outputItem,
    recipe_name: payload.recipe_name,
    output_quantity: payload.output_quantity,
    production_cost_overhead: payload.production_cost_overhead,
    notes: payload.notes,
    ingredients: ingredients,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  liveBomState = [newRecipe, ...liveBomState];

  const supabase = await createServerSupabaseClient();
  try {
    await supabase.from('bom_recipes').insert({
      id: newRecipe.id,
      business_id: newRecipe.business_id,
      output_item_id: newRecipe.output_item_id,
      recipe_name: newRecipe.recipe_name,
      output_quantity: newRecipe.output_quantity,
      production_cost_overhead: newRecipe.production_cost_overhead,
      notes: newRecipe.notes,
    });
  } catch (err) {
    console.warn('Supabase BOM insert offline fallback:', err);
  }

  revalidatePath('/dashboard/manufacturing');
  revalidatePath('/dashboard');
  return { success: true, data: newRecipe };
}

// 15. Execute Manufacturing Production Run (Atomic Stock Conversion)
export async function executeProductionRun(
  payload: ExecuteProductionRunDTO
): Promise<{ success: boolean; message: string; data?: any }> {
  const recipe = liveBomState.find((r) => r.id === payload.recipe_id);
  if (!recipe) {
    return { success: false, message: 'BOM Recipe not found.' };
  }

  // 1. Verify Stock for each raw material
  for (const ing of recipe.ingredients) {
    const rawItem = liveItemsState.find((i) => i.id === ing.raw_material_item_id);
    const requiredQty = ing.required_quantity * payload.quantity * (1 + (ing.waste_percentage || 0) / 100);

    if (!rawItem || rawItem.current_stock < requiredQty) {
      return {
        success: false,
        message: `Insufficient stock for raw material "${rawItem?.name || ing.raw_material_item_id}". Required: ${requiredQty.toFixed(2)}, Available: ${rawItem?.current_stock || 0}`,
      };
    }
  }

  // 2. Deduct Raw Material Quantities
  liveItemsState = liveItemsState.map((existingItem) => {
    const ing = recipe.ingredients.find((i) => i.raw_material_item_id === existingItem.id);
    if (ing) {
      const deduction = ing.required_quantity * payload.quantity * (1 + (ing.waste_percentage || 0) / 100);
      return {
        ...existingItem,
        current_stock: Math.max(0, Number((existingItem.current_stock - deduction).toFixed(3))),
        updated_at: new Date().toISOString(),
      };
    }
    return existingItem;
  });

  // 3. Increment Target Finished Good Stock
  const totalProduced = payload.quantity * recipe.output_quantity;
  liveItemsState = liveItemsState.map((existingItem) => {
    if (existingItem.id === recipe.output_item_id) {
      return {
        ...existingItem,
        current_stock: Number((existingItem.current_stock + totalProduced).toFixed(3)),
        updated_at: new Date().toISOString(),
      };
    }
    return existingItem;
  });

  // 4. Run Supabase RPC if available
  const supabase = await createServerSupabaseClient();
  try {
    await supabase.rpc('execute_production_run', {
      p_recipe_id: payload.recipe_id,
      p_quantity: payload.quantity,
      p_business_id: payload.business_id,
    });
  } catch (err) {
    console.warn('Supabase execute_production_run RPC note (memory fallback active):', err);
  }

  revalidatePath('/dashboard/manufacturing');
  revalidatePath('/dashboard/items');
  revalidatePath('/dashboard');

  return {
    success: true,
    message: `Production Run Completed! Successfully produced ${totalProduced} units of ${recipe.output_item?.name || recipe.recipe_name}.`,
    data: {
      recipe_id: recipe.id,
      quantity_produced: totalProduced,
      finished_good_id: recipe.output_item_id,
    },
  };
}


