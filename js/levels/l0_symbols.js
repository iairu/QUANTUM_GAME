'use strict';
// LEVEL 0 — Sieň symbolov (sprievodkyňa Iskra)
// Každý symbol rovnicovej mnemotechniky (kľúč 🔑: pravidlá aj slovník glyfov) a každý farebný kúsok vzorca stojí
// na vlastnom podstavci ako 3D model v tej istej farbe, akú má v rovniciach. Model sa hýbe sám, sprievodkyňa ho
// vysvetlí a hneď sa pýta; po každej kapitole opakovanie, na konci veľká skúška.

const G0 = (k, l = k) => EqG.html(k, l);
// texty z lang/*.csv podľa predpony kľúča: repliky <k>.0, <k>.1 …; otázka <k>.q, možnosti <k>.o.0 … (prvá je správna), <k>.why
const LN = (k) => { const out = []; for (let i = 0; DL.has(`${k}.${i}`); i++) out.push(DL(`${k}.${i}`)); return out; };
const LQ = (k) => { const options = []; for (let i = 0; DL.has(`${k}.o.${i}`); i++) options.push(DL(`${k}.o.${i}`)); return { q: DL(`${k}.q`), options, correct: 0, why: DL(`${k}.why`) }; };
// farby mnemotechniky (style.css: --mn-* a .m-*) v RGB 0..1 — 3D model má vždy farbu svojho symbolu v rovnici
const MC = {
  a: [0.31, 0.55, 1], b: [1, 0.42, 0.49], ket: [0.37, 0.89, 1], op: [0.73, 0.55, 1], th: [1, 0.6, 0.9], ph: [0.49, 1, 0.63],
  g: [1, 0.82, 0.35], P: [1, 1, 1], k: [0.56, 0.61, 0.78], coh: [0.79, 0.64, 1], m: [1, 0.95, 0.69], c: [0.91, 0.93, 1],
  num: [1, 0.73, 0.54], rel: [1, 0.82, 0.35], opn: [0.56, 0.83, 1], br: [0.55, 0.59, 0.8], fn: [0.31, 0.89, 0.76], v: [0.96, 0.96, 1],
};
const UP0 = [0, 1, 0];
// farba fázy (ako phaseColor v pohľadoch): odtieň = uhol
const hue0 = (ph) => {
  const h = (((ph / (2 * Math.PI)) % 1) + 1) % 1 * 6, f = h - Math.floor(h), q = 1 - f, s = [[1, f, 0], [q, 1, 0], [0, 1, f], [0, q, 1], [f, 0, 1], [1, 0, q]][Math.floor(h) % 6];
  return s.map((x) => 0.3 + 0.7 * x);
};
const smooth0 = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

// ---------- 3D stavebnice ----------
const D0 = {
  ball(r, c, R) { r.sphere(c, R, [0.45, 0.6, 1], { alpha: 0.1 }); r.draw('circle', M4.trs(c, 0, R), [0.55, 0.65, 0.9], { alpha: 0.6 }); },
  pillar(r, base, p, col, H = 1.4, rad = 0.1) {
    r.draw('cylinder', M4.trs(base, 0, [rad * 1.15, H, rad * 1.15]), [1, 1, 1], { alpha: 0.1 });
    r.draw('cylinder', M4.trs(base, 0, [rad, Math.max(p * H, 0.005), rad]), col, { emissive: 0.35 });
  },
  // ket ⟩ (dir = +1, hrot dopredu) alebo bra ⟨ (dir = −1, hrot dozadu); squash < 1 = práve sa preklápa
  ket(r, S, x, yc, h, dir, col, squash = 1) {
    const hh = h / 2 * squash, bx = x - dir * 0.22, o = { emissive: 0.4 };
    const top = S.P(x - dir * 0.04, yc + hh), tip = S.P(x + dir * 0.2, yc), bot = S.P(x - dir * 0.04, yc - hh);
    r.rod(S.P(bx, yc - hh), S.P(bx, yc + hh), col, 0.035, o);
    r.rod(top, tip, col, 0.035, o); r.rod(tip, bot, col, 0.035, o);
    for (const p of [top, tip, bot]) r.sphere(p, 0.035, col, o);
  },
  clock(r, c, n, R, col, ang, S) {
    r.draw('disk', M4.orient(c, n, R), col, { alpha: 0.12 });
    r.draw('circle', M4.orient(c, n, R), col);
    r.arrow(c, V3.add(c, V3.add(V3.scale(S.R, Math.cos(ang) * R * 0.92), V3.scale(UP0, Math.sin(ang) * R * 0.92))), col, 0.03, { emissive: 0.5 });
  },
  dots(r, c, u, w, R, ang, col, n = 9) { for (let j = 0; j <= n; j++) { const a = ang * j / n; r.sphere(V3.add(c, V3.add(V3.scale(u, Math.cos(a) * R), V3.scale(w, Math.sin(a) * R))), 0.025, col, { emissive: 0.8 }); } },
};

