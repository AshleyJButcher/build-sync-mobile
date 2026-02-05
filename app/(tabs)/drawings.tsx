import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useDrawings, type Drawing } from '../../src/hooks/useProjectData';
import { useProjectStore } from '../../src/store/useProjectStore';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { AddDrawingModal } from '../../src/components/AddDrawingModal';
import { ProjectMenuButton } from '../../src/components/ProjectMenuButton';
import { HeaderRightActions } from '../../src/components/HeaderRightActions';
import { useRouter } from 'expo-router';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

function isImageFileName(fileName: string | undefined): boolean {
  if (!fileName || typeof fileName !== 'string') return false;
  const ext = fileName.split('.').pop()?.toLowerCase();
  return !!ext && IMAGE_EXTENSIONS.includes(ext);
}

export default function DrawingsScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedProjectId } = useProjectStore();
  const { role } = useAuth();
  const { data: drawings, isLoading, isError, refetch } = useDrawings(selectedProjectId);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const canEditDrawings = role === 'builder' || role === 'administrator';

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('[DrawingsScreen] Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: Drawing }) => {
    const showThumbnail = isImageFileName(item.file_name);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => router.push(`/drawing/${item.id}`)}
      >
        {showThumbnail && item.file_url ? (
          <Image
            source={{ uri: item.file_url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.thumbnailPlaceholder,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={40}
              color={theme.colors.textSecondary}
            />
          </View>
        )}
        <View style={styles.cardContent}>
          <Text variant="headingMedium" style={[styles.cardTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          {item.description ? (
            <Text
              variant="bodySmall"
              style={[styles.cardDescription, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}
          <Text variant="caption" style={[styles.fileName, { color: theme.colors.textSecondary }]}>
            {item.file_name ?? 'File'}
          </Text>
          <Text variant="caption" style={[styles.dateText, { color: theme.colors.textSecondary }]}>
            {format(new Date(item.created_at), 'MMM d, yyyy')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
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
          <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
          <Text variant="body" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Select a project to view drawings
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading && !drawings) {
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
            Loading drawings...
          </Text>
        </View>
      </View>
    );
  }

  const hasNoItems = !drawings || drawings.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <ProjectMenuButton />
          <Text variant="headingLarge" style={[styles.headerTitle, { color: theme.colors.text }]}>
            Drawings
          </Text>
        </View>
        <HeaderRightActions>
          {canEditDrawings && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: GREEN_PRIMARY }]}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </HeaderRightActions>
      </View>

      {hasNoItems ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
          <Text variant="headingMedium" style={[styles.emptyTitle, { color: theme.colors.text }]}>
            {isError ? 'Unable to load drawings' : 'No Drawings'}
          </Text>
          <Text variant="body" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {isError
              ? 'Pull down to retry or check your connection.'
              : canEditDrawings
                ? 'Upload your first drawing to get started'
                : 'No drawings yet'}
          </Text>
          {isError && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: GREEN_PRIMARY }]}
              onPress={() => refetch()}
            >
              <Text variant="body" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                Retry
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={drawings || []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <AddDrawingModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => refetch()}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thumbnail: {
    width: 80,
    height: 80,
    backgroundColor: '#F0F0F0',
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  fileName: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateText: {
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
