// The guide: how to write a national anthem, for worldbuilders. The page lays these blocks out
// and builds the source links with @eurth/style's `wikipedia()` and `ref()`.
//
// Real anthems are named and described here, and never quoted. The example verses are written
// for Anthem; tests hold each to its metre and its rhyme scheme.
//
// Paragraphs are HTML with a few tags only: <a href> to this site's own pages and to eurth.org,
// <cite> for the title of a song, <em>, and lang where a title is in another language. Links to
// anywhere else belong in SOURCES.

import type { LineKind, MetreId, SchemeId } from '../anthem/metre.ts';

export interface Example {
  id: string;
  metre: Exclude<MetreId, 'free' | '8888'>;
  scheme: SchemeId;
  caption: string;
  /** The verse as sung. */
  lines: readonly [string, string, string, string];
  /** The same lines split into syllables, the strong beats in capitals. */
  beats: readonly [string, string, string, string];
}

export type Block =
  | { p: string }
  | { list: readonly string[] }
  | { steps: readonly string[] }
  | { table: { head: readonly string[]; rows: readonly (readonly string[])[] } }
  | { example: string }
  /** A line that goes wrong, and the same thought put right. */
  | { misfit: { kind: LineKind; wrong: string; wrongBeats: string; right: string; rightBeats: string; why: string } };

export interface Section {
  id: string;
  heading: string;
  blocks: readonly Block[];
}

export interface Source {
  id: string;
  /** A Wikipedia article is linked by its title; anything else by its address. */
  kind: 'wikipedia' | 'web';
  title: string;
  url?: string;
  publisher: string;
  /** What the guide takes from it. */
  note: string;
}

export const GUIDE_UPDATED = '2026-11-16';
export const GUIDE_HEADLINE = 'How to write a national anthem: what anthems say, and how to make the words fit a tune';
export const GUIDE_DESCRIPTION =
  'How to write a national anthem for a fictional nation: what anthems say, hymn metres explained, fitting words to a tune, translations and short versions.';
export const GUIDE_LEAD =
  'An anthem is a short poem that a crowd can sing. That asks three things of it: lines of a steady length, strong syllables on the strong beats, and words a whole country would be willing to say together.';

export const EXAMPLES: readonly Example[] = [
  {
    id: 'e8787',
    metre: '8787',
    scheme: 'ABAB',
    caption: '8.7.8.7, strong beat first. The long lines end on a weak beat, so they rhyme on two syllables.',
    lines: ['From the highlands to the waters,', 'Every road shall lead us home;', 'Lift your voices, sons and daughters,', 'Far and wide our people roam.'],
    beats: ['FROM the HIGH-lands TO the WA-ters', 'EV-ery ROAD shall LEAD us HOME', 'LIFT your VOI-ces SONS and DAUGH-ters', 'FAR and WIDE our PEO-ple ROAM'],
  },
  {
    id: 'e8686',
    metre: '8686',
    scheme: 'ABCB',
    caption: '8.6.8.6, common metre, weak beat first. Rhymed ABCB, as ballads are: only the short lines rhyme.',
    lines: ['The lantern burns above the bay,', 'And gulls are in the sky;', 'Our ships go out, our ships come home,', 'With hearts and heads held high.'],
    beats: ['the LAN-tern BURNS a-BOVE the BAY', 'and GULLS are IN the SKY', 'our SHIPS go OUT our SHIPS come HOME', 'with HEARTS and HEADS held HIGH'],
  },
  {
    id: 'e7777',
    metre: '7777',
    scheme: 'AABB',
    caption: '7.7.7.7, sevens. Every line starts and ends on a strong beat; rhymed in couplets.',
    lines: ['Light the lamp and show the way,', 'Greet the dawn and bless the day;', 'Many hands, a single heart,', 'Each of us must play a part.'],
    beats: ['LIGHT the LAMP and SHOW the WAY', 'GREET the DAWN and BLESS the DAY', 'MA-ny HANDS a SIN-gle HEART', 'EACH of US must PLAY a PART'],
  },
];

