'use strict';
// LEVEL 3 — Blochovo observatórium (mentor: Felix Bloch)
// Hradlá ako rotácie, relatívna vs. globálna fáza, meranie (jeden bit vs. štatistika).

const BLOCH_PUZZLES = [
  { from: '0', to: '1', gates: ['X'], max: 1, title: 'Preklop |0⟩ na |1⟩', grant: ['bloch', 'sphere', 'XYZ'],
    msg: '<b>X</b> = rotácia o 180° okolo osi x. Z severného pólu na južný: kvantové NOT, „preklopenie bitu“. Všimni si: |0⟩ a |1⟩ sú v Hilbertovom priestore <b>kolmé</b>, ale na Blochovej sfére <b>protiľahlé</b>.' },
  { from: '0', to: '+', gates: ['X', 'Z', 'H'], max: 1, title: 'Dostaň sa z pólu na rovník do |+⟩', grant: ['H'],
    msg: '<b>H</b> otáča okolo osi medzi x a z → vymieňa osi z ↔ x. Pozor na jazyk: H „vytvorí superpozíciu“ len z pohľadu Z-bázy. Na |+⟩ by ju naopak „zrušilo“.' },
  { from: '+', to: '-', gates: ['Z', 'S', 'T'], max: 1, title: 'Zmeň |+⟩ na |−⟩', grant: ['relph', 'ST'],
    msg: 'Pozri na P(0) a P(1): <b>nezmenili sa</b> (stále ½ a ½)! Z zmenil iba <b>relatívnu fázu</b> o π. V Z-báze nerozlíšiteľné, v X-báze úplne odlišné stavy.' },
  { from: '0', to: '+i', gates: ['H', 'S', 'X', 'Z'], max: 2, title: 'Dostaň sa do |+i⟩ (os y)', grant: ['thetaphi'],
    msg: 'H ťa zložilo na rovník (θ = π/2), S otočilo fázu o π/2 (φ = π/2). Dva uhly θ a φ stačia na opis každého čistého qubitu.' },
  { from: '0', to: '1', gates: ['H', 'Z'], max: 3, title: 'Preklop |0⟩ na |1⟩ — ale bez X!', grant: ['unitary'],
    msg: 'H·Z·H = X. Rôzne postupnosti rotácií môžu dať tú istú výslednú rotáciu. Každé hradlo je <b>unitárne</b> = rotácia, ktorá zachováva dĺžku šípky.' },
  { from: '0', to: '1', gates: ['Y'], max: 1, title: 'Preklop |0⟩ na |1⟩ hradlom Y', grant: ['globalph'],
    msg: 'Pozri na zápis: Y|0⟩ = <b>i|1⟩</b>. Faktor i je <b>globálna fáza</b> — rovnaký pre celý stav, nedá sa zmerať. Preto píšeme <b>i|1⟩ ∼ |1⟩</b> („rovné až na globálnu fázu“). Šípka na sfére je tá istá!' },
];

class L3Bloch extends Level {
  get steps() { return [this.intro, this.puzzles, this.measure]; }

  setup() {
    this.cam = new OrbitCam([0, 0, 0], 7, 0.75, 0.32, 3.5, 14);
    this.psi = Q.ket0(); this.anim = null; this.trail = []; this.pi = 0; this.hist = null; this.f = {}; this.step = null;
  }

  intro() {
    this.quest('Vypočuj si Felixa Blocha');
    this.say([
      'Grüezi! Som Felix Bloch. Vďaka NMR som ukázal, že stav spinu sa dá kresliť ako <b>šípka v guli</b>. Dnes ju voláme <b>Blochova sféra</b>.',
      'Prirovnanie: Blochova sféra je <b>zemeguľa stavov</b>. Severný pól = |0⟩, južný = |1⟩, rovník = rovnomerné superpozície. <b>Zemepisná šírka</b> (uhol θ) určuje pravdepodobnosti merania v Z-báze, <b>zemepisná dĺžka</b> (φ) je relatívna fáza.',
      'Ale pozor: toto <b>nie je</b> mapa laboratória a šípka nie je os rotujúcej guľôčky! Je to obraz amplitúd α a β.',
      'Hradlá sú <b>otočenia</b> tejto gule. Vyrieš 6 hádaniek: dostaň šípku (červená) na zlatý cieľ s obmedzenými hradlami. Guľou môžeš otáčať myšou.',
    ], () => this.next());
  }

