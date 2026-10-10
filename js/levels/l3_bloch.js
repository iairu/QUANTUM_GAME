'use strict';
// LEVEL 3 — Blochovo observatórium (mentor: Felix Bloch)
// Hradlá ako rotácie, relatívna vs. globálna fáza, meranie (jeden bit vs. štatistika).

const BLOCH_PUZZLES = [
  { from: '0', to: '1', gates: ['X'], max: 1, title: tr('Preklop |0⟩ na |1⟩', 'Flip |0⟩ to |1⟩', 'Переверни |0⟩ на |1⟩'), grant: ['bloch', 'sphere', 'XYZ'],
    msg: DL('l3.BLOCH_PUZZLES.1') },
  { from: '0', to: '+', gates: ['X', 'Z', 'H'], max: 1, title: tr('Dostaň sa z pólu na rovník do |+⟩', 'Get from the pole to the equator, to |+⟩', 'Дістанься з полюса на екватор, до |+⟩'), grant: ['H'],
    msg: DL('l3.BLOCH_PUZZLES.2') },
  { from: '+', to: '-', gates: ['Z', 'S', 'T'], max: 1, title: tr('Zmeň |+⟩ na |−⟩', 'Change |+⟩ into |−⟩', 'Зміни |+⟩ на |−⟩'), grant: ['relph', 'ST'],
    msg: DL('l3.BLOCH_PUZZLES.3') },
  { from: '0', to: '+i', gates: ['H', 'S', 'X', 'Z'], max: 2, title: tr('Dostaň sa do |+i⟩ (os y)', 'Get to |+i⟩ (the y axis)', 'Дістанься до |+i⟩ (вісь y)'), grant: ['thetaphi'],
    msg: DL('l3.BLOCH_PUZZLES.4') },
  { from: '0', to: '1', gates: ['H', 'Z'], max: 3, title: tr('Preklop |0⟩ na |1⟩ — ale bez X!', 'Flip |0⟩ to |1⟩ — but without X!', 'Переверни |0⟩ на |1⟩ — але без X!'), grant: ['unitary'],
    msg: DL('l3.BLOCH_PUZZLES.5') },
  { from: '0', to: '1', gates: ['Y'], max: 1, title: tr('Preklop |0⟩ na |1⟩ hradlom Y', 'Flip |0⟩ to |1⟩ with the Y gate', 'Переверни |0⟩ на |1⟩ гейтом Y'), grant: ['globalph'],
    msg: DL('l3.BLOCH_PUZZLES.6') },
  // len na ťažkej obťažnosti
  { from: '0', to: '-i', gates: ['H', 'S', 'Z', 'X'], max: 3, hard: true, title: tr('Dostaň sa do |−i⟩ (os −y)', 'Get to |−i⟩ (the −y axis)', 'Дістанься до |−i⟩ (вісь −y)'), grant: [],
    msg: DL('l3.BLOCH_PUZZLES.7') },
  { from: '+', to: '+i', gates: ['T'], max: 2, hard: true, title: tr('Otoč |+⟩ na |+i⟩ len hradlom T', 'Turn |+⟩ into |+i⟩ using only T', 'Перетвори |+⟩ на |+i⟩ лише гейтом T'), grant: [],
    msg: DL('l3.BLOCH_PUZZLES.8') },
];

class L3Bloch extends Level {
  get steps() { return [this.intro, this.puzzles, this.measure, this.lab]; }
  puzzleList() { return BLOCH_PUZZLES.filter((p) => !p.hard || Settings.hard); }

  setup() {
    this.cam = new OrbitCam([0, 0, 0], 7, 0.75, 0.32, 3.5, 14);
    this.psi = Q.ket0(); this.anim = null; this.trail = []; this.pi = 0; this.hist = null; this.f = {}; this.step = null;
  }

