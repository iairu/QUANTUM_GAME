'use strict';
// Krátke vysvetlivky pri prejdení myšou: symboly, tlačidlá, 3D popisky a pojmy v dialógoch.

// Presné zhody (text popisky alebo tlačidla bez HTML)
const TIPS = {
  // stavy a symboly
  '|0⟩': 'Bázový stav |0⟩ ≡ |+z⟩ („spin hore“). Severný pól Blochovej sféry. Nie je to nulový vektor!',
  '|1⟩': 'Bázový stav |1⟩ ≡ |−z⟩ („spin dole“). Južný pól. S |0⟩ je ortogonálny (v Hilbertovom priestore kolmý, na sfére protiľahlý).',
  '|+⟩': '|+⟩ = (|0⟩ + |1⟩)/√2 — rovník, os +x. V Z-báze 50/50, v X-báze vždy „+“.',
  '|−⟩': '|−⟩ = (|0⟩ − |1⟩)/√2 — os −x. Od |+⟩ sa líši len relatívnou fázou π.',
  '|+i⟩': '|+i⟩ = (|0⟩ + i|1⟩)/√2 — os +y. Relatívna fáza π/2; dôkaz, že amplitúdy musia byť komplexné.',
  '|−i⟩': '|−i⟩ = (|0⟩ − i|1⟩)/√2 — os −y. Relatívna fáza −π/2.',
  'ψ': 'ψ (psí) — kvantový stav. To si ty, Psíčko: nie guľôčka, ale pravidlo pre predpovede výsledkov meraní.',
  'x': 'Os x Blochovej sféry — smer stavu |+⟩. Nie je to smer v laboratóriu!',
  'y': 'Os y Blochovej sféry — smer stavu |+i⟩.',
  'z': 'Os z Blochovej sféry — smer stavu |0⟩. Meranie „v Z-báze“ = otázka „|0⟩ alebo |1⟩?“.',
  'Re': 'Reálna časť komplexného čísla (vodorovná os komplexnej roviny).',
  'Im': 'Imaginárna časť komplexného čísla (zvislá os). V QM ju nezahadzuj — nesie fázu.',
  '1': 'Číslo 1 v komplexnej rovine (fáza 0).',
  'i': 'Imaginárna jednotka: i² = −1. Násobenie i = otočenie o 90°.',
  '−1': '−1 = e^{iπ}: otočenie o 180°. Toto „mínus“ odlišuje |+⟩ od |−⟩.',
  '−i': '−i = e^{−iπ/2} = i³: otočenie o 270°.',
  'α': 'Amplitúda α — komplexné číslo s veľkosťou a fázou. Pravdepodobnosť je |α|², nie α.',
  'A₁': 'Amplitúda prvej cesty.',
  'A₂': 'Amplitúda druhej cesty — jej fázu meníš posuvníkom.',
  'A₁+A₂': 'Celková amplitúda: najprv sa sčítajú amplitúdy, až potom umocníme → interferencia.',
  'P = |α|²': 'Bornovo pravidlo: pravdepodobnosť = štvorec absolútnej hodnoty amplitúdy. Fázu „nevidí“.',
  'B₀': 'Statické magnetické pole NMR magnetu. Rozštiepi energiu spinu na dve Zeemanove hladiny = qubit.',
  '+ħ/2': 'Výsledok merania S_z = +ħ/2 („spin hore“, stav |0⟩). ħ = h/2π.',
  '−ħ/2': 'Výsledok merania S_z = −ħ/2 („spin dole“, stav |1⟩).',
  'tienidlo': 'Tu dopadajú atómy. Každý atóm = jeden výsledok merania (jedna bodka).',
  'stav na konci': 'Blochova sféra qubitu po prejdení koľajou: šípka = čistý stav, bod v strede = maximálne zmiešaný stav I/2.',
  'matica hustoty ρ': 'ρ (ró): úplný opis stavu aj so zmesami. Diagonála = populácie, mimodiagonála = koherencie.',
  '(prázdne)': 'Stred chrámu je prázdny — nič neruší koherenciu.',
  'H': 'Hadamardovo hradlo: rotácia o 180° okolo osi medzi x a z. Vymieňa osi x ↔ z. H·H = I.',
  'X': 'Pauliho X: rotácia o 180° okolo osi x — preklopenie bitu (kvantové NOT).',
  'Y': 'Pauliho Y: rotácia o 180° okolo osi y. Y|0⟩ = i|1⟩ ∼ |1⟩.',
  'Z': 'Pauliho Z: rotácia o 180° okolo osi z — preklopenie fázy. P(0), P(1) v Z-báze sa nezmenia.',
  'S': 'Fázové hradlo S: rotácia o 90° okolo osi z (pridá fázu i k |1⟩).',
  'T': 'Hradlo T: rotácia o 45° okolo osi z (fáza e^{iπ/4}).',
  '|ψ⟩': 'Ket — abstraktný stav (stĺpcový vektor). Tvar v 3D: šípka.',
  '|φ⟩': 'Ket — iný stav φ.',
  '|a⟩': 'Ket — vlastný stav a (napr. výsledok merania).',
  '⟨ψ|': 'Bra — duálny (hermitovsky združený) vektor, riadok. „Kladie otázku.“ Tvar: doska.',
  '⟨φ|': 'Bra stavu φ.',
  '⟨a|': 'Bra stavu a — otázka „je to stav a?“.',
  'Â': 'Operátor (strieška) — pozorovateľná veličina, „stroj“ meniaci kety. Tvar: kocka.',
  'Ĥ': 'Hamiltonián — operátor energie; určuje časový vývoj stavu.',
  '⊗': 'Tenzorový súčin — skladá dva systémy do jedného: |0⟩ ⊗ |1⟩ = |01⟩.',
  '|…|²': 'Štvorec absolútnej hodnoty: z amplitúdy (čísla) urobí pravdepodobnosť. Na kety ani operátory sa nedá použiť.',
  '⌫': 'Zmaže posledný token.',
  'Alica': 'Alica — majiteľka qubitu A. Meria lokálne, bez spojenia s Bobom.',
  'Bob': 'Bob — majiteľ qubitu B. Jeho štatistika je vždy 50/50, nech Alica robí čokoľvek.',
  'a₀': 'Uhol merania Alice, keď dostane x = 0.', 'a₁': 'Uhol merania Alice, keď dostane x = 1.',
  'b₀': 'Uhol merania Boba, keď dostane y = 0.', 'b₁': 'Uhol merania Boba, keď dostane y = 1.',
  'rotujúci rámec': 'Súradnice otáčajúce sa s Larmorovou frekvenciou — rýchla precesia „zastane“. Matematický trik.',
  'laboratórny rámec': 'Pohľad z laboratória: spin precesuje okolo B₀ (mení sa fáza, nie P(0), P(1)).',
  'RF cievka': 'Rádiofrekvenčná cievka: vysiela impulzy, ktoré otáčajú Blochov vektor (hradlá v NMR).',
  'RF impulz!': 'Beží rezonančný impulz: stav sa otáča okolo osi v rovine xy (Rabiho oscilácia).',
  'vzorka (ansámbel molekúl)': 'V NMR meriame naraz obrovské množstvo molekúl → signál = stredná hodnota.',
  '🔗 korelácie (nie signál!)': 'Previazanosť: výsledky sú korelované, ale nedá sa ňou poslať správa.',
  '[E] Hovoriť s Amplitúdou': 'Sprievodkyňa ti pripomenie cieľ a ďalší krok.',
};

