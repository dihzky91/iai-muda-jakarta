'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, AtSign, Loader2 } from 'lucide-react';

interface MemberItem {
  id: number;
  fullName: string;
  roleTitle: string | null;
  division: string | null;
  profileImagePath: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export default function MentionInput({
  value,
  onChange,
  placeholder = 'Tulis sesuatu... ketik @ untuk menandai anggota',
  rows = 3,
  className = '',
}: MentionInputProps) {
  const [query, setQuery] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionPosition, setMentionPosition] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Monitor cursor and typing for `@` symbol
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    onChange(newValue);

    // Look backward from cursor to find if we're inside an active `@` query
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      const isWordBoundary = /\s/.test(charBeforeAt) || lastAtIndex === 0;

      if (isWordBoundary) {
        const searchText = textBeforeCursor.slice(lastAtIndex + 1);
        // Only consider it a mention search if there are no newlines and text length < 25
        if (!searchText.includes('\n') && searchText.length < 25) {
          setQuery(searchText);
          setMentionPosition(lastAtIndex);
          setSelectedIndex(0);
          return;
        }
      }
    }

    setQuery(null);
    setMentionPosition(null);
  };

  // Fetch member autocomplete suggestions when query changes
  useEffect(() => {
    if (query === null) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();

    fetch(`/api/member/community/search-members?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setSuggestions(result.data);
        } else {
          setSuggestions([]);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setSuggestions([]);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [query]);

  // Insert selected mention into textarea
  const selectMember = (member: MemberItem) => {
    if (mentionPosition === null || !textareaRef.current) return;

    const beforeMention = value.slice(0, mentionPosition);
    const textBeforeCursor = value.slice(0, textareaRef.current.selectionStart);
    const afterMention = value.slice(textBeforeCursor.length);

    // Mention syntax: @[Nama Member](memberId)
    const mentionToken = `@[${member.fullName}](${member.id}) `;
    const nextValue = beforeMention + mentionToken + afterMention;

    onChange(nextValue);
    setQuery(null);
    setMentionPosition(null);

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = beforeMention.length + mentionToken.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

  // Keyboard navigation for suggestions popover
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (query !== null && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectMember(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setQuery(null);
      }
    }
  };

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={`w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none ${className}`}
      />

      {/* Autocomplete Popover */}
      {query !== null && (
        <div className="absolute left-0 bottom-full mb-2 w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <AtSign className="w-3 h-3 text-blue-600" /> Mention Anggota
            </span>
            {isLoading && <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />}
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 p-1">
            {suggestions.length > 0 ? (
              suggestions.map((member, index) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => selectMember(member)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                    index === selectedIndex ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {member.profileImagePath ? (
                    <img
                      src={member.profileImagePath}
                      alt={member.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {member.fullName[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{member.fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {member.roleTitle || member.division || 'Anggota IAI Muda'}
                    </p>
                  </div>
                </button>
              ))
            ) : !isLoading ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Tidak ada anggota ditemukan dengan kata kunci &quot;{query}&quot;
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
