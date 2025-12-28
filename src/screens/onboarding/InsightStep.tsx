import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Gigi } from '../../components';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface InsightStepProps {
  onComplete: () => void;
  type: 'symptoms' | 'solution' | 'features';
}

export const InsightStep: React.FC<InsightStepProps> = ({ onComplete, type }) => {
  
  const renderContent = () => {
    switch (type) {
      case 'symptoms':
        return (
          <>
            <Gigi emotion="shock-awe" size="md" />
            <Text variant="title2" style={styles.title}>
              We noticed you're struggling with bloating.
            </Text>
            <Text variant="body" style={styles.text}>
              Bloating is often a sign of reduced gut microbiome diversity. But don't worry, we can fix this together!
            </Text>
            <View style={styles.statCard}>
              <Text variant="headline" style={styles.statNumber}>87%</Text>
              <Text variant="caption1" style={styles.statLabel}>of users feel better in 2 weeks</Text>
            </View>
          </>
        );
      case 'solution':
        return (
          <>
            <Gigi emotion="happy-cute" size="md" />
            <Text variant="title2" style={styles.title}>
              Meet Your New Gut Coach
            </Text>
            <Text variant="body" style={styles.text}>
              I'm Gigi! I'll analyze every meal and give you instant feedback to heal your gut.
            </Text>
            {/* Mock Chat Bubble */}
            <View style={styles.chatBubble}>
              <Text variant="body" style={{ color: theme.colors.brand.black }}>
                "That smoothie looks great, but let's add some flax seeds for fiber!"
              </Text>
            </View>
          </>
        );
      case 'features':
        return (
          <>
            <Text variant="title2" style={styles.title}>
              Everything you need
            </Text>
            <View style={styles.featureList}>
              <FeatureRow icon="scan" text="Instant Food Scanner" />
              <FeatureRow icon="list" text="Personalized Plans" />
              <FeatureRow icon="chatbubbles" text="24/7 AI Support" />
            </View>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mainContent}>
          {renderContent()}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Continue" onPress={onComplete} variant="primary" size="large" fullWidth />
      </View>
    </View>
  );
};

const FeatureRow = ({ icon, text }: { icon: any, text: string }) => (
  <View style={styles.featureRow}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={24} color={theme.colors.brand.coral} />
    </View>
    <Text variant="headline" style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  mainContent: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    color: theme.colors.text.white,
  },
  text: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Glassy
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    color: theme.colors.brand.teal,
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    color: theme.colors.text.white,
    marginTop: 4,
  },
  chatBubble: {
    backgroundColor: theme.colors.brand.cream,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: 0,
    marginTop: theme.spacing.lg,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  featureList: {
    width: '100%',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  featureText: {
    color: theme.colors.text.white,
  },
  footer: {
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },
});
