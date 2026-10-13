import { get, put, list, del } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

export async function read(path) {
  const result = await get(path, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return { value: await new Response(result.stream).json(), etag: result.blob.etag };
}
export async function write(path, value, etag) {
  return put(path, JSON.stringify(value), { access: 'private', addRandomSuffix: false, contentType: 'application/json', ...(etag ? { ifMatch: etag } : {}) });
}
export async function upload(bytes, extension, contentType) {
  const path = `media/${randomUUID()}.${extension}`;
  await put(path, bytes, { access: 'private', addRandomSuffix: false, contentType });
  return `/api/media?file=${encodeURIComponent(path)}`;
}
export async function media(path) {
  return get(path, { access: 'private' });
}
export async function listMessages(cursor) {
  const result = await list({ prefix: 'messages/', limit: 30, cursor });
  const rows = await Promise.all(result.blobs.map(blob => read(blob.pathname)));
  return { messages: rows.filter(Boolean).map(row => row.value).sort((a,b) => b.createdAt.localeCompare(a.createdAt)), cursor: result.hasMore ? result.cursor : null };
}
export async function removeMessage(id) { await del(`messages/${id}.json`); }
export async function rateLimit(key, maximum, windowMs) {
  const path = `limits/${key}.json`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await read(path);
    const now = Date.now();
    const state = current?.value?.reset > now ? current.value : { count: 0, reset: now + windowMs };
    if (state.count >= maximum) return false;
    try { await write(path, { count: state.count + 1, reset: state.reset }, current?.etag); return true; }
    catch (error) { if (!/Precondition|AlreadyExists/.test(error.constructor.name)) throw error; }
  }
  return false;
}
