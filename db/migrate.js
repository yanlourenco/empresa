import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from './index.js';
import { PROJECTS_DATA } from '../projectsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('🚀 Iniciando migração e configuração do banco Neon PostgreSQL...');

  try {
    // 1. Executar schema DDL
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('📄 Executando schema.sql...');
    await query(schemaSql);
    console.log('✅ Tabelas criadas ou verificadas com sucesso!');

    // 2. Popular Projetos (Seed)
    console.log('📦 Populando projetos no banco de dados...');
    let projectOrder = 1;
    for (const p of PROJECTS_DATA) {
      await query(`
        INSERT INTO projects (
          id, title, client_name, client_role, avatar_initials, niche,
          primary_color, bg_tint, bg_section, bg_section_light, bg_tint_light,
          media_type, media_url, full_mockup_url, live_url, delivery_time,
          results_metric, description, feedback, rating, tags, stats, demo_html,
          display_order, is_active, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23,
          $24, true, CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          client_name = EXCLUDED.client_name,
          client_role = EXCLUDED.client_role,
          avatar_initials = EXCLUDED.avatar_initials,
          niche = EXCLUDED.niche,
          primary_color = EXCLUDED.primary_color,
          bg_tint = EXCLUDED.bg_tint,
          bg_section = EXCLUDED.bg_section,
          bg_section_light = EXCLUDED.bg_section_light,
          bg_tint_light = EXCLUDED.bg_tint_light,
          media_type = EXCLUDED.media_type,
          media_url = EXCLUDED.media_url,
          full_mockup_url = EXCLUDED.full_mockup_url,
          live_url = EXCLUDED.live_url,
          delivery_time = EXCLUDED.delivery_time,
          results_metric = EXCLUDED.results_metric,
          description = EXCLUDED.description,
          feedback = EXCLUDED.feedback,
          rating = EXCLUDED.rating,
          tags = EXCLUDED.tags,
          stats = EXCLUDED.stats,
          demo_html = EXCLUDED.demo_html,
          display_order = EXCLUDED.display_order,
          updated_at = CURRENT_TIMESTAMP;
      `, [
        p.id,
        p.title,
        p.clientName,
        p.clientRole,
        p.avatarInitials,
        p.niche,
        p.primaryColor,
        p.bgTint,
        p.bgSection,
        p.bgSectionLight,
        p.bgTintLight,
        p.mediaType || 'image',
        p.mediaUrl,
        p.fullMockupUrl,
        p.liveUrl,
        p.deliveryTime,
        p.resultsMetric,
        p.description,
        p.feedback,
        p.rating || 5,
        JSON.stringify(p.tags || []),
        JSON.stringify(p.stats || []),
        p.demoHtml || '',
        projectOrder++
      ]);
    }
    console.log(`✅ ${PROJECTS_DATA.length} projetos sincronizados no Neon!`);

    // 3. Popular Serviços e Planos Comerciais
    console.log('💳 Populando tabela de serviços e modelos de receita...');
    const services = [
      {
        id: 'setup-inicial',
        name: 'Setup Inicial Completo & Entrega Recorde',
        price: 1200.00,
        billing_cycle: 'once',
        badge: 'Mais Escolhido',
        description: 'Desenvolvimento e publicação do site corporativo de alta performance em 5 a 7 dias úteis.',
        features: JSON.stringify([
          'Design sob medida com identidade visual própria',
          'Carregamento ultra-rápido (< 1.5s)',
          'Otimização SEO Local para Google Busca e Maps',
          'Integração direta com WhatsApp de Atendimento',
          'Mockup interativo e garantia de 7 dias de ajustes'
        ]),
        display_order: 1
      },
      {
        id: 'hospedagem-suporte',
        name: 'Hospedagem Dedicada & Suporte VIP',
        price: 150.00,
        billing_cycle: 'monthly',
        badge: 'Essencial',
        description: 'Infraestrutura de nuvem com SSL, proteção contra quedas e suporte prioritário.',
        features: JSON.stringify([
          'Hospedagem em nuvem de alta disponibilidade',
          'Certificado de Segurança SSL Automático',
          'Backups automáticos semanais',
          'Atualizações de segurança contínuas',
          'Suporte técnico direto via WhatsApp'
        ]),
        display_order: 2
      },
      {
        id: 'bloco-ajustes',
        name: 'Bloco de Evolução & Horas Extras',
        price: 200.00,
        billing_cycle: 'hourly',
        badge: 'Flexível',
        description: 'Para inclusão de novas páginas, novas funcionalidades ou campanhas especiais após o período de garantia.',
        features: JSON.stringify([
          'Atendimento sob demanda',
          'Criação de novas seções promocionais',
          'Integrações com ferramentas externas',
          'Relatórios de métricas e conversão'
        ]),
        display_order: 3
      }
    ];

    for (const s of services) {
      await query(`
        INSERT INTO services_pricing (id, name, price, billing_cycle, badge, description, features, display_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          billing_cycle = EXCLUDED.billing_cycle,
          badge = EXCLUDED.badge,
          description = EXCLUDED.description,
          features = EXCLUDED.features,
          display_order = EXCLUDED.display_order;
      `, [s.id, s.name, s.price, s.billing_cycle, s.badge, s.description, s.features, s.display_order]);
    }
    console.log('✅ Planos e serviços comerciais sincronizados!');

    // 4. Popular Configurações do Site
    console.log('⚙️ Sincronizando configurações gerais...');
    const settings = [
      { key: 'whatsapp_number', value: '5511999999999', description: 'Número do WhatsApp para conversão de leads' },
      { key: 'contact_email', value: 'contato@localwebpro.com.br', description: 'E-mail corporativo' },
      { key: 'company_name', value: 'LocalWeb Pro', description: 'Nome da empresa' },
      { key: 'lead_auto_reply', value: 'true', description: 'Ativação de fluxo de resposta automática' }
    ];

    for (const item of settings) {
      await query(`
        INSERT INTO site_settings (key, value, description, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          description = EXCLUDED.description,
          updated_at = CURRENT_TIMESTAMP;
      `, [item.key, item.value, item.description]);
    }
    console.log('✅ Configurações gerais sincronizadas!');

    // 5. Exibir estatísticas finais
    const projectsCount = await query('SELECT count(*) FROM projects;');
    const servicesCount = await query('SELECT count(*) FROM services_pricing;');
    const settingsCount = await query('SELECT count(*) FROM site_settings;');
    const leadsCount = await query('SELECT count(*) FROM leads;');

    console.log('\n📊 Resumo do Banco de Dados Neon:');
    console.log(`- 📁 Projetos cadastrados: ${projectsCount.rows[0].count}`);
    console.log(`- 💳 Serviços cadastrados: ${servicesCount.rows[0].count}`);
    console.log(`- ⚙️ Configurações salvas: ${settingsCount.rows[0].count}`);
    console.log(`- 👥 Leads registrados: ${leadsCount.rows[0].count}`);
    console.log('\n🎉 Migração concluída com sucesso!');
  } catch (err) {
    console.error('❌ Erro durante a migração:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
