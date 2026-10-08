'use strict';
// Renderer nad WebGL2 (OpenGL ES 3.0): jeden osvetľovací shader + procedurálne siete.

const VS = `#version 300 es
in vec3 aPos; in vec3 aNor;
uniform mat4 uModel, uView, uProj;
out vec3 vNor; out vec3 vWorld;
void main() {
  vec4 w = uModel * vec4(aPos, 1.0);
  vWorld = w.xyz;
  vNor = mat3(transpose(inverse(uModel))) * aNor;
  gl_Position = uProj * uView * w;
}`;

const FS = `#version 300 es
precision highp float;
in vec3 vNor; in vec3 vWorld;
uniform vec4 uColor; uniform vec3 uCam; uniform vec3 uLight;
uniform float uUnlit, uEmissive, uPattern, uFog, uTime;
uniform vec3 uFogColor;
out vec4 o;
void main() {
  vec3 base = uColor.rgb;
  if (uPattern > 0.5 && uPattern < 1.5) {          // mriežka na zemi
    vec2 g = abs(fract(vWorld.xz / 2.0) - 0.5);
    float line = smoothstep(0.46, 0.5, max(g.x, g.y));
    base = mix(base, base * 1.4 + 0.04, line * 0.55);
  } else if (uPattern > 1.5) {                     // vlniaca sa voda
    float w = sin(vWorld.x * 0.35 + uTime) * sin(vWorld.z * 0.31 - uTime * 0.8);
    base *= 0.9 + 0.12 * w;
  }
  if (uUnlit > 0.5) { o = vec4(base, uColor.a); return; }
  vec3 n = normalize(vNor); if (!gl_FrontFacing) n = -n;
  vec3 l = normalize(uLight), v = normalize(uCam - vWorld), h = normalize(l + v);
  float d = max(dot(n, l), 0.0), amb = 0.38 + 0.14 * n.y;
  float spec = pow(max(dot(n, h), 0.0), 48.0) * 0.45;
  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0) * 0.35;
  vec3 c = base * (amb + 0.72 * d) + vec3(spec) + base * rim + base * uEmissive;
  if (uFog > 0.0) c = mix(c, uFogColor, clamp(1.0 - exp(-uFog * length(uCam - vWorld)), 0.0, 0.8));
  o = vec4(c, uColor.a);
}`;

class Renderer {
  constructor(canvas) {
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!gl) throw new Error(tr('WebGL2 nie je dostupné', 'WebGL2 is not available'));
    this.gl = gl; this.canvas = canvas;
    this.prog = this.program(VS, FS);
    this.loc = {};
    for (const n of ['uModel', 'uView', 'uProj', 'uColor', 'uCam', 'uLight', 'uUnlit', 'uEmissive', 'uPattern', 'uFog', 'uFogColor', 'uTime'])
      this.loc[n] = gl.getUniformLocation(this.prog, n);
    this.aPos = gl.getAttribLocation(this.prog, 'aPos');
    this.aNor = gl.getAttribLocation(this.prog, 'aNor');
    this.meshes = {
      sphere: this.sphereMesh(32, 18), lowSphere: this.sphereMesh(12, 8), cylinder: this.cylinderMesh(20),
      cone: this.coneMesh(20), box: this.boxMesh(), disk: this.diskMesh(48), torus: this.torusMesh(48, 12, 0.08),
      circle: this.circleMesh(96), arc: this.arcMesh(96), dash: this.dashMesh(14), axes: this.linesMesh([[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1]]),
    };
    this.view = M4.ident(); this.proj = M4.ident(); this.vp = M4.ident(); this.cam = [0, 0, 5];
    this.shiftX = 0; this.fog = 0; this.fogColor = [0.06, 0.08, 0.16]; this.time = 0;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  program(vs, fs) {
    const gl = this.gl, mk = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const p = gl.createProgram();
    gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }

  mesh(pos, nor, idx, mode) {
    const gl = this.gl, vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = (data, loc) => {
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    };
    buf(pos, this.aPos); buf(nor, this.aNor);
    let count = pos.length / 3;
    if (idx) {
      const b = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
      count = idx.length;
    }
    gl.bindVertexArray(null);
    return { vao, count, indexed: !!idx, mode: mode ?? gl.TRIANGLES };
  }

