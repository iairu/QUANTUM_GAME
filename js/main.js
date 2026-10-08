'use strict';
// Hlavná slučka, kamera, základná trieda levelu, hub (ostrov s portálmi) a uloženie postupu.

class OrbitCam {
  constructor(target, dist, yaw = 0.6, pitch = 0.35, min = 2, max = 30) { Object.assign(this, { target, dist, yaw, pitch, min, max }); }
  eye() {
    const cp = Math.cos(this.pitch);
    return [this.target[0] + this.dist * cp * Math.sin(this.yaw), this.target[1] + this.dist * Math.sin(this.pitch), this.target[2] + this.dist * cp * Math.cos(this.yaw)];
  }
  drag(dx, dy) { this.yaw -= dx * 0.008; this.pitch = clamp(this.pitch + dy * 0.008, -1.2, 1.45); }
  zoom(d) { this.dist = clamp(this.dist * (1 + d * 0.001), this.min, this.max); }
}

// ------------------------------------------------------------------
// Základ pre všetky levely: kroky (questy), mentor, odmeny, záverečný kvíz.
// ------------------------------------------------------------------
class Level {
  constructor(def) { Object.assign(this, def); }
  enter() {
    this.cam = new OrbitCam([0, 0, 0], 6, 0.7, 0.35, 2.5, 20);
    this.stepIdx = -1; this.mistakes = 0; this.t = 0;
    Game.r.fog = 0;
    this.setup();
    UI.setHud(`${this.num} · ${this.title}`, '');
    this.next();
  }
  exit() { UI.panelHide(); }
  setup() {}
  update() {}
  draw() {}
  quest(text) { UI.setHud(`${this.num} · ${this.title}`, text); }
  next() {
    this.stepIdx++;
    const s = this.steps[this.stepIdx];
    if (s) s.call(this); else this.finale();
  }
  say(lines, done) { UI.say(lines.map((t) => (typeof t === 'string' ? { who: this.mentor, face: this.face, text: t } : t)), done); }
  ask(q, done) { UI.quiz({ who: this.mentor, face: this.face, ...q }, (ok) => { if (!ok) this.mistakes++; done && done(ok); }); }
  grant(ids) { Game.unlock(ids); }
  finale() {
    UI.panelHide();
    this.quest('Záverečná skúška jazyka');
    this.say(['Výborne! Ešte posledná skúška: <b>jazykové pasce</b>. Vyber správnu formuláciu — v kvantovom svete sa veľa chýb robí slovami, nie výpočtom.'], () => {
      UI.quizSeries(TRAPS[this.num].map((q) => ({ who: this.mentor, face: this.face, ...q })), (m) => {
        this.mistakes += m;
        const stars = this.mistakes === 0 ? 3 : this.mistakes <= 2 ? 2 : 1;
        Game.completeLevel(this.num, stars);
        this.say([`Level dokončený! Hodnotenie: <b>${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</b> (chyby: ${this.mistakes}).<br>Nové karty nájdeš v <b>Kódexe</b> (klávesa C).`], () => Game.backToHub());
      });
    });
  }
}

