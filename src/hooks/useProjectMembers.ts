import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type AppRole =
  | 'builder'
  | 'client'
  | 'sub-contractor'
  | 'architect-designer'
  | 'administrator'
  | 'super_admin'
  | 'other';

interface ProjectMember {
  id: string;
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
