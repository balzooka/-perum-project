'use client';

import React, { useState } from 'react';
import { useLanguage, LANGUAGE_OPTIONS } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { usePropertyStore } from '@/store/usePropertyStore';
import { FavoritesModal } from './FavoritesModal';
import { Sun, Moon, Globe, Heart, Layers, Building2 } from 'lucide-react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { comparisonList, favoritesList, setComparisonModalOpen } = usePropertyStore();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-slate-950/85 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  Bumipedia
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full">
                  OFFICIAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Global & Regional Property Portal
              </p>
            </div>
          </Link>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Globe className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>{currentLang.flag} {currentLang.label}</span>
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 max-h-96 overflow-y-auto">
                  <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-3 py-1 uppercase tracking-wider">
                    Bahasa Global
                  </div>
                  {LANGUAGE_OPTIONS.filter((l) => l.group === 'Global').map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        language === item.code
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {language === item.code && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                    </button>
                  ))}

                  <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-3 py-1.5 uppercase tracking-wider mt-2 border-t border-slate-200 dark:border-slate-800">
                    Bahasa Daerah Indonesia
                  </div>
                  {LANGUAGE_OPTIONS.filter((l) => l.group === 'Daerah Indonesia').map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        language === item.code
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {language === item.code && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Favorites Button */}
            <button
              onClick={() => setIsFavoritesModalOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              <span className="hidden sm:inline">{t('favorites')}</span>
              {favoritesList.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {favoritesList.length}
                </span>
              )}
            </button>

            {/* Compare Button */}
            <button
              onClick={() => setComparisonModalOpen(true)}
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <Layers className="w-4 h-4" />
              <span>{t('compareButton')}</span>
              {comparisonList.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-white text-emerald-700 rounded-full">
                  {comparisonList.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
      />
    </>
  );
};