export const GUIDE: readonly Section[] = [
  {
    id: 'what-anthems-say',
    heading: 'What anthems say',
    blocks: [
      {
        p: 'Read a few dozen national anthems and the same four things come round. They praise the land: its hills, its coasts, its fields. They remember a struggle, or the people who went before. They make a promise, to stand together or to keep faith. And they ask a blessing, on the country or on whoever wears its crown. Most anthems do two or three of these and leave the rest.',
      },
      {
        p: 'It matters who is spoken to. An anthem can speak to the land, to its people, to God or to a monarch, and each makes a different song. Britain’s <cite>God Save the King</cite> is a prayer for one person. Greece’s <cite>Hymn to Liberty</cite> speaks to Liberty as if she were standing there. The Dutch <cite lang="nl">Wilhelmus</cite> hides a name: the first letters of its fifteen verses spell that of William of Nassau.',
      },
      {
        p: 'Most national anthems are hymns or marches in style. A hymn is grave and looks upward; a march is firm and looks ahead. Anthem’s moods follow from that: a solemn hymn, a martial march, and two gentler ones, hopeful and pastoral, for nations that would sooner sing of the harvest than of a battle.',
      },
      {
        p: 'An anthem can have a history too. The words of Japan’s <cite lang="ja-Latn">Kimigayo</cite> come from a poem first collected around the year 920, the oldest words of any national anthem, and were set to music only in 1880. Your nation’s anthem might be an old harvest song, a hymn from a lost war or a poem by somebody the state later found awkward. Decide who wrote it and when, and the themes choose themselves.',
      },
    ],
  },
  {
    id: 'verses-and-a-chorus',
    heading: 'Verses and a chorus',
    blocks: [
      {
        p: 'A <a href="/glossary/#verse">verse</a> says something new each time; a <a href="/glossary/#chorus">chorus</a> comes back with the same words. The chorus is what a crowd learns first, so it is the place for the country’s name. Anthem writes one to four verses of four lines each and, if you want one, a chorus after the first verse. Without a chorus the name goes in the first verse.',
      },
      {
        p: 'Give each verse one job. A first verse that names what the country is, a second that remembers, a third that promises: that is a whole anthem, and it is how the <a href="/">generator</a> spreads your themes, one to a verse, turn and turn about.',
      },
    ],
  },
  {
    id: 'hymn-metres',
    heading: 'Hymn metres, explained',
    blocks: [
      {
        p: 'A <a href="/glossary/#hymn-metre">hymn metre</a> is written as the number of syllables in each line. 8.7.8.7 means four lines of eight, seven, eight and seven syllables. Hymn books have named the commonest ones: 8.6.8.6 is common metre, 8.8.8.8 long metre, 6.6.8.6 short metre.',
      },
      {
        table: {
          head: ['Metre', 'Also called', 'Beat', 'How it sounds'],
          rows: [
            ['8.7.8.7', '', 'Strong first', 'Stately, with a swing: the long lines end softly and the short lines firmly.'],
            ['8.6.8.6', 'Common metre', 'Weak first', 'The ballad’s metre: easy and familiar, and the one with the most tunes.'],
            ['7.7.7.7', 'Sevens', 'Strong first', 'Bright and plain: every line starts and ends on a strong beat.'],
            ['Free', '', 'Mixed', 'Each verse takes its own shape from the lines above. The rhyme scheme still holds.'],
          ],
        },
      },
      {
        p: 'Counting syllables is half of it. The other half is the beat. Strong and weak beats take turns, and a line sings well only when the <a href="/glossary/#stress">stressed</a> syllables of its words land on the strong beats. A line that starts on a weak beat is <a href="/glossary/#iambic">iambic</a>; one that starts on a strong beat is <a href="/glossary/#trochaic">trochaic</a>. Common metre is iambic, and most hymns in 8.7.8.7 are trochaic. Here is one verse in each of Anthem’s metres, with the strong beats in capitals.',
      },
      { example: 'e8787' },
      { example: 'e8686' },
      { example: 'e7777' },
      {
        p: 'One-syllable words are easy: they can sit on either beat. Longer words are not. Every word of two syllables or more has one stress that must fall on a strong beat, and that is where a line usually goes wrong.',
      },
      {
        misfit: {
          kind: 'T8',
          wrong: 'Forever shall our land be free',
          wrongBeats: 'for-EV-er SHALL our LAND be FREE',
          right: 'Ever free shall be our homeland',
          rightBeats: 'EV-er FREE shall BE our HOME-land',
          why: 'Eight syllables, so it looks right for the first line of an 8.7.8.7 verse. But that line starts on a strong beat, and “forever” is stressed on its second syllable. Sung to the tune it comes out as FOR-ev-ER. Say the same thing with the stresses moved and it fits.',
        },
      },
    ],
  },
  {
    id: 'rhyme',
    heading: 'Rhyme, and why some lines are harder',
    blocks: [
      {
        p: 'A <a href="/glossary/#rhyme-scheme">rhyme scheme</a> says which lines rhyme with which. In ABAB the first line rhymes with the third and the second with the fourth. In AABB the lines rhyme in pairs. In ABCB only the second and fourth rhyme, as in most ballads. ABAB sounds the most finished and is the hardest to write; ABCB leaves two lines in every verse free, so it is the one to choose when you want room for your own words.',
      },
      {
        p: 'A line that ends on a strong beat rhymes on one syllable: land and stand. That is a <a href="/glossary/#masculine-rhyme">masculine rhyme</a>. A line that ends on a weak beat needs two syllables to match: waters and daughters, a <a href="/glossary/#feminine-rhyme">feminine rhyme</a>. English has far fewer of the second kind. That is why the long lines of 8.7.8.7 are the hardest in the tool, and why that metre cannot be rhymed AABB at all: its neighbouring lines end on different beats, and a weak ending never truly rhymes with a strong one.',
      },
      {
        p: 'Anthem writes <a href="/glossary/#true-rhyme">true rhymes</a> only, and never ends two lines of one anthem on the same word. You are freer than it is: type any line you like over one of its own, and it will tell you the count and whether the rhyme holds, and leave the judgement to you.',
      },
    ],
  },
  {
    id: 'fitting-words-to-a-tune',
    heading: 'Fitting words to a tune',
    blocks: [
      {
        p: 'A hymn tune and a hymn text are separate things. Any text can be sung to any tune of the same metre, as long as the beat matches too, which is why most hymn books print a <a href="/glossary/#metrical-index">metrical index</a>: their tunes, sorted by metre. It works outside church as well. <cite>Amazing Grace</cite> and <cite>House of the Rising Sun</cite> are both in common metre, and each can be sung to the other’s tune.',
      },
      {
        p: 'Nations borrow tunes as freely as congregations do. Liechtenstein sings its anthem to the melody of Britain’s. Estonia and Finland share a melody, written by Fredrik Pacius in 1848, with different words. The tune Joseph Haydn wrote in 1797 for the Austrian emperor now carries Germany’s anthem; hymn books call it AUSTRIAN HYMN, mark it 8.7.8.7 D, and print it with several hymns.',
      },
      {
        p: 'So an anthem in a hymn metre comes with a shelf of tunes already written. Any common-metre tune takes an anthem in 8.6.8.6. A tune marked 8.7.8.7 takes one in that metre a verse at a time, and a tune marked 8.7.8.7 D, the D for <a href="/glossary/#doubled-metre">doubled</a>, takes two verses at once. Your nation could even share its tune with a neighbour, and argue about who had it first.',
      },
      { p: 'To check a line of your own:' },
      {
        steps: [
          'Say it aloud at an ordinary pace and count the syllables on your fingers.',
          'Say it again and tap on the syllables your voice leans on. Those are its stresses.',
          'Compare the taps with the metre: strong first for 8.7.8.7 and sevens, weak first for common metre, then turn and turn about.',
          'In the generator, type the line over any other. The count beside it says “8 of 8, fits”, or what is wrong: a syllable short, one too many, or a stress on a weak beat.',
        ],
      },
      {
        p: 'When in doubt, write short. A singer can stretch one syllable over two notes, which is called a <a href="/glossary/#melisma">melisma</a>, but a syllable too many has nowhere to go.',
      },
    ],
  },
  {
    id: 'writing-a-translation',
    heading: 'Writing a translation',
    blocks: [
      { p: 'A nation with two languages needs its anthem twice. Real countries have settled this in three ways.' },
      {
        list: [
          '<strong>Separate words in each language.</strong> Canada’s anthem was first sung in French, in 1880. Its English words come from a version written in 1908, and the two are not translations of each other.',
          '<strong>One text, adapted.</strong> Switzerland’s <cite>Swiss Psalm</cite> was written in German and adapted into French, Italian and Romansh, each by a writer of its own.',
          '<strong>Several languages in one song.</strong> South Africa’s anthem, adopted in 1997, joins two older songs and moves through five languages in four verses. New Zealand’s is commonly sung with a verse in Māori and then a verse in English.',
        ],
      },
      {
        p: 'Whichever suits your nation, translate the sense and keep the metre, not the other way round. A line that says the same thing in the same number of syllables, with the stresses in the same places, is rare luck. A line that says nearly the same thing and sings well is a good translation. Count again in the new language, because a two-syllable word is seldom two syllables in translation. And settle where the country’s name falls: if it lands on the same beats in every version, a crowd singing in two languages still comes together on the name.',
      },
      {
        p: 'Anthem writes in English only, because the dictionary it counts with is English. For a second language, type your lines over the English ones and keep to the counts on the lyric sheet. The tool will still count what you type, but outside English its counts are guesses.',
      },
    ],
  },
  {
    id: 'an-official-short-version',
    heading: 'An official short version',
    blocks: [
      {
        p: 'Almost no anthem is sung in full. Greece’s <cite>Hymn to Liberty</cite> is a poem of 158 verses, and the first two are the anthem. The Dutch sing the first of their fifteen, sometimes followed by the sixth. Germany’s anthem is the third verse of a three-verse song, and only that verse. Spain has gone furthest: its anthem has never had official words at all.',
      },
      {
        p: 'So decide, as a matter of state, what is sung when. A common answer is the first verse and the chorus at a match or a parade, and every verse at a coronation, a funeral or a national day. Write the first verse to stand alone, since it is the one everybody will know: let it say what the country is, and let the chorus say its name.',
      },
      {
        p: 'Anthem’s lyric sheet keeps the same rule. When a picture is too small for the whole anthem, it shows the first verse and the chorus and says how many verses there are.',
      },
    ],
  },
  {
    id: 'try-it',
    heading: 'Try it',
    blocks: [
      {
        p: 'Open the <a href="/">generator</a>, choose a metre and two or three themes, and read the result aloud. Write again the lines that don’t sound like your nation, lock the ones that do, and type your own over the rest. The <a href="/examples/">examples</a> show finished anthems in every metre, and the <a href="/glossary/">glossary</a> explains the terms. When it is ready, give it a country: <a href="https://eurth.org">Eurth</a> has a world for it to live in.',
      },
    ],
  },
];

