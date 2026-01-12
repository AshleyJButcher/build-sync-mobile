import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../config/environment';

// Dynamic Supabase client
let supabaseClient: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient | null {
  const url = environment.supabaseUrl;
  const key = environment.supabaseAnonKey;

  console.log('[Supabase] Creating client with:', {
    dataSource: environment.dataSource,
    hasUrl: url !== '',
    hasKey: key !== '',
  });

  // Return null for mock environment
  if (environment.isMock) {
    console.log('[Supabase] Using mock data source - no client created');
    return null;
  }

  // Validate credentials
  if (url === '' || key === '') {
    console.warn('[Supabase] Missing credentials - cannot create client');
    return null;
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
function getSupabaseClient(): SupabaseClient | null {
  supabaseClient = createSupabaseClient();
  return supabaseClient;
}

// Create a proxy object that always uses the current environment
const createSupabaseProxy = (): SupabaseClient => {
  const dummyError = new Error(
    'Supabase client not available - check environment configuration'
  );

  return new Proxy({} as const, {
    get(target, prop) {
      const client = getSupabaseClient();

      if (client === null) {
        // Return dummy functions for mock environment
        if (prop === 'auth') {
          return {
            signIn: async () => {
              throw dummyError;
            },
            signOut: async () => {
              throw dummyError;
            },
            signUp: async () => {
              throw dummyError;
            },
            getSession: async () => {
              return { data: { session: null }, error: null };
            },
            onAuthStateChange: () => {
              return {
                data: {
                  subscription: {
                    unsubscribe: () => {},
                  },
                },
              };
            },
          };
        }

        if (prop === 'from') {
          return () => ({
            select: async () => {
              throw dummyError;
            },
            insert: async () => {
              throw dummyError;
            },
            update: async () => {
              throw dummyError;
            },
            delete: async () => {
              throw dummyError;
            },
            upsert: async () => {
              throw dummyError;
            },
          });
        }

        return () => {
          throw dummyError;
        };
      }

      // Return the actual client property
      return client[prop as keyof SupabaseClient];
    },
  }) as SupabaseClient;
};

// Export the proxy as the main client
export const supabase = createSupabaseProxy();

// Helper function to check if we're using Supabase
export const isUsingSupabase = (): boolean => !environment.isMock;

// Helper to get raw client
export const getRawSupabaseClient = (): SupabaseClient | null =>
  getSupabaseClient();

// Force client recreation
export const recreateSupabaseClient = (): void => {
  console.log('[Supabase] Recreating client due to environment change');
  supabaseClient = null;
};
