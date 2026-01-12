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
import { type Theme } from '../../src/theme';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useRouter } from 'expo-router';
import {
  validateEmail,
  validateLoginForm,
  validatePassword,
} from '../../src/utils/validation';

// Green color matching the design
const GREEN_PRIMARY = '#4CAF50';

export default function LoginScreen() {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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

  const handleSocialLogin = (provider: 'apple' | 'google') => {
    // TODO: Implement social login
    console.log(`Social login with ${provider}`);
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
      style={[styles.container, { backgroundColor: GREEN_PRIMARY }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      testID="login-screen"
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
            testID="sign-in-header"
          >
            Sign In
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
            style={[styles.welcomeTitle, { color: theme.colors.text }]}
            testID="welcome-text"
          >
            Welcome Back!
          </Text>

          <Text
            variant="body"
            style={[
              styles.welcomeSubtitle,
              { color: theme.colors.textSecondary },
            ]}
            testID="login-instruction"
          >
            To keep connected with us please login with your personal info
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
              Email Address
            </Text>
            <TextInput
              placeholder="Email Address"
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
                      : theme.colors.border,
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

          <View style={styles.inputWrapper}>
            <Text
              variant="caption"
              style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
            >
              Password
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                placeholder="Password"
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
                        : theme.colors.border,
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

          {/* Remember me and Forgot password */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => {
                setRememberMe(!rememberMe);
              }}
              testID="remember-me-checkbox"
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: rememberMe ? GREEN_PRIMARY : 'transparent',
                    borderColor: rememberMe
                      ? GREEN_PRIMARY
                      : theme.colors.border,
                  },
                ]}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <Text
                variant="body"
                style={[styles.rememberMeText, { color: theme.colors.text }]}
              >
                Remember me?
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleForgotPassword}
              testID="forgot-password-button"
            >
              <Text
                variant="body"
                style={[styles.forgotPasswordText, { color: GREEN_PRIMARY }]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>
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
              <Text
                style={[styles.buttonText, { color: '#FFFFFF' }]}
                testID="login-button-text"
              >
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separatorContainer}>
            <View
              style={[
                styles.separatorLine,
                { backgroundColor: theme.colors.border },
              ]}
            />
            <Text
              variant="caption"
              style={[
                styles.separatorText,
                { color: theme.colors.textSecondary },
              ]}
            >
              OR CONTINUE WITH
            </Text>
            <View
              style={[
                styles.separatorLine,
                { backgroundColor: theme.colors.border },
              ]}
            />
          </View>

          {/* Social login buttons */}
          {Platform.OS === 'ios' ? (
            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => {
                handleSocialLogin('apple');
              }}
              testID="apple-login-button"
            >
              <Ionicons name="logo-apple" size={20} color="#000000" />
              <Text
                variant="body"
                style={[styles.socialButtonText, { color: theme.colors.text }]}
              >
                Sign In with Apple
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => {
                handleSocialLogin('google');
              }}
              testID="google-login-button"
            >
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text
                variant="body"
                style={[styles.socialButtonText, { color: theme.colors.text }]}
              >
                Sign In with Google
              </Text>
            </TouchableOpacity>
          )}

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
                Register
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
    marginTop: 150,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  welcomeTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 24,
    fontWeight: '600',
  },
  welcomeSubtitle: {
    marginBottom: 32,
    fontSize: 14,
    lineHeight: 20,
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
  input: {
    height: 48,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberMeText: {
    fontSize: 14,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
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
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
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
