'use strict';
// 📜 Starobylé zvitky (obťažnosť „prastará“): história objavov — roky, autori, ich rozhovory a slávne výroky.
// Zvitok sa ukáže pred krokom levelu `step` (názov metódy kroku; 'finale' = pred záverečnou skúškou)
// a zostane v Kódexe na karte „📜 Zvitky“. Citáty sú v preklade; pri anekdotách je to uvedené.

const SCROLLS = [
  // ---------- 1 · Komplexný prístav ----------
  { id: 's1a', level: 1, step: 'intro', year: '1545 – 1572', people: 'Gerolamo Cardano, Rafael Bombelli',
    title: DL('scrolls.s1a.title'),
    text: DL('scrolls.s1a.text'),
    quote: DL('scrolls.s1a.quote') },
  { id: 's1b', level: 1, step: 'timesI', year: '1637 · 1748 · 1777', people: 'René Descartes, Leonhard Euler',
    title: DL('scrolls.s1b.title'),
    text: DL('scrolls.s1b.text'),
    quote: DL('scrolls.s1b.quote') },
  { id: 's1c', level: 1, step: 'interference', year: '1799 · 1806 · 1926', people: 'Caspar Wessel, Jean-Robert Argand, Max Born',
    title: DL('scrolls.s1c.title'),
    text: DL('scrolls.s1c.text'),
    quote: DL('scrolls.s1c.quote') },

  // ---------- 2 · Sternova–Gerlachova pec ----------
  { id: 's2a', level: 2, step: 'intro', year: '1921 – 1922', people: 'Otto Stern, Walther Gerlach, Niels Bohr',
    title: DL('scrolls.s2a.title'),
    text: DL('scrolls.s2a.text'),
    quote: DL('scrolls.s2a.quote') },
  { id: 's2b', level: 2, step: 'twoSpots', year: '1922', people: 'Otto Stern',
    title: DL('scrolls.s2b.title'),
    text: DL('scrolls.s2b.text'),
    quote: DL('scrolls.s2b.quote') },
  { id: 's2c', level: 2, step: 'sequences', year: '1925 · 1927', people: 'George Uhlenbeck, Samuel Goudsmit, Paul Ehrenfest, Wolfgang Pauli',
    title: DL('scrolls.s2c.title'),
    text: DL('scrolls.s2c.text'),
    quote: DL('scrolls.s2c.quote') },

  // ---------- 3 · Blochovo observatórium ----------
  { id: 's3a', level: 3, step: 'intro', year: '1892 · 1927', people: 'Henri Poincaré, Wolfgang Pauli',
    title: DL('scrolls.s3a.title'),
    text: DL('scrolls.s3a.text'),
    quote: DL('scrolls.s3a.quote') },
  { id: 's3b', level: 3, step: 'puzzles', year: '1946 · 1952 · 1957', people: 'Felix Bloch, Edward Purcell, Feynman, Vernon, Hellwarth',
    title: DL('scrolls.s3b.title'),
    text: DL('scrolls.s3b.text'),
    quote: DL('scrolls.s3b.quote') },
  { id: 's3c', level: 3, step: 'lab', year: '1995', people: 'Benjamin Schumacher',
    title: DL('scrolls.s3c.title'),
    text: DL('scrolls.s3c.text'),
    quote: DL('scrolls.s3c.quote') },

  // ---------- 4 · Chrám interferencie ----------
  { id: 's4a', level: 4, step: 'intro', year: '1801 – 1803 · 1909', people: 'Thomas Young, Geoffrey Ingram Taylor',
    title: DL('scrolls.s4a.title'),
    text: DL('scrolls.s4a.text'),
    quote: DL('scrolls.s4a.quote') },
  { id: 's4b', level: 4, step: 'withMeasure', year: '1961 · 1974 · 1989', people: 'Claus Jönsson; Merli, Missiroli, Pozzi; Akira Tonomura',
    title: DL('scrolls.s4b.title'),
    text: DL('scrolls.s4b.text'),
    quote: DL('scrolls.s4b.quote') },
  { id: 's4c', level: 4, step: 'deco', year: '1927 · 1970 · 1981', people: 'John von Neumann, Lev Landau, H. Dieter Zeh, Wojciech Zurek',
    title: DL('scrolls.s4c.title'),
    text: DL('scrolls.s4c.text'),
    quote: DL('scrolls.s4c.quote') },

  // ---------- 5 · Diracova knižnica ----------
  { id: 's5a', level: 5, step: 'intro', year: '1925 – 1930', people: 'Paul Dirac, Werner Heisenberg',
    title: DL('scrolls.s5a.title'),
    text: DL('scrolls.s5a.text'),
    quote: DL('scrolls.s5a.quote') },
  { id: 's5b', level: 5, step: 'tasks', year: '1928 · 1932 · 1933', people: 'Paul Dirac, Carl Anderson, Erwin Schrödinger',
    title: DL('scrolls.s5b.title'),
    text: DL('scrolls.s5b.text'),
    quote: DL('scrolls.s5b.quote') },

  // ---------- 6 · Rabiho rezonátor ----------
  { id: 's6a', level: 6, step: 'intro', year: '1896 · 1902', people: 'Pieter Zeeman, Hendrik Lorentz',
    title: DL('scrolls.s6a.title'),
    text: DL('scrolls.s6a.text'),
    quote: DL('scrolls.s6a.quote') },
  { id: 's6b', level: 6, step: 'piPulse', year: '1938 · 1944', people: 'I. I. Rabi, Jerrold Zacharias, Sidney Millman, Polykarp Kusch',
    title: DL('scrolls.s6b.title'),
    text: DL('scrolls.s6b.text'),
    quote: DL('scrolls.s6b.quote') },
  { id: 's6c', level: 6, step: 't2', year: '1950 · 1973 · 2001', people: 'Erwin Hahn; Paul Lauterbur, Peter Mansfield; Lieven Vandersypen, Isaac Chuang a kol.',
    title: DL('scrolls.s6c.title'),
    text: DL('scrolls.s6c.text'),
    quote: DL('scrolls.s6c.quote') },

  // ---------- 7 · Bellov most ----------
  { id: 's7a', level: 7, step: 'intro', year: '1926 · 1935', people: 'Albert Einstein, Boris Podolsky, Nathan Rosen, Niels Bohr',
    title: DL('scrolls.s7a.title'),
    text: DL('scrolls.s7a.text'),
    quote: DL('scrolls.s7a.quote') },
  { id: 's7b', level: 7, step: 'build', year: '1935 · 1947', people: 'Erwin Schrödinger, Albert Einstein',
    title: DL('scrolls.s7b.title'),
    text: DL('scrolls.s7b.text'),
    quote: DL('scrolls.s7b.quote') },
  { id: 's7c', level: 7, step: 'chsh', year: '1964 · 1969 · 1982 · 2015 · 2022', people: 'John Bell; Clauser, Horne, Shimony, Holt; Alain Aspect; Anton Zeilinger',
    title: DL('scrolls.s7c.title'),
    text: DL('scrolls.s7c.text'),
    quote: DL('scrolls.s7c.quote') },

  // ---------- 8 · Sieň výkladov ----------
  { id: 's8a', level: 8, step: 'intro', year: '1927', people: 'Niels Bohr, Werner Heisenberg, Albert Einstein',
    title: DL('scrolls.s8a.title'),
    text: DL('scrolls.s8a.text'),
    quote: DL('scrolls.s8a.quote') },
  { id: 's8b', level: 8, step: 'statues', year: '1781 · 1918 · 1921 · 1958', people: 'Immanuel Kant, Emmy Noether, Ludwig Wittgenstein, Werner Heisenberg',
    title: DL('scrolls.s8b.title'),
    text: DL('scrolls.s8b.text'),
    quote: DL('scrolls.s8b.quote') },
  { id: 's8c', level: 8, step: 'sorting', year: '1932 · 1952 · 1957 · 1989', people: 'John von Neumann, David Bohm, Hugh Everett III, N. David Mermin',
    title: DL('scrolls.s8c.title'),
    text: DL('scrolls.s8c.text'),
    quote: DL('scrolls.s8c.quote') },
];

