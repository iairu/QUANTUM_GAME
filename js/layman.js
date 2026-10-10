'use strict';
// Laická obťažnosť: mechanika ako ľahká, ale reč „po ľudsky“ — pred každou úlohou vysvetlenie bežnými slovami,
// žargón v dialógoch dostane preklad do bežnej reči v zátvorke a vysvetlivky sú jednoduché.

// Kartičky „po ľudsky“ pred jednotlivými krokmi levelov (level → názov kroku → repliky [sk, en, uk])
const LAYMAN_STEPS = {
  1: {
    intro: [L('layman.1.intro.0'),
    L('layman.1.intro.1')],
    setHand: [L('layman.1.setHand.0')],
    timesI: [L('layman.1.timesI.0')],
    interference: [L('layman.1.interference.0'),
    L('layman.1.interference.1')],
  },
  2: {
    intro: [L('layman.2.intro.0'),
    L('layman.2.intro.1')],
    twoSpots: [L('layman.2.twoSpots.0')],
    sequences: [L('layman.2.sequences.0'),
    L('layman.2.sequences.1')],
    predict: [L('layman.2.predict.0')],
  },
  3: {
    intro: [L('layman.3.intro.0'),
    L('layman.3.intro.1')],
    puzzles: [L('layman.3.puzzles.0')],
    measure: [L('layman.3.measure.0'),
    L('layman.3.measure.1')],
    lab: [L('layman.3.lab.0')],
  },
  4: {
    intro: [L('layman.4.intro.0'),
    L('layman.4.intro.1')],
    pure: [L('layman.4.pure.0')],
    withMeasure: [L('layman.4.withMeasure.0'),
    L('layman.4.withMeasure.1')],
    deco: [L('layman.4.deco.0')],
  },
  5: {
    intro: [L('layman.5.intro.0'),
    L('layman.5.intro.1')],
    tasks: [L('layman.5.tasks.0')],
  },
  6: {
    intro: [L('layman.6.intro.0'),
    L('layman.6.intro.1')],
    precession: [L('layman.6.precession.0'),
    L('layman.6.precession.1')],
    piPulse: [L('layman.6.piPulse.0')],
    halfPulse: [L('layman.6.halfPulse.0')],
    tuning: [L('layman.6.tuning.0')],
    t2: [L('layman.6.t2.0')],
  },
  7: {
    intro: [L('layman.7.intro.0'),
    L('layman.7.intro.1')],
    build: [L('layman.7.build.0')],
    noSignal: [L('layman.7.noSignal.0')],
    chsh: [L('layman.7.chsh.0'),
    L('layman.7.chsh.1')],
  },
  9: {
    intro: [L('layman.9.intro.0'),
    L('layman.9.intro.1')],
    phase1: [L('layman.9.phase1.0')],
    phase2: [L('layman.9.phase2.0')],
    phase3: [L('layman.9.phase3.0')],
  },
  8: {
    intro: [L('layman.8.intro.0')],
    statues: [L('layman.8.statues.0')],
    sorting: [L('layman.8.sorting.0')],
  },
};
// spoločná kartička pred záverečným kvízom každého levelu
const LAYMAN_FINALE = [L('layman.finale.0')];

function laymanFor(num, step) {
  if (!Settings.layman) return [];
  return (step === 'finale' ? LAYMAN_FINALE : LAYMAN_STEPS[num]?.[step] || []).map(pick);
}

