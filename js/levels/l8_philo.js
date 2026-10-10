'use strict';
// LEVEL 8 — Sieň výkladov (mentor: Niels Bohr) — jazyk, meranie a realita podľa prednášok.

const PHILOSOPHERS = [
  { id: 'kant', name: 'Immanuel Kant', face: '📜', col: [0.8, 0.7, 0.5],
    lines: [DL('l8.kant.lines.0'),
      DL('l8.kant.lines.1')],
    q: { q: DL('l8.kant.q.q'), options: [DL('l8.kant.q.options.0'), DL('l8.kant.q.options.1'), DL('l8.kant.q.options.2')], correct: 0, why: DL('l8.kant.q.why') } },
  { id: 'wittg', name: 'Ludwig Wittgenstein', face: '🗣', col: [0.6, 0.6, 0.8],
    lines: [DL('l8.wittg.lines.0'),
      DL('l8.wittg.lines.1')],
    q: { q: DL('l8.wittg.q.q'), options: [DL('l8.wittg.q.options.0'), DL('l8.wittg.q.options.1'), DL('l8.wittg.q.options.2')], correct: 0, why: DL('l8.wittg.q.why') } },
  { id: 'stodola', name: 'Aurel Stodola', face: '⚙️', col: [0.5, 0.75, 0.6],
    lines: [DL('l8.stodola.lines.0'),
      DL('l8.stodola.lines.1')],
    q: { q: DL('l8.stodola.q.q'), options: [DL('l8.stodola.q.options.0'), DL('l8.stodola.q.options.1'), DL('l8.stodola.q.options.2')], correct: 0, why: DL('l8.stodola.q.why') } },
  { id: 'bohm', name: 'David Bohm', face: '🌊', col: [0.4, 0.6, 0.9],
    lines: [DL('l8.bohm.lines.0'),
      DL('l8.bohm.lines.1')],
    q: { q: DL('l8.bohm.q.q'), options: [DL('l8.bohm.q.options.0'), DL('l8.bohm.q.options.1'), DL('l8.bohm.q.options.2')], correct: 0, why: DL('l8.bohm.q.why') } },
  { id: 'heis', name: 'Werner Heisenberg', face: '🎼', col: [0.85, 0.55, 0.45],
    lines: [DL('l8.heis.lines.0'),
      DL('l8.heis.lines.1')],
    q: { q: DL('l8.heis.q.q'), options: [DL('l8.heis.q.options.0'), DL('l8.heis.q.options.1'), DL('l8.heis.q.options.2')], correct: 0, why: DL('l8.heis.q.why') } },
  { id: 'noether', name: 'Emmy Noether', face: '♾', col: [0.75, 0.5, 0.85],
    lines: [DL('l8.noether.lines.0'),
      DL('l8.noether.lines.1')],
    q: { q: DL('l8.noether.q.q'), options: [DL('l8.noether.q.options.0'), DL('l8.noether.q.options.1'), DL('l8.noether.q.options.2')], correct: 0, why: DL('l8.noether.q.why') } },
];
const PHILOSOPHERS_EN = { // mená mysliteľov (repliky a otázky sú v lang/*.csv)

};
const PHILOSOPHERS_UK = { // mená mysliteľov (repliky a otázky sú v lang/*.csv)
  kant: { name: 'Іммануїл Кант' },
  wittg: { name: 'Людвіг Вітгенштейн' },
  stodola: { name: 'Аурел Стодола' },
  bohm: { name: 'Девід Бом' },
  heis: { name: 'Вернер Гейзенберг' },
  noether: { name: 'Еммі Нетер' },
};
const PHILOSOPHERS_TR = tr(null, PHILOSOPHERS_EN, PHILOSOPHERS_UK);
if (PHILOSOPHERS_TR) for (const p of PHILOSOPHERS) Object.assign(p, PHILOSOPHERS_TR[p.id]);

class L8Philo extends Level {
  get steps() { return [this.intro, this.statues, this.sorting]; }