// ------------------------------------------------------------------
// Hub: ostrov „Hilbertov ostrov“ s portálmi do levelov.
// ------------------------------------------------------------------
const Hub = {
  player: { p: [0, 0, 6], heading: Math.PI, phase: 0 },
  cam: new OrbitCam([0, 1, 0], 9, 0, 0.38, 4, 22),
  portals: [],
  crystals: [],
  init() {
    const n = LEVELS.length;
    this.portals = LEVELS.map((L, i) => {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2, p = [Math.cos(a) * 20, 0, Math.sin(a) * 20];
      return { L, p, dir: V3.norm(V3.scale(p, -1)), npc: V3.add(p, V3.scale(V3.norm([-Math.sin(a), 0, Math.cos(a)]), 3.2)) };
    });
    const syms = ['ψ', 'ħ', '⟨φ|ψ⟩', '⊗', 'ρ', 'Σ', 'e<sup>iφ</sup>', '|0⟩', '|1⟩', '†', 'Ĥ', '|Φ⁺⟩'];
    this.crystals = syms.map((s, i) => {
      const a = (i / syms.length) * Math.PI * 2 + 0.26, r = i % 2 ? 11 : 30;
      return { s, p: [Math.cos(a) * r, 2.2 + (i % 3) * 0.6, Math.sin(a) * r], k: i };
    });
  },
  enter(fromLevel) {
    Game.r.fog = 0.012;
    UI.setHud('Hilbertov ostrov', Game.nextQuestText());
    if (fromLevel) {
      const pt = this.portals[fromLevel - 1];
      this.player.p = V3.add(pt.p, V3.scale(pt.dir, 4.5));
      this.player.heading = Math.atan2(pt.dir[0], pt.dir[2]);
      this.cam.yaw = this.player.heading + Math.PI;
    }
  },
  exit() {},
  update(dt) {
    const pl = this.player;
    pl.phase += dt * 2.2;
    if (!UI.busy) {
      let f = 0, s = 0;
      const k = Game.keys;
      if (k.KeyW || k.ArrowUp) f += 1;
      if (k.KeyS || k.ArrowDown) f -= 1;
      if (k.KeyA || k.ArrowLeft) s -= 1;
      if (k.KeyD || k.ArrowRight) s += 1;
      if (f || s) {
        const fw = [-Math.sin(this.cam.yaw), 0, -Math.cos(this.cam.yaw)], rt = [-fw[2], 0, fw[0]];
        const dir = V3.norm(V3.add(V3.scale(fw, f), V3.scale(rt, s))), sp = (k.ShiftLeft ? 11 : 7) * dt;
        let np = V3.add(pl.p, V3.scale(dir, sp));
        if (V3.len(np) > 33) np = V3.scale(V3.norm(np), 33);
        for (const pt of this.portals) { // nevojdi do podstavca portálu
          const d = V3.sub(np, pt.p);
          if (V3.len(d) < 1.6) np = V3.add(pt.p, V3.scale(V3.norm(d), 1.6));
        }
        pl.p = np;
        pl.heading = Math.atan2(dir[0], dir[2]);
      }
    }
    this.cam.target = V3.add(pl.p, [0, 1.2, 0]);
    // najbližší portál
    this.near = null;
    for (const pt of this.portals) if (V3.len(V3.sub(pt.p, pl.p)) < 4.2) this.near = pt;
    this.nearGuide = V3.len(pl.p) < 3.6;
  },
  interact() {
    if (this.nearGuide) return Game.guideTalk();
    if (!this.near) return;
    const L = this.near.L;
    if (!Game.isUnlocked(L.num)) {
      UI.toast(`🔒 Najprv dokonči level ${L.num - 1}.`);
      return;
    }
    Game.enterLevel(L.num);
  },
  draw(r) {
    const pl = this.player, t = r.time;
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, -0.35, 0], 0, 200), [0.07, 0.2, 0.42], { pattern: 2 });          // more
    r.draw('cylinder', M4.trs([0, -1.2, 0], 0, [35, 1.2, 35]), [0.22, 0.3, 0.5]);              // ostrov
    r.draw('disk', M4.trs([0, 0.001, 0], 0, 35), [0.16, 0.24, 0.4], { pattern: 1 });
    // centrálna plošina so sprievodkyňou
    r.draw('cylinder', M4.trs([0, 0, 0], 0, [2.6, 0.12, 2.6]), [0.35, 0.42, 0.7]);
    const gy = 1.6 + Math.sin(t * 1.3) * 0.15;
    r.sphere([0, gy, 0], 0.55, [1, 0.75, 0.3], { emissive: 0.6 });
    r.draw('torus', M4.orient([0, gy, 0], [Math.sin(t), 1, Math.cos(t)], 0.9), [1, 0.85, 0.5], { emissive: 0.4 });
    UI.label('guide', [0, gy + 1.1, 0], '✨ Amplitúda<br><small>sprievodkyňa</small>', 'npc');
    // portály
    for (const pt of this.portals) {
      const L = pt.L, open = Game.isUnlocked(L.num), done = Game.progress.stars[L.num];
      const col = open ? L.color : [0.35, 0.35, 0.4], c = V3.add(pt.p, [0, 2.6, 0]);
      r.draw('cylinder', M4.trs(pt.p, 0, [1.4, 0.4, 1.4]), [0.3, 0.33, 0.45]);
      r.draw('torus', M4.orient(c, pt.dir, 2.1), col, { emissive: open ? 0.5 : 0 });
      r.draw('disk', M4.orient(c, pt.dir, 2.0), col, { alpha: open ? 0.35 + 0.1 * Math.sin(t * 2 + L.num) : 0.15, emissive: 0.8, unlit: 1 });
      // mentor
      const np = pt.npc;
      r.draw('cylinder', M4.trs(np, 0, [0.35, 1.1, 0.35]), V3.scale(L.color, 0.8));
      r.sphere(V3.add(np, [0, 1.45, 0]), 0.32, [0.95, 0.85, 0.75]);
      const st = done ? ' ' + '★'.repeat(done) + '☆'.repeat(3 - done) : '';
      UI.hot(c, `<b>Portál ${L.num}: ${L.title}</b><br>${LEVEL_TIPS[L.num]}${open ? '' : '<br>🔒 Najprv dokonči predchádzajúci level.'}`, 60);
      UI.hot(V3.add(np, [0, 1.2, 0]), `<b>${L.mentor}</b> — mentor levelu ${L.num}.`, 30);
      UI.label('portal' + L.num, V3.add(c, [0, 2.9, 0]), `<b>${L.num} · ${L.title}</b>${st}<br><small>${open ? L.face + ' ' + L.mentor : '🔒 zamknuté'}</small>`, 'portal' + (open ? '' : ' locked'));
    }
    // plávajúce kryštály so symbolmi
    for (const c of this.crystals) {
      const p = V3.add(c.p, [0, Math.sin(t * 0.8 + c.k) * 0.3, 0]);
      r.draw('box', M4.mul(M4.trs(p, t * 0.5 + c.k, 0.55), M4.trs([0, 0, 0], 0, [1, 1.6, 1])), [0.5, 0.8, 1], { emissive: 0.3, alpha: 0.75 });
      UI.label('cr' + c.k, V3.add(p, [0, 1.2, 0]), c.s, 'sym', CRYSTAL_TIPS[c.s]);
      UI.hot(p, CRYSTAL_TIPS[c.s], 30);
    }
    // hráč: „Psíčko“ — kvantový stav ψ s rotujúcou (nepozorovateľnou) globálnou fázou
    const bob = Math.sin(t * 3) * 0.08, pc = V3.add(pl.p, [0, 1 + bob, 0]);
    r.sphere(pc, 0.42, [0.3, 0.95, 1], { emissive: 0.8 });
    r.draw('circle', M4.trs(pc, 0, 0.75), [0.6, 1, 1]);
    const ph = [Math.cos(pl.phase) * 0.75, 0, Math.sin(pl.phase) * 0.75];
    r.arrow(pc, V3.add(pc, ph), [1, 0.85, 0.3], 0.035, { emissive: 0.5 });
    r.sphere(pc, 0.62, [0.4, 0.8, 1], { alpha: 0.18 });
    UI.label('player', V3.add(pc, [0, 0.95, 0]), 'ψ', 'player');
    UI.hot(pc, '<b>Ty — Psíčko (stav ψ)</b>. Zlatá ručička je tvoja <b>globálna fáza</b>: točí sa, ale nedá sa zmerať.', 40);
    UI.hot([0, gy, 0], '<b>Amplitúda</b> — sprievodkyňa. Podíď k nej a stlač E.', 40);
    if (this.near) {
      const L = this.near.L;
      UI.label('prompt', V3.add(pl.p, [0, 2.4, 0]), Game.isUnlocked(L.num) ? `[E] Vstúpiť: ${L.title}` : '🔒 zamknuté', 'prompt');
    } else if (this.nearGuide) UI.label('prompt', V3.add(pl.p, [0, 2.4, 0]), '[E] Hovoriť s Amplitúdou', 'prompt');
  },
};

