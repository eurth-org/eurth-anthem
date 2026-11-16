// Writes a review page for each batch of the phrase bank: content/review/<nn>-<batch>.md.
// Every phrase and every line of the batch, numbered, with an example of each line filled in,
// and sample verses in every metre. Stijn reads the page and says what to cut or change; a batch
// is marked reviewed only when he says so.
//
//   npm run review
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BATCHES } from '../src/anthem/bank/index.ts';
import { MOOD_IDS, type Bank, type Role, type Template } from '../src/anthem/bank/types.ts';
import { DEFAULT_SETTINGS, generate, type Settings } from '../src/anthem/generate.ts';
import { LINE_KINDS, METRES, METRE_IDS, kindsLabel, type LineKind, type SchemeId } from '../src/anthem/metre.ts';
import { loadBank, loadLexicon } from './load.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lex = loadLexicon();
const { bank, problems } = loadBank(lex);
if (problems.length > 0) {
  for (const problem of problems) console.error(`! ${problem}`);
  process.exit(1);
}

const KIND_NAMES: Record<LineKind, string> = {
  T8: 'Eight syllables, strong beat first (DUM-da DUM-da DUM-da DUM-da)',
  T7: 'Seven syllables, strong beat first (DUM-da DUM-da DUM-da DUM)',
  I8: 'Eight syllables, weak beat first (da-DUM da-DUM da-DUM da-DUM)',
  I6: 'Six syllables, weak beat first (da-DUM da-DUM da-DUM)',
};
const ROLE_NAMES: Record<Role, string> = {
  address: 'Speaking to the land',
  state: 'Statements',
  call: 'Calls and wishes',
  lead: 'Openings that need a line after them',
  cont: 'Lines that carry a statement on',
  contCall: 'Lines that carry a call on',
  close: 'Last lines',
};
const ROLE_ORDER: Role[] = ['address', 'state', 'call', 'lead', 'cont', 'contCall', 'close'];
const RHYTHM = (pattern: string) => [...pattern].map((c) => (c === 'S' ? 'DUM' : 'da')).join('-');

// Made-up names for the examples, one of each shape.
const EXAMPLE_NAMES: Record<string, string> = {
  S: 'Kwaz', Sw: 'Teland', wS: 'Varoon', SwS: 'Calderwyn', wSw: 'Selunna', SwSw: 'Valderona', wSwS: 'Kelomartha', SwSwS: 'Calderwynia',
};
const EXAMPLE_PLACES: Record<string, string[]> = {
  S: ['Thorne', 'Brix'], Sw: ['Wynmere', 'Corvane'], wS: ['Marlay', 'Dunmar'], SwS: ['Haldermouth', 'Larkenfold'], wSw: ['Selunna', 'Orlanda'],
  SwSw: ['Valderona', 'Montavera'], wSwS: ['Kelomartha', 'Avendriel'], SwSwS: ['Calderwynia', 'Estavaria'],
};

/** One line made from a template, taking the plain phrases of each class in turn. */
function example(theBank: Bank, t: Template, turn: number): string {
  const taken = new Map<string, number>();
  let text = '';
  for (const part of t.parts) {
    if ('lit' in part) {
      text += part.lit;
      continue;
    }
    const cls = theBank.classes[part.cls]!;
    const n = taken.get(cls.id) ?? 0;
    taken.set(cls.id, n + 1);
    if (cls.runtime === 'name') text += EXAMPLE_NAMES[cls.pattern];
    else if (cls.runtime === 'place') text += EXAMPLE_PLACES[cls.pattern]![n % 2];
    else {
      const usable = cls.items.filter((i) => (i.reg === null || i.reg === (t.reg ?? i.reg)) && (i.themes.length === 0 || i.themes.some((th) => t.themes.includes(th))));
      const pool = usable.length > 0 ? usable : cls.items;
      text += pool[(turn * 3 + n * 5 + cls.id.length) % pool.length]!.text;
    }
  }
  return text.replace(/\p{L}/u, (c) => c.toUpperCase());
}

function readable(t: Template): string {
  return t.parts.map((p) => ('lit' in p ? p.lit : `[${p.cls.slice(0, p.cls.lastIndexOf('.'))}]`)).join('');
}

function notes(t: Template): string {
  const out: string[] = [];
  if (t.nameCls) out.push(`a name that goes ${RHYTHM(t.nameCls.slice(t.nameCls.indexOf('.') + 1))}`);
  for (const cls of new Set(t.placeCls)) out.push(`a place that goes ${RHYTHM(cls.slice(cls.indexOf('.') + 1))}`);
  if (t.parts.some((p) => 'cls' in p && p.open)) out.push('can take a word to include');
  if (t.reg) out.push(t.reg === 'thee' ? 'solemn only (thee)' : 'not solemn (you)');
  if (t.moods.length > 0) out.push(`mood: ${t.moods.join(', ')}`);
  if (t.themes.length > 0) out.push(`theme: ${t.themes.join(', ')}`);
  if (t.to === 'people') out.push('to the people');
  if (t.to === 'god') out.push('to God');
  if (t.chorus !== 'any') out.push(t.chorus === 'only' ? 'chorus only' : 'never in a chorus');
  return out.join('; ');
}