// ---------- exponáty ----------
// ch = kapitola, keys = glyfy v paneli (slovník), chime = zvuk pri predstavení, glyph = popis nad podstavcom
const EXHIBITS0 = [
  // ===== 1. kapitola: farba = KTO (amplitúdy a stavy) =====
  {
    id: 'alpha', ch: 1, keys: ['α'], chime: 'α', glyph: () => G0('α'),
    name: tr('α — amplitúda |0⟩', 'α — amplitude of |0⟩', 'α — амплітуда |0⟩'),
    lines: () => LN('l0.alpha.lines'),
    q1: () => LQ('l0.alpha.q1'),
    q2: () => LQ('l0.alpha.q2'),
    draw(r, S, t) {
      const c = S.P(0, 1.2), mag = 0.5 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.3)), tip = S.P(0, 1.2 + 0.8 * mag), ph = t * 2.2, hR = 0.2;
      D0.ball(r, c, 0.8);
      r.arrow(c, tip, MC.a, 0.05, { emissive: 0.45 });
      r.sphere(S.P(0, 2.0), 0.06, MC.ket, { emissive: 0.8 });
      r.draw('circle', M4.trs(tip, 0, hR), MC.a);
      r.rod(tip, V3.add(tip, V3.add(V3.scale(S.R, Math.cos(ph) * hR), V3.scale(S.F, Math.sin(ph) * hR))), MC.a, 0.015, { emissive: 0.6 });
      S.lab('k0', S.P(0.32, 2.1), S.g('k0', () => G0('ket0', '0')), 'sym0 small');
      S.lab('m', S.P(-1.05, 1.2 + 0.4 * mag), `<span class="mn-a">|α| = ${Fmt.num(mag, 2)}</span>`, 'axis');
    },
  },
  {
    id: 'beta', ch: 1, keys: ['β'], chime: 'β', glyph: () => G0('β'),
    name: tr('β — amplitúda |1⟩', 'β — amplitude of |1⟩', 'β — амплітуда |1⟩'),
    lines: () => LN('l0.beta.lines'),
    q1: () => LQ('l0.beta.q1'),
    q2: () => LQ('l0.beta.q2'),
    draw(r, S, t) {
      const c = S.P(0, 1.2), mag = 0.5 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.3 + 2)), tip = S.P(0, 1.2 - 0.8 * mag), ph = t * 2.2 + 1, hR = 0.2;
      D0.ball(r, c, 0.8);
      r.arrow(c, tip, MC.b, 0.05, { emissive: 0.45 });
      r.sphere(S.P(0, 0.4), 0.06, MC.ket, { emissive: 0.8 });
      r.draw('circle', M4.trs(tip, 0, hR), MC.b);
      r.rod(tip, V3.add(tip, V3.add(V3.scale(S.R, Math.cos(ph) * hR), V3.scale(S.F, Math.sin(ph) * hR))), MC.b, 0.015, { emissive: 0.6 });
      S.lab('k1', S.P(0.32, 0.3), S.g('k1', () => G0('ket1', '1')), 'sym0 small');
      S.lab('m', S.P(-1.05, 1.2 - 0.4 * mag), `<span class="mn-b">|β| = ${Fmt.num(mag, 2)}</span>`, 'axis');
    },
  },
  {
    id: 'ket', ch: 1, keys: ['ket', 'ket0', 'ket1', 'ketpm', 'ψ', 'Ψ'], chime: 'ket',
    glyph: (t) => [G0('ket', 'ψ'), G0('ket0', '0'), G0('ket1', '1'), G0('ketpm', '+')],
    name: tr('kety |ψ⟩, |0⟩, |1⟩, |±⟩ — stavy', 'kets |ψ⟩, |0⟩, |1⟩, |±⟩ — states', 'кети |ψ⟩, |0⟩, |1⟩, |±⟩ — стани'),
    lines: () => LN('l0.ket.lines'),
    q1: () => LQ('l0.ket.q1'),
    q2: () => LQ('l0.ket.q2'),
    draw(r, S, t) {
      const x = Math.sin(t * 1.4) * 0.22, k = Math.floor(t / 2.6) % 4, o = { emissive: 0.6 };
      D0.ket(r, S, x, 1.2, 1.1, 1, MC.ket);
      if (k === 1) r.arrow(S.P(x - 0.04, 1.85), S.P(x - 0.04, 2.2), MC.ket, 0.025, o);
      else if (k === 2) r.arrow(S.P(x - 0.04, 0.55), S.P(x - 0.04, 0.2), MC.ket, 0.025, o);
      else if (k === 3) r.arrow(S.P(x - 0.1, 1.95), S.P(x + 0.3, 1.95), MC.ket, 0.025, o);
      else r.sphere(S.P(x - 0.04, 1.2), 0.09, MC.ket, { emissive: 0.8 });
    },
    glyphAt: (t) => Math.floor(t / 2.6) % 4,
  },
  {
    id: 'bra', ch: 1, keys: ['bra'], chime: 'ket', glyph: () => G0('bra', 'a') + G0('ket', 'ψ'),
    name: tr('bra ⟨a| — otázka', 'bra ⟨a| — a question', 'бра ⟨a| — питання'),
    lines: () => LN('l0.bra.lines'),
    q1: () => LQ('l0.bra.q1'),
    q2: () => LQ('l0.bra.q2'),
    draw(r, S, t) {
      const u = (t % 4) / 4, d = u < 0.45 ? 1.0 - 0.8 * smooth0(u / 0.45) : u < 0.8 ? 0.2 : 0.2 + 0.8 * smooth0((u - 0.8) / 0.2);
      D0.ket(r, S, -d, 1.2, 1.0, -1, MC.ket);
      D0.ket(r, S, d, 1.2, 1.0, 1, MC.ket);
      S.lab('a', S.P(-d - 0.05, 0.5), 'a', 'axis'); S.lab('psi', S.P(d + 0.05, 0.5), 'ψ', 'axis');
      if (u > 0.45 && u < 0.8) {
        const k = (u - 0.45) / 0.35;
        r.sphere(S.P(0, 2.0), 0.08 + 0.1 * Math.sin(k * Math.PI), MC.P, { emissive: 1 });
        S.lab('n', S.P(0, 2.35), tr('číslo', 'a number', 'число'), 'axis');
      }
    },
  },

  // ===== 2. kapitola: uhly a fázy =====
  {
    id: 'theta', ch: 2, keys: ['θ'], chime: 'θ', glyph: () => G0('θ'),
    name: tr('θ — sklon od pólu', 'θ — tilt from the pole', 'θ — нахил від полюса'),
    lines: () => LN('l0.theta.lines'),
    q1: () => LQ('l0.theta.q1'),
    q2: () => LQ('l0.theta.q2'),
    draw(r, S, t) {
      const c = S.P(-0.25, 1.2), th = Math.PI / 2 * (1 - Math.cos(t * 0.7)), d = V3.add(V3.scale(UP0, Math.cos(th)), V3.scale(S.R, Math.sin(th)));
      D0.ball(r, c, 0.75);
      r.arrow(c, V3.add(c, V3.scale(d, 0.75)), MC.ket, 0.045, { emissive: 0.4 });
      r.arc(c, UP0, S.R, 0.4, th, MC.th);
      D0.dots(r, c, UP0, S.R, 0.4, th, MC.th);
      const p0 = Math.cos(th / 2) ** 2;
      D0.pillar(r, S.P(0.95, 0), p0, MC.a); D0.pillar(r, S.P(1.25, 0), 1 - p0, MC.b);
      S.lab('v', V3.add(c, V3.scale(V3.add(V3.scale(UP0, Math.cos(th / 2)), V3.scale(S.R, Math.sin(th / 2))), 0.58)), `<span class="mn-th">θ = ${Fmt.angle(th)}</span>`, 'axis');
      S.lab('p0', S.P(0.95, 1.6), `<span class="mn-a">P(0)</span>`, 'axis tiny'); S.lab('p1', S.P(1.25, 1.75), `<span class="mn-b">P(1)</span>`, 'axis tiny');
    },
  },
  {
    id: 'phi', ch: 2, keys: ['φ'], chime: 'φ', glyph: () => G0('φ'),
    name: tr('φ — relatívna fáza', 'φ — relative phase', 'φ — відносна фаза'),
    lines: () => LN('l0.phi.lines'),
    q1: () => LQ('l0.phi.q1'),
    q2: () => LQ('l0.phi.q2'),
    draw(r, S, t) {
      const c = S.P(-0.25, 1.2), ph = (t * 0.9) % (2 * Math.PI), d = V3.add(V3.scale(S.R, Math.cos(ph)), V3.scale(S.F, Math.sin(ph)));
      D0.ball(r, c, 0.75);
      r.draw('circle', M4.trs(c, 0, 0.75), MC.ph, { alpha: 0.8 });
      r.arrow(c, V3.add(c, V3.scale(d, 0.75)), MC.ket, 0.045, { emissive: 0.4 });
      r.arc(c, S.R, S.F, 0.45, ph, MC.ph);
      D0.dots(r, c, S.R, S.F, 0.45, ph, MC.ph, 12);
      const top = S.P(-0.25, 2.05);
      for (let k = 0; k < 3; k++) { const a = ph * 2 + k * 2 * Math.PI / 3; r.rod(top, V3.add(top, V3.add(V3.scale(S.R, Math.cos(a) * 0.3), V3.scale(S.F, Math.sin(a) * 0.3))), MC.ph, 0.03, { emissive: 0.5 }); }
      D0.pillar(r, S.P(0.95, 0), 0.5, MC.a); D0.pillar(r, S.P(1.25, 0), 0.5, MC.b);
      S.lab('v', V3.add(c, V3.scale(V3.add(V3.scale(S.R, Math.cos(ph / 2)), V3.scale(S.F, Math.sin(ph / 2))), 0.62)), `<span class="mn-ph">φ = ${Fmt.angle(ph)}</span>`, 'axis');
      S.lab('p', S.P(1.1, 1.0), tr('P sa nehýbe', 'P stays put', 'P не рухається'), 'axis tiny');
    },
  },
  {
    id: 'gamma', ch: 2, keys: ['γ'], chime: 'γ', glyph: () => G0('γ') + G0('exp', 'iγ'),
    name: tr('γ — globálna fáza', 'γ — global phase', 'γ — глобальна фаза'),
    lines: () => LN('l0.gamma.lines'),
    q1: () => LQ('l0.gamma.q1'),
    q2: () => LQ('l0.gamma.q2'),
    draw(r, S, t) {
      const c = S.P(-0.25, 1.25), g = t * 1.1, o = { emissive: 0.5 };
      r.draw('torus', M4.orient(c, S.F, 0.62), MC.g, o);
      for (let k = 0; k < 10; k++) { const a = g + k * Math.PI / 5; r.sphere(V3.add(c, V3.add(V3.scale(S.R, Math.cos(a) * 0.7), V3.scale(UP0, Math.sin(a) * 0.7))), 0.065, MC.g, o); }
      const hand = (a, L, col) => r.arrow(c, V3.add(c, V3.add(V3.scale(S.R, Math.cos(a) * L), V3.scale(UP0, Math.sin(a) * L))), col, 0.035, { emissive: 0.4 });
      hand(g + 0.4, 0.5, MC.a); hand(g + 2.3, 0.36, MC.b);
      D0.pillar(r, S.P(0.95, 0), 0.66, MC.a); D0.pillar(r, S.P(1.25, 0), 0.34, MC.b);
      S.lab('p', S.P(1.1, 1.75), tr('P sa nehýbe', 'P stays put', 'P не рухається'), 'axis tiny');
    },
  },
  {
    id: 'expi', ch: 2, keys: ['exp', 'i'], chime: 'exp', glyph: () => G0('exp', 'iφ') + G0('i'),
    name: tr('e^{iφ} a i — otočenia', 'e^{iφ} and i — turns', 'e^{iφ} та i — оберти'),
    lines: () => LN('l0.expi.lines'),
    q1: () => LQ('l0.expi.q1'),
    q2: () => LQ('l0.expi.q2'),
    draw(r, S, t) {
      D0.clock(r, S.P(-0.55, 1.3), S.F, 0.48, MC.ph, t * 1.3, S);
      const k = Math.floor(t * 0.8), f = t * 0.8 - k;
      D0.clock(r, S.P(0.62, 1.3), S.F, 0.36, MC.ph, (k + smooth0(f * 4)) * Math.PI / 2, S);
      for (let q = 0; q < 4; q++) r.sphere(V3.add(S.P(0.62, 1.3), V3.add(V3.scale(S.R, Math.cos(q * Math.PI / 2) * 0.43), V3.scale(UP0, Math.sin(q * Math.PI / 2) * 0.43))), 0.035, MC.ph, { emissive: 0.8 });
      S.lab('e', S.P(-0.55, 0.62), tr('dĺžka 1', 'length 1', 'довжина 1'), 'axis tiny');
      S.lab('i', S.P(0.62, 0.75), ['1', 'i', '−1', '−i'][k % 4], 'axis');
    },
  },

  // ===== 3. kapitola: krabičky, stĺpy, rámy, tabuľka =====
  {
    id: 'ops', ch: 3, keys: ['X', 'Y', 'Z', 'H', 'S', 'T', 'I', 'U', 'Ĥ', 'Â'], chime: 'X',
    glyph: () => ['X', 'Y', 'Z', 'H', 'S', 'T', 'I', 'Ĥ', 'Â'].map((o) => G0(o)),
    glyphAt: (t) => Math.floor(t / 3.2) % 9,
    name: tr('operátory — hradlá', 'operators — gates', 'оператори — гейти'),
    lines: () => LN('l0.ops.lines'),
    q1: () => LQ('l0.ops.q1'),
    q2: () => LQ('l0.ops.q2'),
    draw(r, S, t) {
      const u = (t % 3.2) / 3.2, n = Math.floor(t / 3.2), spin = u < 0.35 ? smooth0(u / 0.35) * 2 * Math.PI : 0;
      r.draw('box', M4.trs(S.P(-0.5, 1.2), S.yaw + spin, 0.62), MC.op, { emissive: u < 0.35 ? 0.6 : 0.25, alpha: 0.88 });
      r.arrow(S.P(-0.12, 1.75), S.P(0.28, 1.75), MC.op, 0.025, { emissive: 0.5 });
      const f = clamp((u - 0.35) / 0.25, 0, 1), up = (n + (f >= 0.5 ? 1 : 0)) % 2 === 0;
      D0.ket(r, S, 0.6, 1.2, 0.9, 1, MC.ket, Math.max(0.08, Math.abs(Math.cos(f * Math.PI))));
      if (f === 0 || f === 1) r.arrow(S.P(0.56, up ? 1.7 : 0.7), S.P(0.56, up ? 2.0 : 0.4), MC.ket, 0.025, { emissive: 0.6 });
      S.lab('k', S.P(0.95, 1.2), S.g(up ? 'k0' : 'k1', () => G0(up ? 'ket0' : 'ket1', up ? '0' : '1')), 'sym0 small');
    },
  },
  {
    id: 'P', ch: 3, keys: ['P'], chime: 'P', glyph: () => G0('P'),
    name: tr('P — pravdepodobnosť', 'P — probability', 'P — імовірність'),
    lines: () => LN('l0.P.lines'),
    q1: () => LQ('l0.P.q1'),
    q2: () => LQ('l0.P.q2'),
    draw(r, S, t) {
      const p = 0.5 + 0.5 * Math.sin(t * 0.8);
      D0.pillar(r, S.P(0, 0), p, MC.P, 1.9, 0.24);
      for (const q of [0.5, 1]) r.draw('torus', M4.trs(S.P(0, q * 1.9), 0, 0.3), [0.7, 0.72, 0.8], { alpha: 0.5 });
      S.lab('v', S.P(0.62, 0.05 + 1.9 * p), `<b>P = ${Fmt.pct(p)}</b>`, 'axis');
    },
  },
  {
    id: 'sq', ch: 3, keys: ['sq'], chime: 'P', glyph: () => G0('sq', 'α'),
    name: tr('|α|² — Bornovo pravidlo', '|α|² — the Born rule', '|α|² — правило Борна'),
    lines: () => LN('l0.sq.lines'),
    q1: () => LQ('l0.sq.q1'),
    q2: () => LQ('l0.sq.q2'),
    draw(r, S, t) {
      const u = (t % 5) / 5, c = S.P(-0.3, 1.25), L = 0.5;
      const frozen = u >= 0.4, ang = frozen ? (Math.floor(t / 5) * 5 + 2) * 2.5 : t * 2.5, close = frozen ? smooth0((u - 0.4) / 0.1) : 0;
      const hs = 0.85 - 0.25 * close, fc = frozen ? [0.95, 0.95, 1] : [0.7, 0.72, 0.8];
      const q = (x, y) => V3.add(c, V3.add(V3.scale(S.R, x * hs), V3.scale(UP0, y * hs)));
      [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]].forEach(([a, b, d, e]) => r.rod(q(a, b), q(d, e), fc, 0.03, { emissive: frozen ? 0.6 : 0, alpha: frozen ? 1 : 0.5 }));
      r.arrow(c, V3.add(c, V3.add(V3.scale(S.R, Math.cos(ang) * L), V3.scale(UP0, Math.sin(ang) * L))), frozen ? [0.55, 0.57, 0.65] : MC.a, 0.04, { emissive: frozen ? 0 : 0.45 });
      const h = u < 0.5 ? 0 : smooth0((u - 0.5) / 0.3) * L * L;
      D0.pillar(r, S.P(0.9, 0), h, MC.P, 1.8, 0.13);
      S.lab('a', S.P(-0.3, 0.2), `<span class="mn-a">|α| = ${Fmt.num(L, 2)}</span>`, 'axis tiny');
      if (h > 0) S.lab('p', S.P(0.9, 0.2 + 1.8 * h + 0.15), `P = ${Fmt.num(h, 2)}`, 'axis tiny');
    },
  },
  {
    id: 'rho', ch: 3, keys: ['ρ'], chime: 'ρ', glyph: () => G0('ρ'),
    name: tr('ρ — matica hustoty, dekoherencia', 'ρ — the density matrix, decoherence', 'ρ — матриця густини, декогеренція'),
    lines: () => LN('l0.rho.lines'),
    q1: () => LQ('l0.rho.q1'),
    q2: () => LQ('l0.rho.q2'),
    draw(r, S, t) {
      const c = S.P(0, 1.25), at = (x, y) => V3.add(c, V3.add(V3.scale(S.R, x * 0.4), V3.scale(UP0, y * 0.4)));
      for (const [x, y] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) r.draw('box', M4.trs(V3.add(at(x, y), V3.scale(S.F, -0.1)), S.yaw, [0.7, 0.7, 0.04]), MC.coh, { alpha: 0.25 });
      for (const s of [-1, 1]) {
        const x0 = s * 0.95;
        r.rod(at(x0, -1.05), at(x0, 1.05), MC.coh, 0.025);
        r.rod(at(x0, 1.05), at(x0 - s * 0.2, 1.05), MC.coh, 0.025); r.rod(at(x0, -1.05), at(x0 - s * 0.2, -1.05), MC.coh, 0.025);
      }
      r.sphere(at(-1, 1), 0.1 + 0.18 * 0.6, MC.a, { emissive: 0.4 });
      r.sphere(at(1, -1), 0.1 + 0.18 * 0.4, MC.b, { emissive: 0.4 });
      const u = (t % 6) / 6, coh = u < 0.15 ? 1 : Math.max(0, 1 - (u - 0.15) / 0.6), ph = t * 1.5;
      if (coh > 0.01) {
        r.sphere(at(1, 1), 0.04 + 0.16 * coh, hue0(ph), { emissive: 0.6, alpha: 0.2 + 0.8 * coh });
        r.sphere(at(-1, -1), 0.04 + 0.16 * coh, hue0(-ph), { emissive: 0.6, alpha: 0.2 + 0.8 * coh });
      }
      S.lab('c', S.P(0, 0.2), tr(`koherencia ${Math.round(coh * 100)} %`, `coherence ${Math.round(coh * 100)} %`, `когерентність ${Math.round(coh * 100)} %`), 'axis tiny');
    },
  },

  // ===== 4. kapitola: konštanty, udalosti a parametre =====
  {
    id: 'const', ch: 4, keys: ['ħ', 'π', 'Σ', '∂', '⊗', 'cos', 'sin', 'det'], chime: 'ħ', glyph: () => G0('ħ') + G0('π') + G0('Σ') + G0('∂') + G0('⊗'),
    name: tr('ħ, π, Σ, ∂, ⊗ — konštanty a operácie', 'ħ, π, Σ, ∂, ⊗ — constants and operations', 'ħ, π, Σ, ∂, ⊗ — сталі й операції'),
    lines: () => LN('l0.const.lines'),
    q1: () => LQ('l0.const.q1'),
    q2: () => LQ('l0.const.q2'),
    draw(r, S, t) {
      const K = MC.k, o = {}, xs = [-1.0, -0.5, 0, 0.5, 1.0];
      r.draw('box', M4.trs(S.P(xs[0], 0.1), S.yaw, [0.36, 0.2, 0.3]), K, o);                      // ħ: schodík
      r.draw('box', M4.trs(S.P(xs[0] + 0.09, 0.3), S.yaw, [0.18, 0.2, 0.3]), K, o);
      const pc = S.P(xs[1], 0.35);                                                                    // π: pol otáčky
      r.rod(V3.add(pc, V3.scale(S.R, -0.2)), V3.add(pc, V3.scale(S.R, 0.2)), K, 0.025, o);
      D0.dots(r, pc, S.R, UP0, 0.2, Math.PI, K, 12);
      for (let k = 0; k < 3; k++) r.draw('box', M4.trs(S.P(xs[2], 0.05 + k * 0.12), S.yaw, [0.34, 0.07, 0.3]), K, o); // Σ: kôpka
      r.draw('cone', M4.trs(S.P(xs[3], 0.0), 0, [0.16, 0.22, 0.16]), K, o);                        // ∂: presýpacie hodiny
      r.draw('cone', M4.alignY(S.P(xs[3], 0.44), [0, -1, 0], 0.22, 0.16), K, o);
      const tc = S.P(xs[4], 0.3);                                                                     // ⊗: prstene
      r.draw('torus', M4.orient(tc, UP0, 0.17), K, o);
      r.draw('torus', M4.orient(V3.add(tc, V3.scale(S.R, 0.17)), S.F, 0.17), K, o);
      ['ħ', 'π', 'Σ', '∂', '⊗'].forEach((k, i) => S.lab('g' + i, S.P(xs[i], 0.85), S.g('c' + i, () => G0(k)), 'sym0 small'));
      S.lab('f', S.P(0, 1.45), S.g('fn', () => G0('cos') + G0('sin') + G0('det')), 'sym0 small');
    },
  },
  {
    id: 'collapse', ch: 4, keys: ['P'], chime: 'P', glyph: () => '<span class="mn mn-m">⚡</span>',
    name: tr('meranie a kolaps', 'measurement and collapse', 'вимірювання й колапс'),
    lines: () => LN('l0.collapse.lines'),
    q1: () => LQ('l0.collapse.q1'),
    q2: () => LQ('l0.collapse.q2'),
    draw(r, S, t) {
      const u = (t % 4) / 4, win = Math.floor(t / 4) % 2, col = [MC.a, MC.b], ra = [0.3, 0.24];
      for (let k = 0; k < 2; k++) {
        const x = k ? 0.45 : -0.45, lose = k !== win;
        let y = 1.3 + Math.sin(t * 2 + k) * 0.05, rad = ra[k], al = 1;
        if (u > 0.5) {
          const f = smooth0((u - 0.5) / 0.3);
          if (lose) { y = 1.3 - 1.1 * f; al = 1 - f; rad *= 1 - 0.6 * f; } else rad += (0.42 - rad) * f;
        }
        if (al > 0.02) r.sphere(S.P(x, y), rad, col[k], { emissive: 0.4, alpha: al });
        S.lab('k' + k, S.P(x, 1.85), S.g('k' + k, () => G0(k ? 'ket1' : 'ket0', k ? '1' : '0')), 'sym0 small' + (u > 0.6 && lose ? ' fade0' : ''));
      }
      if (u > 0.45 && u < 0.65) { const f = (u - 0.45) / 0.2; r.sphere(S.P(0, 1.3), 0.3 + 0.9 * f, MC.m, { alpha: 0.6 * (1 - f), emissive: 1, unlit: 1 }); }
    },
  },
  {
    id: 'srn', ch: 4, keys: ['σ', 'r', 'n'], chime: 'ket', glyph: () => G0('σ') + G0('r') + G0('n'),
    name: tr('σ, r, n — Pauliho matice, Blochov vektor, os merania', 'σ, r, n — Pauli matrices, Bloch vector, measurement axis', 'σ, r, n — матриці Паулі, вектор Блоха, вісь вимірювання'),
    lines: () => LN('l0.srn.lines'),
    q1: () => LQ('l0.srn.q1'),
    q2: () => LQ('l0.srn.q2'),
    draw(r, S, t) {
      const c1 = S.P(-0.75, 1.0), o = { emissive: 0.4 };
      for (const [d, nm] of [[S.R, 'x'], [UP0, 'z'], [S.F, 'y']]) { r.arrow(c1, V3.add(c1, V3.scale(d, 0.42)), MC.ket, 0.025, o); S.lab('ax' + nm, V3.add(c1, V3.scale(d, 0.55)), nm, 'axis tiny'); }
      const c2 = S.P(0.45, 1.25), L = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.6)), a = t * 0.5;
      D0.ball(r, c2, 0.6);
      const d = V3.norm(V3.add(V3.scale(UP0, 0.8), V3.add(V3.scale(S.R, Math.cos(a) * 0.6), V3.scale(S.F, Math.sin(a) * 0.6))));
      r.arrow(c2, V3.add(c2, V3.scale(d, 0.6 * L)), MC.ket, 0.04, o);
      const n = V3.norm(V3.add(V3.scale(S.R, 0.7), V3.scale(UP0, 0.5)));
      r.arrow(c2, V3.add(c2, V3.scale(n, 0.68)), MC.g, 0.03, { emissive: 0.6 });
      S.lab('r', V3.add(c2, V3.scale(d, 0.6 * L + 0.18)), `<span class="mn-ket">|r| = ${Fmt.num(L, 2)}</span>`, 'axis tiny');
      S.lab('n', V3.add(c2, V3.scale(n, 0.85)), S.g('n', () => G0('n')), 'sym0 small');
      S.lab('s', S.P(-0.75, 1.7), S.g('s', () => G0('σ')), 'sym0 small');
    },
  },
  {
    id: 'nmr', ch: 4, keys: ['ω', 'Δ', 'Ω'], chime: 'φ', glyph: () => G0('ω') + G0('Δ') + G0('Ω'),
    name: tr('ω, Ω, Δ — precesia, Rabiho frekvencia, rozladenie', 'ω, Ω, Δ — precession, Rabi frequency, detuning', 'ω, Ω, Δ — прецесія, частота Рабі, розлад'),
    lines: () => LN('l0.nmr.lines'),
    q1: () => LQ('l0.nmr.q1'),
    q2: () => LQ('l0.nmr.q2'),
    draw(r, S, t) {
      const c1 = S.P(-0.75, 0.8), tilt = 0.55, w = t * 2, o = { emissive: 0.45 };
      r.rod(c1, V3.add(c1, [0, 1.05, 0]), [0.5, 0.55, 0.7], 0.012);
      const d = V3.add(V3.scale(UP0, Math.cos(tilt)), V3.add(V3.scale(S.R, Math.sin(tilt) * Math.cos(w)), V3.scale(S.F, Math.sin(tilt) * Math.sin(w))));
      r.arrow(c1, V3.add(c1, V3.scale(d, 0.9)), MC.ph, 0.04, o);
      r.draw('circle', M4.trs(V3.add(c1, [0, 0.9 * Math.cos(tilt), 0]), 0, 0.9 * Math.sin(tilt)), MC.ph, { alpha: 0.6 });
      const c2 = S.P(0, 2.0);
      r.draw('circle', M4.trs(c2, 0, 0.3), MC.ph, { alpha: 0.5 });
      for (const sp of [2, 2.5]) r.sphere(V3.add(c2, V3.add(V3.scale(S.R, Math.cos(t * sp) * 0.3), V3.scale(S.F, Math.sin(t * sp) * 0.3))), 0.06, MC.ph, { emissive: 0.7 });
      const c3 = S.P(0.75, 0.8), th = 1.3 * (0.5 - 0.5 * Math.cos(t * 1.6)), d3 = V3.add(V3.scale(UP0, Math.cos(th)), V3.scale(S.R, Math.sin(th)));
      r.arrow(c3, V3.add(c3, V3.scale(d3, 0.9)), MC.ket, 0.04, o);
      r.arc(c3, UP0, S.R, 0.35, th, MC.th); D0.dots(r, c3, UP0, S.R, 0.35, th, MC.th, 6);
      const pr = (t * 0.8) % 1;
      r.draw('torus', M4.trs(c3, 0, 0.15 + pr * 0.5), MC.th, { alpha: 1 - pr, emissive: 0.6 });
      S.lab('w', S.P(-0.75, 2.05), S.g('w', () => G0('ω')), 'sym0 small');
      S.lab('D', S.P(0, 2.45), S.g('D', () => G0('Δ')), 'sym0 small');
      S.lab('O', S.P(0.75, 2.05), S.g('O', () => G0('Ω')), 'sym0 small');
    },
  },
  {
    id: 'ptA', ch: 4, keys: ['p', 't', 'A'], chime: 'P', glyph: () => G0('p') + G0('t') + G0('A'),
    name: tr('p, t, A — dekoherencia, čas, amplitúdy ciest', 'p, t, A — decoherence, time, path amplitudes', 'p, t, A — декогеренція, час, амплітуди шляхів'),
    lines: () => LN('l0.ptA.lines'),
    q1: () => LQ('l0.ptA.q1'),
    q2: () => LQ('l0.ptA.q2'),
    draw(r, S, t) {
      const c1 = S.P(-0.8, 1.1), fog = (t % 5) / 5;
      r.sphere(c1, 0.12 * (1 - fog) + 0.02, hue0(t * 1.5), { emissive: 0.7, alpha: 1 - 0.8 * fog });
      r.sphere(c1, 0.25 + 0.2 * fog, MC.m, { alpha: 0.08 + 0.3 * fog, unlit: 1 });
      r.sphere(c1, 0.45 * fog + 0.1, MC.m, { alpha: 0.05 + 0.15 * fog, unlit: 1 });
      S.lab('p', S.P(-0.8, 0.45), `<span class="mn-m">p = ${Fmt.num(fog, 1)}</span>`, 'axis tiny');
      const c2 = S.P(-0.1, 1.9);                                                                   // t: sivé hodiny (nehybné)
      r.draw('circle', M4.orient(c2, S.F, 0.25), MC.k);
      r.rod(c2, V3.add(c2, V3.add(V3.scale(S.R, -0.12), V3.scale(UP0, 0.1))), MC.k, 0.015);
      r.rod(c2, V3.add(c2, V3.add(V3.scale(S.R, 0.14), V3.scale(UP0, 0.12))), MC.k, 0.015);
      const O = S.P(0.0, 0.7), ph = Math.PI * (0.5 - 0.5 * Math.cos(t * 0.7)), L = 0.42;
      const A1 = V3.scale(S.R, L), A2 = V3.add(V3.scale(S.R, Math.cos(ph) * L), V3.scale(UP0, Math.sin(ph) * L)), sum = V3.add(A1, A2);
      r.arrow(O, V3.add(O, A1), MC.c, 0.03, { emissive: 0.2 });
      r.arrow(V3.add(O, A1), V3.add(O, sum), MC.c, 0.03, { emissive: 0.2 });
      if (V3.len(sum) > 0.03) r.arrow(O, V3.add(O, sum), MC.P, 0.04, { emissive: 0.8 });
      D0.pillar(r, S.P(1.15, 0), V3.len(sum) ** 2 / (4 * L * L), MC.P, 1.4, 0.1);
      S.lab('A', S.P(0.5, 0.45), 'P = |A₁ + A₂|²', 'axis tiny');
    },
  },

  // ===== 5. kapitola: obyčajné časti vzorca, zvuk a slovné pomôcky =====
  ];

