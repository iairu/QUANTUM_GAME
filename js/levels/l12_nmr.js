'use strict';
// LEVEL 12 — NMR dielňa (mentor: Edward Purcell) — praktické ovládanie NMR počítača (odomknutý od začiatku).
// Ladenie vysielača na Larmorovu frekvenciu ν₀ = γB₀/2π, prúdový RF impulz v priečnej cievke (θ = γB₁τ),
// meracie sekvencie (90° → FID), kalibrácia impulzu podľa nuly signálu, shim a spinové echo proti nehomogenite poľa.

const NMR_GAMMA = 42.577; // γ/2π protónu v MHz/T
const NMR_K = 0.6e-3;     // B₁ na 1 A prúdu v cievke (T/A)
const NMR_PHASES = { x: [1, 0, 0], y: [0, 1, 0], '−x': [-1, 0, 0], '−y': [0, -1, 0] };
const NMR_SEQ = ['none', 'p90', 'p180', 'echo'];

class L12Nmr extends Level {
  get steps() { return [this.intro, this.tune, this.pulse, this.sequence, this.calibrate, this.echo]; }

  setup() {
    this.cam = new OrbitCam([0, 1.5, 0], 9, 0.55, 0.28, 4, 18);
    this.stage = null; this.f = {}; this.m = [0, 0, 1]; this.anim = null; this.pulsing = 0; this.labPh = 0;
    this.B0 = 1.0; this.nuRF = 42.0; this.I = 1; this.tau = 5; this.phase = 'x'; this.eff = 1; this.seq = 'p90';
    this.shim = 0.2; this.echoOn = false; this.tauE = 3; this.run = null; this.trace = null;
  }
  get nu0() { return NMR_GAMMA * this.B0; }                  // MHz
  get dKHz() { return (this.nu0 - this.nuRF) * 1000; }        // rozladenie v kHz
  flip(I = this.I, tau = this.tau) { return 2 * Math.PI * NMR_GAMMA * 1e6 * NMR_K * I * tau * 1e-6 * this.eff; } // θ = γB₁τ (rad)
  flipDeg(I, tau) { return this.flip(I, tau) * 180 / Math.PI; }

  disp() {
    const a = this.anim;
    if (!a) return this.m;
    return V3.rotate(a.v0, a.axis, a.ang * a.t);
  }
  // RF impulz: rotácia magnetizácie okolo osi v priečnej rovine (fáza impulzu), pri rozladení naklonená k z
  firePulse(theta, ph, done) {
    if (this.anim) return;
    const n = NMR_PHASES[ph], d = this.stage === 'pulse' ? clamp(this.dKHz / 20, -0.5, 0.5) : 0, axis = V3.norm([n[0], n[1], d]);
    this.anim = { v0: this.m, axis, ang: theta, t: 0, done };
    this.m = V3.rotate(this.m, axis, theta);
    this.pulsing = 1; Sound.sfx('cast');
  }

  intro() {
    this.quest(tr('Vypočuj si Edwarda Purcella', 'Listen to Edward Purcell', 'Послухай Едварда Перселла'), { easy: tr('💬 Purcell', '💬 Purcell', '💬 Перселл'), hard: 'ν₀ = γB₀/2π · θ = γB₁τ · FID · echo' });
    this.say([DL('l12.intro.1.0'), DL('l12.intro.1.1'), DL('l12.intro.1.2'), DL('l12.intro.1.3')], () => { this.grant(['purcell', 'nmrsetup']); this.next(); });
  }

