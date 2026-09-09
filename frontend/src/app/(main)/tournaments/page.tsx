'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Trophy,
  Calendar,
  Users,
  Search,
  Swords,
  ShieldCheck,
  CheckCircle2,
  X,
  Flame,
  Globe,
  Gamepad2,
  ChevronRight,
  Plus,
  Loader2,
  Sparkles,
  Award,
  Crown,
  Share2,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTournamentStore, TournamentItem, TournamentRound } from '@/stores/tournamentStore';
import { tournamentsApi } from '@/services/api';

const POPULAR_GAMES = [
  { name: 'All Games', slug: 'all' },
  { name: 'Valorant', slug: 'valorant' },
  { name: 'Counter-Strike 2', slug: 'counter-strike-2' },
  { name: 'Apex Legends', slug: 'apex-legends' },
  { name: 'Helldivers 2', slug: 'helldivers-2' },
  { name: 'Elden Ring', slug: 'elden-ring' },
  { name: 'League of Legends', slug: 'league-of-legends' },
  { name: 'Warzone', slug: 'call-of-duty-warzone' },
];

export default function TournamentsPage() {
  const {
    tournaments,
    stats,
    isLoading,
    isActionLoading,
    bracketRounds,
    isBracketOpen,
    isLoadingBracket,
    selectedTournament,
    statusFilter,
    gameFilter,
    searchQuery,
    fetchTournaments,
    registerTournament,
    unregisterTournament,
    openBracketModal,
    closeBracketModal,
    setStatusFilter,
    setGameFilter,
    setSearchQuery,
  } = useTournamentStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New Tournament Form State
  const [formData, setFormData] = useState({
    name: '',
    game_id: '1',
    description: '',
    format: 'single_elimination',
    team_mode: '5v5',
    max_participants: '16',
    entry_fee: '0',
    prize_info: '$10,000 Championship Pool',
    region: 'North America',
    platform_type: 'pc',
    starts_at: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 16),
    registration_ends_at: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 16),
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  // Handle Register/Unregister
  const handleToggleRegistration = async (t: TournamentItem) => {
    if (t.is_registered) {
      const res = await unregisterTournament(t.id);
      showToast(res.message);
    } else {
      const res = await registerTournament(t.id);
      showToast(res.message);
    }
  };

  // Featured Spotlight Tournament (Live or top featured)
  const spotlightTournament = useMemo(() => {
    return (
      tournaments.find((t) => t.status === 'in_progress') ||
      tournaments.find((t) => t.is_featured) ||
      tournaments[0] ||
      null
    );
  }, [tournaments]);

  // Handle Create Tournament Submit
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter a tournament name.');
      return;
    }

    setIsCreating(true);
    try {
      await tournamentsApi.create({
        ...formData,
        game_id: parseInt(formData.game_id, 10),
        max_participants: parseInt(formData.max_participants, 10),
        entry_fee: parseFloat(formData.entry_fee) || 0,
      });

      showToast(`Tournament "${formData.name}" created successfully!`);
      setIsCreateModalOpen(false);
      fetchTournaments();
      setFormData({
        name: '',
        game_id: '1',
        description: '',
        format: 'single_elimination',
        team_mode: '5v5',
        max_participants: '16',
        entry_fee: '0',
        prize_info: '$10,000 Championship Pool',
        region: 'North America',
        platform_type: 'pc',
        starts_at: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 16),
        registration_ends_at: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 16),
      });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create tournament.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12141c]/95 border border-[#8b5cf6]/40 text-white px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <Sparkles className="w-5 h-5 text-[#8b5cf6] animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-magenta/10 border border-accent-magenta/20 text-accent-magenta text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" /> Official & Community Esports
          </div>
          <h1 className="text-3xl lg:text-4xl font-display font-black text-white flex items-center gap-3 tracking-tight">
            <Trophy className="w-9 h-9 text-accent-magenta" /> Esports Tournaments
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Compete in sanctioned tournaments, climb competitive ladders, and claim cash prize pools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="default"
            className="shadow-[0_0_20px_rgba(236,72,153,0.35)] bg-gradient-to-r from-accent-magenta to-accent-purple text-white hover:brightness-110 border-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold"
          >
            <Plus className="w-4 h-4" /> Host Tournament
          </Button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface/60 border border-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-magenta/15 border border-accent-magenta/30 flex items-center justify-center text-accent-magenta shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.total_tournaments || tournaments.length}</div>
            <div className="text-xs text-foreground/50 font-medium">Active Tournaments</div>
          </div>
        </div>

        <div className="bg-surface/60 border border-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 relative">
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.live_count}</div>
            <div className="text-xs text-red-400 font-semibold flex items-center gap-1">
              Live Battles Now
            </div>
          </div>
        </div>

        <div className="bg-surface/60 border border-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.registration_open_count}</div>
            <div className="text-xs text-accent-cyan font-medium">Registration Open</div>
          </div>
        </div>

        <div className="bg-surface/60 border border-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-lime/15 border border-accent-lime/30 flex items-center justify-center text-accent-lime shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.total_players}</div>
            <div className="text-xs text-foreground/50 font-medium">Registered Gamers</div>
          </div>
        </div>
      </div>

      {/* Hero Spotlight Tournament */}
      {spotlightTournament && (
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-r from-surface to-background/90 p-6 md:p-8">
          <div className="absolute inset-0 z-0">
            <img
              src={spotlightTournament.banner || spotlightTournament.game?.cover_image || '/hero_cyberpunk_bg_1788280645324.jpg'}
              alt={spotlightTournament.name}
              className="w-full h-full object-cover opacity-25 filter blur-[1px] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e15] via-[#0d0e15]/80 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                {spotlightTournament.status === 'in_progress' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-black uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    LIVE CHAMPIONSHIP
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-accent-cyan/20 border border-accent-cyan/50 text-accent-cyan text-xs font-bold uppercase tracking-wider">
                    SPOTLIGHT TOURNAMENT
                  </span>
                )}

                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-xs font-bold">
                  {spotlightTournament.game?.name || 'Esports'}
                </span>

                <span className="px-3 py-1 rounded-full bg-surface border border-white/10 text-foreground/70 text-xs uppercase font-semibold">
                  {spotlightTournament.team_mode} • {spotlightTournament.format.replace('_', ' ')}
                </span>
              </div>

              <h2 className="text-2xl md:text-4xl font-display font-black text-white tracking-tight leading-tight">
                {spotlightTournament.name}
              </h2>

              <p className="text-foreground/70 text-sm md:text-base line-clamp-2">
                {spotlightTournament.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div>
                  <div className="text-xs text-foreground/50 uppercase font-bold">Prize Pool</div>
                  <div className="text-xl font-black text-[#FFD700] flex items-center gap-1.5">
                    <Trophy className="w-5 h-5 text-[#FFD700]" />
                    {spotlightTournament.prize_info || '$25,000 USD'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-foreground/50 uppercase font-bold">Brackets Filled</div>
                  <div className="text-lg font-bold text-white">
                    {spotlightTournament.registered_count} / {spotlightTournament.max_participants} Teams
                  </div>
                </div>

                <div>
                  <div className="text-xs text-foreground/50 uppercase font-bold">Region & Platform</div>
                  <div className="text-sm font-semibold text-white">
                    {spotlightTournament.region || 'Global'} • {spotlightTournament.platform_type?.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
              <Button
                onClick={() => handleToggleRegistration(spotlightTournament)}
                disabled={isActionLoading[spotlightTournament.id]}
                className={`w-full sm:w-48 py-3 rounded-xl font-bold transition-all shadow-lg ${
                  spotlightTournament.is_registered
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40'
                    : 'bg-accent-magenta hover:bg-accent-magenta/90 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                }`}
              >
                {isActionLoading[spotlightTournament.id] ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : spotlightTournament.is_registered ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Registered (Leave)
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Swords className="w-4 h-4" /> Join Tournament
                  </span>
                )}
              </Button>

              <Button
                onClick={() => openBracketModal(spotlightTournament)}
                variant="outline"
                className="w-full sm:w-48 py-3 rounded-xl font-bold border-white/20 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4 text-accent-cyan" /> View Bracket
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {[
              { id: 'all', label: 'All Tournaments' },
              { id: 'registration', label: 'Registration Open' },
              { id: 'in_progress', label: 'Live Battles', badge: stats.live_count > 0 ? String(stats.live_count) : null },
              { id: 'completed', label: 'Past Winners' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  statusFilter === tab.id
                    ? 'bg-gradient-to-r from-accent-magenta to-accent-purple text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                    : 'bg-surface/80 border border-surface-border text-foreground/70 hover:bg-surface-light hover:text-white'
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-red-500 text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchTournaments();
              }}
              placeholder="Search tournament or game..."
              className="w-full bg-surface border border-surface-border rounded-xl py-2 pl-10 pr-10 text-sm text-white placeholder:text-foreground/40 focus:outline-none focus:border-accent-magenta transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchTournaments();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Popular Games Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
          <span className="text-foreground/50 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Gamepad2 className="w-3.5 h-3.5" /> Game:
          </span>
          {POPULAR_GAMES.map((game) => (
            <button
              key={game.slug}
              onClick={() => setGameFilter(game.slug)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                gameFilter === game.slug
                  ? 'bg-white text-background'
                  : 'bg-surface/60 border border-white/5 text-foreground/60 hover:text-white hover:bg-surface'
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tournaments Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-accent-magenta animate-spin" />
          <p className="text-foreground/60 text-sm font-medium">Loading competitive tournaments...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="bg-surface/40 border border-surface-border rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <Trophy className="w-12 h-12 text-foreground/30 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Tournaments Found</h3>
          <p className="text-foreground/60 text-sm">
            {searchQuery || gameFilter !== 'all' || statusFilter !== 'all'
              ? 'Try resetting your search query or game filters.'
              : 'There are no active tournaments scheduled right now.'}
          </p>
          <Button
            onClick={() => {
              setStatusFilter('all');
              setGameFilter('all');
              setSearchQuery('');
              fetchTournaments();
            }}
            variant="outline"
            className="border-surface-border text-white"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => {
            const fillPercentage = Math.min(100, Math.round((t.registered_count / (t.max_participants || 1)) * 100));

            const statusBadge =
              t.status === 'in_progress' ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/50">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Live Now
                </span>
              ) : t.status === 'completed' ? (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-500/20 text-gray-300 border border-gray-500/40">
                  Completed
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40">
                  Registration Open
                </span>
              );

            return (
              <Card
                key={t.id}
                className="bg-surface border-surface-border overflow-hidden hover:border-accent-magenta/50 transition-all group flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Banner & Badges */}
                  <div className="h-48 relative overflow-hidden bg-background">
                    <img
                      src={t.banner || t.game?.cover_image || '/hero_cyberpunk_bg_1788280645324.jpg'}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />

                    <div className="absolute top-3 right-3 z-10">{statusBadge}</div>

                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                      <span className="bg-background/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10 flex items-center gap-1.5">
                        <Gamepad2 className="w-3.5 h-3.5 text-accent-magenta" />
                        {t.game?.name || 'Esports'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-foreground/80">
                      <span className="bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-bold text-accent-cyan">
                        {t.team_mode?.toUpperCase()} • {t.platform_type?.toUpperCase()}
                      </span>
                      <span className="bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-semibold text-white/90">
                        {t.region || 'Global'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-accent-magenta transition-colors line-clamp-1">
                        {t.name}
                      </h3>
                      <p className="text-foreground/60 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    {/* Metadata specs */}
                    <div className="grid grid-cols-2 gap-3 py-2 border-y border-white/5 text-xs">
                      <div>
                        <div className="text-foreground/50 font-semibold flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-[#FFD700]" /> Prize Pool
                        </div>
                        <div className="font-bold text-white text-sm mt-0.5 text-amber-300">
                          {t.prize_info ? t.prize_info.split(' ')[0] : '$10,000'}
                        </div>
                      </div>

                      <div>
                        <div className="text-foreground/50 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Start Date
                        </div>
                        <div className="font-bold text-white text-sm mt-0.5">
                          {t.starts_at ? new Date(t.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Soon'}
                        </div>
                      </div>
                    </div>

                    {/* Participant Slots Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-foreground/60 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> Bracket Slots
                        </span>
                        <span className="text-white">
                          {t.registered_count} / {t.max_participants} Teams
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            fillPercentage >= 100
                              ? 'bg-red-500'
                              : fillPercentage > 75
                              ? 'bg-amber-400'
                              : 'bg-gradient-to-r from-accent-cyan to-accent-magenta'
                          }`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Registered user avatars */}
                    {t.participants_preview && t.participants_preview.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-foreground/50 pt-1">
                        <div className="flex -space-x-2 overflow-hidden">
                          {t.participants_preview.slice(0, 4).map((p, pIdx) => (
                            <div
                              key={pIdx}
                              className="w-6 h-6 rounded-full bg-surface-border border-2 border-surface flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden"
                              title={p.display_name || p.username}
                            >
                              {p.avatar ? (
                                <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                (p.username || 'P').slice(0, 2)
                              )}
                            </div>
                          ))}
                        </div>
                        <span className="text-[11px] text-foreground/50">
                          {t.registered_count > 4 ? `+${t.registered_count - 4} more joined` : 'Competitors ready'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => openBracketModal(t)}
                      variant="outline"
                      className="border-surface-border hover:bg-surface-light text-xs font-bold gap-1.5"
                    >
                      <Swords className="w-3.5 h-3.5 text-accent-cyan" /> Bracket
                    </Button>

                    <Button
                      onClick={() => handleToggleRegistration(t)}
                      disabled={isActionLoading[t.id] || t.status === 'completed'}
                      className={`text-xs font-bold transition-colors ${
                        t.is_registered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                          : t.status === 'completed'
                          ? 'bg-surface-border text-foreground/40 cursor-not-allowed'
                          : 'bg-accent-magenta hover:bg-accent-magenta/90 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                      }`}
                    >
                      {isActionLoading[t.id] ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                      ) : t.is_registered ? (
                        'Registered'
                      ) : t.status === 'completed' ? (
                        'Ended'
                      ) : (
                        'Register'
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bracket Viewer Modal */}
      {isBracketOpen && selectedTournament && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10121a] border border-white/10 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-surface/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan text-[10px] font-bold uppercase">
                    {selectedTournament.format?.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-foreground/60">{selectedTournament.game?.name}</span>
                </div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2.5">
                  <Swords className="w-6 h-6 text-accent-magenta" /> {selectedTournament.name} - Bracket
                </h3>
              </div>

              <button
                onClick={closeBracketModal}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-foreground/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Elimination Match Tree */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              {isLoadingBracket ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-accent-magenta animate-spin" />
                  <p className="text-sm text-foreground/60">Generating bracket structure...</p>
                </div>
              ) : bracketRounds.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Users className="w-12 h-12 text-foreground/30 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Bracket Pending Seeding</h4>
                  <p className="text-foreground/60 text-xs max-w-sm mx-auto">
                    Bracket pairings will automatically generate once check-in concludes and team registration fills up.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {bracketRounds.map((round, rIdx) => (
                    <div key={rIdx} className="space-y-4">
                      <div className="bg-surface/80 border border-white/5 px-4 py-2 rounded-xl text-center">
                        <span className="text-xs font-black uppercase tracking-wider text-accent-cyan">
                          {round.round_name}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {round.matches.map((match) => {
                          const isCompleted = match.status === 'completed';
                          const isLive = match.status === 'in_progress';

                          return (
                            <div
                              key={match.id}
                              className={`p-3.5 rounded-2xl border transition-all ${
                                isLive
                                  ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                                  : 'bg-surface/50 border-white/5 hover:border-white/15'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] text-foreground/50 pb-2 mb-2 border-b border-white/5">
                                <span>Match #{match.match_number}</span>
                                {isLive ? (
                                  <span className="text-red-400 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" /> LIVE
                                  </span>
                                ) : isCompleted ? (
                                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Final
                                  </span>
                                ) : (
                                  <span>Scheduled</span>
                                )}
                              </div>

                              {/* Participant A */}
                              <div
                                className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold ${
                                  match.winner?.id === match.participant_a?.id
                                    ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30'
                                    : 'text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="w-5 h-5 rounded-full bg-surface-border flex items-center justify-center text-[10px]">
                                    {(match.participant_a?.user?.username || 'A').slice(0, 1).toUpperCase()}
                                  </div>
                                  <span className="truncate">
                                    {match.participant_a?.user?.display_name ||
                                      match.participant_a?.user?.username ||
                                      'TBD Seed'}
                                  </span>
                                  {match.winner?.id === match.participant_a?.id && (
                                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  )}
                                </div>
                                <span className="font-mono font-black text-sm">
                                  {match.score?.team_a ?? '-'}
                                </span>
                              </div>

                              {/* Participant B */}
                              <div
                                className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold mt-1.5 ${
                                  match.winner?.id === match.participant_b?.id
                                    ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30'
                                    : 'text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="w-5 h-5 rounded-full bg-surface-border flex items-center justify-center text-[10px]">
                                    {(match.participant_b?.user?.username || 'B').slice(0, 1).toUpperCase()}
                                  </div>
                                  <span className="truncate">
                                    {match.participant_b?.user?.display_name ||
                                      match.participant_b?.user?.username ||
                                      'TBD Seed'}
                                  </span>
                                  {match.winner?.id === match.participant_b?.id && (
                                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  )}
                                </div>
                                <span className="font-mono font-black text-sm">
                                  {match.score?.team_b ?? '-'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-surface/60 flex justify-between items-center text-xs text-foreground/60">
              <span>Double & Single Elimination rules apply. Official timestamps are in UTC.</span>
              <Button onClick={closeBracketModal} variant="outline" className="border-white/10 text-white">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Host Tournament Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10121a] border border-white/10 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-surface/40">
              <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-accent-magenta" /> Host Community Tournament
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-foreground/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1.5">Tournament Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. GameSphere Valorant Weekend Clash"
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground/70 block mb-1.5">Select Game</label>
                  <select
                    value={formData.game_id}
                    onChange={(e) => setFormData({ ...formData, game_id: e.target.value })}
                    className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta"
                  >
                    <option value="1">Valorant</option>
                    <option value="11">Counter-Strike 2</option>
                    <option value="7">Apex Legends</option>
                    <option value="14">Helldivers 2</option>
                    <option value="6">Elden Ring</option>
                    <option value="15">League of Legends</option>
                    <option value="2">Warzone</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/70 block mb-1.5">Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta"
                  >
                    <option value="single_elimination">Single Elimination</option>
                    <option value="double_elimination">Double Elimination</option>
                    <option value="round_robin">Round Robin</option>
                    <option value="battle_royale">Battle Royale</option>
                    <option value="league">League</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground/70 block mb-1.5">Team Mode</label>
                  <select
                    value={formData.team_mode}
                    onChange={(e) => setFormData({ ...formData, team_mode: e.target.value })}
                    className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta"
                  >
                    <option value="solo">Solo 1v1</option>
                    <option value="2v2">2v2</option>
                    <option value="3v3">3v3</option>
                    <option value="4v4">4v4</option>
                    <option value="5v5">5v5</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/70 block mb-1.5">Max Teams</label>
                  <input
                    type="number"
                    min="2"
                    max="64"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/70 block mb-1.5">Platform</label>
                  <select
                    value={formData.platform_type}
                    onChange={(e) => setFormData({ ...formData, platform_type: e.target.value })}
                    className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta"
                  >
                    <option value="pc">PC</option>
                    <option value="console">Console</option>
                    <option value="cross_platform">Crossplay</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1.5">Prize Details</label>
                <input
                  type="text"
                  value={formData.prize_info}
                  onChange={(e) => setFormData({ ...formData, prize_info: e.target.value })}
                  placeholder="e.g. $5,000 + GamePass codes"
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/70 block mb-1.5">Description & Rules</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="State the map pool, check-in requirements, Discord server link..."
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-magenta resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="border-surface-border text-foreground/70"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-accent-magenta text-white hover:bg-accent-magenta/90 font-bold px-6"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Tournament'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
