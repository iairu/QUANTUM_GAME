'use strict';
// Učenie (docs/LEARNER_EXPERIENCE.md): aby hráč, ktorý level dokončí, sa ho aj naozaj naučil.
//  OBJECTIVES — 2–4 ciele každého levelu („viem…“); každý krok, otázka a doplňovačka sa viaže na jeden z nich
//  GEN        — prenosové otázky s novými číslami (generované simulátorom, nedajú sa naučiť naspamäť)
//  Learn      — dôkazy zvládnutia (úloha + otázka), opakovanie s odstupom (Leitnerove priehradky),
//               druhá šanca na konci levelu, sebadôvera, stupňovité nápovedy, vstupný a výstupný test, štatistiky, export
// Stav sa ukladá v Game.progress (review, stats, mastery, assess, hints, times, drill, clock).

const OBJ_ICON = ['⬜', '🟡', '✅'];

// ciele levelov: steps = kroky, ktoré cieľ precvičujú (intro len určuje, kam patria otázky z úvodu; ako „úloha“ sa nepočíta)
const OBJECTIVES = {
  1: [
    { id: 'amp', steps: ['intro', 'setHand'], text: tr('Z amplitúdy urobím pravdepodobnosť P = |α|² a viem, že fáza ju nemení.', 'I can turn an amplitude into a probability P = |α|², and I know the phase does not change it.', 'Перетворюю амплітуду на ймовірність P = |α|² і знаю, що фаза її не змінює.') },
    { id: 'rot', steps: ['timesI'], text: tr('Násobenie i (a e<sup>iφ</sup>) čítam ako otočenie ručičky.', 'I read multiplying by i (and by e<sup>iφ</sup>) as turning the hand.', 'Читаю множення на i (і на e<sup>iφ</sup>) як поворот стрілки.') },
    { id: 'interf', steps: ['interference'], text: tr('Predpoviem interferenciu: najprv sčítam amplitúdy, až potom umocním.', 'I can predict interference: first add the amplitudes, only then square.', 'Передбачаю інтерференцію: спершу додаю амплітуди, лише потім підношу до квадрата.') },
  ],
  2: [
    { id: 'two', steps: ['intro', 'twoSpots'], text: tr('Viem, čo dá meranie spinu: jeden z dvoch výsledkov ±ħ/2, nie spojité pásmo.', 'I know what a spin measurement gives: one of two outcomes ±ħ/2, not a continuous band.', 'Знаю, що дає вимірювання спіну: один із двох результатів ±ħ/2, а не суцільну смугу.') },
    { id: 'seq', steps: ['sequences'], text: tr('Predpoviem postupnosť meraní: každé meranie pripraví nový stav.', 'I can predict a sequence of measurements: each measurement prepares a new state.', 'Передбачаю послідовність вимірювань: кожне вимірювання готує новий стан.') },
    { id: 'cos', steps: ['predict'], text: tr('Pre magnet otočený o ϑ predpoviem P = cos²(ϑ/2).', 'For a magnet turned by ϑ I can predict P = cos²(ϑ/2).', 'Для магніту, повернутого на ϑ, передбачаю P = cos²(ϑ/2).') },
  ],
  3: [
    { id: 'gates', steps: ['puzzles'], text: tr('Hradlo chápem ako rotáciu Blochovej sféry a predpoviem, kam stav posunie.', 'I see a gate as a rotation of the Bloch sphere and can predict where it moves a state.', 'Розумію гейт як поворот сфери Блоха і передбачаю, куди він переведе стан.') },
    { id: 'phase', steps: ['intro', 'puzzles'], text: tr('Odlíšim relatívnu fázu (pozorovateľnú) od globálnej (nepozorovateľnej).', 'I can tell a relative phase (observable) from a global phase (unobservable).', 'Відрізняю відносну фазу (спостережувану) від глобальної (неспостережуваної).') },
    { id: 'meas', steps: ['measure', 'lab'], text: tr('Jedno meranie = jeden bit; pravdepodobnosti P(+m) = (1 + r·m)/2 dá až štatistika.', 'One measurement = one bit; the probabilities P(+m) = (1 + r·m)/2 come only from statistics.', 'Одне вимірювання = один біт; імовірності P(+m) = (1 + r·m)/2 дає лише статистика.') },
  ],
  4: [
    { id: 'hh', steps: ['intro', 'pure'], text: tr('Vysvetlím, prečo H·H dá s istotou 0 (interferencia ciest).', 'I can explain why H·H gives 0 with certainty (interference of paths).', 'Пояснюю, чому H·H напевно дає 0 (інтерференція шляхів).') },
    { id: 'mix', steps: ['withMeasure', 'deco'], text: tr('Odlíšim superpozíciu od zmesi: meranie či dekoherencia zmažú mimodiagonálu ρ.', 'I can tell a superposition from a mixture: a measurement or decoherence wipe out the off-diagonal of ρ.', 'Відрізняю суперпозицію від суміші: вимірювання чи декогеренція стирають позадіагональ ρ.') },
  ],
  5: [
    { id: 'types', steps: ['intro', 'tasks'], text: tr('Určím typ bra-ket výrazu: číslo, stav, operátor alebo pravdepodobnosť.', 'I can tell the type of a bra-ket expression: number, state, operator or probability.', 'Визначаю тип бра-кет виразу: число, стан, оператор чи ймовірність.') },
    { id: 'prob', steps: ['tasks'], text: tr('Z amplitúdy ⟨a|ψ⟩ urobím pravdepodobnosť |⟨a|ψ⟩|².', 'I can turn an amplitude ⟨a|ψ⟩ into a probability |⟨a|ψ⟩|².', 'Перетворюю амплітуду ⟨a|ψ⟩ на ймовірність |⟨a|ψ⟩|².') },
  ],
  6: [
    { id: 'prec', steps: ['intro', 'precession'], text: tr('Viem, že precesia mení fázu, nie P(0) a P(1).', 'I know precession changes the phase, not P(0) and P(1).', 'Знаю, що прецесія змінює фазу, а не P(0) і P(1).') },
    { id: 'pulse', steps: ['piPulse', 'halfPulse', 'tuning'], text: tr('Zvolím plochu impulzu (π, π/2) a vysvetlím rezonanciu.', 'I can choose a pulse area (π, π/2) and explain resonance.', 'Обираю площу імпульсу (π, π/2) і пояснюю резонанс.') },
    { id: 't2', steps: ['t2'], text: tr('Vysvetlím T₂: Blochov vektor sa zmršťuje dovnútra a stav je zmiešaný.', 'I can explain T₂: the Bloch vector shrinks inwards and the state becomes mixed.', 'Пояснюю T₂: вектор Блоха стискається всередину, і стан стає змішаним.') },
  ],
  7: [
    { id: 'bell', steps: ['intro', 'build'], text: tr('Vyrobím Bellov stav a vysvetlím, prečo samotný qubit nemá šípku.', 'I can make a Bell state and explain why a single qubit has no arrow.', 'Створюю стан Белла і пояснюю, чому окремий кубіт не має стрілки.') },
    { id: 'nosig', steps: ['noSignal'], text: tr('Vysvetlím, prečo previazanosť nepošle signál.', 'I can explain why entanglement cannot send a signal.', 'Пояснюю, чому сплутаність не передає сигналу.') },
    { id: 'chsh', steps: ['chsh'], text: tr('Vysvetlím, ako kvantová stratégia v CHSH prekoná klasických 75 %.', 'I can explain how the quantum strategy beats the classical 75 % in CHSH.', 'Пояснюю, як квантова стратегія в CHSH перевершує класичні 75 %.') },
  ],
  8: [
    { id: 'bohr', steps: ['intro', 'statues'], text: tr('Správne podám Bohrov názor: jav opisujeme spolu s podmienkami experimentu.', 'I can state Bohr’s view correctly: a phenomenon is described together with the experimental conditions.', 'Правильно викладаю погляд Бора: явище описуємо разом з умовами досліду.') },
    { id: 'levels', steps: ['sorting'], text: tr('Otázku zaradím: ontologická, epistemologická alebo fenomenologická.', 'I can sort a question: ontological, epistemological or phenomenological.', 'Класифікую питання: онтологічне, епістемологічне чи феноменологічне.') },
  ],
  9: [
    { id: 'coords', steps: ['intro', 'coords'], text: tr('Z (θ, φ) urobím stav a naopak.', 'I can turn (θ, φ) into a state and back.', 'Перетворюю (θ, φ) на стан і навпаки.') },
    { id: 'rot', steps: ['rotations'], text: tr('Predpoviem rotáciu R<sub>n</sub>(ϑ) na Blochovej sfére.', 'I can predict a rotation R<sub>n</sub>(ϑ) on the Bloch sphere.', 'Передбачаю поворот R<sub>n</sub>(ϑ) на сфері Блоха.') },
    { id: 'axis', steps: ['measureAxis'], text: tr('Z meraní v rôznych smeroch určím φ a ⟨S<sub>n</sub>⟩.', 'I can find φ and ⟨S<sub>n</sub>⟩ from measurements along different directions.', 'З вимірювань у різних напрямках визначаю φ і ⟨S<sub>n</sub>⟩.') },
    { id: 'deco', steps: ['unitaryVsDeco'], text: tr('Odlíšim unitárnu operáciu (|r| ostáva) od dekoherencie (|r| klesá).', 'I can tell a unitary operation (|r| stays) from decoherence (|r| shrinks).', 'Відрізняю унітарну операцію (|r| лишається) від декогеренції (|r| зменшується).') },
  ],
  10: [
    { id: 'unitary', steps: ['intro', 'unitaryWall', 'pseudoPure'], text: tr('Vysvetlím, prečo ρ′ = UρU† nemení |r| a ako NMR využíva pseudo-čistý stav.', 'I can explain why ρ′ = UρU† keeps |r| and how NMR uses a pseudo-pure state.', 'Пояснюю, чому ρ′ = UρU† не змінює |r| і як ЯМР використовує псевдочистий стан.') },
    { id: 'purify', steps: ['purify'], text: tr('Viem, čo stav vyčistí: meranie so známym výsledkom alebo chladenie.', 'I know what purifies a state: a measurement with a known result, or cooling.', 'Знаю, що очищує стан: вимірювання з відомим результатом або охолодження.') },
    { id: 'tomo', steps: ['observables'], text: tr('Z ⟨σ<sub>x</sub>⟩, ⟨σ<sub>y</sub>⟩, ⟨σ<sub>z</sub>⟩ zostavím Blochov vektor a čistotu Tr ρ².', 'I can rebuild the Bloch vector and the purity Tr ρ² from ⟨σ<sub>x</sub>⟩, ⟨σ<sub>y</sub>⟩, ⟨σ<sub>z</sub>⟩.', 'З ⟨σ<sub>x</sub>⟩, ⟨σ<sub>y</sub>⟩, ⟨σ<sub>z</sub>⟩ відновлюю вектор Блоха і чистоту Tr ρ².') },
    { id: 'evol', steps: ['evolution'], text: tr('Predpoviem časový vývoj: menia sa len relatívne fázy medzi energetickými stavmi.', 'I can predict time evolution: only the relative phases between energy states change.', 'Передбачаю часову еволюцію: змінюються лише відносні фази між енергетичними станами.') },
  ],
  11: [
    { id: 'phase', steps: ['intro', 'phaseReveal'], text: tr('Relatívnu fázu odhalím hradlom H pred meraním v Z.', 'I can reveal a relative phase with an H gate before a Z measurement.', 'Виявляю відносну фазу гейтом H перед вимірюванням у Z.') },
    { id: 'mid', steps: ['midCircuit'], text: tr('Vysvetlím, ako meranie uprostred obvodu zmení výsledok.', 'I can explain how a mid-circuit measurement changes the result.', 'Пояснюю, як вимірювання посеред схеми змінює результат.') },
    { id: 'feedback', steps: ['feedback'], text: tr('Navrhnem pravidlo „zmeraj → rozhodni → pokračuj“.', 'I can design a “measure → decide → continue” rule.', 'Складаю правило «виміряй → виріши → продовжуй».') },
    { id: 'bell', steps: ['bellReadout'], text: tr('Odlíšim Bellov stav od klasickej zmesi (a dekoherenciu od readoutu).', 'I can tell a Bell state from a classical mixture (and decoherence from readout).', 'Відрізняю стан Белла від класичної суміші (і декогеренцію від зчитування).') },
  ],
  12: [
    { id: 'tune', steps: ['intro', 'tune'], text: tr('Naladím vysielač: ν₀ = γB₀/2π.', 'I can tune the transmitter: ν₀ = γB₀/2π.', 'Налаштовую передавач: ν₀ = γB₀/2π.') },
    { id: 'pulse', steps: ['pulse', 'calibrate'], text: tr('Nakalibrujem impulz: θ = γB₁τ, τ₉₀ = τ₁₈₀/2.', 'I can calibrate a pulse: θ = γB₁τ, τ₉₀ = τ₁₈₀/2.', 'Калібрую імпульс: θ = γB₁τ, τ₉₀ = τ₁₈₀/2.') },
    { id: 'fid', steps: ['sequence', 'echo'], text: tr('Vysvetlím FID a spinové echo (t<sub>echo</sub> = 2τ).', 'I can explain the FID and the spin echo (t<sub>echo</sub> = 2τ).', 'Пояснюю FID і спінове відлуння (t<sub>echo</sub> = 2τ).') },
  ],
  13: [
    { id: 'strike', steps: ['intro', 'phase1', 'phase2', 'phase3'], text: tr('Zvolím os merania, ktorá maximalizuje P = ½(1 + r·n).', 'I can choose the measurement axis that maximises P = ½(1 + r·n).', 'Обираю вісь вимірювання, що максимізує P = ½(1 + r·n).') },
  ],
};

