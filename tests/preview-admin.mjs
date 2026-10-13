// Isolated UI verification server. This never connects to real storage.
import { createServer } from 'vite';
import { createHandler } from '../api/index.mjs';
import { memoryStore } from './memory-store.mjs';
if (process.env.VERCEL) throw new Error('The test preview must not run on Vercel.');
process.env.ADMIN_PASSWORD='local-ui-test-only-123456';
process.env.ADMIN_SESSION_SECRET='local-ui-test-only-secret-1234567890';
process.env.BLOB_READ_WRITE_TOKEN='test-adapter-no-real-storage';
const handler=createHandler(memoryStore());
const server=await createServer({server:{host:'127.0.0.1',port:8081,strictPort:true},plugins:[{name:'test-api',configureServer(vite){vite.middlewares.use(async(req,res,next)=>{
  if(!req.url?.startsWith('/api/'))return next();
  let raw=''; for await(const part of req){raw+=part;if(raw.length>4_100_000){res.statusCode=413;res.end();return;}}
  try{req.body=raw?JSON.parse(raw):{};await handler(req,res);}catch{res.statusCode=400;res.end('{}');}
});}}]});
await server.listen();
console.log('TEST ONLY: http://127.0.0.1:8081/admin — all content and messages disappear on shutdown.');
