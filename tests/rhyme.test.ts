import { describe, expect, it } from 'vitest';
import { KIND_PATTERN, rhymeGroups, rhymePartners, type LineKind } from '../src/anthem/metre.ts';
import { anyRhyme, lineEnd, lineEnds, rhymes, rhymesFor } from '../src/anthem/rhyme.ts';
import { fitLine, scanLine } from '../src/anthem/scan.ts';
import { lexicon } from './helpers.ts';

const lex = lexicon();

function end(text: string, kind: LineKind | null) {
  const words = scanLine(text, lex);
  const pattern = kind ? KIND_PATTERN[kind] : null;
  const fit = fitLine(words, pattern);
  expect(fit.ok, text).toBe(true);
  return lineEnd(words, fit.choice, pattern);
}

describe('rhyme', () => {
  it('finds one-syllable rhymes', () => {
    expect(rhymes(end('Keep the light against our fears', 'T7'), end('Steady through the passing years', 'T7'))).toBe(true);
    expect(rhymes(end('Guide the weary sailor in', 'T7'), end('And the harbour bells begin', 'T7'))).toBe(true);
    expect(rhymes(end('And all the land is free', 'I6'), end('From mountain to the sea', 'I6'))).toBe(true);
    expect(rhymes(end('And all the land is free', 'I6'), end('From mountain to the shore', 'I6'))).toBe(false);
  });

  it('finds two-syllable rhymes', () => {
    expect(rhymes(end('Through the storm and through the weather', 'T8'), end('Rise, O people, rise together', 'T8'))).toBe(true);
    expect(rhymes(end('From the highlands to the mountains', 'T8'), end('Free we stand by field and fountains', 'T8'))).toBe(true);
    expect(rhymes(end('Land of salt and northern harbours', 'T8'), end('Hold the shore our mothers guarded', 'T8'))).toBe(false);
  });

  it('rhymes two words with two words when the weak one is shared', () => {
    const a = end('Hand in hand let honour guide us', 'T8');
    const b = end('Keep the faith of those beside us', 'T8');
    expect(a?.word).toBe('guide us');
    expect(rhymes(a, b)).toBe(true);
    expect(rhymes(a, end('Hand in hand let honour lead us', 'T8'))).toBe(false);
  });

  it('refuses the same word, and the same sound twice', () => {
    expect(rhymes(end('Keep the watch by day and night', 'T7'), end('Hold the wall by day and night', 'T7'))).toBe(false);
    // "night" and "knight", "light" and "delight": the same sound, not a rhyme.
    expect(rhymes(end('Keep the watch by day and night', 'T7'), end('Hail the banner of the knight', 'T7'))).toBe(false);
    expect(rhymes(end('Keep the watch and tend the light', 'T7'), end('Ours the labour and delight', 'T7'))).toBe(false);
  });

  it('marks a rhyme that leans on the beat as weak', () => {
    const a = end('Ours the gift of harmony', 'T7');
    const b = end('From the mountains to the sea', 'T7');
    expect(a?.weak).toBe(true);
    expect(b?.weak).toBe(false);
    expect(rhymes(a, b)).toBe(true);
  });

  it('does not rhyme a stressed ending with an unstressed one of the same sounds', () => {
    // "dirty" and "liberty" end in the same sounds, but the stress falls differently.
    expect(end('Through the storm and through the dirty', 'T8')?.key).toBeTruthy();
    expect(lineEnd(scanLine('harmony', lex), [lex.get('harmony')![0]!], 'Sw')).toBeNull();
  });

  it("knows nothing about a made-up word's rhyme, and says so", () => {
    const words = scanLine('From the hills of old Selunna', lex, { selunna: '010' });
    const fit = fitLine(words, KIND_PATTERN.T8);
    expect(fit.ok).toBe(true);
    expect(lineEnd(words, fit.choice, KIND_PATTERN.T8)).toBeNull();
  });

  it('decides the kind of ending from the last word in free verse', () => {
    expect(end('We sing of the mountains', null)?.kind).toBe('f');
    expect(end('We sing of the sea', null)?.kind).toBe('m');
  });

  it('gives a typed line the benefit of every way a word is said', () => {
    // "again" rhymes with "men" for some and with "rain" for others.
    const again = lineEnds(scanLine('Rise and build the land again', lex), KIND_PATTERN.T7);
    expect(anyRhyme(again, lineEnds(scanLine('Bless the fields with gentle rain', lex), KIND_PATTERN.T7))).toBe(true);
    expect(anyRhyme(again, lineEnds(scanLine('Hail the women and the men', lex), KIND_PATTERN.T7))).toBe(true);
    expect(anyRhyme(again, lineEnds(scanLine('Hail the mountains and the sea', lex), KIND_PATTERN.T7))).toBe(false);
    expect(lineEnds([], null)).toEqual([]);
  });

  it('offers rhymes for a word', () => {
    const forSea = rhymesFor('sea', lex, 500);
    expect(forSea).toEqual(expect.arrayContaining(['free', 'be', 'tree']));
    expect(forSea).not.toContain('see');
    expect(rhymesFor('mountain', lex)).toContain('fountain');
    expect(rhymesFor('qqqq', lex)).toEqual([]);
  });
});

describe('rhyme schemes', () => {
  it('pairs the lines', () => {
    expect(rhymePartners('ABAB')).toEqual([2, 3, 0, 1]);
    expect(rhymePartners('AABB')).toEqual([1, 0, 3, 2]);
    expect(rhymePartners('ABCB')).toEqual([-1, 3, -1, 1]);
    expect(rhymeGroups('ABCB')).toEqual([[1, 3]]);
  });
});
