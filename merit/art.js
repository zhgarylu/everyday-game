// 天师摇人 · 素材：所有符号、单位、敌人都在这里用路径画出来，再缓存成位图
const TAU = Math.PI * 2, OUT = '#160c1a';
export const KAI = '"Kaiti SC","STKaiti","KaiTi","楷体",serif';
export const HEI = '"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
const lg = (c, x0, y0, x1, y1, st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach((s, i) => g.addColorStop(i / (st.length - 1), s)); return g; };
const rg = (c, x, y, r, st, fx = x, fy = y) => { const g = c.createRadialGradient(fx, fy, 0, x, y, r); st.forEach((s, i) => g.addColorStop(i / (st.length - 1), s)); return g; };
const poly = (c, p, close = true) => { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); if (close) c.closePath(); };
const ell = (c, x, y, rx, ry, rot = 0, a0 = 0, a1 = TAU) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, a0, a1); };
const fs = (c, fill, stroke = OUT, lw = .045) => { if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.lineJoin = c.lineCap = 'round'; c.stroke(); } };
const line = (c, p, col, lw) => { poly(c, p, false); c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = c.lineCap = 'round'; c.stroke(); };
// 字号在单位坐标里太小，放大 100 倍再写
const txt = (c, s, x, y, size, col, font = KAI, stroke = null) => { c.save(); c.translate(x, y); c.scale(.01, .01); c.font = `bold ${size * 100}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle'; if (stroke) { c.strokeStyle = stroke; c.lineWidth = size * 14; c.lineJoin = 'round'; c.strokeText(s, 0, 0); } c.fillStyle = col; c.fillText(s, 0, 0); c.restore(); };
const rnd = (seed) => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const shine = (c, x, y, r, a = .8) => { c.save(); c.globalAlpha = a; c.fillStyle = '#fff'; c.beginPath(); for (let i = 0; i < 8; i++) { const an = i / 8 * TAU, rr = i % 2 ? r * .22 : r; c.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } c.fill(); c.restore(); };
const GOLD = (c, y0, y1) => lg(c, 0, y0, 0, y1, ['#fff3b0', '#ffd24a', '#e39a17', '#a5600c']);

/* ---------------- 符号 / 单位 ---------------- */
function sword(c) {
  c.rotate(.62); c.scale(1.12, 1.12); c.translate(0, .02);
  // 剑穗
  line(c, [0, .8, .1, .92, .04, 1.04], '#c0162c', .05); line(c, [0, .8, -.08, .95, -.14, 1.06], '#e0283c', .05); line(c, [0, .8, .0, .98, -.03, 1.1], '#a01024', .04);
  // 剑身
  poly(c, [0, -1.0, .135, -.76, .115, .26, -.115, .26, -.135, -.76]); fs(c, lg(c, -.14, 0, .14, 0, ['#6d2f14', '#b9692f', '#f0b673', '#c57a3a', '#6a2c12']), OUT, .05);
  line(c, [0, -.9, 0, .22], 'rgba(255,230,180,.75)', .022);
  line(c, [-.07, -.7, -.06, .2], 'rgba(80,30,10,.35)', .015); line(c, [.07, -.7, .06, .2], 'rgba(80,30,10,.35)', .015);
  // 七星
  const st = [[0, -.7], [.04, -.54], [-.04, -.4], [.03, -.26], [-.03, -.12], [.04, .02], [0, .15]];
  c.save(); c.shadowColor = '#5ff'; c.shadowBlur = 8; line(c, st.flat(), 'rgba(120,255,255,.8)', .014); for (const [x, y] of st) { ell(c, x, y, .034, .034); fs(c, '#d8ffff', null); } c.restore();
  // 护手（元宝形）
  c.beginPath(); c.moveTo(-.36, .25); c.quadraticCurveTo(-.2, .34, 0, .3); c.quadraticCurveTo(.2, .34, .36, .25); c.lineTo(.27, .43); c.lineTo(-.27, .43); c.closePath(); fs(c, GOLD(c, .24, .44), OUT, .045);
  ell(c, 0, .35, .075, .075); fs(c, '#fff', OUT, .02); ell(c, 0, .35, .075, .075, 0, -Math.PI / 2, Math.PI / 2); fs(c, '#151515', null);
  // 剑柄
  poly(c, [-.07, .43, .07, .43, .065, .76, -.065, .76]); fs(c, lg(c, -.07, 0, .07, 0, ['#6b0d16', '#d62438', '#7a0f1a']), OUT, .04);
  for (let i = 0; i < 4; i++) line(c, [-.065, .49 + i * .075, .065, .45 + i * .075], '#ffd24a', .018);
  ell(c, 0, .8, .09, .075); fs(c, GOLD(c, .72, .88), OUT, .04);
  ell(c, -.1, .97, .045, .045); fs(c, '#3fe08a', OUT, .02);
}
function rice(c) {
  const r = rnd(7);
  // 碗后沿
  ell(c, 0, .02, .8, .17); fs(c, '#c9d6f5', OUT, .045);
  // 饭堆
  c.beginPath(); c.moveTo(-.68, .04); c.bezierCurveTo(-.66, -.5, -.3, -.78, 0, -.8); c.bezierCurveTo(.3, -.78, .66, -.5, .68, .04); c.closePath(); fs(c, rg(c, 0, -.2, .8, ['#ffffff', '#f4fbe2', '#cfe3a8'], -.2, -.5), OUT, .045);
  for (let i = 0; i < 46; i++) { const a = r() * Math.PI, d = Math.sqrt(r()) * .6, x = Math.cos(a) * d * 1.02, y = -Math.sin(a) * d * 1.1 - .06; c.save(); c.translate(x, y); c.rotate(r() * 3); ell(c, 0, 0, .062, .03); fs(c, '#fff', 'rgba(150,170,110,.75)', .014); c.restore(); }
  // 碗身
  c.beginPath(); c.moveTo(-.8, .02); c.bezierCurveTo(-.78, .42, -.5, .68, -.3, .7); c.lineTo(.3, .7); c.bezierCurveTo(.5, .68, .78, .42, .8, .02); c.bezierCurveTo(.5, .2, -.5, .2, -.8, .02); c.closePath(); fs(c, lg(c, -.8, 0, .8, 0, ['#b9c8ee', '#ffffff', '#f2f6ff', '#9fb2e2']), OUT, .05);
  poly(c, [-.3, .7, .3, .7, .27, .82, -.27, .82]); fs(c, '#dfe7fb', OUT, .045);
  // 青花
  c.save(); c.beginPath(); c.moveTo(-.8, .02); c.bezierCurveTo(-.78, .42, -.5, .68, -.3, .7); c.lineTo(.3, .7); c.bezierCurveTo(.5, .68, .78, .42, .8, .02); c.bezierCurveTo(.5, .2, -.5, .2, -.8, .02); c.clip();
  c.strokeStyle = '#2446b0'; c.lineWidth = .028; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-.76, .25); c.bezierCurveTo(-.4, .38, .4, .38, .76, .25); c.stroke();
  c.beginPath(); c.moveTo(-.5, .62); c.bezierCurveTo(-.2, .68, .2, .68, .5, .62); c.stroke();
  for (let i = -2; i <= 2; i++) { const x = i * .26, y = .48 - Math.abs(i) * .02; c.beginPath(); c.arc(x, y, .075, 0, TAU); c.stroke(); c.beginPath(); c.arc(x, y, .028, 0, TAU); c.fillStyle = '#2446b0'; c.fill(); if (i < 2) { c.beginPath(); c.moveTo(x + .09, y); c.quadraticCurveTo(x + .13, y - .07, x + .17, y); c.stroke(); } }
  c.restore();
  // 飞出的米粒
  for (const [x, y, a] of [[-.5, -.82, .5], [.42, -.92, -.4], [.08, -1.02, 1.2], [.66, -.62, .2]]) { c.save(); c.translate(x, y); c.rotate(a); c.shadowColor = '#9f6'; c.shadowBlur = 10; ell(c, 0, 0, .07, .035); fs(c, '#fff', '#7c9a52', .016); c.restore(); }
  shine(c, -.38, -.5, .11);
}
function thunder(c) {
  c.rotate(-.1);
  const paper = [-.44, -.92, .44, -.92, .44, .8, .3, .93, .15, .82, 0, .95, -.15, .82, -.3, .93, -.44, .8];
  poly(c, paper); fs(c, lg(c, -.44, -.9, .44, .9, ['#fff0a0', '#ffd93d', '#f2ae1c', '#d98a10']), OUT, .05);
  c.save(); poly(c, paper); c.clip(); c.fillStyle = 'rgba(160,80,0,.16)'; c.fillRect(.2, -1, .3, 2); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-.44, -1, .14, 2); c.restore();
  line(c, [-.34, -.74, .34, -.74], '#b3141a', .03); line(c, [-.34, -.69, .34, -.69], '#b3141a', .014);
  txt(c, '敕令', 0, -.54, .26, '#b3141a');
  // 朱砂符文
  c.strokeStyle = '#b3141a'; c.lineWidth = .04; c.lineCap = c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-.22, -.34); c.quadraticCurveTo(0, -.44, .22, -.34); c.stroke();
  c.beginPath(); c.moveTo(0, -.38); c.lineTo(0, .06); c.stroke();
  c.beginPath(); c.moveTo(-.2, -.22); c.bezierCurveTo(.3, -.2, .3, -.06, -.2, -.06); c.bezierCurveTo(.3, -.04, .3, .1, -.16, .1); c.stroke();
  txt(c, '雷', 0, .44, .52, '#b3141a');
  // 电光
  c.save(); c.shadowColor = '#9ef'; c.shadowBlur = 12;
  line(c, [.52, -.7, .68, -.38, .56, -.36, .74, -.02], '#eaffff', .04); line(c, [-.56, .1, -.72, .38, -.6, .4, -.76, .7], '#eaffff', .04); c.restore();
}
function lion(c) {
  const stone = (x, y, r) => rg(c, x, y, r, ['#cfe0d6', '#93aaa0', '#55695f'], x - r * .3, y - r * .4);
  // 鬃毛卷
  for (let i = 0; i < 11; i++) { const a = -Math.PI * 1.22 + i / 10 * Math.PI * 1.44 + Math.PI, x = Math.cos(a) * .64, y = Math.sin(a) * .6 - .02; ell(c, x, y, .23, .23); fs(c, stone(x, y, .23), OUT, .045); c.beginPath(); c.arc(x, y, .12, a, a + 4.4); c.strokeStyle = 'rgba(40,60,52,.7)'; c.lineWidth = .03; c.stroke(); }
  // 耳朵
  for (const s of [-1, 1]) { ell(c, s * .52, -.42, .15, .17); fs(c, stone(s * .52, -.42, .16), OUT, .04); ell(c, s * .52, -.4, .07, .09); fs(c, '#b9505a', null); }
  // 脸
  ell(c, 0, .04, .6, .58); fs(c, stone(0, 0, .62), OUT, .05);
  // 头顶红绸花
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ell(c, Math.cos(a) * .13, -.62 + Math.sin(a) * .11, .12, .1, a); fs(c, lg(c, 0, -.76, 0, -.48, ['#ff5a66', '#b80f22']), OUT, .03); }
  ell(c, 0, -.62, .075, .07); fs(c, GOLD(c, -.7, -.54), OUT, .025);
  line(c, [-.14, -.56, -.36, -.4, -.3, -.24], '#c41528', .07); line(c, [.14, -.56, .36, -.4, .3, -.24], '#c41528', .07);
  // 眉
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * .08, -.2); c.bezierCurveTo(s * .2, -.42, s * .44, -.4, s * .52, -.2); c.bezierCurveTo(s * .4, -.28, s * .22, -.26, s * .08, -.12); c.closePath(); fs(c, '#3f5249', OUT, .03); }
  // 眼
  for (const s of [-1, 1]) { ell(c, s * .25, -.1, .14, .12); fs(c, '#fff', OUT, .035); ell(c, s * .23, -.09, .085, .085); fs(c, rg(c, s * .23, -.09, .09, ['#fff2a0', '#ffb300', '#c56a00']), null); ell(c, s * .22, -.09, .04, .04); fs(c, '#150a00', null); ell(c, s * .25, -.12, .02, .02); fs(c, '#fff', null); }
  // 鼻
  c.beginPath(); c.moveTo(-.16, .1); c.quadraticCurveTo(0, 0, .16, .1); c.quadraticCurveTo(.18, .24, 0, .26); c.quadraticCurveTo(-.18, .24, -.16, .1); fs(c, '#465a50', OUT, .035);
  ell(c, -.07, .18, .03, .025); fs(c, '#1c2622', null); ell(c, .07, .18, .03, .025); fs(c, '#1c2622', null);
  // 嘴
  c.beginPath(); c.moveTo(-.4, .3); c.quadraticCurveTo(0, .22, .4, .3); c.quadraticCurveTo(.34, .66, 0, .68); c.quadraticCurveTo(-.34, .66, -.4, .3); fs(c, '#4a0b12', OUT, .045);
  for (let i = -3; i <= 3; i++) if (i) { const x = i * .085; poly(c, [x - .035, .285, x + .035, .285, x + (Math.abs(i) === 3 ? 0 : .03), Math.abs(i) === 3 ? .44 : .35, x - (Math.abs(i) === 3 ? 0 : .03), Math.abs(i) === 3 ? .44 : .35]); fs(c, '#fffbe8', OUT, .018); }
  ell(c, 0, .5, .13, .13); fs(c, rg(c, 0, .5, .14, ['#ffb0b0', '#ff2a3c', '#8c0714'], -.04, .45), OUT, .03);
  // 铃铛
  ell(c, 0, .82, .11, .11); fs(c, GOLD(c, .7, .94), OUT, .035); line(c, [-.08, .84, .08, .84], OUT, .02); ell(c, 0, .89, .02, .02); fs(c, OUT, null);
}
function cat(c) {
  const fur = (x, y, r) => rg(c, x, y, r, ['#ffffff', '#fdf6ee', '#e6d3c4'], x - r * .3, y - r * .4);
  // 身子
  ell(c, 0, .46, .52, .46); fs(c, fur(0, .4, .56), OUT, .05);
  // 举起的手
  c.save(); c.translate(.5, -.34); c.rotate(.3); ell(c, 0, 0, .15, .34); fs(c, fur(0, 0, .3), OUT, .045); c.restore();
  ell(c, .6, -.66, .17, .16); fs(c, fur(.6, -.66, .18), OUT, .045);
  for (const [x, y] of [[.53, -.7], [.6, -.74], [.67, -.7]]) { ell(c, x, y, .028, .034); fs(c, '#ff9db5', null); } ell(c, .6, -.63, .05, .04); fs(c, '#ff9db5', null);
  // 耳朵
  for (const s of [-1, 1]) { poly(c, [s * .2, -.56, s * .5, -.86, s * .56, -.4]); fs(c, s < 0 ? '#f0983a' : '#3a3038', OUT, .045); poly(c, [s * .3, -.54, s * .46, -.72, s * .49, -.46]); fs(c, '#ff8fa8', null); }
  // 头
  ell(c, 0, -.2, .56, .47); fs(c, fur(0, -.25, .6), OUT, .05);
  c.save(); ell(c, 0, -.2, .56, .47); c.clip(); ell(c, -.4, -.56, .26, .2); fs(c, '#f0983a', null); ell(c, .42, -.56, .24, .19); fs(c, '#3a3038', null); c.restore();
  // 眼、鼻、嘴、胡须、腮红
  for (const s of [-1, 1]) { c.beginPath(); c.arc(s * .24, -.18, .1, Math.PI * 1.1, Math.PI * 1.9); c.strokeStyle = OUT; c.lineWidth = .05; c.lineCap = 'round'; c.stroke(); ell(c, s * .36, -.03, .1, .065); fs(c, 'rgba(255,120,150,.55)', null); line(c, [s * .34, -.1, s * .7, -.16], OUT, .018); line(c, [s * .34, -.05, s * .7, -.02], OUT, .018); }
  poly(c, [-.045, -.1, .045, -.1, 0, -.05]); fs(c, '#ff7a98', OUT, .02);
  c.beginPath(); c.moveTo(-.1, .0); c.quadraticCurveTo(-.05, .06, 0, -.03); c.quadraticCurveTo(.05, .06, .1, 0); c.strokeStyle = OUT; c.lineWidth = .03; c.stroke();
  // 项圈和铃铛
  c.beginPath(); c.moveTo(-.4, .14); c.quadraticCurveTo(0, .3, .4, .14); c.lineTo(.42, .23); c.quadraticCurveTo(0, .4, -.42, .23); c.closePath(); fs(c, lg(c, 0, .14, 0, .36, ['#ff4a5c', '#a80d20']), OUT, .035);
  ell(c, 0, .34, .095, .095); fs(c, GOLD(c, .24, .44), OUT, .03); line(c, [-.07, .35, .07, .35], OUT, .018);
  // 小判
  c.save(); c.translate(-.2, .6); c.rotate(-.12); ell(c, 0, 0, .2, .29); fs(c, GOLD(c, -.3, .3), OUT, .04); ell(c, 0, 0, .15, .24); c.strokeStyle = 'rgba(140,70,0,.6)'; c.lineWidth = .014; c.stroke(); txt(c, '福', 0, .01, .25, '#8a1a10'); c.restore();
  ell(c, .02, .68, .13, .1); fs(c, fur(.02, .68, .13), OUT, .04);
  ell(c, .34, .84, .15, .08); fs(c, fur(.34, .84, .15), OUT, .04);
}
function seal(c) {
  // 红绸
  c.lineCap = 'round'; for (const [s, col] of [[-1, '#d81b34'], [1, '#b01028']]) { c.beginPath(); c.moveTo(.07 + s * .1, -.44); c.bezierCurveTo(.07 + s * .7, -.62, .07 + s * .95, -.1, .07 + s * .7, .34); c.strokeStyle = OUT; c.lineWidth = .15; c.stroke(); c.strokeStyle = col; c.lineWidth = .09; c.stroke(); for (let i = -1; i <= 1; i++) line(c, [.07 + s * .7, .34, .07 + s * .7 + i * .06, .56], col, .035); }
  // 印钮（拱形）
  c.lineCap = 'round'; c.beginPath(); c.arc(.07, -.18, .27, Math.PI, 0); c.strokeStyle = OUT; c.lineWidth = .24; c.stroke(); c.beginPath(); c.arc(.07, -.18, .27, Math.PI, 0); c.strokeStyle = lg(c, 0, -.5, 0, -.1, ['#fff6c0', '#ffcf40', '#c47c0c']); c.lineWidth = .15; c.stroke();
  c.beginPath(); c.arc(.07, -.18, .29, Math.PI * 1.15, Math.PI * 1.6); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .03; c.stroke();
  // 印身三个面
  poly(c, [-.52, .0, -.36, -.2, .66, -.2, .52, .0]); fs(c, lg(c, 0, -.2, 0, 0, ['#fff3b0', '#ffd75a']), OUT, .045);
  poly(c, [.52, .0, .66, -.2, .66, .5, .52, .72]); fs(c, lg(c, .52, 0, .66, 0, ['#b06a08', '#7c4504']), OUT, .045);
  poly(c, [-.52, 0, .52, 0, .52, .72, -.52, .72]); fs(c, lg(c, -.52, 0, .52, .72, ['#ffe680', '#f6b425', '#c9810d']), OUT, .05);
  poly(c, [-.4, .1, .4, .1, .4, .62, -.4, .62]); fs(c, '#a3121c', '#6b0a10', .03);
  txt(c, '敕', 0, .37, .46, '#ffe9a0');
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-.5, .02, .07, .68);
  shine(c, -.42, -.12, .13); shine(c, .6, .2, .08, .7);
}
function zhongkui(c) {
  // 官袍
  poly(c, [-.86, 1.0, -.7, .46, -.3, .3, .3, .3, .7, .46, .86, 1.0]); fs(c, lg(c, 0, .3, 0, 1, ['#e02437', '#8c0b1a']), OUT, .05);
  c.beginPath(); c.arc(0, .86, .2, 0, TAU); fs(c, GOLD(c, .66, 1.06), OUT, .03); txt(c, '馗', 0, .87, .24, '#7a0f10');
  // 帽翅
  for (const s of [-1, 1]) { ell(c, s * .78, -.6, .26, .085, s * -.12); fs(c, lg(c, 0, -.7, 0, -.5, ['#3a3a48', '#0c0c12']), OUT, .04); ell(c, s * .78, -.6, .17, .035, s * -.12); c.strokeStyle = '#ffd24a'; c.lineWidth = .02; c.stroke(); }
  // 大胡子（后层）
  const beard = [-.56, -.22]; for (let i = 0; i <= 12; i++) { const t = i / 12, a = Math.PI * (1 - t), R = i % 2 ? .78 : .6; beard.push(Math.cos(a) * R * .78, .0 + Math.sin(a) * R * .98); } beard.push(.56, -.22);
  poly(c, beard); fs(c, lg(c, 0, -.2, 0, .8, ['#2a2a3a', '#08080e']), OUT, .05);
  // 脸
  ell(c, 0, -.2, .42, .4); fs(c, rg(c, 0, -.22, .46, ['#f08a62', '#cf4f36', '#8a2418'], -.1, -.36), OUT, .05);
  // 眉、眼
  for (const s of [-1, 1]) { poly(c, [s * .05, -.3, s * .42, -.52, s * .46, -.4, s * .08, -.22]); fs(c, '#0c0c12', OUT, .02); ell(c, s * .2, -.18, .12, .1); fs(c, '#fff', OUT, .035); ell(c, s * .17, -.17, .045, .045); fs(c, '#0c0c12', null); }
  // 鼻、嘴、胡子（前层）
  ell(c, 0, -.03, .1, .075); fs(c, '#a8351f', OUT, .03);
  c.beginPath(); c.moveTo(-.4, .02); c.quadraticCurveTo(-.2, .0, 0, .06); c.quadraticCurveTo(.2, 0, .4, .02); c.quadraticCurveTo(.3, .34, 0, .2); c.quadraticCurveTo(-.3, .34, -.4, .02); fs(c, '#0c0c12', OUT, .03);
  poly(c, [-.14, .12, .14, .12, .11, .2, -.11, .2]); fs(c, '#fffbe8', OUT, .02); for (const x of [-.07, 0, .07]) line(c, [x, .12, x, .2], OUT, .012);
  for (let i = 0; i < 7; i++) { const x = -.36 + i * .12; line(c, [x, .3, x * 1.25, .62 - Math.abs(x) * .3], 'rgba(120,130,200,.35)', .016); }
  // 乌纱帽
  c.beginPath(); c.moveTo(-.46, -.5); c.quadraticCurveTo(-.46, -.82, -.2, -.84); c.lineTo(-.2, -1.0); c.quadraticCurveTo(0, -1.08, .2, -1.0); c.lineTo(.2, -.84); c.quadraticCurveTo(.46, -.82, .46, -.5); c.closePath(); fs(c, lg(c, -.46, -1, .46, -.5, ['#40404e', '#0a0a10']), OUT, .05);
  poly(c, [-.46, -.56, .46, -.56, .46, -.47, -.46, -.47]); fs(c, GOLD(c, -.57, -.46), OUT, .025);
  ell(c, 0, -.68, .075, .09); fs(c, rg(c, 0, -.68, .09, ['#d6ffe6', '#22c06a', '#0b6a36'], -.02, -.71), OUT, .025);
}
function coin(c) { ell(c, 0, 0, .9, .9); fs(c, rg(c, 0, 0, .95, ['#fff4b0', '#ffc933', '#b06c08'], -.3, -.35), OUT, .1); ell(c, 0, 0, .66, .66); c.strokeStyle = 'rgba(120,60,0,.6)'; c.lineWidth = .06; c.stroke(); poly(c, [-.26, -.26, .26, -.26, .26, .26, -.26, .26]); fs(c, '#3a2206', OUT, .08); }
function grain(c) { c.shadowColor = '#bf8'; c.shadowBlur = 8; for (const [x, y, a] of [[-.35, -.2, .4], [.3, -.3, -.6], [0, .3, 1.3], [.45, .25, .2], [-.4, .35, -1]]) { c.save(); c.translate(x, y); c.rotate(a); ell(c, 0, 0, .34, .17); fs(c, '#fff', '#8fae5c', .06); c.restore(); } }
function stamp(c) { poly(c, [-.8, -.8, .8, -.8, .8, .8, -.8, .8]); c.strokeStyle = '#ff3b3b'; c.lineWidth = .14; c.lineJoin = 'miter'; c.stroke(); txt(c, '敕', 0, .04, 1.25, '#ff3b3b'); }
function talisman(c) { poly(c, [-.4, -.95, .4, -.95, .4, .95, -.4, .95]); fs(c, lg(c, 0, -1, 0, 1, ['#ffe98a', '#f5b423']), OUT, .07); c.strokeStyle = '#b3141a'; c.lineWidth = .09; c.lineCap = 'round'; c.beginPath(); c.moveTo(-.2, -.7); c.lineTo(.2, -.7); c.moveTo(0, -.7); c.lineTo(0, -.2); c.bezierCurveTo(.5, -.1, .5, .25, -.2, .2); c.bezierCurveTo(.5, .3, .4, .7, -.15, .7); c.stroke(); }

/* ---------------- 敌人 ---------------- */
function ghost(c) {
  // 鬼火
  for (const [x, y, s] of [[-.82, -.3, .2], [.8, .1, .16]]) { c.beginPath(); c.moveTo(x, y - s * 1.6); c.bezierCurveTo(x + s * 1.2, y - s * .2, x + s * .8, y + s, x, y + s); c.bezierCurveTo(x - s * .8, y + s, x - s * 1.2, y - s * .2, x, y - s * 1.6); fs(c, rg(c, x, y + s * .2, s * 1.4, ['#f2fffa', '#5df2c8', 'rgba(20,160,160,0)']), null); }
  // 身体
  c.beginPath(); c.moveTo(-.58, -.2); c.bezierCurveTo(-.58, -.98, .58, -.98, .58, -.2); c.bezierCurveTo(.62, .3, .5, .56, .46, .78); c.quadraticCurveTo(.34, .6, .22, .8); c.quadraticCurveTo(.1, .98, 0, .78); c.quadraticCurveTo(-.12, .6, -.24, .82); c.quadraticCurveTo(-.36, 1.02, -.46, .76); c.bezierCurveTo(-.52, .5, -.62, .3, -.58, -.2); c.closePath();
  fs(c, lg(c, 0, -.9, 0, 1, ['#f6ffff', '#bdf3f2', '#5fc9d6', 'rgba(40,130,170,.35)']), '#0d4a60', .05);
  // 天冠（三角巾）
  line(c, [-.52, -.5, 0, -.6, .52, -.5], '#fff', .05); poly(c, [-.2, -.6, .2, -.6, 0, -.96]); fs(c, '#ffffff', '#6aa6b5', .035);
  // 脸
  for (const s of [-1, 1]) { ell(c, s * .22, -.28, .1, .14, s * .25); fs(c, '#0a2a3a', null); ell(c, s * .2, -.32, .03, .04); fs(c, '#bff', null); }
  ell(c, 0, -.02, .07, .1); fs(c, '#0a2a3a', null);
  // 垂着的手
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * .3, .16); c.quadraticCurveTo(s * .46, .2, s * .42, .44); c.quadraticCurveTo(s * .32, .5, s * .26, .4); c.quadraticCurveTo(s * .34, .3, s * .22, .26); fs(c, '#e9ffff', '#0d4a60', .035); }
}
function paper(c) {
  c.rotate(.04);
  // 竹竿
  line(c, [0, .6, 0, 1.02], '#8a6a2a', .05);
  // 手臂（平举）
  for (const s of [-1, 1]) { poly(c, [s * .26, -.02, s * .82, -.1, s * .84, .1, s * .26, .2]); fs(c, s < 0 ? '#2fa55a' : '#2fa55a', '#fff', .05); ell(c, s * .88, 0, .09, .1); fs(c, '#fbfbf2', OUT, .03); poly(c, [s * .6, -.08, s * .68, -.09, s * .68, .13, s * .6, .14]); fs(c, '#ffd24a', null); }
  // 身子
  poly(c, [-.3, -.08, .3, -.08, .46, .8, -.46, .8]); fs(c, lg(c, 0, -.1, 0, .8, ['#e8303f', '#b3141f']), '#fff', .06);
  poly(c, [-.3, -.08, .3, -.08, .34, .16, -.34, .16]); fs(c, '#2fa55a', null);
  line(c, [0, -.08, 0, .8], 'rgba(255,255,255,.35)', .02); line(c, [-.34, .16, .34, .16], '#ffd24a', .04);
  for (const y of [.36, .56]) { ell(c, 0, y, .05, .05); fs(c, '#ffd24a', OUT, .02); }
  poly(c, [-.46, .8, .46, .8, .44, .7, -.44, .7]); fs(c, '#ffd24a', null);
  // 头
  ell(c, 0, -.46, .4, .4); fs(c, '#fbfbf2', '#fff', .06); ell(c, 0, -.46, .4, .4); c.strokeStyle = OUT; c.lineWidth = .03; c.stroke();
  // 头发和两个髻
  c.beginPath(); c.arc(0, -.46, .4, Math.PI * 1.02, Math.PI * 1.98); c.quadraticCurveTo(0, -.62, -.4, -.5); fs(c, '#15151c', null);
  for (const s of [-1, 1]) { ell(c, s * .36, -.84, .13, .13); fs(c, '#15151c', OUT, .02); ell(c, s * .34, -.74, .06, .035); fs(c, '#e8303f', null); }
  // 脸：不点睛
  for (const s of [-1, 1]) { ell(c, s * .22, -.3, .11, .11); fs(c, '#f0364a', null); c.beginPath(); c.arc(s * .15, -.46, .075, Math.PI * .1, Math.PI * .9); c.strokeStyle = OUT; c.lineWidth = .035; c.lineCap = 'round'; c.stroke(); }
  c.beginPath(); c.arc(0, -.32, .12, Math.PI * .15, Math.PI * .85); c.strokeStyle = '#b3141f'; c.lineWidth = .04; c.stroke();
  ell(c, 0, -.6, .03, .03); fs(c, '#e8303f', null);
}
// 清朝僵尸。v：robe 袍色，skin 肤色，hair 毛僵的毛，king 旱魃
function jiangshi(c, v = {}) {
  const robe = v.robe || ['#2a4688', '#14224a'], skin = v.skin || ['#d8f0d2', '#9cc7a0', '#5d8a6a'], trim = v.trim || '#ffd24a';
  const sk = (x, y, r) => rg(c, x, y, r, skin, x - r * .3, y - r * .4);
  if (v.king) { // 披散的白发和火
    for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i / 8 * .9), x = Math.cos(a) * .62, y = -.32 + Math.sin(a) * .62; c.beginPath(); c.moveTo(x * .5, y * .5 - .2); c.quadraticCurveTo(x * 1.2, y, x * 1.15 + (i % 2 ? .08 : -.08), y - .3 - (i % 3) * .1); c.quadraticCurveTo(x * .8, y, x * .2, -.2); fs(c, rg(c, 0, -.4, 1.1, ['#fff7c0', '#ff9a1f', 'rgba(220,40,10,.0)']), null); }
    c.beginPath(); c.moveTo(-.44, -.5); c.bezierCurveTo(-.9, -.2, -.74, .5, -.86, .8); c.lineTo(-.4, .3); c.lineTo(.4, .3); c.lineTo(.86, .8); c.bezierCurveTo(.74, .5, .9, -.2, .44, -.5); fs(c, lg(c, 0, -.5, 0, .8, ['#f4f4f4', '#a9a9b5']), OUT, .04);
  }
  // 靴
  for (const s of [-1, 1]) { poly(c, [s * .1, .78, s * .34, .78, s * .38, .96, s * .06, .96]); fs(c, '#101018', OUT, .04); line(c, [s * .06, .96, s * .38, .96], '#f2f2f2', .04); }
  // 袍
  poly(c, [-.36, -.06, .36, -.06, .5, .82, -.5, .82]); fs(c, lg(c, 0, -.06, 0, .82, robe), OUT, .05);
  line(c, [-.48, .72, .48, .72], trim, .035); for (let i = -4; i <= 4; i++) line(c, [i * .1, .76, i * .1 + .04, .8], trim, .016);
  // 补子
  poly(c, [-.2, .1, .2, .1, .2, .46, -.2, .46]); fs(c, v.king ? '#7a0f10' : '#1d6fb8', trim, .035);
  ell(c, 0, .26, .08, .055); fs(c, '#fff', null); line(c, [.05, .24, .13, .18], '#fff', .03); line(c, [-.06, .3, -.1, .4], '#fff', .02); ell(c, .12, .16, .03, .03); fs(c, '#e8303f', null);
  // 朝珠
  c.beginPath(); c.arc(0, -.02, .26, Math.PI * .12, Math.PI * .88); c.setLineDash([.035, .03]); c.strokeStyle = v.king ? '#ff9a1f' : '#e04a3a'; c.lineWidth = .045; c.stroke(); c.setLineDash([]);
  if (v.king) for (const s of [-1, 1]) { poly(c, [s * .3, -.14, s * .68, -.08, s * .62, .12, s * .34, .06]); fs(c, lg(c, 0, -.14, 0, .12, ['#ffe680', '#b06a08']), OUT, .04); }
  // 前伸的手臂：袖口朝着我们
  for (const s of [-1, 1]) {
    poly(c, [s * .3, -.04, s * .56, .02, s * .58, .36, s * .28, .34]); fs(c, lg(c, 0, -.04, 0, .36, robe), OUT, .045);
    ell(c, s * .43, .36, .16, .075); fs(c, v.king ? '#7a0f10' : '#3a62c0', OUT, .035); ell(c, s * .43, .36, .11, .045); fs(c, '#0a0f24', null);
    ell(c, s * .43, .42, .095, .075); fs(c, sk(s * .43, .42, .1), OUT, .03);
    for (let i = -1; i <= 1; i++) { poly(c, [s * .43 + i * .055 - .022, .46, s * .43 + i * .055 + .022, .46, s * .43 + i * .07, .64]); fs(c, v.king ? '#2a0a0a' : '#eafbe6', OUT, .018); }
  }
  // 头
  ell(c, 0, -.36, .33, .33); fs(c, sk(0, -.38, .36), OUT, .05);
  if (v.hair) { const r = rnd(3); for (let i = 0; i < 22; i++) { const a = r() * TAU, d = .3 + r() * .08, x = Math.cos(a) * d, y = -.36 + Math.sin(a) * d; line(c, [x, y, x * 1.28, y + (y + .36) * .3 + .05], v.hair, .03); } }
  // 眼窝、眼
  for (const s of [-1, 1]) { ell(c, s * .19, -.36, .1, .085); fs(c, v.king ? '#2a0606' : '#1c2a22', null); ell(c, s * .19, -.36, .042, .042); fs(c, v.eye || '#fff', null); if (v.eye) { c.save(); c.shadowColor = v.eye; c.shadowBlur = 10; ell(c, s * .19, -.36, .03, .03); fs(c, '#fff', null); c.restore(); } line(c, [s * .08, -.48, s * .3, -.5 + (v.king || v.hair ? .06 : 0)], OUT, .035); }
  // 嘴和獠牙
  c.beginPath(); c.moveTo(-.14, -.16); c.quadraticCurveTo(0, -.12, .14, -.16); c.quadraticCurveTo(0, -.06, -.14, -.16); fs(c, '#3a0a10', OUT, .025);
  for (const s of [-1, 1]) { poly(c, [s * .1, -.16, s * .06, -.16, s * .08, -.06]); fs(c, '#fff', OUT, .014); }
  // 符
  if (!v.king) { c.save(); c.translate(0, -.34); c.rotate(.05); poly(c, [-.075, -.2, .075, -.2, .075, .28, -.075, .28]); fs(c, lg(c, 0, -.2, 0, .28, ['#fff0a0', '#f5b423']), OUT, .025); c.strokeStyle = '#b3141a'; c.lineWidth = .022; c.lineCap = 'round'; c.beginPath(); c.moveTo(-.04, -.14); c.lineTo(.04, -.14); c.moveTo(0, -.14); c.lineTo(0, 0); c.bezierCurveTo(.08, .02, .08, .1, -.04, .1); c.bezierCurveTo(.08, .12, .06, .22, -.04, .22); c.stroke(); c.restore(); }
  else { c.save(); c.translate(.1, -.4); c.rotate(.5); poly(c, [-.06, -.14, .06, -.14, .07, .06, 0, .0, -.06, .1]); fs(c, '#6a4a10', OUT, .02); c.restore(); line(c, [-.2, -.2, -.08, -.28, -.12, -.36], 'rgba(255,150,40,.9)', .02); line(c, [.24, -.24, .14, -.2], 'rgba(255,150,40,.9)', .02); }
  // 官帽
  ell(c, 0, -.62, .5, .13); fs(c, lg(c, 0, -.75, 0, -.5, ['#2c2c38', '#08080c']), OUT, .045);
  c.beginPath(); c.moveTo(-.3, -.64); c.quadraticCurveTo(-.3, -.98, 0, -.98); c.quadraticCurveTo(.3, -.98, .3, -.64); c.quadraticCurveTo(0, -.56, -.3, -.64); fs(c, lg(c, 0, -.98, 0, -.6, v.king ? ['#ffb84a', '#c4400a'] : ['#ff5a66', '#a80d20']), OUT, .045);
  for (let i = -3; i <= 3; i++) line(c, [i * .03, -.96, i * .09, -.66], 'rgba(90,0,10,.45)', .014);
  ell(c, 0, -1.0, .065, .065); fs(c, GOLD(c, -1.07, -.93), OUT, .025);
  if (v.king) { poly(c, [-.3, -.7, -.2, -.86, -.1, -.72, 0, -.9, .1, -.72, .2, -.86, .3, -.7, .3, -.62, -.3, -.62]); fs(c, GOLD(c, -.9, -.62), OUT, .03); ell(c, 0, -.7, .04, .04); fs(c, '#ff3b3b', OUT, .015); }
}
const maojiang = (c) => jiangshi(c, { robe: ['#5a3a86', '#2a1648'], skin: ['#eef7e0', '#b9cf9a', '#6f8a52'], hair: '#e6f2d8', eye: '#ff4a3a' });
const hanba = (c) => jiangshi(c, { king: true, robe: ['#4a1014', '#1c0608'], skin: ['#d2623a', '#8a2c18', '#4a120a'], eye: '#ffb020', trim: '#ffb84a' });
function flyer(c) {
  // 向上飘的长发
  const r = rnd(11);
  c.beginPath(); c.moveTo(-.46, .0); c.bezierCurveTo(-.9, -.3, -.5, -.7, -.74, -1.08); c.bezierCurveTo(-.4, -.8, -.36, -1.0, -.2, -1.14); c.bezierCurveTo(-.1, -.9, .1, -.96, .16, -1.16); c.bezierCurveTo(.3, -.9, .5, -.92, .7, -1.06); c.bezierCurveTo(.5, -.6, .9, -.3, .46, .0); c.closePath(); fs(c, lg(c, 0, -1.1, 0, 0, ['rgba(40,20,70,.3)', '#1a1026', '#08060e']), OUT, .04);
  for (let i = 0; i < 9; i++) { const x = -.4 + i * .1; c.beginPath(); c.moveTo(x, -.3); c.bezierCurveTo(x + (r() - .5) * .3, -.6, x + (r() - .5) * .3, -.8, x * 1.4, -1.0); c.strokeStyle = 'rgba(150,110,220,.35)'; c.lineWidth = .016; c.stroke(); }
  // 脖子断口的血雾
  for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * .07, .5); c.quadraticCurveTo(i * .12 + (i % 2 ? .06 : -.06), .76, i * .1, .96 - Math.abs(i) * .08); c.strokeStyle = i % 2 ? '#b3141f' : '#e8303f'; c.lineWidth = .045; c.lineCap = 'round'; c.stroke(); }
  // 耳、脸
  for (const s of [-1, 1]) { ell(c, s * .46, .04, .08, .13); fs(c, '#d9cfe6', OUT, .035); }
  ell(c, 0, .06, .46, .5); fs(c, rg(c, 0, 0, .52, ['#fbf6ff', '#d8cbe8', '#8f7fae'], -.12, -.2), OUT, .05);
  c.beginPath(); c.moveTo(-.46, -.04); c.quadraticCurveTo(-.3, -.5, 0, -.26); c.quadraticCurveTo(.3, -.5, .46, -.04); c.quadraticCurveTo(.4, -.5, 0, -.5); c.quadraticCurveTo(-.4, -.5, -.46, -.04); fs(c, '#0e0a16', null);
  for (const s of [-1, 1]) { poly(c, [s * .08, -.1, s * .34, -.2, s * .36, -.06, s * .1, 0]); fs(c, '#16060a', null); c.save(); c.shadowColor = '#f24'; c.shadowBlur = 12; ell(c, s * .22, -.08, .05, .04); fs(c, '#ff4a4a', null); c.restore(); }
  // 大嘴、獠牙、长舌
  c.beginPath(); c.moveTo(-.28, .2); c.quadraticCurveTo(0, .14, .28, .2); c.quadraticCurveTo(.2, .5, 0, .5); c.quadraticCurveTo(-.2, .5, -.28, .2); fs(c, '#2a060c', OUT, .035);
  for (const s of [-1, 1]) { poly(c, [s * .2, .19, s * .12, .18, s * .16, .34]); fs(c, '#fff', OUT, .016); poly(c, [s * .08, .17, s * .02, .17, s * .05, .26]); fs(c, '#fff', OUT, .014); }
  c.beginPath(); c.moveTo(-.07, .36); c.quadraticCurveTo(-.12, .7, .06, .8); c.quadraticCurveTo(.16, .7, .08, .36); fs(c, lg(c, 0, .36, 0, .8, ['#e8303f', '#8c0714']), OUT, .03);
}
function coffin(c) {
  const hex = [-.34, -.96, .34, -.96, .6, -.5, .4, .96, -.4, .96, -.6, -.5];
  // 缝里伸出的手
  ell(c, .62, -.02, .12, .07, .3); fs(c, '#b9d6b0', OUT, .03); for (let i = 0; i < 3; i++) line(c, [.7, -.03 + i * .04, .82, -.08 + i * .07], '#e3f5dc', .028);
  poly(c, hex); fs(c, lg(c, -.6, 0, .6, 0, ['#3a160e', '#7a3a22', '#5a2616', '#2a0e08']), OUT, .06);
  const inn = [-.24, -.82, .24, -.82, .44, -.46, .28, .82, -.28, .82, -.44, -.46];
  poly(c, inn); fs(c, lg(c, 0, -.8, 0, .8, ['#8a4326', '#4a1e10']), '#2a0e08', .03);
  for (const y of [-.3, .2, .6]) line(c, [-.36 + Math.abs(y) * .08, y, .36 - Math.abs(y) * .08, y + .03], 'rgba(30,8,4,.45)', .014);
  // 盖子缝里的红眼
  poly(c, [-.3, -.62, .3, -.62, .34, -.5, -.34, -.5]); fs(c, '#050206', OUT, .025);
  for (const s of [-1, 1]) { c.save(); c.shadowColor = '#f33'; c.shadowBlur = 12; ell(c, s * .13, -.56, .05, .03); fs(c, '#ff5a3a', null); c.restore(); }
  // 奠
  // 铁链
  for (const [a, b] of [[[-.56, -.34], [.44, .56]], [[.56, -.34], [-.44, .56]]]) { c.setLineDash([.09, .05]); line(c, [...a, ...b], '#1a1a22', .1); line(c, [...a, ...b], '#aab0c0', .055); c.setLineDash([]); }
  ell(c, 0, .1, .25, .25); fs(c, '#f4f0e4', OUT, .035); txt(c, '奠', 0, .12, .36, '#16101a');
  // 脚上的符
  c.save(); c.translate(-.3, .6); c.rotate(-.2); poly(c, [-.07, -.16, .07, -.16, .07, .16, -.07, .16]); fs(c, '#f5c63a', OUT, .02); line(c, [0, -.1, 0, .1], '#b3141a', .02); c.restore();
}
function wuchang(c) {
  // 哭丧棒
  line(c, [-.62, -.5, -.5, .9], '#5a4020', .05); for (let i = 0; i < 6; i++) { const y = -.44 + i * .17, x = -.62 + i * .015; poly(c, [x - .13, y, x + .13, y - .03, x + .15, y + .09, x - .12, y + .12]); fs(c, '#fbfbf4', '#8a8a92', .02); }
  // 袍
  poly(c, [-.34, -.02, .34, -.02, .5, .92, -.5, .92]); fs(c, lg(c, 0, 0, 0, .92, ['#ffffff', '#d9dbe6', '#9ea2b8']), OUT, .05);
  line(c, [0, 0, -.06, .92], 'rgba(90,96,120,.4)', .02); poly(c, [-.36, .28, .36, .28, .38, .38, -.38, .38]); fs(c, '#1a1a22', null);
  for (const s of [-1, 1]) { poly(c, [s * .3, 0, s * .56, .1, s * .5, .56, s * .26, .4]); fs(c, lg(c, 0, 0, 0, .56, ['#fff', '#b9bdd0']), OUT, .045); }
  ell(c, -.52, .5, .08, .08); fs(c, '#eef0f6', OUT, .03);
  // 脸
  ell(c, 0, -.26, .27, .29); fs(c, rg(c, 0, -.28, .3, ['#ffffff', '#eceef6', '#b4b8cc'], -.08, -.36), OUT, .05);
  for (const s of [-1, 1]) { ell(c, s * .12, -.3, .07, .06); fs(c, '#14141c', null); ell(c, s * .12, -.3, .022, .022); fs(c, '#fff', null); line(c, [s * .04, -.4, s * .22, -.36], OUT, .03); ell(c, s * .17, -.16, .05, .035); fs(c, 'rgba(232,48,63,.5)', null); }
  // 长舌头
  c.beginPath(); c.moveTo(-.07, -.12); c.lineTo(.07, -.12); c.quadraticCurveTo(.1, .3, .02, .44); c.quadraticCurveTo(-.1, .3, -.07, -.12); fs(c, lg(c, 0, -.12, 0, .44, ['#ff4a5c', '#a80d20']), OUT, .03); line(c, [0, -.08, 0, .34], 'rgba(120,0,16,.5)', .014);
  // 高帽
  poly(c, [-.2, -1.08, .2, -1.08, .29, -.46, -.29, -.46]); fs(c, lg(c, -.3, 0, .3, 0, ['#c9ccda', '#ffffff', '#d6d9e6']), OUT, .05);
  ['一', '见', '生', '财'].forEach((t, i) => txt(c, t, 0, -.99 + i * .135, .13, '#16101a'));
}
function bride(c) {
  // 裙
  c.beginPath(); c.moveTo(-.3, .0); c.lineTo(.3, 0); c.bezierCurveTo(.5, .4, .62, .7, .66, .92); c.quadraticCurveTo(.5, .82, .4, .98); c.quadraticCurveTo(.26, .84, .12, 1.0); c.quadraticCurveTo(0, .84, -.14, .98); c.quadraticCurveTo(-.3, .84, -.42, 1.0); c.quadraticCurveTo(-.52, .84, -.66, .92); c.bezierCurveTo(-.62, .7, -.5, .4, -.3, 0); fs(c, lg(c, 0, 0, 0, 1, ['#e8203a', '#a50d22', '#4a0612']), OUT, .05);
  for (const x of [-.34, -.12, .12, .34]) line(c, [x * .5, .3, x * 1.3, .86], 'rgba(255,210,74,.45)', .016);
  c.beginPath(); c.arc(0, .6, .13, 0, TAU); c.strokeStyle = '#ffd24a'; c.lineWidth = .02; c.stroke(); txt(c, '囍', 0, .61, .17, '#ffd24a', HEI);
  // 合拢的大袖
  c.beginPath(); c.moveTo(-.34, .02); c.bezierCurveTo(-.7, .16, -.6, .46, -.2, .44); c.lineTo(.2, .44); c.bezierCurveTo(.6, .46, .7, .16, .34, .02); c.closePath(); fs(c, lg(c, 0, 0, 0, .46, ['#ff3a50', '#b01028']), OUT, .05);
  line(c, [-.5, .34, .5, .34], '#ffd24a', .03); line(c, [0, .2, 0, .44], OUT, .025);
  // 黑发
  c.beginPath(); c.moveTo(-.3, -.4); c.bezierCurveTo(-.5, 0, -.44, .3, -.5, .5); c.lineTo(-.26, .1); c.lineTo(.26, .1); c.lineTo(.5, .5); c.bezierCurveTo(.44, .3, .5, 0, .3, -.4); fs(c, '#0a0810', OUT, .035);
  // 下半张脸
  ell(c, 0, -.2, .25, .27); fs(c, rg(c, 0, -.2, .3, ['#ffffff', '#e9eef6', '#aab6cc'], -.06, -.1), OUT, .045);
  c.beginPath(); c.moveTo(-.07, -.07); c.quadraticCurveTo(0, -.11, .07, -.07); c.quadraticCurveTo(0, -.0, -.07, -.07); fs(c, '#c00f24', null);
  line(c, [-.13, -.2, -.14, -.02], '#b3141f', .02); line(c, [.12, -.2, .13, -.08], '#b3141f', .02);
  // 红盖头
  c.beginPath(); c.moveTo(-.44, -.22); c.bezierCurveTo(-.5, -.8, -.2, -.98, 0, -.98); c.bezierCurveTo(.2, -.98, .5, -.8, .44, -.22); c.quadraticCurveTo(.3, -.14, .2, -.22); c.quadraticCurveTo(0, -.12, -.2, -.22); c.quadraticCurveTo(-.3, -.14, -.44, -.22); fs(c, lg(c, -.4, -1, .4, -.2, ['#ff4a5c', '#d0142c', '#8a0a1c']), OUT, .05);
  c.beginPath(); c.moveTo(-.42, -.3); c.quadraticCurveTo(0, -.2, .42, -.3); c.strokeStyle = '#ffd24a'; c.lineWidth = .03; c.stroke();
  for (let i = -4; i <= 4; i++) { const x = i * .1, y = -.2 + (i % 2 ? .02 : -.03); line(c, [x, y, x, y + .1], '#ffd24a', .018); ell(c, x, y + .12, .022, .022); fs(c, '#ffd24a', null); }
  txt(c, '囍', 0, -.6, .3, '#ffd24a', HEI);
  // 凤冠珠
  for (let i = -2; i <= 2; i++) { ell(c, i * .14, -.98 + Math.abs(i) * .04, .05, .05); fs(c, i % 2 ? '#ffd24a' : '#ff3b5c', OUT, .02); }
}

export const DRAW = { sword, rice, thunder, lion, cat, seal, zhongkui, coin, grain, stamp, talisman, ghost, paper, jiangshi, maojiang, hanba, flyer, coffin, wuchang, bride };
export const AURA = { sword: '#00e5ff', rice: '#7dff3a', thunder: '#ffd400', lion: '#ff3b5c', cat: '#ff8ad0', seal: '#c05cff', zhongkui: '#ffd24a', ghost: '#3fe0e0', paper: '#ff5a66', jiangshi: '#58d07a', maojiang: '#b07cff', hanba: '#ff7a1a', flyer: '#b060ff', coffin: '#d08a4a', wuchang: '#dfe6ff', bride: '#ff2a55' };

const cache = new Map();
// 返回一张边长 2.7×px 的位图，图形中心在位图中心。aura 为 true 时垫一层光晕
export function sprite(name, px, aura = false) {
  const q = Math.max(8, Math.ceil(px / 4) * 4), key = name + '|' + q + (aura ? 'a' : '');
  let cv = cache.get(key); if (cv) return cv;
  const n = Math.ceil(q * 2.7); cv = document.createElement('canvas'); cv.width = cv.height = n; const c = cv.getContext('2d');
  c.translate(n / 2, n / 2);
  if (aura) { const g = c.createRadialGradient(0, 0, q * .2, 0, 0, q * 1.3); const col = AURA[name] || '#fff'; g.addColorStop(0, col + '66'); g.addColorStop(.6, col + '22'); g.addColorStop(1, col + '00'); c.fillStyle = g; c.fillRect(-n / 2, -n / 2, n, n); }
  c.scale(q, q); c.lineJoin = c.lineCap = 'round'; DRAW[name](c);
  cv.u = n / q / 2; cache.set(key, cv); return cv;
}
// 受击时闪白用的剪影
export function white(name, px) {
  const q = Math.max(8, Math.ceil(px / 4) * 4), key = name + '|' + q + 'w'; let cv = cache.get(key); if (cv) return cv;
  const s = sprite(name, px); cv = document.createElement('canvas'); cv.width = cv.height = s.width; const c = cv.getContext('2d'); c.drawImage(s, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height); cv.u = s.u; cache.set(key, cv); return cv;
}
// 以 (x,y) 为中心、半径 px 画
export function put(c, cv, x, y, px, rot = 0, sx = 1, sy = 1) { const h = cv.u * px; if (rot || sx !== 1 || sy !== 1) { c.save(); c.translate(x, y); if (rot) c.rotate(rot); c.scale(sx, sy); c.drawImage(cv, -h, -h, h * 2, h * 2); c.restore(); } else c.drawImage(cv, x - h, y - h, h * 2, h * 2); }
