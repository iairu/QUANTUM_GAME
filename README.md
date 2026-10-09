# Psíčko v kvantovom svete

3D hra (WebGL2 = OpenGL ES 3.0, bez knižníc) na získanie **intuície** v kvantovom svete podľa prednášok 1–3:
jazykové vyjadrenia, symboly, správne obrazy a typické omyly — nie výpočty.

## Spustenie
Dvojklik na `index.html` (Chrome, Edge alebo Firefox). Netreba server ani inštaláciu.
Postup sa ukladá v prehliadači (localStorage).

## Jazyk / Language
Hra je po slovensky, po anglicky a po ukrajinsky. Bez uloženej voľby sa jazyk určí podľa prehliadača: čeština a slovenčina → SK, ukrajinčina, ruština a bieloruština (ktorýkoľvek z jazykov prehliadača) → UA, všetky ostatné → EN.
Prepínač **SK / EN / UA** je vpravo hore aj na uvítacej obrazovke (zmena znovu načíta stránku, postup zostane uložený).
Texty sú v kóde ako `tr('slovensky', 'English', 'українською')` (`js/i18n.js`; chýbajúci ukrajinský text nahradí anglický); väčšie tabuľky majú anglickú a ukrajinskú verziu vedľa slovenskej (`CODEX_EN`/`CODEX_UK`, `TRAPS_EN`/`TRAPS_UK`, `TIPS_EN`/`TIPS_UK`, …), páry v zvitkoch a teórii sú trojice `[sk, en, uk]`.

*The game is in Slovak, English and Ukrainian. Without a saved choice, Czech and Slovak browsers get SK, browsers with Ukrainian, Russian or Belarusian among their languages get UA, everyone else EN. Switch with the SK / EN / UA selector in the top-right corner or on the welcome screen.*

## Témy
- V nastaveniach (⚙ → 🎨 Téma) sa volí **téma** hry; zmena znovu načíta hru, postup ostáva.
  - *⚔ MMO (World of Warcraft)* (predvolená v novej hre) — hrá sa ako MMO, obsah ostáva rovnaký (nižšie); aj 9. level s drakom.
  - *Klasická* — pôvodný modrý Hilbertov ostrov, 8 levelov.
  - *🐉 Severská (Skyrim)* — zasnežený ostrov, severské farby a písmo, detailné textúry a 9. level s drakom (nižšie).
- Hudba a zvukové efekty sú v oboch témach rovnaké.
- Každá téma má vlastný kurzor (šípka + varianta nad klikateľným; v MMO téme aj meč nad omylmi a bublina nad postavami). Počas otáčania kamery kurzor zmizne.

## MMO téma (⚔ World of Warcraft)
Dialógy, kvízy, levely, Kódex, Denník aj tlačidlá ostávajú rovnaké — mení sa spôsob hry (`js/wow.js`).
- **Postava:** Psíčko je kvantový mág s úrovňou (1–20), zdravím a *koherenciou* (manou), palicou a rúchom; mimo boja sa obnovuje. Medzerník = skok.
- **Lišta kúziel** (dole v strede, klávesy 1 … =): 1 Fázový šíp (zosielanie 1,6 s), 2 Pauliho preklopenie X, 3 Hadamard H, 4 Bornova čepeľ (meranie), 5 korekcia chýb (liečenie), 6 dekoherenčná vlna, 7 tunelovanie, 8/9 elixíry, 0 automatický útok, − jazdecká Blochova guľa, = návrat k Amplitúde. Globálny cooldown, cooldowny, cast bar, kúzla sa odomykajú s úrovňou.
- **Kvantový súboj:** každý nepriateľ má štít = qubit. Bornova čepeľ zasiahne s **P(|1⟩) = (1 − z)/2** (inak štít skolabuje na |0⟩), X ho preklopí, H pošle na rovník, dekoherenčná vlna zmrští Blochov vektor, relaxácia T₁ ho ťahá späť na |0⟩. Rám cieľa ukazuje P(|1⟩).
- **Nepriatelia = klasické omyly** (skryté premenné, biliardové elektróny, atómy-planetky, nadsvetelné signály, mačky mŕtve-aj-živé, kultisti vedomia); vysvetlivka každého vyvracia omyl. Sú **neutrálni** (žlté menovky): zaútočia až vtedy, keď ich napadneš. Slabé bližšie k stredu, silnejšie na okraji ostrova; stred a podstavce portálov sú bezpečné. Tab / klik = cieľ, pravý klik = útok, menovky so zdravím, plávajúce čísla, smrť → „Uvoľniť ducha“.
- **Úlohy:** mentori majú nad hlavou „!“ (ďalší level), Amplitúda zadáva 6 úloh na omyly („!“ / „?“), sledovanie úloh pod minimapou.
- **Obchodník Max Planck** pri fontáne: elixíry, výstroj (Intelekt, Výdrž), jazdecká Blochova guľa; predaj haraburdia. **Taška (B)** so 16 miestami a výstrojou; peniaze v zlatých/strieborných/medených.
- **Levely sú dungeony:** portály sú víry v kamenných oblúkoch s odporúčanou úrovňou. Boss levelu (napr. *Sčítač pravdepodobností*) stráca zdravie s každým krokom a správnou odpoveďou, nesprávna odpoveď je jeho úder. Po porážke padá korisť podľa hviezdičiek (★ zelená, ★★ modrá, ★★★ fialová), peniaze a skúsenosti. Drak Ketvarr je nájazd.
- Minimapa, nápis zóny, ukazovateľ skúseností, informačný kanál koristi, chybové hlásenia; slnečná lúka s cestami, listnaté stromy (pred kamerou sa spriehľadnia), fontána.

