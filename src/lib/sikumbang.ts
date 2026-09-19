import { Property, Region } from './types';

/**
 * Client untuk internal JSON API sikumbang.tapera.go.id (registry rumah subsidi nasional).
 *
 * Catatan penting:
 * - Endpoint ini TIDAK resmi (dipake aplikasi mereka sendiri), kontrak bisa berubah.
 * - Server nge-check User-Agent: tanpa UA browser dia balikin response schema palsu
 *   (JSON dengan key tanpa kutip). Makanya UA wajib diset di semua request.
 * - Semua response di-cache in-memory dengan TTL biar gak pukul server pemerintah.
 */

const BASE_URL = 'https://sikumbang.tapera.go.id';
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 jam — data perumahan gak berubah tiap jam
const cache = new Map<string, { data: unknown; ts: number }>();

async function cachedFetch<T>(key: string, url: string): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    return hit.data as T;
  }
  const res = await fetch(url, {
    headers: {
      'User-Agent': BROWSER_UA,
      Accept: 'application/json',
      Referer: `${BASE_URL}/`,
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`Sikumbang API error ${res.status} for ${url}`);
  }
  const text = await res.text();
  // Deteksi response schema palsu (key tanpa kutip, trigger UA check gagal)
  if (/^\{\s*\n?\s*[a-zA-Z]+:/.test(text) && !text.startsWith('{"')) {
    throw new Error('Sikumbang API returned mock schema (blocked)');
  }
  const data = JSON.parse(text) as T;
  cache.set(key, { data, ts: Date.now() });
  return data;
}

// ---------- Tipe data mentah dari Sikumbang ----------

interface Wilayah {
  kodeWilayah: string;
  namaWilayah: string;
  provinsi: string | null;
  kabupaten: string | null;
  kecamatan: string | null;
  kelurahan: string | null;
}

interface LokasiListItem {
  idLokasi: string;
  namaPerumahan: string;
  jenisPerumahan: string;
  jumlahUnit: number;
  jumlahUnitKomersil: number;
  foto?: string[];
  koordinatPerumahan?: string;
  wilayah: Wilayah;
  pengembang: { nama: string; asosiasi?: string };
}

interface TipeRumah {
  status: string; // "subsidi" | lainnya
  nama: string; // "34/60"
  harga: number;
  kamarTidur: number;
  kamarMandi: number;
  luasTanah: number;
  luasBangunan: number;
  fotoTampak?: string;
  fotoDenah?: string;
}

interface LokasiDetail {
  idLokasi: string;
  namaPerumahan: string;
  jenisPerumahan: string;
  pengembang: { nama: string };
  wilayah: Wilayah;
  kantors?: Array<{
    alamat: string;
    noTelp?: string;
    noWhatsapp?: string | null;
    email?: string;
  }>;
  tipes: TipeRumah[];
}

// ---------- Wilayah ----------

function toRegion(w: Wilayah, parentCode: string | null): Region {
  const raw = w.kabupaten ?? w.namaWilayah;
  const isKota = raw.startsWith('KOTA');
  // namaWilayah udah punya prefix "KOTA ..." / "KAB ..." — strip biar gak dobel
  const name = raw.replace(/^(KOTA|KAB)\.?\s+/i, '').trim();
  return {
    id: w.kodeWilayah,
    parent_id: parentCode,
    name,
    type: isKota ? 'KOTA' : 'KABUPATEN',
    country_code: 'IDN',
  };
}

export async function getProvinces(): Promise<Region[]> {
  const list = await cachedFetch<Wilayah[]>('prov', `${BASE_URL}/ajax/wilayah/get-provinsi`);
  return list.map((w) => toRegion(w, null)).map((r) => ({ ...r, type: 'PROVINSI' }));
}

export async function getKabupaten(provinsiCode: string): Promise<Region[]> {
  const list = await cachedFetch<Wilayah[]>(
    `kab-${provinsiCode}`,
    `${BASE_URL}/ajax/wilayah/get-kabupaten/${provinsiCode}`
  );
  return list.map((w) => toRegion(w, provinsiCode));
}

export async function getKecamatan(kabupatenCode: string): Promise<Region[]> {
  const list = await cachedFetch<Wilayah[]>(
    `kec-${kabupatenCode}`,
    `${BASE_URL}/ajax/wilayah/get-kecamatan/${kabupatenCode}`
  );
  return list.map((w) => ({
    id: w.kodeWilayah,
    parent_id: kabupatenCode,
    name: w.namaWilayah,
    type: 'KECAMATAN' as const,
    country_code: 'IDN',
  }));
}

// ---------- Lokasi / Perumahan ----------

interface SearchResponse {
  count: Record<string, number>;
  data: LokasiListItem[];
}

export async function searchLokasiByWilayah(
  searchField: 'kabupaten' | 'kecamatan',
  namaWilayah: string,
  limit = 10
): Promise<LokasiListItem[]> {
  const url = `${BASE_URL}/ajax/lokasi/search?search=${encodeURIComponent(
    namaWilayah
  )}&searchField=${searchField}&page=1&limit=${limit}`;
  const res = await cachedFetch<SearchResponse>(
    `lok-${searchField}-${namaWilayah}-${limit}`,
    url
  );
  return res.data ?? [];
}

export async function getLokasiDetail(idLokasi: string): Promise<LokasiDetail> {
  const hit = cache.get(`detail-${idLokasi}`);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.data as LokasiDetail;

  const res = await fetch(`${BASE_URL}/lokasi-perumahan/${idLokasi}`, {
    headers: { 'User-Agent': BROWSER_UA },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Sikumbang detail error ${res.status}`);
  const html = await res.text();
  const m = html.match(/window\.SIKUMBANG_DATA=(\{[\s\S]*?\});<\/script>/);
  if (!m) throw new Error('Sikumbang detail data not found');
  const data = JSON.parse(m[1]) as LokasiDetail;
  cache.set(`detail-${idLokasi}`, { data, ts: Date.now() });
  return data;
}

/** URL foto sikumbang wajib lewat proxy kita (server mereka blokir hotlinking) */
export function proxyImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('/api/img')) return url; // idempotent: udah proxied
  if (url.startsWith('/images/')) return url; // aset lokal kita
  if (url.startsWith('/')) return `/api/img?u=${encodeURIComponent(`${BASE_URL}${url}`)}`;
  if (url.startsWith(BASE_URL)) return `/api/img?u=${encodeURIComponent(url)}`;
  return url; // foto lokal (public/images) atau host lain dibiarkan
}

// ---------- Mapping ke domain Property ----------

function parseKoordinat(k?: string): [number, number] {
  if (!k) return [-7.3274, 108.2207]; // fallback: pusat Tasikmalaya
  const [lat, lng] = k.split(',').map(Number);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return [-7.3274, 108.2207];
  return [lat, lng];
}

function normalizeWa(nomor?: string | null): string {
  if (!nomor) return '6281234567890';
  const digits = nomor.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (!digits.startsWith('62')) return `62${digits}`;
  return digits;
}

export function mapToProperty(
  detail: LokasiDetail,
  listItem?: LokasiListItem
): Property {
  const tipes = detail.tipes ?? [];
  const termurah =
    tipes.slice().sort((a, b) => (a.harga ?? Infinity) - (b.harga ?? Infinity))[0] ?? null;

  const isSubsidi = tipes.length > 0 && tipes.every((t) => t.status === 'subsidi');
  const [lat, lng] = parseKoordinat(listItem?.koordinatPerumahan);

  const kantor = detail.kantors?.find((k) => k.noWhatsapp || k.noTelp);
  const images: string[] = [
    ...(listItem?.foto ?? []),
    ...(termurah?.fotoTampak ? [`${BASE_URL}${termurah.fotoTampak}`] : []),
  ]
    .map(proxyImageUrl)
    .slice(0, 4);

  const tipeName = termurah?.nama ?? ''; // "34/60" => lt 60
  const [lbStr, ltStr] = tipeName.split('/');

  return {
    id: detail.idLokasi,
    region_id: detail.wilayah.kodeWilayah,
    name: detail.namaPerumahan,
    developer_name: detail.pengembang?.nama ?? 'Developer terdaftar Tapera',
    property_type: isSubsidi ? 'subsidi' : 'komersil',
    price: termurah?.harga ?? 0,
    min_dp: Math.max(Math.round((termurah?.harga ?? 0) * 0.03), 1_000_000),
    max_cash_installment_months: 24,
    currency: 'IDR',
    address:
      kantor?.alamat ??
      `${detail.wilayah.kelurahan ?? ''}, ${detail.wilayah.kecamatan ?? ''}, ${detail.wilayah.kabupaten ?? ''}`.trim(),
    lat,
    lng,
    images: images.length > 0 ? images : ['/images/placeholder.svg'],
    legalities: ['SHM', 'PBG/IMB'],
    specifications: {
      lb: termurah?.luasBangunan ?? Number(lbStr) ?? 0,
      lt: termurah?.luasTanah ?? Number(ltStr) ?? 0,
      kamar_tidur: termurah?.kamarTidur ?? 2,
      kamar_mandi: termurah?.kamarMandi ?? 1,
      listrik: termurah?.status === 'subsidi' ? '1300W' : '2200W+',
      air: 'PDAM / Sumur Bor',
    },
    whatsapp_number: normalizeWa(kantor?.noWhatsapp ?? kantor?.noTelp),
    instagram_url: undefined,
  };
}

/**
 * Ambil properti untuk satu kabupaten/kota: search list → fetch detail tiap lokasi
 * (N kecil, max 10, semua ke-cache). Return null kalau kota itu belum ada datanya.
 */
export async function getPropertiesByKabupaten(
  namaKabupaten: string,
  kecamatan?: string,
  limit = 10
): Promise<Property[]> {
  // CATATAN: searchField=kabupaten di API Sikumbang TIDAK beneran ngefilter
  // (balikin campuran se-Indonesia), jadi kita filter sendiri by wilayah.kabupaten.
  const items = await searchLokasiByWilayah('kabupaten', namaKabupaten, 50);

  const kab = namaKabupaten.toUpperCase();
  const inKab = items.filter((i) => (i.wilayah.kabupaten ?? '').toUpperCase().includes(kab));

  const filtered = kecamatan
    ? inKab.filter((i) =>
        i.wilayah.kecamatan?.toLowerCase().includes(kecamatan.toLowerCase())
      )
    : inKab;

  // Kalau hasil filter kecamatan kosong, fallback ke se-kabupaten (bukan kosong)
  const target = (filtered.length > 0 ? filtered : inKab).slice(0, limit);
  const properties = await Promise.all(
    target.map(async (item) => {
      try {
        const detail = await getLokasiDetail(item.idLokasi);
        return mapToProperty(detail, item);
      } catch {
        return null; // satu lokasi gagal gak boleh bongkar sisanya
      }
    })
  );
  return properties.filter((p): p is Property => p !== null);
}
