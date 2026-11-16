// Freezes the examples: writes each one with the generator, from the settings and seed in
// src/anthem/examples.ts, and stores it in src/anthem/examples.data.ts as its link carries it.
//
//   npm run examples                 writes the examples that aren't frozen yet
//   npm run examples -- --all        writes every example again (after the banks were reviewed)
//   npm run examples -- --try teland 12   shows seeds 1 to 12 for one example and writes nothing
//   npm run examples -- --find teland 3   shows the first three seeds that place every word
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXAMPLE_SPECS } from '../src/anthem/examples.ts';
import { FROZEN } from '../src/anthem/examples.data.ts';
import { generate } from '../src/anthem/generate.ts';
import { toLinkState, type LinkState } from '../src/anthem/link.ts';
import { kindsLabel } from '../src/anthem/metre.ts';
import { loadBank, loadLexicon } from './load.ts';

const lex = loadLexicon();
const { bank } = loadBank(lex);
const args = process.argv.slice(2);

function show(id: string, seed: number): void {
  const one = EXAMPLE_SPECS.find((s) => s.id === id)!;
  const result = generate(bank, one.settings, seed, { lexicon: lex });
  console.log(`\n--- ${id}, seed ${seed}: ${result.anthem.title}`);
  for (const stanza of result.anthem.stanzas) {
    console.log(`${stanza.type === 'chorus' ? 'Chorus' : 'Verse'} · ${kindsLabel(stanza.kinds)}`);
    for (const line of stanza.lines) console.log(`  ${line.text}`);
  }
  if (result.unplaced.length) console.log(`Couldn't place: ${result.unplaced.join(', ')}`);
  if (result.notes.length) console.log(`Notes: ${JSON.stringify(result.notes)}`);
}

if (args[0] === '--try') {
  for (let seed = 1; seed <= Number(args[2] ?? 8); seed += 1) show(args[1]!, seed);
} else if (args[0] === '--find') {
  // The first few seeds that place every word, say the name and need no note.
  for (const one of EXAMPLE_SPECS.filter((s) => !args[1] || s.id === args[1])) {
    let found = 0;
    for (let seed = 1; seed <= 400 && found < Number(args[2] ?? 1); seed += 1) {
      const result = generate(bank, one.settings, seed, { lexicon: lex });
      if (result.notes.length > 0 || result.unplaced.length > 0) continue;
      found += 1;
      show(one.id, seed);
    }
  }
} else {
  const all = args.includes('--all');
  const out: Record<string, LinkState> = {};
  for (const one of EXAMPLE_SPECS) {
    const kept = FROZEN[one.id];
    if (kept && !all) {
      out[one.id] = kept;
      continue;
    }
    const result = generate(bank, one.settings, one.seed, { lexicon: lex });
    if (result.notes.length > 0 || result.unplaced.length > 0) console.warn(`! ${one.id}: ${JSON.stringify(result.notes)} ${result.unplaced.join(', ')}`);
    out[one.id] = toLinkState(one.settings, result.anthem);
    console.log(`froze ${one.id}: ${result.anthem.title}`);
  }
  const target = resolve(dirname(fileURLToPath(import.meta.url)), '../src/anthem/examples.data.ts');
  const body = Object.entries(out)
    .map(([id, state]) => `  ${id}: ${JSON.stringify(state)},`)
    .join('\n');
  writeFileSync(
    target,
    `// Written by \`npm run examples\`. Each example as its link carries it. Don't edit by hand.\nimport type { LinkState } from './link.ts';\n\nexport const FROZEN: Readonly<Record<string, LinkState>> = {\n${body}\n};\n`,
  );
}
