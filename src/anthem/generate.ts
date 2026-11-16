// The generator: settings and a seed in, an anthem out.
//
// No dictionary is needed to write one: the compiled bank carries every phrase's rhythm and
// rhyme. A dictionary, when given, is used for the person's own words (the country, cities, words
// to include, lines they typed), so that those can be placed and rhymed with too.
//
// The same bank, settings, seed and kept lines always give the same anthem.

import type { Bank, End, Item, MoodId, Register, Role, SlotClass, Template } from './bank/types.ts';
import { MOOD_IDS, NAME_SHAPES, registerFor } from './bank/types.ts';
import { EMPTY_LEXICON, type Lexicon } from './lexicon.ts';
import {
  FREE_SHAPES,
  KIND_PATTERN,
  METRES,
  METRE_IDS,
  SCHEME_IDS,
  endingOf,
  rhymeGroups,
  rhymePartners,
  schemeFor,
  shapeAllows,
  type LineKind,
  type MetreId,
  type SchemeId,
} from './metre.ts';
import { lineEnd, lineEnds, rhymes, type LineEnd } from './rhyme.ts';
import { cleanWord, fitLine, scanLine, tokenise, type Overrides } from './scan.ts';

export interface Settings {
  /** The country's name as the person writes it. */
  country: string;
  themes: readonly string[];
  mood: MoodId;
  metre: MetreId;
  scheme: SchemeId;
  /** 1 to 4. */
  verses: number;
  chorus: boolean;
  /** Words to include. A capitalised word is a place or a name; a lower-case one is a thing. */
  include: readonly string[];
  /** The person's own stress patterns for made-up words. */
  own: Overrides;
}

export const DEFAULT_SETTINGS: Settings = {
  country: '',
  themes: [],
  mood: 'solemn',
  metre: '8787',
  scheme: 'ABAB',
  verses: 2,
  chorus: true,
  include: [],
  own: {},
};

export const MAX_VERSES = 4;

export interface Line {
  text: string;
  /** The part the line plays in its verse; a re-roll keeps it. */
  role: Role;
  kind: LineKind;
  /** Typed over by the person. A typed line is never rewritten. */
  typed: boolean;
  /** Kept through re-rolls and new settings. */
  locked: boolean;
}

export interface Stanza {
  type: 'verse' | 'chorus';
  kinds: readonly LineKind[];
  lines: Line[];
}

export interface Anthem {
  title: string;
  /** True when the person wrote the title themself. */
  titleTyped: boolean;
  /** In the order they are printed: the first verse, the chorus, then the other verses. */
  stanzas: Stanza[];
}

/** Things the page should tell the person, in its own words. */
export type Note =
  /** The scheme asked for can't be kept in this metre; `used` was written instead. */
  | { kind: 'scheme'; asked: SchemeId; used: SchemeId }
  /** The country's name fits no line of this metre, so the anthem doesn't say it. */
  | { kind: 'name'; name: string }
  /** No line could be found to rhyme with a line the person typed or locked. */
  | { kind: 'rhyme'; stanza: number; line: number }
  /** A re-roll found no other line that fits there, so the line stays as it was. */
  | { kind: 'only'; stanza: number; line: number }
  /** The bank ran short and a rule was relaxed for this stanza. Should not happen. */
  | { kind: 'short'; stanza: number };

export interface Result {
  anthem: Anthem;
  /** The person's words that found a place, and those that didn't. */
  placed: string[];
  unplaced: string[];
  notes: Note[];
}

export interface Options {
  /** For the person's own words and typed lines. Without one they are scanned by spelling. */
  lexicon?: Lexicon;
  /** An earlier anthem: its typed and locked lines, and a typed title, are kept where they are. */
  keep?: Anthem;
  /** Lines not to write again, as they stand: what a re-roll is replacing. */
  avoid?: readonly string[];
}

// ---------------------------------------------------------------------------------------- chance

/** A small seeded generator (mulberry32). */
export function makeRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, list: readonly T[], weight: (item: T) => number): T | undefined {
  let total = 0;
  const weights = list.map((item) => {
    const w = Math.max(0, weight(item));
    total += w;
    return w;
  });
  if (total <= 0) return undefined;
  let at = rand() * total;
  for (let i = 0; i < list.length; i += 1) {
    at -= weights[i]!;
    if (at < 0) return list[i];
  }
  return list[list.length - 1];
}

