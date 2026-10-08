'use strict';
// LEVEL 8 — Sieň výkladov (mentor: Niels Bohr) — jazyk, meranie a realita podľa prednášok.

const PHILOSOPHERS = [
  { id: 'kant', name: 'Immanuel Kant', face: '📜', col: [0.8, 0.7, 0.5],
    lines: ['Moja <i>Kritika čistého rozumu</i> hovorí: „Podmienky možnosti skúsenosti sú zároveň podmienkami možnosti predmetov skúsenosti.“',
      'Vaša kvantová mechanika to radikalizuje: <b>kvantový stav reprezentuje podmienky možnosti výsledku</b>, nie výsledok samotný.'],
    q: { q: 'Čo podľa prednášky reprezentuje kvantový stav?', options: ['podmienky možnosti výsledku (štruktúru možných odpovedí)', 'skrytý zoznam hodnôt všetkých veličín', 'vedomie pozorovateľa'], correct: 0, why: 'Stav je pravidlo pre predpovede, nie zoznam klasických vlastností.' } },
  { id: 'wittg', name: 'Ludwig Wittgenstein', face: '🗣', col: [0.6, 0.6, 0.8],
    lines: ['„Hranice môjho jazyka znamenajú hranice môjho sveta.“ A neskôr: „Význam slova je jeho použitie v jazyku.“',
      'Výrazy „spin hore“ či „meranie v osi z“ sú pravidlá <b>gramatiky</b> fyzikálnych výpovedí. Mimochodom — pôvodne som študoval inžinierstvo, lietadlá.'],
    q: { q: 'Hovoriť o „hodnote spinu bez merania“ je podľa prednášky…', options: ['porušenie gramatiky kvantovej teórie', 'hlbší ontologický opis', 'zakázané zákonom'], correct: 0, why: 'Hodnota spinu má význam len v kontexte meracej procedúry.' } },
  { id: 'stodola', name: 'Aurel Stodola', face: '⚙️', col: [0.5, 0.75, 0.6],
    lines: ['Dobrý deň, rodák z Liptovského Mikuláša, profesor na ETH v Zürichu — parné a plynové turbíny.',
      'Teórie hodnotím podľa toho, či vedia <b>spoľahlivo konštruovať</b> vzťahy medzi príčinami a dôsledkami. Kvantová mechanika je funkčný konštrukčný rámec, nie „obraz mikrosveta, aký je“.'],
    q: { q: 'Kolaps v kvantovom inžinierstve je…', options: ['fyzický proces readoutu: zosilnenie, prepojenie s makrosvetom, zápis do registra', 'metafyzický skok bez príčiny', 'dôsledok toho, že sa na qubit pozrie človek'], correct: 0, why: 'Je ireverzibilný a disipatívny — inžinierska operácia, nie dodatočný axióm.' } },
  { id: 'bohm', name: 'David Bohm', face: '🌊', col: [0.4, 0.6, 0.9],
    lines: ['Ja tvrdím, že častica má <b>vždy presnú polohu</b> a vedie ju <b>pilotná vlna</b>. Vlnová funkcia nikdy nekolabuje. Výsledok merania je odhalený, nie vytvorený.',
      'Platím za to vysokú cenu: moja teória musí byť <b>nelokálna</b>.'],
    q: { q: 'Akú cenu platí Bohmova mechanika za determinizmus?', options: ['nelokálnosť', 'porušenie zákona zachovania energie', 'nesúhlas s experimentom'], correct: 0, why: 'Bellove nerovnosti vylučujú LOKÁLNE skryté premenné; Bohmove sú nelokálne.' } },
  { id: 'heis', name: 'Werner Heisenberg', face: '🎼', col: [0.85, 0.55, 0.45],
    lines: ['Na ostrove Helgoland som roku 1925 našiel maticovú mechaniku. V knihe <i>Physics and Philosophy</i> píšem: nepozorujeme prírodu samu osebe, ale prírodu vystavenú <b>nášmu spôsobu kladenia otázok</b>.',
      'A o neurčitosti: Δx · Δp ≥ ħ/2.'],
    q: { q: 'Čo vyjadruje Δx · Δp ≥ ħ/2?', options: ['vlastnosť stavu: polohu a hybnosť nemožno mať zároveň ostro určené', 'iba nepresnosť meracieho prístroja', 'Δ = zmena polohy za čas'], correct: 0, why: 'Δ tu znamená smerodajnú odchýlku (neurčitosť) výsledkov na rovnako pripravených systémoch.' } },
  { id: 'noether', name: 'Emmy Noether', face: '♾', col: [0.75, 0.5, 0.85],
    lines: ['Moja veta: ku každej spojitej symetrii patrí zákon zachovania. Čas → energia, rotácia → moment hybnosti.',
      'Prednáška hovorí: <b>pred meraním existuje spin ako symetria</b> — štruktúra možností; <b>po meraní ako fakt</b>. Symetria hovorí, čo sa <i>môže</i> stať, nie čo sa stane.'],
    q: { q: 'Pred meraním existuje spin podľa prednášky ako…', options: ['symetria — štruktúra možných odpovedí', 'konkrétna šípka hore alebo dole', 'nič, spin vôbec neexistuje'], correct: 0, why: 'Hodnota vzniká až v konkrétnom experimentálnom rámci.' } },
];
const PHILOSOPHERS_EN = {
  kant: {
    lines: ['My <i>Critique of Pure Reason</i> says: “The conditions of the possibility of experience are at the same time conditions of the possibility of the objects of experience.”',
      'Your quantum mechanics radicalises this: <b>the quantum state represents the conditions of possibility of an outcome</b>, not the outcome itself.'],
    q: { q: 'According to the lecture, what does a quantum state represent?', options: ['the conditions of possibility of an outcome (the structure of possible answers)', 'a hidden list of the values of all quantities', 'the observer’s consciousness'], correct: 0, why: 'A state is a rule for predictions, not a list of classical properties.' } },
  wittg: {
    lines: ['“The limits of my language mean the limits of my world.” And later: “The meaning of a word is its use in the language.”',
      'Phrases like “spin up” or “measurement along the z axis” are rules of the <b>grammar</b> of physical statements. By the way — I originally studied engineering, aeroplanes.'],
    q: { q: 'According to the lecture, talking about “the value of the spin without a measurement” is…', options: ['a violation of the grammar of quantum theory', 'a deeper ontological description', 'forbidden by law'], correct: 0, why: 'The value of a spin has meaning only in the context of a measurement procedure.' } },
  stodola: {
    lines: ['Good day — I was born in Liptovský Mikuláš and became a professor at ETH Zürich: steam and gas turbines.',
      'I judge theories by whether they can <b>reliably construct</b> relations between causes and effects. Quantum mechanics is a working design framework, not “a picture of the microworld as it is”.'],
    q: { q: 'In quantum engineering, collapse is…', options: ['the physical readout process: amplification, coupling to the macroworld, writing to a register', 'a metaphysical jump without a cause', 'a consequence of a human looking at the qubit'], correct: 0, why: 'It is irreversible and dissipative — an engineering operation, not an extra axiom.' } },
  bohm: {
    lines: ['I claim that a particle <b>always has a precise position</b> and is guided by a <b>pilot wave</b>. The wave function never collapses. A measurement outcome is revealed, not created.',
      'I pay a high price for it: my theory has to be <b>non-local</b>.'],
    q: { q: 'What price does Bohmian mechanics pay for determinism?', options: ['non-locality', 'violation of energy conservation', 'disagreement with experiment'], correct: 0, why: 'Bell’s inequalities rule out LOCAL hidden variables; Bohm’s are non-local.' } },
  heis: {
    lines: ['On the island of Helgoland in 1925 I found matrix mechanics. In <i>Physics and Philosophy</i> I write: we do not observe nature in itself, but nature exposed to <b>our method of questioning</b>.',
      'And about uncertainty: Δx · Δp ≥ ħ/2.'],
    q: { q: 'What does Δx · Δp ≥ ħ/2 express?', options: ['a property of the state: position and momentum cannot both be sharply defined', 'only the imprecision of the measuring device', 'Δ = change of position over time'], correct: 0, why: 'Δ here means the standard deviation (uncertainty) of outcomes on identically prepared systems.' } },
  noether: {
    lines: ['My theorem: every continuous symmetry has a conservation law. Time → energy, rotation → angular momentum.',
      'The lecture says: <b>before a measurement the spin exists as a symmetry</b> — a structure of possibilities; <b>after the measurement, as a fact</b>. Symmetry tells you what <i>can</i> happen, not what will happen.'],
    q: { q: 'According to the lecture, before a measurement the spin exists as…', options: ['a symmetry — a structure of possible answers', 'a definite arrow up or down', 'nothing, spin does not exist at all'], correct: 0, why: 'The value arises only within a concrete experimental framework.' } },
};
if (LANG === 'en') for (const p of PHILOSOPHERS) Object.assign(p, PHILOSOPHERS_EN[p.id]);

