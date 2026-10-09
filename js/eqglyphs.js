'use strict';
// ∑ Rovnicové glyfy: každý symbol rovnice sa v type hry „Rovnice najprv“ nahradí vlastnou SVG ikonou.
// Jeden glyf nesie naraz viac mnemotechník:
//  farba = KTO · piktogram za písmenom = VÝZNAM (α šípka hore k |0⟩, θ sklon od vrcholu, π pol otáčky …)
//  · tvar rámu = DRUH (ket ⟩ hrot dopredu, bra zrkadlovo, operátor 3D krabička, pravdepodobnosť stĺp)
//  · poloha = HORE/DOLE (α a |0⟩ vyššie, β a |1⟩ nižšie) · zvuk pri prejdení myšou (vysoký tón |0⟩, nízky |1⟩)
//  · slovná pomôcka v bubline („Alfa ukazuje hore“, „X = preklopenie“, „T = Tenučká osmina otáčky“).

const EqG = {
  // ---------- kreslenie ----------
  // písmeno glyfu: tmavý obrys pod písmom, aby sa dalo čítať aj na piktograme
  L(t, x = 20, y = 30.5, fs = 30) {
    return `<text x="${x}" y="${y}" font-size="${fs}" text-anchor="middle" class="glt">${t}</text>`;
  },
  // piktogramy (viewBox 0 0 40 40, kreslí sa farbou currentColor)
  ICON: {
    up: '<circle cx="20" cy="20" r="16" class="gl-faint"/><path d="M20 30V6M14 12l6-7 6 7" class="gl-ic"/>',
    down: '<circle cx="20" cy="20" r="16" class="gl-faint"/><path d="M20 10v24M14 28l6 7 6-7" class="gl-ic"/>',
    ball: '<circle cx="20" cy="20" r="16" class="gl-faint"/><ellipse cx="20" cy="20" rx="16" ry="5" class="gl-faint"/><path d="M20 20L31 8M25 8.5l6-.5-.5 6" class="gl-ic"/>',
    tilt: '<path d="M20 3v34" class="gl-faint" stroke-dasharray="3 3"/><path d="M20 20L32 7" class="gl-ic"/><path d="M20 9a11 11 0 0 1 8 3" class="gl-ic gl-thin"/>',
    fan: '<ellipse cx="20" cy="31" rx="16" ry="5.5" class="gl-faint"/><path d="M6 32a16 5.5 0 0 0 26 2" class="gl-ic"/><path d="M29 36.5l3.5-2.6-4-1.6" class="gl-ic gl-thin"/>',
    gear: '<circle cx="20" cy="20" r="16" class="gl-ic gl-thin" stroke-dasharray="5 3"/><path d="M33 9l3 5-6 0M7 31l-3-5 6 0" class="gl-ic gl-thin"/>',
    table: '<rect x="6" y="6" width="14" height="14" class="gl-fill-a"/><rect x="20" y="20" width="14" height="14" class="gl-fill-b"/><path d="M6 6h28v28H6zM20 6v28M6 20h28" class="gl-faint"/><circle cx="27" cy="13" r="2.4" class="gl-dot"/><circle cx="13" cy="27" r="2.4" class="gl-dot"/>',
    step: '<path d="M4 34h9v-9h9v-9h9v-9h5" class="gl-faint gl-ic"/>',
    half: '<path d="M6 22a14 14 0 0 1 28 0" class="gl-ic"/><path d="M30 18l4 4 4-4" class="gl-ic gl-thin"/>',
    quarter: '<path d="M34 20a14 14 0 0 0-14-14" class="gl-ic"/><path d="M24 2l-4 4 4 4" class="gl-ic gl-thin"/><circle cx="20" cy="20" r="14" class="gl-faint"/>',
    clock: '<circle cx="20" cy="20" r="16" class="gl-faint"/><path d="M20 20L31 11" class="gl-ic"/><path d="M36 20a16 16 0 0 0-3-9" class="gl-ic gl-thin"/>',
    pillar: '<path d="M7 35V25M15 35V16M23 35V9" class="gl-bar"/><path d="M4 35.5h32" class="gl-faint"/>',
    frame: '<rect x="4" y="4" width="32" height="32" rx="2" class="gl-ic gl-thin"/><path d="M30 4v6h6" class="gl-faint"/>',
    axes: '<path d="M20 22V4M20 22h16M20 22l-12 10" class="gl-faint gl-ic"/>',
    vec: '<circle cx="20" cy="20" r="16" class="gl-faint"/><path d="M20 20L32 9M26 9l6 0 0 6" class="gl-ic"/><circle cx="20" cy="20" r="2" class="gl-dot"/>',
    needle: '<path d="M20 3l5 17-5 17-5-17z" class="gl-faint gl-ic"/><path d="M20 3l5 17h-10z" class="gl-fill"/>',
    detune: '<path d="M2 14q5-8 10 0t10 0 10 0 8-4" class="gl-faint gl-ic"/><path d="M2 30q5-8 10 0t10 0 10 0 8-4" class="gl-ic gl-thin" transform="translate(5 0)"/>',
    pulse: '<path d="M2 32h8q4-26 10-26t10 26h8" class="gl-faint gl-ic"/>',
    orbit: '<ellipse cx="20" cy="20" rx="16" ry="9" class="gl-faint"/><path d="M4 20a16 9 0 0 0 30 4" class="gl-ic"/><circle cx="20" cy="20" r="2.4" class="gl-dot"/>',
    hourglass: '<path d="M9 4h22M9 36h22M11 4q0 12 9 16 9-4 9-16M11 36q0-12 9-16 9 4 9 16" class="gl-faint gl-ic"/>',
    stack: '<path d="M6 8h28M6 16h22M6 24h26M6 32h18" class="gl-faint gl-ic"/>',
    rings: '<circle cx="14" cy="20" r="10" class="gl-ic"/><circle cx="26" cy="20" r="10" class="gl-ic"/>',
    shadowV: '<path d="M8 4v32" class="gl-faint"/><path d="M8 34L30 10" class="gl-ic gl-thin"/><path d="M30 10H8" class="gl-ic gl-thin" stroke-dasharray="2 2"/><path d="M8 10v24" class="gl-bar"/>',
    shadowH: '<path d="M4 34h32" class="gl-faint"/><path d="M6 34L30 10" class="gl-ic gl-thin"/><path d="M30 10v24" class="gl-ic gl-thin" stroke-dasharray="2 2"/><path d="M6 34h24" class="gl-bar"/>',
    cross: '<path d="M6 6l28 28M34 6L6 34" class="gl-faint gl-ic"/>',
    fog: '<path d="M8 28q-6 0-5-6t8-4q1-8 9-8t9 7q8-1 8 6t-7 5z" class="gl-faint gl-ic"/>',
    paths: '<path d="M4 34Q10 6 20 6T36 34" class="gl-faint gl-ic"/><path d="M4 34Q20 22 36 34" class="gl-ic gl-thin"/>',
    eye: '<path d="M3 20q17-16 34 0-17 16-34 0z" class="gl-faint gl-ic"/><circle cx="20" cy="20" r="5" class="gl-dot"/>',
  },
  // obrázky na prednej stene krabičky operátora (čo hradlo robí)
  OPIC: {
    X: '<path d="M30 15v16M27 18l3-4 3 4M27 28l3 4 3-4" class="gl-pic"/>',
    Y: '<path d="M30 15v16M27 18l3-4 3 4M27 28l3 4 3-4" class="gl-pic"/><path d="M33 22a3 3 0 1 1-1-2" class="gl-pic gl-thin"/>',
    Z: '<ellipse cx="29" cy="24" rx="5" ry="2.5" class="gl-pic"/><path d="M29 15v18" class="gl-pic gl-thin" stroke-dasharray="2 2"/>',
    H: '<path d="M24 32L35 15" class="gl-pic gl-thin" stroke-dasharray="2 2"/><path d="M26 18q6-3 8 3M33 29q-6 3-8-3" class="gl-pic"/>',
    S: '<path d="M34 24a5 5 0 0 0-5-5" class="gl-pic"/><circle cx="29" cy="24" r="5" class="gl-pic gl-thin" stroke-dasharray="1.5 2"/>',
    T: '<path d="M34 24a5 5 0 0 0-1.5-3.5" class="gl-pic"/><circle cx="29" cy="24" r="5" class="gl-pic gl-thin" stroke-dasharray="1.5 2"/>',
    I: '',
    Ĥ: '<path d="M31 14l-4 9h5l-4 9" class="gl-pic"/>',
    'H̃': '<path d="M31 14l-4 9h5l-4 9" class="gl-pic"/>',
    Â: '<path d="M24 24q5-6 10 0-5 6-10 0z" class="gl-pic"/><circle cx="29" cy="24" r="1.6" class="gl-dot"/>',
    U: '<path d="M33 22a4 4 0 1 0-1 4" class="gl-pic"/><path d="M33 17v5h-5" class="gl-pic gl-thin"/>',
  },
  // krabička operátora (izometrická kocka) s písmenom na prednej stene
  box(letter) {
    const pic = this.OPIC[letter] ?? this.OPIC.U, fs = letter.length > 1 ? 19 : 24;
    return '<path d="M2 12h32v25H2z" class="gl-boxf"/><path d="M2 12l7-7h32l-7 7zM34 12l7-7v25l-7 7z" class="gl-boxs"/>'
      + `<g transform="translate(-3 1)">${pic}</g>` + this.L(letter, 12, 32, fs);
  },
  // ket ⟩: zvislá čiara a hrot dopredu (stav, odpoveď); bra ⟨: zrkadlovo (otázka). Šírka podľa obsahu.
  ket(c, bra) {
    const w = 40 + Math.max(0, [...c].length - 1) * 11, mid = w / 2;
    const frame = bra ? `<path d="M10 4L3 20l7 16M${w - 4} 4v32" class="gl-ic"/>` : `<path d="M4 4v32M${w - 10} 4l7 16-7 16" class="gl-ic"/>`;
    const hint = c === '0' ? `<path d="M${mid - 4} 9l4-5 4 5" class="gl-ic gl-thin"/>` : c === '1' ? `<path d="M${mid - 4} 31l4 5 4-5" class="gl-ic gl-thin"/>`
      : c === '+' ? `<path d="M${mid + 7} 13l4 3-4 3" class="gl-ic gl-thin"/>` : c === '−' ? `<path d="M${mid - 7} 13l-4 3 4 3" class="gl-ic gl-thin"/>` : '';
    return { w, svg: frame + hint + this.L(c, mid, 29.5, [...c].length > 2 ? 16 : 27) };
  },

  // ---------- slovník: kľúč → [kategória (farba), piktogram, názov, slovná pomôcka] ----------
  D: null,
  dict() {
    if (this.D) return this.D;
    const t = tr;
    this.D = {
      'α': ['a', 'up', t('alfa — amplitúda |0⟩', 'alpha — amplitude of |0⟩', 'альфа — амплітуда |0⟩'), t('<b>Alfa ukazuje hore</b> — k |0⟩, severnému pólu. Stojí vyššie v rovnici.', '<b>Alpha points Above</b> — to |0⟩, the north pole. It sits higher in the equation.', '<b>Альфа вказує вгору</b> — до |0⟩, північного полюса. Стоїть вище в рівнянні.')],
      'β': ['b', 'down', t('beta — amplitúda |1⟩', 'beta — amplitude of |1⟩', 'бета — амплітуда |1⟩'), t('<b>Beta mieri dole</b> — k |1⟩, južnému pólu. Stojí nižšie v rovnici.', '<b>Beta goes Below</b> — to |1⟩, the south pole. It sits lower in the equation.', '<b>Бета дивиться вниз</b> — до |1⟩, південного полюса. Стоїть нижче в рівнянні.')],
      'ψ': ['ket', 'ball', t('psí — stav', 'psi — the state', 'псі — стан'), t('<b>Psí si ty</b>: šípka v guli, recept na všetky odpovede.', '<b>Psi is you</b>: an arrow in the ball, a recipe for every answer.', '<b>Псі — це ти</b>: стрілка в кулі, рецепт усіх відповідей.')],
      'Ψ': ['ket', 'ball', t('veľké psí — stav celku', 'capital psi — state of the whole', 'велике псі — стан цілого'), t('<b>Veľké Psí = celý systém</b> (viac qubitov naraz).', '<b>Big Psi = the whole system</b> (several qubits at once).', '<b>Велике Псі = уся система</b> (кілька кубітів разом).')],
      'θ': ['th', 'tilt', t('théta — sklon od pólu', 'theta — tilt from the pole', 'тета — нахил від полюса'), t('<b>Théta = naklonenie od vrcholu</b>: 0 hore pri |0⟩, π dole pri |1⟩. Určuje P(0), P(1).', '<b>Theta = Tilt from the Top</b>: 0 at |0⟩, π at |1⟩. It sets P(0), P(1).', '<b>Тета = нахил від верхівки</b>: 0 угорі при |0⟩, π унизу при |1⟩. Задає P(0), P(1).')],
      'φ': ['ph', 'fan', t('fí — relatívna fáza', 'phi — relative phase', 'фі — відносна фаза'), t('<b>Fí = otáčka okolo osi</b> ako lopatka ventilátora po rovníku. P v báze Z nezmení.', '<b>Phi = the Fan’s turn</b> around the axis, along the equator. It does not change P in the Z basis.', '<b>Фі = оберт вентилятора</b> навколо осі, вздовж екватора. P у базисі Z не змінює.')],
      'γ': ['g', 'gear', t('gama — globálna fáza', 'gamma — global phase', 'гамма — глобальна фаза'), t('<b>Gama = zlaté koleso</b>, ktoré točí všetko naraz — preto ho nevidno.', '<b>Gamma = the Gold Gear</b> that turns everything at once — that is why nobody sees it.', '<b>Гамма = золоте колесо</b>, що обертає все разом, — тому його не видно.')],
      ang: ['th', 'quarter', t('α — uhol otočenia', 'α — rotation angle', 'α — кут повороту'), t('<b>Tu je α uhol otočenia</b> (o koľko hradlo otočí guľu), nie amplitúda |0⟩ — preto ružová ako uhly.', '<b>Here α is a rotation angle</b> (how far the gate turns the ball), not the amplitude of |0⟩ — so it is pink like the angles.', '<b>Тут α — кут повороту</b> (на скільки гейт повертає кулю), а не амплітуда |0⟩, — тому рожева, як кути.')],
      gyro: ['k', 'orbit', t('gyromagnetický pomer', 'gyromagnetic ratio', 'гіромагнітне відношення'), t('<b>γ pri B = „otáčky na tesla“</b>: koľko precesie dá jeden tesla. Konštanta jadra (iná ako globálna fáza!).', '<b>γ next to B = “turns per tesla”</b>: how much precession one tesla gives. A constant of the nucleus (not the global phase!).', '<b>γ біля B = «оберти на тесла»</b>: скільки прецесії дає один тесла. Стала ядра (не глобальна фаза!).')],
      'ρ': ['coh', 'table', t('ró — matica hustoty', 'rho — density matrix', 'ро — матриця густини'), t('<b>Ró = rozpis stavu do tabuľky</b>: na diagonále šance (modrá, červená), mimo nej koherencie.', '<b>Rho = the Record table</b> of the state: chances on the diagonal (blue, red), coherences off it.', '<b>Ро = розклад стану в таблиці</b>: шанси на діагоналі (синя, червона), когерентності поза нею.')],
      'ħ': ['k', 'step', t('h s čiarou', 'h-bar', 'h з рискою'), t('<b>ħ = výška kvantového schodíka</b>. Konštanta: sivá a nehybná.', '<b>ħ = the height of the quantum step</b>. A constant: grey and still.', '<b>ħ = висота квантової сходинки</b>. Стала: сіра й нерухома.')],
      'π': ['k', 'half', t('pí — pol otáčky', 'pi — half a turn', 'пі — пів оберту'), t('<b>π = pol otáčky</b> (180°): z |0⟩ na |1⟩, z + na −.', '<b>π = half a turn</b> (180°): from |0⟩ to |1⟩, from + to −.', '<b>π = пів оберту</b> (180°): з |0⟩ у |1⟩, з + у −.')],
      i: ['ph', 'quarter', t('i — imaginárna jednotka', 'i — imaginary unit', 'i — уявна одиниця'), t('<b>i = štvrť otáčky</b> (90°). i·i = pol otáčky = −1.', '<b>i = a quarter turn</b> (90°). i·i = half a turn = −1.', '<b>i = чверть оберту</b> (90°). i·i = пів оберту = −1.')],
      exp: ['ph', 'clock', t('fázový faktor e^{i…}', 'phase factor e^{i…}', 'фазовий множник e^{i…}'), t('<b>e na i-čko = ručička hodín</b> otočená o uhol v exponente; dĺžka vždy 1.', '<b>e to the i = a clock hand</b> turned by the angle in the exponent; its length is always 1.', '<b>e в степені i = стрілка годинника</b>, повернута на кут з показника; довжина завжди 1.')],
      ket: ['ket', null, t('ket — stav', 'ket — a state', 'кет — стан'), t('<b>Ket ⟩ má hrot dopredu</b>: je to stav, odpoveď (stĺpec).', '<b>A ket ⟩ points forward</b>: it is a state, the answer (a column).', '<b>Кет ⟩ має вістря вперед</b>: це стан, відповідь (стовпець).')],
      ket0: ['ket', null, t('|0⟩ — severný pól', '|0⟩ — north pole', '|0⟩ — північний полюс'), t('<b>|0⟩ = hore</b> (šípka nad nulou). Odpoveď „0“, „spin hore“.', '<b>|0⟩ = up</b> (the tick above the zero). The answer “0”, “spin up”.', '<b>|0⟩ = угору</b> (риска над нулем). Відповідь «0», «спін угору».')],
      ket1: ['ket', null, t('|1⟩ — južný pól', '|1⟩ — south pole', '|1⟩ — південний полюс'), t('<b>|1⟩ = dole</b> (šípka pod jednotkou). Odpoveď „1“, „spin dole“.', '<b>|1⟩ = down</b> (the tick under the one). The answer “1”, “spin down”.', '<b>|1⟩ = униз</b> (риска під одиницею). Відповідь «1», «спін униз».')],
      ketpm: ['ket', null, t('|±⟩ — rovník', '|±⟩ — the equator', '|±⟩ — екватор'), t('<b>|+⟩ vpravo, |−⟩ vľavo</b> na rovníku: 50/50, líšia sa len fázou.', '<b>|+⟩ right, |−⟩ left</b> on the equator: 50/50, they differ only in phase.', '<b>|+⟩ праворуч, |−⟩ ліворуч</b> на екваторі: 50/50, різняться лише фазою.')],
      bra: ['ket', null, t('bra — otázka', 'bra — a question', 'бра — питання'), t('<b>Bra ⟨ je zrkadlo ketu</b>: hrot dozadu, je to otázka (riadok).', '<b>A bra ⟨ is a mirrored ket</b>: it points back, it is a question (a row).', '<b>Бра ⟨ — дзеркальний кет</b>: вістря назад, це питання (рядок).')],
      X: ['op', null, t('hradlo X', 'X gate', 'гейт X'), t('<b>X = preklopenie</b> 0 ↔ 1 (šípka hore-dole na krabičke).', '<b>X marks the flip</b>: 0 ↔ 1 (the up-down arrow on the box).', '<b>X = переворот</b> 0 ↔ 1 (стрілка вгору-вниз на коробці).')],
      Y: ['op', null, t('hradlo Y', 'Y gate', 'гейт Y'), t('<b>Y = preklopenie so závitom</b>: 0 ↔ 1 a k tomu fáza i.', '<b>Y = a flip with a twist</b>: 0 ↔ 1 plus the phase i.', '<b>Y = переворот із закрутом</b>: 0 ↔ 1 і ще фаза i.')],
      Z: ['op', null, t('hradlo Z', 'Z gate', 'гейт Z'), t('<b>Z = zvrtnutie okolo zvislej osi</b> o pol otáčky: mení len fázu, + ↔ −.', '<b>Z = a twist around the Zenith axis</b> by half a turn: only the phase changes, + ↔ −.', '<b>Z = закрут навколо вертикальної осі</b> на пів оберту: змінюється лише фаза, + ↔ −.')],
      H: ['op', null, t('Hadamardovo hradlo', 'Hadamard gate', 'гейт Адамара'), t('<b>H = Hadamard = výmena napoly</b>: z ↔ x, pól ↔ rovník (zrkadlo na krabičke).', '<b>H = Halfway swap</b>: z ↔ x, pole ↔ equator (the mirror on the box).', '<b>H = Адамар = обмін навпіл</b>: z ↔ x, полюс ↔ екватор (дзеркало на коробці).')],
      S: ['op', null, t('hradlo S', 'S gate', 'гейт S'), t('<b>S = Štvrť otáčky</b> okolo z (fáza +i).', '<b>S = a Small quarter turn</b> about z (phase +i).', '<b>S = чверть оберту</b> навколо z (фаза +i).')],
      T: ['op', null, t('hradlo T', 'T gate', 'гейт T'), t('<b>T = Tenučká osmina otáčky</b> okolo z (45°). T·T = S.', '<b>T = a Tiny eighth turn</b> about z (45°). T·T = S.', '<b>T = тоненька восьмушка оберту</b> навколо z (45°). T·T = S.')],
      I: ['op', null, t('identita', 'identity', 'тотожність'), t('<b>I = prázdna krabička</b>: nerobí nič.', '<b>I = Idle</b>: an empty box that does nothing.', '<b>I = порожня коробка</b>: нічого не робить.')],
      U: ['op', null, t('operátor / hradlo', 'operator / gate', 'оператор / гейт'), t('<b>Krabička = operátor</b>: pôsobí na to, čo stojí napravo od nej.', '<b>A box = an operator</b>: it acts on whatever stands to its right.', '<b>Коробка = оператор</b>: діє на те, що стоїть праворуч від неї.')],
      Ĥ: ['op', null, t('hamiltonián', 'Hamiltonian', 'гамільтоніан'), t('<b>Ĥ = motor energie</b> (blesk na krabičke): poháňa čas.', '<b>Ĥ = the energy engine</b> (the bolt on the box): it drives time.', '<b>Ĥ = двигун енергії</b> (блискавка на коробці): рухає час.')],
      Â: ['op', null, t('pozorovateľná', 'observable', 'спостережувана'), t('<b>Â = oko, ktoré sa pýta</b>: meraná veličina.', '<b>Â = an eye that asks</b>: a measured quantity.', '<b>Â = око, що питає</b>: вимірювана величина.')],
      P: ['P', 'pillar', t('pravdepodobnosť', 'probability', 'імовірність'), t('<b>P = stĺp pravdepodobnosti</b> od 0 do 100 %. Biela: fáza v nej už nie je.', '<b>P = a Pillar of probability</b> from 0 to 100 %. White: no phase left in it.', '<b>P = стовп імовірності</b> від 0 до 100 %. Білий: фази в ньому вже немає.')],
      sq: ['P', 'frame', t('štvorec absolútnej hodnoty', 'squared magnitude', 'квадрат модуля'), t('<b>|…|² = zarámovať a zmraziť</b>: z ručičky ostane len jej dĺžka na druhú, fáza zmizne.', '<b>|…|² = frame it and freeze it</b>: only the hand’s length squared remains, the phase is gone.', '<b>|…|² = оправити й заморозити</b>: від стрілки лишається тільки квадрат довжини, фаза зникає.')],
      'σ': ['ket', 'axes', t('sigma — Pauliho matice', 'sigma — Pauli matrices', 'сигма — матриці Паулі'), t('<b>σ = tri osi spinu</b> x, y, z naraz.', '<b>σ = the three spin axes</b> x, y, z together.', '<b>σ = три осі спіну</b> x, y, z разом.')],
      r: ['ket', 'vec', t('Blochov vektor', 'Bloch vector', 'вектор Блоха'), t('<b>r = rádius-šípka</b> v Blochovej guli; |r| = 1 čistý, kratšia = zmes.', '<b>r = the radius arrow</b> in the Bloch ball; |r| = 1 pure, shorter = mixture.', '<b>r = стрілка-радіус</b> у кулі Блоха; |r| = 1 чистий, коротша = суміш.')],
      n: ['g', 'needle', t('smer otázky', 'direction of the question', 'напрямок питання'), t('<b>n = zlatá ihla kompasu</b>: smer, na ktorý sa pýtame.', '<b>n = the golden compass needle</b>: the direction we ask about.', '<b>n = золота стрілка компаса</b>: напрямок, про який питаємо.')],
      'Δ': ['ph', 'detune', t('rozladenie', 'detuning', 'розстроювання'), t('<b>Δ = rozdiel dvoch tónov</b>: o koľko je rádio vedľa rezonancie.', '<b>Δ = the Difference of two tones</b>: how far the radio is off resonance.', '<b>Δ = різниця двох тонів</b>: наскільки радіо поза резонансом.')],
      'Ω': ['th', 'pulse', t('Rabiho frekvencia', 'Rabi frequency', 'частота Рабі'), t('<b>Ω = sila tlaku impulzu</b>: ako rýchlo sa mení sklon θ.', '<b>Ω = how hard the pulse pushes</b>: how fast the tilt θ changes.', '<b>Ω = сила поштовху імпульсу</b>: як швидко змінюється нахил θ.')],
      'ω': ['ph', 'orbit', t('omega — uhlová frekvencia', 'omega — angular frequency', 'омега — кутова частота'), t('<b>ω = ako rýchlo šípka krúži</b> (precesia).', '<b>ω = how fast the arrow circles</b> (precession).', '<b>ω = як швидко стрілка кружляє</b> (прецесія).')],
      '∂': ['k', 'hourglass', t('derivácia', 'derivative', 'похідна'), t('<b>∂/∂t = presýpacie hodiny</b>: ako rýchlo sa to mení v čase.', '<b>∂/∂t = the hourglass</b>: how fast it changes in time.', '<b>∂/∂t = пісочний годинник</b>: як швидко це змінюється в часі.')],
      'Σ': ['k', 'stack', t('suma', 'sum', 'сума'), t('<b>Σ = navŕš všetko</b> na jednu kopu (sčítaj).', '<b>Σ = stack it all up</b> (add).', '<b>Σ = склади все докупи</b> (додай).')],
      '⊗': ['k', 'rings', t('tenzorový súčin', 'tensor product', 'тензорний добуток'), t('<b>⊗ = dva spojené krúžky</b>: systémy vedľa seba (rozmery sa násobia).', '<b>⊗ = two linked rings</b>: systems side by side (dimensions multiply).', '<b>⊗ = два зчеплені кільця</b>: системи поруч (розмірності множаться).')],
      cos: ['k', 'shadowV', t('kosínus', 'cosine', 'косинус'), t('<b>cos = tieň na zvislej osi</b> — podiel |0⟩.', '<b>cos = the shadow on the vertical axis</b> — the share of |0⟩.', '<b>cos = тінь на вертикальній осі</b> — частка |0⟩.')],
      sin: ['k', 'shadowH', t('sínus', 'sine', 'синус'), t('<b>sin = tieň na vodorovnej rovine</b> — podiel |1⟩.', '<b>sin = the shadow on the horizontal plane</b> — the share of |1⟩.', '<b>sin = тінь на горизонтальній площині</b> — частка |1⟩.')],
      det: ['k', 'cross', t('determinant', 'determinant', 'визначник'), t('<b>det = prekríž uhlopriečky</b>: súčin mínus súčin. Nula = produkt, inak previazanie.', '<b>det = cross the diagonals</b>: product minus product. Zero = product, otherwise entangled.', '<b>det = перехрести діагоналі</b>: добуток мінус добуток. Нуль = добуток, інакше сплутаність.')],
      p: ['m', 'fog', t('sila dekoherencie', 'decoherence strength', 'сила декогеренції'), t('<b>p = hmla prostredia</b>: koľko z fázy odnesie okolie.', '<b>p = the fog of the environment</b>: how much phase the surroundings carry away.', '<b>p = туман довкілля</b>: скільки фази забирає оточення.')],
      t: ['k', 'clock', t('čas', 'time', 'час'), t('<b>t = hodiny</b>.', '<b>t = the clock</b>.', '<b>t = годинник</b>.')],
      A: ['c', 'paths', t('amplitúda cesty', 'path amplitude', 'амплітуда шляху'), t('<b>A = cesta</b>: každá cesta k výsledku nesie svoju ručičku; sčítavajú sa.', '<b>A = a path</b>: every path to an outcome carries its own hand; they add up.', '<b>A = шлях</b>: кожен шлях до результату несе свою стрілку; вони додаються.')],
    };
    return this.D;
  },

  // ---------- jeden glyf ----------
  svg(key, letter) {
    const D = this.dict()[key];
    let body, w = 40;
    if (D && D[0] === 'op') { w = 44; body = this.box(letter); }
    else if (key.startsWith('ket') || key === 'bra') ({ w, svg: body } = this.ket(letter, key === 'bra'));
    else if (key === 'exp') { w = 44; body = `<g class="gi">${this.ICON.clock}</g>` + this.L('e', 13, 35, 26) + `<text x="29" y="17" font-size="${letter.length > 3 ? 11 : 15}" text-anchor="middle" class="glt">${letter}</text>`; }
    else if (key === 'sq') { body = this.ICON.frame + this.L(letter, 18, 30, 26) + '<text x="33" y="15" font-size="13" text-anchor="middle" class="glt">2</text>'; }
    else if (key === 'cos' || key === 'sin' || key === 'det') { w = 54; body = `<g transform="translate(7 0)">${this.ICON[D[1]]}</g>` + this.L(key, 27, 28, 20); }
    else body = `<g class="gi">${D && D[1] ? this.ICON[D[1]] : ''}</g>` + this.L(letter, 20, 30.5, [...letter].length > 1 ? 20 : 30);
    return `<svg viewBox="0 0 ${w} 40" style="width:${(w / 40 * 1.45).toFixed(2)}em" aria-hidden="true">${body}</svg>`;
  },
  esc: (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  html(key, letter, extraCls = '') {
    const D = this.dict()[key] || this.dict().U, cat = key === 'sq' ? (letter === 'α' ? 'a' : letter === 'β' ? 'b' : 'P') : key === 'exp' && /γ/.test(letter) ? 'g' : D[0];
    const svg = this.svg(key, letter);
    const tip = `<div class="gtip"><span class="gly big g-${cat}">${svg}</span><div><b>${D[2]}</b><br>${D[3]}</div></div>`;
    const pos = key === 'α' || key === 'ket0' ? ' up' : key === 'β' || key === 'ket1' ? ' dn' : '';
    return `<span class="gly g-${cat}${pos}${extraCls}" data-g="${key}" data-tip="${this.esc(tip)}">${svg}</span>`;
  },

  // ---------- text → glyfy (rovnice na javisku aj symboly v dialógoch) ----------
  // math: celé je to vzorec (javisko) — vtedy aj samostatné I, i, n, r, p, t sú symboly
  glyphify(html, math = false) {
    const marks = [], mark = (h) => `\u0001${marks.push(h) - 1}\u0002`;
    let s = String(html).replace(/e<sup>([^<]{1,10})<\/sup>/g, (m, x) => mark(this.html('exp', x)));
    let depth = 0;
    s = s.split(/(<[^>]+>)/).map((seg) => {
      if (seg.startsWith('<')) { if (/^<svg/i.test(seg)) depth++; else if (/^<\/svg/i.test(seg)) depth--; return seg; }
      if (depth > 0 || !seg) return seg;
      // ⟨a|ψ⟩: bra a ket zdieľajú zvislú čiaru — rozdelia sa na dva glyfy (otázka · odpoveď)
      seg = seg.replace(/⟨([^⟨|\s]{1,4})\|([^|⟩\s]{1,4})⟩/g, (m, a, b) => mark(this.html('bra', a)) + mark(this.html(b === '0' ? 'ket0' : b === '1' ? 'ket1' : 'ket', b)));
      const RE = math
        ? /(\|[^|⟩\s]{1,4}⟩)|(⟨[^⟨|\s]{1,4}\|)|\|([αβ])\|²|(H̃|[ĤÂ])|(?<![\p{L}])(cos|sin|det)(?![\p{L}])|([αβθφγψΨρσΔΩωħπ∂Σ⊗])|(P)(?=\()|(A)(?=[₁₂])|(?<![\p{L}\p{N}])([HXYZSTUInrtp])(?![\p{L}\p{N}])|(?<![\p{L}])(i)(?![\p{L}])/gu
        : /(\|[^|⟩\s]{1,4}⟩)|(⟨[^⟨|\s]{1,4}\|)|\|([αβ])\|²|(H̃|[ĤÂ])|(?<![\p{L}])(cos|sin|det)(?![\p{L}])|([αβθφγψΨρσΔΩωħπ∂Σ⊗])|(P)(?=\()|(A)(?=[₁₂])|(?<![\p{L}\p{N}])([HXYZSTU])(?![\p{L}\p{N}])|(?<=[\d·−+(])(i)(?![\p{L}])/gu;
      return seg.replace(RE, (m, ket, bra, sq, hat, fn, greek, P, A, op, im, off, all) => {
        if (ket) { const c = ket.slice(1, -1); return mark(this.html(c === '0' ? 'ket0' : c === '1' ? 'ket1' : c === '+' || c === '−' ? 'ketpm' : 'ket', c)); }
        if (bra) return mark(this.html('bra', bra.slice(1, -1)));
        if (sq) return mark(this.html('sq', sq));
        if (hat) return mark(this.html(hat, hat));
        if (fn) return mark(this.html(fn, fn));
        if (greek) {
          if (greek === 'α' && /\($/.test(all.slice(0, off)) && /^[)/]/.test(all.slice(off + 1))) return mark(this.html('ang', 'α')); // R(α), cos(α/2): uhol
          if (greek === 'γ' && /^\s*(B|\/\s*2|\/2π)/.test(all.slice(off + 1))) return mark(this.html('gyro', 'γ')); // γB₀, γ/2π = gyromagnetický pomer
          return mark(this.html(greek, greek));
        }
        if (P) return mark(this.html('P', 'P'));
        if (A) return mark(this.html('A', 'A'));
        if (op) {
          // slovenské predložky „Z“, „S“ na začiatku vety nie sú hradlá
          if (!math && /(^|[.!?:]\s*)$/.test(all.slice(0, off)) && /^\s+\p{Ll}/u.test(all.slice(off + 1))) return m;
          if (op === 'T' && /(\/|\d\s?)$/.test(all.slice(0, off))) return m; // tesla (MHz/T, 1 T), nie hradlo T
          // v NMR a vo výkladoch (levely 6, 8) je H hamiltonián, inde Hadamardovo hradlo
          if (op === 'H' && Game.scene && [6, 8].includes(Game.scene.num)) return mark(this.html('Ĥ', 'H'));
          return mark(this.html(op, op));
        }
        if (im) return mark(this.html('i', 'i'));
        return m;
      });
    }).join('');
    return s.replace(/\u0001(\d+)\u0002/g, (m, i) => marks[+i]);
  },

  // ---------- vzorce vo vetách → zvýraznené „čipy“ rovnice (oba typy hry) ----------
  // beh vzorca = symboly (kety, grécke písmená, samostatné písmená, cos/sin/Re/Im) a matematické znaky;
  // obalí sa, len ak obsahuje vzťah (=, ≈, →, ⇒, ≥, ≤, ∼) a aspoň jeden symbol
  wrapInline(html) {
    const ATOM = String.raw`\|[^|⟩\s<]{1,5}⟩|⟨[^⟨|\s<]{1,4}\||[αβθφγψΨρσΔΩωħπ∂Σ⊗]|(?<![\p{L}])(?:cos|sin|Re|Im|Tr|det|[A-Za-z])(?![\p{L}])`;
    const RUN = new RegExp(String.raw`(?:${ATOM}|\u0004\d+\u0005|[=+−\-·×/()²³½¼¾√≈≥≤→⇒∼*'′|0-9.,₀-₉ ])+`, 'gu');
    const atomRe = new RegExp(ATOM + String.raw`|\u0004`, 'u');
    // krátke horné/dolné indexy (e<sup>iφ</sup>, B<sub>0</sub>) sú súčasťou vzorca — dočasne bez značiek
    const subs = [];
    html = String(html).replace(/<(sup|sub)>([^<]{1,14})<\/\1>/g, (m) => `\u0004${subs.push(m) - 1}\u0005`);
    let inEq = 0, inChip = 0;
    return html.split(/(<[^>]+>)/).map((seg) => {
      if (seg.startsWith('<')) {
        if (/^<div[^>]*class="[^"]*\beqb\b/.test(seg)) inEq = 1; else if (inEq && /^<\/div/.test(seg)) inEq = 0;
        if (/^<span[^>]*class="[^"]*\beqi\b/.test(seg)) inChip = 1; else if (inChip && /^<span/.test(seg)) inChip++; else if (inChip && /^<\/span/.test(seg)) inChip--;
        return seg;
      }
      if (inEq || inChip || !seg.trim()) return seg;
      return seg.replace(RUN, (run) => {
        // okraje: medzery, interpunkcia a nespárované zátvorky ostanú mimo čipu
        let core = run, prev;
        do { // opakovane: medzery a interpunkcia, nespárované zátvorky, vzťahový znak bez ľavej/pravej strany
          prev = core;
          core = core.replace(/^[\s,.]+/, '').replace(/[\s,.]+$/, '').replace(/^\)+/, '').replace(/\(+$/, '');
          const open = (core.match(/\(/g) || []).length, close = (core.match(/\)/g) || []).length;
          if (close > open && core.endsWith(')')) core = core.slice(0, -1);
          if (open > close && core.startsWith('(')) core = core.slice(1);
          core = core.replace(/^[=≈→⇒≥≤∼+·×/−-]+/, '').replace(/[=≈→⇒≥≤∼+·×/−-]+$/, '');
        } while (core !== prev);
        if (core.length < 5 || !/[=≈→⇒≥≤∼]/.test(core) || !atomRe.test(core)) return run;
        const i = run.indexOf(core);
        return `${run.slice(0, i)}<span class="eqi">${core}</span>${run.slice(i + core.length)}`;
      });
    }).join('').replace(/\u0004(\d+)\u0005/g, (m, i) => subs[+i]);
  },

  // ---------- zvuková mnemotechnika: tón podľa toho, KTO je symbol ----------
  chime(key) {
    const now = performance.now();
    if (now - (this.lastChime || 0) < 140 || !Sound.ctx || Settings.audio.muted || Settings.audio.sfx <= 0 || Sound.ctx.state !== 'running') return;
    this.lastChime = now;
    const T = (f, d, o) => Sound.tone(f, d, { gain: 0.045, ...o });
    const cat = (this.dict()[key] || [])[0];
    if (key === 'α' || key === 'ket0') T(1046.5, 0.25, { type: 'triangle' });                  // vysoko = hore = |0⟩
    else if (key === 'β' || key === 'ket1') T(261.6, 0.3, { type: 'triangle' });              // nízko = dole = |1⟩
    else if (key === 'θ') T(880, 0.3, { to: 440 });                                           // sklon = klesajúci tón
    else if (key === 'φ' || key === 'exp' || key === 'i') T(660, 0.3, { to: 990 });          // fáza = otočka nahor
    else if (key === 'γ') { T(1318, 0.5, { rev: 1, gain: 0.03 }); T(1661, 0.5, { rev: 1, gain: 0.02, at: 0.05 }); }
    else if (cat === 'op') { Sound.noise(0.03, { f: 2400, gain: 0.04 }); T(330, 0.12, { type: 'square', gain: 0.025, lp: 900 }); }
    else if (cat === 'P') T(1568, 0.6, { rev: 1, gain: 0.03 });                              // zvonček pravdepodobnosti
    else if (cat === 'coh') { T(523, 0.4, { gain: 0.03 }); T(659, 0.4, { gain: 0.03, at: 0.08 }); }
    else if (cat === 'ket') { T(784, 0.18, { type: 'triangle' }); T(1046, 0.18, { type: 'triangle', at: 0.06 }); }
    else T(110, 0.15, { lp: 400 });                                                           // konštanta: tupý ťuk
  },
  initSound() {
    document.addEventListener('pointerover', (e) => {
      const g = e.target.closest && e.target.closest('.gly');
      if (g && g !== this.lastHover) { this.lastHover = g; this.chime(g.dataset.g); }
      else if (!g) this.lastHover = null;
    });
  },

  // slovník všetkých glyfov (kľúč mnemotechniky)
  dictionaryHtml() {
    const D = this.dict(), sample = { ket: 'ψ', ket0: '0', ket1: '1', ketpm: '+', bra: 'a', exp: 'iφ', sq: 'α', cos: 'cos', sin: 'sin', det: 'det' };
    return Object.keys(D).map((k) => `<div class="gd"><span class="gly big g-${k === 'sq' ? 'a' : D[k][0]}">${this.svg(k, sample[k] ?? k)}</span><div><b>${D[k][2]}</b><small>${D[k][3]}</small></div></div>`).join('');
  },
};