// Tlačidlá a popisky podľa obsiahnutého textu
const TIP_PATTERNS = [
  [/^SG/, 'Sternov–Gerlachov magnet: nehomogénne pole rozdelí zväzok podľa projekcie spinu do svojej osi. Os vyberá OTÁZKU.'],
  [/^pec/, 'Pec: odparuje striebro. Atómy letia nepolarizované — maximálne zmiešaný stav (žiadna preferovaná os).'],
  [/Klasický model/, 'Čo by sme čakali, keby magnetíky mali náhodnú klasickú orientáciu: spojitý pás.'],
  [/Skutočnosť/, 'Skutočné (kvantové) správanie: len dve stopy.'],
  [/Vystreľ/, 'Pošle atómy z pece cez magnety na tienidlo.'],
  [/Zostava A/, 'Z+ → Z: prvý magnet prepustí len „+“, druhý znova meria Z.'],
  [/Zostava B/, 'Z+ → X+ → Z: medzi dve merania Z vložíme meranie X.'],
  [/^Magnet \d/, 'Zapni/vypni magnet. Posuvník = os merania (0° = z, 90° = x), filter = ktorý zväzok prejde.'],
  [/× i/, 'Vynásob amplitúdu číslom i = otoč ručičku o 90° proti smeru hodín.'],
  [/Znova/, 'Začni hádanku odznova.'],
  [/Meraj 1×/, 'Jedno meranie v Z-báze: dá jeden bit a stav „skolabuje“ na |0⟩ alebo |1⟩.'],
  [/Meraj 100 kópií/, '100 rovnako pripravených kópií, každá zmeraná raz — tak sa zisťujú pravdepodobnosti.'],
  [/Priprav/, 'Priprav nový stav (nová kópia qubitu).'],
  [/Pošli 1/, 'Pošli jeden qubit pomaly — sleduj, ako sa mení Blochova šípka a matica ρ na každej stanici.'],
  [/Pošli 100/, 'Pošli 100 qubitov naraz a pozri štatistiku detektora.'],
  [/Vymaž/, 'Vynuluje počítadlá / výraz.'],
  [/Over/, 'Skontroluj, či postavený výraz zodpovedá úlohe.'],
  [/Impulz z/, 'Resetuje spin do |0⟩ a pustí RF impulz s nastavenou plochou (= uhol rotácie).'],
  [/Reset/, 'Vráti stav na začiatok.'],
  [/CNOT/, 'Riadené NOT: ak je A v |1⟩, preklopí B. Po H na A vyrobí previazaný Bellov stav.'],
  [/H na [AB]/, 'Hadamard na jeden qubit.'], [/X na [AB]/, 'Preklopenie bitu jedného qubitu.'],
  [/Meraj 200/, 'Zmeria 200 previazaných párov v zvolených bázach.'],
  [/Hraj 400/, 'Odohrá 400 kôl CHSH hry s tvojimi uhlami a previazaným párom.'],
  [/Klasicky/, 'Najlepšia klasická stratégia: vždy odpovedať 0 → 75 %.'],
  [/Nápoveda/, 'Ukáže optimálne uhly.'],
  [/Laboratórny rámec/, 'Pozeráš z laboratória: spin precesuje okolo B₀.'], [/Rotujúci rámec/, 'Točíš sa so spinom — precesia zmizne.'],
  [/Ostrov/, 'Späť na Hilbertov ostrov (rozpracovaný level sa začne odznova).'],
  [/Mapa/, 'Mapa ostrova s portálmi (M).'], [/Kódex/, 'Odomknuté symboly, osobnosti a pojmy (C).'], [/Denník/, 'Všetky dialógy a vysvetlenia — prečítaj alebo prehraj znova (L).'],
  [/Amplitúda/, 'Sprievodkyňa Amplitúda — komplexné číslo, ktoré ťa vedie ostrovom.'],
  [/^ρ|^\|ρ/, 'Prvok matice hustoty: ρ₀₀, ρ₁₁ = pravdepodobnosti (populácie), |ρ₀₁| = koherencia (pamäť fázy).'],
  [/^\d: \d+/, 'Počet výsledkov 0 alebo 1 na detektore.'],
  [/príprava/, 'Qubit vždy štartuje v stave |0⟩.'],
  [/meranie Z/, 'Meranie v Z-báze s ZABUDNUTÝM výsledkom — zničí koherenciu, zostane zmes.'],
  [/prostredie/, 'Dekoherencia: prostredie čiastočne „odmeria“ fázu; koherencie sa zmenšia o faktor (1 − p).'],
  [/^os /, 'Os rotácie práve vykonávaného hradla.'],
];

