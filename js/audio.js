'use strict';
// Zvuk: generatívna severská hudba na pozadí (pomalá, tichá, bez bicích — aby pomáhala sústredeniu)
// a syntetizované zvukové efekty. Všetko cez WebAudio, bez zvukových súborov.
// Prehliadač dovolí zvuk až po prvej interakcii hráča, preto sa kontext vytvorí pri prvom kliknutí/klávese.

const Sound = {
  ctx: null,
  // ---------- inicializácia a hlasitosť ----------
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = this.ctx = new AC();
    this.master = c.createGain(); this.master.connect(c.destination);
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; comp.connect(this.master);
    this.music = c.createGain(); this.music.connect(comp);
    this.sfxBus = c.createGain(); this.sfxBus.connect(this.master);
    // dozvuk (veľká kamenná sieň): stereo impulz z doznievajúceho šumu
    // dva dozvuky, každý ide cez svoju hlasitosť (inak by dozvuk hudby znel aj pri hlasitosti 0)
    const ir = this.impulse(4.2, 2.6), revM = c.createConvolver(), revS = c.createConvolver();
    revM.buffer = ir; revS.buffer = ir;
    this.revMusic = c.createGain(); this.revMusic.gain.value = 0.9; this.revMusic.connect(revM); revM.connect(this.music);
    this.revSfx = c.createGain(); this.revSfx.gain.value = 0.6; this.revSfx.connect(revS); revS.connect(this.sfxBus);
    // ozvena pre harfu
    this.echo = c.createDelay(1); this.echo.delayTime.value = 0.42;
    const fb = c.createGain(); fb.gain.value = 0.32; this.echo.connect(fb); fb.connect(this.echo);
    const eo = c.createGain(); eo.gain.value = 0.35; this.echo.connect(eo); eo.connect(this.music); eo.connect(this.revMusic);
    this.noiseBuf = this.makeNoise(2);
    this.apply();
    this.startMusic();
    document.addEventListener('visibilitychange', () => { if (document.hidden) c.suspend(); else if (!Settings.audio.muted) c.resume(); });
  },
  apply() {
    if (!this.ctx) return;
    const A = Settings.audio, t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(A.muted ? 0 : 1, t, 0.05);
    this.music.gain.setTargetAtTime(A.music * 0.9, t, 0.3);
    this.sfxBus.gain.setTargetAtTime(A.sfx, t, 0.05);
    if (A.muted) this.ctx.suspend(); else this.ctx.resume();
  },
  toggleMute() {
    Settings.audio.muted = !Settings.audio.muted; Settings.save();
    this.init(); this.apply(); this.muteUi();
    if (!Settings.audio.muted) this.sfx('toast');
  },
  muteUi() { const b = document.getElementById('btn-sound'); if (b) b.textContent = Settings.audio.muted ? '🔇' : '🔊'; },

  impulse(sec, decay) {
    const c = this.ctx, n = Math.floor(c.sampleRate * sec), b = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
    return b;
  },
  makeNoise(sec) {
    const c = this.ctx, n = Math.floor(c.sampleRate * sec), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  },
  midi: (m) => 440 * Math.pow(2, (m - 69) / 12),

  // ---------- hudba ----------
  // d mol (aiolský): Dm – B♭ – F – C – Dm – Gm – B♭ – Am, jeden akord ≈ 9 s
  CHORDS: [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55], [50, 53, 57], [55, 58, 62], [46, 50, 53], [57, 60, 64]],
  PENTA: [62, 65, 67, 69, 72, 74, 77, 79],
  startMusic() {
    const c = this.ctx, t = c.currentTime;
    // bordún D + A (sláčiky v hĺbke), pomaly dýcha
    const dg = c.createGain(); dg.gain.value = 0.11;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320;
    lp.connect(dg); dg.connect(this.music); dg.connect(this.revMusic);
    for (const [m, det] of [[38, 0], [45, 4], [26, -3]]) {
      const o = c.createOscillator(); o.type = m === 26 ? 'sine' : 'sawtooth'; o.frequency.value = this.midi(m); o.detune.value = det;
      const g = c.createGain(); g.gain.value = m === 26 ? 0.7 : 0.35; o.connect(g); g.connect(lp); o.start(t);
    }
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.045; lg.gain.value = 0.045; lfo.connect(lg); lg.connect(dg.gain); lfo.start(t);
    // vietor
    const w = c.createBufferSource(); w.buffer = this.noiseBuf; w.loop = true;
    const wb = c.createBiquadFilter(); wb.type = 'bandpass'; wb.frequency.value = 500; wb.Q.value = 0.8;
    const wg = c.createGain(); wg.gain.value = 0.035;
    const wl = c.createOscillator(), wlg = c.createGain(); wl.frequency.value = 0.07; wlg.gain.value = 260; wl.connect(wlg); wlg.connect(wb.frequency); wl.start(t);
    w.connect(wb); wb.connect(wg); wg.connect(this.music); w.start(t);
    this.chordIdx = 0; this.nextChord = t + 0.5; this.nextPluck = t + 4;
    this.timer = setInterval(() => this.tick(), 200);
  },
  tick() {
    const c = this.ctx;
    if (!c || c.state !== 'running' || Settings.audio.music <= 0) return;
    const ahead = c.currentTime + 0.6;
    while (this.nextChord < ahead) {
      this.chord(this.CHORDS[this.chordIdx % this.CHORDS.length], this.nextChord, 9);
      if (Math.random() < 0.3) this.horn(this.CHORDS[this.chordIdx % this.CHORDS.length][0] - 12, this.nextChord + 1.5);
      this.chordIdx++; this.nextChord += 9;
    }
    while (this.nextPluck < ahead) {
      if (Math.random() < 0.42) this.pluck(this.PENTA[Math.floor(Math.random() * this.PENTA.length)], this.nextPluck);
      this.nextPluck += 1.5 + Math.random() * 1.5;
    }
  },
  // pomalý „sláčikovo-zborový“ akord
  chord(notes, t, len) {
    const c = this.ctx, g = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 760; lp.Q.value = 0.4;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 3.2); g.gain.setValueAtTime(0.05, t + len - 1); g.gain.linearRampToValueAtTime(0, t + len + 3.5);
    lp.connect(g); g.connect(this.music); g.connect(this.revMusic);
    for (const m of notes) for (const det of [-7, 7]) {
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = this.midi(m); o.detune.value = det;
      o.connect(lp); o.start(t); o.stop(t + len + 4);
    }
    // „hlas“ nad akordom s vibratom
    const v = c.createOscillator(), vg = c.createGain(), vib = c.createOscillator(), vibg = c.createGain();
    v.type = 'triangle'; v.frequency.value = this.midi(notes[2] + 12); vib.frequency.value = 4.6; vibg.gain.value = 3;
    vib.connect(vibg); vibg.connect(v.frequency);
    vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(0.018, t + 4); vg.gain.linearRampToValueAtTime(0, t + len + 2);
    v.connect(vg); vg.connect(this.revMusic); vg.connect(this.music);
    v.start(t); vib.start(t); v.stop(t + len + 3); vib.stop(t + len + 3);
  },
  // harfa: trojuholník + sínus o oktávu vyššie, rýchly nábeh, dlhý dozvuk a ozvena
  pluck(m, t) {
    const c = this.ctx, g = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2600;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.07, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0008, t + 2.8);
    lp.connect(g); g.connect(this.music); g.connect(this.revMusic); g.connect(this.echo);
    for (const [type, mul, amp] of [['triangle', 1, 1], ['sine', 2, 0.3]]) {
      const o = c.createOscillator(), og = c.createGain(); o.type = type; o.frequency.value = this.midi(m) * mul; og.gain.value = amp;
      o.connect(og); og.connect(lp); o.start(t); o.stop(t + 3);
    }
  },
  // vzdialený roh
  horn(m, t) {
    const c = this.ctx, g = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(250, t); lp.frequency.linearRampToValueAtTime(650, t + 2.5); lp.frequency.linearRampToValueAtTime(250, t + 6);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.045, t + 2); g.gain.linearRampToValueAtTime(0, t + 6.5);
    lp.connect(g); g.connect(this.revMusic); g.connect(this.music);
    for (const [mm, det] of [[m, -4], [m, 5], [m + 7, 0]]) {
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = this.midi(mm); o.detune.value = det;
      o.connect(lp); o.start(t); o.stop(t + 7);
    }
  },

  // ---------- zvukové efekty ----------
  tone(f, dur, o = {}) {
    const c = this.ctx, t = c.currentTime + (o.at || 0), osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const a = o.attack ?? 0.005, peak = o.gain ?? 0.1;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (o.lp) { const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = o.lp; osc.connect(f2); node = f2; }
    node.connect(g); g.connect(this.sfxBus);
    if (o.rev) g.connect(this.revSfx);
    osc.start(t); osc.stop(t + dur + 0.05);
  },
  noise(dur, o = {}) {
    const c = this.ctx, t = c.currentTime + (o.at || 0), src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = this.noiseBuf; src.loop = true; src.playbackRate.value = o.rate || 1;
    f.type = o.filter || 'bandpass'; f.Q.value = o.q ?? 1; f.frequency.setValueAtTime(o.f || 1500, t);
    if (o.fTo) f.frequency.exponentialRampToValueAtTime(o.fTo, t + dur);
    const a = o.attack ?? 0.01, peak = o.gain ?? 0.1;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.sfxBus);
    if (o.rev) g.connect(this.revSfx);
    src.start(t, Math.random() * 1.5); src.stop(t + dur + 0.05);
  },
  sfx(name) {
    if (!this.ctx || Settings.audio.muted || Settings.audio.sfx <= 0 || this.ctx.state !== 'running') return;
    const T = (...a) => this.tone(...a), N = (...a) => this.noise(...a);
    switch (name) {
      case 'click': T(420, 0.07, { type: 'triangle', gain: 0.09 }); N(0.03, { f: 2400, gain: 0.04 }); break;           // drevený klik
      case 'dialog': T(523.25, 0.9, { gain: 0.05, rev: 1, attack: 0.02 }); T(783.99, 0.9, { gain: 0.04, rev: 1, at: 0.07, attack: 0.02 }); N(0.25, { f: 900, fTo: 2600, gain: 0.025, attack: 0.08 }); break;
      case 'page': N(0.14, { f: 3200, q: 0.8, gain: 0.05, attack: 0.03 }); break;                                       // otočenie strany
      case 'scroll': N(0.4, { f: 1700, fTo: 900, q: 0.6, gain: 0.07, attack: 0.05 }); N(0.25, { f: 2600, q: 0.9, gain: 0.04, at: 0.18 }); T(110, 0.2, { gain: 0.12, lp: 300 }); break;
      case 'map': N(0.3, { f: 1500, q: 0.6, gain: 0.07, attack: 0.04 }); N(0.35, { f: 2200, fTo: 1200, q: 0.7, gain: 0.06, at: 0.22 }); T(95, 0.18, { gain: 0.1, lp: 260, at: 0.05 }); break;
      case 'journal': T(85, 0.25, { gain: 0.22, lp: 240 }); N(0.08, { filter: 'lowpass', f: 700, gain: 0.08 }); N(0.16, { f: 3000, gain: 0.04, at: 0.12, attack: 0.03 }); break;
      case 'codex': for (const [f, i] of [[659.25, 0], [987.77, 1], [1318.5, 2]]) T(f, 1.4, { gain: 0.035, rev: 1, at: i * 0.08, attack: 0.01 }); break;
      case 'close': N(0.1, { filter: 'lowpass', f: 900, gain: 0.05 }); T(300, 0.12, { to: 200, type: 'triangle', gain: 0.04 }); break;
      case 'toast': T(880, 0.9, { gain: 0.035, rev: 1 }); T(1760, 0.5, { gain: 0.012, rev: 1 }); break;
      case 'good': T(523.25, 0.35, { type: 'triangle', gain: 0.08, rev: 1 }); T(783.99, 0.6, { type: 'triangle', gain: 0.08, rev: 1, at: 0.12 }); break;
      case 'bad': T(220, 0.3, { type: 'triangle', gain: 0.09, lp: 900 }); T(185, 0.45, { type: 'triangle', gain: 0.09, lp: 900, at: 0.15 }); break;
      case 'portal': N(1.1, { f: 220, fTo: 1600, q: 1.4, gain: 0.08, attack: 0.4, rev: 1 }); T(55, 1.1, { to: 110, gain: 0.12, attack: 0.3, rev: 1 }); break;
      case 'fanfare': for (const [m, i] of [[50, 0], [57, 1], [62, 2], [66, 2.6]]) T(this.midi(m), 1.6, { type: 'sawtooth', lp: 1100, gain: 0.05, attack: 0.08, rev: 1, at: i * 0.22 }); break;
      case 'shout': T(70, 0.8, { to: 42, gain: 0.35, attack: 0.02, rev: 1 }); T(140, 0.6, { type: 'sawtooth', lp: 700, gain: 0.07, rev: 1 }); N(0.7, { filter: 'lowpass', f: 900, fTo: 200, gain: 0.18, rev: 1 }); break;
      case 'clang': for (const [f, g] of [[523, 0.06], [1340, 0.05], [2310, 0.035], [3590, 0.025]]) T(f, 0.9, { gain: g, rev: 1 }); N(0.06, { filter: 'highpass', f: 3000, gain: 0.08 }); break;
      case 'glance': for (const [f, g] of [[880, 0.04], [2210, 0.025]]) T(f, 0.35, { gain: g }); N(0.12, { f: 3500, fTo: 1500, gain: 0.05 }); break;
      case 'whiff': N(0.28, { f: 2400, fTo: 500, q: 1.2, gain: 0.09, attack: 0.03 }); break;
      case 'fire': N(1.0, { filter: 'lowpass', f: 1400, fTo: 400, gain: 0.2, attack: 0.08, rev: 1 }); N(0.8, { f: 3500, q: 2, gain: 0.04, rate: 0.5 }); break;
      case 'roar': T(95, 1.5, { to: 58, type: 'sawtooth', lp: 650, gain: 0.16, attack: 0.15, rev: 1 }); N(1.4, { filter: 'lowpass', f: 700, gain: 0.12, attack: 0.2, rev: 1 }); break;
      case 'rune': T(392, 1.2, { gain: 0.04, rev: 1 }); T(587.33, 1.2, { gain: 0.03, rev: 1, at: 0.1 }); break;
    }
  },
};

// zvuk sa smie spustiť až po interakcii; klik na tlačidlo = drevený klik
(() => {
  const start = () => { Sound.init(); Sound.muteUi(); };
  window.addEventListener('pointerdown', start, { capture: true });
  window.addEventListener('keydown', start, { capture: true });
  window.addEventListener('pointerdown', (e) => {
    if (e.target.closest && e.target.closest('button:not(:disabled), select, input[type=checkbox], input[type=radio]')) setTimeout(() => Sound.sfx('click'), 0);
  }, { capture: true });
})();