// záverečná skúška: otázky naprieč všetkými exponátmi
const FINAL0 = () => { const out = []; for (let i = 1; DL.has(`l0.final.${i}.q`); i++) out.push(LQ(`l0.final.${i}`)); return out; };

const CHAPTERS0 = {
  1: () => DL('l0.chapter.1'),
  2: () => DL('l0.chapter.2'),
  3: () => DL('l0.chapter.3'),
  4: () => DL('l0.chapter.4'),
};

class L0Symbols extends Level {
  get steps() { return [this.intro, this.ch1, this.ch2, this.ch3, this.ch4]; }

  enter(resume) {
    super.enter(resume);
    if (Settings.wow) { Wow.inst = null; document.body.dataset.scene = 'inst'; } // sieň symbolov nie je inštancia s bossom
  }
  setup() {
    this.cam = new OrbitCam([0, 1.4, 0], 15, 0, 0.55, 2.5, 26);
    const n = EXHIBITS0.length, RAD = 8;
    this.ex = EXHIBITS0.map((e, i) => {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2, out = [Math.cos(a), 0, Math.sin(a)];
      const F = V3.scale(out, -1), R = [-out[2], 0, out[0]], b = [out[0] * RAD, 0.9, out[2] * RAD];
      const cache = {};
      const S = {
        R, F, yaw: Math.atan2(F[0], F[2]),
        P: (x, y, z = 0) => [b[0] + R[0] * x + F[0] * z, b[1] + y, b[2] + R[2] * x + F[2] * z],
        lab: (k, p, html, cls = 'axis', tip = null) => UI.label('l0' + e.id + k, p, html, cls, tip),
        g: (k, f) => (cache[k] ??= f()), // glyfy sa počítajú raz
      };
      return { ...e, i, b, S, gl: e.glyph(), name: e.name };
    });
    this.focus = -1; this.revealed = -1; this.camT = 99; this.chimeJ = -1;
  }