// Žargón → bežná reč: [kmeň slova, krátky preklad v zátvorke, vysvetlivka]. Konkrétnejšie frázy sú vyššie.
const LAYMAN_WORDS_SK = [
  ['relatívn\\p{L}* fáz', 'časový posun medzi časťami', 'Relatívna fáza: ako veľmi sú šípky dvoch odpovedí navzájom pootočené. Dá sa zistiť meraním.'],
  ['globáln\\p{L}* fáz', 'pootočenie všetkého naraz', 'Globálna fáza: všetky šípky otočené spolu. Nijako sa to nedá zistiť, takže na nej nezáleží.'],
  ['Blochov\\p{L}* sfér', 'guľa qubitu', 'Blochova sféra: obrázok qubitu ako šípky v guli. Hore 0, dole 1, inde prelínanie.'],
  ['matic\\p{L}* hustoty', 'tabuľka prelínania', 'Matica hustoty ρ: tabuľka, ktorá ukazuje šance aj to, či prelínanie ešte žije.'],
  ['Bornov\\p{L}* pravidl', 'šanca = dĺžka šípky²', 'Bornovo pravidlo: šanca odpovede = dĺžka jej šípky na druhú.'],
  ['Bellov\\p{L}* stav', 'dokonale prepojený pár', 'Bellov stav: dva qubity prepojené tak, že ich výsledky vždy sedia.'],
  ['komplexn\\p{L}* rovin', 'mapa šípok', 'Komplexná rovina: plocha, na ktorej kreslíme šípky (amplitúdy).'],
  ['komplexn\\p{L}* čísl', 'číslo-šípka', 'Komplexné číslo: číslo, ktoré má dĺžku aj smer — ako šípka.'],
  ['stredn\\p{L}* hodnot', 'dlhodobý priemer', 'Stredná hodnota: priemer z veľa meraní, nie výsledok jedného.'],
  ['skryt\\p{L}* premenn', 'tajne vopred dané odpovede', 'Skryté premenné: predstava, že odpovede sú dané vopred, len o nich nevieme.'],
  ['rotujúc\\p{L}* rám', 'pohľad z kolotoča', 'Rotujúci rámec: pozeráme sa z kolotoča, ktorý sa točí spolu so šípkou.'],
  ['vlastn\\p{L}* stav', 'stav, ktorý otázka nezmení', 'Vlastný stav: stav s istou odpoveďou na danú otázku.'],
  ['amplitúd', 'šípka odpovede', 'Amplitúda: malá šípka pri každej možnej odpovedi. Dlhšia šípka = pravdepodobnejšia odpoveď.'],
  ['superpozíci', 'prelínanie 0 aj 1', 'Superpozícia: qubit nie je „0 alebo 1, len nevieme“ — je to skutočné prelínanie, ktoré vie interferovať.'],
  ['dekoherenci', 'rušenie z okolia', 'Dekoherencia: okolie „nakukuje“ a prelínanie bledne. Hlavný nepriateľ kvantových počítačov.'],
  ['koherenci', 'živé prelínanie', 'Koherencia: prelínanie je ešte živé a vie interferovať.'],
  ['interferenci', 'sčítanie či rušenie šípok', 'Interferencia: šípky sa sčítajú — rovnakým smerom sa posilnia, opačným vyrušia.'],
  ['previazan', 'prepojené qubity', 'Previazanosť: dva qubity majú jeden spoločný stav a ich výsledky sú prepojené.'],
  ['fáz', 'smer šípky', 'Fáza: smer, ktorým šípka mieri. Sama šancu nemení, ale rozhoduje, či sa šípky posilnia alebo vyrušia.'],
  ['kolaps', 'chvíľa, keď padne jasná odpoveď', 'Kolaps: pri meraní z prelínania zostane jedna jasná odpoveď.'],
  ['Hamiltoni', 'pravidlo energie', 'Hamiltonián: pravidlo, ktoré hovorí, ako sa stav s časom mení.'],
  ['unitárn', 'vratné otočenie', 'Unitárna operácia: otočenie, ktoré sa dá vrátiť späť.'],
  ['báz', 'otázka, ktorú kladieme', 'Báza: aká otázka sa pri meraní kladie, napr. „0 alebo 1?“.'],
  ['operátor', 'stroj na zmenu stavu', 'Operátor: stroj, ktorý zo stavu urobí iný stav.'],
  ['precesi', 'krútenie ako vĺčik', 'Precesia: šípka sa krúti dookola ako vĺčik; šance sa pritom nemenia.'],
  ['rezonanci', 'naladenie', 'Rezonancia: frekvencia je presne „naladená“ — ako stanica v rádiu.'],
  ['komplementarit', 'dva obrazy, čo sa dopĺňajú', 'Komplementarita: vlna aj častica sú dva obrazy; každý pokus ukáže jeden z nich.'],
  ['zmes', 'skrytý hod mincou', 'Zmes: minca už padla, len nevieme ako. Takéto „neviem“ neinterferuje.'],
  ['zmiešan', 'čiastočne rozmazaný', 'Zmiešaný stav: qubit, ktorý už čiastočne stratil prelínanie (šípka kratšia ako guľa).'],
  ['ortogonáln', 'dokonale rozlíšiteľné', 'Ortogonálne stavy: dajú sa jedným meraním s istotou rozlíšiť.'],
  ['spin', 'malý vnútorný magnet', 'Spin: častica sa správa ako maličký magnet; meranie dá vždy „hore“ alebo „dole“.'],
  ['qubit', 'kvantový bit', 'Qubit: kvantový bit. Ako bit má odpovede 0 a 1, ale pred meraním môže byť ich prelínaním.'],
  ['ket', 'označenie stavu', 'Ket |…⟩: len značka pre stav, ako menovka.'],
  ['ansámb', 'obrovský dav kópií', 'Ansámbel: veľa rovnakých kópií; meria sa ich priemer.'],
  ['nelokáln', 'pôsobenie na diaľku', 'Nelokálnosť: zdanlivé pôsobenie medzi vzdialenými miestami.'],
  ['hradl', 'operácia s qubitom', 'Hradlo: jedna základná operácia kvantového počítača — otočenie šípky qubitu.'],
  ['z?mera', 'pozretie sa na qubit', 'Meranie: opýtame sa qubitu otázku (napr. „0 alebo 1?“) a dostaneme jednu jasnú odpoveď.'],
  ['pravdepodobnos', 'šanca', 'Pravdepodobnosť: šanca, že padne daná odpoveď.'],
  ['pozorovateľn', 'merateľné', 'Pozorovateľná: niečo, čo sa dá zmerať.'],
  ['tenzorov', 'postavenie vedľa seba', 'Tenzorový súčin: spojenie dvoch systémov do jedného väčšieho.'],
  ['CNOT', 'podmienené preklopenie', 'CNOT: preklopí druhý qubit, ak je prvý 1.'],
  ['NMR', 'princíp nemocničnej magnetickej rezonancie', 'NMR: jadrová magnetická rezonancia — rovnaký princíp ako MRI v nemocnici.'],
  ['Zeeman', 'rozdelenie energie magnetom', 'Zeemanov jav: magnet rozdelí energiu na dve hladiny (0 a 1).'],
];
const LAYMAN_WORDS_EN = [
  ['relative phase', 'timing difference between the parts', 'Relative phase: how much the arrows of two answers are turned against each other. Measurable.'],
  ['global phase', 'turning everything at once', 'Global phase: all arrows turned together. Nothing can detect it, so it doesn’t matter.'],
  ['Bloch sphere', 'the qubit ball', 'Bloch sphere: a picture of a qubit as an arrow in a ball. Top = 0, bottom = 1, elsewhere = a blend.'],
  ['density matri', 'the blend table', 'Density matrix ρ: a table showing the chances and whether the blend is still alive.'],
  ['Born rule', 'chance = arrow length²', 'Born rule: the chance of an answer = the length of its arrow, squared.'],
  ['Bell state', 'a perfectly linked pair', 'Bell state: two qubits linked so their results always match.'],
  ['complex plane', 'the arrow map', 'Complex plane: the surface on which we draw the arrows (amplitudes).'],
  ['complex number', 'an arrow-number', 'Complex number: a number with both a length and a direction — like an arrow.'],
  ['expectation value', 'the long-run average', 'Expectation value: the average of many measurements, not the result of one.'],
  ['hidden variable', 'secret pre-set answers', 'Hidden variables: the idea that answers are fixed in advance and we just don’t know them.'],
  ['rotating frame', 'the merry-go-round view', 'Rotating frame: watching from a merry-go-round that turns along with the arrow.'],
  ['eigenstate', 'a state the question leaves alone', 'Eigenstate: a state with a certain answer to a given question.'],
  ['amplitude', 'the answer’s arrow', 'Amplitude: a little arrow attached to every possible answer. Longer arrow = more likely answer.'],
  ['superposition', 'a blend of 0 and 1', 'Superposition: not “0 or 1, we just don’t know” — a genuine blend that can interfere.'],
  ['decoheren', 'noise from the surroundings', 'Decoherence: the surroundings “peek” and the blend fades. The main enemy of quantum computers.'],
  ['coheren', 'the blend still alive', 'Coherence: the blend is still alive and able to interfere.'],
  ['interfer', 'arrows adding up or cancelling', 'Interference: arrows add up — same direction reinforces, opposite directions cancel.'],
  ['entangle', 'linked qubits', 'Entanglement: two qubits share one joint state and their results are linked.'],
  ['phase', 'the arrow’s direction', 'Phase: the direction the arrow points. It doesn’t change the chance by itself, but decides whether arrows reinforce or cancel.'],
  ['collaps', 'the moment a clear answer appears', 'Collapse: when measuring, a single clear answer is left from the blend.'],
  ['Hamiltonian', 'the energy rule', 'Hamiltonian: the rule that says how a state changes over time.'],
  ['unitar', 'a reversible turn', 'Unitary operation: a turn that can be undone.'],
  ['(?:basis|bases)', 'the question being asked', 'Basis: which question a measurement asks, e.g. “0 or 1?”.'],
  ['operator', 'a state-changing machine', 'Operator: a machine that turns one state into another.'],
  ['precess', 'spinning like a top', 'Precession: the arrow spins around like a top; the chances don’t change meanwhile.'],
  ['resonan', 'being in tune', 'Resonance: the frequency is exactly “in tune” — like a radio station.'],
  ['complementarit', 'two pictures that fit together', 'Complementarity: wave and particle are two pictures; each experiment shows one of them.'],
  ['mixture', 'a hidden coin toss', 'Mixture: the coin has already landed, we just don’t know how. That kind of “not sure” doesn’t interfere.'],
  ['mixed', 'partly scrambled', 'Mixed state: a qubit that has partly lost its blend (the arrow is shorter than the ball).'],
  ['orthogonal', 'perfectly distinguishable', 'Orthogonal states: one measurement can tell them apart with certainty.'],
  ['spin(?!n)', 'a tiny built-in magnet', 'Spin: the particle acts like a tiny magnet; measuring it always gives “up” or “down”.'],
  ['qubit', 'quantum bit', 'Qubit: a quantum bit. Like a bit it has the answers 0 and 1, but before measuring it can be a blend of both.'],
  ['ket', 'a state label', 'Ket |…⟩: just a label for a state, like a name tag.'],
  ['ensemble', 'a huge crowd of copies', 'Ensemble: many identical copies; their average is what gets measured.'],
  ['non-?local', 'action at a distance', 'Non-locality: an apparent influence between far-apart places.'],
  ['gate', 'a qubit operation', 'Gate: one basic operation of a quantum computer — a turn of the qubit’s arrow.'],
  ['measur', 'looking at the qubit', 'Measurement: we ask the qubit a question (e.g. “0 or 1?”) and get one clear answer.'],
  ['probabilit', 'chance', 'Probability: the chance that a given answer comes out.'],
  ['observable', 'something measurable', 'Observable: something you can measure.'],
  ['tensor product', 'putting systems side by side', 'Tensor product: joining two systems into one bigger one.'],
  ['CNOT', 'a conditional flip', 'CNOT: flips the second qubit if the first one is 1.'],
  ['NMR', 'the hospital MRI principle', 'NMR: nuclear magnetic resonance — the same principle as an MRI scanner in a hospital.'],
  ['Zeeman', 'energy split by a magnet', 'Zeeman effect: a magnet splits the energy into two levels (0 and 1).'],
];
const LAYMAN_WORDS_UK = [
  ['відносн\\p{L}* фаз', 'різниця в часі між частинами', 'Відносна фаза: наскільки стрілки двох відповідей повернуті одна відносно одної. Її можна виміряти.'],
  ['глобальн\\p{L}* фаз', 'поворот усього разом', 'Глобальна фаза: усі стрілки повернуті разом. Ніщо не може її виявити, тож вона не має значення.'],
  ['сфер\\p{L}* Блоха', 'куля кубіта', 'Сфера Блоха: зображення кубіта як стрілки в кулі. Угорі = 0, унизу = 1, деінде = суміш.'],
  ['матриц\\p{L}* густини', 'таблиця суміші', 'Матриця густини ρ: таблиця, що показує шанси й те, чи суміш ще жива.'],
  ['правил\\p{L}* Борна', 'шанс = довжина стрілки²', 'Правило Борна: шанс відповіді = довжина її стрілки в квадраті.'],
  ['стан\\p{L}* Белла', 'ідеально пов’язана пара', 'Стан Белла: два кубіти, пов’язані так, що їхні результати завжди збігаються.'],
  ['комплексн\\p{L}* площин', 'мапа стрілок', 'Комплексна площина: поверхня, на якій ми малюємо стрілки (амплітуди).'],
  ['комплексн\\p{L}* числ', 'число-стрілка', 'Комплексне число: число, що має і довжину, і напрямок, — як стрілка.'],
  ['середн\\p{L}* значенн', 'середнє на довгу дистанцію', 'Середнє значення: середнє багатьох вимірювань, а не результат одного.'],
  ['прихован\\p{L}* змінн', 'таємні наперед задані відповіді', 'Приховані змінні: ідея, що відповіді визначені заздалегідь, а ми їх просто не знаємо.'],
  ['обертов\\p{L}* систем', 'погляд із каруселі', 'Обертова система: спостереження з каруселі, що крутиться разом зі стрілкою.'],
  ['власн\\p{L}* стан', 'стан, якого питання не чіпає', 'Власний стан: стан із певною відповіддю на дане питання.'],
  ['амплітуд', 'стрілка відповіді', 'Амплітуда: маленька стрілка, прикріплена до кожної можливої відповіді. Довша стрілка = імовірніша відповідь.'],
  ['суперпозиц', 'суміш 0 і 1', 'Суперпозиція: не «0 або 1, ми просто не знаємо», а справжнє переплетення, що може інтерферувати.'],
  ['декогеренц', 'шум від довкілля', 'Декогеренція: довкілля «підглядає», і суміш згасає. Головний ворог квантових комп’ютерів.'],
  ['когерентн', 'суміш ще жива', 'Когерентність: суміш ще жива й здатна інтерферувати.'],
  ['інтерфер', 'стрілки додаються або гасяться', 'Інтерференція: стрілки додаються — однаковий напрямок підсилює, протилежний гасить.'],
  ['сплутан', 'пов’язані кубіти', 'Сплутаність: два кубіти мають один спільний стан, і їхні результати пов’язані.'],
  ['фаз', 'напрямок стрілки', 'Фаза: напрямок, куди дивиться стрілка. Сама по собі шансу не змінює, але вирішує, чи стрілки підсилюються, чи гасяться.'],
  ['колапс', 'мить, коли з’являється чітка відповідь', 'Колапс: під час вимірювання із суміші лишається одна чітка відповідь.'],
  ['гамільтоніан', 'правило енергії', 'Гамільтоніан: правило, яке каже, як стан змінюється з часом.'],
  ['унітарн', 'оборотний поворот', 'Унітарна операція: поворот, який можна скасувати.'],
  ['базис', 'питання, яке ставимо', 'Базис: яке питання ставить вимірювання, напр. «0 чи 1?».'],
  ['оператор', 'машина, що змінює стани', 'Оператор: машина, що перетворює один стан на інший.'],
  ['прецес', 'крутиться, як дзиґа', 'Прецесія: стрілка крутиться, як дзиґа; шанси при цьому не змінюються.'],
  ['резонанс', 'бути в тон', 'Резонанс: частота точно «в тон» — як радіостанція.'],
  ['доповнювальн', 'дві картини, що пасують одна до одної', 'Доповнювальність: хвиля й частинка — дві картини; кожен експеримент показує одну з них.'],
  ['суміш(?!\\p{L})', 'приховане підкидання монетки', 'Суміш: монетка вже впала, ми просто не знаємо як. Таке «не знаю напевно» не інтерферує.'],
  ['змішан', 'частково перемішаний', 'Змішаний стан: кубіт, що частково втратив своє переплетення (стрілка коротша за кулю).'],
  ['ортогональн', 'цілком розрізненні', 'Ортогональні стани: одне вимірювання напевно їх розрізнить.'],
  ['спін', 'крихітний вбудований магніт', 'Спін: частинка поводиться як крихітний магніт; його вимірювання завжди дає «угору» або «вниз».'],
  ['кубіт', 'квантовий біт', 'Кубіт: квантовий біт. Як і біт, має відповіді 0 і 1, але до вимірювання може бути сумішшю обох.'],
  ['кет', 'мітка стану', 'Кет |…⟩: просто мітка стану, як бейджик з іменем.'],
  ['ансамбл', 'величезний натовп копій', 'Ансамбль: багато однакових копій; вимірюють їхнє середнє.'],
  ['нелокальн', 'дія на відстані', 'Нелокальність: позірний вплив між далекими місцями.'],
  ['гейт', 'операція з кубітом', 'Гейт: одна базова операція квантового комп’ютера — поворот стрілки кубіта.'],
  ['вимір', 'дивимося на кубіт', 'Вимірювання: ставимо кубітові питання (напр. «0 чи 1?») і отримуємо одну чітку відповідь.'],
  ['(?:імовірн|ймовірн)', 'шанс', 'Імовірність: шанс, що випаде певна відповідь.'],
  ['спостережуван', 'щось вимірюване', 'Спостережувана: щось, що можна виміряти.'],
  ['тензорн\\p{L}* добут', 'ставимо системи поруч', 'Тензорний добуток: об’єднання двох систем в одну більшу.'],
  ['CNOT', 'умовний переворот', 'CNOT: перевертає другий кубіт, якщо перший — 1.'],
  ['ЯМР', 'принцип лікарняної МРТ', 'ЯМР: ядерний магнітний резонанс — той самий принцип, що в апараті МРТ у лікарні.'],
  ['Зееман', 'розщеплення енергії магнітом', 'Ефект Зеемана: магніт розщеплює енергію на два рівні (0 і 1).'],
];
const LAYMAN_RE = tr(LAYMAN_WORDS_SK, LAYMAN_WORDS_EN, LAYMAN_WORDS_UK).map(([stem, plain, tip]) => [new RegExp(`(?<![\\p{L}])(${stem}\\p{L}*)`, 'iu'), plain, tip]);

