import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../theme';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useProjectStore } from '../store/useProjectStore';

interface MenuOption {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const menuOptions: MenuOption[] = [
  { label: 'Dashboard', icon: 'home-outline', route: '/(tabs)' },
  { label: 'Products', icon: 'cube-outline', route: '/(tabs)/products' },
  { label: 'Milestones', icon: 'flag-outline', route: '/(tabs)/milestones' },
  { label: 'Decisions', icon: 'checkmark-circle-outline', route: '/(tabs)/decisions' },
  { label: 'Costs', icon: 'trending-up-outline', route: '/(tabs)/cost-changes' },
];

const MENU_WIDTH = 280;

function isRouteActive(pathname: string, optionRoute: string): boolean {
  const normalized = (pathname ?? '').replace(/\/$/, '') || '';
  const route = optionRoute.replace(/\/$/, '');
  const segment = route.split('/').filter(Boolean).pop() ?? '';
  if (route === '/(tabs)' || segment === 'index') {
    return ['', '/(tabs)', '/(tabs)/index', '/'].includes(normalized) || normalized.endsWith('/index');
  }
  return normalized === route || normalized.endsWith('/' + segment) || normalized === segment;
}

export function ProjectSideMenu() {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const pathname = usePathname();
  const { projectMenuOpen, setProjectMenuOpen } = useProjectStore();
  const [isClosing, setIsClosing] = useState(false);
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const modalVisible = projectMenuOpen || isClosing;

  useEffect(() => {
    if (projectMenuOpen) {
      setIsClosing(false);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setIsClosing(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsClosing(false);
      });
    }
  }, [projectMenuOpen, slideAnim, overlayOpacity]);

  const handleNavigate = (route: string) => {
    setProjectMenuOpen(false);
    router.push(route as any);
  };

  const handleClose = () => {
    setProjectMenuOpen(false);
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents={modalVisible ? 'auto' : 'none'}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
          pointerEvents="auto"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.menuPanel,
            {
              backgroundColor: theme.colors.background,
              width: MENU_WIDTH,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={[styles.menuHeader, { borderBottomColor: theme.colors.border }]}>
            <Text variant="headingMedium" style={[styles.menuTitle, { color: theme.colors.text }]}>
              Project
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.menuList}>
            {menuOptions.map((option) => {
              const isCurrent = isRouteActive(pathname ?? '', option.route);
              return (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.menuItem,
                    {
                      backgroundColor: isCurrent ? `${GREEN_PRIMARY}15` : 'transparent',
                      borderLeftColor: isCurrent ? GREEN_PRIMARY : 'transparent',
                    },
                  ]}
                  onPress={() => handleNavigate(option.route)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={isCurrent ? GREEN_PRIMARY : theme.colors.textSecondary}
                  />
                  <Text
                    variant="body"
                    style={[
                      styles.menuItemLabel,
                      {
                        color: isCurrent ? GREEN_PRIMARY : theme.colors.text,
                        fontWeight: isCurrent ? '600' : '400',
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  menuPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
  },
  menuTitle: {
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
  menuList: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderLeftWidth: 4,
  },
  menuItemLabel: {
    fontSize: 16,
  },
});
