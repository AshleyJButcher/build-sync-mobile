import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
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
  const baseStyle: TextStyle = {
    fontSize: textVariant.fontSize,
    color: theme.colors.text,
  };
  if ('fontWeight' in textVariant && typeof textVariant.fontWeight === 'string') {
    baseStyle.fontWeight = textVariant.fontWeight as TextStyle['fontWeight'];
  }

  return (
    <RNText style={[baseStyle, style]} {...props}>
      {children}
    </RNText>
  );
}
