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
import { useRemedialItems, type RemedialItem } from '../../src/hooks/useProjectData';
import { useProjectStore } from '../../src/store/useProjectStore';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { AddRemedialModal } from '../../src/components/AddRemedialModal';
import { ProjectMenuButton } from '../../src/components/ProjectMenuButton';
import { useRouter } from 'expo-router';

export default function RemedialScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedProjectId } = useProjectStore();
  const { role } = useAuth();
  const { data: remedialItems, isLoading, refetch } = useRemedialItems(selectedProjectId);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const canEditRemedial = role === 'builder' || role === 'administrator';

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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

  const renderItem = ({ item }: { item: RemedialItem }) => {
    const statusColor = getStatusColor(item.status);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderLeftWidth: 4,
            borderLeftColor: priorityColor,
          },
        ]}
        onPress={() => router.push(`/remedial/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text variant="headingMedium" style={[styles.cardTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}20` }]}>
            <Text variant="caption" style={[styles.priorityText, { color: priorityColor }]}>
              {item.priority.toUpperCase()}
            </Text>
          </View>
        </View>
        {item.description ? (
          <Text
            variant="bodySmall"
            style={[styles.cardDescription, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        ) : null}
        <View style={styles.cardFooter}>
          <Text variant="caption" style={[styles.dateText, { color: theme.colors.textSecondary }]}>
            {format(new Date(item.created_at), 'MMM d, yyyy')}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text variant="caption" style={[styles.statusText, { color: statusColor }]}>
              {item.status.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
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
          <Ionicons name="construct-outline" size={64} color={theme.colors.textSecondary} />
          <Text variant="body" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Select a project to view remedial items
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading && !remedialItems) {
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
            Loading remedial items...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <ProjectMenuButton />
          <Text variant="headingLarge" style={[styles.headerTitle, { color: theme.colors.text }]}>
            Remedial Works
          </Text>
        </View>
        {canEditRemedial && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: GREEN_PRIMARY }]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {remedialItems && remedialItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={64} color={theme.colors.textSecondary} />
          <Text variant="headingMedium" style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No Remedial Items
          </Text>
          <Text variant="body" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {canEditRemedial
              ? 'Add your first remedial item to track issues'
              : 'No remedial items yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={remedialItems || []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <AddRemedialModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => refetch()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: { padding: 16 },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', flex: 1 },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: { fontSize: 11, fontWeight: '600' },
  cardDescription: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: { fontSize: 12 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: { marginTop: 8 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: { marginTop: 16, marginBottom: 8 },
  emptyText: { textAlign: 'center', lineHeight: 22 },
});