  // ---------- 1 · ladenie vysielača na Larmorovu frekvenciu ----------
  tune() {
    this.stage = 'tune'; this.m = [1, 0, 0]; this.solvedT = false;
    if (this.sub.B0 == null) this.sub.B0 = Math.round((0.93 + rand() * 0.12) * 1000) / 1000;
    this.B0 = this.sub.B0; this.nuRF = 40;
    const tol = this.tolT = byDiff(3, 1.5, 0.6);
    this.quest(tr(`Nalaď frekvenciu vysielača ν<sub>RF</sub> na Larmorovu frekvenciu protónov (|Δν| < ${Fmt.num(tol, 1)} kHz). V rotujúcom rámci sa potom magnetizácia zastaví.`, `Tune the transmitter frequency ν<sub>RF</sub> to the proton Larmor frequency (|Δν| < ${Fmt.num(tol, 1)} kHz). In the rotating frame the magnetisation then stops.`, `Налаштуй частоту передавача ν<sub>RF</sub> на ларморову частоту протонів (|Δν| < ${Fmt.num(tol, 1)} кГц). В обертовій системі намагніченість тоді зупиниться.`),
      { easy: tr('📻 ν<sub>RF</sub> → ν₀ (zastav šípku)', '📻 ν<sub>RF</sub> → ν₀ (stop the arrow)', '📻 ν<sub>RF</sub> → ν₀ (зупини стрілку)'), hard: `ν₀ = γB₀/2π, γ/2π = ${NMR_GAMMA} MHz/T · |ν₀ − ν<sub>RF</sub>| < ${Fmt.num(tol, 1)} kHz` });
    this.read = UI.info('');
    this.slNu = UI.slider(tr('frekvencia vysielača ν<sub>RF</sub> (MHz)', 'transmitter frequency ν<sub>RF</sub> (MHz)', 'частота передавача ν<sub>RF</sub> (МГц)'), 38, 48, byDiff(0.005, 0.002, 0.001), this.nuRF, (v) => { this.nuRF = v; this.checkTune(); return v.toFixed(3) + ' MHz'; });
    this.slNuC = UI.slider(tr('hrubé ladenie (MHz)', 'coarse tuning (MHz)', 'грубе налаштування (МГц)'), 38, 48, 0.1, this.nuRF, (v) => { UI.snapSlider(this.slNu, v, false); return v.toFixed(1) + ' MHz'; });
    UI.panelSet(tr('Spektrometer: vysielač', 'Spectrometer: transmitter', 'Спектрометр: передавач'), [
      UI.info(`B₀ = <b>${Fmt.num(this.B0, 3)} T</b> · γ/2π = ${NMR_GAMMA} MHz/T${Settings.easy ? ` · ν₀ ≈ ${this.nu0.toFixed(2)} MHz` : ''}`),
      this.slNuC, this.slNu, this.read,
      Settings.hard ? null : UI.info(tr('Larmorovu frekvenciu neladíš priamo — určuje ju pole B₀ a jadro (ν₀ = γB₀/2π). Ladíš vysielač, kým s ňou nie je v rezonancii.', 'You do not tune the Larmor frequency itself — the field B₀ and the nucleus fix it (ν₀ = γB₀/2π). You tune the transmitter until it is in resonance with it.', 'Ларморову частоту не налаштовують напряму — її задають поле B₀ і ядро (ν₀ = γB₀/2π). Налаштовують передавач, доки він не буде в резонансі з нею.'), 'tip'),
    ].filter(Boolean));
    this.updRead();
  }
  checkTune() {
    this.updRead();
    if (this.stage !== 'tune' || this.solvedT || Math.abs(this.dKHz) >= this.tolT) return;
    this.solvedT = true;
    UI.snapSlider(this.slNu, this.nu0);
    this.grant(['larmortune']);
    this.say([DL('l12.tune.ok', this.nu0.toFixed(3))], () => {
      this.ask({ q: DL('l12.tune.q.q'), options: [DL('l12.tune.q.options.0'), DL('l12.tune.q.options.1'), DL('l12.tune.q.options.2')], correct: 0, why: DL('l12.tune.q.why') }, () => this.next());
    });
  }

