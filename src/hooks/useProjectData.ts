import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Product {
  id: string;
  project_id: string;
  name: string;
  category: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  status: 'pending' | 'approved' | 'rejected';
  added_by: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'delayed';
  sort_order: number;
  completion_percentage: number;
  created_at: string;
}

export interface Decision {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  due_date: string | null;
  requested_by: string;
  created_at: string;
}

export interface CostChange {
  id: string;
  project_id: string;
  title: string;
  category: string;
  original_cost: number;
  new_cost: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string;
  created_at: string;
  estimated_days: number | null;
}

export interface PaintColor {
  id: string;
  project_id: string;
  name: string;
  code: string;
  hex_color: string;
  room: string;
  brand: string;
  status: 'pending' | 'approved' | 'rejected';
  is_selected: boolean;
  added_by: string;
  created_at: string;
}

// Helper to create activity
async function createActivity(
  userId: string,
  projectId: string,
  actionType: string,
  entityType: string,
  entityId: string,
  entityName: string
) {
  try {
    await supabase.from('activities').insert({
      user_id: userId,
      project_id: projectId,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
    });
  } catch (error) {
    console.error('Failed to create activity:', error);
  }
}

// Products
export function useProducts(projectId: string | null) {
  return useQuery({
    queryKey: ['products', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!projectId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      data: Omit<Product, 'id' | 'created_at' | 'added_by'>
    ) => {
      if (!user) throw new Error('Not authenticated');

      const { data: product, error } = await supabase
        .from('products')
        .insert({ ...data, added_by: user.id })
        .select()
        .single();

      if (error) throw error;

      // Track activity
      await createActivity(
        user.id,
        data.project_id,
        'created',
        'product',
        product.id,
        product.name
      );

      return product;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products', data.project_id] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Product> & { id: string }) => {
      const { data: product, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Track activity for status changes
      if (user && data.status) {
        const actionType =
          data.status === 'approved'
            ? 'approved'
            : data.status === 'rejected'
              ? 'rejected'
              : 'updated';
        await createActivity(
          user.id,
          product.project_id,
          actionType,
          'product',
          product.id,
          product.name
        );
      }

      return product;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products', data.project_id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      projectId,
      name,
    }: {
      id: string;
      projectId: string;
      name: string;
    }) => {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;

      // Track activity
      if (user) {
        await createActivity(
          user.id,
          projectId,
          'deleted',
          'product',
          id,
          name
        );
      }

      return { projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products', data.projectId] });
    },
  });
}

// Milestones
export function useMilestones(projectId: string | null) {
  return useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as Milestone[];
    },
    enabled: !!projectId,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      data: Omit<Milestone, 'id' | 'created_at'>
    ) => {
      const { data: milestone, error } = await supabase
        .from('milestones')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      // Track activity
      if (user) {
        await createActivity(
          user.id,
          data.project_id,
          'created',
          'milestone',
          milestone.id,
          milestone.title
        );
      }

      return milestone;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['milestones', data.project_id],
      });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Milestone> & { id: string }) => {
      const { data: milestone, error } = await supabase
        .from('milestones')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Track activity
      if (user) {
        const actionType =
          data.status === 'completed' ? 'completed' : 'updated';
        await createActivity(
          user.id,
          milestone.project_id,
          actionType,
          'milestone',
          milestone.id,
          milestone.title
        );
      }

      return milestone;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['milestones', data.project_id],
      });
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      projectId,
      name,
    }: {
      id: string;
      projectId: string;
      name: string;
    }) => {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Track activity
      if (user) {
        await createActivity(
          user.id,
          projectId,
          'deleted',
          'milestone',
          id,
          name
        );
      }

      return { id, projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['milestones', data.projectId],
      });
    },
  });
}

export function useReorderMilestones() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      milestones,
      projectId,
    }: {
      milestones: { id: string; sort_order: number }[];
      projectId: string;
    }) => {
      const updates = milestones.map((m) =>
        supabase
          .from('milestones')
          .update({ sort_order: m.sort_order })
          .eq('id', m.id)
      );

      await Promise.all(updates);
      return { projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['milestones', data.projectId],
      });
    },
  });
}

// Decisions
export function useDecisions(projectId: string | null) {
  return useQuery({
    queryKey: ['decisions', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Decision[];
    },
    enabled: !!projectId,
  });
}

