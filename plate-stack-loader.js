/**
 * Plate Stack — Originkit (Ported to Vanilla WebGL)
 * 3D Motion Graphics Loading Effect
 * Five rounded plates stacked face to face, turning a quarter and overshooting with stagger.
 */

const TAU = Math.PI * 2;
const DPR_CAP = 2;
const FOV = (45 * Math.PI) / 180;
const NEAR = 0.1;
const FAR = 200;

const PLATE_W = 1;
const PLATE_H = 0.1;
const PLATE_D = 1;
const SPACING = 0.1;
const SCALE = 3;
const TILT_X = Math.PI / 10;
const TILT_Y = Math.PI / 4;
const ROUND_SEG = 4;
const MAX_R = PLATE_H / 2;
const SWEEP = Math.PI / 2;
const DUR = 1;

function parseColor(input, fb) {
  if (!input) return fb;
  let s = String(input).trim();
  const v = /^var\(\s*--[^,]+,\s*(.+)\)\s*$/i.exec(s);
  if (v) s = v[1].trim();

  if (s.charAt(0) === '#') {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) {
      h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    }
    if (h.length < 6) return fb;
    const n = parseInt(h.slice(0, 6), 16);
    if (!isFinite(n)) return fb;
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  const m = /^(rgba?|hsla?)\(([^)]+)\)\s*$/i.exec(s);
  if (!m) return fb;
  const parts = m[2].split(/[\s,/]+/).filter(x => x.length > 0);
  if (parts.length < 3) return fb;

  if (m[1].charAt(0).toLowerCase() === 'r') {
    const ch = t => (t.indexOf('%') >= 0 ? (parseFloat(t) / 100) * 255 : parseFloat(t));
    const r = ch(parts[0]), g = ch(parts[1]), b = ch(parts[2]);
    if (!isFinite(r) || !isFinite(g) || !isFinite(b)) return fb;
    return [r / 255, g / 255, b / 255];
  }

  let hue = parseFloat(parts[0]);
  if (parts[0].indexOf('turn') >= 0) hue *= 360;
  else if (parts[0].indexOf('rad') >= 0) hue *= 180 / Math.PI;
  const sat = parseFloat(parts[1]) / 100;
  const lit = parseFloat(parts[2]) / 100;
  if (!isFinite(hue) || !isFinite(sat) || !isFinite(lit)) return fb;
  const c = (1 - Math.abs(2 * lit - 1)) * sat;
  const hp = (((hue % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) { r = c; g = x; } else if (hp < 2) { r = x; g = c; }
  else if (hp < 3) { g = c; b = x; } else if (hp < 4) { g = x; b = c; }
  else if (hp < 5) { r = x; b = c; } else { r = c; b = x; }
  const mm = lit - c / 2;
  return [r + mm, g + mm, b + mm];
}

function m4() {
  const o = new Float32Array(16);
  o[0] = o[5] = o[10] = o[15] = 1;
  return o;
}

function m4Ident(o) {
  o.fill(0);
  o[0] = o[5] = o[10] = o[15] = 1;
  return o;
}

function m4Mul(a, b, out) {
  for (let c = 0; c < 4; c++) {
    const b0 = b[c * 4], b1 = b[c * 4 + 1];
    const b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
    out[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    out[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    out[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    out[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
  return out;
}

const SCR_A = m4();
const SCR_B = m4();

function rotX(m, a) {
  if (a === 0) return;
  const c = Math.cos(a), s = Math.sin(a);
  m4Ident(SCR_A);
  SCR_A[5] = c; SCR_A[6] = s; SCR_A[9] = -s; SCR_A[10] = c;
  m.set(m4Mul(m, SCR_A, SCR_B));
}

function rotY(m, a) {
  if (a === 0) return;
  const c = Math.cos(a), s = Math.sin(a);
  m4Ident(SCR_A);
  SCR_A[0] = c; SCR_A[2] = -s; SCR_A[8] = s; SCR_A[10] = c;
  m.set(m4Mul(m, SCR_A, SCR_B));
}

function trans(m, x, y, z) {
  m[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
  m[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
  m[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
  m[15] = m[3] * x + m[7] * y + m[11] * z + m[15];
}

function scaleU(m, s) {
  for (let i = 0; i < 12; i++) m[i] *= s;
}

function persp(out, fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
  return out;
}

function nm3(m, out) {
  const a = m[0], b = m[1], c = m[2];
  const d = m[4], e = m[5], f = m[6];
  const g = m[8], h = m[9], i = m[10];
  const C11 = e * i - h * f;
  const C12 = -(b * i - h * c);
  const C13 = b * f - e * c;
  const det = a * C11 + d * C12 + g * C13;
  if (!det) {
    out[0] = a; out[1] = b; out[2] = c;
    out[3] = d; out[4] = e; out[5] = f;
    out[6] = g; out[7] = h; out[8] = i;
    return;
  }
  const s = 1 / det;
  out[0] = C11 * s;
  out[1] = -(d * i - g * f) * s;
  out[2] = (d * h - g * e) * s;
  out[3] = C12 * s;
  out[4] = (a * i - g * c) * s;
  out[5] = -(a * h - g * b) * s;
  out[6] = C13 * s;
  out[7] = -(a * f - d * c) * s;
  out[8] = (a * e - d * b) * s;
}

function pack(pos, nrm, idx) {
  return {
    pos: new Float32Array(pos),
    nrm: new Float32Array(nrm),
    idx: new Uint16Array(idx),
  };
}

function roundedBoxGeo(w, h, d, radius, seg) {
  const pos = [], nrm = [], idx = [];
  const hx = w / 2, hy = h / 2, hz = d / 2;
  const r = Math.max(0, Math.min(radius, hx, hy, hz));
  const ex = hx - r, ey = hy - r, ez = hz - r;
  const HALF = Math.PI / 2;

  const push = (px, py, pz, nx, ny, nz) => {
    pos.push(px, py, pz);
    nrm.push(nx, ny, nz);
    return pos.length / 3 - 1;
  };
  const quad = (a, b, c, dd) => {
    idx.push(a, b, c, a, c, dd);
  };

  const face = (n, u, v) => {
    if (!(u[0] || u[1] || u[2]) || !(v[0] || v[1] || v[2])) return;
    const cx = n[0] * hx, cy = n[1] * hy, cz = n[2] * hz;
    const a = push(cx - u[0] - v[0], cy - u[1] - v[1], cz - u[2] - v[2], n[0], n[1], n[2]);
    const b = push(cx + u[0] - v[0], cy + u[1] - v[1], cz + u[2] - v[2], n[0], n[1], n[2]);
    const c = push(cx + u[0] + v[0], cy + u[1] + v[1], cz + u[2] + v[2], n[0], n[1], n[2]);
    const dd = push(cx - u[0] + v[0], cy - u[1] + v[1], cz - u[2] + v[2], n[0], n[1], n[2]);
    quad(a, b, c, dd);
  };

  face([1, 0, 0], [0, 0, -ez], [0, ey, 0]);
  face([-1, 0, 0], [0, 0, ez], [0, ey, 0]);
  face([0, 1, 0], [ex, 0, 0], [0, 0, -ez]);
  face([0, -1, 0], [ex, 0, 0], [0, 0, ez]);
  face([0, 0, 1], [ex, 0, 0], [0, ey, 0]);
  face([0, 0, -1], [-ex, 0, 0], [0, ey, 0]);

  if (r > 0) {
    const edge = (axis, s1, s2) => {
      const half = axis === 0 ? ex : axis === 1 ? ey : ez;
      if (half === 0) return;
      const e1 = axis === 0 ? ey : axis === 1 ? ez : ex;
      const e2 = axis === 0 ? ez : axis === 1 ? ex : ey;
      const put = (t, ang) => {
        const c = Math.cos(ang), sn = Math.sin(ang);
        const a1 = s1 * (e1 + r * c), a2 = s2 * (e2 + r * sn);
        const n1 = s1 * c, n2 = s2 * sn;
        if (axis === 0) return push(t * half, a1, a2, 0, n1, n2);
        if (axis === 1) return push(a2, t * half, a1, n2, 0, n1);
        return push(a1, a2, t * half, n1, n2, 0);
      };
      for (let k = 0; k < seg; k++) {
        const a0 = (k / seg) * HALF, a1 = ((k + 1) / seg) * HALF;
        const p0 = put(-1, a0), p1 = put(1, a0);
        const p2 = put(1, a1), p3 = put(-1, a1);
        if (s1 * s2 < 0) quad(p0, p1, p2, p3);
        else quad(p3, p2, p1, p0);
      }
    };
    for (const s1 of [1, -1]) for (const s2 of [1, -1]) {
      edge(0, s1, s2); edge(1, s1, s2); edge(2, s1, s2);
    }

    for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) {
      const base = pos.length / 3;
      for (let i = 0; i <= seg; i++) {
        const th = (i / seg) * HALF;
        for (let j = 0; j <= seg; j++) {
          const ph = (j / seg) * HALF;
          const nx = sx * Math.sin(th) * Math.cos(ph);
          const ny = sy * Math.cos(th);
          const nz = sz * Math.sin(th) * Math.sin(ph);
          push(sx * ex + r * nx, sy * ey + r * ny, sz * ez + r * nz, nx, ny, nz);
        }
      }
      const flip = sx * sy * sz < 0;
      for (let i = 0; i < seg; i++) {
        for (let j = 0; j < seg; j++) {
          const a = base + i * (seg + 1) + j;
          const b = a + 1;
          const c = a + (seg + 1) + 1;
          const dd = a + (seg + 1);
          if (flip) {
            idx.push(dd, c, b);
            if (i !== 0) idx.push(dd, b, a);
          } else {
            if (i !== 0) idx.push(a, b, c);
            idx.push(a, c, dd);
          }
        }
      }
    }
  }

  return pack(pos, nrm, idx);
}

const VERT = `
precision highp float;
attribute vec3 aPos;
attribute vec3 aNrm;
uniform mat4 uMVP;
uniform mat3 uNM;
varying vec3 vN;
void main() {
    vN = uNM * aNrm;
    gl_Position = uMVP * vec4(aPos, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec3 vN;
uniform vec3 uBase;
uniform vec3 uAcc;

const vec3 KEY  = vec3(-0.4364, 0.4601, 0.7733);
const vec3 FILL = vec3( 0.7831, 0.1309, 0.6080);

void main() {
    vec3 n = normalize(vN);
    if (!gl_FrontFacing) n = -n;
    float k = max(dot(n, KEY), 0.0);
    float f = max(dot(n, FILL), 0.0);
    float graze = 1.0 - clamp(abs(n.z), 0.0, 1.0);

    vec3 c = uBase * (0.08 + 0.62 * pow(k, 2.0));
    c += uAcc * 0.80 * pow(k, 9.0);
    c += uAcc * 0.35 * pow(f, 6.0);
    c += uAcc * 0.32 * pow(graze, 3.0) * (0.40 + 0.60 * max(n.y, 0.0));

    gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}
`;

function compileShader(gl, type, src) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('shader: ' + gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function buildProgram(gl) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('link: ' + gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

function uploadMesh(gl, g) {
  const pos = gl.createBuffer(), nrm = gl.createBuffer(), idx = gl.createBuffer();
  if (!pos || !nrm || !idx) return null;
  gl.bindBuffer(gl.ARRAY_BUFFER, pos);
  gl.bufferData(gl.ARRAY_BUFFER, g.pos, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, nrm);
  gl.bufferData(gl.ARRAY_BUFFER, g.nrm, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.idx, gl.STATIC_DRAW);
  return { pos, nrm, idx, count: g.idx.length };
}

function freeMesh(gl, m) {
  if (!m) return;
  gl.deleteBuffer(m.pos);
  gl.deleteBuffer(m.nrm);
  gl.deleteBuffer(m.idx);
}

function bindMesh(gl, m, aPos, aNrm) {
  gl.bindBuffer(gl.ARRAY_BUFFER, m.pos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, m.nrm);
  gl.vertexAttribPointer(aNrm, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.idx);
}

function easeBackOut(t) {
  const c = 1.70158;
  const u = t - 1;
  return u * u * ((c + 1) * u + c) + 1;
}

/**
 * Initializes a PlateStack WebGL animation inside a container element or directly on a canvas.
 * @param {HTMLElement} container 
 * @param {Object} options 
 * @returns {Object} Control interface with destroy() method
 */
export function initPlateStack(container, options = {}) {
  const {
    baseColor = '#334155',
    accentColor = '#38BDF8',
    speed = 71,
    distance = 11,
    stack = {
      count: 5,
      rounded: 26,
      stagger: 250
    }
  } = options;

  let canvas;
  let isOwnedCanvas = false;

  if (container instanceof HTMLCanvasElement) {
    canvas = container;
  } else {
    canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.pointerEvents = 'none';
    container.style.position = container.style.position || 'relative';
    container.appendChild(canvas);
    isOwnedCanvas = true;
  }

  const gl = canvas.getContext('webgl', {
    antialias: true,
    alpha: true,
    premultipliedAlpha: true,
    depth: true,
  });

  if (!gl) {
    console.warn('WebGL not supported for PlateStack loader');
    return { destroy: () => {} };
  }

  const prog = buildProgram(gl);
  if (!prog) return { destroy: () => {} };
  gl.useProgram(prog);

  const aPos = gl.getAttribLocation(prog, 'aPos');
  const aNrm = gl.getAttribLocation(prog, 'aNrm');
  gl.enableVertexAttribArray(aPos);
  gl.enableVertexAttribArray(aNrm);

  const uMVP = gl.getUniformLocation(prog, 'uMVP');
  const uNM = gl.getUniformLocation(prog, 'uNM');
  const uBase = gl.getUniformLocation(prog, 'uBase');
  const uAcc = gl.getUniformLocation(prog, 'uAcc');

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0, 0, 0, 0);

  let plate = null;
  let geoKey = '';
  const ensureGeo = radius => {
    const k = radius.toFixed(5);
    if (k === geoKey) return;
    geoKey = k;
    if (plate) freeMesh(gl, plate);
    plate = uploadMesh(gl, roundedBoxGeo(PLATE_W, PLATE_H, PLATE_D, radius, ROUND_SEG));
  };

  const parsedBase = parseColor(baseColor, [0.15, 0.20, 0.30]);
  const parsedAcc = parseColor(accentColor, [0.22, 0.74, 0.97]);

  let cssW = 0, cssH = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    cssW = canvas.clientWidth || (container ? container.clientWidth : 300) || 300;
    cssH = canvas.clientHeight || (container ? container.clientHeight : 300) || 300;
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
  };

  resize();
  let ro = null;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(resize);
    ro.observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }

  const proj = m4(), view = m4(), pv = m4(), model = m4(), mvp = m4();
  const nrmMat = new Float32Array(9);
  let raf = 0;
  let last = performance.now();
  let clock = 0;
  let isDestroyed = false;

  const drawWith = mesh => {
    m4Mul(pv, model, mvp);
    nm3(model, nrmMat);
    gl.uniformMatrix4fv(uMVP, false, mvp);
    gl.uniformMatrix3fv(uNM, false, nrmMat);
    bindMesh(gl, mesh, aPos, aNrm);
    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
  };

  const frame = now => {
    if (isDestroyed) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;

    const count = Math.max(1, Math.round(stack.count || 5));
    const rounded = typeof stack.rounded === 'number' ? stack.rounded : 26;
    ensureGeo(MAX_R * (rounded / 100));
    if (!plate) return;

    const stag = (stack.stagger || 250) / 1000;
    const cycle = DUR + stag * (count - 1);
    clock = (clock + dt * (speed / 50)) % cycle;

    const w = canvas.width, h = canvas.height;
    const aspect = (w && h) ? w / h : 1;
    persp(proj, FOV, aspect, NEAR, FAR);

    const dist = distance / Math.min(1, aspect);
    m4Ident(view);
    trans(view, 0, 0, -dist);
    m4Mul(proj, view, pv);

    gl.uniform3fv(uBase, parsedBase);
    gl.uniform3fv(uAcc, parsedAcc);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const centerY = ((count - 3) / 2) * SPACING;

    for (let i = 0; i < count; i++) {
      const u = Math.min(1, Math.max(0, (clock - i * stag) / DUR));
      m4Ident(model);
      rotX(model, TILT_X);
      rotY(model, TILT_Y);
      scaleU(model, SCALE);
      trans(model, 0, -centerY, 0);
      trans(model, 0, (i - 1) * SPACING, 0);
      rotY(model, SWEEP * easeBackOut(u));
      drawWith(plate);
    }
  };

  raf = requestAnimationFrame(frame);

  return {
    destroy: () => {
      isDestroyed = true;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', resize);
      if (plate) freeMesh(gl, plate);
      gl.deleteProgram(prog);
      if (isOwnedCanvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  };
}

/**
 * Creates and displays an executive 3D Plate Stack loading overlay.
 * @param {Object} options
 * @returns {Object} Control interface with hide() and updateMessage()
 */
export function showLoadingScreen(options = {}) {
  const {
    title = 'LOCALWEB PRO',
    message = 'Carregando experiência...',
    target = document.body,
    baseColor = '#334155',
    accentColor = '#38BDF8',
    speed = 71,
    distance = 11,
    stack = { count: 5, rounded: 26, stagger: 250 },
    zIndex = 99999
  } = options;

  const overlay = document.createElement('div');
  overlay.className = 'plate-stack-overlay';
  overlay.style.position = (target === document.body) ? 'fixed' : 'absolute';
  overlay.style.inset = '0';
  overlay.style.zIndex = String(zIndex);
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.background = '#05070B';
  overlay.style.transition = 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.45s ease';
  overlay.style.opacity = '1';
  overlay.style.visibility = 'visible';
  overlay.style.userSelect = 'none';

  const canvasBox = document.createElement('div');
  canvasBox.className = 'plate-stack-canvas-box';
  canvasBox.style.width = '240px';
  canvasBox.style.height = '240px';
  canvasBox.style.position = 'relative';
  overlay.appendChild(canvasBox);

  const textGroup = document.createElement('div');
  textGroup.style.display = 'flex';
  textGroup.style.flexDirection = 'column';
  textGroup.style.alignItems = 'center';
  textGroup.style.marginTop = '12px';
  textGroup.style.textAlign = 'center';
  textGroup.style.gap = '6px';

  const brandEl = document.createElement('div');
  brandEl.style.fontFamily = "'Outfit', sans-serif";
  brandEl.style.fontWeight = '800';
  brandEl.style.fontSize = '0.95rem';
  brandEl.style.letterSpacing = '0.12em';
  brandEl.style.color = '#F8FAFC';
  brandEl.innerHTML = title.replace('PRO', '<span style="color: #38BDF8;">PRO</span>');
  textGroup.appendChild(brandEl);

  const msgEl = document.createElement('div');
  msgEl.style.fontFamily = "'Inter', sans-serif";
  msgEl.style.fontSize = '0.8rem';
  msgEl.style.color = '#94A3B8';
  msgEl.style.fontWeight = '500';
  msgEl.textContent = message;
  textGroup.appendChild(msgEl);

  overlay.appendChild(textGroup);
  target.appendChild(overlay);

  const instance = initPlateStack(canvasBox, {
    baseColor,
    accentColor,
    speed,
    distance,
    stack
  });

  return {
    overlay,
    updateMessage: newMsg => {
      msgEl.textContent = newMsg;
    },
    hide: (duration = 450) => {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(() => {
        instance.destroy();
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, duration);
    }
  };
}

export default initPlateStack;
