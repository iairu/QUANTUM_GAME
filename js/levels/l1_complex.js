'use strict';
// LEVEL 1 — Komplexný prístav (mentor: Leonhard Euler)
// Amplitúda ako „ručička hodín“: veľkosť, fáza, násobenie i, interferencia.

class L1Complex extends Level {
  get steps() { return [this.intro, this.setHand, this.timesI, this.interference]; }

  setup() {
    this.cam = new OrbitCam([0, 0, 0.3], 7.5, 0, 0.95, 3, 16);
    this.mode = null; this.z = C.of(1); this.target = null;
    this.ang = 0; this.angShown = 0; this.mag = 1;
    this.done1 = this.done2 = this.done3 = false;
  }
  W(z, y = 0.03) { return [z[0] * 2, y, -z[1] * 2]; } // komplexné číslo → bod v rovine

  intro() {
    this.quest(tr('Vypočuj si Eulera', 'Listen to Euler', 'Послухай Ейлера'), { easy: tr('💬 Euler', '💬 Euler', '💬 Ейлер'), hard: tr('Euler: α = |α|e<sup>iφ</sup>, P = |α|²', 'Euler: α = |α|e<sup>iφ</sup>, P = |α|²', 'Ейлер: α = |α|e<sup>iφ</sup>, P = |α|²') });
    this.say([
      L('l1.intro.1'),
      L('l1.intro.2'),
      L('l1.intro.3'),
      L('l1.intro.4'),
    ], () => this.next());
  }

  // --- úloha 1: nastav ručičku ---
  setHand() {
    this.mode = 'set';
    // ťažká: náhodný cieľ (veľkosť po 0,05, fáza po π/8), inak 0,7 · e^{i3π/4}
    this.tMag = byDiff(0.7, 0.7, 0.4 + Math.round(rand() * 10) * 0.05);
    this.tPh = byDiff(6, 6, 1 + Math.floor(rand() * 15)) * Math.PI / 8;
    this.target = C.scale(C.exp(this.tPh), this.tMag);
    const hard = Settings.hard;
    this.quest(tr('Nastav ručičku amplitúdy α na zlatý cieľ (veľkosť aj fázu).', 'Set the amplitude hand α onto the golden target (both magnitude and phase).', 'Встанови стрілку амплітуди α на золоту ціль (і модуль, і фазу).'), { easy: tr('🎯 α → zlatý cieľ', '🎯 α → golden target', '🎯 α → золота ціль'), hard: `α → ${hard ? '?' : Fmt.complex(this.target)} · ε < ${Fmt.num(byDiff(0.12, 0.06, 0.03), 2)}` });
    let r = 1, ph = 0;
    const info = UI.info('');
    const upd = () => {
      this.z = C.scale(C.exp(ph), r);
      info.innerHTML = `α = ${Fmt.num(r, 2)} · e<sup>i·${Fmt.angle(ph)}</sup> = ${Fmt.complex(this.z)}<br>`
        + `Re α = ${Fmt.num(this.z[0], 2)}, Im α = ${Fmt.num(this.z[1], 2)}<br>`
        + tr(`<b>P = |α|² = ${Fmt.num(r * r, 2)}</b> &nbsp;<small>(fáza na P nemá vplyv!)</small>`, `<b>P = |α|² = ${Fmt.num(r * r, 2)}</b> &nbsp;<small>(the phase has no effect on P!)</small>`, `<b>P = |α|² = ${Fmt.num(r * r, 2)}</b> &nbsp;<small>(фаза на P не впливає!)</small>`);
      const dist = C.abs(C.sub(this.z, this.target));
      if (Settings.easy) info.innerHTML += `<br><small>${tr('vzdialenosť od cieľa', 'distance from the target', 'відстань до цілі')}: ${Fmt.num(dist, 2)}</small>`;
      if (!this.done1 && dist < byDiff(0.12, 0.06, 0.03)) {
        this.done1 = true;
        this.grant(['euler', 'eiphi', 'amp']);
        this.say([L('l1.upd.1')], () =>
          this.ask({ q: L('l1.upd.2.q'), options: [L('l1.upd.2.options.0'), L('l1.upd.2.options.1'), L('l1.upd.2.options.2')], correct: 0, why: L('l1.upd.2.why') }, () => this.next()));
      }
    };
    UI.panelSet(tr('Ručička amplitúdy α', 'Amplitude hand α', 'Стрілка амплітуди α'), [
      UI.slider(tr('veľkosť |α|', 'magnitude |α|', 'модуль |α|'), 0, 1, hard ? 0.005 : 0.01, 1, (v) => { r = v; upd(); return Fmt.num(v, 2); }),
      UI.slider(tr('fáza φ', 'phase φ', 'фаза φ'), 0, 6.28, hard ? 0.005 : 0.01, 0, (v) => { ph = v; upd(); return Fmt.angle(v); }),
      info,
      hard ? UI.info(tr('🎯 Ťažká: cieľ je náhodný. Odčítaj ho z polárnej mriežky (kruhy po 0,25, lúče po 22,5°).', '🎯 Hard: the target is random. Read it off the polar grid (circles every 0.25, spokes every 22.5°).', '🎯 Складна: ціль випадкова. Зчитай її з полярної сітки (кола через 0,25, промені через 22,5°).'), 'tip')
        : UI.info(tr(`💡 Tip: zlatý cieľ má veľkosť ${Fmt.num(this.tMag, 2)} a fázu ${Fmt.angle(this.tPh)} (${Math.round(this.tPh * 180 / Math.PI)}°).`, `💡 Tip: the golden target has magnitude ${Fmt.num(this.tMag, 2)} and phase ${Fmt.angle(this.tPh)} (${Math.round(this.tPh * 180 / Math.PI)}°).`, `💡 Підказка: золота ціль має модуль ${Fmt.num(this.tMag, 2)} і фазу ${Fmt.angle(this.tPh)} (${Math.round(this.tPh * 180 / Math.PI)}°).`), 'tip'),
    ]);
  }