/** Questions shown on the page, and given to search engines as an FAQ. */
export const GUIDE_FAQ: readonly { question: string; answer: string }[] = [
  {
    question: 'What does 8.7.8.7 mean?',
    answer: 'It is a hymn metre: the number of syllables in each line of a verse. 8.7.8.7 is four lines of eight, seven, eight and seven syllables. Any words in that metre can be sung to any tune in it, as long as the beat matches.',
  },
  {
    question: 'Can my anthem be sung to an existing tune?',
    answer: 'Yes. An anthem in a hymn metre fits any hymn tune of the same metre and beat. Look up the metre in the metrical index at the back of a hymn book: 8.6.8.6 is listed as common metre, or C.M.',
  },
  {
    question: 'Why can’t I rhyme 8.7.8.7 as AABB?',
    answer: 'In 8.7.8.7 the long lines end on a weak beat and the short lines on a strong one. AABB would rhyme a long line with the short line after it, and a weak ending never truly rhymes with a strong one. Anthem writes ABAB instead and says so.',
  },
  {
    question: 'How long should a national anthem be?',
    answer: 'Short. Most countries sing one or two verses, whatever the full text runs to. Two or three verses and a chorus are plenty, with the first verse and the chorus as the short version.',
  },
  {
    question: 'Does Anthem use AI to write the lyrics?',
    answer: 'No. Every line comes from phrase banks written for Anthem, put together in your browser by fixed rules of metre and rhyme. Nothing you type is sent anywhere.',
  },
];

