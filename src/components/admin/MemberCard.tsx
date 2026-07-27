'use client';

import React, { useState } from 'react';
import { Users, Mail, Building2, GraduationCap, Linkedin, Eye, EyeOff, Lock, Unlock, Key, Trash2 } from 'lucide-react';
import { Member, Generation } from '@/src/types';
import { HighlightText } from './SearchFilterBar';
import ActionButtons from './ActionButtons';

interface MemberCardProps {
  member: Member;
  generation?: Generation;
  keyword: string;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility?: (memberId: number, showPublic: boolean) => Promise<void>;
  onCreateAccount?: (memberId: number) => void;
  onToggleAccountStatus?: (accountId: number, isActive: boolean) => Promise<void>;
  onDeleteAccount?: (accountId: number) => Promise<void>;
  hasAccount?: boolean;
  accountIsActive?: boolean;
  accountId?: number;
}

export default function MemberCard({
  member,
  generation,
  keyword,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onToggleVisibility,
  onCreateAccount,
  onToggleAccountStatus,
  onDeleteAccount,
  hasAccount = false,
  accountIsActive = false,
  accountId,
}: MemberCardProps) {
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [togglingAccount, setTogglingAccount] = useState(false);

  const handleToggleVisibility = async () => {
    if (!onToggleVisibility || togglingVisibility) return;
    setTogglingVisibility(true);
    try {
      await onToggleVisibility(member.id, !member.showPublic);
    } finally {
      setTogglingVisibility(false);
    }
  };

  const handleToggleAccountStatus = async () => {
    if (!onToggleAccountStatus || !accountId || togglingAccount) return;
    setTogglingAccount(true);
    try {
      await onToggleAccountStatus(accountId, !accountIsActive);
    } finally {
      setTogglingAccount(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!onDeleteAccount || !accountId) return;
    if (confirm('Hapus akun portal member ini? Member tidak akan bisa login lagi.')) {
      await onDeleteAccount(accountId);
    }
  };
  return (
    <div className="group relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
            aria-label={`Pilih ${member.name}`}
          />
        </div>

        {/* Photo */}
        <div className="shrink-0">
          {member.imageUrl ? (
            <img
              src={member.imageUrl}
              alt={member.name}
              className="h-20 w-20 rounded-xl object-cover bg-slate-100 shadow-sm group-hover:scale-[1.02] transition-transform duration-200"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-20 w-20 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
              <Users className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                <HighlightText text={member.name} keyword={keyword} />
              </h4>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">
                <HighlightText text={member.position} keyword={keyword} />
              </p>
            </div>
            <ActionButtons
              onEdit={onEdit}
              onDelete={onDelete}
              editTitle="Ubah"
              deleteTitle="Hapus"
            />
          </div>

          <div className="mt-3 space-y-1.5">
            {member.division && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  <HighlightText text={member.division} keyword={keyword} />
                </span>
              </div>
            )}
            {member.university && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{member.university}</span>
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${member.email}`}
                  className="truncate hover:text-blue-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {member.email}
                </a>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {generation?.name || 'Generasi lama'}
            </span>
            {generation?.isActive && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                Aktif
              </span>
            )}
            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Linkedin className="h-3 w-3" />
                LinkedIn
              </a>
            )}
          </div>

          {/* Portal Account Controls */}
          {(onToggleVisibility || onCreateAccount || onToggleAccountStatus) && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              {/* Visibility Toggle */}
              {onToggleVisibility && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {member.showPublic ? (
                      <Eye className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span className="text-xs text-slate-600">
                      {member.showPublic ? 'Tampil di Publik' : 'Disembunyikan'}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleVisibility}
                    disabled={togglingVisibility}
                    className={`text-[10px] font-medium px-2 py-1 rounded transition-colors ${
                      member.showPublic
                        ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    } disabled:opacity-50`}
                  >
                    {togglingVisibility ? '...' : member.showPublic ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
              )}

              {/* Account Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs text-slate-600">Akun Portal</span>
                </div>
                {hasAccount ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleToggleAccountStatus}
                      disabled={togglingAccount}
                      className={`text-[10px] font-medium px-2 py-1 rounded transition-colors ${
                        accountIsActive
                          ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      } disabled:opacity-50`}
                      title={accountIsActive ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                    >
                      {togglingAccount ? '...' : accountIsActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                    {onDeleteAccount && (
                      <button
                        onClick={handleDeleteAccount}
                        className="text-[10px] font-medium px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                        title="Hapus akun portal"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => onCreateAccount?.(member.id)}
                    className="text-[10px] font-medium px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1"
                  >
                    <Key className="h-3 w-3" />
                    Buat Akun
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
