'use strict';
// LEVEL 9 — Pauliho rotačná dielňa (mentor: Wolfgang Pauli) — prednáška 4: Qubit a geometria Blochovej sféry.
// θ, φ ako súradnice stavu, rotácie R_n(ϑ) = exp(−iϑ n·σ/2), meranie ako smer otázky (⟨S_χ⟩, φ = atan2), unitárne vs. dekoherencia.

const D2R = Math.PI / 180;
// ciele súradníc: ket, θ, φ (v stupňoch)
const PAULI_COORDS = [
  { ket: '|1⟩', th: 180, ph: 0 },
  { ket: '(|0⟩ + |1⟩)/√2 = |+⟩', th: 90, ph: 0 },
  { ket: '(|0⟩ − i|1⟩)/√2 = |−i⟩', th: 90, ph: 270 },
  { ket: '(|0⟩ − |1⟩)/√2 = |−⟩', th: 90, ph: 180, normal: true },
  { ket: 'cos(π/8)|0⟩ + e<sup>iπ/2</sup> sin(π/8)|1⟩', th: 45, ph: 90, hard: true },
];
// rotačné úlohy: začiatok, cieľ, povolené osi, pevný uhol (voliteľne), max. počet rotácií
const PAULI_ROT = [
  { from: [0, 0, 1], to: [1, 0, 0], axes: ['x', 'y', 'z'], max: 1, key: 'r1', title: tr('|0⟩ → |+⟩ jednou rotáciou', '|0⟩ → |+⟩ with one rotation', '|0⟩ → |+⟩ одним поворотом') },
  { from: [1, 0, 0], to: [-1, 0, 0], axes: ['x', 'z'], max: 1, key: 'r2', title: tr('|+⟩ → |−⟩ bez zmeny P(0), P(1)', '|+⟩ → |−⟩ without changing P(0), P(1)', '|+⟩ → |−⟩ без зміни P(0), P(1)') },
  { from: [0, 0, 1], to: [0, 0, -1], axes: ['x'], fixed: Math.PI / 2, max: 2, key: 'r3', title: tr('|0⟩ → |1⟩ len rotáciami R<sub>x</sub>(π/2)', '|0⟩ → |1⟩ with R<sub>x</sub>(π/2) only', '|0⟩ → |1⟩ лише поворотами R<sub>x</sub>(π/2)') },
  { from: [0, 1, 0], to: [0, -1, 0], axes: ['h'], max: 1, key: 'r4', title: tr('|+i⟩ → |−i⟩ okolo osi Hadamarda', '|+i⟩ → |−i⟩ about the Hadamard axis', '|+i⟩ → |−i⟩ навколо осі Адамара') },
  { from: [0, 0, 1], to: [0, -1, 0], axes: ['x', 'y'], max: 1, key: 'r5', hard: true, title: tr('|0⟩ → |−i⟩ jednou rotáciou', '|0⟩ → |−i⟩ with one rotation', '|0⟩ → |−i⟩ одним поворотом') },
];
const PAULI_AXES = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1], h: [Math.SQRT1_2, 0, Math.SQRT1_2] };
const PAULI_AXIS_NAME = { x: 'x', y: 'y', z: 'z', h: 'n<sub>H</sub> = (x̂ + ẑ)/√2' };

class L9Pauli extends Level {
  get steps() { return [this.intro, this.coords, this.rotations, this.measureAxis, this.unitaryVsDeco]; }

  setup() {
    this.cam = new OrbitCam([0, 1.6, 0], 7.2, 0.65, 0.3, 3.5, 16);
    this.r = [0, 0, 1]; this.anim = null; this.trail = []; this.target = null; this.axisK = null; this.f = {}; this.stage = null;
    this.thD = 0; this.phD = 0; this.ang = Math.PI / 2; this.chi = 0; this.counts = null; this.hidden = false; this.env = false; this.gates = 0; this.bell = false;
  }

