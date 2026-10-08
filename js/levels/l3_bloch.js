'use strict';
// LEVEL 3 — Blochovo observatórium (mentor: Felix Bloch)
// Hradlá ako rotácie, relatívna vs. globálna fáza, meranie (jeden bit vs. štatistika).

const BLOCH_PUZZLES = [
  { from: '0', to: '1', gates: ['X'], max: 1, title: tr('Preklop |0⟩ na |1⟩', 'Flip |0⟩ to |1⟩'), grant: ['bloch', 'sphere', 'XYZ'],
    msg: tr('<b>X</b> = rotácia o 180° okolo osi x. Z severného pólu na južný: kvantové NOT, „preklopenie bitu“. Všimni si: |0⟩ a |1⟩ sú v Hilbertovom priestore <b>kolmé</b>, ale na Blochovej sfére <b>protiľahlé</b>.', '<b>X</b> = a 180° rotation about the x axis. From the north pole to the south: quantum NOT, a “bit flip”. Notice: |0⟩ and |1⟩ are <b>perpendicular</b> in Hilbert space but <b>antipodal</b> on the Bloch sphere.') },
  { from: '0', to: '+', gates: ['X', 'Z', 'H'], max: 1, title: tr('Dostaň sa z pólu na rovník do |+⟩', 'Get from the pole to the equator, to |+⟩'), grant: ['H'],
    msg: tr('<b>H</b> otáča okolo osi medzi x a z → vymieňa osi z ↔ x. Pozor na jazyk: H „vytvorí superpozíciu“ len z pohľadu Z-bázy. Na |+⟩ by ju naopak „zrušilo“.', '<b>H</b> rotates about the axis between x and z → swaps the axes z ↔ x. Mind the language: H “creates a superposition” only from the point of view of the Z basis. Applied to |+⟩ it would “undo” one instead.') },
  { from: '+', to: '-', gates: ['Z', 'S', 'T'], max: 1, title: tr('Zmeň |+⟩ na |−⟩', 'Change |+⟩ into |−⟩'), grant: ['relph', 'ST'],
    msg: tr('Pozri na P(0) a P(1): <b>nezmenili sa</b> (stále ½ a ½)! Z zmenil iba <b>relatívnu fázu</b> o π. V Z-báze nerozlíšiteľné, v X-báze úplne odlišné stavy.', 'Look at P(0) and P(1): <b>they didn’t change</b> (still ½ and ½)! Z changed only the <b>relative phase</b> by π. Indistinguishable in the Z basis, completely different states in the X basis.') },
  { from: '0', to: '+i', gates: ['H', 'S', 'X', 'Z'], max: 2, title: tr('Dostaň sa do |+i⟩ (os y)', 'Get to |+i⟩ (the y axis)'), grant: ['thetaphi'],
    msg: tr('H ťa zložilo na rovník (θ = π/2), S otočilo fázu o π/2 (φ = π/2). Dva uhly θ a φ stačia na opis každého čistého qubitu.', 'H brought you down to the equator (θ = π/2), S turned the phase by π/2 (φ = π/2). Two angles θ and φ are enough to describe any pure qubit.') },
  { from: '0', to: '1', gates: ['H', 'Z'], max: 3, title: tr('Preklop |0⟩ na |1⟩ — ale bez X!', 'Flip |0⟩ to |1⟩ — but without X!'), grant: ['unitary'],
    msg: tr('H·Z·H = X. Rôzne postupnosti rotácií môžu dať tú istú výslednú rotáciu. Každé hradlo je <b>unitárne</b> = rotácia, ktorá zachováva dĺžku šípky.', 'H·Z·H = X. Different sequences of rotations can give the same overall rotation. Every gate is <b>unitary</b> = a rotation that preserves the length of the arrow.') },
  { from: '0', to: '1', gates: ['Y'], max: 1, title: tr('Preklop |0⟩ na |1⟩ hradlom Y', 'Flip |0⟩ to |1⟩ with the Y gate'), grant: ['globalph'],
    msg: tr('Pozri na zápis: Y|0⟩ = <b>i|1⟩</b>. Faktor i je <b>globálna fáza</b> — rovnaký pre celý stav, nedá sa zmerať. Preto píšeme <b>i|1⟩ ∼ |1⟩</b> („rovné až na globálnu fázu“). Šípka na sfére je tá istá!', 'Look at the notation: Y|0⟩ = <b>i|1⟩</b>. The factor i is a <b>global phase</b> — the same for the whole state, impossible to measure. That’s why we write <b>i|1⟩ ∼ |1⟩</b> (“equal up to a global phase”). The arrow on the sphere is the same!') },
  // len na ťažkej obťažnosti
  { from: '0', to: '-i', gates: ['H', 'S', 'Z', 'X'], max: 3, hard: true, title: tr('Dostaň sa do |−i⟩ (os −y)', 'Get to |−i⟩ (the −y axis)'), grant: [],
    msg: tr('Napr. H → |+⟩, S → |+i⟩, Z → |−i⟩ (alebo H, Z, S). Relatívna fáza φ = 3π/2 — teda −i. Rôzne cesty po sfére, rovnaký cieľ.',
      'E.g. H → |+⟩, S → |+i⟩, Z → |−i⟩ (or H, Z, S). Relative phase φ = 3π/2 — that is −i. Different paths over the sphere, the same target.') },
  { from: '+', to: '+i', gates: ['T'], max: 2, hard: true, title: tr('Otoč |+⟩ na |+i⟩ len hradlom T', 'Turn |+⟩ into |+i⟩ using only T'), grant: [],
    msg: tr('T·T = S: dve rotácie o 45° okolo z dajú 90°. Fázové hradlá tvoria rebrík: T² = S, S² = Z.', 'T·T = S: two 45° rotations about z make 90°. The phase gates form a ladder: T² = S, S² = Z.') },
];

