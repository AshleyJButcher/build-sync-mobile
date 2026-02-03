import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';
import { type Theme } from '../theme';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleTryAgain = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          onTryAgain={this.handleTryAgain}
        />
      );
    }
    return this.props.children;
  }
}

interface FallbackProps {
  error: Error;
  onTryAgain: () => void;
}

function ErrorFallback({ error, onTryAgain }: FallbackProps) {
  const theme = useTheme<Theme>();
  const router = useRouter();

  const goHome = () => {
    router.replace('/(tabs)');
    onTryAgain();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: `${theme.colors.error}20` }]}>
          <Ionicons name="warning-outline" size={48} color={theme.colors.error} />
        </View>
        <Text variant="headingMedium" style={[styles.title, { color: theme.colors.text }]}>
          Something went wrong
        </Text>
        <Text
          variant="body"
          style={[styles.message, { color: theme.colors.textSecondary }]}
          numberOfLines={3}
        >
          {error.message || 'An unexpected error occurred.'}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, { backgroundColor: theme.colors.primary }]}
            onPress={onTryAgain}
          >
            <Text variant="button" style={styles.buttonText}>
              Try again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, { borderColor: theme.colors.border }]}
            onPress={goHome}
          >
            <Text variant="button" style={[styles.buttonTextSecondary, { color: theme.colors.text }]}>
              Go home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    width: '100%',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {},
  buttonSecondary: {
    borderWidth: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },
});
