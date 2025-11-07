/**
 * Apple Design System - Text Component
 * Typography component with Apple's text hierarchy
 */

import React from 'react';
import {
  Text as RNText,
  TextStyle,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'button'
  | 'buttonLarge'
  | 'buttonSmall'
  | 'label'
  | 'labelSmall'
  | 'caption'
  | 'footnote';

export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'disabled' | 'inverse' | 'placeholder';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextWeight = 'light' | 'regular' | 'medium' | 'semiBold' | 'bold';

export interface TextProps {
  /**
   * Text content
   */
  children: React.ReactNode;

  /**
   * Typography variant
   * @default 'body'
   */
  variant?: TextVariant;

  /**
   * Text color from Apple's label hierarchy
   * @default 'primary'
   */
  color?: TextColor;

  /**
   * Text alignment
   */
  align?: TextAlign;

  /**
   * Font weight override
   */
  weight?: TextWeight;

  /**
   * Number of lines to display
   */
  numberOfLines?: number;

  /**
   * Custom style override
   */
  style?: TextStyle;

  /**
   * onPress handler
   */
  onPress?: () => void;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  align,
  weight,
  numberOfLines,
  style,
  onPress,
}) => {
  const textStyle: TextStyle[] = [
    styles[`variant_${variant}`],
    styles[`color_${color}`],
    align && { textAlign: align },
    weight && { fontFamily: theme.fontFamily[weight] },
    style,
  ];

  return (
    <RNText
      style={textStyle}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  // Variants
  variant_h1: theme.typography.h1,
  variant_h2: theme.typography.h2,
  variant_h3: theme.typography.h3,
  variant_h4: theme.typography.h4,
  variant_h5: theme.typography.h5,
  variant_h6: theme.typography.h6,
  variant_subtitle1: theme.typography.subtitle1,
  variant_subtitle2: theme.typography.subtitle2,
  variant_body: theme.typography.body,
  variant_bodyLarge: theme.typography.bodyLarge,
  variant_bodySmall: theme.typography.bodySmall,
  variant_button: theme.typography.button,
  variant_buttonLarge: theme.typography.buttonLarge,
  variant_buttonSmall: theme.typography.buttonSmall,
  variant_label: theme.typography.label,
  variant_labelSmall: theme.typography.labelSmall,
  variant_caption: theme.typography.caption,
  variant_footnote: theme.typography.footnote,

  // Colors
  color_primary: {
    color: theme.colors.text.primary,
  },
  color_secondary: {
    color: theme.colors.text.secondary,
  },
  color_tertiary: {
    color: theme.colors.text.tertiary,
  },
  color_quaternary: {
    color: theme.colors.text.quaternary,
  },
  color_disabled: {
    color: theme.colors.text.disabled,
  },
  color_inverse: {
    color: theme.colors.text.inverse,
  },
  color_placeholder: {
    color: theme.colors.text.placeholder,
  },
});

export default Text;