class L3Bloch extends Level {
  get steps() { return [this.intro, this.puzzles, this.measure, this.lab]; }
  puzzleList() { return BLOCH_PUZZLES.filter((p) => !p.hard || Settings.hard); }

  setup() {
    this.cam = new OrbitCam([0, 0, 0], 7, 0.75, 0.32, 3.5, 14);
    this.psi = Q.ket0(); this.anim = null; this.trail = []; this.pi = 0; this.hist = null; this.f = {}; this.step = null;
  }

  intro() {
    this.quest(tr('Vypočuj si Felixa Blocha', 'Listen to Felix Bloch'), { easy: tr('💬 Bloch', '💬 Bloch'), hard: tr('Bloch: θ, φ, rotácie', 'Bloch: θ, φ, rotations') });
    this.say(tr([
      'Grüezi! Som Felix Bloch. Vďaka NMR som ukázal, že stav spinu sa dá kresliť ako <b>šípka v guli</b>. Dnes ju voláme <b>Blochova sféra</b>.',
      'Prirovnanie: Blochova sféra je <b>zemeguľa stavov</b>. Severný pól = |0⟩, južný = |1⟩, rovník = rovnomerné superpozície. <b>Zemepisná šírka</b> (uhol θ) určuje pravdepodobnosti merania v Z-báze, <b>zemepisná dĺžka</b> (φ) je relatívna fáza.',
      'Ale pozor: toto <b>nie je</b> mapa laboratória a šípka nie je os rotujúcej guľôčky! Je to obraz amplitúd α a β.',
      `Hradlá sú <b>otočenia</b> tejto gule. Vyrieš ${this.puzzleList().length} hádaniek: dostaň šípku (červená) na zlatý cieľ s obmedzenými hradlami. Guľou môžeš otáčať myšou.`,
    ], [
      'Grüezi! I am Felix Bloch. Thanks to NMR I showed that the state of a spin can be drawn as an <b>arrow in a ball</b>. Today we call it the <b>Bloch sphere</b>.',
      'An analogy: the Bloch sphere is a <b>globe of states</b>. North pole = |0⟩, south = |1⟩, the equator = equal superpositions. <b>Latitude</b> (the angle θ) sets the measurement probabilities in the Z basis, <b>longitude</b> (φ) is the relative phase.',
      'But careful: this is <b>not</b> a map of the laboratory, and the arrow is not the axis of a spinning ball! It is a picture of the amplitudes α and β.',
      `Gates are <b>rotations</b> of this ball. Solve ${this.puzzleList().length} puzzles: bring the (red) arrow onto the golden target with a limited set of gates. You can rotate the ball with the mouse.`,
    ]), () => this.next());
  }

