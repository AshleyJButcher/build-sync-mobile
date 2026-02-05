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
import { useUpdateScheduleItem, type ScheduleItem } from '../hooks/useProjectData';

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

interface EditScheduleModalProps {
  visible: boolean;
  item: ScheduleItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditScheduleModal({
  visible,
  item,
  onClose,
  onSuccess,
}: EditScheduleModalProps) {
  const theme = useTheme<Theme>();
  const updateScheduleItem = useUpdateScheduleItem();
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: ScheduleItem['status'];
    location: string;
  }>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'scheduled',
    location: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description ?? '',
        start_date: item.start_date ?? '',
        end_date: item.end_date ?? '',
        status: item.status,
        location: item.location ?? '',
      });
      setErrors({});
    }
  }, [item]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.start_date && isNaN(Date.parse(formData.start_date))) {
      newErrors.start_date = 'Invalid date format (use YYYY-MM-DD)';
    }

    if (formData.end_date && isNaN(Date.parse(formData.end_date))) {
      newErrors.end_date = 'Invalid date format (use YYYY-MM-DD)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !item) {
      return;
    }

    try {
      await updateScheduleItem.mutateAsync({
        id: item.id,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        status: formData.status,
        location: formData.location?.trim() || null,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('[EditScheduleModal] Error updating schedule item:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update schedule item',
      });
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!item) return null;

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
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text variant="headingMedium" style={[styles.modalTitle, { color: theme.colors.text }]}>
                Edit Schedule Item
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
                  <Text variant="body" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.submit}
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text variant="caption" style={[styles.label, { color: theme.colors.textSecondary }]}>
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
                  placeholder="e.g., Site inspection"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.title}
                  onChangeText={(text) => {
                    setFormData({ ...formData, title: text });
                    if (errors.title) setErrors({ ...errors, title: '' });
                  }}
                />
                {errors.title && (
                  <Text variant="caption" style={[styles.fieldError, { color: theme.colors.error }]}>
                    {errors.title}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text variant="caption" style={[styles.label, { color: theme.colors.textSecondary }]}>
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
                  placeholder="Description..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text variant="caption" style={[styles.label, { color: theme.colors.textSecondary }]}>
                  Start Date
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      borderColor: errors.start_date ? theme.colors.error : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.start_date}
                  onChangeText={(text) => {
                    setFormData({ ...formData, start_date: text });
                    if (errors.start_date) setErrors({ ...errors, start_date: '' });
                  }}
                />
                {errors.start_date && (
                  <Text variant="caption" style={[styles.fieldError, { color: theme.colors.error }]}>
                    {errors.start_date}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text variant="caption" style={[styles.label, { color: theme.colors.textSecondary }]}>
                  End Date
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      borderColor: errors.end_date ? theme.colors.error : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="YYYY-MM-DD (optional)"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.end_date}
                  onChangeText={(text) => {
                    setFormData({ ...formData, end_date: text });
                    if (errors.end_date) setErrors({ ...errors, end_date: '' });
                  }}
                />
                {errors.end_date && (
                  <Text variant="caption" style={[styles.fieldError, { color: theme.colors.error }]}>
                    {errors.end_date}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text variant="caption" style={[styles.label, { color: theme.colors.textSecondary }]}>
                  Location
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="e.g., Site A"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text variant="caption" style={[styles.label, { color: theme.colors.textSecondary }]}>
                  Status
                </Text>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  onPress={() => setShowStatusPicker(!showStatusPicker)}
                >
                  <Text variant="body" style={[styles.statusButtonText, { color: theme.colors.text }]}>
                    {STATUS_OPTIONS.find((s) => s.value === formData.status)?.label}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                {showStatusPicker && (
                  <View
                    style={[
                      styles.statusPicker,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={styles.statusOption}
                        onPress={() => {
                          setFormData({ ...formData, status: option.value });
                          setShowStatusPicker(false);
                        }}
                      >
                        <Text variant="body" style={[styles.statusOptionText, { color: theme.colors.text }]}>
                          {option.label}
                        </Text>
                        {formData.status === option.value && (
                          <Ionicons name="checkmark" size={20} color={GREEN_PRIMARY} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: GREEN_PRIMARY },
                  updateScheduleItem.isPending && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={updateScheduleItem.isPending}
              >
                {updateScheduleItem.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                    Save Changes
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
  modalContainer: {
    flex: 1,
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
    minHeight: 80,
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
  statusButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 16,
  },
  statusPicker: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    overflow: 'hidden',
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statusOptionText: {
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
