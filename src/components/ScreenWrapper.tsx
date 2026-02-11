import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { colors } from '../theme/theme';

interface ScreenWrapperProps extends SafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  useGradient?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  contentContainerStyle,
  useGradient = true,
  ...safeAreaProps
}) => {

  if (useGradient) {
    return (
        <SafeAreaView style={[styles.safeArea, contentContainerStyle]} {...safeAreaProps}>
          {children}
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }, style]} 
      {...safeAreaProps}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
