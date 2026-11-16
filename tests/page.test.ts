import { readFileSync } from 'node:fs';
import { encodeState } from '@eurth/style';
import { describe, expect, it } from 'vitest';
import { compileBank } from '../src/anthem/bank/compile.ts';
import { BATCHES } from '../src/anthem/bank/index.ts';
import { EXAMPLES } from '../src/anthem/examples.ts';
import { DEFAULT_SETTINGS, generate, type Settings } from '../src/anthem/generate.ts';
import { THEMES } from '../src/anthem/themes.ts';
import {
  addOwnTheme,
  chipThemes,
  fromParam,
  fromProfile,
  mainOf,
  mottoPlace,
  noteInWords,
  resultNotes,
  sayIt,
  singMotto,
  splitWords,
  stanzaName,
  stressFor,
  stressInWords,
  sungTimes,
  themesWithLines,
  wordsToSay,
} from '../src/ui/page.ts';
import { buildBank } from '../tools/build-bank.ts';
import { lexicon } from './helpers.ts';

const lex = lexicon();
const { bank } = compileBank(BATCHES, lex);
const teland = EXAMPLES[0]!;
const all = new Set([...themesWithLines(bank)]);

describe('what the page says', () => {
  it('names a stanza the way a person would', () => {
    expect(stanzaName(teland.anthem, 0)).toBe('verse 1');
    expect(stanzaName(teland.anthem, 1)).toBe('the chorus');
    expect(stanzaName(teland.anthem, 2)).toBe('verse 2');
  });

  it('puts every note into a sentence', () => {
    const s: Settings = { ...DEFAULT_SETTINGS, metre: '8787', scheme: 'AABB' };
    expect(noteInWords({ kind: 'scheme', asked: 'AABB', used: 'ABAB' }, teland.anthem, s)).toMatch(/^8\.7\.8\.7 can’t be rhymed AABB.*ABAB instead\.$/);
    expect(noteInWords({ kind: 'name', name: 'Xq' }, teland.anthem, s)).toContain('“Xq” fits no line');
    expect(noteInWords({ kind: 'rhyme', stanza: 1, line: 2 }, teland.anthem, s)).toContain('Line 3 of the chorus');
    expect(noteInWords({ kind: 'only', stanza: 0, line: 0 }, teland.anthem, s)).toContain('only line that fits');
    expect(noteInWords({ kind: 'short', stanza: 2 }, teland.anthem, s)).toContain('verse 2');
  });

  it('says which of the person’s words found no line', () => {
    const one = resultNotes({ anthem: teland.anthem, placed: [], unplaced: ['tide'], notes: [] }, teland.settings);
    expect(one).toEqual(['No line had room for “tide” this time. Press Write lyrics for another try, pick a different metre, or type it into a line yourself.']);
    const two = resultNotes({ anthem: teland.anthem, placed: [], unplaced: ['tide', 'Selunna'], notes: [{ kind: 'scheme', asked: 'AABB', used: 'ABAB' }] }, teland.settings);
    expect(two).toHaveLength(2);
    expect(two[1]).toContain('“tide” and “Selunna”');
    expect(two[1]).toContain('type them');
  });
});

describe('how a word is said', () => {
  it('asks only about words the dictionary doesn’t know', () => {
    const words = wordsToSay({ ...DEFAULT_SETTINGS, country: 'Teland', include: ['harbour', 'tide', 'Selunna'] }, lex);
    expect(words.map((w) => w.text)).toEqual(['Teland', 'Selunna']);
    expect(words[1]).toMatchObject({ key: 'selunna', stress: '010', spelled: 'Se-LUN-na', own: false });
  });

  it('shows the person’s own answer once they have given it', () => {
    const settings = sayIt({ ...DEFAULT_SETTINGS, country: 'Teland' }, 'Teland', stressFor(2, 1));
    expect(settings.own).toEqual({ teland: '01' });
    expect(wordsToSay(settings, lex)[0]).toMatchObject({ stress: '01', spelled: 'Te-LAND', own: true });
  });

  it('turns syllables and a stress into a pattern, within bounds', () => {
    expect(stressFor(3, 1)).toBe('010');
    expect(stressFor(1, 4)).toBe('1');
    expect(stressFor(99, 99)).toBe('00001');
    expect(stressFor(2, -3)).toBe('10');
    expect(mainOf('0010')).toBe(2);
    expect(stressInWords('1')).toBe('1 syllable');
    expect(stressInWords('010')).toBe('3 syllables, stress on the second');
  });
});

