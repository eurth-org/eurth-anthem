// Rhyme: what a line ends on, and whether two endings rhyme.
//
// A rhyme starts at the vowel of the line's last strong beat. A line that ends on a strong beat
// rhymes on one syllable ("sea", "free"); a line that ends strong-weak rhymes on two ("mountains",
// "fountains", or "guide us", "beside us"). Only true rhymes count: the same sounds from that
// vowel on, with a different sound in front.

import { vowelPositions, type Lexicon, type Pron } from './lexicon.ts';
import { fitLine, type WordScan } from './scan.ts';

export interface LineEnd {
  /** The word or two words the rhyme sits in, lower case. */
  word: string;
  /** The rhyming sounds. Two endings with the same key rhyme. */
  key: string;
  /** The consonants just before the rhyming sounds. */
  onset: string;
  /** m: one syllable, on a strong beat. f: two syllables, strong then weak. */
  kind: 'm' | 'f';
  /**
   * True when the rhyming syllable has no stress of its own and is only lifted by the beat
   * ("liberty" with "sea"). It sings, but it is the weaker sort of rhyme.
   */
  weak: boolean;
}

function oneSyllable(word: string, pron: Pron): LineEnd | null {
  if (pron.tail === '') return null;
  const vowels = vowelPositions(pron.tail);
  if (vowels.length === 0) return null;
  // A word of one syllable, or one sung as one ("power"), rhymes whole.
  if (pron.stress.length === 1 || vowels.length === 1) {
    const last = pron.stress[pron.stress.length - 1]!;
    return { word, key: pron.tail, onset: pron.onset, kind: 'm', weak: pron.stress.length > 1 && last === '0' };
  }
  const from = vowels[vowels.length - 1]!;
  const before = vowels[vowels.length - 2]!;
  const weak = pron.stress[pron.stress.length - 1] === '0';
  return { word, key: pron.tail.slice(from), onset: pron.tail.slice(before + 1, from), kind: 'm', weak };
}

/**
 * What a line ends on. `pattern` is the line's beats; without one (free verse) the last word
 * decides whether the ending is one syllable or two. Null when the ending's sounds aren't known.
 */
export function lineEnd(words: readonly WordScan[], choice: readonly Pron[], pattern: string | null): LineEnd | null {
  const n = words.length;
  if (n === 0 || choice.length !== n) return null;
  const last = choice[n - 1]!;
  const lastWord = words[n - 1]!.word;
  const stressedEnd = last.stress.length === 1 || last.stress[last.stress.length - 1] !== '0';
  const kind: 'm' | 'f' = pattern === null ? (stressedEnd ? 'm' : 'f') : pattern.endsWith('S') ? 'm' : 'f';
  if (kind === 'm') return oneSyllable(lastWord, last);

  if (last.stress.length >= 2) {
    if (last.tail === '' || vowelPositions(last.tail).length !== 2) return null;
    if (last.stress[last.stress.length - 2] === '0') return null;
    return { word: lastWord, key: last.tail, onset: last.onset, kind: 'f', weak: false };
  }
  // Two words: "guide us". The weak word must be the same in both lines, so it goes in the key.
  if (n < 2) return null;
  const strong = oneSyllable(words[n - 2]!.word, choice[n - 2]!);
  if (!strong) return null;
  return { word: `${strong.word} ${lastWord}`, key: `${strong.key} ${lastWord}`, onset: strong.onset, kind: 'f', weak: strong.weak };
}

/**
 * Every ending a line could have, over the ways its last words can be said while the line still
 * fits. For lines a person typed, where any fair reading should count.
 */
export function lineEnds(words: readonly WordScan[], pattern: string | null): LineEnd[] {
  const n = words.length;
  const out: LineEnd[] = [];
  if (n === 0) return out;
  const lastTwo = n >= 2 ? words[n - 2]!.prons : [undefined];
  for (const before of lastTwo) {
    for (const pron of words[n - 1]!.prons) {
      const narrowed = words.map((w, i) => {
        if (i === n - 1) return { ...w, prons: [pron] };
        if (i === n - 2 && before) return { ...w, prons: [before] };
        return w;
      });
      const fit = fitLine(narrowed, pattern);
      if (!fit.ok) continue;
      const end = lineEnd(narrowed, fit.choice, pattern);
      if (end && !out.some((e) => e.key === end.key && e.onset === end.onset && e.kind === end.kind)) out.push(end);
    }
  }
  return out;
}

/** True when any reading of one line's ending rhymes with any reading of the other's. */
export function anyRhyme(a: readonly LineEnd[], b: readonly LineEnd[]): boolean {
  return a.some((x) => b.some((y) => rhymes(x, y)));
}

/** True rhyme: the same sounds from the last strong vowel on, and a different sound before them. */
export function rhymes(a: LineEnd | null, b: LineEnd | null): boolean {
  if (!a || !b) return false;
  return a.kind === b.kind && a.key === b.key && a.word !== b.word && a.onset !== b.onset;
}

/** Words that rhyme with a word, as it is usually said: for the "rhymes with" hint. */
export function rhymesFor(word: string, lex: Lexicon, limit = 40): string[] {
  const prons = lex.get(word);
  if (!prons) return [];
  const out = new Set<string>();
  for (const pron of prons) {
    for (const other of lex.rhymes(pron.tail)) {
      if (other === word || out.has(other)) continue;
      const theirs = lex.get(other)?.find((p) => p.tail === pron.tail);
      if (!theirs || theirs.onset === pron.onset) continue;
      // The stress must fall in the same place: "dirty" doesn't rhyme with "liberty".
      if (theirs.stress.slice(-2) !== pron.stress.slice(-2) && theirs.stress.length > 1 && pron.stress.length > 1) continue;
      out.add(other);
      if (out.size >= limit) return [...out];
    }
  }
  return [...out];
}
