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

function setLang(lang) {
  if (!LANGS.includes(lang) || lang === LANG) return;
  try { localStorage.setItem('kvantp-game1-lang', lang); } catch (e) { /* bez ukladania */ }
  location.reload();
}
