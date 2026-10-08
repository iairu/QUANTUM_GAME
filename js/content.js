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
const TRAPS = {
  1: [
    { q: 'Amplitúda α = 0,6i. Aká je pravdepodobnosť príslušného výsledku?', options: ['0,36', '−0,36', '0,6'], correct: 0, why: '|α|² = α·α* = 0,6i · (−0,6i) = 0,36. Pravdepodobnosť nikdy nie je záporná.' },
    { q: 'Čo znamená násobenie amplitúdy faktorom e<sup>iφ</sup>?', options: ['otočenie „ručičky“ v komplexnej rovine o uhol φ', 'zväčšenie pravdepodobnosti', 'fyzikálne roztočenie častice'], correct: 0, why: 'Veľkosť (a teda |α|²) sa nemení, mení sa len fáza.' },
    { q: 'Ktorá veta je správna?', options: ['Interferujú amplitúdy, až potom počítame pravdepodobnosť.', 'Interferujú pravdepodobnosti.', 'Interferencia je čisto kvantový jav, klasické vlny ju nemajú.'], correct: 0, why: 'Klasické vlny interferujú tiež — kvantovo však interferujú amplitúdy pravdepodobnosti.' },
  ],
  2: [
    { q: 'Sternov–Gerlachov experiment ukázal…', options: ['dve oddelené stopy pri meraní v zvolenom smere', 'ako sa elektrón naozaj točí', 'spojitý pás všetkých výchyliek'], correct: 0, why: 'Ukázal výsledky presne určeného merania, nie „film“ rotujúceho elektrónu.' },
    { q: 'Atóm prejde filtrom „+z“, potom meriame v osi x. Čo platí?', options: ['+x aj −x po 50 %', 'vždy +x', 'vždy +z'], correct: 0, why: 'Istota v jednej báze neznamená istotu v inej.' },
    { q: 'Čo znamená „spin ½“?', options: ['druh kvantového spinu s dvoma možnými projekciami', 'polovičnú otáčku elektrónu', 'polovičnú rýchlosť otáčania'], correct: 0, why: 'Je to označenie typu spinu, nie mechanická rotácia.' },
  ],
  3: [
    { q: 'Ako je správne povedať, čo robí Hadamardovo hradlo?', options: ['vykoná unitárnu rotáciu, ktorá vymení osi x a z', 'vždy vytvorí superpozíciu', 'odmeria qubit'], correct: 0, why: 'H|+⟩ = |0⟩ — superpozíciu teda aj „zruší“. Závisí od bázy.' },
    { q: '−iX ∼ X znamená…', options: ['rovnaké až na globálnu fázu (fyzikálne totožné)', 'viem jedno premeniť na druhé', 'líšia sa relatívnou fázou'], correct: 0, why: 'Faktor −i je spoločný pre celý stav → globálna fáza, nepozorovateľná.' },
    { q: 'Kde ležia ortogonálne stavy |0⟩ a |1⟩ na Blochovej sfére?', options: ['na opačných póloch', 'kolmo na seba (90°)', 'v tom istom bode'], correct: 0, why: 'V Hilbertovom priestore kolmé, na Blochovej sfére protiľahlé (kvôli θ/2).' },
    { q: 'Hradlo Z aplikované na |+⟩…', options: ['zmení stav na |−⟩, P(0) a P(1) v Z-báze zostanú ½', 'nezmení nič, lebo pravdepodobnosti sú rovnaké', 'preklopí |0⟩ na |1⟩'], correct: 0, why: 'Rotácia okolo z mení relatívnu fázu — rozlíšiš to meraním v X-báze.' },
  ],
  4: [
    { q: 'Medzi dve H vložíme meranie v Z-báze a výsledok zabudneme. Prečo už nedostaneme 0 s istotou?', options: ['meranie zničilo koherenciu (mimodiagonálne prvky ρ)', 'meranie pokazilo hradlo', 'qubit sa unavil'], correct: 0, why: 'Bez fázového vzťahu nemá druhé H čo premeniť na interferenciu.' },
    { q: 'Matica hustoty sa označuje…', options: ['ρ (ró)', 'p', 'P'], correct: 0, why: 'Grécke ró. Písmeno p je hybnosť alebo pravdepodobnosť.' },
    { q: 'Ktorá veta je správna?', options: ['Superpozícia a zmes môžu mať rovnaké Z-štatistiky, ale líšia sa pri interferencii.', 'Superpozícia znamená, že nevieme, v ktorom stave qubit je.', 'Kvantový počítač vyskúša všetky možnosti a vyberie správnu.'], correct: 0, why: 'Superpozícia nie je neznalosť a kvantový paralelizmus nie je 2ⁿ procesorov.' },
  ],
  5: [
    { q: 'Čo je ⟨φ|ψ⟩?', options: ['komplexné číslo (amplitúda)', 'operátor', 'pravdepodobnosť'], correct: 0, why: 'Pravdepodobnosť je až |⟨φ|ψ⟩|².' },
    { q: 'Čo je |ψ⟩⟨φ|?', options: ['operátor (matica)', 'číslo', 'stav'], correct: 0, why: 'Stĺpec krát riadok = matica. Poradie je významové!' },
    { q: 'Vlnová funkcia ψ(x) je…', options: ['reprezentácia stavu v polohovej báze: ⟨x|ψ⟩', 'samotný abstraktný stav', 'pravdepodobnosť nájdenia častice'], correct: 0, why: 'Ten istý |ψ⟩ má aj hybnostnú reprezentáciu ⟨p|ψ⟩.' },
  ],
  6: [
    { q: 'Čo „osciluje“ pri Rabiho osciláciách?', options: ['amplitúdy a pravdepodobnosti výsledkov', 'elektrón medzi dvoma polohami', 'magnet v prístroji'], correct: 0, why: 'Nič sa mechanicky nekýve — mení sa stav.' },
    { q: 'Precesia okolo osi z pri meraní v Z-báze…', options: ['nemení P(0) ani P(1), mení fázu', 'preklápa spin', 'zväčšuje energiu'], correct: 0, why: 'Rotácia okolo z = zmena relatívnej fázy.' },
    { q: 'NMR signál (napr. SpinQ) zodpovedá…', options: ['strednej hodnote priečnej magnetizácie ansámblu', 'jednému výsledku jednej molekuly', 'kolapsu jedného spinu'], correct: 0, why: 'Meriame súbor molekúl naraz.' },
    { q: 'Blochov vektor sa vplyvom T₂ skráti na polovicu. Stav je…', options: ['zmiešaný (vnútri sféry)', 'stále čistý', 'neplatný'], correct: 0, why: '|r| < 1 → zmiešaný stav. Normalizácia (stopa ρ = 1) však stále platí.' },
  ],
  7: [
    { q: 'Alice zmení svoju meraciu os. Čo uvidí Bob vo svojich výsledkoch?', options: ['stále 50/50 — nič sa nezmení', 'okamžitú zmenu štatistiky', 'správu od Alice'], correct: 0, why: 'Previazanosť neumožňuje signalizáciu. Korelácie vidno až po porovnaní.' },
    { q: 'Prečo previazaný qubit nemá šípku na Blochovej sfére?', options: ['nemá vlastný čistý stav — jeho redukovaný stav je zmes', 'lebo je pokazený', 'lebo sa točí príliš rýchlo'], correct: 0, why: 'Celok je čistý, časť je zmiešaná — „celok je viac než súčet častí“.' },
    { q: 'Porušenie Bellovej nerovnosti znamená…', options: ['nemožno zároveň zachovať lokálnosť a predexistujúce hodnoty', 'kvantová mechanika je vyvrátená', 'informácia letí rýchlejšie ako svetlo'], correct: 0, why: 'Bohm volí nelokálnosť, operačný prístup opúšťa predexistujúce hodnoty.' },
  ],
  8: [
    { q: '„Elektrón neexistuje, kým sa naň nepozrieme.“ Je to presné vyjadrenie Bohra?', options: ['Nie — Bohr žiadal uviesť experimentálne podmienky opisu javu.', 'Áno, presne tak to tvrdil.'], correct: 0, why: 'Bohrovi išlo o jednoznačnú komunikáciu výsledkov, nie o popieranie existencie.' },
    { q: 'Komplementarita je…', options: ['štruktúrovaný pluralizmus opisu (nezlučiteľné experimentálne rámce)', 'relativizmus — každý má svoju pravdu', 'psychologický vplyv pozorovateľa'], correct: 0, why: 'Každý opis je presný a objektívny v rámci svojich podmienok.' },
    { q: 'Spája výsledok merania vedomie pozorovateľa?', options: ['Nie — rozhoduje fyzikálna interakcia a usporiadanie experimentu.', 'Áno, vedomie vytvára výsledok.'], correct: 0, why: 'Úloha vedomia z kvantového formalizmu nevyplýva.' },
    { q: 'Ktorá otázka je EPISTEMOLOGICKÁ?', options: ['Čo o tom môžeme vedieť?', 'Čo existuje?', 'Ako sa nám jav ukazuje?'], correct: 0, why: 'Ontológia = čo existuje, fenomenológia = ako sa jav ukazuje.' },
    { q: 'Bohmova mechanika je…', options: ['deterministická, so skrytými premennými, ale nelokálna', 'lokálna a deterministická', 'vyvrátená Bellovými nerovnosťami'], correct: 0, why: 'Bell vylučuje LOKÁLNE skryté premenné, Bohmove sú nelokálne.' },
  ],
};
