'use strict';
// LEVEL 0 — Sieň symbolov (sprievodkyňa Amplitúda)
// Každý symbol rovnicovej mnemotechniky (kľúč 🔑: pravidlá aj slovník glyfov) a každý farebný kúsok vzorca stojí
// na vlastnom podstavci ako 3D model v tej istej farbe, akú má v rovniciach. Model sa hýbe sám, sprievodkyňa ho
// vysvetlí a hneď sa pýta; po každej kapitole opakovanie, na konci veľká skúška.

const G0 = (k, l = k) => EqG.html(k, l);
// otázka: [text, [správna, …nesprávne], vysvetlenie] v troch jazykoch — správna je vždy prvá, kvíz ich zamieša
const Q0 = (sk, en, uk) => { const [q, options, why] = tr(sk, en, uk); return { q, options, correct: 0, why }; };
// farby mnemotechniky (style.css: --mn-* a .m-*) v RGB 0..1 — 3D model má vždy farbu svojho symbolu v rovnici
const MC = {
  a: [0.31, 0.55, 1], b: [1, 0.42, 0.49], ket: [0.37, 0.89, 1], op: [0.73, 0.55, 1], th: [1, 0.6, 0.9], ph: [0.49, 1, 0.63],
  g: [1, 0.82, 0.35], P: [1, 1, 1], k: [0.56, 0.61, 0.78], coh: [0.79, 0.64, 1], m: [1, 0.95, 0.69], c: [0.91, 0.93, 1],
  num: [1, 0.73, 0.54], rel: [1, 0.82, 0.35], opn: [0.56, 0.83, 1], br: [0.55, 0.59, 0.8], fn: [0.31, 0.89, 0.76], v: [0.96, 0.96, 1],
};
const UP0 = [0, 1, 0];
// farba fázy (ako phaseColor v pohľadoch): odtieň = uhol
const hue0 = (ph) => {
  const h = (((ph / (2 * Math.PI)) % 1) + 1) % 1 * 6, f = h - Math.floor(h), q = 1 - f, s = [[1, f, 0], [q, 1, 0], [0, 1, f], [0, q, 1], [f, 0, 1], [1, 0, q]][Math.floor(h) % 6];
  return s.map((x) => 0.3 + 0.7 * x);
};
const smooth0 = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

// ---------- 3D stavebnice ----------
const D0 = {
  ball(r, c, R) { r.sphere(c, R, [0.45, 0.6, 1], { alpha: 0.1 }); r.draw('circle', M4.trs(c, 0, R), [0.55, 0.65, 0.9], { alpha: 0.6 }); },
  pillar(r, base, p, col, H = 1.4, rad = 0.1) {
    r.draw('cylinder', M4.trs(base, 0, [rad * 1.15, H, rad * 1.15]), [1, 1, 1], { alpha: 0.1 });
    r.draw('cylinder', M4.trs(base, 0, [rad, Math.max(p * H, 0.005), rad]), col, { emissive: 0.35 });
  },
  // ket ⟩ (dir = +1, hrot dopredu) alebo bra ⟨ (dir = −1, hrot dozadu); squash < 1 = práve sa preklápa
  ket(r, S, x, yc, h, dir, col, squash = 1) {
    const hh = h / 2 * squash, bx = x - dir * 0.22, o = { emissive: 0.4 };
    const top = S.P(x - dir * 0.04, yc + hh), tip = S.P(x + dir * 0.2, yc), bot = S.P(x - dir * 0.04, yc - hh);
    r.rod(S.P(bx, yc - hh), S.P(bx, yc + hh), col, 0.035, o);
    r.rod(top, tip, col, 0.035, o); r.rod(tip, bot, col, 0.035, o);
    for (const p of [top, tip, bot]) r.sphere(p, 0.035, col, o);
  },
  clock(r, c, n, R, col, ang, S) {
    r.draw('disk', M4.orient(c, n, R), col, { alpha: 0.12 });
    r.draw('circle', M4.orient(c, n, R), col);
    r.arrow(c, V3.add(c, V3.add(V3.scale(S.R, Math.cos(ang) * R * 0.92), V3.scale(UP0, Math.sin(ang) * R * 0.92))), col, 0.03, { emissive: 0.5 });
  },
  dots(r, c, u, w, R, ang, col, n = 9) { for (let j = 0; j <= n; j++) { const a = ang * j / n; r.sphere(V3.add(c, V3.add(V3.scale(u, Math.cos(a) * R), V3.scale(w, Math.sin(a) * R))), 0.025, col, { emissive: 0.8 }); } },
};

