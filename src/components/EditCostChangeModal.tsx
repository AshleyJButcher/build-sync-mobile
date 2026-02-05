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
import { useUpdateCostChange, type CostChange } from '../hooks/useProjectData';


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

interface EditCostChangeModalProps {
  visible: boolean;
  costChange: CostChange | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditCostChangeModal({
  visible,
  costChange,
  onClose,
  onSuccess,
}: EditCostChangeModalProps) {
  const theme = useTheme<Theme>();
  const updateCostChange = useUpdateCostChange();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    original_cost: '',
    new_cost: '',
    reason: '',
    estimated_days: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (costChange) {
      setFormData({
        title: costChange.title,
        category: costChange.category,
        original_cost: costChange.original_cost.toString(),
        new_cost: costChange.new_cost.toString(),
        reason: costChange.reason,
        estimated_days: costChange.estimated_days?.toString() || '',
      });
    }
  }, [costChange]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.original_cost || isNaN(Number(formData.original_cost))) {
      newErrors.original_cost = 'Valid original cost is required';
    }

    if (!formData.new_cost || isNaN(Number(formData.new_cost))) {
      newErrors.new_cost = 'Valid new cost is required';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    if (formData.estimated_days && isNaN(Number(formData.estimated_days))) {
      newErrors.estimated_days = 'Estimated days must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !costChange) {
      return;
    }

    try {
      await updateCostChange.mutateAsync({
        id: costChange.id,
        title: formData.title.trim(),
        category: formData.category,
        original_cost: Number(formData.original_cost),
        new_cost: Number(formData.new_cost),
        reason: formData.reason.trim(),
        estimated_days: formData.estimated_days
          ? Number(formData.estimated_days)
          : null,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('[EditCostChangeModal] Error updating cost change:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update cost change',
      });
    }
  };

  const handleClose = () => {
    // Reset to original costChange values on close
    if (costChange) {
      setFormData({
        title: costChange.title,
        category: costChange.category,
        original_cost: costChange.original_cost.toString(),
        new_cost: costChange.new_cost.toString(),
        reason: costChange.reason,
        estimated_days: costChange.estimated_days?.toString() || '',
      });
    }
    setErrors({});
    onClose();
  };

  if (!costChange) return null;

  const difference = formData.original_cost && formData.new_cost
    ? Number(formData.new_cost) - Number(formData.original_cost)
    : 0;

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
                Edit Cost Change
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
                  placeholder="e.g., Additional Kitchen Cabinetry"
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

              <View style={styles.costRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text
                    variant="caption"
                    style={[styles.label, { color: theme.colors.textSecondary }]}
                  >
                    Original Cost *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        borderColor: errors.original_cost
                          ? theme.colors.error
                          : theme.colors.border,
                        backgroundColor: theme.colors.background,
                      },
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.original_cost}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9.]/g, '');
                      setFormData({
                        ...formData,
                        original_cost: numericValue,
                      });
                      if (errors.original_cost) {
                        setErrors({ ...errors, original_cost: '' });
                      }
                    }}
                    keyboardType="decimal-pad"
                  />
                  {errors.original_cost && (
                    <Text
                      variant="caption"
                      style={[styles.fieldError, { color: theme.colors.error }]}
                    >
                      {errors.original_cost}
                    </Text>
                  )}
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text
                    variant="caption"
                    style={[styles.label, { color: theme.colors.textSecondary }]}
                  >
                    New Cost *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        borderColor: errors.new_cost
                          ? theme.colors.error
                          : theme.colors.border,
                        backgroundColor: theme.colors.background,
                      },
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.new_cost}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9.]/g, '');
                      setFormData({
                        ...formData,
                        new_cost: numericValue,
                      });
                      if (errors.new_cost) {
                        setErrors({ ...errors, new_cost: '' });
                      }
                    }}
                    keyboardType="decimal-pad"
                  />
                  {errors.new_cost && (
                    <Text
                      variant="caption"
                      style={[styles.fieldError, { color: theme.colors.error }]}
                    >
                      {errors.new_cost}
                    </Text>
                  )}
                </View>
              </View>

              {/* Difference Display */}
              {formData.original_cost && formData.new_cost && (
                <View
                  style={[
                    styles.differenceContainer,
                    {
                      backgroundColor:
                        difference > 0
                          ? `${theme.colors.error}15`
                          : `${GREEN_PRIMARY}15`,
                    },
                  ]}
                >
                  <Text
                    variant="body"
                    style={[
                      styles.differenceText,
                      { color: difference > 0 ? theme.colors.error : GREEN_PRIMARY },
                    ]}
                  >
                    Change: {difference > 0 ? '+' : ''}
                    £{difference.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text
                  variant="caption"
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Reason *
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      color: theme.colors.text,
                      borderColor: errors.reason
                        ? theme.colors.error
                        : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="Explain the reason for this cost change..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.reason}
                  onChangeText={(text) => {
                    setFormData({ ...formData, reason: text });
                    if (errors.reason) {
                      setErrors({ ...errors, reason: '' });
                    }
                  }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {errors.reason && (
                  <Text
                    variant="caption"
                    style={[styles.fieldError, { color: theme.colors.error }]}
                  >
                    {errors.reason}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text
                  variant="caption"
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Estimated Days (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      borderColor: errors.estimated_days
                        ? theme.colors.error
                        : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData.estimated_days}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setFormData({
                      ...formData,
                      estimated_days: numericValue,
                    });
                    if (errors.estimated_days) {
                      setErrors({ ...errors, estimated_days: '' });
                    }
                  }}
                  keyboardType="number-pad"
                />
                {errors.estimated_days && (
                  <Text
                    variant="caption"
                    style={[styles.fieldError, { color: theme.colors.error }]}
                  >
                    {errors.estimated_days}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: GREEN_PRIMARY },
                  updateCostChange.isPending && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={updateCostChange.isPending}
              >
                {updateCostChange.isPending ? (
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
  costRow: {
    flexDirection: 'row',
    gap: 12,
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
  differenceContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  differenceText: {
    fontSize: 18,
    fontWeight: 'bold',
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
