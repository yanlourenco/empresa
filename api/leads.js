import { query } from '../db/index.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // GET: Listar leads
  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM leads ORDER BY created_at DESC;');
      return res.status(200).json({
        success: true,
        count: result.rowCount,
        data: result.rows
      });
    } catch (err) {
      console.error('Vercel API Leads GET Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST: Cadastrar novo lead
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { company, niche, phone, goal, email, estimated_budget, source } = body;

      if (!company || !phone) {
        return res.status(400).json({
          success: false,
          error: 'Nome da empresa e WhatsApp são obrigatórios.'
        });
      }

      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;

      const insertRes = await query(`
        INSERT INTO leads (company_name, niche, phone, goal, email, estimated_budget, source, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `, [company, niche || 'Outro', phone, goal || null, email || null, estimated_budget || null, source || 'form_contato', ip, userAgent]);

      const createdLead = insertRes.rows[0];

      // Disparar notificação em segundo plano (não bloqueia resposta)
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
            }).catch(e => console.warn('Discord webhook warning:', e.message));
          } else {
            fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ event: 'new_lead', lead: createdLead, whatsapp_link: waLink })
            }).catch(e => console.warn('Generic webhook warning:', e.message));
          }
        }
      } catch (notifyErr) {
        console.warn('Notification webhook error (non-blocking):', notifyErr.message);
      }

      return res.status(201).json({
        success: true,
        message: 'Lead registrado com sucesso no Neon PostgreSQL!',
        lead: createdLead
      });
    } catch (err) {
      console.error('Vercel API Leads POST Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
