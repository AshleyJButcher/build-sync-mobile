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
import { useDecisions, useUpdateDecision, useDeleteDecision } from '../../src/hooks/useProjectData';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useProjectStore } from '../../src/store/useProjectStore';
import { EditDecisionModal } from '../../src/components/EditDecisionModal';

const GREEN_PRIMARY = '#4CAF50';

export default function DecisionDetailScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedProjectId } = useProjectStore();
  const { data: decisions, isLoading } = useDecisions(selectedProjectId);
  const updateDecision = useUpdateDecision();
  const deleteDecision = useDeleteDecision();
  const { role } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  const decision = decisions?.find((d) => d.id === id);

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
    if (!decision) return;
    Alert.alert(
      'Approve Decision',
      'Are you sure you want to approve this decision?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await updateDecision.mutateAsync({
                id: decision.id,
                status: 'approved',
              });
              Alert.alert('Success', 'Decision approved');
            } catch (error) {
              Alert.alert('Error', 'Failed to approve decision');
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!decision) return;
    Alert.alert(
      'Reject Decision',
      'Are you sure you want to reject this decision?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDecision.mutateAsync({
                id: decision.id,
                status: 'rejected',
              });
              Alert.alert('Success', 'Decision rejected');
            } catch (error) {
              Alert.alert('Error', 'Failed to reject decision');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    if (!decision) return;
    Alert.alert(
      'Delete Decision',
      'Are you sure you want to delete this decision? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDecision.mutateAsync({
                id: decision.id,
                projectId: decision.project_id,
                name: decision.title,
              });
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete decision');
            }
          },
        },
      ]
    );
  };

  if (isLoading || !decision) {
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
            {isLoading ? 'Loading decision...' : 'Decision not found'}
          </Text>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(decision.status);
  const statusIcon = getStatusIcon(decision.status);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="headingMedium" style={[styles.headerTitle, { color: theme.colors.text }]}>
          Decision Details
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
              {decision.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Decision Info */}
        <View style={styles.infoSection}>
          <Text variant="headingLarge" style={[styles.decisionTitle, { color: theme.colors.text }]}>
            {decision.title}
          </Text>

          {decision.description && (
            <Text
              variant="body"
              style={[styles.description, { color: theme.colors.textSecondary }]}
            >
              {decision.description}
            </Text>
          )}

          <View style={styles.metaContainer}>
            {decision.category && (
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
                  {decision.category}
                </Text>
              </View>
            )}

            {decision.due_date && (
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
                  Due: {format(new Date(decision.due_date), 'MMM d, yyyy')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        {isBuilder && decision.status === 'pending' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={handleApprove}
              disabled={updateDecision.isPending}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
              disabled={updateDecision.isPending}
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
            disabled={deleteDecision.isPending}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            <Text
              variant="body"
              style={[styles.deleteButtonText, { color: theme.colors.error }]}
            >
              Delete Decision
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <EditDecisionModal
        visible={showEditModal}
        decision={decision}
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
  decisionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
