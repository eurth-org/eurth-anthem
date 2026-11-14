You're building Anthem (anthem.eurth.org), a national anthem lyrics generator for fictional nations, one of Eurth's free worldbuilding tools. Eurth (eurth.org) is a worldbuilding and roleplay community since 2004. The attached repo is eurth-org/eurth-anthem.

Working order (Foundations and many other tools are being built at the same time tonight):
1. Save this brief as CLAUDE.md.
2. If the repo named above doesn't exist on GitHub yet, create it as a public, empty repo in eurth-org with the gh CLI and connect this folder; if you can't, ask me.
3. Read what already exists of github.com/eurth-org/eurth-style (HANDBOOK.md) and github.com/eurth-org/eurth-profile; they may still be in progress. Write the plan and show it to me.
4. Build the tool's core logic as plain TypeScript modules with thorough tests, and its content and data (the phrase banks, in review batches, the bundled pronunciation data, the guide). None of that needs eurth-style.
5. Only once @eurth/style 1.0.0 is released (check the releases of github.com/eurth-org/eurth-style), start the site from its starter template and carry on to the end of this brief. Until then, don't scaffold the site, pages or styles.
6. Commit and push after every finished step, and keep roadmap.md up to date with exactly where to pick up, so a new session can continue if this one stops.

Background for every step: Read HANDBOOK.md in github.com/eurth-org/eurth-style and start from its starter template; read the profile schema in github.com/eurth-org/eurth-profile (if it has no "anthem" section yet, propose one as a pull request there first); look at github.com/eurth-org/eurth-flag, the reference build. The handbook wins over this brief on everything shared. Then write a plan and show it to me before you build.

Mock-up: the "anthem.eurth.org, national anthem lyrics" board on https://claude.ai/artifact/32RKDdVTtCfHsL6Qc6LxV6.

Pages: Generator, Guide, Glossary, Examples.

How it writes: entirely in the browser, with no AI service and no requests anywhere (the handbook forbids third-party requests, and it must cost nothing). A grammar of line templates and phrase banks, written for this tool, fills in the nation's own words and picks lines that fit the chosen metre and rhyme scheme.
- The phrase banks are original writing, drafted in this chat and reviewed by me in batches. Never quote or adapt the words of any real anthem, hymn or song.
- Rhymes and syllable counts come from an open-licence pronunciation dictionary (such as the CMU Pronouncing Dictionary) bundled at build time, with its licence and credit on the Glossary page.

The generator, v1
- Inputs: the country's name, themes (sea, mountains, freedom, unity, faith, labour, the crown, revolution, harvest, and more), mood (solemn hymn, martial march, hopeful, pastoral), metre (8.7.8.7, 8.6.8.6 common metre, 7.7.7.7, free), rhyme scheme (ABAB, AABB, ABCB), number of verses, whether there's a chorus, and words to include (a river, the capital, the motto).
- Fill from a profile: name, capital, motto, the largest cities and the names section's sound, so made-up place names scan.
- Output: a title, verses and a chorus, laid out like a hymn sheet, with the metre shown.
- Edit freely: re-roll one line, lock lines you like, or type over any line; the syllable count updates as you type.
- The lyrics travel in the link, so a shared link shows the same anthem.

Guide: what national anthems usually say and why, hymn metres explained, how to make words fit a tune, writing a translation and an official short version, with sources.

Profile section "anthem": title, lyrics, metre, and the settings that made them. Wiki and Card read the title and first verse.

Exports: Copy lyrics, a lyric sheet image at the handbook's sizes, a printable A4 or Letter sheet, wikitext for an anthem section with a lyrics box, Copy description.

Signature touch: the lines appear one by one, as if being sung. Easter egg: choosing the theme "emu" makes the chorus end "...and never once gave up the field."

Done when the handbook's checklist passes, every generated line scans in the chosen metre (tested over thousands of runs), and I've reviewed the phrase banks.
