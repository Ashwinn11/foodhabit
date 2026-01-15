import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows } from '../../theme/theme';

export interface IconContainerProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  shape?: 'circle' | 'square' | 'rounded';
  shadow?: boolean;
  outline?: boolean;
  style?: ViewStyle;
}

/**
 * A reusable icon container component that supports various shapes, 
 * borders, and shadow styles. Ideal for section headers, timeline dots,
 * and menu buttons.
 */
export const IconContainer: React.FC<IconContainerProps> = ({
  name,
  size = 44,
  iconSize,
  color = colors.blue,
  backgroundColor = colors.white,
  borderColor,
  borderWidth = 1,
  shape = 'circle',
  shadow = true,
  outline = false,
  style,
}) => {
  const calculatedIconSize = iconSize || size * 0.5;
  const iconName = outline && !name.includes('-outline') ? `${name}-outline` : name;
  
  const getBorderRadius = () => {
    if (backgroundColor === 'transparent' && borderWidth === 0) return 0;
    switch (shape) {
      case 'circle': return size / 2;
      case 'rounded': return radii.lg;
      case 'square': return 0;
      default: return size / 2;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: getBorderRadius(),
          backgroundColor,
          borderColor: borderColor || colors.border,
          borderWidth: backgroundColor === 'transparent' && !borderColor ? 0 : borderWidth,
        },
        shadow && backgroundColor !== 'transparent' && shadows.sm,
        style,
      ]}
    >
      <Ionicons name={iconName as any} size={calculatedIconSize} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
