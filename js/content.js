'use strict';
// Kódex: symboly, osobnosti a pojmy, ktoré hráč odomyká v leveloch (obsah z prednášok 1–3).

const CODEX = [
  // ---------- Level 1: Komplexný prístav ----------
  { id: 'euler', level: 1, type: 'osobnost', sym: '👤', name: 'Leonhard Euler (1707–1783)', text: 'Švajčiarsky matematik; zápisy e, i, f(x), Σ. Jeho vzorec spája exponenciálu s kosínusom a sínusom — dnes „jazyk fázy“ v kvantovej mechanike.' },
  { id: 'i', level: 1, type: 'symbol', sym: 'i', name: 'imaginárna jednotka', text: 'Číslo, ktorého štvorec je −1. Násobenie i = otočenie o 90° v komplexnej rovine.', do: 'Pamätaj: i · i = otočenie o 180° = −1.', dont: 'Nepleť si i (číslo) s indexom i v α<sub>i</sub> či δ<sub>ij</sub>.' },
  { id: 'eiphi', level: 1, type: 'symbol', sym: 'e<sup>iφ</sup>', name: 'fázový faktor', text: 'Komplexné číslo s veľkosťou 1 — „ručička hodín“ otočená o uhol φ.', do: 'Predstav si bod na jednotkovej kružnici.', dont: 'Nie je to fyzikálne otáčanie častice.' },
  { id: 'amp', level: 1, type: 'pojem', sym: 'α', name: 'pravdepodobnostná amplitúda', text: 'Komplexné číslo pri bázovom stave. Má veľkosť aj fázu.', do: 'Interferujú (sčítavajú sa) amplitúdy.', dont: 'Amplitúda NIE JE pravdepodobnosť.' },
  { id: 'abs2', level: 1, type: 'symbol', sym: '|α|²', name: 'štvorec absolútnej hodnoty', text: 'Z amplitúdy urobí pravdepodobnosť (Bornovo pravidlo). Fázu „nevidí“.', do: '|α|² = α · α*', dont: '|α|² ≠ α² pre komplexné α (pre α = i: α² = −1, |α|² = 1).' },
  { id: 'ReIm', level: 1, type: 'symbol', sym: 'Re, Im', name: 'reálna a imaginárna časť', text: 'Dve osi komplexnej roviny. Interferenčný člen obsahuje Re(A₁A₂*).', dont: 'V QM nezahadzuj imaginárnu časť amplitúdy — nesie fázu.' },
  { id: 'interf', level: 1, type: 'pojem', sym: '∿', name: 'interferencia', text: 'Najprv sčítaj amplitúdy, až potom umocni. Podľa relatívnej fázy sa výsledok zosilní (konštruktívne) alebo vyruší (deštruktívne).', dont: 'Samotné slovo „interferencia“ nevysvetľuje kvantovú výhodu — interferujú aj vlny na vode.' },
  { id: 'conj', level: 1, type: 'symbol', sym: 'z*', name: 'komplexne združené číslo', text: 'Zrkadlo podľa reálnej osi: a + ib → a − ib. z·z* = |z|².', dont: 'Hviezdička tu nie je násobenie.' },

  // ---------- Level 2: Sternova–Gerlachova pec ----------
  { id: 'stern', level: 2, type: 'osobnost', sym: '👤', name: 'Otto Stern (1888–1969)', text: 'Majster molekulových zväzkov. 1922 so W. Gerlachom: atómy striebra sa v nehomogénnom poli rozdelili na DVE stopy. Nobelova cena 1943.' },
  { id: 'gerlach', level: 2, type: 'osobnost', sym: '👤', name: 'Walther Gerlach (1889–1979)', text: 'Uskutočnil experiment vo Frankfurte 1922. Súvis so spinom elektrónu (Uhlenbeck, Goudsmit 1925) sa ukázal až neskôr.' },
  { id: 'Sz', level: 2, type: 'symbol', sym: 'S<sub>z</sub>', name: 'z-ová zložka spinu', text: 'Projekcia spinu na os zvolenú prístrojom. Pre spin ½ len dve hodnoty.', do: 'Os z vyberá magnet — S<sub>x</sub> je rovnako legitímna.', dont: 'Spin pred meraním „neukazoval“ hore ani dole ako šípka.' },
  { id: 'hbar', level: 2, type: 'symbol', sym: 'ħ', name: 'h s čiarou (redukovaná Planckova konštanta)', text: 'h/2π — prirodzená jednotka momentu hybnosti. Výsledky merania spinu ½: +ħ/2 a −ħ/2.', dont: 'Nepleť si ħ a h (líšia sa o 2π). Nie je to „htrans“.' },
  { id: 'spinhalf', level: 2, type: 'symbol', sym: 's = ½', name: 'spin ½', text: 'Označenie DRUHU kvantového spinu (elektrón, protón). Dve možné projekcie.', dont: '½ neznamená polovičnú otáčku ani polovičnú rýchlosť rotácie.' },
  { id: 'basisq', level: 2, type: 'pojem', sym: '🧭', name: 'meracia báza je súčasťou otázky', text: 'Výsledok závisí od toho, v akej osi meriame. Istota v osi z neznamená istotu v osi x.', dont: 'Nezávisí od „vedomia pozorovateľa“, ale od experimentálneho usporiadania.' },
  { id: 'ket0', level: 2, type: 'symbol', sym: '|0⟩ ≡ |+z⟩', name: 'bázový stav „spin hore“', text: 'Číslice 0 a 1 zodpovedajú dvom vylučujúcim sa výsledkom merania.', dont: '|0⟩ nie je nulový vektor a |0⟩, |1⟩ nie sú opačné šípky — sú KOLMÉ.' },

  // ---------- Level 3: Blochovo observatórium ----------
  { id: 'bloch', level: 3, type: 'osobnost', sym: '👤', name: 'Felix Bloch (1905–1983)', text: 'Prvý doktorand Heisenberga, Nobelova cena 1952 za NMR, prvý riaditeľ CERN. Jeho rovnice pre magnetizáciu viedli k Blochovej sfére.' },
  { id: 'sphere', level: 3, type: 'pojem', sym: '🌐', name: 'Blochova sféra', text: 'Čistý stav qubitu = bod na povrchu, zmiešaný = vnútri. Sever |0⟩, juh |1⟩, rovník |±⟩, |±i⟩.', dont: 'Nie je to priestor laboratória ani os rotujúcej guľôčky. Ortogonálne stavy sú na sfére PROTIĽAHLÉ.' },
  { id: 'H', level: 3, type: 'symbol', sym: 'H', name: 'Hadamardovo hradlo', text: 'Rotácia o 180° okolo osi medzi x a z. Vymieňa osi x ↔ z, y → −y. H·H = I.', do: 'Povedz „unitárna zmena bázy“.', dont: '„Vytvára superpozíciu“ je neúplné — závisí od bázy. Nepleť s Hamiltoniánom Ĥ.' },
  { id: 'XYZ', level: 3, type: 'symbol', sym: 'X, Y, Z', name: 'Pauliho hradlá', text: 'Rotácie o 180° okolo osí x, y, z. X = preklopenie bitu, Z = preklopenie fázy.', dont: 'X hradlo nie je súradnica x.' },
  { id: 'ST', level: 3, type: 'symbol', sym: 'S, T', name: 'fázové hradlá', text: 'Rotácie okolo z o 90° (S) a 45° (T). Menia relatívnu fázu, nie pravdepodobnosti v Z-báze.' },
  { id: 'globalph', level: 3, type: 'pojem', sym: '∼', name: 'rovnosť až na globálnu fázu', text: 'Stavy líšiace sa spoločným faktorom e<sup>iγ</sup> sú fyzikálne totožné: −iX ∼ X.', dont: '∼ neznamená „viem to premeniť na“. Globálna ≠ relatívna fáza.' },
  { id: 'relph', level: 3, type: 'pojem', sym: 'φ', name: 'relatívna fáza', text: 'Fázový rozdiel medzi α a β. |+⟩ a |−⟩ majú rovnaké P(0), P(1), ale inú fázu — rozlíši ich meranie v X-báze.', dont: 'Relatívnu fázu nemožno zanedbať.' },
  { id: 'thetaphi', level: 3, type: 'symbol', sym: 'θ, φ', name: 'uhly na Blochovej sfére', text: 'θ určuje pravdepodobnosti v Z-báze, φ je relatívna fáza. V zápise stavu vystupuje θ/2.' },
  { id: 'unitary', level: 3, type: 'pojem', sym: 'U', name: 'unitárna operácia = rotácia', text: 'Každé jednoqubitové hradlo je (až na globálnu fázu) rotácia Blochovej sféry. Zachováva dĺžku Blochovho vektora.', dont: 'Neplatí „pod povrchom neunitárne“: unitárne operácie otáčajú aj zmiešané stavy.' },

  // ---------- Level 4: Chrám interferencie ----------
  { id: 'feynman', level: 4, type: 'osobnost', sym: '👤', name: 'Richard Feynman (1918–1988)', text: 'Nobelova cena 1965 (QED). 1981: prírodu treba simulovať kvantovými systémami — zrod myšlienky kvantového počítača.' },
  { id: 'rho', level: 4, type: 'symbol', sym: 'ρ', name: 'matica hustoty (ró)', text: 'Úplný opis stavu vrátane zmesí. Diagonála = populácie, mimodiagonála = koherencie.', dont: 'Je to grécke ró, nie písmeno p.' },
  { id: 'mix', level: 4, type: 'symbol', sym: 'I/2', name: 'maximálne zmiešaný stav', text: 'Stred Blochovej sféry. 50/50 v akejkoľvek báze, žiadne koherencie.', dont: 'Nie je to |+⟩ — tá dá v X-báze vždy „+“.' },
  { id: 'coh', level: 4, type: 'pojem', sym: '≋', name: 'koherencia', text: 'Pevný fázový vzťah medzi zložkami; „palivo“ interferencie. Meranie v báze ju zničí.' },
  { id: 'supmix', level: 4, type: 'pojem', sym: '⚖', name: 'superpozícia ≠ zmes', text: 'V Z-báze dávajú rovnaké štatistiky, ale len superpozícia interferuje (H·H → 0 s istotou).', dont: 'Superpozícia nie je „nevieme, v ktorom stave je“.' },
  { id: 'deco', level: 4, type: 'pojem', sym: '🌫', name: 'dekoherencia', text: 'Prostredie „odmeria“ fázu a mimodiagonálne prvky ρ miznú. Blochov vektor sa zmršťuje dovnútra.', dont: 'Sama nevytvára konkrétny výsledok merania.' },
  { id: 'dagger', level: 4, type: 'symbol', sym: '†', name: 'dýka — hermitovské združenie', text: 'Transpozícia + komplexné združenie. Unitárne U: U·U† = I.', dont: '† ≠ transpozícia T, † ≠ *.' },

  // ---------- Level 5: Diracova knižnica ----------
  { id: 'dirac', level: 5, type: 'osobnost', sym: '👤', name: 'Paul Dirac (1902–1984)', text: 'Diracova rovnica (1928) → antihmota; Nobelova cena 1933; bra-ket notácia (1939). Povestne málovravný: „1 dirac = 1 slovo za hodinu“.' },
  { id: 'ket', level: 5, type: 'symbol', sym: '|ψ⟩', name: 'ket', text: 'Abstraktný kvantový stav (stĺpcový vektor).', dont: 'Ket nie je číslo ani funkcia — ψ(x) je až jeho reprezentácia.' },
  { id: 'bra', level: 5, type: 'symbol', sym: '⟨ψ|', name: 'bra', text: 'Duálny (hermitovsky združený) vektor — riadok. „Kladie otázku.“', dont: 'Bez komplexného združenia koeficientov je to chyba.' },
  { id: 'braket', level: 5, type: 'symbol', sym: '⟨φ|ψ⟩', name: 'bra-ket (skalárny súčin)', text: 'KOMPLEXNÉ ČÍSLO — amplitúda prekrytia dvoch stavov.', dont: 'Nie je to pravdepodobnosť — tou je |⟨φ|ψ⟩|².' },
  { id: 'ketbra', level: 5, type: 'symbol', sym: '|ψ⟩⟨φ|', name: 'ket-bra', text: 'OPERÁTOR (matica). |ψ⟩⟨ψ| je projektor = ρ čistého stavu.', dont: 'Poradie mení typ objektu: ⟨φ|ψ⟩ je číslo, |ψ⟩⟨φ| je operátor.' },
  { id: 'hat', level: 5, type: 'symbol', sym: 'Â', name: 'strieška = operátor', text: 'Pozorovateľná veličina ako operátor (Ĥ, p̂, Ẑ).', dont: 'Pri osiach (x̂, n̂) znamená strieška jednotkový vektor.' },
  { id: 'expect', level: 5, type: 'symbol', sym: '⟨ψ|Â|ψ⟩', name: 'stredná hodnota', text: 'Priemer mnohých meraní na rovnako pripravených systémoch.', dont: 'Nemusí byť možným výsledkom jedného merania (⟨Z⟩ = 0 pre |+⟩).' },
  { id: 'tensor', level: 5, type: 'symbol', sym: '⊗', name: 'tenzorový súčin', text: 'Skladá systémy: |0⟩ ⊗ |1⟩ = |01⟩. Dimenzie sa násobia.', dont: '⊗ nie je obyčajné ani vektorové (×) násobenie.' },
  { id: 'kron', level: 5, type: 'symbol', sym: 'δ<sub>ij</sub>', name: 'Kroneckerova delta', text: '1 ak i = j, inak 0. Ortonormálna báza: ⟨i|j⟩ = δ<sub>ij</sub>.', dont: 'Nepleť s Diracovou deltou δ(x − x′) pre spojité bázy.' },

  // ---------- Level 6: Rabiho rezonátor ----------
  { id: 'rabi', level: 6, type: 'osobnost', sym: '👤', name: 'Isidor Isaac Rabi (1898–1988)', text: 'Magnetická rezonancia v molekulových zväzkoch (1938) → NMR, MRI, atómové hodiny. Nobelova cena 1944. Spoluzakladateľ CERN.' },
  { id: 'zeeman', level: 6, type: 'osobnost', sym: '👤', name: 'Pieter Zeeman (1865–1943)', text: 'Rozštiepenie spektrálnych čiar v magnetickom poli. Spin ½ v poli B₀ má dve Zeemanove hladiny = qubit v NMR.' },
  { id: 'B0', level: 6, type: 'symbol', sym: 'B₀', name: 'statické magnetické pole', text: 'Vytvorí dve energetické hladiny; okolo osi z spin precesuje. Musí byť stabilné a homogénne.' },
  { id: 'OmegaR', level: 6, type: 'symbol', sym: 'Ω<sub>R</sub>', name: 'Rabiho frekvencia', text: 'Rýchlosť rotácie pod RF impulzom. Ω<sub>R</sub>t = plocha impulzu: π = preklopenie, π/2 = rovník.', dont: 'Nepleť s rezonančnou (Larmorovou) frekvenciou ω.' },
  { id: 'precess', level: 6, type: 'pojem', sym: '↻', name: 'precesia', text: 'Kvantovo: vývoj relatívnej fázy a stredných hodnôt. P(0), P(1) sa nemenia.', dont: 'Nie je to otáčanie osi mechanického gyroskopu.' },
  { id: 'rabiosc', level: 6, type: 'pojem', sym: '〰', name: 'Rabiho oscilácie', text: 'Periodická zmena AMPLITÚD a pravdepodobností pod rezonančným poľom.', dont: 'Elektrón sa mechanicky nepresúva medzi dvoma polohami.' },
  { id: 'rotframe', level: 6, type: 'pojem', sym: '🎠', name: 'rotujúci rámec', text: 'Súradnice, ktoré sa točia s rezonančnou frekvenciou — rýchla precesia sa „zastaví“.', dont: 'Je to matematický trik, nie otáčanie laboratória.' },
  { id: 'T2', level: 6, type: 'symbol', sym: 'T₁, T₂', name: 'relaxačné časy', text: 'T₂: strata fázovej koherencie (dephasing). T₁: návrat populácií k tepelnému stavu (amplitúdový šum).' },
  { id: 'ensemble', level: 6, type: 'pojem', sym: '🧪', name: 'ansámblové meranie (NMR, SpinQ)', text: 'Meriame signál obrovského množstva molekúl (priečna magnetizácia) → stredná hodnota, nie jednotlivé výsledky.' },

  // ---------- Level 7: Bellov most ----------
  { id: 'bell', level: 7, type: 'osobnost', sym: '👤', name: 'John Stewart Bell (1928–1990)', text: 'CERN. 1964: žiadna lokálna teória s predexistujúcimi hodnotami nereprodukuje kvantové korelácie. Nobelova cena 2022 za experimenty (Aspect, Clauser, Zeilinger).' },
  { id: 'einstein', level: 7, type: 'osobnost', sym: '👤', name: 'Albert Einstein (1879–1955)', text: 'Svetelné kvantá (1905), Nobelova cena 1921. EPR (1935): QM je podľa neho neúplná — „strašidelné pôsobenie na diaľku“.' },
  { id: 'cnot', level: 7, type: 'symbol', sym: 'CNOT', name: 'riadené NOT', text: 'Ak je riadiaci qubit |1⟩, preklopí cieľový. Spolu s H vytvára previazanosť. V NMR cez J-väzbu.' },
  { id: 'phiplus', level: 7, type: 'symbol', sym: '|Φ⁺⟩', name: 'Bellov stav', text: '(|00⟩ + |11⟩)/√2 — maximálne previazaný. Nedá sa zapísať ako súčin.', dont: 'Previazaný qubit NEMÁ vlastnú šípku na Blochovej sfére (je v strede).' },
  { id: 'entangle', level: 7, type: 'pojem', sym: '🔗', name: 'previazanosť (entanglement)', text: 'Korelácie silnejšie než klasické. Pojem zaviedol Schrödinger 1935.', dont: 'Neumožňuje nadsvetelnú komunikáciu. Nie je to „neviditeľné lano“.' },
  { id: 'chsh', level: 7, type: 'pojem', sym: '75 %', name: 'Bellova (CHSH) nerovnosť', text: 'Lokálna stratégia vyhrá CHSH hru najviac v 75 %. Previazané qubity ~85 %.', do: 'Čítaj: nemožno zároveň zachovať lokálnosť a predexistujúce hodnoty.' },
  { id: 'nosignal', level: 7, type: 'pojem', sym: '📵', name: 'nemožnosť signalizácie', text: 'Bob vidí 50/50 nech Alice robí čokoľvek. Korelácie uvidí až po porovnaní výsledkov klasickým kanálom.' },

  // ---------- Level 8: Sieň výkladov ----------
  { id: 'bohr', level: 8, type: 'osobnost', sym: '👤', name: 'Niels Bohr (1885–1962)', text: 'Model atómu, Nobelova cena 1922, komplementarita (1927). Jav nemožno opísať bez experimentálnych podmienok.', dont: 'Komplementarita nie je relativizmus.' },
  { id: 'kant', level: 8, type: 'osobnost', sym: '👤', name: 'Immanuel Kant (1724–1804)', text: '„Podmienky možnosti skúsenosti sú podmienkami možnosti predmetov skúsenosti.“ Kvantový stav = podmienky možnosti výsledku.' },
  { id: 'wittg', level: 8, type: 'osobnost', sym: '👤', name: 'Ludwig Wittgenstein (1889–1951)', text: '„Hranice môjho jazyka znamenajú hranice môjho sveta.“ „Význam slova je jeho použitie.“ Pôvodne inžinier.' },
  { id: 'bohm', level: 8, type: 'osobnost', sym: '👤', name: 'David Bohm (1917–1992)', text: 'Pilotná vlna a skryté premenné (1952): deterministická, ale NELOKÁLNA teória.' },
  { id: 'stodola', level: 8, type: 'osobnost', sym: '👤', name: 'Aurel Stodola (1859–1942)', text: 'Liptovský Mikuláš → ETH Zürich, parné turbíny. Inžiniersky realizmus: teória ako konštrukčný rámec.' },
  { id: 'heis', level: 8, type: 'osobnost', sym: '👤', name: 'Werner Heisenberg (1901–1976)', text: 'Maticová mechanika (1925), princíp neurčitosti (1927). „Pozorujeme prírodu vystavenú nášmu spôsobu kladenia otázok.“' },
  { id: 'noether', level: 8, type: 'osobnost', sym: '👤', name: 'Emmy Noether (1882–1935)', text: 'Symetria ↔ zákon zachovania. Pred meraním: symetria (možnosť); po meraní: fakt.' },
  { id: 'collapse', level: 8, type: 'pojem', sym: '⚡', name: 'kolaps ako inžinierska operácia', text: 'Readout: zosilnenie → prepojenie s makrosvetom → zápis do klasického registra. Ireverzibilný.', dont: 'Nie je to magický zásah vedomia.' },
  { id: 'onto', level: 8, type: 'pojem', sym: '❓❓❓', name: 'ontológia / epistemológia / fenomenológia', text: 'Čo existuje? / Čo o tom môžeme vedieť? / Ako sa nám jav ukazuje?' },
  { id: 'four', level: 8, type: 'pojem', sym: '4️⃣', name: 'štyri otázky ku každému pojmu', text: 'Aký systém? Aká rovnica a predpoklady? Aký experiment? Čo z opisu NEvyplýva?' },
];

