import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, SUPABASE_CONFIGURED } from '@/lib/supabaseAdmin';
import { getLokasiDetail, mapToProperty, getPropertiesByKabupaten, proxyImageUrl } from '@/lib/sikumbang';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import { Property } from '@/lib/types';

// Row dari tabel properties (belum tentu enriched)
interface PropertyRow {
  id: string;
  name: string;
  developer_name: string | null;
  property_type: string;
  price: number | null;
  min_dp: number | null;
  kabupaten: string | null;
  kecamatan: string | null;
  kelurahan: string | null;
  kode_wilayah: string | null;
  lat: number | null;
  lng: number | null;
  images: string[];
  whatsapp_number: string | null;
  specs: Property['specifications'] | null;
  enriched: boolean;
}

function rowToProperty(r: PropertyRow): Property {
  return {
    id: r.id,
    region_id: r.kode_wilayah ?? '',
    name: r.name,
    developer_name: r.developer_name ?? 'Developer terdaftar Tapera',
    property_type: r.property_type === 'komersil' ? 'komersil' : 'subsidi',
    price: r.price ?? 0,
    min_dp: r.min_dp ?? 1_000_000,
    max_cash_installment_months: 24,
    currency: 'IDR',
    address: `${r.kelurahan ?? ''}, ${r.kecamatan ?? ''}, ${r.kabupaten ?? ''}`.replace(/^,\s*/, ''),
    lat: r.lat ?? -7.3274,
    lng: r.lng ?? 108.2207,
    images: r.images?.length ? r.images.map(proxyImageUrl) : ['/images/placeholder.svg'],
    legalities: ['SHM', 'PBG/IMB'],
    specifications:
      r.specs ?? {
        lb: 0,
        lt: 0,
        kamar_tidur: 2,
        kamar_mandi: 1,
        listrik: '1300W',
        air: 'PDAM / Sumur Bor',
      },
    whatsapp_number: r.whatsapp_number ?? '6281234567890',
  };
}

/**
 * Enrichment: ambil detail (harga, tipe, spek, WA) dari halaman detail Sikumbang
 * buat row yang belum enriched, lalu update ke Supabase — jadi makin lama makin lengkap.
 */
async function enrichRows(rows: PropertyRow[], max = 10): Promise<PropertyRow[]> {
  const db = getSupabaseAdmin();
  if (!db) return rows;

  const targets = rows.filter((r) => !r.enriched).slice(0, max);
  for (const row of targets) {
    try {
      const detail = await getLokasiDetail(row.id);
      const prop = mapToProperty(detail);
      const update = {
        price: prop.price,
        min_dp: prop.min_dp,
        property_type: prop.property_type,
        whatsapp_number: prop.whatsapp_number,
        address: prop.address,
        images: prop.images.filter(Boolean),
        specs: prop.specifications,
        enriched: true,
        updated_at: new Date().toISOString(),
      };
      const { error } = await db.from('properties').update(update).eq('id', row.id);
      if (!error) {
        Object.assign(row, {
          price: prop.price,
          min_dp: prop.min_dp,
          property_type: prop.property_type,
          whatsapp_number: prop.whatsapp_number,
          address: prop.address,
          images: prop.images.filter(Boolean),
          enriched: true,
        });
      }
    } catch {
      // detail gagal → biarkan enriched=false, coba lagi lain waktu
    }
  }
  return rows;
}

// GET /api/properties?kabupaten=KOTA%20TASIKMALAYA&kecamatan=Cibeureum
// Rantai sumber: Supabase (data crawl) → live search Sikumbang → mock fallback.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kabupaten = searchParams.get('kabupaten');
  const kecamatan = searchParams.get('kecamatan') ?? undefined;

  if (!kabupaten) {
    return NextResponse.json({ error: 'kabupaten is required' }, { status: 400 });
  }

  // 1. Supabase (source of truth hasil crawl)
  const db = getSupabaseAdmin();
  if (db) {
    try {
      let query = db
        .from('properties')
        .select('*')
        .ilike('kabupaten', `%${kabupaten}%`)
        .limit(30);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let rows = data as PropertyRow[];
        if (kecamatan) {
          const filtered = rows.filter((r) =>
            r.kecamatan?.toLowerCase().includes(kecamatan.toLowerCase())
          );
          rows = filtered.length > 0 ? filtered : rows;
        }
        rows = await enrichRows(rows.slice(0, 10));
        return NextResponse.json({
          source: 'supabase',
          data: rows.map(rowToProperty),
        });
      }
    } catch (err) {
      console.error('[api/properties] supabase:', err);
    }
  }

  // 2. Live fetch Sikumbang (kalau Supabase kosong/belum dikonfigurasi)
  try {
    const data = await getPropertiesByKabupaten(kabupaten, kecamatan, 10);
    if (data.length > 0) {
      return NextResponse.json({ source: 'sikumbang-live', data });
    }
  } catch (err) {
    console.error('[api/properties] live:', err);
  }

  // 3. Mock fallback — UI tetap hidup
  return NextResponse.json({ source: 'mock-fallback', data: MOCK_PROPERTIES });
}
