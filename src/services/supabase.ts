import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = 
  Boolean(SUPABASE_URL) && 
  Boolean(SUPABASE_ANON_KEY) && 
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_ANON_KEY.includes('example');

let client: SupabaseClient | null = null;

if (isConfigured) {
  try {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('[Study Labs] Supabase initialization failed, falling back to offline mode.', err);
  }
}

export const SupabaseService = {
  isConfigured,
  client,
  
  async syncOfflineTests(localTests: any[]) {
    if (!client) {
      return { success: true, mode: 'local_offline', syncedCount: localTests.length };
    }
    try {
      const { data, error } = await client.from('offline_test_records').upsert(localTests);
      if (error) throw error;
      return { success: true, mode: 'cloud_synced', data };
    } catch (err: any) {
      return { success: false, mode: 'local_fallback', error: err.message };
    }
  },
};

