import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';
import { authService } from '../services/authService';

export const ProfileScreen = () => {
  const { onboardingAnswers } = useAppStore();

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      // navigation.navigate('Auth');
    } catch (e) {
      console.error(e);
    }
  };

  const getConditionName = () => {
    const c = onboardingAnswers.condition;
    if (c === 'ibs_d') return 'IBS-D (Diarrhea)';
    if (c === 'ibs_c') return 'IBS-C (Constipation)';
    if (c === 'bloating') return 'Bloating & Gas';
    return 'Gut Sensitivity';
  };

  return (
    <Screen padding={true}>
      <Text variant="title" style={styles.title}>
        Profile
      </Text>

      <Card elevated={true} style={styles.card}>
        <View style={styles.row}>
          <Text variant="caption" style={styles.label}>Name:</Text>
          <Text variant="body" style={styles.value}>Ashwinn</Text>
        </View>
        <View style={styles.row}>
          <Text variant="caption" style={styles.label}>Condition:</Text>
          <Text variant="body" style={styles.value}>{getConditionName()}</Text>
        </View>
      </Card>

      <Card elevated={true} style={styles.card}>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text variant="caption" style={styles.label}>Subscription:</Text>
          <Text variant="body" style={[styles.value, { color: theme.colors.lime }]}>Pro (Active)</Text>
        </View>
      </Card>

      <View style={styles.footer}>
        <Button 
          label="Sign Out" 
          onPress={handleSignOut} 
          variant="ghost" 
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: theme.spacing.xxxl,
    marginTop: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surfaceHigh,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  label: {
    width: 100,
    color: theme.colors.textSecondary,
  },
  value: {
    flex: 1,
    color: theme.colors.textPrimary,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.xl,
  }
});
