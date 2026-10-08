'use strict';
// LEVEL 6 — Rabiho rezonátor / NMR laboratórium (mentor: Isidor Isaac Rabi)
// Precesia, rotujúci rámec, π a π/2 impulzy, rezonancia, dekoherencia T₂ a NMR signál.

class L6Rabi extends Level {
  get steps() { return [this.intro, this.precession, this.piPulse, this.halfPulse, this.tuning, this.t2]; }

  setup() {
    this.cam = new OrbitCam([-0.6, 1.6, 0], 9.5, 0.35, 0.25, 4, 18);
    this.r = [0, 0, 1]; this.frame = 'rot'; this.labPh = 0; this.w0 = 3.2;
    this.OR = Math.PI / 1.6; this.area = Math.PI / 2; this.f = 0; this.d0 = 0; this.useT2 = false;
    this.pulse = null; this.hist = []; this.labTime = 0; this.flags = {}; this.watch = false; this.check = null; this.onFrame = null;
  }
  get delta() { return this.f - this.d0; }

  intro() {
    this.quest(tr('Vypočuj si Rabiho', 'Listen to Rabi'), { easy: '💬 Rabi & Zeeman', hard: tr('NMR: B₀ → 2 hladiny, RF → rotácie', 'NMR: B₀ → 2 levels, RF → rotations') });
    this.say(tr([
      'Shalom! Som I. I. Rabi. V roku 1938 som naučil atómy „počúvať rádio“ — to je <b>magnetická rezonancia</b>. Z nej je dnes NMR, MRI aj atómové hodiny.',
      { who: 'Pieter Zeeman', face: '🧪', text: 'Dovoľ, aby som doplnil: v statickom poli <b>B₀</b> sa energia spinu ½ rozštiepi na <b>dve hladiny</b> (Zeemanov jav). Tie dve hladiny sú náš qubit.' },
      'Vľavo je NMR magnet so vzorkou (napr. molekuly dimetylfosfitu v SpinQ). Vpravo je Blochova sféra jadrového spinu. Dole v paneli je graf: <b>P(|1⟩)</b> a <b>NMR signál</b>.',
      'Prirovnanie: RF impulz je ako <b>hojdanie na hojdačke</b>: ak tlačíš v správnom rytme (<b>rezonancia</b>), hojdačka sa rozhúpe celá. Mimo rytmu sa len trochu zatrasie.',
    ], [
      'Shalom! I am I. I. Rabi. In 1938 I taught atoms to “listen to the radio” — that is <b>magnetic resonance</b>. From it came NMR, MRI and atomic clocks.',
      { who: 'Pieter Zeeman', face: '🧪', text: 'Allow me to add: in a static field <b>B₀</b> the energy of a spin ½ splits into <b>two levels</b> (the Zeeman effect). Those two levels are our qubit.' },
      'On the left is the NMR magnet with a sample (e.g. dimethyl phosphite molecules in a SpinQ). On the right is the Bloch sphere of the nuclear spin. Down in the panel there is a plot: <b>P(|1⟩)</b> and the <b>NMR signal</b>.',
      'An analogy: an RF pulse is like <b>pushing a swing</b>: if you push in the right rhythm (<b>resonance</b>), the swing goes all the way. Out of rhythm it only wobbles a bit.',
    ]), () => this.next());
  }

