'use strict';
// Poznatky navyše podľa obťažnosti:
//  THEORY  — „📐 Teória a rovnice“ v paneli levelu (normálna: len jadro, ťažká/prastará: jadro + krok)
//  TRAPS_HARD    — extra otázky s rovnicami na konci levelu (ťažká, prastará)
// Farby: α je vždy modrá, β červená — rovnako ako v pohľadoch 👁, aby sa symbol dal spojiť s obrázkom.

const cA = '<i class="ca">α</i>', cB = '<i class="cb">β</i>';
const EQ = (h) => `<div class="eq eqb">${h}</div>`; // eqb = blok rovnice s vlastným pozadím
const pick = (pair) => (Array.isArray(pair) ? tr(...pair) : pair);

// každá položka: [slovensky, anglicky, ukrajinsky]; voliteľne views: { krok: 'pohľad' } = tlačidlo „👁 ukáž“
const THEORY = {
  1: {
    views: { setHand: 'hands', timesI: 'hands', interference: 'hands' },
    core: DL('theory.1.core'),
    setHand: DL('theory.1.setHand'),
    timesI: DL('theory.1.timesI'),
    interference: DL('theory.1.interference'),
  },
  2: {
    views: { twoSpots: 'bases', sequences: 'bases', predict: 'bloch2d' },
    core: DL('theory.2.core'),
    twoSpots: DL('theory.2.twoSpots'),
    sequences: DL('theory.2.sequences'),
    predict: DL('theory.2.predict'),
  },
  3: {
    views: { puzzles: 'bloch2d', measure: 'bases', lab: 'all' },
    core: DL('theory.3.core'),
    puzzles: DL('theory.3.puzzles'),
    measure: DL('theory.3.measure'),
    lab: DL('theory.3.lab'),
  },
  4: {
    views: { pure: 'rho', withMeasure: 'rho', deco: 'rho' },
    core: DL('theory.4.core'),
    pure: DL('theory.4.pure'),
    withMeasure: DL('theory.4.withMeasure'),
    deco: DL('theory.4.deco'),
  },
  5: {
    views: { tasks: 'notation' },
    core: DL('theory.5.core'),
    tasks: DL('theory.5.tasks'),
  },
  6: {
    views: { precession: 'hands', piPulse: 'bloch2d', halfPulse: 'bases', tuning: 'bloch2d', t2: 'rho' },
    core: DL('theory.6.core'),
    precession: DL('theory.6.precession'),
    piPulse: DL('theory.6.piPulse'),
    halfPulse: DL('theory.6.halfPulse'),
    tuning: DL('theory.6.tuning'),
    t2: DL('theory.6.t2'),
  },
  7: {
    views: { build: 'hands', noSignal: 'bases', chsh: 'bases' },
    core: DL('theory.7.core'),
    build: DL('theory.7.build'),
    noSignal: DL('theory.7.noSignal'),
    chsh: DL('theory.7.chsh'),
  },
  8: {
    views: {},
    core: DL('theory.8.core'),
    statues: DL('theory.8.statues'),
    sorting: DL('theory.8.sorting'),
  },
};

