import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@shopify/restyle';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { lightTheme } from '../src/theme';
import { useAuthStore } from '../src/store/useAuthStore';
import { ErrorBoundaryClass } from '../src/components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60 * 1000, // 1 minute
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (for persist)
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000,
});

function RootLayout() {
  const [isInitializing, setIsInitializing] = useState(true);
  const { isAuthenticated, checkSession } = useAuthStore();
  const router = useRouter();

  // Initialize authentication state
  useEffect(() => {
    console.log('[RootLayout] Initializing app...');
    const initializeAuth = async () => {
      await checkSession();
      console.log('[RootLayout] Session check complete');
      setIsInitializing(false);
    };
    void initializeAuth();
  }, [checkSession]);

  // Navigation logic - redirect based on authentication state
  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isInitializing, isAuthenticated, router]);

  // Show loading during initialization
  if (isInitializing) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider theme={lightTheme}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: lightTheme.colors.background,
              }}
            >
              <ActivityIndicator
                size="large"
                color={lightTheme.colors.primary}
              />
            </View>
            <StatusBar style="dark" />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider theme={lightTheme}>
            <ErrorBoundaryClass>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              </Stack>
            </ErrorBoundaryClass>
            <StatusBar style="dark" />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </PersistQueryClientProvider>
  );
}

export default RootLayout;
