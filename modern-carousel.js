/**
 * Modern High-Conversion 3D Portfolio Carousel
 * Supports HD Images, Native Video Player (Elementor Reel), Touch/Swipe, and Dynamic Brand Theming
 */

import { PROJECTS_DATA, getBrandContrastMode } from './projectsData.js';
import { VideoShowcaseEngine } from './video-showcase-engine.js';

export class ModernPortfolioCarousel {
  constructor(container, onSelectCallback, onOpenProjectCallback) {
    this.container = container;
    this.onSelectCallback = onSelectCallback;
    this.onOpenProjectCallback = onOpenProjectCallback;
    this.projects = PROJECTS_DATA;
    this.activeIndex = 0;
    this.videoEngines = new Map();
    
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
          
          <!-- Card Header Bar (Design Profissional & Minimalista) -->
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
                <video class="card-html5-video" data-video-id="${project.id}" playsinline muted loop autoplay poster="${project.posterUrl}">
                  <source src="${project.mediaUrl}" type="video/webm">
                </video>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

        </div>
      </article>
    `;
  }

  setupVideoCards() {
    this.videoEngines = new Map();

    const videoContainers = this.container.querySelectorAll('.card-video-container');
    videoContainers.forEach(container => {
      const videoElem = container.querySelector('.card-html5-video');
      const toggleBtn = container.querySelector('.video-play-toggle-btn');
      const progressFill = container.querySelector('.video-timeline-progress');
      const projectId = videoElem ? videoElem.dataset.videoId : null;

      if (projectId && videoElem) {
        const engine = new VideoShowcaseEngine(projectId, videoElem, {
          progressFill,
          playToggleBtn: toggleBtn
        });
        this.videoEngines.set(projectId, engine);
      }
    });
  }

  updateCarousel(newIndex) {
    const total = this.cards.length;
    this.activeIndex = Math.max(0, Math.min(total - 1, newIndex));
    const activeProject = this.projects[this.activeIndex];

    // Apply CSS 3D Transforms to each card
    this.cards.forEach((card, i) => {
      const offset = i - this.activeIndex;
      const absOffset = Math.abs(offset);

      card.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next');

      if (offset === 0) {
        card.classList.add('active');
        card.style.transform = `translateX(0) scale(1) translateZ(0)`;
        card.style.opacity = '1';
        card.style.zIndex = '10';
        card.style.filter = 'none';
      } else if (offset === -1) {
        card.classList.add('prev');
        card.style.transform = `translateX(-65%) scale(0.86) rotateY(18deg) translateZ(-80px)`;
        card.style.opacity = '0.65';
        card.style.zIndex = '5';
        card.style.filter = 'brightness(0.75) blur(0.5px)';
      } else if (offset === 1) {
        card.classList.add('next');
        card.style.transform = `translateX(65%) scale(0.86) rotateY(-18deg) translateZ(-80px)`;
        card.style.opacity = '0.65';
        card.style.zIndex = '5';
        card.style.filter = 'brightness(0.75) blur(0.5px)';
      } else if (offset < -1) {
        card.classList.add('far-prev');
        card.style.transform = `translateX(-120%) scale(0.72) rotateY(28deg) translateZ(-160px)`;
        card.style.opacity = '0.2';
        card.style.zIndex = '1';
        card.style.filter = 'brightness(0.5) blur(2px)';
      } else if (offset > 1) {
        card.classList.add('far-next');
        card.style.transform = `translateX(120%) scale(0.72) rotateY(-28deg) translateZ(-160px)`;
        card.style.opacity = '0.2';
        card.style.zIndex = '1';
        card.style.filter = 'brightness(0.5) blur(2px)';
      }
    });

    // Update Pagination Dots
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.activeIndex);
    });

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
      this.btnPrev.addEventListener('click', () => this.prev());
    }
    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => this.next());
    }

    // Pagination pill clicks
    this.dots.forEach((pill) => {
      pill.addEventListener('click', () => {
        const idx = parseInt(pill.dataset.index, 10);
        this.selectIndex(idx);
      });
    });

    // Card interactions
    this.cards.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        const isExploreBtn = e.target.closest('[data-action="open-modal"]');
        if (idx === this.activeIndex || isExploreBtn) {
          // If already active or clicked explore button, open Live Preview Modal
          if (this.onOpenProjectCallback) {
            this.onOpenProjectCallback(this.projects[idx]);
          }
        } else {
          // If clicked a side card, bring it to focus
          this.selectIndex(idx);
        }
      });
    });

    // Touch & Pointer Drag Gestures
    const stage = this.container.querySelector('#carousel-3d-stage');
    if (!stage) return;

    stage.addEventListener('pointerdown', (e) => {
      // Don't drag if clicking buttons or controls
      if (e.target.closest('button') || e.target.closest('select')) return;
      this.isDragging = true;
      this.startX = e.clientX;
      stage.style.cursor = 'grabbing';
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const diffX = e.clientX - this.startX;
      if (Math.abs(diffX) > 10) {
        // user is swiping
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      stage.style.cursor = '';
      const diffX = e.clientX - this.startX;

      if (diffX > this.threshold) {
        this.prev();
      } else if (diffX < -this.threshold) {
        this.next();
      }
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
      // Only navigate carousel if modal is not open
      const modal = document.getElementById('project-modal');
      if (modal && modal.classList.contains('open')) return;

      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });
  }
}
