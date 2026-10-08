'use strict';
// Zoznam levelov v poradí (mapa ostrova). Farby sú portály.
const LEVELS = [
  { num: 1, title: 'Komplexný prístav', mentor: 'Leonhard Euler', face: '🧮', color: [0.95, 0.6, 0.25], cls: L1Complex },
  { num: 2, title: 'Sternova–Gerlachova pec', mentor: 'Stern & Gerlach', face: '🧲', color: [0.95, 0.35, 0.35], cls: L2Stern },
  { num: 3, title: 'Blochovo observatórium', mentor: 'Felix Bloch', face: '🌐', color: [0.4, 0.6, 1], cls: L3Bloch },
  { num: 4, title: 'Chrám interferencie', mentor: 'Richard Feynman', face: '🥁', color: [0.75, 0.45, 1], cls: L4Interference },
  { num: 5, title: 'Diracova knižnica', mentor: 'Paul Dirac', face: '🎩', color: [0.3, 0.85, 0.7], cls: L5Dirac },
  { num: 6, title: 'Rabiho rezonátor (NMR)', mentor: 'I. I. Rabi', face: '📻', color: [1, 0.8, 0.3], cls: L6Rabi },
  { num: 7, title: 'Bellov most', mentor: 'John Bell', face: '🔔', color: [1, 0.45, 0.7], cls: L7Bell },
  { num: 8, title: 'Sieň výkladov', mentor: 'Niels Bohr', face: '☯', color: [0.6, 0.9, 0.4], cls: L8Philo },
];
