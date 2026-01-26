import { supabase } from '../lib/supabase';
import { type User } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Check if we have an active authentication session
export async function checkAuthSession(): Promise<boolean> {
  console.log('[Auth] checkAuthSession() called');
  console.log('[Auth] Checking Supabase session...');
  
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // Handle invalid refresh token errors gracefully
    if (error !== null) {
      const errorMessage = error.message?.toLowerCase() ?? '';
      const isInvalidRefreshToken =
        errorMessage.includes('invalid refresh token') ||
        errorMessage.includes('refresh token not found');

      if (isInvalidRefreshToken) {
        console.log(
          '[Auth] Invalid refresh token detected - clearing session'
        );
        // Clear the invalid session
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          // Ignore sign out errors - session is already invalid
          console.log(
            '[Auth] Error during cleanup sign out (expected):',
            signOutError
          );
        }
        return false;
      }

      console.log('[Auth] Error checking Supabase session:', error);
      return false;
    }

    const hasSupabaseSession = session !== null && session !== undefined;
    console.log('[Auth] Supabase session check result:', hasSupabaseSession);
    return hasSupabaseSession;
  } catch (error) {
    // Check if this is a configuration error (missing environment variables)
    const errorMessage =
      error instanceof Error
        ? (error.message?.toLowerCase() ?? '')
        : String(error).toLowerCase();

    const isConfigurationError =
      errorMessage.includes('supabase credentials are missing') ||
      errorMessage.includes('environment variables') ||
      errorMessage.includes('expo_public_supabase');

    if (isConfigurationError) {
      console.error(
        '[Auth] Configuration error detected:',
        error instanceof Error ? error.message : String(error)
      );
      console.error(
        '[Auth] Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in EAS secrets or environment variables.'
      );
      // Return false instead of crashing - allows app to show login screen
      return false;
    }

    // Check if this is an invalid refresh token error
    const isInvalidRefreshToken =
      errorMessage.includes('invalid refresh token') ||
      errorMessage.includes('refresh token not found');

    if (isInvalidRefreshToken) {
      console.log(
        '[Auth] Invalid refresh token detected (from exception) - clearing session'
      );
      // Clear the invalid session
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        // Ignore sign out errors - session is already invalid
        console.log(
          '[Auth] Error during cleanup sign out (expected):',
          signOutError
        );
      }
      return false;
    }

    console.log('[Auth] Error checking Supabase session:', error);
    return false;
  }
}

// Get current user data
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Check session first (more reliable than getUser)
    const { data: sessionData } = await supabase.auth.getSession();
    if (
      sessionData.session?.user !== null &&
      sessionData.session?.user !== undefined
    ) {
      return sessionData.session.user;
    }

    // Fallback to getUser if session doesn't have user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user !== null) {
      return user;
    }
  } catch (error) {
    console.error('[Auth] Error getting user:', error);
  }

  return null;
}

// Helper function to format Supabase error messages for users
function formatAuthError(error: any): string {
  if (error?.message) {
    // Map common Supabase error messages to user-friendly ones
    const message = error.message.toLowerCase();

    if (
      message.includes('invalid login credentials') ||
      message.includes('invalid credentials')
    ) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('email not confirmed')) {
      return 'Please verify your email address before signing in. Check your inbox for a confirmation email.';
    }
    if (message.includes('too many requests')) {
      return 'Too many login attempts. Please wait a few minutes before trying again.';
    }
    if (message.includes('user not found')) {
      return 'No account found with this email address. Please check your email or register for a new account.';
    }

    // Return the original message if we don't have a specific mapping
    return error.message;
  }

  return 'An error occurred during login. Please try again.';
}