  buildPanel(o) {
    const nodes = [];
    if (o.frame) nodes.push(UI.row(
      UI.button((this.frame === 'lab' ? '● ' : '○ ') + tr('Laboratórny rámec', 'Laboratory frame'), () => { this.frame = 'lab'; this.buildPanel(o); }),
      UI.button((this.frame === 'rot' ? '● ' : '○ ') + tr('Rotujúci rámec', 'Rotating frame'), () => { this.frame = 'rot'; this.buildPanel(o); this.onFrame && this.onFrame(); })));
    if (o.frame) nodes.push(UI.slider(tr('sila poľa B₀ (Larmorova frekvencia ω₀)', 'field strength B₀ (Larmor frequency ω₀)'), 1, 8, 0.5, this.w0, (v) => { this.w0 = v; return Fmt.num(v, 1) + ' rad/s'; },
      tr('ω₀ = γB₀: silnejšie pole → rýchlejšia precesia. P(|1⟩) sa ani tak nemení.', 'ω₀ = γB₀: a stronger field → faster precession. P(|1⟩) still does not change.')));
    if (o.area) nodes.push(UI.slider(tr('plocha impulzu Ω<sub>R</sub>t', 'pulse area Ω<sub>R</sub>t'), 0, 2 * Math.PI, byDiff(Math.PI / 8, Math.PI / 8, Math.PI / 16), this.area, (v) => { this.area = v; return Fmt.angle(v); }));
    if (o.tune) nodes.push(UI.slider(tr('frekvencia RF (posun)', 'RF frequency (offset)'), -2, 2, byDiff(0.1, 0.1, 0.05), this.f, (v) => { this.f = v; return Fmt.num(v, 1); }));
    if (o.area) nodes.push(UI.row(UI.button(tr('▶ Impulz z |0⟩', '▶ Pulse from |0⟩'), () => this.startPulse(), 'big'), UI.button('Reset |0⟩', () => { this.r = [0, 0, 1]; this.pulse = null; })));
    if (o.t2) nodes.push(UI.info(tr('Dekoherencia T₂ je <b>zapnutá</b> (T₂ ≈ 2,5 s).', 'Decoherence T₂ is <b>on</b> (T₂ ≈ 2.5 s).'), 'tip'));
    this.read = UI.info('');
    this.plot = el('canvas', 'plot'); this.plot.width = 300; this.plot.height = 120;
    this.rabiChart = o.area ? UI.chart(300, 110) : null;
    nodes.push(this.read, this.plot, UI.info(`<span style="color:#7f7">— P(|1⟩)</span> &nbsp; <span style="color:#fb6">— ${tr('NMR signál (priečna magnetizácia v laboratóriu)', 'NMR signal (transverse magnetisation in the lab)')}</span>`, 'tip'));
    if (this.rabiChart) nodes.push(this.rabiChart);
    UI.panelSet(tr('NMR / Rabiho rezonátor', 'NMR / Rabi’s resonator'), nodes);
  }

  startPulse() {
    if (this.pulse) return;
    this.r = [0, 0, 1];
    this.pulse = { left: this.area / this.OR };
  }
  onPulseEnd() { this.check && this.check('pulse'); }

  precession() {
    this.r = Q.bloch(Q.fromBloch(Math.PI / 3, 0)); this.frame = 'lab'; this.labTime = 0;
    this.quest(tr('Pozoruj spin aspoň 4 sekundy v LABORATÓRNOM rámci. Potom prepni na ROTUJÚCI rámec.', 'Watch the spin for at least 4 seconds in the LABORATORY frame. Then switch to the ROTATING frame.'), { easy: tr('👀 4 s laboratórium → 🎠 rotujúci rámec', '👀 4 s lab → 🎠 rotating frame'), hard: tr('lab ≥ 4 s → rot · ω₀ = γB₀ · dP₁/dt = ?', 'lab ≥ 4 s → rot · ω₀ = γB₀ · dP₁/dt = ?') });
    this.buildPanel({ frame: true });
    this.onFrame = () => {
      if (this.labTime < 4 || this.flags.p) return;
      this.flags.p = true;
      this.ask(tr({ q: 'Šípka v laboratórnom rámci krúžila okolo osi z (precesia). Zmenila sa pritom pravdepodobnosť P(|1⟩)?', options: ['Nie — precesia mení len relatívnu fázu φ, nie θ', 'Áno, kmitala', 'Áno, stále rástla'], correct: 0,
        why: 'Pozri graf: zelená čiara je rovná, kmitá len oranžový signál. Precesia ≠ gyroskop: je to vývoj fázy medzi |0⟩ a |1⟩.' }, { q: 'In the laboratory frame the arrow circled around the z axis (precession). Did the probability P(|1⟩) change meanwhile?', options: ['No — precession changes only the relative phase φ, not θ', 'Yes, it oscillated', 'Yes, it kept growing'], correct: 0,
        why: 'Look at the plot: the green line is flat, only the orange signal oscillates. Precession ≠ gyroscope: it is the evolution of the phase between |0⟩ and |1⟩.' }), () => {
        this.grant(['zeeman', 'B0', 'precess', 'rotframe']);
        this.say([tr('V <b>rotujúcom rámci</b> sa točíme spolu so spinom (pri Larmorovej frekvencii), takže rýchla precesia „zastane“. Je to matematický trik — laboratórium sa netočí. V tomto rámci budeme odteraz pracovať.', 'In the <b>rotating frame</b> we turn together with the spin (at the Larmor frequency), so the fast precession “stops”. It is a mathematical trick — the laboratory does not rotate. From now on we will work in this frame.')], () => this.next());
      });
    };
  }

