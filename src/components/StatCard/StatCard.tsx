import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows, fontSizes, fonts } from '../../theme';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, unit, color, icon, style }) => {
  // Use the color passed as the primary accent color.
  // If no color, default to yellow.
  const accentColor = color || colors.yellow;
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: accentColor + '15', // 8% opacity for soft background
        borderColor: accentColor,
      }, 
      style
    ]}>
      {icon && <Ionicons name={icon as any} size={20} color={accentColor} style={styles.icon} />}
      <Text style={[styles.label, { color: colors.black }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.black }]}>{value}</Text>
        {unit && <Text style={[styles.unit, { color: colors.black }]}>{unit}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii['2xl'],
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 95,
    ...shadows.sm,
    borderWidth: 2.5, // Increased for more 'pop'
  },
  icon: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 2,
    opacity: 0.9, // Higher opacity for visibility
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  value: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading, // Chewy
  },
  unit: {
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    marginLeft: 2,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
});
