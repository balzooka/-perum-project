import { NextRequest, NextResponse } from 'next/server';
import { getProvinces, getKabupaten, getKecamatan } from '@/lib/sikumbang';
import { PROVINCE_COORDINATES, geocodeRegion } from '@/lib/regionsCoordinates';

// GET /api/regions?type=provinsi
// GET /api/regions?type=kabupaten&parent=32
// GET /api/regions?type=kecamatan&parent=3278
// GET /api/regions?type=geocode&q=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'provinsi';
  const parent = searchParams.get('parent') ?? '';
  const q = searchParams.get('q') ?? '';
  const zoomParam = searchParams.get('zoom');
  const defaultZoom = zoomParam ? parseInt(zoomParam, 10) : 12;

  try {
    if (type === 'geocode' && q) {
      const coord = await geocodeRegion(q, defaultZoom);
      return NextResponse.json({ data: coord });
    }
    if (type === 'provinsi') {
      const provinces = await getProvinces();
      // Tambahkan koordinat & zoom bawaan per provinsi
      const enriched = provinces.map((p) => {
        const coord = PROVINCE_COORDINATES[p.id];
        if (coord) {
          return { ...p, lat: coord.lat, lng: coord.lng, zoom: coord.zoom };
        }
        return p;
      });
      return NextResponse.json({ data: enriched });
    }
    if (type === 'kabupaten' && parent) {
      return NextResponse.json({ data: await getKabupaten(parent) });
    }
    if (type === 'kecamatan' && parent) {
      return NextResponse.json({ data: await getKecamatan(parent) });
    }
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  } catch (err) {
    console.error('[api/regions]', err);
    return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 502 });
  }
}
