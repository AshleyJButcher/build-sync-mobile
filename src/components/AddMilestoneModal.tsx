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
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../theme';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { useCreateMilestone, useMilestones, type Milestone } from '../hooks/useProjectData';
import { useProjectStore } from '../store/useProjectStore';

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'delayed', label: 'Delayed' },
] as const;

interface AddMilestoneModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddMilestoneModal({
  visible,
  onClose,
  onSuccess,
}: AddMilestoneModalProps) {
  const theme = useTheme<Theme>();
  const { selectedProjectId } = useProjectStore();
  const { data: milestones } = useMilestones(selectedProjectId);
  const createMilestone = useCreateMilestone();
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    due_date: string;
    status: Milestone['status'];
    completion_percentage: string;
  }>({
    title: '',
    description: '',
    due_date: '',
    status: 'upcoming',
    completion_percentage: '0',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Milestone title is required';
    }

    if (formData.due_date && isNaN(Date.parse(formData.due_date))) {
      newErrors.due_date = 'Invalid date format';
    }

    const percentage = parseInt(formData.completion_percentage, 10);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      newErrors.completion_percentage = 'Completion must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedProjectId) {
      return;
    }

    try {
      const currentCount = milestones?.length || 0;
      await createMilestone.mutateAsync({
        project_id: selectedProjectId,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        due_date: formData.due_date || new Date().toISOString().split('T')[0],
        status: formData.status,
        sort_order: currentCount,
        completion_percentage: parseInt(formData.completion_percentage, 10),
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        due_date: '',
        status: 'upcoming',
        completion_percentage: '0',
      });
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('[AddMilestoneModal] Error creating milestone:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create milestone',
      });
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
      status: 'upcoming',
      completion_percentage: '0',
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
                Add Milestone
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
                  placeholder="e.g., Foundation Complete"
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
                  placeholder="Milestone description..."
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

              <View style={styles.inputGroup}>
                <Text
                  variant="caption"
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
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
                  <Text
                    variant="body"
                    style={[styles.statusButtonText, { color: theme.colors.text }]}
                  >
                    {STATUS_OPTIONS.find((s) => s.value === formData.status)?.label}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
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
                        <Text
                          variant="body"
                          style={[styles.statusOptionText, { color: theme.colors.text }]}
                        >
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

              <View style={styles.inputGroup}>
                <Text
                  variant="caption"
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Completion Percentage
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      borderColor: errors.completion_percentage
                        ? theme.colors.error
                        : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.completion_percentage}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setFormData({
                      ...formData,
                      completion_percentage: numericValue,
                    });
                    if (errors.completion_percentage) {
                      setErrors({ ...errors, completion_percentage: '' });
                    }
                  }}
                  keyboardType="number-pad"
                />
                {errors.completion_percentage && (
                  <Text
                    variant="caption"
                    style={[styles.fieldError, { color: theme.colors.error }]}
                  >
                    {errors.completion_percentage}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: GREEN_PRIMARY },
                  createMilestone.isPending && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={createMilestone.isPending}
              >
                {createMilestone.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                    Add Milestone
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
