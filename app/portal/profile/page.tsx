'use client';

import { useEffect, useState, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Camera,
  Mail,
  Phone,
  MessageCircle,
  Linkedin,
  GraduationCap,
  User,
  Save,
  X,
  Pencil,
  AlertTriangle,
  Building2,
  Crown,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useMemberAuth } from '@/src/context/MemberAuthContext';
import { MemberLayout } from '@/src/components/member';
import PortalPageHeader from '@/src/components/member/PortalPageHeader';

export default function MemberProfile() {
  const router = useRouter();
  const { member, loading: authLoading, isAuthenticated, refreshMember } = useMemberAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    linkedinUrl: '',
    bio: '',
    university: '',
    showPublic: true,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/portal/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        whatsapp: member.whatsapp || '',
        linkedinUrl: member.linkedinUrl || '',
        bio: member.bio || '',
        university: member.university || '',
        showPublic: member.showPublic ?? true,
      });
    }
  }, [member]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const response = await fetch(`/api/member/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        setIsEditing(false);
        await refreshMember();
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal memperbarui profil' });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        whatsapp: member.whatsapp || '',
        linkedinUrl: member.linkedinUrl || '',
        bio: member.bio || '',
        university: member.university || '',
        showPublic: member.showPublic ?? true,
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Format file harus JPG, PNG, atau WebP' });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'Ukuran file maksimal 5MB' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const uploadData = new FormData();
      uploadData.append('image', file);

      const response = await fetch('/api/member/profile/image', {
        method: 'POST',
        credentials: 'include',
        body: uploadData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Foto profil berhasil diupload!' });
        await refreshMember();
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal upload foto' });
      }
    } catch (error) {
      console.error('Upload image error:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <MemberLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-500">Memuat profil...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (!member) {
    return null;
  }

  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const inputClass = (disabled: boolean) =>
    `w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 transition-all duration-200 ${
      disabled
        ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
        : 'border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-400'
    }`;

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
          badgeIcon={User}
          badgeLabel="Profil Anggota"
          title="Profil Saya"
          description="Kelola informasi publik dan pribadi Anda sebagai pengurus IAI Muda Wilayah DKI Jakarta."
          rightContent={
            <div className="shrink-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md transition-all cursor-pointer shadow-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profil
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          }
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Photo & Preview */}
          <div className="space-y-6">
            {/* Photo Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Foto Profil</h2>
              <p className="text-sm text-slate-500 mb-6">Wajib menggunakan seragam PDH</p>

              <div className="flex flex-col items-center">
                <div className="relative mb-5">
                  {member.imageUrl ? (
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                      {initials}
                    </div>
                  )}
                  <label
                    htmlFor="imageUpload"
                    className={`absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors ${
                      uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-700" />
                    )}
                  </label>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>

                <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-amber-900">Ketentuan Foto</h3>
                      <ul className="mt-2 text-xs text-amber-800 space-y-1 list-disc list-inside">
                        <li>Pakai seragam PDH IAI Muda Wilayah DKI Jakarta</li>
                        <li>Format: JPG, PNG, atau WebP</li>
                        <li>Ukuran maksimal: 5MB</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Public Preview Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Pratinjau Publik</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {member.imageUrl ? (
                    <Image src={member.imageUrl} alt={member.name} width={56} height={56} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {initials}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">{member.name}</p>
                    <p className="text-sm text-slate-500">{member.position?.name || 'Anggota'}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3">{member.bio || 'Belum ada bio.'}</p>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  {member.showPublic ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 font-medium">Tampil di website publik</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">Tidak tampil di publik</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-900">Informasi Pribadi</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Managed by Admin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-3">
                    <Crown className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Angkatan</label>
                      <p className="text-slate-900 font-medium">{member.generation?.name || '-'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Dikelola admin</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi & Jabatan</label>
                      <p className="text-slate-900 font-medium">{member.division || '-'}</p>
                      <p className="text-xs text-slate-500">{member.position?.name || 'Anggota'}</p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing || saving}
                      required
                      className={`${inputClass(!isEditing || saving)} pl-11`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing || saving}
                      required
                      className={`${inputClass(!isEditing || saving)} pl-11`}
                    />
                  </div>
                </div>

                {/* Phone & WhatsApp */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Nomor Telepon
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing || saving}
                        placeholder="+62812345678"
                        className={`${inputClass(!isEditing || saving)} pl-11`}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700 mb-2">
                      WhatsApp
                    </label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        disabled={!isEditing || saving}
                        placeholder="+62812345678"
                        className={`${inputClass(!isEditing || saving)} pl-11`}
                      />
                    </div>
                  </div>
                </div>

                {/* University */}
                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-slate-700 mb-2">
                    Universitas
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      id="university"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      disabled={!isEditing || saving}
                      placeholder="Contoh: Universitas Indonesia"
                      className={`${inputClass(!isEditing || saving)} pl-11`}
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-slate-700 mb-2">
                    LinkedIn URL
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="url"
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      disabled={!isEditing || saving}
                      placeholder="https://linkedin.com/in/username"
                      className={`${inputClass(!isEditing || saving)} pl-11`}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-2">
                    Bio / Deskripsi Singkat
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing || saving}
                    rows={4}
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                    className={`${inputClass(!isEditing || saving)} resize-none`}
                  />
                </div>

                {/* Privacy Toggle */}
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-3">
                      {formData.showPublic ? (
                        <Eye className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <label className="text-sm font-semibold text-slate-900">
                          Tampilkan di Website Publik
                        </label>
                        <p className="text-xs text-slate-500 mt-1">
                          Profil Anda akan muncul di halaman struktur organisasi website
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, showPublic: !formData.showPublic })}
                      disabled={!isEditing || saving}
                      aria-label="Tampilkan profil di website publik"
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        formData.showPublic ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                          formData.showPublic ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </MemberLayout>
  );
}
