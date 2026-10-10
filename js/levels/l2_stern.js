'use strict';
// LEVEL 2 — Sternova–Gerlachova pec (mentori: Otto Stern & Walther Gerlach)
// Meranie spinu: dve stopy, báza je súčasťou otázky, postupné merania Z → X → Z.

class L2Stern extends Level {
  get steps() { return [this.intro, this.twoSpots, this.sequences, this.predict]; }

  setup() {
    this.cam = new OrbitCam([0, 1.5, 0], 13.5, 0.12, 0.3, 4, 24);
    this.Y = 1.5; this.SX = 6.5;
    this.st = [{ x: -3, on: true, ang: 0, filter: 'none' }, { x: 0.3, on: false, ang: 0, filter: 'none' }, { x: 3.4, on: false, ang: 0, filter: 'none' }];
    this.model = 'q'; this.parts = []; this.hits = []; this.queue = 0; this.spawnAcc = 0;
    this.cnt = { up: 0, down: 0, abs: 0, c: 0 }; this.seen = { q: 0, c: 0 }; this.f = {};
    this.edit = false;
  }

  intro() {
    this.quest(tr('Vypočuj si Sterna a Gerlacha', 'Listen to Stern and Gerlach', 'Послухай Штерна та Ґерлаха'), { easy: tr('💬 Stern & Gerlach', '💬 Stern & Gerlach', '💬 Штерн і Ґерлах'), hard: tr('SG: Ag, nehomogénne B, ±ħ/2', 'SG: Ag, inhomogeneous B, ±ħ/2', 'ШҐ: Ag, неоднорідне B, ±ħ/2') });
    this.say([
      { who: DL('l2.intro.1.0.who'), face: '🧲', text: DL('l2.intro.1.0.text') },
      { who: DL('l2.intro.1.1.who'), face: '🧲', text: DL('l2.intro.1.1.text') },
      { who: DL('l2.intro.1.2.who'), face: '🧲', text: DL('l2.intro.1.2.text') },
    ], () => this.next());
  }

  // ---------- úloha 1: klasika vs. skutočnosť ----------
  twoSpots() {
    const n = byDiff(30, 50, 80);
    this.quest(tr(`Vystreľ aspoň ${n} atómov v KLASICKOM modeli a aspoň ${n} v SKUTOČNOM (kvantovom).`, `Fire at least ${n} atoms in the CLASSICAL model and at least ${n} in REALITY (quantum).`, `Випусти щонайменше ${n} атомів у КЛАСИЧНІЙ моделі та щонайменше ${n} у РЕАЛЬНОСТІ (квантово).`), { easy: tr(`🔫 ${n} klasicky · ${n} skutočne`, `🔫 ${n} classical · ${n} real`, `🔫 ${n} класично · ${n} реально`), hard: tr(`N ≥ ${n}: klasicky vs. kvantovo · počet stôp?`, `N ≥ ${n}: classical vs. quantum · number of spots?`, `N ≥ ${n}: класично проти квантово · кількість плям?`) });
    this.check = () => {
      const need = byDiff(30, 50, 80);
      if (this.f.s1 || this.seen.q < need || this.seen.c < need) return;
      this.f.s1 = true;
      this.ask({ q: DL('l2.twoSpots.1.q'), options: [DL('l2.twoSpots.1.options.0'), DL('l2.twoSpots.1.options.1'), DL('l2.twoSpots.1.options.2')], correct: 0,
        why: DL('l2.twoSpots.1.why') }, () => {
        this.grant(['stern', 'gerlach', 'Sz', 'hbar', 'spinhalf']);
        this.say([
          { who: DL('l2.twoSpots.2.0.who'), face: '🧲', text: DL('l2.twoSpots.2.0.text') },
          { who: DL('l2.twoSpots.2.1.who'), face: '🧲', text: DL('l2.twoSpots.2.1.text') },
        ], () => this.next());
      });
    };
    this.buildPanel();
  }