  disp() {
    const a = this.anim;
    if (!a) return this.r;
    const e = a.t * a.t * (3 - 2 * a.t);
    return V3.rotate(a.v0, a.axis, a.ang * e);
  }
  rotate(axis, ang, done) {
    if (this.anim) return;
    this.anim = { v0: this.r, axis: V3.norm(axis), ang, t: 0, done };
    this.r = V3.rotate(this.r, V3.norm(axis), ang);
  }

  intro() {
    this.quest(tr('Vypočuj si Wolfganga Pauliho', 'Listen to Wolfgang Pauli', 'Послухай Вольфганга Паулі'), { easy: tr('💬 Pauli', '💬 Pauli', '💬 Паулі'), hard: tr('|ψ⟩ ↔ (θ, φ) ↔ r · U ↔ R', '|ψ⟩ ↔ (θ, φ) ↔ r · U ↔ R', '|ψ⟩ ↔ (θ, φ) ↔ r · U ↔ R') });
    this.say([DL('l9.intro.1.0'), DL('l9.intro.1.1'), DL('l9.intro.1.2'), DL('l9.intro.1.3')], () => {
      this.ask(QZ('l9.intro.2'), () => {
        this.grant(['pauli', 'notphysball']);
        this.next();
      });
    });
  }

  // ---------- 1 · súradnice θ, φ ----------
  // pevné ciele + 🎲 jeden náhodný na konci (prenos: stav zapísaný vzorcom, uhly treba vyčítať samostatne)
  coordList() { return [...PAULI_COORDS.filter((c) => (!c.hard || Settings.hard) && (!c.normal || !Settings.easy)), this.randomCoord()]; }
  randomCoord() {
    if (this.sub.rc) return this.sub.rc;
    const [th, ph] = Settings.easy ? pickR([[90, 90], [90, 180], [0, 0], [90, 270]]) : [pickR([45, 90, 135]), pickR([0, 45, 90, 135, 180, 225, 270, 315])];
    const ket = th === 90 && ph % 90 === 0 ? `(|0⟩ ${['+', '+ i', '−', '− i'][ph / 90]}|1⟩)/√2` : th === 0 ? '|0⟩'
      : `cos(${piStr(th / 2)})|0⟩ + e<sup>i${piStr(ph)}</sup> sin(${piStr(th / 2)})|1⟩`;
    return (this.sub.rc = { ket: '🎲 ' + ket, th, ph, rnd: true });
  }
  coords() { this.stage = 'coords'; this.clist = this.coordList(); this.loadCoord(Math.min(this.sub.ci || 0, this.clist.length - 1)); }
  loadCoord(i) {
    this.ci = i; this.sub.ci = i;
    const T = this.clist[i], n = this.clist.length;
    this.target = Q.bloch(Q.fromBloch(T.th * D2R, T.ph * D2R)); this.done = false;
    this.thD = 0; this.phD = 0; this.r = [0, 0, 1];
    this.quest(tr(`Súradnice ${i + 1}/${n}: nastav θ a φ tak, aby šípka ukazovala stav ${T.ket}`, `Coordinates ${i + 1}/${n}: set θ and φ so the arrow shows the state ${T.ket}`, `Координати ${i + 1}/${n}: налаштуй θ і φ так, щоб стрілка показувала стан ${T.ket}`),
      { easy: `📍 ${i + 1}/${n}: ${T.ket}`, hard: `${i + 1}/${n} · ${T.ket} → (θ, φ) = ?` });
    const step = byDiff(15, 15, 7.5);
    this.slTh = UI.slider('θ', 0, 180, step, this.thD, (v) => { this.thD = v; this.setFromAngles(); return v + '°'; });
    this.slPh = UI.slider('φ', 0, 345, step, this.phD, (v) => { this.phD = v; this.setFromAngles(); return v + '°'; });
    this.read = UI.info('');
    UI.panelSet(tr('Súradnice na Blochovej sfére', 'Coordinates on the Bloch sphere', 'Координати на сфері Блоха'), [
      UI.info(`${tr('Cieľ', 'Target', 'Ціль')}: <b>${T.ket}</b>`), this.slTh, this.slPh, this.read,
      Settings.hard ? null : UI.info(tr('θ = 0 je sever |0⟩, θ = 180° juh |1⟩; φ sa meria od osi x po rovníku (90° = os y).', 'θ = 0 is the north |0⟩, θ = 180° the south |1⟩; φ is measured from the x axis along the equator (90° = the y axis).', 'θ = 0 — північ |0⟩, θ = 180° — південь |1⟩; φ відраховують від осі x вздовж екватора (90° = вісь y).'), 'tip'),
    ].filter(Boolean));
    this.setFromAngles();
  }
  setFromAngles() {
    if (this.stage !== 'coords' || this.done) return;
    this.r = Q.bloch(Q.fromBloch(this.thD * D2R, this.phD * D2R));
    this.updRead();
    if (V3.dot(this.r, this.target) > 0.999) {
      this.done = true;
      const T = this.clist[this.ci];
      UI.snapSlider(this.slTh, T.th); if (T.th % 180) UI.snapSlider(this.slPh, T.ph);
      this.r = this.target.slice();
      Sound.sfx('good');
      const last = this.ci + 1 >= this.clist.length;
      this.say([last ? DL('l9.coords.done') : DL('l9.coords.ok', T.ket)], () => {
        if (!last) return this.loadCoord(this.ci + 1);
        this.grant(['sigmavec']);
        this.next();
      });
    }
  }
  updRead() {
    if (!this.read) return;
    const v = this.disp(), th = Math.acos(clamp(v[2], -1, 1)), ph = (Math.atan2(v[1], v[0]) + 2 * Math.PI) % (2 * Math.PI);
    this.read.innerHTML = `r = (${Fmt.num(v[0], 2)}, ${Fmt.num(v[1], 2)}, ${Fmt.num(v[2], 2)})`
      + (V3.len(v) > 0.99 ? `<br>|ψ⟩ = ${Q.ketString(Q.fromBloch(th, ph))}` : '')
      + `<br>P(0) = ${Fmt.num((1 + v[2]) / 2, 2)}, P(1) = ${Fmt.num((1 - v[2]) / 2, 2)} · |r| = ${Fmt.num(V3.len(v), 2)}`;
  }

