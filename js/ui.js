'use strict';
// Používateľské rozhranie: dialógy (s návratom späť), kvízy, panely, popisky v 3D, vysvetlivky pri prejdení myšou,
// denník všetkých rozhovorov, kódex symbolov.

const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

// výberová otázka z lang/*.csv: kľúč.q, kľúč.options.0 … (správna je vždy prvá), kľúč.why;
// voliteľne kľúč.whyWrong.N = vysvetlenie práve tej nesprávnej možnosti, kľúč.weak = index najmenej vierohodnej
// (ľahká obťažnosť vypustí len ju). Kľúč je zároveň stabilné id otázky (štatistiky, opakovanie s odstupom).
function QZ(key) {
  const options = [];
  for (let i = 0; DL.has(`${key}.options.${i}`); i++) options.push(DL(`${key}.options.${i}`));
  const q = { id: key, q: DL(key + '.q'), options, correct: 0, why: DL(key + '.why') };
  options.forEach((_, i) => { if (i && DL.has(`${key}.whyWrong.${i}`)) (q.whyWrong = q.whyWrong || {})[i] = DL(`${key}.whyWrong.${i}`); });
  if (DL.has(key + '.weak')) q.weak = +DL(key + '.weak');
  return q;
}

const UI = {
  busy: false, // beží dialóg alebo kvíz (pohyb postavy je zablokovaný)
  log: [],     // denník: [{scene, kind:'say'|'quiz', lines | q, answer, why, ok}]
  hots: [],    // 3D „hotspoty“ s vysvetlivkou (v pixeloch obrazovky), plnia sa každý snímok

  init() {
    this.labelsRoot = $('#labels'); this.labelPool = new Map(); this.labelUsed = new Set();
    this.dialog = $('#dialog'); this.panel = $('#panel'); this.hud = $('#hud'); this.tip = $('#tip');
    document.title = tr('Psíčko v kvantovom svete', 'Little Psi in the Quantum World', 'Псічко у квантовому світі');
    for (const [id, text, title] of [
      ['#btn-hub', tr('🏝 Ostrov', '🏝 Island', '🏝 Острів'), tr('Späť na ostrov', 'Back to the island', 'Назад на острів')],
      ['#btn-map', tr('🗺 Mapa', '🗺 Map', '🗺 Мапа'), tr('Mapa (M)', 'Map (M)', 'Мапа (M)')],
      ['#btn-codex', tr('📖 Kódex', '📖 Codex', '📖 Кодекс'), tr('Kódex symbolov (C)', 'Codex of symbols (C)', 'Кодекс символів (C)')],
      ['#btn-log', tr('📜 Denník', '📜 Journal', '📜 Щоденник'), tr('Denník rozhovorov (L)', 'Conversation journal (L)', 'Щоденник розмов (L)')],
      ['#btn-views', '👁', tr('Pohľady: ten istý stav ako obrázky — ručičky, Blochove rezy, bázy, matica ρ (V)', 'Views: the same state as pictures — hands, Bloch cuts, bases, ρ matrix (V)', 'Погляди: той самий стан у вигляді картинок — стрілки, перерізи Блоха, базиси, матриця ρ (V)')],
      ['#btn-settings', '⚙', tr('Nastavenia: vizualizácie a geometria (O)', 'Settings: visualizations and geometry (O)', 'Налаштування: візуалізації та геометрія (O)')],
      ['#btn-help', '❔', tr('Pomoc (H)', 'Help (H)', 'Довідка (H)')],
      ['#btn-appear', Settings.appearance === 'light' ? '🌙' : '☀️', tr('Svetlý / tmavý režim (T)', 'Light / dark mode (T)', 'Світлий / темний режим (T)')],
      ['#btn-sound', Settings.audio.muted ? '🔇' : '🔊', tr('Hudba a zvuky: zapnúť / stlmiť (N). Hlasitosť nájdeš v nastaveniach.', 'Music and sounds: on / mute (N). Volume is in the settings.', 'Музика та звуки: увімкнути / вимкнути (N). Гучність — у налаштуваннях.')],
    ]) { $(id).textContent = text; $(id).title = title; }
    const ls = $('#lang-select');
    ls.value = LANG;
    ls.dataset.tip = tr('Jazyk / Language — zmena znovu načíta hru (postup zostane uložený).', 'Language / Jazyk — switching reloads the game (your progress stays saved).', 'Мова / Language — зміна перезавантажить гру (поступ залишиться збереженим).');
    ls.onchange = () => setLang(ls.value);
    const ua = $('#btn-unlock-all');
    ua.textContent = tr('🔓 Odomknúť všetky levely', '🔓 Unlock all levels', '🔓 Відкрити всі рівні');
    ua.onclick = () => this.unlockAllAsk();
    const rb = $('#btn-reset');
    rb.textContent = tr('🗑 Reset hry', '🗑 Reset game', '🗑 Скинути гру');
    rb.onclick = () => this.resetAsk();
    const ds = $('#diff-select');
    for (const d of DIFFS) { const o = el('option', null, DIFF_NAME[d]); o.value = d; ds.appendChild(o); }
    const diffUi = () => { ds.value = Settings.diff; ds.className = Settings.diff; ds.dataset.tip = `<b>${tr('Obťažnosť', 'Difficulty', 'Складність')}: ${DIFF_NAME[Settings.diff]}</b> — ${DIFF_DESC[Settings.diff]}.<br>${tr('Dá sa zmeniť kedykoľvek.', 'Can be changed at any time.', 'Можна змінити будь-коли.')}`; };
    diffUi();
    ds.onchange = () => { Game.setDifficulty(ds.value); diffUi(); ds.blur(); };
    this.diffUi = diffUi;
    $('#settings .close').onclick = () => this.toggleSettings(false);
    $('#btn-settings').onclick = () => this.toggleSettings();
    $('#btn-views').onclick = () => Views.toggle();
    $('#btn-codex').onclick = () => this.toggleCodex();
    $('#btn-map').onclick = () => Game.toggleMap();
    $('#btn-help').onclick = () => this.toggleHelp();
    $('#btn-sound').onclick = () => Sound.toggleMute();
    $('#btn-appear').onclick = () => this.toggleAppearance();
    $('#btn-hub').onclick = () => Game.backToHub();
    this.hubBtn = $('#btn-hub');
    $('#btn-log').onclick = () => this.toggleLog();
    $('#codex .close').onclick = () => this.toggleCodex(false);
    $('#help .close').onclick = () => this.toggleHelp(false);
    $('#journal .close').onclick = () => this.toggleLog(false);
    for (const b of document.querySelectorAll('#topbar button')) b.dataset.tip = tipFor(b.textContent) || b.title;
    try { this.log = JSON.parse(localStorage.getItem('kvantp-game1-log') || '[]'); } catch (e) { this.log = []; }
    this.initTooltips();
  },

  // ---------- svetlý / tmavý režim (vzhľad „Qiskit“) ----------
  appearUi() {
    const b = document.getElementById('btn-appear'); if (!b) return;
    b.textContent = Settings.appearance === 'light' ? '🌙' : '☀️';
    b.dataset.tip = tr('Svetlý / tmavý režim (T)', 'Light / dark mode (T)', 'Світлий / темний режим (T)');
  },
  toggleAppearance() {
    Settings.appearance = Settings.appearance === 'light' ? 'dark' : 'light';
    Settings.save();
    applyAppearance();
    this.appearUi();
    Sound.sfx('click');
  },

  // ---------- vysvetlivky pri prejdení myšou ----------
  initTooltips() {
    this.mouse = null;
    document.addEventListener('mousemove', (e) => {
      this.mouse = [e.clientX, e.clientY];
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (t && t.dataset.tip) return this.showTip(t.dataset.tip, e.clientX, e.clientY);
      if (e.target.id === 'gl' && !e.buttons) {
        if (Settings.wow) Wow.hoverCursor(e.clientX, e.clientY); // meč nad omylom, bublina nad postavou
        const h = this.hotAt(e.clientX, e.clientY);
        if (h) return this.showTip(h.tip, e.clientX, e.clientY);
      }
      this.hideTip();
    });
    document.addEventListener('mouseleave', () => this.hideTip());
  },
  showTip(html, x, y) {
    const t = this.tip;
    if (t._html !== html) { t.innerHTML = html; t._html = html; }
    t.classList.add('show');
    const w = t.offsetWidth, h = t.offsetHeight;
    t.style.left = Math.min(x + 16, window.innerWidth - w - 8) + 'px';
    t.style.top = (y + 18 + h > window.innerHeight ? y - h - 12 : y + 18) + 'px';
  },
  hideTip() { this.tip.classList.remove('show'); this.tip._html = null; },
  // zaregistruj 3D bod s vysvetlivkou (r = polomer v pixeloch)
  hot(world, tip, r = 34) {
    const p = Game.r.project(world);
    if (p && tip) this.hots.push({ x: p[0], y: p[1], r, tip });
  },
  hotAt(x, y) {
    let best = null, bd = 1e9;
    for (const h of this.hots) { const d = Math.hypot(h.x - x, h.y - y); if (d < h.r && d < bd) { bd = d; best = h; } }
    return best;
  },

  // ---------- popisky pripnuté k 3D bodom ----------
  labelsBegin() { this.labelUsed.clear(); this.hots = []; },
  label(key, world, html, cls = '', tip) {
    let e = this.labelPool.get(key);
    if (!e) { e = el('div', 'lbl'); this.labelsRoot.appendChild(e); this.labelPool.set(key, e); }
    if (e._html !== html || e._tipIn !== tip) {
      e.innerHTML = html; e._html = html; e._tipIn = tip;
      const t = tip === undefined ? tipFor(html) : tip;
      if (t) e.dataset.tip = t; else delete e.dataset.tip;
      e._cls = null;
    }
    const c = 'lbl ' + cls + (e.dataset.tip ? ' hastip' : '');
    if (e._cls !== c) { e.className = c; e._cls = c; }
    const p = Game.r.project(world);
    if (!p) { e.style.display = 'none'; return; }
    e.style.display = '';
    e.style.transform = `translate(${p[0]}px, ${p[1]}px) translate(-50%, -50%)` + (Settings.view.labelScale !== 1 ? ` scale(${Settings.view.labelScale})` : '');
    this.labelUsed.add(key);
  },
  labelsEnd() {
    for (const [k, e] of this.labelPool) if (!this.labelUsed.has(k)) e.style.display = 'none';
    // vysvetlivka 3D objektu sa aktualizuje aj bez pohybu myši (objekty sa hýbu)
    if (this.mouse && this.tip.classList.contains('show') && !this.dialog.matches(':hover') && !this.panel.matches(':hover')) {
      const under = document.elementFromPoint(this.mouse[0], this.mouse[1]);
      if (under && under.id === 'gl') { const h = this.hotAt(...this.mouse); if (h) this.showTip(h.tip, ...this.mouse); else this.hideTip(); }
    }
  },
  labelsClear() { this.labelsRoot.innerHTML = ''; this.labelPool.clear(); this.hideTip(); },

  // ---------- HUD ----------
  setHud(title, quest) {
    $('#hud-title').innerHTML = title;
    $('#hud-quest').innerHTML = quest ? '🎯 ' + annotate(Settings.easy ? emphasize(quest) : quest) : '';
    $('#hud-quest').className = Settings.diff + (Settings.layman ? ' easy' : '');
  },
  toast(html, ms = 2600) {
    Sound.sfx('toast');
    const t = el('div', 'toast', html);
    $('#toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), ms);
    setTimeout(() => t.remove(), ms + 600);
    return t;
  },

  // ---------- denník ----------
  scene() { return Game.scene && Game.scene !== Hub ? `${Game.scene.num} · ${Game.scene.title}` : tr('Hilbertov ostrov', 'Hilbert Island', 'Острів Гільберта'); },
  record(entry) {
    this.log.push({ scene: this.scene(), ...entry });
    if (this.log.length > 400) this.log.splice(0, this.log.length - 400);
    try { localStorage.setItem('kvantp-game1-log', JSON.stringify(this.log)); } catch (e) { /* bez ukladania */ }
  },
  toggleLog(force) {
    const j = $('#journal'), show = force ?? !j.classList.contains('show');
    if (show !== j.classList.contains('show')) Sound.sfx(show ? 'journal' : 'close');
    j.classList.toggle('show', show);
    if (show) this.renderLog();
  },
  renderLog() {
    const list = $('#journal .list');
    list.innerHTML = '';
    if (!this.log.length) { list.appendChild(el('p', 'muted', tr('Zatiaľ prázdny. Každý rozhovor, rovnica úlohy a vysvetlenie z kvízu sa sem uloží.', 'Empty so far. Every conversation, task equation and quiz explanation will be saved here.', 'Поки що порожньо. Сюди збережеться кожна розмова, рівняння завдання та пояснення з вікторини.'))); return; }
    let lastScene = null;
    [...this.log].reverse().forEach((en, idx) => {
      if (en.scene !== lastScene) { list.appendChild(el('h3', null, en.scene)); lastScene = en.scene; }
      const box = el('details', 'entry');
      if (en.kind === 'say') {
        const first = en.lines[0];
        box.appendChild(el('summary', null, `💬 <b>${first.who || ''}</b>: ${first.text.replace(/<[^>]+>/g, '').slice(0, 90)}…`));
        for (const l of en.lines) box.appendChild(el('div', 'line', `<span class="who">${l.face || ''} ${l.who || ''}</span> ${annotate(l.text, false, true)}`));
        const rb = el('button', null, tr('▶ Prehrať znova', '▶ Replay', '▶ Відтворити знову'));
        rb.onclick = () => {
          if (this.busy) { this.toast(tr('Najprv dokonči aktuálny dialóg — text si však môžeš prečítať tu.', 'Finish the current dialogue first — but you can read the text here.', 'Спершу заверши поточний діалог — але текст можна прочитати тут.')); return; }
          this.toggleLog(false);
          this.say(en.lines, null, { replay: true });
        };
        box.appendChild(rb);
      } else if (en.kind === 'eq') {
        // ∑ rovnica úlohy (v oboch typoch hry); v type „Jazyk rovníc“ s glyfmi
        const plain = en.html.replace(/<[^>]+>|\[\[|\]\]/g, '').replace(/\s+/g, ' ').trim();
        box.classList.add('eqentry');
        box.appendChild(el('summary', null, `∑ <b>${tr('Rovnica', 'Equation', 'Рівняння')}</b>: ${plain.slice(0, 90)}…`));
        box.appendChild(el('div', 'line', annotate(en.html, false, true)));
      } else {
        box.appendChild(el('summary', null, `${en.ok ? '✅' : en.ok === null ? '⏭' : '❌'} <b>${tr('Otázka', 'Question', 'Питання')}:</b> ${en.q.replace(/<[^>]+>/g, '').slice(0, 90)}`));
        box.appendChild(el('div', 'line', annotate(en.q, false, true)));
        box.appendChild(el('div', 'line good', '✔ ' + en.answer));
        if (en.why) box.appendChild(el('div', 'line', annotate(en.why, false, true)));
      }
      if (idx === 0) box.open = true;
      list.appendChild(box);
    });
  },

  // ---------- dialógy ----------
  // lines: [{who, text, face}] alebo reťazce; done sa zavolá po poslednej replike
  // replika môže byť aj funkcia — prepočíta sa pri zmene obťažnosti (napr. počty, ktoré závisia od obťažnosti)
  say(lines, done, opts = {}) {
    const src = [...lines];
    const resolve = () => src.map((l) => (typeof l === 'function' ? l() : l)).map((l) => (typeof l === 'string' ? { text: l } : l));
    // karty „po ľudsky“ patria len laickej obťažnosti
    const build = () => TextMode.lines(resolve()).filter((l) => Settings.layman || l.cls !== 'plaincard');
    if (!opts.replay) { const rec = resolve().filter((l) => l.cls !== 'eqcard'); if (rec.length) this.record({ kind: 'say', lines: rec }); } // rovnica má v denníku vlastný záznam ∑
    lines = build();
    // 💬 preskočiť dialógy: ostanú len historické zvitky a karty rovníc (opakovanie z denníka sa prehrá celé)
    if (Settings.skipDialog && !opts.replay) lines = lines.filter((l) => l.cls === 'scroll' || l.cls === 'eqcard');
    if (!lines.length) { if (done) setTimeout(done, 0); return; }
    let i = 0, anchor = 0; // anchor = pôvodná replika, na ktorej hráč je (pri zmene obťažnosti sa naň vrátime aj cez zlúčené repliky)
    this.busy = true;
    let opened = false;
    const show = (silent) => {
      const l = lines[i];
      if (!silent && l.src) anchor = l.src[0];
      if (!silent) Sound.sfx(l.cls === 'scroll' ? 'scroll' : !opened ? 'dialog' : 'page'); opened = true;
      this.dialog.innerHTML = '';
      this.dialog.appendChild(el('div', 'who', (l.face || '💬') + ' ' + (l.who || '') + (opts.replay ? ` <small>(${tr('opakovanie', 'replay', 'повтор')})</small>` : '')));
      this.dialog.appendChild(el('div', 'txt', l.raw ? EqG.markEq(l.text) : TextMode.render(l.text)));
      this.dialog.className = 'show ' + Settings.diff + (Settings.layman ? ' easy' : '') + (Settings.hard ? ' hard' : '') + (l.cls ? ' ' + l.cls : '');
      const nav = el('div', 'nav');
      const back = el('button', null, tr('◂ Späť', '◂ Back', '◂ Назад'));
      back.disabled = i === 0; back.onclick = prev; back.dataset.tip = tr('Predchádzajúca replika (← alebo Backspace). Celé rozhovory nájdeš v Denníku (L).', 'Previous line (← or Backspace). Full conversations are in the Journal (L).', 'Попередня репліка (← або Backspace). Повні розмови — у Щоденнику (L).');
      nav.appendChild(back);
      nav.appendChild(this.askButton(l.text));
      nav.appendChild(el('span', 'hint', `${i + 1} / ${lines.length} · ${tr('Enter = ďalej, ← = späť', 'Enter = next, ← = back', 'Enter = далі, ← = назад')}`));
      const b = el('button', 'primary', i < lines.length - 1 ? tr('Ďalej ▸', 'Next ▸', 'Далі ▸') : tr('Rozumiem ✓', 'Got it ✓', 'Зрозуміло ✓'));
      b.onclick = next;
      nav.appendChild(b);
      this.dialog.appendChild(nav);
      this.dialog.classList.add('show');
      b.focus();
    };
    const next = () => {
      i++;
      if (i < lines.length) show();
      else { this.dialog.classList.remove('show'); this.busy = false; this._next = this._prev = null; done && done(); }
    };
    const prev = () => { if (i > 0) { i--; show(); } };
    this._next = next; this._prev = prev;
    // zmena obťažnosti počas dialógu: hneď prepočítaj repliky (zlúčenie v ťažkej, preklady v laickej, počty, karty „po ľudsky“)
    this.refreshDialog = () => {
      if (this._next !== next) return;
      const at = anchor;
      // prepnutie na laickú: karty „po ľudsky“ k aktuálnej úlohe sa vložia hneď pred aktuálnu repliku
      const ins = Settings.layman && Game.scene && Game.scene.plainCardsNow ? Game.scene.plainCardsNow() : [];
      if (ins.length) src.splice(at, 0, ...ins);
      const nl = build();
      if (!nl.length) { this.dialog.classList.remove('show'); this.busy = false; this._next = this._prev = null; done && done(); return; }
      const same = nl.findIndex((x) => x.src && x.src.includes(at)), after = nl.findIndex((x) => x.src && x.src[0] > at);
      i = same >= 0 ? same : after >= 0 ? after : nl.length - 1; // zmiznutá karta → ďalšia replika
      lines = nl; show(true);
    };
    show();
  },

  // poradie možností sa určí raz — pri prekreslení (zmena obťažnosti) ostane rovnaké.
  // Ľahká a laická vypustia len možnosť označenú ako najmenej vierohodná (q.weak); bez nej ostanú všetky,
  // lebo náhodne vypustená možnosť robila z väčšiny otázok hod mincou.
  quizOrder(q) {
    if (!q._order) {
      q._order = q.options.map((_, i) => i);
      if (q.shuffle !== false) q._order.sort(() => rand() - 0.5);
      q._drop = q.weak != null && q.weak !== q.correct ? q.weak : null;
    }
    return q._order.filter((i) => !(Settings.easy && q.options.length > 2 && i === q._drop));
  },
  // q: {q, options:[...], correct: index, why, whyWrong: {index: text}, id, who, face}; cb(true | false | null)
  // null = otázka sa preskočila (⏭ Bez kvízov) — preskočená otázka sa nepočíta ako správna
  quiz(q, cb, silent = false) {
    // ⏭ „Bez kvízov“: výberový dialóg sa neukáže — otázka so správnou odpoveďou a vysvetlením ide len do denníka
    if (Settings.noBlanks && !silent) {
      this.record({ kind: 'quiz', q: q.q, answer: q.options[q.correct], why: q.why, ok: null });
      Learn.skipped(q);
      setTimeout(() => cb && cb(null), 0);
      return;
    }
    this.busy = true;
    this._next = null; this._prev = null;
    this.dialog.innerHTML = '';
    if (!silent) Sound.sfx('dialog');
    let answered = false, pick = null;
    // zmena obťažnosti pred odpoveďou: otázka sa hneď prekreslí (počet možností v ľahkej, preklady v laickej)
    this.refreshDialog = () => { if (!answered) this.quiz(q, cb, true); };
    this.dialog.appendChild(el('div', 'who', (q.face || '❓') + ' ' + (q.who || tr('Otázka', 'Question', 'Питання')) + (q.tag ? ` · <span class="bsrc">${q.tag}</span>` : '')));
    this.dialog.appendChild(el('div', 'txt', annotate(q.q, true, true)));
    const box = el('div', 'choices'), order = this.quizOrder(q);
    // 🎯 sebadôvera: po výbere možnosti hráč povie, nakoľko si je istý — až potom sa odpoveď vyhodnotí
    const askConf = Settings.confidence && !q.noConf, conf = el('div', 'conf');
    const submit = (i, sure) => {
      answered = true;
      const ok = i === q.correct, b = box.children[order.indexOf(i)];
      conf.remove();
      Sound.sfx(ok ? 'good' : 'bad');
      Settings.wow && Wow.onAnswer(ok); // MMO: správna odpoveď = zásah bossa, nesprávna = jeho úder
      this.record({ kind: 'quiz', q: q.q, answer: q.options[q.correct], why: q.why, ok });
      Learn.answered(q, ok, { pick: i, conf: sure });
      [...box.children].forEach((c) => (c.disabled = true));
      b.classList.remove('sel'); b.classList.add(ok ? 'good' : 'bad');
      if (!ok) box.children[order.indexOf(q.correct)].classList.add('good');
      // vysvetlenie práve zvolenej nesprávnej možnosti (ak je), potom všeobecné vysvetlenie
      const own = !ok && q.whyWrong && q.whyWrong[i] ? annotate(q.whyWrong[i], true, true) + '<br>' : '';
      const note = sure === 2 && !ok ? `<div class="calib">${tr('💡 Bol(a) si si istý(-á) — toto je častý omyl. Otázka sa ti vráti v opakovaní, a to dvakrát.', '💡 You were sure — this is a common misconception. The question will come back in your reviews, twice.', '💡 Ти був(-ла) впевнений(-а) — це поширена хиба. Питання повернеться в повтореннях, і то двічі.')}</div>`
        : sure === 0 && ok ? `<div class="calib">${tr('🎲 Správne, ale tipoval(a) si — otázka sa ti ešte raz vráti, aby sme vedeli, že to nebola náhoda.', '🎲 Right, but you guessed — it will come back once more to check it wasn’t luck.', '🎲 Правильно, але ти вгадував(-ла) — питання ще раз повернеться, щоб перевірити, що це не випадковість.')}</div>` : '';
      const fb = el('div', 'why ' + (ok ? 'ok' : 'no'), (ok ? tr('✅ Správne. ', '✅ Correct. ', '✅ Правильно. ') : tr('❌ Nie celkom. ', '❌ Not quite. ', '❌ Не зовсім. ')) + own + annotate(q.why || '', true, true) + note);
      this.dialog.appendChild(fb);
      const c = el('button', 'primary', tr('Pokračovať ▸', 'Continue ▸', 'Продовжити ▸'));
      c.onclick = () => { this.dialog.classList.remove('show'); this.busy = false; this._next = null; cb && cb(ok); };
      this.dialog.appendChild(c);
      // až po odpovedi (inak by sa dala odpoveď len vyhľadať): otázka, správna odpoveď a vysvetlenie
      this.dialog.appendChild(this.askButton(`${q.q}\n${tr('Správna odpoveď', 'Correct answer', 'Правильна відповідь')}: ${q.options[q.correct]}\n${q.why || ''}`));
      this._next = c.onclick;
      c.focus();
    };
    for (const i of order) {
      const b = el('button', 'choice', mathText(q.options[i], true)); // vzorce v odpovediach: čip rovnice (a glyfy pri rovniciach najprv)
      b.onclick = () => {
        if (answered) return;
        if (!askConf) return submit(i, null);
        pick = i;
        [...box.children].forEach((c) => c.classList.toggle('sel', c === b));
        if (!conf.isConnected) this.dialog.appendChild(conf);
      };
      box.appendChild(b);
    }
    conf.appendChild(el('span', null, tr('Nakoľko si si istý(-á)?', 'How sure are you?', 'Наскільки ти впевнений(-а)?')));
    [[0, tr('🤷 tipujem', '🤷 guessing', '🤷 вгадую')], [1, tr('🙂 asi áno', '🙂 fairly sure', '🙂 мабуть, так')], [2, tr('💯 určite', '💯 certain', '💯 напевно')]].forEach(([k, t]) => {
      const b = el('button', 'confb', t);
      b.onclick = () => pick != null && !answered && submit(pick, k);
      conf.appendChild(b);
    });
    this.dialog.appendChild(box);
    this.dialog.className = 'show quizq ' + Settings.diff + (Settings.layman ? ' easy' : '') + (Settings.hard ? ' hard' : '');
  },
  // 🔮 predpoveď: hráč vyberie, čo sa stane, a predpoveď sa uzamkne bez vyhodnotenia — správnosť sa ukáže až po pokuse
  // (Learn.reveal). cb(index zvolenej možnosti) alebo cb(null) pri ⏭ Bez kvízov.
  predict(q, cb) {
    if (Settings.noBlanks) { Learn.skipped(q); setTimeout(() => cb && cb(null), 0); return; }
    this.busy = true;
    this._next = null; this._prev = null;
    this.dialog.innerHTML = '';
    Sound.sfx('dialog');
    let answered = false;
    this.refreshDialog = () => { if (!answered) this.predict(q, cb); };
    this.dialog.appendChild(el('div', 'who', `🔮 ${q.who || ''} · ${tr('predpoveď', 'prediction', 'передбачення')}`));
    this.dialog.appendChild(el('div', 'txt', annotate(q.q, true, true) + `<div class="calib">${tr('Najprv tipni, čo sa stane. Či máš pravdu, uvidíš až po pokuse.', 'First predict what will happen. You will find out whether you were right only after the experiment.', 'Спершу передбач, що станеться. Чи маєш рацію, побачиш лише після досліду.')}</div>`));
    const box = el('div', 'choices'), order = this.quizOrder(q);
    for (const i of order) {
      const b = el('button', 'choice', mathText(q.options[i], true));
      b.onclick = () => {
        if (answered) return;
        answered = true;
        Sound.sfx('click');
        [...box.children].forEach((c) => (c.disabled = true));
        b.classList.add('sel');
        this.dialog.appendChild(el('div', 'why lock', tr(`🔒 Predpoveď uzamknutá: <b>${mathText(q.options[i], true)}</b>. Teraz urob pokus — vyhodnotenie príde potom.`, `🔒 Prediction locked: <b>${mathText(q.options[i], true)}</b>. Now run the experiment — the verdict comes afterwards.`, `🔒 Передбачення зафіксовано: <b>${mathText(q.options[i], true)}</b>. Тепер проведи дослід — оцінка буде потім.`)));
        const c = el('button', 'primary', tr('Na pokus ▸', 'To the experiment ▸', 'До досліду ▸'));
        c.onclick = () => { this.dialog.classList.remove('show'); this.busy = false; this._next = null; cb && cb(i); };
        this.dialog.appendChild(c);
        this._next = c.onclick;
        c.focus();
      };
      box.appendChild(b);
    }
    this.dialog.appendChild(box);
    this.dialog.className = 'show quizq ' + Settings.diff + (Settings.layman ? ' easy' : '') + (Settings.hard ? ' hard' : '');
  },
  // 💡 stupňovitá nápoveda: každé kliknutie ukáže ďalší stupeň (smer → metóda → odpoveď). Posledný stupeň prezradí
  // odpoveď — úloha sa potom počíta ako „s pomocou“ (Learn.hint) a cieľ treba ukázať ešte raz bez nej.
  hints(steps, panelInfo) {
    let k = 0;
    const label = () => (k < steps.length ? tr(`💡 Nápoveda ${k + 1}/${steps.length}`, `💡 Hint ${k + 1}/${steps.length}`, `💡 Підказка ${k + 1}/${steps.length}`) : tr('💡 Nápoveda (všetky)', '💡 Hint (all shown)', '💡 Підказка (усі)'));
    const b = this.button(label(), () => {
      if (k >= steps.length) { UI.toast(steps[steps.length - 1], 5200); return; }
      const last = k === steps.length - 1;
      Learn.hint(Game.scene, last);
      const html = (last ? tr('🟡 <b>Odpoveď</b> (úloha sa ráta ako „s pomocou“): ', '🟡 <b>Answer</b> (the task counts as “assisted”): ', '🟡 <b>Відповідь</b> (завдання зараховується як «з допомогою»): ') : '') + steps[k];
      UI.toast(html, 5200);
      if (panelInfo) panelInfo.innerHTML = steps.slice(0, k + 1).map((s, j) => `${j + 1}. ${s}`).join('<br>');
      k++; b.innerHTML = label();
    }, '', tr('Najprv smer, potom metóda, nakoniec odpoveď. Posledný stupeň označí úlohu ako vyriešenú s pomocou.', 'First a direction, then a method, finally the answer. The last step marks the task as solved with help.', 'Спершу напрямок, потім метод, наостанок відповідь. Останній крок позначає завдання як розв’язане з допомогою.'));
    return b;
  },

  // ∑ doplň rovnicu: q = {eq: 'ρ′ = Uρ⟦0⟧', blanks: [[správna, nesprávna, …], …], ctx, why, who, face}; cb(spravne)
  // každé prázdne miesto ⟦n⟧ je rozbaľovací zoznam možností; správna je v dátach vždy prvá (zobrazia sa zamiešané)
  blanks(q, cb, silent = false) {
    this.busy = true;
    this._next = null; this._prev = null;
    this.dialog.innerHTML = '';
    if (!silent) Sound.sfx('dialog');
    let answered = false;
    this.refreshDialog = () => { if (!answered) this.blanks(q, cb, true); };
    const M = (s) => { const h = EqG.colorMath(s); return Settings.eq ? EqG.glyphify(h, true) : h; };
    const full = q.eq.replace(/⟦(\d+)⟧/g, (m, i) => q.blanks[i][0]);
    if (!q._ord) { q._ord = q.blanks.map((o) => o.map((_, i) => i).sort(() => rand() - 0.5)); q._pick = q.blanks.map(() => null); }
    // odkiaľ vzťah je (prednáška / tabuľa) a či bol v PDF zarámovaný — aby sa dal overiť v podkladoch
    const src = q.src ? ` · <span class="bsrc" data-tip="${tr('Vzťah z PDF prednášky — over si ho tam.', 'A relation from the lecture PDF — check it there.', 'Співвідношення з PDF лекції — перевір його там.')}">📄 ${tr('P', 'L', 'Л')}${q.src.replace('T', ' · ' + tr('tabuľa', 'board', 'дошка'))}</span>` : '';
    const tier = { box: ['▣', tr('V prednáške zarámované — kľúčový vzťah.', 'Boxed in the lecture — a key relation.', 'У лекції в рамці — ключове співвідношення.')], d: ['⤷', tr('Medzikrok odvodenia (len ťažká).', 'A derivation step (Hard only).', 'Проміжний крок виведення (лише складна).')] }[q.tier];
    this.dialog.appendChild(el('div', 'who', `${q.face || '∑'} ${q.who || ''} · ${tr('doplň rovnicu', 'complete the equation', 'доповни рівняння')}${src}${tier ? ` <span class="bsrc" data-tip="${tier[1]}">${tier[0]}</span>` : ''}`));
    this.dialog.appendChild(el('div', 'txt', annotate(q.ctx || tr('Doplň chýbajúce časti rovnice.', 'Fill in the missing parts of the equation.', 'Доповни пропущені частини рівняння.'), true, true)));
    const eqEl = el('div', 'eq eqb blankeq', q.eq.split(/⟦(\d+)⟧/).map((p, k) => (k % 2 ? `<span class="blank" data-i="${p}"></span>` : M(p))).join(''));
    // ponuka sa otvára mimo bloku rovnice (ten má overflow), pod kliknutým prázdnym miestom
    const menu = el('div', 'bmenu');
    const closeMenu = () => { menu.classList.remove('show'); eqEl.querySelectorAll('.blank.open').forEach((b) => b.classList.remove('open')); };
    const check = el('button', 'primary', tr('Skontrolovať ✓', 'Check ✓', 'Перевірити ✓'));
    const upd = () => { check.disabled = q._pick.some((p) => p == null); };
    eqEl.querySelectorAll('.blank').forEach((sp) => {
      const i = +sp.dataset.i, btn = el('button', 'bsel', q._pick[i] == null ? '?' : M(q.blanks[i][q._pick[i]]));
      sp.classList.toggle('filled', q._pick[i] != null);
      btn.dataset.tip = tr('Vyber, čo sem patrí.', 'Pick what belongs here.', 'Обери, що сюди належить.');
      btn.onclick = (e) => {
        e.stopPropagation();
        if (answered) return;
        const was = sp.classList.contains('open');
        closeMenu();
        if (was) return;
        sp.classList.add('open');
        menu.innerHTML = '';
        for (const j of q._ord[i]) {
          const o = el('button', 'bopt' + (q._pick[i] === j ? ' on' : ''), M(q.blanks[i][j]));
          o.onclick = (ev) => { ev.stopPropagation(); q._pick[i] = j; btn.innerHTML = M(q.blanks[i][j]); sp.classList.add('filled'); Sound.sfx('click'); closeMenu(); upd(); };
          menu.appendChild(o);
        }
        const d = this.dialog.getBoundingClientRect(), b = btn.getBoundingClientRect();
        menu.style.left = (b.left + b.width / 2 - d.left) + 'px';
        menu.classList.add('show');
        // dialóg je dole na obrazovke: ponuka sa otvára nahor (nadol len vtedy, keď sa nad prázdne miesto nezmestí)
        const up = b.top - 4 - menu.offsetHeight >= 6 || b.bottom + 4 + menu.offsetHeight > window.innerHeight - 6;
        menu.style.top = (up ? b.top - d.top - 4 - menu.offsetHeight : b.bottom - d.top + 4) + 'px';
      };
      sp.appendChild(btn);
    });
    this.dialog.onclick = closeMenu;
    this.dialog.append(eqEl, menu);
    check.onclick = () => {
      if (check.disabled || answered) return;
      answered = true; closeMenu();
      const ok = q._pick.every((p) => p === 0);
      Sound.sfx(ok ? 'good' : 'bad');
      Settings.wow && Wow.onAnswer(ok);
      eqEl.querySelectorAll('.blank').forEach((sp) => {
        const i = +sp.dataset.i, good = q._pick[i] === 0;
        sp.classList.add(good ? 'good' : 'bad');
        if (!good) sp.querySelector('.bsel').innerHTML = `<s>${M(q.blanks[i][q._pick[i]])}</s> ${M(q.blanks[i][0])}`;
      });
      const shown = q.eq.replace(/⟦\d+⟧/g, '( … )');
      this.record({ kind: 'quiz', q: `${q.ctx || ''} [[${shown}]]`, answer: `[[${full}]]`, why: q.why, ok });
      Learn.answered(q, ok, { kind: 'blank' });
      check.remove();
      this.dialog.appendChild(el('div', 'why ' + (ok ? 'ok' : 'no'), (ok ? tr('✅ Správne. ', '✅ Correct. ', '✅ Правильно. ') : tr('❌ Nie celkom — správne je: ', '❌ Not quite — the correct one is: ', '❌ Не зовсім — правильно так: '))
        + `<div class="eq eqb">${M(full)}</div>` + annotate(q.why || '', true, true)));
      const c = el('button', 'primary', tr('Pokračovať ▸', 'Continue ▸', 'Продовжити ▸'));
      c.onclick = () => { this.dialog.classList.remove('show'); this.dialog.onclick = null; this.busy = false; this._next = null; cb && cb(ok); };
      this.dialog.appendChild(c);
      this.dialog.appendChild(this.askButton(`${q.ctx || ''}\n${full}\n${q.why || ''}`));
      this._next = c.onclick;
      c.focus();
    };
    this.dialog.appendChild(check);
    upd();
    this.dialog.className = 'show blankq ' + Settings.diff + (Settings.hard ? ' hard' : '');
  },
  // séria „doplň rovnicu“ za sebou; cb(počet chýb)
  blankSeries(list, cb) {
    let i = 0, mistakes = 0;
    const step = () => (i >= list.length ? cb(mistakes) : this.blanks(list[i++], (ok) => { if (!ok) mistakes++; step(); }));
    step();
  },

  // „Opýtaj sa Google“: otvorí text repliky v novej karte v režime AI vyhľadávania Google (udm=50, ako udm=2 pre obrázky)
  askButton(html) {
    const b = el('button', 'ask', tr('🔎 Opýtaj sa Google', '🔎 Ask Google more', '🔎 Запитати Google'));
    b.dataset.tip = tr('Otvorí v novej karte AI vyhľadávanie Google s textom tejto repliky — ak chceš vedieť viac.', 'Opens Google AI search in a new tab with the text of this line — if you want to know more.', 'Відкриє пошук Google AI у новій вкладці з текстом цієї репліки — якщо хочеш дізнатися більше.');
    b.onclick = (e) => { e.stopPropagation(); this.askGoogle(html); };
    return b;
  },
  askGoogle(html) {
    const d = document.createElement('div');
    d.innerHTML = String(html).replace(/<sup>(.*?)<\/sup>/g, '^($1)').replace(/<sub>(.*?)<\/sub>/g, '_$1').replace(/<br\s*\/?>/g, '\n');
    const text = d.textContent.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim().slice(0, 1500);
    const q = tr('Vysvetli mi to podrobnejšie (kvantová mechanika): ', 'Explain this to me in more detail (quantum mechanics): ', 'Поясни мені це докладніше (квантова механіка): ') + text;
    window.open(`https://www.google.com/search?udm=50&hl=${LANG}&q=${encodeURIComponent(q)}`, '_blank', 'noopener');
  },

  // zruší rozbehnutý dialóg/kvíz bez pokračovania (odchod z levelu uprostred rozhovoru)
  cancelDialog() {
    this.dialog.classList.remove('show'); this.dialog.innerHTML = ''; this.dialog.onclick = null;
    this.busy = false; this._next = this._prev = null; this.refreshDialog = null;
  },

  // séria kvízov za sebou; cb(počet chýb) — preskočené otázky (null) chybou nie sú, ale ani správnou odpoveďou
  // (Learn.ask: pri chybe v generovanej otázke hneď nasleduje nová obmena s inými číslami)
  quizSeries(list, cb) {
    let i = 0, mistakes = 0;
    const step = () => {
      if (i >= list.length) return cb(mistakes);
      Learn.ask(Game.scene, list[i++], (ok) => { if (ok === false) mistakes++; step(); });
    };
    step();
  },

  // ---------- pravý panel s ovládaním levelu ----------
  panelSet(title, nodes) {
    this.panel.innerHTML = '';
    this.panel.appendChild(el('h3', null, title));
    for (const n of nodes) this.panel.appendChild(n);
    this.appendTheory();
    this.panel.classList.add('show');
  },
  // „📐 Teória a rovnice“: normálna = len jadro (zbalené), ťažká = jadro + aktuálny krok (rozbalené)
  appendTheory() {
    const L = Game.scene;
    if (!L || L === Hub || !L.steps) return;
    const step = L.steps[L.stepIdx], parts = theoryFor(L.num, step ? step.name : '');
    if (!parts) return;
    const d = el('details', 'theory');
    // predvolene zbalené; ak ho hráč otvorí, ostane otvorené len do odchodu z levelu (nový vstup, reštart či reset ho znova zbalí)
    d.open = !!L.theoryOpen;
    d.addEventListener('toggle', () => { L.theoryOpen = d.open; });
    d.appendChild(el('summary', null, tr('📐 Teória a rovnice', '📐 Theory and equations', '📐 Теорія та рівняння')));
    for (const p of parts) {
      d.appendChild(el('h4', null, p.h));
      d.appendChild(el('div', 'th', annotate(p.html, false, true)));
      if (p.view) d.appendChild(this.button(tr('👁 Ukáž to obrázkom', '👁 Show it as a picture', '👁 Показати як картинку'), () => Views.open(p.view), '', tr('Otvorí pohľad, v ktorom túto rovnicu vidno.', 'Opens the view in which this equation can be seen.', 'Відкриє погляд, у якому видно це рівняння.')));
    }
    this.panel.appendChild(d);
  },
  // po zmene typu hry: panel teórie sa zostaví znova (rovnice najprv = vždy a rozbalený)
  refreshTheory() {
    if (!this.panel.classList.contains('show')) return;
    this.panel.querySelectorAll('details.theory').forEach((d) => d.remove());
    this.appendTheory();
  },
  panelHide() { this.panel.classList.remove('show'); this.panel.innerHTML = ''; },
  button(html, onclick, cls = '', tip) {
    const b = el('button', (cls ? cls + ' ' : '') + 'gated', html); // gated: počas dialógu nič neurobí (CSS ho zošedí)
    b.onclick = (e) => { if (!this.busy) onclick(e); };
    const t = tip ?? tipFor(html);
    if (t) b.dataset.tip = t;
    return b;
  },
  // tlačidlo bez blokovania počas dialógu (nastavenia, pomoc)
  plainButton(html, onclick) { const b = el('button', null, html); b.onclick = onclick; return b; },
  row(...nodes) { const r = el('div', 'row'); nodes.forEach((n) => r.appendChild(n)); return r; },
  slider(label, min, max, step, value, oninput, tip) {
    const w = el('label', 'slider'), s = el('span', null, label), i = el('input');
    Object.assign(i, { type: 'range', min, max, step, value });
    const v = el('b', null, '');
    i.oninput = () => { v.textContent = oninput(parseFloat(i.value)) ?? ''; };
    w.append(s, i, v);
    v.textContent = oninput(value) ?? '';
    w.input = i;
    const t = tip ?? SLIDER_TIPS.find(([re]) => re.test(label))?.[1];
    if (t) w.dataset.tip = t;
    return w;
  },
  // správna odpoveď: posuvník (a s ním 3D obraz) sa dosunie presne na cieľ — krátka animácia, potom presná hodnota.
  // tween: false = hneď (napr. keď by medzihodnoty niečo vynulovali)
  snapSlider(w, target, tween = true) {
    if (!w || !w.input) return;
    const i = w.input, from = parseFloat(i.value), set = (v) => { i.step = 'any'; i.value = v; i.oninput(); };
    if (!tween || Math.abs(target - from) < 1e-9) return set(target);
    const t0 = performance.now(), ms = 260;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / ms), e = k * k * (3 - 2 * k);
      set(k < 1 ? from + (target - from) * e : target);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
  info(html, cls = '') {
    const d = el('div', 'info ' + cls, annotate(html));
    // živé hodnoty (panely levelov ich prepisujú cez innerHTML): vzorce dostanú čip rovnice a pri „Rovnice najprv“ glyfy
    const nat = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    Object.defineProperty(d, 'innerHTML', { configurable: true, get() { return nat.get.call(this); }, set(v) { nat.set.call(this, mathText(v)); } });
    return d;
  },

  // ---------- grafy v paneli ----------
  chart(w = 300, h = 130) {
    const c = el('canvas', 'plot'); c.width = w; c.height = h;
    if (!Settings.view.charts) c.style.display = 'none';
    return c;
  },
  // o: { x0, x1, y0, y1, xticks:[[x,label]], yticks, curves:[{f,color,dash,width}], hlines:[{y,color,label}], vlines,
  //      bars:[{x,w,y,color,outline,label}], points:[{x,y,color,r}], legend:[[color,text]], xlabel }
  drawChart(c, o) {
    if (!c || !Settings.view.charts) return;
    const g = c.getContext('2d'), W = c.width, H = c.height, pl = 30, pr = 8, pt = 8, pb = o.xlabel ? 26 : 16;
    const X = (x) => pl + (x - o.x0) / (o.x1 - o.x0) * (W - pl - pr), Y = (y) => H - pb - (y - o.y0) / (o.y1 - o.y0) * (H - pt - pb);
    g.fillStyle = '#0b1020'; g.fillRect(0, 0, W, H);
    g.font = '12px system-ui, sans-serif'; g.lineWidth = 1; // graf sa zobrazí v šírke panelu → ≈ 15 px
    g.strokeStyle = '#2a3356'; g.fillStyle = '#8f9bc8';
    g.textAlign = 'right'; g.textBaseline = 'middle';
    for (const [y, t] of o.yticks || []) { g.beginPath(); g.moveTo(pl, Y(y)); g.lineTo(W - pr, Y(y)); g.stroke(); g.fillText(t, pl - 3, Y(y)); }
    g.textAlign = 'center'; g.textBaseline = 'top';
    for (const [x, t] of o.xticks || []) { g.beginPath(); g.moveTo(X(x), pt); g.lineTo(X(x), H - pb); g.stroke(); g.fillText(t, X(x), H - pb + 2); }
    if (o.xlabel) g.fillText(o.xlabel, (pl + W - pr) / 2, H - 11);
    for (const b of o.bars || []) {
      const x = X(b.x - b.w / 2), w = X(b.x + b.w / 2) - x, y = Y(b.y), y0 = Y(Math.max(o.y0, 0));
      if (b.outline) { g.strokeStyle = b.color; g.lineWidth = 2; g.setLineDash([4, 3]); g.strokeRect(x, y, w, y0 - y); g.setLineDash([]); g.lineWidth = 1; }
      else { g.fillStyle = b.color; g.fillRect(x, y, w, y0 - y); }
      if (b.label) { g.fillStyle = '#dfe6ff'; g.textBaseline = 'bottom'; g.fillText(b.label, x + w / 2, y - 1); g.textBaseline = 'top'; }
    }
    for (const h of o.hlines || []) {
      g.strokeStyle = h.color; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(pl, Y(h.y)); g.lineTo(W - pr, Y(h.y)); g.stroke(); g.setLineDash([]);
      if (h.label) { g.fillStyle = h.color; g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText(h.label, W - pr - 2, Y(h.y) - 1); g.textAlign = 'center'; g.textBaseline = 'top'; }
    }
    for (const v of o.vlines || []) { g.strokeStyle = v.color; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(X(v.x), pt); g.lineTo(X(v.x), H - pb); g.stroke(); g.setLineDash([]); }
    for (const cv of o.curves || []) {
      g.strokeStyle = cv.color; g.lineWidth = cv.width || 2; if (cv.dash) g.setLineDash(cv.dash);
      g.beginPath();
      for (let i = 0; i <= 160; i++) { const x = o.x0 + (o.x1 - o.x0) * i / 160, y = clamp(cv.f(x), o.y0, o.y1); i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)); }
      g.stroke(); g.setLineDash([]); g.lineWidth = 1;
    }
    for (const p of o.points || []) { g.fillStyle = p.color; g.beginPath(); g.arc(X(p.x), Y(clamp(p.y, o.y0, o.y1)), p.r || 4, 0, 7); g.fill(); }
    g.textAlign = 'left'; g.textBaseline = 'top';
    let lx = pl + 4;
    for (const [col, t] of o.legend || []) { g.fillStyle = col; g.fillRect(lx, pt + 3, 8, 8); g.fillStyle = '#cfd6f5'; g.fillText(t, lx + 11, pt + 2); lx += 18 + g.measureText(t).width; }
  },
  checkbox(label, checked, onchange, tip) {
    const w = el('label', 'chk'), cb = el('input');
    cb.type = 'checkbox'; cb.checked = checked; cb.onchange = () => onchange(cb.checked);
    w.append(cb, el('span', null, label));
    if (tip) w.dataset.tip = tip;
    return w;
  },

  // ---------- nastavenia ----------
  // odomknúť všetko / reset hry — z pomoci aj z nastavení
  unlockAllAsk() {
    if (!confirm(tr('Naozaj odomknúť všetky levely? Preskočíš postupný výklad.', 'Really unlock all levels? You will skip the step-by-step explanations.', 'Справді відкрити всі рівні? Ти пропустиш поступове пояснення.'))) return;
    Game.unlockAll();
    this.toggleHelp(false); this.toggleSettings(false);
  },
  resetAsk() {
    if (!confirm(tr('Naozaj zmazať celý postup (hviezdičky, Kódex, Denník, rozohranú hru)? Nedá sa to vrátiť.',
      'Really erase all progress (stars, Codex, Journal, game in progress)? This cannot be undone.', 'Справді стерти весь поступ (зірки, Кодекс, Щоденник, розпочату гру)? Це не можна скасувати.'))) return;
    Game.resetAll();
  },
  toggleSettings(force) {
    const o = $('#settings'), show = force ?? !o.classList.contains('show');
    if (show !== o.classList.contains('show')) Sound.sfx(show ? 'page' : 'close');
    o.classList.toggle('show', show);
    if (show) this.renderSettings();
  },
  renderSettings() {
    const body = $('#settings .body'), V = Settings.view, ch = () => Settings.save();
    body.innerHTML = '';
    body.appendChild(el('h3', null, tr('🎨 1 · Štýl hry', '🎨 1 · Gameplay style', '🎨 1 · Стиль гри')));
    const th = el('div', 'diffs');
    for (const [k, name, desc] of [
      ['menu', tr('🗂 Výberové menu', '🗂 Selection menu', '🗂 Меню вибору'), tr('predvolená: všetky portály ako 3D okná v riadkoch, ktoré sa zalamujú podľa šírky obrazovky; klik = vstup do levelu, Iskra vľavo hore, bez mapy', 'default: all portals as 3D windows in rows that wrap to the screen width; click = enter the level, Spark top left, no map', 'типова: усі портали як 3D-вікна в рядках, що переносяться за шириною екрана; клік = вхід у рівень, Іскра вгорі ліворуч, без мапи')],
      ['classic', tr('Klasická', 'Classic', 'Класична'), tr('pôvodný modrý Hilbertov ostrov, 11 levelov', 'the original blue Hilbert Island, 11 levels', 'оригінальний синій Острів Гільберта, 11 рівнів')],
      ['nordic', tr('🐉 Severská (Skyrim)', '🐉 Nordic (Skyrim)', '🐉 Північна (Skyrim)'), tr('zasnežený ostrov s borovicami a menhirmi, severské písmo a farby, detailné textúry a záverečný 13. level: ťahový súboj s kvantovým drakom Ketvarrom', 'a snowy island with pines and standing stones, Nordic lettering and colours, detailed textures and a final 13th level: a turn-based battle with the quantum dragon Ketvarr', 'засніжений острів із соснами та кам’яними брилами, північні шрифти й кольори, детальні текстури та фінальний 13-й рівень: покроковий бій із квантовим драконом Кетварром')],
      ['wow', tr('⚔ MMO (World of Warcraft)', '⚔ MMO (World of Warcraft)', '⚔ MMO (World of Warcraft)'), tr('hrá sa ako MMO: kvantový mág s úrovňami, lišta kúziel (hradlá X, H, meranie…), nepriatelia „klasické omyly“, úlohy, obchodník, taška a korisť; levely sú dungeony s bossom, ktorého porazíš vedomosťami; aj drak Ketvarr', 'plays like an MMO: a quantum mage with levels, a spell bar (X and H gates, measurement…), “classical misconception” enemies, quests, a merchant, bags and loot; levels are dungeons with a boss you defeat with knowledge; Ketvarr the dragon too', 'грається як MMO: квантовий маг із рівнями, панель заклять (гейти X і H, вимірювання…), вороги — «класичні хибні уявлення», завдання, торговець, сумки та здобич; рівні — підземелля з босом, якого перемагаєш знаннями; є й дракон Кетварр')],
    ]) {
      const l = el('label'), r = el('input');
      r.type = 'radio'; r.name = 'theme'; r.checked = Settings.theme === k;
      r.onchange = () => Game.setTheme(k);
      l.append(r, el('b', null, name), el('small', null, desc));
      th.appendChild(l);
    }
    body.appendChild(th);
    body.appendChild(el('p', 'muted', tr('Zmena témy znovu načíta hru; postup, hudba a zvuky ostávajú.', 'Changing the theme reloads the game; progress, music and sounds stay.', 'Зміна теми перезавантажить гру; поступ, музика та звуки залишаться.')));
    // svetlý / tmavý režim vzhľadu „Qiskit“ (len predvolená téma a uvítanie)
    body.appendChild(el('h3', null, tr('🌗 Vzhľad (svetlý / tmavý)', '🌗 Appearance (light / dark)', '🌗 Вигляд (світлий / темний)')));
    const appWrap = el('div', 'diffs');
    for (const [k, name, desc] of [
      ['dark', tr('🌙 Tmavý', '🌙 Dark', '🌙 Темний'), tr('tmavé rozhranie v štýle Qiskit (predvolené) — ladí s 3D scénou', 'a dark Qiskit-style interface (default) — matches the 3D scene', 'темний інтерфейс у стилі Qiskit (типово) — пасує до 3D-сцени')],
      ['light', tr('☀️ Svetlý', '☀️ Light', '☀️ Світлий'), tr('svetlé rozhranie v štýle webu Qiskit.org', 'a light interface in the style of the Qiskit.org website', 'світлий інтерфейс у стилі сайту Qiskit.org')],
    ]) {
      const l = el('label'), r = el('input');
      r.type = 'radio'; r.name = 'appearance'; r.checked = Settings.appearance === k;
      r.onchange = () => { Settings.appearance = k; Settings.save(); applyAppearance(); this.appearUi(); };
      l.append(r, el('b', null, name), el('small', null, desc));
      appWrap.appendChild(l);
    }
    body.appendChild(appWrap);
    body.appendChild(el('p', 'muted', tr('Platí pre predvolenú tému (Výberové menu a Klasická) a uvítaciu obrazovku; Severská a MMO téma majú vlastný vzhľad. Prepína sa aj klávesom T alebo ikonou ☀️/🌙 vpravo hore.', 'Applies to the default theme (Selection menu and Classic) and the welcome screen; the Nordic and MMO themes keep their own look. Also toggled with the T key or the ☀️/🌙 icon at the top right.', 'Стосується типової теми (Меню вибору та Класична) й екрана вітання; Північна та MMO теми зберігають власний вигляд. Перемикається також клавішею T або піктограмою ☀️/🌙 вгорі праворуч.')));
    body.appendChild(el('h3', null, tr('🎚 2 · Obťažnosť', '🎚 2 · Difficulty', '🎚 2 · Складність')));
    const diffs = el('div', 'diffs');
    for (const d of DIFFS) {
      const l = el('label'), r = el('input');
      r.type = 'radio'; r.name = 'diff'; r.checked = Settings.diff === d;
      r.onchange = () => { Game.setDifficulty(d); this.diffUi(); };
      l.append(r, el('b', null, DIFF_NAME[d]), el('small', null, DIFF_DESC[d]));
      diffs.appendChild(l);
    }
    body.appendChild(diffs);
    body.appendChild(el('h3', null, tr('📜 3 · História', '📜 3 · History', '📜 3 · Історія')));
    body.appendChild(this.checkbox(SCROLLS_DESC, Settings.scrolls, (v) => { Settings.scrolls = v; Settings.save(); }));
    body.appendChild(this.checkbox(NOBLANKS_DESC, Settings.noBlanks, (v) => { Settings.noBlanks = v; Settings.save(); }));
    body.appendChild(this.checkbox(DIALOG_DESC, Settings.skipDialog, (v) => { Settings.skipDialog = v; Settings.save(); }));
    body.appendChild(this.checkbox(CONF_DESC, Settings.confidence, (v) => { Settings.confidence = v; Settings.save(); }));
    body.appendChild(el('h3', null, tr('∑ 4 · Rovnice', '∑ 4 · Equations', '∑ 4 · Рівняння')));
    const modes = el('div', 'diffs');
    for (const m of MODES) {
      const l = el('label'), r = el('input');
      r.type = 'radio'; r.name = 'mode'; r.checked = Settings.mode === m;
      r.onchange = () => Game.setMode(m);
      l.append(r, el('b', null, MODE_NAME[m]), el('small', null, MODE_DESC[m]));
      modes.appendChild(l);
    }
    body.appendChild(modes);
    body.appendChild(el('h3', null, tr('📊 Vizualizácie', '📊 Visualizations', '📊 Візуалізації')));
    const g1 = el('div', 'grid2');
    for (const [k, label, tip] of [
      ['grid', tr('mriežka: rovnobežky a poludníky sféry, polárna mriežka komplexnej roviny', 'grid: sphere latitudes and meridians, polar grid of the complex plane', 'сітка: паралелі й меридіани сфери, полярна сітка комплексної площини'), tr('Pomáha odčítať uhly θ, φ a veľkosť amplitúdy.', 'Helps to read off the angles θ, φ and the magnitude of an amplitude.', 'Допомагає зчитати кути θ, φ і модуль амплітуди.')],
      ['proj', tr('projekcie Blochovho vektora na osi (⟨X⟩, ⟨Y⟩, ⟨Z⟩)', 'projections of the Bloch vector onto the axes (⟨X⟩, ⟨Y⟩, ⟨Z⟩)', 'проєкції вектора Блоха на осі (⟨X⟩, ⟨Y⟩, ⟨Z⟩)'), tr('Prerušované čiary od šípky k osi z a do rovníkovej roviny.', 'Dashed lines from the arrow to the z axis and to the equatorial plane.', 'Пунктирні лінії від стрілки до осі z та до екваторіальної площини.')],
      ['angles', tr('oblúky uhlov θ, φ a fázy amplitúdy', 'arcs of the angles θ, φ and of the amplitude phase', 'дуги кутів θ, φ і фази амплітуди'), null],
      ['bars', tr('stĺpce P(0), P(1) pri Blochovej sfére', 'P(0), P(1) bars next to the Bloch sphere', 'стовпчики P(0), P(1) біля сфери Блоха'), null],
      ['machine', tr('🔬 skutočný stroj vedľa Blochovej sféry (NMR, interferometer, zdroj fotónov)', '🔬 real machine next to the Bloch sphere (NMR, interferometer, photon source)', '🔬 справжня машина поруч зі сферою Блоха (ЯМР, інтерферометр, джерело фотонів)'), tr('Blochova sféra je len obraz stavu; stroj ukazuje, kde ten istý qubit naozaj žije.', 'The Bloch sphere is only a picture of the state; the machine shows where the same qubit really lives.', 'Сфера Блоха — лише зображення стану; машина показує, де той самий кубіт живе насправді.')],
      ['trail', tr('stopa šípky počas rotácie', 'trail of the arrow during rotations', 'слід стрілки під час обертань'), null],
      ['charts', tr('grafy v paneli levelu (teória vs. meranie)', 'charts in the level panel (theory vs. measurement)', 'графіки в панелі рівня (теорія проти вимірювання)'), tr('Zmena sa prejaví pri ďalšom otvorení panelu.', 'Takes effect the next time a panel opens.', 'Діє з наступного відкриття панелі.')],
    ]) g1.appendChild(this.checkbox(label, V[k], (v) => { V[k] = v; ch(); }, tip));
    body.appendChild(g1);
    body.appendChild(el('h3', null, tr('🎵 Hudba a zvuky', '🎵 Music and sounds', '🎵 Музика та звуки')));
    const A = Settings.audio, ga = el('div', 'grid2'), chA = () => { Settings.save(); Sound.apply(); };
    ga.append(
      this.slider(tr('hlasitosť hudby (pokojná, pre sústredenie)', 'music volume (calm, for focus)', 'гучність музики (спокійна, для зосередження)'), 0, 1, 0.05, A.music, (v) => { A.music = v; chA(); return v ? Math.round(v * 100) + ' %' : tr('vypnutá', 'off', 'вимкнено'); }),
      this.slider(tr('hlasitosť zvukových efektov', 'sound effects volume', 'гучність звукових ефектів'), 0, 1, 0.05, A.sfx, (v) => { A.sfx = v; chA(); return v ? Math.round(v * 100) + ' %' : tr('vypnuté', 'off', 'вимкнено'); }),
      this.checkbox(tr('stlmiť všetko (N)', 'mute everything (N)', 'вимкнути все (N)'), A.muted, (v) => { A.muted = v; Sound.init(); chA(); Sound.muteUi(); }),
    );
    body.appendChild(ga);
    if (Settings.nordic || Settings.wow) {
    body.appendChild(el('h3', null, tr('🖼 Textúry', '🖼 Textures', '🖼 Текстури')));
    const tx = el('div', 'diffs');
    for (const [k, name, desc] of [
      ['auto', tr('automaticky', 'automatic', 'автоматично'), tr(`podľa výkonu počítača — teraz: ${Settings.view.tex === 'auto' && Settings.texHigh ? 'vysoké' : 'pôvodné'}`, `by computer performance — now: ${Settings.view.tex === 'auto' && Settings.texHigh ? 'high' : 'original'}`, `за продуктивністю комп’ютера — зараз: ${Settings.view.tex === 'авто' && Settings.texHigh ? 'високі' : 'оригінальні'}`)],
      ['low', tr('pôvodné', 'original', 'оригінальні'), tr('lacné procedurálne textúry, vhodné pre slabšie počítače a notebooky', 'cheap procedural textures, suited to weaker computers and laptops', 'дешеві процедурні текстури, придатні для слабших комп’ютерів і ноутбуків')],
      ['high', tr('vysoké rozlíšenie', 'high resolution', 'висока роздільність'), tr('viac detailov, reliéf kameňa a snehu, lišajník, trblietanie snehu — náročnejšie na grafiku', 'more detail, relief on stone and snow, lichen, snow sparkle — heavier on the graphics card', 'більше деталей, рельєф на камені та снігу, лишайник, іскріння снігу — важче для відеокарти')],
    ]) {
      const l = el('label'), r = el('input');
      r.type = 'radio'; r.name = 'tex'; r.checked = Settings.view.tex === k;
      r.onchange = () => { Settings.view.tex = k; ch(); this.renderSettings(); };
      l.append(r, el('b', null, name), el('small', null, desc));
      tx.appendChild(l);
    }
    body.appendChild(tx);
    }
    body.appendChild(el('h3', null, tr('📐 Geometria zobrazenia', '📐 View geometry', '📐 Геометрія вигляду')));
    const g2 = el('div', 'grid2');
    const deg = (v) => Math.round(v * 180 / Math.PI) + '°';
    g2.append(
      this.slider(tr('zorný uhol kamery', 'camera field of view', 'поле зору камери'), 0.5, 1.6, 0.05, V.fov, (v) => { V.fov = v; ch(); return deg(v); }, tr('Menší uhol = teleobjektív (menej skreslenia), väčší = širokouhlý pohľad.', 'Smaller = telephoto (less distortion), larger = wide-angle view.', 'Менше = телеоб’єктив (менше спотворень), більше = ширококутний вигляд.')),
      this.slider(tr('veľkosť popiskov', 'label size', 'розмір написів'), 0.6, 1.8, 0.05, V.labelScale, (v) => { V.labelScale = v; ch(); return Math.round(v * 100) + ' %'; }),
      this.slider(tr('nepriehľadnosť Blochovej sféry', 'Bloch sphere opacity', 'непрозорість сфери Блоха'), 0, 0.45, 0.01, V.glass, (v) => { V.glass = v; ch(); return Math.round(v * 100) + ' %'; }),
      this.slider(tr('automatické otáčanie kamery (v leveloch)', 'automatic camera rotation (in levels)', 'автоматичне обертання камери (у рівнях)'), 0, 0.6, 0.05, V.autoRotate, (v) => { V.autoRotate = v; ch(); return v ? Fmt.num(v, 2) + tr(' rad/s', ' rad/s', ' рад/с') : tr('vypnuté', 'off', 'вимкнено'); }),
    );
    body.appendChild(g2);
    body.appendChild(el('p', 'muted', tr('Nastavenia sa ukladajú automaticky. Ďalšie geometrické ovládanie (uhly magnetov, os rotácie, fázový posun, sila poľa B₀…) nájdeš priamo v paneloch levelov.',
      'Settings are saved automatically. More geometric controls (magnet angles, rotation axis, phase shifter, field strength B₀…) are in the level panels.', 'Налаштування зберігаються автоматично. Більше геометричних елементів керування (кути магнітів, вісь обертання, фазозсувач, сила поля B₀…) — у панелях рівнів.')));
    // postup: odomknúť všetko / reset hry (rovnaké ako na konci pomoci)
    body.appendChild(el('h3', null, tr('🔐 Postup', '🔐 Progress', '🔐 Поступ')));
    const box = el('div', 'unlock-all');
    const warn = document.querySelector(`#help .unlock-all p.warn[data-lang="${LANG}"]`);
    if (warn) box.appendChild(el('p', 'warn', warn.innerHTML));
    box.appendChild(this.row(
      this.plainButton(tr('🔓 Odomknúť všetky levely', '🔓 Unlock all levels', '🔓 Відкрити всі рівні'), () => this.unlockAllAsk()),
      this.plainButton(tr('🗑 Reset hry', '🗑 Reset game', '🗑 Скинути гру'), () => this.resetAsk())));
    // ⬇ export pre učiteľa: výsledky otázok, ciele, testy pred/po, nápovedy a časy krokov (JSON, nič sa nikam neposiela)
    box.appendChild(this.row(this.plainButton(tr('⬇ Exportovať môj postup (JSON)', '⬇ Export my progress (JSON)', '⬇ Експортувати мій поступ (JSON)'), () => Learn.export())));
    box.appendChild(el('p', 'muted', tr('Súbor sa len stiahne do tvojho počítača — môžeš ho odovzdať vyučujúcemu. Obsahuje výsledky otázok, zvládnuté ciele, testy pred a po leveli, použité nápovedy a časy úloh.',
      'The file is only downloaded to your computer — you can hand it in to your teacher. It holds your question results, mastered goals, before/after tests, hints used and task times.',
      'Файл лише завантажується на твій комп’ютер — його можна здати викладачеві. Він містить результати питань, опановані цілі, тести до і після рівня, використані підказки та час завдань.')));
    body.appendChild(box);
  },

  // ---------- kódex ----------
  toggleCodex(force) {
    const c = $('#codex'), show = force ?? !c.classList.contains('show');
    if (show !== c.classList.contains('show')) Sound.sfx(show ? 'codex' : 'close');
    c.classList.toggle('show', show);
    if (show) this.renderCodex();
  },
  renderCodex(filter = 'all') {
    const list = $('#codex .list'), got = Game.progress.codex;
    list.innerHTML = '';
    const tabs = $('#codex .tabs'); tabs.innerHTML = '';
    for (const [k, n] of [['all', tr('Všetko', 'All', 'Усе')], ['symbol', tr('🔣 Symboly', '🔣 Symbols', '🔣 Символи')], ['osobnost', tr('👤 Osobnosti', '👤 People', '👤 Особистості')], ['pojem', tr('💡 Pojmy', '💡 Concepts', '💡 Поняття')], ['scroll', tr('📜 Zvitky', '📜 Scrolls', '📜 Сувої')], ['eq', tr('∑ Rovnice', '∑ Equations', '∑ Рівняння')], ['drill', tr('📄 Prednášky', '📄 Lecture drill', '📄 Лекції')]]) {
      const b = el('button', filter === k ? 'on' : '', n); b.onclick = () => this.renderCodex(k); tabs.appendChild(b);
    }
    if (filter === 'scroll') return this.renderScrolls(list);
    if (filter === 'eq') return this.renderEquations(list);
    if (filter === 'drill') return this.renderDrill(list);
    const entries = CODEX.filter((e) => filter === 'all' || e.type === filter);
    $('#codex .count').textContent = `${got.size} / ${CODEX.length} ${tr('odomknutých', 'unlocked', 'відкрито')}`;
    for (const e of entries) {
      const have = got.has(e.id), card = el('div', 'card ' + (have ? '' : 'locked'));
      card.innerHTML = have
        ? `<div class="sym">${e.sym}</div><div class="nm">${e.name}</div><div class="ds">${annotate(e.text)}</div>`
          + (e.do ? `<div class="do">✅ ${e.do}</div>` : '') + (e.dont ? `<div class="dont">❌ ${e.dont}</div>` : '')
          + `<div class="src">${tr('Level', 'Level', 'Рівень')} ${e.level} · ${Learn.mastered(e.level) ? tr('🎓 zvládnuté', '🎓 mastered', '🎓 опановано') : tr('👁 videné', '👁 seen', '👁 бачено')}</div>`
        : `<div class="sym">?</div><div class="nm">${tr('zamknuté', 'locked', 'закрито')}</div><div class="ds">${tr(`Odomkneš v leveli ${e.level}.`, `Unlocked in level ${e.level}.`, `Відкриється в рівні ${e.level}.`)}</div>`;
      if (!have) card.dataset.tip = tr(`Dokonči level ${e.level} (${LEVELS[e.level - 1].title}).`, `Complete level ${e.level} (${LEVELS[e.level - 1].title}).`, `Пройди рівень ${e.level} (${LEVELS[e.level - 1].title}).`);
      // „precvič ma“: 1–2 otázky z tohto levelu (najprv tie, ktoré sú na rade v opakovaní) — kartu tak treba aj použiť
      if (have && (TRANSFER[e.level] || TRAPS[e.level])) {
        const b = this.plainButton(tr('🧪 Precvič ma', '🧪 Test me', '🧪 Перевір мене'), () => Learn.testMe(e.level));
        b.className = 'testme'; b.dataset.tip = tr('Dve krátke otázky k tomuto levelu. Chyby sa vrátia v opakovaní.', 'Two short questions on this level. Mistakes come back in your reviews.', 'Два короткі питання з цього рівня. Помилки повернуться в повтореннях.');
        card.appendChild(b);
      }
      list.appendChild(card);
    }
  },
  // ∑ rovnice úloh všetkých levelov (odomknú sa, keď hráč úlohu začne) — v oboch typoch hry
  renderEquations(list) {
    const got = Game.progress.eqs, all = [];
    for (const L of LEVELS) {
      const lv = Game.levels[L.num - 1];
      lv.steps.forEach((st, k) => { const html = EqM.eqFor(L.num, st.name); if (html) all.push({ L, step: st.name, k, html }); });
    }
    $('#codex .count').textContent = `${all.filter((e) => got.has(e.L.num + ':' + e.step)).length} / ${all.length} ${tr('rovníc · odomknú sa, keď začneš úlohu', 'equations · they unlock when you start the task', 'рівнянь · відкриваються, коли починаєш завдання')}`;
    for (const e of all) {
      const have = got.has(e.L.num + ':' + e.step), card = el('div', 'card eqcard2 ' + (have ? '' : 'locked'));
      const title = e.step === 'intro' ? tr('Jadro levelu', 'Core of the level', 'Ядро рівня') : tr(`Úloha ${e.k}`, `Task ${e.k}`, `Завдання ${e.k}`);
      card.innerHTML = have
        ? `<div class="sym">∑</div><div class="nm">${e.L.num} · ${e.L.title} — ${title}</div><div class="ds">${annotate(e.html, false, true)}</div>`
        : `<div class="sym">∑ ?</div><div class="nm">${tr('zamknuté', 'locked', 'закрито')}</div><div class="ds">${tr(`Level ${e.L.num} · ${title}.`, `Level ${e.L.num} · ${title}.`, `Рівень ${e.L.num} · ${title}.`)}</div>`;
      list.appendChild(card);
    }
  },
  // 📄 precvičovanie z prednášok: všetky doplňovačky jednej prednášky (aj tie, ktoré hra v kroku nepýta) — nehodnotí sa
  renderDrill(list) {
    const D = Game.progress.drill;
    $('#codex .count').textContent = tr('Doplň rovnice z PDF prednášok — bez hviezdičiek, len na precvičenie. Vyber prednášku:', 'Complete the equations from the lecture PDFs — no stars, practice only. Pick a lecture:', 'Доповни рівняння з PDF лекцій — без зірок, лише для вправи. Обери лекцію:');
    for (let lec = 1; lec <= 5; lec++) {
      const items = EqBlanks.lecture(lec), done = items.filter((q) => D[q.id] === 1).length;
      if (!items.length) continue;
      const card = el('div', 'card drillcard', `<div class="sym">📄 ${lec}</div><div class="nm">${tr('Prednáška', 'Lecture', 'Лекція')} ${lec}</div><div class="ds">${tr(`${done} z ${items.length} vzťahov správne`, `${done} of ${items.length} relations correct`, `${done} із ${items.length} співвідношень правильно`)}</div>`);
      const b = this.plainButton(tr('▶ 6 doplňovačiek', '▶ 6 fill-ins', '▶ 6 доповнень'), () => Learn.drill(lec));
      b.className = 'testme';
      card.appendChild(b);
      list.appendChild(card);
    }
  },
  renderScrolls(list) {
    const got = Game.progress.scrolls;
    $('#codex .count').textContent = `${got.size} / ${SCROLLS.length} ${tr('zvitkov', 'scrolls', 'сувої')} · ${tr('rozvinú sa pri zapnutých 📜 historických zvitkoch (⚙ nastavenia)', 'they unroll with 📜 Historic scrolls turned on (⚙ settings)', 'розгортаються з увімкненими 📜 історичними сувоями (⚙ налаштування)')}`;
    for (const s of SCROLLS) {
      const have = got.has(s.id), card = el('div', 'card scrollcard ' + (have ? '' : 'locked'));
      card.innerHTML = have
        ? `<div class="sym">📜 ${s.year}</div>${scrollHtml(s)}<div class="src">${tr('Level', 'Level', 'Рівень')} ${s.level}</div>`
        : `<div class="sym">📜 ?</div><div class="nm">${tr('zvinutý zvitok', 'a rolled-up scroll', 'згорнутий сувій')}</div><div class="ds">${tr(`Level ${s.level} so zapnutými historickými zvitkami.`, `Level ${s.level} with Historic scrolls on.`, `Рівень ${s.level} з увімкненими історичними сувоями.`)}</div>`;
      list.appendChild(card);
    }
  },
  toggleHelp(force) {
    const h = $('#help'), show = force ?? !h.classList.contains('show');
    if (show !== h.classList.contains('show')) Sound.sfx(show ? 'page' : 'close');
    h.classList.toggle('show', show);
  },
};