  // ---------- 2 · prúd do RF cievky: 90° impulz ----------
  pulse() {
    this.stage = 'pulse'; this.m = [0, 0, 1]; this.nuRF = this.nu0; this.I = 0.5; this.tau = 5; this.phase = 'x'; this.solvedP = false; this.pi = 0;
    this.targets = Settings.hard ? [90, 180, 90] : [90, 180];
    this.loadPulse();
  }
  loadPulse() {
    const T = this.targets[this.pi], tol = this.tolP = byDiff(8, 4, 2), ph = this.pi === 2 ? 'y' : 'x';
    this.m = [0, 0, 1]; this.wantPh = ph;
    this.quest(tr(`Impulz ${this.pi + 1}/${this.targets.length}: nastav prúd I a dĺžku τ tak, aby impulz z |0⟩ preklopil magnetizáciu o ${T}° okolo osi ${ph} (±${tol}°).`, `Pulse ${this.pi + 1}/${this.targets.length}: set the current I and the length τ so the pulse tips the magnetisation from |0⟩ by ${T}° about the ${ph} axis (±${tol}°).`, `Імпульс ${this.pi + 1}/${this.targets.length}: налаштуй струм I і тривалість τ так, щоб імпульс із |0⟩ відхилив намагніченість на ${T}° навколо осі ${ph} (±${tol}°).`),
      { easy: `⚡ ${T}°<sub>${ph}</sub>`, hard: `θ = γB₁τ, B₁ = k·I · ${T}°<sub>${ph}</sub> ± ${tol}°` });
    this.loadPulsePanel();
  }
  loadPulsePanel() {
    this.read = UI.info('');
    UI.panelSet(tr('RF cievka (priečna, os x)', 'RF coil (transverse, x axis)', 'РЧ-котушка (поперечна, вісь x)'), [
      this.slI = UI.slider(tr('prúd v cievke I (A)', 'coil current I (A)', 'струм у котушці I (А)'), 0, 2, 0.05, this.I, (v) => { this.I = v; this.updRead(); return Fmt.num(v, 2) + ' A'; }),
      this.slTau = UI.slider(tr('dĺžka impulzu τ (µs)', 'pulse length τ (µs)', 'тривалість імпульсу τ (мкс)'), 0, 40, 0.5, this.tau, (v) => { this.tau = v; this.updRead(); return Fmt.num(v, 1) + ' µs'; }),
      UI.row(...Object.keys(NMR_PHASES).map((k) => UI.button((this.phase === k ? '● ' : '○ ') + tr('fáza ', 'phase ', 'фаза ') + k, () => { this.phase = k; this.loadPulsePanel(); }))),
      UI.row(UI.button(tr('⚡ Pustiť prúdový impulz', '⚡ Fire the current pulse', '⚡ Подати імпульс струму'), () => this.shootPulse(), 'big'), UI.button('↺ |0⟩', () => { if (!this.anim) this.m = [0, 0, 1]; })),
      this.read,
      Settings.hard ? null : UI.info(tr('B₁ = k·I s k = 0,6 mT/A. Uhol preklopenia θ = γB₁τ — rovnaký uhol dá silnejší a kratší alebo slabší a dlhší impulz.', 'B₁ = k·I with k = 0.6 mT/A. The flip angle θ = γB₁τ — the same angle comes from a stronger, shorter or a weaker, longer pulse.', 'B₁ = k·I, k = 0,6 мТл/А. Кут відхилення θ = γB₁τ — той самий кут дає сильніший і коротший або слабший і довший імпульс.'), 'tip'),
    ].filter(Boolean));
    this.updRead();
  }
  shootPulse() {
    if (this.anim || this.solvedP) return;
    this.m = [0, 0, 1];
    const th = this.flip(), T = this.targets[this.pi];
    this.firePulse(th, this.phase, () => {
      this.updRead();
      const ok = Math.abs(th * 180 / Math.PI - T) <= this.tolP && this.phase === this.wantPh;
      if (!ok) { UI.toast(tr(`Preklopenie ${Fmt.num(th * 180 / Math.PI, 0)}° okolo ${this.phase} — cieľ je ${T}° okolo ${this.wantPh}.`, `Flipped by ${Fmt.num(th * 180 / Math.PI, 0)}° about ${this.phase} — the target is ${T}° about ${this.wantPh}.`, `Відхилення ${Fmt.num(th * 180 / Math.PI, 0)}° навколо ${this.phase} — ціль ${T}° навколо ${this.wantPh}.`), 3200); return; }
      this.m = V3.rotate([0, 0, 1], NMR_PHASES[this.phase], T * Math.PI / 180);
      const msg = DL(T === 90 ? (this.pi === 2 ? 'l12.pulse.ok90y' : 'l12.pulse.ok90') : 'l12.pulse.ok180');
      this.say([msg], () => {
        if (++this.pi < this.targets.length) return this.loadPulse();
        this.grant(['flipangle']);
        this.next();
      });
    });
  }

