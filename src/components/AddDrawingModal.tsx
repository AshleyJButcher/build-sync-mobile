import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../theme';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCreateDrawing } from '../hooks/useProjectData';
import { useProjectStore } from '../store/useProjectStore';
import { supabase } from '../lib/supabase';

interface AddDrawingModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddDrawingModal({
  visible,
  onClose,
  onSuccess,
}: AddDrawingModalProps) {
  const theme = useTheme<Theme>();
  const { selectedProjectId } = useProjectStore();
  const createDrawing = useCreateDrawing();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    file_name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      await handleFileUpload(result.assets[0].uri, result.assets[0].fileName ?? 'drawing.jpg');
    }
  };

  const handleFileUpload = async (uri: string, suggestedFileName?: string) => {
    if (!selectedProjectId) return;

    setIsUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = suggestedFileName ?? `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${selectedProjectId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('drawings')
        .upload(filePath, blob, {
          contentType: blob.type || `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('drawings').getPublicUrl(filePath);

      setFormData({
        ...formData,
        file_url: publicUrl,
        file_name: fileName,
      });
    } catch (error) {
      console.error('[AddDrawingModal] Upload error:', error);
      Alert.alert('Error', 'Failed to upload file. Ensure the "drawings" storage bucket exists.');
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.file_url) {
      newErrors.file = 'Please select a file to upload';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedProjectId) {
      setErrors((prev) => ({ ...prev, project: 'Please select a project' }));
      return;
    }
    if (!validateForm()) return;

    try {
      await createDrawing.mutateAsync({
        project_id: selectedProjectId,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        file_url: formData.file_url,
        file_name: formData.file_name,
      });

      setFormData({
        title: '',
        description: '',
        file_url: '',
        file_name: '',
      });
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('[AddDrawingModal] Error creating drawing:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create drawing',
      });
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      file_url: '',
      file_name: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text variant="headingMedium" style={[styles.modalTitle, { color: theme.colors.text }]}>
                Add Drawing
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.form}
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
            >
              {errors.submit && (
                <View
                  style={[
                    styles.errorContainer,
                    {
                      backgroundColor: `${theme.colors.error}20`,
                      borderColor: theme.colors.error,
                    },
                  ]}
                >
                  <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
                  <Text
                    variant="body"
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {errors.submit}
                  </Text>
                </View>
              )}

              {/* File preview / upload */}
              <View style={styles.fileSection}>
                {formData.file_url ? (
                  <View style={styles.filePreviewContainer}>
                    {formData.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <Image
                        source={{ uri: formData.file_url }}
                        style={styles.filePreview}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.filePreviewPlaceholder,
                          { backgroundColor: theme.colors.backgroundSecondary },
                        ]}
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={48}
                          color={theme.colors.textSecondary}
                        />
                      </View>
                    )}
                    <Text
                      variant="caption"
                      style={[styles.fileName, { color: theme.colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {formData.file_name}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeFileButton}
                      onPress={() => setFormData({ ...formData, file_url: '', file_name: '' })}
                    >
                      <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.fileUploadButton,
                      { borderColor: theme.colors.border },
                    ]}
                    onPress={handleImagePicker}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <>
                        <Ionicons
                          name="document-attach-outline"
                          size={32}
                          color={theme.colors.textSecondary}
                        />
                        <Text
                          variant="body"
                          style={[styles.uploadText, { color: theme.colors.textSecondary }]}
                        >
                          Choose image (plan, sketch, photo)
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {errors.file && (
                  <Text
                    variant="caption"
                    style={[styles.fieldError, { color: theme.colors.error }]}
                  >
                    {errors.file}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text
                  variant="caption"
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Title *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      borderColor: errors.title ? theme.colors.error : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="e.g. Floor plan, Elevation A"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.title}
                  onChangeText={(text) => {
                    setFormData({ ...formData, title: text });
                    if (errors.title) setErrors({ ...errors, title: '' });
                  }}
                />
                {errors.title && (
                  <Text
                    variant="caption"
                    style={[styles.fieldError, { color: theme.colors.error }]}
                  >
                    {errors.title}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text
                  variant="caption"
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Description
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="Optional notes..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: GREEN_PRIMARY },
                  createDrawing.isPending && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={createDrawing.isPending}
              >
                {createDrawing.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                    Add Drawing
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    maxHeight: '90%',
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
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
  },
  fileSection: {
    marginBottom: 20,
  },
  fileUploadButton: {
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
  },
  filePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  filePreview: {
    width: '100%',
    height: 180,
    backgroundColor: '#F0F0F0',
  },
  filePreviewPlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    padding: 8,
  },
  removeFileButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
  },
  fieldError: {
    marginTop: 4,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
