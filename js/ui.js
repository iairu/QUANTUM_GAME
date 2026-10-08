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
      ['#btn-views', '👁', tr('Pohľady: ten istý stav ako obrázky — ručičky, Blochove rezy, bázy, matica ρ (V)', 'Views: the same state as pictures — hands, Bloch cuts, bases, ρ matrix (V)')],
      ['#btn-settings', '⚙', tr('Nastavenia: vizualizácie a geometria (O)', 'Settings: visualizations and geometry (O)')],
      ['#btn-help', '❔', tr('Pomoc (H)', 'Help (H)')],
      ['#btn-sound', Settings.audio.muted ? '🔇' : '🔊', tr('Hudba a zvuky: zapnúť / stlmiť (N). Hlasitosť nájdeš v nastaveniach.', 'Music and sounds: on / mute (N). Volume is in the settings.')],
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
    const rb = $('#btn-reset');
    rb.textContent = tr('🗑 Reset hry', '🗑 Reset game');
    rb.onclick = () => {
      if (!confirm(tr('Naozaj zmazať celý postup (hviezdičky, Kódex, Denník, rozohranú hru)? Nedá sa to vrátiť.',
        'Really erase all progress (stars, Codex, Journal, game in progress)? This cannot be undone.'))) return;
      Game.resetAll();
    };
    const ds = $('#diff-select');
    for (const d of DIFFS) { const o = el('option', null, DIFF_NAME[d]); o.value = d; ds.appendChild(o); }
    const diffUi = () => { ds.value = Settings.diff; ds.className = Settings.diff; ds.dataset.tip = `<b>${tr('Obťažnosť', 'Difficulty')}: ${DIFF_NAME[Settings.diff]}</b> — ${DIFF_DESC[Settings.diff]}.<br>${tr('Dá sa zmeniť kedykoľvek.', 'Can be changed at any time.')}`; };
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
    if (show !== j.classList.contains('show')) Sound.sfx(show ? 'journal' : 'close');
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
    const orig = lines;
    lines = TextMode.lines(orig);
    let i = 0;
    this.busy = true;
    let opened = false;
    const show = () => {
      const l = lines[i];
      Sound.sfx(l.cls === 'scroll' ? 'scroll' : !opened ? 'dialog' : 'page'); opened = true;
      this.dialog.innerHTML = '';
      this.dialog.appendChild(el('div', 'who', (l.face || '💬') + ' ' + (l.who || '') + (opts.replay ? ` <small>(${tr('opakovanie', 'replay')})</small>` : '')));
      this.dialog.appendChild(el('div', 'txt', l.raw ? l.text : TextMode.render(l.text)));
      this.dialog.className = 'show ' + Settings.diff + (Settings.layman ? ' easy' : '') + (Settings.hard ? ' hard' : '') + (l.cls ? ' ' + l.cls : '');
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
    // zmena obťažnosti počas dialógu: prepočítaj stránky a ukáž zodpovedajúcu
    this.refreshDialog = () => {
      if (this._next !== next) return;
      const cur = lines[i], nl = TextMode.lines(orig);
      i = Math.min(nl.length - 1, Math.max(0, nl.findIndex((x) => x.src && cur.src && x.src.some((k) => cur.src.includes(k)))));
      lines = nl; show();
    };
    show();
  },

  // q: {q, options:[...], correct: index, why, who, face}; cb(spravne)
  quiz(q, cb) {
    this.busy = true;
    this._next = null; this._prev = null;
    this.dialog.innerHTML = '';
    Sound.sfx('dialog');
    this.dialog.appendChild(el('div', 'who', (q.face || '❓') + ' ' + (q.who || tr('Otázka', 'Question'))));
    this.dialog.appendChild(el('div', 'txt', annotate(q.q, true)));
    const box = el('div', 'choices');
    let order = q.options.map((_, i) => i);
    if (Settings.easy && order.length > 2) { // ľahká a laická: o jednu nesprávnu možnosť menej
      const wrong = order.filter((i) => i !== q.correct);
      const drop = wrong[Math.floor(rand() * wrong.length)];
      order = order.filter((i) => i !== drop);
    }
    if (q.shuffle !== false) order.sort(() => rand() - 0.5);
    for (const i of order) {
      const b = el('button', 'choice', q.options[i]);
      b.dataset.ok = i === q.correct ? '1' : '0';
      b.onclick = () => {
        const ok = i === q.correct;
        Sound.sfx(ok ? 'good' : 'bad');
        Settings.wow && Wow.onAnswer(ok); // MMO: správna odpoveď = zásah bossa, nesprávna = jeho úder
        this.record({ kind: 'quiz', q: q.q, answer: q.options[q.correct], why: q.why, ok });
        [...box.children].forEach((c) => (c.disabled = true));
        b.classList.add(ok ? 'good' : 'bad');
        if (!ok) box.children[order.indexOf(q.correct)].classList.add('good');
        const fb = el('div', 'why ' + (ok ? 'ok' : 'no'), (ok ? tr('✅ Správne. ', '✅ Correct. ') : tr('❌ Nie celkom. ', '❌ Not quite. ')) + annotate(q.why || '', true));
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

  // zruší rozbehnutý dialóg/kvíz bez pokračovania (odchod z levelu uprostred rozhovoru)
  cancelDialog() {
    this.dialog.classList.remove('show'); this.dialog.innerHTML = '';
    this.busy = false; this._next = this._prev = null; this.refreshDialog = null;
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
    this.appendTheory();
    this.panel.classList.add('show');
  },
  // „📐 Teória a rovnice“: normálna = len jadro (zbalené), ťažká/prastará = jadro + aktuálny krok (rozbalené)
  appendTheory() {
    const L = Game.scene;
    if (!L || L === Hub || !L.steps) return;
    const step = L.steps[L.stepIdx], parts = theoryFor(L.num, step ? step.name : '');
    if (!parts) return;
    const d = el('details', 'theory');
    d.open = Settings.hard;
    d.appendChild(el('summary', null, tr('📐 Teória a rovnice', '📐 Theory and equations')));
    for (const p of parts) {
      d.appendChild(el('h4', null, p.h));
      d.appendChild(el('div', 'th', annotate(p.html)));
      if (p.view) d.appendChild(this.button(tr('👁 Ukáž to obrázkom', '👁 Show it as a picture'), () => Views.open(p.view), '', tr('Otvorí pohľad, v ktorom túto rovnicu vidno.', 'Opens the view in which this equation can be seen.')));
    }
    this.panel.appendChild(d);
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
    g.font = '10px system-ui, sans-serif'; g.lineWidth = 1;
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
  toggleSettings(force) {
    const o = $('#settings'), show = force ?? !o.classList.contains('show');
    if (show !== o.classList.contains('show')) Sound.sfx(show ? 'page' : 'close');
    o.classList.toggle('show', show);
    if (show) this.renderSettings();
  },
  renderSettings() {
    const body = $('#settings .body'), V = Settings.view, ch = () => Settings.save();
    body.innerHTML = '';
    body.appendChild(el('h3', null, tr('🎚 Obťažnosť', '🎚 Difficulty')));
    const diffs = el('div', 'diffs');
    for (const d of DIFFS) {
      const l = el('label'), r = el('input');
      r.type = 'radio'; r.name = 'diff'; r.checked = Settings.diff === d;
      r.onchange = () => { Game.setDifficulty(d); this.diffUi(); };
      l.append(r, el('b', null, DIFF_NAME[d]), el('small', null, DIFF_DESC[d]));
      diffs.appendChild(l);
    }
    body.appendChild(diffs);
    body.appendChild(el('h3', null, tr('📊 Vizualizácie', '📊 Visualizations')));
    const g1 = el('div', 'grid2');
    for (const [k, label, tip] of [
      ['grid', tr('mriežka: rovnobežky a poludníky sféry, polárna mriežka komplexnej roviny', 'grid: sphere latitudes and meridians, polar grid of the complex plane'), tr('Pomáha odčítať uhly θ, φ a veľkosť amplitúdy.', 'Helps to read off the angles θ, φ and the magnitude of an amplitude.')],
      ['proj', tr('projekcie Blochovho vektora na osi (⟨X⟩, ⟨Y⟩, ⟨Z⟩)', 'projections of the Bloch vector onto the axes (⟨X⟩, ⟨Y⟩, ⟨Z⟩)'), tr('Prerušované čiary od šípky k osi z a do rovníkovej roviny.', 'Dashed lines from the arrow to the z axis and to the equatorial plane.')],
      ['angles', tr('oblúky uhlov θ, φ a fázy amplitúdy', 'arcs of the angles θ, φ and of the amplitude phase'), null],
      ['bars', tr('stĺpce P(0), P(1) pri Blochovej sfére', 'P(0), P(1) bars next to the Bloch sphere'), null],
      ['trail', tr('stopa šípky počas rotácie', 'trail of the arrow during rotations'), null],
      ['charts', tr('grafy v paneli levelu (teória vs. meranie)', 'charts in the level panel (theory vs. measurement)'), tr('Zmena sa prejaví pri ďalšom otvorení panelu.', 'Takes effect the next time a panel opens.')],
    ]) g1.appendChild(this.checkbox(label, V[k], (v) => { V[k] = v; ch(); }, tip));
    body.appendChild(g1);
    body.appendChild(el('h3', null, tr('🎵 Hudba a zvuky', '🎵 Music and sounds')));
    const A = Settings.audio, ga = el('div', 'grid2'), chA = () => { Settings.save(); Sound.apply(); };
    ga.append(
      this.slider(tr('hlasitosť hudby (pokojná, pre sústredenie)', 'music volume (calm, for focus)'), 0, 1, 0.05, A.music, (v) => { A.music = v; chA(); return v ? Math.round(v * 100) + ' %' : tr('vypnutá', 'off'); }),
      this.slider(tr('hlasitosť zvukových efektov', 'sound effects volume'), 0, 1, 0.05, A.sfx, (v) => { A.sfx = v; chA(); return v ? Math.round(v * 100) + ' %' : tr('vypnuté', 'off'); }),
      this.checkbox(tr('stlmiť všetko (N)', 'mute everything (N)'), A.muted, (v) => { A.muted = v; Sound.init(); chA(); Sound.muteUi(); }),
    );
    body.appendChild(ga);
    body.appendChild(el('h3', null, tr('🎨 Téma', '🎨 Theme')));
    const th = el('div', 'diffs');
    for (const [k, name, desc] of [
      ['classic', tr('Klasická', 'Classic'), tr('pôvodný modrý Hilbertov ostrov, 8 levelov', 'the original blue Hilbert Island, 8 levels')],
      ['nordic', tr('🐉 Severská (Skyrim)', '🐉 Nordic (Skyrim)'), tr('zasnežený ostrov s borovicami a menhirmi, severské písmo a farby, detailné textúry a záverečný 9. level: ťahový súboj s kvantovým drakom Ketvarrom', 'a snowy island with pines and standing stones, Nordic lettering and colours, detailed textures and a final 9th level: a turn-based battle with the quantum dragon Ketvarr')],
      ['wow', tr('⚔ MMO (World of Warcraft)', '⚔ MMO (World of Warcraft)'), tr('hrá sa ako MMO: kvantový mág s úrovňami, lišta kúziel (hradlá X, H, meranie…), nepriatelia „klasické omyly“, úlohy, obchodník, taška a korisť; levely sú dungeony s bossom, ktorého porazíš vedomosťami; aj drak Ketvarr', 'plays like an MMO: a quantum mage with levels, a spell bar (X and H gates, measurement…), “classical misconception” enemies, quests, a merchant, bags and loot; levels are dungeons with a boss you defeat with knowledge; Ketvarr the dragon too')],
    ]) {
      const l = el('label'), r = el('input');
      r.type = 'radio'; r.name = 'theme'; r.checked = Settings.theme === k;
      r.onchange = () => Game.setTheme(k);
      l.append(r, el('b', null, name), el('small', null, desc));
      th.appendChild(l);
    }
    body.appendChild(th);
    body.appendChild(el('p', 'muted', tr('Zmena témy znovu načíta hru; postup, hudba a zvuky ostávajú.', 'Changing the theme reloads the game; progress, music and sounds stay.')));
    if (Settings.nordic || Settings.wow) {
    body.appendChild(el('h3', null, tr('🖼 Textúry', '🖼 Textures')));
    const tx = el('div', 'diffs');
    for (const [k, name, desc] of [
      ['auto', tr('automaticky', 'automatic'), tr(`podľa výkonu počítača — teraz: ${Settings.view.tex === 'auto' && Settings.texHigh ? 'vysoké' : 'pôvodné'}`, `by computer performance — now: ${Settings.view.tex === 'auto' && Settings.texHigh ? 'high' : 'original'}`)],
      ['low', tr('pôvodné', 'original'), tr('lacné procedurálne textúry, vhodné pre slabšie počítače a notebooky', 'cheap procedural textures, suited to weaker computers and laptops')],
      ['high', tr('vysoké rozlíšenie', 'high resolution'), tr('viac detailov, reliéf kameňa a snehu, lišajník, trblietanie snehu — náročnejšie na grafiku', 'more detail, relief on stone and snow, lichen, snow sparkle — heavier on the graphics card')],
    ]) {
      const l = el('label'), r = el('input');
      r.type = 'radio'; r.name = 'tex'; r.checked = Settings.view.tex === k;
      r.onchange = () => { Settings.view.tex = k; ch(); this.renderSettings(); };
      l.append(r, el('b', null, name), el('small', null, desc));
      tx.appendChild(l);
    }
    body.appendChild(tx);
    }
    body.appendChild(el('h3', null, tr('📐 Geometria zobrazenia', '📐 View geometry')));
    const g2 = el('div', 'grid2');
    const deg = (v) => Math.round(v * 180 / Math.PI) + '°';
    g2.append(
      this.slider(tr('zorný uhol kamery', 'camera field of view'), 0.5, 1.6, 0.05, V.fov, (v) => { V.fov = v; ch(); return deg(v); }, tr('Menší uhol = teleobjektív (menej skreslenia), väčší = širokouhlý pohľad.', 'Smaller = telephoto (less distortion), larger = wide-angle view.')),
      this.slider(tr('veľkosť popiskov', 'label size'), 0.6, 1.8, 0.05, V.labelScale, (v) => { V.labelScale = v; ch(); return Math.round(v * 100) + ' %'; }),
      this.slider(tr('nepriehľadnosť Blochovej sféry', 'Bloch sphere opacity'), 0, 0.45, 0.01, V.glass, (v) => { V.glass = v; ch(); return Math.round(v * 100) + ' %'; }),
      this.slider(tr('automatické otáčanie kamery (v leveloch)', 'automatic camera rotation (in levels)'), 0, 0.6, 0.05, V.autoRotate, (v) => { V.autoRotate = v; ch(); return v ? Fmt.num(v, 2) + ' rad/s' : tr('vypnuté', 'off'); }),
    );
    body.appendChild(g2);
    body.appendChild(el('p', 'muted', tr('Nastavenia sa ukladajú automaticky. Ďalšie geometrické ovládanie (uhly magnetov, os rotácie, fázový posun, sila poľa B₀…) nájdeš priamo v paneloch levelov.',
      'Settings are saved automatically. More geometric controls (magnet angles, rotation axis, phase shifter, field strength B₀…) are in the level panels.')));
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
    for (const [k, n] of [['all', tr('Všetko', 'All')], ['symbol', tr('🔣 Symboly', '🔣 Symbols')], ['osobnost', tr('👤 Osobnosti', '👤 People')], ['pojem', tr('💡 Pojmy', '💡 Concepts')], ['scroll', tr('📜 Zvitky', '📜 Scrolls')]]) {
      const b = el('button', filter === k ? 'on' : '', n); b.onclick = () => this.renderCodex(k); tabs.appendChild(b);
    }
    if (filter === 'scroll') return this.renderScrolls(list);
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
  renderScrolls(list) {
    const got = Game.progress.scrolls;
    $('#codex .count').textContent = `${got.size} / ${SCROLLS.length} ${tr('zvitkov', 'scrolls')} · ${tr('rozvinú sa v obťažnosti 📜 Prastará', 'they unroll in the 📜 Ancient difficulty')}`;
    for (const s of SCROLLS) {
      const have = got.has(s.id), card = el('div', 'card scrollcard ' + (have ? '' : 'locked'));
      card.innerHTML = have
        ? `<div class="sym">📜 ${s.year}</div>${scrollHtml(s)}<div class="src">Level ${s.level}</div>`
        : `<div class="sym">📜 ?</div><div class="nm">${tr('zvinutý zvitok', 'a rolled-up scroll')}</div><div class="ds">${tr(`Level ${s.level} v obťažnosti Prastará.`, `Level ${s.level} on Ancient difficulty.`)}</div>`;
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
]);

// ---------- čitateľnosť textu podľa obťažnosti ----------
// ľahká: najdôležitejšie slová (zvýraznené kľúčové pojmy navrchu, zvyšok potlačený)
// normálna: pôvodný text
// ťažká/prastará: husto a s viac poznatkami — bez analógií, repliky jedného hovoriaceho sa zlúčia; rovnice sú v paneli „📐“
const TextMode = {
  ANALOGY: /^(<[^>]+>)*\s*(Prirovnanie|An analogy)/,
  sentences(html) { return String(html).split(/(?<=[.!?…])\s+(?=[„“(<|A-ZÁ-ŽÄÔ0-9])/u); },
  // ťažká: zachová všetky poznatky, vypustí len analógie („Prirovnanie: …“) — tie nahrádza teória s rovnicami v paneli
  condense(html) { return this.sentences(html).filter((t) => !this.ANALOGY.test(t)).join(' '); },
  keywords(html) {
    const out = [];
    for (const m of String(html).matchAll(/<b>(.*?)<\/b>/g)) {
      const k = m[1].replace(/<(?!\/?(sub|sup)\b)[^>]+>/g, '').trim();
      if (k && !out.includes(k)) out.push(k);
    }
    return out.slice(0, 6);
  },
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
    if (Settings.layman) return annotate(html, true); // laická: bez kľúčových slov (bývajú to odborné termíny), žargón s prekladom
    if (Settings.diff !== 'easy') return annotate(html);
    const keys = this.keywords(html);
    if (!keys.length) return annotate(html);
    return `<div class="keys">${keys.map((k) => `<span class="key">${k}</span>`).join('')}</div><div class="rest">${annotate(html)}</div>`;
  },
};
// zvýrazní čísla, stavy a slová písané veľkými písmenami (pre ľahkú obťažnosť v úlohách)
function emphasize(text) {
  return String(text).split(/(<[^>]+>)/).map((seg) => (seg.startsWith('<') ? seg
    : seg.replace(/(\|[^|⟩]{1,4}⟩|\d+(?:[.,]\d+)?\s?%?|[A-ZÁ-Ž]{3,}[A-ZÁ-Ž]*)/gu, '<b>$1</b>'))).join('');
}