describe('a theme typed by hand', () => {
  const base: Settings = { ...DEFAULT_SETTINGS, country: 'Teland' };

  it('switches on a theme the bank has, by any of its names', () => {
    expect(addOwnTheme('  The Crown ', base, all).settings.themes).toEqual(['crown']);
    expect(addOwnTheme('harvest', base, all).settings.themes).toEqual(['harvest']);
    expect(addOwnTheme('sea', { ...base, themes: ['sea'] }, all).said).toBe('Sea is already one of your themes.');
  });

  it('finds the emu, and gives it the chorus it lives in', () => {
    const found = addOwnTheme('Emu', { ...base, chorus: false }, all);
    expect(found.settings.themes).toEqual(['emu']);
    expect(found.settings.chorus).toBe(true);
    expect(found.said).toBe('Emu it is. It needs a chorus, so you have one now.');
    const result = generate(bank, { ...found.settings, metre: '8686' }, 3, { lexicon: lex });
    expect(result.anthem.stanzas[1]!.lines[3]!.text).toBe('And never once gave up the field.');
  });

  it('turns any other word into a word to include, and says so', () => {
    const answer = addOwnTheme('lighthouses', base, all);
    expect(answer.settings.themes).toEqual([]);
    expect(answer.settings.include).toEqual(['lighthouses']);
    expect(answer.said).toBe('There are no lines on “lighthouses” yet, so it joins your words to include.');
    expect(addOwnTheme('Lighthouses', answer.settings, all).said).toContain('already among your words');
    expect(addOwnTheme('   ', base, all)).toEqual({ settings: base, said: '' });
  });

  it('has no chip for a theme whose lines were left out', () => {
    // Every theme has a chip, in alphabetical order, with "The" set aside.
    expect(chipThemes(bank).map((t) => t.label)).toEqual(['The crown', 'Dawn', 'Faith', 'Forests', 'Freedom', 'Harvest', 'Home', 'Labour', 'Mountains', 'The north', 'Peace', 'Plains', 'Remembrance', 'Revolution', 'Rivers', 'Sea', 'Unity']);
    expect(chipThemes(bank)).toHaveLength(THEMES.length);
    const fewer = { ...bank, templates: bank.templates.filter((t) => !t.themes.includes('crown')) };
    expect(chipThemes(fewer).map((t) => t.id)).not.toContain('crown');
    expect(addOwnTheme('crown', base, themesWithLines(fewer)).settings.include).toEqual(['crown']);
  });

  it('reads the words to include from one field', () => {
    expect(splitWords(' harbour,  tide ;Selunna\n\n, ')).toEqual(['harbour', 'tide', 'Selunna']);
    expect(splitWords(Array.from({ length: 30 }, (_, i) => `w${i}`).join(','))).toHaveLength(12);
  });
});

describe('the lines as they are sung in', () => {
  it('come one after another, each within half a second of the last', () => {
    for (const example of EXAMPLES) {
      const times = sungTimes(example.anthem).flat();
      expect(times[0]).toBe(0);
      for (let i = 1; i < times.length; i += 1) {
        expect(times[i]! - times[i - 1]!, example.id).toBeGreaterThan(0);
        expect(times[i]! - times[i - 1]!, example.id).toBeLessThanOrEqual(480 + 160);
      }
    }
  });
});