## Finále v severskej a MMO téme: drak Ketvarr (level 9)
- Nad Hilbertovým ostrovom krúži kvantový drak **Ketvarr**. Každý z 8 levelov naučí jedno *slovo moci*; s ôsmimi sa otvorí **Dračí štít** (portál 9 na severe, mentor Erwin Schrödinger).
- **Ťahová bitka** v 3 kolách: drakov štít je qubit (Blochova guľa), úder čepeľou je **meranie** pozdĺž zraniteľného miesta *n* — zásah s P = (1 + r·n)/2 a kolaps štítu. Hráč vykríkne jedno slovo (hradlá X, H, Z, S; od 2. kola impulz RABI-RA s uhlom θ, v 3. kole aj s osou φ), drak urobí **vopred ohlásený ťah** (rotácia okolo z, úder krídlom X, rev oblohy Y, hmla dekoherencie, presun srdca) a chrlí oheň.
- **Metrika:** draka zraní len úder s P(zásah) ≥ prah (ľahká/laická 80 %, normálna 90 %, ťažká 95 %). Tlačidlá ukazujú P(zásah) v ďalšom ťahu už aj s drakovým ťahom; po zranení drak štít prekuje. Na záver 3 otázky o tom, *prečo* si vyhral.
- Severský vzhľad: procedurálne textúry v shaderi (tundra so snehom, kameň, drevo, ihličie, dračie šupiny), borovice, menhiry, hory, sneženie, súmračná obloha s polárnou žiarou, písmo Cinzel.

## Zvuk a grafika
- **Hudba** (`js/audio.js`): generatívna, bez zvukových súborov — tichý bordún D + A, pomalé akordy v d mol (≈ 9 s na akord), riedka harfa v pentatonike s ozvenou, vzdialený roh a vietor. Bez bicích a náhlych zmien, aby pomáhala sústredeniu. Spustí sa pri prvom kliknutí alebo klávese (pravidlo prehliadačov).
- **Zvukové efekty**: tlačidlá, dialógy, listovanie, zvitky, mapa, denník, kódex, toasty, správna/nesprávna odpoveď, portál, dokončenie levelu a súboj s drakom (výkrik, čepeľ, oheň, rev).
- **🔊 / N** stlmí všetko; hlasitosť hudby a efektov je v nastaveniach (⚙).
- **Textúry** (len severská téma, nastavenia → 🖼): *automaticky* (vysoké len na výkonnejších počítačoch — aspoň 8 jadier a 8 GB, nie softvérové/mobilné GPU), *pôvodné*, alebo *vysoké rozlíšenie* (viac oktáv šumu, reliéf normál bez UV, lišajník, trblietanie snehu).

## Obťažnosť, nastavenia, ukladanie
- **Obťažnosť** (rozbaľovací zoznam vpravo hore, dá sa meniť kedykoľvek):
  - *🫶 Laická* (predvolená v novej hre) — mechanika ako ľahká, ale všetko bežnými slovami: pred každou úlohou kartička „po ľudsky“, odborné slová s prekladom v zátvorke, jednoduché vysvetlivky, úvod sprievodkyne o kvantových počítačoch (`js/layman.js`).
  - *Ľahká* — väčšie tolerancie, menej meraní, nápovedy, v kvízoch o jednu nesprávnu možnosť menej, väčšie písmo a zlaté kľúčové slová v texte.
  - *Normálna* — pôvodná hra; v paneli zbalený box „📐 Teória a rovnice“ s jadrom levelu.
  - *Ťažká* — viac poznatkov: rozbalená teória s rovnicami ku každej úlohe, 2 extra otázky s rovnicami na level, husté texty bez analógií; presnosť, náhodné ciele, bez nápovied, extra hádanky v leveli 3, prísnejšie hviezdičky.
  - *📜 Prastará* — ťažká + starobylé zvitky (história objavov: roky, autori, ich rozhovory a slávne výroky; zbierka v Kódexe → „📜 Zvitky“) a otázka z histórie v každom leveli.
