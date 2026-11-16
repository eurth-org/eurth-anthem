// Compiles the phrase bank into the file the site ships: src/anthem/generated/bank.json. The
// compiled bank carries every phrase's rhythm and rhyme, so the page can write an anthem without
// waiting for the dictionary.
//
// Which batches go in: before the door opens (LAUNCH_AT), all of them, so the site can be built
// and tried while the batches are still being read. From the door on, only the batches marked
// reviewed: an unreviewed batch never ships. If what is reviewed can't write an anthem by
// itself, the build stops here and says so, and nothing half-made goes out.
//
// ANTHEM_BANK=reviewed (or =all) overrides the date, to try a launch build by hand.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTime } from '@eurth/style/build';
import { compileBank, reviewedOnly } from '../src/anthem/bank/compile.ts';
import { BATCHES } from '../src/anthem/bank/index.ts';
import type { Bank } from '../src/anthem/bank/types.ts';
import { DEFAULT_SETTINGS, generate } from '../src/anthem/generate.ts';
import { METRE_IDS, SCHEME_IDS } from '../src/anthem/metre.ts';
import { loadLexicon } from './load.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const BANK_TARGET = resolve(root, 'src/anthem/generated/bank.json');

/** Whether this build is for the door or after it. */
export function forLaunch(): boolean {
  const asked = process.env.ANTHEM_BANK;
  if (asked === 'reviewed') return true;
  if (asked === 'all') return false;
  const door = new Date(readFileSync(resolve(root, 'LAUNCH_AT'), 'utf8').trim());
  return buildTime().getTime() >= door.getTime();
}

export function buildBank(launch = forLaunch()): { bank: Bank; left: string[] } {
  const batches = launch ? reviewedOnly(BATCHES) : [...BATCHES];
  const left = BATCHES.filter((b) => !batches.includes(b)).map((b) => b.id);
  const { bank, problems } = compileBank(batches, loadLexicon());
  if (problems.length > 0) {
    const why = launch && left.length > 0 ? `This is a launch build, which ships reviewed batches only, and these are not marked reviewed: ${left.join(', ')}. ` : '';
    throw new Error(`${why}The phrase bank doesn't compile:\n  ${problems.slice(0, 12).join('\n  ')}${problems.length > 12 ? `\n  and ${problems.length - 12} more` : ''}`);
  }
  // Whatever goes out must be able to write a whole anthem in every metre and rhyme scheme.
  for (const metre of METRE_IDS) {
    for (const scheme of SCHEME_IDS) {
      const result = generate(bank, { ...DEFAULT_SETTINGS, metre, scheme, verses: 4 }, 1);
      const whole = result.anthem.stanzas.every((st) => st.lines.length === 4 && st.lines.every((line) => line.text !== ''));
      if (!whole || result.notes.some((n) => n.kind === 'short')) {
        const why = left.length > 0 ? ` These batches are not marked reviewed and were left out: ${left.join(', ')}.` : '';
        throw new Error(`The phrase bank can't write a whole anthem in ${metre} ${scheme}.${why}`);
      }
    }
  }
  // The line as written is for the review pages; the page has no use for it.
  return { bank: { ...bank, templates: bank.templates.map((t) => ({ ...t, source: '' })) }, left };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { bank, left } = buildBank();
  const text = JSON.stringify(bank);
  mkdirSync(dirname(BANK_TARGET), { recursive: true });
  writeFileSync(BANK_TARGET, text);
  const which = left.length > 0 ? `reviewed batches only (left out: ${left.join(', ')})` : 'every batch';
  console.log(`bank.json: ${bank.templates.length} lines from ${which}, ${text.length} bytes`);
}
