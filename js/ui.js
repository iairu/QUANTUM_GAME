'use strict';
// Používateľské rozhranie: dialógy (s návratom späť), kvízy, panely, popisky v 3D, vysvetlivky pri prejdení myšou,
// denník všetkých rozhovorov, kódex symbolov.

const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

const UI = {
  busy: false, // beží dialóg alebo kvíz (pohyb postavy je zablokovaný)
  log: [],     // denník: [{scene, kind:'say'|'quiz', lines | q, answer, why, ok}]
  hots: [],    // 3D „hotspoty“ s vysvetlivkou (v pixeloch obrazovky), plnia sa každý snímok

  init() {
    this.labelsRoot = $('#labels'); this.labelPool = new Map(); this.labelUsed = new Set();
    this.dialog = $('#dialog'); this.panel = $('#panel'); this.hud = $('#hud'); this.tip = $('#tip');
    document.title = tr('Psíčko v kvantovom svete', 'Little Psi in the Quantum World');
    for (const [id, text, title] of [
      ['#btn-hub', tr('🏝 Ostrov', '🏝 Island'), tr('Späť na ostrov', 'Back to the island')],
      ['#btn-map', tr('🗺 Mapa', '🗺 Map'), tr('Mapa (M)', 'Map (M)')],
      ['#btn-codex', tr('📖 Kódex', '📖 Codex'), tr('Kódex symbolov (C)', 'Codex of symbols (C)')],
      ['#btn-log', tr('📜 Denník', '📜 Journal'), tr('Denník rozhovorov (L)', 'Conversation journal (L)')],
      ['#btn-help', '❔', tr('Pomoc (H)', 'Help (H)')],
    ]) { $(id).textContent = text; $(id).title = title; }
    const ls = $('#lang-select');
    ls.value = LANG;
    ls.dataset.tip = tr('Jazyk / Language — zmena znovu načíta hru (postup zostane uložený).', 'Language / Jazyk — switching reloads the game (your progress stays saved).');
    ls.onchange = () => setLang(ls.value);
    const ua = $('#btn-unlock-all');
    ua.textContent = tr('🔓 Odomknúť všetky levely', '🔓 Unlock all levels');
    ua.onclick = () => {
      if (!confirm(tr('Naozaj odomknúť všetky levely? Preskočíš postupný výklad.', 'Really unlock all levels? You will skip the step-by-step explanations.'))) return;
      Game.unlockAll();
      this.toggleHelp(false);
    };
    $('#btn-codex').onclick = () => this.toggleCodex();
    $('#btn-map').onclick = () => Game.toggleMap();
    $('#btn-help').onclick = () => this.toggleHelp();
    $('#btn-hub').onclick = () => Game.backToHub();
    $('#btn-log').onclick = () => this.toggleLog();
    $('#codex .close').onclick = () => this.toggleCodex(false);
    $('#help .close').onclick = () => this.toggleHelp(false);
    $('#journal .close').onclick = () => this.toggleLog(false);
    for (const b of document.querySelectorAll('#topbar button')) b.dataset.tip = tipFor(b.textContent) || b.title;
    try { this.log = JSON.parse(localStorage.getItem('kvantp-game1-log') || '[]'); } catch (e) { this.log = []; }
    this.initTooltips();
  },

  // ---------- vysvetlivky pri prejdení myšou ----------
  initTooltips() {
    this.mouse = null;
    document.addEventListener('mousemove', (e) => {
      this.mouse = [e.clientX, e.clientY];
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (t && t.dataset.tip) return this.showTip(t.dataset.tip, e.clientX, e.clientY);
      if (e.target.id === 'gl' && !e.buttons) {
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
    e.style.transform = `translate(${p[0]}px, ${p[1]}px) translate(-50%, -50%)`;
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
    $('#hud-quest').innerHTML = quest ? '🎯 ' + annotate(quest) : '';
  },
  toast(html, ms = 2600) {
    const t = el('div', 'toast', html);
    $('#toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), ms);
    setTimeout(() => t.remove(), ms + 600);
  },

  // ---------- denník ----------
  scene() { return Game.scene && Game.scene !== Hub ? `${Game.scene.num} · ${Game.scene.title}` : tr('Hilbertov ostrov', 'Hilbert Island'); },
  record(entry) {
    this.log.push({ scene: this.scene(), ...entry });
    if (this.log.length > 400) this.log.splice(0, this.log.length - 400);
    try { localStorage.setItem('kvantp-game1-log', JSON.stringify(this.log)); } catch (e) { /* bez ukladania */ }
  },
  toggleLog(force) {
    const j = $('#journal'), show = force ?? !j.classList.contains('show');
    j.classList.toggle('show', show);
    if (show) this.renderLog();
  },
  renderLog() {
    const list = $('#journal .list');
    list.innerHTML = '';
    if (!this.log.length) { list.appendChild(el('p', 'muted', tr('Zatiaľ prázdny. Každý rozhovor a vysvetlenie z kvízu sa sem uloží.', 'Empty so far. Every conversation and quiz explanation will be saved here.'))); return; }
    let lastScene = null;
    [...this.log].reverse().forEach((en, idx) => {
      if (en.scene !== lastScene) { list.appendChild(el('h3', null, en.scene)); lastScene = en.scene; }
      const box = el('details', 'entry');
      if (en.kind === 'say') {
        const first = en.lines[0];
        box.appendChild(el('summary', null, `💬 <b>${first.who || ''}</b>: ${first.text.replace(/<[^>]+>/g, '').slice(0, 90)}…`));
        for (const l of en.lines) box.appendChild(el('div', 'line', `<span class="who">${l.face || ''} ${l.who || ''}</span> ${annotate(l.text)}`));
        const rb = el('button', null, tr('▶ Prehrať znova', '▶ Replay'));
        rb.onclick = () => {
          if (this.busy) { this.toast(tr('Najprv dokonči aktuálny dialóg — text si však môžeš prečítať tu.', 'Finish the current dialogue first — but you can read the text here.')); return; }
          this.toggleLog(false);
          this.say(en.lines, null, { replay: true });
        };
        box.appendChild(rb);
      } else {
        box.appendChild(el('summary', null, `${en.ok ? '✅' : '❌'} <b>${tr('Otázka', 'Question')}:</b> ${en.q.replace(/<[^>]+>/g, '').slice(0, 90)}`));
        box.appendChild(el('div', 'line', annotate(en.q)));
        box.appendChild(el('div', 'line good', '✔ ' + en.answer));
        if (en.why) box.appendChild(el('div', 'line', annotate(en.why)));
      }
      if (idx === 0) box.open = true;
      list.appendChild(box);
    });
  },

  // ---------- dialógy ----------
  // lines: [{who, text, face}] alebo reťazce; done sa zavolá po poslednej replike
  say(lines, done, opts = {}) {
    lines = lines.map((l) => (typeof l === 'string' ? { text: l } : l));
    if (!opts.replay) this.record({ kind: 'say', lines });
    let i = 0;
    this.busy = true;
    const show = () => {
      const l = lines[i];
      this.dialog.innerHTML = '';
      this.dialog.appendChild(el('div', 'who', (l.face || '💬') + ' ' + (l.who || '') + (opts.replay ? ` <small>(${tr('opakovanie', 'replay')})</small>` : '')));
      this.dialog.appendChild(el('div', 'txt', annotate(l.text)));
      const nav = el('div', 'nav');
      const back = el('button', null, tr('◂ Späť', '◂ Back'));
      back.disabled = i === 0; back.onclick = prev; back.dataset.tip = tr('Predchádzajúca replika (← alebo Backspace). Celé rozhovory nájdeš v Denníku (L).', 'Previous line (← or Backspace). Full conversations are in the Journal (L).');
      nav.appendChild(back);
      nav.appendChild(el('span', 'hint', `${i + 1} / ${lines.length} · ${tr('Enter = ďalej, ← = späť', 'Enter = next, ← = back')}`));
      const b = el('button', 'primary', i < lines.length - 1 ? tr('Ďalej ▸', 'Next ▸') : tr('Rozumiem ✓', 'Got it ✓'));
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
    show();
  },

  // q: {q, options:[...], correct: index, why, who, face}; cb(spravne)
  quiz(q, cb) {
    this.busy = true;
    this._next = null; this._prev = null;
    this.dialog.innerHTML = '';
    this.dialog.appendChild(el('div', 'who', (q.face || '❓') + ' ' + (q.who || tr('Otázka', 'Question'))));
    this.dialog.appendChild(el('div', 'txt', annotate(q.q)));
    const box = el('div', 'choices');
    const order = q.options.map((_, i) => i);
    if (q.shuffle !== false) order.sort(() => rand() - 0.5);
    for (const i of order) {
      const b = el('button', 'choice', q.options[i]);
      b.dataset.ok = i === q.correct ? '1' : '0';
      b.onclick = () => {
        const ok = i === q.correct;
        this.record({ kind: 'quiz', q: q.q, answer: q.options[q.correct], why: q.why, ok });
        [...box.children].forEach((c) => (c.disabled = true));
        b.classList.add(ok ? 'good' : 'bad');
        if (!ok) box.children[order.indexOf(q.correct)].classList.add('good');
        const fb = el('div', 'why ' + (ok ? 'ok' : 'no'), (ok ? tr('✅ Správne. ', '✅ Correct. ') : tr('❌ Nie celkom. ', '❌ Not quite. ')) + annotate(q.why || ''));
        this.dialog.appendChild(fb);
        const c = el('button', 'primary', tr('Pokračovať ▸', 'Continue ▸'));
        c.onclick = () => { this.dialog.classList.remove('show'); this.busy = false; this._next = null; cb && cb(ok); };
        this.dialog.appendChild(c);
        this._next = c.onclick;
        c.focus();
      };
      box.appendChild(b);
    }
    this.dialog.appendChild(box);
    this.dialog.classList.add('show');
  },

  // séria kvízov za sebou; cb(počet chýb)
  quizSeries(list, cb) {
    let i = 0, mistakes = 0;
    const step = () => {
      if (i >= list.length) return cb(mistakes);
      this.quiz(list[i++], (ok) => { if (!ok) mistakes++; step(); });
    };
    step();
  },

  // ---------- pravý panel s ovládaním levelu ----------
  panelSet(title, nodes) {
    this.panel.innerHTML = '';
    this.panel.appendChild(el('h3', null, title));
    for (const n of nodes) this.panel.appendChild(n);
    this.panel.classList.add('show');
  },
  panelHide() { this.panel.classList.remove('show'); this.panel.innerHTML = ''; },
  button(html, onclick, cls = '', tip) {
    const b = el('button', cls, html);
    b.onclick = (e) => { if (!this.busy) onclick(e); };
    const t = tip ?? tipFor(html);
    if (t) b.dataset.tip = t;
    return b;
  },
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
  info(html, cls = '') { return el('div', 'info ' + cls, annotate(html)); },

  // ---------- kódex ----------
  toggleCodex(force) {
    const c = $('#codex'), show = force ?? !c.classList.contains('show');
    c.classList.toggle('show', show);
    if (show) this.renderCodex();
  },
  renderCodex(filter = 'all') {
    const list = $('#codex .list'), got = Game.progress.codex;
    list.innerHTML = '';
    const tabs = $('#codex .tabs'); tabs.innerHTML = '';
    for (const [k, n] of [['all', tr('Všetko', 'All')], ['symbol', tr('🔣 Symboly', '🔣 Symbols')], ['osobnost', tr('👤 Osobnosti', '👤 People')], ['pojem', tr('💡 Pojmy', '💡 Concepts')]]) {
      const b = el('button', filter === k ? 'on' : '', n); b.onclick = () => this.renderCodex(k); tabs.appendChild(b);
    }
    const entries = CODEX.filter((e) => filter === 'all' || e.type === filter);
    $('#codex .count').textContent = `${got.size} / ${CODEX.length} ${tr('odomknutých', 'unlocked')}`;
    for (const e of entries) {
      const have = got.has(e.id), card = el('div', 'card ' + (have ? '' : 'locked'));
      card.innerHTML = have
        ? `<div class="sym">${e.sym}</div><div class="nm">${e.name}</div><div class="ds">${annotate(e.text)}</div>`
          + (e.do ? `<div class="do">✅ ${e.do}</div>` : '') + (e.dont ? `<div class="dont">❌ ${e.dont}</div>` : '')
          + `<div class="src">Level ${e.level}</div>`
        : `<div class="sym">?</div><div class="nm">${tr('zamknuté', 'locked')}</div><div class="ds">${tr(`Odomkneš v leveli ${e.level}.`, `Unlocked in level ${e.level}.`)}</div>`;
      if (!have) card.dataset.tip = tr(`Dokonči level ${e.level} (${LEVELS[e.level - 1].title}).`, `Complete level ${e.level} (${LEVELS[e.level - 1].title}).`);
      list.appendChild(card);
    }
  },
  toggleHelp(force) { const h = $('#help'); h.classList.toggle('show', force ?? !h.classList.contains('show')); },
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
]);
