/**
 * ==========================================================================
 * WHITE DESERT LUXURY SHOWCASE CAROUSEL CONTROLLER
 *
 * Features:
 * 1. Wheel-to-Horizontal Parallax: Scrolling mouse wheel over the carousel
 *    advances/rewinds the slides with smooth damping.
 * 2. Multi-Plane Image Parallax: Background images subtly drift as cards move,
 *    creating cinematic depth.
 * 3. Autoplay with Instant Pause on Hover:
 *    Slides auto-advance on a timer and immediately pause whenever the cursor
 *    enters the carousel, resuming upon mouseleave.
 * 4. Touch/Swipe & Mouse Drag with inertia.
 * 5. Full Keyboard & Accessibility navigation.
 * ==========================================================================
 */

export class ShowcaseCarousel {
  constructor(options = {}) {
    this.container = document.querySelector(options.containerSelector || '#showcase-carousel');
    if (!this.container) return;

    this.viewport = this.container.querySelector('.showcase-viewport');
    this.track = this.container.querySelector('.showcase-track');
    this.slides = Array.from(this.container.querySelectorAll('.showcase-slide'));
    this.images = Array.from(this.container.querySelectorAll('.showcase-bg-img'));
    this.prevBtn = this.container.querySelector('.showcase-arrow-prev');
    this.nextBtn = this.container.querySelector('.showcase-arrow-next');
    this.dotsContainer = this.container.querySelector('.showcase-dots');

    this.currentIndex = 0;
    this.maxIndex = Math.max(0, this.slides.length - 1);
    this.slideStep = 0;

    // Autoplay configuration with Pause on Hover
    this.autoPlay = options.autoPlay !== false;
    this.autoPlayInterval = options.autoPlayInterval || 4800;
    this.isHovered = false;
    this.autoPlayTimer = null;

    // Drag / Touch / Wheel Parallax state
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.dragThreshold = 45;
    this.wheelCooldown = false;

    this.init();
  }

  init() {
    if (!this.slides.length) return;

    this.updateMetrics();
    this.buildDots();
    this.bindEvents();
    this.bindWheelParallax();
    this.bindScrollParallax();
    this.goToSlide(0, false);

    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }

  updateMetrics() {
    if (!this.viewport || !this.slides.length) return;

    const firstSlide = this.slides[0];
    const slideWidth = firstSlide.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(this.track).gap) || 32;

    this.slideStep = slideWidth + gap;
    this.maxIndex = Math.max(0, this.slides.length - 1);

