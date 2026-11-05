import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
export class StoragePreconditionError extends Error {}
let cached;
export function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Supabase server credentials are missing.');
  if (!cached || cached.url !== url || cached.key !== key) cached = { url, key, value: createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) };
  return cached.value;
}
export const bucket = () => process.env.SUPABASE_MEDIA_BUCKET || 'portfolio-media';
function check(error) {
  if (!error) return;
  if (error.code === 'PT409' || error.code === '40001' || error.code === '23505') throw new StoragePreconditionError('The record changed. Reload before publishing.');
  throw error;
}
export async function read(path) {
  const { data, error } = await client().from('portfolio_records').select('value,version').eq('path',path).maybeSingle();
  check(error);
  return data ? { value:data.value, etag:data.version } : null;
}
export async function write(path,value,etag) {
  const { data, error } = await client().rpc('portfolio_write', { p_path:path, p_value:value, p_version:etag || null });
  check(error); return { etag:data };
}
export async function upload(bytes,extension,contentType) {
  const path = `media/${randomUUID()}.${extension}`;
  const { error } = await client().storage.from(bucket()).upload(path,bytes,{ contentType, upsert:false });
  check(error); return `/api/media?file=${encodeURIComponent(path)}`;
}
export async function media(path) {
  const { data,error } = await client().storage.from(bucket()).download(path);
  if (error && (String(error.statusCode) === '404' || ['not_found','NoSuchKey'].includes(error.code))) return null;
  check(error);
  return { statusCode:200, stream:data.stream(), blob:{contentType:data.type || 'application/octet-stream'} };
}
export async function listMessages(cursor) {
  let query = client().from('portfolio_records').select('path,value').like('path','messages/%').order('path').limit(31);
  if (cursor) {
    if (!/^messages\/\d{13}-[a-f0-9-]{36}\.json$/.test(cursor)) throw new Error('Invalid inbox cursor.');
    query = query.gt('path',cursor);
  }
  const {data,error} = await query; check(error);
  const rows = data.slice(0,30);
  return {messages:rows.map(row=>row.value),cursor:data.length>30 ? rows.at(-1).path : null};
}
export async function removeMessage(id) {
  const {error} = await client().from('portfolio_records').delete().eq('path',`messages/${id}.json`); check(error);
}
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
