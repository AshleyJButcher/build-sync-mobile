import React, { useState } from 'react';
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
import { type Theme, GREEN_PRIMARY } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useRouter } from 'expo-router';
import { validateEmail } from '../../src/utils/validation';

export default function ForgotPasswordScreen() {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleResetPassword = async () => {
    setValidationError('');
    clearError();

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setValidationError(emailValidation.error ?? 'Invalid email address');
      return;
    }

    const result = await resetPassword(email.trim());
    if (result.success) {
      setEmailSent(true);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: GREEN_PRIMARY }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      testID="forgot-password-screen"
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
            testID="forgot-password-header"
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
          {emailSent ? (
            <>
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
                  Check Your Email
                </Text>
                <Text
                  variant="body"
                  style={[
                    styles.successMessage,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  We&apos;ve sent a password reset link to {email.trim()}
                </Text>
                <Text
                  variant="body"
                  style={[
                    styles.successMessage,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Click the link in the email to reset your password.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: GREEN_PRIMARY }]}
                onPress={handleBackToLogin}
                testID="back-to-login-button"
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text
                variant="subheader"
                style={[styles.title, { color: theme.colors.text }]}
                testID="forgot-password-title"
              >
                Forgot Password?
              </Text>

              <Text
                variant="body"
                style={[styles.subtitle, { color: theme.colors.textSecondary }]}
                testID="forgot-password-instruction"
              >
                Enter your email address and we&apos;ll send you a link to reset
                your password.
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
                  style={[
                    styles.inputLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Email Address
                </Text>
                <TextInput
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      borderColor:
                        validationError !== ''
                          ? theme.colors.error
                          : theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="send"
                  onSubmitEditing={() => {
                    void handleResetPassword();
                  }}
                  testID="email-input"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: GREEN_PRIMARY },
                  isLoading && styles.disabledButton,
                ]}
                onPress={() => {
                  void handleResetPassword();
                }}
                disabled={isLoading}
                testID="reset-password-button"
              >
                {isLoading ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
                    testID="loading"
                  />
                ) : (
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                    Send Reset Link
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBackToLogin}
                style={styles.backButton}
                testID="back-button"
              >
                <Ionicons name="arrow-back" size={20} color={GREEN_PRIMARY} />
                <Text
                  variant="body"
                  style={[styles.backButtonText, { color: GREEN_PRIMARY }]}
                >
                  Back to Login
                </Text>
              </TouchableOpacity>
            </>
          )}
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
    justifyContent: 'center',
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
    marginTop: 300,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    justifyContent: 'center',
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
  input: {
    height: 48,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  backButtonText: {
    marginLeft: 8,
    fontWeight: '500',
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
