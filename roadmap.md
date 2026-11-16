# Roadmap

Anthem writes the words of a national anthem for a fictional nation, in a chosen hymn metre and rhyme scheme, at anthem.eurth.org. It is door 12 of Eurth's 2026 advent calendar and opens on 21 December 2026 at 00:00 Europe/Brussels.

Three parts: what comes next, what each release added (newest first), and what's not planned.

## Where to pick up

**16 November 2026.** Phase 1, steps 1 to 5 and 7 to 11 are done and pushed: the pronunciation table, scanning, metre and rhyme, the bank format and its compiler, the generator with re-roll and kept lines, the thousands of runs, editing, the link and the profile, the words out and the lyric sheet (`npm test`: 105 tests, 4,320 anthems).

The phrase banks: batches 1 to 5 are drafted (`core.ts`, `sea.ts`, `mountains.ts`, `freedom.ts`, `unity.ts` in `src/anthem/bank/`: 932 lines in all), with their review pages in `content/review/`. Stijn has said the tone of batch 1 is right to carry on in. **None is marked reviewed yet:** that waits for him to say so for each batch, after reading its page.

Next, in this order: batch 6 (faith) and the batches after it, each with its review page; then steps 12 and 13. Apply Stijn's notes on a batch as they come, and set `reviewed: true` in its file only when he says so. Phase 2 may start as well: @eurth/style is released.

Handy while writing the banks:

- `npm run sample -- 8787 ABAB solemn Teland 1 2 harbour,Selunna:010 sea` writes one anthem to the terminal (metre, scheme, mood, country, seed, verses, words to include, themes).
- `npm run depth` shows how often the longest anthem runs the bank short, and which rhyme sounds each kind of line can end on. It must stay at zero.
- `npm run review` rewrites the review pages from the bank. Run it after every change to a batch and commit the pages with it.

Waiting on others:

