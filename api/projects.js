import { query } from '../db/index.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // GET: Obter projetos (ativos para o público, ou todos para o admin)
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, 'http://localhost');
      const showAll = url.searchParams.get('all') === 'true';

      const sql = showAll
        ? 'SELECT * FROM projects ORDER BY display_order ASC, created_at DESC;'
        : 'SELECT * FROM projects WHERE is_active = true ORDER BY display_order ASC;';

      const result = await query(sql);
      return res.status(200).json({
        success: true,
        count: result.rowCount,
        data: result.rows
      });
    } catch (err) {
      console.error('Vercel API Projects GET Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST: Cadastrar ou atualizar projeto no portfólio
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const {
        id, title, client_name, client_role, avatar_initials, niche,
        primary_color, live_url, full_mockup_url, media_url,
        delivery_time, results_metric, description, feedback, is_active
      } = body;

      if (!title || !client_name) {
        return res.status(400).json({ success: false, error: 'Título e Nome do Cliente são obrigatórios.' });
      }

      const projId = id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const initials = avatar_initials || client_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const color = primary_color || '#2563EB';
      const active = is_active !== undefined ? Boolean(is_active) : true;
      const media = full_mockup_url || media_url || '/projects/dovena-medical.jpg';

      // Gerar demoHtml padrão se não fornecido
      const defaultDemoHtml = `
        <div class="live-mockup-wrapper">
          <div class="live-mockup-top-banner" style="border-left-color: ${color};">
            <div class="live-mockup-meta">
              <span class="live-status-badge" style="background: ${color}26; color: ${color}; border-color: ${color}4d;">
                PROJETO AO VIVO ENTREGUE
              </span>
              <h3 class="live-mockup-title">${title}</h3>
              <p class="live-mockup-sub">Interface oficial desenvolvida pela LocalWeb Pro.</p>
            </div>
            <div class="live-mockup-actions">
              <a href="${media}" target="_blank" rel="noopener noreferrer" class="btn-view-fullscreen">
                <span>Ver Imagem Completa</span>
              </a>
              <a href="${live_url || '#'}" target="_blank" rel="noopener noreferrer" class="btn-live-contact" style="background: ${color};">
                <span>Visitar Site Oficial</span>
              </a>
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
          'image', $12, $13, $14, $15,
          $16, $17, $18, 5, '[]'::jsonb, '[]'::jsonb, $19,
          (SELECT COALESCE(MAX(display_order), 0) + 1 FROM projects), $20, CURRENT_TIMESTAMP
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
          delivery_time = EXCLUDED.delivery_time,
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
        media, media, live_url || 'https://localwebpro.com.br', delivery_time || '5 Dias Úteis',
        results_metric || '+200% Conversões', description || 'Site corporativo de alta performance.',
        feedback || 'Excelente trabalho e retorno garantido.', defaultDemoHtml, active
      ]);

      return res.status(201).json({
        success: true,
        message: 'Projeto salvo com sucesso no Neon DB!',
        project: insertRes.rows[0]
      });
    } catch (err) {
      console.error('Vercel API Projects POST Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // PUT: Alternar ativação ou ordem
  if (req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { id, is_active, display_order } = body;

      if (!id) {
        return res.status(400).json({ success: false, error: 'ID do projeto é obrigatório.' });
      }

      const updateRes = await query(`
        UPDATE projects
        SET 
          is_active = COALESCE($1, is_active),
          display_order = COALESCE($2, display_order),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *;
      `, [is_active !== undefined ? is_active : null, display_order !== undefined ? display_order : null, id]);

      return res.status(200).json({
        success: true,
        message: 'Projeto atualizado com sucesso!',
        project: updateRes.rows[0]
      });
    } catch (err) {
      console.error('Vercel API Projects PUT Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // DELETE: Remover projeto
  if (req.method === 'DELETE') {
    try {
      const url = new URL(req.url, 'http://localhost');
      const queryId = url.searchParams.get('id');
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const id = queryId || body.id;

      if (!id) {
        return res.status(400).json({ success: false, error: 'ID do projeto é obrigatório.' });
      }

      await query('DELETE FROM projects WHERE id = $1;', [id]);
      return res.status(200).json({ success: true, message: 'Projeto removido com sucesso do Neon DB!' });
    } catch (err) {
      console.error('Vercel API Projects DELETE Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
