import api, { fetchCsrfCookie } from '../lib/axios';

// ─── Auth ────────────────────────────────────────────────────────────────
export const authApi = {
    login: async (data: { email: string; password: string }) => {
        try { await fetchCsrfCookie(); } catch (e) {}
        return api.post('/auth/login', { ...data, login: data.email });
    },

    register: async (data: { name: string; username: string; email: string; password: string; password_confirmation: string }) => {
        try { await fetchCsrfCookie(); } catch (e) {}
        return api.post('/auth/register', { ...data, display_name: data.name });
    },

    logout: async () => {
        try { await fetchCsrfCookie(); } catch (e) {} // best effort
        return api.post('/auth/logout');
    },

    me: () => api.get('/me'),
};

// ─── Feed ────────────────────────────────────────────────────────────────
export const feedApi = {
    getFeed: (page = 1) => api.get(`/feed?page=${page}`),
    getExploreFeed: (page = 1) => api.get(`/feed/explore?page=${page}`),
    getTrending: (page = 1) => api.get(`/feed/trending?page=${page}`),
    getFollowing: (page = 1) => api.get(`/feed/following?page=${page}`),
    getFriends: (page = 1) => api.get(`/feed/friends?page=${page}`),
    getGaming: (page = 1) => api.get(`/feed/gaming?page=${page}`),
    getLatest: (page = 1) => api.get(`/feed/latest?page=${page}`),
};

// ─── Games & Groups ───────────────────────────────────────────────────────
export const gamesApi = {
    getAll: (params?: any) => api.get('/games', { params }),
    getBySlug: (slug: string) => api.get(`/games/${slug}`),
    create: (data: any) => api.post('/games', data),
};

export const groupsApi = {
    getAll: (params?: any) => api.get('/groups', { params }),
    getById: (id: number | string) => api.get(`/groups/${id}`),
    create: (data: any) => api.post('/groups', data),
    join: (id: number | string) => api.post(`/groups/${id}/join`),
    leave: (id: number | string) => api.post(`/groups/${id}/leave`),
};

// ─── News ─────────────────────────────────────────────────────────────────
export const newsApi = {
    getAll: (params?: any) => api.get('/news', { params }),
    getById: (id: number | string) => api.get(`/news/${id}`),
    create: (data: any) => api.post('/news', data),
};

// ─── Posts ───────────────────────────────────────────────────────────────
export const postsApi = {
    create: (data: FormData | Record<string, any>) =>
        api.post('/posts', data, {
            headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
        }),

    delete: (id: number) => api.delete(`/posts/${id}`),

    react: (id: number, type: string) => api.post(`/posts/${id}/react`, { type }),
    unreact: (id: number) => api.delete(`/posts/${id}/react`),

    save: (id: number) => api.post(`/posts/${id}/save`),
    unsave: (id: number) => api.delete(`/posts/${id}/save`),

    toggleBookmark: (id: number) => api.post(`/posts/${id}/bookmark`),
    getBookmarks: (page = 1) => api.get(`/bookmarks?page=${page}`),

    share: (id: number) => api.post(`/posts/${id}/share`),

    getComments: (id: number) => api.get(`/posts/${id}/comments`),
    addComment: (id: number, content: string) =>
        api.post(`/posts/${id}/comments`, { content }),
};

