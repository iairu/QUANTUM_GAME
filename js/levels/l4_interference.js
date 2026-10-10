'use strict';
// LEVEL 4 — Chrám interferencie (mentor: Richard Feynman)
// H → H vs. H → meranie → H: koherentná superpozícia vs. zmes, matica hustoty, dekoherencia.

class L4Interference extends Level {
  get steps() { return [this.intro, this.pure, this.withMeasure, this.deco]; }

  setup() {
    this.cam = new OrbitCam([0, 0.8, -0.8], 11, 0.0, 0.42, 5, 20);
    this.mode = 'none'; this.p = 0; this.hist = [0, 0]; this.shot = null; this.f = {};
    this.shownR = [0, 0, 1]; this.flash = [0, 0];
    this.X = { prep: -5.5, h1: -3, mid: 0, h2: 3, det: 5.5 };
  }

  // Blochov vektor po prejdení do pozície x (H: (x,y,z) → (z,−y,x))
  stateAt(x) {
    let r = [0, 0, 1];
    const H = (v) => [v[2], -v[1], v[0]];
    if (x >= this.X.h1) r = H(r);
    if (x >= this.X.mid) {
      if (this.mode === 'meas') r = [0, 0, r[2]];
      if (this.mode === 'deco') {
        const c = Math.cos(this.phi || 0), sn = Math.sin(this.phi || 0), k = 1 - this.p; // dekoherencia + fázový posun okolo z
        r = [(r[0] * c - r[1] * sn) * k, (r[0] * sn + r[1] * c) * k, r[2]];
      }
    }
    if (x >= this.X.h2) r = H(r);
    return r;
  }
  P0() { return (1 + this.stateAt(99)[2]) / 2; }

  intro() {
    this.quest(tr('Vypočuj si Feynmana', 'Listen to Feynman', 'Послухай Фейнмана'), { easy: tr('💬 Feynman', '💬 Feynman', '💬 Фейнман'), hard: tr('Feynman: H·H, ρ, koherencia', 'Feynman: H·H, ρ, coherence', 'Фейнман: H·H, ρ, когерентність') });
    this.say([
      L('l4.intro.1.0'),
      L('l4.intro.1.1'),
      L('l4.intro.1.2'),
      L('l4.intro.1.3'),
    ], () => this.next());
  }

  pure() {
    this.mode = 'none'; this.resetHist();
    this.ask({ q: L('l4.pure.1.q'), options: [L('l4.pure.1.options.0'), L('l4.pure.1.options.1'), L('l4.pure.1.options.2')], correct: 0,
      why: L('l4.pure.1.why') }, () => {
      const n = byDiff(30, 50, 100);
      this.quest(tr(`Pošli aspoň ${n} qubitov cez H → H (stred chrámu prázdny). Sleduj stĺpce ρ!`, `Send at least ${n} qubits through H → H (temple centre empty). Watch the ρ bars!`, `Надішли щонайменше ${n} кубітів крізь H → H (центр храму порожній). Стеж за стовпчиками ρ!`), {
        easy: tr(`📤 ${n} qubitov · H → H`, `📤 ${n} qubits · H → H`, `📤 ${n} кубітів · H → H`), hard: `|0⟩ → H → H → M<sub>Z</sub> · N ≥ ${n} · ρ₀₁ ?` });
      this.buildPanel(false);
    });
  }

