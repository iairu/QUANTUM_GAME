'use strict';
// ∑ Doplň rovnicu: pred krokom levelu (normálna a ťažká obťažnosť) hráč najprv doplní chýbajúce časti rovnice kroku.
// Ľahká a laická tieto kvízy preskočia — rovnica sa ukáže hneď (karta „Rovnica najprv“, denník, panel teórie).
//  eq      — rovnica; ⟦n⟧ je n-té prázdne miesto (rozbaľovací zoznam)
//  blanks  — možnosti pre každé prázdne miesto; SPRÁVNA JE VŽDY PRVÁ (zobrazia sa zamiešané)
//  c       — kľúč kontextu v lang/*.csv (blanks.<c>): čo rovnica hovorí, aby bola správna práve jedna možnosť
//  src     — prednáška, z ktorej vzťah pochádza ('4' = prednáška 4, '1T' = tabuľa prednášky 1); ukáže sa v hlavičke
// Rovnica so slovami (zarámované vety) má preklad v lang/*.csv pod kľúčom blanks.<c>.eq; tu je slovenská predloha.
// Úrovne (všetky výrazy z PDF prednášok a tabúľ):
//  box     — výraz je v PDF zarámovaný: pýta sa vždy (normálna aj ťažká)
//  (nič)   — hlavná rovnica úlohy: normálna aj ťažká, ale z nich sa vyberie len niekoľko
//  hard    — nezarámovaný výraz: len ťažká, náhodný výber
//  d       — „ako sme sa dostali k zarámovanému výrazu?“ (medzikrok odvodenia): len ťažká a len niekedy
// Pravidlo: v každom zozname môže byť len jedna pravdivá možnosť. Napr. pri |r′| = ( ) nesmie byť popri |r| aj 1
// (pre čistý stav by platilo oboje), a pri Σ|k⟩⟨k| = ( ) nie je popri I aj číslo 1.

const W = tr; // slovné možnosti zarámovaných viet (sk, en, uk)

