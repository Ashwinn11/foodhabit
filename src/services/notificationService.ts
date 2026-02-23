import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  requestPermissions: async (): Promise<boolean> => {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  schedulePostMealCheckIn: async (mealName: string): Promise<void> => {
    try {
      const granted = await notificationService.requestPermissions();
      if (!granted) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "How's your gut feeling?",
          body: `You had ${mealName} a couple hours ago. Log how you feel — it helps find your triggers.`,
          data: { screen: 'Home' },
        },
        trigger: { seconds: 2.5 * 60 * 60, repeats: false } as any,
      });
    } catch {
      // Notifications are optional — never block the user
    }
  },

  cancelAll: async (): Promise<void> => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {}
  },
};