  piPulse() {
    this.frame = 'rot'; this.r = [0, 0, 1]; this.onFrame = null;
    this.quest(tr('Nastav plochu impulzu tak, aby jediný impulz preklopil |0⟩ na |1⟩ (P(|1⟩) > 98 %).', 'Set the pulse area so that a single pulse flips |0⟩ to |1⟩ (P(|1⟩) > 98 %).'), { easy: tr('⚡ |0⟩ → |1⟩ jedným impulzom', '⚡ |0⟩ → |1⟩ with one pulse'), hard: `Ω<sub>R</sub>t = ? · P(|1⟩) > ${Fmt.pct(byDiff(0.95, 0.98, 0.995))}` });
    this.buildPanel({ area: true });
    this.check = () => {
      if (this.r[2] < -byDiff(0.9, 0.96, 0.99) && !this.flags.pi) {
        this.flags.pi = true;
        this.grant(['rabi', 'OmegaR', 'rabiosc']);
        this.say(tr(['To je <b>π-impulz</b>: rotácia o 180° — ako hradlo X. Plocha impulzu Ω<sub>R</sub>·t je <b>uhol rotácie</b>, nie čas v sekundách.',
          'Keby si impulz predĺžil, stav by sa vrátil späť: to sú <b>Rabiho oscilácie</b>. Kmitá pravdepodobnosť, nie elektrón medzi dvoma miestami!'], [
          'That is a <b>π pulse</b>: a 180° rotation — like the X gate. The pulse area Ω<sub>R</sub>·t is the <b>rotation angle</b>, not a time in seconds.',
          'If you made the pulse longer, the state would come back: those are <b>Rabi oscillations</b>. It is the probability that oscillates, not an electron between two places!']), () => this.next());
      }
    };
  }

  halfPulse() {
    this.quest(tr('Jediným impulzom z |0⟩ dostaň stav na rovník (P(|1⟩) = 50 %).', 'With a single pulse from |0⟩, bring the state to the equator (P(|1⟩) = 50 %).'), { easy: tr('⚡ |0⟩ → rovník (50 %)', '⚡ |0⟩ → equator (50 %)'), hard: `Ω<sub>R</sub>t = ? · |P(|1⟩) − ½| < ${Fmt.pct(byDiff(0.06, 0.03, 0.015))}` });
    this.buildPanel({ area: true });
    this.check = () => {
      if (Math.abs(this.r[2]) < byDiff(0.12, 0.06, 0.03) && !this.flags.half) {
        this.flags.half = true;
        this.say([tr('<b>π/2-impulz</b> — rovnomerná superpozícia. V NMR je to základný krok takmer každého experimentu.', 'A <b>π/2 pulse</b> — an equal superposition. In NMR it is the basic step of almost every experiment.')], () => this.next());
      }
    };
  }