  withMeasure() {
    this.mode = 'meas'; this.resetHist();
    this.ask({ q: L('l4.withMeasure.1.q'), options: [L('l4.withMeasure.1.options.0'), L('l4.withMeasure.1.options.1'), L('l4.withMeasure.1.options.2')], correct: 0,
      why: L('l4.withMeasure.1.why') }, () => {
      const n = byDiff(30, 50, 100);
      this.quest(tr(`Pošli aspoň ${n} qubitov s meraním v strede. Pozri, čo sa stane s mimodiagonálnymi stĺpcami ρ.`, `Send at least ${n} qubits with the measurement in the centre. See what happens to the off-diagonal ρ bars.`, `Надішли щонайменше ${n} кубітів із вимірюванням у центрі. Подивися, що станеться з позадіагональними стовпчиками ρ.`), {
        easy: tr(`📤 ${n} qubitov · 👁 meranie v strede`, `📤 ${n} qubits · 👁 measurement in the middle`, `📤 ${n} кубітів · 👁 вимірювання посередині`), hard: `H → M<sub>Z</sub>(${tr('zabudnuté', 'forgotten', 'забуте')}) → H · N ≥ ${n} · ρ₀₁ → 0` });
      this.buildPanel(false);
    });
  }

  deco() {
    this.mode = 'deco'; this.p = 0; this.phi = 0; this.resetHist();
    this.target = byDiff(0.75, 0.75, [0.6, 0.65, 0.7, 0.8, 0.85, 0.9][Math.floor(rand() * 6)]);
    const T = Fmt.pct(this.target), n = byDiff(30, 50, 100);
    this.say([
      L('l4.deco.1.0'),
      L('l4.deco.1.1', T, n),
      L('l4.deco.1.2'),
    ], () => {
      this.quest(tr(`Nastav dekoherenciu p (a fázu φ) tak, aby P(0) = ${T}, a pošli aspoň ${n} qubitov.`, `Set the decoherence p (and the phase φ) so that P(0) = ${T}, and send at least ${n} qubits.`, `Встанови декогеренцію p (і фазу φ) так, щоб P(0) = ${T}, і надішли щонайменше ${n} кубітів.`), {
        easy: tr(`🌫 p → P(0) = ${T} · 📤 ${n}`, `🌫 p → P(0) = ${T} · 📤 ${n}`, `🌫 p → P(0) = ${T} · 📤 ${n}`),
        hard: `P(0) = (1 + (1−p)cos φ)/2 = ${T} ± ${Fmt.pct(byDiff(0.06, 0.03, 0.015))} · N ≥ ${n}`,
      });
      this.buildPanel(true);
    });
  }

  resetHist() { this.hist = [0, 0]; this.updInfo && this.updInfo(); }

