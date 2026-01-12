import { createTheme } from '@shopify/restyle';

const palette = {
  primary: '#4CAF50', // Green primary color
  secondary: '#2196F3',
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  surface: '#F8F9FA',
  text: '#2D3436',
  textSecondary: '#636E72',
  textOnPrimary: '#FFFFFF',
  border: '#DFE6E9',
  success: '#4CAF50',
  error: '#FF7675',
  warning: '#FDCB6E',
};

const darkPalette = {
  primary: '#66BB6A',
  secondary: '#42A5F5',
  background: '#1A1A1A',
  backgroundSecondary: '#2D2D2D',
  surface: '#2D2D2D',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textOnPrimary: '#FFFFFF',
  border: '#404040',
  success: '#66BB6A',
  error: '#FF7675',
  warning: '#FDCB6E',
};

export const lightTheme = createTheme({
  colors: {
    ...palette,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadii: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
  textVariants: {
    header: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    subheader: {
      fontSize: 18,
      fontWeight: '600',
    },
    headingLarge: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    headingMedium: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    bodyLarge: {
      fontSize: 18,
    },
    bodyMedium: {
      fontSize: 16,
    },
    body: {
      fontSize: 16,
    },
    bodySmall: {
      fontSize: 14,
    },
    caption: {
      fontSize: 14,
    },
    button: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  },
});

export const darkTheme = createTheme({
  colors: {
    ...darkPalette,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadii: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
  textVariants: {
    header: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    subheader: {
      fontSize: 18,
      fontWeight: '600',
    },
    headingLarge: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    headingMedium: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    bodyLarge: {
      fontSize: 18,
    },
    bodyMedium: {
      fontSize: 16,
    },
    body: {
      fontSize: 16,
    },
    bodySmall: {
      fontSize: 14,
    },
    caption: {
      fontSize: 14,
    },
    button: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  },
});

export type Theme = typeof lightTheme & { colors: { textOnPrimary: string } };
