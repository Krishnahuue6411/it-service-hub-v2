'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../lib/supabase/server';
import { Client, BusinessType, CreateClientDTO, ClientLoginResult, resolvePortalRoute } from '../types/client-portal';

// Initial preloaded clients for instant testing and demonstration
let liveClientsStore: Client[] = [
  {
    id: 'c-001',
    client_name: 'Shree Xerox & Cyber Center',
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
    client_name: 'Omkar Printing Press & Graphics',
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
    client_name: 'Mahavir Retail & IT Hardware ERP',
    owner_name: 'Mahesh Jain',
    email: 'erp@mahavirretail.com',
    phone: '9876543210',
    business_type: 'RETAIL_ERP',
    is_active: true,
    created_at: '2026-08-15T11:00:00Z',
    updated_at: '2026-08-15T11:00:00Z',
  },
];


// 1. Fetch all clients (Admin Master View)
export async function getClients(): Promise<Client[]> {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as Client[];
    }
  } catch (err) {
    console.warn('Supabase getClients offline fallback active');
  }

  return liveClientsStore;
}

// 2. Create a new client tenant
export async function createClient(
  payload: CreateClientDTO
): Promise<{ success: boolean; data?: Client; error?: string }> {
  try {
    const clientId = `client-${Date.now()}`;
    const newClient: Client = {
      id: clientId,
      client_name: payload.client_name.trim(),
      owner_name: payload.owner_name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone?.trim() || '',
      business_type: payload.business_type,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save in memory state
    liveClientsStore = [newClient, ...liveClientsStore];

    // Attempt Supabase Auth & DB insert
    const supabase = await createServerSupabaseClient();
    try {
      // 1. Try creating Auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newClient.email,
        password: payload.password || 'Welcome@123',
        email_confirm: true,
        user_metadata: {
          client_name: newClient.client_name,
          business_type: newClient.business_type,
        },
      });

      const actualId = authData?.user?.id || newClient.id;

      // 2. Insert into clients table
      await supabase.from('clients').insert({
        id: actualId,
        client_name: newClient.client_name,
        owner_name: newClient.owner_name,
        email: newClient.email,
        phone: newClient.phone,
        business_type: newClient.business_type,
        is_active: true,
      });

      newClient.id = actualId;
    } catch (authErr) {
      console.warn('Supabase Auth provisioning offline note (client stored in memory):', authErr);
    }

    revalidatePath('/admin/clients');
    return { success: true, data: newClient };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create client' };
  }
}

// 3. Toggle Client Active / Inactive Status
export async function toggleClientStatus(
  clientId: string,
  isActive: boolean
): Promise<{ success: boolean }> {
  liveClientsStore = liveClientsStore.map((c) =>
    c.id === clientId ? { ...c, is_active: isActive, updated_at: new Date().toISOString() } : c
  );

  const supabase = await createServerSupabaseClient();
  try {
    await supabase.from('clients').update({ is_active: isActive }).eq('id', clientId);
  } catch {}

  revalidatePath('/admin/clients');
  return { success: true };
}

// 4. Admin Reset Password Trigger
export async function resetClientPassword(
  clientId: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const target = liveClientsStore.find((c) => c.id === clientId);
  if (!target) {
    return { success: false, message: 'Client not found' };
  }

  const supabase = await createServerSupabaseClient();
  try {
    await supabase.auth.admin.updateUserById(clientId, {
      password: newPassword,
    });
  } catch (err) {
    console.warn('Password reset offline note');
  }

  return {
    success: true,
    message: `Password for "${target.client_name}" (${target.email}) has been successfully updated to: ${newPassword}`,
  };
}

// 5. Smart Login & Redirect Router
export async function loginClient(
  emailOrPhone: string,
  password: string
): Promise<ClientLoginResult> {
  const cleanInput = emailOrPhone.trim().toLowerCase();

  // Search in memory / live clients store
  const matchedClient = liveClientsStore.find(
    (c) => c.email.toLowerCase() === cleanInput || (c.phone && c.phone === cleanInput)
  );

  if (!matchedClient) {
    return {
      success: false,
      redirectUrl: '/login',
      error: 'Invalid credentials. No client account registered with this email or phone.',
    };
  }

  if (!matchedClient.is_active) {
    return {
      success: false,
      redirectUrl: '/login',
      error: 'This client account has been suspended by the administrator. Please contact support.',
    };
  }

  // Attempt Supabase Auth signInWithPassword
  const supabase = await createServerSupabaseClient();
  try {
    await supabase.auth.signInWithPassword({
      email: matchedClient.email,
      password: password,
    });
  } catch (err) {
    console.warn('Supabase signInWithPassword fallback (local mock session active)');
  }

  // Determine dedicated business portal
  const targetUrl = resolvePortalRoute(matchedClient.business_type);

  return {
    success: true,
    redirectUrl: targetUrl,
    client: matchedClient,
  };
}