// ---------- exponáty ----------
// ch = kapitola, keys = glyfy v paneli (slovník), chime = zvuk pri predstavení, glyph = popis nad podstavcom
const EXHIBITS0 = [
  // ===== 1. kapitola: farba = KTO (amplitúdy a stavy) =====
  {
    id: 'alpha', ch: 1, keys: ['α'], chime: 'α', glyph: () => G0('α'),
    name: tr('α — amplitúda |0⟩', 'α — amplitude of |0⟩', 'α — амплітуда |0⟩'),
    lines: () => tr([
      `Toto je ${G0('α')}: <b>amplitúda stavu |0⟩</b>. Je <b>vždy modrá</b> — v rovnici, v šípkach aj v stĺpcoch. Slovná pomôcka: <b>Alfa ukazuje hore</b> — jej šípka mieri k severnému pólu |0⟩.`,
      'Pozri, ako modrá šípka dýcha: jej <b>dĺžka je |α|</b> — <b>veľkosť = KOĽKO</b>. Glyf α v živej rovnici rastie a zmenšuje sa presne tak isto. Malá ručička, ktorá krúži pri hrote, je jej <b>fáza</b> — <b>otáčanie = FÁZA</b>.',
    ], [
      `This is ${G0('α')}: the <b>amplitude of |0⟩</b>. It is <b>always blue</b> — in equations, arrows and bars alike. Memory phrase: <b>Alpha points Above</b> — its arrow points to the north pole |0⟩.`,
      'Watch the blue arrow breathe: its <b>length is |α|</b> — <b>size = HOW MUCH</b>. The α glyph in a live equation grows and shrinks in exactly the same way. The little hand circling the tip is its <b>phase</b> — <b>spin = PHASE</b>.',
    ], [
      `Це ${G0('α')}: <b>амплітуда стану |0⟩</b>. Вона <b>завжди синя</b> — у рівнянні, у стрілках і в стовпчиках. Словесна підказка: <b>Альфа вказує вгору</b> — її стрілка дивиться на північний полюс |0⟩.`,
      'Подивись, як синя стрілка «дихає»: її <b>довжина — це |α|</b> — <b>розмір = СКІЛЬКИ</b>. Гліф α у живому рівнянні росте й зменшується точнісінько так само. Маленька стрілка, що кружляє біля вістря, — її <b>фаза</b> — <b>обертання = ФАЗА</b>.',
    ]),
    q1: () => Q0(['Akú farbu má α (amplitúda |0⟩) všade v hre?', ['modrú', 'červenú', 'zlatú', 'tyrkysovú'], 'α je vždy modrá. Červená patrí β, zlatá globálnej fáze, tyrkysová ketom.'],
      ['What colour is α (the amplitude of |0⟩) everywhere in the game?', ['blue', 'red', 'gold', 'cyan'], 'α is always blue. Red belongs to β, gold to the global phase, cyan to kets.'],
      ['Якого кольору α (амплітуда |0⟩) усюди в грі?', ['синього', 'червоного', 'золотого', 'бірюзового'], 'α завжди синя. Червоний належить β, золотий — глобальній фазі, бірюзовий — кетам.']),
    q2: () => Q0(['Modrá šípka α sa predĺži. Čo to znamená?', ['|α| narástla — výsledok 0 je pravdepodobnejší', 'zmenila sa fáza α', 'α sa zmenila na β'], 'Veľkosť = KOĽKO: dĺžka je |α| a P(0) = |α|². Fázu ukazuje otáčanie ručičky, nie dĺžka.'],
      ['The blue α arrow gets longer. What does that tell you?', ['|α| grew — outcome 0 became more likely', 'the phase of α changed', 'α turned into β'], 'Size = HOW MUCH: the length is |α|, and P(0) = |α|². The phase is the spin of the little hand, not the length.'],
      ['Синя стрілка α подовжується. Що це означає?', ['|α| зросла — результат 0 став імовірнішим', 'змінилася фаза α', 'α перетворилася на β'], 'Розмір = СКІЛЬКИ: довжина — це |α|, а P(0) = |α|². Фазу показує обертання стрілки, а не довжина.']),
    draw(r, S, t) {
      const c = S.P(0, 1.2), mag = 0.5 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.3)), tip = S.P(0, 1.2 + 0.8 * mag), ph = t * 2.2, hR = 0.2;
      D0.ball(r, c, 0.8);
      r.arrow(c, tip, MC.a, 0.05, { emissive: 0.45 });
      r.sphere(S.P(0, 2.0), 0.06, MC.ket, { emissive: 0.8 });
      r.draw('circle', M4.trs(tip, 0, hR), MC.a);
      r.rod(tip, V3.add(tip, V3.add(V3.scale(S.R, Math.cos(ph) * hR), V3.scale(S.F, Math.sin(ph) * hR))), MC.a, 0.015, { emissive: 0.6 });
      S.lab('k0', S.P(0.32, 2.1), S.g('k0', () => G0('ket0', '0')), 'sym0 small');
      S.lab('m', S.P(-1.05, 1.2 + 0.4 * mag), `<span class="mn-a">|α| = ${Fmt.num(mag, 2)}</span>`, 'axis');
    },
  },
  {
    id: 'beta', ch: 1, keys: ['β'], chime: 'β', glyph: () => G0('β'),
    name: tr('β — amplitúda |1⟩', 'β — amplitude of |1⟩', 'β — амплітуда |1⟩'),
    lines: () => tr([
      `${G0('β')} je <b>amplitúda stavu |1⟩</b>, <b>vždy červená</b>. <b>Beta mieri dole</b> — jej šípka aj čiarka glyfu smerujú k južnému pólu |1⟩.`,
      'Spolu: |ψ⟩ = α|0⟩ + β|1⟩ — modrá hore, červená dole, ako póly Blochovej gule. Keď v mentorovej rovnici uvidíš červenú, mysli si: „to je časť |1⟩“.',
    ], [
      `${G0('β')} is the <b>amplitude of |1⟩</b>, <b>always red</b>. <b>Beta goes Below</b> — its arrow and the tick on its glyph point to the south pole |1⟩.`,
      'Together: |ψ⟩ = α|0⟩ + β|1⟩ — blue on top, red at the bottom, like the poles of the Bloch ball. When you see red in a mentor’s equation, think “that is the |1⟩ part”.',
    ], [
      `${G0('β')} — це <b>амплітуда стану |1⟩</b>, <b>завжди червона</b>. <b>Бета дивиться вниз</b> — її стрілка й риска гліфа спрямовані до південного полюса |1⟩.`,
      'Разом: |ψ⟩ = α|0⟩ + β|1⟩ — синя вгорі, червона внизу, як полюси кулі Блоха. Коли в рівнянні наставника побачиш червоне, думай: «це частина |1⟩».',
    ]),
    q1: () => Q0(['Kam ukazuje šípka β (aj čiarka na jej glyfe)?', ['dole — k |1⟩, južnému pólu', 'hore — k |0⟩', 'dopredu po rovníku'], 'Beta mieri dole: β a |1⟩ ukazujú dole, α a |0⟩ hore.'],
      ['Which way does β’s arrow (and the tick on its glyph) point?', ['down — to |1⟩, the south pole', 'up — to |0⟩', 'forward along the equator'], 'Beta goes Below: β and |1⟩ point down, α and |0⟩ point up.'],
      ['Куди вказує стрілка β (і риска на її гліфі)?', ['униз — до |1⟩, південного полюса', 'угору — до |0⟩', 'уперед по екватору'], 'Бета дивиться вниз: β і |1⟩ вказують униз, α і |0⟩ — угору.']),
    q2: () => Q0(['Ktorá časť |ψ⟩ = α|0⟩ + β|1⟩ je nakreslená červenou?', ['β — amplitúda |1⟩', 'α', '|ψ⟩', 'znamienko +'], 'Červená = β. α je modrá, kety tyrkysové a + je obyčajná operácia (svetlomodrá).'],
      ['Which part of |ψ⟩ = α|0⟩ + β|1⟩ is drawn red?', ['β — the amplitude of |1⟩', 'α', '|ψ⟩', 'the + sign'], 'Red = β. α is blue, kets are cyan and + is a plain operation (light blue).'],
      ['Яка частина |ψ⟩ = α|0⟩ + β|1⟩ намальована червоним?', ['β — амплітуда |1⟩', 'α', '|ψ⟩', 'знак +'], 'Червоний = β. α синя, кети бірюзові, а + — звичайна дія (світло-синя).']),
    draw(r, S, t) {
      const c = S.P(0, 1.2), mag = 0.5 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.3 + 2)), tip = S.P(0, 1.2 - 0.8 * mag), ph = t * 2.2 + 1, hR = 0.2;
      D0.ball(r, c, 0.8);
      r.arrow(c, tip, MC.b, 0.05, { emissive: 0.45 });
      r.sphere(S.P(0, 0.4), 0.06, MC.ket, { emissive: 0.8 });
      r.draw('circle', M4.trs(tip, 0, hR), MC.b);
      r.rod(tip, V3.add(tip, V3.add(V3.scale(S.R, Math.cos(ph) * hR), V3.scale(S.F, Math.sin(ph) * hR))), MC.b, 0.015, { emissive: 0.6 });
      S.lab('k1', S.P(0.32, 0.3), S.g('k1', () => G0('ket1', '1')), 'sym0 small');
      S.lab('m', S.P(-1.05, 1.2 - 0.4 * mag), `<span class="mn-b">|β| = ${Fmt.num(mag, 2)}</span>`, 'axis');
    },
  },
  {
    id: 'ket', ch: 1, keys: ['ket', 'ket0', 'ket1', 'ketpm', 'ψ', 'Ψ'], chime: 'ket',
    glyph: (t) => [G0('ket', 'ψ'), G0('ket0', '0'), G0('ket1', '1'), G0('ketpm', '+')],
    name: tr('kety |ψ⟩, |0⟩, |1⟩, |±⟩ — stavy', 'kets |ψ⟩, |0⟩, |1⟩, |±⟩ — states', 'кети |ψ⟩, |0⟩, |1⟩, |±⟩ — стани'),
    lines: () => tr([
      `${G0('ket', 'ψ')} ${G0('ket0', '0')} ${G0('ket1', '1')} — <b>kety</b> sú <b>tyrkysové</b> a ich rám <b>⟩ má hrot dopredu</b>: ket je <b>stav</b>, odpoveď (stĺpec čísel). <b>Tvar rámu = DRUH</b> symbolu.`,
      'Čiarka prezradí pól: |0⟩ má čiarku <b>hore</b>, |1⟩ <b>dole</b>, |+⟩ a |−⟩ ukazujú doprava a doľava po rovníku. A |ψ⟩ si ty — celý stav. Veľké Ψ je stav celku (viac qubitov naraz).',
    ], [
      `${G0('ket', 'ψ')} ${G0('ket0', '0')} ${G0('ket1', '1')} — <b>kets</b> are <b>cyan</b> and their frame <b>⟩ points forward</b>: a ket is a <b>state</b>, an answer (a column of numbers). <b>Frame shape = KIND</b> of symbol.`,
      'The tick gives away the pole: |0⟩ has a tick <b>up</b>, |1⟩ <b>down</b>, |+⟩ and |−⟩ point right and left along the equator. And |ψ⟩ is you — the whole state. A capital Ψ is the state of a whole system (several qubits).',
    ], [
      `${G0('ket', 'ψ')} ${G0('ket0', '0')} ${G0('ket1', '1')} — <b>кети</b> <b>бірюзові</b>, а їхня рамка <b>⟩ має вістря вперед</b>: кет — це <b>стан</b>, відповідь (стовпчик чисел). <b>Форма рамки = РІД</b> символу.`,
      'Риска видає полюс: |0⟩ має риску <b>вгорі</b>, |1⟩ — <b>внизу</b>, |+⟩ і |−⟩ вказують праворуч і ліворуч по екватору. А |ψ⟩ — це ти, увесь стан. Велике Ψ — стан цілої системи (кількох кубітів).',
    ]),
    q1: () => Q0(['Tyrkysový symbol, ktorého rám končí hrotom dopredu ⟩, je…', ['ket — stav (odpoveď)', 'bra — otázka', 'operátor', 'pravdepodobnosť'], 'Tyrkysová + hrot dopredu = ket = stav. Bra je jeho zrkadlo ⟨, operátor fialová krabička, pravdepodobnosť biely stĺp.'],
      ['A cyan symbol whose frame ends in a forward point ⟩ is…', ['a ket — a state (an answer)', 'a bra — a question', 'an operator', 'a probability'], 'Cyan + forward point = ket = a state. A bra is its mirror ⟨, an operator a violet box, a probability a white pillar.'],
      ['Бірюзовий символ, рамка якого закінчується вістрям уперед ⟩, — це…', ['кет — стан (відповідь)', 'бра — питання', 'оператор', 'імовірність'], 'Бірюзовий + вістря вперед = кет = стан. Бра — його дзеркало ⟨, оператор — фіолетова коробка, імовірність — білий стовп.']),
    q2: () => Q0(['Glyf ketu s čiarkou hore je…', ['|0⟩ — severný pól', '|1⟩ — južný pól', '|+⟩ — rovník'], 'Hore = |0⟩ (sever), dole = |1⟩ (juh), |±⟩ sedia na rovníku.'],
      ['The ket glyph with a tick pointing up is…', ['|0⟩ — the north pole', '|1⟩ — the south pole', '|+⟩ — the equator'], 'Up = |0⟩ (north), down = |1⟩ (south), |±⟩ sit on the equator.'],
      ['Гліф кета з рискою вгорі — це…', ['|0⟩ — північний полюс', '|1⟩ — південний полюс', '|+⟩ — екватор'], 'Угорі = |0⟩ (північ), унизу = |1⟩ (південь), |±⟩ лежать на екваторі.']),
    draw(r, S, t) {
      const x = Math.sin(t * 1.4) * 0.22, k = Math.floor(t / 2.6) % 4, o = { emissive: 0.6 };
      D0.ket(r, S, x, 1.2, 1.1, 1, MC.ket);
      if (k === 1) r.arrow(S.P(x - 0.04, 1.85), S.P(x - 0.04, 2.2), MC.ket, 0.025, o);
      else if (k === 2) r.arrow(S.P(x - 0.04, 0.55), S.P(x - 0.04, 0.2), MC.ket, 0.025, o);
      else if (k === 3) r.arrow(S.P(x - 0.1, 1.95), S.P(x + 0.3, 1.95), MC.ket, 0.025, o);
      else r.sphere(S.P(x - 0.04, 1.2), 0.09, MC.ket, { emissive: 0.8 });
    },
    glyphAt: (t) => Math.floor(t / 2.6) % 4,
  },
  {
    id: 'bra', ch: 1, keys: ['bra'], chime: 'ket', glyph: () => G0('bra', 'a') + G0('ket', 'ψ'),
    name: tr('bra ⟨a| — otázka', 'bra ⟨a| — a question', 'бра ⟨a| — питання'),
    lines: () => tr([
      `${G0('bra', 'a')} je <b>bra</b>: zrkadlový ket. Tá istá tyrkysová rodina, ale hrot má <b>dozadu ⟨</b> — bra je <b>otázka</b> (riadok).`,
      'Pozri, ako sa stretnú: otázka ⟨a| a odpoveď |ψ⟩ zacvaknú do ⟨a|ψ⟩ — <b>jedno číslo</b>, amplitúda pre odpoveď a. Jej |…|² je pravdepodobnosť. Biely záblesk je to číslo, ktoré sa práve narodilo.',
    ], [
      `${G0('bra', 'a')} is a <b>bra</b>: a mirrored ket. The same cyan family, but its point faces <b>back ⟨</b> — a bra is a <b>question</b> (a row).`,
      'Watch them meet: the question ⟨a| and the answer |ψ⟩ snap together into ⟨a|ψ⟩ — <b>one number</b>, the amplitude for answer a. Its |…|² is the probability. The white flash is that number being born.',
    ], [
      `${G0('bra', 'a')} — це <b>бра</b>: дзеркальний кет. Та сама бірюзова родина, але вістря <b>назад ⟨</b> — бра є <b>питанням</b> (рядком).`,
      'Подивись, як вони зустрічаються: питання ⟨a| і відповідь |ψ⟩ зчіплюються в ⟨a|ψ⟩ — <b>одне число</b>, амплітуду для відповіді a. Її |…|² — імовірність. Білий спалах — це число, що щойно народилося.',
    ]),
    q1: () => Q0(['Čo vznikne, keď sa bra ⟨a| stretne s ketom |ψ⟩ ako ⟨a|ψ⟩?', ['jedno (komplexné) číslo — amplitúda', 'nový stav', 'operátor'], '⟨a|ψ⟩ je jediné číslo: amplitúda pre výsledok a. Naopak |ψ⟩⟨a| by bol operátor.'],
      ['What do you get when a bra ⟨a| meets a ket |ψ⟩ as ⟨a|ψ⟩?', ['one (complex) number — an amplitude', 'a new state', 'an operator'], '⟨a|ψ⟩ is a single number: the amplitude for outcome a. The other way round, |ψ⟩⟨a| would be an operator.'],
      ['Що виходить, коли бра ⟨a| зустрічає кет |ψ⟩ як ⟨a|ψ⟩?', ['одне (комплексне) число — амплітуда', 'новий стан', 'оператор'], '⟨a|ψ⟩ — одне число: амплітуда для результату a. Навпаки, |ψ⟩⟨a| був би оператором.']),
    q2: () => Q0(['Kam ukazuje rám bra a čo bra znamená?', ['dozadu ⟨ — otázka', 'dopredu ⟩ — stav', 'hore — stav |0⟩'], 'Bra = zrkadlový ket: ukazuje dozadu a je to otázka; ket je odpoveď.'],
      ['Which way does a bra’s frame point, and what is a bra?', ['back ⟨ — a question', 'forward ⟩ — a state', 'up — the state |0⟩'], 'Bra = a mirrored ket: it points back and it is the question; the ket is the answer.'],
      ['Куди вказує рамка бра і що таке бра?', ['назад ⟨ — питання', 'уперед ⟩ — стан', 'угору — стан |0⟩'], 'Бра = дзеркальний кет: вказує назад і є питанням; кет — відповідь.']),
    draw(r, S, t) {
      const u = (t % 4) / 4, d = u < 0.45 ? 1.0 - 0.8 * smooth0(u / 0.45) : u < 0.8 ? 0.2 : 0.2 + 0.8 * smooth0((u - 0.8) / 0.2);
      D0.ket(r, S, -d, 1.2, 1.0, -1, MC.ket);
      D0.ket(r, S, d, 1.2, 1.0, 1, MC.ket);
      S.lab('a', S.P(-d - 0.05, 0.5), 'a', 'axis'); S.lab('psi', S.P(d + 0.05, 0.5), 'ψ', 'axis');
      if (u > 0.45 && u < 0.8) {
        const k = (u - 0.45) / 0.35;
        r.sphere(S.P(0, 2.0), 0.08 + 0.1 * Math.sin(k * Math.PI), MC.P, { emissive: 1 });
        S.lab('n', S.P(0, 2.35), tr('číslo', 'a number', 'число'), 'axis');
      }
    },
  },

  // ===== 2. kapitola: uhly a fázy =====
  {
    id: 'theta', ch: 2, keys: ['θ'], chime: 'θ', glyph: () => G0('θ'),
    name: tr('θ — sklon od pólu', 'θ — tilt from the pole', 'θ — нахил від полюса'),
    lines: () => tr([
      `${G0('θ')} — <b>théta</b>, <b>vždy ružová</b>. <b>Théta = naklonenie od vrcholu</b>: uhol šípky stavu od severného pólu |0⟩. Piktogram za písmenom je sklon — <b>obrázok za písmenom = VÝZNAM</b>.`,
      'Pozri, ako sa ružový oblúk otvára: pri θ = 0 je šípka v |0⟩, pri θ = π v |1⟩. Modrý a červený stĺp ju nasledujú: P(0) = cos²(θ/2), P(1) = sin²(θ/2). <b>θ mení pravdepodobnosti.</b>',
    ], [
      `${G0('θ')} — <b>theta</b>, <b>always pink</b>. <b>Theta = Tilt from the Top</b>: the angle of the state arrow from the north pole |0⟩. The pictogram behind the letter is a tilt — <b>picture behind the letter = MEANING</b>.`,
      'Watch the pink arc open: at θ = 0 the arrow is at |0⟩, at θ = π at |1⟩. The blue and red pillars follow it: P(0) = cos²(θ/2), P(1) = sin²(θ/2). <b>θ changes the probabilities.</b>',
    ], [
      `${G0('θ')} — <b>тета</b>, <b>завжди рожева</b>. <b>Тета = нахил від верхівки</b>: кут стрілки стану від північного полюса |0⟩. Піктограма за літерою — нахил: <b>малюнок за літерою = ЗНАЧЕННЯ</b>.`,
      'Подивись, як розкривається рожева дуга: при θ = 0 стрілка в |0⟩, при θ = π — у |1⟩. Синій і червоний стовпи йдуть за нею: P(0) = cos²(θ/2), P(1) = sin²(θ/2). <b>θ змінює ймовірності.</b>',
    ]),
    q1: () => Q0(['Čo meria ružová θ?', ['sklon šípky stavu od |0⟩ (severného pólu)', 'otočenie po rovníku', 'globálnu fázu'], 'Ružová θ = naklonenie od vrcholu. Otočenie po rovníku je zelená φ, globálna fáza zlatá γ.'],
      ['What does pink θ measure?', ['the tilt of the state arrow from |0⟩ (the north pole)', 'the turn along the equator', 'the global phase'], 'Pink θ = tilt from the top. The turn along the equator is green φ, the global phase is gold γ.'],
      ['Що вимірює рожева θ?', ['нахил стрілки стану від |0⟩ (північного полюса)', 'оберт по екватору', 'глобальну фазу'], 'Рожева θ = нахил від верхівки. Оберт по екватору — зелена φ, глобальна фаза — золота γ.']),
    q2: () => Q0(['θ rastie od 0 po π. Čo sa stane s P(1)?', ['narastie od 0 po 1', 'nič — θ je fáza', 'klesne od 1 po 0'], 'P(1) = sin²(θ/2): 0 na severnom póle, 1 na južnom.'],
      ['θ grows from 0 to π. What happens to P(1)?', ['it grows from 0 to 1', 'nothing — θ is a phase', 'it falls from 1 to 0'], 'P(1) = sin²(θ/2): 0 at the north pole, 1 at the south pole.'],
      ['θ зростає від 0 до π. Що стається з P(1)?', ['зростає від 0 до 1', 'нічого — θ є фазою', 'спадає від 1 до 0'], 'P(1) = sin²(θ/2): 0 на північному полюсі, 1 на південному.']),
    draw(r, S, t) {
      const c = S.P(-0.25, 1.2), th = Math.PI / 2 * (1 - Math.cos(t * 0.7)), d = V3.add(V3.scale(UP0, Math.cos(th)), V3.scale(S.R, Math.sin(th)));
      D0.ball(r, c, 0.75);
      r.arrow(c, V3.add(c, V3.scale(d, 0.75)), MC.ket, 0.045, { emissive: 0.4 });
      r.arc(c, UP0, S.R, 0.4, th, MC.th);
      D0.dots(r, c, UP0, S.R, 0.4, th, MC.th);
      const p0 = Math.cos(th / 2) ** 2;
      D0.pillar(r, S.P(0.95, 0), p0, MC.a); D0.pillar(r, S.P(1.25, 0), 1 - p0, MC.b);
      S.lab('v', V3.add(c, V3.scale(V3.add(V3.scale(UP0, Math.cos(th / 2)), V3.scale(S.R, Math.sin(th / 2))), 0.58)), `<span class="mn-th">θ = ${Fmt.angle(th)}</span>`, 'axis');
      S.lab('p0', S.P(0.95, 1.6), `<span class="mn-a">P(0)</span>`, 'axis tiny'); S.lab('p1', S.P(1.25, 1.75), `<span class="mn-b">P(1)</span>`, 'axis tiny');
    },
  },
  {
    id: 'phi', ch: 2, keys: ['φ'], chime: 'φ', glyph: () => G0('φ'),
    name: tr('φ — relatívna fáza', 'φ — relative phase', 'φ — відносна фаза'),
    lines: () => tr([
      `${G0('φ')} — <b>fí</b>, <b>relatívna fáza</b>, <b>vždy zelená</b>. <b>Fí = otočka vrtuľky</b> okolo zvislej osi, po rovníku.`,
      'Pozri na stĺpy: kým sa φ točí, P(0) a P(1) sa <b>nepohnú</b>. φ je v meraní v Z-báze neviditeľná — ale rozhoduje o interferencii a iné bázy (X, Y) ju vidia. Pravidlo: <b>čo mení sklon, je ružové; čo točí okolo z, je zelené</b>.',
    ], [
      `${G0('φ')} — <b>phi</b>, the <b>relative phase</b>, <b>always green</b>. <b>Phi = the Fan’s turn</b> around the vertical axis, along the equator.`,
      'Look at the pillars: while φ spins, P(0) and P(1) <b>do not move</b>. φ is invisible to a Z-basis measurement — but it decides interference, and other bases (X, Y) can see it. Rule: <b>what changes the tilt is pink; what turns about z is green</b>.',
    ], [
      `${G0('φ')} — <b>фі</b>, <b>відносна фаза</b>, <b>завжди зелена</b>. <b>Фі = оберт вітрячка</b> навколо вертикальної осі, по екватору.`,
      'Глянь на стовпи: поки φ обертається, P(0) і P(1) <b>не рухаються</b>. φ невидима для вимірювання в базисі Z — але вона вирішує інтерференцію, а інші базиси (X, Y) її бачать. Правило: <b>що змінює нахил — рожеве; що обертає навколо z — зелене</b>.',
    ]),
    q1: () => Q0(['Zelená šípka φ sa točí po rovníku. Čo sa stane s P(0) a P(1) v Z-báze?', ['nič — φ ich nemení', 'P(0) narastie', 'vymenia sa'], 'φ je relatívna fáza: otočka okolo z. Pravdepodobnosti v Z-báze závisia len od θ.'],
      ['The green φ arrow turns along the equator. What happens to P(0) and P(1) in the Z basis?', ['nothing — φ does not change them', 'P(0) grows', 'they swap'], 'φ is the relative phase: a turn about z. Z-basis probabilities depend only on θ.'],
      ['Зелена стрілка φ обертається по екватору. Що стається з P(0) і P(1) у базисі Z?', ['нічого — φ їх не змінює', 'P(0) зростає', 'вони міняються місцями'], 'φ — відносна фаза: оберт навколо z. Імовірності в базисі Z залежать лише від θ.']),
    q2: () => Q0(['Ktorá dvojica farieb je správna?', ['θ ružová, φ zelená', 'θ zelená, φ ružová', 'obe zlaté'], 'Sklon θ je ružový, fáza φ zelená; zlatá je len globálna fáza γ.'],
      ['Which colour pair is right?', ['θ pink, φ green', 'θ green, φ pink', 'both gold'], 'The tilt θ is pink, the phase φ green; gold is only the global phase γ.'],
      ['Яка пара кольорів правильна?', ['θ рожева, φ зелена', 'θ зелена, φ рожева', 'обидві золоті'], 'Нахил θ рожевий, фаза φ зелена; золота лише глобальна фаза γ.']),
    draw(r, S, t) {
      const c = S.P(-0.25, 1.2), ph = (t * 0.9) % (2 * Math.PI), d = V3.add(V3.scale(S.R, Math.cos(ph)), V3.scale(S.F, Math.sin(ph)));
      D0.ball(r, c, 0.75);
      r.draw('circle', M4.trs(c, 0, 0.75), MC.ph, { alpha: 0.8 });
      r.arrow(c, V3.add(c, V3.scale(d, 0.75)), MC.ket, 0.045, { emissive: 0.4 });
      r.arc(c, S.R, S.F, 0.45, ph, MC.ph);
      D0.dots(r, c, S.R, S.F, 0.45, ph, MC.ph, 12);
      const top = S.P(-0.25, 2.05);
      for (let k = 0; k < 3; k++) { const a = ph * 2 + k * 2 * Math.PI / 3; r.rod(top, V3.add(top, V3.add(V3.scale(S.R, Math.cos(a) * 0.3), V3.scale(S.F, Math.sin(a) * 0.3))), MC.ph, 0.03, { emissive: 0.5 }); }
      D0.pillar(r, S.P(0.95, 0), 0.5, MC.a); D0.pillar(r, S.P(1.25, 0), 0.5, MC.b);
      S.lab('v', V3.add(c, V3.scale(V3.add(V3.scale(S.R, Math.cos(ph / 2)), V3.scale(S.F, Math.sin(ph / 2))), 0.62)), `<span class="mn-ph">φ = ${Fmt.angle(ph)}</span>`, 'axis');
      S.lab('p', S.P(1.1, 1.0), tr('P sa nehýbe', 'P stays put', 'P не рухається'), 'axis tiny');
    },
  },
  {
    id: 'gamma', ch: 2, keys: ['γ'], chime: 'γ', glyph: () => G0('γ') + G0('exp', 'iγ'),
    name: tr('γ — globálna fáza', 'γ — global phase', 'γ — глобальна фаза'),
    lines: () => tr([
      `${G0('γ')} ${G0('exp', 'iγ')} — <b>gama</b>, <b>globálna fáza</b>, <b>zlatá</b>. <b>Zlaté ozubené koliesko otáča všetko naraz.</b>`,
      'Obe ručičky — modrá α aj červená β — sa točia spolu s kolieskom. Nič relatívne sa nemení, preto γ <b>nezachytí žiadne meranie</b>: stĺpy stoja. Na ostrove je to zlatá ručička, ktorá krúži okolo teba, Psíčko.',
    ], [
      `${G0('γ')} ${G0('exp', 'iγ')} — <b>gamma</b>, the <b>global phase</b>, <b>gold</b>. <b>The Gold Gear turns everything at once.</b>`,
      'Both hands — blue α and red β — turn together with the gear. Nothing relative changes, so <b>no measurement can ever see γ</b>: the pillars stand still. On the island it is the golden hand circling you, Little Psi.',
    ], [
      `${G0('γ')} ${G0('exp', 'iγ')} — <b>гама</b>, <b>глобальна фаза</b>, <b>золота</b>. <b>Золота шестерня обертає все разом.</b>`,
      'Обидві стрілки — синя α і червона β — обертаються разом із шестернею. Нічого відносного не змінюється, тому γ <b>не вловить жодне вимірювання</b>: стовпи стоять. На острові це золота стрілка, що кружляє довкола тебе, Псічко.',
    ]),
    q1: () => Q0(['Prečo zlatú globálnu fázu γ nezachytí žiadne meranie?', ['otáča všetky amplitúdy spolu, nič relatívne sa nemení', 'je príliš malá', 'existuje len na ostrove'], 'Merania vidia len pomery a relatívne fázy amplitúd. Spoločné otočenie e<sup>iγ</sup> ich nemení.'],
      ['Why can no measurement detect the gold global phase γ?', ['it turns all amplitudes together, nothing relative changes', 'it is too small', 'it only exists on the island'], 'Measurements only see the ratios and relative phases of amplitudes. A common turn e<sup>iγ</sup> leaves them unchanged.'],
      ['Чому жодне вимірювання не вловить золоту глобальну фазу γ?', ['вона обертає всі амплітуди разом, нічого відносного не змінюється', 'вона замала', 'вона існує лише на острові'], 'Вимірювання бачать лише співвідношення й відносні фази амплітуд. Спільний оберт e<sup>iγ</sup> їх не змінює.']),
    q2: () => Q0(['e<sup>iγ</sup> pred celou zátvorkou je v rovnici zafarbené…', ['zlatou — globálna fáza', 'zelenou — relatívna fáza', 'ružovou'], 'Globálna fáza je zlatá a točí sa ako ozubené koliesko; zelené sú relatívne fázy.'],
      ['In an equation, e<sup>iγ</sup> in front of a whole bracket is coloured…', ['gold — global phase', 'green — relative phase', 'pink'], 'The global phase is gold and spins like a gear; relative phases are green.'],
      ['У рівнянні e<sup>iγ</sup> перед усією дужкою пофарбоване…', ['золотим — глобальна фаза', 'зеленим — відносна фаза', 'рожевим'], 'Глобальна фаза золота й обертається, як шестерня; відносні фази — зелені.']),
    draw(r, S, t) {
      const c = S.P(-0.25, 1.25), g = t * 1.1, o = { emissive: 0.5 };
      r.draw('torus', M4.orient(c, S.F, 0.62), MC.g, o);
      for (let k = 0; k < 10; k++) { const a = g + k * Math.PI / 5; r.sphere(V3.add(c, V3.add(V3.scale(S.R, Math.cos(a) * 0.7), V3.scale(UP0, Math.sin(a) * 0.7))), 0.065, MC.g, o); }
      const hand = (a, L, col) => r.arrow(c, V3.add(c, V3.add(V3.scale(S.R, Math.cos(a) * L), V3.scale(UP0, Math.sin(a) * L))), col, 0.035, { emissive: 0.4 });
      hand(g + 0.4, 0.5, MC.a); hand(g + 2.3, 0.36, MC.b);
      D0.pillar(r, S.P(0.95, 0), 0.66, MC.a); D0.pillar(r, S.P(1.25, 0), 0.34, MC.b);
      S.lab('p', S.P(1.1, 1.75), tr('P sa nehýbe', 'P stays put', 'P не рухається'), 'axis tiny');
    },
  },
  {
    id: 'expi', ch: 2, keys: ['exp', 'i'], chime: 'exp', glyph: () => G0('exp', 'iφ') + G0('i'),
    name: tr('e^{iφ} a i — otočenia', 'e^{iφ} and i — turns', 'e^{iφ} та i — оберти'),
    lines: () => tr([
      `${G0('exp', 'iφ')} — <b>fázový faktor</b>, zelený ako fázy: <b>e na i</b> = ručička hodín otočená o uhol v exponente. Jej dĺžka je vždy 1 — násobenie ním mení len smer, nie veľkosť.`,
      `${G0('i')} je <b>štvrť otáčky</b> (90°) — pozri, ako malé hodiny cvakajú. Dve štvrte = pol otáčky = −1: i·i = −1, a e<sup>iπ</sup> = −1. Toto „mínus“ odlišuje |+⟩ od |−⟩.`,
    ], [
      `${G0('exp', 'iφ')} — a <b>phase factor</b>, green like phases: <b>e to the i</b> = a clock hand turned by the angle in the exponent. Its length is always 1 — multiplying by it changes only the direction, not the size.`,
      `${G0('i')} is a <b>quarter turn</b> (90°) — watch the small clock click. Two quarters = half a turn = −1: i·i = −1, and e<sup>iπ</sup> = −1. That “minus” is what tells |+⟩ from |−⟩.`,
    ], [
      `${G0('exp', 'iφ')} — <b>фазовий множник</b>, зелений, як фази: <b>e в степені i</b> = стрілка годинника, повернута на кут у показнику. Її довжина завжди 1 — множення на неї змінює лише напрям, а не розмір.`,
      `${G0('i')} — це <b>чверть оберту</b> (90°) — подивись, як клацає маленький годинник. Дві чверті = пів оберту = −1: i·i = −1, а e<sup>iπ</sup> = −1. Саме цей «мінус» відрізняє |+⟩ від |−⟩.`,
    ]),
    q1: () => Q0(['Čo urobí s amplitúdou násobenie e<sup>iφ</sup>?', ['otočí jej ručičku o φ, dĺžka ostane', 'natiahne ju φ-krát', 'vynuluje ju'], 'e<sup>iφ</sup> je ručička dĺžky 1: násobenie ňou len otáča.'],
      ['What does multiplying an amplitude by e<sup>iφ</sup> do?', ['turns its hand by φ, the length stays', 'stretches it φ times', 'makes it zero'], 'e<sup>iφ</sup> is a hand of length 1: multiplying by it only turns.'],
      ['Що робить з амплітудою множення на e<sup>iφ</sup>?', ['повертає її стрілку на φ, довжина лишається', 'розтягує її в φ разів', 'обнуляє її'], 'e<sup>iφ</sup> — стрілка довжини 1: множення на неї лише повертає.']),
    q2: () => Q0(['Čo je i v obrázkovom jazyku?', ['štvrť otáčky (90°)', 'pol otáčky', 'celá otáčka', 'konštantná dĺžka ½'], 'i = 90°, i² = 180° = −1.'],
      ['What is i in the picture language?', ['a quarter turn (90°)', 'half a turn', 'a full turn', 'a constant length ½'], 'i = 90°, i² = 180° = −1.'],
      ['Що таке i мовою малюнків?', ['чверть оберту (90°)', 'пів оберту', 'повний оберт', 'стала довжина ½'], 'i = 90°, i² = 180° = −1.']),
    draw(r, S, t) {
      D0.clock(r, S.P(-0.55, 1.3), S.F, 0.48, MC.ph, t * 1.3, S);
      const k = Math.floor(t * 0.8), f = t * 0.8 - k;
      D0.clock(r, S.P(0.62, 1.3), S.F, 0.36, MC.ph, (k + smooth0(f * 4)) * Math.PI / 2, S);
      for (let q = 0; q < 4; q++) r.sphere(V3.add(S.P(0.62, 1.3), V3.add(V3.scale(S.R, Math.cos(q * Math.PI / 2) * 0.43), V3.scale(UP0, Math.sin(q * Math.PI / 2) * 0.43))), 0.035, MC.ph, { emissive: 0.8 });
      S.lab('e', S.P(-0.55, 0.62), tr('dĺžka 1', 'length 1', 'довжина 1'), 'axis tiny');
      S.lab('i', S.P(0.62, 0.75), ['1', 'i', '−1', '−i'][k % 4], 'axis');
    },
  },

  // ===== 3. kapitola: krabičky, stĺpy, rámy, tabuľka =====
  {
    id: 'ops', ch: 3, keys: ['X', 'Y', 'Z', 'H', 'S', 'T', 'I', 'U', 'Ĥ', 'Â'], chime: 'X',
    glyph: () => ['X', 'Y', 'Z', 'H', 'S', 'T', 'I', 'Ĥ', 'Â'].map((o) => G0(o)),
    glyphAt: (t) => Math.floor(t / 3.2) % 9,
    name: tr('operátory — fialové krabičky', 'operators — violet boxes', 'оператори — фіолетові коробки'),
    lines: () => tr([
      `Fialové <b>3D krabičky</b> sú <b>operátory</b> (hradlá): ${G0('X')} ${G0('Z')} ${G0('H')} ${G0('S')} ${G0('T')} … Krabička <b>pôsobí DOPRAVA</b> — na ket, ktorý stojí za ňou.`,
      `Pozri: krabička sa zatočí, potom sa ket za ňou preklopí. Na prednej stene je obrázok toho, čo robí: <b>X = preklopenie</b> (0 ↔ 1), <b>Z = otočka</b> (+ ↔ −), <b>H = polovičná výmena</b> z ↔ x, <b>S</b> štvrť a <b>T</b> osmina otáčky, <b>I</b> nerobí nič, ${G0('Ĥ')} je motor energie (blesk), ${G0('Â')} oko, ktoré sa pýta (meraná veličina).`,
    ], [
      `Violet <b>3D boxes</b> are <b>operators</b> (gates): ${G0('X')} ${G0('Z')} ${G0('H')} ${G0('S')} ${G0('T')} … A box <b>acts to the RIGHT</b> — on the ket standing after it.`,
      `Watch: the box spins, then the ket after it flips. The front face shows what it does: <b>X marks the flip</b> (0 ↔ 1), <b>Z twists</b> (+ ↔ −), <b>H = Halfway swap</b> z ↔ x, <b>S</b> a quarter and <b>T</b> a tiny eighth of a turn, <b>I</b> idles, ${G0('Ĥ')} is the energy engine (a bolt), ${G0('Â')} an eye that asks (a measured quantity).`,
    ], [
      `Фіолетові <b>3D-коробки</b> — це <b>оператори</b> (гейти): ${G0('X')} ${G0('Z')} ${G0('H')} ${G0('S')} ${G0('T')} … Коробка <b>діє ПРАВОРУЧ</b> — на кет, що стоїть після неї.`,
      `Дивись: коробка обертається, потім кет за нею перевертається. На передній стінці малюнок того, що вона робить: <b>X = переворот</b> (0 ↔ 1), <b>Z = оберт</b> (+ ↔ −), <b>H = пів-обмін</b> z ↔ x, <b>S</b> — чверть, <b>T</b> — восьмушка оберту, <b>I</b> нічого не робить, ${G0('Ĥ')} — двигун енергії (блискавка), ${G0('Â')} — око, що питає (вимірювана величина).`,
    ]),
    q1: () => Q0(['Na čo pôsobí operátor (fialová krabička) v rovnici?', ['doprava — na ket za ním', 'doľava', 'na obe strany rovnako'], 'Krabička pôsobí na to, čo stojí napravo: v H|0⟩ hradlo H mení ket |0⟩.'],
      ['What does an operator (violet box) in an equation act on?', ['to the right — on the ket after it', 'to the left', 'both sides equally'], 'A box acts on whatever stands to its right: in H|0⟩ the gate H changes the ket |0⟩.'],
      ['На що діє оператор (фіолетова коробка) у рівнянні?', ['праворуч — на кет після нього', 'ліворуч', 'на обидва боки однаково'], 'Коробка діє на те, що стоїть праворуч: у H|0⟩ гейт H змінює кет |0⟩.']),
    q2: () => Q0(['Krabička so zrkadlom z ↔ x („polovičná výmena“) je…', ['H — Hadamard', 'X', 'S', 'I'], 'H vymení osi z a x: pól ↔ rovník. X preklápa 0 ↔ 1, S je štvrť otáčky, I nerobí nič.'],
      ['The box with the mirror z ↔ x (“Halfway swap”) is…', ['H — Hadamard', 'X', 'S', 'I'], 'H swaps the z and x axes: pole ↔ equator. X flips 0 ↔ 1, S is a quarter turn, I does nothing.'],
      ['Коробка з дзеркалом z ↔ x («пів-обмін») — це…', ['H — Адамар', 'X', 'S', 'I'], 'H міняє осі z і x: полюс ↔ екватор. X перевертає 0 ↔ 1, S — чверть оберту, I нічого не робить.']),
    draw(r, S, t) {
      const u = (t % 3.2) / 3.2, n = Math.floor(t / 3.2), spin = u < 0.35 ? smooth0(u / 0.35) * 2 * Math.PI : 0;
      r.draw('box', M4.trs(S.P(-0.5, 1.2), S.yaw + spin, 0.62), MC.op, { emissive: u < 0.35 ? 0.6 : 0.25, alpha: 0.88 });
      r.arrow(S.P(-0.12, 1.75), S.P(0.28, 1.75), MC.op, 0.025, { emissive: 0.5 });
      const f = clamp((u - 0.35) / 0.25, 0, 1), up = (n + (f >= 0.5 ? 1 : 0)) % 2 === 0;
      D0.ket(r, S, 0.6, 1.2, 0.9, 1, MC.ket, Math.max(0.08, Math.abs(Math.cos(f * Math.PI))));
      if (f === 0 || f === 1) r.arrow(S.P(0.56, up ? 1.7 : 0.7), S.P(0.56, up ? 2.0 : 0.4), MC.ket, 0.025, { emissive: 0.6 });
      S.lab('k', S.P(0.95, 1.2), S.g(up ? 'k0' : 'k1', () => G0(up ? 'ket0' : 'ket1', up ? '0' : '1')), 'sym0 small');
    },
  },
  {
    id: 'P', ch: 3, keys: ['P'], chime: 'P', glyph: () => G0('P'),
    name: tr('P — stĺp pravdepodobnosti', 'P — the probability pillar', 'P — стовп імовірності'),
    lines: () => tr([
      `${G0('P')} — <b>pravdepodobnosť</b>, <b>biela</b>, nakreslená ako <b>stĺp</b> od 0 po 100 %.`,
      'Biela znamená: <b>už v nej nie je žiadna fáza</b>. Pravdepodobnosti sú to, čo merania počítajú. Zapamätaj si: <i>amplitúdy interferujú, pravdepodobnosti sa len merajú.</i>',
    ], [
      `${G0('P')} — <b>probability</b>, <b>white</b>, drawn as a <b>Pillar</b> from 0 to 100 %.`,
      'White means: <b>no phase left in it</b>. Probabilities are what measurements count. Remember: <i>amplitudes interfere, probabilities are only measured.</i>',
    ], [
      `${G0('P')} — <b>імовірність</b>, <b>біла</b>, намальована як <b>стовп</b> від 0 до 100 %.`,
      'Білий означає: <b>у ній уже немає фази</b>. Імовірності — це те, що рахують вимірювання. Запам’ятай: <i>амплітуди інтерферують, імовірності лише вимірюються.</i>',
    ]),
    q1: () => Q0(['Prečo je stĺp pravdepodobnosti biely (bez farby)?', ['už v ňom nie je žiadna fáza', 'je vždy 100 %', 'patrí k |0⟩'], 'Farba v mnemotechnike nesie KTO a fáza točenie; P je len číslo od 0 do 1 bez fázy — preto biela.'],
      ['Why is the probability pillar white (colourless)?', ['there is no phase left in it', 'it is always 100 %', 'it belongs to |0⟩'], 'Colour carries WHO and spin carries the phase; P is just a number from 0 to 1 with no phase — hence white.'],
      ['Чому стовп імовірності білий (безбарвний)?', ['у ньому вже немає фази', 'він завжди 100 %', 'він належить до |0⟩'], 'Колір несе ХТО, а обертання — фазу; P — лише число від 0 до 1 без фази, тому біле.']),
    q2: () => Q0(['Biely stĺp naplnený do polovice znamená…', ['P = 50 %', 'amplitúdu 0,5', 'fázu π/2'], 'Stĺp ukazuje priamo pravdepodobnosť. Amplitúda 1/√2 ≈ 0,71 dá P = ½.'],
      ['A white pillar filled halfway means…', ['P = 50 %', 'an amplitude of 0.5', 'a phase of π/2'], 'The pillar shows the probability directly. An amplitude of 1/√2 ≈ 0.71 gives P = ½.'],
      ['Білий стовп, заповнений наполовину, означає…', ['P = 50 %', 'амплітуду 0,5', 'фазу π/2'], 'Стовп показує безпосередньо ймовірність. Амплітуда 1/√2 ≈ 0,71 дає P = ½.']),
    draw(r, S, t) {
      const p = 0.5 + 0.5 * Math.sin(t * 0.8);
      D0.pillar(r, S.P(0, 0), p, MC.P, 1.9, 0.24);
      for (const q of [0.5, 1]) r.draw('torus', M4.trs(S.P(0, q * 1.9), 0, 0.3), [0.7, 0.72, 0.8], { alpha: 0.5 });
      S.lab('v', S.P(0.62, 0.05 + 1.9 * p), `<b>P = ${Fmt.pct(p)}</b>`, 'axis');
    },
  },
  {
    id: 'sq', ch: 3, keys: ['sq'], chime: 'P', glyph: () => G0('sq', 'α'),
    name: tr('|…|² — zarámovať a zmraziť', '|…|² — frame and freeze', '|…|² — оправити й заморозити'),
    lines: () => tr([
      `${G0('sq', 'α')} — <b>|…|² = zarámuj a zmraz</b>. Pozri: rám sa zaklapne okolo točiacej sa ručičky, ručička sa zastaví a zošedne — <b>fáza sa zahodí</b>.`,
      'Ostane len štvorec dĺžky: biely stĺp. To je Bornovo pravidlo P = |α|². Ručička dlhá 0,7 → stĺp 0,49.',
    ], [
      `${G0('sq', 'α')} — <b>|…|² = frame it and freeze it</b>. Watch: the frame snaps shut around the spinning hand, the hand stops and turns grey — <b>the phase is thrown away</b>.`,
      'Only the length squared survives: a white pillar. That is the Born rule P = |α|². A hand 0.7 long → a pillar of 0.49.',
    ], [
      `${G0('sq', 'α')} — <b>|…|² = оправ і заморозь</b>. Дивись: рамка закривається довкола стрілки, що обертається, стрілка зупиняється й сіріє — <b>фаза відкидається</b>.`,
      'Лишається тільки квадрат довжини: білий стовп. Це правило Борна P = |α|². Стрілка завдовжки 0,7 → стовп 0,49.',
    ]),
    q1: () => Q0(['Čo urobí |α|² s fázou α?', ['zahodí ju (ručička zamrzne)', 'zdvojnásobí ju', 'ponechá ju'], '|α|² = α·α* — fáza sa vyruší; ostane len dĺžka na druhú.'],
      ['What does |α|² do to the phase of α?', ['throws it away (the hand freezes)', 'doubles it', 'keeps it'], '|α|² = α·α* — the phase cancels; only the length squared remains.'],
      ['Що робить |α|² з фазою α?', ['відкидає її (стрілка замерзає)', 'подвоює її', 'зберігає її'], '|α|² = α·α* — фаза скорочується; лишається тільки квадрат довжини.']),
    q2: () => Q0(['Amplitúda dĺžky 0,5 dá pravdepodobnosť…', ['0,25', '0,5', '0,7'], 'P = |α|² = 0,5² = 0,25.'],
      ['An amplitude of length 0.5 gives a probability of…', ['0.25', '0.5', '0.7'], 'P = |α|² = 0.5² = 0.25.'],
      ['Амплітуда довжиною 0,5 дає ймовірність…', ['0,25', '0,5', '0,7'], 'P = |α|² = 0,5² = 0,25.']),
    draw(r, S, t) {
      const u = (t % 5) / 5, c = S.P(-0.3, 1.25), L = 0.5;
      const frozen = u >= 0.4, ang = frozen ? (Math.floor(t / 5) * 5 + 2) * 2.5 : t * 2.5, close = frozen ? smooth0((u - 0.4) / 0.1) : 0;
      const hs = 0.85 - 0.25 * close, fc = frozen ? [0.95, 0.95, 1] : [0.7, 0.72, 0.8];
      const q = (x, y) => V3.add(c, V3.add(V3.scale(S.R, x * hs), V3.scale(UP0, y * hs)));
      [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]].forEach(([a, b, d, e]) => r.rod(q(a, b), q(d, e), fc, 0.03, { emissive: frozen ? 0.6 : 0, alpha: frozen ? 1 : 0.5 }));
      r.arrow(c, V3.add(c, V3.add(V3.scale(S.R, Math.cos(ang) * L), V3.scale(UP0, Math.sin(ang) * L))), frozen ? [0.55, 0.57, 0.65] : MC.a, 0.04, { emissive: frozen ? 0 : 0.45 });
      const h = u < 0.5 ? 0 : smooth0((u - 0.5) / 0.3) * L * L;
      D0.pillar(r, S.P(0.9, 0), h, MC.P, 1.8, 0.13);
      S.lab('a', S.P(-0.3, 0.2), `<span class="mn-a">|α| = ${Fmt.num(L, 2)}</span>`, 'axis tiny');
      if (h > 0) S.lab('p', S.P(0.9, 0.2 + 1.8 * h + 0.15), `P = ${Fmt.num(h, 2)}`, 'axis tiny');
    },
  },
  {
    id: 'rho', ch: 3, keys: ['ρ'], chime: 'ρ', glyph: () => G0('ρ'),
    name: tr('ρ — tabuľka stavu, dekoherencia', 'ρ — the state table, decoherence', 'ρ — таблиця стану, декогеренція'),
    lines: () => tr([
      `${G0('ρ')} — <b>ró, matica hustoty</b>: záznamová tabuľka stavu 2 × 2. Na diagonále sú šance výsledku 0 (modrá) a 1 (červená).`,
      'Mimo diagonály sedia <b>koherencie</b>, zafarbené podľa svojej fázy. Pozri, ako blednú: to je <b>dekoherencia</b> — prostredie ich „odmeria“ a s nimi slabne interferencia. <b>Bledne = DEKOHERENCIA.</b> Diagonála sa pritom nepohne.',
    ], [
      `${G0('ρ')} — <b>rho, the density matrix</b>: the Record table of the state, 2 × 2. On the diagonal sit the chances of outcome 0 (blue) and 1 (red).`,
      'Off the diagonal sit the <b>coherences</b>, coloured by their phase. Watch them fade: that is <b>decoherence</b> — the environment “measures” them, and interference fades with them. <b>Fades = DECOHERENCE.</b> The diagonal does not move.',
    ], [
      `${G0('ρ')} — <b>ро, матриця густини</b>: таблиця запису стану 2 × 2. На діагоналі — шанси результату 0 (синій) і 1 (червоний).`,
      'Поза діагоналлю сидять <b>когерентності</b>, пофарбовані за своєю фазою. Подивись, як вони блякнуть: це <b>декогеренція</b> — довкілля їх «вимірює», і разом із ними слабне інтерференція. <b>Блякне = ДЕКОГЕРЕНЦІЯ.</b> Діагональ при цьому не рухається.',
    ]),
    q1: () => Q0(['Farebné bodky mimo diagonály ρ blednú. Čo sa deje?', ['dekoherencia — stráca sa interferencia', 'menia sa pravdepodobnosti', 'stav skolabuje do |0⟩'], 'Mimodiagonála nesie koherencie (fázové vzťahy). Ich blednutie = dekoherencia; diagonála (P(0), P(1)) ostáva.'],
      ['The coloured dots off the diagonal of ρ fade. What is happening?', ['decoherence — interference is being lost', 'the probabilities change', 'the state collapses to |0⟩'], 'The off-diagonal carries the coherences (phase relations). Their fading = decoherence; the diagonal (P(0), P(1)) stays.'],
      ['Кольорові точки поза діагоналлю ρ блякнуть. Що відбувається?', ['декогеренція — зникає інтерференція', 'змінюються ймовірності', 'стан колапсує в |0⟩'], 'Позадіагональ несе когерентності (фазові зв’язки). Їхнє блякнення = декогеренція; діагональ (P(0), P(1)) лишається.']),
    q2: () => Q0(['Čo je na diagonále ρ?', ['pravdepodobnosti 0 a 1 (modrá, červená)', 'koherencie', 'globálna fáza'], 'ρ₀₀ = P(0) (modrá), ρ₁₁ = P(1) (červená); koherencie sú mimo diagonály.'],
      ['What sits on the diagonal of ρ?', ['the probabilities of 0 and 1 (blue, red)', 'the coherences', 'the global phase'], 'ρ₀₀ = P(0) (blue), ρ₁₁ = P(1) (red); the coherences are off the diagonal.'],
      ['Що стоїть на діагоналі ρ?', ['імовірності 0 і 1 (синя, червона)', 'когерентності', 'глобальна фаза'], 'ρ₀₀ = P(0) (синя), ρ₁₁ = P(1) (червона); когерентності — поза діагоналлю.']),
    draw(r, S, t) {
      const c = S.P(0, 1.25), at = (x, y) => V3.add(c, V3.add(V3.scale(S.R, x * 0.4), V3.scale(UP0, y * 0.4)));
      for (const [x, y] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) r.draw('box', M4.trs(V3.add(at(x, y), V3.scale(S.F, -0.1)), S.yaw, [0.7, 0.7, 0.04]), MC.coh, { alpha: 0.25 });
      for (const s of [-1, 1]) {
        const x0 = s * 0.95;
        r.rod(at(x0, -1.05), at(x0, 1.05), MC.coh, 0.025);
        r.rod(at(x0, 1.05), at(x0 - s * 0.2, 1.05), MC.coh, 0.025); r.rod(at(x0, -1.05), at(x0 - s * 0.2, -1.05), MC.coh, 0.025);
      }
      r.sphere(at(-1, 1), 0.1 + 0.18 * 0.6, MC.a, { emissive: 0.4 });
      r.sphere(at(1, -1), 0.1 + 0.18 * 0.4, MC.b, { emissive: 0.4 });
      const u = (t % 6) / 6, coh = u < 0.15 ? 1 : Math.max(0, 1 - (u - 0.15) / 0.6), ph = t * 1.5;
      if (coh > 0.01) {
        r.sphere(at(1, 1), 0.04 + 0.16 * coh, hue0(ph), { emissive: 0.6, alpha: 0.2 + 0.8 * coh });
        r.sphere(at(-1, -1), 0.04 + 0.16 * coh, hue0(-ph), { emissive: 0.6, alpha: 0.2 + 0.8 * coh });
      }
      S.lab('c', S.P(0, 0.2), tr(`koherencia ${Math.round(coh * 100)} %`, `coherence ${Math.round(coh * 100)} %`, `когерентність ${Math.round(coh * 100)} %`), 'axis tiny');
    },
  },

  // ===== 4. kapitola: konštanty, udalosti a parametre =====
  {
    id: 'const', ch: 4, keys: ['ħ', 'π', 'Σ', '∂', '⊗', 'cos', 'sin', 'det'], chime: 'ħ', glyph: () => G0('ħ') + G0('π') + G0('Σ') + G0('∂') + G0('⊗'),
    name: tr('sivé a nehybné = KONŠTANTA', 'grey and still = CONSTANT', 'сіре й нерухоме = СТАЛА'),
    lines: () => tr([
      `<b>Sivé a nehybné = KONŠTANTA</b>: ${G0('ħ')} výška kvantového schodíka, ${G0('π')} pol otáčky, ${G0('Σ')} všetko zrátaj (kôpka), ${G0('∂')} presýpacie hodiny zmeny, ${G0('⊗')} dva spojené prstene — systémy vedľa seba. Sivé sú aj funkcie ${G0('cos')} ${G0('sin')} ${G0('det')}.`,
      'Tieto sa nikdy nehýbu — v hre ich nič neotáča. Čo sa v rovnici hýbe, je premenná: fáza sa kolíše, globálna fáza sa točí, amplitúda rastie. Všimni si, že tento podstavec je jediný úplne tichý.',
    ], [
      `<b>Grey and still = CONSTANT</b>: ${G0('ħ')} the height of the quantum step, ${G0('π')} half a turn, ${G0('Σ')} stack it all up, ${G0('∂')} the hourglass of change, ${G0('⊗')} two linked rings — systems side by side. Functions such as ${G0('cos')} ${G0('sin')} ${G0('det')} are grey too.`,
      'These never move — nothing in the game turns them. Whatever moves in an equation is a variable: a phase sways, the global phase spins, an amplitude grows. Notice that this pedestal is the only completely quiet one.',
    ], [
      `<b>Сіре й нерухоме = СТАЛА</b>: ${G0('ħ')} висота квантової сходинки, ${G0('π')} пів оберту, ${G0('Σ')} склади все (стос), ${G0('∂')} пісковий годинник змін, ${G0('⊗')} два зчеплені кільця — системи поруч. Сірі й функції ${G0('cos')} ${G0('sin')} ${G0('det')}.`,
      'Вони ніколи не рухаються — ніщо в грі їх не обертає. Що в рівнянні рухається, те змінна: фаза гойдається, глобальна фаза обертається, амплітуда росте. Зверни увагу: цей постамент — єдиний зовсім тихий.',
    ]),
    q1: () => Q0(['Sivý symbol, ktorý sa nikdy nehýbe, je…', ['konštanta alebo pevná funkcia (ħ, π, Σ…)', 'fáza', 'amplitúda, ktorá je nulová'], 'Sivé a nehybné = KONŠTANTA. Nulová amplitúda by mala svoju farbu, len by bola malá a bledá.'],
      ['A grey symbol that never moves is…', ['a constant or a fixed function (ħ, π, Σ…)', 'a phase', 'an amplitude that is zero'], 'Grey and still = CONSTANT. A zero amplitude would keep its colour, just small and faded.'],
      ['Сірий символ, що ніколи не рухається, — це…', ['стала або незмінна функція (ħ, π, Σ…)', 'фаза', 'амплітуда, що дорівнює нулю'], 'Сіре й нерухоме = СТАЛА. Нульова амплітуда мала б свій колір, лише малою й блідою.']),
    q2: () => Q0(['Ktorý obrázok patrí ⊗ (tenzorovému súčinu)?', ['dva spojené prstene — systémy vedľa seba', 'schodík', 'presýpacie hodiny', 'pol otáčky'], '⊗ spája systémy: dimenzie sa násobia. Schodík je ħ, presýpacie hodiny ∂, pol otáčky π.'],
      ['Which picture belongs to ⊗ (the tensor product)?', ['two linked rings — systems side by side', 'a step', 'an hourglass', 'half a turn'], '⊗ joins systems: the dimensions multiply. The step is ħ, the hourglass ∂, half a turn π.'],
      ['Який малюнок належить ⊗ (тензорному добутку)?', ['два зчеплені кільця — системи поруч', 'сходинка', 'пісковий годинник', 'пів оберту'], '⊗ поєднує системи: розмірності перемножуються. Сходинка — ħ, пісковий годинник — ∂, пів оберту — π.']),
    draw(r, S, t) {
      const K = MC.k, o = {}, xs = [-1.0, -0.5, 0, 0.5, 1.0];
      r.draw('box', M4.trs(S.P(xs[0], 0.1), S.yaw, [0.36, 0.2, 0.3]), K, o);                      // ħ: schodík
      r.draw('box', M4.trs(S.P(xs[0] + 0.09, 0.3), S.yaw, [0.18, 0.2, 0.3]), K, o);
      const pc = S.P(xs[1], 0.35);                                                                    // π: pol otáčky
      r.rod(V3.add(pc, V3.scale(S.R, -0.2)), V3.add(pc, V3.scale(S.R, 0.2)), K, 0.025, o);
      D0.dots(r, pc, S.R, UP0, 0.2, Math.PI, K, 12);
      for (let k = 0; k < 3; k++) r.draw('box', M4.trs(S.P(xs[2], 0.05 + k * 0.12), S.yaw, [0.34, 0.07, 0.3]), K, o); // Σ: kôpka
      r.draw('cone', M4.trs(S.P(xs[3], 0.0), 0, [0.16, 0.22, 0.16]), K, o);                        // ∂: presýpacie hodiny
      r.draw('cone', M4.alignY(S.P(xs[3], 0.44), [0, -1, 0], 0.22, 0.16), K, o);
      const tc = S.P(xs[4], 0.3);                                                                     // ⊗: prstene
      r.draw('torus', M4.orient(tc, UP0, 0.17), K, o);
      r.draw('torus', M4.orient(V3.add(tc, V3.scale(S.R, 0.17)), S.F, 0.17), K, o);
      ['ħ', 'π', 'Σ', '∂', '⊗'].forEach((k, i) => S.lab('g' + i, S.P(xs[i], 0.85), S.g('c' + i, () => G0(k)), 'sym0 small'));
      S.lab('f', S.P(0, 1.45), S.g('fn', () => G0('cos') + G0('sin') + G0('det')), 'sym0 small');
    },
  },
  {
    id: 'collapse', ch: 4, keys: ['P'], chime: 'P', glyph: () => '<span class="mn mn-m">⚡</span>',
    name: tr('záblesk a pád = KOLAPS', 'flash and drop = COLLAPSE', 'спалах і падіння = КОЛАПС'),
    lines: () => tr([
      '<span class="mn mn-m">⚡</span> <b>Záblesk a pád = KOLAPS</b>. Pred meraním sa vznášajú oba členy: modrý |0⟩ a červený |1⟩, každý veľký podľa svojej amplitúdy.',
      'Blesk! Prebehne meranie: jeden člen spadne a druhý sa stane celým stavom. V živej rovnici uvidíš to isté — rovnica blysne a člen, ktorý nenastal, padne. Bledožltá farba patrí meraniu a jeho udalostiam.',
    ], [
      '<span class="mn mn-m">⚡</span> <b>Flash and drop = COLLAPSE</b>. Before a measurement both terms hover: blue |0⟩ and red |1⟩, each as big as its amplitude.',
      'Flash! A measurement happens: one term drops away and the other becomes the whole state. In a live equation you see the same — the equation flashes and the term that did not happen falls. Pale yellow belongs to measurement and its events.',
    ], [
      '<span class="mn mn-m">⚡</span> <b>Спалах і падіння = КОЛАПС</b>. До вимірювання ширяють обидва члени: синій |0⟩ і червоний |1⟩, кожен завбільшки зі свою амплітуду.',
      'Спалах! Відбувається вимірювання: один член падає, а інший стає всім станом. У живому рівнянні побачиш те саме — рівняння спалахує, а член, що не стався, падає. Блідо-жовтий належить вимірюванню та його подіям.',
    ]),
    q1: () => Q0(['V živej rovnici blysne riadok a jeden člen odpadne. Čo sa stalo?', ['meranie — stav skolaboval do jedného výsledku', 'pôsobil operátor', 'otočila sa globálna fáza'], 'Záblesk a pád = KOLAPS: ostane jeden výsledok.'],
      ['In a live equation the line flashes and one term falls away. What happened?', ['a measurement — the state collapsed to one outcome', 'an operator acted', 'the global phase turned'], 'Flash and drop = COLLAPSE: one outcome remains.'],
      ['У живому рівнянні рядок спалахує і один член відпадає. Що сталося?', ['вимірювання — стан сколапсував в один результат', 'подіяв оператор', 'повернулася глобальна фаза'], 'Спалах і падіння = КОЛАПС: лишається один результат.']),
    q2: () => Q0(['Po záblesku člen, ktorý zostal…', ['sa stane celým stavom (pravdepodobnosť 1)', 'si nechá pôvodnú veľkosť', 'tiež zmizne'], 'Po meraní je stav celý v nameranom výsledku — opakované meranie dá to isté.'],
      ['After the flash, the surviving term…', ['becomes the whole state (probability 1)', 'keeps its old size', 'disappears too'], 'After a measurement the state is entirely the measured outcome — measuring again gives the same.'],
      ['Після спалаху член, що лишився…', ['стає всім станом (імовірність 1)', 'зберігає свій давній розмір', 'теж зникає'], 'Після вимірювання стан повністю в отриманому результаті — повторне вимірювання дасть те саме.']),
    draw(r, S, t) {
      const u = (t % 4) / 4, win = Math.floor(t / 4) % 2, col = [MC.a, MC.b], ra = [0.3, 0.24];
      for (let k = 0; k < 2; k++) {
        const x = k ? 0.45 : -0.45, lose = k !== win;
        let y = 1.3 + Math.sin(t * 2 + k) * 0.05, rad = ra[k], al = 1;
        if (u > 0.5) {
          const f = smooth0((u - 0.5) / 0.3);
          if (lose) { y = 1.3 - 1.1 * f; al = 1 - f; rad *= 1 - 0.6 * f; } else rad += (0.42 - rad) * f;
        }
        if (al > 0.02) r.sphere(S.P(x, y), rad, col[k], { emissive: 0.4, alpha: al });
        S.lab('k' + k, S.P(x, 1.85), S.g('k' + k, () => G0(k ? 'ket1' : 'ket0', k ? '1' : '0')), 'sym0 small' + (u > 0.6 && lose ? ' fade0' : ''));
      }
      if (u > 0.45 && u < 0.65) { const f = (u - 0.45) / 0.2; r.sphere(S.P(0, 1.3), 0.3 + 0.9 * f, MC.m, { alpha: 0.6 * (1 - f), emissive: 1, unlit: 1 }); }
    },
  },
  {
    id: 'srn', ch: 4, keys: ['σ', 'r', 'n'], chime: 'ket', glyph: () => G0('σ') + G0('r') + G0('n'),
    name: tr('σ, r, n — osi, Blochov vektor, otázka', 'σ, r, n — axes, Bloch vector, question', 'σ, r, n — осі, вектор Блоха, питання'),
    lines: () => tr([
      `${G0('σ')} — tri osi spinu x, y, z naraz (tyrkysová, rodina stavu). ${G0('r')} — <b>Blochov vektor</b>: šípka polomeru v guli; dĺžka 1 = čistý stav, kratšia = zmes.`,
      `${G0('n')} — <b>zlatá strelka kompasu</b>: smer, na ktorý sa meraním pýtame. Pravdepodobnosť zásahu je ½(1 + r·n) — čím viac r mieri k n, tým vyššia.`,
    ], [
      `${G0('σ')} — the three spin axes x, y, z at once (cyan, the state family). ${G0('r')} — the <b>Bloch vector</b>: the radius arrow in the ball; length 1 = a pure state, shorter = a mixture.`,
      `${G0('n')} — the <b>golden compass needle</b>: the direction a measurement asks about. The probability of a hit is ½(1 + r·n) — the more r points along n, the higher it is.`,
    ], [
      `${G0('σ')} — три осі спіну x, y, z разом (бірюзова, родина стану). ${G0('r')} — <b>вектор Блоха</b>: стрілка-радіус у кулі; довжина 1 = чистий стан, коротша = суміш.`,
      `${G0('n')} — <b>золота стрілка компаса</b>: напрям, про який питає вимірювання. Імовірність влучання ½(1 + r·n) — що більше r дивиться вздовж n, то вона вища.`,
    ]),
    q1: () => Q0(['Tyrkysová šípka r sa v guli skracuje. Čo to znamená?', ['stav sa stáva zmesou', 'stav sa mení na |0⟩', 'pôsobilo hradlo'], '|r| = 1 je čistý stav na povrchu, |r| < 1 zmes vo vnútri, stred = úplná zmes.'],
      ['The cyan r arrow gets shorter inside the ball. What does that mean?', ['the state is becoming a mixture', 'the state is turning into |0⟩', 'a gate acted'], '|r| = 1 is a pure state on the surface, |r| < 1 a mixture inside, the centre = fully mixed.'],
      ['Бірюзова стрілка r у кулі коротшає. Що це означає?', ['стан стає сумішшю', 'стан стає |0⟩', 'подіяв гейт'], '|r| = 1 — чистий стан на поверхні, |r| < 1 — суміш усередині, центр — повна суміш.']),
    q2: () => Q0(['Čo je zlaté n?', ['smer otázky (os merania)', 'globálna fáza', 'konštanta'], 'n je strelka kompasu: na ktorý smer sa pýtame. Zlatá ako „cieľ“, ktorý si volíme.'],
      ['What is the gold n?', ['the direction of the question (the measurement axis)', 'the global phase', 'a constant'], 'n is the compass needle: the direction we ask about. Gold like a “target” we choose.'],
      ['Що таке золоте n?', ['напрям питання (вісь вимірювання)', 'глобальна фаза', 'стала'], 'n — стрілка компаса: напрям, про який питаємо. Золота, як «ціль», яку ми обираємо.']),
    draw(r, S, t) {
      const c1 = S.P(-0.75, 1.0), o = { emissive: 0.4 };
      for (const [d, nm] of [[S.R, 'x'], [UP0, 'z'], [S.F, 'y']]) { r.arrow(c1, V3.add(c1, V3.scale(d, 0.42)), MC.ket, 0.025, o); S.lab('ax' + nm, V3.add(c1, V3.scale(d, 0.55)), nm, 'axis tiny'); }
      const c2 = S.P(0.45, 1.25), L = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.6)), a = t * 0.5;
      D0.ball(r, c2, 0.6);
      const d = V3.norm(V3.add(V3.scale(UP0, 0.8), V3.add(V3.scale(S.R, Math.cos(a) * 0.6), V3.scale(S.F, Math.sin(a) * 0.6))));
      r.arrow(c2, V3.add(c2, V3.scale(d, 0.6 * L)), MC.ket, 0.04, o);
      const n = V3.norm(V3.add(V3.scale(S.R, 0.7), V3.scale(UP0, 0.5)));
      r.arrow(c2, V3.add(c2, V3.scale(n, 0.68)), MC.g, 0.03, { emissive: 0.6 });
      S.lab('r', V3.add(c2, V3.scale(d, 0.6 * L + 0.18)), `<span class="mn-ket">|r| = ${Fmt.num(L, 2)}</span>`, 'axis tiny');
      S.lab('n', V3.add(c2, V3.scale(n, 0.85)), S.g('n', () => G0('n')), 'sym0 small');
      S.lab('s', S.P(-0.75, 1.7), S.g('s', () => G0('σ')), 'sym0 small');
    },
  },
  {
    id: 'nmr', ch: 4, keys: ['ω', 'Δ', 'Ω'], chime: 'φ', glyph: () => G0('ω') + G0('Δ') + G0('Ω'),
    name: tr('ω, Δ, Ω — fázy v pohybe', 'ω, Δ, Ω — phases in motion', 'ω, Δ, Ω — фази в русі'),
    lines: () => tr([
      `Fázy v pohybe, všetky zelené: ${G0('ω')} — ako rýchlo šípka krúži (<b>precesia</b>); ${G0('Δ')} — <b>rozdiel dvoch tónov</b>: ako ďaleko je rádio od rezonancie (pozri, ako sa dve zelené bodky rozchádzajú).`,
      `${G0('Ω')} je ružová ako θ, lebo <b>tlačí na sklon</b>: Rabiho frekvencia, ako rýchlo sa počas impulzu mení θ. Znova to isté pravidlo: <b>sklon ružovo, otáčanie okolo z zeleno</b>.`,
    ], [
      `Phases in motion, all green: ${G0('ω')} — how fast the arrow circles (<b>precession</b>); ${G0('Δ')} — the <b>Difference of two tones</b>: how far the radio is off resonance (watch the two green dots drift apart).`,
      `${G0('Ω')} is pink like θ, because it <b>pushes the tilt</b>: the Rabi frequency, how fast θ changes during a pulse. The same rule again: <b>tilt is pink, turning about z is green</b>.`,
    ], [
      `Фази в русі, усі зелені: ${G0('ω')} — як швидко кружляє стрілка (<b>прецесія</b>); ${G0('Δ')} — <b>різниця двох тонів</b>: наскільки радіо далеко від резонансу (подивись, як розходяться дві зелені точки).`,
      `${G0('Ω')} рожева, як θ, бо <b>штовхає нахил</b>: частота Рабі, як швидко змінюється θ під час імпульсу. Знову те саме правило: <b>нахил рожевий, оберт навколо z зелений</b>.`,
    ]),
    q1: () => Q0(['Prečo je Ω (Rabiho frekvencia) ružová, a nie zelená?', ['mení sklon θ', 'je to konštanta', 'je to globálna fáza'], 'Ružové je všetko, čo mení sklon; Ω určuje, ako rýchlo rastie θ.'],
      ['Why is Ω (the Rabi frequency) pink and not green?', ['it changes the tilt θ', 'it is a constant', 'it is the global phase'], 'Everything that changes the tilt is pink; Ω sets how fast θ grows.'],
      ['Чому Ω (частота Рабі) рожева, а не зелена?', ['вона змінює нахил θ', 'це стала', 'це глобальна фаза'], 'Рожеве все, що змінює нахил; Ω визначає, як швидко росте θ.']),
    q2: () => Q0(['Zelená šípka ω krúžiaca okolo zvislej osi ukazuje…', ['precesiu (uhlovú frekvenciu)', 'meranie', 'dekoherenciu'], 'ω = ako rýchlo šípka krúži okolo z — fáza v pohybe, preto zelená.'],
      ['The green ω arrow circling the vertical axis shows…', ['precession (angular frequency)', 'a measurement', 'decoherence'], 'ω = how fast the arrow circles about z — a phase in motion, hence green.'],
      ['Зелена стрілка ω, що кружляє довкола вертикальної осі, показує…', ['прецесію (кутову частоту)', 'вимірювання', 'декогеренцію'], 'ω = як швидко стрілка кружляє навколо z — фаза в русі, тому зелена.']),
    draw(r, S, t) {
      const c1 = S.P(-0.75, 0.8), tilt = 0.55, w = t * 2, o = { emissive: 0.45 };
      r.rod(c1, V3.add(c1, [0, 1.05, 0]), [0.5, 0.55, 0.7], 0.012);
      const d = V3.add(V3.scale(UP0, Math.cos(tilt)), V3.add(V3.scale(S.R, Math.sin(tilt) * Math.cos(w)), V3.scale(S.F, Math.sin(tilt) * Math.sin(w))));
      r.arrow(c1, V3.add(c1, V3.scale(d, 0.9)), MC.ph, 0.04, o);
      r.draw('circle', M4.trs(V3.add(c1, [0, 0.9 * Math.cos(tilt), 0]), 0, 0.9 * Math.sin(tilt)), MC.ph, { alpha: 0.6 });
      const c2 = S.P(0, 2.0);
      r.draw('circle', M4.trs(c2, 0, 0.3), MC.ph, { alpha: 0.5 });
      for (const sp of [2, 2.5]) r.sphere(V3.add(c2, V3.add(V3.scale(S.R, Math.cos(t * sp) * 0.3), V3.scale(S.F, Math.sin(t * sp) * 0.3))), 0.06, MC.ph, { emissive: 0.7 });
      const c3 = S.P(0.75, 0.8), th = 1.3 * (0.5 - 0.5 * Math.cos(t * 1.6)), d3 = V3.add(V3.scale(UP0, Math.cos(th)), V3.scale(S.R, Math.sin(th)));
      r.arrow(c3, V3.add(c3, V3.scale(d3, 0.9)), MC.ket, 0.04, o);
      r.arc(c3, UP0, S.R, 0.35, th, MC.th); D0.dots(r, c3, UP0, S.R, 0.35, th, MC.th, 6);
      const pr = (t * 0.8) % 1;
      r.draw('torus', M4.trs(c3, 0, 0.15 + pr * 0.5), MC.th, { alpha: 1 - pr, emissive: 0.6 });
      S.lab('w', S.P(-0.75, 2.05), S.g('w', () => G0('ω')), 'sym0 small');
      S.lab('D', S.P(0, 2.45), S.g('D', () => G0('Δ')), 'sym0 small');
      S.lab('O', S.P(0.75, 2.05), S.g('O', () => G0('Ω')), 'sym0 small');
    },
  },
  {
    id: 'ptA', ch: 4, keys: ['p', 't', 'A'], chime: 'P', glyph: () => G0('p') + G0('t') + G0('A'),
    name: tr('p, t, A — hmla, čas, cesty', 'p, t, A — fog, time, paths', 'p, t, A — туман, час, шляхи'),
    lines: () => tr([
      `${G0('p')} — <b>hmla prostredia</b> (bledožltá ako udalosti merania): koľko fázy si okolie odnesie. Pozri, ako hmla hustne a farebná bodka koherencie bledne. ${G0('t')} — sivé hodiny: čas.`,
      `${G0('A')} — <b>amplitúda cesty</b>: každá cesta k výsledku nesie vlastnú ručičku (biele šípky). Ručičky sa skladajú hlavou k päte <i>predtým</i>, ako sa umocní: P = |A₁ + A₂|². Keď mieria proti sebe, stĺp klesne na nulu.`,
    ], [
      `${G0('p')} — <b>the fog of the environment</b> (pale yellow, like measurement events): how much phase the surroundings carry away. Watch the fog thicken and the coloured coherence dot fade. ${G0('t')} — the grey clock: time.`,
      `${G0('A')} — a <b>path amplitude</b>: every path to an outcome carries its own hand (the white arrows). The hands add head to tail <i>before</i> squaring: P = |A₁ + A₂|². When they point against each other, the pillar drops to zero.`,
    ], [
      `${G0('p')} — <b>туман довкілля</b> (блідо-жовтий, як події вимірювання): скільки фази забирає оточення. Подивись, як туман густішає, а кольорова точка когерентності блякне. ${G0('t')} — сірий годинник: час.`,
      `${G0('A')} — <b>амплітуда шляху</b>: кожен шлях до результату несе власну стрілку (білі стрілки). Стрілки додаються «кінець до початку» <i>перед</i> піднесенням до квадрата: P = |A₁ + A₂|². Коли вони протилежні, стовп падає до нуля.`,
    ]),
    q1: () => Q0(['Ručičky dvoch ciest A₁ a A₂ mieria proti sebe (rovnako dlhé). Pravdepodobnosť výsledku je…', ['0 — vyrušia sa', '|A₁|² + |A₂|²', 'vždy ½'], 'Najprv sčítaj ručičky, až potom umocni: A₁ + A₂ = 0, teda P = 0 (deštruktívna interferencia).'],
      ['The hands of two paths A₁ and A₂ point against each other (equal length). The probability of the outcome is…', ['0 — they cancel', '|A₁|² + |A₂|²', 'always ½'], 'Add the hands first, then square: A₁ + A₂ = 0, so P = 0 (destructive interference).'],
      ['Стрілки двох шляхів A₁ і A₂ протилежні (однакової довжини). Імовірність результату…', ['0 — вони гасяться', '|A₁|² + |A₂|²', 'завжди ½'], 'Спершу додай стрілки, потім піднось до квадрата: A₁ + A₂ = 0, тож P = 0 (деструктивна інтерференція).']),
    q2: () => Q0(['Čo znamená bledá hmla p?', ['silu dekoherencie — fázu, ktorú si odnesie prostredie', 'pravdepodobnosť', 'čas'], 'p = hmla prostredia: čím hustejšia, tým viac koherencie (a interferencie) zmizne.'],
      ['What does the pale fog p stand for?', ['the strength of decoherence — phase carried off by the environment', 'probability', 'time'], 'p = the fog of the environment: the thicker it is, the more coherence (and interference) disappears.'],
      ['Що означає блідий туман p?', ['силу декогеренції — фазу, яку забирає довкілля', 'імовірність', 'час'], 'p = туман довкілля: що він густіший, то більше когерентності (й інтерференції) зникає.']),
    draw(r, S, t) {
      const c1 = S.P(-0.8, 1.1), fog = (t % 5) / 5;
      r.sphere(c1, 0.12 * (1 - fog) + 0.02, hue0(t * 1.5), { emissive: 0.7, alpha: 1 - 0.8 * fog });
      r.sphere(c1, 0.25 + 0.2 * fog, MC.m, { alpha: 0.08 + 0.3 * fog, unlit: 1 });
      r.sphere(c1, 0.45 * fog + 0.1, MC.m, { alpha: 0.05 + 0.15 * fog, unlit: 1 });
      S.lab('p', S.P(-0.8, 0.45), `<span class="mn-m">p = ${Fmt.num(fog, 1)}</span>`, 'axis tiny');
      const c2 = S.P(-0.1, 1.9);                                                                   // t: sivé hodiny (nehybné)
      r.draw('circle', M4.orient(c2, S.F, 0.25), MC.k);
      r.rod(c2, V3.add(c2, V3.add(V3.scale(S.R, -0.12), V3.scale(UP0, 0.1))), MC.k, 0.015);
      r.rod(c2, V3.add(c2, V3.add(V3.scale(S.R, 0.14), V3.scale(UP0, 0.12))), MC.k, 0.015);
      const O = S.P(0.0, 0.7), ph = Math.PI * (0.5 - 0.5 * Math.cos(t * 0.7)), L = 0.42;
      const A1 = V3.scale(S.R, L), A2 = V3.add(V3.scale(S.R, Math.cos(ph) * L), V3.scale(UP0, Math.sin(ph) * L)), sum = V3.add(A1, A2);
      r.arrow(O, V3.add(O, A1), MC.c, 0.03, { emissive: 0.2 });
      r.arrow(V3.add(O, A1), V3.add(O, sum), MC.c, 0.03, { emissive: 0.2 });
      if (V3.len(sum) > 0.03) r.arrow(O, V3.add(O, sum), MC.P, 0.04, { emissive: 0.8 });
      D0.pillar(r, S.P(1.15, 0), V3.len(sum) ** 2 / (4 * L * L), MC.P, 1.4, 0.1);
      S.lab('A', S.P(0.5, 0.45), 'P = |A₁ + A₂|²', 'axis tiny');
    },
  },

  // ===== 5. kapitola: obyčajné časti vzorca, zvuk a slovné pomôcky =====
  {
    id: 'plain', ch: 5, keys: [], chime: null,
    glyph: () => '<span class="m-num">2</span><span class="m-rel">=</span><span class="m-fn">cos</span><span class="m-br">(</span><span class="m-var">x</span><span class="m-op">+</span><span class="m-num">1</span><span class="m-br">)</span>',
    name: tr('obyčajné časti vzorca', 'the plain parts of a formula', 'звичайні частини формули'),
    lines: () => tr([
      'Aj obyčajné časti vzorca majú stálu farbu: <span class="m-num">čísla broskyňové</span>, <span class="m-rel">vzťahy (=, →, ≈) zlaté</span>, <span class="m-op">operácie (+ − · /) svetlomodré</span>, <span class="m-br">zátvorky a |…| tlmené</span>, <span class="m-fn">funkcie (cos, sin, Re) tyrkysovozelené</span>, <span class="m-var">premenné biele kurzívou</span>.',
      'Každý kvádrik na podstavci má farbu jednej časti. Vďaka tomu sa vzorec dá prečítať na prvý pohľad: zlatá ti ukáže, kde sa stretávajú dve strany. A každý vzorec vo vete sedí na vlastnom tmavom pozadí, takže vždy vidíš, kde začína a kde končí.',
    ], [
      'Even the plain parts of a formula have fixed colours: <span class="m-num">numbers peach</span>, <span class="m-rel">relations (=, →, ≈) gold</span>, <span class="m-op">operations (+ − · /) light blue</span>, <span class="m-br">brackets and |…| muted</span>, <span class="m-fn">functions (cos, sin, Re) teal</span>, <span class="m-var">variables white italic</span>.',
      'Every block on the pedestal has the colour of one part. That way a formula reads at a glance: gold shows you where the two sides meet. And every formula in a sentence sits on its own dark background, so you always see where it starts and where it ends.',
    ], [
      'Навіть звичайні частини формули мають сталий колір: <span class="m-num">числа персикові</span>, <span class="m-rel">відношення (=, →, ≈) золоті</span>, <span class="m-op">дії (+ − · /) світло-сині</span>, <span class="m-br">дужки й |…| приглушені</span>, <span class="m-fn">функції (cos, sin, Re) бірюзово-зелені</span>, <span class="m-var">змінні білі курсивом</span>.',
      'Кожен брусок на постаменті має колір однієї частини. Так формулу видно з першого погляду: золото покаже, де зустрічаються дві сторони. А кожна формула в реченні стоїть на власному темному тлі, тож завжди видно, де вона починається й де закінчується.',
    ]),
    q1: () => Q0(['Akú farbu má vo vzorci znak vzťahu = ?', ['zlatú', 'broskyňovú', 'svetlomodrú', 'tyrkysovozelenú'], 'Vzťahy (=, →, ≈) sú zlaté s medzerou okolo; broskyňové sú čísla, svetlomodré operácie, tyrkysovozelené funkcie.'],
      ['What colour is the relation sign = in a formula?', ['gold', 'peach', 'light blue', 'teal'], 'Relations (=, →, ≈) are gold with space around them; numbers are peach, operations light blue, functions teal.'],
      ['Якого кольору у формулі знак відношення = ?', ['золотого', 'персикового', 'світло-синього', 'бірюзово-зеленого'], 'Відношення (=, →, ≈) золоті з проміжком довкола; числа персикові, дії світло-сині, функції бірюзово-зелені.']),
    q2: () => Q0(['Broskyňové časti vzorca sú…', ['čísla', 'funkcie', 'operácie', 'zátvorky'], 'Čísla broskyňové, funkcie tyrkysovozelené, operácie svetlomodré, zátvorky tlmené.'],
      ['The peach-coloured parts of a formula are…', ['numbers', 'functions', 'operations', 'brackets'], 'Numbers peach, functions teal, operations light blue, brackets muted.'],
      ['Персикові частини формули — це…', ['числа', 'функції', 'дії', 'дужки'], 'Числа персикові, функції бірюзово-зелені, дії світло-сині, дужки приглушені.']),
    draw(r, S, t) {
      const parts = [['num', '2', 'm-num'], ['rel', '=', 'm-rel'], ['fn', 'cos', 'm-fn'], ['br', '(', 'm-br'], ['v', 'x', 'm-var'], ['opn', '+', 'm-op']];
      parts.forEach(([c, s, cls], k) => {
        const x = -1.0 + k * 0.4, y = 0.55 + 0.12 * Math.sin(t * 2 + k * 0.9);
        r.draw('box', M4.trs(S.P(x, y), S.yaw + Math.sin(t + k) * 0.3, 0.24), MC[c], { emissive: 0.35 });
        S.lab('p' + k, S.P(x, y + 0.42), `<span class="${cls}">${s}</span>`, 'sym0');
      });
    },
  },
  {
    id: 'sound', ch: 5, keys: [], chime: null, glyph: () => '🔊 💬',
    name: tr('zvuk = KTO a slovné pomôcky', 'sound = WHO and memory phrases', 'звук = ХТО і словесні підказки'),
    lines: () => tr([
      '🔊 <b>Zvuk = KTO</b>. Prejdi myšou po ľubovoľnom glyfe a zaznie: |0⟩ a α vysoko, |1⟩ a β nízko, θ klesne, fáza stúpne, operátor cvakne, pravdepodobnosť zazvoní. Počúvaj guľôčky — skáču tak vysoko, ako vysoko znejú.',
      '💬 A každý glyf má v bubline <b>slovnú pomôcku</b> — Alfa ukazuje hore, Beta mieri dole, X = preklopenie, T = tenučká osmina otáčky. Celý zoznam je za kľúčom 🔑 nad rovnicou (záložky Pravidlá a Slovník glyfov) a pri každom podstavci v paneli vpravo.',
    ], [
      '🔊 <b>Sound = WHO</b>. Hover over any glyph and it sings: |0⟩ and α high, |1⟩ and β low, θ falls, a phase rises, an operator clicks, a probability rings. Listen to the spheres — they jump as high as they sound.',
      '💬 And every glyph has a <b>memory phrase</b> in its tooltip — Alpha points Above, Beta goes Below, X marks the flip, T = a Tiny eighth turn. The full list is behind the 🔑 key above the equation (tabs Rules and Glyph dictionary) and in the panel on the right at every pedestal.',
    ], [
      '🔊 <b>Звук = ХТО</b>. Наведи мишу на будь-який гліф — і він зазвучить: |0⟩ і α високо, |1⟩ і β низько, θ спадає, фаза піднімається, оператор клацає, імовірність дзвенить. Слухай кульки — вони стрибають так високо, як високо звучать.',
      '💬 І кожен гліф має в підказці <b>словесну підказку</b> — Альфа вказує вгору, Бета дивиться вниз, X = переворот, T = тоненька восьмушка оберту. Увесь список — за ключем 🔑 над рівнянням (вкладки Правила й Словник гліфів) і в панелі праворуч біля кожного постаменту.',
    ]),
    q1: () => Q0(['Ktoré symboly znejú vysoko, keď po nich prejdeš myšou?', ['α a |0⟩', 'β a |1⟩', 'operátory'], 'Vysoko = hore = |0⟩ (aj α), nízko = dole = |1⟩ (aj β); operátor cvakne.'],
      ['Which symbols sound high when you hover over them?', ['α and |0⟩', 'β and |1⟩', 'operators'], 'High = up = |0⟩ (and α), low = down = |1⟩ (and β); an operator clicks.'],
      ['Які символи звучать високо, коли наводиш на них мишу?', ['α і |0⟩', 'β і |1⟩', 'оператори'], 'Високо = вгорі = |0⟩ (і α), низько = внизу = |1⟩ (і β); оператор клацає.']),
    q2: () => Q0(['Kde nájdeš každý glyf aj so slovnou pomôckou?', ['kľúč 🔑 → Slovník glyfov', 'len v leveli 9', 'nikde — treba sa ich naučiť naspamäť'], 'Kľúč 🔑 nad rovnicou má záložky Pravidlá a Slovník glyfov; bublina každého glyfu má jeho pomôcku.'],
      ['Where can you look up every glyph with its memory phrase?', ['the 🔑 key → Glyph dictionary', 'only in level 9', 'nowhere — learn them by heart'], 'The 🔑 key above the equation has the tabs Rules and Glyph dictionary; every glyph’s tooltip shows its phrase.'],
      ['Де знайти кожен гліф разом зі словесною підказкою?', ['ключ 🔑 → Словник гліфів', 'лише в рівні 9', 'ніде — їх треба вивчити напам’ять'], 'Ключ 🔑 над рівнянням має вкладки Правила й Словник гліфів; підказка кожного гліфа показує його фразу.']),
    draw(r, S, t, act, L) {
      const keys = ['α', 'β', 'θ', 'φ', 'X', 'P'], cols = [MC.a, MC.b, MC.th, MC.ph, MC.op, MC.P], hi = [1, 0.25, 0.7, 0.5, 0.2, 0.85];
      const j = Math.floor(t / 0.8) % 6, f = (t / 0.8) % 1;
      if (act && L.chimeJ !== j) { L.chimeJ = j; EqG.chime(keys[j] === 'X' ? 'X' : keys[j]); }
      keys.forEach((k, i) => {
        let y = 0.25;
        if (i === j) {
          const b = Math.sin(Math.PI * Math.min(1, f * 1.4));
          y += b * (i === 2 ? hi[i] * (1 - f) + 0.2 : i === 3 ? hi[i] * f + 0.2 : hi[i]) * 1.4;
        }
        r.sphere(S.P(-1.0 + i * 0.4, y), 0.14, cols[i], { emissive: i === j ? 0.8 : 0.3 });
        S.lab('g' + i, S.P(-1.0 + i * 0.4, -0.1), S.g('g' + i, () => G0(k)), 'sym0 small');
      });
    },
  },
];