  // ---------- 2 · rotácie R_n(ϑ) ----------
  rotList() { return PAULI_ROT.filter((p) => !p.hard || Settings.hard); }
  rotations() { this.stage = 'rot'; this.target = null; this.rlist = this.rotList(); this.loadRot(Math.min(this.sub.ri || 0, this.rlist.length - 1)); }
  loadRot(i) {
    this.ri = i; this.sub.ri = i;
    const P = this.rlist[i], n = this.rlist.length;
    this.r = P.from.slice(); this.target = P.to; this.trail = []; this.moves = 0; this.solved = false;
    this.axisK = P.axes[0]; this.ang = P.fixed ?? Math.PI / 2;
    const max = this.maxMoves = P.max + byDiff(1, 0, 0);
    this.quest(tr(`Rotácia ${i + 1}/${n}: ${P.title} (max. ${max})`, `Rotation ${i + 1}/${n}: ${P.title} (max. ${max})`, `Поворот ${i + 1}/${n}: ${P.title} (макс. ${max})`),
      { easy: `🔄 ${i + 1}/${n}: ${P.title}`, hard: `${i + 1}/${n} · R<sub>n</sub>(ϑ) = e<sup>−iϑ n·σ/2</sup> · n ∈ {${P.axes.join(', ')}} · ≤ ${max}` });
    this.buildRotPanel();
  }
  buildRotPanel() {
    const P = this.rlist[this.ri];
    const axBtns = P.axes.map((k) => UI.button((this.axisK === k ? '● ' : '○ ') + tr('os ', 'axis ', 'вісь ') + PAULI_AXIS_NAME[k], () => { this.axisK = k; this.buildRotPanel(); }));
    const nodes = [UI.row(...axBtns)];
    this.slAng = null; // posuvník predchádzajúcej úlohy už nesmie meniť uhol
    if (P.fixed == null) nodes.push(this.slAng = UI.slider(tr('uhol ϑ', 'angle ϑ', 'кут ϑ'), Math.PI / 4, 2 * Math.PI, Math.PI / 4, this.ang, (v) => { this.ang = v; return Fmt.angle(v); }));
    else nodes.push(UI.info(`ϑ = ${Fmt.angle(P.fixed)} ${tr('(pevne)', '(fixed)', '(фіксовано)')}`));
    nodes.push(UI.row(UI.button(`▶ R<sub>${this.axisK === 'h' ? 'H' : this.axisK}</sub>(${Fmt.angle(this.ang)})`, () => this.applyRot(), 'big'),
      UI.button(tr('↺ Znova', '↺ Again', '↺ Знову'), () => this.loadRot(this.ri))));
    this.read = UI.info('');
    nodes.push(this.read);
    if (!Settings.hard) nodes.push(UI.info(tr('Rotácia o kladný uhol ide proti smeru hodinových ručičiek, keď sa pozeráš proti osi (pravidlo pravej ruky).', 'A rotation by a positive angle goes anticlockwise when you look down the axis towards the centre (right-hand rule).', 'Поворот на додатний кут іде проти годинникової стрілки, якщо дивитися з кінця осі до центру (правило правої руки).'), 'tip'));
    UI.panelSet(tr('Rotácie Blochovej sféry', 'Rotations of the Bloch sphere', 'Повороти сфери Блоха'), nodes);
    this.updRead();
  }
  applyRot() {
    if (this.anim || this.solved) return;
    if (this.moves >= this.maxMoves) { UI.toast(tr('Minul si povolený počet rotácií — skús ↺ Znova.', 'You have used up the allowed rotations — try ↺ Again.', 'Ти використав(-ла) дозволені повороти — спробуй ↺ Знову.')); return; }
    this.moves++;
    this.rotate(PAULI_AXES[this.axisK], this.ang, () => {
      this.updRead();
      const P = this.rlist[this.ri];
      if (V3.dot(this.r, P.to) > 0.999) {
        this.solved = true; this.r = P.to.slice();
        if (this.slAng) UI.snapSlider(this.slAng, this.ang, false); // bez animácie: ďalšia úloha nastaví vlastný uhol
        this.say([DL('l9.rotations.' + P.key)], () => {
          if (P.key === 'r1') this.ask(QZ('l9.rotations.q1'), () => this.advRot());
          else this.advRot();
        });
      } else if (this.moves >= this.maxMoves) UI.toast(tr('Ešte to nie je ono — ↺ Znova a skús inú os alebo uhol.', 'Not quite — ↺ Again and try another axis or angle.', 'Ще не те — ↺ Знову і спробуй іншу вісь або кут.'));
    });
  }
  advRot() {
    if (this.ri + 1 < this.rlist.length) return this.loadRot(this.ri + 1);
    this.grant(['rotgate']); this.target = null; this.next();
  }