- **👁 Pohľady** (V, kedykoľvek, v každej obťažnosti): ten istý stav ako hodinové ručičky amplitúd, Blochove rezy zboku a zhora, pravdepodobnosti v bázach Z/X/Y, mapa matice ρ (plocha = veľkosť, farba = fáza) a farebný zápis; α je všade modrá, β červená. Tlačidlo „👁 Ukáž to obrázkom“ v teórii otvorí pohľad k rovnici.
- **⚙ Nastavenia** (O): vizualizácie (mriežka sféry, projekcie ⟨X⟩⟨Y⟩⟨Z⟩, uhly θ/φ, stĺpce P(0)/P(1), stopa, grafy) a geometria zobrazenia (zorný uhol, veľkosť popiskov, priehľadnosť sféry, automatické otáčanie).
- Geometrické ovládanie v leveloch: voľné uhly magnetov (L2), geometrické laboratórium — ľubovoľný stav, rotácia R<sub>n</sub>(α), meranie pozdĺž osi m (L3), fázový posun φ (L4), sila poľa B₀ (L6).
- **Stav hry sa ukladá priebežne** do localStorage: postup, Kódex, Denník, rozohraný level aj s krokom, poloha na ostrove, jazyk, obťažnosť, nastavenia. Po znovunačítaní hra pokračuje tam, kde skončila.
- **Pomoc (H)** → *Odomknúť všetky levely* / *Reset hry* (zmaže postup, ponechá jazyk a nastavenia).

## Ovládanie
| kláves | akcia |
|---|---|
| WASD / šípky | pohyb po ostrove (Shift = rýchlejšie) |
| ťahanie myšou, koliesko | kamera |
| E | vstúpiť do portálu / hovoriť |
| Enter, medzerník | ďalej v dialógu |
| ← / Backspace | späť v dialógu |
| L | Denník — všetky rozhovory a vysvetlenia (prečítať / prehrať znova) |
| C | Kódex symbolov, osobností a pojmov |
| M | mapa · H pomoc · O nastavenia · V pohľady · Esc zavrieť okná |
| F9 | odomknúť všetky levely (režim učiteľa) — aj tlačidlom na konci okna Pomoc (H) |

Prejdením myšou nad čímkoľvek (tlačidlo, symbol, 3D objekt, podčiarknutý pojem v texte) sa zobrazí krátka vysvetlivka.

## Levely
1. **Komplexný prístav** (Euler) — amplitúda ako ručička, fáza, i² = −1, interferencia
2. **Sternova–Gerlachova pec** — dve stopy, ±ħ/2, postupné merania Z → X → Z, predpoveď cos²(θ/2)
3. **Blochovo observatórium** (Bloch) — hradlá X, Y, Z, H, S, T ako rotácie, relatívna vs. globálna fáza, meranie
4. **Chrám interferencie** (Feynman) — H·H vs. H·meranie·H, matica hustoty ρ, koherencie, dekoherencia
5. **Diracova knižnica** (Dirac) — gramatika bra-ket: stav, otázka, číslo, operátor, pravdepodobnosť
6. **Rabiho rezonátor** (Rabi, Zeeman) — NMR, precesia, rotujúci rámec, π/π-2 impulzy, rezonancia, T₂, ansámbel
7. **Bellov most** (Bell, Einstein) — Bellov stav, redukované stavy, nemožnosť signalizácie, CHSH hra
8. **Sieň výkladov** (Bohr, Kant, Wittgenstein, Stodola, Bohm, Heisenberg, Noether) — kolaps, komplementarita, interpretácie

Každý level končí **jazykovými pascami** (kvíz o správnych formuláciách); hviezdičky podľa počtu chýb.

## Štruktúra kódu
- `js/math.js` vektory, matice, komplexné čísla · `js/quantum.js` simulátor 1 a 2 qubitov
- `js/gl.js` renderer (shader, procedurálne siete, Blochova sféra) · `js/ui.js` dialógy, kvízy, denník, vysvetlivky
- `js/wow.js` MMO téma: postava, kúzla, nepriatelia, úlohy, obchodník, taška, korisť, bossovia, rámy jednotiek, minimapa
- `js/i18n.js` voľba jazyka a `tr()` · `js/settings.js` obťažnosť (`byDiff`) a nastavenia zobrazenia · `js/knowledge.js` teória a rovnice, extra otázky · `js/scrolls.js` starobylé zvitky · `js/views.js` pohľady 👁 · `js/tips.js` slovník vysvetliviek · `js/content.js` kódex a jazykové pasce · `js/main.js` hub, kamera, hra
- `js/levels/*.js` jednotlivé levely, `registry.js` ich poradie
