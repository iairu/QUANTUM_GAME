'use strict';
// Uvítacia obrazovka pri prvom spustení (alebo po resete): výber témy a obťažnosti.
// Ešte nie je zvolená žiadna téma, preto v pozadí beží len jednoduchá WebGL scéna (Blochova sféra a portály).

const DIFF_ICON = {
  // srdce v dlaniach — všetko po ľudsky
  layman: '<svg viewBox="0 0 48 48"><path d="M24 33c-6-4.4-10-8-10-12.2 0-2.7 2.1-4.8 4.7-4.8 2.1 0 3.6 1.2 5.3 3.3 1.7-2.1 3.2-3.3 5.3-3.3 2.6 0 4.7 2.1 4.7 4.8C34 25 30 28.6 24 33z" fill="currentColor"/><path d="M6 27c3 6 9 11 18 12m18-12c-3 6-9 11-18 12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".55"/></svg>',
  // pierko — ľahko
  easy: '<svg viewBox="0 0 48 48"><path d="M38 8C24 9 13 18 12 34l4-1c6-1 12-5 16-11-3 0-6 0-8-1 4-1 8-3 10-6-2 0-4 0-6-1 5-1 8-3 10-6z" fill="currentColor"/><path d="M8 42l12-14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  // váhy v rovnováhe — pôvodná hra
  normal: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M24 7v33M14 40h20M10 13h28"/><circle cx="24" cy="9" r="2.5" fill="currentColor"/><path d="M10 13l-5 12h10zM38 13l-5 12h10z"/><path d="M5 25a5 3 0 0 0 10 0M33 25a5 3 0 0 0 10 0" fill="currentColor"/></svg>',
  // plameň — náročné
  hard: '<svg viewBox="0 0 48 48"><path d="M25 4c2 8 11 12 11 23a12 12 0 0 1-24 0c0-5 2-8 5-11 0 4 1 7 4 8-1-8 2-14 4-20z" fill="currentColor"/><path d="M24 42a6 6 0 0 1-6-6c0-3 2-5 4-7 0 3 2 4 3 4 0-3 1-5 3-7 1 3 2 5 2 10a6 6 0 0 1-6 6z" fill="#fff" opacity=".45"/></svg>',
  // zvitok — história objavov
  ancient: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 8h24a4 4 0 0 1 0 8h-4v20a4 4 0 0 1-4 4H10a4 4 0 0 1 0-8h4z" fill="currentColor" fill-opacity=".2"/><path d="M14 32V8a4 4 0 0 0-4 4v4h4M30 40a4 4 0 0 0 4-4v-4H10"/><path d="M20 16h8M20 22h8M20 28h6" stroke-width="2.4"/></svg>',
};
const DIFF_TAG = {
  layman: tr('Prvý krok do kvantového sveta', 'Brand new to the quantum world', 'Перший крок у квантовий світ'),
  easy: tr('Pohodové tempo s nápovedami', 'A relaxed pace with hints', 'Спокійний темп із підказками'),
  normal: tr('Hra tak, ako bola navrhnutá', 'The game as it was designed', 'Гра такою, якою її задумано'),
  hard: tr('Rovnice, presnosť, žiadne nápovedy', 'Equations, precision, no hints', 'Рівняння, точність, жодних підказок'),
  ancient: tr('Ťažká + história fyziky', 'Hard + the history of physics', 'Складна + історія фізики'),
};
// „normálna“ má v nastaveniach len krátky popis; tu ju treba porovnať s ostatnými
const WELCOME_DESC = {
  normal: tr('pôvodná hra: štandardné tolerancie, počet pokusov aj hviezdičky — presne medzi ľahkou a ťažkou',
    'the original game: standard tolerances, number of trials and stars — right between easy and hard', 'оригінальна гра: стандартні допуски, кількість спроб і зірки — рівно посередині між легкою та складною'),
};
const DIFF_TITLE = {
  layman: tr('Laická', 'Layman', 'Для новачків'), easy: tr('Ľahká', 'Easy', 'Легка'), normal: tr('Normálna', 'Normal', 'Звичайна'), hard: tr('Ťažká', 'Hard', 'Складна'), ancient: tr('Prastará', 'Ancient', 'Прадавня'),
};
const MODE_TAG = {
  pictures: tr('Intuícia cez obrazy a pokusy', 'Intuition through pictures and experiments', 'Інтуїція через образи й досліди'),
  equations: tr('Skutočná rovnica, ktorá práve platí', 'The real equation of the moment', 'Справжнє рівняння цієї миті'),
};
// ukážka typu hry: pár slov bežnou rečou / jedna farebná rovnica (živé HTML, v jazyku hry)
const MODE_SHOT = {
  pictures: () => `<span class="words">${tr('Každá odpoveď nesie <b>malú šípku</b>. Čím dlhšia šípka, tým <b>častejšie</b> odpoveď padne.',
    'Every answer carries a <b>little arrow</b>. The longer the arrow, the <b>more often</b> that answer comes up.',
    'Кожна відповідь несе <b>маленьку стрілку</b>. Що довша стрілка, то <b>частіше</b> випадає ця відповідь.')}</span>`,
  equations: () => `<span class="eqi">${EqG.glyphify(EqG.colorMath('|ψ⟩ = α|0⟩ + β|1⟩'), true)}</span>`,
};
const THEME_INFO = {
  classic: {
    name: tr('Klasická', 'Classic', 'Класична'), icon: '🔬',
    tag: tr('Čistý vedecký svet', 'A clean scientific world', 'Чистий науковий світ'),
    desc: tr('Minimalistický ostrov s mriežkou a 8 portálmi. Nič neodvádza pozornosť od fyziky — a beží aj na slabších počítačoch.',
      'A minimalist grid island with 8 portals. Nothing distracts from the physics — and it runs on weaker computers too.', 'Мінімалістичний острів із сіткою та 8 порталами. Ніщо не відволікає від фізики — і гра йде навіть на слабших комп’ютерах.'),
  },
  nordic: {
    name: tr('Severská', 'Nordic', 'Північна'), icon: '🏔',
    tag: tr('Zasnežené hory a runy', 'Snowy mountains and runes', 'Засніжені гори та руни'),
    desc: tr('Borovicový les pod horami v štýle severských ság. Každý mentor ťa naučí slovo moci a v 9. leveli porazíš kvantového draka Ketvarra.',
      'A pine forest under the mountains in the style of the northern sagas. Each mentor teaches you a Word of Power, and in level 9 you defeat the quantum dragon Ketvarr.', 'Сосновий ліс під горами в дусі північних саг. Кожен наставник навчить тебе слова сили, а в 9-му рівні ти переможеш квантового дракона Кетварра.'),
  },
  wow: {
    name: 'MMO', icon: '⚔️',
    tag: tr('Hraj ako v online RPG', 'Play it like an online RPG', 'Грай як в онлайн-RPG'),
    desc: tr('Kúzla 1–7, boj s klasickými omylmi, úlohy, skúsenosti, obchodník Planck, korisť a jazda na Blochovej guli. Levely sú dungeony s bossmi — a na konci čaká drak.',
      'Spells 1–7, fights with classical misconceptions, quests, experience, Planck the vendor, loot and a Bloch-sphere mount. Levels are dungeons with bosses — and a dragon awaits at the end.', 'Закляття 1–7, бої з класичними хибними уявленнями, завдання, досвід, торговець Планк, здобич і верхова Блохова куля. Рівні — це підземелля з босами, а наприкінці чекає дракон.'),
  },
};

