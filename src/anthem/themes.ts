// The themes and moods a person can choose, with the words the page and the exports use for them.
// A theme only does something once a batch of the phrase bank is written for it.

import type { MoodId } from './bank/types.ts';

export interface Theme {
  id: string;
  /** On the chip. */
  label: string;
  /** In a sentence: "an anthem on the sea, freedom and the crown". */
  phrase: string;
}

export const THEMES: readonly Theme[] = [
  { id: 'sea', label: 'Sea', phrase: 'the sea' },
  { id: 'rivers', label: 'Rivers', phrase: 'rivers' },
  { id: 'mountains', label: 'Mountains', phrase: 'the mountains' },
  { id: 'north', label: 'The north', phrase: 'the north' },
  { id: 'forests', label: 'Forests', phrase: 'forests' },
  { id: 'plains', label: 'Plains', phrase: 'the plains' },
  { id: 'freedom', label: 'Freedom', phrase: 'freedom' },
  { id: 'revolution', label: 'Revolution', phrase: 'revolution' },
  { id: 'unity', label: 'Unity', phrase: 'unity' },
  { id: 'faith', label: 'Faith', phrase: 'faith' },
  { id: 'labour', label: 'Labour', phrase: 'labour' },
  { id: 'harvest', label: 'Harvest', phrase: 'the harvest' },
  { id: 'crown', label: 'The crown', phrase: 'the crown' },
  { id: 'dawn', label: 'Dawn', phrase: 'the dawn' },
  { id: 'remembrance', label: 'Remembrance', phrase: 'remembrance' },
  { id: 'peace', label: 'Peace', phrase: 'peace' },
  { id: 'home', label: 'Home', phrase: 'home' },
];

/** Not on a chip: found by typing it. */
export const HIDDEN_THEMES: readonly Theme[] = [{ id: 'emu', label: 'Emu', phrase: 'the emu' }];

export const MOODS: Readonly<Record<MoodId, string>> = {
  solemn: 'Solemn hymn',
  march: 'Martial march',
  hopeful: 'Hopeful',
  pastoral: 'Pastoral',
};

export function themePhrase(id: string): string {
  return [...THEMES, ...HIDDEN_THEMES].find((t) => t.id === id)?.phrase ?? id;
}

/** "the sea, freedom and unity" */
export function listInWords(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
