'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { useMemberAuth } from '@/src/context/MemberAuthContext';
import { MemberLayout } from '@/src/components/member';
import PortalPageHeader from '@/src/components/member/PortalPageHeader';

export default function MemberSettings() {
  const router = useRouter();
  const { member, loading: authLoading, isAuthenticated } = useMemberAuth();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/portal/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/member/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password berhasil diubah!' });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal mengubah password' });
      }
    } catch (error) {
      console.error('Change password error:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setSaving(false);
    }
  };

  const passwordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = passwordStrength(formData.newPassword);
  const strengthLabels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
  const strengthColors = ['bg-red-500', 'bg-red-400', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'];

  if (authLoading) {
    return (
      <MemberLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-500">Memuat pengaturan...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <MemberLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 lg:space-y-8"
      >
        {/* Header Banner */}
        <PortalPageHeader
          badgeIcon={Lock}
          badgeLabel="Keamanan & Akun"
          title="Pengaturan Akun"
          description="Kelola keamanan password dan kredensial akun portal IAI Muda Wilayah DKI Jakarta."
          backHref="/portal/dashboard"
          backTitle="Kembali ke Dashboard"
        />

        {/* Alert */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 p-4 rounded-xl border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Keamanan Akun</h2>
              <p className="text-sm text-blue-100 leading-relaxed">
                Lindungi akun portal Anda dengan password yang kuat dan unik. Jangan bagikan password kepada siapapun.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-500" /> Tips Password
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  'Minimal 6 karakter',
                  'Kombinasi huruf & angka',
                  'Gunakan simbol unik',
                  'Jangan pakai ulang password',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-900">Ubah Password</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      id="currentPassword"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      disabled={saving}
                      required
                      className="w-full pl-11 pr-11 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                      placeholder="Masukkan password saat ini"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Password Baru
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      id="newPassword"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      disabled={saving}
                      required
                      minLength={6}
                      className="w-full pl-11 pr-11 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                      placeholder="Minimal 6 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Strength Meter */}
                  {formData.newPassword && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(strength / 5) * 100}%` }}
                            className={`h-full rounded-full ${strengthColors[strength - 1] || 'bg-slate-200'}`}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600 w-24 text-right">
                          {strengthLabels[strength - 1] || 'Sangat Lemah'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      disabled={saving}
                      required
                      className="w-full pl-11 pr-11 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                      placeholder="Ketik ulang password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Password tidak cocok
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Ubah Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </MemberLayout>
  );
}