  // ---------- úloha 2: postupné merania ----------
  sequences() {
    this.edit = true; this.model = 'q';
    const n = byDiff(25, 40, 60);
    this.quest(tr(`Vyskúšaj zostavu A (Z+ → Z) a zostavu B (Z+ → X+ → Z). Pri každej musí na tienidlo dopadnúť aspoň ${n} atómov (filtre časť pohltia).`, `Try setup A (Z+ → Z) and setup B (Z+ → X+ → Z). For each, at least ${n} atoms must reach the screen (filters absorb some).`, `Спробуй схему A (Z+ → Z) і схему B (Z+ → X+ → Z). Для кожної на екран має потрапити щонайменше ${n} атомів (фільтри частину поглинуть).`), { easy: tr(`🧲 Zostava A · Zostava B · ${n} atómov`, `🧲 Setup A · Setup B · ${n} atoms`, `🧲 Схема A · Схема B · ${n} атомів`), hard: `A: Z+ → Z · B: Z+ → X+ → Z · N ≥ ${n}` });
    this.say([
      { who: DL('l2.sequences.1.0.who'), face: '🧲', text: DL('l2.sequences.1.0.text') },
      { who: DL('l2.sequences.1.1.who'), face: '🧲', text: DL('l2.sequences.1.1.text') },
    ]);
    this.check = () => {
      const sig = this.sig(), tot = this.cnt.up + this.cnt.down, need = byDiff(25, 40, 60);
      if (sig === 'z+|z' && tot >= need && !this.f.A) { this.f.A = true; UI.toast(tr(`✅ Zostava A: hore ${Fmt.pct(this.cnt.up / tot)} — atóm si „pamätá“ výsledok Z.`, `✅ Setup A: up ${Fmt.pct(this.cnt.up / tot)} — the atom “remembers” the Z result.`, `✅ Схема A: угору ${Fmt.pct(this.cnt.up / tot)} — атом «пам’ятає» результат Z.`)); }
      if (sig === 'z+|x+|z' && tot >= need && !this.f.B) { this.f.B = true; UI.toast(tr(`✅ Zostava B: hore ${Fmt.pct(this.cnt.up / tot)} — znova 50/50!`, `✅ Setup B: up ${Fmt.pct(this.cnt.up / tot)} — 50/50 again!`, `✅ Схема B: угору ${Fmt.pct(this.cnt.up / tot)} — знову 50/50!`)); }
      if (this.f.A && this.f.B && !this.f.s2) {
        this.f.s2 = true;
        setTimeout(() => this.ask({ q: DL('l2.sequences.2.q'), options: [DL('l2.sequences.2.options.0'), DL('l2.sequences.2.options.1'), DL('l2.sequences.2.options.2')], correct: 0,
          why: DL('l2.sequences.2.why') }, () => {
          this.grant(['basisq', 'ket0']);
          this.next();
        }), 600);
      }
    };
    this.buildPanel();
  }

