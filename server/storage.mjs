import * as blob from './blob-storage.mjs';
import * as supabase from './supabase-storage.mjs';
export { readVersioned } from './blob-storage.mjs';
export function storageConfigured() {
  if (process.env.STORAGE_PROVIDER !== 'blob') return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SECRET_KEY;
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}
const provider = () => process.env.STORAGE_PROVIDER !== 'blob' ? supabase : blob;
export const read = (...args) => provider().read(...args);
export const write = (...args) => provider().write(...args);
export const upload = (...args) => provider().upload(...args);
export const media = (...args) => provider().media(...args);
export const listMessages = (...args) => provider().listMessages(...args);
export const removeMessage = (...args) => provider().removeMessage(...args);
export const rateLimit = (...args) => provider().rateLimit(...args);
