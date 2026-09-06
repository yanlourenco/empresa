import { query } from '../db/index.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // GET: Obter configurações (públicas ou administrativas)
  if (req.method === 'GET') {
    try {
      const authHeader = req.headers['authorization'] || '';
      const rows = await query('SELECT key, value, description FROM site_settings;');
      
      const settingsMap = {};
      rows.rows.forEach(r => {
        settingsMap[r.key] = r.value;
      });

      // Se for admin autenticado (ou verificando PIN)
      if (authHeader.startsWith('Bearer ')) {
        const pin = authHeader.replace('Bearer ', '').trim();
        const savedPin = settingsMap['admin_pin'] || 'admin123';
        if (pin === savedPin) {
          return res.status(200).json({
            success: true,
            authenticated: true,
            settings: settingsMap
          });
        }
      }

      // Resposta pública (apenas dados não-sensíveis como WhatsApp e Empresa)
      return res.status(200).json({
        success: true,
        authenticated: false,
        settings: {
          whatsapp_number: settingsMap['whatsapp_number'] || '5511999999999',
          company_name: settingsMap['company_name'] || 'LocalWeb Pro',
          contact_email: settingsMap['contact_email'] || 'contato@localwebpro.com.br'
        }
      });
    } catch (err) {
      console.error('API Settings GET Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST: Atualizar configurações (requer PIN do admin)
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { pin, whatsapp_number, new_pin, notification_webhook, contact_email } = body;

      // Verificar PIN atual
      const pinRow = await query("SELECT value FROM site_settings WHERE key = 'admin_pin';");
      const currentPin = pinRow.rows[0]?.value || 'admin123';

      if (pin !== currentPin) {
        return res.status(401).json({
          success: false,
          error: 'PIN de administrador incorreto.'
        });
      }

      // Atualizar configurações fornecidas
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

      return res.status(200).json({
        success: true,
        message: 'Configurações atualizadas com sucesso no Neon PostgreSQL!'
      });
    } catch (err) {
      console.error('API Settings POST Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
