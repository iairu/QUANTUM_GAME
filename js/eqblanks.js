'use strict';
// ∑ Doplň rovnicu: pred krokom levelu (normálna a ťažká obťažnosť) hráč najprv doplní chýbajúce časti rovnice kroku.
// Ľahká a laická tieto kvízy preskočia — rovnica sa ukáže hneď (karta „Rovnica najprv“, denník, panel teórie).
//  eq      — rovnica; ⟦n⟧ je n-té prázdne miesto (rozbaľovací zoznam)
//  blanks  — možnosti pre každé prázdne miesto; SPRÁVNA JE VŽDY PRVÁ (zobrazia sa zamiešané)
//  c       — kľúč kontextu v lang/*.csv (blanks.<c>): čo rovnica hovorí, aby bola správna práve jedna možnosť
//  hard    — len na ťažkej obťažnosti
// Pravidlo: v každom zozname môže byť len jedna pravdivá možnosť. Napr. pri |r′| = ( ) nesmie byť popri |r| aj 1
// (pre čistý stav by platilo oboje), a pri Σ|k⟩⟨k| = ( ) nie je popri I aj číslo 1.

const EQ_BLANKS = {
  // ---------- 1 · Komplexný prístav ----------
  1: {
    intro: [
      { c: '1.intro.0', eq: 'P = ⟦0⟧', blanks: [['|α|²', 'α²', '|α|', '2 Re α']] },
      { c: '1.intro.1', eq: 'α = |α|·⟦0⟧', blanks: [['e<sup>iφ</sup>', 'e<sup>φ</sup>', 'cos φ', 'iφ']] },
    ],
    setHand: [
      { c: '1.setHand.0', eq: '|e<sup>iφ</sup>α| = ⟦0⟧', blanks: [['|α|', '|α|²', 'φ|α|', 'e<sup>iφ</sup>|α|']] },
    ],
    timesI: [
      { c: '1.timesI.0', eq: 'i² = ⟦0⟧', blanks: [['−1', '1', 'i', '−i']] },
      { c: '1.timesI.1', eq: 'i = ⟦0⟧', blanks: [['e<sup>iπ/2</sup>', 'e<sup>iπ</sup>', 'e<sup>−iπ/2</sup>', 'e<sup>2πi</sup>']] },
      { c: '1.timesI.2', eq: 'e<sup>iπ</sup> + ⟦0⟧ = 0', blanks: [['1', 'i', 'π', '−1']], hard: true },
    ],
    interference: [
      { c: '1.interference.0', eq: '|A₁ + A₂|² = |A₁|² + |A₂|² + ⟦0⟧', blanks: [['2 Re(A₁A₂*)', '2 A₁A₂', '|A₁A₂|', '0']] },
      { c: '1.interference.1', eq: 'P = ½(1 + cos Δφ) = ⟦0⟧', blanks: [['cos²(Δφ/2)', 'sin²(Δφ/2)', 'cos²(Δφ)', '½ cos Δφ']], hard: true },
    ],
  },
  // ---------- 2 · Sternova–Gerlachova pec ----------
  2: {
    intro: [
      { c: '2.intro.0', eq: 'S<sub>z</sub> = ⟦0⟧', blanks: [['±ħ/2', '±ħ', '±h/2', '0, ±ħ/2']] },
      { c: '2.intro.1', eq: 'F<sub>z</sub> = μ<sub>z</sub> · ⟦0⟧', blanks: [['∂B<sub>z</sub>/∂z', 'B<sub>z</sub>', '∂z/∂B<sub>z</sub>', 'μ<sub>z</sub>B<sub>z</sub>']] },
      { c: '2.intro.2', eq: 'ħ = ⟦0⟧', blanks: [['h/2π', '2πh', 'h/π', 'h²']], hard: true },
    ],
    twoSpots: [
      { c: '2.twoSpots.0', eq: 'ρ = ½|0⟩⟨0| + ½|1⟩⟨1| = ⟦0⟧', blanks: [['I/2', 'I', '|+⟩⟨+|', '0']] },
    ],
    sequences: [
      { c: '2.sequences.0', eq: '|±x⟩ = (|0⟩ ⟦0⟧ |1⟩)/⟦1⟧', blanks: [['±', '·', '×', '⊗'], ['√2', '2', '½', '1']] },
      { c: '2.sequences.1', eq: '|⟨0|+x⟩|² = ⟦0⟧', blanks: [['½', '1/√2', '1', '0']] },
    ],
    predict: [
      { c: '2.predict.0', eq: 'P(+n) = cos²(⟦0⟧) = (1 + cos ϑ)/2', blanks: [['ϑ/2', 'ϑ', '2ϑ', 'ϑ/4']] },
    ],
  },
  // ---------- 3 · Blochovo observatórium ----------
  3: {
    intro: [
      { c: '3.intro.0', eq: '|ψ⟩ = cos(⟦0⟧)|0⟩ + e<sup>iφ</sup> sin(θ/2)|1⟩', blanks: [['θ/2', 'θ', '2θ', 'φ/2']] },
      { c: '3.intro.1', eq: 'r = (sin θ cos φ, sin θ sin φ, ⟦0⟧)', blanks: [['cos θ', 'sin θ', 'cos φ', 'cos(θ/2)']] },
    ],
    puzzles: [
      { c: '3.puzzles.0', eq: 'H = (X + ⟦0⟧)/√2', blanks: [['Z', 'Y', 'I', 'X']] },
      { c: '3.puzzles.1', eq: 'HXH = ⟦0⟧', blanks: [['Z', 'X', 'Y', 'I']] },
      { c: '3.puzzles.2', eq: 'XY = ⟦0⟧', blanks: [['iZ', 'Z', '−iZ', 'I']], hard: true },
    ],
    measure: [
      { c: '3.measure.0', eq: 'P(1) = |β|² = ⟦0⟧', blanks: [['sin²(θ/2)', 'cos²(θ/2)', 'sin θ', 'sin²θ']] },
      { c: '3.measure.1', eq: '⟨Z⟩ = P(0) − P(1) = ⟦0⟧', blanks: [['cos θ', 'sin θ', 'cos²(θ/2)', '0']] },
    ],
    lab: [
      { c: '3.lab.0', eq: 'P(+m) = (1 + ⟦0⟧)/2', blanks: [['r·m', '|r|', 'r × m', '|m|']] },
    ],
  },
  // ---------- 4 · Chrám interferencie ----------
  4: {
    intro: [
      { c: '4.intro.0', eq: 'ρ = ½(I + ⟦0⟧)', blanks: [['r·σ', 'r', 'σ', '|r|']] },
      { c: '4.intro.1', eq: 'Tr ρ² = (⟦0⟧ + |r|²)/⟦1⟧', blanks: [['1', '0', '2', '|r|'], ['2', '4', '1', '√2']] },
    ],
    pure: [
      { c: '4.pure.0', eq: 'H·H = ⟦0⟧', blanks: [['I', 'H', 'X', '0']] },
    ],
    withMeasure: [
      { c: '4.withMeasure.0', eq: 'ρ → Σ<sub>k</sub> P<sub>k</sub> ρ ⟦0⟧', blanks: [['P<sub>k</sub>', 'ρ', 'I', 'U']] },
    ],
    deco: [
      { c: '4.deco.0', eq: 'ρ₀₁ → ⟦0⟧ e<sup>−iφ</sup> ρ₀₁', blanks: [['(1 − p)', 'p', '(1 + p)', 'p²']] },
      { c: '4.deco.1', eq: 'P(0) = ½(1 + (1 − p) ⟦0⟧)', blanks: [['cos φ', 'sin φ', 'cos²φ', 'φ']], hard: true },
    ],
  },
  // ---------- 5 · Diracova knižnica ----------
  5: {
    intro: [
      { c: '5.intro.0', eq: '⟨φ|ψ⟩ = ⟦0⟧', blanks: [['⟨ψ|φ⟩*', '⟨ψ|φ⟩', '−⟨ψ|φ⟩', '|ψ⟩⟨φ|']] },
      { c: '5.intro.1', eq: 'Σ<sub>k</sub> |k⟩⟨k| = ⟦0⟧', blanks: [['I', '0', '|0⟩', '⟨k|k⟩']] },
    ],
    tasks: [
      { c: '5.tasks.0', eq: '⟨A⟩ = ⟨ψ|A|ψ⟩ = ⟦0⟧', blanks: [['Tr(ρA)', 'Tr ρ', '⟨ψ|ψ⟩', 'ρA']] },
      { c: '5.tasks.1', eq: 'P² = ⟦0⟧', blanks: [['P', 'I', '0', '2P']] },
    ],
  },
  // ---------- 6 · Rabiho rezonátor ----------
  6: {
    intro: [
      { c: '6.intro.0', eq: 'ω₀ = ⟦0⟧', blanks: [['γB₀', 'B₀/γ', 'ħB₀', 'γ/B₀']] },
      { c: '6.intro.1', eq: 'ΔE = ⟦0⟧', blanks: [['ħω₀', 'ħω₀/2', 'ω₀', '2ħω₀']], hard: true },
    ],
    precession: [
      { c: '6.precession.0', eq: 'β(t) = β(0) · ⟦0⟧', blanks: [['e<sup>iω₀t</sup>', 'e<sup>−t/T₂</sup>', 'cos ω₀t', 'ω₀t']] },
    ],
    piPulse: [
      { c: '6.piPulse.0', eq: 'P₁(t) = ⟦0⟧(Ω<sub>R</sub>t/2)', blanks: [['sin²', 'cos²', 'sin', 'tan²']] },
      { c: '6.piPulse.1', eq: 'Ω<sub>R</sub> = ⟦0⟧', blanks: [['γB₁', 'γB₀', 'B₁/γ', 'ω₀']] },
    ],
    halfPulse: [
      { c: '6.halfPulse.0', eq: 'R<sub>x</sub>(π/2)|0⟩ = (|0⟩ − ⟦0⟧|1⟩)/√2', blanks: [['i', '1', '−1', '−i']] },
    ],
    tuning: [
      { c: '6.tuning.0', eq: 'Δ = ⟦0⟧', blanks: [['ω₀ − ω', 'ω₀ + ω', 'ω₀ω', 'Ω<sub>R</sub>']] },
      { c: '6.tuning.1', eq: 'P₁,max = Ω<sub>R</sub>²/(Ω<sub>R</sub>² + ⟦0⟧)', blanks: [['Δ²', 'Δ', 'ω₀²', '1']], hard: true },
    ],
    t2: [
      { c: '6.t2.0', eq: '|ρ₀₁(t)| = |ρ₀₁(0)| · ⟦0⟧', blanks: [['e<sup>−t/T₂</sup>', 'e<sup>t/T₂</sup>', 'cos(t/T₂)', '(1 − t/T₂)²']] },
      { c: '6.t2.1', eq: 'T₂ ≤ ⟦0⟧', blanks: [['2T₁', 'T₁/2', 'T₁²', '0']], hard: true },
    ],
  },
  // ---------- 7 · Bellov most ----------
  7: {
    intro: [
      { c: '7.intro.0', eq: 'ψ₀₀ψ₁₁ − ⟦0⟧ = 0', blanks: [['ψ₀₁ψ₁₀', 'ψ₀₀ψ₀₁', 'ψ₁₀ψ₁₁', 'ψ₀₀ψ₁₁']] },
    ],
    build: [
      { c: '7.build.0', eq: '|Φ⁺⟩ = (|00⟩ + ⟦0⟧)/√2', blanks: [['|11⟩', '|10⟩', '|01⟩', '|00⟩']] },
      { c: '7.build.1', eq: 'ρ<sub>A</sub> = ρ<sub>B</sub> = ⟦0⟧', blanks: [['I/2', '|0⟩⟨0|', '|Φ⁺⟩⟨Φ⁺|', '0']] },
    ],
    noSignal: [
      { c: '7.noSignal.0', eq: 'P(same) = cos²(⟦0⟧)', blanks: [['(a − b)/2', 'a − b', '(a + b)/2', 'ab/2']] },
      { c: '7.noSignal.1', eq: 'E(a, b) = cos(⟦0⟧)', blanks: [['a − b', '(a − b)/2', 'a + b', 'ab']], hard: true },
    ],
    chsh: [
      { c: '7.chsh.0', eq: '|S| ≤ ⟦0⟧', blanks: [['2', '2√2', '4', '1']] },
      { c: '7.chsh.1', eq: '|S| ≤ ⟦0⟧', blanks: [['2√2', '2', '4', '√2']] },
      { c: '7.chsh.2', eq: 'P<sub>win</sub> = ½ + ⟦0⟧', blanks: [['S/8', 'S/4', 'S/2', 'S']], hard: true },
    ],
  },
  // ---------- 8 · Sieň výkladov ----------
  8: {
    intro: [
      { c: '8.intro.0', eq: 'iħ ∂|ψ⟩/∂t = ⟦0⟧', blanks: [['H|ψ⟩', 'E', 'ħ|ψ⟩', '⟨ψ|H']] },
      { c: '8.intro.1', eq: 'P(a) = ⟨ψ|⟦0⟧|ψ⟩', blanks: [['P<sub>a</sub>', 'A', 'a', 'H']] },
    ],
    statues: [
      { c: '8.statues.0', eq: '[x, p] = ⟦0⟧', blanks: [['iħ', 'ħ', '−iħ', '0']] },
      { c: '8.statues.1', eq: 'σ<sub>x</sub> σ<sub>p</sub> ≥ ⟦0⟧', blanks: [['ħ/2', 'ħ', '0', '2ħ']] },
    ],
    sorting: [
      { c: '8.sorting.0', eq: 'U†U = ⟦0⟧', blanks: [['I', '0', 'U', 'U²']] },
    ],
  },
  // ---------- 9 · Pauliho rotačná dielňa (prednáška 4) ----------
  9: {
    intro: [
      { c: '9.intro.0', eq: '|ψ⟩ = cos(θ/2)|0⟩ + ⟦0⟧ sin(θ/2)|1⟩', blanks: [['e<sup>iφ</sup>', 'e<sup>iθ</sup>', 'e<sup>iγ</sup>', 'e<sup>−θ</sup>']] },
      { c: '9.intro.1', eq: 'r = (⟦0⟧, sin θ sin φ, cos θ)', blanks: [['sin θ cos φ', 'cos θ cos φ', 'sin φ', 'sin(θ/2) cos φ']] },
      { c: '9.intro.2', eq: '0 ≤ θ ≤ ⟦0⟧, &nbsp; 0 ≤ φ < 2π', blanks: [['π', '2π', 'π/2', '1']], hard: true },
    ],
    coords: [
      { c: '9.coords.0', eq: '|−i⟩ = (|0⟩ ⟦0⟧ |1⟩)/√2', blanks: [['− i', '+ i', '−', '+']] },
      { c: '9.coords.1', eq: 'P(0) = P(1) = ⟦0⟧', blanks: [['½', '1/√2', '1', '0']] },
    ],
    rotations: [
      { c: '9.rotations.0', eq: 'R<sub>n</sub>(ϑ) = exp(−i · ⟦0⟧ · n·σ)', blanks: [['ϑ/2', 'ϑ', '2ϑ', 'ϑ/4']] },
      { c: '9.rotations.1', eq: 'R<sub>y</sub>(π/2)|0⟩ = ⟦0⟧', blanks: [['|+⟩', '|−⟩', '|+i⟩', '|1⟩']] },
      { c: '9.rotations.2', eq: 'r′ = ⟦0⟧', blanks: [['R r', 'U r', '−r', 'R + r']] },
      { c: '9.rotations.3', eq: 'n<sub>H</sub> = (x̂ + ⟦0⟧)/√2', blanks: [['ẑ', 'ŷ', 'x̂', '−ẑ']], hard: true },
    ],
    measureAxis: [
      { c: '9.measureAxis.0', eq: 'P(0) = (1 + ⟦0⟧)/2', blanks: [['r<sub>z</sub>', 'r<sub>x</sub>', '|r|', 'cos φ']] },
      { c: '9.measureAxis.1', eq: '⟨S<sub>x</sub>⟩ = (ħ/2) sin θ · ⟦0⟧', blanks: [['cos φ', 'sin φ', 'cos θ', 'cos(φ/2)']] },
      { c: '9.measureAxis.2', eq: 'φ = atan2(⟦0⟧, r<sub>x</sub>)', blanks: [['r<sub>y</sub>', 'r<sub>z</sub>', '|r|', 'θ']] },
      { c: '9.measureAxis.3', eq: '⟨S<sub>χ</sub>⟩ = (ħ/2) sin θ cos(⟦0⟧)', blanks: [['φ − χ', 'φ + χ', 'χ', 'θ − χ']], hard: true },
    ],
    unitaryVsDeco: [
      { c: '9.unitaryVsDeco.0', eq: '|r′| = ⟦0⟧', blanks: [['|r|', '0', '|r|²', '2|r|']] },
      { c: '9.unitaryVsDeco.1', eq: 'dr/dt = γ r × ⟦0⟧', blanks: [['B', 'r', 'σ', 'μ']] },
      { c: '9.unitaryVsDeco.2', eq: 'H<sub>Z</sub> = −μ·B = −(γħ/2) ⟦0⟧·B', blanks: [['σ', 'r', 'n', 'ħσ']], hard: true },
    ],
  },
  // ---------- 10 · Von Neumannova čistiareň (prednáška 5: čistý stav) ----------
  10: {
    intro: [
      { c: '10.intro.0', eq: '|r| = ⟦0⟧', blanks: [['1', '0', '½', '2']] },
      { c: '10.intro.1', eq: 'ρ = I/2 &nbsp;⇔&nbsp; r = ⟦0⟧', blanks: [['0', '(0, 0, 1)', '(1, 1, 1)', 'σ']] },
    ],
    unitaryWall: [
      { c: '10.unitaryWall.0', eq: 'ρ′ = Uρ⟦0⟧', blanks: [['U†', 'U', 'ρ', 'Uᵀ']] },
      { c: '10.unitaryWall.1', eq: 'Tr ρ² = (1 + ⟦0⟧)/2', blanks: [['|r|²', '|r|', '2|r|', '√|r|']] },
    ],
    purify: [
      { c: '10.purify.0', eq: 'ρ₀ = |0⟩⟨0| = [1, 0; 0, ⟦0⟧]', blanks: [['0', '1', '½', '−1']] },
    ],
    pseudoPure: [
      { c: '10.pseudoPure.0', eq: 'ρ<sub>pps</sub> = (1 − ε) I/4 + ε ⟦0⟧', blanks: [['|00⟩⟨00|', 'I/4', '⟨00|00⟩', '|00⟩']] },
      { c: '10.pseudoPure.1', eq: 'U I U† = ⟦0⟧', blanks: [['I', 'U²', '0', 'UU']] },
      { c: '10.pseudoPure.2', eq: 'r = ⟦0⟧ · n', blanks: [['ε', '1 − ε', '1', 'ε/4']] },
    ],
    observables: [
      { c: '10.observables.0', eq: '⟨A⟩ = Tr(⟦0⟧)', blanks: [['ρA', 'ρ', 'A', 'ρ²']] },
      { c: '10.observables.1', eq: '⟨n·σ⟩ = ⟦0⟧', blanks: [['r·n', '|r|', '|n|', 'r × n']] },
      { c: '10.observables.2', eq: '⟨A⟩ = ⟦0⟧ · ⟨ψ|A|ψ⟩', blanks: [['ε', '1 − ε', '(1 − ε)/2', '1/4']], hard: true },
    ],
    evolution: [
      { c: '10.evolution.0', eq: 'U(t) = exp(⟦0⟧)', blanks: [['−iHt/ħ', 'iHt/ħ', '−Ht/ħ', '−iHtħ']] },
      { c: '10.evolution.1', eq: '|a<sub>n</sub>(t)|² = ⟦0⟧', blanks: [['|a<sub>n</sub>(0)|²', '|a<sub>n</sub>(0)|² cos(E<sub>n</sub>t/ħ)', '0', '|a<sub>n</sub>(0)|² e<sup>−t</sup>']] },
      { c: '10.evolution.2', eq: 'Δφ(t) = −(⟦0⟧) t/ħ', blanks: [['E₂ − E₁', 'E₂ + E₁', 'E₁E₂', 'E₂/E₁']] },
    ],
  },
  // ---------- 11 · Bornova meracia sieň (prednáška 5: meranie) ----------
  11: {
    intro: [
      { c: '11.intro.0', eq: 'P<sub>k</sub> = ⟦0⟧', blanks: [['|k⟩⟨k|', '⟨k|k⟩', '|k⟩', '⟨k|']] },
      { c: '11.intro.1', eq: 'p(k) = Tr(ρ ⟦0⟧)', blanks: [['P<sub>k</sub>', 'ρ', 'I', 'U']] },
      { c: '11.intro.2', eq: 'Σ<sub>k</sub> E<sub>k</sub> = ⟦0⟧', blanks: [['I', '0', 'ρ', 'E<sub>k</sub>²']], hard: true },
    ],
    phaseReveal: [
      { c: '11.phaseReveal.0', eq: 'H|−⟩ = ⟦0⟧', blanks: [['|1⟩', '|0⟩', '|−⟩', '|+⟩']] },
    ],
    midCircuit: [
      { c: '11.midCircuit.0', eq: 'p<sub>m</sub> = ⟨ψ|⟦0⟧|ψ⟩', blanks: [['P<sub>m</sub>', 'U', 'H', 'm']] },
      { c: '11.midCircuit.1', eq: 'ρ → P<sub>k</sub>ρP<sub>k</sub> / ⟦0⟧', blanks: [['Tr(ρP<sub>k</sub>)', 'Tr ρ', 'P<sub>k</sub>', 'Tr(ρ²)']] },
    ],
    feedback: [
      { c: '11.feedback.0', eq: 'U₁ → M → ⟦0⟧ → M₂', blanks: [['U₂(M)', 'U₁†', 'M', 'U₁']] },
    ],
    bellReadout: [
      { c: '11.bellReadout.0', eq: 'P(00) = P(11) = ⟦0⟧', blanks: [['½', '¼', '1', '0']] },
      { c: '11.bellReadout.1', eq: 'ρ<sub>00,11</sub> = ⟦0⟧', blanks: [['½', '0', '¼', '1']] },
      { c: '11.bellReadout.2', eq: 'Δρ ∝ ⟦0⟧', blanks: [['|Φ⁺⟩⟨Φ⁺|', 'I₄/4', 'ρ<sub>mix</sub>', '|00⟩⟨00|']], hard: true },
    ],
  },
  // ---------- 12 · NMR dielňa (praktické NMR) ----------
  12: {
    intro: [
      { c: '12.intro.0', eq: 'ν₀ = ⟦0⟧ / 2π', blanks: [['γB₀', 'γB₁', 'B₀/γ', 'ħB₀']] },
    ],
    tune: [
      { c: '12.tune.0', eq: 'Δν = ν₀ − ⟦0⟧', blanks: [['ν<sub>RF</sub>', 'γB₁', 'ν₀/2', '1/T₂']] },
    ],
    pulse: [
      { c: '12.pulse.0', eq: 'θ = γ ⟦0⟧ τ', blanks: [['B₁', 'B₀', 'ν₀', 'I²']] },
      { c: '12.pulse.1', eq: 'R<sub>x</sub>(π/2)|0⟩ ∼ (|0⟩ − ⟦0⟧|1⟩)/√2', blanks: [['i', '1', '−1', '−i']], hard: true },
    ],
    sequence: [
      { c: '12.sequence.0', eq: 'S(t) ∝ M<sub>⊥</sub>(0) cos(2πΔν t) · ⟦0⟧', blanks: [['e<sup>−t/T₂*</sup>', 'e<sup>t/T₂*</sup>', 'e<sup>−T₂*/t</sup>', 'sin(t/T₂*)']] },
    ],
    calibrate: [
      { c: '12.calibrate.0', eq: 'τ₉₀ = ⟦0⟧', blanks: [['τ₁₈₀/2', '2τ₁₈₀', 'τ₁₈₀', 'τ₁₈₀/4']] },
    ],
    echo: [
      { c: '12.echo.0', eq: 't<sub>echo</sub> = ⟦0⟧', blanks: [['2τ', 'τ', 'τ/2', '4τ']] },
      { c: '12.echo.1', eq: 'T₂ ≤ ⟦0⟧', blanks: [['2T₁', 'T₂*', 'T₁/2', '0']], hard: true },
    ],
  },
  // ---------- 13 · Dračí štít ----------
  13: {
    intro: [
      { c: '13.intro.0', eq: 'P = ½(1 + r · ⟦0⟧)', blanks: [['n', 'r', 'σ', '|r|']] },
    ],
  },
};

const EqBlanks = {
  // kvízy pred krokom `step` levelu `num` (ľahká a laická: žiadne)
  for(num, step) {
    if (Settings.easy) return [];
    return (EQ_BLANKS[num]?.[step] || []).filter((b) => !b.hard || Settings.hard)
      .map((b) => ({ eq: b.eq, blanks: b.blanks, ctx: DL('blanks.' + b.c) }));
  },
  count(num) { return Object.values(EQ_BLANKS[num] || {}).flat().length; },
};
