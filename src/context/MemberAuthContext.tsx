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
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshMember: () => Promise<void>;
  isAuthenticated: boolean;
}

const MemberAuthContext = createContext<MemberAuthContextType | undefined>(undefined);

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('member_token');
      const storedMember = localStorage.getItem('member');

      if (storedToken && storedMember) {
        setToken(storedToken);
        setMember(JSON.parse(storedMember));

        // Verify token with server
        const response = await fetch('/api/member/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setMember(data.member);
          localStorage.setItem('member', JSON.stringify(data.member));
        } else {
          // Token invalid, clear auth
          clearAuth();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearAuth();
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
        setMember(data.member);
        setToken(data.token);
        localStorage.setItem('member_token', data.token);
        localStorage.setItem('member', JSON.stringify(data.member));
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
      clearAuth();
      router.push('/portal/login');
    }
  };

  const refreshMember = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/member/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMember(data.member);
        localStorage.setItem('member', JSON.stringify(data.member));
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Refresh member error:', error);
    }
  };

  const clearAuth = () => {
    setMember(null);
    setToken(null);
    localStorage.removeItem('member_token');
    localStorage.removeItem('member');
  };

  const value: MemberAuthContextType = {
    member,
    token,
    loading,
    login,
    logout,
    refreshMember,
    isAuthenticated: !!member && !!token,
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
