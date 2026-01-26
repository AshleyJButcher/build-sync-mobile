import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../theme';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

interface TabOption {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const tabOptions: TabOption[] = [
  {
    label: 'Products',
    icon: 'cube-outline',
    route: '/(tabs)/products',
  },
  {
    label: 'Milestones',
    icon: 'flag-outline',
    route: '/(tabs)/milestones',
  },
  {
    label: 'Decisions',
    icon: 'checkmark-circle-outline',
    route: '/(tabs)/decisions',
  },
  {
    label: 'Costs',
    icon: 'trending-up-outline',
    route: '/(tabs)/cost-changes',
  },
];

export function ProjectTabBar() {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.backgroundSecondary,
          borderTopColor: theme.colors.border,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        alwaysBounceHorizontal={false}
        bounces={false}
      >
        {tabOptions.map((option) => {
          const isActive = pathname === option.route;
          
          return (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive
                    ? `${GREEN_PRIMARY}15`
                    : 'transparent',
                  borderBottomColor: isActive ? GREEN_PRIMARY : 'transparent',
                },
              ]}
              onPress={() => handleNavigate(option.route)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={option.icon}
                size={22}
                color={isActive ? GREEN_PRIMARY : theme.colors.textSecondary}
              />
              <Text
                variant="bodySmall"
                style={[
                  styles.tabLabel,
                  {
                    color: isActive
                      ? GREEN_PRIMARY
                      : theme.colors.textSecondary,
                    fontWeight: isActive ? '600' : '400',
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 4,
    alignItems: 'stretch',
  },
  tab: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    borderBottomWidth: 2,
    minWidth: 80,
    maxWidth: 100,
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});
