import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function gasDevProxy(gasUrl: string): Plugin {
  return {
    name: 'gas-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/gas', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ success: false, message: 'Method not allowed' }));
          return;
        }
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const response = await fetch(gasUrl, {
              method: 'POST',
              redirect: 'follow',
              headers: { 'Content-Type': 'application/json' },
              body
            });
            const text = await response.text();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(text);
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, message: String(err) }));
          }
        });
      });

      server.middlewares.use('/api/branding', async (_req, res) => {
        try {
          const joiner = gasUrl.includes('?') ? '&' : '?';
          const response = await fetch(gasUrl + joiner + 'action=branding', { redirect: 'follow' });
          const text = await response.text();
          res.setHeader('Content-Type', 'application/json');
          res.end(text);
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, message: String(err) }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gasUrl = env.VITE_GAS_API_URL || '';
  const plugins: Plugin[] = [...react()];
  if (gasUrl) plugins.push(gasDevProxy(gasUrl));

  return { plugins };
});