  // ---------- 3 · meranie ako geometrická otázka ----------
  measureAxis() {
    this.stage = 'meas'; this.target = null; this.axisK = null;
    if (this.sub.th == null) { this.sub.th = 60 + Math.round(rand() * 4) * 15; this.sub.ph = Math.round(rand() * 23) * 15; if (this.sub.ph % 90 === 0) this.sub.ph += 30; }
    this.r = Q.bloch(Q.fromBloch(this.sub.th * D2R, this.sub.ph * D2R));
    this.hidden = true; this.counts = {}; this.guess = 0; this.chi = 0; this.solvedM = false;
    const tol = this.tolM = byDiff(30, 20, 12);
    this.quest(tr(`Stav je skrytý. Meraj spin v rôznych smeroch roviny xy a urči jeho uhol φ (tolerancia ±${tol}°).`, `The state is hidden. Measure the spin along different directions in the xy plane and find its angle φ (tolerance ±${tol}°).`, `Стан приховано. Вимірюй спін у різних напрямках площини xy і визнач його кут φ (допуск ±${tol}°).`),
      { easy: tr('🎯 nájdi φ meraním S<sub>x</sub> a S<sub>y</sub>', '🎯 find φ by measuring S<sub>x</sub> and S<sub>y</sub>', '🎯 знайди φ, вимірюючи S<sub>x</sub> і S<sub>y</sub>'), hard: `φ = atan2(r<sub>y</sub>, r<sub>x</sub>) · ⟨S<sub>χ</sub>⟩ = (ħ/2) sin θ cos(φ − χ) · ±${tol}°` });
    this.say([DL('l9.measureAxis.1')], () => this.buildMeasPanel());
  }
  buildMeasPanel() {
    const N = byDiff(400, 200, 200);
    this.slChi = UI.slider(tr('smer merania χ (od osi x)', 'measurement direction χ (from the x axis)', 'напрямок вимірювання χ (від осі x)'), 0, 345, 15, this.chi, (v) => { this.chi = v; return v + '°'; });
    this.read = UI.info('');
    this.slGuess = UI.slider(tr('tvoj odhad φ', 'your estimate of φ', 'твоя оцінка φ'), 0, 355, 5, this.guess, (v) => { this.guess = v; return v + '°'; });
    UI.panelSet(tr('Meranie ako smer otázky', 'Measurement as the direction of a question', 'Вимірювання як напрямок питання'), [
      UI.row(UI.button(tr('S<sub>x</sub> (χ = 0°)', 'S<sub>x</sub> (χ = 0°)', 'S<sub>x</sub> (χ = 0°)'), () => { UI.snapSlider(this.slChi, 0, false); this.measure(N); }),
        UI.button(tr('S<sub>y</sub> (χ = 90°)', 'S<sub>y</sub> (χ = 90°)', 'S<sub>y</sub> (χ = 90°)'), () => { UI.snapSlider(this.slChi, 90, false); this.measure(N); })),
      this.slChi,
      UI.row(UI.button(tr(`▶ ${N}× zmeraj S<sub>χ</sub>`, `▶ measure S<sub>χ</sub> ${N}×`, `▶ виміряй S<sub>χ</sub> ${N}×`), () => this.measure(N), 'big'), UI.button(tr('1× (jeden výsledok)', '1× (one result)', '1× (один результат)'), () => this.measure(1))),
      this.read, this.slGuess,
      UI.row(UI.button(tr('✓ Over odhad φ', '✓ Check the estimate of φ', '✓ Перевір оцінку φ'), () => this.checkPhi(), 'big')),
    ]);
    this.updMeas();
  }
  measure(N) {
    if (this.solvedM) return;
    const c = this.chi * D2R, n = [Math.cos(c), Math.sin(c), 0], p = Q.probAlong(this.r, n);
    let up = 0;
    for (let k = 0; k < N; k++) if (rand() < p) up++;
    const key = this.chi + '°', o = this.counts[key] || { up: 0, n: 0 };
    o.up += up; o.n += N; this.counts[key] = o; this.lastShot = N === 1 ? (up ? '+ħ/2' : '−ħ/2') : null;
    Sound.sfx('click');
    this.updMeas();
  }
  updMeas() {
    if (!this.read) return;
    const rows = Object.entries(this.counts).map(([k, o]) => {
      const m = (2 * o.up - o.n) / o.n;
      return `χ = ${k}: +ħ/2 × ${o.up}, −ħ/2 × ${o.n - o.up} → ⟨S<sub>χ</sub>⟩ ≈ ${Fmt.num(m / 2, 2)} ħ`;
    });
    this.read.innerHTML = (this.lastShot ? `${tr('Jedno meranie dalo', 'One measurement gave', 'Одне вимірювання дало')}: <b>${this.lastShot}</b><br>` : '')
      + (rows.length ? rows.join('<br>') : tr('Zatiaľ žiadne merania. Každé meranie dá len +ħ/2 alebo −ħ/2.', 'No measurements yet. Each measurement gives only +ħ/2 or −ħ/2.', 'Поки жодних вимірювань. Кожне вимірювання дає лише +ħ/2 або −ħ/2.'));
  }
  checkPhi() {
    if (this.solvedM) return;
    const d = Math.abs(((this.guess - this.sub.ph) % 360 + 540) % 360 - 180);
    if (d <= this.tolM) {
      this.solvedM = true; this.hidden = false;
      UI.snapSlider(this.slGuess, this.sub.ph);
      this.grant(['phitomo']);
      this.say([DL('l9.measureAxis.ok', this.sub.ph, Fmt.num(Math.cos(this.sub.th * D2R) / 2, 2))], () => {
        this.ask(QZ('l9.measureAxis.q'), () => this.next());
      });
    } else {
      this.mistakes++; Sound.sfx('bad');
      UI.toast(tr('Ešte nie. Porovnaj ⟨S<sub>x</sub>⟩ a ⟨S<sub>y</sub>⟩: ich pomer určuje φ.', 'Not yet. Compare ⟨S<sub>x</sub>⟩ and ⟨S<sub>y</sub>⟩: their ratio fixes φ.', 'Ще ні. Порівняй ⟨S<sub>x</sub>⟩ і ⟨S<sub>y</sub>⟩: їхнє відношення визначає φ.'), 3200);
    }
  }

