# Psíčko v kvantovom svete

3D hra (WebGL2 = OpenGL ES 3.0, bez knižníc) na získanie **intuície** v kvantovom svete podľa prednášok 1–3:
jazykové vyjadrenia, symboly, správne obrazy a typické omyly — nie výpočty.

## Spustenie
Dvojklik na `index.html` (Chrome, Edge alebo Firefox). Netreba server ani inštaláciu.
Postup sa ukladá v prehliadači (localStorage).

## Jazyk / Language
Hra je po slovensky a po anglicky. Bez uloženej voľby sa jazyk určí podľa prehliadača: čeština a slovenčina → SK, všetky ostatné → EN.
Prepínač **SK / EN** je vpravo hore (zmena znovu načíta stránku, postup zostane uložený).
Texty sú v kóde ako `tr('slovensky', 'English')` (`js/i18n.js`); väčšie tabuľky majú anglickú verziu vedľa slovenskej (`CODEX_EN`, `TRAPS_EN`, `TIPS_EN`, …).

*The game is in Slovak and English. Without a saved choice, Czech and Slovak browsers get SK, everyone else EN. Switch with the SK / EN selector in the top-right corner.*

## Obťažnosť, nastavenia, ukladanie
- **Obťažnosť** (rozbaľovací zoznam vpravo hore, dá sa meniť kedykoľvek):
  - *Ľahká* — väčšie tolerancie, menej meraní, nápovedy, v kvízoch o jednu nesprávnu možnosť menej, texty so zvýraznenými kľúčovými slovami.
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
- `js/i18n.js` voľba jazyka a `tr()` · `js/settings.js` obťažnosť (`byDiff`) a nastavenia zobrazenia · `js/knowledge.js` teória a rovnice, extra otázky · `js/scrolls.js` starobylé zvitky · `js/views.js` pohľady 👁 · `js/tips.js` slovník vysvetliviek · `js/content.js` kódex a jazykové pasce · `js/main.js` hub, kamera, hra
- `js/levels/*.js` jednotlivé levely, `registry.js` ich poradie