  tuning() {
    this.d0 = (rand() < 0.5 ? -1 : 1) * byDiff(0.8 + Math.round(rand() * 6) / 10, 0.8 + Math.round(rand() * 6) / 10, 0.6 + Math.round(rand() * 20) * 0.05);
    this.f = 0; this.area = Math.PI;
    this.quest(tr('Rádio je rozladené! Nájdi rezonančnú frekvenciu tak, aby π-impulz opäť preklopil spin (P(|1⟩) > 97 %).', 'The radio is detuned! Find the resonance frequency so that a π pulse flips the spin again (P(|1⟩) > 97 %).'), { easy: tr('📻 nájdi rezonanciu · π-impulz', '📻 find the resonance · π pulse'), hard: `Δ → 0 · π · P(|1⟩) > ${Fmt.pct(byDiff(0.94, 0.97, 0.99))} · Ω<sub>eff</sub> = √(Ω²+Δ²)` });
    this.say([tr('Niekto pohol frekvenciou RF generátora. Mimo rezonancie sa spin otáča okolo <b>naklonenej osi</b> a nikdy sa úplne nepreklopí. Hľadaj rytmus hojdačky!', 'Someone has moved the frequency of the RF generator. Off resonance the spin rotates about a <b>tilted axis</b> and never fully flips. Find the rhythm of the swing!')], () => this.buildPanel({ area: true, tune: true }));
    this.check = () => {
      if (this.r[2] < -byDiff(0.88, 0.94, 0.98) && !this.flags.tune) {
        this.flags.tune = true;
        this.say([tr('Rezonancia nájdená! Presne takto sa v NMR hľadá frekvencia jadra. Rozdiel frekvencií (detuning) nakláňa os rotácie.', 'Resonance found! This is exactly how the frequency of a nucleus is found in NMR. The frequency difference (detuning) tilts the rotation axis.')], () => this.next());
      }
    };
  }

  t2() {
    this.useT2 = true; this.f = this.d0; this.area = Math.PI / 2;
    this.quest(tr('Dekoherencia T₂: urob π/2-impulz a čakaj, kým sa Blochov vektor nezmrští pod 30 % dĺžky.', 'Decoherence T₂: apply a π/2 pulse and wait until the Bloch vector shrinks below 30 % of its length.'), { easy: tr('⏳ π/2 · čakaj (T₂)', '⏳ π/2 · wait (T₂)'), hard: `π/2 → |r<sub>⊥</sub>| ∝ e<sup>−t/T₂</sup> < ${Fmt.num(0.3, 1)} · T₂ ≈ ${Fmt.num(2.5, 1)} s` });
    this.say([tr('Skutočné spiny cítia susedov a nehomogenity poľa. Každá molekula precesuje trochu inak a fázy sa rozbiehajú: <b>T₂ (dephasing)</b>. Pomalší návrat populácií k tepelnému stavu je <b>T₁</b>.', 'Real spins feel their neighbours and field inhomogeneities. Each molecule precesses a little differently and the phases drift apart: <b>T₂ (dephasing)</b>. The slower return of populations to the thermal state is <b>T₁</b>.')], () => this.buildPanel({ area: true, t2: true }));
    this.check = () => {};
    this.watch = true;
  }

