'use strict';
// LEVEL 11 — Bornova meracia sieň (mentor: Max Born) — prednáška 5: Meranie ako súčasť výpočtu.
// Fáza → interferencia → pravdepodobnosť (|±⟩ a H), meranie uprostred obvodu (H·M·H), klasická spätná väzba
// (zmeraj → rozhodni → pokračuj), Bellov stav vs. klasická zmes (mimodiagonála ρ, meranie v inej báze), readout ≠ dekoherencia.

const BORN_FIX = ['I', 'X', 'Z', 'H'];

class L11Born extends Level {
  get steps() { return [this.intro, this.phaseReveal, this.midCircuit, this.feedback, this.bellReadout]; }

  setup() {
    this.cam = new OrbitCam([0, 1.5, 0], 8.5, 0.5, 0.3, 4, 18);
    this.stage = null; this.f = {}; this.r = [0, 0, 1]; this.hist = null; this.flash = 0;
    this.useH = false; this.midM = false; this.rule = ['I', 'I']; this.basis = 'ZZ'; this.bellSrc = 0; this.pairs = null;
  }

  intro() {
    this.quest(tr('Vypočuj si Maxa Borna', 'Listen to Max Born', 'Послухай Макса Борна'), { easy: tr('💬 Born', '💬 Born', '💬 Борн'), hard: tr('U organizuje možnosti · M vytvára výsledok', 'U organises possibilities · M creates the result', 'U впорядковує можливості · M створює результат') });
    this.say([DL('l11.intro.1.0'), DL('l11.intro.1.1'), DL('l11.intro.1.2')], () => {
      this.ask({ q: DL('l11.intro.2.q'), options: [DL('l11.intro.2.options.0'), DL('l11.intro.2.options.1'), DL('l11.intro.2.options.2')], correct: 0, why: DL('l11.intro.2.why') }, () => { this.grant(['born', 'projmeas']); this.next(); });
    });
  }

  // jedno meranie v Z-báze s pravdepodobnosťou P(0) = (1 + r_z)/2
  shot(r) { return rand() < (1 + r[2]) / 2 ? 0 : 1; }
  histText(h) { return h ? `0 × ${h[0]} · 1 × ${h[1]} &nbsp; (P(0) ≈ ${Fmt.pct(h[0] / (h[0] + h[1]))})` : ''; }

  // ---------- 1 · fáza sa ukáže až po interferencii ----------
  phaseReveal() {
    this.stage = 'phase'; this.rounds = 0; this.need = byDiff(2, 3, 4); this.useH = false;
    this.newBox();
  }
  newBox() {
    this.secret = rand() < 0.5 ? '+' : '-'; this.hist = null; this.flash = 0;
    this.r = this.secret === '+' ? [1, 0, 0] : [-1, 0, 0];
    this.quest(tr(`Krabica ${this.rounds + 1}/${this.need}: je v nej |+⟩ alebo |−⟩? Meranie v Z-báze dá v oboch prípadoch 50 : 50.`, `Box ${this.rounds + 1}/${this.need}: does it hold |+⟩ or |−⟩? A Z measurement gives 50 : 50 either way.`, `Коробка ${this.rounds + 1}/${this.need}: у ній |+⟩ чи |−⟩? Вимірювання в базисі Z в обох випадках дає 50 : 50.`),
      { easy: tr(`📦 ${this.rounds + 1}/${this.need}: |+⟩ alebo |−⟩?`, `📦 ${this.rounds + 1}/${this.need}: |+⟩ or |−⟩?`, `📦 ${this.rounds + 1}/${this.need}: |+⟩ чи |−⟩?`), hard: `${this.rounds + 1}/${this.need} · P(0) = P(1) = ½ · H|±⟩ = ?` });
    this.newBoxBuild();
  }
  newBoxBuild() {
    this.read = UI.info('');
    UI.panelSet(tr('Dve krabice, rovnaké štatistiky', 'Two boxes, the same statistics', 'Дві коробки, однакова статистика'), [
      UI.row(UI.button((this.useH ? '☑ ' : '☐ ') + tr('vložiť H pred meranie', 'insert H before the measurement', 'вставити H перед вимірюванням'), () => { this.useH = !this.useH; this.hist = null; this.newBoxBuild(); })),
      UI.row(UI.button(tr('▶ 100× priprav a zmeraj Z', '▶ prepare and measure Z 100×', '▶ 100× приготуй і виміряй Z'), () => this.runBox(), 'big')),
      this.read,
      UI.row(UI.button(tr('Je to |+⟩', 'It is |+⟩', 'Це |+⟩'), () => this.guessBox('+')), UI.button(tr('Je to |−⟩', 'It is |−⟩', 'Це |−⟩'), () => this.guessBox('-'))),
    ]);
    this.updBox();
  }
  runBox() {
    const r = this.useH ? (this.secret === '+' ? [0, 0, 1] : [0, 0, -1]) : this.r, h = [0, 0];
    for (let k = 0; k < 100; k++) h[this.shot(r)]++;
    this.hist = h; this.flash = 1; Sound.sfx('glance');
    if (this.useH) this.f.usedH = true;
    this.updBox();
  }
  updBox() {
    if (!this.read) return;
    this.read.innerHTML = `${tr('Obvod', 'Circuit', 'Схема')}: |?⟩ ${this.useH ? '—[H]— ' : '— '}📏 Z<br>` + (this.hist ? this.histText(this.hist) : tr('Zatiaľ nemeraná.', 'Not measured yet.', 'Ще не виміряно.'));
  }
  guessBox(g) {
    if (g !== this.secret) {
      this.mistakes++; Sound.sfx('bad');
      UI.toast(tr('Vedľa — bez H sú obe krabice v Z-báze nerozlíšiteľné. Nová krabica.', 'Wrong — without H both boxes are indistinguishable in the Z basis. A new box.', 'Не вгадав(-ла) — без H обидві коробки в базисі Z нерозрізненні. Нова коробка.'), 3200);
      return this.newBox();
    }
    Sound.sfx('good');
    this.rounds++;
    if (this.rounds < this.need) return this.newBox();
    this.grant(['interfmeas']);
    this.say([this.f.usedH ? DL('l11.phaseReveal.ok') : DL('l11.phaseReveal.lucky'), DL('l11.phaseReveal.chain')], () => this.next());
  }