  // ---------- priebeh ----------
  intro() {
    this.quest(tr('Vypočuj si Iskru', 'Listen to Spark', 'Послухай Іскру'), { easy: tr('💬 Iskra', '💬 Spark', '💬 Іскра') });
    this.say([
      DL('l0.intro.0'),
      DL('l0.intro.1', this.ex.length),
      DL('l0.intro.2'),
    ], () => this.next());
  }
  ch1() { this.chapter(1); }
  ch2() { this.chapter(2); }
  ch3() { this.chapter(3); }
  ch4() { this.chapter(4); }

  chapter(ch) {
    const list = this.ex.filter((e) => e.ch === ch), k0 = this.sub.k | 0;
    this.revealed = Math.max(this.revealed, list[0].i - 1 + k0);
    const run = (k) => {
      if (k >= list.length) return this.review(ch, list);
      this.sub.k = k; Game.save();
      const e = list[k];
      this.show(e);
      this.quest(`${e.name}`, { easy: `${k + 1} / ${list.length}`, hard: tr(`Kapitola ${ch} · ${k + 1}/${list.length}`, `Chapter ${ch} · ${k + 1}/${list.length}`, `Розділ ${ch} · ${k + 1}/${list.length}`) });
      this.say(e.lines(), () => this.ask(e.q1(), () => run(k + 1)));
    };
    if (k0 > 0) return run(k0);
    this.focus = -1; this.camT = 0;
    this.say([CHAPTERS0[ch]()], () => run(0));
  }
  review(ch, list) {
    this.sub.k = list.length; Game.save();
    this.focus = -1; this.camT = 0;
    UI.panelHide();
    this.quest(tr(`Opakovanie kapitoly ${ch}`, `Chapter ${ch} review`, `Повторення розділу ${ch}`), { easy: tr('📝 Opakovanie', '📝 Review', '📝 Повторення') });
    this.say([DL('l0.review', ch, list.length)], () =>
      UI.quizSeries(shuffle0(list.map((e) => this.q(e.q2()))), (m) => { this.mistakes += m; this.next(); }));
  }
  q(x) { return { who: this.mentor, face: this.face, ...x }; }
  show(e) {
    this.focus = e.i; this.revealed = Math.max(this.revealed, e.i); this.camT = 0;
    if (e.chime) EqG.chime(e.chime);
    // panel vpravo: glyfy exponátu zo slovníka (obrázok, názov, slovná pomôcka)
    const D = EqG.dict(), sample = { ket: 'ψ', ket0: '0', ket1: '1', ketpm: '+', bra: 'a', exp: 'iφ', sq: 'α' };
    const cards = e.keys.map((k) => `<div class="gd"><span class="gly big g-${k === 'sq' ? 'a' : D[k][0]}">${EqG.svg(k, sample[k] ?? k)}</span><div><b>${D[k][2]}</b><small>${D[k][3]}</small></div></div>`).join('');
    UI.panelSet(`${e.i + 1} / ${this.ex.length} · <span class="l0name">${e.name}</span>`, [
      UI.info(`<div class="l0big">${Array.isArray(e.gl) ? e.gl.join(' ') : e.gl}</div>`),
      ...(cards ? [UI.info(`<div class="eqlegend inline l0cards">${cards}</div>`)] : []),
      UI.info(tr('💡 Kamerou môžeš otáčať — exponát sa hýbe stále.', '💡 Turn the camera as you like — the exhibit keeps moving.', '💡 Камеру можна обертати — експонат рухається постійно.'), 'tip'),
    ]);
  }