  intro() {
    this.quest(tr('Vypočuj si Felixa Blocha', 'Listen to Felix Bloch', 'Послухай Фелікса Блоха'), { easy: tr('💬 Bloch', '💬 Bloch', '💬 Блох'), hard: tr('Bloch: θ, φ, rotácie', 'Bloch: θ, φ, rotations', 'Блох: θ, φ, повороти') });
    this.say([
      DL('l3.intro.1.0'),
      DL('l3.intro.1.1'),
      DL('l3.intro.1.2'),
      DL('l3.intro.1.3', this.puzzleList().length),
    ], () => this.next());
  }

  puzzles() { this.plist = this.puzzleList(); this.loadPuzzle(Math.min(this.sub.pi || 0, this.plist.length - 1)); }

  loadPuzzle(i) {
    this.pi = i; this.sub.pi = i;
    const P = this.plist[i], max = this.maxMoves = P.max + byDiff(1, 0, 0), n = this.plist.length;
    this.psi = Q.named(P.from); this.moves = 0; this.trail = []; this.anim = null; this.solved = false;
    this.quest(tr(`Hádanka ${i + 1}/${n}: ${P.title} (max. ${max} ${max === 1 ? 'hradlo' : 'hradlá'})`, `Puzzle ${i + 1}/${n}: ${P.title} (max. ${max} ${max === 1 ? 'gate' : 'gates'})`, `Головоломка ${i + 1}/${n}: ${P.title} (макс. ${max} ${max === 1 ? 'гейт' : 'гейти'})`), {
      easy: tr(`🧩 ${i + 1}/${n}: ${P.title}`, `🧩 ${i + 1}/${n}: ${P.title}`, `🧩 ${i + 1}/${n}: ${P.title}`),
      hard: `${i + 1}/${n} · |${P.from.replace('-', '−')}⟩ → |${P.to.replace('-', '−')}⟩ · {${P.gates.join(',')}} · ≤ ${max}`,
    });
    const gateBtns = ['X', 'Y', 'Z', 'H', 'S', 'T'].map((g) => {
      const b = UI.button(g, () => this.applyGate(g), 'gate');
      b.disabled = !P.gates.includes(g);
      return b;
    });
    this.readout = UI.info('');
    UI.panelSet(tr('Hradlá (rotácie sféry)', 'Gates (rotations of the sphere)', 'Гейти (повороти сфери)'), [
      UI.row(...gateBtns),
      UI.row(UI.button(tr('↺ Znova', '↺ Again', '↺ Знову'), () => this.loadPuzzle(i))),
      this.readout,
      UI.info(`${tr('Povolené', 'Allowed', 'Дозволено')}: ${P.gates.join(', ')}`, 'tip'),
      Settings.hard ? null : UI.info(tr('X, Y, Z: 180° okolo osí x, y, z · H: 180° okolo osi (x+z) · S: 90° okolo z · T: 45° okolo z', 'X, Y, Z: 180° about the x, y, z axes · H: 180° about the (x+z) axis · S: 90° about z · T: 45° about z', 'X, Y, Z: 180° навколо осей x, y, z · H: 180° навколо осі (x+z) · S: 90° навколо z · T: 45° навколо z'), 'tip'),
    ].filter(Boolean));
    this.updReadout();
  }

  applyGate(g) {
    if (this.anim || this.solved) return;
    if (this.step === 'lab') return this.rotate(GateAxis[g][0], GateAxis[g][1], Gate[g], g);
    if (this.moves >= this.maxMoves) { UI.toast(tr('Minul si povolený počet hradiel — skús ↺ Znova.', 'You’ve used up the allowed number of gates — try ↺ Again.', 'Ти використав(-ла) дозволену кількість гейтів — спробуй ↺ Знову.')); return; }
    const [axis, ang] = GateAxis[g];
    this.anim = { v0: Q.bloch(this.psi), axis: V3.norm(axis), ang, t: 0, g };
    this.psi = Q.apply(Gate[g], this.psi);
    this.moves++;
  }

