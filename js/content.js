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
if (LANG === 'en') for (const c of CODEX) {
  const e = CODEX_EN[c.id];
  if (!e) continue;
  delete c.do; delete c.dont;
  Object.assign(c, e);
}

const TRAPS_EN = {
  1: [
    { q: 'Amplitude α = 0.6i. What is the probability of the corresponding outcome?', options: ['0.36', '−0.36', '0.6'], correct: 0, why: '|α|² = α·α* = 0.6i · (−0.6i) = 0.36. A probability is never negative.' },
    { q: 'What does multiplying an amplitude by the factor e<sup>iφ</sup> mean?', options: ['rotating the “hand” in the complex plane by the angle φ', 'increasing the probability', 'physically spinning the particle'], correct: 0, why: 'The magnitude (and hence |α|²) does not change, only the phase does.' },
    { q: 'Which sentence is correct?', options: ['Amplitudes interfere; only afterwards do we compute the probability.', 'Probabilities interfere.', 'Interference is a purely quantum phenomenon; classical waves don’t have it.'], correct: 0, why: 'Classical waves interfere too — but in quantum mechanics it is probability amplitudes that interfere.' },
  ],
  2: [
    { q: 'The Stern–Gerlach experiment showed…', options: ['two separate spots when measuring along a chosen direction', 'how the electron really spins', 'a continuous band of all deflections'], correct: 0, why: 'It showed the outcomes of a precisely specified measurement, not a “movie” of a spinning electron.' },
    { q: 'An atom passes a “+z” filter, then we measure along x. What holds?', options: ['+x and −x 50 % each', 'always +x', 'always +z'], correct: 0, why: 'Certainty in one basis does not mean certainty in another.' },
    { q: 'What does “spin ½” mean?', options: ['a kind of quantum spin with two possible projections', 'half a turn of the electron', 'half the rotation speed'], correct: 0, why: 'It names the type of spin, not a mechanical rotation.' },
  ],
  3: [
    { q: 'What is the correct way to say what the Hadamard gate does?', options: ['it performs a unitary rotation that swaps the x and z axes', 'it always creates a superposition', 'it measures the qubit'], correct: 0, why: 'H|+⟩ = |0⟩ — so it also “undoes” a superposition. It depends on the basis.' },
    { q: '−iX ∼ X means…', options: ['equal up to a global phase (physically identical)', 'I can turn one into the other', 'they differ by a relative phase'], correct: 0, why: 'The factor −i is common to the whole state → a global phase, unobservable.' },
    { q: 'Where do the orthogonal states |0⟩ and |1⟩ lie on the Bloch sphere?', options: ['at opposite poles', 'perpendicular to each other (90°)', 'at the same point'], correct: 0, why: 'Perpendicular in Hilbert space, antipodal on the Bloch sphere (because of θ/2).' },
    { q: 'The Z gate applied to |+⟩…', options: ['turns it into |−⟩; P(0) and P(1) in the Z basis stay ½', 'changes nothing, because the probabilities are the same', 'flips |0⟩ to |1⟩'], correct: 0, why: 'A rotation about z changes the relative phase — you can tell by measuring in the X basis.' },
  ],
  4: [
    { q: 'We insert a Z-basis measurement between two H gates and forget the result. Why don’t we get 0 with certainty any more?', options: ['the measurement destroyed the coherence (off-diagonal elements of ρ)', 'the measurement broke the gate', 'the qubit got tired'], correct: 0, why: 'Without a phase relation, the second H has nothing to turn into interference.' },
    { q: 'The density matrix is denoted…', options: ['ρ (rho)', 'p', 'P'], correct: 0, why: 'Greek rho. The letter p is momentum or probability.' },
    { q: 'Which sentence is correct?', options: ['A superposition and a mixture can have the same Z statistics but differ under interference.', 'Superposition means we don’t know which state the qubit is in.', 'A quantum computer tries all possibilities and picks the right one.'], correct: 0, why: 'Superposition is not ignorance, and quantum parallelism is not 2ⁿ processors.' },
  ],
  5: [
    { q: 'What is ⟨φ|ψ⟩?', options: ['a complex number (amplitude)', 'an operator', 'a probability'], correct: 0, why: 'The probability is |⟨φ|ψ⟩|².' },
    { q: 'What is |ψ⟩⟨φ|?', options: ['an operator (matrix)', 'a number', 'a state'], correct: 0, why: 'Column times row = matrix. The order carries meaning!' },
    { q: 'The wave function ψ(x) is…', options: ['the representation of the state in the position basis: ⟨x|ψ⟩', 'the abstract state itself', 'the probability of finding the particle'], correct: 0, why: 'The same |ψ⟩ also has a momentum representation ⟨p|ψ⟩.' },
  ],
  6: [
    { q: 'What “oscillates” in Rabi oscillations?', options: ['the amplitudes and probabilities of the outcomes', 'the electron between two positions', 'the magnet in the apparatus'], correct: 0, why: 'Nothing swings mechanically — the state changes.' },
    { q: 'Precession about the z axis, when measuring in the Z basis…', options: ['changes neither P(0) nor P(1); it changes the phase', 'flips the spin', 'increases the energy'], correct: 0, why: 'Rotation about z = change of the relative phase.' },
    { q: 'The NMR signal (e.g. SpinQ) corresponds to…', options: ['the expectation value of the transverse magnetisation of the ensemble', 'a single outcome of a single molecule', 'the collapse of one spin'], correct: 0, why: 'We measure a whole collection of molecules at once.' },
    { q: 'Because of T₂ the Bloch vector shrinks to half its length. The state is…', options: ['mixed (inside the sphere)', 'still pure', 'invalid'], correct: 0, why: '|r| < 1 → mixed state. Normalisation (trace of ρ = 1) still holds.' },
  ],
  7: [
    { q: 'Alice changes her measurement axis. What does Bob see in his results?', options: ['still 50/50 — nothing changes', 'an instant change in the statistics', 'a message from Alice'], correct: 0, why: 'Entanglement does not allow signalling. The correlations show only after comparing.' },
    { q: 'Why does an entangled qubit have no arrow on the Bloch sphere?', options: ['it has no pure state of its own — its reduced state is a mixture', 'because it is broken', 'because it spins too fast'], correct: 0, why: 'The whole is pure, the part is mixed — “the whole is more than the sum of its parts”.' },
    { q: 'A violation of Bell’s inequality means…', options: ['one cannot keep both locality and pre-existing values', 'quantum mechanics is refuted', 'information travels faster than light'], correct: 0, why: 'Bohm chooses non-locality; the operational approach abandons pre-existing values.' },
  ],
  8: [
    { q: '“The electron doesn’t exist until we look at it.” Is this an accurate statement of Bohr’s view?', options: ['No — Bohr demanded stating the experimental conditions under which a phenomenon is described.', 'Yes, that is exactly what he claimed.'], correct: 0, why: 'Bohr cared about unambiguous communication of results, not about denying existence.' },
    { q: 'Complementarity is…', options: ['a structured pluralism of descriptions (incompatible experimental frameworks)', 'relativism — everyone has their own truth', 'the psychological influence of the observer'], correct: 0, why: 'Each description is precise and objective within its own conditions.' },
    { q: 'Does the observer’s consciousness determine the measurement outcome?', options: ['No — the physical interaction and the experimental arrangement decide.', 'Yes, consciousness creates the outcome.'], correct: 0, why: 'A role for consciousness does not follow from the quantum formalism.' },
    { q: 'Which question is EPISTEMOLOGICAL?', options: ['What can we know about it?', 'What exists?', 'How does the phenomenon appear to us?'], correct: 0, why: 'Ontology = what exists, phenomenology = how the phenomenon appears.' },
    { q: 'Bohmian mechanics is…', options: ['deterministic, with hidden variables, but non-local', 'local and deterministic', 'refuted by Bell’s inequalities'], correct: 0, why: 'Bell rules out LOCAL hidden variables; Bohm’s are non-local.' },
  ],
};
const TRAPS = tr(TRAPS_SK, TRAPS_EN);