// extra otázky (ťažká, prastará) — viac poznatkov a rovníc
const TRAPS_HARD = {
  1: [
    { q: DL('traps.hard.1.0.q'), options: [DL('traps.hard.1.0.options.0'), DL('traps.hard.1.0.options.1'), DL('traps.hard.1.0.options.2'), DL('traps.hard.1.0.options.3')], correct: 0, why: DL('traps.hard.1.0.why') },
    { q: DL('traps.hard.1.1.q'), options: [DL('traps.hard.1.1.options.0'), DL('traps.hard.1.1.options.1'), DL('traps.hard.1.1.options.2'), DL('traps.hard.1.1.options.3')], correct: 0, why: DL('traps.hard.1.1.why') },
  ],
  2: [
    { q: DL('traps.hard.2.0.q'), options: [DL('traps.hard.2.0.options.0'), DL('traps.hard.2.0.options.1'), DL('traps.hard.2.0.options.2')], correct: 0, why: DL('traps.hard.2.0.why') },
    { q: DL('traps.hard.2.1.q'), options: [DL('traps.hard.2.1.options.0'), DL('traps.hard.2.1.options.1'), DL('traps.hard.2.1.options.2')], correct: 0, why: DL('traps.hard.2.1.why') },
  ],
  3: [
    { q: DL('traps.hard.3.0.q'), options: [DL('traps.hard.3.0.options.0'), DL('traps.hard.3.0.options.1'), DL('traps.hard.3.0.options.2'), DL('traps.hard.3.0.options.3')], correct: 0, why: DL('traps.hard.3.0.why') },
    { q: DL('traps.hard.3.1.q'), options: [DL('traps.hard.3.1.options.0'), DL('traps.hard.3.1.options.1'), DL('traps.hard.3.1.options.2'), DL('traps.hard.3.1.options.3')], correct: 0, why: DL('traps.hard.3.1.why') },
  ],
  4: [
    { q: DL('traps.hard.4.0.q'), options: [DL('traps.hard.4.0.options.0'), DL('traps.hard.4.0.options.1'), DL('traps.hard.4.0.options.2'), DL('traps.hard.4.0.options.3')], correct: 0, why: DL('traps.hard.4.0.why') },
    { q: DL('traps.hard.4.1.q'), options: [DL('traps.hard.4.1.options.0'), DL('traps.hard.4.1.options.1'), DL('traps.hard.4.1.options.2'), DL('traps.hard.4.1.options.3')], correct: 0, why: DL('traps.hard.4.1.why') },
  ],
  5: [
    { q: DL('traps.hard.5.0.q'), options: [DL('traps.hard.5.0.options.0'), DL('traps.hard.5.0.options.1'), DL('traps.hard.5.0.options.2'), DL('traps.hard.5.0.options.3')], correct: 0, why: DL('traps.hard.5.0.why') },
    { q: DL('traps.hard.5.1.q'), options: [DL('traps.hard.5.1.options.0'), DL('traps.hard.5.1.options.1'), DL('traps.hard.5.1.options.2'), DL('traps.hard.5.1.options.3')], correct: 0, why: DL('traps.hard.5.1.why') },
  ],
  6: [
    { q: DL('traps.hard.6.0.q'), options: [DL('traps.hard.6.0.options.0'), DL('traps.hard.6.0.options.1'), DL('traps.hard.6.0.options.2'), DL('traps.hard.6.0.options.3')], correct: 0, why: DL('traps.hard.6.0.why') },
    { q: DL('traps.hard.6.1.q'), options: [DL('traps.hard.6.1.options.0'), DL('traps.hard.6.1.options.1'), DL('traps.hard.6.1.options.2'), DL('traps.hard.6.1.options.3')], correct: 0, why: DL('traps.hard.6.1.why') },
  ],
  7: [
    { q: DL('traps.hard.7.0.q'), options: [DL('traps.hard.7.0.options.0'), DL('traps.hard.7.0.options.1'), DL('traps.hard.7.0.options.2'), DL('traps.hard.7.0.options.3')], correct: 0, why: DL('traps.hard.7.0.why') },
    { q: DL('traps.hard.7.1.q'), options: [DL('traps.hard.7.1.options.0'), DL('traps.hard.7.1.options.1'), DL('traps.hard.7.1.options.2')], correct: 0, why: DL('traps.hard.7.1.why') },
  ],
  8: [
    { q: DL('traps.hard.8.0.q'), options: [DL('traps.hard.8.0.options.0'), DL('traps.hard.8.0.options.1'), DL('traps.hard.8.0.options.2')], correct: 0, why: DL('traps.hard.8.0.why') },
    { q: DL('traps.hard.8.1.q'), options: [DL('traps.hard.8.1.options.0'), DL('traps.hard.8.1.options.1'), DL('traps.hard.8.1.options.2')], correct: 0, why: DL('traps.hard.8.1.why') },
  ],
};

function theoryFor(num, step) {
  const T = THEORY[num];
  if (!T || (Settings.easy && !Settings.eq)) return null; // rovnice najprv: teória vždy, aj v ľahkej
  const parts = [{ h: tr('Jadro levelu', 'Core of the level', 'Ядро рівня'), html: pick(T.core) }];
  if ((Settings.hard || Settings.eq) && T[step]) parts.push({ h: tr('K tejto úlohe', 'For this task', 'До цього завдання'), html: pick(T[step]), view: T.views?.[step] });
  return parts;
}
function hardTraps(num) { return Settings.hard ? (TRAPS_HARD[num] || []).map(pick) : []; }
