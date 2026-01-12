import Constants from 'expo-constants';

type DataSource = 'mock' | 'production';

interface EnvironmentConfig {
  dataSource: DataSource;
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

// Determine data source
function getEnvironmentConfig(): EnvironmentConfig {
  const supabaseConfig = getSupabaseConfig();

  // If Supabase URL is set, use Supabase
  if (supabaseConfig.url !== '' && supabaseConfig.anonKey !== '') {
    return {
      dataSource: 'production',
      supabaseUrl: supabaseConfig.url,
      supabaseAnonKey: supabaseConfig.anonKey,
    };
  }

  // Otherwise, use mock data
  return {
    dataSource: 'mock',
    supabaseUrl: '',
    supabaseAnonKey: '',
  };
}

const currentConfig = getEnvironmentConfig();

export const environment = {
  get dataSource() {
    return currentConfig.dataSource;
  },
  get supabaseUrl() {
    return currentConfig.supabaseUrl;
  },
  get supabaseAnonKey() {
    return currentConfig.supabaseAnonKey;
  },
  get isMock() {
    return currentConfig.dataSource === 'mock';
  },
  get isProduction() {
    return currentConfig.dataSource === 'production';
  },
  get isSupabase() {
    return currentConfig.dataSource === 'production';
  },
};

console.log('[Environment] Initialized with:', {
  dataSource: environment.dataSource,
  hasUrl: environment.supabaseUrl !== '',
  hasKey: environment.supabaseAnonKey !== '',
});