function samples(theBank: Bank, themes: readonly string[]): string {
  const out: string[] = [];
  const schemes: SchemeId[] = ['ABAB', 'ABCB', 'AABB'];
  const names: [string, Record<string, string>][] = [
    ['Teland', { teland: '10' }],
    ['Selunna', { selunna: '010' }],
    ['Calderwyn', { calderwyn: '100' }],
    ['Kwaz', {}],
    ['Valderona', { valderona: '2010' }],
  ];
  let n = 0;
  for (const metre of METRE_IDS) {
    for (let i = 0; i < 5; i += 1) {
      const [country, own] = names[(n + i) % names.length]!;
      const mood = MOOD_IDS[(n + i) % MOOD_IDS.length]!;
      const scheme = schemes[(n + i) % schemes.length]!;
      // A themed batch is heard with its own themes chosen, one at a time.
      const chosen = themes.length > 0 ? [themes[(n + i) % themes.length]!] : [];
      const settings: Settings = { ...DEFAULT_SETTINGS, country, own, metre, scheme, mood, themes: chosen, verses: 1, chorus: true };
      const result = generate(theBank, settings, 1000 + n * 10 + i, { lexicon: lex });
      // The chorus carries the name, so show it; then the verse.
      for (const stanza of [result.anthem.stanzas[1]!, result.anthem.stanzas[0]!]) {
        const said = result.notes.find((note) => note.kind === 'scheme');
        out.push(`**${METRES[metre].label}${metre === 'free' ? ` (${kindsLabel(stanza.kinds)})` : ''}, ${said ? said.used : scheme}, ${mood}${chosen.length > 0 ? `, on ${chosen.join(' and ')}` : ''}, ${stanza.type}**\n`);
        out.push(stanza.lines.map((l) => `> ${l.text}`).join('  \n'));
        out.push('');
      }
    }
    n += 1;
  }
  return out.join('\n');
}

BATCHES.forEach((batch, index) => {
  const number = String(index + 1).padStart(2, '0');
  const mine = bank.templates.filter((t) => t.batch === batch.id);
  const lines: string[] = [];
  lines.push(`# Batch ${index + 1}: ${batch.title}`);
  lines.push('');
  lines.push(`**Status: ${batch.reviewed ? 'reviewed' : 'draft, waiting for review'}.** Made by \`npm run review\` from \`src/anthem/bank/${batch.id}.ts\`; don't edit this page by hand.`);
  lines.push('');
  lines.push('Everything here is original writing for Anthem. Nothing is quoted or adapted from a real anthem, hymn or song.');
  lines.push('');
  lines.push('## How to review');
  lines.push('');
  lines.push('- **Lines** are numbered (L1, L2, ...). Each shows the line as written, with its slots in square brackets, and one example filled in. Say which to cut or change: "cut L14", "L22: say *keep* instead of *hold*".');
  lines.push('- **Phrases** are the words that fill the slots, in groups that can stand in for each other. Say which don\'t belong: "cut *hardy* from virtue".');
  lines.push('- The **sample verses** at the end show how lines and phrases combine. If a combination reads wrongly, tell me which, and I\'ll find the line or the phrase behind it.');
  lines.push('- Every line already scans and every rhyme is a true rhyme: the tests check that against the dictionary. What needs your eye is sense, tone and taste.');
  lines.push('');

  lines.push('## Phrases');
  lines.push('');
  lines.push('A tag after a phrase limits it: `#sea` only when that theme is chosen, `@march` only in that mood.');
  lines.push('');
  for (const [id, list] of Object.entries(batch.classes)) {
    const cls = bank.classes[id]!;
    const name = id.slice(0, id.lastIndexOf('.'));
    lines.push(`- **${name}** (${RHYTHM(cls.pattern)}): ${list.split(',').map((item) => item.trim()).join(', ')}`);
  }
  lines.push('');

  lines.push('## Lines');
  lines.push('');
  let count = 0;
  for (const kind of LINE_KINDS) {
    const ofKind = mine.filter((t) => t.kind === kind);
    if (ofKind.length === 0) continue;
    lines.push(`### ${KIND_NAMES[kind]}`);
    lines.push('');
    for (const role of ROLE_ORDER) {
      const group = ofKind.filter((t) => t.role === role);
      if (group.length === 0) continue;
      lines.push(`#### ${ROLE_NAMES[role]}`);
      lines.push('');
      lines.push('| | Line | For example | Notes |');
      lines.push('| --- | --- | --- | --- |');
      for (const t of group) {
        count += 1;
        lines.push(`| L${count} | ${readable(t)} | ${example(bank, t, count)} | ${notes(t)} |`);
      }
      lines.push('');
    }
  }

  if (batch.titles && batch.titles.length > 0) {
    lines.push('## Titles');
    lines.push('');
    batch.titles.forEach((title, i) => lines.push(`- T${i + 1}: ${title.replace(/\{name\}/g, '[the country]').replace(/\{([^}]+)\.[Sw]+\}/g, '[$1]')}`));
    lines.push('');
  }

  lines.push('## Sample verses');
  lines.push('');
  lines.push(`Twenty choruses and twenty verses, made by the generator from the whole bank as it stands, in every metre${mine.some((t) => t.themes.length > 0) ? ', with this batch\'s themes chosen' : ''}. The names are made up.`);
  lines.push('');
  lines.push(samples(bank, [...new Set(mine.flatMap((t) => t.themes))]));

  const target = resolve(root, `content/review/${number}-${batch.id}.md`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
  console.log(`${target}: ${count} lines, ${Object.keys(batch.classes).length} groups of phrases`);
});
