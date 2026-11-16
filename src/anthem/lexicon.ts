// The pronunciation table: how each English word is stressed and what it rhymes with.
// Built from the CMU Pronouncing Dictionary by tools/build-dict.mjs; the format is described there.

/** One way of saying a word. */
export interface Pron {
  /** One digit per syllable: 1 main stress, 2 secondary, 0 none. "harbour" is "10". */
  stress: string;
  /**
   * The sounds from the main stress to the end (the last two syllables at most), one character
   * per sound, vowels in capitals. Empty when the sounds aren't known (a made-up word).
   */
  tail: string;
  /** The consonants just before the tail. */
  onset: string;
}

export interface Lexicon {
  /** Every known way of saying a word (lower case), or undefined. */
  get(word: string): readonly Pron[] | undefined;
  /** The words that end in exactly this tail. */
  rhymes(tail: string): readonly string[];
  readonly size: number;
}

/** A lexicon that knows nothing: every word is then scanned by its spelling. */
export const EMPTY_LEXICON: Lexicon = {
  get: () => undefined,
  rhymes: () => [],
  size: 0,
};

const ENTRY = /^([a-z']+?)(\d+)([a-x]*)(?:\.(\d+))?$/;

/** Builds a lexicon a piece at a time, so a page can read the table without holding up the person. */
export interface LexiconBuilder {
  /** Takes some whole lines of lexicon.txt. Lines that don't parse are skipped, never thrown on. */
  add(lines: readonly string[]): void;
  finish(): Lexicon;
}

export function lexiconBuilder(): LexiconBuilder {
  const words = new Map<string, Pron[]>();
  const ranks = new Map<Pron, number>();
  let unordered = false;
  const groups = new Map<string, string>();
  return {
    add(lines) {
      for (const line of lines) {
        const tab = line.indexOf('\t');
        if (tab <= 0) continue;
        const tail = line.slice(0, tab);
        const rest = line.slice(tab + 1);
        groups.set(tail, rest);
        for (const item of rest.split(' ')) {
          const m = ENTRY.exec(item);
          if (!m) continue;
          const word = m[1]!;
          const pron: Pron = { stress: m[2]!, tail, onset: m[3]! };
          if (m[4]) {
            ranks.set(pron, Number(m[4]));
            unordered = true;
          }
          const list = words.get(word);
          if (list) list.push(pron);
          else words.set(word, [pron]);
        }
      }
    },
    finish() {
      // The usual way of saying a word comes first.
      if (unordered) {
        for (const list of words.values()) {
          if (list.length > 1) list.sort((a, b) => (ranks.get(a) ?? 0) - (ranks.get(b) ?? 0));
        }
      }
      return {
        get: (word) => words.get(word),
        rhymes(tail) {
          const rest = groups.get(tail);
          if (!rest) return [];
          const out = new Set<string>();
          for (const item of rest.split(' ')) {
            const m = ENTRY.exec(item);
            if (m) out.add(m[1]!);
          }
          return [...out];
        },
        size: words.size,
      };
    },
  };
}

/** Reads the text of lexicon.txt in one go. */
export function parseLexicon(text: string): Lexicon {
  const builder = lexiconBuilder();
  builder.add(text.split('\n'));
  return builder.finish();
}

/** True for a vowel sound in a tail. */
export function isVowelSound(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return c >= 65 && c <= 90;
}

/** Where the vowel sounds sit in a tail. */
export function vowelPositions(tail: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < tail.length; i += 1) if (isVowelSound(tail[i]!)) out.push(i);
  return out;
}
