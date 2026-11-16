// Writes a sample anthem to the terminal, to hear what the bank sounds like.
//
//   npm run sample -- [metre] [scheme] [mood] [country] [seed] [verses] [include,words] [themes,...]
//   npm run sample -- 8787 ABAB solemn Teland 1 2 harbour,tide,Selunna sea,freedom
//
// A made-up name can carry its stress after a colon: Selunna:010.
import { DEFAULT_SETTINGS, generate, type Settings } from '../src/anthem/generate.ts';
import { kindsLabel } from '../src/anthem/metre.ts';
import { loadBank, loadLexicon } from './load.ts';

const lex = loadLexicon();
const { bank, problems } = loadBank(lex);
for (const problem of problems) console.error(`! ${problem}`);

const [metre = '8787', scheme = 'ABAB', mood = 'solemn', country = 'Teland', seed = '1', verses = '2', include = '', themes = ''] = process.argv.slice(2);
const own: Record<string, string> = {};
const bare = (word: string) => {
  const [text, stress] = word.split(':');
  if (stress) own[text!.toLowerCase()] = stress;
  return text!;
};
const settings = {
  ...DEFAULT_SETTINGS,
  metre,
  scheme,
  mood,
  country: bare(country),
  verses: Number(verses),
  include: include ? include.split(',').map(bare) : [],
  themes: themes ? themes.split(',') : [],
  own,
} as Settings;

const result = generate(bank, settings, Number(seed), { lexicon: lex });
console.log(`\n${result.anthem.title}\n`);
for (const stanza of result.anthem.stanzas) {
  console.log(`${stanza.type === 'chorus' ? 'Chorus' : 'Verse'} · ${kindsLabel(stanza.kinds)}`);
  for (const line of stanza.lines) console.log(`  ${line.text.padEnd(44)}${line.role}`);
  console.log('');
}
if (result.placed.length) console.log(`Placed: ${result.placed.join(', ')}`);
if (result.unplaced.length) console.log(`Couldn't place: ${result.unplaced.join(', ')}`);
if (result.notes.length) console.log(`Notes: ${JSON.stringify(result.notes)}`);