  // ---------- úloha 3: predpoveď ----------
  predict() {
    const a = byDiff(60, 60, [30, 45, 120, 135][Math.floor(rand() * 4)]), p = Math.cos(a * Math.PI / 360) ** 2;
    this.hideTheory = true; // teória v paneli by prezradila odpoveď
    this.preset([['z', '+'], [a, 'none'], null]);
    this.quest(tr(`Predpovedz výsledok a over ho: druhý magnet je otočený o ${a}°.`, `Predict the result and test it: the second magnet is rotated by ${a}°.`, `Передбач результат і перевір його: другий магніт повернуто на ${a}°.`), { easy: tr(`🤔 Tipni: magnet ${a}°`, `🤔 Guess: magnet ${a}°`, `🤔 Вгадай: магніт ${a}°`), hard: `P(+ | +z, ${a}°) = ?` });
    const pc = (x) => Fmt.pct(x), opts = [p, 1 - p, 0.5, 1].map((x) => tr(`približne ${pc(x)}`, `about ${pc(x)}`, `приблизно ${pc(x)}`));
    this.ask({
      q: DL('l2.predict.1', a),
      options: opts, correct: 0,
      why: DL('l2.predict.2', a, pc(p)),
    }, () => {
      this.hideTheory = false; this.updStats();
      const need = byDiff(60, 100, 200);
      this.quest(tr(`Over predpoveď: na tienidlo musí dopadnúť aspoň ${need} atómov (cos²(${a}°/2) = ${pc(p)}).`, `Test the prediction: at least ${need} atoms must reach the screen (cos²(${a}°/2) = ${pc(p)}).`, `Перевір передбачення: на екран має потрапити щонайменше ${need} атомів (cos²(${a}°/2) = ${pc(p)}).`), { easy: tr(`🔫 ${need} atómov`, `🔫 ${need} atoms`, `🔫 ${need} атомів`), hard: `N ≥ ${need} · cos²(${a}°/2)` });
      this.check = () => {
        const tot = this.cnt.up + this.cnt.down;
        if (this.sig() === `z+|${a}°` && tot >= byDiff(60, 100, 200) && !this.f.s3) {
          this.f.s3 = true;
          this.say([{ who: DL('l2.predict.3'), face: '🧲', text: DL('l2.predict.4', Fmt.pct(this.cnt.up / tot), pc(p)) }], () => this.next());
        }
      };
    });
  }

  // presná teória pre aktuálnu zostavu: nepolarizovaný zväzok → magnety s filtrami.
  // Vráti { up: P(hore | dopadol), pass: podiel atómov, ktoré prejdú filtrami }.
  theory() {
    const act = this.st.filter((s) => s.on);
    if (!act.length) return null;
    let r = [0, 0, 0], pass = 1, up = 0.5;
    for (const s of act) {
      const a = s.ang * Math.PI / 180, n = [Math.sin(a), 0, Math.cos(a)], pp = Q.probAlong(r, n);
      if (s.filter === '+') { pass *= pp; r = n; up = 1; }
      else if (s.filter === '-') { pass *= 1 - pp; r = V3.scale(n, -1); up = 0; }
      else { r = V3.scale(n, 2 * pp - 1); up = pp; } // zabudnutý výsledok → zmes pozdĺž osi n
    }
    return { up, pass, r };
  }

  sig() {
    return this.st.filter((s) => s.on).map((s) => (s.ang === 0 ? 'z' : s.ang === 90 ? 'x' : s.ang + '°') + (s.filter === 'none' ? '' : s.filter)).join('|');
  }
  resetCounts() { this.cnt = { up: 0, down: 0, abs: 0, c: 0 }; this.hits = []; this.parts = []; this.queue = 0; }
  preset(cfg) {
    cfg.forEach((c, i) => {
      const s = this.st[i];
      if (!c) { s.on = false; return; }
      s.on = true; s.ang = c[0] === 'z' ? 0 : c[0] === 'x' ? 90 : c[0]; s.filter = c[1];
    });
    this.resetCounts(); this.buildPanel();
  }

