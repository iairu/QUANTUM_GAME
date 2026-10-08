'use strict';
// Nastavenia hry: obťažnosť, vizualizácie a geometria zobrazenia. Ukladajú sa do localStorage
// oddelene od postupu, takže reset hry ich nezmaže.

const DIFFS = ['layman', 'easy', 'normal', 'hard', 'ancient'];
// témy: klasická (8 levelov), severská (skyrimovský vzhľad + 9. level s drakom Ketvarrom)
// a MMO (predvolená: hrá sa ako World of Warcraft — kúzla, nepriatelia, úlohy, obchodník, korisť; aj drak)
const THEMES = ['classic', 'nordic', 'wow'];
const Settings = {
  diff: 'layman', // nová hra začína laickou obťažnosťou
  theme: 'wow',
  get nordic() { return this.theme === 'nordic'; },
  get wow() { return this.theme === 'wow'; },
  get dragon() { return this.nordic || this.wow; }, // drak Ketvarr a 9. level
  // ťažká aj prastará (prastará = ťažká + starobylé zvitky s históriou)
  get hard() { return this.diff === 'hard' || this.diff === 'ancient'; },
  // ľahká aj laická (laická = ľahká + všetko bežnými slovami)
  get easy() { return this.diff === 'easy' || this.diff === 'layman'; },
  get layman() { return this.diff === 'layman'; },
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
    tex: 'auto',      // textúry: 'auto' (podľa výkonu), 'low' (pôvodné), 'high' (vysoké rozlíšenie)
  },
  audio: { music: 0.15, sfx: 0.6, muted: false }, // hudba predvolene veľmi potichu (pozadie pre sústredenie)
  gpuName: '',
  // vysoké rozlíšenie textúr: ručne, alebo automaticky len na výkonnejších počítačoch
  get texHigh() {
    if (!this.nordic && !this.wow) return false; // detailné textúry patria k severskej a MMO téme
    if (this.view.tex !== 'auto') return this.view.tex === 'high';
    const weakGpu = /swiftshader|llvmpipe|software|mali|adreno|powervr|intel\(r\) (hd|uhd) graphics [2-6]/i.test(this.gpuName);
    const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    return !weakGpu && !mobile && (navigator.hardwareConcurrency || 2) >= 8 && (navigator.deviceMemory ?? 8) >= 8;
  },
  load() {
    try {
      const d = JSON.parse(localStorage.getItem('kvantp-game1-settings') || 'null');
      if (!d) return;
      if (DIFFS.includes(d.diff)) this.diff = d.diff;
      if (THEMES.includes(d.theme)) this.theme = d.theme;
      for (const k of Object.keys(this.view)) if (typeof d.view?.[k] === typeof this.view[k]) this.view[k] = d.view[k];
      for (const k of Object.keys(this.audio)) if (typeof d.audio?.[k] === typeof this.audio[k]) this.audio[k] = d.audio[k];
      if (d.audio?.music === 0.35) this.audio.music = 0.15; // staré predvolené (nezmenené hráčom) → nové tichšie
    } catch (e) { /* predvolené nastavenia */ }
  },
  save() {
    try { localStorage.setItem('kvantp-game1-settings', JSON.stringify({ diff: this.diff, theme: this.theme, view: this.view, audio: this.audio })); } catch (e) { /* bez ukladania */ }
  },
};
Settings.load();
document.documentElement.dataset.theme = Settings.theme;

// hodnota podľa aktuálnej obťažnosti (číta sa vždy znova, takže zmena platí okamžite)
const byDiff = (easy, normal, hard) => (Settings.easy ? easy : Settings.hard ? hard : normal);
const DIFF_NAME = {
  layman: tr('🫶 Laická', '🫶 Layman'), easy: tr('Ľahká', 'Easy'), normal: tr('Normálna', 'Normal'), hard: tr('Ťažká', 'Hard'), ancient: tr('📜 Prastará', '📜 Ancient'),
};
const DIFF_DESC = {
  layman: tr('ľahká, ale všetko bežnými slovami: pred každou úlohou vysvetlenie „po ľudsky“, odborné slová s prekladom v zátvorke, jednoduché vysvetlivky — ideálny štart do kvantových počítačov',
    'easy, but everything in everyday words: a plain-language explanation before every task, technical words translated in brackets, simple tooltips — the ideal start into quantum computing'),
  easy: tr('väčšie tolerancie, menej pokusov, nápovedy, v kvízoch o jednu nesprávnu možnosť menej',
    'wider tolerances, fewer trials, hints, one wrong option fewer in quizzes'),
  normal: tr('pôvodná hra', 'the original game'),
  hard: tr('viac poznatkov: teória a rovnice pri každom kroku, extra otázky s rovnicami; presnosť, náhodné ciele, bez nápovied, prísnejšie hviezdičky',
    'more knowledge: theory and equations at every step, extra equation questions; precision, random targets, no hints, stricter stars'),
  ancient: tr('ťažká + starobylé zvitky: história objavov, roky, autori, ich rozhovory a slávne výroky; otázka z histórie v každom leveli',
    'hard + ancient scrolls: the history of the discoveries, years, authors, their conversations and famous words; a history question in every level'),
};