const EQ_BLANKS = {
  // ---------- 1 · Komplexný prístav (prednáška 1: diferenciálne rovnice, tabule 1 a 3) ----------
  1: {
    intro: [
      { c: '1.intro.0', eq: 'P = ⟦0⟧', blanks: [['|α|²', 'α²', '|α|', '2 Re α']], src: '2' },
      { c: '1.intro.1', eq: 'α = |α|·⟦0⟧', blanks: [['e<sup>iφ</sup>', 'e<sup>φ</sup>', 'cos φ', 'iφ']] },
      { c: '1.intro.2', eq: 'f′(x) = ⟦0⟧', blanks: [['f(x)', '−f(x)', 'f″(x)', '0']], box: 1, src: '1T' },
      { c: '1.intro.3', eq: 'a<sub>n+1</sub> = a<sub>n</sub> / ⟦0⟧', blanks: [['(n + 1)', 'n', '(n + 1)!', '(n + 2)(n + 1)']], box: 1, src: '1' },
      { c: '1.intro.4', eq: 'x(t) = a₀ ⟦0⟧ = ⟦1⟧ e<sup>t</sup>', blanks: [['e<sup>t</sup>', 'e<sup>−t</sup>', 'cos t', 'e<sup>it</sup>'], ['x₀', 'a₁', 'ẋ(0)', '1/x₀']], box: 1, src: '1' },
      { c: '1.intro.5', eq: 's = s₀ + ⟦0⟧', blanks: [['vt', 'v/t', 'at²', 's₀t']], box: 1, src: '1T' },
      { c: '1.intro.6', eq: 'ds/dt = ⟦0⟧', blanks: [['v', 's', 's₀', 'vt']], hard: 1, src: '1T' },
      { c: '1.intro.7', eq: 'ẋ(t) = Σ<sub>n=0</sub><sup>∞</sup> ⟦0⟧ a<sub>n+1</sub> t<sup>n</sup>', blanks: [['(n + 1)', 'n', '(n − 1)', '1/(n + 1)']], d: 1, src: '1' },
      { c: '1.intro.8', eq: 'a<sub>n</sub> = a₀ / ⟦0⟧', blanks: [['n!', 'n', '2<sup>n</sup>', '(n + 1)']], d: 1, src: '1' },
      { c: '1.intro.9', eq: '0! ≡ ⟦0⟧', blanks: [['1', '0', '∞', '−1']], d: 1, src: '1' },
    ],
    setHand: [
      { c: '1.setHand.0', eq: '|e<sup>iφ</sup>α| = ⟦0⟧', blanks: [['|α|', '|α|²', 'φ|α|', 'e<sup>iφ</sup>|α|']] },
      { c: '1.setHand.1', eq: 'f″(x) = ⟦0⟧', blanks: [['−f(x)', 'f(x)', 'f′(x)', '0']], box: 1, src: '1T' },
      { c: '1.setHand.2', eq: 'a<sub>n+2</sub> = −a<sub>n</sub> / ⟦0⟧', blanks: [['(n + 2)(n + 1)', '(n + 1)', '(n + 2)!', '2(n + 1)']], box: 1, src: '1' },
      { c: '1.setHand.3', eq: 'x(t) = a₀ ⟦0⟧ + a₁ ⟦1⟧', blanks: [['cos t', 'sin t', 'e<sup>t</sup>', 'e<sup>−t</sup>'], ['sin t', 'cos t', 'e<sup>t</sup>', 't']], box: 1, src: '1' },
      { c: '1.setHand.4', eq: 'T<sub>p+1</sub>(x) = ⟦0⟧ T<sub>p</sub>(x) − T<sub>p−1</sub>(x), &nbsp; T<sub>p</sub>(x) = cos(p ⟦1⟧)', blanks: [['2x', 'x', '2p', 'x²'], ['arccos x', 'x', 'arcsin x', 'cos x']], box: 1, src: '1' },
      { c: '1.setHand.5', eq: 'x(0) = a₀, &nbsp; ẋ(0) = ⟦0⟧', blanks: [['a₁', 'a₀', '0', '2a₂']], hard: 1, src: '1' },
      { c: '1.setHand.6', eq: 'x(t) = Re(C e<sup>it</sup>), &nbsp; C = ⟦0⟧', blanks: [['a₀ − ia₁', 'a₀ + ia₁', 'a₀a₁', 'ia₀ − a₁']], hard: 1, src: '1' },
      { c: '1.setHand.7', eq: 'ẍ(t) = Σ<sub>n=0</sub><sup>∞</sup> ⟦0⟧ a<sub>n+2</sub> t<sup>n</sup>', blanks: [['(n + 2)(n + 1)', 'n(n − 1)', '(n + 1)', '(n + 2)']], d: 1, src: '1' },
      { c: '1.setHand.8', eq: 'a<sub>2k</sub> = (−1)<sup>k</sup> a₀ / ⟦0⟧', blanks: [['(2k)!', 'k!', '(2k + 1)!', '2k']], d: 1, src: '1' },
      { c: '1.setHand.9', eq: 'T₀(x) = 1, &nbsp; T₁(x) = ⟦0⟧', blanks: [['x', '2x', '1', 'x²']], d: 1, src: '1' },
    ],
    timesI: [
      { c: '1.timesI.0', eq: 'i² = ⟦0⟧', blanks: [['−1', '1', 'i', '−i']], src: '1' },
      { c: '1.timesI.1', eq: 'i = ⟦0⟧', blanks: [['e<sup>iπ/2</sup>', 'e<sup>iπ</sup>', 'e<sup>−iπ/2</sup>', 'e<sup>2πi</sup>']] },
      { c: '1.timesI.2', eq: 'e<sup>iπ</sup> + ⟦0⟧ = 0', blanks: [['1', 'i', 'π', '−1']], hard: 1 },
      { c: '1.timesI.3', eq: 'e<sup>it</sup> = cos t + ⟦0⟧', blanks: [['i sin t', 'sin t', '−i sin t', 'i cos t']], box: 1, src: '1' },
      { c: '1.timesI.4', eq: 'z<sup>n</sup> = |z|<sup>n</sup> {cos(⟦0⟧) + i sin(nφ)}', blanks: [['nφ', 'φ', 'φ/n', 'φ<sup>n</sup>']], box: 1, src: '3T' },
      { c: '1.timesI.5', eq: 'i² = |i|² {cos(2·⟦0⟧) + i sin(2·π/2)} = −1', blanks: [['π/2', 'π', 'π/4', '2π']], box: 1, src: '3T' },
      { c: '1.timesI.6', eq: 'i³ = ⟦0⟧, &nbsp; i⁴ = ⟦1⟧', blanks: [['−i', 'i', '−1', '1'], ['1', '−1', 'i', '−i']], hard: 1, src: '1' },
      { c: '1.timesI.7', eq: '|z|² = (a + ib)(a − ib) = ⟦0⟧', blanks: [['a² + b²', 'a² − b²', 'a² + 2iab − b²', '(a + b)²']], hard: 1, src: '2T' },
      { c: '1.timesI.8', eq: 'e<sup>it</sup> = Σ<sub>n=0</sub><sup>∞</sup> ⟦0⟧ / n!', blanks: [['(it)<sup>n</sup>', 'it<sup>n</sup>', 't<sup>n</sup>', '(−t)<sup>n</sup>']], d: 1, src: '1' },
      { c: '1.timesI.9', eq: '<sup>n</sup>√z = |z|<sup>1/n</sup> {cos((φ + 2kπ)/⟦0⟧) + i sin((φ + 2kπ)/n)}', blanks: [['n', '2', 'k', '2n']], d: 1, src: '3T' },
      { c: '1.timesI.10', eq: '√i = ⟦0⟧ (1 + i) &nbsp; (k = 0)', blanks: [['√2/2', '½', '√2', '1']], d: 1, src: '3T' },
      { c: '1.timesI.11', eq: 'x<sub>1,2</sub> = (−b ± √⟦0⟧) / 2a', blanks: [['(b² − 4ac)', '(b² + 4ac)', '(4ac − b²)', '(b − 4ac)']], d: 1, src: '3T' },
    ],
    interference: [
      { c: '1.interference.0', eq: '|A₁ + A₂|² = |A₁|² + |A₂|² + ⟦0⟧', blanks: [['2 Re(A₁A₂*)', '2 A₁A₂', '|A₁A₂|', '0']], src: '2' },
      { c: '1.interference.1', eq: 'P = ½(1 + cos Δφ) = ⟦0⟧', blanks: [['cos²(Δφ/2)', 'sin²(Δφ/2)', 'cos²(Δφ)', '½ cos Δφ']], hard: 1 },
      { c: '1.interference.2', eq: 'a<sub>n+2</sub> = −⟦0⟧ a<sub>n</sub> / ((n + 2)(n + 1))', blanks: [['2(r − n)', '2(r + n)', '(r − n)', '2rn']], box: 1, src: '1' },
      { c: '1.interference.3', eq: 'H<sub>m+1</sub>(ξ) = 2ξH<sub>m</sub>(ξ) − ⟦0⟧ H<sub>m−1</sub>(ξ)', blanks: [['2m', 'm', '2ξ', '2(m + 1)']], box: 1, src: '1' },
      { c: '1.interference.4', eq: 'H₀ = 1, &nbsp; H₁ = 2ξ, &nbsp; H₂ = ⟦0⟧', blanks: [['4ξ² − 2', '4ξ²', '2ξ² − 1', '4ξ² + 2']], hard: 1, src: '1' },
      { c: '1.interference.5', eq: 'r = ⟦0⟧, &nbsp; m = 0, 1, 2, …', blanks: [['m', 'm + ½', '2m', 'm²']], hard: 1, src: '1' },
      { c: '1.interference.6', eq: 'ψ(ξ) = ⟦0⟧ y(ξ)', blanks: [['e<sup>−ξ²/2</sup>', 'e<sup>ξ²/2</sup>', 'e<sup>−ξ</sup>', 'cos ξ']], d: 1, src: '1' },
    ],
  },
  // ---------- 2 · Sternova–Gerlachova pec (prednášky 2 a 3: qubit podľa Carrolla, spin) ----------
  2: {
    intro: [
      { c: '2.intro.0', eq: 'S<sub>z</sub> = ⟦0⟧', blanks: [['±ħ/2', '±ħ', '±h/2', '0, ±ħ/2']], box: 1, src: '4' },
      { c: '2.intro.1', eq: 'F<sub>z</sub> = μ<sub>z</sub> · ⟦0⟧', blanks: [['∂B<sub>z</sub>/∂z', 'B<sub>z</sub>', '∂z/∂B<sub>z</sub>', 'μ<sub>z</sub>B<sub>z</sub>']] },
      { c: '2.intro.2', eq: 'ħ = ⟦0⟧', blanks: [['h/2π', '2πh', 'h/π', 'h²']], hard: 1 },
      { c: '2.intro.3', eq: '⟨0|1⟩ = ⟦0⟧', blanks: [['0', '1', '−1', '½']], box: 1, src: '2' },
      { c: '2.intro.4', eq: 'W<sub>μ</sub>W<sup>μ</sup> = −m²c² ⟦0⟧ ħ²', blanks: [['s(s + 1)', 's²', 's', '(2s + 1)']], d: 1, src: '3' },
    ],
    twoSpots: [
      { c: '2.twoSpots.0', eq: 'ρ = ½|0⟩⟨0| + ½|1⟩⟨1| = ⟦0⟧', blanks: [['I/2', 'I', '|+⟩⟨+|', '0']], src: '2' },
      { c: '2.twoSpots.1', eq: '|ψ⟩ = α|0⟩ + β|1⟩, &nbsp; α, β ∈ ℂ, &nbsp; |α|² + |β|² = ⟦0⟧', blanks: [['1', '0', '2', '|ψ|']], box: 1, src: '2' },
      { c: '2.twoSpots.2', eq: 'P(0) = |⟨0|ψ⟩|² = ⟦0⟧, &nbsp; P(1) = |⟨1|ψ⟩|² = |β|²', blanks: [['|α|²', 'α', '|β|²', '⟨0|ψ⟩']], box: 1, src: '2' },
      { c: '2.twoSpots.3', eq: 'P(b = 0) = p, &nbsp; P(b = 1) = ⟦0⟧', blanks: [['1 − p', 'p', '½', 'p²']], hard: 1, src: '2' },
      { c: '2.twoSpots.4', eq: '⟨ψ|ψ⟩ = (α*⟨0| + β*⟨1|)(α|0⟩ + β|1⟩) = ⟦0⟧', blanks: [['|α|² + |β|²', 'α² + β²', '2 Re(α*β)', 'αβ*']], d: 1, src: '2' },
    ],
    sequences: [
      { c: '2.sequences.0', eq: '|±x⟩ = (|0⟩ ⟦0⟧ |1⟩)/⟦1⟧', blanks: [['±', '·', '×', '⊗'], ['√2', '2', '½', '1']], src: '2' },
      { c: '2.sequences.1', eq: '|⟨0|+x⟩|² = ⟦0⟧', blanks: [['½', '1/√2', '1', '0']], src: '2' },
      { c: '2.sequences.2', eq: '|0⟩ = (|+⟩ ⟦0⟧ |−⟩)/√2', blanks: [['+', '−', '⊗', '·']], hard: 1, src: '2' },
      { c: '2.sequences.3', eq: '⟨+|−⟩ = ⟦0⟧', blanks: [['0', '1', '½', '1/√2']], hard: 1, src: '2' },
    ],
    predict: [
      { c: '2.predict.0', eq: 'P(+n) = cos²(⟦0⟧) = (1 + cos ϑ)/2', blanks: [['ϑ/2', 'ϑ', '2ϑ', 'ϑ/4']] },
      { c: '2.predict.1', eq: 'P<sub>X</sub>(+) = |⟨+|ψ<sub>φ</sub>⟩|² = (1 + ⟦0⟧)/2', blanks: [['cos φ', 'sin φ', 'cos²φ', 'φ']], hard: 1, src: '2' },
    ],
  },
  // ---------- 3 · Blochovo observatórium (prednáška 4, dodatok B prednášky 2) ----------
  3: {
    intro: [
      { c: '3.intro.0', eq: '|ψ⟩ = cos(⟦0⟧)|0⟩ + e<sup>iφ</sup> sin(θ/2)|1⟩', blanks: [['θ/2', 'θ', '2θ', 'φ/2']], box: 1, src: '4' },
      { c: '3.intro.1', eq: 'r = (sin θ cos φ, sin θ sin φ, ⟦0⟧)', blanks: [['cos θ', 'sin θ', 'cos φ', 'cos(θ/2)']], box: 1, src: '4' },
      { c: '3.intro.2', eq: '|ψ⟩ &nbsp;a&nbsp; ⟦0⟧|ψ⟩ &nbsp;sú ten istý stav', blanks: [['e<sup>iγ</sup>', 'e<sup>γ</sup>', 'γ²', '2γ']], hard: 1, src: '4' },
      { c: '3.intro.3', eq: '|0⟩: r = (0, 0, ⟦0⟧), &nbsp; |1⟩: r = (0, 0, ⟦1⟧)', blanks: [['1', '−1', '0', '½'], ['−1', '1', '0', '−½']], hard: 1, src: '4' },
      { c: '3.intro.4', eq: '|+i⟩ = (|0⟩ + ⟦0⟧|1⟩)/√2', blanks: [['i', '−i', '1', '−1']], hard: 1, src: '4' },
    ],
    puzzles: [
      { c: '3.puzzles.0', eq: 'H = (X + ⟦0⟧)/√2', blanks: [['Z', 'Y', 'I', 'X']], src: '4' },
      { c: '3.puzzles.1', eq: 'HXH = ⟦0⟧', blanks: [['Z', 'X', 'Y', 'I']] },
      { c: '3.puzzles.2', eq: 'XY = ⟦0⟧', blanks: [['iZ', 'Z', '−iZ', 'I']], hard: 1 },
      { c: '3.puzzles.3', eq: 'X : rotácia o ⟦0⟧ okolo osi ⟦1⟧', blanks: [['180°', '90°', '360°', '45°'], ['x', 'y', 'z', 'x + z']], box: 1, src: '4' },
      { c: '3.puzzles.4', eq: '(r<sub>x</sub>, r<sub>y</sub>, r<sub>z</sub>) →<sup>H</sup> (r<sub>z</sub>, ⟦0⟧, r<sub>x</sub>)', blanks: [['−r<sub>y</sub>', 'r<sub>y</sub>', '0', 'r<sub>x</sub>']], box: 1, src: '2' },
      { c: '3.puzzles.5', eq: 'Y ∼ R<sub>y</sub>(⟦0⟧), &nbsp; Z ∼ R<sub>z</sub>(π)', blanks: [['π', 'π/2', '2π', 'π/4']], hard: 1, src: '4' },
      { c: '3.puzzles.6', eq: 'H = (1/√2) [1, 1; 1, ⟦0⟧]', blanks: [['−1', '1', '0', 'i']], hard: 1, src: '2' },
      { c: '3.puzzles.7', eq: 'Z|+⟩ = ⟦0⟧', blanks: [['|−⟩', '|+⟩', '|1⟩', '|0⟩']], hard: 1, src: '4' },
      { c: '3.puzzles.8', eq: 'R<sub>n</sub>(π) = exp(−i(π/2) n·σ) = ⟦0⟧', blanks: [['−iH', 'H', 'iX', '−H']], d: 1, src: '2' },
      { c: '3.puzzles.9', eq: 'H|+i⟩ ∼ ⟦0⟧', blanks: [['|−i⟩', '|+i⟩', '|0⟩', '|−⟩']], d: 1, src: '2' },
      { c: '3.puzzles.10', eq: 'R<sub>x</sub>(π/2) R<sub>x</sub>(π/2) = ⟦0⟧', blanks: [['R<sub>x</sub>(π)', 'R<sub>x</sub>(π/4)', 'I', 'R<sub>z</sub>(π)']], d: 1, src: '4' },
    ],
    measure: [
      { c: '3.measure.0', eq: 'P(1) = |β|² = ⟦0⟧', blanks: [['sin²(θ/2)', 'cos²(θ/2)', 'sin θ', 'sin²θ']], src: '4' },
      { c: '3.measure.1', eq: '⟨Z⟩ = P(0) − P(1) = ⟦0⟧', blanks: [['cos θ', 'sin θ', 'cos²(θ/2)', '0']] },
      { c: '3.measure.2', eq: '⟨S<sub>z</sub>⟩ = (ħ/2) ⟦0⟧', blanks: [['cos θ', 'sin θ', 'cos(θ/2)', 'cos²θ']], box: 1, src: '4' },
      { c: '3.measure.3', eq: 'θ = π/3 &nbsp;⇒&nbsp; ⟨S<sub>z</sub>⟩ = ⟦0⟧', blanks: [['ħ/4', 'ħ/2', 'ħ/(2√2)', '0']], hard: 1, src: '4' },
      { c: '3.measure.4', eq: '⟨S<sub>z</sub>⟩ = P<sub>+</sub>(ħ/2) + P<sub>−</sub>(⟦0⟧)', blanks: [['−ħ/2', 'ħ/2', '0', '−ħ']], d: 1, src: '4' },
      { c: '3.measure.5', eq: 'cos²(θ/2) − sin²(θ/2) = ⟦0⟧', blanks: [['cos θ', 'sin θ', '1', 'cos 2θ']], d: 1, src: '4' },
    ],
    lab: [
      { c: '3.lab.0', eq: 'P(+m) = (1 + ⟦0⟧)/2', blanks: [['r·m', '|r|', 'r × m', '|m|']] },
      { c: '3.lab.1', eq: '⟨S<sub>y</sub>⟩ = (ħ/2) sin θ ⟦0⟧', blanks: [['sin φ', 'cos φ', 'cos θ', 'sin θ']], box: 1, src: '4' },
      { c: '3.lab.2', eq: 'P<sub>x</sub>(+) = (1 + ⟦0⟧)/2, &nbsp; P<sub>x</sub>(−) = (1 − r<sub>x</sub>)/2', blanks: [['r<sub>x</sub>', 'r<sub>z</sub>', 'r<sub>y</sub>', '|r|']], hard: 1, src: '4' },
    ],
  },
  // ---------- 4 · Chrám interferencie (prednáška 2: kvantové manipulácie) ----------
  4: {
    intro: [
      { c: '4.intro.0', eq: 'ρ = ½(I + ⟦0⟧)', blanks: [['r·σ', 'r', 'σ', '|r|']], box: 1, src: '4' },
      { c: '4.intro.1', eq: 'Tr ρ² = (⟦0⟧ + |r|²)/⟦1⟧', blanks: [['1', '0', '2', '|r|'], ['2', '4', '1', '√2']], src: '5' },
      { c: '4.intro.2', eq: 'qubit = pravdepodobnosti + ⟦0⟧ + možnosť interferencie', blanks: [[W('relatívna fáza', 'relative phase', 'відносна фаза'), W('globálna fáza', 'global phase', 'глобальна фаза'), W('skrytá hodnota', 'hidden value', 'прихована величина'), W('kópia stavu', 'a copy of the state', 'копія стану')]], box: 1, src: '2' },
      { c: '4.intro.3', eq: 'ρ = ½ [1 + r<sub>z</sub>, r<sub>x</sub> − ir<sub>y</sub>; ⟦0⟧, 1 − r<sub>z</sub>]', blanks: [['r<sub>x</sub> + ir<sub>y</sub>', 'r<sub>x</sub> − ir<sub>y</sub>', 'r<sub>z</sub>', '0']], hard: 1, src: '4' },
      { c: '4.intro.4', eq: 'zmiešaný stav: |r| ⟦0⟧ 1', blanks: [['<', '=', '>', '≥']], hard: 1, src: '4' },
    ],
    pure: [
      { c: '4.pure.0', eq: 'H·H = ⟦0⟧', blanks: [['I', 'H', 'X', '0']], src: '2' },
      { c: '4.pure.1', eq: 'superpozícia + zachovaná fáza ⇒ ⟦0⟧', blanks: [[W('interferencia', 'interference', 'інтерференція'), W('dekoherencia', 'decoherence', 'декогеренція'), W('kolaps', 'collapse', 'колапс'), W('klasická zmes', 'a classical mixture', 'класична суміш')]], box: 1, src: '2' },
      { c: '4.pure.2', eq: 'H|1⟩ = (|0⟩ ⟦0⟧ |1⟩)/√2', blanks: [['−', '+', '+ i', '− i']], hard: 1, src: '2' },
      { c: '4.pure.3', eq: 'ρ<sub>+</sub> = |+⟩⟨+| = ½ [1, ⟦0⟧; 1, 1]', blanks: [['1', '0', '−1', '½']], hard: 1, src: '2' },
      { c: '4.pure.4', eq: 'H(H|0⟩) = ½[(|0⟩ + |1⟩) + (|0⟩ ⟦0⟧ |1⟩)] = |0⟩', blanks: [['−', '+', '⊗', '+ i']], d: 1, src: '2' },
      { c: '4.pure.5', eq: 'ρ₀₁ = ρ₁₀ = ⟦0⟧ &nbsp; (stav |+⟩)', blanks: [['½', '0', '1', '1/√2']], d: 1, src: '2' },
    ],
    withMeasure: [
      { c: '4.withMeasure.0', eq: 'ρ → Σ<sub>k</sub> P<sub>k</sub> ρ ⟦0⟧', blanks: [['P<sub>k</sub>', 'ρ', 'I', 'U']] },
      { c: '4.withMeasure.1', eq: 'meranie ⇒ strata koherencie ⇒ ⟦0⟧', blanks: [[W('bez interferencie', 'no interference', 'без інтерференції'), W('silnejšia interferencia', 'stronger interference', 'сильніша інтерференція'), W('čistý stav', 'a pure state', 'чистий стан'), W('previazanosť', 'entanglement', 'заплутаність')]], box: 1, src: '2' },
      { c: '4.withMeasure.2', eq: 'P(0) = P(1) = ⟦0⟧', blanks: [['½', '1', '0', '1/√2']], box: 1, src: '2' },
      { c: '4.withMeasure.3', eq: 'H ρ<sub>mix</sub> H† = H (I/2) H† = ⟦0⟧', blanks: [['I/2', 'I', '|+⟩⟨+|', 'H/2']], hard: 1, src: '2' },
      { c: '4.withMeasure.4', eq: 'pravdepodobnostný bit = ⟦0⟧', blanks: [[W('pravdepodobnosti výsledkov', 'outcome probabilities', 'ймовірності результатів'), W('pravdepodobnosti + relatívna fáza', 'probabilities + relative phase', 'ймовірності + відносна фаза'), W('amplitúdy', 'amplitudes', 'амплітуди'), W('jedna istá hodnota', 'one certain value', 'одне певне значення')]], box: 1, src: '2' },
    ],
    deco: [
      { c: '4.deco.0', eq: 'ρ₀₁ → ⟦0⟧ e<sup>−iφ</sup> ρ₀₁', blanks: [['(1 − p)', 'p', '(1 + p)', 'p²']] },
      { c: '4.deco.1', eq: 'P(0) = ½(1 + (1 − p) ⟦0⟧)', blanks: [['cos φ', 'sin φ', 'cos²φ', 'φ']], hard: 1 },
      { c: '4.deco.2', eq: 'dekoherencia: |r| → ⟦0⟧', blanks: [['0', '1', '∞', '|r|²']], hard: 1, src: '4' },
    ],
  },
  // ---------- 5 · Diracova knižnica (prednáška 3: Diracova notácia, tabule 2 a 3) ----------
  5: {
    intro: [
      { c: '5.intro.0', eq: '⟨φ|ψ⟩ = ⟦0⟧', blanks: [['⟨ψ|φ⟩*', '⟨ψ|φ⟩', '−⟨ψ|φ⟩', '|ψ⟩⟨φ|']], src: '3' },
      { c: '5.intro.1', eq: 'Σ<sub>k</sub> |k⟩⟨k| = ⟦0⟧', blanks: [['I', '0', '|0⟩', '⟨k|k⟩']], box: 1, src: '3' },
      { c: '5.intro.2', eq: '|ψ⟩ = Σ<sub>n</sub> |n⟩⟦0⟧', blanks: [['⟨n|ψ⟩', '⟨ψ|n⟩', '|ψ⟩', '⟨n|n⟩']], box: 1, src: '3' },
      { c: '5.intro.3', eq: 'ψ(x) = ⟦0⟧', blanks: [['⟨x|ψ⟩', '⟨ψ|x⟩', '|x⟩⟨x|', '⟨x|x⟩']], box: 1, src: '3' },
      { c: '5.intro.4', eq: 'abstraktný stav |ψ⟩ ⟶ reprezentácia ⟦0⟧', blanks: [['⟨' + W('báza', 'basis', 'базис') + '|ψ⟩', '|ψ⟩⟨' + W('báza', 'basis', 'базис') + '|', '⟨ψ|ψ⟩', '|ψ|²']], box: 1, src: '3' },
      { c: '5.tasks.2', eq: '∫ |x⟩⟨x| dx = ⟦0⟧', blanks: [['Î', '0', 'δ(x)', '|ψ⟩']], box: 1, src: '3' },
      { c: '5.intro.5', eq: '⟨ψ| = ⟦0⟧', blanks: [['|ψ⟩†', '|ψ⟩*', '|ψ⟩ᵀ', '−|ψ⟩']], hard: 1, src: '3' },
      { c: '5.intro.6', eq: '⟨φ|ψ⟩ = φ₁*ψ₁ + ⟦0⟧', blanks: [['φ₂*ψ₂', 'φ₂ψ₂*', 'φ₂ψ₂', 'φ₁*ψ₂']], hard: 1, src: '3' },
      { c: '5.intro.7', eq: '⟨i|j⟩ = ⟦0⟧', blanks: [['δ<sub>ij</sub>', '1', '0', 'i·j']], hard: 1, src: '3' },
      { c: '5.intro.8', eq: '|ψ⟩ = α|φ⟩ + β|χ⟩ &nbsp;⇒&nbsp; ⟨ψ| = α*⟨φ| + ⟦0⟧⟨χ|', blanks: [['β*', 'β', '−β', '|β|']], d: 1, src: '3' },
      { c: '5.intro.9', eq: '|ψ⟩⟨φ| = [ψ₁φ₁*, ψ₁φ₂*; ψ₂φ₁*, ⟦0⟧]', blanks: [['ψ₂φ₂*', 'φ₂ψ₂*', 'ψ₂φ₂', 'ψ₁φ₁*']], d: 1, src: '3T' },
    ],
    tasks: [
      { c: '5.tasks.0', eq: '⟨A⟩ = ⟨ψ|A|ψ⟩ = ⟦0⟧', blanks: [['Tr(ρA)', 'Tr ρ', '⟨ψ|ψ⟩', 'ρA']], src: '3' },
      { c: '5.tasks.1', eq: 'P² = ⟦0⟧', blanks: [['P', 'I', '0', '2P']] },
      { c: '5.tasks.3', eq: '|ψ⟩ = ∫ ⟦0⟧ |x⟩ dx', blanks: [['ψ(x)', 'ψ*(x)', '⟨ψ|x⟩', '|x⟩']], box: 1, src: '3' },
      { c: '5.tasks.4', eq: 'c<sub>n</sub> = ⟦0⟧ &nbsp;↔&nbsp; ψ(x) = ⟨x|ψ⟩', blanks: [['⟨n|ψ⟩', '⟨ψ|n⟩', '|n⟩⟨n|', '⟨n|n⟩']], box: 1, src: '3' },
      { c: '5.tasks.5', eq: '⟨x|x′⟩ = ⟦0⟧', blanks: [['δ(x − x′)', '1', '0', 'x − x′']], box: 1, src: '3' },
      { c: '5.tasks.6', eq: '∫ g<sub>n</sub>(x) g<sub>l</sub>(x) dx = ⟦0⟧', blanks: [['δ<sub>nl</sub>', '1', '0', 'g<sub>n</sub>g<sub>l</sub>']], box: 1, src: '2T' },
      { c: '5.tasks.7', eq: 'f(x) = Σ<sub>n</sub> a<sub>n</sub> g<sub>n</sub>(x) &nbsp;⇒&nbsp; ∫ f(x) g<sub>l</sub>(x) dx = ⟦0⟧', blanks: [['a<sub>l</sub>', 'g<sub>l</sub>', '1', 'f(l)']], box: 1, src: '2T' },
      { c: '5.tasks.8', eq: 'Â|a⟩ = ⟦0⟧', blanks: [['a|a⟩', '|a⟩', 'a', '⟨a|']], hard: 1, src: '3' },
      { c: '5.tasks.9', eq: 'A<sub>ij</sub> = ⟦0⟧', blanks: [['⟨i|Â|j⟩', '⟨j|Â|i⟩', '⟨i|j⟩', '|i⟩⟨j|']], hard: 1, src: '3' },
      { c: '5.tasks.10', eq: '⟨Z⟩ = ⟨ψ|Z|ψ⟩ = ⟦0⟧', blanks: [['|α|² − |β|²', '|α|² + |β|²', '2 Re(α*β)', '|α|²']], hard: 1, src: '3' },
      { c: '5.tasks.11', eq: 'P(a<sub>n</sub>) = ⟦0⟧', blanks: [['|⟨a<sub>n</sub>|ψ⟩|²', '⟨a<sub>n</sub>|ψ⟩', '|⟨a<sub>n</sub>|ψ⟩|', '⟨ψ|a<sub>n</sub>⟩']], hard: 1, src: '3' },
      { c: '5.tasks.12', eq: 'ρ = ⟦0⟧ &nbsp; (čistý stav)', blanks: [['|ψ⟩⟨ψ|', '⟨ψ|ψ⟩', '|ψ⟩', '|ψ|²']], hard: 1, src: '3' },
      { c: '5.tasks.13', eq: '|0⟩ ⊗ |1⟩ = ⟦0⟧', blanks: [['|01⟩', '|10⟩', '|00⟩', '|11⟩']], hard: 1, src: '3' },
      { c: '5.tasks.14', eq: 'Z|0⟩ = |0⟩, &nbsp; Z|1⟩ = ⟦0⟧', blanks: [['−|1⟩', '|1⟩', '|0⟩', '0']], hard: 1, src: '3' },
      { c: '5.tasks.15', eq: 'ψ̃(p) = ⟦0⟧', blanks: [['⟨p|ψ⟩', '⟨x|ψ⟩', '⟨ψ|p⟩', 'ψ(x)']], hard: 1, src: '3' },
      { c: '5.tasks.16', eq: 'f(x) = Σ<sub>n=0</sub><sup>∞</sup> a<sub>n</sub> ⟦0⟧', blanks: [['g<sub>n</sub>(x)', 'a<sub>n</sub>', 'δ<sub>nl</sub>', 'f(n)']], d: 1, src: '2T' },
    ],
  },
  // ---------- 6 · Rabiho rezonátor (prednáška 3: Rabiho oscilácie, prednáška 4: Zeemanov Hamiltonián) ----------
  6: {
    intro: [
      { c: '6.intro.0', eq: 'ω₀ = ⟦0⟧', blanks: [['γB₀', 'B₀/γ', 'ħB₀', 'γ/B₀']], box: 1, src: '4' },
      { c: '6.intro.1', eq: 'ΔE = ⟦0⟧', blanks: [['ħω₀', 'ħω₀/2', 'ω₀', '2ħω₀']], hard: 1 },
      { c: '6.intro.2', eq: 'Ĥ₀ = −(γħB₀/2) ⟦0⟧', blanks: [['σ<sub>z</sub>', 'σ<sub>x</sub>', 'I', 'B₀']], box: 1, src: '4' },
      { c: '6.intro.3', eq: 'Ĥ = (1/2m)(p̂ − ⟦0⟧)² + qΦ − μ·B', blanks: [['qA', 'q', 'A/q', 'mA']], box: 1, src: '4' },
      { c: '6.intro.4', eq: 'B = ⟦0⟧', blanks: [['∇ × A', '∇·A', '∇A', '∂A/∂t']], hard: 1, src: '4' },
    ],
    precession: [
      { c: '6.precession.0', eq: 'β(t) = β(0) · ⟦0⟧', blanks: [['e<sup>iω₀t</sup>', 'e<sup>−t/T₂</sup>', 'cos ω₀t', 'ω₀t']] },
      { c: '6.precession.1', eq: 'iħ (d/dt)|ψ(t)⟩ = −(γħB₀/2) ⟦0⟧ |ψ(t)⟩', blanks: [['σ<sub>z</sub>', 'σ<sub>x</sub>', 'I', 'B₁']], hard: 1, src: '4' },
      { c: '6.precession.2', eq: 'R<sub>z</sub>(φ) = e<sup>−iφ ⟦0⟧</sup>', blanks: [['Î<sub>z</sub>', 'Î<sub>x</sub>', 'φ', 'ħ']], d: 1, src: '4' },
    ],
    piPulse: [
      { c: '6.piPulse.0', eq: 'P₁(t) = ⟦0⟧(Ω<sub>R</sub>t/2)', blanks: [['sin²', 'cos²', 'sin', 'tan²']], box: 1, src: '3' },
      { c: '6.piPulse.1', eq: 'Ω<sub>R</sub> = ⟦0⟧', blanks: [['γB₁', 'γB₀', 'B₁/γ', 'ω₀']] },
      { c: '6.piPulse.2', eq: 'Ĥ<sub>rot</sub> = (ħΩ<sub>R</sub>/2) ⟦0⟧', blanks: [['σ<sub>x</sub>', 'σ<sub>z</sub>', 'I', 'Ω<sub>R</sub>']], hard: 1, src: '3' },
      { c: '6.piPulse.3', eq: '|ψ(t)⟩ = cos(Ω<sub>R</sub>t/2)|0⟩ − i ⟦0⟧|1⟩', blanks: [['sin(Ω<sub>R</sub>t/2)', 'cos(Ω<sub>R</sub>t/2)', 'sin(Ω<sub>R</sub>t)', 'sin²(Ω<sub>R</sub>t/2)']], d: 1, src: '3' },
    ],
    halfPulse: [
      { c: '6.halfPulse.0', eq: 'R<sub>x</sub>(π/2)|0⟩ = (|0⟩ − ⟦0⟧|1⟩)/√2', blanks: [['i', '1', '−1', '−i']] },
      { c: '6.halfPulse.1', eq: 'impulz 90°<sub>x</sub> = R<sub>x</sub>(⟦0⟧)', blanks: [['π/2', 'π', '90', '2π']], hard: 1, src: '4' },
    ],
    tuning: [
      { c: '6.tuning.0', eq: 'Δ = ⟦0⟧', blanks: [['ω₀ − ω', 'ω₀ + ω', 'ω₀ω', 'Ω<sub>R</sub>']] },
      { c: '6.tuning.1', eq: 'P₁,max = Ω<sub>R</sub>²/(Ω<sub>R</sub>² + ⟦0⟧)', blanks: [['Δ²', 'Δ', 'ω₀²', '1']], hard: 1 },
      { c: '6.tuning.2', eq: 'Ĥ(t) = −γħB₀Î<sub>z</sub> − γħ ⟦0⟧(t) (Î<sub>x</sub> cos ωt + Î<sub>y</sub> sin ωt)', blanks: [['B₁', 'B₀', 'ω', 'Ω<sub>R</sub>']], d: 1, src: '4' },
    ],
    t2: [
      { c: '6.t2.0', eq: '|ρ₀₁(t)| = |ρ₀₁(0)| · ⟦0⟧', blanks: [['e<sup>−t/T₂</sup>', 'e<sup>t/T₂</sup>', 'cos(t/T₂)', '(1 − t/T₂)²']] },
      { c: '6.t2.1', eq: 'T₂ ≤ ⟦0⟧', blanks: [['2T₁', 'T₁/2', 'T₁²', '0']], hard: 1 },
    ],
  },
  // ---------- 7 · Bellov most (prednášky 4 a 5) ----------
  7: {
    intro: [
      { c: '7.intro.0', eq: 'ψ₀₀ψ₁₁ − ⟦0⟧ = 0', blanks: [['ψ₀₁ψ₁₀', 'ψ₀₀ψ₀₁', 'ψ₁₀ψ₁₁', 'ψ₀₀ψ₁₁']] },
      { c: '7.intro.1', eq: 'jeden qubit: orientácia &nbsp;↓&nbsp; viac qubitov: ⟦0⟧', blanks: [[W('korelácie a vzťahy', 'correlations and relations', 'кореляції та зв’язки'), W('dlhší Blochov vektor', 'a longer Bloch vector', 'довший вектор Блоха'), W('viac pólov', 'more poles', 'більше полюсів'), W('globálna fáza', 'global phase', 'глобальна фаза')]], box: 1, src: '4' },
    ],
    build: [
      { c: '7.build.0', eq: '|Φ⁺⟩ = (|00⟩ + ⟦0⟧)/√2', blanks: [['|11⟩', '|10⟩', '|01⟩', '|00⟩']], box: 1, src: '4' },
      { c: '7.build.1', eq: 'ρ<sub>A</sub> = ρ<sub>B</sub> = ⟦0⟧', blanks: [['I/2', '|0⟩⟨0|', '|Φ⁺⟩⟨Φ⁺|', '0']], src: '4' },
      { c: '7.build.2', eq: 'lokálne Blochove vektory môžu zmiznúť, ale kvantová informácia môže zostať v ⟦0⟧', blanks: [[W('spoločnom stave', 'the joint state', 'спільному стані'), W('globálnej fáze', 'the global phase', 'глобальній фазі'), W('prostredí', 'the environment', 'оточенні'), W('meracom prístroji', 'the measuring device', 'вимірювальному приладі')]], box: 1, src: '4' },
      { c: '7.build.3', eq: 'r<sub>A</sub> = r<sub>B</sub> = ⟦0⟧', blanks: [['0', '(0, 0, 1)', '1', '(1, 1, 1)']], hard: 1, src: '4' },
      { c: '7.build.4', eq: '|00⟩ →<sup>H⊗I</sup> (|00⟩ + ⟦0⟧)/√2 →<sup>CNOT</sup> (|00⟩ + |11⟩)/√2', blanks: [['|10⟩', '|01⟩', '|11⟩', '|00⟩']], hard: 1, src: '5' },
    ],
    noSignal: [
      { c: '7.noSignal.0', eq: 'P(same) = cos²(⟦0⟧)', blanks: [['(a − b)/2', 'a − b', '(a + b)/2', 'ab/2']] },
      { c: '7.noSignal.1', eq: 'E(a, b) = cos(⟦0⟧)', blanks: [['a − b', '(a − b)/2', 'a + b', 'ab']], hard: 1 },
    ],
    chsh: [
      { c: '7.chsh.0', eq: '|S| ≤ ⟦0⟧', blanks: [['2', '2√2', '4', '1']] },
      { c: '7.chsh.1', eq: '|S| ≤ ⟦0⟧', blanks: [['2√2', '2', '4', '√2']] },
      { c: '7.chsh.2', eq: 'P<sub>win</sub> = ½ + ⟦0⟧', blanks: [['S/8', 'S/4', 'S/2', 'S']], hard: 1 },
    ],
  },
  // ---------- 8 · Sieň výkladov (prednáška 3: jazyk kvantovej mechaniky, prednáška 2: kvantové manipulácie, tabuľa 2) ----------
  8: {
    intro: [
      { c: '8.intro.0', eq: 'iħ ∂|ψ⟩/∂t = ⟦0⟧', blanks: [['Ĥ|ψ⟩', 'E', 'ħ|ψ⟩', '⟨ψ|Ĥ']], box: 1, src: '3' },
      { c: '8.intro.1', eq: 'P(a) = ⟨ψ|⟦0⟧|ψ⟩', blanks: [['Π<sub>a</sub>', 'A', 'a', 'Ĥ']], src: '3' },
      { c: '8.intro.2', eq: 'iħ ∂ψ(r, t)/∂t = [−(ħ²/2m) ⟦0⟧ + V(r, t)] ψ(r, t)', blanks: [['∇²', '∇', '∂/∂t', 'p²']], box: 1, src: '3' },
      { c: '8.intro.3', eq: '((1/c²) ∂²/∂t² − ∇² + ⟦0⟧) φ(x) = 0', blanks: [['m²c²/ħ²', 'mc/ħ', 'm²c⁴', 'ħ²/(m²c²)']], box: 1, src: '3' },
      { c: '8.intro.4', eq: 'E = ⟦0⟧ + V(r, t)', blanks: [['p²/2m', 'p/2m', 'mv', 'p²/m']], hard: 1, src: '3' },
      { c: '8.intro.5', eq: 'E → ⟦0⟧, &nbsp; p → −iħ∇', blanks: [['iħ ∂/∂t', '−iħ ∂/∂t', 'ħ ∂/∂t', 'i ∂/∂t']], hard: 1, src: '3' },
      { c: '8.intro.6', eq: 'E<sub>n</sub> = n ⟦0⟧, &nbsp; n = 0, 1, 2, …', blanks: [['hν', 'ħ', 'ν', 'k<sub>B</sub>T']], hard: 1, src: '3' },
      { c: '8.intro.7', eq: 'E² = p²c² + ⟦0⟧', blanks: [['m²c⁴', 'mc²', 'm²c²', 'p²']], d: 1, src: '3' },
      { c: '8.intro.8', eq: 'Ĥ<sub>D</sub> = cα·p̂ + ⟦0⟧mc², &nbsp; Ĥ<sub>D</sub>² = c²p̂² + m²c⁴', blanks: [['β', 'α', 'γ', 'I']], d: 1, src: '3' },
      { c: '8.intro.9', eq: '{α<sub>i</sub>, β} = ⟦0⟧, &nbsp; β² = I', blanks: [['0', 'I', '2δ<sub>ij</sub>I', 'β']], d: 1, src: '3' },
      { c: '8.intro.10', eq: 'j⋆ = σ⟦0⟧, &nbsp; λ<sub>max</sub>T = b', blanks: [['T⁴', 'T', 'T²', 'λT']], d: 1, src: '3' },
    ],
    statues: [
      { c: '8.statues.0', eq: '[x, p] = ⟦0⟧', blanks: [['iħ', 'ħ', '−iħ', '0']] },
      { c: '8.statues.1', eq: 'σ<sub>x</sub> σ<sub>p</sub> ≥ ⟦0⟧', blanks: [['ħ/2', 'ħ', '0', '2ħ']], src: '2T' },
      { c: '8.statues.2', eq: 'p̂ = (ħ/i) ⟦0⟧', blanks: [['d/dx', 'x', 'd²/dx²', 'i d/dx']], hard: 1, src: '2T' },
      { c: '8.statues.3', eq: 'ψ*ψ = |ψ|² = ρ(x), &nbsp; ∫ ρ(x) dx = ⟦0⟧', blanks: [['1', '0', 'x', '|ψ|']], hard: 1, src: '2T' },
      { c: '8.statues.4', eq: 'Ĥφ<sub>n</sub> = ⟦0⟧', blanks: [['E<sub>n</sub>φ<sub>n</sub>', 'φ<sub>n</sub>', 'E<sub>n</sub>', 'Ĥ']], hard: 1, src: '2T' },
      { c: '8.statues.5', eq: '(Δx)²(Δp)² ≥ ⟦0⟧', blanks: [['ħ²/4', 'ħ/2', 'ħ²', '0']], d: 1, src: '2T' },
      { c: '8.statues.6', eq: 'ψ(x) = Ax(L − x): &nbsp; ⟨x⟩ = ⟦0⟧, &nbsp; ⟨p⟩ = 0', blanks: [['L/2', 'L', '0', 'L²/2']], d: 1, src: '2T' },
      { c: '8.statues.7', eq: '|Ψ⟩ = (|' + W('živá', 'alive', 'жива') + '⟩ + |' + W('mŕtva', 'dead', 'мертва') + '⟩)/⟦0⟧', blanks: [['√2', '2', '1', '½']], d: 1, src: '3' },
    ],
    sorting: [
      { c: '8.sorting.0', eq: 'U†U = ⟦0⟧', blanks: [['I', '0', 'U', 'U²']], src: '5' },
      { c: '8.sorting.1', eq: 'n spinov: |Ψ⟩ = Σ<sub>x=0</sub><sup>⟦0⟧</sup> c<sub>x</sub>|x⟩', blanks: [['2<sup>n</sup> − 1', 'n', '2n', 'n²']], hard: 1, src: '2' },
      { c: '8.sorting.2', eq: '|Ψ⟩ = (1/√2<sup>n</sup>) Σ<sub>x</sub> |x⟩ &nbsp;⇒&nbsp; P(x) = ⟦0⟧', blanks: [['2<sup>−n</sup>', '1', '1/n', '½']], hard: 1, src: '2' },
      { c: '8.sorting.3', eq: 'U<sub>f</sub>|x⟩|0⟩ = |x⟩⟦0⟧', blanks: [['|f(x)⟩', '|0⟩', '|x⟩', 'f(|x⟩)']], hard: 1, src: '2' },
      { c: '8.sorting.4', eq: 'Grover: O(⟦0⟧) volaní', blanks: [['√N', 'N', 'log N', 'N²']], hard: 1, src: '2' },
      { c: '8.sorting.5', eq: 'α|0⟩ + β|1⟩ → α|000⟩ + β⟦0⟧', blanks: [['|111⟩', '|000⟩', '|011⟩', '|1⟩']], hard: 1, src: '2' },
      { c: '8.sorting.6', eq: 'N = 2<sup>n</sup> &nbsp;⇒&nbsp; √N = 2<sup>⟦0⟧</sup>', blanks: [['n/2', 'n', '2n', '√n']], d: 1, src: '2' },
      { c: '8.sorting.7', eq: 'α|000⟩ + β|111⟩ ⟦0⟧ (α|0⟩ + β|1⟩)<sup>⊗3</sup>', blanks: [['≠', '=', '∝', '≥']], d: 1, src: '2' },
      { c: '8.sorting.8', eq: 'H<sub>C</sub> = Σ<sub>x</sub> C(x) ⟦0⟧', blanks: [['|x⟩⟨x|', '⟨x|x⟩', '|x⟩', 'x']], d: 1, src: '2' },
    ],
  },
  // ---------- 9 · Pauliho rotačná dielňa (prednáška 4) ----------
  9: {
    intro: [
      { c: '9.intro.0', eq: '|ψ⟩ = cos(θ/2)|0⟩ + ⟦0⟧ sin(θ/2)|1⟩', blanks: [['e<sup>iφ</sup>', 'e<sup>iθ</sup>', 'e<sup>iγ</sup>', 'e<sup>−θ</sup>']], box: 1, src: '4' },
      { c: '9.intro.1', eq: 'r = (⟦0⟧, sin θ sin φ, cos θ)', blanks: [['sin θ cos φ', 'cos θ cos φ', 'sin φ', 'sin(θ/2) cos φ']], box: 1, src: '4' },
      { c: '9.intro.2', eq: '0 ≤ θ ≤ ⟦0⟧, &nbsp; 0 ≤ φ < 2π', blanks: [['π', '2π', 'π/2', '1']], box: 1, src: '2' },
      { c: '9.measureAxis.6', eq: 'θ: polárna orientácia, φ: orientácia v rovine xy, ale meranie spinu v ľubovoľnom smere dá vždy ⟦0⟧', blanks: [['± ħ/2', '(ħ/2) cos θ', '(ħ/2) sin θ cos φ', '0']], box: 1, src: '4' },
    ],
    coords: [
      { c: '9.coords.0', eq: '|−i⟩ = (|0⟩ ⟦0⟧ |1⟩)/√2', blanks: [['− i', '+ i', '−', '+']], src: '4' },
      { c: '9.coords.1', eq: 'P(0) = P(1) = ⟦0⟧', blanks: [['½', '1/√2', '1', '0']], src: '4' },
      { c: '9.coords.2', eq: 'relatívna fáza → interferencia → ⟦0⟧ → pravdepodobnosť', blanks: [[W('amplitúda', 'amplitude', 'амплітуда'), W('globálna fáza', 'global phase', 'глобальна фаза'), W('kolaps', 'collapse', 'колапс'), W('dekoherencia', 'decoherence', 'декогеренція')]], box: 1, src: '4' },
      { c: '9.measureAxis.5', eq: 'Meracia báza je súčasťou ⟦0⟧.', blanks: [[W('otázky', 'the question', 'питання'), W('odpovede', 'the answer', 'відповіді'), W('šumu', 'the noise', 'шуму'), W('globálnej fázy', 'the global phase', 'глобальної фази')]], box: 1, src: '4' },
      { c: '9.coords.3', eq: 'θ = π/2 &nbsp;⇒&nbsp; r = (cos φ, sin φ, ⟦0⟧)', blanks: [['0', '1', 'cos θ', '−1']], d: 1, src: '4' },
    ],
    rotations: [
      { c: '9.rotations.0', eq: 'R<sub>n</sub>(ϑ) = exp(−i · ⟦0⟧ · n·σ)', blanks: [['ϑ/2', 'ϑ', '2ϑ', 'ϑ/4']], box: 1, src: '4' },
      { c: '9.rotations.1', eq: 'R<sub>y</sub>(π/2)|0⟩ = ⟦0⟧', blanks: [['|+⟩', '|−⟩', '|+i⟩', '|1⟩']], src: '4' },
      { c: '9.rotations.2', eq: 'r′ = ⟦0⟧', blanks: [['R r', 'U r', '−r', 'R + r']], box: 1, src: '4' },
      { c: '9.rotations.3', eq: 'n<sub>H</sub> = (x̂ + ⟦0⟧)/√2', blanks: [['ẑ', 'ŷ', 'x̂', '−ẑ']], hard: 1, src: '4' },
      { c: '9.rotations.4', eq: 'Kvantové hradlo nie je príkaz, ktorý mení číslo. Je to pravidlo, podľa ktorého sa pohybuje ⟦0⟧.', blanks: [[W('kvantový stav', 'the quantum state', 'квантовий стан'), W('klasický bit', 'a classical bit', 'класичний біт'), W('pozorovateľ', 'the observer', 'спостерігач'), W('elektrón v priestore', 'the electron in space', 'електрон у просторі')]], box: 1, src: '4' },
      { c: '9.rotations.5', eq: 'príprava stavu → riadený pohyb → zmena amplitúd a fáz → vhodná meracia báza → ⟦0⟧', blanks: [[W('klasická informácia', 'classical information', 'класична інформація'), W('kópia stavu', 'a copy of the state', 'копія стану'), W('globálna fáza', 'the global phase', 'глобальна фаза'), W('čistý stav', 'a pure state', 'чистий стан')]], box: 1, src: '4' },
      { c: '9.rotations.6', eq: 'R<sub>y</sub>(π/2) ⟦0⟧ H &nbsp; (ako operátory)', blanks: [['≠', '=', '≡', '∝']], hard: 1, src: '4' },
      { c: '9.rotations.7', eq: 'R<sub>x</sub>(ϑ) = exp(−i(ϑ/2) ⟦0⟧)', blanks: [['σ<sub>x</sub>', 'σ<sub>z</sub>', 'σ<sub>y</sub>', 'I']], hard: 1, src: '5' },
      { c: '9.rotations.8', eq: 'R<sub>z</sub>(π)|+⟩ ∼ ⟦0⟧', blanks: [['|−⟩', '|+⟩', '|0⟩', '|1⟩']], hard: 1, src: '4' },
    ],
    measureAxis: [
      { c: '9.measureAxis.0', eq: 'P(0) = (1 + ⟦0⟧)/2', blanks: [['r<sub>z</sub>', 'r<sub>x</sub>', '|r|', 'cos φ']], src: '4' },
      { c: '9.measureAxis.1', eq: '⟨S<sub>x</sub>⟩ = (ħ/2) sin θ · ⟦0⟧', blanks: [['cos φ', 'sin φ', 'cos θ', 'cos(φ/2)']], box: 1, src: '4' },
      { c: '9.measureAxis.2', eq: 'φ = atan2(⟦0⟧, r<sub>x</sub>)', blanks: [['r<sub>y</sub>', 'r<sub>z</sub>', '|r|', 'θ']], box: 1, src: '4' },
      { c: '9.measureAxis.3', eq: '⟨S<sub>χ</sub>⟩ = (ħ/2) sin θ cos(⟦0⟧)', blanks: [['φ − χ', 'φ + χ', 'χ', 'θ − χ']], box: 1, src: '4' },
      { c: '9.measureAxis.4', eq: 'P<sub>χ</sub>(+) = ½[1 + sin θ cos(φ − χ)], &nbsp; P<sub>χ</sub>(−) = ½[1 ⟦0⟧ sin θ cos(φ − χ)]', blanks: [['−', '+', '·', '/']], box: 1, src: '4' },
      { c: '9.measureAxis.7', eq: 'n<sub>χ</sub> = (cos χ, ⟦0⟧, 0)', blanks: [['sin χ', 'cos χ', '0', '1']], d: 1, src: '4' },
      { c: '9.measureAxis.8', eq: 'S<sub>χ</sub> = (ħ/2)(σ<sub>x</sub> cos χ + ⟦0⟧ sin χ)', blanks: [['σ<sub>y</sub>', 'σ<sub>z</sub>', 'σ<sub>x</sub>', 'I']], d: 1, src: '4' },
      { c: '9.measureAxis.9', eq: 'r · n<sub>χ</sub> = ⟦0⟧', blanks: [['sin θ cos(φ − χ)', 'cos θ cos χ', 'sin θ sin(φ − χ)', 'cos(θ − χ)']], d: 1, src: '4' },
      { c: '9.measureAxis.10', eq: 'φ = π/4, θ = π/2 &nbsp;⇒&nbsp; ⟨S<sub>x</sub>⟩ = ⟨S<sub>y</sub>⟩ = ⟦0⟧', blanks: [['ħ/(2√2)', 'ħ/2', 'ħ/4', '0']], d: 1, src: '4' },
    ],
    unitaryVsDeco: [
      { c: '9.unitaryVsDeco.0', eq: '|r′| = ⟦0⟧', blanks: [['|r|', '0', '|r|²', '2|r|']], src: '5' },
      { c: '9.unitaryVsDeco.1', eq: 'dr/dt = γ r × ⟦0⟧', blanks: [['B', 'r', 'σ', 'μ']], box: 1, src: '4' },
      { c: '9.unitaryVsDeco.2', eq: 'Ĥ<sub>Z</sub> = −μ·B = −γŜ·B = −(γħ/2) ⟦0⟧·B', blanks: [['σ', 'r', 'n', 'ħσ']], box: 1, src: '4' },
      { c: '9.unitaryVsDeco.3', eq: 'unitárna evolúcia = pohyb ⟦0⟧ Blochovej sféry', blanks: [[W('po povrchu', 'along the surface of', 'по поверхні'), W('dovnútra', 'inward into', 'всередину'), W('cez stred', 'through the centre of', 'через центр'), W('von z', 'out of', 'назовні з')]], box: 1, src: '4' },
      { c: '9.unitaryVsDeco.4', eq: 'dekoherencia = pohyb ⟦0⟧ Blochovej gule', blanks: [[W('smerom dovnútra', 'inward into', 'всередину'), W('po povrchu', 'along the surface of', 'по поверхні'), W('von z', 'out of', 'назовні з'), W('okolo osi z', 'around the z axis of', 'навколо осі z')]], box: 1, src: '4' },
      { c: '9.unitaryVsDeco.5', eq: 'Hamiltonián → Schrödingerova evolúcia → ⟦0⟧', blanks: [[W('rotácia Blochovho vektora', 'rotation of the Bloch vector', 'обертання вектора Блоха'), W('skrátenie Blochovho vektora', 'shortening of the Bloch vector', 'вкорочення вектора Блоха'), W('kolaps', 'collapse', 'колапс'), W('klasický bit', 'a classical bit', 'класичний біт')]], box: 1, src: '4' },
    ],
  },
  // ---------- 10 · Von Neumannova čistiareň (prednáška 5: čistý stav) ----------
  10: {
    intro: [
      { c: '10.intro.0', eq: '|r| = ⟦0⟧', blanks: [['1', '0', '½', '2']], src: '5' },
      { c: '10.intro.1', eq: 'ρ = I/2 &nbsp;⇔&nbsp; r = ⟦0⟧', blanks: [['0', '(0, 0, 1)', '(1, 1, 1)', 'σ']], src: '5' },
      { c: '10.intro.2', eq: '|r| < 1 ⟶ |r| = 1 &nbsp; len ⟦0⟧', blanks: [[W('neunitárnym procesom', 'by a non-unitary process', 'неунітарним процесом'), W('unitárnym hradlom', 'by a unitary gate', 'унітарним вентилем'), W('globálnou fázou', 'by a global phase', 'глобальною фазою'), W('zmenou bázy', 'by changing the basis', 'зміною базису')]], hard: 1, src: '5' },
      { c: '10.evolution.8', eq: 'príprava stavu ⟶ ⟦0⟧ ⟶ meranie', blanks: [[W('riadená unitárna evolúcia', 'controlled unitary evolution', 'керована унітарна еволюція'), W('dekoherencia', 'decoherence', 'декогеренція'), W('kopírovanie stavu', 'copying the state', 'копіювання стану'), W('čítanie amplitúd', 'reading out the amplitudes', 'зчитування амплітуд')]], box: 1, src: '5' },
      { c: '10.evolution.9', eq: 'Kvantový výpočet je riadená unitárna evolúcia kvantového stavu zakončená ⟦0⟧.', blanks: [[W('meraním', 'measurement', 'вимірюванням'), W('kopírovaním', 'copying', 'копіюванням'), W('dekoherenciou', 'decoherence', 'декогеренцією'), W('globálnou fázou', 'a global phase', 'глобальною фазою')]], box: 1, src: '5' },
    ],
    unitaryWall: [
      { c: '10.unitaryWall.0', eq: 'ρ′ = Uρ⟦0⟧', blanks: [['U†', 'U', 'ρ', 'Uᵀ']], src: '5' },
      { c: '10.unitaryWall.1', eq: 'Tr ρ² = (1 + ⟦0⟧)/2', blanks: [['|r|²', '|r|', '2|r|', '√|r|']], src: '5' },
      { c: '10.evolution.5', eq: '|ψ(t)⟩ = ⟦0⟧|ψ(0)⟩ = e<sup>−iĤt/ħ</sup>|ψ(0)⟩', blanks: [['Û(t)', 'Û†(t)', 'Ĥ', 'Π<sub>t</sub>']], box: 1, src: '5' },
      { c: '10.evolution.7', eq: '|ψ<sub>out</sub>⟩ = ⟦0⟧|ψ<sub>in</sub>⟩, &nbsp; Û = Û<sub>N</sub>Û<sub>N−1</sub> ⋯ Û₂Û₁', blanks: [['Û', 'Û†', 'Ĥ', 'P̂']], box: 1, src: '5' },
      { c: '10.evolution.6', eq: '|ψ(t)⟩ = Σ<sub>n</sub> a<sub>n</sub> ⟦0⟧ |E<sub>n</sub>⟩', blanks: [['e<sup>−iE<sub>n</sub>t/ħ</sup>', 'e<sup>−E<sub>n</sub>t/ħ</sup>', 'cos(E<sub>n</sub>t/ħ)', 'E<sub>n</sub>t/ħ']], box: 1, src: '5' },
    ],
    purify: [
      { c: '10.purify.0', eq: 'ρ₀ = |0⟩⟨0| = [1, 0; 0, ⟦0⟧]', blanks: [['0', '1', '½', '−1']], src: '5' },
      { c: '10.purify.1', eq: 'Purifikácia qubitu vyžaduje výmenu informácie alebo ⟦0⟧ s okolím.', blanks: [[W('entropie', 'entropy', 'ентропії'), W('globálnej fázy', 'global phase', 'глобальної фази'), W('náboja', 'charge', 'заряду'), W('hybnosti', 'momentum', 'імпульсу')]], box: 1, src: '5' },
      { c: '10.purify.2', eq: 'ρ<sub>th</sub> = e<sup>−βH</sup>/Z, &nbsp; β = ⟦0⟧', blanks: [['1/k<sub>B</sub>T', 'k<sub>B</sub>T', 'T/k<sub>B</sub>', 'ħω']], hard: 1, src: '5' },
      { c: '10.purify.3', eq: 'ρ<sub>th</sub> ≃ (1/2<sup>n</sup>) I + ⟦0⟧ Δρ, &nbsp; ε ≪ 1', blanks: [['ε', '1 − ε', '2<sup>n</sup>', 'β']], d: 1, src: '5' },
    ],
    pseudoPure: [
      { c: '10.pseudoPure.0', eq: 'ρ<sub>pps</sub> = (1 − ε) I/4 + ε ⟦0⟧', blanks: [['|00⟩⟨00|', 'I/4', '⟨00|00⟩', '|00⟩']], box: 1, src: '5' },
      { c: '10.pseudoPure.1', eq: 'U I U† = ⟦0⟧', blanks: [['I', 'U²', '0', 'UU']], src: '5' },
      { c: '10.pseudoPure.2', eq: 'r = ⟦0⟧ · n', blanks: [['ε', '1 − ε', '1', 'ε/4']], box: 1, src: '5' },
      { c: '10.pseudoPure.3', eq: 'NMR nečistí celý stav; pripravuje „čistú“ ⟦0⟧ od zmiešaného pozadia.', blanks: [[W('odchýlku', 'deviation', 'відхилення'), W('kópiu', 'copy', 'копію'), W('fázu', 'phase', 'фазу'), W('stopu', 'trace', 'слід')]], box: 1, src: '5' },
      { c: '10.pseudoPure.4', eq: '|ψ⟩⟨ψ| = ½(I + ⟦0⟧)', blanks: [['n·σ', 'εn·σ', 'r', 'σ']], hard: 1, src: '5' },
      { c: '10.pseudoPure.5', eq: 'ρ′ = (1 − ε) I/4 + ε |ψ⟩⟨ψ|, &nbsp; |ψ⟩ = ⟦0⟧', blanks: [['U|00⟩', '|00⟩', 'U†|00⟩', 'U|ψ⟩']], hard: 1, src: '5' },
      { c: '10.pseudoPure.6', eq: 'ρ<sub>pps</sub> = diag((1 + ⟦0⟧ε)/4, (1 − ε)/4, (1 − ε)/4, (1 − ε)/4)', blanks: [['3', '1', '4', '2']], d: 1, src: '5' },
    ],
    observables: [
      { c: '10.observables.0', eq: '⟨A⟩ = Tr(⟦0⟧)', blanks: [['ρA', 'ρ', 'A', 'ρ²']], box: 1, src: '5' },
      { c: '10.observables.1', eq: '⟨n·σ⟩ = ⟦0⟧', blanks: [['r·n', '|r|', '|n|', 'r × n']], box: 1, src: '5' },
      { c: '10.observables.2', eq: '⟨A⟩ = ⟦0⟧ · ⟨ψ|A|ψ⟩', blanks: [['ε', '1 − ε', '(1 − ε)/2', '1/4']], box: 1, src: '5' },
      { c: '10.observables.3', eq: 'r = (⟨σ<sub>x</sub>⟩, ⟦0⟧, ⟨σ<sub>z</sub>⟩)', blanks: [['⟨σ<sub>y</sub>⟩', 'σ<sub>y</sub>', 'r<sub>x</sub>', '⟨σ<sub>x</sub>⟩']], box: 1, src: '5' },
      { c: '10.observables.4', eq: 'A = ⟦0⟧', blanks: [['A†', 'A⁻¹', '−A', 'A²']], box: 1, src: '5' },
      { c: '10.observables.5', eq: 'Tr σ<sub>z</sub> = ⟦0⟧, &nbsp; vlastné čísla σ<sub>z</sub>: ⟦1⟧', blanks: [['0', '1', '2', '−1'], ['+1, −1', '0, 1', '±ħ', '1, 1']], hard: 1, src: '5' },
      { c: '10.observables.6', eq: '⟨A⟩ = (1 − ε) Tr((I/2) A) + ε⟨ψ|A|ψ⟩, &nbsp; Tr((I/2) A) = ⟦0⟧', blanks: [['0', '½', '1', 'ε']], d: 1, src: '5' },
    ],
    evolution: [
      { c: '10.evolution.0', eq: 'Û(t) = exp(⟦0⟧)', blanks: [['−iĤt/ħ', 'iĤt/ħ', '−Ĥt/ħ', '−iĤtħ']], box: 1, src: '5' },
      { c: '10.evolution.1', eq: '|a<sub>n</sub>(t)|² = ⟦0⟧', blanks: [['|a<sub>n</sub>(0)|²', '|a<sub>n</sub>(0)|² cos(E<sub>n</sub>t/ħ)', '0', '|a<sub>n</sub>(0)|² e<sup>−t</sup>']], src: '5' },
      { c: '10.evolution.2', eq: 'Δφ(t) = −(⟦0⟧) t/ħ', blanks: [['E₂ − E₁', 'E₂ + E₁', 'E₁E₂', 'E₂/E₁']], src: '5' },
      { c: '10.evolution.3', eq: 'ψ<sub>n</sub>(x, t) = φ<sub>n</sub>(x) exp(⟦0⟧)', blanks: [['−iE<sub>n</sub>t/ħ', 'iE<sub>n</sub>t/ħ', '−E<sub>n</sub>t/ħ', '−iE<sub>n</sub>ħ/t']], box: 1, src: '5' },
      { c: '10.evolution.4', eq: 'ψ(x, t) = Σ<sub>n</sub> ⟦0⟧ φ<sub>n</sub>(x) exp(−iE<sub>n</sub>t/ħ)', blanks: [['a<sub>n</sub>', '|a<sub>n</sub>|²', 'E<sub>n</sub>', 'ħ']], box: 1, src: '5' },
      { c: '10.evolution.10', eq: 'Ĥ† = Ĥ &nbsp;⇒&nbsp; Û†(t)Û(t) = ⟦0⟧', blanks: [['Î', '0', 'Ĥ', 'Û²']], hard: 1, src: '5' },
      { c: '10.evolution.11', eq: 'Ĥ₀ = Ĥ<sub>Z</sub> + ⟦0⟧, &nbsp; Ĥ(t) = Ĥ₀ + ⟦1⟧(t)', blanks: [['Ĥ<sub>J</sub>', 'Ĥ<sub>RF</sub>', 'Ĥ<sub>D</sub>', 'Î'], ['Ĥ<sub>RF</sub>', 'Ĥ<sub>J</sub>', 'Ĥ<sub>Z</sub>', 'Î']], hard: 1, src: '5' },
      { c: '10.evolution.12', eq: 'Ĥφ<sub>n</sub> = E<sub>n</sub>φ<sub>n</sub> &nbsp;⇒&nbsp; df<sub>n</sub>/dt = ⟦0⟧ f<sub>n</sub>(t)', blanks: [['−iE<sub>n</sub>/ħ', 'iE<sub>n</sub>/ħ', '−E<sub>n</sub>/ħ', 'E<sub>n</sub>']], d: 1, src: '5' },
      { c: '10.evolution.13', eq: '|exp(−iE<sub>n</sub>t/ħ)| = ⟦0⟧', blanks: [['1', '0', 'E<sub>n</sub>t/ħ', 'e<sup>−t</sup>']], d: 1, src: '5' },
      { c: '10.evolution.14', eq: 'Û(t, t₀) = 𝒯 exp(−(i/ħ) ∫<sub>t₀</sub><sup>t</sup> ⟦0⟧ dt′)', blanks: [['Ĥ(t′)', 'Ĥ(t)', 'Û(t′)', 'E t′']], d: 1, src: '5' },
      { c: '10.evolution.15', eq: '|ψ⟩ = Σ<sub>j</sub> c<sub>j</sub>|j⟩: &nbsp; c′ = ⟦0⟧', blanks: [['Uc', 'U†c', 'c', 'cᵀU']], d: 1, src: '5' },
    ],
  },
  // ---------- 11 · Bornova meracia sieň (prednáška 5: meranie, prednáška 2: meranie, jazyk, realita) ----------
  11: {
    intro: [
      { c: '11.intro.0', eq: 'P<sub>k</sub> = ⟦0⟧', blanks: [['|k⟩⟨k|', '⟨k|k⟩', '|k⟩', '⟨k|']], src: '5' },
      { c: '11.intro.1', eq: 'p(k) = Tr(ρ ⟦0⟧)', blanks: [['P<sub>k</sub>', 'ρ', 'I', 'U']], src: '5' },
      { c: '11.intro.2', eq: 'Σ<sub>k</sub> E<sub>k</sub> = ⟦0⟧', blanks: [['I', '0', 'ρ', 'E<sub>k</sub>²']], hard: 1, src: '5' },
      { c: '11.intro.3', eq: 'POVM: &nbsp; p(k) = Tr(ρ ⟦0⟧)', blanks: [['E<sub>k</sub>', 'E<sub>k</sub>²', 'ρ', 'U<sub>k</sub>']], box: 1, src: '5' },
      { c: '11.intro.4', eq: 'Kvantový stav opisuje možnosti; výsledok merania opisuje ⟦0⟧.', blanks: [[W('udalosť', 'an event', 'подію'), W('možnosti', 'possibilities', 'можливості'), W('amplitúdu', 'an amplitude', 'амплітуду'), W('superpozíciu', 'a superposition', 'суперпозицію')]], box: 1, src: '5' },
      { c: '11.intro.5', eq: 'unitárna manipulácia ⟶ ⟦0⟧', blanks: [[W('meranie', 'measurement', 'вимірювання'), W('kopírovanie', 'copying', 'копіювання'), W('dekoherencia', 'decoherence', 'декогеренція'), W('nič', 'nothing', 'нічого')]], box: 1, src: '5' },
      { c: '11.intro.6', eq: 'Meranie je fyzikálna operácia, ktorá môže byť súčasťou samotného ⟦0⟧.', blanks: [[W('výpočtu', 'computation', 'обчислення'), W('pozorovateľa', 'observer', 'спостерігача'), W('vákua', 'vacuum', 'вакууму'), W('Hamiltoniánu', 'Hamiltonian', 'гамільтоніана')]], box: 1, src: '5' },
      { c: '11.intro.7', eq: 'E<sub>k</sub> ⟦0⟧ 0', blanks: [['≥', '<', '=', '≠']], d: 1, src: '5' },
    ],
    phaseReveal: [
      { c: '11.phaseReveal.0', eq: 'H|−⟩ = ⟦0⟧', blanks: [['|1⟩', '|0⟩', '|−⟩', '|+⟩']], src: '5' },
      { c: '11.phaseReveal.1', eq: 'amplitúdy a fázy ⟶ ⟦0⟧ ⟶ merateľné pravdepodobnosti', blanks: [[W('interferencia', 'interference', 'інтерференція'), W('kolaps', 'collapse', 'колапс'), W('dekoherencia', 'decoherence', 'декогеренція'), W('kopírovanie', 'copying', 'копіювання')]], box: 1, src: '5' },
      { c: '11.phaseReveal.2', eq: '|ψ⟩ &nbsp;—meranie→&nbsp; m = ⟦0⟧', blanks: [[W('0 alebo 1', '0 or 1', '0 або 1'), '|α|²', 'α|0⟩ + β|1⟩', '½']], box: 1, src: '5' },
      { c: '11.phaseReveal.3', eq: 'Readout nie je pozorovanie zvonka; je to súčasť ⟦0⟧.', blanks: [[W('zariadenia', 'the device', 'пристрою'), W('vedomia', 'consciousness', 'свідомості'), W('vlnovej funkcie', 'the wave function', 'хвильової функції'), W('Blochovej sféry', 'the Bloch sphere', 'сфери Блоха')]], box: 1, src: '5' },
      { c: '11.phaseReveal.4', eq: 'kvantová informácia ⟶ ⟦0⟧', blanks: [[W('klasická informácia', 'classical information', 'класична інформація'), W('kvantová informácia', 'quantum information', 'квантова інформація'), W('entropia nula', 'zero entropy', 'нульова ентропія'), W('superpozícia', 'superposition', 'суперпозиція')]], box: 1, src: '5' },
    ],
    midCircuit: [
      { c: '11.midCircuit.0', eq: 'p<sub>m</sub> = ⟨ψ|⟦0⟧|ψ⟩', blanks: [['P<sub>m</sub>', 'U', 'H', 'm']], src: '5' },
      { c: '11.midCircuit.1', eq: 'ρ → P<sub>k</sub>ρP<sub>k</sub> / ⟦0⟧', blanks: [['Tr(ρP<sub>k</sub>)', 'Tr ρ', 'P<sub>k</sub>', 'Tr(ρ²)']], src: '5' },
      { c: '11.midCircuit.2', eq: 'dekoherencia ⟦0⟧ readout', blanks: [['≠', '=', '⇒', '⊂']], box: 1, src: '5' },
      { c: '11.midCircuit.3', eq: 'Miesto merania v obvode je súčasťou ⟦0⟧.', blanks: [[W('algoritmu', 'the algorithm', 'алгоритму'), W('šumu', 'the noise', 'шуму'), W('prostredia', 'the environment', 'середовища'), W('globálnej fázy', 'the global phase', 'глобальної фази')]], box: 1, src: '5' },
      { c: '11.bellReadout.6', eq: 'medzi amplitúdami |00⟩ a |11⟩ existuje definovaný ⟦0⟧ vzťah', blanks: [[W('fázový', 'phase', 'фазовий'), W('energetický', 'energy', 'енергетичний'), W('príčinný', 'causal', 'причинний'), W('priestorový', 'spatial', 'просторовий')]], box: 1, src: '5' },
      { c: '11.midCircuit.4', eq: 'ρ₀₁, ρ₁₀ → ⟦0⟧', blanks: [['0', '½', '1', 'ρ₀₀']], hard: 1, src: '5' },
      { c: '11.midCircuit.5', eq: '|ψ⟩ → P̂<sub>m</sub>|ψ⟩ / √⟦0⟧', blanks: [['⟨ψ|P̂<sub>m</sub>|ψ⟩', '⟨ψ|ψ⟩', 'P̂<sub>m</sub>', 'p<sub>m</sub>²']], d: 1, src: '5' },
    ],
    feedback: [
      { c: '11.feedback.0', eq: 'U₁ → M → ⟦0⟧ → M₂', blanks: [['U₂(M)', 'U₁†', 'M', 'U₁']], src: '5' },
      { c: '11.feedback.1', eq: 'zmeraj → ⟦0⟧ → pokračuj', blanks: [[W('rozhodni', 'decide', 'виріши'), W('zabudni', 'forget', 'забудь'), W('skopíruj', 'copy', 'скопіюй'), W('zopakuj', 'repeat', 'повтори')]], box: 1, src: '5' },
      { c: '11.feedback.2', eq: 'príprava → unitárna manipulácia → interferencia a korelácie → meranie → klasická informácia → prípadná ⟦0⟧', blanks: [[W('spätná väzba', 'feedback', 'зворотний зв’язок'), W('dekoherencia', 'decoherence', 'декогеренція'), W('kópia stavu', 'copy of the state', 'копія стану'), W('globálna fáza', 'global phase', 'глобальна фаза')]], box: 1, src: '5' },
      { c: '11.feedback.3', eq: 'Meranie nie je koniec kvantového výpočtu. Meranie je jedna z ⟦0⟧, z ktorých je kvantový výpočet zostavený.', blanks: [[W('operácií', 'the operations', 'операцій'), W('chýb', 'the errors', 'помилок'), W('amplitúd', 'the amplitudes', 'амплітуд'), W('globálnych fáz', 'the global phases', 'глобальних фаз')]], box: 1, src: '5' },
    ],
    bellReadout: [
      { c: '11.bellReadout.0', eq: 'P(00) = P(11) = ⟦0⟧', blanks: [['½', '¼', '1', '0']], src: '5' },
      { c: '11.bellReadout.1', eq: 'ρ<sub>00,11</sub> = ρ<sub>11,00</sub> = ⟦0⟧', blanks: [['½', '0', '¼', '1']], box: 1, src: '5' },
      { c: '11.bellReadout.2', eq: 'Δρ ∝ ⟦0⟧', blanks: [['|Φ⁺⟩⟨Φ⁺|', 'I₄/4', 'ρ<sub>mix</sub>', '|00⟩⟨00|']], box: 1, src: '5' },
      { c: '11.bellReadout.3', eq: 'výsledky meraní Bellovho stavu: A ⟦0⟧ B', blanks: [['=', '≠', '>', '<']], box: 1, src: '5' },
      { c: '11.bellReadout.4', eq: '„viem, ⟦0⟧“', blanks: [[W('aký je vzťah medzi A a B', 'what the relation between A and B is', 'яке відношення між A і B'), W('čo je A', 'what A is', 'що таке A'), W('čo je B', 'what B is', 'що таке B'), W('A aj B vopred', 'both A and B in advance', 'і A, і B заздалегідь')]], box: 1, src: '5' },
      { c: '11.bellReadout.5', eq: 'ρ<sub>Φ⁺</sub> = ½ [1, 0, 0, 1; 0, 0, 0, 0; 0, 0, 0, 0; ⟦0⟧, 0, 0, 1]', blanks: [['1', '0', '½', '−1']], box: 1, src: '5' },
      { c: '11.bellReadout.7', eq: 'P(01) = P(10) = ⟦0⟧', blanks: [['0', '½', '¼', '1']], hard: 1, src: '5' },
      { c: '11.bellReadout.8', eq: 'ρ<sub>mix</sub> = ½|00⟩⟨00| + ½ ⟦0⟧', blanks: [['|11⟩⟨11|', '|00⟩⟨11|', '|11⟩⟨00|', '|01⟩⟨01|']], hard: 1, src: '5' },
      { c: '11.bellReadout.9', eq: 'ρ<sub>NMR</sub> = (1 − ε) I₄/4 + ε ⟦0⟧', blanks: [['|Φ⁺⟩⟨Φ⁺|', '|00⟩⟨00|', 'I₄/4', 'ρ<sub>mix</sub>']], d: 1, src: '5' },
    ],
  },
  // ---------- 12 · NMR dielňa (praktické NMR) ----------
  12: {
    intro: [
      { c: '12.intro.0', eq: 'ν₀ = ⟦0⟧ / 2π', blanks: [['γB₀', 'γB₁', 'B₀/γ', 'ħB₀']], src: '4' },
    ],
    tune: [
      { c: '12.tune.0', eq: 'Δν = ν₀ − ⟦0⟧', blanks: [['ν<sub>RF</sub>', 'γB₁', 'ν₀/2', '1/T₂']] },
    ],
    pulse: [
      { c: '12.pulse.0', eq: 'θ = γ ⟦0⟧ τ', blanks: [['B₁', 'B₀', 'ν₀', 'I²']] },
      { c: '12.pulse.1', eq: 'R<sub>x</sub>(π/2)|0⟩ ∼ (|0⟩ − ⟦0⟧|1⟩)/√2', blanks: [['i', '1', '−1', '−i']], hard: 1 },
    ],
    sequence: [
      { c: '12.sequence.0', eq: 'S(t) ∝ M<sub>⊥</sub>(0) cos(2πΔν t) · ⟦0⟧', blanks: [['e<sup>−t/T₂*</sup>', 'e<sup>t/T₂*</sup>', 'e<sup>−T₂*/t</sup>', 'sin(t/T₂*)']] },
    ],
    calibrate: [
      { c: '12.calibrate.0', eq: 'τ₉₀ = ⟦0⟧', blanks: [['τ₁₈₀/2', '2τ₁₈₀', 'τ₁₈₀', 'τ₁₈₀/4']] },
    ],
    echo: [
      { c: '12.echo.0', eq: 't<sub>echo</sub> = ⟦0⟧', blanks: [['2τ', 'τ', 'τ/2', '4τ']] },
      { c: '12.echo.1', eq: 'T₂ ≤ ⟦0⟧', blanks: [['2T₁', 'T₂*', 'T₁/2', '0']], hard: 1 },
    ],
  },
  // ---------- 13 · Dračí štít ----------
  13: {
    intro: [
      { c: '13.intro.0', eq: 'P = ½(1 + r · ⟦0⟧)', blanks: [['n', 'r', 'σ', '|r|']] },
    ],
  },
};

