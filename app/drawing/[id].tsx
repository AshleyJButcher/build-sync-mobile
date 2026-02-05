import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useDrawings,
  useDeleteDrawing,
} from '../../src/hooks/useProjectData';
import { useAuth } from '../../src/hooks/useAuth';
import { useProjectStore } from '../../src/store/useProjectStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

function isImageFileName(fileName: string | undefined): boolean {
  if (!fileName || typeof fileName !== 'string') return false;
  const ext = fileName.split('.').pop()?.toLowerCase();
  return !!ext && IMAGE_EXTENSIONS.includes(ext);
}

export default function DrawingDetailScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedProjectId } = useProjectStore();
  const { data: drawings, isLoading } = useDrawings(selectedProjectId);
  const deleteDrawing = useDeleteDrawing();
  const { role } = useAuth();

  const item = drawings?.find((d) => d.id === id);
  const canEdit = role === 'builder' || role === 'administrator';
  const showAsImage = item ? isImageFileName(item.file_name) : false;

  const handleDelete = () => {
    if (!item) return;
    Alert.alert(
      'Delete Drawing',
      'Are you sure you want to delete this drawing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDrawing.mutateAsync({
                id: item.id,
                projectId: item.project_id,
                name: item.title,
              });
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete drawing');
            }
          },
        },
      ]
    );
  };

  const handleOpenFile = () => {
    if (!item?.file_url) return;
    Linking.openURL(item.file_url).catch(() => {
      Alert.alert('Error', 'Could not open file');
    });
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
            Drawing
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text variant="body" style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Drawing not found
          </Text>
        </View>
      </View>
    );
  }

  const { width } = Dimensions.get('window');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="headingMedium" style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          Drawing
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text variant="headingLarge" style={[styles.title, { color: theme.colors.text }]}>
          {item.title}
        </Text>

        {item.description ? (
          <Text
            variant="body"
            style={[styles.description, { color: theme.colors.textSecondary }]}
          >
            {item.description}
          </Text>
        ) : null}

        <Text variant="caption" style={[styles.metaText, { color: theme.colors.textSecondary }]}>
          {item.file_name ?? 'File'} · {format(new Date(item.created_at), 'MMM d, yyyy')}
        </Text>

        {/* File preview or open link */}
        {showAsImage && item.file_url ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: item.file_url }}
              style={[styles.previewImage, { width: width - 32 }]}
              resizeMode="contain"
            />
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.openFileButton, { borderColor: theme.colors.border }]}
            onPress={handleOpenFile}
          >
            <Ionicons name="open-outline" size={24} color={theme.colors.primary} />
            <Text variant="body" style={[styles.openFileText, { color: theme.colors.primary }]}>
              Open file
            </Text>
          </TouchableOpacity>
        )}

        {canEdit && (
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: theme.colors.error }]}
            onPress={handleDelete}
            disabled={deleteDrawing.isPending}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            <Text variant="body" style={[styles.deleteButtonText, { color: theme.colors.error }]}>
              Delete Drawing
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, lineHeight: 24, marginBottom: 8 },
  metaText: { fontSize: 12, marginBottom: 16 },
  imageWrapper: { marginBottom: 24, alignItems: 'center' },
  previewImage: { height: 300, borderRadius: 8 },
  openFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginBottom: 24,
  },
  openFileText: { fontSize: 16, fontWeight: '600' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
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