  // animovaná rotácia (laboratórium): os n, uhol ang, matica U
  rotate(n, ang, U, label) {
    if (this.anim) return;
    this.anim = { v0: Q.bloch(this.psi), axis: V3.norm(n), ang, t: 0, g: label };
    this.psi = Q.apply(U, this.psi);
  }

  onAnimDone() {
    this.updReadout();
    if (this.step === 'lab') return this.updLab();
    const P = this.plist[this.pi];
    if (Q.fidelity(this.psi, Q.named(P.to)) > 0.999) {
      this.solved = true;
      this.grant(P.grant);
      this.say([`✅ ${P.msg}`], () => {
        if (this.pi === 2) {
          this.ask({ q: DL('l3.onAnimDone.1.q'), options: [DL('l3.onAnimDone.1.options.0'), DL('l3.onAnimDone.1.options.1'), DL('l3.onAnimDone.1.options.2')], correct: 0,
            why: DL('l3.onAnimDone.1.why') }, () => this.advance());
        } else this.advance();
      });
    } else if (this.moves >= this.maxMoves) UI.toast(tr('Ešte to nie je ono. Klikni ↺ Znova a skús iné poradie.', 'Not quite yet. Click ↺ Again and try a different order.', 'Ще не зовсім. Натисни ↺ Знову і спробуй інший порядок.'));
  }
  advance() { if (this.pi + 1 < this.plist.length) this.loadPuzzle(this.pi + 1); else this.next(); }

  updReadout() {
    if (!this.readout) return;
    const v = Q.bloch(this.psi), [p0, p1] = Q.probs(this.psi);
    const th = Math.acos(clamp(v[2], -1, 1)), ph = Math.atan2(v[1], v[0]);
    const raw = Q.ketString(this.psi, false), can = Q.ketString(this.psi, true);
    this.readout.innerHTML = `<b>|ψ⟩ = ${raw}</b>` + (raw !== can ? `<br>∼ ${can} <small>(${tr('až na globálnu fázu', 'up to a global phase', 'з точністю до глобальної фази')})</small>` : '')
      + `<br>P(0) = |α|² = ${Fmt.num(p0, 2)}, P(1) = |β|² = ${Fmt.num(p1, 2)}`
      + `<br>θ = ${Fmt.angle(th)}${Math.abs(Math.sin(th)) > 1e-3 ? ', φ = ' + Fmt.angle((ph + 2 * Math.PI) % (2 * Math.PI)) : ''}`
      + (this.moves !== undefined && !this.step ? `<br>${tr('Použité hradlá', 'Gates used', 'Використані гейти')}: ${this.moves}` : '');
    const P = !this.step && this.plist && this.plist[this.pi];
    if (P && Settings.easy) {
      const t = Q.bloch(Q.named(P.to)), tth = Math.acos(clamp(t[2], -1, 1)), tph = (Math.atan2(t[1], t[0]) + 2 * Math.PI) % (2 * Math.PI);
      this.readout.innerHTML += `<br><small>💡 ${tr('cieľ', 'target', 'ціль')}: θ = ${Fmt.angle(tth)}${Math.abs(Math.sin(tth)) > 1e-3 ? ', φ = ' + Fmt.angle(tph) : ''}</small>`;
    }
  }

