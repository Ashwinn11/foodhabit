/**
 * INotificationService
 * Port for notification/toast service
 */

export interface ToastOptions {
    message: string;
    icon?: string;
    iconColor?: string;
    duration?: number;
}

export interface NotificationOptions {
    title: string;
    body: string;
    type: 'achievement' | 'reminder' | 'alert' | 'info';
}

export interface INotificationService {
    /**
     * Show a toast message
     */
    showToast(options: ToastOptions): void;

    /**
     * Show an in-app notification
     */
    showNotification(options: NotificationOptions): void;

    /**
     * Show achievement notification
     */
    showAchievement(title: string, body: string): void;

    /**
     * Schedule a local push notification
     */
    scheduleNotification(
        title: string,
        body: string,
        triggerTime: Date
    ): Promise<string>;

    /**
     * Cancel a scheduled notification
     */
    cancelNotification(notificationId: string): Promise<void>;

    /**
     * Request notification permissions
     */
    requestPermissions(): Promise<boolean>;

    /**
     * Check if notifications are enabled
     */
    areNotificationsEnabled(): Promise<boolean>;
}
