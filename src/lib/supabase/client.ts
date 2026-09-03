// Supabase Client for Client Components

export function createClient() {
  try {
    const { createBrowserClient } = require('@supabase/ssr');
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key'
    );
  } catch (e) {
    return {
      from: () => ({
        select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      }),
    };
  }
}
