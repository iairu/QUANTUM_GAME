'use strict';
// Jazyk hry: slovenčina (sk) alebo angličtina (en).
// Bez uloženej voľby sa jazyk určí podľa prehliadača: čeština a slovenčina → sk, ostatné → en.

const LANGS = ['sk', 'en'];
const LANG = (() => {
  try {
    const saved = localStorage.getItem('kvantp-game1-lang');
    if (LANGS.includes(saved)) return saved;
  } catch (e) { /* bez ukladania */ }
  const nav = (navigator.languages && navigator.languages[0]) || navigator.language || '';
  return /^(sk|cs|cz)\b/i.test(nav) ? 'sk' : 'en';
})();
document.documentElement.lang = LANG;

// tr('slovensky text', 'English text') → text v aktuálnom jazyku
const tr = (sk, en) => (LANG === 'en' ? en : sk);

function setLang(lang) {
  if (!LANGS.includes(lang) || lang === LANG) return;
  try { localStorage.setItem('kvantp-game1-lang', lang); } catch (e) { /* bez ukladania */ }
  location.reload();
}
