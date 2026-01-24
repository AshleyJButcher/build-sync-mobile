import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text as RNText,
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
import {
  validateEmail,
  validateLoginForm,
  validatePassword,
} from '../../src/utils/validation';

export default function LoginScreen() {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isTouched, setIsTouched] = useState({
    email: false,
    password: false,
  });

  // Clear validation errors when component unmounts
  useEffect(() => {
    return () => {
      setValidationError('');
    };
  }, []);

  // Validate form when fields change
  useEffect(() => {
    // Don't validate if there's a server error - let it stay visible
    if (error != null && error !== '') return;

    // Only validate after user has interacted with fields
    if (!isTouched.email && !isTouched.password) return;

    // Validate only the fields that have been touched
    if (isTouched.email && email.trim() === '') {
      setValidationError('Email is required');
      return;
    }

    if (isTouched.password && password.trim() === '') {
      setValidationError('Password is required');
      return;
    }

    // Only clear validation error if fields are actually valid
    if (isTouched.email && isTouched.password) {
      const emailValidation = validateEmail(email);
      const passwordValidation = validatePassword(password);

      if (emailValidation.valid && passwordValidation.valid) {
        setValidationError('');
      }
    } else if (isTouched.email) {
      const emailValidation = validateEmail(email);
      if (emailValidation.valid) {
        setValidationError('');
      }
    } else if (isTouched.password) {
      const passwordValidation = validatePassword(password);
      if (passwordValidation.valid) {
        setValidationError('');
      }
    }
  }, [email, password, isTouched, error]);

  const handleLogin = async () => {
    // Clear validation errors, but keep server errors visible until new attempt
    setValidationError('');

    // Validate form
    const validation = validateLoginForm(email, password);
    if (!validation.valid) {
      setValidationError(validation.error ?? 'Please check your form');
      return;
    }

    // Clear any previous server error before new login attempt
    clearError();

    // All good, attempt login
    const result = await login(email.trim(), password);

    console.log('[LoginScreen] Login result:', result);

    // If email confirmation is required, navigate to verify email screen
    if (result !== undefined && result.requiresEmailConfirmation === true) {
      console.log('[LoginScreen] Navigating to verify email screen');
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: email.trim() },
      });
    }
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  // Mark field as touched when user interacts with it
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (!isTouched.email) {
      setIsTouched((prev) => ({ ...prev, email: true }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (!isTouched.password) {
      setIsTouched((prev) => ({ ...prev, password: true }));
    }
  };

  // Validate individual fields on blur
  const handleEmailBlur = () => {
    // Don't validate if there's a server error
    if (error != null && error !== '') return;

    setIsTouched((prev) => ({ ...prev, email: true }));
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setValidationError(emailValidation.error ?? 'Invalid email');
    } else {
      // Only clear if this was an email validation error
      if (
        validationError.includes('email') ||
        validationError.includes('Email')
      ) {
        setValidationError('');
      }
    }
  };

  const handlePasswordBlur = () => {
    // Don't validate if there's a server error
    if (error != null && error !== '') return;

    setIsTouched((prev) => ({ ...prev, password: true }));
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setValidationError(passwordValidation.error ?? 'Invalid password');
    } else {
      // Only clear if this was a password validation error
      if (
        validationError.includes('password') ||
        validationError.includes('Password')
      ) {
        setValidationError('');
      }
    }
  };

  // Determine if button should be disabled
  const isFormInvalid =
    email.trim() === '' || password.trim() === '' || isLoading;

  // Determine which error to display (prioritize server error over validation)
  const displayError = error ?? validationError;
  const hasError =
    displayError != null && displayError !== '' && displayError.trim() !== '';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      testID="login-screen"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section with Intro Text */}
        <View style={styles.topSection}>
          <Text
            variant="body"
            style={[styles.introText, { color: theme.colors.text }]}
            testID="intro-text"
          >
            Track product choices, milestones, cost changes & decisions together.
          </Text>

          {/* Feature Buttons Grid */}
          <View style={styles.featureGrid}>
            <TouchableOpacity
              style={[
                styles.featureButton,
                { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
              ]}
            >
              <Ionicons name="business-outline" size={24} color={GREEN_PRIMARY} />
              <Text
                variant="bodySmall"
                style={[styles.featureButtonText, { color: theme.colors.text }]}
              >
                For pros & clients
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.featureButton,
                { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
              ]}
            >
              <Ionicons name="cube-outline" size={24} color={GREEN_PRIMARY} />
              <Text
                variant="bodySmall"
                style={[styles.featureButtonText, { color: theme.colors.text }]}
              >
                Track products
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.featureButton,
                { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
              ]}
            >
              <Ionicons name="flag-outline" size={24} color={GREEN_PRIMARY} />
              <Text
                variant="bodySmall"
                style={[styles.featureButtonText, { color: theme.colors.text }]}
              >
                Share milestones
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.featureButton,
                { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
              ]}
            >
              <Ionicons name="camera-outline" size={24} color={GREEN_PRIMARY} />
              <Text
                variant="bodySmall"
                style={[styles.featureButtonText, { color: theme.colors.text }]}
              >
                Photos & comments
              </Text>
            </TouchableOpacity>
          </View>

          {/* Watch a Demo */}
          <TouchableOpacity
            style={styles.watchDemoContainer}
            onPress={() => {
              // TODO: Implement demo video
              console.log('Watch demo');
            }}
          >
            <Ionicons name="play-circle-outline" size={24} color={GREEN_PRIMARY} />
            <Text
              variant="body"
              style={[styles.watchDemoText, { color: GREEN_PRIMARY }]}
            >
              Watch a Demo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Form Section */}
        <View
          style={[
            styles.formContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text
            variant="headingMedium"
            style={[styles.welcomeTitle, { color: theme.colors.text }]}
            testID="welcome-text"
          >
            Welcome back
          </Text>

          <Text
            variant="body"
            style={[
              styles.welcomeSubtitle,
              { color: theme.colors.textSecondary },
            ]}
            testID="login-instruction"
          >
            Enter your credentials to access your project
          </Text>

          {hasError ? (
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
              <RNText
                style={[styles.errorText, { color: theme.colors.error }]}
                testID="error-text"
              >
                {displayError}
              </RNText>
              <TouchableOpacity
                onPress={() => {
                  if (error != null && error !== '') {
                    clearError();
                  }
                  if (validationError !== '') {
                    setValidationError('');
                  }
                }}
                style={styles.errorDismissButton}
                testID="error-dismiss-button"
                accessibilityLabel="Dismiss error"
              >
                <Ionicons name="close" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.inputWrapper}>
            <Text
              variant="caption"
              style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
            >
              Email
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="you@example.com"
                value={email}
                onChangeText={handleEmailChange}
                onBlur={handleEmailBlur}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    borderColor:
                      isTouched.email && email.trim() === ''
                        ? theme.colors.error
                        : GREEN_PRIMARY,
                    backgroundColor: theme.colors.background,
                  },
                ]}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                testID="email-input"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.passwordHeader}>
              <Text
                variant="caption"
                style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
              >
                Password
              </Text>
              <TouchableOpacity
                onPress={handleForgotPassword}
                testID="forgot-password-button"
              >
                <Text
                  variant="bodySmall"
                  style={[styles.forgotPasswordText, { color: GREEN_PRIMARY }]}
                >
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="••••••••"
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={handlePasswordBlur}
                style={[
                  styles.passwordInput,
                  {
                    color: theme.colors.text,
                    borderColor:
                      isTouched.password && password.trim() === ''
                        ? theme.colors.error
                        : GREEN_PRIMARY,
                    backgroundColor: theme.colors.background,
                  },
                ]}
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry={!showPassword}
                returnKeyType="done"
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

          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: GREEN_PRIMARY },
              isFormInvalid && styles.disabledButton,
            ]}
            onPress={() => {
              void handleLogin();
            }}
            disabled={isFormInvalid}
            testID="login-button"
          >
            {isLoading ? (
              <ActivityIndicator
                color="#FFFFFF"
                size="small"
                testID="login-loading"
              />
            ) : (
              <View style={styles.buttonContent}>
                <Text
                  style={[styles.buttonText, { color: '#FFFFFF' }]}
                  testID="login-button-text"
                >
                  Sign In
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text
              variant="body"
              style={{ color: theme.colors.textSecondary }}
              testID="register-prompt"
            >
              Don&apos;t have an account?
            </Text>
            <TouchableOpacity onPress={handleRegister} testID="register-button">
              <Text
                style={[styles.registerText, { color: GREEN_PRIMARY }]}
                testID="register-button-text"
              >
                Sign up
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
    padding: 0,
  },
  topSection: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  featureButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  featureButtonText: {
    flex: 1,
  },
  watchDemoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  watchDemoText: {
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    padding: 24,
    paddingTop: 32,
  },
  welcomeTitle: {
    marginBottom: 8,
    fontSize: 24,
    fontWeight: '700',
  },
  welcomeSubtitle: {
    marginBottom: 32,
    fontSize: 16,
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 56,
    width: '100%',
    shadowColor: '#FF7675',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  errorIcon: {
    marginTop: 2,
  },
  errorText: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
    lineHeight: 22,
    fontSize: 15,
    fontWeight: '600',
  },
  errorDismissButton: {
    padding: 4,
    marginTop: -2,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    fontSize: 16,
    paddingLeft: 48,
    paddingRight: 16,
    borderRadius: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    paddingLeft: 48,
    paddingRight: 48,
    borderRadius: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  loginButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  registerText: {
    fontWeight: '600',
  },
});