// jazykové pasce na konci levelu → cieľ (index otázky v TRAPS[n], resp. TRAPS_HARD[n])
const TRAP_OBJ = {
  1: ['amp', 'rot', 'interf'], 2: ['two', 'seq', 'two'], 3: ['gates', 'phase', 'gates', 'phase'], 4: ['mix', 'mix', 'mix'],
  5: ['prob', 'types', 'types'], 6: ['pulse', 'prec', 'prec', 't2'], 7: ['nosig', 'bell', 'chsh'], 8: ['bohr', 'bohr', 'bohr', 'levels', 'bohr'],
  9: ['coords', 'rot', 'axis'], 10: ['unitary', 'unitary', 'tomo'], 11: ['mid', 'bell', 'bell'], 12: ['pulse', 'fid', 'fid'],
};
const TRAP_OBJ_HARD = {
  1: ['interf', 'rot'], 2: ['seq', 'cos'], 3: ['gates', 'meas'], 4: ['mix', 'mix'], 5: ['prob', 'types'], 6: ['pulse', 't2'],
  7: ['chsh', 'bell'], 8: ['bohr', 'bohr'], 9: ['axis'], 10: ['tomo'], 11: ['mid'],
};

// ---------- prenosové otázky: nové čísla pri každom položení ----------
const pickR = (a) => a[Math.floor(rand() * a.length)];
// správna možnosť prvá, ostatné bez duplicít (podľa zobrazeného textu), spolu najviac n
function optsOf(correct, cands, n = 4) {
  const out = [correct];
  for (const c of cands) if (out.length < n && !out.includes(c)) out.push(c);
  return out;
}
const N2 = (x) => Fmt.num(x, 2);
// uhol v stupňoch ako zlomok π (násobky π/8: 22,5° → π/8, 135° → 3π/4), inak cez Fmt.angle
const piStr = (deg) => {
  const k = deg / 22.5;
  if (Math.abs(k - Math.round(k)) > 1e-6) return Fmt.angle(deg * Math.PI / 180);
  const gcd = (x, y) => (y ? gcd(y, x % y) : x), c = gcd(Math.round(k), 8) || 1, p = Math.round(k) / c, q = 8 / c;
  return p === 0 ? '0' : (p === 1 ? '' : p) + 'π' + (q === 1 ? '' : '/' + q);
};
const KETS = { '0': '|0⟩', '1': '|1⟩', '+': '|+⟩', '-': '|−⟩', '+i': '|+i⟩', '-i': '|−i⟩' };
const KET_VEC = { '0': [0, 0, 1], '1': [0, 0, -1], '+': [1, 0, 0], '-': [-1, 0, 0], '+i': [0, 1, 0], '-i': [0, -1, 0] };
const ketOfVec = (v) => Object.keys(KET_VEC).find((k) => V3.dot(KET_VEC[k], v) > 0.999);
const ketOpts = (correct) => optsOf(KETS[correct], Object.keys(KETS).filter((k) => k !== correct).sort(() => rand() - 0.5).map((k) => KETS[k]));
const OUT = () => ({ a0: DL('gen.out.always0'), a1: DL('gen.out.always1'), half: DL('gen.out.half'), q: DL('gen.out.quarter') });

