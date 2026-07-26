'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  imageUrl?: string;
  linkedinUrl?: string;
  bio?: string;
  division?: string;
  university?: string;
  isAlumni: boolean;
  showPublic: boolean;
  generation?: {
    id: number;
    name: string;
    years: string;
  } | null;
  position?: {
    id: number;
    name: string;
    category: string;
  } | null;
  lastLoginAt?: string;
}

interface MemberAuthContextType {
  member: Member | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshMember: () => Promise<void>;
  isAuthenticated: boolean;
}

const MemberAuthContext = createContext<MemberAuthContextType | undefined>(undefined);

/** Nama key localStorage dari versi sebelumnya, dibersihkan sekali saat mount. */
const LEGACY_STORAGE_KEYS = ['member_token', 'member'];

/**
 * Sesi portal anggota bersandar sepenuhnya pada cookie httpOnly.
 *
 * Sebelumnya token JWT yang sama juga disimpan di localStorage dan dikirim
 * sebagai header Authorization. Itu meniadakan gunanya httpOnly: skrip apa pun
 * yang berhasil dijalankan di halaman ini bisa membaca token utuh dan
 * memakainya sampai kedaluwarsa. Cookie-nya sendiri sudah bekerja untuk semua
 * request /api ke origin yang sama, jadi salinan di localStorage memang tidak
 * dibutuhkan.
 */
export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    // Buang sisa token dari versi lama yang masih menempel di browser.
    for (const key of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Cookie dikirim otomatis; identitas selalu berasal dari server,
      // tidak dari salinan yang bisa diutak-atik di sisi klien.
      const response = await fetch('/api/member/auth/me', { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setMember(data.member);
      } else {
        setMember(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/member/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // Token dari body response sengaja diabaikan — sesi dibawa cookie.
        setMember(data.member);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: 'Terjadi kesalahan. Silakan coba lagi.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/member/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setMember(null);
      router.push('/portal/login');
    }
  };

  const refreshMember = async () => {
    try {
      const response = await fetch('/api/member/auth/me', { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setMember(data.member);
      } else {
        setMember(null);
      }
    } catch (error) {
      console.error('Refresh member error:', error);
    }
  };

  const value: MemberAuthContextType = {
    member,
    loading,
    login,
    logout,
    refreshMember,
    isAuthenticated: !!member,
  };

  return (
    <MemberAuthContext.Provider value={value}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const context = useContext(MemberAuthContext);
  if (context === undefined) {
    throw new Error('useMemberAuth must be used within MemberAuthProvider');
  }
  return context;
}
