'use strict';
// Nastavenia hry: obťažnosť, vizualizácie a geometria zobrazenia. Ukladajú sa do localStorage
// oddelene od postupu, takže reset hry ich nezmaže.

const DIFFS = ['easy', 'normal', 'hard', 'ancient'];
const Settings = {
  diff: 'normal',
  // ťažká aj prastará (prastará = ťažká + starobylé zvitky s históriou)
  get hard() { return this.diff === 'hard' || this.diff === 'ancient'; },
  view: {
    grid: false,      // rovnobežky a poludníky Blochovej sféry, polárna mriežka komplexnej roviny
    proj: true,       // projekcie Blochovho vektora na osi (⟨X⟩, ⟨Y⟩, ⟨Z⟩)
    angles: true,     // oblúky uhlov θ, φ a fázy
    bars: true,       // stĺpce P(0), P(1) pri sfére
    trail: true,      // stopa šípky počas rotácie
    charts: true,     // grafy v paneli levelu
    fov: 0.9,         // zorný uhol kamery (radiány)
    labelScale: 1,    // veľkosť 3D popiskov
    glass: 0.13,      // nepriehľadnosť sklenenej Blochovej sféry
    autoRotate: 0,    // automatické otáčanie kamery v leveloch (rad/s)
    viewsOpen: false, // plávajúci panel „👁 Pohľady“ (rôzne obrazy toho istého stavu)
    viewsTab: 'all',
  },
  load() {
    try {
      const d = JSON.parse(localStorage.getItem('kvantp-game1-settings') || 'null');
      if (!d) return;
      if (DIFFS.includes(d.diff)) this.diff = d.diff;
      for (const k of Object.keys(this.view)) if (typeof d.view?.[k] === typeof this.view[k]) this.view[k] = d.view[k];
    } catch (e) { /* predvolené nastavenia */ }
  },
  save() {
    try { localStorage.setItem('kvantp-game1-settings', JSON.stringify({ diff: this.diff, view: this.view })); } catch (e) { /* bez ukladania */ }
  },
};
Settings.load();

// hodnota podľa aktuálnej obťažnosti (číta sa vždy znova, takže zmena platí okamžite)
const byDiff = (easy, normal, hard) => (Settings.diff === 'easy' ? easy : Settings.hard ? hard : normal);
const DIFF_NAME = {
  easy: tr('Ľahká', 'Easy'), normal: tr('Normálna', 'Normal'), hard: tr('Ťažká', 'Hard'), ancient: tr('📜 Prastará', '📜 Ancient'),
};
const DIFF_DESC = {
  easy: tr('väčšie tolerancie, menej pokusov, nápovedy, v kvízoch o jednu nesprávnu možnosť menej',
    'wider tolerances, fewer trials, hints, one wrong option fewer in quizzes'),
  normal: tr('pôvodná hra', 'the original game'),
  hard: tr('viac poznatkov: teória a rovnice pri každom kroku, extra otázky s rovnicami; presnosť, náhodné ciele, bez nápovied, prísnejšie hviezdičky',
    'more knowledge: theory and equations at every step, extra equation questions; precision, random targets, no hints, stricter stars'),
  ancient: tr('ťažká + starobylé zvitky: história objavov, roky, autori, ich rozhovory a slávne výroky; otázka z histórie v každom leveli',
    'hard + ancient scrolls: the history of the discoveries, years, authors, their conversations and famous words; a history question in every level'),
};
