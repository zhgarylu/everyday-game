// 天师摇人：拉功德机摇出法器，守住结界。玩法逻辑、绘制、声音都在这个文件，素材在 art.js
import { sprite, white, put, KAI, HEI } from './art.js';

const $ = (id) => document.getElementById(id), TAU = Math.PI * 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const cv = $('cv'), g = cv.getContext('2d');
// 战场用固定的逻辑尺寸，屏幕多大都按这个算，手感一致
const FW = 600, FH = 840, COLS = 4, ROWS = 3, CW = 130, CH = 92, GX = (FW - COLS * CW) / 2, BAR = 806, GY = BAR - 16 - ROWS * CH, SPIN_COST = 20, MAXL = 9;
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const SYM = {
  sword: { name: '桃木剑', col: '#00e5ff', w: 22, atk: 20, cd: .5, range: 520, tip: '单体快攻，觉醒后双剑齐发' },
  rice: { name: '糯米炮', col: '#7dff3a', w: 20, atk: 20, cd: 1.15, range: 560, tip: '范围伤害，粘住敌人减速' },
  thunder: { name: '雷公符', col: '#ffd400', w: 18, atk: 22, cd: 1.15, range: 600, tip: '闪电在敌人之间连锁' },
  lion: { name: '镇宅狮', col: '#ff3b5c', w: 18, atk: 26, cd: 1.4, range: 300, tip: '怒吼震退身边的敌人' },
  cat: { name: '招财猫', col: '#ff8ad0', w: 16, atk: 12, cd: .9, range: 520, tip: '每波生 5 次香火' },
  seal: { name: '天师印', col: '#c05cff', w: 7, atk: 80, cd: .95, range: 700, tip: '百搭符号，盖章砸一片' },
  zhongkui: { name: '钟馗', col: '#ffd24a', w: 0, atk: 150, cd: .75, range: 760 },
};
const KEYS = ['sword', 'rice', 'thunder', 'lion', 'cat', 'seal'];
// hop：一跳一跳地走。skill：首领技能
const ENEMY = {
  ghost: { name: '游魂', hp: 70, sp: 62, reward: 6, dmg: 6, r: 24 },
  paper: { name: '纸人', hp: 42, sp: 98, reward: 4, dmg: 4, r: 23 },
  jiangshi: { name: '跳僵', hp: 170, sp: 46, reward: 10, dmg: 10, r: 28, hop: 2.6 },
  maojiang: { name: '毛僵', hp: 330, sp: 52, reward: 14, dmg: 12, r: 29, hop: 2.9 },
  flyer: { name: '飞头蛮', hp: 105, sp: 108, reward: 9, dmg: 8, r: 24 },
  coffin: { name: '铁棺尸', hp: 640, sp: 34, reward: 20, dmg: 18, r: 32, hop: 1.7 },
  wuchang: { name: '白无常', hp: 900, sp: 44, reward: 40, dmg: 20, r: 34, elite: true, skill: 'lock' },
  bride: { name: '鬼新娘', hp: 1300, sp: 30, reward: 60, dmg: 25, r: 38, boss: true, skill: 'summon' },
  hanba: { name: '千年旱魃', hp: 6200, sp: 21, reward: 200, dmg: 100, r: 54, boss: true, final: true, skill: 'both', hop: 1.3 },
};
// 每组：t 种类，n 数量，gap 间隔，at 这一组从第几秒开始出
const WAVES = [
  [{ t: 'ghost', n: 8, gap: 1.2 }],
  [{ t: 'ghost', n: 7, gap: 1.1 }, { t: 'paper', n: 8, gap: .8, at: 3 }],
  [{ t: 'jiangshi', n: 6, gap: 1.5 }, { t: 'ghost', n: 8, gap: 1, at: 2 }],
  [{ t: 'paper', n: 14, gap: .55 }, { t: 'jiangshi', n: 7, gap: 1.4, at: 2 }, { t: 'flyer', n: 5, gap: 1.3, at: 7 }],
  [{ t: 'bride', n: 1, gap: 1, at: 3 }, { t: 'jiangshi', n: 7, gap: 1.5 }, { t: 'ghost', n: 9, gap: 1, at: 5 }],
  [{ t: 'coffin', n: 4, gap: 3 }, { t: 'flyer', n: 11, gap: .9, at: 2 }, { t: 'paper', n: 10, gap: .6, at: 8 }],
  [{ t: 'maojiang', n: 8, gap: 1.5 }, { t: 'paper', n: 16, gap: .5, at: 3 }, { t: 'wuchang', n: 1, gap: 1, at: 6 }],
  [{ t: 'coffin', n: 6, gap: 2.4 }, { t: 'flyer', n: 12, gap: .8, at: 2 }, { t: 'wuchang', n: 2, gap: 6, at: 5 }, { t: 'maojiang', n: 6, gap: 1.6, at: 8 }],
  [{ t: 'bride', n: 2, gap: 9, at: 2 }, { t: 'maojiang', n: 10, gap: 1.3 }, { t: 'coffin', n: 5, gap: 2.6, at: 4 }, { t: 'paper', n: 16, gap: .5, at: 6 }],
  [{ t: 'hanba', n: 1, gap: 1, at: 4 }, { t: 'maojiang', n: 10, gap: 1.6 }, { t: 'wuchang', n: 2, gap: 9, at: 8 }, { t: 'flyer', n: 14, gap: .9, at: 5 }, { t: 'coffin', n: 4, gap: 3.5, at: 10 }],
];
const K = { hp: 1.5, grow: .4, exp: 1.3, pay: .45, layer: 1.35 }; // 调难度用的旋钮
const HPS = (w) => K.hp * (1 + (w - 1) * K.grow) * K.exp ** (w - 1);
const RELICS = [
  { id: 'thunder', name: '天雷灌顶', tag: '改盘面', max: 2, desc: '转轴上的雷公符变多，雷公符伤害 +30%，多连锁 1 个敌人。', apply: (s) => { s.w.thunder += 14; s.mod.thunder *= 1.3; s.mod.chain++; } },
  { id: 'sword', name: '七星剑阵', tag: '改盘面', max: 2, desc: '转轴上的桃木剑变多，桃木剑出手快 20%。', apply: (s) => { s.w.sword += 14; s.mod.swordCd *= .8; } },
  { id: 'rice', name: '糯米加量', tag: '改盘面', max: 2, desc: '转轴上的糯米炮变多，溅射范围 +30%，粘得更牢。', apply: (s) => { s.w.rice += 14; s.mod.splash *= 1.3; s.mod.slow = Math.max(.35, s.mod.slow - .12); } },
  { id: 'lion', name: '石狮开光', tag: '改盘面', max: 2, desc: '转轴上的镇宅狮变多，怒吼范围 +25%，震得更远。', apply: (s) => { s.w.lion += 14; s.mod.lionR *= 1.25; s.mod.knock *= 1.3; } },
  { id: 'cat', name: '财源广进', tag: '经济', max: 2, desc: '转轴上的招财猫变多，立刻到手 60 香火。', apply: (s) => { s.w.cat += 12; s.gold += 60; } },
  { id: 'seal', name: '金印加持', tag: '欧皇', max: 1, desc: '转轴上的天师印多一倍，立刻送 2 次免费摇人。', apply: (s) => { s.w.seal += 7; s.free += 2; } },
  { id: 'lucky', name: '双倍天运', tag: '必中', max: 9, desc: '接下来 3 次摇人必中一条线。', apply: (s) => { s.lucky += 3; } },
  { id: 'heal', name: '功德修复', tag: '防守', max: 9, desc: '结界回复 35%，全体法器伤害 +20%。', apply: (s) => { s.hp = Math.min(s.maxHp, s.hp + Math.round(s.maxHp * .35)); s.mod.all *= 1.2; } },
  { id: 'wall', name: '结界加固', tag: '防守', max: 2, desc: '结界上限 +40，并回复 40。', apply: (s) => { s.maxHp += 40; s.hp = Math.min(s.maxHp, s.hp + 40); } },
  { id: 'merge', name: '炼化返利', tag: '改规则', max: 1, desc: '此后每次手动炼化，返还 8 香火。', apply: (s) => { s.mod.mergeSpin = true; } },
  { id: 'reward', name: '香火鼎盛', tag: '经济', max: 1, desc: '此后击杀妖怪得到的香火 +40%。', apply: (s) => { s.mod.reward *= 1.4; } },
  { id: 'refund', name: '贼不走空', tag: '改规则', max: 1, desc: '没连上线时返还的香火从 5 提到 12。', apply: (s) => { s.mod.refund = 12; } },
];
const RANKS = [[33500, '镇妖天师'], [28000, '正一道长'], [15000, '持符道士'], [6000, '看坛道童'], [0, '上香香客']];

let state = 'title', muted = false, simming = false, best = 0, L = null, bgc = null, S = null;
try { best = +localStorage.getItem('echo_merit_best') || 0; } catch (e) { /* 存不了就算了 */ }
const R = Math.random;
function fresh() {
  return { wave: 0, active: false, won: false, hp: 100, maxHp: 100, gold: 100, free: 1, lucky: 0, speed: 1, auto: false, time: 0, score: 0, miss: 0,
    reels: ['sword', 'rice', 'thunder', 'lion', 'seal', 'cat', 'thunder', 'rice', 'sword'], lock: Array(9).fill(0), pop: Array(9).fill(0),
    w: Object.fromEntries(KEYS.map((k) => [k, SYM[k].w])), mod: { all: 1, thunder: 1, chain: 0, swordCd: 1, splash: 1, slow: .6, lionR: 1, knock: 1, reward: 1, refund: 5, mergeSpin: false },
    units: Array(COLS * ROWS).fill(null), enemies: [], shots: [], queue: [], qt: 0, pending: [], parts: [], rings: [], texts: [], bolts: [], corpses: [], decals: [], comets: [],
    spin: null, win: null, shake: 0, hurt: 0, sel: -1, drag: -1, dx: 0, dy: 0, cut: 0, relics: {}, choice: null, lowSaid: false,
    stats: { spins: 0, merges: 0, kills: 0, maxDmg: 0, lines: 0 } };
}
S = fresh();

