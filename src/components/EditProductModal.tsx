import React, { useState, useEffect } from 'react';
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
import { useUpdateProduct, type Product } from '../hooks/useProjectData';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  'Kitchen',
  'Bathroom',
  'Flooring',
  'Lighting',
  'HVAC',
  'Electrical',
  'Plumbing',
  'Windows',
  'Doors',
  'Exterior',
  'Landscaping',
  'Other',
];

interface EditProductModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditProductModal({
  visible,
  product,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const theme = useTheme<Theme>();
  const updateProduct = useUpdateProduct();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    image_url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        description: product.description || '',
        price: product.price?.toString() || '',
        image_url: product.image_url || '',
      });
    }
  }, [product]);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0] && product) {
      await handleImageUpload(result.assets[0].uri, product.project_id);
    }
  };

  const handleImageUpload = async (uri: string, projectId: string) => {
    setIsUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('product-images').getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = 'Price must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !product) {
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: product.id,
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description?.trim() || null,
        price: formData.price ? Number(formData.price) : null,
        image_url: formData.image_url || null,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('[EditProductModal] Error updating product:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update product',
      });
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
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
                Edit Product
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

              {/* Image Preview/Upload */}
              <View style={styles.imageSection}>
                {formData.image_url ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: formData.image_url }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setFormData({ ...formData, image_url: '' })}
                    >
                      <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.imageUploadButton,
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
                          name="image-outline"
                          size={32}
                          color={theme.colors.textSecondary}
                        />
                        <Text
                          variant="body"
                          style={[styles.uploadText, { color: theme.colors.textSecondary }]}
                        >
                          Add Image
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text
                  variant="caption"
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Product Name *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      borderColor: errors.name
                        ? theme.colors.error
                        : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="Enter product name"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (errors.name) {
                      setErrors({ ...errors, name: '' });
                    }
                  }}
                />
                {errors.name && (
                  <Text
                    variant="caption"
                    style={[styles.fieldError, { color: theme.colors.error }]}
                  >
                    {errors.name}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text
                  variant="caption"
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Category *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    {
                      borderColor: errors.category
                        ? theme.colors.error
                        : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text
                    variant="body"
                    style={[
                      styles.categoryButtonText,
                      {
                        color: formData.category
                          ? theme.colors.text
                          : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {formData.category || 'Select category'}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
                {showCategoryPicker && (
                  <View
                    style={[
                      styles.categoryPicker,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    {CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={styles.categoryOption}
                        onPress={() => {
                          setFormData({ ...formData, category });
                          setShowCategoryPicker(false);
                          if (errors.category) {
                            setErrors({ ...errors, category: '' });
                          }
                        }}
                      >
                        <Text
                          variant="body"
                          style={[styles.categoryOptionText, { color: theme.colors.text }]}
                        >
                          {category}
                        </Text>
                        {formData.category === category && (
                          <Ionicons name="checkmark" size={20} color={GREEN_PRIMARY} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {errors.category && (
                  <Text
                    variant="caption"
                    style={[styles.fieldError, { color: theme.colors.error }]}
                  >
                    {errors.category}
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
                  placeholder="Product description..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.description}
                  onChangeText={(text) => {
                    setFormData({ ...formData, description: text });
                  }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text
                  variant="caption"
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Price
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      borderColor: errors.price
                        ? theme.colors.error
                        : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.price}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9.]/g, '');
                    setFormData({
                      ...formData,
                      price: numericValue,
                    });
                    if (errors.price) {
                      setErrors({ ...errors, price: '' });
                    }
                  }}
                  keyboardType="decimal-pad"
                />
                {errors.price && (
                  <Text
                    variant="caption"
                    style={[styles.fieldError, { color: theme.colors.error }]}
                  >
                    {errors.price}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: GREEN_PRIMARY },
                  updateProduct.isPending && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={updateProduct.isPending}
              >
                {updateProduct.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                    Update Product
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
  imageSection: {
    marginBottom: 20,
  },
  imageUploadButton: {
    height: 150,
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
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  fieldError: {
    marginTop: 4,
    fontSize: 12,
  },
  categoryButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 16,
  },
  categoryPicker: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    overflow: 'hidden',
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryOptionText: {
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
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
