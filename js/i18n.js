'use strict';
// Jazyk hry: slovenčina (sk), angličtina (en) alebo ukrajinčina (uk, v ponuke „UA“).
// Bez uloženej voľby sa jazyk určí podľa prehliadača: čeština a slovenčina → sk,
// ukrajinčina, ruština a bieloruština → uk, ostatné → en.

const LANGS = ['sk', 'en', 'uk'];
const LANG = (() => {
  try {
    const saved = localStorage.getItem('kvantp-game1-lang');
    if (LANGS.includes(saved)) return saved;
  } catch (e) { /* bez ukladania */ }
  const navs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  if (/^(sk|cs|cz)\b/i.test(navs[0])) return 'sk';
  return navs.some((l) => /^(uk|ru|be)\b/i.test(l)) ? 'uk' : 'en'; // ktorýkoľvek z jazykov prehliadača
})();
document.documentElement.lang = LANG;

// tr('slovensky text', 'English text', 'український текст') → text v aktuálnom jazyku
// (chýbajúci ukrajinský text sa nahradí anglickým)
const tr = (sk, en, uk) => (LANG === 'uk' ? uk ?? en : LANG === 'en' ? en : sk);

// Dialógy (repliky, kvízy, karty, zvitky, teória) sú v lang/<jazyk>.csv — stĺpce key,text. Vzorec v texte je v [[…]]:
// [[…]] vo vete = čip rovnice s vlastným pozadím, [[…]] na samostatnom riadku = blok rovnice. {0}, {1} … = hodnoty z hry.
// Na serveri (http/https) sa CSV načíta priamo; pri spustení z disku (file://) prehliadač CSV načítať nedovolí,
// preto sa použije lang/<jazyk>.js vygenerovaný z CSV príkazom `node tools/build-lang.js`.
const DLG = {};
function parseCsv(text) {
  const rows = new Map();
  let i = text.indexOf('\n') + 1; // hlavička key,text
  while (i < text.length) {
    const c = text.indexOf(',', i);
    if (c < 0) break;
    const key = text.slice(i, c);
    let v = '', j = c + 1;
    if (text[j] === '"') {
      j++;
      for (;;) {
        const q = text.indexOf('"', j);
        if (q < 0) { v += text.slice(j); j = text.length; break; }
        v += text.slice(j, q);
        if (text[q + 1] === '"') { v += '"'; j = q + 2; } else { j = q + 1; break; }
      }
    } else { const e = text.indexOf('\n', j); v = text.slice(j, e < 0 ? text.length : e); j = e < 0 ? text.length : e; }
    if (key) rows.set(key.trim(), v);
    i = text.indexOf('\n', j); if (i < 0) break; i++;
  }
  return rows;
}
function DLG_LOAD(lang, csv) { if (!DLG[lang]) DLG[lang] = parseCsv(csv); }
(() => {
  for (const l of LANG === 'en' ? ['en'] : ['en', LANG]) {
    if (/^https?:$/.test(location.protocol)) {
      try {
        const x = new XMLHttpRequest();
        x.open('GET', `lang/${l}.csv`, false); x.send();
        if (x.status === 200) { DLG_LOAD(l, x.responseText.replace(/\r\n/g, '\n')); continue; }
      } catch (e) { /* použije sa vygenerovaný súbor */ }
    }
    document.write(`<script src="lang/${l}.js"><\/script>`);
  }
})();
// L('kľúč', hodnota0, hodnota1 …) → text dialógu v aktuálnom jazyku (chýbajúci preklad nahradí anglický)
function L(key, ...args) {
  const s = (DLG[LANG] && DLG[LANG].get(key)) ?? (DLG.en && DLG.en.get(key));
  if (s == null) { console.warn('Chýba text dialógu:', key); return key; }
  return args.length ? s.replace(/\{(\d+)\}/g, (m, k) => (args[k] ?? m)) : s;
}
L.has = (key) => !!((DLG[LANG] && DLG[LANG].has(key)) || (DLG.en && DLG.en.has(key)));

function setLang(lang) {
  if (!LANGS.includes(lang) || lang === LANG) return;
  try { localStorage.setItem('kvantp-game1-lang', lang); } catch (e) { /* bez ukladania */ }
  location.reload();
}
