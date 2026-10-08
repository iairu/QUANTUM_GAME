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
  // resume = { step, sub, mistakes } — pokračovanie rozohraného levelu po znovunačítaní stránky
  enter(resume) {
    this.cam = new OrbitCam([0, 0, 0], 6, 0.7, 0.35, 2.5, 20);
    this.stepIdx = -1; this.mistakes = 0; this.t = 0; this.sub = {}; this.seenScrolls = new Set();
    Game.r.fog = 0;
    this.setup();
    if (resume) {
      this.stepIdx = Math.max(-1, (resume.step | 0) - 1);
      this.mistakes = resume.mistakes | 0;
      this.sub = resume.sub || {};
      this.keepSub = true;
    }
    UI.setHud(`${this.num} · ${this.title}`, '');
    this.next();
  }
  exit() { UI.panelHide(); }
  setup() {}
  update() {}
  draw() {}
  // text = normálna úloha; alt.easy = len kľúčové slová, alt.hard = stručne a husto (vzorce, čísla)
  quest(text, alt = {}) {
    this.questArgs = [text, alt];
    UI.setHud(`${this.num} · ${this.title}`, byDiff(alt.easy ?? text, text, alt.hard ?? text));
  }
  request() { if (this.questArgs) this.quest(...this.questArgs); }
  next() {
    this.stepIdx++;
    if (!this.keepSub) this.sub = {}; // sub = rozpracovaný stav kroku (napr. číslo hádanky), ukladá sa
    this.keepSub = false;
    Game.save();
    const s = this.steps[this.stepIdx], run = () => (s ? s.call(this) : this.finale()), name = s ? s.name : 'finale';
    const pre = [];
    // laická obťažnosť: pred krokom ho sprievodkyňa vysvetlí bežnými slovami
    if (!this.seenScrolls.has('plain:' + name)) {
      this.seenScrolls.add('plain:' + name);
      pre.push(...laymanFor(this.num, name).map((t) => ({ who: tr('Amplitúda · po ľudsky', 'Amplitude · in plain words'), face: '🫶', text: t, raw: true, cls: 'plaincard' })));
    }
    // prastará obťažnosť: pred krokom sa rozvinie starobylý zvitok s históriou
    const sc = scrollFor(this.num, name).filter((x) => !this.seenScrolls.has(x.id));
    sc.forEach((x) => { this.seenScrolls.add(x.id); Game.unlockScroll(x.id); });
    pre.push(...sc.map((x) => ({ who: `${tr('Starobylý zvitok', 'Ancient scroll')} · ${pick(x.title)}`, face: '📜', text: scrollHtml(x), raw: true, cls: 'scroll' })));
    if (!pre.length) return run();
    UI.say(pre, run);
  }
  viewState() { return null; }
  say(lines, done) { UI.say(lines.map((t) => (typeof t === 'string' ? { who: this.mentor, face: this.face, text: t } : t)), done); }
  ask(q, done) { UI.quiz({ who: this.mentor, face: this.face, ...q }, (ok) => { if (!ok) this.mistakes++; done && done(ok); }); }
  grant(ids) { Game.unlock(ids); }
  finale() {
    UI.panelHide();
    const nq = TRAPS[this.num].length + hardTraps(this.num).length + ancientTraps(this.num).length;
    this.quest(tr('Záverečná skúška jazyka', 'Final language exam'), { easy: tr('📝 Skúška', '📝 Exam'), hard: tr(`Jazykové pasce + rovnice · ${nq} otázok`, `Language traps + equations · ${nq} questions`) });
    this.say([tr('Výborne! Ešte posledná skúška: <b>jazykové pasce</b>. Vyber správnu formuláciu — v kvantovom svete sa veľa chýb robí slovami, nie výpočtom.',
      'Excellent! One last exam: <b>language traps</b>. Pick the correct wording — in the quantum world many mistakes are made with words, not with calculations.')], () => {
      const traps = [...TRAPS[this.num], ...hardTraps(this.num), ...ancientTraps(this.num)];
      UI.quizSeries(traps.map((q) => ({ who: this.mentor, face: this.face, ...q })), (m) => {
        this.mistakes += m;
        const k = this.mistakes, stars = byDiff(k <= 1 ? 3 : k <= 3 ? 2 : 1, k === 0 ? 3 : k <= 2 ? 2 : 1, k === 0 ? 3 : k <= 1 ? 2 : 1);
        Game.completeLevel(this.num, stars);
        const rating = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        this.say([tr(`Level dokončený! Hodnotenie: <b>${rating}</b> (chyby: ${this.mistakes}, obťažnosť: ${DIFF_NAME[Settings.diff]}).<br>Nové karty nájdeš v <b>Kódexe</b> (klávesa C).`,
          `Level complete! Rating: <b>${rating}</b> (mistakes: ${this.mistakes}, difficulty: ${DIFF_NAME[Settings.diff]}).<br>You will find new cards in the <b>Codex</b> (key C).`)], () => Game.backToHub());
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
    UI.setHud(tr('Hilbertov ostrov', 'Hilbert Island'), Game.nextQuestText());
    if (fromLevel) {
      const pt = this.portals[fromLevel - 1];
      this.player.p = V3.add(pt.p, V3.scale(pt.dir, 4.5));
      this.player.heading = Math.atan2(pt.dir[0], pt.dir[2]);
      this.cam.yaw = this.player.heading + Math.PI;
    }
  },
  exit() {},
  // Psíčko: stav s rotujúcou globálnou fázou — ručičky sa točia spolu, Bloch, bázy ani ρ sa nemenia
  viewState() {
    const g = C.exp(this.player.phase);
    return { psi: [C.scale(g, Math.cos(Math.PI / 6)), C.mul(g, C.scale(C.exp(Math.PI / 4), Math.sin(Math.PI / 6)))],
      note: tr('Ty, Psíčko: <b>globálna fáza</b> točí obe ručičky spolu — Blochove rezy, bázy ani ρ sa nepohnú. Preto je nepozorovateľná.',
        'You, Little Psi: the <b>global phase</b> turns both hands together — the Bloch cuts, bases and ρ do not move. That is why it is unobservable.') };
  },
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
        if (!Game.progress.moved) { Game.progress.moved = true; Game.save(); }
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
      UI.toast(tr(`🔒 Najprv dokonči level ${L.num - 1}.`, `🔒 Complete level ${L.num - 1} first.`));
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
    UI.label('guide', [0, gy + 1.1, 0], tr('✨ Amplitúda<br><small>sprievodkyňa</small>', '✨ Amplitude<br><small>your guide</small>'), 'npc');
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
      const dd = Game.progress.diff[L.num], st = (done ? ' ' + '★'.repeat(done) + '☆'.repeat(3 - done) : '') + (dd && dd !== 'normal' ? ` <small>(${DIFF_NAME[dd]})</small>` : '');
      UI.hot(c, `<b>${tr('Portál', 'Portal')} ${L.num}: ${L.title}</b><br>${(Settings.layman ? LAYMAN_LEVEL_TIPS : LEVEL_TIPS)[L.num]}${open ? '' : tr('<br>🔒 Najprv dokonči predchádzajúci level.', '<br>🔒 Complete the previous level first.')}`, 60);
      UI.hot(V3.add(np, [0, 1.2, 0]), tr(`<b>${L.mentor}</b> — mentor levelu ${L.num}.`, `<b>${L.mentor}</b> — mentor of level ${L.num}.`), 30);
      UI.label('portal' + L.num, V3.add(c, [0, 2.9, 0]), `<b>${L.num} · ${L.title}</b>${st}<br><small>${open ? L.face + ' ' + L.mentor : tr('🔒 zamknuté', '🔒 locked')}</small>`, 'portal' + (open ? '' : ' locked'));
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
    UI.hot(pc, tr('<b>Ty — Psíčko (stav ψ)</b>. Zlatá ručička je tvoja <b>globálna fáza</b>: točí sa, ale nedá sa zmerať.',
      '<b>You — Little Psi (the state ψ)</b>. The golden hand is your <b>global phase</b>: it turns, but it cannot be measured.'), 40);
    UI.hot([0, gy, 0], tr('<b>Amplitúda</b> — sprievodkyňa. Podíď k nej a stlač E.', '<b>Amplitude</b> — your guide. Walk up to her and press E.'), 40);
    // nápoveda ovládania na začiatku hry — zmizne po prvom kroku
    if (!Game.progress.moved && !UI.busy) {
      UI.label('wasd', V3.add(pl.p, [0, -0.2, 0]), `<div class="wasd"><span>W</span><br><span>A</span><span>S</span><span>D</span></div><small>${tr('pohyb · ťahaj myšou = kamera', 'move · drag mouse = camera')}</small>`, 'hint', null);
    }
    if (this.near) {
      const L = this.near.L;
      UI.label('prompt', V3.add(pl.p, [0, 2.4, 0]), Game.isUnlocked(L.num) ? tr(`[E] Vstúpiť: ${L.title}`, `[E] Enter: ${L.title}`) : tr('🔒 zamknuté', '🔒 locked'), 'prompt');
    } else if (this.nearGuide) UI.label('prompt', V3.add(pl.p, [0, 2.4, 0]), tr('[E] Hovoriť s Amplitúdou', '[E] Talk to Amplitude'), 'prompt');
  },
};

const LEVEL_TIPS = tr({
  1: 'Komplexné čísla: amplitúda ako ručička hodín, fáza, i² = −1, interferencia.',
  2: 'Meranie spinu: dve stopy, ±ħ/2, meracia báza je súčasťou otázky.',
  3: 'Blochova sféra: hradlá ako rotácie, relatívna vs. globálna fáza, meranie.',
  4: 'Superpozícia vs. zmes, matica hustoty ρ, koherencie, dekoherencia.',
  5: 'Bra-ket gramatika: stav, otázka, číslo, operátor, pravdepodobnosť.',
  6: 'NMR: B₀, Zeemanove hladiny, precesia, Rabiho oscilácie, π-impulz, T₂.',
  7: 'Previazanosť, Bellov stav, nemožnosť signalizácie, CHSH hra.',
  8: 'Jazyk a realita: Bohr, Kant, Wittgenstein, Stodola, Bohm, kolaps.',
}, {
  1: 'Complex numbers: amplitude as a clock hand, phase, i² = −1, interference.',
  2: 'Spin measurement: two spots, ±ħ/2, the measurement basis is part of the question.',
  3: 'Bloch sphere: gates as rotations, relative vs. global phase, measurement.',
  4: 'Superposition vs. mixture, density matrix ρ, coherences, decoherence.',
  5: 'Bra-ket grammar: state, question, number, operator, probability.',
  6: 'NMR: B₀, Zeeman levels, precession, Rabi oscillations, π pulse, T₂.',
  7: 'Entanglement, Bell state, no-signalling, the CHSH game.',
  8: 'Language and reality: Bohr, Kant, Wittgenstein, Stodola, Bohm, collapse.',
});
const CRYSTAL_TIPS = tr({
  'ψ': 'ψ — kvantový stav (vlnová funkcia).', 'ħ': 'ħ = h/2π — redukovaná Planckova konštanta.',
  '⟨φ|ψ⟩': '⟨φ|ψ⟩ — bra-ket: komplexné číslo (amplitúda prekrytia).', '⊗': '⊗ — tenzorový súčin: skladá systémy.',
  'ρ': 'ρ — matica hustoty.', 'Σ': 'Σ — suma (napr. rozvoj stavu do bázy).', 'e<sup>iφ</sup>': 'e^{iφ} — fázový faktor, bod na jednotkovej kružnici.',
  '†': '† — dýka, hermitovské združenie.', '|Φ⁺⟩': '|Φ⁺⟩ — Bellov (maximálne previazaný) stav.',
}, {
  'ψ': 'ψ — a quantum state (wave function).', 'ħ': 'ħ = h/2π — the reduced Planck constant.',
  '⟨φ|ψ⟩': '⟨φ|ψ⟩ — bra-ket: a complex number (overlap amplitude).', '⊗': '⊗ — tensor product: combines systems.',
  'ρ': 'ρ — the density matrix.', 'Σ': 'Σ — a sum (e.g. expanding a state in a basis).', 'e<sup>iφ</sup>': 'e^{iφ} — phase factor, a point on the unit circle.',
  '†': '† — dagger, Hermitian conjugate.', '|Φ⁺⟩': '|Φ⁺⟩ — a Bell (maximally entangled) state.',
});
Object.assign(CRYSTAL_TIPS, { '|0⟩': TIPS['|0⟩'], '|1⟩': TIPS['|1⟩'], 'Ĥ': TIPS['Ĥ'] });

// ------------------------------------------------------------------
// Hra
// ------------------------------------------------------------------
const Game = {
  keys: {},
  progress: { stars: {}, diff: {}, codex: new Set(), scrolls: new Set(), introSeen: false, laymanSeen: false, allUnlocked: false, session: null, moved: false },
  init() {
    const canvas = $('#gl');
    try { this.r = new Renderer(canvas); }
    catch (e) { $('#fatal').style.display = 'flex'; $('#fatal').innerHTML = '<div>' + tr('Tvoj prehliadač nepodporuje WebGL2 (OpenGL ES 3.0).', 'Your browser does not support WebGL2 (OpenGL ES 3.0).') + '<br><small>' + e.message + '</small></div>'; return; }
    UI.init();
    Views.init();
    this.load();
    this.levels = LEVELS.map((L) => new L.cls(L));
    Hub.init();
    this.scene = Hub; Hub.enter();
    this.restoreSession();
    this.bindInput(canvas);
    this.last = performance.now();
    requestAnimationFrame((t) => this.loop(t));
    if (!this.progress.introSeen) setTimeout(() => this.guideTalk(), 400);
  },
  loop(now) {
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.r.time += dt;
    if (Settings.view.autoRotate && this.scene !== Hub && this.scene.cam && !this.dragging) this.scene.cam.yaw += Settings.view.autoRotate * dt;
    this.scene.update(dt);
    this.saveAcc = (this.saveAcc || 0) + dt;
    if (this.saveAcc > 2) { this.saveAcc = 0; this.save(); } // stav hry (poloha, krok levelu) sa ukladá priebežne
    const pw = UI.panel.classList.contains('show') && window.innerWidth > 720 ? (UI.panel.offsetWidth + 14) / window.innerWidth : 0;
    this.r.shiftX += (pw - this.r.shiftX) * Math.min(1, dt * 6);
    Views.update();
    UI.labelsBegin();
    this.scene.draw(this.r);
    UI.labelsEnd();
    if ($('#map').classList.contains('show')) this.drawMap();
    requestAnimationFrame((t) => this.loop(t));
  },
  bindInput(canvas) {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.code === 'Escape') UI.toggleSettings(false);
      this.keys[e.code] = true;
      if ((e.code === 'Enter' || e.code === 'Space') && UI.busy && UI._next) { e.preventDefault(); UI._next(); return; }
      if ((e.code === 'ArrowLeft' || e.code === 'Backspace') && UI.busy && UI._prev) { e.preventDefault(); UI._prev(); return; }
      if (e.code === 'KeyL') { UI.toggleLog(); return; }
      if (e.code === 'KeyV') { Views.toggle(); return; } // pohľady aj počas dialógu
      if (UI.busy) return;
      if (e.code === 'KeyE' && this.scene === Hub) Hub.interact();
      if (e.code === 'KeyC') UI.toggleCodex();
      if (e.code === 'KeyM') this.toggleMap();
      if (e.code === 'KeyO') UI.toggleSettings();
      if (e.code === 'KeyH' || e.code === 'F1') { e.preventDefault(); UI.toggleHelp(); }
      if (e.code === 'Escape') { UI.toggleCodex(false); UI.toggleHelp(false); UI.toggleLog(false); this.toggleMap(false); }
      if (e.code === 'F9') { e.preventDefault(); this.unlockAll(); }
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    window.addEventListener('contextmenu', (e) => e.preventDefault()); // pravé tlačidlo slúži na otáčanie, nie na menu
    window.addEventListener('blur', () => { this.keys = {}; });
    let drag = null;
    canvas.addEventListener('pointerdown', (e) => { drag = [e.clientX, e.clientY]; this.dragging = true; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const cam = this.scene.cam;
      cam && cam.drag(e.clientX - drag[0], e.clientY - drag[1]);
      drag = [e.clientX, e.clientY];
    });
    canvas.addEventListener('pointerup', () => { drag = null; this.dragging = false; });
    window.addEventListener('pagehide', () => this.save());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.save(); });
    const mc = $('#map canvas'), mxy = (e) => { const b = mc.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    mc.addEventListener('click', (e) => this.mapClick(...mxy(e)));
    mc.addEventListener('pointermove', (e) => { this.mapHover = mxy(e); });
    mc.addEventListener('pointerleave', () => { this.mapHover = null; });
    canvas.addEventListener('wheel', (e) => { e.preventDefault(); this.scene.cam && this.scene.cam.zoom(e.deltaY); }, { passive: false });
  },
  enterLevel(num, resume) {
    this.scene.exit();
    UI.labelsClear();
    this.scene = this.levels[num - 1];
    this.scene.enter(resume);
    this.save();
  },
  backToHub() {
    if (this.scene === Hub || UI.busy) return;
    const from = this.scene.num;
    this.scene.exit();
    UI.labelsClear();
    this.scene = Hub;
    Hub.enter(from);
    this.save();
  },
  isUnlocked(n) { return n === 1 || this.progress.allUnlocked || this.progress.stars[n - 1] !== undefined || this.progress.stars[n] !== undefined; },
  setDifficulty(d) {
    if (!DIFFS.includes(d) || d === Settings.diff) return;
    Settings.diff = d; Settings.save();
    UI.diffUi && UI.diffUi();
    if (this.scene && this.scene !== Hub) this.scene.request(); else UI.setHud(tr('Hilbertov ostrov', 'Hilbert Island'), this.nextQuestText());
    UI.refreshDialog && UI.refreshDialog();
    UI.toast(tr(`🎚 Obťažnosť: <b>${DIFF_NAME[d]}</b> — tolerancie platia hneď, nové ciele a nápovedy od ďalšej úlohy.`,
      `🎚 Difficulty: <b>${DIFF_NAME[d]}</b> — tolerances apply now, new targets and hints from the next task.`), 3600);
    // prvé zapnutie laickej obťažnosti na ostrove: sprievodkyňa zopakuje úvod bežnými slovami
    if (d === 'layman' && !this.progress.laymanSeen && this.scene === Hub && !UI.busy) this.guideTalk();
  },
  // zmaže postup (nastavenia a jazyk ponechá) a začne odznova
  resetAll() {
    this.resetting = true;
    try { localStorage.removeItem('kvantp-game1'); localStorage.removeItem('kvantp-game1-log'); } catch (e) { /* bez ukladania */ }
    location.reload();
  },
  // aktuálne miesto v hre: ostrov (poloha hráča) alebo level (krok, rozpracovaný stav, chyby)
  snapshot() {
    const s = this.scene;
    if (!s || s === Hub) return { scene: 0, p: Hub.player.p, h: Hub.player.heading, yaw: Hub.cam.yaw };
    return { scene: s.num, step: s.stepIdx, sub: s.sub, mistakes: s.mistakes };
  },
  restoreSession() {
    const ss = this.progress.session;
    if (!ss) return;
    if (ss.scene > 0 && this.isUnlocked(ss.scene)) {
      this.enterLevel(ss.scene, ss);
      UI.toast(tr('↩ Pokračuješ tam, kde si skončil(a).', '↩ Continuing where you left off.'));
    } else if (Array.isArray(ss.p)) {
      Hub.player.p = ss.p; Hub.player.heading = ss.h || 0; Hub.cam.yaw = ss.yaw || 0;
    }
  },
  // odomkne všetky levely bez toho, aby ich označilo za dokončené (režim učiteľa / skákanie medzi levelmi)
  unlockAll() {
    this.progress.allUnlocked = true;
    this.save();
    UI.toast(tr('🔓 Všetky levely odomknuté — môžeš vstúpiť do ľubovoľného portálu.', '🔓 All levels unlocked — you can enter any portal.'));
    if (this.scene === Hub) UI.setHud(tr('Hilbertov ostrov', 'Hilbert Island'), this.nextQuestText());
  },
  completeLevel(n, stars) {
    this.progress.stars[n] = Math.max(stars, this.progress.stars[n] || 0);
    const rank = (d) => DIFFS.indexOf(d);
    if (!this.progress.diff[n] || rank(Settings.diff) > rank(this.progress.diff[n])) this.progress.diff[n] = Settings.diff;
    this.unlock(CODEX.filter((c) => c.level === n).map((c) => c.id));
    this.save();
  },
  unlockScroll(id) {
    if (this.progress.scrolls.has(id)) return;
    this.progress.scrolls.add(id); this.save();
  },
  unlock(ids) {
    const fresh = ids.filter((id) => !this.progress.codex.has(id));
    fresh.forEach((id) => this.progress.codex.add(id));
    if (fresh.length) {
      const names = fresh.map((id) => CODEX.find((c) => c.id === id)).filter(Boolean).map((c) => c.sym + ' ' + c.name);
      UI.toast(tr('📖 Nové v Kódexe: ', '📖 New in the Codex: ') + names.join(', '), 3800);
      this.save();
    }
  },
  nextQuestText() {
    const n = LEVELS.find((L) => this.progress.stars[L.num] === undefined);
    return n ? tr(`Choď k portálu ${n.num}: ${n.title} (${n.mentor})`, `Go to portal ${n.num}: ${n.title} (${n.mentor})`)
      : tr('Všetky levely hotové! Skús zlepšiť hviezdičky.', 'All levels done! Try to improve your stars.');
  },
  guideTalk() {
    const A = (text) => ({ who: tr('Amplitúda (sprievodkyňa)', 'Amplitude (your guide)'), face: '✨', text });
    const first = !this.progress.introSeen;
    this.progress.introSeen = true;
    if (Settings.layman && !this.progress.laymanSeen) {
      this.progress.laymanSeen = true; this.save();
      return UI.say(LAYMAN_INTRO.map(A));
    }
    this.save();
    UI.say(first ? tr([
      A('Ahoj! Vitaj na <b>Hilbertovom ostrove</b>. Ja som Amplitúda — komplexné číslo s veľkosťou aj fázou.'),
      A('A ty si <b>Psíčko</b> — kvantový stav <b>ψ</b>. Nie si guľôčka s polohou a rýchlosťou. Si <i>pravidlo pre predpovede</i>: hovoríš, aké výsledky dostane ten, kto sa ťa niečo opýta (zmeria).'),
      A('Vidíš tú zlatú ručičku, ktorá sa okolo teba točí? To je tvoja <b>globálna fáza</b>. Točí sa, ale nikto na svete ju nevie zmerať. Zapamätaj si: <b>globálna fáza je nepozorovateľná, relatívna fáza áno</b>.'),
      A('Okolo ostrova je 8 portálov. Za každým čaká mentor — Euler, Stern, Bloch, Feynman, Dirac, Rabi, Bell a Bohr. Naučia ťa <b>jazyk</b>, <b>symboly</b> a <b>správne obrazy</b> kvantového sveta.'),
      A('Cieľ nie je počítať integrály. Cieľ je <b>intuícia</b>: vedieť, čo je amplitúda, čo je pravdepodobnosť, čo robí meranie a kde klasické prirovnania prestávajú platiť.'),
      A('Ovládanie: <b>WASD</b> pohyb, <b>ťahanie myšou</b> kamera, <b>E</b> vstúpiť/hovoriť, <b>C</b> Kódex symbolov, <b>M</b> mapa, <b>H</b> pomoc. Začni portálom <b>1</b>!'),
      A('Si v kvantovom svete nováčik? Vpravo hore prepni obťažnosť na <b>🫶 Laická</b> — všetko ti vysvetlím bežnými slovami.'),
    ], [
      A('Hi! Welcome to <b>Hilbert Island</b>. I am Amplitude — a complex number with both a magnitude and a phase.'),
      A('And you are <b>Little Psi</b> — the quantum state <b>ψ</b>. You are not a little ball with a position and a velocity. You are a <i>rule for predictions</i>: you tell what outcomes anyone who asks you something (measures you) will get.'),
      A('See that golden hand turning around you? That is your <b>global phase</b>. It turns, but nobody in the world can measure it. Remember: <b>the global phase is unobservable, the relative phase is not</b>.'),
      A('There are 8 portals around the island. Behind each one a mentor is waiting — Euler, Stern, Bloch, Feynman, Dirac, Rabi, Bell and Bohr. They will teach you the <b>language</b>, the <b>symbols</b> and the <b>right pictures</b> of the quantum world.'),
      A('The goal is not to compute integrals. The goal is <b>intuition</b>: knowing what an amplitude is, what a probability is, what a measurement does and where classical analogies stop working.'),
      A('Controls: <b>WASD</b> move, <b>mouse drag</b> camera, <b>E</b> enter/talk, <b>C</b> Codex of symbols, <b>M</b> map, <b>H</b> help. Start with portal <b>1</b>!'),
      A('New to the quantum world? Switch the difficulty (top right) to <b>🫶 Layman</b> — I will explain everything in everyday words.'),
    ]) : [A(this.nextQuestText() + tr('. Nezabudni: <i>amplitúdy interferujú, pravdepodobnosti sa len merajú.</i>', '. Don’t forget: <i>amplitudes interfere, probabilities are only measured.</i>'))]);
  },
  toggleMap(force) {
    const m = $('#map'), show = force ?? !m.classList.contains('show');
    m.classList.toggle('show', show);
  },
  // portál na mape pod kurzorom (súradnice v pixeloch plátna)
  mapPortalAt(x, y) {
    const ml = this.mapLayout;
    if (!ml) return null;
    return Hub.portals.find((pt) => { const [px, py] = ml.P(pt.p); return Math.hypot(px - x, py - y) < ml.s * 3.2; }) || null;
  },
  // klik na portál v mape = okamžitý presun do odomknutého levelu
  mapClick(x, y) {
    const pt = this.mapPortalAt(x, y);
    if (!pt) return;
    const L = pt.L;
    if (!this.isUnlocked(L.num)) { UI.toast(tr(`🔒 Najprv dokonči level ${L.num - 1}.`, `🔒 Complete level ${L.num - 1} first.`)); return; }
    if (UI.busy) { UI.toast(tr('Najprv dokonči aktuálny dialóg.', 'Finish the current dialogue first.')); return; }
    if (this.scene === this.levels[L.num - 1]) { this.toggleMap(false); return; }
    if (this.scene !== Hub && !confirm(tr(`Presunúť sa do levelu ${L.num}: ${L.title}? Postup v aktuálnom leveli (${this.scene.num} · ${this.scene.title}) sa neuloží.`,
      `Teleport to level ${L.num}: ${L.title}? Progress in the current level (${this.scene.num} · ${this.scene.title}) will not be saved.`))) return;
    this.toggleMap(false);
    this.enterLevel(L.num);
  },
  drawMap() {
    const cv = $('#map canvas'), g = cv.getContext('2d'), W = cv.width = cv.clientWidth, H = cv.height = cv.clientHeight;
    const s = Math.min(W, H) / 80, cx = W / 2, cy = H / 2, P = (p) => [cx + p[0] * s, cy + p[2] * s];
    this.mapLayout = { s, P };
    const hover = this.mapHover && this.mapPortalAt(...this.mapHover);
    cv.style.cursor = hover && this.isUnlocked(hover.L.num) ? 'pointer' : '';
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#0d2347'; g.beginPath(); g.arc(cx, cy, 38 * s, 0, 7); g.fill();
    g.fillStyle = '#2a3c66'; g.beginPath(); g.arc(cx, cy, 35 * s, 0, 7); g.fill();
    g.font = `${Math.max(11, s * 1.6)}px system-ui`; g.textAlign = 'center';
    for (const pt of Hub.portals) {
      const [x, y] = P(pt.p), open = this.isUnlocked(pt.L.num), st = this.progress.stars[pt.L.num];
      g.fillStyle = open ? `rgb(${pt.L.color.map((c) => c * 255).join(',')})` : '#555';
      g.beginPath(); g.arc(x, y, s * 1.8, 0, 7); g.fill();
      if (pt === hover && open) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, s * 2.4, 0, 7); g.stroke(); }
      if (this.scene === this.levels[pt.L.num - 1]) { g.strokeStyle = '#5ff'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, s * 2.4, 0, 7); g.stroke(); }
      g.fillStyle = '#fff';
      g.fillText(`${pt.L.num} ${pt.L.title}`, x, y - s * 2.6);
      g.fillText(open ? (st !== undefined && st > 0 ? '★'.repeat(st) : pt.L.mentor) : '🔒', x, y + s * 3.6);
    }
    g.fillStyle = '#ffcf5a'; g.beginPath(); g.arc(cx, cy, s * 1.2, 0, 7); g.fill();
    if (this.scene === Hub) {
      const [x, y] = P(Hub.player.p);
      g.fillStyle = '#5ff'; g.beginPath(); g.arc(x, y, s * 1.1, 0, 7); g.fill();
      g.fillText(tr('ψ (ty)', 'ψ (you)'), x, y - s * 1.8);
    }
  },
  save() {
    if (this.resetting || !this.levels) return;
    this.progress.session = this.snapshot();
    try { localStorage.setItem('kvantp-game1', JSON.stringify({ ...this.progress, codex: [...this.progress.codex], scrolls: [...this.progress.scrolls] })); } catch (e) { /* bez ukladania */ }
  },
  load() {
    try {
      const d = JSON.parse(localStorage.getItem('kvantp-game1') || 'null');
      if (d) this.progress = { stars: d.stars || {}, diff: d.diff || {}, codex: new Set(d.codex || []), scrolls: new Set(d.scrolls || []), introSeen: !!d.introSeen, laymanSeen: !!d.laymanSeen, moved: !!d.moved, allUnlocked: !!d.allUnlocked, session: d.session || null };
    } catch (e) { /* čistý začiatok */ }
  },
};

window.addEventListener('load', () => Game.init());
