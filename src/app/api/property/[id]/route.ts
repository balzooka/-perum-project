import { NextRequest, NextResponse } from 'next/server';
import { getLokasiDetail, mapToProperty } from '@/lib/sikumbang';
import { MOCK_PROPERTIES } from '@/lib/mockData';

// GET /api/property/TSM0610072024T002
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const detail = await getLokasiDetail(id);
    return NextResponse.json({ source: 'sikumbang', data: mapToProperty(detail) });
  } catch (err) {
    console.error('[api/property]', err);
    const mock = MOCK_PROPERTIES.find((p) => p.id === id) ?? null;
    if (mock) {
      return NextResponse.json({ source: 'mock-fallback', data: mock });
    }
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }
}
