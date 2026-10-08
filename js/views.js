'use strict';
// 👁 Pohľady: ten istý stav v niekoľkých obrazoch naraz (kláves V, kedykoľvek, v každej obťažnosti).
//  ručičky (amplitúdy ako hodinové ručičky) · Bloch 2D (rez zboku a zhora) · bázy (P v Z, X, Y)
//  · ρ (matica hustoty: veľkosť štvorca = |ρᵢⱼ|, farba = fáza) · zápis (symboly s rovnakými farbami)
// Každá scéna môže poskytnúť viewState(): { psi } | { r } | { amps: [{ z, label }], sum } | { two: psi4 } | null, + note.

const VC = { a: '#4f8cff', b: '#ff6b7d', w: '#e8ecff', m: '#8f9bc8', grid: '#2a3356', gold: '#ffd25a', A: '#ffb44f', B: '#5fe08a' };
const phaseColor = (ph, a = 1) => `hsla(${((ph * 180 / Math.PI) % 360 + 360) % 360}, 85%, 62%, ${a})`;

// čísla v pohľadoch sa zaokrúhľujú na jedno desatinné miesto, aby sa pri pohybe nemenili príliš rýchlo
// (len zobrazenie; presné hodnoty ostávajú v hre a v paneli). Presné tvary ½, 1/√2, π/2 … sa zachovajú.
const VF = {
  num: (x) => Fmt.num(x, 1),
  angle: (t) => Fmt.angle(t, 1),
  complex: (z) => Fmt.complex(z, 1),
  pct: (p) => Math.round(p * 10) * 10 + ' %',
};
const Views = {
  TABS: ['hands', 'bloch2d', 'bases', 'rho', 'notation', 'all'],
  init() {
    const box = el('div'); box.id = 'views';
    const head = el('div', 'vh');
    head.appendChild(el('b', null, tr('👁 Pohľady', '👁 Views')));
    this.tabsEl = el('div', 'vtabs');
    const names = {
      hands: [tr('🕐 Ručičky', '🕐 Hands'), tr('Amplitúdy ako hodinové ručičky: dĺžka = |amplitúda|, uhol = fáza. <span style="color:#4f8cff">α modrá</span>, <span style="color:#ff6b7d">β červená</span>.', 'Amplitudes as clock hands: length = |amplitude|, angle = phase. <span style="color:#4f8cff">α blue</span>, <span style="color:#ff6b7d">β red</span>.')],
      bloch2d: [tr('🌐 Bloch 2D', '🌐 Bloch 2D'), tr('Blochova sféra v dvoch rezoch: zboku (os z hore, x vpravo) a zhora (x vpravo, y hore). Bez 3D hlavolamov.', 'The Bloch sphere in two cuts: from the side (z up, x right) and from the top (x right, y up). No 3D puzzling.')],
      bases: [tr('📊 Bázy', '📊 Bases'), tr('Ten istý stav, tri rôzne otázky: pravdepodobnosti pri meraní v báze Z, X a Y.', 'The same state, three different questions: probabilities for a measurement in the Z, X and Y basis.')],
      rho: [tr('▦ ρ', '▦ ρ'), tr('Matica hustoty ako mapa: plocha štvorca = |ρᵢⱼ|, farba = fáza (kruh farieb vpravo). Diagonála = populácie, mimo = koherencie.', 'The density matrix as a map: square area = |ρᵢⱼ|, colour = phase (colour wheel on the right). Diagonal = populations, off-diagonal = coherences.')],
      notation: [tr('∑ Zápis', '∑ Notation'), tr('Všetky symboly naraz — v rovnakých farbách ako obrázky.', 'All the symbols at once — in the same colours as the pictures.')],
      all: [tr('⊞ Všetko', '⊞ All'), tr('Štyri obrazy toho istého stavu vedľa seba.', 'Four pictures of the same state side by side.')],
    };
    this.btns = {};
    for (const t of this.TABS) {
      const b = el('button', null, names[t][0]); b.dataset.tip = names[t][1];
      b.onclick = () => this.setTab(t);
      this.tabsEl.appendChild(b); this.btns[t] = b;
    }
    const close = el('button', 'vclose', '✕'); close.onclick = () => this.toggle(false);
    head.append(this.tabsEl, close);
    // kreslí sa v logických súradniciach 380 × 250; plátno sa zobrazí o 30 % väčšie (CSS) a kreslí v ostrom rozlíšení
    this.W = 380; this.H = 250; this.k = 1.3 * Math.min(window.devicePixelRatio || 1, 2);
    this.canvas = el('canvas'); this.canvas.width = Math.round(this.W * this.k); this.canvas.height = Math.round(this.H * this.k);
    this.cap = el('div', 'vcap');
    box.append(head, this.canvas, this.cap);
    document.body.appendChild(box);
    this.box = box;
    this.toggle(Settings.view.viewsOpen);
    this.setTab(Settings.view.viewsTab);
  },
  toggle(force) {
    const show = force ?? !this.box.classList.contains('show');
    this.box.classList.toggle('show', show);
    Settings.view.viewsOpen = show; Settings.save();
  },
  open(tab) { this.toggle(true); if (tab) this.setTab(tab); },
  setTab(t) {
    if (!this.TABS.includes(t)) t = 'all';
    this.tab = t; Settings.view.viewsTab = t; Settings.save();
    for (const k of this.TABS) this.btns[k].classList.toggle('on', k === t);
    this.canvas.style.display = t === 'notation' ? 'none' : '';
    this.last = null;
  },

  // ---------- stav scény → jednotný tvar ----------
  state() {
    const raw = Game.scene && Game.scene.viewState ? Game.scene.viewState() : null;
    if (!raw) return null;
    if (raw.two) return { kind: 'two', psi: raw.two, note: raw.note };
    if (raw.amps) return { kind: 'amps', amps: raw.amps, sum: raw.sum, note: raw.note };
    let psi = raw.psi, r = raw.r;
    if (psi) r = Q.bloch(psi);
    else if (V3.len(r) > 0.995) psi = Q.fromBloch(Math.acos(clamp(r[2] / V3.len(r), -1, 1)), Math.atan2(r[1], r[0]));
    const rho = [[(1 + r[2]) / 2, [r[0] / 2, -r[1] / 2]], [[r[0] / 2, r[1] / 2], (1 - r[2]) / 2]];
    return { kind: 'qubit', psi, r, rho, pure: V3.len(r) > 0.995, note: raw.note };
  },

  update() {
    if (!this.box || !this.box.classList.contains('show')) return;
    const st = this.state(), key = JSON.stringify(st) + this.tab + LANG;
    if (key === this.last) return; // kreslí sa len pri zmene
    this.last = key;
    const g = this.canvas.getContext('2d'), W = this.W, H = this.H;
    g.setTransform(this.k, 0, 0, this.k, 0, 0);
    g.fillStyle = '#0b1020'; g.fillRect(0, 0, W, H);
    g.font = '13px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (!st) {
      g.fillStyle = VC.m; g.fillText(tr('Tu nie je jeden konkrétny stav qubitu.', 'There is no single qubit state here.'), W / 2, H / 2 - 8);
      g.fillText(tr('Pohľady ožijú v leveloch s qubitom (1–4, 6, 7).', 'The views come alive in qubit levels (1–4, 6, 7).'), W / 2, H / 2 + 10);
      this.cap.innerHTML = '';
      return;
    }
    if (this.tab === 'all') {
      const w = W / 2, h = H / 2;
      this.hands(g, 0, 0, w, h, st, true); this.bloch2d(g, w, 0, w, h, st, true);
      this.bases(g, 0, h, w, h, st, true); this.rho(g, w, h, w, h, st, true);
      g.strokeStyle = VC.grid; g.beginPath(); g.moveTo(w, 0); g.lineTo(w, H); g.moveTo(0, h); g.lineTo(W, h); g.stroke();
    } else if (this.tab !== 'notation') this[this.tab](g, 0, 0, W, H, st, false);
    this.cap.innerHTML = this.notation(st, this.tab === 'notation');
  },

  // ---------- pomocné kreslenie ----------
  arrow(g, x0, y0, x1, y1, col, w = 2.5) {
    const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), hd = Math.min(8, L * 0.4);
    g.strokeStyle = col; g.fillStyle = col; g.lineWidth = w;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    if (L > 2) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - hd * Math.cos(a - 0.4), y1 - hd * Math.sin(a - 0.4)); g.lineTo(x1 - hd * Math.cos(a + 0.4), y1 - hd * Math.sin(a + 0.4)); g.fill(); }
    g.lineWidth = 1;
  },
  circle(g, cx, cy, R, col = VC.grid, dash) { g.strokeStyle = col; if (dash) g.setLineDash(dash); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.setLineDash([]); },
  title(g, x, y, w, t, small) { g.fillStyle = VC.m; g.textAlign = 'center'; g.font = (small ? '12px' : '13px') + ' system-ui'; g.fillText(t, x + w / 2, y + 9); },
  // jedna „hodinová ručička“ amplitúdy z (komplexné číslo) v kruhu polomeru R
  clock(g, cx, cy, R, z, col, label, small, alpha = 1) {
    this.circle(g, cx, cy, R);
    g.strokeStyle = VC.grid; g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
    const m = C.abs(z), ph = C.arg(z);
    this.circle(g, cx, cy, Math.max(m * R, 0.5), col + '66', [3, 3]);
    g.globalAlpha = alpha;
    if (m > 0.01) this.arrow(g, cx, cy, cx + z[0] * R, cy - z[1] * R, col, small ? 2 : 3);
    else { g.fillStyle = col; g.beginPath(); g.arc(cx, cy, 2.5, 0, 7); g.fill(); }
    g.globalAlpha = 1;
    g.fillStyle = col; g.font = (small ? 'bold 13px' : 'bold 15px') + ' system-ui'; g.fillText(label, cx, cy - R - (small ? 8 : 10));
    g.font = '12px system-ui'; g.fillStyle = VC.w;
    if (!small) g.fillText(`|${label}| = ${VF.num(m)}${m > 0.01 ? ', ' + tr('fáza', 'phase') + ' ' + VF.angle((ph + 2 * Math.PI) % (2 * Math.PI)) : ''}`, cx, cy + R + 11);
    if (!small) g.fillText(`P = |${label}|² = ${VF.num(m * m)}`, cx, cy + R + 24);
  },

  // ---------- pohľad: ručičky ----------
  hands(g, x, y, w, h, st, small) {
    this.title(g, x, y, w, small ? tr('🕐 ručičky', '🕐 hands') : tr('ručičky: dĺžka = veľkosť, uhol = fáza', 'hands: length = size, angle = phase'), small);
    if (st.kind === 'qubit') {
      const R = Math.min(w * 0.2, h * (small ? 0.3 : 0.27)), cy = y + h * (small ? 0.56 : 0.47);
      if (st.pure) {
        this.clock(g, x + w * 0.28, cy, R, st.psi[0], VC.a, 'α', small);
        this.clock(g, x + w * 0.72, cy, R, st.psi[1], VC.b, 'β', small);
      } else { // zmes: dĺžky z populácií, fáza z koherencie, priehľadnosť = miera koherencie
        const p0 = st.rho[0][0], p1 = st.rho[1][1], c = Math.hypot(st.r[0], st.r[1]) / 2, k = p0 * p1 > 1e-6 ? c / Math.sqrt(p0 * p1) : 0;
        this.clock(g, x + w * 0.28, cy, R, C.of(Math.sqrt(p0)), VC.a, 'α', small);
        this.clock(g, x + w * 0.72, cy, R, C.scale(C.exp(Math.atan2(st.r[1], st.r[0])), Math.sqrt(p1)), VC.b, 'β', small, 0.15 + 0.85 * k);
        g.fillStyle = VC.gold; g.font = '12px system-ui';
        g.fillText(small ? tr(`zmes · koherencia ${Math.round(k * 10) * 10} %`, `mixture · coherence ${Math.round(k * 10) * 10} %`) : tr(`zmes: fáza β je určená len na ${Math.round(k * 10) * 10} %`, `mixture: the phase of β is only ${Math.round(k * 10) * 10} % defined`), x + w / 2, y + h - 7);
      }
      if (st.pure && !small) {
        let d = C.arg(st.psi[1]) - C.arg(st.psi[0]); d = ((d % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        g.fillStyle = VC.gold; g.fillText(`${tr('relatívna fáza', 'relative phase')} φ = arg β − arg α = ${VF.angle(d)}`, x + w / 2, y + h - 8);
      }
    } else if (st.kind === 'amps') {
      const R = Math.min(w * 0.3, h * 0.36), cx = x + w / 2, cy = y + h * 0.52;
      this.circle(g, cx, cy, R);
      g.strokeStyle = VC.grid; g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
      const cols = [VC.a, VC.b, VC.w];
      if (st.sum) { // hlava k päte: A₁, potom A₂ od konca A₁, výsledok bielo
        let px = cx, py = cy, sx = 0, sy = 0;
        st.amps.forEach((a, i) => { const nx = px + a.z[0] * R, ny = py - a.z[1] * R; this.arrow(g, px, py, nx, ny, cols[i]); g.fillStyle = cols[i]; g.fillText(a.label, (px + nx) / 2 + 9, (py + ny) / 2 - 9); px = nx; py = ny; sx += a.z[0]; sy += a.z[1]; });
        this.arrow(g, cx, cy, cx + sx * R, cy - sy * R, VC.gold, 3.5);
        g.fillStyle = VC.gold; g.fillText(`A₁+A₂: P = ${VF.num(sx * sx + sy * sy)}`, x + w / 2, y + h - 8);
      } else st.amps.forEach((a, i) => this.clock(g, cx, cy, R, a.z, cols[i], a.label, small));
    } else { // dva qubity: 4 amplitúdy
      const R = Math.min(w * 0.09, h * 0.22), cy = y + h * 0.52;
      ['|00⟩', '|01⟩', '|10⟩', '|11⟩'].forEach((t, i) => this.clock(g, x + w * (0.14 + i * 0.24), cy, R, st.psi[i], i === 0 || i === 3 ? VC.a : VC.b, t, true));
      if (!small) { g.fillStyle = VC.m; g.fillText(tr('štyri amplitúdy zloženého stavu', 'four amplitudes of the composite state'), x + w / 2, y + h - 8); }
    }
  },

  // ---------- pohľad: Blochova sféra v 2D rezoch ----------
  bloch2d(g, x, y, w, h, st, small) {
    g.font = '13px system-ui';
    const R = Math.min(w * 0.2, h * (small ? 0.27 : 0.33)), cy = y + h * (small ? 0.57 : 0.52), views = [[x + w * (small ? 0.3 : 0.27), tr('zboku (x, z)', 'side (x, z)'), 0, 2], [x + w * (small ? 0.69 : 0.73), tr('zhora (x, y)', 'top (x, y)'), 0, 1]];
    const vecs = st.kind === 'two' ? [[Q2.reducedBloch(st.psi, 0), VC.A, 'A'], [Q2.reducedBloch(st.psi, 1), VC.B, 'B']]
      : st.kind === 'qubit' ? [[st.r, VC.w, 'r']] : null;
    if (!vecs) { this.title(g, x, y, w, 'Bloch 2D'); g.fillStyle = VC.m; g.fillText(tr('jedna amplitúda nemá Blochov vektor', 'a single amplitude has no Bloch vector'), x + w / 2, y + h / 2); return; }
    for (const [cx, name, i, j] of views) {
      g.fillStyle = VC.m; g.font = '12px system-ui'; g.fillText(small ? (j === 2 ? 'x–z' : 'x–y') : name, cx, y + 10);
      this.circle(g, cx, cy, R, '#55628f');
      g.strokeStyle = VC.grid; g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
      g.font = '12px system-ui';
      const lab = j === 2 ? ['|0⟩', '|1⟩'] : ['|+i⟩', '|−i⟩'];
      g.fillStyle = VC.m; g.fillText(lab[0], cx, cy - R - 7); g.fillText(lab[1], cx, cy + R + 8);
      // v malom pohľade len vonkajšie popisky osi x (vnútorné by sa medzi kruhmi prekrývali)
      if (!small || cx > x + w / 2) g.fillText('|+⟩', cx + R + (small ? 10 : 12), cy);
      if (!small || cx < x + w / 2) g.fillText('|−⟩', cx - R - (small ? 10 : 12), cy);
      for (const [v, col, l] of vecs) {
        const px = cx + v[i] * R, py = cy - v[j] * R;
        if (V3.len(v) < 0.02) { g.fillStyle = col; g.beginPath(); g.arc(cx, cy, 3.5, 0, 7); g.fill(); }
        else this.arrow(g, cx, cy, px, py, col, small ? 2 : 2.5);
        if (vecs.length > 1) { g.fillStyle = col; g.fillText(l, px + 8, py - 6); }
      }
      if (st.kind === 'qubit' && !small && V3.len(st.r) > 0.05) { // uhly: θ v bočnom reze, φ v hornom
        g.strokeStyle = VC.gold; g.lineWidth = 1.5;
        if (j === 2) { const th = Math.atan2(st.r[0], st.r[2]); g.beginPath(); g.arc(cx, cy, R * 0.35, -Math.PI / 2, -Math.PI / 2 + th, th < 0); g.stroke(); g.fillStyle = VC.gold; g.fillText('θ', cx + R * 0.48 * Math.sin(th / 2), cy - R * 0.48 * Math.cos(th / 2)); }
        else if (Math.hypot(st.r[0], st.r[1]) > 0.05) { const ph = Math.atan2(st.r[1], st.r[0]); g.beginPath(); g.arc(cx, cy, R * 0.35, 0, -ph, ph > 0); g.stroke(); g.fillStyle = VC.gold; g.fillText('φ', cx + R * 0.5 * Math.cos(ph / 2), cy - R * 0.5 * Math.sin(ph / 2)); }
        g.lineWidth = 1;
      }
    }
    if (!small) {
      g.fillStyle = VC.m; g.font = '12px system-ui';
      const L = st.kind === 'qubit' ? V3.len(st.r) : null;
      g.fillText(L === null ? tr('previazané qubity: šípky A a B sa skrátia do stredu', 'entangled qubits: arrows A and B shrink to the centre')
        : `|r| = ${VF.num(L)} → ${L > 0.99 ? tr('čistý stav (na povrchu)', 'pure state (on the surface)') : L < 0.02 ? tr('maximálne zmiešaný (stred)', 'maximally mixed (centre)') : tr('zmiešaný (vnútri)', 'mixed (inside)')}`, x + w / 2, y + h - 8);
    }
  },

  // ---------- pohľad: pravdepodobnosti v rôznych bázach ----------
  bases(g, x, y, w, h, st, small) {
    g.font = '13px system-ui';
    let groups;
    if (st.kind === 'qubit') {
      const [rx, ry, rz] = st.r;
      groups = [['Z', [['0', (1 + rz) / 2, VC.a], ['1', (1 - rz) / 2, VC.b]]], ['X', [['+', (1 + rx) / 2, VC.a], ['−', (1 - rx) / 2, VC.b]]], ['Y', [['+i', (1 + ry) / 2, VC.a], ['−i', (1 - ry) / 2, VC.b]]]];
      this.title(g, x, y, w, small ? tr('📊 bázy Z, X, Y', '📊 bases Z, X, Y') : tr('ten istý stav, tri otázky (bázy)', 'the same state, three questions (bases)'), small);
    } else if (st.kind === 'two') {
      const p = st.psi.map(C.abs2), pa = p[0] + p[1], pb = p[0] + p[2];
      groups = [['Z⊗Z', [['00', p[0], VC.a], ['01', p[1], VC.b], ['10', p[2], VC.b], ['11', p[3], VC.a]]], [tr('Alica', 'Alice'), [['0', pa, VC.A], ['1', 1 - pa, VC.A]]], ['Bob', [['0', pb, VC.B], ['1', 1 - pb, VC.B]]]];
      this.title(g, x, y, w, small ? tr('📊 páry / sám', '📊 pairs / alone') : tr('páry vs. každý qubit sám', 'pairs vs. each qubit alone'), small);
    } else {
      const cols = [VC.a, VC.b, VC.gold];
      groups = [['|A|²', st.amps.map((a, i) => [a.label, C.abs2(a.z), cols[i]])]];
      if (st.sum) {
        const s = st.amps.reduce((acc, a) => C.add(acc, a.z), C.of(0));
        groups.push([tr('klasicky', 'classical'), [['Σ|A|²', st.amps.reduce((acc, a) => acc + C.abs2(a.z), 0), VC.m]]], [tr('kvantovo', 'quantum'), [['|ΣA|²', C.abs2(s), VC.gold]]]);
      }
      this.title(g, x, y, w, tr('pravdepodobnosti', 'probabilities'), small);
    }
    const n = groups.reduce((s, gr) => s + gr[1].length, 0) + groups.length - 1, bw = (w - 30) / n, base = y + h - (small ? 20 : 26), top = y + (small ? 32 : 52), H = base - top;
    let k = 0;
    g.strokeStyle = VC.grid; g.beginPath(); g.moveTo(x + 15, base); g.lineTo(x + w - 15, base); g.moveTo(x + 15, base - H / 2); g.lineTo(x + w - 15, base - H / 2); g.stroke();
    for (const [name, bars] of groups) {
      const gx = x + 15 + k * bw;
      for (const [l, p, col] of bars) {
        const bx = x + 15 + k * bw + bw * 0.15, hh = p * H;
        g.fillStyle = col; g.fillRect(bx, base - hh, bw * 0.7, hh);
        g.fillStyle = VC.w; g.font = '12px system-ui';
        if (g.measureText(l).width > bw * 0.85) g.font = '10px system-ui'; // úzke stĺpce: menší popisok, aby sa neprekrýval
        g.fillText(l, bx + bw * 0.35, base + 8);
        if (bw > 30) g.fillText(VF.pct(p), bx + bw * 0.35, base - hh - 7);
        k++;
      }
      g.fillStyle = VC.gold; g.font = 'bold 12px system-ui'; g.fillText(name, (gx + x + 15 + k * bw) / 2, y + (small ? 24 : 30)); // pod nadpisom, nad percentami
      k++;
    }
  },

  // ---------- pohľad: matica hustoty ako mapa ----------
  rho(g, x, y, w, h, st, small) {
    g.font = '13px system-ui';
    let M, labels;
    if (st.kind === 'qubit') { M = st.rho.map((row) => row.map((v) => (typeof v === 'number' ? [v, 0] : v))); labels = ['0', '1']; }
    else if (st.kind === 'two') { M = st.psi.map((a) => st.psi.map((b) => C.mul(a, C.conj(b)))); labels = ['00', '01', '10', '11']; }
    else { this.title(g, x, y, w, 'ρ'); g.fillStyle = VC.m; g.fillText(tr('ρ patrí stavu, nie jednej amplitúde', 'ρ belongs to a state, not to a single amplitude'), x + w / 2, y + h / 2); return; }
    this.title(g, x, y, w, small ? '▦ ρ' : tr('ρ: plocha = |ρᵢⱼ|, farba = fáza', 'ρ: area = |ρᵢⱼ|, colour = phase'), small);
    const n = M.length, S = Math.min(w * 0.62, h - (small ? 42 : 58)) / n, ox = x + (w - S * n) / 2 - (small ? 0 : 18), oy = y + (small ? 30 : 38);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = M[i][j], m = C.abs(v), s = Math.sqrt(Math.min(1, m)) * S * 0.92, cx = ox + j * S + S / 2, cy = oy + i * S + S / 2;
      g.strokeStyle = i === j ? '#3d4a7a' : '#4a3a6a'; g.strokeRect(ox + j * S, oy + i * S, S, S);
      if (m > 1e-3) { g.fillStyle = phaseColor(C.arg(v), 0.9); g.fillRect(cx - s / 2, cy - s / 2, s, s); }
      if (S > 34) { // |ρᵢⱼ| ∠ fáza (kratšie než a + bi)
        const ph = C.arg(v);
        g.fillStyle = VC.w; g.font = '12px system-ui';
        g.fillText(VF.num(m) + (m > 5e-3 && Math.abs(ph) > 0.01 ? ` ∠${VF.angle(ph)}` : ''), cx, cy);
      }
    }
    g.fillStyle = VC.m; g.font = '12px system-ui';
    labels.forEach((l, i) => { g.fillText(l, ox - 10, oy + i * S + S / 2); g.fillText(l, ox + i * S + S / 2, oy - 7); });
    if (!small) { // farebný kruh fázy
      const cx = x + w - 34, cy = y + h / 2;
      for (let a = 0; a < 36; a++) { g.fillStyle = phaseColor(a * Math.PI / 18); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 16, -(a + 1) * Math.PI / 18, -a * Math.PI / 18); g.fill(); }
      g.fillStyle = VC.m; g.fillText('0', cx + 24, cy); g.fillText('π', cx - 24, cy); g.fillText('π/2', cx, cy - 24);
      g.fillText(tr('fáza', 'phase'), cx, cy + 26);
      if (st.kind === 'qubit') g.fillText(`Tr ρ² = ${VF.num((1 + V3.dot(st.r, st.r)) / 2)}`, x + w / 2 - 18, y + h - 8);
    }
  },

  // ---------- zápis (HTML pod obrázkom) ----------
  notation(st, full) {
    const A = (s) => `<span class="ca">${s}</span>`, B = (s) => `<span class="cb">${s}</span>`, f = (z) => VF.complex(z);
    const note = st.note ? `<div class="vnote">${st.note}</div>` : '';
    if (st.kind === 'amps') {
      const cols = [A, B, (s) => `<span class="cg">${s}</span>`];
      return note + st.amps.map((a, i) => `${cols[i](a.label)} = ${f(a.z)} = ${VF.num(C.abs(a.z))}·e<sup>i·${VF.angle((C.arg(a.z) + 2 * Math.PI) % (2 * Math.PI))}</sup>`).join('<br>')
        + (full ? `<br>P = |${tr('amplitúda', 'amplitude')}|²` : '');
    }
    if (st.kind === 'two') {
      const det = C.sub(C.mul(st.psi[0], st.psi[3]), C.mul(st.psi[1], st.psi[2])), ent = C.abs(det) > 1e-3;
      let s = `|Ψ⟩ = ${Q2.ketString(st.psi)}`;
      if (full) s += `<br>ψ₀₀ψ₁₁ − ψ₀₁ψ₁₀ = ${f(det)} → <b>${ent ? tr('previazaný', 'entangled') : tr('produktový stav', 'product state')}</b>`
        + `<br>r<sub>A</sub> = (${Q2.reducedBloch(st.psi, 0).map((v) => VF.num(v)).join(', ')}), r<sub>B</sub> = (${Q2.reducedBloch(st.psi, 1).map((v) => VF.num(v)).join(', ')})`;
      return note + s;
    }
    const [rx, ry, rz] = st.r, L = V3.len(st.r);
    let s = st.pure ? `|ψ⟩ = ${A(f(st.psi[0]))}|0⟩ + ${B(f(st.psi[1]))}|1⟩` : `ρ = ½(I + r·σ), |r| = ${VF.num(L)} (${tr('zmes', 'mixture')})`;
    if (full) {
      const th = Math.acos(clamp(rz / (L || 1), -1, 1)), ph = (Math.atan2(ry, rx) + 2 * Math.PI) % (2 * Math.PI);
      if (st.pure) s += `<br>${tr('stĺpec', 'column')}: (${A(f(st.psi[0]))}, ${B(f(st.psi[1]))})<sup>T</sup> · ${A('α')} = cos(θ/2), ${B('β')} = e<sup>iφ</sup> sin(θ/2)`
        + `<br>θ = ${VF.angle(th)}, φ = ${VF.angle(ph)}`;
      s += `<br>r = (⟨X⟩, ⟨Y⟩, ⟨Z⟩) = (${VF.num(rx)}, ${VF.num(ry)}, ${VF.num(rz)})`
        + `<br>ρ = [[${A(VF.num(st.rho[0][0]))}, ${f(st.rho[0][1])}], [${f(st.rho[1][0])}, ${B(VF.num(st.rho[1][1]))}]]`
        + `<br>P(0) = ${A(VF.pct(st.rho[0][0]))}, P(1) = ${B(VF.pct(st.rho[1][1]))} · Tr ρ² = ${VF.num((1 + L * L) / 2)}`;
    }
    return note + s;
  },
};
