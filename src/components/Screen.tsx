import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padding?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({ 
  children, 
  scroll = false,
  padding = true
}) => {
  const insets = useSafeAreaInsets();

  const contentStyle = [
    styles.content,
    {
      paddingTop: insets.top + (padding ? theme.spacing.xl : 0),
      paddingBottom: insets.bottom + (padding ? theme.spacing.xl : 0),
      paddingLeft: padding ? theme.spacing.xl : 0,
      paddingRight: padding ? theme.spacing.xl : 0,
    }
  ];

  const content = scroll ? (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, contentStyle]}>
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.background}>
        {content}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  }
});
