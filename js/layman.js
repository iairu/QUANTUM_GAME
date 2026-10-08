'use strict';
// Laická obťažnosť: mechanika ako ľahká, ale reč „po ľudsky“ — pred každou úlohou vysvetlenie bežnými slovami,
// žargón v dialógoch dostane preklad do bežnej reči v zátvorke a vysvetlivky sú jednoduché.

// Kartičky „po ľudsky“ pred jednotlivými krokmi levelov (level → názov kroku → repliky [sk, en])
const LAYMAN_STEPS = {
  1: {
    intro: [['Zabudni na vzorce. V kvantovom počítači nesie <b>každá možná odpoveď malú šípku</b> (ako ručička hodín).',
      'Forget the formulas. In a quantum computer <b>every possible answer carries a little arrow</b> (like a clock hand).'],
    ['<b>Dlhá šípka = odpoveď je pravdepodobná.</b> Krátka = málo pravdepodobná. Smer šípky („fáza“) je niečo ako načasovanie — dôležitý je až vtedy, keď sa šípky stretnú.',
      '<b>Long arrow = a likely answer.</b> Short arrow = an unlikely one. The arrow’s direction (its “phase”) is like timing — it only matters when arrows meet.']],
    setHand: [['Úloha je jednoduchá: <b>potiahni šípku na zlatú značku</b> — správna dĺžka aj správny smer. Nič viac „nastavenie amplitúdy“ neznamená.',
      'Simple task: <b>drag the arrow onto the golden mark</b> — the right length and the right direction. That’s all “setting an amplitude” means.']],
    timesI: [['Tlačidlo „× i“ šípku len <b>otočí o štvrť otáčky</b> (90°) a dĺžku nechá tak. Dve štvrť otáčky = šípka mieri dozadu.',
      'The “× i” button just <b>turns the arrow a quarter turn</b> (90°) and keeps its length. Two quarter turns = the arrow points backwards.']],
    interference: [['K jednej odpovedi vedú <b>dve cesty</b> a každá prinesie svoju šípku. Šípky sa <b>sčítajú za sebou</b> (koniec jednej = začiatok druhej).',
      '<b>Two routes</b> lead to the same answer, and each brings its own arrow. The arrows <b>add up tip to tail</b>.'],
    ['Rovnaký smer → spoja sily (odpoveď je istejšia). Opačný smer → <b>vyrušia sa</b> (odpoveď nemôže padnúť). Presne takto vyhrávajú kvantové počítače: <b>zlé odpovede sa vyrušia, správna sa posilní</b>.',
      'Same direction → they team up (a surer answer). Opposite directions → <b>they cancel</b> (that answer can’t happen). This is exactly how quantum computers win: <b>wrong answers cancel, the right one grows</b>.']],
  },
  2: {
    intro: [['Atómy sa správajú ako <b>maličké magnetky</b>. Pošleme ich cez veľký magnet a pozrieme sa, kam dopadnú.',
      'Atoms behave like <b>tiny magnets</b>. We send them through a big magnet and look where they land.'],
    ['Bežná skúsenosť hovorí: rozmazaný pásik. Skutočnosť: <b>iba dva body — „hore“ alebo „dole“</b>. Táto vlastnosť „vždy jedna z dvoch odpovedí“ je presne <b>qubit</b> (kvantový bit).',
      'Everyday experience says: a smeared stripe. Reality says: <b>only two spots — “up” or “down”</b>. That “always one of two answers” property is exactly a <b>qubit</b> (a quantum bit).']],
    twoSpots: [['Najprv strieľaj v <b>„klasickom“ modeli</b> (ako by to fungovalo podľa bežnej skúsenosti), potom v <b>skutočnosti</b>. Porovnaj: pásik vs. dva body.',
      'First fire in the <b>“classical” model</b> (how it would work by everyday intuition), then in <b>reality</b>. Compare: a stripe vs. two dots.']],
    sequences: [['Filter = <b>položíme otázku a necháme si len jednu odpoveď</b>. Opýtaj sa „hore/dole?“, potom „vľavo/vpravo?“ a znova „hore/dole?“.',
      'A filter = <b>we ask a question and keep only one answer</b>. Ask “up/down?”, then “left/right?”, then “up/down?” again.'],
    ['Prekvapenie: stredná otázka prvú odpoveď <b>zmaže</b>. V kvantovom svete <b>otázka mení to, na čo sa pýtaš</b>.',
      'Surprise: the middle question <b>wipes out</b> the first answer. In the quantum world <b>asking a question changes what you ask about</b>.']],
    predict: [['Naklonený magnet = <b>trochu iná otázka</b>. Čím viac je naklonený, tým viac je odpoveď ako hod mincou (50/50). Najprv tipni, potom strieľaj.',
      'A tilted magnet = <b>a slightly different question</b>. The more it’s tilted, the more the answer becomes a coin toss (50/50). Guess first, then fire.']],
  },
  3: {
    intro: [['Qubit si môžeš predstaviť ako <b>šípku v guli</b>. Severný pól = <b>0</b>, južný pól = <b>1</b>, hocikde inde = <b>prelínanie 0 aj 1</b>.',
      'Picture a qubit as <b>an arrow inside a ball</b>. North pole = <b>0</b>, south pole = <b>1</b>, anywhere else = <b>a blend of 0 and 1</b>.'],
    ['<b>Hradlá</b> (operácie kvantového počítača) túto šípku len <b>otáčajú</b>. Kvantový program = postupnosť otočení.',
      '<b>Gates</b> (the operations of a quantum computer) just <b>turn this arrow</b>. A quantum program = a sequence of turns.']],
    puzzles: [['Každá hádanka: dostaň šípku na cieľ pomocou čo najmenej tlačidiel. <b>X</b> prehodí hore ↔ dole, <b>H</b> prehodí severný pól s bodom na rovníku, <b>Z</b> otočí šípku o pol otáčky okolo zvislej osi.',
      'Each puzzle: get the arrow to the target with as few buttons as possible. <b>X</b> swaps top ↔ bottom, <b>H</b> swaps the north pole with a point on the equator, <b>Z</b> turns the arrow half a turn around the vertical axis.']],
    measure: [['Meranie = opýtať sa qubitu <b>„si 0 alebo 1?“</b>. Šípka na rovníku odpovedá náhodne, 50/50. Šípka potom skočí na pól podľa odpovede.',
      'Measuring = asking the qubit <b>“are you 0 or 1?”</b>. An arrow on the equator answers randomly, 50/50. The arrow then jumps to the pole of the answer.'],
    ['Jeden pokus nepovie skoro nič; <b>sto pokusov ukáže vzorec</b>. Aj skutočné kvantové počítače púšťajú ten istý program mnohokrát.',
      'One try tells you almost nothing; <b>a hundred tries show the pattern</b>. Real quantum computers also run the same program many times.']],
    lab: [['Voľná hra: nasmeruj šípku kamkoľvek, otáčaj ju a meraj v ľubovoľnom smere. <b>Tu sa nedá pokaziť nič.</b>',
      'Free play: point the arrow anywhere, turn it and measure in any direction. <b>Nothing can go wrong here.</b>']],
  },
  4: {
    intro: [['Existujú dva druhy „neviem“: <b>skutočné prelínanie</b>, ktoré ešte vie interferovať (superpozícia), a <b>minca, ktorú už niekto hodil</b>, len ti ju neukázal (zmes).',
      'There are two kinds of “not sure”: <b>a genuine blend</b> that can still interfere (superposition), and <b>a coin someone already tossed</b> but hasn’t shown you (a mixture).'],
    ['Pri jednom meraní vyzerajú rovnako. Rozdiel sa ukáže, keď pred meraním urobíš ďalší krok.',
      'In a single measurement they look the same. The difference shows when you do one more step before measuring.']],
    pure: [['<b>H dvakrát za sebou</b> vráti qubit vždy späť na 0 — dve cesty k odpovedi 1 sa navzájom vyrušia. To je interferencia pri práci.',
      '<b>H twice in a row</b> always brings the qubit back to 0 — the two routes to the answer 1 cancel each other. That’s interference at work.']],
    withMeasure: [['<b>Nakukni v strede</b> a kúzlo zmizne: na konci je zrazu 50/50. Pozretie sa (alebo akýkoľvek únik informácie) interferenciu zničí.',
      '<b>Peek in the middle</b> and the magic is gone: suddenly it’s 50/50 at the end. Looking (or any leak of information) destroys the interference.'],
    ['Stĺpce ρ mimo uhlopriečky sú <b>kontrolky „prelínanie ešte žije“</b>. Sleduj, ako zhasnú.',
      'The ρ bars off the diagonal are <b>“the blend is still alive” indicators</b>. Watch them go dark.']],
    deco: [['Dekoherencia = <b>okolie trochu nakukuje</b>. Viac šumu → menej interferencie. Je to <b>nepriateľ č. 1 skutočných kvantových počítačov</b> — preto ich chladia skoro na absolútnu nulu.',
      'Decoherence = <b>the surroundings peeking a little</b>. More noise → less interference. It is <b>enemy no. 1 of real quantum computers</b> — that’s why they are cooled almost to absolute zero.']],
  },
  5: {
    intro: [['Diracov zápis je len <b>skratka</b>. |ψ⟩ („ket“) = <b>stav</b>, niečo ako podstatné meno. ⟨φ| („bra“) = <b>otázka</b>, ktorú kladieš.',
      'Dirac’s notation is just <b>shorthand</b>. |ψ⟩ (a “ket”) = <b>a state</b>, like a noun. ⟨φ| (a “bra”) = <b>a question</b> you ask.'],
    ['⟨φ|ψ⟩ = <b>odpoveď na otázku</b>: jedno číslo (šípka). Druhá mocnina jej dĺžky = <b>šanca</b>.',
      '⟨φ|ψ⟩ = <b>the answer to the question</b>: a single number (an arrow). Its length squared = <b>the chance</b>.']],
    tasks: [['Skladaj výrazy z dielikov ako z LEGA. Vždy sa opýtaj: je výsledok <b>stav</b>, <b>číslo</b>, alebo <b>stroj, ktorý mení stavy</b>?',
      'Build expressions from tiles like LEGO. Always ask: is the result <b>a state</b>, <b>a number</b>, or <b>a machine that changes states</b>?']],
  },
  6: {
    intro: [['NMR je technika, na ktorej stojí <b>magnetická rezonancia v nemocnici</b> — a aj <b>prvé kvantové počítače</b>.',
      'NMR is the technique behind <b>the MRI scanner in a hospital</b> — and behind <b>the first quantum computers</b>, too.'],
    ['Silný magnet dá každému jadru atómu <b>dve energetické hladiny (= 0 a 1)</b>. Rádiové impulzy správneho tónu ho medzi nimi prepínajú.',
      'A strong magnet gives every atomic nucleus <b>two energy levels (= 0 and 1)</b>. Radio pulses of the right tone switch it between them.']],
    precession: [['V magnete sa šípka <b>krúti ako vĺčik</b>. Z laboratória to vyzerá rušne; z <b>kolotoča, ktorý sa točí s ňou</b> (rotujúci rámec), stojí na mieste.',
      'In the magnet the arrow <b>spins like a top</b>. From the lab it looks busy; from <b>a merry-go-round turning with it</b> (the rotating frame) it stands still.'],
    ['Kým sa krúti, šance na 0 a 1 sa <b>nemenia</b>.', 'While it spins, the chances of 0 and 1 <b>don’t change</b>.']],
    piPulse: [['π-impulz = rádiový impulz presne taký dlhý, aby <b>preklopil 0 na 1</b>. Je to kvantové hradlo <b>NOT</b>.',
      'A π pulse = a radio pulse just long enough to <b>flip 0 into 1</b>. It is the quantum <b>NOT</b> gate.']],
    halfPulse: [['Polovičný impulz zastaví <b>v polovici cesty</b>: 50/50 prelínanie. Takto sa na skutočnom hardvéri vyrába superpozícia.',
      'A pulse half as long stops <b>halfway</b>: a 50/50 blend. That’s how superposition is made on real hardware.']],
    tuning: [['Ako <b>ladenie rádia</b>: zlá frekvencia a preklopenie nefunguje. Nájdi správnu stanicu.',
      'Like <b>tuning a radio</b>: the wrong frequency and the flip doesn’t work. Find the right station.']],
    t2: [['Necháš prelínanie samo a <b>vybledne</b> — jadrá sa rozídu z kroku. T₂ = <b>ako dlho si qubit „pamätá“</b>. Kvantový výpočet musí skončiť skôr.',
      'Leave the blend alone and it <b>fades</b> — the nuclei drift out of step. T₂ = <b>how long the qubit “remembers”</b>. A quantum computation must finish before that.']],
  },
  7: {
    intro: [['Previazanosť: <b>dva qubity zdieľajú jeden spoločný stav</b>. Ich výsledky sú prepojené — napríklad vždy rovnaké — aj keď sú ďaleko od seba.',
      'Entanglement: <b>two qubits share one joint state</b>. Their results are linked — always equal, for example — even when they are far apart.'],
    ['Einstein to nazval „strašidelné“. Bell vymyslel, ako to <b>overiť pokusom</b>.', 'Einstein called it “spooky”. Bell figured out how to <b>test it by experiment</b>.']],
    build: [['Recept: <b>H na prvý qubit</b> (urob z neho 50/50 prelínanie), potom <b>CNOT</b> (preklop druhý, ak je prvý 1). Hotovo — sú previazané.',
      'Recipe: <b>H on the first qubit</b> (make it a 50/50 blend), then <b>CNOT</b> (flip the second one if the first is 1). Done — they’re entangled.']],
    noSignal: [['Bob sám vidí <b>vždy férovú mincu</b>, nech Alica robí čokoľvek. Previazanosťou sa teda <b>nedá posielať správa</b> rýchlejšie ako svetlo — prepojenie uvidia až pri porovnaní poznámok.',
      'Bob on his own always sees <b>a fair coin</b>, whatever Alice does. So entanglement <b>cannot send a message</b> faster than light — the link only shows up when they compare notes.']],
    chsh: [['Hra na spoluprácu: Alica a Bob sa nesmú rozprávať, ale môžu mať previazané páry. Bežnými stratégiami vyhrajú <b>najviac 75 %</b> kôl, s previazanosťou <b>asi 85 %</b>.',
      'A cooperation game: Alice and Bob can’t talk, but they can share entangled pairs. With ordinary strategies they win <b>at most 75 %</b> of rounds, with entanglement <b>about 85 %</b>.'],
    ['Nakláňaj uhly meraní, kým neprekonáš 75 %.', 'Tilt the measurement angles until you beat 75 %.']],
  },
  9: {
    intro: [['Finále! Drak Ketvarr má <b>štít, ktorý je qubit</b> — šípka v guli vpravo. Tvoj meč je <b>meranie</b>: udrieš a buď zasiahneš, alebo nie.',
      'The finale! The dragon Ketvarr has <b>a ward that is a qubit</b> — the arrow in the ball on the right. Your sword is <b>measurement</b>: you strike and either hit or miss.'],
    ['Šanca na zásah je tým väčšia, čím <b>bližšie mieri šípka štítu k zlatej šípke</b>. Bojuje sa na ťahy: ty jedno slovo (otočenie šípky), potom drak jeden ťah, ktorý ti <b>vopred prezradí</b>.',
      'The chance of a hit grows the <b>closer the ward’s arrow points to the golden arrow</b>. It’s turn-based: you say one word (a turn of the arrow), then the dragon makes one move, which he <b>announces in advance</b>.']],
    phase1: [['Čísla na tlačidlách ukazujú <b>šancu na zásah v ďalšom ťahu</b> — už aj s drakovým ťahom. Stačí vyberať to, čo je zelené, a potom udrieť.',
      'The numbers on the buttons show <b>the chance of a hit next turn</b> — already including the dragon’s move. Just pick whatever is green, then strike.']],
    phase2: [['Drak teraz fúka <b>hmlu</b>, ktorá šípku na rovníku skracuje — kratšia šípka = horšia muška. Na póloch hmla neškodí. Nový posuvník θ určuje, o koľko šípku otočíš.',
      'Now the dragon blows <b>fog</b> that shortens the arrow on the equator — a shorter arrow = worse aim. At the poles the fog does no harm. The new slider θ sets how far you turn the arrow.']],
    phase3: [['Zlatá šípka (srdce draka) je naklonená a drak ju presúva. Posuvníkmi θ a φ nastavuj, kým tlačidlo impulzu nezozelenie — potom ho vykríkni a v ďalšom ťahu udri.',
      'The golden arrow (the dragon’s heart) is tilted and the dragon moves it. Adjust the θ and φ sliders until the pulse button turns green — then shout it and strike next turn.']],
  },
  8: {
    intro: [['Žiadne gombíky — tento level je o tom, <b>čo teória znamená</b>. Fyzici sa zhodnú na výpočtoch aj predpovediach, ale dodnes sa hádajú, čo sa „naozaj“ deje.',
      'No more knobs — this level is about <b>what the theory means</b>. Physicists agree on the maths and the predictions but still argue about what is “really” going on.']],
    statues: [['Porozprávaj sa so šiestimi mysliteľmi. Každý to vidí inak a <b>nemusíš vybrať víťaza</b>.',
      'Chat with six thinkers. Each sees it differently, and <b>you don’t have to pick a winner</b>.']],
    sorting: [['Triedenie otázok do troch kôpok: <b>čo existuje?</b> (bytie), <b>čo môžeme vedieť?</b> (poznanie), <b>čo vidíme a zažívame?</b> (skúsenosť).',
      'Sort questions into three piles: <b>what exists?</b> (being), <b>what can we know?</b> (knowing), <b>what do we see and experience?</b> (experience).']],
  },
};
// spoločná kartička pred záverečným kvízom každého levelu
const LAYMAN_FINALE = [['Záverečný kvíz skúša <b>slová, nie počty</b>. Tip: <b>šanca = dĺžka šípky na druhú</b>; šípky sa sčítavajú, šance nie. Pasca býva bežné slovo použité na nesprávnom mieste.',
  'The final quiz tests <b>words, not sums</b>. Tip: <b>chance = arrow length squared</b>; arrows add up, chances don’t. The trap is usually an everyday word used in the wrong place.']];

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
const LAYMAN_RE = tr(LAYMAN_WORDS_SK, LAYMAN_WORDS_EN).map(([stem, plain, tip]) => [new RegExp(`(?<![\\p{L}])(${stem}\\p{L}*)`, 'iu'), plain, tip]);

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
});

