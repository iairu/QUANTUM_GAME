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
    Settings.wow && this.num > 0 && Wow.onEnterLevel(this); // Sieň symbolov (level 0) nie je inštancia s bossom
    this.next();
  }
  exit() { UI.panelHide(); }
  setup() {}
  update() {}
  draw() {}
  // text = normálna úloha; alt.easy = len kľúčové slová, alt.hard = stručne a husto (vzorce, čísla)
  quest(text, alt = {}) {
    this.questArgs = [text, alt];
    const eqHud = Settings.eq && alt.hard && alt.hard !== text ? `${alt.hard}<br><small>${text}</small>` : null;
    UI.setHud(`${this.num} · ${this.title}`, eqHud || byDiff(alt.easy ?? text, text, alt.hard ?? text));
  }
  request() { if (this.questArgs) this.quest(...this.questArgs); }
  next() {
    this.stepIdx++;
    if (!this.keepSub) this.sub = {}; // sub = rozpracovaný stav kroku (napr. číslo hádanky), ukladá sa
    this.keepSub = false;
    Game.save();
    Settings.wow && this.num > 0 && Wow.onStep(this); // MMO: dokončený krok = zásah bossa
    const s = this.steps[this.stepIdx], run = () => (s ? s.call(this) : this.finale()), name = s ? s.name : 'finale';
    const pre = [];
    // rovnice najprv: pred krokom jeho rovnica vo farbách mnemotechniky
    if (Settings.eq && !Game.progress.eqIntroSeen) pre.push(...Game.eqIntroLines()); // mnemotechnika sa ešte nepredstavila (prepnuté počas rozhovoru)
    if (Settings.eq && !this.seenScrolls.has('eq:' + name)) {
      this.seenScrolls.add('eq:' + name);
      pre.push(...EqM.cardsFor(this.num, name));
    }
    // laická obťažnosť: pred krokom ho sprievodkyňa vysvetlí bežnými slovami
    if (!this.seenScrolls.has('plain:' + name)) {
      this.seenScrolls.add('plain:' + name);
      pre.push(...laymanFor(this.num, name).map((t) => ({ who: tr('Iskra · po ľudsky', 'Spark · in plain words', 'Іскра · простими словами'), face: '🫶', text: t, raw: true, cls: 'plaincard' })));
    }
    // prastará obťažnosť: pred krokom sa rozvinie starobylý zvitok s históriou
    const sc = scrollFor(this.num, name).filter((x) => !this.seenScrolls.has(x.id));
    sc.forEach((x) => { this.seenScrolls.add(x.id); Game.unlockScroll(x.id); });
    pre.push(...sc.map((x) => ({ who: `${tr('Starobylý zvitok', 'Ancient scroll', 'Прадавній сувій')} · ${pick(x.title)}`, face: '📜', text: scrollHtml(x), raw: true, cls: 'scroll' })));
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
    this.quest(DL('main.finale.1'), { easy: DL('main.finale.2'), hard: DL('main.finale.3', nq) });
    this.say([DL('main.finale.4')], () => {
      const traps = [...TRAPS[this.num], ...hardTraps(this.num), ...ancientTraps(this.num)];
      UI.quizSeries(traps.map((q) => ({ who: this.mentor, face: this.face, ...q })), (m) => {
        this.mistakes += m;
        const k = this.mistakes, stars = byDiff(k <= 1 ? 3 : k <= 3 ? 2 : 1, k === 0 ? 3 : k <= 2 ? 2 : 1, k === 0 ? 3 : k <= 1 ? 2 : 1);
        Game.completeLevel(this.num, stars);
        const rating = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        this.say([DL('main.finale.5', rating, this.mistakes, DIFF_NAME[Settings.diff])], () => Game.backToHub());
      });
    });
  }
}

// Sprievodkyňa Iskra: biele jadro so žeravými lúčmi a odletujúcimi iskierkami — zámerne bez ručičky, krúžku a farieb
// mnemotechniky, aby sa nepliedla so symbolom amplitúdy (α modrá, β červená) ani s globálnou fázou (zlatá).
const Spark = {
  draw(r, p, t, s = 1) {
    const fl = 0.85 + 0.15 * Math.sin(t * 17) * Math.sin(t * 5.3);
    r.sphere(p, 0.2 * s * fl, [1, 0.98, 0.92], { emissive: 1, unlit: 1 });
    r.sphere(p, 0.42 * s, [1, 0.75, 0.45], { alpha: 0.22, unlit: 1 });
    for (let k = 0; k < 10; k++) {
      const a = k * 2.399 + t * 0.6, e = Math.sin(k * 1.7) * 0.9, len = (0.45 + 0.3 * Math.abs(Math.sin(t * 3 + k * 1.3))) * s;
      const d = [Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)];
      r.rod(V3.add(p, V3.scale(d, 0.12 * s)), V3.add(p, V3.scale(d, len)), k % 2 ? [1, 0.55, 0.2] : [1, 0.85, 0.6], 0.018 * s, { emissive: 1, unlit: 1 });
    }
    for (let k = 0; k < 6; k++) { // iskierky letia hore a hasnú
      const u = (t * 0.7 + k / 6) % 1, a = k * 1.9 + u * 2;
      r.sphere(V3.add(p, [Math.cos(a) * 0.35 * s * (1 + u), (u * 1.1 - 0.2) * s, Math.sin(a) * 0.35 * s * (1 + u)]), 0.035 * s * (1 - u), [1, 0.7, 0.3], { emissive: 1, unlit: 1, alpha: 1 - u });
    }
  },
};

