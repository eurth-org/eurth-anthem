// Loads the pronunciation table and compiles the phrase bank, for the tools in this folder.
import { existsSync, readFileSync } from 'node:fs';
import { compileBank, type Compiled } from '../src/anthem/bank/compile.ts';
import { BATCHES } from '../src/anthem/bank/index.ts';
import { parseLexicon, type Lexicon } from '../src/anthem/lexicon.ts';
import { TARGET, writeLexicon } from './build-dict.mjs';

export function loadLexicon(): Lexicon {
  if (!existsSync(TARGET)) writeLexicon();
  return parseLexicon(readFileSync(TARGET, 'utf8'));
}

export function loadBank(lex: Lexicon): Compiled {
  return compileBank(BATCHES, lex);
}