  // ---------- meranie ----------
  measure() {
    this.step = 'measure';
    this.psi = Q.named('+'); this.trail = []; this.hist = null; this.f.m1 = this.f.m100 = false;
    this.quest(tr('Priprav |+⟩ a zmeraj ho: raz (1×) a potom na 100 kópiách.', 'Prepare |+⟩ and measure it: once (1×), then on 100 copies.', 'Приготуй |+⟩ і виміряй його: один раз (1×), потім на 100 копіях.'), {
      easy: tr('📏 Meraj |+⟩: 1× a 100×', '📏 Measure |+⟩: 1× and 100×', '📏 Виміряй |+⟩: 1× і 100×'),
      hard: tr('|+⟩ → M<sub>Z</sub> ×1, ×100 · porovnaj s |+i⟩', '|+⟩ → M<sub>Z</sub> ×1, ×100 · compare with |+i⟩', '|+⟩ → M<sub>Z</sub> ×1, ×100 · порівняй із |+i⟩'),
    });
    this.say([
      DL('l3.measure.1.0'),
      DL('l3.measure.1.1'),
    ]);
    this.readout = UI.info('');
    UI.panelSet(tr('Meranie v Z-báze', 'Measurement in the Z basis', 'Вимірювання в базисі Z'), [
      UI.row(UI.button(tr('Priprav |+⟩', 'Prepare |+⟩', 'Приготувати |+⟩'), () => { this.psi = Q.named('+'); this.updReadout(); }), UI.button(tr('Priprav |+i⟩', 'Prepare |+i⟩', 'Приготувати |+i⟩'), () => { this.psi = Q.named('+i'); this.updReadout(); })),
      UI.row(UI.button(tr('Meraj 1×', 'Measure 1×', 'Виміряти 1×'), () => this.measureOnce(), 'big'), UI.button(tr('Meraj 100 kópií', 'Measure 100 copies', 'Виміряти 100 копій'), () => this.measureMany())),
      this.readout,
    ]);
    this.updReadout();
  }
  measureOnce() {
    const p0 = Q.probs(this.psi)[0], out = rand() < p0 ? 0 : 1;
    this.psi = out ? Q.ket1() : Q.ket0();
    this.updReadout();
    UI.toast(tr(`Výsledok: <b>${out}</b> → stav je teraz |${out}⟩ (pôvodná fáza je stratená)`, `Outcome: <b>${out}</b> → the state is now |${out}⟩ (the original phase is lost)`, `Результат: <b>${out}</b> → стан тепер |${out}⟩ (початкова фаза втрачена)`));
    if (!this.f.m1) { this.f.m1 = true; this.checkMeasure(); }
  }
  measureMany() {
    const p0 = Q.probs(this.psi)[0];
    let n0 = 0;
    for (let i = 0; i < 100; i++) if (rand() < p0) n0++;
    this.hist = [n0, 100 - n0];
    UI.toast(`${tr('100 kópií', '100 copies', '100 копій')}: 0 → ${n0}×, 1 → ${100 - n0}×`);
    if (!this.f.m100) { this.f.m100 = true; this.checkMeasure(); }
  }
  checkMeasure() {
    if (!(this.f.m1 && this.f.m100) || this.f.mdone) return;
    this.f.mdone = true;
    this.ask({ q: DL('l3.checkMeasure.1.q'), options: [DL('l3.checkMeasure.1.options.0'), DL('l3.checkMeasure.1.options.1'), DL('l3.checkMeasure.1.options.2')], correct: 0,
      why: DL('l3.checkMeasure.1.why') }, () => this.next());
  }

