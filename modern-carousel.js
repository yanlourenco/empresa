/**
 * Modern High-Conversion 3D Portfolio Carousel
 * Supports HD Images, Native Video Player (Elementor Reel), Touch/Swipe, and Dynamic Brand Theming
 * Optimized for 60fps silky smooth scrolling and low memory usage
 */

import { PROJECTS_DATA } from './projectsData.js';
import { VideoShowcaseEngine } from './video-showcase-engine.js';

export class ModernPortfolioCarousel {
  constructor(container, onSelectCallback, onOpenProjectCallback) {
    this.container = container;
    this.onSelectCallback = onSelectCallback;
    this.onOpenProjectCallback = onOpenProjectCallback;
    this.projects = PROJECTS_DATA;
    this.activeIndex = 0;
    this.videoEngines = new Map();
    this.isStageVisible = true;
    this.globalEventsBound = false;
    
    // Drag/Swipe state
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.threshold = 40; // minimum drag distance in px to trigger slide change

    this.render();
    this.bindEvents();
    this.setupVideoCards();
    this.updateCarousel(0);
  }

  render() {
    this.container.innerHTML = `
      <div class="carousel-3d-stage" id="carousel-3d-stage">
        <div class="carousel-track" id="carousel-track">
          ${this.projects.map((proj, idx) => this.createCardMarkup(proj, idx)).join('')}
        </div>
      </div>

      <div class="carousel-bottom-bar">
        <button class="carousel-ctrl-btn prev" id="c-btn-prev" aria-label="Projeto Anterior" title="Projeto Anterior">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 19l-7-7 7-7"/></svg>
        </button>

        <div class="carousel-pagination-pills" id="carousel-dots-container">
          ${this.projects.map((p, idx) => `
            <button class="carousel-pill ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Ir para ${p.title}">
              <span class="pill-bar"></span>
            </button>
          `).join('')}
        </div>

        <button class="carousel-ctrl-btn next" id="c-btn-next" aria-label="Próximo Projeto" title="Próximo Projeto">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    `;

    this.track = this.container.querySelector('#carousel-track');
    this.cards = Array.from(this.container.querySelectorAll('.carousel-card-item'));
    this.dots = Array.from(this.container.querySelectorAll('.carousel-pill'));
    this.btnPrev = this.container.querySelector('#c-btn-prev');
    this.btnNext = this.container.querySelector('#c-btn-next');
  }

  createCardMarkup(project, index) {
    const isVideo = project.mediaType === 'video';

    return `
      <article class="carousel-card-item ${index === 0 ? 'active' : ''}" data-index="${index}" style="--brand-accent: ${project.primaryColor}">
        <div class="card-glass-wrapper">
          
          <!-- Card Header Bar -->
          <div class="card-browser-bar">
            <div class="card-url-pill">
              <svg class="lock-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <span>${project.id}.localwebpro.com.br</span>
            </div>
            ${isVideo ? `<span class="card-badge-video">${project.videoBadge || 'VÍDEO SHOWCASE'}</span>` : `<span class="card-badge-niche">${project.niche.split('&')[0]}</span>`}
          </div>

          <!-- Card Media Viewport -->
          <div class="card-media-viewport">
            ${isVideo ? `
              <div class="card-video-container" id="video-box-${project.id}">
                <canvas class="card-html5-video card-showcase-canvas" data-video-id="${project.id}" width="800" height="500"></canvas>
                <div class="video-overlay-controls">
                  <button class="video-play-toggle-btn" data-video-toggle="${project.id}" title="Pausar / Reproduzir Vídeo">
                    <svg class="icon-pause" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    <svg class="icon-play" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                  <div class="video-timeline-bar">
                    <div class="video-timeline-progress" data-video-progress="${project.id}"></div>
                  </div>
                  <span class="video-time-tag">REEL 4K</span>
                </div>
              </div>
            ` : `
              <div class="card-image-box">
                <img src="${project.mediaUrl}" alt="${project.title}" class="card-mockup-img" loading="lazy" />
                <div class="card-hover-overlay">
                  <span class="hover-action-text">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>
                    Clique para Explorar Live
                  </span>
                </div>
              </div>
            `}
          </div>

          <!-- Card Info Meta Strip -->
          <div class="card-footer-strip">
            <div class="card-footer-meta">
              <span class="card-client-tag">${project.clientRole}</span>
              <h3 class="card-title">${project.title}</h3>
              <p class="card-result-highlight">
                <span class="metric-bullet" style="background: ${project.primaryColor}"></span>
                ${project.resultsMetric}
              </p>
            </div>
            
            <button class="card-explore-btn" data-action="open-modal" title="Abrir Demonstração Ao Vivo">
              <span>Explorar</span>
            </button>
          </div>

        </div>
      </article>
    `;
  }