export function useCreateDecision() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      data: Omit<Decision, 'id' | 'created_at' | 'requested_by'>
    ) => {
      if (!user) throw new Error('Not authenticated');

      const { data: decision, error } = await supabase
        .from('decisions')
        .insert({ ...data, requested_by: user.id })
        .select()
        .single();

      if (error) throw error;

      // Track activity
      await createActivity(
        user.id,
        data.project_id,
        'created',
        'decision',
        decision.id,
        decision.title
      );

      return decision;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['decisions', data.project_id],
      });
    },
  });
}

export function useUpdateDecision() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Decision> & { id: string }) => {
      const { data: decision, error } = await supabase
        .from('decisions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Track activity for status changes
      if (user && data.status) {
        const actionType =
          data.status === 'approved'
            ? 'approved'
            : data.status === 'rejected'
              ? 'rejected'
              : 'updated';
        await createActivity(
          user.id,
          decision.project_id,
          actionType,
          'decision',
          decision.id,
          decision.title
        );
      }

      return decision;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['decisions', data.project_id],
      });
    },
  });
}

export function useDeleteDecision() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      projectId,
      name,
    }: {
      id: string;
      projectId: string;
      name: string;
    }) => {
      const { error } = await supabase
        .from('decisions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Track activity
      if (user) {
        await createActivity(
          user.id,
          projectId,
          'deleted',
          'decision',
          id,
          name
        );
      }

      return { projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['decisions', data.projectId],
      });
    },
  });
}

// Cost Changes
export function useCostChanges(projectId: string | null) {
  return useQuery({
    queryKey: ['costChanges', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('cost_changes')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CostChange[];
    },
    enabled: !!projectId,
  });
}

export function useCreateCostChange() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      data: Omit<CostChange, 'id' | 'created_at' | 'created_by'>
    ) => {
      if (!user) throw new Error('Not authenticated');

      const { data: costChange, error } = await supabase
        .from('cost_changes')
        .insert({ ...data, created_by: user.id })
        .select()
        .single();

      if (error) throw error;

      // Track activity
      await createActivity(
        user.id,
        data.project_id,
        'created',
        'cost_change',
        costChange.id,
        costChange.title
      );

      return costChange;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['costChanges', data.project_id],
      });
    },
  });
}

export function useUpdateCostChange() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<CostChange> & { id: string }) => {
      const { data: costChange, error } = await supabase
        .from('cost_changes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Track activity for status changes
      if (user && data.status) {
        const actionType =
          data.status === 'approved'
            ? 'approved'
            : data.status === 'rejected'
              ? 'rejected'
              : 'updated';
        await createActivity(
          user.id,
          costChange.project_id,
          actionType,
          'cost_change',
          costChange.id,
          costChange.title
        );
      }

      return costChange;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['costChanges', data.project_id],
      });
    },
  });
}

export function useDeleteCostChange() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      projectId,
      name,
    }: {
      id: string;
      projectId: string;
      name: string;
    }) => {
      const { error } = await supabase
        .from('cost_changes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (user) {
        await createActivity(
          user.id,
          projectId,
          'deleted',
          'cost_change',
          id,
          name
        );
      }

      return { projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['costChanges', data.projectId],
      });
    },
  });
}

// Paint Colors
export function usePaintColors(projectId: string | null) {
  return useQuery({
    queryKey: ['paintColors', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('paint_colors')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PaintColor[];
    },
    enabled: !!projectId,
  });
}

export function useCreatePaintColor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      data: Omit<PaintColor, 'id' | 'created_at' | 'added_by'>
    ) => {
      if (!user) throw new Error('Not authenticated');

      const { data: paintColor, error } = await supabase
        .from('paint_colors')
        .insert({ ...data, added_by: user.id })
        .select()
        .single();

      if (error) throw error;

      // Track activity
      await createActivity(
        user.id,
        data.project_id,
        'created',
        'paint_color',
        paintColor.id,
        paintColor.name
      );

      return paintColor;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['paintColors', data.project_id],
      });
    },
  });
}

export function useUpdatePaintColor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<PaintColor> & { id: string }) => {
      const { data: paintColor, error } = await supabase
        .from('paint_colors')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Track activity for status changes
      if (user && data.status) {
        const actionType =
          data.status === 'approved'
            ? 'approved'
            : data.status === 'rejected'
              ? 'rejected'
              : 'updated';
        await createActivity(
          user.id,
          paintColor.project_id,
          actionType,
          'paint_color',
          paintColor.id,
          paintColor.name
        );
      }

      return paintColor;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['paintColors', data.project_id],
      });
    },
  });
}
