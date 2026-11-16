import { describe, expect, it } from 'vitest';
import { compileBank } from '../src/anthem/bank/compile.ts';
import { BATCHES } from '../src/anthem/bank/index.ts';
import { checkAnthem, checkLine, describeCheck, misfits, setLock, typeLine, typeTitle } from '../src/anthem/edit.ts';
import { DEFAULT_SETTINGS, generate, type Settings } from '../src/anthem/generate.ts';
import { METRE_IDS, SCHEME_IDS } from '../src/anthem/metre.ts';
import { lexicon } from './helpers.ts';

const lex = lexicon();
const { bank } = compileBank(BATCHES, lex);
const base: Settings = { ...DEFAULT_SETTINGS, country: 'Teland', own: { teland: '10' } };
const first = generate(bank, base, 8, { lexicon: lex }).anthem;

describe('checking lines as the person works', () => {
  it('finds every generated line fitting and rhyming', () => {
    for (const metre of METRE_IDS) {
      for (const scheme of SCHEME_IDS) {
        const settings = { ...base, metre, scheme, verses: 3 };
        const anthem = generate(bank, settings, 31, { lexicon: lex }).anthem;
        for (const check of checkAnthem(anthem, settings, lex).flat()) {
          expect(check.fits).toBe(true);
          expect(check.guessed).toEqual([]);
          expect(['yes', 'none']).toContain(check.rhyme);
          expect(describeCheck(check)).toMatch(/^\d of \d, fits$/);
        }
      }
    }
  });

  it('counts a typed line as it is typed', () => {
    const at = { stanza: 0, line: 1 };
    const say = (text: string) => describeCheck(checkLine(typeLine(first, at, text), base, at, lex)!);
    expect(say('Keep the lantern burning bright')).toBe('7 of 7, fits');
    expect(say('Keep the lantern burning')).toBe('6 of 7: one syllable short');
    expect(say('Keep the')).toBe('2 of 7: 5 syllables short');
    expect(say('Keep the little lantern burning bright')).toBe('9 of 7: 2 syllables too many');
    expect(say('Together we shall keep it')).toBe('7 of 7, but the stress of "Together" falls on a weak beat');
    expect(say('')).toBe('0 of 7: 7 syllables short');
  });

  it('says which words it had to guess', () => {
    const at = { stanza: 0, line: 1 };
    const check = checkLine(typeLine(first, at, 'From Selunna to the sea'), { ...base, own: {} }, at, lex)!;
    expect(check.guessed).toEqual(['Selunna']);
    const corrected = checkLine(typeLine(first, at, 'From Selunna to the sea'), { ...base, own: { selunna: '010' } }, at, lex)!;
    expect(corrected.guessed).toEqual([]);
    expect(corrected.fits).toBe(true);
  });

  it('says whether a typed line rhymes with its partner', () => {
    // ABAB: the second line rhymes with the fourth.
    const typed = typeLine(typeLine(first, { stanza: 0, line: 1 }, 'Keep the lantern burning bright'), { stanza: 0, line: 3 }, 'Guide us safely through the night');
    expect(checkLine(typed, base, { stanza: 0, line: 1 }, lex)).toMatchObject({ rhyme: 'yes', partner: 3 });
    const off = typeLine(typed, { stanza: 0, line: 3 }, 'Guide us safely through the storm');
    expect(checkLine(off, base, { stanza: 0, line: 3 }, lex)!.rhyme).toBe('no');
    const same = typeLine(typed, { stanza: 0, line: 3 }, 'Keep the harbour beacon bright');
    expect(checkLine(same, base, { stanza: 0, line: 3 }, lex)!.rhyme).toBe('no');
    const unknown = typeLine(typed, { stanza: 0, line: 3 }, 'Guide us safely to Selunna');
    expect(checkLine(unknown, base, { stanza: 0, line: 3 }, lex)!.rhyme).toBe('unknown');
    // ABCB: the first line rhymes with nothing.
    expect(checkLine(first, { ...base, scheme: 'ABCB' }, { stanza: 0, line: 0 }, lex)).toMatchObject({ rhyme: 'none', partner: -1 });
    // A line that doesn't fit the metre can still be heard to rhyme.
    const long = typeLine(typed, { stanza: 0, line: 3 }, 'Guide us ever safely through the night');
    expect(checkLine(long, base, { stanza: 0, line: 3 }, lex)).toMatchObject({ fits: false, rhyme: 'yes' });
  });

  it('lets a typed line run free in free verse, within what can be sung', () => {
    const settings = { ...base, metre: 'free' as const };
    const anthem = generate(bank, settings, 3, { lexicon: lex }).anthem;
    const at = { stanza: 0, line: 0 };
    const say = (text: string) => describeCheck(checkLine(typeLine(anthem, at, text), settings, at, lex)!);
    expect(say('We sing of the mountains and the open sea')).toBe('11 syllables');
    expect(say('We sing')).toBe('2 syllables: short for a sung line');
    expect(say('We sing of the mountains and the open sea and all the islands')).toBe('16 syllables: long for a sung line');
    expect(say('Sing')).toBe('1 syllable: short for a sung line');
  });

  it('answers null for a line that is not there', () => {
    expect(checkLine(first, base, { stanza: 9, line: 0 }, lex)).toBeNull();
    expect(checkLine(first, base, { stanza: 0, line: 7 }, lex)).toBeNull();
  });
});

