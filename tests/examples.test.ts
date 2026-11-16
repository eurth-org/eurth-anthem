import { decodeState, encodeState } from '@eurth/style';
import { describe, expect, it } from 'vitest';
import { checkAnthem } from '../src/anthem/edit.ts';
import { EXAMPLES, EXAMPLE_SPECS, FIRST_EXAMPLE } from '../src/anthem/examples.ts';
import { fromLinkState } from '../src/anthem/link.ts';
import { METRE_IDS, SCHEME_IDS, schemeFor } from '../src/anthem/metre.ts';
import { lexicon } from './helpers.ts';

const lex = lexicon();

describe('the examples', () => {
  it('are all frozen, with the hand-written one among them', () => {
    expect(EXAMPLES.length).toBe(EXAMPLE_SPECS.length + 1);
    expect(EXAMPLES.filter((e) => e.byHand).map((e) => e.id)).toEqual(['calderwyn']);
    expect(new Set(EXAMPLES.map((e) => e.id)).size).toBe(EXAMPLES.length);
    expect(EXAMPLES[0]!.id).toBe(FIRST_EXAMPLE);
  });

  it('cover every metre in every rhyme scheme it can keep', () => {
    const have = new Set(EXAMPLES.map((e) => `${e.settings.metre} ${e.settings.scheme}`));
    for (const metre of METRE_IDS) {
      for (const scheme of SCHEME_IDS) {
        if (schemeFor(metre, scheme) !== scheme) continue;
        expect(have.has(`${metre} ${scheme}`), `${metre} ${scheme}`).toBe(true);
      }
    }
  });

  it('scan: every line fits its metre and keeps its rhyme, the hand-written one too', () => {
    for (const example of EXAMPLES) {
      const checks = checkAnthem(example.anthem, example.settings, lex);
      checks.forEach((stanza, si) =>
        stanza.forEach((check, li) => {
          const where = `${example.id}: ${example.anthem.stanzas[si]!.lines[li]!.text}`;
          expect(check.fits, where).toBe(true);
          if (check.partner >= 0) expect(check.rhyme, where).toBe('yes');
        }),
      );
    }
  });

  it('say their country’s name, and have the shape their settings ask for', () => {
    for (const example of EXAMPLES) {
      const words = example.anthem.stanzas.flatMap((st) => st.lines.map((l) => l.text)).join('\n');
      expect(words, example.id).toContain(example.nation);
      expect(example.anthem.stanzas.filter((st) => st.type === 'verse').length, example.id).toBe(example.settings.verses);
      expect(example.anthem.stanzas.some((st) => st.type === 'chorus'), example.id).toBe(example.settings.chorus);
      expect(example.note.length, example.id).toBeGreaterThan(30);
    }
  });

  it('come back from their links word for word', () => {
    for (const example of EXAMPLES) {
      const link = encodeState(example.state);
      expect(link.length, example.id).toBeLessThan(4000);
      const back = fromLinkState(decodeState(link)?.value);
      expect(back?.anthem, example.id).toEqual(example.anthem);
      expect(back?.settings, example.id).toEqual(example.settings);
    }
  });
});
