import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSession, verifySession, safeEqual, SESSION_COOKIE, sessionCookieOptions } from '@/app/lib/auth';

// обмеження спроб у памʼяті процесу - підіймає вартість перебору,
// але на serverless інстансів кілька, тож це не абсолютний захист
const ATTEMPT_LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

const tooManyAttempts = (ip: string) => {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > ATTEMPT_LIMIT;
};

// перевірка наявної сесії - адмінка питає при відкритті
export async function GET() {
  const store = await cookies();
  const ok = await verifySession(store.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ authenticated: ok }, { status: ok ? 200 : 401 });
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (tooManyAttempts(ip)) {
    return NextResponse.json(
      { error: 'Забагато спроб. Спробуйте за 15 хвилин.' },
      { status: 429 }
    );
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: 'Доступ не налаштовано' }, { status: 500 });
  }

  let password = '';
  try {
    password = (await req.json())?.password ?? '';
  } catch {
    return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 });
  }

  if (typeof password !== 'string' || !safeEqual(password, expected)) {
    return NextResponse.json({ error: 'Невірний ключ доступу' }, { status: 401 });
  }

  attempts.delete(ip);
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSession(), sessionCookieOptions);
  return NextResponse.json({ ok: true });
}
