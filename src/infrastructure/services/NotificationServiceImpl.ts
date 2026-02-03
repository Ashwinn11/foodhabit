/**
 * NotificationServiceImpl
 * Implementation of INotificationService using existing stores
 */
import { INotificationService, ToastOptions, NotificationOptions } from '../../application/ports/services';

// These will be set by the DI container setup
let toastFn: ((options: ToastOptions) => void) | null = null;
let notificationFn: ((options: NotificationOptions) => void) | null = null;

/**
 * Set the toast function (called during app initialization)
 */
export function setToastFunction(fn: (options: ToastOptions) => void): void {
    toastFn = fn;
}

/**
 * Set the notification function (called during app initialization)
 */
export function setNotificationFunction(fn: (options: NotificationOptions) => void): void {
    notificationFn = fn;
}

export class NotificationServiceImpl implements INotificationService {
    showToast(options: ToastOptions): void {
        if (toastFn) {
            toastFn(options);
        } else {
            console.warn('Toast function not set');
        }
    }

    showNotification(options: NotificationOptions): void {
        if (notificationFn) {
            notificationFn(options);
        } else {
            console.warn('Notification function not set');
        }
    }

    showAchievement(title: string, body: string): void {
        this.showNotification({
            title,
            body,
            type: 'achievement',
        });
    }

    async scheduleNotification(
        title: string,
        _body: string,
        triggerTime: Date
    ): Promise<string> {
        // This would integrate with Expo Notifications
        // For now, return a placeholder ID
        console.log('Scheduling notification:', title, 'for', triggerTime);
        return `notification_${Date.now()}`;
    }

    async cancelNotification(notificationId: string): Promise<void> {
        console.log('Cancelling notification:', notificationId);
    }

    async requestPermissions(): Promise<boolean> {
        // Would integrate with Expo Notifications
        return true;
    }

    async areNotificationsEnabled(): Promise<boolean> {
        return true;
    }
}
