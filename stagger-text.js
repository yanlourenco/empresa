/**
 * STAGGER TEXT RISE ANIMATION UTILITY
 * Groups characters into word spans to prevent awkward word-wrapping across lines.
 */

export function initStaggerText() {
  const elements = document.querySelectorAll('[data-stagger-text]');

  elements.forEach((el) => {
    const text = el.getAttribute('data-stagger-text') || el.innerText.trim();
    if (!text) return;

    const staggerMs = parseInt(el.getAttribute('data-stagger-ms') || '25', 10);
    const startY = parseInt(el.getAttribute('data-stagger-y') || '35', 10);

    el.innerHTML = '';
    el.style.overflow = 'hidden';
    el.style.display = 'block';

    const words = text.split(' ');
    let globalCharIndex = 0;

    words.forEach((wordText, wIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'stagger-word';
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';

      const chars = wordText.split('');
      chars.forEach((char) => {
        const span = document.createElement('span');
        span.className = 'stagger-char';
        span.textContent = char;
        span.style.display = 'inline-block';
        span.style.transform = `translateY(${startY}px)`;
        span.style.opacity = '0';
        span.style.transition = `transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)`;
        span.style.transitionDelay = `${globalCharIndex * staggerMs}ms`;
        wordSpan.appendChild(span);
        globalCharIndex++;
      });

      el.appendChild(wordSpan);

      // Add space between words
      if (wIdx < words.length - 1) {
        const spaceSpan = document.createElement('span');
        spaceSpan.className = 'stagger-space';
        spaceSpan.innerHTML = '&nbsp;';
        spaceSpan.style.display = 'inline-block';
        el.appendChild(spaceSpan);
        globalCharIndex++;
      }
    });

    // IntersectionObserver to trigger animation when scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const charSpans = entry.target.querySelectorAll('.stagger-char');
            charSpans.forEach((span) => {
              span.style.transform = 'translateY(0)';
              span.style.opacity = '1';
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
  });
}
