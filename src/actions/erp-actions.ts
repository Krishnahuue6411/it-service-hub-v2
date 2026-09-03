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