  // ---------- 2 · meranie uprostred obvodu ----------
  midCircuit() {
    this.stage = 'mid'; this.midM = false; this.hist = null; this.f.ranOn = this.f.ranOff = false; this.r = [0, 0, 1];
    this.quest(tr('Spusti obvod |0⟩ → H → (meranie?) → H → meranie raz bez stredného merania a raz s ním.', 'Run the circuit |0⟩ → H → (measurement?) → H → measurement once without the middle measurement and once with it.', 'Запусти схему |0⟩ → H → (вимірювання?) → H → вимірювання раз без проміжного вимірювання і раз із ним.'),
      { easy: tr('⚡ obvod bez / so stredným meraním', '⚡ circuit without / with a mid-circuit measurement', '⚡ схема без / з проміжним вимірюванням'), hard: 'H² = I · H M H → ½ : ½ · p<sub>m</sub> = ⟨ψ|P<sub>m</sub>|ψ⟩' });
    this.buildMid();
  }
  buildMid() {
    this.read = UI.info('');
    UI.panelSet(tr('Kde meriame, záleží', 'Where we measure matters', 'Де вимірюємо — важливо'), [
      UI.info(`|0⟩ —[H]— ${this.midM ? '📏' : '────'} —[H]— 📏`, 'big'),
      UI.row(UI.button((this.midM ? '☑ ' : '☐ ') + tr('meranie uprostred', 'mid-circuit measurement', 'вимірювання посередині'), () => { this.midM = !this.midM; this.hist = null; this.buildMid(); })),
      UI.row(UI.button(tr('▶ Spusti 100×', '▶ Run 100×', '▶ Запусти 100×'), () => this.runMid(), 'big')),
      this.read,
    ]);
    this.updMid();
  }
  runMid() {
    const h = [0, 0];
    for (let k = 0; k < 100; k++) {
      let psi = Q.apply(Gate.H, Q.ket0());
      if (this.midM) psi = rand() < C.abs2(psi[0]) ? Q.ket0() : Q.ket1(); // kolaps: P_k|ψ⟩/√p
      psi = Q.apply(Gate.H, psi);
      h[rand() < C.abs2(psi[0]) ? 0 : 1]++;
    }
    this.hist = h; this.flash = 1; Sound.sfx('glance');
    this.r = this.midM ? [0, 0, (h[0] - h[1]) / 100] : [0, 0, 1];
    if (this.midM) this.f.ranOn = true; else this.f.ranOff = true;
    this.updMid();
    if (this.f.ranOn && this.f.ranOff && !this.f.midDone) {
      this.f.midDone = true;
      this.grant(['midmeas']);
      this.say([DL('l11.midCircuit.ok')], () => {
        this.ask({ q: DL('l11.midCircuit.q.q'), options: [DL('l11.midCircuit.q.options.0'), DL('l11.midCircuit.q.options.1'), DL('l11.midCircuit.q.options.2')], correct: 0, why: DL('l11.midCircuit.q.why') }, () => this.next());
      });
    }
  }
  updMid() {
    if (!this.read) return;
    this.read.innerHTML = (this.hist ? this.histText(this.hist) : tr('Zatiaľ nespustené.', 'Not run yet.', 'Ще не запущено.'))
      + `<br>${tr('bez stredného merania', 'without the mid-circuit measurement', 'без проміжного вимірювання')}: ${this.f.ranOff ? '✔' : '…'} · ${tr('so stredným meraním', 'with it', 'з ним')}: ${this.f.ranOn ? '✔' : '…'}`;
  }

