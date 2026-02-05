import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
  validateName,
  validatePassword,
  validatePasswordMatch,
  validateRegistrationForm,
} from '../../src/utils/validation';

type RoleOption = 'builder' | 'client';

export default function RegisterScreen() {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<RoleOption>('client');
  const [validationError, setValidationError] = useState<string>('');
  const [isTouched, setIsTouched] = useState<{
    name: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  }>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [passwordStrength, setPasswordStrength] = useState<
    'weak' | 'medium' | 'strong' | ''
  >('');

  // Clear validation errors when component unmounts
  useEffect(() => {
    return () => {
      setValidationError('');
    };
  }, []);

  // Calculate password strength when password changes
  useEffect(() => {
    if (password === '') {
      setPasswordStrength('');
      return;
    }

    // Simple password strength algorithm
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    // Check length
    if (password.length >= 12) {
      strength = 'strong';
    } else if (password.length >= 8) {
      strength = 'medium';
    } else {
      strength = 'weak';
    }

    // Check complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const complexity = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChars,
    ].filter(Boolean).length;

    if (complexity >= 3 && password.length >= 8) {
      strength = 'strong';
    } else if (complexity >= 2 && password.length >= 8) {
      strength = 'medium';
    }

    setPasswordStrength(strength);
  }, [password]);

  // Validate form when fields change
  useEffect(() => {
    // Only validate after user has interacted with fields
    if (!Object.values(isTouched).some(Boolean)) return;

    // Validate only the fields that have been touched
    if (isTouched.name && name.trim() === '') {
      setValidationError('Name is required');
      return;
    }

    if (isTouched.email && email.trim() === '') {
      setValidationError('Email is required');
      return;
    }

    if (isTouched.password && password !== '') {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        setValidationError(passwordValidation.error ?? 'Invalid password');
        return;
      }
    }

    if (
      isTouched.confirmPassword &&
      confirmPassword !== '' &&
      password !== confirmPassword
    ) {
      setValidationError('Passwords do not match');
      return;
    }

    // Clear validation error if everything looks good
    if (validationError !== '') {
      setValidationError('');
    }
  }, [name, email, password, confirmPassword, isTouched, validationError]);

  const handleRegister = async () => {
    // Reset server error
    clearError();

    // Validate entire form
    const validation = validateRegistrationForm(
      name,
      email,
      password,
      confirmPassword
    );
    if (!validation.valid) {
      setValidationError(validation.error ?? 'Please check your form');
      return;
    }

    // All good, attempt registration
    const result = await register(name.trim(), email.trim(), password, selectedRole);

    // If email confirmation is required, navigate to verify email screen
    if (result !== undefined && result.requiresEmailConfirmation) {
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: result.email ?? email.trim() },
      });
    }
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleSocialLogin = (provider: 'apple' | 'google') => {
    // TODO: Implement social login
    console.log(`Social login with ${provider}`);
  };

  // Mark fields as touched when user interacts with them
  const handleNameChange = (text: string) => {
    setName(text);
    if (!isTouched.name) {
      setIsTouched((prev) => ({ ...prev, name: true }));
    }
  };

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

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (!isTouched.confirmPassword) {
      setIsTouched((prev) => ({ ...prev, confirmPassword: true }));
    }
  };

  // Validate fields individually on blur
  const handleNameBlur = () => {
    setIsTouched((prev) => ({ ...prev, name: true }));
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      setValidationError(nameValidation.error ?? 'Name is required');
    } else if (validationError === 'Name is required') {
      setValidationError('');
    }
  };

  const handleEmailBlur = () => {
    setIsTouched((prev) => ({ ...prev, email: true }));
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setValidationError(emailValidation.error ?? 'Invalid email');
    } else if (validationError.includes('email')) {
      setValidationError('');
    }
  };

  const handlePasswordBlur = () => {
    setIsTouched((prev) => ({ ...prev, password: true }));
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setValidationError(passwordValidation.error ?? 'Invalid password');
    } else if (
      validationError.includes('password') &&
      !validationError.includes('match')
    ) {
      setValidationError('');
    }
  };

  const handleConfirmPasswordBlur = () => {
    setIsTouched((prev) => ({ ...prev, confirmPassword: true }));
    if (password !== '' && confirmPassword !== '') {
      const passwordMatchValidation = validatePasswordMatch(
        password,
        confirmPassword
      );
      if (!passwordMatchValidation.valid) {
        setValidationError(
          passwordMatchValidation.error ?? 'Passwords do not match'
        );
      } else if (validationError === 'Passwords do not match') {
        setValidationError('');
      }
    }
  };

  // Determine if button should be disabled
  const isFormInvalid =
    name.trim() === '' ||
    email.trim() === '' ||
    password.trim() === '' ||
    confirmPassword.trim() === '' ||
    isLoading;

  // Determine which error to display (prioritize server error over validation)
  const displayError = error ?? validationError;

  // Helper to get password strength color
  const getPasswordStrengthColor = (): string => {
    switch (passwordStrength) {
      case 'weak':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'strong':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: GREEN_PRIMARY }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      testID="register-screen"
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
            testID="sign-up-header"
          >
            Sign Up
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
            testID="create-account-text"
          >
            Welcome!
          </Text>

          <Text
            variant="body"
            style={[
              styles.welcomeSubtitle,
              { color: theme.colors.textSecondary },
            ]}
            testID="register-instruction"
          >
            To keep connected with us please sign up with your personal info
          </Text>

          {displayError !== '' ? (
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
                  if (error !== null) {
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
              Full Name
            </Text>
            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={handleNameChange}
              onBlur={handleNameBlur}
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  borderColor:
                    isTouched.name && name.trim() === ''
                      ? theme.colors.error
                      : theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="words"
              returnKeyType="next"
              testID="name-input"
            />
          </View>

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
                textContentType="newPassword"
                autoComplete="password-new"
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

          {/* Password strength indicator */}
          {password.length > 0 && (
            <View style={styles.passwordStrengthContainer}>
              <Text
                variant="caption"
                style={{ color: getPasswordStrengthColor() }}
              >
                Password strength:{' '}
                {passwordStrength.charAt(0).toUpperCase() +
                  passwordStrength.slice(1)}
              </Text>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthIndicator,
                    {
                      backgroundColor: getPasswordStrengthColor(),
                      width:
                        passwordStrength === 'weak'
                          ? '33%'
                          : passwordStrength === 'medium'
                            ? '66%'
                            : '100%',
                    },
                  ]}
                />
              </View>
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Text
              variant="caption"
              style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
            >
              Confirm Password
            </Text>
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordBlur}
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  borderColor:
                    isTouched.confirmPassword &&
                    (confirmPassword.trim() === '' ||
                      (password !== '' &&
                        confirmPassword !== '' &&
                        password !== confirmPassword))
                      ? theme.colors.error
                      : theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              autoComplete="password-new"
              returnKeyType="done"
              testID="confirm-password-input"
            />
          </View>

          {/* Role Selection */}
          <View style={styles.inputWrapper}>
            <Text
              variant="caption"
              style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
            >
              I am a...
            </Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  {
                    backgroundColor:
                      selectedRole === 'client'
                        ? `${GREEN_PRIMARY}15`
                        : theme.colors.background,
                    borderColor:
                      selectedRole === 'client'
                        ? GREEN_PRIMARY
                        : theme.colors.border,
                  },
                ]}
                onPress={() => setSelectedRole('client')}
              >
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={selectedRole === 'client' ? GREEN_PRIMARY : theme.colors.textSecondary}
                />
                <Text
                  variant="body"
                  style={[
                    styles.roleButtonText,
                    {
                      color:
                        selectedRole === 'client'
                          ? GREEN_PRIMARY
                          : theme.colors.text,
                    },
                  ]}
                >
                  Client
                </Text>
                <Text
                  variant="caption"
                  style={[
                    styles.roleButtonSubtext,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Building a home
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  {
                    backgroundColor:
                      selectedRole === 'builder'
                        ? `${GREEN_PRIMARY}15`
                        : theme.colors.background,
                    borderColor:
                      selectedRole === 'builder'
                        ? GREEN_PRIMARY
                        : theme.colors.border,
                  },
                ]}
                onPress={() => setSelectedRole('builder')}
              >
                <Ionicons
                  name="business-outline"
                  size={24}
                  color={selectedRole === 'builder' ? GREEN_PRIMARY : theme.colors.textSecondary}
                />
                <Text
                  variant="body"
                  style={[
                    styles.roleButtonText,
                    {
                      color:
                        selectedRole === 'builder'
                          ? GREEN_PRIMARY
                          : theme.colors.text,
                    },
                  ]}
                >
                  Builder
                </Text>
                <Text
                  variant="caption"
                  style={[
                    styles.roleButtonSubtext,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Construction pro
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              { backgroundColor: GREEN_PRIMARY },
              isFormInvalid && styles.disabledButton,
            ]}
            onPress={() => {
              void handleRegister();
            }}
            disabled={isFormInvalid}
            testID="register-button"
          >
            {isLoading ? (
              <ActivityIndicator
                color="#FFFFFF"
                size="small"
                testID="register-loading"
              />
            ) : (
              <Text
                style={[styles.buttonText, { color: '#FFFFFF' }]}
                testID="register-button-text"
              >
                Sign Up
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
              testID="apple-register-button"
            >
              <Ionicons name="logo-apple" size={20} color="#000000" />
              <Text
                variant="body"
                style={[styles.socialButtonText, { color: theme.colors.text }]}
              >
                Sign Up with Apple
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
              testID="google-register-button"
            >
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text
                variant="body"
                style={[styles.socialButtonText, { color: theme.colors.text }]}
              >
                Sign Up with Google
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.loginContainer}>
            <Text
              variant="body"
              style={{ color: theme.colors.textSecondary }}
              testID="login-prompt"
            >
              Already have an account?
            </Text>
            <TouchableOpacity onPress={handleLogin} testID="login-button">
              <Text
                style={[styles.loginText, { color: GREEN_PRIMARY }]}
                testID="login-button-text"
              >
                Login
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
    marginTop: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    justifyContent: 'center',
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
  registerButton: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
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
  passwordStrengthContainer: {
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  strengthIndicator: {
    height: '100%',
    borderRadius: 2,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  roleButtonText: {
    marginTop: 8,
    fontWeight: '600',
  },
  roleButtonSubtext: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
});
