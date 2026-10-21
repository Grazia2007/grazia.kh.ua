import { NextResponse } from 'next/server';

// щотижневий SEO-звіт із Google Search Console у Telegram.
// запускає Vercel Cron (vercel.json), захищено CRON_SECRET.
// потрібні env: GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY (service account), TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, CRON_SECRET
export const dynamic = 'force-dynamic';

const SITE = 'sc-domain:grazia.kh.ua';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

const b64url = (data: ArrayBuffer | string) => {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// токен доступу service account: JWT RS256 -> oauth2
async function getAccessToken(email: string, pem: string) {
  const der = Uint8Array.from(
    atob(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')),
    c => c.charCodeAt(0)
  );
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(JSON.stringify({
    iss: email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600
  }))}`;
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${b64url(sig)}` })
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(`Google auth: ${data.error_description || data.error || res.status}`);
  return data.access_token as string;
}

const day = (offset: number) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);

type Row = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };

async function query(token: string, startDate: string, endDate: string, dimensions: string[] = [], rowLimit = 10): Promise<Row[]> {
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate, endDate, dimensions, rowLimit })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Search Console: ${data.error?.message || res.status}`);
  return data.rows || [];
}

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const diff = (now: number, prev: number) => {
  if (!prev) return now ? ' (нове)' : '';
  const pct = Math.round(((now - prev) / prev) * 100);
  return ` (${pct >= 0 ? '+' : ''}${pct}%)`;
};

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Немає доступу' }, { status: 401 });
  }
  const email = process.env.GSC_CLIENT_EMAIL;
  const pem = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!email || !pem || !botToken || !chatId) {
    return NextResponse.json({ error: 'Не налаштовані змінні GSC_* або TELEGRAM_*' }, { status: 500 });
  }

  try {
    const token = await getAccessToken(email, pem);
    // дані Search Console запізнюються на 2-3 дні: беремо тиждень, що закінчився 3 дні тому
    const [cur, prev, queries, pages] = await Promise.all([
      query(token, day(9), day(3)),
      query(token, day(16), day(10)),
      query(token, day(9), day(3), ['query'], 10),
      query(token, day(9), day(3), ['page'], 5)
    ]);
    const c = cur[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    const p = prev[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

    const lines = [
      `📈 <b>SEO-звіт grazia.kh.ua</b>`,
      `<i>${day(9)} — ${day(3)}</i>`,
      '',
      `👆 Кліки: <b>${c.clicks}</b>${diff(c.clicks, p.clicks)}`,
      `👀 Покази: <b>${c.impressions}</b>${diff(c.impressions, p.impressions)}`,
      `🎯 CTR: <b>${(c.ctr * 100).toFixed(1)}%</b>`,
      `📍 Сер. позиція: <b>${c.position ? c.position.toFixed(1) : '—'}</b>`,
      '',
      `<b>Топ запитів:</b>`,
      ...(queries.length ? queries.map((r, i) => `${i + 1}. ${esc(r.keys?.[0] || '')} — ${r.clicks} кл. / ${r.impressions} пок., поз. ${r.position.toFixed(1)}`) : ['поки немає даних']),
      '',
      `<b>Топ сторінок:</b>`,
      ...(pages.length ? pages.map((r, i) => `${i + 1}. ${esc((r.keys?.[0] || '').replace('https://grazia.kh.ua', '') || '/')} — ${r.clicks} кл.`) : ['поки немає даних'])
    ];

    const tg = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: lines.join('\n'), parse_mode: 'HTML', disable_web_page_preview: true })
    });
    if (!tg.ok) throw new Error('Telegram не прийняв повідомлення');
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('SEO report failed', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
