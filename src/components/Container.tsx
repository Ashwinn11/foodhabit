/**
 * Apple Design System - Container Component
 * Safe area aware container with Apple-style padding and background
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, r } from '../theme';

export type ContainerVariant = 'default' | 'grouped' | 'card' | 'plain';

export interface ContainerProps {
  /**
   * Container content
   */
  children: React.ReactNode;

  /**
   * Background variant
   * @default 'default'
   */
  variant?: ContainerVariant;

  /**
   * Enable safe area insets
   * @default true
   */
  safeArea?: boolean;

  /**
   * Enable scrolling
   * @default false
   */
  scrollable?: boolean;

  /**
   * Horizontal padding
   * @default true
   */
  padding?: boolean;

  /**
   * Center content vertically
   * @default false
   */
  center?: boolean;

  /**
   * Enable keyboard avoiding view
   * @default false
   */
  keyboardAvoiding?: boolean;

  /**
   * Custom style override
   */
  style?: ViewStyle;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  variant = 'default',
  safeArea = true,
  scrollable = false,
  padding = true,
  center = false,
  keyboardAvoiding = false,
  style,
}) => {
  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    padding && styles.padding,
    center && styles.center,
    style,
  ].filter(Boolean) as ViewStyle[];

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        center && styles.center,
      ]}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  if (safeArea) {
    return (
      <SafeAreaView style={containerStyle} edges={['top', 'left', 'right']}>
        {wrappedContent}
      </SafeAreaView>
    );
  }

  return <View style={containerStyle}>{wrappedContent}</View>;
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  padding: {
    paddingHorizontal: r.adaptiveSpacing.lg,
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Variants
  variant_default: {
    backgroundColor: theme.colors.background.primary,
  },

  variant_grouped: {
    backgroundColor: theme.colors.background.grouped,
  },

  variant_card: {
    backgroundColor: theme.colors.background.card,
  },

  variant_plain: {
    backgroundColor: 'transparent',
  },
});

export default Container;
