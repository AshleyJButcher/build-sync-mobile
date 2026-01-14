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
import { type Theme } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCostChanges, useUpdateCostChange, useDeleteCostChange } from '../../src/hooks/useProjectData';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency } from '../../src/lib/currency';
import { format } from 'date-fns';
import { useProjectStore } from '../../src/store/useProjectStore';
import { EditCostChangeModal } from '../../src/components/EditCostChangeModal';

const GREEN_PRIMARY = '#4CAF50';

export default function CostChangeDetailScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedProjectId } = useProjectStore();
  const { data: costChanges, isLoading } = useCostChanges(selectedProjectId);
  const updateCostChange = useUpdateCostChange();
  const deleteCostChange = useDeleteCostChange();
  const { role } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  const costChange = costChanges?.find((c) => c.id === id);

  const isBuilder = role === 'builder' || role === 'administrator';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return GREEN_PRIMARY;
      case 'rejected':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'time-outline';
    }
  };

  const handleApprove = async () => {
    if (!costChange) return;
    Alert.alert(
      'Approve Cost Change',
      'Are you sure you want to approve this cost change?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await updateCostChange.mutateAsync({
                id: costChange.id,
                status: 'approved',
              });
              Alert.alert('Success', 'Cost change approved');
            } catch (error) {
              Alert.alert('Error', 'Failed to approve cost change');
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!costChange) return;
    Alert.alert(
      'Reject Cost Change',
      'Are you sure you want to reject this cost change?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateCostChange.mutateAsync({
                id: costChange.id,
                status: 'rejected',
              });
              Alert.alert('Success', 'Cost change rejected');
            } catch (error) {
              Alert.alert('Error', 'Failed to reject cost change');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    if (!costChange) return;
    Alert.alert(
      'Delete Cost Change',
      'Are you sure you want to delete this cost change? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCostChange.mutateAsync({
                id: costChange.id,
                projectId: costChange.project_id,
                name: costChange.title,
              });
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete cost change');
            }
          },
        },
      ]
    );
  };

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
            Loading cost change...
          </Text>
        </View>
      </View>
    );
  }

  if (!costChange) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, paddingTop: insets.top },
        ]}
      >
        <View style={styles.loadingContainer}>
          <Text
            variant="body"
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Cost change not found
          </Text>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(costChange.status);
  const statusIcon = getStatusIcon(costChange.status);
  const difference = costChange.new_cost - costChange.original_cost;
  const isIncrease = difference > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="headingMedium" style={[styles.headerTitle, { color: theme.colors.text }]}>
          Cost Change Details
        </Text>
        {isBuilder ? (
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
              {costChange.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Cost Change Info */}
        <View style={styles.infoSection}>
          <Text variant="headingLarge" style={[styles.title, { color: theme.colors.text }]}>
            {costChange.title}
          </Text>

          {costChange.category && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: theme.colors.backgroundSecondary },
              ]}
            >
              <Text
                variant="caption"
                style={[styles.categoryText, { color: theme.colors.textSecondary }]}
              >
                {costChange.category}
              </Text>
            </View>
          )}

          {costChange.reason && (
            <Text
              variant="body"
              style={[styles.description, { color: theme.colors.textSecondary }]}
            >
              {costChange.reason}
            </Text>
          )}
        </View>

        {/* Cost Breakdown */}
        <View style={styles.costSection}>
          <Text variant="headingMedium" style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Cost Breakdown
          </Text>

          <View style={styles.costRow}>
            <Text variant="body" style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
              Original Cost:
            </Text>
            <Text variant="body" style={[styles.costValue, { color: theme.colors.text }]}>
              {formatCurrency(costChange.original_cost)}
            </Text>
          </View>

          <View style={styles.costRow}>
            <Text variant="body" style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
              New Cost:
            </Text>
            <Text variant="body" style={[styles.costValue, { color: theme.colors.text }]}>
              {formatCurrency(costChange.new_cost)}
            </Text>
          </View>

          <View
            style={[
              styles.differenceContainer,
              {
                backgroundColor: isIncrease
                  ? `${theme.colors.error}15`
                  : `${GREEN_PRIMARY}15`,
              },
            ]}
          >
            <Text
              variant="headingMedium"
              style={[
                styles.differenceValue,
                { color: isIncrease ? theme.colors.error : GREEN_PRIMARY },
              ]}
            >
              {isIncrease ? '+' : ''}
              {formatCurrency(difference)}
            </Text>
            <Text
              variant="caption"
              style={[
                styles.differenceLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              {isIncrease ? 'Cost Increase' : 'Cost Decrease'}
            </Text>
          </View>

          {costChange.estimated_days && (
            <View style={styles.metaRow}>
              <Ionicons
                name="time-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text
                variant="body"
                style={[styles.metaText, { color: theme.colors.textSecondary }]}
              >
                Estimated: {costChange.estimated_days} days
              </Text>
            </View>
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
              Created: {format(new Date(costChange.created_at), 'MMM d, yyyy')}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {isBuilder && costChange.status === 'pending' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={handleApprove}
              disabled={updateCostChange.isPending}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
              disabled={updateCostChange.isPending}
            >
              <Ionicons name="close-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {isBuilder && (
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: theme.colors.error }]}
            onPress={handleDelete}
            disabled={deleteCostChange.isPending}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            <Text
              variant="body"
              style={[styles.deleteButtonText, { color: theme.colors.error }]}
            >
              Delete Cost Change
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <EditCostChangeModal
        visible={showEditModal}
        costChange={costChange}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  costSection: {
    marginBottom: 32,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 16,
  },
  costValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  differenceContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  differenceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  differenceLabel: {
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: GREEN_PRIMARY,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
