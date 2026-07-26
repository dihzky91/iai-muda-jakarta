'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Status akun portal per anggota, plus aksi kelolanya.
 *
 * Dipisah dari MembersManager: pemuatan awal dan tiga aksinya adalah satu
 * urusan tersendiri yang tidak bersinggungan dengan form, filter, atau impor
 * CSV di komponen itu.
 */

export interface MemberAccountInfo {
  memberId: number;
  accountId: number | null;
  isActive: boolean;
}

/** Baris yang dikembalikan GET /api/admin/member-accounts. */
interface AccountRow {
  id: number;
  accountId: number | null;
  accountIsActive: boolean | null;
}

const ENDPOINT = '/api/admin/member-accounts';

function toAccountMap(rows: AccountRow[]): Map<number, MemberAccountInfo> {
  const map = new Map<number, MemberAccountInfo>();
  for (const row of rows) {
    map.set(row.id, {
      memberId: row.id,
      accountId: row.accountId,
      isActive: row.accountIsActive || false,
    });
  }
  return map;
}

interface Options {
  /** Dipanggil untuk memberi umpan balik ke pengguna. */
  notify: (message: string, variant?: 'success' | 'error') => void;
}

export function useMemberAccounts({ notify }: Options) {
  const [accounts, setAccounts] = useState<Map<number, MemberAccountInfo>>(new Map());
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(ENDPOINT, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAccounts(toAccountMap(data.data as AccountRow[]));
        }
      }
    } catch (err) {
      console.error('Failed to load member accounts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /**
   * Buat akun portal. Sengaja melempar saat gagal — dialog pemanggil
   * menampilkan pesannya di dalam form, bukan sebagai toast.
   */
  const createAccount = useCallback(
    async (memberId: number, password: string) => {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ memberId, password }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Gagal membuat akun');
      }

      await reload();
      notify('Akun portal berhasil dibuat!');
    },
    [reload, notify]
  );

  /** Terapkan perubahan ke entri mana pun yang memegang accountId ini. */
  const patchByAccountId = useCallback(
    (accountId: number, patch: Partial<MemberAccountInfo>) => {
      setAccounts(prev => {
        const next = new Map(prev);
        prev.forEach((info, memberId) => {
          if (info.accountId === accountId) {
            next.set(memberId, { ...info, ...patch });
          }
        });
        return next;
      });
    },
    []
  );

  const toggleAccountStatus = useCallback(
    async (accountId: number) => {
      try {
        const response = await fetch(`${ENDPOINT}/${accountId}`, {
          method: 'PUT',
          credentials: 'include',
        });
        const result = await response.json();

        if (result.success) {
          patchByAccountId(accountId, { isActive: result.isActive });
          notify(result.message);
        } else {
          notify(`Gagal: ${result.message}`, 'error');
        }
      } catch {
        notify('Terjadi kesalahan', 'error');
      }
    },
    [patchByAccountId, notify]
  );

  const deleteAccount = useCallback(
    async (accountId: number) => {
      try {
        const response = await fetch(`${ENDPOINT}/${accountId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        const result = await response.json();

        if (result.success) {
          patchByAccountId(accountId, { accountId: null, isActive: false });
          notify('Akun portal berhasil dihapus');
        } else {
          notify(`Gagal: ${result.message}`, 'error');
        }
      } catch {
        notify('Terjadi kesalahan', 'error');
      }
    },
    [patchByAccountId, notify]
  );

  return { accounts, loading, reload, createAccount, toggleAccountStatus, deleteAccount };
}
