import { describe, expect, it } from 'vitest';
import { compileBank } from '../src/anthem/bank/compile.ts';
import { BATCHES } from '../src/anthem/bank/index.ts';
import { MOOD_IDS } from '../src/anthem/bank/types.ts';
import { describe as describeAnthem, lyricsSheet, lyricsText, summary } from '../src/anthem/describe.ts';
import { setLock, typeLine, typeTitle } from '../src/anthem/edit.ts';
import { DEFAULT_SETTINGS, cleanSettings, generate, type Settings } from '../src/anthem/generate.ts';
import { LINK_VERSION, fromLinkState, toLinkState } from '../src/anthem/link.ts';
import { METRE_IDS, SCHEME_IDS } from '../src/anthem/metre.ts';
import { anthemFromLyrics, anthemSection, mottoFits, readProfile, suggestedWords } from '../src/anthem/profile.ts';
import { wikiEscape, wikitext } from '../src/anthem/wikitext.ts';
import { lexicon, seeded } from './helpers.ts';

const lex = lexicon();
const { bank } = compileBank(BATCHES, lex);
const base: Settings = { ...DEFAULT_SETTINGS, country: 'Teland', own: { teland: '10' }, themes: ['sea', 'freedom'], include: ['harbour', 'Selunna'] };
const first = generate(bank, base, 8, { lexicon: lex }).anthem;
const throughJson = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

describe('the link', () => {
  it('brings back the same anthem and the same settings', () => {
    const rand = seeded(5);
    for (const metre of METRE_IDS) {
      for (const scheme of SCHEME_IDS) {
        for (const mood of MOOD_IDS) {
          const settings = cleanSettings({ ...base, metre, scheme, mood, verses: 1 + Math.floor(rand() * 4), chorus: rand() < 0.6 });
          let anthem = generate(bank, settings, Math.floor(rand() * 1e9), { lexicon: lex }).anthem;
          anthem = setLock(typeLine(anthem, { stanza: 0, line: 2 }, 'A line of my own, with “quotes” & <tags>'), { stanza: 0, line: 0 }, true);
          const back = fromLinkState(throughJson(toLinkState(settings, anthem)));
          expect(back).toEqual({ settings, anthem });
        }
      }
    }
  });

  it('leaves the defaults out, so a fresh page has a plain address', () => {
    expect(toLinkState(DEFAULT_SETTINGS, null)).toEqual({});
    expect(fromLinkState({})).toEqual({ settings: cleanSettings(DEFAULT_SETTINGS), anthem: null });
  });

  it('stays short enough to share', () => {
    const settings = { ...base, verses: 4 };
    const anthem = generate(bank, settings, 4, { lexicon: lex }).anthem;
    const json = JSON.stringify(toLinkState(settings, anthem));
    // Base64 adds a third; the whole link should stay well under two thousand characters.
    expect(Math.ceil((json.length * 4) / 3)).toBeLessThan(1900);
  });

  it('keeps a typed title', () => {
    const titled = typeTitle(first, 'Steady Against the Tide');
    expect(fromLinkState(throughJson(toLinkState(base, titled)))!.anthem).toMatchObject({ title: 'Steady Against the Tide', titleTyped: true });
  });

  it('reads settings without an anthem', () => {
    const back = fromLinkState(throughJson(toLinkState({ ...base, metre: '7777', verses: 3 }, null)));
    expect(back!.anthem).toBeNull();
    expect(back!.settings).toMatchObject({ metre: '7777', verses: 3, country: 'Teland', themes: ['sea', 'freedom'] });
  });

  it('turns away what is not a state, and clamps what is', () => {
    for (const junk of [null, undefined, 42, 'text', [], [1, 2]]) expect(fromLinkState(junk)).toBeNull();
    expect(fromLinkState({}, LINK_VERSION + 1)).toBeNull();
    const hostile = {
      c: '<script>alert(1)</script>'.repeat(20),
      t: ['sea', 7, 'x'.repeat(200)],
      m: 99,
      e: -1,
      r: 'ABAB',
      v: 1e9,
      h: 'no',
      i: 'harbour',
      o: { teland: '10', bad: '999999999999999999999', worse: {} },
      n: 5,
      s: [['v', '0101', [['ok', 'a', 0]]]],
    };
    const back = fromLinkState(hostile)!;
    expect(back.settings.country.length).toBe(80);
    expect(back.settings).toMatchObject({ mood: 'solemn', metre: '8787', scheme: 'ABAB', verses: 4, chorus: true, include: [], own: { teland: '10' } });
    expect(back.settings.themes).toEqual(['sea', 'x'.repeat(40)]);
    expect(back.anthem).toBeNull();
    expect(() => generate(bank, back.settings, 1, { lexicon: lex })).not.toThrow();
  });

  it('refuses stanzas that are not an anthem', () => {
    const good = toLinkState(base, first);
    const stanzas = good.s!;
    const broken: unknown[] = [
      { ...good, s: [stanzas[1], stanzas[0], stanzas[2]] }, // the chorus first
      { ...good, s: [stanzas[0], stanzas[1], stanzas[1]] }, // two choruses
      { ...good, s: [stanzas[1]] }, // no verse
      { ...good, s: [['v', '0909', stanzas[0]![2]]] }, // no such line shapes
      { ...good, s: [['v', '2323', stanzas[0]![2]]] }, // not this metre's shapes
      { ...good, s: [['v', '0101', stanzas[0]![2].slice(0, 3)]] }, // three lines
      { ...good, s: [['x', '0101', stanzas[0]![2]]] },
      { ...good, s: 'verses' },
    ];
    for (const state of broken) expect(fromLinkState(throughJson(state))!.anthem).toBeNull();
    // More stanzas than an anthem can have: the rest is dropped.
    const many = fromLinkState(throughJson({ ...good, s: [stanzas[0], stanzas[1], ...Array.from({ length: 30 }, () => stanzas[2])] }))!;
    expect(many.anthem!.stanzas.length).toBe(5);
    // Text in a line is cut to length and kept on one line.
    const long = structuredClone(good);
    long.s![0]![2][0]![0] = 'la\n'.repeat(400);
    expect(fromLinkState(throughJson(long))!.anthem!.stanzas[0]!.lines[0]!.text.length).toBeLessThanOrEqual(120);
  });
});

