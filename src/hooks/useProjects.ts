import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  status: 'active' | 'completed' | 'on-hold';
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  address?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
}

export function useProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });
}

export function useArchivedProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', 'archived'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });
}

export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (error) throw error;
      return data as Project | null;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { role } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      // Force refresh the auth session to ensure the Authorization header is synced
      await supabase.auth.refreshSession().catch(() => undefined);

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        'create-project',
        {
          body: {
            name: data.name,
            description: data.description ?? null,
            address: data.address ?? null,
            budget: data.budget ?? null,
            start_date: data.start_date ?? null,
            end_date: data.end_date ?? null,
            memberRole: role || 'client',
          },
        }
      );

      if (fnError) {
        console.error(
          '[useCreateProject] Edge function invocation error:',
          fnError
        );
        throw new Error(fnError.message || 'Failed to invoke project creation');
      }

      // Handle structured error responses from the edge function
      const responseData = fnData as {
        success?: boolean;
        project?: Project;
        error?: string;
        code?: string;
      };

      if (responseData?.error) {
        console.error('[useCreateProject] Server returned error:', responseData);
        const errorCode = responseData.code ? ` [${responseData.code}]` : '';
        throw new Error(`${responseData.error}${errorCode}`);
      }

      if (!responseData?.project?.id) {
        console.error('[useCreateProject] Unexpected response:', responseData);
        throw new Error('Unexpected server response - no project returned');
      }

      return responseData.project as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Project> & { id: string }) => {
      const { data: project, error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return project as Project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data: project, error } = await supabase
        .from('projects')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return project as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useRestoreProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data: project, error } = await supabase
        .from('projects')
        .update({ archived_at: null })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return project as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