const GEN = {
  // ---- 1 · komplexné čísla ----
  g1amp() {
    const r = pickR([0.3, 0.4, 0.5, 0.6, 0.8, 0.9]), ph = pickR([1, 2, 3, 4, 5, 6]) * Math.PI / 4;
    return { q: DL('gen.g1amp.q', `${N2(r)}·e<sup>i·${Fmt.angle(ph)}</sup>`), options: optsOf(N2(r * r), [N2(r), N2(r * r * Math.cos(ph) ** 2), N2(1 - r * r), N2(Math.sqrt(r))]), correct: 0, why: DL('gen.g1amp.why', N2(r), N2(r * r)) };
  },
  g1rot() {
    const L = ['1', 'i', '−1', '−i'], a = Math.floor(rand() * 4), n = pickR([1, 2, 3, 5, 6, 7]), neg = rand() < 0.35;
    const res = ((a + (neg ? -n : n)) % 4 + 4) % 4;
    return { q: DL('gen.g1rot.q', L[a], n, neg ? '−i' : 'i'), options: [L[res], ...L.filter((_, k) => k !== res)], correct: 0, why: DL('gen.g1rot.why', n, (neg ? '−' : '') + n * 90 + '°', L[res]) };
  },
  g1int() {
    const ph = pickR([0, 1 / 3, 1 / 2, 2 / 3, 1, 3 / 2, 4 / 3]) * Math.PI, P = Math.cos(ph / 2) ** 2;
    return { q: DL('gen.g1int.q', Fmt.angle(ph)), options: optsOf(N2(P), [N2(0.5), N2(1 - P), N2(1), N2(0), N2(0.25)]), correct: 0, why: DL('gen.g1int.why', Fmt.angle(ph), N2(P)) };
  },
  // ---- 2 · Stern–Gerlach ----
  g2two() {
    const a = pickR([30, 45, 60, 120, 135]);
    return { q: DL('gen.g2two.q', a), options: [DL('gen.g2two.o0'), DL('gen.g2two.o1', a), DL('gen.g2two.o2'), DL('gen.g2two.o3')], correct: 0, why: DL('gen.g2two.why') };
  },
  g2seq() {
    const S = pickR([['Z+ → Z', 1], ['Z+ → X+ → Z', 0.5], ['Z+ → X+ → X', 1], ['Z+ → X− → X', 0], ['Z+ → X+ → Z+ → X', 0.5], ['X+ → Z', 0.5], ['X+ → Z+ → Z', 1], ['Z− → Z', 0]]);
    return { q: DL('gen.g2seq.q', S[0]), options: optsOf(Fmt.pct(S[1]), [Fmt.pct(0.5), Fmt.pct(1), Fmt.pct(0), Fmt.pct(0.25)]), correct: 0, why: DL('gen.g2seq.why', S[0], Fmt.pct(S[1])) };
  },
  g2cos() {
    const a = pickR([30, 45, 90, 120, 135, 150, 180]), p = Math.cos(a * Math.PI / 360) ** 2;
    return { q: DL('gen.g2cos.q', a), options: optsOf(Fmt.pct(p), [Fmt.pct(1 - p), Fmt.pct(Math.cos(a * Math.PI / 180) ** 2), Fmt.pct(0.5), Fmt.pct(1), Fmt.pct(0)]), correct: 0, why: DL('gen.g2cos.why', a, Fmt.pct(p)) };
  },
  // ---- 3 · Blochova sféra ----
  g3gate() {
    const from = pickR(Object.keys(KETS)), g = pickR(['X', 'Y', 'Z', 'H', 'S']);
    const [ax, an] = GateAxis[g], to = ketOfVec(V3.rotate(KET_VEC[from], V3.norm(ax), an));
    const AX = { X: '180° · x', Y: '180° · y', Z: '180° · z', H: '180° · (x + z)/√2', S: '90° · z' };
    return { q: DL('gen.g3gate.q', g, KETS[from]), options: ketOpts(to), correct: 0, why: DL('gen.g3gate.why', g, AX[g], KETS[to]) };
  },
  g3phase() {
    const s = pickR(['+', '+i', '-', '1']), f = pickR(['−', 'i', '−i', 'e<sup>iπ/4</sup>']);
    const wrong = ['|+⟩ ↔ |−⟩', '|+i⟩ ↔ |−i⟩', '|0⟩ ↔ |1⟩', '|+⟩ ↔ |+i⟩', '|−⟩ ↔ |−i⟩'].sort(() => rand() - 0.5);
    return { q: DL('gen.g3phase.q'), options: optsOf(`${KETS[s]} ↔ ${f}${KETS[s]}`, wrong), correct: 0, why: DL('gen.g3phase.why', f) };
  },
  g3lab() {
    const g = pickR([0, 30, 60, 90, 120, 150, 180]), p = (1 + Math.sin(g * Math.PI / 180)) / 2;
    return { q: DL('gen.g3lab.q', g), options: optsOf(Fmt.pct(p), [Fmt.pct((1 + Math.cos(g * Math.PI / 180)) / 2), Fmt.pct(0.5), Fmt.pct(1 - p), Fmt.pct(1), Fmt.pct(0), Fmt.pct(0.25), Fmt.pct(0.75)]), correct: 0, why: DL('gen.g3lab.why', g, Fmt.pct(p)) };
  },
  // ---- 4 · interferencia a zmes ----
  g4hh() {
    const s = pickR(['0', '1']), o = OUT();
    return { q: DL('gen.g4hh.q', KETS[s]), options: [s === '0' ? o.a0 : o.a1, s === '0' ? o.a1 : o.a0, o.half, o.q], correct: 0, why: DL('gen.g4hh.why', KETS[s]) };
  },
  g4mid() {
    const s = pickR(['0', '1']), o = OUT();
    return { q: DL('gen.g4mid.q', KETS[s]), options: [o.half, o.a0, o.a1, o.q], correct: 0, why: DL('gen.g4mid.why') };
  },
  g4deco() {
    const p = pickR([0.2, 0.4, 0.5, 0.6, 0.8, 1]), P = 1 - p / 2;
    return { q: DL('gen.g4deco.q', N2(p)), options: optsOf(Fmt.pct(P), [Fmt.pct(0.5), Fmt.pct(1), Fmt.pct(p / 2), Fmt.pct(1 - p)]), correct: 0, why: DL('gen.g4deco.why', N2(p), Fmt.pct(P)) };
  },
  // ---- 5 · bra-ket ----
  g5type() {
    const [e, t] = pickR([['⟨a|ψ⟩', 'num'], ['|ψ⟩⟨a|', 'op'], ['Â|ψ⟩', 'ket'], ['⟨ψ|Â', 'bra'], ['|⟨a|ψ⟩|²', 'prob'], ['⟨ψ|Â|ψ⟩', 'num'], ['|ψ⟩ ⊗ |φ⟩', 'ket2'], ['Â|ψ⟩⟨φ|', 'op'], ['⟨φ|ψ⟩⟨ψ|', 'bra']]);
    const others = ['num', 'ket', 'bra', 'op', 'prob', 'ket2'].filter((k) => k !== t).sort(() => rand() - 0.5);
    return { q: DL('gen.g5type.q', e), options: optsOf(TYPE_NAME[t], others.map((k) => TYPE_NAME[k])), correct: 0, why: DL('gen.g5type.why', e, TYPE_NAME[t]) };
  },
  g5amp() {
    const [a, b] = pickR([[0.6, 0.8], [0.8, 0.6], [0.6, -0.8], [0.8, -0.6]]), sq = rand() < 0.5;
    const ans = sq ? N2(b * b) : N2(b);
    return { q: DL(sq ? 'gen.g5amp.qp' : 'gen.g5amp.qa', N2(a), b < 0 ? '−' : '+', N2(Math.abs(b))), options: optsOf(ans, [sq ? N2(b) : N2(b * b), N2(a), N2(a * a), N2(-b)]), correct: 0, why: DL(sq ? 'gen.g5amp.whyp' : 'gen.g5amp.whya', N2(b), N2(b * b)) };
  },
  // ---- 6 · NMR / Rabi ----
  g6prec() {
    const th = pickR([60, 90, 120]), p = Math.sin(th * Math.PI / 360) ** 2, ph = pickR([45, 90, 135, 180, 270]);
    return { q: DL('gen.g6prec.q', Fmt.pct(p), ph), options: optsOf(Fmt.pct(p), [Fmt.pct(1 - p), Fmt.pct(0.5), Fmt.pct(p * Math.cos(ph * Math.PI / 360) ** 2), Fmt.pct(1)]), correct: 0, why: DL('gen.g6prec.why') };
  },
  g6pulse() {
    const a = pickR([1 / 3, 1 / 2, 2 / 3, 1, 3 / 2, 2]) * Math.PI, p = Math.sin(a / 2) ** 2;
    return { q: DL('gen.g6pulse.q', Fmt.angle(a)), options: optsOf(Fmt.pct(p), [Fmt.pct(1 - p), Fmt.pct(0.5), Fmt.pct(1), Fmt.pct(0), Fmt.pct(Math.sin(a) ** 2)]), correct: 0, why: DL('gen.g6pulse.why', Fmt.angle(a), Fmt.pct(p)) };
  },
  g6t2() {
    const k = pickR([0.8, 0.6, 0.4, 0.2]), p = (1 + k) / 2;
    return { q: DL('gen.g6t2.q', N2(k)), options: optsOf(Fmt.pct(p), [Fmt.pct(1), Fmt.pct(k), Fmt.pct(0.5), Fmt.pct(k * k)]), correct: 0, why: DL('gen.g6t2.why', N2(k), Fmt.pct(p)) };
  },
  // ---- 7 · Bellov most ----
  g7bell() {
    const a = pickR([0, 30, 45, 60]), b = a + pickR([0, 30, 60, 90, 120, 180]), p = Math.cos((b - a) * Math.PI / 360) ** 2;
    return { q: DL('gen.g7bell.q', a, b), options: optsOf(Fmt.pct(p), [Fmt.pct(1 - p), Fmt.pct(0.5), Fmt.pct(Math.cos((b - a) * Math.PI / 180) ** 2), Fmt.pct(1)]), correct: 0, why: DL('gen.g7bell.why', b - a, Fmt.pct(p)) };
  },
  g7nosig() {
    const a = pickR([30, 45, 60, 120, 135]);
    return { q: DL('gen.g7nosig.q', a), options: optsOf(Fmt.pct(0.5), [Fmt.pct(Math.cos(a * Math.PI / 360) ** 2), Fmt.pct(1), Fmt.pct(0), Fmt.pct(Math.sin(a * Math.PI / 360) ** 2)]), correct: 0, why: DL('gen.g7nosig.why') };
  },
  // ---- 9 · geometria ----
  g9coord() {
    const [th, ph] = pickR([[0, 0], [180, 0], [90, 0], [90, 90], [90, 180], [90, 270]]), to = ketOfVec([Math.sin(th * D2R0) * Math.cos(ph * D2R0), Math.sin(th * D2R0) * Math.sin(ph * D2R0), Math.cos(th * D2R0)]);
    return { q: DL('gen.g9coord.q', th, ph), options: ketOpts(to), correct: 0, why: DL('gen.g9coord.why', th, ph, KETS[to]) };
  },
  g9rot() {
    const from = pickR(Object.keys(KETS)), ax = pickR(['x', 'y', 'z']), an = pickR([0.5, 1, -0.5]) * Math.PI;
    const to = ketOfVec(V3.rotate(KET_VEC[from], { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }[ax], an));
    return { q: DL('gen.g9rot.q', ax, Fmt.angle(an), KETS[from]), options: ketOpts(to), correct: 0, why: DL('gen.g9rot.why', KETS[to]) };
  },
  g9axis() {
    const ph = pickR([0, 30, 45, 60, 90, 120, 135, 180]), y = rand() < 0.5, v = 0.5 * (y ? Math.sin(ph * D2R0) : Math.cos(ph * D2R0));
    const f = (x) => `${N2(x)} ħ`;
    return { q: DL('gen.g9axis.q', ph, y ? 'y' : 'x'), options: optsOf(f(v), [f(0.5 * (y ? Math.cos(ph * D2R0) : Math.sin(ph * D2R0))), f(0.5), f(0), f(-v), f(0.25), f(-0.5)]), correct: 0, why: DL('gen.g9axis.why', y ? 'sin' : 'cos', ph, f(v)) };
  },
  g9deco() {
    const k = pickR([0.3, 0.5, 0.6, 0.8]), u = rand() < 0.6;
    return u ? { q: DL('gen.g9deco.qu', N2(k)), options: optsOf(N2(k), [N2(1), N2(0), N2(k * k)]), correct: 0, why: DL('gen.g9deco.whyu') }
      : { q: DL('gen.g9deco.qd', N2(k)), options: [DL('gen.g9deco.od0'), DL('gen.g9deco.od1'), DL('gen.g9deco.od2')], correct: 0, why: DL('gen.g9deco.whyd') };
  },
  // ---- 10 · čistota ----
  g10pur() {
    const k = pickR([0, 0.2, 0.6, 0.8, 1]), p = (1 + k * k) / 2;
    return { q: DL('gen.g10pur.q', N2(k)), options: optsOf(N2(p), [N2((1 + k) / 2), N2(k * k), N2(1), N2(0.5), N2(0), N2(0.75), N2(0.25)]), correct: 0, why: DL('gen.g10pur.why', N2(k), N2(p)) };
  },
  g10tomo() {
    const r = pickR([[0.6, 0, 0.8], [0, 0.6, 0], [0.3, 0.4, 0], [0, 0, 0.5], [0, -0.8, 0.6], [0.8, 0, 0]]), k = V3.len(r);
    const st = (x) => `|r| = ${N2(x)} · ${x > 0.999 ? DL('gen.pure') : DL('gen.mixed')}`;
    return { q: DL('gen.g10tomo.q', N2(r[0]), N2(r[1]), N2(r[2])), options: optsOf(st(k), [st(Math.abs(r[0]) + Math.abs(r[1]) + Math.abs(r[2])), st(k * k), st(1), st(k / 2), st(0)]), correct: 0, why: DL('gen.g10tomo.why', N2(k)) };
  },
  g10evol() {
    const k = pickR([1, 2, 3, 4]), seq = ['+', '-i', '-', '+i'], to = seq[k % 4];
    return { q: DL('gen.g10evol.q', ['π/2', 'π', '3π/2', '2π'][k - 1]), options: ketOpts(to).filter((x) => ['|+⟩', '|−⟩', '|+i⟩', '|−i⟩', '|0⟩', '|1⟩'].includes(x)), correct: 0, why: DL('gen.g10evol.why', KETS[to]) };
  },
  // ---- 11 · meranie ----
  g11phase() {
    const s = pickR(['+', '-', '+i', '-i']), h = rand() < 0.7, o = OUT();
    const ans = !h || s === '+i' || s === '-i' ? o.half : s === '+' ? o.a0 : o.a1;
    return { q: DL(h ? 'gen.g11phase.qh' : 'gen.g11phase.q', KETS[s]), options: optsOf(ans, [o.half, o.a0, o.a1, o.q]), correct: 0, why: DL(h ? 'gen.g11phase.whyh' : 'gen.g11phase.why') };
  },
  g11fb() {
    const m = pickR([0, 1]), t = pickR(['0', '1']), g = (m === 1) === (t === '0') ? 'X' : 'I';
    return { q: DL('gen.g11fb.q', m, KETS[t]), options: optsOf(g, ['X', 'I', 'H', 'Z']), correct: 0, why: DL('gen.g11fb.why') };
  },
  g11bell() {
    const zMix = rand() < 0.6;
    return { q: DL(zMix ? 'gen.g11bell.qz' : 'gen.g11bell.qx'), options: optsOf(zMix ? 'XX' : 'ZZ', [zMix ? 'ZZ' : 'XX', DL('gen.g11bell.oA'), DL('gen.g11bell.oNone')]), correct: 0, why: DL(zMix ? 'gen.g11bell.whyz' : 'gen.g11bell.whyx') };
  },
  // ---- 12 · NMR dielňa ----
  g12tune() {
    const B = pickR([0.5, 1, 1.5, 2, 3]), nu = 42.58 * B, f = (x) => Fmt.num(x, 1) + ' MHz';
    return { q: DL('gen.g12tune.q', Fmt.num(B, 1)), options: optsOf(f(nu), [f(nu / 2), f(nu * 2), f(nu * 2 * Math.PI)]), correct: 0, why: DL('gen.g12tune.why', Fmt.num(B, 1), f(nu)) };
  },
  g12cal() {
    const t = pickR([8, 10, 12, 16, 20]), f = (x) => Fmt.num(x, 1) + ' µs';
    return { q: DL('gen.g12cal.q', t), options: optsOf(f(t / 2), [f(t), f(2 * t), f(t / 4)]), correct: 0, why: DL('gen.g12cal.why', t, f(t / 2)) };
  },
  g12echo() {
    const t = pickR([5, 10, 20, 30]), f = (x) => Fmt.num(x, 1) + ' ms';
    return { q: DL('gen.g12echo.q', t), options: optsOf(f(2 * t), [f(t), f(t / 2), f(4 * t)]), correct: 0, why: DL('gen.g12echo.why', t, f(2 * t)) };
  },
  // ---- 13 · drak ----
  g13() {
    const g = pickR([0, 60, 90, 120, 180]), k = pickR([1, 0.5]), p = (1 + k * Math.cos(g * D2R0)) / 2;
    return { q: DL('gen.g13.q', N2(k), g), options: optsOf(Fmt.pct(p), [Fmt.pct((1 + Math.cos(g * D2R0)) / 2), Fmt.pct(0.5), Fmt.pct(1), Fmt.pct(1 - p), Fmt.pct(0), Fmt.pct(0.25)]), correct: 0, why: DL('gen.g13.why', N2(k), g, Fmt.pct(p)) };
  },
};
const D2R0 = Math.PI / 180;
// cieľ → generátory prenosových otázok
const TRANSFER = {
  1: { amp: ['g1amp'], rot: ['g1rot'], interf: ['g1int'] },
  2: { two: ['g2two'], seq: ['g2seq'], cos: ['g2cos'] },
  3: { gates: ['g3gate'], phase: ['g3phase'], meas: ['g3lab'] },
  4: { hh: ['g4hh'], mix: ['g4mid', 'g4deco'] },
  5: { types: ['g5type'], prob: ['g5amp'] },
  6: { prec: ['g6prec'], pulse: ['g6pulse'], t2: ['g6t2'] },
  7: { bell: ['g7bell'], nosig: ['g7nosig'] },
  9: { coords: ['g9coord'], rot: ['g9rot'], axis: ['g9axis'], deco: ['g9deco'] },
  10: { unitary: ['g10pur'], tomo: ['g10tomo'], evol: ['g10evol'] },
  11: { phase: ['g11phase'], mid: ['g4mid'], feedback: ['g11fb'], bell: ['g11bell'] },
  12: { tune: ['g12tune'], pulse: ['g12cal'], fid: ['g12echo'] },
  13: { strike: ['g13'] },
};