describe('arriving', () => {
  it('reads an anthem back from its link, and nothing from anything else', () => {
    const back = fromParam(encodeState(teland.state));
    expect(back?.anthem).toEqual(teland.anthem);
    for (const junk of [null, undefined, '', 'hello', '1.!!!', '2.e30', encodeState('<script>'), encodeState([1, 2])]) expect(fromParam(junk)?.anthem ?? null).toBeNull();
  });

  const calderwyn = JSON.parse(readFileSync('node_modules/@eurth/profile/examples/calderwyn.eurth.json', 'utf8')) as Record<string, unknown>;

  it('fills the form from a profile, and keeps words written elsewhere as typed lines', () => {
    const from = fromProfile(calderwyn, { ...DEFAULT_SETTINGS, themes: ['crown'], metre: '7777', scheme: 'AABB' }, 'anthem.eurth.org', lex);
    expect(from.settings.country).toBe('Calderwyn');
    expect(from.settings.include.length).toBeGreaterThan(0);
    expect(from.anthem?.title).toBe('Lanterns on the Water');
    expect(from.anthem?.stanzas.flatMap((st) => st.lines).every((line) => line.typed)).toBe(true);
    expect(typeof from.motto).toBe('string');
    // The words say nothing of the form's themes, and they keep 8.7.8.7 rhymed ABCB: two verses.
    expect(from.settings).toMatchObject({ themes: [], metre: '8787', scheme: 'ABCB', verses: 2, chorus: false });
    expect(from.anthem?.stanzas.map((st) => st.type)).toEqual(['verse', 'verse']);
  });

  it('believes what a file says of its anthem only where that is one of Anthem’s own choices', () => {
    const lyrics = 'The lantern burns above the bay,\nAnd gulls are in the sky;\nOur ships go out, our ships come home,\nWith hearts and heads held high.';
    const said = fromProfile({ ...calderwyn, anthem: { lyrics, metre: '8.6.8.6', rhyme: 'ABCB', mood: 'pastoral', themes: ['sea', 'nonsense', 7] } }, DEFAULT_SETTINGS, 'anthem.eurth.org', lex);
    expect(said.settings).toMatchObject({ metre: '8686', scheme: 'ABCB', mood: 'pastoral', themes: ['sea'], verses: 1, chorus: false });
    const lied = fromProfile({ ...calderwyn, anthem: { lyrics, metre: '<b>', rhyme: 'ZZZZ', mood: 'loud' } }, DEFAULT_SETTINGS, 'anthem.eurth.org', lex);
    expect(lied.settings).toMatchObject({ metre: '8686', scheme: 'ABCB', mood: 'solemn' });
    expect(fromProfile({ ...calderwyn, anthem: { lyrics: 'One line only' } }, DEFAULT_SETTINGS, 'anthem.eurth.org', lex).anthem).toBeNull();
  });

  it('opens an anthem from its own link in the file, and from no other site', () => {
    const mine = { ...calderwyn, anthem: { link: `https://anthem.eurth.org/?d=${encodeState(teland.state)}`, lyrics: 'One\nTwo\nThree\nFour' } };
    expect(fromProfile(mine, DEFAULT_SETTINGS, 'anthem.eurth.org').anthem).toEqual(teland.anthem);
    expect(fromProfile(mine, DEFAULT_SETTINGS, 'anthem.eurth.org').settings.country).toBe('Teland');
    const theirs = { ...calderwyn, anthem: { link: `https://example.com/?d=${encodeState(teland.state)}` } };
    expect(fromProfile(theirs, DEFAULT_SETTINGS, 'anthem.eurth.org').anthem).toBeNull();
    const plain = { ...calderwyn, anthem: { link: `http://anthem.eurth.org/?d=${encodeState(teland.state)}` } };
    expect(fromProfile(plain, DEFAULT_SETTINGS, 'anthem.eurth.org').anthem).toBeNull();
  });

  it('never throws on a file that isn’t a profile', () => {
    for (const junk of [null, 7, 'x', [], { anthem: 'no' }, { anthem: { link: 'not a link', lyrics: 5 } }, { identity: [], cities: { list: 'x' } }]) {
      expect(() => fromProfile(junk, DEFAULT_SETTINGS, 'anthem.eurth.org')).not.toThrow();
      expect(fromProfile(junk, { ...DEFAULT_SETTINGS, country: 'Teland' }, 'anthem.eurth.org').settings.country).toBe('Teland');
    }
  });
});

describe('the motto', () => {
  it('goes where it fits, for choice the last line of the chorus, and is kept from then on', () => {
    const motto = 'Steady as the turning tide';
    const at = mottoPlace(teland.anthem, motto, lex, teland.settings);
    expect(at).toEqual({ stanza: 1, line: 3 });
    const sung = singMotto(teland.anthem, at!, motto);
    expect(sung.stanzas[1]!.lines[3]).toMatchObject({ text: motto, typed: true, locked: true });
    expect(teland.anthem.stanzas[1]!.lines[3]!.locked).toBe(false);
  });

  it('is offered nowhere when it fits no line', () => {
    expect(mottoPlace(teland.anthem, 'Unity', lex, teland.settings)).toBeNull();
    expect(mottoPlace(teland.anthem, '', lex, teland.settings)).toBeNull();
  });
});

describe('the bank the site ships', () => {
  it('holds every batch before the door, without the lines as written', () => {
    const { bank: shipped, left } = buildBank(false);
    expect(left).toEqual([]);
    expect(shipped.templates.length).toBe(bank.templates.length);
    expect(shipped.templates.every((t) => t.source === '')).toBe(true);
  });

  it('from the door on holds reviewed batches only, or stops the build', () => {
    const unreviewed = BATCHES.filter((b) => !b.reviewed).map((b) => b.id);
    let shipped: ReturnType<typeof buildBank> | null = null;
    let stopped = '';
    try {
      shipped = buildBank(true);
    } catch (error) {
      stopped = String(error);
    }
    if (shipped) {
      // Enough is reviewed to write an anthem: nothing unreviewed is in it.
      expect(shipped.left).toEqual(unreviewed);
      expect(new Set(shipped.bank.templates.map((t) => t.batch))).toEqual(new Set(BATCHES.filter((b) => b.reviewed).map((b) => b.id)));
    } else {
      // Not enough is reviewed yet: the launch build refuses, and says which batches wait.
      expect(unreviewed.length).toBeGreaterThan(0);
      expect(stopped).toMatch(/reviewed/);
    }
  });
});
