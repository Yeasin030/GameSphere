'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Flame,
  Monitor,
  Gamepad,
  Smartphone,
  Trophy,
  Plus,
  Clock,
  Eye,
  Bookmark,
  Share2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  X,
  AlertCircle,
  Radio,
  Send,
  Zap,
} from 'lucide-react';
import { newsApi } from '@/services/api';

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  image_url: string;
  source_url?: string;
  author?: string;
  tags?: string[];
  status?: string;
  is_featured?: boolean;
  is_breaking?: boolean;
  views_count?: number;
  saves_count?: number;
  published_at?: string;
  source?: {
    name: string;
  };
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlatform, setActivePlatform] = useState('All');
  const [savedArticles, setSavedArticles] = useState<Record<number, boolean>>({});
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Modal State for adding new article
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newAuthor, setNewAuthor] = useState('GameSphere Editorial');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80');
  const [newTags, setNewTags] = useState('PC, Gaming, Update');
  const [newIsBreaking, setNewIsBreaking] = useState(false);
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch articles from backend API
  const fetchNews = useCallback(async (showLoading = false) => {
    if (showLoading) setRefreshing(true);
    try {
      const res = await newsApi.getAll();
      if (res.data && Array.isArray(res.data.data)) {
        setArticles(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch news from backend API', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + Automatic polling every 10 seconds to auto-update when news is added to the API
  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => {
      fetchNews(false);
    }, 10000); // Polling every 10s

    return () => clearInterval(interval);
  }, [fetchNews]);

  // Handle publishing a new article to the backend API
  const handlePublishArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: newTitle.trim(),
        summary: newSummary.trim(),
        author: newAuthor.trim() || 'GameSphere Editorial',
        image_url: newImageUrl.trim(),
        tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
        is_breaking: newIsBreaking,
        is_featured: newIsFeatured,
      };

      const res = await newsApi.create(payload);
      if (res.data?.data) {
        // Prepend new article immediately
        setArticles((prev) => [res.data.data, ...prev]);
        setIsPublishModalOpen(false);
        setNewTitle('');
        setNewSummary('');
        setNewIsBreaking(false);
        setNewIsFeatured(false);

        setToastMessage('News article published successfully & live on the page!');
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Failed to publish article', err);
      alert('Failed to publish article. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBookmark = (id: number) => {
    setSavedArticles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter articles by search and platform
  const filteredArticles = articles.filter((art) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchSummary = art.summary.toLowerCase().includes(q);
      const matchTag = art.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSummary && !matchTag) return false;
    }

    if (activePlatform !== 'All') {
      const p = activePlatform.toLowerCase();
      const hasTag = art.tags?.some((t) => t.toLowerCase().includes(p));
      if (!hasTag) return false;
    }

    return true;
  });

  const featuredArticle = articles.find((a) => a.is_featured) || articles[0];
  const regularArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id);

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const diffHours = Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
    if (diffHours <= 0) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.round(diffHours / 24)}d ago`;
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0b0e14] text-[#e2e8f0] font-sans">
      {/* ─────────────────────────────────────────────────────────────
          TOP HEADER & AUTO-SYNC STATUS BAR
      ───────────────────────────────────────────────────────────── */}
      <header className="border-b border-[#161b26] bg-[#0b0e14] sticky top-0 z-30 px-6 lg:px-10 py-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="font-display font-bold text-xl lg:text-2xl text-white tracking-wide">
                Gaming News Hub
              </h1>
            </div>

            {/* Live API Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live API Auto-Sync Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex items-center flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search headlines, games..."
                className="w-full bg-[#121622] border border-[#1e2434] rounded-xl py-1.5 pl-9 pr-4 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#5542f6] transition-all"
              />
            </div>

            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={() => fetchNews(true)}
              className="p-2 rounded-xl bg-[#141926] hover:bg-[#1c2336] text-gray-300 hover:text-white border border-[#1f2639] transition-all"
              title="Refresh News Feed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#5542f6]' : ''}`} />
            </button>

            {/* Publish Article Button */}
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#5542f6] hover:bg-[#6553f8] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(85,66,246,0.4)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publish News</span>
            </button>
          </div>
        </div>

        {/* Platform Categories */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 pt-4 overflow-x-auto custom-scrollbar">
          {[
            { label: 'All', icon: Flame },
            { label: 'PC', icon: Monitor },
            { label: 'PlayStation', icon: Gamepad },
            { label: 'Xbox', icon: Gamepad },
            { label: 'Esports', icon: Trophy },
            { label: 'Mobile', icon: Smartphone },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activePlatform === cat.label;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setActivePlatform(cat.label)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#5542f6] text-white shadow-[0_0_12px_rgba(85,66,246,0.35)]'
                    : 'bg-[#121622] border border-[#1e2434] text-gray-400 hover:text-white hover:bg-[#161c2b]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT: FEATURED HERO + GRID + SIDEBAR
      ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-10 py-8 space-y-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#5542f6]/20 border-t-[#5542f6] animate-spin" />
            <p className="text-xs text-gray-400">Loading latest news from GameSphere backend...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Featured & Latest Articles */}
            <div className="lg:col-span-2 space-y-8">
              {/* 1. Breaking / Featured Hero Card */}
              {featuredArticle && (
                <div
                  onClick={() => setSelectedArticle(featuredArticle)}
                  className="relative rounded-3xl overflow-hidden group cursor-pointer border border-[#1e2537] bg-[#10141f] shadow-2xl hover:border-[#3b4766] transition-all duration-300"
                >
                  <div className="relative h-96 w-full overflow-hidden">
                    <img
                      src={featuredArticle.image_url}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/50 to-transparent" />

                    {/* Breaking Badge */}
                    <div className="absolute top-5 left-5 flex items-center gap-2">
                      {featuredArticle.is_breaking && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#ef4444] text-white shadow-[0_0_12px_#ef4444] flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-current" />
                          Breaking
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#5542f6]/90 backdrop-blur-md text-white border border-[#7a6cf8]">
                        Featured Headline
                      </span>
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute bottom-6 left-6 right-6 space-y-2.5">
                      <div className="flex items-center gap-3 text-xs text-gray-300">
                        <span className="font-semibold text-[#8b5cf6]">
                          {featuredArticle.author || 'GameSphere'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimeAgo(featuredArticle.published_at)}
                        </span>
                        {featuredArticle.views_count && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-gray-400">
                              <Eye className="w-3.5 h-3.5" />
                              {(featuredArticle.views_count / 1000).toFixed(1)}K views
                            </span>
                          </>
                        )}
                      </div>

                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white group-hover:text-[#a78bfa] transition-colors leading-tight">
                        {featuredArticle.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 leading-relaxed">
                        {featuredArticle.summary}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Latest Articles Feed */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#161b26] pb-3">
                  <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                    <span>Latest Gaming Headlines</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#182030] text-[10px] text-[#8b5cf6] font-semibold">
                      {filteredArticles.length} Stories
                    </span>
                  </h3>
                  <span className="text-xs text-gray-400">
                    Synced: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-4">
                  {regularArticles.map((art) => (
                    <div
                      key={art.id}
                      className="bg-[#10141e] border border-[#1c2333] hover:border-[#2f3a53] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 group transition-all duration-300 shadow-lg"
                    >
                      {/* Image Thumbnail */}
                      <div
                        onClick={() => setSelectedArticle(art)}
                        className="relative sm:w-48 h-36 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer bg-black"
                      >
                        <img
                          src={art.image_url}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {art.is_breaking && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-[9px] font-black uppercase text-white tracking-wider">
                            Breaking
                          </span>
                        )}
                      </div>

                      {/* Info & Details */}
                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <div className="space-y-1.5">
                          {/* Tags & Time */}
                          <div className="flex items-center gap-2 flex-wrap text-[11px]">
                            {art.tags?.slice(0, 2).map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-[#182030] text-[#8b5cf6] font-semibold border border-[#232c42]"
                              >
                                {t}
                              </span>
                            ))}
                            <span className="text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(art.published_at)}
                            </span>
                          </div>

                          <h4
                            onClick={() => setSelectedArticle(art)}
                            className="font-display font-bold text-sm sm:text-base text-white group-hover:text-[#8b5cf6] cursor-pointer transition-colors line-clamp-2"
                          >
                            {art.title}
                          </h4>

                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            {art.summary}
                          </p>
                        </div>

                        {/* Article Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#161c28] text-xs text-gray-400">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-300">{art.author || 'GameSphere'}</span>
                            {art.views_count && (
                              <span className="text-gray-500">• {art.views_count.toLocaleString()} views</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleBookmark(art.id)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                savedArticles[art.id]
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : 'bg-[#141926] text-gray-400 hover:text-white border-[#1f2638]'
                              }`}
                              title="Save Story"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedArticle(art)}
                              className="px-3 py-1 rounded-lg bg-[#182030] hover:bg-[#5542f6] text-gray-300 hover:text-white border border-[#242e44] text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <span>Read</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Trending Stories & Live Backend Feed Status */}
            <aside className="space-y-6">
              {/* Backend API Connection Widget */}
              <div className="bg-[#10141e] border border-[#1c2333] rounded-2xl p-5 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Live API Connection</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                    Online
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#161c28]">
                    <span className="text-gray-400">Backend Endpoint:</span>
                    <span className="font-mono text-gray-200 text-[11px]">/api/v1/news</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#161c28]">
                    <span className="text-gray-400">Total Articles in DB:</span>
                    <span className="font-bold text-[#8b5cf6]">{articles.length}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#161c28]">
                    <span className="text-gray-400">Auto-Polling Rate:</span>
                    <span className="text-gray-300">Every 10 seconds</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-400">Last Synced:</span>
                    <span className="text-gray-300 font-mono text-[11px]">
                      {lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fetchNews(true)}
                  className="w-full py-2 rounded-xl bg-[#141926] hover:bg-[#1f2638] border border-[#21293c] text-xs font-semibold text-gray-200 hover:text-white flex items-center justify-center gap-2 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#5542f6]' : ''}`} />
                  <span>Sync from Backend Now</span>
                </button>
              </div>

              {/* Trending Stories Ranking */}
              <div className="bg-[#10141e] border border-[#1c2333] rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#ec4899]" />
                  <span>Trending Stories</span>
                </h3>

                <div className="space-y-3.5">
                  {articles.slice(0, 5).map((art, idx) => (
                    <div
                      key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      className="flex items-start gap-3 group cursor-pointer"
                    >
                      <span className="font-display font-black text-base text-[#5542f6]/70 group-hover:text-[#5542f6] w-5">
                        0{idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs text-gray-200 group-hover:text-white line-clamp-2 transition-colors">
                          {art.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatTimeAgo(art.published_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Sources */}
              <div className="bg-[#10141e] border border-[#1c2333] rounded-2xl p-5 shadow-xl space-y-3">
                <h3 className="font-display font-bold text-sm text-white">Verified News Desks</h3>
                <div className="space-y-2.5">
                  {[
                    { name: 'GameSphere Official Desk', type: 'Primary API', badge: 'Official' },
                    { name: 'Riot Games Newsfeed', type: 'Esports & Updates', badge: 'Verified' },
                    { name: 'Valve Steam Feeds', type: 'Patch Notes & Sales', badge: 'Verified' },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-gray-200">{s.name}</p>
                        <p className="text-[10px] text-gray-400">{s.type}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[#182030] text-[10px] font-bold text-[#8b5cf6]">
                        {s.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────
          ARTICLE DETAIL MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-[#10141e] border border-[#232b3d] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl p-6 relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#182030] text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {selectedArticle.is_breaking && (
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-[10px] font-black uppercase text-white">
                    Breaking
                  </span>
                )}
                {selectedArticle.tags?.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-[#182030] text-[#8b5cf6] font-semibold text-[10px]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-bold text-white leading-snug">
                {selectedArticle.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>By {selectedArticle.author || 'GameSphere'}</span>
                <span>•</span>
                <span>{formatTimeAgo(selectedArticle.published_at)}</span>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden max-h-72 w-full bg-black">
              <img
                src={selectedArticle.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-sm text-gray-200 leading-relaxed space-y-3">
              <p>{selectedArticle.summary}</p>
            </div>

            <div className="pt-4 border-t border-[#181f2f] flex items-center justify-between">
              {selectedArticle.source_url ? (
                <a
                  href={selectedArticle.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#5542f6] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(85,66,246,0.4)]"
                >
                  <span>Visit Source Coverage</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl bg-[#182030] text-gray-300 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PUBLISH NEW ARTICLE MODAL
      ───────────────────────────────────────────────────────────── */}
      {isPublishModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setIsPublishModalOpen(false)}
        >
          <div
            className="bg-[#10141e] border border-[#232b3d] rounded-2xl max-w-lg w-full shadow-2xl p-6 relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#181f2f] pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#5542f6]" />
                <h3 className="font-display font-bold text-base text-white">Publish News Article to API</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishArticle} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Counter-Strike 2 Major Championship Grand Finals Announced"
                  className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5542f6]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Article Summary *</label>
                <textarea
                  required
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Full summary or release details for the news article..."
                  className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5542f6] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Author Name</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="PC, Esports, Patch"
                    className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Image Thumbnail URL</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6]"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsBreaking}
                    onChange={(e) => setNewIsBreaking(e.target.checked)}
                    className="rounded border-[#21293c] text-rose-500 focus:ring-0"
                  />
                  <span className="text-gray-200">Mark as Breaking News</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsFeatured}
                    onChange={(e) => setNewIsFeatured(e.target.checked)}
                    className="rounded border-[#21293c] text-[#5542f6] focus:ring-0"
                  />
                  <span className="text-gray-200">Featured Headline</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#181f2f] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
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
                    <span>Publishing...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish to API</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
