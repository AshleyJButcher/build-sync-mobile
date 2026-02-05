import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorkspaceState {
  selectedWorkspaceId: string | null;
  setSelectedWorkspace: (workspaceId: string | null) => void;
  clearSelectedWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      selectedWorkspaceId: null,
      setSelectedWorkspace: (workspaceId: string | null) => {
        set({ selectedWorkspaceId: workspaceId });
      },
      clearSelectedWorkspace: () => {
        set({ selectedWorkspaceId: null });
      },
    }),
    {
      name: 'workspace-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedWorkspaceId: state.selectedWorkspaceId,
      }),
    }
  )
);