  sphereMesh(seg, ring) {
    const p = [], n = [], idx = [];
    for (let r = 0; r <= ring; r++) {
      const t = Math.PI * r / ring;
      for (let s = 0; s <= seg; s++) {
        const f = 2 * Math.PI * s / seg, v = [Math.sin(t) * Math.cos(f), Math.cos(t), Math.sin(t) * Math.sin(f)];
        p.push(...v); n.push(...v);
      }
    }
    for (let r = 0; r < ring; r++) for (let s = 0; s < seg; s++) {
      const a = r * (seg + 1) + s, b = a + seg + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    return this.mesh(p, n, idx);
  }

  cylinderMesh(seg) { // polomer 1, y od 0 po 1, s viečkami
    const p = [], n = [], idx = [];
    for (let s = 0; s <= seg; s++) {
      const f = 2 * Math.PI * s / seg, x = Math.cos(f), z = Math.sin(f);
      p.push(x, 0, z, x, 1, z); n.push(x, 0, z, x, 0, z);
    }
    for (let s = 0; s < seg; s++) { const a = s * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    for (const y of [0, 1]) {
      const c = p.length / 3; p.push(0, y, 0); n.push(0, y ? 1 : -1, 0);
      for (let s = 0; s <= seg; s++) { const f = 2 * Math.PI * s / seg; p.push(Math.cos(f), y, Math.sin(f)); n.push(0, y ? 1 : -1, 0); }
      for (let s = 0; s < seg; s++) idx.push(c, c + 1 + s, c + 2 + s);
    }
    return this.mesh(p, n, idx);
  }

  coneMesh(seg) { // polomer 1 pri y=0, špička v y=1
    const p = [], n = [], idx = [], k = 1 / Math.SQRT2;
    for (let s = 0; s <= seg; s++) {
      const f = 2 * Math.PI * s / seg, x = Math.cos(f), z = Math.sin(f);
      p.push(x, 0, z, 0, 1, 0); n.push(x * k, k, z * k, x * k, k, z * k);
    }
    for (let s = 0; s < seg; s++) { const a = s * 2; idx.push(a, a + 1, a + 2); }
    const c = p.length / 3; p.push(0, 0, 0); n.push(0, -1, 0);
    for (let s = 0; s <= seg; s++) { const f = 2 * Math.PI * s / seg; p.push(Math.cos(f), 0, Math.sin(f)); n.push(0, -1, 0); }
    for (let s = 0; s < seg; s++) idx.push(c, c + 1 + s, c + 2 + s);
    return this.mesh(p, n, idx);
  }

  boxMesh() { // kocka -0.5..0.5
    const p = [], n = [], idx = [];
    const faces = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 1, 0], [0, 0, -1]], [[0, 1, 0], [0, 0, 1], [1, 0, 0]],
                   [[0, -1, 0], [0, 0, -1], [1, 0, 0]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [-1, 0, 0], [0, 1, 0]]];
    for (const [nn, u, v] of faces) {
      const b = p.length / 3;
      for (const [a, c] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        p.push(nn[0] * 0.5 + (u[0] * a + v[0] * c) * 0.5, nn[1] * 0.5 + (u[1] * a + v[1] * c) * 0.5, nn[2] * 0.5 + (u[2] * a + v[2] * c) * 0.5);
        n.push(...nn);
      }
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
    return this.mesh(p, n, idx);
  }

  diskMesh(seg) {
    const p = [0, 0, 0], n = [0, 1, 0], idx = [];
    for (let s = 0; s <= seg; s++) { const f = 2 * Math.PI * s / seg; p.push(Math.cos(f), 0, Math.sin(f)); n.push(0, 1, 0); }
    for (let s = 0; s < seg; s++) idx.push(0, s + 2, s + 1);
    return this.mesh(p, n, idx);
  }

