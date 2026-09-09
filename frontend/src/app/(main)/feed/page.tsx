'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Menu,
  Search,
  Plus,
  MessageCircle,
  Bell,
  Image as ImageIcon,
  Video,
  Film,
  Gamepad2,
  Smile,
  SlidersHorizontal,
  ThumbsUp,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Play,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  CheckCircle2,
  X,
  Send,
} from 'lucide-react';
import {
  feedApi,
  postsApi,
  storiesApi,
  usersApi,
  notificationsApi,
  gamesApi,
  groupsApi,
  tournamentsApi,
} from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

interface Story {
  id: string;
  name: string;
  avatar: string;
  image: string;
  isCreate?: boolean;
  hasRing?: boolean;
  isOnline?: boolean;
}

interface PostItem {
  id: string | number;
  author: string;
  username?: string;
  avatar: string;
  isVerified?: boolean;
  time: string;
  gameActivity?: string | null;
  content: string;
  mediaType: 'image' | 'video' | 'none';
  mediaUrl: string;
  watermark?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  isBookmarked?: boolean;
}

interface CommentItem {
  id: number;
  content: string;
  created_at: string;
  user?: {
    id: number;
    username: string;
    display_name?: string;
    avatar?: string;
  };
}

const DEFAULT_STORIES: Story[] = [
  {
    id: 'create',
    name: 'Create Story',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80',
    isCreate: true,
  },
  {
    id: 'rohanx',
    name: 'RohanX',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop&q=80',
    isOnline: true,
  },
  {
    id: 'shadowplayz',
    name: 'ShadowPlayz',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    image: '/clutch_gameplay.jpg',
    hasRing: true,
  },
  {
    id: 'arik-gamer',
    name: 'Arik Gamer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    image: '/battlestation_setup.jpg',
  },
  {
    id: 'progamerx',
    name: 'ProGamerX',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'lina',
    name: 'Lina',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    image: '/minecraft_castle.jpg',
  },
];

const DEFAULT_POSTS: PostItem[] = [
  {
    id: 'p1',
    author: 'ShadowPlayz',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    time: '2h ago',
    gameActivity: 'Playing Call of Duty: Warzone',
    content: 'Insane clutch in the last round! 😱 💀\nWho else loves this map? 👇',
    mediaType: 'video',
    mediaUrl: '/clutch_gameplay.jpg',
    watermark: 'WARZONE',
    likes: 1200,
    comments: 128,
    shares: 45,
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'p2',
    author: 'Arik Gamer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    time: '4h ago',
    content: 'Finally got my new setup! 😍\nRate it from 1-10! 🔥',
    mediaType: 'image',
    mediaUrl: '/battlestation_setup.jpg',
    likes: 2300,
    comments: 256,
    shares: 67,
    isLiked: true,
    isSaved: false,
  },
  {
    id: 'p3',
    author: 'Lina',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    time: '6h ago',
    gameActivity: 'Playing Minecraft',
    content: 'Building a new survival base with the squad! 🏰\nJoin the adventure! 💚',
    mediaType: 'image',
    mediaUrl: '/minecraft_castle.jpg',
    likes: 845,
    comments: 94,
    shares: 23,
    isLiked: false,
    isSaved: false,
  },
];

