import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
    id: string;
    title: string;
    body: string;
    timestamp: string;
    read: boolean;
    type: 'achievement' | 'reminder' | 'insight' | 'alert';
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            notifications: [
                {
                    id: '1',
                    title: 'Welcome to Gut Buddy! 👋',
                    body: "We're glad you're here. Start by logging your first meal or gut moment!",
                    timestamp: new Date().toISOString(),
                    read: false,
                    type: 'reminder'
                }
            ],
            unreadCount: 1,

            addNotification: (noti) => {
                const newNotification: Notification = {
                    ...noti,
                    id: Math.random().toString(36).substring(7),
                    timestamp: new Date().toISOString(),
                    read: false,
                };
                set((state) => ({
                    notifications: [newNotification, ...state.notifications],
                    unreadCount: state.unreadCount + 1,
                }));
            },

            markAsRead: (id) => {
                set((state) => {
                    const updated = state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                    );
                    const unreadCount = updated.filter((n) => !n.read).length;
                    return { notifications: updated, unreadCount };
                });
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                    unreadCount: 0,
                }));
            },

            clearNotifications: () => {
                set({ notifications: [], unreadCount: 0 });
            },
        }),
        {
            name: 'notification-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