// Jazykové pasce: na konci každého levelu (správne formulácie vs. časté omyly)
const TRAPS_SK = {
  1: [
    { q: DL('traps.1.0.q'), options: [DL('traps.1.0.options.0'), DL('traps.1.0.options.1'), DL('traps.1.0.options.2')], correct: 0, why: DL('traps.1.0.why') },
    { q: DL('traps.1.1.q'), options: [DL('traps.1.1.options.0'), DL('traps.1.1.options.1'), DL('traps.1.1.options.2')], correct: 0, why: DL('traps.1.1.why') },
    { q: DL('traps.1.2.q'), options: [DL('traps.1.2.options.0'), DL('traps.1.2.options.1'), DL('traps.1.2.options.2')], correct: 0, why: DL('traps.1.2.why') },
  ],
  2: [
    { q: DL('traps.2.0.q'), options: [DL('traps.2.0.options.0'), DL('traps.2.0.options.1'), DL('traps.2.0.options.2')], correct: 0, why: DL('traps.2.0.why') },
    { q: DL('traps.2.1.q'), options: [DL('traps.2.1.options.0'), DL('traps.2.1.options.1'), DL('traps.2.1.options.2')], correct: 0, why: DL('traps.2.1.why') },
    { q: DL('traps.2.2.q'), options: [DL('traps.2.2.options.0'), DL('traps.2.2.options.1'), DL('traps.2.2.options.2')], correct: 0, why: DL('traps.2.2.why') },
  ],
  3: [
    { q: DL('traps.3.0.q'), options: [DL('traps.3.0.options.0'), DL('traps.3.0.options.1'), DL('traps.3.0.options.2')], correct: 0, why: DL('traps.3.0.why') },
    { q: DL('traps.3.1.q'), options: [DL('traps.3.1.options.0'), DL('traps.3.1.options.1'), DL('traps.3.1.options.2')], correct: 0, why: DL('traps.3.1.why') },
    { q: DL('traps.3.2.q'), options: [DL('traps.3.2.options.0'), DL('traps.3.2.options.1'), DL('traps.3.2.options.2')], correct: 0, why: DL('traps.3.2.why') },
    { q: DL('traps.3.3.q'), options: [DL('traps.3.3.options.0'), DL('traps.3.3.options.1'), DL('traps.3.3.options.2')], correct: 0, why: DL('traps.3.3.why') },
  ],
  4: [
    { q: DL('traps.4.0.q'), options: [DL('traps.4.0.options.0'), DL('traps.4.0.options.1'), DL('traps.4.0.options.2')], correct: 0, why: DL('traps.4.0.why') },
    { q: DL('traps.4.1.q'), options: [DL('traps.4.1.options.0'), DL('traps.4.1.options.1'), DL('traps.4.1.options.2')], correct: 0, why: DL('traps.4.1.why') },
    { q: DL('traps.4.2.q'), options: [DL('traps.4.2.options.0'), DL('traps.4.2.options.1'), DL('traps.4.2.options.2')], correct: 0, why: DL('traps.4.2.why') },
  ],
  5: [
    { q: DL('traps.5.0.q'), options: [DL('traps.5.0.options.0'), DL('traps.5.0.options.1'), DL('traps.5.0.options.2')], correct: 0, why: DL('traps.5.0.why') },
    { q: DL('traps.5.1.q'), options: [DL('traps.5.1.options.0'), DL('traps.5.1.options.1'), DL('traps.5.1.options.2')], correct: 0, why: DL('traps.5.1.why') },
    { q: DL('traps.5.2.q'), options: [DL('traps.5.2.options.0'), DL('traps.5.2.options.1'), DL('traps.5.2.options.2')], correct: 0, why: DL('traps.5.2.why') },
  ],
  6: [
    { q: DL('traps.6.0.q'), options: [DL('traps.6.0.options.0'), DL('traps.6.0.options.1'), DL('traps.6.0.options.2')], correct: 0, why: DL('traps.6.0.why') },
    { q: DL('traps.6.1.q'), options: [DL('traps.6.1.options.0'), DL('traps.6.1.options.1'), DL('traps.6.1.options.2')], correct: 0, why: DL('traps.6.1.why') },
    { q: DL('traps.6.2.q'), options: [DL('traps.6.2.options.0'), DL('traps.6.2.options.1'), DL('traps.6.2.options.2')], correct: 0, why: DL('traps.6.2.why') },
    { q: DL('traps.6.3.q'), options: [DL('traps.6.3.options.0'), DL('traps.6.3.options.1'), DL('traps.6.3.options.2')], correct: 0, why: DL('traps.6.3.why') },
  ],
  7: [
    { q: DL('traps.7.0.q'), options: [DL('traps.7.0.options.0'), DL('traps.7.0.options.1'), DL('traps.7.0.options.2')], correct: 0, why: DL('traps.7.0.why') },
    { q: DL('traps.7.1.q'), options: [DL('traps.7.1.options.0'), DL('traps.7.1.options.1'), DL('traps.7.1.options.2')], correct: 0, why: DL('traps.7.1.why') },
    { q: DL('traps.7.2.q'), options: [DL('traps.7.2.options.0'), DL('traps.7.2.options.1'), DL('traps.7.2.options.2')], correct: 0, why: DL('traps.7.2.why') },
  ],
  8: [
    { q: DL('traps.8.0.q'), options: [DL('traps.8.0.options.0'), DL('traps.8.0.options.1')], correct: 0, why: DL('traps.8.0.why') },
    { q: DL('traps.8.1.q'), options: [DL('traps.8.1.options.0'), DL('traps.8.1.options.1'), DL('traps.8.1.options.2')], correct: 0, why: DL('traps.8.1.why') },
    { q: DL('traps.8.2.q'), options: [DL('traps.8.2.options.0'), DL('traps.8.2.options.1')], correct: 0, why: DL('traps.8.2.why') },
    { q: DL('traps.8.3.q'), options: [DL('traps.8.3.options.0'), DL('traps.8.3.options.1'), DL('traps.8.3.options.2')], correct: 0, why: DL('traps.8.3.why') },
    { q: DL('traps.8.4.q'), options: [DL('traps.8.4.options.0'), DL('traps.8.4.options.1'), DL('traps.8.4.options.2')], correct: 0, why: DL('traps.8.4.why') },
  ],
};