  // ---------- 3 · klasická spätná väzba ----------
  feedback() {
    this.stage = 'fb'; this.rule = ['I', 'I']; this.hist = null; this.solvedF = false; this.r = [0, 0, 1];
    this.quest(tr('Aktívny reset: navrhni pravidlo „zmeraj → rozhodni → pokračuj“, aby qubit z ľubovoľného stavu skončil vždy v |0⟩ (20 z 20).', 'Active reset: design a “measure → decide → continue” rule so that a qubit in any state always ends in |0⟩ (20 out of 20).', 'Активне скидання: склади правило «виміряй → виріши → продовжуй», щоб кубіт із будь-якого стану завжди опинявся в |0⟩ (20 з 20).'),
      { easy: tr('🔁 pravidlo: výsledok → hradlo', '🔁 rule: result → gate', '🔁 правило: результат → гейт'), hard: 'U₁ → M → U₂(M) → |0⟩ · 20/20' });
    this.buildFb();
  }
  buildFb() {
    const pickBtn = (k) => UI.button(`${tr('ak', 'if', 'якщо')} m = ${k} → <b>${this.rule[k]}</b> ▾`, () => { this.rule[k] = BORN_FIX[(BORN_FIX.indexOf(this.rule[k]) + 1) % BORN_FIX.length]; this.buildFb(); });
    this.read = UI.info('');
    UI.panelSet(tr('Zmeraj → rozhodni → pokračuj', 'Measure → decide → continue', 'Виміряй → виріши → продовжуй'), [
      UI.info(`|ψ<sub>${tr('náhodný', 'random', 'випадковий')}</sub>⟩ — 📏 Z → m — [U₂(m)] — ?`),
      UI.row(pickBtn(0), pickBtn(1)),
      UI.row(UI.button(tr('▶ 20 kôl', '▶ 20 rounds', '▶ 20 раундів'), () => this.runFb(), 'big')),
      this.read,
    ]);
    if (this.hist) this.read.innerHTML = this.fbText;
  }
  runFb() {
    if (this.solvedF) return;
    let good = 0;
    for (let k = 0; k < 20; k++) {
      const psi = Q.fromBloch(Math.acos(rand() * 2 - 1), rand() * 2 * Math.PI);
      const m = rand() < C.abs2(psi[0]) ? 0 : 1;
      const out = Q.apply(Gate[this.rule[m]], m ? Q.ket1() : Q.ket0());
      if (C.abs2(out[0]) > 0.999) good++;
    }
    this.hist = [good, 20 - good]; this.flash = 1; Sound.sfx('glance');
    this.fbText = `${tr('Skončilo v |0⟩', 'Ended in |0⟩', 'Опинилося в |0⟩')}: <b>${good} / 20</b>`;
    this.read.innerHTML = this.fbText;
    if (good === 20) {
      this.solvedF = true;
      this.grant(['feedbackc']);
      this.say([DL('l11.feedback.ok', this.rule[0], this.rule[1]), DL('l11.feedback.qec')], () => this.next());
    } else if (good === 0 || this.rule[1] === 'H' || this.rule[0] === 'H') UI.toast(tr('Po meraní je qubit v |0⟩ alebo |1⟩ — a ktoré hradlo preklopí |1⟩ na |0⟩?', 'After the measurement the qubit is in |0⟩ or |1⟩ — and which gate flips |1⟩ to |0⟩?', 'Після вимірювання кубіт у |0⟩ або |1⟩ — а який гейт перевертає |1⟩ на |0⟩?'), 3400);
  }

