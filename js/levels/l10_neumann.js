'use strict';
// LEVEL 10 — Von Neumannova čistiareň (mentor: John von Neumann) — prednáška 5: Od zmiešaného stavu k meraniu.
// ρ′ = UρU† nemení |r| (Tr ρ²), purifikácia meraním alebo chladením, pseudo-čistý stav v NMR (r = εn),
// observábly ⟨A⟩ = Tr(ρA) a r = (⟨σx⟩, ⟨σy⟩, ⟨σz⟩), časová evolúcia e^{−iEt/ħ} a relatívna fáza.

class L10Neumann extends Level {
  get steps() { return [this.intro, this.unitaryWall, this.purify, this.pseudoPure, this.observables, this.evolution]; }

  setup() {
    this.cam = new OrbitCam([0, 1.6, 0], 8, 0.55, 0.3, 3.5, 16);
    this.r = [0, 0, 0.4]; this.anim = null; this.trail = []; this.stage = null; this.f = {};
    this.eps = 0.1; this.n = [0, 0, 1]; this.cool = false; this.guessR = [0, 0, 0]; this.hidden = false;
    this.dE = 1.5; this.time = 0; this.playing = false;
  }

  disp() {
    const a = this.anim;
    if (!a) return this.r;
    const e = a.t * a.t * (3 - 2 * a.t);
    return V3.rotate(a.v0, a.axis, a.ang * e);
  }
  // hradlo ako rotácia Blochovho vektora (aj zmiešaného — dĺžka sa nemení)
  gate(k, done) {
    if (this.anim) return;
    const [ax, an] = GateAxis[k], axis = V3.norm(ax);
    this.anim = { v0: this.r, axis, ang: an, t: 0, done };
    this.r = V3.rotate(this.r, axis, an);
    if (this.stage === 'pps') this.n = V3.rotate(this.n, axis, an);
  }

  intro() {
    this.quest(tr('Vypočuj si Johna von Neumanna', 'Listen to John von Neumann', 'Послухай Джона фон Неймана'), { easy: tr('💬 von Neumann', '💬 von Neumann', '💬 фон Нейман'), hard: tr('ρ = ½(I + r·σ) · |r| < 1 → |r| = 1 ?', 'ρ = ½(I + r·σ) · |r| < 1 → |r| = 1 ?', 'ρ = ½(I + r·σ) · |r| < 1 → |r| = 1 ?') });
    this.say([DL('l10.intro.1.0'), DL('l10.intro.1.1'), DL('l10.intro.1.2')], () => { this.grant(['neumann']); this.next(); });
  }

  // ---------- 1 · unitárna stena ----------
  unitaryWall() {
    this.stage = 'wall';
    const a = rand() * Math.PI * 2, b = 0.4 + rand() * 1.6;
    this.r = V3.scale([Math.sin(b) * Math.cos(a), Math.sin(b) * Math.sin(a), Math.cos(b)], 0.4);
    this.moves = 0;
    this.quest(tr('Hradlami dostaň šípku na povrch gule (|r| = 1).', 'Use gates to bring the arrow to the surface of the ball (|r| = 1).', 'Гейтами доведи стрілку до поверхні кулі (|r| = 1).'),
      { easy: tr('🧱 hradlami na povrch?', '🧱 to the surface with gates?', '🧱 гейтами на поверхню?'), hard: '|r| = 0,4 → 1 · ρ′ = UρU† · Tr ρ² = ?' });
    const g = (k) => UI.button(k, () => this.gate(k, () => {
      this.moves++; this.updRead();
      if (this.moves === byDiff(4, 5, 5)) this.wallDone();
    }), 'gate');
    this.read = UI.info('');
    UI.panelSet(tr('Unitárna stena', 'The unitary wall', 'Унітарна стіна'), [
      UI.row(g('X'), g('Y'), g('Z'), g('H'), g('S'), g('T')),
      UI.row(UI.button(tr('🏳 Nedá sa to?', '🏳 Is it impossible?', '🏳 Це неможливо?'), () => { if (this.moves >= 2) this.wallDone(); else UI.toast(tr('Skús ešte aspoň dve hradlá.', 'Try at least two more gates.', 'Спробуй ще принаймні два гейти.')); })),
      this.read,
    ]);
    this.updRead();
  }
  wallDone() {
    if (this.f.wall) return;
    this.f.wall = true;
    this.grant(['purity']);
    this.say([DL('l10.unitaryWall.1.0'), DL('l10.unitaryWall.1.1')], () => {
      this.ask({ q: DL('l10.unitaryWall.q.q'), options: [DL('l10.unitaryWall.q.options.0'), DL('l10.unitaryWall.q.options.1'), DL('l10.unitaryWall.q.options.2')], correct: 0, why: DL('l10.unitaryWall.q.why') }, () => this.next());
    });
  }