  // ---------- geometrické laboratórium (voľné skúmanie) ----------
  labN() { const a = this.L.nth * Math.PI / 180, b = this.L.nph * Math.PI / 180; return [Math.sin(a) * Math.cos(b), Math.sin(a) * Math.sin(b), Math.cos(a)]; }
  labM() { const a = this.L.mth * Math.PI / 180, b = this.L.mph * Math.PI / 180; return [Math.sin(a) * Math.cos(b), Math.sin(a) * Math.sin(b), Math.cos(a)]; }
  lab() {
    this.step = 'lab'; this.hist = null; this.trail = []; this.anim = null;
    this.L = { th: 60, ph: 45, nth: 90, nph: 0, ang: 90, mth: 0, mph: 0 };
    this.quest(tr('Geometrické laboratórium: priprav ľubovoľný stav, otáčaj okolo ľubovoľnej osi a meraj pozdĺž ľubovoľnej osi. Potom pokračuj na skúšku.',
      'Geometry lab: prepare any state, rotate about any axis and measure along any axis. Then continue to the exam.', 'Геометрична лабораторія: приготуй будь-який стан, повертай навколо будь-якої осі й вимірюй уздовж будь-якої осі. Потім переходь до іспиту.'), {
      easy: tr('🧪 Laboratórium: stav · rotácia · meranie', '🧪 Lab: state · rotation · measurement', '🧪 Лабораторія: стан · поворот · вимірювання'),
      hard: '|ψ(θ,φ)⟩ → R<sub>n</sub>(α) → M<sub>m</sub>: P(+m) = (1 + r·m)/2',
    });
    this.say([DL('l3.lab.1')]);
    const L = this.L, deg = (v) => v + '°';
    this.labInfo = UI.info(''); this.labChart = UI.chart(300, 110); this.readout = UI.info('');
    const det = (title, nodes, open) => { const d = el('details'); d.open = !!open; d.appendChild(el('summary', null, title)); nodes.forEach((x) => d.appendChild(x)); return d; };
    UI.panelSet(tr('Geometrické laboratórium', 'Geometry lab', 'Геометрична лабораторія'), [
      this.readout,
      det(tr('1 · Priprav stav (θ, φ)', '1 · Prepare a state (θ, φ)', '1 · Приготуй стан (θ, φ)'), [
        UI.slider('θ', 0, 180, 5, L.th, (v) => { L.th = v; return deg(v); }, tr('Polárny uhol od |0⟩.', 'Polar angle from |0⟩.', 'Полярний кут від |0⟩.')),
        UI.slider('φ', 0, 355, 5, L.ph, (v) => { L.ph = v; return deg(v); }, tr('Relatívna fáza (azimut).', 'Relative phase (azimuth).', 'Відносна фаза (азимут).')),
        UI.button(tr('Priprav', 'Prepare', 'Приготувати'), () => { if (this.anim) return; this.psi = Q.fromBloch(L.th * Math.PI / 180, L.ph * Math.PI / 180); this.trail = []; this.updReadout(); this.updLab(); }),
      ], true),
      det(tr('2 · Rotácia R<sub>n</sub>(α) okolo osi n', '2 · Rotation R<sub>n</sub>(α) about the axis n', '2 · Поворот R<sub>n</sub>(α) навколо осі n'), [
        UI.slider(tr('os n: θ<sub>n</sub>', 'axis n: θ<sub>n</sub>', 'вісь n: θ<sub>n</sub>'), 0, 180, 15, L.nth, (v) => { L.nth = v; return deg(v); }),
        UI.slider(tr('os n: φ<sub>n</sub>', 'axis n: φ<sub>n</sub>', 'вісь n: φ<sub>n</sub>'), 0, 345, 15, L.nph, (v) => { L.nph = v; return deg(v); }),
        UI.slider(tr('uhol α', 'angle α', 'кут α'), -180, 180, 15, L.ang, (v) => { L.ang = v; return deg(v); }, tr('Kladný uhol = proti smeru hodinových ručičiek pri pohľade z hrotu osi n.', 'Positive angle = counter-clockwise when looking from the tip of n.', 'Додатний кут = проти годинникової стрілки, якщо дивитися з вістря n.')),
        UI.button(tr('↻ Otoč', '↻ Rotate', '↻ Повернути'), () => { const a = L.ang * Math.PI / 180; this.rotate(this.labN(), a, Gate.R(this.labN(), a), 'n'); }, 'big'),
        UI.row(...['X', 'Y', 'Z', 'H', 'S', 'T'].map((g) => UI.button(g, () => this.applyGate(g), 'gate'))),
      ], true),
      det(tr('3 · Meranie pozdĺž osi m', '3 · Measurement along the axis m', '3 · Вимірювання вздовж осі m'), [
        UI.slider(tr('os m: θ<sub>m</sub>', 'axis m: θ<sub>m</sub>', 'вісь m: θ<sub>m</sub>'), 0, 180, 15, L.mth, (v) => { L.mth = v; this.updLab(); return deg(v); }),
        UI.slider(tr('os m: φ<sub>m</sub>', 'axis m: φ<sub>m</sub>', 'вісь m: φ<sub>m</sub>'), 0, 345, 15, L.mph, (v) => { L.mph = v; this.updLab(); return deg(v); }),
        UI.row(UI.button(tr('Meraj 1×', 'Measure 1×', 'Виміряти 1×'), () => this.labMeasure(1)), UI.button(tr('Meraj 100 kópií', 'Measure 100 copies', 'Виміряти 100 копій'), () => this.labMeasure(100))),
        this.labInfo, this.labChart,
      ], true),
      UI.button(tr('Pokračovať na záverečnú skúšku ▸', 'Continue to the final exam ▸', 'Перейти до підсумкового іспиту ▸'), () => this.next(), 'primary'),
    ]);
    this.updReadout(); this.updLab();
  }
  labMeasure(n) {
    if (this.anim) return;
    const m = this.labM(), p = Q.probAlong(Q.bloch(this.psi), m);
    if (n === 1) {
      const plus = rand() < p, a = this.L.mth * Math.PI / 180, b = this.L.mph * Math.PI / 180;
      this.psi = plus ? Q.fromBloch(a, b) : Q.fromBloch(Math.PI - a, b + Math.PI);
      UI.toast(tr(`Výsledok: <b>${plus ? '+m' : '−m'}</b> → stav skolaboval do smeru ${plus ? '+m' : '−m'}.`, `Outcome: <b>${plus ? '+m' : '−m'}</b> → the state collapsed onto ${plus ? '+m' : '−m'}.`, `Результат: <b>${plus ? '+m' : '−m'}</b> → стан сколапсував у напрямок ${plus ? '+m' : '−m'}.`));
      this.trail = []; this.updReadout();
    } else {
      let k = 0; for (let i = 0; i < n; i++) if (rand() < p) k++;
      this.hist = [k, n - k];
    }
    this.updLab();
  }
  updLab() {
    if (!this.labInfo) return;
    const r = Q.bloch(this.psi), m = this.labM(), p = Q.probAlong(r, m), dot = V3.dot(r, m);
    const ang = Math.acos(clamp(dot, -1, 1)) * 180 / Math.PI;
    this.labInfo.innerHTML = `P(+m) = (1 + r·m)/2 = <b>${Fmt.pct(p)}</b>, P(−m) = ${Fmt.pct(1 - p)}<br><small>${tr('uhol medzi stavom a osou m', 'angle between the state and m', 'кут між станом і m')}: ${Math.round(ang)}° → cos²(${Math.round(ang)}°/2)</small>`;
    const bars = [{ x: 0.5, w: 0.62, y: p, color: '#ffd25a', outline: true }, { x: 1.5, w: 0.62, y: 1 - p, color: '#ffd25a', outline: true }];
    if (this.hist) bars.unshift({ x: 0.5, w: 0.5, y: this.hist[0] / 100, color: '#5fe08a', label: this.hist[0] + '×' }, { x: 1.5, w: 0.5, y: this.hist[1] / 100, color: '#ff6b7d', label: this.hist[1] + '×' });
    UI.drawChart(this.labChart, { x0: 0, x1: 2, y0: 0, y1: 1.15, yticks: [[0, '0'], [0.5, '½'], [1, '1']], xticks: [[0.5, '+m'], [1.5, '−m']], bars,
      legend: [['#ffd25a', tr('teória', 'theory', 'теорія')], ['#5fe08a', tr('100 meraní', '100 measurements', '100 вимірювань')]] });
  }

