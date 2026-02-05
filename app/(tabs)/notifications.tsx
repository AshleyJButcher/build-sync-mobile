import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="headingLarge" style={[styles.headerTitle, { color: theme.colors.text }]}>
          Notifications
        </Text>
      </View>

      <View style={styles.emptyContainer}>
        <Ionicons
          name="notifications-outline"
          size={64}
          color={theme.colors.textSecondary}
        />
        <Text
          variant="headingMedium"
          style={[styles.emptyTitle, { color: theme.colors.text }]}
        >
          No notifications yet
        </Text>
        <Text
          variant="body"
          style={[styles.emptyText, { color: theme.colors.textSecondary }]}
        >
          When you have notifications, they’ll show up here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
