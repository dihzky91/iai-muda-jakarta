'use client';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Landmark, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);

    const result = await login(username, password);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.message || 'Login gagal. Periksa username dan password Anda.');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background Artwork (Monas & Batik Line Art) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <picture>
          <source srcSet="/images/portal-login-bg.webp" type="image/webp" />
          <img
            src="/images/portal-login-bg.png"
            alt="IAI Muda Jakarta Background Artwork"
            className="w-full h-full object-cover object-center opacity-95"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-transparent to-slate-100/30" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">

        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 border border-white/90">
              <Landmark className="h-7 w-7" />
            </div>
          </div>
          <div>
            <h1 className="font-display font-extrabold text-xl text-slate-900 drop-shadow-sm">Portal Admin</h1>
            <p className="text-sm text-slate-600 font-medium mt-1">IAI Muda Wilayah DKI Jakarta</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/90 shadow-2xl shadow-blue-900/10 p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-semibold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Username</label>
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                placeholder="Masukkan username..."
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan password..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 text-sm shadow-md shadow-blue-500/10 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? 'Memverifikasi...' : 'Masuk ke Portal Admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-400 font-mono">
          © 2026 IAI Muda DKI Jakarta — Akses Terbatas
        </p>
      </div>
    </div>
  );
}