  buildPanel() {
    const nodes = [];
    if (!this.edit) {
      nodes.push(UI.row(
        UI.button((this.model === 'c' ? '● ' : '○ ') + tr('Klasický model', 'Classical model', 'Класична модель'), () => { this.model = 'c'; this.resetCounts(); this.buildPanel(); }),
        UI.button((this.model === 'q' ? '● ' : '○ ') + tr('Skutočnosť', 'Reality', 'Реальність'), () => { this.model = 'q'; this.resetCounts(); this.buildPanel(); })));
    } else {
      this.st.forEach((s, i) => {
        const box = el('div', 'station');
        const on = el('label', 'chk'); const cb = el('input'); cb.type = 'checkbox'; cb.checked = s.on;
        cb.onchange = () => { s.on = cb.checked; this.resetCounts(); this.buildPanel(); };
        on.append(cb, document.createTextNode(` Magnet ${i + 1}`));
        box.appendChild(on);
        if (s.on) {
          box.appendChild(UI.slider(tr('os', 'axis', 'вісь'), 0, 180, 5, s.ang, (v) => { if (v !== s.ang) { s.ang = v; this.resetCounts(); } return v === 0 ? 'z' : v === 90 ? 'x' : v + '°'; }));
          const sel = el('select');
          for (const [v, t] of [['none', tr('bez filtra', 'no filter', 'без фільтра')], ['+', tr('prepusti len +', 'pass only +', 'пропускати лише +')], ['-', tr('prepusti len −', 'pass only −', 'пропускати лише −')]]) { const o = el('option', null, t); o.value = v; sel.appendChild(o); }
          sel.value = s.filter; sel.onchange = () => { s.filter = sel.value; this.resetCounts(); };
          box.appendChild(sel);
        }
        nodes.push(box);
      });
      nodes.push(UI.row(UI.button(tr('Zostava A', 'Setup A', 'Схема A'), () => this.preset([['z', '+'], ['z', 'none'], null])), UI.button(tr('Zostava B', 'Setup B', 'Схема B'), () => this.preset([['z', '+'], ['x', '+'], ['z', 'none']]))));
    }
    nodes.push(UI.row(UI.button(tr('Vystreľ 1', 'Fire 1', 'Постріл 1'), () => this.fire(1)), UI.button(tr('Vystreľ 100', 'Fire 100', 'Постріл 100'), () => this.fire(100), 'big'), UI.button(tr('Vymaž', 'Clear', 'Очистити'), () => this.resetCounts())));
    this.stats = UI.info('');
    this.chart = UI.chart(300, 120);
    nodes.push(this.stats, this.chart);
    UI.panelSet(tr('Sternov–Gerlachov aparát', 'Stern–Gerlach apparatus', 'Прилад Штерна–Ґерлаха'), nodes);
    this.updStats();
  }
  updStats() {
    if (!this.stats) return;
    const tot = this.cnt.up + this.cnt.down;
    const pu = tot ? Fmt.pct(this.cnt.up / tot) : '–', pd = tot ? Fmt.pct(this.cnt.down / tot) : '–';
    this.stats.innerHTML = this.model === 'c'
      ? tr(`Klasický model: ${this.cnt.c} atómov — každý dopadne inam (spojitý pás).`, `Classical model: ${this.cnt.c} atoms — each lands somewhere else (a continuous band).`, `Класична модель: ${this.cnt.c} атомів — кожен падає деінде (суцільна смуга).`)
      : tr(`Na tienidle: <b>hore ${this.cnt.up}</b> (${pu}), <b>dole ${this.cnt.down}</b> (${pd})<br>Pohltené filtrom: ${this.cnt.abs}<br><small>Zostava: ${this.sig() || '—'}</small>`,
        `On the screen: <b>up ${this.cnt.up}</b> (${pu}), <b>down ${this.cnt.down}</b> (${pd})<br>Absorbed by filters: ${this.cnt.abs}<br><small>Setup: ${this.sig() || '—'}</small>`, `На екрані: <b>угору ${this.cnt.up}</b> (${pu}), <b>униз ${this.cnt.down}</b> (${pd})<br>Поглинуто фільтрами: ${this.cnt.abs}<br><small>Схема: ${this.sig() || '—'}</small>`);
    // teória (presný výpočet) vs. meranie
    const th = this.model === 'q' ? this.theory() : null, showTh = th && !this.hideTheory && !Settings.hard;
    if (showTh) this.stats.innerHTML += `<br><small>${tr('teória', 'theory', 'теорія')}: ${tr('hore', 'up', 'угору')} ${Fmt.pct(th.up)}, ${tr('prejde filtrami', 'passes the filters', 'проходить крізь фільтри')} ${Fmt.pct(th.pass)}</small>`;
    if (this.model !== 'q') { UI.drawChart(this.chart, { x0: 0, x1: 1, y0: 0, y1: 1, yticks: [[0, '0'], [1, '1']], legend: [['#9aa6d1', tr('klasický pás: bez dvoch stôp', 'classical band: no two spots', 'класична смуга: жодних двох плям')]] }); return; }
    const mu = tot ? this.cnt.up / tot : 0, md = tot ? this.cnt.down / tot : 0, fired = tot + this.cnt.abs;
    const bars = [
      { x: 0.5, w: 0.5, y: mu, color: '#4f8cff', label: tot ? Fmt.pct(mu) : '' },
      { x: 1.5, w: 0.5, y: md, color: '#ff6b7d', label: tot ? Fmt.pct(md) : '' },
      { x: 2.5, w: 0.5, y: fired ? tot / fired : 0, color: '#5fe08a', label: fired ? Fmt.pct(tot / fired) : '' },
    ];
    if (showTh) bars.push({ x: 0.5, w: 0.62, y: th.up, color: '#ffd25a', outline: true }, { x: 1.5, w: 0.62, y: 1 - th.up, color: '#ffd25a', outline: true }, { x: 2.5, w: 0.62, y: th.pass, color: '#ffd25a', outline: true });
    UI.drawChart(this.chart, {
      x0: 0, x1: 3, y0: 0, y1: 1.15, yticks: [[0, '0'], [0.5, '½'], [1, '1']],
      xticks: [[0.5, '+ħ/2'], [1.5, '−ħ/2'], [2.5, tr('prešlo', 'passed', 'пройшло')]], bars,
      legend: [['#4f8cff', tr('namerané', 'measured', 'виміряно')], ...(showTh ? [['#ffd25a', tr('teória', 'theory', 'теорія')]] : [])],
    });
  }

