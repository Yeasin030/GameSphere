import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    display_name?: string;
    avatar?: string | null;
    avatar_url?: string | null;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        name: string;
        username: string;
        email: string;
        password: string;
        password_confirmation: string;
    }) => Promise<User>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    updateUser: (partialUser: Partial<User>) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            clearError: () => set({ error: null }),

            updateUser: (partialUser) => {
                const current = get().user;
                if (!current) return;
                const updated: User = {
                    ...current,
                    ...partialUser,
                    name: partialUser.display_name || partialUser.name || current.name,
                    avatar: partialUser.avatar || partialUser.avatar_url || current.avatar,
                    avatar_url: partialUser.avatar_url || partialUser.avatar || current.avatar_url,
                };
                set({ user: updated });
            },

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await authApi.login({ email, password });
                    const { token, user } = res.data.data;
                    const formattedUser: User = {
                        ...user,
                        name: user.display_name || user.name || user.username,
                        display_name: user.display_name || user.name || user.username,
                        avatar: user.avatar || user.avatar_url,
                        avatar_url: user.avatar_url || user.avatar,
                    };
                    localStorage.setItem('access_token', token);
                    set({ user: formattedUser, token, isAuthenticated: true, isLoading: false });
                } catch (err: any) {
                    const msg = err.response?.data?.message || 'Login failed.';
                    set({ isLoading: false, error: msg, isAuthenticated: false });
                    throw err;
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await authApi.register(data);
                    const { token, user } = res.data.data;
                    const formattedUser: User = {
                        ...user,
                        name: user.display_name || user.name || data.name || data.username,
                        display_name: user.display_name || user.name || data.name || data.username,
                        username: user.username || data.username,
                        avatar: user.avatar || user.avatar_url,
                        avatar_url: user.avatar_url || user.avatar,
                    };
                    localStorage.setItem('access_token', token);
                    set({ user: formattedUser, token, isAuthenticated: true, isLoading: false });
                    return formattedUser;
                } catch (err: any) {
                    const msg = err.response?.data?.message || 'Registration failed.';
                    const errors = err.response?.data?.errors;
                    const firstError = errors ? Object.values(errors).flat()[0] as string : msg;
                    set({ isLoading: false, error: firstError });
                    throw err;
                }
            },

            logout: async () => {
                try {
                    await authApi.logout();
                } finally {
                    localStorage.removeItem('access_token');
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },

            checkAuth: async () => {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    set({ isLoading: false, isAuthenticated: false });
                    return;
                }
                set({ isLoading: true });
                try {
                    const res = await authApi.me();
                    const rawUser = res.data?.data || res.data;
                    const formattedUser: User = {
                        ...rawUser,
                        name: rawUser.display_name || rawUser.name || rawUser.username,
                        display_name: rawUser.display_name || rawUser.name || rawUser.username,
                        avatar: rawUser.avatar || rawUser.avatar_url,
                        avatar_url: rawUser.avatar_url || rawUser.avatar,
                    };
                    set({ user: formattedUser, isAuthenticated: true, isLoading: false });
                } catch {
                    localStorage.removeItem('access_token');
                    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ token: state.token, user: state.user }),
        }
    )
);
