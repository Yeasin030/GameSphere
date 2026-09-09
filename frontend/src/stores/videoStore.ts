import { create } from 'zustand';
import { videosApi } from '../services/api';

export interface VideoCreator {
    id: number;
    username: string;
    display_name: string;
    avatar?: string | null;
}

export interface VideoGame {
    id: number;
    name: string;
    slug: string;
    cover_image?: string | null;
}

export interface VideoItem {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    file_path: string;
    thumbnail_path?: string | null;
    poster_path?: string | null;
    duration: number;
    duration_human: string;
    category: string;
    visibility: string;
    status: string;
    is_featured: boolean;
    views_count: number;
    likes_count: number;
    shares_count: number;
    is_liked: boolean;
    created_at?: string;
    created_at_human: string;
    user?: VideoCreator | null;
    game?: VideoGame | null;
}

interface VideoState {
    videos: VideoItem[];
    activeVideo: VideoItem | null;
    selectedCategory: string;
    searchQuery: string;
    sort: string;
    isLoading: boolean;
    isPlaying: boolean;

    fetchVideos: () => Promise<void>;
    selectVideo: (video: VideoItem) => void;
    likeVideo: (id: number) => Promise<void>;
    recordView: (id: number) => Promise<void>;
    setCategory: (category: string) => void;
    setSearchQuery: (query: string) => void;
    setSort: (sort: string) => void;
    setIsPlaying: (playing: boolean) => void;
    togglePlay: () => void;
}

export const useVideoStore = create<VideoState>((set, get) => ({
    videos: [],
    activeVideo: null,
    selectedCategory: 'all',
    searchQuery: '',
    sort: 'latest',
    isLoading: false,
    isPlaying: false,

    fetchVideos: async () => {
        set({ isLoading: true });
        const { selectedCategory, searchQuery, sort } = get();
        try {
            const res = await videosApi.getAll({
                category: selectedCategory,
                q: searchQuery || undefined,
                sort: sort,
            });
            const data = res.data.data || [];
            
            set({ 
                videos: data, 
                isLoading: false,
                // Set default active video to the first/featured video if not already set
                activeVideo: get().activeVideo 
                    ? (data.find((v: VideoItem) => v.id === get().activeVideo?.id) || data[0] || null)
                    : (data.find((v: VideoItem) => v.is_featured) || data[0] || null),
            });
        } catch (error) {
            console.error('Failed to load videos', error);
            set({ isLoading: false });
        }
    },

    selectVideo: (video: VideoItem) => {
        set({ activeVideo: video, isPlaying: true });
        // Track view
        get().recordView(video.id);
    },

    likeVideo: async (id: number) => {
        try {
            // Optimistic update
            const { videos, activeVideo } = get();
            const currentLiked = activeVideo?.id === id ? activeVideo.is_liked : videos.find(v => v.id === id)?.is_liked;
            const newLiked = !currentLiked;

            set({
                videos: videos.map(v => {
                    if (v.id === id) {
                        return {
                            ...v,
                            is_liked: newLiked,
                            likes_count: newLiked ? v.likes_count + 1 : Math.max(0, v.likes_count - 1),
                        };
                    }
                    return v;
                }),
                activeVideo: activeVideo?.id === id ? {
                    ...activeVideo,
                    is_liked: newLiked,
                    likes_count: newLiked ? activeVideo.likes_count + 1 : Math.max(0, activeVideo.likes_count - 1),
                } : activeVideo,
            });

            const res = await videosApi.like(id);
            if (typeof res.data.likes_count === 'number') {
                const confirmedLikes = res.data.likes_count;
                const confirmedLiked = res.data.is_liked;
                set({
                    videos: get().videos.map(v => v.id === id ? { ...v, likes_count: confirmedLikes, is_liked: confirmedLiked } : v),
                    activeVideo: get().activeVideo?.id === id ? { ...get().activeVideo!, likes_count: confirmedLikes, is_liked: confirmedLiked } : get().activeVideo,
                });
            }
        } catch (error) {
            console.error('Failed to like video', error);
        }
    },

    recordView: async (id: number) => {
        try {
            const res = await videosApi.recordView(id);
            if (typeof res.data.views_count === 'number') {
                const newViews = res.data.views_count;
                set({
                    videos: get().videos.map(v => v.id === id ? { ...v, views_count: newViews } : v),
                    activeVideo: get().activeVideo?.id === id ? { ...get().activeVideo!, views_count: newViews } : get().activeVideo,
                });
            }
        } catch (error) {
            console.error('Failed to record video view', error);
        }
    },

    setCategory: (category: string) => {
        set({ selectedCategory: category });
        get().fetchVideos();
    },

    setSearchQuery: (searchQuery: string) => {
        set({ searchQuery });
        get().fetchVideos();
    },

    setSort: (sort: string) => {
        set({ sort });
        get().fetchVideos();
    },

    setIsPlaying: (isPlaying: boolean) => {
        set({ isPlaying });
    },

    togglePlay: () => {
        set({ isPlaying: !get().isPlaying });
    },
}));
