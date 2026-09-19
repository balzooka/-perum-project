'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { LegalitiesTooltip } from '@/components/LegalitiesTooltip';
import { FinancialCalculators } from '@/components/FinancialCalculators';
import { AppointmentModal } from '@/components/AppointmentModal';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import { Property } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  ShieldCheck,
  Check,
  MessageCircle,
  Share2,
  Video,
  Globe,
} from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const { t, formatAccessText } = useLanguage();
  const propertyId = params?.id as string;

  const [property, setProperty] = useState<Property>(
    () => MOCK_PROPERTIES.find((p) => p.id === propertyId) || MOCK_PROPERTIES[0]
  );

  const [selectedImage, setSelectedImage] = useState<string>(property.images[0]);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);

  // Live fetch dari Sikumbang (mock cuma fallback initial render)
  useEffect(() => {
    let active = true;
    fetch(`/api/property/${propertyId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (active && j?.data) {
          setProperty(j.data);
          setSelectedImage(j.data.images[0]);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [propertyId]);

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: property.currency || 'IDR',
    maximumFractionDigits: 0,
  }).format(property.price);

  const formattedDp = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: property.currency || 'IDR',
    maximumFractionDigits: 0,
  }).format(property.min_dp);

  const cleanPhone = property.whatsapp_number.replace(/[^0-9]/g, '');
  const waDirectUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo Marketing ${property.developer_name}, saya tertarik dengan perumahan ${property.name}. Boleh minta informasi pricelist lengkapnya?`
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
          {/* Main Large Image */}
          <div className="lg:col-span-8 h-80 sm:h-[450px] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative shadow-lg">
            <img src={selectedImage} alt={property.name} className="w-full h-full object-cover" />
            <span
              className={`absolute top-4 left-4 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-lg backdrop-blur-md ${
                property.property_type === 'subsidi'
                  ? 'bg-amber-500 text-slate-950 border border-amber-400'
                  : 'bg-emerald-500 text-slate-950 border border-emerald-400'
              }`}
            >
              {property.property_type === 'subsidi' ? t('subsidi') : t('komersil')}
            </span>
          </div>

          {/* Side Thumbnail Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 h-auto lg:h-[450px]">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative rounded-2xl overflow-hidden border-2 h-28 sm:h-36 lg:h-[140px] transition-all ${
                  selectedImage === img
                    ? 'border-emerald-500 scale-[0.98]'
                    : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Header & Main Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Column: Details & Specs */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {formattedPrice}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: property.name, url: window.location.href });
                      }
                    }}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                {property.name}
              </h1>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
                {property.developer_name}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>{property.address}</span>
              </div>
            </div>

            {/* Anti-Tipu Legalities Section */}
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('antiTipuBannerTitle')}
                </h3>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mb-3">
                {t('antiTipuBannerSubtitle')}
              </p>
              <LegalitiesTooltip legalities={property.legalities} />
            </div>

            {/* Specs Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('bedroomLabel')}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{property.specifications.kamar_tidur} Unit</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('bathroomLabel')}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{property.specifications.kamar_mandi} Unit</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Maximize className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('buildingLabel')}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{property.specifications.lb} m²</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Maximize className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('landLabel')}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{property.specifications.lt} m²</span>
                </div>
              </div>
            </div>

            {/* Keamanan & Akses Terdekat */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                {t('securityAndAccessTitle')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Keamanan */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">{t('securitySystemTitle')}</span>
                  <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                      <span>{t('securityGuard24h')}: {property.specifications.keamanan?.satpam_24jam ? t('yes') : t('no')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                      <span>{t('oneGateSystem')}: {property.specifications.keamanan?.one_gate_system ? t('yes') : t('no')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                      <span>{t('cctvSurveillance')}: {property.specifications.keamanan?.cctv_lingkungan ? t('yes') : t('no')}</span>
                    </div>
                  </div>
                </div>

                {/* Akses Terdekat */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">{t('publicAccessTitle')}</span>
                  <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                    {property.specifications.akses_terdekat?.pusat_belanja?.map((acc, idx) => (
                      <div key={idx}>🛒 {formatAccessText(acc)}</div>
                    ))}
                    {property.specifications.akses_terdekat?.rumah_sakit?.map((acc, idx) => (
                      <div key={idx}>🏥 {formatAccessText(acc)}</div>
                    ))}
                    {property.specifications.akses_terdekat?.akses_tol?.map((acc, idx) => (
                      <div key={idx}>🛣️ {formatAccessText(acc)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Simulator */}
            <FinancialCalculators property={property} />
          </div>

          {/* Right Column: Sticky Action Box with Social Media Links */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl space-y-4">
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t('minDpLabel')}</span>
                <span className="text-2xl font-black text-amber-500 dark:text-amber-400">{formattedDp}</span>
              </div>

              {/* Main CTAs */}
              <div className="space-y-3">
                <a
                  href={waDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
                >
                  <MessageCircle className="w-5 h-5" /> {t('chatWA')}
                </a>

                <button
                  onClick={() => setIsAppointmentOpen(true)}
                  className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 transition-all hover:scale-[1.01]"
                >
                  <Calendar className="w-5 h-5 text-amber-500" /> {t('scheduleSurvey')}
                </button>
              </div>

              {/* Social Media Links (Instagram & TikTok) */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block text-center">
                  {t('developerSocialsTitle')}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {property.instagram_url ? (
                    <a
                      href={property.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-600 dark:text-pink-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Globe className="w-4 h-4" /> Instagram
                    </a>
                  ) : (
                    <div className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs text-center">
                      Instagram N/A
                    </div>
                  )}

                  {property.tiktok_url ? (
                    <a
                      href={property.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Video className="w-4 h-4" /> TikTok
                    </a>
                  ) : (
                    <div className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs text-center">
                      TikTok N/A
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 text-center text-[11px] text-slate-500">
                {t('noHiddenFees')}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        propertyId={property.id}
        propertyName={property.name}
        whatsappNumber={property.whatsapp_number}
      />
    </div>
  );
}