/* ---------------- 声音 ---------------- */
const AC = window.AudioContext || window.webkitAudioContext; let ac = null, master = null, nextBeat = 0, beat = 0; const lastSfx = {};
function audio() { if (!ac && AC) { ac = new AC(); master = ac.createGain(); master.gain.value = muted ? 0 : .9; master.connect(ac.destination); } if (ac && ac.state === 'suspended') ac.resume(); }
function tone(f1, f2, dur, type = 'sine', vol = .1, delay = 0) { if (!ac || simming) return; const t = ac.currentTime + delay, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f1, t); if (f2 !== f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur); gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(gn); gn.connect(master); o.start(t); o.stop(t + dur + .02); }
let nbuf = null;
function noise(dur, vol, freq, q = 1, delay = 0) { if (!ac || simming) return; if (!nbuf) { nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; } const t = ac.currentTime + delay, s = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain(); s.buffer = nbuf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.001, t + dur); s.connect(f); f.connect(gn); gn.connect(master); s.start(t, R() * .5, dur + .05); }
const rate = (k, ms) => { const n = performance.now(); if (n - (lastSfx[k] || 0) < ms) return false; lastSfx[k] = n; return true; };
const sfx = {
  wood: (p = 1) => { tone(430 * p, 250 * p, .09, 'triangle', .2); noise(.04, .12, 1800 * p, 3); },
  pull: () => { tone(160, 520, .22, 'sawtooth', .07); noise(.25, .08, 900, .8); },
  stop: (c) => sfx.wood(.9 + c * .16),
  win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f * 1.01, .18, 'triangle', .13, i * .06)),
  jackpot: () => { [262, 330, 392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f * 1.03, .5, 'sawtooth', .06, i * .05)); tone(90, 40, .7, 'sine', .3); noise(.8, .2, 400, .5); },
  zap: () => { if (rate('zap', 60)) { tone(1500, 240, .1, 'sawtooth', .045); noise(.08, .08, 3200, 2); } },
  thud: () => { if (rate('thud', 80)) { tone(150, 40, .24, 'sine', .22); noise(.12, .1, 240, 1); } },
  coin: () => { if (rate('coin', 55)) tone(1320, 1860, .08, 'sine', .06); },
  hit: () => { if (rate('hit', 45)) noise(.05, .06, 1400, 2); },
  merge: () => { tone(240, 900, .26, 'triangle', .14); tone(900, 1400, .2, 'sine', .1, .12); },
  awake: () => { [392, 523, 659, 784, 1046, 1568].forEach((f, i) => tone(f, f, .3, 'triangle', .1, i * .05)); noise(.5, .1, 2600, 1); },
  deny: () => tone(190, 90, .2, 'sawtooth', .12),
  hurt: () => { tone(120, 50, .3, 'square', .14); noise(.2, .16, 300, .7); },
  lock: () => { tone(300, 80, .3, 'sawtooth', .12); tone(420, 110, .3, 'square', .06, .05); },
  boss: () => { tone(70, 50, 1.2, 'sawtooth', .16); tone(105, 74, 1.2, 'sawtooth', .1, .1); noise(1, .12, 200, .5); },
  over: (ok) => (ok ? [523, 659, 784, 1046, 1318] : [392, 349, 311, 262, 196]).forEach((f, i) => tone(f, f, .5, 'triangle', .13, i * .16)),
};
// 背景：木鱼打点 + 五声音阶的拨弦
const TUNE = [0, null, 7, null, 5, null, 3, 5, 0, null, 10, null, 7, 5, 3, null, 0, null, 3, null, 5, 7, 5, null, 3, null, 0, null, -2, null, 0, null];
function music() { if (!ac || state !== 'play' || muted) { nextBeat = 0; return; } if (!nextBeat) nextBeat = ac.currentTime + .1; const step = S.active ? .21 : .27; while (nextBeat < ac.currentTime + .15) { const d = nextBeat - ac.currentTime, n = TUNE[beat % TUNE.length]; if (n !== null) { const f = 220 * 2 ** (n / 12); tone(f, f, .5, 'triangle', .035, d); tone(f * 2, f * 2, .2, 'sine', .012, d); } if (beat % 4 === 0) { tone(430, 260, .07, 'triangle', .05, d); } if (beat % 8 === 0) tone(55, 55, .9, 'sine', .07, d); beat++; nextBeat += step; } }
const clips = {}, sayLast = {}; let sayBusy = 0;
fetch('voice/index.json').then((r) => r.json()).then((idx) => { for (const t in idx) clips[t] = { id: idx[t].id || idx[t] }; }).catch(() => {});
function say(text, gap = 0) { if (!ac || muted || simming) return; const c = clips[text], now = performance.now(); if (!c || now < sayBusy || (gap && now - (sayLast[text] || 0) < gap)) return; sayLast[text] = now; sayBusy = now + 1100;
  (c.buf ? Promise.resolve(c.buf) : fetch('voice/' + c.id + '.mp3').then((r) => r.arrayBuffer()).then((a) => ac.decodeAudioData(a)).then((b) => (c.buf = b))).then((b) => { const s = ac.createBufferSource(), gn = ac.createGain(); s.buffer = b; gn.gain.value = 1.15; s.connect(gn); gn.connect(master); s.start(); }).catch(() => {}); }

/* ---------------- 小工具 ---------------- */
const slotPos = (i) => ({ x: GX + (i % COLS + .5) * CW, y: GY + (Math.floor(i / COLS) + .5) * CH });
const hitSlot = (x, y) => (x < GX || x >= GX + COLS * CW || y < GY || y >= GY + ROWS * CH) ? -1 : Math.floor((y - GY) / CH) * COLS + Math.floor((x - GX) / CW);
const wild = (u) => u.type === 'seal' || u.type === 'zhongkui';
const canMerge = (a, b) => a && b && a !== b && b.layers < MAXL && (a.type === b.type || wild(a) || wild(b));
const atkOf = (u) => SYM[u.type].atk * K.layer ** u.layers * S.mod.all * (u.type === 'thunder' ? S.mod.thunder : 1);
const cdOf = (u) => SYM[u.type].cd * (u.awake ? .62 : 1) * (u.type === 'sword' ? S.mod.swordCd : 1);
function pick() { let tot = 0; for (const k of KEYS) tot += S.w[k]; let r = R() * tot; for (const k of KEYS) { r -= S.w[k]; if (r <= 0) return k; } return 'sword'; }
function status(t) { if (!simming) $('status').textContent = t; }
let banT = 0;
function banner(t, ms = 2200) { if (simming) return; const el = $('banner'); el.textContent = t; el.style.opacity = 1; clearTimeout(banT); banT = setTimeout(() => (el.style.opacity = 0), ms); }
function burst(x, y, col, n = 10, sp = 150, kind = 0) { if (simming) return; for (let i = 0; i < n; i++) { const a = R() * TAU, v = sp * (.3 + R() * .8); S.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (kind ? 40 : 0), col, size: 2 + R() * 4, life: 0, max: .35 + R() * .4, kind, rot: R() * 6 }); } if (S.parts.length > 500) S.parts.splice(0, S.parts.length - 500); }
function ring(x, y, r, col, max = .3, w = 4) { if (!simming) S.rings.push({ x, y, r, col, life: 0, max, w }); }
function text(x, y, t, col, size = 15) { if (simming) return; S.texts.push({ x, y, t, col, size, life: 0, max: .8 }); if (S.texts.length > 70) S.texts.shift(); }

/* ---------------- 摇人 ---------------- */
function spin(force) {
  if (state !== 'play' || S.spin || S.choice) return false;
  if (!force) { if (S.free > 0) S.free--; else if (S.gold >= SPIN_COST) S.gold -= SPIN_COST; else { status('香火不够！打妖怪或等招财猫生财'); sfx.deny(); say('香火不够啦', 9000); return false; } }
  S.stats.spins++; S.win = null;
  const tg = S.reels.map((r, i) => (S.lock[i] > 0 ? r : pick()));
  if (force) tg[3] = tg[4] = tg[5] = 'seal';
  else if (S.lucky > 0) { S.lucky--; const sym = pick(), ln = LINES[Math.floor(R() * 8)]; ln.forEach((i) => { if (S.lock[i] <= 0) tg[i] = sym; }); }
  S.spin = { t: 0, tg, stop: [.4, .62, .86], done: [false, false, false] }; status('八卦转轴急转中……'); sfx.pull(); hud(); return true;
}
function evaluate() {
  const wins = [];
  for (const ln of LINES) { const sy = ln.map((i) => S.reels[i]), nw = sy.filter((s) => s !== 'seal'); if (!nw.length) wins.push({ ln, type: 'zhongkui', jp: true }); else if (nw.every((s) => s === nw[0])) wins.push({ ln, type: nw[0] }); }
  if (!wins.length) { S.gold += S.mod.refund; S.miss++; status(`没连上，返还 ${S.mod.refund} 香火`); if (S.miss >= 4) { say('又没中', 12000); S.miss = 0; } return; }
  S.miss = 0; S.win = { wins, t: 0 }; S.stats.lines += wins.length;
  const bonus = wins.length >= 2 ? 1 : 0;
  for (const w of wins) summon(w.type, bonus, w.ln[1]);
  if (wins.some((w) => w.jp)) jackpot();
  else { sfx.win(); S.shake = 6; status(wins.length > 1 ? `连中 ${wins.length} 条线！法器自带 1 层` : `连上了！请出【${SYM[wins[0].type].name}】`); say('中了中了', 8000); }
}
function jackpot() {
  sfx.jackpot(); S.shake = 18; S.cut = 1.5; banner('天师降临！钟馗清场！', 2800); status('三印连珠！钟馗到！'); say('天师来啦');
  for (const e of S.enemies.slice()) damage(e, e.def.boss ? e.max * .15 + 200 : e.max * .6 + 200, '#ffd24a');
  ring(FW / 2, FH / 2, 700, '#ffd24a', .7, 10);
}
function summon(type, bonus, cell) {
  const free = []; S.units.forEach((u, i) => { if (!u) free.push(i); });
  if (free.length) {
    const front = free.filter((i) => i < COLS), back = free.filter((i) => i >= COLS), pool = type === 'lion' ? (front.length ? front : free) : (back.length ? back : free), idx = pool[Math.floor(R() * pool.length)];
    const u = { type, layers: 0, awake: false, timer: .35, goldT: 0, goldN: 0, pop: 0, fire: 0 }; S.units[idx] = u; const p = slotPos(idx);
    if (!simming && cell !== undefined && L) { const c = cellPos(cell); S.comets.push({ x0: c.x, y0: c.y, x1: L.ox + p.x * L.s, y1: L.oy + p.y * L.s, t: 0, col: SYM[type].col }); }
    burst(p.x, p.y, SYM[type].col, 18);
    if (bonus) layerUp(u, idx, bonus);
    return;
  }
  let ti = -1; S.units.forEach((u, i) => { if (u.layers < MAXL && (u.type === type || wild({ type })) && (ti < 0 || u.layers > S.units[ti].layers)) ti = i; });
  if (ti >= 0) { layerUp(S.units[ti], ti, 1 + bonus); const p = slotPos(ti); text(p.x, p.y - 44, '阵满，自动炼化', '#ffd24a'); }
  else { S.gold += 6; text(FW / 2, GY - 20, `阵地满了，【${SYM[type].name}】化作 6 香火`, '#ffd24a'); }
}
function layerUp(u, idx, n) {
  u.layers = Math.min(MAXL, u.layers + n); u.pop = 1.5; const p = slotPos(idx); burst(p.x, p.y, '#ffd24a', 22); ring(p.x, p.y, 70, '#ffd24a'); sfx.merge();
  if (!u.awake && u.layers >= 3) { u.awake = true; S.shake = 10; banner(`【${SYM[u.type].name}】渡劫觉醒！`); burst(p.x, p.y, '#7df0ff', 34, 240); ring(p.x, p.y, 140, '#7df0ff', .5, 6); sfx.awake(); say('渡劫成功', 5000); }
}
function merge(from, to) {
  const a = S.units[from], b = S.units[to]; if (!canMerge(a, b)) return false;
  S.units[from] = null; S.stats.merges++; layerUp(b, to, 1 + a.layers + (a.type === 'zhongkui' ? 1 : 0));
  // 被百搭吃掉的话，留下来的还是原来那个；百搭吃别人，自己升层
  const p = slotPos(to);
  if (S.mod.mergeSpin) { S.gold += 8; text(p.x, p.y - 46, '炼化返利 +8 香火', '#7df0ff'); } else text(p.x, p.y - 46, `炼化成功 ${b.layers} 层`, '#ffd24a');
  if (!simming) $('tip').style.display = 'none'; hud(); return true;
}