    if (this.currentIndex > this.maxIndex) {
      this.currentIndex = this.maxIndex;
    }
  }

  buildDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';

    const totalDots = this.slides.length;

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `showcase-dot ${i === this.currentIndex ? 'is-active' : ''}`;
      dot.setAttribute('aria-label', `Ir para slide ${i + 1} de ${totalDots}`);
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', i === this.currentIndex ? 'true' : 'false');

      dot.addEventListener('click', () => {
        this.goToSlide(i);
        this.resetAutoPlay();
      });

      this.dotsContainer.appendChild(dot);
    }
  }

  updateDots() {
    if (!this.dotsContainer) return;
    const dots = this.dotsContainer.querySelectorAll('.showcase-dot');
    dots.forEach((dot, idx) => {
      const isActive = idx === this.currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  /**
   * Slide movement with internal image parallax counter-drift
   */
  goToSlide(index, animate = true) {
    if (index < 0) {
      index = this.maxIndex;
    } else if (index > this.maxIndex) {
      index = 0;
    }

    this.currentIndex = index;
    const targetOffset = -this.currentIndex * this.slideStep;

    if (!animate) {
      this.track.classList.add('no-transition');
    } else {
      this.track.classList.remove('no-transition');
    }

    this.currentTranslate = targetOffset;
    this.prevTranslate = targetOffset;
    this.track.style.transform = `translateX(${targetOffset}px)`;

    // Update internal image parallax offset (cinematic counter-shift)
    this.updateImageParallax(targetOffset);

    if (!animate) {
      void this.track.offsetHeight;
      this.track.classList.remove('no-transition');
    }

    this.updateDots();
    this.updateAria();
  }

  updateImageParallax(trackOffset) {
    this.images.forEach((img, idx) => {
      const slidePos = (idx * this.slideStep) + trackOffset;
      const parallaxX = (slidePos * 0.08).toFixed(1);
      img.style.transform = `scale(1.1) translateX(${parallaxX}px)`;
    });
  }

  next() {
    this.goToSlide(this.currentIndex + 1);
  }

  prev() {
    this.goToSlide(this.currentIndex - 1);
  }

  updateAria() {
    this.slides.forEach((slide, idx) => {
      const isVisible = idx === this.currentIndex;
      slide.setAttribute('aria-hidden', !isVisible ? 'true' : 'false');
    });
  }

  /**
   * Autoplay with PAUSE ON HOVER
   */
  startAutoPlay() {
    if (this.isHovered) return;
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      if (!this.isHovered && !this.isDragging) {
        this.next();
      }
    }, this.autoPlayInterval);
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  resetAutoPlay() {
    if (this.autoPlay && !this.isHovered) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }

  /**
   * 1. Mouse Wheel-to-Horizontal Parallax
   */
  bindWheelParallax() {
    if (!this.viewport) return;

    this.viewport.addEventListener('wheel', (e) => {
      const isVerticalScroll = Math.abs(e.deltaY) > Math.abs(e.deltaX);
      if (!isVerticalScroll) return;

      const atStart = this.currentIndex === 0 && e.deltaY < 0;
      const atEnd = this.currentIndex === this.maxIndex && e.deltaY > 0;

      if (atStart || atEnd) {
        return;
      }

      e.preventDefault();

      if (this.wheelCooldown) return;
      this.wheelCooldown = true;

      if (e.deltaY > 20) {
        this.next();
      } else if (e.deltaY < -20) {
        this.prev();
      }

      setTimeout(() => {
        this.wheelCooldown = false;
      }, 420);

      this.resetAutoPlay();
    }, { passive: false });
  }

  /**
   * 2. Page Scroll Parallax
   */
  bindScrollParallax() {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = this.container.getBoundingClientRect();
          const vh = window.innerHeight;

          if (rect.bottom > 0 && rect.top < vh) {
            const progress = (vh - rect.top) / (vh + rect.height);
            const driftY = (progress - 0.5) * 28;
            this.images.forEach(img => {
              img.style.top = `${driftY.toFixed(1)}px`;
            });
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * Bind Buttons, Drag, and Pause on Hover
   */
  bindEvents() {
    // Buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.prev();
        this.resetAutoPlay();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.next();
        this.resetAutoPlay();
      });
    }

    // PAUSE ON HOVER
    this.container.addEventListener('mouseenter', () => {
      this.isHovered = true;
      this.stopAutoPlay();
    });

    // RESUME ON LEAVE
    this.container.addEventListener('mouseleave', () => {
      this.isHovered = false;
      if (this.autoPlay) {
        this.startAutoPlay();
      }
    });

    // Focus handling
    this.container.addEventListener('focusin', () => {
      this.isHovered = true;
      this.stopAutoPlay();
    });
    this.container.addEventListener('focusout', () => {
      this.isHovered = false;
      if (this.autoPlay) this.startAutoPlay();
    });

    // Keyboard Arrow navigation
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prev();
        this.resetAutoPlay();
      } else if (e.key === 'ArrowRight') {
        this.next();
        this.resetAutoPlay();
      }
    });

    // Window Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      this.updateMetrics();
      this.goToSlide(this.currentIndex, false);
    });
    resizeObserver.observe(this.viewport);

    // Touch & Pointer Drag Gestures
    const onDragStart = (clientX) => {
      this.isDragging = true;
      this.startX = clientX;
      this.track.classList.add('no-transition');
      this.viewport.classList.add('is-dragging');
      this.stopAutoPlay();
    };

    const onDragMove = (clientX) => {
      if (!this.isDragging) return;
      const diffX = clientX - this.startX;
      this.currentTranslate = this.prevTranslate + diffX;
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;
      this.updateImageParallax(this.currentTranslate);
    };

    const onDragEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.viewport.classList.remove('is-dragging');
      this.track.classList.remove('no-transition');

      const movedBy = this.currentTranslate - this.prevTranslate;

      if (movedBy < -this.dragThreshold) {
        this.next();
      } else if (movedBy > this.dragThreshold) {
        this.prev();
      } else {
        this.goToSlide(this.currentIndex);
      }

      this.resetAutoPlay();
    };

    // Touch listeners
    this.viewport.addEventListener('touchstart', (e) => {
      onDragStart(e.touches[0].clientX);
    }, { passive: true });

    this.viewport.addEventListener('touchmove', (e) => {
      onDragMove(e.touches[0].clientX);
    }, { passive: true });

    this.viewport.addEventListener('touchend', () => {
      onDragEnd();
    }, { passive: true });

    // Mouse drag listeners
    this.viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('a, button')) return;
      e.preventDefault();
      onDragStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) onDragMove(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) onDragEnd();
    });
  }
}

/**
 * Global Initialization Helper
 */
export function initShowcaseCarousel() {
  const container = document.getElementById('showcase-carousel');
  if (!container) return null;

  return new ShowcaseCarousel({
    containerSelector: '#showcase-carousel',
    autoPlay: true,
    autoPlayInterval: 4800,
    loop: true
  });
}
