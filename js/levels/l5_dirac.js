'use strict';
// LEVEL 5 — Diracova knižnica (mentor: Paul Dirac)
// Gramatika bra-ket notácie: skladanie výrazov a určovanie ich typu (stav, číslo, operátor, pravdepodobnosť).

// typ = tvar matice [riadky, stĺpce]: 'V' = vektorový priestor, '1' = jedno číslo
const DIRAC_TOKENS = [
  { t: '|ψ⟩', k: 'ket' }, { t: '|φ⟩', k: 'ket' }, { t: '|a⟩', k: 'ket' },
  { t: '⟨ψ|', k: 'bra' }, { t: '⟨φ|', k: 'bra' }, { t: '⟨a|', k: 'bra' },
  { t: 'Â', k: 'op' }, { t: 'Ĥ', k: 'op' }, { t: '⊗', k: 'tensor' },
];
const SHAPE = { ket: ['V', '1'], bra: ['1', 'V'], op: ['V', 'V'] };
const TYPE_NAME = tr({
  num: 'komplexné číslo (amplitúda)', ket: 'stav — ket (stĺpcový vektor)', bra: 'duálny stav — bra (riadkový vektor)',
  op: 'operátor (matica)', prob: 'pravdepodobnosť (reálne číslo 0 až 1)', ket2: 'zložený stav dvoch systémov',
}, {
  num: 'complex number (amplitude)', ket: 'state — ket (column vector)', bra: 'dual state — bra (row vector)',
  op: 'operator (matrix)', prob: 'probability (real number from 0 to 1)', ket2: 'composite state of two systems',
}, {
  num: 'комплексне число (амплітуда)', ket: 'стан — кет (вектор-стовпець)', bra: 'дуальний стан — бра (вектор-рядок)',
  op: 'оператор (матриця)', prob: 'імовірність (дійсне число від 0 до 1)', ket2: 'складений стан двох систем',
});

function diracType(tokens, squared) {
  if (!tokens.length) return { type: null, why: tr('Prázdny výraz.', 'Empty expression.', 'Порожній вираз.') };
  let acc = null, tensorNext = false;
  for (let i = 0; i < tokens.length; i++) {
    const k = tokens[i].k;
    if (k === 'tensor') {
      if (!acc || acc.kind !== 'ket' || i === tokens.length - 1) return { type: 'bad', why: tr('⊗ spája dva <b>kety</b>: |ψ⟩ ⊗ |φ⟩.', '⊗ joins two <b>kets</b>: |ψ⟩ ⊗ |φ⟩.', '⊗ поєднує два <b>кети</b>: |ψ⟩ ⊗ |φ⟩.') };
      tensorNext = true; continue;
    }
    const s = SHAPE[k];
    if (tensorNext) {
      if (k !== 'ket') return { type: 'bad', why: tr('Za ⊗ musí nasledovať ket.', '⊗ must be followed by a ket.', 'Після ⊗ має йти кет.') };
      acc = { kind: 'ket', shape: ['V', '1'], composite: true }; tensorNext = false; continue;
    }
    if (!acc) { acc = { kind: k, shape: s.slice() }; continue; }
    if (acc.kind === 'num') { acc = { kind: k, shape: s.slice() }; continue; } // číslo × čokoľvek = násobenie skalárom
    const shape = acc.shape;
    if (shape[1] !== s[0]) {
      if (shape[0] === 'V' && shape[1] === '1' && k === 'ket') return { type: 'bad', why: tr('Ket vedľa ketu bez ⊗ nedáva zmysel. Na zložený systém použi tenzorový súčin <b>⊗</b>.', 'A ket next to a ket without ⊗ makes no sense. For a composite system use the tensor product <b>⊗</b>.', 'Кет поруч із кетом без ⊗ не має сенсу. Для складеної системи використовуй тензорний добуток <b>⊗</b>.') };
      if (k === 'bra' && shape[1] === 'V') return { type: 'bad', why: tr('Bra nemôže stáť napravo od operátora či bra — „otázku“ (bra) kladieme zľava.', 'A bra cannot stand to the right of an operator or a bra — the “question” (bra) is asked from the left.', 'Бра не може стояти праворуч від оператора чи бра — «питання» (бра) ставиться зліва.') };
      return { type: 'bad', why: tr('Rozmery nesedia: stĺpec × stĺpec alebo riadok vpravo od operátora sa nedá násobiť.', 'The dimensions don’t match: column × column, or a row to the right of an operator, cannot be multiplied.', 'Розмірності не збігаються: стовпець × стовпець або рядок праворуч від оператора перемножити не можна.') };
    }
    const ns = [shape[0], s[1]];
    acc = { kind: ns[0] === '1' && ns[1] === '1' ? 'num' : ns[0] === 'V' && ns[1] === '1' ? 'ket' : ns[0] === '1' ? 'bra' : 'op', shape: ns, composite: acc.composite };
  }
  if (tensorNext) return { type: 'bad', why: tr('Výraz nemôže končiť znakom ⊗.', 'An expression cannot end with ⊗.', 'Вираз не може закінчуватися на ⊗.') };
  let type = acc.kind === 'ket' && acc.composite ? 'ket2' : acc.kind;
  if (squared) {
    if (type !== 'num') return { type: 'bad', why: tr('|…|² má zmysel len pre <b>číslo</b> (amplitúdu). Z ketu či operátora pravdepodobnosť nevznikne.', '|…|² only makes sense for a <b>number</b> (an amplitude). A ket or an operator does not give a probability.', '|…|² має сенс лише для <b>числа</b> (амплітуди). Кет чи оператор імовірності не дає.') };
    type = 'prob';
  }
  return { type };
}

