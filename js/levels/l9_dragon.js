'use strict';
// LEVEL 9 — Dračí štít (mentor: Erwin Schrödinger) — záverečný súboj s kvantovým drakom Ketvarrom.
// Ťahová bitka: drakov štít je qubit (Blochov vektor r). Hráč kričí slová moci (hradlá, impulz),
// drak odpovedá ohláseným ťahom (rotácia, dekoherencia, presun srdca) a chrlí oheň.
// Úder čepeľou = meranie: zásah s pravdepodobnosťou P = (1 + r·n)/2. Zraniť draka však môže len úder,
// ktorý je dostatočne presne zamierený (P ≥ prah) — to je „metrika“, ktorú treba trafiť.

// ------------------------------------------------------------------
// Model draka z primitív (používa ho aj ostrov)
// ------------------------------------------------------------------
const Dragon = {
  wingMesh: null,
  wing(r) {
    if (!this.wingMesh) {
      const rim = [[0, 0, 0.6], [1.2, 0, 0.95], [2.6, 0, 0.75], [4.3, 0, 0.1], [3.6, 0, -0.6], [2.9, 0, -0.35], [2.3, 0, -1.15], [1.6, 0, -0.8], [0.9, 0, -1.35], [0, 0, -0.9]];
      const pts = [[0.5, 0, -0.2], ...rim], idx = [];
      for (let i = 1; i < pts.length - 1; i++) idx.push(0, i, i + 1);
      this.wingMesh = r.mesh(pts.flat(), pts.flatMap(() => [0, 1, 0]), idx);
      this.wingRim = rim;
    }
    return this.wingMesh;
  },
  // pos = stred trupu, yaw = smer hlavy (lokálna +z), o: { scale, t, col, eye, alpha, bank, landed, breath }
  draw(r, pos, yaw, o = {}) {
    const S = o.scale || 1, t = o.t ?? r.time, col = o.col || [0.34, 0.31, 0.29], A = o.alpha ?? 1;
    const base = M4.mul(M4.trs(pos, yaw, S), M4.rotZ(o.bank || 0));
    const W = (p) => M4.transform(base, p).slice(0, 3);
    const opt = (x = {}) => ({ alpha: A, ...x });
    const part = (mesh, local, c, x) => r.draw(mesh, M4.mul(base, local), c, opt(x));
    const dark = V3.scale(col, 0.6), bone = [0.78, 0.72, 0.6], belly = V3.add(V3.scale(col, 0.7), [0.18, 0.14, 0.08]);
    // trup a brucho
    part('sphere', M4.trs([0, 0, 0], 0, [0.85, 0.75, 1.9]), col, { pattern: 6 });
    part('sphere', M4.trs([0, -0.28, 0.35], 0, [0.62, 0.48, 1.35]), belly, { pattern: 6 });
    // krk a hlava
    const bob = Math.sin(t * 1.3) * 0.12, head = [0, 1.35 + bob, 3.05];
    const neck = [[0, 0.3, 1.45], [0, 0.75, 2.05], [0, 1.1 + bob * 0.5, 2.5], head];
    for (let k = 0; k < 3; k++) r.rod(W(neck[k]), W(neck[k + 1]), col, (0.34 - k * 0.05) * S, opt({ pattern: 6 }));
    part('sphere', M4.trs(head, 0, [0.36, 0.3, 0.62]), col, { pattern: 6 });
    part('sphere', M4.trs(V3.add(head, [0, -0.17 - (o.breath || 0) * 0.18, 0.22]), 0, [0.27, 0.12, 0.5]), dark);
    for (const s of [-1, 1]) {
      r.sphere(W(V3.add(head, [s * 0.2, 0.1, 0.3])), 0.07 * S, o.eye || [1, 0.55, 0.15], opt({ emissive: 1.6 }));
      const hb = W(V3.add(head, [s * 0.16, 0.2, -0.15])), ht = W(V3.add(head, [s * 0.32, 0.55, -0.95]));
      r.draw('cone', M4.alignY(hb, V3.sub(ht, hb), V3.len(V3.sub(ht, hb)), 0.09 * S), bone, opt());
    }
    // tŕne na chrbte
    for (let k = 0; k < 6; k++) {
      const z = 1.3 - k * 0.55, b = W([0, 0.62 - Math.abs(z) * 0.08, z]), tp = W([0, 1.05 - Math.abs(z) * 0.1, z - 0.3]);
      r.draw('cone', M4.alignY(b, V3.sub(tp, b), V3.len(V3.sub(tp, b)), 0.11 * S), bone, opt());
    }
    // chvost
    let prev = [0, 0, -1.7];
    for (let k = 1; k <= 8; k++) {
      const p = [Math.sin(t * 1.8 - k * 0.5) * 0.13 * k, -0.06 * k, -1.7 - k * 0.6];
      r.rod(W(prev), W(p), col, (0.42 - k * 0.045) * S, opt({ pattern: 6 }));
      prev = p;
    }
    const tb = W(prev), tt = W(V3.add(prev, [0, 0.1, -0.7]));
    r.draw('cone', M4.alignY(tb, V3.sub(tt, tb), V3.len(V3.sub(tt, tb)), 0.12 * S), bone, opt());
    // nohy (pri lete pritiahnuté)
    for (const [x, z] of [[-0.55, 0.9], [0.55, 0.9], [-0.6, -0.9], [0.6, -0.9]]) {
      const hip = W([x, -0.35, z]), foot = W(o.landed ? [x * 1.3, -1.45, z + 0.2] : [x * 0.9, -0.85, z - 0.7]);
      r.rod(hip, foot, dark, 0.14 * S, opt());
      r.sphere(foot, 0.16 * S, dark, opt());
    }
    // krídla: membrána (vlastná sieť) + kosti na nábežnej hrane
    const mesh = this.wing(r), flap = o.landed ? 1.05 : Math.sin(t * (o.flapSpeed || 2.6)) * 0.55;
    for (const s of [-1, 1]) {
      const local = M4.mul(M4.trs([s * 0.55, 0.45, 0.45], 0, 1), M4.mul(M4.rotZ(s * flap), M4.trs([0, 0, 0], 0, [s * 1.3 * (o.landed ? 0.7 : 1), 1, 1.25])));
      const wm = M4.mul(base, local);
      r.draw(mesh, wm, V3.add(V3.scale(col, 0.62), [0.08, 0.02, 0]), opt());
      const rim = this.wingRim.slice(0, 4).map((p) => M4.transform(wm, p).slice(0, 3));
      for (let k = 0; k < 3; k++) r.rod(rim[k], rim[k + 1], bone, 0.07 * S, opt());
    }
  },
};