  // ---------- 4 · Bellov stav alebo klasická zmes? ----------
  bellReadout() {
    this.stage = 'bell'; this.bellSrc = rand() < 0.5 ? 0 : 1; this.basis = 'ZZ'; this.res = [null, null]; this.solvedB = false;
    this.quest(tr('Dva zdroje párov: jeden vysiela Bellov stav |Φ⁺⟩, druhý klasickú zmes ½|00⟩⟨00| + ½|11⟩⟨11|. Zisti, ktorý je ktorý.', 'Two pair sources: one emits the Bell state |Φ⁺⟩, the other the classical mixture ½|00⟩⟨00| + ½|11⟩⟨11|. Find out which is which.', 'Два джерела пар: одне випромінює стан Белла |Φ⁺⟩, друге — класичну суміш ½|00⟩⟨00| + ½|11⟩⟨11|. З’ясуй, яке з них яке.'),
      { easy: tr('🔔 ktorý zdroj je Bellov?', '🔔 which source is Bell?', '🔔 яке джерело — Белла?'), hard: 'ρ<sub>Φ⁺</sub> vs. ρ<sub>mix</sub> · ρ<sub>00,11</sub> = ½ vs. 0 · ZZ / XX' });
    this.buildBell();
  }
  buildBell() {
    this.read = UI.info('');
    UI.panelSet(tr('Bellov stav vs. zmes', 'Bell state vs. mixture', 'Стан Белла проти суміші'), [
      UI.row(...['ZZ', 'XX'].map((b) => UI.button((this.basis === b ? '● ' : '○ ') + tr('báza ', 'basis ', 'базис ') + b, () => { this.basis = b; this.buildBell(); }))),
      UI.row(UI.button(tr('▶ 50 párov zo zdroja A', '▶ 50 pairs from source A', '▶ 50 пар із джерела A'), () => this.fire(0)), UI.button(tr('▶ 50 párov zo zdroja B', '▶ 50 pairs from source B', '▶ 50 пар із джерела B'), () => this.fire(1))),
      this.read,
      UI.row(UI.button(tr('A je Bellov', 'A is Bell', 'A — Белла'), () => this.guessBell(0)), UI.button(tr('B je Bellov', 'B is Bell', 'B — Белла'), () => this.guessBell(1))),
    ]);
    this.updBell();
  }
  fire(src) {
    const bell = src === this.bellSrc, x = this.basis === 'XX';
    let same = 0;
    // |Φ⁺⟩: rovnaké výsledky v ZZ aj XX; zmes |00⟩/|11⟩: v ZZ rovnaké, v XX náhodné
    for (let k = 0; k < 50; k++) same += bell || !x ? 1 : rand() < 0.5 ? 1 : 0;
    this.res[src] = { basis: this.basis, same, n: 50 }; this.flash = 1; Sound.sfx('glance');
    this.updBell();
  }
  updBell() {
    if (!this.read) return;
    this.read.innerHTML = [0, 1].map((s) => {
      const o = this.res[s];
      return `${tr('Zdroj', 'Source', 'Джерело')} ${'AB'[s]}: ` + (o ? `${o.basis} → A = B ${tr('v', 'in', 'у')} ${o.same}/${o.n}` : '—');
    }).join('<br>');
  }
  guessBell(s) {
    if (this.solvedB) return;
    if (s !== this.bellSrc) {
      this.mistakes++; Sound.sfx('bad');
      UI.toast(tr('Nie. V báze ZZ sa oba zdroje správajú rovnako — skús inú bázu. Zdroje sa premiešali.', 'No. In the ZZ basis both sources behave the same — try another basis. The sources were reshuffled.', 'Ні. У базисі ZZ обидва джерела поводяться однаково — спробуй інший базис. Джерела перемішано.'), 3400);
      this.bellSrc = rand() < 0.5 ? 0 : 1; this.res = [null, null]; return this.updBell();
    }
    this.solvedB = true; Sound.sfx('good');
    this.grant(['decoread', 'tomography']);
    this.say([DL('l11.bellReadout.ok'), DL('l11.bellReadout.nmr')], () => {
      this.ask({ q: DL('l11.bellReadout.q.q'), options: [DL('l11.bellReadout.q.options.0'), DL('l11.bellReadout.q.options.1'), DL('l11.bellReadout.q.options.2')], correct: 0, why: DL('l11.bellReadout.q.why') }, () => this.next());
    });
  }

  viewState() {
    if (this.stage === 'bell') return { two: [C.of(Math.SQRT1_2), C.of(0), C.of(0), C.of(Math.SQRT1_2)], note: tr('Bellov stav |Φ⁺⟩ — informácia je v koreláciách, nie v jednotlivých qubitoch.', 'The Bell state |Φ⁺⟩ — the information is in the correlations, not in the individual qubits.', 'Стан Белла |Φ⁺⟩ — інформація в кореляціях, а не в окремих кубітах.') };
    if (this.stage === 'phase') return null; // obsah krabice je tajomstvo
    return { r: this.r };
  }