  viewState() {
    if (this.anim) return { r: V3.rotate(this.anim.v0, this.anim.axis, this.anim.ang * this.anim.t), note: tr('Hradlo práve otáča stav.', 'A gate is rotating the state.', 'Гейт обертає стан.') };
    return { psi: this.psi, note: tr('Všimni si: po hradle Y majú ručičky spoločnú fázu i (globálna fáza) — Blochove rezy ju nevidia.', 'Notice: after the Y gate both hands share the phase i (a global phase) — the Bloch cuts cannot see it.', 'Зверни увагу: після гейта Y обидві стрілки мають спільну фазу i (глобальну фазу) — перерізи Блоха її не бачать.') };
  }

  update(dt) {
    this.t += dt;
    if (this.anim) {
      const a = this.anim;
      a.t = Math.min(1, a.t + dt / 0.9);
      const v = V3.rotate(a.v0, a.axis, a.ang * a.t);
      if (this.trail.length === 0 || V3.len(V3.sub(this.trail[this.trail.length - 1], v)) > 0.06) this.trail.push(v);
      if (a.t >= 1) { this.anim = null; this.onAnimDone(); }
    }
  }

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -2.6, 0], 0, 6), [0.12, 0.14, 0.26], { pattern: 1 });
    const v = this.anim ? V3.rotate(this.anim.v0, this.anim.axis, this.anim.ang * this.anim.t) : Q.bloch(this.psi);
    const P = !this.step && this.plist ? this.plist[this.pi] : null;
    if (this.anim) {
      const ax = qToWorld(this.anim.axis);
      r.rod(V3.scale(ax, -2.6), V3.scale(ax, 2.6), [1, 1, 0.5], 0.02, { emissive: 0.6 });
      UI.label('gate', V3.scale(ax, 2.9), tr('os ', 'axis ', 'вісь ') + this.anim.g, 'prompt');
    }
    Bloch.draw(r, [0, 0, 0], 2, v, { target: P ? Q.bloch(Q.named(P.to)) : null, trail: this.trail, labelFn: UI.label.bind(UI), key: 'b', axisNames: true, bars: true });
    if (this.step === 'lab') { // os rotácie n (žltá, prerušovaná) a os merania m (zelená)
      const n = qToWorld(this.labN()), m = qToWorld(this.labM());
      r.dash(V3.scale(n, -2.7), V3.scale(n, 2.7), [1, 1, 0.5]);
      UI.label('labn', V3.scale(n, 2.95), 'n', 'prompt', tr('Os rotácie n (nastav v paneli).', 'Rotation axis n (set it in the panel).', 'Вісь обертання n (налаштуй її в панелі).'));
      r.arrow([0, 0, 0], V3.scale(m, 2.5), [0.4, 1, 0.6], 0.025, { alpha: 0.7 });
      r.rod([0, 0, 0], V3.scale(m, -2.5), [0.4, 1, 0.6], 0.012, { alpha: 0.5 });
      UI.label('labm', V3.scale(m, 2.75), '+m', 'ket', tr('Os merania m: výsledok „+“ = stav v smere m, „−“ = protiľahlý stav.', 'Measurement axis m: outcome “+” = the state along m, “−” = the opposite state.', 'Вісь вимірювання m: результат «+» = стан уздовж m, «−» = протилежний стан.'));
    }
    UI.label('psi', V3.scale(qToWorld(v), 2.35), 'ψ', 'player');
    if (this.hist) {
      for (let k = 0; k < 2; k++) {
        const h = this.hist[k] / 100 * 3;
        r.draw('cylinder', M4.trs([2.6 + k * 0.9, -2.6, -2.6], 0, [0.3, Math.max(h, 0.01), 0.3]), k ? [1, 0.5, 0.5] : [0.5, 0.7, 1], { emissive: 0.3 });
        UI.label('h' + k, [2.6 + k * 0.9, -2.3 + h, -2.6], `${this.step === 'lab' ? (k ? '−m' : '+m') : k}: ${this.hist[k]}×`, 'axis');
      }
    }
  }
}
