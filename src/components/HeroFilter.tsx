'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PropertyType, Region } from '@/lib/types';
import { MapPin, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface HeroFilterProps {
  selectedProvinceId: string;
  setSelectedProvinceId: (id: string) => void;
  selectedCityId: string;
  setSelectedCityId: (id: string) => void;
  selectedDistrictId: string;
  setSelectedDistrictId: (id: string) => void;
  selectedType: PropertyType | 'all';
  setSelectedType: (type: PropertyType | 'all') => void;
  onProvinceSelected?: (province: Region) => void;
  onCitySelected?: (city: Region) => void;
  onDistrictSelected?: (district: Region) => void;
}

const FETCH_OPTIONS = { headers: { Accept: 'application/json' } };

export const HeroFilter: React.FC<HeroFilterProps> = ({
  selectedProvinceId,
  setSelectedProvinceId,
  selectedCityId,
  setSelectedCityId,
  selectedDistrictId,
  setSelectedDistrictId,
  selectedType,
  setSelectedType,
  onProvinceSelected,
  onCitySelected,
  onDistrictSelected,
}) => {
  const { t } = useLanguage();

  // Wilayah live dari API Sikumbang (cache di server)
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);

  useEffect(() => {
    fetch('/api/regions?type=provinsi', FETCH_OPTIONS)
      .then((r) => r.json())
      .then((j) => setProvinces(j.data ?? []))
      .catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!selectedProvinceId) {
      setCities([]);
      return;
    }
    fetch(`/api/regions?type=kabupaten&parent=${selectedProvinceId}`, FETCH_OPTIONS)
      .then((r) => r.json())
      .then((j) => setCities(j.data ?? []))
      .catch(() => setCities([]));
  }, [selectedProvinceId]);

  useEffect(() => {
    if (!selectedCityId) {
      setDistricts([]);
      return;
    }
    fetch(`/api/regions?type=kecamatan&parent=${selectedCityId}`, FETCH_OPTIONS)
      .then((r) => r.json())
      .then((j) => setDistricts(j.data ?? []))
      .catch(() => setDistricts([]));
  }, [selectedCityId]);

  // Compute dynamic location display name for hero subtitle
  const selectedDistrict = districts.find((r) => r.id === selectedDistrictId);
  const selectedCity = cities.find((r) => r.id === selectedCityId);

  let dynamicLocationName = 'Indonesia';
  if (selectedDistrict) {
    dynamicLocationName = `Kecamatan ${selectedDistrict.name}`;
  } else if (selectedCity) {
    dynamicLocationName = `${selectedCity.type} ${selectedCity.name}`;
  }

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    setSelectedCityId('');
    setSelectedDistrictId('');
    const prov = provinces.find((p) => p.id === provinceId);
    if (prov && onProvinceSelected) {
      onProvinceSelected(prov);
    }
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    setSelectedDistrictId('');
    const city = cities.find((c) => c.id === cityId);
    if (city && onCitySelected) {
      // Prefetch: mulai warm-up cache properti di server BEGITU user pilih kota,
      // sebelum dia selesai milih kecamatan / klik apapun.
      onCitySelected(city);
    }
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrictId(districtId);
    const dist = districts.find((d) => d.id === districtId);
    if (dist && onDistrictSelected) {
      onDistrictSelected(dist);
    }
  };

  const selectClass =
    'w-full appearance-none bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 focus:border-emerald-500 text-slate-900 dark:text-slate-100 text-xs sm:text-sm rounded-xl py-3 px-3.5 pr-8 focus:outline-none transition-colors';

  return (
    <div className="relative py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3 leading-tight">
          {t('heroTitle')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-normal">
          {t('heroSubtitlePrefix')}{' '}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{dynamicLocationName}</span>.
        </p>
      </div>

      {/* Floating Glass Search Card */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl dark:shadow-2xl">
        {/* Dropdowns Row — Indonesia implicit, mulai dari Provinsi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Province Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              {t('province')}
            </label>
            <div className="relative">
              <select
                value={selectedProvinceId}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className={selectClass}
              >
                <option value="">Pilih Provinsi</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* City / Kabupaten Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              {t('city')}
            </label>
            <div className="relative">
              <select
                value={selectedCityId}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={!selectedProvinceId}
                className={`${selectClass} disabled:opacity-50`}
              >
                <option value="">Pilih Kota / Kabupaten</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {`${c.type} ${c.name}`}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
            </div>
          </div>

          {/* District / Kecamatan Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              {t('district')}
            </label>
            <div className="relative">
              <select
                value={selectedDistrictId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!selectedCityId}
                className={`${selectClass} disabled:opacity-50`}
              >
                <option value="">Semua Kecamatan</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
            </div>
          </div>
        </div>

        {/* Bottom Filter Pills */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Tipe Properti:
            </span>
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedType === 'all'
                  ? 'bg-emerald-500 text-white dark:text-slate-950 font-semibold shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('allTypes')}
            </button>
            <button
              onClick={() => setSelectedType('subsidi')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedType === 'subsidi'
                  ? 'bg-amber-500 text-white dark:text-slate-950 font-semibold shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('subsidi')}
            </button>
            <button
              onClick={() => setSelectedType('komersil')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedType === 'komersil'
                  ? 'bg-emerald-500 text-white dark:text-slate-950 font-semibold shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('komersil')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
