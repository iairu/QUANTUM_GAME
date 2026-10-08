'use strict';
// Zoznam levelov v poradí (mapa ostrova). Farby sú portály.
const LEVELS = [
  { num: 1, title: tr('Komplexný prístav', 'Complex Harbour'), mentor: 'Leonhard Euler', face: '🧮', color: [0.95, 0.6, 0.25], cls: L1Complex },
  { num: 2, title: tr('Sternova–Gerlachova pec', 'Stern–Gerlach Furnace'), mentor: 'Stern & Gerlach', face: '🧲', color: [0.95, 0.35, 0.35], cls: L2Stern },
  { num: 3, title: tr('Blochovo observatórium', 'Bloch Observatory'), mentor: 'Felix Bloch', face: '🌐', color: [0.4, 0.6, 1], cls: L3Bloch },
  { num: 4, title: tr('Chrám interferencie', 'Temple of Interference'), mentor: 'Richard Feynman', face: '🥁', color: [0.75, 0.45, 1], cls: L4Interference },
  { num: 5, title: tr('Diracova knižnica', 'Dirac’s Library'), mentor: 'Paul Dirac', face: '🎩', color: [0.3, 0.85, 0.7], cls: L5Dirac },
  { num: 6, title: tr('Rabiho rezonátor (NMR)', 'Rabi’s Resonator (NMR)'), mentor: 'I. I. Rabi', face: '📻', color: [1, 0.8, 0.3], cls: L6Rabi },
  { num: 7, title: tr('Bellov most', 'Bell’s Bridge'), mentor: 'John Bell', face: '🔔', color: [1, 0.45, 0.7], cls: L7Bell },
  { num: 8, title: tr('Sieň výkladov', 'Hall of Interpretations'), mentor: 'Niels Bohr', face: '☯', color: [0.6, 0.9, 0.4], cls: L8Philo },
];
