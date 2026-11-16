// The examples: anthems of made-up nations, one for every metre and rhyme scheme. Each was
// written by the generator from the settings and the seed here, and then frozen as the same
// small object a link carries (examples.data.ts), so it stays word for word what it was while
// the phrase banks go on changing. `npm run examples` writes the ones that are missing;
// `npm run examples -- --all` writes every one again.
//
// One is written by hand: Calderwyn's, from the example profile in @eurth/profile.

import { DEFAULT_SETTINGS, type Anthem, type Settings } from './generate.ts';
import { fromLinkState, toLinkState, type LinkState } from './link.ts';
import { anthemFromLyrics } from './profile.ts';
import { FROZEN } from './examples.data.ts';

export interface ExampleSpec {
  id: string;
  nation: string;
  /** A line about the nation and its anthem, for the Examples page. */
  note: string;
  settings: Settings;
  seed: number;
}

const spec = (id: string, nation: string, seed: number, note: string, settings: Partial<Settings>): ExampleSpec => ({
  id,
  nation,
  note,
  seed,
  settings: { ...DEFAULT_SETTINGS, country: nation, ...settings },
});

export const EXAMPLE_SPECS: readonly ExampleSpec[] = [
  spec('teland', 'Teland', 40, 'A seafaring republic on a cold coast. A solemn hymn with its capital, Selunna, in it.', {
    themes: ['sea', 'freedom', 'unity'],
    include: ['harbour', 'tide', 'Selunna'],
    own: { teland: '10', selunna: '010' },
  }),
  spec('skarholt', 'Skarholt', 2, 'A mountain kingdom that likes to be reminded of it. A march in three verses.', {
    mood: 'march',
    scheme: 'ABCB',
    verses: 3,
    themes: ['mountains', 'north', 'crown'],
    own: { skarholt: '10' },
  }),
  spec('ilvenna', 'Ilvenna', 1, 'A quiet country of woods and slow rivers, at peace and glad of it.', {
    mood: 'hopeful',
    metre: '8686',
    themes: ['forests', 'rivers', 'peace'],
    own: { ilvenna: '010' },
  }),
  spec('korrin', 'Korrin', 1, 'A workers’ commonwealth of forges and looms. Rhymed in pairs, to be shouted as much as sung.', {
    mood: 'march',
    metre: '8686',
    scheme: 'AABB',
    themes: ['labour', 'unity'],
    own: { korrin: '10' },
  }),
  spec('norrendale', 'Norrendale', 1, 'Farmland from one horizon to the other. Common metre rhymed as a ballad, for a harvest supper.', {
    mood: 'pastoral',
    metre: '8686',
    scheme: 'ABCB',
    verses: 3,
    themes: ['harvest', 'home', 'plains'],
    own: { norrendale: '102' },
  }),
  spec('hallowmere', 'Hallowmere', 1, 'An old and devout nation. Two verses and no chorus: a prayer, and a promise to remember.', {
    metre: '7777',
    chorus: false,
    themes: ['faith', 'remembrance'],
    own: { hallowmere: '102' },
  }),
  spec('maravel', 'Maravel', 1, 'A young republic, a generation on from its revolution and still proud of the noise it made.', {
    mood: 'march',
    metre: '7777',
    scheme: 'AABB',
    themes: ['revolution', 'freedom', 'dawn'],
    own: { maravel: '102' },
  }),
  spec('brell', 'Brell', 1, 'A small island with a short anthem: one verse and a chorus, which is all most people sing anyway.', {
    mood: 'hopeful',
    metre: '7777',
    scheme: 'ABCB',
    verses: 1,
    themes: ['dawn', 'home'],
    own: { brell: '1' },
  }),
  spec('valdor', 'Valdor', 1, 'River valleys and vineyards. Free verse: each stanza takes its own shape, and the rhymes still hold.', {
    mood: 'pastoral',
    metre: 'free',
    themes: ['rivers', 'harvest', 'peace'],
    own: { valdor: '01' },
  }),
  spec('sundermere', 'Sundermere', 1, 'A lake country of fishing towns, cheerful about it.', {
    mood: 'hopeful',
    metre: 'free',
    scheme: 'AABB',
    themes: ['sea', 'home'],
    own: { sundermere: '102' },
  }),
  spec('avenmoor', 'Avenmoor', 3, 'A northern crown with a long memory. Four verses, sung in full once a year and one at a time otherwise.', {
    metre: 'free',
    scheme: 'ABCB',
    verses: 4,
    chorus: false,
    themes: ['remembrance', 'north', 'crown'],
    own: { avenmoor: '102' },
  }),
];

export interface Example {
  id: string;
  nation: string;
  note: string;
  settings: Settings;
  anthem: Anthem;
  /** What goes in the link: `/?d=` and this, encoded. */
  state: LinkState;
  /** Written by hand, not by the generator. */
  byHand: boolean;
}

// Calderwyn's anthem as the example profile in @eurth/profile has it: 8.7.8.7, rhymed ABCB.
const CALDERWYN_SETTINGS: Settings = { ...DEFAULT_SETTINGS, country: 'Calderwyn', scheme: 'ABCB', chorus: false, themes: ['rivers', 'sea', 'home'], own: { calderwyn: '102', calder: '10' } };
const CALDERWYN_LYRICS =
  'Where the Calder meets the morning\nAnd the harbour bells begin,\nEvery lantern keeps its promise:\nGuide the weary sailor in.\n\nFrom the uplands to the tide-line,\nField and ferry, hearth and quay,\nOne the light and one the river,\nCalderwyn, we sing to thee.';

function byHand(): Example {
  const anthem = anthemFromLyrics({ title: 'Lanterns on the Water', lyrics: CALDERWYN_LYRICS }, CALDERWYN_SETTINGS)!;
  return {
    id: 'calderwyn',
    nation: 'Calderwyn',
    note: 'Written by hand, not by the generator: the anthem of the example nation that travels through all the Eurth tools. Open it to see how Anthem counts lines it didn’t write.',
    settings: CALDERWYN_SETTINGS,
    anthem,
    state: toLinkState(CALDERWYN_SETTINGS, anthem),
    byHand: true,
  };
}

function frozen(one: ExampleSpec): Example | null {
  const state = FROZEN[one.id];
  const read = state ? fromLinkState(state) : null;
  if (!state || !read?.anthem) return null;
  return { id: one.id, nation: one.nation, note: one.note, settings: read.settings, anthem: read.anthem, state, byHand: false };
}

/** Every example that has been frozen, and Calderwyn's after the first. */
export const EXAMPLES: readonly Example[] = (() => {
  const made = EXAMPLE_SPECS.map(frozen).filter((e): e is Example => e !== null);
  return [...made.slice(0, 1), byHand(), ...made.slice(1)];
})();

/** What the generator shows before anyone has touched it. */
export const FIRST_EXAMPLE = 'teland';
