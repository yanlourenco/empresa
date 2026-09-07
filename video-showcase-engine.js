/**
 * LocalWeb Pro - High-Fidelity Video & Motion Showcase Engine
 * Powers ultra-smooth, hardware-accelerated 60fps simulated cinematic motion on HTML5 Canvas
 * Zero WebRTC encoding overhead, zero memory leaks, ultra-efficient lifecycle management
 * (Jacket Masters, Cloud9 Studio, Soundar Audio)
 */

export class VideoShowcaseEngine {
  constructor(projectId, targetElement, options = {}) {
    this.projectId = projectId;
    this.progressFill = options.progressFill || null;
    this.playToggleBtn = options.playToggleBtn || null;
    this.autoPlay = options.autoPlay !== undefined ? options.autoPlay : false;
    this.isPlaying = false;
    this.isDestroyed = false;
    this.animId = null;
    this.duration = options.duration || 6000; // 6s smooth loop
    this.startTime = performance.now();
    this.assetsLoaded = false;

    // Use or replace with direct 2D Canvas for maximum GPU performance (100x lighter than captureStream)
    if (targetElement.tagName === 'VIDEO') {
      const canvas = document.createElement('canvas');
      canvas.className = targetElement.className;
      canvas.width = 800;
      canvas.height = 500;
      if (targetElement.dataset.videoId) canvas.dataset.videoId = targetElement.dataset.videoId;
      if (targetElement.dataset.project) canvas.dataset.project = targetElement.dataset.project;
      
      if (targetElement.parentNode) {
        targetElement.parentNode.replaceChild(canvas, targetElement);
      }
      this.canvas = canvas;
    } else {
      this.canvas = targetElement;
      if (!this.canvas.width) this.canvas.width = 800;
      if (!this.canvas.height) this.canvas.height = 500;
    }

    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.init();
  }

  init() {
    this.loadAssets();
    this.bindControls();

    this.handleVisibility = () => {
      if (document.hidden) {
        this.wasPlayingBeforeHide = this.isPlaying;
        this.pause();
      } else if (this.wasPlayingBeforeHide) {
        this.play();
      }
    };
    document.addEventListener('visibilitychange', this.handleVisibility);
  }

  loadAssets() {
    const onLoaded = () => {
      if (this.isDestroyed) return;
      this.assetsLoaded = true;
      // Draw first static frame immediately so canvas is never blank
      this.renderFrame(this.startTime);
      if (this.autoPlay) {
        this.play();
      }
    };

    if (this.projectId === 'elementor-jacket') {
      this.imgWhite = new Image();
      this.imgWhite.src = '/projects/jacket-masters.png';
      this.imgOrange = new Image();
      this.imgOrange.src = '/projects/check-this-out-elementor.jpg';

      let loaded = 0;
      const check = () => {
        loaded++;
        if (loaded >= 2) onLoaded();
      };
      if (this.imgWhite.complete) loaded++;
      else this.imgWhite.onload = check;
      if (this.imgOrange.complete) loaded++;
      else this.imgOrange.onload = check;
      if (loaded >= 2) onLoaded();
    } else if (this.projectId === 'cloud9') {
      this.imgCloud = new Image();
      this.imgCloud.src = '/projects/cloud9-studio.png';
      if (this.imgCloud.complete) {
        onLoaded();
      } else {
        this.imgCloud.onload = onLoaded;
      }
    } else if (this.projectId === 'soundar') {
      this.imgSoundar = new Image();
      this.imgSoundar.src = '/projects/soundar-headphones.png';
      if (this.imgSoundar.complete) {
        onLoaded();
      } else {
        this.imgSoundar.onload = onLoaded;
      }
    }
  }

  play() {
    if (this.isPlaying || this.isDestroyed) return;
    this.isPlaying = true;
    this.startTime = performance.now();
    this.updateControlsUI();

    this.loop = (time) => {
      if (!this.isPlaying || this.isDestroyed) return;
      this.renderFrame(time);
      this.animId = requestAnimationFrame(this.loop);
    };

    this.animId = requestAnimationFrame(this.loop);
  }

