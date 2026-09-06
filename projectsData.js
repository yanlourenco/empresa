/**
 * LocalWeb Pro - Portfolio Projects Data Structure
 * Minimalist, High-Conversion projects showcase with client metrics, brand colors and authentic image previews.
 */

export const PROJECTS_DATA = [
  {
    id: 'dovena',
    title: 'Dovena - Farmácia & Clínica Médica',
    clientName: 'Dra. Beatriz Mendes',
    clientRole: 'Diretora Técnica • Farmacêutica',
    avatarInitials: 'BM',
    niche: 'Saúde & Farmacêutica',
    primaryColor: '#00A884',
    bgTint: 'rgba(0, 168, 132, 0.28)',
    bgSection: '#02382E',
    bgSectionLight: '#E6F7F2',
    bgTintLight: 'rgba(0, 168, 132, 0.16)',
    mediaType: 'image',
    mediaUrl: '/projects/dovena-medical.jpg',
    fullMockupUrl: '/projects/dovena-medical.jpg',
    liveUrl: 'https://dovena.localwebpro.com.br',
    deliveryTime: '5 Dias Úteis',
    resultsMetric: '+340% em agendamentos',
    description: 'Plataforma sob medida com catálogo de medicamentos, triagem preventiva de sintomas online e atendimento direto no WhatsApp com suporte 24h.',
    feedback: 'A LocalWeb Pro transformou a forma como nossos pacientes agendam consultas e compram medicamentos. Nosso atendimento no WhatsApp triplicou de eficiência e o site carrega instantaneamente.',
    rating: 5,
    tags: ['Agendamento Online', 'Catálogo Digital', 'Triagem 24h', 'SEO Local'],
    stats: [
      { label: 'Satisfação', val: '99%' },
      { label: 'Suporte', val: '24 Horas' },
      { label: 'Consultas/Mês', val: '+1.200' }
    ],
    demoHtml: `
      <div class="live-mockup-wrapper">
        <div class="live-mockup-top-banner" style="border-left-color: #00A884;">
          <div class="live-mockup-meta">
            <span class="live-status-badge" style="background: rgba(0, 168, 132, 0.15); color: #00A884; border-color: rgba(0, 168, 132, 0.3);">
              PROJETO AO VIVO ENTREGUE
            </span>
            <h3 class="live-mockup-title">Dovena - Farmácia & Clínica Médica</h3>
            <p class="live-mockup-sub">Role abaixo para inspecionar a interface completa entregue ao cliente.</p>
          </div>
          <div class="live-mockup-actions">
            <a href="/projects/dovena-medical.jpg" target="_blank" rel="noopener noreferrer" class="btn-view-fullscreen" title="Abrir Imagem em Alta Resolução">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>
              <span>Ver Imagem Completa</span>
            </a>
            <a href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostei%20do%20site%20da%20Dovena%20e%20gostaria%20de%20um%20or%C3%A7amento." target="_blank" rel="noopener noreferrer" class="btn-live-contact" style="background: #00A884;">
              <span>Solicitar Modelo Semelhante</span>
            </a>
          </div>
        </div>

        <div class="live-mockup-viewport-scroll">
          <img src="/projects/dovena-medical.jpg" alt="Dovena Health - Mockup Completo do Site" class="live-mockup-full-image" loading="lazy" />
        </div>
      </div>
    `
  },
  {
    id: 'dark-beard',
    title: 'Dark Beard - Barbearia & Grooming VIP',
    clientName: 'Leonardo Vance',
    clientRole: 'Master Barber & Sócio-Fundador',
    avatarInitials: 'LV',
    niche: 'Barbearia & Estética Masculina',
    primaryColor: '#C59B27',
    bgTint: 'rgba(197, 155, 39, 0.28)',
    bgSection: '#2B2006',
    bgSectionLight: '#FAF5E8',
    bgTintLight: 'rgba(197, 155, 39, 0.16)',
    mediaType: 'image',
    mediaUrl: '/projects/dark-beard-barber.jpg',
    fullMockupUrl: '/projects/dark-beard-barber.jpg',
    liveUrl: 'https://darkbeard.localwebpro.com.br',
    deliveryTime: '4 Dias Úteis',
    resultsMetric: '100% da agenda preenchida',
    description: 'Identidade visual dark elegante, catálogo de cortes modernos e barboterapia com sistema integrado de agendamento por barbeiro especialista.',
    feedback: 'Antes perdíamos clientes porque não tínhamos tempo de atender chamadas durante os cortes. Agora o cliente escolhe o profissional e o serviço pelo site em 20 segundos.',
    rating: 5,
    tags: ['Agendamento por Barbeiro', 'Catálogo Dark', 'VIP Lounge', 'WhatsApp Sync'],
    stats: [
      { label: 'Clientes Atendidos', val: '+7.200' },
      { label: 'Barbeiros Master', val: '6 Especialistas' },
      { label: 'Avaliação Clientes', val: '4.9 / 5.0' }
    ],
    demoHtml: `
      <div class="live-mockup-wrapper">
        <div class="live-mockup-top-banner" style="border-left-color: #C59B27;">
          <div class="live-mockup-meta">
            <span class="live-status-badge" style="background: rgba(197, 155, 39, 0.15); color: #C59B27; border-color: rgba(197, 155, 39, 0.3);">
              PROJETO AO VIVO ENTREGUE
            </span>
            <h3 class="live-mockup-title">Dark Beard - Barbearia & Grooming de Luxo</h3>
            <p class="live-mockup-sub">Role abaixo para inspecionar a interface completa entregue ao cliente.</p>
          </div>
          <div class="live-mockup-actions">
            <a href="/projects/dark-beard-barber.jpg" target="_blank" rel="noopener noreferrer" class="btn-view-fullscreen" title="Abrir Imagem em Alta Resolução">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>
              <span>Ver Imagem Completa</span>
            </a>
            <a href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostei%20do%20site%20da%20Dark%20Beard%20e%20gostaria%20de%20um%20or%C3%A7amento." target="_blank" rel="noopener noreferrer" class="btn-live-contact" style="background: #C59B27; color: #080A0F;">
              <span>Solicitar Modelo Semelhante</span>
            </a>
          </div>
        </div>

        <div class="live-mockup-viewport-scroll">
          <img src="/projects/dark-beard-barber.jpg" alt="Dark Beard - Mockup Completo do Site" class="live-mockup-full-image" loading="lazy" />
        </div>
      </div>
    `
  },
  {
    id: 'frzn',
    title: 'FRZN™ - Arctic Streetwear & Puffers',
    clientName: 'Tanya Hoshivska',
    clientRole: 'Creative Director & Stylist',
    avatarInitials: 'TH',
    niche: 'Moda Urbana & E-commerce',
    primaryColor: '#5D8AA8',
    bgTint: 'rgba(93, 138, 168, 0.30)',
    bgSection: '#132130',
    bgSectionLight: '#EDF4F9',
    bgTintLight: 'rgba(93, 138, 168, 0.18)',
    mediaType: 'image',
    mediaUrl: '/projects/frzn-winterwear.jpg',
    fullMockupUrl: '/projects/frzn-winterwear.jpg',
    liveUrl: 'https://frzn.localwebpro.com.br',
    deliveryTime: '7 Dias Úteis',
    resultsMetric: 'R$ 42.000 em vendas na 1ª semana',
    description: 'Vitrine e-commerce de alto impacto visual para confecção de roupas térmicas de inverno com navegação fluida e checkout simplificado via WhatsApp.',
    feedback: 'O layout minimalista estilo editorial internacional destacou a qualidade das nossas jaquetas. Conseguimos esgotar o primeiro lote da Coleção Arctic 01 em poucos dias.',
    rating: 5,
    tags: ['Vitrine Editorial', 'Guia de Tamanhos', 'Checkout WhatsApp', 'Ultra-Rápido'],
    stats: [
      { label: 'Coleção', val: 'Artic 01™' },
      { label: 'Tempo de Carregamento', val: '0.6s' },
      { label: 'Conversão Checkout', val: '11.8%' }
    ],
    demoHtml: `
      <div class="live-mockup-wrapper">
        <div class="live-mockup-top-banner" style="border-left-color: #5D8AA8;">
          <div class="live-mockup-meta">
            <span class="live-status-badge" style="background: rgba(93, 138, 168, 0.18); color: #94A3B8; border-color: rgba(93, 138, 168, 0.35);">
              PROJETO AO VIVO ENTREGUE
            </span>
            <h3 class="live-mockup-title">FRZN™ - Streetwear & Arctic Puffer Collection</h3>
            <p class="live-mockup-sub">Role abaixo para inspecionar a interface completa entregue ao cliente.</p>
          </div>
          <div class="live-mockup-actions">
            <a href="/projects/frzn-winterwear.jpg" target="_blank" rel="noopener noreferrer" class="btn-view-fullscreen" title="Abrir Imagem em Alta Resolução">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>
              <span>Ver Imagem Completa</span>
            </a>
            <a href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostei%20do%20site%20da%20FRZN%20e%20gostaria%20de%20um%20or%C3%A7amento." target="_blank" rel="noopener noreferrer" class="btn-live-contact" style="background: #5D8AA8;">
              <span>Solicitar Modelo Semelhante</span>
            </a>
          </div>
        </div>

        <div class="live-mockup-viewport-scroll">
          <img src="/projects/frzn-winterwear.jpg" alt="FRZN - Mockup Completo do Site" class="live-mockup-full-image" loading="lazy" />
        </div>
      </div>
    `
  },
  {
    id: 'be-greater',
    title: 'Be Greater - Training Studio & Crossfit',
    clientName: 'Carlos Eduardo Rocha',
    clientRole: 'Head Coach & Proprietário',
    avatarInitials: 'CR',
    niche: 'Academias & Studios',
    primaryColor: '#E50914',
    bgTint: 'rgba(229, 9, 20, 0.28)',
    bgSection: '#380407',
    bgSectionLight: '#FDF1F1',
    bgTintLight: 'rgba(229, 9, 20, 0.14)',
    mediaType: 'image',
    mediaUrl: '/projects/be-greater-fitness.jpg',
    fullMockupUrl: '/projects/be-greater-fitness.jpg',
    liveUrl: 'https://begreater.localwebpro.com.br',
    deliveryTime: '5 Dias Úteis',
    resultsMetric: '85 novas matrículas no 1º mês',
    description: 'Landing page agressiva e moderna com grade horária de treinos, tabela comparativa de planos e passe livre VIP de aula experimental.',
    feedback: 'A nossa taxa de conversão explodiu! O botão de aula experimental gratuita manda os leads direto para nosso WhatsApp já com o plano de preferência selecionado.',
    rating: 5,
    tags: ['Aula Grátis VIP', 'Tabela de Planos', 'Grade Horária', 'Conversão Máxima'],
    stats: [
      { label: 'Matrículas Novas', val: '85 no 1º mês' },
      { label: 'Taxa de Retenção', val: '94%' },
      { label: 'Treinos Diários', val: '12 Turmas' }
    ],
    demoHtml: `
      <div class="live-mockup-wrapper">
        <div class="live-mockup-top-banner" style="border-left-color: #E50914;">
          <div class="live-mockup-meta">
            <span class="live-status-badge" style="background: rgba(229, 9, 20, 0.18); color: #E50914; border-color: rgba(229, 9, 20, 0.35);">
              PROJETO AO VIVO ENTREGUE
            </span>
            <h3 class="live-mockup-title">Be Greater - Training Studio & Crossfit</h3>
            <p class="live-mockup-sub">Role abaixo para inspecionar a interface completa entregue ao cliente.</p>
          </div>
          <div class="live-mockup-actions">
            <a href="/projects/be-greater-fitness.jpg" target="_blank" rel="noopener noreferrer" class="btn-view-fullscreen" title="Abrir Imagem em Alta Resolução">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>
              <span>Ver Imagem Completa</span>
            </a>
            <a href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostei%20do%20site%20da%20Be%20Greater%20e%20gostaria%20de%20um%20or%C3%A7amento." target="_blank" rel="noopener noreferrer" class="btn-live-contact" style="background: #E50914;">
              <span>Solicitar Modelo Semelhante</span>
            </a>
          </div>
        </div>

        <div class="live-mockup-viewport-scroll">
          <img src="/projects/be-greater-fitness.jpg" alt="Be Greater - Mockup Completo do Site" class="live-mockup-full-image" loading="lazy" />
        </div>
      </div>
    `
  },
  {
    id: 'elementor-jacket',
    title: 'Jacket Masters - Loja de Roupa & E-commerce',
    clientName: 'Gabriel Fontes',
    clientRole: 'Lead Designer & Webmaster',
    avatarInitials: 'GF',
    niche: 'Loja de Roupa & E-commerce',
    videoBadge: 'LOJA DE ROUPA',
    primaryColor: '#FF6B00',
    bgTint: 'rgba(255, 107, 0, 0.30)',
    bgSection: '#381700',
    bgSectionLight: '#FFF2EB',
    bgTintLight: 'rgba(255, 107, 0, 0.16)',
    mediaType: 'video',
    mediaUrl: '/projects/jacket-masters-showcase.webm',
    posterUrl: '/projects/jacket-masters.png',
    fullMockupUrl: '/projects/jacket-masters.png',
    liveUrl: 'https://jacketmasters.localwebpro.com.br',
    deliveryTime: '6 Dias Úteis',
    resultsMetric: '+4.8x retenção e 14.2% conversão',
    description: 'Experiência cinematográfica desenvolvida no Elementor Pro com vídeo interativo, micro-animações 3D de peças térmicas e seletor de cores em tempo real.',
    feedback: 'O componente de vídeo interativo prendeu a atenção dos clientes de uma forma inacreditável. O cliente consegue ver a jaqueta em todas as cores com um toque no carrossel.',
    rating: 5,
    tags: ['Loja de Roupa Online', 'Elementor Pro 3D', 'Troca de Cores', 'Micro-Interações'],
    stats: [
      { label: 'Tempo Médio na Página', val: '4m 12s' },
      { label: 'Engajamento no Vídeo', val: '92%' },
      { label: 'Taxa de Conversão', val: '14.2%' }
    ],
    demoHtml: `
      <div class="live-mockup-wrapper">
        <div class="live-mockup-top-banner" style="border-left-color: #FF6B00;">
          <div class="live-mockup-meta">
            <span class="live-status-badge" style="background: rgba(255, 107, 0, 0.18); color: #FF6B00; border-color: rgba(255, 107, 0, 0.35);">
              PROJETO AO VIVO ENTREGUE
            </span>
            <h3 class="live-mockup-title">Jacket Masters - Loja de Roupa & Puffer Streetwear</h3>
            <p class="live-mockup-sub">Role abaixo para inspecionar a interface completa da loja entregue ao cliente.</p>
          </div>
          <div class="live-mockup-actions">
            <a href="/projects/jacket-masters.png" target="_blank" rel="noopener noreferrer" class="btn-view-fullscreen" title="Abrir Imagem em Alta Resolução">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>
              <span>Ver Imagem Completa</span>
            </a>
            <a href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostei%20do%20showcase%20da%20Jacket%20Masters%20e%20gostaria%20de%20um%20or%C3%A7amento." target="_blank" rel="noopener noreferrer" class="btn-live-contact" style="background: #FF6B00;">
              <span>Solicitar Modelo Semelhante</span>
            </a>
          </div>
        </div>

        <div class="live-mockup-viewport-scroll">
          <!-- Authentic Full Mockup Image Sent by User -->
          <img src="/projects/jacket-masters.png" alt="Jacket Masters - Mockup Completo do Site" class="live-mockup-full-image" loading="lazy" />

          <!-- Video Showcase Player Box -->
          <div class="live-video-showcase-box">
            <div class="live-video-header">
              <span class="video-rec-dot"></span>
              <span>DEMONSTRAÇÃO DE MOTION & VÍDEO INTERATIVO 4K</span>
            </div>
            <div class="live-video-player-container">
              <video class="live-modal-video" data-project="elementor-jacket" autoplay loop muted playsinline controls poster="/projects/jacket-masters.png">
                <source src="/projects/jacket-masters-showcase.webm" type="video/webm">
              </video>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'cloud9',
    title: 'Cloud9 - Studio Criativo & Identidade 3D',
    clientName: 'Arthur Siqueira',
    clientRole: 'Diretor de Criação • Cloud9 Studio',
    avatarInitials: 'AS',
    niche: 'Design 3D & Branding Digital',
    videoBadge: 'STUDIO 3D MOTION',
    primaryColor: '#E11D48',
    bgTint: 'rgba(225, 29, 72, 0.28)',
    bgSection: '#3E0713',
    bgSectionLight: '#FDF2F4',
    bgTintLight: 'rgba(225, 29, 72, 0.14)',
    mediaType: 'video',
    mediaUrl: '/projects/cloud9-studio.webm',
    posterUrl: '/projects/cloud9-studio.png',
    fullMockupUrl: '/projects/cloud9-studio.png',
    liveUrl: 'https://cloud9.localwebpro.com.br',
    deliveryTime: '6 Dias Úteis',
    resultsMetric: '+5.2x em leads qualificados',
    description: 'Plataforma imersiva de alto impacto com render 3D em tempo real, tipografia em camadas e micro-hotspots interativos de design e estratégia.',
    feedback: 'O novo site da Cloud9 causou um impacto imediato no mercado. A combinação da tipografia em camadas com o 3D automotivo e fumaça volumétrica fechou nossos 3 maiores contratos corporativos do ano.',
    rating: 5,
    tags: ['Vídeo Motion 3D', 'Render Automotivo', 'Design System', 'Ultra Rápido'],
    stats: [
      { label: 'Novos Contratos', val: '+3 Enterprise' },
      { label: 'Tempo na Página', val: '4m 38s' },
      { label: 'Taxa de Retenção', val: '96%' }
    ],
    demoHtml: `
      <div class="live-mockup-wrapper">
        <div class="live-mockup-top-banner" style="border-left-color: #E11D48;">
          <div class="live-mockup-meta">
            <span class="live-status-badge" style="background: rgba(225, 29, 72, 0.18); color: #E11D48; border-color: rgba(225, 29, 72, 0.35);">
              PROJETO AO VIVO ENTREGUE
            </span>
            <h3 class="live-mockup-title">Cloud9 - Studio Criativo & Identidade 3D</h3>
            <p class="live-mockup-sub">Role abaixo para inspecionar a interface completa entregue ao cliente.</p>
          </div>
          <div class="live-mockup-actions">
            <a href="/projects/cloud9-studio.png" target="_blank" rel="noopener noreferrer" class="btn-view-fullscreen" title="Abrir Imagem em Alta Resolução">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>
              <span>Ver Imagem Completa</span>
            </a>
            <a href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostei%20do%20site%20da%20Cloud9%20e%20gostaria%20de%20um%20or%C3%A7amento." target="_blank" rel="noopener noreferrer" class="btn-live-contact" style="background: #E11D48;">
              <span>Solicitar Modelo Semelhante</span>
            </a>
          </div>
        </div>

        <div class="live-mockup-viewport-scroll">
          <!-- Authentic Full Mockup Image Sent by User -->
          <img src="/projects/cloud9-studio.png" alt="Cloud9 Studio - Mockup Completo do Site" class="live-mockup-full-image" loading="lazy" />

          <!-- Video Showcase Player Box -->
          <div class="live-video-showcase-box">
            <div class="live-video-header">
              <span class="video-rec-dot"></span>
              <span>DEMONSTRAÇÃO DE MOTION & VÍDEO INTERATIVO 4K</span>
            </div>
            <div class="live-video-player-container">
              <video class="live-modal-video" data-project="cloud9" autoplay loop muted playsinline controls poster="/projects/cloud9-studio.png">
                <source src="/projects/cloud9-studio.webm" type="video/webm">
              </video>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'soundar',
    title: 'Soundar - Fones Wireless & Áudio Hi-Fi',
    clientName: 'Rafael Albuquerque',
    clientRole: 'Head of Hardware & Product Lead',
    avatarInitials: 'RA',
    niche: 'Hardware & Fones Hi-Fi',
    videoBadge: 'ÁUDIO HI-FI 3D',
    primaryColor: '#84CC16',
    bgTint: 'rgba(132, 204, 22, 0.26)',
    bgSection: '#0D1704',
    bgSectionLight: '#F7FEE7',
    bgTintLight: 'rgba(132, 204, 22, 0.16)',
    mediaType: 'video',
    mediaUrl: '/projects/soundar-headphones.webm',
    posterUrl: '/projects/soundar-headphones.png',
    fullMockupUrl: '/projects/soundar-headphones.png',
    liveUrl: 'https://soundar.localwebpro.com.br',
    deliveryTime: '5 Dias Úteis',
    resultsMetric: 'R$ 78.000 em pré-vendas na estreia',
    description: 'Landing page tecnológica de alta conversão para fones sem fio com visual stealth, hotspots interativos de specs e checkout simplificado de pré-venda.',
    feedback: 'O design escuro com toques neon lime transmitiu a precisão sonora do Soundar com perfeição. As marcações interativas de especificações tiraram todas as dúvidas dos compradores no lançamento.',
    rating: 5,
    tags: ['Vídeo Motion 3D', 'Showcase Acústico', 'Hotspots Interativos', 'Checkout 1-Clique'],
    stats: [
      { label: 'Faturamento Pré-Venda', val: 'R$ 78.000' },
      { label: 'Fones Vendidos', val: '1.450 unidades' },
      { label: 'Avaliação Média', val: '4.95 / 5.0' }
    ],
    demoHtml: `
      <div class="live-mockup-wrapper">
        <div class="live-mockup-top-banner" style="border-left-color: #84CC16;">
          <div class="live-mockup-meta">
            <span class="live-status-badge" style="background: rgba(132, 204, 22, 0.18); color: #84CC16; border-color: rgba(132, 204, 22, 0.35);">
              PROJETO AO VIVO ENTREGUE
            </span>
            <h3 class="live-mockup-title">Soundar - Fones Wireless & Áudio Hi-Fi</h3>
            <p class="live-mockup-sub">Role abaixo para inspecionar a interface completa entregue ao cliente.</p>
          </div>
          <div class="live-mockup-actions">
            <a href="/projects/soundar-headphones.png" target="_blank" rel="noopener noreferrer" class="btn-view-fullscreen" title="Abrir Imagem em Alta Resolução">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>
              <span>Ver Imagem Completa</span>
            </a>
            <a href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostei%20do%20site%20da%20Soundar%20e%20gostaria%20de%20um%20or%C3%A7amento." target="_blank" rel="noopener noreferrer" class="btn-live-contact" style="background: #84CC16; color: #080A0F;">
              <span>Solicitar Modelo Semelhante</span>
            </a>
          </div>
        </div>

        <div class="live-mockup-viewport-scroll">
          <!-- Authentic Full Mockup Image Sent by User -->
          <img src="/projects/soundar-headphones.png" alt="Soundar Audio - Mockup Completo do Site" class="live-mockup-full-image" loading="lazy" />

          <!-- Video Showcase Player Box -->
          <div class="live-video-showcase-box">
            <div class="live-video-header">
              <span class="video-rec-dot"></span>
              <span>DEMONSTRAÇÃO DE MOTION & VÍDEO INTERATIVO 4K</span>
            </div>
            <div class="live-video-player-container">
              <video class="live-modal-video" data-project="soundar" autoplay loop muted playsinline controls poster="/projects/soundar-headphones.png">
                <source src="/projects/soundar-headphones.webm" type="video/webm">
              </video>
            </div>
          </div>
        </div>
      </div>
    `
  }
];

/**
 * Calculates whether a background color is dark or light according to WCAG luminance
 * Returns 'dark' or 'light'
 */
export function getBrandContrastMode(hexColor) {
  if (!hexColor) return 'dark';
  let c = hexColor.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(ch => ch + ch).join('');
  }
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? 'light' : 'dark';
}
