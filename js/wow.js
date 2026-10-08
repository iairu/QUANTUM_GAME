'use strict';
// MMO téma — hrá sa ako World of Warcraft, obsah hry ostáva rovnaký.
// Ostrov je otvorený svet: postava s úrovňou, zdravím a koherenciou (manou), lišta kúziel 1 … =,
// nepriatelia „klasické omyly“, úlohy od Amplitúdy, obchodník Planck, taška, peniaze, jazdecké zviera.
// Levely sú inštancie (dungeony): boss = omyl, ktorý porážajú vedomosti — splnené kroky a správne odpovede.
// Mechanika kúziel je kvantová: každý nepriateľ má „štít“ = qubit (Blochov vektor r);
// Bornova čepeľ (meranie) zasiahne s P(|1⟩) = (1 − z)/2, X ho preklopí, H ho pošle na rovník,
// relaxácia T₁ ho ťahá späť na |0⟩.

// ------------------------------------------------------------------
// Dáta: nepriatelia, predmety, kúzla, úlohy, bossovia
// ------------------------------------------------------------------
const MOB_TYPES = {
  hidden: { lvl: [1, 3], col: [0.42, 0.3, 0.55], junk: 'junk_hidden', name: tr('Skrytá premenná', 'Hidden Variable'),
    tip: tr('Omyl: „Výsledok merania bol určený vopred, len ho nepoznáme.“ Bell (1964) ukázal, že žiadne <b>lokálne skryté premenné</b> nevysvetlia kvantové korelácie — experimenty to potvrdili.',
      'Misconception: “The outcome was fixed in advance, we just don’t know it.” Bell (1964) showed that no <b>local hidden variables</b> can reproduce quantum correlations — experiments confirm it.') },
  billiard: { lvl: [3, 5], col: [0.1, 0.1, 0.12], junk: 'junk_billiard', name: tr('Biliardový elektrón', 'Billiard-Ball Electron'),
    tip: tr('Omyl: „Elektrón je malá gulička s presnou dráhou.“ Medzi meraniami nemá kvantový objekt trajektóriu — má <b>stav</b>, ktorý dáva pravdepodobnosti.',
      'Misconception: “An electron is a tiny ball with a definite path.” Between measurements a quantum object has no trajectory — it has a <b>state</b> that gives probabilities.') },
  planet: { lvl: [5, 8], col: [0.85, 0.35, 0.25], junk: 'junk_planet', name: tr('Atóm-planetka', 'Little-Planet Atom'),
    tip: tr('Omyl: „Elektróny obiehajú jadro ako planéty.“ Taký elektrón by vyžiaril energiu a za ~10⁻¹¹ s spadol do jadra. Orbitál je <b>rozdelenie amplitúd</b>, nie dráha.',
      'Misconception: “Electrons orbit the nucleus like planets.” Such an electron would radiate and fall in within ~10⁻¹¹ s. An orbital is an <b>amplitude distribution</b>, not a track.') },
  ftl: { lvl: [8, 11], col: [1, 0.25, 0.2], junk: 'junk_ftl', name: tr('Nadsvetelný signál', 'Faster-than-Light Signal'),
    tip: tr('Omyl: „Previazanosťou sa dá poslať správa rýchlejšie ako svetlo.“ <b>Nemožnosť signalizácie</b>: Bobova lokálna štatistika nezávisí od Alicinej voľby.',
      'Misconception: “Entanglement can send a message faster than light.” <b>No-signalling</b>: Bob’s local statistics never depend on Alice’s choice.') },
  cat: { lvl: [11, 14], col: [0.55, 0.52, 0.5], junk: 'junk_cat', name: tr('Mačka mŕtva-aj-živá', 'Dead-and-Alive Cat'),
    tip: tr('Omyl: „Mačka je naraz mŕtva aj živá.“ Stav dáva <b>pravdepodobnosti</b> výsledkov; meranie dá jeden výsledok. Superpozícia nie je „oboje naraz“.',
      'Misconception: “The cat is dead and alive at once.” The state gives <b>probabilities</b> of outcomes; a measurement gives one. A superposition is not “both at once”.') },
  cultist: { lvl: [14, 17], col: [0.28, 0.1, 0.32], junk: 'junk_cultist', name: tr('Kultista vedomia', 'Consciousness Cultist'),
    tip: tr('Omyl: „Kolaps spôsobuje vedomie pozorovateľa.“ Meranie je <b>fyzikálna interakcia</b> s prístrojom; dekoherencia prebieha aj bez ľudí.',
      'Misconception: “The observer’s consciousness causes the collapse.” A measurement is a <b>physical interaction</b> with an apparatus; decoherence happens with or without people.') },
};
// tábory nepriateľov v sektoroch medzi portálmi (sever ostáva voľný pre cestu k dračiemu štítu)
const MOB_CAMPS = ['hidden', 'billiard', 'planet', 'ftl', 'cat', 'cultist', 'cultist'];

