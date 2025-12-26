import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: false,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('daut-reminders', {
            name: 'Daily Reminders',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
    }

    // token = (await Notifications.getExpoPushTokenAsync()).data;
    // console.log(token);

    await scheduleDailyReminder();

    return token;
}

export async function scheduleDailyReminder() {
    // Cancel existing notifications to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule for 12:00 PM (Lunch)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "How's your gut feeling? 🦠",
            body: "Don't forget to scan your lunch with Gigi!",
            sound: true,
        },
        trigger: {
            hour: 12,
            minute: 0,
            repeats: true,
        } as any,
    });

    // Schedule for 7:00 PM (Dinner)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Dinner time! 🥗",
            body: "Scan your meal to keep your streak alive!",
            sound: true,
        },
        trigger: {
            hour: 19,
            minute: 0,
            repeats: true,
        } as any,
    });

    // Schedule for 7:00 PM (Dinner)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Dinner time! 🥗",
            body: "Scan your meal to keep your streak alive!",
            sound: true,
        },
        trigger: {
            hour: 12,
            minute: 0,
            repeats: true,
        } as any,
    });
}