// ------------------------------------------------------------------
// Ťahy draka a fázy súboja
// ------------------------------------------------------------------
const DRAGON_MOVES = {
  hiss90: { icon: '🌀', name: tr('Fázové zasyčanie (Z 90°)', 'Phase Hiss (Z 90°)', 'Фазове сичання (Z 90°)'), rot: [[0, 0, 1], Math.PI / 2],
    tip: tr('Otočí štít o 90° okolo zvislej osi z. Póly |0⟩ a |1⟩ sa nepohnú — mení sa len relatívna fáza.', 'Turns the ward by 90° about the vertical z axis. The poles |0⟩ and |1⟩ do not move — only the relative phase changes.', 'Повертає захист на 90° навколо вертикальної осі z. Полюси |0⟩ і |1⟩ не рухаються — змінюється лише відносна фаза.') },
  hissm90: { icon: '🌀', name: tr('Spätné zasyčanie (Z −90°)', 'Reverse Hiss (Z −90°)', 'Зворотне сичання (Z −90°)'), rot: [[0, 0, 1], -Math.PI / 2],
    tip: tr('Otočí štít o −90° okolo osi z. Póly sa nepohnú.', 'Turns the ward by −90° about the z axis. The poles do not move.', 'Повертає захист на −90° навколо осі z. Полюси не рухаються.') },
  hiss180: { icon: '🌀', name: tr('Fázový jed (Z 180°)', 'Phase Venom (Z 180°)', 'Фазова отрута (Z 180°)'), rot: [[0, 0, 1], Math.PI],
    tip: tr('Hradlo Z: |+⟩ ↔ |−⟩. Pravdepodobnosti v Z-báze sa nezmenia.', 'The Z gate: |+⟩ ↔ |−⟩. Probabilities in the Z basis do not change.', 'Гейт Z: |+⟩ ↔ |−⟩. Імовірності в базисі Z не змінюються.') },
  flip: { icon: '🪽', name: tr('Úder krídlom (X)', 'Wing Flip (X)', 'Помах крила (X)'), rot: [[1, 0, 0], Math.PI],
    tip: tr('Hradlo X: preklopí |0⟩ ↔ |1⟩. Ak stojíš na |0⟩, drak ťa sám preklopí na |1⟩!', 'The X gate: flips |0⟩ ↔ |1⟩. If you stand at |0⟩, the dragon flips you onto |1⟩ himself!', 'Гейт X: перевертає |0⟩ ↔ |1⟩. Якщо ти стоїш у |0⟩, дракон сам перекине тебе в |1⟩!') },
  roar: { icon: '🌪', name: tr('Rev oblohy (Y 90°)', 'Sky Roar (Y 90°)', 'Небесний рев (Y 90°)'), rot: [[0, 1, 0], Math.PI / 2],
    tip: tr('Otočí štít o 90° okolo osi y: z pólu na rovník a späť. Mieri tak, aby ťa rev dotlačil k cieľu.', 'Turns the ward by 90° about the y axis: from a pole to the equator and back. Aim so that the roar pushes you onto the target.', 'Повертає захист на 90° навколо осі y: з полюса на екватор і назад. Цілься так, щоб рев штовхнув тебе на ціль.') },
  fog: { icon: '🌫', name: tr('Hmla dekoherencie', 'Fog of Decoherence', 'Туман декогеренції'), fog: 0.5,
    tip: tr('Zmrští vodorovnú časť šípky na polovicu (stráca sa koherencia). Na póloch hmla neškodí — na rovníku áno.', 'Halves the horizontal part of the arrow (coherence is lost). At the poles the fog does no harm — on the equator it does.', 'Удвічі вкорочує горизонтальну частину стрілки (когерентність втрачається). На полюсах туман не шкодить — на екваторі шкодить.') },
  shift: { icon: '💓', name: tr('Presun srdca', 'Heart Shift', 'Зсув серця'), shift: Math.PI / 3,
    tip: tr('Drak presunie svoje zraniteľné miesto (zlatú šípku n) o 60°. Tvoj štít sa nepohne.', 'The dragon moves his weak spot (the golden arrow n) by 60°. Your ward does not move.', 'Дракон переміщує своє вразливе місце (золоту стрілку n) на 60°. Твій захист не рухається.') },
};
const DRAGON_PHASES = [
  { hp: 2, pool: ['hiss90', 'hiss180', 'hissm90', 'flip'], tools: ['X', 'H', 'Z', 'S'], col: [0.36, 0.33, 0.3], eye: [1, 0.6, 0.15],
    name: tr('Kamenná šupina', 'Stone Scale', 'Кам’яна луска') },
  { hp: 2, pool: ['hiss90', 'flip', 'roar', 'fog', 'fog'], tools: ['X', 'H', 'Z', 'S', 'pulse'], col: [0.3, 0.34, 0.4], eye: [0.5, 0.8, 1],
    name: tr('Hmlový dych', 'Fog Breath', 'Туманний подих') },
  { hp: 3, pool: ['hiss90', 'hissm90', 'roar', 'shift', 'shift', 'fog'], tools: ['X', 'H', 'Z', 'S', 'pulse', 'axis'], col: [0.4, 0.22, 0.2], eye: [1, 0.25, 0.2],
    name: tr('Naklonené srdce', 'Tilted Heart', 'Нахилене серце') },
];
// slová moci = hradlá; názvy v severskom duchu
const SHOUTS = {
  X: { word: 'VRAK', tip: tr('<b>VRAK</b> = hradlo X: otočenie o 180° okolo osi x. Preklopí |0⟩ ↔ |1⟩.', '<b>VRAK</b> = the X gate: a 180° turn about the x axis. Flips |0⟩ ↔ |1⟩.', '<b>VRAK</b> = гейт X: поворот на 180° навколо осі x. Перевертає |0⟩ ↔ |1⟩.') },
  H: { word: 'HADRA', tip: tr('<b>HADRA</b> = Hadamard H: 180° okolo osi (x+z). |0⟩ ↔ |+⟩, |1⟩ ↔ |−⟩.', '<b>HADRA</b> = Hadamard H: 180° about the (x+z) axis. |0⟩ ↔ |+⟩, |1⟩ ↔ |−⟩.', '<b>HADRA</b> = Адамар H: 180° навколо осі (x+z). |0⟩ ↔ |+⟩, |1⟩ ↔ |−⟩.') },
  Z: { word: 'ZUN', tip: tr('<b>ZUN</b> = hradlo Z: 180° okolo osi z. Mení len relatívnu fázu.', '<b>ZUN</b> = the Z gate: 180° about the z axis. Changes only the relative phase.', '<b>ZUN</b> = гейт Z: 180° навколо осі z. Змінює лише відносну фазу.') },
  S: { word: 'SEK', tip: tr('<b>SEK</b> = hradlo S: 90° okolo osi z. |+⟩ → |+i⟩.', '<b>SEK</b> = the S gate: 90° about the z axis. |+⟩ → |+i⟩.', '<b>SEK</b> = гейт S: 90° навколо осі z. |+⟩ → |+i⟩.') },
};

