import { describe, expect, it } from 'vitest';
import { compileBank } from '../src/anthem/bank/compile.ts';
import { BATCHES } from '../src/anthem/bank/index.ts';
import { typeLine, typeTitle } from '../src/anthem/edit.ts';
import { DEFAULT_SETTINGS, generate, type Settings } from '../src/anthem/generate.ts';
import { METRE_IDS } from '../src/anthem/metre.ts';
import { LIGHT, NIGHT, SHEET_SIZES, estimateWidth, layoutSheet, sheetAlt, sheetSvg } from '../src/anthem/sheet.ts';
import { lexicon } from './helpers.ts';

const lex = lexicon();
const { bank } = compileBank(BATCHES, lex);
const base: Settings = { ...DEFAULT_SETTINGS, country: 'Teland', own: { teland: '10' } };

describe('the lyric sheet', () => {
  it('comes in the six sizes of the handbook', () => {
    expect(SHEET_SIZES.map((s) => `${s.width}x${s.height}`)).toEqual(['1200x630', '1080x1080', '1080x1350', '1080x1920', '1000x1500', '1600x900']);
  });

  it('keeps every word inside the picture, at a size that can be read, in every size', () => {
    for (const metre of METRE_IDS) {
      for (const verses of [1, 2, 3, 4]) {
        for (const chorus of [true, false]) {
          const settings = { ...base, metre, verses, chorus, country: verses === 4 ? 'The Commonwealth of Calderwynia' : 'Teland' };
          const anthem = generate(bank, settings, verses * 7 + (chorus ? 1 : 0), { lexicon: lex }).anthem;
          for (const size of SHEET_SIZES) {
            const layout = layoutSheet(anthem, settings, { size, footer: 'anthem.eurth.org' });
            const where = `${metre} ${verses}v ${chorus ? '+c' : ''} ${size.id}`;
            for (const t of layout.texts) {
              expect(t.x, where).toBeGreaterThanOrEqual(0);
              expect(t.x + t.width, `${where}: "${t.text}"`).toBeLessThanOrEqual(size.width);
              expect(t.y - t.size, `${where}: "${t.text}"`).toBeGreaterThanOrEqual(0);
              expect(t.y, `${where}: "${t.text}"`).toBeLessThanOrEqual(size.height);
            }
            // Lyric lines never smaller than about a fiftieth of the width: 22px on a 1080 picture.
            expect(layout.lineSize, where).toBeGreaterThanOrEqual(size.width * 0.0209);
            // The first verse is always there, and stanzas come in order with none skipped.
            expect(layout.shown, where).toEqual(layout.shown.map((_, i) => i));
            expect(layout.shown.length, where).toBeGreaterThanOrEqual(1);
            // Lines in a column never sit on top of each other.
            const byColumn = new Map<number, number[]>();
            for (const t of layout.texts) byColumn.set(t.x, [...(byColumn.get(t.x) ?? []), t.y]);
            for (const ys of byColumn.values()) {
              const sorted = [...ys].sort((a, b) => a - b);
              for (let i = 1; i < sorted.length; i += 1) expect(sorted[i]! - sorted[i - 1]!, where).toBeGreaterThan(8);
            }
          }
        }
      }
    }
  });

  it('shows the whole of a short anthem, and the start of a long one on a small picture', () => {
    const short = generate(bank, { ...base, verses: 1 }, 3, { lexicon: lex }).anthem;
    for (const size of SHEET_SIZES) expect(layoutSheet(short, { ...base, verses: 1 }, { size }).shown, size.id).toEqual([0, 1]);

    const settings = { ...base, verses: 4 };
    const long = generate(bank, settings, 3, { lexicon: lex }).anthem;
    const preview = layoutSheet(long, settings, { size: SHEET_SIZES[0]! });
    expect(preview.shown.length).toBeLessThan(5);
    expect(preview.shown.slice(0, 2)).toEqual([0, 1]);
    expect(preview.texts.some((t) => /^Verses? 1.* and the chorus, of 4 verses\.$/.test(t.text))).toBe(true);
    const story = layoutSheet(long, settings, { size: SHEET_SIZES[3]! });
    expect(story.shown).toEqual([0, 1, 2, 3, 4]);
    expect(story.texts.some((t) => t.text.includes('of 4 verses'))).toBe(false);
  });

  it('prints the title, whose anthem it is, the metre and each stanza under its heading', () => {
    const anthem = typeTitle(generate(bank, base, 5, { lexicon: lex }).anthem, 'Steady Against the Tide');
    const layout = layoutSheet(anthem, base, { size: SHEET_SIZES[2]!, footer: 'anthem.eurth.org' });
    const texts = layout.texts.map((t) => t.text);
    expect(texts[0]).toBe('Steady Against the Tide');
    expect(texts[1]).toBe('National anthem of Teland · 8.7.8.7 · ABAB');
    expect(texts).toEqual(expect.arrayContaining(['VERSE 1', 'CHORUS', 'VERSE 2', 'anthem.eurth.org']));
    for (const stanza of anthem.stanzas) for (const line of stanza.lines) expect(texts).toContain(line.text);
    // The chorus is set in bold, as a refrain is.
    const chorusLine = layout.texts.find((t) => t.text === anthem.stanzas[1]!.lines[0]!.text)!;
    const verseLine = layout.texts.find((t) => t.text === anthem.stanzas[0]!.lines[0]!.text)!;
    expect(chorusLine.bold).toBe(true);
    expect(verseLine.bold).toBe(false);
    expect(layoutSheet(anthem, { ...base, country: '', metre: 'free' }, { size: SHEET_SIZES[2]! }).texts[1]!.text).toBe('A national anthem · free verse · ABAB');
  });

  it('uses two columns on a wide picture', () => {
    const settings = { ...base, verses: 3 };
    const anthem = generate(bank, settings, 9, { lexicon: lex }).anthem;
    expect(layoutSheet(anthem, settings, { size: SHEET_SIZES[5]! }).columns).toBe(2);
    expect(layoutSheet(anthem, settings, { size: SHEET_SIZES[3]! }).columns).toBe(1);
  });

  it('is a well-formed picture with a title, a description and the theme’s colours', () => {
    const anthem = generate(bank, base, 5, { lexicon: lex }).anthem;
    for (const palette of [NIGHT, LIGHT]) {
      const svg = sheetSvg(anthem, base, { size: SHEET_SIZES[1]!, palette });
      expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080"')).toBe(true);
      expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
      expect(svg).toContain('role="img"');
      expect(svg).toContain(`<title id="sheet-title">${anthem.title}</title>`);
      expect(svg).toContain(`fill="${palette.paper}"`);
      expect(svg).toContain(`fill="${palette.ink}"`);
      expect(svg).not.toMatch(/<script|href=|<image|<foreignObject|url\(/);
      expect(svg.match(/<text /g)!.length).toBe(svg.match(/<\/text>/g)!.length);
      expect(svg).toContain('font-family="system-ui, Arial, sans-serif"');
    }
    expect(sheetSvg(anthem, base, { size: SHEET_SIZES[1]! })).toBe(sheetSvg(anthem, base, { size: SHEET_SIZES[1]! }));
  });

  it('makes typed text harmless, and still fits an over-long line on the sheet', () => {
    let anthem = generate(bank, base, 5, { lexicon: lex }).anthem;
    anthem = typeTitle(anthem, '<script>alert("x")</script> & co');
    anthem = typeLine(anthem, { stanza: 0, line: 0 }, `A line with <tags> & "quotes" that goes on and on ${'and on '.repeat(11)}`);
    for (const size of SHEET_SIZES) {
      const svg = sheetSvg(anthem, { ...base, country: '</text><script>' }, { size });
      expect(svg).not.toContain('<script>');
      expect(svg).toContain('&lt;script&gt;');
      expect(svg).not.toMatch(/&(?!amp;|lt;|gt;|quot;)/);
      const layout = layoutSheet(anthem, base, { size });
      for (const t of layout.texts) expect(t.x + t.width, size.id).toBeLessThanOrEqual(size.width);
    }
  });

  it('describes itself for those who can’t see it', () => {
    const settings = { ...base, verses: 4 };
    const anthem = typeTitle(generate(bank, settings, 3, { lexicon: lex }).anthem, 'Steady Against the Tide');
    expect(sheetAlt(anthem, settings, layoutSheet(anthem, settings, { size: SHEET_SIZES[3]! }))).toBe('Lyric sheet of “Steady Against the Tide”, the national anthem of Teland.');
    expect(sheetAlt(anthem, settings, layoutSheet(anthem, settings, { size: SHEET_SIZES[0]! }))).toBe('Lyric sheet of “Steady Against the Tide”, the national anthem of Teland: the first part of the words.');
  });

  it('takes the page’s own way of measuring text', () => {
    const anthem = generate(bank, base, 5, { lexicon: lex }).anthem;
    const narrow = layoutSheet(anthem, base, { size: SHEET_SIZES[0]!, measure: (text, size) => text.length * size * 0.3 });
    const wide = layoutSheet(anthem, base, { size: SHEET_SIZES[0]!, measure: (text, size) => text.length * size * 0.9 });
    expect(narrow.lineSize).toBeGreaterThan(wide.lineSize);
    expect(estimateWidth('Land of peace', 20, true)).toBeGreaterThan(estimateWidth('Land of peace', 20, false));
  });
});
