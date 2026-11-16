// What the generator's page works out that isn't drawing: the notes it shows in words, the
// person's own words and how they are said, a theme typed by hand, the timing of the lines as
// they are sung in, what a profile file brings, and where a motto could go. Kept apart from the
// component so that tests can hold it to account.

import { decodeState } from '@eurth/style';
import type { Bank } from '../anthem/bank/types.ts';
import { MOOD_IDS } from '../anthem/bank/types.ts';
import { checkAnthem, setLock, typeLine, type At } from '../anthem/edit.ts';
import { MAX_VERSES, cleanSettings, type Anthem, type Note, type Result, type Settings } from '../anthem/generate.ts';
import { EMPTY_LEXICON, type Lexicon } from '../anthem/lexicon.ts';
import { fromLinkState } from '../anthem/link.ts';
import { KIND_PATTERN, METRES, METRE_IDS, SCHEME_IDS, schemeFor, type LineKind } from '../anthem/metre.ts';
import { anthemFromLyrics, mottoFits, readProfile, suggestedWords } from '../anthem/profile.ts';
import { cleanWord, scanWord, spellOut, tokenise } from '../anthem/scan.ts';
import { HIDDEN_THEMES, MOODS, THEMES, listInWords, type Theme } from '../anthem/themes.ts';

// ------------------------------------------------------------------------------------------ notes

/** "verse 2" or "the chorus", for a stanza by its place in the anthem. */
export function stanzaName(anthem: Anthem, index: number): string {
  const stanza = anthem.stanzas[index];
  if (!stanza) return 'the anthem';
  if (stanza.type === 'chorus') return 'the chorus';
  return `verse ${anthem.stanzas.slice(0, index + 1).filter((st) => st.type === 'verse').length}`;
}

/** One of the generator's notes, said plainly. */
export function noteInWords(note: Note, anthem: Anthem, settings: Settings): string {
  if (note.kind === 'scheme') {
    return `${METRES[cleanSettings(settings).metre].label} can’t be rhymed ${note.asked}: its long lines end on a weak beat and its short lines on a strong one, and those never truly rhyme. It is rhymed ${note.used} instead.`;
  }
  if (note.kind === 'name') return `“${note.name}” fits no line of this metre as it is said now, so the anthem doesn’t name it. Check how you say it below, or try another metre.`;
  if (note.kind === 'rhyme') return `Line ${note.line + 1} of ${stanzaName(anthem, note.stanza)} found no rhyme for the line you kept beside it. Write it again, or change one of the two.`;
  if (note.kind === 'only') return 'That is the only line that fits there. Unlock a line beside it, or type your own.';
  return `The phrase bank ran short in ${stanzaName(anthem, note.stanza)}, so one rule was relaxed there. Press Write lyrics for another try.`;
}

/** Everything a fresh anthem has to tell the person, most useful first. */
export function resultNotes(result: Result, settings: Settings): string[] {
  const out = result.notes.map((n) => noteInWords(n, result.anthem, settings));
  if (result.unplaced.length > 0) {
    const words = listInWords(result.unplaced.map((w) => `“${w}”`));
    out.push(`No line had room for ${words} this time. Press Write lyrics for another try, pick a different metre, or type ${result.unplaced.length === 1 ? 'it' : 'them'} into a line yourself.`);
  }
  return [...new Set(out)];
}

// ---------------------------------------------------------------------------- how a word is said

export interface SaidWord {
  /** As the person wrote it. */
  text: string;
  /** As it is looked up. */
  key: string;
  /** One digit per syllable, 1 for the main stress. */
  stress: string;
  /** "Se-LUN-na", or the word as written when it can't be split to match. */
  spelled: string;
  /** True when the person has set it themself. */
  own: boolean;
}

/**
 * The person's words that the dictionary doesn't know, in the order they were written: the
 * country first, then the words to include. These are the ones worth asking about.
 */
export function wordsToSay(rawSettings: Settings, lex: Lexicon): SaidWord[] {
  const settings = cleanSettings(rawSettings);
  const out: SaidWord[] = [];
  const seen = new Set<string>();
  for (const raw of [settings.country, ...settings.include].flatMap((text) => tokenise(text))) {
    const scan = scanWord(raw, lex, settings.own);
    if (scan.word === '' || seen.has(scan.word) || scan.word.includes('-')) continue;
    seen.add(scan.word);
    if (scan.source !== 'guess' && scan.source !== 'own') continue;
    const stress = scan.prons[0]!.stress;
    out.push({ text: raw, key: scan.word, stress, spelled: spellOut(raw, stress), own: scan.source === 'own' });
  }
  return out;
}

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth'];

export const MAX_SYLLABLES = 5;

/** The stress pattern for a word of so many syllables with its stress on one of them (from 0). */
export function stressFor(syllables: number, main: number): string {
  const n = Math.min(MAX_SYLLABLES, Math.max(1, Math.round(syllables)));
  const at = Math.min(n - 1, Math.max(0, Math.round(main)));
  return '0'.repeat(at) + '1' + '0'.repeat(n - at - 1);
}