  setupVideoCards() {
    // Clean up any previously created engines to avoid memory/canvas leaks
    if (this.videoEngines) {
      this.videoEngines.forEach(engine => engine.destroy());
      this.videoEngines.clear();
    } else {
      this.videoEngines = new Map();
    }

    const videoContainers = this.container.querySelectorAll('.card-video-container');
    videoContainers.forEach(container => {
      const mediaElem = container.querySelector('.card-showcase-canvas') || container.querySelector('.card-html5-video');
      const toggleBtn = container.querySelector('.video-play-toggle-btn');
      const progressFill = container.querySelector('.video-timeline-progress');
      const projectId = mediaElem ? (mediaElem.dataset.videoId || mediaElem.dataset.project) : null;

      if (projectId && mediaElem) {
        const engine = new VideoShowcaseEngine(projectId, mediaElem, {
          progressFill,
          playToggleBtn: toggleBtn,
          autoPlay: false // Started explicitly based on active index & viewport
        });
        this.videoEngines.set(projectId, engine);
      }
    });
  }

  syncActiveVideoPlayback() {
    const activeProject = this.projects[this.activeIndex];
    const isVisible = this.isStageVisible !== false;

    this.videoEngines.forEach((engine, projectId) => {
      if (projectId === activeProject.id && isVisible) {
        engine.play();
      } else {
        engine.pause();
      }
    });
  }

