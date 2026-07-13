/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Article } from '../types';
import { FileText, Calendar, User, ArrowLeft, Clock, Share2, BookOpen } from 'lucide-react';

interface ArticlesSectionProps {
  articles: Article[];
}

export default function ArticlesSection({ articles }: ArticlesSectionProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <div className="py-8 space-y-10" id="articles-section-container">
      
      {selectedArticle ? (
        /* --- FULL ARTICLE DETAIL VIEW --- */
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" id="article-reader-view">
          
          {/* Back button */}
          <button
            id="back-to-articles-btn"
            onClick={() => setSelectedArticle(null)}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-slate-700 px-4 py-2.5 text-xs font-bold cursor-pointer transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-blue-600" />
            Kembali ke Berita & Artikel
          </button>

          {/* Banner cover */}
          {selectedArticle.imageUrl && (
            <div className="aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
              <img 
                src={selectedArticle.imageUrl} 
                alt={selectedArticle.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Article Info */}
          <div className="space-y-4">
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                {selectedArticle.date}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-blue-600" />
                Oleh: {selectedArticle.author}
              </span>
              <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg text-slate-700">
                <Clock className="h-3.5 w-3.5 text-blue-500 mr-1" />
                3 Menit Baca
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              {selectedArticle.title}
            </h1>

            {/* Render article body nicely with beautiful typographic spacing */}
            <div className="max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 pt-6 border-t border-slate-100">
              {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-slate-700 font-sans leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Share action banner */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Ikatan Akuntan Indonesia (IAI) Muda DKI Jakarta</span>
              <button 
                id="share-article-btn"
                onClick={() => alert('Tautan artikel berhasil disalin ke clipboard!')}
                className="flex items-center gap-1.5 hover:text-blue-600 text-slate-500 font-bold transition-all cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                Bagikan Artikel
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* --- ARTICLE LIST FEED VIEW --- */
        <>
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Artikel & Opini Akuntansi Terkini
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Eksplorasi wawasan, opini, dan panduan terkini seputar dunia auditing, perpajakan, teknologi audit, serta pengembangan profesi Chartered Accountant.
            </p>
          </div>

          {/* Grid list of articles */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((art) => (
              <div 
                key={art.id}
                id={`article-card-${art.id}`}
                className="group flex flex-col sm:flex-row overflow-hidden rounded-3xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 shadow-sm"
              >
                {/* Side Image */}
                {art.imageUrl && (
                  <div className="sm:w-2/5 aspect-video sm:aspect-auto bg-slate-50 overflow-hidden relative">
                    <img 
                      src={art.imageUrl} 
                      alt={art.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Article Info details */}
                <div className="sm:w-3/5 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    
                    <div className="flex items-center gap-3 text-[10px] font-mono font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        {art.date}
                      </span>
                      <span>Oleh: {art.author}</span>
                    </div>

                    <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                      {art.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>

                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      id={`read-article-btn-${art.id}`}
                      onClick={() => setSelectedArticle(art)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-blue-700 cursor-pointer transition-all"
                    >
                      Baca Selengkapnya
                      <BookOpen className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">3 min read</span>
                  </div>

                </div>

              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
