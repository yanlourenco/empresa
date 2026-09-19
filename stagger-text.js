/**
 * STAGGER TEXT RISE ANIMATION UTILITY (EXECUTIVE / AWWWARDS EDITION)
 * 
 * Features:
 * - Anti-Clipping Typography Protection: Padded letter masks ensure descenders (g, j, p, q, y, ç) are NEVER clipped.
 * - Restores overflow: visible upon animation completion so layout boxes never eat letters.
 * - Preserves existing nested markup such as <span class="highlight-text">.
 * - Fluid mobile word wrapping prevention with zero horizontal overflow.
 */

export function initStaggerText() {
  const elements = document.querySelectorAll('[data-stagger-text]');

  elements.forEach((el) => {
    // Check if element contains highlight span before replacing
    const highlightSpan = el.querySelector('.highlight-text');
    const highlightPhrase = highlightSpan ? highlightSpan.textContent.trim() : null;

    const fullText = el.getAttribute('data-stagger-text') || el.innerText.trim();
    if (!fullText) return;

    const staggerMs = parseInt(el.getAttribute('data-stagger-ms') || '22', 10);
    const startY = parseInt(el.getAttribute('data-stagger-y') || '32', 10);

    el.innerHTML = '';
    el.style.display = 'block';
    el.style.overflow = 'visible'; // Never lock overflow on root heading
    el.style.lineHeight = '1.25';

    const words = fullText.split(' ');
    let globalCharIndex = 0;
    const totalChars = fullText.replace(/\s/g, '').length;

    words.forEach((wordText, wIdx) => {
      const isHighlighted = highlightPhrase && highlightPhrase.includes(wordText);

      // Wrapper for the word that clips ONLY during entry and preserves letter descenders
      const wordMask = document.createElement('span');
      wordMask.className = `stagger-word-mask ${isHighlighted ? 'highlight-text' : ''}`;
      wordMask.style.display = 'inline-block';
      wordMask.style.overflow = 'hidden';
      wordMask.style.verticalAlign = 'bottom';
      wordMask.style.paddingTop = '4px';
      wordMask.style.paddingBottom = '6px';
      wordMask.style.marginTop = '-4px';
      wordMask.style.marginBottom = '-6px';
      wordMask.style.whiteSpace = 'nowrap';

      const chars = wordText.split('');
      chars.forEach((char) => {
        const span = document.createElement('span');
        span.className = 'stagger-char';
        span.textContent = char;
        span.style.display = 'inline-block';
        span.style.transform = `translate3d(0, ${startY}px, 0)`;
        span.style.opacity = '0';
        span.style.transition = `transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease`;
        span.style.transitionDelay = `${globalCharIndex * staggerMs}ms`;
        wordMask.appendChild(span);
        globalCharIndex++;
      });

      el.appendChild(wordMask);

      // Add space between words
      if (wIdx < words.length - 1) {
        const spaceSpan = document.createElement('span');
        spaceSpan.className = 'stagger-space';
        spaceSpan.innerHTML = '&nbsp;';
        spaceSpan.style.display = 'inline-block';
        el.appendChild(spaceSpan);
      }
    });

    // Calculate maximum animation duration to safely restore overflow: visible
    const totalAnimationTime = (globalCharIndex * staggerMs) + 750;

    // IntersectionObserver to trigger animation when scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const charSpans = entry.target.querySelectorAll('.stagger-char');
            charSpans.forEach((span) => {
              span.style.transform = 'translate3d(0, 0, 0)';
              span.style.opacity = '1';
            });

            // Unlock overflow completely once animation is done so nothing is ever clipped
            setTimeout(() => {
              const masks = entry.target.querySelectorAll('.stagger-word-mask');
              masks.forEach((m) => {
                m.style.overflow = 'visible';
              });
            }, totalAnimationTime);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(el);
  });
}
