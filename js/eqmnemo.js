'use strict';
// ∑ Typ hry „Rovnice najprv“: skutočná rovnica, ktorá práve platí, žije v 3D nad scénou.
// Rovnicová mnemotechnika — každý symbol má farbu (KTO), veľkosť (KOĽKO) a otáčanie (FÁZA):
//  α modrá · β červená · kety tyrkysové · operátory fialové krabičky · θ ružová · φ zelená · globálna fáza zlatá
//  · pravdepodobnosť biela so stĺpcom · koherencie vo farbe svojej fázy (blednú pri dekoherencii) · konštanty sivé a nehybné.
// Hodnoty sa čítajú každý snímok zo stavu scény (viewState a polia levelov), takže rovnica sa hýbe spolu s hrou.

const MODES = ['pictures', 'equations'];
const MODE_NAME = {
  pictures: tr('🖼 Obrazy najprv', '🖼 Pictures first', '🖼 Спершу образи'),
  equations: tr('∑ Rovnice najprv', '∑ Equations first', '∑ Спершу рівняння'),
};
const MODE_DESC = {
  pictures: tr('pôvodná hra: najprv obraz a intuícia (ručičky, Blochova guľa, pokusy), rovnice len v paneli teórie',
    'the original game: the picture and intuition come first (hands, the Bloch ball, experiments); equations only in the theory panel',
    'оригінальна гра: спершу образ та інтуїція (стрілки, куля Блоха, досліди), рівняння — лише в панелі теорії'),
  equations: tr('skutočná rovnica žije v 3D nad scénou a mení sa s hrou; rovnicová mnemotechnika: farba = KTO, veľkosť = KOĽKO, otáčanie = FÁZA; pred každou úlohou jej rovnica',
    'the real equation lives in 3D above the scene and changes with the game; equation mnemonics: colour = WHO, size = HOW MUCH, spin = PHASE; every task starts with its equation',
    'справжнє рівняння живе в 3D над сценою й змінюється разом із грою; мнемоніка рівнянь: колір = ХТО, розмір = СКІЛЬКИ, обертання = ФАЗА; кожне завдання починається з рівняння'),
};

