import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { KIND_PATTERN, METRES, rhymeGroups } from '../src/anthem/metre.ts';
import { anyRhyme, lineEnds } from '../src/anthem/rhyme.ts';
import { fitLine, scanLine } from '../src/anthem/scan.ts';
import { DICTIONARY_CREDIT, GLOSSARY, GLOSSARY_DESCRIPTION, termId } from '../src/content/glossary.ts';
import { EXAMPLES, GUIDE, GUIDE_DESCRIPTION, GUIDE_FAQ, GUIDE_LEAD, GUIDE_UPDATED, SOURCES, type Block } from '../src/content/guide.ts';
import { lexicon } from './helpers.ts';

const lex = lexicon();
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const letters = (text: string) => text.toLowerCase().replace(/[^a-z]/g, '');

/** The beats as written: "FROM the HIGH-lands" is S w S w. */
function beatsOf(marked: string): string {
  return marked
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((chunk) => (chunk === chunk.toUpperCase() ? 'S' : chunk === chunk.toLowerCase() ? 'w' : '?'))
    .join('');
}

const termIds = GLOSSARY.flatMap((group) => group.terms.map((t) => termId(t.term)));
const blocks: Block[] = GUIDE.flatMap((section) => [...section.blocks]);
const html = [GUIDE_LEAD, ...blocks.flatMap((b) => ('p' in b ? [b.p] : 'list' in b ? b.list : 'steps' in b ? b.steps : 'table' in b ? b.table.rows.flat() : 'misfit' in b ? [b.misfit.why] : []))];

describe('the glossary', () => {
  it('has about forty terms or more, each with an id of its own', () => {
    expect(termIds.length).toBeGreaterThanOrEqual(40);
    expect(new Set(termIds).size).toBe(termIds.length);
    expect(new Set(GLOSSARY.map((g) => g.id)).size).toBe(GLOSSARY.length);
    for (const id of termIds) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('explains each term in a sentence or two', () => {
    for (const group of GLOSSARY) {
      expect(group.intro).toMatch(/\.$/);
      for (const t of group.terms) {
        expect(t.text.length, t.term).toBeGreaterThanOrEqual(40);
        expect(t.text.length, t.term).toBeLessThanOrEqual(320);
        expect(t.text, t.term).toMatch(/[.”]$/);
        expect(t.text, t.term).not.toMatch(/<|\s{2}/);
      }
    }
    expect(GLOSSARY_DESCRIPTION.length).toBeGreaterThanOrEqual(50);
    expect(GLOSSARY_DESCRIPTION.length).toBeLessThanOrEqual(200);
  });

  it('credits the dictionary as its licence asks', () => {
    const licence = resolve(root, DICTIONARY_CREDIT.licenceFile);
    expect(existsSync(licence)).toBe(true);
    expect(readFileSync(licence, 'utf8').split('\n')[0]).toBe(DICTIONARY_CREDIT.copyright);
    expect(readFileSync(resolve(root, 'data/cmudict/README.md'), 'utf8')).toContain(DICTIONARY_CREDIT.commit);
    expect(readFileSync(resolve(root, 'tools/build-dict.mjs'), 'utf8')).toContain(DICTIONARY_CREDIT.commit);
  });
});

describe('the guide', () => {
  it('covers what the brief asks, in order', () => {
    expect(GUIDE.map((s) => s.id)).toEqual(['what-anthems-say', 'verses-and-a-chorus', 'hymn-metres', 'rhyme', 'fitting-words-to-a-tune', 'writing-a-translation', 'an-official-short-version', 'try-it']);
    expect(GUIDE_DESCRIPTION.length).toBeGreaterThanOrEqual(50);
    expect(GUIDE_DESCRIPTION.length).toBeLessThanOrEqual(200);
    expect(GUIDE_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const item of GUIDE_FAQ) {
      expect(item.question).toMatch(/\?$/);
      expect(item.answer.length).toBeGreaterThanOrEqual(60);
      expect(item.answer.length).toBeLessThanOrEqual(400);
    }
  });

  it('links only to its own pages and to Eurth, and only to terms the glossary has', () => {
    for (const text of html) {
      for (const [, tag] of text.matchAll(/<\/?([a-z]+)/g)) expect(['a', 'cite', 'em', 'strong'], text).toContain(tag);
      for (const [, href] of text.matchAll(/href="([^"]*)"/g)) {
        if (href === 'https://eurth.org' || href === '/' || href === '/examples/' || href === '/glossary/') continue;
        expect(href, text).toMatch(/^\/glossary\/#/);
        expect(termIds, href).toContain(href!.slice('/glossary/#'.length));
      }
      expect(text).not.toMatch(/\s{2}|http:\/\//);
    }
  });

  it('names its sources, each once', () => {
    expect(SOURCES.length).toBeGreaterThanOrEqual(10);
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(SOURCES.length);
    expect(new Set(SOURCES.map((s) => s.title)).size).toBe(SOURCES.length);
    for (const source of SOURCES) {
      if (source.kind === 'wikipedia') expect(source.url, source.id).toBeUndefined();
      else expect(source.url, source.id).toMatch(/^https:\/\//);
      expect(source.note, source.id).toMatch(/\.$/);
    }
  });

  it('shows every example it has, and has every example it shows', () => {
    const shown = blocks.flatMap((b) => ('example' in b ? [b.example] : []));
    expect(shown.sort()).toEqual(EXAMPLES.map((e) => e.id).sort());
  });

  it('holds its example verses to their metre and their rhyme scheme', () => {
    for (const example of EXAMPLES) {
      const kinds = METRES[example.metre].lines!;
      const ends = example.lines.map((line, i) => {
        const pattern = KIND_PATTERN[kinds[i]!];
        const words = scanLine(line, lex, {});
        expect(fitLine(words, pattern).ok, `${example.id}: ${line}`).toBe(true);
        // The beats as marked are the metre's, and spell the same words.
        expect(beatsOf(example.beats[i]!), `${example.id}: ${example.beats[i]}`).toBe(pattern);
        expect(letters(example.beats[i]!)).toBe(letters(line));
        return lineEnds(words, pattern);
      });
      for (const [a, b] of rhymeGroups(example.scheme)) expect(anyRhyme(ends[a!]!, ends[b!]!), `${example.id}: lines ${a! + 1} and ${b! + 1}`).toBe(true);
    }
  });

  it('shows a line that has the right count and the wrong beat, and puts it right', () => {
    const misfits = blocks.flatMap((b) => ('misfit' in b ? [b.misfit] : []));
    expect(misfits.length).toBeGreaterThanOrEqual(1);
    for (const m of misfits) {
      const pattern = KIND_PATTERN[m.kind];
      const wrong = fitLine(scanLine(m.wrong, lex, {}), pattern);
      expect(wrong.ok).toBe(false);
      expect(wrong.problem?.kind).toBe('stress');
      expect(letters(m.wrongBeats)).toBe(letters(m.wrong));
      expect(fitLine(scanLine(m.right, lex, {}), pattern).ok).toBe(true);
      expect(beatsOf(m.rightBeats)).toBe(pattern);
      expect(letters(m.rightBeats)).toBe(letters(m.right));
    }
  });
});
