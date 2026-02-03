import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useMilestones, type Milestone } from '../../src/hooks/useProjectData';
import { useProjectStore } from '../../src/store/useProjectStore';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { AddMilestoneModal } from '../../src/components/AddMilestoneModal';
import { ProjectMenuButton } from '../../src/components/ProjectMenuButton';
import { useRouter } from 'expo-router';

export default function MilestonesScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedProjectId } = useProjectStore();
  const { role } = useAuth();
  const { data: milestones, isLoading, refetch } = useMilestones(selectedProjectId);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const canEditMilestones = role === 'builder' || role === 'administrator';

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return GREEN_PRIMARY;
      case 'in-progress':
        return '#3B82F6';
      case 'delayed':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in-progress':
        return 'time';
      case 'delayed':
        return 'warning';
      default:
        return 'calendar-outline';
    }
  };

  const renderMilestoneItem = ({ item }: { item: Milestone }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <TouchableOpacity
        style={[
          styles.milestoneCard,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderLeftWidth: 4,
            borderLeftColor: statusColor,
          },
        ]}
        onPress={() => {
          router.push(`/milestone/${item.id}`);
        }}
      >
        <View style={styles.milestoneHeader}>
          <View style={styles.milestoneInfo}>
            <View style={styles.milestoneTitleRow}>
              <Ionicons name={statusIcon as any} size={20} color={statusColor} />
              <Text variant="headingMedium" style={[styles.milestoneTitle, { color: theme.colors.text }]}>
                {item.title}
              </Text>
            </View>
            {item.description && (
              <Text
                variant="bodySmall"
                style={[styles.milestoneDescription, { color: theme.colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.milestoneFooter}>
          <View style={styles.milestoneMeta}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text
              variant="caption"
              style={[styles.milestoneDate, { color: theme.colors.textSecondary }]}
            >
              {format(new Date(item.due_date), 'MMM d, yyyy')}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}20` },
            ]}
          >
            <Text
              variant="caption"
              style={[styles.statusText, { color: statusColor }]}
            >
              {item.status.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: theme.colors.backgroundSecondary,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${item.completion_percentage}%`,
                  backgroundColor: statusColor,
                },
              ]}
            />
          </View>
          <Text
            variant="caption"
            style={[styles.progressText, { color: theme.colors.textSecondary }]}
          >
            {item.completion_percentage}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!selectedProjectId) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, paddingTop: insets.top },
        ]}
      >
        <View style={styles.emptyContainer}>
          <Ionicons
            name="flag-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text
            variant="body"
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            Select a project to view milestones
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading && !milestones) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, paddingTop: insets.top },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            variant="body"
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Loading milestones...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <ProjectMenuButton />
          <Text variant="headingLarge" style={[styles.headerTitle, { color: theme.colors.text }]}>
            Milestones
          </Text>
        </View>
        {canEditMilestones && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: GREEN_PRIMARY }]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {milestones && milestones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="flag-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text
            variant="headingMedium"
            style={[styles.emptyTitle, { color: theme.colors.text }]}
          >
            No Milestones
          </Text>
          <Text
            variant="body"
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            {canEditMilestones
              ? 'Add your first milestone to get started'
              : 'No milestones added yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={milestones || []}
          renderItem={renderMilestoneItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <AddMilestoneModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          refetch();
        }}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
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
  },
  milestoneCard: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  milestoneHeader: {
    marginBottom: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  milestoneDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  milestoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  milestoneMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
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
  },
});