  torusMesh(seg, ring, r) { // v rovine xz, hlavný polomer 1
    const p = [], n = [], idx = [];
    for (let i = 0; i <= seg; i++) {
      const f = 2 * Math.PI * i / seg, cx = Math.cos(f), cz = Math.sin(f);
      for (let j = 0; j <= ring; j++) {
        const t = 2 * Math.PI * j / ring, nx = Math.cos(t) * cx, ny = Math.sin(t), nz = Math.cos(t) * cz;
        p.push(cx + r * nx, r * ny, cz + r * nz); n.push(nx, ny, nz);
      }
    }
    for (let i = 0; i < seg; i++) for (let j = 0; j < ring; j++) {
      const a = i * (ring + 1) + j, b = a + ring + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    return this.mesh(p, n, idx);
  }

  circleMesh(seg) {
    const p = [], n = [];
    for (let s = 0; s < seg; s++) { const f = 2 * Math.PI * s / seg; p.push(Math.cos(f), 0, Math.sin(f)); n.push(0, 1, 0); }
    return this.mesh(p, n, null, this.gl.LINE_LOOP);
  }

  // celý kruh ako lomená čiara (97 bodov) — kreslí sa len časť cez o.count (oblúk uhla)
  arcMesh(seg) {
    const p = [], n = [];
    for (let s = 0; s <= seg; s++) { const f = 2 * Math.PI * s / seg; p.push(Math.cos(f), 0, Math.sin(f)); n.push(0, 1, 0); }
    return this.mesh(p, n, null, this.gl.LINE_STRIP);
  }

  // prerušovaná úsečka pozdĺž osi y od 0 po 1
  dashMesh(k) {
    const p = [];
    for (let i = 0; i < k; i++) p.push([0, i / k, 0], [0, (i + 0.55) / k, 0]);
    return this.linesMesh(p);
  }

  linesMesh(pts) { return this.mesh(pts.flat(), pts.flatMap(() => [0, 1, 0]), null, this.gl.LINES); }

  // dynamická lomená čiara (napr. graf); vráti mesh, ktorý sa dá znovu naplniť cez updateLine
  lineStrip(pts) { return this.mesh(pts.flat(), pts.flatMap(() => [0, 1, 0]), null, this.gl.LINE_STRIP); }

  resize() {
    const c = this.canvas, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(c.clientWidth * dpr), h = Math.floor(c.clientHeight * dpr);
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    this.gl.viewport(0, 0, w, h);
    return w / Math.max(h, 1);
  }

  begin(eye, target, fov = Settings.view.fov) {
    const gl = this.gl, aspect = this.resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.cam = eye;
    this.view = M4.lookAt(eye, target, [0, 1, 0]);
    this.proj = M4.perspective(fov, aspect, 0.05, 400);
    this.proj[8] = this.shiftX || 0; // posun obrazu doľava, aby ho nezakrýval panel
    this.vp = M4.mul(this.proj, this.view);
    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(this.loc.uView, false, this.view);
    gl.uniformMatrix4fv(this.loc.uProj, false, this.proj);
    gl.uniform3fv(this.loc.uCam, eye);
    gl.uniform3fv(this.loc.uLight, [0.45, 0.85, 0.35]);
    gl.uniform1f(this.loc.uFog, this.fog);
    gl.uniform3fv(this.loc.uFogColor, this.fogColor);
    gl.uniform1f(this.loc.uTime, this.time);
  }

  // o: { emissive, unlit, pattern, alpha }
  draw(meshName, model, color, o = {}) {
    const gl = this.gl, m = typeof meshName === 'string' ? this.meshes[meshName] : meshName;
    const a = o.alpha ?? 1;
    gl.uniformMatrix4fv(this.loc.uModel, false, model);
    gl.uniform4f(this.loc.uColor, color[0], color[1], color[2], a);
    gl.uniform1f(this.loc.uUnlit, o.unlit || m.mode !== gl.TRIANGLES ? 1 : 0);
    gl.uniform1f(this.loc.uEmissive, o.emissive || 0);
    gl.uniform1f(this.loc.uPattern, o.pattern || 0);
    gl.depthMask(a >= 1);
    gl.bindVertexArray(m.vao);
    if (m.indexed) gl.drawElements(m.mode, m.count, gl.UNSIGNED_SHORT, 0);
    else gl.drawArrays(m.mode, 0, Math.min(m.count, o.count ?? m.count));
    gl.depthMask(true);
  }

  // šípka z bodu a do bodu b
  arrow(a, b, color, r = 0.04, o = {}) {
    const d = V3.sub(b, a), L = V3.len(d);
    if (L < 1e-4) return;
    const head = Math.min(r * 4, L * 0.45);
    this.draw('cylinder', M4.alignY(a, d, L - head, r), color, o);
    this.draw('cone', M4.alignY(V3.add(a, V3.scale(V3.norm(d), L - head)), d, head, r * 2.3), color, o);
  }

  // valček medzi dvoma bodmi (hrubá čiara)
  rod(a, b, color, r = 0.02, o = {}) {
    const d = V3.sub(b, a), L = V3.len(d);
    if (L > 1e-5) this.draw('cylinder', M4.alignY(a, d, L, r), color, o);
  }

  sphere(p, r, color, o = {}) { this.draw('sphere', M4.trs(p, 0, r), color, o); }

  // prerušovaná čiara z a do b
  dash(a, b, color, o = {}) {
    const d = V3.sub(b, a), L = V3.len(d);
    if (L > 1e-4) this.draw('dash', M4.alignY(a, d, L, 1), color, o);
  }

  // oblúk polomeru R so stredom c: začína v smere u, otáča sa k smeru w (u ⟂ w), uhol ang
  arc(c, u, w, R, ang, color, o = {}) {
    if (ang < 1e-3) return;
    const n = V3.cross(u, w), m = new Float32Array(16);
    m[0] = u[0] * R; m[1] = u[1] * R; m[2] = u[2] * R;
    m[4] = n[0]; m[5] = n[1]; m[6] = n[2];
    m[8] = w[0] * R; m[9] = w[1] * R; m[10] = w[2] * R;
    m[12] = c[0]; m[13] = c[1]; m[14] = c[2]; m[15] = 1;
    this.draw('arc', m, color, { ...o, count: Math.ceil(ang / (2 * Math.PI) * 96) + 1 });
  }

  // projekcia svetového bodu na obrazovku v CSS pixeloch; null, ak je za kamerou
  project(p) {
    const v = M4.transform(this.vp, p);
    if (v[3] <= 0.05) return null;
    return [(v[0] * 0.5 + 0.5) * this.canvas.clientWidth, (1 - (v[1] * 0.5 + 0.5)) * this.canvas.clientHeight];
  }
}

// Kvantové súradnice (x, y, z) → svetové súradnice OpenGL, kde je „hore“ os y.
const qToWorld = (v) => [v[0], v[2], -v[1]];

// Blochova sféra: sklenená guľa, osi, rovník, popisky stavov a šípka stavu.
// Voliteľné vizualizácie (Settings.view): mriežka, projekcie na osi, uhly θ a φ, stĺpce P(0), P(1).
// o: { target, trail, labelFn, key, labels, axisNames, color, glass, bars, detail }
const Bloch = {
  draw(r, center, radius, vec, o = {}) {
    const V = Settings.view, P = (q) => V3.add(center, V3.scale(qToWorld(q), radius));
    const lab = o.labelFn && o.labels !== false ? o.labelFn : null, key = o.key || 'b';
    r.draw('circle', M4.trs(center, 0, radius), [0.55, 0.75, 1]);                                   // rovník
    r.draw('circle', M4.orient(center, [1, 0, 0], radius), [0.35, 0.45, 0.7]);                     // poludník
    r.draw('circle', M4.orient(center, [0, 0, 1], radius), [0.35, 0.45, 0.7]);
    r.draw('axes', M4.trs(center, 0, radius * 1.18), [0.6, 0.65, 0.8]);
    if (V.grid && o.detail !== false) {
      for (const t of [30, 60, 120, 150]) {
        const a = t * Math.PI / 180;
        r.draw('circle', M4.trs(V3.add(center, [0, radius * Math.cos(a), 0]), 0, radius * Math.sin(a)), [0.4, 0.5, 0.75], { alpha: 0.4 }); // rovnobežky
        r.draw('circle', M4.orient(center, [Math.cos(a), 0, Math.sin(a)], radius), [0.4, 0.5, 0.75], { alpha: 0.4 });                     // poludníky
      }
    }
    if (o.target) r.arrow(center, P(o.target), [1, 0.85, 0.2], radius * 0.025, { alpha: 0.55, emissive: 0.4 });
    if (o.trail && V.trail) for (const t of o.trail) r.sphere(P(t), radius * 0.012, [0.5, 0.9, 1], { unlit: 1 });
    const L = vec ? V3.len(vec) : 0;
    if (vec) {
      if (L > 0.02) r.arrow(center, P(vec), o.color || [1, 0.35, 0.45], radius * 0.035, { emissive: 0.35 });
      else r.sphere(center, radius * 0.06, o.color || [1, 0.35, 0.45], { emissive: 0.5 });
      if (L > 0.02) r.sphere(P(vec), radius * 0.05, o.color || [1, 0.35, 0.45], { emissive: 0.6 });
    }
    if (vec && L > 0.02 && o.detail !== false) {
      const w = qToWorld(vec), tip = P(vec), zFoot = V3.add(center, [0, w[1] * radius, 0]), eq = V3.add(center, [w[0] * radius, 0, w[2] * radius]);
      const hor = Math.hypot(vec[0], vec[1]);
      if (V.proj) {
        r.dash(tip, zFoot, [1, 0.8, 0.4]);
        if (hor > 0.03) { r.dash(tip, eq, [0.6, 0.9, 1]); r.dash(center, eq, [0.6, 0.9, 1]); }
        r.rod(center, zFoot, [1, 0.8, 0.4], radius * 0.012, { emissive: 0.6 });                     // ⟨Z⟩ na osi z
        r.sphere(zFoot, radius * 0.03, [1, 0.8, 0.4], { emissive: 0.8 });
        if (lab) {
          lab(key + 'pz', V3.add(zFoot, [-radius * 0.32, 0, 0]), `⟨Z⟩ = ${Fmt.num(vec[2], 2)}`, 'axis tiny',
            tr('Projekcia Blochovho vektora na os z = stredná hodnota ⟨Z⟩ = P(0) − P(1).', 'Projection of the Bloch vector onto the z axis = expectation value ⟨Z⟩ = P(0) − P(1).'));
          if (hor > 0.03) lab(key + 'pxy', V3.add(eq, [0, -radius * 0.12, 0]), `⟨X⟩ = ${Fmt.num(vec[0], 2)}, ⟨Y⟩ = ${Fmt.num(vec[1], 2)}`, 'axis tiny',
            tr('Projekcia do roviny xy: stredné hodnoty ⟨X⟩, ⟨Y⟩. Jej dĺžka je veľkosť koherencie (2|ρ₀₁|), jej smer je relatívna fáza φ.',
              'Projection onto the xy plane: expectation values ⟨X⟩, ⟨Y⟩. Its length is the size of the coherence (2|ρ₀₁|), its direction is the relative phase φ.'));
        }
      }
      if (V.angles) {
        const u = V3.norm(w), up = [0, 1, 0], th = Math.acos(clamp(u[1], -1, 1));
        const h = hor > 1e-3 ? V3.norm([w[0], 0, w[2]]) : [1, 0, 0];
        r.arc(center, up, h, radius * 0.32, th, [1, 0.6, 0.9]);
        if (lab && th > 0.08) lab(key + 'th', V3.add(center, V3.scale(V3.add(V3.scale(up, Math.cos(th / 2)), V3.scale(h, Math.sin(th / 2))), radius * 0.44)), 'θ', 'axis',
          tr('θ — uhol od severného pólu |0⟩. Určuje P(0) = cos²(θ/2).', 'θ — angle from the north pole |0⟩. Sets P(0) = cos²(θ/2).'));
        if (hor > 0.03) {
          let ph = Math.atan2(vec[1], vec[0]); if (ph < 0) ph += 2 * Math.PI;
          r.arc(center, [1, 0, 0], [0, 0, -1], radius * 0.45, ph, [0.6, 1, 0.7]);
          if (lab) lab(key + 'ph', V3.add(center, [Math.cos(ph / 2) * radius * 0.57, 0.02, -Math.sin(ph / 2) * radius * 0.57]), 'φ', 'axis',
            tr('φ — relatívna fáza: uhol v rovníkovej rovine od osi x.', 'φ — relative phase: angle in the equatorial plane from the x axis.'));
        }
      }
    }
    if (vec && o.bars && V.bars) {
      // stĺpce stoja vzadu vľavo (mimo predvoleného pohľadu kamery), výška 1,6 R = pravdepodobnosť 1
      const p0 = clamp((1 + vec[2]) / 2, 0, 1), base = V3.add(center, [-radius * 1.9, -radius, -radius * 1.2]), H = radius * 1.6;
      [[p0, [0.45, 0.65, 1], 0], [1 - p0, [1, 0.45, 0.45], 1]].forEach(([p, col, k]) => {
        const b = V3.add(base, [k * radius * 0.3, 0, 0]);
        r.draw('cylinder', M4.trs(b, 0, [radius * 0.08, H, radius * 0.08]), [1, 1, 1], { alpha: 0.1 });
        r.draw('cylinder', M4.trs(b, 0, [radius * 0.07, Math.max(p * H, 0.005), radius * 0.07]), col, { emissive: 0.3 });
        if (lab) lab(key + 'bar' + k, V3.add(b, [0, p * H + radius * (0.15 + k * 0.17), 0]), `P(${k}) = ${Fmt.pct(p)}`, 'axis tiny',
          tr(`Pravdepodobnosť výsledku ${k} pri meraní v Z-báze.`, `Probability of outcome ${k} for a measurement in the Z basis.`));
      });
    }
    r.sphere(center, radius, o.glass || [0.45, 0.6, 1], { alpha: V.glass });
    if (typeof UI !== 'undefined' && UI.hot) {
      if (vec) UI.hot(L > 0.02 ? P(vec) : center, tr(
        `<b>Blochov vektor</b> (šípka stavu). Dĺžka ${Fmt.num(L, 2)} → ${L > 0.99 ? '<b>čistý stav</b> (na povrchu)' : L < 0.02 ? '<b>maximálne zmiešaný stav</b> I/2 (stred)' : '<b>zmiešaný stav</b> (vnútri gule)'}.<br>Smer hore = |0⟩, dole = |1⟩, rovník = superpozície.`,
        `<b>Bloch vector</b> (the state arrow). Length ${Fmt.num(L, 2)} → ${L > 0.99 ? '<b>pure state</b> (on the surface)' : L < 0.02 ? '<b>maximally mixed state</b> I/2 (centre)' : '<b>mixed state</b> (inside the ball)'}.<br>Up = |0⟩, down = |1⟩, equator = superpositions.`), 26);
      if (o.target) UI.hot(P(o.target), tr('<b>Cieľ</b> — sem dostaň šípku stavu.', '<b>Target</b> — get the state arrow here.'), 22);
      UI.hot(center, tr('<b>Blochova sféra</b>: obraz stavu qubitu (nie priestor laboratória!). Povrch = čisté stavy, vnútro = zmiešané. Hradlá sú rotácie gule.',
        '<b>Bloch sphere</b>: a picture of the qubit state (not laboratory space!). Surface = pure states, interior = mixed. Gates are rotations of the ball.'), 70);
    }
    if (lab) {
      const Ls = [[[0, 0, 1], '|0⟩'], [[0, 0, -1], '|1⟩'], [[1, 0, 0], '|+⟩'], [[-1, 0, 0], '|−⟩'], [[0, 1, 0], '|+i⟩'], [[0, -1, 0], '|−i⟩']];
      for (const [q, t] of Ls) lab(key + t, V3.add(center, V3.scale(qToWorld(q), radius * 1.28)), t, 'ket');
      if (o.axisNames) for (const [q, t] of [[[1.45, 0, 0], 'x'], [[0, 1.45, 0], 'y'], [[0, 0, 1.45], 'z']])
        lab(key + 'ax' + t, V3.add(center, V3.scale(qToWorld(q), radius)), t, 'axis');
    }
  },
};
