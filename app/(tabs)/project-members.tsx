import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useProjectStore } from '../../src/store/useProjectStore';
import { useAuth } from '../../src/hooks/useAuth';
import {
  useProjectMembers,
  useRemoveProjectMember,
  ROLE_LABELS,
  type ProjectMember,
} from '../../src/hooks/useProjectMembers';
import { ProjectMenuButton } from '../../src/components/ProjectMenuButton';
import { HeaderRightActions } from '../../src/components/HeaderRightActions';
import { InviteProjectMemberModal } from '../../src/components/InviteProjectMemberModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProjectMembersScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { selectedProjectId } = useProjectStore();
  const { user, role } = useAuth();
  const { data: members = [], isLoading, refetch } = useProjectMembers(selectedProjectId);
  const removeMember = useRemoveProjectMember(selectedProjectId);
  const [refreshing, setRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const canManageMembers = role === 'builder' || role === 'administrator';

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('[ProjectMembersScreen] Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemoveMember = (member: ProjectMember) => {
    const displayName =
      member.profile?.full_name?.trim() || member.user_id.slice(0, 8) + '…';
    Alert.alert(
      'Remove member',
      `Remove ${displayName} from this project? They will lose access to all project data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMember.mutateAsync(member.user_id);
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to remove member'
              );
            }
          },
        },
      ]
    );
  };

  const renderMember = ({ item }: { item: ProjectMember }) => {
    const displayName =
      item.profile?.full_name?.trim() || item.user_id.slice(0, 8) + '…';
    const isCurrentUser = item.user_id === user?.id;
    const canRemove = canManageMembers && !isCurrentUser;

    return (
      <View
        style={[
          styles.memberCard,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.memberRow}>
          {item.profile?.avatar_url ? (
            <Image
              source={{ uri: item.profile.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: `${GREEN_PRIMARY}25` },
              ]}
            >
              <Text
                variant="body"
                style={[styles.avatarInitials, { color: GREEN_PRIMARY }]}
              >
                {displayName.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.memberInfo}>
            <View style={styles.nameRow}>
              <Text variant="body" style={[styles.memberName, { color: theme.colors.text }]}>
                {displayName}
              </Text>
              {isCurrentUser && (
                <View style={[styles.youBadge, { backgroundColor: `${GREEN_PRIMARY}20` }]}>
                  <Text variant="caption" style={{ color: GREEN_PRIMARY }}>
                    You
                  </Text>
                </View>
              )}
            </View>
            <View style={[styles.roleBadge, { backgroundColor: theme.colors.backgroundSecondary }]}>
              <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                {ROLE_LABELS[item.role] ?? item.role}
              </Text>
            </View>
          </View>
          {canRemove && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveMember(item)}
              disabled={removeMember.isPending}
              hitSlop={12}
            >
              <Ionicons name="person-remove-outline" size={22} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (!selectedProjectId) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, paddingTop: insets.top + 8 },
        ]}
      >
        <View style={styles.header}>
          <ProjectMenuButton />
          <Text variant="headingLarge" style={[styles.headerTitle, { color: theme.colors.text }]}>
            Team members
          </Text>
          <HeaderRightActions />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
          <Text variant="headingMedium" style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No project selected
          </Text>
          <Text
            variant="body"
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            Select a project from the Projects tab to view and manage team members.
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading && members.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, paddingTop: insets.top + 8 },
        ]}
      >
        <View style={styles.header}>
          <ProjectMenuButton />
          <Text variant="headingLarge" style={[styles.headerTitle, { color: theme.colors.text }]}>
            Team members
          </Text>
          <HeaderRightActions />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body" style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading members...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <ProjectMenuButton />
        <Text variant="headingLarge" style={[styles.headerTitle, { color: theme.colors.text }]}>
          Team members
        </Text>
        <HeaderRightActions>
          {canManageMembers && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: GREEN_PRIMARY }]}
              onPress={() => setShowInviteModal(true)}
            >
              <Ionicons name="person-add" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </HeaderRightActions>
      </View>

      {members.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
          <Text variant="headingMedium" style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No members yet
          </Text>
          <Text
            variant="body"
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            {canManageMembers
              ? 'Invite team members by email to collaborate on this project.'
              : 'No other members have been added to this project.'}
          </Text>
          {canManageMembers && (
            <TouchableOpacity
              style={[styles.inviteCta, { backgroundColor: GREEN_PRIMARY }]}
              onPress={() => setShowInviteModal(true)}
            >
              <Text variant="button" style={styles.inviteCtaText}>
                Invite member
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.listContent}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <InviteProjectMemberModal
        visible={showInviteModal}
        projectId={selectedProjectId}
        onClose={() => setShowInviteModal(false)}
      />
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
    paddingBottom: 8,
    gap: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  memberCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  memberName: {
    fontWeight: '600',
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  removeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    marginTop: 8,
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
    marginBottom: 24,
  },
  inviteCta: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  inviteCtaText: {
    color: '#FFFFFF',
  },
});
