import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_SALT = 'nilein-admin-session-v1';
export const SESSION_COOKIE = 'nilein_admin';

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

export function createSessionToken(password: string): string {
  return createHmac('sha256', password).update(SESSION_SALT).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyPassword(candidate: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !candidate) return false;
  return safeEqual(candidate, password);
}

export function isAuthenticated(cookieHeader: string | undefined): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const cookies = parseCookies(cookieHeader);
  const token = cookies[SESSION_COOKIE];
  if (!token) return false;
  return safeEqual(token, createSessionToken(password));
}

export function sessionCookieHeader(password: string): string {
  const token = createSessionToken(password);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000${secure}`;
}

export function clearCookieHeader(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}
