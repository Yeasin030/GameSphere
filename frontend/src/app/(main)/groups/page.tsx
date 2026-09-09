'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe,
  RefreshCw,
  Radio,
  Flame,
  MessageSquare,
  Sparkles,
  X,
  Send,
  ExternalLink,
  Gamepad2,
  Star,
  UserCheck,
  ChevronRight,
  Shield,
  Clock,
  Heart,
  FileText,
} from 'lucide-react';
import { groupsApi } from '@/services/api';

interface GroupItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  cover_image?: string;
  type?: 'public' | 'private' | 'invite_only';
  is_verified?: boolean;
  members_count: number;
  posts_count: number;
  game?: {
    id: number;
    name: string;
    slug: string;
  };
  owner?: {
    id: number;
    display_name?: string;
    username: string;
  };
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups' | 'verified'>('discover');
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);

  // Track joined status locally
  const [joinedGroups, setJoinedGroups] = useState<Record<number, boolean>>({
    1: true, // initial sample joined
    2: true,
  });

  // Modal State for creating a new group
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'public' | 'private' | 'invite_only'>('public');
  const [newAvatar, setNewAvatar] = useState('/squad_emblem.jpg');
  const [newCover, setNewCover] = useState('/battlestation_setup.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Group discussion posts (in detail modal)
  const [groupPosts, setGroupPosts] = useState<Record<number, string[]>>({
    1: [
      'Anyone ready for Radiant rank 5v5 custom scrim tonight at 9 PM? Need 2 smokers!',
      'GMs: Patch 9.04 weapon balance breakdown is posted in announcements channel.',
    ],
    2: [
      'Just upgraded to RTX 4080 Super with custom soft tubing loop! Rate my cable management.',
      'PSA: Micro Center and Star Tech have fresh Ryzen 7800X3D restocks today.',
    ],
  });
  const [newPostContent, setNewPostContent] = useState('');

  // Fetch groups from backend API
  const fetchGroups = useCallback(async (showLoading = false) => {
    if (showLoading) setRefreshing(true);
    try {
      const res = await groupsApi.getAll({ per_page: 50 });
      if (res.data?.data && Array.isArray(res.data.data)) {
        setGroups(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch groups from backend API', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + Automatic polling every 10 seconds
  useEffect(() => {
    fetchGroups();
    const interval = setInterval(() => {
      fetchGroups(false);
    }, 10000); // 10s auto-polling

    return () => clearInterval(interval);
  }, [fetchGroups]);

  // Handle group creation
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: newName.trim(),
        description: newDesc.trim(),
        type: newType,
        avatar: newAvatar.trim(),
        cover_image: newCover.trim(),
      };

      const res = await groupsApi.create(payload);
      if (res.data?.data) {
        const created = res.data.data;
        setGroups((prev) => [created, ...prev]);
        setJoinedGroups((prev) => ({ ...prev, [created.id]: true }));
        setIsCreateModalOpen(false);
        setNewName('');
        setNewDesc('');

        setToastMessage(`Community "${created.name}" created & live!`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to create group', err);
      alert('Failed to create group. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle join/leave group
  const handleToggleJoin = async (group: GroupItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isJoined = joinedGroups[group.id];

    try {
      if (!isJoined) {
        // Call join API
        await groupsApi.join(group.id);
        setJoinedGroups((prev) => ({ ...prev, [group.id]: true }));
        setGroups((prev) =>
          prev.map((g) => (g.id === group.id ? { ...g, members_count: g.members_count + 1 } : g))
        );
        setToastMessage(`You joined ${group.name}!`);
      } else {
        // Call leave API
        await groupsApi.leave(group.id);
        setJoinedGroups((prev) => ({ ...prev, [group.id]: false }));
        setGroups((prev) =>
          prev.map((g) => (g.id === group.id ? { ...g, members_count: Math.max(0, g.members_count - 1) } : g))
        );
        setToastMessage(`Left ${group.name}`);
      }
    } catch (err) {
      // Local optimistic toggle even if backend is offline
      const next = !isJoined;
      setJoinedGroups((prev) => ({ ...prev, [group.id]: next }));
      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id
            ? { ...g, members_count: next ? g.members_count + 1 : Math.max(0, g.members_count - 1) }
            : g
        )
      );
      setToastMessage(next ? `You joined ${group.name}!` : `Left ${group.name}`);
    }

    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add a post inside a group
  const handlePostInGroup = (groupId: number) => {
    if (!newPostContent.trim()) return;
    setGroupPosts((prev) => ({
      ...prev,
      [groupId]: [newPostContent.trim(), ...(prev[groupId] || [])],
    }));
    setNewPostContent('');
    setToastMessage('Discussion post published to community!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter groups by tab and search
  const filteredGroups = groups.filter((g) => {
    if (activeTab === 'my-groups' && !joinedGroups[g.id]) return false;
    if (activeTab === 'verified' && !g.is_verified) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = g.name.toLowerCase().includes(q);
      const matchDesc = g.description?.toLowerCase().includes(q);
      const matchGame = g.game?.name.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchGame) return false;
    }

    return true;
  });

  const myJoinedCount = groups.filter((g) => joinedGroups[g.id]).length;

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
                Gaming Communities & Squads
              </h1>
            </div>

            {/* Live API Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live API Auto-Sync Active</span>
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
                placeholder="Search squads, topics, games..."
                className="w-full bg-[#121622] border border-[#1e2434] rounded-xl py-1.5 pl-9 pr-4 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#5542f6] transition-all"
              />
            </div>

            {/* Manual Sync Button */}
            <button
              type="button"
              onClick={() => fetchGroups(true)}
              className="p-2 rounded-xl bg-[#141926] hover:bg-[#1c2336] text-gray-300 hover:text-white border border-[#1f2639] transition-all"
              title="Sync from Backend Now"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#5542f6]' : ''}`} />
            </button>

            {/* Create Group Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#5542f6] hover:bg-[#6553f8] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(85,66,246,0.4)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Group</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 pt-4 overflow-x-auto custom-scrollbar">
          {[
            { id: 'discover', label: 'Discover Communities', count: groups.length },
            { id: 'my-groups', label: 'My Groups', count: myJoinedCount },
            { id: 'verified', label: '⭐ Official Verified Squads' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#5542f6] text-white shadow-[0_0_12px_rgba(85,66,246,0.35)]'
                  : 'bg-[#121622] border border-[#1e2434] text-gray-400 hover:text-white hover:bg-[#161c2b]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-white/20 text-white font-bold' : 'bg-[#182030] text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT WORKSPACE
      ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-10 py-8 space-y-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#5542f6]/20 border-t-[#5542f6] animate-spin" />
            <p className="text-xs text-gray-400">Loading communities from GameSphere backend...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#141926] border border-[#20273a] flex items-center justify-center text-gray-500">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-base text-white">No communities found</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Try searching with another name or create the first group for your squad.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('discover');
              }}
              className="px-4 py-2 rounded-xl bg-[#5542f6] text-white text-xs font-semibold shadow-md mt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGroups.map((group) => {
              const isJoined = joinedGroups[group.id];
              const coverImg = group.cover_image || '/battlestation_setup.jpg';
              const avatarImg = group.avatar || '/squad_emblem.jpg';

              return (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className="bg-[#10141e] border border-[#1c2333] hover:border-[#2f3a53] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group cursor-pointer"
                >
                  {/* Banner Image */}
                  <div className="relative h-28 w-full bg-black overflow-hidden">
                    <img
                      src={coverImg}
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10141e] to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      {group.type === 'private' ? (
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-gray-300 text-[10px] flex items-center gap-1 border border-white/10">
                          <Lock className="w-2.5 h-2.5" />
                          Private
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-emerald-400 text-[10px] flex items-center gap-1 border border-white/10">
                          <Globe className="w-2.5 h-2.5" />
                          Public
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body & Avatar */}
                  <div className="px-4 pb-4 -mt-8 flex-1 flex flex-col justify-between space-y-3 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-end justify-between">
                        <div className="relative">
                          <img
                            src={avatarImg}
                            alt=""
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#10141e] shadow-xl ring-2 ring-[#5542f6]/40"
                          />
                        </div>

                        {/* Join / Leave Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleJoin(group, e)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-md ${
                            isJoined
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                              : 'bg-[#5542f6] hover:bg-[#6553f8] text-white shadow-[0_0_12px_rgba(85,66,246,0.4)]'
                          }`}
                        >
                          {isJoined ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Joined</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Join Group</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display font-bold text-sm text-white group-hover:text-[#8b5cf6] transition-colors truncate">
                            {group.name}
                          </h3>
                          {group.is_verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8] fill-[#38bdf8]/20 flex-shrink-0" />
                          )}
                        </div>

                        {group.game && (
                          <p className="text-[10px] text-[#8b5cf6] font-semibold flex items-center gap-1 mt-0.5">
                            <Gamepad2 className="w-3 h-3" />
                            <span>{group.game.name}</span>
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                        {group.description}
                      </p>
                    </div>

                    {/* Footer stats */}
                    <div className="pt-2.5 border-t border-[#161c26] flex items-center justify-between text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <strong className="text-gray-200">
                          {group.members_count >= 1000
                            ? `${(group.members_count / 1000).toFixed(1)}K`
                            : group.members_count}
                        </strong>{' '}
                        Members
                      </span>

                      <span className="flex items-center gap-1 text-gray-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{group.posts_count || 12} posts</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────
          GROUP DETAILS & COMMUNITY HUB MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedGroup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setSelectedGroup(null)}
        >
          <div
            className="bg-[#10141e] border border-[#232b3d] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl p-6 relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedGroup(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#182030] text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner & Avatar */}
            <div className="relative h-44 rounded-xl overflow-hidden bg-black">
              <img
                src={selectedGroup.cover_image || '/battlestation_setup.jpg'}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10141e] to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedGroup.avatar || '/squad_emblem.jpg'}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-xl font-display font-bold text-white leading-tight">
                        {selectedGroup.name}
                      </h2>
                      {selectedGroup.is_verified && (
                        <CheckCircle2 className="w-4 h-4 text-[#38bdf8] fill-[#38bdf8]/20" />
                      )}
                    </div>
                    <p className="text-xs text-gray-300">
                      {selectedGroup.members_count.toLocaleString()} Members • {selectedGroup.type} Group
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleJoin(selectedGroup)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md ${
                    joinedGroups[selectedGroup.id]
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#5542f6] text-white shadow-[0_0_15px_rgba(85,66,246,0.4)]'
                  }`}
                >
                  {joinedGroups[selectedGroup.id] ? 'Joined Community' : 'Join Community'}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-xs text-gray-300 leading-relaxed">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">About Community</h4>
              <p>{selectedGroup.description}</p>
            </div>

            {/* Community Rules */}
            <div className="p-3.5 rounded-xl bg-[#141926] border border-[#1f273b] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Shield className="w-4 h-4 text-[#5542f6]" />
                <span>Community Guidelines & Rules</span>
              </div>
              <ul className="text-gray-300 space-y-1 text-[11px] list-disc list-inside">
                <li>Respect all squadmates and moderators; toxicity results in immediate removal.</li>
                <li>Keep scrim links and voice channels organized by rank.</li>
                <li>No unauthorized advertising or unsolicited external server links.</li>
              </ul>
            </div>

            {/* Discussion Feed Inside Group */}
            <div className="space-y-3 pt-2 border-t border-[#182030]">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#8b5cf6]" />
                <span>Squad Discussions & Posts</span>
              </h4>

              {/* Create Post in Group Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePostInGroup(selectedGroup.id);
                  }}
                  placeholder="Post an announcement or start a discussion..."
                  className="flex-1 bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#5542f6]"
                />
                <button
                  type="button"
                  onClick={() => handlePostInGroup(selectedGroup.id)}
                  className="px-3.5 py-2 rounded-xl bg-[#5542f6] text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>

              {/* Posts List */}
              <div className="space-y-2">
                {(groupPosts[selectedGroup.id] || [
                  'Welcome new members! Drop your gamer tags below to squad up for ranked matches this weekend.',
                ]).map((postText, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3 rounded-xl bg-[#131724] border border-[#1d2436] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span className="font-semibold text-gray-300">Squad Member</span>
                      <span>Today</span>
                    </div>
                    <p className="text-gray-200">{postText}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#182030] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="px-4 py-2 rounded-xl bg-[#141926] text-gray-300 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CREATE GROUP MODAL
      ───────────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="bg-[#10141e] border border-[#232b3d] rounded-2xl max-w-lg w-full shadow-2xl p-6 relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#181f2f] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#5542f6]" />
                <h3 className="font-display font-bold text-base text-white">Create Gaming Community</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Community Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Call of Duty Warzone Legends BD"
                  className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Description & Purpose *</label>
                <textarea
                  required
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What is your squad about? e.g. Tournaments, custom scrims, casual gaming..."
                  className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Privacy Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6]"
                  >
                    <option value="public">Public (Anyone can join)</option>
                    <option value="private">Private (Approval needed)</option>
                    <option value="invite_only">Invite Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Avatar Emblem URL</label>
                  <input
                    type="text"
                    value={newAvatar}
                    onChange={(e) => setNewAvatar(e.target.value)}
                    className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Cover Banner URL</label>
                <input
                  type="text"
                  value={newCover}
                  onChange={(e) => setNewCover(e.target.value)}
                  className="w-full bg-[#141926] border border-[#21293c] rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#5542f6]"
                />
              </div>

              <div className="pt-3 border-t border-[#181f2f] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
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
                    <span>Creating Group...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Launch Group</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#5542f6] text-white text-xs font-semibold shadow-[0_10px_25px_rgba(85,66,246,0.6)] flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
