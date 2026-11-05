import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { list, get } from '@vercel/blob';
import { validateContent } from '../server/validation.mjs';
if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const [mode, directory] = process.argv.slice(2);
if (!['export','import'].includes(mode) || !directory) throw new Error('Usage: node scripts/migrate-storage.mjs export|import <private-backup-folder>');
const root = resolve(directory);
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function local(path) {
  if (!/^(site\/content\.json|messages\/[\w-]+\.json|media\/[\w.-]+)$/.test(path)) throw new Error('Unexpected backup path');
  const target=resolve(root,path);
  if (!target.startsWith(root+sep)) throw new Error('Backup path escaped folder');
  return target;
}
if (mode === 'export') {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Set the original BLOB_READ_WRITE_TOKEN privately in .env.local.');
  if (existsSync(root)) throw new Error('Use a new backup folder; existing backups are never overwritten.');
  await mkdir(root,{recursive:true});
  const manifest = { format:1, files:[] };
  let cursor;
  do {
    const page=await list({cursor,limit:1000});
    for (const item of page.blobs) {
      if (!/^(site\/content\.json|messages\/|media\/)/.test(item.pathname)) continue;
      const object=await get(item.pathname,{access:'private',useCache:false});
      if (!object || object.statusCode!==200) throw new Error('Unable to export a stored file. Export incomplete.');
      const bytes=Buffer.from(await new Response(object.stream).arrayBuffer());
      const target=local(item.pathname); await mkdir(dirname(target),{recursive:true}); await writeFile(target,bytes,{flag:'wx'});
      manifest.files.push({path:item.pathname,sha256:hash(bytes),contentType:object.blob.contentType});
    }
    cursor=page.hasMore?page.cursor:undefined;
  } while(cursor);
  const contentFile=manifest.files.find(f=>f.path==='site/content.json');
  if (!contentFile) throw new Error('Published content is missing. Do not migrate defaults.');
  const current=await get('site/content.json',{access:'private',useCache:false});
  if (!current || hash(Buffer.from(await new Response(current.stream).arrayBuffer()))!==contentFile.sha256) throw new Error('Content changed during export. Pause editing and export again to a new folder.');
  await writeFile(resolve(root,'manifest.json'),JSON.stringify(manifest,null,2),{flag:'wx'});
  console.log(`Export complete: ${manifest.files.length} files. Original store unchanged. Keep this backup private.`);
} else {
  const manifest=JSON.parse(await readFile(resolve(root,'manifest.json'),'utf8'));
  if (manifest.format!==1 || !Array.isArray(manifest.files)) throw new Error('Unsupported backup');
  const files=new Map();
  for (const file of manifest.files) {
    if (files.has(file.path)) throw new Error('Duplicate backup entry');
    const bytes=await readFile(local(file.path));
    if (hash(bytes)!==file.sha256) throw new Error('Backup checksum mismatch');
    files.set(file.path,{...file,bytes});
  }
  const published=files.get('site/content.json');
  if (!published) throw new Error('Published content is missing');
  const content=JSON.parse(published.bytes); validateContent(content);
  function checkReferences(value) {
    if (typeof value==='string' && value.startsWith('/api/media?')) {
      const path=new URL(value,'https://portfolio.invalid').searchParams.get('file');
      if (!files.has(path)) throw new Error('An image or CV referenced by content is missing from the backup');
    } else if (value && typeof value==='object') Object.values(value).forEach(checkReferences);
  }
  checkReferences(content);
  const target=await import('../server/supabase-storage.mjs');
  // Copy media first; never publish references until their bytes are verified.
  for (const file of files.values()) {
    if (!file.path.startsWith('media/')) continue;
    const existing=await target.media(file.path);
    if (!existing) {
      const {error}=await target.client().storage.from(target.bucket()).upload(file.path,file.bytes,{contentType:file.contentType,upsert:false});
      if (error) throw error;
    }
    const copied=await target.media(file.path);
    if (!copied || hash(Buffer.from(await new Response(copied.stream).arrayBuffer()))!==file.sha256) throw new Error('Destination media verification failed; no overwrite performed.');
  }
  const records=[...files.values()].filter(f=>!f.path.startsWith('media/')).sort((a,b)=>Number(a.path==='site/content.json')-Number(b.path==='site/content.json'));
  for (const file of records) {
    const value=JSON.parse(file.bytes); const existing=await target.read(file.path);
    if (existing && JSON.stringify(canonical(existing.value))!==JSON.stringify(canonical(value))) throw new Error('Destination record differs. Refusing to overwrite it.');
    if (!existing) await target.write(file.path,value,null);
    const copied=await target.read(file.path);
    // JSONB can reorder keys; compare canonical JSON recursively.
    if (JSON.stringify(canonical(copied?.value))!==JSON.stringify(canonical(value))) throw new Error('Destination record verification failed');
  }
  console.log('Import verified. No source data deleted. Production configuration has NOT been changed.');
}