  setup() {
    this.cam = new OrbitCam([0, 1.5, 0], 7.5, 0.2, 0.55, 4, 9);
    this.talked = new Set(); this.active = null;
  }

  intro() {
    this.quest(tr('Vypočuj si Bohra', 'Listen to Bohr', 'Послухай Бора'), { easy: tr('💬 Bohr', '💬 Bohr', '💬 Бор'), hard: tr('Bohr: komplementarita', 'Bohr: complementarity', 'Бор: доповнювальність') });
    this.say([
      DL('l8.intro.1.0'),
      DL('l8.intro.1.1'),
      DL('l8.intro.1.2'),
      DL('l8.intro.1.3'),
    ], () => this.next());
  }

  statues() {
    this.talked = new Set(this.sub.talked || []);
    this.quest(tr('Porozprávaj sa so všetkými 6 mysliteľmi (tlačidlá vpravo).', 'Talk to all 6 thinkers (buttons on the right).', 'Поговори з усіма 6 мислителями (кнопки праворуч).'), { easy: tr('🗣 6 mysliteľov', '🗣 6 thinkers', '🗣 6 мислителів'), hard: tr('Kant · Wittgenstein · Stodola · Bohm · Heisenberg · Noether', 'Kant · Wittgenstein · Stodola · Bohm · Heisenberg · Noether', 'Кант · Вітгенштейн · Стодола · Бом · Гейзенберг · Нетер') });
    this.buildPanel();
  }
  buildPanel() {
    UI.panelSet(tr('Sieň výkladov', 'Hall of Interpretations', 'Зала тлумачень'), [
      ...PHILOSOPHERS.map((p) => UI.button(`${this.talked.has(p.id) ? '✅' : p.face} ${p.name}`, () => this.talk(p))),
      UI.info(`${tr('Hotovo', 'Done', 'Готово')}: ${this.talked.size} / ${PHILOSOPHERS.length}`),
    ]);
  }
  talk(p) {
    this.active = p.id;
    this.cam.yaw = PHILOSOPHERS.indexOf(p) / PHILOSOPHERS.length * Math.PI * 2 + Math.PI;
    UI.say(p.lines.map((t) => ({ who: p.name, face: p.face, text: t })), () => {
      UI.quiz({ who: p.name, face: p.face, ...p.q }, (ok) => {
        if (!ok) this.mistakes++;
        this.talked.add(p.id); this.sub.talked = [...this.talked]; this.grant([p.id]); this.buildPanel();
        if (this.talked.size === PHILOSOPHERS.length && this.stepIdx === 1) this.next();
      });
    });
  }

  sorting() {
    this.active = null;
    UI.panelHide();
    this.quest(tr('Záverečná úloha Bohra: tri roviny otázok a štyri otázky ku každému pojmu', 'Bohr’s final task: three levels of questions and four questions for every concept', 'Підсумкове завдання Бора: три рівні питань і чотири питання до кожного поняття'), { easy: tr('🗂 zatrieď otázky', '🗂 sort the questions', '🗂 розсортуй питання'), hard: tr('ontológia / epistemológia / fenomenológia · 4 otázky', 'ontology / epistemology / phenomenology · 4 questions', 'онтологія / епістемологія / феноменологія · 4 питання') });
    this.say([
      DL('l8.sorting.1.0'),
      DL('l8.sorting.1.1'),
    ], () => UI.quizSeries([
      { who: DL('l8.sorting.2.0.who'), face: '☯', q: DL('l8.sorting.2.0.q'), options: [DL('l8.sorting.2.0.options.0'), DL('l8.sorting.2.0.options.1'), DL('l8.sorting.2.0.options.2')], correct: 0, why: DL('l8.sorting.2.0.why') },
      { who: DL('l8.sorting.2.1.who'), face: '☯', q: DL('l8.sorting.2.1.q'), options: [DL('l8.sorting.2.1.options.0'), DL('l8.sorting.2.1.options.1'), DL('l8.sorting.2.1.options.2')], correct: 0, why: DL('l8.sorting.2.1.why') },
      { who: DL('l8.sorting.2.2.who'), face: '☯', q: DL('l8.sorting.2.2.q'), options: [DL('l8.sorting.2.2.options.0'), DL('l8.sorting.2.2.options.1'), DL('l8.sorting.2.2.options.2')], correct: 0, why: DL('l8.sorting.2.2.why') },
      { who: DL('l8.sorting.2.3.who'), face: '☯', q: DL('l8.sorting.2.3.q'), options: [DL('l8.sorting.2.3.options.0'), DL('l8.sorting.2.3.options.1'), DL('l8.sorting.2.3.options.2'), DL('l8.sorting.2.3.options.3')], correct: 0, why: DL('l8.sorting.2.3.why') },
    ], (m) => {
      this.mistakes += m;
      this.grant(['bohr', 'collapse', 'onto', 'four']);
      this.say([DL('l8.sorting.3')], () => this.next());
    }));
  }

