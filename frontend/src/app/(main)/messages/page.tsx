'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import {
  Search,
  Phone,
  Video,
  Info,
  Pin,
  X,
  Play,
  Pause,
  Plus,
  Smile,
  Image as ImageIcon,
  Mic,
  Send,
  SlidersHorizontal,
  SquarePen,
  Volume2,
  VolumeX,
  CheckCheck,
  UserPlus,
  Pencil,
  FileText,
  ChevronRight,
  LogOut,
  Bell,
  MessageCircle,
  FolderArchive,
  CheckCircle2,
  MicOff,
} from 'lucide-react';

// Sample conversation list data matching the screenshot
interface Conversation {
  id: string;
  name: string;
  avatar: string;
  isGroup?: boolean;
  isVerified?: boolean;
  time: string;
  lastMessage: string;
  senderPrefix?: string;
  unreadCount?: number;
  statusDot?: 'online' | 'idle' | 'offline';
  isVoice?: boolean;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 'valorant-squad',
    name: 'Valorant Squad',
    avatar: '/squad_emblem.jpg',
    isGroup: true,
    time: '2m',
    senderPrefix: 'RohanX:',
    lastMessage: "Let's warm up in DM tonight 🔥",
    unreadCount: 5,
  },
  {
    id: 'rohanx',
    name: 'RohanX',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    time: '2m',
    senderPrefix: 'You:',
    lastMessage: 'See you in the match!',
    unreadCount: 2,
    statusDot: 'online',
  },
  {
    id: 'arik-gamer',
    name: 'Arik Gamer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    time: '15m',
    senderPrefix: 'Arik:',
    lastMessage: 'Nice shot! 🎯',
    statusDot: 'online',
  },
  {
    id: 'shadowplayz',
    name: 'ShadowPlayz',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    time: '1h',
    lastMessage: 'Sent a video',
    statusDot: 'online',
  },
  {
    id: 'tournament-team',
    name: 'Tournament Team',
    avatar: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&auto=format&fit=crop&q=80',
    isGroup: true,
    time: '2h',
    senderPrefix: 'Lina:',
    lastMessage: 'Bracket is out',
    unreadCount: 3,
  },
  {
    id: 'lina',
    name: 'Lina',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    time: '3h',
    lastMessage: 'Voice message',
    isVoice: true,
    unreadCount: 1,
    statusDot: 'online',
  },
  {
    id: 'devhunter',
    name: 'DevHunter',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    time: '4h',
    senderPrefix: 'You:',
    lastMessage: 'Thanks!',
    statusDot: 'idle',
  },
  {
    id: 'progamerx',
    name: 'ProGamerX',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    time: '5h',
    senderPrefix: 'ProGamerX:',
    lastMessage: 'GG WP',
  },
  {
    id: 'minecraft-builders',
    name: 'Minecraft Builders',
    avatar: 'https://images.unsplash.com/photo-1627856014754-2907e2355324?w=150&auto=format&fit=crop&q=80',
    isGroup: true,
    time: '1d',
    senderPrefix: 'Steve:',
    lastMessage: 'Server is back online!',
  },
  {
    id: 'efootball-league',
    name: 'eFootball League',
    avatar: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=80',
    isGroup: true,
    time: '2d',
    senderPrefix: 'Admin:',
    lastMessage: 'New season started',
    unreadCount: 4,
  },
];

interface Member {
  name: string;
  avatar: string;
  role?: string;
  status: string;
  isOnline?: boolean;
}

