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

/**
 * Apple's Semantic Text Styles
 * Prefer semantic styles over legacy h1-h6
 */
export type TextVariant =
  // Apple's semantic text styles (preferred)
  | 'largeTitle'   // 34pt - Main page headings
  | 'title1'       // 28pt - Primary section headings
  | 'title2'       // 22pt - Secondary section headings
  | 'title3'       // 20pt - Tertiary headings
  | 'headline'     // 17pt - Emphasized content
  | 'body'         // 17pt - Main body text (most common)
  | 'callout'      // 16pt - Supplementary text
  | 'subheadline'  // 15pt - List subtitles
  | 'footnote'     // 13pt - Small informational text
  | 'caption1'     // 12pt - Very small text
  | 'caption2'     // 11pt - Smallest readable text
  | 'bodyEmphasized'    // 17pt Medium - Emphasized body
  | 'calloutEmphasized' // 16pt Medium - Emphasized callout
  // Legacy styles (mapped to semantic styles)
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'subtitle1' | 'subtitle2'
  | 'bodyLarge' | 'bodySmall'
  | 'button' | 'buttonLarge' | 'buttonSmall'
  | 'label' | 'labelSmall'
  | 'caption';

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
   * Use semantic styles for better clarity:
   * - largeTitle, title1-3: Headings
   * - headline: Emphasized content
   * - body: Main text (default and most common)
   * - callout: Secondary text
   * - subheadline: List details
   * - footnote, caption1-2: Small text
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
  ].filter(Boolean) as TextStyle[];

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
  // Apple's Semantic Text Styles (preferred)
  variant_largeTitle: theme.typography.largeTitle,
  variant_title1: theme.typography.title1,
  variant_title2: theme.typography.title2,
  variant_title3: theme.typography.title3,
  variant_headline: theme.typography.headline,
  variant_body: theme.typography.body,
  variant_callout: theme.typography.callout,
  variant_subheadline: theme.typography.subheadline,
  variant_footnote: theme.typography.footnote,
  variant_caption1: theme.typography.caption1,
  variant_caption2: theme.typography.caption2,
  variant_bodyEmphasized: theme.typography.bodyEmphasized,
  variant_calloutEmphasized: theme.typography.calloutEmphasized,

  // Legacy styles (mapped to semantic styles)
  variant_h1: theme.typography.h1,
  variant_h2: theme.typography.h2,
  variant_h3: theme.typography.h3,
  variant_h4: theme.typography.h4,
  variant_h5: theme.typography.h5,
  variant_h6: theme.typography.h6,
  variant_subtitle1: theme.typography.subtitle1,
  variant_subtitle2: theme.typography.subtitle2,
  variant_bodyLarge: theme.typography.bodyLarge,
  variant_bodySmall: theme.typography.bodySmall,
  variant_button: theme.typography.button,
  variant_buttonLarge: theme.typography.buttonLarge,
  variant_buttonSmall: theme.typography.buttonSmall,
  variant_label: theme.typography.label,
  variant_labelSmall: theme.typography.labelSmall,
  variant_caption: theme.typography.caption,

  // Colors (Apple's label hierarchy)
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