const DIRAC_TASKS = [
  { title: tr('AMPLITÚDU, že stav ψ „nájdeme“ ako stav a', 'the AMPLITUDE that the state ψ is “found” as the state a', 'АМПЛІТУДУ того, що стан ψ «буде знайдено» як стан a'), want: 'num', exact: ['⟨a|', '|ψ⟩'], sq: false, grant: ['dirac', 'ket', 'bra', 'braket'],
    msg: tr('⟨a|ψ⟩ — bra „kladie otázku“ (je to stav a?), ket je odpoveďou. Spolu dajú <b>číslo</b>: amplitúdu. Ako bra-ket = „bracket“ (zátvorka).', '⟨a|ψ⟩ — the bra “asks the question” (is it state a?), the ket is the answer. Together they give a <b>number</b>: the amplitude. Bra-ket = “bracket”.', '⟨a|ψ⟩ — бра «ставить питання» (чи це стан a?), кет — відповідь. Разом вони дають <b>число</b>: амплітуду. Бра-кет = «bracket», дужка.') },
  { title: tr('PRAVDEPODOBNOSŤ výsledku a pri meraní stavu ψ', 'the PROBABILITY of outcome a when measuring the state ψ', 'ІМОВІРНІСТЬ результату a під час вимірювання стану ψ'), want: 'prob', exact: ['⟨a|', '|ψ⟩'], sq: true, grant: [],
    msg: tr('|⟨a|ψ⟩|² — Bornovo pravidlo. Amplitúda je teória, pravdepodobnosť je experiment.', '|⟨a|ψ⟩|² — the Born rule. The amplitude is theory, the probability is experiment.', '|⟨a|ψ⟩|² — правило Борна. Амплітуда — це теорія, імовірність — експеримент.') },
  { title: tr('PROJEKTOR na stav ψ (= matica hustoty čistého stavu)', 'the PROJECTOR onto the state ψ (= density matrix of a pure state)', 'ПРОЄКТОР на стан ψ (= матриця густини чистого стану)'), want: 'op', exact: ['|ψ⟩', '⟨ψ|'], sq: false, grant: ['ketbra'],
    msg: tr('|ψ⟩⟨ψ| — stĺpec krát riadok = <b>matica</b>. Rovnaké symboly ako pri ⟨ψ|ψ⟩, opačné poradie, úplne iný objekt!', '|ψ⟩⟨ψ| — column times row = a <b>matrix</b>. The same symbols as in ⟨ψ|ψ⟩, the opposite order, a completely different object!', '|ψ⟩⟨ψ| — стовпець на рядок = <b>матриця</b>. Ті самі символи, що в ⟨ψ|ψ⟩, протилежний порядок — зовсім інший об’єкт!') },
  { title: tr('STREDNÚ HODNOTU veličiny Â v stave ψ', 'the EXPECTATION VALUE of the observable Â in the state ψ', 'СЕРЕДНЄ ЗНАЧЕННЯ спостережуваної Â у стані ψ'), want: 'num', exact: ['⟨ψ|', 'Â', '|ψ⟩'], sq: false, grant: ['hat', 'expect'],
    msg: tr('⟨ψ|Â|ψ⟩ — priemer mnohých meraní. Pozor: nemusí to byť hodnota, ktorú nameriaš v jednom pokuse!', '⟨ψ|Â|ψ⟩ — the average of many measurements. Careful: it need not be a value you can get in a single run!', '⟨ψ|Â|ψ⟩ — середнє багатьох вимірювань. Обережно: це не обов’язково значення, яке можна отримати за один раз!') },
  { title: tr('nový STAV, ktorý vznikne pôsobením Hamiltoniánu Ĥ na ψ', 'the new STATE obtained by applying the Hamiltonian Ĥ to ψ', 'новий СТАН, отриманий дією гамільтоніана Ĥ на ψ'), want: 'ket', exact: ['Ĥ', '|ψ⟩'], sq: false, grant: [],
    msg: tr('Ĥ|ψ⟩ — operátor „spracuje“ ket a vráti ket. Operátor pôsobí doprava na ket.', 'Ĥ|ψ⟩ — the operator “processes” a ket and returns a ket. An operator acts to the right, on a ket.', 'Ĥ|ψ⟩ — оператор «обробляє» кет і повертає кет. Оператор діє праворуч, на кет.') },
  { title: tr('MATICOVÝ ELEMENT operátora Â medzi φ (vľavo) a ψ (vpravo)', 'the MATRIX ELEMENT of the operator Â between φ (left) and ψ (right)', 'МАТРИЧНИЙ ЕЛЕМЕНТ оператора Â між φ (ліворуч) і ψ (праворуч)'), want: 'num', exact: ['⟨φ|', 'Â', '|ψ⟩'], sq: false, grant: [],
    msg: tr('⟨φ|Â|ψ⟩ — komplexné číslo, prvok matice. Číta sa sprava: Â pôsobí na ψ, výsledok sa premietne na φ.', '⟨φ|Â|ψ⟩ — a complex number, an element of the matrix. Read from the right: Â acts on ψ, the result is projected onto φ.', '⟨φ|Â|ψ⟩ — комплексне число, елемент матриці. Читай справа: Â діє на ψ, результат проєктується на φ.') },
  { title: tr('ZLOŽENÝ STAV dvoch systémov: ψ (systém A) a φ (systém B)', 'the COMPOSITE STATE of two systems: ψ (system A) and φ (system B)', 'СКЛАДЕНИЙ СТАН двох систем: ψ (система A) і φ (система B)'), want: 'ket2', exact: ['|ψ⟩', '⊗', '|φ⟩'], sq: false, grant: ['tensor', 'kron'],
    msg: tr('|ψ⟩ ⊗ |φ⟩ — tenzorový súčin. Pre dva qubity |0⟩ ⊗ |1⟩ = |01⟩. Dimenzie sa násobia: 2 × 2 = 4 amplitúdy.', '|ψ⟩ ⊗ |φ⟩ — the tensor product. For two qubits |0⟩ ⊗ |1⟩ = |01⟩. Dimensions multiply: 2 × 2 = 4 amplitudes.', '|ψ⟩ ⊗ |φ⟩ — тензорний добуток. Для двох кубітів |0⟩ ⊗ |1⟩ = |01⟩. Розмірності перемножуються: 2 × 2 = 4 амплітуди.') },
];

