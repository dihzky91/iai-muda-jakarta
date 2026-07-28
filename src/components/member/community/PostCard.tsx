'use client';

import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Lightbulb, PartyPopper, Heart, Pin, Trash2, Send, CornerDownRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export interface PostItem {
  id: number;
  memberId: number;
  content: string;
  imageUrl: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  scope: string;
  targetDivision: string | null;
  isPinned: boolean;
  createdAt: string;
  authorName: string | null;
  authorRole: string | null;
  authorDivision: string | null;
  authorAvatar: string | null;
  commentsCount: number;
  reactionsTotal: number;
  reactionsBreakdown: Record<string, number>;
  myReaction: string | null;
}

interface CommentItem {
  id: number;
  postId: number;
  parentId: number | null;
  memberId: number;
  content: string;
  createdAt: string;
  authorName: string | null;
  authorRole: string | null;
  authorDivision: string | null;
  authorAvatar: string | null;
}

interface PostCardProps {
  post: PostItem;
  currentMemberId?: number | null;
  isAdmin?: boolean;
  onPostDeleted?: (id: number) => void;
}

// Function to render text with clickable @mentions
function renderFormattedContent(text: string) {
  const mentionRegex = /@\[([^\]]+)\]\((\d+)\)/g;
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const memberName = match[1];
    const memberId = match[2];
    parts.push(
      <Link
        key={`${memberId}-${match.index}`}
        href={`/portal/directory?id=${memberId}`}
        className="font-bold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 mx-0.5 transition-colors"
      >
        @{memberName}
      </Link>
    );
    lastIndex = mentionRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function PostCard({ post, currentMemberId, isAdmin, onPostDeleted }: PostCardProps) {
  const [myReaction, setMyReaction] = useState<string | null>(post.myReaction);
  const [reactionsTotal, setReactionsTotal] = useState(post.reactionsTotal);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyToName, setReplyToName] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canDelete = isAdmin || (currentMemberId && post.memberId === currentMemberId);

  const handleToggleReaction = async (reactionType: 'like' | 'insightful' | 'congrats' | 'appreciate') => {
    const prevReaction = myReaction;
    const isRemoving = prevReaction === reactionType;

    setMyReaction(isRemoving ? null : reactionType);
    setReactionsTotal((prev) => (isRemoving ? prev - 1 : prevReaction ? prev : prev + 1));

    try {
      const res = await fetch(`/api/member/community/posts/${post.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
    } catch {
      setMyReaction(prevReaction);
      setReactionsTotal(post.reactionsTotal);
    }
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const res = await fetch(`/api/member/community/posts/${post.id}/comments`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setComments(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/member/community/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentInput,
          parentId: replyToId,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setCommentInput('');
      setReplyToId(null);
      setReplyToName(null);
      setCommentsCount((prev) => prev + 1);
      fetchComments();
    } catch (err: any) {
      console.error(err.message || 'Gagal mengirim komentar');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/member/community/posts/${post.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setShowDeleteModal(false);
        if (onPostDeleted) onPostDeleted(post.id);
      }
    } catch {
      console.error('Gagal menghapus postingan');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 transition-all">
      {/* Header: Author & Controls */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {post.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt={post.authorName || 'Member'}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold">
              {post.authorName?.[0] || 'M'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{post.authorName || 'Anggota IAI Muda'}</h4>
              {post.isPinned && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold flex items-center gap-1">
                  <Pin className="w-2.5 h-2.5" /> Pinned
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              {post.authorRole || post.authorDivision || 'Pengurus IAI Muda'} • {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {canDelete && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Hapus Postingan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
        {renderFormattedContent(post.content)}
      </div>

      {/* Post Image Attachment */}
      {post.imageUrl && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-96 flex items-center justify-center">
          <img src={post.imageUrl} alt="Lampiran Post" className="max-h-96 w-full object-cover" />
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-slate-500 text-xs">
        {/* Reactions Picker */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleToggleReaction('like')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              myReaction === 'like' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-100'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{reactionsTotal > 0 ? reactionsTotal : 'Suka'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleReaction('insightful')}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              myReaction === 'insightful' ? 'bg-amber-50 text-amber-600' : 'hover:bg-slate-100 text-slate-400'
            }`}
            title="Insightful"
          >
            <Lightbulb className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleToggleReaction('congrats')}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              myReaction === 'congrats' ? 'bg-purple-50 text-purple-600' : 'hover:bg-slate-100 text-slate-400'
            }`}
            title="Selamat!"
          >
            <PartyPopper className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleToggleReaction('appreciate')}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              myReaction === 'appreciate' ? 'bg-rose-50 text-rose-600' : 'hover:bg-slate-100 text-slate-400'
            }`}
            title="Apresiasi"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle Comments */}
        <button
          type="button"
          onClick={handleToggleComments}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <span>{commentsCount} Komentar</span>
        </button>
      </div>

      {/* Threaded Comments Section */}
      {showComments && (
        <div className="pt-3 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
          {/* Comment Form */}
          <form onSubmit={handleSendComment} className="space-y-2">
            {replyToName && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold">
                <span>Membalas @{replyToName}</span>
                <button
                  type="button"
                  onClick={() => { setReplyToId(null); setReplyToName(null); }}
                  className="text-blue-500 hover:text-blue-900 font-bold"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={replyToName ? `Tulis balasan untuk @${replyToName}...` : 'Tulis komentar... (ketik @ nama anggota)'}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!commentInput.trim() || isSubmittingComment}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="py-4 text-center">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin mx-auto" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3 pt-2">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 ${
                    comment.parentId ? 'ml-6 sm:ml-8 border-l-2 border-l-blue-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {comment.authorName?.[0] || 'M'}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{comment.authorName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReplyToId(comment.id);
                        setReplyToName(comment.authorName);
                      }}
                      className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <CornerDownRight className="w-3 h-3" /> Balas
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 pl-8 leading-relaxed">
                    {renderFormattedContent(comment.content)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
