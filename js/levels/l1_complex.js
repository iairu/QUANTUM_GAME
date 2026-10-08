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
    this.quest('Vypočuj si Eulera');
    this.say([
      'Vitaj v <b>Komplexnom prístave</b>! Ja som Leonhard Euler. Zaviedol som písmenká <b>e</b> a <b>i</b> — a v kvantovej mechanike ich uvidíš na každom kroku.',
      'Prirovnanie: <b>amplitúda je ako ručička na hodinách</b>. Má <b>dĺžku</b> (veľkosť) a <b>uhol</b> (fázu). V kvantovom svete každý možný výsledok nesie takúto ručičku.',
      'Pravdepodobnosť je <b>štvorec dĺžky</b> ručičky: |α|². Uhol jej je ukradnutý! Prečo teda fáza vôbec existuje? To zistíš v treťej úlohe. 😉',
      'Pod tebou je <b>komplexná rovina</b>: vodorovne <b>Re</b> (reálna časť), zvislo <b>Im</b> (imaginárna časť). Kruh je jednotková kružnica.',
    ], () => this.next());
  }

  // --- úloha 1: nastav ručičku ---
  setHand() {
    this.mode = 'set';
    this.target = C.scale(C.exp(3 * Math.PI / 4), 0.7);
    this.quest('Nastav ručičku amplitúdy α na zlatý cieľ (veľkosť aj fázu).');
    let r = 1, ph = 0;
    const info = UI.info('');
    const upd = () => {
      this.z = C.scale(C.exp(ph), r);
      info.innerHTML = `α = ${Fmt.num(r, 2)} · e<sup>i·${Fmt.angle(ph)}</sup> = ${Fmt.complex(this.z)}<br>`
        + `Re α = ${Fmt.num(this.z[0], 2)}, Im α = ${Fmt.num(this.z[1], 2)}<br>`
        + `<b>P = |α|² = ${Fmt.num(r * r, 2)}</b> &nbsp;<small>(fáza na P nemá vplyv!)</small>`;
      if (!this.done1 && C.abs(C.sub(this.z, this.target)) < 0.06) {
        this.done1 = true;
        this.grant(['euler', 'eiphi', 'amp']);
        this.say(['Presne! Všimni si: kým si menil iba <b>fázu</b>, stĺpec pravdepodobnosti sa nepohol. Menil sa len pri zmene <b>veľkosti</b>.'], () =>
          this.ask({ q: 'Dve amplitúdy: 0,7 a 0,7·e<sup>iπ/2</sup> (= 0,7i). Majú rovnakú pravdepodobnosť?', options: ['Áno, obe 0,49', 'Nie, druhá má −0,49', 'Nie, druhá má 0,7'], correct: 0, why: '|0,7i|² = 0,7i · (−0,7i) = 0,49. Fáza sa v |α|² stratí.' }, () => this.next()));
      }
    };
    UI.panelSet('Ručička amplitúdy α', [
      UI.slider('veľkosť |α|', 0, 1, 0.01, 1, (v) => { r = v; upd(); return Fmt.num(v, 2); }),
      UI.slider('fáza φ', 0, 6.28, 0.01, 0, (v) => { ph = v; upd(); return Fmt.angle(v); }),
      info,
      UI.info('💡 Tip: zlatý cieľ má veľkosť 0,7 a fázu 3π/4 (135°).', 'tip'),
    ]);
  }

  // --- úloha 2: násobenie i = otočenie o 90° ---
  timesI() {
    this.mode = 'mul'; this.ang = 0; this.angShown = 0; this.mag = 1; this.presses = 0;
    this.target = C.of(-1);
    this.quest('Iba tlačidlom „× i“ dostaň ručičku z bodu 1 do bodu −1.');
    const info = UI.info('Stlačenia: 0');
    const press = (k, label) => {
      this.ang += k; this.presses++;
      info.innerHTML = `Stlačenia: ${this.presses} &nbsp; (posledné: ${label})<br>α = ${Fmt.complex(C.exp(this.ang))}`;
      if (!this.done2 && Math.abs(Math.cos(this.ang) + 1) < 1e-6) {
        this.done2 = true;
        setTimeout(() => {
          this.grant(['i']);
          this.say([`Hotovo za ${this.presses} ${this.presses === 2 ? 'stlačenia' : 'stlačení'}. <b>Násobenie i = otočenie o 90°</b>. Dve otočenia = 180°, teda <b>i · i = i² = −1</b>. Žiadna mágia, len geometria!`,
            'A ešte: e<sup>iπ</sup> = −1. Fáza π (otočenie o 180°) je presne to <b>znamienko mínus</b>, ktoré odlišuje stavy |+⟩ a |−⟩. Stretneš ich v Blochovom observatóriu.'], () =>
            this.ask({ q: 'Koľkokrát treba vynásobiť číslo 1 číslom i, aby sme sa dostali do −i?', options: ['3-krát (270°)', '1-krát', '4-krát'], correct: 0, why: '1 → i → −1 → −i. Štyri stlačenia by nás vrátili späť na 1.' }, () => this.next()));
        }, 700);
      }
    };
    UI.panelSet('Násobenie komplexným číslom', [
      UI.row(UI.button('× i', () => press(Math.PI / 2, '× i'), 'big'), UI.button('Späť na 1', () => { this.ang = 0; this.presses = 0; info.innerHTML = 'Stlačenia: 0'; })),
      info,
      UI.info('Pozoruj: veľkosť ručičky sa nemení, mení sa len smer (fáza).', 'tip'),
    ]);
  }

  // --- úloha 3: interferencia dvoch ciest ---
  interference() {
    this.mode = 'int'; this.ph2 = 0; this.gotZero = false; this.gotMax = false;
    this.quest('Dve cesty k tomu istému výsledku. Nájdi fázu, pri ktorej sa amplitúdy úplne VYRUŠIA (P = 0), aj fázu, pri ktorej je P maximálne.');
    this.say([
      'Teraz to najdôležitejšie. Do toho istého výsledku vedú <b>dve cesty</b>, každá má svoju amplitúdu A₁ a A₂ (dĺžka 0,5).',
      'Kvantové pravidlo: <b>najprv sčítaj ručičky (amplitúdy), až potom umocni</b>: P = |A₁ + A₂|². Klasické pravidlo pre vylučujúce sa alternatívy by sčítalo pravdepodobnosti: |A₁|² + |A₂|² = 0,5 vždy.',
      'Prirovnanie: dvaja ľudia tlačia hojdačku. Ak tlačia <b>v rytme</b>, hojdačka letí vysoko. Ak <b>proti sebe</b>, nepohne sa. Tu ide o rytmus — teda <b>relatívnu fázu</b>.',
    ]);
    const info = UI.info('');
    const upd = (v) => {
      this.ph2 = v;
      const A1 = C.of(0.5), A2 = C.scale(C.exp(v), 0.5), S = C.add(A1, A2), P = C.abs2(S);
      const term = 2 * C.mul(A1, C.conj(A2))[0];
      info.innerHTML = `A₁ = ½, A₂ = ½·e<sup>i·${Fmt.angle(v)}</sup><br>`
        + `<b>kvantovo: P = |A₁ + A₂|² = ${Fmt.num(P, 2)}</b><br>klasicky: |A₁|² + |A₂|² = ½<br>`
        + `interferenčný člen 2·Re(A₁A₂*) = ${Fmt.num(term, 2)}<br>`
        + `${this.gotZero ? '✅' : '⬜'} deštruktívna (P = 0) &nbsp; ${this.gotMax ? '✅' : '⬜'} konštruktívna (P = 1)`;
      if (P < 0.01 && !this.gotZero) { this.gotZero = true; UI.toast('✅ Deštruktívna interferencia: ručičky smerujú proti sebe!'); }
      if (P > 0.99 && !this.gotMax && this.gotZero) { this.gotMax = true; UI.toast('✅ Konštruktívna interferencia!'); }
      if (this.gotZero && this.gotMax && !this.done3) {
        this.done3 = true;
        setTimeout(() => {
          this.grant(['interf', 'abs2', 'ReIm', 'conj']);
          this.say(['Výborne! Pri fáze π je P = 0, hoci každá cesta sama by dala ¼. <b>Toto je jadro kvantovej mechaniky</b>: fáza je neviditeľná v jednej amplitúde, ale rozhoduje, keď sa amplitúdy stretnú.',
            'Kvantové algoritmy robia presne toto: usporiadajú fázy tak, aby sa zlé odpovede vyrušili a dobré zosilnili.'], () => this.next());
        }, 500);
      }
      return Fmt.angle(v);
    };
    UI.panelSet('Interferencia dvoch ciest', [UI.slider('fáza cesty 2', 0, 6.28, 0.01, 0, upd), info,
      UI.info('Najprv nájdi P = 0, potom P = 1.', 'tip')]);
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
    if (this.mode === 'set') {
      r.arrow(O, this.W(this.target), [1, 0.82, 0.2], 0.045, { alpha: 0.5, emissive: 0.5 });
      r.arrow(O, this.W(this.z), [1, 0.35, 0.45], 0.05, { emissive: 0.3 });
      r.rod(this.W([this.z[0], 0]), this.W(this.z), [0.6, 0.8, 1], 0.01);
      r.rod(this.W([0, this.z[1]]), this.W(this.z), [0.6, 0.8, 1], 0.01);
      UI.label('alpha', V3.add(this.W(this.z), [0, 0.35, 0]), 'α', 'player');
      UI.hot(this.W(this.z), `<b>Amplitúda α</b> = ${Fmt.complex(this.z)}<br>dĺžka ${Fmt.num(C.abs(this.z), 2)}, fáza ${Fmt.angle(C.arg(this.z))}`, 30);
      UI.hot(this.W(this.target), '<b>Zlatý cieľ</b>: veľkosť 0,7, fáza 3π/4.', 26);
      UI.hot([3.4, 1.2, -1.6], `<b>Stĺpec pravdepodobnosti</b> P = |α|² = ${Fmt.num(C.abs2(this.z), 2)}. Mení sa len s dĺžkou ručičky.`, 40);
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
      UI.hot(this.W(S), `<b>Súčet amplitúd</b> A₁ + A₂ = ${Fmt.complex(S)}. Kvantovo umocňujeme až tento súčet.`, 30);
      UI.hot([3.4, 1, -0.6], '<b>Kvantová pravdepodobnosť</b> |A₁ + A₂|² — závisí od relatívnej fázy.', 36);
      UI.hot([3.4, 0.6, 0.6], '<b>Klasická predpoveď</b> |A₁|² + |A₂|² = ½ — bez interferencie, nezávisí od fázy.', 36);
      const P = C.abs2(S);
      r.draw('cylinder', M4.trs([3.4, 0, -0.6], 0, [0.25, Math.max(P * 2.5, 0.01), 0.25]), [1, 0.5, 0.6], { emissive: 0.3 });
      r.draw('cylinder', M4.trs([3.4, 0, 0.6], 0, [0.25, 0.5 * 2.5, 0.25]), [0.6, 0.6, 0.7]);
      UI.label('Pq', [3.4, 2.9, -0.6], 'kvantovo<br>|A₁+A₂|²', 'axis');
      UI.label('Pc', [3.4, 1.7, 0.6], 'klasicky<br>|A₁|²+|A₂|²', 'axis');
    }
  }
}