  buildPanel(withSlider) {
    const nodes = [];
    const names = tr({ none: 'stred prázdny', meas: 'meranie Z (zabudnuté)', deco: 'dekoherencia p' }, { none: 'centre empty', meas: 'Z measurement (forgotten)', deco: 'decoherence p' }, { none: 'центр порожній', meas: 'вимірювання Z (забуте)', deco: 'декогеренція p' });
    nodes.push(UI.info(`${tr('Stred chrámu', 'Temple centre', 'Центр храму')}: <b>${names[this.mode]}</b>`));
    if (withSlider) nodes.push(
      UI.slider(tr('sila p', 'strength p', 'сила p'), 0, 1, byDiff(0.05, 0.05, 0.01), this.p, (v) => { if (v !== this.p) { this.p = v; this.resetHist(); } return Fmt.num(v, 2); }),
      UI.slider(tr('fázový posun φ (okolo z)', 'phase shift φ (about z)', 'фазовий зсув φ (навколо z)'), 0, 2 * Math.PI, Math.PI / 12, this.phi || 0, (v) => { if (v !== this.phi) { this.phi = v; this.resetHist(); } return Fmt.angle(v); },
        tr('Rotácia okolo osi z medzi bránami H. φ = π prevráti interferenciu: P(0) ↔ P(1).', 'A rotation about the z axis between the H gates. φ = π flips the interference: P(0) ↔ P(1).', 'Поворот навколо осі z між гейтами H. φ = π перевертає інтерференцію: P(0) ↔ P(1).')));
    nodes.push(UI.row(UI.button(tr('Pošli 1 (pomaly)', 'Send 1 (slowly)', 'Надіслати 1 (повільно)'), () => this.sendOne()), UI.button(tr('Pošli 100', 'Send 100', 'Надіслати 100'), () => this.sendMany(100), 'big'), UI.button(tr('Vymaž', 'Clear', 'Очистити'), () => this.resetHist())));
    const info = UI.info('');
    this.updInfo = () => {
      const n = this.hist[0] + this.hist[1];
      info.innerHTML = `${tr('Detektor', 'Detector', 'Детектор')}: <b>0 → ${this.hist[0]}×</b>, <b>1 → ${this.hist[1]}×</b>` + (n ? ` (P(0) ≈ ${Fmt.pct(this.hist[0] / n)})` : '')
        + `<br><small>${tr('teória', 'theory', 'теорія')}: P(0) = ${Fmt.pct(this.P0())}</small>`;
      // graf P(0) v závislosti od „sily zistenia“ p: prázdny stred = 0, meranie = 1
      const pe = this.mode === 'none' ? 0 : this.mode === 'meas' ? 1 : this.p, c = Math.cos(this.mode === 'deco' ? this.phi || 0 : 0);
      UI.drawChart(chart, {
        x0: 0, x1: 1, y0: 0, y1: 1, xlabel: tr('p (0 = koherentné, 1 = meranie)', 'p (0 = coherent, 1 = measurement)', 'p (0 = когерентно, 1 = вимірювання)'),
        xticks: [[0, '0'], [0.5, '½'], [1, '1']], yticks: [[0, '0'], [0.5, '½'], [1, '1']],
        curves: Settings.hard && this.mode === 'deco' ? [] : [{ f: (x) => (1 + (1 - x) * c) / 2, color: '#b48cff' }],
        hlines: this.mode === 'deco' ? [{ y: this.target, color: '#ffd25a', label: tr('cieľ', 'target', 'ціль') }] : [],
        points: [...(n ? [{ x: pe, y: this.hist[0] / n, color: '#5fe08a', r: 4 }] : []), { x: pe, y: this.P0(), color: '#ff7d8f', r: 5 }],
        legend: [['#ff7d8f', tr('teória', 'theory', 'теорія')], ['#5fe08a', tr('namerané', 'measured', 'виміряно')]],
      });
    };
    const chart = UI.chart(300, 120);
    nodes.push(info, chart);
    nodes.push(UI.info(tr('Stĺpce vzadu: ρ₀₀, ρ₁₁ = populácie; |ρ₀₁| = koherencia.', 'Bars at the back: ρ₀₀, ρ₁₁ = populations; |ρ₀₁| = coherence.', 'Стовпчики позаду: ρ₀₀, ρ₁₁ = заселеності; |ρ₀₁| = когерентність.'), 'tip'));
    UI.panelSet('Interferometer', nodes);
    this.updInfo();
  }

  sendOne() { if (!this.shot) this.shot = { x: this.X.prep }; }
  sendMany(n) {
    const p0 = this.P0();
    for (let i = 0; i < n; i++) this.hist[rand() < p0 ? 0 : 1]++;
    this.flash = [1, 1];
    this.updInfo(); this.check();
  }
  check() {
    const n = this.hist[0] + this.hist[1];
    if (n < byDiff(30, 50, 100)) return;
    if (this.stepIdx === 1 && !this.f.a) {
      this.f.a = true;
      this.grant(['feynman', 'coh']);
      this.say([L('l4.check.1')], () => this.next());
    } else if (this.stepIdx === 2 && !this.f.b) {
      this.f.b = true;
      this.grant(['rho', 'mix', 'supmix']);
      this.say([L('l4.check.2.0'),
        L('l4.check.2.1')], () => this.next());
    } else if (this.stepIdx === 3 && !this.f.c && this.mode === 'deco' && Math.abs(this.P0() - this.target) < byDiff(0.06, 0.03, 0.015)) {
      this.f.c = true;
      this.grant(['deco', 'dagger']);
      this.say([L('l4.check.3.0', Fmt.num(this.p, 2), Fmt.pct(1 - this.p), Fmt.pct(this.P0())),
        L('l4.check.3.1'),
        L('l4.check.3.2')], () => this.next());
    }
  }

