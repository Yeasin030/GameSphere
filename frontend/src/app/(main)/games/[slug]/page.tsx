'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Star,
  Monitor,
  Gamepad,
  Gamepad2,
  Smartphone,
  Download,
  Play,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Bookmark,
  Users,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Pause,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { gamesApi } from '@/services/api';

interface GameDetails {
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

export default function GameDownloadPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [inLibrary, setInLibrary] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interactive Download Simulator State
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'paused' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('88.5 MB/s');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    gamesApi
      .getBySlug(slug)
      .then((res) => {
        if (res.data?.data) {
          setGame(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load game details', err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Download simulation timer
  useEffect(() => {
    let timer: any;
    if (downloadState === 'downloading') {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setDownloadState('completed');
            setToastMessage(`${game?.name || 'Game'} download complete! Ready to play.`);
            setTimeout(() => setToastMessage(null), 4000);
            return 100;
          }
          // Randomize download speed slightly for realism
          const speed = (80 + Math.random() * 25).toFixed(1);
          setDownloadSpeed(`${speed} MB/s`);
          return prev + Math.floor(Math.random() * 8) + 4;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [downloadState, game]);

  const handleStartDownload = () => {
    if (downloadState === 'idle' || downloadState === 'completed') {
      setProgress(0);
      setDownloadState('downloading');
      setToastMessage(`Starting download for ${game?.name || 'Game'}...`);
      setTimeout(() => setToastMessage(null), 3000);
    } else if (downloadState === 'downloading') {
      setDownloadState('paused');
    } else if (downloadState === 'paused') {
      setDownloadState('downloading');
    }
  };

  const handleLaunchGame = () => {
    alert(`🚀 Launching ${game?.name || 'Game'} Client! Enjoy your game!`);
  };

  const toggleLibrary = () => {
    const next = !inLibrary;
    setInLibrary(next);
    setToastMessage(next ? `Added ${game?.name} to your Games Library!` : `Removed ${game?.name} from Library`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#5542f6]/20 border-t-[#5542f6] animate-spin" />
        <p className="text-xs text-gray-400">Loading game and download packages...</p>
      </div>
    );
  }

  // Fallback data if game not found
  const gameData: GameDetails = game || {
    id: 1,
    name: slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Featured Game',
    slug: slug || 'game',
    description: 'Experience intense competitive multiplayer gaming with high-fidelity graphics, rich physics, and cross-platform squad matches.',
    developer: 'GameSphere Studios',
    publisher: 'GameSphere Publishing',
    cover_image: '/clutch_gameplay.jpg',
    background_image: '/clutch_gameplay.jpg',
    rating: 4.9,
    players_count: 120000,
    is_free: true,
    release_date: '2024',
    genres: [{ id: 1, name: 'Action', slug: 'action' }, { id: 2, name: 'Shooter', slug: 'shooter' }],
    platforms: [{ id: 1, name: 'PC', slug: 'pc' }, { id: 2, name: 'PlayStation 5', slug: 'ps5' }],
  };

  const bgImage = gameData.background_image || gameData.banner_image_url || gameData.cover_image || '/battlestation_setup.jpg';
  const coverImage = gameData.cover_image || gameData.cover_image_url || '/squad_emblem.jpg';
  const fileSize = '42.8 GB';

  return (
    <div className="relative min-h-screen bg-[#0b0e14] text-[#e2e8f0] font-sans pb-24">
      {/* ─────────────────────────────────────────────────────────────
          HERO COVER BACKDROP
      ───────────────────────────────────────────────────────────── */}
      <div className="relative h-[480px] w-full overflow-hidden">
        <img
          src={bgImage}
          alt={gameData.name}
          className="w-full h-full object-cover opacity-35 filter blur-[1px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14]/90 via-transparent to-[#0b0e14]/90" />

        {/* Top Floating Navigation */}
        <div className="absolute top-6 left-6 right-6 max-w-7xl mx-auto flex items-center justify-between z-20">
          <Link
            href="/games"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 text-xs font-semibold text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Games Catalog</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLibrary}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
                inLibrary
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{inLibrary ? 'In Library' : 'Add to Library'}</span>
            </button>

            <button
              type="button"
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN GAME HEADER INFO & DOWNLOAD HUB
      ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 -mt-52 relative z-10 space-y-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8">
          {/* Game Poster Image */}
          <div className="w-48 sm:w-56 lg:w-64 aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-2 border-[#1f273b] bg-black shrink-0 relative group">
            <img
              src={coverImage}
              alt={gameData.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {gameData.is_free ? (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider shadow-lg">
                Free to Play
              </span>
            ) : (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#5542f6] text-white font-bold text-[10px] uppercase tracking-wider shadow-lg">
                Official Release
              </span>
            )}
          </div>

          {/* Game Title & Metadata */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {gameData.genres?.map((g) => (
                <span
                  key={g.id || g.name}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#182030] text-[#8b5cf6] border border-[#27324c]"
                >
                  {g.name}
                </span>
              ))}
              <span className="text-xs text-emerald-400 font-bold">
                ● {(gameData.players_count || 120000).toLocaleString()} Players Online
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-wide leading-tight">
              {gameData.name}
            </h1>

            <p className="text-xs sm:text-sm text-gray-300">
              Developed by <strong className="text-white">{gameData.developer || 'GameSphere'}</strong> • Published by {gameData.publisher || 'GameSphere'} • Released {gameData.release_date || '2024'}
            </p>

            <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed">
              {gameData.description}
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">User Rating</p>
                  <p className="font-display font-bold text-base text-white">
                    {(gameData.rating || gameData.average_rating || 4.9).toFixed(1)} / 5.0
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Client Size</p>
                  <p className="font-display font-bold text-base text-white">{fileSize}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Community</p>
                  <p className="font-display font-bold text-base text-white">Active Global Servers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            DOWNLOAD / PLAY ACTION CARD (PRIMARY INTERACTIVE HUB)
        ───────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#121626] via-[#101422] to-[#16122a] border border-[#212a40] rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#5542f6]/20 text-[#8b5cf6] border border-[#5542f6]/30">
                Official Game Client Installer
              </span>
              <h3 className="font-display font-bold text-xl lg:text-2xl text-white">
                Download & Play {gameData.name}
              </h3>
              <p className="text-xs text-gray-400">
                Version 3.4.1 • Verified Digital Signature • Anti-Cheat Included • Free Updates
              </p>
            </div>

            {/* Action Download Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {downloadState === 'completed' ? (
                <button
                  type="button"
                  onClick={handleLaunchGame}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-display font-bold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all animate-bounce"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Launch Game Client</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartDownload}
                  className="px-6 py-3.5 rounded-2xl bg-[#5542f6] hover:bg-[#6654f8] text-white font-display font-bold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(85,66,246,0.5)] transition-all active:scale-95"
                >
                  {downloadState === 'downloading' ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span>Pause Download</span>
                    </>
                  ) : downloadState === 'paused' ? (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Resume Download</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Download Game ({fileSize})</span>
                    </>
                  )}
                </button>
              )}

              {downloadState !== 'idle' && (
                <button
                  type="button"
                  onClick={() => { setDownloadState('idle'); setProgress(0); }}
                  className="p-3.5 rounded-2xl bg-[#141926] hover:bg-[#1f2638] text-gray-300 border border-[#242e44] transition-all"
                  title="Reset Download"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Download Progress Bar when active */}
          {downloadState !== 'idle' && (
            <div className="space-y-2 bg-[#0c0f18] p-4 rounded-2xl border border-[#1b2234] animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${downloadState === 'completed' ? 'bg-emerald-400' : 'bg-[#5542f6] animate-ping'}`} />
                  <span className="text-white">
                    {downloadState === 'completed' ? 'Ready to Play' : downloadState === 'paused' ? 'Download Paused' : 'Downloading Game Packages...'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  {downloadState === 'downloading' && (
                    <span className="text-emerald-400 font-mono text-[11px]">⚡ {downloadSpeed}</span>
                  )}
                  <span className="text-white font-bold">{progress}%</span>
                </div>
              </div>

              <div className="w-full h-3 rounded-full bg-[#161c2b] overflow-hidden p-0.5 border border-[#21293c]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    downloadState === 'completed'
                      ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]'
                      : 'bg-gradient-to-r from-[#5542f6] to-[#ec4899] shadow-[0_0_15px_#5542f6]'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Location: C:\Program Files\GameSphere\{gameData.slug}</span>
                <span>{((progress / 100) * 42.8).toFixed(1)} GB / {fileSize}</span>
              </div>
            </div>
          )}

          {/* Official Store Download Mirrors */}
          <div className="pt-4 border-t border-[#181f30] space-y-3">
            <h4 className="font-semibold text-xs text-gray-300 uppercase tracking-wider">
              Available Store Download Links & Launchers
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Steam Client', store: 'Steam', icon: 'https://www.svgrepo.com/show/354388/steam.svg', color: 'bg-[#171a21]' },
                { name: 'Epic Games', store: 'Epic', icon: 'https://www.svgrepo.com/show/353702/epic-games.svg', color: 'bg-[#121212]' },
                { name: 'PlayStation Store', store: 'PS5', icon: 'https://www.svgrepo.com/show/303248/playstation-6-logo.svg', color: 'bg-[#003791]' },
                { name: 'Xbox Store', store: 'Xbox', icon: 'https://www.svgrepo.com/show/303284/xbox-9-logo.svg', color: 'bg-[#107C10]' },
              ].map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => alert(`Redirecting to official ${m.name} download page...`)}
                  className={`p-3 rounded-2xl ${m.color} border border-white/10 hover:border-white/30 text-white flex items-center gap-3 transition-all hover:scale-[1.02] shadow-lg`}
                >
                  <img src={m.icon} alt="" className="w-5 h-5 object-contain filter invert" />
                  <div className="text-left">
                    <p className="font-bold text-xs leading-none">{m.store}</p>
                    <p className="text-[10px] text-gray-300">Get Game</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            SYSTEM REQUIREMENTS & SPECS
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#10141e] border border-[#1c2333] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-[#161b28] pb-3">
              <Cpu className="w-5 h-5 text-[#5542f6]" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Minimum PC Requirements
              </h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#141926]">
                <span className="text-gray-400">OS:</span>
                <span className="font-medium text-gray-200">Windows 10 / 11 64-bit</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141926]">
                <span className="text-gray-400">Processor:</span>
                <span className="font-medium text-gray-200">Intel Core i5-6600K / AMD Ryzen 5 1600</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141926]">
                <span className="text-gray-400">Memory:</span>
                <span className="font-medium text-gray-200">12 GB RAM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141926]">
                <span className="text-gray-400">Graphics:</span>
                <span className="font-medium text-gray-200">NVIDIA GeForce GTX 1060 (6GB) / AMD RX 580</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Storage:</span>
                <span className="font-medium text-gray-200">{fileSize} SSD Recommended</span>
              </div>
            </div>
          </div>

          <div className="bg-[#10141e] border border-[#1c2333] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-[#161b28] pb-3">
              <Zap className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Recommended PC Specs (144+ FPS)
              </h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#141926]">
                <span className="text-gray-400">OS:</span>
                <span className="font-medium text-gray-200">Windows 11 64-bit Latest</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141926]">
                <span className="text-gray-400">Processor:</span>
                <span className="font-medium text-gray-200">Intel Core i7-12700K / AMD Ryzen 7 7800X3D</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141926]">
                <span className="text-gray-400">Memory:</span>
                <span className="font-medium text-gray-200">32 GB Dual-Channel RAM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141926]">
                <span className="text-gray-400">Graphics:</span>
                <span className="font-medium text-gray-200">NVIDIA GeForce RTX 4070 / AMD Radeon RX 7800 XT</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">DirectX:</span>
                <span className="font-medium text-gray-200">Version 12 Ultimate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#5542f6] text-white text-xs font-semibold shadow-[0_10px_25px_rgba(85,66,246,0.6)] flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
