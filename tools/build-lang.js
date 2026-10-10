#!/usr/bin/env node
'use strict';
// Z lang/<jazyk>.csv vygeneruje lang/<jazyk>.js, aby dialógy fungovali aj pri spustení index.html z disku (file://).
// Spusti po každej úprave CSV:  node tools/build-lang.js
// Kontroluje aj, či v každom riadku sedia zátvorky [[ ]] a či preklady nepoužívajú iné {n} než slovenčina.
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'lang');
const parse = (text) => { // rovnaký parser ako v hre (js/i18n.js), tu len kvôli kontrole
  const rows = new Map(); const re = /^([^,\n]+),(?:"((?:[^"]|"")*)"|([^\n]*))$/gm; let m;
  while ((m = re.exec(text))) if (m[1] !== 'key') rows.set(m[1], m[2] != null ? m[2].replace(/""/g, '"') : m[3]);
  return rows;
};
const all = {};
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.csv'))) {
  const lang = f.slice(0, -4), text = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n');
  all[lang] = parse(text);
  fs.writeFileSync(path.join(dir, lang + '.js'), `// VYGENEROVANÉ z lang/${f} príkazom node tools/build-lang.js — neupravuj, uprav CSV.\nDLG_LOAD(${JSON.stringify(lang)}, ${JSON.stringify(text)});\n`);
  console.log(`lang/${lang}.js: ${all[lang].size} riadkov`);
}
let bad = 0;
for (const [lang, rows] of Object.entries(all)) for (const [k, v] of rows) {
  if ((v.match(/\[\[/g) || []).length !== (v.match(/\]\]/g) || []).length && !/\]\]\]/.test(v)) { console.warn(`${lang} ${k}: nespárované [[ ]]`); bad++; }
  const ph = (s) => [...new Set((s.match(/\{\d+\}/g) || []))].sort().join();
  if (all.sk && all.sk.has(k) && lang !== 'sk' && ph(v) && ph(v) !== ph(all.sk.get(k)) && !ph(all.sk.get(k)).includes(ph(v))) { console.warn(`${lang} ${k}: iné {n} ako v sk`); bad++; }
  if (lang !== 'en' && all.en && !all.en.has(k)) { console.warn(`${lang} ${k}: chýba v en.csv (záložný jazyk)`); bad++; }
}
process.exitCode = bad ? 1 : 0;