  // --- úloha 2: násobenie i = otočenie o 90° ---
  timesI() {
    this.mode = 'mul'; this.ang = 0; this.angShown = 0; this.mag = 1; this.presses = 0;
    this.target = C.of(-1);
    this.quest(tr('Iba tlačidlom „× i“ dostaň ručičku z bodu 1 do bodu −1.', 'Using only the “× i” button, get the hand from the point 1 to the point −1.', 'Лише кнопкою «× i» доведи стрілку з точки 1 до точки −1.'), { easy: tr('× i → z 1 do −1', '× i → from 1 to −1', '× i → з 1 до −1'), hard: '1 → −1 · {× i} · i<sup>n</sup> = −1' });
    const info = UI.info(tr('Stlačenia: 0', 'Presses: 0', 'Натискань: 0'));
    const press = (k, label) => {
      this.ang += k; this.presses++;
      info.innerHTML = tr(`Stlačenia: ${this.presses} &nbsp; (posledné: ${label})`, `Presses: ${this.presses} &nbsp; (last: ${label})`, `Натискань: ${this.presses} &nbsp; (останнє: ${label})`) + `<br>α = ${Fmt.complex(C.exp(this.ang))}`;
      if (!this.done2 && Math.abs(Math.cos(this.ang) + 1) < 1e-6) {
        this.done2 = true;
        setTimeout(() => {
          this.grant(['i']);
          this.say([L('l1.press.1.0', this.presses, this.presses === 2 ? 'stlačenia' : 'stlačení'),
            L('l1.press.1.1')], () =>
            this.ask({ q: L('l1.press.2.q'), options: [L('l1.press.2.options.0'), L('l1.press.2.options.1'), L('l1.press.2.options.2')], correct: 0, why: L('l1.press.2.why') }, () => this.next()));
        }, 700);
      }
    };
    UI.panelSet(tr('Násobenie komplexným číslom', 'Multiplying by a complex number', 'Множення на комплексне число'), [
      UI.row(UI.button('× i', () => press(Math.PI / 2, '× i'), 'big'), UI.button(tr('Späť na 1', 'Back to 1', 'Назад до 1'), () => { this.ang = 0; this.presses = 0; info.innerHTML = tr('Stlačenia: 0', 'Presses: 0', 'Натискань: 0'); })),
      info,
      UI.info(tr('Pozoruj: veľkosť ručičky sa nemení, mení sa len smer (fáza).', 'Watch: the length of the hand doesn’t change, only its direction (phase).', 'Дивись: довжина стрілки не змінюється, лише її напрямок (фаза).'), 'tip'),
    ]);
  }

