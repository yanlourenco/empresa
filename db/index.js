import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_lkWyXu6azOE3@ep-fancy-wildflower-acggruta-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

/**
 * Execute a query with parameters
 * @param {string} text 
 * @param {Array} params 
 * @returns {Promise<pg.QueryResult>}
 */
export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('executed query', { text: text.substring(0, 80), duration, rows: res.rowCount });
  return res;
}

export default {
  pool,
  query
};
