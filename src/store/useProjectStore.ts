import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProjectState {
  selectedProjectId: string | null;
  setSelectedProject: (projectId: string | null) => void;
  clearSelectedProject: () => void;
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
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
