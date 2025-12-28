import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Gigi } from '../../components';
import { theme } from '../../theme';
interface PlanStepProps {
  onComplete: () => void;
}

export const PlanStep: React.FC<PlanStepProps> = ({ onComplete }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Gigi emotion="happy-cute" size="md" />
        <Text variant="title2" style={styles.title}>Your Custom Plan</Text>
        <Text variant="body" style={styles.subtitle}>
          Based on your goal to <Text weight="bold" style={{color: theme.colors.brand.coral}}>Improve Digestion</Text>:
        </Text>

        <View style={styles.timeline}>
          <TimelineItem 
            day="Week 1" 
            title="Understanding Your Baseline" 
            desc="Track 5 meals a day to identify triggers." 
            active
          />
          <TimelineItem 
            day="Week 2" 
            title="Fiber Optimization" 
            desc="Gradually increase plant intake." 
          />
          <TimelineItem 
            day="Week 4" 
            title="Gut Mastery" 
            desc="Enjoy food without fear!" 
            isLast
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Start My Plan" 
          onPress={onComplete} 
          variant="primary" 
          size="large" 
          fullWidth 
        />
      </View>
    </View>
  );
};

const TimelineItem = ({ day, title, desc, active, isLast }: any) => (
  <View style={styles.timelineItem}>
    <View style={styles.leftCol}>
      <View style={[styles.dot, active && styles.activeDot]} />
      {!isLast && <View style={styles.line} />}
    </View>
    <View style={styles.rightCol}>
      <Text variant="caption1" style={styles.dayLabel}>{day}</Text>
      <Text variant="headline" style={styles.itemTitle}>{title}</Text>
      <Text variant="body" style={styles.itemDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    overflow: 'visible',
  },
  title: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.white,
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeline: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  leftCol: {
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    width: 20,
  },
  rightCol: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: theme.colors.brand.background,
    zIndex: 1,
  },
  activeDot: {
    backgroundColor: theme.colors.brand.coral,
    borderColor: theme.colors.brand.coral,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: -4,
  },
  dayLabel: {
    color: theme.colors.brand.coral,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemTitle: {
    color: theme.colors.text.white,
    marginBottom: 4,
  },
  itemDesc: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  footer: {
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },
});