// vysvetlivky k posuvníkom
const SLIDER_TIPS = tr([
  [/veľkosť/, 'Dĺžka ručičky |α|. Pravdepodobnosť je jej štvorec.'],
  [/fáza φ/, 'Uhol ručičky (fáza). Na pravdepodobnosť |α|² nemá vplyv — až pri interferencii.'],
  [/fáza cesty/, 'Relatívna fáza druhej cesty voči prvej. π = proti sebe (vyrušenie), 0 = spolu (zosilnenie).'],
  [/^os/, 'Natočenie magnetu okolo zväzku: 0° = meranie S_z, 90° = meranie S_x.'],
  [/sila p/, 'Sila dekoherencie: koherencie (mimodiagonálne prvky ρ) sa vynásobia (1 − p).'],
  [/plocha impulzu/, 'Ω_R·t = uhol, o ktorý impulz otočí Blochov vektor. π = preklopenie, π/2 = rovník.'],
  [/frekvencia RF/, 'Frekvencia generátora. V rezonancii sa spin otáča okolo osi v rovine xy a dá sa úplne preklopiť.'],
  [/Alica|Bob/, 'Uhol osi merania v rovine xz Blochovej sféry (0° = z, 90° = x).'],
], [
  [/magnitude/, 'Length of the hand |α|. The probability is its square.'],
  [/phase φ/, 'Angle of the hand (phase). It has no effect on the probability |α|² — only in interference.'],
  [/phase of path/, 'Relative phase of the second path with respect to the first. π = opposite (cancellation), 0 = together (reinforcement).'],
  [/^axis/, 'Rotation of the magnet around the beam: 0° = measuring S_z, 90° = measuring S_x.'],
  [/strength p/, 'Decoherence strength: coherences (off-diagonal elements of ρ) are multiplied by (1 − p).'],
  [/pulse area/, 'Ω_R·t = the angle by which the pulse rotates the Bloch vector. π = flip, π/2 = equator.'],
  [/RF frequency/, 'Generator frequency. At resonance the spin rotates about an axis in the xy plane and can be fully flipped.'],
  [/Alice|Bob/, 'Angle of the measurement axis in the xz plane of the Bloch sphere (0° = z, 90° = x).'],
], [
  [/magnitude/, 'Довжина стрілки |α|. Імовірність — її квадрат.'],
  [/phase φ/, 'Кут стрілки (фаза). На ймовірність |α|² не впливає — лише в інтерференції.'],
  [/phase of path/, 'Відносна фаза другого шляху щодо першого. π = протилежно (гасіння), 0 = разом (підсилення).'],
  [/^axis/, 'Поворот магніту навколо пучка: 0° = вимірюємо S_z, 90° = вимірюємо S_x.'],
  [/strength p/, 'Сила декогеренції: когерентності (позадіагональні елементи ρ) множаться на (1 − p).'],
  [/pulse area/, 'Ω_R·t = кут, на який імпульс повертає вектор Блоха. π = переворот, π/2 = екватор.'],
  [/RF frequency/, 'Частота генератора. У резонансі спін обертається навколо осі в площині xy і може повністю перевернутися.'],
  [/Alice|Bob/, 'Кут осі вимірювання в площині xz сфери Блоха (0° = z, 90° = x).'],
]);