  fire(n) { this.queue += n; }

  // vytvor dráhu jedného atómu
  spawn() {
    const Y = this.Y, act = this.st.filter((s) => s.on), pts = [[-6.2, Y, 0]];
    if (!act.length) return;
    const nW = (a) => [0, Math.cos(a), Math.sin(a)], nQ = (a) => [Math.sin(a), 0, Math.cos(a)];
    if (this.model === 'c') { // klasický náhodne natočený magnetík → spojitá výchylka
      const s = act[0], a = s.ang * Math.PI / 180, u = 2 * rand() - 1, f = 2 * Math.PI * rand(), m = [Math.sqrt(1 - u * u) * Math.cos(f), Math.sqrt(1 - u * u) * Math.sin(f), u];
      const v = V3.dot(m, nQ(a));
      pts.push([s.x - 0.7, Y, 0], V3.add([s.x + 0.7, Y, 0], V3.scale(nW(a), v * 0.45)));
      const hit = V3.add([this.SX - 0.06, Y, 0], V3.add(V3.scale(nW(a), v * 1.3), [0, (rand() - 0.5) * 0.05, (rand() - 0.5) * 0.05]));
      pts.push(hit);
      this.parts.push({ pts, d: 0, kind: 'c', hit });
      return;
    }
    let r = [0, 0, 0], last = null, sign = 0; // nepolarizovaný zväzok = maximálne zmiešaný stav
    for (let i = 0; i < act.length; i++) {
      const s = act[i], a = s.ang * Math.PI / 180;
      sign = rand() < Q.probAlong(r, nQ(a)) ? 1 : -1;
      r = V3.scale(nQ(a), sign);
      pts.push([s.x - 0.7, Y, 0], V3.add([s.x + 0.7, Y, 0], V3.scale(nW(a), sign * 0.45)));
      if (s.filter !== 'none' && (s.filter === '+') !== (sign > 0)) {
        pts.push(V3.add([s.x + 1.1, Y, 0], V3.scale(nW(a), sign * 0.6)));
        this.parts.push({ pts, d: 0, kind: 'abs' });
        return;
      }
      last = a;
      if (i < act.length - 1) pts.push(V3.add([s.x + 1.4, Y, 0], V3.scale(nW(a), sign * 0.6)));
    }
    const hit = V3.add([this.SX - 0.06, Y, 0], V3.add(V3.scale(nW(last), sign * 1.3), [0, (rand() - 0.5) * 0.18, (rand() - 0.5) * 0.18]));
    pts.push(hit);
    this.parts.push({ pts, d: 0, kind: sign > 0 ? 'up' : 'down', hit });
  }

