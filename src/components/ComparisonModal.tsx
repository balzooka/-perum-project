'use client';

import React from 'react';
import { usePropertyStore } from '@/store/usePropertyStore';
import { Property } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  X,
  Check,
  Building2,
  MessageCircle,
  Calendar,
  Maximize,
  Bed,
  Bath,
  Zap,
  Droplets,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

interface ComparisonModalProps {
  onOpenAppointmentModal: (propertyId: string, propertyName: string) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ onOpenAppointmentModal }) => {
  const { t, formatAccessText } = useLanguage();
  const { comparisonList, removeFromComparison, isComparisonModalOpen, setComparisonModalOpen } =
    usePropertyStore();

  if (!isComparisonModalOpen) return null;

  const count = comparisonList.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('compareButton')} Properti</h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-300 dark:border-slate-700">
                  {count} Properti
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Komparasi spesifikasi, fasilitas, dan legalitas secara presisi</p>
            </div>
          </div>
          <button
            onClick={() => setComparisonModalOpen(false)}
            aria-label="Close"
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-auto flex-1 space-y-6">
          {count === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Belum ada properti yang dipilih untuk dikomparasikan.</p>
            </div>
          ) : (
            <div className="min-w-[650px]">
              {/* TOP PROPERTY CARD HEADERS GRID */}
              <div
                className="grid gap-4 mb-6"
                style={{
                  gridTemplateColumns: `200px repeat(${count}, minmax(0, 1fr))`,
                }}
              >
                {/* Empty Top-Left Cell */}
                <div className="flex items-end pb-4 font-bold text-xs uppercase tracking-wider text-slate-400">
                  Properti Pilihan
                </div>

                {/* Property Card Header Columns */}
                {comparisonList.map((item) => {
                  const formattedPrice = new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: item.currency || 'IDR',
                    maximumFractionDigits: 0,
                  }).format(item.price);

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
                    >
                      {/* Image Thumbnail with Overlay */}
                      <div className="relative h-36 w-full bg-slate-200 dark:bg-slate-900">
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Type Badge Top-Left */}
                        <span
                          className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            item.property_type === 'subsidi'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-emerald-500 text-slate-950'
                          }`}
                        >
                          {item.property_type === 'subsidi' ? t('subsidi') : t('komersil')}
                        </span>

                        {/* Remove Button Top-Right */}
                        <button
                          onClick={() => removeFromComparison(item.id)}
                          aria-label="Remove"
                          className="absolute top-2.5 right-2.5 p-1 rounded-full bg-slate-950/80 hover:bg-rose-500 text-white backdrop-blur-md transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title & Price Body */}
                      <div className="p-3.5 space-y-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{item.developer_name}</p>
                        <div className="text-base font-black text-emerald-600 dark:text-emerald-400 pt-1">
                          {formattedPrice}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SECTION 1: SPESIFIKASI UTAMA */}
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-1 mb-2">
                  <Maximize className="w-3.5 h-3.5" /> Spesifikasi Utama
                </h4>

                {[
                  { label: t('buildingLabel'), icon: <Maximize className="w-3.5 h-3.5 text-slate-400" />, key: (p: Property) => `${p.specifications.lb} m²` },
                  { label: t('landLabel'), icon: <Maximize className="w-3.5 h-3.5 text-slate-400" />, key: (p: Property) => `${p.specifications.lt} m²` },
                  { label: t('bedroomLabel'), icon: <Bed className="w-3.5 h-3.5 text-slate-400" />, key: (p: Property) => `${p.specifications.kamar_tidur}` },
                  { label: t('bathroomLabel'), icon: <Bath className="w-3.5 h-3.5 text-slate-400" />, key: (p: Property) => `${p.specifications.kamar_mandi}` },
                  { label: 'Daya Listrik', icon: <Zap className="w-3.5 h-3.5 text-slate-400" />, key: (p: Property) => p.specifications.listrik },
                  { label: 'Sumber Air', icon: <Droplets className="w-3.5 h-3.5 text-slate-400" />, key: (p: Property) => p.specifications.air },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="grid gap-4 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 items-center text-xs"
                    style={{
                      gridTemplateColumns: `200px repeat(${count}, minmax(0, 1fr))`,
                    }}
                  >
                    <div className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
                      {row.icon}
                      <span>{row.label}</span>
                    </div>

                    {comparisonList.map((item) => (
                      <div key={item.id} className="font-semibold text-slate-800 dark:text-slate-200 text-center">
                        {row.key(item)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* SECTION 2: FASILITAS KEAMANAN */}
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-1 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Fasilitas Keamanan
                </h4>

                {[
                  { label: t('securityGuard24h'), key: (p: Property) => p.specifications.keamanan?.satpam_24jam },
                  { label: t('oneGateSystem'), key: (p: Property) => p.specifications.keamanan?.one_gate_system },
                  { label: t('cctvSurveillance'), key: (p: Property) => p.specifications.keamanan?.cctv_lingkungan },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="grid gap-4 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 items-center text-xs"
                    style={{
                      gridTemplateColumns: `200px repeat(${count}, minmax(0, 1fr))`,
                    }}
                  >
                    <div className="text-slate-600 dark:text-slate-400 font-medium">{row.label}</div>

                    {comparisonList.map((item) => {
                      const isAvailable = row.key(item);
                      return (
                        <div key={item.id} className="flex justify-center">
                          {isAvailable ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600 font-bold text-base">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* SECTION 3: AKSES TERDEKAT */}
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-1 mb-2">
                  <MapPin className="w-3.5 h-3.5" /> Akses Fasilitas Terdekat
                </h4>

                {[
                  { label: 'Pusat Belanja', key: (p: Property) => p.specifications.akses_terdekat?.pusat_belanja?.[0] },
                  { label: 'Rumah Sakit', key: (p: Property) => p.specifications.akses_terdekat?.rumah_sakit?.[0] },
                  { label: 'Sekolah', key: (p: Property) => p.specifications.akses_terdekat?.sekolah?.[0] },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="grid gap-4 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 items-center text-xs"
                    style={{
                      gridTemplateColumns: `200px repeat(${count}, minmax(0, 1fr))`,
                    }}
                  >
                    <div className="text-slate-600 dark:text-slate-400 font-medium">{row.label}</div>

                    {comparisonList.map((item) => {
                      const val = row.key(item);
                      return (
                        <div key={item.id} className="text-slate-800 dark:text-slate-300 text-center text-[11px]">
                          {val ? formatAccessText(val) : '—'}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* SECTION 4: LEGALITAS & CTAS */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-1 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Status Legalitas & Aksos Langsung
                </h4>

                {/* Legalities Row */}
                <div
                  className="grid gap-4 py-3 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 items-center text-xs mb-4"
                  style={{
                    gridTemplateColumns: `200px repeat(${count}, minmax(0, 1fr))`,
                  }}
                >
                  <div className="text-slate-600 dark:text-slate-400 font-medium">Dokumen Legalitas</div>

                  {comparisonList.map((item) => (
                    <div key={item.id} className="flex flex-wrap justify-center gap-1">
                      {item.legalities.map((leg) => (
                        <span
                          key={leg}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        >
                          {leg}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Action Buttons Row */}
                <div
                  className="grid gap-4 pt-2"
                  style={{
                    gridTemplateColumns: `200px repeat(${count}, minmax(0, 1fr))`,
                  }}
                >
                  <div className="text-slate-600 dark:text-slate-400 text-xs font-medium self-center">Aksi Langsung</div>

                  {comparisonList.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <a
                        href={`https://wa.me/${item.whatsapp_number}?text=${encodeURIComponent(
                          `Halo Marketing, saya berminat dengan perumahan ${item.name}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WA Marketing
                      </a>

                      <button
                        onClick={() => {
                          setComparisonModalOpen(false);
                          onOpenAppointmentModal(item.id, item.name);
                        }}
                        className="w-full py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-500" /> {t('scheduleSurvey')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
