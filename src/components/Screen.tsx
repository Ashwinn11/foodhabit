import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ViewStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padding?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({ 
  children, 
  scroll = false,
  padding = true,
  header,
  footer,
  backgroundColor,
  style,
}) => {
  const insets = useSafeAreaInsets();

  const contentStyle = [
    styles.content,
    {
      paddingLeft: padding ? theme.spacing.xl : 0,
      paddingRight: padding ? theme.spacing.xl : 0,
    },
    style,
  ];

  const content = scroll ? (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        contentStyle,
        { 
          paddingTop: header ? theme.spacing.md : (padding ? theme.spacing.xl : 0),
          paddingBottom: footer ? theme.spacing.md : (padding ? theme.spacing.xl : 0),
        }
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[
      styles.container, 
      contentStyle,
      { 
        paddingTop: header ? theme.spacing.md : (padding ? theme.spacing.xl : 0),
        paddingBottom: footer ? theme.spacing.md : (padding ? theme.spacing.xl : 0),
      }
    ]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.outer, { backgroundColor: backgroundColor || theme.colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, paddingTop: header ? 0 : insets.top }}>
          {header && (
            <View style={{ paddingTop: insets.top, paddingHorizontal: padding ? theme.spacing.xl : 0 }}>
              {header}
            </View>
          )}
          
          {content}
          
          {footer && (
            <View style={{ paddingBottom: theme.spacing.md, paddingHorizontal: padding ? theme.spacing.xl : 0 }}>
              {footer}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  }
});
