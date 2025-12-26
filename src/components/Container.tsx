import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { theme } from '../theme';

export interface ContainerProps {
  children: React.ReactNode;
  safeArea?: boolean;
  edges?: Edge[];
  scrollable?: boolean;
  center?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  safeArea = true,
  edges = ['top', 'left', 'right'],
  scrollable = false,
  center = false,
  style,
  contentContainerStyle,
}) => {
  const containerStyle: ViewStyle = {
    ...styles.container,
    ...(center ? styles.center : {}),
    ...(style || {}),
  };

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, center && styles.center, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  if (safeArea) {
    return (
      <SafeAreaView style={containerStyle} edges={edges}>
        {content}
      </SafeAreaView>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brand.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Container;
