import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { IconContainer } from '../IconContainer/IconContainer';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { colors, spacing } from '../../theme/theme';
import { moodIcons, foodCategories } from '../../theme/theme';
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
      <Card variant="white" style={styles.contentCard} padding="lg">
        <View style={styles.header}>
          <Typography variant="h3" style={{ flex: 1 }}>{entry.name}</Typography>
          <Typography variant="bodyXS" color={config.saturatedColor} style={{ fontFamily: 'Chewy' }}>
            {formatTime(entry.timestamp)}
          </Typography>
        </View>
        
        {entry.description && (
          <Typography variant="bodySmall" color={colors.black + '99'} style={{ marginTop: spacing.xs }}>
            {entry.description}
          </Typography>
        )}
        
        {entry.foods.length > 0 && (
          <Typography variant="bodyXS" color={colors.black + '66'} style={{ marginTop: spacing.xs }}>
            {entry.foods.join(' • ')}
          </Typography>
        )}
      </Card>
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
    marginLeft: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  moodBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
});
