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
    this.quest('Vypočuj si Bella a Einsteina');
    this.say([
      'Dobrý deň, som John Bell z CERN. Vitaj na <b>moste previazanosti</b>. Vľavo stojí <b>Alica</b> so svojím qubitom, vpravo <b>Bob</b>.',
      { ...this.E, text: 'A ja som Einstein. Roku 1935 sme s Podolským a Rosenom tvrdili, že kvantová mechanika je <b>neúplná</b>. Ak niečo na diaľku predpoviem s istotou, musí to byť „prvok reality“ vopred! Žiadne <i>spukhafte Fernwirkung</i> — strašidelné pôsobenie na diaľku.' },
      'V roku 1964 som ukázal, ako sa dá tento spor <b>rozhodnúť experimentom</b>. Najprv však musíš vyrobiť previazaný pár.',
    ], () => this.next());
  }

  build() {
    this.psi = Q2.zero();
    this.quest('Vyrob Bellov stav |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 z |00⟩.');
    const A = (U, q, n) => UI.button(n, () => { this.psi = Q2.apply1(U, q, this.psi); this.after(); });
    this.read = UI.info('');
    UI.panelSet('Dva qubity', [
      UI.row(A(Gate.H, 0, 'H na A'), A(Gate.X, 0, 'X na A')),
      UI.row(A(Gate.H, 1, 'H na B'), A(Gate.X, 1, 'X na B')),
      UI.row(UI.button('CNOT (A riadi B)', () => { this.psi = Q2.cnot(this.psi); this.after(); }, 'big'), UI.button('Reset |00⟩', () => { this.psi = Q2.zero(); this.after(); })),
      this.read,
      UI.info('CNOT: ak je A v |1⟩, preklopí B. V NMR sa realizuje cez J-väzbu medzi jadrami.', 'tip'),
    ]);
    this.after();
  }
  after() {
    const rA = Q2.reducedBloch(this.psi, 0), rB = Q2.reducedBloch(this.psi, 1);
    if (this.read) this.read.innerHTML = `<b>|Ψ⟩ = ${Q2.ketString(this.psi)}</b><br>dĺžka šípky A: ${Fmt.num(V3.len(rA), 2)}, B: ${Fmt.num(V3.len(rB), 2)}`
      + (Q2.entangled(this.psi) ? '<br>🔗 <b>previazané</b>' : '<br>produktový stav (každý qubit má vlastnú šípku)');
    if (this.stepIdx === 1 && !this.flags.b && C.abs2(this.psi.reduce((s, c, i) => C.add(s, C.mul(C.conj(this.bell()[i]), c)), C.of(0))) > 0.999) {
      this.flags.b = true;
      this.grant(['cnot', 'phiplus', 'entangle']);
      this.say(['Výborne! Teraz sa pozri na Blochove sféry: <b>obe šípky zmizli do stredu</b>.',
        'Celok |Φ⁺⟩ je čistý stav, ale <b>každý qubit sám o sebe nemá vlastný stav</b> — je maximálne zmiešaný. Informácia nie je „v Alici“ ani „v Bobovi“, je v <b>koreláciách</b>. To je previazanosť: celok je viac než súčet častí.'], () => this.next());
    }
  }

  noSignal() {
    this.psi = this.bell(); this.basis = { A: 0, B: 0 }; this.tab = null;
    this.quest('Meraj páry v zostavách (Alica Z, Bob Z) a (Alica X, Bob Z). Sleduj, čo vidí Bob SÁM.');
    this.read = UI.info('');
    const pick = (who) => {
      const s = el('select');
      for (const [v, t] of [[0, 'meria Z'], [90, 'meria X']]) { const o = el('option', null, `${who} ${t}`); o.value = v; s.appendChild(o); }
      s.value = this.basis[who[0]]; s.onchange = () => { this.basis[who[0]] = +s.value; };
      return s;
    };
    UI.panelSet('Meranie previazaných párov', [UI.row(pick('Alica'), pick('Bob')), UI.button('Meraj 200 párov', () => this.measurePairs(200), 'big'), this.read]);
  }
  measurePairs(n) {
    const tA = this.basis.A * Math.PI / 180, tB = this.basis.B * Math.PI / 180, c = [0, 0, 0, 0];
    let last;
    for (let i = 0; i < n; i++) { last = Q2.sample(this.bell(), tA, tB); c[last[0] * 2 + last[1]]++; }
    this.lamp = last;
    const same = (c[0] + c[3]) / n, bob0 = (c[0] + c[2]) / n, nm = (d) => (d === 0 ? 'Z' : 'X');
    this.read.innerHTML = `Alica ${nm(this.basis.A)}, Bob ${nm(this.basis.B)}:<br>00: ${c[0]}, 01: ${c[1]}, 10: ${c[2]}, 11: ${c[3]}<br>`
      + `<b>rovnaké výsledky: ${Fmt.pct(same)}</b><br>Bob sám: 0 → ${Fmt.pct(bob0)}, 1 → ${Fmt.pct(1 - bob0)}`;
    if (this.basis.A === 0 && this.basis.B === 0) this.flags.zz = true;
    if (this.basis.A === 90 && this.basis.B === 0) this.flags.xz = true;
    if (this.flags.zz && this.flags.xz && !this.flags.ns) {
      this.flags.ns = true;
      this.grant(['nosignal', 'einstein']);
      setTimeout(() => this.say([
        { ...this.E, text: 'Pri Z–Z sú výsledky <b>vždy rovnaké</b>! Hovoril som to: hodnoty museli byť určené vopred, ako dve rukavice v dvoch krabiciach.' },
        'Možno. Ale všimni si Boba: nech Alica meria Z alebo X, Bob vidí <b>stále 50 : 50</b>. Alica mu takto <b>nemôže poslať správu</b> — korelácie uvidia až po porovnaní výsledkov obyčajným (klasickým, pomalším) kanálom.',
        'A o rukaviciach rozhodne hra. Poďme na to!',
      ], () => this.next()), 300);
    }
  }

  chsh() {
    this.showAxes = true;
    this.quest('CHSH hra: nastav uhly meraní tak, aby tím vyhral viac ako 80 % kôl (klasicky najviac 75 %).');
    this.say([
      'Pravidlá <b>CHSH hry</b>: rozhodca pošle Alici náhodný bit x a Bobovi náhodný bit y. Bez komunikácie odpovedia bitmi a, b.',
      'Vyhrávajú, ak <b>a ⊕ b = x · y</b>: teda majú odpovedať <b>rovnako</b>, okrem prípadu x = y = 1, keď majú odpovedať <b>rôzne</b>.',
      { ...this.E, text: 'Ak majú „rukavice“ — vopred dohodnuté odpovede (lokálne skryté premenné) — nikdy neprekročia <b>75 %</b>. To je Bellova nerovnosť.' },
      'S previazaným párom si Alica podľa x vyberie uhol merania a₀ alebo a₁, Bob podľa y uhol b₀ alebo b₁. Skús nájsť uhly, ktoré prekonajú 75 %!',
    ], () => {
      this.read = UI.info('');
      const sl = (k, label) => UI.slider(label, -90, 180, 7.5, this.ang[k], (v) => { this.ang[k] = v; return v + '°'; });
      UI.panelSet('CHSH hra', [sl('a0', 'Alica, x=0: a₀'), sl('a1', 'Alica, x=1: a₁'), sl('b0', 'Bob, y=0: b₀'), sl('b1', 'Bob, y=1: b₁'),
        UI.row(UI.button('Hraj 400 kôl', () => this.play(), 'big'), UI.button('Klasicky (vždy 0)', () => this.playClassic())),
        UI.button('💡 Nápoveda', () => UI.toast('Skús a₀ = 0°, a₁ = 90°, b₀ = 45°, b₁ = −45°. Rozdiely uhlov 45° (a 135° pre x=y=1).', 6000)),
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
    this.read.innerHTML = `Kvantová stratégia: <b>${Fmt.pct(p)}</b> výhier (${win}/400)<br>Bellova (klasická) hranica: 75 %`;
    if (p > 0.8 && !this.flags.chsh) {
      this.flags.chsh = true;
      this.grant(['bell', 'chsh']);
      this.say([`${Fmt.pct(p)}! Teoretické maximum je cos²(π/8) ≈ <b>85 %</b>. Toto <b>žiadne rukavice nedokážu</b>.`,
        { ...this.E, text: 'Hmm... Takže buď sa vzdám lokálnosti, alebo predstavy, že hodnoty existujú pred meraním.' },
        'Presne. <b>Bohm</b> volí nelokálnosť (pilotná vlna), operačný prístup (Bohr) opúšťa predexistujúce hodnoty. A pozor: <b>správu</b> ste si stále neposlali. Za experimentálne overenie dostali Aspect, Clauser a Zeilinger Nobelovu cenu 2022.'], () => this.next());
    }
  }
  playClassic() {
    let win = 0;
    for (let i = 0; i < 400; i++) { const x = rand() < 0.5 ? 1 : 0, y = rand() < 0.5 ? 1 : 0; if ((0 ^ 0) === (x & y)) win++; }
    this.read.innerHTML = `Klasická stratégia „vždy 0“: <b>${Fmt.pct(win / 400)}</b> — prehrá len pri x = y = 1.<br>Lepšie to klasicky nejde.`;
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
    const side = [[-4.5, 'Alica', this.rA, 'a'], [4.5, 'Bob', this.rB, 'b']];
    for (const [x, name, vec, key] of side) {
      r.draw('cylinder', M4.trs([x, -1, 0], 0, [2, 1, 2]), [0.35, 0.45, 0.35]);
      r.draw('cylinder', M4.trs([x, 0, 0], 0, [0.15, 0.8, 0.15]), [0.6, 0.6, 0.7]);
      const c = [x, 2.2, 0];
      Bloch.draw(r, c, 1.3, vec, { labelFn: UI.label.bind(UI), key, labels: true });
      UI.label('n' + key, [x, 4.1, 0], name, 'player');
      UI.hot([x, 0.9, 1.4], `<b>Detektor ${name === 'Alica' ? 'Alice' : 'Boba'}</b>: modrá = výsledok 0, červená = 1 (posledný pár).`, 24);
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
      UI.label('link', [0, 2.8, 0], '🔗 korelácie (nie signál!)', 'prompt');
      UI.hot([0, 2.2, 0], TIPS['🔗 korelácie (nie signál!)'], 40);
    }
  }
}