// výrazy z prednášok, ktoré hra v danom kroku neukazuje (diferenciálne rovnice, rady, Hermitove polynómy, spojité bázy,
// relativistické rovnice, algoritmy…): po kroku sa nepýtajú — sú v 📄 Precvičovaní z prednášok (Kódex)
const LECTURE_ONLY = new Set([
  '1.intro.2', '1.intro.3', '1.intro.4', '1.intro.5', '1.intro.6', '1.intro.7', '1.intro.8', '1.intro.9',
  '1.setHand.1', '1.setHand.2', '1.setHand.3', '1.setHand.4', '1.setHand.5', '1.setHand.6', '1.setHand.7', '1.setHand.8', '1.setHand.9',
  '1.timesI.8', '1.timesI.9', '1.timesI.10', '1.timesI.11',
  '1.interference.2', '1.interference.3', '1.interference.4', '1.interference.5', '1.interference.6',
  '2.intro.1', '2.intro.4',
  '5.intro.3', '5.intro.4', '5.tasks.2', '5.tasks.3', '5.tasks.4', '5.tasks.5', '5.tasks.6', '5.tasks.7', '5.tasks.15', '5.tasks.16',
  '6.intro.3', '6.intro.4', '6.tuning.2',
  '8.intro.2', '8.intro.3', '8.intro.4', '8.intro.5', '8.intro.6', '8.intro.7', '8.intro.8', '8.intro.9', '8.intro.10',
  '8.statues.2', '8.statues.3', '8.statues.4', '8.statues.5', '8.statues.6',
  '8.sorting.1', '8.sorting.2', '8.sorting.3', '8.sorting.4', '8.sorting.5', '8.sorting.6', '8.sorting.7', '8.sorting.8',
  '9.unitaryVsDeco.1', '9.unitaryVsDeco.2',
  '10.purify.2', '10.purify.3', '10.evolution.3', '10.evolution.4', '10.evolution.11', '10.evolution.12', '10.evolution.14',
  '11.intro.3', '11.intro.7',
]);

