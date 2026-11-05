import test from 'node:test';
import assert from 'node:assert/strict';
import { storageConfigured } from '../server/storage.mjs';
import { createHandler } from '../api/index.mjs';
test('Supabase selection does not fall back to old Blob credentials', async () => {
  const keys=['STORAGE_PROVIDER','SUPABASE_URL','SUPABASE_SECRET_KEY','BLOB_READ_WRITE_TOKEN'];
  const before=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
  try {
    process.env.STORAGE_PROVIDER='supabase';process.env.BLOB_READ_WRITE_TOKEN='old-token';
    delete process.env.SUPABASE_URL;delete process.env.SUPABASE_SECRET_KEY;
    assert.equal(storageConfigured(),false);
    process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SECRET_KEY='test-only';
    assert.equal(storageConfigured(),true);
    const handler=createHandler({read:async()=>null});
    const res={setHeader(){},end(body){this.body=JSON.parse(body);}};
    await handler({url:'/api/content',method:'GET',headers:{}},res);
    assert.equal(res.statusCode,503);
    assert.match(res.body.error,/not been migrated/);
  } finally { for(const key of keys) { if(before[key]===undefined)delete process.env[key];else process.env[key]=before[key]; } }
});