const LEVEL_TIPS = {
  1: 'Komplexné čísla: amplitúda ako ručička hodín, fáza, i² = −1, interferencia.',
  2: 'Meranie spinu: dve stopy, ±ħ/2, meracia báza je súčasťou otázky.',
  3: 'Blochova sféra: hradlá ako rotácie, relatívna vs. globálna fáza, meranie.',
  4: 'Superpozícia vs. zmes, matica hustoty ρ, koherencie, dekoherencia.',
  5: 'Bra-ket gramatika: stav, otázka, číslo, operátor, pravdepodobnosť.',
  6: 'NMR: B₀, Zeemanove hladiny, precesia, Rabiho oscilácie, π-impulz, T₂.',
  7: 'Previazanosť, Bellov stav, nemožnosť signalizácie, CHSH hra.',
  8: 'Jazyk a realita: Bohr, Kant, Wittgenstein, Stodola, Bohm, kolaps.',
};
const CRYSTAL_TIPS = {
  'ψ': 'ψ — kvantový stav (vlnová funkcia).', 'ħ': 'ħ = h/2π — redukovaná Planckova konštanta.',
  '⟨φ|ψ⟩': '⟨φ|ψ⟩ — bra-ket: komplexné číslo (amplitúda prekrytia).', '⊗': '⊗ — tenzorový súčin: skladá systémy.',
  'ρ': 'ρ — matica hustoty.', 'Σ': 'Σ — suma (napr. rozvoj stavu do bázy).', 'e<sup>iφ</sup>': 'e^{iφ} — fázový faktor, bod na jednotkovej kružnici.',
  '|0⟩': TIPS['|0⟩'], '|1⟩': TIPS['|1⟩'], '†': '† — dýka, hermitovské združenie.', 'Ĥ': TIPS['Ĥ'], '|Φ⁺⟩': '|Φ⁺⟩ — Bellov (maximálne previazaný) stav.',
};

