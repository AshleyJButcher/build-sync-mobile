import packageJson from './package.json';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local (higher priority) and .env
const possiblePaths = [
  resolve(process.cwd(), '.env.local'),
  resolve(__dirname, '.env.local'),
  resolve(process.cwd(), '..', '.env.local'),
];

let envLocalLoaded = false;
for (const envLocalPath of possiblePaths) {
  if (existsSync(envLocalPath)) {
    const result = dotenv.config({ path: envLocalPath });
    if (!result.error) {
      envLocalLoaded = true;
      break;
    }
  }
}

// Also load .env as fallback
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export default {
  name: 'BuildSync',
  slug: 'build-sync-mobile',
  version: packageJson.version,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#4CAF50'
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.buildsync.mobile',
    jsEngine: 'jsc',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSPhotoLibraryUsageDescription: 'This app needs access to your photo library to upload product images for your construction projects.',
      NSPhotoLibraryAddUsageDescription: 'This app needs permission to save images to your photo library.'
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#4CAF50'
    },
    package: 'com.buildsync.mobile'
  },
  web: {
    favicon: './assets/icon.png',
    name: 'BuildSync',
    bundler: 'metro'
  },
  scheme: 'build-sync',
  extra: {
    // EAS project configuration
    eas: {
      projectId: 'eaf2a8c4-6038-4302-ad75-03a920d8f55a'
    },
    // Supabase configuration
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    environment: process.env.EXPO_PUBLIC_ENVIRONMENT,
    isProduction: process.env.EAS_BUILD_PROFILE === 'production'
  },
  plugins: [
    'expo-font',
    'expo-router',
    'expo-web-browser',
    [
      'expo-image-picker',
      {
        photosPermission: 'The app accesses your photos to let you upload product images.',
      },
    ],
  ],
  runtimeVersion: {
    policy: 'appVersion'
  }
};
