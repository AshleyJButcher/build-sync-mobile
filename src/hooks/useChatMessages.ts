import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

export interface ChatMessage {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  photo_urls?: string[] | null;
}

export function useChatMessages(projectId: string | null) {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!projectId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`chat-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            ['chat-messages', projectId],
            (old: ChatMessage[] = []) => {
              // Avoid duplicates
              if (old.some((m) => m.id === payload.new.id)) return old;
              return [...old, payload.new as ChatMessage];
            }
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            ['chat-messages', projectId],
            (old: ChatMessage[] = []) =>
              old.map((m) => (m.id === payload.new.id ? (payload.new as ChatMessage) : m))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            ['chat-messages', projectId],
            (old: ChatMessage[] = []) =>
              old.filter((m) => m.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  return { messages, isLoading };
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
      content,
      photoUrls,
    }: {
      projectId: string;
      userId: string;
      content: string;
      photoUrls?: string[];
    }) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          project_id: projectId,
          user_id: userId,
          content: content.trim(),
          photo_urls: photoUrls && photoUrls.length > 0 ? photoUrls : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chat-messages', variables.projectId],
      });
    },
  });
}

export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      content,
      projectId,
    }: {
      messageId: string;
      content: string;
      projectId: string;
    }) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .update({ content: content.trim() })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chat-messages', variables.projectId],
      });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      projectId,
    }: {
      messageId: string;
      projectId: string;
    }) => {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chat-messages', variables.projectId],
      });
    },
  });
}
