import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../config/environment';

// Supabase client
let supabaseClient: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  const url = environment.supabaseUrl;
  const key = environment.supabaseAnonKey;

  console.log('[Supabase] Creating client with:', {
    hasUrl: url !== '',
    hasKey: key !== '',
  });

  // Validate credentials
  if (url === '' || key === '') {
    throw new Error(
      'Supabase credentials are missing. Please configure SUPABASE_URL and SUPABASE_ANON_KEY in your environment.'
    );
  }

  return createClient(url, key, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 0,
      },
    },
    global: {
      fetch,
      headers: { 'x-application-name': 'build-sync-mobile' },
    },
  });
}

// Initialize client
function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}

// Export the client
export const supabase = getSupabaseClient();

// Helper to get raw client
export const getRawSupabaseClient = (): SupabaseClient => getSupabaseClient();

// Force client recreation
export const recreateSupabaseClient = (): void => {
  console.log('[Supabase] Recreating client due to environment change');
  supabaseClient = null;
};
