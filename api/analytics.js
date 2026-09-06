import { query } from '../db/index.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // GET: Obter métricas agregadas de analytics
  if (req.method === 'GET') {
    try {
      const summary = await query(`
        SELECT 
          COUNT(*) as total_events,
          COUNT(*) FILTER (WHERE event_type = 'click_whatsapp') as whatsapp_clicks,
          COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
          COUNT(*) FILTER (WHERE event_type = 'calculate_roi') as roi_calculations,
          COUNT(*) FILTER (WHERE event_type = 'submit_form') as form_submits
        FROM analytics_events;
      `);

      const recent = await query(`
        SELECT event_type, page_path, created_at, event_data 
        FROM analytics_events 
        ORDER BY created_at DESC 
        LIMIT 20;
      `);

      return res.status(200).json({
        success: true,
        summary: summary.rows[0],
        recent: recent.rows
      });
    } catch (err) {
      console.error('Vercel API Analytics GET Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST: Registrar novo evento de telemetria
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { eventType, eventData, pagePath } = body;

      if (!eventType) {
        return res.status(400).json({ success: false, error: 'eventType é obrigatório' });
      }

      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;

      await query(`
        INSERT INTO analytics_events (event_type, event_data, page_path, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5);
      `, [
        eventType,
        JSON.stringify(eventData || {}),
        pagePath || '/',
        ip,
        userAgent
      ]);

      return res.status(201).json({ success: true, message: 'Evento registrado com sucesso!' });
    } catch (err) {
      console.error('Vercel API Analytics POST Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
