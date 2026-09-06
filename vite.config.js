import { defineConfig } from 'vite';
import { query } from './db/index.js';

function neonApiPlugin() {
  return {
    name: 'neon-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const host = req.headers.host || 'localhost:3000';
        const url = new URL(req.url, `http://${host}`);
        const pathname = url.pathname;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        try {
          // GET /api/health
          if (pathname === '/api/health' && req.method === 'GET') {
            const dbCheck = await query('SELECT NOW() as time, version() as version;');
            res.statusCode = 200;
            return res.end(JSON.stringify({
              status: 'healthy',
              database: 'Neon PostgreSQL',
              serverTime: dbCheck.rows[0].time,
              dbVersion: dbCheck.rows[0].version
            }));
          }

          // GET /api/projects
          if (pathname === '/api/projects' && req.method === 'GET') {
            const result = await query(`
              SELECT * FROM projects 
              WHERE is_active = true 
              ORDER BY display_order ASC;
            `);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, count: result.rowCount, data: result.rows }));
          }

          // GET /api/leads
          if (pathname === '/api/leads' && req.method === 'GET') {
            const result = await query(`
              SELECT * FROM leads 
              ORDER BY created_at DESC;
            `);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, count: result.rowCount, data: result.rows }));
          }

          // POST /api/leads
          if (pathname === '/api/leads' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const data = JSON.parse(body || '{}');
                const { company, niche, phone, goal } = data;

                if (!company || !phone) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({
                    success: false,
                    error: 'Nome da empresa e WhatsApp são obrigatórios.'
                  }));
                }

                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
                const userAgent = req.headers['user-agent'] || null;

                const insertRes = await query(`
                  INSERT INTO leads (company_name, niche, phone, goal, ip_address, user_agent)
                  VALUES ($1, $2, $3, $4, $5, $6)
                  RETURNING *;
                `, [company, niche || 'Outro', phone, goal || null, ip, userAgent]);

                res.statusCode = 201;
                return res.end(JSON.stringify({
                  success: true,
                  message: 'Lead registrado com sucesso no Neon PostgreSQL!',
                  lead: insertRes.rows[0]
                }));
              } catch (err) {
                console.error('API Error /api/leads POST:', err);
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
            return;
          }

          // 404 for unknown api
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
        } catch (err) {
          console.error('API Error:', err);
          res.statusCode = 500;
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [neonApiPlugin()],
  server: {
    port: 3000,
    open: true
  }
});
