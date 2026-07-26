import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // next/image MENOLAK host yang tidak terdaftar di sini (HTTP 400), bukan
    // sekadar melewatkannya. res.cloudinary.com adalah tujuan upload di
    // /api/upload dan menampung mayoritas gambar — tanpa entri ini semuanya
    // gagal dimuat begitu <img> diganti <Image>.
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'imud.iaijakarta.or.id' },
    ],
  },
};

export default nextConfig;
