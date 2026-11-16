import { describe, expect, it } from 'vitest';
import { compileBank } from '../src/anthem/bank/compile.ts';
import { BATCHES } from '../src/anthem/bank/index.ts';
import { MOOD_IDS } from '../src/anthem/bank/types.ts';
import { DEFAULT_SETTINGS, cleanSettings, generate, rerollLine, sortIncluded, titleCase, type Anthem, type Result, type Settings } from '../src/anthem/generate.ts';
import { FREE_SHAPES, KIND_PATTERN, METRES, METRE_IDS, SCHEME_IDS, rhymeGroups, schemeFor, shapeAllows } from '../src/anthem/metre.ts';
import { anyRhyme, lineEnds } from '../src/anthem/rhyme.ts';
import { cleanWord, fitLine, scanLine, tokenise } from '../src/anthem/scan.ts';
import { lexicon, seeded } from './helpers.ts';

const lex = lexicon();
const { bank } = compileBank(BATCHES, lex);

// Names of every shape a line can take, with the stress of the made-up ones.
const NAMES: [string, Record<string, string>][] = [
  ['Teland', { teland: '10' }],
  ['Selunna', { selunna: '010' }],
  ['Kwaz', {}],
  ['Calderwyn', { calderwyn: '100' }],
  ['Varoon', { varoon: '01' }],
  ['Caledonia', {}],
  ['Kelomartha', { kelomartha: '0101' }],
  ['Calderwynia', { calderwynia: '20100' }],
  ['New Teland', { teland: '10' }],
];

const THEMES = ['sea', 'rivers', 'mountains', 'north', 'freedom', 'revolution', 'unity', 'faith', 'labour', 'harvest', 'forests', 'plains'];

// Short fragments of famous anthems and patriotic songs. The generator must never write one,
// even by chance. They live here only, and are never shipped.
const NEVER = [
  'land of the free',
  'home of the brave',
  'land of hope and glory',
  'god save',
  'say can you see',
  'true north',
  'advance australia',
  'sea to shining sea',
  'sweet land of liberty',
  'amber waves',
  'land of my fathers',
  'rule the waves',
  'glorious and free',
  'stand on guard',
  'freedom ring',
  'to arms',
  'hear the people sing',
  'we shall overcome',
  'deepest red',
  'workers of the world',
  'one for all',
  'we are one, but we are many',
];

