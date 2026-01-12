import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useDecisions, type Decision } from '../../src/hooks/useProjectData';
import { useProjectStore } from '../../src/store/useProjectStore';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';

const GREEN_PRIMARY = '#4CAF50';

export default function DecisionsScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { selectedProjectId } = useProjectStore();
  const { role } = useAuth();
  const { data: decisions, isLoading, refetch } = useDecisions(selectedProjectId);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const canEditDecisions = role === 'builder' || role === 'administrator';

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Filter decisions
  const filteredDecisions = useMemo(() => {
    if (!decisions) return [];
    if (filter === 'all') return decisions;
    return decisions.filter((d) => d.status === filter);
  }, [decisions, filter]);

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

  const renderDecisionItem = ({ item }: { item: Decision }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <TouchableOpacity
        style={[
          styles.decisionCard,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderLeftWidth: 4,
            borderLeftColor: statusColor,
          },
        ]}
      >
        <View style={styles.decisionHeader}>
          <View style={styles.decisionInfo}>
            <View style={styles.decisionTitleRow}>
              <Ionicons name={statusIcon as any} size={20} color={statusColor} />
              <Text variant="headingMedium" style={[styles.decisionTitle, { color: theme.colors.text }]}>
                {item.title}
              </Text>
            </View>
            {item.description && (
              <Text
                variant="bodySmall"
                style={[styles.decisionDescription, { color: theme.colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.decisionFooter}>
          <View style={styles.decisionMeta}>
            {item.category && (
              <>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: theme.colors.muted },
                  ]}
                >
                  <Text
                    variant="caption"
                    style={[styles.categoryText, { color: theme.colors.textSecondary }]}
                  >
                    {item.category}
                  </Text>
                </View>
                <View style={styles.separator} />
              </>
            )}
            {item.due_date && (
              <>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={theme.colors.textSecondary}
                />
                <Text
                  variant="caption"
                  style={[styles.decisionDate, { color: theme.colors.textSecondary }]}
                >
                  Due: {format(new Date(item.due_date), 'MMM d, yyyy')}
                </Text>
              </>
            )}
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
              {item.status.toUpperCase()}
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
          <Ionicons
            name="checkmark-circle-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text
            variant="body"
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            Select a project to view decisions
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading && !decisions) {
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
            Loading decisions...
          </Text>
        </View>
      </View>
    );
  }

  const pendingCount = decisions?.filter((d) => d.status === 'pending').length || 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text variant="headingLarge" style={[styles.headerTitle, { color: theme.colors.text }]}>
            Decisions
          </Text>
          {pendingCount > 0 && (
            <Text
              variant="caption"
              style={[styles.pendingBadge, { color: theme.colors.textSecondary }]}
            >
              {pendingCount} pending
            </Text>
          )}
        </View>
        {canEditDecisions && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: GREEN_PRIMARY }]}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filter === filterOption
                    ? GREEN_PRIMARY
                    : theme.colors.muted,
              },
            ]}
            onPress={() => setFilter(filterOption)}
          >
            <Text
              variant="caption"
              style={[
                styles.filterChipText,
                {
                  color:
                    filter === filterOption ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredDecisions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="checkmark-circle-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text
            variant="headingMedium"
            style={[styles.emptyTitle, { color: theme.colors.text }]}
          >
            No Decisions
          </Text>
          <Text
            variant="body"
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            {canEditDecisions
              ? 'Add your first decision to get started'
              : 'No decisions added yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDecisions}
          renderItem={renderDecisionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  pendingBadge: {
    fontSize: 12,
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  decisionCard: {
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
  decisionHeader: {
    marginBottom: 12,
  },
  decisionInfo: {
    flex: 1,
  },
  decisionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  decisionTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  decisionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  decisionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  decisionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
  },
  decisionDate: {
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