describe('the anthem in words', () => {
  it('gives the lyrics as plain text, first verse first', () => {
    const text = lyricsText(first);
    const blocks = text.split('\n\n');
    expect(blocks).toHaveLength(3);
    expect(blocks[0]).toBe(first.stanzas[0]!.lines.map((l) => l.text).join('\n'));
    expect(lyricsSheet(first, base).split('\n').slice(0, 4)).toEqual([first.title, 'National anthem of Teland', '', 'Verse 1']);
    expect(lyricsSheet(first, base)).toContain('\n\nChorus\n');
    expect(lyricsSheet(first, base)).toContain('\n\nVerse 2\n');
  });

  it('describes the anthem in a sentence', () => {
    const titled = typeTitle(first, 'Steady Against the Tide');
    expect(summary(titled, { ...base, themes: ['sea', 'freedom', 'unity'] })).toBe(
      '“Steady Against the Tide”, the national anthem of Teland: two verses and a chorus in 8.7.8.7, rhymed ABAB, on the sea, freedom and unity.',
    );
    const one = generate(bank, { ...DEFAULT_SETTINGS, metre: 'free', verses: 1, chorus: false, scheme: 'ABCB' }, 2).anthem;
    expect(summary(typeTitle(one, 'Song'), { ...DEFAULT_SETTINGS, metre: 'free', verses: 1, chorus: false, scheme: 'ABCB' })).toBe('“Song”, a national anthem: one verse in free verse, rhymed ABCB.');
    // 8.7.8.7 is written ABAB when AABB is asked, and the description says what was written.
    expect(summary(titled, { ...base, scheme: 'AABB', themes: [] })).toContain('rhymed ABAB.');
    const text = describeAnthem(titled, base);
    expect(text.split('\n\n')[1]).toBe(first.stanzas[0]!.lines.map((l) => l.text).join('\n'));
  });

  it('writes wikitext with a lyrics box that needs no template', () => {
    const titled = typeTitle(first, 'Steady Against the Tide');
    const wiki = wikitext(titled, base);
    expect(wiki).toMatch(/^== National anthem ==\n"'''Steady Against the Tide'''" is the national anthem of Teland\. It has two verses and a chorus, written in the hymn metre 8\.7\.8\.7 and rhymed ABAB\.\n/);
    expect(wiki).toContain('{| class="wikitable"');
    expect(wiki).toContain('! Verse 1');
    expect(wiki).toContain('! Chorus');
    expect(wiki).toContain('! Verse 2');
    expect(wiki.trimEnd().endsWith('|}')).toBe(true);
    expect(wiki).not.toMatch(/\{\{|<poem>/);
    expect(wiki.match(/<br \/>/g)).toHaveLength(9);
  });

  it('makes typed text harmless in wikitext', () => {
    expect(wikiEscape("[[Link]] {{Template}} <script> | a=b ''bold'' ~~~~ __TOC__ & more")).toBe(
      '&#91;&#91;Link&#93;&#93; &#123;&#123;Template&#125;&#125; &lt;script&gt; &#124; a&#61;b &#39;&#39;bold&#39;&#39; &#126;&#126;&#126;&#126; &#95;&#95;TOC&#95;&#95; &amp; more',
    );
    const nasty = typeTitle(typeLine(first, { stanza: 0, line: 0 }, '|- {{delete}} [[x]]'), "''Title'' |}");
    const wiki = wikitext(nasty, { ...base, country: 'Te|and' });
    expect(wiki).not.toContain('{{delete}}');
    expect(wiki).not.toContain('[[x]]');
    expect(wiki.match(/\|\}/g)).toHaveLength(1);
    expect(wiki).toContain('Te&#124;and');
  });
});

describe('the nation profile', () => {
  const calderwyn = {
    meta: { schema: 1, nation: 'Calderwyn', updated: '2026-11-13T21:05:44.000Z' },
    identity: { commonName: 'Calderwyn', officialName: 'Kingdom of Calderwyn', capital: 'Haldermouth', motto: 'By tide and by lantern' },
    cities: { list: [{ name: 'Haldermouth', population: 920000, capital: true }, { name: 'Wynmere', population: 410000 }, { name: 'Tarrowby' }, { name: 'Eskerholt' }, { name: 'Corvane' }, { name: 'Larkenfold' }, { name: 'Dunmarrow' }] },
    names: { language: 'Calderwynian', places: ['Haldermouth', 'Wynmere', 'Tarrowby', 'Eskerholt', 'Corvane', 'Larkenfold', 'Dunmarrow', 'Ashenford'] },
    flag: { svg: '<svg/>' },
  };

  it('reads the name, the capital, the motto, the cities and the place names', () => {
    const from = readProfile(calderwyn);
    expect(from).toEqual({
      country: 'Calderwyn',
      capital: 'Haldermouth',
      cities: ['Wynmere', 'Tarrowby', 'Eskerholt', 'Corvane', 'Larkenfold'],
      places: ['Dunmarrow', 'Ashenford'],
      motto: 'By tide and by lantern',
    });
    expect(suggestedWords(from)).toEqual(['Haldermouth', 'Wynmere', 'Tarrowby', 'Eskerholt']);
  });

  it('makes do with a profile that has little in it, or is not one', () => {
    expect(readProfile({ meta: { nation: 'Hesperwick' } })).toEqual({ country: 'Hesperwick', capital: '', cities: [], places: [], motto: '' });
    expect(readProfile({ meta: { nation: 'X' }, cities: { list: [{ name: 'Port' }, { name: 'Crown', capital: true }] } }).capital).toBe('Crown');
    for (const junk of [null, 'text', 7, [], { identity: 5, cities: { list: 'no' }, names: { places: [1, {}, 'Ok'] } }]) {
      expect(() => readProfile(junk)).not.toThrow();
    }
    expect(readProfile({ identity: { commonName: 'x'.repeat(500) } }).country.length).toBe(80);
  });

  it('writes an anthem with the profile’s own words in it', () => {
    const from = readProfile(calderwyn);
    const settings: Settings = { ...DEFAULT_SETTINGS, country: from.country, include: suggestedWords(from), own: { calderwyn: '100', haldermouth: '100', wynmere: '10', tarrowby: '100', eskerholt: '100' }, scheme: 'ABCB', verses: 3 };
    const result = generate(bank, settings, 12, { lexicon: lex });
    expect(lyricsText(result.anthem)).toContain('Calderwyn');
    expect(result.placed.length).toBeGreaterThanOrEqual(2);
  });

  it('says where a motto could be sung', () => {
    // "By tide and by lantern" is six syllables, but its stress doesn't fall as any of the lines do.
    expect(mottoFits('By tide and by lantern', lex)).toEqual([]);
    expect(mottoFits('Steady through the storm and night', lex)).toEqual(['T7']);
    expect(mottoFits('In peace and hope we stand', lex)).toEqual(['I6']);
    expect(mottoFits('', lex)).toEqual([]);
  });

  it('writes the anthem section and keeps what it does not know', () => {
    const titled = typeTitle(first, 'Steady Against the Tide');
    const section = anthemSection(titled, base, 'https://anthem.eurth.org/?d=1.abc', { link: 'https://old.example/', arrangedFor: 'brass band', title: 'Old' });
    expect(section).toMatchObject({
      link: 'https://anthem.eurth.org/?d=1.abc',
      title: 'Steady Against the Tide',
      metre: '8.7.8.7',
      rhyme: 'ABAB',
      mood: 'solemn hymn',
      themes: ['sea', 'freedom'],
      arrangedFor: 'brass band',
    });
    expect(section.lyrics).toBe(lyricsText(titled));
    expect((section.summary as string).length).toBeLessThanOrEqual(600);
    expect((section.lyrics as string).split('\n\n')[0]).toBe(first.stanzas[0]!.lines.map((l) => l.text).join('\n'));
    // A link that isn't https is left out, not written.
    expect(anthemSection(titled, base, 'javascript:alert(1)', { link: 'https://old.example/' }).link).toBeUndefined();
    expect(anthemSection(titled, { ...base, metre: 'free' }, 'https://anthem.eurth.org/').metre).toBe('free');
  });

  it('reads back an anthem that was written by hand', () => {
    const section = {
      title: 'Lanterns on the Water',
      lyrics:
        'Where the Calder meets the morning\nAnd the harbour bells begin,\nEvery lantern keeps its promise:\nGuide the weary sailor in.\n\nFrom the uplands to the tide-line,\nField and ferry, hearth and quay,\nOne the light and one the river,\nCalderwyn, we sing to thee.',
    };
    const anthem = anthemFromLyrics(section, { ...DEFAULT_SETTINGS, chorus: false })!;
    expect(anthem.title).toBe('Lanterns on the Water');
    expect(anthem.stanzas.map((st) => st.type)).toEqual(['verse', 'verse']);
    expect(anthem.stanzas.every((st) => st.lines.every((l) => l.typed))).toBe(true);
    expect(anthem.stanzas[1]!.lines[3]!.text).toBe('Calderwyn, we sing to thee.');
    // Nothing of it is rewritten when the anthem is written again.
    const again = generate(bank, { ...DEFAULT_SETTINGS, chorus: false }, 3, { lexicon: lex, keep: anthem }).anthem;
    expect(lyricsText(again)).toBe(section.lyrics);
    expect(anthemFromLyrics({ lyrics: 'One line only' }, DEFAULT_SETTINGS)).toBeNull();
    expect(anthemFromLyrics({ lyrics: 7 }, DEFAULT_SETTINGS)).toBeNull();
    expect(anthemFromLyrics(null, DEFAULT_SETTINGS)).toBeNull();
  });
});
