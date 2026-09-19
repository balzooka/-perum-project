import { NextRequest, NextResponse } from 'next/server';
import { crawlNextBatch } from '@/lib/crawler';
import { SUPABASE_CONFIGURED } from '@/lib/supabaseAdmin';

// GET /api/crawl — dipanggil Vercel Cron harian.
// Vercel otomatis kirim header: Authorization: Bearer $CRON_SECRET
export async function GET(req: NextRequest) {
  if (!SUPABASE_CONFIGURED()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const expected = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization') ?? '';
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await crawlNextBatch(20);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[api/crawl]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
