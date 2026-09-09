'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Monitor,
  Gamepad,
  Gamepad2,
  Smartphone,
  Plus,
  Star,
  Users,
  Flame,
  Clock,
  Sparkles,
  RefreshCw,
  Radio,
  ExternalLink,
  ChevronDown,
  X,
  Send,
  Zap,
  CheckCircle2,
  Shield,
  Layers,
  Download,
} from 'lucide-react';
import { gamesApi } from '@/services/api';

interface GameItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  developer?: string;
  publisher?: string;
  cover_image?: string;
  cover_image_url?: string;
  background_image?: string;
  banner_image_url?: string;
  rating?: number;
  average_rating?: number;
  players_count?: number;
  is_featured?: boolean;
  is_trending?: boolean;
  is_free?: boolean;
  release_date?: string;
  genres?: { id: number; name: string; slug: string }[];
  platforms?: { id: number; name: string; slug: string }[];
}

export default function GamesDiscoveryPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'players' | 'rating' | 'release' | 'trending'>('players');
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [trackedGames, setTrackedGames] = useState<Record<number, boolean>>({});

  // Modal State for adding new game
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDev, setNewDev] = useState('');
  const [newRating, setNewRating] = useState('4.8');
  const [newPlayers, setNewPlayers] = useState('50000');
  const [newGenres, setNewGenres] = useState('Shooter, Action');
  const [newPlatforms, setNewPlatforms] = useState('PC, PlayStation 5');
  const [newCover, setNewCover] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80');
  const [newIsFree, setNewIsFree] = useState(true);
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [newIsTrending, setNewIsTrending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch games from backend API
  const fetchGames = useCallback(async (showLoading = false) => {
    if (showLoading) setRefreshing(true);
    try {
      const res = await gamesApi.getAll({ per_page: 50, sort: sortBy });
      if (res.data?.data && Array.isArray(res.data.data)) {
        setGames(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch games from backend API', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortBy]);

  // Initial load + Automatic polling every 10 seconds to auto-update when new games are added via API
  useEffect(() => {
    fetchGames();
    const interval = setInterval(() => {
      fetchGames(false);
    }, 10000); // 10s auto-polling

    return () => clearInterval(interval);
  }, [fetchGames]);

  // Handle publishing a new game to the backend API
  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: newName.trim(),
        description: newDesc.trim(),
        developer: newDev.trim() || 'GameSphere Studios',
        rating: parseFloat(newRating) || 4.8,
        players_count: parseInt(newPlayers, 10) || 25000,
        genres: newGenres.split(',').map((g) => g.trim()).filter(Boolean),
        platforms: newPlatforms.split(',').map((p) => p.trim()).filter(Boolean),
        cover_image: newCover.trim(),
        is_free: newIsFree,
        is_featured: newIsFeatured,
        is_trending: newIsTrending,
      };

      const res = await gamesApi.create(payload);
      if (res.data?.data) {
        setGames((prev) => [res.data.data, ...prev]);
        setIsAddModalOpen(false);
        setNewName('');
        setNewDesc('');
        setToastMessage(`"${payload.name}" added to GameSphere API & live!`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to add game', err);
      alert('Failed to add game. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTrackGame = (id: number, name: string) => {
    const nextState = !trackedGames[id];
    setTrackedGames((prev) => ({ ...prev, [id]: nextState }));
    setToastMessage(nextState ? `Added ${name} to your library!` : `Removed ${name} from your library`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter games based on platform, genre, and search query
  const filteredGames = games.filter((game) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = game.name?.toLowerCase().includes(q);
      const matchDev = game.developer?.toLowerCase().includes(q);
      const matchDesc = game.description?.toLowerCase().includes(q);
      const matchGenre = game.genres?.some((g) => g.name.toLowerCase().includes(q));
      if (!matchName && !matchDev && !matchDesc && !matchGenre) return false;
    }

    if (selectedPlatform !== 'All') {
      const p = selectedPlatform.toLowerCase();
      const hasPlatform = game.platforms?.some((item) => item.name.toLowerCase().includes(p));
      if (!hasPlatform) return false;
    }

    if (selectedGenre !== 'All') {
      const g = selectedGenre.toLowerCase();
      const hasGenre = game.genres?.some((item) => item.name.toLowerCase().includes(g));
      if (!hasGenre) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0b0e14] text-[#e2e8f0] font-sans">
      {/* ─────────────────────────────────────────────────────────────
          TOP GLOBAL HEADER & AUTO-SYNC BAR
      ───────────────────────────────────────────────────────────── */}
      <header className="border-b border-[#161b26] bg-[#0b0e14] sticky top-0 z-30 px-6 lg:px-10 py-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="font-display font-bold text-xl lg:text-2xl text-white tracking-wide">
                Games Directory
              </h1>
            </div>

            {/* Live API Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live API Auto-Sync Active (Every 10s)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex items-center flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games, devs, tags..."
                className="w-full bg-[#121622] border border-[#1e2434] rounded-xl py-1.5 pl-9 pr-4 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#5542f6] transition-all"
              />
            </div>

            {/* Manual Sync Button */}
            <button
              type="button"
              onClick={() => fetchGames(true)}
              className="p-2 rounded-xl bg-[#141926] hover:bg-[#1c2336] text-gray-300 hover:text-white border border-[#1f2639] transition-all"
              title="Sync from Backend Now"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#5542f6]' : ''}`} />
            </button>

            {/* Add Game to API Button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#5542f6] hover:bg-[#6553f8] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(85,66,246,0.4)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Game to API</span>
            </button>
          </div>
        </div>

        {/* Platform & Sorting Filter Bar */}
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#141926] mt-3">
          {/* Platforms */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
            {[
              { label: 'All', icon: Flame },
              { label: 'PC', icon: Monitor },
              { label: 'PlayStation', icon: Gamepad },
              { label: 'Xbox', icon: Gamepad2 },
              { label: 'Switch', icon: Gamepad },
              { label: 'Mobile', icon: Smartphone },
            ].map((p) => {
              const Icon = p.icon;
              const isActive = selectedPlatform === p.label;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setSelectedPlatform(p.label)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#5542f6] text-white shadow-[0_0_12px_rgba(85,66,246,0.35)]'
                      : 'bg-[#121622] border border-[#1e2434] text-gray-400 hover:text-white hover:bg-[#161c2b]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#121622] border border-[#1e2434] rounded-xl py-1 px-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#5542f6]"
            >
              <option value="players">Most Active Players</option>
              <option value="rating">Highest Rated</option>
              <option value="trending">Trending Now</option>
              <option value="release">Newest Releases</option>
            </select>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT AREA
      ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-10 py-8 space-y-6">
        {/* Genre filter pills */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs">
            {[
              'All',
              'Shooter',
              'Action',
              'RPG',
              'Battle Royale',
              'Sandbox',
              'Sports',
              'Adventure',
              'Simulation',
            ].map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-xl font-medium transition-all ${
                  selectedGenre === genre
                    ? 'bg-[#182030] text-white border border-[#2a3652]'
                    : 'text-gray-400 hover:text-white hover:bg-[#121622]'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-400 hidden sm:block whitespace-nowrap">
            Showing <strong className="text-white">{filteredGames.length}</strong> games
          </span>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#5542f6]/20 border-t-[#5542f6] animate-spin" />
            <p className="text-xs text-gray-400">Loading games from GameSphere backend...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#141926] border border-[#20273a] flex items-center justify-center text-gray-500">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-base text-white">No games match your criteria</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Try adjusting your search query or selecting a different platform or genre filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedPlatform('All');
                setSelectedGenre('All');
              }}
              className="px-4 py-2 rounded-xl bg-[#5542f6] text-white text-xs font-semibold shadow-md mt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredGames.map((game) => {
              const coverImg = game.cover_image || game.cover_image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
              const isTracked = trackedGames[game.id];
              return (
                <div
                  key={game.id}
                  className="bg-[#10141e] border border-[#1c2333] hover:border-[#2f3a53] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group"
                >
                  {/* Card Cover Image */}
                  <div
                    onClick={() => setSelectedGame(game)}
                    className="relative h-48 w-full bg-black overflow-hidden cursor-pointer"
                  >
                    <img
                      src={coverImg}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10141e] via-transparent to-black/40" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {game.is_free ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-white font-black text-[9px] uppercase tracking-wider shadow-md">
                            Free to Play
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-[#5542f6]/90 text-white font-bold text-[9px] uppercase tracking-wider shadow-md">
                            Featured
                          </span>
                        )}
                        {game.is_trending && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white font-bold text-[9px] uppercase tracking-wider shadow-md flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5 fill-current" />
                            Hot
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-amber-400 font-bold text-[10px] flex items-center gap-1 border border-white/10">
                        <Star className="w-3 h-3 fill-current" />
                        {(game.rating || game.average_rating || 4.8).toFixed(1)}
                      </span>
                    </div>

                    {/* Players count overlay on bottom */}
                    {game.players_count && (
                      <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[11px] text-gray-200 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                        <Users className="w-3 h-3 text-emerald-400" />
                        <span className="font-semibold">
                          {(game.players_count / 1000).toFixed(0)}K Online
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h3
                        onClick={() => setSelectedGame(game)}
                        className="font-display font-bold text-sm text-white group-hover:text-[#8b5cf6] cursor-pointer transition-colors line-clamp-1"
                      >
                        {game.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 truncate">
                        {game.developer || 'GameSphere Studios'}
                      </p>

                      <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed pt-1">
                        {game.short_description || game.description}
                      </p>
                    </div>

                    {/* Genres / Platforms */}
                    <div className="space-y-3 pt-2 border-t border-[#161c26]">
                      <div className="flex flex-wrap gap-1">
                        {game.genres?.slice(0, 3).map((g) => (
                          <span
                            key={g.id || g.name}
                            className="px-1.5 py-0.5 rounded bg-[#161c2a] text-[#8b5cf6] text-[10px] font-medium border border-[#21293c]"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleTrackGame(game.id, game.name)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            isTracked
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-[#151a27] hover:bg-[#1f2638] text-gray-300 hover:text-white border border-[#20283a]'
                          }`}
                        >
                          {isTracked ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>In Library</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Track Game</span>
                            </>
                          )}
                        </button>

                        <Link
                          href={`/games/${game.slug}`}
                          className="px-3 py-1.5 rounded-xl bg-[#5542f6] hover:bg-[#6654f8] text-white text-xs font-semibold transition-all shadow-[0_0_12px_rgba(85,66,246,0.35)] flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────
          GAME DETAIL MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedGame && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setSelectedGame(null)}
        >
          <div
            className="bg-[#10141e] border border-[#232b3d] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl p-6 relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedGame(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#182030] text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-56 rounded-xl overflow-hidden bg-black">
              <img
                src={selectedGame.cover_image || selectedGame.cover_image_url}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10141e] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white leading-tight">
                    {selectedGame.name}
                  </h2>
                  <p className="text-xs text-gray-300">
                    Developer: {selectedGame.developer || 'GameSphere'} • Publisher: {selectedGame.publisher || 'GameSphere'}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-amber-400 font-bold text-xs flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {(selectedGame.rating || selectedGame.average_rating || 4.8).toFixed(1)} / 5.0
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center py-2 border-y border-[#182030]">
              <div>
                <p className="text-xs text-gray-400">Active Players</p>
                <p className="font-display font-bold text-white text-sm sm:text-base">
                  {(selectedGame.players_count || 12000).toLocaleString()}
                </p>
              </div>
              <div className="border-x border-[#182030]">
                <p className="text-xs text-gray-400">Release Date</p>
                <p className="font-display font-bold text-white text-sm sm:text-base">
                  {selectedGame.release_date || 'Available Now'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Pricing</p>
                <p className="font-display font-bold text-emerald-400 text-sm sm:text-base">
                  {selectedGame.is_free ? 'Free to Play' : 'Premium'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-300 leading-relaxed">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">About Game</h4>
              <p>{selectedGame.description}</p>
            </div>

            {/* Platforms & Genres */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Supported Platforms</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedGame.platforms?.map((p) => (
                  <span
                    key={p.id || p.name}
                    className="px-2.5 py-1 rounded-lg bg-[#141926] text-gray-200 border border-[#21293c] text-xs"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#182030] flex items-center justify-between">
              <button
                type="button"
                onClick={() => toggleTrackGame(selectedGame.id, selectedGame.name)}
                className="px-4 py-2 rounded-xl bg-[#141926] text-gray-300 hover:text-white border border-[#232c42] text-xs font-semibold"
              >
                {trackedGames[selectedGame.id] ? 'In Your Library' : '+ Add to Library'}
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href={`/games/${selectedGame.slug}`}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Go to Download Page</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setSelectedGame(null)}
                  className="px-4 py-2 rounded-xl bg-[#141926] text-gray-300 hover:text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ADD GAME MODAL
      ───────────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-[#10141e] border border-[#232b3d] rounded-2xl max-w-lg w-full shadow-2xl p-6 relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#181f2f] pb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-[#5542f6]" />
                <h3 className="font-display font-bold text-base text-white">Add Game to Backend API</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGame} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Game Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Helldivers 2"
                  className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief synopsis and gameplay description..."
                  className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Developer</label>
                  <input
                    type="text"
                    value={newDev}
                    onChange={(e) => setNewDev(e.target.value)}
                    placeholder="Arrowhead Game Studios"
                    className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={newRating}
                    onChange={(e) => setNewRating(e.target.value)}
                    className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={newGenres}
                    onChange={(e) => setNewGenres(e.target.value)}
                    placeholder="Shooter, Action, Co-op"
                    className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Platforms (comma separated)</label>
                  <input
                    type="text"
                    value={newPlatforms}
                    onChange={(e) => setNewPlatforms(e.target.value)}
                    placeholder="PC, PlayStation 5"
                    className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={newCover}
                  onChange={(e) => setNewCover(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6]"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsFree}
                    onChange={(e) => setNewIsFree(e.target.checked)}
                    className="rounded border-[#21293c] text-emerald-500 focus:ring-0"
                  />
                  <span className="text-gray-200">Free to Play</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsFeatured}
                    onChange={(e) => setNewIsFeatured(e.target.checked)}
                    className="rounded border-[#21293c] text-[#5542f6] focus:ring-0"
                  />
                  <span className="text-gray-200">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsTrending}
                    onChange={(e) => setNewIsTrending(e.target.checked)}
                    className="rounded border-[#21293c] text-rose-500 focus:ring-0"
                  />
                  <span className="text-gray-200">Trending</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#181f2f] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#141926] text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#5542f6] hover:bg-[#6553f8] text-white font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(85,66,246,0.4)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Adding to API...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Save & Publish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#5542f6] text-white text-xs font-semibold shadow-[0_10px_25px_rgba(85,66,246,0.6)] flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