/* ---------------- 波次、战斗 ---------------- */
function startWave() {
  if (state !== 'play' || S.active || S.choice || S.wave >= WAVES.length) return;
  S.wave++; S.active = true; S.queue = []; S.qt = 0; for (const u of S.units) if (u) u.goldN = 0;
  for (const gp of WAVES[S.wave - 1]) for (let i = 0; i < gp.n; i++) S.queue.push({ type: gp.t, t: (gp.at || 0) + .4 + i * gp.gap });
  S.queue.sort((a, b) => a.t - b.t);
  const boss = WAVES[S.wave - 1].find((gp) => ENEMY[gp.t].boss || ENEMY[gp.t].elite);
  if (boss) { banner(`${ENEMY[boss.t].name}来了！`, 2600); sfx.boss(); if (ENEMY[boss.t].boss) say('大家伙来啦'); } else sfx.wood(1.3);
  status(`第 ${S.wave} 波来了，边打边摇！`); if (!simming && S.wave > 1) $('tip').style.display = 'none'; hud();
}
function spawn(type, x, y) {
  const d = ENEMY[type], hp = Math.round(d.hp * HPS(S.wave));
  S.enemies.push({ type, def: d, hp, max: hp, x: x ?? (50 + R() * (FW - 100)), y: y ?? -30, r: d.r, slow: 0, flash: 0, skill: 4.5, kb: 0, kbN: 0, seed: R() * 10, sway: R() * TAU });
}
function damage(e, dmg, col = '#fff') {
  if (e.hp <= 0) return; const d = Math.round(dmg); e.hp -= d; e.flash = .09; if (d > S.stats.maxDmg) S.stats.maxDmg = d;
  text(e.x + (R() - .5) * 18, e.y - e.r - 6, '' + d, col, d > 400 ? 22 : d > 120 ? 18 : 14); sfx.hit();
  if (e.hp <= 0) kill(e);
}
function kill(e) {
  const i = S.enemies.indexOf(e); if (i < 0) return; S.enemies.splice(i, 1); const gain = Math.round(e.def.reward * S.mod.reward * K.pay); S.gold += gain; S.score += e.def.reward * 10; S.stats.kills++;
  if (!simming) { S.corpses.push({ type: e.type, x: e.x, y: e.y, r: e.r, t: 0 }); burst(e.x, e.y, '#f5c63a', e.def.boss ? 40 : 9, 170, 1); burst(e.x, e.y, '#9aa', 6, 90); text(e.x, e.y - e.r - 22, '+' + gain, '#ffd24a', 14); if (e.def.boss) { S.shake = 16; ring(e.x, e.y, 260, '#ffd24a', .6, 8); } }
  sfx.coin(); hud();
}
function offerRelics() {
  const pool = RELICS.filter((r) => (S.relics[r.id] || 0) < r.max); for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  S.choice = pool.slice(0, 3);
  if (simming) return;
  $('choices').innerHTML = ''; S.choice.forEach((r, i) => { const b = document.createElement('button'); b.className = 'card'; b.innerHTML = `<i>${r.tag}</i><h3 class="kai">${r.name}</h3><p>${r.desc}</p>`; b.onclick = () => chooseRelic(i); $('choices').appendChild(b); });
  $('relic').style.display = 'flex';
}
function chooseRelic(i) { const r = S.choice && S.choice[i]; if (!r) return; S.relics[r.id] = (S.relics[r.id] || 0) + 1; r.apply(S); S.choice = null; if (!simming) { $('relic').style.display = 'none'; sfx.win(); status(`请到【${r.name}】。香火够就接着摇，准备好了开下一波`); } hud(); }

function update(dt, real) {
  S.time += dt;
  for (let i = 0; i < 9; i++) { if (S.lock[i] > 0) S.lock[i] = Math.max(0, S.lock[i] - dt); if (S.pop[i] > 0) S.pop[i] = Math.max(0, S.pop[i] - real * 4); }
  if (S.shake > 0) S.shake = Math.max(0, S.shake - real * 30); if (S.hurt > 0) S.hurt = Math.max(0, S.hurt - real * 2); if (S.cut > 0) S.cut = Math.max(0, S.cut - real);
  if (S.win) { S.win.t += real; if (S.win.t > 2) S.win = null; }
  // 转轴
  if (S.spin) { const sp = S.spin; sp.t += real; for (let c = 0; c < 3; c++) if (!sp.done[c] && sp.t >= sp.stop[c]) { sp.done[c] = true; for (let r = 0; r < 3; r++) { const i = r * 3 + c; S.reels[i] = sp.tg[i]; S.pop[i] = 1; } sfx.stop(c); } if (sp.done[2]) { S.spin = null; evaluate(); hud(); } }
  // 出怪
  if (S.active) { S.qt += dt; while (S.queue.length && S.queue[0].t <= S.qt) spawn(S.queue.shift().type);
    if (!S.queue.length && !S.enemies.length) { S.active = false; S.gold += 30; S.score += 200; if (S.wave >= WAVES.length) return finish(true); offerRelics(); hud(); } }
  // 法器出手
  for (let i = 0; i < S.units.length; i++) {
    const u = S.units[i]; if (!u) continue; const p = slotPos(i);
    if (u.pop < 1) u.pop = Math.min(1, u.pop + real * 5); else if (u.pop > 1) u.pop = Math.max(1, u.pop - real * 2.5);
    if (u.fire > 0) u.fire = Math.max(0, u.fire - dt * 5);
    if (u.type === 'cat' && S.active && u.goldN < 5) { u.goldT += dt; if (u.goldT >= 4) { u.goldT = 0; u.goldN++; const n = 3 + u.layers + (u.awake ? 2 : 0); S.gold += n; text(p.x, p.y - 40, `+${n} 香火`, '#ffd24a'); sfx.coin(); hud(); } }
    u.timer -= dt; if (u.timer > 0 || !S.enemies.length) continue;
    const range = SYM[u.type].range; let tg = null, by = -1e9, tg2 = null;
    for (const e of S.enemies) if (e.y > -10 && Math.hypot(e.x - p.x, e.y - p.y) <= range) { if (e.y > by) { tg2 = tg; by = e.y; tg = e; } else if (!tg2 || e.y > tg2.y) tg2 = e; }
    if (!tg) continue;
    u.timer = cdOf(u); u.fire = 1; const atk = atkOf(u), col = SYM[u.type].col;
    if (u.type === 'thunder') {
      const hits = [tg], n = (u.awake ? 5 : 3) + S.mod.chain; let cur = tg;
      for (let h = 1; h < n; h++) { let nx = null, bd = 210; for (const e of S.enemies) { if (hits.includes(e)) continue; const d = Math.hypot(e.x - cur.x, e.y - cur.y); if (d < bd) { bd = d; nx = e; } } if (!nx) break; hits.push(nx); cur = nx; }
      if (!simming) S.bolts.push({ pts: [{ x: p.x, y: p.y - 20 }, ...hits.map((e) => ({ x: e.x, y: e.y }))], col: u.awake ? '#9ff' : '#ffe14a', life: 0, max: .24, seed: R() * 99 });
      hits.forEach((e, k) => { damage(e, atk * (1 - k * .08), '#ffe14a'); burst(e.x, e.y, '#ffe14a', 4, 120); }); sfx.zap();
    } else if (u.type === 'lion') {
      const rad = 170 * S.mod.lionR * (u.awake ? 1.3 : 1); ring(p.x, p.y, rad, '#ff3b5c', .32, 6); ring(p.x, p.y, rad * .6, '#ffd24a', .26, 3);
      for (const e of S.enemies.slice()) if (Math.hypot(e.x - p.x, e.y - p.y) <= rad + e.r * .5) { if (e.kb <= 0) { e.y = Math.max(-10, e.y - (e.def.boss ? 10 : e.def.elite ? 22 : 46) * S.mod.knock / (1 + e.kbN * .6)); e.kb = 2.2; e.kbN++; } damage(e, atk, '#ff6a7a'); }
      sfx.thud(); S.shake = Math.max(S.shake, 3);
    } else if (u.type === 'seal') {
      S.pending.push({ x: tg.x, y: tg.y, t: .2, rad: u.awake ? 115 : 82, dmg: atk, col: '#ff5a5a', kind: 'stamp' });
    } else if (u.type === 'zhongkui') {
      if (!simming) S.decals.push({ kind: 'slash', x: tg.x, y: tg.y, t: 0, max: .3, rot: R() * TAU }); ring(tg.x, tg.y, 130, '#ffd24a', .3, 6);
      for (const e of S.enemies.slice()) if (Math.hypot(e.x - tg.x, e.y - tg.y) <= 130) damage(e, atk, '#ffd24a'); sfx.thud();
    } else {
      const shoot = (t) => S.shots.push({ x: p.x, y: p.y - 14, tx: t.x, ty: t.y, tg: t, sp: u.type === 'sword' ? 950 : u.type === 'rice' ? 540 : 640, dmg: atk, type: u.type, awake: u.awake, col, rot: 0 });
      shoot(tg); if (u.type === 'sword' && u.awake && tg2) shoot(tg2);
      if (u.type === 'rice') sfx.thud(); else if (rate('sw', 70)) tone(u.type === 'cat' ? 900 : 1700, u.type === 'cat' ? 1300 : 700, .07, 'triangle', .035);
    }
  }
  // 延迟落地的范围伤害（盖章）
  for (let i = S.pending.length - 1; i >= 0; i--) { const q = S.pending[i]; q.t -= dt; if (q.t > 0) continue; S.pending.splice(i, 1); if (!simming) S.decals.push({ kind: 'stamp', x: q.x, y: q.y, t: 0, max: .9, r: q.rad }); ring(q.x, q.y, q.rad, q.col, .28, 5); burst(q.x, q.y, '#ffd24a', 10, 160); S.shake = Math.max(S.shake, 4); sfx.thud(); for (const e of S.enemies.slice()) if (Math.hypot(e.x - q.x, e.y - q.y) <= q.rad + e.r * .4) damage(e, q.dmg, q.col); }
  // 飞行物
  for (let i = S.shots.length - 1; i >= 0; i--) {
    const s = S.shots[i]; if (s.tg && s.tg.hp > 0) { s.tx = s.tg.x; s.ty = s.tg.y; } else s.tg = null;
    const dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy), mv = s.sp * dt; s.rot += dt * 14;
    if (d > mv + 14) { s.x += dx / d * mv; s.y += dy / d * mv; continue; }
    S.shots.splice(i, 1);
    if (s.type === 'rice') { const rad = 85 * S.mod.splash * (s.awake ? 1.35 : 1); ring(s.tx, s.ty, rad, s.col, .28, 4); burst(s.tx, s.ty, '#efffd8', 12, 140); for (const e of S.enemies.slice()) if (Math.hypot(e.x - s.tx, e.y - s.ty) <= rad + e.r * .4) { e.slow = 2.4; damage(e, s.dmg, '#c8ff9a'); } }
    else if (s.tg) { burst(s.tx, s.ty, s.col, 5, 110); damage(s.tg, s.dmg, s.col); }
  }
  // 妖怪
  for (let i = S.enemies.length - 1; i >= 0; i--) {
    const e = S.enemies[i], d = e.def; if (e.flash > 0) e.flash -= dt; if (e.slow > 0) e.slow -= dt; if (e.kb > 0) e.kb -= dt;
    let v = d.sp * (e.slow > 0 ? S.mod.slow : 1); if (d.hop) v *= 1.57 * Math.abs(Math.sin((S.time * d.hop + e.seed) * Math.PI));
    e.y += v * dt; if (e.type === 'flyer' || e.type === 'ghost') e.x = clamp(e.x + Math.cos(S.time * (e.type === 'flyer' ? 2.6 : 1.3) + e.sway) * (e.type === 'flyer' ? 46 : 16) * dt, 30, FW - 30);
    if (d.skill && e.y > 40) { e.skill -= dt; if (e.skill <= 0) {
      if (d.skill !== 'lock') { e.skill = d.final ? 7 : 5.5; const t = d.final ? 'jiangshi' : 'ghost'; for (const s of [-1, 1]) spawn(t, clamp(e.x + s * 70, 30, FW - 30), e.y + 10); text(e.x, e.y - e.r - 30, d.final ? '尸变！' : '招魂！', '#ff6a7a', 18); ring(e.x, e.y, 110, '#ff2a55', .4, 5); }
      if (d.skill !== 'summon') { if (d.skill === 'lock') e.skill = 6.5; const n = d.final ? 2 : 1; for (let k = 0; k < n; k++) S.lock[Math.floor(R() * 9)] = 5; sfx.lock(); banner(d.final ? '旱魃封印了转轴！' : '白无常勾住了一格转轴！', 1700); }
    } }
    if (e.y >= BAR - e.r * .5) { S.enemies.splice(i, 1); S.hp = Math.max(0, S.hp - d.dmg); S.shake = 12; S.hurt = 1; burst(e.x, BAR, '#ff2a55', 18, 200); ring(e.x, BAR, 90, '#ff2a55'); sfx.hurt(); hud(); if (S.hp <= 0) return finish(false); if (S.hp < S.maxHp * .35 && !S.lowSaid) { S.lowSaid = true; say('顶住顶住'); } }
  }
  if (simming) return;
  const age = (a, k = 'life') => { for (let i = a.length - 1; i >= 0; i--) { a[i][k] += dt; if (a[i][k] >= (a[i].max || .45)) a.splice(i, 1); } };
  age(S.bolts); age(S.rings); age(S.decals, 't'); age(S.corpses, 't');
  for (let i = S.parts.length - 1; i >= 0; i--) { const p = S.parts[i]; p.life += dt; if (p.life >= p.max) { S.parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; if (p.kind) { p.vy += 260 * dt; p.rot += dt * 8; } else { p.vx *= .96; p.vy *= .96; } }
  for (let i = S.texts.length - 1; i >= 0; i--) { const f = S.texts[i]; f.life += dt; f.y -= 34 * dt; if (f.life >= f.max) S.texts.splice(i, 1); }
  for (let i = S.comets.length - 1; i >= 0; i--) { S.comets[i].t += real * 3.2; if (S.comets[i].t >= 1) S.comets.splice(i, 1); }
}