// Standard login function
export async function login(
  email: string,
  password: string
): Promise<{
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
}> {
  console.log(`[Auth] Login attempt for: ${email}`);

  try {
    console.log(`[Auth] Authenticating user: ${email}`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error !== null) {
      console.log('[Auth] Authentication error:', error);

      // Check if error is due to email not being confirmed
      const errorMessage = (error.message ?? '').toLowerCase();
      const errorName = (error.name ?? '').toLowerCase();
      const errorString = String(error).toLowerCase();

      const requiresEmailConfirmation =
        errorMessage.includes('email not confirmed') ||
        errorMessage.includes('email not verified') ||
        errorName.includes('email not confirmed') ||
        errorString.includes('email not confirmed');

      console.log('[Auth] Requires email confirmation:', {
        requiresEmailConfirmation,
        errorMessage,
      });

      return {
        success: false,
        error: formatAuthError(error),
        requiresEmailConfirmation,
      };
    }

    if (data.user === null) {
      return {
        success: false,
        error:
          'Invalid email or password. Please check your credentials and try again.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('[Auth] Authentication error:', error);

    // Check if error is due to email not being confirmed
    const errorMessage =
      error instanceof Error
        ? (error.message?.toLowerCase() ?? '')
        : String(error).toLowerCase();
    const requiresEmailConfirmation =
      errorMessage.includes('email not confirmed') ||
      errorMessage.includes('email not verified');

    return {
      success: false,
      error: formatAuthError(error),
      requiresEmailConfirmation,
    };
  }
}

// Helper function to format Supabase registration error messages for users
function formatRegistrationError(error: any): string {
  if (error?.message) {
    const message = error.message.toLowerCase();

    if (
      message.includes('user already registered') ||
      message.includes('already registered')
    ) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (message.includes('password')) {
      return 'Password does not meet requirements. Please use a stronger password.';
    }
    if (message.includes('email')) {
      return 'Invalid email address. Please check your email and try again.';
    }
    if (message.includes('too many requests')) {
      return 'Too many registration attempts. Please wait a few minutes before trying again.';
    }

    return error.message;
  }

  return 'An error occurred during registration. Please try again.';
}

// Register function
export async function register(
  email: string,
  password: string,
  name: string,
  role?: string
): Promise<{
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
  email?: string;
}> {
  try {
    console.log(`[Auth] Registering user: ${email}`);

    // Get app scheme for redirect URL
    const appScheme =
      (Constants.expoConfig?.scheme as string | undefined) ?? 'build-sync';
    const redirectUrl = `${appScheme}://`;

    console.log(`[Auth] Using redirect URL: ${redirectUrl}`);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role || 'client',
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error !== null) {
      console.log('[Auth] Registration error:', error);
      return {
        success: false,
        error: formatRegistrationError(error),
      };
    }

    if (data.user === null) {
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }

    // Check if email confirmation is required
    const requiresEmailConfirmation =
      data.session === null || data.session === undefined;

    // Don't auto-login if email confirmation is required
    if (requiresEmailConfirmation) {
      console.log(
        '[Auth] Email confirmation required - user will need to verify email before signing in'
      );
    }

    return {
      success: true,
      requiresEmailConfirmation,
      email: data.user.email ?? email,
    };
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    return {
      success: false,
      error: formatRegistrationError(error),
    };
  }
}

// Reset password (send reset email)
export async function resetPassword(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Auth] Sending password reset email to: ${email}`);

    // Get app scheme for redirect URL
    const appScheme =
      (Constants.expoConfig?.scheme as string | undefined) ?? 'build-sync';
    const redirectUrl = `${appScheme}://reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error !== null) {
      console.log('[Auth] Reset password error:', error);
      return {
        success: false,
        error: error.message ?? 'Failed to send password reset email',
      };
    }

    console.log('[Auth] Password reset email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('[Auth] Reset password error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to send password reset email',
    };
  }
}

// Update password (after reset token is verified)
export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Auth] Updating password...');

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error !== null) {
      console.log('[Auth] Update password error:', error);
      return {
        success: false,
        error: error.message ?? 'Failed to update password',
      };
    }

    console.log('[Auth] Password updated successfully');
    return { success: true };
  } catch (error) {
    console.error('[Auth] Update password error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update password',
    };
  }
}

// Resend verification email
export async function resendVerificationEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Auth] Resending verification email to: ${email}`);

    // Get app scheme for redirect URL
    const appScheme =
      (Constants.expoConfig?.scheme as string | undefined) ?? 'build-sync';
    const redirectUrl = `${appScheme}://`;

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error !== null) {
      console.log('[Auth] Resend verification email error:', error);
      return {
        success: false,
        error: error.message ?? 'Failed to resend verification email',
      };
    }

    console.log('[Auth] Verification email resent successfully');
    return { success: true };
  } catch (error) {
    console.error('[Auth] Resend verification email error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to resend verification email',
    };
  }
}

// Logout function
export async function logout(): Promise<void> {
  console.log('[Auth] Logging out...');

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('[Auth] Logout error:', error);
  }
}
