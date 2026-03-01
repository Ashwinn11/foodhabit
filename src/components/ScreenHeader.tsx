import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';
import { Text } from './Text';

interface ScreenHeaderProps {
    title: string;
    /** Optional slot rendered to the right of the title */
    right?: React.ReactNode;
    /** Optional slot rendered below the title row (e.g. segmented tabs) */
    below?: React.ReactNode;
    style?: ViewStyle;
}

/**
 * Consistent top header used across all main app screens.
 * – Title is always an h3 on the left.
 * – `right` accepts any icon/action buttons.
 * – `below` accepts segmented tab controls or other sub-header content.
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    right,
    below,
    style,
}) => {
    return (
        <View style={[styles.header, style]}>
            <View style={styles.titleRow}>
                <Text variant="h3" style={styles.title}>{title}</Text>
                {right && <View style={styles.rightSlot}>{right}</View>}
            </View>
            {below && <View style={styles.belowRow}>{below}</View>}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.xs,
        paddingBottom: theme.spacing.sm,
        gap: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderSubtle,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 40,
    },
    title: {
        fontFamily: theme.fonts.bold,
        flex: 1,
    },
    rightSlot: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginLeft: theme.spacing.md,
    },
    belowRow: {
        // no extra padding — consumer controls it
    },
});
