// How deep the bank is: for every metre, rhyme scheme and mood, how often the longest anthem
// (four verses and a chorus) can be written without the bank running short, and how many
// different rhyme sounds each kind of line can end on. Run it after adding to the bank.
//
//   npm run depth
import { MOOD_IDS } from '../src/anthem/bank/types.ts';
import { DEFAULT_SETTINGS, generate, type Settings } from '../src/anthem/generate.ts';
import { LINE_KINDS, METRES, METRE_IDS, SCHEME_IDS } from '../src/anthem/metre.ts';
import { loadBank, loadLexicon } from './load.ts';

const lex = loadLexicon();
const { bank, problems } = loadBank(lex);
for (const problem of problems) console.error(`! ${problem}`);

const RUNS = 150;
console.log(`Anthems of four verses and a chorus that ran short, out of ${RUNS} for each mood:\n`);
for (const metre of METRE_IDS) {
  for (const scheme of SCHEME_IDS) {
    const row: string[] = [];
    for (const mood of MOOD_IDS) {
      let short = 0;
      for (let seed = 1; seed <= RUNS; seed += 1) {
        const settings: Settings = { ...DEFAULT_SETTINGS, country: 'Teland', own: { teland: '10' }, metre, scheme, mood, verses: 4, chorus: true };
        if (generate(bank, settings, seed, { lexicon: lex }).notes.some((n) => n.kind === 'short')) short += 1;
      }
      row.push(`${mood} ${String(short).padStart(3)}`);
    }
    console.log(`${METRES[metre].label.padEnd(8)} ${scheme}   ${row.join('   ')}`);
  }
}

console.log('\nRhyme sounds each kind of line can end on, by the part it plays (plain phrases only):\n');
for (const kind of LINE_KINDS) {
  const byRole = new Map<string, Map<string, Set<string>>>();
  for (const t of bank.templates) {
    if (t.kind !== kind || t.themes.length > 0 || t.nameCls || t.placeCls.length > 0) continue;
    const ends = t.endLit ? [t.endLit] : bank.classes[t.endCls!]!.items.filter((i) => i.themes.length === 0).flatMap((i) => (i.end ? [i.end] : []));
    const keys = byRole.get(t.role) ?? new Map<string, Set<string>>();
    byRole.set(t.role, keys);
    for (const end of ends) keys.set(end.key, (keys.get(end.key) ?? new Set()).add(end.word));
  }
  for (const [role, keys] of byRole) {
    const families = [...keys.values()].map((words) => [...words]);
    const rich = families.filter((w) => w.length >= 2);
    console.log(`${kind} ${role.padEnd(9)} ${String(keys.size).padStart(3)} sounds, ${String(rich.length).padStart(2)} with two words or more: ${rich.map((w) => w.join('/')).join('  ')}`);
  }
  console.log('');
}
