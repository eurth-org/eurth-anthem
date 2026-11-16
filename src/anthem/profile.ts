// The nation profile (<nation>.eurth.json): what Anthem reads from the other tools' sections,
// and the `anthem` section it writes. Anthem owns that one section and touches no other.
//
// This module works on plain objects, so it needs nothing from @eurth/profile; the page uses that
// package to load, check and save the file. A loaded file is someone else's input: everything
// read here is checked and capped again.

import { lyricsText, summary } from './describe.ts';
import { cleanSettings, type Anthem, type Settings } from './generate.ts';
import type { Lexicon } from './lexicon.ts';
import { KIND_PATTERN, LINE_KINDS, METRES, schemeFor, type LineKind } from './metre.ts';
import { fitLine, scanLine, type Overrides } from './scan.ts';
import { MOODS } from './themes.ts';

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown, max = 80): string => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '');

export interface FromProfile {
  /** The everyday name, or the file's own name for the nation. */
  country: string;
  capital: string;
  /** The largest cities, largest first, without the capital. */
  cities: string[];
  /** Other place names in the nation's own sound, from the name generator. */
  places: string[];
  motto: string;
}

/** What Anthem takes from a profile: the name, the capital, the motto, cities and place names. */
export function readProfile(profile: unknown): FromProfile {
  const root = isObject(profile) ? profile : {};
  const identity = isObject(root.identity) ? root.identity : {};
  const meta = isObject(root.meta) ? root.meta : {};
  const cities = isObject(root.cities) && Array.isArray(root.cities.list) ? root.cities.list : [];
  const names = isObject(root.names) && Array.isArray(root.names.places) ? root.names.places : [];
  const country = text(identity.commonName) || text(meta.nation);
  let capital = text(identity.capital);
  const seen = new Set<string>();
  const fresh = (name: string) => {
    const key = name.toLowerCase();
    if (name === '' || seen.has(key)) return false;
    seen.add(key);
    return true;
  };
  const cityNames: string[] = [];
  for (const city of cities.slice(0, 200)) {
    if (!isObject(city)) continue;
    const name = text(city.name);
    if (capital === '' && city.capital === true) capital = name;
    cityNames.push(name);
  }
  fresh(country);
  fresh(capital);
  const largest: string[] = [];
  for (const name of cityNames) {
    if (largest.length === 5) break;
    if (fresh(name)) largest.push(name);
  }
  return {
    country,
    capital,
    cities: largest,
    places: names.map((name) => text(name)).filter(fresh).slice(0, 12),
    motto: text(identity.motto, 200),
  };
}

/** The words to include that a profile suggests: the capital and the three largest other cities. */
export function suggestedWords(from: FromProfile): string[] {
  return [from.capital, ...from.cities.slice(0, 3)].filter(Boolean);
}

/**
 * The line shapes a motto could be sung in as it stands. Where it fits one, the page offers it as
 * a line the person can drop in; where it fits none, it goes under the title.
 */
export function mottoFits(motto: string, lex: Lexicon, own: Overrides = {}): LineKind[] {
  const words = scanLine(motto, lex, own);
  if (words.length === 0) return [];
  return LINE_KINDS.filter((kind) => fitLine(words, KIND_PATTERN[kind]).ok);
}

/**
 * The `anthem` section. `previous` is the section as it was: its keys are kept, so a field a
 * newer Anthem added is not lost. The page stamps `updated` when it saves (setSection does).
 */
export function anthemSection(anthem: Anthem, rawSettings: Settings, link: string, previous: unknown = {}): Record<string, unknown> {
  const settings = cleanSettings(rawSettings);
  const section: Record<string, unknown> = {
    ...(isObject(previous) ? previous : {}),
    summary: summary(anthem, settings).slice(0, 600),
    title: anthem.title.slice(0, 80),
    lyrics: lyricsText(anthem).slice(0, 4000),
    metre: METRES[settings.metre].label.toLowerCase(),
    rhyme: schemeFor(settings.metre, settings.scheme),
    mood: MOODS[settings.mood].toLowerCase(),
    themes: settings.themes.filter((t) => t !== 'emu').slice(0, 12),
  };
  if (/^https:\/\//.test(link) && link.length <= 4000) section.link = link;
  else delete section.link;
  return section;
}

/**
 * An anthem from a section that has words but no link of ours (written by hand, or by another
 * tool): every line comes back as a typed line, in stanzas of four, so nothing is rewritten.
 * Null when there is nothing to read or the stanzas aren't four lines each.
 */
export function anthemFromLyrics(section: unknown, rawSettings: Settings): Anthem | null {
  if (!isObject(section) || typeof section.lyrics !== 'string') return null;
  const settings = cleanSettings(rawSettings);
  const blocks = section.lyrics
    .slice(0, 4000)
    .split(/\n\s*\n/)
    .map((block) => block.split('\n').map((line) => text(line, 120)).filter(Boolean))
    .filter((block) => block.length > 0);
  if (blocks.length === 0 || blocks.length > 5 || blocks.some((block) => block.length !== 4)) return null;
  const kinds = METRES[settings.metre].lines ?? METRES['8787'].lines!;
  // With more than one stanza and a chorus wanted, the second is the chorus, as Anthem writes it.
  const hasChorus = settings.chorus && blocks.length > 1;
  return {
    title: text(section.title) || 'Anthem',
    titleTyped: text(section.title) !== '',
    stanzas: blocks.map((block, i) => ({
      type: hasChorus && i === 1 ? ('chorus' as const) : ('verse' as const),
      kinds,
      lines: block.map((line, li) => ({ text: line, role: 'state' as const, kind: kinds[li]!, typed: true, locked: false })),
    })),
  };
}