  // ---------- 4 · unitárne vs. dekoherencia ----------
  unitaryVsDeco() {
    this.stage = 'deco'; this.hidden = false; this.target = null; this.axisK = null; this.env = false; this.gates = 0; this.solvedD = false; this.bell = false;
    this.r = [1, 0, 0];
    this.quest(tr('Dostaň šípku do stredu gule (|r| < 0,15). Najprv skús len hradlá.', 'Bring the arrow to the centre of the ball (|r| < 0.15). Try gates only first.', 'Доведи стрілку до центру кулі (|r| < 0,15). Спершу спробуй лише гейти.'),
      { easy: tr('🎯 do stredu: |r| < 0,15', '🎯 to the centre: |r| < 0.15', '🎯 до центру: |r| < 0,15'), hard: '|r| < 0,15 · U: |r′| = |r| · ρ → ?' });
    this.buildDecoPanel();
  }
  buildDecoPanel() {
    const g = (k) => UI.button(k, () => {
      if (this.anim) return;
      this.gates++;
      const [ax, an] = GateAxis[k];
      this.rotate(ax, an, () => {
        this.updRead();
        if (this.gates >= byDiff(3, 4, 4) && !this.f.wall) {
          this.f.wall = true;
          this.say([DL('l9.unitaryVsDeco.wall')], () => this.buildDecoPanel());
        }
      });
    }, 'gate');
    this.read = UI.info('');
    UI.panelSet(tr('Unitárne alebo nie?', 'Unitary or not?', 'Унітарне чи ні?'), [
      UI.row(g('X'), g('Y'), g('Z'), g('H'), g('S'), g('T')),
      this.f.wall ? UI.row(UI.button(this.env ? tr('🌫 Prostredie: ZAP', '🌫 Environment: ON', '🌫 Довкілля: УВІМК') : tr('🌫 Pustiť prostredie (dekoherencia)', '🌫 Let the environment in (decoherence)', '🌫 Впустити довкілля (декогеренція)'), () => { this.env = !this.env; this.buildDecoPanel(); }, 'big')) : null,
      this.read,
    ].filter(Boolean));
    this.updRead();
  }

