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
  get E() { return { who: tr('Albert Einstein', 'Albert Einstein', 'Альберт Ейнштейн'), face: '👴' }; }

  intro() {
    this.quest(tr('Vypočuj si Bella a Einsteina', 'Listen to Bell and Einstein', 'Послухай Белла та Ейнштейна'), { easy: tr('💬 Bell & Einstein', '💬 Bell & Einstein', '💬 Белл & Ейнштейн'), hard: tr('EPR 1935 vs. Bell 1964', 'EPR 1935 vs. Bell 1964', 'ЕПР 1935 проти Белла 1964') });
    this.say([
      DL('l7.intro.1.0'),
      { ...this.E, text: DL('l7.intro.1.1.text') },
      DL('l7.intro.1.2'),
    ], () => this.next());
  }

  build() {
    this.psi = Q2.zero();
    this.quest(tr('Vyrob Bellov stav |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 z |00⟩.', 'Make the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 from |00⟩.', 'Створи стан Белла |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 із |00⟩.'), { easy: tr('🔗 |00⟩ → Bellov stav', '🔗 |00⟩ → Bell state', '🔗 |00⟩ → стан Белла'), hard: '|00⟩ → (|00⟩+|11⟩)/√2 · {H, X, CNOT}' });
    const A = (U, q, n) => UI.button(n, () => { this.psi = Q2.apply1(U, q, this.psi); this.after(); });
    this.read = UI.info('');
    UI.panelSet(tr('Dva qubity', 'Two qubits', 'Два кубіти'), [
      UI.row(A(Gate.H, 0, tr('H na A', 'H on A', 'H на A')), A(Gate.X, 0, tr('X na A', 'X on A', 'X на A'))),
      UI.row(A(Gate.H, 1, tr('H na B', 'H on B', 'H на B')), A(Gate.X, 1, tr('X na B', 'X on B', 'X на B'))),
      UI.row(UI.button(tr('CNOT (A riadi B)', 'CNOT (A controls B)', 'CNOT (A керує B)'), () => { this.psi = Q2.cnot(this.psi); this.after(); }, 'big'), UI.button('Reset |00⟩', () => { this.psi = Q2.zero(); this.after(); })),
      this.read,
      UI.info(tr('CNOT: ak je A v |1⟩, preklopí B. V NMR sa realizuje cez J-väzbu medzi jadrami.', 'CNOT: if A is |1⟩, it flips B. In NMR it is implemented via the J-coupling between nuclei.', 'CNOT: якщо A в |1⟩, перевертає B. У ЯМР реалізується через J-зв’язок між ядрами.'), 'tip'),
    ]);
    this.after();
  }
  after() {
    const rA = Q2.reducedBloch(this.psi, 0), rB = Q2.reducedBloch(this.psi, 1);
    if (this.read) this.read.innerHTML = `<b>|Ψ⟩ = ${Q2.ketString(this.psi)}</b><br>${tr('dĺžka šípky A', 'arrow length A', 'довжина стрілки A')}: ${Fmt.num(V3.len(rA), 2)}, B: ${Fmt.num(V3.len(rB), 2)}`
      + (Q2.entangled(this.psi) ? tr('<br>🔗 <b>previazané</b>', '<br>🔗 <b>entangled</b>', '<br>🔗 <b>сплутані</b>') : tr('<br>produktový stav (každý qubit má vlastnú šípku)', '<br>product state (each qubit has its own arrow)', '<br>добутковий стан (кожен кубіт має власну стрілку)'));
    if (this.stepIdx === 1 && !this.flags.b && C.abs2(this.psi.reduce((s, c, i) => C.add(s, C.mul(C.conj(this.bell()[i]), c)), C.of(0))) > 0.999) {
      this.flags.b = true;
      this.grant(['cnot', 'phiplus', 'entangle']);
      this.say([DL('l7.after.1.0'),
        DL('l7.after.1.1')], () => this.next());
    }
  }

  noSignal() {
    this.psi = this.bell(); this.basis = { A: 0, B: 0 }; this.tab = null;
    this.quest(tr('Meraj páry v zostavách (Alica Z, Bob Z) a (Alica X, Bob Z). Sleduj, čo vidí Bob SÁM.', 'Measure pairs in the setups (Alice Z, Bob Z) and (Alice X, Bob Z). Watch what Bob sees ON HIS OWN.', 'Вимірюй пари в схемах (Аліса Z, Боб Z) і (Аліса X, Боб Z). Стеж, що бачить Боб САМ ПО СОБІ.'), { easy: tr('📏 Z·Z, potom X·Z · sleduj Boba', '📏 Z·Z, then X·Z · watch Bob', '📏 Z·Z, потім X·Z · стеж за Бобом'), hard: tr('(Z,Z), (X,Z) · P<sub>B</sub>(0) = ?', '(Z,Z), (X,Z) · P<sub>B</sub>(0) = ?', '(Z,Z), (X,Z) · P<sub>B</sub>(0) = ?') });
    this.read = UI.info('');
    const pick = (who) => {
      const s = el('select');
      for (const [v, t] of [[0, tr('meria Z', 'measures Z', 'вимірює Z')], [90, tr('meria X', 'measures X', 'вимірює X')]]) { const o = el('option', null, `${who} ${t}`); o.value = v; s.appendChild(o); }
      s.value = this.basis[who[0]]; s.onchange = () => { this.basis[who[0]] = +s.value; }; // kľúč A/B = prvé písmeno mena
      return s;
    };
    UI.panelSet(tr('Meranie previazaných párov', 'Measuring entangled pairs', 'Вимірювання сплутаних пар'), [UI.row(pick(tr('Alica', 'Alice', 'Аліса')), pick(tr('Bob', 'Bob', 'Боб'))), UI.button(tr('Meraj 200 párov', 'Measure 200 pairs', 'Виміряти 200 пар'), () => this.measurePairs(200), 'big'), this.read]);
  }
  measurePairs(n) {
    const tA = this.basis.A * Math.PI / 180, tB = this.basis.B * Math.PI / 180, c = [0, 0, 0, 0];
    let last;
    for (let i = 0; i < n; i++) { last = Q2.sample(this.bell(), tA, tB); c[last[0] * 2 + last[1]]++; }
    this.lamp = last;
    const same = (c[0] + c[3]) / n, bob0 = (c[0] + c[2]) / n, nm = (d) => (d === 0 ? 'Z' : 'X');
    this.read.innerHTML = `${tr('Alica', 'Alice', 'Аліса')} ${nm(this.basis.A)}, Bob ${nm(this.basis.B)}:<br>00: ${c[0]}, 01: ${c[1]}, 10: ${c[2]}, 11: ${c[3]}<br>`
      + `<b>${tr('rovnaké výsledky', 'equal outcomes', 'однакові результати')}: ${Fmt.pct(same)}</b><br>${tr('Bob sám', 'Bob alone', 'Боб окремо')}: 0 → ${Fmt.pct(bob0)}, 1 → ${Fmt.pct(1 - bob0)}`;
    if (this.basis.A === 0 && this.basis.B === 0) this.flags.zz = true;
    if (this.basis.A === 90 && this.basis.B === 0) this.flags.xz = true;
    if (this.flags.zz && this.flags.xz && !this.flags.ns) {
      this.flags.ns = true;
      this.grant(['nosignal', 'einstein']);
      setTimeout(() => this.say([
        { ...this.E, text: DL('l7.measurePairs.1.0.text') },
        DL('l7.measurePairs.1.1'),
        DL('l7.measurePairs.1.2'),
      ], () => this.next()), 300);
    }
  }

  chsh() {
    this.showAxes = true;
    this.quest(tr('CHSH hra: nastav uhly meraní tak, aby tím vyhral viac ako 80 % kôl (klasicky najviac 75 %).', 'CHSH game: set the measurement angles so that the team wins more than 80 % of rounds (classically at most 75 %).', 'Гра CHSH: налаштуй кути вимірювань так, щоб команда вигравала понад 80 % раундів (класично щонайбільше 75 %).'), { easy: tr(`🎲 vyhraj > ${Fmt.pct(byDiff(0.78, 0.8, 0.83))}`, `🎲 win > ${Fmt.pct(byDiff(0.78, 0.8, 0.83))}`, `🎲 виграй > ${Fmt.pct(byDiff(0.78, 0.8, 0.83))}`), hard: `a⊕b = x·y · P<sub>win</sub> > ${Fmt.pct(byDiff(0.78, 0.8, 0.83))} · ${tr('klasicky', 'classical', 'класично')} ≤ 75 % · cos²(π/8) ≈ 85 %` });
    this.say([
      DL('l7.chsh.1.0'),
      DL('l7.chsh.1.1'),
      { ...this.E, text: DL('l7.chsh.1.2.text') },
      DL('l7.chsh.1.3'),
    ], () => {
      this.read = UI.info('');
      this.chart = UI.chart(300, 130); this.pairWin = null;
      this.sl = {};
      const sl = (k, label) => (this.sl[k] = UI.slider(label, -90, 180, byDiff(15, 7.5, 7.5), this.ang[k], (v) => { this.ang[k] = v; this.drawChsh(); return Math.round(v * 10) / 10 + '°'; }));
      UI.panelSet(tr('CHSH hra', 'CHSH game', 'Гра CHSH'), [sl('a0', tr('Alica, x=0: a₀', 'Alice, x=0: a₀', 'Аліса, x=0: a₀')), sl('a1', tr('Alica, x=1: a₁', 'Alice, x=1: a₁', 'Аліса, x=1: a₁')), sl('b0', 'Bob, y=0: b₀'), sl('b1', 'Bob, y=1: b₁'),
        UI.row(UI.button(tr(`Hraj ${byDiff(400, 400, 1000)} kôl`, `Play ${byDiff(400, 400, 1000)} rounds`, `Зіграти ${byDiff(400, 400, 1000)} раундів`), () => this.play(), 'big'), UI.button(tr('Klasicky (vždy 0)', 'Classically (always 0)', 'Класично (завжди 0)'), () => this.playClassic())),
        Settings.hard ? null : UI.button(tr('💡 Nápoveda', '💡 Hint', '💡 Підказка'), () => UI.toast(tr('Skús a₀ = 0°, a₁ = 90°, b₀ = 45°, b₁ = −45°. Rozdiely uhlov 45° (a 135° pre x=y=1).', 'Try a₀ = 0°, a₁ = 90°, b₀ = 45°, b₁ = −45°. Angle differences of 45° (and 135° for x=y=1).', 'Спробуй a₀ = 0°, a₁ = 90°, b₀ = 45°, b₁ = −45°. Різниці кутів 45° (і 135° для x=y=1).'), 6000)),
        this.read, this.chart].filter(Boolean));
      this.drawChsh();
    });
  }
  // správne: uhly sa dosunú na najbližšiu optimálnu zostavu (rozdiely 45° a pre x = y = 1 135° → výhra cos²(π/8) ≈ 85 %)
  snapOptimal() {
    const A = this.ang, win = (a0, a1, b0, b1) => {
      const c = (d) => Math.cos(d * Math.PI / 360) ** 2;
      return (c(a0 - b0) + c(a0 - b1) + c(a1 - b0) + (1 - c(a1 - b1))) / 4;
    };
    const opt = win(0, 90, 45, -45), inR = (v) => v >= -90 && v <= 180;
    let best = null;
    for (const a0 of [A.a0, A.a0 - 360, A.a0 + 360]) for (const s1 of [90, -90, 270, -270]) for (const s2 of [45, -45, 135, -135, 225, -225]) for (const s3 of [45, -45, 135, -135, 225, -225]) {
      const c = { a0, a1: a0 + s1, b0: a0 + s2, b1: a0 + s3 };
      if (!Object.values(c).every(inR) || Math.abs(win(c.a0, c.a1, c.b0, c.b1) - opt) > 1e-9) continue;
      const d = Object.keys(c).reduce((s, k) => s + Math.abs(c[k] - A[k]), 0);
      if (!best || d < best.d) best = { c, d };
    }
    if (best) for (const k of ['a0', 'a1', 'b0', 'b1']) UI.snapSlider(this.sl[k], best.c[k]);
  }
  play() {
    const d = (x) => x * Math.PI / 180, phi = this.bell();
    const N = byDiff(400, 400, 1000), cnt = [0, 0, 0, 0], won = [0, 0, 0, 0];
    let win = 0;
    for (let i = 0; i < N; i++) {
      const x = rand() < 0.5 ? 1 : 0, y = rand() < 0.5 ? 1 : 0;
      const [a, b] = Q2.sample(phi, d(x ? this.ang.a1 : this.ang.a0), d(y ? this.ang.b1 : this.ang.b0));
      cnt[x * 2 + y]++;
      if ((a ^ b) === (x & y)) { win++; won[x * 2 + y]++; }
    }
    const p = win / N;
    this.pairWin = won.map((w, k) => (cnt[k] ? w / cnt[k] : 0)); this.lastP = p;
    this.drawChsh();
    this.read.innerHTML = tr(`Kvantová stratégia: <b>${Fmt.pct(p)}</b> výhier (${win}/${N})<br>Bellova (klasická) hranica: 75 %`, `Quantum strategy: <b>${Fmt.pct(p)}</b> wins (${win}/${N})<br>Bell (classical) bound: 75 %`, `Квантова стратегія: <b>${Fmt.pct(p)}</b> виграшів (${win}/${N})<br>Беллова (класична) межа: 75 %`);
    if (p > byDiff(0.78, 0.8, 0.83) && !this.flags.chsh) {
      this.flags.chsh = true;
      this.snapOptimal();
      this.grant(['bell', 'chsh']);
      this.say([DL('l7.play.1.0', Fmt.pct(p)),
        { ...this.E, text: DL('l7.play.1.1.text') },
        DL('l7.play.1.2')], () => this.next());
    }
  }
  // výhra pre každú dvojicu (x, y): teória (|Φ⁺⟩, osi v rovine xz) P(rovnaké) = cos²((a − b)/2) a namerané
  drawChsh() {
    if (!this.chart) return;
    const A = this.ang, pr = (a, b) => Math.cos((a - b) * Math.PI / 360) ** 2;
    const th = [pr(A.a0, A.b0), pr(A.a0, A.b1), pr(A.a1, A.b0), 1 - pr(A.a1, A.b1)], avg = th.reduce((s, v) => s + v, 0) / 4;
    const showTh = !Settings.hard, bars = [];
    th.forEach((v, k) => {
      if (this.pairWin) bars.push({ x: k + 0.5, w: 0.5, y: this.pairWin[k], color: k === 3 ? '#ff7da8' : '#4f8cff', label: Fmt.pct(this.pairWin[k]) });
      if (showTh) bars.push({ x: k + 0.5, w: 0.66, y: v, color: '#ffd25a', outline: true });
    });
    UI.drawChart(this.chart, {
      x0: 0, x1: 4, y0: 0, y1: 1.15, yticks: [[0, '0'], [0.5, '½'], [1, '1']],
      xticks: [[0.5, 'x0 y0'], [1.5, 'x0 y1'], [2.5, 'x1 y0'], [3.5, 'x1 y1 ≠']], bars,
      hlines: [{ y: 0.75, color: '#9aa6d1', label: tr('klasicky 75 %', 'classical 75 %', 'класично 75 %') }, ...(showTh ? [{ y: avg, color: '#ffd25a', label: `${tr('teória', 'theory', 'теорія')} ${Fmt.pct(avg)}` }] : [])],
      legend: [['#4f8cff', tr('namerané', 'measured', 'виміряно')], ...(showTh ? [['#ffd25a', tr('teória', 'theory', 'теорія')]] : [])],
    });
  }
  playClassic() {
    let win = 0;
    for (let i = 0; i < 400; i++) { const x = rand() < 0.5 ? 1 : 0, y = rand() < 0.5 ? 1 : 0; if ((0 ^ 0) === (x & y)) win++; }
    this.read.innerHTML = tr(`Klasická stratégia „vždy 0“: <b>${Fmt.pct(win / 400)}</b> — prehrá len pri x = y = 1.<br>Lepšie to klasicky nejde.`, `Classical strategy “always 0”: <b>${Fmt.pct(win / 400)}</b> — it loses only when x = y = 1.<br>Classically you cannot do better.`, `Класична стратегія «завжди 0»: <b>${Fmt.pct(win / 400)}</b> — програє лише при x = y = 1.<br>Класично краще не можна.`);
  }

  viewState() {
    return { two: this.psi, note: tr('Dva qubity: 4 amplitúdy. Pri previazaní sa šípky A aj B v Blochových rezoch stiahnu do stredu.', 'Two qubits: 4 amplitudes. When entangled, arrows A and B in the Bloch cuts shrink to the centre.', 'Два кубіти: 4 амплітуди. Коли вони сплутані, стрілки A і B у перерізах Блоха стискаються до центру.') };
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
    const side = [[-4.5, tr('Alica', 'Alice', 'Аліса'), this.rA, 'a'], [4.5, tr('Bob', 'Bob', 'Боб'), this.rB, 'b']];
    for (const [x, name, vec, key] of side) {
      r.draw('cylinder', M4.trs([x, -1, 0], 0, [2, 1, 2]), [0.35, 0.45, 0.35]);
      r.draw('cylinder', M4.trs([x, 0, 0], 0, [0.15, 0.8, 0.15]), [0.6, 0.6, 0.7]);
      const c = [x, 2.2, 0];
      Bloch.draw(r, c, 1.3, vec, { labelFn: UI.label.bind(UI), key, labels: true });
      UI.label('n' + key, [x, 4.1, 0], name, 'player');
      UI.hot([x, 0.9, 1.4], tr(`<b>Detektor ${key === 'a' ? 'Alice' : 'Boba'}</b>: modrá = výsledok 0, červená = 1 (posledný pár).`, `<b>${key === 'a' ? 'Alice’s' : 'Bob’s'} detector</b>: blue = outcome 0, red = 1 (last pair).`, `<b>${key === 'a' ? 'Аліса' : 'Боб'} — детектор</b>: синій = результат 0, червоний = 1 (остання пара).`), 24);
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
      const link = tr('🔗 korelácie (nie signál!)', '🔗 correlations (not a signal!)', '🔗 кореляції (а не сигнал!)');
      UI.label('link', [0, 2.8, 0], link, 'prompt');
      UI.hot([0, 2.2, 0], TIPS[link], 40);
    }
  }
}
