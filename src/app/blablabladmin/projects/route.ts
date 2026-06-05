import { NextResponse } from 'next/server';

// Створюємо клієнт Supabase для СЕРВЕРА (він має права обходити RLS)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

// Допоміжна функція для перевірки пароля
const checkAuth = (req: Request) => {
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${ADMIN_PASSWORD}`;
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
  if (!checkAuth(req)) return NextResponse.json({ error: 'Немає доступу' }, { status: 401 });
  try {
    const body = await req.json();
    const data = await fetchSupabase('portfolio_projects', 'POST', body);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Немає доступу' }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();
    const data = await fetchSupabase(`portfolio_projects?id=eq.${id}`, 'PATCH', body);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Немає доступу' }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await fetchSupabase(`portfolio_projects?id=eq.${id}`, 'DELETE');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}