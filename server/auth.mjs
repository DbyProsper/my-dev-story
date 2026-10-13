import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
export const cookieName = 'portfolio_admin';
export function configured() { return !!process.env.BLOB_READ_WRITE_TOKEN && process.env.ADMIN_PASSWORD?.length >= 16 && process.env.ADMIN_SESSION_SECRET?.length >= 32; }
export function digest(value) { return createHash('sha256').update(value).digest(); }
export function passwordMatches(value) { return typeof value === 'string' && timingSafeEqual(digest(value), digest(process.env.ADMIN_PASSWORD || '')); }
function sign(value) { return createHmac('sha256', `${process.env.ADMIN_SESSION_SECRET}:${process.env.ADMIN_PASSWORD}`).update(value).digest('hex'); }
export function createSession() { const expires = String(Date.now() + 8 * 60 * 60 * 1000); return `${expires}.${sign(expires)}`; }
export function authenticated(req) {
  if (!configured()) return false;
  const token = (req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) || '';
  const [expires, signature] = token.split('.');
  return /^\d+$/.test(expires) && Number(expires) > Date.now() && typeof signature === 'string' && timingSafeEqual(digest(signature), digest(sign(expires)));
}
export function sessionCookie(token, production) { return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${token ? 28800 : 0}${production ? '; Secure' : ''}`; }
export function clientKey(req, route) {
  const ip = process.env.VERCEL ? req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress : req.socket?.remoteAddress;
  return createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(`${route}:${ip || 'unknown'}`).digest('hex');
}