  viewState() {
    const th = this.model === 'q' ? this.theory() : null;
    if (!th) return { r: [0, 0, 0], note: tr('Nepolarizovaný zväzok z pece: maximálne zmiešaný stav I/2.', 'The unpolarised beam from the furnace: the maximally mixed state I/2.', 'Неполяризований пучок із печі: максимально змішаний стан I/2.') };
    return { r: th.r, note: tr('Stav atómov, ktoré prešli poslednou zapnutou stanicou (teória; nefiltrovaný výsledok = zmes).', 'The state of atoms after the last active station (theory; an unfiltered outcome = a mixture).', 'Стан атомів після останньої активної станції (теорія; невідфільтрований результат = суміш).') };
  }

  update(dt) {
    this.t += dt;
    if (this.queue > 0) {
      this.spawnAcc += dt * 80;
      while (this.spawnAcc >= 1 && this.queue > 0) { this.spawnAcc -= 1; this.queue--; this.spawn(); }
    } else this.spawnAcc = 0;
    const speed = 9 * dt;
    this.parts = this.parts.filter((p) => {
      p.d += speed;
      let L = 0;
      for (let i = 1; i < p.pts.length; i++) L += V3.len(V3.sub(p.pts[i], p.pts[i - 1]));
      if (p.d < L) return true;
      if (p.kind === 'abs') this.cnt.abs++;
      else {
        if (p.kind === 'c') { this.cnt.c++; this.seen.c++; } else { this.cnt[p.kind]++; this.seen.q++; }
        this.hits.push(p.hit); if (this.hits.length > 700) this.hits.shift();
      }
      this.updStats();
      this.check && this.check();
      return false;
    });
  }

  pos(p) {
    let d = p.d;
    for (let i = 1; i < p.pts.length; i++) {
      const L = V3.len(V3.sub(p.pts[i], p.pts[i - 1]));
      if (d <= L) return V3.lerp(p.pts[i - 1], p.pts[i], d / L);
      d -= L;
    }
    return p.pts[p.pts.length - 1];
  }