const DRAGON_TRAPS = tr([
  { q: 'Drak má P(zásah) = 70 %. Udrel si a minul. Čo sa stalo?', options: ['Meranie dalo menej pravdepodobný výsledok — 30 % sa tiež stáva; štít skolaboval na opačný pól', 'Pravdepodobnosť bola zle vypočítaná', 'Drak zistil, že ho meriaš, a uhol zmenil'], correct: 0, why: 'Bornovo pravidlo dáva pravdepodobnosti, nie istoty. Po meraní je stav v jednom z dvoch výsledkov.' },
  { q: 'Prečo ti „Fázové zasyčanie“ (rotácia okolo z) neublížilo, keď si stál na |1⟩?', options: ['Póly sú vlastné stavy Z — rotácia okolo z ich mení len o globálnu fázu', 'Lebo drak minul', 'Lebo |1⟩ je nulový vektor'], correct: 0, why: 'Rz(φ)|1⟩ = e<sup>iφ/2</sup>|1⟩ — globálna fáza je nepozorovateľná.' },
  { q: 'Hmla dekoherencie zmrštila šípku štítu na dĺžku 0,5. Aké najväčšie P(zásah) dosiahneš len hradlami?', options: ['75 % — rotácie dĺžku šípky nezväčšia: P ≤ (1 + |r|)/2', '100 % — stačí správne hradlo', '50 %'], correct: 0, why: 'Unitárne hradlá sú rotácie; zmiešaný stav zostane zmiešaný. Pomôže až meranie (kolaps) — alebo nedopustiť hmlu na rovníku.' },
], [
  { q: 'The dragon has P(hit) = 70 %. You struck and missed. What happened?', options: ['The measurement gave the less likely outcome — 30 % happens too; the ward collapsed onto the opposite pole', 'The probability was computed wrongly', 'The dragon noticed you measuring and changed the angle'], correct: 0, why: 'The Born rule gives probabilities, not certainties. After a measurement the state is in one of the two outcomes.' },
  { q: 'Why did the “Phase Hiss” (a rotation about z) not hurt you while you stood at |1⟩?', options: ['The poles are eigenstates of Z — a rotation about z changes them only by a global phase', 'Because the dragon missed', 'Because |1⟩ is the zero vector'], correct: 0, why: 'Rz(φ)|1⟩ = e<sup>iφ/2</sup>|1⟩ — a global phase is unobservable.' },
  { q: 'The Fog of Decoherence shrank the ward’s arrow to length 0.5. What is the highest P(hit) you can reach with gates alone?', options: ['75 % — rotations do not lengthen the arrow: P ≤ (1 + |r|)/2', '100 % — you just need the right gate', '50 %'], correct: 0, why: 'Unitary gates are rotations; a mixed state stays mixed. Only a measurement (collapse) helps — or not letting the fog catch you on the equator.' },
], [
  { q: 'Дракон має P(влучання) = 70 %. Ти вдарив(-ла) і промахнувся(-лася). Що сталося?', options: ['Вимірювання дало менш імовірний результат — 30 % теж трапляються; захист сколапсував на протилежний полюс', 'Імовірність була обчислена неправильно', 'Дракон помітив, що ти вимірюєш, і змінив кут'], correct: 0, why: 'Правило Борна дає ймовірності, а не певність. Після вимірювання стан перебуває в одному з двох результатів.' },
  { q: 'Чому «Фазове сичання» (поворот навколо z) не зашкодило тобі, коли ти стояв(-ла) в |1⟩?', options: ['Полюси — власні стани Z: поворот навколо z змінює їх лише на глобальну фазу', 'Бо дракон промахнувся', 'Бо |1⟩ — нульовий вектор'], correct: 0, why: 'Rz(φ)|1⟩ = e<sup>iφ/2</sup>|1⟩ — глобальну фазу неможливо спостерегти.' },
  { q: 'Туман декогеренції вкоротив стрілку захисту до довжини 0,5. Яке найвище P(влучання) можна досягти самими гейтами?', options: ['75 % — повороти не подовжують стрілку: P ≤ (1 + |r|)/2', '100 % — потрібен лише правильний гейт', '50 %'], correct: 0, why: 'Унітарні гейти — це повороти; змішаний стан лишається змішаним. Допоможе лише вимірювання (колапс) — або не дати туману застати тебе на екваторі.' },
]);

class L9Dragon extends Level {
  get steps() { return [this.intro, this.phase1, this.phase2, this.phase3]; }

  setup() {
    this.cam = new OrbitCam([0, 3, -3], 21, -0.2, 0.3, 8, 36);
    Game.r.fog = 0.012; Game.r.fogColor = [0.29, 0.34, 0.4];
    this.r = [0, 0, 1]; this.n = [0, 0, -1]; this.anim = null; this.fx = []; this.log = []; this.phase = -1; this.lock = true;
    this.thetaDeg = 90; this.phiDeg = 0;
  }
  exit() { super.exit(); Game.r.fogColor = [0.06, 0.08, 0.16]; }

  get thr() { return byDiff(0.8, 0.9, 0.95); }
  hitP(r = this.r, n = this.n) { return clamp((1 + V3.dot(r, n)) / 2, 0, 1); }