  // ---------- 3 · meracia sekvencia a FID ----------
  sequence() {
    this.stage = 'seq'; this.m = [0, 0, 1]; this.seq = 'none'; this.trace = null; this.f.ran = {};
    this.quest(tr('Vyber meraciu sekvenciu, ktorá dá v prijímacej cievke čo najsilnejší signál (FID). Vyskúšaj aspoň tri.', 'Choose the measurement sequence that gives the strongest signal (FID) in the receiver coil. Try at least three.', 'Обери вимірювальну послідовність, що дає найсильніший сигнал (FID) у приймальній котушці. Спробуй щонайменше три.'),
      { easy: tr('📈 ktorá sekvencia dá signál?', '📈 which sequence gives a signal?', '📈 яка послідовність дає сигнал?'), hard: 'S(t) ∝ M<sub>⊥</sub>(0) cos(2πΔν t) e<sup>−t/T₂*</sup>' });
    this.buildSeq();
  }
  seqName(s) {
    return { none: tr('bez impulzu → zber', 'no pulse → acquire', 'без імпульсу → збір'), p90: '90°<sub>x</sub> → ' + tr('zber', 'acquire', 'збір'), p180: '180°<sub>x</sub> → ' + tr('zber', 'acquire', 'збір'), echo: '90°<sub>x</sub> – τ – 180°<sub>y</sub> – τ → ' + tr('echo', 'echo', 'відлуння') }[s];
  }
  buildSeq() {
    this.read = UI.info('');
    this.chart = UI.chart(300, 120);
    UI.panelSet(tr('Pulzné sekvencie', 'Pulse sequences', 'Імпульсні послідовності'), [
      ...NMR_SEQ.map((s) => UI.row(UI.button((this.seq === s ? '● ' : '○ ') + this.seqName(s), () => { this.seq = s; this.buildSeq(); }))),
      UI.row(UI.button(tr('▶ Spusti a zaznamenaj signál', '▶ Run and record the signal', '▶ Запусти й запиши сигнал'), () => this.runSeq(), 'big')),
      this.chart, this.read,
    ]);
    this.drawTrace();
  }
  // signál v prijímacej cievke: priečna magnetizácia po sekvencii (demodulovaný, Δν = 0,4 kHz, T₂* = 4 ms)
  seqSignal(s, t) {
    const M = { none: 0, p90: 1, p180: 0, echo: 1 }[s], T2s = 4, tE = 6;
    if (!M) return 0;
    const dec = s === 'echo' ? Math.exp(-(((t - tE) / T2s) ** 2) * 2) * Math.exp(-t / 40) : Math.exp(-t / T2s);
    return M * dec * Math.cos(2 * Math.PI * 0.4 * t);
  }
  runSeq() {
    if (this.anim) return;
    const s = this.seq;
    this.m = [0, 0, 1];
    const after = () => {
      this.trace = s; this.f.ran[s] = true; this.updRead(); this.drawTrace();
      if (Object.keys(this.f.ran).length >= 3 && this.f.ran.p90 && !this.f.seqDone) {
        this.f.seqDone = true;
        this.grant(['fid']);
        this.say([DL('l12.sequence.ok')], () => {
          this.ask({ q: DL('l12.sequence.q.q'), options: [DL('l12.sequence.q.options.0'), DL('l12.sequence.q.options.1'), DL('l12.sequence.q.options.2')], correct: 0, why: DL('l12.sequence.q.why') }, () => this.next());
        });
      }
    };
    if (s === 'none') return after();
    this.firePulse(s === 'p180' ? Math.PI : Math.PI / 2, 'x', after);
  }
  drawTrace() {
    if (!this.chart) return;
    const s = this.trace;
    UI.drawChart(this.chart, { x0: 0, x1: 16, y0: -1.05, y1: 1.05, xlabel: tr('čas po impulze (ms)', 'time after the pulse (ms)', 'час після імпульсу (мс)'),
      xticks: [[0, '0'], [4, '4'], [8, '8'], [12, '12'], [16, '16']], yticks: [[-1, '−1'], [0, '0'], [1, '1']],
      curves: s ? [{ f: (t) => this.seqSignal(s, t), color: '#fb6' }] : [], legend: s ? [['#fb6', this.seqName(s).replace(/<[^>]+>/g, '')]] : [] });
  }