// jedna otázka z histórie na konci každého levelu (prastará)
const TRAPS_ANCIENT = {
  1: { q: DL('traps.ancient.1.q'), options: [DL('traps.ancient.1.options.0'), DL('traps.ancient.1.options.1'), DL('traps.ancient.1.options.2')], correct: 0, why: DL('traps.ancient.1.why') },
  2: { q: DL('traps.ancient.2.q'), options: [DL('traps.ancient.2.options.0'), DL('traps.ancient.2.options.1'), DL('traps.ancient.2.options.2')], correct: 0, why: DL('traps.ancient.2.why') },
  3: { q: DL('traps.ancient.3.q'), options: [DL('traps.ancient.3.options.0'), DL('traps.ancient.3.options.1'), DL('traps.ancient.3.options.2')], correct: 0, why: DL('traps.ancient.3.why') },
  4: { q: DL('traps.ancient.4.q'), options: [DL('traps.ancient.4.options.0'), DL('traps.ancient.4.options.1'), DL('traps.ancient.4.options.2')], correct: 0, why: DL('traps.ancient.4.why') },
  5: { q: DL('traps.ancient.5.q'), options: [DL('traps.ancient.5.options.0'), DL('traps.ancient.5.options.1'), DL('traps.ancient.5.options.2')], correct: 0, why: DL('traps.ancient.5.why') },
  6: { q: DL('traps.ancient.6.q'), options: [DL('traps.ancient.6.options.0'), DL('traps.ancient.6.options.1'), DL('traps.ancient.6.options.2')], correct: 0, why: DL('traps.ancient.6.why') },
  7: { q: DL('traps.ancient.7.q'), options: [DL('traps.ancient.7.options.0'), DL('traps.ancient.7.options.1'), DL('traps.ancient.7.options.2')], correct: 0, why: DL('traps.ancient.7.why') },
  8: { q: DL('traps.ancient.8.q'), options: [DL('traps.ancient.8.options.0'), DL('traps.ancient.8.options.1'), DL('traps.ancient.8.options.2')], correct: 0, why: DL('traps.ancient.8.why') },
};

function scrollFor(num, step) { return Settings.diff === 'ancient' ? SCROLLS.filter((s) => s.level === num && s.step === step) : []; }
function scrollHtml(s) {
  const M = (x) => EqG.markEq(pick(x)); // vzorce v [[…]] (lang/*.csv)
  return `<div class="scroll-head"><b>${s.year}</b> · ${s.people}</div><div class="scroll-title">${M(s.title)}</div>`
    + `<div>${M(s.text)}</div><blockquote>${M(s.quote)}</blockquote>`;
}
function ancientTraps(num) { return Settings.diff === 'ancient' && TRAPS_ANCIENT[num] ? [pick(TRAPS_ANCIENT[num])] : []; }
