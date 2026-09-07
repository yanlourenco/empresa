# LocalWeb Pro 🌐
> **Plataforma Corporativa de Alta Performance, Gestão de Portfólio & CRM para Negócios Locais**

Desenvolvimento web sob medida, executivo e de alta conversão para micro e pequenas empresas. A plataforma combina uma vitrine interativa para demonstração dos sites desenvolvidos aos clientes, cálculo de ROI em tempo real, gerador de propostas executivas em PDF e um **Painel de Controle Administrativo (CRM & CMS)** conectado a banco de dados serverless **Neon PostgreSQL**, com deploy contínuo na **Vercel**.

---

## 🚀 Tecnologias Utilizadas

- **Frontend Core**: HTML5 Semântico, CSS3 Moderno (Vanilla CSS com Design Tokens e variáveis customizadas), JavaScript ES6+ Modular.
- **Bundler & Build Tool**: [Vite](https://vitejs.dev/) para compilação instantânea, minificação e geração de bundles ultraleves.
- **Banco de Dados Serverless**: [Neon PostgreSQL](https://neon.tech/) com driver `@neondatabase/serverless` e pool de conexões de alta performance.
- **APIs Serverless**: Endpoints compatíveis com Vercel Serverless Functions (`/api/leads`, `/api/projects`, `/api/settings`, `/api/health`).
- **Design System & Estilo**: Glassmorphism, aceleração por GPU, tipografia corporativa via Google Fonts (*Inter* e *Outfit*), sistema de temas Dark/Light sem cintilação.
- **Visualização & Mockups**: Carrossel 3D Coverflow com gestos touch/swipe, visualizador com simulação de dispositivos (Desktop, Tablet, Mobile) e modo tela cheia.
- **PWA & Identidade Visual**: Favicons vetoriais e rasterizados de alta resolução (`.svg`, `.ico`, 16x16, 32x32, 180x180) e `site.webmanifest`.

---

## ✨ Principais Funcionalidades

### 🌓 1. Sistema Completo de Tema Claro / Escuro (Dark & Light Mode)
- **Paleta Dark**: Base em Preto Profundo (`#05070B`) e Azul Meia-Noite (`#0B1120`, `#1E3A8A`, `#2563EB`) com contraste otimizado.
- **Paleta Light**: Fundo limpo ardósia (`#F8FAFC`), superfícies brancas com relevo e tipografia de alto contraste em azul petróleo e obsidian (`#0F172A`).
- **Persistência Automática**: Preferência memorizada no `localStorage` (`localweb_theme`) e detecção nativa do `prefers-color-scheme` do sistema.

### 🎠 2. Carrossel 3D Coverflow & Filtros por Nicho
- **Filtros Rápidos de Segmento**: Pílulas interativas no topo da vitrine (*Todos*, *Saúde & Clínicas*, *Barbearia & Beleza*, *Moda & Varejo*, *Fitness & Academias*, *Design & Tech*, *Hardware & Som*) para foco instantâneo.
- **Navegação Multicanal**: Cliques, setas direcionais do teclado e **gestos de arrastar/deslizar (Pointer/Touch Swipe)** em smartphones e tablets.
- **Troca Dinâmica de Atmosfera**: A seção de portfólio adapta a iluminação e as cores de fundo em tempo real para celebrar a identidade visual da marca em destaque.
- **Modal Interativo com Tela Cheia**: Demonstração do site do cliente com alternador de dispositivos (*Desktop*, *Tablet*, *Mobile*) e botão de **Tela Cheia** para imersão completa.

### 📊 3. Calculadora de Retorno (ROI) & Gerador de Proposta em PDF
- **Simulador Financeiro Interativo**: Sliders em tempo real para clientes adicionais e ticket médio, calculando faturamento extra mensal e anual.
- **Exportação de Proposta Executiva em PDF**: Botão integrado que gera uma folha timbrada A4 completa com diagnóstico, metas de faturamento, condições de investimento e termos de garantia, pronta para salvar em PDF (`Ctrl + P`) ou imprimir para reuniões comerciais.

### 🔒 4. Painel Executivo & CRM de Gestão Restrito (Admin Suite)
Acesso seguro e desacoplado da vitrine pública pela URL `/admin-leads.html`:
- **Barreira de Segurança por PIN**: Protegido por código de 4+ dígitos (PIN inicial padrão: `admin123`, customizável nas configurações).
- **Sigilo Comercial & SEO**: Blindado contra indexação de motores de busca (`noindex, nofollow, noarchive, nosnippet`).
- **Dashboard de Métricas**: Indicadores de Faturamento Estimado, Volume de Leads, Taxa de Conversão e Sites Ativos.
- **CRM Kanban de Oportunidades**: Gestão de leads em colunas (*Novo Contato*, *Em Negociação*, *Proposta Enviada*, *Fechado*, *Perdido*) com botão de contato direto via WhatsApp em 1 clique e histórico de interações.
- **CMS de Projetos no Neon DB**: Cadastro, edição e exclusão de sites dos clientes diretamente no banco de dados, refletindo instantaneamente na vitrine principal.
- **Central de Configurações**: Gerenciamento de canais de notificação (WhatsApp comercial, E-mail, Webhooks) e atualização do PIN de acesso.

### 🛡️ 5. Selos de Credibilidade & Conversão
- **Garantia Incondicional de 7 Dias**: Risco zero para o cliente final.
- **Entrega Expressa de 5 a 7 Dias Úteis**: Agilidade no lançamento.
- **Nuvem & Segurança SSL**: Infraestrutura certificada e de alta velocidade.

---

## 💼 Portfólio de Projetos Integrados

| Projeto | Nicho / Segmento | Cor Primária | Fundo Dinâmico (Dark / Light) | Métrica de Resultado |
| :--- | :--- | :--- | :--- | :--- |
| **Dovena** | Saúde & Farmacêutica | `#00A884` (Esmeralda) | `#02382E` / `#E6F7F2` | **+340%** em agendamentos |
| **Dark Beard** | Barbearia & Grooming VIP | `#C59B27` (Ouro Âmbar) | `#2B2006` / `#FAF5E8` | **100%** da agenda preenchida |
| **FRZN™** | Moda Urbana & E-commerce | `#5D8AA8` (Azul Ártico) | `#132130` / `#EDF4F9` | **R$ 42.000** em vendas na 1ª semana |
| **Be Greater** | Fitness & Crossfit Studio | `#E50914` (Vermelho Intenso) | `#380407` / `#FDF1F1` | **85 novas** matrículas no 1º mês |
| **Jacket Masters** | Loja de Roupa & E-commerce | `#FF6B00` (Laranja Radiante) | `#381700` / `#FFF2EB` | **+4.8x** retenção e **14.2%** conversão |
| **Cloud9 Studio** | Design 3D & Branding | `#E11D48` (Carmim Vibrante) | `#3E0713` / `#FDF2F4` | **+5.2x** em leads qualificados |
| **Soundar** | Hardware & Fones Hi-Fi | `#84CC16` (Neon Lime) | `#0D1704` / `#F7FEE7` | **R$ 78.000** em pré-vendas |

---

## 📁 Estrutura do Repositório

```text
empresa/
├── api/                           # Serverless Functions (Vercel & Neon DB)
│   ├── health.js                  # Status de conexão com banco de dados
│   ├── leads.js                   # API CRUD para captação e gestão de leads
│   ├── projects.js                # API para gerenciamento dos sites no portfólio
│   └── settings.js                # API de autenticação por PIN e configurações
├── db/                            # Camada de Banco de Dados
│   ├── index.js                   # Conexão e pool Neon Serverless
│   ├── migrate.js                 # Script de criação de tabelas e schema
│   └── seed.js                    # Carga inicial com projetos e configurações
├── public/                        # Arquivos estáticos servidos na raiz
│   ├── favicon.ico                # Ícone clássico para navegadores
│   ├── favicon.svg                # Ícone vetorial moderno
│   ├── favicon-16x16.png          # Ícone 16px
│   ├── favicon-32x32.png          # Ícone 32px
│   ├── apple-touch-icon.png       # Ícone para dispositivos Apple (180px)
│   ├── site.webmanifest           # Manifesto PWA com tema corporativo
│   └── projects/                  # Mockups e imagens de alta resolução
├── admin-leads.html               # Painel Administrativo, CRM e CMS (Protegido por PIN)
├── index.html                     # Vitrine Principal de Conversão e Portfólio
├── style.css                      # Design System completo (Dark/Light, 3D, Impressão PDF)
├── main.js                        # Lógica da vitrine, calculadora de ROI e formulários
├── modern-carousel.js             # Motor do carrossel 3D Coverflow e suporte a gestos
├── video-showcase-engine.js       # Gerenciador de streaming de mídia dos projetos
├── projectsData.js                # Catálogo local de fallback dos projetos
├── package.json                   # Dependências e scripts de execução
├── vercel.json                    # Configuração de rotas e Serverless Functions
└── vite.config.js                 # Configurações do Vite para múltiplas páginas
```

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Gerenciador de pacotes `npm`

### 1. Instalar as Dependências
```bash
npm install
```

### 2. Configurar o Banco de Dados (Neon PostgreSQL)
Crie um arquivo `.env` na raiz do projeto (baseado em `.env.example`):
```env
DATABASE_URL=postgresql://neondb_owner:SENHA@ep-exemplo.us-east-2.aws.neon.tech/neondb?sslmode=require
ADMIN_PIN=admin123
PORT=3000
```

Execute as migrações automáticas para criar as tabelas e povoar a base:
```bash
npm run db:migrate
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse no navegador:
- **Vitrine Principal**: [`http://localhost:3000/`](http://localhost:3000/)
- **Painel Administrativo Restrito**: [`http://localhost:3000/admin-leads.html`](http://localhost:3000/admin-leads.html)
  - *(PIN inicial padrão: `admin123`)*

### 4. Gerar Build de Produção
```bash
npm run build
```
Os arquivos minificados e otimizados serão gerados no diretório `dist/`.

---

## 🚀 Deploy Contínuo na Vercel

O projeto está configurado para deploy contínuo automático:
1. Ao realizar `git push` para a branch `main`, a Vercel detecta a alteração e inicia o build automaticamente.
2. No painel da Vercel, defina a variável de ambiente:
   - `DATABASE_URL`: String de conexão do seu banco de dados no Neon.
   - `ADMIN_PIN`: PIN inicial de acesso (opcional, padrão `admin123`).

---

## 📄 Licença e Direitos

Desenvolvido para **LocalWeb Pro** © 2026. Todos os direitos reservados.  
Construído com foco em design minimalista, alta conversão de clientes e autonomia máxima de gestão.