class L8Philo extends Level {
  get steps() { return [this.intro, this.statues, this.sorting]; }

  setup() {
    this.cam = new OrbitCam([0, 1.5, 0], 7.5, 0.2, 0.55, 4, 9);
    this.talked = new Set(); this.active = null;
  }

  intro() {
    this.quest(tr('Vypočuj si Bohra', 'Listen to Bohr'), { easy: '💬 Bohr', hard: tr('Bohr: komplementarita', 'Bohr: complementarity') });
    this.say(tr([
      'Velkommen! Som Niels Bohr. Na mojom erbe je jin-jang a nápis <i>Contraria sunt complementa</i> — protiklady sa dopĺňajú.',
      'Fyzik musí vedieť počítať. Ale musí vedieť aj <b>hovoriť</b> — a nehovoriť nezmysly. V tejto sieni stoja myslitelia, ktorých spomínajú vaše prednášky.',
      '<b>Komplementarita</b>: kvantový objekt nemožno opísať jedným klasickým obrazom. Vlna aj častica sú presné opisy, každý v rámci svojho experimentálneho usporiadania. Nie je to relativizmus!',
      'Porozprávaj sa so všetkými šiestimi. Každý ti položí otázku.',
    ], [
      'Velkommen! I am Niels Bohr. My coat of arms bears the yin-yang and the motto <i>Contraria sunt complementa</i> — opposites are complementary.',
      'A physicist must be able to calculate. But he must also be able to <b>speak</b> — and not speak nonsense. In this hall stand the thinkers your lectures mention.',
      '<b>Complementarity</b>: a quantum object cannot be described by a single classical picture. Wave and particle are both precise descriptions, each within its own experimental arrangement. This is not relativism!',
      'Talk to all six of them. Each will ask you a question.',
    ]), () => this.next());
  }