const SQUAD_MEMBERS: Member[] = [
  {
    name: 'RohanX',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    role: 'Owner',
    status: 'Online',
    isOnline: true,
  },
  {
    name: 'Arik Gamer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'Admin',
    status: 'Online',
    isOnline: true,
  },
  {
    name: 'Lina',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Admin',
    status: 'Online',
    isOnline: true,
  },
  {
    name: 'ShadowPlayz',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'Admin',
    status: 'Online',
    isOnline: true,
  },
  {
    name: 'DevHunter',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Last seen 1h ago',
    isOnline: false,
  },
  {
    name: 'ProGamerX',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'Last seen 2h ago',
    isOnline: false,
  },
  {
    name: 'NightFury',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    status: 'Last seen 4h ago',
    isOnline: false,
  },
];

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [selectedChat, setSelectedChat] = useState<string>('valorant-squad');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'groups' | 'requests'>('all');
  const [showRightPanel, setShowRightPanel] = useState<boolean>(true);
  const [showPinned, setShowPinned] = useState<boolean>(true);
  const [isVoicePlaying, setIsVoicePlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'other';
    name?: string;
    avatar?: string;
    text?: string;
    time: string;
    reactions?: Array<{ emoji: string; count: number; active?: boolean }>;
    isVoice?: boolean;
    voiceDuration?: string;
    isVideo?: boolean;
    videoThumbnail?: string;
    videoCaption?: string;
    isSystem?: boolean;
  }>>([
    {
      id: 'm1',
      sender: 'other',
      name: 'RohanX',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
      text: "Hey team! How's the practice going? 💪",
      time: '10:30 AM',
      reactions: [{ emoji: '❤️', count: 4, active: false }],
    },
    {
      id: 'm2',
      sender: 'user',
      text: 'Pretty good! We need to work on our site takes.',
      time: '10:31 AM',
    },
    {
      id: 'm3',
      sender: 'other',
      name: 'Arik Gamer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      text: 'I can play Omen today.',
      time: '10:32 AM',
      reactions: [{ emoji: '👍', count: 2, active: false }],
    },
    {
      id: 'm3_sub',
      sender: 'other',
      name: 'Arik Gamer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      text: 'What do you think?',
      time: '10:32 AM',
    },
    {
      id: 'm4',
      sender: 'other',
      name: 'Lina',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isVoice: true,
      voiceDuration: '0:08',
      time: '10:33 AM',
      reactions: [{ emoji: '🔥', count: 3, active: false }],
    },
    {
      id: 'm5',
      sender: 'other',
      name: 'ShadowPlayz',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      isVideo: true,
      videoThumbnail: '/clutch_gameplay.jpg',
      videoCaption: 'Insane clutch in the last round! 😱',
      time: '10:34 AM',
      reactions: [{ emoji: '🔥', count: 6, active: false }],
    },
    {
      id: 'm-sys',
      sender: 'other',
      isSystem: true,
      text: 'DevHunter joined the group',
      time: '10:34 AM',
    },
    {
      id: 'm6',
      sender: 'user',
      text: 'WOW! That was epic! 🔥',
      time: '10:35 AM',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user' as const,
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setTimeout(scrollToBottom, 50);
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId) return msg;
        const existing = msg.reactions?.find((r) => r.emoji === emoji);
        let updatedReactions = msg.reactions ? [...msg.reactions] : [];

        if (existing) {
          updatedReactions = updatedReactions.map((r) =>
            r.emoji === emoji
              ? { ...r, count: r.active ? r.count - 1 : r.count + 1, active: !r.active }
              : r
          );
        } else {
          updatedReactions.push({ emoji, count: 1, active: true });
        }
        return { ...msg, reactions: updatedReactions };
      })
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0b0e14] text-[#e2e8f0] overflow-hidden select-none font-sans">
      {/* ─────────────────────────────────────────────────────────────
          TOP GLOBAL HEADER BAR
      ───────────────────────────────────────────────────────────── */}
      <header className="h-16 border-b border-[#161b26] bg-[#0b0e14] flex items-center justify-between px-5 flex-shrink-0 z-30">
        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search players, groups, messages..."
              className="w-full bg-[#121622] border border-[#1e2434] rounded-xl py-2 pl-10 pr-16 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#5542f6] focus:ring-1 focus:ring-[#5542f6] transition-all"
            />
            <span className="absolute right-3 px-1.5 py-0.5 rounded-md bg-[#1b2234] border border-[#27314a] text-[10px] text-gray-400 font-mono tracking-tight">
              Ctrl /
            </span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3 ml-4">
          {/* Create Button */}
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-[#141926] hover:bg-[#1c2336] text-gray-300 hover:text-white flex items-center justify-center border border-[#1f2639] transition-all"
            title="Create"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative w-9 h-9 rounded-xl bg-[#141926] hover:bg-[#1c2336] text-gray-300 hover:text-white flex items-center justify-center border border-[#1f2639] transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ec4899] text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_#ec4899]">
              8
            </span>
          </button>

          {/* Messages shortcut */}
          <button
            type="button"
            className="relative w-9 h-9 rounded-xl bg-[#141926] hover:bg-[#1c2336] text-gray-300 hover:text-white flex items-center justify-center border border-[#1f2639] transition-all"
            title="Messages"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ec4899] text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_#ec4899]">
              3
            </span>
          </button>

          {/* User Profile Avatar */}
          <Link href="/profile" className="relative cursor-pointer ml-1" title="View Profile">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-[#5542f6]/40 hover:ring-[#5542f6] transition-all">
              <img
                src={user?.avatar_url || user?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${user?.username || 'Gamer'}`}
                alt={user?.display_name || user?.name || 'User profile'}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0b0e14]" />
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MAIN 3-COLUMN WORKSPACE
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── COLUMN 1: CONVERSATIONS LIST ─── */}
        <div className="w-80 lg:w-[320px] xl:w-[340px] flex flex-col border-r border-[#161b26] bg-[#0d1017] flex-shrink-0">
          {/* Header & Tabs */}
          <div className="p-4 border-b border-[#161b26]/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <h1 className="font-display font-bold text-xl text-white tracking-wide">
                Messages
              </h1>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#161b28] transition-colors"
                  title="Filter options"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg bg-[#5542f6] hover:bg-[#6553f7] text-white transition-colors shadow-[0_0_10px_rgba(85,66,246,0.3)]"
                  title="New conversation"
                >
                  <SquarePen className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 text-xs">
              {(['all', 'unread', 'groups', 'requests'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 capitalize ${
                    activeTab === tab
                      ? 'bg-[#182030] text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#141926]'
                  }`}
                >
                  <span>{tab === 'all' ? 'All' : tab === 'unread' ? 'Unread' : tab === 'groups' ? 'Groups' : 'Requests'}</span>
                  {tab === 'unread' && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#ec4899] text-white leading-tight">
                      8
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Conversations Input */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-gray-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-[#121622] border border-[#1e2434] rounded-xl py-2 pl-9 pr-9 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#5542f6]"
              />
              <button
                type="button"
                className="absolute right-2.5 text-gray-500 hover:text-gray-300"
                title="Filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {CONVERSATIONS.map((chat) => {
              const isSelected = selectedChat === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`relative p-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-3 group ${
                    isSelected
                      ? 'bg-[#141a27] border border-[#2b354d] shadow-[0_0_15px_rgba(0,0,0,0.3)]'
                      : 'hover:bg-[#131722] border border-transparent'
                  }`}
                >
                  {/* Avatar Container */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-10 h-10 rounded-xl object-cover border border-[#202738]"
                    />
                    {chat.statusDot && (
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#0d1017] ${
                          chat.statusDot === 'online'
                            ? 'bg-emerald-500'
                            : 'bg-amber-400'
                        }`}
                      />
                    )}
                  </div>

                  {/* Name and Last Message */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-xs text-white truncate">
                          {chat.name}
                        </span>
                        {chat.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8] fill-[#38bdf8]/20 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                        {chat.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <p className="text-[11px] text-gray-400 truncate pr-2 flex items-center gap-1">
                        {chat.isVoice && (
                          <Mic className="w-3 h-3 text-[#ec4899] inline flex-shrink-0" />
                        )}
                        {chat.senderPrefix && (
                          <span className="text-gray-300 font-medium">
                            {chat.senderPrefix}{' '}
                          </span>
                        )}
                        <span className={chat.unreadCount ? 'text-gray-300 font-medium' : 'text-gray-400'}>
                          {chat.lastMessage}
                        </span>
                      </p>

                      {chat.unreadCount && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#5542f6] text-white rounded-full flex-shrink-0 leading-none shadow-[0_0_8px_rgba(85,66,246,0.6)]">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Archived Chats item */}
            <div className="p-2.5 rounded-xl cursor-pointer hover:bg-[#131722] transition-colors flex items-center gap-3 border border-transparent mt-2">
              <div className="w-10 h-10 rounded-xl bg-[#151a27] border border-[#21283a] flex items-center justify-center text-gray-400 flex-shrink-0">
                <FolderArchive className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-gray-300">
                Archived Chats
              </span>
            </div>
          </div>

          {/* List Footer / Pagination */}
          <div className="p-3 border-t border-[#161b26]/80 flex items-center justify-between text-[11px] text-gray-400 flex-shrink-0 bg-[#0d1017]">
            <span>Showing 1 - 11 of 30</span>
            <button
              type="button"
              className="p-1 rounded-lg hover:bg-[#182030] text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ─── COLUMN 2: ACTIVE CHAT CONVERSATION ─── */}
        <div className="flex-1 flex flex-col bg-[#0b0e14] relative overflow-hidden">
          {/* Active Chat Header */}
          <div className="h-16 px-5 border-b border-[#161b26] flex items-center justify-between bg-[#0b0e14]/90 backdrop-blur-md flex-shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/squad_emblem.jpg"
                  alt="Valorant Squad"
                  className="w-10 h-10 rounded-xl object-cover border border-[#273148] shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display font-bold text-sm text-white">
                    Valorant Squad
                  </h2>
                  <span className="text-amber-400 text-xs">⭐</span>
                </div>
                <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>12 members, 5 online</span>
                </p>
              </div>
            </div>

            {/* Header Call & Info Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-[#141926] hover:bg-[#1d2436] text-gray-300 hover:text-white flex items-center justify-center border border-[#1f2638] transition-colors"
                title="Audio Call"
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-[#141926] hover:bg-[#1d2436] text-gray-300 hover:text-white flex items-center justify-center border border-[#1f2638] transition-colors"
                title="Video Call"
              >
                <Video className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowRightPanel(!showRightPanel)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                  showRightPanel
                    ? 'bg-[#5542f6] text-white border-[#5542f6]'
                    : 'bg-[#141926] hover:bg-[#1d2436] text-gray-300 hover:text-white border-[#1f2638]'
                }`}
                title="Group details"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pinned Message Alert */}
          {showPinned && (
            <div className="px-5 py-2.5 bg-[#121624] border-b border-[#1f273b] flex items-center justify-between text-xs flex-shrink-0 animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-[#5542f6]/20 border border-[#5542f6]/40 flex items-center justify-center text-[#8b5cf6]">
                  <Pin className="w-3 h-3" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block leading-none">
                    Pinned Message
                  </span>
                  <span className="text-gray-200 text-xs">
                    Tournament this weekend! Everyone be ready.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPinned(false)}
                className="text-gray-500 hover:text-gray-300 p-1"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-4">
            {/* Centered Date Badge */}
            <div className="flex justify-center my-2">
              <span className="px-3 py-1 rounded-full bg-[#141926] border border-[#202739] text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Today
              </span>
            </div>

            {messages.map((msg) => {
              // System notification style
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-3">
                    <span className="text-xs text-emerald-400/90 font-medium">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isMe = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Sender Avatar */}
                  {!isMe && (
                    <img
                      src={msg.avatar}
                      alt={msg.name}
                      className="w-8 h-8 rounded-xl object-cover border border-[#22293b] flex-shrink-0 mt-0.5"
                    />
                  )}

                  {/* Message Bubble Column */}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-md lg:max-w-lg`}>
                    {/* Sender name & time */}
                    {!isMe && msg.name && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#f43f5e]">
                          {msg.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {msg.time}
                        </span>
                      </div>
                    )}

                    {/* TEXT BUBBLE */}
                    {msg.text && (
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                          isMe
                            ? 'bg-[#5542f6] text-white rounded-tr-none font-medium'
                            : 'bg-[#151926] text-gray-200 border border-[#1e2538] rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}

                    {/* VOICE MESSAGE BUBBLE */}
                    {msg.isVoice && (
                      <div className="p-3 rounded-2xl bg-[#151926] border border-[#1e2538] text-gray-200 rounded-tl-none w-64 shadow-md">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsVoicePlaying(!isVoicePlaying)}
                            className="w-8 h-8 rounded-full bg-[#5542f6] hover:bg-[#6856f7] text-white flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(85,66,246,0.5)] transition-transform active:scale-95"
                          >
                            {isVoicePlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </button>

                          {/* Sound wave visualizer bars */}
                          <div className="flex-1 flex items-center gap-0.5 h-6">
                            {[40, 70, 30, 90, 60, 100, 45, 80, 50, 90, 75, 40, 65, 85, 30, 95, 55, 70, 45, 80, 60, 40].map((h, i) => (
                              <span
                                key={i}
                                className={`w-0.5 rounded-full transition-all duration-200 ${
                                  isVoicePlaying && i < 12
                                    ? 'bg-[#8b5cf6]'
                                    : 'bg-gray-600'
                                }`}
                                style={{
                                  height: `${isVoicePlaying ? Math.max(20, (h + (i % 3) * 15) % 100) : h}%`,
                                }}
                              />
                            ))}
                          </div>

                          <span className="text-[11px] text-gray-400 font-mono flex-shrink-0">
                            {msg.voiceDuration}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* VIDEO ATTACHMENT CARD */}
                    {msg.isVideo && (
                      <div className="rounded-2xl overflow-hidden bg-[#151926] border border-[#1e2538] rounded-tl-none max-w-sm shadow-xl">
                        <div className="relative group cursor-pointer aspect-video overflow-hidden bg-black">
                          <img
                            src={msg.videoThumbnail}
                            alt="Clutch highlight"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                            <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white group-hover:scale-110 shadow-2xl transition-transform">
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                        {msg.videoCaption && (
                          <div className="p-3 text-xs text-gray-200 font-medium">
                            {msg.videoCaption}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Outgoing Message timestamp & Read checkmarks */}
                    {isMe && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                        <span>{msg.time}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                      </div>
                    )}

                    {/* Message Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {msg.reactions.map((r, ri) => (
                          <button
                            key={ri}
                            type="button"
                            onClick={() => handleToggleReaction(msg.id, r.emoji)}
                            className={`px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 border transition-all ${
                              r.active
                                ? 'bg-[#5542f6]/20 border-[#5542f6] text-white shadow-[0_0_8px_rgba(85,66,246,0.4)]'
                                : 'bg-[#151926] border-[#222a3d] text-gray-300 hover:border-gray-500'
                            }`}
                          >
                            <span>{r.emoji}</span>
                            <span className="font-semibold">{r.count}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleToggleReaction(msg.id, '❤️')}
                          className="w-5 h-5 rounded-full bg-[#151926] border border-[#222a3d] hover:border-gray-500 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-[10px]"
                          title="Add reaction"
                        >
                          🙂
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* ─── CHAT BOTTOM INPUT BAR ─── */}
          <div className="p-4 border-t border-[#161b26] bg-[#0b0e14] flex-shrink-0">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 bg-[#121622] border border-[#1e2538] rounded-2xl p-1.5 focus-within:border-[#5542f6] transition-colors"
            >
              {/* Add Attachment Button */}
              <button
                type="button"
                className="w-8 h-8 rounded-xl text-gray-400 hover:text-white hover:bg-[#182030] flex items-center justify-center transition-colors flex-shrink-0"
                title="Add attachment"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-xs text-gray-100 placeholder-gray-500 focus:outline-none px-2"
              />

              {/* Media & Action buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-[#182030] flex items-center justify-center transition-colors"
                  title="Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-bold text-gray-400 hover:text-white hover:bg-[#182030] transition-colors"
                  title="GIF"
                >
                  GIF
                </button>

                <button
                  type="button"
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-[#182030] flex items-center justify-center transition-colors"
                  title="Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-[#182030] flex items-center justify-center transition-colors"
                  title="Voice recording"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="w-8 h-8 rounded-xl bg-[#5542f6] hover:bg-[#6856f7] disabled:opacity-50 disabled:hover:bg-[#5542f6] text-white flex items-center justify-center shadow-[0_0_12px_rgba(85,66,246,0.4)] transition-all active:scale-95 flex-shrink-0 ml-1"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ─── COLUMN 3: RIGHT DETAILS & SQUAD PANEL ─── */}
        {showRightPanel && (
          <div className="w-72 xl:w-80 flex flex-col border-l border-[#161b26] bg-[#0d1017] flex-shrink-0 overflow-y-auto custom-scrollbar">
            {/* Top Banner Card */}
            <div className="p-4 border-b border-[#161b26]/80 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#ec4899] p-0.5 mb-3 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-[#0d1017]">
                  <img
                    src="/squad_emblem.jpg"
                    alt="Valorant Squad"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h3 className="font-display font-bold text-base text-white">
                Valorant Squad
              </h3>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>12 Members, 5 Online</span>
              </p>

              {/* Quick action buttons row */}
              <div className="grid grid-cols-4 gap-2 w-full mt-4">
                {[
                  { label: 'Audio Call', icon: Phone },
                  { label: 'Video Call', icon: Video },
                  { label: 'Add Members', icon: UserPlus },
                  { label: 'Search', icon: Search },
                ].map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#141926] hover:bg-[#1c2336] border border-[#1f2639] transition-all group"
                    >
                      <Icon className="w-4 h-4 text-gray-300 group-hover:text-white" />
                      <span className="text-[9px] text-gray-400 group-hover:text-gray-200 font-medium">
                        {act.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* About Section */}
            <div className="p-4 border-b border-[#161b26]/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                <span>About</span>
                <button type="button" className="hover:text-white">
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                We grind. We improve. We win together.
              </p>
            </div>

            {/* Accordion Stats */}
            <div className="p-4 border-b border-[#161b26]/80 space-y-1">
              {[
                { label: 'Media, Links & Files', count: '342', icon: ImageIcon },
                { label: 'Pinned Messages', count: '12', icon: Pin },
                { label: 'Voice Messages', count: '28', icon: Mic },
              ].map((row, i) => {
                const Icon = row.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#141926] text-xs font-medium text-gray-300 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-200" />
                      <span>{row.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <span className="text-[11px]">{row.count}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Members Section */}
            <div className="p-4 border-b border-[#161b26]/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">
                  Members (12)
                </span>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#8b5cf6] hover:text-[#a78bfa]"
                >
                  Add Members
                </button>
              </div>

              <div className="space-y-2">
                {SQUAD_MEMBERS.map((mem, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={mem.avatar}
                          alt={mem.name}
                          className="w-7 h-7 rounded-lg object-cover border border-[#20273a]"
                        />
                        {mem.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-[#0d1017]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-200 group-hover:text-white leading-tight">
                          {mem.name}
                        </p>
                        <p className={`text-[10px] leading-tight ${mem.isOnline ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {mem.status}
                        </p>
                      </div>
                    </div>

                    {mem.role && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-[#5542f6]/20 text-[#a78bfa] border border-[#5542f6]/30">
                        {mem.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="w-full text-center text-xs text-gray-400 hover:text-white font-medium pt-1 flex items-center justify-center gap-1"
              >
                <span>View all members</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Settings & Danger Zone */}
            <div className="p-4 space-y-3">
              {/* Notifications */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-gray-300">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-semibold text-xs leading-none">Notifications</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">All Messages</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              </div>

              {/* Mute Group Toggle */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2.5 text-gray-300">
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="font-semibold text-xs">Mute Group</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                    isMuted ? 'bg-[#5542f6]' : 'bg-[#1e2538]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isMuted ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Leave Group */}
              <button
                type="button"
                className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Leave Group</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
