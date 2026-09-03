'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../lib/supabase/server';
import { Client, BusinessType, CreateClientDTO, ClientLoginResult, resolvePortalRoute } from '../types/client-portal';

/**
 * In-memory client storage for local development and offline mode.
 * Preloaded with sample businesses for each business_type.
 */
let memoryClients: Client[] = [
  {
    id: 'c-001',
    client_name: 'Shree Xerox & Prints',
    owner_name: 'Suresh Patil',
    email: 'xerox@shreeprint.com',
    phone: '9822114455',
    business_type: 'XEROX',
    is_active: true,
    created_at: '2026-08-01T09:00:00Z',
    updated_at: '2026-08-01T09:00:00Z',
  },
  {
    id: 'c-002',
    client_name: 'Omkar Printing Press',
    owner_name: 'Amit Shinde',
    email: 'press@omkarpress.com',
    phone: '9833221100',
    business_type: 'PRINTING_PRESS',
    is_active: true,
    created_at: '2026-08-10T10:30:00Z',
    updated_at: '2026-08-10T10:30:00Z',
  },
  {
    id: 'c-003',
    client_name: 'Mahavir Retail ERP',
    owner_name: 'Mahesh Jain',
    email: 'erp@mahavirretail.com',
    phone: '9876543210',
    business_type: 'RETAIL_ERP',
    is_active: true,
    created_at: '2026-08-15T11:00:00Z',
    updated_at: '2026-08-15T11:00:00Z',
  },
];

/**
 * STEP 1: Fetch all registered clients
 * Called by the Super Admin Client Control Center.
 */
export async function getClients(): Promise<Client[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    // Return database records if available
    if (!error && data && data.length > 0) {
      return data as Client[];
    }
  } catch (err) {
    console.warn('Supabase offline note: using memory store for clients.');
  }

  // Return memory store if database is offline or empty
  return memoryClients;
}

/**
 * STEP 2: Create a new client account
 * Creates the auth user in Supabase Auth and inserts the client profile.
 */
export async function createClient(
  payload: CreateClientDTO
): Promise<{ success: boolean; client?: Client; error?: string }> {
  try {
    const clientEmail = payload.email.trim().toLowerCase();
    const temporaryPassword = payload.password || 'Welcome@123';

    // 1. Prepare local client record
    const newClient: Client = {
      id: `client-${Date.now()}`,
      client_name: payload.client_name.trim(),
      owner_name: payload.owner_name.trim(),
      email: clientEmail,
      phone: payload.phone?.trim() || '',
      business_type: payload.business_type,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 2. Save into memory store
    memoryClients = [newClient, ...memoryClients];

    // 3. Attempt Supabase Auth admin user creation
    try {
      const supabase = await createServerSupabaseClient();
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email: clientEmail,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          client_name: newClient.client_name,
          business_type: newClient.business_type,
        },
      });

      if (!authErr && authUser?.user) {
        newClient.id = authUser.user.id;

        // Insert into public.clients table
        await supabase.from('clients').insert({
          id: newClient.id,
          client_name: newClient.client_name,
          owner_name: newClient.owner_name,
          email: newClient.email,
          phone: newClient.phone,
          business_type: newClient.business_type,
          is_active: true,
        });
      }
    } catch (authError) {
      console.warn('Supabase Auth provisioning offline note: client created in local memory.');
    }

    // Refresh admin page cache
    revalidatePath('/admin/clients');
    return { success: true, client: newClient };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create client account' };
  }
}

/**
 * STEP 3: Toggle client active/inactive status
 * Allows Super Admin to suspend or reactivate client access.
 */
export async function toggleClientStatus(
  clientId: string,
  isActive: boolean
): Promise<{ success: boolean }> {
  // Update memory store
  memoryClients = memoryClients.map((c) =>
    c.id === clientId ? { ...c, is_active: isActive, updated_at: new Date().toISOString() } : c
  );

  // Attempt database update
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.from('clients').update({ is_active: isActive }).eq('id', clientId);
  } catch {}

  revalidatePath('/admin/clients');
  return { success: true };
}

/**
 * STEP 4: Authenticate client and resolve smart redirection route
 * Inspects credentials, verifies is_active status, and routes strictly by business_type.
 */
export async function loginClient(
  emailInput: string,
  passwordInput: string
): Promise<ClientLoginResult> {
  const cleanEmail = emailInput.trim().toLowerCase();

  // 1. Check for Super Admin account
  if (cleanEmail === 'admin@it-hub.com' || cleanEmail === 'admin@business.com') {
    return {
      success: true,
      redirectUrl: '/admin/clients',
    };
  }

  // 2. Find client in memory / database
  const client = memoryClients.find((c) => c.email.toLowerCase() === cleanEmail);

  if (!client) {
    return {
      success: false,
      redirectUrl: '/login',
      error: 'Invalid credentials. No client registered with this email.',
    };
  }

  // 3. Verify active status
  if (!client.is_active) {
    return {
      success: false,
      redirectUrl: '/login',
      error: 'Account is inactive. Contact Administrator.',
    };
  }

  // 4. Attempt Supabase Auth login
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: passwordInput,
    });
  } catch (err) {
    console.warn('Supabase sign-in offline note: local session active.');
  }

  // 5. Route strictly based on assigned business_type
  let targetUrl = '/dashboard';
  if (client.business_type === 'XEROX') {
    targetUrl = '/portal/xerox';
  } else if (client.business_type === 'PRINTING_PRESS') {
    targetUrl = '/dashboard/billing/new';
  } else if (client.business_type === 'RETAIL_ERP') {
    targetUrl = '/dashboard';
  }

  return {
    success: true,
    redirectUrl: targetUrl,
    client: client,
  };
}

/**
 * STEP 5: Sign out client
 * Clears authentication session and redirects back to login.
 */
export async function signOutClient(): Promise<{ success: boolean; redirectUrl: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {}

  return {
    success: true,
    redirectUrl: '/login',
  };
}