// ------------------------------------------------------------------
// Hra
// ------------------------------------------------------------------
const Game = {
  keys: {},
  progress: { stars: {}, codex: new Set(), introSeen: false },
  init() {
    const canvas = $('#gl');
    try { this.r = new Renderer(canvas); }
    catch (e) { $('#fatal').style.display = 'flex'; $('#fatal').innerHTML = '<div>Tvoj prehliadač nepodporuje WebGL2 (OpenGL ES 3.0).<br><small>' + e.message + '</small></div>'; return; }
    UI.init();
    this.load();
    this.levels = LEVELS.map((L) => new L.cls(L));
    Hub.init();
    this.scene = Hub; Hub.enter();
    this.bindInput(canvas);
    this.last = performance.now();
    requestAnimationFrame((t) => this.loop(t));
    if (!this.progress.introSeen) setTimeout(() => this.guideTalk(), 400);
  },
  loop(now) {
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.r.time += dt;
    this.scene.update(dt);
    const pw = UI.panel.classList.contains('show') && window.innerWidth > 720 ? (UI.panel.offsetWidth + 14) / window.innerWidth : 0;
    this.r.shiftX += (pw - this.r.shiftX) * Math.min(1, dt * 6);
    UI.labelsBegin();
    this.scene.draw(this.r);
    UI.labelsEnd();
    if ($('#map').classList.contains('show')) this.drawMap();
    requestAnimationFrame((t) => this.loop(t));
  },
  bindInput(canvas) {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      this.keys[e.code] = true;
      if ((e.code === 'Enter' || e.code === 'Space') && UI.busy && UI._next) { e.preventDefault(); UI._next(); return; }
      if ((e.code === 'ArrowLeft' || e.code === 'Backspace') && UI.busy && UI._prev) { e.preventDefault(); UI._prev(); return; }
      if (e.code === 'KeyL') { UI.toggleLog(); return; }
      if (UI.busy) return;
      if (e.code === 'KeyE' && this.scene === Hub) Hub.interact();
      if (e.code === 'KeyC') UI.toggleCodex();
      if (e.code === 'KeyM') this.toggleMap();
      if (e.code === 'KeyH' || e.code === 'F1') { e.preventDefault(); UI.toggleHelp(); }
      if (e.code === 'Escape') { UI.toggleCodex(false); UI.toggleHelp(false); UI.toggleLog(false); this.toggleMap(false); }
      if (e.code === 'F9') { e.preventDefault(); LEVELS.forEach((L) => (this.progress.stars[L.num] ??= 0)); this.save(); UI.toast('Všetky levely odomknuté (režim učiteľa).'); }
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    window.addEventListener('contextmenu', (e) => e.preventDefault()); // pravé tlačidlo slúži na otáčanie, nie na menu
    window.addEventListener('blur', () => { this.keys = {}; });
    let drag = null;
    canvas.addEventListener('pointerdown', (e) => { drag = [e.clientX, e.clientY]; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const cam = this.scene.cam;
      cam && cam.drag(e.clientX - drag[0], e.clientY - drag[1]);
      drag = [e.clientX, e.clientY];
    });
    canvas.addEventListener('pointerup', () => { drag = null; });
    canvas.addEventListener('wheel', (e) => { e.preventDefault(); this.scene.cam && this.scene.cam.zoom(e.deltaY); }, { passive: false });
  },
  enterLevel(num) {
    this.scene.exit();
    UI.labelsClear();
    this.scene = this.levels[num - 1];
    this.scene.enter();
  },
  backToHub() {
    if (this.scene === Hub || UI.busy) return;
    const from = this.scene.num;
    this.scene.exit();
    UI.labelsClear();
    this.scene = Hub;
    Hub.enter(from);
  },
  isUnlocked(n) { return n === 1 || this.progress.stars[n - 1] !== undefined || this.progress.stars[n] !== undefined; },
  completeLevel(n, stars) {
    this.progress.stars[n] = Math.max(stars, this.progress.stars[n] || 0);
    this.unlock(CODEX.filter((c) => c.level === n).map((c) => c.id));
    this.save();
  },
  unlock(ids) {
    const fresh = ids.filter((id) => !this.progress.codex.has(id));
    fresh.forEach((id) => this.progress.codex.add(id));
    if (fresh.length) {
      const names = fresh.map((id) => CODEX.find((c) => c.id === id)).filter(Boolean).map((c) => c.sym + ' ' + c.name);
      UI.toast('📖 Nové v Kódexe: ' + names.join(', '), 3800);
      this.save();
    }
  },
  nextQuestText() {
    const n = LEVELS.find((L) => this.progress.stars[L.num] === undefined);
    return n ? `Choď k portálu ${n.num}: ${n.title} (${n.mentor})` : 'Všetky levely hotové! Skús zlepšiť hviezdičky.';
  },
  guideTalk() {
    const A = (text) => ({ who: 'Amplitúda (sprievodkyňa)', face: '✨', text });
    const first = !this.progress.introSeen;
    this.progress.introSeen = true; this.save();
    UI.say(first ? [
      A('Ahoj! Vitaj na <b>Hilbertovom ostrove</b>. Ja som Amplitúda — komplexné číslo s veľkosťou aj fázou.'),
      A('A ty si <b>Psíčko</b> — kvantový stav <b>ψ</b>. Nie si guľôčka s polohou a rýchlosťou. Si <i>pravidlo pre predpovede</i>: hovoríš, aké výsledky dostane ten, kto sa ťa niečo opýta (zmeria).'),
      A('Vidíš tú zlatú ručičku, ktorá sa okolo teba točí? To je tvoja <b>globálna fáza</b>. Točí sa, ale nikto na svete ju nevie zmerať. Zapamätaj si: <b>globálna fáza je nepozorovateľná, relatívna fáza áno</b>.'),
      A('Okolo ostrova je 8 portálov. Za každým čaká mentor — Euler, Stern, Bloch, Feynman, Dirac, Rabi, Bell a Bohr. Naučia ťa <b>jazyk</b>, <b>symboly</b> a <b>správne obrazy</b> kvantového sveta.'),
      A('Cieľ nie je počítať integrály. Cieľ je <b>intuícia</b>: vedieť, čo je amplitúda, čo je pravdepodobnosť, čo robí meranie a kde klasické prirovnania prestávajú platiť.'),
      A('Ovládanie: <b>WASD</b> pohyb, <b>ťahanie myšou</b> kamera, <b>E</b> vstúpiť/hovoriť, <b>C</b> Kódex symbolov, <b>M</b> mapa, <b>H</b> pomoc. Začni portálom <b>1</b>!'),
    ] : [A(this.nextQuestText() + '. Nezabudni: <i>amplitúdy interferujú, pravdepodobnosti sa len merajú.</i>')]);
  },
  toggleMap(force) {
    const m = $('#map'), show = force ?? !m.classList.contains('show');
    m.classList.toggle('show', show);
  },
  drawMap() {
    const cv = $('#map canvas'), g = cv.getContext('2d'), W = cv.width = cv.clientWidth, H = cv.height = cv.clientHeight;
    const s = Math.min(W, H) / 80, cx = W / 2, cy = H / 2, P = (p) => [cx + p[0] * s, cy + p[2] * s];
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#0d2347'; g.beginPath(); g.arc(cx, cy, 38 * s, 0, 7); g.fill();
    g.fillStyle = '#2a3c66'; g.beginPath(); g.arc(cx, cy, 35 * s, 0, 7); g.fill();
    g.font = `${Math.max(11, s * 1.6)}px system-ui`; g.textAlign = 'center';
    for (const pt of Hub.portals) {
      const [x, y] = P(pt.p), open = this.isUnlocked(pt.L.num), st = this.progress.stars[pt.L.num];
      g.fillStyle = open ? `rgb(${pt.L.color.map((c) => c * 255).join(',')})` : '#555';
      g.beginPath(); g.arc(x, y, s * 1.8, 0, 7); g.fill();
      g.fillStyle = '#fff';
      g.fillText(`${pt.L.num} ${pt.L.title}`, x, y - s * 2.6);
      g.fillText(open ? (st !== undefined && st > 0 ? '★'.repeat(st) : pt.L.mentor) : '🔒', x, y + s * 3.6);
    }
    g.fillStyle = '#ffcf5a'; g.beginPath(); g.arc(cx, cy, s * 1.2, 0, 7); g.fill();
    if (this.scene === Hub) {
      const [x, y] = P(Hub.player.p);
      g.fillStyle = '#5ff'; g.beginPath(); g.arc(x, y, s * 1.1, 0, 7); g.fill();
      g.fillText('ψ (ty)', x, y - s * 1.8);
    }
  },
  save() {
    try { localStorage.setItem('kvantp-game1', JSON.stringify({ ...this.progress, codex: [...this.progress.codex] })); } catch (e) { /* bez ukladania */ }
  },
  load() {
    try {
      const d = JSON.parse(localStorage.getItem('kvantp-game1') || 'null');
      if (d) this.progress = { stars: d.stars || {}, codex: new Set(d.codex || []), introSeen: !!d.introSeen };
    } catch (e) { /* čistý začiatok */ }
  },
};

window.addEventListener('load', () => Game.init());
