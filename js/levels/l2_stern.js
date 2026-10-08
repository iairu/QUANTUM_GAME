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
    this.quest('Vypočuj si Sterna a Gerlacha');
    this.say([
      { who: 'Otto Stern', face: '🧲', text: 'Vitaj vo Frankfurte, rok 1922! Z tejto <b>pece</b> letia atómy striebra. Každý má jeden nepárový elektrón a ten sa správa ako maličký magnet.' },
      { who: 'Walther Gerlach', face: '🧲', text: 'Zväzok pustíme cez <b>nehomogénne</b> magnetické pole (horný pól je ostrý, dolný plochý). Magnetický moment sa podľa svojej orientácie vychýli hore alebo dole.' },
      { who: 'Otto Stern', face: '🧲', text: 'Klasická predstava: magnetíky sú natočené náhodne → na tienidle by mal vzniknúť <b>spojitý pás</b>. Poďme to otestovať!' },
    ], () => this.next());
  }

  // ---------- úloha 1: klasika vs. skutočnosť ----------
  twoSpots() {
    this.quest('Vystreľ aspoň 50 atómov v KLASICKOM modeli a aspoň 50 v SKUTOČNOM (kvantovom).');
    this.check = () => {
      if (this.f.s1 || this.seen.q < 50 || this.seen.c < 50) return;
      this.f.s1 = true;
      this.ask({ q: 'Koľko stôp vytvorí skutočný (kvantový) zväzok na tienidle?', options: ['dve oddelené stopy', 'spojitý pás', 'jednu stopu v strede'], correct: 0,
        why: 'Pri meraní projekcie spinu ½ v zvolenej osi sú len dva výsledky: <b>+ħ/2</b> a <b>−ħ/2</b>.' }, () => {
        this.grant(['stern', 'gerlach', 'Sz', 'hbar', 'spinhalf']);
        this.say([
          { who: 'Walther Gerlach', face: '🧲', text: 'Hornú stopu voláme <b>S<sub>z</sub> = +ħ/2</b> (stav <b>|0⟩ ≡ |+z⟩</b>, „spin hore“), dolnú <b>S<sub>z</sub> = −ħ/2</b> (stav <b>|1⟩ ≡ |−z⟩</b>).' },
          { who: 'Otto Stern', face: '🧲', text: 'Pozor na jazyk! Experiment <b>neukázal, ako sa elektrón točí</b>. Ukázal, aké výsledky dáva presne určené meranie. A „spin ½“ neznamená polovičnú otáčku — je to názov druhu kvantového spinu.' },
        ], () => this.next());
      });
    };
    this.buildPanel();
  }

  // ---------- úloha 2: postupné merania ----------
  sequences() {
    this.edit = true; this.model = 'q';
    this.quest('Vyskúšaj zostavu A (Z+ → Z) a zostavu B (Z+ → X+ → Z). Pri každej musí na tienidlo dopadnúť aspoň 40 atómov (filtre časť pohltia).');
    this.say([
      { who: 'Otto Stern', face: '🧲', text: 'Teraz môžeš zapojiť až <b>tri magnety</b> za sebou, otáčať ich (os z = 0°, os x = 90°) a nastaviť <b>filter</b>, ktorý prepustí len jeden zväzok.' },
      { who: 'Walther Gerlach', face: '🧲', text: 'Zostava A: prvý magnet Z prepustí len „+“, druhý magnet znova Z. Zostava B: medzi ne vlož magnet X (prepúšťa „+“). Tipni si výsledok skôr, než vystrelíš!' },
    ]);
    this.check = () => {
      const sig = this.sig(), tot = this.cnt.up + this.cnt.down;
      if (sig === 'z+|z' && tot >= 40 && !this.f.A) { this.f.A = true; UI.toast(`✅ Zostava A: hore ${Fmt.pct(this.cnt.up / tot)} — atóm si „pamätá“ výsledok Z.`); }
      if (sig === 'z+|x+|z' && tot >= 40 && !this.f.B) { this.f.B = true; UI.toast(`✅ Zostava B: hore ${Fmt.pct(this.cnt.up / tot)} — znova 50/50!`); }
      if (this.f.A && this.f.B && !this.f.s2) {
        this.f.s2 = true;
        setTimeout(() => this.ask({ q: 'Prečo zostava B (Z+ → X+ → Z) dáva na konci opäť 50 : 50?', options: ['Meranie v osi x pripravilo nový stav |+x⟩; v ňom je výsledok v osi z neistý.', 'Magnet X pokazil atómy.', 'Atómy mali skryté hodnoty pre všetky osi a magnet X ich premiešal.'], correct: 0,
          why: 'Istota v jednej báze neznamená istotu v inej. <b>Meracia báza je súčasťou otázky.</b> Spin nie je šípka s vopred určenými hodnotami pre x, y aj z naraz.' }, () => {
          this.grant(['basisq', 'ket0']);
          this.next();
        }), 600);
      }
    };
    this.buildPanel();
  }

  // ---------- úloha 3: predpoveď ----------
  predict() {
    this.preset([['z', '+'], [60, 'none'], null]);
    this.quest('Predpovedz výsledok a over ho: druhý magnet je otočený o 60°.');
    this.ask({ q: 'Atómy prešli filtrom „+z“. Druhý magnet je otočený o 60° od osi z. Aký podiel pôjde do jeho hornej stopy?', options: ['približne 75 %', 'približne 50 %', 'približne 25 %', '100 %'], correct: 0,
      why: 'Pravdepodobnosť je cos²(60°/2) = cos²(30°) = ¾. Na Blochovej sfére: (1 + cos 60°)/2. Čím menší uhol medzi osami, tým istejší výsledok.' }, () => {
      this.quest('Over predpoveď: na tienidlo musí dopadnúť aspoň 100 atómov (cos²30° = 75 %).');
      this.check = () => {
        const tot = this.cnt.up + this.cnt.down;
        if (this.sig() === 'z+|60°' && tot >= 100 && !this.f.s3) {
          this.f.s3 = true;
          this.say([{ who: 'Otto Stern', face: '🧲', text: `Namerali sme ${Fmt.pct(this.cnt.up / tot)} hore. Jedno meranie dá vždy len +ħ/2 alebo −ħ/2, ale <b>štatistika mnohých opakovaní</b> prezradí pravdepodobnosť. Presne tak sa v laboratóriu overuje Bornovo pravidlo.` }], () => this.next());
        }
      };
    });
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
        UI.button((this.model === 'c' ? '● ' : '○ ') + 'Klasický model', () => { this.model = 'c'; this.resetCounts(); this.buildPanel(); }),
        UI.button((this.model === 'q' ? '● ' : '○ ') + 'Skutočnosť', () => { this.model = 'q'; this.resetCounts(); this.buildPanel(); })));
    } else {
      this.st.forEach((s, i) => {
        const box = el('div', 'station');
        const on = el('label', 'chk'); const cb = el('input'); cb.type = 'checkbox'; cb.checked = s.on;
        cb.onchange = () => { s.on = cb.checked; this.resetCounts(); this.buildPanel(); };
        on.append(cb, document.createTextNode(` Magnet ${i + 1}`));
        box.appendChild(on);
        if (s.on) {
          box.appendChild(UI.slider('os', 0, 180, 15, s.ang, (v) => { if (v !== s.ang) { s.ang = v; this.resetCounts(); } return v === 0 ? 'z' : v === 90 ? 'x' : v + '°'; }));
          const sel = el('select');
          for (const [v, t] of [['none', 'bez filtra'], ['+', 'prepusti len +'], ['-', 'prepusti len −']]) { const o = el('option', null, t); o.value = v; sel.appendChild(o); }
          sel.value = s.filter; sel.onchange = () => { s.filter = sel.value; this.resetCounts(); };
          box.appendChild(sel);
        }
        nodes.push(box);
      });
      nodes.push(UI.row(UI.button('Zostava A', () => this.preset([['z', '+'], ['z', 'none'], null])), UI.button('Zostava B', () => this.preset([['z', '+'], ['x', '+'], ['z', 'none']]))));
    }
    nodes.push(UI.row(UI.button('Vystreľ 1', () => this.fire(1)), UI.button('Vystreľ 100', () => this.fire(100), 'big'), UI.button('Vymaž', () => this.resetCounts())));
    this.stats = UI.info('');
    nodes.push(this.stats);
    UI.panelSet('Sternov–Gerlachov aparát', nodes);
    this.updStats();
  }
  updStats() {
    if (!this.stats) return;
    const tot = this.cnt.up + this.cnt.down;
    this.stats.innerHTML = this.model === 'c'
      ? `Klasický model: ${this.cnt.c} atómov — každý dopadne inam (spojitý pás).`
      : `Na tienidle: <b>hore ${this.cnt.up}</b> (${tot ? Fmt.pct(this.cnt.up / tot) : '–'}), <b>dole ${this.cnt.down}</b> (${tot ? Fmt.pct(this.cnt.down / tot) : '–'})<br>Pohltené filtrom: ${this.cnt.abs}<br><small>Zostava: ${this.sig() || '—'}</small>`;
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
    UI.label('oven', [-6.7, Y + 1, 0], 'pec<br><small>atómy Ag</small>', 'axis');
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
      UI.hot(c, `<b>Magnet ${i + 1}</b> — meria projekciu spinu do svojej osi (${s.ang}° od z). Červený ostrý pól a modrý plochý pól tvoria <b>nehomogénne</b> pole.` + (s.filter !== 'none' ? ` Filter prepustí len „${s.filter === '+' ? '+' : '−'}“, druhý zväzok pohltí čierna zarážka.` : ''), 55);
      const nm = s.ang === 0 ? 'z' : s.ang === 90 ? 'x' : s.ang + '°';
      UI.label('mag' + i, V3.add(c, [0, 1.9, 0]), `SG<sub>${nm}</sub>` + (s.filter !== 'none' ? `<br><small>filter: len ${s.filter === '+' ? '+' : '−'}</small>` : ''), 'axis');
      if (s.filter !== 'none') {
        const blocked = s.filter === '+' ? -1 : 1;
        r.draw('box', M4.trs(V3.add([s.x + 1.15, Y, 0], V3.scale(nw, blocked * 0.6)), 0, 0.3), [0.15, 0.15, 0.15]);
      }
    });
    // tienidlo
    r.draw('box', M4.trs([this.SX, Y, 0], 0, [0.08, 3.8, 3.8]), [0.85, 0.85, 0.9]);
    UI.label('screen', [this.SX, Y + 2.3, 0], 'tienidlo', 'axis');
    UI.hot([this.SX, Y, 0], `<b>Tienidlo</b>: hore ${this.cnt.up}, dole ${this.cnt.down}${this.model === 'c' ? ', klasicky ' + this.cnt.c : ''}. Každá bodka = jeden výsledok merania.`, 70);
    if (lastOn && this.model === 'q') {
      const a = lastOn.ang * Math.PI / 180, nw = [0, Math.cos(a), Math.sin(a)];
      UI.label('sp+', V3.add([this.SX + 0.3, Y, 0], V3.scale(nw, 1.3)), '+ħ/2', 'ket');
      UI.label('sp-', V3.add([this.SX + 0.3, Y, 0], V3.scale(nw, -1.3)), '−ħ/2', 'ket');
    }
    for (const h of this.hits) r.draw('lowSphere', M4.trs(h, 0, 0.045), [0.2, 0.25, 0.6], { unlit: 1 });
    for (const p of this.parts) r.draw('lowSphere', M4.trs(this.pos(p), 0, 0.06), [0.85, 0.88, 0.95], { emissive: 0.6 });
  }
}