// Pojmy, ktoré sa v dialógoch podčiarknu (kmeň slova → vysvetlivka)
const GLOSS = [
  ['amplitúd', 'Amplitúda: komplexné číslo pri výsledku; pravdepodobnosť je jej |…|².'],
  ['superpozíci', 'Superpozícia: lineárna kombinácia stavov. Nie je to „nevieme, v ktorom je“ ani paralelné počítanie.'],
  ['dekoherenci', 'Dekoherencia: prostredie ničí fázové vzťahy (koherencie); šípka sa zmršťuje dovnútra gule.'],
  ['koherenci', 'Koherencia: pevný fázový vzťah medzi zložkami stavu — umožňuje interferenciu.'],
  ['interferenci', 'Interferencia: sčítanie amplitúd pred umocnením; podľa fázy zosilnenie alebo vyrušenie.'],
  ['previazan', 'Previazanosť (entanglement): stav celku sa nedá zapísať ako súčin stavov častí.'],
  ['relatívn\\p{L}* fáz', 'Relatívna fáza: fázový rozdiel medzi α a β; pozorovateľná cez meranie v inej báze.'],
  ['globáln\\p{L}* fáz', 'Globálna fáza: spoločný faktor celého stavu; nepozorovateľná.'],
  ['Blochov\\p{L}* sfér', 'Blochova sféra: obraz stavu qubitu; povrch = čisté, vnútro = zmiešané stavy.'],
  ['matic\\p{L}* hustoty', 'Matica hustoty ρ: opis stavu vrátane zmesí; diagonála = populácie, mimo = koherencie.'],
  ['Bornov\\p{L}* pravidl', 'Bornovo pravidlo: P = |amplitúda|².'],
  ['kolaps', 'Kolaps: prechod od kvantovej možnosti ku klasickému faktu pri meraní (readout).'],
  ['Hamiltoni', 'Hamiltonián Ĥ: operátor energie, ktorý určuje časový vývoj.'],
  ['unitárn', 'Unitárna operácia: vratná, zachováva normu; na Blochovej sfére rotácia.'],
  ['báz', 'Báza: súbor ortogonálnych stavov = „otázka“, ktorú meraním kladieme (napr. Z: |0⟩ alebo |1⟩?).'],
  ['operátor', 'Operátor: „stroj“, ktorý mení stavy; pozorovateľné veličiny sú hermitovské operátory.'],
  ['stredn\\p{L}* hodnot', 'Stredná hodnota ⟨A⟩: priemer mnohých meraní, nie výsledok jedného.'],
  ['precesi', 'Precesia: vývoj relatívnej fázy v poli B₀; P(0), P(1) sa nemenia.'],
  ['rezonanci', 'Rezonancia: frekvencia budenia sa zhoduje s prirodzenou frekvenciou systému.'],
  ['komplementarit', 'Komplementarita (Bohr): vlnový a časticový opis sa dopĺňajú podľa experimentu; nie relativizmus.'],
  ['zmes', 'Zmes: štatistická neznalosť (klasická); nemá koherencie, neinterferuje.'],
  ['zmiešan', 'Zmiešaný stav: |r| < 1, vnútri Blochovej sféry.'],
  ['ortogonáln', 'Ortogonálne stavy: skalárny súčin 0, dokonale rozlíšiteľné meraním.'],
  ['spin', 'Spin: kvantová forma vnútorného momentu hybnosti — nie rotujúca guľôčka.'],
  ['qubit', 'Qubit: kvantový systém s dvojrozmerným komplexným stavovým priestorom.'],
  ['ket', 'Ket |ψ⟩: zápis stavu (stĺpcový vektor).'],
  ['ansámb', 'Ansámbel: veľký súbor rovnako pripravených systémov; NMR meria jeho priemer.'],
  ['nelokáln', 'Nelokálnosť: vplyv medzi vzdialenými miestami bez sprostredkovania v priestore.'],
  ['skryt\\p{L}* premenn', 'Skryté premenné: hypotetické hodnoty určené pred meraním (Bohm). Lokálne vylúčil Bell.'],
  ['hradl', 'Hradlo: elementárna kvantová operácia (unitárna rotácia).'],
];
const GLOSS_RE = GLOSS.map(([stem, tip]) => [new RegExp(`(?<![\\p{L}\u0002])(${stem}\\p{L}*)`, 'iu'), tip]);

