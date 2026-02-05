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
import {
  useRemedialItems,
  useUpdateRemedialItem,
  useDeleteRemedialItem,
} from '../../src/hooks/useProjectData';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, isValid } from 'date-fns';
import { useProjectStore } from '../../src/store/useProjectStore';
import { EditRemedialModal } from '../../src/components/EditRemedialModal';

export default function RemedialDetailScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedProjectId } = useProjectStore();
  const { data: remedialItems, isLoading } = useRemedialItems(selectedProjectId);
  const updateRemedialItem = useUpdateRemedialItem();
  const deleteRemedialItem = useDeleteRemedialItem();
  const { role } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  const item = remedialItems?.find((r) => r.id === id);
  const canEdit = role === 'builder' || role === 'administrator';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return GREEN_PRIMARY;
      case 'in-progress':
        return '#3B82F6';
      default:
        return '#F59E0B';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      default:
        return '#9CA3AF';
    }
  };

  const handleDelete = () => {
    if (!item) return;
    Alert.alert(
      'Delete Remedial Item',
      'Are you sure you want to delete this remedial item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRemedialItem.mutateAsync({
                id: item.id,
                projectId: item.project_id,
                name: item.title,
              });
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete remedial item');
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
          <Text variant="body" style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  if (!item && !isLoading) {
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
            Remedial Item
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text variant="body" style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Remedial item not found
          </Text>
        </View>
      </View>
    );
  }

  const selectedItem = item!;
  const statusColor = getStatusColor(selectedItem.status);
  const priorityColor = getPriorityColor(selectedItem.priority);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="headingMedium" style={[styles.headerTitle, { color: theme.colors.text }]}>
          Remedial Item
        </Text>
        {canEdit ? (
          <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.editButton}>
            <Ionicons name="pencil" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: `${priorityColor}20` }]}>
            <Text variant="caption" style={[styles.badgeText, { color: priorityColor }]}>
              {selectedItem.priority.toUpperCase()} PRIORITY
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
            <Text variant="caption" style={[styles.badgeText, { color: statusColor }]}>
              {selectedItem.status.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        <Text variant="headingLarge" style={[styles.title, { color: theme.colors.text }]}>
          {selectedItem.title}
        </Text>

        {selectedItem.description ? (
          <Text
            variant="body"
            style={[styles.description, { color: theme.colors.textSecondary }]}
          >
            {selectedItem.description}
          </Text>
        ) : null}

        <View style={styles.metaSection}>
          <Text variant="caption" style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>
            Reported
          </Text>
          <Text variant="body" style={[styles.metaText, { color: theme.colors.text }]}>
            {selectedItem.created_at && isValid(new Date(selectedItem.created_at))
              ? format(new Date(selectedItem.created_at), 'MMM d, yyyy')
              : '—'}
          </Text>
          {selectedItem.resolved_at && (
            <>
              <Text variant="caption" style={[styles.metaLabel, { color: theme.colors.textSecondary }]}>
                Resolved
              </Text>
              <Text variant="body" style={[styles.metaText, { color: theme.colors.text }]}>
                {isValid(new Date(selectedItem.resolved_at))
                  ? format(new Date(selectedItem.resolved_at), 'MMM d, yyyy')
                  : '—'}
              </Text>
            </>
          )}
        </View>

        {canEdit && (
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: theme.colors.error }]}
            onPress={handleDelete}
            disabled={deleteRemedialItem.isPending}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            <Text variant="body" style={[styles.deleteButtonText, { color: theme.colors.error }]}>
              Delete Remedial Item
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <EditRemedialModal
        visible={showEditModal}
        item={selectedItem}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => setShowEditModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '600' },
  headerSpacer: { width: 32 },
  editButton: { padding: 8 },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 32 },
  badgesRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24, marginBottom: 16 },
  metaSection: { gap: 4 },
  metaLabel: { fontSize: 12, marginTop: 8 },
  metaText: { fontSize: 16 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginTop: 32,
  },
  deleteButtonText: { fontSize: 16, fontWeight: '600' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: { marginTop: 8 },
});
