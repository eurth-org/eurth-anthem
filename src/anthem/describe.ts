// The anthem in words: its lyrics as plain text, and a description for Copy description, screen
// readers and the profile's summary.

import { cleanSettings, type Anthem, type Settings, type Stanza } from './generate.ts';
import { METRES, kindsLabel, schemeFor } from './metre.ts';
import { listInWords, themePhrase } from './themes.ts';

const NUMBERS = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];

/** "8.7.8.7" for the anthem's verses; "free verse" when the lines follow no one pattern. */
export function metreLabel(settings: Settings): string {
  return METRES[cleanSettings(settings).metre].label;
}

/** The metre printed above a stanza. A chorus may have its own. */
export function stanzaMetre(stanza: Stanza): string {
  return kindsLabel(stanza.kinds);
}

function stanzaText(stanza: Stanza): string {
  return stanza.lines.map((line) => line.text).join('\n');
}

/**
 * The words as plain text: one line per line, an empty line between stanzas, the first verse
 * first and the chorus second. This is what the profile's `anthem.lyrics` holds, so Wiki and Card
 * find the first verse by reading up to the first empty line.
 */
export function lyricsText(anthem: Anthem): string {
  return anthem.stanzas.map(stanzaText).join('\n\n');
}

/** The words with the title and a heading over each stanza, for Copy lyrics. */
export function lyricsSheet(anthem: Anthem, rawSettings: Settings): string {
  const settings = cleanSettings(rawSettings);
  const out: string[] = [anthem.title];
  if (settings.country !== '') out.push(`National anthem of ${settings.country}`);
  let verse = 0;
  for (const stanza of anthem.stanzas) {
    if (stanza.type === 'verse') verse += 1;
    out.push('', stanza.type === 'chorus' ? 'Chorus' : `Verse ${verse}`, stanzaText(stanza));
  }
  return out.join('\n');
}

/** One sentence about the anthem: what it is called, whose it is, its shape and what it sings of. */
export function summary(anthem: Anthem, rawSettings: Settings): string {
  const settings = cleanSettings(rawSettings);
  const verses = anthem.stanzas.filter((st) => st.type === 'verse').length;
  const chorus = anthem.stanzas.some((st) => st.type === 'chorus');
  const whose = settings.country === '' ? 'a national anthem' : `the national anthem of ${settings.country}`;
  const shape = `${NUMBERS[verses] ?? verses} ${verses === 1 ? 'verse' : 'verses'}${chorus ? ' and a chorus' : ''}`;
  const metre = settings.metre === 'free' ? 'in free verse' : `in ${METRES[settings.metre].label}`;
  const themes = settings.themes.filter((t) => t !== 'emu').map(themePhrase);
  const about = themes.length > 0 ? `, on ${listInWords(themes)}` : '';
  return `“${anthem.title}”, ${whose}: ${shape} ${metre}, rhymed ${schemeFor(settings.metre, settings.scheme)}${about}.`;
}

/** The summary and the first verse: what Copy description puts on the clipboard. */
export function describe(anthem: Anthem, settings: Settings): string {
  const first = anthem.stanzas.find((st) => st.type === 'verse');
  return first ? `${summary(anthem, settings)}\n\n${stanzaText(first)}` : summary(anthem, settings);
}
