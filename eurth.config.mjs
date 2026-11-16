// What this tool is called and where it lives. Read at build time only: astro.config.mjs, the
// frontmatter of .astro pages, tests and tools/. Never import this from a Svelte component or a
// <script>: it pulls in the list of every Eurth tool, and browser code must not carry that
// (HANDBOOK.md, Launch). Hand the component what it needs as props instead.
import { defineSite } from '@eurth/style/build';

export const site = defineSite({
  // The subdomain, and the tool's id in @eurth/style's tools.json.
  id: 'anthem',
  name: 'Anthem',
  url: 'https://anthem.eurth.org',
  title: 'Anthem: free online national anthem maker for worldbuilders',
  description: 'A free online national anthem maker for worldbuilders: original lyrics for your fictional nation, in a real hymn metre and rhyme scheme. Runs in your browser; no account, no AI.',
  tagline: 'Words for your anthem',
  pages: [
    { href: '/', label: 'Generator' },
    { href: '/examples/', label: 'Examples' },
    { href: '/guide/', label: 'Guide' },
    { href: '/glossary/', label: 'Glossary' },
  ],
  repo: 'https://github.com/eurth-org/eurth-anthem',
  ogAlt: 'Anthem, by Eurth, at anthem.eurth.org: the Eurth yurt beside the first verse of a national anthem on a lyric sheet.',
  llms: `## How it writes

Anthem writes with a grammar, a seeded random number generator and phrase banks written for it. No language model or writing service is involved, and no real anthem, hymn or song is quoted or adapted. Every line is checked against its hymn metre (syllables and stress) and its rhyme scheme with the CMU Pronouncing Dictionary, which is bundled with the site.`,
});