/** Which syllable carries the stress (from 0). */
export function mainOf(stress: string): number {
  return Math.max(0, stress.indexOf('1'));
}

/** The settings with one word said the person's way. */
export function sayIt(settings: Settings, word: string, stress: string): Settings {
  return { ...settings, own: { ...settings.own, [cleanWord(word)]: stress } };
}

/** "2 syllables, stress on the first" */
export function stressInWords(stress: string): string {
  const n = stress.length;
  if (n === 1) return '1 syllable';
  return `${n} syllables, stress on the ${ORDINALS[mainOf(stress)] ?? 'last'}`;
}

// ----------------------------------------------------------------------------------------- themes

/** The themes the shipped bank has lines for. A theme whose batch is left out has no chip. */
export function themesWithLines(bank: Bank): Set<string> {
  return new Set(bank.templates.flatMap((t) => t.themes));
}

/** The chips, in alphabetical order: "The crown" under C, "The north" under N. */
export function chipThemes(bank: Bank): Theme[] {
  const have = themesWithLines(bank);
  const sortAs = (t: Theme) => t.label.toLowerCase().replace(/^the /, '');
  return THEMES.filter((t) => have.has(t.id)).sort((a, b) => sortAs(a).localeCompare(sortAs(b), 'en'));
}

const MAX_THEMES = 12;
const MAX_INCLUDE = 12;

/**
 * A theme the person typed. One the bank knows is switched on (that is how the emu is found). Any
 * other word can't be a theme, since there are no lines about it, so it joins the words to
 * include, and the page says so.
 */
export function addOwnTheme(raw: string, settings: Settings, available: ReadonlySet<string>): { settings: Settings; said: string } {
  const text = raw.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
  if (text === '') return { settings, said: '' };
  const bare = text.toLowerCase().replace(/^the /, '');
  const match = [...THEMES, ...HIDDEN_THEMES].find((t) => available.has(t.id) && [t.id, t.label.toLowerCase().replace(/^the /, ''), t.phrase.replace(/^the /, '')].includes(bare));
  if (match) {
    if (settings.themes.includes(match.id)) return { settings, said: `${match.label} is already one of your themes.` };
    if (settings.themes.length >= MAX_THEMES) return { settings, said: 'That is a full set of themes. Drop one to add another.' };
    const themes = [...settings.themes, match.id];
    if (match.id === 'emu') {
      // The emu lives in the chorus.
      return { settings: { ...settings, themes, chorus: true }, said: settings.chorus ? 'Emu it is. Listen for it in the chorus.' : 'Emu it is. It needs a chorus, so you have one now.' };
    }
    return { settings: { ...settings, themes }, said: `${match.label} is one of your themes now.` };
  }
  if (settings.include.some((w) => w.toLowerCase() === text.toLowerCase())) return { settings, said: `“${text}” is already among your words to include.` };
  if (settings.include.length >= MAX_INCLUDE) return { settings, said: 'There are no lines on that theme yet, and your words to include are full.' };
  return { settings: { ...settings, include: [...settings.include, text] }, said: `There are no lines on “${text}” yet, so it joins your words to include.` };
}

/** The words to include as the person types them in one field: "harbour, tide, Selunna". */
export function splitWords(text: string): string[] {
  return text
    .split(/[,;\n]+/)
    .map((w) => w.replace(/\s+/g, ' ').trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, MAX_INCLUDE);
}

// --------------------------------------------------------------------------------------- sung in

/** A line appears in under half a second, however long it is. */
const PER_SYLLABLE = 55;
const LONGEST = 480;
const BETWEEN_STANZAS = 160;

/**
 * When each line appears, in milliseconds from the start, as if the anthem were being sung:
 * a line takes as long as its syllables, and there is a breath between stanzas.
 */
export function sungTimes(anthem: Anthem): number[][] {
  let at = 0;
  return anthem.stanzas.map((stanza, si) => {
    if (si > 0) at += BETWEEN_STANZAS;
    return stanza.lines.map((line) => {
      const mine = at;
      const syllables = line.typed ? Math.max(4, tokenise(line.text).length * 1.5) : KIND_PATTERN[line.kind].length;
      at += Math.min(LONGEST, Math.round(syllables * PER_SYLLABLE));
      return mine;
    });
  });
}

// -------------------------------------------------------------------------------------- arriving

/** The settings and the anthem a link's `d` holds, or null. Never throws. */
export function fromParam(text: string | null | undefined): { settings: Settings; anthem: Anthem | null } | null {
  const state = decodeState(text);
  return state ? fromLinkState(state.value, state.version) : null;
}

export interface FromFile {
  settings: Settings;
  /** The anthem the file holds, if it holds one this page can read. */
  anthem: Anthem | null;
  /** The nation's motto, when it has one. */
  motto: string;
}

