// Wikitext for a wiki page's anthem section: a sentence about the anthem and a lyrics box.
// Plain markup that works on any MediaWiki, IIWiki included: a wikitable, no templates and no
// extensions.

import { cleanSettings, type Anthem, type Settings } from './generate.ts';
import { METRES, schemeFor } from './metre.ts';
import { stanzaMetre } from './describe.ts';

/** Text from a person, made safe to stand in wikitext as plain words. */
export function wikiEscape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\[/g, '&#91;')
    .replace(/\]/g, '&#93;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/\|/g, '&#124;')
    .replace(/=/g, '&#61;')
    .replace(/'{2,}/g, (run) => '&#39;'.repeat(run.length))
    .replace(/~{3,}/g, (run) => '&#126;'.repeat(run.length))
    .replace(/__/g, '&#95;&#95;');
}

const NUMBERS = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];

export function wikitext(anthem: Anthem, rawSettings: Settings): string {
  const settings = cleanSettings(rawSettings);
  const title = wikiEscape(anthem.title);
  const verses = anthem.stanzas.filter((st) => st.type === 'verse').length;
  const chorus = anthem.stanzas.some((st) => st.type === 'chorus');
  const whose = settings.country === '' ? 'the national anthem' : `the national anthem of ${wikiEscape(settings.country)}`;
  const shape = `${NUMBERS[verses] ?? verses} ${verses === 1 ? 'verse' : 'verses'}${chorus ? ' and a chorus' : ''}`;
  const metre = settings.metre === 'free' ? 'in free verse' : `in the hymn metre ${METRES[settings.metre].label}`;
  const out: string[] = [
    '== National anthem ==',
    `"'''${title}'''" is ${whose}. It has ${shape}, written ${metre} and rhymed ${schemeFor(settings.metre, settings.scheme)}.`,
    '',
    '{| class="wikitable" style="margin: 1em auto; text-align: center;"',
    `|+ ''${title}''`,
  ];
  let verse = 0;
  for (const stanza of anthem.stanzas) {
    if (stanza.type === 'verse') verse += 1;
    const own = chorus && stanza.type === 'chorus' && settings.metre !== 'free' && stanzaMetre(stanza) !== METRES[settings.metre].label ? ` (${stanzaMetre(stanza)})` : '';
    out.push('|-', `! ${stanza.type === 'chorus' ? `Chorus${own}` : `Verse ${verse}`}`, '|-');
    const lines = stanza.lines.map((line) => wikiEscape(line.text));
    // A chorus in italics, as hymn books set a refrain.
    out.push(`| ${stanza.type === 'chorus' ? lines.map((l) => `''${l}''`).join('<br />') : lines.join('<br />')}`);
  }
  out.push('|}');
  return out.join('\n') + '\n';
}