const Learn = {
  DELAY: [1, 1, 2, 4], // Leitnerove priehradky 0–3: o koľko vstupov do levelov sa otázka vráti (priehradka 0 = istý omyl, treba viac správnych)
  get P() { return Game.progress; },
  spark: () => ({ who: tr('Iskra', 'Spark', 'Іскра'), face: '✨' }),
  objs(num) { return OBJECTIVES[num] || []; },
  objOfStep(num, step) { const o = this.objs(num).find((x) => x.steps.includes(step)); return o ? o.id : null; },
  // cieľ otázky: explicitný, podľa pasce, podľa kroku
  objOf(num, q) {
    if (q.obj) return q.obj;
    let m = q.id && q.id.match(/^traps\.(\d+)\.(\d+)$/);
    if (m) return (TRAP_OBJ[m[1]] || [])[+m[2]] || null;
    m = q.id && q.id.match(/^traps\.hard\.(\d+)\.(\d+)$/);
    if (m) return (TRAP_OBJ_HARD[m[1]] || [])[+m[2]] || null;
    if (q.id && q.id.startsWith('l13.DRAGON_TRAPS')) return 'strike';
    return q.step ? this.objOfStep(num, q.step) : null;
  },
  level() { const s = Game.scene; return s && s.lrn ? s : null; },
  stepName(L) { const s = L && L.steps && L.steps[L.stepIdx]; return s ? s.name : 'finale'; },

  // ---------- stav levelu ----------
  begin(L) {
    L.lrn = { missed: [], skipped: 0, assisted: new Set(), ev: {}, tasks: {}, calib: { n: 0, sure: 0, sureOk: 0 }, pre: null, stepT: performance.now(), askN: {} };
  },
  // rozohraný level sa ukladá aj s dôkazmi (po znovunačítaní stránky sa nestratia)
  ser(L) {
    const x = L.lrn;
    if (!x) return null;
    return { missed: x.missed, skipped: x.skipped, assisted: [...x.assisted], tasks: x.tasks, calib: x.calib, pre: x.pre, post: x.post,
      ev: Object.fromEntries(Object.entries(x.ev).map(([k, e]) => [k, { ...e, miss: [...e.miss] }])) };
  },
  restore(L, d) {
    if (!d) return;
    Object.assign(L.lrn, { missed: d.missed || [], skipped: d.skipped | 0, assisted: new Set(d.assisted || []), tasks: d.tasks || {}, calib: d.calib || L.lrn.calib, pre: d.pre || null, post: d.post || null,
      ev: Object.fromEntries(Object.entries(d.ev || {}).map(([k, e]) => [k, { ...e, miss: new Set(e.miss || []) }])) });
  },
  // úloha (krok) hotová: dôkaz pre jej cieľ, čas kroku
  taskDone(L, step) {
    if (!L.lrn) return;
    const P = this.P, key = `${L.num}:${step}`, sec = (performance.now() - L.lrn.stepT) / 1000;
    L.lrn.stepT = performance.now();
    const t = P.times[key] || { n: 0, s: 0 }; t.n++; t.s += Math.round(sec); P.times[key] = t;
    if (step !== 'intro') L.lrn.tasks[step] = L.lrn.assisted.has(step) ? 1 : 2;
  },
  hint(L, last) {
    if (!L || !L.lrn) return;
    const key = `${L.num}:${this.stepName(L)}`;
    this.P.hints[key] = (this.P.hints[key] || 0) + 1;
    if (last) L.lrn.assisted.add(this.stepName(L));
    Game.save();
  },
  skipped() { const L = this.level(); if (L) L.lrn.skipped++; },

  // ---------- otázky ----------
  snap(q) {
    const s = { id: q.id, lvl: q.lvl, obj: q.obj, step: q.step, lang: LANG };
    if (q.gen) return { ...s, gen: q.gen };
    if (q.eq) return { ...s, kind: 'blank', eq: q.eq, blanks: q.blanks, ctx: q.ctx, why: q.why, src: q.src, tier: q.tier };
    return { ...s, kind: 'quiz', q: q.q, options: q.options, correct: q.correct, why: q.why, whyWrong: q.whyWrong, weak: q.weak };
  },
  // otázka zo záznamu: generovaná dostane nové čísla, z CSV sa zostaví v aktuálnom jazyku
  rebuild(s, extra = {}) {
    const base = { lvl: s.lvl, obj: s.obj, step: s.step, ...extra };
    if (s.gen && GEN[s.gen]) return this.make(s.gen, base);
    if (s.kind === 'blank') { const b = s.lang !== LANG && EqBlanks.byId(s.id); return { ...(b || s), id: s.id, ...base }; }
    if (s.lang !== LANG && DL.has(s.id + '.q')) return { ...QZ(s.id), ...base };
    return { ...s, ...base, _order: null };
  },
  make(key, extra = {}) { return { ...GEN[key](), id: 'gen.' + key, gen: key, ...extra }; },
  // jedna prenosová otázka ku každému cieľu levelu (n = najviac)
  transfer(num, n = 4, extra = {}) {
    const T = TRANSFER[num] || {};
    return this.objs(num).filter((o) => T[o.id]).slice(0, n).map((o) => this.make(pickR(T[o.id]), { obj: o.id, lvl: num, ...extra }));
  },
  // položenie otázky v leveli: pri chybe v generovanej otázke hneď nasleduje nová obmena (musí sa zodpovedať)
  ask(L, q, done) {
    UI.quiz(q, (ok) => {
      if (ok === false && q.gen && !q.isRetry && !q.isPre && GEN[q.gen]) {
        const v = this.make(q.gen, { lvl: q.lvl, obj: q.obj, step: q.step, who: q.who, face: q.face, isRetry: true, inReview: q.inReview, tag: tr('🔁 nová obmena', '🔁 a fresh variant', '🔁 новий варіант') });
        return UI.quiz(v, () => done && done(false));
      }
      done && done(ok);
    });
  },
  askAny(L, q, done) { if (q.kind === 'blank' || q.eq) UI.blanks(q, done); else this.ask(L, q, done); },
  series(L, list, done) {
    let i = 0, ok = 0;
    const step = () => (i >= list.length ? done(ok) : this.askAny(L, list[i++], (r) => { if (r) ok++; step(); }));
    step();
  },
  // 🔮 predpoveď (uzamkne sa) a jej vyhodnotenie po pokuse
  predict(L, q, cb) {
    const full = { who: L.mentor, face: L.face, ...q, lvl: L.num, step: this.stepName(L) };
    UI.predict(full, (pick) => cb({ q: full, pick }));
  },
  reveal(L, pr, done) {
    if (!pr || pr.pick == null) return done && done();
    const q = pr.q, ok = pr.pick === q.correct;
    this.answered(q, ok, { pick: pr.pick, kind: 'predict' });
    if (!ok) L.mistakes++;
    UI.record({ kind: 'quiz', q: q.q, answer: q.options[q.correct], why: q.why, ok });
    Sound.sfx(ok ? 'good' : 'bad');
    const M = (s) => mathText(s, true);
    const text = `${tr('Tvoja predpoveď', 'Your prediction', 'Твоє передбачення')}: <b>${M(q.options[pr.pick])}</b> — `
      + (ok ? tr('✅ sedí s pokusom.', '✅ matches the experiment.', '✅ збігається з дослідом.') : tr(`❌ pokus ukázal: <b>${M(q.options[q.correct])}</b>.`, `❌ the experiment showed: <b>${M(q.options[q.correct])}</b>.`, `❌ дослід показав: <b>${M(q.options[q.correct])}</b>.`))
      + `<br>${q.why || ''}`;
    L.say([{ who: `🔮 ${L.mentor}`, face: L.face, text }], done);
  },

  // každá zodpovedaná otázka: štatistiky, opakovanie s odstupom, dôkaz pre cieľ, zoznam chýb levelu
  answered(q, ok, info = {}) {
    const P = this.P, id = q.id;
    if (!P || !id) return;
    const st = P.stats[id] || (P.stats[id] = { n: 0, ok: 0, first: null, w: {} });
    st.n++; if (ok) st.ok++; if (st.first == null) st.first = ok ? 1 : 0;
    if (!ok && info.pick != null) st.w[info.pick] = (st.w[info.pick] || 0) + 1;
    if (q.drill) { P.drill[id] = ok ? 1 : 0; return Game.save(); }
    const L = this.level();
    if (q.isPre) { if (L && L.lrn.pre) { L.lrn.pre.n++; if (ok) L.lrn.pre.ok++; } return Game.save(); }
    if (q.isPost && L && L.lrn.post) { L.lrn.post.n++; if (ok) L.lrn.post.ok++; }
    // ---- Leitner: chyba → priehradka 1 (istý omyl → 0), správne v opakovaní → vyššia priehradka, za 3 → zvládnuté
    const R = P.review, e = R[id], clock = P.clock;
    if (q.inReview || q.practice) {
      if (e) {
        if (ok) { e.box++; if (e.box > 3) delete R[id]; else e.due = clock + this.DELAY[e.box]; }
        else { e.box = 1; e.due = clock + 1; }
      } else if (!ok) R[id] = { box: 1, due: clock + 1, lvl: q.lvl, snap: this.snap(q) };
    } else if (!ok) {
      R[id] = { box: info.conf === 2 ? 0 : 1, due: clock + 1, lvl: q.lvl ?? (L && L.num), snap: this.snap(q) };
    } else if (info.conf === 0 && !e && !q.secondChance) {
      R[id] = { box: 2, due: clock + 2, lvl: q.lvl ?? (L && L.num), snap: this.snap(q) }; // správne, ale tipnuté → ešte raz
    }
    // ---- dôkaz pre cieľ a druhá šanca (len otázky tohto levelu, nie opakovanie z iných)
    if (L && !q.inReview && (q.lvl == null || q.lvl === L.num)) {
      const obj = this.objOf(L.num, q);
      if (obj) { // dôkazy pre cieľ: správne napoprvé, chyby (kým sa neopravia), prenosová otázka
        const ev = L.lrn.ev[obj] || (L.lrn.ev[obj] = { ok: 0, miss: new Set(), hadMiss: false, transferOk: false });
        if (q.secondChance || q.isRetry) { if (ok) ev.miss.delete(id); }
        else if (ok) { ev.ok++; if (q.isPost) ev.transferOk = true; }
        else { ev.miss.add(id); ev.hadMiss = true; }
      }
      if (!ok && !q.secondChance && !q.isRetry && L.lrn.missed.length < 12 && !L.lrn.missed.some((s) => s.id === id)) L.lrn.missed.push(this.snap({ ...q, lvl: L.num, obj }));
      if (info.conf != null) { L.lrn.calib.n++; if (info.conf === 2) { L.lrn.calib.sure++; if (ok) L.lrn.calib.sureOk++; } }
    }
    Game.save();
  },

  // ---------- vstup do levelu ----------
  // ✨ rozcvička (opakovanie z iných levelov) → 🎯 ciele (+ symboly) → vstupný test (prvý raz) → prvý krok
  intro(L, done) {
    const P = this.P;
    P.clock++;
    const parts = [];
    const due = L.boss ? this.mixed(L.num, 6) : this.due(L.num, 3);
    if (due.length) parts.push((next) => UI.say([{ ...this.spark(), text: L.boss ? DL('learn.mixed', due.length) : DL('learn.warmup', due.length) }],
      () => this.series(L, due, (k) => { UI.toast(tr(`✨ Rozcvička: ${k}/${due.length} správne`, `✨ Warm-up: ${k}/${due.length} correct`, `✨ Розминка: ${k}/${due.length} правильно`), 3200); next(); })));
    parts.push((next) => {
      const lines = [];
      if (this.objs(L.num).length) lines.push({ who: `🎯 ${L.mentor}`, face: L.face, text: `<b>${tr('Na konci tohto levelu budeš vedieť:', 'By the end of this level you will be able to:', 'Наприкінці цього рівня ти вмітимеш:')}</b>${this.goalsHtml(L.num)}` });
      const syms = !Settings.glyphs && !P.symSeen.includes(L.num) ? CODEX.filter((c) => c.level === L.num && c.type === 'symbol') : [];
      if (syms.length) {
        P.symSeen.push(L.num);
        lines.push({ who: tr('🔣 Symboly, ktoré tu stretneš', '🔣 Symbols you will meet here', '🔣 Символи, які тут зустрінеш'), face: '🔣', text: `<ul class="goals">${syms.map((c) => `<li><b>${c.sym}</b> — ${c.name}</li>`).join('')}</ul>` });
      }
      lines.length ? UI.say(lines, next) : next();
    });
    // vstupný test: len pri prvom vstupe, nehodnotí sa (tipovanie pred výkladom pomáha zapamätať si výklad)
    const pre = !(P.assess[L.num] && P.assess[L.num].pre) ? this.transfer(L.num, 3, { isPre: true, noConf: true, tag: tr('rozohrievacia otázka — nehodnotí sa', 'a warm-up guess — not graded', 'розминкове питання — не оцінюється') }) : [];
    if (pre.length) parts.push((next) => {
      L.lrn.pre = { ok: 0, n: 0 };
      UI.say([{ ...this.spark(), text: DL('learn.pretest', pre.length) }], () => this.series(L, pre.map((q) => ({ ...q, who: L.mentor, face: L.face })), () => {
        P.assess[L.num] = { ...(P.assess[L.num] || {}), pre: { ...L.lrn.pre, at: Date.now() } }; Game.save(); next();
      }));
    });
    const run = (k) => (k >= parts.length ? done() : parts[k](() => run(k + 1)));
    run(0);
  },
  due(excl, n) {
    const P = this.P;
    return Object.entries(P.review).filter(([, e]) => e.due <= P.clock && e.lvl !== excl && e.snap)
      .sort((a, b) => a[1].due - b[1].due || a[1].box - b[1].box).slice(0, n)
      .map(([, e]) => ({ ...this.rebuild(e.snap, { inReview: true, tag: `↻ ${tr('opakovanie', 'review', 'повторення')} · L${e.lvl}` }), ...this.spark() }));
  },
  // pred drakom: zmiešané opakovanie zo všetkých levelov (najprv chyby, potom prenosové otázky dokončených levelov)
  mixed(excl, n) {
    const out = this.due(excl, n);
    const done = LEVELS.filter((L) => L.num !== excl && Game.progress.stars[L.num] !== undefined && TRANSFER[L.num]).sort(() => rand() - 0.5);
    for (const L of done) {
      if (out.length >= n) break;
      const t = this.transfer(L.num, 4, { practice: true, tag: `↻ L${L.num}` });
      if (t.length) out.push({ ...pickR(t), ...this.spark() });
    }
    return out;
  },

  // ---------- koniec levelu ----------
  // 🔁 druhá šanca: otázky, ktoré hráč v leveli pokazil, ešte raz (generované s novými číslami)
  secondChance(L, done) {
    const list = L.lrn.missed.slice(0, 6).map((s) => ({ ...this.rebuild(s, { secondChance: true, tag: tr('🔁 druhá šanca', '🔁 second chance', '🔁 другий шанс') }), who: L.mentor, face: L.face }));
    if (!list.length) return done();
    L.say([DL('learn.second', list.length)], () => this.series(L, list, (k) => {
      L.lrn.secondOk = k; L.lrn.secondN = list.length;
      done();
    }));
  },
  // stav cieľa: 2 = ✅ úloha bez pomoci, všetky otázky k cieľu napoprvé a (ak existuje) prenosová otázka s novými číslami;
  // 1 = 🟡 s pomocou, alebo chyby opravené až v druhej šanci / v novej obmene; 0 = ⬜ niečo ostalo neopravené alebo chýba dôkaz
  objStatus(L, o) {
    const tasks = o.steps.filter((s) => s !== 'intro' && L.steps.some((f) => f.name === s));
    const task = tasks.length ? Math.min(...tasks.map((s) => L.lrn.tasks[s] || 0)) : 2;
    const ev = L.lrn.ev[o.id], needT = !!(TRANSFER[L.num] && TRANSFER[L.num][o.id]);
    const check = !ev || ev.miss.size || !ev.ok ? 0 : ev.hadMiss || (needT && !ev.transferOk) ? 1 : 2;
    return !task || !check ? 0 : Math.min(task, check);
  },
  goalsHtml(num, run) {
    const best = this.P.mastery[num] || {};
    return `<ul class="goals">${this.objs(num).map((o) => `<li>${OBJ_ICON[run ? run[o.id] : best[o.id] || 0]} ${o.text}</li>`).join('')}</ul>`;
  },
  mastered(num) { const o = this.objs(num), m = this.P.mastery[num] || {}; return o.length > 0 && o.every((x) => m[x.id] === 2); },
  // vyhodnotenie levelu: režim opakovania (preskočené otázky) → bez hviezdičiek; ciele, sebadôvera, test pred/po
  finish(L, stars) {
    const P = this.P, num = L.num, reviewed = Settings.noBlanks || L.lrn.skipped > 0;
    if (reviewed) stars = 0;
    const run = {};
    for (const o of this.objs(num)) run[o.id] = reviewed ? 0 : this.objStatus(L, o);
    const best = P.mastery[num] || (P.mastery[num] = {});
    for (const k in run) best[k] = Math.max(best[k] || 0, run[k]);
    if (L.lrn.post) P.assess[num] = { ...(P.assess[num] || {}), post: { ...L.lrn.post, at: Date.now() } };
    Game.completeLevel(num, stars);
    const c = L.lrn.calib, A = P.assess[num] || {}, lines = [];
    if (reviewed) lines.push(tr('📖 <b>Režim opakovania</b>: niektoré otázky si preskočil(a), preto bez hviezdičiek a bez zvládnutých cieľov. Level sa ti aj tak otvoril ďalej.', '📖 <b>Review mode</b>: you skipped some questions, so no stars and no mastered goals. The next level opened anyway.', '📖 <b>Режим повторення</b>: ти пропустив(-ла) деякі питання, тому без зірок і без опанованих цілей. Наступний рівень однаково відкрито.'));
    if (this.objs(num).length) lines.push(`<b>${tr('🎯 Ciele', '🎯 Goals', '🎯 Цілі')}</b>${this.goalsHtml(num, run)}<small>${tr('✅ ukázané samostatne · 🟡 s pomocou alebo na druhý pokus · ⬜ ešte nie', '✅ shown on your own · 🟡 with help or on a second try · ⬜ not yet', '✅ показано самостійно · 🟡 з допомогою або з другої спроби · ⬜ ще ні')}</small>`);
    if (c.sure) lines.push(tr(`🎯 Sebadôvera: istý(-á) si bol(a) ${c.sure}× a mal(a) si pravdu ${c.sureOk}×.`, `🎯 Confidence: you were certain ${c.sure}× and right ${c.sureOk}×.`, `🎯 Упевненість: ти був(-ла) певен(-на) ${c.sure}× і мав(-ла) рацію ${c.sureOk}×.`));
    if (A.pre && L.lrn.post && A.pre.n) lines.push(tr(`📈 Rozohrievacie otázky pred levelom: ${A.pre.ok}/${A.pre.n} · prenosové otázky teraz: ${L.lrn.post.ok}/${L.lrn.post.n}`, `📈 Warm-up guesses before the level: ${A.pre.ok}/${A.pre.n} · transfer questions now: ${L.lrn.post.ok}/${L.lrn.post.n}`, `📈 Розминкові питання до рівня: ${A.pre.ok}/${A.pre.n} · питання на перенесення зараз: ${L.lrn.post.ok}/${L.lrn.post.n}`));
    const dueN = Object.values(P.review).filter((e) => e.lvl === num).length;
    if (dueN) lines.push(tr(`↻ ${dueN} otázok z tohto levelu sa ti vráti v rozcvičkách pri ďalších leveloch.`, `↻ ${dueN} questions from this level will come back in the warm-ups of later levels.`, `↻ ${dueN} питань із цього рівня повернуться в розминках наступних рівнів.`));
    return { stars, reviewed, card: lines.length ? { who: `🎯 ${L.mentor}`, face: L.face, text: lines.join('<br>') } : null };
  },

  // ---------- Kódex: precvič level ----------
  practice(num, n = 2) {
    const P = this.P, clock = P.clock;
    const due = Object.entries(P.review)
      .filter(([, e]) => e.due <= clock && e.snap)
      .sort((a, b) => a[1].due - b[1].due);
    const dueIds = new Set(due.map(([id]) => id));

    const currentDue = due.filter(([, e]) => e.lvl === num).map(([, e]) => this.rebuild(e.snap, { inReview: true, tag: `↻ L${num}` }));
    const otherDue = due.filter(([, e]) => e.lvl !== num).map(([, e]) => this.rebuild(e.snap, { inReview: true, tag: `↻ L${e.lvl}` }));

    // vlastné otázky levelu, ktoré ešte nie sú „due“ (tie sú už v currentDue) — inak by sa zdvojili
    const own = Object.entries(P.review).filter(([id, e]) => e.lvl === num && e.snap && !dueIds.has(id)).slice(0, n)
      .map(([, e]) => this.rebuild(e.snap, { inReview: true, tag: `↻ L${num}` }));
    const gen = this.transfer(num, 4, { practice: true, tag: `↻ L${num}` }).sort(() => rand() - 0.5);
    const traps = (TRAPS[num] || []).slice().sort(() => rand() - 0.5).map((q) => ({ ...q, practice: true, lvl: num, _order: null }));

    const pool = [...currentDue, ...otherDue, ...own, ...gen, ...traps];
    return pool.slice(0, n).map((q) => ({ ...q, ...this.spark() }));
  },
  testMe(num) {
    if (UI.busy) return UI.toast(tr('Najprv dokonči rozhovor.', 'Finish the conversation first.', 'Спершу заверши розмову.'));
    const list = this.practice(num, 2);
    if (!list.length) return;
    UI.toggleCodex(false);
    this.series(Game.scene, list, (k) => UI.toast(tr(`📖 Precvičenie levelu ${num}: ${k}/${list.length}`, `📖 Level ${num} practice: ${k}/${list.length}`, `📖 Вправа з рівня ${num}: ${k}/${list.length}`), 3200));
  },
  // 📄 Precvičovanie z prednášok: doplňovačky zo všetkých levelov podľa prednášky — nehodnotí sa (ani hviezdičky)
  drill(lec) {
    if (UI.busy) return UI.toast(tr('Najprv dokonči rozhovor.', 'Finish the conversation first.', 'Спершу заверши розмову.'));
    const D = this.P.drill, all = EqBlanks.lecture(lec).sort(() => rand() - 0.5).sort((a, b) => (D[a.id] ?? -1) - (D[b.id] ?? -1));
    const list = all.slice(0, 6).map((q) => ({ ...q, drill: true, who: tr(`📄 Prednáška ${lec}`, `📄 Lecture ${lec}`, `📄 Лекція ${lec}`), face: '📄' }));
    if (!list.length) return;
    UI.toggleCodex(false);
    let ok = 0, i = 0;
    const step = () => (i >= list.length ? UI.toast(tr(`📄 Prednáška ${lec}: ${ok}/${list.length} správne`, `📄 Lecture ${lec}: ${ok}/${list.length} correct`, `📄 Лекція ${lec}: ${ok}/${list.length} правильно`), 3600)
      : UI.blanks(list[i++], (r) => { if (r) ok++; step(); }));
    step();
  },

  // ---------- ⬇ export pre učiteľa ----------
  export() {
    const P = this.P, data = {
      game: 'Little Psi in the Quantum World', exported: new Date().toISOString(), lang: LANG, difficulty: Settings.diff,
      stars: P.stars, difficultyPerLevel: P.diff, mastery: P.mastery, assess: P.assess,
      items: P.stats, review: Object.fromEntries(Object.entries(P.review).map(([k, e]) => [k, { box: e.box, due: e.due, lvl: e.lvl }])),
      hints: P.hints, timesSec: P.times, drill: P.drill, clock: P.clock,
    };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = `little-psi-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    UI.toast(tr('Export successful!', 'Export successful!', 'Експорт успішний!'));
  },
};
