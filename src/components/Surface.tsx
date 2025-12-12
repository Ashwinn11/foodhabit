import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { theme } from '../theme';

export interface SurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Defines the elevation of the surface, which also dictates the shadow.
   * 'none' will remove shadows. 'flat' will apply a very subtle shadow.
   */
  elevation?: 'none' | 'flat' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * Background color of the surface. Defaults to theme.colors.background.card.
   */
  backgroundColor?: string;
  /**
   * Border radius of the surface. Defaults to theme.borderRadius.md.
   */
  borderRadius?: keyof typeof theme.borderRadius | number;
}

export const Surface: React.FC<SurfaceProps> = ({
  children,
  style,
  contentContainerStyle,
  elevation = 'md',
  backgroundColor = theme.colors.background.card,
  borderRadius = 'md',
}) => {
  const resolvedBorderRadius = typeof borderRadius === 'string'
    ? theme.borderRadius[borderRadius]
    : borderRadius;

  const shadowStyle = elevation === 'none' ? theme.shadows.none : theme.shadows[elevation];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor,
          borderRadius: resolvedBorderRadius,
        },
        shadowStyle,
        style,
      ]}
    >
      <View style={[styles.content, contentContainerStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'visible', // Ensure shadows are not clipped
  },
  content: {
    flex: 1,
    // Android requires overflow hidden on content to respect borderRadius with elevation
    ...Platform.select({
      android: {
        overflow: 'hidden',
      },
    }),
  },
});