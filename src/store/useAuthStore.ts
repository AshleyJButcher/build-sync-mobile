import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  resendVerificationEmail as authResendVerificationEmail,
  resetPassword as authResetPassword,
  updatePassword as authUpdatePassword,
  checkAuthSession,
} from '../services/auth';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isCheckingSession: boolean;

  // Actions
  login: (
    email: string,
    password: string
  ) => Promise<{ requiresEmailConfirmation?: boolean } | undefined>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<
    { requiresEmailConfirmation: boolean; email?: string } | undefined
  >;
  logout: () => Promise<void>;
  clearError: () => void;
  checkSession: () => Promise<void>;
  resendVerificationEmail: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      isCheckingSession: false,

      checkSession: async () => {
        // Prevent multiple concurrent session checks
        const currentState = get();
        if (currentState.isCheckingSession) {
          console.log('[AuthStore] Session check already in progress, skipping');
          return;
        }

        console.log('[AuthStore] Starting session check...');
        set({ isCheckingSession: true });
        try {
          console.log('[AuthStore] Calling checkAuthSession()...');
          const hasSession = await checkAuthSession();
          console.log('[AuthStore] checkAuthSession() result:', hasSession);

          if (hasSession) {
            console.log('[AuthStore] Setting isAuthenticated = true');
            set({ isAuthenticated: true, isCheckingSession: false });
            console.log('[AuthStore] Authentication state updated to true');
          } else {
            console.log('[AuthStore] Setting isAuthenticated = false');
            set({
              isAuthenticated: false,
              user: null,
              isCheckingSession: false,
            });
            console.log('[AuthStore] Authentication state updated to false');
          }
        } catch (error) {
          console.error('[AuthStore] Session check failed:', error);
          set({ isAuthenticated: false, user: null, isCheckingSession: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          console.log('[AuthStore] Attempting login...');
          const result = await authLogin(email, password);
          if (result.success) {
            console.log('[AuthStore] Login successful');
            set({
              isAuthenticated: true,
              isLoading: false,
            });
            // Note: User details will be fetched separately if needed
          } else {
            console.log('[AuthStore] Login failed:', result.error);
            console.log(
              '[AuthStore] Requires email confirmation:',
              result.requiresEmailConfirmation
            );
            set({
              isLoading: false,
            });

            // If email confirmation is required, return that info instead of setting error
            if (result.requiresEmailConfirmation === true) {
              console.log('[AuthStore] Returning email confirmation flag');
              return {
                requiresEmailConfirmation: true,
              };
            }

            set({
              error: result.error ?? 'Invalid credentials',
            });
          }
        } catch (error) {
          console.error('[AuthStore] Login error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
        }
      },

      register: async (name, email, password, role) => {
        set({ isLoading: true, error: null });

        try {
          console.log('[AuthStore] Attempting registration...');
          const result = await authRegister(email, password, name, role);
          if (result.success) {
            console.log('[AuthStore] Registration successful');
            set({
              isLoading: false,
            });

            // If email confirmation is required, don't set isAuthenticated to true
            if (result.requiresEmailConfirmation === true) {
              console.log('[AuthStore] Email confirmation required');
              return {
                requiresEmailConfirmation: true,
                email: result.email,
              };
            }

            // Only set authenticated if no email confirmation is needed
            set({
              isAuthenticated: true,
            });
            // Note: User details will be fetched separately if needed
          } else {
            console.log('[AuthStore] Registration failed:', result.error);
            set({
              isLoading: false,
              error: result.error ?? 'Registration failed',
            });
          }
        } catch (error) {
          console.error('[AuthStore] Registration error:', error);
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : 'Registration failed',
          });
        }
      },

      resendVerificationEmail: async (email) => {
        set({ isLoading: true, error: null });

        try {
          const result = await authResendVerificationEmail(email);
          set({ isLoading: false });
          if (!result.success) {
            set({
              error: result.error ?? 'Failed to resend verification email',
            });
          }
          return result;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to resend verification email',
          });
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to resend verification email',
          };
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null });

        try {
          const result = await authResetPassword(email);
          set({ isLoading: false });
          if (!result.success) {
            set({
              error: result.error ?? 'Failed to send password reset email',
            });
          }
          return result;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to send password reset email',
          });
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to send password reset email',
          };
        }
      },

      updatePassword: async (newPassword) => {
        set({ isLoading: true, error: null });

        try {
          const result = await authUpdatePassword(newPassword);
          set({ isLoading: false });
          if (!result.success) {
            set({
              error: result.error ?? 'Failed to update password',
            });
          }
          return result;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : 'Failed to update password',
          });
          return {
            success: false,
            error:
              error instanceof Error ? error.message : 'Failed to update password',
          };
        }
      },

      logout: async () => {
        try {
          console.log('[AuthStore] Logging out...');
          await authLogout();
          set({
            isAuthenticated: false,
            user: null,
          });
          console.log('[AuthStore] Logout successful');
        } catch (error) {
          console.error('[AuthStore] Logout error:', error);
          // Still clear local state even if logout fails
          set({
            isAuthenticated: false,
            user: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
