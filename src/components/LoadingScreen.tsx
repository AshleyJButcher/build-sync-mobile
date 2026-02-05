import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '../theme';
import { Text } from './Text';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  const theme = useTheme<Theme>();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message ? (
        <Text
          variant="body"
          style={[styles.message, { color: theme.colors.textSecondary }]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  message: {
    marginTop: 8,
  },
});
