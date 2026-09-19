export interface RegionCoordinate {
  lat: number;
  lng: number;
  zoom: number;
}

// Koordinat bounding/center resmi untuk 37 provinsi di Indonesia (kode wilayah Kemendagri / BPS)
export const PROVINCE_COORDINATES: Record<string, RegionCoordinate> = {
  '11': { lat: 4.6951, lng: 96.7494, zoom: 8 }, // Aceh
  '12': { lat: 2.1154, lng: 99.5451, zoom: 8 }, // Sumatera Utara
  '13': { lat: -0.7399, lng: 100.8, zoom: 8 }, // Sumatera Barat
  '14': { lat: 0.2933, lng: 101.7068, zoom: 8 }, // Riau
  '15': { lat: -1.6101, lng: 103.6131, zoom: 8 }, // Jambi
  '16': { lat: -3.3194, lng: 104.9147, zoom: 8 }, // Sumatera Selatan
  '17': { lat: -3.5778, lng: 102.3464, zoom: 8 }, // Bengkulu
  '18': { lat: -4.5586, lng: 105.4068, zoom: 8 }, // Lampung
  '19': { lat: -2.7411, lng: 106.4406, zoom: 8 }, // Kepulauan Bangka Belitung
  '21': { lat: 3.9457, lng: 108.1429, zoom: 7 }, // Kepulauan Riau
  '31': { lat: -6.2088, lng: 106.8456, zoom: 11 }, // DKI Jakarta
  '32': { lat: -6.9175, lng: 107.6191, zoom: 9 }, // Jawa Barat
  '33': { lat: -7.151, lng: 110.1403, zoom: 9 }, // Jawa Tengah
  '34': { lat: -7.7956, lng: 110.3695, zoom: 10 }, // DI Yogyakarta
  '35': { lat: -7.5361, lng: 112.2384, zoom: 8 }, // Jawa Timur
  '36': { lat: -6.4058, lng: 106.064, zoom: 9 }, // Banten
  '51': { lat: -8.4095, lng: 115.1889, zoom: 10 }, // Bali
  '52': { lat: -8.6529, lng: 117.3616, zoom: 8 }, // Nusa Tenggara Barat
  '53': { lat: -8.6574, lng: 121.0794, zoom: 8 }, // Nusa Tenggara Timur
  '61': { lat: -0.2787, lng: 111.4753, zoom: 7 }, // Kalimantan Barat
  '62': { lat: -1.6815, lng: 113.3824, zoom: 7 }, // Kalimantan Tengah
  '63': { lat: -3.0926, lng: 115.2838, zoom: 8 }, // Kalimantan Selatan
  '64': { lat: 0.5387, lng: 116.4194, zoom: 7 }, // Kalimantan Timur
  '65': { lat: 3.0731, lng: 116.0414, zoom: 7 }, // Kalimantan Utara
  '71': { lat: 0.6247, lng: 123.975, zoom: 8 }, // Sulawesi Utara
  '72': { lat: -1.43, lng: 121.4456, zoom: 7 }, // Sulawesi Tengah
  '73': { lat: -3.6687, lng: 119.9741, zoom: 8 }, // Sulawesi Selatan
  '74': { lat: -4.1449, lng: 122.1746, zoom: 8 }, // Sulawesi Tenggara
  '75': { lat: 0.6999, lng: 122.4467, zoom: 9 }, // Gorontalo
  '76': { lat: -2.8441, lng: 119.2321, zoom: 8 }, // Sulawesi Barat
  '81': { lat: -3.2385, lng: 130.1453, zoom: 7 }, // Maluku
  '82': { lat: 1.5709, lng: 127.8088, zoom: 7 }, // Maluku Utara
  '91': { lat: -4.2699, lng: 138.0804, zoom: 7 }, // Papua
  '92': { lat: -1.3361, lng: 133.1747, zoom: 7 }, // Papua Barat
  '93': { lat: -7.5, lng: 139.5, zoom: 7 }, // Papua Selatan
  '94': { lat: -3.5, lng: 136.5, zoom: 7 }, // Papua Tengah
  '95': { lat: -4.0, lng: 139.0, zoom: 7 }, // Papua Pegunungan
};

// In-memory cache geocoding kabupaten dan kecamatan untuk performa kilat
const geocodeCache = new Map<string, RegionCoordinate>();

/**
 * Geocode nama wilayah (kabupaten/kecamatan) menggunakan OpenStreetMap Nominatim
 * Dilengkapi caching in-memory & fallback aman.
 */
export async function geocodeRegion(
  query: string,
  defaultZoom = 12
): Promise<RegionCoordinate | null> {
  const normalizedKey = query.trim().toLowerCase();
  if (geocodeCache.has(normalizedKey)) {
    return geocodeCache.get(normalizedKey)!;
  }

  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=1`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'BumipediaApp/1.0 (contact@bumipedia.id)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(6_000),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (data && data.length > 0) {
      const coord: RegionCoordinate = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        zoom: defaultZoom,
      };
      geocodeCache.set(normalizedKey, coord);
      return coord;
    }
  } catch (err) {
    console.warn(`[geocodeRegion] Gagal geocode "${query}":`, err);
  }

  return null;
}
