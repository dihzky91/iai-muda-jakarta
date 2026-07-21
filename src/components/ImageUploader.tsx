'use client';
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
}

// Kompres gambar di browser menggunakan Canvas API
// Target: maks 8MB setelah kompresi (aman untuk Cloudinary free tier 10MB)
function compressImage(file: File, maxSizeMB = 8): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Resize kalau resolusi terlalu besar (maks 2560px di sisi terpanjang)
      const MAX_DIMENSION = 2560;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context tidak tersedia'));
      ctx.drawImage(img, 0, 0, width, height);

      // Coba kompres dengan quality menurun sampai ukuran target tercapai
      const tryCompress = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Gagal mengompres gambar'));

            if (blob.size <= maxSizeMB * 1024 * 1024 || quality <= 0.3) {
              // Ukuran sudah oke atau quality sudah minimum
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              // Kurangi quality dan coba lagi
              tryCompress(Math.max(quality - 0.1, 0.3));
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress(0.85);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal membaca gambar'));
    };

    img.src = objectUrl;
  });
}

export default function ImageUploader({
  label,
  value,
  onChange,
  placeholder = "https://images.unsplash.com/photo-...",
  helperText
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Hanya file gambar yang diperbolehkan!');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Ukuran file maksimal adalah 50MB!');
      return;
    }

    setError(null);

    // Kompres kalau ukuran > 8MB
    let fileToUpload = file;
    if (file.size > 8 * 1024 * 1024) {
      setIsCompressing(true);
      try {
        fileToUpload = await compressImage(file);
      } catch (err: any) {
        setError('Gagal mengompres gambar: ' + err.message);
        setIsCompressing(false);
        return;
      }
      setIsCompressing(false);
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', fileToUpload);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Gagal mengunggah foto ke server.');
      }

      const data = await response.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        throw new Error(data.message || 'Gagal mengunggah foto.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Koneksi terputus atau terjadi kesalahan server.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700">{label}</label>
        {value && value.startsWith('https://res.cloudinary.com') && (
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Check className="h-2.5 w-2.5" /> Tersimpan di Cloudinary
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Dropzone & Preview Box */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`md:col-span-4 aspect-video sm:aspect-auto sm:h-[90px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer relative overflow-hidden transition-all p-3 text-center ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50/50' 
              : value 
                ? 'border-slate-200 bg-slate-50 hover:bg-slate-100/80' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {isCompressing ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
              <span className="text-[10px] font-bold text-amber-600">Mengompres...</span>
            </div>
          ) : isUploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="text-[10px] font-bold text-blue-600">Mengunggah...</span>
            </div>
          ) : value ? (
            <>
              <img 
                src={value} 
                alt="Pratinjau" 
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] font-bold text-white bg-slate-900/70 px-2 py-1 rounded-lg backdrop-blur-sm">
                  Ganti Foto
                </span>
              </div>
            </>
          ) : (
            <div className="space-y-1 text-slate-400">
              <Upload className="h-5 w-5 mx-auto text-slate-400" />
              <span className="text-[10px] font-bold block text-slate-500">Pilih / Seret Foto</span>
              <span className="text-[8px] text-slate-400 block font-medium">PNG, JPG, WEBP s.d 50MB (auto-kompres)</span>
            </div>
          )}
        </div>

        {/* Text Input Fallback (Allows pasting external URLs too) */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-1.5">
          <div className="relative">
            <input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-mono text-[11px]"
            />
            <div className="absolute left-3.5 top-3.5 text-slate-400">
              <ImageIcon className="h-4 w-4" />
            </div>
          </div>
          
          {error ? (
            <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 leading-none">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 leading-normal font-medium block">
              {helperText || "Anda bisa mengunggah foto langsung ke server atau menempelkan link gambar eksternal (Unsplash, dll) di atas."}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
