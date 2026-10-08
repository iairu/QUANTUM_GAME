'use strict';
// LEVEL 7 — Bellov most previazanosti (mentor: John Stewart Bell, hosť: Albert Einstein)
// Tvorba Bellovho stavu (H + CNOT), redukované stavy v strede gule, nemožnosť signalizácie, CHSH hra.

class L7Bell extends Level {
  get steps() { return [this.intro, this.build, this.noSignal, this.chsh]; }

  setup() {
    this.cam = new OrbitCam([0, 1.8, 0], 11, 0, 0.3, 5, 20);
    this.psi = Q2.zero(); this.rA = [0, 0, 1]; this.rB = [0, 0, 1]; this.lamp = [null, null];
    this.ang = { a0: 0, a1: 90, b0: 0, b1: 90 }; this.showAxes = false; this.flags = {};
  }
  bell() { return [C.of(s2), C.of(0), C.of(0), C.of(s2)]; }
  get E() { return { who: 'Albert Einstein', face: '👴' }; }

  intro() {
    this.quest(tr('Vypočuj si Bella a Einsteina', 'Listen to Bell and Einstein'));
    this.say(tr([
      'Dobrý deň, som John Bell z CERN. Vitaj na <b>moste previazanosti</b>. Vľavo stojí <b>Alica</b> so svojím qubitom, vpravo <b>Bob</b>.',
      { ...this.E, text: 'A ja som Einstein. Roku 1935 sme s Podolským a Rosenom tvrdili, že kvantová mechanika je <b>neúplná</b>. Ak niečo na diaľku predpoviem s istotou, musí to byť „prvok reality“ vopred! Žiadne <i>spukhafte Fernwirkung</i> — strašidelné pôsobenie na diaľku.' },
      'V roku 1964 som ukázal, ako sa dá tento spor <b>rozhodnúť experimentom</b>. Najprv však musíš vyrobiť previazaný pár.',
    ], [
      'Good day, I am John Bell from CERN. Welcome to the <b>bridge of entanglement</b>. On the left stands <b>Alice</b> with her qubit, on the right <b>Bob</b>.',
      { ...this.E, text: 'And I am Einstein. In 1935, with Podolsky and Rosen, we argued that quantum mechanics is <b>incomplete</b>. If I can predict something at a distance with certainty, it must be an “element of reality” beforehand! No <i>spukhafte Fernwirkung</i> — spooky action at a distance.' },
      'In 1964 I showed how this dispute can be <b>settled by experiment</b>. But first you have to make an entangled pair.',
    ]), () => this.next());
  }

  build() {
    this.psi = Q2.zero();
    this.quest(tr('Vyrob Bellov stav |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 z |00⟩.', 'Make the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 from |00⟩.'));
    const A = (U, q, n) => UI.button(n, () => { this.psi = Q2.apply1(U, q, this.psi); this.after(); });
    this.read = UI.info('');
    UI.panelSet(tr('Dva qubity', 'Two qubits'), [
      UI.row(A(Gate.H, 0, tr('H na A', 'H on A')), A(Gate.X, 0, tr('X na A', 'X on A'))),
      UI.row(A(Gate.H, 1, tr('H na B', 'H on B')), A(Gate.X, 1, tr('X na B', 'X on B'))),
      UI.row(UI.button(tr('CNOT (A riadi B)', 'CNOT (A controls B)'), () => { this.psi = Q2.cnot(this.psi); this.after(); }, 'big'), UI.button('Reset |00⟩', () => { this.psi = Q2.zero(); this.after(); })),
      this.read,
      UI.info(tr('CNOT: ak je A v |1⟩, preklopí B. V NMR sa realizuje cez J-väzbu medzi jadrami.', 'CNOT: if A is |1⟩, it flips B. In NMR it is implemented via the J-coupling between nuclei.'), 'tip'),
    ]);
    this.after();
  }
  after() {
    const rA = Q2.reducedBloch(this.psi, 0), rB = Q2.reducedBloch(this.psi, 1);
    if (this.read) this.read.innerHTML = `<b>|Ψ⟩ = ${Q2.ketString(this.psi)}</b><br>${tr('dĺžka šípky A', 'arrow length A')}: ${Fmt.num(V3.len(rA), 2)}, B: ${Fmt.num(V3.len(rB), 2)}`
      + (Q2.entangled(this.psi) ? tr('<br>🔗 <b>previazané</b>', '<br>🔗 <b>entangled</b>') : tr('<br>produktový stav (každý qubit má vlastnú šípku)', '<br>product state (each qubit has its own arrow)'));
    if (this.stepIdx === 1 && !this.flags.b && C.abs2(this.psi.reduce((s, c, i) => C.add(s, C.mul(C.conj(this.bell()[i]), c)), C.of(0))) > 0.999) {
      this.flags.b = true;
      this.grant(['cnot', 'phiplus', 'entangle']);
      this.say(tr(['Výborne! Teraz sa pozri na Blochove sféry: <b>obe šípky zmizli do stredu</b>.',
        'Celok |Φ⁺⟩ je čistý stav, ale <b>každý qubit sám o sebe nemá vlastný stav</b> — je maximálne zmiešaný. Informácia nie je „v Alici“ ani „v Bobovi“, je v <b>koreláciách</b>. To je previazanosť: celok je viac než súčet častí.'], [
        'Excellent! Now look at the Bloch spheres: <b>both arrows vanished into the centre</b>.',
        'The whole |Φ⁺⟩ is a pure state, but <b>neither qubit on its own has a state of its own</b> — each is maximally mixed. The information is neither “in Alice” nor “in Bob”, it is in the <b>correlations</b>. That is entanglement: the whole is more than the sum of its parts.']), () => this.next());
    }
  }