  update(dt) { this.t += dt; }

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('disk', M4.trs([0, 0.01, 0], 0, 9), [0.3, 0.3, 0.35], { pattern: 1 });
    r.draw('cylinder', M4.trs([0, -0.6, 0], 0, [9.2, 0.6, 9.2]), [0.4, 0.38, 0.42]);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      r.draw('cylinder', M4.trs([Math.cos(a) * 8.5, 0, Math.sin(a) * 8.5], 0, [0.35, 5, 0.35]), [0.85, 0.85, 0.8]);
    }
    r.draw('torus', M4.trs([0, 5, 0], 0, [8.5, 2, 8.5]), [0.85, 0.85, 0.8]);
    // Bohr v strede s jin-jangom
    r.draw('cylinder', M4.trs([0, 0, 0], 0, [0.9, 0.5, 0.9]), [0.5, 0.5, 0.55]);
    r.draw('cylinder', M4.trs([0, 0.5, 0], 0, [0.32, 1.2, 0.32]), [0.6, 0.9, 0.4]);
    r.sphere([0, 2.05, 0], 0.33, [0.95, 0.85, 0.75]);
    const yy = [0, 3.2, 0];
    r.sphere(V3.add(yy, [Math.cos(this.t) * 0.25, 0, Math.sin(this.t) * 0.25]), 0.25, [1, 1, 1], { emissive: 0.5 });
    r.sphere(V3.add(yy, [-Math.cos(this.t) * 0.25, 0, -Math.sin(this.t) * 0.25]), 0.25, [0.05, 0.05, 0.05]);
    UI.label('bohr', [0, 3.9, 0], tr('☯ Niels Bohr', '☯ Niels Bohr', '☯ Нільс Бор'), 'npc', CODEX.find((c) => c.id === 'bohr').text);
    PHILOSOPHERS.forEach((p, i) => {
      const a = i / PHILOSOPHERS.length * Math.PI * 2, pos = [Math.sin(a) * 5.5, 0, Math.cos(a) * 5.5];
      const done = this.talked.has(p.id), act = this.active === p.id;
      r.draw('box', M4.trs(V3.add(pos, [0, 0.4, 0]), 0, [1.3, 0.8, 1.3]), [0.6, 0.6, 0.62]);
      r.draw('cylinder', M4.trs(V3.add(pos, [0, 0.8, 0]), 0, [0.35, 1.3, 0.35]), done ? [1, 0.85, 0.35] : p.col, { emissive: act ? 0.6 : done ? 0.3 : 0 });
      r.sphere(V3.add(pos, [0, 2.45, 0]), 0.34, done ? [1, 0.9, 0.5] : [0.9, 0.9, 0.88], { emissive: act ? 0.4 : 0 });
      const cx = CODEX.find((c) => c.id === p.id);
      UI.label('ph' + p.id, V3.add(pos, [0, 3.3, 0]), `${p.face} ${p.name}${done ? ' ✅' : ''}`, 'npc', cx ? `<b>${cx.name}</b><br>${cx.text}` : null);
      UI.hot(V3.add(pos, [0, 1.6, 0]), cx ? `<b>${cx.name}</b><br>${cx.text}` : p.name, 45);
    });
  }
}