// mnemotechnické pravidlá: [ukážkový token, nadpis, vysvetlenie]
const MNEMO_RULES = [
  ['<span class="mn mn-a">α</span><span class="mn mn-b">β</span><span class="mn mn-ket">|0⟩</span>', tr('Farba = KTO', 'Colour = WHO', 'Колір = ХТО'),
    tr('α (amplitúda |0⟩) je vždy modrá, β (amplitúda |1⟩) červená, kety tyrkysové, θ ružová, φ zelená, globálna fáza zlatá — rovnako ako šípky, oblúky a stĺpce v 3D.',
      'α (the amplitude of |0⟩) is always blue, β (the amplitude of |1⟩) red, kets cyan, θ pink, φ green, the global phase gold — the same as the arrows, arcs and bars in 3D.',
      'α (амплітуда |0⟩) завжди синя, β (амплітуда |1⟩) червона, кети бірюзові, θ рожева, φ зелена, глобальна фаза золота — так само, як стрілки, дуги й стовпчики в 3D.')],
  ['<span class="mn mn-a" style="font-size:1.4em">α</span><span class="mn mn-a" style="font-size:.7em;opacity:.6">α</span>', tr('Veľkosť = KOĽKO', 'Size = HOW MUCH', 'Розмір = СКІЛЬКИ'),
    tr('Symbol amplitúdy rastie s jej veľkosťou |α|. Keď je amplitúda nulová, symbol sa scvrkne a zbledne.',
      'An amplitude’s symbol grows with its magnitude |α|. When the amplitude is zero, the symbol shrinks and fades.',
      'Символ амплітуди росте з її модулем |α|. Коли амплітуда нульова, символ зменшується й блякне.')],
  ['<span class="mn-demo-halo"><i></i></span>', tr('Otáčanie = FÁZA', 'Spin = PHASE', 'Обертання = ФАЗА'),
    tr('Ručička okolo amplitúdy ukazuje jej fázu (uhol e<sup>iφ</sup>). Globálna fáza otáča celú zátvorku naraz — preto ju nevidno v žiadnej pravdepodobnosti.',
      'The hand around an amplitude shows its phase (the angle of e<sup>iφ</sup>). The global phase turns the whole bracket at once — which is why no probability can see it.',
      'Стрілка довкола амплітуди показує її фазу (кут e<sup>iφ</sup>). Глобальна фаза обертає всю дужку разом — тому її не видно в жодній імовірності.')],
  ['<span class="mn mn-op">H</span><span class="mn mn-ket">|ψ⟩</span>', tr('Krabička = OPERÁTOR', 'Box = OPERATOR', 'Коробка = ОПЕРАТОР'),
    tr('Operátory a hradlá sú fialové 3D krabičky. Pôsobia doprava: keď sa uplatnia, krabička sa otočí a ket za ňou sa preklopí.',
      'Operators and gates are violet 3D boxes. They act to the right: when applied, the box spins and the ket after it flips over.',
      'Оператори й гейти — фіолетові 3D-коробки. Вони діють праворуч: коли застосовуються, коробка обертається, а кет за нею перевертається.')],
  ['<span class="mn mn-P">|α|²</span>', tr('|…|² = fáza zamrzne', '|…|² = the phase freezes', '|…|² = фаза замерзає'),
    tr('V pravdepodobnosti |α|² sa ručička zastaví a zošedne: štvorec absolútnej hodnoty fázu zahodí. Ostane biely stĺpec.',
      'Inside a probability |α|² the hand stops and turns grey: the squared magnitude throws the phase away. A white bar remains.',
      'В імовірності |α|² стрілка зупиняється й сіріє: квадрат модуля відкидає фазу. Лишається білий стовпчик.')],
  ['<span class="mn mn-coh">ρ₀₁</span>', tr('Bledne = DEKOHERENCIA', 'Fades = DECOHERENCE', 'Блякне = ДЕКОГЕРЕНЦІЯ'),
    tr('Koherencie (mimodiagonála ρ) majú farbu svojej fázy. Keď ich prostredie „odmeria“, blednú — a s nimi interferencia.',
      'Coherences (the off-diagonal of ρ) carry the colour of their phase. When the environment “measures” them they fade — and interference fades with them.',
      'Когерентності (позадіагональ ρ) мають колір своєї фази. Коли довкілля їх «вимірює», вони блякнуть — а з ними й інтерференція.')],
  ['<span class="mn mn-m">⚡</span>', tr('Záblesk a pád = KOLAPS', 'Flash and drop = COLLAPSE', 'Спалах і падіння = КОЛАПС'),
    tr('Pri meraní rovnica blysne; člen, ktorý nepadol, spadne a ostane jeden výsledok.',
      'On a measurement the equation flashes; the term that did not happen drops away and one outcome remains.',
      'Під час вимірювання рівняння спалахує; член, що не випав, падає, і лишається один результат.')],
  ['<span class="mn mn-k">ħ π 2</span>', tr('Sivé a nehybné = KONŠTANTA', 'Grey and still = CONSTANT', 'Сіре й нерухоме = СТАЛА'),
    tr('Konštanty prírody a čísla, ktoré sa nemenia, sú sivé a nikdy sa nehýbu — oči hneď vedia, čo je premenná.',
      'Constants of nature and fixed numbers are grey and never move — your eyes immediately know what is a variable.',
      'Сталі природи й незмінні числа сірі й ніколи не рухаються — очі одразу бачать, що є змінною.')],
];

