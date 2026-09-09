import { create } from 'zustand';
import { notificationsApi } from '../services/api';

export interface NotificationActor {
    name: string;
    username: string;
    avatar: string;
}

export interface NotificationItem {
    id: string;
    type: string;
    category: 'tournament' | 'social' | 'group' | 'game' | 'system' | string;
    title: string;
    message: string;
    action_url: string;
    actor?: NotificationActor | null;
    read_at: string | null;
    created_at: string;
    created_at_human: string;
}

interface NotificationState {
    notifications: NotificationItem[];
    unreadCount: number;
    filter: string;
    isLoading: boolean;
    isOperating: boolean;
    setFilter: (filter: string) => void;
    fetchNotifications: (overrideFilter?: string) => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    sendTestNotification: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    filter: 'all',
    isLoading: false,
    isOperating: false,

    setFilter: (filter: string) => {
        set({ filter });
        get().fetchNotifications(filter);
    },

    fetchNotifications: async (overrideFilter?: string) => {
        const activeFilter = overrideFilter !== undefined ? overrideFilter : get().filter;
        set({ isLoading: true });
        try {
            const res = await notificationsApi.getAll(activeFilter === 'all' ? undefined : activeFilter);
            const data = res.data.data || [];
            const count = typeof res.data.unread_count === 'number' 
                ? res.data.unread_count 
                : data.filter((n: NotificationItem) => !n.read_at).length;
            
            set({ 
                notifications: data, 
                unreadCount: count,
                isLoading: false 
            });
        } catch (error) {
            console.error('Failed to load notifications', error);
            set({ isLoading: false });
        }
    },

    fetchUnreadCount: async () => {
        try {
            const res = await notificationsApi.getUnreadCount();
            set({ unreadCount: res.data.count || 0 });
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    },

    markAsRead: async (id: string) => {
        try {
            // Optimistic update
            set({
                notifications: get().notifications.map(n => 
                    n.id === id ? { ...n, read_at: new Date().toISOString() } : n
                ),
                unreadCount: Math.max(0, get().unreadCount - 1)
            });
            const res = await notificationsApi.markRead(id);
            if (typeof res.data.unread_count === 'number') {
                set({ unreadCount: res.data.unread_count });
            }
        } catch (error) {
            console.error('Failed to mark notification as read', error);
            get().fetchNotifications();
        }
    },

    markAllAsRead: async () => {
        set({ isOperating: true });
        try {
            // Optimistic update
            set({
                notifications: get().notifications.map(n => ({ 
                    ...n, 
                    read_at: n.read_at || new Date().toISOString() 
                })),
                unreadCount: 0
            });
            await notificationsApi.markAllRead();
        } catch (error) {
            console.error('Failed to mark all as read', error);
            get().fetchNotifications();
        } finally {
            set({ isOperating: false });
        }
    },

    deleteNotification: async (id: string) => {
        try {
            const target = get().notifications.find(n => n.id === id);
            const wasUnread = target && !target.read_at;

            set({
                notifications: get().notifications.filter(n => n.id !== id),
                unreadCount: wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount,
            });

            const res = await notificationsApi.delete(id);
            if (typeof res.data.unread_count === 'number') {
                set({ unreadCount: res.data.unread_count });
            }
        } catch (error) {
            console.error('Failed to delete notification', error);
            get().fetchNotifications();
        }
    },

    sendTestNotification: async () => {
        set({ isOperating: true });
        try {
            const res = await notificationsApi.sendTest();
            if (res.data.notification) {
                // Prepend new notification to the top of the list
                set({
                    notifications: [res.data.notification, ...get().notifications],
                    unreadCount: typeof res.data.unread_count === 'number' 
                        ? res.data.unread_count 
                        : get().unreadCount + 1,
                });
            }
        } catch (error) {
            console.error('Failed to send test notification', error);
        } finally {
            set({ isOperating: false });
        }
    },
}));
