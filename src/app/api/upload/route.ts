import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE } from '@/app/lib/auth';

// видача одноразового посилання на завантаження фото в supabase storage.
// service key лишається на сервері; файл іде з браузера напряму в storage,
// тож ліміт vercel на розмір запиту не заважає.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET_NAME = 'grazia-media';
const ALLOWED_EXT = new Set(['webp', 'jpg', 'jpeg', 'png', 'avif']);

export async function POST(req: Request) {
  const store = await cookies();
  if (!(await verifySession(store.get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Немає доступу' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const ext = String(body?.ext || '').toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: 'Недозволений тип файлу' }, { status: 400 });
  }

  const fileName = `portfolio_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;

  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET_NAME}/${fileName}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.url) {
      return NextResponse.json({ error: data?.message || 'Сховище не видало посилання' }, { status: 502 });
    }
    return NextResponse.json({
      uploadUrl: `${SUPABASE_URL}/storage/v1${data.url}`,
      publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`
    });
  } catch {
    return NextResponse.json({ error: 'Сховище недоступне' }, { status: 502 });
  }
}