/* ---------------- 开局、结算 ---------------- */
function newGame(auto = false) {
  S = fresh(); S.auto = auto; state = 'play';
  if (!simming) { $('screen').style.display = 'none'; $('relic').style.display = 'none'; $('hud').style.display = 'block'; $('tip').style.display = ''; $('speed').textContent = '1×'; status('三个连成线就请出法器，天师印是百搭'); say('开坛摇人'); }
  if (!auto) try { const h = JSON.parse(localStorage.getItem('echo_hub')) || {}, d = new Date(), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); (h.days = h.days || {})[k] = 'merit'; (h.played = h.played || {}).merit = k; h.last = 'merit'; localStorage.setItem('echo_hub', JSON.stringify(h)); } catch (e) { /* 存不了就算了 */ }
  hud();
}
function finish(ok) {
  state = 'over'; S.won = ok; if (ok) S.score += S.hp * 20 + 1000; S.score = Math.round(S.score);
  if (simming) return;
  const nb = S.score > best && !S.auto; if (nb) { best = S.score; try { localStorage.setItem('echo_merit_best', '' + best); } catch (e) { /* 忽略 */ } }
  sfx.over(ok); say(ok ? '镇妖大捷' : '结界破啦'); $('hud').style.display = 'none'; $('relic').style.display = 'none';
  const rank = RANKS.find((r) => S.score >= r[0])[1];
  $('screen').innerHTML = `<div class="tag">${ok ? '十波全清' : '结界破了'}</div><h1 class="kai" style="font-size:clamp(38px,9vw,70px)">${ok ? '镇妖大捷' : '功亏一篑'}</h1><div class="rank kai">${rank}</div><div class="big">${S.score.toLocaleString()}</div><div style="font-size:13px;color:#7df0ff">${nb ? '新纪录！' : '最高 ' + best.toLocaleString()} 功德</div>
    <table><tr><td>打到</td><td>第 ${S.wave}/${WAVES.length} 波</td></tr><tr><td>摇人</td><td>${S.stats.spins} 次，连线 ${S.stats.lines} 条</td></tr><tr><td>炼化</td><td>${S.stats.merges} 次</td></tr><tr><td>收妖</td><td>${S.stats.kills} 只</td></tr><tr><td>最高一击</td><td>${S.stats.maxDmg.toLocaleString()}</td></tr></table><button class="go kai" id="go">再摇一局</button>`;
  $('screen').style.display = 'flex'; $('go').onclick = () => { audio(); newGame(); };
}
function title() {
  state = 'title'; S = fresh(); ['sword', 'cat', 'thunder', 'rice', 'lion', 'seal', 'zhongkui'].forEach((t, i) => { S.units[[0, 5, 6, 9, 2, 11, 7][i]] = { type: t, layers: i % 3, awake: i === 6, timer: 9, goldT: 0, goldN: 0, pop: 1, fire: 0 }; });
  $('hud').style.display = 'none'; $('relic').style.display = 'none';
  $('screen').innerHTML = `<div class="tag">回声游戏厅 · 第 14 期</div><h1 class="kai">天师摇人</h1><div class="sub">拉一把八卦功德机，三个连成线，请出法器镇住闯关的妖怪。</div>
    <div class="help"><b>摇人</b>：20 香火一次，横竖斜 8 条线，没连上返 5 香火<br><b>炼化</b>：把法器拖到同类身上叠层，叠 3 层渡劫觉醒<br><b>天师印</b>：百搭；三个印连线请出钟馗清场<br><b>法宝</b>：每波打完三选一，改转轴概率或规则<br><b>操作</b>：点按钮或空格摇人，回车开下一波，M 静音</div>
    <button class="go kai" id="go">开坛</button>${best ? `<div style="margin-top:10px;font-size:13px;color:#7df0ff">最高功德 ${best.toLocaleString()}</div>` : ''}`;
  $('screen').style.display = 'flex'; $('go').onclick = () => { audio(); newGame(); };
}
function hud() {
  if (simming) return;
  $('waveN').textContent = Math.max(1, S.wave); $('gold').querySelector('b').textContent = S.gold; const hp = clamp(S.hp / S.maxHp, 0, 1); $('hpBar').style.width = hp * 100 + '%'; $('hpBar').className = hp < .35 ? 'low' : ''; $('hpTxt').textContent = `结界 ${S.hp}/${S.maxHp}`;
  $('free').style.display = S.free > 0 ? '' : 'none'; $('free').querySelector('b').textContent = S.free;
  $('spin').disabled = !!S.spin || state !== 'play' || (S.free <= 0 && S.gold < SPIN_COST); $('cost').textContent = S.free > 0 ? '免费' : S.lucky > 0 ? '必中 · 20' : SPIN_COST + ' 香火';
  const w = $('wave'), done = S.wave >= WAVES.length; w.disabled = S.active || done; w.textContent = S.active ? `第 ${S.wave} 波激战中` : done ? '最后一波' : `开始第 ${S.wave + 1} 波`; w.className = !S.active && !done && S.free <= 0 && S.gold < SPIN_COST ? 'go' : '';
}