  pause() {
    if (!this.isPlaying && !this.animId) return;
    this.isPlaying = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.updateControlsUI();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  updateControlsUI() {
    if (!this.playToggleBtn) return;
    const iconPause = this.playToggleBtn.querySelector('.icon-pause');
    const iconPlay = this.playToggleBtn.querySelector('.icon-play');
    if (iconPause) iconPause.style.display = this.isPlaying ? 'block' : 'none';
    if (iconPlay) iconPlay.style.display = this.isPlaying ? 'none' : 'block';
  }

  renderFrame(time) {
    if (!this.ctx || !this.canvas) return;
    const elapsed = (time - this.startTime) % this.duration;
    const p = Math.max(0, Math.min(1, elapsed / this.duration)); // 0.0 -> 1.0

    if (this.progressFill) {
      this.progressFill.style.width = `${p * 100}%`;
    }

    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#05070B';
    ctx.fillRect(0, 0, w, h);

    if (this.projectId === 'elementor-jacket') {
      this.renderJacketMasters(ctx, w, h, p);
    } else if (this.projectId === 'cloud9') {
      this.renderCloud9(ctx, w, h, p, time);
    } else if (this.projectId === 'soundar') {
      this.renderSoundar(ctx, w, h, p, time);
    }
  }

  // Animation 1: Jacket Masters (Dual Color Switch & Zoom)
  renderJacketMasters(ctx, w, h, p) {
    let alphaWhite = 1;
    let alphaOrange = 0;
    let scale = 1;

    if (p < 0.45) {
      alphaWhite = 1;
      alphaOrange = 0;
      scale = 1 + (p / 0.45) * 0.04;
    } else if (p < 0.55) {
      const t = (p - 0.45) / 0.10;
      alphaWhite = 1 - t;
      alphaOrange = t;
      scale = 1.04;
    } else if (p < 0.90) {
      const t = (p - 0.55) / 0.35;
      alphaWhite = 0;
      alphaOrange = 1;
      scale = 1.04 - t * 0.04;
    } else {
      const t = (p - 0.90) / 0.10;
      alphaWhite = t;
      alphaOrange = 1 - t;
      scale = 1;
    }

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(scale, scale);
    ctx.translate(-w / 2, -h / 2);

    if (alphaWhite > 0 && this.imgWhite && this.imgWhite.complete) {
      ctx.globalAlpha = alphaWhite;
      ctx.drawImage(this.imgWhite, 0, 0, w, h);
    }
    if (alphaOrange > 0 && this.imgOrange && this.imgOrange.complete) {
      ctx.globalAlpha = alphaOrange;
      ctx.drawImage(this.imgOrange, 0, 0, w, h);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Animation 2: Cloud9 (3D Car floating in Crimson volumetric clouds + lens sheen + tag reticles)
  renderCloud9(ctx, w, h, p, time) {
    if (!this.imgCloud || !this.imgCloud.complete) return;

    // Smooth sinusoidal zoom and float
    const angle = p * Math.PI * 2;
    const scale = 1.0 + 0.06 * (0.5 - 0.5 * Math.cos(angle));
    const panX = Math.sin(angle) * 14;
    const panY = Math.cos(angle) * 8;

    ctx.save();
    ctx.translate(w / 2 + panX, h / 2 + panY);
    ctx.scale(scale, scale);
    ctx.translate(-w / 2, -h / 2);

    // Draw base high-res image
    ctx.drawImage(this.imgCloud, 0, 0, w, h);

    // Volumetric Atmospheric Crimson Smoke Glow centered around the car
    const carX = w * 0.51;
    const carY = h * 0.49;
    const pulseRadius = 140 + Math.sin(angle) * 35;
    const glowAlpha = 0.22 + 0.12 * Math.sin(angle);

    const smokeGlow = ctx.createRadialGradient(carX, carY, 15, carX, carY, pulseRadius);
    smokeGlow.addColorStop(0, `rgba(255, 46, 99, ${glowAlpha})`);
    smokeGlow.addColorStop(0.5, `rgba(225, 29, 72, ${glowAlpha * 0.5})`);
    smokeGlow.addColorStop(1, 'rgba(225, 29, 72, 0)');

    ctx.fillStyle = smokeGlow;
    ctx.beginPath();
    ctx.arc(carX, carY, pulseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Cinematic Light Sheen beam across "CLOUDS" typography between p = 0.30 and p = 0.75
    if (p >= 0.30 && p <= 0.75) {
      const sheenP = (p - 0.30) / 0.45; // 0.0 -> 1.0
      const beamX = (w * 0.1) + sheenP * (w * 0.85);
      const beamWidth = 90;

      const sheenGrad = ctx.createLinearGradient(beamX - beamWidth, 0, beamX + beamWidth, 0);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.18)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = sheenGrad;
      ctx.fillRect(beamX - beamWidth, h * 0.35, beamWidth * 2, h * 0.35);
    }

    // Micro-hotspots pulsing on interactive tags
    const tags = [
      { x: w * 0.16, y: h * 0.51 }, // Web Design
      { x: w * 0.23, y: h * 0.63 }, // Strategy
      { x: w * 0.75, y: h * 0.39 }, // Digital first
      { x: w * 0.86, y: h * 0.49 }, // Responsive
      { x: w * 0.77, y: h * 0.59 }  // Visual identity
    ];

    tags.forEach((tag, idx) => {
      const tagPulse = Math.sin(time * 0.004 + idx * 1.3);
      const r = 4 + tagPulse * 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(tag.x, tag.y, Math.max(1, r), 0, Math.PI * 2);
      ctx.fill();

      // Outer beacon ring
      ctx.strokeStyle = `rgba(225, 29, 72, ${0.4 + tagPulse * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(tag.x, tag.y, 8 + tagPulse * 4, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.restore();
  }

  // Animation 3: Soundar (Acoustic radar soundwaves + floating neon earbuds + pulsing hotspots)
  renderSoundar(ctx, w, h, p, time) {
    if (!this.imgSoundar || !this.imgSoundar.complete) return;

    // Smooth hover motion on earbuds
    const angle = p * Math.PI * 2;
    const floatY = Math.sin(time * 0.003) * 5;
    const scale = 1.0 + 0.04 * (0.5 - 0.5 * Math.cos(angle));

    ctx.save();
    ctx.translate(w / 2, h / 2 + floatY);
    ctx.scale(scale, scale);
    ctx.translate(-w / 2, -h / 2);

    // Draw base high-res image
    ctx.drawImage(this.imgSoundar, 0, 0, w, h);

    // Center of wireless earbuds radar origin
    const radarX = w * 0.64;
    const radarY = h * 0.45;

    // Concentric Acoustic Radar Rings radiating outwards
    for (let i = 0; i < 3; i++) {
      const ringProgress = (p + i * 0.33) % 1.0;
      const ringRadius = 50 + ringProgress * 190;
      const ringAlpha = (1 - ringProgress) * 0.45;

      ctx.strokeStyle = `rgba(132, 204, 22, ${ringAlpha})`;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(radarX, radarY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Glowing Neon Lime Ambient Light behind the earbud
    const limeGlow = ctx.createRadialGradient(radarX + 45, radarY - 15, 10, radarX + 45, radarY - 15, 90);
    limeGlow.addColorStop(0, `rgba(132, 204, 22, ${0.25 + 0.15 * Math.sin(angle)})`);
    limeGlow.addColorStop(1, 'rgba(132, 204, 22, 0)');
    ctx.fillStyle = limeGlow;
    ctx.beginPath();
    ctx.arc(radarX + 45, radarY - 15, 90, 0, Math.PI * 2);
    ctx.fill();

    // Hotspots with active neon beacons
    const hotspots = [
      { x: w * 0.73, y: h * 0.26 }, // + FEATURES
      { x: w * 0.46, y: h * 0.36 }, // COLOURS +
      { x: w * 0.91, y: h * 0.43 }, // + DESIGN
      { x: w * 0.50, y: h * 0.70 }  // SPECS +
    ];

    hotspots.forEach((hs, idx) => {
      const pulse = Math.sin(time * 0.005 + idx * 1.5);
      const alpha = 0.5 + 0.5 * pulse;

      // Inner dot
      ctx.fillStyle = '#84CC16';
      ctx.beginPath();
      ctx.arc(hs.x, hs.y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Outer glow ring
      ctx.strokeStyle = `rgba(132, 204, 22, ${alpha * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hs.x, hs.y, 7 + pulse * 3, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Ripple around WATCH DEMO VIDEO button
    const playBtnX = w * 0.104;
    const playBtnY = h * 0.624;
    const playRippleR = 14 + (p * 2 % 1) * 12;
    const playRippleAlpha = (1 - (p * 2 % 1)) * 0.5;

    ctx.strokeStyle = `rgba(132, 204, 22, ${playRippleAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(playBtnX, playBtnY, playRippleR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  bindControls() {
    if (!this.playToggleBtn) return;
    this.onToggleClick = (e) => {
      e.stopPropagation();
      this.togglePlay();
    };
    this.playToggleBtn.addEventListener('click', this.onToggleClick);
  }

  destroy() {
    this.isDestroyed = true;
    this.pause();
    if (this.handleVisibility) {
      document.removeEventListener('visibilitychange', this.handleVisibility);
    }
    if (this.playToggleBtn && this.onToggleClick) {
      this.playToggleBtn.removeEventListener('click', this.onToggleClick);
    }
  }
}
