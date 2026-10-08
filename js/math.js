'use strict';
// Vektory, matice 4x4 (column-major pre OpenGL) a komplexné čísla [re, im].

const V3 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm(a) { const l = V3.len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
  // Rodriguesova rotácia vektora v okolo jednotkovej osi k o uhol t
  rotate(v, k, t) {
    const c = Math.cos(t), s = Math.sin(t), kv = V3.cross(k, v), kd = V3.dot(k, v) * (1 - c);
    return [v[0] * c + kv[0] * s + k[0] * kd, v[1] * c + kv[1] * s + k[1] * kd, v[2] * c + kv[2] * s + k[2] * kd];
  },
};

const M4 = {
  ident() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 4; r++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
        o[c * 4 + r] = s;
      }
    return o;
  },
  perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), m = new Float32Array(16);
    m[0] = f / aspect; m[5] = f; m[10] = (far + near) / (near - far); m[11] = -1; m[14] = 2 * far * near / (near - far);
    return m;
  },
  lookAt(eye, c, up) {
    const z = V3.norm(V3.sub(eye, c)), x = V3.norm(V3.cross(up, z)), y = V3.cross(z, x), m = new Float32Array(16);
    m[0] = x[0]; m[4] = x[1]; m[8] = x[2];
    m[1] = y[0]; m[5] = y[1]; m[9] = y[2];
    m[2] = z[0]; m[6] = z[1]; m[10] = z[2];
    m[12] = -V3.dot(x, eye); m[13] = -V3.dot(y, eye); m[14] = -V3.dot(z, eye); m[15] = 1;
    return m;
  },
  // posun + rotácia okolo osi y + škálovanie (s môže byť číslo alebo [sx,sy,sz])
  trs(p, rotY = 0, s = 1) {
    const sc = typeof s === 'number' ? [s, s, s] : s, c = Math.cos(rotY), n = Math.sin(rotY), m = new Float32Array(16);
    m[0] = c * sc[0]; m[2] = -n * sc[0];
    m[5] = sc[1];
    m[8] = n * sc[2]; m[10] = c * sc[2];
    m[12] = p[0]; m[13] = p[1]; m[14] = p[2]; m[15] = 1;
    return m;
  },
  // matica, ktorá zobrazí os y na smer d (dĺžky len), polomer r v x/z, posun p
  alignY(p, d, len, r) {
    const y = V3.norm(d), ref = Math.abs(y[1]) < 0.95 ? [0, 1, 0] : [1, 0, 0];
    const x = V3.norm(V3.cross(ref, y)), z = V3.cross(x, y), m = new Float32Array(16);
    m[0] = x[0] * r; m[1] = x[1] * r; m[2] = x[2] * r;
    m[4] = y[0] * len; m[5] = y[1] * len; m[6] = y[2] * len;
    m[8] = z[0] * r; m[9] = z[1] * r; m[10] = z[2] * r;
    m[12] = p[0]; m[13] = p[1]; m[14] = p[2]; m[15] = 1;
    return m;
  },
  // matica, ktorá otočí rovinu xz tak, aby jej normála (os y) mala smer d
  orient(p, d, s) { return M4.alignY(p, d, s, s); },
  transform(m, v) {
    const x = v[0], y = v[1], z = v[2];
    const w = m[3] * x + m[7] * y + m[11] * z + m[15];
    return [(m[0] * x + m[4] * y + m[8] * z + m[12]) / w, (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
            (m[2] * x + m[6] * y + m[10] * z + m[14]) / w, w];
  },
};

// Komplexné čísla ako dvojice [re, im]
const C = {
  of: (re, im = 0) => [re, im],
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
  mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
  scale: (a, s) => [a[0] * s, a[1] * s],
  conj: (a) => [a[0], -a[1]],
  abs2: (a) => a[0] * a[0] + a[1] * a[1],
  abs: (a) => Math.hypot(a[0], a[1]),
  arg: (a) => Math.atan2(a[1], a[0]),
  exp: (phi) => [Math.cos(phi), Math.sin(phi)], // e^{i·phi}
};

// Formátovanie čísel po slovensky (desatinná čiarka, známe hodnoty ako ½ či 1/√2)
const Fmt = {
  num(x, d = 3) {
    const known = [[0, '0'], [1, '1'], [0.5, '½'], [Math.SQRT1_2, '1/√2'], [0.25, '¼'], [0.75, '¾']];
    const a = Math.abs(x), sg = x < 0 ? '−' : '';
    for (const [v, s] of known) if (Math.abs(a - v) < 5e-4) return v === 0 ? '0' : sg + s;
    return sg + a.toFixed(d).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
  },
  complex(c) {
    const re = Math.abs(c[0]) < 5e-4 ? 0 : c[0], im = Math.abs(c[1]) < 5e-4 ? 0 : c[1];
    if (im === 0) return Fmt.num(re);
    const imS = (Math.abs(Math.abs(im) - 1) < 5e-4 ? '' : Fmt.num(Math.abs(im))) + 'i';
    if (re === 0) return (im < 0 ? '−' : '') + imS;
    return '(' + Fmt.num(re) + (im < 0 ? ' − ' : ' + ') + imS + ')';
  },
  pct: (p) => Math.round(p * 100) + ' %',
  angle(t) {
    const k = t / Math.PI, known = [[0, '0'], [1, 'π'], [0.5, 'π/2'], [0.25, 'π/4'], [0.75, '3π/4'], [1.5, '3π/2'], [2, '2π'], [-0.5, '−π/2'], [-1, '−π'], [-0.25, '−π/4']];
    for (const [v, s] of known) if (Math.abs(k - v) < 0.01) return s;
    return Fmt.num(k, 2) + 'π';
  },
};

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const rand = Math.random;