  finale() {
    UI.panelHide();
    this.focus = -1; this.camT = 0; this.revealed = this.ex.length - 1;
    const pool = shuffle0(EXHIBITS0.flatMap((e) => [e.q1, e.q2])).slice(0, 6).map((f) => f());
    const list = shuffle0([...FINAL0(), ...pool]).map((x) => this.q(x));
    this.quest(tr('Veľká skúška symbolov', 'The big symbol exam', 'Великий іспит символів'), { easy: tr('📝 Skúška', '📝 Exam', '📝 Іспит'), hard: tr(`${list.length} otázok naprieč všetkými podstavcami`, `${list.length} questions across all pedestals`, `${list.length} питань з усіх постаментів`) });
    this.say([DL('l0.finale.intro', list.length)], () =>
      UI.quizSeries(list, (m) => {
        this.mistakes += m;
        const total = list.length + this.ex.length * 2, k = this.mistakes / total;
        const stars = byDiff(k <= 0.1 ? 3 : k <= 0.25 ? 2 : 1, k <= 0.05 ? 3 : k <= 0.15 ? 2 : 1, k === 0 ? 3 : k <= 0.08 ? 2 : 1);
        Game.completeLevel(0, stars);
        const rating = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        this.say([DL('l0.finale.done', rating, this.mistakes, total)], () => Game.backToHub());
      }));
  }

