import { create } from 'zustand';
import { tournamentsApi } from '../services/api';

export interface TournamentHost {
    id: number;
    username: string;
    display_name: string;
    avatar?: string | null;
    is_verified?: boolean;
}

export interface TournamentGame {
    id: number;
    name: string;
    slug: string;
    cover_image?: string | null;
}

export interface TournamentParticipant {
    id: number;
    username: string;
    display_name: string;
    avatar?: string | null;
}

export interface TournamentMatchItem {
    id: number;
    round_name: string;
    round_number: number;
    match_number: number;
    participant_a?: {
        id: number;
        user?: TournamentParticipant;
    } | null;
    participant_b?: {
        id: number;
        user?: TournamentParticipant;
    } | null;
    winner?: {
        id: number;
        user?: TournamentParticipant;
    } | null;
    score?: {
        team_a?: number;
        team_b?: number;
    } | null;
    status: 'scheduled' | 'in_progress' | 'completed' | 'walkover' | 'disputed';
    scheduled_at?: string | null;
    completed_at?: string | null;
}

export interface TournamentRound {
    round_name: string;
    round_number: number;
    matches: TournamentMatchItem[];
}

export interface TournamentItem {
    id: number;
    user_id: number;
    game_id: number;
    name: string;
    slug: string;
    description: string;
    banner?: string | null;
    rules?: string | null;
    format: string;
    team_mode: string;
    team_size: number;
    max_participants: number;
    registered_count: number;
    entry_fee: string | number;
    currency: string;
    prize_info?: string | null;
    region?: string | null;
    platform_type: string;
    status: 'draft' | 'registration' | 'check_in' | 'in_progress' | 'completed' | 'cancelled';
    is_featured: boolean;
    is_verified: boolean;
    require_check_in: boolean;
    registration_starts_at?: string | null;
    registration_ends_at?: string | null;
    starts_at?: string | null;
    ends_at?: string | null;
    host?: TournamentHost | null;
    game?: TournamentGame | null;
    is_registered?: boolean;
    participants_preview?: TournamentParticipant[];
}

export interface TournamentStats {
    total_tournaments: number;
    live_count: number;
    registration_open_count: number;
    total_players: number;
}

interface TournamentState {
    tournaments: TournamentItem[];
    stats: TournamentStats;
    selectedTournament: TournamentItem | null;
    bracketRounds: TournamentRound[];
    isBracketOpen: boolean;
    isLoadingBracket: boolean;
    isLoading: boolean;
    isActionLoading: Record<number, boolean>;
    statusFilter: string;
    gameFilter: string;
    searchQuery: string;

    // Actions
    fetchTournaments: () => Promise<void>;
    registerTournament: (id: number) => Promise<{ success: boolean; message: string }>;
    unregisterTournament: (id: number) => Promise<{ success: boolean; message: string }>;
    openBracketModal: (tournament: TournamentItem) => Promise<void>;
    closeBracketModal: () => void;
    setStatusFilter: (status: string) => void;
    setGameFilter: (game: string) => void;
    setSearchQuery: (q: string) => void;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
    tournaments: [],
    stats: {
        total_tournaments: 0,
        live_count: 0,
        registration_open_count: 0,
        total_players: 0,
    },
    selectedTournament: null,
    bracketRounds: [],
    isBracketOpen: false,
    isLoadingBracket: false,
    isLoading: false,
    isActionLoading: {},
    statusFilter: 'all',
    gameFilter: 'all',
    searchQuery: '',

    fetchTournaments: async () => {
        set({ isLoading: true });
        try {
            const { statusFilter, gameFilter, searchQuery } = get();
            const res = await tournamentsApi.getAll({
                status: statusFilter !== 'all' ? statusFilter : undefined,
                game: gameFilter !== 'all' ? gameFilter : undefined,
                q: searchQuery.trim() ? searchQuery.trim() : undefined,
            });

            const data = res.data?.data || [];
            const stats = res.data?.stats || {
                total_tournaments: data.length,
                live_count: data.filter((t: TournamentItem) => t.status === 'in_progress').length,
                registration_open_count: data.filter((t: TournamentItem) => t.status === 'registration').length,
                total_players: data.reduce((acc: number, t: TournamentItem) => acc + (t.registered_count || 0), 0),
            };

            set({
                tournaments: data,
                stats,
                isLoading: false,
            });
        } catch (error) {
            console.error('Failed to fetch tournaments:', error);
            set({ isLoading: false });
        }
    },