  noSignal() {
    this.psi = this.bell(); this.basis = { A: 0, B: 0 }; this.tab = null;
    this.quest(tr('Meraj páry v zostavách (Alica Z, Bob Z) a (Alica X, Bob Z). Sleduj, čo vidí Bob SÁM.', 'Measure pairs in the setups (Alice Z, Bob Z) and (Alice X, Bob Z). Watch what Bob sees ON HIS OWN.'));
    this.read = UI.info('');
    const pick = (who) => {
      const s = el('select');
      for (const [v, t] of [[0, tr('meria Z', 'measures Z')], [90, tr('meria X', 'measures X')]]) { const o = el('option', null, `${who} ${t}`); o.value = v; s.appendChild(o); }
      s.value = this.basis[who[0]]; s.onchange = () => { this.basis[who[0]] = +s.value; }; // kľúč A/B = prvé písmeno mena
      return s;
    };
    UI.panelSet(tr('Meranie previazaných párov', 'Measuring entangled pairs'), [UI.row(pick(tr('Alica', 'Alice')), pick('Bob')), UI.button(tr('Meraj 200 párov', 'Measure 200 pairs'), () => this.measurePairs(200), 'big'), this.read]);
  }
  measurePairs(n) {
    const tA = this.basis.A * Math.PI / 180, tB = this.basis.B * Math.PI / 180, c = [0, 0, 0, 0];
    let last;
    for (let i = 0; i < n; i++) { last = Q2.sample(this.bell(), tA, tB); c[last[0] * 2 + last[1]]++; }
    this.lamp = last;
    const same = (c[0] + c[3]) / n, bob0 = (c[0] + c[2]) / n, nm = (d) => (d === 0 ? 'Z' : 'X');
    this.read.innerHTML = `${tr('Alica', 'Alice')} ${nm(this.basis.A)}, Bob ${nm(this.basis.B)}:<br>00: ${c[0]}, 01: ${c[1]}, 10: ${c[2]}, 11: ${c[3]}<br>`
      + `<b>${tr('rovnaké výsledky', 'equal outcomes')}: ${Fmt.pct(same)}</b><br>${tr('Bob sám', 'Bob alone')}: 0 → ${Fmt.pct(bob0)}, 1 → ${Fmt.pct(1 - bob0)}`;
    if (this.basis.A === 0 && this.basis.B === 0) this.flags.zz = true;
    if (this.basis.A === 90 && this.basis.B === 0) this.flags.xz = true;
    if (this.flags.zz && this.flags.xz && !this.flags.ns) {
      this.flags.ns = true;
      this.grant(['nosignal', 'einstein']);
      setTimeout(() => this.say(tr([
        { ...this.E, text: 'Pri Z–Z sú výsledky <b>vždy rovnaké</b>! Hovoril som to: hodnoty museli byť určené vopred, ako dve rukavice v dvoch krabiciach.' },
        'Možno. Ale všimni si Boba: nech Alica meria Z alebo X, Bob vidí <b>stále 50 : 50</b>. Alica mu takto <b>nemôže poslať správu</b> — korelácie uvidia až po porovnaní výsledkov obyčajným (klasickým, pomalším) kanálom.',
        'A o rukaviciach rozhodne hra. Poďme na to!',
      ], [
        { ...this.E, text: 'With Z–Z the outcomes are <b>always the same</b>! I told you: the values must have been fixed in advance, like two gloves in two boxes.' },
        'Perhaps. But look at Bob: whether Alice measures Z or X, Bob sees <b>50 : 50 every time</b>. This way Alice <b>cannot send him a message</b> — they see the correlations only after comparing results over an ordinary (classical, slower) channel.',
        'And a game will decide about the gloves. Let’s go!',
      ]), () => this.next()), 300);
    }
  }