const Welcome = {
  show(done) {
    this.done = done;
    // predvolená je v každej sekcii prvá voľba: klasická téma, laická obťažnosť, bez zvitkov, prevažne ľudský jazyk
    // (po zmene jazyka na uvítacej obrazovke ostanú voľby hráča)
    let keep = false;
    try { keep = sessionStorage.getItem('kvantp-welcome-keep') === '1'; sessionStorage.removeItem('kvantp-welcome-keep'); } catch (e) { /* bez úložiska */ }
    if (keep) { this.theme = Settings.theme; this.diff = Settings.diff; this.scrolls = Settings.scrolls; this.mode = Settings.mode; }
    else { this.theme = THEMES[0]; this.diff = DIFFS[0]; this.scrolls = false; this.mode = MODES[0]; }
    this.prevTheme = Settings.theme;
    document.documentElement.dataset.theme = 'classic'; // neutrálny vzhľad, kým nie je zvolená téma
    document.body.classList.add('welcoming');
    const el = this.el = document.createElement('div');
    el.id = 'welcome';
    el.innerHTML = `<div class="wbox">
      <select class="wlang"><option value="sk">SK</option><option value="en">EN</option><option value="uk">UA</option></select>
      <div class="whead">
        <div class="wpsi">ψ</div>
        <h1>${tr('Psíčko v kvantovom svete', 'Little Psi in the Quantum World', 'Псічко у квантовому світі')}</h1>
        <p>${tr('Vyber si štýl hry, obťažnosť, historické zvitky a rovnice. Všetko sa dá neskôr zmeniť v nastaveniach.', 'Choose the gameplay style, the difficulty, historic scrolls and equations. Everything can be changed later in the settings.', 'Обери стиль гри, складність, історичні сувої та рівняння. Усе можна згодом змінити в налаштуваннях.')}</p>
      </div>
      <h2>${tr('1 · Štýl hry', '1 · Gameplay style', '1 · Стиль гри')}</h2>
      <div class="wthemes">${THEMES.map((t) => `
        <button class="wtheme" data-v="${t}">
          <span class="shot"><img src="assets/theme-${t}.webp" alt="" loading="eager"><span class="ticon">${THEME_INFO[t].icon}</span></span>
          <b>${THEME_INFO[t].name}</b><i>${THEME_INFO[t].tag}</i>
          <span class="d">${THEME_INFO[t].desc}</span>
        </button>`).join('')}
      </div>
      <h2>${tr('2 · Obťažnosť', '2 · Difficulty', '2 · Складність')}</h2>
      <div class="wdiffs">${DIFFS.map((d) => `
        <button class="wdiff ${d}" data-v="${d}">
          <span class="dicon">${DIFF_ICON[d]}</span>
          <b>${DIFF_TITLE[d]}</b><i>${DIFF_TAG[d]}</i>
          <span class="d">${(WELCOME_DESC[d] || DIFF_DESC[d]).replace(/^./, (c) => c.toUpperCase())}.</span>
        </button>`).join('')}
      </div>
      <h2>${tr('3 · História', '3 · History', '3 · Історія')}</h2>
      <div class="wdiffs wscrolls">${[false, true].map((on) => `
        <button class="wdiff wsc${on ? ' on-scrolls' : ''}" data-s="${on ? 1 : 0}">
          <span class="dicon">${on ? DIFF_ICON.ancient : '—'}</span>
          <b>${on ? SCROLLS_NAME : tr('Bez zvitkov', 'No scrolls', 'Без сувоїв')}</b>
          <span class="d">${on ? SCROLLS_DESC.replace(/^./, (c) => c.toUpperCase()) + '.' : tr('Len fyzika — bez historických vložiek.', 'Physics only — no historical interludes.', 'Лише фізика — без історичних вставок.')}</span>
        </button>`).join('')}
      </div>
      <h2>${tr('4 · Rovnice', '4 · Equations', '4 · Рівняння')}</h2>
      <div class="wmodes">${MODES.map((m) => `
        <button class="wmode" data-v="${m}">
          <span class="shot live ${m}">${MODE_SHOT[m]()}</span>
          <span class="mtext"><b>${MODE_NAME[m]}</b><i>${MODE_TAG[m]}</i><span class="d">${MODE_DESC[m].replace(/^./, (c) => c.toUpperCase())}.</span></span>
        </button>`).join('')}
      </div>
      <div class="wgo"><button class="primary big">${tr('▶ Začať hru', '▶ Start the game', '▶ Почати гру')}</button></div>
    </div>`;
    document.body.appendChild(el);
    const sync = () => {
      el.querySelectorAll('.wtheme').forEach((b) => b.classList.toggle('on', b.dataset.v === this.theme));
      el.querySelectorAll('.wmode').forEach((b) => b.classList.toggle('on', b.dataset.v === this.mode));
      el.querySelectorAll('.wdiff[data-v]').forEach((b) => b.classList.toggle('on', b.dataset.v === this.diff));
      el.querySelectorAll('.wsc').forEach((b) => b.classList.toggle('on', b.dataset.s === (this.scrolls ? '1' : '0')));
    };
    el.querySelectorAll('.wmode').forEach((b) => { b.onclick = () => { this.mode = b.dataset.v; Sound.sfx('click'); sync(); }; });
    el.querySelectorAll('.wtheme').forEach((b) => { b.onclick = () => { this.theme = b.dataset.v; Sound.sfx('click'); sync(); }; });
    el.querySelectorAll('.wdiff[data-v]').forEach((b) => { b.onclick = () => { this.diff = b.dataset.v; Sound.sfx('click'); sync(); }; });
    el.querySelectorAll('.wsc').forEach((b) => { b.onclick = () => { this.scrolls = b.dataset.s === '1'; Sound.sfx('click'); sync(); }; });
    const ls = el.querySelector('.wlang');
    ls.value = LANG;
    ls.onchange = () => { Settings.theme = this.theme; Settings.diff = this.diff; Settings.mode = this.mode; Settings.scrolls = this.scrolls; Settings.save(); try { sessionStorage.setItem('kvantp-welcome-keep', '1'); } catch (e) { /* bez úložiska */ } setLang(ls.value); }; // voľby prežijú znovunačítanie
    el.querySelector('.wgo button').onclick = () => this.start();
    sync();
    this.running = true;
    requestAnimationFrame((t) => this.frame(t));
  },
  start() {
    Settings.theme = this.theme; Settings.diff = this.diff; Settings.mode = this.mode; Settings.scrolls = this.scrolls; Settings.save();
    // značka „hra začatá“: prázdny postup, aby sa uvítanie znovu neukázalo
    try { localStorage.setItem('kvantp-game1', '{}'); } catch (e) { /* bez ukladania */ }
    if (this.theme !== this.prevTheme) { location.reload(); return; } // téma mení obsah hry (levely, ostrov)
    this.running = false;
    this.el.remove();
    document.body.classList.remove('welcoming');
    document.documentElement.dataset.theme = Settings.theme;
    UI.diffUi && UI.diffUi();
    EqM.apply();
    this.done();
  },
  // jednoduché pozadie: sklenená Blochova sféra s precesujúcim stavom a 8 farebných portálov na obežnej dráhe
  frame(now) {
    if (!this.running) return;
    const r = Game.r, t = now / 1000, a = t * 0.12;
    r.time = t; r.fog = 0; r.shiftX = 0;
    r.begin([Math.sin(a) * 7.5, 2.4 + Math.sin(t * 0.21) * 0.6, Math.cos(a) * 7.5], [0, 0.2, 0], 0.9);
    const R = 1.7;
    r.draw('circle', M4.trs([0, 0, 0], 0, R), [0.55, 0.75, 1]);
    r.draw('circle', M4.orient([0, 0, 0], [1, 0, 0], R), [0.35, 0.45, 0.7]);
    r.draw('circle', M4.orient([0, 0, 0], [0, 0, 1], R), [0.35, 0.45, 0.7]);
    r.draw('axes', M4.trs([0, 0, 0], 0, R * 1.18), [0.6, 0.65, 0.8]);
    const th = 1.0 + Math.sin(t * 0.37) * 0.45, ph = t * 0.9;
    const tip = [Math.sin(th) * Math.cos(ph) * R, Math.cos(th) * R, -Math.sin(th) * Math.sin(ph) * R];
    r.arrow([0, 0, 0], tip, [1, 0.35, 0.45], R * 0.035, { emissive: 0.35 });
    r.sphere(tip, R * 0.05, [1, 0.35, 0.45], { emissive: 0.6 });
    r.draw('circle', M4.trs([0, tip[1], 0], 0, Math.hypot(tip[0], tip[2])), [1, 0.6, 0.7], { alpha: 0.5 }); // dráha precesie
    for (let k = 0; k < 8; k++) {
      const L = LEVELS[k], b = -t * 0.18 + (k / 8) * Math.PI * 2, rr = 3.6, y = Math.sin(t * 0.8 + k) * 0.25 - 0.4;
      r.sphere([Math.cos(b) * rr, y, Math.sin(b) * rr], 0.16, L.color, { emissive: 0.7 });
    }
    r.draw('torus', M4.trs([0, -0.4, 0], 0, 3.6), [0.5, 0.6, 0.9], { alpha: 0.18, emissive: 0.3 });
    r.sphere([0, 0, 0], R, [0.45, 0.6, 1], { alpha: 0.13 });
    requestAnimationFrame((tt) => this.frame(tt));
  },
};
