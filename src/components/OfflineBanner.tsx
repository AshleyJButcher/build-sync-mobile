import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '../theme';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineBanner() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetworkStatus();

  if (isConnected !== false) {
    return null;
  }

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.warning,
          paddingTop: insets.top + 8,
          paddingBottom: 8,
        },
      ]}
    >
      <Ionicons name="cloud-offline" size={20} color="#000" />
      <Text variant="caption" style={styles.text}>
        You're offline. Some data may be outdated.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: '#000',
    fontWeight: '600',
  },
});
