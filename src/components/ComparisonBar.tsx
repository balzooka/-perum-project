'use client';

import React from 'react';
import { usePropertyStore } from '@/store/usePropertyStore';
import { useLanguage } from '@/context/LanguageContext';
import { Layers, X, Trash2, ArrowRight } from 'lucide-react';

export const ComparisonBar: React.FC = () => {
  const { t } = useLanguage();
  const { comparisonList, removeFromComparison, clearComparison, setComparisonModalOpen } =
    usePropertyStore();

  if (comparisonList.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/40 rounded-full p-2.5 sm:p-3 shadow-2xl shadow-slate-950/20 dark:shadow-emerald-950/60 flex items-center justify-between gap-3 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Left Info & Thumbnails */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2">
          <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <Layers className="w-4 h-4" />
          </div>

          <div className="flex items-center -space-x-2 overflow-hidden">
            {comparisonList.map((item) => (
              <div key={item.id} className="relative group">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-md"
                />
                <button
                  onClick={() => removeFromComparison(item.id)}
                  aria-label="Remove"
                  className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white block sm:inline">
              {comparisonList.length}/3 Properti
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline ml-1">
              Terpilih untuk dikomparasikan
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearComparison}
            aria-label="Clear All"
            className="p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('clearAll')}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setComparisonModalOpen(true)}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105"
          >
            <span>{t('compareButton')} ({comparisonList.length}/3)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