/* ---------------- 布局和静态背景 ---------------- */
const cellPos = (i) => ({ x: L.reel.x + (i % 3 + .5) * L.reel.cs, y: L.reel.y + (Math.floor(i / 3) + .5) * L.reel.cs });
function layout() {
  const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2), P = W < H * 1.05, top = 44; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  let f, m, reel; const px = (el, o) => { for (const k in o) el.style[k] = typeof o[k] === 'number' ? o[k] + 'px' : o[k]; };
  if (P) { const mh = Math.round(clamp(H * .37, 270, 360)); f = { x: 0, y: 0, w: W, h: H - mh }; m = { x: 0, y: H - mh, w: W, h: mh }; const Rr = Math.min(mh - 64, W - 150); reel = { x: 14, y: m.y + 50, R: Rr };
    const x0 = 14 + Rr + 14, cw = W - x0 - 12; px($('status'), { left: x0, top: m.y + 42, width: cw, height: 54 }); px($('spin'), { left: x0, top: m.y + 100, width: cw, height: Math.min(112, mh - 100 - 62) }); px($('wave'), { left: x0, top: m.y + mh - 54, width: cw, height: 42 });
  } else { const mw = Math.round(clamp(W * .36, 330, 460)); f = { x: 0, y: 0, w: W - mw, h: H }; m = { x: W - mw, y: 0, w: mw, h: H }; const Rr = Math.min(mw - 52, H - 290); reel = { x: m.x + (mw - Rr) / 2, y: 106, R: Rr };
    px($('status'), { left: reel.x, top: 62, width: Rr, height: 38 }); px($('spin'), { left: reel.x, top: 106 + Rr + 20, width: Rr, height: 78 }); px($('wave'), { left: reel.x, top: 106 + Rr + 110, width: Rr, height: 46 }); }
  reel.cs = reel.R / 3;
  const s = Math.min(f.w / FW, (f.h - top - 4) / FH);
  L = { W, H, dpr, P, f, m, reel, s, ox: f.x + (f.w - FW * s) / 2, oy: f.y + f.h - FH * s - 2, top };
  px($('top'), { width: P ? W : f.w }); px($('banner'), { left: f.x + f.w / 2 }); px($('tip'), { left: f.x + f.w / 2, top: L.oy + (GY - 26) * s });
  paintBg();
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function grad(c, x0, y0, x1, y1, st) { const gd = c.createLinearGradient(x0, y0, x1, y1); st.forEach((s, i) => gd.addColorStop(i / (st.length - 1), s)); return gd; }
function seeded(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
function paintBg() {
  const { W, H, dpr, f, m, s, ox, oy, reel, P } = L; bgc = document.createElement('canvas'); bgc.width = cv.width; bgc.height = cv.height; const b = bgc.getContext('2d'); b.scale(dpr, dpr); const rd = seeded(42);
  /* 战场 */
  b.save(); b.beginPath(); b.rect(f.x, f.y, f.w, f.h); b.clip();
  const hz = oy + 100 * s;
  b.fillStyle = grad(b, 0, f.y, 0, hz, ['#07061c', '#1c1442', '#4a245a']); b.fillRect(f.x, f.y, f.w, hz - f.y);
  for (let i = 0; i < 70; i++) { b.fillStyle = `rgba(255,255,255,${.2 + rd() * .6})`; b.fillRect(f.x + rd() * f.w, f.y + rd() * (hz - f.y) * .8, 1.2, 1.2); }
  const mx = ox + 470 * s, my = Math.max(f.y + 66, hz - 60 * s), mr = 16 + 12 * s; let gd = b.createRadialGradient(mx, my, mr * .4, mx, my, mr * 5); gd.addColorStop(0, 'rgba(255,240,200,.5)'); gd.addColorStop(.3, 'rgba(255,170,150,.14)'); gd.addColorStop(1, 'rgba(255,150,150,0)'); b.fillStyle = gd; b.fillRect(f.x, f.y, f.w, hz);
  b.fillStyle = '#fff3d2'; b.beginPath(); b.arc(mx, my, mr, 0, TAU); b.fill(); b.fillStyle = 'rgba(200,170,130,.35)'; b.beginPath(); b.arc(mx - mr * .3, my - mr * .2, mr * .22, 0, TAU); b.arc(mx + mr * .25, my + mr * .3, mr * .16, 0, TAU); b.fill();
  // 远山
  for (const [amp, col, off] of [[46, '#24183f', 0], [30, '#191230', 37]]) { b.fillStyle = col; b.beginPath(); b.moveTo(f.x, hz); for (let x = f.x; x <= f.x + f.w + 20; x += 20) b.lineTo(x, hz - (Math.sin(x * .013 + off) * .5 + Math.sin(x * .031 + off * 2) * .3 + .8) * amp * s - 6); b.lineTo(f.x + f.w, hz); b.fill(); }
  // 地面
  b.fillStyle = grad(b, 0, hz, 0, f.y + f.h, ['#2c2647', '#1d1b33', '#10101e']); b.fillRect(f.x, hz, f.w, f.y + f.h - hz);
  const ts = 75 * s; for (let y = hz, row = 0; y < f.y + f.h; y += ts * .8, row++) for (let x = ox - Math.ceil((ox - f.x) / ts + 1) * ts + (row % 2 ? ts / 2 : 0); x < f.x + f.w; x += ts) { b.fillStyle = `rgba(${rd() > .5 ? '150,140,220' : '0,0,0'},${.02 + rd() * .06})`; b.fillRect(x + 1, y + 1, ts - 2, ts * .8 - 2); b.strokeStyle = 'rgba(0,0,0,.28)'; b.lineWidth = 1; b.strokeRect(x + .5, y + .5, ts, ts * .8); }
  gd = b.createRadialGradient(ox + 300 * s, oy + 400 * s, 20, ox + 300 * s, oy + 400 * s, 420 * s); gd.addColorStop(0, 'rgba(130,120,230,.16)'); gd.addColorStop(1, 'rgba(130,120,230,0)'); b.fillStyle = gd; b.fillRect(f.x, hz, f.w, f.h);
  // 以下用战场逻辑坐标画
  b.save(); b.translate(ox, oy); b.scale(s, s);
  // 两侧的坟和枯草（宽屏才看得到）
  const ext = (ox - f.x) / s; for (let k = 0; k < 14 && ext > 40; k++) for (const sd of [-1, 1]) { const x = sd < 0 ? -30 - rd() * (ext - 30) : FW + 30 + rd() * (ext - 30), y = 170 + rd() * 600, h = 40 + rd() * 24; if (rd() < .6) { b.fillStyle = 'rgba(0,0,0,.35)'; b.beginPath(); b.ellipse(x, y + 4, 26, 8, 0, 0, TAU); b.fill(); rr(b, x - 18, y - h, 36, h, 16); b.fillStyle = grad(b, x - 18, 0, x + 18, 0, ['#6a6a86', '#4a4a64', '#2e2e44']); b.fill(); b.strokeStyle = '#15121f'; b.lineWidth = 2.5; b.stroke(); b.fillStyle = 'rgba(20,16,30,.7)'; b.fillRect(x - 3, y - h + 14, 6, h - 24); } else { b.strokeStyle = '#3a4a3a'; b.lineWidth = 2; for (let j = -2; j <= 2; j++) { b.beginPath(); b.moveTo(x, y); b.quadraticCurveTo(x + j * 4, y - 14, x + j * 9, y - 22 - rd() * 8); b.stroke(); } } }
  // 鬼门关牌坊
  for (const x of [26, 574]) { b.fillStyle = 'rgba(0,0,0,.4)'; b.beginPath(); b.ellipse(x, 168, 30, 9, 0, 0, TAU); b.fill(); b.fillStyle = grad(b, x - 14, 0, x + 14, 0, ['#7a0f1a', '#d0283a', '#6a0b14']); b.fillRect(x - 14, 40, 28, 124); b.strokeStyle = '#1a0810'; b.lineWidth = 3; b.strokeRect(x - 14, 40, 28, 124); b.fillStyle = '#4a4a64'; rr(b, x - 20, 156, 40, 14, 4); b.fill(); b.stroke(); b.fillStyle = '#ffd24a'; b.fillRect(x - 14, 60, 28, 4); b.fillRect(x - 14, 140, 28, 4); }
  b.fillStyle = grad(b, 0, 26, 0, 58, ['#2a1a2e', '#120a16']); b.beginPath(); b.moveTo(-34, 30); b.quadraticCurveTo(-10, 40, 10, 26); b.lineTo(590, 26); b.quadraticCurveTo(610, 40, 634, 30); b.lineTo(606, 58); b.lineTo(-6, 58); b.closePath(); b.fill(); b.strokeStyle = '#0a060c'; b.lineWidth = 3; b.stroke();
  b.fillStyle = grad(b, 0, 2, 0, 30, ['#3a2440', '#1a0f1e']); b.beginPath(); b.moveTo(-60, 6); b.quadraticCurveTo(-20, 22, 20, 4); b.lineTo(580, 4); b.quadraticCurveTo(620, 22, 660, 6); b.lineTo(620, 30); b.lineTo(-20, 30); b.closePath(); b.fill(); b.stroke();
  b.strokeStyle = '#ffd24a'; b.lineWidth = 2; b.beginPath(); b.moveTo(-8, 56); b.lineTo(608, 56); b.stroke(); for (let x = 10; x < 600; x += 22) { b.fillStyle = 'rgba(255,210,74,.5)'; b.beginPath(); b.arc(x, 31, 3, 0, TAU); b.fill(); }
  rr(b, 232, 62, 136, 44, 4); b.fillStyle = '#0c1030'; b.fill(); b.strokeStyle = '#ffd24a'; b.lineWidth = 3; b.stroke(); b.font = `bold 30px ${KAI}`; b.textAlign = 'center'; b.textBaseline = 'middle'; b.fillStyle = '#ffd24a'; b.fillText('鬼门关', 300, 85);
  // 阵地石板
  for (let i = 0; i < COLS * ROWS; i++) { const x = GX + (i % COLS) * CW, y = GY + Math.floor(i / COLS) * CH; rr(b, x + 4, y + 4, CW - 8, CH - 8, 10); b.fillStyle = grad(b, 0, y, 0, y + CH, ['#3a3560', '#232040']); b.fill(); b.strokeStyle = 'rgba(125,240,255,.3)'; b.lineWidth = 1.5; b.stroke(); b.strokeStyle = 'rgba(125,240,255,.1)'; b.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + Math.PI / 8; b.lineTo(x + CW / 2 + Math.cos(a) * 30, y + CH / 2 + Math.sin(a) * 30); } b.closePath(); b.stroke(); }
  // 结界的桩和红绳
  b.strokeStyle = '#5a0a14'; b.lineWidth = 7; b.beginPath(); b.moveTo(-ext, BAR); b.lineTo(FW + ext, BAR); b.stroke(); b.strokeStyle = '#e02437'; b.lineWidth = 4; b.setLineDash([10, 5]); b.beginPath(); b.moveTo(-ext, BAR); b.lineTo(FW + ext, BAR); b.stroke(); b.setLineDash([]);
  for (const x of [10, 590]) { b.fillStyle = grad(b, x - 9, 0, x + 9, 0, ['#5a3a1a', '#9a6a30', '#4a2c12']); b.fillRect(x - 9, BAR - 46, 18, 76); b.strokeStyle = '#1a0f08'; b.lineWidth = 2.5; b.strokeRect(x - 9, BAR - 46, 18, 76); b.fillStyle = '#ffd24a'; b.beginPath(); b.arc(x, BAR - 50, 9, 0, TAU); b.fill(); b.stroke(); }
  b.restore(); b.restore();
  /* 功德机 */
  b.save(); b.beginPath(); b.rect(m.x, m.y, m.w, m.h); b.clip();
  b.fillStyle = grad(b, m.x, m.y, m.x + (P ? 0 : m.w), m.y + (P ? m.h : m.h), ['#5a1020', '#300a16', '#16040a']); b.fillRect(m.x, m.y, m.w, m.h);
  b.strokeStyle = 'rgba(255,210,74,.055)'; b.lineWidth = 1; for (let k = -m.h; k < m.w + m.h; k += 20) { b.beginPath(); b.moveTo(m.x + k, m.y); b.lineTo(m.x + k + m.h, m.y + m.h); b.moveTo(m.x + k + m.h, m.y); b.lineTo(m.x + k, m.y + m.h); b.stroke(); }
  b.fillStyle = grad(b, 0, 0, P ? 0 : 6, P ? 6 : 0, ['#fff3b0', '#e39a17', '#7a4a08']); if (P) b.fillRect(m.x, m.y, m.w, 5); else b.fillRect(m.x, m.y, 5, m.h);
  // 牌匾
  const pw = P ? Math.min(200, reel.R) : reel.R, ph = P ? 28 : 40, pxx = P ? reel.x + (reel.R - pw) / 2 : reel.x, pyy = P ? m.y + 9 : 14; rr(b, pxx, pyy, pw, ph, 5); b.fillStyle = '#12060c'; b.fill(); b.strokeStyle = '#ffd24a'; b.lineWidth = 2; b.stroke(); b.font = `bold ${P ? 18 : 26}px ${KAI}`; b.textAlign = 'center'; b.textBaseline = 'middle'; b.fillStyle = grad(b, 0, pyy, 0, pyy + ph, ['#fff3b0', '#ffc933']); b.fillText('八 卦 功 德 机', pxx + pw / 2, pyy + ph / 2 + 1);
  // 转轴框
  const fr = 9; rr(b, reel.x - fr, reel.y - fr, reel.R + fr * 2, reel.R + fr * 2, 12); b.fillStyle = grad(b, reel.x, reel.y, reel.x + reel.R, reel.y + reel.R, ['#fff3b0', '#e39a17', '#8a5208', '#ffd24a']); b.fill(); b.strokeStyle = '#2a1204'; b.lineWidth = 2; b.stroke();
  rr(b, reel.x - 3, reel.y - 3, reel.R + 6, reel.R + 6, 8); b.fillStyle = '#07050f'; b.fill();
  for (let i = 0; i < 9; i++) { const x = reel.x + (i % 3) * reel.cs, y = reel.y + Math.floor(i / 3) * reel.cs; rr(b, x + 3, y + 3, reel.cs - 6, reel.cs - 6, 8); gd = b.createRadialGradient(x + reel.cs / 2, y + reel.cs * .4, 4, x + reel.cs / 2, y + reel.cs / 2, reel.cs * .7); gd.addColorStop(0, '#34306a'); gd.addColorStop(1, '#0e0c22'); b.fillStyle = gd; b.fill(); b.strokeStyle = 'rgba(255,210,74,.4)'; b.lineWidth = 1.5; b.stroke(); }
  for (const [cx, cy] of [[-fr, -fr], [reel.R + fr, -fr], [-fr, reel.R + fr], [reel.R + fr, reel.R + fr]]) { b.fillStyle = '#fff3b0'; b.beginPath(); b.arc(reel.x + cx + (cx < 0 ? 8 : -8), reel.y + cy + (cy < 0 ? 8 : -8), 3, 0, TAU); b.fill(); }
  // 宽屏下面列出六种法器
  if (!P) { const y0 = 106 + reel.R + 176, lh = Math.min(30, (H - y0 - 10) / 6); if (lh >= 21) KEYS.forEach((k, i) => { const y = y0 + i * lh + lh / 2; put(b, sprite(k, 22), reel.x + 14, y, lh * .42); b.textAlign = 'left'; b.font = `bold 14px ${HEI}`; b.fillStyle = SYM[k].col; b.fillText(SYM[k].name, reel.x + 34, y + 1); b.font = `13px ${HEI}`; b.fillStyle = 'rgba(255,240,210,.8)'; b.fillText(SYM[k].tip, reel.x + 92, y + 1); }); }
  b.restore();
}

