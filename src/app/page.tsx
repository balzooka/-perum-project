'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { HeroFilter } from '@/components/HeroFilter';
import { PropertyCard } from '@/components/PropertyCard';
import { ComparisonBar } from '@/components/ComparisonBar';
import { ComparisonModal } from '@/components/ComparisonModal';
import { AppointmentModal } from '@/components/AppointmentModal';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import { Property, PropertyType, Region } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { AlertTriangle, Building2, ShieldCheck, Sparkles, Inbox, Loader2 } from 'lucide-react';

const PropertyMap = dynamic(
  () => import('@/components/PropertyMap').then((mod) => mod.PropertyMap),
  { ssr: false }
);

// Default: Jawa Barat (32) → Kota Tasikmalaya (3278)
const DEFAULT_PROVINCE = '32';
const DEFAULT_CITY = { id: '3278', name: 'KOTA TASIKMALAYA' };

export default function Home() {
  const { t } = useLanguage();

  // Cascading Region Filter States (kode wilayah Kemendagri)
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(DEFAULT_PROVINCE);
  const [selectedCityId, setSelectedCityId] = useState<string>(DEFAULT_CITY.id);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');

  // Nama kabupaten terpilih (dipakai buat fetch properti)
  const [cityName, setCityName] = useState<string>(DEFAULT_CITY.name);

  // Daftar kecamatan (buat lookup nama, ke-filter sama-sama di server cache)
  const [districts, setDistricts] = useState<Region[]>([]);

  // Live properties dari Sikumbang (on-demand + server cache)
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFromFallback, setIsFromFallback] = useState<boolean>(false);

  // Property Type Filter State
  const [selectedType, setSelectedType] = useState<PropertyType | 'all'>('all');

  // Selected Property for Map Highlight
  const [selectedMapPropertyId, setSelectedMapPropertyId] = useState<string | undefined>(undefined);

  // Map viewport states (Province -> City -> District)
  // Default Tasikmalaya [-7.3274, 108.2207]
  const [mapCenter, setMapCenter] = useState<[number, number]>([-7.3274, 108.2207]);
  const [mapZoom, setMapZoom] = useState<number>(13);

  // Appointment Modal State
  const [appointmentModalState, setAppointmentModalState] = useState<{
    isOpen: boolean;
    propertyId: string;
    propertyName: string;
    whatsappNumber: string;
  }>({
    isOpen: false,
    propertyId: '',
    propertyName: '',
    whatsappNumber: '',
  });

  // Fetch daftar kecamatan tiap ganti kota (buat lookup nama kecamatan)
  useEffect(() => {
    if (!selectedCityId) {
      setDistricts([]);
      return;
    }
    fetch(`/api/regions?type=kecamatan&parent=${selectedCityId}`)
      .then((r) => r.json())
      .then((j) => setDistricts(j.data ?? []))
      .catch(() => setDistricts([]));
  }, [selectedCityId]);

  // On-demand fetch properti per kabupaten (diprefetch pas user pilih kota di dropdown)
  const loadProperties = useCallback(async (kabupatenName: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/properties?kabupaten=${encodeURIComponent(kabupatenName)}`);
      const json = await res.json();
      setAllProperties(json.data ?? []);
      setIsFromFallback(json.source === 'mock-fallback');
    } catch {
      setAllProperties(MOCK_PROPERTIES);
      setIsFromFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cityName) loadProperties(cityName);
  }, [cityName, loadProperties]);

  // Dipanggil HeroFilter saat user memilih Provinsi
  const handleProvinceSelected = useCallback((province: Region) => {
    if (province.lat && province.lng) {
      setMapCenter([province.lat, province.lng]);
      setMapZoom(province.zoom || 9);
    }
  }, []);

  // Dipanggil HeroFilter BEGITU user pilih kota (prefetch & update peta)
  const handleCitySelected = useCallback(async (city: Region) => {
    setCityName(city.name);

    // Geocode nama kota/kabupaten jika belum punya koordinat
    if (city.lat && city.lng) {
      setMapCenter([city.lat, city.lng]);
      setMapZoom(city.zoom || 12);
      return;
    }

    try {
      const query = `${city.type ? city.type + ' ' : ''}${city.name}, Indonesia`;
      const res = await fetch(`/api/regions?type=geocode&q=${encodeURIComponent(query)}&zoom=12`);
      const json = await res.json();
      if (json.data && json.data.lat && json.data.lng) {
        setMapCenter([json.data.lat, json.data.lng]);
        setMapZoom(json.data.zoom || 12);
      }
    } catch (err) {
      console.warn('Failed to geocode city:', err);
    }
  }, []);

  // Dipanggil HeroFilter saat user memilih Kecamatan
  const handleDistrictSelected = useCallback(async (district: Region) => {
    if (district.lat && district.lng) {
      setMapCenter([district.lat, district.lng]);
      setMapZoom(district.zoom || 14);
      return;
    }

    try {
      const query = `Kecamatan ${district.name}, ${cityName}, Indonesia`;
      const res = await fetch(`/api/regions?type=geocode&q=${encodeURIComponent(query)}&zoom=14`);
      const json = await res.json();
      if (json.data && json.data.lat && json.data.lng) {
        setMapCenter([json.data.lat, json.data.lng]);
        setMapZoom(json.data.zoom || 14);
      }
    } catch (err) {
      console.warn('Failed to geocode district:', err);
    }
  }, [cityName]);

  // Client-side filter: kecamatan + tipe
  const selectedDistrictName = districts.find((d) => d.id === selectedDistrictId)?.name;

  const { filteredProperties, isFallbackTriggered, fallbackDistrictName } = useMemo(() => {
    let results = allProperties.filter((p) => {
      const matchDistrict = selectedDistrictName
        ? p.address.toLowerCase().includes(selectedDistrictName.toLowerCase())
        : true;
      const matchType = selectedType === 'all' ? true : p.property_type === selectedType;
      return matchDistrict && matchType;
    });

    let isFallback = false;
    let fallbackName = '';

    // Kalau kecamatan spesifik kosong → tampilin se-kota + warning
    if (results.length === 0 && selectedDistrictName) {
      isFallback = true;
      fallbackName = selectedDistrictName;
      results = allProperties.filter(
        (p) => selectedType === 'all' || p.property_type === selectedType
      );
    }

    return {
      filteredProperties: results,
      isFallbackTriggered: isFallback,
      fallbackDistrictName: fallbackName,
    };
  }, [allProperties, selectedDistrictName, selectedType]);

  const handleOpenAppointmentModal = (propertyId: string, propertyName: string) => {
    const targetProp = allProperties.find((p) => p.id === propertyId);
    setAppointmentModalState({
      isOpen: true,
      propertyId,
      propertyName,
      whatsappNumber: targetProp?.whatsapp_number || '6281234567890',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <main className="flex-1 pb-24">
        <HeroFilter
          selectedProvinceId={selectedProvinceId}
          setSelectedProvinceId={setSelectedProvinceId}
          selectedCityId={selectedCityId}
          setSelectedCityId={setSelectedCityId}
          selectedDistrictId={selectedDistrictId}
          setSelectedDistrictId={setSelectedDistrictId}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          onProvinceSelected={handleProvinceSelected}
          onCitySelected={handleCitySelected}
          onDistrictSelected={handleDistrictSelected}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          {/* Fallback Radius Warning Banner */}
          {isFallbackTriggered && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs sm:text-sm flex items-start gap-3 shadow-lg animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900 dark:text-white mb-0.5">
                  Belum ada perumahan di Kecamatan {fallbackDistrictName}
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  Berikut opsi terdekat di sekitarnya yang telah diverifikasi kelengkapan legalitasnya:
                </p>
              </div>
            </div>
          )}

          {isFromFallback && !isLoading && (
            <div className="mb-6 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Data resmi sedang tidak dapat diakses — menampilkan data cadangan.
            </div>
          )}

          {/* Split View Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Interactive Map */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 h-[350px] sm:h-[450px] lg:h-[calc(100vh-140px)]">
              <PropertyMap
                properties={filteredProperties}
                selectedPropertyId={selectedMapPropertyId}
                onSelectProperty={(id) => setSelectedMapPropertyId(id)}
                center={mapCenter}
                zoom={mapZoom}
              />
            </div>

            {/* Right Column: Property Cards Grid */}
            <div className="lg:col-span-7 space-y-6">
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Daftar Properti Terverifikasi ({isLoading ? '...' : filteredProperties.length})
                  </h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Transparansi Full Legalitas
                </span>
              </div>

              {/* Loading Skeleton */}
              {isLoading ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Mengambil data perumahan resmi {cityName.toLowerCase()} ...
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sumber: Sikumbang — Kementerian PUPR/BP Tapera
                  </p>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <Inbox className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {t('noResultsTitle')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {t('noResultsSubtitle')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredProperties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ComparisonBar />

      <ComparisonModal
        onOpenAppointmentModal={(id, name) => handleOpenAppointmentModal(id, name)}
      />

      <AppointmentModal
        isOpen={appointmentModalState.isOpen}
        onClose={() =>
          setAppointmentModalState((prev) => ({ ...prev, isOpen: false }))
        }
        propertyId={appointmentModalState.propertyId}
        propertyName={appointmentModalState.propertyName}
        whatsappNumber={appointmentModalState.whatsappNumber}
      />
    </div>
  );
}