// laická verzia annotate(): vysvetlivky bežnou rečou, inline = aj krátky preklad žargónu v zátvorke (prvý výskyt)
function annotateLayman(html, inline) {
  const found = [];
  const out = String(html).split(/(<[^>]+>)/).map((seg) => {
    if (seg.startsWith('<')) return seg;
    for (const entry of LAYMAN_RE) {
      if (found.some((f) => f.entry === entry)) continue;
      const m = seg.match(entry[0]);
      if (!m) continue;
      found.push({ entry, word: m[1] });
      seg = seg.slice(0, m.index) + `\u0001${found.length - 1}\u0003` + seg.slice(m.index + m[1].length); // značka bez písmen → ďalšie kmene ju nenájdu
    }
    return seg;
  }).join('');
  return out.replace(/\u0001(\d+)\u0003/g, (_, i) => {
    const { entry: [, plain, tip], word } = found[+i];
    return `<span class="term" data-tip="${tip.replace(/"/g, '&quot;')}">${word}</span>` + (inline ? `<span class="plain"> (${plain})</span>` : '');
  });
}

// jednoduché vysvetlivky symbolov
const LAYMAN_TIPS = tr({
  '|0⟩': 'Odpoveď „0“ — severný pól gule qubitu. Ako bit nastavený na 0.',
  '|1⟩': 'Odpoveď „1“ — južný pól gule qubitu. Ako bit nastavený na 1.',
  '|+⟩': 'Rovnomerné prelínanie 0 a 1: pri meraní 50/50. Vyrobí ho hradlo H z |0⟩.',
  '|−⟩': 'Tiež 50/50, ale šípka pri 1 mieri opačne — líši sa len „načasovaním“.',
  'ψ': 'ψ (psí) — stav qubitu. To si ty, Psíčko: recept na šance, nie guľôčka.',
  'α': 'α — šípka pri odpovedi 0. Jej dĺžka na druhú = šanca, že padne 0.',
  'β': 'β — šípka pri odpovedi 1. Jej dĺžka na druhú = šanca, že padne 1.',
  'ρ': 'ρ — tabuľka šancí a „živosti“ prelínania.',
  'ħ': 'ħ — maličká prírodná konštanta, „veľkosť kroku“ kvantového sveta.',
}, {
  '|0⟩': 'The answer “0” — the north pole of the qubit ball. Like a bit set to 0.',
  '|1⟩': 'The answer “1” — the south pole of the qubit ball. Like a bit set to 1.',
  '|+⟩': 'An even blend of 0 and 1: 50/50 when measured. The H gate makes it from |0⟩.',
  '|−⟩': 'Also 50/50, but the arrow of 1 points the other way — it differs only in “timing”.',
  'ψ': 'ψ (psi) — the qubit’s state. That’s you, Little Psi: a recipe for chances, not a little ball.',
  'α': 'α — the arrow of the answer 0. Its length squared = the chance of getting 0.',
  'β': 'β — the arrow of the answer 1. Its length squared = the chance of getting 1.',
  'ρ': 'ρ — a table of chances and of how “alive” the blend is.',
  'ħ': 'ħ — a tiny constant of nature, the “step size” of the quantum world.',
}, {
  '|0⟩': 'Відповідь «0» — північний полюс кулі кубіта. Як біт, встановлений на 0.',
  '|1⟩': 'Відповідь «1» — південний полюс кулі кубіта. Як біт, встановлений на 1.',
  '|+⟩': 'Рівномірна суміш 0 і 1: під час вимірювання 50/50. Її робить гейт H із |0⟩.',
  '|−⟩': 'Теж 50/50, але стрілка при 1 дивиться в інший бік — відрізняється лише «часом».',
  'ψ': 'ψ (псі) — стан кубіта. Це ти, Псічко: рецепт шансів, а не кулька.',
  'α': 'α — стрілка відповіді 0. Її довжина в квадраті = шанс отримати 0.',
  'β': 'β — стрілка відповіді 1. Її довжина в квадраті = шанс отримати 1.',
  'ρ': 'ρ — таблиця шансів і того, наскільки «жива» суміш.',
  'ħ': 'ħ — крихітна стала природи, «розмір кроку» квантового світу.',
});