  // ---------- 2 · purifikácia ----------
  purify() {
    this.stage = 'purify'; this.r = [0, 0, 0]; this.cool = false; this.solvedP = false;
    this.quest(tr('Z maximálne zmiešaného stavu ρ = I/2 urob čistý stav (|r| ≥ 0,97).', 'Turn the maximally mixed state ρ = I/2 into a pure state (|r| ≥ 0.97).', 'Перетвори максимально змішаний стан ρ = I/2 на чистий (|r| ≥ 0,97).'),
      { easy: tr('✨ I/2 → čistý stav', '✨ I/2 → a pure state', '✨ I/2 → чистий стан'), hard: '|r|: 0 → ≥ 0,97 · ρ₀ = |0⟩⟨0|' });
    this.read = UI.info('');
    UI.panelSet(tr('Čistiareň', 'The refinery', 'Очисна станція'), [
      UI.row(UI.button(tr('🔄 Hradlo H', '🔄 Gate H', '🔄 Гейт H'), () => this.gate('H', () => { this.updRead(); UI.toast(tr('Stred gule sa rotáciou nepohne: U(I/2)U† = I/2.', 'Rotation cannot move the centre of the ball: U(I/2)U† = I/2.', 'Обертання не зрушить центр кулі: U(I/2)U† = I/2.'), 3200); }), 'gate')),
      UI.row(UI.button(tr('📏 Zmeraj Z a výsledok ZABUDNI', '📏 Measure Z and FORGET the result', '📏 Виміряй Z і ЗАБУДЬ результат'), () => this.measZ(false))),
      UI.row(UI.button(tr('📏 Zmeraj Z a výsledok ZAPÍŠ', '📏 Measure Z and RECORD the result', '📏 Виміряй Z і ЗАПИШИ результат'), () => this.measZ(true), 'big')),
      UI.row(UI.button(tr('❄ Chladiť (kontakt so studeným rezervoárom)', '❄ Cool down (contact with a cold reservoir)', '❄ Охолодити (контакт із холодним резервуаром)'), () => { if (!this.solvedP) this.cool = true; })),
      UI.row(UI.button('↺ I/2', () => { this.r = [0, 0, 0]; this.cool = false; this.solvedP = false; this.updRead(); })),
      this.read,
    ]);
    this.updRead();
  }
  measZ(keep) {
    if (this.solvedP || this.anim) return;
    const p0 = (1 + this.r[2]) / 2, k = rand() < p0 ? 0 : 1;
    Sound.sfx('glance');
    if (!keep) {
      // neselektívne meranie: ρ → Σ P_k ρ P_k — diagonála ostane, koherencie zmiznú
      this.r = [0, 0, this.r[2]]; this.updRead();
      if (!this.f.forgot) { this.f.forgot = true; this.say([DL('l10.purify.forget')]); }
      return;
    }
    this.r = [0, 0, k ? -1 : 1]; this.updRead();
    this.purified(DL('l10.purify.keep', k));
  }
  purified(msg) {
    if (this.solvedP) return;
    this.solvedP = true; this.cool = false;
    this.grant(['purify']);
    this.say([msg, DL('l10.purify.both')], () => {
      this.ask({ q: DL('l10.purify.q.q'), options: [DL('l10.purify.q.options.0'), DL('l10.purify.q.options.1'), DL('l10.purify.q.options.2')], correct: 0, why: DL('l10.purify.q.why') }, () => this.next());
    });
  }

