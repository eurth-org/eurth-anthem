// The glossary: the words Anthem and its guide use, each in a sentence or two. The page gives
// every term an id to link to and hands the whole set to search engines as a DefinedTermSet.
// The credit for the pronunciation dictionary is here too, since the Glossary page carries it.

export interface Term {
  term: string;
  /** Other names for the same thing. */
  also?: string;
  text: string;
}

export interface TermGroup {
  id: string;
  title: string;
  intro: string;
  terms: readonly Term[];
}

/** The id a term is linked by: "Common metre" is #common-metre. */
export function termId(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const GLOSSARY_TITLE = 'Glossary of anthem and hymn metre terms';
export const GLOSSARY_DESCRIPTION =
  'The words used in Anthem and its guide, in a sentence or two each: metre, iamb, trochee, common metre, feminine rhyme, refrain and more.';

export const GLOSSARY: readonly TermGroup[] = [
  {
    id: 'song',
    title: 'The song',
    intro: 'What an anthem is made of.',
    terms: [
      { term: 'National anthem', text: 'A song that stands for a country, sung or played at its ceremonies. Most are hymns or marches in style, and most are short.' },
      { term: 'Hymn', text: 'A song of praise or prayer, made to be sung by everyone present. Its verses all share one metre, so one tune serves them all.' },
      { term: 'March', text: 'Music to walk in step to, with a firm beat in twos or fours. An anthem in march style sounds resolute where a hymn sounds grave.' },
      { term: 'Verse', also: 'stanza', text: 'A group of lines that is sung once to the tune. Each verse says something new; the tune is the same every time.' },
      { term: 'Chorus', also: 'refrain', text: 'A verse that comes back after the others, with the same words each time. It is the part a crowd learns first, so it usually carries the country’s name.' },
      { term: 'Quatrain', text: 'A verse of four lines. Every verse Anthem writes is a quatrain.' },
      { term: 'Couplet', text: 'Two lines that belong together. A four-line verse is two couplets: the first line of each opens a thought and the second answers it.' },
      { term: 'Line', text: 'One row of a verse. In a hymn a line has a fixed number of syllables and ends where the singer breathes.' },
      { term: 'Lyrics', text: 'The words of a song, as opposed to its music.' },
      { term: 'Lyric sheet', also: 'hymn sheet', text: 'The words set out for singers: title, numbered verses, the chorus set apart, and the metre named so a tune can be chosen.' },
      { term: 'Short version', text: 'The part of an anthem that is actually sung on most occasions, often one verse and the chorus. Many countries name it officially.' },
    ],
  },
  {
    id: 'metre',
    title: 'Metre',
    intro: 'How a line is measured, so that words fit a tune.',
    terms: [
      { term: 'Syllable', text: 'One beat of a word as it is spoken: “an-them” has two, “har-mo-ny” three. Hymn lines are counted in syllables.' },
      { term: 'Stress', also: 'accent', text: 'The extra weight a syllable gets when a word is spoken: FREE-dom, be-LONG. Every word of two syllables or more has one main stress.' },
      { term: 'Beat', text: 'The pulse of a line. Strong and weak beats take turns, and a line sings well when its stressed syllables land on the strong ones.' },
      { term: 'Metre', also: 'meter', text: 'The pattern a line of verse keeps: how many syllables it has, and where the strong beats fall.' },
      { term: 'Hymn metre', text: 'A verse’s metre written as the number of syllables in each line: 8.7.8.7 is four lines of eight, seven, eight and seven syllables. Any text can be sung to any tune with the same numbers and the same beat.' },
      { term: 'Foot', text: 'The unit a metre repeats: one stressed syllable with one or two unstressed ones, in a set order.' },
      { term: 'Iamb', text: 'A foot of two syllables, weak then strong: a-RISE, the LAND. Lines built from iambs start softly and end firmly.' },
      { term: 'Trochee', text: 'A foot of two syllables, strong then weak: HOME-land, VAL-ley. Lines built from trochees start with a stamp.' },
      { term: 'Dactyl', text: 'A foot of three syllables, strong then two weak: HAR-mo-ny. It gives a waltzing line. Anthem does not write in dactyls.' },
      { term: 'Anapaest', text: 'A foot of three syllables, two weak then strong: ev-er-MORE. It gives a galloping line. Anthem does not write in anapaests.' },
      { term: 'Iambic', text: 'Made of iambs, so weak beat first. Common metre and long metre are iambic.' },
      { term: 'Trochaic', text: 'Made of trochees, so strong beat first. Most hymns in 8.7.8.7 are trochaic, and so are sevens.' },
      { term: 'Tetrameter', text: 'A line of four feet: eight syllables in iambs or trochees.' },
      { term: 'Trimeter', text: 'A line of three feet: six syllables in iambs.' },
      { term: 'Catalectic', text: 'Said of a line that stops one syllable short of its last foot. A seven-syllable trochaic line is a catalectic tetrameter: it ends on a strong beat where an eighth, weak syllable would have been.' },
      { term: 'Common metre', also: 'C.M., 8.6.8.6', text: 'Four iambic lines of eight, six, eight and six syllables. The metre of a great many hymns and ballads, and the easiest to find a tune for.' },
      { term: 'Ballad metre', text: 'Common metre worn loosely, as in folk ballads: the same four lines, but only the second and fourth rhyme, and an extra weak syllable is forgiven.' },
      { term: 'Long metre', also: 'L.M., 8.8.8.8', text: 'Four iambic lines of eight syllables each. Anthem keeps it for one occasion.' },
      { term: 'Short metre', also: 'S.M., 6.6.8.6', text: 'Four iambic lines of six, six, eight and six syllables. Not one of Anthem’s metres, but you will meet it in any hymn book.' },
      { term: '8.7.8.7', text: 'Four lines of eight, seven, eight and seven syllables, nearly always trochaic. The long lines end on a weak beat and the short ones on a strong beat, which gives the verse its swing.' },
      { term: 'Sevens', also: '7.7.7.7', text: 'Four trochaic lines of seven syllables each. Every line starts and ends on a strong beat, so it sounds bright and plain.' },
      { term: 'Doubled metre', also: 'D', text: 'A metre sung twice over to a tune of double length: 8.7.8.7 D is eight lines. Two of Anthem’s verses fill one verse of a doubled tune.' },
      { term: 'Free verse', text: 'Verse without one fixed metre. In Anthem it means that each verse may take a different shape, with lines of five to eleven syllables; the rhyme scheme still holds.' },
      { term: 'Scansion', also: 'to scan', text: 'Working out a line’s syllables and stresses. A line scans when it has the right number of syllables and its stresses fall on the strong beats.' },
      { term: 'Upbeat', also: 'anacrusis, pick-up', text: 'A weak syllable sung before the first strong beat. Every iambic line begins with one; a trochaic line has none.' },
    ],
  },
  {
    id: 'rhyme',
    title: 'Rhyme',
    intro: 'How lines are tied together by their endings.',
    terms: [
      { term: 'Rhyme', text: 'Two words rhyme when they sound the same from their last stressed vowel to the end, and differently before it: light and night.' },
      { term: 'True rhyme', also: 'perfect rhyme', text: 'A rhyme that is exact: the stressed vowels and everything after them match. The only kind Anthem writes.' },
      { term: 'Near rhyme', also: 'slant rhyme, half rhyme', text: 'A rhyme that almost matches: home and stone, meadow and shadow. Poets use it freely; Anthem leaves it to you, in a line you type yourself.' },
      { term: 'Identical rhyme', text: 'A word “rhymed” with itself or with a word that sounds exactly the same, such as one and won. It reads as a repeat, so Anthem does not count it as a rhyme.' },
      { term: 'Masculine rhyme', also: 'single rhyme', text: 'A rhyme on one stressed syllable at the end of the line: land and stand. Lines that end on a strong beat rhyme this way.' },
      { term: 'Feminine rhyme', also: 'double rhyme', text: 'A rhyme on two syllables, strong then weak: waters and daughters. Lines that end on a weak beat need it, which is why the long lines of 8.7.8.7 are the hardest to write.' },
      { term: 'Mosaic rhyme', text: 'A feminine rhyme made from more than one word: guide us and beside us.' },
      { term: 'Rhyme scheme', text: 'Which lines of a verse rhyme with which, written in letters: lines marked with the same letter rhyme.' },
      { term: 'ABAB', also: 'alternate rhyme', text: 'The first line rhymes with the third and the second with the fourth. The fullest of the three schemes, and the hardest.' },
      { term: 'AABB', also: 'couplets', text: 'The first line rhymes with the second and the third with the fourth. It cannot be done in 8.7.8.7, where neighbouring lines end on different beats.' },
      { term: 'ABCB', also: 'ballad rhyme', text: 'Only the second and fourth lines rhyme. The loosest scheme, and the one that leaves most room for the words you want.' },
      { term: 'End word', text: 'The last word of a line, the one that carries the rhyme. Anthem never ends two lines of one anthem on the same word.' },
    ],
  },
  {
    id: 'tunes',
    title: 'Words and tunes',
    intro: 'What happens when the words meet music.',
    terms: [
      { term: 'Hymn tune', text: 'A melody written for verses of one metre. A tune and a text are separate things: the same words can be moved to another tune of the same metre.' },
      { term: 'Tune name', text: 'The name a hymn tune goes by, apart from any words sung to it. Hymn books print it in capitals, with the metre beside it.' },
      { term: 'Metrical index', text: 'The list at the back of a hymn book that sorts its tunes by metre. Look up your anthem’s metre there to find every tune that fits it.' },
      { term: 'Setting', also: 'to set', text: 'Putting words to music, or the music they are put to. A poem is set to a tune.' },
      { term: 'Contrafactum', text: 'New words written for a tune that already exists. Several national anthems are contrafacta of older songs.' },
      { term: 'Melisma', text: 'Several notes sung on one syllable. It is how a singer stretches a short line over a longer phrase of music; hymns use it sparingly.' },
      { term: 'Unison', text: 'Everyone singing the same notes. Anthems are written to work in unison, without a choir.' },
    ],
  },
  {
    id: 'tool',
    title: 'In the tool',
    intro: 'Words that mean something particular in Anthem.',
    terms: [
      { term: 'Theme', text: 'What an anthem is about: the sea, the harvest, the crown. Each theme you choose is heard in every verse.' },
      { term: 'Mood', text: 'How an anthem carries itself: a solemn hymn, a martial march, hopeful, or pastoral. A solemn hymn says thee and thy; the others say you and your.' },
      { term: 'Words to include', text: 'Your nation’s own words: its capital, a river, a tree. Anthem works each into a line where its rhythm fits, and tells you which found no place.' },
      { term: 'Re-roll', text: 'Asking for one line to be written again. The new line keeps the metre, makes sense with its neighbours and rhymes where the scheme asks; if no other line can, the old one stays.' },
      { term: 'Lock', text: 'Marking a line to be kept. A locked line stays as it is when the rest is written again, and the new lines are written to rhyme with it.' },
      { term: 'Pronunciation dictionary', text: 'A list of words with their sounds and stresses. Anthem reads syllable counts and rhymes from one, so it can check the lines you type.' },
      { term: 'Profile file', text: 'The file that holds everything about your nation across Eurth’s tools. Anthem reads the country’s name and places from it and saves the anthem back into it.' },
    ],
  },
];

/** The pronunciation dictionary's credit, as its licence asks: the notice and the licence text travel with every copy. */
export const DICTIONARY_CREDIT = {
  name: 'The CMU Pronouncing Dictionary',
  short: 'CMUdict',
  maker: 'the Speech Group at Carnegie Mellon University',
  copyright: 'Copyright (C) 1993-2015 Carnegie Mellon University. All rights reserved.',
  licence: 'a two-clause BSD licence',
  url: 'https://github.com/cmusphinx/cmudict',
  /** The copy Anthem bundles. */
  commit: '74790861f652b15e4ac49015a90074ad62a27690',
  /** The full licence text, which the page prints. */
  licenceFile: 'data/cmudict/LICENSE',
  text: 'Syllable counts, stresses and rhymes come from the CMU Pronouncing Dictionary, a free dictionary of how English words are said, made by the Speech Group at Carnegie Mellon University. Anthem bundles a copy, unchanged apart from its packing. The dictionary describes North American speech, so now and then a British rhyme is missed.',
} as const;
