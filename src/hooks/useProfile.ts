import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, company_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('[useProfile] Error fetching profile:', error.message);
        return null;
      }

      return data as UserProfile | null;
    },
    enabled: !!user?.id,
  });
}

/** Get initials from user email or profile name */
export function useUserInitials(): string {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  if (profile?.full_name?.trim()) {
    const parts = profile.full_name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return profile.full_name.slice(0, 2).toUpperCase();
  }
  if (user?.email) {
    const local = user.email.split('@')[0];
    return local.slice(0, 2).toUpperCase();
  }
  return '?';
}
