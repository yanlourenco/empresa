-- ==========================================================
-- LocalWeb Pro - Schema de Banco de Dados Neon PostgreSQL
-- ==========================================================

-- 1. Tabela de Leads e Solicitações de Orçamento
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  niche VARCHAR(100),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  goal TEXT,
  estimated_budget VARCHAR(100),
  source VARCHAR(100) DEFAULT 'form_contato',
  status VARCHAR(50) DEFAULT 'novo', -- 'novo', 'em_contato', 'proposta_enviada', 'fechado', 'perdido'
  notes TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_niche ON leads (niche);

-- 2. Tabela de Simulações do Calculador de ROI
CREATE TABLE IF NOT EXISTS roi_simulations (
  id SERIAL PRIMARY KEY,
  niche VARCHAR(100),
  clients_per_month INTEGER,
  average_ticket NUMERIC(10,2),
  projected_monthly NUMERIC(10,2),
  projected_annual NUMERIC(10,2),
  payback_days VARCHAR(50),
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roi_created_at ON roi_simulations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roi_niche ON roi_simulations (niche);

-- 3. Tabela de Eventos de Telemetria e Conversão (Analytics Interno)
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL, -- 'page_view', 'click_whatsapp', 'view_project_modal', 'calculate_roi', 'submit_form'
  event_data JSONB DEFAULT '{}'::jsonb,
  page_path VARCHAR(255) DEFAULT '/',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events (event_type);

-- 4. Tabela de Projetos do Portfólio (Showcase & Carrossel 3D)
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  client_name VARCHAR(255),
  client_role VARCHAR(255),
  avatar_initials VARCHAR(10),
  niche VARCHAR(100),
  primary_color VARCHAR(50),
  bg_tint VARCHAR(100),
  bg_section VARCHAR(50),
  bg_section_light VARCHAR(50),
  bg_tint_light VARCHAR(100),
  media_type VARCHAR(50) DEFAULT 'image',
  media_url TEXT,
  full_mockup_url TEXT,
  live_url TEXT,
  delivery_time VARCHAR(100),
  results_metric VARCHAR(100),
  description TEXT,
  feedback TEXT,
  rating INTEGER DEFAULT 5,
  tags JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '[]'::jsonb,
  demo_html TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects (is_active);

-- 5. Tabela de Serviços e Modelos de Receita (Pitch Deck)
CREATE TABLE IF NOT EXISTS services_pricing (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  billing_cycle VARCHAR(50) DEFAULT 'once', -- 'once', 'monthly', 'hourly'
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  badge VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Perguntas Frequentes (FAQ Dinâmico)
CREATE TABLE IF NOT EXISTS faq_items (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'geral',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_faq_order ON faq_items (display_order ASC);

-- 7. Tabela de Depoimentos e Avaliações (Social Proof)
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  client_role VARCHAR(255),
  niche VARCHAR(100),
  avatar_initials VARCHAR(10),
  quote TEXT NOT NULL,
  results_metric VARCHAR(100),
  rating INTEGER DEFAULT 5,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela de Configurações Dinâmicas do Site
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
