import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../theme/theme';

export interface CardProps extends ViewProps {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  elevated = false,
  style, 
  children, 
  ...props 
}) => {
  return (
    <View 
      style={[
        styles.card,
        { backgroundColor: elevated ? theme.colors.surfaceHigh : theme.colors.surface },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
  }
});