// ktoré pravidlá kľúča 🔑 (indexy v MNEMO_RULES) exponát predvádza
const RULES0 = { alpha: [0, 3, 4, 5], beta: [0, 3], ket: [2, 3], bra: [2], theta: [1], phi: [5], gamma: [5], expi: [1, 5], ops: [6], P: [2], sq: [7], rho: [8],
  const: [10], collapse: [9], plain: [11], sound: [12, 13] };

// záverečná skúška: otázky naprieč všetkými exponátmi
const FINAL0 = () => [
  Q0(['Ktorý zoznam je správny?', ['α modrá · β červená · ket tyrkysový · operátor fialový', 'α červená · β modrá · ket fialový · operátor tyrkysový', 'α zlatá · β zelená · ket biely · operátor sivý'], 'Farba = KTO: α modrá, β červená, kety tyrkysové, operátory fialové krabičky.'],
    ['Which list is right?', ['α blue · β red · ket cyan · operator violet', 'α red · β blue · ket violet · operator cyan', 'α gold · β green · ket white · operator grey'], 'Colour = WHO: α blue, β red, kets cyan, operators violet boxes.'],
    ['Який список правильний?', ['α синя · β червона · кет бірюзовий · оператор фіолетовий', 'α червона · β синя · кет фіолетовий · оператор бірюзовий', 'α золота · β зелена · кет білий · оператор сірий'], 'Колір = ХТО: α синя, β червона, кети бірюзові, оператори — фіолетові коробки.']),
  Q0(['Ktorá vlastnosť glyfu hovorí KOĽKO?', ['veľkosť', 'farba', 'tvar rámu', 'zvuk'], 'Veľkosť = KOĽKO, farba = KTO, otáčanie = FÁZA, tvar rámu = DRUH, zvuk = KTO.'],
    ['Which property of a glyph tells HOW MUCH?', ['its size', 'its colour', 'its frame shape', 'its sound'], 'Size = HOW MUCH, colour = WHO, spin = PHASE, frame shape = KIND, sound = WHO.'],
    ['Яка властивість гліфа каже СКІЛЬКИ?', ['розмір', 'колір', 'форма рамки', 'звук'], 'Розмір = СКІЛЬКИ, колір = ХТО, обертання = ФАЗА, форма рамки = РІД, звук = ХТО.']),
  Q0(['Ktorá vlastnosť glyfu ukazuje FÁZU?', ['otáčanie — točiaca sa ručička', 'veľkosť', 'jas farby', 'rám'], 'Ručička okolo amplitúdy ukazuje uhol jej fázy; globálna fáza otáča celú zátvorku.'],
    ['Which property of a glyph shows the PHASE?', ['spin — the turning hand', 'size', 'brightness of the colour', 'the frame'], 'The hand around an amplitude shows the angle of its phase; the global phase turns the whole bracket.'],
    ['Яка властивість гліфа показує ФАЗУ?', ['обертання — стрілка, що крутиться', 'розмір', 'яскравість кольору', 'рамка'], 'Стрілка довкола амплітуди показує кут її фази; глобальна фаза обертає всю дужку.']),
  Q0(['Tvar rámu glyfu prezrádza…', ['DRUH: ket, bra, krabička operátora, stĺp', 'množstvo', 'fázu'], 'Ket ⟩ dopredu, bra ⟨ dozadu, operátor 3D krabička, pravdepodobnosť stĺp.'],
    ['The frame shape of a glyph tells you…', ['the KIND: ket, bra, operator box, pillar', 'the amount', 'the phase'], 'Ket ⟩ forward, bra ⟨ back, operator a 3D box, probability a pillar.'],
    ['Форма рамки гліфа підказує…', ['РІД: кет, бра, коробка оператора, стовп', 'кількість', 'фазу'], 'Кет ⟩ уперед, бра ⟨ назад, оператор — 3D-коробка, імовірність — стовп.']),
  Q0(['Zelený symbol je najskôr…', ['relatívna fáza alebo fázový faktor (φ, e<sup>iφ</sup>, i, ω)', 'amplitúda |1⟩', 'pravdepodobnosť'], 'Zelená = fáza a otáčanie okolo z. Amplitúda |1⟩ je červená β, pravdepodobnosť biela.'],
    ['A green symbol is most likely…', ['a relative phase or a phase factor (φ, e<sup>iφ</sup>, i, ω)', 'the amplitude of |1⟩', 'a probability'], 'Green = phase and turning about z. The amplitude of |1⟩ is red β, a probability is white.'],
    ['Зелений символ — це найпевніше…', ['відносна фаза або фазовий множник (φ, e<sup>iφ</sup>, i, ω)', 'амплітуда |1⟩', 'імовірність'], 'Зелений = фаза й оберт навколо z. Амплітуда |1⟩ — червона β, імовірність — біла.']),
  Q0(['Pred zátvorkou sa točí zlaté e<sup>iγ</sup> a stĺpy pravdepodobnosti sa nehýbu. Prečo?', ['je to globálna fáza — nepozorovateľná', 'je to interferencia', 'je to kolaps'], 'Zlaté koliesko otáča všetky amplitúdy spolu; nič relatívne sa nemení.'],
    ['A gold e<sup>iγ</sup> spins in front of a bracket and the probability pillars do not move. Why?', ['it is the global phase — unobservable', 'it is interference', 'it is a collapse'], 'The gold gear turns all amplitudes together; nothing relative changes.'],
    ['Перед дужкою обертається золоте e<sup>iγ</sup>, а стовпи ймовірності не рухаються. Чому?', ['це глобальна фаза — неспостережувана', 'це інтерференція', 'це колапс'], 'Золота шестерня обертає всі амплітуди разом; нічого відносного не змінюється.']),
  Q0(['Ktorý symbol mení pravdepodobnosti v Z-báze?', ['θ (ružová)', 'φ (zelená)', 'γ (zlatá)'], 'P(0) = cos²(θ/2): mení ju len sklon θ. φ a γ sú fázy.'],
    ['Which symbol changes the Z-basis probabilities?', ['θ (pink)', 'φ (green)', 'γ (gold)'], 'P(0) = cos²(θ/2): only the tilt θ changes it. φ and γ are phases.'],
    ['Який символ змінює ймовірності в базисі Z?', ['θ (рожева)', 'φ (зелена)', 'γ (золота)'], 'P(0) = cos²(θ/2): її змінює лише нахил θ. φ і γ — фази.']),
  Q0(['V zápise H|0⟩: čo pôsobí na čo?', ['krabička H pôsobí na ket |0⟩ napravo', '|0⟩ pôsobí na H', 'násobia sa ako čísla'], 'Operátor pôsobí DOPRAVA: H|0⟩ = |+⟩.'],
    ['In H|0⟩, what acts on what?', ['the box H acts on the ket |0⟩ to its right', '|0⟩ acts on H', 'they multiply like numbers'], 'An operator acts to the RIGHT: H|0⟩ = |+⟩.'],
    ['У записі H|0⟩ що діє на що?', ['коробка H діє на кет |0⟩ праворуч', '|0⟩ діє на H', 'вони множаться як числа'], 'Оператор діє ПРАВОРУЧ: H|0⟩ = |+⟩.']),
  Q0(['Čo z toho je číslo?', ['⟨ψ|ψ⟩ (najprv bra, potom ket)', '|ψ⟩⟨ψ|', 'oboje'], 'Otázka ⟨ψ| krát odpoveď |ψ⟩ = číslo (tu 1). Naopak |ψ⟩⟨ψ| je operátor (projektor).'],
    ['Which of these is a number?', ['⟨ψ|ψ⟩ (bra first, then ket)', '|ψ⟩⟨ψ|', 'both'], 'The question ⟨ψ| times the answer |ψ⟩ = a number (here 1). The other way round, |ψ⟩⟨ψ| is an operator (a projector).'],
    ['Що з цього є числом?', ['⟨ψ|ψ⟩ (спершу бра, потім кет)', '|ψ⟩⟨ψ|', 'обидва'], 'Питання ⟨ψ| на відповідь |ψ⟩ = число (тут 1). Навпаки, |ψ⟩⟨ψ| — оператор (проєктор).']),
  Q0(['Koherencia v ρ bledne, diagonála ostáva. Stav…', ['stráca interferenciu, ale P v Z-báze si drží', 'skolabuje do |1⟩', 'získava energiu'], 'Bledne = DEKOHERENCIA: zmiznú fázové vzťahy, pravdepodobnosti na diagonále ostanú.'],
    ['A coherence in ρ fades while the diagonal stays. The state…', ['loses interference but keeps its Z-basis P', 'collapses to |1⟩', 'gains energy'], 'Fades = DECOHERENCE: the phase relations vanish, the probabilities on the diagonal stay.'],
    ['Когерентність у ρ блякне, діагональ лишається. Стан…', ['втрачає інтерференцію, але зберігає P в базисі Z', 'колапсує в |1⟩', 'набирає енергію'], 'Блякне = ДЕКОГЕРЕНЦІЯ: фазові зв’язки зникають, імовірності на діагоналі лишаються.']),
  Q0(['Sivé a nehybné znamená…', ['konštantu', 'nulovú pravdepodobnosť', 'už odmerané'], 'Sivé a nehybné = KONŠTANTA (ħ, π, Σ, funkcie).'],
    ['Grey and still means…', ['a constant', 'zero probability', 'already measured'], 'Grey and still = CONSTANT (ħ, π, Σ, functions).'],
    ['Сіре й нерухоме означає…', ['сталу', 'нульову ймовірність', 'уже виміряне'], 'Сіре й нерухоме = СТАЛА (ħ, π, Σ, функції).']),
  Q0(['P = |A₁ + A₂|²: ktoré pravidlo?', ['najprv sčítaj ručičky, potom umocni', 'umocni každú, potom sčítaj', 'vynásob stĺpy'], 'Amplitúdy interferujú — sčítajú sa ako ručičky; pravdepodobnosť je až štvorec súčtu.'],
    ['P = |A₁ + A₂|²: which rule?', ['add the hands first, then square', 'square each, then add', 'multiply the pillars'], 'Amplitudes interfere — they add like hands; the probability is only the square of the sum.'],
    ['P = |A₁ + A₂|²: яке правило?', ['спершу додай стрілки, потім піднеси до квадрата', 'піднеси кожну, потім додай', 'перемнож стовпи'], 'Амплітуди інтерферують — додаються як стрілки; імовірність — лише квадрат суми.']),
];

