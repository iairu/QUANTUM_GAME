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
    this.quest('Vypočuj si Rabiho');
    this.say([
      'Shalom! Som I. I. Rabi. V roku 1938 som naučil atómy „počúvať rádio“ — to je <b>magnetická rezonancia</b>. Z nej je dnes NMR, MRI aj atómové hodiny.',
      { who: 'Pieter Zeeman', face: '🧪', text: 'Dovoľ, aby som doplnil: v statickom poli <b>B₀</b> sa energia spinu ½ rozštiepi na <b>dve hladiny</b> (Zeemanov jav). Tie dve hladiny sú náš qubit.' },
      'Vľavo je NMR magnet so vzorkou (napr. molekuly dimetylfosfitu v SpinQ). Vpravo je Blochova sféra jadrového spinu. Dole v paneli je graf: <b>P(|1⟩)</b> a <b>NMR signál</b>.',
      'Prirovnanie: RF impulz je ako <b>hojdanie na hojdačke</b>: ak tlačíš v správnom rytme (<b>rezonancia</b>), hojdačka sa rozhúpe celá. Mimo rytmu sa len trochu zatrasie.',
    ], () => this.next());
  }

  buildPanel(o) {
    const nodes = [];
    if (o.frame) nodes.push(UI.row(
      UI.button((this.frame === 'lab' ? '● ' : '○ ') + 'Laboratórny rámec', () => { this.frame = 'lab'; this.buildPanel(o); }),
      UI.button((this.frame === 'rot' ? '● ' : '○ ') + 'Rotujúci rámec', () => { this.frame = 'rot'; this.buildPanel(o); this.onFrame && this.onFrame(); })));
    if (o.area) nodes.push(UI.slider('plocha impulzu Ω<sub>R</sub>t', 0, 2 * Math.PI, Math.PI / 8, this.area, (v) => { this.area = v; return Fmt.angle(v); }));
    if (o.tune) nodes.push(UI.slider('frekvencia RF (posun)', -2, 2, 0.1, this.f, (v) => { this.f = v; return Fmt.num(v, 1); }));
    if (o.area) nodes.push(UI.row(UI.button('▶ Impulz z |0⟩', () => this.startPulse(), 'big'), UI.button('Reset |0⟩', () => { this.r = [0, 0, 1]; this.pulse = null; })));
    if (o.t2) nodes.push(UI.info('Dekoherencia T₂ je <b>zapnutá</b> (T₂ ≈ 2,5 s).', 'tip'));
    this.read = UI.info('');
    this.plot = el('canvas', 'plot'); this.plot.width = 300; this.plot.height = 120;
    nodes.push(this.read, this.plot, UI.info('<span style="color:#7f7">— P(|1⟩)</span> &nbsp; <span style="color:#fb6">— NMR signál (priečna magnetizácia v laboratóriu)</span>', 'tip'));
    UI.panelSet('NMR / Rabiho rezonátor', nodes);
  }

  startPulse() {
    if (this.pulse) return;
    this.r = [0, 0, 1];
    this.pulse = { left: this.area / this.OR };
  }
  onPulseEnd() { this.check && this.check('pulse'); }

  precession() {
    this.r = Q.bloch(Q.fromBloch(Math.PI / 3, 0)); this.frame = 'lab'; this.labTime = 0;
    this.quest('Pozoruj spin aspoň 4 sekundy v LABORATÓRNOM rámci. Potom prepni na ROTUJÚCI rámec.');
    this.buildPanel({ frame: true });
    this.onFrame = () => {
      if (this.labTime < 4 || this.flags.p) return;
      this.flags.p = true;
      this.ask({ q: 'Šípka v laboratórnom rámci krúžila okolo osi z (precesia). Zmenila sa pritom pravdepodobnosť P(|1⟩)?', options: ['Nie — precesia mení len relatívnu fázu φ, nie θ', 'Áno, kmitala', 'Áno, stále rástla'], correct: 0,
        why: 'Pozri graf: zelená čiara je rovná, kmitá len oranžový signál. Precesia ≠ gyroskop: je to vývoj fázy medzi |0⟩ a |1⟩.' }, () => {
        this.grant(['zeeman', 'B0', 'precess', 'rotframe']);
        this.say(['V <b>rotujúcom rámci</b> sa točíme spolu so spinom (pri Larmorovej frekvencii), takže rýchla precesia „zastane“. Je to matematický trik — laboratórium sa netočí. V tomto rámci budeme odteraz pracovať.'], () => this.next());
      });
    };
  }

  piPulse() {
    this.frame = 'rot'; this.r = [0, 0, 1]; this.onFrame = null;
    this.quest('Nastav plochu impulzu tak, aby jediný impulz preklopil |0⟩ na |1⟩ (P(|1⟩) > 98 %).');
    this.buildPanel({ area: true });
    this.check = () => {
      if (this.r[2] < -0.96 && !this.flags.pi) {
        this.flags.pi = true;
        this.grant(['rabi', 'OmegaR', 'rabiosc']);
        this.say(['To je <b>π-impulz</b>: rotácia o 180° — ako hradlo X. Plocha impulzu Ω<sub>R</sub>·t je <b>uhol rotácie</b>, nie čas v sekundách.',
          'Keby si impulz predĺžil, stav by sa vrátil späť: to sú <b>Rabiho oscilácie</b>. Kmitá pravdepodobnosť, nie elektrón medzi dvoma miestami!'], () => this.next());
      }
    };
  }

  halfPulse() {
    this.quest('Jediným impulzom z |0⟩ dostaň stav na rovník (P(|1⟩) = 50 %).');
    this.buildPanel({ area: true });
    this.check = () => {
      if (Math.abs(this.r[2]) < 0.06 && !this.flags.half) {
        this.flags.half = true;
        this.say(['<b>π/2-impulz</b> — rovnomerná superpozícia. V NMR je to základný krok takmer každého experimentu.'], () => this.next());
      }
    };
  }

  tuning() {
    this.d0 = (rand() < 0.5 ? -1 : 1) * (0.8 + Math.round(rand() * 6) / 10);
    this.f = 0; this.area = Math.PI;
    this.quest('Rádio je rozladené! Nájdi rezonančnú frekvenciu tak, aby π-impulz opäť preklopil spin (P(|1⟩) > 97 %).');
    this.say(['Niekto pohol frekvenciou RF generátora. Mimo rezonancie sa spin otáča okolo <b>naklonenej osi</b> a nikdy sa úplne nepreklopí. Hľadaj rytmus hojdačky!'], () => this.buildPanel({ area: true, tune: true }));
    this.check = () => {
      if (this.r[2] < -0.94 && !this.flags.tune) {
        this.flags.tune = true;
        this.say(['Rezonancia nájdená! Presne takto sa v NMR hľadá frekvencia jadra. Rozdiel frekvencií (detuning) nakláňa os rotácie.'], () => this.next());
      }
    };
  }

  t2() {
    this.useT2 = true; this.f = this.d0; this.area = Math.PI / 2;
    this.quest('Dekoherencia T₂: urob π/2-impulz a čakaj, kým sa Blochov vektor nezmrští pod 30 % dĺžky.');
    this.say(['Skutočné spiny cítia susedov a nehomogenity poľa. Každá molekula precesuje trochu inak a fázy sa rozbiehajú: <b>T₂ (dephasing)</b>. Pomalší návrat populácií k tepelnému stavu je <b>T₁</b>.'], () => this.buildPanel({ area: true, t2: true }));
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
      this.say(['Šípka sa stiahla k osi — <b>zmiešaný stav</b> (|r| < 1). Oranžový NMR signál pritom slabol: to je <b>FID</b> (voľne doznievajúca indukcia).',
        'V NMR (napr. SpinQ) nemeriame jeden spin, ale <b>ansámbel</b> ~10²⁰ molekúl. Signál je <b>stredná hodnota</b> priečnej magnetizácie, nie jednotlivé výsledky 0/1.'], () => this.next());
    }
    // graf
    const disp = this.disp();
    this.hist.push({ p1: (1 - this.r[2]) / 2, s: disp[0] });
    if (this.hist.length > 300) this.hist.shift();
    if (this.read) this.read.innerHTML = `P(|1⟩) = ${Fmt.pct((1 - this.r[2]) / 2)} · |r| = ${Fmt.num(V3.len(this.r), 2)}`
      + (this.pulse ? ' · <b>RF impulz beží</b>' : '') + (this.stepIdx >= 4 && this.stepIdx < 5 ? ` · posun od rezonancie: ${this.flags.tune ? Fmt.num(this.delta, 1) : '?'}` : '');
    if (this.plot && this.plot.isConnected) this.drawPlot();
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
    UI.label('rf', [mx, 2.45, 0.8], this.pulse ? 'RF impulz!' : 'RF cievka', this.pulse ? 'prompt' : 'axis');
    const d = this.disp();
    r.arrow([mx, 1.7, 0], V3.add([mx, 1.7, 0], V3.scale(qToWorld(d), 0.45)), [1, 0.35, 0.45], 0.03);
    r.draw('cylinder', M4.trs([mx, 0.2, 0], 0, [0.25, 3.2, 0.25]), [0.8, 0.9, 1], { alpha: 0.25 });
    UI.label('tube', [mx, 3.8, 0], 'vzorka (ansámbel molekúl)', 'axis');
    UI.hot([mx, 0.4, 1.3], '<b>Cievky magnetu</b> — vytvárajú silné, stabilné a homogénne pole B₀.', 40);
    UI.hot([mx, 1.7, 0], '<b>RF cievka a vzorka</b>: impulzy otáčajú jadrové spiny; indukovaný signál v cievke = NMR signál.', 40);
    UI.hot([mx - 1.9, 1.7, 0], TIPS['B₀'], 30);
    // Blochova sféra
    const c = [1.6, 1.7, 0];
    Bloch.draw(r, c, 1.6, d, { labelFn: UI.label.bind(UI), key: 'r', axisNames: true });
    if (this.pulse && this.frame === 'rot') {
      const D = this.delta, ax = V3.norm([this.OR, 0, D]);
      r.rod(V3.sub(c, V3.scale(qToWorld(ax), 2)), V3.add(c, V3.scale(qToWorld(ax), 2)), [1, 1, 0.4], 0.02, { emissive: 0.8 });
    }
    UI.label('frame', [1.6, 4.1, 0], this.frame === 'lab' ? 'laboratórny rámec' : 'rotujúci rámec', 'prompt');
  }
}
