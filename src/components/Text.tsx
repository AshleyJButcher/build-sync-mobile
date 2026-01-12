import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '../theme';

type TextVariant =
  | 'header'
  | 'subheader'
  | 'headingLarge'
  | 'headingMedium'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'button';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  children: React.ReactNode;
}

export function Text({ variant = 'body', style, children, ...props }: TextProps) {
  const theme = useTheme<Theme>();
  const textVariant = theme.textVariants[variant];

  return (
    <RNText
      style={[
        {
          fontSize: textVariant.fontSize,
          fontWeight: textVariant.fontWeight,
          color: theme.colors.text,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
