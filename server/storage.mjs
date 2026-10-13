import { get, put, list, del, head } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

// Use metadata ETags for writes: download responses can use representation-specific ETags.
export async function read(path) {
  return readVersioned(path, { head, get });
}
export async function readVersioned(path, client) {
  for (let attempt = 0; attempt < 3; attempt++) {
    let before;
    try { before = await client.head(path); }
    catch (error) { if (error.constructor.name === 'BlobNotFoundError') return null; throw error; }
    const result = await client.get(path, { access: 'private', useCache: false });
    if (!result || result.statusCode !== 200) continue;
    const value = await new Response(result.stream).json();
    const after = await client.head(path);
    if (!before.etag || !after.etag) throw new Error('Storage did not return a version.');
    if (before.etag === after.etag) return { value, etag: after.etag };
  }
  throw new Error('Storage changed repeatedly while reading. Please retry.');
}
export async function write(path, value, etag) {
  return put(path, JSON.stringify(value), {
    access: 'private', addRandomSuffix: false, contentType: 'application/json',
    ...(etag ? { allowOverwrite: true, ifMatch: etag } : { allowOverwrite: false }),
  });
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
