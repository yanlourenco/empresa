import { query } from '../db/index.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // GET: Obter estatísticas e histórico de simulações de ROI
  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM roi_simulations ORDER BY created_at DESC LIMIT 50;');
      const stats = await query(`
        SELECT 
          COUNT(*) as total_simulations,
          COALESCE(AVG(projected_monthly), 0) as avg_projected_monthly,
          COALESCE(MAX(projected_monthly), 0) as max_projected_monthly,
          MODE() WITHIN GROUP (ORDER BY niche) as top_niche
        FROM roi_simulations;
      `);

      return res.status(200).json({
        success: true,
        stats: stats.rows[0],
        count: result.rowCount,
        data: result.rows
      });
    } catch (err) {
      console.error('Vercel API Simulations GET Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST: Registrar simulação de ROI criada pelo visitante
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { niche, clients, ticket, monthly, annual, paybackDays } = body;

      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;

      const insertRes = await query(`
        INSERT INTO roi_simulations (niche, clients_per_month, average_ticket, projected_monthly, projected_annual, payback_days, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `, [
        niche || 'Outro',
        clients || 0,
        ticket || 0,
        monthly || 0,
        annual || 0,
        paybackDays || '30 dias',
        ip
      ]);

      return res.status(201).json({
        success: true,
        message: 'Simulação de ROI salva no Neon!',
        simulation: insertRes.rows[0]
      });
    } catch (err) {
      console.error('Vercel API Simulations POST Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