function cleanImageUrl(url?: string | null, fallback = '/profile_avatar.jpg'): string {
  if (!url) return fallback;
  if (url.includes('http://minio:9000/gamesphere-media/https%3A')) {
    const raw = url.replace('http://minio:9000/gamesphere-media/', '');
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  if (url.startsWith('https%3A') || url.startsWith('http%3A')) {
    try {
      return decodeURIComponent(url);
    } catch {
      return url;
    }
  }
  return url;
}

function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const FeedPostCard = React.memo(({ post, currentUser, currentUserAvatar, toggleLike, toggleBookmark }: any) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(post.comments);

  const handleToggleComments = async () => {
    setCommentsOpen(!commentsOpen);
    if (!commentsOpen && commentsList.length === 0) {
      const numericId = typeof post.id === 'number' ? post.id : parseInt(String(post.id).replace(/\D/g, ''), 10);
      if (numericId && !isNaN(numericId)) {
        try {
          const res = await postsApi.getComments(numericId);
          setCommentsList(res.data?.data || []);
        } catch {
          setCommentsList([]);
        }
      }
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim() || isSubmitting) return;

    const text = commentInput.trim();
    setCommentInput('');
    setIsSubmitting(true);

    const numericId = typeof post.id === 'number' ? post.id : parseInt(String(post.id).replace(/\D/g, ''), 10);

    const optimisticComment: CommentItem = {
      id: Date.now(),
      content: text,
      created_at: new Date().toISOString(),
      user: {
        id: currentUser?.id || 1,
        username: currentUser?.username || 'gamer',
        display_name: currentUser?.display_name || 'Gamer',
        avatar: currentUserAvatar,
      },
    };

    setCommentsList([optimisticComment, ...commentsList]);
    setLocalCommentCount((prev: number) => prev + 1);

    try {
      if (numericId && !isNaN(numericId)) {
        await postsApi.addComment(numericId, text);
      }
    } catch {
      // Keep optimistic
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="bg-[#10141e] border border-[#1c2333] rounded-2xl overflow-hidden shadow-xl">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.avatar}
            alt={post.author}
            className="w-10 h-10 rounded-xl object-cover border border-[#222a3d]"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-white">
                {post.author}
              </span>
              {post.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8] fill-[#38bdf8]/20" />
              )}
            </div>
            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
              <span>{post.time}</span>
              <span>•</span>
              {post.gameActivity ? (
                <span className="text-gray-300 font-medium">
                  🎮 {post.gameActivity}
                </span>
              ) : (
                <span>🌐 Public</span>
              )}
            </p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-300 p-1 rounded-lg">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-xs text-gray-200 whitespace-pre-line leading-relaxed font-normal">
          {post.content}
        </p>
      </div>

      {/* Post Media */}
      {post.mediaUrl && (
        <div className="relative group bg-black overflow-hidden max-h-[460px] flex items-center justify-center">
          <img
            src={post.mediaUrl}
            alt="Post attachment"
            className="w-full h-auto object-cover max-h-[460px]"
          />
          {post.mediaType === 'video' && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <button className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current ml-1" />
              </button>
            </div>
          )}
          {post.watermark && (
            <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-[10px] font-black tracking-widest text-white uppercase border border-white/10">
              {post.watermark}
            </div>
          )}
          {post.mediaType === 'video' && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 hover:scale-105 transition-transform">
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Metrics */}
      <div className="px-4 py-2.5 flex items-center justify-between text-xs text-gray-400 border-b border-[#181e2c]">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-[#3b82f6] flex items-center justify-center text-[9px] text-white">👍</span>
            <span className="w-4 h-4 rounded-full bg-[#ef4444] flex items-center justify-center text-[9px] text-white">❤️</span>
            <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[9px] text-white">😮</span>
          </div>
          <span className="text-[11px] font-medium text-gray-300">
            {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <button onClick={handleToggleComments} className="hover:text-gray-200 transition-colors">
            {localCommentCount} Comments
          </button>
          <span>{post.shares} Shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-400">
        <button onClick={() => toggleLike(post.id)} className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl hover:bg-[#151b27] transition-colors ${post.isLiked ? 'text-[#ec4899] font-semibold' : 'hover:text-white'}`}>
          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
          <span>Love</span>
        </button>
        <button onClick={handleToggleComments} className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl hover:bg-[#151b27] transition-colors ${commentsOpen ? 'text-[#5542f6] font-semibold' : 'hover:text-white'}`}>
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl hover:bg-[#151b27] hover:text-white transition-colors">
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
        <button onClick={() => toggleBookmark(post.id)} className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl hover:bg-[#151b27] hover:text-white transition-colors">
          <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current text-amber-400' : ''}`} />
          <span className={post.isSaved ? 'text-amber-400' : ''}>Save</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {commentsOpen && (
        <div className="px-4 py-3 border-t border-[#181e2d] bg-[#0c1018] space-y-3">
          <div className="flex items-center gap-2.5">
            <img src={currentUserAvatar} alt="Me" className="w-7 h-7 rounded-lg object-cover border border-[#232b3e]" />
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Write a comment..."
                className="w-full bg-[#151a27] border border-[#21293c] rounded-xl py-1.5 pl-3 pr-9 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#5542f6]"
              />
              <button onClick={handleAddComment} disabled={!commentInput.trim() || isSubmitting} className="absolute right-2 text-[#8b5cf6] hover:text-white disabled:text-gray-600 transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pt-1">
            {commentsList.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic text-center py-2">No comments yet. Be the first to comment!</p>
            ) : (
              commentsList.map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-xs">
                  <img src={cleanImageUrl(c.user?.avatar, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80')} alt={c.user?.username || 'gamer'} className="w-6 h-6 rounded-lg object-cover border border-[#222a3d] mt-0.5" />
                  <div className="flex-1 bg-[#141926] rounded-xl px-3 py-1.5 border border-[#1d2538]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[11px] text-white">{c.user?.display_name || c.user?.username || 'Gamer'}</span>
                      <span className="text-[9px] text-gray-500">{formatTimeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-gray-300 text-[11px] mt-0.5 whitespace-pre-line">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
});

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<'for-you' | 'following' | 'friends' | 'gaming' | 'trending' | 'latest'>('for-you');
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<PostItem[]>(DEFAULT_POSTS);
  const [stories, setStories] = useState<Story[]>(DEFAULT_STORIES);

  // Current user & notification state from auth store
  const { user: authUser } = useAuthStore();
  const [currentUser, setCurrentUser] = useState<any>(authUser || null);
  const [unreadCount, setUnreadCount] = useState<number>(8);

  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);

  // Interactive UI states
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
  const [joinedGroups, setJoinedGroups] = useState<Record<string, boolean>>({});
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  // Dynamic comments
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | number | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string | number, CommentItem[]>>({});
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Dynamic sidebar data
  const [trendingGames, setTrendingGames] = useState<any[]>([
    { rank: 1, name: 'Valorant', posts: '128K Posts', up: true, img: '/squad_emblem.jpg' },
    { rank: 2, name: 'GTA V', posts: '98K Posts', up: true, img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&auto=format&fit=crop&q=80' },
    { rank: 3, name: 'Call of Duty: MWIII', posts: '76K Posts', up: true, img: '/clutch_gameplay.jpg' },
    { rank: 4, name: 'Minecraft', posts: '64K Posts', up: false, img: '/minecraft_castle.jpg' },
    { rank: 5, name: 'eFootball 2024', posts: '54K Posts', up: true, img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=80&auto=format&fit=crop&q=80' },
  ]);

  const [suggestedPeople, setSuggestedPeople] = useState<any[]>([
    { id: 101, name: 'NightFury', mutual: '12 mutual friends', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&auto=format&fit=crop&q=80' },
    { id: 102, name: 'ProGamerX', mutual: '8 mutual friends', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80' },
    { id: 103, name: 'DevHunter', mutual: '15 mutual friends', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80' },
    { id: 104, name: 'Anik Plays', mutual: '7 mutual friends', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80' },
  ]);

  const [suggestedGroupsList, setSuggestedGroupsList] = useState<any[]>([
    { id: 1, name: 'Valorant Bangladesh', members: '12.3K Members', img: '/squad_emblem.jpg' },
    { id: 2, name: 'PC Gamers BD', members: '18.6K Members', img: '/battlestation_setup.jpg' },
    { id: 3, name: 'Minecraft Builders', members: '9.8K Members', img: '/minecraft_castle.jpg' },
    { id: 4, name: 'Call of Duty Community', members: '15.2K Members', img: '/clutch_gameplay.jpg' },
  ]);

  const [upcomingTournaments, setUpcomingTournaments] = useState<any[]>([
    { id: 1, title: '5v5 Valorant Cup', date: 'May 25, 2024 - 7:00 PM', img: '/squad_emblem.jpg' },
    { id: 2, title: 'PUBG Mobile Championship', date: 'May 28, 2024 - 8:00 PM', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&auto=format&fit=crop&q=80' },
    { id: 3, title: 'eFootball League 2024', date: 'May 30, 2024 - 6:00 PM', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=80&auto=format&fit=crop&q=80' },
  ]);

  const [onlineFriends, setOnlineFriends] = useState<any[]>([
    { name: 'RohanX', status: 'Online', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&auto=format&fit=crop&q=80' },
    { name: 'ShadowPlayz', status: 'Online', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&auto=format&fit=crop&q=80' },
    { name: 'Arik Gamer', status: 'In Game', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80' },
    { name: 'Lina', status: 'Online', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80' },
    { name: 'DevHunter', status: 'Online', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80' },
  ]);

  const storyInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingStory, setIsUploadingStory] = useState(false);

  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingStory(true);
    try {
      const fd = new FormData();
      fd.append('media', file);
      fd.append('type', file.type.startsWith('video') ? 'video' : 'image');
      
      const res = await storiesApi.createStory(fd);
      const newStoryRaw = res.data?.data;
      
      if (newStoryRaw) {
        const userAvatar = currentUser?.avatar_url
          ? cleanImageUrl(currentUser.avatar_url)
          : 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80';

        const newStory: Story = {
          id: String(newStoryRaw.id),
          name: newStoryRaw.user?.name || newStoryRaw.user?.username || 'Gamer',
          avatar: cleanImageUrl(newStoryRaw.user?.avatar_url, userAvatar),
          image: cleanImageUrl(newStoryRaw.media_url, '/clutch_gameplay.jpg'),
          hasRing: true,
          isOnline: true,
        };
        
        setStories(prev => {
          const createCard = prev.find(s => s.isCreate);
          const others = prev.filter(s => !s.isCreate);
          return createCard ? [createCard, newStory, ...others] : [newStory, ...others];
        });
      }
    } catch (err) {
      console.error('Story upload failed:', err);
      alert('Failed to upload story');
    } finally {
      setIsUploadingStory(false);
      if (e.target) e.target.value = '';
    }
  };


  // Load current user and initial data
  useEffect(() => {
    // Current user
    usersApi.getMe()
      .then((res) => {
        const u = res.data?.data || res.data;
        if (u) setCurrentUser(u);
      })
      .catch(() => {
        if (authUser) setCurrentUser(authUser);
      });

    // Unread count
    notificationsApi.getUnreadCount()
      .then((res) => {
        const count = res.data?.unread_count ?? res.data?.count;
        if (typeof count === 'number') setUnreadCount(count);
      })
      .catch(() => {});

    // Stories
    storiesApi.getStories()
      .then((res) => {
        const apiStories = res.data?.data || [];
        if (Array.isArray(apiStories) && apiStories.length > 0) {
          const userAvatar = currentUser?.avatar_url
            ? cleanImageUrl(currentUser.avatar_url)
            : 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80';

          const mapped: Story[] = [
            {
              id: 'create',
              name: 'Create Story',
              avatar: userAvatar,
              image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80',
              isCreate: true,
            },
            ...apiStories.map((s: any, idx: number) => ({
              id: String(s.id),
              name: s.user?.name || s.user?.username || `Gamer ${idx + 1}`,
              avatar: cleanImageUrl(s.user?.avatar_url, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
              image: cleanImageUrl(s.image || s.media_url, '/clutch_gameplay.jpg'),
              hasRing: idx % 2 === 0,
              isOnline: idx % 3 === 0,
            })),
          ];
          setStories(mapped);
        }
      })
      .catch(() => {});

    // Games for sidebar
    gamesApi.getAll()
      .then((res) => {
        const gamesList = res.data?.data || [];
        if (Array.isArray(gamesList) && gamesList.length > 0) {
          setTrendingGames(gamesList.slice(0, 5).map((g: any, i: number) => ({
            rank: i + 1,
            name: g.title || g.name,
            posts: `${(g.active_players_count || 45) + (i * 12)}K Posts`,
            up: i !== 3,
            img: cleanImageUrl(g.cover_image || g.thumbnail, '/squad_emblem.jpg'),
          })));
        }
      })
      .catch(() => {});

    // Tournaments for sidebar
    tournamentsApi.getAll()
      .then((res) => {
        const tours = res.data?.data || [];
        if (Array.isArray(tours) && tours.length > 0) {
          setUpcomingTournaments(tours.slice(0, 3).map((t: any) => ({
            id: t.id,
            title: t.title || t.name,
            date: t.start_time ? new Date(t.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Upcoming',
            img: cleanImageUrl(t.banner_image || t.image_url, '/squad_emblem.jpg'),
          })));
        }
      })
      .catch(() => {});

    // Friends for online friends sidebar
    const targetUsername = authUser?.username || 'me';
    usersApi.getFriends(targetUsername)
      .then((res) => {
        const friendsList = res.data?.data || [];
        if (Array.isArray(friendsList) && friendsList.length > 0) {
          setOnlineFriends(friendsList.slice(0, 5).map((f: any, i: number) => ({
            name: f.display_name || f.username,
            status: i === 2 ? 'In Game' : 'Online',
            avatar: cleanImageUrl(f.avatar_url || f.avatar, 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&auto=format&fit=crop&q=80'),
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch posts whenever activeTab changes
  useEffect(() => {
    loadFeed(activeTab);
  }, [activeTab]);

  const loadFeed = async (tab: typeof activeTab) => {
    try {
      let res;
      switch (tab) {
        case 'following':
          res = await feedApi.getFollowing();
          break;
        case 'friends':
          res = await feedApi.getFriends();
          break;
        case 'gaming':
          res = await feedApi.getGaming();
          break;
        case 'trending':
          res = await feedApi.getTrending();
          break;
        case 'latest':
          res = await feedApi.getLatest();
          break;
        case 'for-you':
        default:
          res = await feedApi.getFeed();
          break;
      }

      const rawPosts = res.data?.data || [];
      if (Array.isArray(rawPosts) && rawPosts.length > 0) {
        const formatted: PostItem[] = rawPosts.map((p: any) => {
          const userObj = p.user || p.author || {};
          const isVid = p.type === 'video';
          const media = p.link_image || p.image_url || p.media_url || (isVid ? '/clutch_gameplay.jpg' : '');

          return {
            id: p.id,
            author: userObj.display_name || userObj.username || 'Gamer',
            username: userObj.username || 'gamer',
            avatar: cleanImageUrl(userObj.avatar_url, 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80'),
            isVerified: Boolean(userObj.is_verified),
            time: formatTimeAgo(p.created_at),
            gameActivity: p.game?.title ? `Playing ${p.game.title}` : (p.content?.includes('#') ? 'Gaming' : null),
            content: p.content || '',
            mediaType: isVid ? 'video' : (media ? 'image' : 'none'),
            mediaUrl: cleanImageUrl(media, ''),
            watermark: p.game?.title?.toUpperCase() || (isVid ? 'WARZONE' : undefined),
            likes: Number(p.likes_count ?? p.reactions_count ?? 0),
            comments: Number(p.comments_count ?? 0),
            shares: Number(p.shares_count ?? 0),
            isLiked: Boolean(p.is_liked || p.viewer_reaction),
            isSaved: Boolean(p.is_saved || p.is_bookmarked),
          };
        });
        setPosts(formatted);
      }
    } catch {
      // Fallback preserves initial UI if offline
    }
  };

  const handleCreatePost = async () => {
    if (!postText.trim()) return;
    const textToSubmit = postText.trim();
    setPostText('');

    const optimisticPost: PostItem = {
      id: `local-${Date.now()}`,
      author: currentUser?.display_name || authUser?.name || authUser?.display_name || 'Gamer',
      username: currentUser?.username || authUser?.username || 'gamer',
      avatar: currentUserAvatar,
      isVerified: true,
      time: 'Just now',
      gameActivity: textToSubmit.includes('#') ? 'Gaming' : null,
      content: textToSubmit,
      mediaType: 'none',
      mediaUrl: '',
      likes: 1,
      comments: 0,
      shares: 0,
      isLiked: false,
      isSaved: false,
    };

    setPosts([optimisticPost, ...posts]);

    try {
      const res = await postsApi.create({
        content: textToSubmit,
        type: 'text',
        visibility: 'public',
      });
      const created = res.data?.data;
      if (created) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === optimisticPost.id
              ? {
                  ...p,
                  id: created.id,
                  time: formatTimeAgo(created.created_at),
                }
              : p
          )
        );
      }
    } catch {
      // Keep optimistic post in feed
    }
  };

  const toggleLike = async (id: string | number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const newLiked = !post.isLiked;
    const newLikes = newLiked ? post.likes + 1 : Math.max(0, post.likes - 1);

    // Optimistic UI update
    setPosts(
      posts.map((p) =>
        p.id === id
          ? {
              ...p,
              isLiked: newLiked,
              likes: newLikes,
            }
          : p
      )
    );

    // Backend sync
    try {
      const numericId = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, ''), 10);
      if (numericId && !isNaN(numericId)) {
        if (newLiked) {
          await postsApi.react(numericId, 'love');
        } else {
          await postsApi.unreact(numericId);
        }
      }
    } catch {
      // Keep state resilient
    }
  };

  const toggleBookmark = async (id: string | number) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const newSaved = !post.isSaved;

    // Optimistic UI update
    setPosts(posts.map((p) => (p.id === id ? { ...p, isSaved: newSaved } : p)));

    // Backend sync
    try {
      const numericId = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, ''), 10);
      if (numericId && !isNaN(numericId)) {
        await postsApi.toggleBookmark(numericId);
      }
    } catch {
      // Keep state resilient
    }
  };

  const toggleCommentsSection = async (postId: string | number) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }

    setActiveCommentPostId(postId);

    const numericId = typeof postId === 'number' ? postId : parseInt(String(postId).replace(/\D/g, ''), 10);
    if (numericId && !isNaN(numericId) && !commentsMap[postId]) {
      try {
        const res = await postsApi.getComments(numericId);
        const data = res.data?.data || [];
        setCommentsMap((prev) => ({ ...prev, [postId]: data }));
      } catch {
        setCommentsMap((prev) => ({ ...prev, [postId]: [] }));
      }
    }
  };

  const handleAddComment = async (postId: string | number) => {
    if (!commentInput.trim() || isSubmittingComment) return;

    const text = commentInput.trim();
    setCommentInput('');
    setIsSubmittingComment(true);

    const numericId = typeof postId === 'number' ? postId : parseInt(String(postId).replace(/\D/g, ''), 10);

    const optimisticComment: CommentItem = {
      id: Date.now(),
      content: text,
      created_at: new Date().toISOString(),
      user: {
        id: currentUser?.id || authUser?.id || 1,
        username: currentUser?.username || authUser?.username || 'gamer',
        display_name: currentUser?.display_name || authUser?.name || authUser?.display_name || 'Gamer',
        avatar: currentUserAvatar,
      },
    };

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [optimisticComment, ...(prev[postId] || [])],
    }));

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p))
    );

    try {
      if (numericId && !isNaN(numericId)) {
        await postsApi.addComment(numericId, text);
      }
    } catch {
      // Keep optimistic
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFollowUser = async (user: any) => {
    const isCurrentlyFollowed = followingStates[user.name];
    setFollowingStates({ ...followingStates, [user.name]: !isCurrentlyFollowed });

    if (user.id) {
      try {
        if (!isCurrentlyFollowed) {
          await usersApi.follow(user.id);
        } else {
          await usersApi.unfollow(user.id);
        }
      } catch {
        // Handled gracefully
      }
    }
  };

  const handleJoinGroup = async (grp: any) => {
    const isCurrentlyJoined = joinedGroups[grp.name];
    setJoinedGroups({ ...joinedGroups, [grp.name]: !isCurrentlyJoined });

    if (grp.id) {
      try {
        if (!isCurrentlyJoined) {
          await groupsApi.join(grp.id);
        } else {
          await groupsApi.leave(grp.id);
        }
      } catch {
        // Handled gracefully
      }
    }
  };

  const currentUserAvatar = cleanImageUrl(
    currentUser?.avatar_url,
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80'
  );

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0b0e14] text-[#e2e8f0] font-sans">
      {/* ─────────────────────────────────────────────────────────────
          TOP GLOBAL HEADER BAR
      ───────────────────────────────────────────────────────────── */}
      <header className="h-16 border-b border-[#161b26] bg-[#0b0e14] sticky top-0 z-40 flex items-center justify-between px-5">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            type="button"
            className="p-2 rounded-xl hover:bg-[#141926] text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative flex items-center flex-1">
            <Search className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search games, people, groups..."
              className="w-full bg-[#121622] border border-[#1e2434] rounded-xl py-2 pl-10 pr-16 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#5542f6] focus:ring-1 focus:ring-[#5542f6] transition-all"
            />
            <span className="absolute right-3 px-1.5 py-0.5 rounded-md bg-[#1b2234] border border-[#27314a] text-[10px] text-gray-400 font-mono">
              Ctrl /
            </span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3 ml-4">
          <button
            type="button"
            onClick={handleCreatePost}
            className="w-9 h-9 rounded-xl bg-[#141926] hover:bg-[#1c2336] text-gray-300 hover:text-white flex items-center justify-center border border-[#1f2639] transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>

          <Link
            href="/messages"
            className="relative w-9 h-9 rounded-xl bg-[#141926] hover:bg-[#1c2336] text-gray-300 hover:text-white flex items-center justify-center border border-[#1f2639] transition-all"
          >
            <MessageCircle className="w-4 h-4" />
          </Link>

          <Link
            href="/notifications"
            className="relative w-9 h-9 rounded-xl bg-[#141926] hover:bg-[#1c2336] text-gray-300 hover:text-white flex items-center justify-center border border-[#1f2639] transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ec4899] text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_#ec4899]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <Link href="/profile" className="relative cursor-pointer ml-1">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-[#5542f6]/40 hover:ring-[#5542f6] transition-all">
              <img
                src={currentUserAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0b0e14]" />
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT WORKSPACE (CENTER FEED + RIGHT WIDGETS)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex justify-center px-4 lg:px-6 py-6 gap-7 max-w-7xl mx-auto w-full">
        {/* ─── CENTER FEED COLUMN ─── */}
        <main className="flex-1 max-w-2xl xl:max-w-[680px] space-y-6">
          {/* 1. What's on your mind Card */}
          <div className="bg-[#10141e] border border-[#1c2333] rounded-2xl p-4 shadow-xl space-y-3.5">
            <div className="flex items-center gap-3">
              <img
                src={currentUserAvatar}
                alt="Me"
                className="w-10 h-10 rounded-xl object-cover border border-[#232b3e]"
              />
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreatePost(); }}
                  placeholder="What's on your mind, Gamer?"
                  className="w-full bg-[#151a27] border border-[#21293c] rounded-xl py-2.5 pl-4 pr-10 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#5542f6] transition-colors"
                />
                <button
                  type="button"
                  className="absolute right-3 text-gray-500 hover:text-gray-300"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#181e2d] text-xs">
              <div className="flex items-center gap-1 sm:gap-2 text-gray-400">
                <button
                  type="button"
                  onClick={handleCreatePost}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#161c29] text-gray-300 hover:text-white transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-[11px]">Photo / Video</span>
                </button>

                <Link
                  href="/videos"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#161c29] text-gray-300 hover:text-white transition-colors"
                >
                  <Video className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium text-[11px]">Video</span>
                </Link>

                <Link
                  href="/reels"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#161c29] text-gray-300 hover:text-white transition-colors"
                >
                  <Film className="w-4 h-4 text-[#ec4899]" />
                  <span className="font-medium text-[11px]">Reel</span>
                </Link>

                <Link
                  href="/games"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#161c29] text-gray-300 hover:text-white transition-colors"
                >
                  <Gamepad2 className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-[11px]">Game Activity</span>
                </Link>
              </div>

              {postText.trim() && (
                <button
                  type="button"
                  onClick={handleCreatePost}
                  className="px-3.5 py-1.5 rounded-xl bg-[#5542f6] text-white font-medium text-xs shadow-[0_0_12px_rgba(85,66,246,0.5)] transition-all"
                >
                  Post
                </button>
              )}
            </div>
          </div>

          {/* 2. Stories Tray */}
          <div className="relative">
            <input 
              type="file" 
              ref={storyInputRef} 
              accept="image/*,video/*" 
              className="hidden" 
              onChange={handleStoryUpload} 
            />
            <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
              {stories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => {
                    if (story.isCreate) {
                      storyInputRef.current?.click();
                    } else {
                      setActiveStory(story);
                    }
                  }}
                  className={`relative w-24 h-36 rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 group border transition-all duration-300 ${
                    story.hasRing
                      ? 'border-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                      : 'border-[#1f2638] hover:border-[#35405d]'
                  } ${isUploadingStory && story.isCreate ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {/* Background Image */}
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

                  {/* Create Button or Avatar */}
                  {story.isCreate ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#5542f6] mt-0.5">
                        <img src={story.avatar} alt="Me" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#5542f6] text-white flex items-center justify-center shadow-lg border-2 border-[#10141e] -mb-1">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-white tracking-tight">
                        Create Story
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col justify-between p-2.5">
                      <div className="relative w-7 h-7">
                        <img
                          src={story.avatar}
                          alt={story.name}
                          className="w-7 h-7 rounded-full object-cover border-2 border-[#5542f6]"
                        />
                        {story.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-black" />
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-white truncate">
                        {story.name}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Next arrow on stories */}
            <button
              type="button"
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#181e2d] border border-[#2b354e] text-white shadow-xl flex items-center justify-center hover:bg-[#232b3f] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3. Feed Filter Tabs */}
          <div className="flex items-center justify-between border-b border-[#161b26] pb-2 text-xs font-medium">
            <div className="flex items-center gap-6">
              {[
                { id: 'for-you', label: 'For You' },
                { id: 'following', label: 'Following' },
                { id: 'friends', label: 'Friends' },
                { id: 'gaming', label: 'Gaming' },
                { id: 'trending', label: 'Trending' },
                { id: 'latest', label: 'Latest' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-2 relative transition-colors ${
                    activeTab === tab.id
                      ? 'text-[#8b5cf6] font-semibold'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b5cf6] rounded-full shadow-[0_0_8px_#8b5cf6]" />
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="p-1 text-gray-400 hover:text-white"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* 4. Posts Feed */}
          <div className="space-y-6">
            {posts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                currentUserAvatar={currentUserAvatar}
                toggleLike={toggleLike}
                toggleBookmark={toggleBookmark}
              />
            ))}
          </div>
        </main>

        {/* ─── RIGHT SIDEBAR WIDGETS ─── */}
        <aside className="w-80 lg:w-[320px] xl:w-[340px] hidden xl:flex flex-col space-y-6 flex-shrink-0 select-none">
          {/* 1. Trending Games */}
          <div className="bg-[#10141e] border border-[#1c2333] rounded-2xl p-4 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-white">Trending Games</h3>
              <Link href="/games" className="text-xs font-semibold text-[#8b5cf6] hover:text-[#a78bfa]">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {trendingGames.map((game) => (
                <div key={game.name} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <img
                      src={game.img}
                      alt={game.name}
                      className="w-9 h-9 rounded-xl object-cover border border-[#21283a] group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-gray-200 group-hover:text-white">
                        {game.name}
                      </h4>
                      <p className="text-[10px] text-gray-400">{game.posts}</p>
                    </div>
                  </div>

                  {game.up ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. People You May Know */}
          <div className="bg-[#10141e] border border-[#1c2333] rounded-2xl p-4 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-white">People You May Know</h3>
              <Link href="/profile" className="text-xs font-semibold text-[#8b5cf6] hover:text-[#a78bfa]">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {suggestedPeople.map((user) => {
                const isFollowed = followingStates[user.name];
                return (
                  <div key={user.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-xl object-cover border border-[#20273a]"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-black" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-gray-200">{user.name}</h4>
                        <p className="text-[10px] text-gray-400">👥 {user.mutual}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFollowUser(user)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                        isFollowed
                          ? 'bg-[#182030] text-gray-400 border border-[#222b3e]'
                          : 'bg-[#161c2b] hover:bg-[#5542f6] text-gray-200 hover:text-white border border-[#232c41]'
                      }`}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Suggested Groups */}
          <div className="bg-[#10141e] border border-[#1c2333] rounded-2xl p-4 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-white">Suggested Groups</h3>
              <Link href="/groups" className="text-xs font-semibold text-[#8b5cf6] hover:text-[#a78bfa]">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {suggestedGroupsList.map((grp) => {
                const isJoined = joinedGroups[grp.name];
                return (
                  <div key={grp.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={grp.img}
                        alt={grp.name}
                        className="w-8 h-8 rounded-xl object-cover border border-[#20273a]"
                      />
                      <div>
                        <h4 className="font-semibold text-xs text-gray-200 truncate max-w-[140px]">
                          {grp.name}
                        </h4>
                        <p className="text-[10px] text-gray-400">{grp.members}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleJoinGroup(grp)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                        isJoined
                          ? 'bg-[#182030] text-gray-400 border border-[#222b3e]'
                          : 'bg-[#161c2b] hover:bg-[#5542f6] text-gray-200 hover:text-white border border-[#232c41]'
                      }`}
                    >
                      {isJoined ? 'Joined' : 'Join'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Upcoming Tournaments */}
          <div className="bg-[#10141e] border border-[#1c2333] rounded-2xl p-4 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-white">Upcoming Tournaments</h3>
              <Link href="/tournaments" className="text-xs font-semibold text-[#8b5cf6] hover:text-[#a78bfa]">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingTournaments.map((tour) => (
                <div key={tour.title} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={tour.img}
                      alt={tour.title}
                      className="w-8 h-8 rounded-xl object-cover border border-[#20273a]"
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-gray-200 truncate max-w-[130px]">
                        {tour.title}
                      </h4>
                      <p className="text-[10px] text-gray-400">{tour.date}</p>
                    </div>
                  </div>

                  <Link
                    href="/tournaments"
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#161c2b] hover:bg-[#5542f6] text-gray-200 hover:text-white border border-[#232c41] transition-all"
                  >
                    Register
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Online Friends */}
          <div className="bg-[#10141e] border border-[#1c2333] rounded-2xl p-4 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-white">Online Friends</h3>
              <Link href="/messages" className="text-xs font-semibold text-[#8b5cf6] hover:text-[#a78bfa]">
                See All
              </Link>
            </div>

            <div className="space-y-3">
              {onlineFriends.map((friend) => (
                <div key={friend.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-8 h-8 rounded-xl object-cover border border-[#20273a]"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-black" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-gray-200">{friend.name}</h4>
                      <p className="text-[10px] text-emerald-400">{friend.status}</p>
                    </div>
                  </div>

                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveStory(null)}
        >
          <div
            className="relative w-80 h-[520px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={activeStory.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeStory.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
                <span className="font-bold text-xs text-white">{activeStory.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveStory(null)}
                className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
