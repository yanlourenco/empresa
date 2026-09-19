/**
 * PARALLAX & KINETIC EXPERIENCE ENGINE
 * Inspired by designxhand.com/experience (Framer + Lenis + Multi-Plane Cinematic Parallax)
 * 
 * Features:
 * 1. Lenis Smooth Inertia Scrolling with Momentum Physics & Anchor Interception
 * 2. Multi-Plane Hero & Section Scroll Parallax (Background, Midground, Floating Badges)
 * 3. 3D Card Perspective Tilt with Spring Physics & Dynamic Specular Glare
 * 4. Scroll-Driven Storytelling Progress Tracker for Process Steps (Roman Numerals I-IV)
 * 5. Magnetic Floating Metadata Pills with Micro-Parallax
 */

import Lenis from 'lenis';

export class ParallaxExperienceEngine {
  constructor() {
    this.lenis = null;
    this.parallaxElements = [];
    this.tiltCards = [];
    this.rafId = null;
    this.scrollY = 0;
    this.viewportHeight = window.innerHeight;
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
  }

  init() {
    this.initLenis();
    this.initScrollParallax();
    this.initInteractive3DTilt();
    this.initProcessScrollTracker();
    this.initHeroAtmosphere();
    this.bindEvents();
  }

  /**
   * 1. Lenis Smooth Inertia Scroll
   */
  initLenis() {
    try {
      this.lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential luxury ease
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.05,
        smoothTouch: false, // Keep native touch momentum on mobile
        touchMultiplier: 1.4,
        infinite: false,
      });

      window.lenis = this.lenis;

      // Handle Smooth Anchor Navigation
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          if (!href || href === '#') return;

          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            this.lenis.scrollTo(target, {
              offset: -70,
              duration: 1.2,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });

