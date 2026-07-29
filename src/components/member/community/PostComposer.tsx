'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Globe, Users, Loader2, X, AlertCircle, Tag } from 'lucide-react';
import MentionInput from './MentionInput';
import { COMMUNITY_CATEGORIES } from './categories';

interface PostComposerProps {
  onPostSuccess: () => void;
  userDivision?: string | null;
}

// Client-side image compression (Compress to WebP / JPEG <= 300KB)
function compressImage(file: File, maxDim = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression error'));
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal membaca gambar'));
    };

    img.src = objectUrl;
  });
}

export default function PostComposer({ onPostSuccess, userDivision }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('umum');
  const [categoriesList, setCategoriesList] = useState(COMMUNITY_CATEGORIES);
  const [scope, setScope] = useState<'all' | 'division'>('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/member/community/categories')
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setCategoriesList(result.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan');
      return;
    }

    setError(null);
    try {
      // Compress image client-side before previewing
      const compressed = await compressImage(file);
      setSelectedFile(compressed);
      setImagePreviewUrl(URL.createObjectURL(compressed));
    } catch (err: any) {
      console.error(err);
      setError('Gagal memproses gambar');
    }
  };

  const removeSelectedImage = () => {
    setSelectedFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | null = null;

      // 1. Upload image if selected
      if (selectedFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.message || 'Gagal mengunggah gambar');
        }
        imageUrl = uploadData.url;
        setIsUploading(false);
      }

      // 2. Publish post
      const postRes = await fetch('/api/member/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          category,
          imageUrl,
          scope,
        }),
      });

      const postData = await postRes.json();
      if (!postRes.ok) {
        throw new Error(postData.message || 'Gagal menerbitkan postingan');
      }

      // Reset form
      setContent('');
      setCategory('umum');
      removeSelectedImage();
      onPostSuccess();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Pill Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Topik:
          </span>
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                category === cat.id
                  ? cat.badgeClass + ' ring-2 ring-blue-500/20 font-bold'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {cat.hashtag}
            </button>
          ))}
        </div>

        <MentionInput
          value={content}
          onChange={setContent}
          placeholder="Bagikan sesuatu atau ajukan diskusi... (Gunakan @ untuk menyebut anggota)"
          rows={3}
        />

        {/* Selected Image Preview */}
        {imagePreviewUrl && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-64 flex items-center justify-center">
            <img src={imagePreviewUrl} alt="Preview Upload" className="max-h-64 w-full object-cover" />
            <button
              type="button"
              onClick={removeSelectedImage}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors shadow-lg"
              title="Hapus Gambar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {/* Upload Photo Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-semibold transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>Foto</span>
            </button>

            {/* Scope Selection */}
            {userDivision && (
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    scope === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3 h-3 inline mr-1" /> Semua
                </button>
                <button
                  type="button"
                  onClick={() => setScope('division')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    scope === 'division' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3 h-3 inline mr-1" /> Divisi Saya
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isUploading ? 'Mengunggah...' : 'Menerbitkan...'}</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Posting</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
