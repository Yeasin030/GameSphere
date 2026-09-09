import { create } from 'zustand';
import { feedApi, postsApi, storiesApi } from '../services/api';

// Normalize post from API (author → user, display_name → name)
function normalizePost(raw: any) {
    const author = raw.author ?? raw.user ?? {};
    return {
        ...raw,
        likes_count: raw.reactions_count ?? raw.likes_count ?? 0,
        user: {
            id: author.id,
            name: author.display_name ?? author.name ?? 'Unknown',
            username: author.username ?? '',
            avatar_url: author.avatar_url ?? null,
        },
    };
}

interface PostUser {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
}

interface Post {
    id: number;
    user: PostUser;
    content: string;
    type: string;
    image_url?: string;
    media?: { url: string; type: string }[];
    likes_count: number;
    comments_count: number;
    shares_count?: number;
    views_count?: number;
    is_liked?: boolean;
    is_saved?: boolean;
    created_at: string;
    hashtags?: { tag: string }[];
}

interface Story {
    id: number;
    user: PostUser;
    media_path?: string;
    media_url?: string;
    text_content?: string;
    type: string;
    seen?: boolean;
    expires_at: string;
}

interface FeedState {
    posts: Post[];
    stories: Story[];
    isLoading: boolean;
    isLoadingStories: boolean;
    isPosting: boolean;
    page: number;
    hasMore: boolean;
    error: string | null;

    fetchFeed: (page?: number) => Promise<void>;
    fetchStories: () => Promise<void>;
    createPost: (content: string, image?: File | null) => Promise<void>;
    createStory: (file: File, text?: string) => Promise<void>;
    toggleLike: (postId: number) => Promise<void>;
    toggleSave: (postId: number) => Promise<void>;
    loadMore: () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
    posts: [],
    stories: [],
    isLoading: false,
    isLoadingStories: false,
    isPosting: false,
    page: 1,
    hasMore: true,
    error: null,

    fetchFeed: async (page = 1) => {
        set({ isLoading: true, error: null });
        try {
            const isAuth = !!localStorage.getItem('access_token');
            const res = isAuth
                ? await feedApi.getFeed(page)
                : await feedApi.getExploreFeed(page);
            const rawPosts = res.data.data ?? [];
            const newPosts: Post[] = rawPosts.map(normalizePost);
            const meta = res.data.meta;
            set({
                posts: page === 1 ? newPosts : [...get().posts, ...newPosts],
                page,
                hasMore: meta?.has_more ?? newPosts.length > 0,
                isLoading: false,
            });
        } catch (err: any) {
            set({
                isLoading: false,
                error: err.response?.data?.message || 'Failed to load feed.',
            });
        }
    },

    fetchStories: async () => {
        set({ isLoadingStories: true });
        try {
            const res = await storiesApi.getStories();
            set({ stories: res.data.data ?? [], isLoadingStories: false });
        } catch {
            set({ isLoadingStories: false });
        }
    },

    createPost: async (content, image) => {
        set({ isPosting: true });
        try {
            let payload: FormData | Record<string, any>;
            if (image) {
                const fd = new FormData();
                fd.append('content', content);
                fd.append('type', 'image');
                fd.append('image', image);
                fd.append('media', image);
                fd.append('visibility', 'public');
                payload = fd;
            } else {
                payload = { content, type: 'text', visibility: 'public' };
            }
            const res = await postsApi.create(payload);
            const newPost: Post = normalizePost(res.data.data);
            set({ posts: [newPost, ...get().posts] });
        } catch (err: any) {
            console.error('Failed to create post:', err);
            throw err;
        } finally {
            set({ isPosting: false });
        }
    },

    createStory: async (file?: File | null, text?: string) => {
        try {
            const fd = new FormData();
            if (file) {
                fd.append('media', file);
                fd.append('type', file.type.startsWith('video') ? 'video' : 'image');
            } else {
                fd.append('type', 'text');
            }
            if (text) fd.append('text_content', text);
            const res = await storiesApi.createStory(fd);
            const rawStory = res.data.data;
            const newStory: Story = {
                id: rawStory.id,
                type: rawStory.type,
                media_path: rawStory.media_path,
                media_url: rawStory.media_url,
                text_content: rawStory.text_content,
                seen: false,
                expires_at: rawStory.expires_at,
                user: {
                    id: rawStory.user?.id || 1,
                    name: rawStory.user?.name || 'Gamer',
                    username: rawStory.user?.username || 'gamer',
                    avatar_url: rawStory.user?.avatar_url,
                },
            };
            set({ stories: [newStory, ...get().stories] });
        } catch (err) {
            console.error('Story upload failed', err);
            throw err;
        }
    },

    toggleLike: async (postId) => {
        // Optimistic update
        const posts = get().posts.map((p) =>
            p.id === postId
                ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
                : p
        );
        set({ posts });
        try {
            const post = get().posts.find((p) => p.id === postId);
            if (post?.is_liked) {
                await postsApi.react(postId, 'like');
            } else {
                await postsApi.unreact(postId);
            }
        } catch {
            // Revert on failure
            set({
                posts: get().posts.map((p) =>
                    p.id === postId
                        ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
                        : p
                ),
            });
        }
    },

    toggleSave: async (postId) => {
        const posts = get().posts.map((p) =>
            p.id === postId ? { ...p, is_saved: !p.is_saved } : p
        );
        set({ posts });
        try {
            const post = get().posts.find((p) => p.id === postId);
            if (post?.is_saved) {
                await postsApi.save(postId);
            } else {
                await postsApi.unsave(postId);
            }
        } catch {
            set({
                posts: get().posts.map((p) =>
                    p.id === postId ? { ...p, is_saved: !p.is_saved } : p
                ),
            });
        }
    },

    loadMore: () => {
        const { page, hasMore, isLoading } = get();
        if (!isLoading && hasMore) {
            get().fetchFeed(page + 1);
        }
    },
}));