  // ---------- 4 · kalibrácia impulzu podľa nuly signálu ----------
  calibrate() {
    this.stage = 'cal'; this.m = [0, 0, 1]; this.I = 1; this.tau = 4; this.solvedC = false; this.calRuns = [];
    if (this.sub.eff == null) this.sub.eff = Math.round((rand() < 0.5 ? 0.82 + rand() * 0.08 : 1.1 + rand() * 0.08) * 100) / 100;
    this.eff = this.sub.eff;
    const tol = this.tolC = byDiff(0.08, 0.05, 0.03);
    this.quest(tr(`Cievka dáva iné B₁, než hovorí výpočet (neznáma chyba). Pri I = 1 A hľadaj dĺžku τ, pri ktorej signál po impulze zmizne — to je skutočný 180° impulz (|S| < ${Fmt.num(tol, 2)}).`, `The coil delivers a different B₁ than the calculation says (unknown error). At I = 1 A find the length τ at which the signal after the pulse vanishes — that is the real 180° pulse (|S| < ${Fmt.num(tol, 2)}).`, `Котушка дає інше B₁, ніж каже розрахунок (невідома похибка). При I = 1 А знайди тривалість τ, за якої сигнал після імпульсу зникає, — це справжній 180° імпульс (|S| < ${Fmt.num(tol, 2)}).`),
      { easy: tr('🎯 nájdi nulu signálu (180°)', '🎯 find the signal null (180°)', '🎯 знайди нуль сигналу (180°)'), hard: `S ∝ sin(γB₁τ) · |S| < ${Fmt.num(tol, 2)} · τ₉₀ = τ₁₈₀/2` });
    this.read = UI.info('');
    this.chart = UI.chart(300, 120);
    UI.panelSet(tr('Kalibrácia (nutačná krivka)', 'Calibration (nutation curve)', 'Калібрування (нутаційна крива)'), [
      this.slTau = UI.slider(tr('dĺžka impulzu τ (µs), I = 1 A', 'pulse length τ (µs), I = 1 A', 'тривалість імпульсу τ (мкс), I = 1 А'), 2, 30, byDiff(0.5, 0.25, 0.25), this.tau, (v) => { this.tau = v; return Fmt.num(v, 2) + ' µs'; }),
      UI.row(UI.button(tr('⚡ Impulz + zber FID', '⚡ Pulse + acquire FID', '⚡ Імпульс + збір FID'), () => this.calShot(), 'big')),
      this.chart, this.read,
    ]);
    this.updRead(); this.drawCal();
  }
  calShot() {
    if (this.anim || this.solvedC) return;
    this.m = [0, 0, 1];
    const th = this.flip(1, this.tau), S = Math.sin(th);
    this.firePulse(th, 'x', () => {
      this.calRuns.push([this.tau, S]); this.updRead(); this.drawCal();
      if (Math.abs(S) < this.tolC && Math.cos(th) < 0) {
        this.solvedC = true;
        const t180 = Math.PI / this.flip(1, 1);
        UI.snapSlider(this.slTau, t180); this.m = [0, 0, -1];
        this.grant(['nutation']);
        this.say([DL('l12.calibrate.ok', Fmt.num(t180, 1), Fmt.num(t180 / 2, 1), Fmt.num(this.eff * 100, 0))], () => this.next());
      } else if (Math.abs(S) < this.tolC) UI.toast(tr('Signál je nulový — ale magnetizácia je stále hore (0° alebo 360°). Hľadaj nulu, pri ktorej sa preklopí nadol.', 'The signal is zero — but the magnetisation is still up (0° or 360°). Look for the null where it is flipped down.', 'Сигнал нульовий — але намагніченість досі вгорі (0° або 360°). Шукай нуль, за якого вона перевернута вниз.'), 3400);
    });
  }
  drawCal() {
    if (!this.chart) return;
    UI.drawChart(this.chart, { x0: 0, x1: 30, y0: -1.05, y1: 1.05, xlabel: tr('τ (µs)', 'τ (µs)', 'τ (мкс)'), xticks: [[0, '0'], [10, '10'], [20, '20'], [30, '30']], yticks: [[-1, '−1'], [0, '0'], [1, '1']],
      curves: Settings.easy ? [{ f: (t) => Math.sin(this.flip(1, t)), color: '#5a6690', dash: [4, 4], width: 1 }] : [],
      points: this.calRuns.map(([t, s]) => ({ x: t, y: s, color: '#fb6', r: 4 })), legend: [['#fb6', tr('amplitúda FID', 'FID amplitude', 'амплітуда FID')]] });
  }

