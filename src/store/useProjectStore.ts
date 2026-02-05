import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProjectState {
  selectedProjectId: string | null;
  setSelectedProject: (projectId: string | null) => void;
  clearSelectedProject: () => void;
  projectMenuOpen: boolean;
  setProjectMenuOpen: (open: boolean) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      selectedProjectId: null,
      setSelectedProject: (projectId: string | null) => {
        set({ selectedProjectId: projectId });
      },
      clearSelectedProject: () => {
        set({ selectedProjectId: null });
      },
      projectMenuOpen: false,
      setProjectMenuOpen: (open: boolean) => {
        set({ projectMenuOpen: open });
      },
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedProjectId: state.selectedProjectId,
      }),
    }
  )
);
