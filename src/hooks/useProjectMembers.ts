import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type AppRole =
  | 'builder'
  | 'client'
  | 'sub-contractor'
  | 'architect-designer'
  | 'administrator'
  | 'super_admin'
  | 'other';

export const ROLE_LABELS: Record<AppRole, string> = {
  builder: 'Builder',
  client: 'Client',
  'sub-contractor': 'Sub-contractor',
  'architect-designer': 'Architect / Designer',
  administrator: 'Administrator',
  super_admin: 'Super Admin',
  other: 'Other',
};

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    company_name: string | null;
  };
}

export function useProjectMembers(projectId: string | null) {
  return useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      // First get the project members
      const { data: members, error: membersError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId);

      if (membersError) throw membersError;

      // Then get the profiles for each member
      const memberWithProfiles: ProjectMember[] = await Promise.all(
        (members || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, company_name')
            .eq('user_id', member.user_id)
            .single();

          return {
            ...member,
            profile: profile || undefined,
          };
        })
      );

      return memberWithProfiles;
    },
    enabled: !!projectId,
  });
}

export function useRemoveProjectMember(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!projectId) throw new Error('No project selected');
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });
}

export function useUpdateProjectMemberRole(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: AppRole;
    }) => {
      if (!projectId) throw new Error('No project selected');
      const { data, error } = await supabase
        .from('project_members')
        .update({ role })
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });
}

export interface InviteProjectMemberParams {
  email: string;
  role: AppRole;
}

export function useInviteProjectMember(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: InviteProjectMemberParams) => {
      if (!projectId) throw new Error('No project selected');
      await supabase.auth.refreshSession().catch(() => undefined);

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        'invite-project-member',
        {
          body: {
            project_id: projectId,
            email: params.email.trim().toLowerCase(),
            role: params.role,
          },
        }
      );

      if (fnError) {
        console.error('[useInviteProjectMember] Edge function error:', fnError);
        throw new Error(fnError.message || 'Failed to send invitation');
      }

      const response = fnData as { success?: boolean; error?: string };
      if (response?.error) {
        throw new Error(response.error);
      }
      return fnData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });
}