  setupIntersectionObserver() {
    const stage = this.container.querySelector('#carousel-3d-stage');
    if (!stage || !('IntersectionObserver' in window)) return;

    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isStageVisible = entry.isIntersecting;
        this.syncActiveVideoPlayback();
      });
    }, { threshold: 0.15 });

    this.observer.observe(stage);
  }

  updateCarousel(newIndex) {
    const total = this.cards.length;
    this.activeIndex = Math.max(0, Math.min(total - 1, newIndex));
    const activeProject = this.projects[this.activeIndex];

    // Detect viewport size for optimal responsive positioning
    const isMobile = window.innerWidth <= 640;
    const isTablet = window.innerWidth <= 900;

    // Apply CSS 3D Transforms to each card (using pure transforms and brightness, avoiding expensive GPU blur shaders)
    this.cards.forEach((card, i) => {
      const offset = i - this.activeIndex;
      card.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next');

      if (offset === 0) {
        card.classList.add('active');
        card.style.transform = `translateX(0) scale(1) translateZ(0)`;
        card.style.opacity = '1';
        card.style.zIndex = '10';
        card.style.filter = 'none';
        card.style.pointerEvents = 'auto';
      } else if (offset === -1) {
        card.classList.add('prev');
        const tx = isMobile ? '-50%' : (isTablet ? '-58%' : '-65%');
        const sc = '0.86';
        const rot = isMobile ? '12deg' : '18deg';
        const tz = isMobile ? '-40px' : '-80px';
        card.style.transform = `translateX(${tx}) scale(${sc}) rotateY(${rot}) translateZ(${tz})`;
        card.style.opacity = isMobile ? '0.35' : '0.65';
        card.style.zIndex = '5';
        card.style.filter = 'brightness(0.8)';
        card.style.pointerEvents = 'auto';
      } else if (offset === 1) {
        card.classList.add('next');
        const tx = isMobile ? '50%' : (isTablet ? '58%' : '65%');
        const sc = '0.86';
        const rot = isMobile ? '-12deg' : '-18deg';
        const tz = isMobile ? '-40px' : '-80px';
        card.style.transform = `translateX(${tx}) scale(${sc}) rotateY(${rot}) translateZ(${tz})`;
        card.style.opacity = isMobile ? '0.35' : '0.65';
        card.style.zIndex = '5';
        card.style.filter = 'brightness(0.8)';
        card.style.pointerEvents = 'auto';
      } else if (offset < -1) {
        card.classList.add('far-prev');
        const tx = isMobile ? '-90%' : '-120%';
        card.style.transform = `translateX(${tx}) scale(0.72) rotateY(24deg) translateZ(-140px)`;
        card.style.opacity = isMobile ? '0' : '0.2';
        card.style.zIndex = '1';
        card.style.filter = 'brightness(0.5)';
        card.style.pointerEvents = 'none';
      } else if (offset > 1) {
        card.classList.add('far-next');
        const tx = isMobile ? '90%' : '120%';
        card.style.transform = `translateX(${tx}) scale(0.72) rotateY(-24deg) translateZ(-140px)`;
        card.style.opacity = isMobile ? '0' : '0.2';
        card.style.zIndex = '1';
        card.style.filter = 'brightness(0.5)';
        card.style.pointerEvents = 'none';
      }
    });

    // Update Pagination Dots
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.activeIndex);
    });

    // Run active animation only on the currently focused card
    this.syncActiveVideoPlayback();

    // Notify listeners (Background transition & Feedback panel)
    if (this.onSelectCallback) {
      this.onSelectCallback(activeProject, this.activeIndex);
    }
  }

  selectIndex(idx) {
    this.updateCarousel(idx);
  }

  prev() {
    const target = this.activeIndex > 0 ? this.activeIndex - 1 : this.projects.length - 1;
    this.updateCarousel(target);
  }

  next() {
    const target = this.activeIndex < this.projects.length - 1 ? this.activeIndex + 1 : 0;
    this.updateCarousel(target);
  }

  bindEvents() {
    // Navigation buttons
    if (this.btnPrev) {
      this.btnPrev.onclick = () => this.prev();
    }
    if (this.btnNext) {
      this.btnNext.onclick = () => this.next();
    }

    // Pagination pill clicks
    this.dots.forEach((pill) => {
      pill.onclick = () => {
        const idx = parseInt(pill.dataset.index, 10);
        this.selectIndex(idx);
      };
    });

    // Card interactions
    this.cards.forEach((card, idx) => {
      card.onclick = (e) => {
        const isExploreBtn = e.target.closest('[data-action="open-modal"]');
        if (idx === this.activeIndex || isExploreBtn) {
          if (this.onOpenProjectCallback) {
            this.onOpenProjectCallback(this.projects[idx]);
          }
        } else {
          this.selectIndex(idx);
        }
      };
    });

    // Touch & Pointer Drag Gestures
    const stage = this.container.querySelector('#carousel-3d-stage');
    if (stage) {
      stage.onpointerdown = (e) => {
        if (e.target.closest('button') || e.target.closest('select')) return;
        this.isDragging = true;
        this.startX = e.clientX;
        stage.style.cursor = 'grabbing';
      };
    }

    this.setupIntersectionObserver();

    // Attach global window listeners only once to prevent memory leaks across updates
    if (this.globalEventsBound) return;
    this.globalEventsBound = true;

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
    }, { passive: true });

    window.addEventListener('pointerup', (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const stageEl = this.container.querySelector('#carousel-3d-stage');
      if (stageEl) stageEl.style.cursor = '';
      const diffX = e.clientX - this.startX;

      if (diffX > this.threshold) {
        this.prev();
      } else if (diffX < -this.threshold) {
        this.next();
      }
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
      const modal = document.getElementById('project-modal');
      if (modal && modal.classList.contains('open')) return;

      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Window resize / orientation change listener
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.updateCarousel(this.activeIndex);
      }, 100);
    }, { passive: true });
  }

  updateProjects(newProjects) {
    if (!newProjects || newProjects.length === 0) return;
    this.projects = newProjects.map(p => ({
      id: p.id,
      title: p.title,
      clientName: p.client_name || p.clientName,
      clientRole: p.client_role || p.clientRole || 'Cliente Satisfeito',
      avatarInitials: p.avatar_initials || p.avatarInitials || 'CL',
      niche: p.niche || 'Geral',
      primaryColor: p.primary_color || p.primaryColor || '#2563EB',
      bgTint: p.bg_tint || p.bgTint || 'rgba(37, 99, 235, 0.2)',
      bgSection: p.bg_section || p.bgSection || '#090E17',
      bgSectionLight: p.bg_section_light || p.bgSectionLight || '#F1F5F9',
      bgTintLight: p.bg_tint_light || p.bgTintLight || 'rgba(37, 99, 235, 0.12)',
      mediaType: p.media_type || p.mediaType || 'image',
      mediaUrl: p.media_url || p.mediaUrl || p.full_mockup_url || '/projects/dovena-medical.jpg',
      fullMockupUrl: p.full_mockup_url || p.fullMockupUrl || p.media_url || '/projects/dovena-medical.jpg',
      liveUrl: p.live_url || p.liveUrl || 'https://localwebpro.com.br',
      deliveryTime: p.delivery_time || p.deliveryTime || '5 Dias Úteis',
      resultsMetric: p.results_metric || p.resultsMetric || '+200% Conversões',
      description: p.description || '',
      feedback: p.feedback || '',
      rating: p.rating || 5,
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : (p.tags || []),
      stats: typeof p.stats === 'string' ? JSON.parse(p.stats || '[]') : (p.stats || []),
      demoHtml: p.demo_html || p.demoHtml || ''
    }));
    this.activeIndex = 0;
    this.render();
    this.bindEvents();
    this.setupVideoCards();
    this.updateCarousel(0);
    if (this.onSelectCallback && this.projects[0]) {
      this.onSelectCallback(this.projects[0]);
    }
  }
}
