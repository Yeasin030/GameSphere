'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Search, 
  Heart, 
  Share2, 
  Eye, 
  Sparkles, 
  Flame, 
  Gamepad2, 
  Trophy, 
  BookOpen, 
  Smile, 
  Check, 
  Layers, 
  Film, 
  TrendingUp, 
  Clock, 
  RotateCw, 
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useVideoStore, VideoItem } from '@/stores/videoStore';

const CATEGORIES = [
  { key: 'all', label: 'All Videos' },
  { key: 'highlights', label: 'Highlights', icon: Flame },
  { key: 'gameplay', label: 'Gameplay', icon: Gamepad2 },
  { key: 'guide', label: 'Guides & Bosses', icon: BookOpen },
  { key: 'esports', label: 'Esports', icon: Trophy },
  { key: 'tutorial', label: 'Tutorials', icon: Sparkles },
  { key: 'funny', label: 'Funny Moments', icon: Smile },
];

export default function VideoPage() {
  const { 
    videos, 
    activeVideo, 
    selectedCategory, 
    searchQuery, 
    sort, 
    isLoading, 
    isPlaying, 
    fetchVideos, 
    selectVideo, 
    likeVideo, 
    setCategory, 
    setSearchQuery, 
    setSort, 
    setIsPlaying, 
    togglePlay 
  } = useVideoStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Initial load
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Video element playback synchronization
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, activeVideo, setIsPlaying]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Video link copied to clipboard!');
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen().catch(err => {
          console.error(err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleVideoSelect = (vid: VideoItem) => {
    selectVideo(vid);
    // Scroll to player smoothly
    playerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Up next queue (excluding active video)
  const upNextVideos = videos.filter(v => v.id !== activeVideo?.id);

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#161b26] border border-[#2b3548] text-white rounded-2xl shadow-2xl shadow-cyan-500/20 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header: Title & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-[#1b2333]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Film className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
              GameSphere Cinema
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
              4K Gaming Clips
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1.5 ml-13">
            Watch pro esports, walkthroughs, funny fails, and 4K graphics showcases.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search games, clips, creators..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#101624] border border-[#202b40] rounded-2xl py-2 pl-10 pr-4 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            {searchInput && (
              <button 
                type="button" 
                onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </form>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort videos by"
            className="bg-[#101624] border border-[#202b40] rounded-2xl px-3 py-2 text-xs font-semibold text-gray-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="latest">Latest</option>
            <option value="trending">Trending</option>
            <option value="popular">Most Liked</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.key;
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.35)] scale-[1.02]'
                  : 'bg-[#0e1422] text-gray-400 border-[#1a2336] hover:bg-[#141d30] hover:text-gray-200'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Featured Video Player & Up Next Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Cinema Player Section (8 Cols) */}
        <div className="lg:col-span-8 space-y-5" ref={playerContainerRef}>
          {activeVideo ? (
            <div className="space-y-4">
              {/* Video Player Box */}
              <div className="relative rounded-3xl overflow-hidden bg-black aspect-video shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-[#1b2538] group">
                <video
                  ref={videoRef}
                  src={activeVideo.file_path}
                  poster={activeVideo.poster_path || activeVideo.thumbnail_path || undefined}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlay}
                  playsInline
                />

                {/* Big Center Play Button Overlay when paused */}
                {!isPlaying && (
                  <div 
                    onClick={togglePlay}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white fill-current ml-1" />
                    </div>
                  </div>
                )}

                {/* Badges Overlay (Top-left / Top-right) */}
                <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE CINEMA
                  </span>
                  {activeVideo.game && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-300 border border-blue-500/40 backdrop-blur-md">
                      {activeVideo.game.name}
                    </span>
                  )}
                </div>

                {/* Player Bottom Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2.5 opacity-95 group-hover:opacity-100 transition-opacity">
                  
                  {/* Progress Seek Bar */}
                  <div className="relative flex items-center group/seek">
                    <input 
                      type="range" 
                      min={0} 
                      max={duration || activeVideo.duration || 100} 
                      value={currentTime} 
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:h-2.5 transition-all"
                    />
                  </div>

                  {/* Buttons Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={togglePlay}
                        className="w-9 h-9 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-transform hover:scale-105"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>

                      <button 
                        onClick={handleToggleMute}
                        className="p-2 text-white/80 hover:text-white transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                      </button>

                      <span className="text-xs font-medium text-white/80 tracking-wider">
                        {formatSeconds(currentTime)} / {formatSeconds(duration || activeVideo.duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleFullscreen}
                        className="p-2 text-white/80 hover:text-white transition-colors"
                        title="Fullscreen"
                      >
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Title & Action Bar */}
              <div className="space-y-4 bg-[#0d1320] border border-[#1b2538] p-5 sm:p-6 rounded-3xl">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {activeVideo.category}
                    </span>
                    {activeVideo.game && (
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-[#182338] text-gray-300 border border-[#253654]">
                        🎮 {activeVideo.game.name}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    {activeVideo.title}
                  </h2>
                </div>

                {/* Creator Profile & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#1a2336]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px]">
                      {activeVideo.user?.avatar ? (
                        <img 
                          src={activeVideo.user.avatar} 
                          alt={activeVideo.user.display_name} 
                          className="w-full h-full object-cover rounded-2xl" 
                        />
                      ) : (
                        <div className="w-full h-full bg-[#121929] rounded-2xl flex items-center justify-center text-cyan-400 font-bold text-base">
                          {activeVideo.user?.display_name?.charAt(0) || 'G'}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-white hover:text-cyan-300 transition-colors cursor-pointer">
                        {activeVideo.user?.display_name || 'GameSphere Pro'}
                      </h4>
                      <p className="text-xs text-gray-400">
                        @{activeVideo.user?.username || 'gamer'} • Verified Creator
                      </p>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 rounded-xl text-xs h-8"
                    >
                      Follow
                    </Button>
                  </div>

                  {/* Like, Views & Share Buttons */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => likeVideo(activeVideo.id)}
                      className={`gap-2 rounded-xl transition-all ${
                        activeVideo.is_liked 
                          ? 'bg-pink-500/20 border-pink-500/50 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.35)]' 
                          : 'border-[#222f47] text-gray-300 hover:text-white hover:bg-[#1a2336]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${activeVideo.is_liked ? 'fill-current' : ''}`} />
                      <span>{activeVideo.likes_count?.toLocaleString()}</span>
                    </Button>

                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#121927] border border-[#1f2a3f] rounded-xl text-xs text-gray-300 font-medium">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span>{activeVideo.views_count?.toLocaleString()} views</span>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleShare}
                      className="border-[#222f47] text-gray-300 hover:text-white hover:bg-[#1a2336] rounded-xl gap-1.5"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </Button>
                  </div>
                </div>

                {/* Video Description Box */}
                {activeVideo.description && (
                  <div className="mt-4 p-4 rounded-2xl bg-[#0a0f18] border border-[#172033] text-xs sm:text-sm text-gray-300 space-y-2">
                    <p className={isDescriptionExpanded ? '' : 'line-clamp-2'}>
                      {activeVideo.description}
                    </p>
                    <button 
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-xs font-semibold text-cyan-400 hover:underline"
                    >
                      {isDescriptionExpanded ? 'Show less' : 'Read full breakdown...'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="aspect-video rounded-3xl bg-[#0e1422] border border-[#1b2538] flex flex-col items-center justify-center text-center p-6">
              <Film className="w-12 h-12 text-gray-600 mb-3" />
              <h3 className="text-lg font-bold text-white">No video selected</h3>
              <p className="text-sm text-gray-400">Select a video from the showcase below to begin watching.</p>
            </div>
          )}
        </div>

        {/* Up Next Sidebar Playlist (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Up Next & Recommended
            </h3>
            <span className="text-xs text-gray-400">{upNextVideos.length} clips</span>
          </div>

          <div className="space-y-3 max-h-[750px] overflow-y-auto custom-scrollbar pr-1">
            {upNextVideos.map((video) => (
              <Card 
                key={video.id}
                onClick={() => handleVideoSelect(video)}
                className="p-2.5 rounded-2xl bg-[#0d1320] border border-[#1a2336] hover:border-cyan-500/40 hover:bg-[#121929] cursor-pointer transition-all group flex gap-3 overflow-hidden shadow-sm"
              >
                {/* Thumbnail */}
                <div className="relative w-36 sm:w-40 aspect-video rounded-xl overflow-hidden shrink-0 bg-black">
                  <img 
                    src={video.thumbnail_path || '/clutch_gameplay.jpg'} 
                    alt={video.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-white">
                    {video.duration_human}
                  </span>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 text-black fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {video.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1 truncate">
                      {video.user?.display_name || 'Gamer'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                    <span>{video.views_count?.toLocaleString()} views</span>
                    <span>•</span>
                    <span>{video.created_at_human}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Video Showcase Grid (All Videos) */}
      <div className="space-y-5 pt-6 border-t border-[#1b2333]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-bold text-white">
              Explore More Gaming Videos
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Discover gameplay walkthroughs, competitive scrims, and tutorials.
            </p>
          </div>
          <span className="text-xs font-semibold text-cyan-400">
            {videos.length} Total Videos
          </span>
        </div>

        {/* Loading Skeletons */}
        {isLoading && videos.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="p-3 rounded-2xl bg-[#0e1422] border border-[#1a2336] animate-pulse space-y-3">
                <div className="aspect-video bg-[#1a2436] rounded-xl" />
                <div className="h-4 bg-[#1a2436] rounded w-3/4" />
                <div className="h-3 bg-[#151d2c] rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && videos.length === 0 && (
          <div className="text-center py-16 px-4 bg-[#0d121c]/60 border border-[#1b2437] rounded-3xl">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white">No videos found</h3>
            <p className="text-gray-400 text-xs mt-1">
              Try adjusting your category filter or search keywords.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { setCategory('all'); setSearchQuery(''); setSearchInput(''); }}
              className="mt-4 border-[#222f47] text-gray-300 hover:text-white rounded-xl text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Video Cards Grid */}
        {videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {videos.map((vid) => {
              const isCurrent = activeVideo?.id === vid.id;

              return (
                <Card 
                  key={vid.id}
                  onClick={() => handleVideoSelect(vid)}
                  className={`group relative p-3 rounded-2xl bg-[#0d1320] border transition-all duration-200 cursor-pointer overflow-hidden ${
                    isCurrent 
                      ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.01]' 
                      : 'border-[#1b2538] hover:border-cyan-500/50 hover:bg-[#121929]'
                  }`}
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-3">
                    <img 
                      src={vid.thumbnail_path || '/clutch_gameplay.jpg'} 
                      alt={vid.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Duration Badge */}
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-white">
                      {vid.duration_human}
                    </span>

                    {/* Category pill */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                      {vid.category}
                    </span>

                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                      </div>
                    </div>

                    {isCurrent && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-cyan-500 text-black text-[10px] font-bold">
                        NOW PLAYING
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {vid.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="truncate max-w-[120px]">
                        {vid.user?.display_name || 'Gamer'}
                      </span>
                      {vid.game && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#172033] text-gray-300">
                          {vid.game.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-[#172233]">
                      <span>{vid.views_count?.toLocaleString()} views</span>
                      <span className="flex items-center gap-1 text-pink-400/80 font-medium">
                        <Heart className="w-3 h-3 fill-current" /> {vid.likes_count?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
