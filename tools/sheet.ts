// Writes sample lyric sheets as SVG files, to look at the layout.
//
//   npm run sheet -- <folder> [metre] [verses] [seed]
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DEFAULT_SETTINGS, generate, type Settings } from '../src/anthem/generate.ts';
import { LIGHT, NIGHT, SHEET_SIZES, sheetSvg } from '../src/anthem/sheet.ts';
import { loadBank, loadLexicon } from './load.ts';

const [folder, metre = '8787', verses = '2', seed = '1'] = process.argv.slice(2);
if (!folder) {
  console.error('Say where to write: npm run sheet -- <folder>');
  process.exit(1);
}
const lex = loadLexicon();
const { bank } = loadBank(lex);
const settings = { ...DEFAULT_SETTINGS, country: 'Teland', own: { teland: '10' }, metre, verses: Number(verses) } as Settings;
const { anthem } = generate(bank, settings, Number(seed), { lexicon: lex });
mkdirSync(resolve(folder), { recursive: true });
for (const size of SHEET_SIZES) {
  for (const [name, palette] of [['night', NIGHT], ['light', LIGHT]] as const) {
    const file = resolve(folder, `${size.id}-${name}.svg`);
    writeFileSync(file, sheetSvg(anthem, settings, { size, palette, footer: 'anthem.eurth.org' }));
    console.log(file);
  }
}