    registerTournament: async (id: number) => {
        const { isActionLoading, tournaments } = get();
        if (isActionLoading[id]) return { success: false, message: 'Processing...' };

        // Set action loading for this tournament
        set({ isActionLoading: { ...isActionLoading, [id]: true } });

        // Optimistic UI update
        const prevTournaments = [...tournaments];
        set({
            tournaments: tournaments.map((t) =>
                t.id === id
                    ? {
                          ...t,
                          is_registered: true,
                          registered_count: t.registered_count + 1,
                      }
                    : t
            ),
        });

        try {
            const res = await tournamentsApi.register(id);
            const updatedCount = res.data?.registered_count;

            set({
                tournaments: get().tournaments.map((t) =>
                    t.id === id
                        ? {
                              ...t,
                              is_registered: true,
                              registered_count: updatedCount ?? t.registered_count,
                          }
                        : t
                ),
                isActionLoading: { ...get().isActionLoading, [id]: false },
            });

            return {
                success: true,
                message: res.data?.message || 'Registered successfully!',
            };
        } catch (error: any) {
            // Rollback on error
            set({
                tournaments: prevTournaments,
                isActionLoading: { ...get().isActionLoading, [id]: false },
            });
            const msg = error.response?.data?.message || 'Failed to register.';
            return { success: false, message: msg };
        }
    },

    unregisterTournament: async (id: number) => {
        const { isActionLoading, tournaments } = get();
        if (isActionLoading[id]) return { success: false, message: 'Processing...' };

        set({ isActionLoading: { ...isActionLoading, [id]: true } });

        // Optimistic update
        const prevTournaments = [...tournaments];
        set({
            tournaments: tournaments.map((t) =>
                t.id === id
                    ? {
                          ...t,
                          is_registered: false,
                          registered_count: Math.max(0, t.registered_count - 1),
                      }
                    : t
            ),
        });

        try {
            const res = await tournamentsApi.unregister(id);
            const updatedCount = res.data?.registered_count;

            set({
                tournaments: get().tournaments.map((t) =>
                    t.id === id
                        ? {
                              ...t,
                              is_registered: false,
                              registered_count: updatedCount ?? t.registered_count,
                          }
                        : t
                ),
                isActionLoading: { ...get().isActionLoading, [id]: false },
            });

            return {
                success: true,
                message: res.data?.message || 'Left tournament successfully.',
            };
        } catch (error: any) {
            set({
                tournaments: prevTournaments,
                isActionLoading: { ...get().isActionLoading, [id]: false },
            });
            const msg = error.response?.data?.message || 'Failed to leave tournament.';
            return { success: false, message: msg };
        }
    },

    openBracketModal: async (tournament: TournamentItem) => {
        set({
            selectedTournament: tournament,
            isBracketOpen: true,
            isLoadingBracket: true,
            bracketRounds: [],
        });

        try {
            const res = await tournamentsApi.getBracket(tournament.id);
            const rounds = res.data?.rounds || [];
            set({ bracketRounds: rounds, isLoadingBracket: false });
        } catch (error) {
            console.error('Failed to load tournament bracket:', error);
            set({ isLoadingBracket: false });
        }
    },

    closeBracketModal: () => {
        set({
            isBracketOpen: false,
            selectedTournament: null,
            bracketRounds: [],
        });
    },

    setStatusFilter: (status: string) => {
        set({ statusFilter: status });
        get().fetchTournaments();
    },

    setGameFilter: (game: string) => {
        set({ gameFilter: game });
        get().fetchTournaments();
    },

    setSearchQuery: (q: string) => {
        set({ searchQuery: q });
    },
}));
