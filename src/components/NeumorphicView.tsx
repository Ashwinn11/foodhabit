import React from 'react';
import { View, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../theme';
import { neumorphicShadows } from '../theme/spacing';

export interface NeumorphicViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  size?: 'sm' | 'md' | 'lg';
  inset?: boolean; // Concave effect
  glass?: boolean; // Glassmorphism effect
}

export const NeumorphicView: React.FC<NeumorphicViewProps> = ({
  children,
  style,
  contentContainerStyle,
  size = 'md',
  inset = false,
  glass = false,
}) => {
  const shadowConfig = neumorphicShadows[size];
  
  // Extract borderRadius and backgroundColor from style
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const borderRadius = flattenedStyle.borderRadius ?? theme.borderRadius.md;
  
  // STRICT: Neumorphism REQUIRES the base color to match the background
  // We default to the theme base color.
  const backgroundColor = flattenedStyle.backgroundColor ?? theme.colors.neumorphism.base;

  // Remove backgroundColor from container style to avoid double background
  const { backgroundColor: _, ...containerStyle } = flattenedStyle;

  if (Platform.OS === 'android') {
    // Android Fallback
    // Convex: Elevation + Border
    // Concave: Border (inverted colors if possible) + No Elevation
    return (
      <View style={[
        styles.androidContainer,
        {
          elevation: inset ? 0 : (size === 'sm' ? 2 : size === 'md' ? 4 : 8),
          backgroundColor: glass ? 'rgba(255,255,255,0.1)' : backgroundColor,
          borderRadius,
          borderColor: inset ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.5)',
          borderWidth: 1,
        },
        containerStyle,
      ]}>
        <View style={[styles.content, { borderRadius }, contentContainerStyle]}>
          {children}
        </View>
      </View>
    );
  }

  if (inset) {
    // Concave (Pressed/Input) State
    // We simulate this by inverting the shadows or using a border-based inner shadow trick
    // For simplicity and performance, we'll use the "concave" preset which inverts the offsets
    // and applies them as outer shadows but with a specific z-index trick or just visual inversion
    // Actually, true inner shadows need a mask. For now, we'll use the inverted outer shadow 
    // to simulate the light source change, which looks like a depression.
    return (
      <View style={[styles.container, { borderRadius }, containerStyle]}>
        {/* Dark Shadow (Top Left for Concave) */}
        <View style={[
          styles.layer,
          {
            borderRadius,
            backgroundColor,
            shadowColor: theme.colors.neumorphism.darkShadow,
            ...neumorphicShadows.concave.dark,
          }
        ]} />

        {/* Light Shadow (Bottom Right for Concave) */}
        <View style={[
          styles.layer,
          {
            borderRadius,
            backgroundColor,
            shadowColor: theme.colors.neumorphism.lightShadow,
            ...neumorphicShadows.concave.light,
          }
        ]} />

        {/* Content Layer */}
        <View style={[styles.content, { borderRadius, backgroundColor }, contentContainerStyle]}>
          {children}
        </View>
      </View>
    );
  }

  // Convex (Default) State
  const renderSurface = () => {
    if (glass) {
      return (
        <BlurView
          intensity={50}
          tint="light"
          style={[styles.content, { borderRadius }, contentContainerStyle]}
        >
          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', flex: 1 }}>
            {children}
          </View>
        </BlurView>
      );
    }

    // Subtle Gradient for 3D curvature
    // Top-left is slightly lighter, bottom-right slightly darker to match light source
    return (
      <LinearGradient
        colors={['#1F2A3A', '#151D2A']} // Subtle shift around #1A2332
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.content, { borderRadius }, contentContainerStyle]}
      >
        {children}
      </LinearGradient>
    );
  };

  return (
    <View style={[styles.container, { borderRadius }, containerStyle]}>
      {/* Light Shadow Layer */}
      <View style={[
        styles.layer,
        {
          borderRadius,
          backgroundColor,
          shadowColor: theme.colors.neumorphism.lightShadow,
          ...shadowConfig.light,
        }
      ]} />

      {/* Dark Shadow Layer */}
      <View style={[
        styles.layer,
        {
          borderRadius,
          backgroundColor,
          shadowColor: theme.colors.neumorphism.darkShadow,
          ...shadowConfig.dark,
        }
      ]} />

      {/* Content Layer */}
      {renderSurface()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Ensure shadows are not clipped
    overflow: 'visible',
  },
  androidContainer: {
    overflow: 'hidden',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
});