const QCOL = ['#9d9d9d', '#ffffff', '#1eff00', '#0070dd', '#a335ee', '#ff8000']; // šedá, biela, zelená, modrá, fialová, oranžová
const QNAME = tr(['Bezcenné', 'Bežné', 'Nezvyčajné', 'Vzácne', 'Epické', 'Legendárne'], ['Poor', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']);
const SLOT_NAME = { head: tr('Hlava', 'Head'), chest: tr('Hruď', 'Chest'), weapon: tr('Zbraň', 'Weapon'), trinket: tr('Talizman', 'Trinket') };

const ITEMS = {
  pot_hp: { icon: '🧪', q: 1, use: 'hp', buy: 40, sell: 10, name: tr('Liečivá amplitúda', 'Healing Amplitude'),
    text: tr('Použitie: obnoví 45 % zdravia.', 'Use: restores 45% health.'), flavor: tr('Normovaná na jednotku — nikdy neprekypí.', 'Normalised to one — it never overflows.') },
  pot_mana: { icon: '💧', q: 1, use: 'mana', buy: 40, sell: 10, name: tr('Elixír koherencie', 'Coherence Draught'),
    text: tr('Použitie: obnoví 45 % koherencie (many).', 'Use: restores 45% coherence (mana).'), flavor: tr('Vypi skôr, než si ťa všimne okolie.', 'Drink it before the environment notices.') },
  junk_hidden: { icon: '📒', q: 0, sell: 14, name: tr('Zošit skrytých premenných', 'Ledger of Hidden Variables'),
    flavor: tr('Všetky stránky sú prázdne. Bell to vedel.', 'Every page is blank. Bell knew.') },
  junk_billiard: { icon: '🎱', q: 0, sell: 22, name: tr('Otlčená biliardová guľa', 'Chipped Billiard Ball'),
    flavor: tr('Kde bola medzi dvoma meraniami? Otázka bez odpovede.', 'Where was it between two measurements? A question without an answer.') },
  junk_planet: { icon: '🪐', q: 0, sell: 30, name: tr('Ohnutá elektrónová dráha', 'Bent Electron Orbit'),
    flavor: tr('Vraj sa točila 10⁻¹¹ sekundy, potom spadla.', 'Rumour says it spun for 10⁻¹¹ seconds, then fell in.') },
  junk_ftl: { icon: '✉', q: 0, sell: 40, name: tr('Nedoručený nadsvetelný telegram', 'Undelivered FTL Telegram'),
    flavor: tr('Obsah: náhodné bity. Korelácie áno, správa nie.', 'Contents: random bits. Correlations yes, message no.') },
  junk_cat: { icon: '📿', q: 0, sell: 52, name: tr('Polovičný mačací obojok', 'Half a Cat Collar'),
    flavor: tr('Pri otvorení škatule bol obojok celý. Len jeden výsledok.', 'When the box was opened the collar was whole. Just one outcome.') },
  junk_cultist: { icon: '📜', q: 0, sell: 65, name: tr('Leták „Myseľ to skolabuje“', 'Pamphlet: “The Mind Collapses It”'),
    flavor: tr('Detektor kliká aj v prázdnom laboratóriu.', 'The detector clicks in an empty lab too.') },
  robe_sup: { icon: '🥻', q: 2, slot: 'chest', sta: 4, int: 2, buy: 250, sell: 60, robe: [0.45, 0.28, 0.75], name: tr('Rúcho superpozície', 'Robe of Superposition'),
    flavor: tr('Utkané z nití |0⟩ a |1⟩ — s určitou relatívnou fázou.', 'Woven from |0⟩ and |1⟩ threads — with a definite relative phase.') },
  hat_dirac: { icon: '🎩', q: 2, slot: 'head', sta: 2, int: 4, buy: 400, sell: 100, hat: 'top', name: tr('Diracov cylinder', 'Dirac’s Top Hat'),
    flavor: tr('⟨klobúk|hlava⟩ = 1. Sedí dokonale.', '⟨hat|head⟩ = 1. A perfect fit.') },
  wand_euler: { icon: '🪄', q: 2, slot: 'weapon', int: 6, buy: 600, sell: 150, orb: [0.4, 1, 0.5], name: tr('Eulerova palička', 'Euler’s Wand'),
    flavor: tr('Na rukoväti je vyryté e<sup>iπ</sup> + 1 = 0.', 'Engraved along the shaft: e<sup>iπ</sup> + 1 = 0.') },
  ring_planck: { icon: '💍', q: 2, slot: 'trinket', sta: 3, int: 3, buy: 500, sell: 120, name: tr('Planckova pečatná prsteň', 'Planck’s Signet'),
    flavor: tr('Energia prichádza po kvantách. Zľavy tiež.', 'Energy comes in quanta. So do discounts.') },
  mount_bloch: { icon: '🔮', q: 4, mount: true, buy: 10000, sell: 0, name: tr('Opraty Blochovej gule', 'Reins of the Bloch Sphere'),
    text: tr('Použitie: naučí ťa privolať jazdeckú Blochovu guľu (kláves −). +60 % rýchlosť pohybu.', 'Use: teaches you to summon a rideable Bloch sphere (key −). +60% movement speed.'),
    flavor: tr('Povrch = čisté stavy. Ruky prosím držte vnútri gule.', 'Surface = pure states. Please keep your hands inside the sphere.') },
};
const VENDOR_STOCK = ['pot_hp', 'pot_mana', 'robe_sup', 'hat_dirac', 'ring_planck', 'wand_euler', 'mount_bloch'];

// korisť z bossov levelov: kvalita podľa hviezdičiek (★ zelená, ★★ modrá, ★★★ fialová)
const BOSS_LOOT = {
  1: { slot: 'trinket', icon: '🧭', name: tr('Eulerov kompas fázy', 'Euler’s Compass of Phase') },
  2: { slot: 'weapon', icon: '🧲', name: tr('Palica dvoch stôp', 'Staff of the Two Spots') },
  3: { slot: 'head', icon: '🌐', name: tr('Diadém Blochovej gule', 'Circlet of the Bloch Sphere'), hat: 'circlet' },
  4: { slot: 'chest', icon: '🥁', name: tr('Feynmanovo rúcho dráh', 'Feynman’s Robe of Paths'), robe: [0.62, 0.3, 0.9] },
  5: { slot: 'trinket', icon: '📐', name: tr('Diracova dýka †', 'Dirac’s Dagger †') },
  6: { slot: 'weapon', icon: '📻', name: tr('Rezonančná palica π-impulzu', 'Resonant Rod of the π Pulse') },
  7: { slot: 'chest', icon: '🔔', name: tr('Previazané rúcho Bellovo', 'Bell’s Entangled Vestments'), robe: [0.9, 0.35, 0.55] },
  8: { slot: 'head', icon: '☯', name: tr('Bohrova kapucňa komplementarity', 'Bohr’s Hood of Complementarity'), hat: 'hood' },
  9: { slot: 'weapon', icon: '🐉', name: tr('Ketvarrov zub', 'Fang of Ketvarr') },
};
const BOSSES = {
  1: { icon: '➕', name: tr('Sčítač pravdepodobností', 'The Probability Adder'), tip: tr('Sčítava pravdepodobnosti namiesto amplitúd — a interferencia mu uniká.', 'Adds probabilities instead of amplitudes — and so misses interference.') },
  2: { icon: '🌀', name: tr('Golem roztočeného vĺčika', 'Spinning-Top Golem'), tip: tr('Verí, že spin je doslova točiaca sa gulička s ľubovoľnou hodnotou.', 'Believes spin is literally a spinning ball with any value at all.') },
  3: { icon: '👻', name: tr('Fantóm globálnej fázy', 'Phantom of the Global Phase'), tip: tr('Tvrdí, že globálnu fázu sa dá zmerať.', 'Claims the global phase can be measured.') },
  4: { icon: '🎭', name: tr('Podvodník zmesi', 'The Mixture Impostor'), tip: tr('Vydáva zmes za superpozíciu — chýbajú mu koherencie.', 'Passes a mixture off as a superposition — it lacks the coherences.') },
  5: { icon: '👺', name: tr('Škriatok ket-bra', 'The Ket-Bra Gremlin'), tip: tr('Prehadzuje bra a ket a z čísel robí operátory.', 'Swaps bras and kets and turns numbers into operators.') },
  6: { icon: '📡', name: tr('Rozladený prízrak', 'The Detuned Wraith'), tip: tr('Vysiela mimo rezonancie a čuduje sa, že spin sa nepreklopí.', 'Transmits off resonance and wonders why the spin won’t flip.') },
  7: { icon: '📨', name: tr('Strašidelný posol', 'The Spooky Courier'), tip: tr('Chce previazanosťou posielať správy rýchlejšie ako svetlo.', 'Wants to send messages faster than light through entanglement.') },
  8: { icon: '🕯', name: tr('Veľkňaz kolapsu mysľou', 'High Priest of Mind-Collapse'), tip: tr('Káže, že svet skolabuje, až keď sa naň niekto pozrie.', 'Preaches that the world collapses only when someone looks.') },
  9: { icon: '🐉', name: 'Ketvarr', tip: tr('Kvantový drak. Jeho štít je qubit.', 'The quantum dragon. His ward is a qubit.') },
};

// kúzla: id, kláves, ikona, úroveň, čas zosielania, mana, dosah, cooldown, poškodenie
const SPELLS = [
  { id: 'bolt', key: 'Digit1', label: '1', icon: 'φ', lvl: 1, cast: 1.6, mana: 10, range: 30, dmg: [16, 22], sp: 0.9, col: [0.4, 0.9, 1],
    name: tr('Fázový šíp', 'Phase Bolt'), text: tr('Vystrelí zväzok komplexnej amplitúdy. Spoľahlivé poškodenie — nemení štít (qubit) cieľa.', 'Fires a bundle of complex amplitude. Reliable damage — it does not change the target’s ward (qubit).') },
  { id: 'flip', key: 'Digit2', label: '2', icon: 'X', lvl: 1, mana: 8, range: 30, cd: 4, dmg: [6, 9], sp: 0.3, col: [1, 0.35, 0.35],
    name: tr('Pauliho preklopenie', 'Pauli Flip'), text: tr('Hradlo X: otočí štít cieľa o 180° okolo osi x — |0⟩ ↔ |1⟩. Pripraví ho na Bornovu čepeľ.', 'The X gate: turns the target’s ward 180° about the x axis — |0⟩ ↔ |1⟩. Sets it up for Born’s Blade.') },
  { id: 'had', key: 'Digit3', label: '3', icon: 'H', lvl: 2, mana: 8, range: 30, dmg: [4, 6], sp: 0.3, col: [0.4, 1, 0.5],
    name: tr('Hadamardov úder', 'Hadamard Strike'), text: tr('Hradlo H: |0⟩ → |+⟩ (rovník). Potom P(|1⟩) = 50 % — superpozícia nie je „polovičný zásah“, ale lotéria.', 'The H gate: |0⟩ → |+⟩ (the equator). Then P(|1⟩) = 50% — a superposition is not a “half hit”, it is a lottery.') },
  { id: 'measure', key: 'Digit4', label: '4', icon: '⚔', lvl: 3, mana: 14, range: 30, cd: 5, dmg: [50, 64], sp: 1.6, col: [1, 0.85, 0.3],
    name: tr('Bornova čepeľ', 'Born’s Blade'), text: tr('Meranie v Z-báze. Zasiahne s pravdepodobnosťou <b>P(|1⟩) = (1 − z)/2</b> a veľmi bolí; inak štít skolabuje na |0⟩ a čepeľ minie. Po meraní je štít v jednom z výsledkov.', 'A measurement in the Z basis. Hits with probability <b>P(|1⟩) = (1 − z)/2</b> and hurts a lot; otherwise the ward collapses onto |0⟩ and the blade misses. After the measurement the ward is in one of the outcomes.') },
  { id: 'heal', key: 'Digit5', label: '5', icon: '✚', lvl: 4, cast: 2, mana: 22, self: true, col: [0.4, 1, 0.6],
    name: tr('Kvantová korekcia chýb', 'Quantum Error Correction'), text: tr('Obnoví 40 % zdravia. Chyby sa opravia bez toho, aby sa zmeral samotný stav.', 'Restores 40% health. Errors are fixed without measuring the state itself.') },
  { id: 'nova', key: 'Digit6', label: '6', icon: 'ρ', lvl: 6, mana: 25, cd: 12, aoe: 7, dmg: [14, 20], sp: 0.5, col: [0.75, 0.5, 1],
    name: tr('Dekoherenčná vlna', 'Decoherence Nova'), text: tr('Zasiahne všetkých nepriateľov do 7 m a zmrští ich Blochove vektory: zmiešaný stav má P(|1⟩) ≈ 50 %.', 'Hits every enemy within 7 m and shrinks their Bloch vectors: a mixed state has P(|1⟩) ≈ 50%.') },
  { id: 'blink', key: 'Digit7', label: '7', icon: '⇝', lvl: 8, mana: 12, cd: 15, self: true, col: [0.7, 0.5, 1],
    name: tr('Tunelovanie', 'Quantum Tunnelling'), text: tr('Presunie ťa 9 m dopredu. Amplitúda za bariérou nie je nulová.', 'Moves you 9 m forward. The amplitude beyond a barrier is not zero.') },
  { id: 'pot_hp', key: 'Digit8', label: '8', item: 'pot_hp' },
  { id: 'pot_mana', key: 'Digit9', label: '9', item: 'pot_mana' },
  { id: 'shoot', key: 'Digit0', label: '0', icon: 'ψ', lvl: 1, range: 25, col: [1, 0.85, 0.4],
    name: tr('Strela ψ (automatický útok)', 'ψ Shot (auto attack)'), text: tr('Zapne/vypne automatické strieľanie palicou na cieľ každé 2 s. Pravý klik na nepriateľa ho zapne tiež.', 'Toggles automatic shots from your staff at the target every 2 s. Right-clicking an enemy turns it on too.') },
  { id: 'mount', key: 'Minus', label: '−', icon: '🔮', lvl: 1, cast: 1.5, needMount: true,
    name: tr('Blochova guľa (jazda)', 'Bloch Sphere (mount)'), text: tr('Nasadni / zosadni. +60 % rýchlosť. Kúpiš u Plancka.', 'Mount / dismount. +60% speed. Sold by Planck.') },
  { id: 'hearth', key: 'Equal', label: '=', icon: '🏠', lvl: 1, cast: 3, cd: 30,
    name: tr('Návrat k Amplitúde', 'Return to Amplitude'), text: tr('Po 3 s ťa prenesie k Amplitúde do stredu ostrova (z levelu späť na ostrov).', 'After 3 s takes you to Amplitude in the middle of the island (from a level back to the island).') },
];
const GCD = 1.2;

// úlohy od Amplitúdy: zneškodni omyly (vždy jedna aktívna)
const QUESTS = [
  { mob: 'hidden', n: 5, c: 90, items: [['pot_hp', 3]], title: tr('Nič nie je skryté', 'Nothing Is Hidden'),
    offer: tr(['Na lúkach za portálmi sa premávajú <b>Skryté premenné</b>. Šepkajú, že výsledok merania bol daný vopred.', 'Bell dokázal, že žiadne lokálne skryté premenné nevysvetlia kvantové korelácie. Zneškodni ich <b>5</b> — a vráť sa ku mne.'],
      ['The meadows beyond the portals are crawling with <b>Hidden Variables</b>. They whisper that the outcome was fixed in advance.', 'Bell proved that no local hidden variables can explain quantum correlations. Debunk <b>5</b> of them — and come back to me.']),
    done: tr('Výborne. Pamätaj: kvantové pravdepodobnosti nie sú len naša nevedomosť.', 'Well done. Remember: quantum probabilities are not just our ignorance.') },
  { mob: 'billiard', n: 6, c: 160, items: [['pot_mana', 3]], title: tr('Guľky bez dráhy', 'Balls Without a Path'),
    offer: tr(['Biliardové elektróny sa kotúľajú po ostrove, akoby mali presnú dráhu.', 'Medzi meraniami kvantový objekt žiadnu trajektóriu nemá. Rozbi ich <b>6</b>.'],
      ['Billiard-Ball Electrons roll around the island as if they had a definite path.', 'Between measurements a quantum object has no trajectory. Break <b>6</b> of them.']),
    done: tr('Dráha je obraz z klasickej fyziky. Ty máš lepší: stav a amplitúdy.', 'A path is a picture from classical physics. You have a better one: the state and its amplitudes.') },
  { mob: 'planet', n: 4, c: 260, items: [['pot_hp', 3], ['pot_mana', 2]], title: tr('Pád planetiek', 'The Fall of the Little Planets'),
    offer: tr(['Atómy-planetky tvrdia, že elektróny obiehajú jadro ako planéty Slnko.', 'Taký elektrón by žiaril a do jadra by spadol za stotinu miliardtiny sekundy. Zhoď ich <b>4</b>.'],
      ['The Little-Planet Atoms claim electrons orbit the nucleus like planets around the Sun.', 'Such an electron would radiate and fall into the nucleus within a hundredth of a billionth of a second. Bring down <b>4</b>.']),
    done: tr('Orbitál nie je dráha, ale rozloženie amplitúd. Presne tak.', 'An orbital is not a path but a distribution of amplitudes. Exactly.') },
  { mob: 'ftl', n: 4, c: 400, items: [['pot_hp', 4]], title: tr('Žiadne správy cez previazanosť', 'No Messages Through Entanglement'),
    offer: tr(['Nadsvetelné signály lietajú nad mostom a sľubujú správy rýchlejšie ako svetlo.', 'Previazanosť dáva korelácie, nie správy — Bobova štatistika nezávisí od Alicinej voľby. Zachyť <b>4</b>.'],
      ['Faster-than-Light Signals fly over the bridge, promising messages faster than light.', 'Entanglement gives correlations, not messages — Bob’s statistics don’t depend on Alice’s choice. Intercept <b>4</b>.']),
    done: tr('Nemožnosť signalizácie drží. Relativita si vydýchla.', 'No-signalling holds. Relativity breathes a sigh of relief.') },
  { mob: 'cat', n: 4, c: 600, items: [['pot_hp', 4], ['pot_mana', 4]], title: tr('Otvor škatuľu', 'Open the Box'),
    offer: tr(['Mačky „mŕtve aj živé“ strašia po okraji ostrova.', 'Superpozícia nie je „oboje naraz“ — stav dáva pravdepodobnosti a meranie jeden výsledok. Upokoj <b>4</b>.'],
      ['“Dead-and-alive” cats haunt the edge of the island.', 'A superposition is not “both at once” — the state gives probabilities, a measurement one outcome. Calm <b>4</b>.']),
    done: tr('Schrödinger by bol spokojný. Jeho mačka bola kritika, nie návod.', 'Schrödinger would be pleased. His cat was a critique, not a recipe.') },
  { mob: 'cultist', n: 5, c: 900, items: [['pot_hp', 5], ['pot_mana', 5]], title: tr('Detektor nepotrebuje dušu', 'A Detector Needs No Soul'),
    offer: tr(['Kultisti vedomia kážu, že svet skolabuje, až keď sa naň niekto pozrie.', 'Meranie je fyzikálna interakcia; dekoherencia beží aj v prázdnom laboratóriu. Rozožeň <b>5</b>.'],
      ['The Consciousness Cultists preach that the world collapses only when someone looks.', 'A measurement is a physical interaction; decoherence runs even in an empty lab. Disperse <b>5</b>.']),
    done: tr('Ostrov je čistý od omylov. Si skutočný kvantový mág.', 'The island is clean of misconceptions. You are a true quantum mage.') },
];

const DIFF_DMG = () => byDiff(0.7, 1, 1.25); // nepriatelia v ľahkej/laickej obťažnosti udierajú slabšie
const xpNeed = (L) => 60 + 50 * L;
const MAX_LVL = 20;
const VENDOR_POS = [-5.6, 0, 4.6];
const fmtMoney = (c) => {
  c = Math.max(0, Math.round(c));
  const g = Math.floor(c / 10000), s = Math.floor(c / 100) % 100, k = c % 100, out = [];
  if (g) out.push(`${g}<i class="coin g"></i>`);
  if (s || g) out.push(`${s}<i class="coin s"></i>`);
  out.push(`${k}<i class="coin c"></i>`);
  return `<span class="money">${out.join(' ')}</span>`;
};
const rr = (a, b) => a + rand() * (b - a);

// ------------------------------------------------------------------
// Herný systém
// ------------------------------------------------------------------
const Wow = {
  mobs: [], proj: [], fct: [], fx: [], fctId: 0,
  target: null, cast: null, gcd: 0, cd: {}, auto: false, autoT: 0, combatT: 99,
  dead: false, inst: null, vendorOpen: false, mounted: false,

  // ---------- stav postavy (ukladá sa v Game.progress.wow) ----------
  get S() {
    let s = Game.progress.wow;
    if (!s) s = Game.progress.wow = { lvl: 1, xp: 0, hp: null, mana: null, money: 0, bags: [['pot_hp', 2]], equip: {}, q: { i: 0, k: 0, on: false }, mount: false, loot: {} };
    return s;
  },
  stat(k) { return Object.values(this.S.equip).reduce((a, id) => a + ((this.item(id) || {})[k] || 0), 0); },
  get maxHp() { return 90 + this.S.lvl * 15 + this.stat('sta') * 8; },
  get maxMana() { return 80 + this.S.lvl * 12 + this.stat('int') * 6; },
  get sp() { return this.S.lvl * 1.2 + this.stat('int') * 1.5; },
  item(id) { return ITEMS[id] || (id && id.startsWith('boss') ? this.bossItem(id) : null); },
  // predmet z bossa: id = boss<num>_<hviezdičky>
  bossItem(id) {
    const [, n, st] = id.match(/^boss(\d)_(\d)$/) || [];
    const B = BOSS_LOOT[n];
    if (!B) return null;
    const k = +st, base = 2 + +n * 1.6;
    return { icon: B.icon, q: 1 + k, slot: B.slot, name: B.name, robe: B.robe, hat: B.hat, orb: B.slot === 'weapon' ? [[0.4, 1, 0.4], [0.3, 0.6, 1], [0.8, 0.45, 1]][k - 1] : null,
      int: Math.round(base * (0.8 + 0.4 * k)), sta: Math.round(base * (0.5 + 0.35 * k)), sell: 50 * +n * k,
      flavor: tr(`Korisť: ${BOSSES[n].name} (level ${n}).`, `Dropped by ${BOSSES[n].name} (level ${n}).`) };
  },

  init() {
    if (!Settings.wow) return;
    const s = this.S;
    if (s.hp == null) s.hp = this.maxHp;
    if (s.mana == null) s.mana = this.maxMana;
    this.spawnMobs();
    this.buildUi();
  },

  spawnMobs() {
    // vnútorný kruh (bližšie k stredu): len slabé omyly pre nováčikov; vonkajší okraj ostrova: postup úrovní
    // okolo ostrova po smere portálov. Kruhová cesta (r = 20) ostáva mimo dosahu ich pozornosti.
    this.mobs = [];
    MOB_CAMPS.forEach((type, i) => {
      const a = -Math.PI / 2 + ((i + 1) / 8) * Math.PI * 2;
      for (const [rad, t, cnt, spread] of [[12.5, i % 2 ? 'billiard' : 'hidden', 2, 0.18], [29.5, type, 4, 0.08]]) {
        const T = MOB_TYPES[t];
        for (let k = 0; k < cnt; k++) {
          const aa = a + (k - (cnt - 1) / 2) * spread, rr2 = rad + (k % 2 ? 1 : -0.5);
          const home = [Math.cos(aa) * rr2, 0, Math.sin(aa) * rr2];
          const lvl = rad < 20 ? T.lvl[0] + (k % 2) : T.lvl[0] + Math.floor(rand() * (T.lvl[1] - T.lvl[0] + 1));
          this.mobs.push(this.newMob(t, lvl, home));
        }
      }
    });
  },
  newMob(type, lvl, home) {
    const max = Math.round(45 + 22 * lvl);
    return { type, lvl, home, p: [...home], hp: max, max, r: [0, 0, 1], state: 'idle', t: rand() * 3, atk: 0, face: rand() * 6, walk: 0, wander: null, flash: 0, deadT: 0, id: Math.random() };
  },

  // ---------- pomocné ----------
  pl() { return Hub.player; },
  dist(a, b) { return Math.hypot(a[0] - b[0], a[2] - b[2]); },
  inHub() { return !Game.scene || Game.scene === Hub; },
  con(lvl) { // farba obťažnosti nepriateľa ako v MMO
    const d = lvl - this.S.lvl;
    return d >= 5 ? '#ff2020' : d >= 3 ? '#ff8040' : d >= -2 ? '#ffff00' : d >= -4 ? '#40c040' : '#9d9d9d';
  },
  safe(p) { // stred ostrova a podstavce portálov sú bezpečné (nepriatelia tam nevstúpia)
    return V3.len([p[0], 0, p[2]]) < 7.5 || Hub.portals.some((pt) => this.dist(pt.p, p) < 5.5);
  },
  err(msg) {
    const e = this.ui.err;
    e.innerHTML = msg; e.classList.remove('show'); void e.offsetWidth; e.classList.add('show');
    Sound.sfx('bad');
  },
  feed(html) {
    const d = el('div', null, html);
    this.ui.feed.appendChild(d);
    while (this.ui.feed.children.length > 6) this.ui.feed.firstChild.remove();
    setTimeout(() => d.classList.add('out'), 5000);
    setTimeout(() => d.remove(), 6000);
  },
  itemLink(id, n = 1) { const it = this.item(id); return `<span style="color:${QCOL[it.q]}">[${it.name}]</span>${n > 1 ? '×' + n : ''}`; },
  addFct(p, text, cls) { this.fct.push({ p: [...p], text, cls, t: 0, k: this.fctId++ % 40, dx: rr(-0.5, 0.5) }); },

  // ---------- skúsenosti, peniaze, predmety ----------
  gainXp(x, why) {
    const s = this.S;
    if (s.lvl >= MAX_LVL || x <= 0) return;
    x = Math.round(x); s.xp += x;
    this.feed(`<span class="xpt">+${x} XP</span>${why ? ' · ' + why : ''}`);
    while (s.lvl < MAX_LVL && s.xp >= xpNeed(s.lvl)) {
      s.xp -= xpNeed(s.lvl); s.lvl++;
      s.hp = this.maxHp; s.mana = this.maxMana;
      Sound.sfx('levelup');
      this.banner(tr(`Úroveň ${s.lvl}!`, `Level ${s.lvl}!`), 'ding');
      this.fx.push({ kind: 'ding', t: 0 });
      const learn = SPELLS.filter((sp) => sp.lvl === s.lvl && !sp.item);
      UI.toast(tr(`⬆ Dosiahol(a) si <b>úroveň ${s.lvl}</b>! Zdravie a koherencia rastú.`, `⬆ You reached <b>level ${s.lvl}</b>! Health and coherence increase.`)
        + learn.map((sp) => `<br>✨ ${tr('Nové kúzlo', 'New spell')}: <b>${sp.name}</b> (${sp.label})`).join(''), 4200);
    }
    if (s.lvl >= MAX_LVL) s.xp = 0;
    Game.save();
  },
  money(c, why) {
    this.S.money += c;
    if (c > 0) { Sound.sfx('coin'); this.feed(`${tr('Získavaš', 'You receive')} ${fmtMoney(c)}${why ? ' · ' + why : ''}`); }
  },
  addItem(id, n = 1, quiet) {
    const b = this.S.bags, it = this.item(id);
    if (!it) return false;
    const stack = it.slot || it.mount ? 1 : 20; // výstroj sa neukladá na kôpku, elixíry a haraburdie áno
    let left = n;
    for (const slot of b) if (slot[0] === id && slot[1] < stack && left) { const k = Math.min(left, stack - slot[1]); slot[1] += k; left -= k; }
    while (left > 0) {
      if (b.length >= 16) { this.err(tr('Taška je plná.', 'Your bags are full.')); return false; }
      const k = Math.min(left, stack); b.push([id, k]); left -= k;
    }
    if (!quiet) { Sound.sfx('loot'); this.feed(`${tr('Korisť', 'You receive loot')}: ${this.itemLink(id, n)}`); }
    this.renderBags();
    return true;
  },
  count(id) { return this.S.bags.filter((x) => x[0] === id).reduce((a, x) => a + x[1], 0); },
  takeItem(id, n = 1) {
    const b = this.S.bags;
    for (let i = b.length - 1; i >= 0 && n > 0; i--) if (b[i][0] === id) { const k = Math.min(n, b[i][1]); b[i][1] -= k; n -= k; if (!b[i][1]) b.splice(i, 1); }
    this.renderBags();
  },
  useItem(id) {
    const it = this.item(id), s = this.S;
    if (!it) return;
    if (it.use) {
      if (!this.count(id)) return this.err(tr('Nemáš ' + it.name + '.', 'You have no ' + it.name + '.'));
      if ((this.cd.potion || 0) > 0) return this.err(tr('Elixír ešte nie je pripravený.', 'Potion is not ready yet.'));
      this.takeItem(id); this.cd.potion = 30;
      if (it.use === 'hp') { const h = Math.round(this.maxHp * 0.45); s.hp = Math.min(this.maxHp, s.hp + h); this.playerFct(`+${h}`, 'heal'); }
      else { const m = Math.round(this.maxMana * 0.45); s.mana = Math.min(this.maxMana, s.mana + m); this.playerFct(`+${m}`, 'mana'); }
      Sound.sfx('heal');
      return;
    }
    if (it.mount) {
      this.takeItem(id); s.mount = true;
      UI.toast(tr('🔮 Naučil(a) si sa privolať <b>Blochovu guľu</b> — kláves <b>−</b>.', '🔮 You learned to summon the <b>Bloch Sphere</b> — key <b>−</b>.'), 3800);
      Sound.sfx('levelup'); this.renderBar(true); return;
    }
    if (it.slot) this.equip(id);
  },
  equip(id) {
    const it = this.item(id), s = this.S, old = s.equip[it.slot];
    const hpF = s.hp / this.maxHp, mF = s.mana / this.maxMana;
    this.takeItem(id);
    s.equip[it.slot] = id;
    if (old) this.addItem(old, 1, true);
    s.hp = Math.round(hpF * this.maxHp); s.mana = Math.round(mF * this.maxMana);
    Sound.sfx('equip');
    this.renderBags(); Game.save();
  },
  unequip(slot) {
    const s = this.S, id = s.equip[slot];
    if (!id) return;
    if (s.bags.length >= 16) return this.err(tr('Taška je plná.', 'Your bags are full.'));
    delete s.equip[slot];
    this.addItem(id, 1, true);
    s.hp = Math.min(s.hp, this.maxHp); s.mana = Math.min(s.mana, this.maxMana);
    Sound.sfx('equip');
    this.renderBags(); Game.save();
  },
  sell(i) {
    const [id, n] = this.S.bags[i], it = this.item(id);
    if (!it.sell) return this.err(tr('Tento predmet obchodník nekúpi.', 'The merchant won’t buy that.'));
    this.S.bags.splice(i, 1);
    this.money(it.sell * n, tr('predaj', 'sold') + ' ' + this.itemLink(id, n));
    this.renderBags(); this.renderVendor(); Game.save();
  },
  sellJunk() {
    let sum = 0;
    this.S.bags = this.S.bags.filter(([id, n]) => { const it = this.item(id); if (it.q === 0) { sum += it.sell * n; return false; } return true; });
    if (sum) this.money(sum, tr('predaj haraburdia', 'sold junk')); else this.err(tr('Nemáš žiadne haraburdie.', 'You have no junk.'));
    this.renderBags(); this.renderVendor(); Game.save();
  },
  buy(id) {
    const it = this.item(id);
    if (it.mount && (this.S.mount || this.count(id))) return this.err(tr('Toto už máš.', 'You already know that.'));
    if (this.S.money < it.buy) return this.err(tr('Nemáš dosť peňazí.', 'You don’t have enough money.'));
    if (this.addItem(id, 1, true)) { this.S.money -= it.buy; Sound.sfx('coin'); this.feed(`${tr('Kúpené', 'Bought')}: ${this.itemLink(id)}`); }
    this.renderVendor(); Game.save();
  },
  tipItem(id, extra = '') {
    const it = this.item(id);
    if (!it) return '';
    const st = [it.int && `+${it.int} ${tr('Intelekt', 'Intellect')}`, it.sta && `+${it.sta} ${tr('Výdrž', 'Stamina')}`].filter(Boolean);
    return `<div class="itip"><b style="color:${QCOL[it.q]}">${it.name}</b>`
      + (it.slot ? `<div>${SLOT_NAME[it.slot]}<span class="r">${QNAME[it.q]}</span></div>` : '')
      + st.map((x) => `<div>${x}</div>`).join('')
      + (it.slot ? `<div class="g">${tr('Intelekt: viac many a sily kúziel · Výdrž: viac zdravia', 'Intellect: more mana and spell power · Stamina: more health')}</div>` : '')
      + (it.text ? `<div class="g">${it.text}</div>` : '')
      + (it.flavor ? `<div class="fl">„${it.flavor}“</div>` : '')
      + (it.sell ? `<div>${tr('Predajná cena', 'Sell price')}: ${fmtMoney(it.sell)}</div>` : '')
      + extra + '</div>';
  },

  // ---------- kúzla ----------
  spellState(sp) { // dôvod, prečo sa kúzlo nedá použiť (alebo null)
    const s = this.S;
    if (sp.item) return this.count(sp.item) ? null : 'none';
    if (sp.lvl > s.lvl) return 'lvl';
    if (sp.needMount && !s.mount) return 'lvl';
    if (!this.inHub() && sp.id !== 'hearth') return 'inst';
    if ((sp.mana || 0) > s.mana) return 'oom';
    if (!sp.self && sp.range && !sp.aoe && sp.id !== 'shoot' && this.target && this.dist(this.pl().p, this.target.p) > sp.range) return 'range';
    return null;
  },
  press(sp) {
    if (this.dead) return this.err(tr('Si mŕtvy(a).', 'You are dead.'));
    if (sp.item) return this.useItem(sp.item);
    const s = this.S, st = this.spellState(sp);
    if (st === 'lvl') return this.err(sp.needMount ? tr('Najprv si kúp Blochovu guľu u Plancka.', 'Buy the Bloch Sphere from Planck first.') : tr(`Toto kúzlo sa naučíš na úrovni ${sp.lvl}.`, `You learn this spell at level ${sp.lvl}.`));
    if (st === 'inst') return this.err(tr('Tu sa bojuje vedomosťami — kúzla fungujú na ostrove.', 'Here you fight with knowledge — spells work on the island.'));
    if (sp.id === 'shoot') {
      if (!this.hostile()) return this.err(tr('Nemáš cieľ.', 'You have no target.'));
      this.auto = !this.auto; this.autoT = Math.min(this.autoT, 0.3); return;
    }
    if (st === 'oom') return this.err(tr('Nedostatok koherencie.', 'Not enough coherence.'));
    if (this.cast) return this.err(tr('Už zosielaš iné kúzlo.', 'You are already casting.'));
    if ((this.cd[sp.id] || 0) > 0) return this.err(tr('Kúzlo ešte nie je pripravené.', 'That spell isn’t ready yet.'));
    if (sp.id !== 'hearth' && sp.id !== 'mount' && this.gcd > 0) return;
    if (!sp.self && !sp.aoe && sp.range && sp.id !== 'hearth' && sp.id !== 'mount') {
      if (!this.hostile()) return this.err(tr('Nemáš cieľ.', 'You have no target.'));
      if (st === 'range') return this.err(tr('Cieľ je príliš ďaleko.', 'Out of range.'));
    }
    if (sp.cast && this.moving) return this.err(tr('Počas pohybu sa to nedá.', 'You can’t do that while moving.'));
    if (this.mounted && sp.id !== 'mount') this.mounted = false; // kúzlenie zosadí z gule
    if (this.target && !sp.self) this.face(this.target.p);
    if (sp.id !== 'hearth' && sp.id !== 'mount') this.gcd = GCD;
    if (sp.cast) { this.cast = { sp, t: 0, target: this.target }; Sound.sfx('cast'); return; }
    this.fire(sp, this.target);
  },
  hostile() { return this.target && this.target.state !== 'dead' && this.target.hp > 0 && !this.target.npc ? this.target : null; },
  face(p) { const pl = this.pl(); pl.heading = Math.atan2(p[0] - pl.p[0], p[2] - pl.p[2]); },
  fire(sp, tg) {
    const s = this.S, pl = this.pl();
    s.mana -= sp.mana || 0;
    if (sp.cd) this.cd[sp.id] = sp.cd;
    this.combatT = Math.min(this.combatT, sp.self ? this.combatT : 0);
    const orb = this.orbPos || V3.add(pl.p, [0, 1.9, 0]);
    switch (sp.id) {
      case 'heal': { const h = Math.round(this.maxHp * 0.4 + this.sp); s.hp = Math.min(this.maxHp, s.hp + h); this.playerFct(`+${h}`, 'heal'); this.fx.push({ kind: 'heal', t: 0 }); Sound.sfx('heal'); break; }
      case 'blink': {
        const from = [...pl.p], f = [Math.sin(pl.heading), 0, Math.cos(pl.heading)];
        let np = V3.add(pl.p, V3.scale(f, 9));
        if (V3.len(np) > 33) np = V3.scale(V3.norm(np), 33);
        pl.p = np; this.fx.push({ kind: 'blink', t: 0, a: from, b: np }); Sound.sfx('blink'); break;
      }
      case 'nova': {
        this.fx.push({ kind: 'nova', t: 0, p: [...pl.p] }); Sound.sfx('nova');
        for (const m of this.mobs) if (m.state !== 'dead' && this.dist(m.p, pl.p) < sp.aoe) { m.r = V3.scale(m.r, 0.15); this.hurt(m, this.roll(sp), sp); }
        break;
      }
      case 'measure': {
        if (!tg) return;
        const P1 = clamp((1 - tg.r[2]) / 2, 0, 1), hit = rand() < P1;
        this.fx.push({ kind: 'slash', t: 0, m: tg, hit });
        if (hit) { tg.r = [0, 0, -1]; this.hurt(tg, Math.round(this.roll(sp)), sp, true); Sound.sfx('clang'); }
        else { tg.r = [0, 0, 1]; this.addFct(V3.add(tg.p, [0, 2.2, 0]), tr('Kolaps na |0⟩', 'Collapsed to |0⟩'), 'miss'); Sound.sfx('whiff'); this.aggro(tg); }
        this.feed(`⚔ ${sp.name}: P(|1⟩) = ${Fmt.pct(P1)} → ${hit ? tr('<b>zásah</b>', '<b>hit</b>') : tr('vedľa', 'miss')}`);
        break;
      }
      case 'mount': this.mounted = !this.mounted; Sound.sfx('portal'); break;
      case 'hearth': if (this.inHub()) { pl.p = [0, 0, 3.4]; pl.heading = 0; Hub.cam.yaw = Math.PI; Sound.sfx('portal'); } else Game.backToHub(); break;
      default: // projektily: fázový šíp, X, H, strela ψ
        if (!tg) return;
        this.proj.push({ p: [...orb], m: tg, sp, col: sp.col });
        Sound.sfx(sp.id === 'shoot' ? 'shot' : 'bolt');
    }
  },
  roll(sp) { return Math.round(rr(sp.dmg[0], sp.dmg[1]) + this.sp * (sp.sp || 0)); },
  impact(pr) {
    const m = pr.m, sp = pr.sp;
    if (m.state === 'dead') return;
    if (sp.id === 'flip') m.r = [m.r[0], -m.r[1], -m.r[2]];
    if (sp.id === 'had') m.r = [m.r[2], -m.r[1], m.r[0]];
    const d = sp.id === 'shoot' ? Math.round(rr(5, 8) + this.sp * 0.35) : this.roll(sp);
    this.hurt(m, d, sp);
    if (sp.id === 'flip' || sp.id === 'had') this.addFct(V3.add(m.p, [0, 2.6, 0]), sp.id === 'flip' ? '|0⟩ ↔ |1⟩' : '→ |+⟩', 'gate');
    Sound.sfx('hit');
  },
  aggro(m) { if (m.state === 'idle') { m.state = 'chase'; m.atk = 0.8; Sound.sfx('aggro'); } },
  hurt(m, d, sp, crit) {
    if (m.state === 'dead') return;
    if (m.state === 'evade') { this.addFct(V3.add(m.p, [0, 2, 0]), tr('Unikol', 'Evade'), 'miss'); return; }
    m.hp -= d; m.flash = 0.15; this.combatT = 0;
    this.addFct(V3.add(m.p, [0, 2, 0]), crit ? `${d}!` : `${d}`, crit ? 'crit' : 'dmg');
    this.aggro(m);
    if (!this.target) this.target = m;
    if (m.hp <= 0) this.kill(m);
  },
  kill(m) {
    const T = MOB_TYPES[m.type], s = this.S;
    m.hp = 0; m.state = 'dead'; m.deadT = 0;
    if (this.target === m) this.auto = false;
    const d = m.lvl - s.lvl, gray = d <= -5;
    this.gainXp(gray ? 0 : (12 + 6 * m.lvl) * clamp(1 + 0.1 * d, 0.4, 1.5), T.name);
    this.money(Math.round(rr(4, 11) * m.lvl));
    if (rand() < 0.6) this.addItem(T.junk);
    if (rand() < 0.08) this.addItem(rand() < 0.5 ? 'pot_hp' : 'pot_mana');
    const q = QUESTS[s.q.i];
    if (q && s.q.on && q.mob === m.type && s.q.k < q.n) {
      s.q.k++;
      this.feed(`<span class="qp">${q.title}: ${T.name} ${s.q.k}/${q.n}</span>`);
      if (s.q.k >= q.n) { Sound.sfx('good'); UI.toast(tr(`✔ Úloha splnená: <b>${q.title}</b> — vráť sa k Amplitúde.`, `✔ Quest complete: <b>${q.title}</b> — return to Amplitude.`), 3600); }
    }
    Game.save();
  },
  playerFct(text, cls) { this.addFct(V3.add(this.pl().p, [0, 2.5, 0]), text, cls); },
  hitPlayer(d, src) {
    const s = this.S;
    if (this.dead) return;
    d = Math.max(1, Math.round(d));
    s.hp -= d; this.combatT = 0; this.ui.pf.classList.add('hit'); setTimeout(() => this.ui.pf.classList.remove('hit'), 160);
    if (this.inHub()) this.playerFct(`−${d}`, 'hurt');
    if (this.cast && this.cast.sp.id === 'hearth') { this.cast = null; this.err(tr('Prerušené.', 'Interrupted.')); }
    if (s.hp <= 0) {
      if (!this.inHub()) { s.hp = Math.round(this.maxHp * 0.5); UI.toast(tr('💀 Padol(a) si — Amplitúda ťa oživila. Chyby sa počítajú do hviezdičiek.', '💀 You fell — Amplitude revived you. Mistakes count towards the stars.'), 3200); return; }
      this.die();
    }
  },
  die() {
    const s = this.S;
    s.hp = 0; this.dead = true; this.cast = null; this.auto = false; this.mounted = false; this.target = null;
    for (const m of this.mobs) if (m.state === 'chase') m.state = 'evade';
    Sound.sfx('death');
    this.ui.death.classList.add('show');
  },
  release() {
    const s = this.S, pl = this.pl();
    this.dead = false; s.hp = Math.round(this.maxHp * 0.5); s.mana = Math.round(this.maxMana * 0.5);
    pl.p = [0, 0, 3.4]; pl.heading = 0; Hub.cam.yaw = Math.PI;
    this.ui.death.classList.remove('show');
    Sound.sfx('portal');
  },

  // ---------- ovládanie ----------
  key(e) {
    if (!Settings.wow) return false;
    const sp = SPELLS.find((x) => x.key === e.code);
    if (sp) { e.preventDefault(); this.press(sp); this.flashBtn(sp); return true; }
    if (e.code === 'Tab') { e.preventDefault(); this.tabTarget(); return true; }
    if (e.code === 'KeyB') { this.toggleBags(); return true; }
    if (e.code === 'Space') { e.preventDefault(); document.activeElement && document.activeElement.blur && document.activeElement.blur(); this.jump(); return true; }
    return false;
  },
  escape() {
    if (this.vendorOpen || this.ui.bags.classList.contains('show') || this.ui.loot.classList.contains('show')) { this.closeVendor(); this.toggleBags(false); this.ui.loot.classList.remove('show'); return; }
    this.target = null; this.auto = false;
  },
  jump() {
    const pl = this.pl();
    if (!this.inHub() || this.dead || (pl.y || 0) > 0.01) return;
    pl.vy = 6.5; this.mounted = false;
  },
  tabTarget() {
    if (!this.inHub()) return;
    const pl = this.pl(), list = this.mobs.filter((m) => m.state !== 'dead' && this.dist(m.p, pl.p) < 30).sort((a, b) => this.dist(a.p, pl.p) - this.dist(b.p, pl.p));
    if (!list.length) return this.err(tr('Nablízku nie je žiadny nepriateľ.', 'No enemies nearby.'));
    const i = list.indexOf(this.target);
    this.target = list[(i + 1) % Math.min(list.length, 5)];
    this.auto = false;
    Sound.sfx('target');
  },
  // klik do 3D sveta: ľavý = zamerať, pravý = zamerať a útočiť / hovoriť s postavou
  click(x, y, button) {
    if (!this.inHub() || UI.busy) return false;
    let best = null, bd = 46;
    for (const m of this.mobs) {
      if (m.state === 'dead' && m !== this.target) continue;
      const q = Game.r.project(V3.add(m.p, [0, 0.9, 0]));
      if (!q) continue;
      const d = Math.hypot(q[0] - x, q[1] - y);
      if (d < bd) { bd = d; best = m; }
    }
    if (best) {
      this.target = best; Sound.sfx('target');
      if (button === 2 && best.state !== 'dead') { this.auto = true; this.autoT = Math.min(this.autoT, 0.3); }
      return true;
    }
    const pl = this.pl();
    const npcs = [{ p: VENDOR_POS, f: () => this.openVendor() }, { p: [0, 0, 0], f: () => Game.guideTalk() }];
    for (const n of npcs) {
      const q = Game.r.project(V3.add(n.p, [0, 1.4, 0]));
      if (q && Math.hypot(q[0] - x, q[1] - y) < 50) {
        if (button === 2) { if (this.dist(n.p, pl.p) < 7.5) n.f(); else this.err(tr('Si príliš ďaleko.', 'You are too far away.')); }
        return true;
      }
    }
    if (button === 0) { this.target = null; this.auto = false; }
    return false;
  },

  // ---------- inštancie (levely) ----------
  onEnterLevel(L) {
    if (!Settings.wow) return;
    this.mounted = false; this.cast = null; this.auto = false;
    this.inst = { n: L.num, bonus: 0, hp: 1, dead: false };
    this.target = { npc: true, boss: true };
    this.closeVendor();
    document.body.dataset.scene = 'inst';
    this.banner(L.title, 'zone', tr('Vstupuješ do inštancie', 'Entering instance'));
  },
  onHub() {
    if (!Settings.wow) return;
    this.inst = null; this.target = null; this.cast = null;
    document.body.dataset.scene = 'hub';
    this.banner(tr('Hilbertov ostrov', 'Hilbert Island'), 'zone');
  },
  bossHp() {
    const L = Game.scene, I = this.inst;
    if (!I || !L || L === Hub) return 1;
    if (I.dead) return 0;
    const n = L.steps.length, done = Math.min(Math.max(L.stepIdx, 0), n);
    if (L.boss && typeof DRAGON_PHASES !== 'undefined') { // drak: zdravie zo štítových fáz
      if (L.stepIdx >= n) return Math.max(0.03, 0.08 - I.bonus);
      const anc = Settings.diff === 'ancient' ? 1 : 0, hp = DRAGON_PHASES.map((P) => P.hp + anc), tot = hp.reduce((a, b) => a + b, 0);
      const k = L.phase ?? -1;
      if (k < 0) return 1;
      const rest = hp.slice(k + 1).reduce((a, b) => a + b, 0) + Math.max(L.dhp ?? hp[k], 0);
      return Math.max(0.08, rest / tot * 0.92 + 0.08);
    }
    return clamp(1 - 0.6 * done / n - I.bonus, 0.02, 1);
  },
  onStep(L) {
    if (!Settings.wow || !this.inst || L.stepIdx <= 0 || L.boss) return; // drak: zdravie zo súboja o štít
    if (L.stepIdx <= L.steps.length) { this.bossFct(`${Math.round(60 / L.steps.length)} %`, 'crit'); Sound.sfx('hit'); }
  },
  onAnswer(ok) {
    if (!Settings.wow || !this.inst || this.inHub()) return;
    const L = Game.scene;
    if (ok) {
      const fin = L.stepIdx >= L.steps.length;
      const N = L.boss ? DRAGON_TRAPS.length + ancientTraps(L.num).length : TRAPS[L.num].length + hardTraps(L.num).length + ancientTraps(L.num).length;
      const d = fin ? 0.38 / Math.max(N, 1) : 0.025;
      this.inst.bonus += d;
      this.bossFct(`${Math.round(d * 100)} %`, 'dmg');
      this.projectile();
      Sound.sfx('bolt');
    } else {
      this.hitPlayer(this.maxHp * 0.18);
      this.bossFct(tr('úder!', 'smash!'), 'hurt', true);
      Sound.sfx('hit');
    }
  },
  onLevelComplete(n, stars) {
    if (!Settings.wow) return;
    const s = this.S, B = BOSSES[n];
    if (this.inst) this.inst.dead = true;
    this.banner(tr(`${B.name} porazený!`, `${B.name} defeated!`), 'boss');
    Sound.sfx('bossdown');
    const id = `boss${n}_${stars}`, had = s.loot[n] || 0, coins = 2500 * n + 1500 * stars;
    const items = [];
    if (stars > had) { s.loot[n] = stars; items.push(id); }
    items.push(['pot_hp', 'pot_mana'][n % 2]);
    this.gainXp(xpNeed(s.lvl) * (0.55 + 0.1 * stars) * (had ? 0.3 : 1), tr('boss', 'boss'));
    s.money += coins; Sound.sfx('coin');
    for (const it of items) this.addItem(it, 1, true);
    s.hp = this.maxHp; s.mana = this.maxMana;
    this.showLoot(B, items, coins);
    Game.save();
  },
  projectile() { // vizuál v inštancii: guľa letí z rámu hráča do rámu bossa
    const a = this.ui.pf.getBoundingClientRect(), b = this.ui.tf.getBoundingClientRect(), p = el('div', 'wow-proj');
    p.style.left = a.left + 40 + 'px'; p.style.top = a.top + 30 + 'px';
    document.body.appendChild(p);
    requestAnimationFrame(() => { p.style.transform = `translate(${b.left - a.left + 20}px, ${b.top - a.top}px)`; p.style.opacity = '0.2'; });
    setTimeout(() => p.remove(), 600);
  },
  bossFct(text, cls, onPlayer) {
    const host = onPlayer ? this.ui.pf : this.ui.tf, d = el('div', 'wow-ffct ' + cls, text);
    host.appendChild(d); setTimeout(() => d.remove(), 1300);
  },

  // ---------- úlohy (Amplitúda) ----------
  questMark() { // '!' = nová úloha, '?' = splnená, '…' = rozpracovaná
    const s = this.S, q = QUESTS[s.q.i];
    if (!q || !Game.progress.introSeen) return '';
    if (!s.q.on) return '!';
    return s.q.k >= q.n ? '?' : '…';
  },
  guideQuest(A) {
    const s = this.S, q = QUESTS[s.q.i];
    if (!q) return false;
    if (!s.q.on) {
      UI.say(q.offer.map(A), () => {
        s.q.on = true; s.q.k = 0; Game.save();
        Sound.sfx('quest');
        UI.toast(tr(`📜 Prijatá úloha: <b>${q.title}</b>`, `📜 Quest accepted: <b>${q.title}</b>`));
      });
      return true;
    }
    if (s.q.k >= q.n) {
      UI.say([A(q.done)], () => {
        const xp = xpNeed(s.lvl) * 0.5;
        s.q = { i: s.q.i + 1, k: 0, on: false };
        Sound.sfx('quest');
        this.money(q.c, q.title);
        for (const [id, n] of q.items) this.addItem(id, n);
        this.gainXp(xp, q.title);
        UI.toast(tr(`✔ Úloha dokončená: <b>${q.title}</b>`, `✔ Quest completed: <b>${q.title}</b>`));
      });
      return true;
    }
    return false;
  },

  // ---------- slučka ----------
  update(dt) {
    if (!Settings.wow) return;
    const s = this.S, pl = this.pl();
    const paused = UI.busy || document.querySelector('.overlay.show');
    for (const k in this.cd) this.cd[k] = Math.max(0, this.cd[k] - dt);
    this.gcd = Math.max(0, this.gcd - dt);
    // skok
    if (pl.vy || pl.y) { pl.y = (pl.y || 0) + (pl.vy || 0) * dt; pl.vy = (pl.vy || 0) - 18 * dt; if (pl.y <= 0) { pl.y = 0; pl.vy = 0; } }
    // zosielanie
    if (this.cast) {
      if (this.moving && this.inHub()) { this.cast = null; this.err(tr('Prerušené.', 'Interrupted.')); }
      else if (!paused || !this.inHub()) {
        this.cast.t += dt;
        if (this.cast.t >= this.cast.sp.cast) { const c = this.cast; this.cast = null; if (!c.sp.range || c.sp.self || this.hostile() === c.target) this.fire(c.sp, c.target); else if (c.sp.id === 'hearth' || c.sp.id === 'mount') this.fire(c.sp); }
      }
    }
    // regenerácia: mimo boja rýchla, v boji pomalá
    this.combatT += dt;
    const inCombat = this.combatT < 5 || this.mobs.some((m) => m.state === 'chase');
    if (!this.dead) {
      s.hp = Math.min(this.maxHp, s.hp + this.maxHp * (inCombat ? 0 : 0.05) * dt);
      s.mana = Math.min(this.maxMana, s.mana + this.maxMana * (inCombat ? 0.012 : 0.06) * dt);
    }
    this.inCombat = inCombat;
    if (this.inHub()) {
      if (!paused) this.updateMobs(dt);
      // automatický útok
      const tg = this.hostile();
      if (this.auto && tg && !this.dead && !paused) {
        this.autoT -= dt;
        if (this.autoT <= 0 && !this.cast && this.dist(pl.p, tg.p) < 25) { this.autoT = 2; this.face(tg.p); this.fire(SPELLS.find((x) => x.id === 'shoot'), tg); }
      } else if (!tg) this.auto = false;
      // projektily
      for (const pr of this.proj) {
        const to = V3.add(pr.m.p, [0, 0.9, 0]), d = V3.sub(to, pr.p), L = V3.len(d);
        if (L < 0.5) { pr.done = true; this.impact(pr); }
        else pr.p = V3.add(pr.p, V3.scale(d, Math.min(1, 24 * dt / L)));
      }
      this.proj = this.proj.filter((p) => !p.done);
      // obchodník: odídeš = zavrie sa
      if (this.vendorOpen && this.dist(pl.p, VENDOR_POS) > 7) this.closeVendor();
    }
    for (const f of this.fct) f.t += dt;
    this.fct = this.fct.filter((f) => f.t < 1.3);
    for (const f of this.fx) f.t += dt;
    this.fx = this.fx.filter((f) => f.t < 1.2);
    this.uiT = (this.uiT || 0) + dt;
    if (this.uiT > 0.08) { this.uiT = 0; this.renderFrames(); this.renderBar(); }
  },
  updateMobs(dt) {
    const pl = this.pl(), s = this.S, safe = this.safe(pl.p);
    for (const m of this.mobs) {
      m.flash = Math.max(0, m.flash - dt);
      if (m.state === 'dead') {
        m.deadT += dt;
        if (m.deadT > 25 && (this.dist(pl.p, m.home) > 6 || m.deadT > 50)) Object.assign(m, this.newMob(m.type, m.lvl, m.home), { id: m.id });
        continue;
      }
      // relaxácia T₁ (amplitúdové tlmenie): štít sa vracia na |0⟩, koherencie miznú
      const T1 = 6, e1 = Math.exp(-dt / T1), e2 = Math.exp(-dt / (2 * T1));
      m.r = [m.r[0] * e2, m.r[1] * e2, 1 - (1 - m.r[2]) * e1];
      const dp = this.dist(m.p, pl.p), moveTo = (q, v) => {
        const d = V3.sub([q[0], 0, q[2]], [m.p[0], 0, m.p[2]]), L = V3.len(d);
        if (L < 0.05) return true;
        const st = Math.min(L, v * dt);
        m.p = V3.add(m.p, V3.scale(d, st / L)); m.face = Math.atan2(d[0], d[2]); m.walk += st * 3;
        return L < 0.1;
      };
      if (m.state === 'idle') {
        const gray = m.lvl - s.lvl <= -5, radius = clamp(6 + (m.lvl - s.lvl) * 0.4, 3.5, 8);
        if (!this.dead && !gray && !safe && dp < radius) { this.aggro(m); continue; }
        m.t -= dt;
        if (m.t <= 0) { m.t = rr(3, 7); const a = rand() * 6.28, r = rand() * 2.5; m.wander = [m.home[0] + Math.cos(a) * r, 0, m.home[2] + Math.sin(a) * r]; }
        if (m.wander && moveTo(m.wander, 1.6)) m.wander = null;
      } else if (m.state === 'chase') {
        if (this.dead || safe || this.dist(m.p, m.home) > 22) { m.state = 'evade'; if (this.target === m) this.auto = false; continue; }
        if (dp > 1.7) moveTo(pl.p, 5.6);
        else {
          m.face = Math.atan2(pl.p[0] - m.p[0], pl.p[2] - m.p[2]);
          m.atk -= dt;
          if (m.atk <= 0) { m.atk = 2; m.swing = 0.3; this.hitPlayer((3 + 2.2 * m.lvl) * rr(0.85, 1.15) * DIFF_DMG(), m); Sound.sfx('swing'); }
        }
        m.swing = Math.max(0, (m.swing || 0) - dt);
      } else if (m.state === 'evade') {
        m.hp = Math.min(m.max, m.hp + m.max * dt);
        if (moveTo(m.home, 9)) { m.state = 'idle'; m.hp = m.max; m.r = [0, 0, 1]; }
      }
    }
  },

  // ---------- kreslenie sveta ----------
  // humanoid z primitív; vráti polohu guľôčky na palici (ak ju má)
  humanoid(r, p, h, o = {}) {
    const S = o.scale || 1, c = Math.cos(h), sn = Math.sin(h);
    const W = (x, y, z) => [p[0] + (c * x + sn * z) * S, p[1] + y * S, p[2] + (-sn * x + c * z) * S];
    const op = (x = {}) => (o.alpha != null && o.alpha < 1 ? { ...x, alpha: o.alpha } : x);
    const sw = Math.sin(o.walk || 0) * (o.moving ? 0.5 : 0), robe = o.robe || [0.25, 0.55, 0.85], trim = o.trim || [0.9, 0.72, 0.3], skin = o.skin || [0.96, 0.8, 0.68];
    for (const k of [-1, 1]) r.rod(W(k * 0.12, 0.72, 0), W(k * 0.12, 0.04, sw * k * 0.4), [0.28, 0.22, 0.18], 0.075 * S, op());
    r.draw('cone', M4.trs(W(0, 0.18, 0), h, [0.42 * S, 1.2 * S, 0.38 * S]), robe, op());
    r.draw('cylinder', M4.trs(W(0, 0.8, 0), h, [0.24 * S, 0.58 * S, 0.19 * S]), robe, op());
    r.draw('cylinder', M4.trs(W(0, 0.9, 0), h, [0.255 * S, 0.08 * S, 0.2 * S]), trim, op({ emissive: 0.1 }));
    for (const k of [-1, 1]) r.draw('lowSphere', M4.trs(W(k * 0.31, 1.35, 0), h, [0.19 * S, 0.13 * S, 0.19 * S]), trim, op({ emissive: 0.1 }));
    const swing = o.swing ? -0.6 : 0;
    for (const k of [-1, 1]) {
      const hand = k > 0 && o.staff ? W(0.4, 0.95, 0.18) : W(k * 0.38, 0.86 + (k > 0 ? swing * -0.5 : 0), -sw * k * 0.28 + (k > 0 ? -swing : 0));
      r.rod(W(k * 0.31, 1.3, 0), hand, robe, 0.07 * S, op()); r.sphere(hand, 0.065 * S, skin, op());
    }
    r.sphere(W(0, 1.6, 0), 0.2 * S, skin, op());
    for (const k of [-1, 1]) r.sphere(W(k * 0.07, 1.63, 0.18), 0.028 * S, o.eye || [0.1, 0.1, 0.15], op({ emissive: o.eye ? 1.5 : 0 }));
    const hc = o.hatCol || V3.scale(robe, 0.8);
    if (o.hat === 'wizard') { r.draw('disk', M4.trs(W(0, 1.72, 0), h, 0.36 * S), hc, op()); r.draw('cone', M4.trs(W(0, 1.72, 0), h, [0.22 * S, 0.62 * S, 0.22 * S]), hc, op()); }
    else if (o.hat === 'top') { r.draw('disk', M4.trs(W(0, 1.74, 0), h, 0.3 * S), [0.08, 0.08, 0.1], op()); r.draw('cylinder', M4.trs(W(0, 1.74, 0), h, [0.18 * S, 0.34 * S, 0.18 * S]), [0.08, 0.08, 0.1], op()); }
    else if (o.hat === 'hood') r.draw('lowSphere', M4.trs(W(0, 1.64, -0.04), h, [0.25 * S, 0.27 * S, 0.25 * S]), hc, op());
    else if (o.hat === 'circlet') { r.draw('torus', M4.trs(W(0, 1.7, 0), h, [0.21 * S, 0.5 * S, 0.21 * S]), [1, 0.85, 0.35], op({ emissive: 0.4 })); r.sphere(W(0, 1.72, 0.2), 0.045 * S, [0.4, 0.7, 1], op({ emissive: 1.2 })); }
    else r.draw('lowSphere', M4.trs(W(0, 1.66, -0.05), h, [0.21 * S, 0.17 * S, 0.21 * S]), o.hair || [0.35, 0.22, 0.12], op());
    if (o.staff) {
      const b = W(0.4, 0.02, 0.18), tp = W(0.4, 1.95, 0.18);
      r.rod(b, tp, [0.45, 0.3, 0.18], 0.04 * S, op({ pattern: 5 }));
      r.sphere(tp, 0.12 * S, o.orb || [0.4, 0.9, 1], op({ emissive: 1.2 }));
      return tp;
    }
    return W(0, 1.6, 0);
  },

  drawMob(r, m, t) {
    const T = MOB_TYPES[m.type], p = m.p, h = m.face, dead = m.state === 'dead';
    const A = dead ? Math.max(0, 0.6 - m.deadT * 0.05) : 1, em = m.flash > 0 ? 0.9 : 0, o = (x = {}) => ({ emissive: em, ...(A < 1 ? { alpha: A } : {}), ...x });
    if (A <= 0.02) return;
    const bob = dead ? 0 : Math.sin(t * 3 + m.id * 9) * 0.06, c = T.col, f = [Math.sin(h), 0, Math.cos(h)];
    switch (m.type) {
      case 'hidden': {
        const y = dead ? 0.25 : 0.45;
        r.draw('box', M4.trs([p[0], y, p[2]], h, 0.85), c, o({ pattern: 5 }));
        r.draw('box', M4.trs([p[0], y + 0.5 + Math.abs(bob) * 2, p[2]], h, [0.9, 0.12, 0.9]), V3.scale(c, 0.8), o({ pattern: 5 }));
        if (!dead) r.draw('box', M4.trs([p[0], y + 0.44, p[2]], h, [0.7, 0.06, 0.7]), [0.8, 0.4, 1], { emissive: 1.4 });
        break;
      }
      case 'billiard': {
        const y = dead ? 0.3 : 0.55 + Math.abs(bob) * 3;
        r.sphere([p[0], y, p[2]], 0.55, c, o());
        r.draw('disk', M4.orient(V3.add([p[0], y, p[2]], V3.scale(f, 0.53)), f, 0.22), [0.95, 0.95, 0.95], o());
        r.draw('disk', M4.orient(V3.add([p[0], y, p[2]], V3.scale(f, 0.54)), f, 0.12), [0.1, 0.1, 0.1], o());
        break;
      }
      case 'planet': {
        const cc = [p[0], dead ? 0.3 : 1 + bob, p[2]];
        r.sphere(cc, 0.32, c, o());
        if (!dead) for (let k = 0; k < 3; k++) {
          const ax = V3.norm([Math.sin(k * 2.1), 1.2, Math.cos(k * 2.1)]), u = V3.norm(V3.cross(ax, [1, 0, 0])), w = V3.cross(ax, u), a = t * (2 + k) + k;
          r.draw('circle', M4.orient(cc, ax, 0.8), [0.6, 0.7, 1]);
          r.sphere(V3.add(cc, V3.add(V3.scale(u, Math.cos(a) * 0.8), V3.scale(w, Math.sin(a) * 0.8))), 0.09, [0.5, 0.75, 1], { emissive: 0.8 });
        }
        break;
      }
      case 'ftl': {
        const cc = [p[0], dead ? 0.3 : 1.1 + bob * 2, p[2]];
        r.arrow(V3.sub(cc, V3.scale(f, 0.8)), V3.add(cc, V3.scale(f, 0.9)), c, 0.13, o({ emissive: em + 0.6 }));
        if (!dead) for (let k = 1; k <= 3; k++) r.rod(V3.sub(cc, V3.scale(f, 0.9 + k * 0.25)), V3.sub(cc, V3.scale(f, 1 + k * 0.25 + 0.4)), [1, 0.7, 0.4], 0.03, { alpha: 0.6 / k, unlit: 1 });
        break;
      }
      case 'cat': {
        const draw = (q, a, flip) => {
          const W = (x, y, z) => [q[0] + Math.cos(h) * x + Math.sin(h) * z, (flip ? 0.75 - y : y), q[2] - Math.sin(h) * x + Math.cos(h) * z];
          const oo = (x = {}) => o({ ...x, alpha: a * A });
          r.draw('lowSphere', M4.trs(W(0, 0.48, 0), h, [0.3, 0.27, 0.55]), c, oo());
          r.sphere(W(0, 0.78, 0.5), 0.22, c, oo());
          for (const k of [-1, 1]) {
            const eb = W(k * 0.1, 0.92, 0.5), et = W(k * 0.13, flip ? 1.12 : 1.12, 0.48);
            r.draw('cone', M4.alignY(eb, V3.sub(et, eb), V3.len(V3.sub(et, eb)) || 0.2, 0.07), c, oo());
            for (const z of [-0.3, 0.3]) r.rod(W(k * 0.15, 0.35, z), W(k * 0.15, 0.02, z + Math.sin(m.walk + k + z) * 0.08), c, 0.05, oo());
          }
          r.rod(W(0, 0.55, -0.5), W(0.1, 0.95, -0.8), c, 0.045, oo());
          for (const k of [-1, 1]) r.sphere(W(k * 0.08, 0.82, 0.69), 0.03, [0.6, 1, 0.4], oo({ emissive: 1.5 }));
        };
        draw(p, 1, dead);
        if (!dead) draw(V3.add(p, [0.25, 0, 0.1]), 0.18 + 0.12 * Math.sin(t * 4 + m.id), true); // „mŕtva“ vetva — len obraz druhého výsledku
        break;
      }
      case 'cultist':
        if (dead) r.draw('lowSphere', M4.trs([p[0], 0.15, p[2]], h, [0.5, 0.15, 0.9]), c, o());
        else this.humanoid(r, p, h, { robe: c, trim: [0.5, 0.15, 0.15], hat: 'hood', eye: [1, 0.3, 0.2], staff: true, orb: [1, 0.25, 0.2], walk: m.walk, moving: m.state !== 'idle' || !!m.wander, swing: m.swing > 0, alpha: A < 1 ? A : undefined });
        break;
    }
  },

  drawWorld(r) {
    const t = r.time, pl = this.pl();
    // námestie: fontána, lampy
    r.draw('cylinder', M4.trs([0, 0, 0], 0, [2.7, 0.45, 2.7]), [0.6, 0.57, 0.52], { pattern: 11 });
    r.draw('disk', M4.trs([0, 0.46, 0], 0, 2.45), [0.2, 0.5, 0.75], { pattern: 2 });
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2 + 0.5, q = [Math.cos(a) * 4.6, 0, Math.sin(a) * 4.6];
      if (this.dist(q, VENDOR_POS) < 2.5) continue;
      r.rod(q, V3.add(q, [0, 2.4, 0]), [0.18, 0.16, 0.15], 0.06);
      r.sphere(V3.add(q, [0, 2.5, 0]), 0.16, [1, 0.85, 0.45], { emissive: 1.4 });
    }
    // obchodník Planck: stánok s plachtou
    const V = VENDOR_POS, vh = Math.atan2(-V[0], -V[2]);
    for (const [x, z] of [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]]) {
      const q = V3.add(V, [Math.cos(vh) * x + Math.sin(vh) * z, 0, -Math.sin(vh) * x + Math.cos(vh) * z]);
      r.rod(q, V3.add(q, [0, 2.3, 0]), [0.45, 0.3, 0.18], 0.06, { pattern: 5 });
    }
    r.draw('cone', M4.trs(V3.add(V, [0, 2.25, 0]), vh, [2.2, 0.8, 1.6]), [0.75, 0.18, 0.15]);
    r.draw('box', M4.trs(V3.add(V, [Math.sin(vh) * 0.75, 0.45, Math.cos(vh) * 0.75]), vh, [2.4, 0.9, 0.5]), [0.55, 0.38, 0.22], { pattern: 5 });
    for (const [x, z, s] of [[1.6, 1.2, 0.5], [2.1, 0.7, 0.4], [-1.8, 1.3, 0.55]]) r.draw('box', M4.trs(V3.add(V, [x, s / 2, z]), x, s), [0.5, 0.36, 0.22], { pattern: 5 });
    this.humanoid(r, V3.add(V, [-Math.sin(vh) * 0.2, 0, -Math.cos(vh) * 0.2]), vh, { robe: [0.22, 0.24, 0.3], trim: [0.75, 0.65, 0.4], hat: 'top', hair: [0.85, 0.85, 0.85], walk: 0 });
    UI.label('vendor', V3.add(V, [0, 2.95, 0]), `<b>Max Planck</b><br><small>&lt;${tr('Kvantové potreby', 'Quantum Provisions')}&gt;</small>`, 'npc friendly');
    UI.label('vendorcoin', V3.add(V, [0, 3.75, 0]), '💰', 'qmark');
    UI.hot(V3.add(V, [0, 1.4, 0]), tr('<b>Max Planck</b> — obchodník. Elixíry, výstroj, jazdecká Blochova guľa. Podíď a stlač E (alebo pravý klik).', '<b>Max Planck</b> — merchant. Potions, gear, a rideable Bloch sphere. Walk up and press E (or right-click).'), 40);
    // nepriatelia
    for (const m of this.mobs) {
      if (this.dist(m.p, pl.p) > 60) continue;
      this.drawMob(r, m, t);
      if (m.state === 'dead') continue;
      const near = this.dist(m.p, pl.p) < 22;
      if (near || m === this.target) {
        const T = MOB_TYPES[m.type], hpw = Math.round(100 * m.hp / m.max);
        UI.label('mob' + m.id, V3.add(m.p, [0, m.type === 'cultist' ? 2.5 : 2, 0]),
          `<div class="np${m === this.target ? ' tg' : ''}"><span style="color:${this.con(m.lvl)}">${m.lvl}</span> ${T.name}<i><b style="width:${hpw}%"></b></i>${m === this.target ? `<u><b style="width:${Math.round(50 * (1 - m.r[2]))}%"></b></u>` : ''}</div>`, 'nameplate', null);
        UI.hot(V3.add(m.p, [0, 0.9, 0]), `<b>${T.name}</b> (${tr('úroveň', 'level')} ${m.lvl})<br>${T.tip}<br><small>${tr('Ľavý klik = zamerať · pravý = útok · Tab = ďalší cieľ', 'Left click = target · right = attack · Tab = next target')}</small>`, 36);
      }
    }
    // kruh pod cieľom
    const tg = this.target;
    if (tg && tg.p && !tg.npc) r.draw('torus', M4.trs([tg.p[0], 0.05, tg.p[2]], t, [1.05, 0.25, 1.05]), tg.state === 'dead' ? [0.5, 0.5, 0.5] : [1, 0.15, 0.1], { emissive: 0.9, alpha: 0.85 });
    // projektily a efekty
    for (const pr of this.proj) {
      r.sphere(pr.p, pr.sp.id === 'shoot' ? 0.12 : 0.2, pr.col, { emissive: 1.5 });
      r.sphere(pr.p, 0.38, pr.col, { alpha: 0.25, unlit: 1 });
    }
    for (const f of this.fx) {
      const k = f.t / 1.2;
      if (f.kind === 'nova') r.draw('torus', M4.trs(V3.add(f.p, [0, 0.4, 0]), 0, [1 + k * 7, 2 + 6 * (1 - k), 1 + k * 7]), [0.75, 0.5, 1], { emissive: 1.2, alpha: 1 - k });
      if (f.kind === 'heal' || f.kind === 'ding') {
        const col = f.kind === 'heal' ? [0.4, 1, 0.55] : [1, 0.85, 0.3];
        for (let i = 0; i < 10; i++) { const a = i * 0.63 + t * 2; r.sphere(V3.add(pl.p, [Math.cos(a) * 0.7, (pl.y || 0) + k * 2.5 + (i % 3) * 0.3, Math.sin(a) * 0.7]), 0.07, col, { emissive: 1.5, alpha: 1 - k }); }
        if (f.kind === 'ding') r.draw('cylinder', M4.trs(V3.add(pl.p, [0, 0, 0]), 0, [0.9, 6 * (1 - k * 0.5), 0.9]), [1, 0.9, 0.5], { alpha: 0.35 * (1 - k), unlit: 1 });
      }
      if (f.kind === 'blink') for (const q of [f.a, f.b]) r.sphere(V3.add(q, [0, 1, 0]), 0.6 + k, [0.7, 0.5, 1], { alpha: 0.5 * (1 - k), unlit: 1 });
      if (f.kind === 'slash' && f.m) {
        const c = V3.add(f.m.p, [0, 1, 0]), a = f.t * 7;
        r.rod(V3.add(c, [-1.2 * Math.cos(a), 1.2 * Math.sin(a), 0]), V3.add(c, [1.2 * Math.cos(a), -1.2 * Math.sin(a), 0]), f.hit ? [1, 0.9, 0.5] : [0.6, 0.7, 0.9], 0.07, { emissive: 1.5, alpha: Math.max(0, 1 - k * 2) });
      }
    }
    // plávajúci text boja
    for (const f of this.fct) {
      const key = 'fct' + f.k;
      UI.label(key, V3.add(f.p, [f.dx * f.t, f.t * 1.6, 0]), f.text, 'fct ' + f.cls, null);
      const e = UI.labelPool.get(key); if (e) e.style.opacity = String(Math.min(1, 2.2 - f.t * 1.7));
    }
  },

  drawPlayer(r) {
    const pl = this.pl(), s = this.S, t = r.time, it = (sl) => this.item(s.equip[sl]) || {};
    const y = pl.y || 0, base = V3.add(pl.p, [0, y + (this.mounted ? 0.95 : 0), 0]);
    if (this.mounted) { // jazdecká Blochova guľa
      const c = V3.add(pl.p, [0, y + 0.75, 0]);
      r.draw('circle', M4.trs(c, t, 0.78), [0.55, 0.75, 1]);
      r.draw('circle', M4.orient(c, [Math.sin(t), 0, Math.cos(t)], 0.78), [0.35, 0.45, 0.7]);
      r.arrow(c, V3.add(c, [Math.sin(t * 2) * 0.5, 0.55, Math.cos(t * 2) * 0.5]), [1, 0.35, 0.45], 0.035, { emissive: 0.4 });
      r.sphere(c, 0.8, [0.45, 0.6, 1], { alpha: 0.22 });
    }
    const A = this.dead ? 0.35 : 1;
    const orb = this.humanoid(r, base, pl.heading, { robe: it('chest').robe || [0.18, 0.52, 0.86], trim: [0.95, 0.78, 0.32], hat: it('head').hat || 'wizard', hatCol: it('head').hat ? null : [0.2, 0.3, 0.75],
      staff: true, orb: it('weapon').orb || [0.4, 0.95, 1], walk: pl.walk || 0, moving: this.moving && !this.mounted, alpha: A, swing: this.cast || this.auto });
    this.orbPos = orb;
    // globálna fáza: zlatá ručička krúži okolo guľôčky na palici (nedá sa zmerať)
    const ph = [Math.cos(pl.phase) * 0.4, 0, Math.sin(pl.phase) * 0.4];
    r.arrow(orb, V3.add(orb, ph), [1, 0.85, 0.3], 0.025, { emissive: 0.6 });
    r.draw('circle', M4.trs(orb, 0, 0.4), [0.6, 1, 1]);
    if (this.cast) { const k = this.cast.t / this.cast.sp.cast; r.sphere(orb, 0.2 + 0.25 * k, this.cast.sp.col || [0.5, 0.9, 1], { alpha: 0.4, unlit: 1 }); }
    return V3.add(base, [0, 2.15, 0]);
  },

  // ---------- rozhranie ----------
  buildUi() {
    const root = el('div', null); root.id = 'wow-ui';
    root.innerHTML = `
      <div id="wow-frames">
        <div class="uf tf" id="wow-tf"></div>
        <div class="uf pf" id="wow-pf"></div>
      </div>
      <div id="wow-cast"><i></i><span></span></div>
      <div id="wow-bar"><div class="ab"></div><div class="xp"><i></i><span></span></div></div>
      <div id="wow-bagbar"><div class="gold"></div><button class="bagbtn">🎒</button></div>
      <div id="wow-feed"></div>
      <div id="wow-err"></div>
      <div id="wow-banner"><small></small><b></b></div>
      <div id="wow-mini"><div class="zone"></div><canvas width="300" height="300"></canvas><div class="clock"></div></div>
      <div id="wow-track"></div>
      <div id="wow-bags" class="wowwin"><button class="x">✕</button><h3></h3><div class="eq"></div><div class="grid"></div><div class="foot"></div></div>
      <div id="wow-vendor" class="wowwin"><button class="x">✕</button><h3></h3><div class="list"></div><div class="foot"></div></div>
      <div id="wow-loot" class="wowwin"><button class="x">✕</button><h3></h3><div class="list"></div></div>
      <div id="wow-death"><div><h2></h2><p></p><button class="primary"></button></div></div>`;
    document.body.appendChild(root);
    const q = (s) => root.querySelector(s);
    this.ui = { root, pf: q('#wow-pf'), tf: q('#wow-tf'), cast: q('#wow-cast'), bar: q('#wow-bar .ab'), xp: q('#wow-bar .xp'), gold: q('#wow-bagbar .gold'), feed: q('#wow-feed'), err: q('#wow-err'),
      banner: q('#wow-banner'), mini: q('#wow-mini'), track: q('#wow-track'), bags: q('#wow-bags'), vendor: q('#wow-vendor'), loot: q('#wow-loot'), death: q('#wow-death') };
    q('#wow-bagbar .bagbtn').onclick = () => this.toggleBags();
    q('#wow-bagbar .bagbtn').dataset.tip = tr('Taška a výstroj (B)', 'Bags and gear (B)');
    q('#wow-bags .x').onclick = () => this.toggleBags(false);
    q('#wow-vendor .x').onclick = () => this.closeVendor();
    q('#wow-loot .x').onclick = () => this.ui.loot.classList.remove('show');
    q('#wow-death h2').textContent = tr('Zomrel(a) si', 'You died');
    q('#wow-death p').textContent = tr('Klasické omyly ťa premohli. Duch sa vráti k Amplitúde v strede ostrova.', 'The classical misconceptions overwhelmed you. Your spirit returns to Amplitude in the middle of the island.');
    q('#wow-death button').textContent = tr('Uvoľniť ducha', 'Release Spirit');
    q('#wow-death button').onclick = () => this.release();
    q('#wow-mini canvas').onclick = () => Game.toggleMap(true);
    q('#wow-mini canvas').dataset.tip = tr('Minimapa — klik otvorí mapu (M). Žltá ! = úloha, červené bodky = nepriatelia, 💰 = obchodník.', 'Minimap — click to open the map (M). Yellow ! = quest, red dots = enemies, 💰 = merchant.');
    this.ui.pf.dataset.tip = '';
    // lišta kúziel
    for (const sp of SPELLS) {
      const b = el('button', 'abtn');
      b.innerHTML = `<span class="ic"></span><span class="kb">${sp.label}</span><span class="cnt"></span><i class="cdw"></i><span class="cdt"></span>`;
      b.onclick = () => { if (!UI.busy || sp.item) this.press(sp); };
      b.onmouseenter = () => { b.dataset.tip = this.spellTip(sp); };
      sp.btn = b; this.ui.bar.appendChild(b);
    }
    document.body.dataset.scene = 'hub';
    this.renderBar(true); this.renderFrames(); this.renderBags();
  },
  spellTip(sp) {
    if (sp.item) return this.tipItem(sp.item, `<div class="g">${tr('V taške', 'In bags')}: ${this.count(sp.item)} · ${tr('Kláves', 'Key')} ${sp.label} · ${tr('cooldown elixírov 30 s', 'potion cooldown 30 s')}</div>`);
    const st = [sp.mana && `${sp.mana} ${tr('koherencie', 'coherence')}`, sp.range && !sp.self && `${sp.range} m`, sp.cast ? `${tr('Zosielanie', 'Cast')} ${sp.cast} s` : tr('Okamžité', 'Instant'), sp.cd && `${tr('Obnova', 'Cooldown')} ${sp.cd} s`].filter(Boolean);
    const lock = sp.lvl > this.S.lvl ? `<div class="bad">${tr(`Naučíš sa na úrovni ${sp.lvl}.`, `Learned at level ${sp.lvl}.`)}</div>` : '';
    const dmg = sp.dmg ? `<div>${tr('Poškodenie', 'Damage')}: ${Math.round(sp.dmg[0] + this.sp * (sp.sp || 0))}–${Math.round(sp.dmg[1] + this.sp * (sp.sp || 0))}</div>` : '';
    return `<div class="itip"><b>${sp.name}</b> <span class="r">${sp.label}</span><div>${st.join(' · ')}</div>${dmg}<div class="g">${sp.text}</div>${lock}</div>`;
  },
  flashBtn(sp) { if (sp.btn) { sp.btn.classList.add('press'); setTimeout(() => sp.btn.classList.remove('press'), 120); } },
  renderBar(full) {
    if (!this.ui) return;
    const s = this.S;
    for (const sp of SPELLS) {
      const b = sp.btn, st = this.spellState(sp), it = sp.item && this.item(sp.item);
      if (full) b.querySelector('.ic').innerHTML = it ? it.icon : sp.icon;
      b.className = 'abtn ' + (sp.id) + (st ? ' ' + st : '') + (sp.id === 'shoot' && this.auto ? ' on' : '') + (sp.id === 'mount' && this.mounted ? ' on' : '');
      b.querySelector('.cnt').textContent = it ? this.count(sp.item) : '';
      const cdMax = sp.item ? 30 : sp.cd || 0, left = sp.item ? this.cd.potion || 0 : this.cd[sp.id] || 0;
      const g = !sp.item && sp.id !== 'hearth' && sp.id !== 'mount' && sp.id !== 'shoot' ? this.gcd / GCD : 0, frac = Math.max(cdMax ? left / cdMax : 0, left > 0 ? 0 : g);
      b.querySelector('.cdw').style.background = frac > 0 ? `conic-gradient(rgba(0,0,0,0.7) ${frac * 360}deg, transparent 0)` : '';
      b.querySelector('.cdt').textContent = left > 1.5 ? Math.ceil(left) : '';
    }
    const need = xpNeed(s.lvl);
    this.ui.xp.querySelector('i').style.width = (s.lvl >= MAX_LVL ? 100 : 100 * s.xp / need).toFixed(1) + '%';
    this.ui.xp.querySelector('span').textContent = s.lvl >= MAX_LVL ? tr('Maximálna úroveň', 'Max level') : `XP ${s.xp} / ${need}`;
    this.ui.xp.dataset.tip = tr(`Skúsenosti: ${s.xp} / ${need}. Získaš ich za omyly (nepriateľov), úlohy a hlavne za dokončené levely.`, `Experience: ${s.xp} / ${need}. Earned from misconceptions (enemies), quests and above all completed levels.`);
    this.ui.gold.innerHTML = fmtMoney(s.money);
    // zosielanie
    const c = this.cast, cb = this.ui.cast;
    cb.classList.toggle('show', !!c);
    if (c) { cb.querySelector('i').style.width = (100 * c.t / c.sp.cast).toFixed(1) + '%'; cb.querySelector('span').textContent = `${c.sp.name} ${(c.sp.cast - c.t).toFixed(1)}`; }
  },
  bar(cls, v, max, label) { return `<div class="ubar ${cls}"><b style="width:${(100 * clamp(v / max, 0, 1)).toFixed(1)}%"></b><span>${label ?? `${Math.max(0, Math.round(v))} / ${Math.round(max)}`}</span></div>`; },
  renderFrames() {
    if (!this.ui) return;
    const s = this.S, L = Game.scene, inst = !this.inHub();
    // hráč (v drakovom leveli zdravie zo súboja)
    let hp = s.hp, hpMax = this.maxHp;
    if (inst && L && L.boss && L.hpMax && L.phase >= 0) { hp = L.hp; hpMax = L.hpMax; }
    const pfHtml = `<div class="por">ψ<span class="lv">${s.lvl}</span></div><div class="info"><div class="nm">${tr('Psíčko', 'Little Psi')}${this.inCombat ? ' <span class="cmb">⚔</span>' : ''}</div>${this.bar('hp', hp, hpMax)}${this.bar('mp', s.mana, this.maxMana)}</div>`;
    if (this.ui.pf._h !== pfHtml) {
      [...this.ui.pf.children].filter((c) => !c.classList.contains('wow-ffct')).forEach((c) => c.remove());
      this.ui.pf.insertAdjacentHTML('afterbegin', pfHtml); this.ui.pf._h = pfHtml;
      this.ui.pf.dataset.tip = `<div class="itip"><b>${tr('Psíčko — kvantový mág', 'Little Psi — quantum mage')}</b> <span class="r">${tr('úroveň', 'level')} ${s.lvl}</span>`
        + `<div>${tr('Zdravie', 'Health')}: ${Math.round(s.hp)} / ${this.maxHp} · ${tr('Koherencia (mana)', 'Coherence (mana)')}: ${Math.round(s.mana)} / ${this.maxMana}</div>`
        + `<div>${tr('Intelekt', 'Intellect')} ${this.stat('int')} · ${tr('Výdrž', 'Stamina')} ${this.stat('sta')} · ${tr('Sila kúziel', 'Spell power')} ${Math.round(this.sp)}</div>`
        + `<div class="g">${tr('Mimo boja sa zdravie aj koherencia rýchlo obnovujú.', 'Out of combat, health and coherence regenerate quickly.')}</div></div>`;
    }
    // cieľ / boss
    let tf = '';
    const tg = this.target;
    if (inst && this.inst) {
      const B = BOSSES[L.num] || BOSSES[1], hpF = this.bossHp();
      tf = `<div class="por boss">${B.icon}<span class="lv">💀</span></div><div class="info"><div class="nm elite">${B.name}</div>${this.bar('hp', hpF, 1, `${Math.round(hpF * 100)} %`)}<div class="sub">${L.boss ? tr(`Zraní ho len úder s P(zásah) ≥ ${Fmt.pct(L.thr)}`, `Only a strike with P(hit) ≥ ${Fmt.pct(L.thr)} wounds him`) : tr('Porazí ho len poznanie: kroky a správne odpovede', 'Only knowledge defeats it: steps and correct answers')}</div></div>`;
      this.ui.tf.dataset.tip = `<b>${B.name}</b> — ${B.tip}<br><small>${tr('Každý dokončený krok levelu a každá správna odpoveď mu uberie zdravie. Nesprávna odpoveď = jeho úder.', 'Every completed step of the level and every correct answer takes away its health. A wrong answer = its strike.')}</small>`;
    } else if (tg && tg.p && !tg.npc) {
      const T = MOB_TYPES[tg.type], P1 = clamp((1 - tg.r[2]) / 2, 0, 1), L2 = V3.len(tg.r);
      tf = `<div class="por">${{ hidden: '📦', billiard: '🎱', planet: '🪐', ftl: '⚡', cat: '🐈', cultist: '🕯' }[tg.type]}<span class="lv" style="color:${this.con(tg.lvl)}">${tg.lvl}</span></div><div class="info"><div class="nm">${T.name}</div>${this.bar('hp', tg.hp, tg.max)}`
        + `<div class="qb" ><i style="width:${(P1 * 100).toFixed(0)}%"></i><span>|ψ⟩ P(|1⟩) = ${Fmt.pct(P1)}${L2 < 0.9 ? ' · ' + tr('zmiešaný', 'mixed') : ''}</span></div></div>`;
      this.ui.tf.dataset.tip = `<b>${T.name}</b><br>${T.tip}<br><br>${tr('<b>Štít = qubit.</b> Bornova čepeľ (4) zasiahne s P(|1⟩) = (1 − z)/2. X (2) preklopí |0⟩ ↔ |1⟩, H (3) pošle štít na rovník (50 %). Relaxácia T₁ ho ťahá späť na |0⟩ — konaj rýchlo.', '<b>Ward = qubit.</b> Born’s Blade (4) hits with P(|1⟩) = (1 − z)/2. X (2) flips |0⟩ ↔ |1⟩, H (3) sends the ward to the equator (50%). T₁ relaxation pulls it back to |0⟩ — act fast.')}`;
    }
    if (this.ui.tf._h !== tf) {
      [...this.ui.tf.children].filter((c) => !c.classList.contains('wow-ffct')).forEach((c) => c.remove());
      this.ui.tf.insertAdjacentHTML('afterbegin', tf); this.ui.tf._h = tf;
    }
    this.ui.tf.classList.toggle('show', !!tf);
    // sledovanie úloh
    const q = QUESTS[s.q.i];
    let tr2 = '';
    if (!inst) {
      const nl = LEVELS.find((Lv) => Game.progress.stars[Lv.num] === undefined);
      if (nl) tr2 += `<div class="qt">${tr('Ďalší level', 'Next level')}</div><div class="qo">• ${nl.num} · ${nl.title}${Game.isUnlocked(nl.num) ? '' : ' 🔒'}</div>`;
      if (q && s.q.on) tr2 += `<div class="qt">${q.title}</div><div class="qo${s.q.k >= q.n ? ' done' : ''}">• ${MOB_TYPES[q.mob].name}: ${Math.min(s.q.k, q.n)}/${q.n}${s.q.k >= q.n ? ' ✔' : ''}</div>`;
      else if (q && Game.progress.introSeen) tr2 += `<div class="qo muted">${tr('Amplitúda má pre teba úlohu (!)', 'Amplitude has a quest for you (!)')}</div>`;
    }
    if (this.ui.track._h !== tr2) { this.ui.track.innerHTML = tr2; this.ui.track._h = tr2; }
    this.ui.track.classList.toggle('show', !!tr2);
    if (!inst) this.drawMini();
  },
  banner(text, cls, small = '') {
    const b = this.ui && this.ui.banner;
    if (!b) return;
    b.querySelector('b').textContent = text; b.querySelector('small').textContent = small;
    b.className = cls; void b.offsetWidth; b.classList.add('show');
  },
  drawMini() {
    const cv = this.ui.mini.querySelector('canvas'), g = cv.getContext('2d'), W = cv.width, R = W / 2, pl = this.pl(), sc = R / 30;
    const P = (p) => [R + (p[0] - pl.p[0]) * sc, R + (p[2] - pl.p[2]) * sc];
    g.clearRect(0, 0, W, W);
    g.save(); g.beginPath(); g.arc(R, R, R - 4, 0, 7); g.clip();
    g.fillStyle = '#1d4f78'; g.fillRect(0, 0, W, W);
    let [cx, cy] = P([0, 0, 0]);
    g.fillStyle = '#4c7a35'; g.beginPath(); g.arc(cx, cy, 35 * sc, 0, 7); g.fill();
    g.strokeStyle = '#8a6c45'; g.lineWidth = 2 * sc; g.beginPath(); g.arc(cx, cy, 20 * sc, 0, 7); g.stroke();
    g.fillStyle = '#9b958a'; g.beginPath(); g.arc(cx, cy, 4 * sc, 0, 7); g.fill();
    g.fillStyle = '#2e5a24'; for (const pn of Hub.pines) { const [x, y] = P(pn.p); g.beginPath(); g.arc(x, y, 1.1 * sc, 0, 7); g.fill(); }
    for (const pt of Hub.portals) {
      const [x, y] = P(pt.p), open = Game.isUnlocked(pt.L.num);
      g.fillStyle = open ? `rgb(${pt.L.color.map((c) => c * 255).join(',')})` : '#555'; g.beginPath(); g.arc(x, y, 2.2 * sc, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = `bold ${Math.round(3 * sc)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(pt.L.num, x, y);
    }
    for (const m of this.mobs) if (m.state !== 'dead') { const [x, y] = P(m.p); g.fillStyle = m === this.target ? '#ffd100' : '#ff3030'; g.beginPath(); g.arc(x, y, 1.1 * sc, 0, 7); g.fill(); }
    g.font = `bold ${Math.round(5 * sc)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const qm = this.questMark();
    if (qm) { g.fillStyle = qm === '…' ? '#aaa' : '#ffd100'; g.fillText(qm === '…' ? '?' : qm, cx, cy); }
    const nl = LEVELS.find((Lv) => Game.progress.stars[Lv.num] === undefined && Game.isUnlocked(Lv.num));
    if (nl) { const pt = Hub.portals.find((x) => x.L === nl), [x, y] = P(pt.npc); g.fillStyle = '#ffd100'; g.fillText('!', x, y - 2 * sc); }
    [cx, cy] = P(VENDOR_POS); g.font = `${Math.round(4 * sc)}px sans-serif`; g.fillText('💰', cx, cy);
    g.restore();
    // hráč: šípka v smere pohľadu
    g.save(); g.translate(R, R); g.rotate(-pl.heading + Math.PI);
    g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -9); g.lineTo(6, 7); g.lineTo(0, 3); g.lineTo(-6, 7); g.closePath(); g.fill(); g.stroke();
    g.restore();
    const z = this.ui.mini.querySelector('.zone'), zt = tr('Hilbertov ostrov', 'Hilbert Island') + (this.safe(pl.p) ? ` <small>(${tr('bezpečné', 'sanctuary')})</small>` : '');
    if (z._h !== zt) { z.innerHTML = zt; z._h = zt; }
  },

  toggleBags(force) {
    const b = this.ui.bags, show = force ?? !b.classList.contains('show');
    if (show !== b.classList.contains('show')) Sound.sfx(show ? 'bag' : 'close');
    b.classList.toggle('show', show);
    if (show) this.renderBags();
  },
  renderBags() {
    if (!this.ui) return;
    const s = this.S, b = this.ui.bags;
    b.querySelector('h3').textContent = tr('🎒 Taška a výstroj', '🎒 Bags and gear');
    const eq = b.querySelector('.eq'); eq.innerHTML = '';
    for (const sl of ['head', 'chest', 'weapon', 'trinket']) {
      const id = s.equip[sl], it = this.item(id), c = el('button', 'slot eqs' + (it ? '' : ' empty'), it ? it.icon : `<small>${SLOT_NAME[sl]}</small>`);
      if (it) { c.style.borderColor = QCOL[it.q]; c.dataset.tip = this.tipItem(id, `<div class="g">${tr('Klik = zložiť', 'Click = unequip')}</div>`); c.onclick = () => this.unequip(sl); }
      else c.dataset.tip = SLOT_NAME[sl];
      eq.appendChild(c);
    }
    const mnt = el('button', 'slot eqs' + (s.mount ? '' : ' empty'), s.mount ? '🔮' : `<small>${tr('Jazda', 'Mount')}</small>`);
    mnt.dataset.tip = s.mount ? this.tipItem('mount_bloch') : tr('Jazdecké zviera — kúpiš u Plancka.', 'Mount — buy one from Planck.');
    if (s.mount) mnt.onclick = () => this.press(SPELLS.find((x) => x.id === 'mount'));
    eq.appendChild(mnt);
    const grid = b.querySelector('.grid'); grid.innerHTML = '';
    for (let i = 0; i < 16; i++) {
      const sl = s.bags[i], c = el('button', 'slot' + (sl ? '' : ' empty'));
      if (sl) {
        const it = this.item(sl[0]);
        c.innerHTML = `${it.icon}${sl[1] > 1 ? `<span class="cnt">${sl[1]}</span>` : ''}`;
        c.style.borderColor = QCOL[it.q];
        c.onmouseenter = () => { c.dataset.tip = this.tipItem(sl[0], `<div class="g">${this.vendorOpen ? tr('Klik = predať', 'Click = sell') : it.slot ? tr('Klik = obliecť', 'Click = equip') : it.use || it.mount ? tr('Klik = použiť', 'Click = use') : tr('Predaj u obchodníka', 'Sell to a merchant')}</div>`); };
        c.onclick = () => (this.vendorOpen ? this.sell(i) : this.useItem(sl[0]));
      }
      grid.appendChild(c);
    }
    b.querySelector('.foot').innerHTML = `${s.bags.length}/16 · ${fmtMoney(s.money)}`;
  },
  openVendor() {
    if (this.dist(this.pl().p, VENDOR_POS) > 7) return this.err(tr('Si príliš ďaleko.', 'You are too far away.'));
    this.vendorOpen = true; this.ui.vendor.classList.add('show'); Sound.sfx('coin');
    this.renderVendor(); this.toggleBags(true);
  },
  closeVendor() { if (!this.ui) return; this.vendorOpen = false; this.ui.vendor.classList.remove('show'); this.renderBags(); },
  renderVendor() {
    if (!this.vendorOpen) return;
    const v = this.ui.vendor, s = this.S;
    v.querySelector('h3').innerHTML = `💰 Max Planck <small>— ${tr('Kvantové potreby', 'Quantum Provisions')}</small>`;
    const list = v.querySelector('.list'); list.innerHTML = '';
    for (const id of VENDOR_STOCK) {
      const it = this.item(id), have = it.mount && (s.mount || this.count(id)), row = el('button', 'vrow' + (s.money < it.buy || have ? ' poor' : ''));
      row.innerHTML = `<span class="slot" style="border-color:${QCOL[it.q]}">${it.icon}</span><span class="vn" style="color:${QCOL[it.q]}">${it.name}</span><span class="vp">${have ? tr('máš', 'owned') : fmtMoney(it.buy)}</span>`;
      row.dataset.tip = this.tipItem(id, `<div class="g">${tr('Klik = kúpiť', 'Click = buy')}</div>`);
      row.onclick = () => this.buy(id);
      list.appendChild(row);
    }
    const f = v.querySelector('.foot'); f.innerHTML = '';
    const sj = el('button', null, tr('Predať haraburdie', 'Sell junk')); sj.onclick = () => this.sellJunk();
    sj.dataset.tip = tr('Predá všetky šedé (bezcenné) predmety z tašky.', 'Sells every grey (poor) item in your bags.');
    f.append(sj, el('span', 'muted', tr(' Klik na predmet v taške = predaj.', ' Click an item in your bags = sell.')));
  },
  showLoot(B, items, coins) {
    const l = this.ui.loot;
    l.querySelector('h3').innerHTML = `${B.icon} ${tr('Korisť', 'Loot')}: ${B.name}`;
    const list = l.querySelector('.list'); list.innerHTML = '';
    for (const id of items) {
      const it = this.item(id), row = el('div', 'vrow');
      row.innerHTML = `<span class="slot" style="border-color:${QCOL[it.q]}">${it.icon}</span><span class="vn" style="color:${QCOL[it.q]}">${it.name}</span>`;
      row.dataset.tip = this.tipItem(id);
      list.appendChild(row);
    }
    list.appendChild(el('div', 'vrow', `<span class="slot">💰</span><span class="vn">${fmtMoney(coins)}</span>`));
    list.appendChild(el('p', 'muted', tr('Všetko je v taške (B). Výstroj si oblečieš klikom.', 'Everything is in your bags (B). Click gear to equip it.')));
    l.classList.add('show');
    Sound.sfx('loot');
    setTimeout(() => l.classList.remove('show'), 12000);
  },
};