  viewState() {
    if (this.hidden) return null;
    return { r: this.disp(), note: this.stage === 'deco' ? tr('Unitárne hradlá šípku len otáčajú; prostredie ju skracuje.', 'Unitary gates only turn the arrow; the environment shortens it.', 'Унітарні гейти лише обертають стрілку; довкілля її вкорочує.') : null };
  }

  update(dt) {
    this.t += dt;
    if (this.anim) {
      this.anim.t = Math.min(1, this.anim.t + dt / 0.9);
      const v = this.disp();
      if (!this.trail.length || V3.len(V3.sub(this.trail[this.trail.length - 1], v)) > 0.05) this.trail.push(v);
      if (this.trail.length > 120) this.trail.shift();
      if (this.anim.t >= 1) { const d = this.anim.done; this.anim = null; d && d(); }
      this.updRead();
    }
    if (this.stage === 'deco' && this.env && !this.solvedD) {
      this.r = V3.scale(this.r, Math.exp(-dt / 2.2));
      this.updRead();
      if (V3.len(this.r) < 0.15) {
        this.solvedD = true; this.env = false;
        this.grant(['larmor']);
        this.say([DL('l9.unitaryVsDeco.done.0'), DL('l9.unitaryVsDeco.done.1')], () => {
          this.bell = true;
          this.say([DL('l9.unitaryVsDeco.bell')], () => {
            this.ask(QZ('l9.unitaryVsDeco.q'), () => this.next());
          });
        });
      }
    }
  }

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('box', M4.trs([0, -0.06, 0], 0, [12, 0.1, 9]), [0.14, 0.17, 0.25], { pattern: 1 });
    // dielňa: stôl s ozubenými kolesami (rotácie) a tri osi ako farebné tyče
    r.draw('cylinder', M4.trs([0, 0, 0], 0, [1.9, 0.08, 1.9]), [0.3, 0.34, 0.5]);
    for (let k = 0; k < 3; k++) {
      const a = this.t * (k % 2 ? -0.4 : 0.4) + k * 2.1, p = [Math.cos(k * 2.1) * 3.6, 0.5, Math.sin(k * 2.1) * 3.6 - 1];
      r.draw('torus', M4.trs(p, a, 0.55), [[1, 0.45, 0.45], [0.45, 1, 0.55], [0.45, 0.6, 1]][k], { emissive: 0.25 });
      UI.hot(p, tr('<b>Ozubené koleso</b> — každé jednoqubitové hradlo je rotácia Blochovej sféry (až na globálnu fázu).', '<b>A gear</b> — every single-qubit gate is a rotation of the Bloch sphere (up to a global phase).', '<b>Зубчасте колесо</b> — кожен однокубітний гейт — це поворот сфери Блоха (з точністю до глобальної фази).'), 30);
    }
    const c = [0, 1.7, 0], R = 1.45, v = this.disp();
    if (this.axisK && this.stage === 'rot') {
      const ax = qToWorld(PAULI_AXES[this.axisK]);
      r.rod(V3.sub(c, V3.scale(ax, R * 1.5)), V3.add(c, V3.scale(ax, R * 1.5)), [1, 0.9, 0.35], 0.022, { emissive: 0.8 });
      UI.label('pax', V3.add(c, V3.scale(ax, R * 1.62)), `n = ${PAULI_AXIS_NAME[this.axisK]}`, 'axis');
    }
    if (this.stage === 'meas') {
      const ch = this.chi * D2R, d = qToWorld([Math.cos(ch), Math.sin(ch), 0]);
      r.arrow(c, V3.add(c, V3.scale(d, R * 1.35)), [0.5, 1, 0.6], 0.03, { emissive: 0.6 });
      for (const s of [-1, 1]) r.draw('box', M4.trs(V3.add(c, V3.scale(d, s * R * 1.75)), Math.atan2(d[0], d[2]), [0.5, 0.5, 0.18]), s > 0 ? [0.85, 0.3, 0.3] : [0.3, 0.45, 0.9]);
      UI.label('pchi', V3.add(c, V3.scale(d, R * 1.5)), `χ = ${this.chi}°`, 'axis');
      UI.hot(V3.add(c, V3.scale(d, R * 1.75)), tr('<b>Meracie magnety</b> pozdĺž smeru χ: každý atóm skončí pri jednom z nich — výsledok je vždy +ħ/2 alebo −ħ/2.', '<b>Measuring magnets</b> along the direction χ: every atom ends up at one of them — the result is always +ħ/2 or −ħ/2.', '<b>Вимірювальні магніти</b> вздовж напрямку χ: кожен атом потрапляє до одного з них — результат завжди +ħ/2 або −ħ/2.'), 40);
    }
    if (this.hidden) {
      Bloch.draw(r, c, R, null, { labelFn: UI.label.bind(UI), key: 'p', axisNames: true });
      UI.label('pq', c, '?', 'prompt');
    } else Bloch.draw(r, c, R, v, { labelFn: UI.label.bind(UI), key: 'p', axisNames: true, bars: true, target: this.stage === 'coords' && !Settings.easy ? null : this.target, trail: this.trail }); // súradnice: cieľ ukáže len ľahká
    Machine.nmr(r, [-4.5, 0, -0.7], 1.1, this.hidden ? null : this.bell ? [0, 0, 0] : v, { labelFn: UI.label.bind(UI), key: 'p9', rf: this.stage === 'rot' && !!this.anim, precess: !this.anim });
    if (this.stage === 'deco' && this.env) {
      for (let k = 0; k < 24; k++) {
        const a = k * 2.399 + this.t * 0.7, h = Math.sin(k * 1.3 + this.t) * 1.2;
        r.sphere(V3.add(c, [Math.cos(a) * 2.2, h, Math.sin(a) * 2.2]), 0.07, [0.75, 0.8, 0.9], { alpha: 0.35 });
      }
      UI.label('penv', V3.add(c, [0, R + 0.9, 0]), tr('prostredie „meria“ qubit', 'the environment “measures” the qubit', 'довкілля «вимірює» кубіт'), 'axis');
    }
    if (this.bell) { // Bellov stav: dve malé gule, oba lokálne vektory v strede
      for (const [s, nm] of [[-1, 'A'], [1, 'B']]) {
        const cc = [s * 3.4, 1.1, 1.6];
        Bloch.draw(r, cc, 0.6, [0, 0, 0], { labelFn: UI.label.bind(UI), key: 'bell' + nm, labels: false, detail: false });
        UI.label('bl' + nm, V3.add(cc, [0, 0.95, 0]), `r<sub>${nm}</sub> = 0`, 'axis');
      }
      r.rod([-2.8, 1.1, 1.6], [2.8, 1.1, 1.6], [1, 0.45, 0.7], 0.015, { emissive: 0.7, alpha: 0.6 });
      UI.label('blj', [0, 1.45, 1.6], '|Φ⁺⟩ = (|00⟩ + |11⟩)/√2', 'ket');
      UI.hot([0, 1.1, 1.6], tr('<b>Bellov stav</b>: spoločný stav je čistý, no každý qubit zvlášť je v strede svojej gule (ρ<sub>A</sub> = ρ<sub>B</sub> = I/2). Informácia je v koreláciách.', '<b>Bell state</b>: the joint state is pure, yet each qubit alone sits at the centre of its ball (ρ<sub>A</sub> = ρ<sub>B</sub> = I/2). The information is in the correlations.', '<b>Стан Белла</b>: спільний стан чистий, але кожен кубіт окремо — у центрі своєї кулі (ρ<sub>A</sub> = ρ<sub>B</sub> = I/2). Інформація — в кореляціях.'), 50);
    }
  }
}
