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
  // všetky písmená glyfov stoja na spoločnej účarí y = 30.5 (z 40) — CSS ju zarovná s účarím okolitého textu
  BASE: 30.5,
  // skutočná šírka písma (rovnaké písmo ako v SVG), uložená do medzipamäte → glyf je presne taký široký ako jeho písmeno
  lw(t, fs = 30) {
    const k = fs + t;
    this._w = this._w || {};
    if (this._w[k] == null) {
      const c = (this._cx = this._cx || document.createElement('canvas').getContext('2d'));
      c.font = `700 ${fs}px "Cambria Math", "STIX Two Math", Georgia, serif`;
      this._w[k] = c.measureText(t).width;
    }
    return this._w[k];
  },
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
      + `<g transform="translate(-3 1)">${pic}</g>` + this.L(letter, 12, this.BASE, fs);
  },
  // ket ⟩: zvislá čiara a hrot dopredu (stav, odpoveď); bra ⟨: zrkadlovo (otázka). Šírka podľa obsahu.
  ket(c, bra) {
    const fs = [...c].length > 2 ? 16 : 27, inner = Math.max(12, this.lw(c, fs) + 3);
    const w = bra ? inner + 18 : inner + 18, mid = bra ? 11 + inner / 2 : 6 + inner / 2; // zvislá čiara 2 j., hrot 9 j.

    const frame = bra ? `<path d="M9 4L2 20l7 16M${w - 3} 4v32" class="gl-ic"/>` : `<path d="M3 4v32M${w - 9} 4l7 16-7 16" class="gl-ic"/>`;
    const hint = c === '0' ? `<path d="M${mid - 4} 9l4-5 4 5" class="gl-ic gl-thin"/>` : c === '1' ? `<path d="M${mid - 4} 31l4 5 4-5" class="gl-ic gl-thin"/>`
      : c === '+' ? `<path d="M${mid + 7} 13l4 3-4 3" class="gl-ic gl-thin"/>` : c === '−' ? `<path d="M${mid - 7} 13l-4 3 4 3" class="gl-ic gl-thin"/>` : '';
    return { w, svg: frame + hint + this.L(c, mid, this.BASE, fs) };
  },

  // ---------- slovník: kľúč → [kategória (farba), piktogram, názov, slovná pomôcka] ----------
  D: null,
  dict() {
    if (this.D) return this.D;
    const t = tr;
    this.D = {
      'α': ['a', 'up', t('alfa — amplitúda |0⟩', 'alpha — amplitude of |0⟩', 'альфа — амплітуда |0⟩'), t('<b>Alfa ukazuje hore</b> — k |0⟩, severnému pólu.', '<b>Alpha points Above</b> — to |0⟩, the north pole.', '<b>Альфа вказує вгору</b> — до |0⟩, північного полюса.')],
      'β': ['b', 'down', t('beta — amplitúda |1⟩', 'beta — amplitude of |1⟩', 'бета — амплітуда |1⟩'), t('<b>Beta mieri dole</b> — k |1⟩, južnému pólu.', '<b>Beta goes Below</b> — to |1⟩, the south pole.', '<b>Бета дивиться вниз</b> — до |1⟩, південного полюса.')],
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
    else if (key === 'exp') { w = 44; body = `<g class="gi">${this.ICON.clock}</g>` + this.L('e', 13, this.BASE, 26) + `<text x="29" y="13" font-size="${letter.length > 3 ? 11 : 15}" text-anchor="middle" class="glt">${letter}</text>`; }
    else if (key === 'sq') { body = this.ICON.frame + this.L(letter, 18, this.BASE, 26) + '<text x="33" y="15" font-size="13" text-anchor="middle" class="glt">2</text>'; }
    else if (key === 'cos' || key === 'sin' || key === 'det') { w = Math.ceil(this.lw(key, 20) + 4); body = `<g transform="translate(${(w - 40) / 2} 0)">${this.ICON[D[1]]}</g>` + this.L(key, w / 2, this.BASE, 20); }
    else {
      // jedno písmeno: šírka glyfu = šírka písmena (piktogram smie presahovať) → žiadna prázdna medzera po stranách
      const cw = Math.max(10, Math.ceil(this.lw(letter, [...letter].length > 1 ? 20 : 30) + 2));
      // piktogram sa zmenší na šírku písmena (+ malý presah), aby nezasahoval do susedných symbolov
      const sc = Math.min(1, Math.max(0.5, (cw + 4) / 32)).toFixed(3);
      body = `<g class="gi"><g transform="translate(20 20) scale(${sc}) translate(-20 -20)">${D && D[1] ? this.ICON[D[1]] : ''}</g></g>` + this.L(letter, 20, this.BASE, [...letter].length > 1 ? 20 : 30);
      return `<svg viewBox="${20 - cw / 2} 0 ${cw} 40" style="aspect-ratio:${cw}/40" aria-hidden="true">${body}</svg>`;
    }
    return `<svg viewBox="0 0 ${w} 40" style="aspect-ratio:${w}/40" aria-hidden="true">${body}</svg>`;
  },
  esc: (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  html(key, letter, extraCls = '') {
    const D = this.dict()[key] || this.dict().U, cat = key === 'sq' ? (letter === 'α' ? 'a' : letter === 'β' ? 'b' : 'P') : key === 'exp' && /γ/.test(letter) ? 'g' : D[0];
    const svg = this.svg(key, letter);
    const tip = `<div class="gtip"><span class="gly big g-${cat}">${svg}</span><div><b>${D[2]}</b><br>${D[3]}</div></div>`;
    return `<span class="gly g-${cat}${extraCls}" data-g="${key}" data-tip="${this.esc(tip)}">${svg}</span>`;
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
      seg = seg.replace(/⟨([^⟨|\s]{1,4})\|([^|⟩\s]{1,4})⟩/g, (m, a, b) => mark(this.html('bra', a)) + mark(this.html(b === '0' ? 'ket0' : b === '1' ? 'ket1' : 'ket', b).split('M3 4v32').join('')));
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
          if (greek === 'α' && (all[off + 1] === '\u2060' || (/\($/.test(all.slice(0, off)) && /^[)/]/.test(all.slice(off + 1))))) return mark(this.html('ang', 'α')); // R(α), cos(α/2): uhol
          if (greek === 'γ' && (all[off + 1] === '\u2061' || /^\s*(B|\/\s*2|\/2π)/.test(all.slice(off + 1)))) return mark(this.html('gyro', 'γ')); // γB₀, γ/2π = gyromagnetický pomer
          return mark(this.html(greek, greek));
        }
        if (P) return mark(this.html('P', 'P'));
        if (A) return mark(this.html('A', 'A'));
        if (op) {
          // slovenské predložky „Z“, „S“ na začiatku vety nie sú hradlá
          if (!math && /(^|[.!?:]\s*)$/.test(all.slice(0, off)) && /^\s+\p{Ll}/u.test(all.slice(off + 1))) return m;
          if (op === 'T' && (all[off + 1] === '\u2063' || /(\/|\d\s?)$/.test(all.slice(0, off)))) return m; // tesla (MHz/T, 1 T), nie hradlo T
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
  // Beh vzorca = symboly (kety, grécke písmená, samostatné písmená, cos/sin/Re/Im) a matematické znaky; obalí sa,
  // len ak obsahuje vzťah (=, ≈, →, ⇒, ≥, ≤, ∼) a aspoň jeden symbol. Riadkové značky (<b>, <i>, <sup>, <sub>, <span>)
  // sú vo vnútri vzorca priehľadné; hranice čipu sa posunú tak, aby značky zostali správne vnorené (čip sa nikdy neroztrhne).
  INLINE_TAG: /^<\/?(b|i|em|strong|sup|sub|small|span)\b/i,
  wrapInline(html) {
    const LT = 'A-Za-zÀ-ĦĨ-žА-яІіЇїЄєҐґ'; // písmená slov (grécke nie — tie sú vždy symboly)
    // atómy: ⟨Z⟩ / ⟨a|b⟩, kety, bra, grécke písmená (aj s prilepeným indexom: δij, σA, ΩR), funkcie, samostatné písmená
    // a dvojpísmenové premenné (Sz, Rz, cn), ak za nimi hneď nasleduje matematika — slovenské „a, v, o, u“ nie sú premenné,
    // ani predložky „z, s, k“ pred ketom či zátvorkou („z |00⟩“, „z [x, p]“)
    const ATOM = String.raw`⟨[^⟨⟩\s<]{1,7}⟩|\|[^|⟩\s<]{1,5}⟩|⟨[^⟨|\s<]{1,4}\||[\u0391-\u03A9\u03B1-\u03C9ϑϕϵħ∂Σ⊗∇ℂ](?:[A-Za-z]{1,2}(?![${LT}]))?`
      + String.raw`|(?<![${LT}])(?![zsk][\s\u00a0]+[[(⟨|])(?:cos|sin|tan|exp|Re|Im|Tr|det|[A-Z][A-Za-z](?=\s?[(=⟩|₀-₉0-9×·/≥≤≈→⇒*+−)^])|[a-z]{2}(?=[=(])|(?![aouvAOUV](?![₀-₉]))[A-Za-z])(?![${LT}])`;
    const RUN = new RegExp(String.raw`(?:${ATOM}|[\uE002=+−\-·×/()²³½¼¾√≈≥≤→⇒∼≠≡↔⇔∝±%°⁺⁻⁰¹⁴-⁹†^{}\[\]⟨⟩∞*'′_|0-9.,₀-₉  ])+`, 'gu');
    const atomRe = new RegExp(ATOM + String.raw`|\uE002`, 'u');
    // bloky rovníc a výrazy sa vyfarbia celé naraz (aby e<sup>…</sup> a pod. zostali pohromade); čipy sa v nich nehľadajú
    html = String(html).replace(/(<div[^>]*class="[^"]*\b(?:eqb|expr)\b[^"]*"[^>]*>)([\s\S]*?)(<\/div>)/g, (m, o, inner, c) => o + this.colorMath(inner) + c);
    const parts = html.replace(/&nbsp;/g, ' ').split(/(<[^>]+>)/);
    // plochý text: značka = jeden znak  (priehľadná) alebo  (hranica); každý znak pozná svoj diel a posun
    let F = '';
    const own = [], offs = [];
    let skip = 0, script = 0; // skip: blok rovnice, výraz, čip, glyf (len vyfarbiť); script: vnútri <sup>/<sub> je všetko súčasť vzorca (\uE002)
    const skipOpen = (t) => /^<div[^>]*class="[^"]*\b(eqb|expr)\b/.test(t) || /^<span[^>]*class="[^"]*\b(eqi|gly)\b/.test(t) || /^<svg/i.test(t);
    const tagName = (t) => (t.match(/^<\/?([a-z0-9]+)/i) || [])[1]?.toLowerCase();
    const stack = [];
    parts.forEach((p, k) => {
      if (p.startsWith('<')) {
        const nm = tagName(p), closing = p.startsWith('</'), selfClose = /\/>$/.test(p) || ['br', 'img', 'hr', 'input'].includes(nm);
        if (nm === 'sup' || nm === 'sub') script += closing ? -1 : 1;
        if (!closing && !selfClose) { stack.push({ nm, skip: skipOpen(p) }); if (skipOpen(p)) skip++; }
        else if (closing) { for (let j = stack.length - 1; j >= 0; j--) if (stack[j].nm === nm) { if (stack[j].skip) skip--; stack.length = j; break; } }
        F += !skip && this.INLINE_TAG.test(p) && !skipOpen(p) ? '' : ''; own.push(k); offs.push(-1);
        return;
      }
      for (let i = 0; i < p.length; i++) { F += skip ? '' : script > 0 && p.length <= 14 ? '\uE002' : p[i]; own.push(k); offs.push(i); }
    });
    const PH = /^[\s ]*$/; // len značky a medzery
    // párová značka k značke na pozícii i (rovnaké meno, s ohľadom na vnorenie); dir = +1 dopredu, −1 dozadu
    const mate = (i, dir) => {
      const nm = tagName(parts[own[i]]);
      let d = 0;
      for (let j = i + dir; j >= 0 && j < F.length; j += dir) {
        if (F[j] !== '' || tagName(parts[own[j]]) !== nm) continue;
        const cl = parts[own[j]].startsWith('</');
        if (dir > 0 ? !cl : cl) d++; else if (d) d--; else return j;
      }
      return -1;
    };
    // znamienko na začiatku vzorca (−1 = e^{iπ}) zostane, ak sa ho priamo drží číslo alebo symbol
    const sign = (a, b) => /[−+±-]/.test(F[a]) && a + 1 < b && !/[\s ,.=≈→⇒≥≤∼≠≡↔⇔∝+·×/−-]/.test(F[a + 1]);
    const trim = (a, b) => {
      let prev;
      do {
        prev = a + ':' + b;
        while (a < b && /[\s ,.=≈→⇒≥≤∼≠≡↔⇔∝+·×/−-]/.test(F[a]) && !sign(a, b)) a++;
        while (b > a && /[\s ,.=≈→⇒≥≤∼≠≡↔⇔∝+·×/−-]/.test(F[b - 1])) b--;
        // zátvorky (), [], {} musia byť v čipe spárované: nespárovaná na okraji odpadne, vo vnútri čip pri nej skončí (začne za ňou)
        const st = [];
        let cut = -1;
        for (let i = a; i < b && cut < 0; i++) {
          const o = '([{'.indexOf(F[i]), c = ')]}'.indexOf(F[i]);
          if (o >= 0) st.push([i, o]);
          else if (c >= 0) { if (st.length && st[st.length - 1][1] === c) st.pop(); else cut = i; }
        }
        if (cut >= 0) { if (cut === b - 1) b--; else a = cut + 1; }
        else if (st.length) { if (st[0][0] === a) a++; else b = st[0][0]; }
      } while (prev !== a + ':' + b);
      return [a, b];
    };
    const ins = []; // [pozícia vo F, '\u0006' začiatok | '\u0007' koniec]
    const chip = (at, end) => {
      let [a, b] = trim(at, end), prev;
      do {
        prev = a + ':' + b;
        // vnorenie: nespárovaná zatváracia značka → ak jej otváracia tesne predchádza, čip ju zahrnie, inak začne za ňou
        for (let i = a; i < b; i++) {
          if (F[i] !== '' || !parts[own[i]].startsWith('</')) continue;
          const j = mate(i, -1);
          if (j >= a) continue;
          if (j >= 0 && PH.test(F.slice(j + 1, a))) a = j; else a = i + 1;
        }
        // nespárovaná otváracia → ak jej zatváracia tesne nasleduje, čip ju zahrnie, inak skončí pred ňou
        for (let i = b - 1; i >= a; i--) {
          if (F[i] !== '' || parts[own[i]].startsWith('</')) continue;
          const j = mate(i, +1);
          if (j >= 0 && j < b) continue;
          if (j >= 0 && PH.test(F.slice(b, j))) b = j + 1; else b = i;
        }
        if (F[a] !== '' || F[b - 1] !== '') { const t = trim(a, b); if (F[a] !== '') a = t[0]; if (F[b - 1] !== '') b = t[1]; }
      } while (prev !== a + ':' + b && a < b);
      const core = F.slice(a, b).replace(//g, '');
      if (a >= b || core.replace(/\s/g, '').length < 3 || !/[=≈→⇒≥≤∼≠≡↔⇔∝]/.test(core) || !atomRe.test(core)) return;
      ins.push([a, '\u0006'], [b - 1, '\u0007']);
    };
    // koniec vety („… osi y. Y|0⟩ = …“) beh rozdelí — čip nikdy neprekročí bodku s medzerou (desatinná bodka medzeru nemá)
    F.replace(RUN, (run, at) => {
      let from = 0;
      for (const m of run.matchAll(/\.[\s\u00a0\uE000]+/gu)) { chip(at + from, at + m.index + 1); from = m.index + m[0].length; }
      chip(at + from, at + run.length);
      return run;
    });
    // vloženie značiek čipu (od konca): do textu na posun, k značke pred/za ňu
    ins.sort((x, y) => y[0] - x[0] || (x[1] === '\u0007' ? -1 : 1));
    for (const [i, mk] of ins) {
      const k = own[i];
      if (offs[i] < 0) parts[k] = mk === '\u0006' ? mk + parts[k] : parts[k] + mk;
      else { const o = offs[i] + (mk === '\u0006' ? 0 : 1); parts[k] = parts[k].slice(0, o) + mk + parts[k].slice(o); }
    }
    const out = parts.join('');
    return out.replace(/\u0006([\s\S]*?)\u0007/g, (m, inner) => `<span class="eqi">${this.colorMath(inner)}</span>`).replace(/ /g, '&nbsp;');
  },

  // ---------- každá časť vzorca vlastnou farbou a s rovnakými medzerami ----------
  // čísla broskyňové · vzťahy (=, →) zlaté s medzerou · operácie (+ − · /) svetlomodré · zátvorky a |…| tlmené
  // · funkcie (cos, sin, Re …) tyrkysové · premenné biele kurzívou · operátory (H, X …) fialové · P biela · grécke a kety podľa mnemotechniky
  GREEK: { 'α': 'a', 'β': 'b', 'θ': 'th', 'φ': 'ph', 'γ': 'g', 'ψ': 'ket', 'Ψ': 'ket', 'ρ': 'rho', 'σ': 'ket', 'Δ': 'ph', 'Ω': 'th', 'ω': 'ph', 'ħ': 'k', 'π': 'k', '∂': 'k', 'Σ': 'k', '⊗': 'k', '∇': 'k', 'ℂ': 'k' },
  colorMath(html) {
    const TOK = /(\|[^|⟩\s<]{1,5}⟩)|(⟨[^⟨|\s<]{1,4}\|)|(?<![A-Za-zÀ-ĦĨ-žА-яІіЇїЄєҐґ])(cos|sin|tan|exp|log|ln|Re|Im|Tr|det|dim|diag|const|max|min)(?![A-Za-zÀ-ĦĨ-žА-яІіЇїЄєҐґ])|(H̃|[ĤÂ])|([αβθφγψΨρσΔΩωħπ∂Σ⊗∇ℂ])|(\d+(?:[.,]\d+)?(?:\s?%)?|[½¼¾⅓√∞°])|(⇔|⇒|→|≈|≥|≤|∼|≠|=)|([+−\-·×*/])|([()[\]{}|⟨⟩])|(?<![A-Za-zÀ-ĦĨ-žА-яІіЇїЄєҐґ])([A-Za-z])(?![A-Za-zÀ-ĦĨ-žА-яІіЇїЄєҐґ])|(\s+)|([^]+?)/gu;
    let depth = 0, keep = 0, prevKind = 'start';
    // fázový faktor e<sup>…</sup> ostane celý (zelený) — pri „Rovnice najprv“ z neho glyphify spraví ručičku hodín
    const exps = [];
    html = String(html).replace(/e<sup>[^<]{1,12}<\/sup>/g, (m) => `\uE010${String.fromCharCode(0xE100 + exps.push(m) - 1)}\uE011`);
    return html.split(/(<[^>]+>)/).map((seg) => {
      if (seg.startsWith('<')) {
        if (/^<svg/i.test(seg)) depth++; else if (depth && /^<\/svg/i.test(seg)) depth--; // písmená glyfov (SVG) sa nefarbia
        // hodnoty amplitúd (α modrá, β červená, tretia zelená) si farbu KTO nechajú
        if (/^<(span|i|b)[^>]*class="[^"]*\b(ca|cb|cg)\b/.test(seg)) keep = 1; else if (keep && /^<\//.test(seg)) keep = 0;
        return seg;
      }
      if (depth || keep || !seg) return seg;
      const toks = [];
      seg.replace(TOK, (m, ket, bra, fn, hat, gr, num, rel, op, br, v, sp) => {
        const kind = ket ? 'ket' : bra ? 'bra' : fn ? 'fn' : hat ? 'opr' : gr ? 'gr' : num ? 'num' : rel ? 'rel' : op ? 'op' : br ? 'br' : v ? 'var' : sp ? 'sp' : 'txt';
        toks.push({ kind, m });
        return m;
      });
      // kontext pre glyfy (každá časť je vo vlastnom span-e, glyphify už susedov nevidí): neviditeľné značky za symbolom
      const near = (i, d) => { for (let j = i + d; j >= 0 && j < toks.length; j += d) if (toks[j].kind !== 'sp') return toks[j]; return null; };
      toks.forEach((t, i) => {
        const p = near(i, -1), n = near(i, 1);
        if (t.m === 'α' && p && p.m.startsWith('(') && n && /^[)/]/.test(n.m)) t.m += '\u2060';                   // α ako uhol: R(α), cos(α/2)
        if (t.m === 'γ' && n && (/^B/.test(n.m) || /^\//.test(n.m))) t.m += '\u2061';                             // γB₀, γ/2π: gyromagnetický pomer
        if (t.kind === 'var' && t.m === 'T' && p && (p.kind === 'num' || p.m === '/')) { t.m += '\u2063'; t.unit = 1; } // tesla
      });
      // interpunkcia sa prilepí k predchádzajúcej časti (čiarka nikdy nezačne riadok)
      for (let i = toks.length - 1; i > 0; i--) if (toks[i].kind === 'txt' && /^[,.;:]+$/.test(toks[i].m) && !['sp', 'txt'].includes(toks[i - 1].kind)) { toks[i - 1].m += toks[i].m; toks.splice(i, 1); }
      // medzery okolo vzťahov a operácií dáva CSS → pôvodné medzery pri nich zmiznú
      return toks.map((t, i) => {
        const nb = (j) => toks[j] && toks[j].kind;
        if (t.kind === 'sp') {
          if (['rel', 'op'].includes(nb(i - 1)) || ['rel', 'op'].includes(nb(i + 1))) return '';
          return t.m;
        }
        let cls;
        switch (t.kind) {
          case 'ket': case 'bra': cls = 'm-ket'; break;
          case 'fn': cls = 'm-fn'; break;
          case 'opr': cls = 'm-opr'; break;
          case 'gr': cls = 'm-g mn-' + (t.m.endsWith('\u2060') ? 'th' : this.GREEK[t.m[0]]); break;
          case 'num': cls = 'm-num'; break;
          case 'rel': cls = 'm-rel'; break;
          case 'op': cls = ['start', 'rel', 'op', 'open'].includes(prevKind) && /[−-]/.test(t.m) ? 'm-un' : 'm-op'; break;
          case 'br': cls = 'm-br'; break;
          case 'var': cls = t.unit ? 'm-var' : /^[HXYZSTUI]/.test(t.m) ? 'm-opr' : /^P/.test(t.m) ? 'm-prob' : 'm-var'; break;
          default: cls = null;
        }
        prevKind = t.kind === 'br' ? (/[([{⟨]/.test(t.m) ? 'open' : 'close') : t.kind === 'op' && cls === 'm-un' ? 'op' : t.kind;
        return cls ? `<span class="${cls}">${t.m}</span>` : t.m;
      }).join('');
    }).join('').replace(/\uE010([\uE100-\uEFFF])\uE011/g, (m, c) => `<span class="m-exp">${exps[c.charCodeAt(0) - 0xE100]}</span>`);
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
