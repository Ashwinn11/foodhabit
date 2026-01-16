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
      case 'dinner': saturatedColor = colors.pink; break;
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
            color={saturatedColor === colors.yellow ? colors.black : colors.white} 
            backgroundColor={saturatedColor}
            borderColor={saturatedColor}
            shape="circle"
          />
        </View>
        
        <Card variant="white" style={styles.contentCard} padding="lg">
          <View style={styles.header}>
            <Typography variant="h3" style={{ flex: 1 }}>{item.name}</Typography>
            <Typography variant="bodyXS" color={saturatedColor === colors.yellow ? colors.black : saturatedColor} style={{ fontFamily: 'Chewy' }}>
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
          color={colors.white} 
          backgroundColor={colors.pink}
          borderColor={colors.pink}
          shape="circle"
        />
      </View>
      
      <Card variant="colored" color={colors.pink} style={styles.contentCard} padding="lg">
        <View style={styles.header}>
          <Typography variant="h3" style={{ flex: 1 }}>Bowel Movement</Typography>
          <Typography variant="bodyXS" color={colors.pink} style={{ fontFamily: 'Chewy' }}>
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
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bristolBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tagBadge: {
    backgroundColor: colors.pink + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.pink + '30',
  },
});