// ─── Stories ─────────────────────────────────────────────────────────────
export const storiesApi = {
    getStories: () => api.get('/stories'),
    createStory: (data: FormData) =>
        api.post('/stories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    viewStory: (id: number) => api.post(`/stories/${id}/view`),
    deleteStory: (id: number) => api.delete(`/stories/${id}`),
};

// ─── Users ───────────────────────────────────────────────────────────────
export const usersApi = {
    getAll: (params?: any) => api.get('/users', { params }),
    getMe: () => api.get('/me'),
    updateMe: (data: any) => api.put('/me', data),
    getProfile: (username: string) => api.get(`/users/${username}`),
    getPosts: (username: string) => api.get(`/users/${username}/posts`),
    getGames: (username: string) => api.get(`/users/${username}/games`),
    getFriends: (username?: string) => username ? api.get(`/users/${username}/friends`) : api.get('/friends'),
    getAchievements: (username: string) => api.get(`/users/${username}/achievements`),
    follow: (userId: number) => api.post(`/users/${userId}/follow`),
    unfollow: (userId: number) => api.delete(`/users/${userId}/follow`),
    getFriendSuggestions: () => api.get('/friend-suggestions'),
};

// ─── Search ──────────────────────────────────────────────────────────────
export const searchApi = {
    search: (q: string) => api.get(`/search?q=${encodeURIComponent(q)}`),
};

// ─── Notifications ───────────────────────────────────────────────────────
export const notificationsApi = {
    getAll: (filter?: string) => api.get(`/notifications${filter ? `?filter=${filter}` : ''}`),
    markRead: (id: string) => api.post(`/notifications/${id}/read`),
    markAllRead: () => api.post('/notifications/read-all'),
    delete: (id: string) => api.delete(`/notifications/${id}`),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    sendTest: () => api.post('/notifications/send-test'),
};

// ─── Videos ───────────────────────────────────────────────────────────────
export const videosApi = {
    getAll: (params?: { category?: string; game?: string; q?: string; sort?: string; page?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.category && params.category !== 'all') searchParams.append('category', params.category);
        if (params?.game) searchParams.append('game', params.game);
        if (params?.q) searchParams.append('q', params.q);
        if (params?.sort) searchParams.append('sort', params.sort);
        if (params?.page) searchParams.append('page', String(params.page));
        const query = searchParams.toString();
        return api.get(`/videos${query ? `?${query}` : ''}`);
    },
    getById: (id: number | string) => api.get(`/videos/${id}`),
    like: (id: number | string) => api.post(`/videos/${id}/like`),
    recordView: (id: number | string) => api.post(`/videos/${id}/view`),
    upload: (data: any) => api.post('/videos', data),
};

// ─── Reels ────────────────────────────────────────────────────────────────
export const reelsApi = {
    getAll: (params?: { game?: string; q?: string; page?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.game) searchParams.append('game', params.game);
        if (params?.q) searchParams.append('q', params.q);
        if (params?.page) searchParams.append('page', String(params.page));
        const query = searchParams.toString();
        return api.get(`/reels${query ? `?${query}` : ''}`);
    },
    getById: (id: number | string) => api.get(`/reels/${id}`),
    like: (id: number | string) => api.post(`/reels/${id}/like`),
    recordView: (id: number | string) => api.post(`/reels/${id}/view`),
    upload: (data: any) => api.post('/reels', data),
};

// ─── Tournaments ──────────────────────────────────────────────────────────
export const tournamentsApi = {
    getAll: (params?: { status?: string; game?: string; game_id?: number; q?: string; page?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.status && params.status !== 'all') searchParams.append('status', params.status);
        if (params?.game) searchParams.append('game', params.game);
        if (params?.game_id) searchParams.append('game_id', String(params.game_id));
        if (params?.q) searchParams.append('q', params.q);
        if (params?.page) searchParams.append('page', String(params.page));
        const query = searchParams.toString();
        return api.get(`/tournaments${query ? `?${query}` : ''}`);
    },
    getById: (id: number | string) => api.get(`/tournaments/${id}`),
    create: (data: any) => api.post('/tournaments', data),
    register: (id: number | string) => api.post(`/tournaments/${id}/register`),
    unregister: (id: number | string) => api.delete(`/tournaments/${id}/register`),
    getBracket: (id: number | string) => api.get(`/tournaments/${id}/bracket`),
    getParticipants: (id: number | string) => api.get(`/tournaments/${id}/participants`),
    getMyTournaments: () => api.get('/tournaments/my'),
};

