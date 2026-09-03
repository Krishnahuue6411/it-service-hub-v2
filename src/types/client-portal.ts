// ==============================================================================
// MULTI-TENANT CLIENT PORTAL DOMAIN TYPES
// ==============================================================================

export type BusinessType = 'XEROX' | 'PRINTING_PRESS' | 'RETAIL_ERP';

export interface Client {
  id: string;
  client_name: string;
  owner_name: string;
  email: string;
  phone?: string;
  business_type: BusinessType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClientDTO {
  client_name: string;
  owner_name: string;
  email: string;
  phone?: string;
  password?: string;
  business_type: BusinessType;
}

export interface ClientLoginResult {
  success: boolean;
  redirectUrl: string;
  client?: Client;
  error?: string;
}

// Helper to determine destination URL based on business_type
export function resolvePortalRoute(businessType: BusinessType): string {
  switch (businessType) {
    case 'XEROX':
      return '/portal/xerox';
    case 'PRINTING_PRESS':
      return '/dashboard/billing/new';
    case 'RETAIL_ERP':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