  // --- úloha 3: interferencia dvoch ciest ---
  interference() {
    this.mode = 'int'; this.ph2 = 0; this.gotZero = false; this.gotMax = false;
    this.quest(tr('Dve cesty k tomu istému výsledku. Nájdi fázu, pri ktorej sa amplitúdy úplne VYRUŠIA (P = 0), aj fázu, pri ktorej je P maximálne.', 'Two paths to the same outcome. Find the phase at which the amplitudes fully CANCEL (P = 0), and the phase at which P is maximal.', 'Два шляхи до того самого результату. Знайди фазу, за якої амплітуди повністю ГАСЯТЬСЯ (P = 0), і фазу, за якої P максимальна.'), { easy: tr('🔍 P = 0 · potom P = 1', '🔍 P = 0 · then P = 1', '🔍 P = 0 · потім P = 1'), hard: '|½ + ½e<sup>iφ</sup>|² → 0, 1 · φ = ?' });
    this.say([
      L('l1.interference.1'),
      L('l1.interference.2'),
      L('l1.interference.3'),
    ]);
    const info = UI.info(''), chart = UI.chart();
    this.visited = [];
    const upd = (v) => {
      this.ph2 = v;
      const A1 = C.of(0.5), A2 = C.scale(C.exp(v), 0.5), S = C.add(A1, A2), P = C.abs2(S);
      const term = 2 * C.mul(A1, C.conj(A2))[0];
      info.innerHTML = `A₁ = ½, A₂ = ½·e<sup>i·${Fmt.angle(v)}</sup><br>`
        + tr(`<b>kvantovo: P = |A₁ + A₂|² = ${Fmt.num(P, 2)}</b><br>klasicky: |A₁|² + |A₂|² = ½<br>`, `<b>quantum: P = |A₁ + A₂|² = ${Fmt.num(P, 2)}</b><br>classical: |A₁|² + |A₂|² = ½<br>`, `<b>квантово: P = |A₁ + A₂|² = ${Fmt.num(P, 2)}</b><br>класично: |A₁|² + |A₂|² = ½<br>`)
        + tr(`interferenčný člen 2·Re(A₁A₂*) = ${Fmt.num(term, 2)}<br>`, `interference term 2·Re(A₁A₂*) = ${Fmt.num(term, 2)}<br>`, `інтерференційний доданок 2·Re(A₁A₂*) = ${Fmt.num(term, 2)}<br>`)
        + tr(`${this.gotZero ? '✅' : '⬜'} deštruktívna (P = 0) &nbsp; ${this.gotMax ? '✅' : '⬜'} konštruktívna (P = 1)`, `${this.gotZero ? '✅' : '⬜'} destructive (P = 0) &nbsp; ${this.gotMax ? '✅' : '⬜'} constructive (P = 1)`, `${this.gotZero ? '✅' : '⬜'} деструктивна (P = 0) &nbsp; ${this.gotMax ? '✅' : '⬜'} конструктивна (P = 1)`);
      const eps = byDiff(0.03, 0.01, 0.003);
      this.visited.push([v, P]); if (this.visited.length > 400) this.visited.shift();
      UI.drawChart(chart, {
        x0: 0, x1: 2 * Math.PI, y0: 0, y1: 1, xlabel: tr('fáza cesty 2', 'phase of path 2', 'фаза шляху 2'),
        xticks: [[0, '0'], [Math.PI / 2, 'π/2'], [Math.PI, 'π'], [3 * Math.PI / 2, '3π/2'], [2 * Math.PI, '2π']], yticks: [[0, '0'], [0.5, '½'], [1, '1']],
        hlines: [{ y: 0.5, color: '#9aa6d1', label: tr('klasicky', 'classical', 'класично') }],
        curves: Settings.hard ? [] : [{ f: (x) => Math.cos(x / 2) ** 2, color: '#ff7d8f' }],
        points: [...this.visited.map(([x, y]) => ({ x, y, color: '#ff7d8f88', r: 1.5 })), { x: v, y: P, color: '#ffd25a', r: 5 }],
        legend: [['#ff7d8f', tr('kvantovo |A₁+A₂|²', 'quantum |A₁+A₂|²', 'квантово |A₁+A₂|²')], ['#9aa6d1', '|A₁|²+|A₂|²']],
      });
      if (P < eps && !this.gotZero) { this.gotZero = true; UI.toast(tr('✅ Deštruktívna interferencia: ručičky smerujú proti sebe!', '✅ Destructive interference: the hands point against each other!', '✅ Деструктивна інтерференція: стрілки дивляться одна проти одної!')); }
      if (P > 1 - eps && !this.gotMax && this.gotZero) { this.gotMax = true; UI.toast(tr('✅ Konštruktívna interferencia!', '✅ Constructive interference!', '✅ Конструктивна інтерференція!')); }
      if (this.gotZero && this.gotMax && !this.done3) {
        this.done3 = true;
        setTimeout(() => {
          this.grant(['interf', 'abs2', 'ReIm', 'conj']);
          this.say([L('l1.upd.3'),
            L('l1.upd.4')], () => this.next());
        }, 500);
      }
      return Fmt.angle(v);
    };
    UI.panelSet(tr('Interferencia dvoch ciest', 'Interference of two paths', 'Інтерференція двох шляхів'), [UI.slider(tr('fáza cesty 2', 'phase of path 2', 'фаза шляху 2'), 0, 6.28, byDiff(0.02, 0.01, 0.004), 0, upd), info, chart,
      UI.info(tr('Najprv nájdi P = 0, potom P = 1.', 'First find P = 0, then P = 1.', 'Спершу знайди P = 0, потім P = 1.'), 'tip')]);
  }