  // ---------- 5 · nehomogenita poľa: shim a spinové echo ----------
  echo() {
    this.stage = 'echo'; this.m = [0, -1, 0]; this.shim = 0.2; this.echoOn = false; this.tauE = 3; this.solvedE = false; this.run = null; this.eff = 1;
    const need = this.needE = byDiff(0.6, 0.7, 0.8);
    this.quest(tr(`Pole B₀ nie je homogénne: izochromaty sa rozbiehajú a FID rýchlo zhasne. Dosiahni signál ≥ ${Fmt.pct(need)} v čase zberu t = 10 ms (shim a/alebo spinové echo).`, `The field B₀ is not homogeneous: the isochromats fan out and the FID dies fast. Reach a signal ≥ ${Fmt.pct(need)} at the acquisition time t = 10 ms (shim and/or spin echo).`, `Поле B₀ неоднорідне: ізохромати розходяться, і FID швидко згасає. Досягни сигналу ≥ ${Fmt.pct(need)} у момент збору t = 10 мс (шим і/або спінове відлуння).`),
      { easy: tr('🔧 signál v t = 10 ms', '🔧 signal at t = 10 ms', '🔧 сигнал у t = 10 мс'), hard: `S(10 ms) ≥ ${Fmt.pct(need)} · T₂* vs. T₂ · 90° – τ – 180° – τ` });
    this.buildEcho();
  }
  // šírka rozladenia izochromát (Hz): shim ju zmenší, ale nie na nulu
  get sigma() { return 25 + 175 * (1 - this.shim); }
  echoSignal(t) {
    const T2 = 60, s = 2 * Math.PI * this.sigma / 1000; // rad/ms
    const dt = this.echoOn && t >= this.tauE ? t - 2 * this.tauE : t;
    return Math.exp(-t / T2) * Math.exp(-((s * dt) ** 2) / 2);
  }
  buildEcho() {
    this.read = UI.info('');
    this.chart = UI.chart(300, 120);
    UI.panelSet(tr('Korekcia nepresností', 'Correcting inaccuracies', 'Виправлення неточностей'), [
      UI.slider(tr('shim (homogenita B₀)', 'shim (homogeneity of B₀)', 'шим (однорідність B₀)'), 0, 1, 0.05, this.shim, (v) => { this.shim = v; this.updRead(); this.drawEcho(); return `σ ≈ ${Math.round(this.sigma)} Hz`; }),
      UI.row(UI.button((this.echoOn ? '☑ ' : '☐ ') + tr('spinové echo: 180°<sub>y</sub> v čase τ', 'spin echo: 180°<sub>y</sub> at time τ', 'спінове відлуння: 180°<sub>y</sub> у момент τ'), () => { this.echoOn = !this.echoOn; this.buildEcho(); })),
      this.echoOn ? UI.slider(tr('τ (ms)', 'τ (ms)', 'τ (мс)'), 1, 8, byDiff(0.5, 0.5, 0.25), this.tauE, (v) => { this.tauE = v; this.updRead(); this.drawEcho(); return Fmt.num(v, 2) + ' ms'; }) : null,
      UI.row(UI.button(tr('▶ Spusti sekvenciu (zber v 10 ms)', '▶ Run the sequence (acquire at 10 ms)', '▶ Запусти послідовність (збір у 10 мс)'), () => this.runEcho(), 'big')),
      this.chart, this.read,
    ].filter(Boolean));
    this.updRead(); this.drawEcho();
  }
  runEcho() {
    if (this.run || this.solvedE) return;
    this.run = { t: 0 }; Sound.sfx('cast');
  }
  echoDone() {
    const S = this.echoSignal(10);
    this.updRead();
    if (S >= this.needE) {
      this.solvedE = true;
      this.grant(['spinecho', 'shim']);
      this.say([DL('l12.echo.ok', Fmt.pct(S)), DL('l12.echo.chain')], () => {
        this.ask({ q: DL('l12.echo.q.q'), options: [DL('l12.echo.q.options.0'), DL('l12.echo.q.options.1'), DL('l12.echo.q.options.2')], correct: 0, why: DL('l12.echo.q.why') }, () => this.next());
      });
    } else UI.toast(tr(`Signál v 10 ms je len ${Fmt.pct(S)}. Samotný shim nestačí — refokusuj izochromaty echom (180° v čase τ, echo v 2τ).`, `The signal at 10 ms is only ${Fmt.pct(S)}. Shimming alone is not enough — refocus the isochromats with an echo (180° at τ, echo at 2τ).`, `Сигнал у 10 мс лише ${Fmt.pct(S)}. Самого шиму замало — перефокусуй ізохромати відлунням (180° у τ, відлуння в 2τ).`), 3600);
  }
  drawEcho() {
    if (!this.chart) return;
    UI.drawChart(this.chart, { x0: 0, x1: 16, y0: 0, y1: 1.05, xlabel: tr('čas (ms)', 'time (ms)', 'час (мс)'), xticks: [[0, '0'], [4, '4'], [8, '8'], [12, '12'], [16, '16']], yticks: [[0, '0'], [0.5, '½'], [1, '1']],
      curves: [{ f: (t) => this.echoSignal(t), color: '#fb6' }, { f: (t) => Math.exp(-t / 60), color: '#5a6690', dash: [4, 4], width: 1 }],
      vlines: [{ x: 10, color: '#7f7' }, ...(this.echoOn ? [{ x: this.tauE, color: '#b98cff' }] : [])], hlines: [{ y: this.needE, color: '#7f7' }],
      points: this.run ? [{ x: this.run.t, y: this.echoSignal(this.run.t), color: '#fff', r: 4 }] : [],
      legend: [['#fb6', '|S(t)|'], ['#5a6690', 'e<sup>−t/T₂</sup>'.replace(/<[^>]+>/g, '')]] });
  }

