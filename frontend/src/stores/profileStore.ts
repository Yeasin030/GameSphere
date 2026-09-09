import { create } from 'zustand';
import { usersApi } from '../services/api';
import { useAuthStore } from './authStore';

export interface ProfileAchievement {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    type: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    points: number;
    unlocked_at?: string;
}

export interface ProfileGame {
    id: number;
    name: string;
    slug: string;
    cover_image?: string;
    pivot?: {
        status: string;
        playtime_hours: number | string;
        rating: number;
        notes?: string;
    };
}

export interface ProfileFriend {
    id: number;
    username: string;
    display_name: string;
    avatar?: string;
    is_verified?: boolean;
    bio?: string;
    is_online?: boolean;
}

export interface ProfilePost {
    id: number;
    content: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    media?: Array<{ id: number; url: string; type: string }>;
    author?: {
        id: number;
        username: string;
        display_name: string;
        avatar?: string;
        is_verified?: boolean;
    };
}

export interface ProfileData {
    id: number;
    username: string;
    display_name: string;
    email?: string | null;
    avatar?: string | null;
    cover_image?: string | null;
    bio?: string | null;
    website?: string | null;
    country?: string | null;
    is_verified?: boolean;
    is_online?: boolean;
    followers_count: number;
    following_count: number;
    friends_count: number;
    posts_count: number;
    wins_count: number;
    playtime_hours: number | string;
    is_self: boolean;
    is_following: boolean;
    is_friend: boolean;
    created_at: string;
    achievements?: ProfileAchievement[];
    games?: ProfileGame[];
}

interface ProfileState {
    profile: ProfileData | null;
    posts: ProfilePost[];
    friends: ProfileFriend[];
    activeTab: 'activity' | 'trophies' | 'library' | 'friends';
    isLoading: boolean;
    isLoadingPosts: boolean;
    isLoadingFriends: boolean;
    isSaving: boolean;
    isEditModalOpen: boolean;

    fetchProfile: (username?: string) => Promise<void>;
    fetchPosts: (username?: string) => Promise<void>;
    fetchFriends: (username?: string) => Promise<void>;
    updateProfile: (data: Partial<ProfileData>) => Promise<{ success: boolean; message: string }>;
    toggleFollow: () => Promise<void>;
    setActiveTab: (tab: 'activity' | 'trophies' | 'library' | 'friends') => void;
    setEditModalOpen: (open: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
    profile: null,
    posts: [],
    friends: [],
    activeTab: 'activity',
    isLoading: true,
    isLoadingPosts: false,
    isLoadingFriends: false,
    isSaving: false,
    isEditModalOpen: false,

    fetchProfile: async (username?: string) => {
        set({ isLoading: true });
        try {
            const target = username || 'me';
            const res = await usersApi.getProfile(target);
            const profile = res.data?.data;
            set({ profile, isLoading: false });

            // Also load initial posts
            get().fetchPosts(profile?.username || target);
        } catch (error) {
            console.error('Failed to load profile:', error);
            set({ isLoading: false });
        }
    },

    fetchPosts: async (username?: string) => {
        const target = username || get().profile?.username || 'me';
        set({ isLoadingPosts: true });
        try {
            const res = await usersApi.getPosts(target);
            const posts = res.data?.data || [];
            set({ posts, isLoadingPosts: false });
        } catch (error) {
            console.error('Failed to load profile posts:', error);
            set({ isLoadingPosts: false });
        }
    },

    fetchFriends: async (username?: string) => {
        const target = username || get().profile?.username || 'me';
        set({ isLoadingFriends: true });
        try {
            const res = await usersApi.getFriends(target);
            const friends = res.data?.data || [];
            set({ friends, isLoadingFriends: false });
        } catch (error) {
            console.error('Failed to load friends:', error);
            set({ isLoadingFriends: false });
        }
    },

    updateProfile: async (data: Partial<ProfileData>) => {
        set({ isSaving: true });
        try {
            const res = await usersApi.updateMe(data);
            const updated = res.data?.data;

            if (get().profile) {
                set({
                    profile: {
                        ...get().profile!,
                        ...updated,
                        display_name: data.display_name ?? get().profile!.display_name,
                        bio: data.bio ?? get().profile!.bio,
                        website: data.website ?? get().profile!.website,
                        country: data.country ?? get().profile!.country,
                        avatar: data.avatar ?? get().profile!.avatar,
                        cover_image: data.cover_image ?? get().profile!.cover_image,
                    },
                    isSaving: false,
                    isEditModalOpen: false,
                });
            } else {
                set({ isSaving: false, isEditModalOpen: false });
            }

            // Sync with global auth store
            if (data.display_name || data.avatar) {
                useAuthStore.getState().updateUser({
                    display_name: data.display_name || undefined,
                    name: data.display_name || undefined,
                    avatar: data.avatar ?? undefined,
                    avatar_url: data.avatar ?? undefined,
                });
            }

            return { success: true, message: 'Profile updated successfully!' };
        } catch (error: any) {
            set({ isSaving: false });
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update profile.',
            };
        }
    },

    toggleFollow: async () => {
        const { profile } = get();
        if (!profile || profile.is_self) return;

        const isNowFollowing = !profile.is_following;
        const countDelta = isNowFollowing ? 1 : -1;

        // Optimistic UI update
        set({
            profile: {
                ...profile,
                is_following: isNowFollowing,
                followers_count: Math.max(0, profile.followers_count + countDelta),
            },
        });

        try {
            if (isNowFollowing) {
                await usersApi.follow(profile.id);
            } else {
                await usersApi.unfollow(profile.id);
            }
        } catch (error) {
            console.error('Failed to toggle follow:', error);
            // Rollback
            set({ profile });
        }
    },

    setActiveTab: (tab: 'activity' | 'trophies' | 'library' | 'friends') => {
        set({ activeTab: tab });
        if (tab === 'friends' && get().friends.length === 0) {
            get().fetchFriends();
        }
    },

    setEditModalOpen: (open: boolean) => set({ isEditModalOpen: open }),
}));
