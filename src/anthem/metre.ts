// Hymn metres and rhyme schemes.
//
// A hymn metre is written as the number of syllables in each line: 8.7.8.7. To sing well a line
// also needs its strong syllables on the strong beats, so each metre here is a pattern per line:
// S for a strong beat, w for a weak one.

/** The four shapes a line can take. T is trochaic (strong first), I is iambic (weak first). */
export type LineKind = 'T8' | 'T7' | 'I8' | 'I6';

export const KIND_PATTERN: Readonly<Record<LineKind, string>> = {
  T8: 'SwSwSwSw',
  T7: 'SwSwSwS',
  I8: 'wSwSwSwS',
  I6: 'wSwSwS',
};

export const LINE_KINDS: readonly LineKind[] = ['T8', 'T7', 'I8', 'I6'];

export type MetreId = '8787' | '8686' | '7777' | '8888' | 'free';

export interface Metre {
  id: MetreId;
  /** As printed on a hymn sheet. */
  label: string;
  /** What the metre is called, in a few words. */
  name: string;
  /** The kind of each of the four lines, or null for free verse. */
  lines: readonly [LineKind, LineKind, LineKind, LineKind] | null;
  /** Offered in the metre menu. Long metre is kept for the emu's chorus. */
  offered: boolean;
}

export const METRES: Readonly<Record<MetreId, Metre>> = {
  '8787': { id: '8787', label: '8.7.8.7', name: 'hymn metre, strong beat first', lines: ['T8', 'T7', 'T8', 'T7'], offered: true },
  '8686': { id: '8686', label: '8.6.8.6', name: 'common metre', lines: ['I8', 'I6', 'I8', 'I6'], offered: true },
  '7777': { id: '7777', label: '7.7.7.7', name: 'sevens', lines: ['T7', 'T7', 'T7', 'T7'], offered: true },
  '8888': { id: '8888', label: '8.8.8.8', name: 'long metre', lines: ['I8', 'I8', 'I8', 'I8'], offered: false },
  free: { id: 'free', label: 'Free', name: 'free verse', lines: null, offered: true },
};

export const METRE_IDS: readonly MetreId[] = ['8787', '8686', '7777', 'free'];

/** Free verse still wants lines a tune could carry. */
export const FREE_MIN = 5;
export const FREE_MAX = 11;

/** The line shapes free verse draws on, a stanza at a time. */
export const FREE_SHAPES: readonly (readonly [LineKind, LineKind, LineKind, LineKind])[] = [
  ['T8', 'T7', 'T8', 'T7'],
  ['I8', 'I6', 'I8', 'I6'],
  ['T7', 'I6', 'T7', 'I6'],
  ['I8', 'T7', 'I8', 'T7'],
  ['T7', 'T7', 'I8', 'I6'],
  ['I8', 'I8', 'I6', 'I8'],
  ['T8', 'I6', 'T8', 'I6'],
];

export type SchemeId = 'ABAB' | 'AABB' | 'ABCB';

export const SCHEME_IDS: readonly SchemeId[] = ['ABAB', 'AABB', 'ABCB'];

/** For each line of a four-line stanza, the line it must rhyme with, or -1. */
export function rhymePartners(scheme: SchemeId): readonly [number, number, number, number] {
  if (scheme === 'ABAB') return [2, 3, 0, 1];
  if (scheme === 'AABB') return [1, 0, 3, 2];
  return [-1, 3, -1, 1];
}

/** The groups of lines that rhyme together: [[0, 2], [1, 3]] for ABAB. */
export function rhymeGroups(scheme: SchemeId): readonly (readonly number[])[] {
  if (scheme === 'ABAB') return [[0, 2], [1, 3]];
  if (scheme === 'AABB') return [[0, 1], [2, 3]];
  return [[1, 3]];
}

/** "8.7.8.7" for a stanza's line kinds, whatever they are. */
export function kindsLabel(kinds: readonly LineKind[]): string {
  return kinds.map((k) => KIND_PATTERN[k].length).join('.');
}