  updRead() {
    if (!this.read) return;
    const v = this.disp();
    if (this.stage === 'tune') this.read.innerHTML = `ν<sub>RF</sub> = ${this.nuRF.toFixed(3)} MHz · Δν = ν₀ − ν<sub>RF</sub> = <b>${this.solvedT || Settings.easy ? Fmt.num(this.dKHz, 1) : Math.abs(this.dKHz) > 50 ? (this.dKHz > 0 ? '≫ 0' : '≪ 0') : Fmt.num(this.dKHz, 1)} kHz</b><br>${tr('V rotujúcom rámci sa magnetizácia točí rýchlosťou Δν.', 'In the rotating frame the magnetisation turns at the rate Δν.', 'В обертовій системі намагніченість обертається зі швидкістю Δν.')}`;
    else if (this.stage === 'pulse') this.read.innerHTML = `B₁ = k·I = ${Fmt.num(NMR_K * this.I * 1000, 2)} mT · θ = γB₁τ = <b>${Fmt.num(this.flipDeg(), 1)}°</b> (${tr('fáza', 'phase', 'фаза')} ${this.phase})<br>M = (${v.map((x) => Fmt.num(x, 2)).join(', ')})`;
    else if (this.stage === 'seq') this.read.innerHTML = `M<sub>⊥</sub> = ${Fmt.num(Math.hypot(v[0], v[1]), 2)} · M<sub>z</sub> = ${Fmt.num(v[2], 2)}<br>${tr('Vyskúšané', 'Tried', 'Випробувано')}: ${Object.keys(this.f.ran || {}).length} / 3`;
    else if (this.stage === 'cal') this.read.innerHTML = `${tr('menovitý uhol', 'nominal angle', 'номінальний кут')}: ${Fmt.num(2 * Math.PI * NMR_GAMMA * NMR_K * this.tau * 1e3 * 180 / Math.PI / 1000, 0)}°` + (this.calRuns.length ? ` · ${tr('posledná amplitúda FID', 'last FID amplitude', 'остання амплітуда FID')}: <b>${Fmt.num(this.calRuns[this.calRuns.length - 1][1], 2)}</b>` : '') + `<br>M = (${v.map((x) => Fmt.num(x, 2)).join(', ')})`;
    else if (this.stage === 'echo') this.read.innerHTML = `σ ≈ ${Math.round(this.sigma)} Hz → T₂* ≈ ${Fmt.num(1000 / (2 * Math.PI * this.sigma), 1)} ms · T₂ = 60 ms<br>S(10 ms) = <b>${Fmt.pct(this.echoSignal(10))}</b>${this.echoOn ? ` · echo ${tr('v', 'at', 'у')} 2τ = ${Fmt.num(2 * this.tauE, 1)} ms` : ''}`;
  }

  viewState() { return this.stage === 'echo' ? null : { r: this.disp() }; }

  update(dt) {
    this.t += dt;
    this.pulsing = Math.max(0, this.pulsing - dt * 1.2);
    this.labPh += dt * 4;
    if (this.anim) {
      this.anim.t = Math.min(1, this.anim.t + dt / 0.9);
      if (this.anim.t >= 1) { const d = this.anim.done; this.anim = null; d && d(); }
      this.updRead();
    }
    // rotujúci rámec: pri rozladení sa priečna magnetizácia točí okolo z rýchlosťou Δν
    if (this.stage === 'tune' && !this.solvedT) this.m = V3.rotate(this.m, [0, 0, 1], clamp(this.dKHz / 40, -3, 3) * dt * 2 * Math.PI * 0.5);
    if (this.run) {
      this.run.t += dt * 4; // 4 ms simulovaného času za sekundu
      this.drawEcho();
      if (this.run.t >= 10) { this.run = null; this.echoDone(); }
    }
  }

