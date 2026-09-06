import { query } from '../db/index.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const dbCheck = await query('SELECT NOW() as time, version() as version;');
    return res.status(200).json({
      status: 'healthy',
      database: 'Neon PostgreSQL',
      serverTime: dbCheck.rows[0].time,
      dbVersion: dbCheck.rows[0].version
    });
  } catch (err) {
    console.error('Vercel API Health Error:', err);
    return res.status(500).json({
      status: 'unhealthy',
      error: err.message
    });
  }
}