const CHAPTERS0 = {
  1: () => tr(['<b>1. kapitola — farba = KTO.</b> Najprv hlavné postavy každej rovnice: dve amplitúdy a stavy, ktoré nesú.', '<b>Chapter 1 — colour = WHO.</b> First the main characters of every equation: the two amplitudes and the states they belong to.', '<b>Розділ 1 — колір = ХТО.</b> Спершу головні персонажі кожного рівняння: дві амплітуди та стани, яким вони належать.']),
  2: () => tr(['<b>2. kapitola — uhly a fázy.</b> Ružová nakláňa, zelená točí, zlatá točí všetko naraz.', '<b>Chapter 2 — angles and phases.</b> Pink tilts, green turns, gold turns everything at once.', '<b>Розділ 2 — кути й фази.</b> Рожеве нахиляє, зелене обертає, золоте обертає все разом.']),
  3: () => tr(['<b>3. kapitola — krabičky, stĺpy, rámy a tabuľka.</b> Ako vyzerá to, čo so stavom robíme, a to, čo z neho nameriame.', '<b>Chapter 3 — boxes, pillars, frames and a table.</b> What the things we do to a state look like, and what we measure from it.', '<b>Розділ 3 — коробки, стовпи, рамки й таблиця.</b> Як виглядає те, що ми робимо зі станом, і те, що з нього вимірюємо.']),
  4: () => tr(['<b>4. kapitola — konštanty, udalosti a parametre.</b> Čo sa nikdy nehýbe, čo blysne a čo riadi pohyb.', '<b>Chapter 4 — constants, events and parameters.</b> What never moves, what flashes, and what drives the motion.', '<b>Розділ 4 — сталі, події й параметри.</b> Що ніколи не рухається, що спалахує і що керує рухом.']),
  5: () => tr(['<b>5. kapitola — obyčajné časti a zmysly.</b> Aj čísla a znamienka majú farbu — a symboly majú aj zvuk.', '<b>Chapter 5 — the plain parts and the senses.</b> Even numbers and signs have a colour — and symbols have a sound too.', '<b>Розділ 5 — звичайні частини й чуття.</b> Навіть числа й знаки мають колір — а символи ще й звук.']),
};

