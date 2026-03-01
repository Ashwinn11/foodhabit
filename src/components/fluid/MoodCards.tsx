import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../theme/theme';
import { Text } from '../Text';
import { Icon3D } from '../Icon3D';
import { Card } from '../Card';

export type Mood = 'happy' | 'neutral' | 'sad';

interface MoodCardsProps {
    onMoodSelect: (mood: Mood) => void;
}

const MOODS: { id: Mood; icon: 'face_with_smile' | 'neutral_face' | 'face_with_sad'; label: string }[] = [
    { id: 'happy', icon: 'face_with_smile', label: 'Good' },
    { id: 'neutral', icon: 'neutral_face', label: 'OK' },
    { id: 'sad', icon: 'face_with_sad', label: 'Rough' },
];

const MoodCardItem: React.FC<{
    mood: typeof MOODS[number];
    onPress: () => void;
}> = ({ mood, onPress }) => {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    return (
        <View style={styles.cardWrapper}>
            <Card
                variant="glass"
                pressable
                onPress={handlePress}
                style={styles.moodCard}
            >
                <Icon3D name={mood.icon} size={38} />
                <Text
                    variant="caption"
                    color={theme.colors.textSecondary}
                    style={styles.moodLabel}
                >
                    {mood.label}
                </Text>
            </Card>
        </View>
    );
};

/**
 * Three tappable glass mood cards in a row.
 * Replaces the old FluidMoodSlider for better discoverability and ease of use.
 */
export const MoodCards: React.FC<MoodCardsProps> = ({ onMoodSelect }) => {
    return (
        <View style={styles.container}>
            <Text
                variant="bodySmall"
                color={theme.colors.textSecondary}
                style={styles.title}
            >
                How's your gut?
            </Text>
            <View style={styles.row}>
                {MOODS.map((mood) => (
                    <MoodCardItem
                        key={mood.id}
                        mood={mood}
                        onPress={() => onMoodSelect(mood.id)}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    title: {
        fontFamily: theme.fonts.semibold,
    },
    row: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    cardWrapper: {
        flex: 1,
    },
    moodCard: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.xs,
    },
    moodLabel: {
        fontFamily: theme.fonts.medium,
    },
});
