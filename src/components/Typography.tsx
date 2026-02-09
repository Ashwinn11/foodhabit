import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes } from '../theme/theme';

export type TypographyVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' 
  | 'body' | 'bodyBold' | 'bodySmall' | 'bodyXS'
  | 'caption';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Typography: React.FC<TypographyProps> = ({ 
  variant = 'body', 
  color = colors.black, 
  align = 'left',
  style, 
  children, 
  ...props 
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'h1':
        return styles.h1;
      case 'h2':
        return styles.h2;
      case 'h3':
        return styles.h3;
      case 'h4':
        return styles.h4;
      case 'bodyBold':
        return styles.bodyBold;
      case 'bodySmall':
        return styles.bodySmall;
      case 'bodyXS':
        return styles.bodyXS;
      case 'caption':
        return styles.caption;
      case 'body':
      default:
        return styles.body;
    }
  };

  return (
    <Text 
      style={[
        getVariantStyle(), 
        { color, textAlign: align }, 
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  body: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    lineHeight: 24,
  },
  bodyBold: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.md,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
  bodyXS: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    lineHeight: 18,
  },
  caption: {
    color: colors.black + '66',
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    lineHeight: 16,
  },
  h1: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['4xl'],
    lineHeight: 42,
  },
  h2: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['3xl'],
    lineHeight: 36,
  },
  h3: {
    fontFamily: fonts.heading,
    fontSize: fontSizes['2xl'],
    lineHeight: 28,
  },
  h4: {
    fontFamily: fonts.heading,
    fontSize: fontSizes.lg,
    lineHeight: 24,
  },
});
