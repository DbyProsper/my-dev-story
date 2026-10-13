import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { defaults, ValidationError, validateContent, validateMessage, validateUpload } from '../server/validation.mjs';
import * as blobStore from '../server/storage.mjs';
import { configured, authenticated, passwordMatches, createSession, sessionCookie, clientKey } from '../server/auth.mjs';

export function createHandler(store = blobStore) {
 return async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const query = new URL(req.url, 'http://localhost').searchParams;
  const route = req.query?.route || query.get('route') || new URL(req.url, 'http://localhost').pathname.replace(/^\/api\/?/, '');
  const send = (status, value) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); };
  try {
    if (req.method === 'GET' && route === 'content') {
      const saved = process.env.BLOB_READ_WRITE_TOKEN ? await store.read('site/content.json') : null;
      return send(200, saved?.value || defaults);
    }
    if (req.method === 'GET' && route === 'media') {
      const path = query.get('file');
      if (!/^media\/[a-f0-9-]+\.(jpg|png|webp|gif|pdf|docx)$/.test(path || '')) return send(404, { error: 'File not found.' });
      const file = await store.media(path);
      if (!file || file.statusCode !== 200) return send(404, { error: 'File not found.' });
      res.setHeader('Content-Type', file.blob.contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      if (query.has('download') || /\.(pdf|docx)$/.test(path)) res.setHeader('Content-Disposition', `attachment; filename="Prosper-Masuku-CV.${path.split('.').at(-1)}"`);
      return Readable.fromWeb(file.stream).pipe(res);
    }
    if (!configured()) return send(503, { error: 'Admin and messaging are not configured yet. Please contact me using the email link.' });
    if (!['GET','HEAD'].includes(req.method)) {
      const origin = req.headers.origin;
      const host = req.headers.host;
      if (!origin || new URL(origin).host !== host || req.headers['sec-fetch-site'] === 'cross-site') return send(403, { error: 'Request origin is not allowed.' });
      if (!req.headers['content-type']?.startsWith('application/json')) return send(415, { error: 'JSON is required.' });
    }
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    if (JSON.stringify(body).length > (route === 'upload' ? 4_100_000 : 500_000)) return send(413, { error: 'Request is too large.' });
    if (route === 'login' && req.method === 'POST') {
      if (!await store.rateLimit(clientKey(req,'login'), 8, 15 * 60_000)) return send(429, { error: 'Too many sign-in attempts. Try again in 15 minutes.' });
      if (!passwordMatches(body.password)) return send(401, { error: 'Incorrect password.' });
      res.setHeader('Set-Cookie', sessionCookie(createSession(), !!process.env.VERCEL));
      return send(200, { ok: true });
    }
    if (route === 'contact' && req.method === 'POST') {
      if (body.website) return send(400, { error: 'Unable to accept this submission.' });
      const message = validateMessage(body);
      if (!await store.rateLimit(clientKey(req,'contact'), 5, 60 * 60_000)) return send(429, { error: 'Too many messages. Please try again in an hour.' });
      const id = `${String(9999999999999 - Date.now())}-${randomUUID()}`;
      await store.write(`messages/${id}.json`, { ...message, id, createdAt: new Date().toISOString(), read: false });
      return send(201, { ok: true });
    }
    if (!authenticated(req)) return send(401, { error: 'Please sign in to continue.' });
    if (route === 'session' && req.method === 'GET') return send(200, { authenticated: true });
    if (route === 'logout' && req.method === 'POST') { res.setHeader('Set-Cookie', sessionCookie('', !!process.env.VERCEL)); return send(200, { ok: true }); }
    if (route === 'admin-content' && req.method === 'GET') {
      const saved = await store.read('site/content.json');
      return send(200, { content: saved?.value || defaults, version: saved?.etag || null });
    }
    if (route === 'admin-content' && req.method === 'PUT') {
      validateContent(body.content);
      const current = await store.read('site/content.json');
      if ((current?.etag || null) !== body.version) return send(409, { error: 'Content changed in another session. Reload before publishing.' });
      const saved = await store.write('site/content.json', body.content, current?.etag);
      return send(200, { version: saved.etag });
    }
    if (route === 'upload' && req.method === 'POST') {
      const file = validateUpload(body);
      return send(201, { url: await store.upload(file.bytes, file.extension, file.contentType) });
    }
    if (route === 'messages' && req.method === 'GET') return send(200, await store.listMessages(query.get('cursor') || undefined));
    if (route === 'messages' && ['PATCH','DELETE'].includes(req.method)) {
      if (!/^\d{13}-[a-f0-9-]{36}$/.test(body.id || '')) return send(400, { error: 'Invalid message.' });
      if (req.method === 'DELETE') await store.removeMessage(body.id);
      else {
        const current = await store.read(`messages/${body.id}.json`);
        if (!current) return send(404, { error: 'Message not found.' });
        await store.write(`messages/${body.id}.json`, { ...current.value, read: !!body.read }, current.etag);
      }
      return send(200, { ok: true });
    }
    return send(404, { error: 'Not found.' });
  } catch (error) {
    if (/Precondition|AlreadyExists/.test(error.constructor.name)) return send(409, { error: 'The record changed. Refresh and try again.' });
    if (error instanceof ValidationError || error instanceof SyntaxError) return send(400, { error: error.message });
    console.error('Portfolio service failure:', error.constructor.name);
    return send(503, { error: 'The website service is temporarily unavailable. Please try again.' });
  }
};
}
export default createHandler();