class L0Symbols extends Level {
  get steps() { return [this.intro, this.ch1, this.ch2, this.ch3, this.ch4, this.ch5]; }

  enter(resume) {
    super.enter(resume);
    if (Settings.wow) { Wow.inst = null; document.body.dataset.scene = 'inst'; } // sieň symbolov nie je inštancia s bossom
  }
  setup() {
    this.cam = new OrbitCam([0, 1.4, 0], 15, 0, 0.55, 2.5, 26);
    const n = EXHIBITS0.length, RAD = 8;
    this.ex = EXHIBITS0.map((e, i) => {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2, out = [Math.cos(a), 0, Math.sin(a)];
      const F = V3.scale(out, -1), R = [-out[2], 0, out[0]], b = [out[0] * RAD, 0.9, out[2] * RAD];
      const cache = {};
      const S = {
        R, F, yaw: Math.atan2(F[0], F[2]),
        P: (x, y, z = 0) => [b[0] + R[0] * x + F[0] * z, b[1] + y, b[2] + R[2] * x + F[2] * z],
        lab: (k, p, html, cls = 'axis', tip = null) => UI.label('l0' + e.id + k, p, html, cls, tip),
        g: (k, f) => (cache[k] ??= f()), // glyfy sa počítajú raz
      };
      return { ...e, i, b, S, gl: e.glyph(), name: e.name };
    });
    this.focus = -1; this.revealed = -1; this.camT = 99; this.chimeJ = -1;
  }

