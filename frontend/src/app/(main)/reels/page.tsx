'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown, 
  Bookmark, 
  Sparkles, 
  Send, 
  Gamepad2, 
  X,
  Check
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useReelStore, ReelItem } from '@/stores/reelStore';

export default function ReelsPage() {
  const { 
    reels, 
    activeIndex, 
    isLoading, 
    isMuted, 
    isPlaying, 
    fetchReels, 
    setActiveIndex, 
    nextReel, 
    prevReel, 
    likeReel, 
    toggleSave, 
    toggleMute, 
    togglePlay, 
    setIsPlaying 
  } = useReelStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentsList, setCommentsList] = useState<string[]>([
    "Insane reaction time! What rank is this?",
    "That crosshair placement was so clean bro 🔥",
    "Bro is playing in 2030 while we are in 2026",
    "The audio sync made this 100x better 😂",
  ]);
  const [newComment, setNewComment] = useState('');
  const [isFollowing, setIsFollowing] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Sync video play/pause and source when activeIndex changes
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setProgress(0);
    if (isPlaying) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [activeIndex, isPlaying, setIsPlaying]);

  // Sync mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Keyboard navigation (Up / Down arrow keys, Space to pause, M to mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        nextReel();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        prevReel();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextReel, prevReel, togglePlay, toggleMute]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(pct);
    }
  };

  const handleVideoClick = () => {
    togglePlay();
  };

  const handleDoubleTap = (reelId: number) => {
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 800);
    if (!currentReel?.is_liked) {
      likeReel(reelId);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Reel link copied to clipboard!');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentsList([newComment, ...commentsList]);
    setNewComment('');
    showToast('Comment posted!');
  };

  const toggleFollow = (userId: number) => {
    setIsFollowing(prev => ({ ...prev, [userId]: !prev[userId] }));
    showToast(!isFollowing[userId] ? 'Followed creator!' : 'Unfollowed');
  };

  const currentReel: ReelItem | undefined = reels[activeIndex];

  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full flex items-center justify-center bg-[#070a10] overflow-hidden relative select-none animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#161b26] border border-[#2b3548] text-white rounded-2xl shadow-2xl shadow-cyan-500/20 animate-in slide-in-from-top-5">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Reels Center Container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-[440px] h-[95%] md:h-[820px] bg-black md:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-[#1d273a] flex flex-col justify-between"
      >
        {currentReel ? (
          <>
            {/* Background HTML5 Looping Video */}
            <div 
              className="absolute inset-0 z-0 bg-black cursor-pointer"
              onClick={handleVideoClick}
              onDoubleClick={() => handleDoubleTap(currentReel.id)}
            >
              <video
                ref={videoRef}
                src={currentReel.file_path}
                poster={currentReel.thumbnail_path || undefined}
                onTimeUpdate={handleTimeUpdate}
                loop
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Heart Burst Animation on Double Tap */}
              {showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <Heart className="w-28 h-28 text-pink-500 fill-pink-500 animate-ping opacity-90 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
                </div>
              )}

              {/* Overlay Gradient for contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

              {/* Big Pause Indicator */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Top Bar: Feed Indicator & Sound Toggle */}
            <div className="relative z-20 p-4 pt-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md border border-white/10 text-cyan-300">
                  REEL {activeIndex + 1} OF {reels.length}
                </span>
                {currentReel.game && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                    🎮 {currentReel.game.name}
                  </span>
                )}
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white transition-colors"
                title={isMuted ? "Unmute sound" : "Mute sound"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
            </div>

            {/* Bottom Overlay: Creator & Actions */}
            <div className="relative z-20 p-4 pb-5 flex items-end justify-between gap-4">
              
              {/* Left Side: Creator, Caption, Music */}
              <div className="flex-1 space-y-3 pointer-events-auto pr-2">
                {/* Creator Header */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar 
                      src={currentReel.user?.avatar || '/profile_avatar.jpg'} 
                      alt={currentReel.user?.display_name || 'Gamer'} 
                      className="w-11 h-11 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
                  </div>

                  <div>
                    <h3 className="text-white font-bold text-base drop-shadow-md hover:text-cyan-300 cursor-pointer">
                      {currentReel.user?.display_name || 'Pro Gamer'}
                    </h3>
                    <p className="text-cyan-300/80 text-xs font-medium drop-shadow-sm">
                      @{currentReel.user?.username || 'gamer'}
                    </p>
                  </div>

                  <button 
                    onClick={() => currentReel.user && toggleFollow(currentReel.user.id)}
                    className={`ml-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      currentReel.user && isFollowing[currentReel.user.id]
                        ? 'bg-white/20 text-gray-200 border border-white/30'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    }`}
                  >
                    {currentReel.user && isFollowing[currentReel.user.id] ? 'Following' : 'Follow'}
                  </button>
                </div>

                {/* Caption with Hashtags */}
                <p className="text-white text-xs sm:text-sm drop-shadow-md leading-relaxed line-clamp-3">
                  {currentReel.caption.split(' ').map((word, i) => 
                    word.startsWith('#') ? (
                      <span key={i} className="text-cyan-400 font-semibold hover:underline cursor-pointer">
                        {word}{' '}
                      </span>
                    ) : (
                      <span key={i}>{word} </span>
                    )
                  )}
                </p>

                {/* Audio Ticker & Spinning Vinyl */}
                <div className="flex items-center gap-2 text-white text-xs bg-black/50 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10 w-fit max-w-[280px]">
                  <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate text-gray-200 font-medium">
                    {currentReel.audio_name}
                  </span>
                </div>
              </div>

              {/* Right Side: Floating Action Stack */}
              <div className="flex flex-col items-center gap-4 z-20 pb-2">
                
                {/* Like Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); likeReel(currentReel.id); }}
                  className="flex flex-col items-center gap-1 group/btn transition-transform active:scale-90"
                >
                  <div className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${
                    currentReel.is_liked 
                      ? 'bg-pink-500/30 border-pink-500 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.6)]' 
                      : 'bg-black/50 border-white/15 text-white hover:bg-white/20'
                  }`}>
                    <Heart className={`w-6 h-6 transition-all ${currentReel.is_liked ? 'fill-current scale-110' : ''}`} />
                  </div>
                  <span className="text-white text-xs font-bold drop-shadow-md">
                    {formatCount(currentReel.likes_count)}
                  </span>
                </button>

                {/* Comments Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowCommentsModal(true); }}
                  className="flex flex-col items-center gap-1 group/btn transition-transform active:scale-90"
                >
                  <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/15 text-white hover:bg-white/20 transition-all">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-white text-xs font-bold drop-shadow-md">
                    {formatCount(currentReel.comments_count)}
                  </span>
                </button>

                {/* Save / Bookmark Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleSave(currentReel.id); showToast(currentReel.is_saved ? 'Removed bookmark' : 'Reel bookmarked!'); }}
                  className="flex flex-col items-center gap-1 group/btn transition-transform active:scale-90"
                >
                  <div className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${
                    currentReel.is_saved 
                      ? 'bg-amber-500/30 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]' 
                      : 'bg-black/50 border-white/15 text-white hover:bg-white/20'
                  }`}>
                    <Bookmark className={`w-5 h-5 ${currentReel.is_saved ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-white text-xs font-bold drop-shadow-md">
                    {formatCount(currentReel.saves_count)}
                  </span>
                </button>

                {/* Share Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleShare(); }}
                  className="flex flex-col items-center gap-1 group/btn transition-transform active:scale-90"
                >
                  <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/15 text-white hover:bg-white/20 transition-all">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-white text-xs font-bold drop-shadow-md">
                    {formatCount(currentReel.shares_count)}
                  </span>
                </button>

                {/* Spinning Vinyl Record with Creator Avatar */}
                <div className="mt-1 relative w-11 h-11 rounded-full border-2 border-cyan-400 overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-[spin_4s_linear_infinite]">
                  <img 
                    src={currentReel.user?.avatar || '/profile_avatar.jpg'} 
                    className="w-full h-full object-cover" 
                    alt="Audio track" 
                  />
                </div>
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-100 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Loading Gaming Reels...</h3>
            <p className="text-xs text-gray-400">Fetching short-form gaming clips from the server.</p>
          </div>
        )}

        {/* Comments Slide-up Drawer */}
        {showCommentsModal && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-40 p-4 flex flex-col animate-in slide-in-from-bottom-10 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" /> Comments ({commentsList.length})
              </h4>
              <button 
                onClick={() => setShowCommentsModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-3">
              {commentsList.map((c, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[10px] font-bold text-cyan-300 shrink-0">
                    G{i + 1}
                  </div>
                  <div className="flex-1 text-xs">
                    <span className="font-semibold text-gray-300">Gamer_{i + 1}</span>
                    <p className="text-gray-200 mt-0.5">{c}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex gap-2">
              <input 
                type="text"
                placeholder="Add a gaming comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              />
              <Button type="submit" size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-black px-3 rounded-xl">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        )}

      </div>

      {/* Floating Vertical Next / Prev Navigation Buttons (Desktop) */}
      <div className="hidden md:flex flex-col items-center gap-3 ml-6 z-20">
        <button
          onClick={prevReel}
          disabled={activeIndex === 0}
          className="w-12 h-12 rounded-full bg-[#121929] border border-[#23314d] text-white hover:bg-cyan-500 hover:text-black flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:hover:bg-[#121929] disabled:hover:text-white"
          title="Previous Reel (or press Up Arrow)"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        <span className="text-xs font-bold text-cyan-400/80 bg-[#121929] px-2.5 py-1 rounded-full border border-[#23314d]">
          {activeIndex + 1}/{reels.length}
        </span>

        <button
          onClick={nextReel}
          disabled={activeIndex >= reels.length - 1}
          className="w-12 h-12 rounded-full bg-[#121929] border border-[#23314d] text-white hover:bg-cyan-500 hover:text-black flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:hover:bg-[#121929] disabled:hover:text-white"
          title="Next Reel (or press Down Arrow)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Quick Select Reel Thumbnails Strip (Desktop right side) */}
      <div className="hidden xl:flex flex-col gap-2.5 ml-10 max-h-[700px] overflow-y-auto custom-scrollbar pr-2 z-20">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
          Quick Jump
        </span>
        {reels.map((reel, idx) => (
          <div
            key={reel.id}
            onClick={() => setActiveIndex(idx)}
            className={`group relative w-16 h-24 rounded-2xl overflow-hidden cursor-pointer border transition-all ${
              idx === activeIndex 
                ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-105' 
                : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
            }`}
          >
            <img 
              src={reel.thumbnail_path || '/clutch_gameplay.jpg'} 
              alt={reel.caption} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors" />
            <span className="absolute bottom-1 right-1 text-[9px] font-bold text-white bg-black/70 px-1 rounded">
              #{idx + 1}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