  puzzles() { this.plist = this.puzzleList(); this.loadPuzzle(Math.min(this.sub.pi || 0, this.plist.length - 1)); }

  loadPuzzle(i) {
    this.pi = i; this.sub.pi = i;
    const P = this.plist[i], max = this.maxMoves = P.max + byDiff(1, 0, 0), n = this.plist.length;
    this.psi = Q.named(P.from); this.moves = 0; this.trail = []; this.anim = null; this.solved = false;
    this.quest(tr(`Hádanka ${i + 1}/${n}: ${P.title} (max. ${max} ${max === 1 ? 'hradlo' : 'hradlá'})`, `Puzzle ${i + 1}/${n}: ${P.title} (max. ${max} ${max === 1 ? 'gate' : 'gates'})`), {
      easy: tr(`🧩 ${i + 1}/${n}: ${P.title}`, `🧩 ${i + 1}/${n}: ${P.title}`),
      hard: `${i + 1}/${n} · |${P.from.replace('-', '−')}⟩ → |${P.to.replace('-', '−')}⟩ · {${P.gates.join(',')}} · ≤ ${max}`,
    });
    const gateBtns = ['X', 'Y', 'Z', 'H', 'S', 'T'].map((g) => {
      const b = UI.button(g, () => this.applyGate(g), 'gate');
      b.disabled = !P.gates.includes(g);
      return b;
    });
    this.readout = UI.info('');
    UI.panelSet(tr('Hradlá (rotácie sféry)', 'Gates (rotations of the sphere)'), [
      UI.row(...gateBtns),
      UI.row(UI.button(tr('↺ Znova', '↺ Again'), () => this.loadPuzzle(i))),
      this.readout,
      UI.info(`${tr('Povolené', 'Allowed')}: ${P.gates.join(', ')}`, 'tip'),
      Settings.hard ? null : UI.info(tr('X, Y, Z: 180° okolo osí x, y, z · H: 180° okolo osi (x+z) · S: 90° okolo z · T: 45° okolo z', 'X, Y, Z: 180° about the x, y, z axes · H: 180° about the (x+z) axis · S: 90° about z · T: 45° about z'), 'tip'),
    ].filter(Boolean));
    this.updReadout();
  }