  viewState() {
    return { r: this.shownR, note: tr('Stav qubitu na koľaji: meranie a dekoherencia mažú mimodiagonálu ρ a skracujú šípku.', 'The qubit state on the track: measurement and decoherence erase the off-diagonal of ρ and shorten the arrow.', 'Стан кубіта на доріжці: вимірювання й декогеренція стирають позадіагональ ρ і вкорочують стрілку.') };
  }

  update(dt) {
    this.t += dt;
    this.flash = this.flash.map((f) => Math.max(0, f - dt * 2));
    let target;
    if (this.shot) {
      this.shot.x += dt * 2.4;
      target = this.stateAt(this.shot.x);
      if (this.shot.x >= this.X.det) {
        const out = rand() < this.P0() ? 0 : 1;
        this.hist[out]++; this.flash[out] = 1; this.shot = null;
        this.updInfo && this.updInfo(); this.check();
        UI.toast(`${tr('Detektor', 'Detector', 'Детектор')}: ${out}`, 1200);
      }
    } else target = this.stateAt(99);
    this.shownR = V3.lerp(this.shownR, target, Math.min(1, dt * 5));
  }

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('box', M4.trs([0, -0.06, -1.5], 0, [15, 0.1, 8]), [0.2, 0.16, 0.3], { pattern: 1 });
    r.rod([this.X.prep, 0.15, 0], [this.X.det, 0.15, 0], [0.7, 0.6, 0.9], 0.05);
    const gate = (x, label, col) => {
      r.draw('torus', M4.orient([x, 0.9, 0], [1, 0, 0], 0.9), col, { emissive: 0.4 });
      UI.label('g' + x, [x, 2.1, 0], label, 'prompt');
      UI.hot([x, 0.9, 0], TIPS.H, 45);
    };
    gate(this.X.h1, 'H', [0.75, 0.45, 1]);
    gate(this.X.h2, 'H', [0.75, 0.45, 1]);
    UI.label('prep', [this.X.prep, 1.3, 0], tr('príprava<br>|0⟩', 'preparation<br>|0⟩', 'приготування<br>|0⟩'), 'ket');
    if (this.mode === 'meas') {
      r.draw('box', M4.trs([0, 0.9, 0], 0, [0.5, 1.2, 1.4]), [0.9, 0.3, 0.3], { alpha: 0.5 });
      UI.label('mid', [0, 2.1, 0], tr('👁 meranie Z<br><small>výsledok zabudnutý</small>', '👁 Z measurement<br><small>result forgotten</small>', '👁 вимірювання Z<br><small>результат забуто</small>'), 'prompt');
    } else if (this.mode === 'deco') {
      for (let i = 0; i < 6; i++) r.sphere([Math.sin(this.t + i) * 0.4, 0.6 + i * 0.15, Math.cos(this.t * 0.7 + i * 2) * 0.5], 0.25 + 0.1 * this.p, [0.7, 0.7, 0.8], { alpha: 0.1 + 0.35 * this.p });
      UI.label('mid', [0, 2.1, 0], `🌫 ${tr('prostredie', 'environment', 'довкілля')}<br><small>p = ${Fmt.num(this.p, 2)}${this.phi ? ', φ = ' + Fmt.angle(this.phi) : ''}</small>`, 'prompt');
    } else UI.label('mid', [0, 2.1, 0], tr('(prázdne)', '(empty)', '(порожньо)'), 'axis');
    // detektor
    for (let k = 0; k < 2; k++) {
      const p = [this.X.det + 0.3, 0.5, k ? 0.6 : -0.6];
      r.draw('box', M4.trs(p, 0, 0.5), k ? [1, 0.45, 0.45] : [0.45, 0.65, 1], { emissive: 0.2 + this.flash[k] });
      UI.hot(p, tr(`<b>Detektor výsledku ${k}</b> — meranie v Z-báze na konci koľaje.`, `<b>Detector for outcome ${k}</b> — a Z-basis measurement at the end of the track.`, `<b>Детектор результату ${k}</b> — вимірювання в базисі Z наприкінці доріжки.`), 30);
      const n = this.hist[0] + this.hist[1], h = n ? this.hist[k] / n * 2.5 : 0;
      r.draw('cylinder', M4.trs([this.X.det + 1.3, 0, k ? 0.6 : -0.6], 0, [0.22, Math.max(h, 0.01), 0.22]), k ? [1, 0.45, 0.45] : [0.45, 0.65, 1]);
      UI.label('d' + k, [this.X.det + 1.3, h + 0.4, k ? 0.6 : -0.6], `${k}: ${this.hist[k]}`, 'axis');
    }
    // putujúci qubit s malou Blochovou sférou
    const qx = this.shot ? this.shot.x : this.X.det - 0.6;
    r.sphere([qx, 0.45, 0], 0.22, [0.3, 0.95, 1], { emissive: 0.8 });
    Bloch.draw(r, [qx, 2.0, 0.0], 0.7, this.shownR, {});
    UI.hot([qx, 0.45, 0], tr('<b>Qubit</b> putujúci koľajou. Nad ním je jeho Blochova sféra.', '<b>Qubit</b> travelling along the track. Above it is its Bloch sphere.', '<b>Кубіт</b>, що рухається доріжкою. Над ним — його сфера Блоха.'), 25);
    UI.label('qb', [qx, 3.0, 0], this.shot ? 'ψ' : tr('stav na konci', 'final state', 'кінцевий стан'), 'player');
    // matica hustoty ako stĺpce
    const R = this.shownR, rho = [[(1 + R[2]) / 2, Math.hypot(R[0], R[1]) / 2], [Math.hypot(R[0], R[1]) / 2, (1 - R[2]) / 2]];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const p = [-1 + j * 2, 0, -3.6 + i * 1.6], h = rho[i][j] * 3, diag = i === j;
      r.draw('box', M4.trs(V3.add(p, [0, 0.02, 0]), 0, [1.4, 0.04, 1.2]), [0.3, 0.3, 0.4]);
      r.draw('box', M4.trs(V3.add(p, [0, h / 2, 0]), 0, [0.6, Math.max(h, 0.01), 0.6]), diag ? [0.45, 0.65, 1] : [0.9, 0.5, 1], { emissive: diag ? 0.1 : 0.4 });
      UI.hot(V3.add(p, [0, h / 2 + 0.1, 0]), diag ? tr(`<b>ρ<sub>${i}${i}</sub></b> — populácia: pravdepodobnosť výsledku ${i}.`, `<b>ρ<sub>${i}${i}</sub></b> — population: probability of outcome ${i}.`, `<b>ρ<sub>${i}${i}</sub></b> — заселеність: імовірність результату ${i}.`) : tr('<b>|ρ₀₁|</b> — koherencia: „pamäť“ relatívnej fázy. Bez nej niet interferencie.', '<b>|ρ₀₁|</b> — coherence: the “memory” of the relative phase. Without it there is no interference.', '<b>|ρ₀₁|</b> — когерентність: «пам’ять» відносної фази. Без неї немає інтерференції.'), 34);
      UI.label(`rho${i}${j}`, V3.add(p, [0, h + 0.35, 0]), `${diag ? 'ρ' : '|ρ'}<sub>${i}${j}</sub>${diag ? '' : '|'} = ${Fmt.num(rho[i][j], 2)}`, 'axis');
    }
    UI.label('rhoT', [3, 0.8, -3], tr('matica hustoty ρ', 'density matrix ρ', 'матриця густини ρ'), 'axis');
  }
}
