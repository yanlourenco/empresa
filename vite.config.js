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

                const createdLead = insertRes.rows[0];

                // Notificação Webhook (Discord/Telegram)
                try {
                  const webhookRow = await query("SELECT value FROM site_settings WHERE key = 'notification_webhook';");
                  const webhookUrl = webhookRow.rows[0]?.value;
                  if (webhookUrl && webhookUrl.startsWith('http')) {
                    const cleanPhone = (createdLead.phone || '').replace(/\D/g, '');
                    const waLink = `https://wa.me/55${cleanPhone}`;

                    if (webhookUrl.includes('discord.com')) {
                      fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          embeds: [{
                            title: '🚀 Novo Lead Captado no Site!',
                            color: 0x2563EB,
                            fields: [
                              { name: 'Empresa', value: createdLead.company_name || 'Não informado', inline: true },
                              { name: 'Nicho', value: createdLead.niche || 'Geral', inline: true },
                              { name: 'WhatsApp', value: `[${createdLead.phone}](${waLink})`, inline: false },
                              { name: 'Objetivo', value: createdLead.goal || 'Site institucional', inline: false }
                            ],
                            footer: { text: 'LocalWeb Pro • Neon Cloud' },
                            timestamp: new Date().toISOString()
                          }]
                        })
                      }).catch(() => {});
                    } else {
                      fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ event: 'new_lead', lead: createdLead, whatsapp_link: waLink })
                      }).catch(() => {});
                    }
                  }
                } catch (_) {}

                res.statusCode = 201;
                return res.end(JSON.stringify({
                  success: true,
                  message: 'Lead registrado com sucesso no Neon PostgreSQL!',
                  lead: createdLead
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

          // GET /api/settings
          if (pathname === '/api/settings' && req.method === 'GET') {
            const authHeader = req.headers['authorization'] || '';
            const rows = await query('SELECT key, value, description FROM site_settings;');
            const settingsMap = {};
            rows.rows.forEach(r => { settingsMap[r.key] = r.value; });

            if (authHeader.startsWith('Bearer ')) {
              const pin = authHeader.replace('Bearer ', '').trim();
              const savedPin = settingsMap['admin_pin'] || 'admin123';
              if (pin === savedPin) {
                res.statusCode = 200;
                return res.end(JSON.stringify({ success: true, authenticated: true, settings: settingsMap }));
              }
            }

            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              authenticated: false,
              settings: {
                whatsapp_number: settingsMap['whatsapp_number'] || '5511999999999',
                company_name: settingsMap['company_name'] || 'LocalWeb Pro',
                contact_email: settingsMap['contact_email'] || 'contato@localwebpro.com.br'
              }
            }));
          }

          // POST /api/settings
          if (pathname === '/api/settings' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const data = JSON.parse(body || '{}');
                const { pin, whatsapp_number, new_pin, notification_webhook, contact_email } = data;

                const pinRow = await query("SELECT value FROM site_settings WHERE key = 'admin_pin';");
                const currentPin = pinRow.rows[0]?.value || 'admin123';

                if (pin !== currentPin) {
                  res.statusCode = 401;
                  return res.end(JSON.stringify({ success: false, error: 'PIN de administrador incorreto.' }));
                }

                if (whatsapp_number !== undefined) {
                  const cleanNumber = String(whatsapp_number).replace(/\D/g, '');
                  await query(`
                    INSERT INTO site_settings (key, value, description, updated_at)
                    VALUES ('whatsapp_number', $1, 'Número do WhatsApp para conversão de leads', CURRENT_TIMESTAMP)
                    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;
                  `, [cleanNumber]);
                }

                if (contact_email !== undefined) {
                  await query(`
                    INSERT INTO site_settings (key, value, description, updated_at)
                    VALUES ('contact_email', $1, 'E-mail corporativo', CURRENT_TIMESTAMP)
                    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;
                  `, [contact_email]);
                }

                if (notification_webhook !== undefined) {
                  await query(`
                    INSERT INTO site_settings (key, value, description, updated_at)
                    VALUES ('notification_webhook', $1, 'URL de Webhook (Discord/Telegram) para notificações de lead', CURRENT_TIMESTAMP)
                    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;
                  `, [notification_webhook.trim()]);
                }

                if (new_pin && new_pin.trim().length >= 4) {
                  await query(`
                    INSERT INTO site_settings (key, value, description, updated_at)
                    VALUES ('admin_pin', $1, 'PIN de segurança do painel administrativo', CURRENT_TIMESTAMP)
                    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;
                  `, [new_pin.trim()]);
                }

                res.statusCode = 200;
                return res.end(JSON.stringify({ success: true, message: 'Configurações atualizadas com sucesso no Neon PostgreSQL!' }));
              } catch (err) {
                console.error('API Error /api/settings POST:', err);
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
