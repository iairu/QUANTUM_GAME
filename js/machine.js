'use strict';
// Skutočné stroje vedľa Blochovej sféry: Blochova sféra je len obraz stavu, nie prístroj. Tu je zariadenie,
// v ktorom ten istý qubit naozaj žije. Osi stroja sú zarovnané s osami sféry (hore = z = smer B₀, x = os RF cievky).
//  Machine.nmr       — stolový NMR kvantový procesor (ako SpinQ z prednášok): magnet, vzorka v RF cievke, magnetizácia M
//  Machine.mzi       — fotonický Machův–Zehnderov interferometer: deliče lúča = H, ramená = |0⟩, |1⟩
//  Machine.bellSource — zdroj previazaných fotónov s dvoma polarizátormi a detektormi (Bellov/CHSH experiment)
// Zapína sa v nastaveniach (Settings.view.machine).

const Machine = {
  get on() { return Settings.view.machine; },
  // lokálne súradnice stroja → svet: posun base, mierka s (bez otáčania, aby osi sedeli so sférou)
  at(base, s) { return (x, y, z) => [base[0] + x * s, base[1] + y * s, base[2] + z * s]; },
  title(o, key, p, sk, en, uk, tipSk, tipEn, tipUk) {
    if (o.labelFn) o.labelFn(key, p, `🔬 ${tr(sk, en, uk)}`, 'axis', tr(tipSk, tipEn, tipUk));
  },

  // vec = Blochov vektor qubitu (ako na sfére, v rotujúcom rámci); null = neznámy stav
  // o: { key, labelFn, rf (impulz beží), rfPhase (os B₁ v rovine xy, rad), precess (laboratórna precesia, predvolene áno), note }
  nmr(r, base, s, vec, o = {}) {
    if (!this.on) return;
    const P = this.at(base, s), key = 'm' + (o.key || 'n'), t = r.time, rf = !!o.rf;
    // skriňa konzoly so svetlou povrchovou úpravou, obrazovka a ovládače
    r.draw('box', M4.trs(P(0, 0.35, 0), 0, [2.0 * s, 0.7 * s, 1.1 * s]), [0.78, 0.8, 0.85]);
    r.draw('box', M4.trs(P(0, 0.71, 0), 0, [2.04 * s, 0.03 * s, 1.14 * s]), [0.55, 0.58, 0.65]);
    r.draw('box', M4.trs(P(0.42, 0.38, 0.555), 0, [0.86 * s, 0.46 * s, 0.02 * s]), [0.03, 0.06, 0.08], { emissive: 0.2 });
    for (const [x, y] of [[-0.75, 0.48], [-0.5, 0.48], [-0.25, 0.48]]) r.rod(P(x, y, 0.55), P(x, y, 0.61), [0.25, 0.27, 0.32], 0.05 * s);
    r.sphere(P(-0.75, 0.22, 0.56), 0.035 * s, rf ? [1, 0.6, 0.15] : [0.3, 1, 0.45], { emissive: 1, unlit: 1 });
    // C-magnet: póly dole (N) a hore (S) → pole B₀ v medzere smeruje hore = os z Blochovej sféry
    const dark = [0.24, 0.26, 0.3];
    r.draw('box', M4.trs(P(0, 1.45, -0.42), 0, [1.3 * s, 1.5 * s, 0.22 * s]), dark);
    r.draw('box', M4.trs(P(0, 2.1, -0.08), 0, [1.3 * s, 0.22 * s, 0.9 * s]), dark);
    r.draw('box', M4.trs(P(0, 0.8, -0.08), 0, [1.3 * s, 0.22 * s, 0.9 * s]), dark);
    r.draw('cylinder', M4.trs(P(0, 0.91, 0.05), 0, [0.4 * s, 0.15 * s, 0.4 * s]), [0.75, 0.3, 0.3]);
    r.draw('cylinder', M4.trs(P(0, 1.84, 0.05), 0, [0.4 * s, 0.15 * s, 0.4 * s]), [0.3, 0.4, 0.8]);
    r.arrow(P(-0.48, 1.14, 0.42), P(-0.48, 1.78, 0.42), [0.5, 0.8, 1], 0.025 * s, { emissive: 0.4 });
    if (o.labelFn) o.labelFn(key + 'b0', P(-0.62, 1.92, 0.45), 'B₀', 'ket', TIPS['B₀']);
    // vzorka (sklenená trubička naprieč medzerou, os x) a RF cievka okolo nej
    const c = P(0, 1.45, 0.05);
    r.rod(P(-0.95, 1.45, 0.05), P(0.95, 1.45, 0.05), [0.8, 0.9, 1], 0.055 * s, { alpha: 0.3 });
    r.rod(P(-0.3, 1.45, 0.05), P(0.3, 1.45, 0.05), [0.55, 0.75, 1], 0.045 * s, { alpha: 0.45 });
    const glow = rf ? 0.6 + 0.4 * Math.sin(t * 20) : 0;
    for (let k = -2; k <= 2; k++) r.draw('torus', M4.orient(P(k * 0.09, 1.45, 0.05), [1, 0, 0], 0.11 * s), [0.85, 0.5, 0.25], { emissive: rf ? glow : 0.05 });
    if (rf) { // laboratórny obraz B₁: pole cievky kmitá pozdĺž jej osi (x) na frekvencii ν_RF
      const a = Math.cos(t * 9) * 0.55;
      r.arrow(P(0, 1.45, 0.28), P(a, 1.45, 0.28), [1, 0.85, 0.3], 0.02 * s, { emissive: 0.9 });
      if (o.labelFn) o.labelFn(key + 'b1', P(0.7, 1.62, 0.3), 'B₁', 'prompt', tr('Pole RF cievky kmitá pozdĺž jej osi; v rotujúcom rámci je to stála os rotácie — fáza impulzu volí, ktorá.', 'The RF coil field oscillates along the coil axis; in the rotating frame it is a fixed rotation axis — the pulse phase picks which one.', 'Поле РЧ-котушки коливається вздовж її осі; в обертовій системі це нерухома вісь обертання — фаза імпульсу визначає, яка саме.'));
    }
    // magnetizácia vzorky M ∝ ⟨σ⟩ = r: v laboratóriu precesuje okolo B₀ Larmorovou frekvenciou (tu spomalene)
    const L = vec ? V3.len(vec) : 0;
    if (vec) {
      const ph = o.precess === false ? 0 : t * 1.6, lab = [vec[0] * Math.cos(ph) - vec[1] * Math.sin(ph), vec[0] * Math.sin(ph) + vec[1] * Math.cos(ph), vec[2]];
      const len = 0.36 * s, tip = V3.add(c, V3.scale(qToWorld(lab), len));
      if (L > 0.02) r.arrow(c, tip, [1, 0.35, 0.45], 0.022 * s, { emissive: 0.5 });
      else r.sphere(c, 0.04 * s, [1, 0.35, 0.45], { emissive: 0.5 });
      const hor = Math.hypot(vec[0], vec[1]);
      if (o.precess !== false && hor > 0.03) r.draw('circle', M4.trs(V3.add(c, [0, vec[2] * len, 0]), 0, hor * len), [1, 0.6, 0.65], { alpha: 0.6 });
      if (o.labelFn) o.labelFn(key + 'M', V3.add(tip, [0, 0.14 * s, 0]), 'M', 'ket', tr('Magnetizácia vzorky — skutočný vektor v laboratóriu. M ∝ ⟨σ⟩ = r: je to ten istý Blochov vektor, len ako priemer cez ~10²⁰ molekúl.', 'The sample magnetisation — a real vector in the lab. M ∝ ⟨σ⟩ = r: the same Bloch vector, only as an average over ~10²⁰ molecules.', 'Намагніченість зразка — справжній вектор у лабораторії. M ∝ ⟨σ⟩ = r: той самий вектор Блоха, але як середнє за ~10²⁰ молекулами.'));
    } else if (o.labelFn) o.labelFn(key + 'M', V3.add(c, [0, 0.2 * s, 0]), '?', 'prompt');
    // obrazovka: signál indukovaný v tej istej cievke (FID) — amplitúda = priečna magnetizácia |M⊥|
    const A = vec ? Math.hypot(vec[0], vec[1]) : 0, ph0 = vec ? Math.atan2(vec[1], vec[0]) : 0, N = 36;
    let prev = null;
    for (let k = 0; k <= N; k++) {
      const u = k / N, y = A * Math.exp(-u * 2.2) * Math.cos(u * 6 * 2 * Math.PI + ph0) * 0.17;
      const p = P(0.04 + u * 0.76, 0.38 + y, 0.57);
      if (prev) r.rod(prev, p, [0.35, 1, 0.55], 0.006 * s, { emissive: 1, unlit: 1 });
      prev = p;
    }
    r.rod(P(0.04, 0.38, 0.568), P(0.8, 0.38, 0.568), [0.2, 0.35, 0.3], 0.003 * s, { unlit: 1 });
    this.title(o, key + 't', P(0, 2.55, 0), 'skutočný stroj: stolový NMR procesor', 'real machine: benchtop NMR processor', 'справжня машина: настільний ЯМР-процесор',
      'Takto qubit naozaj existuje: jadrové spiny molekúl v kvapaline (napr. SpinQ z prednášok). Osi sú zladené so sférou: hore = B₀ = os z, cievka = os x.',
      'This is how the qubit really exists: nuclear spins of molecules in a liquid (e.g. the SpinQ from the lectures). The axes match the sphere: up = B₀ = z axis, coil = x axis.',
      'Ось як кубіт існує насправді: ядерні спіни молекул у рідині (напр. SpinQ з лекцій). Осі узгоджені зі сферою: угору = B₀ = вісь z, котушка = вісь x.');
    if (o.note && o.labelFn) o.labelFn(key + 'note', P(0, 2.3, 0), o.note, 'axis tiny');
    if (typeof UI !== 'undefined' && UI.hot) {
      UI.hot(P(0, 2.1, -0.08), tr('<b>Permanentný magnet</b> (~1 T): pole B₀ medzi pólmi rozštiepi hladiny jadrového spinu. Spin v ňom precesuje Larmorovou frekvenciou ω₀ = γB₀ — to je os z Blochovej sféry.', '<b>Permanent magnet</b> (~1 T): the field B₀ between the poles splits the nuclear-spin levels. The spin precesses in it at the Larmor frequency ω₀ = γB₀ — this is the z axis of the Bloch sphere.', '<b>Постійний магніт</b> (~1 Т): поле B₀ між полюсами розщеплює рівні ядерного спіну. Спін у ньому прецесує з ларморовою частотою ω₀ = γB₀ — це вісь z сфери Блоха.'), 40);
      UI.hot(c, tr('<b>Vzorka v RF cievke</b>: kvapalina s ~10²⁰ molekulami, každá nesie jadrové spiny = qubity. Prúdový impulz v cievke vytvorí pole B₁ ⟂ B₀ a otočí magnetizáciu — to je kvantové hradlo. Dĺžka impulzu = uhol, fáza impulzu = os.<br>Na sfére vidíš rotujúci rámec; v laboratóriu M navyše precesuje okolo B₀ (tu spomalene miliónkrát).', '<b>Sample in the RF coil</b>: a liquid with ~10²⁰ molecules, each carrying nuclear spins = qubits. A current pulse in the coil creates a field B₁ ⟂ B₀ and turns the magnetisation — that is a quantum gate. Pulse length = angle, pulse phase = axis.<br>The sphere shows the rotating frame; in the lab M also precesses about B₀ (slowed down a million times here).', '<b>Зразок у РЧ-котушці</b>: рідина з ~10²⁰ молекул, кожна несе ядерні спіни = кубіти. Імпульс струму в котушці створює поле B₁ ⟂ B₀ і повертає намагніченість — це квантовий вентиль. Тривалість імпульсу = кут, фаза імпульсу = вісь.<br>На сфері видно обертову систему; у лабораторії M ще й прецесує навколо B₀ (тут сповільнено в мільйон разів).'), 34);
      UI.hot(P(0.42, 0.38, 0.57), tr('<b>Signál (FID)</b>: precesujúca magnetizácia indukuje v tej istej cievke napätie. Jeho amplitúda je |M⊥| = priečna časť Blochovho vektora, fáza je φ. Meria sa celý ansámbel naraz — stredná hodnota ⟨A⟩ = Tr(ρA), nie jednotlivé 0/1.', '<b>Signal (FID)</b>: the precessing magnetisation induces a voltage in the same coil. Its amplitude is |M⊥| = the transverse part of the Bloch vector, its phase is φ. The whole ensemble is measured at once — the mean value ⟨A⟩ = Tr(ρA), not single 0/1 outcomes.', '<b>Сигнал (FID)</b>: прецесуюча намагніченість наводить напругу в тій самій котушці. Її амплітуда |M⊥| — поперечна частина вектора Блоха, фаза — φ. Вимірюється весь ансамбль одразу — середнє ⟨A⟩ = Tr(ρA), а не окремі 0/1.'), 40);
    }
  },

  // o: { key, labelFn, arms: [P(horné rameno), P(dolné rameno)] alebo null, det: [záblesk D0, D1], mid: 'meas' | 'deco' | null, noise (0–1) }
  mzi(r, base, s, o = {}) {
    if (!this.on) return;
    const P = this.at(base, s), key = 'z' + (o.key || 'm'), t = r.time, y = 0.62;
    r.draw('box', M4.trs(P(0, 0.5, 0), 0, [3.4 * s, 0.1 * s, 2.3 * s]), [0.2, 0.22, 0.26], { pattern: 1 });
    for (const [x, z] of [[-1.5, -1], [1.5, -1], [-1.5, 1], [1.5, 1]]) r.draw('cylinder', M4.trs(P(x, 0, z), 0, [0.07 * s, 0.45 * s, 0.07 * s]), [0.35, 0.37, 0.42]);
    const post = (x, z) => r.draw('cylinder', M4.trs(P(x, 0.55, z), 0, [0.03 * s, (y - 0.55) * s, 0.03 * s]), [0.6, 0.62, 0.68]);
    // laser a vstupný lúč
    r.draw('box', M4.trs(P(-1.45, y, -0.6), 0, [0.5 * s, 0.2 * s, 0.22 * s]), [0.25, 0.25, 0.3]);
    r.sphere(P(-1.19, y, -0.6), 0.03 * s, [1, 0.25, 0.2], { emissive: 1, unlit: 1 });
    const beam = (a, b, I) => { if (I > 0.01) r.rod(P(...a), P(...b), [1, 0.3, 0.25], 0.012 * s * (0.5 + I), { emissive: 1, alpha: 0.25 + 0.75 * I }); };
    const arms = o.arms || [0.5, 0.5];
    beam([-1.19, y, -0.6], [-0.8, y, -0.6], 1);
    beam([-0.8, y, -0.6], [0.8, y, -0.6], arms[0]); beam([0.8, y, -0.6], [0.8, y, 0.6], arms[0]);   // horné rameno (|0⟩)
    beam([-0.8, y, -0.6], [-0.8, y, 0.6], arms[1]); beam([-0.8, y, 0.6], [0.8, y, 0.6], arms[1]);   // dolné rameno (|1⟩)
    // deliče lúča (polopriepustné, 45°) a zrkadlá
    for (const [x, z, bs] of [[-0.8, -0.6, 1], [0.8, 0.6, 1], [0.8, -0.6, 0], [-0.8, 0.6, 0]]) {
      post(x, z);
      r.draw('box', M4.trs(P(x, y, z), Math.PI / 4, [0.34 * s, 0.26 * s, 0.03 * s]), bs ? [0.55, 0.9, 1] : [0.85, 0.87, 0.92], bs ? { alpha: 0.45, emissive: 0.2 } : { emissive: 0.15 });
    }
    if (o.labelFn) { o.labelFn(key + 'bs1', P(-0.8, y + 0.32, -0.6), 'BS = H', 'ket'); o.labelFn(key + 'bs2', P(0.8, y + 0.32, 0.6), 'BS = H', 'ket'); }
    // stred: detektor cesty (meranie) alebo fázový šum prostredia (dekoherencia) v hornom ramene
    if (o.mid === 'meas') {
      r.draw('box', M4.trs(P(0, y, -0.6), 0, [0.22 * s, 0.3 * s, 0.3 * s]), [0.9, 0.3, 0.3], { alpha: 0.6 });
      if (o.labelFn) o.labelFn(key + 'mid', P(0, y + 0.35, -0.6), tr('detektor cesty', 'which-path detector', 'детектор шляху'), 'axis tiny');
    } else if (o.mid === 'deco') {
      for (let k = 0; k < 5; k++) r.sphere(P(Math.sin(t * 2 + k) * 0.25, y + Math.cos(t * 1.7 + k * 2) * 0.1, -0.6 + Math.sin(t + k * 1.3) * 0.08), 0.06 * s, [0.75, 0.75, 0.85], { alpha: 0.15 + 0.4 * (o.noise || 0) });
      if (o.labelFn) o.labelFn(key + 'mid', P(0, y + 0.35, -0.6), tr('fázový šum', 'phase noise', 'фазовий шум'), 'axis tiny');
    }
    // detektory fotónov: D0 (rovno) a D1 (nabok)
    const det = o.det || [0, 0];
    [[1.35, 0.6, 0], [0.8, 1.05, 1]].forEach(([x, z, k]) => {
      r.draw('box', M4.trs(P(x, y, z), 0, [0.24 * s, 0.24 * s, 0.24 * s]), k ? [1, 0.45, 0.45] : [0.45, 0.65, 1], { emissive: 0.15 + det[k] });
      if (o.labelFn) o.labelFn(key + 'd' + k, P(x, y + 0.3, z), 'D' + k, 'axis tiny');
    });
    this.title(o, key + 't', P(0, 1.35, 0), 'skutočný stroj: Machov–Zehnderov interferometer', 'real machine: Mach–Zehnder interferometer', 'справжня машина: інтерферометр Маха–Цендера',
      'Ten istý obvod H — (meranie) — H s jedným fotónom: delič lúča je Hadamard, horné a dolné rameno sú |0⟩ a |1⟩, detektory merajú v Z-báze. Bez merania v strede svieti len D0.',
      'The same circuit H — (measurement) — H with a single photon: a beam splitter is a Hadamard, the upper and lower arms are |0⟩ and |1⟩, the detectors measure in the Z basis. Without a measurement in the middle only D0 clicks.',
      'Та сама схема H — (вимірювання) — H з одним фотоном: світлоподільник — це Адамар, верхнє й нижнє плече — |0⟩ і |1⟩, детектори вимірюють у базисі Z. Без вимірювання посередині клацає лише D0.');
    if (typeof UI !== 'undefined' && UI.hot) {
      UI.hot(P(-0.8, y, -0.6), tr('<b>Delič lúča</b> (polopriepustné zrkadlo) = Hadamardovo hradlo: fotón pošle do oboch ramien s amplitúdami 1/√2.', '<b>Beam splitter</b> (half-silvered mirror) = the Hadamard gate: it sends the photon into both arms with amplitudes 1/√2.', '<b>Світлоподільник</b> (напівпрозоре дзеркало) = вентиль Адамара: відправляє фотон в обидва плечі з амплітудами 1/√2.'), 30);
      UI.hot(P(0, y, -0.6), tr('<b>Ramená interferometra</b>: horné = |0⟩, dolné = |1⟩. Jas lúča = pravdepodobnosť cesty. Rozdiel dĺžok ramien = relatívna fáza φ.', '<b>Interferometer arms</b>: upper = |0⟩, lower = |1⟩. Beam brightness = path probability. The arm length difference = the relative phase φ.', '<b>Плечі інтерферометра</b>: верхнє = |0⟩, нижнє = |1⟩. Яскравість променя = ймовірність шляху. Різниця довжин плечей = відносна фаза φ.'), 34);
    }
  },

  // o: { key, labelFn, a, b (uhly meracích osí na Blochovej sfére v stupňoch), flash: [A, B] (null = bez výsledku, 0/1), entangled, span (polovičná dĺžka) }
  bellSource(r, base, s, o = {}) {
    if (!this.on) return;
    const P = this.at(base, s), key = 'q' + (o.key || 'b'), t = r.time, y = 0.55, X = o.span || 3.0;
    r.draw('box', M4.trs(P(0, 0.42, 0), 0, [2 * X * s + 1.2 * s, 0.08 * s, 0.9 * s]), [0.2, 0.22, 0.26], { pattern: 1 });
    for (const [x, z] of [[-X, -0.35], [X, -0.35], [-X, 0.35], [X, 0.35]]) r.draw('cylinder', M4.trs(P(x, 0, z), 0, [0.05 * s, 0.38 * s, 0.05 * s]), [0.35, 0.37, 0.42]);
    // pumpovací laser → nelineárny kryštál (SPDC) → dva fotóny k Alici a Bobovi
    r.draw('box', M4.trs(P(0, y, -0.32), 0, [0.3 * s, 0.18 * s, 0.22 * s]), [0.25, 0.25, 0.3]);
    r.rod(P(0, y, -0.2), P(0, y, 0), [0.7, 0.35, 1], 0.012 * s, { emissive: 1, alpha: 0.8 });
    r.draw('box', M4.trs(P(0, y, 0), Math.PI / 4, [0.12 * s, 0.12 * s, 0.12 * s]), [0.8, 0.85, 1], { alpha: 0.6, emissive: 0.4 });
    const pulse = o.entangled ? 0.4 + 0.4 * Math.sin(t * 5) : 0.15;
    for (const sg of [-1, 1]) {
      r.rod(P(0, y, 0), P(sg * (X - 0.25), y, 0), [1, 0.3, 0.25], 0.008 * s, { emissive: 1, alpha: pulse });
      // polarizátor: na Blochovej sfére os merania pod uhlom a → v priestore sa polarizátor otočí o a/2
      const ang = (sg < 0 ? o.a : o.b) ?? 0, half = ang / 2 * Math.PI / 180, pc = P(sg * (X - 0.3), y, 0);
      r.draw('torus', M4.orient(pc, [1, 0, 0], 0.16 * s), [0.6, 0.62, 0.7]);
      r.draw('disk', M4.orient(pc, [1, 0, 0], 0.15 * s), [0.5, 0.6, 0.8], { alpha: 0.35 });
      const d = [0, Math.cos(half), Math.sin(half)];
      r.rod(V3.sub(pc, V3.scale(d, 0.15 * s)), V3.add(pc, V3.scale(d, 0.15 * s)), [1, 0.9, 0.4], 0.01 * s, { emissive: 0.8 });
      if (o.labelFn) o.labelFn(key + 'p' + sg, V3.add(pc, [0, 0.32 * s, 0]), `${Math.round(ang / 2)}°`, 'axis tiny', tr('Natočenie polarizátora = polovica uhla osi merania na Blochovej sfére (polarizácia H/V: 90° v priestore = 180° na sfére).', 'Polariser angle = half the angle of the measurement axis on the Bloch sphere (H/V polarisation: 90° in space = 180° on the sphere).', 'Кут поляризатора = половина кута осі вимірювання на сфері Блоха (поляризація H/V: 90° у просторі = 180° на сфері).'));
      const f = o.flash ? o.flash[sg < 0 ? 0 : 1] : null;
      r.draw('box', M4.trs(P(sg * X, y, 0), 0, [0.22 * s, 0.22 * s, 0.22 * s]), f == null ? [0.35, 0.35, 0.4] : f ? [1, 0.45, 0.45] : [0.45, 0.65, 1], { emissive: f == null ? 0 : 0.8 });
    }
    this.title(o, key + 't', P(0, 1.05, 0), 'skutočný stroj: zdroj previazaných fotónov', 'real machine: entangled-photon source', 'справжня машина: джерело заплутаних фотонів',
      'Bellove experimenty sa robia s fotónmi: laser v nelineárnom kryštáli vytvorí pár s previazanou polarizáciou, Alica a Bob merajú polarizátormi a detektormi jednotlivých fotónov.',
      'Bell experiments are done with photons: a laser in a nonlinear crystal makes a pair with entangled polarisation; Alice and Bob measure with polarisers and single-photon detectors.',
      'Експерименти Белла роблять з фотонами: лазер у нелінійному кристалі створює пару із заплутаною поляризацією; Аліса і Боб вимірюють поляризаторами й детекторами окремих фотонів.');
    if (typeof UI !== 'undefined' && UI.hot) UI.hot(P(0, y, 0), tr('<b>Nelineárny kryštál</b> (SPDC): z jedného fialového fotónu vzniknú dva červené s previazanou polarizáciou — |Φ⁺⟩ = (|HH⟩ + |VV⟩)/√2.', '<b>Nonlinear crystal</b> (SPDC): one violet photon turns into two red ones with entangled polarisation — |Φ⁺⟩ = (|HH⟩ + |VV⟩)/√2.', '<b>Нелінійний кристал</b> (SPDC): з одного фіолетового фотона виникають два червоні із заплутаною поляризацією — |Φ⁺⟩ = (|HH⟩ + |VV⟩)/√2.'), 30);
  },
};
