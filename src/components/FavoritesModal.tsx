'use client';

import React from 'react';
import { usePropertyStore } from '@/store/usePropertyStore';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import { PropertyCard } from './PropertyCard';
import { X, Heart, Inbox } from 'lucide-react';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({ isOpen, onClose }) => {
  const { favoritesList } = usePropertyStore();

  if (!isOpen) return null;

  const favoriteProperties = MOCK_PROPERTIES.filter((p) => favoritesList.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center border border-rose-500/30">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Properti Favorit Anda</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {favoriteProperties.length} unit disimpan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {favoriteProperties.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Belum Ada Properti Favorit
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Klik ikon hati ❤️ pada kartu properti untuk menyimpannya di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