  statues() {
    this.talked = new Set(this.sub.talked || []);
    this.quest(tr('Porozprávaj sa so všetkými 6 mysliteľmi (tlačidlá vpravo).', 'Talk to all 6 thinkers (buttons on the right).'), { easy: tr('🗣 6 mysliteľov', '🗣 6 thinkers'), hard: 'Kant · Wittgenstein · Stodola · Bohm · Heisenberg · Noether' });
    this.buildPanel();
  }
  buildPanel() {
    UI.panelSet(tr('Sieň výkladov', 'Hall of Interpretations'), [
      ...PHILOSOPHERS.map((p) => UI.button(`${this.talked.has(p.id) ? '✅' : p.face} ${p.name}`, () => this.talk(p))),
      UI.info(`${tr('Hotovo', 'Done')}: ${this.talked.size} / ${PHILOSOPHERS.length}`),
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
    this.quest(tr('Záverečná úloha Bohra: tri roviny otázok a štyri otázky ku každému pojmu', 'Bohr’s final task: three levels of questions and four questions for every concept'), { easy: tr('🗂 zatrieď otázky', '🗂 sort the questions'), hard: tr('ontológia / epistemológia / fenomenológia · 4 otázky', 'ontology / epistemology / phenomenology · 4 questions') });
    this.say(tr([
      'Výborne. Prednáška ťa varuje: nezamieňaj <b>tri otázky</b> — <b>ontológia</b> (Čo existuje?), <b>epistemológia</b> (Čo o tom môžeme vedieť?), <b>fenomenológia</b> (Ako sa nám jav ukazuje?).',
      'Zatrieď nasledujúce vety.',
    ], [
      'Excellent. The lecture warns you: don’t mix up <b>three questions</b> — <b>ontology</b> (What exists?), <b>epistemology</b> (What can we know about it?), <b>phenomenology</b> (How does the phenomenon appear to us?).',
      'Classify the following sentences.',
    ]), () => UI.quizSeries(tr([
      { who: 'Niels Bohr', face: '☯', q: '„Je vlnová funkcia ψ fyzikálna realita, alebo len nástroj predikcie?“ — Aká je to otázka?', options: ['ontologická', 'epistemologická', 'fenomenologická'], correct: 0, why: 'Pýta sa, čo existuje. Schrödingerova rovnica ani experimenty tento spor samy neuzatvárajú.' },
      { who: 'Niels Bohr', face: '☯', q: '„Čo o polohe a hybnosti elektrónu môžeme zároveň vedieť?“', options: ['epistemologická', 'ontologická', 'fenomenologická'], correct: 0, why: 'Otázka o hraniciach poznania.' },
      { who: 'Niels Bohr', face: '☯', q: '„Ako sa nám spin ukazuje v Sternovom–Gerlachovom pokuse — dve stopy na tienidle?“', options: ['fenomenologická', 'ontologická', 'epistemologická'], correct: 0, why: 'Otázka o tom, ako sa jav ukazuje v skúsenosti/experimente.' },
      { who: 'Niels Bohr', face: '☯', q: 'Ktorá z týchto NIE JE jedna zo „štyroch otázok“, ktoré si treba klásť pri každom novom kvantovom pojme?', options: ['Ktorý pozorovateľ má pravdu?', 'Aký systém sme pripravili?', 'Akým experimentom sa vlastnosti prejavia?', 'Čo z tohto opisu ešte nevyplýva?'], correct: 0, why: 'Štyri otázky: systém, rovnica a predpoklady, experiment, a čo z opisu (ne)vyplýva.' },
    ], [
      { who: 'Niels Bohr', face: '☯', q: '“Is the wave function ψ physical reality, or just a tool for prediction?” — What kind of question is this?', options: ['ontological', 'epistemological', 'phenomenological'], correct: 0, why: 'It asks what exists. Neither the Schrödinger equation nor experiments settle this dispute by themselves.' },
      { who: 'Niels Bohr', face: '☯', q: '“What can we know at the same time about the position and momentum of an electron?”', options: ['epistemological', 'ontological', 'phenomenological'], correct: 0, why: 'A question about the limits of knowledge.' },
      { who: 'Niels Bohr', face: '☯', q: '“How does spin appear to us in the Stern–Gerlach experiment — two spots on the screen?”', options: ['phenomenological', 'ontological', 'epistemological'], correct: 0, why: 'A question about how a phenomenon appears in experience/experiment.' },
      { who: 'Niels Bohr', face: '☯', q: 'Which of these is NOT one of the “four questions” to ask about every new quantum concept?', options: ['Which observer is right?', 'What system have we prepared?', 'In what experiment do the properties show up?', 'What does this description still NOT imply?'], correct: 0, why: 'The four questions: the system, the equation and assumptions, the experiment, and what does (not) follow from the description.' },
    ]), (m) => {
      this.mistakes += m;
      this.grant(['bohr', 'collapse', 'onto', 'four']);
      this.say([tr('„Nie je potrebné prestať svet počítať. Je potrebné nezabudnúť, čo je to za svet, ktorý počítame.“ — tak končí prednáška o jazyku kvantovej mechaniky.', '“There is no need to stop calculating the world. What we must not forget is what kind of world it is that we are calculating.” — so ends the lecture on the language of quantum mechanics.')], () => this.next());
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
    UI.label('bohr', [0, 3.9, 0], '☯ Niels Bohr', 'npc', CODEX.find((c) => c.id === 'bohr').text);
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