  intro() {
    this.quest(tr('Vypočuj si Schrödingera', 'Listen to Schrödinger', 'Послухай Шредінгера'), { easy: tr('💬 Schrödinger', '💬 Schrödinger', '💬 Шредінгер'), hard: tr('Súboj: štít = qubit, úder = meranie', 'Battle: ward = qubit, strike = measurement', 'Битва: захист = кубіт, удар = вимірювання') });
    this.say(tr([
      'Takže si prešiel všetkými ôsmimi portálmi. Som Erwin Schrödinger — áno, ten s mačkou. Na tomto štíte hory hniezdi <b>Ketvarr</b>, kvantový drak.',
      'Jeho šupiny chráni <b>štít, ktorý je qubitom</b>. Vidíš ho vpravo ako Blochovu guľu. Zlatá šípka <b>n</b> je jeho zraniteľné miesto.',
      'Tvoj meč je <b>meranie</b>. Úder zasiahne s pravdepodobnosťou <b>P = (1 + r·n)/2</b> — čím bližšie je šípka štítu k zlatej, tým istejšie. A pozor: po údere štít <b>skolabuje</b> na jeden z pólov.',
      'Nehovor, že drak je „v nebi aj na zemi naraz“. Povedz presne: je v stave, ktorý dáva <b>P(zásah)</b>. Tie dva priesvitné draky ukazujú len pravdepodobnosti výsledkov.',
      `Bojuje sa na <b>ťahy</b>: vykríkneš jedno slovo moci (hradlo), potom drak urobí <b>ohlásený ťah</b> a chrlí oheň. Ketvarra zraní len úder s <b>P ≥ ${Fmt.pct(this.thr)}</b> — to je metrika, ktorú musíš trafiť.`,
    ], [
      'So you have passed through all eight portals. I am Erwin Schrödinger — yes, the one with the cat. On this mountain peak nests <b>Ketvarr</b>, the quantum dragon.',
      'His scales are guarded by <b>a ward that is a qubit</b>. You see it on the right as a Bloch ball. The golden arrow <b>n</b> is his weak spot.',
      'Your sword is <b>measurement</b>. A strike hits with probability <b>P = (1 + r·n)/2</b> — the closer the ward’s arrow is to the golden one, the surer the hit. And beware: after a strike the ward <b>collapses</b> onto one of the poles.',
      'Don’t say the dragon is “in the sky and on the ground at once”. Say it precisely: he is in a state that gives <b>P(hit)</b>. The two translucent dragons only show the probabilities of the outcomes.',
      `The fight is <b>turn-based</b>: you shout one Word of Power (a gate), then the dragon makes an <b>announced move</b> and breathes fire. Only a strike with <b>P ≥ ${Fmt.pct(this.thr)}</b> wounds Ketvarr — that is the metric you must hit.`,
    ], [
      'Отже, ти пройшов(-ла) всі вісім порталів. Я Ервін Шредінгер — так, той самий, що з котом. На цій гірській вершині гніздиться <b>Кетварр</b>, квантовий дракон.',
      'Його луску оберігає <b>захист, що є кубітом</b>. Ти бачиш його праворуч як кулю Блоха. Золота стрілка <b>n</b> — його вразливе місце.',
      'Твій меч — <b>вимірювання</b>. Удар влучає з імовірністю <b>P = (1 + r·n)/2</b> — що ближче стрілка захисту до золотої, то певніше влучання. І стережися: після удару захист <b>колапсує</b> на один із полюсів.',
      'Не кажи, що дракон «водночас у небі й на землі». Кажи точно: він у стані, що дає <b>P(влучання)</b>. Два напівпрозорі дракони лише показують імовірності результатів.',
      `Бій <b>покроковий</b>: ти вигукуєш одне слово сили (гейт), потім дракон робить <b>оголошений хід</b> і дихає вогнем. Кетварра поранить лише удар із <b>P ≥ ${Fmt.pct(this.thr)}</b> — це метрика, яку ти маєш досягти.`,
    ]), () => this.next());
  }

  phase1() { this.startPhase(0); }
  phase2() { this.startPhase(1); }
  phase3() { this.startPhase(2); }