  update(dt) {
    this.t += dt;
    this.flash = Math.max(0, this.flash - dt * 1.5);
  }

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('box', M4.trs([0, -0.06, 0], 0, [14, 0.1, 9]), [0.17, 0.15, 0.2], { pattern: 1 });
    // meracia sieň: zosilňovací reťazec qubit → interakcia → zosilnenie → signál → register
    const chain = [[-4.5, 'qubit'], [-2.25, tr('interakcia', 'interaction', 'взаємодія')], [0, tr('zosilnenie', 'amplification', 'підсилення')], [2.25, tr('signál', 'signal', 'сигнал')], [4.5, tr('register', 'register', 'регістр')]];
    chain.forEach(([x, nm], k) => {
      const p = [x, 0.35, -2.6], glow = Math.max(0, this.flash - k * 0.15);
      r.draw('box', M4.trs(p, 0, [0.9, 0.7, 0.9]), V3.add([0.3, 0.28, 0.38], [glow * 0.6, glow * 0.5, glow * 0.1]), { emissive: glow });
      if (k) r.rod([x - 1.8, 0.4, -2.6], [x - 0.45, 0.4, -2.6], [0.6, 0.6, 0.7], 0.03, { emissive: glow });
      UI.label('bc' + k, V3.add(p, [0, 0.75, 0]), nm, 'axis');
    });
    UI.hot([0, 0.4, -2.6], tr('<b>Readout je fyzický proces</b>: mikroskopická kvantová informácia → zosilnenie → makroskopicky stabilný záznam v klasickom registri.', '<b>Readout is a physical process</b>: microscopic quantum information → amplification → a macroscopically stable record in a classical register.', '<b>Зчитування — фізичний процес</b>: мікроскопічна квантова інформація → підсилення → макроскопічно стабільний запис у класичному регістрі.'), 80);
    const c = [0, 1.7, 0.6];
    if (this.stage === 'phase') {
      r.draw('box', M4.trs(c, this.t * 0.3, 1.1), [0.55, 0.42, 0.25], { pattern: 5 });
      UI.label('bq', V3.add(c, [0, 0.95, 0]), '|+⟩ ?  |−⟩ ?', 'ket');
      if (this.useH) { r.draw('box', M4.trs(V3.add(c, [1.6, 0, 0]), 0, [0.55, 0.55, 0.2]), [0.55, 0.35, 0.9], { emissive: 0.4 }); UI.label('bh', V3.add(c, [1.6, 0, 0.2]), 'H', 'ket'); }
    } else if (this.stage === 'bell') {
      for (const s of [0, 1]) {
        const p = [s ? 2.2 : -2.2, 0, 0.8], beam = this.res[s] && this.flash > 0;
        r.draw('cylinder', M4.trs(p, 0, [0.35, 1.6, 0.35]), [0.5, 0.5, 0.6]);
        r.sphere(V3.add(p, [0, 1.8, 0]), 0.3, s ? [0.95, 0.75, 0.35] : [0.45, 0.75, 1], { emissive: 0.6 });
        UI.label('bs' + s, V3.add(p, [0, 2.45, 0]), `${tr('zdroj', 'source', 'джерело')} ${'AB'[s]}`, 'prompt');
        if (beam) for (const d of [-1, 1]) r.rod(V3.add(p, [0, 1.8, 0]), V3.add(p, [d * 1.4, 1.8, 1.6]), [1, 0.9, 0.5], 0.02, { emissive: 1, alpha: this.flash });
      }
      UI.label('bb', [0, 3.2, 0.8], `${tr('báza', 'basis', 'базис')} ${this.basis}`, 'axis');
    } else Bloch.draw(r, c, 1.3, this.r, { labelFn: UI.label.bind(UI), key: 'b', axisNames: true, bars: true });
    if (this.hist) {
      const base = [3.6, 0, 1.2], tot = this.hist[0] + this.hist[1] || 1;
      this.hist.forEach((n, k) => {
        const h = Math.max(0.02, (n / tot) * 2.4), p = V3.add(base, [k * 0.7, 0, 0]);
        r.draw('cylinder', M4.trs(p, 0, [0.25, h, 0.25]), k ? [1, 0.45, 0.45] : [0.45, 0.65, 1], { emissive: 0.3 });
        UI.label('bhl' + k, V3.add(p, [0, h + 0.3, 0]), `${this.stage === 'fb' ? (k ? '✗' : '|0⟩') : k} · ${n}`, 'axis tiny');
      });
    }
  }
}
