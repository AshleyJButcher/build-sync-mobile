import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { useAuth } from '../../src/hooks/useAuth';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ProjectSelector } from '../../src/components/ProjectSelector';
import { useProject } from '../../src/hooks/useProjects';
import { useProjectStore } from '../../src/store/useProjectStore';
import { StatsCard } from '../../src/components/StatsCard';
import {
  useProducts,
  useMilestones,
  useDecisions,
  useCostChanges,
} from '../../src/hooks/useProjectData';
import { useMemo, useState } from 'react';
import { formatCurrency } from '../../src/lib/currency';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProjectTabBar } from '../../src/components/ProjectTabBar';

export default function HomeScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { user, role, logout } = useAuth();
  const router = useRouter();
  const { selectedProjectId } = useProjectStore();
  const [refreshing, setRefreshing] = useState(false);
  const { data: project, isLoading: isLoadingProject, refetch: refetchProject } = useProject(selectedProjectId);
  const { data: products, refetch: refetchProducts } = useProducts(selectedProjectId);
  const { data: milestones, refetch: refetchMilestones } = useMilestones(selectedProjectId);
  const { data: decisions, refetch: refetchDecisions } = useDecisions(selectedProjectId);
  const { data: costChanges, refetch: refetchCostChanges } = useCostChanges(selectedProjectId);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchProject(),
      refetchProducts(),
      refetchMilestones(),
      refetchDecisions(),
      refetchCostChanges(),
    ]);
    setRefreshing(false);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const pendingDecisions = decisions?.filter((d) => d.status === 'pending').length || 0;
    const pendingCostChanges = costChanges?.filter((c) => c.status === 'pending').length || 0;
    const completedMilestones = milestones?.filter((m) => m.status === 'completed').length || 0;
    const totalMilestones = milestones?.length || 0;
    const totalProducts = products?.length || 0;
    
    // Calculate total cost changes
    const totalCostChange = costChanges?.reduce((sum, change) => {
      if (change.status === 'approved') {
        return sum + (change.new_cost - change.original_cost);
      }
      return sum;
    }, 0) || 0;

    return {
      pendingDecisions,
      pendingCostChanges,
      completedMilestones,
      totalMilestones,
      totalProducts,
      totalCostChange,
    };
  }, [decisions, costChanges, milestones, products]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 16 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text variant="headingLarge" style={[styles.title, { color: theme.colors.text }]}>
            Dashboard
          </Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ProjectSelector />
        </View>

        {selectedProjectId && (
          <View
            style={[
              styles.tabBarContainer,
              {
                borderTopColor: theme.colors.border,
                borderBottomColor: theme.colors.border,
                backgroundColor: theme.colors.backgroundSecondary,
              },
            ]}
          >
            <ProjectTabBar />
          </View>
        )}

        {selectedProjectId && (
        <>
          {isLoadingProject ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : project ? (
            <>
              <View style={[styles.section, styles.dashboardSection]}>
                <Text variant="headingMedium" style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {project.name}
                </Text>
                {project.description && (
                  <Text variant="body" style={[styles.text, { color: theme.colors.textSecondary }]}>
                    {project.description}
                  </Text>
                )}
                {project.address && (
                  <Text variant="body" style={[styles.text, { color: theme.colors.textSecondary }]}>
                    📍 {project.address}
                  </Text>
                )}
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statCardWrapper}>
                  <StatsCard
                    title="Pending Decisions"
                    value={stats.pendingDecisions}
                    icon="checkmark-circle-outline"
                    variant={stats.pendingDecisions > 0 ? 'primary' : 'default'}
                    onPress={() => router.push('/(tabs)/decisions')}
                  />
                </View>
                <View style={styles.statCardWrapper}>
                  <StatsCard
                    title="Pending Cost Changes"
                    value={stats.pendingCostChanges}
                    icon="trending-up-outline"
                    variant={stats.pendingCostChanges > 0 ? 'primary' : 'default'}
                    onPress={() => router.push('/(tabs)/cost-changes')}
                  />
                </View>
                <View style={styles.statCardWrapper}>
                  <StatsCard
                    title="Milestones"
                    value={`${stats.completedMilestones}/${stats.totalMilestones}`}
                    subtitle={stats.totalMilestones > 0 
                      ? `${Math.round((stats.completedMilestones / stats.totalMilestones) * 100)}% complete`
                      : 'No milestones'}
                    icon="flag-outline"
                    onPress={() => router.push('/(tabs)/milestones')}
                  />
                </View>
                <View style={styles.statCardWrapper}>
                  <StatsCard
                    title="Products"
                    value={stats.totalProducts}
                    icon="cube-outline"
                    onPress={() => router.push('/(tabs)/products')}
                  />
                </View>
                {stats.totalCostChange !== 0 && (
                  <View style={styles.statCardWrapper}>
                    <StatsCard
                      title="Cost Changes"
                      value={stats.totalCostChange > 0 ? `+${formatCurrency(stats.totalCostChange)}` : formatCurrency(stats.totalCostChange)}
                      icon="cash-outline"
                      variant={stats.totalCostChange > 0 ? 'primary' : 'default'}
                      onPress={() => router.push('/(tabs)/cost-changes')}
                    />
                  </View>
                )}
              </View>
            </>
          ) : null}
        </>
      )}

      {!selectedProjectId && (
        <View style={styles.emptyContainer}>
          <Text variant="body" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Select a project to view dashboard
          </Text>
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 16,
  },
  tabBarContainer: {
    marginTop: 12,
    marginBottom: 20,
    marginHorizontal: -16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 20,
    fontWeight: '600',
  },
  text: {
    marginBottom: 8,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    marginHorizontal: -6,
  },
  statCardWrapper: {
    width: '50%',
    padding: 6,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  dashboardSection: {
    marginTop: 8,
  },
});
