// сесія адмінки - підпис на web crypto, щоб працювало і в node, і в edge

export const SESSION_COOKIE = 'grazia_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 годин

// окремий секрет для підпису; якщо не заданий - падаємо на пароль
const getSecret = () =>
  process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';

const enc = new TextEncoder();

const hmac = async (data: string) => {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// порівняння за сталий час - не дає вгадувати байти за таймінгом
export const safeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

export const createSession = async () => {
  const exp = String(Date.now() + SESSION_TTL_MS);
  return `${exp}.${await hmac(exp)}`;
};

export const verifySession = async (value: string | undefined | null) => {
  if (!value || !getSecret()) return false;
  const dot = value.indexOf('.');
  if (dot < 1) return false;
  const exp = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!safeEqual(sig, await hmac(exp))) return false;
  const ts = Number(exp);
  return Number.isFinite(ts) && ts > Date.now();
};

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: SESSION_TTL_MS / 1000
};