const LEGEND_TIPS = tr({
  ket: '<b>Šípka = ket</b> |ψ⟩: stav, stĺpcový vektor.', bra: '<b>Doska = bra</b> ⟨ψ|: duálny vektor, riadok, „otázka“.',
  op: '<b>Kocka = operátor</b>: stroj, ktorý mení kety na kety.', num: '<b>Minca = komplexné číslo</b>: amplitúda, skalárny súčin.',
  prob: '<b>Stĺpec = pravdepodobnosť</b>: reálne číslo 0–1, vzniká až z |amplitúda|².',
}, {
  ket: '<b>Arrow = ket</b> |ψ⟩: a state, a column vector.', bra: '<b>Plank = bra</b> ⟨ψ|: a dual vector, a row, a “question”.',
  op: '<b>Cube = operator</b>: a machine that turns kets into kets.', num: '<b>Coin = complex number</b>: an amplitude, an inner product.',
  prob: '<b>Bar = probability</b>: a real number 0–1, it arises only from |amplitude|².',
}, {
  ket: '<b>Стрілка = кет</b> |ψ⟩: стан, вектор-стовпець.', bra: '<b>Дошка = бра</b> ⟨ψ|: дуальний вектор, рядок, «питання».',
  op: '<b>Куб = оператор</b>: машина, що перетворює кети на кети.', num: '<b>Монета = комплексне число</b>: амплітуда, скалярний добуток.',
  prob: '<b>Стовпчик = імовірність</b>: дійсне число 0–1, виникає лише з |амплітуда|².',
});

