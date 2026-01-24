import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMilestones, useUpdateMilestone, useDeleteMilestone } from '../../src/hooks/useProjectData';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, isValid } from 'date-fns';
import { useProjectStore } from '../../src/store/useProjectStore';
import { EditMilestoneModal } from '../../src/components/EditMilestoneModal';

export default function MilestoneDetailScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedProjectId } = useProjectStore();
  const { data: milestones, isLoading } = useMilestones(selectedProjectId);
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();
  const { role } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  const milestone = milestones?.find((m) => m.id === id);

  const isBuilder = role === 'builder' || role === 'administrator';
  const canEdit = isBuilder;

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

  const handleUpdateProgress = async (percentage: number) => {
    if (!milestone) return;

    try {
      // Compute base status from percentage
      const baseStatus =
        percentage === 100
          ? 'completed'
          : percentage > 0
            ? 'in-progress'
            : 'upcoming';

      // Preserve 'delayed' status if milestone is delayed and percentage < 100
      // Still allow 100% to become 'completed' even if delayed
      const newStatus =
        percentage === 100
          ? 'completed'
          : milestone.status === 'delayed' && percentage < 100
            ? 'delayed'
            : baseStatus;

      await updateMilestone.mutateAsync({
        id: milestone.id,
        completion_percentage: percentage,
        status: newStatus,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update milestone progress');
    }
  };

  const handleDelete = async () => {
    if (!milestone) return;
    Alert.alert(
      'Delete Milestone',
      'Are you sure you want to delete this milestone? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMilestone.mutateAsync({
                id: milestone.id,
                projectId: milestone.project_id,
                name: milestone.title,
              });
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete milestone');
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (isLoading) {
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
            Loading milestone...
          </Text>
        </View>
      </View>
    );
  }

  // Not found state
  if (!milestone && !isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, paddingTop: insets.top },
        ]}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text variant="headingMedium" style={[styles.headerTitle, { color: theme.colors.text }]}>
            Milestone Details
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text
            variant="body"
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Milestone not found
          </Text>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(milestone.status);
  const statusIcon = getStatusIcon(milestone.status);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="headingMedium" style={[styles.headerTitle, { color: theme.colors.text }]}>
          Milestone Details
        </Text>
        {canEdit ? (
          <TouchableOpacity
            onPress={() => setShowEditModal(true)}
            style={styles.editButton}
          >
            <Ionicons name="pencil" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}20` },
            ]}
          >
            <Ionicons name={statusIcon as any} size={20} color={statusColor} />
            <Text
              variant="caption"
              style={[styles.statusText, { color: statusColor }]}
            >
              {milestone.status.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Milestone Info */}
        <View style={styles.infoSection}>
          <Text variant="headingLarge" style={[styles.milestoneTitle, { color: theme.colors.text }]}>
            {milestone.title}
          </Text>

          {milestone.description && (
            <Text
              variant="body"
              style={[styles.description, { color: theme.colors.textSecondary }]}
            >
              {milestone.description}
            </Text>
          )}

          <View style={styles.metaRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={theme.colors.textSecondary}
            />
            <Text
              variant="body"
              style={[styles.metaText, { color: theme.colors.textSecondary }]}
            >
              Due:{' '}
              {milestone.due_date && isValid(new Date(milestone.due_date))
                ? format(new Date(milestone.due_date), 'MMM d, yyyy')
                : 'No due date'}
            </Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text variant="headingMedium" style={[styles.progressTitle, { color: theme.colors.text }]}>
              Progress
            </Text>
            <Text
              variant="body"
              style={[styles.progressPercentage, { color: statusColor }]}
            >
              {milestone.completion_percentage}%
            </Text>
          </View>

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
                  width: `${milestone.completion_percentage}%`,
                  backgroundColor: statusColor,
                },
              ]}
            />
          </View>

          {canEdit && (
            <View style={styles.progressButtons}>
              {[0, 25, 50, 75, 100].map((percentage) => (
                <TouchableOpacity
                  key={percentage}
                  style={[
                    styles.progressButton,
                    {
                      backgroundColor:
                        milestone.completion_percentage === percentage
                          ? statusColor
                          : theme.colors.backgroundSecondary,
                    },
                  ]}
                  onPress={() => handleUpdateProgress(percentage)}
                >
                  <Text
                    style={[
                      styles.progressButtonText,
                      {
                        color:
                          milestone.completion_percentage === percentage
                            ? '#FFFFFF'
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {percentage}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Delete Button */}
        {canEdit && (
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: theme.colors.error }]}
            onPress={handleDelete}
            disabled={deleteMilestone.isPending}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            <Text
              variant="body"
              style={[styles.deleteButtonText, { color: theme.colors.error }]}
            >
              Delete Milestone
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <EditMilestoneModal
        visible={showEditModal}
        milestone={milestone}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => setShowEditModal(false)}
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
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 32,
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 32,
    gap: 12,
  },
  milestoneTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  metaText: {
    fontSize: 16,
  },
  progressSection: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  progressButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  progressButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
});
