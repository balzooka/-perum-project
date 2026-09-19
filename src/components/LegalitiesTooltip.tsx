'use client';

import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LegalitiesTooltipProps {
  legalities: string[];
}

export const LegalitiesTooltip: React.FC<LegalitiesTooltipProps> = ({ legalities }) => {
  const { t } = useLanguage();

  const getLegalityDetails = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SHM':
        return {
          label: 'SHM',
          title: t('shmName'),
          description: t('shmDesc'),
        };
      case 'PBG/IMB':
      case 'PBG':
      case 'IMB':
        return {
          label: 'PBG/IMB',
          title: t('pbgName'),
          description: t('pbgDesc'),
        };
      case 'PBB PECAH':
      case 'PBB':
        return {
          label: 'PBB Pecah',
          title: t('pbbName'),
          description: t('pbbDesc'),
        };
      default:
        return {
          label: type,
          title: type,
          description: 'Dokumen legalitas resmi yang telah diverifikasi keabsahannya.',
        };
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {legalities.map((item, idx) => {
        const details = getLegalityDetails(item);
        return (
          <div key={idx} className={`relative group/leg-${idx}`}>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs cursor-help">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>{details.label}</span>
              <Info className="w-2.5 h-2.5 opacity-60 group-hover/leg-${idx}:opacity-100" />
            </span>

            {/* Hover Tooltip Popup — named group biar cuma badge yang dihover yang kebuka */}
            <div
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl opacity-0 pointer-events-none group-hover/leg-${idx}:opacity-100 transition-all z-30 border border-slate-700`}
            >
              <div className="font-bold text-emerald-400 mb-1">{details.title}</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{details.description}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