class L5Dirac extends Level {
  get steps() { return [this.intro, this.tasks]; }

  setup() {
    this.cam = new OrbitCam([0, 2.1, 0], 8.5, 0, 0.5, 4, 15);
    this.tokens = []; this.squared = false; this.ti = 0; this.res = null; this.spin = 0;
  }

  intro() {
    this.quest(tr('Vypočuj si Diraca', 'Listen to Dirac', 'Послухай Дірака'), { easy: tr('💬 Dirac', '💬 Dirac', '💬 Дірак'), hard: tr('bra-ket: typy výrazov', 'bra-ket: expression types', 'бра-кет: типи виразів') });
    this.say(tr([
      'Dirac.',
      { who: 'Knihovníčka Ket', face: '📚', text: '(šepky) Pán profesor Dirac je povestne málovravný. Kolegovia vraj zaviedli jednotku <b>1 dirac = jedno slovo za hodinu</b>. Dovoľ, aby som tlmočila.' },
      { who: 'Knihovníčka Ket', face: '📚', text: 'Pán profesor vymyslel <b>bra-ket notáciu</b> — gramatiku kvantovej mechaniky. Každý výraz má <b>typ</b>, ako slovo v jazyku má slovný druh: <b>ket |ψ⟩</b> = stav (stĺpec), <b>bra ⟨ψ|</b> = otázka (riadok), <b>Â</b> = operátor (stroj).' },
      { who: 'Knihovníčka Ket', face: '📚', text: 'Prirovnanie: ket je <b>list</b>, bra je <b>obálka s adresou</b>. Keď list vložíš do obálky — ⟨a|ψ⟩ — dostaneš <b>číslo</b> (známku, amplitúdu). Keď ich položíš opačne |ψ⟩⟨a| — dostaneš <b>stroj</b> (operátor), ktorý z listov vyrába iné listy.' },
      { who: 'Knihovníčka Ket', face: '📚', text: 'Na stole (3D) uvidíš tvary: <b>šípka</b> = ket, <b>doska</b> = bra, <b>kocka</b> = operátor, <b>minca</b> = číslo, <b>stĺpec</b> = pravdepodobnosť. Skladaj tokeny a nauč sa, čo z čoho vznikne.' },
      'Správne.',
    ], [
      'Dirac.',
      { who: 'Librarian Ket', face: '📚', text: '(whispering) Professor Dirac is famously taciturn. His colleagues supposedly introduced the unit <b>1 dirac = one word per hour</b>. Allow me to interpret.' },
      { who: 'Librarian Ket', face: '📚', text: 'The professor invented the <b>bra-ket notation</b> — the grammar of quantum mechanics. Every expression has a <b>type</b>, just as a word in a language has a part of speech: <b>ket |ψ⟩</b> = state (column), <b>bra ⟨ψ|</b> = question (row), <b>Â</b> = operator (machine).' },
      { who: 'Librarian Ket', face: '📚', text: 'An analogy: a ket is a <b>letter</b>, a bra is an <b>addressed envelope</b>. Put the letter into the envelope — ⟨a|ψ⟩ — and you get a <b>number</b> (a stamp, an amplitude). Put them the other way round, |ψ⟩⟨a|, and you get a <b>machine</b> (an operator) that turns letters into other letters.' },
      { who: 'Librarian Ket', face: '📚', text: 'On the table (3D) you will see shapes: <b>arrow</b> = ket, <b>plank</b> = bra, <b>cube</b> = operator, <b>coin</b> = number, <b>bar</b> = probability. Put tokens together and learn what comes out of what.' },
      'Correct.',
    ], [
      'Дірак.',
      { who: 'Бібліотекар Кет', face: '📚', text: '(пошепки) Професор Дірак славиться мовчазністю. Колеги нібито запровадили одиницю <b>1 дірак = одне слово на годину</b>. Дозволь, я перекладу.' },
      { who: 'Бібліотекар Кет', face: '📚', text: 'Професор винайшов <b>бра-кет запис</b> — граматику квантової механіки. Кожен вираз має <b>тип</b>, як слово в мові має частину мови: <b>кет |ψ⟩</b> = стан (стовпець), <b>бра ⟨ψ|</b> = питання (рядок), <b>Â</b> = оператор (машина).' },
      { who: 'Бібліотекар Кет', face: '📚', text: 'Аналогія: кет — це <b>лист</b>, бра — <b>підписаний конверт</b>. Поклади лист у конверт — ⟨a|ψ⟩ — і отримаєш <b>число</b> (марку, амплітуду). Поклади навпаки, |ψ⟩⟨a|, — і отримаєш <b>машину</b> (оператор), що перетворює одні листи на інші.' },
      { who: 'Бібліотекар Кет', face: '📚', text: 'На столі (3D) побачиш фігури: <b>стрілка</b> = кет, <b>дошка</b> = бра, <b>куб</b> = оператор, <b>монета</b> = число, <b>стовпчик</b> = імовірність. Складай жетони й дізнавайся, що з чого виходить.' },
      'Правильно.',
    ]), () => this.next());
  }

