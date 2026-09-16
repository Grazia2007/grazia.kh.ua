import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, sessionCookieOptions } from '@/app/lib/auth';

export async function POST() {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  return NextResponse.json({ ok: true });
}
