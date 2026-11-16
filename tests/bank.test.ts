import { describe, expect, it } from 'vitest';
import { classPattern, compileBank, reviewedOnly } from '../src/anthem/bank/compile.ts';
import { BATCHES } from '../src/anthem/bank/index.ts';
import { MOOD_IDS, NAME_SHAPES, registerFor, type BatchSource, type Role } from '../src/anthem/bank/types.ts';
import { EMPTY_LEXICON } from '../src/anthem/lexicon.ts';
import type { LineKind } from '../src/anthem/metre.ts';
import { lexicon } from './helpers.ts';

const lex = lexicon();
const { bank, problems } = compileBank(BATCHES, lex);

describe('the phrase bank', () => {
  it('compiles without a single problem', () => {
    expect(problems).toEqual([]);
  });

  it('knows what every line and every line-ending phrase rhymes on', () => {
    for (const t of bank.templates) expect(t.endCls !== null || t.endLit !== null, t.source).toBe(true);
    for (const cls of Object.values(bank.classes)) {
      if (!(cls.pattern.endsWith('S') || cls.pattern.endsWith('Sw'))) continue;
      for (const item of cls.items) expect(item.end, `${item.text} in ${cls.id}`).not.toBeNull();
    }
  });

  it('writes no line twice', () => {
    const seen = new Set<string>();
    for (const t of bank.templates) {
      expect(seen.has(t.source), t.source).toBe(false);
      seen.add(t.source);
    }
  });

  it('has enough plain phrases in every class for every mood', () => {
    // A slot must be fillable when no theme is chosen, whatever the mood.
    const used = new Set(bank.templates.flatMap((t) => t.parts.flatMap((p) => ('cls' in p ? [p.cls] : []))));
    for (const mood of MOOD_IDS) {
      const reg = registerFor(mood);
      for (const id of used) {
        const cls = bank.classes[id]!;
        if (cls.runtime) continue;
        const plain = cls.items.filter((i) => i.themes.length === 0 && (i.moods.length === 0 || i.moods.includes(mood)) && (i.reg === null || i.reg === reg));
        expect(plain.length, `${id} in ${mood}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('has lines for every part of a verse in every line shape, in every mood', () => {
    // Eights that end weak only open a couplet; sixes only close one.
    const opens: Role[] = ['address', 'state', 'call', 'lead'];
    const closes: Role[] = ['state', 'call', 'cont', 'contCall', 'close'];
    const need: [LineKind, Role[]][] = [
      ['T8', opens],
      ['T7', [...opens, 'cont', 'contCall', 'close']],
      ['I8', [...opens, 'cont', 'contCall', 'close']],
      ['I6', closes],
    ];
    for (const mood of MOOD_IDS) {
      const reg = registerFor(mood);
      for (const [kind, roles] of need) {
        for (const role of roles) {
          const lines = bank.templates.filter(
            (t) => t.kind === kind && t.role === role && t.nameCls === null && t.placeCls.length === 0 && t.themes.length === 0 && (t.moods.length === 0 || t.moods.includes(mood)) && (t.reg === null || t.reg === reg),
          );
          expect(lines.length, `${role} lines in ${kind}, ${mood}`).toBeGreaterThanOrEqual(4);
        }
      }
    }
  });

  it('can say a name of every shape in every line shape that opens a stanza', () => {
    for (const shape of NAME_SHAPES) {
      for (const kind of ['T8', 'T7', 'I8'] as const) {
        const lines = bank.templates.filter((t) => t.kind === kind && t.nameCls === `name.${shape}` && t.themes.length === 0 && t.moods.length === 0 && t.reg === null);
        expect(lines.length, `name.${shape} in ${kind}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('marks which slots may take the words a person asks for', () => {
    const open = bank.templates.flatMap((t) => t.parts.filter((p) => 'cls' in p && p.open).map(() => t.source));
    expect(open.length).toBeGreaterThan(5);
    const every = bank.templates.find((t) => t.source.includes('Every {ground.S}'))!;
    expect(every.parts.some((p) => 'cls' in p && p.open)).toBe(false);
  });

  it('ships only what has been reviewed, and that part stands by itself', () => {
    for (const batch of BATCHES) expect(typeof batch.reviewed).toBe('boolean');
    const reviewed = reviewedOnly(BATCHES);
    if (reviewed.length > 0) expect(compileBank(reviewed, lex).problems).toEqual([]);
  });
});

describe('the bank compiler', () => {
  const tiny = (over: Partial<BatchSource>): BatchSource => ({ id: 't', title: 'Test', reviewed: false, classes: { 'adj.S': 'strong, free, bold' }, templates: [], ...over });
  const check = (over: Partial<BatchSource>) => compileBank([tiny(over)], lex).problems;

  it('reads a rhythm from a class id', () => {
    expect(classPattern('gift.Sw')).toBe('Sw');
    expect(classPattern('gift')).toBeNull();
    expect(classPattern('gift.xyz')).toBeNull();
  });

  it('accepts a line that scans', () => {
    expect(check({ templates: ['close T7 | Now and always, {adj.S} and {adj.S}'] })).toEqual([]);
  });

  it('refuses a line with the wrong count or the wrong stress', () => {
    expect(check({ templates: ['close T7 | Now and for always, {adj.S} and {adj.S}'] })[0]).toMatch(/doesn't fit T7/);
    expect(check({ templates: ['close T7 | Together now, {adj.S} and {adj.S}'] })[0]).toMatch(/doesn't fit T7/);
  });

  it('refuses a phrase that does not fit its class', () => {
    expect(check({ classes: { 'adj.S': 'strong, free, steadfast' } })[0]).toMatch(/steadfast.*doesn't fit S/);
    expect(check({ classes: { 'adj.Sw': 'steadfast, loyal, sublime' } })[0]).toMatch(/sublime.*weak beat/);
  });

  it('refuses words it does not know, unknown classes, tags and shapes', () => {
    expect(check({ classes: { 'adj.S': 'strong, free, zorp' } })[0]).toMatch(/zorp.*dictionary/);
    expect(check({ classes: { 'adj.S': 'strong, free, zorp' }, own: { zorp: '1' } })).toEqual([]);
    expect(check({ templates: ['close T7 | Now and always, {nope.S} and {adj.S}'] })[0]).toMatch(/no class "nope.S"/);
    expect(check({ templates: ['shout T7 | Now and always, {adj.S} and {adj.S}'] })[0]).toMatch(/role kind/);
    expect(check({ templates: ['close T7 | Now and always, {adj.S} and {adj.S} @jolly'] })[0]).toMatch(/unknown tag @jolly/);
    expect(check({ classes: { 'adj.S': 'strong, free, bold', 'name.Sw': 'Teland' } })[0]).toMatch(/takes no phrases/);
    expect(check({ classes: { 'adj.S': 'strong, strong, bold' } })[0]).toMatch(/listed twice/);
  });

  it('refuses everything when it has no dictionary, and says why', () => {
    const none = compileBank(BATCHES, EMPTY_LEXICON);
    expect(none.problems.length).toBeGreaterThan(100);
  });
});
