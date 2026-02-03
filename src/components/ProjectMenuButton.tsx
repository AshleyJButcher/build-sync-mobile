import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useProjectStore } from '../store/useProjectStore';

export function ProjectMenuButton() {
  const theme = useTheme<Theme>();
  const { setProjectMenuOpen } = useProjectStore();

  return (
    <TouchableOpacity
      onPress={() => setProjectMenuOpen(true)}
      style={styles.button}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityLabel="Open project menu"
      accessibilityRole="button"
    >
      <Ionicons name="menu" size={26} color={theme.colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    marginRight: 8,
  },
});