  // ---------- 3 · pseudo-čistý stav (NMR) ----------
  ppsTarget() { return Settings.hard ? { n: [-1, 0, 0], name: '|−⟩' } : { n: [0, 1, 0], name: '|+i⟩' }; }
  pseudoPure() {
    this.stage = 'pps'; this.n = [0, 0, 1]; this.eps = 0.1; this.r = V3.scale(this.n, this.eps); this.solvedS = false;
    const T = this.ppsTarget();
    this.quest(tr(`Pseudo-čistý stav: hradlami nastav „čistú“ odchýlku na ${T.name}. Celý ansámbel pritom ostane takmer v strede gule.`, `Pseudo-pure state: use gates to set the “pure” deviation to ${T.name}. The whole ensemble stays almost at the centre of the ball.`, `Псевдочистий стан: гейтами налаштуй «чисте» відхилення на ${T.name}. Увесь ансамбль при цьому лишається майже в центрі кулі.`),
      { easy: tr(`🧪 odchýlka → ${T.name}`, `🧪 deviation → ${T.name}`, `🧪 відхилення → ${T.name}`), hard: `ρ = (1 − ε) I/2 + ε|ψ⟩⟨ψ| · r = εn · n → ${T.name}` });
    const g = (k) => UI.button(k, () => this.gate(k, () => { this.updRead(); this.checkPps(); }), 'gate');
    this.read = UI.info('');
    UI.panelSet(tr('NMR: pseudo-čistý stav', 'NMR: the pseudo-pure state', 'ЯМР: псевдочистий стан'), [
      UI.slider(tr('polarizácia ε', 'polarisation ε', 'поляризація ε'), 0.02, 0.3, 0.02, this.eps, (v) => { this.eps = v; this.r = V3.scale(this.n, v); this.updRead(); return Fmt.num(v, 2); }),
      UI.row(g('X'), g('Y'), g('Z'), g('H'), g('S')),
      UI.row(UI.button(tr('↺ |0⟩', '↺ |0⟩', '↺ |0⟩'), () => { if (this.anim) return; this.n = [0, 0, 1]; this.r = V3.scale(this.n, this.eps); this.updRead(); })),
      this.read,
    ]);
    this.updRead();
  }
  checkPps() {
    const T = this.ppsTarget();
    if (this.solvedS || V3.dot(this.n, T.n) < 0.999) return;
    this.solvedS = true; this.n = T.n.slice(); this.r = V3.scale(this.n, this.eps);
    this.grant(['pps']);
    this.say([DL('l10.pseudoPure.ok', Fmt.num(this.eps, 2)), DL('l10.pseudoPure.signal')], () => {
      this.ask({ q: DL('l10.pseudoPure.q.q'), options: [DL('l10.pseudoPure.q.options.0'), DL('l10.pseudoPure.q.options.1'), DL('l10.pseudoPure.q.options.2')], correct: 0, why: DL('l10.pseudoPure.q.why') }, () => this.next());
    });
  }

