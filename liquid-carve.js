/**
 * Liquid Carve Effect — Originkit Port
 * 
 * Gooey Button & Input Field: A liquid blob erodes the surface as it tracks the cursor.
 * The blob is SUBTRACTIVE: an SVG <mask> knocks a circular hole out of the surface pill,
 * then a goo filter (feGaussianBlur + feColorMatrix alpha threshold) rounds that hole
 * into a concave blob with shoulders — surface tension where the bite meets an edge.
 * A reveal layer behind the surface shows the vibrant blob color through the carve.
 */

const GOO_STRENGTH = 8;
const FOLLOW_TAU_MIN = 0.02;
const FOLLOW_TAU_MAX = 0.4;
const SQUASH_TAU = 0.09;
const SQUASH_PER_PX_PER_SEC = 0.0011;
const SQUASH_MAX = 1.6;

let idCounter = 0;

function parseColor(input, defaultColor = '#FFFFFF') {
  if (!input) input = defaultColor;
  let c = String(input).trim();
  if (c.startsWith('var(')) {
    const match = c.match(/^var\([^,]+,\s*(.+)\)$/i);
    if (match) c = match[1].trim();
  }
  if (c[0] === '#') {
    let h = c.slice(1);
    if (h.length === 3 || h.length === 4) {
      h = h.split('').map(ch => ch + ch).join('');
    }
    if (h.length === 6) {
      const n = parseInt(h, 16);
      if (!isNaN(n)) {
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
      }
    } else if (h.length === 8) {
      const n = parseInt(h, 16);
      if (!isNaN(n)) {
        return { r: (n >>> 24) & 255, g: (n >>> 16) & 255, b: (n >>> 8) & 255, a: (n & 255) / 255 };
      }
    }
  }
  const fn = c.match(/rgba?\(([^)]+)\)/i);
  if (fn) {
    const p = fn[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (p.length >= 3) {
      return { r: p[0], g: p[1], b: p[2], a: p[3] !== undefined ? p[3] : 1 };
    }
  }
  return { r: 255, g: 255, b: 255, a: 1 };
}

const opaque = c => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;