  update(dt) {
    this.t += dt;
    this.labPh += this.w0 * dt;
    if (this.frame === 'lab') this.labTime += dt;
    if (this.pulse) {
      const D = this.delta, rate = Math.hypot(this.OR, D), axis = [this.OR / rate, 0, D / rate], step = Math.min(dt, this.pulse.left);
      this.r = V3.rotate(this.r, axis, rate * step);
      this.pulse.left -= step;
      if (this.pulse.left <= 1e-6) { this.pulse = null; this.onPulseEnd(); }
    }
    if (this.useT2) { const k = Math.exp(-dt / 2.5); this.r = [this.r[0] * k, this.r[1] * k, this.r[2]]; }
    if (this.watch && this.stepIdx === 5 && !this.pulse && V3.len(this.r) < 0.3 && Math.abs(this.r[2]) < 0.2 && !this.flags.t2) {
      this.flags.t2 = true; this.watch = false;
      this.grant(['T2', 'ensemble']);
      this.say(tr(['Šípka sa stiahla k osi — <b>zmiešaný stav</b> (|r| < 1). Oranžový NMR signál pritom slabol: to je <b>FID</b> (voľne doznievajúca indukcia).',
        'V NMR (napr. SpinQ) nemeriame jeden spin, ale <b>ansámbel</b> ~10²⁰ molekúl. Signál je <b>stredná hodnota</b> priečnej magnetizácie, nie jednotlivé výsledky 0/1.'], [
        'The arrow has shrunk towards the axis — a <b>mixed state</b> (|r| < 1). Meanwhile the orange NMR signal faded: that is the <b>FID</b> (free induction decay).',
        'In NMR (e.g. SpinQ) we do not measure a single spin but an <b>ensemble</b> of ~10²⁰ molecules. The signal is the <b>expectation value</b> of the transverse magnetisation, not individual 0/1 outcomes.']), () => this.next());
    }
    // graf
    const disp = this.disp();
    this.hist.push({ p1: (1 - this.r[2]) / 2, s: disp[0] });
    if (this.hist.length > 300) this.hist.shift();
    if (this.read) this.read.innerHTML = `P(|1⟩) = ${Fmt.pct((1 - this.r[2]) / 2)} · |r| = ${Fmt.num(V3.len(this.r), 2)}`
      + (this.pulse ? tr(' · <b>RF impulz beží</b>', ' · <b>RF pulse running</b>') : '') + (this.stepIdx >= 4 && this.stepIdx < 5 ? ` · ${tr('posun od rezonancie', 'detuning')}: ${this.flags.tune || Settings.diff === 'easy' ? Fmt.num(this.delta, 2) : '?'}` : '');
    if (this.rabiChart && this.rabiChart.isConnected) this.drawRabi();
    if (this.plot && this.plot.isConnected) this.drawPlot();
  }

  // Rabiho krivka: P(|1⟩) po impulze z |0⟩ v závislosti od plochy Ω_R·t pri aktuálnom rozladení Δ
  drawRabi() {
    const W = this.OR, D = this.delta, Wf = Math.hypot(W, D), P1 = (A) => (W * W) / (Wf * Wf) * Math.sin(Wf * (A / W) / 2) ** 2;
    const hide = Settings.diff === 'hard' && this.stepIdx === 4 && !this.flags.tune;
    UI.drawChart(this.rabiChart, {
      x0: 0, x1: 2 * Math.PI, y0: 0, y1: 1.05, xlabel: tr('plocha impulzu Ω_R·t', 'pulse area Ω_R·t'),
      xticks: [[0, '0'], [Math.PI / 2, 'π/2'], [Math.PI, 'π'], [3 * Math.PI / 2, '3π/2'], [2 * Math.PI, '2π']], yticks: [[0, '0'], [0.5, '½'], [1, '1']],
      curves: [...(Math.abs(D) > 0.01 && !hide ? [{ f: (A) => Math.sin(A / 2) ** 2, color: '#5a6690', dash: [4, 4], width: 1 }] : []), ...(hide ? [] : [{ f: P1, color: '#7f7' }])],
      vlines: [{ x: this.area, color: '#ffd25a' }],
      points: [{ x: this.area, y: P1(this.area), color: '#ffd25a', r: hide ? 0 : 5 }],
      legend: [['#7f7', tr('Rabiho oscilácia P(|1⟩)', 'Rabi oscillation P(|1⟩)')], ...(Math.abs(D) > 0.01 && !hide ? [['#5a6690', tr('v rezonancii', 'at resonance')]] : [])],
    });
  }

  disp() { return this.frame === 'lab' ? V3.rotate(this.r, [0, 0, 1], this.labPh) : this.r; }

