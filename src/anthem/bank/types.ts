// The phrase bank: what a batch looks like as written, and what it becomes once compiled.
//
// How a batch is written
// ----------------------
// classes   A class is a set of phrases that all have one rhythm and can stand in for each other.
//           Its id ends in its rhythm: "gift.Sw" holds strong-weak words (honour, courage, glory).
//           Items are separated by commas, each with optional tags:
//             #sea        only when that theme is chosen (no # means always)
//             @march      only in that mood (no @ means every mood)
//             &thee &you  only in that register (solemn hymns say thee, the rest say you)
// templates "role kind | text tags". Slots are {class ids}. Tags as above, and also
//             >land >people >god   who a call or an address speaks to
//             +chorus -chorus      only in a chorus, never in a chorus
//           {name.Sw} takes the country's name, {place.Sw} a capital, city or other name the
//           person gave; their rhythm must match. A {ground...} slot straight after "the", "our",
//           "thy" or "your" may also take one of the person's own words to include.
// titles    Title templates: slots, and {name} for the country as written.
//
// Nothing in a batch is quoted or adapted from a real anthem, hymn or song.

import type { LineKind } from '../metre.ts';

/** The part a line plays in its verse. */
export type Role =
  /** Speaks to the land (or to God, or the people) by name: "Land of peace and ancient valleys," */
  | 'address'
  /** A statement that stands by itself. */
  | 'state'
  /** A call or a wish: "Guard the fields our mothers planted" */
  | 'call'
  /** An opening that needs a line after it: "From the highlands to the waters," */
  | 'lead'
  /** Carries a statement on: "And the ancient hills reply" */
  | 'cont'
  /** Carries a call on: "Till the valleys sing of peace" */
  | 'contCall'
  /** A last line: "Now and always, strong and free" */
  | 'close';

export const ROLES: readonly Role[] = ['address', 'state', 'call', 'lead', 'cont', 'contCall', 'close'];

export type MoodId = 'solemn' | 'march' | 'hopeful' | 'pastoral';
export const MOOD_IDS: readonly MoodId[] = ['solemn', 'march', 'hopeful', 'pastoral'];

export type Register = 'thee' | 'you';

/** Solemn hymns say thee and thy; everything else says you and your. */
export function registerFor(mood: MoodId): Register {
  return mood === 'solemn' ? 'thee' : 'you';
}

/** A batch as written. */
export interface BatchSource {
  id: string;
  title: string;
  /** Set to true only when Stijn has read the batch and said so. */
  reviewed: boolean;
  classes: Readonly<Record<string, string>>;
  templates: readonly string[];
  titles?: readonly string[];
  /** Stress patterns for words the dictionary doesn't have, by word. */
  own?: Readonly<Record<string, string>>;
}

/** The rhyme a phrase or a line ends on, by its usual pronunciation. */
export interface End {
  key: string;
  onset: string;
  word: string;
  weak: boolean;
}

export interface Item {
  text: string;
  themes: readonly string[];
  moods: readonly MoodId[];
  reg: Register | null;
  batch: string;
  /** Set when the class can end a line and the phrase's rhyme is known. */
  end: End | null;
}

export interface SlotClass {
  id: string;
  /** S and w, one per syllable. */
  pattern: string;
  items: Item[];
  /** Filled when the anthem is written, not from the bank. */
  runtime: 'name' | 'place' | null;
}

export type Part =
  | { lit: string }
  | {
      cls: string;
      /** May take one of the person's own words to include. */
      open: boolean;
    };

export interface Template {
  id: string;
  role: Role;
  kind: LineKind;
  parts: readonly Part[];
  /** As written, for the review pages. */
  source: string;
  themes: readonly string[];
  moods: readonly MoodId[];
  reg: Register | null;
  to: string | null;
  chorus: 'only' | 'never' | 'any';
  batch: string;
  /** The name class the template needs, if it has a name slot. */
  nameCls: string | null;
  /** The place classes it needs. */
  placeCls: readonly string[];
  /** The class of the last slot, when the line ends in a slot. */
  endCls: string | null;
  /** The rhyme of the last words, when the line ends in written words. */
  endLit: End | null;
}

export interface TitleTemplate {
  parts: readonly (Part | { name: true })[];
  themes: readonly string[];
  batch: string;
}

export interface Bank {
  classes: Readonly<Record<string, SlotClass>>;
  templates: readonly Template[];
  titles: readonly TitleTemplate[];
  batches: readonly { id: string; title: string; reviewed: boolean }[];
}

/** The shapes a name or a place can take in a line. */
export const NAME_SHAPES: readonly string[] = ['S', 'Sw', 'wS', 'SwS', 'wSw', 'SwSw', 'wSwS', 'SwSwS'];