// ------------------------------------------------------------------
// Hub: ostrov „Hilbertov ostrov“ s portálmi do levelov.
// ------------------------------------------------------------------
const Hub = {
  player: { p: [0, 0, 6], heading: Math.PI, phase: 0 },
  cam: new OrbitCam([0, 1, 0], 9, 0, 0.38, 4, 22),
  portals: [],
  init() {
    // všetky portály stoja v jednom kruhu okolo stredu, rovnomerne a v poradí čísel. Sieň symbolov (0) je len v type hry
    // „Jazyk rovníc“ (rovnice); drakov portál (9), ak je, stojí na severe pod Dračím štítom, inak je na severe portál 1.
    const ring = [...(Settings.eq ? [LEVEL0] : []), ...LEVELS], n = ring.length, boss = ring.some((L) => L.boss);
    const all = ring.map((L, k) => {
      const a = -Math.PI / 2 + ((boss ? k + 1 : k - (Settings.eq ? 1 : 0)) / n) * Math.PI * 2, p = [Math.cos(a) * 20, 0, Math.sin(a) * 20];
      return { L, p, dir: V3.norm(V3.scale(p, -1)), npc: V3.add(p, V3.scale(V3.norm([-Math.sin(a), 0, Math.cos(a)]), 3.2)), boss: !!L.boss, zero: L.num === 0 };
    });
    this.portal0 = all.find((pt) => pt.zero) || null;
    this.portals = all.filter((pt) => !pt.zero);
    // severská krajina: borovice a balvany (deterministicky, mimo portálov a stredu)
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const free = (p, d) => V3.len(p) > (Settings.wow ? 8 : 6) && this.all().every((pt) => V3.len(V3.sub(pt.p, p)) > d) && Math.abs(p[0]) + Math.max(0, -p[2] - 14) * 0.2 > 2.5
      && (!Settings.wow || Math.abs(V3.len(p) - 20) > 2); // MMO: stromy nie na kruhovej ceste
    this.pines = []; this.rocks = [];
    const scenery = Settings.nordic || Settings.wow; // severská: borovice; MMO: listnaté stromy
    for (let k = 0; scenery && this.pines.length < 46 && k < 600; k++) {
      const a = rnd() * Math.PI * 2, rad = rnd() < 0.7 ? 24 + rnd() * 9 : 9 + rnd() * 6, p = [Math.cos(a) * rad, 0, Math.sin(a) * rad];
      if (free(p, 5.5) && this.pines.every((q) => V3.len(V3.sub(q.p, p)) > 2.2)) this.pines.push({ p, h: 3.5 + rnd() * 3, k: rnd() });
    }
    for (let k = 0; scenery && this.rocks.length < 18 && k < 400; k++) {
      const a = rnd() * Math.PI * 2, rad = 7 + rnd() * 26, p = [Math.cos(a) * rad, 0, Math.sin(a) * rad];
      if (free(p, 4.5)) this.rocks.push({ p, s: [0.6 + rnd() * 1.4, 0.4 + rnd() * 0.9, 0.6 + rnd() * 1.2], rot: rnd() * 6 });
    }
  },
  all() { return this.portal0 ? [...this.portals, this.portal0] : this.portals; },
  enter(fromLevel) {
    Game.r.fog = Settings.wow ? 0.009 : 0.012; Game.r.fogColor = Settings.wow ? [0.62, 0.75, 0.88] : Settings.nordic ? [0.29, 0.34, 0.4] : [0.06, 0.08, 0.16];
    UI.setHud(tr('Hilbertov ostrov', 'Hilbert Island', 'Острів Гільберта'), Game.nextQuestText());
    if (fromLevel != null) {
      const pt = fromLevel === 0 ? this.portal0 : this.portals[fromLevel - 1];
      if (pt) {
        this.player.p = V3.add(pt.p, V3.scale(pt.dir, 4.5));
        this.player.heading = Math.atan2(pt.dir[0], pt.dir[2]);
        this.cam.yaw = this.player.heading + Math.PI;
      }
    }
  },
  exit() {},
  // Psíčko: stav s rotujúcou globálnou fázou — ručičky sa točia spolu, Bloch, bázy ani ρ sa nemenia
  viewState() {
    const g = C.exp(this.player.phase);
    return { psi: [C.scale(g, Math.cos(Math.PI / 6)), C.mul(g, C.scale(C.exp(Math.PI / 4), Math.sin(Math.PI / 6)))],
      note: tr('Ty, Psíčko: <b>globálna fáza</b> točí obe ručičky spolu — Blochove rezy, bázy ani ρ sa nepohnú. Preto je nepozorovateľná.',
        'You, Little Psi: the <b>global phase</b> turns both hands together — the Bloch cuts, bases and ρ do not move. That is why it is unobservable.', 'Ти, Псічко: <b>глобальна фаза</b> обертає обидві стрілки разом — перерізи Блоха, базиси й ρ не рухаються. Саме тому її неможливо спостерегти.') };
  },
  update(dt) {
    const pl = this.player;
    pl.phase += dt * 2.2;
    const W = Settings.wow;
    if (W) Wow.moving = false;
    if (!UI.busy && !(W && Wow.dead)) {
      let f = 0, s = 0;
      const k = Game.keys;
      if (k.KeyW || k.ArrowUp) f += 1;
      if (k.KeyS || k.ArrowDown) f -= 1;
      if (k.KeyA || k.ArrowLeft) s -= 1;
      if (k.KeyD || k.ArrowRight) s += 1;
      if (f || s) {
        const fw = [-Math.sin(this.cam.yaw), 0, -Math.cos(this.cam.yaw)], rt = [-fw[2], 0, fw[0]];
        const dir = V3.norm(V3.add(V3.scale(fw, f), V3.scale(rt, s))), sp = (k.ShiftLeft ? 11 : 7) * (W && Wow.mounted ? 1.6 : 1) * dt;
        let np = V3.add(pl.p, V3.scale(dir, sp));
        if (V3.len(np) > 33) np = V3.scale(V3.norm(np), 33);
        for (const pt of this.all()) { // nevojdi do podstavca portálu
          const d = V3.sub(np, pt.p);
          if (V3.len(d) < 1.6) np = V3.add(pt.p, V3.scale(V3.norm(d), 1.6));
        }
        for (const pn of this.pines) { // ani do kmeňa borovice
          const d = V3.sub(np, pn.p);
          if (V3.len(d) < 0.8) np = V3.add(pn.p, V3.scale(V3.norm(d), 0.8));
        }
        if (W) for (const [c, rad] of [[[0, 0, 0], 2.95], [VENDOR_POS, 1.7]]) { // MMO: fontána a stánok obchodníka
          const d = V3.sub(np, c);
          if (V3.len(d) < rad) np = V3.add(c, V3.scale(V3.norm(d), rad));
        }
        pl.p = np;
        pl.heading = Math.atan2(dir[0], dir[2]);
        if (W) { Wow.moving = true; pl.walk = (pl.walk || 0) + sp * 1.7; }
        if (!Game.progress.moved) { Game.progress.moved = true; Game.save(); }
      }
    }
    this.cam.target = V3.add(pl.p, [0, 1.2 + (W ? (pl.y || 0) * 0.5 + (Wow.mounted ? 0.9 : 0.3) : 0), 0]);
    // najbližší portál
    this.near = null;
    for (const pt of this.all()) if (V3.len(V3.sub(pt.p, pl.p)) < 4.2) this.near = pt;
    this.nearGuide = V3.len(pl.p) < (W ? 4.2 : 3.6);
    this.nearVendor = W && V3.len(V3.sub(pl.p, VENDOR_POS)) < 3.6;
  },
  interact() {
    if (this.nearVendor) return Wow.vendorOpen ? Wow.closeVendor() : Wow.openVendor();
    if (this.nearGuide) return Game.guideTalk();
    if (!this.near) return;
    const L = this.near.L;
    if (!Game.isUnlocked(L.num)) {
      UI.toast(tr(`🔒 Najprv dokonči level ${L.num - 1}.`, `🔒 Complete level ${L.num - 1} first.`, `🔒 Спершу пройди рівень ${L.num - 1}.`));
      return;
    }
    Game.enterLevel(L.num);
  },
  draw(r) {
    const pl = this.player, t = r.time;
    r.begin(this.cam.eye(), this.cam.target);
    const N = Settings.nordic, WW = Settings.wow;
    if (WW) this.drawWowLand(r);
    else if (!N) {
      r.draw('disk', M4.trs([0, -0.35, 0], 0, 200), [0.07, 0.2, 0.42], { pattern: 2 });          // more
      r.draw('cylinder', M4.trs([0, -1.2, 0], 0, [35, 1.2, 35]), [0.22, 0.3, 0.5]);              // ostrov
      r.draw('disk', M4.trs([0, 0.001, 0], 0, 35), [0.16, 0.24, 0.4], { pattern: 1 });
      r.draw('cylinder', M4.trs([0, 0, 0], 0, [2.6, 0.12, 2.6]), [0.35, 0.42, 0.7]);             // centrálna plošina
    } else {
    r.draw('disk', M4.trs([0, -0.35, 0], 0, 200), [0.08, 0.16, 0.2], { pattern: 2 });          // studené more
    r.draw('cylinder', M4.trs([0, -1.2, 0], 0, [35, 1.2, 35]), [0.38, 0.37, 0.36], { pattern: 4 }); // skalnatý ostrov
    r.draw('disk', M4.trs([0, 0.001, 0], 0, 35), [0.33, 0.35, 0.26], { pattern: 3 });           // tundra so snehom
    // hory na obzore a Dračí štít na severe
    for (const [x, z, s, h] of [[0, -58, 22, 36], [-34, -60, 16, 24], [36, -56, 17, 26], [-66, -18, 18, 22], [68, -6, 15, 20], [-52, 44, 16, 18], [58, 46, 14, 16]])
      r.draw('cone', M4.trs([x, -2, z], 0, [s, h, s]), [0.42, 0.42, 0.44], { pattern: 4 });
    // borovice a balvany
    for (const pn of this.pines) {
      r.draw('cylinder', M4.trs(pn.p, 0, [0.18, pn.h * 0.35, 0.18]), [0.3, 0.22, 0.15], { pattern: 5 });
      for (let k = 0; k < 3; k++) r.draw('cone', M4.trs(V3.add(pn.p, [0, pn.h * (0.25 + k * 0.22), 0]), pn.k * 6 + k, [1.3 - k * 0.32, pn.h * 0.42, 1.3 - k * 0.32]), [0.12, 0.22 + pn.k * 0.06, 0.15], { pattern: 7 });
    }
    for (const rk of this.rocks) r.draw('lowSphere', M4.trs(rk.p, rk.rot, rk.s), [0.45, 0.44, 0.42], { pattern: 4 });
    // centrálna kamenná plošina so sprievodkyňou
    r.draw('cylinder', M4.trs([0, 0, 0], 0, [2.6, 0.18, 2.6]), [0.5, 0.48, 0.45], { pattern: 4 });
    }
    const gy = 1.6 + Math.sin(t * 1.3) * 0.15;
    Spark.draw(r, [0, gy, 0], t, 1.3);
    UI.label('guide', [0, gy + 1.1, 0], tr('✨ Iskra<br><small>sprievodkyňa</small>', '✨ Spark<br><small>your guide</small>', '✨ Іскра<br><small>твоя провідниця</small>'), 'npc');
    // portály
    for (const pt of this.portals) {
      const L = pt.L, open = Game.isUnlocked(L.num), done = Game.progress.stars[L.num];
      const col = open ? L.color : [0.35, 0.35, 0.4], c = V3.add(pt.p, [0, 2.6, 0]);
      if (WW) { this.drawWowPortal(r, pt, open, c, t); continue; }
      if (!N) r.draw('cylinder', M4.trs(pt.p, 0, [1.4, 0.4, 1.4]), [0.3, 0.33, 0.45]);
      else {
      r.draw('cylinder', M4.trs(pt.p, 0, [1.4, 0.4, 1.4]), [0.46, 0.45, 0.43], { pattern: 4 });
      const side = V3.norm(V3.cross(pt.dir, [0, 1, 0])), hh = pt.boss ? 6.5 : 4.6;           // menhiry po stranách
      for (const s of [-1, 1]) r.draw('box', M4.trs(V3.add(pt.p, V3.add(V3.scale(side, s * 2.7), [0, hh / 2, 0])), Math.atan2(pt.dir[0], pt.dir[2]), [0.8, hh, 0.6]), [0.48, 0.47, 0.45], { pattern: 4 });
      if (pt.boss) r.draw('box', M4.trs(V3.add(pt.p, [0, hh + 0.3, 0]), Math.atan2(pt.dir[0], pt.dir[2]), [6.4, 0.8, 0.8]), [0.48, 0.47, 0.45], { pattern: 4 });
      }
      r.draw('torus', M4.orient(c, pt.dir, 2.1), col, { emissive: open ? 0.5 : 0 });
      r.draw('disk', M4.orient(c, pt.dir, 2.0), col, { alpha: open ? 0.35 + 0.1 * Math.sin(t * 2 + L.num) : 0.15, emissive: 0.8, unlit: 1 });
      // mentor
      const np = pt.npc;
      r.draw('cylinder', M4.trs(np, 0, [0.35, 1.1, 0.35]), V3.scale(L.color, 0.8));
      r.sphere(V3.add(np, [0, 1.45, 0]), 0.32, [0.95, 0.85, 0.75]);
      const dd = Game.progress.diff[L.num], st = (done ? ' ' + '★'.repeat(done) + '☆'.repeat(3 - done) : '') + (dd && dd !== 'normal' ? ` <small>(${DIFF_NAME[dd]})</small>` : '');
      UI.hot(c, `<b>${tr('Portál', 'Portal', 'Портал')} ${L.num}: ${L.title}</b><br>${(Settings.layman ? LAYMAN_LEVEL_TIPS : LEVEL_TIPS)[L.num]}${open ? '' : tr('<br>🔒 Najprv dokonči predchádzajúci level.', '<br>🔒 Complete the previous level first.', '<br>🔒 Спершу пройди попередній рівень.')}`, 60);
      UI.hot(V3.add(np, [0, 1.2, 0]), tr(`<b>${L.mentor}</b> — mentor levelu ${L.num}.`, `<b>${L.mentor}</b> — mentor of level ${L.num}.`, `<b>${L.mentor}</b> — наставник рівня ${L.num}.`), 30);
      UI.label('portal' + L.num, V3.add(c, [0, 2.9, 0]), `<b>${L.num} · ${L.title}</b>${st}<br><small>${open ? L.face + ' ' + L.mentor : tr('🔒 zamknuté', '🔒 locked', '🔒 закрито')}</small>`, 'portal' + (open ? '' : ' locked'));
    }
    this.drawPortal0(r, t);
    // drak Ketvarr (severská téma): krúži nad ostrovom, po porážke sedí na Dračom štíte
    if (!Settings.dragon) { /* klasická téma: bez draka a snehu */ } else if (Game.progress.stars[9] === undefined) {
      const w = t * 0.11, dp = [Math.cos(w) * 46, 27 + Math.sin(t * 0.5) * 3, Math.sin(w) * 46];
      Dragon.draw(r, dp, Math.atan2(-Math.sin(w), Math.cos(w)), { scale: 2.4, bank: 0.35, t });
      UI.hot(dp, tr('<b>Ketvarr</b> — kvantový drak. Porazíš ho na Dračom štíte (portál 9), keď sa naučíš všetkých 8 slov moci.', '<b>Ketvarr</b> — the quantum dragon. You will defeat him on Dragon’s Peak (portal 9) once you learn all 8 Words of Power.', '<b>Кетварр</b> — квантовий дракон. Ти переможеш його на Драконовому піку (портал 9), коли вивчиш усі 8 слів сили.'), 60);
    } else {
      const dp = [0, 35.6, -52];
      Dragon.draw(r, dp, 0, { scale: 2.2, landed: true, t });
      UI.hot(dp, tr('<b>Ketvarr</b> — porazený drak teraz stráži ostrov pred zlými prirovnaniami.', '<b>Ketvarr</b> — the defeated dragon now guards the island against bad analogies.', '<b>Кетварр</b> — переможений дракон тепер охороняє острів від поганих аналогій.'), 60);
    }
    if (N) Snow.draw(r, pl.p, 26);
    // hráč: „Psíčko“ — kvantový stav ψ s rotujúcou (nepozorovateľnou) globálnou fázou
    const bob = Math.sin(t * 3) * 0.08;
    let pc = V3.add(pl.p, [0, 1 + bob, 0]);
    if (WW) { // MMO: Psíčko ako kvantový mág s palicou; zlatá ručička krúži okolo guľôčky na palici
      Wow.drawWorld(r);
      const head = Wow.drawPlayer(r);
      pc = V3.add(pl.p, [0, 1.2 + (pl.y || 0), 0]);
      UI.label('player', head, `ψ <small class="pname">${tr('Psíčko', 'Little Psi', 'Псічко')}</small>`, 'player', null);
    } else {
    r.sphere(pc, 0.42, [0.3, 0.95, 1], { emissive: 0.8 });
    r.draw('circle', M4.trs(pc, 0, 0.75), [0.6, 1, 1]);
    const ph = [Math.cos(pl.phase) * 0.75, 0, Math.sin(pl.phase) * 0.75];
    r.arrow(pc, V3.add(pc, ph), [1, 0.85, 0.3], 0.035, { emissive: 0.5 });
    r.sphere(pc, 0.62, [0.4, 0.8, 1], { alpha: 0.18 });
    UI.label('player', V3.add(pc, [0, 0.95, 0]), 'ψ', 'player');
    }
    UI.hot(pc, tr('<b>Ty — Psíčko (stav ψ)</b>. Zlatá ručička je tvoja <b>globálna fáza</b>: točí sa, ale nedá sa zmerať.',
      '<b>You — Little Psi (the state ψ)</b>. The golden hand is your <b>global phase</b>: it turns, but it cannot be measured.', '<b>Ти — Псічко (стан ψ)</b>. Золота стрілка — твоя <b>глобальна фаза</b>: вона обертається, але виміряти її неможливо.'), 40);
    UI.hot([0, gy, 0], tr('<b>Iskra</b> — sprievodkyňa. Podíď k nej a stlač E.', '<b>Spark</b> — your guide. Walk up to her and press E.', '<b>Іскра</b> — твоя провідниця. Підійди до неї й натисни E.'), 40);
    // nápoveda ovládania na začiatku hry — zmizne po prvom kroku
    if (!Game.progress.moved && !UI.busy) {
      UI.label('wasd', V3.add(pl.p, [0, -0.2, 0]), `<div class="wasd"><span>W</span><br><span>A</span><span>S</span><span>D</span></div><small>${tr('pohyb · ťahaj myšou = kamera', 'move · drag mouse = camera', 'рух · тягни мишею = камера')}</small>`, 'hint', null);
    }
    const py = WW ? 3.3 + (pl.y || 0) : 2.4;
    if (this.nearVendor && !UI.busy) UI.label('prompt', V3.add(pl.p, [0, py, 0]), tr('[E] Obchodovať s Planckom', '[E] Trade with Planck', '[E] Торгувати з Планком'), 'prompt');
    else if (this.near) {
      const L = this.near.L;
      UI.label('prompt', V3.add(pl.p, [0, py, 0]), Game.isUnlocked(L.num) ? tr(`[E] Vstúpiť: ${L.title}`, `[E] Enter: ${L.title}`, `[E] Увійти: ${L.title}`) : tr('🔒 zamknuté', '🔒 locked', '🔒 закрито'), 'prompt');
    } else if (this.nearGuide) UI.label('prompt', V3.add(pl.p, [0, py, 0]), tr('[E] Hovoriť s Iskrou', '[E] Talk to Spark', '[E] Поговорити з Іскрою'), 'prompt');
    if (WW) { // značky úloh nad Iskrou
      const qm = Wow.questMark();
      if (qm) UI.label('guideq', [0, gy + 2.3, 0], qm === '…' ? '?' : qm, 'qmark' + (qm === '…' ? ' gray' : ''),
        qm === '!' ? tr('Iskra má pre teba úlohu.', 'Spark has a quest for you.', 'Іскра має для тебе завдання.') : qm === '?' ? tr('Úloha splnená — odovzdaj ju Iskre.', 'Quest complete — turn it in to Spark.', 'Завдання виконано — здай його Іскрі.') : tr('Úloha prebieha.', 'Quest in progress.', 'Завдання виконується.'));
    }
  },

  // portál 0 — Sieň symbolov: tyrkysový prstenec a okolo neho krúžia farebné glyfy mnemotechniky (rovnaké farby ako v rovniciach)
  drawPortal0(r, t) {
    if (!this.portal0) return;
    const pt = this.portal0, L = pt.L, c = V3.add(pt.p, [0, 2.6, 0]), done = Game.progress.stars[0], N = Settings.nordic;
    r.draw('cylinder', M4.trs(pt.p, 0, [1.4, 0.4, 1.4]), N ? [0.46, 0.45, 0.43] : Settings.wow ? [0.62, 0.58, 0.52] : [0.3, 0.33, 0.45], { pattern: N ? 4 : Settings.wow ? 11 : 0 });
    r.draw('torus', M4.orient(c, pt.dir, 2.1), L.color, { emissive: 0.5 });
    r.draw('disk', M4.orient(c, pt.dir, 2.0), L.color, { alpha: 0.3 + 0.1 * Math.sin(t * 2), emissive: 0.8, unlit: 1 });
    const side = V3.norm(V3.cross(pt.dir, [0, 1, 0])), cols = [[0.31, 0.55, 1], [1, 0.42, 0.49], [0.37, 0.89, 1], [0.73, 0.55, 1], [1, 0.6, 0.9], [0.49, 1, 0.63], [1, 0.82, 0.35], [1, 1, 1]];
    cols.forEach((col, k) => {
      const a = t * 0.8 + k * Math.PI / 4;
      r.sphere(V3.add(c, V3.add(V3.scale(side, Math.cos(a) * 2.45), [0, Math.sin(a) * 2.45, 0])), 0.13, col, { emissive: 0.7 });
    });
    const st = done ? ' ' + '★'.repeat(done) + '☆'.repeat(3 - done) : '';
    UI.hot(c, `<b>${tr('Portál', 'Portal', 'Портал')} 0: ${L.title}</b><br>${tr('Všetky symboly, farby a tvary rovníc v 3D — s vysvetlením a kvízmi. Odporúčaný začiatok.', 'Every symbol, colour and shape of the equations in 3D — explained and quizzed. A recommended start.', 'Усі символи, кольори й форми рівнянь у 3D — з поясненнями та тестами. Рекомендований початок.')}`, 60);
    UI.label('portal0', V3.add(c, [0, 2.9, 0]), `<b>0 · ${L.title}</b>${st}<br><small>${L.face} ${L.mentor} · ∑ 🔑</small>`, 'portal');
  },

  // ---------- MMO téma: krajina a portály inštancií ----------
  drawWowLand(r) {
    r.draw('disk', M4.trs([0, -0.35, 0], 0, 200), [0.12, 0.36, 0.6], { pattern: 2 });             // more
    r.draw('cylinder', M4.trs([0, -1.2, 0], 0, [35, 1.2, 35]), [0.5, 0.42, 0.32], { pattern: 4 }); // útesy
    r.draw('disk', M4.trs([0, 0.001, 0], 0, 35), [0.34, 0.58, 0.2], { pattern: 9 });              // lúka, cesty, námestie
    for (const [x, z, s, h, c] of [[0, -58, 22, 36, [0.5, 0.5, 0.52]], [-34, -60, 16, 24, [0.36, 0.5, 0.3]], [36, -56, 17, 26, [0.36, 0.5, 0.3]], [-66, -18, 18, 22, [0.3, 0.48, 0.26]], [68, -6, 15, 20, [0.3, 0.48, 0.26]], [-52, 44, 16, 18, [0.32, 0.5, 0.28]], [58, 46, 14, 16, [0.32, 0.5, 0.28]]])
      r.draw('cone', M4.trs([x, -2, z], 0, [s, h, s]), c, { pattern: 4 });
    // stromy medzi kamerou a hráčom sa spriehľadnia (ako v MMO), aby nezakrývali postavu
    const eye = r.cam, tgt = this.cam.target, seg = V3.sub(tgt, eye), sl = V3.len(seg) || 1;
    const blocks = (q) => { const k = clamp(V3.dot(V3.sub(q, eye), seg) / (sl * sl), 0, 1); return V3.len(V3.sub(q, V3.add(eye, V3.scale(seg, k)))) < 2.4; };
    for (const pn of this.pines) { // listnaté stromy s okrúhlymi korunami (niektoré jesenné)
      const leaf = pn.k > 0.8 ? [0.85, 0.45, 0.12] : [0.2 + pn.k * 0.1, 0.48 + pn.k * 0.12, 0.14];
      const crown = V3.add(pn.p, [0, pn.h * 0.7, 0]), o = blocks(crown) || blocks(V3.add(pn.p, [0, 1, 0])) ? { alpha: 0.28 } : {};
      r.draw('cylinder', M4.trs(pn.p, pn.k * 6, [0.22, pn.h * 0.55, 0.22]), [0.38, 0.26, 0.16], { pattern: 5, ...o });
      for (let k = 0; k < 3; k++) r.draw('lowSphere', M4.trs(V3.add(pn.p, [Math.sin(k * 2.1 + pn.k * 9) * 0.6, pn.h * (0.62 + k * 0.1), Math.cos(k * 2.1 + pn.k * 9) * 0.6]), pn.k * 6 + k, 1.25 - k * 0.2 + pn.k * 0.3), leaf, { pattern: 10, ...o });
    }
    for (const rk of this.rocks) r.draw('lowSphere', M4.trs(rk.p, rk.rot, rk.s), [0.52, 0.5, 0.46], { pattern: 4 });
  },
  drawWowPortal(r, pt, open, c, t) {
    const L = pt.L, hd = Math.atan2(pt.dir[0], pt.dir[2]), side = V3.norm(V3.cross(pt.dir, [0, 1, 0])), hh = pt.boss ? 6.6 : 5.2, w = 2.75;
    const stone = [0.62, 0.58, 0.52];
    r.draw('cylinder', M4.trs(pt.p, 0, [2.2, 0.35, 2.2]), stone, { pattern: 11 });                          // schodík
    for (const s of [-1, 1]) {                                                                                // piliere oblúka
      const q = V3.add(pt.p, V3.scale(side, s * w));
      r.draw('box', M4.trs(V3.add(q, [0, hh / 2, 0]), hd, [0.95, hh, 0.95]), stone, { pattern: 11 });
      r.draw('box', M4.trs(V3.add(q, [0, hh + 0.2, 0]), hd, [1.25, 0.4, 1.25]), V3.scale(stone, 0.85), { pattern: 11 });
      r.sphere(V3.add(q, [0, hh + 0.75, 0]), 0.28, open ? L.color : [0.4, 0.4, 0.45], { emissive: open ? 1 : 0 }); // ohnivé misy
    }
    r.draw('box', M4.trs(V3.add(pt.p, [0, hh + 0.6, 0]), hd, [2 * w + 1.4, 0.8, 1.1]), stone, { pattern: 11 }); // preklad
    // vír inštancie
    r.draw('disk', M4.orient(c, pt.dir, 2.15), open ? L.color : [0.3, 0.3, 0.35], { pattern: open ? 8 : 0, alpha: open ? 0.92 : 0.25, unlit: 1, emissive: 0.6 });
    r.draw('torus', M4.orient(c, pt.dir, 2.15), open ? L.color : [0.35, 0.35, 0.4], { emissive: open ? 0.8 : 0 });
    // mentor = zadávateľ úlohy
    const done = Game.progress.stars[L.num], np = pt.npc, face = Math.atan2(-np[0], -np[2]);
    Wow.humanoid(r, np, face, { robe: V3.scale(L.color, 0.75), trim: [0.92, 0.8, 0.45], hat: ['hood', 'top', 'wizard', null][L.num % 4], hatCol: V3.scale(L.color, 0.55), hair: [0.75, 0.72, 0.7], staff: L.num % 2 === 1, orb: L.color });
    const next = open && done === undefined;
    if (next) UI.label('qm' + L.num, V3.add(np, [0, 2.75, 0]), '!', 'qmark', tr(`${L.mentor} má pre teba úlohu: dokonči level ${L.num}.`, `${L.mentor} has a quest for you: complete level ${L.num}.`, `${L.mentor} має для тебе завдання: пройди рівень ${L.num}.`));
    const dd = Game.progress.diff[L.num], st = (done ? ' ' + '★'.repeat(done) + '☆'.repeat(3 - done) : '') + (dd && dd !== 'normal' ? ` <small>(${DIFF_NAME[dd]})</small>` : '');
    const rec = L.boss ? tr('Nájazd · úr. 16+', 'Raid · lvl 16+', 'Рейд · рів. 16+') : tr(`Dungeon · úr. ${L.num * 2 - 1}–${L.num * 2 + 1}`, `Dungeon · lvl ${L.num * 2 - 1}–${L.num * 2 + 1}`, `Підземелля · рів. ${L.num * 2 - 1}–${L.num * 2 + 1}`);
    UI.hot(c, `<b>${tr('Inštancia', 'Instance', 'Інстанс')} ${L.num}: ${L.title}</b> <small>(${rec})</small><br>${(Settings.layman ? LAYMAN_LEVEL_TIPS : LEVEL_TIPS)[L.num]}<br>${tr('Boss', 'Boss', 'Бос')}: <b>${BOSSES[L.num].icon} ${BOSSES[L.num].name}</b>${open ? '' : tr('<br>🔒 Najprv dokonči predchádzajúci level.', '<br>🔒 Complete the previous level first.', '<br>🔒 Спершу пройди попередній рівень.')}`, 60);
    UI.hot(V3.add(np, [0, 1.2, 0]), tr(`<b>${L.mentor}</b> — mentor levelu ${L.num}.`, `<b>${L.mentor}</b> — mentor of level ${L.num}.`, `<b>${L.mentor}</b> — наставник рівня ${L.num}.`), 30);
    UI.label('portal' + L.num, V3.add(pt.p, [0, hh + 2, 0]), `<b>${L.num} · ${L.title}</b>${st}<br><small>${open ? `${L.face} ${L.mentor} · ${rec}` : tr('🔒 zamknuté', '🔒 locked', '🔒 закрито')}</small>`, 'portal' + (open ? '' : ' locked'));
    UI.label('mentor' + L.num, V3.add(np, [0, 2.2, 0]), `${L.mentor}`, 'npc friendly small', null);
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
  9: '🐉 Záverečný súboj s drakom Ketvarrom: ťahová bitka, štít = qubit, úder = meranie, cieľ P(zásah) ≥ prah.',
}, {
  1: 'Complex numbers: amplitude as a clock hand, phase, i² = −1, interference.',
  2: 'Spin measurement: two spots, ±ħ/2, the measurement basis is part of the question.',
  3: 'Bloch sphere: gates as rotations, relative vs. global phase, measurement.',
  4: 'Superposition vs. mixture, density matrix ρ, coherences, decoherence.',
  5: 'Bra-ket grammar: state, question, number, operator, probability.',
  6: 'NMR: B₀, Zeeman levels, precession, Rabi oscillations, π pulse, T₂.',
  7: 'Entanglement, Bell state, no-signalling, the CHSH game.',
  8: 'Language and reality: Bohr, Kant, Wittgenstein, Stodola, Bohm, collapse.',
  9: '🐉 The final battle with the dragon Ketvarr: turn-based, ward = qubit, strike = measurement, aim for P(hit) ≥ the threshold.',
}, {
  1: 'Комплексні числа: амплітуда як стрілка годинника, фаза, i² = −1, інтерференція.',
  2: 'Вимірювання спіну: дві плями, ±ħ/2, базис вимірювання — частина питання.',
  3: 'Сфера Блоха: гейти як повороти, відносна проти глобальної фази, вимірювання.',
  4: 'Суперпозиція проти суміші, матриця густини ρ, когерентності, декогеренція.',
  5: 'Граматика бра-кет: стан, питання, число, оператор, імовірність.',
  6: 'ЯМР: B₀, зееманівські рівні, прецесія, осциляції Рабі, π-імпульс, T₂.',
  7: 'Сплутаність, стан Белла, неможливість сигналізації, гра CHSH.',
  8: 'Мова й реальність: Бор, Кант, Вітгенштейн, Стодола, Бом, колапс.',
  9: '🐉 Фінальна битва з драконом Кетварром: покрокова, захист = кубіт, удар = вимірювання, цілься на P(влучання) ≥ порогу.',
});

