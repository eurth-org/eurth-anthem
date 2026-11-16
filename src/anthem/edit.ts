// Editing: typing over a line, locking one, and what the page shows beside each line while the
// person works: its syllables, whether it fits the metre, and whether it rhymes with its partner.

import type { Anthem, Line, Settings } from './generate.ts';
import { cleanSettings } from './generate.ts';
import type { Lexicon } from './lexicon.ts';
import { FREE_MAX, FREE_MIN, KIND_PATTERN, rhymePartners, schemeFor } from './metre.ts';
import { anyRhyme, lineEnds, type LineEnd } from './rhyme.ts';
import { fitLine, scanLine, type FitProblem, type WordScan } from './scan.ts';

export const MAX_LINE_LENGTH = 120;
export const MAX_TITLE_LENGTH = 80;

export interface LineCheck {
  /** The line's syllables, read the way that fits best. */
  count: number;
  /** The syllables the metre asks for, or null in free verse. */
  want: number | null;
  /** In free verse, the range a line should stay within. */
  range: readonly [number, number] | null;
  fits: boolean;
  problem: FitProblem | null;
  /** Words the dictionary doesn't know, whose syllables are a guess the person can correct. */
  guessed: string[];
  /**
   * yes and no speak for themselves. unknown: one of the two lines ends on a word whose sound
   * isn't known. none: the scheme doesn't ask this line to rhyme.
   */
  rhyme: 'yes' | 'no' | 'unknown' | 'none';
  /** The other line of the pair, when there is one. */
  partner: number;
}

export interface At {
  stanza: number;
  line: number;
}

function read(line: Line, settings: Settings, lex: Lexicon): { words: WordScan[]; pattern: string | null; ends: LineEnd[] } {
  const words = scanLine(line.text, lex, settings.own);
  // In free verse a typed line may be any length; elsewhere every line answers to its metre.
  const pattern = settings.metre === 'free' && line.typed ? null : KIND_PATTERN[line.kind];
  let ends = lineEnds(words, pattern);
  // A line that doesn't fit can still be heard to rhyme.
  if (ends.length === 0 && pattern !== null) ends = lineEnds(words, null);
  return { words, pattern, ends };
}

/** What to show beside one line. */
export function checkLine(anthem: Anthem, rawSettings: Settings, at: At, lex: Lexicon): LineCheck | null {
  const settings = cleanSettings(rawSettings);
  const stanza = anthem.stanzas[at.stanza];
  const line = stanza?.lines[at.line];
  if (!stanza || !line) return null;
  const mine = read(line, settings, lex);
  const fit = fitLine(mine.words, mine.pattern);
  const count = fit.count;
  const free = mine.pattern === null;
  const fits = free ? count >= FREE_MIN && count <= FREE_MAX : fit.ok;
  const guessed = [...new Set(mine.words.filter((w) => w.source === 'guess').map((w) => w.text))];

  const partner = at.line >= 0 && at.line < 4 ? rhymePartners(schemeFor(settings.metre, settings.scheme))[at.line as 0 | 1 | 2 | 3] : -1;
  let rhyme: LineCheck['rhyme'] = 'none';
  const other = partner >= 0 ? stanza.lines[partner] : undefined;
  if (other) {
    const theirs = read(other, settings, lex);
    if (mine.ends.length === 0 || theirs.ends.length === 0) rhyme = 'unknown';
    else rhyme = anyRhyme(mine.ends, theirs.ends) ? 'yes' : 'no';
  }
  return {
    count,
    want: free ? null : mine.pattern!.length,
    range: free ? [FREE_MIN, FREE_MAX] : null,
    fits,
    problem: free ? null : (fit.problem ?? null),
    guessed,
    rhyme,
    partner: other ? partner : -1,
  };
}

/** The same for every line, stanza by stanza. */
export function checkAnthem(anthem: Anthem, settings: Settings, lex: Lexicon): LineCheck[][] {
  return anthem.stanzas.map((stanza, si) => stanza.lines.map((_, li) => checkLine(anthem, settings, { stanza: si, line: li }, lex)!));
}

/**
 * The few words beside a line: "8 of 8, fits", "7 of 8: one syllable short". Never colour alone:
 * the page shows these words whatever else it does.
 */
export function describeCheck(check: LineCheck): string {
  if (check.want === null) {
    const [min, max] = check.range!;
    const syllables = `${check.count} ${check.count === 1 ? 'syllable' : 'syllables'}`;
    if (check.count < min) return `${syllables}: short for a sung line`;
    if (check.count > max) return `${syllables}: long for a sung line`;
    return syllables;
  }
  const of = `${check.count} of ${check.want}`;
  if (check.fits) return `${of}, fits`;
  if (check.problem?.kind === 'stress') return `${of}, but the stress of "${check.problem.word}" falls on a weak beat`;
  const gap = Math.abs(check.count - check.want);
  const many = gap === 1 ? 'one syllable' : `${gap} syllables`;
  return check.count < check.want ? `${of}: ${many} short` : `${of}: ${many} too many`;
}

function tidy(text: string, max: number): string {
  // Plain text only, on one line.
  return text.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function withLine(anthem: Anthem, at: At, change: (line: Line) => Line): Anthem {
  if (!anthem.stanzas[at.stanza]?.lines[at.line]) return anthem;
  return {
    ...anthem,
    stanzas: anthem.stanzas.map((stanza, si) => (si !== at.stanza ? stanza : { ...stanza, lines: stanza.lines.map((line, li) => (li !== at.line ? line : change(line))) })),
  };
}

/** The person typed over a line. It is theirs from now on: never rewritten, only checked. */
export function typeLine(anthem: Anthem, at: At, text: string): Anthem {
  const next = tidy(text, MAX_LINE_LENGTH);
  // Nothing changed: the line is not theirs yet.
  if (anthem.stanzas[at.stanza]?.lines[at.line]?.text === next) return anthem;
  return withLine(anthem, at, (line) => ({ ...line, text: next, typed: true }));
}

/** Locks a line, or lets it go. A typed line that is let go may be written again by a re-roll. */
export function setLock(anthem: Anthem, at: At, locked: boolean): Anthem {
  return withLine(anthem, at, (line) => ({ ...line, locked }));
}

/** The person wrote their own title; an empty one hands the title back to the generator. */
export function typeTitle(anthem: Anthem, title: string): Anthem {
  const next = tidy(title, MAX_TITLE_LENGTH);
  return next === '' ? { ...anthem, titleTyped: false } : { ...anthem, title: next, titleTyped: true };
}

/** Lines the new settings no longer suit: kept as they are, and pointed out, never rewritten. */
export function misfits(anthem: Anthem, settings: Settings, lex: Lexicon): At[] {
  const out: At[] = [];
  checkAnthem(anthem, settings, lex).forEach((stanza, si) =>
    stanza.forEach((check, li) => {
      const line = anthem.stanzas[si]!.lines[li]!;
      if ((line.typed || line.locked) && (!check.fits || check.rhyme === 'no')) out.push({ stanza: si, line: li });
    }),
  );
  return out;
}
