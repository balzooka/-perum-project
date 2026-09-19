'use client';

import React, { useState } from 'react';
import { Property } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { usePropertyStore } from '@/store/usePropertyStore';
import { LegalitiesTooltip } from './LegalitiesTooltip';
import { Bed, Bath, Maximize, MapPin, Heart, Plus, Check, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

interface PropertyCardProps {
  property: Property;
  distanceTag?: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, distanceTag }) => {
  const { t } = useLanguage();
  const { comparisonList, addToComparison, favoritesList, toggleFavorite } = usePropertyStore();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isCompared = comparisonList.some((p) => p.id === property.id);
  const isFavorite = favoritesList.includes(property.id);

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: property.currency || 'IDR',
    maximumFractionDigits: 0,
  }).format(property.price);

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="group bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl dark:shadow-slate-950 flex flex-col h-full">
      {/* Top Image Carousel */}
      <div className="relative w-full h-52 sm:h-56 bg-slate-100 dark:bg-slate-950 overflow-hidden">
        <img
          src={property.images[currentImageIndex] || property.images[0]}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Carousel Navigation Overlay */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              aria-label="Previous Image"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              aria-label="Next Image"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Carousel Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {property.images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'w-4 bg-emerald-500' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Property Type Badge Top-Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md ${
              property.property_type === 'subsidi'
                ? 'bg-amber-500 text-slate-950 border border-amber-400'
                : 'bg-emerald-500 text-slate-950 border border-emerald-400'
            }`}
          >
            {property.property_type === 'subsidi' ? t('subsidi') : t('komersil')}
          </span>

          {/* Brochure Fallback Badge */}
          {property.is_brochure_fallback && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/90 text-slate-200 border border-slate-700 flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3 text-amber-400" /> Brosur Resmi
            </span>
          )}
        </div>

        {/* Favorite Button & Distance Tag Top-Right */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {distanceTag && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 shadow-md">
              📍 {distanceTag}
            </span>
          )}
          <button
            onClick={() => toggleFavorite(property.id)}
            aria-label="Toggle Favorite"
            className="p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'text-rose-500 fill-rose-500' : 'text-slate-300'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Name */}
          <div className="mb-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formattedPrice}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-emerald-500 transition-colors mt-0.5">
              {property.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">{property.developer_name}</p>
          </div>

          {/* Address */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{property.address}</span>
          </div>

          {/* Specs Icon Grid with i18n */}
          <div className="grid grid-cols-4 gap-2 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 mb-4 text-center">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                {property.specifications.kamar_tidur}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t('bedroomLabel')}</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                {property.specifications.kamar_mandi}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t('bathroomLabel')}</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                {property.specifications.lb}m²
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t('buildingLabel')}</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                {property.specifications.lt}m²
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t('landLabel')}</span>
            </div>
          </div>

          {/* Legalities Badges */}
          <div className="mb-4">
            <LegalitiesTooltip legalities={property.legalities} />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => addToComparison(property)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isCompared
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {isCompared ? (
              <>
                <Check className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('comparedBadge')}</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addComparison')}</span>
              </>
            )}
          </button>

          <Link
            href={`/property/${property.id}`}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <span>{t('detailsButton')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
