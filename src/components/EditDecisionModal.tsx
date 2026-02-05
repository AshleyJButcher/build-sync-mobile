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
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../theme';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { useUpdateDecision, type Decision } from '../hooks/useProjectData';

const CATEGORIES = [
  'Design',
  'Materials',
  'Schedule',
  'Budget',
  'Contractor',
  'Other',
];

interface EditDecisionModalProps {
  visible: boolean;
  decision: Decision | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditDecisionModal({
  visible,
  decision,
  onClose,
  onSuccess,
}: EditDecisionModalProps) {
  const theme = useTheme<Theme>();
  const updateDecision = useUpdateDecision();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    due_date: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (decision && visible) {
      setFormData({
        title: decision.title,
        description: decision.description || '',
        category: decision.category,
        due_date: decision.due_date || '',
      });
      setErrors({});
    }
  }, [decision, visible]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Decision title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.due_date && isNaN(Date.parse(formData.due_date))) {
      newErrors.due_date = 'Invalid date format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !decision) {
      return;
    }

    try {
      await updateDecision.mutateAsync({
        id: decision.id,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        category: formData.category,
        due_date: formData.due_date || null,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('[EditDecisionModal] Error updating decision:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update decision',
      });
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!decision) return null;

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
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.background },
          ]}
        >
            <View style={styles.modalHeader}>
              <Text variant="headingMedium" style={[styles.modalTitle, { color: theme.colors.text }]}>
                Edit Decision
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
                      borderColor: errors.title
                        ? theme.colors.error
                        : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="e.g., Kitchen Layout Approval"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.title}
                  onChangeText={(text) => {
                    setFormData({ ...formData, title: text });
                    if (errors.title) {
                      setErrors({ ...errors, title: '' });
                    }
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
                  placeholder="Decision description..."
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
                  Due Date
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      borderColor: errors.due_date
                        ? theme.colors.error
                        : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.due_date}
                  onChangeText={(text) => {
                    setFormData({ ...formData, due_date: text });
                    if (errors.due_date) {
                      setErrors({ ...errors, due_date: '' });
                    }
                  }}
                />
                {errors.due_date && (
                  <Text
                    variant="caption"
                    style={[styles.fieldError, { color: theme.colors.error }]}
                  >
                    {errors.due_date}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: GREEN_PRIMARY },
                  updateDecision.isPending && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={updateDecision.isPending}
              >
                {updateDecision.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