  // ---------- priebeh ----------
  intro() {
    this.quest(tr('Vypočuj si Amplitúdu', 'Listen to Amplitude', 'Послухай Амплітуду'), { easy: tr('💬 Amplitúda', '💬 Amplitude', '💬 Амплітуда') });
    this.say(tr([
      'Vitaj v <b>Sieni symbolov</b> — v leveli 0. Skôr než ti mentori začnú písať rovnice, nauč sa ich <b>čítať na prvý pohľad</b>.',
      'Každý symbol v hre má svoj kód: <b>farba = KTO</b> to je, <b>veľkosť = KOĽKO</b> ho je, <b>otáčanie = jeho FÁZA</b>. Obrázok za písmenom prezradí <b>význam</b>, tvar rámu <b>druh</b>.',
      'Na každom z 19 podstavcov stojí jeden symbol, postavený v 3D presne v tej farbe, akú má v rovniciach. Pozoruj, ako sa hýbe, a potom ťa vyskúšam. Po každej kapitole príde opakovanie a na konci veľká skúška. Kamerou môžeš kedykoľvek otáčať.',
    ], [
      'Welcome to the <b>Hall of Symbols</b> — level 0. Before the mentors start writing equations at you, learn to <b>read them at a glance</b>.',
      'Every symbol in the game has its code: <b>colour = WHO</b> it is, <b>size = HOW MUCH</b> of it there is, <b>spin = its PHASE</b>. The picture behind a letter gives away its <b>meaning</b>, the shape of its frame its <b>kind</b>.',
      'Each of the 19 pedestals holds one symbol, built in 3D in exactly the colour it has in the equations. Watch it move, then I will test you. After every chapter there is a review and at the end a big exam. You can turn the camera at any time.',
    ], [
      'Ласкаво просимо до <b>Зали символів</b> — рівня 0. Перш ніж наставники почнуть писати тобі рівняння, навчися <b>читати їх з першого погляду</b>.',
      'Кожен символ у грі має свій код: <b>колір = ХТО</b> це, <b>розмір = СКІЛЬКИ</b> його, <b>обертання = його ФАЗА</b>. Малюнок за літерою видає <b>значення</b>, форма рамки — <b>рід</b>.',
      'На кожному з 19 постаментів стоїть один символ, збудований у 3D саме в тому кольорі, який він має в рівняннях. Подивись, як він рухається, а потім я тебе перевірю. Після кожного розділу — повторення, а наприкінці — великий іспит. Камеру можна обертати будь-коли.',
    ]), () => this.next());
  }
  ch1() { this.chapter(1); }
  ch2() { this.chapter(2); }
  ch3() { this.chapter(3); }
  ch4() { this.chapter(4); }
  ch5() { this.chapter(5); }