  tasks() { this.loadTask(this.sub.ti || 0); }
  loadTask(i) {
    this.ti = i; this.sub.ti = i; this.tokens = []; this.squared = false;
    const T = DIRAC_TASKS[i];
    this.quest(tr(`Úloha ${i + 1}/${DIRAC_TASKS.length}: Postav ${T.title}.`, `Task ${i + 1}/${DIRAC_TASKS.length}: Build ${T.title}.`, `Завдання ${i + 1}/${DIRAC_TASKS.length}: Склади ${T.title}.`), { easy: tr(`🧱 ${i + 1}/${DIRAC_TASKS.length}: ${T.title}`, `🧱 ${i + 1}/${DIRAC_TASKS.length}: ${T.title}`, `🧱 ${i + 1}/${DIRAC_TASKS.length}: ${T.title}`), hard: `${i + 1}/${DIRAC_TASKS.length} · ${T.title} · ${tr('typ', 'type', 'тип')}: ${TYPE_NAME[T.want]}` });
    const toks = DIRAC_TOKENS.map((d) => UI.button(d.t, () => { this.tokens.push(d); this.refresh(); }, 'token'));
    this.view = UI.info('');
    UI.panelSet(tr('Skladanie výrazu', 'Building an expression', 'Складання виразу'), [
      UI.info(`<b>${tr('Postav', 'Build', 'Склади')}:</b> ${T.title}` + (Settings.easy ? `<br><small>💡 ${tr('počet tokenov', 'number of tokens', 'кількість жетонів')}: ${T.exact.length}${T.sq ? ' + |…|²' : ''} · ${tr('začni', 'start with', 'почни з')} ${T.exact[0]}</small>` : '')),
      UI.row(...toks.slice(0, 3)), UI.row(...toks.slice(3, 6)), UI.row(...toks.slice(6)),
      UI.row(UI.button('|…|²', () => { this.squared = !this.squared; this.refresh(); }), UI.button('⌫', () => { this.tokens.pop(); this.refresh(); }), UI.button(tr('Vymaž', 'Clear', 'Очистити'), () => { this.tokens = []; this.squared = false; this.refresh(); })),
      this.view,
      UI.button(tr('✔ Over', '✔ Check', '✔ Перевірити'), () => this.verify(), 'big'),
    ]);
    this.refresh();
  }
  exprString() {
    const s = this.tokens.map((t) => t.t).join(' ').replace(/\| \|/g, '|').replace(/⟩ ⟨/g, '⟩⟨').replace(/\| Â/g, '|Â').replace(/\| Ĥ/g, '|Ĥ').replace(/Â \|/g, 'Â|').replace(/Ĥ \|/g, 'Ĥ|');
    return this.squared ? `|${s}|²` : s;
  }
  refresh() {
    this.res = diracType(this.tokens, this.squared);
    const e = this.exprString() || '…';
    this.view.innerHTML = `<div class="expr">${e}</div>` + (this.res.type && this.res.type !== 'bad' ? `${tr('Typ', 'Type', 'Тип')}: <b>${TYPE_NAME[this.res.type]}</b>` : this.res.type === 'bad' ? `⚠️ ${this.res.why}` : '');
  }
  verify() {
    const T = DIRAC_TASKS[this.ti], got = this.tokens.map((t) => t.t);
    const ok = this.res.type === T.want && this.squared === T.sq && got.join() === T.exact.join();
    if (ok) {
      this.grant(T.grant);
      this.say([{ who: tr('Knihovníčka Ket', 'Librarian Ket', 'Бібліотекар Кет'), face: '📚', text: '✅ ' + T.msg }], () => {
        if (this.ti === 2) {
          this.ask(tr({ q: 'Ktorý výraz je OPERÁTOR?', options: ['|ψ⟩⟨φ|', '⟨φ|ψ⟩', '⟨ψ|Â|ψ⟩'], correct: 0, why: 'Ket-bra = operátor; bra-ket = číslo; ⟨ψ|Â|ψ⟩ = číslo (stredná hodnota).' }, { q: 'Which expression is an OPERATOR?', options: ['|ψ⟩⟨φ|', '⟨φ|ψ⟩', '⟨ψ|Â|ψ⟩'], correct: 0, why: 'Ket-bra = operator; bra-ket = number; ⟨ψ|Â|ψ⟩ = number (expectation value).' }, { q: 'Який вираз є ОПЕРАТОРОМ?', options: ['|ψ⟩⟨φ|', '⟨φ|ψ⟩', '⟨ψ|Â|ψ⟩'], correct: 0, why: 'Кет-бра = оператор; бра-кет = число; ⟨ψ|Â|ψ⟩ = число (середнє значення).' }), () => this.after());
        } else this.after();
      });
    } else if (Settings.hard) this.mistakes++; // ťažká: každé zlé overenie je chyba
    if (ok) return;
    const pen = Settings.hard ? tr(' <small>(+1 chyba)</small>', ' <small>(+1 mistake)</small>', ' <small>(+1 помилка)</small>') : '';
    if (this.res.type === 'bad') UI.toast(tr('Taký výraz gramatika nepovoľuje: ', 'The grammar does not allow such an expression: ', 'Граматика не дозволяє такого виразу: ') + this.res.why + pen, 3500);
    else if (this.res.type !== T.want) UI.toast(tr(`Postavil si <b>${TYPE_NAME[this.res.type] || '—'}</b>, ale úloha chce <b>${TYPE_NAME[T.want]}</b>.`, `You built: <b>${TYPE_NAME[this.res.type] || '—'}</b>, but the task wants: <b>${TYPE_NAME[T.want]}</b>.`, `Ти склав(-ла): <b>${TYPE_NAME[this.res.type] || '—'}</b>, але завдання вимагає: <b>${TYPE_NAME[T.want]}</b>.`) + pen, 3500);
    else UI.toast(tr('Typ sedí, ale skontroluj, ktoré stavy a v akom poradí úloha žiada.', 'The type is right, but check which states and in what order the task asks for.', 'Тип правильний, але перевір, які стани й у якому порядку вимагає завдання.') + pen, 3000);
  }
  after() {
    if (this.ti + 1 < DIRAC_TASKS.length) this.loadTask(this.ti + 1);
    else this.say(tr(['Dobre.', { who: 'Knihovníčka Ket', face: '📚', text: '(To je od neho takmer óda!) Hlavná myšlienka: <b>|ψ⟩ je abstraktný stav</b>, a ψ(x) = ⟨x|ψ⟩ je iba jeho „súradnica“ v polohovej báze — rovnako ako c<sub>n</sub> = ⟨n|ψ⟩ v diskrétnej báze.' }],
      ['Good.', { who: 'Librarian Ket', face: '📚', text: '(From him that is almost an ode!) The main idea: <b>|ψ⟩ is an abstract state</b>, and ψ(x) = ⟨x|ψ⟩ is just its “coordinate” in the position basis — just like c<sub>n</sub> = ⟨n|ψ⟩ in a discrete basis.' }], ['Добре.', { who: 'Бібліотекар Кет', face: '📚', text: '(Від нього це майже ода!) Головна думка: <b>|ψ⟩ — абстрактний стан</b>, а ψ(x) = ⟨x|ψ⟩ — лише його «координата» в базисі положень, так само як c<sub>n</sub> = ⟨n|ψ⟩ у дискретному базисі.' }]), () => this.next());
  }

