import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows } from '../../theme/theme';

export interface IconContainerProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  iconSize?: number;
  color?: string; // The primary theme color
  backgroundColor?: string; // Optional override
  borderColor?: string;
  borderWidth?: number;
  shape?: 'circle' | 'square' | 'rounded';
  shadow?: boolean;
  outline?: boolean;
  variant?: 'solid' | 'transparent';
  style?: ViewStyle;
}

/**
 * A reusable icon container component that supports Solid and Transparent states.
 * Solid: Solid background color with a contrasting icon (white/black).
 * Transparent: Transparent background with a colored icon.
 */
export const IconContainer: React.FC<IconContainerProps> = ({
  name,
  size = 44,
  iconSize,
  color = colors.blue,
  backgroundColor,
  borderColor,
  borderWidth = 0,
  shape = 'circle',
  shadow = false,
  outline = false,
  variant,
  style,
}) => {
  const calculatedIconSize = iconSize || size * 0.5;
  const iconName = outline && !name.includes('-outline') ? `${name}-outline` : name;
  
  // Determine if it's truly solid or transparent
  // If variant is not provided, we infer from backgroundColor
  const finalVariant = variant || (backgroundColor === 'transparent' ? 'transparent' : 'solid');
  
  let finalBgColor = backgroundColor;
  let finalIconColor = color;

  if (finalVariant === 'solid') {
    finalBgColor = backgroundColor || color;
    // Contrast logic: use black for yellow, white for others.
    // However, if the background is explicitly set to white, use the primary color for the icon.
    // If the primary color is also white, default to black for visibility.
    if (finalBgColor === colors.white) {
      finalIconColor = color === colors.white ? colors.black : color;
    } else if (finalBgColor === colors.yellow) {
      finalIconColor = colors.black;
    } else {
      finalIconColor = colors.white;
    }
  } else {
    finalBgColor = backgroundColor || 'transparent';
    finalIconColor = color;
  }

  const getBorderRadius = () => {
    if (finalBgColor === 'transparent' && borderWidth === 0) return 0;
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
          backgroundColor: finalBgColor,
          borderColor: borderColor || (variant === 'transparent' ? color : 'transparent'),
          borderWidth: borderWidth,
        },
        shadow && finalBgColor !== 'transparent' && shadows.sm,
        style,
      ]}
    >
      <Ionicons name={iconName as any} size={calculatedIconSize} color={finalIconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
