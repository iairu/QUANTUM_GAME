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
      if (this.mode === 'deco') r = [r[0] * (1 - this.p), r[1] * (1 - this.p), r[2]];
    }
    if (x >= this.X.h2) r = H(r);
    return r;
  }
  P0() { return (1 + this.stateAt(99)[2]) / 2; }

  intro() {
    this.quest(tr('Vypočuj si Feynmana', 'Listen to Feynman'));
    this.say(tr([
      'Hej! Som Dick Feynman. Raz som povedal, že dvojštrbinový pokus obsahuje <b>jediné tajomstvo</b> kvantovej mechaniky. Tu je jeho qubitová verzia.',
      'Koľaj: qubit začne v |0⟩, prejde bránou <b>H</b>, stredom chrámu a druhou bránou <b>H</b>. Na konci ho detektor zmeria: 0 alebo 1.',
      'Prirovnanie: k pokladu vedú <b>dve cesty</b>. Kým nikto nevie, ktorou si šiel, ich amplitúdy sa môžu sčítať aj vyrušiť. Keď to niekto <b>zistí</b> (zmeria), interferencia zmizne — ostanú len obyčajné pravdepodobnosti.',
      'Vzadu vidíš <b>maticu hustoty ρ</b> (ró) ako stĺpce: dva na diagonále = pravdepodobnosti (populácie), dva mimo diagonály = <b>koherencie</b>, „pamäť fázy“.',
    ], [
      'Hey! I’m Dick Feynman. I once said the double-slit experiment contains <b>the only mystery</b> of quantum mechanics. Here is its qubit version.',
      'The track: the qubit starts in |0⟩, passes through gate <b>H</b>, the centre of the temple and a second gate <b>H</b>. At the end a detector measures it: 0 or 1.',
      'An analogy: <b>two paths</b> lead to the treasure. As long as nobody knows which one you took, their amplitudes can add up or cancel. Once someone <b>finds out</b> (measures), the interference disappears — only ordinary probabilities remain.',
      'At the back you see the <b>density matrix ρ</b> (rho) as bars: the two on the diagonal = probabilities (populations), the two off the diagonal = <b>coherences</b>, the “memory of the phase”.',
    ]), () => this.next());
  }

  pure() {
    this.mode = 'none'; this.resetHist();
    this.ask(tr({ q: 'Qubit |0⟩ → H → H → meranie. Čo nameriaš?', options: ['vždy 0', '50 % : 50 %', 'vždy 1'], correct: 0,
      why: 'H·H = I. Príspevky k |1⟩ sa deštruktívne vyrušia, k |0⟩ konštruktívne sčítajú.' }, { q: 'Qubit |0⟩ → H → H → measurement. What do you measure?', options: ['always 0', '50 % : 50 %', 'always 1'], correct: 0,
      why: 'H·H = I. The contributions to |1⟩ cancel destructively, those to |0⟩ add up constructively.' }), () => {
      this.quest(tr('Pošli aspoň 50 qubitov cez H → H (stred chrámu prázdny). Sleduj stĺpce ρ!', 'Send at least 50 qubits through H → H (temple centre empty). Watch the ρ bars!'));
      this.buildPanel(false);
    });
  }

  withMeasure() {
    this.mode = 'meas'; this.resetHist();
    this.ask(tr({ q: 'Teraz do stredu vložíme meranie v Z-báze a jeho výsledok ZABUDNEME. Čo nameriaš na konci?', options: ['50 % : 50 %', 'vždy 0', 'vždy 1'], correct: 0,
      why: 'Meranie zničí koherenciu (mimodiagonálne prvky ρ). Zostane zmes ½|0⟩⟨0| + ½|1⟩⟨1| = I/2 — a tú druhé H nezmení.' }, { q: 'Now we put a Z-basis measurement in the centre and FORGET its result. What do you measure at the end?', options: ['50 % : 50 %', 'always 0', 'always 1'], correct: 0,
      why: 'The measurement destroys the coherence (off-diagonal elements of ρ). What remains is the mixture ½|0⟩⟨0| + ½|1⟩⟨1| = I/2 — and the second H doesn’t change it.' }), () => {
      this.quest(tr('Pošli aspoň 50 qubitov s meraním v strede. Pozri, čo sa stane s mimodiagonálnymi stĺpcami ρ.', 'Send at least 50 qubits with the measurement in the centre. See what happens to the off-diagonal ρ bars.'));
      this.buildPanel(false);
    });
  }

  deco() {
    this.mode = 'deco'; this.p = 0; this.resetHist();
    this.say(tr([
      'Meranie je extrémny prípad. V skutočnom čipe qubit pomaly „uniká“ do prostredia: <b>dekoherencia</b>. Prostredie akoby čiastočne odmeralo fázu.',
      'Posuvníkom nastav silu dekoherencie <b>p</b> (0 = nič, 1 = úplné meranie). Úloha: nájdi p, pri ktorom bude P(0) = <b>75 %</b>, a pošli aspoň 50 qubitov.',
    ], [
      'A measurement is the extreme case. In a real chip the qubit slowly “leaks” into the environment: <b>decoherence</b>. It is as if the environment partly measured the phase.',
      'Use the slider to set the decoherence strength <b>p</b> (0 = nothing, 1 = a full measurement). Task: find p for which P(0) = <b>75 %</b>, and send at least 50 qubits.',
    ]), () => {
      this.quest(tr('Nastav dekoherenciu p tak, aby P(0) = 75 %, a pošli aspoň 50 qubitov.', 'Set the decoherence p so that P(0) = 75 %, and send at least 50 qubits.'));
      this.buildPanel(true);
    });
  }

  resetHist() { this.hist = [0, 0]; this.updInfo && this.updInfo(); }

  buildPanel(withSlider) {
    const nodes = [];
    const names = tr({ none: 'stred prázdny', meas: 'meranie Z (zabudnuté)', deco: 'dekoherencia p' }, { none: 'centre empty', meas: 'Z measurement (forgotten)', deco: 'decoherence p' });
    nodes.push(UI.info(`${tr('Stred chrámu', 'Temple centre')}: <b>${names[this.mode]}</b>`));
    if (withSlider) nodes.push(UI.slider(tr('sila p', 'strength p'), 0, 1, 0.05, this.p, (v) => { if (v !== this.p) { this.p = v; this.resetHist(); } return Fmt.num(v, 2); }));
    nodes.push(UI.row(UI.button(tr('Pošli 1 (pomaly)', 'Send 1 (slowly)'), () => this.sendOne()), UI.button(tr('Pošli 100', 'Send 100'), () => this.sendMany(100), 'big'), UI.button(tr('Vymaž', 'Clear'), () => this.resetHist())));
    const info = UI.info('');
    this.updInfo = () => {
      const n = this.hist[0] + this.hist[1];
      info.innerHTML = `${tr('Detektor', 'Detector')}: <b>0 → ${this.hist[0]}×</b>, <b>1 → ${this.hist[1]}×</b>` + (n ? ` (P(0) ≈ ${Fmt.pct(this.hist[0] / n)})` : '')
        + `<br><small>${tr('teória', 'theory')}: P(0) = ${Fmt.pct(this.P0())}</small>`;
    };
    nodes.push(info);
    nodes.push(UI.info(tr('Stĺpce vzadu: ρ₀₀, ρ₁₁ = populácie; |ρ₀₁| = koherencia.', 'Bars at the back: ρ₀₀, ρ₁₁ = populations; |ρ₀₁| = coherence.'), 'tip'));
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
    if (n < 50) return;
    if (this.stepIdx === 1 && !this.f.a) {
      this.f.a = true;
      this.grant(['feynman', 'coh']);
      this.say([tr('Vidíš? Stále 0. Pozri na ρ cestou: po prvom H sú <b>všetky štyri stĺpce rovnako vysoké</b> — mimodiagonálne koherencie nesú informáciu o fáze a druhé H ich premení na istotu.', 'See? Always 0. Look at ρ along the way: after the first H <b>all four bars are equally tall</b> — the off-diagonal coherences carry the phase information, and the second H turns it into certainty.')], () => this.next());
    } else if (this.stepIdx === 2 && !this.f.b) {
      this.f.b = true;
      this.grant(['rho', 'mix', 'supmix']);
      this.say(tr(['Po meraní mimodiagonálne stĺpce <b>zmizli</b>. Diagonála je rovnaká ako pri superpozícii (½, ½), preto ich <b>meranie v Z-báze nerozlíši</b>. Rozdiel sa ukáže až pri ďalšej operácii.',
        'Na Blochovej sfére: šípka sa stiahla do <b>stredu</b> (maximálne zmiešaný stav I/2). Druhé H otáča guľu, ale bod v strede sa otáčaním nepohne.'], [
        'After the measurement the off-diagonal bars <b>vanished</b>. The diagonal is the same as for the superposition (½, ½), so a <b>measurement in the Z basis cannot tell them apart</b>. The difference shows only in the next operation.',
        'On the Bloch sphere: the arrow shrank to the <b>centre</b> (the maximally mixed state I/2). The second H rotates the ball, but a point at the centre does not move under rotation.']), () => this.next());
    } else if (this.stepIdx === 3 && !this.f.c && this.mode === 'deco' && Math.abs(this.P0() - 0.75) < 0.03) {
      this.f.c = true;
      this.grant(['deco', 'dagger']);
      this.say(tr(['Presne: p = ½ polovične zmršťuje koherencie a P(0) = 1 − p/2 = ¾. Šípka je kratšia než 1 → <b>zmiešaný stav</b> vnútri gule.',
        'Matematicky druhé hradlo pôsobí na maticu hustoty ako <b>HρH†</b> (dýka † = hermitovské združenie). Pre zmes I/2 dostaneš opäť I/2 — nič nezmení.',
        'Poučenie pre kvantové počítače: <b>koherencia je palivo</b> interferencie. Kto ju stratí, stratí výhodu.'], [
        'Exactly: p = ½ halves the coherences and P(0) = 1 − p/2 = ¾. The arrow is shorter than 1 → a <b>mixed state</b> inside the ball.',
        'Mathematically, the second gate acts on the density matrix as <b>HρH†</b> (the dagger † = Hermitian conjugate). For the mixture I/2 you get I/2 again — nothing changes.',
        'The lesson for quantum computers: <b>coherence is the fuel</b> of interference. Lose it and you lose the advantage.']), () => this.next());
    }
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
        UI.toast(`${tr('Detektor', 'Detector')}: ${out}`, 1200);
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
    UI.label('prep', [this.X.prep, 1.3, 0], tr('príprava<br>|0⟩', 'preparation<br>|0⟩'), 'ket');
    if (this.mode === 'meas') {
      r.draw('box', M4.trs([0, 0.9, 0], 0, [0.5, 1.2, 1.4]), [0.9, 0.3, 0.3], { alpha: 0.5 });
      UI.label('mid', [0, 2.1, 0], tr('👁 meranie Z<br><small>výsledok zabudnutý</small>', '👁 Z measurement<br><small>result forgotten</small>'), 'prompt');
    } else if (this.mode === 'deco') {
      for (let i = 0; i < 6; i++) r.sphere([Math.sin(this.t + i) * 0.4, 0.6 + i * 0.15, Math.cos(this.t * 0.7 + i * 2) * 0.5], 0.25 + 0.1 * this.p, [0.7, 0.7, 0.8], { alpha: 0.1 + 0.35 * this.p });
      UI.label('mid', [0, 2.1, 0], `🌫 ${tr('prostredie', 'environment')}<br><small>p = ${Fmt.num(this.p, 2)}</small>`, 'prompt');
    } else UI.label('mid', [0, 2.1, 0], tr('(prázdne)', '(empty)'), 'axis');
    // detektor
    for (let k = 0; k < 2; k++) {
      const p = [this.X.det + 0.3, 0.5, k ? 0.6 : -0.6];
      r.draw('box', M4.trs(p, 0, 0.5), k ? [1, 0.45, 0.45] : [0.45, 0.65, 1], { emissive: 0.2 + this.flash[k] });
      UI.hot(p, tr(`<b>Detektor výsledku ${k}</b> — meranie v Z-báze na konci koľaje.`, `<b>Detector for outcome ${k}</b> — a Z-basis measurement at the end of the track.`), 30);
      const n = this.hist[0] + this.hist[1], h = n ? this.hist[k] / n * 2.5 : 0;
      r.draw('cylinder', M4.trs([this.X.det + 1.3, 0, k ? 0.6 : -0.6], 0, [0.22, Math.max(h, 0.01), 0.22]), k ? [1, 0.45, 0.45] : [0.45, 0.65, 1]);
      UI.label('d' + k, [this.X.det + 1.3, h + 0.4, k ? 0.6 : -0.6], `${k}: ${this.hist[k]}`, 'axis');
    }
    // putujúci qubit s malou Blochovou sférou
    const qx = this.shot ? this.shot.x : this.X.det - 0.6;
    r.sphere([qx, 0.45, 0], 0.22, [0.3, 0.95, 1], { emissive: 0.8 });
    Bloch.draw(r, [qx, 2.0, 0.0], 0.7, this.shownR, {});
    UI.hot([qx, 0.45, 0], tr('<b>Qubit</b> putujúci koľajou. Nad ním je jeho Blochova sféra.', '<b>Qubit</b> travelling along the track. Above it is its Bloch sphere.'), 25);
    UI.label('qb', [qx, 3.0, 0], this.shot ? 'ψ' : tr('stav na konci', 'final state'), 'player');
    // matica hustoty ako stĺpce
    const R = this.shownR, rho = [[(1 + R[2]) / 2, Math.hypot(R[0], R[1]) / 2], [Math.hypot(R[0], R[1]) / 2, (1 - R[2]) / 2]];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const p = [-1 + j * 2, 0, -3.6 + i * 1.6], h = rho[i][j] * 3, diag = i === j;
      r.draw('box', M4.trs(V3.add(p, [0, 0.02, 0]), 0, [1.4, 0.04, 1.2]), [0.3, 0.3, 0.4]);
      r.draw('box', M4.trs(V3.add(p, [0, h / 2, 0]), 0, [0.6, Math.max(h, 0.01), 0.6]), diag ? [0.45, 0.65, 1] : [0.9, 0.5, 1], { emissive: diag ? 0.1 : 0.4 });
      UI.hot(V3.add(p, [0, h / 2 + 0.1, 0]), diag ? tr(`<b>ρ<sub>${i}${i}</sub></b> — populácia: pravdepodobnosť výsledku ${i}.`, `<b>ρ<sub>${i}${i}</sub></b> — population: probability of outcome ${i}.`) : tr('<b>|ρ₀₁|</b> — koherencia: „pamäť“ relatívnej fázy. Bez nej niet interferencie.', '<b>|ρ₀₁|</b> — coherence: the “memory” of the relative phase. Without it there is no interference.'), 34);
      UI.label(`rho${i}${j}`, V3.add(p, [0, h + 0.35, 0]), `${diag ? 'ρ' : '|ρ'}<sub>${i}${j}</sub>${diag ? '' : '|'} = ${Fmt.num(rho[i][j], 2)}`, 'axis');
    }
    UI.label('rhoT', [3, 0.8, -3], tr('matica hustoty ρ', 'density matrix ρ'), 'axis');
  }
}
