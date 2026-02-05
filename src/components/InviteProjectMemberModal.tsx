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
  Alert,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../theme';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import {
  useInviteProjectMember,
  type AppRole,
  ROLE_LABELS,
  type InviteProjectMemberParams,
} from '../hooks/useProjectMembers';
import { validateEmail } from '../utils/validation';

const PROJECT_MEMBER_ROLES: AppRole[] = [
  'client',
  'builder',
  'sub-contractor',
  'architect-designer',
  'administrator',
  'other',
];

interface InviteProjectMemberModalProps {
  visible: boolean;
  projectId: string | null;
  onClose: () => void;
  onInviteSent?: () => void;
}

export function InviteProjectMemberModal({
  visible,
  projectId,
  onClose,
  onInviteSent,
}: InviteProjectMemberModalProps) {
  const theme = useTheme<Theme>();
  const inviteMember = useInviteProjectMember(projectId);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('client');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInvite = async () => {
    const emailResult = validateEmail(email.trim());
    if (!emailResult.valid) {
      setErrors({ email: emailResult.error ?? 'Invalid email' });
      return;
    }
    setErrors({});

    try {
      await inviteMember.mutateAsync({
        email: email.trim().toLowerCase(),
        role: selectedRole,
      });
      setEmail('');
      setSelectedRole('client');
      setErrors({});
      onInviteSent?.();
      onClose();
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to send invitation',
      });
    }
  };

  const handleClose = () => {
    setEmail('');
    setSelectedRole('client');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
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
              Invite team member
            </Text>
            <TouchableOpacity onPress={handleClose} hitSlop={12} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text variant="bodySmall" style={[styles.label, { color: theme.colors.textSecondary }]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: errors.email ? theme.colors.error : theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              placeholder="colleague@example.com"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errors.email) setErrors((e) => ({ ...e, email: '' }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!inviteMember.isPending}
            />

            {errors.email ? (
              <Text variant="caption" style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.email}
              </Text>
            ) : null}

            <Text variant="bodySmall" style={[styles.label, { color: theme.colors.textSecondary, marginTop: 16 }]}>
              Role
            </Text>
            <View style={styles.roleRow}>
              {PROJECT_MEMBER_ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleChip,
                    {
                      backgroundColor:
                        selectedRole === role ? GREEN_PRIMARY : theme.colors.backgroundSecondary,
                      borderColor: selectedRole === role ? GREEN_PRIMARY : theme.colors.border,
                    },
                  ]}
                  onPress={() => setSelectedRole(role)}
                  disabled={inviteMember.isPending}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: selectedRole === role ? '#FFFFFF' : theme.colors.text,
                      fontWeight: selectedRole === role ? '600' : '400',
                    }}
                  >
                    {ROLE_LABELS[role]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {errors.submit ? (
              <View style={[styles.submitError, { backgroundColor: `${theme.colors.error}15` }]}>
                <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                  {errors.submit}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={handleClose}
              disabled={inviteMember.isPending}
            >
              <Text variant="button" style={{ color: theme.colors.text }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.inviteButton, { backgroundColor: GREEN_PRIMARY }]}
              onPress={handleInvite}
              disabled={inviteMember.isPending}
            >
              {inviteMember.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text variant="button" style={styles.inviteButtonText}>
                  Send invite
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '80%',
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
  scroll: {
    maxHeight: 360,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 8,
  },
  label: {
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    marginTop: 4,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  submitError: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  inviteButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#FFFFFF',
  },
});
