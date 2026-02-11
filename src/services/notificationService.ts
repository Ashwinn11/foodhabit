import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications should be handled when the app is running
Notifications.setNotificationHandler({
    handleNotification: async (_notification: Notifications.Notification) => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const requestNotificationPermissions = async () => {
    if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return true;
};

export const scheduleDailyReminder = async (hour: number, minute: number) => {
    // Cancel all existing notifications first to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "How's your gut feeling today? 🧐",
            body: "Time for your daily check-in! Logging regularly helps identify patterns.",
            data: { screen: 'AddEntry' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour,
            minute,
            repeats: true,
        } as Notifications.NotificationTriggerInput,
    });
};

export const triggerLocalNotification = async (title: string, body: string, data?: any) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data: data || {},
        },
        trigger: null, // deliver immediately
    });
};

export const getPushToken = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    try {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        return token;
    } catch (e) {
        console.log('Error getting push token:', e);
        return null;
    }
};

export const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};