  chapter(ch) {
    const list = this.ex.filter((e) => e.ch === ch), k0 = this.sub.k | 0;
    this.revealed = Math.max(this.revealed, list[0].i - 1 + k0);
    const run = (k) => {
      if (k >= list.length) return this.review(ch, list);
      this.sub.k = k; Game.save();
      const e = list[k];
      this.show(e);
      this.quest(`${e.name}`, { easy: `${k + 1} / ${list.length}`, hard: tr(`Kapitola ${ch} · ${k + 1}/${list.length}`, `Chapter ${ch} · ${k + 1}/${list.length}`, `Розділ ${ch} · ${k + 1}/${list.length}`) });
      this.say(e.lines(), () => this.ask(e.q1(), () => run(k + 1)));
    };
    if (k0 > 0) return run(k0);
    this.focus = -1; this.camT = 0;
    this.say([CHAPTERS0[ch]()], () => run(0));
  }
  review(ch, list) {
    this.sub.k = list.length; Game.save();
    this.focus = -1; this.camT = 0;
    UI.panelHide();
    this.quest(tr(`Opakovanie kapitoly ${ch}`, `Chapter ${ch} review`, `Повторення розділу ${ch}`), { easy: tr('📝 Opakovanie', '📝 Review', '📝 Повторення') });
    this.say([tr(`Opakovanie kapitoly ${ch}: ${list.length} otázok k tomu, čo si práve videl(a). Pozri sa kľudne po podstavcoch — všetky sa stále hýbu.`,
      `Chapter ${ch} review: ${list.length} questions on what you have just seen. Feel free to look around the pedestals — they all keep moving.`,
      `Повторення розділу ${ch}: ${list.length} питань про те, що ти щойно побачив(-ла). Можеш роззирнутися по постаментах — вони й далі рухаються.`)], () =>
      UI.quizSeries(shuffle0(list.map((e) => this.q(e.q2()))), (m) => { this.mistakes += m; this.next(); }));
  }
  q(x) { return { who: this.mentor, face: this.face, ...x }; }
  show(e) {
    this.focus = e.i; this.revealed = Math.max(this.revealed, e.i); this.camT = 0;
    if (e.chime) EqG.chime(e.chime);
    // panel vpravo: glyfy exponátu zo slovníka (obrázok, názov, slovná pomôcka)
    const D = EqG.dict(), sample = { ket: 'ψ', ket0: '0', ket1: '1', ketpm: '+', bra: 'a', exp: 'iφ', sq: 'α' };
    const cards = e.keys.map((k) => `<div class="gd"><span class="gly big g-${k === 'sq' ? 'a' : D[k][0]}">${EqG.svg(k, sample[k] ?? k)}</span><div><b>${D[k][2]}</b><small>${D[k][3]}</small></div></div>`).join('');
    const rules = (RULES0[e.id] || []).map((i) => MNEMO_RULES[i]); // pravidlá kľúča 🔑, ktoré exponát ukazuje
    UI.panelSet(`${e.i + 1} / ${this.ex.length} · <span class="l0name">${e.name}</span>`, [
      UI.info(`<div class="l0big">${Array.isArray(e.gl) ? e.gl.join(' ') : e.gl}</div>`),
      ...(cards ? [UI.info(`<div class="eqlegend inline">${cards}</div>`)] : []),
      ...(rules.length ? [UI.info(`<div class="eqlegend inline">${rules.map(([d, h, x]) => `<div class="rule"><span class="demo">${typeof d === 'function' ? d() : d}</span><div><b>${h}</b><small>${x}</small></div></div>`).join('')}</div>`)] : []),
      UI.info(tr('💡 Kamerou môžeš otáčať — exponát sa hýbe stále.', '💡 Turn the camera as you like — the exhibit keeps moving.', '💡 Камеру можна обертати — експонат рухається постійно.'), 'tip'),
    ]);
  }

