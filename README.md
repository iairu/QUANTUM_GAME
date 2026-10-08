# Psíčko v kvantovom svete

3D hra (WebGL2 = OpenGL ES 3.0, bez knižníc) na získanie **intuície** v kvantovom svete podľa prednášok 1–3:
jazykové vyjadrenia, symboly, správne obrazy a typické omyly — nie výpočty.

## Spustenie
Dvojklik na `index.html` (Chrome, Edge alebo Firefox). Netreba server ani inštaláciu.
Postup sa ukladá v prehliadači (localStorage).

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
| M | mapa · H pomoc · Esc zavrieť okná |
| F9 | odomknúť všetky levely (režim učiteľa) |

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
- `js/tips.js` slovník vysvetliviek · `js/content.js` kódex a jazykové pasce · `js/main.js` hub, kamera, hra
- `js/levels/*.js` jednotlivé levely, `registry.js` ich poradie
