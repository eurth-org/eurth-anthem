// The anthem as it travels in a link: a small, versioned object with short keys. The words
// themselves are in it, not just the seed, so a link made today shows the same anthem after the
// banks have grown. @eurth/style turns the object into the query string and back.
//
// What comes back out of a link is someone else's input: every value is checked and clamped, and
// anything that isn't an anthem gives null.

import type { Role } from './bank/types.ts';
import { MOOD_IDS, ROLES } from './bank/types.ts';
import { MAX_LINE_LENGTH, MAX_TITLE_LENGTH } from './edit.ts';
import { DEFAULT_SETTINGS, MAX_VERSES, cleanSettings, type Anthem, type Line, type Settings, type Stanza } from './generate.ts';
import { LINE_KINDS, METRES, METRE_IDS, SCHEME_IDS, type LineKind } from './metre.ts';

export const LINK_VERSION = 1;

/** One letter for each part a line can play, in the order of ROLES. */
const ROLE_CODES = 'asclnmz';

type PackedLine = [text: string, role: string, flags: number];
type PackedStanza = [type: 'v' | 'c', kinds: string, lines: PackedLine[]];

export interface LinkState {
  /** country */
  c?: string;
  /** themes */
  t?: string[];
  /** mood, metre, scheme: their place in the lists */
  m?: number;
  e?: number;
  r?: number;
  /** verses */
  v?: number;
  /** chorus: 0 for none */
  h?: number;
  /** words to include */
  i?: string[];
  /** the person's own stress patterns */
  o?: Record<string, string>;
  /** title, and 1 when the person wrote it */
  n?: string;
  y?: number;
  /** stanzas */
  s?: PackedStanza[];
}

/** The settings and the anthem as a link carries them. Defaults are left out. */
export function toLinkState(rawSettings: Settings, anthem: Anthem | null): LinkState {
  const s = cleanSettings(rawSettings);
  const state: LinkState = {};
  if (s.country !== '') state.c = s.country;
  if (s.themes.length > 0) state.t = [...s.themes];
  if (s.mood !== DEFAULT_SETTINGS.mood) state.m = MOOD_IDS.indexOf(s.mood);
  if (s.metre !== DEFAULT_SETTINGS.metre) state.e = METRE_IDS.indexOf(s.metre);
  if (s.scheme !== DEFAULT_SETTINGS.scheme) state.r = SCHEME_IDS.indexOf(s.scheme);
  if (s.verses !== DEFAULT_SETTINGS.verses) state.v = s.verses;
  if (!s.chorus) state.h = 0;
  if (s.include.length > 0) state.i = [...s.include];
  if (Object.keys(s.own).length > 0) state.o = { ...s.own };
  if (anthem && anthem.stanzas.length > 0) {
    state.n = anthem.title;
    if (anthem.titleTyped) state.y = 1;
    state.s = anthem.stanzas.map((stanza) => [
      stanza.type === 'chorus' ? 'c' : 'v',
      stanza.kinds.map((kind) => LINE_KINDS.indexOf(kind)).join(''),
      stanza.lines.map((line) => [line.text, ROLE_CODES[ROLES.indexOf(line.role)] ?? 's', (line.typed ? 1 : 0) + (line.locked ? 2 : 0)]),
    ]);
  }
  return state;
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const at = <T>(list: readonly T[], index: unknown, fallback: T): T => (typeof index === 'number' && Number.isInteger(index) && index >= 0 && index < list.length ? list[index]! : fallback);
const plain = (value: unknown, max: number): string => (typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');

function unpackStanza(raw: unknown): Stanza | null {
  if (!Array.isArray(raw) || raw.length !== 3) return null;
  const [type, kindCodes, rawLines] = raw as unknown[];
  if ((type !== 'v' && type !== 'c') || typeof kindCodes !== 'string' || !/^[0-3]{4}$/.test(kindCodes)) return null;
  if (!Array.isArray(rawLines) || rawLines.length !== 4) return null;
  const kinds = [...kindCodes].map((code) => LINE_KINDS[Number(code)]!) as LineKind[];
  const lines: Line[] = [];
  for (let i = 0; i < 4; i += 1) {
    const rawLine: unknown = rawLines[i];
    if (!Array.isArray(rawLine)) return null;
    const [text, role, flags] = rawLine as unknown[];
    const roleAt = typeof role === 'string' && role.length === 1 ? ROLE_CODES.indexOf(role) : -1;
    const bits = typeof flags === 'number' && Number.isInteger(flags) && flags >= 0 && flags <= 3 ? flags : 0;
    lines.push({
      text: plain(text, MAX_LINE_LENGTH),
      role: (ROLES[roleAt] ?? 'state') as Role,
      kind: kinds[i]!,
      typed: (bits & 1) === 1,
      locked: (bits & 2) === 2,
    });
  }
  return { type: type === 'c' ? 'chorus' : 'verse', kinds, lines };
}

/**
 * Reads a link's state back into settings and an anthem. Never throws. Null when the value isn't
 * a state at all; an anthem of null when the state holds settings only.
 */
export function fromLinkState(value: unknown, version: number = LINK_VERSION): { settings: Settings; anthem: Anthem | null } | null {
  if (version !== LINK_VERSION || !isObject(value)) return null;
  const strings = (list: unknown) => (Array.isArray(list) ? list.filter((item): item is string => typeof item === 'string') : []);
  let settings = cleanSettings({
    country: plain(value.c, 80),
    themes: strings(value.t).map((t) => plain(t, 40)).filter(Boolean),
    mood: at(MOOD_IDS, value.m, DEFAULT_SETTINGS.mood),
    metre: at(METRE_IDS, value.e, DEFAULT_SETTINGS.metre),
    scheme: at(SCHEME_IDS, value.r, DEFAULT_SETTINGS.scheme),
    verses: typeof value.v === 'number' ? value.v : DEFAULT_SETTINGS.verses,
    chorus: value.h !== 0,
    include: strings(value.i).map((w) => plain(w, 40)),
    own: isObject(value.o) ? (value.o as Record<string, string>) : {},
  });

  let anthem: Anthem | null = null;
  if (Array.isArray(value.s)) {
    const stanzas = value.s.slice(0, MAX_VERSES + 1).map(unpackStanza);
    const verses = stanzas.filter((st) => st?.type === 'verse').length;
    const choruses = stanzas.filter((st) => st?.type === 'chorus').length;
    // An anthem is its verses in order with at most one chorus, after the first verse.
    const wellFormed = stanzas.every((st) => st !== null) && verses >= 1 && choruses <= 1 && (choruses === 0 || stanzas[1]?.type === 'chorus');
    if (wellFormed) {
      const fixed = METRES[settings.metre].lines;
      const kindsFit = (stanzas as Stanza[]).every((st) => !fixed || st.type === 'chorus' || st.kinds.join() === fixed.join());
      if (kindsFit) {
        // The words win over the numbers: the settings follow the anthem that came with them.
        settings = { ...settings, verses, chorus: choruses === 1 };
        const title = plain(value.n, MAX_TITLE_LENGTH);
        anthem = { title: title === '' ? 'Anthem' : title, titleTyped: value.y === 1 && title !== '', stanzas: stanzas as Stanza[] };
      }
    }
  }
  return { settings, anthem };
}