function shuffled<T>(rand: () => number, list: readonly T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// --------------------------------------------------------------------------- the nation's own words

interface OwnWord {
  text: string;
  kind: 'name' | 'place' | 'thing';
  /** For each rhythm the word can take, the rhyme it would give at a line's end, if known. */
  shapes: Map<string, End | null>;
}

function ownWord(text: string, kind: OwnWord['kind'], lex: Lexicon, own: Overrides): OwnWord {
  const words = scanLine(text, lex, own);
  const shapes = new Map<string, End | null>();
  if (words.length > 0) {
    for (const shape of NAME_SHAPES) {
      const fit = fitLine(words, shape);
      if (!fit.ok) continue;
      const end = lineEnd(words, fit.choice, shape);
      shapes.set(shape, end ? { key: end.key, onset: end.onset, word: end.word, weak: end.weak } : null);
    }
  }
  return { text, kind, shapes };
}

/** Splits "words to include" into places (capitalised) and things, without repeats. */
export function sortIncluded(include: readonly string[]): { places: string[]; things: string[] } {
  const places: string[] = [];
  const things: string[] = [];
  const seen = new Set<string>();
  for (const raw of include) {
    const text = raw.trim().replace(/\s+/g, ' ');
    const key = cleanWord(text.replace(/\s/g, '-'));
    if (key === '' || seen.has(key)) continue;
    seen.add(key);
    if (/^\p{Lu}/u.test(text)) places.push(text);
    else things.push(text);
  }
  return { places, things };
}

// ------------------------------------------------------------------------------------- verse plans

type Plan = readonly [Role, Role, Role, Role];
type Couplet = readonly [Role, Role];

const COUPLETS: readonly Couplet[] = [
  ['address', 'state'],
  ['address', 'call'],
  ['lead', 'state'],
  ['lead', 'call'],
  ['state', 'cont'],
  ['state', 'state'],
  ['call', 'contCall'],
  ['call', 'call'],
];
// A last line follows a whole sentence or a name, never a bare opening: "Wherever hills and
// valleys lie, / Now and always, strong and free" leaves the opening hanging.
const LAST_COUPLETS: readonly Couplet[] = [
  ['address', 'close'],
  ['state', 'close'],
  ['call', 'close'],
  ['state', 'cont'],
  ['call', 'contCall'],
  ['lead', 'state'],
  ['lead', 'call'],
];

/** The mark after each line. A couplet runs on with a comma, or balances on a semicolon. */
function marks(plan: Plan): [string, string, string, string] {
  const inside = (a: Role, b: Role) => (a === 'state' && (b === 'state' || b === 'close') ? ';' : a === 'call' && b === 'close' ? ';' : ',');
  return [inside(plan[0], plan[1]), ';', inside(plan[2], plan[3]), '.'];
}

// ----------------------------------------------------------------------------------------- context

interface Ctx {
  bank: Bank;
  s: Settings;
  scheme: SchemeId;
  reg: Register;
  themes: Set<string>;
  lex: Lexicon;
  rand: () => number;
  name: OwnWord | null;
  places: OwnWord[];
  things: OwnWord[];
  eligible: Map<string, Item[]>;
  hasEmu: boolean;
}

/** What has been used so far, so that nothing comes twice. Copied for each attempt at a stanza. */
interface Used {
  templates: Set<string>;
  endWords: Set<string>;
  keys: Set<string>;
  phrases: Map<string, number>;
  texts: Set<string>;
  placed: Set<string>;
}

function copyUsed(u: Used): Used {
  return {
    templates: new Set(u.templates),
    endWords: new Set(u.endWords),
    keys: new Set(u.keys),
    phrases: new Map(u.phrases),
    texts: new Set(u.texts),
    placed: new Set(u.placed),
  };
}

function itemFits(ctx: Ctx, item: Item): boolean {
  if (item.themes.length > 0 && !item.themes.some((t) => ctx.themes.has(t))) return false;
  if (item.moods.length > 0 && !item.moods.includes(ctx.s.mood)) return false;
  return item.reg === null || item.reg === ctx.reg;
}

function eligibleItems(ctx: Ctx, cls: SlotClass): Item[] {
  let list = ctx.eligible.get(cls.id);
  if (!list) {
    list = cls.items.filter((item) => itemFits(ctx, item));
    ctx.eligible.set(cls.id, list);
  }
  return list;
}

interface Spec {
  role: Role;
  kind: LineKind;
  chorus: boolean;
  /** This line must say the country's name; the others must not. */
  needName: boolean;
  /** Who the stanza speaks to. */
  to: string;
  /** The theme this stanza leans on. */
  focus: string | null;
  /** The line must come from a template of this theme (the emu's last line). */
  must: string | null;
}

/** One way to write a line: a template and what it ends on. */
interface Cand {
  t: Template;
  end: End | null;
  /** The phrase for the last slot, when the line ends in a slot. */
  endText: string | null;
  /** The person's word used for the ending, if it is one. */
  endOwn: OwnWord | null;
  w: number;
}

function placesFor(ctx: Ctx, used: Used, cls: string): OwnWord[] {
  const shape = cls.slice(cls.indexOf('.') + 1);
  return ctx.places.filter((p) => p.shapes.has(shape) && !used.placed.has(p.text));
}

function thingsFor(ctx: Ctx, used: Used, cls: SlotClass): OwnWord[] {
  return ctx.things.filter((t) => t.shapes.has(cls.pattern) && !used.placed.has(t.text));
}

function templateWeight(ctx: Ctx, used: Used, spec: Spec, t: Template): number {
  if (t.role !== spec.role || t.kind !== spec.kind) return 0;
  if (spec.must !== null && !t.themes.includes(spec.must)) return 0;
  if (spec.must === null && t.themes.includes('emu')) return 0;
  if (t.moods.length > 0 && !t.moods.includes(ctx.s.mood)) return 0;
  if (t.reg !== null && t.reg !== ctx.reg) return 0;
  if (t.themes.length > 0 && !t.themes.some((theme) => ctx.themes.has(theme))) return 0;
  if (t.chorus === 'only' && !spec.chorus) return 0;
  if (t.chorus === 'never' && spec.chorus) return 0;
  if (t.role === 'address' && (t.to ?? 'land') !== spec.to) return 0;
  if ((t.role === 'call' || t.role === 'contCall') && t.to !== null && t.to !== spec.to) return 0;
  if (t.nameCls !== null) {
    if (!spec.needName || !ctx.name) return 0;
    if (!ctx.name.shapes.has(t.nameCls.slice(t.nameCls.indexOf('.') + 1))) return 0;
  } else if (spec.needName) return 0;

  let w = 1;
  if (t.placeCls.length > 0) {
    const need = new Map<string, number>();
    for (const cls of t.placeCls) need.set(cls, (need.get(cls) ?? 0) + 1);
    for (const [cls, n] of need) if (placesFor(ctx, used, cls).length < n) return 0;
    w *= 8;
  }
  for (const part of t.parts) {
    if (!('cls' in part)) continue;
    const cls = ctx.bank.classes[part.cls]!;
    if (cls.runtime) continue;
    if (eligibleItems(ctx, cls).length === 0) return 0;
    if (part.open && thingsFor(ctx, used, cls).length > 0) w *= 3;
  }
  if (spec.focus !== null && t.themes.includes(spec.focus)) w *= 4;
  else if (t.themes.length > 0) w *= 2;
  if (t.moods.length > 0) w *= 2;
  if (t.chorus === 'only') w *= 4;
  if (used.templates.has(t.id)) w *= 0.01;
  return w;
}

function itemWeight(ctx: Ctx, used: Used, spec: Spec, item: Item): number {
  let w = 1;
  if (item.themes.length > 0) w *= spec.focus !== null && item.themes.includes(spec.focus) ? 7 : 3;
  if (item.moods.length > 0) w *= 1.5;
  const times = used.phrases.get(item.text) ?? 0;
  if (times > 0) w *= 0.04 ** times;
  return w;
}

/** Every way to write a line that the rules allow, with what each ends on. */
function candidates(ctx: Ctx, used: Used, spec: Spec): Cand[] {
  const out: Cand[] = [];
  for (const t of ctx.bank.templates) {
    const tw = templateWeight(ctx, used, spec, t);
    if (tw <= 0) continue;
    if (t.endCls === null) {
      out.push({ t, end: t.endLit, endText: null, endOwn: null, w: tw });
      continue;
    }
    const cls = ctx.bank.classes[t.endCls]!;
    const shape = cls.pattern;
    if (cls.runtime === 'name') {
      out.push({ t, end: ctx.name!.shapes.get(shape) ?? null, endText: ctx.name!.text, endOwn: null, w: tw });
      continue;
    }
    if (cls.runtime === 'place') {
      const places = placesFor(ctx, used, cls.id);
      for (const place of places) out.push({ t, end: place.shapes.get(shape) ?? null, endText: place.text, endOwn: place, w: tw / places.length });
      continue;
    }
    const items = eligibleItems(ctx, cls);
    const weights = items.map((item) => itemWeight(ctx, used, spec, item));
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    const spelt = wordsOf(t);
    items.forEach((item, i) => {
      if (!spelt.has(item.text)) out.push({ t, end: item.end, endText: item.text, endOwn: null, w: (tw * weights[i]!) / total });
    });
    const last = t.parts[t.parts.length - 1]!;
    if ('cls' in last && last.open) {
      for (const thing of thingsFor(ctx, used, cls)) out.push({ t, end: thing.shapes.get(shape) ?? null, endText: thing.text, endOwn: thing, w: tw * 0.6 });
    }
  }
  return out;
}

const writtenWords = new WeakMap<Template, Set<string>>();

/** The words a template spells out, so that a slot doesn't say one of them again. */
function wordsOf(t: Template): Set<string> {
  let words = writtenWords.get(t);
  if (!words) {
    words = new Set(t.parts.flatMap((p) => ('lit' in p ? tokenise(p.lit).map(cleanWord) : [])));
    writtenWords.set(t, words);
  }
  return words;
}

function endWordOf(cand: Cand): string {
  if (cand.end) return cand.end.word;
  const text = cand.endText ?? '';
  return cleanWord(tokenise(text).pop() ?? text);
}

function asLineEnd(end: End, kind: LineKind): LineEnd {
  return { ...end, kind: endingOf(kind) };
}

function upperFirst(text: string): string {
  return text.replace(/\p{L}/u, (c) => c.toUpperCase());
}

/** Fills a line's slots and returns its words, or null when a slot can't be filled. */
function write(ctx: Ctx, used: Used, spec: Spec, cand: Cand): string | null {
  const t = cand.t;
  const inLine = new Set<string>(wordsOf(t));
  if (cand.endText !== null) inLine.add(cand.endText);
  let text = '';
  const lastIndex = t.parts.length - 1;
  for (let i = 0; i < t.parts.length; i += 1) {
    const part = t.parts[i]!;
    if ('lit' in part) {
      text += part.lit;
      continue;
    }
    if (i === lastIndex && cand.endText !== null) {
      text += cand.endText;
      if (cand.endOwn) used.placed.add(cand.endOwn.text);
      else used.phrases.set(cand.endText, (used.phrases.get(cand.endText) ?? 0) + 1);
      continue;
    }
    const cls = ctx.bank.classes[part.cls]!;
    if (cls.runtime === 'name') {
      text += ctx.name!.text;
      continue;
    }
    if (cls.runtime === 'place') {
      const place = pick(ctx.rand, placesFor(ctx, used, cls.id).filter((p) => !inLine.has(p.text)), () => 1);
      if (!place) return null;
      used.placed.add(place.text);
      inLine.add(place.text);
      text += place.text;
      continue;
    }
    if (part.open) {
      const things = thingsFor(ctx, used, cls).filter((thing) => !inLine.has(thing.text));
      if (things.length > 0 && ctx.rand() < 0.8) {
        const thing = pick(ctx.rand, things, () => 1)!;
        used.placed.add(thing.text);
        inLine.add(thing.text);
        text += thing.text;
        continue;
      }
    }
    const item = pick(ctx.rand, eligibleItems(ctx, cls).filter((it) => !inLine.has(it.text)), (it) => itemWeight(ctx, used, spec, it));
    if (!item) return null;
    inLine.add(item.text);
    used.phrases.set(item.text, (used.phrases.get(item.text) ?? 0) + 1);
    text += item.text;
  }
  return upperFirst(text);
}

// ------------------------------------------------------------------------------------- one stanza

interface KeptLine {
  line: Line;
  ends: LineEnd[];
  endWord: string;
}

interface StanzaJob {
  index: number;
  type: 'verse' | 'chorus';
  kinds: readonly LineKind[];
  verseNumber: number;
  needName: boolean;
  focus: string | null;
  kept: (KeptLine | null)[];
  /** The part each line must play, where that is already settled. */
  roles: (Role | null)[];
  emu: boolean;
}

function choosePlan(ctx: Ctx, job: StanzaJob): Plan {
  const keptRoles = job.roles;
  const opening = job.type === 'chorus' || job.verseNumber === 0;
  const plans: { plan: Plan; w: number }[] = [];
  for (const a of COUPLETS) {
    for (const b of LAST_COUPLETS) {
      const plan: Plan = [a[0], a[1], b[0], b[1]];
      if (plan.some((role, i) => keptRoles[i] !== null && keptRoles[i] !== role)) continue;
      // A kept line keeps its closing mark, so the line after it must still follow from it.
      const closing = marks(plan);
      if (job.kept.some((k, i) => k !== null && !k.line.typed && /[,;.]$/.test(k.line.text) && !k.line.text.endsWith(closing[i]!))) continue;
      let w = 1;
      // An address belongs at the top; one a stanza is plenty.
      if (b[0] === 'address') w *= a[0] === 'address' ? 0 : 0.25;
      if (a[0] === 'address') w *= opening ? 3 : 0.5;
      if (opening && job.verseNumber === 0 && job.type === 'verse' && a[0] !== 'address' && a[0] !== 'lead') w *= 0.3;
      if (b[1] === 'close') w *= 3;
      if (job.emu && b[1] !== 'close') w = 0;
      if (a[0] === b[0] && a[1] === b[1]) w *= 0.3;
      if (w > 0) plans.push({ plan, w });
    }
  }
  const chosen = pick(ctx.rand, plans, (p) => p.w);
  if (chosen) return chosen.plan;
  // Kept lines whose roles fit no plan: keep theirs and fill round them.
  const fallback: Plan = ['state', 'cont', 'call', 'close'];
  return fallback.map((role, i) => keptRoles[i] ?? role) as unknown as Plan;
}

interface Written {
  lines: Line[];
  used: Used;
  rhymeMissed: number[];
}

/** One attempt at a stanza. Null when it can't be done under the rules in force. */
function tryStanza(ctx: Ctx, job: StanzaJob, base: Used, strict: boolean): Written | null {
  const used = copyUsed(base);
  const plan = choosePlan(ctx, job);
  const hasAddress = plan.includes('address');
  const to = hasAddress || ctx.rand() < 0.75 ? 'land' : 'people';
  const punct = marks(plan);

  // Which line says the name.
  let nameLine = -1;
  if (job.needName && ctx.name) {
    const order = [0, ...shuffled(ctx.rand, [1, 2, 3])];
    for (const i of order) {
      if (job.kept[i]) continue;
      const spec: Spec = { role: plan[i]!, kind: job.kinds[i]!, chorus: job.type === 'chorus', needName: true, to, focus: job.focus, must: null };
      if (ctx.bank.templates.some((t) => templateWeight(ctx, used, spec, t) > 0)) {
        nameLine = i;
        break;
      }
    }
    if (nameLine === -1 && strict) return null;
  }

  const specs: Spec[] = plan.map((role, i) => ({
    role,
    kind: job.kinds[i]!,
    chorus: job.type === 'chorus',
    needName: i === nameLine,
    to,
    focus: job.focus,
    must: job.emu && i === 3 ? 'emu' : null,
  }));
  const chosen: (Cand | null)[] = [null, null, null, null];
  const rhymeMissed: number[] = [];
  const takenWords = new Set<string>();
  for (const kept of job.kept) if (kept) takenWords.add(kept.endWord);

  const free = (cand: Cand) => {
    const word = endWordOf(cand);
    return !takenWords.has(word) && (!strict || !used.endWords.has(word));
  };
  const take = (i: number, cand: Cand) => {
    chosen[i] = cand;
    takenWords.add(endWordOf(cand));
    used.templates.add(cand.t.id);
    if (cand.end) used.keys.add(cand.end.key);
  };

  const groups = rhymeGroups(ctx.scheme);
  const grouped = new Set(groups.flat());
  // The group with the name line first: it has the fewest ways to go.
  const ordered = [...groups].sort((a, b) => Number(b.includes(nameLine)) - Number(a.includes(nameLine)));
  for (const group of ordered) {
    const [i, j] = group as [number, number];
    const keptI = job.kept[i];
    const keptJ = job.kept[j];
    if (keptI && keptJ) continue;
    if (keptI || keptJ) {
      const kept = (keptI ?? keptJ)!;
      const at = keptI ? j : i;
      const all = candidates(ctx, used, specs[at]!).filter(free);
      const matching = all.filter((c) => c.end && kept.ends.some((e) => rhymes(e, asLineEnd(c.end!, specs[at]!.kind))));
      const cand = pick(ctx.rand, matching, (c) => c.w * (c.end!.weak ? 0.2 : 1));
      if (cand) take(at, cand);
      else if (strict) return null;
      else {
        // Nothing rhymes with the kept line: write the line anyway and say so.
        const any = pick(ctx.rand, all, (c) => c.w);
        if (!any) return null;
        take(at, any);
        rhymeMissed.push(at);
      }
      continue;
    }
    const candsI = candidates(ctx, used, specs[i]!).filter((c) => c.end && free(c));
    const candsJ = candidates(ctx, used, specs[j]!).filter((c) => c.end && free(c));
    const byKeyJ = new Map<string, Cand[]>();
    for (const c of candsJ) {
      const list = byKeyJ.get(c.end!.key);
      if (list) list.push(c);
      else byKeyJ.set(c.end!.key, [c]);
    }
    const pairs = (a: Cand) => (byKeyJ.get(a.end!.key) ?? []).filter((b) => b.end!.word !== a.end!.word && b.end!.onset !== a.end!.onset && b.t.id !== a.t.id);
    const weightI = (a: Cand) => {
      const partners = pairs(a);
      if (partners.length === 0) return 0;
      // A rhyme sound heard already is a last resort, though the words would differ.
      const fresh = used.keys.has(a.end!.key) ? 0.02 : 1;
      const sum = partners.reduce((n, b) => n + b.w * (b.end!.weak ? 0.2 : 1), 0);
      return a.w * (a.end!.weak ? 0.2 : 1) * fresh * Math.sqrt(sum);
    };
    const a = pick(ctx.rand, candsI, weightI);
    if (!a) return null;
    const b = pick(ctx.rand, pairs(a), (c) => c.w * (c.end!.weak ? 0.2 : 1));
    if (!b) return null;
    take(i, a);
    take(j, b);
  }
  for (let i = 0; i < 4; i += 1) {
    if (grouped.has(i) || job.kept[i] || chosen[i]) continue;
    // A line outside the scheme shouldn't chime with the lines inside it.
    const cand = pick(ctx.rand, candidates(ctx, used, specs[i]!).filter(free), (c) => c.w * (c.end && used.keys.has(c.end.key) ? 0.1 : 1));
    if (!cand) return null;
    take(i, cand);
  }

  const lines: Line[] = [];
  for (let i = 0; i < 4; i += 1) {
    const kept = job.kept[i];
    if (kept) {
      lines.push(kept.line);
      used.texts.add(kept.line.text);
      continue;
    }
    const cand = chosen[i];
    if (!cand) return null;
    const words = write(ctx, used, specs[i]!, cand);
    if (words === null) return null;
    const text = words + punct[i]!;
    if (used.texts.has(text) && strict) return null;
    used.texts.add(text);
    used.endWords.add(endWordOf(cand));
    lines.push({ text, role: plan[i]!, kind: job.kinds[i]!, typed: false, locked: false });
  }
  for (const kept of job.kept) if (kept) used.endWords.add(kept.endWord);
  return { lines, used, rhymeMissed };
}

// ---------------------------------------------------------------------------------------- titles

const SMALL_WORDS = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'of', 'to', 'in', 'on', 'by', 'for', 'from', 'with', 'at', 'as']);