/** Every source was read on the day in GUIDE_UPDATED. */
export const SOURCES: readonly Source[] = [
  { id: 'national-anthem', kind: 'wikipedia', title: 'National anthem', publisher: 'Wikipedia', note: 'most anthems are hymns or marches in style; anthems in several languages; anthems without words.' },
  { id: 'metre-hymn', kind: 'wikipedia', title: 'Metre (hymn)', publisher: 'Wikipedia', note: 'how hymn metres are written, the named metres, and singing a text to any tune of its metre.' },
  { id: 'common-metre', kind: 'wikipedia', title: 'Common metre', publisher: 'Wikipedia', note: 'common metre and ballad metre, and songs that can swap tunes.' },
  { id: 'hymn-tune', kind: 'wikipedia', title: 'Hymn tune', publisher: 'Wikipedia', note: 'tune names, and the metrical index in hymn books.' },
  { id: 'foot', kind: 'wikipedia', title: 'Foot (prosody)', publisher: 'Wikipedia', note: 'the iamb, the trochee and the other feet.' },
  { id: 'endings', kind: 'wikipedia', title: 'Masculine and feminine endings', publisher: 'Wikipedia', note: 'lines that end strong or weak, and the rhymes each needs.' },
  { id: 'austrian-hymn', kind: 'web', title: 'AUSTRIAN HYMN', url: 'https://hymnary.org/tune/austrian_hymn_haydn', publisher: 'Hymnary.org', note: 'Haydn’s tune of 1797 as a hymn tune in 8.7.8.7 D, and the hymns sung to it.' },
  { id: 'deutschlandlied', kind: 'wikipedia', title: 'Deutschlandlied', publisher: 'Wikipedia', note: 'Germany’s anthem: Haydn’s melody, and the third verse alone as the anthem since 1991.' },
  { id: 'liechtenstein', kind: 'wikipedia', title: 'Oben am jungen Rhein', publisher: 'Wikipedia', note: 'Liechtenstein’s anthem, sung to the melody of Britain’s.' },
  { id: 'estonia', kind: 'wikipedia', title: 'Mu isamaa, mu õnn ja rõõm', publisher: 'Wikipedia', note: 'Estonia’s anthem and Finland’s share Fredrik Pacius’s melody of 1848.' },
  { id: 'greece', kind: 'wikipedia', title: 'Hymn to Liberty', publisher: 'Wikipedia', note: 'Greece’s anthem: 158 verses, of which the first two are sung.' },
  { id: 'wilhelmus', kind: 'wikipedia', title: 'Wilhelmus', publisher: 'Wikipedia', note: 'the Dutch anthem: fifteen verses that spell a name, and which of them are sung.' },
  { id: 'spain', kind: 'wikipedia', title: 'Marcha Real', publisher: 'Wikipedia', note: 'Spain’s anthem, which has never had official words.' },
  { id: 'kimigayo', kind: 'wikipedia', title: 'Kimigayo', publisher: 'Wikipedia', note: 'Japan’s anthem: words from a poem collected around 920, set to music in 1880.' },
  { id: 'canada', kind: 'web', title: 'Anthems of Canada', url: 'https://www.canada.ca/en/canadian-heritage/services/anthems-canada.html', publisher: 'Government of Canada', note: 'the French words of 1880 and the English words from a version of 1908.' },
  { id: 'switzerland', kind: 'wikipedia', title: 'Swiss Psalm', publisher: 'Wikipedia', note: 'Switzerland’s anthem, written in German and adapted into three more languages.' },
  { id: 'south-africa', kind: 'wikipedia', title: 'National anthem of South Africa', publisher: 'Wikipedia', note: 'two songs joined in 1997, in five languages.' },
];
