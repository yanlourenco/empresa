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

          // GET /api/projects (ativos ou todos)
          if (pathname === '/api/projects' && req.method === 'GET') {
            const showAll = url.searchParams.get('all') === 'true';
            const sql = showAll 
              ? 'SELECT * FROM projects ORDER BY display_order ASC, created_at DESC;' 
              : 'SELECT * FROM projects WHERE is_active = true ORDER BY display_order ASC;';
            const result = await query(sql);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, count: result.rowCount, data: result.rows }));
          }

          // POST /api/projects (criar ou atualizar)
          if (pathname === '/api/projects' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const data = JSON.parse(body || '{}');
                const { id, title, client_name, client_role, niche, primary_color, live_url, full_mockup_url, results_metric, feedback, description, is_active } = data;

                if (!title || !client_name) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ success: false, error: 'Título e Nome do Cliente são obrigatórios.' }));
                }

                const projId = id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const initials = client_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                const color = primary_color || '#2563EB';
                const media = full_mockup_url || '/projects/dovena-medical.jpg';

                const defaultDemoHtml = `
                  <div class="live-mockup-wrapper">
                    <div class="live-mockup-top-banner" style="border-left-color: ${color};">
                      <div class="live-mockup-meta">
                        <span class="live-status-badge" style="background: ${color}26; color: ${color}; border-color: ${color}4d;">PROJETO AO VIVO ENTREGUE</span>
                        <h3 class="live-mockup-title">${title}</h3>
                        <p class="live-mockup-sub">Interface oficial desenvolvida pela LocalWeb Pro.</p>
                      </div>
                      <div class="live-mockup-actions">
                        <a href="${media}" target="_blank" rel="noopener noreferrer" class="btn-view-fullscreen"><span>Ver Imagem Completa</span></a>
                        <a href="${live_url || '#'}" target="_blank" rel="noopener noreferrer" class="btn-live-contact" style="background: ${color};"><span>Visitar Site Oficial</span></a>
                      </div>
                    </div>
                    <div class="live-mockup-viewport-scroll">
                      <img src="${media}" alt="${title}" class="live-mockup-full-image" loading="lazy" />
                    </div>
                  </div>
                `;

                const insertRes = await query(`
                  INSERT INTO projects (
                    id, title, client_name, client_role, avatar_initials, niche,
                    primary_color, bg_tint, bg_section, bg_section_light, bg_tint_light,
                    media_type, media_url, full_mockup_url, live_url, delivery_time,
                    results_metric, description, feedback, rating, tags, stats, demo_html,
                    display_order, is_active, updated_at
                  ) VALUES (
                    $1, $2, $3, $4, $5, $6,
                    $7, $8, $9, $10, $11,
                    'image', $12, $13, $14, '5 Dias Úteis',
                    $15, $16, $17, 5, '[]'::jsonb, '[]'::jsonb, $18,
                    (SELECT COALESCE(MAX(display_order), 0) + 1 FROM projects), $19, CURRENT_TIMESTAMP
                  )
                  ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    client_name = EXCLUDED.client_name,
                    client_role = EXCLUDED.client_role,
                    avatar_initials = EXCLUDED.avatar_initials,
                    niche = EXCLUDED.niche,
                    primary_color = EXCLUDED.primary_color,
                    media_url = EXCLUDED.media_url,
                    full_mockup_url = EXCLUDED.full_mockup_url,
                    live_url = EXCLUDED.live_url,
                    results_metric = EXCLUDED.results_metric,
                    description = EXCLUDED.description,
                    feedback = EXCLUDED.feedback,
                    demo_html = EXCLUDED.demo_html,
                    is_active = EXCLUDED.is_active,
                    updated_at = CURRENT_TIMESTAMP
                  RETURNING *;
                `, [
                  projId, title, client_name, client_role || 'Proprietário', initials, niche || 'Geral',
                  color, `${color}33`, '#090E17', '#F1F5F9', `${color}1a`,
                  media, media, live_url || 'https://localwebpro.com.br',
                  results_metric || '+200% Conversões', description || 'Site corporativo de alta performance.',
                  feedback || 'Excelente trabalho e retorno garantido.', defaultDemoHtml, is_active !== undefined ? Boolean(is_active) : true
                ]);

                res.statusCode = 201;
                return res.end(JSON.stringify({ success: true, message: 'Projeto salvo no Neon DB!', project: insertRes.rows[0] }));
              } catch (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
            return;
          }

          // DELETE /api/projects
          if (pathname === '/api/projects' && req.method === 'DELETE') {
            const queryId = url.searchParams.get('id');
            if (!queryId) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'ID do projeto obrigatório.' }));
            }
            await query('DELETE FROM projects WHERE id = $1;', [queryId]);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, message: 'Projeto removido com sucesso!' }));
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

          // PATCH /api/leads (atualizar status / anotações)
          if (pathname === '/api/leads' && (req.method === 'PATCH' || req.method === 'PUT')) {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const data = JSON.parse(body || '{}');
                const { id, status, notes } = data;
                if (!id) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ success: false, error: 'ID do lead é obrigatório.' }));
                }
                const updateRes = await query(`
                  UPDATE leads 
                  SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
                  WHERE id = $3 RETURNING *;
                `, [status || null, notes !== undefined ? notes : null, id]);
                res.statusCode = 200;
                return res.end(JSON.stringify({ success: true, lead: updateRes.rows[0] }));
              } catch (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
            return;
          }

          // DELETE /api/leads
          if (pathname === '/api/leads' && req.method === 'DELETE') {
            const queryId = url.searchParams.get('id');
            if (!queryId) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'ID do lead obrigatório.' }));
            }
            await query('DELETE FROM leads WHERE id = $1;', [queryId]);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true }));
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