  viewState() { return null; }

  update(dt) {
    this.t += dt;
    this.camT += dt;
    const e = this.ex[this.focus];
    const goal = e ? e.S.P(0, 0.15) : [0, 1.4, 0]; // cieľ pod stredom exponátu → exponát sedí v hornej časti obrazovky, nad dialógom
    this.cam.target = V3.lerp(this.cam.target, goal, Math.min(1, dt * 3));
    if (this.camT < 1.8) { // po zmene exponátu sa kamera otočí k nemu; potom ju hráč môže voľne ťahať
      const k = Math.min(1, dt * 3.5), yaw = e ? e.S.yaw : this.cam.yaw, dist = e ? 6.2 : 15, pitch = e ? 0.1 : 0.42;
      let dy = yaw - this.cam.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      this.cam.yaw += dy * k; this.cam.dist += (dist - this.cam.dist) * k; this.cam.pitch += (pitch - this.cam.pitch) * k;
    }
  }

  draw(r) {
    const t = this.t;
    r.begin(this.cam.eye(), this.cam.target);
    // sieň: tmavá podlaha s mriežkou, prstenec
    r.draw('disk', M4.trs([0, -0.01, 0], 0, 12.5), [0.09, 0.08, 0.18], { pattern: 1 });
    r.draw('circle', M4.trs([0, 0.02, 0], 0, 12.5), [0.37, 0.89, 1]);
    r.draw('circle', M4.trs([0, 0.02, 0], 0, 8), [0.4, 0.45, 0.7], { alpha: 0.5 });
    // sprievodkyňa Iskra sa vznáša vysoko nad stredom siene (kamera pri exponáte stojí blízko stredu a nesmie ju zakryť)
    const gy = 5.6 + Math.sin(t * 1.3) * 0.15;
    Spark.draw(r, [0, gy, 0], t, 1.2);
    UI.label('l0guide', [0, gy + 1.05, 0], tr('✨ Iskra', '✨ Spark', '✨ Іскра'), 'npc', null);
    UI.hot([0, gy, 0], tr('<b>Iskra</b> — sprievodkyňa Sieňou symbolov.', '<b>Spark</b> — your guide through the Hall of Symbols.', '<b>Іскра</b> — провідниця Залою символів.'), 40);
    for (const e of this.ex) {
      const on = e.i <= this.revealed, act = e.i === this.focus, col = on ? this.colorOf(e) : [0.35, 0.36, 0.42];
      const base = [e.b[0], 0, e.b[2]];
      r.draw('cylinder', M4.trs(base, 0, [0.95, 0.9, 0.95]), act ? [0.2, 0.2, 0.34] : [0.15, 0.15, 0.26]);
      r.draw('torus', M4.trs([e.b[0], 0.92, e.b[2]], 0, 0.95), col, { emissive: act ? 0.9 : on ? 0.35 : 0 });
      if (!on) { UI.label('l0q' + e.id, e.S.P(0, 0.6), '?', 'sym0 dim', null); continue; }
      if (act) r.draw('cone', M4.trs(base, 0, [1.25, 5.5, 1.25]), col, { alpha: 0.06, unlit: 1 }); // reflektor
      e.draw(r, e.S, t + e.i * 0.7, act, this);
      const gi = e.glyphAt ? e.gl[e.glyphAt(t + e.i * 0.7)] : e.gl;
      e.S.lab('glyph', e.S.P(0, 2.75), gi, 'sym0' + (act ? '' : ' dim'));
      UI.hot(e.S.P(0, 1.3), `<b>${e.name}</b>`, 50);
    }
  }
  colorOf(e) {
    return { alpha: MC.a, beta: MC.b, ket: MC.ket, bra: MC.ket, theta: MC.th, phi: MC.ph, gamma: MC.g, expi: MC.ph, ops: MC.op, P: MC.P, sq: MC.P, rho: MC.coh,
      const: MC.k, collapse: MC.m, srn: MC.ket, nmr: MC.ph, ptA: MC.m }[e.id] || MC.c;
  }
}

const shuffle0 = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const LEVEL0 = { num: 0, title: tr('Sieň symbolov', 'Hall of Symbols', 'Зала символів'), mentor: tr('Iskra', 'Spark', 'Іскра'), face: '✨', color: [0.37, 0.89, 1], cls: L0Symbols };