            // Close mobile menu if open
            const navLinks = document.getElementById('nav-links');
            const mobileBtn = document.getElementById('mobile-menu-btn');
            if (navLinks && navLinks.classList.contains('active')) {
              navLinks.classList.remove('active');
              if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
            }
          }
        });
      });

      // Main Animation Frame Loop
      const raf = (time) => {
        this.lenis.raf(time);
        this.updateParallax();
        this.rafId = requestAnimationFrame(raf);
      };
      this.rafId = requestAnimationFrame(raf);

      // Listen to scroll events from Lenis
      this.lenis.on('scroll', (e) => {
        this.scrollY = e.scroll;
        this.updateProcessTracker(e.scroll);
      });
    } catch (err) {
      console.warn('[ParallaxEngine] Lenis fallback to native scroll:', err);
      window.addEventListener('scroll', () => {
        this.scrollY = window.scrollY || window.pageYOffset;
        this.updateParallax();
        this.updateProcessTracker(this.scrollY);
      }, { passive: true });
    }
  }

  /**
   * 2. Hero Atmosphere & Floating Editorial Badges
   */
  initHeroAtmosphere() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    // Check if hero ambient layer already exists
    if (!hero.querySelector('.hero-parallax-backdrop')) {
      const backdrop = document.createElement('div');
      backdrop.className = 'hero-parallax-backdrop';
      backdrop.innerHTML = `
        <div class="hero-orb hero-orb-1" data-parallax="0.18"></div>
        <div class="hero-orb hero-orb-2" data-parallax="-0.14"></div>
        <div class="hero-grid-lines" data-parallax="0.08"></div>
      `;
      hero.prepend(backdrop);
    }

    // Add Executive Floating Metadata Ribbon (designxhand.com signature style)
    if (!hero.querySelector('.hero-editorial-meta')) {
      const metaRibbon = document.createElement('div');
      metaRibbon.className = 'hero-editorial-meta';
      metaRibbon.setAttribute('data-parallax', '0.12');
      metaRibbon.innerHTML = `
        <div class="meta-capsule left">
          <span class="meta-dot pulse"></span>
          <span class="meta-label">STATUS: ACEITANDO PROJETOS 2026</span>
        </div>
        <div class="meta-divider"></div>
        <div class="meta-capsule center">
          <span class="meta-label">EDITION // LOCALWEB EXECUTIVE</span>
        </div>
        <div class="meta-divider"></div>
        <div class="meta-capsule right">
          <span class="meta-label">SÃO PAULO • BRASIL</span>
        </div>
      `;
      
      const container = hero.querySelector('.hero-container');
      if (container) {
        container.insertBefore(metaRibbon, container.firstChild);
      }
    }
  }

  /**
   * 3. Multi-Plane Scroll Parallax
   */
  initScrollParallax() {
    this.parallaxElements = [];

    // Select all marked elements or default targets
    const elements = document.querySelectorAll(`
      [data-parallax],
      .hero-badge,
      .hero-title,
      .hero-subtitle,
      .hero-cta-group,
      .trust-metrics-grid,
      .section-tag,
      .service-card,
      .process-step-card,
      .price-card,
      .faq-item
    `);

    elements.forEach((el, index) => {
      let speed = parseFloat(el.getAttribute('data-parallax'));

      // If no explicit speed, calculate contextual speed
      if (isNaN(speed)) {
        if (el.classList.contains('hero-badge')) speed = 0.08;
        else if (el.classList.contains('hero-title')) speed = 0.16;
        else if (el.classList.contains('hero-subtitle')) speed = 0.22;
        else if (el.classList.contains('hero-cta-group')) speed = 0.26;
        else if (el.classList.contains('trust-metrics-grid')) speed = 0.32;
        else if (el.classList.contains('service-card') || el.classList.contains('price-card')) {
          // Staggered alternating speed for grid items (creates dynamic wave)
          speed = (index % 2 === 0) ? 0.04 : -0.04;
        } else {
          speed = 0.05;
        }
      }

      this.parallaxElements.push({
        el,
        speed,
        currentY: 0,
        targetY: 0
      });
    });
  }

  updateParallax() {
    if (this.isTouch && window.innerWidth < 768) {
      // Light mode for small mobile screens to conserve battery
      return;
    }

    const vh = this.viewportHeight;
    const currentScroll = this.scrollY;

    this.parallaxElements.forEach((item) => {
      const rect = item.el.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = elementCenter - vh / 2;

      // Only calculate if element is anywhere near the viewport
      if (rect.bottom >= -150 && rect.top <= vh + 150) {
        item.targetY = distanceFromCenter * item.speed;
        
        // Smooth lerp for buttery motion
        item.currentY += (item.targetY - item.currentY) * 0.12;

        // Apply 3D translate for GPU acceleration
        if (item.el.classList.contains('hero-title') || item.el.classList.contains('hero-subtitle')) {
          // Subtle fade as user scrolls deep past the hero
          const heroProgress = Math.max(0, Math.min(1, currentScroll / 700));
          const opacity = 1 - heroProgress * 0.65;
          item.el.style.transform = `translate3d(0, ${item.currentY.toFixed(2)}px, 0)`;
          item.el.style.opacity = opacity.toFixed(2);
        } else {
          item.el.style.transform = `translate3d(0, ${item.currentY.toFixed(2)}px, 0)`;
        }
      }
    });
  }

  /**
   * 4. Interactive 3D Card Tilt with Specular Glare (Cursor Parallax)
   */
  initInteractive3DTilt() {
    if (this.isTouch) return; // Disable on touch devices

    const tiltSelector = `
      .service-card,
      .price-card,
      .process-step-card,
      .metric-card,
      .feedback-card,
      .roi-wizard-card,
      .niche-card-modern,
      .contact-form-wrapper
    `;

    const cards = document.querySelectorAll(tiltSelector);

    cards.forEach((card) => {
      // Add glare element if not present
      let glare = card.querySelector('.card-specular-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-specular-glare';
        card.appendChild(glare);
      }

      let targetRotX = 0;
      let targetRotY = 0;
      let currentRotX = 0;
      let currentRotY = 0;
      let isHovered = false;
      let animId = null;

      const render = () => {
        currentRotX += (targetRotX - currentRotX) * 0.12;
        currentRotY += (targetRotY - currentRotY) * 0.12;

        card.style.transform = `perspective(1100px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) translateZ(8px)`;

        if (isHovered || Math.abs(currentRotX) > 0.05 || Math.abs(currentRotY) > 0.05) {
          animId = requestAnimationFrame(render);
        } else {
          card.style.transform = '';
          animId = null;
        }
      };

      card.addEventListener('mouseenter', () => {
        isHovered = true;
        card.classList.add('tilt-active');
        if (!animId) animId = requestAnimationFrame(render);
      });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Max tilt range: 7.5 degrees
        targetRotX = ((y - centerY) / centerY) * -6.5;
        targetRotY = ((x - centerX) / centerX) * 6.5;

        // Dynamic specular glare position
        glare.style.setProperty('--glare-x', `${x}px`);
        glare.style.setProperty('--glare-y', `${y}px`);
        glare.style.setProperty('--glare-opacity', '1');
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        targetRotX = 0;
        targetRotY = 0;
        card.classList.remove('tilt-active');
        glare.style.setProperty('--glare-opacity', '0');
      });
    });
  }

  /**
   * 5. Process Scroll Storytelling Progress Tracker
   * Connects step cards with Roman numerals & continuous drawing line
   */
  initProcessScrollTracker() {
    const processSection = document.getElementById('processo');
    if (!processSection) return;

    // Enhance step cards with Roman Numeral Badges (designxhand luxury styling)
    const romanNumerals = ['I', 'II', 'III', 'IV'];
    const stepCards = processSection.querySelectorAll('.process-step-card');

    stepCards.forEach((card, idx) => {
      let romanBadge = card.querySelector('.step-roman-num');
      if (!romanBadge && romanNumerals[idx]) {
        romanBadge = document.createElement('span');
        romanBadge.className = 'step-roman-num';
        romanBadge.textContent = romanNumerals[idx];
        card.prepend(romanBadge);
      }
    });

    // Add continuous glowing spine / line behind the grid
    const processGrid = processSection.querySelector('.process-timeline-grid, .process-grid');
    if (processGrid && !processGrid.querySelector('.process-kinetic-spine')) {
      const spine = document.createElement('div');
      spine.className = 'process-kinetic-spine';
      spine.innerHTML = '<div class="spine-fill" id="process-spine-fill"></div>';
      processGrid.prepend(spine);
    }
  }

  updateProcessTracker(scrollY) {
    const processSection = document.getElementById('processo');
    if (!processSection) return;

    const rect = processSection.getBoundingClientRect();
    const vh = window.innerHeight;
    const spineFill = document.getElementById('process-spine-fill');

    // Calculate progress as section scrolls through viewport
    const start = vh * 0.8;
    const end = -rect.height * 0.5;
    const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));

    if (spineFill) {
      spineFill.style.width = `${(progress * 100).toFixed(1)}%`;
    }

    const stepCards = processSection.querySelectorAll('.process-step-card');
    stepCards.forEach((card, idx) => {
      const stepProgress = (idx + 0.5) / stepCards.length;
      if (progress >= stepProgress - 0.15) {
        card.classList.add('step-active-in-view');
      } else {
        card.classList.remove('step-active-in-view');
      }
    });
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.viewportHeight = window.innerHeight;
      this.initScrollParallax();
    }, { passive: true });
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.lenis) this.lenis.destroy();
  }
}

export function initParallaxEngine() {
  const engine = new ParallaxExperienceEngine();
  engine.init();
  return engine;
}
