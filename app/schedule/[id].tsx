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
  useScheduleItems,
  useUpdateScheduleItem,
  useDeleteScheduleItem,
} from '../../src/hooks/useProjectData';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, isValid } from 'date-fns';
import { useProjectStore } from '../../src/store/useProjectStore';
import { EditScheduleModal } from '../../src/components/EditScheduleModal';

export default function ScheduleDetailScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedProjectId } = useProjectStore();
  const { data: scheduleItems, isLoading } = useScheduleItems(selectedProjectId);
  const updateScheduleItem = useUpdateScheduleItem();
  const deleteScheduleItem = useDeleteScheduleItem();
  const { role } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  const item = scheduleItems?.find((s) => s.id === id);
  const canEdit = role === 'builder' || role === 'administrator';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return GREEN_PRIMARY;
      case 'in-progress':
        return '#3B82F6';
      case 'cancelled':
        return '#9CA3AF';
      default:
        return '#F59E0B';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in-progress':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'calendar-outline';
    }
  };

  const handleDelete = () => {
    if (!item) return;
    Alert.alert(
      'Delete Schedule Item',
      'Are you sure you want to delete this schedule item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScheduleItem.mutateAsync({
                id: item.id,
                projectId: item.project_id,
                name: item.title,
              });
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete schedule item');
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
            Schedule Item
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text variant="body" style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Schedule item not found
          </Text>
        </View>
      </View>
    );
  }

  const selectedItem = item!;
  const statusColor = getStatusColor(selectedItem.status);
  const statusIcon = getStatusIcon(selectedItem.status);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="headingMedium" style={[styles.headerTitle, { color: theme.colors.text }]}>
          Schedule Item
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
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Ionicons name={statusIcon as any} size={20} color={statusColor} />
            <Text variant="caption" style={[styles.statusText, { color: statusColor }]}>
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
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
            <Text variant="body" style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              Start:{' '}
              {selectedItem.start_date && isValid(new Date(selectedItem.start_date))
                ? format(new Date(selectedItem.start_date), 'MMM d, yyyy')
                : '—'}
            </Text>
          </View>
          {selectedItem.end_date && (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
              <Text variant="body" style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                End:{' '}
                {isValid(new Date(selectedItem.end_date))
                  ? format(new Date(selectedItem.end_date), 'MMM d, yyyy')
                  : '—'}
              </Text>
            </View>
          )}
          {selectedItem.location && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={18} color={theme.colors.textSecondary} />
              <Text variant="body" style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                {selectedItem.location}
              </Text>
            </View>
          )}
        </View>

        {canEdit && (
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: theme.colors.error }]}
            onPress={handleDelete}
            disabled={deleteScheduleItem.isPending}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            <Text variant="body" style={[styles.deleteButtonText, { color: theme.colors.error }]}>
              Delete Schedule Item
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <EditScheduleModal
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
  statusContainer: { marginBottom: 24 },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24, marginBottom: 16 },
  metaSection: { gap: 8 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
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
