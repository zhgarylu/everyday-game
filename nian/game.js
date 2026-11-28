// 烟花炸年兽 · 回声游戏厅第 16 期
// 除夕夜在楼顶摆烟花炮阵，轰碎年兽一层层的鳞甲，最后把年兽本体炸跑。
// 逻辑坐标固定 450 × 800 竖屏，整块舞台按窗口等比缩放。
(() => {
  'use strict';

  /* ================= 基本常量 ================= */
  const VW = 450, VH = 800, CX = 225;
  const GROUND = 738;            // 楼顶地面
  const GUN_Y = 702;             // 主炮口
  const DOME_CY = 842, DOME_R = 172; // 门神结界，顶点 y = 670
  const TOTAL = 25;              // 鳞甲总层数，打完年兽现身
  let TOUGH = 0.7;
  let XPC = 0.15;
  let BOSS_HP = 75000;                // 每抠掉一格鳞甲给多少经验               // 每往后一层，鳞甲硬多少
  const PRESS_MAX = 180;         // 鳞甲最多压下来多少
  const TAU = Math.PI * 2;
  const $ = (id) => document.getElementById(id);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ================= 声音：全部 Web Audio 现场合成 ================= */
  const AU = { ctx: null, out: null, noise: null, on: true, last: {} };
  function auInit() {
    if (!AU.on) return;
    if (!AU.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        AU.ctx = new AC();
        const comp = AU.ctx.createDynamicsCompressor();
        comp.threshold.value = -14; comp.ratio.value = 5;
        AU.out = AU.ctx.createGain(); AU.out.gain.value = 0.9;
        AU.out.connect(comp); comp.connect(AU.ctx.destination);
        const n = AU.ctx.sampleRate;
        AU.noise = AU.ctx.createBuffer(1, n, n);
        const d = AU.noise.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { AU.ctx = null; return; }
    }
    if (AU.ctx.state === 'suspended') AU.ctx.resume().catch(() => {});
  }
  const live = () => AU.on && AU.ctx && AU.ctx.state === 'running';
  function gate(name, gap) {
    const t = AU.ctx.currentTime;
    if ((AU.last[name] || -1) + gap > t) return false;
    AU.last[name] = t; return true;
  }
  function tone(type, f0, f1, dur, vol, delay = 0) {
    const c = AU.ctx, t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.01, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(AU.out);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function hiss(dur, vol, type, f0, f1, q = 1, delay = 0) {
    const c = AU.ctx, t = c.currentTime + delay;
    const s = c.createBufferSource(); s.buffer = AU.noise;
    s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(AU.out);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  const sfx = {
    shot() { if (!live() || !gate('shot', 0.055)) return; tone('triangle', 1500 + rnd(-150, 150), 520, 0.06, 0.022); hiss(0.05, 0.018, 'highpass', 5000, 7000); },
    hit(crit) { if (!live() || !gate('hit', 0.045)) return; tone(crit ? 'square' : 'triangle', crit ? 1900 : rnd(1200, 1600), crit ? 460 : 360, crit ? 0.055 : 0.035, crit ? 0.028 : 0.016); },
    carve() { if (!live() || !gate('carve', 0.07)) return; hiss(0.07, 0.035, 'bandpass', 2600, 800, 2.2); },
    boom(p = 1) {
      if (!live() || !gate('boom', 0.05)) return;
      tone('sine', 150 * p, 32, 0.3, Math.min(0.24, 0.15 * p));
      hiss(0.28, Math.min(0.16, 0.1 * p), 'lowpass', 2400, 200);
    },
    bang() { if (!live() || !gate('bang', 0.06)) return; tone('sine', 220, 60, 0.12, 0.14); hiss(0.1, 0.12, 'lowpass', 3000, 400); },
    crackle(n = 8, vol = 0.05) {
      if (!live()) return;
      let d = 0;
      for (let i = 0; i < n; i++) { d += rnd(0.012, 0.05); hiss(rnd(0.012, 0.03), vol * rnd(0.5, 1.1), 'highpass', rnd(1500, 3200), 900, 0.7, d); }
    },
    beam() { if (!live() || !gate('beam', 0.25)) return; hiss(0.6, 0.06, 'bandpass', 3200, 6500, 1.2); tone('sawtooth', 520, 240, 0.55, 0.03); },
    zap() { if (!live() || !gate('zap', 0.09)) return; tone('sawtooth', 1900, 420, 0.09, 0.04); hiss(0.06, 0.03, 'highpass', 6000, 3000); },
    gong() {
      if (!live()) return;
      const f = 196;
      [[1, 0.13], [1.48, 0.07], [2.07, 0.05], [2.74, 0.035], [3.36, 0.025]].forEach(([r, v]) => tone('sine', f * r, f * r * 0.94, 1.5, v));
      tone('sawtooth', 120, 28, 0.5, 0.12);
      hiss(0.8, 0.09, 'highpass', 3000, 1500, 0.6);
    },
    domeHit() { if (!live() || !gate('dome', 0.08)) return; tone('sine', 190, 50, 0.35, 0.2); hiss(0.2, 0.06, 'lowpass', 1200, 200); },
    level(evo) {
      if (!live()) return;
      const n = evo ? [523, 659, 784, 1047, 1319, 1568] : [523, 587, 659, 784, 1047];
      n.forEach((f, i) => tone(evo ? 'sawtooth' : 'triangle', f, f, 0.3, evo ? 0.04 : 0.06, i * 0.055));
    },
    roar() {
      if (!live() || !gate('roar', 0.6)) return;
      const c = AU.ctx, t = c.currentTime;
      const o = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain(), f = c.createBiquadFilter(), g = c.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(62, t + 0.9);
      lfo.frequency.value = 24; lg.gain.value = 14; lfo.connect(lg); lg.connect(o.frequency);
      f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = 3;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.16, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
      o.connect(f); f.connect(g); g.connect(AU.out);
      o.start(t); lfo.start(t); o.stop(t + 1.05); lfo.stop(t + 1.05);
      hiss(0.9, 0.06, 'lowpass', 900, 160, 1);
    },
    whistle(dur = 0.55) { if (!live()) return; tone('sine', 700, 2600, dur, 0.035); },
    bigBoom() {
      if (!live()) return;
      tone('sine', 110, 26, 0.8, 0.3);
      hiss(0.9, 0.2, 'lowpass', 3500, 120, 0.8);
      sfx.crackle(26, 0.05);
    },
  };

  /* ================= 舞台与画布 ================= */
  const wrap = $('wrap'), cv = $('cv'), ctx = cv.getContext('2d', { alpha: false });
  let K = 1;                 // 逻辑像素 → 画布像素
  let Q = 2;                 // 鳞甲离屏画布的精度
  function fit() {
    const s = Math.min(window.innerWidth / VW, window.innerHeight / VH);
    wrap.style.transform = `scale(${s})`;
    const dpr = window.devicePixelRatio || 1;
    K = Math.min(3, Math.max(1, s * dpr));
    cv.width = Math.round(VW * K); cv.height = Math.round(VH * K);
    Q = Math.min(2, Math.max(1, K));
    buildBackdrop();
  }

  /* ================= 鳞甲（可被一点点轰碎的弧形护甲） ================= */
  const IR = 232, OR = 270, HA = 49.5 * Math.PI / 180;
  const BX0 = -Math.ceil(OR * Math.sin(HA)) - 16, BX1 = -BX0;
  const BY0 = -OR - 16, BY1 = -Math.floor(IR * Math.cos(HA)) + 16;
  const LW = BX1 - BX0, LH = BY1 - BY0;
  const STEP = 3, GW = Math.ceil(LW / STEP), GH = Math.ceil(LH / STEP);
  const SLOTS = [
    { cy: 556, s: 1.0 }, { cy: 512, s: 0.968 }, { cy: 470, s: 0.936 }, { cy: 430, s: 0.904 }, { cy: 392, s: 0.872 },
  ];
  const PAL = [
    { name: '青鳞', a: '#14605a', b: '#062624', s: '#2f9c84', sh: '#a8ffe4', rim: '#ffd24a', hot: '#ff8a2a', char: '#1a0a04' },
    { name: '赤鳞', a: '#8c1424', b: '#2c040c', s: '#d83a50', sh: '#ffc0b0', rim: '#ffd24a', hot: '#ffd05a', char: '#200404' },
    { name: '紫鳞', a: '#4a1c82', b: '#16062e', s: '#8a4ad8', sh: '#ecc8ff', rim: '#ffd88a', hot: '#ff7ad0', char: '#12041e' },
    { name: '玄鳞', a: '#203458', b: '#070c1c', s: '#4a6cb0', sh: '#c8dcff', rim: '#ffe6a0', hot: '#7df0ff', char: '#040818' },
    { name: '金鳞', a: '#5a420c', b: '#1a1002', s: '#c8961e', sh: '#fff0b0', rim: '#fff4c0', hot: '#ff5a2a', char: '#1c0c00' },
  ];
  const STAGES = ['腊月廿九', '除夕傍晚', '年夜饭', '春晚开场', '守岁', '子时 · 年兽现身'];

  function sectorPath(g, cx, cy, ir, or, ha) {
    g.beginPath();
    g.arc(cx, cy, or, -Math.PI / 2 - ha, -Math.PI / 2 + ha, false);
    g.arc(cx, cy, ir, -Math.PI / 2 + ha, -Math.PI / 2 - ha, true);
    g.closePath();
  }
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  // 碰撞网格模板
  const GRID0 = new Uint8Array(GW * GH);
  let GRID0_N = 0;
  for (let gy = 0; gy < GH; gy++) {
    const ly = BY0 + (gy + 0.5) * STEP;
    for (let gx = 0; gx < GW; gx++) {
      const lx = BX0 + (gx + 0.5) * STEP;
      const r2 = lx * lx + ly * ly;
      if (r2 >= IR * IR && r2 <= OR * OR && Math.abs(Math.atan2(lx, -ly)) <= HA) { GRID0[gy * GW + gx] = 1; GRID0_N++; }
    }
  }

  // 每种鳞色一张贴图、一张整扇形遮罩、两张临时画布（随精度重建）
  let TEX = [], SECTOR = null, SCR1 = null, SCR2 = null, texQ = 0;
  function buildTextures() {
    texQ = Q;
    const pw = Math.ceil(LW * Q), ph = Math.ceil(LH * Q);
    SECTOR = mk(pw, ph);
    const sg = SECTOR.getContext('2d'); sg.scale(Q, Q); sg.fillStyle = '#fff';
    sectorPath(sg, -BX0, -BY0, IR, OR, HA); sg.fill();
    SCR1 = mk(pw, ph); SCR2 = mk(pw, ph);
    TEX = PAL.map((p, pi) => {
      const c = mk(pw, ph), g = c.getContext('2d');
      g.scale(Q, Q);
      const ox = -BX0, oy = -BY0;
      g.save();
      sectorPath(g, ox, oy, IR, OR, HA); g.clip();
      const gr = g.createRadialGradient(ox, oy, IR, ox, oy, OR);
      gr.addColorStop(0, p.b); gr.addColorStop(0.45, p.a); gr.addColorStop(1, p.b);
      g.fillStyle = gr; g.fillRect(0, 0, LW, LH);
      // 一排排鱼鳞
      const rows = 4;
      for (let row = rows; row >= 0; row--) {
        const r = IR + 2 + row * ((OR - IR) / rows);
        const sz = 10.5 - row * 0.3;
        const n = Math.ceil((HA * 2 * r) / (sz * 1.75));
        for (let i = -1; i <= n + 1; i++) {
          const a = -Math.PI / 2 - HA + ((i + (row % 2) * 0.5) / n) * HA * 2;
          const x = ox + Math.cos(a) * r, y = oy + Math.sin(a) * r;
          g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2);
          g.beginPath(); g.moveTo(-sz, 0); g.quadraticCurveTo(-sz, sz * 1.5, 0, sz * 1.6); g.quadraticCurveTo(sz, sz * 1.5, sz, 0); g.closePath();
          const sgr = g.createLinearGradient(0, 0, 0, sz * 1.6);
          sgr.addColorStop(0, p.s); sgr.addColorStop(1, p.b);
          g.fillStyle = sgr; g.fill();
          g.strokeStyle = p.sh; g.globalAlpha = 0.55; g.lineWidth = 1.1;
          g.beginPath(); g.moveTo(-sz * 0.8, sz * 0.6); g.quadraticCurveTo(0, sz * 1.5, sz * 0.8, sz * 0.6); g.stroke();
          g.globalAlpha = 1;
          g.restore();
        }
      }
      // 中线金纹与铆钉
      g.strokeStyle = p.rim; g.globalAlpha = 0.55; g.lineWidth = 1.4;
      g.beginPath(); g.arc(ox, oy, (IR + OR) / 2, -Math.PI / 2 - HA, -Math.PI / 2 + HA); g.stroke();
      g.globalAlpha = 1;
      for (let i = 0; i <= 12; i++) {
        const a = -Math.PI / 2 - HA + (i / 12) * HA * 2, r = (IR + OR) / 2;
        const x = ox + Math.cos(a) * r, y = oy + Math.sin(a) * r;
        const rg = g.createRadialGradient(x - 1, y - 1, 0, x, y, 4);
        rg.addColorStop(0, '#fffbe0'); rg.addColorStop(0.5, p.rim); rg.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = rg; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill();
      }
      g.restore();
      // 内外描金边
      g.lineJoin = 'round';
      sectorPath(g, ox, oy, IR + 1.5, OR - 1.5, HA - 0.004);
      g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 4; g.stroke();
      g.strokeStyle = p.rim; g.lineWidth = 2.2; g.stroke();
      g.strokeStyle = 'rgba(255,255,240,0.75)'; g.lineWidth = 0.8; g.stroke();
      void pi;
      return c;
    });
  }

  const RING8 = Array.from({ length: 8 }, (_, i) => [Math.cos(i / 8 * TAU), Math.sin(i / 8 * TAU)]);

  class Layer {
    constructor(n, slot) {
      this.n = n; this.pi = Math.min(4, Math.floor(n / 5)); this.pal = PAL[this.pi];
      this.slot = slot;
      this.cy = SLOTS[slot].cy; this.vy = 0; this.s = SLOTS[slot].s; this.vs = 0;
      this.tough = 1 + n * TOUGH;
      this.grid = GRID0.slice(); this.alive = GRID0_N;
      this.mask = null; this.rc = null; this.dirty = false; this.damaged = false;
      this.heat = []; this.flash = 0;
    }
    integrity() { return this.alive / GRID0_N; }
    toLocal(x, y) { return [(x - CX) / this.s, (y - this.cy) / this.s]; }
    toWorld(lx, ly) { return [CX + lx * this.s, this.cy + ly * this.s]; }
    hit(x, y) {
      const lx = (x - CX) / this.s, ly = (y - this.cy) / this.s;
      const gx = ((lx - BX0) / STEP) | 0, gy = ((ly - BY0) / STEP) | 0;
      if (lx < BX0 || ly < BY0 || gx >= GW || gy >= GH) return false;
      return this.grid[gy * GW + gx] === 1;
    }
    ensure() {
      if (this.mask && this.mask.width === Math.ceil(LW * texQ)) return;
      const pw = Math.ceil(LW * texQ), ph = Math.ceil(LH * texQ);
      const old = this.mask;
      this.mask = mk(pw, ph);
      const mg = this.mask.getContext('2d');
      // 精度变了就把旧遮罩缩放过来；第一次受伤从整块开始，坑由随后的抠图画出
      if (old) mg.drawImage(old, 0, 0, pw, ph); else mg.drawImage(SECTOR, 0, 0);
      mg.scale(texQ, texQ);
      this.mg = mg;
      this.rc = mk(pw, ph); this.rg = this.rc.getContext('2d');
      this.dirty = true;
    }
    carve(x, y, rad, blast) {
      const [lx, ly] = this.toLocal(x, y);
      const er = (rad / this.s) / Math.sqrt(this.tough);
      const span = Math.ceil((er + 2) / STEP);
      const cgx = Math.floor((lx - BX0) / STEP), cgy = Math.floor((ly - BY0) / STEP);
      const x0 = Math.max(0, cgx - span), x1 = Math.min(GW - 1, cgx + span);
      const y0 = Math.max(0, cgy - span), y1 = Math.min(GH - 1, cgy + span);
      const r2 = er * er;
      let n = 0;
      for (let gy = y0; gy <= y1; gy++) {
        const dy = BY0 + (gy + 0.5) * STEP - ly, row = gy * GW;
        for (let gx = x0; gx <= x1; gx++) {
          const i = row + gx;
          if (!this.grid[i]) continue;
          const dx = BX0 + (gx + 0.5) * STEP - lx;
          if (dx * dx + dy * dy <= r2) { this.grid[i] = 0; n++; }
        }
      }
      if (!n) return 0;
      this.alive -= n; this.damaged = true; this.dirty = true; this.flash = Math.min(1, this.flash + 0.25);
      this.ensure();
      const g = this.mg, mx = lx - BX0, my = ly - BY0;
      g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
      g.beginPath(); g.ellipse(mx, my, er * rnd(0.94, 1.1), er * rnd(0.94, 1.1), Math.random() * 3, 0, TAU); g.fill();
      if (blast) for (let k = 0; k < 4; k++) {
        const a = k / 4 * TAU + Math.random(), o = er * rnd(0.35, 0.55);
        g.beginPath(); g.arc(mx + Math.cos(a) * o, my + Math.sin(a) * o, er * rnd(0.45, 0.7), 0, TAU); g.fill();
      }
      g.restore();
      this.heat.push({ lx, ly, r: Math.max(10, er * 1.15), life: 0.4 });
      if (this.heat.length > 16) this.heat.shift();
      return n;
    }
    carveBeam(x0, y0, dx, dy, len, hw) {
      const [ax, ay] = this.toLocal(x0, y0), [bx, by] = this.toLocal(x0 + dx * len, y0 + dy * len);
      const L = Math.hypot(bx - ax, by - ay); if (L < 1) return 0;
      const nx = (bx - ax) / L, ny = (by - ay) / L;
      const ehw = (hw / this.s) / Math.sqrt(this.tough), hw2 = ehw * ehw;
      const span = Math.ceil((ehw + 2) / STEP);
      let n = 0, t0 = -1, t1 = -1;
      for (let t = 0; t <= L; t += STEP * 1.1) {
        const px = ax + nx * t, py = ay + ny * t;
        if (px < BX0 - ehw || px > BX1 + ehw || py < BY0 - ehw || py > BY1 + ehw) continue;
        const cgx = Math.floor((px - BX0) / STEP), cgy = Math.floor((py - BY0) / STEP);
        let any = false;
        for (let oy = -span; oy <= span; oy++) {
          const gy = cgy + oy; if (gy < 0 || gy >= GH) continue;
          const qy = BY0 + (gy + 0.5) * STEP - py, row = gy * GW;
          for (let ox = -span; ox <= span; ox++) {
            const gx = cgx + ox; if (gx < 0 || gx >= GW) continue;
            const i = row + gx; if (!this.grid[i]) continue;
            const qx = BX0 + (gx + 0.5) * STEP - px;
            if (qx * qx + qy * qy <= hw2) { this.grid[i] = 0; n++; any = true; }
          }
        }
        if (any) { if (t0 < 0) t0 = t; t1 = t; }
      }
      if (!n) return 0;
      this.alive -= n; this.damaged = true; this.dirty = true;
      this.ensure();
      const g = this.mg;
      g.save(); g.globalCompositeOperation = 'destination-out'; g.strokeStyle = '#000'; g.lineCap = 'round'; g.lineWidth = ehw * 2.05;
      g.beginPath(); g.moveTo(ax + nx * (t0 - 5) - BX0, ay + ny * (t0 - 5) - BY0); g.lineTo(ax + nx * (t1 + 5) - BX0, ay + ny * (t1 + 5) - BY0); g.stroke();
      g.restore();
      const tm = (t0 + t1) / 2;
      this.heat.push({ lx: ax + nx * tm, ly: ay + ny * tm, r: ehw * 2.6, life: 0.3 });
      if (this.heat.length > 16) this.heat.shift();
      return n;
    }
    randomAlive(side = 0) {
      for (let k = 0; k < 30; k++) {
        const gx = (Math.random() * GW) | 0, gy = (Math.random() * GH) | 0;
        if (this.grid[gy * GW + gx]) {
          const [x, y] = this.toWorld(BX0 + (gx + 0.5) * STEP, BY0 + (gy + 0.5) * STEP);
          if (!side || (side < 0 && x <= CX + 40) || (side > 0 && x >= CX - 40)) return { x, y };
        }
      }
      for (let gy = GH - 1; gy >= 0; gy -= 2) for (let gx = 0; gx < GW; gx += 2) {
        if (this.grid[gy * GW + gx]) { const [x, y] = this.toWorld(BX0 + (gx + 0.5) * STEP, BY0 + (gy + 0.5) * STEP); return { x, y }; }
      }
      return null;
    }
    angleBounds(ox, oy) {
      let lo = Infinity, hi = -Infinity;
      for (let gy = 0; gy < GH; gy += 4) {
        const row = gy * GW, ly = BY0 + (gy + 0.5) * STEP;
        for (let gx = 0; gx < GW; gx += 4) {
          if (!this.grid[row + gx]) continue;
          const [x, y] = this.toWorld(BX0 + (gx + 0.5) * STEP, ly);
          const a = Math.atan2(y - oy, x - ox);
          if (a < lo) lo = a; if (a > hi) hi = a;
        }
      }
      return [lo, hi];
    }
    // 内弧上某个角度的世界坐标（挂鞭用）
    edgePoint(theta, r = IR + 9) { return this.toWorld(Math.sin(theta) * r, -Math.cos(theta) * r); }
    spring(dt, ty) {
      const ts = SLOTS[this.slot].s;
      this.vy += (-150 * (this.cy - ty) - 16 * this.vy) * dt; this.cy += this.vy * dt;
      this.vs += (-150 * (this.s - ts) - 16 * this.vs) * dt; this.s += this.vs * dt;
      this.flash = Math.max(0, this.flash - dt * 4);
      for (let i = this.heat.length - 1; i >= 0; i--) { this.heat[i].life -= dt; if (this.heat[i].life <= 0) this.heat.splice(i, 1); }
    }
    rebuild() {
      this.dirty = false;
      const pw = this.rc.width, ph = this.rc.height, rg = this.rg, p = this.pal;
      rg.globalCompositeOperation = 'copy'; rg.globalAlpha = 1; rg.drawImage(TEX[this.pi], 0, 0);
      rg.globalCompositeOperation = 'destination-in'; rg.drawImage(this.mask, 0, 0);
      // 弹坑：整扇形减去现存 = 坑
      const a = SCR1.getContext('2d'), b = SCR2.getContext('2d');
      a.globalCompositeOperation = 'copy'; a.drawImage(SECTOR, 0, 0);
      a.globalCompositeOperation = 'destination-out'; a.drawImage(this.mask, 0, 0);
      const ring = (rad, color, alpha) => {
        b.globalCompositeOperation = 'source-over'; b.clearRect(0, 0, pw, ph);
        for (let i = 0; i < 8; i++) b.drawImage(SCR1, RING8[i][0] * rad * texQ, RING8[i][1] * rad * texQ);
        b.globalCompositeOperation = 'source-in'; b.fillStyle = color; b.fillRect(0, 0, pw, ph);
        rg.globalCompositeOperation = 'source-atop'; rg.globalAlpha = alpha; rg.drawImage(SCR2, 0, 0); rg.globalAlpha = 1;
      };
      ring(5, p.char, 0.35);
      ring(3, p.hot, 0.95);
      ring(1.2, '#fff6d0', 0.6);
      rg.globalCompositeOperation = 'source-over';
    }
    draw(g, warn) {
      g.save();
      g.translate(CX, this.cy); g.scale(this.s, this.s);
      if (this.damaged) {
        if (this.rc.width !== Math.ceil(LW * texQ)) this.ensure();
        g.drawImage(this.rc, BX0, BY0, LW, LH);
      } else g.drawImage(TEX[this.pi], BX0, BY0, LW, LH);
      if (this.flash > 0.02 || warn > 0) {
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = Math.min(0.5, this.flash * 0.35 + warn * 0.35);
        g.drawImage(this.damaged ? this.rc : TEX[this.pi], BX0, BY0, LW, LH);
        g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      }
      if (this.heat.length) {
        g.globalCompositeOperation = 'lighter';
        for (const h of this.heat) {
          const k = h.life / 0.4;
          const gr = g.createRadialGradient(h.lx, h.ly, 0, h.lx, h.ly, h.r * 1.5);
          gr.addColorStop(0, `rgba(255,240,190,${0.75 * k})`); gr.addColorStop(0.4, `rgba(255,140,40,${0.45 * k})`); gr.addColorStop(1, 'rgba(255,60,0,0)');
          g.fillStyle = gr; g.beginPath(); g.arc(h.lx, h.ly, h.r * 1.5, 0, TAU); g.fill();
        }
        g.globalCompositeOperation = 'source-over';
      }
      g.restore();
    }
  }

  /* ================= 游戏状态 ================= */
  const W_KEYS = ['rocket', 'fount', 'kick', 'spark', 'whip'];
  const MAXLV = 6;
  let mode = 'title';           // title | play | lvl | pause | over
  let S = null;                 // 当前一局
  let layers = [];
  const bullets = [], missiles = [], foes = [], parts = [], rings = [], nums = [], coins = [], beams = [], bolts = [], pops = [], shells = [], shards = [], ambient = [];
  const MAXP = 1100;
  const B = { x: CX, y: 112, s: 0.82, ty: 112, ts: 0.82, hp: 1, max: 1, active: false, mouth: 0, flash: 0, roar: 0, blink: 0, ex: 0, ey: 1, spitT: 2, bombT: 6, dying: 0, gone: false, rage: 0 };

  function newRun() {
    S = {
      t: 0, hp: 3000, max: 3000, lv: 1, xp: 0, xpMax: 100, cool: 0, speed: S ? S.speed : 1,
      levels: { rocket: 1, fount: 0, kick: 0, spark: 0, whip: 0 },
      broken: 0, kills: 0, bags: 0, stage: 0, press: 0, ult: 0,
      aim: -Math.PI / 2, aimT: -Math.PI / 2, sweep: 1, fireCd: 0, parity: 0, recoil: 0, muzzle: 0,
      kickT: 0.8, kickRec: [0, 0], fountT: 1.0, fountCharge: 0, sparkT: 0.9, whipT: 6,
      spawnT: 2.2, bagT: 16, shake: 0, stop: 0, slow: 0, flash: 0, domeFlash: 0, toastT: 0,
      ptr: false, px: CX, py: 300, auto: S ? S.auto : false, score: 0, won: false, endT: 0, dawn: 0, warn: 0,
    };
    layers = [];
    for (let i = 0; i < 5; i++) layers.push(new Layer(i, i));
    S.spawned = 5;
    [bullets, missiles, foes, parts, rings, nums, coins, beams, bolts, pops, shells, shards].forEach((a) => (a.length = 0));
    Object.assign(B, { x: CX, y: 112, s: 0.82, ty: 112, ts: 0.82, active: false, mouth: 0, flash: 0, roar: 0, spitT: 2, bombT: 6, dying: 0, gone: false, rage: 0, hp: 1, max: 1 });
  }

  /* ================= 粒子与特效 ================= */
  function part(o) { if (parts.length < MAXP) parts.push(o); }
  // 0 光点 1 拖尾星 2 纸屑 3 烟
  function spark(x, y, n, sp, colors, g = 260, life = 0.5, size = 2.2) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, v = sp * rnd(0.3, 1);
      part({ k: 0, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g, life: life * rnd(0.5, 1), max: life, size: size * rnd(0.6, 1.3), c: pick(colors), drag: 0.98 });
    }
  }
  function confetti(x, y, n, sp = 160) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, v = sp * rnd(0.2, 1);
      part({ k: 2, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, g: 120, life: rnd(0.7, 1.4), max: 1.4, size: rnd(2.5, 4.5), c: Math.random() < 0.85 ? '#e0182c' : '#ffd24a', drag: 0.93, rot: Math.random() * 6, vr: rnd(-12, 12) });
    }
  }
  function smoke(x, y, n, r = 10) {
    for (let i = 0; i < n; i++) part({ k: 3, x: x + rnd(-6, 6), y: y + rnd(-6, 6), vx: rnd(-20, 20), vy: rnd(-40, -10), g: -10, life: rnd(0.6, 1.2), max: 1.2, size: r * rnd(0.7, 1.3), c: 'rgba(200,180,190,', drag: 0.96 });
  }
  const FW_SETS = [
    ['#ffd24a', '#fff4c0', '#ffae30'], ['#ff3a4a', '#ff9aa0', '#ffd24a'], ['#7df0ff', '#e0ffff', '#4ab8ff'],
    ['#ff7ad0', '#ffd0f0', '#c86aff'], ['#7dff9a', '#e8ffd0', '#ffd24a'], ['#ffffff', '#ffd24a', '#ff5a2a'],
  ];
  // 一朵烟花：菊花形拖尾星
  function firework(x, y, n, sp, set, life = 1.2, g = 70) {
    const cols = set || pick(FW_SETS);
    const ringy = Math.random() < 0.35;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rnd(-0.05, 0.05);
      const v = sp * (ringy ? rnd(0.92, 1) : Math.sqrt(Math.random()) * rnd(0.85, 1.05));
      part({ k: 1, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g, life: life * rnd(0.7, 1), max: life, size: rnd(1.6, 2.6), c: cols[i % cols.length], drag: 0.965, glit: Math.random() < 0.5 });
    }
    part({ k: 4, x, y, life: 0.25, max: 0.25, size: sp * 0.5, c: cols[0], vx: 0, vy: 0, g: 0, drag: 1 });
  }
  function ring(x, y, max, life, color, w = 4) { rings.push({ x, y, r: 4, max, life, maxLife: life, color, w }); }
  function num(x, y, v, crit, color) {
    if (nums.length > 44) nums.shift();
    nums.push({ x: x + rnd(-8, 8), y, vy: crit ? -80 : -55, t: typeof v === 'string' ? v : String(Math.round(v)), crit, c: color || (crit ? '#ffdf4a' : '#fff0d8'), life: crit ? 0.85 : 0.65, max: crit ? 0.85 : 0.65 });
  }
  function coinBurst(x, y, total, n) {
    const per = total / n;
    for (let i = 0; i < n; i++) {
      if (coins.length > 70) { gainXp(per); continue; }
      const a = Math.random() * TAU, v = rnd(60, 170);
      coins.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, v: per, age: 0, spin: Math.random() * 6 });
    }
  }
  function shake(p) { S.shake = Math.max(S.shake, p); }
  function toast(msg, t = 2.4) { const el = $('toast'); el.textContent = msg; el.classList.add('show'); S.toastT = t; }

  /* ================= 经验与升级 ================= */
  function gainXp(v) { if (mode === 'play' || mode === 'lvl') S.xp += v; }
  function addUlt(v) { if (S.ult < 100) { S.ult = Math.min(100, S.ult + v); } }

  const META = {
    rocket: { name: '窜天猴', tag: '主炮', svg: '<svg viewBox="0 0 64 64"><g stroke-linecap="round"><path d="M20 54 L30 22" stroke="#c89a5a" stroke-width="2"/><path d="M32 56 L32 18" stroke="#c89a5a" stroke-width="2"/><path d="M44 54 L34 22" stroke="#c89a5a" stroke-width="2"/></g><g><rect x="26.5" y="8" width="7" height="16" rx="2" fill="#e0182c" stroke="#ffd24a" stroke-width="1.4"/><path d="M26.5 9 L30 3 L33.5 9Z" fill="#ffd24a"/><rect x="14" y="14" width="6" height="13" rx="2" fill="#e0182c" stroke="#ffd24a" stroke-width="1.2" transform="rotate(-18 17 20)"/><rect x="44" y="14" width="6" height="13" rx="2" fill="#e0182c" stroke="#ffd24a" stroke-width="1.2" transform="rotate(18 47 20)"/></g><g fill="#fff4a0"><circle cx="30" cy="40" r="1.6"/><circle cx="35" cy="46" r="1.2"/><circle cx="24" cy="44" r="1.3"/><circle cx="40" cy="38" r="1"/></g></svg>' },
    fount: { name: '火树银花', tag: '光柱', svg: '<svg viewBox="0 0 64 64"><path d="M22 58 L32 36 L42 58Z" fill="#e0182c" stroke="#ffd24a" stroke-width="1.6"/><rect x="21" y="48" width="22" height="4" fill="#ffd24a"/><g stroke="#fff4c0" stroke-width="1.6" stroke-linecap="round"><path d="M32 36 L32 6"/><path d="M32 36 Q22 20 14 12"/><path d="M32 36 Q42 20 50 12"/><path d="M32 36 Q18 30 8 28"/><path d="M32 36 Q46 30 56 28"/></g><g fill="#ffd24a"><circle cx="32" cy="6" r="2.4"/><circle cx="14" cy="12" r="2"/><circle cx="50" cy="12" r="2"/><circle cx="8" cy="28" r="1.8"/><circle cx="56" cy="28" r="1.8"/></g></svg>' },
    kick: { name: '二踢脚', tag: '炮台', svg: '<svg viewBox="0 0 64 64"><g transform="rotate(-20 32 34)"><rect x="24" y="16" width="16" height="38" rx="3" fill="#c8102e" stroke="#ffd24a" stroke-width="1.8"/><rect x="24" y="24" width="16" height="4" fill="#ffd24a"/><rect x="24" y="42" width="16" height="4" fill="#ffd24a"/><path d="M32 16 Q30 9 35 5" stroke="#c89a5a" stroke-width="2" fill="none"/></g><g stroke="#fff0a0" stroke-width="2.2" stroke-linecap="round"><path d="M44 8 L50 4"/><path d="M47 14 L56 13"/><path d="M41 5 L41 0"/></g><circle cx="42" cy="8" r="3.4" fill="#fff4c0"/></svg>' },
    spark: { name: '滋花', tag: '连锁电光', svg: '<svg viewBox="0 0 64 64"><path d="M20 60 L44 60 L40 42 L24 42Z" fill="#2a5aa0" stroke="#7df0ff" stroke-width="1.6"/><g stroke="#9aa0a8" stroke-width="2" stroke-linecap="round"><path d="M28 42 L22 14"/><path d="M32 42 L32 10"/><path d="M36 42 L42 14"/></g><g fill="none" stroke="#fff6c0" stroke-width="1.6" stroke-linecap="round"><path d="M22 14 l-7 -4 M22 14 l-6 4 M22 14 l2 -8"/><path d="M32 10 l-4 -7 M32 10 l5 -6 M32 10 l7 2"/><path d="M42 14 l7 -4 M42 14 l6 4 M42 14 l-1 -8"/></g><circle cx="22" cy="14" r="2.4" fill="#fff"/><circle cx="32" cy="10" r="2.6" fill="#fff"/><circle cx="42" cy="14" r="2.4" fill="#fff"/></svg>' },
    whip: { name: '千响挂鞭', tag: '回血 · 守家', svg: '<svg viewBox="0 0 64 64"><path d="M10 6 Q30 22 52 60" stroke="#c89a5a" stroke-width="1.6" fill="none"/><g fill="#e0182c" stroke="#ffd24a" stroke-width="1"><rect x="14" y="10" width="5" height="10" rx="1" transform="rotate(-50 16 15)"/><rect x="22" y="17" width="5" height="10" rx="1" transform="rotate(-45 24 22)"/><rect x="29" y="25" width="5" height="10" rx="1" transform="rotate(-40 31 30)"/><rect x="35" y="33" width="5" height="10" rx="1" transform="rotate(-35 37 38)"/><rect x="40" y="42" width="5" height="10" rx="1" transform="rotate(-30 42 47)"/></g><circle cx="50" cy="58" r="5" fill="#fff4c0"/><g stroke="#ffd24a" stroke-width="2" stroke-linecap="round"><path d="M56 52 L61 48"/><path d="M57 60 L63 62"/><path d="M45 54 L42 49"/></g></svg>' },
    hong: { name: '压岁红包', tag: '奖励', svg: '<svg viewBox="0 0 64 64"><rect x="14" y="8" width="36" height="50" rx="4" fill="#d8102c" stroke="#ffd24a" stroke-width="2"/><path d="M14 20 Q32 32 50 20" fill="none" stroke="#ffd24a" stroke-width="2"/><circle cx="32" cy="30" r="7" fill="#ffd24a"/><text x="32" y="34" font-size="9" text-anchor="middle" fill="#a3121c" font-weight="900">福</text></svg>' },
  };
  function desc(k, lv) {
    // lv：升级前的等级
    switch (k) {
      case 'rocket': return [
        '', '一次窜两只，射速更快', '进阶 · 爆花弹头：打中就炸出一圈碎花溅射', '三连发，暴击率提高', '进阶 · 双爆金猴：碎花更大更多，射速再提', '四连发窜天猴风暴，射速拉满',
      ][lv];
      case 'fount': return [
        '在楼顶摆一座火树银花，喷出金色光柱，一道道直接穿透多层鳞甲', '左右两座一起喷，光柱更粗', '进阶 · 银河扫射：光柱喷射时左右横扫', '充能更快，光柱更粗更烫', '进阶 · 双花并蒂：每座同时喷两道', '光柱持续更久，伤害翻倍',
      ][lv];
      case 'kick': return [
        '摆上二踢脚：地上一响、天上一响，拐弯追着煞火和鳞甲炸出大坑', '左右两桶一起放', '进阶 · 紫金二踢脚：每桶四连发扇形齐射', '五连发，爆炸范围更大', '进阶 · 六连发，炸点带火圈二次爆炸', '七连发，装填更快',
      ][lv];
      case 'spark': return [
        '插一瓶滋花：电光一跳一跳连着打，专拦煞火', '左右两瓶，连跳次数更多', '进阶 · 金蛇乱舞：电光让煞火减速', '放电更快，没有煞火时会去滋鳞甲', '进阶 · 电光变粗，连跳翻倍', '高频放电，几乎不停',
      ][lv];
      case 'whip': return [
        '门口挂一挂千响鞭：结界回 600 血、上限加 350，每隔几秒沿着最底层鳞甲噼里啪啦炸一圈',
        '再回 600 血，鞭更长、炸得更勤', '进阶 · 万响长鞭：结界每秒回血，受伤减少', '鞭炮威力更大，炸得更勤', '进阶 · 震天鞭：每轮鞭炮清掉低空所有煞火', '鞭炮几乎连着响',
      ][lv];
      case 'hong': return '结界回 500 血，再给一点大礼花能量';
    }
    return '';
  }
  function chooseCards() {
    if (S.lv === 1) return ['fount', 'rocket', 'kick'];
    const pool = W_KEYS.filter((k) => S.levels[k] < MAXLV);
    for (let i = pool.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
    // 有空槽时尽量给一张新武器
    const fresh = pool.filter((k) => S.levels[k] === 0);
    let out = pool.slice(0, 3);
    if (fresh.length && !out.some((k) => S.levels[k] === 0)) out[2] = fresh[0];
    while (out.length < 3) out.push('hong');
    return out;
  }
  let cardKeys = [];
  function openLevel() {
    mode = 'lvl'; S.ptr = false;
    cardKeys = chooseCards();
    // 装备栏
    $('slots').innerHTML = W_KEYS.map((k) => {
      const lv = S.levels[k];
      const dots = Array.from({ length: MAXLV }, (_, i) => `<i class="${i < lv ? (i === 2 || i === 4 ? 'e' : 'f') : ''}"></i>`).join('');
      return `<div class="slot"><div class="box ${lv ? 'has' : ''} ${lv >= 3 ? 'evo' : ''}">${lv ? META[k].svg + `<span class="lv">${lv}</span>` : ''}</div><div class="dots">${dots}</div></div>`;
    }).join('');
    $('cards').innerHTML = cardKeys.map((k, i) => {
      const lv = k === 'hong' ? 0 : S.levels[k];
      const evo = k !== 'hong' && (lv + 1 === 3 || lv + 1 === 5);
      const badge = k === 'hong' ? '奖励' : lv === 0 ? '新' : evo ? `进阶 Lv.${lv + 1}` : `Lv.${lv}→${lv + 1}`;
      return `<button class="card ${evo ? 'evo' : ''}" data-i="${i}"><span class="k">[${i + 1}]</span><div class="art">${META[k].svg}</div><div><h3 class="kai">${META[k].name}<em>${badge}</em></h3><p>${desc(k, lv)}</p></div></button>`;
    }).join('');
    $('cards').querySelectorAll('.card').forEach((el) => el.addEventListener('click', (e) => { e.stopPropagation(); takeCard(+el.dataset.i); }));
    $('lvl').classList.add('on');
    sfx.level(false);
    if (S.auto) setTimeout(() => { if (mode === 'lvl') takeCard(autoPick()); }, 120);
  }
  function autoPick() {
    let best = 0, bs = -1;
    cardKeys.forEach((k, i) => { const sc = k === 'hong' ? 0 : (S.levels[k] === 0 ? 5 : 8 - S.levels[k]) + (k === 'rocket' ? 2 : 0) + Math.random(); if (sc > bs) { bs = sc; best = i; } });
    return best;
  }
  function takeCard(i) {
    if (mode !== 'lvl') return;
    const k = cardKeys[i]; if (!k) return;
    auInit();
    $('lvl').classList.remove('on');
    mode = 'play';
    S.xp = Math.max(0, S.xp - S.xpMax);
    S.xpMax = Math.min(2400, Math.round(S.xpMax * 1.28 + 40));
    S.lv++;
    S.cool = 1.2;
    last = performance.now();
    if (k === 'hong') { S.hp = Math.min(S.max, S.hp + 500); addUlt(15); num(CX, 640, '+500', true, '#7dff9a'); sfx.level(false); return; }
    const evo = S.levels[k] + 1 === 3 || S.levels[k] + 1 === 5;
    S.levels[k]++;
    sfx.level(evo);
    const xs = padXs(k);
    xs.forEach((x) => { ring(x, GROUND - 20, 70, 0.5, evo ? '#ff9cff' : '#ffd24a', 3); spark(x, GROUND - 24, 18, 180, ['#ffd24a', '#fff4c0', evo ? '#ff9cff' : '#ff6a2a'], 200, 0.6); });
    shake(evo ? 6 : 3);
    if (k === 'whip') {
      S.max += 350; S.hp = Math.min(S.max, S.hp + 600);
      num(CX, 640, '+600', true, '#7dff9a');
      S.whipT = 0.3;
    }
    if (k === 'fount') S.fountT = Math.min(S.fountT, 0.3);
    if (k === 'kick') S.kickT = Math.min(S.kickT, 0.2);
    if (k === 'spark') S.sparkT = Math.min(S.sparkT, 0.2);
  }
  function padXs(k) {
    const lv = S.levels[k];
    if (k === 'rocket' || k === 'whip') return [CX];
    if (k === 'kick') return lv >= 2 ? [92, VW - 92] : [92];
    if (k === 'fount') return lv >= 2 ? [148, VW - 148] : [148];
    if (k === 'spark') return lv >= 2 ? [44, VW - 44] : [44];
    return [CX];
  }

  /* ================= 伤害结算 ================= */
  function hurtFoe(f, dmg, crit = false, kb = 1.5) {
    if (f.hp <= 0) return;
    f.hp -= dmg; f.flash = 1;
    if (f.kind !== 'bag') f.y -= kb;
    if (dmg < 9999) num(f.x, f.y - f.r * 0.7, dmg, crit);
    sfx.hit(crit);
    spark(f.x, f.y, crit ? 6 : 3, 140, ['#ffd876', '#ff6822'], 220, 0.4);
    if (f.hp <= 0) killFoe(f);
  }
  function killFoe(f) {
    f.hp = 0; S.kills++;
    if (f.kind === 'bag') {
      S.bags++;
      sfx.crackle(14, 0.06); sfx.level(true);
      firework(f.x, f.y, 60, 210, FW_SETS[0], 1.0, 90);
      confetti(f.x, f.y, 26, 220);
      coinBurst(f.x, f.y, 160 + S.stage * 40, 14);
      addUlt(22);
      num(f.x, f.y - 20, '福到了！', true, '#ffd24a');
      return;
    }
    const big = f.kind === 'iron';
    sfx.boom(big ? 0.95 : 0.6);
    shake(big ? 5 : 2.5);
    ring(f.x, f.y, f.r * 2.6, 0.3, big ? '#ff6a3a' : '#ffae40', 3);
    firework(f.x, f.y, big ? 34 : 18, big ? 170 : 120, big ? FW_SETS[1] : pick(FW_SETS), 0.6, 200);
    coinBurst(f.x, f.y, big ? 46 : 20, big ? 5 : 3);
    addUlt(big ? 4 : 1.5);
  }
  function hurtBoss(dmg, x, y, crit) {
    if (!B.active || B.dying) return;
    B.hp -= dmg; B.flash = Math.min(1, B.flash + 0.3);
    if (Math.random() < 0.35) num(x, y, dmg, crit, crit ? '#ffdf4a' : '#ffe8c8');
    if (Math.random() < 0.5) spark(x, y, 3, 160, ['#ffd876', '#ff6822', '#fff'], 200, 0.4);
    sfx.hit(crit);
    if (B.hp <= 0) bossDown();
  }
  function onCarve(n, x, y, blast) {
    if (n <= 0) return;
    gainXp(n * XPC);
    addUlt(n * 0.005);
    const sn = Math.min(blast ? 18 : 5, Math.max(2, Math.round(n * 0.25)));
    for (let i = 0; i < sn; i++) {
      const a = Math.random() * TAU, v = (blast ? 100 : 55) + Math.random() * (blast ? 210 : 120);
      part({ k: 0, x: x + rnd(-5, 5), y: y + rnd(-5, 5), vx: Math.cos(a) * v, vy: Math.sin(a) * v + 30, g: 280, life: rnd(0.25, 0.6), max: 0.6, size: rnd(1.5, 3), c: pick(['#fff0a8', '#ff9624', '#ff5614', layers[0] ? layers[0].pal.hot : '#ff9624']), drag: 0.98 });
    }
    sfx.carve();
    checkBreak();
  }
  // 在 (x,y) 处找最前面的一层鳞甲
  function layerAt(x, y) { for (let i = 0; i < layers.length; i++) if (layers[i].hit(x, y)) return layers[i]; return null; }

  function checkBreak() {
    if (!layers.length || layers[0].integrity() > 0.16) return;
    const L = layers.shift();
    layers.forEach((l, i) => { l.slot = i; });
    if (S.spawned < TOTAL) {
      const nl = new Layer(S.spawned++, layers.length);
      nl.cy = SLOTS[nl.slot].cy - 70; nl.s = SLOTS[nl.slot].s * 0.9;
      layers.push(nl);
    }
    S.broken++; (S.bt = S.bt || []).push(Math.round(S.t));
    S.press = Math.max(0, S.press - 48);
    S.stop = 0.06; shake(12);
    sfx.gong();
    addUlt(12);
    // 碎鳞飞散
    for (let i = 0; i < 30; i++) {
      const th = ((i + 0.5) / 30 - 0.5) * HA * 1.95, r = (IR + OR) / 2 + rnd(-12, 12);
      const [x, y] = L.toWorld(Math.sin(th) * r, -Math.cos(th) * r);
      const out = Math.atan2(y - L.cy, x - CX), v = rnd(110, 320);
      shards.push({ x, y, vx: Math.cos(out) * v + rnd(-80, 80), vy: Math.sin(out) * v - rnd(40, 140), rot: th, vr: rnd(-8, 8), sz: rnd(7, 13), life: rnd(0.8, 1.3), max: 1.3, pal: L.pal });
    }
    for (let i = 0; i < 50; i++) {
      const th = rnd(-HA, HA), r = rnd(IR, OR);
      const [x, y] = L.toWorld(Math.sin(th) * r, -Math.cos(th) * r);
      part({ k: 0, x, y, vx: rnd(-150, 150), vy: rnd(-280, -60), g: 320, life: rnd(0.5, 1.1), max: 1.1, size: rnd(2, 3.4), c: pick([L.pal.rim, '#fff5c2', L.pal.hot]), drag: 0.98 });
    }
    const [mx, my] = L.toWorld(0, -IR * 1.04);
    ring(mx, my, 270, 0.5, L.pal.rim, 6);
    for (let k = 0; k < 5; k++) coinBurst(CX + (k - 2) * 64, my + 20, 16, 2);
    // 年兽吃痛
    B.roar = 1; B.flash = 1; sfx.roar();
    const st = Math.min(4, Math.floor(S.broken / 5));
    if (S.broken >= TOTAL) {
      bossArrive();
    } else if (st > S.stage) {
      S.stage = st;
      toast(`${STAGES[st]} · 年兽换上了${PAL[st].name}`, 2.8);
      firework(CX - 110, 470, 70, 200); firework(CX + 110, 480, 70, 200);
      sfx.bigBoom();
    } else {
      toast(pick(['嗷——！鳞甲碎了！', `第 ${S.broken} 层鳞甲碎了`, '年兽疼得直哆嗦', '再来！再来！', '碎碎平安！']));
    }
  }

  function bossArrive() {
    S.stage = 5;
    B.active = true; B.ty = 262; B.ts = 1.0;
    B.max = B.hp = BOSS_HP; B.spitT = 2.4; B.bombT = 7;
    toast('子时到！年兽现身！', 3);
    sfx.roar(); setTimeout(() => sfx.roar(), 500);
    shake(10);
  }
  function bossDown() {
    B.hp = 0; B.dying = 2.6;
    S.won = true;
    toast('年兽被吓跑啦！', 3);
    sfx.bigBoom();
    foes.forEach((f) => { if (f.hp > 0) { f.hp = 0; firework(f.x, f.y, 20, 120); } });
  }

  /* ================= 武器开火 ================= */
  function fireRocket() {
    const lv = S.levels.rocket;
    const cnt = [1, 2, 2, 3, 3, 4][lv - 1];
    const spread = [0, 0.06, 0.06, 0.06][cnt - 1];
    const speed = 760 + lv * 34, carve = 7.5 + (lv - 1) * 0.3, dmg = 12 + lv * 3.6;
    const perpX = -Math.sin(S.aim), perpY = Math.cos(S.aim);
    for (let i = 0; i < cnt; i++) {
      let off, side;
      if (cnt === 1) { S.parity ^= 1; off = 0; side = S.parity ? 9 : -9; } else { const f = i - (cnt - 1) / 2; off = f * spread; side = f * 5; }
      const a = S.aim + off + rnd(-0.012, 0.012);
      const crit = Math.random() < 0.12 + lv * 0.04;
      bullets.push({
        x: CX + Math.cos(a) * 30 + perpX * side, y: GUN_Y + Math.sin(a) * 30 + perpY * side,
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, a,
        dmg: Math.round(dmg * (crit ? 1.9 : rnd(0.9, 1.1))), crit, carve, splash: lv >= 3 ? (lv >= 5 ? 2 : 1) : 0, age: 0,
      });
    }
    S.recoil = 1; S.muzzle = 1;
    sfx.shot();
  }
  function rocketBurst(b, x, y) {
    // 爆花：一圈小碎花
    const n = b.splash === 2 ? 5 : 3, r = b.splash === 2 ? 19 : 14;
    for (let k = 0; k < n; k++) {
      const a = k / n * TAU + Math.random(), px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      const L = layerAt(px, py);
      if (L) onCarve(L.carve(px, py, b.carve * 0.55, false), px, py, false);
    }
    for (const f of foes) if (f.hp > 0 && Math.hypot(f.x - x, f.y - y) < 34 + f.r) hurtFoe(f, Math.round(b.dmg * 0.5), false, 2);
    for (let i = 0; i < (b.splash === 2 ? 14 : 8); i++) {
      const a = i / 8 * TAU, v = rnd(80, 150);
      part({ k: 1, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 120, life: 0.35, max: 0.35, size: 1.6, c: pick(FW_SETS[(b.age * 10 | 0) % FW_SETS.length]), drag: 0.93 });
    }
  }

  function fireKick() {
    const lv = S.levels.kick; if (!lv) return;
    const pads = lv >= 2 ? [92, VW - 92] : [92];
    const per = lv <= 2 ? 2 : Math.min(7, lv + 1);
    const blastR = 30 + Math.min(22, (lv - 1) * 4.4), dmg = 46 + lv * 18;
    pads.forEach((px, pi) => {
      S.kickRec[px < CX ? 0 : 1] = 1;
      for (let i = 0; i < per; i++) {
        const fr = per === 1 ? 0 : i / (per - 1) - 0.5;
        const la = -Math.PI / 2 + (px < CX ? 0.16 : -0.16) + fr * (per <= 2 ? 0.3 : 0.9);
        const sp = rnd(360, 440);
        let tgt = null;
        const live = foes.filter((f) => f.hp > 0 && f.kind !== 'bag');
        if (B.active && !B.dying && Math.random() < 0.7) tgt = { x: B.x + rnd(-80, 80), y: B.y + rnd(-50, 60) };
        else if (live.length && Math.random() < 0.45) { const f = pick(live); tgt = { x: f.x, y: f.y, f }; }
        else { for (let k = 0; k < Math.min(2, layers.length) && !tgt; k++) tgt = layers[k].randomAlive(px < CX ? -1 : 1); }
        if (!tgt) tgt = { x: CX + rnd(-120, 120), y: 300 };
        missiles.push({ x: px + Math.cos(la) * 14, y: GROUND - 28, vx: Math.cos(la) * sp, vy: Math.sin(la) * sp, age: 0, turn: 0.16 + Math.abs(fr) * 0.12 + i * 0.015, tx: tgt.x + rnd(-14, 14), ty: tgt.y, f: tgt.f, blastR, dmg, evo: lv >= 3, fire: lv >= 5, trail: [] });
      }
      // 地上一响
      ring(px, GROUND - 26, 40, 0.22, '#fff0b0', 3);
      smoke(px, GROUND - 30, 4, 12);
      spark(px, GROUND - 30, 10, 140, ['#fff4c0', '#ffae30'], 300, 0.35);
      void pi;
    });
    sfx.bang();
  }
  function explodeMissile(m) {
    const L = layerAt(m.x, m.y) || (layers[0] && Math.hypot(m.x - CX, m.y - layers[0].cy) < OR * layers[0].s + 30 ? layers[0] : null);
    if (L) onCarve(L.carve(m.x, m.y, m.blastR, true), m.x, m.y, true);
    for (const f of foes) if (f.hp > 0 && Math.hypot(f.x - m.x, f.y - m.y) <= m.blastR * 1.5 + f.r) hurtFoe(f, m.dmg, true, 12);
    if (B.active && Math.hypot(m.x - B.x, m.y - B.y) < 130) hurtBoss(m.dmg, m.x, m.y, true);
    sfx.boom(1 + S.levels.kick * 0.08);
    shake(Math.min(9, 4.5 + S.levels.kick * 0.7));
    ring(m.x, m.y, m.blastR * 2, 0.32, m.evo ? '#d68eff' : '#ff9830', 4);
    firework(m.x, m.y, m.evo ? 26 : 16, 150, m.evo ? FW_SETS[3] : FW_SETS[1], 0.55, 160);
    confetti(m.x, m.y, 6, 140);
    if (m.fire) pops.push({ t: 0.22, x: m.x + rnd(-20, 20), y: m.y + rnd(-20, 20), r: m.blastR * 0.6, free: true });
  }

  function fireFount() {
    const lv = S.levels.fount; if (!lv) return;
    const xs = lv >= 2 ? [148, VW - 148] : [148];
    const per = lv >= 5 ? 2 : 1;
    xs.forEach((x) => {
      for (let k = 0; k < per; k++) {
        let tgt = null;
        if (B.active && !B.dying) tgt = { x: B.x + rnd(-40, 40), y: B.y };
        else {
          const nearF = foes.filter((f) => f.hp > 0 && f.kind !== 'bag' && f.y > 200);
          if (nearF.length && Math.random() < 0.4) tgt = pick(nearF);
          else if (layers[0]) tgt = layers[0].randomAlive(x < CX ? -1 : 1);
        }
        if (!tgt) tgt = { x: x + rnd(-40, 40), y: 200 };
        let a = Math.atan2(tgt.y - (GROUND - 46), tgt.x - x);
        a = clamp(a, -Math.PI * 0.86, -Math.PI * 0.14);
        if (per === 2) a += (k ? 0.12 : -0.12);
        const sweep = lv >= 3 ? (x < CX ? 1 : -1) * (k ? -1 : 1) : 0;
        if (sweep) a -= sweep * 0.22;
        beams.push({ x, y: GROUND - 46, a, sweep, t: 0, dur: 0.55 + lv * 0.06, hw: 4.5 + lv * 1.1, dps: (110 + lv * 45) * (lv >= 6 ? 1.6 : 1), tick: 0 });
      }
    });
    sfx.beam();
  }
  function updBeams(dt) {
    for (let i = beams.length - 1; i >= 0; i--) {
      const b = beams[i];
      b.t += dt; b.tick -= dt;
      if (b.sweep) b.a += b.sweep * 0.8 * dt;
      if (b.t >= b.dur) { beams.splice(i, 1); continue; }
      const dx = Math.cos(b.a), dy = Math.sin(b.a), len = 900;
      const hw = b.hw * Math.min(1, b.t / 0.08);
      let total = 0, hx = 0, hy = 0;
      for (let li = 0; li < Math.min(3, layers.length); li++) {
        const n = layers[li].carveBeam(b.x, b.y, dx, dy, len, hw * [0.7, 0.42, 0.22][li]);
        if (n) { total += n; }
      }
      if (total) {
        gainXp(total * XPC); addUlt(total * 0.005);
        // 沿光柱撒金花
        for (let k = 0; k < 3; k++) {
          const t = rnd(80, 520); hx = b.x + dx * t; hy = b.y + dy * t;
          part({ k: 0, x: hx, y: hy, vx: rnd(-60, 60), vy: rnd(-40, 40), g: 260, life: rnd(0.4, 0.8), max: 0.8, size: rnd(1.2, 2.4), c: pick(['#fff6d0', '#ffd24a', '#ffffff']), drag: 0.97 });
        }
        checkBreak();
      }
      if (b.tick <= 0) {
        b.tick = 0.1;
        for (const f of foes) {
          if (f.hp <= 0) continue;
          const px = f.x - b.x, py = f.y - b.y, t = px * dx + py * dy;
          if (t > 0 && Math.abs(px * dy - py * dx) < f.r + b.hw) hurtFoe(f, Math.round(b.dps * 0.1), false, 1);
        }
        if (B.active && !B.dying) {
          const px = B.x - b.x, py = B.y - b.y, t = px * dx + py * dy;
          if (t > 0 && Math.abs(px * dy - py * dx) < 100) hurtBoss(Math.round(b.dps * 0.1), b.x + dx * (t - 80), b.y + dy * (t - 80), false);
        }
      }
    }
  }

  function fireSpark() {
    const lv = S.levels.spark; if (!lv) return;
    const xs = lv >= 2 ? [44, VW - 44] : [44];
    const jumps = (2 + lv) * (lv >= 5 ? 2 : 1);
    const dmg = 30 + lv * 12;
    let any = false;
    xs.forEach((x) => {
      const pts = [{ x, y: GROUND - 64 }];
      const used = new Set();
      let cur = pts[0];
      for (let j = 0; j < jumps; j++) {
        let best = null, bd = j === 0 ? 330 : 190;
        for (const f of foes) {
          if (f.hp <= 0 || used.has(f)) continue;
          const d = Math.hypot(f.x - cur.x, f.y - cur.y);
          if (d < bd) { bd = d; best = f; }
        }
        if (!best) break;
        used.add(best); pts.push({ x: best.x, y: best.y });
        hurtFoe(best, dmg, false, 3);
        if (lv >= 3) best.slow = 1.6;
        cur = best;
      }
      if (pts.length === 1 && lv >= 4 && layers[0]) {
        // 去滋鳞甲
        for (let j = 0; j < 3 + (lv >= 5 ? 2 : 0); j++) {
          const p = layers[0] && layers[0].randomAlive(x < CX ? -1 : 1); if (!p) break;
          pts.push(p);
          onCarve(layers[0] ? layers[0].carve(p.x, p.y, 9 + lv, false) : 0, p.x, p.y, false);
        }
      }
      if (B.active && !B.dying && pts.length < 3) { pts.push({ x: B.x + rnd(-60, 60), y: B.y + rnd(-30, 50) }); hurtBoss(dmg * 2, B.x, B.y + 40, false); }
      if (pts.length > 1) { bolts.push({ pts, life: 0.2, max: 0.2, w: lv >= 5 ? 3.4 : 2.2 }); any = true; }
    });
    if (any) sfx.zap();
  }

  function whipString(full) {
    // 沿最底层鳞甲内弧炸一圈鞭炮
    const lv = S.levels.whip; if (!lv) return;
    const n = full ? 22 : 9 + lv * 2;
    const span = full ? HA * 1.8 : Math.min(HA * 1.8, 0.07 * n);
    const st = full ? -HA * 0.9 : rnd(-HA * 0.9, HA * 0.9 - span);
    for (let i = 0; i < n; i++) pops.push({ t: i * 0.045, th: st + (i / (n - 1)) * span, r: 12 + lv * 1.8, whip: true });
    if (lv >= 5 || full) for (const f of foes) if (f.hp > 0 && f.y > 360 && f.kind !== 'bag') hurtFoe(f, 9999, true, 0);
  }
  function updPops(dt) {
    for (let i = pops.length - 1; i >= 0; i--) {
      const p = pops[i];
      p.t -= dt; if (p.t > 0) continue;
      pops.splice(i, 1);
      let x = p.x, y = p.y;
      if (p.whip) { if (!layers[0]) continue; [x, y] = layers[0].edgePoint(p.th); }
      const L = layerAt(x, y) || (p.whip ? layers[0] : null);
      if (L) onCarve(L.carve(x, y, p.r, true), x, y, true);
      for (const f of foes) if (f.hp > 0 && f.kind !== 'bag' && Math.hypot(f.x - x, f.y - y) < p.r * 2 + f.r) hurtFoe(f, 40 + S.levels.whip * 15, false, 4);
      ring(x, y, p.r * 2.2, 0.2, '#fff0b0', 2.5);
      confetti(x, y, 5, 150);
      spark(x, y, 5, 160, ['#fff4c0', '#ffd24a', '#ff4a2a'], 260, 0.35);
      sfx.crackle(2, 0.07);
      shake(1.6);
    }
  }

  /* ================= 大礼花 ================= */
  function fireUlt() {
    if (mode !== 'play' || S.ult < 100 || B.dying) return;
    auInit();
    S.ult = 0;
    let tx = CX, ty = 380;
    if (B.active) { tx = B.x; ty = B.y + 20; } else if (layers[0]) { const [x, y] = layers[0].toWorld(0, -(IR + OR) / 2); tx = x; ty = y + 10; }
    shells.push({ x: CX, y: GUN_Y, sx: CX, sy: GUN_Y, tx, ty, t: 0, dur: 0.55, big: true });
    shells.push({ x: CX, y: GUN_Y, sx: CX, sy: GUN_Y, tx: tx - 120, ty: ty + 20, t: -0.18, dur: 0.5 });
    shells.push({ x: CX, y: GUN_Y, sx: CX, sy: GUN_Y, tx: tx + 120, ty: ty + 20, t: -0.3, dur: 0.5 });
    sfx.whistle(0.55);
    toast('大礼花——走你！', 1.6);
  }
  function updShells(dt) {
    for (let i = shells.length - 1; i >= 0; i--) {
      const s = shells[i];
      s.t += dt; if (s.t < 0) continue;
      const k = Math.min(1, s.t / s.dur), e = 1 - Math.pow(1 - k, 2);
      s.x = lerp(s.sx, s.tx, e) + Math.sin(k * 20) * 3; s.y = lerp(s.sy, s.ty, e);
      if (Math.random() < 0.9) part({ k: 0, x: s.x, y: s.y, vx: rnd(-30, 30), vy: rnd(20, 80), g: 120, life: 0.4, max: 0.4, size: rnd(1.5, 2.6), c: pick(['#fff4c0', '#ffd24a']), drag: 0.96 });
      if (k < 1) continue;
      shells.splice(i, 1);
      const R = s.big ? 100 : 62;
      for (let li = 0; li < Math.min(3, layers.length); li++) {
        const L = layers[li];
        const n = L.carve(s.x, s.y - li * 30, R * (li ? 0.7 : 1), true);
        if (n) { gainXp(n * XPC); }
      }
      checkBreak();
      for (const f of foes) if (f.hp > 0) { if (f.kind === 'bag') killFoe(f); else hurtFoe(f, 9999, true, 0); }
      if (B.active) hurtBoss(s.big ? 1800 : 700, s.x, s.y, true);
      firework(s.x, s.y, s.big ? 170 : 90, s.big ? 330 : 230, null, 1.6, 80);
      if (s.big) { firework(s.x, s.y, 70, 160, FW_SETS[0], 1.3, 60); S.flash = 1; S.slow = 0.5; ring(s.x, s.y, 360, 0.6, '#fff4c0', 8); }
      sfx.bigBoom();
      shake(s.big ? 16 : 8);
    }
  }

  /* ================= 敌人 ================= */
  function spawnFoe(kind) {
    const st = S.stage, sc = 1 + st * 0.8 + S.t * 0.012;
    if (kind === 'bag') {
      const dir = Math.random() < 0.5 ? 1 : -1;
      foes.push({ kind, x: dir > 0 ? -30 : VW + 30, y: rnd(470, 560), vx: dir * rnd(48, 66), vy: 0, r: 20, hp: 70 * sc, max: 70 * sc, rot: 0, vr: 0, flash: 0, slow: 0, ph: Math.random() * 6 });
      return;
    }
    const iron = kind === 'iron';
    const fromMouth = B.active || Math.random() < 0.65;
    const x = fromMouth ? B.x + rnd(-50, 50) : rnd(30, VW - 30);
    const y = fromMouth ? B.y + 60 * B.s : -24;
    const tx = CX + rnd(-185, 185);
    const sp = (iron ? 50 + st * 8 : 72 + st * 12) + rnd(0, 16) + (B.active ? 18 : 0);
    const a = Math.atan2(GROUND - y, tx - x);
    const r = iron ? rnd(20, 24) : rnd(13, 17);
    foes.push({ kind, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r, hp: (iron ? 150 : 50) * sc, max: (iron ? 150 : 50) * sc, rot: Math.random() * 6, vr: rnd(-2, 2), flash: 0, slow: 0, ph: Math.random() * 6 });
    if (fromMouth) B.mouth = 1;
  }
  function updFoes(dt) {
    const red = Math.max(0.55, 1 - S.levels.whip * 0.07);
    for (let i = foes.length - 1; i >= 0; i--) {
      const f = foes[i];
      if (f.hp <= 0) { foes.splice(i, 1); continue; }
      f.flash = Math.max(0, f.flash - dt * 6); f.slow = Math.max(0, f.slow - dt);
      const m = f.slow > 0 ? 0.42 : 1;
      if (f.kind === 'bag') {
        f.ph += dt * 2.4;
        f.x += f.vx * dt; f.y += Math.sin(f.ph) * 18 * dt;
        if (f.x < -60 || f.x > VW + 60) foes.splice(i, 1);
        continue;
      }
      f.x += f.vx * dt * m; f.y += f.vy * dt * m; f.rot += f.vr * dt;
      if (Math.random() < 0.5) part({ k: 0, x: f.x + rnd(-f.r, f.r) * 0.5, y: f.y - f.r * 0.3, vx: -f.vx * 0.3 + rnd(-20, 20), vy: -f.vy * 0.3 - 20, g: -30, life: 0.35, max: 0.35, size: rnd(2, 4), c: f.kind === 'iron' ? '#ff5a2a' : pick(['#ffae30', '#ff6a1a', '#ffd24a']), drag: 0.95 });
      const dd = Math.hypot(f.x - CX, f.y - DOME_CY);
      if (dd <= DOME_R + f.r * 0.8 || f.y >= GROUND - f.r) {
        const dmg = Math.round((f.kind === 'iron' ? 230 : 120) * red * (B.active ? 1.15 : 1));
        S.hp -= dmg; S.domeFlash = 1; shake(9); sfx.domeHit();
        num(f.x, Math.min(f.y, GROUND - 30) - 10, dmg, true, '#ff5050');
        ring(f.x, Math.min(f.y, GROUND - 10), 80, 0.4, '#ffd24a', 4);
        spark(f.x, f.y, 14, 200, ['#ffd24a', '#ff8c2c'], 260, 0.6);
        foes.splice(i, 1);
        if (S.hp <= 0) { S.hp = 0; lose(); return; }
      }
    }
  }
  function updBoss(dt) {
    B.y += (B.ty - B.y) * Math.min(1, dt * 1.6); B.s += (B.ts - B.s) * Math.min(1, dt * 1.6);
    B.mouth = Math.max(0, B.mouth - dt * 2); B.flash = Math.max(0, B.flash - dt * 3); B.roar = Math.max(0, B.roar - dt * 1.4);
    B.blink -= dt; if (B.blink < -0.14) B.blink = rnd(2, 5);
    // 眼睛盯着炮口 / 当前瞄准点
    const tx = mode === 'play' ? CX + Math.cos(S.aim) * 300 : CX, ty = mode === 'play' ? GUN_Y + Math.sin(S.aim) * 300 : 600;
    const ex = tx - B.x, ey = ty - B.y, el = Math.hypot(ex, ey) || 1;
    B.ex += (ex / el - B.ex) * Math.min(1, dt * 6); B.ey += (ey / el - B.ey) * Math.min(1, dt * 6);
    if (!B.active || mode !== 'play') return;
    if (B.dying > 0) {
      B.dying -= dt;
      if (Math.random() < 0.35) { const x = B.x + rnd(-140, 140), y = B.y + rnd(-100, 120); firework(x, y, 50, rnd(140, 220), null, 1.1, 60); sfx.boom(0.9); shake(5); }
      B.ty = 262 - (2.6 - B.dying) * 40; B.flash = 0.6;
      if (B.dying <= 0) { B.gone = true; win(); }
      return;
    }
    B.rage = 1 - B.hp / B.max;
    B.spitT -= dt;
    if (B.spitT <= 0) {
      B.spitT = Math.max(0.8, 1.9 - B.rage * 0.9);
      const n = 3 + Math.floor(B.rage * 3);
      for (let i = 0; i < n; i++) spawnFoe('fire');
      B.mouth = 1;
    }
    B.bombT -= dt;
    if (B.bombT <= 0) { B.bombT = Math.max(3.5, 7 - B.rage * 3); spawnFoe('iron'); spawnFoe('iron'); B.roar = 0.8; sfx.roar(); }
    B.x = CX + Math.sin(S.t * 0.7) * 30;
  }

  /* ================= 主循环 ================= */
  let last = performance.now();
  function update(raw) {
    // 不受暂停影响的氛围
    updAmbient(raw);
    if (S && S.toastT > 0) { S.toastT -= raw; if (S.toastT <= 0) $('toast').classList.remove('show'); }
    updBoss(raw);
    if (mode === 'title') { titleIdle(raw); return; }
    if (mode === 'over') { updParts(raw); if (S.won) { S.dawn = Math.min(1, S.dawn + raw * 0.3); if (Math.random() < raw * 3) firework(rnd(60, VW - 60), rnd(180, 520), 70, rnd(150, 240), null, 1.3, 60); } return; }
    if (mode !== 'play') return;
    if (S.stop > 0) { S.stop -= raw; S.shake *= Math.pow(0.002, raw); return; }
    let dt = Math.min(0.05, raw) * S.speed;
    if (S.slow > 0) { S.slow -= raw; dt *= 0.35; }
    S.t += dt;
    S.cool = Math.max(0, S.cool - raw);
    S.shake *= Math.pow(0.0015, raw); if (S.shake < 0.1) S.shake = 0;
    S.flash = Math.max(0, S.flash - raw * 2.2);
    S.domeFlash = Math.max(0, S.domeFlash - dt * 3);
    S.recoil = Math.max(0, S.recoil - dt * 11); S.muzzle = Math.max(0, S.muzzle - dt * 15);
    S.kickRec[0] = Math.max(0, S.kickRec[0] - dt * 5); S.kickRec[1] = Math.max(0, S.kickRec[1] - dt * 5);
    if (S.levels.whip >= 3 && S.hp < S.max) S.hp = Math.min(S.max, S.hp + S.levels.whip * 7 * dt);

    // 鳞甲往下压
    if (layers.length && !B.active) {
      S.press = Math.min(PRESS_MAX, S.press + (2.6 + S.stage * 1.2 + S.t * 0.007) * dt);
    } else S.press = Math.max(0, S.press - 40 * dt);
    S.warn = S.press > PRESS_MAX * 0.7 ? (S.press - PRESS_MAX * 0.7) / (PRESS_MAX * 0.3) : 0;
    if (S.press >= PRESS_MAX - 0.5 && layers.length) {
      S.hp -= (70 + S.stage * 20) * dt; S.domeFlash = Math.max(S.domeFlash, 0.4); shake(2);
      if (Math.random() < dt * 3) num(CX + rnd(-150, 150), 600, '煞气压顶', false, '#ff7070');
      if (S.hp <= 0) { S.hp = 0; lose(); return; }
    }
    layers.forEach((L, i) => L.spring(dt, SLOTS[L.slot].cy + S.press));

    // 瞄准
    if (S.ptr) {
      S.aimT = clamp(Math.atan2(Math.min(-30, S.py - GUN_Y), S.px - CX), -Math.PI * 0.88, -Math.PI * 0.12);
    } else {
      let th = null, lo = 230;
      for (const f of foes) if (f.hp > 0 && f.kind !== 'bag' && f.y > lo) { lo = f.y; th = f; }
      if (!th) for (const f of foes) if (f.hp > 0 && f.kind === 'bag') th = f;
      if (th) S.aimT = Math.atan2(th.y - GUN_Y, th.x - CX);
      else if (B.active) S.aimT = Math.atan2(B.y + 30 - GUN_Y, B.x + Math.sin(S.t * 2.2) * 70 - CX);
      else if (layers.length) {
        let [lo2, hi2] = layers[0].angleBoundsCache || [-Math.PI * 0.74, -Math.PI * 0.26];
        if (!layers[0].abT || layers[0].abT < S.t) { layers[0].angleBoundsCache = layers[0].angleBounds(CX, GUN_Y); layers[0].abT = S.t + 0.25; [lo2, hi2] = layers[0].angleBoundsCache; }
        if (!isFinite(lo2)) { lo2 = -Math.PI * 0.74; hi2 = -Math.PI * 0.26; }
        lo2 = Math.max(-Math.PI * 0.82, lo2 - 0.02); hi2 = Math.min(-Math.PI * 0.18, hi2 + 0.02);
        S.aimT += S.sweep * 0.9 * dt;
        if (S.aimT >= hi2) { S.aimT = hi2; S.sweep = -1; } else if (S.aimT <= lo2) { S.aimT = lo2; S.sweep = 1; }
      }
    }
    S.aim += (S.aimT - S.aim) * Math.min(1, dt * 22);

    // 开火
    S.fireCd -= dt;
    if (S.fireCd <= 0 && !B.dying) { S.fireCd = [0.15, 0.145, 0.14, 0.13, 0.12, 0.11][S.levels.rocket - 1]; fireRocket(); }
    if (S.levels.kick) { S.kickT -= dt; if (S.kickT <= 0) { S.kickT = Math.max(1.05, 2.5 - S.levels.kick * 0.22); fireKick(); } }
    if (S.levels.fount) {
      S.fountT -= dt;
      S.fountCharge = S.fountT < 0.4 ? 1 - S.fountT / 0.4 : 0;
      if (S.fountT <= 0) { S.fountT = Math.max(1.25, 2.8 - S.levels.fount * 0.24); fireFount(); }
    }
    if (S.levels.spark) { S.sparkT -= dt; if (S.sparkT <= 0) { S.sparkT = Math.max(0.42, 1.2 - S.levels.spark * 0.13); fireSpark(); } }
    if (S.levels.whip) { S.whipT -= dt; if (S.whipT <= 0) { S.whipT = Math.max(3.2, 9 - S.levels.whip * 0.9); whipString(false); } }
    if (S.auto && S.ult >= 100) fireUlt();

    // 子弹
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.age += dt;
      const steps = 3, sx = b.vx * dt / steps, sy = b.vy * dt / steps;
      let dead = false;
      for (let s = 0; s < steps && !dead; s++) {
        b.x += sx; b.y += sy;
        for (const f of foes) {
          if (f.hp > 0 && Math.hypot(f.x - b.x, f.y - b.y) < f.r + 3) { hurtFoe(f, b.dmg, b.crit); if (b.splash) rocketBurst(b, b.x, b.y); dead = true; break; }
        }
        if (dead) break;
        if (B.active && !B.dying && Math.hypot(B.x - b.x, (B.y + 20) - b.y) < 105) { hurtBoss(b.dmg, b.x, b.y, b.crit); if (b.splash) rocketBurst(b, b.x, b.y); dead = true; break; }
        const L = layerAt(b.x, b.y);
        if (L) {
          const n = L.carve(b.x, b.y, b.carve, false);
          onCarve(n, b.x, b.y, false);
          if (b.splash) rocketBurst(b, b.x, b.y);
          dead = true;
        }
      }
      if (dead || b.y < -30 || b.x < -30 || b.x > VW + 30) bullets.splice(i, 1);
    }
    // 二踢脚
    for (let i = missiles.length - 1; i >= 0; i--) {
      const m = missiles[i];
      m.age += dt;
      if (m.f && m.f.hp > 0) { m.tx = m.f.x; m.ty = m.f.y; }
      if (m.age > m.turn) {
        const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy) || 1;
        const sp = Math.min(640, Math.hypot(m.vx, m.vy) + 900 * dt);
        const st = Math.min(1, dt * 7.5);
        m.vx += (dx / d * sp - m.vx) * st; m.vy += (dy / d * sp - m.vy) * st;
        if (d < 14) { explodeMissile(m); missiles.splice(i, 1); continue; }
      }
      m.x += m.vx * dt; m.y += m.vy * dt;
      m.trail.push(m.x, m.y); if (m.trail.length > 16) m.trail.splice(0, 2);
      let boom = false;
      if (m.age > m.turn) {
        if (layerAt(m.x, m.y)) boom = true;
        for (const f of foes) if (f.hp > 0 && Math.hypot(f.x - m.x, f.y - m.y) < f.r + 6) { boom = true; break; }
      }
      if (boom) { explodeMissile(m); missiles.splice(i, 1); continue; }
      if (m.y < -80 || m.x < -80 || m.x > VW + 80 || m.age > 3) missiles.splice(i, 1);
    }
    updBeams(dt);
    for (let i = bolts.length - 1; i >= 0; i--) { bolts[i].life -= dt; if (bolts[i].life <= 0) bolts.splice(i, 1); }
    updPops(dt);
    updShells(dt);

    // 刷怪
    if (!B.active) {
      S.spawnT -= dt;
      if (S.spawnT <= 0) {
        S.spawnT = Math.max(0.36, 1.7 - S.stage * 0.26 - S.t * 0.003) * rnd(0.75, 1.25);
        spawnFoe(S.stage >= 1 && Math.random() < 0.18 + S.stage * 0.05 ? 'iron' : 'fire');
      }
      S.volT = (S.volT === undefined ? 14 : S.volT) - dt;
      if (S.volT <= 0 && S.stage >= 1) {
        S.volT = rnd(11, 16) - S.stage;
        const n = 3 + S.stage;
        for (let i = 0; i < n; i++) spawnFoe('fire');
        B.roar = 0.6; sfx.roar();
        toast('年兽喷火了！', 1.4);
      }
      S.bagT -= dt;
      if (S.bagT <= 0) { S.bagT = rnd(17, 25); spawnFoe('bag'); }
    }
    updFoes(dt);
    if (mode !== 'play') return;

    // 铜钱飞向经验条
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.age += dt; c.spin += dt * 9;
      if (c.age < 0.35) { c.vx *= 0.92; c.vy = c.vy * 0.92 + 200 * dt; }
      else { const dx = 330 - c.x, dy = 40 - c.y, d = Math.hypot(dx, dy) || 1, sp = 300 + c.age * 900; c.vx += (dx / d * sp - c.vx) * Math.min(1, dt * 8); c.vy += (dy / d * sp - c.vy) * Math.min(1, dt * 8); if (d < 18) { gainXp(c.v); coins.splice(i, 1); continue; } }
      c.x += c.vx * dt; c.y += c.vy * dt;
    }
    updParts(dt);
    if (S.xp >= S.xpMax && S.cool <= 0 && !B.dying && mode === 'play') openLevel();
  }
  function updParts(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; }
      p.vx *= Math.pow(p.drag, dt * 60); p.vy = p.vy * Math.pow(p.drag, dt * 60) + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.k === 2) p.rot += p.vr * dt;
      if (p.k === 3) p.size += dt * 14;
    }
    for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.life -= dt; r.r += (r.max - r.r) * Math.min(1, dt * 12); if (r.life <= 0) rings.splice(i, 1); }
    for (let i = nums.length - 1; i >= 0; i--) { const n = nums[i]; n.life -= dt; n.y += n.vy * dt; n.vy *= 0.94; if (n.life <= 0) nums.splice(i, 1); }
    for (let i = shards.length - 1; i >= 0; i--) { const s = shards[i]; s.life -= dt; s.vy += 420 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.rot += s.vr * dt; if (s.life <= 0) shards.splice(i, 1); }
  }

  /* ================= 背景：夜空、远处的烟花、老城 ================= */
  let BG = null, CITY = null;
  const stars = Array.from({ length: 70 }, () => ({ x: Math.random() * VW, y: Math.random() * 520, r: rnd(0.4, 1.3), p: Math.random() * 6 }));
  const snow = Array.from({ length: 46 }, () => ({ x: Math.random() * VW, y: Math.random() * VH, r: rnd(0.8, 2.2), v: rnd(14, 34), p: Math.random() * 6 }));
  let ambT = 0.5;
  function buildBackdrop() {
    BG = mk(Math.round(VW * K), Math.round(VH * K));
    let g = BG.getContext('2d'); g.scale(K, K);
    const sky = g.createLinearGradient(0, 0, 0, VH);
    sky.addColorStop(0, '#070414'); sky.addColorStop(0.35, '#14082a'); sky.addColorStop(0.62, '#2c0c30'); sky.addColorStop(0.78, '#5a1a2a'); sky.addColorStop(0.9, '#7a2a20');
    g.fillStyle = sky; g.fillRect(0, 0, VW, VH);
    // 月亮
    const mg = g.createRadialGradient(370, 470, 0, 370, 470, 60);
    mg.addColorStop(0, 'rgba(255,240,210,0.35)'); mg.addColorStop(0.3, 'rgba(255,220,180,0.12)'); mg.addColorStop(1, 'rgba(255,200,160,0)');
    g.fillStyle = mg; g.fillRect(300, 400, 140, 140);
    CITY = mk(Math.round(VW * K), Math.round(VH * K));
    g = CITY.getContext('2d'); g.scale(K, K);
    // 远处一排楼
    let seed = 7;
    const r = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    g.fillStyle = '#1a0a1e';
    for (let x = -10; x < VW + 20;) { const w = 18 + r() * 34, h = 60 + r() * 120; g.fillRect(x, GROUND - 60 - h, w, h + 60); x += w + 2; }
    // 电视塔
    g.fillStyle = '#1e0c22';
    g.beginPath(); g.moveTo(318, GROUND - 60); g.lineTo(326, 470); g.lineTo(330, 470); g.lineTo(338, GROUND - 60); g.fill();
    g.beginPath(); g.ellipse(328, 520, 12, 7, 0, 0, TAU); g.fill();
    g.fillRect(327, 430, 2, 42);
    // 近处一排楼带窗
    for (let x = -6; x < VW + 20;) {
      const w = 30 + r() * 46, h = 40 + r() * 90, top = GROUND - 30 - h;
      g.fillStyle = '#10060f'; g.fillRect(x, top, w, h + 40);
      if (r() < 0.4) { g.beginPath(); g.moveTo(x - 3, top); g.lineTo(x + w / 2, top - 12); g.lineTo(x + w + 3, top); g.fill(); }
      for (let wy = top + 8; wy < GROUND - 34; wy += 11) for (let wx = x + 5; wx < x + w - 6; wx += 9) {
        if (r() < 0.42) { g.fillStyle = r() < 0.2 ? 'rgba(255,90,70,0.8)' : `rgba(255,${190 + r() * 50 | 0},${110 + r() * 60 | 0},${0.45 + r() * 0.45})`; g.fillRect(wx, wy, 4.5, 6); }
      }
      x += w + 1 + r() * 6;
    }
    // 楼间挂的小红灯笼串
    for (let k = 0; k < 3; k++) {
      const x0 = 20 + k * 150, y0 = GROUND - 120 + r() * 30, x1 = x0 + 120;
      g.strokeStyle = 'rgba(80,30,30,0.8)'; g.lineWidth = 0.8;
      g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, y0 + 22, x1, y0 + 4); g.stroke();
      for (let i = 1; i < 8; i++) { const t = i / 8, lx = lerp(x0, x1, t), ly = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (y0 + 22) + t * t * (y0 + 4);
        const lg = g.createRadialGradient(lx, ly + 3, 0, lx, ly + 3, 8); lg.addColorStop(0, 'rgba(255,80,60,0.9)'); lg.addColorStop(0.4, 'rgba(220,20,30,0.6)'); lg.addColorStop(1, 'rgba(220,20,30,0)');
        g.fillStyle = lg; g.fillRect(lx - 8, ly - 5, 16, 16); g.fillStyle = '#ff3a3a'; g.beginPath(); g.ellipse(lx, ly + 3, 2.6, 3.2, 0, 0, TAU); g.fill(); }
    }
    // 城市的暖光雾
    const fog = g.createLinearGradient(0, GROUND - 120, 0, GROUND);
    fog.addColorStop(0, 'rgba(255,90,50,0)'); fog.addColorStop(1, 'rgba(255,90,50,0.18)');
    g.fillStyle = fog; g.fillRect(0, GROUND - 120, VW, 120);
    if (!TEX.length || texQ !== Q) buildTextures();
  }
  function updAmbient(dt) {
    ambT -= dt;
    if (ambT <= 0) {
      ambT = rnd(0.5, 1.5);
      ambient.push({ x: rnd(30, VW - 30), y: GROUND - 60, ty: rnd(430, 560), vy: -rnd(260, 340), set: pick(FW_SETS), up: true, p: [] });
    }
    for (let i = ambient.length - 1; i >= 0; i--) {
      const a = ambient[i];
      if (a.up) {
        a.y += a.vy * dt;
        if (a.y <= a.ty) {
          a.up = false; a.t = 0;
          const n = 34, sp = rnd(50, 80);
          for (let k = 0; k < n; k++) { const an = k / n * TAU; a.p.push({ x: a.x, y: a.y, vx: Math.cos(an) * sp * rnd(0.8, 1), vy: Math.sin(an) * sp * rnd(0.8, 1) }); }
        }
      } else {
        a.t += dt;
        for (const p of a.p) { p.vx *= 0.97; p.vy = p.vy * 0.97 + 30 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
        if (a.t > 1.6) ambient.splice(i, 1);
      }
    }
    for (const s of snow) { s.y += s.v * dt; s.x += Math.sin(s.p += dt) * 8 * dt; if (s.y > VH) { s.y = -4; s.x = Math.random() * VW; } }
  }

  /* ================= 年兽 ================= */
  function drawNian(g, x, y, sc, t) {
    const fl = B.flash, rage = B.rage, open = Math.max(B.mouth * 0.7, B.roar);
    g.save(); g.translate(x, y); g.scale(sc, sc);
    if (B.roar > 0) g.translate(rnd(-3, 3) * B.roar, rnd(-2, 2) * B.roar);
    // 鬃毛：一圈火苗
    const maneG = [g.createRadialGradient(0, 0, 80, 0, 0, 175), g.createRadialGradient(0, 0, 80, 0, 0, 160)];
    maneG[0].addColorStop(0, '#c8102e'); maneG[0].addColorStop(0.6, '#8a0a20'); maneG[0].addColorStop(1, 'rgba(90,0,20,0.1)');
    maneG[1].addColorStop(0, '#ffe27a'); maneG[1].addColorStop(0.55, '#ff8a1a'); maneG[1].addColorStop(1, 'rgba(255,60,10,0.2)');
    for (let layer = 0; layer < 2; layer++) {
      const n = 20;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + layer * 0.15 + Math.sin(t * 0.8) * 0.03;
        const len = (layer ? 150 : 170) + Math.sin(t * 3 + i * 1.7) * 12 + (Math.sin(a) > 0.3 ? -30 : 0);
        const w = 0.2, sway = Math.sin(t * 2.4 + i) * 10;
        g.beginPath();
        g.moveTo(Math.cos(a - w) * 100, Math.sin(a - w) * 100);
        g.quadraticCurveTo(Math.cos(a - 0.05) * len * 0.8 + sway, Math.sin(a - 0.05) * len * 0.8, Math.cos(a) * len + sway, Math.sin(a) * len - 8);
        g.quadraticCurveTo(Math.cos(a + 0.12) * len * 0.75, Math.sin(a + 0.12) * len * 0.75, Math.cos(a + w) * 100, Math.sin(a + w) * 100);
        g.closePath();
        g.fillStyle = maneG[layer]; g.fill();
      }
    }
    // 角
    for (const sd of [-1, 1]) {
      g.save(); g.scale(sd, 1);
      g.beginPath(); g.moveTo(42, -70); g.bezierCurveTo(70, -130, 140, -140, 178, -200); g.bezierCurveTo(150, -150, 110, -120, 84, -50); g.closePath();
      const hg = g.createLinearGradient(40, -60, 178, -200); hg.addColorStop(0, '#8a5a20'); hg.addColorStop(0.4, '#f0d8a0'); hg.addColorStop(1, '#fffbe8');
      g.fillStyle = hg; g.fill(); g.strokeStyle = '#4a2a08'; g.lineWidth = 2.5; g.stroke();
      g.strokeStyle = 'rgba(90,50,10,0.55)'; g.lineWidth = 2;
      for (let k = 0; k < 4; k++) { const tt = 0.2 + k * 0.17; g.beginPath(); g.moveTo(lerp(48, 160, tt), lerp(-78, -185, tt)); g.lineTo(lerp(86, 168, tt), lerp(-60, -170, tt)); g.stroke(); }
      // 耳朵
      g.beginPath(); g.moveTo(108, -40); g.quadraticCurveTo(160, -60, 168, -10); g.quadraticCurveTo(140, -8, 112, 4); g.closePath();
      g.fillStyle = '#1d5560'; g.fill(); g.strokeStyle = '#ffd24a'; g.lineWidth = 2.5; g.stroke();
      g.beginPath(); g.moveTo(118, -30); g.quadraticCurveTo(150, -42, 156, -14); g.quadraticCurveTo(138, -14, 120, -6); g.fillStyle = '#ff7a8a'; g.fill();
      g.restore();
    }
    // 头
    const skin = fl > 0 ? `rgb(${lerp(36, 255, fl * 0.7) | 0},${lerp(100, 240, fl * 0.7) | 0},${lerp(110, 220, fl * 0.7) | 0})` : '#24646e';
    g.beginPath();
    g.moveTo(0, -112); g.bezierCurveTo(-92, -114, -138, -60, -132, 8); g.bezierCurveTo(-128, 70, -84, 124, 0, 132);
    g.bezierCurveTo(84, 124, 128, 70, 132, 8); g.bezierCurveTo(138, -60, 92, -114, 0, -112); g.closePath();
    const hg = g.createRadialGradient(0, -20, 20, 0, 0, 140); hg.addColorStop(0, skin); hg.addColorStop(1, '#0a2a32');
    g.fillStyle = hg; g.fill(); g.strokeStyle = '#ffd24a'; g.lineWidth = 4; g.stroke();
    // 额头宝珠与祥云纹
    g.strokeStyle = 'rgba(255,210,74,0.85)'; g.lineWidth = 3;
    for (const sd of [-1, 1]) {
      g.beginPath(); g.arc(sd * 34, -78, 10, sd > 0 ? Math.PI : 0, sd > 0 ? Math.PI * 2.6 : -Math.PI * 1.6, sd < 0); g.stroke();
      g.beginPath(); g.moveTo(sd * 18, -60); g.quadraticCurveTo(sd * 60, -62, sd * 74, -88); g.stroke();
    }
    const gem = g.createRadialGradient(-3, -96, 1, 0, -92, 14); gem.addColorStop(0, '#fff'); gem.addColorStop(0.35, rage > 0.5 ? '#ff3a3a' : '#ff5a8a'); gem.addColorStop(1, '#6a0010');
    g.fillStyle = gem; g.beginPath(); g.moveTo(0, -110); g.lineTo(12, -92); g.lineTo(0, -76); g.lineTo(-12, -92); g.closePath(); g.fill();
    g.strokeStyle = '#ffd24a'; g.lineWidth = 2; g.stroke();
    // 眉
    for (const sd of [-1, 1]) {
      g.beginPath(); g.moveTo(sd * 16, -34); g.quadraticCurveTo(sd * 60, -66 - rage * 6, sd * 104, -50); g.quadraticCurveTo(sd * 60, -46, sd * 18, -26); g.closePath();
      g.fillStyle = '#c8102e'; g.fill(); g.strokeStyle = '#ffd24a'; g.lineWidth = 2; g.stroke();
    }
    // 眼睛
    const bl = B.blink < 0 ? 0.12 : 1;
    for (const sd of [-1, 1]) {
      g.save(); g.translate(sd * 54, -14); g.rotate(sd * 0.18); g.scale(1, bl);
      g.shadowColor = rage > 0.5 ? '#ff3a1a' : '#ffd24a'; g.shadowBlur = 22;
      g.beginPath(); g.moveTo(-32, 2); g.quadraticCurveTo(0, -26, 32, 2); g.quadraticCurveTo(0, 20, -32, 2); g.closePath();
      const eg = g.createRadialGradient(0, -2, 1, 0, 0, 30); eg.addColorStop(0, '#fffbe0'); eg.addColorStop(0.45, rage > 0.5 ? '#ff8a2a' : '#ffe14a'); eg.addColorStop(1, rage > 0.5 ? '#c8101e' : '#e08a10');
      g.fillStyle = eg; g.fill(); g.shadowBlur = 0;
      g.strokeStyle = '#2a0a04'; g.lineWidth = 3; g.stroke();
      g.fillStyle = '#120404'; g.beginPath(); g.ellipse(B.ex * 9, B.ey * 5 - 1, 4.5, 12, 0, 0, TAU); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(B.ex * 9 - 6, -6, 2.6, 0, TAU); g.fill();
      g.restore();
    }
    // 口鼻
    g.beginPath(); g.moveTo(-58, 18); g.bezierCurveTo(-60, -4, 60, -4, 58, 18); g.bezierCurveTo(56, 52, -56, 52, -58, 18); g.closePath();
    g.fillStyle = fl > 0 ? '#5aa0a8' : '#3a8a92'; g.fill(); g.strokeStyle = '#ffd24a'; g.lineWidth = 2.5; g.stroke();
    // 狮子鼻
    g.beginPath(); g.moveTo(-26, 8); g.quadraticCurveTo(0, 0, 26, 8); g.quadraticCurveTo(30, 26, 8, 34); g.lineTo(0, 30); g.lineTo(-8, 34); g.quadraticCurveTo(-30, 26, -26, 8); g.closePath();
    const ng = g.createLinearGradient(0, 4, 0, 34); ng.addColorStop(0, '#5a1a22'); ng.addColorStop(1, '#1a0408');
    g.fillStyle = ng; g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(-8, 12, 7, 3, -0.2, 0, TAU); g.fill();
    g.strokeStyle = '#1a0408'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 32); g.lineTo(0, 44); g.quadraticCurveTo(-14, 50, -24, 44); g.moveTo(0, 44); g.quadraticCurveTo(14, 50, 24, 44); g.stroke();
    // 嘴
    const mo = 10 + open * 46;
    g.beginPath(); g.moveTo(-80, 58); g.quadraticCurveTo(0, 78, 80, 58); g.quadraticCurveTo(40, 66 + mo, 0, 70 + mo); g.quadraticCurveTo(-40, 66 + mo, -80, 58); g.closePath();
    const mg = g.createRadialGradient(0, 70 + mo * 0.5, 2, 0, 70, 70); mg.addColorStop(0, open > 0.3 ? '#fff0a0' : '#ff6a2a'); mg.addColorStop(0.4, '#c8102e'); mg.addColorStop(1, '#3a0006');
    g.fillStyle = mg; g.fill(); g.strokeStyle = '#2a0404'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#fffbe8'; g.strokeStyle = '#6a4a20'; g.lineWidth = 1.2;
    for (const sd of [-1, 1]) {
      g.beginPath(); g.moveTo(sd * 30, 66); g.lineTo(sd * 40, 92); g.lineTo(sd * 48, 64); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(sd * 54, 62 + mo * 0.8); g.lineTo(sd * 62, 40 + mo * 0.8); g.lineTo(sd * 68, 58 + mo * 0.7); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(sd * 10, 70); g.lineTo(sd * 15, 82); g.lineTo(sd * 20, 69); g.closePath(); g.fill();
    }
    // 金须
    g.strokeStyle = '#ffd24a'; g.lineWidth = 3; g.lineCap = 'round';
    for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) {
      g.beginPath(); g.moveTo(sd * 60, 30 + k * 14);
      g.bezierCurveTo(sd * 110, 20 + k * 20 + Math.sin(t * 2 + k) * 8, sd * 140, 60 + k * 20, sd * (150 + k * 10), 40 + k * 30 + Math.sin(t * 2.5 + k) * 10);
      g.stroke();
    }
    // 腮毛
    for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) {
      g.beginPath(); g.moveTo(sd * (100 - k * 14), 60 + k * 20); g.quadraticCurveTo(sd * (136 - k * 10), 90 + k * 18, sd * (114 - k * 18), 104 + k * 14); g.quadraticCurveTo(sd * (100 - k * 16), 90 + k * 14, sd * (90 - k * 14), 80 + k * 16);
      g.fillStyle = k % 2 ? '#fff4d8' : '#ffd24a'; g.fill();
    }
    g.restore();
  }

  /* ================= 楼顶、炮阵、门神结界 ================= */
  function drawRoof(g, t) {
    // 结界
    const hpK = S ? clamp(S.hp / S.max, 0, 1) : 1;
    const df = S ? S.domeFlash : 0;
    g.save();
    g.beginPath(); g.arc(CX, DOME_CY, DOME_R, Math.PI, TAU); g.closePath();
    const dg = g.createRadialGradient(CX, DOME_CY, DOME_R * 0.3, CX, DOME_CY, DOME_R);
    dg.addColorStop(0, 'rgba(255,200,80,0.02)'); dg.addColorStop(0.8, `rgba(255,190,60,${0.08 + df * 0.2})`); dg.addColorStop(1, df > 0.1 ? `rgba(255,80,60,${0.5 * df + 0.2})` : 'rgba(255,230,140,0.45)');
    g.fillStyle = dg; g.fill();
    g.strokeStyle = df > 0.1 ? '#ff6a5a' : `rgba(255,220,120,${0.5 + Math.sin(t * 3) * 0.15})`; g.lineWidth = 2.5; g.stroke();
    // 血条沿结界顶
    g.lineCap = 'round';
    g.beginPath(); g.arc(CX, DOME_CY, DOME_R + 7, -Math.PI / 2 - 0.55, -Math.PI / 2 + 0.55); g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 7; g.stroke();
    g.beginPath(); g.arc(CX, DOME_CY, DOME_R + 7, -Math.PI / 2 - 0.55, -Math.PI / 2 - 0.55 + 1.1 * hpK); g.strokeStyle = hpK > 0.35 ? '#7dff9a' : '#ff5050'; g.lineWidth = 4.5; g.stroke();
    if (S && mode !== 'title') {
      g.font = '900 13px "PingFang SC", sans-serif'; g.textAlign = 'center';
      g.fillStyle = '#000'; g.fillText(Math.ceil(S.hp), CX, DOME_CY - DOME_R - 15);
      g.fillStyle = hpK > 0.35 ? '#e8ffe8' : '#ffd0d0'; g.fillText(Math.ceil(S.hp), CX, DOME_CY - DOME_R - 16);
    }
    g.restore();
    // 楼顶女儿墙
    const wg = g.createLinearGradient(0, GROUND, 0, VH);
    wg.addColorStop(0, '#5a1a16'); wg.addColorStop(0.15, '#3a0e0e'); wg.addColorStop(1, '#14040a');
    g.fillStyle = wg; g.fillRect(0, GROUND, VW, VH - GROUND);
    g.fillStyle = '#8a2a1e'; g.fillRect(0, GROUND, VW, 5);
    g.fillStyle = 'rgba(255,210,74,0.5)'; g.fillRect(0, GROUND, VW, 1.2);
    g.fillStyle = 'rgba(0,0,0,0.25)';
    for (let x = 0; x < VW; x += 28) g.fillRect(x, GROUND + 5, 1.5, VH - GROUND);
    for (let y = GROUND + 18; y < VH; y += 14) g.fillRect(0, y, VW, 1);
    // 春联
    for (const sd of [-1, 1]) {
      const x = sd < 0 ? 8 : VW - 30;
      g.fillStyle = '#c8102e'; g.fillRect(x, GROUND + 9, 22, 54);
      g.strokeStyle = '#ffd24a'; g.lineWidth = 1; g.strokeRect(x + 2, GROUND + 11, 18, 50);
      g.fillStyle = '#1a0a04'; g.font = '700 14px "Kaiti SC","STKaiti","KaiTi",serif'; g.textAlign = 'center';
      (sd < 0 ? '爆竹' : '迎春').split('').forEach((c, i) => g.fillText(c, x + 11, GROUND + 28 + i * 20));
    }
    // 中间“福”字门
    g.save(); g.translate(CX, GROUND + 34); g.rotate(Math.PI / 4);
    g.fillStyle = '#c8102e'; g.fillRect(-15, -15, 30, 30); g.strokeStyle = '#ffd24a'; g.lineWidth = 1.5; g.strokeRect(-12, -12, 24, 24);
    g.rotate(Math.PI); g.fillStyle = '#ffd24a'; g.font = '900 18px "Kaiti SC","STKaiti","KaiTi",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('福', 0, 1);
    g.restore(); g.textBaseline = 'alphabetic';

    // 灯笼（左右，挂在杆上晃）
    for (const sd of [-1, 1]) {
      const px = sd < 0 ? 18 : VW - 18;
      g.strokeStyle = '#3a1a10'; g.lineWidth = 3; g.beginPath(); g.moveTo(px, GROUND); g.lineTo(px, 560); g.lineTo(px - sd * 30, 560); g.stroke();
      const sw = Math.sin(t * 1.6 + sd) * 0.12;
      g.save(); g.translate(px - sd * 30, 560); g.rotate(sw);
      g.strokeStyle = '#ffd24a'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 10); g.stroke();
      const lg = g.createRadialGradient(0, 32, 2, 0, 32, 40); lg.addColorStop(0, 'rgba(255,120,60,0.55)'); lg.addColorStop(1, 'rgba(255,40,30,0)');
      g.fillStyle = lg; g.beginPath(); g.arc(0, 32, 40, 0, TAU); g.fill();
      const bg = g.createRadialGradient(-5, 26, 2, 0, 32, 22); bg.addColorStop(0, '#ff8a5a'); bg.addColorStop(0.5, '#e0182c'); bg.addColorStop(1, '#7a0610');
      g.fillStyle = bg; g.beginPath(); g.ellipse(0, 32, 19, 22, 0, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,210,74,0.6)'; g.lineWidth = 1;
      for (const k of [-10, 0, 10]) { g.beginPath(); g.ellipse(0, 32, Math.abs(k) === 10 ? 11 : 0.5, 22, 0, 0, TAU); g.stroke(); }
      g.fillStyle = '#ffd24a'; g.fillRect(-8, 9, 16, 4); g.fillRect(-8, 52, 16, 4);
      g.strokeStyle = '#ffd24a'; for (let k = -4; k <= 4; k += 2) { g.beginPath(); g.moveTo(k, 56); g.lineTo(k + Math.sin(t * 3 + k) * 1.5, 70); g.stroke(); }
      g.fillStyle = '#ffd24a'; g.font = '900 13px "Kaiti SC","STKaiti","KaiTi",serif'; g.textAlign = 'center'; g.fillText(sd < 0 ? '春' : '福', 0, 37);
      g.restore();
    }

    const L = S ? S.levels : { rocket: 1, fount: 0, kick: 0, spark: 0, whip: 0 };
    // 滋花
    for (const x of [44, VW - 44]) {
      const on = L.spark >= (x < CX ? 1 : 2);
      g.save(); g.translate(x, GROUND);
      if (!on) { ghostPad(g); g.restore(); continue; }
      g.fillStyle = '#2a5aa0'; g.strokeStyle = '#7df0ff'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(-12, 0); g.lineTo(12, 0); g.lineTo(9, -26); g.lineTo(-9, -26); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = '#9aa0a8'; g.lineWidth = 1.6;
      for (const k of [-1, 0, 1]) { g.beginPath(); g.moveTo(k * 3, -26); g.lineTo(k * 9, -62); g.stroke(); }
      g.globalCompositeOperation = 'lighter';
      for (const k of [-1, 0, 1]) {
        const sx = k * 9, sy = -62;
        const gr = g.createRadialGradient(sx, sy, 0, sx, sy, 12); gr.addColorStop(0, 'rgba(255,255,230,1)'); gr.addColorStop(0.3, 'rgba(255,220,120,0.6)'); gr.addColorStop(1, 'rgba(255,180,60,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(sx, sy, 12, 0, TAU); g.fill();
        g.strokeStyle = '#fff6c0'; g.lineWidth = 1;
        for (let j = 0; j < 5; j++) { const a = Math.random() * TAU, l = rnd(4, 11); g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); g.stroke(); }
      }
      g.globalCompositeOperation = 'source-over';
      g.restore();
    }
    // 二踢脚桶
    [92, VW - 92].forEach((x, i) => {
      const on = L.kick >= (i === 0 ? 1 : 2);
      g.save(); g.translate(x, GROUND);
      if (!on) { ghostPad(g); g.restore(); return; }
      const rec = S ? S.kickRec[i] : 0;
      g.fillStyle = '#6a4a2a'; g.beginPath(); g.moveTo(-17, 0); g.lineTo(17, 0); g.lineTo(20, -22); g.lineTo(-20, -22); g.closePath(); g.fill();
      g.strokeStyle = '#3a2410'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#ffd24a'; g.fillRect(-19, -16, 38, 3);
      const n = Math.min(5, 1 + L.kick);
      for (let k = 0; k < n; k++) {
        const ox = (k - (n - 1) / 2) * 7, h = 26 - rec * 10 + (k % 2) * 3;
        g.fillStyle = L.kick >= 3 ? '#8a2ac8' : '#c8102e'; g.fillRect(ox - 3, -22 - h, 6, h);
        g.fillStyle = '#ffd24a'; g.fillRect(ox - 3, -22 - h + 4, 6, 2);
        g.strokeStyle = '#c89a5a'; g.lineWidth = 1; g.beginPath(); g.moveTo(ox, -22 - h); g.lineTo(ox + 2, -26 - h); g.stroke();
      }
      g.restore();
    });
    // 火树银花
    [148, VW - 148].forEach((x, i) => {
      const on = L.fount >= (i === 0 ? 1 : 2);
      g.save(); g.translate(x, GROUND);
      if (!on) { ghostPad(g); g.restore(); return; }
      const ch = S ? S.fountCharge : 0;
      g.fillStyle = '#c8102e'; g.beginPath(); g.moveTo(-15, 0); g.lineTo(15, 0); g.lineTo(5, -44); g.lineTo(-5, -44); g.closePath(); g.fill();
      g.strokeStyle = '#ffd24a'; g.lineWidth = 1.6; g.stroke();
      g.fillStyle = '#ffd24a'; g.fillRect(-12, -14, 24, 4); g.fillRect(-8, -30, 16, 3);
      g.globalCompositeOperation = 'lighter';
      const rr = 10 + ch * 22;
      const gr = g.createRadialGradient(0, -46, 0, 0, -46, rr); gr.addColorStop(0, 'rgba(255,255,230,0.95)'); gr.addColorStop(0.4, `rgba(255,210,80,${0.3 + ch * 0.5})`); gr.addColorStop(1, 'rgba(255,160,40,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, -46, rr, 0, TAU); g.fill();
      g.globalCompositeOperation = 'source-over';
      g.restore();
      if (S && ch > 0 && Math.random() < 0.6) part({ k: 0, x: x + rnd(-4, 4), y: GROUND - 46, vx: rnd(-50, 50), vy: rnd(-160, -60), g: 260, life: 0.5, max: 0.5, size: rnd(1, 2), c: '#fff4c0', drag: 0.98 });
    });
    // 主炮：烟花箱
    g.save(); g.translate(CX, GROUND);
    const aim = S ? S.aim : -Math.PI / 2, rec = S ? S.recoil : 0;
    g.save(); g.translate(0, -36); g.rotate(aim + Math.PI / 2);
    const tubes = Math.min(6, L.rocket);
    for (let k = 0; k < tubes; k++) {
      const ox = (k - (tubes - 1) / 2) * 6.5;
      g.fillStyle = '#e0182c'; g.fillRect(ox - 3, -30 + rec * 6, 6, 26);
      g.fillStyle = '#ffd24a'; g.fillRect(ox - 3, -30 + rec * 6, 6, 3);
    }
    if (S && S.muzzle > 0) {
      g.globalCompositeOperation = 'lighter';
      const mg2 = g.createRadialGradient(0, -34, 0, 0, -34, 22); mg2.addColorStop(0, `rgba(255,255,220,${S.muzzle})`); mg2.addColorStop(1, 'rgba(255,160,40,0)');
      g.fillStyle = mg2; g.beginPath(); g.arc(0, -34, 22, 0, TAU); g.fill();
      g.globalCompositeOperation = 'source-over';
    }
    g.restore();
    g.fillStyle = '#a3101e'; g.fillRect(-30, -40, 60, 40);
    g.strokeStyle = '#ffd24a'; g.lineWidth = 2; g.strokeRect(-28, -38, 56, 36);
    g.fillStyle = '#ffd24a'; g.font = '900 17px "Kaiti SC","STKaiti","KaiTi",serif'; g.textAlign = 'center'; g.fillText('大吉', 0, -14);
    g.restore();
  }
  function ghostPad(g) {
    g.strokeStyle = 'rgba(255,210,74,0.25)'; g.setLineDash([3, 3]); g.lineWidth = 1.2;
    g.beginPath(); g.arc(0, -14, 12, 0, TAU); g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(255,210,74,0.3)'; g.font = '700 14px sans-serif'; g.textAlign = 'center'; g.fillText('+', 0, -9);
  }

  /* ================= 渲染 ================= */
  function render(t) {
    const g = ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(BG, 0, 0);
    g.setTransform(K, 0, 0, K, 0, 0);
    let sx = 0, sy = 0;
    if (S && S.shake > 0) { sx = rnd(-1, 1) * S.shake; sy = rnd(-1, 1) * S.shake; }
    g.translate(sx, sy);
    // 天亮
    if (S && S.dawn > 0) { const dg = g.createLinearGradient(0, 0, 0, VH); dg.addColorStop(0, `rgba(255,170,120,${S.dawn * 0.5})`); dg.addColorStop(0.7, `rgba(255,220,160,${S.dawn * 0.6})`); g.fillStyle = dg; g.fillRect(-20, -20, VW + 40, VH + 40); }
    // 星星
    for (const s of stars) { g.globalAlpha = 0.35 + Math.sin(t * 2 + s.p) * 0.3; g.fillStyle = '#fff'; g.fillRect(s.x, s.y, s.r, s.r); }
    g.globalAlpha = 1;
    // 远处的烟花（邻居家放的）
    g.globalCompositeOperation = 'lighter';
    for (const a of ambient) {
      if (a.up) { g.fillStyle = 'rgba(255,220,160,0.7)'; g.fillRect(a.x - 0.8, a.y, 1.6, 6); continue; }
      const k = 1 - a.t / 1.6;
      g.globalAlpha = k * 0.75;
      for (let i = 0; i < a.p.length; i++) { const p = a.p[i]; g.fillStyle = a.set[i % 3]; g.fillRect(p.x - 1, p.y - 1, 2, 2); }
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.setTransform(1, 0, 0, 1, sx * K, sy * K); g.drawImage(CITY, 0, 0); g.setTransform(K, 0, 0, K, sx * K, sy * K);

    // 年兽
    if (!B.gone) {
      const bob = Math.sin(t * 1.3) * 4;
      g.save();
      if (B.dying > 0) g.globalAlpha = clamp(B.dying / 2.6, 0, 1);
      drawNian(g, B.x, B.y + bob, B.s, t);
      g.restore();
      if (B.active && !B.dying) {
        // 年兽血条
        const w = 260, x0 = CX - w / 2, y0 = 96;
        g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x0 - 2, y0 - 2, w + 4, 12);
        const hk = clamp(B.hp / B.max, 0, 1);
        const hg = g.createLinearGradient(x0, 0, x0 + w, 0); hg.addColorStop(0, '#ff3a3a'); hg.addColorStop(1, '#ffd24a');
        g.fillStyle = hg; g.fillRect(x0, y0, w * hk, 8);
        g.strokeStyle = '#ffd24a'; g.lineWidth = 1; g.strokeRect(x0 - 2, y0 - 2, w + 4, 12);
        g.font = '900 12px "Kaiti SC","STKaiti",serif'; g.textAlign = 'center'; g.fillStyle = '#ffe9a0'; g.fillText('年 兽', CX, y0 - 5);
      }
    }
    // 鳞甲（远的先画）
    let rebuilt = 0;
    for (let i = layers.length - 1; i >= 0; i--) {
      const L = layers[i];
      if (L.dirty && L.rc && rebuilt < 2) { L.rebuild(); rebuilt++; }
      L.draw(g, i === 0 && S ? S.warn * (0.5 + Math.sin(t * 10) * 0.5) : 0);
    }
    // 碎鳞
    for (const s of shards) {
      g.save(); g.translate(s.x, s.y); g.rotate(s.rot); g.globalAlpha = clamp(s.life / s.max * 1.4, 0, 1);
      g.fillStyle = s.pal.s; g.beginPath(); g.moveTo(-s.sz, 0); g.quadraticCurveTo(-s.sz, s.sz * 1.4, 0, s.sz * 1.5); g.quadraticCurveTo(s.sz, s.sz * 1.4, s.sz, 0); g.closePath(); g.fill();
      g.strokeStyle = s.pal.rim; g.lineWidth = 1.5; g.stroke();
      g.restore();
    }
    g.globalAlpha = 1;
    // 光柱
    g.globalCompositeOperation = 'lighter';
    for (const b of beams) {
      const dx = Math.cos(b.a), dy = Math.sin(b.a), len = 900;
      const k = Math.min(1, b.t / 0.08) * Math.min(1, (b.dur - b.t) / 0.12);
      const hw = b.hw * k;
      g.lineCap = 'round';
      g.strokeStyle = `rgba(255,170,40,${0.25 * k})`; g.lineWidth = hw * 5; g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x + dx * len, b.y + dy * len); g.stroke();
      g.strokeStyle = `rgba(255,220,120,${0.6 * k})`; g.lineWidth = hw * 2.2; g.stroke();
      g.strokeStyle = `rgba(255,255,240,${0.95 * k})`; g.lineWidth = hw * 0.8; g.stroke();
      // 光柱上的闪点
      for (let j = 0; j < 8; j++) { const tt = Math.random() * 600; g.fillStyle = '#fff6d0'; g.fillRect(b.x + dx * tt + rnd(-hw, hw) * 1.5, b.y + dy * tt + rnd(-hw, hw) * 1.5, 2, 2); }
    }
    // 电光
    for (const bo of bolts) {
      const k = bo.life / bo.max;
      for (let pass = 0; pass < 2; pass++) {
        g.strokeStyle = pass ? `rgba(255,255,235,${k})` : `rgba(255,200,80,${0.5 * k})`;
        g.lineWidth = pass ? bo.w : bo.w * 3.5;
        g.beginPath(); g.moveTo(bo.pts[0].x, bo.pts[0].y);
        for (let i = 1; i < bo.pts.length; i++) {
          const a = bo.pts[i - 1], b = bo.pts[i];
          const segs = 6;
          for (let s = 1; s <= segs; s++) {
            const tt = s / segs, j = s === segs ? 0 : 14;
            g.lineTo(lerp(a.x, b.x, tt) + rnd(-j, j), lerp(a.y, b.y, tt) + rnd(-j, j));
          }
        }
        g.stroke();
      }
      for (let i = 1; i < bo.pts.length; i++) { const p = bo.pts[i]; const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14); gr.addColorStop(0, `rgba(255,255,230,${k})`); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, 14, 0, TAU); g.fill(); }
    }
    g.globalCompositeOperation = 'source-over';
    // 窜天猴
    for (const b of bullets) {
      const a = Math.atan2(b.vy, b.vx);
      g.save(); g.translate(b.x, b.y); g.rotate(a);
      g.globalCompositeOperation = 'lighter';
      const tl = 26 + (b.crit ? 8 : 0);
      const tg = g.createLinearGradient(-tl, 0, 0, 0); tg.addColorStop(0, 'rgba(255,140,40,0)'); tg.addColorStop(1, b.crit ? 'rgba(255,255,200,0.95)' : 'rgba(255,210,100,0.85)');
      g.strokeStyle = tg; g.lineWidth = b.crit ? 3.4 : 2.4; g.beginPath(); g.moveTo(-tl, 0); g.lineTo(-3, 0); g.stroke();
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = b.crit ? '#ffd24a' : '#e0182c'; g.fillRect(-4, -2, 9, 4);
      g.fillStyle = '#fff4c0'; g.beginPath(); g.moveTo(5, -2); g.lineTo(9, 0); g.lineTo(5, 2); g.fill();
      g.restore();
    }
    // 二踢脚
    for (const m of missiles) {
      g.globalCompositeOperation = 'lighter';
      g.strokeStyle = m.evo ? 'rgba(210,140,255,0.7)' : 'rgba(255,170,60,0.7)'; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); for (let i = 0; i < m.trail.length; i += 2) (i ? g.lineTo : g.moveTo).call(g, m.trail[i], m.trail[i + 1]); g.stroke();
      g.globalCompositeOperation = 'source-over';
      g.save(); g.translate(m.x, m.y); g.rotate(Math.atan2(m.vy, m.vx));
      g.fillStyle = m.evo ? '#8a2ac8' : '#c8102e'; g.fillRect(-7, -3.5, 14, 7); g.fillStyle = '#ffd24a'; g.fillRect(-2, -3.5, 2.5, 7);
      g.restore();
    }
    // 大礼花弹
    for (const s of shells) {
      if (s.t < 0) continue;
      const gr = g.createRadialGradient(s.x, s.y, 0, s.x, s.y, 16); gr.addColorStop(0, '#fff'); gr.addColorStop(0.4, 'rgba(255,210,80,0.8)'); gr.addColorStop(1, 'rgba(255,120,40,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(s.x, s.y, 16, 0, TAU); g.fill();
    }
    // 敌人
    for (const f of foes) drawFoe(g, f, t);

    drawRoof(g, t);

    // 粒子
    for (const p of parts) {
      const k = p.life / p.max;
      if (p.k === 3) { g.fillStyle = p.c + (0.18 * k) + ')'; g.beginPath(); g.arc(p.x, p.y, p.size, 0, TAU); g.fill(); continue; }
      if (p.k === 2) { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.globalAlpha = Math.min(1, k * 2); g.fillStyle = p.c; g.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6 * Math.abs(Math.cos(p.rot * 1.3))); g.restore(); continue; }
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      const k = p.life / p.max;
      if (p.k === 0) { g.globalAlpha = Math.min(1, k * 1.6); g.fillStyle = p.c; g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); }
      else if (p.k === 1) {
        if (p.glit && k < 0.35 && Math.random() < 0.5) continue;
        g.globalAlpha = Math.min(1, k * 1.5); g.strokeStyle = p.c; g.lineWidth = p.size;
        g.beginPath(); g.moveTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05); g.lineTo(p.x, p.y); g.stroke();
      } else if (p.k === 4) {
        g.globalAlpha = k; const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.3, p.c); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, p.size, 0, TAU); g.fill();
      }
    }
    g.globalAlpha = 1;
    for (const r of rings) {
      const k = r.life / r.maxLife;
      g.strokeStyle = r.color; g.globalAlpha = k; g.lineWidth = r.w * k + 0.5;
      g.beginPath(); g.arc(r.x, r.y, r.r, 0, TAU); g.stroke();
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    // 铜钱
    for (const c of coins) {
      const w = Math.abs(Math.cos(c.spin)) * 6 + 1;
      g.fillStyle = '#ffd24a'; g.beginPath(); g.ellipse(c.x, c.y, w, 6, 0, 0, TAU); g.fill();
      g.strokeStyle = '#a06a10'; g.lineWidth = 1; g.stroke();
      if (w > 3) { g.fillStyle = '#7a4a08'; g.fillRect(c.x - w * 0.25, c.y - 1.6, w * 0.5, 3.2); }
    }
    // 雪
    g.fillStyle = 'rgba(255,255,255,0.7)';
    for (const s of snow) { g.beginPath(); g.arc(s.x, s.y, s.r, 0, TAU); g.fill(); }
    // 伤害数字
    g.textAlign = 'center';
    for (const n of nums) {
      const k = n.life / n.max;
      g.globalAlpha = Math.min(1, k * 2);
      g.font = `900 ${n.crit ? 17 : 12}px "PingFang SC", sans-serif`;
      g.lineWidth = 3; g.strokeStyle = 'rgba(40,0,0,0.85)'; g.strokeText(n.t, n.x, n.y);
      g.fillStyle = n.c; g.fillText(n.t, n.x, n.y);
    }
    g.globalAlpha = 1;
    // 压顶警告
    if (S && S.warn > 0 && mode === 'play') {
      const a = S.warn * (0.4 + Math.sin(t * 9) * 0.25);
      const vg = g.createRadialGradient(CX, VH / 2, VH * 0.35, CX, VH / 2, VH * 0.7); vg.addColorStop(0, 'rgba(255,0,0,0)'); vg.addColorStop(1, `rgba(255,20,30,${a})`);
      g.fillStyle = vg; g.fillRect(-20, -20, VW + 40, VH + 40);
      g.font = '900 15px "Kaiti SC","STKaiti",serif'; g.fillStyle = `rgba(255,220,200,${0.6 + Math.sin(t * 9) * 0.3})`; g.fillText('鳞甲压下来了，快轰碎最底层！', CX, 640);
    }
    if (S && S.flash > 0) { g.fillStyle = `rgba(255,250,230,${S.flash * 0.7})`; g.fillRect(-20, -20, VW + 40, VH + 40); }
  }
  function drawFoe(g, f, t) {
    g.save(); g.translate(f.x, f.y);
    if (f.kind === 'bag') {
      const bob = Math.sin(f.ph) * 0.15;
      g.rotate(bob);
      g.globalCompositeOperation = 'lighter';
      const gl = g.createRadialGradient(0, 0, 4, 0, 0, 40); gl.addColorStop(0, 'rgba(255,210,74,0.5)'); gl.addColorStop(1, 'rgba(255,160,40,0)');
      g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 40, 0, TAU); g.fill();
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = f.flash > 0 ? '#ff8a8a' : '#d8102c';
      g.beginPath(); g.moveTo(-8, -14); g.quadraticCurveTo(-24, -6, -22, 8); g.quadraticCurveTo(-20, 22, 0, 22); g.quadraticCurveTo(20, 22, 22, 8); g.quadraticCurveTo(24, -6, 8, -14); g.closePath(); g.fill();
      g.strokeStyle = '#ffd24a'; g.lineWidth = 1.8; g.stroke();
      g.beginPath(); g.moveTo(-8, -14); g.lineTo(-12, -22); g.lineTo(0, -18); g.lineTo(12, -22); g.lineTo(8, -14); g.fillStyle = '#d8102c'; g.fill(); g.stroke();
      g.fillStyle = '#ffd24a'; g.fillRect(-9, -16, 18, 3);
      g.font = '900 15px "Kaiti SC","STKaiti",serif'; g.textAlign = 'center'; g.fillText('福', 0, 10);
      g.restore(); return;
    }
    const iron = f.kind === 'iron';
    // 尾焰
    const va = Math.atan2(f.vy, f.vx);
    g.save(); g.rotate(va);
    g.globalCompositeOperation = 'lighter';
    const tl = f.r * (iron ? 2.2 : 3.2);
    const tg = g.createLinearGradient(-tl, 0, 0, 0); tg.addColorStop(0, 'rgba(255,60,0,0)'); tg.addColorStop(1, iron ? 'rgba(255,90,30,0.7)' : 'rgba(255,200,80,0.85)');
    g.fillStyle = tg; g.beginPath(); g.moveTo(-tl, 0); g.quadraticCurveTo(-tl * 0.4, -f.r * 1.05, 0, -f.r * 0.9); g.lineTo(0, f.r * 0.9); g.quadraticCurveTo(-tl * 0.4, f.r * 1.05, -tl, 0); g.fill();
    g.globalCompositeOperation = 'source-over';
    g.restore();
    g.save();
    if (iron) {
      g.rotate(f.rot);
      g.fillStyle = '#2a2224';
      g.beginPath();
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, rr = i % 2 ? f.r : f.r * 1.38; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      g.closePath(); g.fill(); g.strokeStyle = '#6a5a5a'; g.lineWidth = 1.2; g.stroke();
      const ig = g.createRadialGradient(-f.r * 0.3, -f.r * 0.3, 1, 0, 0, f.r); ig.addColorStop(0, '#5a4a4c'); ig.addColorStop(1, '#141012');
      g.fillStyle = ig; g.beginPath(); g.arc(0, 0, f.r * 0.92, 0, TAU); g.fill();
      g.strokeStyle = `rgba(255,${100 + Math.sin(t * 8 + f.ph) * 60 | 0},40,0.95)`; g.lineWidth = 2;
      g.beginPath(); g.moveTo(-f.r * 0.6, -f.r * 0.2); g.lineTo(-f.r * 0.1, f.r * 0.1); g.lineTo(f.r * 0.2, -f.r * 0.4); g.moveTo(-f.r * 0.1, f.r * 0.1); g.lineTo(f.r * 0.1, f.r * 0.6); g.stroke();
    } else {
      const fg = g.createRadialGradient(0, 0, 1, 0, 0, f.r * 1.3);
      fg.addColorStop(0, '#fffbe0'); fg.addColorStop(0.35, '#ffd24a'); fg.addColorStop(0.7, '#ff5a1a'); fg.addColorStop(1, 'rgba(200,20,10,0)');
      g.fillStyle = fg; g.beginPath(); g.arc(0, 0, f.r * 1.3, 0, TAU); g.fill();
      // 煞火里的小鬼脸
      g.fillStyle = 'rgba(90,10,0,0.75)';
      g.beginPath(); g.ellipse(-f.r * 0.3, -f.r * 0.1, f.r * 0.14, f.r * 0.2, 0.4, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(f.r * 0.3, -f.r * 0.1, f.r * 0.14, f.r * 0.2, -0.4, 0, TAU); g.fill();
      g.beginPath(); g.arc(0, f.r * 0.3, f.r * 0.2, 0, Math.PI); g.fill();
    }
    if (f.flash > 0) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = f.flash * 0.8; g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, f.r, 0, TAU); g.fill(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    if (f.slow > 0) { g.strokeStyle = 'rgba(180,240,255,0.8)'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, f.r * 1.4, t * 4, t * 4 + 4); g.stroke(); }
    g.restore();
    if (f.hp < f.max) {
      g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(-f.r, -f.r - 10, f.r * 2, 4);
      g.fillStyle = iron ? '#ff6a3a' : '#ffd24a'; g.fillRect(-f.r, -f.r - 10, f.r * 2 * clamp(f.hp / f.max, 0, 1), 4);
    }
    g.restore();
  }

  /* ================= HUD ================= */
  const H = { stage: $('hStage'), time: $('hTime'), xpFill: $('xpFill'), xpTxt: $('xpTxt'), layers: $('hLayers'), kills: $('hKills'), ult: $('ult'), ultFill: $('ultFill'), ultTxt: $('ultTxt') };
  const lastH = {};
  function setText(el, key, v) { if (lastH[key] !== v) { lastH[key] = v; el.textContent = v; } }
  function clock(s) { s = Math.max(0, s | 0); return String(s / 60 | 0).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function hud() {
    if (!S) return;
    setText(H.stage, 'st', STAGES[S.stage]);
    setText(H.time, 'tm', clock(S.t));
    setText(H.xpTxt, 'lv', `等级 ${S.lv}`);
    const w = clamp(S.xp / S.xpMax * 100, 0, 100).toFixed(1) + '%';
    if (lastH.w !== w) { lastH.w = w; H.xpFill.style.width = w; }
    setText(H.layers, 'ly', String(S.broken));
    setText(H.kills, 'kl', String(S.kills));
    const u = Math.floor(S.ult);
    if (lastH.u !== u) { lastH.u = u; H.ultFill.style.height = u + '%'; H.ultTxt.textContent = u >= 100 ? '点我！' : u + '%'; H.ult.classList.toggle('ready', u >= 100); }
  }

  /* ================= 开局、结束、标题 ================= */
  const best = () => { try { return +localStorage.getItem('echo_nian_best') || 0; } catch (e) { return 0; } };
  function showTitle() {
    mode = 'title';
    $('hud').classList.remove('on'); $('ult').classList.remove('on');
    const b = best();
    $('screen').innerHTML = `<div class="tag">回声游戏厅 · 第 16 期</div>
      <h1 class="kai">烟花炸年兽</h1>
      <div class="sub">除夕夜，年兽披着二十五层鳞甲压过来了。<br>在楼顶摆开烟花炮阵，把它一层层轰碎，再把它本体炸跑。</div>
      <div class="help">
        <b>自动开火</b>：主炮窜天猴会自己找目标<br>
        <b>按住拖动</b>：手动瞄准，想打哪打哪<br>
        <b>捡铜钱升级</b>：火树银花、二踢脚、滋花、千响挂鞭任选<br>
        <b>大礼花</b>：攒满点右下角按钮或按空格，一发炸开半边天<br>
        <b>别让鳞甲压到楼顶</b>，也别让煞火砸穿门神结界
      </div>
      ${b ? `<div class="best">最高得分 <b>${b.toLocaleString()}</b></div>` : ''}
      <button class="go kai" id="goBtn">点炮仗</button>`;
    $('screen').classList.add('on');
    $('goBtn').addEventListener('click', (e) => { e.stopPropagation(); start(); });
  }
  function titleIdle(dt) {
    updParts(dt);
    if (Math.random() < dt * 1.2) firework(rnd(60, VW - 60), rnd(440, 600), 60, rnd(120, 200), null, 1.2, 60);
  }
  function start() {
    auInit();
    newRun();
    mode = 'play'; last = performance.now();
    $('screen').classList.remove('on'); $('lvl').classList.remove('on'); $('pause').classList.remove('on');
    $('hud').classList.add('on'); $('ult').classList.add('on');
    Object.keys(lastH).forEach((k) => delete lastH[k]);
    toast(`${STAGES[0]} · 年兽来了，点炮仗！`, 2.6);
    sfx.crackle(16, 0.05);
    if (!window.__noHub) try { const hh = JSON.parse(localStorage.getItem('echo_hub')) || {}, d = new Date(), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); (hh.days = hh.days || {})[k] = 'nian'; (hh.played = hh.played || {}).nian = k; hh.last = 'nian'; localStorage.setItem('echo_hub', JSON.stringify(hh)); } catch (e) { /* 存不了就算了 */ }
  }
  function scoreOf() {
    return S.broken * 300 + S.kills * 15 + S.bags * 200 + S.lv * 60 + (S.won ? 6000 + Math.max(0, Math.round((420 - S.t) * 20)) : 0);
  }
  function rankOf(sc, won) {
    if (won) return sc > 32000 ? '烟花总指挥' : sc > 26000 ? '放炮大将' : '守岁好手';
    return sc > 12000 ? '差一口气' : sc > 5000 ? '炮仗小队长' : '刚点着引线';
  }
  function lose() { finish(false); }
  function win() { finish(true); }
  function finish(won) {
    if (mode === 'over') return;
    mode = 'over'; S.won = won;
    $('lvl').classList.remove('on');
    [bullets, missiles, beams, bolts, pops, shells].forEach((a) => (a.length = 0));
    const sc = scoreOf(); S.score = sc;
    const b = best(), nb = sc > b;
    if (nb) try { localStorage.setItem('echo_nian_best', String(sc)); } catch (e) { /* 存不了就算了 */ }
    if (won) { for (let i = 0; i < 6; i++) setTimeout(() => { firework(rnd(60, VW - 60), rnd(200, 500), 120, rnd(200, 300), null, 1.6, 60); sfx.bigBoom(); }, i * 260); }
    else { sfx.roar(); shake(14); }
    setTimeout(() => {
      $('hud').classList.remove('on'); $('ult').classList.remove('on');
      $('screen').innerHTML = `<div class="tag">${won ? '新春大吉' : '结界碎了'}</div>
        <h1 class="kai" style="font-size:${won ? 50 : 44}px">${won ? '年兽被炸跑啦' : '年兽进村了'}</h1>
        <div class="sub">${won ? '天边泛白，鞭炮声里，新年到了。' : `撑到了${STAGES[S.stage]}，碎了 ${S.broken} 层鳞甲。`}</div>
        <div class="big">${sc.toLocaleString()}</div>
        <div class="rank kai">${rankOf(sc, won)}${nb ? ' · 新纪录' : ''}</div>
        <table>
          <tr><td>碎鳞甲</td><td>${S.broken} / ${TOTAL}</td></tr>
          <tr><td>灭煞火</td><td>${S.kills}</td></tr>
          <tr><td>打开福袋</td><td>${S.bags}</td></tr>
          <tr><td>炮阵等级</td><td>Lv.${S.lv}</td></tr>
          <tr><td>用时</td><td>${clock(S.t)}</td></tr>
        </table>
        <button class="go kai" id="goBtn">再放一轮</button>`;
      $('screen').classList.add('on');
      $('goBtn').addEventListener('click', (e) => { e.stopPropagation(); start(); });
    }, won ? 2200 : 1300);
  }
  function pause(on) {
    if (on && mode === 'play') { mode = 'pause'; $('pause').classList.add('on'); }
    else if (!on && mode === 'pause') { mode = 'play'; $('pause').classList.remove('on'); last = performance.now(); }
  }

  /* ================= 输入 ================= */
  function toLogic(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * VW, (e.clientY - r.top) / r.height * VH]; }
  cv.addEventListener('pointerdown', (e) => { auInit(); if (mode !== 'play') return; S.ptr = true; [S.px, S.py] = toLogic(e); try { cv.setPointerCapture(e.pointerId); } catch (er) { /* 无所谓 */ } });
  cv.addEventListener('pointermove', (e) => { if (mode === 'play' && S.ptr) [S.px, S.py] = toLogic(e); });
  const up = () => { if (S) S.ptr = false; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  $('ult').addEventListener('click', (e) => { e.stopPropagation(); fireUlt(); });
  $('bSpeed').addEventListener('click', () => { if (!S) return; S.speed = S.speed === 1 ? 2 : 1; $('bSpeed').textContent = 'x' + S.speed; $('bSpeed').classList.toggle('on', S.speed === 2); });
  function toggleMute() { AU.on = !AU.on; if (AU.out) AU.out.gain.value = AU.on ? 0.9 : 0; if (AU.on) auInit(); $('bMute').classList.toggle('off', !AU.on); $('bMute').textContent = AU.on ? '♪' : '×'; }
  $('bMute').addEventListener('click', toggleMute);
  $('bPause').addEventListener('click', () => pause(true));
  $('pResume').addEventListener('click', () => pause(false));
  $('pRestart').addEventListener('click', () => start());
  $('pHome').addEventListener('click', () => { location.href = '../'; });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') toggleMute();
    if (mode === 'lvl' && ['1', '2', '3'].includes(e.key)) takeCard(+e.key - 1);
    if (e.key === ' ') { e.preventDefault(); if (mode === 'play') fireUlt(); else if (mode === 'title' || (mode === 'over' && $('screen').classList.contains('on'))) start(); }
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') pause(mode === 'play');
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && !window.__noPause) pause(true); });
  window.addEventListener('resize', fit);

  /* ================= 启动 ================= */
  function frame(now) {
    const raw = Math.min(0.1, (now - last) / 1000); last = now;
    if (!window.__freeze) update(raw);
    render(now / 1000);
    hud();
    requestAnimationFrame(frame);
  }
  fit();
  newRun();
  showTitle();
  requestAnimationFrame((n) => { last = n; frame(n); });

  // ?shot：摆一个热闹的画面后定格，给封面截图用
  if (/[?&]shot/.test(location.search)) {
    window.__noHub = window.__noPause = 1;
    document.body.style.display = 'block'; wrap.style.transform = 'none';
    start(); S.auto = true;
    sim(70);
    ['fount', 'kick', 'spark'].forEach((k) => { while (S.levels[k] < 3) { S.levels[k]++; } });
    sim(3.2);
    S.ult = 100; fireUlt(); sim(1.05);
    $('toast').classList.remove('show');
    window.__freeze = true;
  }
  function sim(sec, step = 1 / 60) { const n = Math.round(sec / step); for (let i = 0; i < n; i++) { if (mode === 'lvl' && S.auto) takeCard(autoPick()); update(step); if (mode === 'over') break; } }

  // 调试入口：推进时间、让电脑代打、截图
  window.__nian = {
    get S() { return S; }, get mode() { return mode; }, layers: () => layers, B,
    start, auto(on = true) { S.auto = on; }, ult() { S.ult = 100; },
    lv(k, n = 1) { for (let i = 0; i < n; i++) if (S.levels[k] < MAXLV) { S.levels[k]++; S.lv++; } },
    xp(n = 500) { S.xp += n; }, breakLayer(n = 1) { for (let i = 0; i < n; i++) { if (!layers[0]) break; layers[0].alive = 0; checkBreak(); } },
    sim,
    bench(n = 30) { const t0 = performance.now(); for (let i = 0; i < n; i++) render(performance.now() / 1000 + i / 60); return (performance.now() - t0) / n; },
    spawn: spawnFoe, set tough(v) { TOUGH = v; }, set xpc(v) { XPC = v; }, set bossHp(v) { BOSS_HP = v; }, firework, toast, win, lose, hp(v) { S.hp = v; },
  };
})();
