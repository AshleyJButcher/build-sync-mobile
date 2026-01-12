import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function VerifyEmailScreen() {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { resendVerificationEmail, isLoading, error, clearError } =
    useAuthStore();
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  const email = params.email ?? '';

  const handleResend = async () => {
    if (email === '') {
      return;
    }

    setIsResending(true);
    setResendSuccess(false);
    clearError();

    const result = await resendVerificationEmail(email);
    setIsResending(false);

    if (result.success) {
      setResendSuccess(true);
      // Clear success message after 5 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    }
  };

  const handleBackToLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: theme.colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="mail-outline"
              size={80}
              color={theme.colors.primary}
            />
          </View>

          <Text
            variant="headingLarge"
            style={styles.title}
            testID="verify-email-title"
          >
            Verify Your Email
          </Text>

          <Text
            variant="body"
            style={[styles.description, { color: theme.colors.textSecondary }]}
            testID="verify-email-description"
          >
            We&apos;ve sent a verification email to:
          </Text>

          <Text
            variant="body"
            style={[styles.email, { color: theme.colors.primary }]}
            testID="verify-email-address"
          >
            {email}
          </Text>

          <Text
            variant="body"
            style={[styles.instructions, { color: theme.colors.textSecondary }]}
            testID="verify-email-instructions"
          >
            Please check your email and click the verification link to activate
            your account.
          </Text>

          {error !== null && (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: theme.colors.error + '20' },
              ]}
              testID="verify-email-error"
            >
              <Ionicons
                name="alert-circle"
                size={20}
                color={theme.colors.error}
                style={styles.errorIcon}
              />
              <Text
                style={[styles.errorText, { color: theme.colors.error }]}
                testID="verify-email-error-text"
              >
                {error}
              </Text>
            </View>
          )}

          {resendSuccess && (
            <View
              style={[
                styles.successContainer,
                { backgroundColor: theme.colors.success + '20' },
              ]}
              testID="verify-email-success"
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
                style={styles.successIcon}
              />
              <Text
                style={[styles.successText, { color: theme.colors.success }]}
                testID="verify-email-success-text"
              >
                Verification email sent! Please check your inbox.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.resendButton,
              { backgroundColor: theme.colors.primary },
              (isResending || isLoading) && styles.disabledButton,
            ]}
            onPress={() => {
              void handleResend();
            }}
            disabled={isResending || isLoading}
            testID="resend-button"
          >
            {isResending || isLoading ? (
              <ActivityIndicator
                color={theme.colors.background}
                size="small"
                testID="resend-loading"
              />
            ) : (
              <Text
                style={[styles.buttonText, { color: theme.colors.background }]}
                testID="resend-button-text"
              >
                Resend Verification Email
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text
              variant="body"
              style={{ color: theme.colors.textSecondary }}
              testID="back-to-login-prompt"
            >
              Already verified?
            </Text>
            <TouchableOpacity
              onPress={handleBackToLogin}
              testID="back-to-login-button"
            >
              <Text
                style={[styles.loginText, { color: theme.colors.primary }]}
                testID="back-to-login-button-text"
              >
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
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
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 24,
    fontSize: 16,
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  successIcon: {
    marginTop: 2,
  },
  successText: {
    flex: 1,
    marginLeft: 10,
    lineHeight: 22,
    fontSize: 15,
    fontWeight: '600',
  },
  resendButton: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontWeight: '600',
    marginLeft: 8,
  },
});