  drawPlot() {
    const g = this.plot.getContext('2d'), W = this.plot.width, H = this.plot.height;
    g.fillStyle = '#0b1020'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#334'; g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
    const line = (f, col, y0, sc) => {
      g.strokeStyle = col; g.lineWidth = 2; g.beginPath();
      this.hist.forEach((h, i) => { const x = (i / 300) * W, y = y0 - f(h) * sc; i ? g.lineTo(x, y) : g.moveTo(x, y); });
      g.stroke();
    };
    line((h) => h.p1, '#7f7', H - 6, H - 12);
    line((h) => h.s, '#fb6', H / 2, H / 2 - 8);
  }

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('box', M4.trs([0, -0.06, 0], 0, [14, 0.1, 8]), [0.15, 0.18, 0.24], { pattern: 1 });
    // NMR magnet
    const mx = -4;
    r.draw('torus', M4.trs([mx, 0.4, 0], 0, 1.3), [0.6, 0.6, 0.7]);
    r.draw('torus', M4.trs([mx, 3.0, 0], 0, 1.3), [0.6, 0.6, 0.7]);
    for (const a of [0, 2.1, 4.2]) r.draw('cylinder', M4.trs([mx + Math.cos(a) * 1.3, 0.4, Math.sin(a) * 1.3], 0, [0.08, 2.6, 0.08]), [0.5, 0.5, 0.6]);
    r.arrow([mx - 1.9, 0.3, 0], [mx - 1.9, 3.2, 0], [0.5, 0.8, 1], 0.06);
    UI.label('B0', [mx - 1.9, 3.6, 0], 'B₀', 'ket');
    r.draw('torus', M4.orient([mx, 1.7, 0], [1, 0, 0], 0.55), this.pulse ? [1, 0.8, 0.2] : [0.6, 0.5, 0.3], { emissive: this.pulse ? 1 : 0 });
    UI.label('rf', [mx, 2.45, 0.8], this.pulse ? tr('RF impulz!', 'RF pulse!') : tr('RF cievka', 'RF coil'), this.pulse ? 'prompt' : 'axis');
    const d = this.disp();
    r.arrow([mx, 1.7, 0], V3.add([mx, 1.7, 0], V3.scale(qToWorld(d), 0.45)), [1, 0.35, 0.45], 0.03);
    r.draw('cylinder', M4.trs([mx, 0.2, 0], 0, [0.25, 3.2, 0.25]), [0.8, 0.9, 1], { alpha: 0.25 });
    UI.label('tube', [mx, 3.8, 0], tr('vzorka (ansámbel molekúl)', 'sample (ensemble of molecules)'), 'axis');
    UI.hot([mx, 0.4, 1.3], tr('<b>Cievky magnetu</b> — vytvárajú silné, stabilné a homogénne pole B₀.', '<b>Magnet coils</b> — they create a strong, stable and homogeneous field B₀.'), 40);
    UI.hot([mx, 1.7, 0], tr('<b>RF cievka a vzorka</b>: impulzy otáčajú jadrové spiny; indukovaný signál v cievke = NMR signál.', '<b>RF coil and sample</b>: pulses rotate the nuclear spins; the signal induced in the coil = the NMR signal.'), 40);
    UI.hot([mx - 1.9, 1.7, 0], TIPS['B₀'], 30);
    // Blochova sféra
    const c = [1.6, 1.7, 0];
    Bloch.draw(r, c, 1.6, d, { labelFn: UI.label.bind(UI), key: 'r', axisNames: true, bars: true });
    if (this.pulse && this.frame === 'rot') {
      const D = this.delta, ax = V3.norm([this.OR, 0, D]);
      r.rod(V3.sub(c, V3.scale(qToWorld(ax), 2)), V3.add(c, V3.scale(qToWorld(ax), 2)), [1, 1, 0.4], 0.02, { emissive: 0.8 });
    }
    UI.label('frame', [1.6, 4.1, 0], this.frame === 'lab' ? tr('laboratórny rámec', 'laboratory frame') : tr('rotujúci rámec', 'rotating frame'), 'prompt');
  }
}