  viewState() {
    if (this.mode === 'set') return { amps: [{ z: this.z, label: 'α' }], note: tr('Jedna amplitúda α: dĺžka ručičky → P = |α|², uhol = fáza.', 'One amplitude α: hand length → P = |α|², angle = phase.', 'Одна амплітуда α: довжина стрілки → P = |α|², кут = фаза.') };
    if (this.mode === 'mul') return { amps: [{ z: C.exp(this.angShown), label: 'α' }], note: tr('Násobenie i otočí ručičku o 90° a dĺžku nezmení.', 'Multiplying by i turns the hand by 90° and keeps its length.', 'Множення на i повертає стрілку на 90° і зберігає її довжину.') };
    if (this.mode === 'int') return { amps: [{ z: C.of(0.5), label: 'A₁' }, { z: C.scale(C.exp(this.ph2), 0.5), label: 'A₂' }], sum: true,
      note: tr('Ručičky sa skladajú hlavou k päte; P je štvorec dĺžky zlatého súčtu.', 'Hands add head to tail; P is the square of the length of the golden sum.', 'Стрілки додаються «кінець до початку»; P — квадрат довжини золотої суми.') };
    return null;
  }

  update(dt) {
    this.t += dt;
    this.angShown += (this.ang - this.angShown) * Math.min(1, dt * 6);
  }