  // izochromaty (echo): fázy v čase t, 180° impulz v τ zrkadlí fázy
  isoPhases(t) {
    const out = [], s = this.sigma / 1000;
    for (let k = -6; k <= 6; k++) {
      const d = (k / 6) * s * 2 * Math.PI * 1.6;
      out.push(this.echoOn && t >= this.tauE ? -d * this.tauE + d * (t - this.tauE) : d * t);
    }
    return out;
  }

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('box', M4.trs([0, -0.06, 0], 0, [13, 0.1, 9]), [0.14, 0.17, 0.22], { pattern: 1 });
    // magnet: póly hore a dole → B₀ zvisle (os z)
    const c = [0, 1.6, 0], pulse = this.pulsing > 0 || (this.anim && this.stage !== 'echo');
    for (const s of [-1, 1]) r.draw('cylinder', M4.trs([0, s > 0 ? 3.55 : -0.05, 0], 0, [1.9, 0.35, 1.9]), s > 0 ? [0.75, 0.3, 0.3] : [0.3, 0.4, 0.8], { pattern: 4 });
    for (const a of [0.8, 2.4, 4.0, 5.6]) r.draw('box', M4.trs([Math.cos(a) * 1.7, 1.75, Math.sin(a) * 1.7], 0, [0.25, 3.5, 0.25]), [0.4, 0.42, 0.48]);
    r.arrow([-2.4, 0.4, 0], [-2.4, 3.2, 0], [0.5, 0.8, 1], 0.06);
    UI.label('nB0', [-2.4, 3.55, 0], `B₀ = ${Fmt.num(this.B0, 3)} T`, 'ket');
    UI.hot([0, 3.6, 0], tr('<b>Magnet</b> — vytvára silné, stále a čo najhomogénnejšie pole B₀ (v SpinQ permanentný magnet ≈ 1 T). Určuje Larmorovu frekvenciu ν₀ = γB₀/2π.', '<b>Magnet</b> — creates a strong, steady and as homogeneous as possible field B₀ (a ≈ 1 T permanent magnet in SpinQ). It fixes the Larmor frequency ν₀ = γB₀/2π.', '<b>Магніт</b> — створює сильне, стале й якомога однорідніше поле B₀ (у SpinQ — постійний магніт ≈ 1 Тл). Він задає ларморову частоту ν₀ = γB₀/2π.'), 60);
    // vzorka a RF cievka (Helmholtzov pár s osou x — pole B₁ je priečne)
    r.draw('cylinder', M4.trs([0, 0.4, 0], 0, [0.22, 2.6, 0.22]), [0.8, 0.9, 1], { alpha: 0.3 });
    for (const s of [-1, 1]) {
      const p = [s * 0.95, 1.6, 0];
      r.draw('torus', M4.orient(p, [1, 0, 0], 0.75), pulse ? [1, 0.75, 0.25] : [0.75, 0.5, 0.25], { emissive: pulse ? 1 : 0.1 });
      if (pulse) for (let k = 0; k < 6; k++) { const a = this.t * 9 + k * 1.05; r.sphere(V3.add(p, [0, Math.cos(a) * 0.75, Math.sin(a) * 0.75]), 0.05, [1, 0.95, 0.5], { emissive: 1, unlit: 1 }); }
    }
    r.arrow([1.9, 1.6, 0], [2.6, 1.6, 0], pulse ? [1, 0.85, 0.3] : [0.45, 0.4, 0.3], 0.04, { emissive: pulse ? 0.8 : 0 });
    UI.label('nB1', [2.95, 1.6, 0], pulse ? tr('B₁ (impulz!)', 'B₁ (pulse!)', 'B₁ (імпульс!)') : tr('RF cievka (os x)', 'RF coil (x axis)', 'РЧ-котушка (вісь x)'), pulse ? 'prompt' : 'axis');
    UI.hot([0.95, 1.6, 0], tr('<b>RF cievka</b> v priečnom smere (os x): krátky prúdový impulz na frekvencii ν<sub>RF</sub> vytvorí pole B₁ ⟂ B₀, ktoré magnetizáciu preklopí o θ = γB₁τ. Tá istá cievka potom zachytí indukované napätie precesujúcej magnetizácie — FID.', '<b>RF coil</b> in the transverse direction (x axis): a short current pulse at the frequency ν<sub>RF</sub> creates a field B₁ ⟂ B₀ that tips the magnetisation by θ = γB₁τ. The same coil then picks up the voltage induced by the precessing magnetisation — the FID.', '<b>РЧ-котушка</b> в поперечному напрямку (вісь x): короткий імпульс струму на частоті ν<sub>RF</sub> створює поле B₁ ⟂ B₀, яке відхиляє намагніченість на θ = γB₁τ. Та сама котушка потім вловлює напругу, наведену прецесуючою намагніченістю, — FID.'), 50);
    if (this.stage === 'echo') {
      const t = this.run ? this.run.t : 0;
      r.draw('circle', M4.trs(c, 0, 1.2), [0.55, 0.75, 1]);
      this.isoPhases(t).forEach((ph, k) => {
        const a = -Math.PI / 2 + ph, col = k === 6 ? [1, 0.35, 0.45] : [1, 0.6 + 0.03 * k, 0.4];
        r.arrow(c, V3.add(c, qToWorld([Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0])), col, 0.022, { emissive: 0.4 });
      });
      UI.label('niso', V3.add(c, [0, 1.6, 0]), tr('izochromaty v priečnej rovine', 'isochromats in the transverse plane', 'ізохромати в поперечній площині'), 'axis');
      UI.hot(c, tr('<b>Izochromaty</b> — skupiny spinov s mierne iným B₀. Rozbiehajú sa (T₂*); 180° impulz zrkadlí ich fázy a v čase 2τ sa opäť stretnú — spinové echo.', '<b>Isochromats</b> — groups of spins with a slightly different B₀. They fan out (T₂*); a 180° pulse mirrors their phases and at time 2τ they meet again — the spin echo.', '<b>Ізохромати</b> — групи спінів із трохи іншим B₀. Вони розходяться (T₂*); 180° імпульс віддзеркалює їхні фази, і в момент 2τ вони знову сходяться — спінове відлуння.'), 50);
    } else Bloch.draw(r, c, 1.15, this.disp(), { labelFn: UI.label.bind(UI), key: 'nmr', axisNames: true, labels: this.stage !== 'tune' });
    UI.label('nframe', [0, 4.3, 0], tr('rotujúci rámec (ν<sub>RF</sub>)', 'rotating frame (ν<sub>RF</sub>)', 'обертова система (ν<sub>RF</sub>)'), 'axis');
  }
}