/**
 * What a profile file brings. An anthem Anthem saved comes back whole from its link; words from
 * somewhere else come back as typed lines (give the dictionary, and they get the metre and the
 * rhyme scheme they keep); otherwise the nation's name, capital and largest cities fill the
 * form, ready for a first draft.
 */
export function fromProfile(profile: unknown, current: Settings, host: string, lex: Lexicon = EMPTY_LEXICON): FromFile {
  const from = readProfile(profile);
  const root = typeof profile === 'object' && profile !== null ? (profile as Record<string, unknown>) : {};
  const section = typeof root.anthem === 'object' && root.anthem !== null ? (root.anthem as Record<string, unknown>) : null;

  // Only a link to this very tool is opened; a link is checked like any other arrival.
  if (section && typeof section.link === 'string') {
    try {
      const url = new URL(section.link);
      const read = url.protocol === 'https:' && url.host === host ? fromParam(url.searchParams.get('d')) : null;
      if (read?.anthem) return { settings: read.settings, anthem: read.anthem, motto: from.motto };
    } catch {
      // Not a link at all: carry on with what else the file has.
    }
  }

  const words = suggestedWords(from);
  const settings = cleanSettings({ ...current, country: from.country || current.country, include: words.length > 0 ? words : current.include });
  const theirs = section ? foreignAnthem(section, settings, lex) : null;
  return theirs ? { ...theirs, motto: from.motto } : { settings, anthem: null, motto: from.motto };
}

/**
 * An anthem written somewhere else (by hand, or by another tool): its lines come back as typed
 * lines, under the metre and the rhyme scheme they keep best, so that the page counts them
 * fairly. What the file says about itself (the fields Anthem writes) is believed where it is one
 * of Anthem's own choices.
 */
function foreignAnthem(section: Record<string, unknown>, base: Settings, lex: Lexicon): { settings: Settings; anthem: Anthem } | null {
  const blocks = typeof section.lyrics === 'string' ? section.lyrics.split(/\n\s*\n/).filter((b) => b.trim() !== '').length : 0;
  if (blocks === 0) return null;
  const mood = MOOD_IDS.find((id) => MOODS[id].toLowerCase() === section.mood) ?? base.mood;
  const themes = Array.isArray(section.themes) ? section.themes.filter((t): t is string => typeof t === 'string' && THEMES.some((theme) => theme.id === t)) : [];
  // Anthem's own shape is a chorus after the first verse. Words from elsewhere are all verses,
  // unless there are more of them than Anthem has verses.
  const chorus = blocks > MAX_VERSES;
  const shaped: Settings = { ...base, mood, themes, chorus, verses: chorus ? blocks - 1 : blocks };

  const faults = (settings: Settings): number | null => {
    const anthem = anthemFromLyrics(section, settings);
    if (!anthem) return null;
    return checkAnthem(anthem, settings, lex).flat().filter((check) => !check.fits || check.rhyme === 'no').length;
  };
  let best: Settings | null = null;
  let fewest = Infinity;
  const said = { metre: METRE_IDS.find((id) => METRES[id].label.toLowerCase() === section.metre), scheme: SCHEME_IDS.find((id) => id === section.rhyme) };
  for (const metre of said.metre ? [said.metre] : METRE_IDS) {
    for (const scheme of said.scheme ? [said.scheme] : SCHEME_IDS) {
      if (schemeFor(metre, scheme) !== scheme) continue;
      const settings = { ...shaped, metre, scheme };
      const count = faults(settings);
      // The first to do best wins: a fixed metre before free verse, ABAB before ABCB.
      if (count !== null && count < fewest) {
        fewest = count;
        best = settings;
      }
    }
  }
  if (!best) return null;
  const settings = cleanSettings(best);
  return { settings, anthem: anthemFromLyrics(section, settings)! };
}

// ------------------------------------------------------------------------------------- the motto

/**
 * Where a motto could be sung: a line of a shape it fits that the person hasn't made their own,
 * the last line of the chorus for choice, then the last line of the first verse, then anywhere.
 */
export function mottoPlace(anthem: Anthem, motto: string, lex: Lexicon, settings: Settings): At | null {
  const kinds = new Set<LineKind>(mottoFits(motto, lex, cleanSettings(settings).own));
  if (kinds.size === 0) return null;
  const order = anthem.stanzas.map((_, i) => i).sort((a, b) => Number(anthem.stanzas[b]!.type === 'chorus') - Number(anthem.stanzas[a]!.type === 'chorus'));
  for (const lineAt of [3, 1, 2, 0]) {
    for (const si of order) {
      const line = anthem.stanzas[si]!.lines[lineAt];
      if (line && kinds.has(line.kind) && !line.typed && !line.locked) return { stanza: si, line: lineAt };
    }
  }
  return null;
}

/** The anthem with the motto as one of its lines, kept through every rewrite. */
export function singMotto(anthem: Anthem, at: At, motto: string): Anthem {
  return setLock(typeLine(anthem, at, motto), at, true);
}