- **@eurth/style** is released (1.2.1 on 15 November 2026), so Phase 2 is no longer blocked. Read its HANDBOOK.md and start from its starter template.
- **@eurth/profile** is released (1.0.1). Its `anthem` section holds `title` and `lyrics`. The brief also wants the metre and the settings, so [pull request 4](https://github.com/eurth-org/eurth-profile/pull/4) there adds four optional fields: `metre`, `rhyme`, `mood` and `themes`. That makes six typed fields, the profile's own limit. **It is open and waiting to be merged.** Anthem writes the four fields already (`profile.ts`): the section keeps unknown keys.
- **IIWiki's lyrics markup:** Stijn to say whether IIWiki has the `<poem>` tag and an anthem infobox template. Until then the wiki export uses plain wikitext that works on any MediaWiki.
- **Phrase bank reviews:** each batch (Phase 1, step 6) waits for Stijn. An unreviewed batch never ships.

## How it writes

Decided here so every later step agrees.

- **No AI and no requests.** A seeded random number generator, a grammar and the phrase banks, all in the page. The same settings and seed give the same anthem.
- **A line is a template with slots.** Each template has a fixed rhythm (which syllables are strong and which weak) and a role in the verse: an address ("Land of ..."), a statement, a call or vow, a lead-in that needs a line after it, a blessing. Each slot takes a phrase of one exact rhythm. The last slot is the rhyme slot and takes its phrase from a rhyme family.
- **A verse is a plan of roles** that reads as one or two sentences, so punctuation is set by the plan and lines don't dangle.
- **Rhymes are chosen first.** The generator picks the rhyme families a verse will use for its scheme, then the lines that end in them. Only true rhymes, never a word with itself, and no end word twice in one anthem.
- **Metres are syllables and stress.** 8.7.8.7 is trochaic (strong first), 8.6.8.6 is iambic (weak first), 7.7.7.7 is trochaic. So 8.7.8.7 in ABAB needs two-syllable rhymes on its long lines, and the banks are built for that. Free means lines of five to eleven syllables with no fixed rhythm; the rhyme scheme still holds.
- **"Scans" means three things,** checked by the tests from the dictionary and not from what the banks claim: the right number of syllables; no stressed syllable of a longer word on a weak beat and no unstressed one on a strong beat; the rhyme scheme kept. One-syllable words may sit on either beat.
- **The nation's own words go into slots that fit them.** The country's name, the capital, cities and "words to include" each have a rhythm (Teland is strong-weak, Selunna weak-strong-weak), and templates have name slots of each common shape. A capitalised word is treated as a place or a name, a lower-case one as a thing. When a word fits nowhere in the chosen metre, the tool says so plainly and doesn't bend the line.
- **Made-up words are estimated, and the person can correct them.** A word that isn't in the dictionary gets its syllables and stress from spelling rules, shown as "Se-LUN-na". Each of the nation's words has a small "How do you say it?" control to change the split or the stress, and the anthem is rewritten around the answer.
- **The dictionary is for the person's words; the banks carry their own.** Every bank phrase is stored with its rhythm and rhyme, checked against the dictionary when the banks are built. So writing an anthem never waits for the dictionary to load; the dictionary is there for typed lines, words to include and their rhymes.
- **The link carries the words themselves,** not just the seed: the settings, every line as text, and which lines are locked. A link made today still shows the same anthem after the banks change.
- **8.7.8.7 can't be AABB.** Its lines end weak, strong, weak, strong, and a weak ending never truly rhymes with a strong one. Asked for AABB in 8.7.8.7, the generator writes ABAB and says so; the page should grey the choice out with that reason. Free verse in AABB leaves out the line shapes that would clash.
- **A rhyme goes by the usual way a word is said.** The generator rhymes on each word's first pronunciation in the dictionary. A line the person typed gets the benefit of every pronunciation.
- **A re-roll never breaks a rule to be different.** If no other line fits the place (the metre, a sentence with its neighbours, the rhyme, no end word twice), the line stays and the generator says it is the only one.
- **A verse is two couplets.** The first line of each opens (an address, a lead-in, a statement, a call) and the second answers it; eight-syllable lines that end weak only open, six-syllable lines only answer. That is why the banks are counted per line shape and per part.
- **The emu chorus changes metre.** "And never once gave up the field" is eight syllables, weak first, so it fits none of the three metres' last lines. With the emu theme the chorus is written in 8.8.8.8 and the sheet says so. A refrain in its own metre is ordinary in hymn books, and the rule that every line scans in its stated metre holds.

## Next

### Phase 1: the engine and the words (needs nothing from @eurth/style)

Plain TypeScript in `src/anthem/`, data in `src/anthem/bank/` and `data/`, tests in `tests/`, as Flagwright keeps its engine in `src/flag/`. Only TypeScript and Vitest are installed. Commit and push after each step.

1. **Pronunciation data** (`tools/build-dict.mjs`, `data/cmudict/`): the CMU Pronouncing Dictionary, a pinned copy with its licence file and checksum in the repository, turned at build time into a compact table: for each word its stress pattern or patterns and its rhyme key (the sounds from the last stressed vowel to the end). Entries with digits or punctuation are dropped. A small spelling map lets British spellings find their entry (harbour, honour, centre, realise). The table is a separate file loaded after the page; budget 600 KB compressed, measured in a test (it is about 570 KB: 131,000 pronunciations). **Done.**
2. **Scanning** (`scan.ts`): a word's syllables and stress, from the dictionary, then the spelling map, then the rules for made-up words, then the person's own correction, which always wins. A line's rhythm from its words, with the unknown words marked as guesses. Hyphens, apostrophes, accents and numbers handled; never throws on anything typed. **Done.**
3. **Metre and rhyme** (`metre.ts`, `rhyme.ts`): the four metres as patterns per line, and how they are shown ("8.7.8.7"); whether a line fits a pattern, and if not, where it goes wrong, in words a person can act on ("one syllable too many", "the stress of 'forever' falls on a weak beat"). True rhyme between two line endings, one- and two-syllable; a word's rhyme family; rhymes for a typed word, from the dictionary. **Done,** except the wording of the messages, which waits for step 8.
4. **Bank format and its checks** (`bank/types.ts`, `bank/check.ts`): themes, moods, templates, phrases and rhyme families as typed data, each entry with its batch and whether the batch is reviewed. The checks run as tests: every phrase's stated rhythm and rhyme match the dictionary; every template adds up to its metre; every slot can be filled; every theme, mood, metre and rhyme scheme has enough material for four verses and a chorus without repeating an end word; every name shape has templates. A build for launch leaves out unreviewed batches, and the same checks must still pass on what's left. **Done:** the format is described in `bank/types.ts`, the compiler and its checks are `bank/compile.ts`, and `tests/bank.test.ts` holds the coverage rules.
5. **The generator** (`grammar.ts`, `generate.ts`, `title.ts`): settings, seed and the lines already locked or typed give a title, verses and a chorus. Themes are spread across the verses; the name comes in verse one and the chorus; words to include are each used once where they fit, and a list comes back of which were placed and which couldn't be. Re-roll one line: a new line in the same place that still rhymes with its partner, whether the partner is generated, locked or typed. The title comes from the chorus or the strongest line, in Title Case. **Done,** all in `generate.ts`.
6. **The phrase banks, in review batches** (`bank/*.ts`, `content/review/*.md`): original writing, drafted in the chat. No words quoted or adapted from any real anthem, hymn or song. Each batch comes to Stijn as a readable page (every template and phrase with its rhythm marked, and twenty sample verses made from it) and is marked reviewed only when he says so.
   1. Core: addresses, vows, blessings, lead-ins and the everyday rhyme families, with no theme.
   2. Sea, rivers and harbours.
   3. Mountains, the north and snow.
   4. Freedom and revolution.
   5. Unity and the people.
   6. Faith.
   7. Labour and harvest.
   8. The crown.
   9. More themes: forests, plains, dawn and the future, remembrance, peace, home.
   10. Choruses and titles.
   11. Free metre, and the emu.

   **Batches 1 to 5 are drafted and waiting for review** (`content/review/01-core.md`, `02-sea.md`, `03-mountains.md`, `04-freedom.md`, `05-unity.md`). Batch 5 is unity alone: "the people" turned out to be everywhere in the core already. A themed batch adds phrases to the core's groups and lines tagged with its themes; `tests/bank.test.ts` asks for at least five lines in every line shape for each theme, and a last line in each shape that can end a stanza. The floor for re-rolls in `tests/generate.test.ts` (how often a line has another that can replace it) is 0.7 with batch 1 alone; raise it as batches land, to 0.9 by launch.

   Moods are tags on phrases and templates (most suit more than one), not four copies of the bank. Batch 1 comes with step 5, so the generator has something to run on; the rest follow one at a time.
7. **The thousands of runs** (`tests/scan-runs.test.ts`): for every metre, rhyme scheme and mood, across many seeds, theme sets, verse counts, with and without a chorus, and names of every shape (in the dictionary, made-up, corrected by hand): every line scans as defined above; no line and no end word twice; the same seed gives the same anthem; included words are placed or reported; and nothing on a short guard list of famous anthem phrases ever comes out. The guard list lives in the tests only and is never shipped. **Done,** in `tests/generate.test.ts`: 4,320 anthems a run. The emu and the launch-build check come with their batches.
8. **Editing** (`edit.ts`): for a typed line, the count as you type, the count wanted, whether it rhymes with its partner, and which words were guessed. Locking, and what a change of metre, rhyme scheme or verse count does to locked and typed lines (kept where they still fit; flagged, never silently rewritten, where they don't). **Done.**
9. **Saving** (`link.ts`, `profile.ts`): a compact, versioned form for the link's query string: settings, the lines as text, the locks, and the person's pronunciation corrections. Reading a profile: `identity` (name, official name, capital, motto), `cities` (the largest few) and `names` (places) become the country and the words to include, each scanned, with the motto offered as a line where it fits a line length. Writing the `anthem` section: `title`, `lyrics` (plain text, an empty line between verses, the chorus after the first verse so that Wiki and Card find the first verse first), `metre`, `rhyme`, `mood`, `themes`, `link`, `summary`. Every other section and every unknown key is left alone. **Done:** `link.ts` gives the small object that @eurth/style's `encodeState` turns into the query string, and reads it back; `profile.ts` reads and writes plain objects. The pronunciation corrections travel with the settings. Offering the motto as a line is `mottoFits`; the page decides where to put it.
10. **Words out** (`describe.ts`, `wikitext.ts`): Copy lyrics as plain text; Copy description ("'Steady Against the Tide', the national anthem of Teland: two verses and a chorus in 8.7.8.7, rhymed ABAB, on the sea, freedom and unity", then the first verse); wikitext for an anthem section with a lyrics box, in plain markup that needs no template or extension. **Done.** The themes and moods and their words are in `themes.ts`.
11. **The lyric sheet** (`sheet.ts`): the hymn-sheet layout as an SVG string for each of the handbook's sizes: title, "National anthem of ...", the metre and rhyme scheme, numbered verses, the chorus set apart. Small sizes show the title, the first verse and the chorus, and say how many verses there are; tall sizes show everything that fits at a readable size. Text is measured by a function passed in, so the site can measure with the real fonts. Colours come in as a palette, so the site can pass @eurth/style's tokens later. **Done.** `npm run sheet -- <folder>` writes sample sheets to look at. Wide pictures set the stanzas in two columns, so even the link preview holds two or three verses and a chorus.
12. **Examples** (`examples.ts`): anthems of fictional nations, at least one per metre and rhyme scheme, made by the generator and then frozen as links: Teland from the mock-up, and others. Calderwyn's "Lanterns on the Water" from the profile example is shown as a hand-written one. A test holds every example to its metre.
13. **Guide and glossary** (`src/content/`): what national anthems usually say and why; hymn metres explained; how to make words fit a tune; writing a translation; an official short version; with sources checked when written and a last-updated date. Real anthems are described by name and by what they do, never quoted. A glossary of about 40 terms (metre, foot, iamb, trochee, common metre, feminine rhyme, refrain and so on), with the dictionary's licence and credit.

### Phase 2: the site (@eurth/style is released, so this can start)

14. Start from the starter template in eurth-style; read HANDBOOK.md first, and where it differs from this plan, the handbook wins.
15. Pages: Generator, Guide, Glossary, Examples, with titles ("Anthem: free online national anthem maker for worldbuilders"), descriptions, canonical links, JSON-LD, sitemap.xml, robots.txt, llms.txt and Open Graph images.
16. The tool, as a Svelte 5 island, after the mock-up: country, theme chips, mood, metre, verses, rhyme, the chorus switch, words to include with "How do you say it?", Write lyrics; the sheet with the metre shown, and on every line a re-roll button, a lock and a field to type over it, with the syllable count beside it as a number and a word ("8 of 8, fits"), never colour alone.
17. Save and load: the link, and the profile file (file picker and drag and drop, from @eurth/profile).
18. Exports: Copy lyrics, the lyric sheet as SVG, PNG and WebP in the handbook's sizes, a print stylesheet for one sheet of A4 or Letter, Copy wikitext, Copy link, Copy picture, Copy description, and the Share dialog.
19. Delight: the lines appear one by one, as if being sung, each in under half a second and timed to its syllables, skipped by any key or click and all at once for reduced motion; the emu theme, found by typing "emu" as a theme of your own; the suite's own touches from @eurth/style.
20. Offline, install, security headers, axe and Lighthouse checks, as the handbook asks. The dictionary file is cached by the service worker with the app's other files.
21. CI, and the launch workflow: `LAUNCH_AT` is `2026-12-21T00:00:00+01:00`, the scheduled run starts at 22:30 UTC on 20 December, and it also runs by hand. No custom domain and no workers.dev deploy before then.
22. README (use, development, deployment), docs/feedback-log.md, and the handbook's checklist.

### After launch

- Wiki export for IIWiki's own lyrics and anthem templates, once we know which it has.
- Tunes to sing it to: well-known public-domain hymn tunes listed by metre in the Guide (names only).

## Releases

None yet.

## Not planned

- **An AI model or any writing service.** The tool must cost nothing and send nothing anywhere. Every word comes from banks written for it.
- **Words from real anthems, hymns or songs,** quoted or adapted, in the banks, the examples or the Guide.
- **Music.** No melody, score or audio. Anthem writes words that fit a metre; the tune is yours.
- **Languages other than English,** for now. Scanning and rhyme depend on a pronunciation dictionary, and the one bundled is English. The Guide covers writing a translation by hand.
- **Near rhymes from the generator.** It uses true rhymes only. You can type any line you like over its own.
- **Accounts, or anthems kept on a server.** An anthem lives in its link or in the profile file; nothing is stored.