// popis portálov na ostrove bežnou rečou
const LAYMAN_LEVEL_TIPS = tr({
  1: 'Šípky pri odpovediach: dĺžka = šanca, smer = načasovanie. Ako sa šípky posilnia alebo vyrušia.',
  2: 'Atómy ako maličké magnetky: vždy len „hore“ alebo „dole“ — prvý qubit.',
  3: 'Qubit ako šípka v guli; hradlá kvantového počítača ju otáčajú.',
  4: 'Prečo nakúkanie a šum kazia kvantové kúzlo.',
  5: 'Skratky fyzikov: stav, otázka, odpoveď.',
  6: 'Magnetická rezonancia: rádiom preklápame qubity — ako prvé kvantové počítače.',
  7: 'Prepojené qubity a hra, ktorú s nimi vyhráš častejšie.',
  8: 'Čo to celé vlastne znamená? Rozhovory s mysliteľmi.',
  9: '🐉 Súboj s drakom: natoč šípku jeho štítu k zlatej a udri.',
}, {
  1: 'Arrows on answers: length = chance, direction = timing. How arrows team up or cancel.',
  2: 'Atoms as tiny magnets: always just “up” or “down” — the first qubit.',
  3: 'A qubit as an arrow in a ball; quantum computer gates turn it.',
  4: 'Why peeking and noise spoil the quantum magic.',
  5: 'Physicists’ shorthand: state, question, answer.',
  6: 'Magnetic resonance: flipping qubits with radio — like the first quantum computers.',
  7: 'Linked qubits and a game you win more often with them.',
  8: 'What does it all mean? Conversations with thinkers.',
  9: '🐉 The dragon battle: turn his ward’s arrow towards the golden one and strike.',
}, {
  1: 'Стрілки на відповідях: довжина = шанс, напрямок = час. Як стрілки об’єднуються або гасяться.',
  2: 'Атоми як крихітні магніти: завжди лише «угору» або «вниз» — перший кубіт.',
  3: 'Кубіт як стрілка в кулі; гейти квантового комп’ютера її повертають.',
  4: 'Чому підглядання й шум псують квантові чари.',
  5: 'Скорочення фізиків: стан, питання, відповідь.',
  6: 'Магнітний резонанс: перевертаємо кубіти радіохвилями — як у перших квантових комп’ютерах.',
  7: 'Пов’язані кубіти й гра, яку з ними виграєш частіше.',
  8: 'Що це все означає? Розмови з мислителями.',
  9: '🐉 Битва з драконом: поверни стрілку його захисту до золотої й бий.',
});

// úvod sprievodkyne bežnou rečou (zobrazí sa pri prvom stretnutí v laickej obťažnosti alebo po jej zapnutí)
const LAYMAN_INTRO = [
  L('layman.LAYMAN_INTRO.1.0'),
  L('layman.LAYMAN_INTRO.1.1'),
  L('layman.LAYMAN_INTRO.1.2'),
  L('layman.LAYMAN_INTRO.1.3'),
  Settings.dragon && L('layman.LAYMAN_INTRO.1.4'),
  L('layman.LAYMAN_INTRO.1.5'),
  L('layman.LAYMAN_INTRO.1.6'),
  L('layman.LAYMAN_INTRO.1.7'),
].filter(Boolean);
