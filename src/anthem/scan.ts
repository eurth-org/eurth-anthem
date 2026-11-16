// Scanning: how many syllables a word or a line has, and which of them are stressed.
//
// A word is looked up in this order: the person's own correction, the dictionary, the dictionary
// by its other spelling (British or American), the dictionary by its stem, and last a guess from
// the spelling. Nothing here throws, whatever is typed.

import type { Lexicon, Pron } from './lexicon.ts';

/** Where a word's scansion came from. */
export type Source = 'own' | 'dict' | 'spelling' | 'guess';

export interface WordScan {
  /** The word as typed, without the punctuation around it. */
  text: string;
  /** The form looked up: lower case, plain letters. */
  word: string;
  /** Every way of saying it, likeliest first. Never empty. */
  prons: readonly Pron[];
  source: Source;
}

/** The person's own stress patterns, by word in lower case: { selunna: '010' }. */
export type Overrides = Readonly<Record<string, string>>;

const OTHER_LETTERS: Readonly<Record<string, string>> = {
  æ: 'ae', œ: 'oe', ø: 'o', ß: 'ss', þ: 'th', ð: 'd', ł: 'l', đ: 'd', ħ: 'h', ı: 'i',
};

/** Lower case, accents dropped, quotes straightened, punctuation trimmed from both ends. */
export function cleanWord(raw: string): string {
  let s = raw.toLowerCase().replace(/[æœøßþðłđħı]/g, (c) => OTHER_LETTERS[c] ?? c);
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  s = s.replace(/[‘’ʼ`]/g, "'").replace(/[‐‑]/g, '-');
  s = s.replace(/[^a-z'-]/g, '');
  return s.replace(/^-+|-+$/g, '');
}

/** The words of a line, as typed, in order. Dashes between words split them. */
export function tokenise(line: string): string[] {
  const out: string[] = [];
  for (const chunk of line.split(/[\s‒-―/]+/)) {
    const text = chunk.replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu, '');
    if (/[\p{L}\p{N}]/u.test(text)) out.push(text);
  }
  return out;
}

/** Words that verse has always been free to sing a syllable short. */
const SHORT: Readonly<Record<string, string>> = {
  power: '1', powers: '1', flower: '1', flowers: '1', tower: '1', towers: '1', shower: '1', showers: '1',
  heaven: '1', heavens: '1', glorious: '10', victorious: '010',
};

const VALID_STRESS = /^[012]{1,12}$/;

function unknown(stress: string): Pron {
  return { stress, tail: '', onset: '' };
}

function fromDict(word: string, lex: Lexicon): Pron[] | undefined {
  const found = lex.get(word);
  if (!found) return undefined;
  const out = [...found];
  const short = SHORT[word];
  if (short && !out.some((p) => p.stress === short)) {
    const base = out[0]!;
    out.push({ stress: short, tail: short.length === 1 ? base.tail : '', onset: base.onset });
  }
  return out;
}

/** British spellings the dictionary may only know the American way, and the reverse. */
const RESPELL: readonly (readonly [RegExp, string])[] = [
  [/our(s|ed|ing|ite|ites|able|ably|less|ful|er|ers)?$/, 'or$1'],
  [/or(s|ed|ing)?$/, 'our$1'],
  [/is(e|es|ed|ing|ation|ations|er|ers)$/, 'iz$1'],
  [/ys(e|es|ed|ing)$/, 'yz$1'],
  [/tre(s)?$/, 'ter$1'],
  [/bre(s)?$/, 'ber$1'],
  [/ll(ed|ing|er|ers)$/, 'l$1'],
  [/ence(s)?$/, 'ense$1'],
  [/ogue(s)?$/, 'og$1'],
  [/ae/, 'e'],
  [/oe/, 'e'],
  [/grey/, 'gray'],
  [/plough/, 'plow'],
  [/mould/, 'mold'],
];

function respelt(word: string, lex: Lexicon): Pron[] | undefined {
  for (const [from, to] of RESPELL) {
    if (!from.test(word)) continue;
    const found = fromDict(word.replace(from, to), lex);
    if (found) return found;
  }
  return undefined;
}

function known(word: string, lex: Lexicon): Pron[] | undefined {
  return fromDict(word, lex) ?? respelt(word, lex);
}

const HISSING = /(s|x|z|ch|sh|ce|se|ge|ze)$/;

/** An ending the dictionary doesn't list, worked out from the word it was added to. */
function fromStem(word: string, lex: Lexicon): Pron[] | undefined {
  const tries: [string, (stem: string) => boolean][] = [];
  const add = (stem: string, extra: (stem: string) => boolean) => {
    if (stem.length >= 2) tries.push([stem, extra]);
  };
  const always = () => true;
  if (/'s$|s'$/.test(word)) add(word.replace(/'s$|'$/, ''), (s) => /'s$/.test(word) && HISSING.test(s));
  if (/es$/.test(word)) add(word.slice(0, -2), (s) => HISSING.test(s));
  if (/s$/.test(word)) add(word.slice(0, -1), (s) => /(ce|se|ge|ze)$/.test(s));
  if (/ed$/.test(word)) {
    add(word.slice(0, -2), (s) => /[td]$/.test(s));
    add(word.slice(0, -1), (s) => /[td]e$/.test(s));
  }
  if (/ing$/.test(word)) {
    add(word.slice(0, -3), always);
    add(word.slice(0, -3) + 'e', always);
  }
  for (const ending of ['ly', 'ness', 'less', 'ful', 'er', 'est', 'ward', 'wards']) {
    if (word.endsWith(ending)) add(word.slice(0, -ending.length), always);
  }
  for (const [stem, extra] of tries) {
    const base = known(stem.replace(/'$/, ''), lex);
    if (!base) continue;
    return base.map((p) => unknown(p.stress + (extra(stem) ? '0' : '')));
  }
  return undefined;
}

function isVowelLetter(word: string, i: number): boolean {
  const c = word[i];
  if (c === undefined) return false;
  if ('aeio'.includes(c)) return true;
  const next = word[i + 1];
  const nextIsVowel = next !== undefined && 'aeiou'.includes(next);
  if (c === 'u') {
    const prev = word[i - 1];
    // "queen", "guard": the u belongs to the consonant.
    return !((prev === 'q' || prev === 'g') && nextIsVowel);
  }
  // "yonder", "royal", "beyond": a y before a vowel is a consonant.
  if (c === 'y') return !nextIsVowel;
  return false;
}

/** Pairs of vowel letters that are two syllables, not one: "Maria", "lion", "actual". */
function splitsBetween(word: string, i: number): boolean {
  const pair = word.slice(i, i + 2);
  if (pair === 'ia' || pair === 'io' || pair === 'iu') {
    // "nation", "special", "region": one syllable.
    return !(i > 0 && 'tscxg'.includes(word[i - 1]!) && /^(ion|ial|ian|ious|iou|ient|ience|ia$)/.test(word.slice(i)));
  }
  return ['ua', 'uo', 'ao', 'eo', 'ii'].includes(pair);
}

/** The spans of letters that each carry a syllable, worked out from spelling alone. */
export function nuclei(word: string): [number, number][] {
  const spans: [number, number][] = [];
  let i = 0;
  while (i < word.length) {
    if (!isVowelLetter(word, i)) {
      i += 1;
      continue;
    }
    let start = i;
    while (i + 1 < word.length && isVowelLetter(word, i + 1)) {
      if (splitsBetween(word, i)) {
        spans.push([start, i + 1]);
        start = i + 1;
      }
      i += 1;
    }
    spans.push([start, i + 1]);
    i += 1;
  }
  if (spans.length > 1) {
    const last = spans[spans.length - 1]!;
    const lone = last[1] - last[0] === 1 && word[last[0]] === 'e';
    const before = word[last[0] - 1] ?? '';
    const after = word.slice(last[1]);
    const afterConsonant = before !== '' && !'aeiouy'.includes(before);
    if (lone && after === '' && afterConsonant) {
      // "vane" is one syllable; "table" keeps its last one.
      const le = before === 'l' && last[0] >= 2 && !'aeiouy'.includes(word[last[0] - 2]!);
      if (!le) spans.pop();
    } else if (lone && after === 's' && afterConsonant && !/(s|x|z|c|g|ch|sh)$/.test(word.slice(0, last[0]))) {
      spans.pop();
    } else if (lone && after === 'd' && afterConsonant && !/[td]$/.test(word.slice(0, last[0]))) {
      spans.pop();
    }
  }
  return spans;
}

/** A stress pattern for a word nobody has heard before, from its spelling. */
export function guessStress(word: string): string {
  const letters = word.replace(/[^a-z]/g, '');
  const n = Math.max(1, nuclei(letters).length);
  if (n === 1) return '1';
  let at = 0;
  if (n === 2) {
    at = /(een|oon|ette|elle|esque|eer|aire)$/.test(letters) ? 1 : 0;
  } else if (/(ia|ian|ium|ius|ial|ios|eum|eus|ua|uan)$/.test(letters)) {
    at = n - 3;
  } else if (/[aiou]$/.test(letters)) {
    at = n - 2;
  } else {
    at = n === 3 ? 0 : n - 3;
  }
  return '0'.repeat(at) + '1' + '0'.repeat(n - at - 1);
}

/** How one word is said. */
export function scanWord(raw: string, lex: Lexicon, overrides: Overrides = {}): WordScan {
  const text = raw;
  const word = cleanWord(raw);
  const own = overrides[word];
  if (own && VALID_STRESS.test(own)) {
    const match = known(word, lex)?.find((p) => p.stress.length === own.length);
    return { text, word, prons: [{ stress: own, tail: match?.tail ?? '', onset: match?.onset ?? '' }], source: 'own' };
  }
  const direct = fromDict(word, lex);
  if (direct) return { text, word, prons: direct, source: 'dict' };
  const bare = word.replace(/^'+|'+$/g, '');
  const trimmed = bare !== word ? fromDict(bare, lex) : undefined;
  if (trimmed) return { text, word, prons: trimmed, source: 'dict' };
  if (word.includes('-')) {
    const parts = word.split('-').filter(Boolean).map((part) => scanWord(part, lex, overrides));
    if (parts.length > 0) {
      // In a joined word a part of one syllable loses its claim to the strong beat ("tide-line").
      const joined = (stress: string) => (stress.length === 1 ? '2' : stress);
      const last = parts[parts.length - 1]!;
      const head = parts.slice(0, -1).map((p) => joined(p.prons[0]!.stress)).join('');
      // Only the last part can carry the rhyme.
      const prons = last.prons.map((p) => ({ stress: head + joined(p.stress), tail: p.tail, onset: p.onset }));
      const guessed = parts.some((p) => p.source === 'guess');
      return { text, word, prons, source: guessed ? 'guess' : 'spelling' };
    }
  }
  const other = respelt(bare, lex) ?? fromStem(bare, lex);
  if (other) return { text, word, prons: other, source: 'spelling' };
  return { text, word, prons: [unknown(guessStress(bare))], source: 'guess' };
}

/** How each word of a line is said. */
export function scanLine(text: string, lex: Lexicon, overrides: Overrides = {}): WordScan[] {
  return tokenise(text).map((raw) => scanWord(raw, lex, overrides));
}

/** "Se-LUN-na": a word split into syllables with the stressed one in capitals. */
export function spellOut(raw: string, stress: string): string {
  const letters = cleanWord(raw).replace(/[^a-z]/g, '');
  const spans = nuclei(letters);
  if (letters === '' || spans.length !== stress.length || spans.length < 2) return raw;
  const cuts: number[] = [];
  for (let i = 0; i + 1 < spans.length; i += 1) {
    const from = spans[i]![1];
    const to = spans[i + 1]![0];
    const gap = to - from;
    const cluster = letters.slice(from, to);
    if (gap <= 1) cuts.push(from);
    else if (gap === 2 && /^(th|sh|ch|ph|qu|wh)$/.test(cluster)) cuts.push(from);
    else cuts.push(from + 1);
  }
  const parts: string[] = [];
  let at = 0;
  for (const cut of [...cuts, letters.length]) {
    parts.push(letters.slice(at, cut));
    at = cut;
  }
  const main = stress.indexOf('1');
  const capital = /^\p{Lu}/u.test(raw);
  return parts
    .map((part, i) => {
      if (i === main) return part.toUpperCase();
      return i === 0 && capital ? part[0]!.toUpperCase() + part.slice(1) : part;
    })
    .join('-');
}

/** What is wrong with a line that doesn't fit, in a form the page can put into words. */
export type FitProblem =
  | { kind: 'count'; have: number; want: number }
  | { kind: 'stress'; word: string };

export interface Fit {
  ok: boolean;
  /** The way each word is taken to be said: the fitting one where there is a fit. */
  choice: Pron[];
  /** The line's syllables, as chosen. */
  count: number;
  problem?: FitProblem;
}

/** Whether one way of saying a word can start at a beat: no main stress of a longer word on a weak beat. */
export function sits(pron: Pron, at: number, pattern: string): boolean {
  if (at + pron.stress.length > pattern.length) return false;
  // A word of one syllable can be sung on either beat.
  if (pron.stress.length === 1) return true;
  for (let j = 0; j < pron.stress.length; j += 1) {
    if (pron.stress[j] === '1' && pattern[at + j] !== 'S') return false;
  }
  return true;
}

/**
 * Whether a line can be sung to a pattern of strong (S) and weak (w) beats: the right number of
 * syllables, and no main stress of a longer word on a weak beat. With no pattern (free verse)
 * every line fits.
 */
export function fitLine(words: readonly WordScan[], pattern: string | null): Fit {
  const first = words.map((w) => w.prons[0]!);
  const firstCount = first.reduce((n, p) => n + p.stress.length, 0);
  if (pattern === null) return { ok: true, choice: first, count: firstCount };

  const dead = new Set<number>();
  const choice: Pron[] = [];
  const walk = (i: number, at: number, strict: boolean): boolean => {
    if (i === words.length) return at === pattern.length;
    const key = i * 64 + at;
    if (dead.has(key)) return false;
    for (const pron of words[i]!.prons) {
      const fits = strict ? sits(pron, at, pattern) : at + pron.stress.length <= pattern.length;
      if (!fits) continue;
      choice[i] = pron;
      if (walk(i + 1, at + pron.stress.length, strict)) return true;
    }
    dead.add(key);
    return false;
  };
  if (walk(0, 0, true)) return { ok: true, choice: choice.slice(0, words.length), count: pattern.length };

  // Not a fit. Is it the count, or the stress?
  dead.clear();
  if (walk(0, 0, false)) {
    const byCount = choice.slice(0, words.length);
    let at = 0;
    let word = words[0]?.text ?? '';
    for (let i = 0; i < byCount.length; i += 1) {
      if (!sits(byCount[i]!, at, pattern)) {
        word = words[i]!.text;
        break;
      }
      at += byCount[i]!.stress.length;
    }
    return { ok: false, choice: byCount, count: pattern.length, problem: { kind: 'stress', word } };
  }
  return { ok: false, choice: first, count: firstCount, problem: { kind: 'count', have: firstCount, want: pattern.length } };
}