  finale() {
    UI.panelHide();
    this.focus = -1; this.camT = 0; this.revealed = this.ex.length - 1;
    const pool = shuffle0(EXHIBITS0.flatMap((e) => [e.q1, e.q2])).slice(0, 8).map((f) => f());
    const list = shuffle0([...FINAL0(), ...pool]).map((x) => this.q(x));
    this.quest(tr('Veľká skúška symbolov', 'The big symbol exam', 'Великий іспит символів'), { easy: tr('📝 Skúška', '📝 Exam', '📝 Іспит'), hard: tr(`${list.length} otázok naprieč všetkými podstavcami`, `${list.length} questions across all pedestals`, `${list.length} питань з усіх постаментів`) });
    this.say([tr(`Všetkých 19 podstavcov svieti. Teraz <b>veľká skúška</b>: ${list.length} otázok naprieč celou sieňou — farby, tvary, pohyby aj zvuky.`,
      `All 19 pedestals are lit. Now the <b>big exam</b>: ${list.length} questions across the whole hall — colours, shapes, motions and sounds.`,
      `Усі 19 постаментів світяться. Тепер <b>великий іспит</b>: ${list.length} питань з усієї зали — кольори, форми, рухи й звуки.`)], () =>
      UI.quizSeries(list, (m) => {
        this.mistakes += m;
        const total = list.length + this.ex.length * 2, k = this.mistakes / total;
        const stars = byDiff(k <= 0.1 ? 3 : k <= 0.25 ? 2 : 1, k <= 0.05 ? 3 : k <= 0.15 ? 2 : 1, k === 0 ? 3 : k <= 0.08 ? 2 : 1);
        Game.completeLevel(0, stars);
        const rating = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        this.say([tr(`Sieň symbolov dokončená! Hodnotenie: <b>${rating}</b> (chyby: ${this.mistakes} z ${total} otázok). Teraz rovnice mentorov prečítaš na prvý pohľad. Kľúč 🔑 nad rovnicou ti všetko kedykoľvek pripomenie.`,
          `Hall of Symbols complete! Rating: <b>${rating}</b> (mistakes: ${this.mistakes} of ${total} questions). Now you can read the mentors’ equations at a glance. The 🔑 key above the equation reminds you of everything at any time.`,
          `Залу символів пройдено! Оцінка: <b>${rating}</b> (помилок: ${this.mistakes} з ${total} питань). Тепер ти прочитаєш рівняння наставників з першого погляду. Ключ 🔑 над рівнянням будь-коли все нагадає.`)], () => Game.backToHub());
      }));
  }

  viewState() { return null; }

  update(dt) {
    this.t += dt;
    this.camT += dt;
    const e = this.ex[this.focus];
    const goal = e ? e.S.P(0, 0.15) : [0, 1.4, 0]; // cieľ pod stredom exponátu → exponát sedí v hornej časti obrazovky, nad dialógom
    this.cam.target = V3.lerp(this.cam.target, goal, Math.min(1, dt * 3));
    if (this.camT < 1.8) { // po zmene exponátu sa kamera otočí k nemu; potom ju hráč môže voľne ťahať
      const k = Math.min(1, dt * 3.5), yaw = e ? e.S.yaw : this.cam.yaw, dist = e ? 6.2 : 15, pitch = e ? 0.1 : 0.42;
      let dy = yaw - this.cam.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      this.cam.yaw += dy * k; this.cam.dist += (dist - this.cam.dist) * k; this.cam.pitch += (pitch - this.cam.pitch) * k;
    }
  }

  draw(r) {
    const t = this.t;
    r.begin(this.cam.eye(), this.cam.target);
    // sieň: tmavá podlaha s mriežkou, prstenec
    r.draw('disk', M4.trs([0, -0.01, 0], 0, 12.5), [0.09, 0.08, 0.18], { pattern: 1 });
    r.draw('circle', M4.trs([0, 0.02, 0], 0, 12.5), [0.37, 0.89, 1]);
    r.draw('circle', M4.trs([0, 0.02, 0], 0, 8), [0.4, 0.45, 0.7], { alpha: 0.5 });
    // sprievodkyňa Amplitúda sa vznáša vysoko nad stredom siene (kamera pri exponáte stojí blízko stredu a nesmie ju zakryť)
    const gy = 5.6 + Math.sin(t * 1.3) * 0.15;
    r.sphere([0, gy, 0], 0.5, [1, 0.75, 0.3], { emissive: 0.6 });
    r.draw('torus', M4.orient([0, gy, 0], [Math.sin(t), 1, Math.cos(t)], 0.85), [1, 0.85, 0.5], { emissive: 0.4 });
    UI.label('l0guide', [0, gy + 1.05, 0], tr('✨ Amplitúda', '✨ Amplitude', '✨ Амплітуда'), 'npc', null);
    UI.hot([0, gy, 0], tr('<b>Amplitúda</b> — sprievodkyňa Sieňou symbolov.', '<b>Amplitude</b> — your guide through the Hall of Symbols.', '<b>Амплітуда</b> — провідниця Залою символів.'), 40);
    for (const e of this.ex) {
      const on = e.i <= this.revealed, act = e.i === this.focus, col = on ? this.colorOf(e) : [0.35, 0.36, 0.42];
      const base = [e.b[0], 0, e.b[2]];
      r.draw('cylinder', M4.trs(base, 0, [0.95, 0.9, 0.95]), act ? [0.2, 0.2, 0.34] : [0.15, 0.15, 0.26]);
      r.draw('torus', M4.trs([e.b[0], 0.92, e.b[2]], 0, 0.95), col, { emissive: act ? 0.9 : on ? 0.35 : 0 });
      if (!on) { UI.label('l0q' + e.id, e.S.P(0, 0.6), '?', 'sym0 dim', null); continue; }
      if (act) r.draw('cone', M4.trs(base, 0, [1.25, 5.5, 1.25]), col, { alpha: 0.06, unlit: 1 }); // reflektor
      e.draw(r, e.S, t + e.i * 0.7, act, this);
      const gi = e.glyphAt ? e.gl[e.glyphAt(t + e.i * 0.7)] : e.gl;
      e.S.lab('glyph', e.S.P(0, 2.75), gi, 'sym0' + (act ? '' : ' dim'));
      if (act || this.focus < 0) e.S.lab('name', e.S.P(0, 3.25), e.name, 'axis tiny');
      UI.hot(e.S.P(0, 1.3), `<b>${e.name}</b>`, 50);
    }
  }
  colorOf(e) {
    return { alpha: MC.a, beta: MC.b, ket: MC.ket, bra: MC.ket, theta: MC.th, phi: MC.ph, gamma: MC.g, expi: MC.ph, ops: MC.op, P: MC.P, sq: MC.P, rho: MC.coh,
      const: MC.k, collapse: MC.m, srn: MC.ket, nmr: MC.ph, ptA: MC.m, plain: MC.rel, sound: MC.c }[e.id] || MC.c;
  }
}

const shuffle0 = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const LEVEL0 = { num: 0, title: tr('Sieň symbolov', 'Hall of Symbols', 'Зала символів'), mentor: tr('Amplitúda', 'Amplitude', 'Амплітуда'), face: '✨', color: [0.37, 0.89, 1], cls: L0Symbols };
