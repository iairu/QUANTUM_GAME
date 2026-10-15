'use strict';
// Zoznam levelov v poradí (mapa ostrova). Farby sú portály.
const LEVELS = [
  { num: 1, title: tr('Komplexný prístav', 'Complex Harbour', 'Комплексна гавань'), mentor: tr('Leonhard Euler', 'Leonhard Euler', 'Леонард Ейлер'), face: '🧮', color: [0.95, 0.6, 0.25], cls: L1Complex },
  { num: 2, title: tr('Sternova–Gerlachova pec', 'Stern–Gerlach Furnace', 'Піч Штерна–Ґерлаха'), mentor: tr('Stern & Gerlach', 'Stern & Gerlach', 'Штерн і Ґерлах'), face: '🧲', color: [0.95, 0.35, 0.35], cls: L2Stern },
  { num: 3, title: tr('Blochovo observatórium', 'Bloch Observatory', 'Обсерваторія Блоха'), mentor: tr('Felix Bloch', 'Felix Bloch', 'Фелікс Блох'), face: '🌐', color: [0.4, 0.6, 1], cls: L3Bloch },
  { num: 4, title: tr('Chrám interferencie', 'Temple of Interference', 'Храм інтерференції'), mentor: tr('Richard Feynman', 'Richard Feynman', 'Річард Фейнман'), face: '🥁', color: [0.75, 0.45, 1], cls: L4Interference },
  { num: 5, title: tr('Diracova knižnica', 'Dirac’s Library', 'Бібліотека Дірака'), mentor: tr('Paul Dirac', 'Paul Dirac', 'Поль Дірак'), face: '🎩', color: [0.3, 0.85, 0.7], cls: L5Dirac },
  { num: 6, title: tr('Rabiho rezonátor (NMR)', 'Rabi’s Resonator (NMR)', 'Резонатор Рабі (ЯМР)'), mentor: tr('I. I. Rabi', 'I. I. Rabi', 'І. І. Рабі'), face: '📻', color: [1, 0.8, 0.3], cls: L6Rabi },
  { num: 7, title: tr('Bellov most', 'Bell’s Bridge', 'Міст Белла'), mentor: tr('John Bell', 'John Bell', 'Джон Белл'), face: '🔔', color: [1, 0.45, 0.7], cls: L7Bell },
  { num: 8, title: tr('Sieň výkladov', 'Hall of Interpretations', 'Зала тлумачень'), mentor: tr('Niels Bohr', 'Niels Bohr', 'Нільс Бор'), face: '☯', color: [0.6, 0.9, 0.4], cls: L8Philo },
  { num: 9, title: tr('Pauliho rotačná dielňa', 'Pauli’s Rotation Workshop', 'Обертова майстерня Паулі'), mentor: tr('Wolfgang Pauli', 'Wolfgang Pauli', 'Вольфганг Паулі'), face: '🔄', color: [0.2, 0.95, 0.95], cls: L9Pauli },
  { num: 10, title: tr('Von Neumannova čistiareň', 'Von Neumann’s Purity Refinery', 'Очисна станція фон Неймана'), mentor: tr('John von Neumann', 'John von Neumann', 'Джон фон Нейман'), face: '⚗', color: [0.88, 0.88, 1], cls: L10Neumann },
  { num: 11, title: tr('Bornova meracia sieň', 'Born’s Readout Hall', 'Зала вимірювань Борна'), mentor: tr('Max Born', 'Max Born', 'Макс Борн'), face: '🎲', color: [0.95, 0.72, 0.5], cls: L11Born },
  // špeciálny praktický level: odomknutý od začiatku (free), nepočíta sa medzi slová moci proti drakovi
  { num: 13, title: tr('NMR dielňa', 'NMR Workshop', 'ЯМР-майстерня'), mentor: tr('Edward Purcell', 'Edward Purcell', 'Едвард Перселл'), face: '🧪', color: [0.45, 1, 0.75], cls: L13Nmr, free: true },
  { num: 12, title: tr('Dračí štít', 'Dragon’s Peak', 'Драконів пік'), mentor: tr('Erwin Schrödinger', 'Erwin Schrödinger', 'Ервін Шредінгер'), face: '🐱', color: [1, 0.42, 0.15], cls: L12Dragon, boss: true },
].filter((L) => !L.boss || Settings.nordic || Settings.wow); // 12. level (drak) v severskej a MMO téme
