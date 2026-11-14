// Turns the CMU Pronouncing Dictionary (data/cmudict/cmudict.dict, a pinned copy) into the compact
// table Anthem loads: for every word, its stress pattern, its rhyme tail and the consonants before
// the tail. Words are grouped by tail, so the file doubles as a rhyming dictionary.
//
// One line per rhyme tail:   TAIL<tab>word<stress><onset>[.n] word<stress><onset>[.n] ...
//   .n      on a word's second and later pronunciations, their order in the dictionary, so the
//           usual way of saying a word stays first
//   stress  one digit per syllable: 1 main stress, 2 secondary, 0 none ("harbour" is 10)
//   TAIL    the sounds from the last main-stressed vowel to the end of the word, or the last two
//           syllables if that is shorter, one character per sound: vowels are capital letters,
//           consonants are small letters. Two syllables are all a hymn metre ever rhymes on.
//   onset   the consonants just before the tail ("light" and "delight" share an onset, so they
//           are the same sound twice and not a rhyme)
//
// Run by `npm run dict`, and by the tests when the table is missing or older than its source.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE = resolve(root, 'data/cmudict/cmudict.dict');
export const TARGET = resolve(root, 'src/anthem/generated/lexicon.txt');

// The copy in data/cmudict/ is commit 74790861f652b15e4ac49015a90074ad62a27690 of
// github.com/cmusphinx/cmudict. Change both together.
export const SOURCE_SHA256 = '81917843c7f44ce2b094ac63873c2c7a4cf802040792c455ba3ca406891c3d22';

const VOWELS = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'];
const CONSONANTS = [
  'B', 'CH', 'D', 'DH', 'F', 'G', 'HH', 'JH', 'K', 'L', 'M', 'N', 'NG', 'P', 'R', 'S', 'SH', 'T', 'TH', 'V', 'W', 'Y', 'Z', 'ZH',
];
const CODE = new Map();
VOWELS.forEach((p, i) => CODE.set(p, String.fromCharCode(65 + i)));
CONSONANTS.forEach((p, i) => CODE.set(p, String.fromCharCode(97 + i)));

/** One dictionary line to { word, stress, tail, onset }, or null for a line we leave out. */
export function parseEntry(line) {
  const hash = line.indexOf('#');
  const parts = (hash === -1 ? line : line.slice(0, hash)).trim().split(/\s+/);
  if (parts.length < 2) return null;
  const variant = /\((\d+)\)$/.exec(parts[0]);
  const rank = variant ? Number(variant[1]) - 1 : 0;
  const word = parts[0].replace(/\(\d+\)$/, '');
  // Letters and apostrophes only: no abbreviations, numbers or hyphens. Hyphenated words are
  // looked up part by part.
  if (!/^'?[a-z]+('[a-z]+)*'?$/.test(word)) return null;
  const sounds = [];
  for (const raw of parts.slice(1)) {
    const stress = /\d$/.test(raw) ? raw.slice(-1) : '';
    const code = CODE.get(stress ? raw.slice(0, -1) : raw);
    if (!code) return null;
    sounds.push({ code, stress, raw: stress ? raw.slice(0, -1) : raw });
  }
  const vowelAt = sounds.map((s, i) => (s.stress ? i : -1)).filter((i) => i >= 0);
  if (vowelAt.length === 0) return null;
  const stress = vowelAt.map((i) => sounds[i].stress).join('');
  let from = -1;
  for (const want of ['1', '2']) {
    for (const i of vowelAt) if (sounds[i].stress === want) from = i;
    if (from !== -1) break;
  }
  if (from === -1) from = vowelAt[vowelAt.length - 1];
  // No more than the last two syllables.
  if (vowelAt.length >= 2) from = Math.max(from, vowelAt[vowelAt.length - 2]);
  let start = from;
  while (start > 0 && !sounds[start - 1].stress) start -= 1;
  const onset = sounds.slice(start, from).map((s) => s.code).join('');
  const tail = sounds
    .slice(from)
    // An unstressed "ih" after the stress is a schwa to the ear: "guarded" rhymes either way.
    .map((s, i) => (i > 0 && s.raw === 'IH' && s.stress === '0' ? CODE.get('AH') : s.code))
    .join('');
  return { word, stress, tail, onset, rank };
}

export function buildLexicon(source) {
  const groups = new Map();
  const seen = new Set();
  let words = 0;
  for (const line of source.split('\n')) {
    const entry = parseEntry(line);
    if (!entry) continue;
    const same = `${entry.tail}\t${entry.word}${entry.stress}${entry.onset}`;
    if (seen.has(same)) continue;
    seen.add(same);
    const item = `${entry.word}${entry.stress}${entry.onset}${entry.rank ? `.${entry.rank}` : ''}`;
    words += 1;
    let group = groups.get(entry.tail);
    if (!group) groups.set(entry.tail, (group = []));
    group.push(item);
  }
  const lines = [...groups.keys()].sort().map((tail) => `${tail}\t${groups.get(tail).join(' ')}`);
  return { text: lines.join('\n') + '\n', words, tails: groups.size };
}

export function writeLexicon() {
  const source = readFileSync(SOURCE);
  const sha = createHash('sha256').update(source).digest('hex');
  if (sha !== SOURCE_SHA256) {
    throw new Error(`data/cmudict/cmudict.dict is not the pinned copy (sha256 ${sha}).`);
  }
  const built = buildLexicon(source.toString('utf8'));
  mkdirSync(dirname(TARGET), { recursive: true });
  writeFileSync(TARGET, built.text);
  return built;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const built = writeLexicon();
  console.log(`lexicon.txt: ${built.words} pronunciations in ${built.tails} rhyme tails, ${built.text.length} bytes`);
}