/** Checks an anthem from the outside: from its words and the dictionary, not from the bank. */
function faults(result: Result, settings: Settings): string[] {
  const out: string[] = [];
  const s = cleanSettings(settings);
  const { anthem } = result;
  const scheme = schemeFor(s.metre, s.scheme);
  const wantStanzas = s.verses + (s.chorus ? 1 : 0);
  if (anthem.stanzas.length !== wantStanzas) out.push(`${anthem.stanzas.length} stanzas, not ${wantStanzas}`);
  if (s.chorus && anthem.stanzas[1]?.type !== 'chorus') out.push('the chorus is not after the first verse');
  if (anthem.title.trim() === '') out.push('no title');
  for (const note of result.notes) if (note.kind === 'short' || note.kind === 'rhyme') out.push(`note: ${JSON.stringify(note)}`);

  const texts = new Set<string>();
  const endWords = new Set<string>();
  anthem.stanzas.forEach((stanza, si) => {
    const where = `stanza ${si + 1}`;
    if (stanza.lines.length !== 4) out.push(`${where}: ${stanza.lines.length} lines`);
    const fixed = METRES[s.metre].lines;
    if (fixed) {
      if (stanza.kinds.join() !== fixed.join()) out.push(`${where}: kinds ${stanza.kinds.join()}`);
    } else if (!FREE_SHAPES.some((shape) => shape.join() === stanza.kinds.join()) || !shapeAllows(stanza.kinds, scheme)) {
      out.push(`${where}: free shape ${stanza.kinds.join()}`);
    }
    const ends = stanza.lines.map((line, li) => {
      const at = `${where} line ${li + 1} "${line.text}"`;
      if (!/^\p{Lu}/u.test(line.text)) out.push(`${at}: no capital`);
      if (!/[,;.]$/.test(line.text)) out.push(`${at}: no closing mark`);
      if (/\{|\}|undefined|  /.test(line.text)) out.push(`${at}: debris`);
      if (line.kind !== stanza.kinds[li]) out.push(`${at}: kind ${line.kind}`);
      const words = scanLine(line.text, lex, s.own);
      const pattern = KIND_PATTERN[line.kind];
      const fit = fitLine(words, pattern);
      if (!fit.ok) out.push(`${at}: doesn't scan as ${pattern}: ${JSON.stringify(fit.problem)}`);
      const bare = line.text.toLowerCase().replace(/[^\p{L}' ]/gu, '');
      if (texts.has(bare)) out.push(`${at}: the line comes twice`);
      texts.add(bare);
      const lineEndings = lineEnds(words, pattern);
      const endWord = lineEndings[0]?.word ?? cleanWord(tokenise(line.text).pop() ?? '');
      if (endWords.has(endWord)) out.push(`${at}: "${endWord}" ends a line twice`);
      endWords.add(endWord);
      for (const phrase of NEVER) if (bare.includes(phrase)) out.push(`${at}: says "${phrase}"`);
      return lineEndings;
    });
    for (const [a, b] of rhymeGroups(scheme)) {
      if (!anyRhyme(ends[a!] ?? [], ends[b!] ?? [])) out.push(`${where}: lines ${a! + 1} and ${b! + 1} don't rhyme: "${stanza.lines[a!]?.text}" / "${stanza.lines[b!]?.text}"`);
    }
  });
  return out;
}

function lyrics(anthem: Anthem): string {
  return anthem.stanzas.map((st) => st.lines.map((l) => l.text).join('\n')).join('\n\n');
}

describe('every generated line scans, over thousands of runs', () => {
  for (const metre of METRE_IDS) {
    for (const scheme of SCHEME_IDS) {
      it(`${METRES[metre].label} ${scheme}`, () => {
        const rand = seeded(METRE_IDS.indexOf(metre) * 10 + SCHEME_IDS.indexOf(scheme) + 1);
        const all: string[] = [];
        let said = 0;
        let runs = 0;
        for (const mood of MOOD_IDS) {
          for (let i = 0; i < 90; i += 1) {
            const [country, own] = NAMES[i % NAMES.length]!;
            const settings: Settings = {
              country,
              own,
              mood,
              metre,
              scheme,
              verses: 1 + Math.floor(rand() * 4),
              chorus: rand() < 0.7,
              themes: THEMES.filter(() => rand() < 0.25),
              include: [],
            };
            const seed = Math.floor(rand() * 2 ** 31);
            const result = generate(bank, settings, seed, { lexicon: lex });
            const found = faults(result, settings);
            if (found.length > 0) all.push(`${country}, ${mood}, seed ${seed}, ${JSON.stringify(settings.themes)}, ${settings.verses}v${settings.chorus ? '+c' : ''}:\n  ${found.join('\n  ')}`);
            // The name is said, in the chorus when there is one and else in the first verse.
            const home = result.anthem.stanzas[settings.chorus ? 1 : 0]!;
            if (home.lines.some((l) => l.text.includes(country))) said += 1;
            else all.push(`${country}, ${mood}, seed ${seed}: the name is not said`);
            runs += 1;
          }
        }
        expect(all.slice(0, 8)).toEqual([]);
        expect(said).toBe(runs);
      });
    }
  }
});

describe('the generator', () => {
  const base: Settings = { ...DEFAULT_SETTINGS, country: 'Teland', own: { teland: '10' } };

  it('gives the same anthem for the same seed, and another for another', () => {
    const a = generate(bank, base, 42, { lexicon: lex });
    const b = generate(bank, base, 42, { lexicon: lex });
    const c = generate(bank, base, 43, { lexicon: lex });
    expect(a).toEqual(b);
    expect(lyrics(a.anthem)).not.toBe(lyrics(c.anthem));
  });

  it('writes without a dictionary too, since the bank carries its own rhythm', () => {
    const result = generate(bank, { ...base, country: '' }, 5);
    expect(faults(result, { ...base, country: '' })).toEqual([]);
  });

  it('writes 8.7.8.7 as ABAB when AABB is asked, and says so', () => {
    const result = generate(bank, { ...base, scheme: 'AABB' }, 3, { lexicon: lex });
    expect(result.notes).toContainEqual({ kind: 'scheme', asked: 'AABB', used: 'ABAB' });
    expect(faults(result, { ...base, scheme: 'AABB' })).toEqual([]);
  });

  it('says so when the name fits no line', () => {
    const settings = { ...base, country: 'The United Provinces of Calderwynia' };
    const result = generate(bank, settings, 9, { lexicon: lex });
    expect(result.notes).toContainEqual({ kind: 'name', name: 'The United Provinces of Calderwynia' });
    expect(lyrics(result.anthem)).not.toContain('Calderwynia');
    expect(result.anthem.stanzas).toHaveLength(3);
  });

  it('works the words a person asks for into the lines', () => {
    let placed = 0;
    let asked = 0;
    for (let seed = 1; seed <= 40; seed += 1) {
      const settings: Settings = { ...base, metre: METRE_IDS[seed % 4]!, scheme: 'ABCB', verses: 3, include: ['harbour', 'tide', 'Selunna', 'Wynmere'], own: { teland: '10', selunna: '010', wynmere: '10' } };
      const result = generate(bank, settings, seed, { lexicon: lex });
      expect(faults(result, settings), `seed ${seed}`).toEqual([]);
      const text = lyrics(result.anthem);
      for (const word of result.placed) expect(text).toContain(word);
      for (const word of result.unplaced) expect(text).not.toContain(word);
      expect([...result.placed, ...result.unplaced].sort()).toEqual(['Selunna', 'Wynmere', 'harbour', 'tide']);
      placed += result.placed.length;
      asked += 4;
    }
    expect(placed / asked).toBeGreaterThan(0.85);
  });

  it('says which words found no place', () => {
    const settings = { ...base, include: ['archipelago', 'Xy'] };
    const result = generate(bank, settings, 2, { lexicon: lex });
    expect(result.unplaced).toContain('archipelago');
    expect(faults(result, settings)).toEqual([]);
  });

  it('sorts words to include into places and things', () => {
    expect(sortIncluded(['harbour', ' Selunna ', 'tide', 'harbour', '', 'New Wynmere'])).toEqual({ places: ['Selunna', 'New Wynmere'], things: ['harbour', 'tide'] });
  });

  it('keeps locked and typed lines, and rhymes the new ones with them', () => {
    const first = generate(bank, base, 11, { lexicon: lex }).anthem;
    const keep: Anthem = structuredClone(first);
    keep.stanzas[0]!.lines[1]!.locked = true;
    keep.stanzas[0]!.lines[3] = { ...keep.stanzas[0]!.lines[3]!, text: 'Keep the lantern burning bright.', typed: true };
    keep.title = 'My Own Title';
    keep.titleTyped = true;
    for (let seed = 100; seed < 130; seed += 1) {
      const next = generate(bank, base, seed, { lexicon: lex, keep });
      const lines = next.anthem.stanzas[0]!.lines;
      expect(lines[1]).toEqual(keep.stanzas[0]!.lines[1]);
      expect(lines[3]!.text).toBe('Keep the lantern burning bright.');
      expect(next.anthem.title).toBe('My Own Title');
      // The locked second line no longer rhymes with the typed fourth; that is the person's call.
      // But the first and third still rhyme with each other, and everything still scans.
      const found = faults(next, base).filter((f) => !f.includes('lines 2 and 4'));
      expect(found, `seed ${seed}`).toEqual([]);
    }
  });

  it('writes a new line to rhyme with a typed one', () => {
    const first = generate(bank, { ...base, scheme: 'ABCB' }, 21, { lexicon: lex }).anthem;
    const keep: Anthem = structuredClone(first);
    keep.stanzas[0]!.lines[3] = { ...keep.stanzas[0]!.lines[3]!, text: 'Keep the lantern burning bright.', typed: true };
    for (let seed = 1; seed <= 20; seed += 1) {
      const next = generate(bank, { ...base, scheme: 'ABCB' }, seed, { lexicon: lex, keep });
      expect(faults(next, { ...base, scheme: 'ABCB' }), `seed ${seed}`).toEqual([]);
    }
  });

  it('says so when nothing rhymes with a typed line', () => {
    const first = generate(bank, { ...base, scheme: 'ABCB' }, 21, { lexicon: lex }).anthem;
    const keep: Anthem = structuredClone(first);
    keep.stanzas[0]!.lines[3] = { ...keep.stanzas[0]!.lines[3]!, text: 'Sing the praises of Selunna.', typed: true };
    const next = generate(bank, { ...base, scheme: 'ABCB' }, 4, { lexicon: lex, keep });
    expect(next.notes).toContainEqual({ kind: 'rhyme', stanza: 0, line: 1 });
    expect(next.anthem.stanzas[0]!.lines[1]!.text).not.toBe('');
  });

  it('re-rolls one line and leaves the rest alone', () => {
    let changed = 0;
    let asked = 0;
    for (const metre of METRE_IDS) {
      const settings = { ...base, metre, verses: 3 };
      const first = generate(bank, settings, 77, { lexicon: lex });
      for (let stanza = 0; stanza < first.anthem.stanzas.length; stanza += 1) {
        for (let line = 0; line < 4; line += 1) {
          const next = rerollLine(bank, settings, first.anthem, { stanza, line }, 1000 + stanza * 4 + line, { lexicon: lex });
          expect(next.anthem.title).toBe(first.anthem.title);
          next.anthem.stanzas.forEach((st, si) =>
            st.lines.forEach((l, li) => {
              if (si !== stanza || li !== line) expect(l).toEqual(first.anthem.stanzas[si]!.lines[li]);
            }),
          );
          const now = next.anthem.stanzas[stanza]!.lines[line]!;
          const was = first.anthem.stanzas[stanza]!.lines[line]!;
          expect(now.kind).toBe(was.kind);
          asked += 1;
          if (now.text !== was.text) changed += 1;
          else expect(next.notes).toEqual([{ kind: 'only', stanza, line }]);
          expect(faults(next, settings).filter((f) => !f.includes('the name is not said')), `${metre} ${stanza}:${line}`).toEqual([]);
        }
      }
    }
    // How often a line has another that could stand in its place under every rule. With the core
    // batch alone it is about three in four; raise this floor as batches are added (0.9 by launch).
    expect(changed / asked).toBeGreaterThan(0.7);
    expect(rerollLine(bank, base, generate(bank, base, 1).anthem, { stanza: 9, line: 9 }, 1).notes).toEqual([]);
  });

  it('keeps what fits when the settings change under locked lines', () => {
    const first = generate(bank, base, 5, { lexicon: lex }).anthem;
    const keep: Anthem = structuredClone(first);
    keep.stanzas[1]!.lines[0]!.locked = true;
    const fewer = generate(bank, { ...base, verses: 1, chorus: false }, 6, { lexicon: lex, keep });
    expect(fewer.anthem.stanzas).toHaveLength(1);
    const more = generate(bank, { ...base, verses: 4 }, 6, { lexicon: lex, keep });
    expect(more.anthem.stanzas).toHaveLength(5);
    expect(more.anthem.stanzas[1]!.lines[0]).toEqual(keep.stanzas[1]!.lines[0]);
  });

  it('survives settings from a hostile link', () => {
    const odd = { country: 42, themes: 'sea', mood: 'jolly', metre: '9999', scheme: 'ZZZZ', verses: Number.NaN, chorus: 'yes', include: [1, 'x'.repeat(500), 'tide'], own: { 'Te land': 'abc', kwaz: '1' } } as unknown as Settings;
    const cleaned = cleanSettings(odd);
    expect(cleaned).toMatchObject({ country: '', themes: [], mood: 'solemn', metre: '8787', scheme: 'ABAB', verses: 2, chorus: true, own: { kwaz: '1' } });
    expect(cleaned.include[0]!.length).toBe(40);
    expect(() => generate(bank, odd, 1, { lexicon: lex })).not.toThrow();
    expect(cleanSettings({ ...base, verses: 99 }).verses).toBe(4);
    expect(cleanSettings({ ...base, verses: -3 }).verses).toBe(1);
    expect(() => generate(bank, base, Number.NaN)).not.toThrow();
    expect(() => generate(bank, base, 1, { keep: { title: '', titleTyped: false, stanzas: [] } })).not.toThrow();
  });

  it('writes titles in title case', () => {
    expect(titleCase('from the highlands to the waters')).toBe('From the Highlands to the Waters');
    expect(titleCase('song of teland')).toBe('Song of Teland');
    expect(titleCase('o teland')).toBe('O Teland');
    expect(titleCase('strong and steadfast')).toBe('Strong and Steadfast');
    for (let seed = 1; seed < 40; seed += 1) {
      const title = generate(bank, base, seed).anthem.title;
      expect(title).toMatch(/^\p{Lu}/u);
      expect(title).not.toMatch(/\{|\}/);
    }
  });
});