// ---------- čitateľnosť textu podľa obťažnosti ----------
// ľahká: pôvodný text, väčším písmom a so zlatými kľúčovými slovami (CSS)
// normálna: pôvodný text
// ťažká: husto a s viac poznatkami — bez analógií, repliky jedného hovoriaceho sa zlúčia; rovnice sú v paneli „📐“
const TextMode = {
  ANALOGY: /^(<[^>]+>)*\s*(Prirovnanie|An analogy)/,
  sentences(html) { return String(html).split(/(?<=[.!?…])\s+(?=[„“(<|A-ZÁ-ŽÄÔ0-9])/u); },
  // ťažká: zachová všetky poznatky, vypustí len analógie („Prirovnanie: …“) — tie nahrádza teória s rovnicami v paneli
  condense(html) { return this.sentences(html).filter((t) => !this.ANALOGY.test(t)).join(' '); },
  lines(lines) {
    lines = lines.map((l, i) => ({ ...l, src: [i] }));
    if (!Settings.hard) return lines;
    if (lines.some((l) => l.raw)) return lines;
    const out = [];
    for (const l of lines) {
      const text = this.condense(l.text);
      if (!text) continue;
      const last = out[out.length - 1];
      const len = (h) => h.replace(/<[^>]+>/g, '').length;
      if (last && last.who === l.who && last.face === l.face && len(last.text) + len(text) < 480) { last.text += ' ' + text; last.src.push(...l.src); }
      else out.push({ ...l, text });
    }
    return out.length ? out : [lines[lines.length - 1]];
  },
  render(html) {
    if (Settings.layman) return annotate(html, true, true); // laická: žargón s prekladom
    return annotate(html, false, true);
  },
};
// zvýrazní čísla, stavy a slová písané veľkými písmenami (pre ľahkú obťažnosť v úlohách)
function emphasize(text) {
  return String(text).split(/(<[^>]+>)/).map((seg) => (seg.startsWith('<') ? seg
    : seg.replace(/(\|[^|⟩]{1,4}⟩|\d+(?:[.,]\d+)?\s?%?|[A-ZÁ-Ž]{3,}[A-ZÁ-Ž]*)/gu, '<b>$1</b>'))).join('');
}
// vzorec bez vysvetliviek pojmov (odpovede v kvízoch): len čip rovnice a pri „Rovnice najprv“ glyfy
function mathText(html, explicit = false) {
  html = EqG.wrapInline(html, explicit);
  return Settings.eq ? EqG.glyphify(html) : html;
}
