import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { ProjectSideMenu } from '../../src/components/ProjectSideMenu';
import { OfflineBanner } from '../../src/components/OfflineBanner';
import { useWorkspaces } from '../../src/hooks/useWorkspaces';
import { useWorkspaceStore } from '../../src/store/useWorkspaceStore';
import { useProjectStore } from '../../src/store/useProjectStore';
import { useProject } from '../../src/hooks/useProjects';

function CustomTabBar(props: React.ComponentProps<typeof BottomTabBar>) {
  return (
    <View>
      <OfflineBanner />
      <ProjectSideMenu />
      <BottomTabBar {...props} />
    </View>
  );
}

function DefaultWorkspaceSetter() {
  const { data: workspaces = [] } = useWorkspaces();
  const { selectedWorkspaceId, setSelectedWorkspace } = useWorkspaceStore();
  const { selectedProjectId } = useProjectStore();
  const { data: selectedProject, isFetched: selectedProjectFetched } = useProject(selectedProjectId);

  useEffect(() => {
    if (workspaces.length === 0 || selectedWorkspaceId != null) return;
    if (selectedProjectId && !selectedProjectFetched) return;

    const workspaceIdToSet =
      selectedProject?.workspace_id && workspaces.some((w) => w.id === selectedProject.workspace_id)
        ? selectedProject.workspace_id
        : workspaces[0].id;

    setSelectedWorkspace(workspaceIdToSet);
  }, [workspaces, selectedWorkspaceId, selectedProjectId, selectedProject?.workspace_id, selectedProjectFetched, setSelectedWorkspace]);

  return null;
}

export default function TabsLayout() {
  return (
    <>
      <DefaultWorkspaceSetter />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#636E72',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          href: null, // Hide from tab bar but keep as route
        }}
      />
      <Tabs.Screen
        name="drawings"
        options={{
          href: null, // Hide from tab bar but keep as route
        }}
      />
      <Tabs.Screen
        name="milestones"
        options={{
          href: null, // Hide from tab bar but keep as route
        }}
      />
      <Tabs.Screen
        name="decisions"
        options={{
          href: null, // Hide from tab bar but keep as route
        }}
      />
      <Tabs.Screen
        name="cost-changes"
        options={{
          href: null, // Hide from tab bar but keep as route
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Open from bell icon in header
        }}
      />
      <Tabs.Screen
        name="remedial"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="project-members"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null, // Per-project chat: access via side menu
        }}
      />
    </Tabs>
    </>
  );
}