  startPhase(k) {
    const P = this.ph = DRAGON_PHASES[k];
    this.phase = k; this.dhp = P.hp + byDiff(0, 0, Settings.diff === 'ancient' ? 1 : 0); this.dmax = this.dhp;
    this.hp = this.hpMax = byDiff(12, 9, 7);
    this.r = k === 0 ? pick2([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]]) : [0, 0, 1];
    this.n = k === 2 ? V3.norm([Math.cos(rand() * 6.28) * 0.8, Math.sin(rand() * 6.28) * 0.8, -0.6]) : [0, 0, -1];
    this.log = []; this.anim = null; this.lock = false;
    this.tele = this.pickMove();
    const qs = [
      [tr('Kolo 1 — Kamenná šupina: dostaň štít na |1⟩ a udri', 'Round 1 — Stone Scale: get the ward to |1⟩ and strike', 'Раунд 1 — Кам’яна луска: доведи захист до |1⟩ і вдар'), tr('⚔ štít → |1⟩ · udri', '⚔ ward → |1⟩ · strike', '⚔ захист → |1⟩ · удар')],
      [tr('Kolo 2 — Hmlový dych: nastav impulz a nenechaj sa chytiť hmlou na rovníku', 'Round 2 — Fog Breath: tune the pulse and don’t get caught by the fog on the equator', 'Раунд 2 — Туманний подих: налаштуй імпульс і не дай туману застати тебе на екваторі'), tr('⚔ impulz θ · pozor na hmlu', '⚔ pulse θ · beware of fog', '⚔ імпульс θ · стережися туману')],
      [tr('Kolo 3 — Naklonené srdce: zamier štít na zlatú šípku n', 'Round 3 — Tilted Heart: aim the ward at the golden arrow n', 'Раунд 3 — Нахилене серце: націль захист на золоту стрілку n'), tr('⚔ štít → zlatá šípka n', '⚔ ward → golden arrow n', '⚔ захист → золота стрілка n')],
    ][k];
    this.quest(qs[0], { easy: qs[1], hard: `P(${tr('hit', 'hit', 'влуч.')}) = (1 + r·n)/2 ≥ ${Fmt.pct(this.thr)} · HP ${this.dhp}` });
    const lines = tr([
      [`🐉 <b>Ketvarr:</b> „Malý stav ψ chce merať draka? Moje šupiny sú z kameňa a fázy!“`,
        'Schrödinger: Jeho ťahy v 1. kole sú hlavne <b>rotácie okolo z</b>. Tie póly nepohnú… a raz za čas <b>úder krídlom (X)</b>. Sleduj ohlásený ťah a čísla na tlačidlách — ukazujú P(zásah) po drakovom ťahu.'],
      [`🐉 <b>Ketvarr:</b> „Hmla! Nech sa tvoja koherencia rozplynie!“`,
        'Schrödinger: Teraz chrlí <b>hmlu dekoherencie</b>, ktorá zmršťuje šípku na rovníku. Dostal si nové slovo: <b>RABI-RA</b> — impulz s nastaviteľným uhlom θ. Na rovníku sa nezdržuj!'],
      [`🐉 <b>Ketvarr:</b> „Moje srdce nie je tam, kde ho hľadáš!“`,
        'Schrödinger: Zraniteľné miesto <b>n</b> je teraz naklonené a drak ho presúva. Impulz má aj <b>os φ</b> v rovníkovej rovine. Mier tak, aby po drakovom ťahu bolo P ≥ prah.'],
    ], [
      [`🐉 <b>Ketvarr:</b> “A little state ψ wants to measure a dragon? My scales are made of stone and phases!”`,
        'Schrödinger: His moves in round 1 are mostly <b>rotations about z</b>. Those don’t move the poles… and now and then a <b>Wing Flip (X)</b>. Watch the announced move and the numbers on the buttons — they show P(hit) after the dragon’s move.'],
      [`🐉 <b>Ketvarr:</b> “Fog! Let your coherence dissolve!”`,
        'Schrödinger: Now he breathes the <b>Fog of Decoherence</b>, which shrinks the arrow on the equator. You have learned a new word: <b>RABI-RA</b> — a pulse with an adjustable angle θ. Don’t linger on the equator!'],
      [`🐉 <b>Ketvarr:</b> “My heart is not where you seek it!”`,
        'Schrödinger: The weak spot <b>n</b> is now tilted, and the dragon moves it. The pulse also has an <b>axis φ</b> in the equatorial plane. Aim so that after the dragon’s move P ≥ the threshold.'],
    ], [
      [`🐉 <b>Кетварр:</b> «Маленький стан ψ хоче виміряти дракона? Моя луска з каменю та фаз!»`,
        'Шредінгер: Його ходи в 1-му раунді — здебільшого <b>повороти навколо z</b>. Вони не рухають полюсів… а час від часу — <b>Помах крила (X)</b>. Стеж за оголошеним ходом і числами на кнопках — вони показують P(влучання) після ходу дракона.'],
      [`🐉 <b>Кетварр:</b> «Туман! Хай розчиниться твоя когерентність!»`,
        'Шредінгер: Тепер він дихає <b>Туманом декогеренції</b>, що вкорочує стрілку на екваторі. Ти вивчив(-ла) нове слово: <b>RABI-RA</b> — імпульс із налаштовуваним кутом θ. Не затримуйся на екваторі!'],
      [`🐉 <b>Кетварр:</b> «Моє серце не там, де ти його шукаєш!»`,
        'Шредінгер: Вразливе місце <b>n</b> тепер нахилене, і дракон його переміщує. Імпульс має також <b>вісь φ</b> в екваторіальній площині. Цілься так, щоб після ходу дракона P ≥ порогу.'],
    ])[k];
    this.say(lines.map((t) => (t.startsWith('🐉') ? { who: tr('Ketvarr', 'Ketvarr', 'Кетварр'), face: '🐉', text: t.replace(/^🐉 <b>Ketvarr:<\/b> /, '') } : t.replace(/^Schrödinger: /, ''))), () => this.buildPanel());
  }

  pickMove() {
    const key = pick2(this.ph.pool), m = { key };
    if (key === 'shift') { // os presunu: kolmá na n, aby sa n naozaj pohlo o 60°
      const a = V3.cross(this.n, [rand() - 0.5, rand() - 0.5, rand() - 0.5]);
      m.axis = V3.len(a) > 1e-3 ? V3.norm(a) : [1, 0, 0];
    }
    return m;
  }
  // čistá funkcia: čo urobí ohlásený ťah draka so štítom r a zraniteľným miestom n
  dragonEffect(m, r, n) {
    const D = DRAGON_MOVES[m.key];
    if (D.rot) return [V3.rotate(r, V3.norm(D.rot[0]), D.rot[1]), n];
    if (D.fog) return [[r[0] * D.fog, r[1] * D.fog, r[2]], n];
    if (D.shift) return [r, V3.rotate(n, m.axis, D.shift)];
    return [r, n];
  }
  // nástroj hráča ako rotácia [os, uhol]
  toolRot(tool) {
    if (tool === 'pulse') { const f = this.phiDeg * Math.PI / 180; return [[Math.cos(f), Math.sin(f), 0], this.thetaDeg * Math.PI / 180]; }
    return [V3.norm(GateAxis[tool][0]), GateAxis[tool][1]];
  }
  // P(zásah) v ďalšom ťahu, ak teraz použiješ nástroj a drak potom urobí ohlásený ťah
  predict(tool) {
    const [ax, ang] = this.toolRot(tool), [r, n] = this.dragonEffect(this.tele, V3.rotate(this.r, ax, ang), this.n);
    return this.hitP(r, n);
  }

  // ---------- panel súboja ----------
  buildPanel() {
    const P = this.ph, pc = (p) => `<span class="${p >= this.thr ? 'ok' : 'no'}">${Fmt.pct(p)}</span>`;
    const bar = (cls, label, v, max) => {
      const b = el('div', 'bar ' + cls, `<span>${label}</span><i style="width:${(100 * Math.max(v, 0) / max).toFixed(0)}%"></i><b>${Math.max(v, 0)} / ${max}</b>`);
      return b;
    };
    const D = DRAGON_MOVES[this.tele.key], now = this.hitP();
    const strike = UI.button(`⚔ ${tr('Čepeľ Borna', 'Born’s Blade', 'Борнів клинок')} — P = ${pc(now)}`, () => this.act('strike'), 'big strike',
      tr(`Úder = meranie pozdĺž n. Zasiahne s P = (1 + r·n)/2 = ${Fmt.pct(now)}. Draka zraní len pri P ≥ ${Fmt.pct(this.thr)}; inak sa čepeľ zošmykne.`,
        `Strike = a measurement along n. Hits with P = (1 + r·n)/2 = ${Fmt.pct(now)}. Wounds the dragon only when P ≥ ${Fmt.pct(this.thr)}; otherwise the blade glances off.`, `Удар = вимірювання вздовж n. Влучає з P = (1 + r·n)/2 = ${Fmt.pct(now)}. Ранить дракона, лише коли P ≥ ${Fmt.pct(this.thr)}; інакше клинок ковзає.`));
    const gates = P.tools.filter((g) => SHOUTS[g]).map((g) => UI.button(`${g}<small>${SHOUTS[g].word} · ${Fmt.pct(this.predict(g))}</small>`, () => this.act(g), 'gate shout',
      SHOUTS[g].tip + '<br>' + tr(`Po ťahu draka: P(zásah) = ${Fmt.pct(this.predict(g))}.`, `After the dragon’s move: P(hit) = ${Fmt.pct(this.predict(g))}.`, `Після ходу дракона: P(влучання) = ${Fmt.pct(this.predict(g))}.`)));
    const nodes = [
      bar('you', tr('❤ Ty', '❤ You', '❤ Ти'), this.hp, this.hpMax),
      bar('drg', `🐉 ${tr('Ketvarr', 'Ketvarr', 'Кетварр')} · ${P.name}`, this.dhp, this.dmax),
      UI.info(`<div class="tele">${tr('Ohlásený ťah draka', 'Dragon’s announced move', 'Оголошений хід дракона')}: <b>${D.icon} ${D.name}</b><br><small>${D.tip}</small></div>`),
      UI.row(strike),
      UI.info(tr(`Slová moci <small>(číslo = P(zásah) v ďalšom ťahu, cieľ ≥ ${Fmt.pct(this.thr)})</small>`, `Words of Power <small>(number = P(hit) next turn, target ≥ ${Fmt.pct(this.thr)})</small>`, `Слова сили <small>(число = P(влучання) наступного ходу, ціль ≥ ${Fmt.pct(this.thr)})</small>`)),
      UI.row(...gates),
    ];
    if (P.tools.includes('pulse')) {
      const step = byDiff(15, 5, 1);
      const cast = UI.button('', () => this.act('pulse'), 'big shout');
      const upd = () => { const p = this.predict('pulse'); cast.innerHTML = `📯 RABI-RA (θ = ${this.thetaDeg}°${P.tools.includes('axis') ? `, φ = ${this.phiDeg}°` : ''}) → ${pc(p)}`; };
      nodes.push(this.slider = UI.slider(tr('plocha impulzu θ (uhol otočenia)', 'pulse area θ (rotation angle)', 'площа імпульсу θ (кут повороту)'), 0, 360, step, this.thetaDeg, (v) => { this.thetaDeg = v; upd(); return v + '°'; },
        tr('Impulz otočí štít o uhol θ okolo osi v rovníkovej rovine (ako v Rabiho rezonátore).', 'The pulse turns the ward by the angle θ about an axis in the equatorial plane (as in Rabi’s resonator).', 'Імпульс повертає захист на кут θ навколо осі в екваторіальній площині (як у резонаторі Рабі).')));
      if (P.tools.includes('axis')) nodes.push(UI.slider(tr('os impulzu φ (smer v rovine xy)', 'pulse axis φ (direction in the xy plane)', 'вісь імпульсу φ (напрямок у площині xy)'), 0, 345, byDiff(45, 15, 5), this.phiDeg, (v) => { this.phiDeg = v; upd(); return v + '°'; },
        tr('φ = 0° → os x, 90° → os y. Os rotácie impulzu.', 'φ = 0° → the x axis, 90° → the y axis. The pulse’s rotation axis.', 'φ = 0° → вісь x, 90° → вісь y. Вісь обертання імпульсу.')));
      nodes.push(UI.row(cast)); upd();
    }
    nodes.push(el('div', 'battlelog', this.log.slice(-5).map((l) => `<div>${l}</div>`).join('')));
    UI.panelSet(tr('⚔ Súboj s Ketvarrom', '⚔ Battle with Ketvarr', '⚔ Битва з Кетварром'), nodes);
  }
  addLog(html) { this.log.push(html); }

  // ---------- ťah hráča a odpoveď draka ----------
  act(tool) {
    if (this.lock || this.anim || UI.busy) return;
    this.lock = true;
    if (tool === 'strike') return this.strike();
    const [ax, ang] = this.toolRot(tool), word = tool === 'pulse' ? 'RABI-RA' : SHOUTS[tool].word;
    this.addLog(`🗣 <b>${word}!</b> ${tool === 'pulse' ? `(θ = ${this.thetaDeg}°)` : `(${tool})`}`);
    this.shout = { word, t: 0 };
    Sound.sfx('shout');
    this.animate({ axis: ax, ang }, () => this.dragonTurn());
  }

  strike() {
    const p = this.hitP(), hit = rand() < p, aimed = p >= this.thr - 1e-9;
    this.fx.push({ kind: 'slash', t: 0, hit: hit && aimed });
    Sound.sfx(hit && aimed ? 'clang' : hit ? 'glance' : 'whiff');
    if (!aimed) this.mistakes++;
    if (hit && aimed) {
      this.dhp--;
      this.addLog(`⚔ ${tr('Zásah!', 'Hit!', 'Влучання!')} (P = ${Fmt.pct(p)}) — ${tr('Ketvarr krváca', 'Ketvarr bleeds', 'Кетварр стікає кров’ю')} 🩸`);
    } else if (hit) this.addLog(`⚔ ${tr('Zásah, ale čepeľ sa zošmykla', 'A hit, but the blade glanced off', 'Влучання, але клинок ковзнув')} (P = ${Fmt.pct(p)} < ${Fmt.pct(this.thr)})`);
    else this.addLog(`⚔ ${tr('Vedľa', 'Miss', 'Промах')} (P = ${Fmt.pct(p)}) — ${tr('meranie dalo opačný výsledok', 'the measurement gave the other outcome', 'вимірювання дало інший результат')}`);
    // kolaps: štít skončí v jednom z výsledkov merania (čistý stav ±n)
    const to = hit ? this.n : V3.scale(this.n, -1);
    this.animate({ to }, () => {
      if (this.dhp <= 0) return this.phaseWon();
      if (!(hit && aimed)) return this.dragonTurn();
      // zranený drak si štít prekuje: nový náhodný čistý stav (inak by stačilo udierať znova a znova)
      this.addLog(`🛡 ${tr('Ketvarr prekoval štít', 'Ketvarr reforges his ward', 'Кетварр перекуває свій захист')}`); Sound.sfx('rune');
      const a = rand() * Math.PI * 2, z = this.phase === 0 ? 0 : rand() * 1.4 - 0.7, s = Math.sqrt(1 - z * z);
      this.animate({ to: [Math.cos(a) * s, Math.sin(a) * s, z], slerp: true }, () => this.dragonTurn(), 0.6);
    }, 0.45);
  }

  dragonTurn() {
    const m = this.tele, D = DRAGON_MOVES[m.key], [r, n] = this.dragonEffect(m, this.r, this.n);
    this.addLog(`🐉 ${D.icon} ${D.name}`);
    const done = () => {
      // oheň
      this.hp--; this.fx.push({ kind: 'fire', t: 0 }); Sound.sfx('fire');
      this.addLog(`🔥 ${tr('Ketvarr chrlí oheň', 'Ketvarr breathes fire', 'Кетварр дихає вогнем')} (−1 ❤)`);
      if (this.hp <= 0) return this.defeated();
      this.tele = this.pickMove(); this.lock = false; this.buildPanel();
    };
    if (D.rot) this.animate({ axis: V3.norm(D.rot[0]), ang: D.rot[1] }, done);
    else this.animate({ to: r, n }, done, 0.7);
  }

  phaseWon() {
    UI.panelHide(); this.anim = null; Sound.sfx('roar');
    const k = this.phase;
    const msg = tr([
      ['Ketvarr zareve a jeho kamenné šupiny popraskajú! „Póly… ty si stál na póloch, kde mi fáza nič nezmôže!“', 'Výborne. Rotácie okolo z menia len fázu — na pólach |0⟩, |1⟩ sú neškodné.'],
      ['Hmla sa rozostúpi. „Moja hmla… ty si sa na rovníku nezdržal!“', 'Presne. Dekoherencia ničí koherencie — šípku na rovníku. Rýchly impulz a meranie ju porazia.'],
      ['Ketvarr padá do snehu. „Zamieril si na moje srdce… aj keď sa hýbalo.“', 'Toto je kvantové riadenie v malom: predpovedať vývoj a nastaviť impulz tak, aby výsledok mal vysokú pravdepodobnosť.'],
    ][k], [
      ['Ketvarr roars and his stone scales crack! “The poles… you stood on the poles, where my phase can do nothing!”', 'Well done. Rotations about z change only the phase — at the poles |0⟩, |1⟩ they are harmless.'],
      ['The fog parts. “My fog… you did not linger on the equator!”', 'Exactly. Decoherence destroys coherences — the arrow on the equator. A quick pulse and a measurement beat it.'],
      ['Ketvarr falls into the snow. “You aimed at my heart… even though it moved.”', 'This is quantum control in miniature: predict the evolution and tune the pulse so that the outcome has a high probability.'],
    ][k], [
      ['Кетварр реве, і його кам’яна луска тріскається! «Полюси… ти стояв(-ла) на полюсах, де моя фаза безсила!»', 'Молодець. Повороти навколо z змінюють лише фазу — на полюсах |0⟩, |1⟩ вони нешкідливі.'],
      ['Туман розступається. «Мій туман… ти не затримався(-лася) на екваторі!»', 'Саме так. Декогеренція руйнує когерентності — стрілку на екваторі. Швидкий імпульс і вимірювання її переможуть.'],
      ['Кетварр падає в сніг. «Ти цілився(-лася) в моє серце… хоч воно й рухалося».', 'Це квантове керування в мініатюрі: передбач еволюцію й налаштуй імпульс так, щоб результат мав високу ймовірність.'],
    ][k]);
    this.say([{ who: tr('Ketvarr', 'Ketvarr', 'Кетварр'), face: '🐉', text: msg[0] }, msg[1]], () => this.next());
  }

  defeated() {
    UI.panelHide(); this.mistakes += 2;
    this.say([{ who: tr('Ketvarr', 'Ketvarr', 'Кетварр'), face: '🐉', text: tr('„Popol k popolu, amplitúda k nule!“', '“Ashes to ashes, amplitude to zero!”', '«Попіл до попелу, амплітуда до нуля!»') },
      tr('Oheň ťa premohol. Nevadí — kolo začína odznova. Tip: pozri sa na čísla na tlačidlách a ohlásený ťah draka skôr, než vykríkneš.',
        'The fire overwhelmed you. No matter — the round starts over. Tip: look at the numbers on the buttons and the dragon’s announced move before you shout.', 'Вогонь тебе здолав. Не біда — раунд починається знову. Порада: перш ніж вигукувати, поглянь на числа на кнопках і на оголошений хід дракона.')],
    () => this.startPhase(this.phase));
  }

  finale() {
    UI.panelHide();
    this.quest(tr('Posledná skúška slov moci', 'The last test of the Words of Power', 'Останнє випробування слів сили'), { easy: tr('📝 Skúška', '📝 Exam', '📝 Іспит'), hard: tr('3 otázky o súboji', '3 questions about the battle', '3 питання про битву') });
    this.say([tr('Ketvarr je porazený. Ešte tri otázky — chcem vedieť, či rozumieš, <b>prečo</b> si vyhral.', 'Ketvarr is defeated. Three more questions — I want to know whether you understand <b>why</b> you won.', 'Кетварра переможено. Ще три питання — хочу знати, чи розумієш ти, <b>чому</b> переміг(-ла).')], () => {
      UI.quizSeries([...DRAGON_TRAPS, ...ancientTraps(this.num)].map((q) => ({ who: this.mentor, face: this.face, ...q })), (m) => {
        this.mistakes += m;
        const k = this.mistakes, stars = byDiff(k <= 2 ? 3 : k <= 5 ? 2 : 1, k <= 1 ? 3 : k <= 3 ? 2 : 1, k === 0 ? 3 : k <= 2 ? 2 : 1);
        Game.completeLevel(this.num, stars);
        const rating = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        this.say([
          { who: tr('Ketvarr', 'Ketvarr', 'Кетварр'), face: '🐉', text: tr('„Dobre teda, malý stav. Nikto ma ešte nezmeral tak presne. Odletím na severný štít a budem strážiť ostrov — pred zlými prirovnaniami.“',
            '“Very well, little state. Nobody has ever measured me so precisely. I will fly to the northern peak and guard the island — against bad analogies.”', '«Гаразд, маленький стане. Ніхто ще не вимірював мене так точно. Я полечу на північну вершину й охоронятиму острів — від поганих аналогій».') },
          tr(`🏆 <b>Hilbertov ostrov je zachránený!</b> Hodnotenie súboja: <b>${rating}</b> (chyby: ${this.mistakes}).<br>Zapamätaj si: amplitúdy interferujú, pravdepodobnosti sa merajú, a drak je v stave — nie „na dvoch miestach naraz“.`,
            `🏆 <b>Hilbert Island is saved!</b> Battle rating: <b>${rating}</b> (mistakes: ${this.mistakes}).<br>Remember: amplitudes interfere, probabilities are measured, and the dragon is in a state — not “in two places at once”.`, `🏆 <b>Острів Гільберта врятовано!</b> Оцінка битви: <b>${rating}</b> (помилок: ${this.mistakes}).<br>Пам’ятай: амплітуди інтерферують, імовірності вимірюються, а дракон перебуває в стані — а не «у двох місцях водночас».`),
        ], () => Game.backToHub());
      });
    });
  }

  // ---------- animácia ----------
  // a: { axis, ang } = rotácia štítu, alebo { to, n } = presun (kolaps, hmla, presun srdca)
  animate(a, done, dur = 0.65) { this.anim = { ...a, r0: this.r, n0: this.n, t: 0, dur, done }; }
  animR() {
    const a = this.anim;
    if (!a) return this.r;
    if (a.axis) return V3.rotate(a.r0, a.axis, a.ang * a.t);
    if (!a.to) return a.r0;
    const v = V3.lerp(a.r0, a.to, a.t);
    return a.slerp && V3.len(v) > 1e-3 ? V3.norm(v) : v; // prekovanie ide po povrchu gule
  }
  animN() { const a = this.anim; return a && a.n ? V3.norm(V3.lerp(a.n0, a.n, a.t)) : this.n; }

  viewState() {
    return { r: this.animR(), note: tr('Štít draka ako qubit. Úder meria pozdĺž zlatej osi n.', 'The dragon’s ward as a qubit. A strike measures along the golden axis n.', 'Захист дракона як кубіт. Удар вимірює вздовж золотої осі n.') };
  }

  update(dt) {
    this.t += dt;
    if (this.anim) {
      const a = this.anim;
      a.t = Math.min(1, a.t + dt / a.dur);
      if (a.t >= 1) {
        this.r = a.axis ? V3.rotate(a.r0, a.axis, a.ang) : (a.to || a.r0);
        if (a.n) this.n = V3.norm(a.n);
        this.anim = null;
        a.done && a.done();
      }
    }
    for (const f of this.fx) f.t += dt;
    this.fx = this.fx.filter((f) => f.t < 0.9);
    if (this.shout) { this.shout.t += dt; if (this.shout.t > 1.2) this.shout = null; }
  }

  draw(r) {
    const t = r.time;
    r.begin(this.cam.eye(), this.cam.target);
    // horský štít: sneh, kamenný kruh, hory v pozadí
    r.draw('disk', M4.trs([0, -0.02, 0], 0, 34), [0.36, 0.36, 0.3], { pattern: 3 });
    r.draw('cylinder', M4.trs([0, -6.08, 0], 0, [34, 6, 34]), [0.4, 0.39, 0.38], { pattern: 4 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, p = [Math.cos(a) * 13, 0, Math.sin(a) * 13 - 2];
      if (Math.abs(Math.cos(a) * 13) < 3 && Math.sin(a) > 0) continue; // vstup pre hráča
      r.draw('box', M4.trs(V3.add(p, [0, 2 + (i % 3) * 0.5, 0]), -a, [1.2, 4 + (i % 3), 1.0]), [0.45, 0.44, 0.42], { pattern: 4 });
    }
    for (const [x, z, s, h] of [[-40, -55, 22, 34], [10, -70, 28, 46], [48, -48, 20, 30], [-62, -20, 18, 24], [66, -10, 16, 22]]) {
      r.draw('cone', M4.trs([x, -6, z], 0, [s, h, s]), [0.4, 0.4, 0.42], { pattern: 4 });
    }
    // drak: dva priesvitné obrazy výsledkov merania (zasiahnuteľný na zemi, unikajúci vo vzduchu)
    const rv = this.animR(), nv = this.animN(), p = this.hitP(rv, nv), P = this.ph || DRAGON_PHASES[0];
    const fire = this.fx.find((f) => f.kind === 'fire'), slash = this.fx.find((f) => f.kind === 'slash');
    const air = [Math.sin(t * 0.5) * 5, 9 + Math.sin(t * 0.9), -9 + Math.cos(t * 0.5) * 2];
    const ground = [0, 2.3, -4];
    if (this.phase >= 0 || this.stepIdx === 0) {
      Dragon.draw(r, ground, Math.PI * 0 + Math.sin(t * 0.4) * 0.15, { col: P.col, eye: P.eye, alpha: 0.12 + 0.88 * p, landed: true, breath: fire ? 1 : 0, scale: 1.5, t });
      Dragon.draw(r, air, Math.cos(t * 0.5) * 0.6, { col: P.col, eye: P.eye, alpha: 0.12 + 0.88 * (1 - p), scale: 0.9, bank: Math.sin(t * 0.5) * 0.3, t });
      UI.label('dground', V3.add(ground, [0, 5, 0]), `${tr('zasiahnuteľný', 'hittable', 'вразливий')} · P = ${Fmt.pct(p)}`, 'portal',
        tr('Výsledok merania „zásah“: drak na zemi. Nepriehľadnosť = pravdepodobnosť tohto výsledku.', 'The measurement outcome “hit”: the dragon on the ground. Opacity = the probability of this outcome.', 'Результат вимірювання «влучання»: дракон на землі. Непрозорість = імовірність цього результату.'));
      UI.label('dair', V3.add(air, [0, 2.8, 0]), `${tr('uniká', 'escapes', 'утікає')} · ${Fmt.pct(1 - p)}`, 'portal',
        tr('Výsledok „vedľa“: drak vo vzduchu. Nie je to druhý drak — je to druhý možný výsledok.', 'The outcome “miss”: the dragon in the air. It is not a second dragon — it is the second possible outcome.', 'Результат «промах»: дракон у повітрі. Це не другий дракон — це другий можливий результат.'));
    }
    // štít = Blochova guľa
    const wc = [-8, 3.4, 1];
    Bloch.draw(r, wc, 1.7, rv, { target: nv, labelFn: UI.label.bind(UI), key: 'w', labels: true, bars: false, detail: false, glass: [0.75, 0.7, 0.55] });
    UI.label('wtitle', V3.add(wc, [0, 2.6, 0]), `🛡 ${tr('Štít Ketvarra', 'Ketvarr’s ward', 'Захист Кетварра')}${V3.len(rv) < 0.97 ? ` · |r| = ${Fmt.num(V3.len(rv), 2)}` : ''}`, 'npc');
    UI.label('wn', V3.add(wc, V3.scale(qToWorld(nv), 2.1)), 'n', 'prompt', tr('Zraniteľné miesto n: úder meria pozdĺž tejto osi.', 'The weak spot n: a strike measures along this axis.', 'Вразливе місце n: удар вимірює вздовж цієї осі.'));
    // hráč
    let pc = [0, 1 + Math.sin(t * 3) * 0.08, 6];
    if (Settings.wow) { // MMO: kvantový mág s palicou (výstroj z ostrova)
      const it = (sl) => Wow.item(Wow.S.equip[sl]) || {};
      Wow.humanoid(r, [0, 0, 6], Math.PI, { robe: it('chest').robe || [0.18, 0.52, 0.86], trim: [0.95, 0.78, 0.32], hat: it('head').hat || 'wizard', hatCol: it('head').hat ? null : [0.2, 0.3, 0.75], staff: true, orb: it('weapon').orb || [0.4, 0.95, 1], swing: !!this.shout });
      pc = [0, 1.5, 6];
    } else {
    r.sphere(pc, 0.45, [0.3, 0.95, 1], { emissive: 0.8 });
    r.sphere(pc, 0.65, [0.4, 0.8, 1], { alpha: 0.18 });
    r.rod(V3.add(pc, [0.5, -0.2, 0]), V3.add(pc, [0.9, 1.4, -0.4]), [0.85, 0.85, 0.9], 0.05, { emissive: 0.3 }); // meč
    }
    UI.label('player', V3.add(pc, [0, 1, 0]), 'ψ', 'player');
    if (this.shout) UI.label('shout', V3.add(pc, [0, 2 + this.shout.t, 0]), `${this.shout.word}!`, 'shoutlbl');
    // efekty: oheň a sek čepeľou
    if (fire) {
      const head = V3.add(ground, [0, 2, 4.6]);
      for (let k = 0; k < 9; k++) {
        const u = (k / 9 + fire.t * 1.4) % 1, q = V3.lerp(head, pc, u);
        r.sphere(V3.add(q, [Math.sin(k * 7 + t * 9) * 0.3 * u, Math.cos(k * 5 + t * 7) * 0.3 * u, 0]), 0.25 + 0.6 * u, [1, 0.35 + 0.45 * (1 - u), 0.08 + 0.2 * (1 - u)], { unlit: 1, alpha: 0.85 * (1 - fire.t) });
      }
    }
    if (slash) {
      const c = V3.add(ground, [0, 1, 1.5]), a = slash.t * 6;
      r.rod(V3.add(c, [-2 * Math.cos(a), 2 * Math.sin(a), 0]), V3.add(c, [2 * Math.cos(a), -2 * Math.sin(a), 0]), slash.hit ? [1, 0.95, 0.7] : [0.6, 0.7, 0.9], 0.08, { emissive: 1.5, alpha: 1 - slash.t });
    }
    Snow.draw(r, [0, 0, 0], 22);
  }
}

// náhodný prvok poľa
function pick2(arr) { return arr[Math.floor(rand() * arr.length)]; }

// sneženie okolo bodu c (lacné: malé nesvietiace guľky)
const Snow = {
  flakes: null,
  draw(r, c, R) {
    if (!this.flakes) this.flakes = Array.from({ length: 140 }, (_, i) => [((i * 97) % 100) / 100, ((i * 57) % 100) / 100, ((i * 31) % 100) / 100, 0.6 + ((i * 13) % 10) / 25]);
    const t = r.time;
    for (const [a, b, h, sp] of this.flakes) {
      const y = 18 - ((h * 18 + t * sp * 1.6) % 18);
      const p = [c[0] + (a - 0.5) * 2 * R + Math.sin(t * 0.7 + h * 9) * 0.6, c[1] + y, c[2] + (b - 0.5) * 2 * R];
      if (V3.len(V3.sub(p, r.cam)) > 4) r.draw('lowSphere', M4.trs(p, 0, 0.06), [0.95, 0.97, 1], { unlit: 1, alpha: 0.85 });
    }
  },
};