  // ---------- 4 · observábly a Blochov vektor ----------
  observables() {
    this.stage = 'obs';
    if (!this.sub.r) {
      const a = rand() * Math.PI * 2, b = 0.5 + rand() * 2.1, L = 0.45 + rand() * 0.4;
      this.sub.r = [L * Math.sin(b) * Math.cos(a), L * Math.sin(b) * Math.sin(a), L * Math.cos(b)].map((x) => Math.round(x * 20) / 20);
    }
    this.r = this.sub.r.slice(); this.hidden = true; this.guessR = [0, 0, 0]; this.meas = {}; this.solvedO = false;
    const tol = this.tolO = byDiff(0.15, 0.1, 0.06);
    this.quest(tr(`Neznámy (možno zmiešaný) stav. Zmeraj ⟨σx⟩, ⟨σy⟩, ⟨σz⟩ a zostav Blochov vektor (každá zložka ±${Fmt.num(tol, 2)}).`, `An unknown (possibly mixed) state. Measure ⟨σx⟩, ⟨σy⟩, ⟨σz⟩ and build the Bloch vector (each component ±${Fmt.num(tol, 2)}).`, `Невідомий (можливо, змішаний) стан. Виміряй ⟨σx⟩, ⟨σy⟩, ⟨σz⟩ і склади вектор Блоха (кожна складова ±${Fmt.num(tol, 2)}).`),
      { easy: tr('🔍 tomografia: r = (⟨σx⟩, ⟨σy⟩, ⟨σz⟩)', '🔍 tomography: r = (⟨σx⟩, ⟨σy⟩, ⟨σz⟩)', '🔍 томографія: r = (⟨σx⟩, ⟨σy⟩, ⟨σz⟩)'), hard: `⟨A⟩ = Tr(ρA) · ⟨n·σ⟩ = r·n · ±${Fmt.num(tol, 2)}` });
    const noise = byDiff(0, 0.02, 0.03);
    const mb = (k, i) => UI.button(`📡 ⟨σ<sub>${k}</sub>⟩`, () => {
      this.meas[k] = clamp(this.r[i] + (rand() * 2 - 1) * noise, -1, 1);
      Sound.sfx('glance'); this.updRead();
    });
    const sl = (k, i) => UI.slider(`r<sub>${k}</sub>`, -1, 1, 0.05, this.guessR[i], (v) => { this.guessR[i] = v; return Fmt.num(v, 2); });
    this.read = UI.info('');
    this.slR = [sl('x', 0), sl('y', 1), sl('z', 2)];
    UI.panelSet(tr('Observábly → Blochov vektor', 'Observables → Bloch vector', 'Спостережувані → вектор Блоха'), [
      UI.info(tr('NMR meria ansámbel naraz: jedno „meranie“ dá rovno strednú hodnotu ⟨A⟩ = Tr(ρA).', 'NMR measures the whole ensemble at once: one “measurement” directly gives the expectation value ⟨A⟩ = Tr(ρA).', 'ЯМР вимірює весь ансамбль одразу: одне «вимірювання» відразу дає середнє значення ⟨A⟩ = Tr(ρA).'), 'tip'),
      UI.row(mb('x', 0), mb('y', 1), mb('z', 2)),
      ...this.slR, this.read,
      UI.row(UI.button(tr('✓ Porovnaj s pravým stavom', '✓ Compare with the true state', '✓ Порівняй зі справжнім станом'), () => this.checkObs(), 'big')),
    ]);
    this.updRead();
  }
  checkObs() {
    if (this.solvedO) return;
    if (this.guessR.every((g, i) => Math.abs(g - this.r[i]) <= this.tolO + 1e-9)) {
      this.solvedO = true; this.hidden = false;
      this.slR.forEach((s, i) => UI.snapSlider(s, this.r[i]));
      this.grant(['observable']);
      this.say([DL('l10.observables.ok', Fmt.num(V3.len(this.r), 2))], () => {
        this.ask({ q: DL('l10.observables.q.q'), options: [DL('l10.observables.q.options.0'), DL('l10.observables.q.options.1'), DL('l10.observables.q.options.2')], correct: 0, why: DL('l10.observables.q.why') }, () => this.next());
      });
    } else { this.mistakes++; Sound.sfx('bad'); UI.toast(tr('Niektorá zložka nesedí. Každá zložka r je stredná hodnota jednej Pauliho matice.', 'A component is off. Each component of r is the expectation value of one Pauli matrix.', 'Якась складова не збігається. Кожна складова r — середнє значення однієї матриці Паулі.'), 3200); }
  }