const EqM = {
  // ---------- tokeny ----------
  // t: a | b | c (koeficient) | ket | bra | op | th | ph | g | P | coh | k (konštanta) | n (znak) | m (meranie)
  T(k, t, h, o = {}) { return { k, t, h, ...o }; },
  amp(k, t, z, lb) { const m = C.abs(z); return { k, t, h: VF.complex(z), lb, s: m, ph: m > 1e-3 ? C.arg(z) : null }; },
  n(k, h) { return { k, t: 'n', h }; },

  // ---------- farbenie symbolov v texte (dialógy, panel, HUD) ----------
  paint(html) {
    return String(html).split(/(<[^>]+>)/).map((seg) => {
      if (seg.startsWith('<')) return seg;
      return seg
        .replace(/(\|[0-9ψφa±+−i]{1,3}⟩)/g, '\u0001ket\u0002$1\u0003')
        .replace(/(⟨[ψφa0-9±+−i]{1,3}\|)/g, '\u0001bra\u0002$1\u0003')
        .replace(/α/g, '\u0001a\u0002α\u0003').replace(/β/g, '\u0001b\u0002β\u0003')
        .replace(/θ/g, '\u0001th\u0002θ\u0003').replace(/φ(?![⟩|])/g, '\u0001ph\u0002φ\u0003').replace(/γ/g, '\u0001g\u0002γ\u0003')
        .replace(/ρ/g, '\u0001rho\u0002ρ\u0003').replace(/([ħπ])/g, '\u0001k\u0002$1\u0003')
        // samostatné písmeno operátora/hradla; nie na začiatku vety (slovenské predložky „Z“, „S“)
        .replace(/(^|[^\p{L}\p{N}])([ĤÂHXYZSTU])(?![\p{L}\p{N}])/gu, (m, pre, op, i, all) => (/(^|[.!?:]\s*)$/.test(all.slice(0, i + pre.length)) && /^\s+\p{Ll}/u.test(all.slice(i + m.length)) ? m : `${pre}\u0001op\u0002${op}\u0003`))
        .replace(/\u0001(\w+)\u0002([^\u0003]*)\u0003/g, '<span class="mn mn-$1">$2</span>');
    }).join('');
  },

  // ---------- rovnica pre aktuálnu scénu ----------
  build() {
    const S = Game.scene;
    if (!S) return null;
    const st = Views.state(), rows = [];
    let title = S === Hub ? tr('Psíčko', 'Little Psi', 'Псічко') : `${S.num} · ${S.title}`;
    const law = this.law(S, st);
    if (law && law.pre) rows.push(...law.pre);
    if (st && !(law && law.noState)) rows.push(...this.stateRows(st, law));
    if (law && law.rows) rows.push(...law.rows);
    if (!rows.length) return null;
    if (law && law.title) title = law.title;
    return { title, rows };
  },

  // stav qubitu / amplitúd / dvoch qubitov → riadky tokenov
  stateRows(st, law) {
    law = law || {};
    const R = [], eq = this.n.bind(this);
    if (st.kind === 'amps') {
      const row = [];
      st.amps.forEach((a, i) => { if (i) row.push(eq('pl' + i, '+')); row.push(this.amp('am' + i, i === 0 ? 'a' : i === 1 ? 'b' : 'c', a.z, a.label)); });
      R.push(row);
      return R;
    }
    if (st.kind === 'two') {
      const kets = ['00', '01', '10', '11'], row = [this.T('psi', 'ket', '|Ψ⟩'), eq('eq', '=')];
      st.psi.forEach((c, i) => {
        if (i) row.push(eq('pl' + i, '+'));
        row.push(this.amp('c' + i, 'c', c, `ψ<sub>${kets[i]}</sub>`), this.T('k' + i, 'ket', `|<b class="qa">${kets[i][0]}</b><b class="qb">${kets[i][1]}</b>⟩`, { s: C.abs(c) > 1e-3 ? 1 : 0.3 }));
      });
      R.push(row);
      const det = C.sub(C.mul(st.psi[0], st.psi[3]), C.mul(st.psi[1], st.psi[2])), ent = C.abs(det) > 1e-3;
      R.push([this.T('d0', 'c', 'ψ₀₀ψ₁₁ − ψ₀₁ψ₁₀'), eq('deq', '='), this.amp('det', 'c', det, 'det'), eq('dto', '→'),
        this.T('dent', ent ? 'm' : 'n', ent ? tr('previazané', 'entangled', 'сплутані') : tr('produkt', 'product', 'добуток'))]);
      return R;
    }
    // jeden qubit
    const [rx, ry, rz] = st.r, L = V3.len(st.r);
    if (st.pure) {
      // globálna fáza (ostrov): z α, β sa vytkne — točí sa len zlaté e^{iγ} pred zátvorkou
      const g = law.global != null ? C.exp(-law.global) : C.of(1), a = C.mul(g, st.psi[0]), b = C.mul(g, st.psi[1]);
      const row = [this.T('psi', 'ket', law.ketName || '|ψ⟩'), eq('eq', '=')];
      if (law.op) row.push(this.T('op', 'op', law.op, { act: law.acting }));
      if (law.global != null) row.push(this.T('gl', 'g', 'e<sup>iγ</sup>', { ph: law.global, s: 1 }), eq('lp', '('));
      row.push(this.amp('a', 'a', a, 'α'), this.T('k0', 'ket', '|0⟩', { s: C.abs(a) > 1e-3 ? 1 : 0.3 }), eq('pl', '+'),
        this.amp('b', 'b', b, 'β'), this.T('k1', 'ket', '|1⟩', { s: C.abs(b) > 1e-3 ? 1 : 0.3 }));
      if (law.global != null) row.push(eq('rp', ')'));
      R.push(row);
      const th = Math.acos(clamp(rz, -1, 1)), ph = (Math.atan2(ry, rx) + 2 * Math.PI) % (2 * Math.PI);
      R.push([this.T('ac', 'a', 'α'), eq('e1', '='), this.T('cos', 'k', 'cos('), this.T('th', 'th', 'θ'), this.T('h1', 'k', '/2)'), eq('c1', ','),
        this.T('bc', 'b', 'β'), eq('e2', '='), this.T('eph', 'ph', 'e<sup>iφ</sup>', { ph, s: 1 }), this.T('sin', 'k', 'sin('), this.T('th2', 'th', 'θ'), this.T('h2', 'k', '/2)'), eq('c2', '·'),
        this.T('thv', 'th', `θ = ${VF.angle(th)}`), this.T('phv', 'ph', `φ = ${VF.angle(ph)}`)]);
    } else {
      const coh = [rx / 2, -ry / 2], cm = C.abs(coh);
      R.push([this.T('rho', 'coh', 'ρ', { s: 1 }), eq('eq', '='), this.T('half', 'k', '½('), this.T('I', 'op', 'I'), eq('p', '+'), this.T('r', 'n', `r·σ)`),
        eq('c', ','), this.T('rl', 'n', `|r| = ${VF.num(L)}`), this.T('mix', 'm', L < 0.05 ? tr('úplná zmes', 'fully mixed', 'повна суміш') : tr('zmes', 'mixture', 'суміш'), { s: 0.8 })]);
      R.push([eq('lb', '['), this.T('r00', 'P', VF.pct((1 + rz) / 2), { bar: (1 + rz) / 2, col: 'a' }), this.T('r01', 'coh', VF.complex(coh), { s: 0.5 + cm, fade: cm * 2, ph: cm > 1e-3 ? C.arg(coh) : null }),
        eq('sep', ';'), this.T('r10', 'coh', VF.complex(C.conj(coh)), { s: 0.5 + cm, fade: cm * 2, ph: cm > 1e-3 ? -C.arg(coh) : null }), this.T('r11', 'P', VF.pct((1 - rz) / 2), { bar: (1 - rz) / 2, col: 'b' }), eq('rb', ']')]);
    }
    // pravdepodobnosti: |α|² — fáza zamrzne
    const p0 = (1 + rz) / 2, a2 = st.pure ? '|α|²' : 'ρ₀₀', b2 = st.pure ? '|β|²' : 'ρ₁₁'; // zmes nemá α, β — pravdepodobnosť je na diagonále ρ
    R.push([this.T('P0', 'P', 'P(0)'), eq('pe0', '='), this.T('A2', 'a', a2, { frozen: true }), eq('pq0', '='), this.T('P0v', 'P', VF.pct(p0), { bar: p0, col: 'a' }),
      eq('sp', '·'), this.T('P1', 'P', 'P(1)'), eq('pe1', '='), this.T('B2', 'b', b2, { frozen: true }), eq('pq1', '='), this.T('P1v', 'P', VF.pct(1 - p0), { bar: 1 - p0, col: 'b' })]);
    return R;
  },

  // zákon, ktorý práve platí v leveli (živé hodnoty z polí levelu)
  law(S, st) {
    const T = this.T.bind(this), eq = this.n.bind(this);
    if (S === Hub) return { global: Hub.player.phase % (2 * Math.PI), title: tr('Psíčko · globálna fáza', 'Little Psi · global phase', 'Псічко · глобальна фаза') };
    switch (S.num) {
      case 1:
        if (S.mode === 'set') return { rows: [[T('P', 'P', 'P'), eq('e', '='), T('A2', 'a', '|α|²', { frozen: true }), eq('e2', '='), T('Pv', 'P', VF.pct(C.abs2(S.z)), { bar: C.abs2(S.z), col: 'a' })]] };
        if (S.mode === 'mul') return { rows: [[T('al', 'a', 'α'), eq('to', '→'), T('i', 'op', 'i', { act: Math.abs(S.ang - S.angShown) > 0.05 }), eq('dot', '·'), T('al2', 'a', 'α'), eq('e', '='),
          T('ei', 'ph', 'e<sup>iπ/2</sup>', { ph: Math.PI / 2, s: 1 }), eq('d2', '·'), T('al3', 'a', 'α')]] };
        if (S.mode === 'int') {
          const A1 = C.of(0.5), A2 = C.scale(C.exp(S.ph2), 0.5), sum = C.add(A1, A2), P = C.abs2(sum);
          return { rows: [[T('P', 'P', 'P'), eq('e', '='), T('l', 'k', '|'), this.amp('s', 'c', sum, 'A₁+A₂'), T('r', 'k', '|²'), eq('e2', '='),
            T('cl', 'P', '|A₁|²+|A₂|²', { frozen: true }), eq('pl', '+'), T('it', 'coh', `2Re(A₁A₂*) = ${VF.num(P - 0.5)}`, { s: 0.6 + Math.abs(P - 0.5), ph: S.ph2 }), eq('e3', '='), T('Pv', 'P', VF.pct(P), { bar: P, col: 'a' })]] };
        }
        return null;
      case 2: {
        const th = S.model === 'q' ? S.theory() : null;
        if (!th) return null;
        return { rows: [[T('P', 'P', 'P(↑)'), eq('e', '='), T('h', 'k', '½(1 +'), T('r', 'ket', 'r'), eq('d', '·'), T('n', 'op', 'n'), T('c', 'k', ')'), eq('e2', '='),
          T('Pv', 'P', VF.pct(th.up), { bar: th.up, col: 'a' }), eq('s', '·'), T('pass', 'n', tr(`prejde ${VF.pct(th.pass)}`, `passes ${VF.pct(th.pass)}`, `проходить ${VF.pct(th.pass)}`))]] };
      }
      case 3:
        if (S.anim) return { op: S.anim.g || 'U', acting: true, ketName: '|ψ′⟩' };
        return null;
      case 4: {
        const p = S.p || 0, phi = S.phi || 0, P0 = S.P0 ? S.P0() : 0.5;
        return { rows: [[T('c', 'coh', 'ρ₀₁', { s: 1, ph: -phi }), eq('to', '→'), T('k', 'k', '(1 −'), T('p', 'm', `p = ${VF.num(p)}`), T('k2', 'k', ')'),
          T('ph', 'ph', 'e<sup>−iφ</sup>', { ph: -phi, s: 1 }), T('c2', 'coh', 'ρ₀₁', { s: 0.4 + (1 - p) * 0.8, fade: 1 - p, ph: -phi })],
        [T('P', 'P', 'P(0)'), eq('e', '='), T('h', 'k', '½(1 + (1 −'), T('p2', 'm', 'p'), T('k3', 'k', ') cos'), T('phv', 'ph', 'φ'), T('k4', 'k', ')'), eq('e2', '='), T('Pv', 'P', VF.pct(P0), { bar: P0, col: 'a' })]] };
      }
      case 5: {
        const toks = (S.tokens || []).map((d, i) => T('d' + i, d.k === 'tensor' ? 'n' : d.k, d.t));
        const res = S.res && S.res.type && S.res.type !== 'bad' ? TYPE_NAME[S.res.type] : S.res && S.res.type === 'bad' ? '⚠️' : '…';
        return { noState: true, rows: [[...(S.squared ? [T('ab', 'P', '|')] : []), ...(toks.length ? toks : [T('emp', 'k', '…')]), ...(S.squared ? [T('ab2', 'P', '|²')] : []),
          eq('to', '→'), T('ty', S.res && S.res.type === 'prob' ? 'P' : S.res && S.res.type === 'op' ? 'op' : S.res && S.res.type === 'num' ? 'c' : 'ket', res, { s: 0.8 })]] };
      }
      case 6: {
        const D = S.delta, rows = [[T('H', 'op', 'H̃'), eq('e', '='), T('h', 'k', '(ħ/2)('), T('D', 'ph', `Δ = ${VF.num(D)}`), T('Z', 'op', 'Z'), eq('p', '+'),
          T('O', 'th', `Ω<sub>R</sub> = ${VF.num(S.OR)}`), T('X', 'op', 'X', { act: !!S.pulse }), T('c', 'k', ')')]];
        if (S.frame === 'lab') rows.push([T('b', 'b', 'β(t)'), eq('e2', '='), T('b0', 'b', 'β(0)'), T('w', 'ph', 'e<sup>iω₀t</sup>', { ph: S.labPh || 0, s: 1 }), eq('c', ','),
          T('w0', 'n', `ω₀ = γB₀ = ${VF.num(S.w0)}`)]);
        else rows.push([T('ar', 'th', `θ = Ω<sub>R</sub>t = ${VF.angle(S.area)}`)]);
        return { rows };
      }
      case 8:
        return { noState: true, rows: [[T('i', 'k', 'iħ'), T('d', 'n', '∂'), T('psi', 'ket', '|ψ⟩'), T('dt', 'n', '/∂t'), eq('e', '='), T('H', 'op', 'Ĥ'), T('psi2', 'ket', '|ψ⟩')],
          [T('P', 'P', 'P(a)'), eq('e2', '='), T('l', 'k', '|'), T('bra', 'bra', '⟨a|'), T('ket', 'ket', 'ψ⟩'), T('r', 'k', '|²'), eq('s', '·'),
            T('q', 'n', tr('čo existuje? · čo vieme? · ako sa javí?', 'what exists? · what can we know? · how does it appear?', 'що існує? · що ми знаємо? · як постає?'))]] };
      case 9: {
        if (!S.n) return null;
        const r = S.animR ? S.animR() : S.r, P = clamp((1 + V3.dot(r, S.n)) / 2, 0, 1);
        return { rows: [[T('P', 'P', tr('P(zásah)', 'P(hit)', 'P(влуч.)')), eq('e', '='), T('h', 'k', '½(1 +'), T('r', 'ket', 'r'), eq('d', '·'), T('n', 'g', 'n', { ph: Math.atan2(S.n[1], S.n[0]), s: 1 }), T('c', 'k', ')'), eq('e2', '='),
          T('Pv', 'P', VF.pct(P), { bar: P, col: P >= (S.thr || 1) ? 'a' : 'b' }), eq('ge', '≥'), T('thr', 'k', VF.pct(S.thr || 0))]] };
      }
      default: return null;
    }
  },

  // ---------- 3D javisko ----------
  init() {
    const st = this.stage = el('div'); st.id = 'eqstage';
    st.innerHTML = `<div class="eqh"><b class="eqt"></b><button class="eqkey" data-tip="${tr('Kľúč rovnicovej mnemotechniky', 'Key to the equation mnemonics', 'Ключ мнемоніки рівнянь')}">🔑</button><button class="eqmin">▾</button></div>`
      + '<div class="eqscene"><div class="eqrows"></div></div><div class="eqlegend"></div>';
    document.body.appendChild(st);
    this.rowsEl = st.querySelector('.eqrows'); this.sceneEl = st.querySelector('.eqscene'); this.titleEl = st.querySelector('.eqt');
    const leg = st.querySelector('.eqlegend');
    leg.innerHTML = this.legendHtml();
    st.querySelector('.eqkey').onclick = () => st.classList.toggle('legend');
    st.querySelector('.eqmin').onclick = () => { st.classList.toggle('min'); Settings.view.eqMin = st.classList.contains('min'); Settings.save(); };
    st.classList.toggle('min', !!Settings.view.eqMin);
    this.apply();
  },
  apply() {
    document.body.classList.toggle('eqmode', Settings.eq);
    this.sig = null;
  },
  legendHtml() {
    return MNEMO_RULES.map(([demo, h, d]) => `<div class="rule"><span class="demo">${demo}</span><div><b>${h}</b><small>${d}</small></div></div>`).join('');
  },
  update() {
    if (!this.stage) return;
    const on = Settings.eq && !document.body.classList.contains('welcoming');
    if (!on) { this.stage.style.display = 'none'; return; }
    const spec = this.build();
    this.stage.style.display = spec ? '' : 'none';
    if (!spec || this.stage.classList.contains('min')) { if (spec) this.titleEl.innerHTML = '∑ ' + spec.title; return; }
    // celá rovnica sa nakláňa spolu s kamerou — je to rovina v tom istom 3D svete
    const cam = Game.scene.cam;
    if (cam) {
      const ty = Math.sin(cam.yaw * 0.5) * 10, tx = 6 + (cam.pitch - 0.35) * 14;
      this.sceneEl.style.setProperty('--ty', ty.toFixed(1) + 'deg');
      this.sceneEl.style.setProperty('--tx', clamp(tx, -4, 16).toFixed(1) + 'deg');
    }
    const sig = spec.title + '#' + spec.rows.map((r) => r.map((t) => t.k + ':' + t.t).join(',')).join('|');
    if (sig !== this.sig) this.rebuild(spec, sig);
    const now = performance.now();
    spec.rows.forEach((row, ri) => row.forEach((t) => {
      const n = this.nodes[ri + '/' + t.k];
      if (!n) return;
      if (n._h !== t.h) { n.gl.innerHTML = t.h; n._h = t.h; }
      const s = t.s == null ? 1 : t.s, scale = t.s == null ? 1 : 0.42 + 0.78 * clamp(s, 0, 1.3);
      n.style.setProperty('--s', scale.toFixed(3));
      n.style.setProperty('--o', (t.fade == null ? (t.s == null ? 1 : 0.35 + 0.65 * clamp(s * 1.4, 0, 1)) : 0.25 + 0.75 * clamp(t.fade, 0, 1)).toFixed(2));
      if (t.ph != null) {
        n.style.setProperty('--ph', (-t.ph * 180 / Math.PI).toFixed(1) + 'deg');
        if (t.t === 'coh') n.style.setProperty('--hue', phaseColor(t.ph)); // koherencia má farbu svojej fázy (ako v pohľade ρ)
      }
      n.classList.toggle('hasph', t.ph != null && !t.frozen);
      n.classList.toggle('frozen', !!t.frozen);
      n.classList.toggle('acting', !!t.act);
      if (t.bar != null) n.style.setProperty('--bar', (clamp(t.bar, 0, 1) * 100).toFixed(1) + '%');
      // skok hodnoty: kolaps (amplitúda spadla na nulu) alebo preklopenie (veľká zmena)
      const p = this.prev[ri + '/' + t.k];
      if (p && now - (n._fx || 0) > 450) {
        if (p.s != null && t.s != null && p.s > 0.3 && t.s < 0.08) this.fx(n, 'collapse', now);
        else if (p.s != null && t.s != null && (Math.abs(p.s - t.s) > 0.25 || (p.ph != null && t.ph != null && Math.abs(Math.atan2(Math.sin(p.ph - t.ph), Math.cos(p.ph - t.ph))) > 0.9))) this.fx(n, 'flip', now);
      }
      this.prev[ri + '/' + t.k] = { s: t.s, ph: t.ph };
    }));
  },
  fx(n, cls, now) {
    n._fx = now;
    n.classList.remove('flip', 'collapse');
    void n.offsetWidth; // reštart animácie
    n.classList.add(cls);
    if (cls === 'collapse') { this.stage.classList.remove('flash'); void this.stage.offsetWidth; this.stage.classList.add('flash'); }
  },
  rebuild(spec, sig) {
    this.sig = sig; this.nodes = {}; this.prev = {};
    this.titleEl.innerHTML = '∑ ' + spec.title;
    this.rowsEl.innerHTML = '';
    spec.rows.forEach((row, ri) => {
      const r = el('div', 'eqrow');
      for (const t of row) {
        const n = el('span', 'tk t-' + t.t);
        n.innerHTML = `<span class="tv"><span class="halo"><i></i></span><span class="gl"></span>${t.bar != null ? '<span class="bar"><i></i></span>' : ''}</span>${t.lb ? `<small class="lb">${t.lb}</small>` : ''}`;
        n.gl = n.querySelector('.gl');
        if (t.col) n.classList.add('col-' + t.col);
        n.dataset.tip = this.tipOf(t.t);
        this.nodes[ri + '/' + t.k] = n;
        r.appendChild(n);
      }
      this.rowsEl.appendChild(r);
    });
  },
  tipOf(t) {
    const i = { a: 0, b: 0, ket: 0, bra: 0, th: 0, ph: 2, g: 2, op: 3, P: 4, coh: 5, m: 6, k: 7, c: 1 }[t];
    if (i == null) return '';
    const [, h, d] = MNEMO_RULES[i];
    return `<b>${h}</b> — ${d}`;
  },

  // karta „∑ Rovnica najprv“ pred krokom levelu: rovnica kroku (alebo jadro levelu) vo farbách mnemotechniky
  cardsFor(num, step) {
    const T = THEORY[num];
    if (!T) return [];
    const html = T[step] ? pick(T[step]) : step === 'intro' ? pick(T.core) : null;
    if (!html) return [];
    return [{ who: tr('Rovnica najprv', 'Equation first', 'Спершу рівняння'), face: '∑', text: html, cls: 'eqcard' }];
  },
};
