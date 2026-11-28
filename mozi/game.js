// 墨字守营 · 回声游戏厅第 17 期
// 水墨棋盘塔防：把字摆上棋盘，拼出人名召唤武将，同字相叠升星，守住大营十二波。
// 逻辑坐标固定 450 × 800 竖屏，整块舞台按窗口等比缩放。
(() => {
  'use strict';

  /* ================= 基本常量 ================= */
  const VW = 450, VH = 800, TAU = Math.PI * 2;
  const $ = (id) => document.getElementById(id);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const lerp = (a, b, t) => a + (b - a) * t;
  const KAI = '"Kaiti SC", "STKaiti", "KaiTi", "楷体", "Songti SC", serif';
  const SANS = '"PingFang SC", "Microsoft YaHei", sans-serif';
  const NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];

  // 战场布局
  const FIELD_H = 520;
  const PATH = [[-34, 104], [410, 104], [410, 482], [88, 482]];
  const BASE = { x: 50, y: 468 };
  const RW = 50;
  const COLS = 4, ROWS = 3, CS = 68, GAP = 8, BX = 67, BY = 183;
  const BW = COLS * CS + (COLS - 1) * GAP, BH = ROWS * CS + (ROWS - 1) * GAP;
  // 手牌与按钮
  const HAND_N = 5, CW = 78, CH = 96, CGAP = 8;
  const HX = Math.floor((VW - (HAND_N * CW + (HAND_N - 1) * CGAP)) / 2), HY = 552;
  const BTN_REC = { x: 118, y: 672, w: 208, h: 74 };
  const BTN_DIS = { x: 340, y: 672, w: 98, h: 74 };
  const ULT = { x: 60, y: 709, r: 43 };
  const BTN_EARLY = { x: 14, y: 136, w: 132, h: 34 };
  const COIN_T = [404, 41];
  const COST0 = 10;
  const cost = () => Math.min(45, COST0 + 3 * (S ? S.recruits : 0));
  const TOTAL = 12;

  // 难度旋钮（调数值用）
  // 每波敌军血量倍率：前面涨得快，后面放缓，免得最后两波一下子压垮
  let HPK = 6.5;
  const HPT = [1, 1, 1.36, 1.85, 2.5, 3.4, 4.6, 6.2, 8.2, 10.2, 12.4, 15, 18];
  const HPW = (w) => 38 * HPK * HPT[clamp(w, 1, 12)];

  /* ================= 字兵与武将 ================= */
  const DEF = {
    gong: { ch: '弓', name: '弓手', ink: '#24272b', range: 245, dmg: 16, cd: 0.8, desc: '远射，三星双箭、五星三箭' },
    dao: { ch: '刀', name: '刀卫', ink: '#8a1f1a', range: 140, dmg: 24, cd: 1.0, desc: '横扫身前一片，击退，破盾' },
    du: { ch: '毒', name: '毒师', ink: '#1d6b3c', range: 225, dmg: 9, cd: 1.3, desc: '毒雾减速，持续掉血，破盾' },
    ci: { ch: '刺', name: '刺客', ink: '#5b2052', range: 195, dmg: 11, cd: 0.45, desc: '飞针连刺，常暴击' },
    qi: { ch: '骑', name: '铁骑', ink: '#203457', range: 235, dmg: 26, cd: 1.1, desc: '长枪掷出，穿透一串' },
    pao: { ch: '炮', name: '投石', ink: '#5b4a32', range: 320, dmg: 38, cd: 1.9, desc: '石弹砸一片' },
    yi: { ch: '医', name: '军医', ink: '#b2392b', buff: 'haste', desc: '相邻友军出手加快' },
    gu: { ch: '鼓', name: '战鼓', ink: '#a0521c', buff: 'amp', desc: '相邻友军伤害提高' },
  };
  const BASE_TYPES = ['gong', 'dao', 'du', 'ci', 'qi', 'pao', 'yi', 'gu'];
  const HEROES = [
    { id: 'hz', a: 'huang', b: 'zhong', ca: '黄', cb: '忠', name: '黄忠', skill: '百步穿杨', awake: '万箭齐发', wave: 1, col: '#c28a12',
      desc: '射程最远，连射追着最前面的敌人打。三星双箭，五星金箭雨。' },
    { id: 'gy', a: 'guan', b: 'yu', ca: '关', cb: '羽', name: '关羽', skill: '青龙偃月', awake: '青龙出水', wave: 3, col: '#1f6e4c',
      desc: '一刀横扫身边一圈，重伤加击退，破盾。五星时每三刀放一次青龙。' },
    { id: 'zf', a: 'zhang', b: 'fei', ca: '张', cb: '飞', name: '张飞', skill: '当阳一喝', awake: '喝断长桥', wave: 5, col: '#3a2c68',
      desc: '大喝一声，震晕一圈敌人；晕住的敌人多吃三成伤害。' },
    { id: 'zy', a: 'zhao', b: 'yun', ca: '赵', cb: '云', name: '赵云', skill: '单骑救主', awake: '七进七出', wave: 7, col: '#2a5a86',
      desc: '白马银枪从大营冲出，沿山道逆冲，一路挑翻敌人。五星两骑连冲。' },
    { id: 'km', a: 'kong', b: 'ming', ca: '孔', cb: '明', name: '孔明', skill: '火烧连营', awake: '借东风', wave: 9, col: '#b3331d',
      desc: '天降火球砸进敌群，落地烧成一片火海，破盾。' },
  ];
  const HERO = {};            // id → 武将
  const HERO_OF = {};         // 单字 → 所属武将
  for (const h of HEROES) {
    HERO[h.id] = h; HERO_OF[h.a] = h; HERO_OF[h.b] = h;
    DEF[h.a] = { ch: h.ca, name: h.ca, ink: '#2a2017', hc: h, range: 200, dmg: 8, cd: 1.1, desc: `与「${h.cb}」拼成${h.name}` };
    DEF[h.b] = { ch: h.cb, name: h.cb, ink: '#2a2017', hc: h, range: 200, dmg: 8, cd: 1.1, desc: `与「${h.ca}」拼成${h.name}` };
  }
  const starMul = (s) => 1 + (s - 1) * 0.6;

  /* ================= 敌军 ================= */
  const KIND = {
    bing: { ch: '兵', hp: 1, spd: 44, r: 13, rw: 0.5, dmg: 1 },
    ma: { ch: '马', hp: 0.62, spd: 82, r: 13, rw: 0.5, dmg: 1, horse: 1 },
    dun: { ch: '盾', hp: 1.5, spd: 38, r: 14, rw: 1, dmg: 1, armor: 1 },
    wu: { ch: '巫', hp: 1.1, spd: 40, r: 14, rw: 2, dmg: 1, heal: 1 },
    jiang: { ch: '将', hp: 6, spd: 34, r: 19, rw: 4, dmg: 2 },
    shuai: { ch: '帅', hp: 60, spd: 23, r: 27, rw: 25, dmg: 4, boss: 1 },
    mo: { ch: '魔', hp: 95, spd: 23, r: 33, rw: 40, dmg: 6, boss: 2 },
  };
  const WAVES = [
    [['bing', 12]],
    [['bing', 12], ['ma', 6]],
    [['bing', 10], ['dun', 6], ['bing', 8]],
    [['ma', 12], ['wu', 2], ['bing', 14]],
    [['dun', 10], ['bing', 16], ['jiang', 2]],
    [['bing', 14], ['shuai', 1], ['ma', 10], ['bing', 10]],
    [['bing', 20], ['dun', 10], ['wu', 3]],
    [['ma', 20], ['jiang', 3], ['bing', 16]],
    [['dun', 14], ['wu', 4], ['bing', 18], ['jiang', 3]],
    [['bing', 28], ['ma', 16], ['jiang', 4]],
    [['jiang', 6], ['dun', 16], ['wu', 5], ['ma', 18]],
    [['bing', 16], ['mo', 1], ['jiang', 4], ['bing', 20], ['ma', 14]],
  ];

  /* ================= 山道 ================= */
  const SEG = []; let PLEN = 0;
  for (let i = 0; i < PATH.length - 1; i++) {
    const [ax, ay] = PATH[i], [bx, by] = PATH[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    SEG.push({ ax, ay, dx: (bx - ax) / len, dy: (by - ay) / len, len, s: PLEN, ang: Math.atan2(by - ay, bx - ax) });
    PLEN += len;
  }
  function onPath(d) {
    d = clamp(d, 0, PLEN);
    for (let i = 0; i < SEG.length; i++) {
      const s = SEG[i];
      if (d <= s.s + s.len || i === SEG.length - 1) { const l = d - s.s; return [s.ax + s.dx * l, s.ay + s.dy * l, s.ang]; }
    }
    return [PATH[PATH.length - 1][0], PATH[PATH.length - 1][1], Math.PI];
  }
  const PSAMP = [];
  for (let d = 40; d < PLEN; d += 18) PSAMP.push(onPath(d));

  /* ================= 声音：全部 Web Audio 现场合成 ================= */
  const AU = { ctx: null, out: null, mus: null, noise: null, on: true, last: {}, beat: 0, step: 0, note: 4 };
  function auInit() {
    if (!AU.on) return;
    if (!AU.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        AU.ctx = new AC();
        const comp = AU.ctx.createDynamicsCompressor();
        comp.threshold.value = -16; comp.ratio.value = 5;
        AU.out = AU.ctx.createGain(); AU.out.gain.value = 0.9;
        AU.out.connect(comp); comp.connect(AU.ctx.destination);
        AU.mus = AU.ctx.createGain(); AU.mus.gain.value = 0.55; AU.mus.connect(AU.out);
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
  function tone(type, f0, f1, dur, vol, delay = 0, dest) {
    const c = AU.ctx, t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.01, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || AU.out);
    o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(dur, vol, type = 'bandpass', f0 = 1000, f1 = null, q = 1, delay = 0) {
    const c = AU.ctx, t = c.currentTime + delay;
    const s = c.createBufferSource(); s.buffer = AU.noise;
    const f = c.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.012, dur * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(AU.out);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
  }
  // 拨弦：仿古筝
  function pluck(f, dur = 1.1, vol = 0.1, delay = 0, dest) {
    const c = AU.ctx, t = c.currentTime + delay;
    const o1 = c.createOscillator(), o2 = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain(), g2 = c.createGain();
    o1.type = 'sawtooth'; o2.type = 'triangle';
    o1.frequency.setValueAtTime(f * 1.015, t); o1.frequency.exponentialRampToValueAtTime(f, t + 0.07);
    o2.frequency.setValueAtTime(f * 2.003, t);
    lp.type = 'lowpass'; lp.Q.value = 2;
    lp.frequency.setValueAtTime(Math.min(12000, f * 9), t); lp.frequency.exponentialRampToValueAtTime(f * 1.4, t + dur * 0.7);
    g2.gain.value = 0.3;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o1.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(dest || AU.out);
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function drum(f = 80, vol = 0.4, delay = 0, dest) {
    tone('sine', f * 1.9, f * 0.6, 0.38, vol, delay, dest);
    tone('triangle', f * 3, f, 0.06, vol * 0.3, delay, dest);
  }
  function gong(f = 98, dur = 2.6, vol = 0.22, delay = 0) {
    const c = AU.ctx, t = c.currentTime + delay;
    [[1, 1], [1.47, 0.6], [2.09, 0.45], [2.76, 0.3], [3.4, 0.18]].forEach(([m, a]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f * m * 1.02, t); o.frequency.exponentialRampToValueAtTime(f * m, t + 0.4);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * a, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur * (1.1 - m * 0.12));
      o.connect(g); g.connect(AU.out); o.start(t); o.stop(t + dur + 0.1);
    });
    noise(0.25, vol * 0.5, 'bandpass', 3000, 800, 0.8, delay);
  }
  const PENTA = [146.83, 164.81, 185, 220, 246.94, 293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25, 739.99, 880];
  const sfx = {
    bow(gold) { if (!live() || !gate(gold ? 'bowg' : 'bow', gold ? 0.05 : 0.07)) return; noise(0.07, gold ? 0.06 : 0.08, 'highpass', 2500, null, 0.7); tone('triangle', gold ? 620 : 330, gold ? 300 : 170, 0.09, 0.07); if (gold) tone('sine', 1900, 2600, 0.05, 0.03); },
    hit() { if (!live() || !gate('hit', 0.04)) return; tone('square', 240, 90, 0.04, 0.03); },
    slash() { if (!live() || !gate('slash', 0.08)) return; noise(0.16, 0.16, 'bandpass', 2600, 500, 2); },
    bigSlash(dragon) { if (!live()) return; noise(0.35, 0.3, 'bandpass', 3200, 300, 1.5); tone('sawtooth', 160, 50, 0.4, 0.14); if (dragon) { gong(147, 1.6, 0.14); noise(0.8, 0.12, 'lowpass', 900, 200, 0.7, 0.1); } },
    roar(big) { if (!live()) return; tone('sawtooth', 150, 55, 0.6, 0.18); tone('square', 110, 45, 0.5, 0.08); noise(0.5, 0.2, 'lowpass', 700, 150, 0.8); if (big) drum(55, 0.5); },
    gallop() { if (!live()) return; for (let i = 0; i < 6; i++) { drum(140 + (i % 2) * 30, 0.12, i * 0.09); noise(0.04, 0.06, 'highpass', 3000, null, 1, i * 0.09); } tone('sine', 600, 900, 0.25, 0.05, 0.5); },
    fireball() { if (!live() || !gate('fb', 0.1)) return; noise(0.5, 0.1, 'lowpass', 300, 1500, 0.7); },
    boom() { if (!live() || !gate('boom', 0.06)) return; tone('sine', 130, 38, 0.45, 0.28); noise(0.35, 0.22, 'lowpass', 1400, 120, 0.6); },
    stone() { if (!live() || !gate('stone', 0.08)) return; tone('sine', 110, 45, 0.22, 0.2); noise(0.12, 0.1, 'lowpass', 800, 200, 0.7); },
    poison() { if (!live() || !gate('poi', 0.12)) return; tone('sine', 220, 520, 0.08, 0.06); tone('sine', 340, 180, 0.1, 0.05, 0.06); },
    needle() { if (!live() || !gate('nee', 0.07)) return; tone('sawtooth', 1600, 500, 0.04, 0.03); },
    spear() { if (!live() || !gate('spr', 0.1)) return; noise(0.12, 0.1, 'bandpass', 1800, 700, 3); },
    dot() { if (!live() || !gate('dot', 0.1)) return; tone('sine', 520, 260, 0.06, 0.04); },
    coin() { if (!live() || !gate('coin', 0.045)) return; const f = rnd(1900, 2300); tone('sine', f, f, 0.12, 0.035); tone('sine', f * 1.5, f * 1.5, 0.08, 0.02, 0.03); },
    pick() { if (!live()) return; noise(0.06, 0.07, 'highpass', 2200, null, 0.7); },
    place() { if (!live()) return; tone('sine', 920, 680, 0.05, 0.12); tone('triangle', 1500, 1300, 0.025, 0.05); },
    deny() { if (!live()) return; tone('square', 200, 150, 0.12, 0.05); },
    merge(s) { if (!live()) return; const base = 5 + Math.min(4, s - 1); for (let i = 0; i < 3 + Math.min(3, s); i++) pluck(PENTA[Math.min(PENTA.length - 1, base + i)], 0.7, 0.08, i * 0.055); },
    hero() { if (!live()) return; gong(110, 2.4, 0.2); [5, 7, 8, 10, 11, 13].forEach((n, i) => pluck(PENTA[n], 1, 0.09, 0.08 + i * 0.06)); drum(70, 0.4); },
    awake() { if (!live()) return; gong(82, 3, 0.26); [3, 5, 6, 8, 10, 11, 12, 13].forEach((n, i) => pluck(PENTA[n], 1.2, 0.09, i * 0.05)); },
    die(boss) { if (!live() || !gate(boss ? 'dieb' : 'die', boss ? 0.2 : 0.05)) return; noise(boss ? 0.6 : 0.09, boss ? 0.3 : 0.07, 'lowpass', boss ? 900 : 1800, boss ? 100 : 300, 0.8); tone('sine', boss ? 160 : 210, boss ? 35 : 70, boss ? 0.6 : 0.1, boss ? 0.25 : 0.05); },
    base() { if (!live() || !gate('base', 0.15)) return; drum(48, 0.6); noise(0.3, 0.2, 'lowpass', 600, 100, 0.8); },
    wave(boss) { if (!live()) return; for (let i = 0; i < 3; i++) drum(i === 2 ? 60 : 75, 0.4, i * 0.2); if (boss) gong(73, 3, 0.26, 0.6); },
    clear() { if (!live()) return; [5, 7, 8, 10].forEach((n, i) => pluck(PENTA[n], 0.9, 0.08, i * 0.08)); },
    heal() { if (!live() || !gate('heal', 0.4)) return; tone('sine', 660, 990, 0.25, 0.04); },
    order() { if (!live()) return; drum(90, 0.3); drum(90, 0.3, 0.14); },
    inkThrow() { if (!live()) return; noise(0.3, 0.1, 'lowpass', 500, 1500, 0.8); },
    inkLand() { if (!live()) return; noise(0.15, 0.18, 'lowpass', 900, 200, 0.8); tone('sine', 140, 60, 0.15, 0.12); },
    clean() { if (!live()) return; noise(0.18, 0.12, 'highpass', 1200, 4000, 0.7); [8, 10, 12].forEach((n, i) => pluck(PENTA[n], 0.4, 0.06, i * 0.04)); },
    brush(v) { if (!live() || !gate('brush', 0.05)) return; noise(0.09, clamp(v / 2400, 0.02, 0.12), 'bandpass', 1200 + v, null, 0.9); },
    ultReady() { if (!live()) return; [8, 10, 12, 13].forEach((n, i) => pluck(PENTA[n], 0.6, 0.06, i * 0.07)); },
    ultGo() { if (!live()) return; noise(0.3, 0.12, 'highpass', 1500, 5000, 0.7); },
    ultHit() { if (!live()) return; drum(45, 0.7); gong(65, 2.4, 0.22, 0.05); noise(0.7, 0.3, 'lowpass', 2500, 120, 0.6); },
    win() { if (!live()) return; gong(98, 3.5, 0.24); [5, 6, 7, 8, 10, 11, 12, 13].forEach((n, i) => pluck(PENTA[n], 1.3, 0.09, 0.2 + i * 0.12)); },
    lose() { if (!live()) return; [10, 8, 7, 5, 3, 0].forEach((n, i) => pluck(PENTA[n], 1.2, 0.09, i * 0.2)); gong(55, 3, 0.2, 0.2); },
  };
  // 背景乐：五声音阶的古筝随手拨，打仗时加鼓
  function music() {
    if (!live() || mode !== 'play') return;
    const c = AU.ctx, now = c.currentTime;
    if (AU.beat < now) AU.beat = now + 0.05;
    const boss = enemies.some((e) => e.boss);
    const tempo = boss ? 0.28 : 0.33;
    while (AU.beat < now + 0.12) {
      const d = AU.beat - now, st = AU.step % 16;
      if (st % 8 === 0) pluck(PENTA[st === 0 ? 0 : 3], 1.8, 0.07, d, AU.mus);
      if (Math.random() < (st % 2 === 0 ? 0.55 : 0.25)) {
        AU.note = clamp(AU.note + pick([-2, -1, -1, 1, 1, 2, 0]), 4, 12);
        pluck(PENTA[AU.note], 0.9, 0.045, d, AU.mus);
      }
      if (S.waveState === 'spawn' || S.waveState === 'clear') {
        if (st % 4 === 0) drum(st % 8 === 0 ? 62 : 72, boss ? 0.16 : 0.1, d, AU.mus);
        if (boss && st % 2 === 1) drum(95, 0.05, d, AU.mus);
      }
      AU.beat += tempo; AU.step++;
    }
  }

  /* ================= 画布 ================= */
  const wrap = $('wrap'), cv = $('cv'), ctx = cv.getContext('2d', { alpha: false });
  let K = 1;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  let BG = null, TRAY = null, STAIN = null, SG = null, BAND = null;
  const tileCache = new Map(), foeCache = new Map();
  function fit() {
    const s = Math.min(window.innerWidth / VW, window.innerHeight / VH);
    wrap.style.transform = `scale(${s})`;
    const dpr = window.devicePixelRatio || 1;
    const nk = Math.min(3, Math.max(1, s * dpr));
    if (BG && Math.abs(nk - K) < 0.01) return;
    K = nk;
    cv.width = Math.round(VW * K); cv.height = Math.round(VH * K);
    tileCache.clear(); foeCache.clear();
    buildBG(); buildTray(); buildBand();
    const old = STAIN;
    STAIN = mk(VW * K, FIELD_H * K); SG = STAIN.getContext('2d');
    if (old) SG.drawImage(old, 0, 0, STAIN.width, STAIN.height);
  }
  function rr(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // 远山：一层层淡墨
  function mountains(g, R, y0, amp, col, n, seed) {
    const r = mulberry(seed);
    g.beginPath(); g.moveTo(-10, y0 + 60);
    let x = -10, y = y0;
    const pts = [];
    while (x < VW + 20) { pts.push([x, y]); x += 18 + r() * 26; y = y0 - r() * amp * (0.4 + 0.6 * Math.abs(Math.sin(x * 0.012 * n + seed))); }
    pts.push([VW + 20, y0]);
    g.lineTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) { const p = pts[i - 1], q = pts[i]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    g.lineTo(VW + 20, y0 + 60); g.closePath();
    const gr = g.createLinearGradient(0, y0 - amp, 0, y0 + 50);
    gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(60,64,58,0)');
    g.fillStyle = gr; g.fill();
  }
  function bamboo(g, x, y, s, a = 0.3) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.strokeStyle = `rgba(40,58,42,${a})`; g.fillStyle = `rgba(40,58,42,${a * 0.9})`; g.lineCap = 'round';
    g.lineWidth = 3.2;
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(0, 50 - k * 24); g.lineTo(0.6, 28 - k * 24); g.stroke(); }
    const lf = [[0, 4, -0.7], [0, 4, 0.5], [0, -20, -1], [0, -20, 0.3], [0, -44, -0.5], [0, -44, 0.9]];
    for (const [lx, ly, la] of lf) { g.save(); g.translate(lx, ly); g.rotate(la); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(12, -5, 26, 0); g.quadraticCurveTo(12, 4, 0, 0); g.fill(); g.restore(); }
    g.restore();
  }
  function tracePath(g) { g.beginPath(); g.moveTo(PATH[0][0], PATH[0][1]); for (let i = 1; i < PATH.length; i++) g.lineTo(PATH[i][0], PATH[i][1]); }
  function buildBG() {
    BG = mk(VW * K, FIELD_H * K);
    const g = BG.getContext('2d'); g.scale(K, K);
    const r = mulberry(1707);
    // 宣纸底
    let gr = g.createLinearGradient(0, 0, 0, FIELD_H);
    gr.addColorStop(0, '#e4dcc6'); gr.addColorStop(0.5, '#ece4cf'); gr.addColorStop(1, '#e2d8bf');
    g.fillStyle = gr; g.fillRect(0, 0, VW, FIELD_H);
    mountains(g, r, 70, 46, 'rgba(92,100,92,.55)', 1.3, 3);
    mountains(g, r, 88, 30, 'rgba(60,66,60,.55)', 2.1, 7);
    for (let i = 0; i < 22; i++) {
      const x = r() * VW, y = 60 + r() * (FIELD_H - 60), R = 30 + r() * 80;
      const w = g.createRadialGradient(x, y, 2, x, y, R);
      w.addColorStop(0, r() > 0.5 ? 'rgba(120,138,118,.13)' : 'rgba(255,250,236,.22)'); w.addColorStop(1, 'rgba(120,138,118,0)');
      g.fillStyle = w; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill();
    }
    g.strokeStyle = 'rgba(70,60,45,.05)'; g.lineWidth = 0.7;
    for (let i = 0; i < 340; i++) { const x = r() * VW, y = r() * FIELD_H, l = 4 + r() * 15, a = r() * TAU; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    // 草点
    for (let i = 0; i < 46; i++) {
      const x = 8 + r() * (VW - 16), y = 130 + r() * (FIELD_H - 140);
      if (x > BX - 16 && x < BX + BW + 16 && y > BY - 16 && y < BY + BH + 16) continue;
      g.strokeStyle = 'rgba(52,70,50,.3)'; g.lineWidth = 1.3; g.lineCap = 'round';
      for (let b = -1; b <= 1; b++) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + b * 4, y - 6, x + b * 7, y - 7 - r() * 5); g.stroke(); }
    }
    bamboo(g, 24, 300, 1.15, 0.32); bamboo(g, 46, 380, 0.8, 0.26); bamboo(g, 432, 40, 0.7, 0.22); bamboo(g, 438, 520, 0.9, 0.2);
    // 山道
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    tracePath(g); g.strokeStyle = 'rgba(35,30,24,.16)'; g.lineWidth = RW + 18; g.stroke();
    tracePath(g); g.strokeStyle = '#2b261f'; g.lineWidth = RW + 6; g.stroke();
    tracePath(g); g.strokeStyle = '#ddcca6'; g.lineWidth = RW; g.stroke();
    tracePath(g); g.strokeStyle = 'rgba(250,243,224,.45)'; g.lineWidth = RW - 16; g.stroke();
    g.restore();
    // 铺路石与干笔触
    for (let d = 0; d < PLEN; d += 13) {
      const [x, y, a] = onPath(d), nx = -Math.sin(a), ny = Math.cos(a);
      const o = (r() - 0.5) * (RW - 16);
      g.fillStyle = `rgba(120,98,66,${0.08 + r() * 0.1})`;
      g.beginPath(); g.ellipse(x + nx * o, y + ny * o, 3 + r() * 5, 2 + r() * 3, a + r(), 0, TAU); g.fill();
      for (const side of [-1, 1]) {
        if (r() < 0.55) continue;
        const ex = x + nx * side * (RW / 2 + 1), ey = y + ny * side * (RW / 2 + 1);
        g.strokeStyle = `rgba(30,26,20,${0.2 + r() * 0.3})`; g.lineWidth = 1 + r() * 2.2;
        g.beginPath(); g.moveTo(ex - Math.cos(a) * 6, ey - Math.sin(a) * 6); g.lineTo(ex + Math.cos(a) * (4 + r() * 8) + nx * side * r() * 3, ey + Math.sin(a) * (4 + r() * 8) + ny * side * r() * 3); g.stroke();
      }
    }
    // 棋盘：木框 + 米字格
    g.save();
    rr(g, BX - 11, BY - 11, BW + 22, BH + 22, 9); g.fillStyle = 'rgba(30,20,12,.3)'; g.fill();
    rr(g, BX - 12, BY - 13, BW + 24, BH + 24, 9);
    gr = g.createLinearGradient(0, BY - 12, 0, BY + BH + 12); gr.addColorStop(0, '#6b4628'); gr.addColorStop(0.5, '#583820'); gr.addColorStop(1, '#3f2714');
    g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(255,220,170,.25)'; g.lineWidth = 1; rr(g, BX - 8, BY - 9, BW + 16, BH + 16, 6); g.stroke();
    for (let rr2 = 0; rr2 < ROWS; rr2++) for (let c = 0; c < COLS; c++) {
      const x = BX + c * (CS + GAP), y = BY + rr2 * (CS + GAP);
      g.fillStyle = '#efe5cd'; rr(g, x, y, CS, CS, 4); g.fill();
      g.strokeStyle = 'rgba(179,38,30,.55)'; g.lineWidth = 1.2; rr(g, x + 3, y + 3, CS - 6, CS - 6, 2); g.stroke();
      g.setLineDash([3, 3]); g.strokeStyle = 'rgba(179,38,30,.28)'; g.lineWidth = 0.9;
      g.beginPath(); g.moveTo(x + CS / 2, y + 4); g.lineTo(x + CS / 2, y + CS - 4); g.moveTo(x + 4, y + CS / 2); g.lineTo(x + CS - 4, y + CS / 2);
      g.moveTo(x + 5, y + 5); g.lineTo(x + CS - 5, y + CS - 5); g.moveTo(x + CS - 5, y + 5); g.lineTo(x + 5, y + CS - 5); g.stroke(); g.setLineDash([]);
    }
    g.restore();
    // 大营
    drawCamp(g);
    // 敌军出口：墨雾山门
    g.save();
    const mg = g.createRadialGradient(0, 104, 4, 0, 104, 60); mg.addColorStop(0, 'rgba(20,18,15,.85)'); mg.addColorStop(1, 'rgba(20,18,15,0)');
    g.fillStyle = mg; g.beginPath(); g.arc(0, 104, 60, 0, TAU); g.fill();
    g.restore();
  }
  function drawCamp(g) {
    const x = BASE.x, y = BASE.y;
    g.save(); g.translate(x, y);
    g.fillStyle = 'rgba(30,20,10,.25)'; g.beginPath(); g.ellipse(2, 40, 44, 9, 0, 0, TAU); g.fill();
    // 台基
    g.fillStyle = '#8c8170'; rr(g, -38, 24, 76, 16, 3); g.fill(); g.strokeStyle = '#2b261f'; g.lineWidth = 1.6; g.stroke();
    g.strokeStyle = 'rgba(40,30,20,.35)'; g.lineWidth = 1; for (let i = -30; i < 36; i += 12) { g.beginPath(); g.moveTo(i, 25); g.lineTo(i, 39); g.stroke(); }
    // 柱子
    g.fillStyle = '#a5281f';
    for (const px of [-28, -10, 10, 28]) { g.fillRect(px - 3, -10, 6, 35); }
    g.strokeStyle = '#2b1a12'; g.lineWidth = 1; for (const px of [-28, -10, 10, 28]) g.strokeRect(px - 3, -10, 6, 35);
    // 门匾
    g.fillStyle = '#1f1a14'; rr(g, -14, -6, 28, 22, 2); g.fill(); g.strokeStyle = '#d9a21b'; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = '#f2d27a'; g.font = `900 17px ${KAI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('营', 0, 5.5);
    // 飞檐屋顶
    g.fillStyle = '#26221d';
    g.beginPath(); g.moveTo(-50, -10); g.quadraticCurveTo(-36, -14, -30, -24); g.lineTo(30, -24); g.quadraticCurveTo(36, -14, 50, -10); g.quadraticCurveTo(0, -16, -50, -10); g.fill();
    g.beginPath(); g.moveTo(-40, -22); g.quadraticCurveTo(-26, -26, -20, -38); g.lineTo(20, -38); g.quadraticCurveTo(26, -26, 40, -22); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,240,210,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-28, -25); g.lineTo(28, -25); g.stroke();
    g.fillStyle = '#d9a21b'; g.beginPath(); g.arc(0, -40, 3, 0, TAU); g.fill();
    g.restore();
  }
  function buildTray() {
    TRAY = mk(VW * K, (VH - FIELD_H) * K);
    const g = TRAY.getContext('2d'); g.scale(K, K); g.translate(0, -FIELD_H);
    let gr = g.createLinearGradient(0, FIELD_H, 0, VH);
    gr.addColorStop(0, '#4a3220'); gr.addColorStop(0.25, '#3a2616'); gr.addColorStop(1, '#24170c');
    g.fillStyle = gr; g.fillRect(0, FIELD_H, VW, VH - FIELD_H);
    const r = mulberry(99);
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1;
    for (let i = 0; i < 26; i++) { const y = FIELD_H + 16 + r() * 270; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= VW; x += 30) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 2.5); g.stroke(); }
    // 卷轴上沿
    gr = g.createLinearGradient(0, FIELD_H - 2, 0, FIELD_H + 16);
    gr.addColorStop(0, '#2a1a0e'); gr.addColorStop(0.35, '#a57a4b'); gr.addColorStop(0.6, '#6e4b2a'); gr.addColorStop(1, '#2a1a0e');
    g.fillStyle = gr; g.fillRect(0, FIELD_H - 2, VW, 18);
    // 手牌纸托
    rr(g, 6, 538, VW - 12, 122, 8); g.fillStyle = 'rgba(242,232,208,.94)'; g.fill();
    g.strokeStyle = '#1f150b'; g.lineWidth = 2; g.stroke();
    g.strokeStyle = 'rgba(179,38,30,.35)'; g.lineWidth = 1; rr(g, 10, 542, VW - 20, 114, 6); g.stroke();
    for (let i = 0; i < HAND_N; i++) {
      const x = HX + i * (CW + CGAP);
      g.setLineDash([4, 4]); g.strokeStyle = 'rgba(60,40,20,.3)'; g.lineWidth = 1.2; rr(g, x, HY, CW, CH, 6); g.stroke(); g.setLineDash([]);
    }
    g.fillStyle = 'rgba(244,234,210,.55)'; g.font = `12px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('横排从左往右、竖排从上往下拼出人名，武将上阵', VW / 2, 528);
    g.fillStyle = 'rgba(244,234,210,.4)'; g.font = `11px ${SANS}`;
    g.fillText('拖字上盘 · 同字相叠升星 · 点盘上的字看射程', VW / 2, 774);
  }
  function buildBand() {
    BAND = mk(VW * K, 110 * K);
    const g = BAND.getContext('2d'); g.scale(K, K);
    const r = mulberry(5);
    g.fillStyle = 'rgba(22,19,15,.88)';
    g.beginPath(); g.moveTo(0, 20);
    for (let x = 0; x <= VW; x += 10) g.lineTo(x, 18 + r() * 8 + Math.sin(x * 0.05) * 3);
    for (let x = VW; x >= 0; x -= 10) g.lineTo(x, 92 - r() * 8 + Math.sin(x * 0.04) * 3);
    g.closePath(); g.fill();
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.5})`; g.fillRect(r() * VW, 18 + r() * 74, 3 + r() * 30, 0.6 + r() * 1.4); }
    g.globalCompositeOperation = 'source-over';
  }

  /* ================= 游戏状态 ================= */
  let mode = 'title';
  let S = null;
  let units = [], board = [], hand = [], enemies = [], shots = [], pools = [], slashes = [], rings = [], riders = [], meteors = [], parts = [], floats = [], banners = [], coinsFly = [], strokes = [], links = [];
  let drag = null, brush = null, info = null;
  let nextId = 1;

  function newRun() {
    S = {
      t: 0, wave: 0, waveState: 'inter', interT: 12, queue: [], spawnT: 0, coins: 20, recruits: 0, hp: 15, maxHp: 15, kills: 0, dmg: 0,
      ult: 0, speed: 1, auto: false, formed: 0, formedAny: false, awakened: 0, won: false, shake: 0, stop: 0, flash: 0, slow: 1,
      aiT: 0, stainT: 0, baseFlash: 0, recPress: 0, unlocked: 1, cleared: 0, petalT: 0, ultReadyShown: false, score: 0, maxHero: 0,
    };
    units = []; enemies = []; shots = []; pools = []; slashes = []; rings = []; riders = []; meteors = []; parts = []; floats = []; banners = []; coinsFly = []; strokes = []; links = [];
    drag = null; brush = null; info = null; nextId = 1;
    const u = mkUnit('huang', 1, 0); u.pop = 1; units.push(u);
    sync();
    hand = ['zhong', 'gong', 'dao', 'du', 'gong'].map((t, i) => ({ type: t, a: 1, delay: i * 0.06 }));
    if (SG) SG.clearRect(0, 0, STAIN.width, STAIN.height);
  }
  function mkUnit(type, r, c, stars = 1, dir = 'h') {
    return { id: nextId++, type, r, c, span: HERO[type] ? 2 : 1, dir, stars, cd: 0.3, aim: -Math.PI / 2, recoil: 0, pop: 1.3, haste: 1, amp: 1, inked: 0, pulse: 0, cnt: 0, sweat: 0 };
  }

  /* ================= 棋盘工具 ================= */
  function cellXY(r, c) { return [BX + c * (CS + GAP), BY + r * (CS + GAP)]; }
  function uRect(u) {
    const [x, y] = cellXY(u.r, u.c);
    return { x, y, w: u.span === 2 && u.dir === 'h' ? CS * 2 + GAP : CS, h: u.span === 2 && u.dir === 'v' ? CS * 2 + GAP : CS };
  }
  function uCenter(u) { const R = uRect(u); return [R.x + R.w / 2, R.y + R.h / 2]; }
  function cellsOf(u) { if (u.span === 1) return [[u.r, u.c]]; return u.dir === 'h' ? [[u.r, u.c], [u.r, u.c + 1]] : [[u.r, u.c], [u.r + 1, u.c]]; }
  function inB(r, c) { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }
  function at(r, c) { return inB(r, c) ? board[r][c] : undefined; }
  function sync() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    for (const u of units) for (const [r, c] of cellsOf(u)) if (inB(r, c)) board[r][c] = u;
    buffs();
  }
  function neighborsOf(u) {
    const set = new Set();
    for (const [r, c] of cellsOf(u)) for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = at(r + dr, c + dc); if (n && n !== u) set.add(n); }
    return [...set];
  }
  function buffs() {
    links = [];
    for (const u of units) { u.haste = 1; u.amp = 1; }
    for (const s of units) {
      const d = DEF[s.type]; if (!d || !d.buff) continue;
      const v = 0.25 + (s.stars - 1) * 0.1;
      for (const n of neighborsOf(s)) {
        const nd = DEF[n.type]; if (nd && nd.buff) continue;
        if (d.buff === 'haste') n.haste += v; else n.amp += v;
        links.push([s, n, d.buff]);
      }
    }
  }
  function cellAt(x, y) {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const [cx, cy] = cellXY(r, c);
      if (x >= cx - GAP / 2 && x <= cx + CS + GAP / 2 && y >= cy - GAP / 2 && y <= cy + CS + GAP / 2) return [r, c];
    }
    return null;
  }
  const inRect = (x, y, R) => x >= R.x && x <= R.x + R.w && y >= R.y && y <= R.y + R.h;
  function freeCells() { let n = 0; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!board[r][c]) n++; return n; }

  /* ================= 抽牌 ================= */
  function unlockedHeroes() { return HEROES.filter((h, i) => i < S.unlocked); }
  function drawType() {
    const W = [];
    for (const t of BASE_TYPES) W.push([t, t === 'yi' || t === 'gu' ? 0.7 : 1]);
    const heroes = unlockedHeroes();
    heroes.forEach((h, i) => {
      const formed = units.find((u) => u.type === h.id);
      const hasA = units.some((u) => u.type === h.a) || hand.some((c) => c && c.type === h.a);
      const hasB = units.some((u) => u.type === h.b) || hand.some((c) => c && c.type === h.b);
      const fresh = i === heroes.length - 1 ? 1.4 : 1;
      let wa = 0.9 * fresh, wb = 0.9 * fresh;
      if (formed) { const k = formed.stars >= 5 ? 0.2 : 0.6; wa = wb = k; }
      else { if (hasA && !hasB) wb = 3.2; if (hasB && !hasA) wa = 3.2; }
      W.push([h.a, wa], [h.b, wb]);
    });
    let sum = 0; for (const w of W) sum += w[1];
    let x = Math.random() * sum;
    for (const w of W) { x -= w[1]; if (x <= 0) return w[0]; }
    return 'gong';
  }
  function deal(all) {
    for (let i = 0; i < HAND_N; i++) {
      if (!all && hand[i]) continue;
      hand[i] = null;
    }
    for (let i = 0; i < HAND_N; i++) if (!hand[i]) hand[i] = { type: drawType(), a: 0, delay: i * 0.06 };
  }
  function recruit() {
    if (mode !== 'play' || brush) return;
    const c = cost();
    if (S.coins < c) { toast(`银两不够了（要 ${c} 两）`, '#b3261e'); sfx.deny(); S.shake = Math.max(S.shake, 0.12); return; }
    S.coins -= c; S.recruits++; S.recPress = 1;
    for (let i = 0; i < HAND_N; i++) hand[i] = null;
    deal(true);
    if (live()) for (let i = 0; i < HAND_N; i++) setTimeout(() => sfx.pick(), i * 55);
  }

  /* ================= 拖放：拼名、合成、交换 ================= */
  function comboWith(x, y) {
    const h = HERO_OF[x]; if (!h) return null;
    if (h.a === x && h.b === y) return { h, first: true };
    if (h.b === x && h.a === y) return { h, first: false };
    return null;
  }
  const freeFor = (r, c, src) => inB(r, c) && (!board[r][c] || board[r][c] === src);
  function heroFits(r, c, dir, src) {
    const cells = dir === 'h' ? [[r, c], [r, c + 1]] : [[r, c], [r + 1, c]];
    return cells.every(([a, b]) => freeFor(a, b, src));
  }
  function evalDrop(dg, r, c) {
    const src = dg.unit, type = dg.type;
    const occ = board[r][c];
    const T = occ && occ !== src ? occ : null;
    if (src && src.span === 2) {
      if (T && T.type === src.type && T.stars < 5) return { k: 'merge', t: T, label: '合成升星' };
      let ar = r, ac = c;
      if (src.dir === 'h') ac = Math.min(c, COLS - 2); else ar = Math.min(r, ROWS - 2);
      if (heroFits(ar, ac, src.dir, src)) { if (ar === src.r && ac === src.c) return null; return { k: 'move', r: ar, c: ac, label: '' }; }
      // 换个方向也行
      const nd = src.dir === 'h' ? 'v' : 'h';
      let br = r, bc = c; if (nd === 'h') bc = Math.min(c, COLS - 2); else br = Math.min(r, ROWS - 2);
      if (heroFits(br, bc, nd, src)) return { k: 'move', r: br, c: bc, dir: nd, label: nd === 'h' ? '横放' : '竖放' };
      return null;
    }
    const H = HERO_OF[type];
    if (T) {
      if (T.span === 2 && H && H.id === T.type && T.stars < 5) return { k: 'merge', t: T, label: `${H.name}升星` };
      if (T.span === 1 && T.type === type && T.stars < 5) return { k: 'merge', t: T, label: '合成升星' };
      if (T.span === 1 && H) {
        const p = comboWith(type, T.type);
        if (p) {
          const spots = p.first ? [[T.r, T.c - 1, 'h', T.r, T.c - 1], [T.r - 1, T.c, 'v', T.r - 1, T.c]] : [[T.r, T.c + 1, 'h', T.r, T.c], [T.r + 1, T.c, 'v', T.r, T.c]];
          for (const [sr, sc, dir, ar, ac] of spots) if (freeFor(sr, sc, src)) return { k: 'combo', h: p.h, r: ar, c: ac, dir, partner: T, label: `召唤 ${p.h.name}` };
        }
      }
      if (src && T.span === 1) return { k: 'swap', t: T, label: '交换' };
      return null;
    }
    const cm = comboAt(type, r, c, src);
    if (cm) return { k: 'combo', ...cm, label: `召唤 ${cm.h.name}` };
    return { k: 'place', r, c, label: '' };
  }
  // 把 type 放到 (r,c) 时能不能和邻格拼成名字
  function comboAt(type, r, c, src) {
    const h = HERO_OF[type]; if (!h) return null;
    const ok = (u, t) => u && u !== src && u.span === 1 && u.type === t;
    if (h.a === type) {
      if (ok(at(r, c + 1), h.b)) return { h, r, c, dir: 'h', partner: at(r, c + 1) };
      if (ok(at(r + 1, c), h.b)) return { h, r, c, dir: 'v', partner: at(r + 1, c) };
    } else {
      if (ok(at(r, c - 1), h.a)) return { h, r, c: c - 1, dir: 'h', partner: at(r, c - 1) };
      if (ok(at(r - 1, c), h.a)) return { h, r: r - 1, c, dir: 'v', partner: at(r - 1, c) };
    }
    return null;
  }
  function execDrop(dg, act) {
    if (!act) return false;
    const src = dg.unit;
    const takeSrc = () => { if (dg.from === 'hand') hand[dg.idx] = null; else if (src) units.splice(units.indexOf(src), 1); };
    if (act.k === 'move') { src.r = act.r; src.c = act.c; if (act.dir) src.dir = act.dir; src.pop = 1.12; sync(); sfx.place(); return true; }
    if (act.k === 'merge') { const add = src ? src.stars : 1; takeSrc(); sync(); upgrade(act.t, add); return true; }
    if (act.k === 'combo') {
      const sa = src ? src.stars : 1, sb = act.partner.stars;
      takeSrc(); units.splice(units.indexOf(act.partner), 1);
      formHero(act.h, act.r, act.c, act.dir, Math.min(5, Math.max(2, sa + sb)));
      return true;
    }
    if (act.k === 'swap') {
      const T = act.t, r1 = src.r, c1 = src.c;
      src.r = T.r; src.c = T.c; T.r = r1; T.c = c1; src.pop = T.pop = 1.12;
      sync(); sfx.place(); checkCombo(src); checkCombo(T); return true;
    }
    if (act.k === 'place') {
      if (dg.from === 'hand') { units.push(mkUnit(dg.type, act.r, act.c)); hand[dg.idx] = null; }
      else { src.r = act.r; src.c = act.c; src.pop = 1.15; }
      sync(); sfx.place();
      const [x, y] = cellXY(act.r, act.c); dust(x + CS / 2, y + CS - 6, 6);
      return true;
    }
    return false;
  }
  function checkCombo(u) {
    if (!units.includes(u) || u.span !== 1) return;
    const cm = comboAt(u.type, u.r, u.c, null);
    if (!cm) return;
    units.splice(units.indexOf(u), 1); units.splice(units.indexOf(cm.partner), 1);
    formHero(cm.h, cm.r, cm.c, cm.dir, Math.min(5, Math.max(2, u.stars + cm.partner.stars)));
  }
  function formHero(h, r, c, dir, stars) {
    const u = mkUnit(h.id, r, c, stars, dir); u.pop = 1.45; u.cd = 0.4;
    units.push(u); sync();
    const [x, y] = uCenter(u);
    S.formed++; S.formedAny = true; S.stop = 0.07; S.shake = Math.max(S.shake, 0.5); S.flash = 0.35;
    ring(x, y, 20, 150, '#d9a21b', 6, 0.55); ring(x, y, 10, 95, '#b3261e', 3, 0.45);
    sparks(x, y, 34, '#ffd34d');
    for (let i = 0; i < 14; i++) inkDrop(x + rnd(-40, 40), y + rnd(-20, 20), rnd(60, 160), '#2a2017', 2 + Math.random() * 3);
    banner(h.name, `${h.skill} · 武将上阵`, h.col, true);
    sfx.hero();
    if (stars >= 5) awaken(u);
  }
  function upgrade(u, add) {
    const prev = u.stars;
    u.stars = Math.min(5, u.stars + add);
    u.pop = 1.38; buffs();
    const [x, y] = uCenter(u);
    if (HERO[u.type] && u.stars >= 5 && prev < 5) { awaken(u); return; }
    S.stop = 0.03; S.shake = Math.max(S.shake, 0.22);
    ring(x, y, 12, 80, u.stars >= 4 ? '#d9a21b' : '#2e7d4f', 4, 0.4);
    sparks(x, y, 16, u.stars >= 4 ? '#ffd34d' : '#9be37a');
    float(x, y - 30, '★'.repeat(u.stars), u.stars >= 4 ? '#c98a00' : '#1f6e3c', 18, true);
    sfx.merge(u.stars);
  }
  function awaken(u) {
    const h = HERO[u.type]; const [x, y] = uCenter(u);
    S.awakened++; S.stop = 0.08; S.shake = Math.max(S.shake, 0.7); S.flash = 0.5;
    ring(x, y, 20, 200, '#ffd34d', 7, 0.6); ring(x, y, 10, 130, '#b3261e', 4, 0.5);
    sparks(x, y, 50, '#ffd34d');
    banner(`${h.name} · 满星`, `觉醒「${h.awake}」`, '#d9a21b', true);
    sfx.awake();
  }
  function dismiss(u) {
    const i = units.indexOf(u); if (i < 0) return;
    const v = (HERO[u.type] ? 6 : 3) * u.stars;
    units.splice(i, 1); sync();
    S.coins += v;
    float(BTN_DIS.x + BTN_DIS.w / 2, BTN_DIS.y - 8, `+${v} 两`, '#f2d27a', 16, true);
    sfx.coin();
  }
  function cleanInk(u) {
    u.inked = 0;
    const [x, y] = uCenter(u);
    for (let i = 0; i < 16; i++) inkDrop(x, y, rnd(80, 220), '#1b1814', 2 + Math.random() * 3);
    sparks(x, y, 10, '#fff3c0');
    float(x, y - 24, '擦净', '#1f6e3c', 15, true);
    sfx.clean();
  }

  /* ================= 特效生成 ================= */
  const MAXP = 520;
  function addP(p) { if (parts.length >= MAXP) parts.shift(); parts.push(p); }
  function inkDrop(x, y, spd, col, r) { const a = Math.random() * TAU; addP({ k: 'drop', x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r, life: 0, max: rnd(0.25, 0.55), col }); }
  function smoke(x, y, n, R, col = '#1f1c18') { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = rnd(10, 40); addP({ k: 'smoke', x: x + rnd(-6, 6), y: y + rnd(-6, 6), vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: R * rnd(0.6, 1), grow: R * 2.4, life: 0, max: rnd(0.4, 0.7), col }); } }
  function sparks(x, y, n, col = '#ffd34d') { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = rnd(50, 200); addP({ k: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rnd(1.5, 3.2), life: 0, max: rnd(0.2, 0.45), col }); } }
  function embers(x, y, n) { for (let i = 0; i < n; i++) addP({ k: 'ember', x: x + rnd(-14, 14), y: y + rnd(-8, 8), vx: rnd(-20, 20), vy: rnd(-90, -30), r: rnd(1.5, 3), life: 0, max: rnd(0.4, 0.8), col: Math.random() < 0.5 ? '#ffb347' : '#ff6a2a' }); }
  function dust(x, y, n) { for (let i = 0; i < n; i++) addP({ k: 'smoke', x: x + rnd(-14, 14), y, vx: rnd(-30, 30), vy: rnd(-25, -5), r: rnd(3, 6), grow: 16, life: 0, max: rnd(0.3, 0.5), col: '#8a7a60' }); }
  function chips(x, y, n) { for (let i = 0; i < n; i++) { const a = rnd(-Math.PI, 0), s = rnd(60, 160); addP({ k: 'chip', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rnd(1.5, 3.2), life: 0, max: rnd(0.4, 0.7), col: Math.random() < 0.5 ? '#6b5a42' : '#3b3226', rot: rnd(0, TAU) }); } }
  function ring(x, y, r0, r1, col, w = 4, max = 0.45) { rings.push({ x, y, r0, r1, col, w, life: 0, max }); }
  function float(x, y, text, col = '#1d1a16', size = 14, big = false) { if (floats.length > 70) floats.shift(); floats.push({ x: x + rnd(-6, 6), y, vy: big ? -52 : -36, text, col, size, big, life: 0, max: big ? 0.9 : 0.6 }); }
  function banner(text, sub = '', col = '#f6ecd4', big = false) { banners.length = 0; banners.push({ text, sub, col, big, life: 0, max: big ? 2.1 : 1.7 }); }
  let toastT = 0, toastTxt = '', toastCol = '';
  function toast(t, col = '#1d1a16') { toastTxt = t; toastCol = col; toastT = 1.6; }
  function splat(x, y, R, a = 0.5, col = '20,18,15') {
    if (!SG) return;
    const g = SG; g.save(); g.scale(K, K);
    g.fillStyle = `rgba(${col},${a})`;
    g.beginPath(); g.arc(x, y, R * 0.55, 0, TAU); g.fill();
    const n = 5 + ((R / 4) | 0);
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * TAU, d = R * rnd(0.4, 1.3), rr2 = R * rnd(0.08, 0.3);
      g.beginPath(); g.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d, rr2, 0, TAU); g.fill();
      if (Math.random() < 0.5) { g.lineWidth = rr2 * 0.8; g.strokeStyle = g.fillStyle; g.beginPath(); g.moveTo(x + Math.cos(ang) * R * 0.4, y + Math.sin(ang) * R * 0.4); g.lineTo(x + Math.cos(ang) * d, y + Math.sin(ang) * d); g.stroke(); }
    }
    g.restore();
  }
  function scorch(x, y, R) {
    if (!SG) return;
    const g = SG; g.save(); g.scale(K, K);
    const gr = g.createRadialGradient(x, y, 2, x, y, R);
    gr.addColorStop(0, 'rgba(40,22,12,.45)'); gr.addColorStop(0.7, 'rgba(60,30,14,.2)'); gr.addColorStop(1, 'rgba(60,30,14,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill(); g.restore();
  }

  /* ================= 波次与敌军 ================= */
  function startWave(w) {
    S.wave = w;
    const def = WAVES[w - 1];
    const iv = Math.max(0.3, 0.84 - w * 0.045);
    S.queue = [];
    for (const [kind, n] of def) {
      const k = KIND[kind];
      for (let i = 0; i < n; i++) S.queue.push({ kind, gap: k.boss ? 2.4 : kind === 'jiang' ? iv * 1.8 : kind === 'ma' ? iv * 0.6 : iv });
    }
    S.waveState = 'spawn'; S.spawnT = 0.6;
    const boss = def.some(([k]) => KIND[k].boss);
    banner(`第${NUM[w]}波`, boss ? (w === TOTAL ? '墨魔亲征 · 当心泼墨' : '敌帅出阵 · 号令小兵') : pick(['严阵以待', '来势汹汹', '守住山道', '敌军压境']), boss ? '#ff7a5a' : '#f6ecd4');
    // 新武将解锁
    const nu = HEROES.filter((h) => h.wave <= w).length;
    if (nu > S.unlocked) {
      S.unlocked = nu; const h = HEROES[nu - 1];
      banner(`新名 · ${h.name}`, `「${h.ca}」「${h.cb}」开始出现 · ${h.skill}`, '#f6d77a', true);
      let slot = hand.findIndex((c) => !c);
      if (slot < 0) slot = hand.findIndex((c) => c && BASE_TYPES.includes(c.type));
      if (slot >= 0) hand[slot] = { type: h.a, a: 0, delay: 0.2 };
    }
    let n = 0;
    for (let i = 0; i < HAND_N && n < 2; i++) if (!hand[i]) { hand[i] = { type: drawType(), a: 0, delay: n * 0.06 }; n++; }
    if (n) float(VW / 2, HY - 12, `补兵 +${n}`, '#f2d27a', 15, true);
    sfx.wave(boss);
  }
  function earlyBonus() { return Math.ceil(S.interT) * 2; }
  function callEarly() {
    if (S.waveState !== 'inter') return;
    const b = S.wave > 0 ? earlyBonus() : 0;
    if (b) { S.coins += b; float(BTN_EARLY.x + BTN_EARLY.w / 2, BTN_EARLY.y + 46, `+${b} 两`, '#8f1a12', 15, true); sfx.coin(); }
    startWave(S.wave + 1);
  }
  function spawnFoe(kind, dist = 0) {
    const k = KIND[kind], hp = k.hp * HPW(Math.max(1, S.wave));
    const [x, y, a] = onPath(dist);
    const e = { kind, k, hp, max: hp, spd: k.spd * (1 + (Math.max(1, S.wave) - 1) * 0.022), r: k.r, dist, x, y, a, face: 1, flash: 0, squash: 0, slowT: 0, slowF: 1, stun: 0,
      burnT: 0, burnD: 0, burnTk: 0, bob: rnd(0, TAU), healT: rnd(2, 3.5), skillT: 4.5, dead: false, boss: k.boss || 0, armor: k.armor || 0, enr: false };
    enemies.push(e); return e;
  }
  function target(x, y, R) {
    let b = null, bd = -1; const r2 = R * R;
    for (const e of enemies) {
      if (e.dead || e.x < -4) continue;
      const dx = e.x - x, dy = e.y - y;
      if (dx * dx + dy * dy <= r2 && e.dist > bd) { bd = e.dist; b = e; }
    }
    return b;
  }
  function hurt(e, amt, o = {}) {
    if (e.dead) return;
    if (e.armor && !o.pierce && !o.crit) { amt *= 0.45; if (!o.quiet && Math.random() < 0.3) sparks(e.x + rnd(-6, 6), e.y - 4, 2, '#f0f0f0'); }
    if (e.stun > 0) amt *= 1.3;
    e.hp -= amt; S.dmg += amt;
    e.flash = 0.08; e.squash = 0.22;
    if (!o.quiet && !window.__sim) {
      if (o.crit) float(e.x, e.y - e.r - 8, `${Math.round(amt)}!`, '#c0341d', 17, true);
      else if (o.big || Math.random() < 0.16) float(e.x, e.y - e.r - 4, `${Math.round(amt)}`, o.gold ? '#a86f00' : '#3a3024', o.big ? 15 : 12);
    }
    if (e.hp <= 0) kill(e);
  }
  function kill(e) {
    e.dead = true; S.kills++;
    const big = e.boss ? 2 : e.kind === 'jiang' ? 1 : 0;
    if (!window.__sim) {
      splat(e.x, e.y, e.r * (big === 2 ? 2.4 : big ? 1.8 : 1.4), big ? 0.6 : 0.42);
      smoke(e.x, e.y, big === 2 ? 10 : big ? 5 : 3, e.r * 0.8);
      for (let i = 0; i < (big === 2 ? 40 : big ? 18 : 9); i++) inkDrop(e.x, e.y, rnd(60, big ? 260 : 170), big && Math.random() < 0.2 ? '#a5281f' : '#1b1814', rnd(1.5, big ? 4.5 : 3.2));
    }
    coinsOut(e.x, e.y, e.k.rw);
    S.ult = Math.min(100, S.ult + (big === 2 ? 30 : big ? 4 : 1.1));
    sfx.die(big === 2);
    if (big === 2) {
      S.shake = Math.max(S.shake, 0.9); S.stop = 0.1; S.flash = 0.5;
      ring(e.x, e.y, 20, 190, '#a5281f', 7, 0.7);
      banner(e.kind === 'mo' ? '墨魔伏诛' : '敌帅授首', '军心大振', '#f6d77a', true);
    } else if (big) { S.shake = Math.max(S.shake, 0.25); ring(e.x, e.y, 8, 60, '#1d1a16', 3, 0.35); }
  }
  function coinsOut(x, y, v) {
    v = Math.floor(v + Math.random());
    if (v <= 0) return;
    const n = Math.min(v, 5), per = Math.floor(v / n); let rem = v - per * n;
    for (let i = 0; i < n; i++) {
      const val = per + (rem-- > 0 ? 1 : 0), a = rnd(-Math.PI * 0.85, -Math.PI * 0.15), s = rnd(60, 130);
      coinsFly.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, val, age: 0, delay: 0.16 + i * 0.05 });
    }
  }
  function bossAI(e, dt) {
    e.skillT -= dt;
    if (e.kind === 'mo' && !e.enr && e.hp < e.max * 0.5) {
      e.enr = true; banner('墨魔狂暴', '脚步加快 · 泼墨更凶', '#ff7a5a', true); S.shake = Math.max(S.shake, 0.5); sfx.roar(true);
      ring(e.x, e.y, 20, 140, '#5a1a5f', 8, 0.6);
    }
    if (e.skillT > 0 || e.x < 10) return;
    if (e.kind === 'shuai') {
      e.skillT = 5;
      for (let i = 0; i < 3; i++) spawnFoe('bing', Math.max(0, e.dist - 24 - i * 20));
      ring(e.x, e.y, 10, 110, '#b3261e', 5, 0.5);
      float(e.x, e.y - 44, '号令！', '#b3261e', 20, true); sfx.order();
    } else {
      e.skillT = e.enr ? 4.2 : 5.4;
      const pool = units.filter((u) => u.inked <= 0);
      for (let i = pool.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
      for (const u of pool.slice(0, e.enr ? 3 : 2)) { const [tx, ty] = uCenter(u); shots.push({ k: 'ink', lob: true, x0: e.x, y0: e.y, tx, ty, x: e.x, y: e.y, t: 0, T: 0.85, h: 90, u }); }
      for (let i = 0; i < 2; i++) spawnFoe('bing', Math.max(0, e.dist - 30 - i * 22));
      float(e.x, e.y - 50, '泼墨！', '#5a1a5f', 20, true); sfx.inkThrow();
    }
  }

  /* ================= 出手 ================= */
  function shoot(k, x, y, a, spd, dmg, tgt, o = {}) {
    shots.push({ k, x: x + Math.cos(a) * 14, y: y + Math.sin(a) * 14, a, spd, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, dmg, tgt,
      crit: o.crit || 0, pierce: o.pierce || 1, hit: null, life: 0, max: o.max || 1.1, gold: o.gold || 0, home: tgt ? (o.home || 6) : 0 });
  }
  function lob(k, x, y, t, T, o) {
    const [tx, ty] = onPath(t.dist + (t.stun > 0 ? 0 : t.spd * t.slowF * T));
    shots.push({ k, lob: true, x0: x, y0: y, tx, ty, x, y, t: 0, T, h: k === 'stone' ? 95 : 55, ...o });
  }
  function cdOf(u) {
    const s = u.stars;
    switch (u.type) {
      case 'hz': return s >= 5 ? 0.18 : s >= 3 ? 0.26 : 0.34;
      case 'gy': return 1.5 - 0.07 * (s - 1);
      case 'zf': return 2.9 - 0.12 * (s - 1);
      case 'zy': return 3.8 - 0.2 * (s - 1);
      case 'km': return 3.2 - 0.12 * (s - 1);
      default: return DEF[u.type].cd / (1 + (s - 1) * 0.12);
    }
  }
  function fire(u) {
    const [x, y] = uCenter(u), s = u.stars, m = starMul(s) * u.amp;
    if (HERO[u.type]) return fireHero(u, x, y, s, m);
    const d = DEF[u.type];
    const t = target(x, y, d.range + (s - 1) * 6); if (!t) return false;
    const ang = Math.atan2(t.y - y, t.x - x); u.aim = ang; u.recoil = 1;
    switch (u.type) {
      case 'gong': {
        const n = s >= 5 ? 3 : s >= 3 ? 2 : 1;
        for (let i = 0; i < n; i++) shoot('arrow', x, y, ang + (n === 1 ? 0 : (i / (n - 1) - 0.5) * 0.2), 540, d.dmg * (1 + (s - 1) * 0.45) * u.amp, t, { crit: 0.1 });
        sfx.bow(false); return true;
      }
      case 'ci': {
        const n = s >= 4 ? 3 : 2;
        for (let i = 0; i < n; i++) shoot('needle', x, y, ang + (i / (n - 1) - 0.5) * 0.14, 680, d.dmg * (1 + (s - 1) * 0.45) * u.amp, t, { crit: 0.35 + 0.05 * (s - 1), max: 0.7 });
        sfx.needle(); return true;
      }
      case 'qi': shoot('spear', x, y, ang, 600, d.dmg * m, null, { pierce: 3 + s, crit: 0.15, max: 0.8 }); sfx.spear(); return true;
      case 'dao': {
        const R = d.range + (s - 1) * 10, dmg = d.dmg * m;
        slashes.push({ x, y, a: ang, R: R * 0.86, half: 0.95, life: 0, max: 0.24, col: '#1d1a16', w: 14 });
        for (const e of enemies) {
          if (e.dead) continue;
          const dx = e.x - x, dy = e.y - y, dd = Math.hypot(dx, dy);
          if (dd > R + e.r) continue;
          let df = Math.abs(Math.atan2(dy, dx) - ang); if (df > Math.PI) df = TAU - df;
          if (df > 1) continue;
          const cr = Math.random() < 0.2;
          hurt(e, cr ? dmg * 1.7 : dmg, { crit: cr, pierce: 1 });
          e.dist = Math.max(0, e.dist - (e.boss ? 1 : e.kind === 'jiang' ? 4 : 10));
        }
        sfx.slash(); return true;
      }
      case 'du': lob('orb', x, y, t, 0.5, { dmg: d.dmg * m, R: 40 + 5 * s, slow: 0.32 + 0.05 * (s - 1) }); sfx.poison(); return true;
      case 'pao': lob('stone', x, y, t, 0.75, { dmg: d.dmg * m, R: 46 + 4 * s }); sfx.spear(); return true;
      default: shoot('dot', x, y, ang, 420, d.dmg * m, t, { max: 0.9 }); sfx.dot(); return true;
    }
  }
  function liveFoes() { return enemies.filter((e) => !e.dead && e.x > -4); }
  function fireHero(u, x, y, s, m) {
    if (u.type === 'hz') {
      const RG = 300 + 8 * s, t = target(x, y, RG); if (!t) return false;
      const ang = Math.atan2(t.y - y, t.x - x); u.aim = ang; u.recoil = s >= 5 ? 0.5 : 0.9;
      const dmg = 22 * m;
      if (s >= 5) {
        const lv = liveFoes().filter((e) => Math.hypot(e.x - x, e.y - y) <= RG).sort((a, b) => b.dist - a.dist).slice(0, 4);
        for (let i = 0; i < 4; i++) { const tg = lv[i % lv.length] || t; shoot('garrow', x, y, Math.atan2(tg.y - y, tg.x - x) + rnd(-0.14, 0.14), 780, dmg, tg, { crit: 0.28, pierce: 2, gold: 1, home: 10, max: 1.2 }); }
        sfx.bow(true);
      } else if (s >= 3) {
        for (const o of [-0.07, 0.07]) shoot('garrow', x, y, ang + o, 640, dmg, t, { crit: 0.2, gold: 1, home: 7 });
        sfx.bow(true);
      } else { shoot('arrow', x, y, ang, 600, dmg, t, { crit: 0.15, home: 7 }); sfx.bow(false); }
      return true;
    }
    if (u.type === 'gy') {
      const R = 150 + 10 * (s - 1);
      if (!enemies.some((e) => !e.dead && Math.hypot(e.x - x, e.y - y) <= R + e.r)) return false;
      u.cnt++;
      const dragon = s >= 5 && u.cnt % 3 === 0, RR = dragon ? R * 1.5 : R, dmg = 52 * m * (dragon ? 2 : 1);
      slashes.push({ x, y, a: u.cnt * 2.1, R: RR * 0.9, half: Math.PI, life: 0, max: dragon ? 0.65 : 0.34, col: '#1f6e4c', w: dragon ? 26 : 18, kind: dragon ? 'dragon' : 'gy' });
      for (const e of enemies) {
        if (e.dead || Math.hypot(e.x - x, e.y - y) > RR + e.r) continue;
        hurt(e, dmg, { pierce: 1, big: 1 });
        e.dist = Math.max(0, e.dist - (e.boss ? 2 : e.kind === 'jiang' ? 6 : 14));
      }
      ring(x, y, 20, RR, '#2e8b5f', dragon ? 7 : 4, dragon ? 0.6 : 0.4);
      if (dragon) float(x, y - 36, '青龙出水', '#1f6e4c', 22, true);
      S.shake = Math.max(S.shake, dragon ? 0.5 : 0.16); u.recoil = 1; sfx.bigSlash(dragon); return true;
    }
    if (u.type === 'zf') {
      const R = 165 + 10 * (s - 1);
      const hits = enemies.filter((e) => !e.dead && Math.hypot(e.x - x, e.y - y) <= R + e.r);
      if (!hits.length) return false;
      const st = 0.7 + 0.12 * (s - 1), dmg = 32 * m;
      for (const e of hits) { e.stun = Math.max(e.stun, e.boss ? st * 0.35 : st); hurt(e, dmg, { pierce: 1 }); }
      ring(x, y, 20, R, '#3a2c68', 9, 0.5); ring(x, y, 10, R * 0.7, '#1d1a16', 5, 0.4); ring(x, y, 6, R * 0.4, '#3a2c68', 4, 0.32);
      float(x, y - 34, s >= 5 ? '喝断长桥！' : '喝！', '#3a2c68', s >= 5 ? 24 : 30, true);
      S.shake = Math.max(S.shake, 0.3); u.recoil = 1; sfx.roar(s >= 5); return true;
    }
    if (u.type === 'zy') {
      const lv = liveFoes(); if (!lv.length) return false;
      let mn = 1e9; for (const e of lv) mn = Math.min(mn, e.dist);
      const n = s >= 5 ? 2 : 1, dmg = 24 * m * (s >= 5 ? 1.25 : 1);
      for (let i = 0; i < n; i++) riders.push({ dist: PLEN + 20 + i * 80, spd: 560, dmg, hit: new Set(), stop: mn - 70, life: 0, fade: 0, gold: s >= 5, x: BASE.x, y: BASE.y, a: 0, trail: [] });
      float(x, y - 30, s >= 5 ? '七进七出！' : '驾！', '#2a5a86', 22, true);
      u.recoil = 1; sfx.gallop(); return true;
    }
    if (u.type === 'km') {
      const lv = liveFoes().sort((a, b) => b.dist - a.dist); if (!lv.length) return false;
      const n = 3 + (s >= 3 ? 1 : 0) + (s >= 5 ? 1 : 0), pts = [];
      for (const e of lv) { const p = onPath(e.dist + e.spd * e.slowF * 0.8); if (pts.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 56)) pts.push(p); if (pts.length >= n) break; }
      while (pts.length < n) { const e = pick(lv); pts.push(onPath(e.dist + rnd(-70, 30))); }
      pts.forEach((p, i) => meteors.push({ tx: p[0] + rnd(-6, 6), ty: p[1] + rnd(-6, 6), sx: p[0] - 150 + rnd(-40, 40), sy: -50, t: -i * 0.12, T: 0.75, dmg: 28 * m, R: 54 + (s >= 5 ? 12 : 0), fire: s >= 5 ? 4.2 : 2.6 }));
      float(x, y - 30, s >= 5 ? '借东风！' : '火！', '#b3331d', 22, true);
      u.recoil = 1; sfx.fireball(); return true;
    }
    return false;
  }
  function land(p) {
    if (p.k === 'orb') {
      pools.push({ k: 'poison', x: p.tx, y: p.ty, R: p.R, life: 0, max: 3, tick: 0.05, dmg: p.dmg * 0.45, slow: p.slow, seed: Math.random() * 10 });
      for (const e of enemies) if (!e.dead && Math.hypot(e.x - p.tx, e.y - p.ty) <= p.R + e.r) hurt(e, p.dmg * 0.7, { pierce: 1 });
      for (let i = 0; i < 10; i++) inkDrop(p.tx, p.ty, rnd(30, 100), Math.random() < 0.5 ? '#2ea44f' : '#195e33', rnd(1.5, 3));
      splat(p.tx, p.ty, p.R * 0.45, 0.1, '30,100,50');
    } else if (p.k === 'stone') {
      for (const e of enemies) { if (e.dead) continue; const d = Math.hypot(e.x - p.tx, e.y - p.ty); if (d <= p.R + e.r) hurt(e, p.dmg * (1 - 0.45 * clamp(d / p.R, 0, 1))); }
      ring(p.tx, p.ty, 6, p.R, '#6b5a42', 4, 0.35); chips(p.tx, p.ty, 10); dust(p.tx, p.ty, 6);
      splat(p.tx, p.ty, 9, 0.25, '60,50,36');
      S.shake = Math.max(S.shake, 0.1); sfx.stone();
    } else if (p.k === 'ink') {
      if (units.includes(p.u)) {
        p.u.inked = 6; p.u.pop = 1.2;
        for (let i = 0; i < 14; i++) inkDrop(p.tx, p.ty, rnd(60, 180), '#1b1814', rnd(2, 4));
        float(p.tx, p.ty - 30, '被泼墨 · 点它擦掉', '#5a1a5f', 13, true);
        sfx.inkLand();
      }
    }
  }

  /* ================= 挥毫（大招） ================= */
  function startBrush() {
    if (mode !== 'play' || brush || S.ult < 100) return false;
    brush = { pts: [], len: 0, down: false, real: 0, t0: 0 }; drag = null; info = null;
    sfx.ultGo(); return true;
  }
  function brushAdd(x, y) {
    y = Math.min(y, FIELD_H - 6);
    const P = brush.pts, l = P[P.length - 1];
    if (!l) { P.push({ x, y, w: 14 }); return; }
    const d = Math.hypot(x - l.x, y - l.y); if (d < 5) return;
    brush.len += d;
    P.push({ x, y, w: clamp(30 - d * 0.35, 11, 30) });
    sfx.brush(d * 40);
    if (brush.len > 1150) releaseBrush();
  }
  function autoPts() {
    const lv = liveFoes().sort((a, b) => a.dist - b.dist); if (!lv.length) return [];
    let best = 0, bi = 0, j = 0;
    for (let i = 0; i < lv.length; i++) { while (lv[i].dist - lv[j].dist > 520) j++; if (i - j + 1 > best) { best = i - j + 1; bi = i; } }
    const d1 = lv[bi].dist + 30, d0 = Math.max(0, lv[bi].dist - 540);
    const pts = [];
    for (let d = d0; d <= d1; d += 14) { const [x, y, a] = onPath(d); const o = Math.sin(d * 0.03) * 8; pts.push({ x: x - Math.sin(a) * o, y: y + Math.cos(a) * o, w: 20 + Math.sin(d * 0.05) * 6 }); }
    return pts;
  }
  function segDist(px, py, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
    const t = clamp(((px - a.x) * dx + (py - a.y) * dy) / l2, 0, 1);
    return Math.hypot(px - a.x - dx * t, py - a.y - dy * t);
  }
  function releaseBrush() {
    if (!brush) return;
    let pts = brush.pts;
    if (pts.length < 3) pts = autoPts();
    brush = null;
    if (pts.length < 2) { toast('战场上没有敌人', '#1d1a16'); return; }
    S.ult = 0; S.ultReadyShown = false;
    const dmg = HPW(Math.max(1, S.wave)) * 14;
    let n = 0;
    for (const e of enemies) {
      if (e.dead) continue;
      let md = 1e9; for (let i = 1; i < pts.length; i++) md = Math.min(md, segDist(e.x, e.y, pts[i - 1], pts[i]));
      if (md <= 30 + e.r) { e.stun = Math.max(e.stun, 0.6); hurt(e, e.boss ? dmg * 2.5 : dmg, { pierce: 1, quiet: 1 }); n++; }
    }
    strokes.push({ pts, life: 0, max: 2.6 });
    if (!window.__sim) for (let i = 0; i < pts.length; i += 3) { splat(pts[i].x, pts[i].y, pts[i].w * 0.7, 0.3); if (i % 6 === 0) for (let k = 0; k < 3; k++) inkDrop(pts[i].x, pts[i].y, rnd(80, 220), '#14110d', rnd(2, 4)); }
    S.shake = 1; S.stop = 0.12; S.flash = 0.55; sfx.ultHit();
    const mid = pts[(pts.length / 2) | 0];
    float(mid.x, mid.y - 24, n ? `斩 ×${n}` : '斩', '#b3261e', 34, true);
  }

  /* ================= 每帧推进 ================= */
  function update(raw) {
    if (mode === 'title') { ambient(raw); updFx(raw); return; }
    if (mode !== 'play') return;
    if (toastT > 0) toastT -= raw;
    if (brush) {
      brush.real += raw;
      if (!brush.down && brush.real > 4.5) releaseBrush();
      else if (brush.down && brush.real - brush.t0 > 2.6) releaseBrush();
    }
    const dt = brush ? raw * 0.15 : raw;
    const n = S.speed === 2 && !brush ? 2 : 1;
    for (let i = 0; i < n && mode === 'play'; i++) step(dt);
  }
  function step(dt) {
    S.t += dt;
    if (S.flash > 0) S.flash = Math.max(0, S.flash - dt * 2);
    if (S.recPress > 0) S.recPress = Math.max(0, S.recPress - dt * 5);
    if (S.baseFlash > 0) S.baseFlash = Math.max(0, S.baseFlash - dt * 3);
    if (info && (info.t -= dt) <= 0) info = null;
    for (const c of hand) { if (!c) continue; if (c.delay > 0) c.delay -= dt; else if (c.a < 1) c.a = Math.min(1, c.a + dt * 6); }
    if (S.stop > 0) { S.stop -= dt; return; }

    // 波次
    if (S.waveState === 'inter') { S.interT -= dt; if (S.interT <= 0) startWave(S.wave + 1); }
    else if (S.waveState === 'spawn') {
      S.spawnT -= dt;
      if (S.spawnT <= 0 && S.queue.length) { const q = S.queue.shift(); spawnFoe(q.kind); S.spawnT = q.gap; }
      if (!S.queue.length) { S.waveState = 'clear'; S.clearT = 0; }
    } else if (S.waveState === 'clear' && (!enemies.length || (S.wave < TOTAL && (S.clearT += dt) > 20))) {
      S.cleared = S.wave;
      if (S.wave >= TOTAL) { win(); return; }
      const b = 8 + S.wave * 2; S.coins += b;
      float(VW / 2, 150, `守住第${NUM[S.wave]}波 · +${b} 两`, '#8f1a12', 18, true); sfx.clear();
      S.waveState = 'inter'; S.interT = 5;
    }

    // 敌军
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.dead) { enemies.splice(i, 1); continue; }
      if (e.flash > 0) e.flash = Math.max(0, e.flash - dt);
      if (e.squash > 0) e.squash = Math.max(0, e.squash - dt * 3);
      if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slowF = 1; }
      if (e.burnT > 0) {
        e.burnT -= dt; e.burnTk -= dt;
        if (e.burnTk <= 0) { e.burnTk = 0.33; hurt(e, e.burnD, { pierce: 1, quiet: 1 }); if (Math.random() < 0.6 && !window.__sim) embers(e.x, e.y - 4, 1); }
        if (e.dead) continue;
      }
      if (e.k.heal) {
        e.healT -= dt;
        if (e.healT <= 0 && e.x > 0) {
          e.healT = 3.2; let n = 0;
          for (const o of enemies) if (!o.dead && o !== e && o.hp < o.max && Math.hypot(o.x - e.x, o.y - e.y) < 85) { o.hp = Math.min(o.max, o.hp + o.max * 0.18); n++; }
          if (n) { ring(e.x, e.y, 8, 85, '#3fae5a', 3, 0.5); sparks(e.x, e.y, 6, '#9be37a'); sfx.heal(); }
        }
      }
      if (e.boss) bossAI(e, dt);
      if (e.stun > 0) e.stun -= dt;
      else { e.bob += dt * e.spd * 0.18; e.dist += e.spd * e.slowF * dt * (e.enr ? 1.45 : 1); }
      const p = onPath(e.dist); e.x = p[0]; e.y = p[1]; e.a = p[2];
      const cx = Math.cos(e.a); if (cx > 0.3) e.face = 1; else if (cx < -0.3) e.face = -1;
      if (e.dist >= PLEN - 2) {
        S.hp = Math.max(0, S.hp - e.k.dmg); S.baseFlash = 1; hpHit = 1;
        S.shake = Math.max(S.shake, e.boss ? 1 : 0.42); sfx.base();
        splat(BASE.x + 20, BASE.y + 10, 16, 0.4, '150,30,24'); smoke(BASE.x + 20, BASE.y, 4, 12);
        float(BASE.x + 20, BASE.y - 50, `大营 -${e.k.dmg}`, '#b3261e', 18, true);
        enemies.splice(i, 1);
        if (S.hp <= 0) { lose(); return; }
      }
    }

    // 字兵
    for (const u of units) {
      if (u.pop > 1) u.pop = Math.max(1, u.pop - dt * 2.2);
      if (u.recoil > 0) u.recoil = Math.max(0, u.recoil - dt * 4);
      u.pulse += dt;
      if (u.inked > 0) { u.inked -= dt; continue; }
      const d = DEF[u.type];
      if (d && d.buff) continue;
      u.cd -= dt * u.haste;
      if (u.cd <= 0) u.cd = fire(u) ? cdOf(u) : 0.12;
    }

    // 弹道
    for (let i = shots.length - 1; i >= 0; i--) {
      const p = shots[i];
      if (p.lob) {
        p.t += dt; const q = Math.min(1, p.t / p.T);
        p.x = lerp(p.x0, p.tx, q); p.y = lerp(p.y0, p.ty, q) - Math.sin(q * Math.PI) * p.h;
        if (q >= 1) { land(p); shots.splice(i, 1); }
        continue;
      }
      p.life += dt;
      if (p.life >= p.max || p.x < -40 || p.x > VW + 40 || p.y < -40 || p.y > FIELD_H + 20) { shots.splice(i, 1); continue; }
      if (p.home && p.tgt && !p.tgt.dead) {
        let df = Math.atan2(p.tgt.y - p.y, p.tgt.x - p.x) - p.a;
        while (df > Math.PI) df -= TAU; while (df < -Math.PI) df += TAU;
        p.a += clamp(df, -p.home * dt, p.home * dt);
        p.vx = Math.cos(p.a) * p.spd; p.vy = Math.sin(p.a) * p.spd;
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
      const extra = p.k === 'spear' ? 12 : p.k === 'garrow' ? 11 : 8;
      for (const e of enemies) {
        if (e.dead || (p.hit && p.hit.has(e))) continue;
        const hr = e.r + extra, dx = e.x - p.x, dy = e.y - p.y;
        if (dx * dx + dy * dy > hr * hr) continue;
        (p.hit || (p.hit = new Set())).add(e);
        const cr = Math.random() < p.crit;
        hurt(e, cr ? p.dmg * 1.8 : p.dmg, { crit: cr, gold: p.gold });
        if (!window.__sim) { if (p.gold) sparks(p.x, p.y, 3, '#ffd34d'); else inkDrop(p.x, p.y, rnd(40, 90), '#1b1814', rnd(1, 2)); }
        sfx.hit();
        if (--p.pierce <= 0) { shots.splice(i, 1); break; }
      }
    }

    // 毒雾、火海
    for (let i = pools.length - 1; i >= 0; i--) {
      const p = pools[i]; p.life += dt; p.tick -= dt;
      if (p.life >= p.max) { pools.splice(i, 1); continue; }
      const tk = p.tick <= 0; if (tk) p.tick = 0.33;
      if (p.k === 'fire' && Math.random() < dt * 14 && !window.__sim) embers(p.x + rnd(-p.R, p.R) * 0.6, p.y + rnd(-p.R, p.R) * 0.4, 1);
      for (const e of enemies) {
        if (e.dead || Math.hypot(e.x - p.x, e.y - p.y) > p.R + e.r) continue;
        if (p.k === 'poison') { e.slowF = Math.min(e.slowF, 1 - p.slow); e.slowT = 0.4; }
        else { e.burnT = Math.max(e.burnT, 1); e.burnD = p.dmg * 0.4; }
        if (tk) hurt(e, p.dmg, { pierce: 1, quiet: 1 });
      }
    }
    // 赵云
    for (let i = riders.length - 1; i >= 0; i--) {
      const r = riders[i]; r.life += dt;
      if (r.fade > 0 || r.dist < r.stop || r.dist < -30 || r.life > 4) { r.fade += dt; if (r.fade > 0.35) riders.splice(i, 1); continue; }
      r.dist -= r.spd * dt;
      const [x, y, a] = onPath(Math.max(0, r.dist)); r.x = x; r.y = y; r.a = a + Math.PI;
      r.trail.push([x, y]); if (r.trail.length > 9) r.trail.shift();
      if (r.dist > PLEN) continue;
      for (const e of enemies) {
        if (e.dead || r.hit.has(e) || Math.hypot(e.x - x, e.y - y) > e.r + 26) continue;
        r.hit.add(e); hurt(e, r.dmg, { pierce: 1, big: 1 });
        e.dist = Math.max(0, e.dist - (e.boss ? 3 : e.kind === 'jiang' ? 8 : 18));
        if (!window.__sim) sparks(e.x, e.y, 4, r.gold ? '#ffd34d' : '#ffffff');
        S.shake = Math.max(S.shake, 0.08);
      }
    }
    // 孔明火球
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i]; m.t += dt;
      if (m.t < m.T) continue;
      for (const e of enemies) if (!e.dead && Math.hypot(e.x - m.tx, e.y - m.ty) <= m.R + e.r) hurt(e, m.dmg, { pierce: 1, big: 1 });
      pools.push({ k: 'fire', x: m.tx, y: m.ty, R: m.R * 0.85, life: 0, max: m.fire, tick: 0.1, dmg: m.dmg * 0.22, seed: Math.random() * 10 });
      ring(m.tx, m.ty, 10, m.R * 1.2, '#ff7a2a', 6, 0.4);
      if (!window.__sim) { embers(m.tx, m.ty, 14); smoke(m.tx, m.ty, 4, 14, '#2a1a10'); scorch(m.tx, m.ty, m.R); }
      S.shake = Math.max(S.shake, 0.22); sfx.boom();
      meteors.splice(i, 1);
    }
    for (let i = slashes.length - 1; i >= 0; i--) if ((slashes[i].life += dt) >= slashes[i].max) slashes.splice(i, 1);
    for (let i = rings.length - 1; i >= 0; i--) if ((rings[i].life += dt) >= rings[i].max) rings.splice(i, 1);
    for (let i = strokes.length - 1; i >= 0; i--) if ((strokes[i].life += dt / (brush ? 0.15 : 1)) >= strokes[i].max) strokes.splice(i, 1);
    // 银两飞回
    for (let i = coinsFly.length - 1; i >= 0; i--) {
      const c = coinsFly[i]; c.age += dt;
      if (c.age < c.delay) { c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 300 * dt; continue; }
      const dx = COIN_T[0] - c.x, dy = COIN_T[1] - c.y, d = Math.hypot(dx, dy);
      if (d < 14) { S.coins += c.val; coinBump = 1; sfx.coin(); coinsFly.splice(i, 1); continue; }
      const sp = 520 + (c.age - c.delay) * 900;
      c.x += dx / d * Math.min(d, sp * dt); c.y += dy / d * Math.min(d, sp * dt);
    }
    updFx(dt);
    ambient(dt);
    // 墨迹慢慢淡去
    S.stainT += dt;
    if (S.stainT > 0.3 && SG) { S.stainT = 0; SG.globalCompositeOperation = 'destination-out'; SG.fillStyle = 'rgba(0,0,0,.035)'; SG.fillRect(0, 0, STAIN.width, STAIN.height); SG.globalCompositeOperation = 'source-over'; }
    if (S.ult >= 100 && !S.ultReadyShown) { S.ultReadyShown = true; toast('墨已研好 · 点砚台挥毫', '#1d1a16'); sfx.ultReady(); }
    if (S.auto) autoPlay(dt);
  }
  function updFx(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.life += dt;
      if (p.life >= p.max) { parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.k === 'drop') { p.vx *= 0.9; p.vy *= 0.9; }
      else if (p.k === 'smoke') { p.r += p.grow * dt; p.vx *= 0.94; p.vy *= 0.94; }
      else if (p.k === 'spark') { p.vx *= 0.92; p.vy *= 0.92; }
      else if (p.k === 'ember') { p.vy -= 20 * dt; p.vx += rnd(-40, 40) * dt; }
      else if (p.k === 'chip') { p.vy += 500 * dt; p.rot += dt * 10; }
      else if (p.k === 'petal') { p.vx += Math.sin(p.life * 2 + p.ph) * 12 * dt; p.rot += dt * p.vr; }
    }
    for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.life += dt; f.y += f.vy * dt; f.vy *= 0.93; if (f.life >= f.max) floats.splice(i, 1); }
    if (banners.length) { banners[0].life += dt; if (banners[0].life >= banners[0].max) banners.shift(); }
  }
  function ambient(dt) {
    if (!S) return;
    S.petalT -= dt;
    if (S.petalT <= 0) {
      S.petalT = rnd(0.5, 1.3);
      addP({ k: 'petal', x: rnd(-20, VW * 0.7), y: rnd(-20, 40), vx: rnd(18, 40), vy: rnd(20, 38), r: rnd(2.2, 3.6), life: 0, max: rnd(9, 14), col: Math.random() < 0.7 ? '#f0c6c0' : '#f7e3d8', rot: rnd(0, TAU), vr: rnd(-3, 3), ph: rnd(0, TAU) });
    }
  }
  let hpHit = 0, coinBump = 0;

  /* ================= 电脑代打（调数值、截封面用） ================= */
  function coverage(x, y, R) { let n = 0; for (const p of PSAMP) if ((p[0] - x) ** 2 + (p[1] - y) ** 2 <= R * R) n++; return n / PSAMP.length; }
  function scoreAct(act, type) {
    if (!act) return -1;
    if (act.k === 'combo') return 300;
    if (act.k === 'merge') return HERO[act.t.type] ? 160 + act.t.stars * 5 : 60 + act.t.stars * 6;
    if (act.k !== 'place') return -1;
    const d = DEF[type], [x, y] = cellXY(act.r, act.c), cx = x + CS / 2, cy = y + CS / 2;
    let sc = 10;
    if (d.buff) { const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => at(act.r + a, act.c + b)).filter((u) => u && !(DEF[u.type] && DEF[u.type].buff)); sc += nb.length * 9 + nb.filter((u) => HERO[u.type]).length * 12; }
    else sc += coverage(cx, cy, d.range) * 40;
    if (d.hc) {
      const h = d.hc, first = h.a === type;
      const free = first ? [[act.r, act.c + 1], [act.r + 1, act.c]] : [[act.r, act.c - 1], [act.r - 1, act.c]];
      if (free.some(([a, b]) => inB(a, b) && !board[a][b])) sc += 20; else sc -= 15;
    }
    if (freeCells() <= 2 && !d.hc) sc -= 25;
    return sc;
  }
  function autoPlay(dt) {
    S.aiT -= dt; if (S.aiT > 0) return; S.aiT = 0.35;
    for (const u of units) if (u.inked > 0 && u.inked < 4.6) cleanInk(u);
    if (S.ult >= 100 && (liveFoes().length >= 8 || enemies.some((e) => e.boss && e.x > 0))) { startBrush(); releaseBrush(); return; }
    let best = null, bs = 0;
    for (let i = 0; i < HAND_N; i++) {
      const c = hand[i]; if (!c) continue;
      for (let r = 0; r < ROWS; r++) for (let cc = 0; cc < COLS; cc++) {
        const dg = { from: 'hand', idx: i, type: c.type, unit: null }, act = evalDrop(dg, r, cc), s = scoreAct(act, c.type);
        if (s > bs) { bs = s; best = [dg, act]; }
      }
    }
    if (best) { execDrop(best[0], best[1]); return; }
    // 盘上两个字没挨着：挪过去或者交换位置拼名
    for (const u of units) {
      const hc = u.span === 1 && DEF[u.type].hc; if (!hc) continue;
      const first = hc.a === u.type, pt = units.find((p) => p.span === 1 && p.type === (first ? hc.b : hc.a)); if (!pt) continue;
      for (const [r, c] of first ? [[pt.r, pt.c - 1], [pt.r - 1, pt.c]] : [[pt.r, pt.c + 1], [pt.r + 1, pt.c]]) {
        if (!inB(r, c) || board[r][c] === u) continue;
        const dg = { from: 'board', type: u.type, unit: u }, act = evalDrop(dg, r, c);
        if (act && (act.k === 'place' || act.k === 'swap' || act.k === 'combo')) { execDrop(dg, act); checkCombo(u); return; }
      }
    }
    for (const u of units) {
      if (u.span !== 1) continue;
      for (let r = 0; r < ROWS; r++) for (let cc = 0; cc < COLS; cc++) {
        const dg = { from: 'board', type: u.type, unit: u }, act = evalDrop(dg, r, cc);
        if (act && (act.k === 'merge' || act.k === 'combo')) { execDrop(dg, act); return; }
      }
    }
    // 手里有没成名的武将字、盘上又没地方：遣散一个最弱的字兵腾地方
    const has = (t) => hand.some((c) => c && c.type === t) || units.some((u) => u.type === t);
    const wantHero = HEROES.some((h) => !units.some((u) => u.type === h.id) && has(h.a) && has(h.b) && (hand.some((c) => c && c.type === h.a) || hand.some((c) => c && c.type === h.b)));
    if (wantHero && freeCells() < 2) {
      const w = units.filter((u) => u.span === 1 && !DEF[u.type].hc).sort((a, b) => a.stars - b.stars)[0];
      if (w) { dismiss(w); return; }
    }
    const empty = hand.filter((c) => !c).length;
    if (S.coins >= cost() && (empty >= 3 || freeCells() === 0)) recruit();
  }

  /* ================= 画：字牌 ================= */
  function seals(g, cx, cy, n) {
    const s = 6.5, gp = 2, tw = n * s + (n - 1) * gp;
    for (let i = 0; i < n; i++) {
      const x0 = cx - tw / 2 + i * (s + gp);
      g.fillStyle = n >= 5 ? '#d9a21b' : '#b3261e'; g.fillRect(x0, cy - s / 2, s, s);
      g.strokeStyle = 'rgba(40,10,5,.35)'; g.lineWidth = 0.8; g.strokeRect(x0 + 0.4, cy - s / 2 + 0.4, s - 0.8, s - 0.8);
      g.fillStyle = 'rgba(255,240,220,.5)'; g.fillRect(x0 + 1.5, cy - 1, s - 3, 1);
    }
  }
  function drawTile(g, type, x, y, w, h, stars, dir, isHand) {
    const H = HERO[type], d = DEF[type], hc = d && d.hc;
    g.fillStyle = 'rgba(25,16,8,.3)'; rr(g, x + 1.5, y + 3.5, w, h, 7); g.fill();
    const gr = g.createLinearGradient(x, y, x, y + h);
    if (H) { gr.addColorStop(0, '#fff8de'); gr.addColorStop(1, '#efd48a'); }
    else if (hc) { gr.addColorStop(0, '#fffaf0'); gr.addColorStop(1, '#f1dfb4'); }
    else { gr.addColorStop(0, '#fdf8ec'); gr.addColorStop(1, '#ebdfc3'); }
    g.fillStyle = gr; rr(g, x, y, w, h, 7); g.fill();
    g.lineWidth = H ? 2.4 : 1.5; g.strokeStyle = H ? '#9c6c12' : hc ? '#8a6a2a' : '#3a3024'; g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (H) {
      g.globalAlpha = 0.6; g.strokeStyle = H.col; g.lineWidth = 1.3; rr(g, x + 4, y + 4, w - 8, h - 8, 4); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = '#b3261e';
      for (const [cx, cy, sx, sy] of [[x + 6, y + 6, 1, 1], [x + w - 6, y + 6, -1, 1], [x + 6, y + h - 6, 1, -1], [x + w - 6, y + h - 6, -1, -1]]) { g.fillRect(cx, cy, 7 * sx, 2 * sy); g.fillRect(cx, cy, 2 * sx, 7 * sy); }
      const fs = Math.min(w, h) * 0.58;
      const pos = dir === 'h' ? [[x + w * 0.27, y + h * 0.45], [x + w * 0.73, y + h * 0.45]] : [[x + w / 2, y + h * 0.26], [x + w / 2, y + h * 0.7]];
      g.font = `900 ${fs}px ${KAI}`;
      [H.ca, H.cb].forEach((ch, i) => { g.fillStyle = 'rgba(0,0,0,.14)'; g.fillText(ch, pos[i][0] + 1.5, pos[i][1] + 2); g.fillStyle = '#1d1a16'; g.fillText(ch, pos[i][0], pos[i][1]); });
      // 名章
      const mx = dir === 'h' ? x + w / 2 : x + w - 13, my = dir === 'h' ? y + h * 0.45 : y + h / 2;
      g.save(); g.translate(mx, my); g.rotate(-0.08);
      g.fillStyle = H.col; rr(g, -6, -11, 12, 22, 2); g.fill();
      g.fillStyle = '#fff3d6'; g.font = `900 8.5px ${KAI}`; g.fillText(H.skill[0], 0, -5); g.fillText(H.skill[1], 0, 5);
      g.restore();
      seals(g, x + w / 2, y + h - 8, stars);
      return;
    }
    const fs = isHand ? 46 : h * 0.64, cy = isHand ? y + 41 : y + h * 0.46;
    g.font = `900 ${fs}px ${KAI}`;
    g.fillStyle = 'rgba(0,0,0,.11)'; g.fillText(d.ch, x + w / 2 + 1.5, cy + 2);
    g.fillStyle = d.ink; g.fillText(d.ch, x + w / 2, cy);
    if (isHand) {
      g.font = `800 11px ${SANS}`; g.fillStyle = hc ? '#9c6c12' : '#5a4a36';
      g.fillText(hc ? `拼「${hc.name}」` : d.name, x + w / 2, y + h - 14);
    } else {
      if (hc) { g.font = `900 12px ${KAI}`; g.fillStyle = '#b8861a'; g.fillText(`+${hc.a === type ? hc.cb : hc.ca}`, x + w - 12, y + 11); }
      seals(g, x + w / 2, y + h - 8, stars);
    }
  }
  function tileImg(type, stars, w, h, dir, isHand) {
    const key = `${type}|${stars}|${w}|${h}|${dir}|${isHand ? 1 : 0}`;
    let c = tileCache.get(key);
    if (!c) { c = mk((w + 8) * K, (h + 10) * K); const g = c.getContext('2d'); g.scale(K, K); drawTile(g, type, 4, 4, w, h, stars, dir, isHand); tileCache.set(key, c); }
    return c;
  }
  function blitTile(g, type, stars, x, y, w, h, dir, isHand) { g.drawImage(tileImg(type, stars, w, h, dir, isHand), x - 4, y - 4, w + 8, h + 10); }

  /* ================= 画：敌军 ================= */
  const FOE_COL = { bing: ['#4b453b', '#141210'], ma: ['#4b453b', '#141210'], dun: ['#4a4a46', '#151514'], wu: ['#2f4a3a', '#0c1610'], jiang: ['#5a3a2a', '#1a0f0a'], shuai: ['#6a2a22', '#1c0806'], mo: ['#4a2b4f', '#0d070f'] };
  function foeImg(kind, white) {
    const key = kind + (white ? 'w' : '');
    let c = foeCache.get(key); if (c) return c;
    const k = KIND[kind], R = k.r, SZ = R * 4.2;
    c = mk(SZ * K, SZ * K); const g = c.getContext('2d'); g.scale(K, K); g.translate(SZ / 2, SZ / 2 + R * 0.3);
    const r = mulberry(kind.length * 31 + R);
    if (kind === 'shuai') {
      for (const s of [-1, 1]) { g.strokeStyle = '#2b1a12'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(s * R * 0.5, -R * 0.2); g.lineTo(s * R * 0.85, -R * 1.75); g.stroke(); g.fillStyle = '#c0281e'; g.beginPath(); g.moveTo(s * R * 0.85, -R * 1.75); g.lineTo(s * R * 1.45, -R * 1.5); g.lineTo(s * R * 0.83, -R * 1.2); g.fill(); }
    }
    if (kind === 'mo') {
      g.fillStyle = '#1a0f1c';
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * R * 0.35, -R * 0.75); g.quadraticCurveTo(s * R * 0.9, -R * 1.5, s * R * 1.2, -R * 1.45); g.quadraticCurveTo(s * R * 0.85, -R * 1.1, s * R * 0.75, -R * 0.55); g.fill(); }
    }
    const [c0, c1] = FOE_COL[kind];
    const gr = g.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R * 1.05);
    gr.addColorStop(0, c0); gr.addColorStop(1, c1);
    g.fillStyle = gr;
    g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + r() * 0.5, rr2 = R * (0.14 + r() * 0.14); g.beginPath(); g.arc(Math.cos(a) * R * 0.92, Math.sin(a) * R * 0.92, rr2, 0, TAU); g.fill(); }
    g.beginPath(); g.ellipse(R * 0.3, R * 1.0, R * 0.12, R * 0.22, 0, 0, TAU); g.fill();
    if (kind === 'mo') { g.beginPath(); g.ellipse(-R * 0.5, R * 0.95, R * 0.1, R * 0.3, 0, 0, TAU); g.fill(); }
    if (white) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#fff4dc'; g.fillRect(-SZ, -SZ, SZ * 2, SZ * 2); foeCache.set(key, c); return c; }
    if (kind === 'jiang' || kind === 'shuai') { g.strokeStyle = '#d9a21b'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R * 0.86, 0, TAU); g.stroke(); }
    if (kind === 'jiang') { g.fillStyle = '#c0281e'; g.beginPath(); g.moveTo(-3, -R * 0.95); g.quadraticCurveTo(-R * 0.6, -R * 1.7, R * 0.1, -R * 1.65); g.quadraticCurveTo(R * 0.4, -R * 1.3, 3, -R * 0.95); g.fill(); }
    if (kind === 'mo') { g.strokeStyle = 'rgba(200,40,60,.8)'; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, R * 0.86, 0, TAU); g.stroke(); }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = kind === 'mo' ? '#ffd0d8' : '#f3ead6'; g.font = `900 ${R * 1.15}px ${KAI}`; g.fillText(k.ch, 0, R * 0.06);
    if (kind === 'dun') {
      g.save(); g.translate(R * 0.78, R * 0.3);
      const sg = g.createRadialGradient(-2, -2, 1, 0, 0, R * 0.62); sg.addColorStop(0, '#b5824a'); sg.addColorStop(1, '#6b4422');
      g.fillStyle = sg; g.beginPath(); g.arc(0, 0, R * 0.6, 0, TAU); g.fill();
      g.strokeStyle = '#1d1a16'; g.lineWidth = 1.6; g.stroke();
      g.strokeStyle = '#d0c3a2'; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, R * 0.38, 0, TAU); g.stroke();
      g.fillStyle = '#e8dcc0'; g.beginPath(); g.arc(0, 0, 2, 0, TAU); g.fill();
      g.restore();
    }
    if (kind === 'wu') {
      g.fillStyle = '#1f3a2a'; g.beginPath(); g.moveTo(-R * 0.75, -R * 0.75); g.lineTo(R * 0.1, -R * 2); g.lineTo(R * 0.75, -R * 0.75); g.quadraticCurveTo(0, -R * 0.55, -R * 0.75, -R * 0.75); g.fill();
      g.fillStyle = '#7fe08f'; g.beginPath(); g.arc(R * 0.1, -R * 2, 2.4, 0, TAU); g.fill();
    }
    foeCache.set(key, c); return c;
  }
  function drawHorse(g, x, y, dir, t, col, line, sc) {
    g.save(); g.translate(x, y); g.scale(dir * sc, sc);
    g.strokeStyle = line; g.lineWidth = 2; g.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const ph = Math.sin(t * 18 + i * 1.6) * 5, lx = -9 + i * 6; g.beginPath(); g.moveTo(lx, 3); g.lineTo(lx + ph, 13); g.stroke(); }
    g.fillStyle = col;
    g.beginPath(); g.ellipse(0, 0, 14, 7, 0, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(8, -3); g.quadraticCurveTo(13, -10, 16, -14); g.lineTo(23, -12); g.lineTo(21, -8); g.quadraticCurveTo(15, -6, 12, 2); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-13, -2); g.quadraticCurveTo(-22, -2, -21, 8); g.stroke();
    g.restore();
  }
  function drawFoe(g, e, T) {
    const k = e.k, bob = e.stun > 0 ? 0 : Math.sin(e.bob) * 1.6, R = e.r;
    g.fillStyle = 'rgba(30,20,10,.22)'; g.beginPath(); g.ellipse(e.x, e.y + R * 0.85, R * (k.horse ? 1.2 : 0.9), R * 0.28, 0, 0, TAU); g.fill();
    if (e.slowT > 0) { g.strokeStyle = 'rgba(40,160,80,.55)'; g.lineWidth = 2; g.beginPath(); g.ellipse(e.x, e.y + R * 0.85, R, R * 0.35, 0, 0, TAU); g.stroke(); }
    let bx = e.x, by = e.y - 2 + bob, sc = 1;
    if (k.horse) { drawHorse(g, e.x, e.y + 4, e.face, e.bob * 0.3, '#2a251e', '#14110d', 0.9); by -= 9; sc = 0.85; }
    else if (!e.boss || true) {
      g.strokeStyle = '#14110d'; g.lineWidth = R * 0.22; g.lineCap = 'round';
      const f = Math.sin(e.bob) * R * 0.3;
      g.beginPath(); g.moveTo(e.x - R * 0.35, e.y + R * 0.6); g.lineTo(e.x - R * 0.35 + f, e.y + R * 0.95); g.moveTo(e.x + R * 0.35, e.y + R * 0.6); g.lineTo(e.x + R * 0.35 - f, e.y + R * 0.95); g.stroke();
    }
    const img = foeImg(e.kind, false), SZ = R * 4.2 * sc, sq = 1 + e.squash * 0.3;
    g.save(); g.translate(bx, by); g.scale(sq, 1 / sq);
    g.drawImage(img, -SZ / 2, -SZ / 2 - R * 0.3 * sc, SZ, SZ);
    if (e.flash > 0) { g.globalAlpha = Math.min(1, e.flash / 0.08) * 0.5; g.drawImage(foeImg(e.kind, true), -SZ / 2, -SZ / 2 - R * 0.3 * sc, SZ, SZ); g.globalAlpha = 1; }
    g.restore();
    if (e.burnT > 0) {
      for (let i = 0; i < 3; i++) { const fx = e.x + (i - 1) * R * 0.5, fh = 6 + Math.sin(T * 20 + i * 2) * 3; g.fillStyle = i === 1 ? 'rgba(255,200,80,.85)' : 'rgba(255,110,40,.75)'; g.beginPath(); g.moveTo(fx - 3, by + R * 0.3); g.quadraticCurveTo(fx, by + R * 0.3 - fh * 2, fx + 3, by + R * 0.3); g.fill(); }
    }
    if (e.stun > 0) {
      for (let i = 0; i < 3; i++) { const a = T * 6 + i * TAU / 3; g.fillStyle = '#f2c230'; g.beginPath(); g.arc(e.x + Math.cos(a) * R * 0.8, by - R - 6 + Math.sin(a) * 3, 2.6, 0, TAU); g.fill(); }
    }
    if (!e.boss && e.hp < e.max) {
      const w = R * 2, y0 = by - R - (k.horse ? 6 : 10) - (e.kind === 'wu' ? 12 : e.kind === 'jiang' ? 10 : 0);
      g.fillStyle = 'rgba(30,25,20,.55)'; g.fillRect(e.x - w / 2 - 1, y0 - 1, w + 2, 5);
      g.fillStyle = e.armor ? '#9aa3ab' : '#c0341d'; g.fillRect(e.x - w / 2, y0, w * clamp(e.hp / e.max, 0, 1), 3);
    }
  }
  function drawBossBar(g) {
    const b = enemies.find((e) => e.boss && !e.dead); if (!b || brush) return;
    const x = 62, y = 64, w = 326;
    g.fillStyle = 'rgba(25,20,15,.78)'; rr(g, x - 44, y - 2, w + 50, 16, 8); g.fill();
    g.fillStyle = '#f3ead6'; g.font = `900 13px ${KAI}`; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText(b.kind === 'mo' ? '墨魔' : '敌帅', x - 38, y + 6);
    g.fillStyle = '#3a2a22'; g.fillRect(x, y + 2, w, 8);
    const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, '#7a1410'); gr.addColorStop(1, b.enr ? '#ff5a3a' : '#d8452f');
    g.fillStyle = gr; g.fillRect(x, y + 2, w * clamp(b.hp / b.max, 0, 1), 8);
  }

  /* ================= 画：总渲染 ================= */
  function render(T) {
    const g = ctx;
    g.setTransform(K, 0, 0, K, 0, 0);
    const sh = S.shake * S.shake * 9, ox = sh ? rnd(-sh, sh) : 0, oy = sh ? rnd(-sh, sh) : 0;
    g.save(); g.translate(ox, oy);
    g.fillStyle = '#e4dcc6'; g.fillRect(-12, -12, VW + 24, FIELD_H + 24);
    g.drawImage(BG, 0, 0, VW, FIELD_H);
    g.drawImage(STAIN, 0, 0, VW, FIELD_H);
    drawPortal(g, T);
    drawPools(g, T);
    drawLinks(g, T);
    drawRanges(g, T);
    for (const u of units) drawUnit(g, u, T);
    drawCampFg(g, T);
    const es = enemies.filter((e) => !e.dead).sort((a, b) => a.y - b.y);
    for (const e of es) drawFoe(g, e, T);
    drawSlashes(g, T);
    drawShots(g, T);
    drawRiders(g, T);
    drawMeteors(g, T);
    drawRings(g);
    drawParts(g, false);
    g.globalCompositeOperation = 'lighter'; drawParts(g, true); g.globalCompositeOperation = 'source-over';
    for (const s of strokes) drawStroke(g, s.pts, s.life / s.max);
    drawFloats(g);
    drawEarly(g, T);
    drawBossBar(g);
    drawInfo(g);
    g.restore();

    g.drawImage(TRAY, 0, FIELD_H, VW, VH - FIELD_H);
    drawHand(g, T);
    drawButtons(g, T);
    drawTutorial(g, T);
    drawDrag(g, T);
    for (const c of coinsFly) ingot(g, c.x, c.y, 1);
    if (brush) drawBrushUI(g, T);
    drawBanner(g);
    if (toastT > 0 && mode === 'play') {
      const a = clamp(toastT / 0.3, 0, 1);
      g.globalAlpha = a; g.font = `800 14px ${SANS}`; const w = g.measureText(toastTxt).width + 30;
      g.fillStyle = 'rgba(250,244,230,.95)'; rr(g, VW / 2 - w / 2, 488, w, 28, 14); g.fill(); g.strokeStyle = 'rgba(40,30,20,.4)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = toastCol; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(toastTxt, VW / 2, 502); g.globalAlpha = 1;
    }
    if (S.flash > 0) { g.fillStyle = `rgba(255,250,232,${S.flash * 0.55})`; g.fillRect(0, 0, VW, FIELD_H); }
  }
  function drawPortal(g, T) {
    for (let i = 0; i < 5; i++) {
      const a = T * 0.6 + i * 1.3, x = 6 + Math.cos(a) * 10, y = 104 + Math.sin(a * 1.3) * 16, R = 20 + Math.sin(T + i) * 5;
      const gr = g.createRadialGradient(x, y, 1, x, y, R); gr.addColorStop(0, 'rgba(20,18,15,.35)'); gr.addColorStop(1, 'rgba(20,18,15,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill();
    }
  }
  function drawPools(g, T) {
    for (const p of pools) {
      const a = Math.min(1, p.life / 0.2) * Math.min(1, (p.max - p.life) / 0.5);
      if (p.k === 'poison') {
        const gr = g.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.R);
        gr.addColorStop(0, `rgba(46,164,79,${0.42 * a})`); gr.addColorStop(0.7, `rgba(30,110,55,${0.25 * a})`); gr.addColorStop(1, 'rgba(30,110,55,0)');
        g.fillStyle = gr; g.beginPath(); g.ellipse(p.x, p.y, p.R, p.R * 0.75, 0, 0, TAU); g.fill();
        for (let i = 0; i < 5; i++) { const ph = (T * 0.8 + i * 0.37 + p.seed) % 1, bx = p.x + Math.sin(i * 2.4 + p.seed) * p.R * 0.6, by = p.y + Math.cos(i * 1.7 + p.seed) * p.R * 0.4 - ph * 14; g.strokeStyle = `rgba(150,230,150,${(1 - ph) * 0.7 * a})`; g.lineWidth = 1.2; g.beginPath(); g.arc(bx, by, 2 + ph * 3, 0, TAU); g.stroke(); }
      } else {
        const fl = 0.85 + Math.sin(T * 17 + p.seed) * 0.15;
        const gr = g.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.R * fl);
        gr.addColorStop(0, `rgba(255,220,120,${0.55 * a})`); gr.addColorStop(0.45, `rgba(255,110,40,${0.45 * a})`); gr.addColorStop(1, 'rgba(200,40,20,0)');
        g.fillStyle = gr; g.beginPath(); g.ellipse(p.x, p.y, p.R * fl, p.R * 0.7 * fl, 0, 0, TAU); g.fill();
        for (let i = 0; i < 6; i++) {
          const fx = p.x + Math.sin(i * 2.1 + p.seed) * p.R * 0.6, fy = p.y + Math.cos(i * 1.3 + p.seed) * p.R * 0.35, fh = (10 + Math.sin(T * 14 + i * 1.7) * 5) * a;
          g.fillStyle = i % 2 ? `rgba(255,190,70,${0.8 * a})` : `rgba(255,90,30,${0.75 * a})`;
          g.beginPath(); g.moveTo(fx - 4, fy); g.quadraticCurveTo(fx - 2, fy - fh, fx + Math.sin(T * 9 + i) * 2, fy - fh * 1.5); g.quadraticCurveTo(fx + 2, fy - fh, fx + 4, fy); g.fill();
        }
      }
    }
  }
  function drawLinks(g, T) {
    if (!links.length) return;
    g.save(); g.setLineDash([4, 5]); g.lineDashOffset = -T * 20; g.lineWidth = 2;
    for (const [s, n, kind] of links) {
      if (drag && (drag.unit === s || drag.unit === n)) continue;
      const [x1, y1] = uCenter(s), [x2, y2] = uCenter(n);
      g.strokeStyle = kind === 'haste' ? 'rgba(46,140,80,.6)' : 'rgba(200,110,30,.65)';
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    }
    g.restore();
  }
  function rangeOf(u) {
    const s = u.stars;
    switch (u.type) { case 'hz': return 300 + 8 * s; case 'gy': return 150 + 10 * (s - 1); case 'zf': return 165 + 10 * (s - 1); case 'zy': case 'km': return 0; default: return DEF[u.type].range ? DEF[u.type].range + (s - 1) * 6 : 0; }
  }
  function drawRanges(g) {
    const u = info && info.u;
    if (!u || !units.includes(u)) return;
    const R = rangeOf(u); if (!R || R > 500) return;
    const [x, y] = uCenter(u);
    g.fillStyle = 'rgba(179,38,30,.07)'; g.beginPath(); g.arc(x, y, R, 0, TAU); g.fill();
    g.setLineDash([6, 5]); g.strokeStyle = 'rgba(179,38,30,.6)'; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, R, 0, TAU); g.stroke(); g.setLineDash([]);
  }
  function drawInfo(g) {
    if (!info || !units.includes(info.u)) return;
    const u = info.u, H = HERO[u.type], d = DEF[u.type], R = uRect(u);
    const title = H ? `${H.name} · ${u.stars >= 5 ? H.awake : H.skill}` : `${d.name}${d.hc ? '（单字）' : ''}`;
    const body = H ? H.desc : d.desc;
    const extra = d && d.buff ? `加成 +${Math.round((0.25 + (u.stars - 1) * 0.1) * 100)}%` : (u.haste > 1 || u.amp > 1) ? `受加成：${u.haste > 1 ? '攻速 ×' + u.haste.toFixed(2) + ' ' : ''}${u.amp > 1 ? '伤害 ×' + u.amp.toFixed(2) : ''}` : '';
    g.font = `12px ${SANS}`;
    const lines = wrapText(g, body, 190); if (extra) lines.push(extra);
    const w = 210, h = 30 + lines.length * 16;
    let x = clamp(R.x + R.w / 2 - w / 2, 8, VW - w - 8), y = R.y - h - 8; if (y < 62) y = R.y + R.h + 8;
    g.fillStyle = 'rgba(28,24,18,.92)'; rr(g, x, y, w, h, 8); g.fill();
    g.fillStyle = H ? '#f6d77a' : '#f3ead6'; g.font = `900 15px ${KAI}`; g.textAlign = 'left'; g.textBaseline = 'top';
    g.fillText(title + '  ' + '★'.repeat(u.stars), x + 10, y + 8);
    g.fillStyle = '#e6dcc4'; g.font = `12px ${SANS}`;
    lines.forEach((l, i) => g.fillText(l, x + 10, y + 28 + i * 16));
  }
  function wrapText(g, s, w) { const out = []; let line = ''; for (const ch of s) { if (g.measureText(line + ch).width > w) { out.push(line); line = ch; } else line += ch; } if (line) out.push(line); return out; }
  function drawUnit(g, u, T) {
    const R = uRect(u);
    if (drag && drag.moved && drag.unit === u) { g.setLineDash([4, 4]); g.strokeStyle = 'rgba(60,40,20,.45)'; g.lineWidth = 1.5; rr(g, R.x, R.y, R.w, R.h, 7); g.stroke(); g.setLineDash([]); return; }
    const H = HERO[u.type];
    const s = u.pop * (1 - u.recoil * 0.04);
    g.save(); g.translate(R.x + R.w / 2, R.y + R.h / 2); g.scale(s, s);
    if (H) {
      const gl = u.stars >= 5 ? 0.55 + Math.sin(T * 4) * 0.25 : 0.18;
      const gr = g.createRadialGradient(0, 0, 10, 0, 0, Math.max(R.w, R.h) * 0.8);
      gr.addColorStop(0, `rgba(255,205,80,${gl})`); gr.addColorStop(1, 'rgba(255,205,80,0)');
      g.fillStyle = gr; g.fillRect(-R.w, -R.h, R.w * 2, R.h * 2);
    }
    blitTile(g, u.type, u.stars, -R.w / 2, -R.h / 2, R.w, R.h, u.dir, false);
    // 出手方向的小红点
    if (!(DEF[u.type] && DEF[u.type].buff) && !['gy', 'zf', 'zy', 'km'].includes(u.type)) {
      const rx = R.w / 2 + 2, ry = R.h / 2 + 2, ca = Math.cos(u.aim), sa = Math.sin(u.aim);
      const k = Math.min(rx / Math.abs(ca || 1e-6), ry / Math.abs(sa || 1e-6));
      g.fillStyle = '#b3261e'; g.beginPath(); g.arc(ca * k * (1 + u.recoil * 0.08), sa * k * (1 + u.recoil * 0.08), 3, 0, TAU); g.fill();
    }
    if (DEF[u.type] && DEF[u.type].buff) {
      const p = (u.pulse * 0.8) % 1;
      g.strokeStyle = `rgba(${DEF[u.type].buff === 'haste' ? '46,140,80' : '200,110,30'},${(1 - p) * 0.6})`; g.lineWidth = 2;
      rr(g, -R.w / 2 - p * 8, -R.h / 2 - p * 8, R.w + p * 16, R.h + p * 16, 8); g.stroke();
    }
    if (DEF[u.type] && DEF[u.type].hc && !H) {
      const ph = (T * 0.9 + u.id * 0.3) % 1;
      if (ph < 0.6) { g.fillStyle = `rgba(80,150,220,${(1 - ph / 0.6) * 0.85})`; g.beginPath(); const sx = R.w / 2 - 14, sy = -R.h / 2 + 18 + ph * 14; g.moveTo(sx, sy - 5); g.quadraticCurveTo(sx + 4, sy + 1, sx, sy + 3); g.quadraticCurveTo(sx - 4, sy + 1, sx, sy - 5); g.fill(); }
    }
    if (u.inked > 0) {
      const w = Math.sin(T * 8) * 1.5;
      g.fillStyle = 'rgba(16,12,18,.88)';
      g.beginPath(); g.arc(w, 2, Math.min(R.w, R.h) * 0.42, 0, TAU); g.fill();
      for (let i = 0; i < 7; i++) { const a = i * 0.9 + u.id; g.beginPath(); g.arc(Math.cos(a) * R.w * 0.32, Math.sin(a) * R.h * 0.32, 6 + (i % 3) * 3, 0, TAU); g.fill(); }
      g.fillStyle = '#f3ead6'; g.font = `800 11px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('点我擦', 0, 2);
      g.fillStyle = 'rgba(243,234,214,.6)'; g.fillRect(-R.w * 0.3, R.h / 2 - 12, R.w * 0.6 * (u.inked / 6), 3);
    }
    g.restore();
  }
  function drawCampFg(g, T) {
    const x = BASE.x, y = BASE.y;
    for (const s of [-1, 1]) {
      const fx = x + s * 34, fy = y - 30;
      g.strokeStyle = '#2b1a12'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(fx, fy + 6); g.lineTo(fx, fy - 26); g.stroke();
      g.fillStyle = '#b3261e'; g.beginPath(); g.moveTo(fx, fy - 26);
      for (let i = 0; i <= 6; i++) g.lineTo(fx + i * 3, fy - 26 + Math.sin(T * 5 + i * 0.8 + s) * 2);
      for (let i = 6; i >= 0; i--) g.lineTo(fx + i * 3, fy - 15 + Math.sin(T * 5 + i * 0.8 + s) * 2);
      g.fill();
    }
    if (S.baseFlash > 0) { g.fillStyle = `rgba(200,30,20,${S.baseFlash * 0.35})`; g.beginPath(); g.arc(x, y + 4, 46, 0, TAU); g.fill(); }
  }
  function drawSlashes(g, T) {
    g.lineCap = 'round';
    for (const s of slashes) {
      const p = clamp(s.life / s.max, 0, 1), e = 1 - Math.pow(1 - p, 3), a = 1 - p;
      if (s.half >= Math.PI - 0.01) {
        const R = s.R * (0.5 + 0.5 * e);
        g.strokeStyle = s.col; g.globalAlpha = a * 0.9; g.lineWidth = s.w * (1 - p * 0.6);
        g.beginPath(); g.arc(s.x, s.y, R, s.a, s.a + TAU * Math.min(1, e * 1.3)); g.stroke();
        g.strokeStyle = '#1d1a16'; g.lineWidth = s.w * 0.3 * (1 - p);
        g.beginPath(); g.arc(s.x, s.y, R + s.w * 0.4, s.a + 0.4, s.a + TAU * Math.min(1, e * 1.3) - 0.4); g.stroke();
        if (s.kind === 'dragon') {
          for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(60,200,140,${a * 0.6})`; g.lineWidth = 5 * (1 - p); g.beginPath(); g.arc(s.x, s.y, R * (0.35 + i * 0.22), s.a + T * 6 + i * 2, s.a + T * 6 + i * 2 + 2.4); g.stroke(); }
          g.globalAlpha = a * 0.7; g.fillStyle = '#1f6e4c'; g.font = `900 ${80 + e * 40}px ${KAI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('龍', s.x, s.y);
        }
        g.globalAlpha = 1;
      } else {
        const R = s.R * (0.55 + 0.45 * e);
        g.globalAlpha = a; g.strokeStyle = s.col; g.lineWidth = s.w * (1 - p * 0.7);
        g.beginPath(); g.arc(s.x, s.y, R, s.a - s.half * e, s.a + s.half * e); g.stroke();
        g.lineWidth = 3 * (1 - p); g.beginPath(); g.arc(s.x, s.y, R + 9, s.a - s.half * e * 0.8, s.a + s.half * e * 0.8); g.stroke();
        g.globalAlpha = 1;
      }
    }
  }
  function drawShots(g) {
    g.lineCap = 'round';
    for (const p of shots) {
      if (p.lob) {
        const q = clamp(p.t / p.T, 0, 1), gx = lerp(p.x0, p.tx, q), gy = lerp(p.y0, p.ty, q);
        g.fillStyle = 'rgba(30,20,10,.18)'; g.beginPath(); g.ellipse(gx, gy, 6, 2.5, 0, 0, TAU); g.fill();
        if (p.k === 'orb') {
          const gr = g.createRadialGradient(p.x - 2, p.y - 2, 1, p.x, p.y, 8); gr.addColorStop(0, '#b6f2b0'); gr.addColorStop(0.5, '#2ea44f'); gr.addColorStop(1, '#14522a');
          g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, 7, 0, TAU); g.fill();
        } else if (p.k === 'stone') {
          g.save(); g.translate(p.x, p.y); g.rotate(p.t * 12);
          g.fillStyle = '#6f6556'; g.beginPath(); g.moveTo(-6, -3); g.lineTo(-1, -7); g.lineTo(6, -4); g.lineTo(7, 3); g.lineTo(1, 7); g.lineTo(-6, 4); g.closePath(); g.fill();
          g.strokeStyle = '#2b261f'; g.lineWidth = 1.4; g.stroke(); g.restore();
        } else {
          g.fillStyle = '#120e14'; g.beginPath(); g.arc(p.x, p.y, 11, 0, TAU); g.fill();
          for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(p.x + Math.cos(i * 1.6 + p.t * 9) * 10, p.y + Math.sin(i * 1.6 + p.t * 9) * 10, 3.5, 0, TAU); g.fill(); }
        }
        continue;
      }
      const ca = Math.cos(p.a), sa = Math.sin(p.a);
      if (p.k === 'arrow') {
        g.strokeStyle = '#1d1a16'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(p.x - ca * 16, p.y - sa * 16); g.lineTo(p.x, p.y); g.stroke();
        g.fillStyle = '#1d1a16'; g.beginPath(); g.moveTo(p.x + ca * 5, p.y + sa * 5); g.lineTo(p.x - ca * 2 - sa * 3, p.y - sa * 2 + ca * 3); g.lineTo(p.x - ca * 2 + sa * 3, p.y - sa * 2 - ca * 3); g.fill();
        g.strokeStyle = '#b3261e'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(p.x - ca * 14 - sa * 3, p.y - sa * 14 + ca * 3); g.lineTo(p.x - ca * 17, p.y - sa * 17); g.lineTo(p.x - ca * 14 + sa * 3, p.y - sa * 14 - ca * 3); g.stroke();
      } else if (p.k === 'garrow') {
        g.globalCompositeOperation = 'lighter';
        g.strokeStyle = 'rgba(255,190,40,.45)'; g.lineWidth = 6; g.beginPath(); g.moveTo(p.x - ca * 26, p.y - sa * 26); g.lineTo(p.x, p.y); g.stroke();
        g.strokeStyle = '#fff1b0'; g.lineWidth = 2; g.beginPath(); g.moveTo(p.x - ca * 20, p.y - sa * 20); g.lineTo(p.x + ca * 4, p.y + sa * 4); g.stroke();
        g.globalCompositeOperation = 'source-over';
        g.strokeStyle = '#a06a00'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(p.x - ca * 2, p.y - sa * 2); g.lineTo(p.x + ca * 4, p.y + sa * 4); g.stroke();
      } else if (p.k === 'needle') {
        g.strokeStyle = '#5b2052'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(p.x - ca * 11, p.y - sa * 11); g.lineTo(p.x, p.y); g.stroke();
      } else if (p.k === 'spear') {
        g.strokeStyle = '#3b2a1a'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(p.x - ca * 30, p.y - sa * 30); g.lineTo(p.x, p.y); g.stroke();
        g.fillStyle = '#9aa3ab'; g.beginPath(); g.moveTo(p.x + ca * 9, p.y + sa * 9); g.lineTo(p.x - sa * 3.5, p.y + ca * 3.5); g.lineTo(p.x + sa * 3.5, p.y - ca * 3.5); g.fill();
        g.fillStyle = '#c0281e'; g.beginPath(); g.arc(p.x - ca * 2, p.y - sa * 2, 2.6, 0, TAU); g.fill();
      } else {
        g.fillStyle = '#1d1a16'; g.beginPath(); g.arc(p.x, p.y, 4, 0, TAU); g.fill();
        g.fillStyle = 'rgba(29,26,22,.35)'; g.beginPath(); g.arc(p.x - ca * 6, p.y - sa * 6, 2.6, 0, TAU); g.fill();
      }
    }
  }
  function drawRiders(g, T) {
    for (const r of riders) {
      const a = r.fade > 0 ? 1 - r.fade / 0.35 : Math.min(1, r.life / 0.1);
      const dir = Math.cos(r.a) < -0.2 ? -1 : 1;
      r.trail.forEach(([x, y], i) => { g.globalAlpha = a * (i / r.trail.length) * 0.25; drawHorse(g, x, y, dir, T, r.gold ? '#ffe9a0' : '#ffffff', 'rgba(0,0,0,0)', 1.2); });
      g.globalAlpha = a;
      if (r.gold) { const gr = g.createRadialGradient(r.x, r.y, 2, r.x, r.y, 36); gr.addColorStop(0, 'rgba(255,210,80,.45)'); gr.addColorStop(1, 'rgba(255,210,80,0)'); g.fillStyle = gr; g.beginPath(); g.arc(r.x, r.y, 36, 0, TAU); g.fill(); }
      drawHorse(g, r.x, r.y + 2, dir, T, '#f7f4ea', r.gold ? '#a06a00' : '#1d1a16', 1.2);
      g.save(); g.translate(r.x, r.y - 12); g.scale(dir, 1);
      g.fillStyle = '#e8edf2'; g.strokeStyle = '#1d1a16'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(-5, 4); g.lineTo(5, 4); g.lineTo(3, -8); g.lineTo(-3, -8); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.arc(0, -12, 4.5, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = '#2a5a86'; g.beginPath(); g.moveTo(-4, -15); g.lineTo(0, -21); g.lineTo(4, -15); g.fill();
      g.strokeStyle = '#3b2a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(-10, -2); g.lineTo(28, -6); g.stroke();
      g.fillStyle = '#cfd6dd'; g.beginPath(); g.moveTo(34, -6.5); g.lineTo(27, -9); g.lineTo(27, -3.5); g.fill();
      g.fillStyle = '#c0281e'; g.beginPath(); g.arc(25, -6, 2.4, 0, TAU); g.fill();
      g.restore();
      g.globalAlpha = 1;
    }
  }
  function drawMeteors(g, T) {
    for (const m of meteors) {
      const warn = clamp((m.t + 0.3) / (m.T + 0.3), 0, 1);
      g.strokeStyle = `rgba(200,40,20,${0.25 + warn * 0.4})`; g.lineWidth = 2; g.setLineDash([5, 4]);
      g.beginPath(); g.ellipse(m.tx, m.ty, m.R * (1.1 - warn * 0.3), m.R * 0.6 * (1.1 - warn * 0.3), 0, 0, TAU); g.stroke(); g.setLineDash([]);
      if (m.t < 0) continue;
      const q = Math.pow(m.t / m.T, 1.6), x = lerp(m.sx, m.tx, q), y = lerp(m.sy, m.ty, q);
      const bx = lerp(m.sx, m.tx, Math.max(0, q - 0.18)), by = lerp(m.sy, m.ty, Math.max(0, q - 0.18));
      g.globalCompositeOperation = 'lighter';
      const tg = g.createLinearGradient(bx, by, x, y); tg.addColorStop(0, 'rgba(255,90,20,0)'); tg.addColorStop(1, 'rgba(255,160,60,.85)');
      g.strokeStyle = tg; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(bx, by); g.lineTo(x, y); g.stroke();
      const gr = g.createRadialGradient(x, y, 1, x, y, 14); gr.addColorStop(0, '#fffbe0'); gr.addColorStop(0.4, '#ffc24a'); gr.addColorStop(1, 'rgba(255,80,20,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, 14, 0, TAU); g.fill();
      g.globalCompositeOperation = 'source-over';
    }
  }
  function drawRings(g) {
    for (const r of rings) {
      const p = clamp(r.life / r.max, 0, 1), e = 1 - Math.pow(1 - p, 3);
      g.globalAlpha = 1 - p; g.strokeStyle = r.col; g.lineWidth = r.w * (1 - p * 0.7);
      g.beginPath(); g.arc(r.x, r.y, lerp(r.r0, r.r1, e), 0, TAU); g.stroke();
    }
    g.globalAlpha = 1;
  }
  function drawParts(g, glow) {
    for (const p of parts) {
      const isGlow = p.k === 'spark' || p.k === 'ember';
      if (isGlow !== glow) continue;
      const a = 1 - p.life / p.max;
      g.globalAlpha = p.k === 'smoke' ? a * 0.32 : p.k === 'petal' ? Math.min(1, a * 3) * 0.85 : a;
      g.fillStyle = p.col;
      if (p.k === 'chip') { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillRect(-p.r, -p.r, p.r * 2, p.r * 2); g.restore(); }
      else if (p.k === 'petal') { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.beginPath(); g.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, TAU); g.fill(); g.restore(); }
      else { g.beginPath(); g.arc(p.x, p.y, p.k === 'spark' ? p.r * a + 0.5 : p.r, 0, TAU); g.fill(); }
    }
    g.globalAlpha = 1;
  }
  function drawStroke(g, pts, p) {
    if (pts.length < 2) return;
    const a = p < 0 ? 1 : 1 - Math.pow(clamp(p, 0, 1), 2);
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = `rgba(20,17,13,${0.22 * a})`;
    for (let i = 1; i < pts.length; i++) { g.lineWidth = pts[i].w * 1.6; g.beginPath(); g.moveTo(pts[i - 1].x, pts[i - 1].y); g.lineTo(pts[i].x, pts[i].y); g.stroke(); }
    g.strokeStyle = p >= 0 && p < 0.06 ? `rgba(255,214,90,${a})` : `rgba(18,15,12,${0.95 * a})`;
    for (let i = 1; i < pts.length; i++) { g.lineWidth = pts[i].w; g.beginPath(); g.moveTo(pts[i - 1].x, pts[i - 1].y); g.lineTo(pts[i].x, pts[i].y); g.stroke(); }
    g.strokeStyle = `rgba(90,80,70,${0.35 * a})`; g.lineWidth = 1.2;
    for (let k = -1; k <= 1; k += 2) { g.beginPath(); for (let i = 0; i < pts.length; i++) { const q = pts[i], o = q.w * 0.32 * k; i ? g.lineTo(q.x + o * 0.3, q.y + o) : g.moveTo(q.x + o * 0.3, q.y + o); } g.stroke(); }
  }
  function drawFloats(g) {
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    for (const f of floats) {
      const p = f.life / f.max, a = p > 0.7 ? (1 - p) / 0.3 : 1, sc = f.big ? 1 + Math.max(0, 0.35 - p) * 1.4 : 1;
      g.globalAlpha = a;
      g.font = f.big ? `900 ${f.size * sc}px ${KAI}` : `800 ${f.size}px ${SANS}`;
      g.strokeStyle = 'rgba(250,244,230,.92)'; g.lineWidth = f.big ? 4 : 3; g.strokeText(f.text, f.x, f.y);
      g.fillStyle = f.col; g.fillText(f.text, f.x, f.y);
    }
    g.globalAlpha = 1;
  }
  function drawEarly(g, T) {
    if (S.waveState !== 'inter' || mode !== 'play') return;
    const B = BTN_EARLY, pulse = 1 + Math.sin(T * 5) * 0.03;
    g.save(); g.translate(B.x + B.w / 2, B.y + B.h / 2); g.scale(pulse, pulse);
    g.fillStyle = 'rgba(28,24,18,.88)'; rr(g, -B.w / 2, -B.h / 2, B.w, B.h, 8); g.fill();
    g.strokeStyle = '#b3261e'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = '#f3ead6'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `900 14px ${KAI}`; g.fillText(`第${NUM[S.wave + 1]}波 · ${Math.ceil(S.interT)} 秒`, 0, -6);
    g.font = `700 10.5px ${SANS}`; g.fillStyle = '#f2d27a'; g.fillText(S.wave ? `▶ 提前开战 +${earlyBonus()} 两` : '▶ 准备好了就开战', 0, 9);
    g.restore();
  }
  function ingot(g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = '#cfd3d8'; g.strokeStyle = '#4a4f55'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(-8, -1); g.quadraticCurveTo(-7, 6, 0, 6); g.quadraticCurveTo(7, 6, 8, -1); g.quadraticCurveTo(4, 2, 0, 2); g.quadraticCurveTo(-4, 2, -8, -1); g.fill(); g.stroke();
    g.fillStyle = '#eef0f2'; g.beginPath(); g.ellipse(0, -1, 4, 3.4, 0, 0, TAU); g.fill(); g.stroke();
    g.restore();
  }

  /* ================= 画：手牌、按钮、拖拽 ================= */
  function handHints() {
    const H = {};
    for (const c of hand) {
      if (!c || H[c.type] !== undefined) continue;
      let best = 0;
      for (let r = 0; r < ROWS && best < 2; r++) for (let cc = 0; cc < COLS; cc++) {
        const a = evalDrop({ from: 'hand', type: c.type, unit: null }, r, cc);
        if (a && a.k === 'combo') { best = 2; break; }
        if (a && a.k === 'merge') best = 1;
      }
      H[c.type] = best;
    }
    return H;
  }
  function drawHand(g, T) {
    const hints = mode === 'play' ? handHints() : {};
    for (let i = 0; i < HAND_N; i++) {
      const c = hand[i]; if (!c) continue;
      const x = HX + i * (CW + CGAP), y = HY;
      if (drag && drag.moved && drag.from === 'hand' && drag.idx === i) { g.globalAlpha = 0.25; blitTile(g, c.type, 1, x, y, CW, CH, 'h', true); g.globalAlpha = 1; continue; }
      if (c.a <= 0) continue;
      const e = 1 - Math.pow(1 - c.a, 3), sx = Math.abs(Math.cos((1 - e) * Math.PI / 2));
      g.save(); g.translate(x + CW / 2, y + CH / 2 + (1 - e) * 26); g.scale(Math.max(0.05, sx), 0.7 + 0.3 * e); g.globalAlpha = e;
      const h = hints[c.type];
      if (h === 2) { g.shadowColor = 'rgba(255,190,40,.95)'; g.shadowBlur = 10 + Math.sin(T * 6) * 5; }
      blitTile(g, c.type, 1, -CW / 2, -CH / 2, CW, CH, 'h', true);
      g.shadowBlur = 0;
      if (h) {
        g.fillStyle = h === 2 ? '#b3261e' : '#1f6e3c'; rr(g, CW / 2 - 26, -CH / 2 - 7, 30, 16, 8); g.fill();
        g.fillStyle = '#fff6e2'; g.font = `900 11px ${KAI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(h === 2 ? '成名' : '升星', CW / 2 - 11, -CH / 2 + 1);
      }
      g.restore();
    }
  }
  function drawButtons(g, T) {
    // 征兵
    const B = BTN_REC, ok = S.coins >= cost(), ps = 1 - S.recPress * 0.06;
    g.save(); g.translate(B.x + B.w / 2, B.y + B.h / 2); g.scale(ps, ps);
    g.fillStyle = 'rgba(0,0,0,.35)'; rr(g, -B.w / 2 + 2, -B.h / 2 + 4, B.w, B.h, 10); g.fill();
    const gr = g.createLinearGradient(0, -B.h / 2, 0, B.h / 2);
    if (ok) { gr.addColorStop(0, '#d8452f'); gr.addColorStop(1, '#8a1a12'); } else { gr.addColorStop(0, '#6a5a4a'); gr.addColorStop(1, '#3e342a'); }
    g.fillStyle = gr; rr(g, -B.w / 2, -B.h / 2, B.w, B.h, 10); g.fill();
    g.strokeStyle = ok ? '#4a0c08' : '#1e1810'; g.lineWidth = 2; g.stroke();
    g.strokeStyle = 'rgba(255,230,200,.35)'; g.lineWidth = 1; rr(g, -B.w / 2 + 4, -B.h / 2 + 4, B.w - 8, B.h - 8, 7); g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#fff6e2'; g.font = `900 30px ${KAI}`; g.fillText('征 兵', -18, -6);
    g.font = `700 11px ${SANS}`; g.fillStyle = ok ? '#ffe0b0' : '#cbbca6'; g.fillText('换一手新字', -18, 20);
    ingot(g, 64, -6, 1.3); g.fillStyle = '#fff6e2'; g.font = `900 15px ${SANS}`; g.fillText(`${cost()}`, 64, 14);
    g.restore();
    // 遣散
    const D = BTN_DIS, act = drag && drag.moved && drag.from === 'board';
    const over = act && inRect(drag.x, drag.y, D);
    g.save();
    g.setLineDash([5, 4]); g.lineWidth = act ? 2.2 : 1.4;
    g.strokeStyle = act ? (over ? '#ff7a5a' : 'rgba(255,170,140,.9)') : 'rgba(240,226,200,.3)';
    g.fillStyle = over ? 'rgba(200,40,30,.35)' : act ? 'rgba(200,40,30,.15)' : 'rgba(0,0,0,.15)';
    rr(g, D.x, D.y, D.w, D.h, 10); g.fill(); g.stroke(); g.setLineDash([]);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = act ? '#ffe0d0' : 'rgba(240,226,200,.5)'; g.font = `900 22px ${KAI}`; g.fillText('遣 散', D.x + D.w / 2, D.y + D.h / 2 - 8);
    g.font = `700 10.5px ${SANS}`;
    g.fillText(act ? `退回 ${(HERO[drag.unit.type] ? 6 : 3) * drag.unit.stars} 两` : '拖盘上的字来', D.x + D.w / 2, D.y + D.h / 2 + 16);
    g.restore();
    // 挥毫：砚台
    const U = ULT, full = S.ult >= 100;
    g.save(); g.translate(U.x, U.y);
    if (full) { const pr = 1 + Math.sin(T * 6) * 0.06; const gg = g.createRadialGradient(0, 0, U.r * 0.6, 0, 0, U.r * 1.5 * pr); gg.addColorStop(0, 'rgba(255,200,60,.6)'); gg.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = gg; g.beginPath(); g.arc(0, 0, U.r * 1.5 * pr, 0, TAU); g.fill(); }
    const sg2 = g.createRadialGradient(-10, -12, 4, 0, 0, U.r); sg2.addColorStop(0, '#6a665e'); sg2.addColorStop(1, '#25231f');
    g.fillStyle = sg2; g.beginPath(); g.arc(0, 0, U.r, 0, TAU); g.fill();
    g.strokeStyle = full ? '#f6d77a' : '#14120f'; g.lineWidth = full ? 3 : 2; g.stroke();
    const ir = U.r - 9;
    g.save(); g.beginPath(); g.arc(0, 0, ir, 0, TAU); g.clip();
    g.fillStyle = '#4a463f'; g.fillRect(-ir, -ir, ir * 2, ir * 2);
    const lvl = ir - (S.ult / 100) * ir * 2;
    g.fillStyle = '#0d0b09'; g.beginPath(); g.moveTo(-ir, lvl);
    for (let x = -ir; x <= ir; x += 6) g.lineTo(x, lvl + Math.sin(x * 0.2 + T * 3) * 1.6);
    g.lineTo(ir, ir); g.lineTo(-ir, ir); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.1)'; g.beginPath(); g.ellipse(-8, lvl + 6, 12, 3, -0.2, 0, TAU); g.fill();
    g.restore();
    g.save(); g.rotate(-0.75);
    g.fillStyle = '#c9a46a'; g.fillRect(-4, -U.r - 16, 8, U.r * 0.95);
    g.fillStyle = '#7a1c1c'; g.fillRect(-4.5, -U.r - 16, 9, 6);
    g.fillStyle = '#14110d'; g.beginPath(); g.moveTo(-5, -U.r * 0.05 - 16); g.quadraticCurveTo(0, -U.r * 0.05 + 6, 5, -U.r * 0.05 - 16); g.fill();
    g.restore();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (full) { g.fillStyle = '#f6d77a'; g.font = `900 22px ${KAI}`; g.fillText('挥毫', 0, 4); }
    else { g.fillStyle = 'rgba(243,234,214,.85)'; g.font = `900 13px ${KAI}`; g.fillText('墨', 0, -6); g.font = `800 12px ${SANS}`; g.fillText(`${Math.floor(S.ult)}%`, 0, 10); }
    g.restore();
  }
  function actRects(act, dg) {
    if (!act) return [];
    const rc = (r, c, span, dir) => { const [x, y] = cellXY(r, c); return { x, y, w: span === 2 && dir === 'h' ? CS * 2 + GAP : CS, h: span === 2 && dir === 'v' ? CS * 2 + GAP : CS }; };
    if (act.k === 'merge' || act.k === 'swap') return [uRect(act.t)];
    if (act.k === 'combo') return [rc(act.r, act.c, 2, act.dir)];
    if (act.k === 'move') return [rc(act.r, act.c, 2, act.dir || dg.unit.dir)];
    return [rc(act.r, act.c, 1)];
  }
  function dragPoint() { return [drag.x, drag.y - (drag.touch ? 30 : 0)]; }
  function drawDrag(g, T) {
    if (!drag || !drag.moved) return;
    const [px, py] = dragPoint();
    const cell = cellAt(px, py);
    const act = cell ? evalDrop(drag, cell[0], cell[1]) : null;
    if (act) {
      const col = act.k === 'combo' ? '#d9a21b' : act.k === 'merge' ? '#2e8b4f' : act.k === 'swap' ? '#6a5a4a' : '#1d1a16';
      for (const R of actRects(act, drag)) {
        g.fillStyle = col + '33'; rr(g, R.x - 3, R.y - 3, R.w + 6, R.h + 6, 9); g.fill();
        g.strokeStyle = col; g.lineWidth = 3; g.stroke();
        if (act.k === 'place' || act.k === 'move') {
          const rg = act.k === 'move' ? rangeOf(drag.unit) : (DEF[drag.type].range || 0) + ((drag.unit ? drag.unit.stars : 1) - 1) * 6;
          if (rg && rg < 500) { g.setLineDash([6, 5]); g.strokeStyle = 'rgba(179,38,30,.5)'; g.lineWidth = 1.5; g.beginPath(); g.arc(R.x + R.w / 2, R.y + R.h / 2, rg, 0, TAU); g.stroke(); g.setLineDash([]); }
        }
        if (act.label) {
          g.font = `900 16px ${KAI}`; const w = g.measureText(act.label).width + 22;
          const lx = clamp(R.x + R.w / 2, w / 2 + 4, VW - w / 2 - 4), ly = R.y - 16;
          g.fillStyle = col; rr(g, lx - w / 2, ly - 12, w, 24, 12); g.fill();
          g.fillStyle = '#fff6e2'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(act.label, lx, ly + 1);
        }
      }
    }
    const u = drag.unit;
    g.globalAlpha = 0.92;
    if (u && u.span === 2) { const w = u.dir === 'h' ? CS * 2 + GAP : CS, h = u.dir === 'v' ? CS * 2 + GAP : CS; blitTile(g, u.type, u.stars, px - CS / 2, py - CS / 2, w, h, u.dir, false); }
    else if (u) blitTile(g, u.type, u.stars, px - CS / 2, py - CS / 2, CS, CS, 'h', false);
    else { g.save(); g.translate(px, py); g.scale(0.9, 0.9); blitTile(g, drag.type, 1, -CW / 2, -CH / 2, CW, CH, 'h', true); g.restore(); }
    g.globalAlpha = 1;
  }
  function drawTutorial(g, T) {
    if (mode !== 'play' || S.formedAny || S.wave > 2 || drag || brush || S.auto) return;
    const hi = hand.findIndex((c) => c && c.type === 'zhong');
    const hu = units.find((u) => u.type === 'huang');
    if (hi < 0 || !hu) return;
    let tr = hu.r, tc = hu.c + 1;
    if (!inB(tr, tc) || board[tr][tc]) { tr = hu.r + 1; tc = hu.c; if (!inB(tr, tc) || board[tr][tc]) return; }
    const [cx, cy] = cellXY(tr, tc);
    const sx = HX + hi * (CW + CGAP) + CW / 2, sy = HY + CH / 2, ex = cx + CS / 2, ey = cy + CS / 2;
    const ph = (T % 2.4) / 2.4, q = ph < 0.15 ? 0 : ph > 0.8 ? 1 : (ph - 0.15) / 0.65, e = q * q * (3 - 2 * q);
    const x = lerp(sx, ex, e), y = lerp(sy, ey, e);
    const a = ph > 0.9 ? (1 - ph) * 10 : 1;
    g.globalAlpha = a * 0.55; blitTile(g, 'zhong', 1, x - CS / 2, y - CS / 2, CS, CS, 'h', false);
    g.globalAlpha = a;
    g.fillStyle = 'rgba(243,234,214,.95)'; g.strokeStyle = '#1d1a16'; g.lineWidth = 2;
    g.beginPath(); g.arc(x + 10, y + 14, 9, 0, TAU); g.fill(); g.stroke();
    g.globalAlpha = 1;
    g.setLineDash([5, 4]); g.strokeStyle = '#d9a21b'; g.lineWidth = 2.5; rr(g, cx - 2, cy - 2, CS + 4, CS + 4, 8); g.stroke(); g.setLineDash([]);
    const tx = ' 把「忠」拖到「黄」旁边 · 拼出黄忠 ';
    g.font = `900 15px ${KAI}`; const w = g.measureText(tx).width + 16;
    g.fillStyle = 'rgba(28,24,18,.9)'; rr(g, VW / 2 - w / 2, 414, w, 28, 14); g.fill();
    g.fillStyle = '#f6d77a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tx, VW / 2, 429);
  }
  function drawBrushUI(g, T) {
    g.fillStyle = 'rgba(235,225,200,.16)'; g.fillRect(0, 0, VW, FIELD_H);
    const vg = g.createRadialGradient(VW / 2, FIELD_H / 2, 140, VW / 2, FIELD_H / 2, 420); vg.addColorStop(0, 'rgba(20,17,13,0)'); vg.addColorStop(1, 'rgba(20,17,13,.45)');
    g.fillStyle = vg; g.fillRect(0, 0, VW, FIELD_H);
    drawStroke(g, brush.pts, -1);
    g.drawImage(BAND, 0, 60, VW, 64);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#f6d77a'; g.font = `900 22px ${KAI}`; g.fillText('挥 毫', VW / 2, 84);
    g.fillStyle = '#e9dfc8'; g.font = `12px ${SANS}`;
    const left = brush.down ? Math.max(0, 2.6 - (brush.real - brush.t0)) : Math.max(0, 4.5 - brush.real);
    g.fillText(brush.down ? `一笔到底，松手落墨 · 墨还剩 ${Math.max(0, Math.round(100 - brush.len / 11.5))}%` : `按住在战场上划一笔 · ${left.toFixed(1)} 秒后自动落笔`, VW / 2, 106);
  }
  function drawBanner(g) {
    const b = banners[0]; if (!b) return;
    const p = b.life / b.max, inn = clamp(p / 0.14, 0, 1), out = clamp((1 - p) / 0.16, 0, 1), a = Math.min(inn, out);
    const y = 292, e = 1 - Math.pow(1 - inn, 3);
    g.save(); g.globalAlpha = a;
    g.beginPath(); g.rect(0, y - 60, VW * e, 120); g.clip();
    g.drawImage(BAND, 0, y - 55, VW, 110);
    g.restore();
    g.save(); g.globalAlpha = a;
    const sc = 1 + (1 - e) * 0.4;
    g.translate(VW / 2, y - 4); g.scale(sc, sc);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `900 ${b.big ? 46 : 40}px ${KAI}`;
    g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,.6)'; g.strokeText(b.text, 0, 0);
    g.fillStyle = b.col; g.fillText(b.text, 0, 0);
    const tw = g.measureText(b.text).width;
    g.save(); g.translate(tw / 2 + 20, -8); g.rotate(0.08);
    g.fillStyle = '#b3261e'; rr(g, -11, -11, 22, 22, 3); g.fill();
    g.fillStyle = '#fff0dc'; g.font = `900 14px ${KAI}`; g.fillText('令', 0, 1);
    g.restore();
    if (b.sub) { g.font = `700 13px ${SANS}`; g.fillStyle = '#e9dfc8'; g.fillText(b.sub, 0, 32); }
    g.restore();
  }

  /* ================= 顶栏 ================= */
  const H = { wave: $('hWave'), sub: $('hSub'), hp: $('hHp'), coin: $('hCoinN'), coinBox: $('hCoin') };
  const lastH = {};
  function setText(el, k, v) { if (lastH[k] !== v) { lastH[k] = v; el.textContent = v; } }
  function hud() {
    if (!S || (mode !== 'play' && mode !== 'pause' && mode !== 'book')) return;
    setText(H.wave, 'w', S.wave ? `第${NUM[S.wave]}波 / 十二` : '备 战');
    const left = enemies.length + S.queue.length;
    setText(H.sub, 's', S.waveState === 'inter' ? `下一波 ${Math.ceil(S.interT)} 秒后来袭` : `敌军还剩 ${left}`);
    const hpKey = S.hp + '|' + S.maxHp;
    if (lastH.hp !== hpKey) {
      const prev = lastH.hpN == null ? S.hp : lastH.hpN;
      lastH.hp = hpKey; lastH.hpN = S.hp;
      let s = '营&nbsp;'; for (let i = 0; i < S.maxHp; i++) s += `<i class="${i < S.hp ? '' : 'x'}${i >= S.hp && i < prev ? ' hit' : ''}"></i>`;
      H.hp.innerHTML = s;
    }
    setText(H.coin, 'c', String(S.coins));
    if (coinBump) { coinBump = 0; H.coinBox.classList.remove('bump'); void H.coinBox.offsetWidth; H.coinBox.classList.add('bump'); }
  }

  /* ================= 开局、结束、标题 ================= */
  const best = () => { try { return +localStorage.getItem('echo_mozi_best') || 0; } catch (e) { return 0; } };
  function showTitle() {
    mode = 'title';
    $('hud').classList.remove('on');
    const b = best();
    $('screen').innerHTML = `<div class="tag">回声游戏厅 · 第 17 期</div>
      <h1 class="kai">墨字守营</h1>
      <div class="seal kai">拼字点将</div>
      <div class="sub">敌军沿着山道杀向大营。把手里的字摆上棋盘，<br>拼出「黄忠」「关羽」……名字一成，武将上阵。</div>
      <div class="help">
        <b>拖字上盘</b>：字兵自己开打，弓射、刀砍、毒雾、投石<br>
        <b>拼名召将</b>：横排从左往右，竖排从上往下<br>
        <b>同字相叠</b>：拖到一起合成升星，武将五星觉醒<br>
        <b>征兵</b>：花银两换一手新字，越征越贵；拖到右下角遣散<br>
        <b>挥毫</b>：砚台墨满，在战场上一笔划过敌阵<br>
        守住十二波，别让大营被攻破
      </div>
      ${b ? `<div class="best">最高战功 <b>${b.toLocaleString()}</b></div>` : ''}
      <div><button class="go kai" id="goBtn">开 营</button><button class="go s kai" id="bookBtn">名录</button></div>`;
    $('screen').classList.add('on');
    $('goBtn').addEventListener('click', (e) => { e.stopPropagation(); start(); });
    $('bookBtn').addEventListener('click', (e) => { e.stopPropagation(); openBook(); });
  }
  function start() {
    auInit();
    newRun();
    mode = 'play'; last = performance.now();
    ['screen', 'pause', 'book'].forEach((id) => $(id).classList.remove('on'));
    $('hud').classList.add('on');
    Object.keys(lastH).forEach((k) => delete lastH[k]);
    S.speed = 1; $('bSpeed').textContent = 'x1'; $('bSpeed').classList.remove('on');
    toast('第一波 12 秒后来袭，先把字摆好', '#1d1a16');
    if (!window.__noHub) try { const hh = JSON.parse(localStorage.getItem('echo_hub')) || {}, d = new Date(), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); (hh.days = hh.days || {})[k] = 'mozi'; (hh.played = hh.played || {}).mozi = k; hh.last = 'mozi'; localStorage.setItem('echo_hub', JSON.stringify(hh)); } catch (e) { /* 存不了就算了 */ }
  }
  function scoreOf() { return S.kills * 10 + S.cleared * 500 + S.formed * 200 + S.awakened * 500 + (S.won ? 6000 + S.hp * 400 : 0); }
  function rankOf(sc, won) {
    if (won) return sc > 24000 ? '一代名将' : sc > 21500 ? '镇守大将' : '守营校尉';
    return sc > 10000 ? '差一口气' : sc > 5000 ? '小有战功' : '新兵上阵';
  }
  function lose() { finish(false); }
  function win() { finish(true); }
  function finish(won) {
    if (mode === 'over') return;
    mode = 'over'; S.won = won; brush = null; drag = null;
    const sc = scoreOf(); S.score = sc;
    const b = best(), nb = sc > b;
    if (nb && !window.__noHub) try { localStorage.setItem('echo_mozi_best', String(sc)); } catch (e) { /* 存不了就算了 */ }
    if (won) sfx.win(); else { sfx.lose(); }
    const heroes = units.filter((u) => HERO[u.type]).map((u) => `${HERO[u.type].name}${u.stars}★`).join('　') || '无';
    setTimeout(() => {
      $('hud').classList.remove('on');
      $('screen').innerHTML = `<div class="tag">${won ? '十二波 · 全部守住' : '大营失守'}</div>
        <h1 class="kai" style="font-size:${won ? 56 : 50}px">${won ? '营 门 不 破' : '兵 败 山 道'}</h1>
        <div class="sub">${won ? '墨魔伏诛，山道上只剩一地墨迹。' : `撑到了第${NUM[Math.max(1, S.wave)]}波，差一点就守住了。`}</div>
        <div class="big">${sc.toLocaleString()}</div>
        <div class="rank kai">${rankOf(sc, won)}${nb ? ' · 新纪录' : ''}</div>
        <table>
          <tr><td>守住波次</td><td>${S.cleared} / ${TOTAL}</td></tr>
          <tr><td>斩敌</td><td>${S.kills}</td></tr>
          <tr><td>召唤武将</td><td>${S.formed} 次</td></tr>
          <tr><td>满星觉醒</td><td>${S.awakened} 次</td></tr>
          <tr><td>大营余血</td><td>${S.hp} / ${S.maxHp}</td></tr>
        </table>
        <div class="sub" style="margin:8px 0 0;font-size:13px">阵中武将：${heroes}</div>
        <div><button class="go kai" id="goBtn">再守一回</button></div>`;
      $('screen').classList.add('on');
      $('goBtn').addEventListener('click', (e) => { e.stopPropagation(); start(); });
    }, won ? 1800 : 1200);
  }
  function pause(on) {
    if (on && mode === 'play') { mode = 'pause'; $('pause').classList.add('on'); }
    else if (!on && mode === 'pause') { mode = 'play'; $('pause').classList.remove('on'); last = performance.now(); }
  }
  let bookFrom = 'title';
  function openBook() {
    if (mode === 'play') { bookFrom = 'play'; mode = 'book'; } else bookFrom = mode;
    const un = S && bookFrom === 'play' ? S.unlocked : 99;
    let h = `<h2 class="kai">名 录</h2><div class="tip">把两个字按顺序摆在相邻格：横排左→右，竖排上→下</div>`;
    for (const x of HEROES) {
      const lock = HEROES.indexOf(x) >= un;
      h += `<div class="hero${lock ? ' lock' : ''}"><div class="nm kai">${x.ca}${x.cb}</div><div><h4 class="kai">${x.skill}<small>${lock ? `第${NUM[x.wave]}波解锁` : `五星觉醒：${x.awake}`}</small></h4><p>${x.desc}</p></div></div>`;
    }
    h += '<div class="units">';
    for (const t of BASE_TYPES) { const d = DEF[t]; h += `<div><b class="kai" style="color:${d.ink}">${d.ch}</b><span><strong>${d.name}</strong> ${d.desc}</span></div>`; }
    h += '</div><div class="tip" style="margin-top:10px">敌军：兵、快马、持盾（普通伤害减半）、巫医（给周围回血）、将，第六波敌帅、第十二波墨魔</div>';
    h += '<button class="go s kai close" id="bookClose">合上</button>';
    $('bookPg').innerHTML = h;
    $('book').classList.add('on');
    $('bookClose').addEventListener('click', closeBook);
  }
  function closeBook() { $('book').classList.remove('on'); if (mode === 'book') { mode = 'play'; last = performance.now(); } }

  /* ================= 输入 ================= */
  function toLogic(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * VW, (e.clientY - r.top) / r.height * VH]; }
  cv.addEventListener('pointerdown', (e) => {
    auInit();
    if (mode !== 'play') return;
    const [x, y] = toLogic(e);
    try { cv.setPointerCapture(e.pointerId); } catch (er) { /* 无所谓 */ }
    if (brush) { if (y < FIELD_H) { brush.down = true; brush.t0 = brush.real; brushAdd(x, y); } return; }
    if (Math.hypot(x - ULT.x, y - ULT.y) <= ULT.r + 6) { if (!startBrush()) { toast(`墨还没研好（${Math.floor(S.ult)}%）· 多斩敌`, '#1d1a16'); sfx.deny(); } return; }
    if (inRect(x, y, BTN_REC)) { recruit(); return; }
    if (S.waveState === 'inter' && inRect(x, y, BTN_EARLY)) { callEarly(); return; }
    const touch = e.pointerType === 'touch';
    for (let i = 0; i < HAND_N; i++) {
      const c = hand[i]; if (!c) continue;
      const hx = HX + i * (CW + CGAP);
      if (x >= hx && x <= hx + CW && y >= HY && y <= HY + CH) { drag = { from: 'hand', idx: i, type: c.type, unit: null, x, y, sx: x, sy: y, moved: false, touch }; sfx.pick(); return; }
    }
    const cell = cellAt(x, y);
    if (cell) {
      const u = board[cell[0]][cell[1]];
      if (u) {
        if (u.inked > 0) { cleanInk(u); return; }
        drag = { from: 'board', type: u.type, unit: u, x, y, sx: x, sy: y, moved: false, touch }; return;
      }
    }
    info = null;
  });
  cv.addEventListener('pointermove', (e) => {
    if (mode !== 'play') return;
    const [x, y] = toLogic(e);
    if (brush) { if (brush.down) brushAdd(x, y); return; }
    if (!drag) return;
    drag.x = x; drag.y = y;
    if (!drag.moved && Math.hypot(x - drag.sx, y - drag.sy) > 7) { drag.moved = true; info = null; if (drag.from === 'board') sfx.pick(); }
  });
  function up(e) {
    if (mode !== 'play') { drag = null; return; }
    if (brush) { if (brush.down) releaseBrush(); return; }
    if (!drag) return;
    const [x, y] = toLogic(e); drag.x = x; drag.y = y;
    if (!drag.moved) {
      if (drag.from === 'board') { info = info && info.u === drag.unit ? null : { u: drag.unit, t: 2.6 }; sfx.pick(); }
      drag = null; return;
    }
    if (drag.from === 'board' && inRect(x, y, BTN_DIS)) dismiss(drag.unit);
    else {
      const [px, py] = dragPoint(), cell = cellAt(px, py);
      const act = cell ? evalDrop(drag, cell[0], cell[1]) : null;
      if (!execDrop(drag, act) && cell) sfx.deny();
    }
    drag = null;
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  $('bSpeed').addEventListener('click', () => { if (!S) return; S.speed = S.speed === 1 ? 2 : 1; $('bSpeed').textContent = 'x' + S.speed; $('bSpeed').classList.toggle('on', S.speed === 2); });
  function toggleMute() { AU.on = !AU.on; if (AU.out) AU.out.gain.value = AU.on ? 0.9 : 0; if (AU.on) auInit(); $('bMute').classList.toggle('off', !AU.on); $('bMute').textContent = AU.on ? '♪' : '×'; }
  $('bMute').addEventListener('click', toggleMute);
  $('bPause').addEventListener('click', () => pause(true));
  $('bBook').addEventListener('click', () => { if (mode === 'play') openBook(); });
  $('pResume').addEventListener('click', () => pause(false));
  $('pRestart').addEventListener('click', () => start());
  $('pHome').addEventListener('click', () => { location.href = '../'; });
  window.addEventListener('keydown', (e) => {
    auInit();
    if (e.key === 'm' || e.key === 'M') toggleMute();
    if (e.key === ' ') {
      e.preventDefault();
      if (mode === 'play') { if (brush) releaseBrush(); else if (!startBrush()) toast(`墨还没研好（${Math.floor(S.ult)}%）`, '#1d1a16'); }
      else if (mode === 'title' || (mode === 'over' && $('screen').classList.contains('on'))) start();
    }
    if ((e.key === 'r' || e.key === 'R') && mode === 'play') recruit();
    if ((e.key === 'n' || e.key === 'N') && mode === 'play') callEarly();
    if (e.key === 'b' || e.key === 'B') { if (mode === 'book') closeBook(); else if (mode === 'play') openBook(); }
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { if (mode === 'book') closeBook(); else pause(mode === 'play'); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && !window.__noPause) pause(true); });
  window.addEventListener('resize', fit);

  /* ================= 启动 ================= */
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const raw = clamp((now - last) / 1000, 0, 0.1); last = now;
    try {
      if (!window.__freeze) { update(raw); if (S.shake > 0) S.shake = Math.max(0, S.shake - raw * 2.4); }
      music();
      render(now / 1000);
      hud();
    } catch (e) { console.error(e); }
  }
  fit();
  newRun();
  showTitle();
  requestAnimationFrame((n) => { last = n; frame(n); });

  function sim(sec, stp = 1 / 60) {
    window.__sim = 1;
    const n = Math.round(sec / stp);
    for (let i = 0; i < n; i++) { update(stp); S.shake = 0; if (mode !== 'play') break; }
    window.__sim = 0;
  }
  // ?shot：摆一个热闹的画面后定格，给封面截图用
  if (/[?&]shot/.test(location.search)) {
    window.__noHub = window.__noPause = 1;
    document.body.style.display = 'block'; wrap.style.transform = 'none';
    start(); toastT = 0;
    S.unlocked = 5; S.wave = 9; S.waveState = 'spawn'; S.coins = 86; S.hp = 8; S.queue = [];
    units = [];
    const put = (t, r, c, s, dir = 'h') => { const u = mkUnit(t, r, c, s, dir); u.pop = 1; units.push(u); return u; };
    put('hz', 0, 0, 5); put('gy', 0, 2, 4); put('zf', 1, 3, 3, 'v'); put('km', 2, 0, 3); put('gu', 1, 1, 2); put('du', 1, 0, 2); put('pao', 2, 2, 3); put('yi', 1, 2, 1);
    sync();
    hand = ['zhao', 'yun', 'ci', 'gong', 'qi'].map((t) => ({ type: t, a: 1, delay: 0 }));
    const mixes = ['bing', 'bing', 'ma', 'dun', 'bing', 'wu', 'bing', 'jiang', 'bing', 'ma', 'dun', 'bing'];
    for (let i = 0; i < 30; i++) spawnFoe(mixes[i % mixes.length], 120 + i * 32);
    spawnFoe('shuai', 520);
    S.auto = false;
    sim(2.2);
    S.ult = 100; startBrush();
    brush.down = true; brush.real = 0.5; brush.t0 = 0.4;
    for (let d = 330; d < 700; d += 12) { const [x, y, a] = onPath(d); const o = Math.sin(d * 0.03) * 10; brushAdd(x - Math.sin(a) * o, y + Math.cos(a) * o); }
    banners.length = 0; floats.length = 0;
    window.__freeze = true;
  }

  // ?sim=秒：电脑代打推进到某个时刻再交还（调画面用）
  const qs = new URLSearchParams(location.search);
  if (qs.has('sim')) {
    window.__noHub = window.__noPause = 1;
    document.body.style.display = 'block'; wrap.style.transform = 'none';
    start(); S.auto = true; sim(+qs.get('sim') || 60); S.auto = qs.has('auto');
    if (qs.has('ult')) { S.ult = 100; startBrush(); releaseBrush(); }
  }

  // 调试入口：推进时间、让电脑代打、截图
  window.__mozi = {
    get S() { return S; }, get mode() { return mode; }, get units() { return units; }, get hand() { return hand; }, get enemies() { return enemies; },
    start, sim, auto(on = true) { S.auto = on; }, ult() { S.ult = 100; }, coins(n = 100) { S.coins += n; },
    give(t, i = 0) { hand[i] = { type: t, a: 1, delay: 0 }; }, put(t, r, c, s = 1, dir = 'h') { const u = mkUnit(t, r, c, s, dir); units.push(u); sync(); return u; }, clear() { units = []; sync(); },
    wave(n) { S.wave = n - 1; S.unlocked = HEROES.filter((h) => h.wave <= n).length; startWave(n); }, spawn: spawnFoe, startBrush, releaseBrush, banner, toast,
    set hpk(v) { HPK = v; }, HPT, win, lose, hp(v) { S.hp = v; }, score: () => scoreOf(),
    bench(n = 30) { const t0 = performance.now(); for (let i = 0; i < n; i++) render(performance.now() / 1000 + i / 60); return (performance.now() - t0) / n; },
  };
})();
