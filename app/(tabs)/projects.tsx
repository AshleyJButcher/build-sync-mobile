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
import { type Theme } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useProjects, type Project } from '../../src/hooks/useProjects';
import { useAuth } from '../../src/hooks/useAuth';
import { useProjectStore } from '../../src/store/useProjectStore';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { CreateProjectModal } from '../../src/components/CreateProjectModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GREEN_PRIMARY = '#4CAF50';

export default function ProjectsScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: projects, isLoading, refetch } = useProjects();
  const { role } = useAuth();
  const { selectedProjectId, setSelectedProject } = useProjectStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const canCreateProject = role === 'builder' || role === 'administrator';

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project.id);
    router.push('/(tabs)');
  };

  const renderProjectItem = ({ item }: { item: Project }) => {
    const isSelected = selectedProjectId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.projectCard,
          {
            backgroundColor: theme.colors.background,
            borderColor: isSelected ? GREEN_PRIMARY : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleSelectProject(item)}
      >
        <View style={styles.projectHeader}>
          <View style={styles.projectTitleContainer}>
            <Text variant="headingMedium" style={styles.projectName}>
              {item.name}
            </Text>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={20} color={GREEN_PRIMARY} />
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === 'active'
                    ? `${GREEN_PRIMARY}20`
                    : item.status === 'completed'
                      ? `${theme.colors.success}20`
                      : `${theme.colors.warning}20`,
              },
            ]}
          >
            <Text
              variant="caption"
              style={{
                color:
                  item.status === 'active'
                    ? GREEN_PRIMARY
                    : item.status === 'completed'
                      ? theme.colors.success
                      : theme.colors.warning,
                textTransform: 'capitalize',
              }}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text
            variant="bodySmall"
            style={[styles.projectDescription, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}

        <View style={styles.projectFooter}>
          {item.address && (
            <View style={styles.projectInfo}>
              <Ionicons
                name="location-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text
                variant="caption"
                style={[styles.projectInfoText, { color: theme.colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.address}
              </Text>
            </View>
          )}
          {item.created_at && (
            <Text
              variant="caption"
              style={[styles.projectDate, { color: theme.colors.textSecondary }]}
            >
              {format(new Date(item.created_at), 'MMM d, yyyy')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !projects) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body" style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading projects...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text variant="headingLarge" style={[styles.headerTitle, { color: theme.colors.text }]}>
          Projects
        </Text>
        {canCreateProject && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: GREEN_PRIMARY }]}
            onPress={() => setShowCreateDialog(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {projects && projects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-outline" size={64} color={theme.colors.textSecondary} />
          <Text variant="headingMedium" style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No Projects Yet
          </Text>
          <Text
            variant="body"
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            {canCreateProject
              ? 'Create your first project to get started'
              : 'You haven\'t been added to any projects yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={projects || []}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <CreateProjectModal
        visible={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onProjectCreated={(projectId) => {
          handleSelectProject(projects?.find((p) => p.id === projectId)!);
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
    paddingTop: 0,
  },
  projectCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  projectDescription: {
    marginBottom: 12,
    lineHeight: 20,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  projectInfoText: {
    flex: 1,
    fontSize: 12,
  },
  projectDate: {
    fontSize: 12,
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
