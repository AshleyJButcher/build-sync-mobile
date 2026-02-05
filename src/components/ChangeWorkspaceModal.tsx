import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../theme';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { useWorkspaces, type Workspace } from '../hooks/useWorkspaces';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useProjectStore } from '../store/useProjectStore';

interface ChangeWorkspaceModalProps {
  visible: boolean;
  onClose: () => void;
  onWorkspaceChanged?: (workspace: Workspace) => void;
}

export function ChangeWorkspaceModal({
  visible,
  onClose,
  onWorkspaceChanged,
}: ChangeWorkspaceModalProps) {
  const theme = useTheme<Theme>();
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const { selectedWorkspaceId, setSelectedWorkspace } = useWorkspaceStore();
  const { clearSelectedProject } = useProjectStore();

  const handleSelect = (workspace: Workspace) => {
    setSelectedWorkspace(workspace.id);
    clearSelectedProject();
    onWorkspaceChanged?.(workspace);
    onClose();
  };

  const renderItem = ({ item }: { item: Workspace }) => {
    const isSelected = selectedWorkspaceId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: isSelected
              ? `${GREEN_PRIMARY}15`
              : theme.colors.background,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <Text
          variant="body"
          style={[
            styles.itemName,
            { color: theme.colors.text, fontWeight: isSelected ? '600' : '400' },
          ]}
        >
          {item.name}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={22} color={GREEN_PRIMARY} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text variant="headingMedium" style={[styles.title, { color: theme.colors.text }]}>
              Change workspace
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text variant="body" style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Loading workspaces...
              </Text>
            </View>
          ) : workspaces.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="business-outline" size={48} color={theme.colors.textSecondary} />
              <Text variant="body" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No workspaces yet. Workspace details must be configured on the web.
              </Text>
            </View>
          ) : (
            <FlatList
              data={workspaces}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  loading: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    marginTop: 4,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
  },
  list: {
    maxHeight: 320,
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  itemName: {
    flex: 1,
  },
});
