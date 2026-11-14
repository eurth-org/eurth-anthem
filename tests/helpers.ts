import { readFileSync } from 'node:fs';
import { parseLexicon, type Lexicon } from '../src/anthem/lexicon.ts';
import { TARGET } from '../tools/build-dict.mjs';

let cached: Lexicon | undefined;

/** The full pronunciation table, read once. */
export function lexicon(): Lexicon {
  cached ??= parseLexicon(readFileSync(TARGET, 'utf8'));
  return cached;
}

/** A small seeded random number generator for tests that need their own. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