  applyGate(g) {
    if (this.anim || this.solved) return;
    if (this.step === 'lab') return this.rotate(GateAxis[g][0], GateAxis[g][1], Gate[g], g);
    if (this.moves >= this.maxMoves) { UI.toast(tr('Minul si povolený počet hradiel — skús ↺ Znova.', 'You’ve used up the allowed number of gates — try ↺ Again.')); return; }
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
          this.ask(tr({ q: 'Stavy |+⟩ a |−⟩ majú rovnaké P(0) = P(1) = ½. Sú to rovnaké stavy?', options: ['Nie — líšia sa relatívnou fázou a meranie v X-báze ich rozlíši naisto', 'Áno — rovnaké pravdepodobnosti = rovnaký stav', 'Áno, líšia sa len globálnou fázou'], correct: 0,
            why: 'Rovnaké štatistiky v jednej báze ešte neznamenajú rovnaký stav. Sú dokonca ortogonálne!' }, { q: 'The states |+⟩ and |−⟩ have the same P(0) = P(1) = ½. Are they the same state?', options: ['No — they differ by a relative phase, and a measurement in the X basis tells them apart with certainty', 'Yes — same probabilities = same state', 'Yes, they differ only by a global phase'], correct: 0,
            why: 'Equal statistics in one basis do not mean the same state. They are even orthogonal!' }), () => this.advance());
        } else this.advance();
      });
    } else if (this.moves >= this.maxMoves) UI.toast(tr('Ešte to nie je ono. Klikni ↺ Znova a skús iné poradie.', 'Not quite yet. Click ↺ Again and try a different order.'));
  }
  advance() { if (this.pi + 1 < this.plist.length) this.loadPuzzle(this.pi + 1); else this.next(); }

  updReadout() {
    if (!this.readout) return;
    const v = Q.bloch(this.psi), [p0, p1] = Q.probs(this.psi);
    const th = Math.acos(clamp(v[2], -1, 1)), ph = Math.atan2(v[1], v[0]);
    const raw = Q.ketString(this.psi, false), can = Q.ketString(this.psi, true);
    this.readout.innerHTML = `<b>|ψ⟩ = ${raw}</b>` + (raw !== can ? `<br>∼ ${can} <small>(${tr('až na globálnu fázu', 'up to a global phase')})</small>` : '')
      + `<br>P(0) = |α|² = ${Fmt.num(p0, 2)}, P(1) = |β|² = ${Fmt.num(p1, 2)}`
      + `<br>θ = ${Fmt.angle(th)}${Math.abs(Math.sin(th)) > 1e-3 ? ', φ = ' + Fmt.angle((ph + 2 * Math.PI) % (2 * Math.PI)) : ''}`
      + (this.moves !== undefined && !this.step ? `<br>${tr('Použité hradlá', 'Gates used')}: ${this.moves}` : '');
    const P = !this.step && this.plist && this.plist[this.pi];
    if (P && Settings.diff === 'easy') {
      const t = Q.bloch(Q.named(P.to)), tth = Math.acos(clamp(t[2], -1, 1)), tph = (Math.atan2(t[1], t[0]) + 2 * Math.PI) % (2 * Math.PI);
      this.readout.innerHTML += `<br><small>💡 ${tr('cieľ', 'target')}: θ = ${Fmt.angle(tth)}${Math.abs(Math.sin(tth)) > 1e-3 ? ', φ = ' + Fmt.angle(tph) : ''}</small>`;
    }
  }

  // ---------- meranie ----------
  measure() {
    this.step = 'measure';
    this.psi = Q.named('+'); this.trail = []; this.hist = null; this.f.m1 = this.f.m100 = false;
    this.quest(tr('Priprav |+⟩ a zmeraj ho: raz (1×) a potom na 100 kópiách.', 'Prepare |+⟩ and measure it: once (1×), then on 100 copies.'), {
      easy: tr('📏 Meraj |+⟩: 1× a 100×', '📏 Measure |+⟩: 1× and 100×'),
      hard: tr('|+⟩ → M<sub>Z</sub> ×1, ×100 · porovnaj s |+i⟩', '|+⟩ → M<sub>Z</sub> ×1, ×100 · compare with |+i⟩'),
    });
    this.say(tr([
      'Posledná lekcia: <b>meranie</b>. Šípka obsahuje veľa informácie (θ aj φ). Koľko z nej dostaneš jedným meraním?',
      'Klikni <b>Meraj 1×</b> na stav |+⟩. Potom <b>Meraj 100 kópií</b> — tie isté prípravy, nezávislé merania.',
    ], [
      'The last lesson: <b>measurement</b>. The arrow holds a lot of information (both θ and φ). How much of it do you get from one measurement?',
      'Click <b>Measure 1×</b> on the state |+⟩. Then <b>Measure 100 copies</b> — the same preparations, independent measurements.',
    ]));
    this.readout = UI.info('');
    UI.panelSet(tr('Meranie v Z-báze', 'Measurement in the Z basis'), [
      UI.row(UI.button(tr('Priprav |+⟩', 'Prepare |+⟩'), () => { this.psi = Q.named('+'); this.updReadout(); }), UI.button(tr('Priprav |+i⟩', 'Prepare |+i⟩'), () => { this.psi = Q.named('+i'); this.updReadout(); })),
      UI.row(UI.button(tr('Meraj 1×', 'Measure 1×'), () => this.measureOnce(), 'big'), UI.button(tr('Meraj 100 kópií', 'Measure 100 copies'), () => this.measureMany())),
      this.readout,
    ]);
    this.updReadout();
  }
  measureOnce() {
    const p0 = Q.probs(this.psi)[0], out = rand() < p0 ? 0 : 1;
    this.psi = out ? Q.ket1() : Q.ket0();
    this.updReadout();
    UI.toast(tr(`Výsledok: <b>${out}</b> → stav je teraz |${out}⟩ (pôvodná fáza je stratená)`, `Outcome: <b>${out}</b> → the state is now |${out}⟩ (the original phase is lost)`));
    if (!this.f.m1) { this.f.m1 = true; this.checkMeasure(); }
  }
  measureMany() {
    const p0 = Q.probs(this.psi)[0];
    let n0 = 0;
    for (let i = 0; i < 100; i++) if (rand() < p0) n0++;
    this.hist = [n0, 100 - n0];
    UI.toast(`${tr('100 kópií', '100 copies')}: 0 → ${n0}×, 1 → ${100 - n0}×`);
    if (!this.f.m100) { this.f.m100 = true; this.checkMeasure(); }
  }
  checkMeasure() {
    if (!(this.f.m1 && this.f.m100) || this.f.mdone) return;
    this.f.mdone = true;
    this.ask(tr({ q: 'Čo nám dalo JEDNO meranie qubitu?', options: ['jeden bit (0 alebo 1) a stav sa zmenil na |0⟩ alebo |1⟩', 'hodnoty α a β', 'uhly θ a φ'], correct: 0,
      why: 'Jedno meranie = jeden bit. Pravdepodobnosti zistíš až zo <b>štatistiky mnohých rovnako pripravených kópií</b>. A fázu φ len meraním v inej báze. (Skús: |+⟩ a |+i⟩ dajú v Z-báze rovnakú štatistiku!)' }, { q: 'What did ONE measurement of the qubit give us?', options: ['one bit (0 or 1), and the state changed to |0⟩ or |1⟩', 'the values of α and β', 'the angles θ and φ'], correct: 0,
      why: 'One measurement = one bit. You learn the probabilities only from the <b>statistics of many identically prepared copies</b>. And the phase φ only by measuring in another basis. (Try it: |+⟩ and |+i⟩ give the same statistics in the Z basis!)' }), () => this.next());
  }

  // ---------- geometrické laboratórium (voľné skúmanie) ----------
  labN() { const a = this.L.nth * Math.PI / 180, b = this.L.nph * Math.PI / 180; return [Math.sin(a) * Math.cos(b), Math.sin(a) * Math.sin(b), Math.cos(a)]; }
  labM() { const a = this.L.mth * Math.PI / 180, b = this.L.mph * Math.PI / 180; return [Math.sin(a) * Math.cos(b), Math.sin(a) * Math.sin(b), Math.cos(a)]; }
  lab() {
    this.step = 'lab'; this.hist = null; this.trail = []; this.anim = null;
    this.L = { th: 60, ph: 45, nth: 90, nph: 0, ang: 90, mth: 0, mph: 0 };
    this.quest(tr('Geometrické laboratórium: priprav ľubovoľný stav, otáčaj okolo ľubovoľnej osi a meraj pozdĺž ľubovoľnej osi. Potom pokračuj na skúšku.',
      'Geometry lab: prepare any state, rotate about any axis and measure along any axis. Then continue to the exam.'), {
      easy: tr('🧪 Laboratórium: stav · rotácia · meranie', '🧪 Lab: state · rotation · measurement'),
      hard: '|ψ(θ,φ)⟩ → R<sub>n</sub>(α) → M<sub>m</sub>: P(+m) = (1 + r·m)/2',
    });
    this.say([tr('Na záver voľné laboratórium. Každý čistý stav je bod (θ, φ), každé hradlo je rotácia R<sub>n</sub>(α) okolo nejakej osi n a každé meranie je otázka „je stav v smere m?“ — <b>P(+m) = (1 + r·m)/2</b>.',
      'Finally, a free lab. Every pure state is a point (θ, φ), every gate is a rotation R<sub>n</sub>(α) about some axis n, and every measurement is the question “is the state along m?” — <b>P(+m) = (1 + r·m)/2</b>.')]);
    const L = this.L, deg = (v) => v + '°';
    this.labInfo = UI.info(''); this.labChart = UI.chart(300, 110); this.readout = UI.info('');
    const det = (title, nodes, open) => { const d = el('details'); d.open = !!open; d.appendChild(el('summary', null, title)); nodes.forEach((x) => d.appendChild(x)); return d; };
    UI.panelSet(tr('Geometrické laboratórium', 'Geometry lab'), [
      this.readout,
      det(tr('1 · Priprav stav (θ, φ)', '1 · Prepare a state (θ, φ)'), [
        UI.slider('θ', 0, 180, 5, L.th, (v) => { L.th = v; return deg(v); }, tr('Polárny uhol od |0⟩.', 'Polar angle from |0⟩.')),
        UI.slider('φ', 0, 355, 5, L.ph, (v) => { L.ph = v; return deg(v); }, tr('Relatívna fáza (azimut).', 'Relative phase (azimuth).')),
        UI.button(tr('Priprav', 'Prepare'), () => { if (this.anim) return; this.psi = Q.fromBloch(L.th * Math.PI / 180, L.ph * Math.PI / 180); this.trail = []; this.updReadout(); this.updLab(); }),
      ], true),
      det(tr('2 · Rotácia R<sub>n</sub>(α) okolo osi n', '2 · Rotation R<sub>n</sub>(α) about the axis n'), [
        UI.slider(tr('os n: θ<sub>n</sub>', 'axis n: θ<sub>n</sub>'), 0, 180, 15, L.nth, (v) => { L.nth = v; return deg(v); }),
        UI.slider(tr('os n: φ<sub>n</sub>', 'axis n: φ<sub>n</sub>'), 0, 345, 15, L.nph, (v) => { L.nph = v; return deg(v); }),
        UI.slider(tr('uhol α', 'angle α'), -180, 180, 15, L.ang, (v) => { L.ang = v; return deg(v); }, tr('Kladný uhol = proti smeru hodinových ručičiek pri pohľade z hrotu osi n.', 'Positive angle = counter-clockwise when looking from the tip of n.')),
        UI.button(tr('↻ Otoč', '↻ Rotate'), () => { const a = L.ang * Math.PI / 180; this.rotate(this.labN(), a, Gate.R(this.labN(), a), 'n'); }, 'big'),
        UI.row(...['X', 'Y', 'Z', 'H', 'S', 'T'].map((g) => UI.button(g, () => this.applyGate(g), 'gate'))),
      ], true),
      det(tr('3 · Meranie pozdĺž osi m', '3 · Measurement along the axis m'), [
        UI.slider(tr('os m: θ<sub>m</sub>', 'axis m: θ<sub>m</sub>'), 0, 180, 15, L.mth, (v) => { L.mth = v; this.updLab(); return deg(v); }),
        UI.slider(tr('os m: φ<sub>m</sub>', 'axis m: φ<sub>m</sub>'), 0, 345, 15, L.mph, (v) => { L.mph = v; this.updLab(); return deg(v); }),
        UI.row(UI.button(tr('Meraj 1×', 'Measure 1×'), () => this.labMeasure(1)), UI.button(tr('Meraj 100 kópií', 'Measure 100 copies'), () => this.labMeasure(100))),
        this.labInfo, this.labChart,
      ], true),
      UI.button(tr('Pokračovať na záverečnú skúšku ▸', 'Continue to the final exam ▸'), () => this.next(), 'primary'),
    ]);
    this.updReadout(); this.updLab();
  }
  labMeasure(n) {
    if (this.anim) return;
    const m = this.labM(), p = Q.probAlong(Q.bloch(this.psi), m);
    if (n === 1) {
      const plus = rand() < p, a = this.L.mth * Math.PI / 180, b = this.L.mph * Math.PI / 180;
      this.psi = plus ? Q.fromBloch(a, b) : Q.fromBloch(Math.PI - a, b + Math.PI);
      UI.toast(tr(`Výsledok: <b>${plus ? '+m' : '−m'}</b> → stav skolaboval do smeru ${plus ? '+m' : '−m'}.`, `Outcome: <b>${plus ? '+m' : '−m'}</b> → the state collapsed onto ${plus ? '+m' : '−m'}.`));
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
    this.labInfo.innerHTML = `P(+m) = (1 + r·m)/2 = <b>${Fmt.pct(p)}</b>, P(−m) = ${Fmt.pct(1 - p)}<br><small>${tr('uhol medzi stavom a osou m', 'angle between the state and m')}: ${Math.round(ang)}° → cos²(${Math.round(ang)}°/2)</small>`;
    const bars = [{ x: 0.5, w: 0.62, y: p, color: '#ffd25a', outline: true }, { x: 1.5, w: 0.62, y: 1 - p, color: '#ffd25a', outline: true }];
    if (this.hist) bars.unshift({ x: 0.5, w: 0.5, y: this.hist[0] / 100, color: '#5fe08a', label: this.hist[0] + '×' }, { x: 1.5, w: 0.5, y: this.hist[1] / 100, color: '#ff6b7d', label: this.hist[1] + '×' });
    UI.drawChart(this.labChart, { x0: 0, x1: 2, y0: 0, y1: 1.15, yticks: [[0, '0'], [0.5, '½'], [1, '1']], xticks: [[0.5, '+m'], [1.5, '−m']], bars,
      legend: [['#ffd25a', tr('teória', 'theory')], ['#5fe08a', tr('100 meraní', '100 measurements')]] });
  }

  viewState() {
    if (this.anim) return { r: V3.rotate(this.anim.v0, this.anim.axis, this.anim.ang * this.anim.t), note: tr('Hradlo práve otáča stav.', 'A gate is rotating the state.') };
    return { psi: this.psi, note: tr('Všimni si: po hradle Y majú ručičky spoločnú fázu i (globálna fáza) — Blochove rezy ju nevidia.', 'Notice: after the Y gate both hands share the phase i (a global phase) — the Bloch cuts cannot see it.') };
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
      UI.label('gate', V3.scale(ax, 2.9), tr('os ', 'axis ') + this.anim.g, 'prompt');
    }
    Bloch.draw(r, [0, 0, 0], 2, v, { target: P ? Q.bloch(Q.named(P.to)) : null, trail: this.trail, labelFn: UI.label.bind(UI), key: 'b', axisNames: true, bars: true });
    if (this.step === 'lab') { // os rotácie n (žltá, prerušovaná) a os merania m (zelená)
      const n = qToWorld(this.labN()), m = qToWorld(this.labM());
      r.dash(V3.scale(n, -2.7), V3.scale(n, 2.7), [1, 1, 0.5]);
      UI.label('labn', V3.scale(n, 2.95), 'n', 'prompt', tr('Os rotácie n (nastav v paneli).', 'Rotation axis n (set it in the panel).'));
      r.arrow([0, 0, 0], V3.scale(m, 2.5), [0.4, 1, 0.6], 0.025, { alpha: 0.7 });
      r.rod([0, 0, 0], V3.scale(m, -2.5), [0.4, 1, 0.6], 0.012, { alpha: 0.5 });
      UI.label('labm', V3.scale(m, 2.75), '+m', 'ket', tr('Os merania m: výsledok „+“ = stav v smere m, „−“ = protiľahlý stav.', 'Measurement axis m: outcome “+” = the state along m, “−” = the opposite state.'));
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