  update(dt) { this.t += dt; this.spin += dt; }

  shape(r, kind, p, s = 1) {
    if (kind === 'ket') { r.arrow(V3.add(p, [0, -0.45 * s, 0]), V3.add(p, [0, 0.5 * s, 0]), [0.3, 0.9, 1], 0.08 * s, { emissive: 0.3 }); }
    else if (kind === 'bra') { r.draw('box', M4.trs(p, 0, [0.9 * s, 0.18 * s, 0.3 * s]), [1, 0.4, 0.8], { emissive: 0.3 }); }
    else if (kind === 'op') { r.draw('box', M4.trs(p, this.spin * 0.6, 0.6 * s), [1, 0.6, 0.2], { emissive: 0.2 }); }
    else if (kind === 'num') { r.draw('cylinder', M4.mul(M4.trs(p, 0, 1), M4.alignY([0, 0, 0], [Math.sin(this.spin), 0, Math.cos(this.spin)], 0.1 * s, 0.45 * s)), [1, 0.82, 0.25], { emissive: 0.3 }); }
    else if (kind === 'prob') { r.draw('cylinder', M4.trs(V3.add(p, [0, -0.6 * s, 0]), 0, [0.25 * s, 1.2 * s, 0.25 * s]), [0.4, 1, 0.5], { emissive: 0.3 }); }
    else if (kind === 'ket2') { this.shape(r, 'ket', V3.add(p, [-0.25 * s, 0, 0]), s * 0.8); this.shape(r, 'ket', V3.add(p, [0.25 * s, 0, 0]), s * 0.8); }
    else if (kind === 'tensor') { r.draw('torus', M4.orient(p, [0, 0, 1], 0.25 * s), [0.9, 0.9, 1]); }
  }

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    r.draw('box', M4.trs([0, -0.05, 0], 0, [16, 0.1, 12]), [0.25, 0.18, 0.14], { pattern: 1 });
    // police s knihami
    for (let i = 0; i < 7; i++) for (const z of [-5]) {
      const x = -6 + i * 2;
      r.draw('box', M4.trs([x, 1.5, z], 0, [1.8, 3, 0.6]), [0.35, 0.22, 0.12]);
      for (let b = 0; b < 4; b++) for (let sh = 0; sh < 3; sh++)
        r.draw('box', M4.trs([x - 0.6 + b * 0.4, 0.55 + sh * 1, z + 0.32], 0, [0.3, 0.7, 0.12]), [[0.7, 0.2, 0.2], [0.2, 0.5, 0.7], [0.8, 0.7, 0.3], [0.3, 0.6, 0.3]][(b + sh + i) % 4]);
    }
    // stôl
    r.draw('box', M4.trs([0, 0.9, 0], 0, [6, 0.12, 1.6]), [0.5, 0.33, 0.2]);
    for (const x of [-2.8, 2.8]) for (const z of [-0.6, 0.6]) r.draw('box', M4.trs([x, 0.42, z], 0, [0.15, 0.85, 0.15]), [0.4, 0.26, 0.15]);
    // tokeny ako tvary
    const n = this.tokens.length, w = Math.min(1.1, 5.4 / Math.max(n, 1));
    this.tokens.forEach((tk, i) => {
      const p = [(i - (n - 1) / 2) * w, 1.55, 0];
      this.shape(r, tk.k, p, 0.8);
      UI.label('tk' + i, V3.add(p, [0, 0.75, 0]), tk.t, 'ket');
      UI.hot(p, TIPS[tk.t], 30);
    });
    if (this.squared && n) { UI.label('sq', [((n - 1) / 2) * w + 0.6, 2.4, 0], '|…|²', 'ket'); }
    // výsledok
    if (this.res && this.res.type && this.res.type !== 'bad') {
      const p = [0, 3.4 + Math.sin(this.t * 2) * 0.1, 0];
      this.shape(r, this.res.type, p, 1.3);
      const rt = `${tr('Výsledný typ výrazu', 'Resulting type of the expression', 'Результівний тип виразу')}: <b>${TYPE_NAME[this.res.type]}</b>.`;
      UI.label('res', V3.add(p, [0, 1.15, 0]), '= ' + TYPE_NAME[this.res.type], 'player', rt);
      UI.hot(p, rt, 45);
    } else if (this.res && this.res.type === 'bad') {
      UI.label('res', [0, 3.4, 0], tr('⚠️ neplatný výraz', '⚠️ invalid expression', '⚠️ недійсний вираз'), 'prompt');
    }
    // legenda tvarov
    const leg = [['ket', tr('ket = stav', 'ket = state', 'кет = стан')], ['bra', tr('bra = otázka', 'bra = question', 'бра = питання')], ['op', tr('operátor', 'operator', 'оператор')], ['num', tr('číslo', 'number', 'число')], ['prob', tr('pravdepod.', 'probability', 'імовірність')]];
    leg.forEach(([k, t], i) => { const p = [-5 + i * 2.5, 0.75, 2.6]; this.shape(r, k, p, 0.6); UI.label('lg' + i, V3.add(p, [0, -0.7, 0]), t, 'axis', LEGEND_TIPS[k]); UI.hot(p, LEGEND_TIPS[k], 34); });
  }
}
