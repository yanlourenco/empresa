# LocalWeb Pro 🌐
> **Plataforma Corporativa de Alta Performance & Conversão para Negócios Locais**

Desenvolvimento web sob medida, sóbrio e eficiente para pequenas empresas. O projeto entrega presença digital executiva com carregamento ultra-rápido, otimização de SEO local, integração direta ao WhatsApp e experiência interativa de portfólio.

---

## 🚀 Tecnologias Utilizadas

- **HTML5 Semântico**: Estrutura acessível com marcação voltada a SEO e WCAG.
- **CSS3 Vanilla**: Design System moderno baseado em variáveis CSS (Custom Properties), glassmorphism, sombras volumétricas e iluminação radial sem dependência de frameworks pesados.
- **JavaScript Moderno (ES6+ Modules)**: Componentes modulares, manipulação de streams de animação, drag/swipe gestures e reatividade limpa.
- **Vite**: Bundler de última geração com inicialização instantânea e compilação ultra-rápida.
- **SVGs Vetoriais Puros**: Ícones nítidos e escaláveis em qualquer resolução, sem fontes de ícones externas ou emojis genéricos.

---

## ✨ Principais Funcionalidades

### 🌓 1. Sistema Completo de Tema Claro / Escuro (Dark & Light Mode)
- **Alternador na Barra de Navegação**: Botão com ícones vetoriais de Sol e Lua e indicador de estado.
- **Paleta Dark**: Base em Preto Profundo (`#05070B`) e Azul Meia-Noite (`#0F172A`, `#1E3A8A`, `#2563EB`) com tipografia branca nítida.
- **Paleta Light**: Fundo limpo em tom ardósia (`#F8FAFC`), superfícies brancas (`#FFFFFF`) e tipografia de alto contraste em azul petróleo e obsidian (`#0F172A`).
- **Persistência Inteligente**: Salva a preferência do usuário no `localStorage` (`localweb_theme`) e detecta automaticamente o `prefers-color-scheme` do sistema operacional no primeiro acesso.
- **Transição Suave**: Troca de iluminação fluida em `0.35s` sem cintilação na tela.

### 🎠 2. Carrossel 3D Coverflow de Alta Conversão
- **Navegação 3D Hardware-Accelerated**: Renderização com perspectiva profunda e cálculo de profundidade Z para cards laterais.
- **Suporte Multi-Input**: Navegação por cliques, setas direcionais do teclado e **gestos de arrastar/deslizar (Pointer/Touch swipe)** em dispositivos móveis.
- **Transição Dinâmica de Cores por Marca**: A seção `#projetos` e o card de feedback mudam suavemente de fundo (`cubic-bezier(0.16, 1, 0.3, 1)`) para celebrar a paleta visual do cliente em destaque.
- **Pills de Paginação Interativas**: Indicadores dinâmicos que expandem e adotam o brilho da cor da marca ativa.

### 🔍 3. Modal de Demonstração com Mockups Reais & Viewport Switcher
- **Exibição Autêntica**: Ao clicar em qualquer projeto ou no botão *"Explorar Projeto Ao Vivo"*, o modal abre exibindo com máxima nitidez a **imagem real entregue ao cliente**.
- **Rolagem Suave Contínua**: Contêiner com scrollbar customizada para inspecionar a interface entregue de ponta a ponta.
- **Simulador de Dispositivos (Device Switcher)**:
  - 🖥️ **Desktop** (100% largura)
  - 📱 **Tablet** (768px centralizado com moldura)
  - 📲 **Mobile** (375px centralizado com moldura)
- **Ação em Tela Cheia**: Botão *"Ver Imagem Completa"* para abrir o mockup original em alta definição em uma nova aba.

### ✍️ 4. Efeito Stagger Text Rise
- Sistema tipográfico que anima os títulos caractere por caractere com aceleração por GPU, criando uma entrada marcante e executiva.

### 📲 5. Formulário de Diagnóstico & Conversão WhatsApp
- Captação de dados essenciais (Nome da Empresa, Nicho, WhatsApp e Necessidade Principal).
- Formatação automática de mensagem pré-configurada pronta para envio no WhatsApp do atendimento.

---

## 💼 Portfólio de Projetos Integrados