/** Title Case: every word capitalised but the small ones in the middle. */
export function titleCase(text: string): string {
  const words = text.trim().split(/\s+/);
  return words
    .map((word, i) => {
      const bare = word.toLowerCase().replace(/[^\p{L}']/gu, '');
      if (i > 0 && i < words.length - 1 && SMALL_WORDS.has(bare)) return word.toLowerCase();
      return upperFirst(word);
    })
    .join(' ');
}

function writeTitle(ctx: Ctx, stanzas: readonly Stanza[]): string {
  const lyrics = ` ${stanzas.flatMap((s) => s.lines.map((l) => l.text.toLowerCase())).join(' ')} `.replace(/[^\p{L}' ]/gu, ' ');
  const country = ctx.s.country.trim();
  const usable = ctx.bank.titles.filter((t) => {
    if (t.themes.length > 0 && !t.themes.some((theme) => ctx.themes.has(theme))) return false;
    if (t.parts.some((p) => 'name' in p) && country === '') return false;
    return t.parts.every((p) => !('cls' in p) || eligibleItems(ctx, ctx.bank.classes[p.cls]!).length > 0);
  });
  const template = pick(ctx.rand, usable, (t) => (t.themes.length > 0 ? 3 : 1));
  if (!template) return country === '' ? 'Anthem' : titleCase(`Song of ${country}`);
  const taken = new Set<string>();
  let text = '';
  for (const part of template.parts) {
    if ('lit' in part) text += part.lit;
    else if ('name' in part) text += country;
    else {
      const items = eligibleItems(ctx, ctx.bank.classes[part.cls]!).filter((item) => !taken.has(item.text));
      // A title should sound like its anthem: favour words the lyrics use.
      const item = pick(ctx.rand, items, (it) => (lyrics.includes(` ${it.text} `) ? 10 : 1) * (it.themes.length > 0 ? 3 : 1));
      if (item) {
        taken.add(item.text);
        text += item.text;
      }
    }
  }
  return titleCase(text);
}

// ----------------------------------------------------------------------------------- the whole anthem

function keptLine(ctx: Ctx, line: Line, kind: LineKind = line.kind): KeptLine {
  const words = scanLine(line.text, ctx.lex, ctx.s.own);
  const pattern = ctx.s.metre === 'free' && line.typed ? null : KIND_PATTERN[kind];
  const ends = lineEnds(words, pattern);
  const endWord = ends[0]?.word ?? words[words.length - 1]?.word ?? '';
  return { line, ends, endWord };
}

/** The settings as the generator will use them: trimmed, clamped, nothing unexpected. */
export function cleanSettings(s: Settings): Settings {
  const verses = Number.isFinite(s.verses) ? Math.min(MAX_VERSES, Math.max(1, Math.round(s.verses))) : DEFAULT_SETTINGS.verses;
  const text = (value: unknown) => (typeof value === 'string' ? value : '');
  const list = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []);
  const own: Record<string, string> = {};
  if (s.own && typeof s.own === 'object') {
    for (const [word, stress] of Object.entries(s.own).slice(0, 40)) {
      if (typeof stress === 'string' && /^[012]{1,12}$/.test(stress)) own[cleanWord(word)] = stress;
    }
  }
  return {
    country: text(s.country).trim().replace(/\s+/g, ' ').slice(0, 80),
    themes: [...new Set(list(s.themes))].slice(0, 12),
    mood: (MOOD_IDS as readonly string[]).includes(s.mood) ? s.mood : DEFAULT_SETTINGS.mood,
    metre: (METRE_IDS as readonly string[]).includes(s.metre) ? s.metre : DEFAULT_SETTINGS.metre,
    scheme: (SCHEME_IDS as readonly string[]).includes(s.scheme) ? s.scheme : DEFAULT_SETTINGS.scheme,
    verses,
    chorus: s.chorus !== false,
    include: list(s.include).map((w) => w.trim().replace(/\s+/g, ' ').slice(0, 40)).filter(Boolean).slice(0, 12),
    own,
  };
}

function prepare(bank: Bank, settings: Settings, seed: number, lex: Lexicon): Ctx {
  const s = cleanSettings(settings);
  const { places, things } = sortIncluded(s.include);
  const hasEmu = s.themes.includes('emu') && s.chorus && bank.templates.some((t) => t.themes.includes('emu') && t.role === 'close' && t.kind === 'I8');
  return {
    bank,
    s,
    scheme: schemeFor(s.metre, s.scheme),
    reg: registerFor(s.mood),
    themes: new Set(s.themes),
    lex,
    rand: makeRandom(seed),
    name: s.country === '' ? null : ownWord(s.country, 'name', lex, s.own),
    places: places.map((text) => ownWord(text, 'place', lex, s.own)),
    things: things.map((text) => ownWord(text, 'thing', lex, s.own)),
    eligible: new Map(),
    hasEmu,
  };
}

/**
 * Writes an anthem. Lines that are typed or locked in `options.keep` stay exactly as they are,
 * and the new lines are written to rhyme with them where the scheme asks.
 */
export function generate(bank: Bank, settings: Settings, seed: number, options: Options = {}): Result {
  const ctx = prepare(bank, settings, seed, options.lexicon ?? EMPTY_LEXICON);
  const { s } = ctx;
  const notes: Note[] = [];
  if (ctx.scheme !== s.scheme) notes.push({ kind: 'scheme', asked: s.scheme, used: ctx.scheme });

  const order: ('verse' | 'chorus')[] = [];
  for (let v = 0; v < s.verses; v += 1) {
    order.push('verse');
    if (v === 0 && s.chorus) order.push('chorus');
  }
  const keepVerses = options.keep?.stanzas.filter((st) => st.type === 'verse') ?? [];
  const keepChorus = options.keep?.stanzas.find((st) => st.type === 'chorus');
  const themeList = s.themes.filter((t) => t !== 'emu');
  const freeShapes = FREE_SHAPES.filter((shape) => shapeAllows(shape, ctx.scheme));

  let used: Used = { templates: new Set(), endWords: new Set(), keys: new Set(), phrases: new Map(), texts: new Set(), placed: new Set() };
  for (const text of options.avoid ?? []) used.texts.add(text);
  // What the kept lines end on is taken from the start, wherever they stand.
  keepVerses.slice(0, s.verses).concat(s.chorus && keepChorus ? [keepChorus] : []).forEach((st) => {
    for (const line of st.lines) if (line.typed || line.locked) used.endWords.add(keptLine(ctx, line).endWord);
  });
  const stanzas: Stanza[] = [];
  let verseNumber = 0;

  order.forEach((type, index) => {
    const before = type === 'chorus' ? keepChorus : keepVerses[verseNumber];
    const emu = type === 'chorus' && ctx.hasEmu;
    const beforeKept = before?.lines.some((l) => l.typed || l.locked) ?? false;
    let kinds: readonly LineKind[];
    if (emu) kinds = METRES['8888'].lines!;
    else if (METRES[s.metre].lines) kinds = METRES[s.metre].lines!;
    // In free verse a stanza with kept lines keeps its shape.
    else if (before && beforeKept && before.kinds.length === 4 && shapeAllows(before.kinds, ctx.scheme)) kinds = before.kinds;
    else kinds = pick(ctx.rand, freeShapes, () => 1)!;

    const kept: (KeptLine | null)[] = [0, 1, 2, 3].map((i) => {
      const line = before?.lines[i];
      // A kept line takes the place's line shape; whether it still fits is for the page to say.
      return line && (line.typed || line.locked) ? keptLine(ctx, { ...line, kind: kinds[i]! }) : null;
    });
    // Kept lines keep the part they play; the lines written round them take whichever parts make
    // sentences with them.
    const roles = kept.map((k) => k?.line.role ?? null);
    // The name belongs in the chorus; without a chorus, in the first verse. A kept line may say
    // it already.
    const home = s.chorus ? type === 'chorus' : type === 'verse' && verseNumber === 0;
    const saidAlready = ctx.name !== null && kept.some((k) => k?.line.text.includes(ctx.name!.text));
    const job: StanzaJob = {
      index,
      type,
      kinds,
      verseNumber: type === 'verse' ? verseNumber : -1,
      needName: ctx.name !== null && home && !saidAlready,
      focus: themeList.length > 0 ? themeList[index % themeList.length]! : null,
      kept,
      roles,
      emu,
    };

    // While some of the person's words are still waiting for a place, write the stanza several
    // ways and keep the one that places most (two a stanza is enough: they should spread out).
    const waiting = [...ctx.places, ...ctx.things].some((w) => !used.placed.has(w.text));
    const attempt = (theJob: StanzaJob, strict: boolean, tries: number, wanted: number): Written | null => {
      let bestWritten: Written | null = null;
      let best = -1;
      for (let n = 0, found = 0; n < tries && found < wanted; n += 1) {
        const one = tryStanza(ctx, theJob, used, strict);
        if (!one) continue;
        found += 1;
        const score = Math.min(2, one.used.placed.size - used.placed.size);
        if (score > best) {
          best = score;
          bestWritten = one;
        }
        if (score >= 2) break;
      }
      return bestWritten;
    };
    // In order of preference: with the name; without it; and last, with a rule relaxed.
    let written = attempt(job, true, 200, waiting ? 8 : 1);
    if (!written && job.needName) written = attempt({ ...job, needName: false }, true, 200, waiting ? 8 : 1);
    if (!written) {
      written = attempt({ ...job, needName: false }, false, 300, 1);
      // A line that can't rhyme with a kept one is reported as that. Anything else is the bank
      // running short.
      if (!written || written.rhymeMissed.length === 0) notes.push({ kind: 'short', stanza: index });
    }
    if (written) {
      used = written.used;
      for (const line of written.rhymeMissed) notes.push({ kind: 'rhyme', stanza: index, line });
      stanzas.push({ type, kinds, lines: written.lines });
    } else {
      // Nothing at all could be written: keep what the person had, and leave the rest empty.
      stanzas.push({
        type,
        kinds,
        lines: [0, 1, 2, 3].map((i) => kept[i]?.line ?? { text: '', role: 'state', kind: kinds[i]!, typed: false, locked: false }),
      });
    }
    if (type === 'verse') verseNumber += 1;
  });

  if (ctx.name && !stanzas.some((st) => st.lines.some((l) => l.text.includes(ctx.name!.text)))) notes.push({ kind: 'name', name: ctx.name.text });

  const ownWords = [...ctx.places, ...ctx.things].map((w) => w.text);
  // A kept line may already say one of the words.
  const said = new Set(stanzas.flatMap((st) => st.lines.flatMap((l) => tokenise(l.text).map(cleanWord))));
  const isPlaced = (text: string) => used.placed.has(text) || tokenise(text).every((w) => said.has(cleanWord(w)));
  const title = options.keep?.titleTyped ? options.keep.title : writeTitle(ctx, stanzas);
  return {
    anthem: { title, titleTyped: options.keep?.titleTyped ?? false, stanzas },
    placed: ownWords.filter(isPlaced),
    unplaced: ownWords.filter((w) => !isPlaced(w)),
    notes,
  };
}

/**
 * Writes one line again and leaves every other line as it is. The new line keeps the metre, makes
 * a sentence with its neighbours, and rhymes with its partner where the scheme asks.
 */
export function rerollLine(bank: Bank, settings: Settings, anthem: Anthem, at: { stanza: number; line: number }, seed: number, options: Options = {}): Result {
  const target = anthem.stanzas[at.stanza]?.lines[at.line];
  if (!target) return { anthem, placed: [], unplaced: [], notes: [] };
  // Lock everything but the target, write, then give the locks back as they were.
  const frozen: Anthem = {
    ...anthem,
    titleTyped: true,
    stanzas: anthem.stanzas.map((st, si) => ({
      ...st,
      lines: st.lines.map((line, li) => (si === at.stanza && li === at.line ? { ...line, typed: false, locked: false } : { ...line, locked: true })),
    })),
  };
  const result = generate(bank, settings, seed, { ...options, keep: frozen, avoid: [target.text] });
  // Better the line the person had than one that breaks a rule to be different. (When the line
  // it should rhyme with is one the person typed, a missed rhyme is theirs to settle.)
  const partner = anthem.stanzas[at.stanza]!.lines[rhymePartners(schemeFor(cleanSettings(settings).metre, cleanSettings(settings).scheme))[at.line as 0 | 1 | 2 | 3] ?? -1];
  const missed = result.notes.some((n) => n.kind === 'rhyme' && n.stanza === at.stanza && n.line === at.line) && !partner?.typed;
  if (missed || result.notes.some((n) => n.kind === 'short')) {
    return { anthem, placed: result.placed, unplaced: result.unplaced, notes: [{ kind: 'only', stanza: at.stanza, line: at.line }] };
  }
  const stanzas = result.anthem.stanzas.map((st, si) => ({
    ...st,
    lines: st.lines.map((line, li) => {
      const was = anthem.stanzas[si]?.lines[li];
      if (si === at.stanza && li === at.line) return line;
      return was ? { ...line, locked: was.locked } : line;
    }),
  }));
  return { ...result, anthem: { title: anthem.title, titleTyped: anthem.titleTyped, stanzas } };
}
