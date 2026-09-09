'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Trophy, 
  Users, 
  Heart, 
  Gamepad2, 
  CheckCheck, 
  Sparkles, 
  Trash2, 
  RotateCw, 
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  Flame,
  Check
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNotificationStore, NotificationItem } from '@/stores/notificationStore';

const CATEGORY_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'tournament', label: 'Tournaments', icon: Trophy },
  { key: 'social', label: 'Social', icon: Heart },
  { key: 'group', label: 'Squads', icon: Users },
  { key: 'game', label: 'Deals', icon: Gamepad2 },
];

export default function NotificationsPage() {
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    filter, 
    isLoading, 
    isOperating, 
    setFilter, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    sendTestNotification 
  } = useNotificationStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    showToast('All notifications marked as read');
  };

  const handleSimulate = async () => {
    await sendTestNotification();
    showToast('New gaming notification received!');
  };

  const handleCardClick = (notification: NotificationItem) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'tournament':
        return {
          icon: Trophy,
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
          badge: 'Tournament',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'social':
        return {
          icon: Heart,
          color: 'text-pink-400',
          bgColor: 'bg-pink-500/10',
          borderColor: 'border-pink-500/30',
          glow: 'shadow-[0_0_12px_rgba(236,72,153,0.25)]',
          badge: 'Social',
          badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
        };
      case 'group':
        return {
          icon: Users,
          color: 'text-indigo-400',
          bgColor: 'bg-indigo-500/10',
          borderColor: 'border-indigo-500/30',
          glow: 'shadow-[0_0_12px_rgba(99,102,241,0.25)]',
          badge: 'Squad',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        };
      case 'game':
        return {
          icon: Gamepad2,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          glow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
          badge: 'Game Deal',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      default:
        return {
          icon: Bell,
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/10',
          borderColor: 'border-cyan-500/30',
          glow: 'shadow-[0_0_12px_rgba(6,182,212,0.25)]',
          badge: 'System',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        };
    }
  };

  const unreadItems = notifications.filter(n => !n.read_at);
  const readItems = notifications.filter(n => !!n.read_at);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#161b26] border border-[#2b3548] text-white rounded-2xl shadow-2xl shadow-cyan-500/10 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1f293d] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold bg-[#ec4899] text-white rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1.5 ml-13">
            Stay on top of tournament brackets, squad invites, and friend activities.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSimulate}
            disabled={isOperating}
            className="border-[#26334d] hover:bg-[#1a2336] text-cyan-300 hover:text-cyan-200 gap-1.5 rounded-xl transition-all shadow-sm"
            title="Simulate receiving a new live notification"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Simulate Test</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || isOperating}
            className="border-[#26334d] hover:bg-[#1a2336] text-gray-300 hover:text-white gap-1.5 rounded-xl transition-all disabled:opacity-40"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark all read</span>
          </Button>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => fetchNotifications()}
            disabled={isLoading}
            className="text-gray-400 hover:text-white hover:bg-[#1a2336] rounded-xl"
            title="Refresh notifications"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {CATEGORY_TABS.map((tab) => {
          const isActive = filter === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.35)] scale-[1.02]'
                  : 'bg-[#0f141f] text-gray-400 border-[#1c2538] hover:bg-[#161d2d] hover:text-gray-200'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.key === 'unread' && unreadCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-pink-500 text-white'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Notification Feed */}
      <div className="space-y-6">
        
        {/* Loading Skeleton */}
        {isLoading && notifications.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className="p-4 rounded-2xl bg-[#0e131e]/80 border border-[#1b2436] animate-pulse flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1b2538] shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-[#1b2538] rounded w-1/3" />
                  <div className="h-3 bg-[#161f30] rounded w-3/4" />
                  <div className="h-2.5 bg-[#141b2a] rounded w-1/6 mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-16 px-4 bg-[#0d121c]/60 border border-[#1b2437] rounded-3xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
              <CheckCircle2 className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white">You&apos;re completely caught up!</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
              {filter === 'unread' 
                ? 'No unread notifications right now. Everything has been reviewed!' 
                : 'No notifications in this category yet. Game on and your alerts will appear here.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button 
                variant="default" 
                size="sm"
                onClick={handleSimulate}
                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <Sparkles className="w-4 h-4" /> Simulate a Notification
              </Button>
              {filter !== 'all' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFilter('all')}
                  className="border-[#222e44] text-gray-300 hover:text-white rounded-xl"
                >
                  View All Notifications
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Notifications Listing */}
        {notifications.length > 0 && (
          <div className="space-y-6">

            {/* UNREAD / NEW SECTION */}
            {unreadItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    New ({unreadItems.length})
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {unreadItems.map((notification) => {
                    const cfg = getCategoryConfig(notification.category);
                    const CategoryIcon = cfg.icon;

                    return (
                      <Card 
                        key={notification.id}
                        onClick={() => handleCardClick(notification)}
                        className={`group relative p-4 rounded-2xl bg-[#0e1422] border ${cfg.borderColor} hover:bg-[#131b2e] cursor-pointer transition-all duration-200 ${cfg.glow} flex items-start gap-4 overflow-hidden`}
                      >
                        {/* Glow accent indicator bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-600" />

                        {/* Icon / Avatar */}
                        <div className="relative shrink-0">
                          {notification.actor?.avatar ? (
                            <div className="relative">
                              <img 
                                src={notification.actor.avatar} 
                                alt={notification.actor.name || 'User'} 
                                className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                              />
                              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg ${cfg.bgColor} border ${cfg.borderColor} flex items-center justify-center backdrop-blur-md`}>
                                <CategoryIcon className={`w-3 h-3 ${cfg.color}`} />
                              </div>
                            </div>
                          ) : (
                            <div className={`w-12 h-12 rounded-2xl ${cfg.bgColor} border ${cfg.borderColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                              <CategoryIcon className={`w-6 h-6 ${cfg.color}`} />
                            </div>
                          )}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${cfg.badgeColor}`}>
                              {cfg.badge}
                            </span>
                            <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                              {notification.title}
                            </h4>
                          </div>

                          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                            <span className="text-cyan-400/80 font-medium">
                              {notification.created_at_human}
                            </span>
                            {notification.actor?.username && (
                              <>
                                <span>•</span>
                                <span>@{notification.actor.username}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Inline Actions */}
                        <div className="flex items-center gap-1 shrink-0 self-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => markAsRead(notification.id)}
                            title="Mark as read"
                            className="p-2 rounded-xl text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            title="Delete notification"
                            className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EARLIER / READ SECTION */}
            {readItems.length > 0 && (
              <div className="space-y-3 pt-2">
                {unreadItems.length > 0 && (
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Earlier
                    </h3>
                  </div>
                )}

                <div className="space-y-2.5">
                  {readItems.map((notification) => {
                    const cfg = getCategoryConfig(notification.category);
                    const CategoryIcon = cfg.icon;

                    return (
                      <Card 
                        key={notification.id}
                        onClick={() => handleCardClick(notification)}
                        className="group relative p-4 rounded-2xl bg-[#0a0f18]/90 border border-[#172033] hover:border-[#22304d] hover:bg-[#0f1624] cursor-pointer transition-all duration-200 flex items-start gap-4"
                      >
                        {/* Icon / Avatar */}
                        <div className="relative shrink-0">
                          {notification.actor?.avatar ? (
                            <div className="relative opacity-80 group-hover:opacity-100 transition-opacity">
                              <img 
                                src={notification.actor.avatar} 
                                alt={notification.actor.name || 'User'} 
                                className="w-12 h-12 rounded-2xl object-cover border border-white/5"
                              />
                              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg ${cfg.bgColor} border border-white/10 flex items-center justify-center backdrop-blur-md`}>
                                <CategoryIcon className={`w-3 h-3 ${cfg.color}`} />
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-[#131a29] border border-[#1e293f] flex items-center justify-center">
                              <CategoryIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-200" />
                            </div>
                          )}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#141b2b] text-gray-400 border border-[#1f293d]">
                              {cfg.badge}
                            </span>
                            <h4 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate">
                              {notification.title}
                            </h4>
                          </div>

                          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                            <span>{notification.created_at_human}</span>
                            {notification.actor?.username && (
                              <>
                                <span>•</span>
                                <span>@{notification.actor.username}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Inline Actions */}
                        <div className="flex items-center gap-1 shrink-0 self-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            title="Delete notification"
                            className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