  puzzles() { this.loadPuzzle(0); }

  loadPuzzle(i) {
    this.pi = i;
    const P = BLOCH_PUZZLES[i];
    this.psi = Q.named(P.from); this.moves = 0; this.trail = []; this.anim = null; this.solved = false;
    this.quest(`Hádanka ${i + 1}/${BLOCH_PUZZLES.length}: ${P.title} (max. ${P.max} ${P.max === 1 ? 'hradlo' : 'hradlá'})`);
    const gateBtns = ['X', 'Y', 'Z', 'H', 'S', 'T'].map((g) => {
      const b = UI.button(g, () => this.applyGate(g), 'gate');
      b.disabled = !P.gates.includes(g);
      return b;
    });
    this.readout = UI.info('');
    UI.panelSet('Hradlá (rotácie sféry)', [
      UI.row(...gateBtns),
      UI.row(UI.button('↺ Znova', () => this.loadPuzzle(i))),
      this.readout,
      UI.info(`Povolené: ${P.gates.join(', ')}`, 'tip'),
      UI.info('X, Y, Z: 180° okolo osí x, y, z · H: 180° okolo osi (x+z) · S: 90° okolo z · T: 45° okolo z', 'tip'),
    ]);
    this.updReadout();
  }

  applyGate(g) {
    if (this.anim || this.solved) return;
    const P = BLOCH_PUZZLES[this.pi];
    if (this.moves >= P.max) { UI.toast('Minul si povolený počet hradiel — skús ↺ Znova.'); return; }
    const [axis, ang] = GateAxis[g];
    this.anim = { v0: Q.bloch(this.psi), axis: V3.norm(axis), ang, t: 0, g };
    this.psi = Q.apply(Gate[g], this.psi);
    this.moves++;
  }

  onAnimDone() {
    this.updReadout();
    const P = BLOCH_PUZZLES[this.pi];
    if (Q.fidelity(this.psi, Q.named(P.to)) > 0.999) {
      this.solved = true;
      this.grant(P.grant);
      this.say([`✅ ${P.msg}`], () => {
        if (this.pi === 2) {
          this.ask({ q: 'Stavy |+⟩ a |−⟩ majú rovnaké P(0) = P(1) = ½. Sú to rovnaké stavy?', options: ['Nie — líšia sa relatívnou fázou a meranie v X-báze ich rozlíši naisto', 'Áno — rovnaké pravdepodobnosti = rovnaký stav', 'Áno, líšia sa len globálnou fázou'], correct: 0,
            why: 'Rovnaké štatistiky v jednej báze ešte neznamenajú rovnaký stav. Sú dokonca ortogonálne!' }, () => this.advance());
        } else this.advance();
      });
    } else if (this.moves >= P.max) UI.toast('Ešte to nie je ono. Klikni ↺ Znova a skús iné poradie.');
  }
  advance() { if (this.pi + 1 < BLOCH_PUZZLES.length) this.loadPuzzle(this.pi + 1); else this.next(); }

  updReadout() {
    if (!this.readout) return;
    const v = Q.bloch(this.psi), [p0, p1] = Q.probs(this.psi);
    const th = Math.acos(clamp(v[2], -1, 1)), ph = Math.atan2(v[1], v[0]);
    const raw = Q.ketString(this.psi, false), can = Q.ketString(this.psi, true);
    this.readout.innerHTML = `<b>|ψ⟩ = ${raw}</b>` + (raw !== can ? `<br>∼ ${can} <small>(až na globálnu fázu)</small>` : '')
      + `<br>P(0) = |α|² = ${Fmt.num(p0, 2)}, P(1) = |β|² = ${Fmt.num(p1, 2)}`
      + `<br>θ = ${Fmt.angle(th)}${Math.abs(Math.sin(th)) > 1e-3 ? ', φ = ' + Fmt.angle((ph + 2 * Math.PI) % (2 * Math.PI)) : ''}`
      + (this.moves !== undefined && this.step !== 'measure' ? `<br>Použité hradlá: ${this.moves}` : '');
  }

