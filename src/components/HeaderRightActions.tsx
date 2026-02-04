import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../theme';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

interface HeaderRightActionsProps {
  /** Optional slot for add button etc. (e.g. on Schedule, Cost Changes) */
  children?: React.ReactNode;
}

export function HeaderRightActions({ children }: HeaderRightActionsProps) {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const initials = (() => {
    if (profile?.full_name?.trim()) {
      const parts = profile.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return profile.full_name.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      const local = user.email.split('@')[0];
      return local.slice(0, 2).toUpperCase();
    }
    return '?';
  })();

  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <View style={styles.container}>
      {children}
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: theme.colors.backgroundSecondary }]}
        onPress={() => router.push('/(tabs)/notifications')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Notifications"
        accessibilityRole="button"
      >
        <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.avatarButton, { backgroundColor: theme.colors.backgroundSecondary }]}
        onPress={() => router.push('/(tabs)/profile')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Profile"
        accessibilityRole="button"
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatarInitials, { backgroundColor: GREEN_PRIMARY }]}>
            <Text variant="caption" style={styles.avatarInitialsText}>
              {initials}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialsText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
