'use strict';
// Renderer nad WebGL2 (OpenGL ES 3.0): jeden osvetľovací shader + procedurálne siete.

const VS = `#version 300 es
in vec3 aPos; in vec3 aNor;
uniform mat4 uModel, uView, uProj;
out vec3 vNor; out vec3 vWorld; out vec3 vObj;
void main() {
  vec4 w = uModel * vec4(aPos, 1.0);
  vWorld = w.xyz; vObj = aPos;
  vNor = mat3(transpose(inverse(uModel))) * aNor;
  gl_Position = uProj * uView * w;
}`;

const FS = `#version 300 es
precision highp float;
in vec3 vNor; in vec3 vWorld; in vec3 vObj;
uniform vec4 uColor; uniform vec3 uCam; uniform vec3 uLight;
uniform float uUnlit, uEmissive, uPattern, uFog, uTime, uDetail, uTheme;
uniform vec3 uFogColor;
out vec4 o;
// procedurálny šum pre severské textúry (sneh, kameň, drevo, šupiny)
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
}
// uDetail = 1: vysoké rozlíšenie textúr (viac oktáv, jemné detaily, reliéf); 0 = pôvodné lacné textúry
float fbm(vec2 p) {
  int oct = uDetail > 0.5 ? 8 : 5;
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 8; i++) { if (i >= oct) break; s += a * vnoise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return s;
}
// jemný detail zmizne tam, kde by sa zlieval do šumu (ďaleko / šikmo)
float lod(vec2 p) { vec2 w = fwidth(p); return 1.0 - smoothstep(0.25, 0.9, max(w.x, w.y)); }
// reliéf bez UV (Mikkelsen 2010): normála sa nakloní podľa gradientu výšky h v obrazovke
vec3 bump(vec3 n, float h, float k) {
  vec3 dpdx = dFdx(vWorld), dpdy = dFdy(vWorld);
  vec3 r1 = cross(dpdy, n), r2 = cross(n, dpdx);
  float det = dot(dpdx, r1);
  vec3 g = sign(det) * (dFdx(h) * r1 + dFdy(h) * r2);
  return normalize(abs(det) * n - k * g);
}
// rovina podľa dominantnej osi normály (lacné „triplanárne“ mapovanie)
vec2 plane(vec3 p, vec3 n) { vec3 a = abs(n); return a.y > max(a.x, a.z) ? p.xz : (a.x > a.z ? p.zy : p.xy); }
const vec3 SNOW = vec3(0.86, 0.9, 0.96);
void main() {
  vec3 base = uColor.rgb;
  vec3 n = normalize(vNor); if (!gl_FrontFacing) n = -n;
  float matte = 1.0, hgt = 0.0, bk = 0.0, sparkle = 0.0;
  bool hi = uDetail > 0.5;
  if (uPattern > 0.5 && uPattern < 1.5) {          // mriežka na zemi
    vec2 g = abs(fract(vWorld.xz / 2.0) - 0.5);
    float line = smoothstep(0.46, 0.5, max(g.x, g.y));
    base = mix(base, base * 1.4 + 0.04, line * 0.55);
  } else if (uPattern > 1.5 && uPattern < 2.5) {   // studené more
    if (uTheme < 0.5 || uTheme > 1.5) {           // klasická a MMO téma: pôvodná vlniaca sa voda
      float w = sin(vWorld.x * 0.35 + uTime) * sin(vWorld.z * 0.31 - uTime * 0.8);
      base *= 0.9 + 0.12 * w;
    } else {
      float w = sin(vWorld.x * 0.35 + uTime) * sin(vWorld.z * 0.31 - uTime * 0.8) + fbm(vWorld.xz * 0.25 + uTime * 0.15) - 0.5;
      base *= 0.88 + 0.14 * w;
    }
    if (hi) { hgt = fbm(vWorld.xz * 0.6 + vec2(uTime * 0.2, -uTime * 0.13)); bk = 0.35; }
  } else if (uPattern > 2.5 && uPattern < 3.5) {   // tundra so snehom
    float f = fbm(vWorld.xz * 0.12), d = fbm(vWorld.xz * 1.7);
    vec3 grass = mix(base * 0.8, base * vec3(1.15, 1.05, 0.8), d);
    float snow = smoothstep(0.48, 0.62, f + 0.12 * d);
    base = mix(grass, SNOW * (0.92 + 0.08 * d), snow);
    float rock = smoothstep(0.62, 0.7, fbm(vWorld.xz * 0.4 + 9.0)) * (1.0 - snow);
    base = mix(base, vec3(0.36, 0.35, 0.33), rock * 0.6); // kamene
    matte = 0.3;
    if (hi) {
      vec2 gp = vWorld.xz * 38.0; float m = fbm(vWorld.xz * 9.0), g = mix(0.5, vnoise(gp), lod(gp));
      base *= mix(0.86 + 0.28 * m * (0.7 + 0.6 * g), 0.95 + 0.08 * m, snow); // tráva / jemné zrno snehu
      base = mix(base, base * vec3(1.12, 0.95, 0.7), smoothstep(0.55, 0.75, fbm(vWorld.xz * 0.9 + 4.0)) * (1.0 - snow) * 0.5); // suchá tráva
      hgt = f * 0.6 + d * 0.3 + m * 0.18 + rock * 0.4; bk = 0.07;
      sparkle = snow * step(0.992, h21(floor(vWorld.xz * 45.0))) * lod(vWorld.xz * 45.0);
    }
  } else if (uPattern > 3.5 && uPattern < 4.5) {   // kameň (svet), sneh na vrchných plochách
    vec2 q = plane(vWorld, n) * 1.3;
    float f = fbm(q), big = fbm(q * 0.23 + 3.0), r = 1.0 - abs(2.0 * vnoise(q * 1.7) - 1.0);
    base *= (0.68 + 0.45 * f) * (0.82 + 0.36 * big);
    base *= mix(1.0, 0.72, smoothstep(0.95, 0.995, r));
    float cover = smoothstep(0.55, 0.85, n.y + 0.25 * (f - 0.5));
    if (uTheme < 1.5) base = mix(base, SNOW, cover * 0.85); else cover = 0.0; // v MMO téme bez snehu
    matte = 0.25;
    if (hi) {
      float m = fbm(q * 7.0), l = smoothstep(0.6, 0.72, fbm(q * 0.7 + 5.0)) * (1.0 - cover);
      base *= 0.84 + 0.3 * m;
      base = mix(base, vec3(0.5, 0.52, 0.32) * (0.8 + 0.4 * m), l * 0.45); // lišajník
      hgt = f * 0.8 + m * 0.25 - smoothstep(0.95, 0.995, r) * 0.35; bk = 0.12;
      sparkle = cover * step(0.993, h21(floor(q * 30.0))) * lod(q * 30.0);
    }
  } else if (uPattern > 4.5 && uPattern < 5.5) {   // drevo (objekt)
    vec2 q = plane(vObj, n);
    float g = sin(q.y * 40.0 + fbm(q * vec2(3.0, 18.0)) * 6.0);
    base *= 0.78 + 0.16 * g + 0.1 * fbm(q * 9.0);
    matte = 0.3;
    if (hi) { float gr = fbm(q * vec2(2.0, 60.0)); base *= 0.86 + 0.26 * gr; hgt = gr * 0.5 + g * 0.1; bk = 0.03; }
  } else if (uPattern > 5.5 && uPattern < 6.5) {   // dračie šupiny (objekt)
    vec2 q = vec2(atan(vObj.z, vObj.x) * 3.0, vObj.y * 9.0);
    q.x += 0.5 * mod(floor(q.y), 2.0);
    vec2 c = fract(q) - vec2(0.5, 0.2);
    float sc = smoothstep(0.55, 0.15, length(c * vec2(1.0, 1.4)));
    base *= 0.55 + 0.6 * sc + 0.15 * vnoise(q * 3.0);
    matte = 0.8;
    if (hi) {
      float e = smoothstep(0.2, 0.05, abs(length(c * vec2(1.0, 1.4)) - 0.42)); // tmavý okraj šupiny
      base *= 1.0 - 0.35 * e;
      base += vec3(0.08, 0.04, 0.0) * sc * vnoise(q * 11.0);
      hgt = sc * 0.6 + fbm(q * 6.0) * 0.1; bk = 0.06;
    }
  } else if (uPattern > 6.5 && uPattern < 7.5) {   // ihličie s poprašeným snehom (objekt)
    float f = fbm(vObj.xz * 6.0 + vObj.y * 4.0);
    base *= 0.7 + 0.6 * f;
    float cover = smoothstep(0.55, 0.9, n.y) * smoothstep(0.45, 0.7, f);
    base = mix(base, SNOW, cover * 0.8);
    matte = 0.2;
    if (hi) {
      vec2 np = vec2(atan(vObj.z, vObj.x) * 24.0, vObj.y * 50.0); float nd = mix(0.5, vnoise(np), lod(np)); // ihličie
      base *= 0.8 + 0.4 * nd;
      hgt = nd * 0.4 + f * 0.3; bk = 0.03;
      sparkle = cover * step(0.99, h21(floor(vObj.xz * 60.0 + vObj.y * 30.0))) * lod(vObj.xz * 60.0);
    }
  } else if (uPattern > 7.5 && uPattern < 8.5) {   // vír portálu inštancie (disk, svieti sám)
    float r = length(vObj.xz), a = atan(vObj.z, vObj.x);
    float sw = sin(a * 3.0 + r * 11.0 - uTime * 3.2) * 0.5 + 0.5, sw2 = sin(a * 5.0 - r * 7.0 + uTime * 2.1) * 0.5 + 0.5;
    vec3 c = mix(base * 0.35, base * 1.5 + 0.15, sw * 0.7 + sw2 * 0.3);
    c += vec3(1.0, 0.95, 1.0) * pow(max(1.0 - r, 0.0), 3.0) * 0.9;            // jasné jadro
    c += base * smoothstep(0.82, 0.97, r) * 0.8;                                 // žiariaci okraj
    o = vec4(c, uColor.a * smoothstep(1.0, 0.93, r));
    return;
  } else if (uPattern > 8.5 && uPattern < 9.5) {   // MMO: lúka s kvietkami, prašné cesty a dláždené námestie
    vec2 p = vWorld.xz;
    float f = fbm(p * 0.09), d = fbm(p * 0.8), R = length(p);
    base = mix(base * 0.78, base * vec3(1.12, 1.15, 0.85), f) * (0.9 + 0.2 * d);
    vec2 fc = floor(p * 3.0); float fl = step(0.985, h21(fc)) * smoothstep(0.35, 0.1, length(fract(p * 3.0) - 0.5));
    base = mix(base, h21(fc + 7.0) > 0.5 ? vec3(1.0, 0.9, 0.35) : vec3(0.95, 0.95, 1.0), fl * 0.9 * lod(p * 3.0));
    float an = atan(p.y, p.x), sf = (an + 1.5708) / 6.28318 * 8.0;
    float spoke = abs(fract(sf) - 0.5) * 0.7854 * R;                              // cesty k 8 portálom
    float road = min(abs(R - 20.0), R > 3.0 && R < 20.0 ? spoke : 99.0);
    if (p.y < -19.0 && p.y > -29.5) road = min(road, abs(p.x));                   // cesta na sever k dračiemu štítu
    float edge = 1.05 + 0.35 * (fbm(p * 0.7) - 0.5);
    float rd = smoothstep(edge, edge - 0.25, road);
    vec3 dirt = vec3(0.47, 0.36, 0.23) * (0.85 + 0.3 * fbm(p * 2.3));
    base = mix(base, dirt, rd);
    if (R < 4.2) {                                                                // námestie z dlažby
      vec2 q = p * 1.4; q.x += 0.5 * mod(floor(q.y), 2.0);
      vec2 g = abs(fract(q) - 0.5); float joint = smoothstep(0.42, 0.48, max(g.x, g.y));
      vec3 cob = vec3(0.56, 0.54, 0.5) * (0.82 + 0.3 * h21(floor(q)));
      base = mix(base, mix(cob, cob * 0.55, joint), smoothstep(4.2, 3.9, R));
    }
    matte = 0.25;
  } else if (uPattern > 9.5 && uPattern < 10.5) {  // MMO: kreslené lístie (koruna stromu)
    float f = fbm(vObj.xz * 3.0 + vObj.y * 2.0);
    base *= 0.72 + 0.5 * f;
    base = mix(base, base * vec3(1.2, 1.25, 0.8), smoothstep(0.2, 0.9, n.y) * 0.5);
    matte = 0.15;
  } else if (uPattern > 10.5 && uPattern < 11.5) { // MMO: murované kamenné kvádre (oblúky portálov, budovy)
    vec2 q = plane(vWorld, n) * vec2(1.1, 2.2); q.x += 0.5 * mod(floor(q.y), 2.0);
    vec2 g = abs(fract(q) - 0.5); float joint = smoothstep(0.43, 0.49, max(g.x, g.y));
    base *= (0.8 + 0.3 * h21(floor(q))) * (0.85 + 0.25 * fbm(q * 3.0));
    base = mix(base, base * 0.45, joint);
    matte = 0.3;
  }
  if (uUnlit > 0.5) { o = vec4(base, uColor.a); return; }
  if (bk > 0.0) n = bump(n, hgt, bk);
  vec3 l = normalize(uLight), v = normalize(uCam - vWorld), h = normalize(l + v);
  float d = max(dot(n, l), 0.0);
  // severská téma: zem vs. studená obloha a teplé slnko; klasická: pôvodné neutrálne svetlo
  // MMO téma: teplé zlaté slnko a modrá obloha (sýte rozprávkové farby)
  vec3 amb = uTheme > 1.5 ? mix(vec3(0.3, 0.27, 0.22), vec3(0.42, 0.48, 0.6), n.y * 0.5 + 0.5)
    : uTheme > 0.5 ? mix(vec3(0.3, 0.28, 0.26), vec3(0.42, 0.47, 0.56), n.y * 0.5 + 0.5) : vec3(0.38 + 0.14 * n.y);
  vec3 sun = uTheme > 1.5 ? vec3(1.08, 0.98, 0.82) : uTheme > 0.5 ? vec3(1.0, 0.95, 0.86) : vec3(1.0);
  float spec = pow(max(dot(n, h), 0.0), 48.0) * 0.45 * matte;
  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0) * 0.35;
  vec3 c = base * (amb + 0.72 * d * sun) + vec3(spec) + base * rim + base * uEmissive;
  if (sparkle > 0.0) c += vec3(0.9, 0.95, 1.0) * sparkle * (0.4 + 0.6 * sin(uTime * 3.0 + dot(vWorld, vec3(13.0, 7.0, 11.0))) * 0.5 + 0.3); // trblietanie snehu
  if (uFog > 0.0) c = mix(c, uFogColor, clamp(1.0 - exp(-uFog * length(uCam - vWorld)), 0.0, 0.8));
  o = vec4(c, uColor.a);
}`;

class Renderer {
  constructor(canvas) {
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!gl) throw new Error(tr('WebGL2 nie je dostupné', 'WebGL2 is not available'));
    this.gl = gl; this.canvas = canvas;
    this.prog = this.program(VS, FS);
    try { const ext = gl.getExtension('WEBGL_debug_renderer_info'); Settings.gpuName = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); } catch (e) { /* neznáme GPU */ }
    this.loc = {};
    for (const n of ['uModel', 'uView', 'uProj', 'uColor', 'uCam', 'uLight', 'uUnlit', 'uEmissive', 'uPattern', 'uFog', 'uFogColor', 'uTime', 'uDetail', 'uTheme'])
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
    gl.uniform1f(this.loc.uDetail, Settings.texHigh ? 1 : 0);
    gl.uniform1f(this.loc.uTheme, Settings.wow ? 2 : Settings.nordic ? 1 : 0);
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
