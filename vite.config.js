import { defineConfig } from 'vite';
import { resolve } from 'path';
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
                const { company, niche, phone, goal, email, estimated_budget, source } = data;

                if (!company || !phone) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({
                    success: false,
                    error: 'Nome da empresa e WhatsApp são obrigatórios.'
                  }));
                }

                const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
                const userAgent = req.headers['user-agent'] || null;

                const insertRes = await query(`
                  INSERT INTO leads (company_name, niche, phone, goal, email, estimated_budget, source, ip_address, user_agent)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                  RETURNING *;
                `, [company, niche || 'Outro', phone, goal || null, email || null, estimated_budget || null, source || 'form_contato', ip, userAgent]);

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

          // GET /api/simulations
          if (pathname === '/api/simulations' && req.method === 'GET') {
            const result = await query('SELECT * FROM roi_simulations ORDER BY created_at DESC LIMIT 50;');
            const stats = await query(`
              SELECT 
                COUNT(*) as total_simulations,
                COALESCE(AVG(projected_monthly), 0) as avg_projected_monthly,
                COALESCE(MAX(projected_monthly), 0) as max_projected_monthly
              FROM roi_simulations;
            `);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, count: result.rowCount, stats: stats.rows[0], data: result.rows }));
          }

          // POST /api/simulations
          if (pathname === '/api/simulations' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const data = JSON.parse(body || '{}');
                const { niche, clients, ticket, monthly, annual, paybackDays } = data;
                const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;

                const insertRes = await query(`
                  INSERT INTO roi_simulations (niche, clients_per_month, average_ticket, projected_monthly, projected_annual, payback_days, ip_address)
                  VALUES ($1, $2, $3, $4, $5, $6, $7)
                  RETURNING *;
                `, [niche || 'Outro', clients || 0, ticket || 0, monthly || 0, annual || 0, paybackDays || '30 dias', ip]);

                res.statusCode = 201;
                return res.end(JSON.stringify({ success: true, simulation: insertRes.rows[0] }));
              } catch (err) {
                console.error('API Error /api/simulations POST:', err);
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
            return;
          }

          // GET /api/analytics
          if (pathname === '/api/analytics' && req.method === 'GET') {
            const summary = await query(`
              SELECT 
                COUNT(*) as total_events,
                COUNT(*) FILTER (WHERE event_type = 'click_whatsapp') as whatsapp_clicks,
                COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
                COUNT(*) FILTER (WHERE event_type = 'calculate_roi') as roi_calculations
              FROM analytics_events;
            `);
            const recent = await query(`
              SELECT event_type, page_path, created_at, event_data 
              FROM analytics_events 
              ORDER BY created_at DESC 
              LIMIT 20;
            `);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, summary: summary.rows[0], recent: recent.rows }));
          }

          // POST /api/analytics
          if (pathname === '/api/analytics' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const data = JSON.parse(body || '{}');
                const { eventType, eventData, pagePath } = data;
                const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
                const userAgent = req.headers['user-agent'] || null;

                await query(`
                  INSERT INTO analytics_events (event_type, event_data, page_path, ip_address, user_agent)
                  VALUES ($1, $2, $3, $4, $5);
                `, [eventType || 'unknown', JSON.stringify(eventData || {}), pagePath || '/', ip, userAgent]);

                res.statusCode = 201;
                return res.end(JSON.stringify({ success: true }));
              } catch (err) {
                console.error('API Error /api/analytics POST:', err);
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
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin-leads.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
