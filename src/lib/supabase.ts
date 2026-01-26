import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../config/environment';

// Supabase client - lazy initialization to prevent crashes on missing env vars
let supabaseClient: SupabaseClient | null = null;
let initializationError: Error | null = null;

function createSupabaseClient(): SupabaseClient {
  const url = environment.supabaseUrl;
  const key = environment.supabaseAnonKey;

  console.log('[Supabase] Creating client with:', {
    hasUrl: url !== '',
    hasKey: key !== '',
  });

  // Validate credentials
  if (url === '' || key === '') {
    const error = new Error(
      'Supabase credentials are missing. Please configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment variables or EAS secrets.'
    );
    console.error('[Supabase] Configuration error:', error.message);
    throw error;
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

// Initialize client lazily (only when first accessed)
function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  // If we've already tried and failed, throw the cached error
  if (initializationError) {
    throw initializationError;
  }

  try {
    supabaseClient = createSupabaseClient();
    return supabaseClient;
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error(String(error));
    throw initializationError;
  }
}

// Create a Proxy that handles nested property access (like supabase.auth.getSession())
// This makes initialization truly lazy - it only happens when the client is actually used
function createLazyProxy<T extends object>(factory: () => T): T {
  let instance: T | null = null;
  let error: Error | null = null;

  const getInstance = (): T => {
    if (instance) return instance;
    if (error) throw error;
    
    try {
      instance = factory();
      return instance;
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
      throw error;
    }
  };

  return new Proxy({} as T, {
    get(_target, prop) {
      const obj = getInstance();
      const value = (obj as any)[prop];
      
      // If it's a function, bind it to preserve 'this' context
      if (typeof value === 'function') {
        return value.bind(obj);
      }
      
      // If it's an object, wrap it in a proxy too to handle nested access
      if (value && typeof value === 'object') {
        return createLazyProxy(() => value);
      }
      
      return value;
    },
    has(_target, prop) {
      const obj = getInstance();
      return prop in obj;
    },
    ownKeys(_target) {
      const obj = getInstance();
      return Reflect.ownKeys(obj);
    },
    getOwnPropertyDescriptor(_target, prop) {
      const obj = getInstance();
      return Reflect.getOwnPropertyDescriptor(obj, prop);
    },
  });
}

// Export the client with lazy initialization
// This prevents crashes at module load time if environment variables are missing
export const supabase = createLazyProxy(getSupabaseClient);

// Helper to get raw client (for cases where you need direct access)
export const getRawSupabaseClient = (): SupabaseClient => getSupabaseClient();

// Force client recreation (useful if environment changes)
export const recreateSupabaseClient = (): void => {
  console.log('[Supabase] Recreating client due to environment change');
  supabaseClient = null;
  initializationError = null;
};
