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

      return res.status(201).json({
        success: true,
        message: 'Lead registrado com sucesso no Neon PostgreSQL!',
        lead: insertRes.rows[0]
      });
    } catch (err) {
      console.error('Vercel API Leads POST Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
