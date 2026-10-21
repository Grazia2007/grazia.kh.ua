import { NextResponse, after } from 'next/server';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE } from '@/app/lib/auth';

// Створюємо клієнт Supabase для СЕРВЕРА (він має права обходити RLS)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// перевірка підписаної httponly-cookie замість пароля в заголовку
const checkAuth = async () => {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
};

// IndexNow: ключ публічний і лежить у /public/3d62fd73fb1ea0cfee248447f011a73c.txt
const INDEXNOW_KEY = '3d62fd73fb1ea0cfee248447f011a73c';
const SITE = 'https://grazia.kh.ua';
const pingIndexNow = (rows: any) => {
  const list = Array.isArray(rows) ? rows : [];
  const urls = list
    .filter((r: any) => r && r.is_published !== false && (r.slug || r.id))
    .map((r: any) => `${SITE}/proekty/${encodeURIComponent(String(r.slug || r.id))}`);
  if (urls.length === 0) return;
  after(async () => {
    try {
      await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: 'grazia.kh.ua', key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList: [...urls, SITE] })
      });
    } catch (e) {
      console.error('IndexNow ping failed', e);
    }
  });
};

// Запит до Supabase через REST API за допомогою Service Key
const fetchSupabase = async (endpoint: string, method: string, body?: any) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Помилка бази даних');
  }
  return res.json();
};

export async function POST(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Немає доступу' }, { status: 401 });
  try {
    const body = await req.json();
    const data = await fetchSupabase('portfolio_projects', 'POST', body);
    // скидаємо кеш головної - новий проєкт видно одразу
    revalidateTag('portfolio', 'max');
    pingIndexNow(data);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Немає доступу' }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();
    const data = await fetchSupabase(`portfolio_projects?id=eq.${id}`, 'PATCH', body);
    revalidateTag('portfolio', 'max');
    pingIndexNow(data);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Немає доступу' }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await fetchSupabase(`portfolio_projects?id=eq.${id}`, 'DELETE');
    revalidateTag('portfolio', 'max');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}