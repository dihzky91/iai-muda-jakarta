'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { GalleryItem } from '../types';
import { Camera, Calendar, Maximize2, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface GallerySectionProps {
  galleryItems: GalleryItem[];
}

export default function GallerySection({ galleryItems }: GallerySectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Filter based on search
  const filteredItems = galleryItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenItem = (item: GalleryItem) => {
    setSelectedItem(item);
    setCurrentImgIndex(0);
  };

  return (
    <div className="space-y-12 animate-fade-in" id="gallery-public-section">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
          <Camera className="h-4 w-4" />
          <span>GALERI KEGIATAN</span>
        </div>
        <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">
          Dokumentasi Kegiatan IAI Muda DKI Jakarta
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Kilas balik momen seru, kolaborasi, dan kontribusi nyata pengurus serta anggota dalam memajukan kompetensi akuntan muda di DKI Jakarta.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-md mx-auto relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Cari dokumentasi kegiatan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
        />
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl shadow-sm max-w-md mx-auto space-y-3">
          <Camera className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-slate-700 font-bold text-sm">Dokumentasi Tidak Ditemukan</h3>
          <p className="text-xs text-slate-400">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const hasMultipleImages = item.images && item.images.length > 0;
            const totalCount = 1 + (item.images ? item.images.length : 0);
            
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-200 transition-all group flex flex-col justify-between"
                id={`gallery-card-${item.id}`}
              >
                {/* Image Container with Hover Action */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Multiple image indicator badge */}
                  {hasMultipleImages && (
                    <div className="absolute top-3 left-3 bg-slate-900/80 text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 backdrop-blur-sm">
                      <Camera className="h-3 w-3" />
                      <span>{totalCount} FOTO</span>
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleOpenItem(item)}
                      className="p-3 bg-white/90 hover:bg-white text-slate-900 rounded-full shadow-lg transition-transform scale-90 group-hover:scale-100 cursor-pointer"
                      title="Perbesar Gambar"
                    >
                      <Maximize2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Text Info */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-blue-500" />
                      <span>{item.date}</span>
                    </div>
                    <h3 className="font-display font-bold text-base text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenItem(item)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat Detail</span>
                      <Maximize2 className="h-3 w-3" />
                    </button>
                    {item.photographer && (
                      <span className="text-[10px] text-slate-400 font-medium">Foto: {item.photographer}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal with Carousel and Thumbnail Selection */}
      {selectedItem && (() => {
        const allImages = [selectedItem.imageUrl, ...(selectedItem.images || [])].filter(Boolean);
        const currentSrc = allImages[currentImgIndex] || selectedItem.imageUrl;

        const handlePrev = () => {
          setCurrentImgIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
        };

        const handleNext = () => {
          setCurrentImgIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
        };

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
            id="gallery-lightbox-modal"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full shadow-md transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Main Image Stage with Side Arrows */}
              <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center group/carousel">
                <img
                  src={currentSrc}
                  alt={`${selectedItem.title} - ${currentImgIndex + 1}`}
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />

                {/* Left and Right Nav Buttons */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-4 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white transition-all hover:scale-105 cursor-pointer flex items-center justify-center"
                      title="Sebelumnya"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white transition-all hover:scale-105 cursor-pointer flex items-center justify-center"
                      title="Berikutnya"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Index Counter overlay */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-4 bg-slate-900/70 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm select-none">
                    Foto {currentImgIndex + 1} dari {allImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnail row below main photo */}
              {allImages.length > 1 && (
                <div className="bg-slate-50 border-b border-slate-150 p-4 flex items-center justify-center gap-2 overflow-x-auto">
                  {allImages.map((imgSrc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImgIndex(idx)}
                      className={`relative h-14 w-20 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 transition-all border-2 ${
                        currentImgIndex === idx 
                          ? 'border-blue-600 ring-2 ring-blue-500/20 scale-105' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={imgSrc} alt="" fill sizes="80px" className="object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {/* Modal Content */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-400">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>{selectedItem.date}</span>
                    <span className="text-slate-200">|</span>
                    <span className="text-blue-600 font-semibold">{selectedItem.category || 'Galeri'}</span>
                  </div>
                  {selectedItem.photographer && (
                    <div className="text-xs text-slate-400 font-medium">
                      Dokumentasi: {selectedItem.photographer}
                    </div>
                  )}
                </div>

                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  {selectedItem.title}
                </h2>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