  draw(r) {
    const Y = this.Y;
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('box', M4.trs([0, -0.05, 0], 0, [16, 0.1, 6]), [0.18, 0.2, 0.3], { pattern: 1 });
    // pec
    r.draw('box', M4.trs([-6.7, Y, 0], 0, 1), [1, 0.5, 0.15], { emissive: 0.4 + 0.2 * Math.sin(this.t * 7) });
    UI.label('oven', [-6.7, Y + 1, 0], tr('pec<br><small>atómy Ag</small>', 'furnace<br><small>Ag atoms</small>', 'піч<br><small>атоми Ag</small>'), 'axis');
    UI.hot([-6.7, Y, 0], TIP_PATTERNS[1][1], 50);
    r.rod([-6.2, Y, 0], [this.SX, Y, 0], [0.5, 0.5, 0.7], 0.008, { alpha: 0.4 });
    // magnety
    let lastOn = null;
    this.st.forEach((s, i) => {
      const c = [s.x, Y, 0], a = s.ang * Math.PI / 180, nw = [0, Math.cos(a), Math.sin(a)];
      if (!s.on) { r.draw('box', M4.trs(c, 0, [1.4, 0.05, 0.05]), [0.4, 0.4, 0.5], { alpha: 0.4 }); return; }
      lastOn = s;
      r.draw('cone', M4.alignY(V3.add(c, V3.scale(nw, 1.05)), V3.scale(nw, -1), 0.7, 0.55), [0.85, 0.25, 0.25]);
      r.draw('box', M4.alignY(V3.add(c, V3.scale(nw, -0.85)), nw, 0.45, 1.1), [0.25, 0.35, 0.85]);
      const sg = s.filter === '+' ? '+' : '−';
      UI.hot(c, tr(`<b>Magnet ${i + 1}</b> — meria projekciu spinu do svojej osi (${s.ang}° od z). Červený ostrý pól a modrý plochý pól tvoria <b>nehomogénne</b> pole.` + (s.filter !== 'none' ? ` Filter prepustí len „${sg}“, druhý zväzok pohltí čierna zarážka.` : ''),
        `<b>Magnet ${i + 1}</b> — measures the spin projection onto its axis (${s.ang}° from z). The red sharp pole and the blue flat pole form an <b>inhomogeneous</b> field.` + (s.filter !== 'none' ? ` The filter passes only “${sg}”; the black stopper absorbs the other beam.` : ''), `<b>Магніт ${i + 1}</b> — вимірює проєкцію спіну на свою вісь (${s.ang}° від z). Червоний гострий полюс і синій плаский полюс утворюють <b>неоднорідне</b> поле.` + (s.filter !== 'none' ? ` Фільтр пропускає лише «${sg}»; чорна заглушка поглинає інший пучок.` : '')), 55);
      const nm = s.ang === 0 ? 'z' : s.ang === 90 ? 'x' : s.ang + '°';
      UI.label('mag' + i, V3.add(c, [0, 1.9, 0]), `SG<sub>${nm}</sub>` + (s.filter !== 'none' ? `<br><small>${tr('filter: len', 'filter: only', 'фільтр: лише')} ${sg}</small>` : ''), 'axis');
      if (s.filter !== 'none') {
        const blocked = s.filter === '+' ? -1 : 1;
        r.draw('box', M4.trs(V3.add([s.x + 1.15, Y, 0], V3.scale(nw, blocked * 0.6)), 0, 0.3), [0.15, 0.15, 0.15]);
      }
    });
    // tienidlo
    r.draw('box', M4.trs([this.SX, Y, 0], 0, [0.08, 3.8, 3.8]), [0.85, 0.85, 0.9]);
    UI.label('screen', [this.SX, Y + 2.3, 0], tr('tienidlo', 'screen', 'екран'), 'axis');
    UI.hot([this.SX, Y, 0], tr(`<b>Tienidlo</b>: hore ${this.cnt.up}, dole ${this.cnt.down}${this.model === 'c' ? ', klasicky ' + this.cnt.c : ''}. Každá bodka = jeden výsledok merania.`, `<b>Screen</b>: up ${this.cnt.up}, down ${this.cnt.down}${this.model === 'c' ? ', classical ' + this.cnt.c : ''}. Each dot = one measurement outcome.`, `<b>Екран</b>: угору ${this.cnt.up}, униз ${this.cnt.down}${this.model === 'c' ? ', класично ' + this.cnt.c : ''}. Кожна точка = один результат вимірювання.`), 70);
    if (lastOn && this.model === 'q') {
      const a = lastOn.ang * Math.PI / 180, nw = [0, Math.cos(a), Math.sin(a)];
      UI.label('sp+', V3.add([this.SX + 0.3, Y, 0], V3.scale(nw, 1.3)), '+ħ/2', 'ket');
      UI.label('sp-', V3.add([this.SX + 0.3, Y, 0], V3.scale(nw, -1.3)), '−ħ/2', 'ket');
    }
    for (const h of this.hits) r.draw('lowSphere', M4.trs(h, 0, 0.045), [0.2, 0.25, 0.6], { unlit: 1 });
    for (const p of this.parts) r.draw('lowSphere', M4.trs(this.pos(p), 0, 0.06), [0.85, 0.88, 0.95], { emissive: 0.6 });
  }
}
