'use strict';
// Malý kvantový simulátor: jeden qubit (2 amplitúdy) a dva qubity (4 amplitúdy).

const s2 = Math.SQRT1_2;
const Gate = {
  I: [[C.of(1), C.of(0)], [C.of(0), C.of(1)]],
  X: [[C.of(0), C.of(1)], [C.of(1), C.of(0)]],
  Y: [[C.of(0), C.of(0, -1)], [C.of(0, 1), C.of(0)]],
  Z: [[C.of(1), C.of(0)], [C.of(0), C.of(-1)]],
  H: [[C.of(s2), C.of(s2)], [C.of(s2), C.of(-s2)]],
  S: [[C.of(1), C.of(0)], [C.of(0), C.of(0, 1)]],
  Sdg: [[C.of(1), C.of(0)], [C.of(0), C.of(0, -1)]],
  T: [[C.of(1), C.of(0)], [C.of(0), C.exp(Math.PI / 4)]],
  // rotácia o uhol t okolo jednotkovej osi n = (nx, ny, nz): cos(t/2) I − i sin(t/2) n·σ
  R(n, t) {
    const c = Math.cos(t / 2), s = Math.sin(t / 2);
    return [[C.of(c, -s * n[2]), C.of(-s * n[1], -s * n[0])],
            [C.of(s * n[1], -s * n[0]), C.of(c, s * n[2])]];
  },
  Rx: (t) => Gate.R([1, 0, 0], t),
  Ry: (t) => Gate.R([0, 1, 0], t),
  Rz: (t) => Gate.R([0, 0, 1], t),
};

// Ako sa hradlo prejaví na Blochovej sfére (os, uhol) — kvôli animácii.
const GateAxis = {
  X: [[1, 0, 0], Math.PI], Y: [[0, 1, 0], Math.PI], Z: [[0, 0, 1], Math.PI],
  H: [[s2, 0, s2], Math.PI], S: [[0, 0, 1], Math.PI / 2], Sdg: [[0, 0, 1], -Math.PI / 2], T: [[0, 0, 1], Math.PI / 4],
};

const Q = {
  ket0: () => [C.of(1), C.of(0)],
  ket1: () => [C.of(0), C.of(1)],
  fromBloch(theta, phi) { return [C.of(Math.cos(theta / 2)), C.scale(C.exp(phi), Math.sin(theta / 2))]; },
  named(name) {
    return {
      '0': Q.ket0(), '1': Q.ket1(), '+': [C.of(s2), C.of(s2)], '-': [C.of(s2), C.of(-s2)],
      '+i': [C.of(s2), C.of(0, s2)], '-i': [C.of(s2), C.of(0, -s2)],
    }[name];
  },
  apply(U, p) { return [C.add(C.mul(U[0][0], p[0]), C.mul(U[0][1], p[1])), C.add(C.mul(U[1][0], p[0]), C.mul(U[1][1], p[1]))]; },
  inner(a, b) { return C.add(C.mul(C.conj(a[0]), b[0]), C.mul(C.conj(a[1]), b[1])); }, // ⟨a|b⟩
  probs(p) { return [C.abs2(p[0]), C.abs2(p[1])]; },
  // Blochov vektor v súradniciach (x, y, z) kvantovej mechaniky
  bloch(p) {
    const ab = C.mul(C.conj(p[0]), p[1]);
    return [2 * ab[0], 2 * ab[1], C.abs2(p[0]) - C.abs2(p[1])];
  },
  // zhoda až na globálnu fázu: |⟨a|b⟩|²
  fidelity(a, b) { return C.abs2(Q.inner(a, b)); },
  // pravdepodobnosť výsledku „+“ pri meraní pozdĺž osi n (Blochov vektor r): (1 + r·n)/2
  probAlong(r, n) { return (1 + V3.dot(r, n)) / 2; },
  // pekný zápis α|0⟩ + β|1⟩ (vytiahne globálnu fázu tak, aby α bolo reálne a ≥ 0)
  ketString(p, canonical = true) {
    let a = p[0], b = p[1];
    if (canonical) { const g = C.exp(-C.arg(C.abs(a) > 1e-6 ? a : b)); a = C.mul(a, g); b = C.mul(b, g); }
    return joinTerms([[a, '|0⟩'], [b, '|1⟩']]);
  },
};

// Dva qubity: amplitúdy v poradí |00⟩, |01⟩, |10⟩, |11⟩ (prvý znak = qubit A).
const Q2 = {
  zero: () => [C.of(1), C.of(0), C.of(0), C.of(0)],
  apply1(U, q, psi) {
    const out = psi.map((c) => [c[0], c[1]]);
    for (let i = 0; i < 4; i++) {
      const bit = q === 0 ? (i >> 1) & 1 : i & 1;
      if (bit) continue;
      const j = q === 0 ? i | 2 : i | 1;
      out[i] = C.add(C.mul(U[0][0], psi[i]), C.mul(U[0][1], psi[j]));
      out[j] = C.add(C.mul(U[1][0], psi[i]), C.mul(U[1][1], psi[j]));
    }
    return out;
  },
  cnot(psi) { return [psi[0], psi[1], psi[3], psi[2]]; }, // riadiaci A, cieľový B
  // redukovaný Blochov vektor qubitu q (čiastočná stopa)
  reducedBloch(psi, q) {
    const ex = (U) => {
      const v = Q2.apply1(U, q, psi);
      let s = 0;
      for (let i = 0; i < 4; i++) s += C.mul(C.conj(psi[i]), v[i])[0];
      return s;
    };
    return [ex(Gate.X), ex(Gate.Y), ex(Gate.Z)];
  },
  // meranie oboch qubitov pozdĺž osí v rovine xz pod uhlami ta, tb (0 = os z)
  sample(psi, ta, tb) {
    let st = Q2.apply1(Gate.Ry(-ta), 0, psi);
    st = Q2.apply1(Gate.Ry(-tb), 1, st);
    const p = st.map(C.abs2);
    let r = rand(), k = 0;
    while (k < 3 && r > p[k]) { r -= p[k]; k++; }
    return [(k >> 1) & 1, k & 1];
  },
  entangled(psi) { return V3.len(Q2.reducedBloch(psi, 0)) < 0.99; },
  ketString(psi) { return joinTerms(psi.map((c, i) => [c, ['|00⟩', '|01⟩', '|10⟩', '|11⟩'][i]])); },
};

// spojí členy [amplitúda, ket] do čitateľného reťazca, napr. „1/√2|0⟩ − 1/√2|1⟩“
function joinTerms(terms) {
  let out = '';
  for (const [c, ket] of terms) {
    if (C.abs2(c) < 1e-6) continue;
    let s = Fmt.complex(c), neg = false;
    if (s.startsWith('−')) { neg = true; s = s.slice(1); }
    if (s === '1') s = '';
    out += out ? (neg ? ' − ' : ' + ') + s + ket : (neg ? '−' : '') + s + ket;
  }
  return out || '0';
}