  chsh() {
    this.showAxes = true;
    this.quest(tr('CHSH hra: nastav uhly meraní tak, aby tím vyhral viac ako 80 % kôl (klasicky najviac 75 %).', 'CHSH game: set the measurement angles so that the team wins more than 80 % of rounds (classically at most 75 %).'));
    this.say(tr([
      'Pravidlá <b>CHSH hry</b>: rozhodca pošle Alici náhodný bit x a Bobovi náhodný bit y. Bez komunikácie odpovedia bitmi a, b.',
      'Vyhrávajú, ak <b>a ⊕ b = x · y</b>: teda majú odpovedať <b>rovnako</b>, okrem prípadu x = y = 1, keď majú odpovedať <b>rôzne</b>.',
      { ...this.E, text: 'Ak majú „rukavice“ — vopred dohodnuté odpovede (lokálne skryté premenné) — nikdy neprekročia <b>75 %</b>. To je Bellova nerovnosť.' },
      'S previazaným párom si Alica podľa x vyberie uhol merania a₀ alebo a₁, Bob podľa y uhol b₀ alebo b₁. Skús nájsť uhly, ktoré prekonajú 75 %!',
    ], [
      'The rules of the <b>CHSH game</b>: the referee sends Alice a random bit x and Bob a random bit y. Without communicating, they answer with bits a, b.',
      'They win if <b>a ⊕ b = x · y</b>: so they should answer <b>the same</b>, except when x = y = 1, when they should answer <b>differently</b>.',
      { ...this.E, text: 'If they have “gloves” — answers agreed in advance (local hidden variables) — they never exceed <b>75 %</b>. That is Bell’s inequality.' },
      'With an entangled pair, Alice picks the measurement angle a₀ or a₁ depending on x, and Bob picks b₀ or b₁ depending on y. Try to find angles that beat 75 %!',
    ]), () => {
      this.read = UI.info('');
      const sl = (k, label) => UI.slider(label, -90, 180, 7.5, this.ang[k], (v) => { this.ang[k] = v; return v + '°'; });
      UI.panelSet(tr('CHSH hra', 'CHSH game'), [sl('a0', tr('Alica, x=0: a₀', 'Alice, x=0: a₀')), sl('a1', tr('Alica, x=1: a₁', 'Alice, x=1: a₁')), sl('b0', 'Bob, y=0: b₀'), sl('b1', 'Bob, y=1: b₁'),
        UI.row(UI.button(tr('Hraj 400 kôl', 'Play 400 rounds'), () => this.play(), 'big'), UI.button(tr('Klasicky (vždy 0)', 'Classically (always 0)'), () => this.playClassic())),
        UI.button(tr('💡 Nápoveda', '💡 Hint'), () => UI.toast(tr('Skús a₀ = 0°, a₁ = 90°, b₀ = 45°, b₁ = −45°. Rozdiely uhlov 45° (a 135° pre x=y=1).', 'Try a₀ = 0°, a₁ = 90°, b₀ = 45°, b₁ = −45°. Angle differences of 45° (and 135° for x=y=1).'), 6000)),
        this.read]);
    });
  }
  play() {
    const d = (x) => x * Math.PI / 180, phi = this.bell();
    let win = 0;
    for (let i = 0; i < 400; i++) {
      const x = rand() < 0.5 ? 1 : 0, y = rand() < 0.5 ? 1 : 0;
      const [a, b] = Q2.sample(phi, d(x ? this.ang.a1 : this.ang.a0), d(y ? this.ang.b1 : this.ang.b0));
      if ((a ^ b) === (x & y)) win++;
    }
    const p = win / 400;
    this.read.innerHTML = tr(`Kvantová stratégia: <b>${Fmt.pct(p)}</b> výhier (${win}/400)<br>Bellova (klasická) hranica: 75 %`, `Quantum strategy: <b>${Fmt.pct(p)}</b> wins (${win}/400)<br>Bell (classical) bound: 75 %`);
    if (p > 0.8 && !this.flags.chsh) {
      this.flags.chsh = true;
      this.grant(['bell', 'chsh']);
      this.say(tr([`${Fmt.pct(p)}! Teoretické maximum je cos²(π/8) ≈ <b>85 %</b>. Toto <b>žiadne rukavice nedokážu</b>.`,
        { ...this.E, text: 'Hmm... Takže buď sa vzdám lokálnosti, alebo predstavy, že hodnoty existujú pred meraním.' },
        'Presne. <b>Bohm</b> volí nelokálnosť (pilotná vlna), operačný prístup (Bohr) opúšťa predexistujúce hodnoty. A pozor: <b>správu</b> ste si stále neposlali. Za experimentálne overenie dostali Aspect, Clauser a Zeilinger Nobelovu cenu 2022.'], [
        `${Fmt.pct(p)}! The theoretical maximum is cos²(π/8) ≈ <b>85 %</b>. <b>No gloves can do this</b>.`,
        { ...this.E, text: 'Hmm... So either I give up locality, or the idea that values exist before the measurement.' },
        'Exactly. <b>Bohm</b> chooses non-locality (the pilot wave), the operational approach (Bohr) gives up pre-existing values. And note: you still haven’t sent each other a <b>message</b>. Aspect, Clauser and Zeilinger received the 2022 Nobel Prize for the experimental confirmation.']), () => this.next());
    }
  }
  playClassic() {
    let win = 0;
    for (let i = 0; i < 400; i++) { const x = rand() < 0.5 ? 1 : 0, y = rand() < 0.5 ? 1 : 0; if ((0 ^ 0) === (x & y)) win++; }
    this.read.innerHTML = tr(`Klasická stratégia „vždy 0“: <b>${Fmt.pct(win / 400)}</b> — prehrá len pri x = y = 1.<br>Lepšie to klasicky nejde.`, `Classical strategy “always 0”: <b>${Fmt.pct(win / 400)}</b> — it loses only when x = y = 1.<br>Classically you cannot do better.`);
  }

