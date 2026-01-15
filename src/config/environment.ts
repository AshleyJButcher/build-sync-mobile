import Constants from 'expo-constants';

interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Get Supabase configuration from Constants.expoConfig.extra
function getSupabaseConfig(): { url: string; anonKey: string } {
  const configFromExtra = Constants.expoConfig?.extra;
  const url = (configFromExtra?.supabaseUrl as string) ?? '';
  const anonKey = (configFromExtra?.supabaseAnonKey as string) ?? '';
  return { url, anonKey };
}

const supabaseConfig = getSupabaseConfig();

export const environment = {
  get supabaseUrl() {
    return supabaseConfig.url;
  },
  get supabaseAnonKey() {
    return supabaseConfig.anonKey;
  },
};

console.log('[Environment] Initialized with:', {
  hasUrl: environment.supabaseUrl !== '',
  hasKey: environment.supabaseAnonKey !== '',
});
