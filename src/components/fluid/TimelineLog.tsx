import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme/theme';
import { Text } from '../Text';
import { Icon3D } from '../Icon3D';
import { Card } from '../Card';
import { Chip } from '../Chip';

interface TimelineLogProps {
  logs: { meals: any[]; gutLogs: any[] };
}

export const TimelineLog: React.FC<TimelineLogProps> = ({ logs }) => {
  // Combine, sort, and format
  const allEvents = [
    ...logs.meals.map(m => ({ type: 'meal', time: new Date(m.timestamp), data: m })),
    ...logs.gutLogs.map(g => ({ type: 'gut', time: new Date(g.timestamp), data: g }))
  ].sort((a, b) => b.time.getTime() - a.time.getTime());

  if (allEvents.length === 0) {
    return (
      <View style={styles.empty}>
        <Icon3D name="spiral_calendar" size={56} animated animationType="float" />
        <Text variant="body" color={theme.colors.textTertiary} align="center">
          Nothing logged on this day
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {allEvents.map((event, i) => {
        const isMeal = event.type === 'meal';
        const isGut = event.type === 'gut';
        
        let glowColor = 'transparent';
        if (isGut) {
          glowColor = event.data.mood === 'happy' ? theme.colors.safeMuted : 
                      event.data.mood === 'sad' ? theme.colors.dangerMuted : theme.colors.cautionMuted;
        }

        return (
          <Animated.View 
            key={i} 
            entering={FadeInDown.delay(i * 100).springify()}
            style={styles.eventRow}
          >
            {/* Timeline line & dot */}
            <View style={styles.timelineCol}>
              <View style={styles.timelineLineTop} />
              <View style={[styles.dot, isGut ? { backgroundColor: theme.colors.primary } : {}]} />
              {i < allEvents.length - 1 && <View style={styles.timelineLineBottom} />}
            </View>

            {/* Event Card */}
            <View style={styles.cardCol}>
              <LinearGradient
                colors={[glowColor, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.glowBg}
              />
              <Card variant="bordered" style={styles.eventCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleRow}>
                    <Icon3D 
                      name={
                        isMeal ? 'pizza' : 
                        event.data.mood === 'happy' ? 'face_with_smile' : 
                        event.data.mood === 'sad' ? 'face_with_head_bandage' : 'neutral_face'
                      } 
                      size={24} 
                    />
                    <Text variant="bodySmall" style={styles.titleText}>
                      {isMeal ? (event.data.name || 'Meal') : 'Gut Moment'}
                    </Text>
                  </View>
                  <Text variant="caption" color={theme.colors.textTertiary}>
                    {event.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </View>

                {isMeal && event.data.foods?.length > 0 && (
                  <View style={styles.chipRow}>
                    {event.data.foods.map((food: string, index: number) => (
                      <Chip key={index} label={food} size="sm" variant="selectable" />
                    ))}
                  </View>
                )}

                {isGut && event.data.tags?.length > 0 && (
                  <View style={styles.chipRow}>
                    {event.data.tags.map((tag: string, index: number) => (
                      <Chip key={index} label={tag} size="sm" variant="selectable" />
                    ))}
                  </View>
                )}
              </Card>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  cardCol: {
    flex: 1,
    paddingBottom: theme.spacing.md,
    position: 'relative',
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  container: {
    paddingVertical: theme.spacing.sm,
  },
  dot: {
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    height: 12,
    marginTop: 24,
    width: 12,
    zIndex: 1,
  },
  empty: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  eventCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  eventRow: {
    flexDirection: 'row',
  },
  glowBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.lg,
    opacity: 0.5,
  },
  timelineCol: {
    alignItems: 'center',
    width: 32,
  },
  timelineLineBottom: {
    backgroundColor: theme.colors.border,
    bottom: 0,
    flex: 1,
    position: 'absolute',
    top: 36,
    width: 2,
  },
  timelineLineTop: {
    backgroundColor: theme.colors.border,
    height: 24,
    position: 'absolute',
    top: 0,
    width: 2,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  titleText: {
    fontFamily: theme.fonts.bold,
  }
});
