import { describe, expect, it } from 'vitest';
import { brotliCompressSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { EMPTY_LEXICON } from '../src/anthem/lexicon.ts';
import { KIND_PATTERN } from '../src/anthem/metre.ts';
import { cleanWord, fitLine, guessStress, nuclei, scanLine, scanWord, spellOut, tokenise } from '../src/anthem/scan.ts';
import { TARGET } from '../tools/build-dict.mjs';
import { lexicon, seeded } from './helpers.ts';

const lex = lexicon();
const stress = (word: string, own = {}) => scanWord(word, lex, own).prons.map((p) => p.stress);

describe('the pronunciation table', () => {
  it('holds the dictionary', () => {
    expect(lex.size).toBeGreaterThan(120_000);
  });

  it('stays within its size budget once compressed', () => {
    const size = brotliCompressSync(readFileSync(TARGET)).length;
    expect(size).toBeLessThan(600 * 1024);
  });

  it('knows British and American spellings', () => {
    for (const word of ['harbour', 'harbor', 'honour', 'labour', 'centre', 'colour', 'valour', 'saviour', 'neighbour', 'splendour']) {
      expect(scanWord(word, lex).source, word).not.toBe('guess');
      expect(stress(word), word).toContain('10');
    }
    expect(stress('realise')).toEqual(stress('realize'));
    expect(scanWord('honoured', lex).source).not.toBe('guess');
  });
});

describe('scanning a word', () => {
  it('cleans what is typed', () => {
    expect(cleanWord('Harbour,')).toBe('harbour');
    expect(cleanWord('“Señor”')).toBe('senor');
    expect(cleanWord('o’er')).toBe("o'er");
    expect(cleanWord('--sea-girt--')).toBe('sea-girt');
    expect(cleanWord('Ærø')).toBe('aero');
    expect(tokenise('Rise, Teland — rise together!')).toEqual(['Rise', 'Teland', 'rise', 'together']);
    expect(tokenise('  ... !!! ')).toEqual([]);
  });

  it('reads stress from the dictionary', () => {
    expect(stress('mountain')).toEqual(['10']);
    expect(stress('together')).toEqual(['010']);
    expect(stress('harmony')).toEqual(['100']);
    expect(stress('evermore')).toEqual(['102']);
    // The usual way of saying a word comes first.
    expect(stress('years')[0]).toBe('1');
    expect(scanWord('years', lex).prons[0]!.tail).toBe(scanWord('fears', lex).prons[0]!.tail);
  });

  it('lets verse sing some words a syllable short', () => {
    expect(stress('power')).toEqual(expect.arrayContaining(['10', '1']));
    expect(stress('heaven')).toEqual(expect.arrayContaining(['10', '1']));
    expect(stress('our')).toContain('1');
    expect(stress('glorious')).toEqual(expect.arrayContaining(['100', '10']));
  });

  it('works out endings the dictionary lacks from the stem', () => {
    const made = scanWord("lantern's", lex);
    expect(made.prons[0]!.stress).toBe('10');
    expect(scanWord('sea-girt', lex).prons[0]!.stress.length).toBe(2);
    expect(scanWord('storm-battered', lex).prons[0]!.stress).toBe('210');
    expect(scanWord('tide-line', lex).prons[0]!.stress).toBe('22');
  });

  it("takes the person's own correction over everything", () => {
    expect(stress('Selunna', { selunna: '010' })).toEqual(['010']);
    expect(scanWord('Selunna', lex, { selunna: '010' }).source).toBe('own');
    expect(stress('harbour', { harbour: '01' })).toEqual(['01']);
    // Nonsense in a link is ignored.
    expect(scanWord('harbour', lex, { harbour: 'abc' }).source).toBe('dict');
  });

  it('guesses made-up names from their spelling', () => {
    expect(guessStress('teland')).toBe('10');
    expect(guessStress('selunna')).toBe('010');
    expect(guessStress('calderwyn')).toBe('100');
    expect(guessStress('corvane')).toBe('10');
    expect(guessStress('orioni')).toBe('0010');
    expect(guessStress('ostaril')).toBe('100');
    expect(guessStress('kwaz')).toBe('1');
    expect(guessStress('varenko')).toBe('010');
    expect(guessStress('calderwynia')).toBe('00100');
    expect(scanWord('Selunna', lex).source).toBe('guess');
  });

  it('counts syllables from spelling about as well as a careful reader', () => {
    // Held against the dictionary on a few thousand of its own words.
    const rand = seeded(7);
    let right = 0;
    let close = 0;
    let total = 0;
    for (const line of readFileSync(TARGET, 'utf8').split('\n')) {
      for (const item of line.slice(line.indexOf('\t') + 1).split(' ')) {
        if (rand() > 0.03) continue;
        const m = /^([a-z]+)(\d+)/.exec(item);
        if (!m) continue;
        const counts = lex.get(m[1]!)!.map((p) => p.stress.length);
        const guess = nuclei(m[1]!).length || 1;
        total += 1;
        if (counts.includes(guess)) right += 1;
        if (counts.some((c) => Math.abs(c - guess) <= 1)) close += 1;
      }
    }
    expect(total).toBeGreaterThan(2000);
    expect(right / total).toBeGreaterThan(0.8);
    expect(close / total).toBeGreaterThan(0.97);
  });

  it('never throws, whatever is typed', () => {
    for (const odd of ['', '   ', "'", '-', '123', '🎺', 'x'.repeat(500), "''''", 'a-b-c-d', 'ÿ', '\u0000', 'e']) {
      expect(() => scanLine(odd, lex)).not.toThrow();
      expect(() => scanLine(odd, EMPTY_LEXICON)).not.toThrow();
      for (const w of scanLine(odd, lex)) expect(w.prons.length).toBeGreaterThan(0);
    }
  });

  it('spells a word out by syllable', () => {
    expect(spellOut('Selunna', '010')).toBe('Se-LUN-na');
    expect(spellOut('Teland', '10')).toBe('TE-land');
    expect(spellOut('Calderwyn', '100')).toBe('CAL-der-wyn');
    expect(spellOut('Orioni', '0010')).toBe('O-ri-O-ni');
    // When the letters and the count disagree, the word is left alone.
    expect(spellOut('Kwaz', '10')).toBe('Kwaz');
  });
});

describe('fitting a line to a metre', () => {
  const fits = (text: string, kind: keyof typeof KIND_PATTERN, own = {}) => fitLine(scanLine(text, lex, own), KIND_PATTERN[kind]);

  it('accepts lines that scan', () => {
    // The hand-written anthem in the profile's Calderwyn example, 8.7.8.7.
    const calderwyn: [string, 'T8' | 'T7'][] = [
      ['Where the Calder meets the morning', 'T8'],
      ['And the harbour bells begin,', 'T7'],
      ['Every lantern keeps its promise:', 'T8'],
      ['Guide the weary sailor in.', 'T7'],
      ['From the uplands to the tide-line,', 'T8'],
      ['Field and ferry, hearth and quay,', 'T7'],
      ['One the light and one the river,', 'T8'],
    ];
    for (const [line, kind] of calderwyn) expect(fits(line, kind), line).toMatchObject({ ok: true });
    expect(fits('Calderwyn, we sing to thee.', 'T7', { calderwyn: '100' }).ok).toBe(true);
    expect(fits('The morning breaks on field and shore', 'I8').ok).toBe(true);
    expect(fits('And all the land is free', 'I6').ok).toBe(true);
  });

  it('says when the count is wrong', () => {
    const fit = fits('Rise, Teland, rise together', 'T8', { teland: '10' });
    expect(fit.ok).toBe(false);
    expect(fit.problem).toEqual({ kind: 'count', have: 7, want: 8 });
  });

  it('says when the stress is wrong', () => {
    const fit = fits('Together the mountains of gold', 'T8');
    expect(fit.ok).toBe(false);
    expect(fit.problem?.kind).toBe('stress');
  });

  it('uses the short form of a word when the line needs it', () => {
    expect(fits('Power and glory, strength and song', 'T7').ok).toBe(true);
    expect(fits('Power and glory, strength and gladness', 'T8').ok).toBe(true);
    expect(fits('By the power of heaven above', 'T7').ok).toBe(true);
  });

  it('lets any line stand in free verse', () => {
    expect(fitLine(scanLine('Whatever you like, however long it runs on', lex), null).ok).toBe(true);
    expect(fitLine([], null)).toMatchObject({ ok: true, count: 0 });
    expect(fitLine([], 'SwS').ok).toBe(false);
  });
});
