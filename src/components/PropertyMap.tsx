'use client';

import React, { useEffect, useRef } from 'react';
import { Property } from '@/lib/types';
import { useTheme } from '@/context/ThemeContext';

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedPropertyId,
  onSelectProperty,
  center = [-7.3274, 108.2207],
  zoom = 13,
}) => {
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet')
      .then((leafletModule) => {
        const L = leafletModule.default ?? leafletModule;
        // markercluster plugin nyari global `L` (legacy plugin), jadi kita set dulu
        (window as any).L = L;
        return import('leaflet.markercluster').then(() => L);
      })
      .then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // OpenStreetMap standard tiles (gratis, tanpa API key).
      // Dark mode ditangani via CSS filter (.osm-tiles-dark) di globals.css.
      const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      const tileOptions = {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        className: theme === 'dark' ? 'osm-tiles-dark' : '',
      };

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center,
          zoom,
          zoomControl: false,
        });

        tileLayerRef.current = L.tileLayer(tileUrl, tileOptions).addTo(map);
        L.control.zoom({ position: 'topright' }).addTo(map);
        mapInstanceRef.current = map;
      } else {
        // Update tile layer saat theme berubah
        if (tileLayerRef.current) {
          mapInstanceRef.current.removeLayer(tileLayerRef.current);
        }
        tileLayerRef.current = L.tileLayer(tileUrl, tileOptions).addTo(mapInstanceRef.current);
      }

      // Reset cluster group (markers di-recreate tiap update)
      if (clusterGroupRef.current) {
        mapInstanceRef.current.removeLayer(clusterGroupRef.current);
      }
      clusterGroupRef.current = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
      });
      mapInstanceRef.current.addLayer(clusterGroupRef.current);

      if (properties.length === 0) {
        // Jika belum/tidak ada properti di filter ini, fokuskan peta ke koordinat wilayah yang dipilih
        mapInstanceRef.current.setView(center, zoom);
        return;
      }

      const bounds = L.latLngBounds([]);

      properties.forEach((prop) => {
        bounds.extend([prop.lat, prop.lng]);

        const isSelected = prop.id === selectedPropertyId;
        const isSubsidi = prop.property_type === 'subsidi';

        const pulseColorClass = isSelected
          ? 'border-amber-400 bg-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.8)] scale-125'
          : isSubsidi
          ? 'border-amber-500 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
          : 'border-emerald-400 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]';

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8">
              <span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                isSubsidi ? 'bg-amber-400' : 'bg-emerald-400'
              }"></span>
              <div class="relative w-6 h-6 rounded-full border-2 text-[10px] font-bold text-slate-950 flex items-center justify-center transition-all ${pulseColorClass}">
                🏠
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const formattedPrice = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: prop.currency || 'IDR',
          maximumFractionDigits: 0,
        }).format(prop.price);

        const marker = L.marker([prop.lat, prop.lng], { icon: customIcon });

        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
            <img src="${prop.images[0]}" alt="${prop.name}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
            <h4 style="font-size: 13px; font-weight: 700; color: #1e293b; margin: 0 0 2px 0;">${prop.name}</h4>
            <p style="font-size: 12px; font-weight: 800; color: #059669; margin: 0 0 4px 0;">${formattedPrice}</p>
            <p style="font-size: 10px; color: #64748b; margin: 0;">${prop.address}</p>
          </div>
        `);

        marker.on('click', () => {
          if (onSelectProperty) onSelectProperty(prop.id);
        });

        clusterGroupRef.current.addLayer(marker);
      });

      if (mapInstanceRef.current) {
        // Cek apakah koordinat properti tersebar atau berkumpul di 1 titik
        const southWest = bounds.getSouthWest();
        const northEast = bounds.getNorthEast();
        const isSinglePointOrCluster =
          Math.abs(southWest.lat - northEast.lat) < 0.0001 &&
          Math.abs(southWest.lng - northEast.lng) < 0.0001;

        if (isSinglePointOrCluster) {
          // Jika semua properti berada di titik yang sama (misal fallback center kecamatan/kabupaten),
          // gunakan view center & zoom wilayah agar pengguna tetap melihat context area secara optimal
          mapInstanceRef.current.setView(center, zoom);
        } else {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [properties, selectedPropertyId, center, zoom, theme]);

  return (
    <div className="relative w-full h-full min-h-[350px] sm:min-h-[450px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full z-10 min-h-[350px]" />
      <div className="absolute top-3 left-3 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
        <span>Peta Interaktif Bumipedia ({properties.length} Properti)</span>
      </div>
    </div>
  );
};
