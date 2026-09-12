import { ModernPortfolioCarousel } from './modern-carousel.js';
import { PROJECTS_DATA, getBrandContrastMode } from './projectsData.js';
import { initStaggerText } from './stagger-text.js';
import { VideoShowcaseEngine } from './video-showcase-engine.js';
import { showLoadingScreen } from './plate-stack-loader.js';
import { initAllLiquidCarve } from './liquid-carve.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Stagger Text Rise Animation System
  initStaggerText();

  // DOM Elements - Feedback & Section
  const projectsSection = document.getElementById('projetos');
  const fbAvatar = document.getElementById('fb-avatar');
  const fbClientName = document.getElementById('fb-client-name');
  const fbClientRole = document.getElementById('fb-client-role');
  const fbQuote = document.getElementById('fb-quote');
  const fbProjectTitle = document.getElementById('fb-project-title');
  const fbDeliveryTime = document.getElementById('fb-delivery-time');
  const fbResultsMetric = document.getElementById('fb-results-metric');

  const btnOpenProjectLive = document.getElementById('btn-open-project-live');
  const carouselContainer = document.getElementById('webgl-carousel-container');

  // DOM Elements - Modal & Device Switcher
  const projectModal = document.getElementById('project-modal');
  const modalUrlDisplay = document.getElementById('modal-url-display');
  const modalExternalLinkBtn = document.getElementById('modal-external-link-btn');
  const projectDemoViewport = document.getElementById('project-demo-viewport');
  const modalViewportFrame = document.getElementById('modal-viewport-frame');
  const btnCloseProjectModal = document.getElementById('btn-close-project-modal');
  const deviceBtns = document.querySelectorAll('.device-btn');

  let currentProject = PROJECTS_DATA[0];
  let carouselInstance = null;
  let currentModalVideoEngine = null;

  // Dynamic WhatsApp Number Configuration (synced with Neon DB & Admin Settings)
  let currentWhatsApp = localStorage.getItem('localweb_whatsapp') || '5511999999999';

  function applyWhatsAppToLinks(number) {
    if (!number) return;
    currentWhatsApp = String(number).replace(/\D/g, '');
    localStorage.setItem('localweb_whatsapp', currentWhatsApp);

    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const updated = href.replace(/wa\.me\/\d+/, `wa.me/${currentWhatsApp}`);
        link.setAttribute('href', updated);
      }
    });
  }

  // Initial apply from cache
  applyWhatsAppToLinks(currentWhatsApp);

  // Fetch updated WhatsApp configuration from Neon DB
  fetch('/api/settings')
    .then(r => r.json())
    .then(data => {
      if (data && data.settings && data.settings.whatsapp_number) {
        applyWhatsAppToLinks(data.settings.whatsapp_number);
      }
    })
    .catch(() => {});

  // Theme Management (Dark / Light Mode)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeLabelText = document.getElementById('theme-label-text');

  function initTheme() {
    const savedTheme = localStorage.getItem('localweb_theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('localweb_theme', theme);

    if (themeLabelText) {
      themeLabelText.textContent = theme === 'light' ? 'Claro' : 'Escuro';
    }

    if (currentProject) {
      applyDynamicBrandTheming(currentProject);
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Set initial theme
  initTheme();

  // Mobile Menu Navigation Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinksContainer = document.getElementById('nav-links');

  if (mobileMenuBtn && navLinksContainer) {
    function closeMobileMenu() {
      navLinksContainer.classList.remove('open');
      mobileMenuBtn.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinksContainer.classList.toggle('open');
      mobileMenuBtn.classList.toggle('open', isOpen);
      mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (navLinksContainer.classList.contains('open')) {
        if (!navLinksContainer.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
          closeMobileMenu();
        }
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinksContainer.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  /**
   * Applies Dynamic Brand Color Background Transition & WCAG Contrast to Projects Section
   */
  function applyDynamicBrandTheming(project) {
    if (!projectsSection || !project) return;

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const isLight = currentTheme === 'light';

    const sectionBg = isLight ? (project.bgSectionLight || '#F1F5F9') : (project.bgSection || '#090E17');
    const activeTint = isLight ? (project.bgTintLight || 'rgba(37, 99, 235, 0.12)') : (project.bgTint || 'rgba(255, 255, 255, 0.15)');

    // Apply primary brand color and tint to CSS custom properties
    projectsSection.style.setProperty('--brand-active-color', project.primaryColor);
    projectsSection.style.setProperty('--brand-active-tint', activeTint);
    projectsSection.style.setProperty('--brand-section-bg', sectionBg);

    // Apply fluid transition to section background and radial gradient
    projectsSection.style.backgroundColor = sectionBg;
    projectsSection.style.backgroundImage = isLight
      ? `radial-gradient(circle at 50% 25%, ${activeTint} 0%, rgba(248, 250, 252, 0.88) 85%)`
      : `radial-gradient(circle at 50% 25%, ${activeTint} 0%, rgba(5, 7, 11, 0.85) 85%)`;

    projectsSection.style.borderTopColor = isLight ? `${project.primaryColor}33` : `${project.primaryColor}55`;
    projectsSection.style.borderBottomColor = isLight ? `${project.primaryColor}33` : `${project.primaryColor}55`;

    // Dynamic brand pill tag in section header
    const tag = document.getElementById('projects-section-tag');
    if (tag) {
      tag.style.color = project.primaryColor;
      tag.style.borderColor = `${project.primaryColor}66`;
      tag.style.backgroundColor = activeTint;
    }

    // Compute contrast mode based on WCAG luminance or light theme
    const contrastMode = isLight ? 'light' : getBrandContrastMode(project.primaryColor);

    if (contrastMode === 'light') {
      projectsSection.classList.add('brand-theme-light');
      projectsSection.classList.remove('brand-theme-dark');
    } else {
      projectsSection.classList.add('brand-theme-dark');
      projectsSection.classList.remove('brand-theme-light');
    }
  }

  /**
   * Updates the feedback display card and carousel brand accents when active project changes
   */
  function updateFeedbackDisplay(project) {
    if (!project) return;
    currentProject = project;

    // Trigger Dynamic Background Transition
    applyDynamicBrandTheming(project);

    // Feedback Avatar & Details with Brand Color
    if (fbAvatar) {
      fbAvatar.textContent = project.avatarInitials;
      fbAvatar.style.backgroundColor = project.primaryColor;
      fbAvatar.style.borderColor = project.primaryColor;
      fbAvatar.style.color = getBrandContrastMode(project.primaryColor) === 'light' ? '#05070B' : '#FFFFFF';
    }
    if (fbClientName) fbClientName.textContent = project.clientName;
    if (fbClientRole) fbClientRole.textContent = project.clientRole;
    if (fbQuote) {
      fbQuote.textContent = `"${project.feedback}"`;
      fbQuote.style.borderLeftColor = project.primaryColor;
    }
    if (fbProjectTitle) fbProjectTitle.textContent = project.title;
    if (fbDeliveryTime) fbDeliveryTime.textContent = project.deliveryTime;
    if (fbResultsMetric) {
      fbResultsMetric.textContent = project.resultsMetric;
      fbResultsMetric.style.color = project.primaryColor;
    }

    // Dynamic border & glow on Feedback Box
    const feedbackBox = document.querySelector('.feedback-card');
    if (feedbackBox) {
      feedbackBox.style.borderColor = project.primaryColor;
      feedbackBox.style.boxShadow = `0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px ${project.bgTint}`;
    }

    // Dynamic Feedback CTA Button
    if (btnOpenProjectLive) {
      btnOpenProjectLive.style.backgroundColor = project.primaryColor;
      btnOpenProjectLive.style.borderColor = project.primaryColor;
      btnOpenProjectLive.style.color = getBrandContrastMode(project.primaryColor) === 'light' ? '#05070B' : '#FFFFFF';
      btnOpenProjectLive.style.boxShadow = `0 8px 24px ${project.bgTint}`;
    }

    // Dynamic border on active carousel card
    const activeCard = document.querySelector('.carousel-card-item.active .card-glass-wrapper');
    if (activeCard) {
      activeCard.style.borderColor = project.primaryColor;
      activeCard.style.boxShadow = `0 28px 65px rgba(0, 0, 0, 0.8), 0 0 35px ${project.bgTint}`;
    }

    // Dynamic pill bar color
    const activePill = document.querySelector('.carousel-pill.active .pill-bar');
    if (activePill) {
      activePill.style.backgroundColor = project.primaryColor;
      activePill.style.boxShadow = `0 0 12px ${project.primaryColor}`;
    }
  }

  /**
   * Opens the Interactive Live Project Demo Modal showing the REAL image/video sent by user
   */
  function openProjectModal(project) {
    const proj = project || currentProject;
    if (!proj) return;

    if (modalUrlDisplay) {
      modalUrlDisplay.textContent = proj.liveUrl.replace('https://', '');
    }
    if (modalExternalLinkBtn) {
      modalExternalLinkBtn.href = proj.fullMockupUrl || proj.mediaUrl;
    }

    // Set viewport: default to mobile if user is on a mobile screen, otherwise desktop
    const isMobileUser = window.innerWidth <= 768;
    const defaultViewport = isMobileUser ? 'mobile' : 'desktop';
    if (modalViewportFrame) {
      modalViewportFrame.className = `modal-viewport-frame viewport-${defaultViewport}`;
    }
    deviceBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.viewport === defaultViewport);
    });

    if (projectDemoViewport) {
      // Render the authentic high-resolution image and video showcase sent by user
      projectDemoViewport.innerHTML = proj.demoHtml;
      applyWhatsAppToLinks(currentWhatsApp);

      // If project has video in modal, ensure it plays smoothly with VideoShowcaseEngine
      const modalVideo = projectDemoViewport.querySelector('.live-modal-video');
      if (modalVideo) {
        if (currentModalVideoEngine) {
          currentModalVideoEngine.destroy();
        }
        currentModalVideoEngine = new VideoShowcaseEngine(proj.id, modalVideo, { autoPlay: true });
      }
    }

    if (projectModal) {
      projectModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      // Pause background carousel video while modal is active
      if (carouselInstance && carouselInstance.videoEngines) {
        carouselInstance.videoEngines.forEach(engine => engine.pause());
      }
    }
  }

  function closeProjectModal() {
    if (currentModalVideoEngine) {
      currentModalVideoEngine.destroy();
      currentModalVideoEngine = null;
    }
    if (projectModal) {
      projectModal.classList.remove('open');
      document.body.style.overflow = '';
      // Resume background carousel video for active card
      if (carouselInstance && typeof carouselInstance.syncActiveVideoPlayback === 'function') {
        carouselInstance.syncActiveVideoPlayback();
      }
    }
  }

  // Initialize Modern Portfolio Carousel
  if (carouselContainer) {
    carouselInstance = new ModernPortfolioCarousel(
      carouselContainer,
      (activeProject) => {
        updateFeedbackDisplay(activeProject);
      },
      (clickedProject) => {
        openProjectModal(clickedProject);
      }
    );

    updateFeedbackDisplay(PROJECTS_DATA[0]);

    // Dynamic Projects Sync with Neon PostgreSQL Database
    fetch('/api/projects')
      .then(res => res.json())
      .then(resData => {
        if (resData && resData.success && resData.data && resData.data.length > 0) {
          carouselInstance.updateProjects(resData.data);
        }
      })
      .catch(() => {});

    // Niche Filter Pills for Projects Showcase
    const nicheFilterBtns = document.querySelectorAll('.niche-filter-pill');
    nicheFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        nicheFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const selectedNiche = btn.dataset.niche;
        if (selectedNiche === 'all') {
          carouselInstance.selectIndex(0);
          return;
        }

        const foundIndex = carouselInstance.projects.findIndex(p => 
          (p.niche && p.niche.toLowerCase().includes(selectedNiche.toLowerCase())) ||
          (p.title && p.title.toLowerCase().includes(selectedNiche.toLowerCase()))
        );

        if (foundIndex !== -1) {
          carouselInstance.selectIndex(foundIndex);
        }
      });
    });
  }

  // Modal Fullscreen Toggle
  const btnModalFullscreen = document.getElementById('btn-modal-fullscreen');
  if (btnModalFullscreen && projectModal) {
    btnModalFullscreen.addEventListener('click', () => {
      const isFull = projectModal.classList.toggle('modal-fullscreen');
      const span = btnModalFullscreen.querySelector('span');
      if (span) span.textContent = isFull ? 'Restaurar' : 'Tela Cheia';
    });
  }

  // Open Project Modal Button
  if (btnOpenProjectLive) {
    btnOpenProjectLive.addEventListener('click', () => {
      openProjectModal(currentProject);
    });
  }

  // Modal Device Switcher Handlers (Desktop / Tablet / Mobile)
  deviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      deviceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const viewport = btn.dataset.viewport;
      if (modalViewportFrame) {
        modalViewportFrame.className = `modal-viewport-frame viewport-${viewport}`;
      }
    });
  });

  // Close Modal Events
  if (btnCloseProjectModal) btnCloseProjectModal.addEventListener('click', closeProjectModal);

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
  });

  // Active Navigation Link Scroll Tracking (rAF throttled + passive to prevent layout thrashing)
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let isNavScrollTicking = false;

  window.addEventListener('scroll', () => {
    if (!isNavScrollTicking) {
      window.requestAnimationFrame(() => {
        let current = '';
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
          }
        });

        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });

        isNavScrollTicking = false;
      });
      isNavScrollTicking = true;
    }
  }, { passive: true });

  // ==========================================================================
  // BALÃO CUSTOMIZADO DE VALIDAÇÃO (Substitui o Tooltip Nativo do Navegador)
  // ==========================================================================
  function showCustomValidation(input, customMessage) {
    if (!input) return;

    clearValidationBubble();

    const msg = customMessage || input.dataset.errorMsg || input.validationMessage || 'Preencha este campo.';

    input.classList.add('input-error');

    const bubble = document.createElement('div');
    bubble.className = 'custom-validation-bubble';
    bubble.id = 'active-validation-bubble';
    bubble.setAttribute('role', 'alert');
    bubble.innerHTML = `
      <div class="bubble-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="14"></line>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      </div>
      <span class="bubble-text">${msg}</span>
    `;

    const parentGroup = input.closest('.form-group') || input.parentElement;
    if (parentGroup) {
      parentGroup.style.position = 'relative';
      parentGroup.appendChild(bubble);

      const topPos = input.offsetTop + input.offsetHeight + 6;
      const leftPos = Math.max(0, input.offsetLeft + 4);
      bubble.style.top = `${topPos}px`;
      bubble.style.left = `${leftPos}px`;
    } else {
      document.body.appendChild(bubble);
      const rect = input.getBoundingClientRect();
      bubble.style.position = 'fixed';
      bubble.style.top = `${rect.bottom + 6}px`;
      bubble.style.left = `${rect.left + 4}px`;
    }

    input.focus();

    function onInputClear() {
      input.classList.remove('input-error');
      clearValidationBubble();
      input.removeEventListener('input', onInputClear);
      input.removeEventListener('change', onInputClear);
    }
    input.addEventListener('input', onInputClear);
    input.addEventListener('change', onInputClear);
  }

  function clearValidationBubble() {
    const existing = document.getElementById('active-validation-bubble');
    if (existing) existing.remove();
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  }

  // Intercepta evento nativo HTML5 'invalid' em modo capture para evitar o tooltip padrão do sistema
  document.addEventListener('invalid', (e) => {
    e.preventDefault();
    showCustomValidation(e.target);
  }, true);

  // Fecha o balão se o usuário clicar fora
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#active-validation-bubble') && !e.target.classList.contains('input-error')) {
      clearValidationBubble();
    }
  });

  // Contact Form Submission Handler with Neon DB Persistence & WhatsApp
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const companyInput = document.getElementById('company');
      const nicheInput = document.getElementById('niche');
      const phoneInput = document.getElementById('phone');
      const goalInput = document.getElementById('goal');

      const company = companyInput?.value.trim();
      const niche = nicheInput?.value;
      const phone = phoneInput?.value.trim();
      const goal = goalInput?.value.trim();
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      if (!company) {
        showCustomValidation(companyInput, 'Preencha este campo.');
        return;
      }

      if (!phone) {
        showCustomValidation(phoneInput, 'Preencha este campo.');
        return;
      }

      const rawDigits = phone.replace(/\D/g, '');
      if (rawDigits.length < 10) {
        showCustomValidation(phoneInput, 'Insira um número de WhatsApp válido com DDD.');
        return;
      }

      clearValidationBubble();

      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="spinner-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          Registrando solicitação...
        `;
      }

      // Persist lead to Neon PostgreSQL database
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company, niche, phone, goal })
        });
      } catch (err) {
        console.warn('Neon DB lead persistence notice:', err);
      } finally {
        if (submitBtn) {
          submitBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: -2px; margin-right: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Solicitação enviada com sucesso!</span>`;
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }, 3000);
        }
      }

      const msg = `*SOLICITACAO DE ORCAMENTO - LOCALWEB PRO*\n\n` +
                  `*Empresa:* ${company}\n` +
                  `*Nicho:* ${niche}\n` +
                  `*WhatsApp:* ${phone}\n` +
                  `*Objetivo:* ${goal || 'Desenvolver site profissional'}\n\n` +
                  `Gostaria de agendar um orcamento para o meu negocio!`;

      const encodedMsg = encodeURIComponent(msg);
      window.open(`https://wa.me/${currentWhatsApp}?text=${encodedMsg}`, '_blank');
    });
  }

  // ==========================================================================
  // 1. CALCULADORA INTERATIVA DE ROI MULTI-MODO
  // ==========================================================================
  function initRoiCalculator() {
    // Mode tabs
    const modeTabs = document.querySelectorAll('.sim-mode-tab');
    const panels = {
      goal: document.getElementById('sim-panel-goal'),
      direct: document.getElementById('sim-panel-direct'),
      funnel: document.getElementById('sim-panel-funnel'),
      opportunity: document.getElementById('sim-panel-opportunity')
    };

    // Mode 0: Goal elements (Engenharia Reversa por Meta)
    const goalTargetSlider = document.getElementById('goal-target-slider');
    const goalTargetInput = document.getElementById('goal-target-input');
    const goalTicketSlider = document.getElementById('goal-ticket-slider');
    const goalTicketInput = document.getElementById('goal-ticket-input');
    const bpGoalVal = document.getElementById('bp-goal-val');
    const bpClientsNeeded = document.getElementById('bp-clients-needed');
    const bpDailyRate = document.getElementById('bp-daily-rate');

    // Mode 1: Funil elements
    const funnelVisitsSlider = document.getElementById('funnel-visits-slider');
    const funnelVisitsInput = document.getElementById('funnel-visits-input');
    const funnelConvSlider = document.getElementById('funnel-conv-slider');
    const funnelConvInput = document.getElementById('funnel-conv-input');
    const funnelCloseSlider = document.getElementById('funnel-close-slider');
    const funnelCloseInput = document.getElementById('funnel-close-input');
    const funnelTicketSlider = document.getElementById('funnel-ticket-slider');
    const funnelTicketInput = document.getElementById('funnel-ticket-input');

    // Funnel pipeline badges
    const pipVisits = document.getElementById('pip-visits');
    const pipLeads = document.getElementById('pip-leads');
    const pipSales = document.getElementById('pip-sales');
    const pipRevenue = document.getElementById('pip-revenue');

    // Mode 2: Direct elements
    const directClientsSlider = document.getElementById('roi-clients-slider');
    const directClientsInput = document.getElementById('roi-clients-input');
    const directTicketSlider = document.getElementById('roi-ticket-slider');
    const directTicketInput = document.getElementById('roi-ticket-input');
    const nichePills = document.querySelectorAll('.niche-pill');

    // Mode 3: Opportunity elements
    const oppLostSlider = document.getElementById('opp-lost-slider');
    const oppLostInput = document.getElementById('opp-lost-input');
    const oppTicketSlider = document.getElementById('opp-ticket-slider');
    const oppTicketInput = document.getElementById('opp-ticket-input');
    const oppMarginSlider = document.getElementById('opp-margin-slider');
    const oppMarginInput = document.getElementById('opp-margin-input');

    // Result card elements
    const resultsBadge = document.getElementById('roi-results-badge');
    const paybackPill = document.getElementById('roi-payback-pill');
    const highlightLabel = document.getElementById('roi-highlight-label');
    const monthlyResult = document.getElementById('roi-monthly-result');
    const annualResult = document.getElementById('roi-annual-result');
    const kpi1Lbl = document.getElementById('kpi-1-lbl');
    const kpi1Val = document.getElementById('kpi-1-val');
    const kpi2Lbl = document.getElementById('kpi-2-lbl');
    const kpi2Val = document.getElementById('kpi-2-val');
    const kpi3Lbl = document.getElementById('kpi-3-lbl');
    const kpi3Val = document.getElementById('kpi-3-val');
    const compRow1Lbl = document.getElementById('comp-row-1-lbl');
    const compRow1Val = document.getElementById('comp-row-1-val');
    const compRow2Lbl = document.getElementById('comp-row-2-lbl');
    const netReturn = document.getElementById('roi-net-return');
    const btnRoiCta = document.getElementById('btn-roi-cta');
    const btnRoiCtaText = document.getElementById('btn-roi-cta-text');
    const btnExportProposal = document.getElementById('btn-export-proposal');

    if (!funnelVisitsSlider && !directClientsSlider && !goalTargetSlider) return;

    let currentMode = document.querySelector('.sim-mode-tab.active')?.dataset.mode || 'goal';

    // Helper: sync active chip state for a given input
    function syncChipsForInput(input) {
      if (!input) return;
      const targetId = input.id;
      const chips = document.querySelectorAll(`.quick-chip[data-target="${targetId}"]`);
      chips.forEach(chip => {
        if (parseFloat(chip.dataset.val) === parseFloat(input.value)) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    }

    // Helper: sync slider <-> number input bidirectionally
    function bindSync(slider, input, onUpdate) {
      if (!slider || !input) return;
      slider.addEventListener('input', () => {
        input.value = slider.value;
        syncChipsForInput(input);
        onUpdate();
      });
      input.addEventListener('input', () => {
        let val = parseFloat(input.value);
        if (isNaN(val)) val = 0;
        slider.value = Math.min(Math.max(val, parseFloat(slider.min)), parseFloat(slider.max));
        syncChipsForInput(input);
        onUpdate();
      });
    }

    // Steppers (+ / -)
    document.querySelectorAll('.stepper-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const step = parseFloat(btn.dataset.step) || 1;
        const targetInput = document.getElementById(targetId);
        if (!targetInput) return;

        let currentVal = parseFloat(targetInput.value) || 0;
        let newVal = currentVal + step;
        const minVal = parseFloat(targetInput.min);
        const maxVal = parseFloat(targetInput.max);

        if (!isNaN(minVal) && newVal < minVal) newVal = minVal;
        if (!isNaN(maxVal) && newVal > maxVal) newVal = maxVal;

        targetInput.value = newVal;
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });

    // Quick Preset Chips
    document.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const targetId = chip.dataset.target;
        const val = chip.dataset.val;
        const targetInput = document.getElementById(targetId);
        if (!targetInput) return;

        targetInput.value = val;
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });

    let roiSaveTimeout = null;
    function persistSimulation(simData) {
      if (roiSaveTimeout) clearTimeout(roiSaveTimeout);
      roiSaveTimeout = setTimeout(() => {
        fetch('/api/simulations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(simData)
        }).catch(() => {});
      }, 1800);
    }

    function calculate() {
      let simPayload = {};

      if (currentMode === 'goal') {
        const target = Math.max(500, parseInt(goalTargetInput ? goalTargetInput.value : (goalTargetSlider ? goalTargetSlider.value : '10000'), 10) || 10000);
        const ticket = Math.max(10, parseInt(goalTicketInput ? goalTicketInput.value : (goalTicketSlider ? goalTicketSlider.value : '250'), 10) || 250);

        const clients = Math.max(1, Math.round(target / ticket));
        const dailyRate = clients / 30;
        const weeklyRate = clients / 4.33;
        const annual = target * 12;
        const net = annual - 1200;
        const dailyRevenue = target / 30;
        const paybackDays = dailyRevenue > 0 ? Math.max(1, Math.round(1200 / dailyRevenue)) : 30;
        const multiplier = (annual / 1200).toFixed(1);

        // Blueprint card real-time display
        if (bpGoalVal) bpGoalVal.textContent = `R$ ${target.toLocaleString('pt-BR')}/mês`;
        if (bpClientsNeeded) bpClientsNeeded.textContent = `${clients} ${clients === 1 ? 'venda/mês' : 'vendas/mês'}`;
        if (bpDailyRate) {
          if (dailyRate >= 1) {
            bpDailyRate.textContent = `~${dailyRate.toFixed(1)} venda/dia`;
          } else {
            bpDailyRate.textContent = `~${Math.max(1, Math.round(weeklyRate))} vendas/sem`;
          }
        }

        // Result card
        if (resultsBadge) resultsBadge.textContent = 'Projeção Financeira por Meta';
        if (paybackPill) paybackPill.textContent = `Payback em ${paybackDays} dias`;
        if (highlightLabel) highlightLabel.textContent = 'Faturamento Mensal Adicional Projetado:';
        if (monthlyResult) monthlyResult.innerHTML = `R$ ${target.toLocaleString('pt-BR')}<small>/mês</small>`;
        if (annualResult) annualResult.innerHTML = `Equivalente a <strong>R$ ${annual.toLocaleString('pt-BR')},00</strong> anuais em novas receitas`;

        if (kpi1Lbl) kpi1Lbl.textContent = 'Demanda Necessária';
        if (kpi1Val) kpi1Val.textContent = `${clients} ${clients === 1 ? 'venda/mês' : 'vendas/mês'}`;
        if (kpi2Lbl) kpi2Lbl.textContent = 'Ritmo de Conversão';
        if (kpi2Val) kpi2Val.textContent = dailyRate >= 1 ? `~${dailyRate.toFixed(1)} /dia` : `~${Math.max(1, Math.round(weeklyRate))} /sem`;
        if (kpi3Lbl) kpi3Lbl.textContent = 'Eficiência de Capital (ROI)';
        if (kpi3Val) kpi3Val.textContent = `${multiplier}x ao ano`;

        if (compRow1Lbl) compRow1Lbl.textContent = 'Aporte de Setup do Site:';
        if (compRow1Val) compRow1Val.textContent = 'R$ 1.200';
        if (compRow2Lbl) compRow2Lbl.textContent = 'Retorno Líquido Projetado (1º Ano):';
        if (netReturn) netReturn.textContent = `+ R$ ${net.toLocaleString('pt-BR')},00`;
        if (btnRoiCtaText) btnRoiCtaText.textContent = 'Iniciar Projeto para Bater Essa Meta';

        simPayload = {
          niche: `Meta Reversa (R$ ${target}/mês, ${clients} clientes a R$ ${ticket})`,
          clients,
          ticket,
          monthly: target,
          annual,
          paybackDays: `${paybackDays} dias`
        };

      } else if (currentMode === 'funnel') {
        const visits = Math.max(1, parseInt(funnelVisitsInput ? funnelVisitsInput.value : funnelVisitsSlider.value, 10) || 1000);
        const convRate = Math.max(0.1, parseFloat(funnelConvInput ? funnelConvInput.value : funnelConvSlider.value) || 6.0);
        const closeRate = Math.max(1, parseInt(funnelCloseInput ? funnelCloseInput.value : funnelCloseSlider.value, 10) || 25);
        const ticket = Math.max(1, parseInt(funnelTicketInput ? funnelTicketInput.value : funnelTicketSlider.value, 10) || 200);

        const leads = Math.max(1, Math.round(visits * (convRate / 100)));
        const sales = Math.max(1, Math.round(leads * (closeRate / 100)));
        const monthly = sales * ticket;
        const annual = monthly * 12;
        const net = annual - 1200;
        const daily = monthly / 30;
        const paybackDays = daily > 0 ? Math.max(1, Math.round(1200 / daily)) : 30;
        const multiplier = (annual / 1200).toFixed(1);

        // Atualiza display do pipeline visual
        if (pipVisits) pipVisits.textContent = visits.toLocaleString('pt-BR');
        if (pipLeads) pipLeads.textContent = leads.toLocaleString('pt-BR');
        if (pipSales) pipSales.textContent = sales.toLocaleString('pt-BR');
        if (pipRevenue) pipRevenue.textContent = `R$ ${monthly.toLocaleString('pt-BR')}`;

        // Atualiza card de resultados
        if (resultsBadge) resultsBadge.textContent = 'Projeção por Funil de Conversão';
        if (paybackPill) paybackPill.textContent = `Payback em ${paybackDays} dias`;
        if (highlightLabel) highlightLabel.textContent = 'Faturamento Mensal Adicional Projetado:';
        if (monthlyResult) monthlyResult.innerHTML = `R$ ${monthly.toLocaleString('pt-BR')}<small>/mês</small>`;
        if (annualResult) annualResult.innerHTML = `Equivalente a <strong>R$ ${annual.toLocaleString('pt-BR')},00</strong> anuais em novas receitas`;

        if (kpi1Lbl) kpi1Lbl.textContent = 'Demanda Qualificada';
        if (kpi1Val) kpi1Val.textContent = `${leads.toLocaleString('pt-BR')} leads/mês`;
        if (kpi2Lbl) kpi2Lbl.textContent = 'Ritmo de Conversão';
        if (kpi2Val) kpi2Val.textContent = `${sales.toLocaleString('pt-BR')} vendas/mês`;
        if (kpi3Lbl) kpi3Lbl.textContent = 'Eficiência de Capital (ROI)';
        if (kpi3Val) kpi3Val.textContent = `${multiplier}x ao ano`;

        if (compRow1Lbl) compRow1Lbl.textContent = 'Aporte de Setup do Site:';
        if (compRow1Val) compRow1Val.textContent = 'R$ 1.200';
        if (compRow2Lbl) compRow2Lbl.textContent = 'Retorno Líquido Projetado (1º Ano):';
        if (netReturn) netReturn.textContent = `+ R$ ${net.toLocaleString('pt-BR')},00`;
        if (btnRoiCtaText) btnRoiCtaText.textContent = 'Estruturar Funil de Atração para Minha Empresa';

        simPayload = {
          niche: `Funil (${visits} visitas, ${leads} leads, ${sales} vendas)`,
          clients: sales,
          ticket,
          monthly,
          annual,
          paybackDays: `${paybackDays} dias`
        };

      } else if (currentMode === 'direct') {
        const activeNiche = document.querySelector('.niche-pill.active')?.textContent.trim() || 'Geral';
        const clients = Math.max(1, parseInt(directClientsInput ? directClientsInput.value : directClientsSlider.value, 10) || 15);
        const ticket = Math.max(1, parseInt(directTicketInput ? directTicketInput.value : directTicketSlider.value, 10) || 250);

        const monthly = clients * ticket;
        const annual = monthly * 12;
        const net = annual - 1200;
        const daily = monthly / 30;
        const paybackDays = daily > 0 ? Math.max(1, Math.round(1200 / daily)) : 30;
        const multiplier = (annual / 1200).toFixed(1);

        if (resultsBadge) resultsBadge.textContent = 'Projeção Comercial Consolidada';
        if (paybackPill) paybackPill.textContent = `Payback em ${paybackDays} dias`;
        if (highlightLabel) highlightLabel.textContent = 'Faturamento Mensal Adicional Projetado:';
        if (monthlyResult) monthlyResult.innerHTML = `R$ ${monthly.toLocaleString('pt-BR')}<small>/mês</small>`;
        if (annualResult) annualResult.innerHTML = `Equivalente a <strong>R$ ${annual.toLocaleString('pt-BR')},00</strong> anuais em novas receitas`;

        if (kpi1Lbl) kpi1Lbl.textContent = 'Demanda de Clientes';
        if (kpi1Val) kpi1Val.textContent = `${clients.toLocaleString('pt-BR')} novos/mês`;
        if (kpi2Lbl) kpi2Lbl.textContent = 'Ticket Médio';
        if (kpi2Val) kpi2Val.textContent = `R$ ${ticket.toLocaleString('pt-BR')}`;
        if (kpi3Lbl) kpi3Lbl.textContent = 'Eficiência de Capital (ROI)';
        if (kpi3Val) kpi3Val.textContent = `${multiplier}x ao ano`;

        if (compRow1Lbl) compRow1Lbl.textContent = 'Aporte de Setup do Site:';
        if (compRow1Val) compRow1Val.textContent = 'R$ 1.200';
        if (compRow2Lbl) compRow2Lbl.textContent = 'Retorno Líquido Projetado (1º Ano):';
        if (netReturn) netReturn.textContent = `+ R$ ${net.toLocaleString('pt-BR')},00`;
        if (btnRoiCtaText) btnRoiCtaText.textContent = 'Estruturar Captação para Esse Faturamento';

        simPayload = {
          niche: activeNiche,
          clients,
          ticket,
          monthly,
          annual,
          paybackDays: `${paybackDays} dias`
        };

      } else if (currentMode === 'opportunity') {
        const lost = Math.max(1, parseInt(oppLostInput ? oppLostInput.value : oppLostSlider.value, 10) || 12);
        const ticket = Math.max(1, parseInt(oppTicketInput ? oppTicketInput.value : oppTicketSlider.value, 10) || 250);
        const margin = Math.max(5, parseInt(oppMarginInput ? oppMarginInput.value : oppMarginSlider.value, 10) || 45);

        const monthlyLost = lost * ticket;
        const annualLost = monthlyLost * 12;
        const monthlyProfitLost = monthlyLost * (margin / 100);
        const annualProfitLost = monthlyProfitLost * 12;
        const netRecovery = annualProfitLost - 1200;
        const dailyProfit = monthlyProfitLost / 30;
        const paybackDays = dailyProfit > 0 ? Math.max(1, Math.round(1200 / dailyProfit)) : 15;
        const multiplier = (annualProfitLost / 1200).toFixed(1);

        if (resultsBadge) resultsBadge.textContent = 'Auditoria de Custo de Oportunidade';
        if (paybackPill) paybackPill.textContent = `Recuperação em ${paybackDays} dias`;
        if (highlightLabel) highlightLabel.textContent = 'Demanda Deixada na Mesa (Sem Site):';
        if (monthlyResult) monthlyResult.innerHTML = `R$ ${monthlyLost.toLocaleString('pt-BR')}<small>/mês</small>`;
        if (annualResult) annualResult.innerHTML = `Prejuízo anual invisível de <strong>R$ ${annualLost.toLocaleString('pt-BR')},00</strong>`;

        if (kpi1Lbl) kpi1Lbl.textContent = 'Oportunidades Perdidas';
        if (kpi1Val) kpi1Val.textContent = `${lost.toLocaleString('pt-BR')} /mês`;
        if (kpi2Lbl) kpi2Lbl.textContent = `Margem Operacional (${margin}%)`;
        if (kpi2Val) kpi2Val.textContent = `R$ ${Math.round(monthlyProfitLost).toLocaleString('pt-BR')}/mês`;
        if (kpi3Lbl) kpi3Lbl.textContent = 'Eficiência de Retorno';
        if (kpi3Val) kpi3Val.textContent = `${multiplier}x o setup`;

        if (compRow1Lbl) compRow1Lbl.textContent = 'Aporte de Setup do Site:';
        if (compRow1Val) compRow1Val.textContent = 'R$ 1.200';
        if (compRow2Lbl) compRow2Lbl.textContent = 'Lucro Operacional Recuperado (1º Ano):';
        if (netReturn) netReturn.textContent = `+ R$ ${Math.round(netRecovery).toLocaleString('pt-BR')},00`;
        if (btnRoiCtaText) btnRoiCtaText.textContent = 'Recuperar Demanda Perdida na Minha Região';

        simPayload = {
          niche: `Custo Oportunidade (${lost} perdidos, margem ${margin}%)`,
          clients: lost,
          ticket,
          monthly: monthlyLost,
          annual: annualLost,
          paybackDays: `${paybackDays} dias`
        };
      }

      persistSimulation(simPayload);
    }

    // Vincula sincronização slider <-> número
    bindSync(goalTargetSlider, goalTargetInput, calculate);
    bindSync(goalTicketSlider, goalTicketInput, calculate);

    bindSync(funnelVisitsSlider, funnelVisitsInput, calculate);
    bindSync(funnelConvSlider, funnelConvInput, calculate);
    bindSync(funnelCloseSlider, funnelCloseInput, calculate);
    bindSync(funnelTicketSlider, funnelTicketInput, calculate);

    bindSync(directClientsSlider, directClientsInput, calculate);
    bindSync(directTicketSlider, directTicketInput, calculate);

    bindSync(oppLostSlider, oppLostInput, calculate);
    bindSync(oppTicketSlider, oppTicketInput, calculate);
    bindSync(oppMarginSlider, oppMarginInput, calculate);

    // Navegação de abas (Modos de Simulação)
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        currentMode = tab.dataset.mode;
        Object.keys(panels).forEach(key => {
          if (panels[key]) {
            panels[key].classList.toggle('active', key === currentMode);
          }
        });

        // Atualiza rótulos do Stepper conforme o modo
        const lblStep2 = document.getElementById('step-label-2');
        const lblStep3 = document.getElementById('step-label-3');
        if (currentMode === 'goal') {
          if (lblStep2) lblStep2.textContent = 'Meta Alvo';
          if (lblStep3) lblStep3.textContent = 'Ticket Médio';
        } else if (currentMode === 'direct') {
          if (lblStep2) lblStep2.textContent = 'Clientes';
          if (lblStep3) lblStep3.textContent = 'Ticket Médio';
        } else if (currentMode === 'funnel') {
          if (lblStep2) lblStep2.textContent = 'Visitas';
          if (lblStep3) lblStep3.textContent = 'Conversão';
        } else if (currentMode === 'opportunity') {
          if (lblStep2) lblStep2.textContent = 'Perdas';
          if (lblStep3) lblStep3.textContent = 'Ticket & Margem';
        }

        goToStep(1);
        calculate();
      });
    });

    // Pílulas de nicho (Modo Direto)
    nichePills.forEach(pill => {
      pill.addEventListener('click', () => {
        nichePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const ticket = parseInt(pill.dataset.ticket, 10);
        const clients = parseInt(pill.dataset.clients, 10);

        if (directTicketSlider) directTicketSlider.value = ticket;
        if (directTicketInput) directTicketInput.value = ticket;
        if (directClientsSlider) directClientsSlider.value = clients;
        if (directClientsInput) directClientsInput.value = clients;

        calculate();
      });
    });

    // ==========================================================================
    // SISTEMA DO WIZARD POR ETAPAS (ROI STEPPER)
    // ==========================================================================
    let currentStep = 1;
    const stepTabs = document.querySelectorAll('.roi-wizard-step');
    const resultsStepPane = document.getElementById('roi-results-step-pane');
    const modernNicheCards = document.querySelectorAll('.niche-card-modern');

    function goToStep(step) {
      if (step < 1) step = 1;
      if (step > 4) step = 4;
      currentStep = step;

      // Atualiza tabs do stepper e linhas conectoras
      stepTabs.forEach(tab => {
        const s = parseInt(tab.dataset.step, 10);
        tab.classList.toggle('active', s === currentStep);
        tab.classList.toggle('completed', s < currentStep);
      });

      for (let i = 1; i <= 3; i++) {
        const line = document.getElementById(`step-line-${i}`);
        if (line) {
          line.classList.toggle('active', currentStep > i);
        }
      }

      // Oculta todos os painéis de etapas
      document.querySelectorAll('.roi-step-pane').forEach(p => p.classList.remove('active'));

      if (currentStep === 4) {
        // Exibe o painel de resultados do ROI
        if (resultsStepPane) resultsStepPane.classList.add('active');
        calculate();
      } else {
        // Exibe a etapa atual dentro do modo ativo
        const activePanel = document.querySelector('.sim-panel.active');
        if (activePanel) {
          const pane = activePanel.querySelector(`.roi-step-pane[data-step="${currentStep}"]`);
          if (pane) pane.classList.add('active');
        }
      }
    }

    // Botões de navegação das etapas (data-goto)
    document.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetStep = parseInt(btn.dataset.goto, 10);
        if (!isNaN(targetStep)) {
          goToStep(targetStep);
          const wizardCard = document.querySelector('.roi-wizard-card');
          if (wizardCard && window.innerWidth < 820) {
            wizardCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });

    // Clique direto nos marcadores do Stepper
    stepTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetStep = parseInt(tab.dataset.step, 10);
        if (!isNaN(targetStep)) {
          goToStep(targetStep);
        }
      });
    });

    // Cards Modernos de Seleção de Nicho (Etapa 1)
    modernNicheCards.forEach(card => {
      card.addEventListener('click', () => {
        modernNicheCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        const ticket = parseInt(card.dataset.ticket, 10);
        const target = parseInt(card.dataset.target, 10);

        if (goalTicketInput && !isNaN(ticket)) {
          goalTicketInput.value = ticket;
          if (goalTicketSlider) goalTicketSlider.value = ticket;
          syncChipsForInput(goalTicketInput);
        }
        if (goalTargetInput && !isNaN(target)) {
          goalTargetInput.value = target;
          if (goalTargetSlider) goalTargetSlider.value = target;
          syncChipsForInput(goalTargetInput);
        }

        if (directTicketInput && !isNaN(ticket)) {
          directTicketInput.value = ticket;
          if (directTicketSlider) directTicketSlider.value = ticket;
          syncChipsForInput(directTicketInput);
        }

        calculate();
      });
    });

    // Inicia no Passo 1
    goToStep(1);

    // Gerador de Proposta Executiva em PDF (Impressão com 3D Plate Stack Loader)
    if (btnExportProposal) {
      btnExportProposal.addEventListener('click', () => {
        const loader = showLoadingScreen({
          title: 'LOCALWEB PRO',
          message: 'Processando proposta comercial personalizada...',
          baseColor: '#1E293B',
          accentColor: '#38BDF8'
        });

        const elDate = document.getElementById('prop-date');
        const elModeName = document.getElementById('prop-mode-name');
        const elNiche = document.getElementById('prop-niche');
        const elDetailsVal = document.getElementById('prop-details-val');
        const elClientsLabel = document.getElementById('prop-clients-label');
        const elClients = document.getElementById('prop-clients');
        const elTicketLabel = document.getElementById('prop-ticket-label');
        const elTicket = document.getElementById('prop-ticket');
        const elMonthlyLabel = document.getElementById('prop-monthly-label');
        const elMonthly = document.getElementById('prop-monthly');
        const elAnnualLabel = document.getElementById('prop-annual-label');
        const elAnnual = document.getElementById('prop-annual');

        if (elDate) elDate.textContent = new Date().toLocaleDateString('pt-BR');

        if (currentMode === 'goal') {
          const target = parseInt(goalTargetInput ? goalTargetInput.value : '10000', 10);
          const ticket = parseInt(goalTicketInput ? goalTicketInput.value : '250', 10);
          const clients = Math.max(1, Math.round(target / ticket));
          const dailyRate = (clients / 30).toFixed(1);
          const annual = target * 12;

          if (elModeName) elModeName.textContent = 'Engenharia Reversa por Meta de Faturamento';
          if (elNiche) elNiche.textContent = 'Planejamento Estratégico de Crescimento';
          if (elDetailsVal) elDetailsVal.textContent = `Meta mensal de R$ ${target.toLocaleString('pt-BR')},00 requer apenas ${clients} vendas/mês (~${dailyRate} venda/dia com ticket R$ ${ticket.toLocaleString('pt-BR')},00)`;
          if (elClientsLabel) elClientsLabel.textContent = 'Vendas/Clientes Necessários:';
          if (elClients) elClients.textContent = `${clients} clientes/mês (~${dailyRate}/dia)`;
          if (elTicketLabel) elTicketLabel.textContent = 'Ticket Médio de Referência:';
          if (elTicket) elTicket.textContent = `R$ ${ticket.toLocaleString('pt-BR')},00`;
          if (elMonthlyLabel) elMonthlyLabel.textContent = 'Meta de Faturamento Mensal:';
          if (elMonthly) elMonthly.textContent = `R$ ${target.toLocaleString('pt-BR')},00`;
          if (elAnnualLabel) elAnnualLabel.textContent = 'Volume Projetado em 12 Meses:';
          if (elAnnual) elAnnual.textContent = `R$ ${annual.toLocaleString('pt-BR')},00`;

        } else if (currentMode === 'funnel') {
          const visits = parseInt(funnelVisitsInput ? funnelVisitsInput.value : '1000', 10);
          const convRate = parseFloat(funnelConvInput ? funnelConvInput.value : '6');
          const closeRate = parseInt(funnelCloseInput ? funnelCloseInput.value : '25', 10);
          const ticket = parseInt(funnelTicketInput ? funnelTicketInput.value : '200', 10);
          const leads = Math.max(1, Math.round(visits * (convRate / 100)));
          const sales = Math.max(1, Math.round(leads * (closeRate / 100)));
          const monthly = sales * ticket;
          const annual = monthly * 12;

          if (elModeName) elModeName.textContent = 'Funil de Conversão (Tráfego ao WhatsApp)';
          if (elNiche) elNiche.textContent = 'Digital / Tráfego Local Otimizado';
          if (elDetailsVal) elDetailsVal.textContent = `${visits.toLocaleString('pt-BR')} visitas • ${convRate}% conv. WhatsApp (${leads} leads) • ${closeRate}% fechamento (${sales} vendas)`;
          if (elClientsLabel) elClientsLabel.textContent = 'Conversão Efetiva Projetada/Mês:';
          if (elClients) elClients.textContent = `${leads} contatos WhatsApp → ${sales} novos clientes`;
          if (elTicketLabel) elTicketLabel.textContent = 'Ticket Médio de Venda:';
          if (elTicket) elTicket.textContent = `R$ ${ticket.toLocaleString('pt-BR')},00`;
          if (elMonthlyLabel) elMonthlyLabel.textContent = 'Faturamento Mensal Adicional:';
          if (elMonthly) elMonthly.textContent = `R$ ${monthly.toLocaleString('pt-BR')},00`;
          if (elAnnualLabel) elAnnualLabel.textContent = 'Equivalente Anual em Retorno Bruto:';
          if (elAnnual) elAnnual.textContent = `R$ ${annual.toLocaleString('pt-BR')},00`;

        } else if (currentMode === 'direct') {
          const activeNiche = document.querySelector('.niche-pill.active')?.textContent.trim() || 'Geral';
          const clients = parseInt(directClientsInput ? directClientsInput.value : '15', 10);
          const ticket = parseInt(directTicketInput ? directTicketInput.value : '250', 10);
          const monthly = clients * ticket;
          const annual = monthly * 12;

          if (elModeName) elModeName.textContent = 'Estimativa Direta por Vendas & Ticket';
          if (elNiche) elNiche.textContent = activeNiche;
          if (elDetailsVal) elDetailsVal.textContent = `Volume projetado de ${clients} clientes/mês com ticket médio de R$ ${ticket.toLocaleString('pt-BR')},00`;
          if (elClientsLabel) elClientsLabel.textContent = 'Novos Clientes Projetados/Mês:';
          if (elClients) elClients.textContent = `${clients} clientes`;
          if (elTicketLabel) elTicketLabel.textContent = 'Ticket Médio por Cliente:';
          if (elTicket) elTicket.textContent = `R$ ${ticket.toLocaleString('pt-BR')},00`;
          if (elMonthlyLabel) elMonthlyLabel.textContent = 'Faturamento Extra Estimado/Mês:';
          if (elMonthly) elMonthly.textContent = `R$ ${monthly.toLocaleString('pt-BR')},00`;
          if (elAnnualLabel) elAnnualLabel.textContent = 'Equivalente Anual em Retorno Bruto:';
          if (elAnnual) elAnnual.textContent = `R$ ${annual.toLocaleString('pt-BR')},00`;

        } else if (currentMode === 'opportunity') {
          const lost = parseInt(oppLostInput ? oppLostInput.value : '12', 10);
          const ticket = parseInt(oppTicketInput ? oppTicketInput.value : '250', 10);
          const margin = parseInt(oppMarginInput ? oppMarginInput.value : '45', 10);
          const monthlyLost = lost * ticket;
          const annualLost = monthlyLost * 12;
          const annualProfitLost = Math.round(annualLost * (margin / 100));

          if (elModeName) elModeName.textContent = 'Custo de Oportunidade (Vendas Perdidas)';
          if (elNiche) elNiche.textContent = 'Diagnóstico de Perda de Mercado no Google';
          if (elDetailsVal) elDetailsVal.textContent = `Recuperação de ${lost} clientes/mês absorvidos por concorrentes (${margin}% margem líquida)`;
          if (elClientsLabel) elClientsLabel.textContent = 'Clientes Perdidos para Concorrentes:';
          if (elClients) elClients.textContent = `${lost} potenciais clientes/mês`;
          if (elTicketLabel) elTicketLabel.textContent = 'Ticket Médio Deixado na Mesa:';
          if (elTicket) elTicket.textContent = `R$ ${ticket.toLocaleString('pt-BR')},00`;
          if (elMonthlyLabel) elMonthlyLabel.textContent = 'Faturamento Deixado na Mesa/Mês:';
          if (elMonthly) elMonthly.textContent = `R$ ${monthlyLost.toLocaleString('pt-BR')},00`;
          if (elAnnualLabel) elAnnualLabel.textContent = `Lucro Líquido Anual Recuperável (${margin}%):`;
          if (elAnnual) elAnnual.textContent = `R$ ${annualProfitLost.toLocaleString('pt-BR')},00`;
        }

        setTimeout(() => {
          loader.hide(250);
          setTimeout(() => {
            window.print();
          }, 300);
        }, 1600);
      });
    }

    // Clique do CTA do Simulador -> Preenche objetivo no formulário de contato
    if (btnRoiCta) {
      btnRoiCta.addEventListener('click', () => {
        const goalInput = document.getElementById('goal');
        if (!goalInput) return;

        if (currentMode === 'goal') {
          const target = parseInt(goalTargetInput ? goalTargetInput.value : '10000', 10);
          const ticket = parseInt(goalTicketInput ? goalTicketInput.value : '250', 10);
          const clients = Math.max(1, Math.round(target / ticket));
          goalInput.value = `Gostaria de estruturar um site profissional focado em alcançar minha meta de R$ ${target.toLocaleString('pt-BR')}/mês em vendas (preciso de aprox. ${clients} clientes/mês com ticket médio de R$ ${ticket}).`;
        } else if (currentMode === 'funnel') {
          const visits = parseInt(funnelVisitsInput ? funnelVisitsInput.value : '1000', 10);
          const convRate = parseFloat(funnelConvInput ? funnelConvInput.value : '6');
          const closeRate = parseInt(funnelCloseInput ? funnelCloseInput.value : '25', 10);
          const ticket = parseInt(funnelTicketInput ? funnelTicketInput.value : '200', 10);
          const leads = Math.max(1, Math.round(visits * (convRate / 100)));
          const sales = Math.max(1, Math.round(leads * (closeRate / 100)));
          const monthly = sales * ticket;
          goalInput.value = `Gostaria de estruturar um site focado em conversão para gerar aprox. ${leads} leads no WhatsApp e R$ ${monthly.toLocaleString('pt-BR')}/mês em novos clientes (${sales} vendas com ticket R$ ${ticket}).`;
        } else if (currentMode === 'direct') {
          const activeNiche = document.querySelector('.niche-pill.active')?.textContent.trim() || 'meu segmento';
          const clients = parseInt(directClientsInput ? directClientsInput.value : '15', 10);
          const ticket = parseInt(directTicketInput ? directTicketInput.value : '250', 10);
          const monthly = clients * ticket;
          goalInput.value = `Gostaria de estruturar o site para ${activeNiche} com meta de retorno de aprox. R$ ${monthly.toLocaleString('pt-BR')}/mês (${clients} clientes novos a R$ ${ticket}).`;
        } else if (currentMode === 'opportunity') {
          const lost = parseInt(oppLostInput ? oppLostInput.value : '12', 10);
          const ticket = parseInt(oppTicketInput ? oppTicketInput.value : '250', 10);
          const monthlyLost = lost * ticket;
          goalInput.value = `Gostaria de posicionar minha empresa no topo do Google para estancar uma perda estimada de R$ ${monthlyLost.toLocaleString('pt-BR')}/mês em clientes que estão indo para concorrentes.`;
        }

        goalInput.focus();
      });
    }

    calculate();
  }

  // Telemetry event tracking
  function trackEvent(eventType, eventData = {}) {
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          eventData,
          pagePath: window.location.pathname
        })
      }).catch(() => {});
    } catch (_) {}
  }

  // Track page view
  trackEvent('page_view', { referrer: document.referrer, screenWidth: window.innerWidth });

  // Track all WhatsApp clicks
  document.querySelectorAll('a[href*="wa.me"]').forEach(btn => {
    btn.addEventListener('click', () => {
      trackEvent('click_whatsapp', { position: btn.className || 'wa_button' });
    });
  });

  // ==========================================================================
  // 2. FAQ ACORDEÃO INTERATIVO
  // ==========================================================================
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (!question) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close other items
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove('active');
          question.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          question.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ==========================================================================
  // 3. SOCIAL PROOF TOAST (NOTIFICAÇÕES FLUTUANTES)
  // ==========================================================================
  function initSocialProofToasts() {
    const toast = document.getElementById('social-proof-toast');
    const avatar = document.getElementById('toast-avatar');
    const title = document.getElementById('toast-title');
    const time = document.getElementById('toast-time');
    const msg = document.getElementById('toast-msg');
    const btnClose = document.getElementById('btn-close-toast');

    if (!toast) return;

    const events = [
      { avatar: 'BM', title: 'Dovena Farmácia', time: 'há 3 min', msg: 'Atingiu +340% em agendamentos pelo novo site.' },
      { avatar: 'LV', title: 'Barbearia Dark Beard', time: 'há 8 min', msg: '100% da agenda preenchida na 1ª semana do lançamento.' },
      { avatar: 'BG', title: 'Be Greater Studio', time: 'há 15 min', msg: '85 novas matrículas registradas no 1º mês.' },
      { avatar: 'JM', title: 'Jacket Masters', time: 'há 24 min', msg: '+4.8x retenção de clientes e 14.2% em conversão.' },
      { avatar: 'SO', title: 'Soundar Audio', time: 'há 38 min', msg: 'R$ 78.000 em pré-vendas faturadas pelo novo site.' }
    ];

    let currentIndex = 0;
    let toastTimeout = null;

    function showNextToast() {
      const ev = events[currentIndex];
      if (avatar) avatar.textContent = ev.avatar;
      if (title) title.textContent = ev.title;
      if (time) time.textContent = ev.time;
      if (msg) msg.textContent = ev.msg;

      toast.classList.add('visible');

      // Hide after 6 seconds
      toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
      }, 6000);

      currentIndex = (currentIndex + 1) % events.length;
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        toast.classList.remove('visible');
        if (toastTimeout) clearTimeout(toastTimeout);
      });
    }

    // First toast after 4 seconds, then repeat every 20 seconds
    setTimeout(() => {
      showNextToast();
      setInterval(showNextToast, 22000);
    }, 4000);
  }

  // Atalho de Administrador: Ctrl + Shift + A (ou Cmd + Shift + A)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = '/admin-leads.html';
    }
  });

  // Initialize new features
  initRoiCalculator();
  initFaqAccordion();
  initSocialProofToasts();
  initAllLiquidCarve();
});