  draw(r) {
    r.begin(this.cam.eye(), this.cam.target);
    // komplexná rovina
    r.draw('disk', M4.trs([0, -0.01, 0], 0, 2.8), [0.12, 0.16, 0.3], { pattern: 1 });
    r.draw('circle', M4.trs([0, 0.01, 0], 0, 2), [0.9, 0.9, 1]);
    r.rod([-2.6, 0.01, 0], [2.6, 0.01, 0], [0.75, 0.75, 0.85], 0.012);
    r.rod([0, 0.01, 2.6], [0, 0.01, -2.6], [0.75, 0.75, 0.85], 0.012);
    UI.label('Re', [2.9, 0, 0], 'Re', 'axis'); UI.label('Im', [0, 0, -2.9], 'Im', 'axis');
    for (const [z, t] of [[[1, 0], '1'], [[0, 1], 'i'], [[-1, 0], '−1'], [[0, -1], '−i']]) {
      r.sphere(this.W(z), 0.05, [1, 1, 1], { unlit: 1 });
      UI.label('pt' + t, V3.add(this.W(z), [z[0] * 0.25, 0.1, -z[1] * 0.25]), t, 'ket');
    }
    const O = [0, 0.03, 0];
    // polárna mriežka (vždy na ťažkej, inak podľa nastavení): kruhy |α| = 0,25 … 1, lúče po 22,5°
    if ((Settings.view.grid || Settings.hard) && this.mode !== 'int') {
      for (const k of [0.25, 0.5, 0.75]) r.draw('circle', M4.trs([0, 0.012, 0], 0, 2 * k), [0.55, 0.6, 0.85], { alpha: 0.5 });
      for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; r.dash([0, 0.012, 0], this.W([Math.cos(a), Math.sin(a)], 0.012), [0.55, 0.6, 0.85], { alpha: 0.5 }); }
      if (this.mode === 'set') for (const k of [0.25, 0.5, 0.75]) UI.label('pg' + k, [2 * k * 0.71 + 0.08, 0.02, 2 * k * 0.71], Fmt.num(k, 2), 'axis tiny');
    }
    // oblúk fázy amplitúdy od kladnej reálnej osi
    if (Settings.view.angles && (this.mode === 'set' || this.mode === 'mul')) {
      const z = this.mode === 'set' ? this.z : C.exp(this.angShown);
      let a = C.arg(z); if (a < 0) a += 2 * Math.PI;
      if (C.abs(z) > 0.02 && a > 0.02) {
        r.arc([0, 0.03, 0], [1, 0, 0], [0, 0, -1], 0.55, a, [0.6, 1, 0.7]);
        UI.label('phArc', [Math.cos(a / 2) * 0.75, 0.05, -Math.sin(a / 2) * 0.75], 'φ', 'axis', tr('Fáza φ = uhol ručičky od kladnej reálnej osi.', 'Phase φ = angle of the hand from the positive real axis.', 'Фаза φ = кут стрілки від додатної дійсної осі.'));
      }
    }
    if (this.mode === 'set') {
      r.arrow(O, this.W(this.target), [1, 0.82, 0.2], 0.045, { alpha: 0.5, emissive: 0.5 });
      r.arrow(O, this.W(this.z), [1, 0.35, 0.45], 0.05, { emissive: 0.3 });
      r.rod(this.W([this.z[0], 0]), this.W(this.z), [0.6, 0.8, 1], 0.01);
      r.rod(this.W([0, this.z[1]]), this.W(this.z), [0.6, 0.8, 1], 0.01);
      UI.label('alpha', V3.add(this.W(this.z), [0, 0.35, 0]), 'α', 'player');
      UI.hot(this.W(this.z), tr(`<b>Amplitúda α</b> = ${Fmt.complex(this.z)}<br>dĺžka ${Fmt.num(C.abs(this.z), 2)}, fáza ${Fmt.angle(C.arg(this.z))}`, `<b>Amplitude α</b> = ${Fmt.complex(this.z)}<br>length ${Fmt.num(C.abs(this.z), 2)}, phase ${Fmt.angle(C.arg(this.z))}`, `<b>Амплітуда α</b> = ${Fmt.complex(this.z)}<br>довжина ${Fmt.num(C.abs(this.z), 2)}, фаза ${Fmt.angle(C.arg(this.z))}`), 30);
      UI.hot(this.W(this.target), Settings.hard ? tr('<b>Zlatý cieľ</b> — odčítaj veľkosť a fázu z mriežky.', '<b>Golden target</b> — read its magnitude and phase off the grid.', '<b>Золота ціль</b> — зчитай її модуль і фазу із сітки.')
        : tr(`<b>Zlatý cieľ</b>: veľkosť ${Fmt.num(this.tMag, 2)}, fáza ${Fmt.angle(this.tPh)}.`, `<b>Golden target</b>: magnitude ${Fmt.num(this.tMag, 2)}, phase ${Fmt.angle(this.tPh)}.`, `<b>Золота ціль</b>: модуль ${Fmt.num(this.tMag, 2)}, фаза ${Fmt.angle(this.tPh)}.`), 26);
      UI.hot([3.4, 1.2, -1.6], tr(`<b>Stĺpec pravdepodobnosti</b> P = |α|² = ${Fmt.num(C.abs2(this.z), 2)}. Mení sa len s dĺžkou ručičky.`, `<b>Probability bar</b> P = |α|² = ${Fmt.num(C.abs2(this.z), 2)}. It changes only with the length of the hand.`, `<b>Стовпчик імовірності</b> P = |α|² = ${Fmt.num(C.abs2(this.z), 2)}. Змінюється лише з довжиною стрілки.`), 40);
      // stĺpec pravdepodobnosti
      const P = C.abs2(this.z);
      r.draw('cylinder', M4.trs([3.4, 0, -1.6], 0, [0.25, Math.max(P * 2.5, 0.01), 0.25]), [0.4, 1, 0.6], { emissive: 0.3 });
      r.draw('cylinder', M4.trs([3.4, 0, -1.6], 0, [0.27, 2.5, 0.27]), [1, 1, 1], { alpha: 0.12 });
      UI.label('Pbar', [3.4, 2.9, -1.6], 'P = |α|²', 'axis');
    } else if (this.mode === 'mul') {
      const z = C.exp(this.angShown);
      r.arrow(O, this.W(this.target), [1, 0.82, 0.2], 0.04, { alpha: 0.4, emissive: 0.5 });
      r.arrow(O, this.W(z), [1, 0.35, 0.45], 0.05, { emissive: 0.3 });
      UI.label('alpha', V3.add(this.W(z), [0, 0.35, 0]), 'α', 'player');
    } else if (this.mode === 'int') {
      const A1 = C.of(0.5), A2 = C.scale(C.exp(this.ph2), 0.5), S = C.add(A1, A2);
      r.arrow(O, this.W(A1, 0.05), [0.4, 0.7, 1], 0.04);
      r.arrow(this.W(A1, 0.05), this.W(S, 0.05), [0.4, 1, 0.5], 0.04);
      r.arrow(O, this.W(S, 0.08), [1, 1, 1], 0.05, { emissive: 0.5 });
      UI.label('A1', V3.add(this.W(C.scale(A1, 0.5)), [0, 0.3, 0.2]), 'A₁', 'ket');
      UI.label('A2', V3.add(this.W(C.add(A1, C.scale(A2, 0.5))), [0, 0.35, 0]), 'A₂', 'ket');
      UI.label('S', V3.add(this.W(S), [0, 0.5, 0]), 'A₁+A₂', 'player');
      UI.hot(this.W(S), tr(`<b>Súčet amplitúd</b> A₁ + A₂ = ${Fmt.complex(S)}. Kvantovo umocňujeme až tento súčet.`, `<b>Sum of amplitudes</b> A₁ + A₂ = ${Fmt.complex(S)}. Quantum mechanically we square only this sum.`, `<b>Сума амплітуд</b> A₁ + A₂ = ${Fmt.complex(S)}. Квантово підносимо до квадрата лише цю суму.`), 30);
      UI.hot([3.4, 1, -0.6], tr('<b>Kvantová pravdepodobnosť</b> |A₁ + A₂|² — závisí od relatívnej fázy.', '<b>Quantum probability</b> |A₁ + A₂|² — depends on the relative phase.', '<b>Квантова ймовірність</b> |A₁ + A₂|² — залежить від відносної фази.'), 36);
      UI.hot([3.4, 0.6, 0.6], tr('<b>Klasická predpoveď</b> |A₁|² + |A₂|² = ½ — bez interferencie, nezávisí od fázy.', '<b>Classical prediction</b> |A₁|² + |A₂|² = ½ — no interference, independent of the phase.', '<b>Класичне передбачення</b> |A₁|² + |A₂|² = ½ — без інтерференції, не залежить від фази.'), 36);
      const P = C.abs2(S);
      r.draw('cylinder', M4.trs([3.4, 0, -0.6], 0, [0.25, Math.max(P * 2.5, 0.01), 0.25]), [1, 0.5, 0.6], { emissive: 0.3 });
      r.draw('cylinder', M4.trs([3.4, 0, 0.6], 0, [0.25, 0.5 * 2.5, 0.25]), [0.6, 0.6, 0.7]);
      UI.label('Pq', [3.4, 2.9, -0.6], tr('kvantovo<br>|A₁+A₂|²', 'quantum<br>|A₁+A₂|²', 'квантово<br>|A₁+A₂|²'), 'axis');
      UI.label('Pc', [3.4, 1.7, 0.6], tr('klasicky<br>|A₁|²+|A₂|²', 'classical<br>|A₁|²+|A₂|²', 'класично<br>|A₁|²+|A₂|²'), 'axis');
    }
  }
}
