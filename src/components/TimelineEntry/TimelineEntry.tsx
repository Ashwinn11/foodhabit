import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { IconContainer } from '../IconContainer/IconContainer';
import { Typography } from '../Typography';
import { Card } from '../Card';
import { colors, spacing, foodCategories, bristolColors } from '../../theme/theme';
import { MealEntry, GutMoment } from '../../store';

interface TimelineEntryProps {
  item: MealEntry | GutMoment;
  style?: ViewStyle;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({ item, style }) => {
  const isMeal = (entry: MealEntry | GutMoment): entry is MealEntry => {
    return 'mealType' in entry;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toUpperCase();
  };

  if (isMeal(item)) {
    const config = foodCategories[item.mealType as keyof typeof foodCategories] || foodCategories.snack;
    
    let saturatedColor: string = colors.pink;
    switch (item.mealType) {
      case 'breakfast': saturatedColor = colors.blue; break;
      case 'lunch': saturatedColor = colors.yellow; break;
      case 'dinner': saturatedColor = colors.green; break;
      case 'snack': saturatedColor = colors.pink; break;
      case 'drink': saturatedColor = colors.blue; break;
    }

    const iconName = config.icon;

    return (
      <View style={[styles.container, style]}>
        <View style={styles.timelineColumn}>
          <View style={styles.line} />
          <IconContainer 
            name={iconName as any} 
            size={44} 
            color={saturatedColor} 
            variant="solid"
            shape="circle"
          />
        </View>
        
        <Card variant="white" style={styles.contentCard} padding="lg">
          <View style={styles.header}>
            <Typography variant="h3" style={{ flex: 1 }}>{item.name}</Typography>
            <Typography variant="bodyXS" color={saturatedColor === colors.yellow ? colors.black : saturatedColor} style={{ fontFamily: 'Fredoka-SemiBold' }}>
              {formatTime(item.timestamp)}
            </Typography>
          </View>
          
          <Typography variant="bodyXS" color={colors.black + '66'} style={{ marginTop: spacing.xs }}>
            {item.foods.join(' • ')}
          </Typography>
        </Card>
      </View>
    );
  }

  // Poop Log (GutMoment)
  const bristolColor = item.bristolType 
    ? (bristolColors[`type${item.bristolType}` as keyof typeof bristolColors] || colors.pink)
    : colors.pink;
    
  const activeSymptoms = Object.entries(item.symptoms)
    .filter(([_, active]) => active)
    .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.timelineColumn}>
        <View style={styles.line} />
        <IconContainer 
          name="happy-outline" 
          size={44} 
          color={colors.pink} 
          variant="solid"
          shape="circle"
        />
      </View>
      
      <Card variant="colored" color={colors.pink} style={styles.contentCard} padding="lg">
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Typography variant="h3">Poop Log</Typography>
            <IconContainer name="water" size={20} iconSize={14} color={colors.pink} variant="transparent" shadow={false} />
          </View>
          <Typography variant="bodyXS" color={colors.pink} style={{ fontFamily: 'Fredoka-SemiBold' }}>
            {formatTime(item.timestamp)}
          </Typography>
        </View>
        
        <View style={styles.detailsRow}>
          {item.bristolType && (
            <View style={[styles.bristolBadge, { backgroundColor: bristolColor }]}>
              <Typography variant="bodyXS" color={colors.white}>Type {item.bristolType}</Typography>
            </View>
          )}
        </View>

        {activeSymptoms.length > 0 && (
          <Typography variant="bodyXS" color={colors.pink} style={{ marginTop: spacing.xs }}>
             Symptoms: {activeSymptoms.join(', ')}
          </Typography>
        )}

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map(tag => (
              <View key={tag} style={styles.tagBadge}>
                <Typography variant="bodyXS" color={colors.pink}>{tag}</Typography>
              </View>
            ))}
          </View>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  bristolBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  container: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  contentCard: {
    flex: 1,
    marginLeft: spacing.md,
  },
  detailsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  line: {
    backgroundColor: colors.border,
    bottom: -spacing.lg,
    position: 'absolute',
    top: -spacing.lg,
    width: 2,
    zIndex: 0,
  },
  tagBadge: {
    backgroundColor: colors.pink + '15',
    borderColor: colors.pink + '30',
    borderRadius: 4,
    borderWidth: 0.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 50,
  },
});
