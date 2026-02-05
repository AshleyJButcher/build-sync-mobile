import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { useProfile } from '../../src/hooks/useProfile';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const ROLE_LABELS: Record<string, string> = {
  builder: 'Builder',
  client: 'Client',
  'sub-contractor': 'Sub-contractor',
  'architect-designer': 'Architect / Designer',
  administrator: 'Administrator',
  super_admin: 'Super Admin',
  other: 'Other',
};

export default function ProfileScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const { data: profile } = useProfile();

  const displayName = profile?.full_name?.trim() || user?.email?.split('@')[0] || 'User';
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

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text variant="headingLarge" style={[styles.headerTitle, { color: theme.colors.text }]}>
          Profile
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.avatarSection, { backgroundColor: theme.colors.backgroundSecondary }]}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarLarge} />
          ) : (
            <View style={[styles.avatarInitialsLarge, { backgroundColor: GREEN_PRIMARY }]}>
              <Text variant="headingLarge" style={styles.avatarInitialsText}>
                {initials}
              </Text>
            </View>
          )}
          <Text variant="headingMedium" style={[styles.displayName, { color: theme.colors.text }]}>
            {displayName}
          </Text>
          {user?.email && (
            <Text variant="body" style={[styles.email, { color: theme.colors.textSecondary }]}>
              {user.email}
            </Text>
          )}
          {profile?.company_name?.trim() && (
            <View style={styles.companyRow}>
              <Ionicons name="business-outline" size={18} color={theme.colors.textSecondary} />
              <Text variant="body" style={[styles.companyName, { color: theme.colors.textSecondary }]}>
                {profile.company_name}
              </Text>
            </View>
          )}
          {role && (
            <View style={[styles.roleBadge, { backgroundColor: `${GREEN_PRIMARY}20` }]}>
              <Text variant="caption" style={[styles.roleText, { color: GREEN_PRIMARY }]}>
                {ROLE_LABELS[role] ?? role}
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.workspaceNotice,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons name="globe-outline" size={22} color={theme.colors.textSecondary} />
          <Text variant="bodySmall" style={[styles.workspaceNoticeText, { color: theme.colors.textSecondary }]}>
            Workspace details must be configured on the web.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: theme.colors.border }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
          <Text variant="body" style={[styles.logoutButtonText, { color: theme.colors.error }]}>
            Log out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  avatarInitialsLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarInitialsText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 36,
  },
  displayName: {
    marginBottom: 4,
  },
  email: {
    marginBottom: 8,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  companyName: {
    fontSize: 14,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontWeight: '600',
  },
  workspaceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  workspaceNoticeText: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutButtonText: {
    fontWeight: '600',
  },
});