  // ---------- 5 · časová evolúcia ----------
  evolution() {
    this.stage = 'evo'; this.time = 0; this.playing = false; this.solvedE = false; this.dE = 1.5;
    const tol = this.tolE = byDiff(0.35, 0.2, 0.1);
    this.quest(tr('Pusti čas a zastav ho, keď relatívna fáza Δφ = −(E₂ − E₁)t/ħ dosiahne π (stav |+⟩ sa zmení na |−⟩).', 'Let time run and stop it when the relative phase Δφ = −(E₂ − E₁)t/ħ reaches π (the state |+⟩ turns into |−⟩).', 'Запусти час і зупини його, коли відносна фаза Δφ = −(E₂ − E₁)t/ħ досягне π (стан |+⟩ стане |−⟩).'),
      { easy: tr('⏱ zastav pri Δφ = π', '⏱ stop at Δφ = π', '⏱ зупини при Δφ = π'), hard: `|ψ(t)⟩ = Σ a<sub>n</sub> e<sup>−iE<sub>n</sub>t/ħ</sup>|E<sub>n</sub>⟩ · |Δφ| = π ± ${Fmt.num(tol, 2)}` });
    this.read = UI.info('');
    this.playBtn = UI.button(tr('▶ Pustiť čas', '▶ Start time', '▶ Запустити час'), () => this.togglePlay(), 'big');
    UI.panelSet(tr('Časová evolúcia', 'Time evolution', 'Часова еволюція'), [
      UI.slider(tr('rozdiel energií E₂ − E₁ (ħ = 1)', 'energy difference E₂ − E₁ (ħ = 1)', 'різниця енергій E₂ − E₁ (ħ = 1)'), 0.5, 3, 0.25, this.dE, (v) => { this.dE = v; return Fmt.num(v, 2); }),
      UI.row(this.playBtn, UI.button('↺ t = 0', () => { this.time = 0; this.playing = false; this.solvedE = false; this.playBtn.innerHTML = tr('▶ Pustiť čas', '▶ Start time', '▶ Запустити час'); })),
      this.read,
    ]);
  }
  togglePlay() {
    if (this.solvedE) return;
    this.playing = !this.playing;
    this.playBtn.innerHTML = this.playing ? tr('⏸ Zastaviť', '⏸ Stop', '⏸ Зупинити') : tr('▶ Pustiť čas', '▶ Start time', '▶ Запустити час');
    if (this.playing || this.time < 0.05) return;
    const dphi = this.dE * this.time, off = Math.abs(((dphi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - Math.PI);
    if (off <= this.tolE) {
      this.solvedE = true;
      const k = Math.round((dphi - Math.PI) / (2 * Math.PI));
      this.time = (Math.PI + 2 * Math.PI * k) / this.dE; // presne na Δφ = π (+ celé otáčky)
      this.grant(['timeevo']);
      this.say([DL('l10.evolution.ok'), DL('l10.evolution.circuit')], () => {
        this.ask({ q: DL('l10.evolution.q.q'), options: [DL('l10.evolution.q.options.0'), DL('l10.evolution.q.options.1'), DL('l10.evolution.q.options.2')], correct: 0, why: DL('l10.evolution.q.why') }, () => this.next());
      });
    } else { this.mistakes++; Sound.sfx('bad'); UI.toast(tr(`Δφ je teraz ${Fmt.angle(((dphi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI))} — skús to znova (↺ alebo pusti čas ďalej).`, `Δφ is now ${Fmt.angle(((dphi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI))} — try again (↺ or let time run on).`, `Δφ зараз ${Fmt.angle(((dphi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI))} — спробуй ще (↺ або запусти час далі).`), 3200); }
  }
  // stav v energetickej báze: (|E₁⟩ e^{−iE₁t} + |E₂⟩ e^{−iE₂t})/√2, E₁ = 1 (ħ = 1)
  evoAmps() { const E1 = 1, E2 = 1 + this.dE; return [C.scale(C.exp(-E1 * this.time), Math.SQRT1_2), C.scale(C.exp(-E2 * this.time), Math.SQRT1_2)]; }

  updRead() {
    if (!this.read) return;
    const v = this.disp(), L = V3.len(v);
    if (this.stage === 'wall' || this.stage === 'purify') {
      this.read.innerHTML = `|r| = <b>${Fmt.num(L, 3)}</b> · Tr ρ² = (1 + |r|²)/2 = <b>${Fmt.num((1 + L * L) / 2, 3)}</b>`
        + `<br>ρ = ½[${Fmt.num(1 + v[2], 2)}, ${Fmt.complex([v[0], -v[1]], 2)}; ${Fmt.complex([v[0], v[1]], 2)}, ${Fmt.num(1 - v[2], 2)}]`
        + (this.stage === 'wall' ? `<br>${tr('Použité hradlá', 'Gates used', 'Використані гейти')}: ${this.moves}` : '');
    } else if (this.stage === 'pps') {
      const e = this.eps, n = this.n;
      this.read.innerHTML = `ρ = (1 − ε) I/2 + ε|ψ⟩⟨ψ|, ε = ${Fmt.num(e, 2)}<br>r = εn = (${Fmt.num(v[0], 3)}, ${Fmt.num(v[1], 3)}, ${Fmt.num(v[2], 3)}) · |r| = ${Fmt.num(L, 2)}`
        + `<br>${tr('NMR signál', 'NMR signal', 'ЯМР-сигнал')}: ⟨σ<sub>x</sub>⟩ = ε⟨ψ|σ<sub>x</sub>|ψ⟩ = ${Fmt.num(e * n[0], 3)}, ⟨σ<sub>y</sub>⟩ = ${Fmt.num(e * n[1], 3)}, ⟨σ<sub>z</sub>⟩ = ${Fmt.num(e * n[2], 3)}`
        + `<br>${tr('2 qubity', '2 qubits', '2 кубіти')}: ρ<sub>pps</sub> = diag(${Fmt.num((1 + 3 * e) / 4, 3)}, ${Fmt.num((1 - e) / 4, 3)}, ${Fmt.num((1 - e) / 4, 3)}, ${Fmt.num((1 - e) / 4, 3)})`;
    } else if (this.stage === 'obs') {
      const m = ['x', 'y', 'z'].map((k) => (this.meas[k] == null ? '?' : Fmt.num(this.meas[k], 2)));
      this.read.innerHTML = `${tr('Namerané', 'Measured', 'Виміряно')}: ⟨σ<sub>x</sub>⟩ = ${m[0]}, ⟨σ<sub>y</sub>⟩ = ${m[1]}, ⟨σ<sub>z</sub>⟩ = ${m[2]}`
        + `<br>${tr('Tvoj vektor', 'Your vector', 'Твій вектор')}: |r| = ${Fmt.num(V3.len(this.guessR), 2)}${this.hidden ? '' : ` · ${tr('pravý', 'true', 'справжній')}: (${this.r.map((x) => Fmt.num(x, 2)).join(', ')})`}`;
    } else if (this.stage === 'evo') {
      const [a1, a2] = this.evoAmps(), d = ((this.dE * this.time) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      this.read.innerHTML = `t = ${Fmt.num(this.time, 2)} · a₁(t) = ${Fmt.complex(a1, 2)}, a₂(t) = ${Fmt.complex(a2, 2)}`
        + `<br>|a₁|² = ${Fmt.num(C.abs2(a1), 2)}, |a₂|² = ${Fmt.num(C.abs2(a2), 2)} <small>(${tr('nemenia sa', 'they do not change', 'не змінюються')})</small>`
        + `<br>${tr('relatívna fáza', 'relative phase', 'відносна фаза')} |Δφ| = (E₂ − E₁)t/ħ ${tr('mod', 'mod', 'mod')} 2π = <b>${Fmt.angle(d)}</b>`;
    }
  }

  viewState() {
    if (this.hidden) return null;
    if (this.stage === 'evo') return { psi: this.evoAmps(), note: tr('Ručičky sa točia rôzne rýchlo (E₁, E₂); ich dĺžky stoja — mení sa len relatívna fáza.', 'The hands turn at different speeds (E₁, E₂); their lengths stay — only the relative phase changes.', 'Стрілки обертаються з різною швидкістю (E₁, E₂); їхні довжини сталі — змінюється лише відносна фаза.') };
    return { r: this.disp() };
  }

  update(dt) {
    this.t += dt;
    if (this.anim) {
      this.anim.t = Math.min(1, this.anim.t + dt / 0.8);
      if (this.anim.t >= 1) { const d = this.anim.done; this.anim = null; d && d(); }
      this.updRead();
    }
    if (this.stage === 'purify' && this.cool && !this.solvedP) {
      this.r = [this.r[0] * Math.exp(-dt), this.r[1] * Math.exp(-dt), 1 - (1 - this.r[2]) * Math.exp(-dt / 1.3)];
      this.updRead();
      if (V3.len(this.r) >= 0.97) { this.r = [0, 0, 1]; this.purified(DL('l10.purify.cooled')); }
    }
    if (this.stage === 'evo' && this.playing) { this.time += dt * 0.8; this.updRead(); }
  }

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('box', M4.trs([0, -0.06, 0], 0, [13, 0.1, 9]), [0.16, 0.17, 0.22], { pattern: 1 });
    // čistiareň: potrubie a destilačné banky
    for (const s of [-1, 1]) {
      const p = [s * 4.2, 0, -1.6];
      r.draw('cylinder', M4.trs(p, 0, [0.5, 1.8, 0.5]), [0.7, 0.75, 0.85], { alpha: 0.35 });
      r.draw('cylinder', M4.trs(p, 0, [0.48, 0.6 + 0.4 * Math.sin(this.t + s), 0.48]), s > 0 ? [0.5, 0.85, 1] : [0.85, 0.85, 0.95], { emissive: 0.3 });
      r.rod(V3.add(p, [0, 1.8, 0]), [s * 1.9, 2.6, -0.6], [0.55, 0.55, 0.6], 0.05);
    }
    UI.hot([-4.2, 1, -1.6], tr('<b>Zmes</b> — ansámbel s náhodnými stavmi: Blochov vektor vnútri gule.', '<b>A mixture</b> — an ensemble of random states: a Bloch vector inside the ball.', '<b>Суміш</b> — ансамбль випадкових станів: вектор Блоха всередині кулі.'), 40);
    UI.hot([4.2, 1, -1.6], tr('<b>Čistý stav</b> — vektor na povrchu. Odtiaľto sem vedie len neunitárna cesta (meranie, chladenie).', '<b>A pure state</b> — a vector on the surface. Only a non-unitary path leads here (measurement, cooling).', '<b>Чистий стан</b> — вектор на поверхні. Сюди веде лише неунітарний шлях (вимірювання, охолодження).'), 40);
    const c = [0, 1.7, 0], R = 1.45, v = this.disp();
    if (this.stage === 'pps') {
      Bloch.draw(r, [-1.7, 1.7, 0], 1.25, v, { labelFn: UI.label.bind(UI), key: 'nA', axisNames: false });
      UI.label('nAl', [-1.7, 3.35, 0], tr('celý ansámbel: r = εn', 'whole ensemble: r = εn', 'весь ансамбль: r = εn'), 'axis');
      Bloch.draw(r, [1.9, 1.7, 0], 1.25, this.anim ? V3.norm(v) : this.n, { labelFn: UI.label.bind(UI), key: 'nB', axisNames: true, target: this.ppsTarget().n, color: [0.4, 1, 0.6] });
      UI.label('nBl', [1.9, 3.35, 0], tr('odchýlka (× 1/ε): n', 'deviation (× 1/ε): n', 'відхилення (× 1/ε): n'), 'axis');
    } else if (this.stage === 'evo') {
      const [a1, a2] = this.evoAmps();
      [[a1, [-1.9, 1.7, 0], [0.31, 0.55, 1], 'E₁'], [a2, [1.9, 1.7, 0], [1, 0.42, 0.49], 'E₂']].forEach(([a, p, col, nm], k) => {
        r.draw('torus', M4.orient(p, [0, 0, 1], 1.0), [0.5, 0.55, 0.7]);
        r.draw('disk', M4.orient(p, [0, 0, 1], 0.98), [0.12, 0.14, 0.25], { alpha: 0.8 });
        const L = C.abs(a) / Math.SQRT1_2, ang = C.arg(a);
        r.arrow(p, V3.add(p, [Math.cos(ang) * L * 0.9, Math.sin(ang) * L * 0.9, 0.02]), col, 0.04, { emissive: 0.5 });
        UI.label('ev' + k, V3.add(p, [0, 1.3, 0]), `a<sub>${k + 1}</sub> e<sup>−i${nm}t/ħ</sup>`, 'ket');
      });
      UI.hot([-1.9, 1.7, 0], tr('Hodiny vlastného stavu |E₁⟩: ručička sa točí rýchlosťou E₁/ħ, jej dĺžka (a teda |a₁|²) sa nemení.', 'The clock of the eigenstate |E₁⟩: the hand turns at the rate E₁/ħ, its length (and so |a₁|²) does not change.', 'Годинник власного стану |E₁⟩: стрілка обертається зі швидкістю E₁/ħ, її довжина (а отже |a₁|²) не змінюється.'), 50);
      UI.hot([1.9, 1.7, 0], tr('Hodiny |E₂⟩ idú rýchlejšie (E₂ > E₁). Rozdiel uhlov = relatívna fáza Δφ.', 'The clock of |E₂⟩ runs faster (E₂ > E₁). The difference of the angles = the relative phase Δφ.', 'Годинник |E₂⟩ іде швидше (E₂ > E₁). Різниця кутів = відносна фаза Δφ.'), 50);
      const rr = Q.bloch(this.evoAmps());
      Bloch.draw(r, [0, 1.2, 2.2], 0.75, rr, { labelFn: UI.label.bind(UI), key: 'nE', labels: false, detail: false });
    } else if (this.hidden) {
      Bloch.draw(r, c, R, null, { labelFn: UI.label.bind(UI), key: 'n', axisNames: true });
      UI.label('nq', c, '?', 'prompt');
      if (V3.len(this.guessR) > 0.02) r.arrow(c, V3.add(c, V3.scale(qToWorld(this.guessR), R)), [0.4, 1, 0.6], 0.04, { emissive: 0.4 });
    } else {
      Bloch.draw(r, c, R, v, { labelFn: UI.label.bind(UI), key: 'n', axisNames: true, bars: true });
      if (this.stage === 'obs' && V3.len(this.guessR) > 0.02) r.arrow(c, V3.add(c, V3.scale(qToWorld(this.guessR), R)), [0.4, 1, 0.6], 0.03, { alpha: 0.6 });
    }
    const mv = this.stage === 'evo' ? Q.bloch(this.evoAmps()) : this.hidden ? null : v;
    Machine.nmr(r, [-4.7, 0, 1.0], 1.0, mv, { labelFn: UI.label.bind(UI), key: 'n10', precess: !this.anim, note: this.stage === 'pps' ? tr('celá vzorka: M ∝ r = εn (ε ≪ 1)', 'whole sample: M ∝ r = εn (ε ≪ 1)', 'весь зразок: M ∝ r = εn (ε ≪ 1)') : null });
    if (this.stage === 'purify' && this.cool) {
      for (let k = 0; k < 16; k++) { const a = k * 0.39 + this.t * 0.5; r.sphere(V3.add(c, [Math.cos(a) * 2.1, -1.1 + ((this.t * 0.6 + k * 0.13) % 1) * 2.6, Math.sin(a) * 2.1]), 0.06, [0.6, 0.85, 1], { alpha: 0.5, emissive: 0.5 }); }
      UI.label('ncold', V3.add(c, [0, -1.9, 0]), tr('❄ studený rezervoár odnáša entropiu', '❄ the cold reservoir carries the entropy away', '❄ холодний резервуар забирає ентропію'), 'axis');
    }
  }
}
