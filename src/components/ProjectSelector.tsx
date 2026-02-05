import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../theme';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { useProjects, type Project } from '../hooks/useProjects';
import { useProjectStore } from '../store/useProjectStore';

interface ProjectSelectorProps {
  onSelectProject?: (project: Project) => void;
}

export function ProjectSelector({ onSelectProject }: ProjectSelectorProps) {
  const theme = useTheme<Theme>();
  const { data: projects, isLoading } = useProjects();
  const { selectedProjectId, setSelectedProject, clearSelectedProject } = useProjectStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const projectsResolved = projects !== undefined;
  const showLoading = !projectsResolved || isLoading;

  const selectedProject = projects?.find((p) => p.id === selectedProjectId);

  useEffect(() => {
    if (selectedProjectId && projects && projects.length > 0 && !projects.some((p) => p.id === selectedProjectId)) {
      clearSelectedProject();
    }
  }, [selectedProjectId, projects, clearSelectedProject]);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project.id);
    onSelectProject?.(project);
    setIsModalVisible(false);
  };

  const renderProjectItem = ({ item }: { item: Project }) => {
    const isSelected = selectedProjectId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.projectItem,
          {
            backgroundColor: isSelected
              ? `${GREEN_PRIMARY}15`
              : theme.colors.background,
          },
        ]}
        onPress={() => handleSelectProject(item)}
      >
        <View style={styles.projectItemContent}>
          <Text variant="body" style={styles.projectItemName}>
            {item.name}
          </Text>
          {item.address && (
            <Text
              variant="caption"
              style={[styles.projectItemAddress, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.address}
            </Text>
          )}
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color={GREEN_PRIMARY} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.selector,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Ionicons
            name="folder-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
          <View style={styles.selectorTextContainer}>
            <Text variant="caption" style={[styles.selectorLabel, { color: theme.colors.textSecondary }]}>
              Project
            </Text>
            <Text
              variant="body"
              style={[styles.selectorValue, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {selectedProject?.name || 'Select a project'}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.textSecondary}
        />
      </Pressable>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsModalVisible(false)}
          />
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text variant="headingMedium" style={[styles.modalTitle, { color: theme.colors.text }]}>
                Select Project
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {showLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : projects && projects.length > 0 ? (
              <FlatList
                data={projects}
                renderItem={renderProjectItem}
                keyExtractor={(item) => item.id}
                style={styles.projectList}
                keyboardShouldPersistTaps="always"
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="folder-outline"
                  size={48}
                  color={theme.colors.textSecondary}
                />
                <Text
                  variant="body"
                  style={[styles.emptyText, { color: theme.colors.textSecondary }]}
                >
                  No projects available
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    alignSelf: 'stretch',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  selectorTextContainer: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  selectorValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '80%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  projectList: {
    flex: 1,
    minHeight: 120,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  projectItemContent: {
    flex: 1,
  },
  projectItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  projectItemAddress: {
    fontSize: 12,
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
    marginTop: 16,
  },
});