export function applyLiquidCarve(element, userOptions = {}) {
  if (!element || element.dataset.liquidCarveInit === 'true') return;
  element.dataset.liquidCarveInit = 'true';

  idCounter++;
  const uid = `lc-${Date.now().toString(36)}-${idCounter}`;
  const filterId = `goo-${uid}`;
  const maskId = `bite-${uid}`;

  const isInputField = element.classList.contains('liquid-carve-field') || element.querySelector('.input-field');

  // Determinar cores padrão conforme tema e tipo de elemento
  function resolveColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const isPrimary = element.classList.contains('btn-primary-lg') || 
                      element.classList.contains('btn-primary-sm') || 
                      element.id === 'btn-roi-cta' ||
                      element.type === 'submit';
    const isSecondary = element.classList.contains('btn-secondary-lg');
    const isProposal = element.id === 'btn-export-proposal';

    let defaultFill = '#000000';
    let defaultBlob = '#71717A';

    if (isInputField) {
      defaultFill = isLight ? '#FFFFFF' : '#0A0A0C';
      defaultBlob = isLight ? '#27272A' : '#71717A';
    } else if (isPrimary) {
      if (isLight) {
        defaultFill = '#000000';
        defaultBlob = '#52525B';
      } else {
        defaultFill = '#FFFFFF';
        defaultBlob = '#A1A1AA';
      }
    } else if (isSecondary) {
      if (isLight) {
        defaultFill = '#FFFFFF';
        defaultBlob = '#71717A';
      } else {
        defaultFill = '#000000';
        defaultBlob = '#3F3F46';
      }
    } else if (isProposal) {
      if (isLight) {
        defaultFill = '#F4F4F5';
        defaultBlob = '#71717A';
      } else {
        defaultFill = '#18181C';
        defaultBlob = '#52525B';
      }
    }

    const fillProp = element.dataset.fillColor || userOptions.fill || defaultFill;
    const blobProp = element.dataset.blobColor || userOptions.blobColor || defaultBlob;

    return {
      fillRGB: parseColor(fillProp),
      blobRGB: parseColor(blobProp),
      blobSize: parseFloat(element.dataset.blobSize || userOptions.blobSize || (isInputField ? 65 : 85)),
      smoothness: parseFloat(element.dataset.smoothness || userOptions.smoothness || 55)
    };
  }

  let { fillRGB, blobRGB, blobSize, smoothness } = resolveColors();

  // Dimensões iniciais
  let w = element.offsetWidth || 200;
  let h = element.offsetHeight || 50;
  let rad = getRadius(element, w, h);

  function getRadius(el, width, height) {
    const cs = window.getComputedStyle(el);
    const br = parseFloat(cs.borderRadius);
    if (!isNaN(br) && br > 0) return br;
    return isInputField ? 8 : Math.min(width, height) / 2;
  }

  // Criar elemento SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'liquid-carve-svg');
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.overflow = 'visible';
  svg.style.zIndex = '1';
  svg.style.pointerEvents = 'none';

  svg.innerHTML = `
    <defs>
      <filter id="${filterId}" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${GOO_STRENGTH}" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" />
      </filter>
      <mask id="${maskId}">
        <rect class="mask-bg" x="0" y="0" width="100%" height="100%" fill="#fff" />
        <g class="lc-follow">
          <g class="lc-squash">
            <g class="lc-bite">
              <circle cx="0" cy="0" r="${blobSize / 2}" fill="#000" />
            </g>
          </g>
        </g>
      </mask>
    </defs>
    <g filter="url(#${filterId})" opacity="${blobRGB.a}">
      <rect class="lc-reveal-rect" x="0" y="0" width="100%" height="100%" rx="${rad}" ry="${rad}" fill="${opaque(blobRGB)}" />
    </g>
    <g filter="url(#${filterId})" opacity="${fillRGB.a}">
      <rect class="lc-surface-rect" x="0" y="0" width="100%" height="100%" rx="${rad}" ry="${rad}" fill="${opaque(fillRGB)}" mask="url(#${maskId})" />
    </g>
  `;

  element.style.position = 'relative';
  element.style.overflow = 'visible';
  element.classList.add('liquid-carve-host');

  // Garantir que filhos fiquem acima do SVG
  Array.from(element.children).forEach(child => {
    if (!child.classList.contains('liquid-carve-svg')) {
      child.style.position = 'relative';
      child.style.zIndex = '2';
      if (!isInputField && child.tagName !== 'INPUT' && child.tagName !== 'SELECT' && child.tagName !== 'BUTTON') {
        child.style.pointerEvents = 'none';
      }
    }
  });

  element.prepend(svg);

  const followG = svg.querySelector('.lc-follow');
  const squashG = svg.querySelector('.lc-squash');
  const biteG = svg.querySelector('.lc-bite');
  const revealRect = svg.querySelector('.lc-reveal-rect');
  const surfaceRect = svg.querySelector('.lc-surface-rect');

  // Inicializar grupos com transform-origin no centro
  if (biteG) biteG.style.transform = 'scale(0)';

  // Redimensionamento reativo
  function updateDimensions() {
    w = element.offsetWidth || w;
    h = element.offsetHeight || h;
    rad = getRadius(element, w, h);
    if (revealRect) {
      revealRect.setAttribute('rx', rad);
      revealRect.setAttribute('ry', rad);
    }
    if (surfaceRect) {
      surfaceRect.setAttribute('rx', rad);
      surfaceRect.setAttribute('ry', rad);
    }
  }

  const ro = new ResizeObserver(updateDimensions);
  ro.observe(element);

  // Atualização em troca de tema
  function updateColors() {
    const c = resolveColors();
    fillRGB = c.fillRGB;
    blobRGB = c.blobRGB;
    if (revealRect) revealRect.setAttribute('fill', opaque(blobRGB));
    if (surfaceRect) surfaceRect.setAttribute('fill', opaque(fillRGB));
  }

  const themeObserver = new MutationObserver(updateColors);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Física de Fluido & Tracking de Cursor
  const chase = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    squash: 1,
    angle: 0,
    scale: 0,
    targetScale: 0
  };

  let hovered = false;
  let lastTime = 0;
  let rafId = null;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function step(now) {
    const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60;
    lastTime = now;

    const t = Math.max(0, Math.min(100, Math.round(smoothness))) / 100;
    const tau = FOLLOW_TAU_MIN + t * (FOLLOW_TAU_MAX - FOLLOW_TAU_MIN);

    const k = reducedMotion ? 1 : 1 - Math.exp(-dt / tau);
    const dx = (chase.tx - chase.x) * k;
    const dy = (chase.ty - chase.y) * k;
    chase.x += dx;
    chase.y += dy;

    const speed = Math.hypot(dx, dy) / dt;
    const wantSquash = reducedMotion ? 1 : Math.min(SQUASH_MAX, 1 + speed * SQUASH_PER_PX_PER_SEC);
    chase.squash += (wantSquash - chase.squash) * (1 - Math.exp(-dt / SQUASH_TAU));

    if (speed > 8) {
      chase.angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    }

    // Suavização do scale de entrada / saída da mordida líquida
    const scaleK = reducedMotion ? 1 : 1 - Math.exp(-dt / 0.11);
    chase.scale += (chase.targetScale - chase.scale) * scaleK;

    const currentCenterX = (w / 2) + chase.x;
    const currentCenterY = (h / 2) + chase.y;

    if (followG) {
      followG.style.transform = `translate(${currentCenterX.toFixed(2)}px, ${currentCenterY.toFixed(2)}px)`;
    }
    if (squashG) {
      squashG.style.transform = `rotate(${chase.angle.toFixed(1)}deg) scale(${chase.squash.toFixed(3)}, ${(1 / chase.squash).toFixed(3)})`;
    }
    if (biteG) {
      biteG.style.transform = `scale(${chase.scale.toFixed(4)})`;
    }

    // Parar animação quando totalmente invisível e sem hover (economia de CPU)
    if (!hovered && chase.scale < 0.005) {
      chase.scale = 0;
      if (biteG) biteG.style.transform = 'scale(0)';
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(step);
  }

  function startLoop() {
    if (!rafId) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(step);
    }
  }

  function getOffset(e) {
    const rect = element.getBoundingClientRect();
    return {
      dx: e.clientX - (rect.left + rect.width / 2),
      dy: e.clientY - (rect.top + rect.height / 2)
    };
  }

  element.addEventListener('pointerenter', e => {
    hovered = true;
    chase.targetScale = 1;
    const o = getOffset(e);
    chase.tx = o.dx;
    chase.ty = o.dy;
    chase.x = o.dx;
    chase.y = o.dy;
    startLoop();
  });

  element.addEventListener('pointermove', e => {
    if (!hovered) return;
    const o = getOffset(e);
    chase.tx = o.dx;
    chase.ty = o.dy;
    startLoop();
  });

  element.addEventListener('pointerleave', () => {
    hovered = false;
    chase.targetScale = 0;
    startLoop();
  });

  // Gatilho visual em foco de teclado (para acessibilidade em campos de input e botões)
  element.addEventListener('focusin', () => {
    hovered = true;
    chase.targetScale = 1;
    chase.tx = 0;
    chase.ty = 0;
    startLoop();
  });

  element.addEventListener('focusout', () => {
    hovered = false;
    chase.targetScale = 0;
    startLoop();
  });
}

/**
 * Inicialização automática em todos os botões principais e campos de preenchimento
 */
export function initAllLiquidCarve() {
  // 1. Botões de Ação Principal
  const targetButtons = document.querySelectorAll(`
    .btn-primary-lg,
    .btn-secondary-lg,
    .btn-nav-cta,
    #btn-roi-cta,
    #btn-export-proposal,
    .btn-primary-action
  `);

  targetButtons.forEach(btn => {
    applyLiquidCarve(btn);
  });

  // 2. Campos de Requerimento de Preenchimento (Formulário de Contato / Orçamento)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const formGroups = contactForm.querySelectorAll('.form-group');
    formGroups.forEach(group => {
      const input = group.querySelector('.input-field');
      if (input && !group.querySelector('.liquid-carve-field')) {
        // Envolver input no container liquid-carve-field
        const wrapper = document.createElement('div');
        wrapper.className = 'liquid-carve-field';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        applyLiquidCarve(wrapper, {
          blobSize: 70,
          smoothness: 50
        });
      }
    });
  }
}
