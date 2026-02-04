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
import { useCreateRemedialItem, type RemedialItem } from '../hooks/useProjectData';
import { useProjectStore } from '../store/useProjectStore';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

interface AddRemedialModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddRemedialModal({
  visible,
  onClose,
  onSuccess,
}: AddRemedialModalProps) {
  const theme = useTheme<Theme>();
  const { selectedProjectId } = useProjectStore();
  const createRemedialItem = useCreateRemedialItem();
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: RemedialItem['status'];
    priority: RemedialItem['priority'];
  }>({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
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
      await createRemedialItem.mutateAsync({
        project_id: selectedProjectId,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        status: formData.status,
        priority: formData.priority,
      });

      setFormData({ title: '', description: '', status: 'open', priority: 'medium' });
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('[AddRemedialModal] Error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create remedial item',
      });
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', status: 'open', priority: 'medium' });
    setErrors({});
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.colors.background }]}
          >
            <View style={styles.modalHeader}>
              <Text variant="headingMedium" style={[styles.modalTitle, { color: theme.colors.text }]}>
                Add Remedial Item
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
              {errors.project && (
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
                    {errors.project}
                  </Text>
                </View>
              )}
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
                  placeholder="e.g., Crack in wall"
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
                  placeholder="Describe the issue..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text variant="caption" style={[styles.label, { color: theme.colors.textSecondary }]}>
                  Priority
                </Text>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  onPress={() => setShowPriorityPicker(!showPriorityPicker)}
                >
                  <Text variant="body" style={{ color: theme.colors.text }}>
                    {PRIORITY_OPTIONS.find((p) => p.value === formData.priority)?.label}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                {showPriorityPicker && (
                  <View
                    style={[
                      styles.pickerOptions,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={styles.pickerOption}
                        onPress={() => {
                          setFormData({ ...formData, priority: option.value });
                          setShowPriorityPicker(false);
                        }}
                      >
                        <Text variant="body" style={{ color: theme.colors.text }}>
                          {option.label}
                        </Text>
                        {formData.priority === option.value && (
                          <Ionicons name="checkmark" size={20} color={GREEN_PRIMARY} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text variant="caption" style={[styles.label, { color: theme.colors.textSecondary }]}>
                  Status
                </Text>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  onPress={() => setShowStatusPicker(!showStatusPicker)}
                >
                  <Text variant="body" style={{ color: theme.colors.text }}>
                    {STATUS_OPTIONS.find((s) => s.value === formData.status)?.label}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                {showStatusPicker && (
                  <View
                    style={[
                      styles.pickerOptions,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={styles.pickerOption}
                        onPress={() => {
                          setFormData({ ...formData, status: option.value });
                          setShowStatusPicker(false);
                        }}
                      >
                        <Text variant="body" style={{ color: theme.colors.text }}>
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
                  (createRemedialItem.isPending || !selectedProjectId) && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={createRemedialItem.isPending || !selectedProjectId}
              >
                {createRemedialItem.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                    Add Remedial Item
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
  modalTitle: { fontSize: 20, fontWeight: '600' },
  closeButton: { padding: 4 },
  form: { flex: 1 },
  formContent: { padding: 16 },
  inputGroup: { marginBottom: 20 },
  label: { marginBottom: 8, fontSize: 14, fontWeight: '500' },
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
  fieldError: { marginTop: 4, fontSize: 12 },
  pickerButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerOptions: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  errorText: { flex: 1, fontSize: 14, fontWeight: '500' },
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: { opacity: 0.6 },
  submitButtonText: { fontSize: 16, fontWeight: '600' },
});