// ------------------------------------------------------------------
// Hra
// ------------------------------------------------------------------
const Game = {
  keys: {},
  progress: { stars: {}, diff: {}, codex: new Set(), scrolls: new Set(), introSeen: false, laymanSeen: false, allUnlocked: false, session: null, moved: false },
  init() {
    const canvas = $('#gl');
    try { this.r = new Renderer(canvas); }
    catch (e) { $('#fatal').style.display = 'flex'; $('#fatal').innerHTML = '<div>' + tr('Tvoj prehliadač nepodporuje WebGL2 (OpenGL ES 3.0).', 'Your browser does not support WebGL2 (OpenGL ES 3.0).', 'Твій браузер не підтримує WebGL2 (OpenGL ES 3.0).') + '<br><small>' + e.message + '</small></div>'; return; }
    UI.init();
    Views.init();
    EqM.init();
    this.load();
    if (this.fresh) Welcome.show(() => this.start()); // nový hráč alebo po resete: najprv výber témy a obťažnosti
    else this.start();
  },
  start() {
    const canvas = $('#gl');
    this.levels = LEVELS.map((L) => new L.cls(L));
    this.level0 = new LEVEL0.cls(LEVEL0); // Sieň symbolov
    Hub.init();
    Wow.init(); // MMO téma: postava, nepriatelia, lišta kúziel (inak nič)
    this.scene = Hub; Hub.enter();
    this.restoreSession();
    this.bindInput(canvas);
    this.last = performance.now();
    requestAnimationFrame((t) => this.loop(t));
    if (!this.progress.introSeen) setTimeout(() => this.guideTalk(), 400);
    else if (Settings.eq && !this.progress.eqIntroSeen) setTimeout(() => this.eqIntro(), 400);
  },
  loop(now) {
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.r.time += dt;
    if (Settings.view.autoRotate && this.scene !== Hub && this.scene.cam && !this.dragging) this.scene.cam.yaw += Settings.view.autoRotate * dt;
    this.scene.update(dt);
    Wow.update(dt);
    this.saveAcc = (this.saveAcc || 0) + dt;
    if (this.saveAcc > 2) { this.saveAcc = 0; this.save(); } // stav hry (poloha, krok levelu) sa ukladá priebežne
    const pw = UI.panel.classList.contains('show') && window.innerWidth > 720 ? (UI.panel.offsetWidth + 14) / window.innerWidth : 0;
    this.r.shiftX += (pw - this.r.shiftX) * Math.min(1, dt * 6);
    Views.update();
    EqM.update();
    // ovládanie, ktoré práve nič neurobí, je zošedené: počas dialógu tlačidlá panelu a kúzla, na ostrove tlačidlo „Ostrov“
    document.body.classList.toggle('dlg-open', UI.busy);
    UI.hubBtn.disabled = this.scene === Hub;
    // 🔑 kľúč počas rozhovoru nie je dostupný — dialóg sa má sústrediť na fyziku, nie na pravidlá hry
    EqM.keyBtn.disabled = UI.busy;
    if (UI.busy && EqM.keyEl.classList.contains('show')) EqM.toggleKey(false);
    UI.labelsBegin();
    this.scene.draw(this.r);
    UI.labelsEnd();
    if ($('#map').classList.contains('show')) this.drawMap();
    requestAnimationFrame((t) => this.loop(t));
  },
  bindInput(canvas) {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.code === 'Escape') { UI.toggleSettings(false); EqM.toggleKey(false); }
      if (e.code === 'Tab') e.preventDefault(); // Tab = ďalší cieľ (MMO), nie presun fokusu
      this.keys[e.code] = true;
      if ((e.code === 'Enter' || e.code === 'Space') && UI.busy && UI._next) { e.preventDefault(); UI._next(); return; }
      if ((e.code === 'ArrowLeft' || e.code === 'Backspace') && UI.busy && UI._prev) { e.preventDefault(); UI._prev(); return; }
      if (e.code === 'KeyL') { UI.toggleLog(); return; }
      if (e.code === 'KeyV') { Views.toggle(); return; } // pohľady aj počas dialógu
      if (e.code === 'KeyN') { Sound.toggleMute(); return; }
      if (e.code === 'KeyM') { this.toggleMap(); return; } // mapa (a teleport) aj počas dialógu
      if (Settings.wow && UI.busy && /^Digit[89]$/.test(e.code)) { Wow.key(e); return; } // elixíry aj počas dialógu
      if (UI.busy) return;
      if (Settings.wow && Wow.key(e)) return; // lišta kúziel 1 … =, Tab, B, skok
      if (e.code === 'KeyE' && this.scene === Hub) Hub.interact();
      if (e.code === 'KeyC') UI.toggleCodex();
      if (e.code === 'KeyK' && Settings.eq) EqM.toggleKey(); // 🔑 kľúč (nie počas rozhovoru)
      if (e.code === 'KeyO') UI.toggleSettings();
      if (e.code === 'KeyH' || e.code === 'F1') { e.preventDefault(); UI.toggleHelp(); }
      if (e.code === 'Escape') { UI.toggleCodex(false); UI.toggleHelp(false); UI.toggleLog(false); this.toggleMap(false); Settings.wow && Wow.escape(); }
      if (e.code === 'F9') { e.preventDefault(); this.unlockAll(); }
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    window.addEventListener('contextmenu', (e) => e.preventDefault()); // pravé tlačidlo slúži na otáčanie, nie na menu
    window.addEventListener('blur', () => { this.keys = {}; });
    let drag = null, moved = 0;
    canvas.addEventListener('pointerdown', (e) => { drag = [e.clientX, e.clientY]; moved = 0; this.dragging = true; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const cam = this.scene.cam;
      cam && cam.drag(e.clientX - drag[0], e.clientY - drag[1]);
      moved += Math.abs(e.clientX - drag[0]) + Math.abs(e.clientY - drag[1]);
      if (moved >= 6) document.body.classList.add('cam-rot'); // počas otáčania kamery kurzor zmizne
      drag = [e.clientX, e.clientY];
    });
    canvas.addEventListener('pointerup', (e) => {
      if (drag && moved < 6 && Settings.wow) Wow.click(e.clientX, e.clientY, e.button); // klik bez ťahania = zameranie cieľa
      drag = null; this.dragging = false;
      document.body.classList.remove('cam-rot');
    });
    canvas.addEventListener('pointercancel', () => { drag = null; this.dragging = false; document.body.classList.remove('cam-rot'); });
    window.addEventListener('pagehide', () => this.save());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.save(); });
    const mc = $('#map canvas'), mxy = (e) => { const b = mc.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    mc.addEventListener('click', (e) => this.mapClick(...mxy(e)));
    mc.addEventListener('pointermove', (e) => { this.mapHover = mxy(e); });
    mc.addEventListener('pointerleave', () => { this.mapHover = null; });
    canvas.addEventListener('wheel', (e) => { e.preventDefault(); this.scene.cam && this.scene.cam.zoom(e.deltaY); }, { passive: false });
  },
  enterLevel(num, resume) {
    Sound.sfx('portal');
    this.scene.exit();
    UI.labelsClear();
    this.scene = this.levelOf(num);
    this.scene.enter(resume);
    this.save();
  },
  backToHub() {
    if (this.scene === Hub) return;
    const from = this.scene.num;
    UI.cancelDialog(); // aj uprostred rozhovoru alebo kvízu
    Sound.sfx('portal');
    this.scene.exit();
    UI.labelsClear();
    this.scene = Hub;
    Hub.enter(from);
    Settings.wow && Wow.onHub();
    this.save();
  },
  levelOf(n) { return n === 0 ? this.level0 : this.levels[n - 1]; },
  isUnlocked(n) { return n === 0 || n === 1 || this.progress.allUnlocked || this.progress.stars[n - 1] !== undefined || this.progress.stars[n] !== undefined; },
  setDifficulty(d) {
    if (!DIFFS.includes(d) || d === Settings.diff) return;
    Settings.diff = d; Settings.save();
    UI.labelsClear(); // 3D popisky si načítajú vysvetlivky pre novú obťažnosť (laická má vlastné)
    UI.diffUi && UI.diffUi();
    if (this.scene && this.scene !== Hub) this.scene.request(); else UI.setHud(tr('Hilbertov ostrov', 'Hilbert Island', 'Острів Гільберта'), this.nextQuestText());
    UI.refreshDialog && UI.refreshDialog();
    UI.toast(tr(`🎚 Obťažnosť: <b>${DIFF_NAME[d]}</b> — tolerancie platia hneď, nové ciele a nápovedy od ďalšej úlohy.`,
      `🎚 Difficulty: <b>${DIFF_NAME[d]}</b> — tolerances apply now, new targets and hints from the next task.`, `🎚 Складність: <b>${DIFF_NAME[d]}</b> — допуски діють одразу, нові цілі й підказки — з наступного завдання.`), 3600);
    // prvé zapnutie laickej obťažnosti na ostrove: sprievodkyňa zopakuje úvod bežnými slovami
    if (d === 'layman' && !this.progress.laymanSeen && this.scene === Hub && !UI.busy) this.guideTalk();
  },
  // téma mení obsah hry (9. level, ostrov), preto sa hra po uložení znovu načíta
  setTheme(t) {
    if (!THEMES.includes(t) || t === Settings.theme) return;
    if (this.scene && this.scene.boss && t !== 'nordic') this.backToHub(); // z dračieho levelu späť na ostrov
    this.save();
    Settings.theme = t; Settings.save();
    location.reload();
  },
  // typ hry sa mení za behu (bez znovunačítania): javisko rovnice, farbenie symbolov, karty a panel teórie
  setMode(m) {
    if (!MODES.includes(m) || m === Settings.mode) return;
    Settings.mode = m; Settings.save();
    EqM.apply();
    UI.labelsClear();
    Hub.init(); // portál 0 (Sieň symbolov) je len v type „Jazyk rovníc“ — kruh portálov sa preusporiada
    if (this.scene && this.scene.num === 0 && !Settings.eq) this.backToHub();
    if (this.scene && this.scene !== Hub) { this.scene.request(); UI.refreshTheory(); } else UI.setHud(tr('Hilbertov ostrov', 'Hilbert Island', 'Острів Гільберта'), this.nextQuestText());
    UI.refreshDialog && UI.refreshDialog();
    UI.toast(tr(`🎮 Typ hry: <b>${MODE_NAME[m]}</b>`, `🎮 Game type: <b>${MODE_NAME[m]}</b>`, `🎮 Тип гри: <b>${MODE_NAME[m]}</b>`), 3000);
    if (Settings.eq && !this.progress.eqIntroSeen && !UI.busy) { UI.toggleSettings(false); this.eqIntro(); }
  },
  // sprievodkyňa predstaví rovnicovú mnemotechniku (raz, pri prvom zapnutí typu „Rovnice najprv“)
  eqIntro() { UI.say(this.eqIntroLines()); },
  eqIntroLines() {
    this.progress.eqIntroSeen = true; this.save();
    const A = (text, raw) => ({ who: tr('Iskra (sprievodkyňa)', 'Spark (your guide)', 'Іскра (твоя провідниця)'), face: '✨', text, raw });
    return [
      A(DL('main.eqIntroLines.1')),
      A(DL('main.eqIntroLines.2')),
      A(DL('main.eqIntroLines.3')),
    ];
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
    return { scene: s.num === 0 ? 'L0' : s.num, step: s.stepIdx, sub: s.sub, mistakes: s.mistakes };
  },
  restoreSession() {
    const ss = this.progress.session;
    if (!ss) return;
    if ((ss.scene === 'L0' && Settings.eq) || (ss.scene > 0 && ss.scene <= this.levels.length && this.isUnlocked(ss.scene))) {
      this.enterLevel(ss.scene === 'L0' ? 0 : ss.scene, ss);
      UI.toast(tr('↩ Pokračuješ tam, kde si skončil(a).', '↩ Continuing where you left off.', '↩ Продовжуєш там, де зупинився(-лася).'));
    } else if (Array.isArray(ss.p)) {
      Hub.player.p = ss.p; Hub.player.heading = ss.h || 0; Hub.cam.yaw = ss.yaw || 0;
    }
  },
  // odomkne všetky levely bez toho, aby ich označilo za dokončené (režim učiteľa / skákanie medzi levelmi)
  unlockAll() {
    this.progress.allUnlocked = true;
    this.save();
    UI.toast(tr('🔓 Všetky levely odomknuté — môžeš vstúpiť do ľubovoľného portálu.', '🔓 All levels unlocked — you can enter any portal.', '🔓 Усі рівні відкрито — можеш увійти в будь-який портал.'));
    if (this.scene === Hub) UI.setHud(tr('Hilbertov ostrov', 'Hilbert Island', 'Острів Гільберта'), this.nextQuestText());
  },
  completeLevel(n, stars) {
    const fresh = this.progress.stars[n] === undefined;
    Sound.sfx('fanfare');
    this.progress.stars[n] = Math.max(stars, this.progress.stars[n] || 0);
    Settings.wow && n > 0 && Wow.onLevelComplete(n, stars); // MMO: boss padol, korisť, skúsenosti
    if (fresh && Settings.dragon && n > 0 && !LEVELS[n - 1].boss) { // každý mentor naučí jedno slovo moci proti drakovi
      const ring = LEVELS.filter((L) => !L.boss), k = ring.filter((L) => this.progress.stars[L.num] !== undefined).length;
      setTimeout(() => UI.toast(k < ring.length
        ? tr(`🐉 Slovo moci ${k}/${ring.length} — Ketvarr nad ostrovom nepokojne krúži.`, `🐉 Word of Power ${k}/${ring.length} — Ketvarr circles the island restlessly.`, `🐉 Слово сили ${k}/${ring.length} — Кетварр неспокійно кружляє над островом.`)
        : tr('🐉 Všetkých 8 slov moci! Dračí štít (portál 9) je otvorený.', '🐉 All 8 Words of Power! Dragon’s Peak (portal 9) is open.', '🐉 Усі 8 слів сили! Драконів пік (портал 9) відкрито.'), 4200), 1200);
    }
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
      UI.toast(tr('📖 Nové v Kódexe: ', '📖 New in the Codex: ', '📖 Нове в Кодексі: ') + names.join(', '), 3800);
      this.save();
    }
  },
  nextQuestText() {
    const n = LEVELS.find((L) => this.progress.stars[L.num] === undefined);
    if (n && n.boss) return tr(`Vystúp na Dračí štít (portál ${n.num}) a poraz draka Ketvarra!`, `Climb Dragon’s Peak (portal ${n.num}) and defeat the dragon Ketvarr!`, `Піднімися на Драконів пік (портал ${n.num}) і перемож дракона Кетварра!`);
    return n ? tr(`Choď k portálu ${n.num}: ${n.title} (${n.mentor})`, `Go to portal ${n.num}: ${n.title} (${n.mentor})`, `Іди до порталу ${n.num}: ${n.title} (${n.mentor})`)
      : Settings.dragon ? tr('Ketvarr je porazený a ostrov zachránený! Skús zlepšiť hviezdičky.', 'Ketvarr is defeated and the island is saved! Try to improve your stars.', 'Кетварра переможено, острів урятовано! Спробуй покращити свої зірки.')
        : tr('Všetky levely hotové! Skús zlepšiť hviezdičky.', 'All levels done! Try to improve your stars.', 'Усі рівні пройдено! Спробуй покращити свої зірки.');
  },
  guideTalk() {
    const A = (text) => ({ who: tr('Iskra (sprievodkyňa)', 'Spark (your guide)', 'Іскра (твоя провідниця)'), face: '✨', text });
    const first = !this.progress.introSeen;
    this.progress.introSeen = true;
    if (Settings.layman && !this.progress.laymanSeen) {
      this.progress.laymanSeen = true; this.save();
      return UI.say(LAYMAN_INTRO.map(A).concat(Settings.eq && !this.progress.eqIntroSeen ? this.eqIntroLines() : []));
    }
    this.save();
    if (Settings.wow && !first && Wow.guideQuest(A)) return; // MMO: úlohy od Iskry
    UI.say((first ? [
      A(DL('main.guideTalk.1.0')),
      A(DL('main.guideTalk.1.1')),
      A(DL('main.guideTalk.1.2')),
      A(DL('main.guideTalk.1.3')),
      Settings.dragon && A(DL('main.guideTalk.1.4')),
      A(DL('main.guideTalk.1.5')),
      A(DL('main.guideTalk.1.6')),
      Settings.eq && A(DL('main.guideTalk.1.7')),
      A(DL('main.guideTalk.1.8')),
      Settings.wow && A(DL('main.guideTalk.1.9')),
    ] : [A(this.nextQuestText() + DL('main.guideTalk.2'))]).filter(Boolean)
      .concat(first && Settings.eq && !this.progress.eqIntroSeen ? this.eqIntroLines() : []));
  },
  toggleMap(force) {
    const m = $('#map'), show = force ?? !m.classList.contains('show');
    if (show !== m.classList.contains('show')) Sound.sfx(show ? 'map' : 'close');
    m.classList.toggle('show', show);
  },
  // portál na mape pod kurzorom (súradnice v pixeloch plátna)
  mapPortalAt(x, y) {
    const ml = this.mapLayout;
    if (!ml) return null;
    return Hub.all().find((pt) => { const [px, py] = ml.P(pt.p); return Math.hypot(px - x, py - y) < ml.s * 3.2; }) || null;
  },
  // klik na portál v mape = okamžitý presun do odomknutého levelu
  mapClick(x, y) {
    const pt = this.mapPortalAt(x, y);
    if (!pt) return;
    const L = pt.L;
    if (!this.isUnlocked(L.num)) { UI.toast(tr(`🔒 Najprv dokonči level ${L.num - 1}.`, `🔒 Complete level ${L.num - 1} first.`, `🔒 Спершу пройди рівень ${L.num - 1}.`)); return; }
    if (this.scene === this.levelOf(L.num)) { this.toggleMap(false); return; }
    if (this.scene !== Hub && !confirm(tr(`Presunúť sa do levelu ${L.num}: ${L.title}? Postup v aktuálnom leveli (${this.scene.num} · ${this.scene.title}) sa neuloží.`,
      `Teleport to level ${L.num}: ${L.title}? Progress in the current level (${this.scene.num} · ${this.scene.title}) will not be saved.`, `Перенестися до рівня ${L.num}: ${L.title}? Поступ у поточному рівні (${this.scene.num} · ${this.scene.title}) не буде збережено.`))) return;
    this.toggleMap(false);
    UI.cancelDialog();
    this.enterLevel(L.num);
  },
  drawMap() {
    const cv = $('#map canvas'), g = cv.getContext('2d'), W = cv.width = cv.clientWidth, H = cv.height = cv.clientHeight;
    const s = Math.min(W, H) / 80, cx = W / 2, cy = H / 2, P = (p) => [cx + p[0] * s, cy + p[2] * s];
    this.mapLayout = { s, P };
    const hover = this.mapHover && this.mapPortalAt(...this.mapHover);
    cv.classList.toggle('c-ptr', !!(hover && this.isUnlocked(hover.L.num))); // kurzor témy nad odomknutým portálom
    g.clearRect(0, 0, W, H);
    const N = Settings.nordic;
    const WW = Settings.wow;
    g.fillStyle = WW ? '#1d4f78' : N ? '#1b2a33' : '#0d2347'; g.beginPath(); g.arc(cx, cy, 38 * s, 0, 7); g.fill();
    g.fillStyle = WW ? '#4c7a35' : N ? '#4a4c42' : '#2a3c66'; g.beginPath(); g.arc(cx, cy, 35 * s, 0, 7); g.fill();
    if (WW) { g.strokeStyle = '#8a6c45'; g.lineWidth = s * 2; g.beginPath(); g.arc(cx, cy, 20 * s, 0, 7); g.stroke(); }
    g.fillStyle = '#26402c'; for (const pn of Hub.pines) { const [x, y] = P(pn.p); g.beginPath(); g.arc(x, y, s * 0.9, 0, 7); g.fill(); }
    g.font = `${Math.max(11, s * 1.6)}px ${N || WW ? 'Cinzel, Georgia, serif' : 'system-ui'}`; g.textAlign = 'center';
    for (const pt of Hub.all()) {
      const [x, y] = P(pt.p), open = this.isUnlocked(pt.L.num), st = this.progress.stars[pt.L.num];
      g.fillStyle = open ? `rgb(${pt.L.color.map((c) => c * 255).join(',')})` : '#555';
      g.beginPath(); g.arc(x, y, s * 1.8, 0, 7); g.fill();
      if (pt === hover && open) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, s * 2.4, 0, 7); g.stroke(); }
      if (this.scene === this.levelOf(pt.L.num)) { g.strokeStyle = '#5ff'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, s * 2.4, 0, 7); g.stroke(); }
      g.fillStyle = '#fff';
      g.fillText(`${pt.L.num} ${pt.L.title}`, x, y - s * 2.6);
      g.fillText(open ? (st !== undefined && st > 0 ? '★'.repeat(st) : pt.L.mentor) : '🔒', x, y + s * 3.6);
    }
    g.fillStyle = '#ffcf5a'; g.beginPath(); g.arc(cx, cy, s * 1.2, 0, 7); g.fill();
    if (Settings.wow) { // MMO: neutrálne omyly a obchodník
      g.fillStyle = '#ffd100'; for (const m of Wow.mobs) if (m.state !== 'dead') { const [x, y] = P(m.p); g.beginPath(); g.arc(x, y, s * 0.55, 0, 7); g.fill(); }
      const [vx, vy] = P(VENDOR_POS); g.fillStyle = '#ffd100'; g.fillText(tr('💰 Planck', '💰 Planck', '💰 Планк'), vx, vy);
    }
    if (this.scene === Hub) {
      const [x, y] = P(Hub.player.p);
      g.fillStyle = '#5ff'; g.beginPath(); g.arc(x, y, s * 1.1, 0, 7); g.fill();
      g.fillText(tr('ψ (ty)', 'ψ (you)', 'ψ (ти)'), x, y - s * 1.8);
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
      this.fresh = !d;
      if (d) this.progress = { stars: d.stars || {}, diff: d.diff || {}, codex: new Set(d.codex || []), scrolls: new Set(d.scrolls || []), introSeen: !!d.introSeen, eqIntroSeen: !!d.eqIntroSeen, laymanSeen: !!d.laymanSeen, moved: !!d.moved, allUnlocked: !!d.allUnlocked, session: d.session || null, wow: d.wow || null };
    } catch (e) { /* čistý začiatok */ }
  },
};

window.addEventListener('load', () => Game.init());
