import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { getCurrentUser } from '../services/auth';
import { supabase } from '../lib/supabase';
import { type User } from '@supabase/supabase-js';

type AppRole =
  | 'builder'
  | 'client'
  | 'sub-contractor'
  | 'architect-designer'
  | 'administrator'
  | 'super_admin'
  | 'other';

interface UseAuthReturn {
  user: User | null;
  role: AppRole | null;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
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

export function useAuth(): UseAuthReturn {
  const authStore = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Fetch user role when authenticated
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[useAuth] Error fetching role:', error);
        setRole(null);
      } else {
        setRole((data?.role as AppRole) || null);
      }
    } catch (error) {
      console.error('[useAuth] Error fetching role:', error);
      setRole(null);
    }
  };

  // Fetch current user when authenticated
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      if (authStore.isAuthenticated) {
        setIsLoadingUser(true);
        try {
          const currentUser = await getCurrentUser();
          if (mounted) {
            setUser(currentUser);
            if (currentUser) {
              await fetchUserRole(currentUser.id);
            } else {
              setRole(null);
            }
          }
        } catch (error) {
          console.error('[useAuth] Error loading user:', error);
          if (mounted) {
            setUser(null);
            setRole(null);
          }
        } finally {
          if (mounted) {
            setIsLoadingUser(false);
          }
        }
      } else {
        setUser(null);
        setRole(null);
        setIsLoadingUser(false);
      }
    };

    void loadUser();

    return () => {
      mounted = false;
    };
  }, [authStore.isAuthenticated]);

  // Listen to auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[useAuth] Auth state changed:', event);
      if (session?.user) {
        setUser(session.user);
        await fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isSuperAdmin = role === 'super_admin';

  return {
    user,
    role,
    isSuperAdmin,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading || isLoadingUser || authStore.isCheckingSession,
    error: authStore.error,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    clearError: authStore.clearError,
    checkSession: authStore.checkSession,
    resendVerificationEmail: authStore.resendVerificationEmail,
    resetPassword: authStore.resetPassword,
    updatePassword: authStore.updatePassword,
  };
}
