'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Heart, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';
import { postsApi } from '@/services/api';

interface Post {
  id: number;
  content: string;
  type: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  user?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  image_url?: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await postsApi.getBookmarks();
      // Assume API returns paginated data (res.data.data) or simple array (res.data)
      const data = res.data.data || res.data;
      setBookmarks(data);
    } catch (err: any) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load bookmarks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id: number) => {
    // Optimistic remove
    setBookmarks((prev) => prev.filter((p) => p.id !== id));
    
    try {
      await postsApi.toggleBookmark(id);
    } catch {
      // Revert if failed, simplified for now
      fetchBookmarks();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5542f6]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 pb-20 p-4 pt-8">
      <div className="bg-[#0b101a] rounded-2xl border border-gray-800/50 p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center text-amber-400">
          <Bookmark className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Your Bookmarks</h1>
          <p className="text-sm text-gray-400">Saved posts you want to look at later</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-center text-sm">
          {error}
        </div>
      )}

      {bookmarks.length === 0 && !error ? (
        <div className="bg-[#0b101a] rounded-2xl border border-gray-800/50 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center text-gray-500 mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No bookmarks yet</h2>
          <p className="text-gray-400 text-sm max-w-sm">
            When you see a post you want to save, click the bookmark icon and it will show up here.
          </p>
          <Link href="/feed" className="mt-6 px-6 py-2 bg-[#5542f6] text-white rounded-xl text-sm font-semibold hover:bg-[#4335c4] transition-colors">
            Go to Feed
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((post) => (
            <div key={post.id} className="bg-[#0b101a] rounded-2xl border border-gray-800/50 overflow-hidden">
              <div className="p-4 flex items-start gap-4">
                <Link href={`/user/${post.user?.username}`}>
                  <img src={post.user?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${post.user?.username}`} alt={post.user?.display_name} className="w-10 h-10 rounded-xl object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link href={`/user/${post.user?.username}`} className="font-semibold text-white hover:underline truncate block">
                        {post.user?.display_name || post.user?.username}
                      </Link>
                      <span className="text-xs text-gray-500 block truncate">@{post.user?.username}</span>
                    </div>
                    <button className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="mt-3 text-sm text-gray-200 whitespace-pre-wrap">{post.content}</p>
                  
                  {post.image_url && (
                    <div className="mt-4 rounded-xl overflow-hidden max-h-96">
                      <img src={post.image_url} alt="Post content" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-800/50 pt-3">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> {post.likes_count}</span>
                      <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {post.comments_count}</span>
                      <span className="flex items-center gap-1.5"><Share2 className="w-4 h-4" /> {post.shares_count}</span>
                    </div>
                    
                    <button 
                      onClick={() => removeBookmark(post.id)}
                      className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors bg-amber-400/10 px-3 py-1.5 rounded-lg"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                      Saved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
