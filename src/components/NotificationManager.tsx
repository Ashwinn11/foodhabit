import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { useNotificationStore, Notification } from '../store/useNotificationStore';

export const NotificationManager = () => {
    const navigation = useNavigation<any>();
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        // Handle notifications when the app is foregrounded
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            const { title, body } = notification.request.content;
            const data = notification.request.content.data;
            
            // Add to our in-app store
            addNotification({
                title: title || 'New Notification',
                body: body || '',
                type: (data?.type as Notification['type']) || 'reminder'
            });
        });

        // Handle when a user taps on a notification
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            
            if (data?.screen) {
                navigation.navigate(data.screen, data.params);
            } else {
                navigation.navigate('Notifications');
            }
        });

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, [navigation, addNotification]);

    return null; // This component doesn't render anything
};