/* ---------------- 每帧绘制 ---------------- */
const TRI = [7, 3, 5, 1, 6, 2, 4, 0];
function drawField(t) {
  const { s, ox, oy, dpr, f } = L, q = s * dpr; g.save(); g.beginPath(); g.rect(f.x, f.y, f.w, f.h); g.clip();
  g.translate(ox + (S.shake ? (R() - .5) * S.shake : 0), oy + (S.shake ? (R() - .5) * S.shake : 0)); g.scale(s, s);
  // 地上转着的八卦
  g.save(); g.translate(300, 330); g.rotate(t * .12); g.strokeStyle = 'rgba(125,240,255,.13)'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 215, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, 120, 0, TAU); g.stroke();
  for (let k = 0; k < 8; k++) { g.save(); g.rotate(k / 8 * TAU); for (let j = 0; j < 3; j++) { const y = -150 - j * 17; g.fillStyle = 'rgba(125,240,255,.16)'; if (TRI[k] >> j & 1) g.fillRect(-34, y, 68, 9); else { g.fillRect(-34, y, 28, 9); g.fillRect(6, y, 28, 9); } } g.restore(); }
  g.fillStyle = 'rgba(125,240,255,.07)'; g.beginPath(); g.arc(0, 0, 70, -Math.PI / 2, Math.PI / 2); g.arc(0, 35, 35, Math.PI / 2, -Math.PI / 2, true); g.arc(0, -35, 35, Math.PI / 2, -Math.PI / 2); g.fill(); g.restore();
  // 雾
  for (let k = 0; k < 5; k++) { const x = (k * 173 + t * (8 + k * 3)) % (FW + 300) - 150, y = 150 + k * 110 + Math.sin(t * .3 + k) * 20, gd = g.createRadialGradient(x, y, 10, x, y, 150); gd.addColorStop(0, 'rgba(190,200,255,.055)'); gd.addColorStop(1, 'rgba(190,200,255,0)'); g.fillStyle = gd; g.fillRect(x - 150, y - 150, 300, 300); }
  // 牌坊的灯笼
  for (const x of [72, 528]) { const sw = Math.sin(t * 1.4 + x) * 3, fl = .8 + Math.sin(t * 9 + x) * .08; g.strokeStyle = '#1a0810'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 58); g.lineTo(x + sw, 84); g.stroke(); const gd = g.createRadialGradient(x + sw, 104, 4, x + sw, 104, 70); gd.addColorStop(0, `rgba(255,120,60,${.4 * fl})`); gd.addColorStop(1, 'rgba(255,90,40,0)'); g.fillStyle = gd; g.fillRect(x - 70, 34, 140, 140); g.fillStyle = '#e02437'; g.beginPath(); g.ellipse(x + sw, 104, 17, 21, 0, 0, TAU); g.fill(); g.strokeStyle = '#5a0a14'; g.stroke(); g.fillStyle = '#ffd24a'; g.fillRect(x + sw - 9, 81, 18, 5); g.fillRect(x + sw - 9, 122, 18, 5); g.fillStyle = `rgba(255,240,170,${.6 * fl})`; g.beginPath(); g.ellipse(x + sw, 104, 7, 12, 0, 0, TAU); g.fill(); }
  // 结界：光墙 + 挂在红绳上的符，血越少符越少
  const hp = clamp(S.hp / S.maxHp, 0, 1), bc = hp < .35 ? '255,70,70' : '90,235,255', pulse = .55 + Math.sin(t * 3) * .12 + S.hurt * .5;
  let gd = g.createLinearGradient(0, BAR - 70, 0, BAR + 6); gd.addColorStop(0, `rgba(${bc},0)`); gd.addColorStop(1, `rgba(${bc},${.3 * pulse})`); g.fillStyle = gd; g.fillRect(-400, BAR - 70, FW + 800, 76);
  g.strokeStyle = `rgba(${bc},${.5 + pulse * .4})`; g.lineWidth = 2; g.beginPath(); g.moveTo(-400, BAR - 5); g.lineTo(FW + 400, BAR - 5); g.stroke();
  const nT = Math.ceil(hp * 9); for (let k = 0; k < 9; k++) if (k < nT) { const x = 46 + k * 63.5; put(g, sprite('talisman', 13 * q), x, BAR + 14, 13, Math.sin(t * 2 + k) * .12); }
  // 可炼化的目标格
  const src = S.drag >= 0 ? S.drag : S.sel;
  if (state === 'play') for (let i = 0; i < S.units.length; i++) { const x = GX + (i % COLS) * CW, y = GY + Math.floor(i / COLS) * CH; if (i === S.sel) { rr(g, x + 4, y + 4, CW - 8, CH - 8, 10); g.strokeStyle = '#ffd24a'; g.lineWidth = 3; g.stroke(); g.fillStyle = 'rgba(255,210,74,.14)'; g.fill(); } else if (src >= 0 && canMerge(S.units[src], S.units[i])) { rr(g, x + 4, y + 4, CW - 8, CH - 8, 10); g.strokeStyle = `rgba(125,255,170,${.6 + Math.sin(t * 8) * .3})`; g.lineWidth = 3; g.stroke(); g.fillStyle = 'rgba(125,255,170,.1)'; g.fill(); } }
  // 地上的印记
  for (const d of S.decals) { const k = d.t / d.max; if (d.kind === 'stamp') { g.globalAlpha = (1 - k) * .85; put(g, sprite('stamp', d.r * .55 * q), d.x, d.y, d.r * .55 * (1.25 - Math.min(1, k * 6) * .25)); g.globalAlpha = 1; } else { g.save(); g.translate(d.x, d.y); g.rotate(d.rot); g.globalAlpha = 1 - k; g.strokeStyle = '#fff3b0'; g.lineWidth = 16 * (1 - k); g.beginPath(); g.arc(0, 0, 100, -1 + k * 2, .6 + k * 2); g.stroke(); g.strokeStyle = '#ffb020'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 116, -1.2 + k * 2, .4 + k * 2); g.stroke(); g.restore(); g.globalAlpha = 1; } }
  // 盖章落下
  for (const p of S.pending) { const k = 1 - p.t / .2; put(g, sprite('seal', 40 * q, true), p.x, p.y - 260 * (1 - k) - 20, 40); }
  // 法器
  for (let i = 0; i < S.units.length; i++) { const u = S.units[i]; if (!u || i === S.drag) continue; const p = slotPos(i); drawUnit(u, p.x, p.y, t, i, q); }
  // 妖怪：按远近排
  const es = S.enemies.slice().sort((a, b) => a.y - b.y);
  for (const c of S.corpses) { const k = c.t / .45; g.globalAlpha = (1 - k) * .8; put(g, white(c.type, c.r * 1.3 * q), c.x, c.y - k * 30, c.r * 1.3, 0, 1 + k * .3, 1 - k * .5); g.globalAlpha = 1; }
  for (const e of es) drawEnemy(e, t, q);
  // 飞行物
  for (const sh of S.shots) { const a = Math.atan2(sh.ty - sh.y, sh.tx - sh.x); g.strokeStyle = sh.col; g.globalAlpha = .45; g.lineWidth = sh.type === 'sword' ? 5 : 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(sh.x, sh.y); g.lineTo(sh.x - Math.cos(a) * 34, sh.y - Math.sin(a) * 34); g.stroke(); g.globalAlpha = 1;
    if (sh.type === 'sword') put(g, sprite('sword', 20 * q), sh.x, sh.y, 20, a + Math.PI / 2 - .62); else if (sh.type === 'rice') put(g, sprite('grain', 13 * q), sh.x, sh.y, 13, sh.rot); else put(g, sprite('coin', 9 * q), sh.x, sh.y, 9, 0, Math.cos(sh.rot), 1); }
  // 闪电
  for (const bl of S.bolts) { const a = 1 - bl.life / bl.max, rs = seeded(Math.floor(bl.seed * 1000 + bl.life * 40)); g.lineCap = g.lineJoin = 'round'; for (const [w, col, al] of [[11, bl.col, .28], [5, bl.col, .8], [2, '#fff', 1]]) { g.globalAlpha = a * al; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); for (let k = 0; k < bl.pts.length - 1; k++) { const p0 = bl.pts[k], p1 = bl.pts[k + 1], n = Math.max(2, Math.ceil(Math.hypot(p1.x - p0.x, p1.y - p0.y) / 34)); if (!k) g.moveTo(p0.x, p0.y); for (let j = 1; j <= n; j++) { const jt = j / n, off = j < n ? 15 : 0; g.lineTo(p0.x + (p1.x - p0.x) * jt + (rs() - .5) * off * 2, p0.y + (p1.y - p0.y) * jt + (rs() - .5) * off * 2); } } g.stroke(); } g.globalAlpha = 1; }
  for (const r of S.rings) { const k = r.life / r.max; g.globalAlpha = (1 - k) * .9; g.strokeStyle = r.col; g.lineWidth = r.w * (1 - k * .6); g.beginPath(); g.arc(r.x, r.y, r.r * (1 - (1 - k) ** 2.2), 0, TAU); g.stroke(); } g.globalAlpha = 1;
  for (const p of S.parts) { const a = 1 - p.life / p.max; g.globalAlpha = a; g.fillStyle = p.col; if (p.kind) { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillRect(-p.size, -p.size * .6, p.size * 2, p.size * 1.2); g.restore(); } else { g.beginPath(); g.arc(p.x, p.y, p.size * a, 0, TAU); g.fill(); } } g.globalAlpha = 1;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (const ft of S.texts) { const k = ft.life / ft.max; g.globalAlpha = k < .7 ? 1 : (1 - k) / .3; const sz = ft.size * (k < .12 ? .6 + k * 4 : 1.1); g.font = `900 ${sz}px ${HEI}`; g.lineWidth = 3.5; g.strokeStyle = 'rgba(10,6,16,.85)'; g.strokeText(ft.t, ft.x, ft.y); g.fillStyle = ft.col; g.fillText(ft.t, ft.x, ft.y); } g.globalAlpha = 1;
  // 拖在手上的法器
  if (S.drag >= 0 && S.units[S.drag]) drawUnit(S.units[S.drag], S.dx, S.dy - 10, t, -1, q);
  g.restore();
  if (S.hurt > 0) { const gd2 = g.createRadialGradient(f.x + f.w / 2, f.y + f.h / 2, Math.min(f.w, f.h) * .3, f.x + f.w / 2, f.y + f.h / 2, Math.max(f.w, f.h) * .7); gd2.addColorStop(0, 'rgba(255,0,30,0)'); gd2.addColorStop(1, `rgba(255,0,30,${S.hurt * .45})`); g.fillStyle = gd2; g.fillRect(f.x, f.y, f.w, f.h); }
}
function drawUnit(u, x, y, t, i, q) {
  const base = 33 + u.layers * 1.6, sc = Math.max(.05, u.pop) * (1 + u.fire * .16), bob = Math.sin(t * 2.2 + i * 1.7) * 2.5, yy = y - 6 + bob - u.fire * 5;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x, y + 30, 26, 7, 0, 0, TAU); g.fill();
  if (u.awake) { g.save(); g.translate(x, yy); g.globalCompositeOperation = 'lighter'; const gd = g.createRadialGradient(0, 0, 8, 0, 0, 58); gd.addColorStop(0, 'rgba(255,220,110,.5)'); gd.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = gd; g.fillRect(-60, -60, 120, 120); g.globalCompositeOperation = 'source-over'; g.rotate(t * 1.6); g.strokeStyle = '#ffd24a'; g.lineWidth = 2.5; g.setLineDash([10, 7]); g.beginPath(); g.arc(0, 0, 44, 0, TAU); g.stroke(); g.setLineDash([]); g.rotate(-t * 3.2); for (let k = 0; k < 3; k++) { g.rotate(TAU / 3); g.fillStyle = '#fff3b0'; g.beginPath(); g.arc(44, 0, 3.4, 0, TAU); g.fill(); } g.restore(); }
  const rot = u.type === 'sword' ? Math.sin(t * 3 + i) * .1 - u.fire * .5 : u.type === 'cat' ? Math.sin(t * 2.4 + i) * .07 : u.type === 'thunder' ? Math.sin(t * 4 + i) * .06 : 0;
  put(g, sprite(u.type, base * q, true), x, yy, base * sc, rot);
  if (u.layers > 0) { const n = u.layers, w = 10; for (let k = 0; k < n; k++) { const sx = x - (n - 1) * w / 2 + k * w, sy = y + 36; g.fillStyle = u.awake ? '#ffd24a' : '#7df0ff'; g.strokeStyle = '#160c1a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sx, sy - 5.5); g.lineTo(sx + 4.5, sy); g.lineTo(sx, sy + 5.5); g.lineTo(sx - 4.5, sy); g.closePath(); g.fill(); g.stroke(); } }
}
function drawEnemy(e, t, q) {
  const d = e.def, px = e.r * 1.3; let x = e.x, y = e.y, rot = 0, sx = 1, sy = 1, al = 1, sh = 1;
  if (d.hop) { const h = Math.abs(Math.sin((S.time * d.hop + e.seed) * Math.PI)); y -= h * (d.final ? 12 : 16); sy = 1 - (1 - h) * .1; sx = 1 + (1 - h) * .06; sh = 1 - h * .35; }
  else if (e.type === 'ghost') { y += Math.sin(t * 3 + e.seed) * 5; sx = 1 + Math.sin(t * 5 + e.seed) * .05; al = .86 + Math.sin(t * 4 + e.seed) * .1; }
  else if (e.type === 'paper') { rot = Math.sin(t * 9 + e.seed) * .16; y -= Math.abs(Math.sin(t * 9 + e.seed)) * 5; }
  else if (e.type === 'flyer') { rot = Math.cos(S.time * 2.6 + e.sway) * .22; y += Math.sin(t * 6 + e.seed) * 4; }
  else if (e.type === 'bride') { sx = 1 + Math.sin(t * 2.4) * .04; rot = Math.sin(t * 1.6) * .04; y += Math.sin(t * 2) * 4; }
  else if (e.type === 'wuchang') { rot = Math.sin(t * 2.2 + e.seed) * .07; }
  g.fillStyle = 'rgba(0,0,0,.38)'; g.beginPath(); g.ellipse(e.x, e.y + e.r * .95, e.r * .85 * sh, e.r * .26 * sh, 0, 0, TAU); g.fill();
  if (d.boss) { const gd = g.createRadialGradient(e.x, y, e.r * .3, e.x, y, e.r * 2.2); gd.addColorStop(0, d.final ? 'rgba(255,110,20,.4)' : 'rgba(255,40,90,.32)'); gd.addColorStop(1, 'rgba(255,60,40,0)'); g.fillStyle = gd; g.fillRect(e.x - e.r * 2.3, y - e.r * 2.3, e.r * 4.6, e.r * 4.6); }
  g.globalAlpha = al; put(g, sprite(e.type, px * q), x, y, px, rot, sx, sy); g.globalAlpha = 1;
  if (e.flash > 0) { g.globalAlpha = .75; put(g, white(e.type, px * q), x, y, px, rot, sx, sy); g.globalAlpha = 1; }
  if (e.slow > 0) { g.fillStyle = 'rgba(240,255,220,.9)'; for (let k = 0; k < 5; k++) { const a = k * 1.3 + e.seed; g.beginPath(); g.ellipse(e.x + Math.cos(a) * e.r * .55, e.y + e.r * .6 + Math.sin(a * 2) * 5, 5, 2.6, a, 0, TAU); g.fill(); } }
  if (e.hp < e.max || d.boss || d.elite) { const bw = d.final ? 110 : d.boss ? 76 : d.elite ? 60 : 38, bh = d.boss ? 7 : 5, by = e.y - e.r * 1.35 - (d.hop ? 14 : 4) - (e.type === 'wuchang' || e.type === 'flyer' ? 8 : 0); g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(e.x - bw / 2 - 1, by - 1, bw + 2, bh + 2); g.fillStyle = d.boss ? '#ff3b5c' : d.elite ? '#c9a0ff' : '#ffd24a'; g.fillRect(e.x - bw / 2, by, bw * clamp(e.hp / e.max, 0, 1), bh);
    if (d.boss || d.elite) { g.font = `900 13px ${HEI}`; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.lineWidth = 3; g.strokeStyle = '#000'; g.strokeText(d.name, e.x, by - 3); g.fillStyle = '#ffe9a0'; g.fillText(d.name, e.x, by - 3); } }
}
function drawMachine(t) {
  const { reel, dpr } = L, cs = reel.cs, winSet = new Set(); if (S.win) for (const w of S.win.wins) w.ln.forEach((i) => winSet.add(i));
  for (let i = 0; i < 9; i++) {
    const col = i % 3, x = reel.x + col * cs, y = reel.y + Math.floor(i / 3) * cs, cx = x + cs / 2, cy = y + cs / 2 - cs * .07, px = cs * .34, locked = S.lock[i] > 0;
    g.save(); rr(g, x + 3, y + 3, cs - 6, cs - 6, 8); g.clip();
    if (S.spin && !S.spin.done[col] && !locked) { const k = S.spin.t * 12 + i * .37, off = k % 1, n = Math.floor(k); g.globalAlpha = .8; for (let j = 0; j < 2; j++) put(g, sprite(KEYS[(n * 5 + i * 3 + j * 4) % 6], px * dpr), cx, cy + (off - j) * cs, px, 0, 1, 1.25); g.globalAlpha = 1; const gd = g.createLinearGradient(0, y, 0, y + cs); gd.addColorStop(0, 'rgba(8,6,20,.9)'); gd.addColorStop(.3, 'rgba(8,6,20,0)'); gd.addColorStop(.7, 'rgba(8,6,20,0)'); gd.addColorStop(1, 'rgba(8,6,20,.9)'); g.fillStyle = gd; g.fillRect(x, y, cs, cs); }
    else { const win = winSet.has(i), sc = 1 + S.pop[i] * .22 + (win ? Math.abs(Math.sin(t * 7)) * .12 : 0), sym = S.reels[i];
      if (win) { g.fillStyle = `rgba(255,210,74,${.18 + Math.abs(Math.sin(t * 7)) * .14})`; g.fillRect(x, y, cs, cs); }
      put(g, sprite(sym, px * dpr, true), cx, cy + S.pop[i] * cs * .08, px * sc);
      g.font = `bold ${Math.max(10, cs * .15)}px ${HEI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = SYM[sym].col; g.fillText(SYM[sym].name, cx, y + cs * .87); }
    if (locked) { g.fillStyle = 'rgba(40,10,70,.72)'; g.fillRect(x, y, cs, cs); g.strokeStyle = '#c9a0ff'; g.lineWidth = 3; g.setLineDash([7, 5]); g.beginPath(); g.moveTo(x, y); g.lineTo(x + cs, y + cs); g.moveTo(x + cs, y); g.lineTo(x, y + cs); g.stroke(); g.setLineDash([]); g.font = `900 ${cs * .3}px ${KAI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#f0dcff'; g.fillText('封', cx, cy); g.font = `bold ${cs * .16}px ${HEI}`; g.fillText(Math.ceil(S.lock[i]) + ' 秒', cx, y + cs * .84); }
    g.restore();
    if (winSet.has(i)) { rr(g, x + 3, y + 3, cs - 6, cs - 6, 8); g.strokeStyle = '#ffd24a'; g.lineWidth = 3; g.stroke(); }
  }
  if (S.win) { const a = S.win.t < 1.5 ? 1 : (2 - S.win.t) * 2; g.lineCap = 'round'; for (const w of S.win.wins) { const p0 = cellPos(w.ln[0]), p1 = cellPos(w.ln[2]), dx = p1.x - p0.x, dy = p1.y - p0.y, dl = Math.hypot(dx, dy), ex = dx / dl * cs * .36, ey = dy / dl * cs * .36, col = w.jp ? '#ffd24a' : SYM[w.type].col; for (const [lw, c2, al] of [[14, col, .3], [6, col, .9], [2, '#fff', 1]]) { g.globalAlpha = a * al * (.75 + Math.sin(t * 16) * .25); g.strokeStyle = c2; g.lineWidth = lw; g.beginPath(); g.moveTo(p0.x - ex, p0.y - ey); g.lineTo(p1.x + ex, p1.y + ey); g.stroke(); } } g.globalAlpha = 1; }
  // 摇出来的法器飞向阵地
  for (const c of S.comets) { const k = c.t, e = k * k * (3 - 2 * k), x = c.x0 + (c.x1 - c.x0) * e, y = c.y0 + (c.y1 - c.y0) * e - Math.sin(k * Math.PI) * 60; g.globalCompositeOperation = 'lighter'; for (let j = 0; j < 7; j++) { const kk = Math.max(0, k - j * .03), ee = kk * kk * (3 - 2 * kk); g.globalAlpha = (1 - j / 7) * .7; g.fillStyle = c.col; g.beginPath(); g.arc(c.x0 + (c.x1 - c.x0) * ee, c.y0 + (c.y1 - c.y0) * ee - Math.sin(kk * Math.PI) * 60, 9 - j, 0, TAU); g.fill(); } g.globalAlpha = 1; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); g.globalCompositeOperation = 'source-over'; }
}
function drawCut() {
  if (S.cut <= 0) return; const { f, dpr } = L, k = 1 - S.cut / 1.5, a = k < .12 ? k / .12 : k > .8 ? (1 - k) / .2 : 1, cy = f.y + f.h * .42, bh = Math.min(f.h * .3, 220);
  g.save(); g.beginPath(); g.rect(f.x, f.y, f.w, f.h); g.clip(); g.fillStyle = `rgba(0,0,0,${a * .5})`; g.fillRect(f.x, f.y, f.w, f.h);
  g.globalAlpha = a; g.fillStyle = grad(g, 0, cy - bh / 2, 0, cy + bh / 2, ['rgba(255,210,74,0)', 'rgba(190,20,30,.92)', 'rgba(120,8,20,.95)', 'rgba(255,210,74,0)']); g.fillRect(f.x, cy - bh / 2, f.w, bh);
  g.strokeStyle = 'rgba(255,240,170,.5)'; g.lineWidth = 2; for (let i = 0; i < 12; i++) { const y = cy - bh * .4 + (i * 37 % (bh * .8)), x = f.x + ((i * 211 + k * 2600) % (f.w + 300)) - 150; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 130, y); g.stroke(); }
  const px = bh * .46, zx = f.x + f.w * (.28 + k * .06); put(g, sprite('zhongkui', px * dpr, true), zx, cy, px * (1 + (k < .15 ? (.15 - k) * 3 : 0)));
  g.font = `900 ${Math.min(bh * .32, f.w * .1)}px ${KAI}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = '#3a0408'; const tx = zx + px * 1.25 - k * 20; g.strokeText('天师降临', tx, cy); g.fillStyle = '#fff3b0'; g.fillText('天师降临', tx, cy); g.restore();
}
function draw(t) { g.setTransform(L.dpr, 0, 0, L.dpr, 0, 0); g.drawImage(bgc, 0, 0, L.W, L.H); drawField(t); drawMachine(t); drawCut(); }

/* ---------------- 电脑代打（调数值和演示用） ---------------- */
let botT = 0; const BOTP = ['heal', 'thunder', 'rice', 'seal', 'sword', 'lucky', 'wall', 'reward', 'lion', 'cat', 'refund', 'merge'];
function bot(dt) {
  botT -= dt; if (botT > 0) return; botT = .2;
  if (S.choice) { let bi = 0; S.choice.forEach((r, i) => { if (BOTP.indexOf(r.id) < BOTP.indexOf(S.choice[bi].id)) bi = i; }); if (S.hp > S.maxHp * .7 && S.choice[bi].id === 'heal' && S.choice.length > 1) bi = (bi + 1) % S.choice.length; return chooseRelic(bi); }
  const by = {}; S.units.forEach((u, i) => { if (u) (by[u.type] = by[u.type] || []).push(i); }); const full = S.units.every(Boolean);
  for (const tp in by) { const a = by[tp].sort((p, q2) => S.units[q2].layers - S.units[p].layers), top = S.units[a[0]]; if (a.length < 2 || top.layers >= MAXL) continue; const sum = a.reduce((n, i) => n + 1 + S.units[i].layers, 0) - 1; if (full || (!top.awake && sum >= 3) || (top.awake && a.length >= 3)) { merge(a[a.length - 1], a[0]); return; } }
  if (full) { const wi = S.units.findIndex((u) => wild(u)); let ti = -1; S.units.forEach((u, i) => { if (i !== wi && u.layers < MAXL && (ti < 0 || u.layers > S.units[ti].layers)) ti = i; }); if (wi >= 0 && ti >= 0) { merge(wi, ti); return; } }
  if (!S.spin && (S.free > 0 || S.gold >= SPIN_COST)) { spin(); return; }
  if (!S.active && !S.spin) startWave();
}

/* ---------------- 输入 ---------------- */
const toField = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - L.ox) / L.s, y: (e.clientY - r.top - L.oy) / L.s }; };
cv.addEventListener('pointerdown', (e) => { audio(); if (state !== 'play') return; const p = toField(e), i = hitSlot(p.x, p.y);
  if (i >= 0 && S.units[i]) { if (S.sel >= 0 && S.sel !== i && canMerge(S.units[S.sel], S.units[i])) { merge(S.sel, i); S.sel = -1; return; } S.drag = i; S.dx = p.x; S.dy = p.y; S.moved = false; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* 忽略 */ } }
  else if (i >= 0 && S.sel >= 0 && S.units[S.sel]) { S.units[i] = S.units[S.sel]; S.units[S.sel] = null; S.sel = -1; } else S.sel = -1; });
cv.addEventListener('pointermove', (e) => { if (state !== 'play' || S.drag < 0) return; const p = toField(e); if (Math.hypot(p.x - S.dx, p.y - S.dy) > 6) S.moved = true; S.dx = p.x; S.dy = p.y; });
const drop = (e) => { if (state !== 'play' || S.drag < 0) return; const p = toField(e), i = hitSlot(p.x, p.y), from = S.drag; S.drag = -1;
  if (i >= 0 && i !== from) { if (S.units[i]) { if (!merge(from, i)) { const pp = slotPos(i); text(pp.x, pp.y - 44, S.units[i].layers >= MAXL ? '已经满层了' : '只能和同类炼化', '#ff9a9a'); sfx.deny(); } } else { S.units[i] = S.units[from]; S.units[from] = null; } S.sel = -1; }
  else if (i === from && !S.moved) S.sel = S.sel === i ? -1 : i; };
cv.addEventListener('pointerup', drop); cv.addEventListener('pointercancel', () => { if (S) S.drag = -1; });
$('spin').onclick = () => { audio(); spin(); }; $('wave').onclick = () => { audio(); startWave(); };
$('speed').onclick = () => { S.speed = S.speed === 1 ? 2 : 1; $('speed').textContent = S.speed + '×'; };
const setMute = () => { muted = !muted; if (master) master.gain.value = muted ? 0 : .9; $('mute').textContent = muted ? '静' : '声'; };
$('mute').onclick = setMute;
addEventListener('keydown', (e) => { if (e.code === 'KeyM') setMute(); if (state !== 'play') { if (e.code === 'Enter' || e.code === 'Space') { const b = $('go'); if (b) b.click(); } return; } if (e.code === 'Space') { e.preventDefault(); audio(); spin(); } else if (e.code === 'Enter') { audio(); startWave(); } else if (S.choice && ['Digit1', 'Digit2', 'Digit3'].includes(e.code)) chooseRelic(+e.code.slice(5) - 1); });
addEventListener('resize', layout);

/* ---------------- 主循环和调试入口 ---------------- */
let last = performance.now();
function step(dt) { if (state !== 'play') return; if (S.auto) bot(dt); if (state === 'play') update(dt, dt); }
function frame(now) { requestAnimationFrame(frame); const real = Math.min(.05, (now - last) / 1000); last = now; if (state === 'play') { const dt = real * S.speed; if (S.auto) bot(dt); update(dt, real); } music(); draw(now / 1000); }
window.__merit = { K, get S() { return S; }, get L() { return L; }, state: () => state, start: (auto) => newGame(!!auto), title, spin, startWave, merge, chooseRelic, jackpot: () => spin(true), give: (n = 200) => { S.gold += n; hud(); }, spawn, summon, clips,
  step: (sec, dt = 1 / 30) => { for (let t = 0; t < sec && state === 'play'; t += dt) step(dt); draw(performance.now() / 1000); return { wave: S.wave, hp: S.hp, gold: S.gold, state }; },
  // 让电脑不渲染地连打 n 局，返回每局结果
  sim: (n = 20) => { simming = true; const out = []; for (let k = 0; k < n; k++) { newGame(true); let guard = 0; while (state === 'play' && guard++ < 40000) step(1 / 30); out.push({ lay: S.units.reduce((n, u) => n + (u ? 1 + u.layers : 0), 0), stuck: state === 'play', gold: S.gold, wave: S.wave, win: S.won, hp: S.hp, t: Math.round(S.time), score: S.score, spins: S.stats.spins, units: S.units.filter(Boolean).map((u) => u.type[0] + u.layers).join(' ') }); } simming = false; title(); return out; } };
layout(); title(); requestAnimationFrame(frame);
