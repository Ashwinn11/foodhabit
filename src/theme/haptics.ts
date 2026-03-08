import * as Haptics from 'expo-haptics';

export const haptics = {
    mealLogged: (): Promise<void> => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    sliderTick: (): Promise<void> => Haptics.selectionAsync(),
    badgeRevealed: (): Promise<void> => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    streakMilestone: (): Promise<void> => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    triggerWarning: (): Promise<void> => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    buttonTap: (): Promise<void> => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
} as const;