// ---------- English ----------
const CODEX_EN = {
  euler: { name: 'Leonhard Euler (1707–1783)', text: 'Swiss mathematician; introduced the notations e, i, f(x), Σ. His formula links the exponential with cosine and sine — today the “language of phase” in quantum mechanics.' },
  i: { name: 'imaginary unit', text: 'The number whose square is −1. Multiplying by i = rotating by 90° in the complex plane.', do: 'Remember: i · i = rotation by 180° = −1.', dont: 'Don’t confuse i (the number) with the index i in α<sub>i</sub> or δ<sub>ij</sub>.' },
  eiphi: { name: 'phase factor', text: 'A complex number of magnitude 1 — a “clock hand” turned by the angle φ.', do: 'Picture a point on the unit circle.', dont: 'It is not a physical spinning of the particle.' },
  amp: { name: 'probability amplitude', text: 'A complex number attached to a basis state. It has both a magnitude and a phase.', do: 'Amplitudes interfere (add up).', dont: 'An amplitude is NOT a probability.' },
  abs2: { name: 'squared absolute value', text: 'Turns an amplitude into a probability (Born rule). It does not “see” the phase.', do: '|α|² = α · α*', dont: '|α|² ≠ α² for complex α (for α = i: α² = −1, |α|² = 1).' },
  ReIm: { name: 'real and imaginary part', text: 'The two axes of the complex plane. The interference term contains Re(A₁A₂*).', dont: 'In QM, don’t throw away the imaginary part of an amplitude — it carries the phase.' },
  interf: { name: 'interference', text: 'First add the amplitudes, only then square. Depending on the relative phase the result is reinforced (constructive) or cancelled (destructive).', dont: 'The word “interference” alone does not explain quantum advantage — water waves interfere too.' },
  conj: { name: 'complex conjugate', text: 'Mirror image across the real axis: a + ib → a − ib. z·z* = |z|².', dont: 'The star here is not multiplication.' },

  stern: { name: 'Otto Stern (1888–1969)', text: 'Master of molecular beams. In 1922 with W. Gerlach: silver atoms in an inhomogeneous field split into TWO spots. Nobel Prize 1943.' },
  gerlach: { name: 'Walther Gerlach (1889–1979)', text: 'Performed the experiment in Frankfurt in 1922. The link to electron spin (Uhlenbeck, Goudsmit 1925) became clear only later.' },
  Sz: { name: 'z component of spin', text: 'Projection of the spin onto the axis chosen by the apparatus. Only two values for spin ½.', do: 'The magnet picks the z axis — S<sub>x</sub> is just as legitimate.', dont: 'Before the measurement the spin was not “pointing” up or down like an arrow.' },
  hbar: { name: 'h-bar (reduced Planck constant)', text: 'h/2π — the natural unit of angular momentum. Outcomes of a spin-½ measurement: +ħ/2 and −ħ/2.', dont: 'Don’t confuse ħ with h (they differ by 2π).' },
  spinhalf: { name: 'spin ½', text: 'Names the KIND of quantum spin (electron, proton). Two possible projections.', dont: '½ does not mean half a turn or half the rotation speed.' },
  basisq: { name: 'the measurement basis is part of the question', text: 'The outcome depends on the axis we measure along. Certainty along z does not mean certainty along x.', dont: 'It depends not on the “observer’s consciousness” but on the experimental arrangement.' },
  ket0: { name: 'basis state “spin up”', text: 'The digits 0 and 1 label two mutually exclusive measurement outcomes.', dont: '|0⟩ is not the zero vector, and |0⟩, |1⟩ are not opposite arrows — they are ORTHOGONAL.' },

  bloch: { name: 'Felix Bloch (1905–1983)', text: 'Heisenberg’s first doctoral student, Nobel Prize 1952 for NMR, first Director-General of CERN. His equations for magnetisation led to the Bloch sphere.' },
  sphere: { name: 'Bloch sphere', text: 'A pure qubit state = a point on the surface, a mixed one = inside. North |0⟩, south |1⟩, equator |±⟩, |±i⟩.', dont: 'It is not laboratory space nor the axis of a spinning ball. Orthogonal states are ANTIPODAL on the sphere.' },
  H: { name: 'Hadamard gate', text: 'A 180° rotation about the axis halfway between x and z. Swaps the axes x ↔ z, y → −y. H·H = I.', do: 'Say “a unitary change of basis”.', dont: '“Creates a superposition” is incomplete — it depends on the basis. Don’t confuse with the Hamiltonian Ĥ.' },
  XYZ: { name: 'Pauli gates', text: '180° rotations about the x, y, z axes. X = bit flip, Z = phase flip.', dont: 'The X gate is not the x coordinate.' },
  ST: { name: 'phase gates', text: 'Rotations about z by 90° (S) and 45° (T). They change the relative phase, not the probabilities in the Z basis.' },
  globalph: { name: 'equality up to a global phase', text: 'States differing by a common factor e<sup>iγ</sup> are physically identical: −iX ∼ X.', dont: '∼ does not mean “I can turn one into the other”. Global ≠ relative phase.' },
  relph: { name: 'relative phase', text: 'The phase difference between α and β. |+⟩ and |−⟩ have the same P(0), P(1) but a different phase — a measurement in the X basis tells them apart.', dont: 'The relative phase cannot be neglected.' },
  thetaphi: { name: 'angles on the Bloch sphere', text: 'θ sets the probabilities in the Z basis, φ is the relative phase. The state formula contains θ/2.' },
  unitary: { name: 'unitary operation = rotation', text: 'Every single-qubit gate is (up to a global phase) a rotation of the Bloch sphere. It preserves the length of the Bloch vector.', dont: 'Not true that “below the surface it’s non-unitary”: unitary operations rotate mixed states too.' },

  feynman: { name: 'Richard Feynman (1918–1988)', text: 'Nobel Prize 1965 (QED). 1981: nature has to be simulated with quantum systems — the birth of the quantum computer idea.' },
  rho: { name: 'density matrix (rho)', text: 'The complete description of a state including mixtures. Diagonal = populations, off-diagonal = coherences.', dont: 'It is the Greek rho, not the letter p.' },
  mix: { name: 'maximally mixed state', text: 'The centre of the Bloch sphere. 50/50 in any basis, no coherences.', dont: 'It is not |+⟩ — that always gives “+” in the X basis.' },
  coh: { name: 'coherence', text: 'A fixed phase relation between components; the “fuel” of interference. Measuring in the basis destroys it.' },
  supmix: { name: 'superposition ≠ mixture', text: 'They give the same statistics in the Z basis, but only a superposition interferes (H·H → 0 with certainty).', dont: 'Superposition is not “we don’t know which state it is in”.' },
  deco: { name: 'decoherence', text: 'The environment “measures” the phase and the off-diagonal elements of ρ vanish. The Bloch vector shrinks inward.', dont: 'By itself it does not produce a definite measurement outcome.' },
  dagger: { name: 'dagger — Hermitian conjugate', text: 'Transpose + complex conjugate. Unitary U: U·U† = I.', dont: '† ≠ transpose T, † ≠ *.' },

  dirac: { name: 'Paul Dirac (1902–1984)', text: 'Dirac equation (1928) → antimatter; Nobel Prize 1933; bra-ket notation (1939). Famously taciturn: “1 dirac = 1 word per hour”.' },
  ket: { name: 'ket', text: 'An abstract quantum state (a column vector).', dont: 'A ket is neither a number nor a function — ψ(x) is only its representation.' },
  bra: { name: 'bra', text: 'The dual (Hermitian-conjugate) vector — a row. It “asks a question”.', dont: 'Forgetting to complex-conjugate the coefficients is an error.' },
  braket: { name: 'bra-ket (inner product)', text: 'A COMPLEX NUMBER — the overlap amplitude of two states.', dont: 'It is not a probability — that is |⟨φ|ψ⟩|².' },
  ketbra: { name: 'ket-bra', text: 'An OPERATOR (matrix). |ψ⟩⟨ψ| is a projector = ρ of a pure state.', dont: 'The order changes the type of object: ⟨φ|ψ⟩ is a number, |ψ⟩⟨φ| is an operator.' },
  hat: { name: 'hat = operator', text: 'An observable quantity as an operator (Ĥ, p̂, Ẑ).', dont: 'On axes (x̂, n̂) the hat means a unit vector.' },
  expect: { name: 'expectation value', text: 'The average of many measurements on identically prepared systems.', dont: 'It need not be a possible outcome of a single measurement (⟨Z⟩ = 0 for |+⟩).' },
  tensor: { name: 'tensor product', text: 'Combines systems: |0⟩ ⊗ |1⟩ = |01⟩. Dimensions multiply.', dont: '⊗ is neither ordinary nor vector (×) multiplication.' },
  kron: { name: 'Kronecker delta', text: '1 if i = j, otherwise 0. Orthonormal basis: ⟨i|j⟩ = δ<sub>ij</sub>.', dont: 'Don’t confuse with the Dirac delta δ(x − x′) for continuous bases.' },

  rabi: { name: 'Isidor Isaac Rabi (1898–1988)', text: 'Magnetic resonance in molecular beams (1938) → NMR, MRI, atomic clocks. Nobel Prize 1944. Co-founder of CERN.' },
  zeeman: { name: 'Pieter Zeeman (1865–1943)', text: 'Splitting of spectral lines in a magnetic field. A spin ½ in the field B₀ has two Zeeman levels = the qubit in NMR.' },
  B0: { name: 'static magnetic field', text: 'Creates two energy levels; the spin precesses about the z axis. It must be stable and homogeneous.' },
  OmegaR: { name: 'Rabi frequency', text: 'The rotation rate under an RF pulse. Ω<sub>R</sub>t = pulse area: π = flip, π/2 = equator.', dont: 'Don’t confuse with the resonance (Larmor) frequency ω.' },
  precess: { name: 'precession', text: 'In quantum terms: evolution of the relative phase and of expectation values. P(0), P(1) do not change.', dont: 'It is not the turning axis of a mechanical gyroscope.' },
  rabiosc: { name: 'Rabi oscillations', text: 'Periodic change of AMPLITUDES and probabilities under a resonant field.', dont: 'The electron does not move mechanically between two places.' },
  rotframe: { name: 'rotating frame', text: 'Coordinates that turn at the resonance frequency — the fast precession “stops”.', dont: 'It is a mathematical trick, not a rotating laboratory.' },
  T2: { name: 'relaxation times', text: 'T₂: loss of phase coherence (dephasing). T₁: return of populations to the thermal state (amplitude noise).' },
  ensemble: { name: 'ensemble measurement (NMR, SpinQ)', text: 'We measure the signal of a huge number of molecules (transverse magnetisation) → an expectation value, not individual outcomes.' },

  bell: { name: 'John Stewart Bell (1928–1990)', text: 'CERN. 1964: no local theory with pre-existing values reproduces quantum correlations. Nobel Prize 2022 for the experiments (Aspect, Clauser, Zeilinger).' },
  einstein: { name: 'Albert Einstein (1879–1955)', text: 'Light quanta (1905), Nobel Prize 1921. EPR (1935): in his view QM is incomplete — “spooky action at a distance”.' },
  cnot: { name: 'controlled NOT', text: 'If the control qubit is |1⟩, it flips the target. Together with H it creates entanglement. In NMR via J-coupling.' },
  phiplus: { name: 'Bell state', text: '(|00⟩ + |11⟩)/√2 — maximally entangled. Cannot be written as a product.', dont: 'An entangled qubit has NO arrow of its own on the Bloch sphere (it sits in the centre).' },
  entangle: { name: 'entanglement', text: 'Correlations stronger than classical ones. The term was introduced by Schrödinger in 1935.', dont: 'It does not allow faster-than-light communication. It is not an “invisible rope”.' },
  chsh: { name: 'Bell (CHSH) inequality', text: 'A local strategy wins the CHSH game at most 75 % of the time. Entangled qubits ~85 %.', do: 'Read it as: one cannot keep both locality and pre-existing values.' },
  nosignal: { name: 'no-signalling', text: 'Bob sees 50/50 whatever Alice does. The correlations show up only after comparing results over a classical channel.' },

  bohr: { name: 'Niels Bohr (1885–1962)', text: 'Atomic model, Nobel Prize 1922, complementarity (1927). A phenomenon cannot be described without the experimental conditions.', dont: 'Complementarity is not relativism.' },
  kant: { name: 'Immanuel Kant (1724–1804)', text: '“The conditions of the possibility of experience are at the same time conditions of the possibility of the objects of experience.” Quantum state = the conditions of possibility of an outcome.' },
  wittg: { name: 'Ludwig Wittgenstein (1889–1951)', text: '“The limits of my language mean the limits of my world.” “The meaning of a word is its use.” Originally an engineer.' },
  bohm: { name: 'David Bohm (1917–1992)', text: 'Pilot wave and hidden variables (1952): a deterministic but NON-LOCAL theory.' },
  stodola: { name: 'Aurel Stodola (1859–1942)', text: 'Liptovský Mikuláš → ETH Zürich, steam turbines. Engineering realism: theory as a design framework.' },
  heis: { name: 'Werner Heisenberg (1901–1976)', text: 'Matrix mechanics (1925), uncertainty principle (1927). “What we observe is not nature in itself but nature exposed to our method of questioning.”' },
  noether: { name: 'Emmy Noether (1882–1935)', text: 'Symmetry ↔ conservation law. Before measurement: symmetry (possibility); after measurement: a fact.' },
  collapse: { name: 'collapse as an engineering operation', text: 'Readout: amplification → coupling to the macroworld → writing to a classical register. Irreversible.', dont: 'It is not a magical intervention of consciousness.' },
  onto: { name: 'ontology / epistemology / phenomenology', text: 'What exists? / What can we know about it? / How does the phenomenon appear to us?' },
  four: { name: 'four questions for every concept', text: 'What system? What equation and assumptions? What experiment? What does the description NOT imply?' },
};
const CODEX_UK = {
  euler: { name: 'Леонард Ейлер (1707–1783)', text: 'Швейцарський математик; запровадив позначення e, i, f(x), Σ. Його формула пов’язує експоненту з косинусом і синусом — сьогодні це «мова фази» в квантовій механіці.' },
  i: { name: 'уявна одиниця', text: 'Число, квадрат якого дорівнює −1. Множення на i = поворот на 90° у комплексній площині.', do: 'Запам’ятай: i · i = поворот на 180° = −1.', dont: 'Не плутай i (число) з індексом i в α<sub>i</sub> чи δ<sub>ij</sub>.' },
  eiphi: { name: 'фазовий множник', text: 'Комплексне число з модулем 1 — «стрілка годинника», повернута на кут φ.', do: 'Уяви точку на одиничному колі.', dont: 'Це не фізичне обертання частинки.' },
  amp: { name: 'амплітуда ймовірності', text: 'Комплексне число, приписане базисному станові. Має і модуль, і фазу.', do: 'Амплітуди інтерферують (додаються).', dont: 'Амплітуда — НЕ ймовірність.' },
  abs2: { name: 'квадрат модуля', text: 'Перетворює амплітуду на ймовірність (правило Борна). Фази «не бачить».', do: '|α|² = α · α*', dont: '|α|² ≠ α² для комплексного α (для α = i: α² = −1, |α|² = 1).' },
  ReIm: { name: 'дійсна та уявна частина', text: 'Дві осі комплексної площини. Інтерференційний доданок містить Re(A₁A₂*).', dont: 'У КМ не відкидай уявну частину амплітуди — вона несе фазу.' },
  interf: { name: 'інтерференція', text: 'Спершу додай амплітуди, лише потім піднось до квадрата. Залежно від відносної фази результат підсилюється (конструктивно) або гаситься (деструктивно).', dont: 'Саме слово «інтерференція» не пояснює квантової переваги — хвилі на воді теж інтерферують.' },
  conj: { name: 'комплексне спряження', text: 'Дзеркальне відбиття відносно дійсної осі: a + ib → a − ib. z·z* = |z|².', dont: 'Зірочка тут — не множення.' },

  stern: { name: 'Отто Штерн (1888–1969)', text: 'Майстер молекулярних пучків. 1922 року з В. Ґерлахом: атоми срібла в неоднорідному полі розщепилися на ДВІ плями. Нобелівська премія 1943.' },
  gerlach: { name: 'Вальтер Ґерлах (1889–1979)', text: 'Провів експеримент у Франкфурті 1922 року. Зв’язок зі спіном електрона (Уленбек, Гаудсміт 1925) став зрозумілим лише пізніше.' },
  Sz: { name: 'z-компонента спіну', text: 'Проєкція спіну на вісь, обрану приладом. Для спіну ½ лише два значення.', do: 'Магніт обирає вісь z — S<sub>x</sub> так само законна.', dont: 'До вимірювання спін не «вказував» угору чи вниз, як стрілка.' },
  hbar: { name: 'h із рискою (зведена стала Планка)', text: 'h/2π — природна одиниця моменту імпульсу. Результати вимірювання спіну ½: +ħ/2 і −ħ/2.', dont: 'Не плутай ħ із h (вони відрізняються на 2π).' },
  spinhalf: { name: 'спін ½', text: 'Називає РІЗНОВИД квантового спіну (електрон, протон). Дві можливі проєкції.', dont: '½ не означає пів оберту чи половину швидкості обертання.' },
  basisq: { name: 'базис вимірювання — частина питання', text: 'Результат залежить від осі, вздовж якої вимірюємо. Певність уздовж z не означає певності вздовж x.', dont: 'Залежить не від «свідомості спостерігача», а від експериментального влаштування.' },
  ket0: { name: 'базисний стан «спін угору»', text: 'Цифри 0 і 1 позначають два взаємовиключні результати вимірювання.', dont: '|0⟩ — не нульовий вектор, а |0⟩, |1⟩ — не протилежні стрілки: вони ОРТОГОНАЛЬНІ.' },

  bloch: { name: 'Фелікс Блох (1905–1983)', text: 'Перший докторант Гейзенберга, Нобелівська премія 1952 за ЯМР, перший генеральний директор CERN. Його рівняння для намагніченості привели до сфери Блоха.' },
  sphere: { name: 'сфера Блоха', text: 'Чистий стан кубіта = точка на поверхні, змішаний = всередині. Північ |0⟩, південь |1⟩, екватор |±⟩, |±i⟩.', dont: 'Це не простір лабораторії й не вісь кульки, що обертається. Ортогональні стани на сфері — ПРОТИЛЕЖНІ.' },
  H: { name: 'гейт Адамара', text: 'Поворот на 180° навколо осі посередині між x і z. Міняє осі x ↔ z, y → −y. H·H = I.', do: 'Кажи «унітарна зміна базису».', dont: '«Створює суперпозицію» — неповно, бо залежить від базису. Не плутай із гамільтоніаном Ĥ.' },
  XYZ: { name: 'гейти Паулі', text: 'Повороти на 180° навколо осей x, y, z. X = переворот біта, Z = переворот фази.', dont: 'Гейт X — це не координата x.' },
  ST: { name: 'фазові гейти', text: 'Повороти навколо z на 90° (S) і 45° (T). Змінюють відносну фазу, а не ймовірності в базисі Z.' },
  globalph: { name: 'рівність з точністю до глобальної фази', text: 'Стани, що відрізняються спільним множником e<sup>iγ</sup>, фізично тотожні: −iX ∼ X.', dont: '∼ не означає «можу перетворити одне на інше». Глобальна ≠ відносна фаза.' },
  relph: { name: 'відносна фаза', text: 'Різниця фаз між α і β. |+⟩ і |−⟩ мають однакові P(0), P(1), але різну фазу — вимірювання в базисі X їх розрізнить.', dont: 'Відносною фазою не можна знехтувати.' },
  thetaphi: { name: 'кути на сфері Блоха', text: 'θ задає ймовірності в базисі Z, φ — відносна фаза. Формула стану містить θ/2.' },
  unitary: { name: 'унітарна операція = поворот', text: 'Кожен однокубітовий гейт — це (з точністю до глобальної фази) поворот сфери Блоха. Він зберігає довжину вектора Блоха.', dont: 'Неправда, що «під поверхнею все неунітарне»: унітарні операції обертають і змішані стани.' },

  feynman: { name: 'Річард Фейнман (1918–1988)', text: 'Нобелівська премія 1965 (КЕД). 1981: природу треба моделювати квантовими системами — народження ідеї квантового комп’ютера.' },
  rho: { name: 'матриця густини (ро)', text: 'Повний опис стану, включно із сумішами. Діагональ = заселеності, позадіагональ = когерентності.', dont: 'Це грецька ро, а не літера p.' },
  mix: { name: 'максимально змішаний стан', text: 'Центр сфери Блоха. 50/50 у будь-якому базисі, без когерентностей.', dont: 'Це не |+⟩ — той у базисі X завжди дає «+».' },
  coh: { name: 'когерентність', text: 'Стале фазове співвідношення між складовими; «паливо» інтерференції. Вимірювання в базисі її руйнує.' },
  supmix: { name: 'суперпозиція ≠ суміш', text: 'У базисі Z дають однакову статистику, але інтерферує лише суперпозиція (H·H → 0 напевно).', dont: 'Суперпозиція — це не «ми не знаємо, в якому вона стані».' },
  deco: { name: 'декогеренція', text: 'Довкілля «вимірює» фазу, і позадіагональні елементи ρ зникають. Вектор Блоха стискається всередину.', dont: 'Сама по собі вона не дає певного результату вимірювання.' },
  dagger: { name: 'кинджал — ермітове спряження', text: 'Транспонування + комплексне спряження. Унітарне U: U·U† = I.', dont: '† ≠ транспонування T, † ≠ *.' },

  dirac: { name: 'Поль Дірак (1902–1984)', text: 'Рівняння Дірака (1928) → антиматерія; Нобелівська премія 1933; бра-кет запис (1939). Славився мовчазністю: «1 дірак = 1 слово на годину».' },
  ket: { name: 'кет', text: 'Абстрактний квантовий стан (вектор-стовпець).', dont: 'Кет — не число й не функція; ψ(x) — лише його представлення.' },
  bra: { name: 'бра', text: 'Дуальний (ермітово спряжений) вектор — рядок. Він «ставить питання».', dont: 'Забути комплексно спрягнути коефіцієнти — помилка.' },
  braket: { name: 'бра-кет (скалярний добуток)', text: 'КОМПЛЕКСНЕ ЧИСЛО — амплітуда перекриття двох станів.', dont: 'Це не ймовірність — нею є |⟨φ|ψ⟩|².' },
  ketbra: { name: 'кет-бра', text: 'ОПЕРАТОР (матриця). |ψ⟩⟨ψ| — проєктор = ρ чистого стану.', dont: 'Порядок змінює тип об’єкта: ⟨φ|ψ⟩ — число, |ψ⟩⟨φ| — оператор.' },
  hat: { name: 'дашок = оператор', text: 'Спостережувана величина як оператор (Ĥ, p̂, Ẑ).', dont: 'На осях (x̂, n̂) дашок означає одиничний вектор.' },
  expect: { name: 'середнє значення', text: 'Середнє багатьох вимірювань на однаково приготованих системах.', dont: 'Воно не обов’язково є можливим результатом одного вимірювання (⟨Z⟩ = 0 для |+⟩).' },
  tensor: { name: 'тензорний добуток', text: 'Поєднує системи: |0⟩ ⊗ |1⟩ = |01⟩. Розмірності перемножуються.', dont: '⊗ — не звичайне й не векторне (×) множення.' },
  kron: { name: 'дельта Кронекера', text: '1, якщо i = j, інакше 0. Ортонормований базис: ⟨i|j⟩ = δ<sub>ij</sub>.', dont: 'Не плутай із дельтою Дірака δ(x − x′) для неперервних базисів.' },

  rabi: { name: 'Ісидор Айзек Рабі (1898–1988)', text: 'Магнітний резонанс у молекулярних пучках (1938) → ЯМР, МРТ, атомні годинники. Нобелівська премія 1944. Співзасновник CERN.' },
  zeeman: { name: 'Пітер Зееман (1865–1943)', text: 'Розщеплення спектральних ліній у магнітному полі. Спін ½ у полі B₀ має два зееманівські рівні = кубіт у ЯМР.' },
  B0: { name: 'статичне магнітне поле', text: 'Створює два енергетичні рівні; спін прецесує навколо осі z. Мусить бути стабільним і однорідним.' },
  OmegaR: { name: 'частота Рабі', text: 'Швидкість обертання під дією РЧ-імпульсу. Ω<sub>R</sub>t = площа імпульсу: π = переворот, π/2 = екватор.', dont: 'Не плутай із резонансною (ларморовою) частотою ω.' },
  precess: { name: 'прецесія', text: 'Квантовою мовою: еволюція відносної фази та середніх значень. P(0), P(1) не змінюються.', dont: 'Це не вісь обертання механічного гіроскопа.' },
  rabiosc: { name: 'осциляції Рабі', text: 'Періодична зміна АМПЛІТУД та ймовірностей під дією резонансного поля.', dont: 'Електрон не рухається механічно між двома місцями.' },
  rotframe: { name: 'обертова система відліку', text: 'Координати, що обертаються з резонансною частотою, — швидка прецесія «зупиняється».', dont: 'Це математичний трюк, а не лабораторія, що обертається.' },
  T2: { name: 'часи релаксації', text: 'T₂: втрата фазової когерентності (дефазування). T₁: повернення заселеностей до теплового стану (амплітудний шум).' },
  ensemble: { name: 'ансамблеве вимірювання (ЯМР, SpinQ)', text: 'Ми вимірюємо сигнал величезної кількості молекул (поперечну намагніченість) → середнє значення, а не окремі результати.' },

  bell: { name: 'Джон Стюарт Белл (1928–1990)', text: 'CERN. 1964: жодна локальна теорія з наперед існуючими значеннями не відтворює квантових кореляцій. Нобелівська премія 2022 за експерименти (Аспе, Клаузер, Цайлінгер).' },
  einstein: { name: 'Альберт Ейнштейн (1879–1955)', text: 'Кванти світла (1905), Нобелівська премія 1921. ЕПР (1935): на його думку, КМ неповна — «моторошна дія на відстані».' },
  cnot: { name: 'керований НЕ', text: 'Якщо керівний кубіт у |1⟩, перевертає цільовий. Разом з H створює сплутаність. У ЯМР — через J-зв’язок.' },
  phiplus: { name: 'стан Белла', text: '(|00⟩ + |11⟩)/√2 — максимально сплутаний. Не записується як добуток.', dont: 'Сплутаний кубіт НЕ має власної стрілки на сфері Блоха (він у центрі).' },
  entangle: { name: 'сплутаність', text: 'Кореляції, сильніші за класичні. Термін запровадив Шредінгер 1935 року.', dont: 'Не дозволяє надсвітлового зв’язку. Це не «невидимий мотузок».' },
  chsh: { name: 'нерівність Белла (CHSH)', text: 'Локальна стратегія виграє гру CHSH щонайбільше в 75 % випадків. Сплутані кубіти — ~85 %.', do: 'Читай так: не можна зберегти водночас і локальність, і наперед існуючі значення.' },
  nosignal: { name: 'неможливість сигналізації', text: 'Боб бачить 50/50, хоч би що робила Аліса. Кореляції видно лише після порівняння результатів класичним каналом.' },

  bohr: { name: 'Нільс Бор (1885–1962)', text: 'Модель атома, Нобелівська премія 1922, доповнювальність (1927). Явище не можна описати без експериментальних умов.', dont: 'Доповнювальність — не релятивізм.' },
  kant: { name: 'Іммануїл Кант (1724–1804)', text: '«Умови можливості досвіду водночас є умовами можливості предметів досвіду». Квантовий стан = умови можливості результату.' },
  wittg: { name: 'Людвіг Вітгенштейн (1889–1951)', text: '«Межі моєї мови означають межі мого світу». «Значення слова — це його вживання». За фахом спершу інженер.' },
  bohm: { name: 'Девід Бом (1917–1992)', text: 'Хвиля-пілот і приховані змінні (1952): детерміністична, але НЕЛОКАЛЬНА теорія.' },
  stodola: { name: 'Аурел Стодола (1859–1942)', text: 'Ліптовський Мікулаш → ETH Цюрих, парові турбіни. Інженерний реалізм: теорія як конструкторська рамка.' },
  heis: { name: 'Вернер Гейзенберг (1901–1976)', text: 'Матрична механіка (1925), принцип невизначеності (1927). «Те, що ми спостерігаємо, — не природа сама по собі, а природа, підставлена нашому способові ставити питання».' },
  noether: { name: 'Еммі Нетер (1882–1935)', text: 'Симетрія ↔ закон збереження. До вимірювання: симетрія (можливість); після вимірювання: факт.' },
  collapse: { name: 'колапс як інженерна операція', text: 'Зчитування: підсилення → зв’язок із макросвітом → запис у класичний регістр. Незворотне.', dont: 'Це не магічне втручання свідомості.' },
  onto: { name: 'онтологія / епістемологія / феноменологія', text: 'Що існує? / Що ми можемо про це знати? / Як явище нам постає?' },
  four: { name: 'чотири питання до кожного поняття', text: 'Яка система? Яке рівняння й припущення? Який експеримент? Чого опис НЕ означає?' },
};
const CODEX_TR = tr(null, CODEX_EN, CODEX_UK);
if (CODEX_TR) for (const c of CODEX) {
  const e = CODEX_TR[c.id];
  if (!e) continue;
  delete c.do; delete c.dont;
  Object.assign(c, e);
}

const TRAPS = TRAPS_SK;
