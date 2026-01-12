import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useRouter } from 'expo-router';
import { validatePassword } from '../../src/utils/validation';

// Green color matching the design
const GREEN_PRIMARY = '#4CAF50';

export default function ResetPasswordScreen() {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const { updatePassword, isLoading, error, clearError } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isTouched, setIsTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const [passwordReset, setPasswordReset] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleUpdatePassword = async () => {
    setValidationError('');
    clearError();

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setValidationError(passwordValidation.error ?? 'Invalid password');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    const result = await updatePassword(password);
    if (result.success) {
      setPasswordReset(true);
      // Navigate to login after 3 seconds
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 3000);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (!isTouched.password) {
      setIsTouched((prev) => ({ ...prev, password: true }));
    }
    // Clear validation error when user starts typing
    if (validationError !== '') {
      setValidationError('');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (!isTouched.confirmPassword) {
      setIsTouched((prev) => ({ ...prev, confirmPassword: true }));
    }
    // Clear validation error when user starts typing
    if (validationError !== '') {
      setValidationError('');
    }
  };

  const isFormInvalid =
    password.trim() === '' || confirmPassword.trim() === '' || isLoading;

  if (passwordReset) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: GREEN_PRIMARY }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
        testID="reset-password-screen"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerBanner}>
            <Text
              variant="subheader"
              style={styles.headerBannerText}
              testID="reset-password-header"
            >
              Password Reset
            </Text>
          </View>

          <View
            style={[
              styles.formContainer,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View style={styles.successContainer}>
              <Ionicons
                name="checkmark-circle"
                size={64}
                color={GREEN_PRIMARY}
                style={styles.successIcon}
              />
              <Text
                variant="subheader"
                style={[styles.successTitle, { color: theme.colors.text }]}
              >
                Password Reset Successful
              </Text>
              <Text
                variant="body"
                style={[
                  styles.successMessage,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Your password has been successfully reset. Redirecting to
                login...
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: GREEN_PRIMARY }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      testID="reset-password-screen"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Green header banner */}
        <View style={styles.headerBanner}>
          <Text
            variant="subheader"
            style={styles.headerBannerText}
            testID="reset-password-header"
          >
            Reset Password
          </Text>
        </View>

        <View
          style={[
            styles.formContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text
            variant="subheader"
            style={[styles.title, { color: theme.colors.text }]}
            testID="reset-password-title"
          >
            Create New Password
          </Text>

          <Text
            variant="body"
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            testID="reset-password-instruction"
          >
            Please enter your new password below.
          </Text>

          {(error !== null || validationError !== '') && (
            <View
              style={[
                styles.errorContainer,
                {
                  backgroundColor: 'rgba(255, 118, 117, 0.2)',
                  borderColor: theme.colors.error,
                  borderWidth: 2,
                },
              ]}
              testID="error-container"
            >
              <Ionicons
                name="alert-circle"
                size={22}
                color={theme.colors.error}
                style={styles.errorIcon}
              />
              <Text
                variant="body"
                style={[styles.errorText, { color: theme.colors.error }]}
                testID="error-text"
              >
                {error ?? validationError}
              </Text>
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Text
              variant="caption"
              style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
            >
              New Password
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                placeholder="New Password"
                value={password}
                onChangeText={handlePasswordChange}
                style={[
                  styles.passwordInput,
                  {
                    color: theme.colors.text,
                    borderColor:
                      isTouched.password && validationError !== ''
                        ? theme.colors.error
                        : theme.colors.border,
                    backgroundColor: theme.colors.background,
                  },
                ]}
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                testID="password-input"
              />
              <TouchableOpacity
                onPress={() => {
                  setShowPassword(!showPassword);
                }}
                style={styles.eyeIcon}
                testID="toggle-password-visibility"
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text
              variant="caption"
              style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
            >
              Confirm Password
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                style={[
                  styles.passwordInput,
                  {
                    color: theme.colors.text,
                    borderColor:
                      isTouched.confirmPassword &&
                      (confirmPassword !== password || validationError !== '')
                        ? theme.colors.error
                        : theme.colors.border,
                    backgroundColor: theme.colors.background,
                  },
                ]}
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={() => {
                  void handleUpdatePassword();
                }}
                testID="confirm-password-input"
              />
              <TouchableOpacity
                onPress={() => {
                  setShowConfirmPassword(!showConfirmPassword);
                }}
                style={styles.eyeIcon}
                testID="toggle-confirm-password-visibility"
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: GREEN_PRIMARY },
              isFormInvalid && styles.disabledButton,
            ]}
            onPress={() => {
              void handleUpdatePassword();
            }}
            disabled={isFormInvalid}
            testID="update-password-button"
          >
            {isLoading ? (
              <ActivityIndicator
                color="#FFFFFF"
                size="small"
                testID="loading"
              />
            ) : (
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Reset Password
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 0,
  },
  headerBanner: {
    backgroundColor: GREEN_PRIMARY,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerBannerText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
  formContainer: {
    width: '100%',
    padding: 24,
    marginTop: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    marginBottom: 32,
    fontSize: 14,
    lineHeight: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingRight: 48,
    borderRadius: 8,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 56,
    width: '100%',
  },
  errorIcon: {
    marginTop: 2,
  },
  errorText: {
    flex: 1,
    marginLeft: 10,
    lineHeight: 22,
    fontSize: 15,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    marginBottom: 12,
    fontSize: 24,
    fontWeight: '600',
  },
  successMessage: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
  },
});
