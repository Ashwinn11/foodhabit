import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { theme } from '../theme/theme';

export const HomeScreen = ({ navigation }: any) => {

  const handleScanAction = () => {
    navigation.navigate('ScanFood');
  };

  const openLogSheet = () => {
    // We will trigger bottom sheet state here from useAppStore or local
  };

  return (
    <Screen padding={true} scroll={true}>
      <Text variant="title" style={styles.greeting}>
        Good morning, Ash
      </Text>

      <View style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>AVOID TODAY</Text>
        <View style={styles.chipStack}>
          <View style={styles.chipWrapper}>
            <Chip status="risky" label="🧄 Garlic" />
          </View>
          <View style={styles.chipWrapper}>
            <Chip status="risky" label="🥛 Dairy" />
          </View>
          <View style={styles.chipWrapper}>
            <Chip status="risky" label="🧅 Onion" />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>SAFE CHOICES</Text>
        <View style={styles.chipStack}>
          <View style={styles.chipWrapper}>
            <Chip status="safe" label="🍚 Rice" />
          </View>
          <View style={styles.chipWrapper}>
            <Chip status="safe" label="🍗 Chicken" />
          </View>
          <View style={styles.chipWrapper}>
            <Chip status="safe" label="🥣 Oats" />
          </View>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <Button 
          label="📷 SCAN FOOD" 
          onPress={handleScanAction}
          variant="primary" 
        />
        <TouchableOpacity style={styles.logLink} onPress={openLogSheet}>
          <Text variant="label" style={styles.logText}>Log How I Feel →</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  greeting: {
    marginBottom: theme.spacing.giant,
    marginTop: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xxxl,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    letterSpacing: 1,
  },
  chipStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipWrapper: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  actionContainer: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.xl,
  },
  logLink: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  logText: {
    color: theme.colors.coral,
  }
});
