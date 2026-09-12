/**
 * Awwwards Design System & Kinetic Micro-Interactions
 * LocalWeb Pro - Executive Tier
 * Features:
 * 1. Cursor Spotlight (Mouse-reactive border & surface lighting on cards)
 * 2. Magnetic Buttons (Subtle cursor-following spring physics)
 * 3. Animated Metric Counters (Smooth number tweening on viewport entrance)
 * 4. Viewport Scroll Progress Bar (Ultra-thin titanium hairline at top of screen)
 * 5. Smooth Scroll Reveal (Staggered intersection observer with cubic-bezier ease)
 */

export function initAwwwardsEffects() {
  initScrollProgressBar();
  initCursorSpotlight();
  initMagneticButtons();
  initMetricCounterAnimation();
  initScrollReveal();
}

/**
 * 1. Scroll Progress Bar (Top Hairline)
 */
function initScrollProgressBar() {
  if (document.getElementById('awwwards-scroll-progress')) return;

  const bar = document.createElement('div');
  bar.id = 'awwwards-scroll-progress';
  bar.className = 'awwwards-scroll-progress-bar';
  document.body.prepend(bar);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        bar.style.width = `${progress}%`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/**
 * 2. Cursor Spotlight (Radial light tracking on cards and containers)
 */
function initCursorSpotlight() {
  const spotlightSelector = `
    .metric-card,
    .service-card,
    .price-card,
    .roi-wizard-card,
    .process-step-card,
    .feedback-card,
    .niche-card-modern,
    .faq-item,
    .contact-form-wrapper
  `;

  const cards = document.querySelectorAll(spotlightSelector);
  if (!cards.length) return;

  cards.forEach(card => {
    card.classList.add('awwwards-spotlight');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mouse-x', `-1000px`);
      card.style.setProperty('--mouse-y', `-1000px`);
    }, { passive: true });
  });
}

/**
 * 3. Magnetic Interactive Buttons
 */
function initMagneticButtons() {
  // Only enable magnetic pull on pointer/mouse devices (not touch screens)
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

  const magneticSelector = `
    .btn-primary-lg,
    .btn-secondary-lg,
    .btn-primary-sm,
    .carousel-ctrl-btn,
    .theme-toggle-btn,
    .roi-step-calc-btn
  `;

  const buttons = document.querySelectorAll(magneticSelector);

  buttons.forEach(btn => {
    btn.classList.add('awwwards-magnetic');

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from center (-1 to 1 range approx)
      const deltaX = (e.clientX - centerX) * 0.28;
      const deltaY = (e.clientY - centerY) * 0.28;

      btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }, { passive: true });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    }, { passive: true });
  });
}

/**
 * 4. Animated Metric Counters
 */
function initMetricCounterAnimation() {
  const metrics = document.querySelectorAll('.metric-num');
  if (!metrics.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent.trim();

        // Check if numerical like +300% or 100%
        if (text.includes('300')) {
          animateCount(el, 0, 300, 1400, '+', '%');
        } else if (text === '100%') {
          animateCount(el, 0, 100, 1200, '', '%');
        }

        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  metrics.forEach(m => observer.observe(m));
}

function animateCount(element, start, end, duration, prefix = '', suffix = '') {
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    // Easing out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (end - start) * eased);
    element.textContent = `${prefix}${current}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = `${prefix}${end}${suffix}`;
    }
  }

  window.requestAnimationFrame(step);
}

/**
 * 5. Smooth Scroll Reveal on Viewport Entry
 */
function initScrollReveal() {
  const revealTargets = document.querySelectorAll(`
    .section-header,
    .service-card,
    .process-step-card,
    .price-card,
    .faq-item,
    .metric-card,
    .contact-form-wrapper,
    .contact-info
  `);

  if (!revealTargets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealTargets.forEach((el, i) => {
    el.classList.add('awwwards-reveal');
    // Stagger child elements in grids
    const parent = el.parentElement;
    if (parent && (parent.classList.contains('services-grid') || parent.classList.contains('pricing-grid') || parent.classList.contains('process-grid') || parent.classList.contains('trust-metrics-grid'))) {
      const index = Array.from(parent.children).indexOf(el);
      el.style.transitionDelay = `${index * 0.09}s`;
    }
    observer.observe(el);
  });
}
