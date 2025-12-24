/**
 * TabBar Component
 * Reusable horizontal tab navigation
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import Text from './Text';

interface TabBarProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const tabValue = tab.toLowerCase();
        const isActive = activeTab.toLowerCase() === tabValue;
        
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(tabValue)}
            activeOpacity={0.7}
          >
            <Text
              variant="subheadline"
              weight={isActive ? 'bold' : 'semiBold'}
              style={{
                color: isActive ? theme.colors.brand.white : theme.colors.text.secondary,
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.pill,
    marginHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.pill,
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: theme.colors.brand.primary,
    ...theme.shadows.sm,
  },
});
