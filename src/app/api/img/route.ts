import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOST = 'sikumbang.tapera.go.id';
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

// GET /api/img?u=<encoded-url>
// Image proxy: server sikumbang blokir hotlinking (cek Referer/UA), jadi foto
// harus diambil server-side terus di-stream ke browser dengan header benar.
export async function GET(req: NextRequest) {
  const u = new URL(req.url).searchParams.get('u');
  if (!u) return new NextResponse('Missing u', { status: 400 });

  let target: URL;
  try {
    target = new URL(u);
  } catch {
    return new NextResponse('Invalid URL', { status: 400 });
  }
  if (target.hostname !== ALLOWED_HOST) {
    return new NextResponse('Host not allowed', { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        'User-Agent': BROWSER_UA,
        Referer: `https://${ALLOWED_HOST}/`,
        Accept: 'image/*',
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!upstream.ok || !upstream.body) {
      return new NextResponse('Upstream error', { status: 502 });
    }
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return new NextResponse('Fetch failed', { status: 502 });
  }
}
