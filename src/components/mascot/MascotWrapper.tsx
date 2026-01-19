import React from 'react';
import { View, ViewStyle } from 'react-native';

interface MascotWrapperProps {
  size: number;
  style?: ViewStyle;
  children: React.ReactNode;
}

/**
 * Standardized wrapper for all mascot SVGs to ensure consistent sizing
 * All mascots will render in a square container with the SVG centered
 */
export default function MascotWrapper({ size, style, children }: MascotWrapperProps) {
  return (
    <View 
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible', // Allow animated parts to move outside the box
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
