import { create } from 'zustand';
import { reelsApi } from '../services/api';

export interface ReelUser {
    id: number;
    username: string;
    display_name: string;
    avatar?: string | null;
}

export interface ReelGame {
    id: number;
    name: string;
    slug: string;
}

export interface ReelItem {
    id: number;
    caption: string;
    audio_name: string;
    file_path: string;
    thumbnail_path?: string | null;
    duration: number;
    duration_human: string;
    views_count: number;
    likes_count: number;
    shares_count: number;
    saves_count: number;
    comments_count: number;
    is_liked: boolean;
    is_saved?: boolean;
    created_at?: string;
    created_at_human: string;
    user?: ReelUser | null;
    game?: ReelGame | null;
}

interface ReelState {
    reels: ReelItem[];
    activeIndex: number;
    isLoading: boolean;
    isMuted: boolean;
    isPlaying: boolean;

    fetchReels: () => Promise<void>;
    setActiveIndex: (index: number) => void;
    nextReel: () => void;
    prevReel: () => void;
    likeReel: (id: number) => Promise<void>;
    toggleSave: (id: number) => void;
    recordView: (id: number) => Promise<void>;
    toggleMute: () => void;
    togglePlay: () => void;
    setIsPlaying: (playing: boolean) => void;
}

export const useReelStore = create<ReelState>((set, get) => ({
    reels: [],
    activeIndex: 0,
    isLoading: false,
    isMuted: false,
    isPlaying: true,

    fetchReels: async () => {
        set({ isLoading: true });
        try {
            const res = await reelsApi.getAll();
            const data = res.data.data || [];
            set({ 
                reels: data, 
                isLoading: false 
            });
            // Record view on the first reel
            if (data.length > 0) {
                get().recordView(data[0].id);
            }
        } catch (error) {
            console.error('Failed to load reels', error);
            set({ isLoading: false });
        }
    },

    setActiveIndex: (index: number) => {
        const { reels } = get();
        if (index >= 0 && index < reels.length) {
            set({ activeIndex: index, isPlaying: true });
            get().recordView(reels[index].id);
        }
    },

    nextReel: () => {
        const { activeIndex, reels } = get();
        if (activeIndex < reels.length - 1) {
            const nextIdx = activeIndex + 1;
            set({ activeIndex: nextIdx, isPlaying: true });
            get().recordView(reels[nextIdx].id);
        }
    },

    prevReel: () => {
        const { activeIndex, reels } = get();
        if (activeIndex > 0) {
            const prevIdx = activeIndex - 1;
            set({ activeIndex: prevIdx, isPlaying: true });
            get().recordView(reels[prevIdx].id);
        }
    },

    likeReel: async (id: number) => {
        try {
            const { reels } = get();
            const target = reels.find(r => r.id === id);
            const newLiked = !target?.is_liked;

            // Optimistic update
            set({
                reels: reels.map(r => {
                    if (r.id === id) {
                        return {
                            ...r,
                            is_liked: newLiked,
                            likes_count: newLiked ? r.likes_count + 1 : Math.max(0, r.likes_count - 1),
                        };
                    }
                    return r;
                }),
            });

            const res = await reelsApi.like(id);
            if (typeof res.data.likes_count === 'number') {
                const confirmedLikes = res.data.likes_count;
                const confirmedLiked = res.data.is_liked;
                set({
                    reels: get().reels.map(r => r.id === id ? { 
                        ...r, 
                        likes_count: confirmedLikes, 
                        is_liked: confirmedLiked 
                    } : r),
                });
            }
        } catch (error) {
            console.error('Failed to like reel', error);
        }
    },

    toggleSave: (id: number) => {
        const { reels } = get();
        set({
            reels: reels.map(r => {
                if (r.id === id) {
                    const newSaved = !r.is_saved;
                    return {
                        ...r,
                        is_saved: newSaved,
                        saves_count: newSaved ? r.saves_count + 1 : Math.max(0, r.saves_count - 1),
                    };
                }
                return r;
            }),
        });
    },

    recordView: async (id: number) => {
        try {
            const res = await reelsApi.recordView(id);
            if (typeof res.data.views_count === 'number') {
                const newViews = res.data.views_count;
                set({
                    reels: get().reels.map(r => r.id === id ? { ...r, views_count: newViews } : r),
                });
            }
        } catch (error) {
            console.error('Failed to record reel view', error);
        }
    },

    toggleMute: () => {
        set({ isMuted: !get().isMuted });
    },

    togglePlay: () => {
        set({ isPlaying: !get().isPlaying });
    },

    setIsPlaying: (isPlaying: boolean) => {
        set({ isPlaying });
    },
}));