const EqBlanks = {
  // kvízy PO kroku `step` levelu `num` — pýtajú sa na vzťah, ktorý hráč práve videl (ľahká a laická: žiadne)
  // najviac 2 (normálna) / 3 (ťažká) na krok: najprv zarámované, potom hlavné rovnice úlohy, na ťažkej aj nezarámované
  // a niekedy (40 %) medzikrok odvodenia. Ostatné ostanú v 📄 Precvičovaní z prednášok.
  for(num, step) {
    if (Settings.easy || Settings.noBlanks) return []; // ľahká/laická alebo „⏭ Bez kvízov“
    const all = (EQ_BLANKS[num]?.[step] || []).filter((b) => !LECTURE_ONLY.has(b.c)), hard = Settings.hard, cap = hard ? 3 : 2;
    const shuf = (list) => list.map((b) => [rand(), b]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    const order = [...shuf(all.filter((b) => b.box)), ...shuf(all.filter((b) => !b.box && !b.d && (!b.hard || hard))), ...(hard ? shuf(all.filter((b) => b.d && rand() < 0.4)) : [])];
    const keep = new Set(order.slice(0, cap));
    return all.filter((b) => keep.has(b)).map((b) => this.quiz(b));
  },
  quiz(b) {
    return {
      id: 'blank.' + b.c,
      eq: DL.has(`blanks.${b.c}.eq`) ? DL(`blanks.${b.c}.eq`) : b.eq, // rovnica so slovami je preložená v CSV (blanks.<c>.eq)
      blanks: b.blanks, ctx: DL('blanks.' + b.c), src: b.src, tier: b.box ? 'box' : b.d ? 'd' : b.hard ? 'hard' : '',
    };
  },
  byId(id) {
    const c = String(id).replace(/^blank\./, '');
    for (const lv of Object.values(EQ_BLANKS)) for (const list of Object.values(lv)) { const b = list.find((x) => x.c === c); if (b) return this.quiz(b); }
    return null;
  },
  // všetky vzťahy jednej prednášky (src '4' = prednáška 4, '1T' = tabuľa prednášky 1)
  lecture(lec) {
    const out = [];
    for (const lv of Object.values(EQ_BLANKS)) for (const list of Object.values(lv)) for (const b of list) if (b.src && parseInt(b.src, 10) === lec) out.push(this.quiz(b));
    return out;
  },
  count(num) { return Object.values(EQ_BLANKS[num] || {}).flat().length; },
};
