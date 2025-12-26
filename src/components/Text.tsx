import React from 'react';
import { Text as RNText, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { theme } from '../theme';

export type TextVariant =
  | 'largeTitle' | 'title1' | 'title2' | 'title3'
  | 'headline' | 'body' | 'callout' | 'subheadline'
  | 'footnote' | 'caption1' | 'caption2';

export type TextColor = 'primary' | 'secondary' | 'tertiary';
export type TextAlign = 'left' | 'center' | 'right';
export type TextWeight = 'light' | 'regular' | 'medium' | 'semiBold' | 'bold';

export interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  align?: TextAlign;
  weight?: TextWeight;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
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
  const textStyle: StyleProp<TextStyle> = [
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

  color_primary: { color: theme.colors.text.white },
  color_secondary: { color: theme.colors.text.white },
  color_tertiary: { color: theme.colors.text.white },
});

export default Text;