  // ---------- meranie ----------
  measure() {
    this.step = 'measure';
    this.psi = Q.named('+'); this.trail = []; this.hist = null; this.f.m1 = this.f.m100 = false;
    this.quest('Priprav |+⟩ a zmeraj ho: raz (1×) a potom na 100 kópiách.');
    this.say([
      'Posledná lekcia: <b>meranie</b>. Šípka obsahuje veľa informácie (θ aj φ). Koľko z nej dostaneš jedným meraním?',
      'Klikni <b>Meraj 1×</b> na stav |+⟩. Potom <b>Meraj 100 kópií</b> — tie isté prípravy, nezávislé merania.',
    ]);
    this.readout = UI.info('');
    UI.panelSet('Meranie v Z-báze', [
      UI.row(UI.button('Priprav |+⟩', () => { this.psi = Q.named('+'); this.updReadout(); }), UI.button('Priprav |+i⟩', () => { this.psi = Q.named('+i'); this.updReadout(); })),
      UI.row(UI.button('Meraj 1×', () => this.measureOnce(), 'big'), UI.button('Meraj 100 kópií', () => this.measureMany())),
      this.readout,
    ]);
    this.updReadout();
  }
  measureOnce() {
    const p0 = Q.probs(this.psi)[0], out = rand() < p0 ? 0 : 1;
    this.psi = out ? Q.ket1() : Q.ket0();
    this.updReadout();
    UI.toast(`Výsledok: <b>${out}</b> → stav je teraz |${out}⟩ (pôvodná fáza je stratená)`);
    if (!this.f.m1) { this.f.m1 = true; this.checkMeasure(); }
  }
  measureMany() {
    const p0 = Q.probs(this.psi)[0];
    let n0 = 0;
    for (let i = 0; i < 100; i++) if (rand() < p0) n0++;
    this.hist = [n0, 100 - n0];
    UI.toast(`100 kópií: 0 → ${n0}×, 1 → ${100 - n0}×`);
    if (!this.f.m100) { this.f.m100 = true; this.checkMeasure(); }
  }
  checkMeasure() {
    if (!(this.f.m1 && this.f.m100) || this.f.mdone) return;
    this.f.mdone = true;
    this.ask({ q: 'Čo nám dalo JEDNO meranie qubitu?', options: ['jeden bit (0 alebo 1) a stav sa zmenil na |0⟩ alebo |1⟩', 'hodnoty α a β', 'uhly θ a φ'], correct: 0,
      why: 'Jedno meranie = jeden bit. Pravdepodobnosti zistíš až zo <b>štatistiky mnohých rovnako pripravených kópií</b>. A fázu φ len meraním v inej báze. (Skús: |+⟩ a |+i⟩ dajú v Z-báze rovnakú štatistiku!)' }, () => this.next());
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
    const P = this.step !== 'measure' ? BLOCH_PUZZLES[this.pi] : null;
    if (this.anim) {
      const ax = qToWorld(this.anim.axis);
      r.rod(V3.scale(ax, -2.6), V3.scale(ax, 2.6), [1, 1, 0.5], 0.02, { emissive: 0.6 });
      UI.label('gate', V3.scale(ax, 2.9), 'os ' + this.anim.g, 'prompt');
    }
    Bloch.draw(r, [0, 0, 0], 2, v, { target: P ? Q.bloch(Q.named(P.to)) : null, trail: this.trail, labelFn: UI.label.bind(UI), key: 'b', axisNames: true });
    UI.label('psi', V3.scale(qToWorld(v), 2.35), 'ψ', 'player');
    if (this.hist) {
      for (let k = 0; k < 2; k++) {
        const h = this.hist[k] / 100 * 3;
        r.draw('cylinder', M4.trs([3.6 + k * 0.9, -2.6, 0], 0, [0.3, Math.max(h, 0.01), 0.3]), k ? [1, 0.5, 0.5] : [0.5, 0.7, 1], { emissive: 0.3 });
        UI.label('h' + k, [3.6 + k * 0.9, -2.3 + h, 0], `${k}: ${this.hist[k]}×`, 'axis');
      }
    }
  }
}