| Projeto | Nicho / Segmento | Cor Primária | Fundo Dinâmico (Dark / Light) | Métrica de Resultado |
| :--- | :--- | :--- | :--- | :--- |
| **Dovena** | Saúde & Farmacêutica | `#00A884` (Esmeralda) | `#02382E` / `#E6F7F2` | **+340%** em agendamentos |
| **Dark Beard** | Barbearia & Grooming VIP | `#C59B27` (Ouro Âmbar) | `#2B2006` / `#FAF5E8` | **100%** da agenda preenchida |
| **FRZN™** | Moda Urbana & E-commerce | `#5D8AA8` (Azul Ártico) | `#132130` / `#EDF4F9` | **R$ 42.000** em vendas na 1ª semana |
| **Be Greater** | Fitness & Crossfit Studio | `#E50914` (Vermelho Intenso) | `#380407` / `#FDF1F1` | **85 novas** matrículas no 1º mês |
| **Jacket Masters** | Loja de Roupa & E-commerce *(Vídeo Showcase)* | `#FF6B00` (Laranja Radiante) | `#381700` / `#FFF2EB` | **+4.8x** retenção e **14.2%** conversão |
| **Cloud9 Studio** | Design 3D & Branding *(Vídeo Showcase)* | `#E11D48` (Carmim Vibrante) | `#3E0713` / `#FDF2F4` | **+5.2x** em leads qualificados |
| **Soundar** | Hardware & Fones Hi-Fi *(Vídeo Showcase)* | `#84CC16` (Neon Lime) | `#0D1704` / `#F7FEE7` | **R$ 78.000** em pré-vendas |

---

## 📁 Estrutura de Pastas e Arquivos

```text
empresa/
├── public/
│   └── projects/                  # Mockups em alta resolução e assets dos projetos
│       ├── dovena-medical.jpg
│       ├── dark-beard-barber.jpg
│       ├── frzn-winterwear.jpg
│       ├── be-greater-fitness.jpg
│       ├── jacket-masters.png
│       ├── cloud9-studio.png
│       └── soundar-headphones.png
├── index.html                     # Estrutura HTML5 semântica e acessível
├── style.css                      # Design System completo (Dark + Light Mode, Carrossel 3D, Modal)
├── main.js                        # Lógica da aplicação, tema claro/escuro, modais e formulário
├── modern-carousel.js             # Componente do Carrossel 3D Coverflow e controles de swipe
├── video-showcase-engine.js       # Motor de animação e streaming de vídeo 4K 60fps para cards e modais
├── projectsData.js                # Base de dados dos clientes, cores, métricas e mockups reais
├── stagger-text.js                # Efeito tipográfico Stagger Text Rise
├── package.json                   # Dependências e scripts de desenvolvimento
└── vite.config.js                 # Configurações do servidor e build Vite
```

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- Gerenciador de pacotes `npm`

### 1. Clonar ou Acessar a Pasta do Repositório
```bash
cd caminho/para/empresa
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Banco de Dados (Neon PostgreSQL)
Copie o arquivo de exemplo e configure sua string de conexão:
```bash
cp .env.example .env
```
Execute as migrações e o seed inicial (cria as tabelas `leads`, `projects`, `services_pricing`, `site_settings` e popula os projetos):
```bash
npm run db:migrate
```

### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
O projeto estará disponível no seu navegador em:
```text
http://localhost:3000
```
- **Painel de Leads & Orçamentos**: `http://localhost:3000/admin-leads.html`
- **Health Check da API / Neon**: `http://localhost:3000/api/health`

### 5. Gerar a Build de Produção
```bash
npm run build
```
Os arquivos otimizados e minificados serão gerados na pasta `dist/`.

### 6. Executar em Produção com Node.js + Neon DB
```bash
npm start
```
---

## 🎨 Como Adicionar um Novo Projeto ao Portfólio

Abra o arquivo [`projectsData.js`](projectsData.js) e adicione um novo objeto ao array `PROJECTS_DATA`:

```javascript
{
  id: 'nome-do-cliente',
  title: 'Nome da Empresa - Ramo de Atuação',
  clientName: 'Nome do Proprietário',
  clientRole: 'Cargo • Especialidade',
  avatarInitials: 'NC',
  niche: 'Segmento de Atuação',
  primaryColor: '#HEX_COR_PRIMARIA',
  bgTint: 'rgba(R, G, B, 0.28)',          // Halo escuro
  bgSection: '#HEX_FUNDO_DARK',           // Fundo no modo escuro
  bgSectionLight: '#HEX_FUNDO_LIGHT',     // Fundo no modo claro
  bgTintLight: 'rgba(R, G, B, 0.15)',     // Halo claro
  mediaType: 'image',
  mediaUrl: '/projects/mockup-capa.jpg',
  fullMockupUrl: '/projects/mockup-completo.jpg',
  liveUrl: 'https://cliente.localwebpro.com.br',
  deliveryTime: '5 Dias Úteis',
  resultsMetric: '+250% em agendamentos',
  description: 'Descrição do resultado gerado.',
  feedback: 'Depoimento real do cliente.',
  rating: 5,
  tags: ['Tag 1', 'Tag 2', 'Tag 3'],
  stats: [
    { label: 'Métrica 1', val: '+500' },
    { label: 'Métrica 2', val: '99%' }
  ],
  demoHtml: `
    <!-- HTML com o mockup e botão de contato -->
  `
}
```

---

## 📄 Licença e Direitos

Desenvolvido para **LocalWeb Pro** © 2026. Todos os direitos reservados.  
Construído com foco em design minimalista, identidade corporativa limpa e máxima taxa de conversão.
