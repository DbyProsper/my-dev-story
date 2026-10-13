import { createServer } from 'vite';
import { existsSync } from 'node:fs';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const { default: handler } = await import('../api/index.mjs');
const server = await createServer({
  plugins: [{
    name: 'portfolio-local-api',
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();
        try {
          let body = '';
          for await (const chunk of req) {
            body += chunk;
            if (body.length > 4_100_000) { res.statusCode=413; res.end('Request too large'); return; }
          }
          req.body = body ? JSON.parse(body) : {};
          await handler(req, res);
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type','application/json');
          res.end(JSON.stringify({error:'Invalid request.'}));
        }
      });
    },
  }],
});
await server.listen();
server.printUrls();
