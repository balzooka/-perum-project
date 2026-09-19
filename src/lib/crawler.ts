import { getSupabaseAdmin } from './supabaseAdmin';

/**
 * Crawler progresif Sikumbang.
 *
 * Halaman SSR /?page=N nge-embed 30 lokasi/halaman (dengan wilayah + koordinat).
 * Cron manggil crawlNextBatch() sekali sehari → jalan N halaman dengan delay
 * antar request (polite, gak pukul server pemerintah).
 * Total ~1157 halaman → selesai dalam ±2 bulan, lalu otomatis wrap ke awal
 * (mode refresh).
 */

const BASE_URL = 'https://sikumbang.tapera.go.id';
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

interface ListLokasi {
  idLokasi: string;
  namaPerumahan: string;
  jenisPerumahan: string;
  jumlahUnit?: number;
  jumlahUnitKomersil?: number;
  foto?: string[];
  koordinatPerumahan?: string;
  wilayah: {
    kodeWilayah: string;
    provinsi: string | null;
    kabupaten: string | null;
    kecamatan: string | null;
    kelurahan: string | null;
  };
  pengembang: { nama: string; asosiasi?: string };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(page: number): Promise<ListLokasi[]> {
  const res = await fetch(`${BASE_URL}/?page=${page}`, {
    headers: { 'User-Agent': BROWSER_UA, Referer: `${BASE_URL}/` },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`page ${page} HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(/window\.SIKUMBANG_DATA=(\{[\s\S]*?\});<\/script>/);
  if (!m) throw new Error(`page ${page}: data embed not found`);
  const data = JSON.parse(m[1]) as { listLokasi?: ListLokasi[] };
  return data.listLokasi ?? [];
}

function parseKoordinat(k?: string): { lat: number; lng: number } | null {
  if (!k) return null;
  const [lat, lng] = k.split(',').map(Number);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

function absoluteFoto(fotos: string[] = []): string[] {
  return fotos
    .filter(Boolean)
    .map((f) => (f.startsWith('http') ? f : `${BASE_URL}${f}`))
    .slice(0, 4);
}

async function upsertLokasi(items: ListLokasi[]): Promise<number> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error('Supabase not configured');

  const rows = items.map((i) => {
    const koord = parseKoordinat(i.koordinatPerumahan);
    return {
      id: i.idLokasi,
      name: i.namaPerumahan,
      developer_name: i.pengembang?.nama ?? null,
      property_type: (i.jumlahUnitKomersil ?? 0) > 0 ? 'komersil' : 'subsidi',
      province: i.wilayah?.provinsi ?? null,
      kabupaten: i.wilayah?.kabupaten ?? null,
      kecamatan: i.wilayah?.kecamatan ?? null,
      kelurahan: i.wilayah?.kelurahan ?? null,
      kode_wilayah: i.wilayah?.kodeWilayah ?? null,
      lat: koord?.lat ?? null,
      lng: koord?.lng ?? null,
      images: absoluteFoto(i.foto),
      raw: i,
      updated_at: new Date().toISOString(),
    };
  });

  // upsert: jangan nimpa data yang udah enriched (harga detail udah ada)
  const { error } = await db.from('properties').upsert(rows, {
    onConflict: 'id',
    ignoreDuplicates: false,
  });
  if (error) throw error;
  return rows.length;
}

export interface CrawlResult {
  pagesDone: number;
  itemsUpserted: number;
  lastPage: number;
  nextRunContinuesFrom: number;
}

/**
 * Crawl `pagesThisRun` halaman mulai dari posisi tersimpan + 1.
 * Delay 2 detik antar halaman — 20 halaman ≈ 40 detik, sangat sopan.
 */
export async function crawlNextBatch(pagesThisRun = 20): Promise<CrawlResult> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error('Supabase not configured');

  const { data: state, error } = await db
    .from('crawl_state')
    .select('last_page, pages_total')
    .eq('id', 1)
    .single();
  if (error || !state) throw error ?? new Error('crawl_state not found');

  let page = (state.last_page ?? 0) + 1;
  let items = 0;
  let pagesDone = 0;

  for (let i = 0; i < pagesThisRun; i++) {
    // Wrap-around: habis halaman terakhir → balik ke 1 (mode refresh harian)
    if (page > state.pages_total) page = 1;

    try {
      const list = await fetchPage(page);
      if (list.length > 0) {
        items += await upsertLokasi(list);
      }
      pagesDone++;
      await db
        .from('crawl_state')
        .update({ last_page: page, updated_at: new Date().toISOString() })
        .eq('id', 1);
    } catch (err) {
      // Halaman gagal → berhenti rapi, besok lanjut dari sini (resumable)
      break;
    }
    page++;
    await sleep(2000);
  }

  return {
    pagesDone,
    itemsUpserted: items,
    lastPage: page,
    nextRunContinuesFrom: page + 1,
  };
}
