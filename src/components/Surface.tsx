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
  /**
   * Alignment of children along the cross-axis.
   */
  align?: ViewStyle['alignItems'];
  /**
   * Alignment of children along the main-axis.
   */
  justify?: ViewStyle['justifyContent'];
  /**
   * Flex direction of the children.
   */
  flexDirection?: ViewStyle['flexDirection'];
  /**
   * Border color of the surface.
   */
  borderColor?: string;
  /**
   * Border width of the surface.
   */
  borderWidth?: number;
}

export const Surface: React.FC<SurfaceProps> = ({
  children,
  style,
  contentContainerStyle,
  elevation = 'md',
  backgroundColor = theme.colors.background.card,
  borderRadius = 'md',
  align,
  justify,
  flexDirection,
  borderColor,
  borderWidth,
}) => {
  const resolvedBorderRadius = typeof borderRadius === 'string'
    ? theme.borderRadius[borderRadius as keyof typeof theme.borderRadius]
    : borderRadius;

  const shadowKey = elevation as keyof typeof theme.shadows;
  const shadowStyle = elevation === 'none' ? theme.shadows.none : theme.shadows[shadowKey];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor,
          borderRadius: resolvedBorderRadius,
          borderColor,
          borderWidth,
        },
        shadowStyle,
        style,
      ]}
    >
      <View 
        style={[
          styles.content, 
          { 
            alignItems: align, 
            justifyContent: justify, 
            flexDirection: flexDirection 
          }, 
          contentContainerStyle
        ]}
      >
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
    width: '100%',
    // Android requires overflow hidden on content to respect borderRadius with elevation
    ...Platform.select({
      android: {
        overflow: 'hidden',
      },
    }),
  },
});