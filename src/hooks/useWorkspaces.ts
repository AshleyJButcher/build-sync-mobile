import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

/**
 * Workspace shape aligned with client-builder-sync (workspaces table).
 * Display name is `name`, derived from company_name for UI.
 */
export interface Workspace {
  id: string;
  owner_id: string | null;
  company_name: string | null;
  /** Display name (company_name or fallback); use this in UI. */
  name: string;
  created_at?: string;
  updated_at?: string;
  archived_at?: string | null;
}

/** Raw row from Supabase workspaces (client-builder-sync: company_name, etc.) */
type WorkspaceRow = Record<string, unknown> & { id: string };

function toWorkspace(row: WorkspaceRow): Workspace {
  const company_name =
    typeof (row as Record<string, unknown>).company_name === 'string'
      ? (row as Record<string, unknown>).company_name as string
      : null;
  const name =
    company_name ??
    (typeof row.name === 'string' ? row.name : null) ??
    (typeof row.title === 'string' ? row.title : null) ??
    (typeof (row as Record<string, unknown>).workspace_name === 'string'
      ? (row as Record<string, unknown>).workspace_name as string
      : null) ??
    row.id;
  return {
    id: row.id,
    owner_id: typeof row.owner_id === 'string' ? row.owner_id : null,
    company_name,
    name,
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
    updated_at: typeof row.updated_at === 'string' ? row.updated_at : undefined,
    archived_at:
      row.archived_at != null && typeof row.archived_at === 'string'
        ? row.archived_at
        : null,
  };
}

function isArchived(row: WorkspaceRow): boolean {
  const a = row.archived_at;
  return a != null && a !== '';
}

/**
 * Fetches workspaces the current user can access: owned + member.
 * Aligned with client-builder-sync useAllWorkspaces:
 * - workspaces table: id, owner_id, company_name, created_at, updated_at, archived_at
 * - owned: workspaces where owner_id = user.id, archived_at null
 * - member: workspace_members join workspaces for user_id = user.id
 * - merged, archived excluded, sorted by company_name.
 */
export function useWorkspaces() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workspaces', user?.id],
    queryFn: async (): Promise<Workspace[]> => {
      if (!user?.id) return [];

      const byId = new Map<string, Workspace>();

      // 1) Owned workspaces (owner_id = user, not archived)
      const { data: ownedData, error: ownedError } = await supabase
        .from('workspaces')
        .select('id, owner_id, company_name, created_at, updated_at, archived_at')
        .eq('owner_id', user.id)
        .is('archived_at', null);

      if (ownedError) {
        console.warn('[useWorkspaces] owned', ownedError.message);
      } else {
        const rows = (ownedData || []) as WorkspaceRow[];
        rows.filter((r) => !isArchived(r)).forEach((r) => byId.set(r.id, toWorkspace(r)));
      }

      // 2) Member workspaces (via workspace_members; nested key is "workspaces")
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id, workspaces(id, owner_id, company_name, created_at, updated_at, archived_at)')
        .eq('user_id', user.id);

      if (memberError) {
        console.warn('[useWorkspaces] member', memberError.message);
      } else {
        const rows = (memberData || []) as Array<{
          workspace_id?: string;
          workspaces?: WorkspaceRow | WorkspaceRow[] | null;
        }>;
        for (const row of rows) {
          const w = row.workspaces;
          if (Array.isArray(w)) {
            w.filter((x): x is WorkspaceRow => x != null && typeof x === 'object' && 'id' in x && !isArchived(x))
              .forEach((x) => byId.set(x.id, toWorkspace(x)));
          } else if (w != null && typeof w === 'object' && 'id' in w && !isArchived(w)) {
            byId.set(w.id, toWorkspace(w));
          }
        }
      }

      return Array.from(byId.values()).sort((a, b) =>
        (a.company_name ?? a.id).localeCompare(b.company_name ?? b.id)
      );
    },
    enabled: !!user?.id,
  });
}