// úvod sprievodkyne bežnou rečou (zobrazí sa pri prvom stretnutí v laickej obťažnosti alebo po jej zapnutí)
const LAYMAN_INTRO = tr([
  'Ahoj! Ja som <b>Amplitúda</b>, tvoja sprievodkyňa. Žiadne vzorce netreba — budem hovoriť <b>bežnými slovami</b>.',
  'Obyčajné počítače používajú <b>bity</b>: každý je 0 alebo 1. Kvantové počítače používajú <b>qubity</b>: kým sa na qubit nepozrieš, môže byť <b>prelínaním 0 aj 1</b>.',
  'Ty si <b>Psíčko (ψ)</b> — stav qubitu. Nie si guľôčka, ale <b>recept na šance</b>: hovoríš, aké odpovede dostane ten, kto sa na teba pozrie.',
  'Trik kvantových počítačov: každá možná odpoveď nesie <b>malú šípku</b>. Šípky sa môžu <b>navzájom vyrušiť</b>. Dobrý kvantový program zariadi, aby sa zlé odpovede vyrušili a správna posilnila.',
  Settings.dragon && 'Nad ostrovom krúži <b>Ketvarr, kvantový drak</b>. Každý mentor ťa naučí jedno slovo moci; s ôsmimi ho porazíš na Dračom štíte.',
  'Na ostrove je 8 portálov a za každým mentor. Pred každou úlohou ti ju najprv <b>vysvetlím po ľudsky</b>. Odborné slová majú <b>preklad v zátvorke</b> a po prejdení myšou jednoduchú vysvetlivku.',
  'Ovládanie: <b>WASD</b> pohyb, <b>ťahanie myšou</b> kamera, <b>E</b> vstúpiť/hovoriť, <b>M</b> mapa. Začni portálom <b>1</b>!',
  'Keď sa budeš cítiť istejšie, vpravo hore môžeš kedykoľvek prepnúť na ťažšiu obťažnosť s odbornejším jazykom.',
], [
  'Hi! I am <b>Amplitude</b>, your guide. No formulas needed — I will use <b>everyday words</b>.',
  'Ordinary computers use <b>bits</b>: each is 0 or 1. Quantum computers use <b>qubits</b>: until you look at one, a qubit can be <b>a blend of 0 and 1</b>.',
  'You are <b>Little Psi (ψ)</b> — the state of a qubit. You are not a little ball but <b>a recipe for chances</b>: you say what answers anyone who looks at you will get.',
  'The trick of quantum computers: every possible answer carries <b>a little arrow</b>. Arrows can <b>cancel each other out</b>. A good quantum program makes the wrong answers cancel and the right one grow.',
  Settings.dragon && 'Above the island circles <b>Ketvarr, the quantum dragon</b>. Each mentor teaches you one Word of Power; with all eight you will defeat him on Dragon’s Peak.',
  'There are 8 portals on the island, each with a mentor. Before every task I will first <b>explain it in plain words</b>. Technical words get <b>a translation in brackets</b> and a simple explanation when you hover them.',
  'Controls: <b>WASD</b> move, <b>mouse drag</b> camera, <b>E</b> enter/talk, <b>M</b> map. Start with portal <b>1</b>!',
  'Once you feel more confident, you can switch to a harder difficulty with more technical language at any time (top right).',
]).filter(Boolean);