  update(dt) {
    this.t += dt;
    const k = Math.min(1, dt * 5);
    this.rA = V3.lerp(this.rA, Q2.reducedBloch(this.psi, 0), k);
    this.rB = V3.lerp(this.rB, Q2.reducedBloch(this.psi, 1), k);
  }

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -0.4, 0], 0, 60), [0.06, 0.16, 0.35], { pattern: 2 });
    const side = [[-4.5, tr('Alica', 'Alice'), this.rA, 'a'], [4.5, 'Bob', this.rB, 'b']];
    for (const [x, name, vec, key] of side) {
      r.draw('cylinder', M4.trs([x, -1, 0], 0, [2, 1, 2]), [0.35, 0.45, 0.35]);
      r.draw('cylinder', M4.trs([x, 0, 0], 0, [0.15, 0.8, 0.15]), [0.6, 0.6, 0.7]);
      const c = [x, 2.2, 0];
      Bloch.draw(r, c, 1.3, vec, { labelFn: UI.label.bind(UI), key, labels: true });
      UI.label('n' + key, [x, 4.1, 0], name, 'player');
      UI.hot([x, 0.9, 1.4], tr(`<b>Detektor ${key === 'a' ? 'Alice' : 'Boba'}</b>: modrá = výsledok 0, červená = 1 (posledný pár).`, `<b>${key === 'a' ? 'Alice’s' : 'Bob’s'} detector</b>: blue = outcome 0, red = 1 (last pair).`), 24);
      if (this.showAxes) {
        const angs = key === 'a' ? [this.ang.a0, this.ang.a1] : [this.ang.b0, this.ang.b1];
        angs.forEach((a, i) => {
          const t = a * Math.PI / 180, d = qToWorld([Math.sin(t), 0, Math.cos(t)]);
          r.rod(V3.sub(c, V3.scale(d, 1.5)), V3.add(c, V3.scale(d, 1.5)), i ? [1, 0.6, 0.2] : [0.3, 1, 0.6], 0.025, { emissive: 0.5 });
          UI.label(key + 'ax' + i, V3.add(c, V3.scale(d, 1.75)), (key === 'a' ? 'a' : 'b') + (i ? '₁' : '₀'), 'axis');
        });
      }
      const res = this.lamp[key === 'a' ? 0 : 1];
      r.sphere([x, 0.9, 1.4], 0.22, res === null ? [0.3, 0.3, 0.3] : res ? [1, 0.4, 0.4] : [0.4, 0.6, 1], { emissive: res === null ? 0 : 0.8 });
    }
    if (Q2.entangled(this.psi)) {
      const pulse = 0.25 + 0.2 * Math.sin(this.t * 4);
      r.rod([-3.2, 2.2, 0], [3.2, 2.2, 0], [1, 0.45, 0.75], 0.08, { alpha: pulse, emissive: 1 });
      const link = tr('🔗 korelácie (nie signál!)', '🔗 correlations (not a signal!)');
      UI.label('link', [0, 2.8, 0], link, 'prompt');
      UI.hot([0, 2.2, 0], TIPS[link], 40);
    }
  }
}
