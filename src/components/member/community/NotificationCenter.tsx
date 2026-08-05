'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, AtSign, ThumbsUp, CheckCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface NotificationItem {
  id: number;
  type: 'mention' | 'comment' | 'reply' | 'reaction';
  targetPostId: number;
  isRead: boolean;
  createdAt: string;
  actorName: string | null;
  actorAvatar: string | null;
  postContent: string | null;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/member/notifications');
      if (!res.ok) return;
      const result = await res.json();
      if (result.success && result.data) {
        setNotifications(result.data.notifications || []);
        setUnreadCount(result.data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Auto refresh every 60s for TiDB RU efficiency
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/member/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <AtSign className="w-3.5 h-3.5 text-blue-600" />;
      case 'comment':
      case 'reply':
        return <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />;
      case 'reaction':
        return <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getNotifMessage = (item: NotificationItem) => {
    switch (item.type) {
      case 'mention':
        return 'menyebut nama Anda dalam sebuah postingan';
      case 'comment':
        return 'mengomentari postingan Anda';
      case 'reply':
        return 'membalas komentar Anda';
      case 'reaction':
        return 'menyukai postingan Anda';
      default:
        return 'berinteraksi dengan Anda';
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        aria-label="Notifikasi Portal"
        className="relative p-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-600 transition-all cursor-pointer shadow-sm"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" /> Notifikasi Portal
            </h4>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {isLoading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin mx-auto mb-2" />
                <span>Memuat notifikasi...</span>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href={`/portal/feed?post=${item.targetPostId}`}
                  onClick={() => setIsOpen(false)}
                  className={`p-3.5 flex items-start gap-3 transition-colors block ${
                    !item.isRead ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    {item.actorAvatar ? (
                      <img
                        src={item.actorAvatar}
                        alt={item.actorName || 'User'}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {item.actorName?.[0] || 'A'}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full border border-slate-200 shadow-sm">
                      {getNotifIcon(item.type)}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-800 leading-snug">
                      <span className="font-bold text-slate-900">{item.actorName || 'Seseorang'}</span>{' '}
                      {getNotifMessage(item)}
                    </p>
                    {item.postContent && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 italic">
                        &quot;{item.postContent}&quot;
                      </p>
                    )}
                    <span className="text-[9px] text-slate-400 block mt-1">
                      {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {!item.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />}
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">Belum ada notifikasi baru</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
