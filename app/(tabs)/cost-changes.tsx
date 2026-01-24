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
import { type Theme, GREEN_PRIMARY } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useCostChanges, type CostChange } from '../../src/hooks/useProjectData';
import { useProjectStore } from '../../src/store/useProjectStore';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency } from '../../src/lib/currency';
import { format } from 'date-fns';
import { AddCostChangeModal } from '../../src/components/AddCostChangeModal';
import { useRouter } from 'expo-router';

export default function CostChangesScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedProjectId } = useProjectStore();
  const { role } = useAuth();
  const { data: costChanges, isLoading, refetch } = useCostChanges(selectedProjectId);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const canEditCostChanges = role === 'builder' || role === 'administrator';

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Filter cost changes
  const filteredCostChanges = useMemo(() => {
    if (!costChanges) return [];
    if (filter === 'all') return costChanges;
    return costChanges.filter((c) => c.status === filter);
  }, [costChanges, filter]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!costChanges) return { total: 0, approved: 0, pending: 0 };
    const approved = costChanges
      .filter((c) => c.status === 'approved')
      .reduce((sum, c) => sum + (c.new_cost - c.original_cost), 0);
    const pending = costChanges
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + (c.new_cost - c.original_cost), 0);
    return {
      total: approved + pending,
      approved,
      pending,
    };
  }, [costChanges]);

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

  const renderCostChangeItem = ({ item }: { item: CostChange }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    const difference = item.new_cost - item.original_cost;
    const isIncrease = difference > 0;

    return (
      <TouchableOpacity
        style={[
          styles.costChangeCard,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderLeftWidth: 4,
            borderLeftColor: statusColor,
          },
        ]}
        onPress={() => {
          router.push(`/cost-change/${item.id}`);
        }}
      >
        <View style={styles.costChangeHeader}>
          <View style={styles.costChangeInfo}>
            <View style={styles.costChangeTitleRow}>
              <Ionicons name={statusIcon as any} size={20} color={statusColor} />
              <Text variant="headingMedium" style={[styles.costChangeTitle, { color: theme.colors.text }]}>
                {item.title}
              </Text>
            </View>
            {item.reason && (
              <Text
                variant="bodySmall"
                style={[styles.costChangeReason, { color: theme.colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.reason}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.costChangeDetails}>
          <View style={styles.costRow}>
            <Text variant="body" style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
              Original:
            </Text>
            <Text variant="body" style={[styles.costValue, { color: theme.colors.text }]}>
              {formatCurrency(item.original_cost)}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text variant="body" style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
              New:
            </Text>
            <Text variant="body" style={[styles.costValue, { color: theme.colors.text }]}>
              {formatCurrency(item.new_cost)}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text variant="body" style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
              Change:
            </Text>
            <Text
              variant="body"
              style={[
                styles.costDifference,
                { color: isIncrease ? '#EF4444' : GREEN_PRIMARY },
              ]}
            >
              {isIncrease ? '+' : ''}
              {formatCurrency(difference)}
            </Text>
          </View>
        </View>

        <View style={styles.costChangeFooter}>
          <View style={styles.costChangeMeta}>
            {item.category && (
              <>
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
                    {item.category}
                  </Text>
                </View>
                <View style={styles.separator} />
              </>
            )}
            <Ionicons
              name="calendar-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text
              variant="caption"
              style={[styles.costChangeDate, { color: theme.colors.textSecondary }]}
            >
              {format(new Date(item.created_at), 'MMM d, yyyy')}
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
            name="trending-up-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text
            variant="body"
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            Select a project to view cost changes
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading && !costChanges) {
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
            Loading cost changes...
          </Text>
        </View>
      </View>
    );
  }

  const pendingCount = costChanges?.filter((c) => c.status === 'pending').length || 0;

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
            Cost Changes
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
        {canEditCostChanges && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: GREEN_PRIMARY }]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Summary Cards */}
      {totals.total !== 0 && (
        <View style={styles.summaryContainer}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
          >
            <Text
              variant="caption"
              style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}
            >
              Total Change
            </Text>
            <Text
              variant="headingMedium"
              style={[
                styles.summaryValue,
                { color: totals.total > 0 ? '#EF4444' : GREEN_PRIMARY },
              ]}
            >
              {totals.total > 0 ? '+' : ''}
              {formatCurrency(totals.total)}
            </Text>
          </View>
        </View>
      )}

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
                    : theme.colors.backgroundSecondary,
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

      {filteredCostChanges.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="trending-up-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text
            variant="headingMedium"
            style={[styles.emptyTitle, { color: theme.colors.text }]}
          >
            No Cost Changes
          </Text>
          <Text
            variant="body"
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            {canEditCostChanges
              ? 'Add your first cost change to get started'
              : 'No cost changes added yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCostChanges}
          renderItem={renderCostChangeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <AddCostChangeModal
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
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
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
  costChangeCard: {
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
  costChangeHeader: {
    marginBottom: 12,
  },
  costChangeInfo: {
    flex: 1,
  },
  costChangeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  costChangeTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  costChangeReason: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  costChangeDetails: {
    marginBottom: 12,
    gap: 6,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 14,
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  costDifference: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  costChangeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costChangeMeta: {
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
  costChangeDate: {
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
