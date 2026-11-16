# Anthem

> A friendly note: Anthem is part of Eurth's advent calendar, and its door opens on 21 December 2026. The code is public, the site isn't yet. Please don't spoil the surprise before the door opens.

Anthem writes the words of a national anthem for a fictional nation: verses and a chorus in a hymn metre and rhyme scheme of your choosing, with the nation's own names worked in. It runs entirely in the browser, from phrase banks written for it, with no AI service behind it and no requests to anywhere. It is one of the free worldbuilding tools by [Eurth](https://eurth.org), a worldbuilding and roleplay community since 2004, and will live at anthem.eurth.org.

What's planned, what each release added and exactly where work stands is in the [roadmap](roadmap.md). The rules every Eurth tool follows are in the handbook, [`node_modules/@eurth/style/HANDBOOK.md`](https://style.eurth.org/handbook/). On anything the tools share, the handbook wins.

## Use

1. Name your country, pick its themes and a mood.
2. Choose a metre (8.7.8.7, 8.6.8.6, 7.7.7.7 or free verse), a rhyme scheme, the number of verses and whether there is a chorus.
3. Add words to include: your capital, a river, a hero. A capital letter marks a place or a name. For a made-up word, "How do you say it?" lets you set its syllables and stress.
4. Press **Write lyrics**. Press it again for another anthem.
5. **Edit lines** to write a line again, lock it, or type over it. The syllable count beside each line says whether it still fits the metre and the rhyme.
6. Take it with you: copy the lyrics, the wikitext or the link (the link holds every word), download the lyric sheet as SVG, PNG or WebP, print it on one sheet, or save your nation's profile file to carry it to the next Eurth tool.

Nothing is stored in the browser. Loading a profile file fills in the country, its capital and its largest cities.

## How it writes

No language model. A seeded random number generator, a grammar of verse plans, and phrase banks of original lines in `src/anthem/bank/`, each line with its rhythm and its rhyme. Every line is checked against the CMU Pronouncing Dictionary (a pinned copy in `data/cmudict/`, with its licence): the right number of syllables, no stressed syllable of a longer word on a weak beat, and true rhymes only. Nothing in the banks is quoted or adapted from a real anthem, hymn or song. The roadmap's "How it writes" has the rules in full.

The phrase banks are written in batches, and each batch is marked `reviewed` only when Stijn has read it. **A build for the door, or after it, ships reviewed batches only**, and stops if those can't write a whole anthem. Before the door every batch is built in, so the site can be tried.

## Development

Node 22 or later (CI runs on Node 26).

```sh
npm install
npm run dev          # the site while you work
npm run check        # types: pages and components
npm run build        # the static site, into dist/
npm test             # the engine's tests (thousands of anthems) and the suite's checks (they read dist/)
npm run axe          # accessibility: every page, both themes
npm run smoke        # the built site in real Chrome: theme, nothing stored, offline
npm run preview      # the built site with its real headers (wrangler dev)
npm run images       # icons and the sharing image, after changing them
```

`dev`, `build`, `check` and `test` first run `npm run generate`, which builds two files into `src/anthem/generated/` (not committed): `lexicon.txt`, the pronunciation table, and `bank.json`, the compiled phrase bank.

For the words:

```sh
npm run sample -- 8787 ABAB solemn Teland 1 2 harbour,Selunna:010 sea   # one anthem, in the terminal
npm run depth        # how often the longest anthem runs the bank short (must stay at zero)
npm run review       # rewrites the review pages in content/review/ from the bank
npm run content      # rewrites content/guide.md and content/glossary.md from src/content/
npm run examples     # freezes any example that isn't frozen yet (-- --all: every one again)
ANTHEM_BANK=reviewed npm run generate   # try the bank a launch build would ship
```

Where things are:

- `eurth.config.mjs`: the tool's name, address, title and pages. Build time only.
- `src/anthem/`: the engine, plain TypeScript with no page in it: scanning, metre, rhyme, the bank and its compiler, the generator, editing, the link, the profile section, the words out, the lyric sheet, the examples.
- `src/anthem/bank/`: the phrase banks, one file per batch. `content/review/` has a page per batch to read.
- `src/content/`: the guide and the glossary, as data.
- `src/ui/`: the generator itself (`Generator.svelte`, `LineRow.svelte`) and what it works out that isn't drawing (`page.ts`).
- `src/pages/`: the generator, the examples, the guide, the glossary and the 404 page.
- `tests/`: the engine's tests, the page's, and `shell.test.js`, the checks every Eurth tool runs.
- `LAUNCH_AT`: the moment the door opens.

## Deployment

The site runs as a Cloudflare Worker serving static assets on its custom domain (`wrangler.jsonc`). Until the door opens it isn't deployed anywhere. The launch workflow (`.github/workflows/launch.yml`) builds on the evening of 20 December, waits for the time in `LAUNCH_AT` and deploys; if its scheduled run hasn't started by 22:45 UTC, start it by hand. After that, GitHub Actions deploys every push to `main` that passes, and a nightly run keeps `@eurth/style` and `@eurth/profile` up to date. Deploying uses the organisation secret `CLOUDFLARE_API_TOKEN`.

Before the launch: every batch in `src/anthem/bank/` that should ship must be marked reviewed, the examples made again (`npm run examples -- --all`), and the images too (`npm run images`). Release steps: update the [roadmap](roadmap.md) (move finished items out of "Next", add the dated release section), then tag.

## Credits

Syllables, stresses and rhymes come from the [CMU Pronouncing Dictionary](data/cmudict/README.md), copyright Carnegie Mellon University, used under its two-clause BSD licence (`data/cmudict/LICENSE`; the Glossary page prints it in full). Icons are Font Awesome Free (CC BY 4.0).

## Licence

Apache 2.0, see [LICENSE](LICENSE).
