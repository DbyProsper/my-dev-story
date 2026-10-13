// Test adapter only; production imports Vercel Blob directly.
export function memoryStore() {
  const records = new Map();
  let revision = 0;
  return {
    async read(path) { return records.get(path) || null; },
    async write(path,value,etag) {
      const previous=records.get(path);
      if (previous && previous.etag !== etag) throw new Error('Conflicting version');
      const next={ value:structuredClone(value), etag:String(++revision) };
      records.set(path,next); return next;
    },
    async rateLimit() { return true; },
    async listMessages() { return {messages:[...records].filter(([key])=>key.startsWith('messages/')).map(([,row])=>row.value),cursor:null}; },
    async removeMessage(id) { records.delete(`messages/${id}.json`); },
    async upload() { return '/api/media?file=media%2F00000000-0000-0000-0000-000000000000.pdf'; },
  };
}
