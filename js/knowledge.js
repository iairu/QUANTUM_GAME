'use strict';
// Poznatky navyše podľa obťažnosti:
//  THEORY  — „📐 Teória a rovnice“ v paneli levelu (normálna: len jadro, ťažká: jadro + krok)
//  TRAPS_HARD    — extra otázky s rovnicami na konci levelu (ťažká)
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
  9: {
    views: {coords: 'bloch2d', rotations: 'bloch2d', measureAxis: 'bases', unitaryVsDeco: 'rho'},
    core: DL('theory.9.core'),
    coords: DL('theory.9.coords'),
    rotations: DL('theory.9.rotations'),
    measureAxis: DL('theory.9.measureAxis'),
    unitaryVsDeco: DL('theory.9.unitaryVsDeco'),
  },
  10: {
    views: {unitaryWall: 'rho', purify: 'rho', pseudoPure: 'bases', observables: 'bases', evolution: 'hands'},
    core: DL('theory.10.core'),
    unitaryWall: DL('theory.10.unitaryWall'),
    purify: DL('theory.10.purify'),
    pseudoPure: DL('theory.10.pseudoPure'),
    observables: DL('theory.10.observables'),
    evolution: DL('theory.10.evolution'),
  },
  11: {
    views: {phaseReveal: 'bases', midCircuit: 'hands', bellReadout: 'hands'},
    core: DL('theory.11.core'),
    phaseReveal: DL('theory.11.phaseReveal'),
    midCircuit: DL('theory.11.midCircuit'),
    feedback: DL('theory.11.feedback'),
    bellReadout: DL('theory.11.bellReadout'),
  },
  12: {
    views: {tune: 'bloch2d', pulse: 'bloch2d', sequence: 'bases', echo: 'rho'},
    core: DL('theory.12.core'),
    tune: DL('theory.12.tune'),
    pulse: DL('theory.12.pulse'),
    sequence: DL('theory.12.sequence'),
    calibrate: DL('theory.12.calibrate'),
    echo: DL('theory.12.echo'),
  },
};

// extra otázky (ťažká) — viac poznatkov a rovníc
const TRAPS_HARD = {
  1: [
    QZ('traps.hard.1.0'),
    QZ('traps.hard.1.1'),
  ],
  2: [
    QZ('traps.hard.2.0'),
    QZ('traps.hard.2.1'),
  ],
  3: [
    QZ('traps.hard.3.0'),
    QZ('traps.hard.3.1'),
  ],
  4: [
    QZ('traps.hard.4.0'),
    QZ('traps.hard.4.1'),
  ],
  5: [
    QZ('traps.hard.5.0'),
    QZ('traps.hard.5.1'),
  ],
  6: [
    QZ('traps.hard.6.0'),
    QZ('traps.hard.6.1'),
  ],
  7: [
    QZ('traps.hard.7.0'),
    QZ('traps.hard.7.1'),
  ],
  8: [
    QZ('traps.hard.8.0'),
    QZ('traps.hard.8.1'),
  ],
  9: [
    QZ('traps.hard.9.0'),
  ],
  10: [
    QZ('traps.hard.10.0'),
  ],
  11: [
    QZ('traps.hard.11.0'),
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
