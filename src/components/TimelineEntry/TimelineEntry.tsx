import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { IconContainer } from '../IconContainer/IconContainer';
import { colors, spacing, radii, shadows, fontSizes, fonts, moodIcons, foodCategories } from '../../theme';
import { MealEntry } from '../../store';

interface TimelineEntryProps {
  entry: MealEntry;
  style?: ViewStyle;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({ entry, style }) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toUpperCase();
  };
  
  const getMealConfig = (type: string) => {
    const config = foodCategories[type as keyof typeof foodCategories] || foodCategories.snack;
    
    // Map meal types to core colors
    let saturatedColor: string = colors.pink;
    switch (type) {
      case 'breakfast': saturatedColor = colors.blue; break;
      case 'lunch': saturatedColor = colors.yellow; break; // Using yellow for lunch
      case 'dinner': saturatedColor = colors.pink; break;
      case 'snack': saturatedColor = colors.pink; break;
      case 'drink': saturatedColor = colors.blue; break;
    }
    
    return { ...config, saturatedColor };
  };

  const config = getMealConfig(entry.mealType);
  
  const iconName = entry.mood ? moodIcons[entry.mood] : config.icon;
  
  return (
    <View style={[styles.container, style]}>
      {/* Timeline dot using IconContainer */}
      <View style={styles.timelineColumn}>
        <View style={styles.line} />
        <IconContainer 
          name={iconName as any} 
          size={44} 
          color={config.saturatedColor} 
          borderColor={config.saturatedColor}
          shape="circle"
        />
      </View>
      
      {/* Content card */}
      <View style={styles.contentCard}>
        <View style={styles.header}>
          <Text style={styles.title}>{entry.name}</Text>
          <Text style={[styles.time, { color: config.saturatedColor }]}>{formatTime(entry.timestamp)}</Text>
        </View>
        
        {entry.description && (
          <Text style={styles.description}>{entry.description}</Text>
        )}
        
        {entry.foods.length > 0 && (
          <Text style={styles.foods}>
            {entry.foods.join(' • ')}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 50,
  },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2.5,
    ...shadows.sm,
    zIndex: 1,
  },
  line: {
    position: 'absolute',
    top: -spacing.lg,
    bottom: -spacing.lg,
    width: 2,
    backgroundColor: colors.border,
    zIndex: 0,
  },
  contentCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginLeft: spacing.md,
    ...shadows.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading, // Chewy
    color: colors.black,
    flex: 1,
  },
  time: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bodyBold,
  },
  description: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.black + '99',
    marginTop: spacing.xs,
  },
  foods: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.black + '66',
    marginTop: spacing.xs,
  },
  moodBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
});