describe('typing and locking', () => {
  it('marks a typed line as the person’s own, on one line of plain text', () => {
    const at = { stanza: 1, line: 2 };
    const typed = typeLine(first, at, '  Rise,\n\tO people,   rise! \u0000 ');
    expect(typed.stanzas[1]!.lines[2]).toMatchObject({ text: 'Rise, O people, rise!', typed: true });
    expect(first.stanzas[1]!.lines[2]!.typed).toBe(false);
    expect(typeLine(first, at, first.stanzas[1]!.lines[2]!.text)).toBe(first);
    expect(typeLine(first, at, 'x'.repeat(500)).stanzas[1]!.lines[2]!.text.length).toBe(120);
    expect(typeLine(first, { stanza: 9, line: 9 }, 'nowhere')).toBe(first);
  });

  it('locks and lets go', () => {
    const at = { stanza: 0, line: 0 };
    const locked = setLock(first, at, true);
    expect(locked.stanzas[0]!.lines[0]!.locked).toBe(true);
    expect(setLock(locked, at, false).stanzas[0]!.lines[0]!.locked).toBe(false);
    expect(generate(bank, base, 99, { lexicon: lex, keep: locked }).anthem.stanzas[0]!.lines[0]).toEqual(locked.stanzas[0]!.lines[0]);
  });

  it('keeps a typed title until it is cleared', () => {
    const titled = typeTitle(first, '  Steady   Against the Tide ');
    expect(titled).toMatchObject({ title: 'Steady Against the Tide', titleTyped: true });
    expect(generate(bank, base, 99, { lexicon: lex, keep: titled }).anthem.title).toBe('Steady Against the Tide');
    expect(typeTitle(titled, '   ').titleTyped).toBe(false);
  });

  it('points out kept lines that a change of metre has left behind', () => {
    const locked = setLock(first, { stanza: 0, line: 0 }, true);
    expect(misfits(locked, base, lex)).toEqual([]);
    const settings = { ...base, metre: '8686' as const };
    const next = generate(bank, settings, 5, { lexicon: lex, keep: locked }).anthem;
    // The line is still there, word for word, and flagged; nothing was silently rewritten.
    expect(next.stanzas[0]!.lines[0]!.text).toBe(first.stanzas[0]!.lines[0]!.text);
    expect(misfits(next, settings, lex)).toContainEqual({ stanza: 0, line: 0 });
  });
});