function tipFor(html) {
  const t = String(html).replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/^[^\p{L}\p{N}|⟨(\[+−×⊗Â⌫ψαρ]+/u, '').trim();
  if (TIPS[t]) return TIPS[t];
  const raw = String(html).replace(/<[^>]+>/g, '').trim();
  if (TIPS[raw]) return TIPS[raw];
  for (const [re, tip] of TIP_PATTERNS) if (re.test(t)) return tip;
  return null;
}

// do HTML textu dialógu pridá podčiarknuté pojmy s vysvetlivkou (prvý výskyt každého pojmu)
function annotate(html) {
  const used = new Set(), tips = [];
  return String(html).split(/(<[^>]+>)/).map((seg) => {
    if (seg.startsWith('<')) return seg;
    for (const [re, tip] of GLOSS_RE) {
      if (used.has(re)) continue;
      const m = seg.match(re);
      if (!m) continue;
      used.add(re); tips.push(tip);
      seg = seg.slice(0, m.index) + `\u0001${tips.length - 1}\u0002${m[1]}\u0003` + seg.slice(m.index + m[1].length);
    }
    return seg.replace(/\u0001(\d+)\u0002([^\u0003]*)\u0003/g, (_, i, w) => `<span class="term" data-tip="${tips[+i].replace(/"/g, '&quot;')}">${w}</span>`);
  }).join('');
}
