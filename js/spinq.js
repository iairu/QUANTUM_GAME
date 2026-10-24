'use strict';
// SpinQ — voľná dielňa (bez hodnotenia, dostupná kedykoľvek z ostrova / mapy / nastavení, klávesom Q).
// Rovnaký fyzikálny model ako NMR dielňa (level 12): prúdový RF impulz θ = γB₁τ v priečnej cievke.
// Navyše: idealizované logické hradlá (X, Y, Z, H, S, T) ako presné rotácie Blochovho vektora a
// presety základných stavov — na voľné skúšanie bez cieľov, kvízov a hviezdičiek.

const SpinQ = {
  num: 'spinq', // nečíselné id scény — Hub, mapa a uloženie pozície ho jednoducho ignorujú
  title: tr('🧪 SpinQ — voľná dielňa', '🧪 SpinQ — free play', '🧪 SpinQ — вільна гра'),
  request() {}, // voláva Game pri zmene obťažnosti/typu hry — dielňa sa nimi neriadi

  enter() {
    this.cam = new OrbitCam([0, 1.6, 0], 9, 0.55, 0.28, 4, 18);
    this.m = [0, 0, 1]; this.anim = null; this.pulsing = 0; this.t = 0;
    this.I = 1; this.tau = 5; this.phase = 'x'; this.fid = null;
    UI.setHud(this.title, tr('Voľná hra, bez hodnotenia — skús hradlá, presety aj prúdový impulz.', 'Free play, no grading — try the gates, presets and the current pulse.', 'Вільна гра, без оцінювання — спробуй гейти, заготовки та імпульс струму.'));
    this.buildPanel();
  },
  exit() { UI.panelHide(); },

  // ---------- fyzika impulzu (rovnaká ako NMR dielňa, level 12, bez rozladenia) ----------
  flip(I = this.I, tau = this.tau) { return 2 * Math.PI * NMR_GAMMA * 1e6 * NMR_K * I * tau * 1e-6; }, // θ = γB₁τ (rad)
  flipDeg(I, tau) { return this.flip(I, tau) * 180 / Math.PI; },

  disp() {
    const a = this.anim;
    if (!a) return this.m;
    return V3.rotate(a.v0, a.axis, a.ang * a.t);
  },
  // najkratšia rotácia z v0 do v1 (pre presety); pri protiľahlých vektoroch je os ľubovoľná priečna
  rotTo(v0, v1) {
    const ang = Math.acos(clamp(V3.dot(v0, v1), -1, 1));
    let axis = V3.cross(v0, v1);
    if (V3.len(axis) < 1e-6) axis = Math.abs(v0[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    return { axis: V3.norm(axis), ang };
  },
  preset(v1, label) {
    if (this.anim) return;
    const { axis, ang } = this.rotTo(this.m, v1);
    if (ang < 1e-6) return;
    this.anim = { v0: this.m, axis, ang, t: 0, done: () => this.afterShot(label) };
    this.m = v1.slice();
    Sound.sfx('cast');
  },
  // idealizované logické hradlo: presná rotácia o pevný uhol okolo pevnej osi
  gate(axis, ang, label) {
    if (this.anim) return;
    this.anim = { v0: this.m, axis, ang, t: 0, done: () => this.afterShot(label) };
    this.m = V3.rotate(this.m, axis, ang);
    this.pulsing = 1; Sound.sfx('cast');
  },
  // prúdový RF impulz: rotácia okolo osi vo fáze impulzu (priečna rovina)
  firePulse() {
    if (this.anim) return;
    const th = this.flip(), axis = V3.norm(NMR_PHASES[this.phase]);
    this.anim = { v0: this.m, axis, ang: th, t: 0, done: () => this.afterShot(`${Fmt.num(th * 180 / Math.PI, 0)}° (${this.phase})`) };
    this.m = V3.rotate(this.m, axis, th);
    this.pulsing = 1; Sound.sfx('cast');
  },
  // po skončení animácie: zapamätať priečnu magnetizáciu pre ilustračný graf FID
  afterShot(label) {
    const v = this.m;
    this.fid = { Mperp: Math.hypot(v[0], v[1]), phi0: Math.atan2(v[1], v[0]), label };
    this.updRead(); this.drawTrace();
  },

  update(dt) {
    this.t += dt;
    this.pulsing = Math.max(0, this.pulsing - dt * 1.2);
    if (this.anim) {
      this.anim.t = Math.min(1, this.anim.t + dt / 0.6);
      if (this.anim.t >= 1) { const d = this.anim.done; this.anim = null; d && d(); }
      this.updRead();
    }
  },

  // ---------- panel ----------
  buildPanel() {
    this.read = UI.info('');
    this.chart = UI.chart(300, 120);
    const presetBtn = (v, label) => UI.button(label, () => this.preset(v, label));
    const gateBtn = (label, axis, ang) => UI.button(label, () => this.gate(axis, ang, label));
    UI.panelSet(this.title, [
      UI.info(tr('Voľná dielňa so spinom ½ — ako jadro v stolovom NMR počítači SpinQ. Žiadne ciele ani otázky, len skús, čo chceš.',
        'A free-play workshop with a spin-½ — like the nucleus in a benchtop NMR computer such as SpinQ. No goals or questions, just try whatever you like.',
        'Вільна майстерня зі спіном ½ — як ядро в настільному ЯМР-комп’ютері SpinQ. Без цілей і питань, просто пробуй, що хочеш.'), 'tip'),
      el('h4', null, tr('Presety', 'Presets', 'Заготовки')),
      UI.row(presetBtn([0, 0, 1], '|0⟩'), presetBtn([0, 0, -1], '|1⟩'), presetBtn([1, 0, 0], '|+⟩'), presetBtn([-1, 0, 0], '|−⟩'), presetBtn([0, 1, 0], '|+i⟩'), presetBtn([0, -1, 0], '|−i⟩')),
      el('h4', null, tr('Idealizované hradlá', 'Idealized gates', 'Ідеалізовані гейти')),
      UI.row(gateBtn('X', [1, 0, 0], Math.PI), gateBtn('Y', [0, 1, 0], Math.PI), gateBtn('Z', [0, 0, 1], Math.PI), gateBtn('H', V3.norm([1, 0, 1]), Math.PI)),
      UI.row(gateBtn('S', [0, 0, 1], Math.PI / 2), gateBtn('S†', [0, 0, 1], -Math.PI / 2), gateBtn('T', [0, 0, 1], Math.PI / 4), gateBtn('T†', [0, 0, 1], -Math.PI / 4)),
      this.read,
      el('h4', null, tr('⚡ RF impulz (ako v NMR dielni)', '⚡ RF pulse (as in the NMR workshop)', '⚡ РЧ-імпульс (як у ЯМР-майстерні)')),
      this.slI = UI.slider(tr('prúd v cievke I (A)', 'coil current I (A)', 'струм у котушці I (А)'), 0, 2, 0.05, this.I, (v) => { this.I = v; this.updRead(); return Fmt.num(v, 2) + ' A'; }),
      this.slTau = UI.slider(tr('dĺžka impulzu τ (µs)', 'pulse length τ (µs)', 'тривалість імпульсу τ (мкс)'), 0, 40, 0.5, this.tau, (v) => { this.tau = v; this.updRead(); return Fmt.num(v, 1) + ' µs'; }),
      UI.row(...Object.keys(NMR_PHASES).map((k) => UI.button((this.phase === k ? '● ' : '○ ') + tr('fáza ', 'phase ', 'фаза ') + k, () => { this.phase = k; this.buildPanel(); }))),
      UI.row(UI.button(tr('⚡ Pustiť impulz', '⚡ Fire the pulse', '⚡ Подати імпульс'), () => this.firePulse(), 'big')),
      this.chart,
      UI.info(tr('Graf: priečny signál M<sub>⊥</sub>(t) po poslednom hradle alebo impulze (ilustračný rozpad T₂*).',
        'Chart: the transverse signal M<sub>⊥</sub>(t) after the last gate or pulse (an illustrative T₂* decay).',
        'Графік: поперечний сигнал M<sub>⊥</sub>(t) після останнього гейта чи імпульсу (ілюстративний розпад T₂*).'), 'tip'),
    ]);
    this.updRead(); this.drawTrace();
  },
  updRead() {
    if (!this.read) return;
    const v = this.disp(), th = Math.acos(clamp(v[2], -1, 1)), phRaw = Math.atan2(v[1], v[0]), ph = phRaw < 0 ? phRaw + 2 * Math.PI : phRaw, p0 = clamp((1 + v[2]) / 2, 0, 1);
    this.read.innerHTML = `M = (${v.map((x) => Fmt.num(x, 2)).join(', ')}) · θ = ${Fmt.num(th * 180 / Math.PI, 0)}° · φ = ${Fmt.num(ph * 180 / Math.PI, 0)}°<br>`
      + `P(0) = ${Fmt.pct(p0)} · P(1) = ${Fmt.pct(1 - p0)}<br>B₁ = k·I = ${Fmt.num(NMR_K * this.I * 1000, 2)} mT · θ<sub>${tr('impulz', 'pulse', 'імпульс')}</sub> = γB₁τ = ${Fmt.num(this.flipDeg(), 1)}°`;
  },
  drawTrace() {
    if (!this.chart) return;
    const f = this.fid;
    UI.drawChart(this.chart, { x0: 0, x1: 16, y0: -1.05, y1: 1.05, xlabel: tr('čas po poslednom hradle (ms)', 'time after the last gate (ms)', 'час після останнього гейта (мс)'),
      xticks: [[0, '0'], [4, '4'], [8, '8'], [12, '12'], [16, '16']], yticks: [[-1, '−1'], [0, '0'], [1, '1']],
      curves: f ? [{ f: (t) => f.Mperp * Math.exp(-t / 4) * Math.cos(2 * Math.PI * 0.4 * t + f.phi0), color: '#fb6' }] : [],
      legend: f ? [['#fb6', f.label]] : [] });
  },

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('box', M4.trs([0, -0.06, 0], 0, [13, 0.1, 9]), [0.14, 0.17, 0.22], { pattern: 1 });
    const c = [0, 1.6, 0], pulse = this.pulsing > 0 || !!this.anim;
    for (const s of [-1, 1]) r.draw('cylinder', M4.trs([0, s > 0 ? 3.55 : -0.05, 0], 0, [1.9, 0.35, 1.9]), s > 0 ? [0.75, 0.3, 0.3] : [0.3, 0.4, 0.8], { pattern: 4 });
    for (const a of [0.8, 2.4, 4.0, 5.6]) r.draw('box', M4.trs([Math.cos(a) * 1.7, 1.75, Math.sin(a) * 1.7], 0, [0.25, 3.5, 0.25]), [0.4, 0.42, 0.48]);
    r.arrow([-2.4, 0.4, 0], [-2.4, 3.2, 0], [0.5, 0.8, 1], 0.06);
    UI.label('qB0', [-2.4, 3.55, 0], 'B₀', 'ket');
    UI.hot([0, 3.6, 0], tr('<b>Magnet</b> — stále pole B₀ (ako permanentný magnet v SpinQ, ≈ 1 T).', '<b>Magnet</b> — a steady field B₀ (like the permanent magnet in a SpinQ, ≈ 1 T).', '<b>Магніт</b> — стале поле B₀ (як постійний магніт у SpinQ, ≈ 1 Тл).'), 60);
    r.draw('cylinder', M4.trs([0, 0.4, 0], 0, [0.22, 2.6, 0.22]), [0.8, 0.9, 1], { alpha: 0.3 });
    for (const s of [-1, 1]) {
      const p = [s * 0.95, 1.6, 0];
      r.draw('torus', M4.orient(p, [1, 0, 0], 0.75), pulse ? [1, 0.75, 0.25] : [0.75, 0.5, 0.25], { emissive: pulse ? 1 : 0.1 });
      if (pulse) for (let k = 0; k < 6; k++) { const a = this.t * 9 + k * 1.05; r.sphere(V3.add(p, [0, Math.cos(a) * 0.75, Math.sin(a) * 0.75]), 0.05, [1, 0.95, 0.5], { emissive: 1, unlit: 1 }); }
    }
    r.arrow([1.9, 1.6, 0], [2.6, 1.6, 0], pulse ? [1, 0.85, 0.3] : [0.45, 0.4, 0.3], 0.04, { emissive: pulse ? 0.8 : 0 });
    UI.label('qB1', [2.95, 1.6, 0], pulse ? tr('B₁ (impulz!)', 'B₁ (pulse!)', 'B₁ (імпульс!)') : tr('RF cievka', 'RF coil', 'РЧ-котушка'), pulse ? 'prompt' : 'axis');
    UI.hot([0.95, 1.6, 0], tr('<b>RF cievka</b> — impulz vytvorí B₁ ⟂ B₀ a preklopí vektor o θ = γB₁τ.', '<b>RF coil</b> — a pulse creates B₁ ⟂ B₀ and tips the vector by θ = γB₁τ.', '<b>РЧ-котушка</b> — імпульс створює B₁ ⟂ B₀ і відхиляє вектор на θ = γB₁τ.'), 50);
    Bloch.draw(r, c, 1.15, this.disp(), { labelFn: UI.label.bind(UI), key: 'q', axisNames: true, bars: true });
  },
};
