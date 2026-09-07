import { ModernPortfolioCarousel } from './modern-carousel.js';
import { PROJECTS_DATA, getBrandContrastMode } from './projectsData.js';
import { initStaggerText } from './stagger-text.js';
import { VideoShowcaseEngine } from './video-showcase-engine.js';
import { initPlateStack, showLoadingScreen } from './plate-stack-loader.js';

// ==========================================================================
// 3D PLATE STACK PRELOADER LIFECYCLE (ORIGINKIT 3D WEBGL)
// ==========================================================================
const preloaderEl = document.getElementById('site-preloader');
const preloaderCanvasBox = document.getElementById('preloader-canvas-container');

if (preloaderEl && preloaderCanvasBox) {
  const plateStackInstance = initPlateStack(preloaderCanvasBox, {
    baseColor: '#334155',
    accentColor: '#38BDF8',
    speed: 71,
    distance: 11,
    stack: {
      count: 5,
      rounded: 26,
      stagger: 250
    }
  });

  const dismissPreloader = () => {
    if (!preloaderEl || preloaderEl.classList.contains('preloader-hidden')) return;
    preloaderEl.classList.add('preloader-hidden');
    setTimeout(() => {
      plateStackInstance.destroy();
      preloaderEl.remove();
    }, 600);
  };

  const minTimer = new Promise(res => setTimeout(res, 850));
  const docReady = new Promise(res => {
    if (document.readyState === 'complete') res();
    else window.addEventListener('load', res, { once: true });
  });

  Promise.all([minTimer, docReady]).then(dismissPreloader);
}

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

  // Contact Form Submission Handler with Neon DB Persistence & WhatsApp
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const company = document.getElementById('company')?.value.trim();
      const niche = document.getElementById('niche')?.value;
      const phone = document.getElementById('phone')?.value.trim();
      const goal = document.getElementById('goal')?.value.trim();
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      if (!company || !phone) {
        alert('Por favor, preencha o Nome da Empresa e o WhatsApp.');
        return;
      }

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
  // 1. CALCULADORA INTERATIVA DE ROI
  // ==========================================================================
  function initRoiCalculator() {
    const clientsSlider = document.getElementById('roi-clients-slider');
    const ticketSlider = document.getElementById('roi-ticket-slider');
    const clientsDisplay = document.getElementById('roi-clients-display');
    const ticketDisplay = document.getElementById('roi-ticket-display');
    const monthlyResult = document.getElementById('roi-monthly-result');
    const annualResult = document.getElementById('roi-annual-result');
    const netReturn = document.getElementById('roi-net-return');
    const paybackPill = document.getElementById('roi-payback-pill');
    const nichePills = document.querySelectorAll('.niche-pill');
    const btnRoiCta = document.getElementById('btn-roi-cta');

    if (!clientsSlider || !ticketSlider) return;

    let roiSaveTimeout = null;
    function persistSimulation() {
      if (roiSaveTimeout) clearTimeout(roiSaveTimeout);
      roiSaveTimeout = setTimeout(() => {
        const activeNiche = document.querySelector('.niche-pill.active')?.textContent.trim() || 'Geral';
        const clients = parseInt(clientsSlider.value, 10);
        const ticket = parseInt(ticketSlider.value, 10);
        const monthly = clients * ticket;
        const annual = monthly * 12;
        const paybackDays = paybackPill ? paybackPill.textContent : '30 dias';

        fetch('/api/simulations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            niche: activeNiche,
            clients,
            ticket,
            monthly,
            annual,
            paybackDays
          })
        }).catch(() => {});
      }, 1800);
    }

    function calculate() {
      const clients = parseInt(clientsSlider.value, 10);
      const ticket = parseInt(ticketSlider.value, 10);

      clientsDisplay.textContent = `${clients} clientes/mês`;
      ticketDisplay.textContent = `R$ ${ticket.toLocaleString('pt-BR')},00`;

      const monthly = clients * ticket;
      const annual = monthly * 12;
      const net = annual - 1200; // Deduct setup cost
      const dailyIncome = monthly / 30;
      const paybackDays = dailyIncome > 0 ? Math.max(1, Math.round(1200 / dailyIncome)) : 90;

      if (monthlyResult) {
        monthlyResult.innerHTML = `R$ ${monthly.toLocaleString('pt-BR')}<small>/mês</small>`;
      }
      if (annualResult) {
        annualResult.innerHTML = `Equivalente a <strong>R$ ${annual.toLocaleString('pt-BR')},00</strong> extras por ano`;
      }
      if (netReturn) {
        netReturn.textContent = `+ R$ ${net.toLocaleString('pt-BR')},00`;
      }
      if (paybackPill) {
        paybackPill.textContent = `Se paga em ${paybackDays} dias`;
      }

      persistSimulation();
    }

    // Slider inputs
    clientsSlider.addEventListener('input', calculate);
    ticketSlider.addEventListener('input', calculate);

    // Niche preset pills
    nichePills.forEach(pill => {
      pill.addEventListener('click', () => {
        nichePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const ticket = parseInt(pill.dataset.ticket, 10);
        const clients = parseInt(pill.dataset.clients, 10);

        if (ticketSlider) ticketSlider.value = ticket;
        if (clientsSlider) clientsSlider.value = clients;

        calculate();
      });
    });

    // Gerador de Proposta Executiva em PDF (Impressão com 3D Loader)
    const btnExportProposal = document.getElementById('btn-export-proposal');
    if (btnExportProposal) {
      btnExportProposal.addEventListener('click', () => {
        const loader = showLoadingScreen({
          title: 'LOCALWEB PRO',
          message: 'Processando proposta executiva em PDF...',
          baseColor: '#1E293B',
          accentColor: '#38BDF8'
        });

        const activeNiche = document.querySelector('.niche-pill.active')?.textContent.trim() || 'Geral';
        const clients = clientsSlider ? clientsSlider.value : '12';
        const ticket = ticketSlider ? parseInt(ticketSlider.value, 10).toLocaleString('pt-BR') : '90';
        const monthly = clientsSlider && ticketSlider ? (parseInt(clientsSlider.value, 10) * parseInt(ticketSlider.value, 10)).toLocaleString('pt-BR') : '1.080';
        const annual = clientsSlider && ticketSlider ? (parseInt(clientsSlider.value, 10) * parseInt(ticketSlider.value, 10) * 12).toLocaleString('pt-BR') : '12.960';

        const elDate = document.getElementById('prop-date');
        const elNiche = document.getElementById('prop-niche');
        const elClients = document.getElementById('prop-clients');
        const elTicket = document.getElementById('prop-ticket');
        const elMonthly = document.getElementById('prop-monthly');
        const elAnnual = document.getElementById('prop-annual');

        if (elDate) elDate.textContent = new Date().toLocaleDateString('pt-BR');
        if (elNiche) elNiche.textContent = activeNiche;
        if (elClients) elClients.textContent = `${clients} novos clientes/mês`;
        if (elTicket) elTicket.textContent = `R$ ${ticket},00`;
        if (elMonthly) elMonthly.textContent = `R$ ${monthly},00`;
        if (elAnnual) elAnnual.textContent = `R$ ${annual},00`;

        setTimeout(() => {
          loader.hide(250);
          setTimeout(() => {
            window.print();
          }, 300);
        }, 900);
      });
    }

    // ROI CTA Click -> Pre-fill Goal in Contact Form
    if (btnRoiCta) {
      btnRoiCta.addEventListener('click', () => {
        const goalInput = document.getElementById('goal');
        const activeNiche = document.querySelector('.niche-pill.active')?.textContent.trim() || 'meu negócio';
        const monthly = parseInt(clientsSlider.value, 10) * parseInt(ticketSlider.value, 10);
        if (goalInput) {
          goalInput.value = `Gostaria de estruturar o site para ${activeNiche} com meta de retorno de aprox. R$ ${monthly.toLocaleString('pt-BR')}/mês em novos clientes.`;
          goalInput.focus();
        }
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

  // Initialize new features
  initRoiCalculator();
  initFaqAccordion();
  initSocialProofToasts();
});

