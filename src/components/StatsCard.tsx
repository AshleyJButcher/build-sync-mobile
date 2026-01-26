import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme, GREEN_PRIMARY } from '../theme';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: 'default' | 'primary';
  onPress?: () => void;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  onPress,
}: StatsCardProps) {
  const theme = useTheme<Theme>();

  const isPrimary = variant === 'primary';

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.card,
        {
          backgroundColor: isPrimary ? GREEN_PRIMARY : theme.colors.background,
          borderColor: isPrimary ? GREEN_PRIMARY : theme.colors.border,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text
            variant="caption"
            style={[
              styles.title,
              {
                color: isPrimary ? '#FFFFFF' : theme.colors.textSecondary,
                opacity: isPrimary ? 0.9 : 1,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            variant="headingLarge"
            style={[
              styles.value,
              { color: isPrimary ? '#FFFFFF' : theme.colors.text },
            ]}
          >
            {value}
          </Text>
          {subtitle && (
            <Text
              variant="caption"
              style={[
                styles.subtitle,
                {
                  color: isPrimary ? '#FFFFFF' : theme.colors.textSecondary,
                  opacity: isPrimary ? 0.8 : 1,
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isPrimary
                ? 'rgba(255, 255, 255, 0.2)'
                : theme.colors.backgroundSecondary,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={24}
            color={isPrimary ? '#FFFFFF' : theme.colors.textSecondary}
          />
        </View>
      </View>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    minHeight: 100,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
