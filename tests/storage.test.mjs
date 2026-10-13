import test from 'node:test';
import assert from 'node:assert/strict';
import { readVersioned } from '../server/storage.mjs';
const download = value => ({ statusCode: 200, blob: { etag: 'download-representation' }, stream: new Response(JSON.stringify(value)).body });
test('read uses the canonical storage version, not the download representation ETag', async () => {
  const result = await readVersioned('site/content.json', {
    head: async () => ({ etag: 'canonical-v1' }),
    get: async (_path, options) => { assert.equal(options.useCache, false); return download({ title: 'Published' }); },
  });
  assert.deepEqual(result, { value: { title: 'Published' }, etag: 'canonical-v1' });
});
test('read retries if a publish happens while downloading content', async () => {
  const versions = ['v1', 'v2', 'v2', 'v2']; let downloads = 0;
  const result = await readVersioned('site/content.json', {
    head: async () => ({ etag: versions.shift() }),
    get: async () => download({ title: ++downloads === 1 ? 'Old' : 'New' }),
  });
  assert.deepEqual(result, { value: { title: 'New' }, etag: 'v2' });
  assert.equal(downloads, 2);
});
test('missing records are distinguished from storage failure', async () => {
  class BlobNotFoundError extends Error {}
  assert.equal(await readVersioned('missing', { head: async () => { throw new BlobNotFoundError(); } }), null);
  await assert.rejects(readVersioned('broken', { head: async () => { throw new Error('Network failed'); } }), /Network failed/);
});
