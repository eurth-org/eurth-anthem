// Writes the guide and the glossary as pages to read before the site exists:
// content/guide.md and content/glossary.md. Made from src/content/; don't edit them by hand.
//
//   npm run content
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DICTIONARY_CREDIT, GLOSSARY, GLOSSARY_TITLE, termId } from '../src/content/glossary.ts';
import { EXAMPLES, GUIDE, GUIDE_FAQ, GUIDE_HEADLINE, GUIDE_LEAD, GUIDE_UPDATED, SOURCES } from '../src/content/guide.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** The few tags the guide uses, as Markdown. */
const md = (html: string) =>
  html
    .replace(/<a href="([^"]*)">(.*?)<\/a>/g, '[$2]($1)')
    .replace(/<cite[^>]*>(.*?)<\/cite>/g, '*$1*')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**');

const out: string[] = [`# ${GUIDE_HEADLINE}`, '', `Made by \`npm run content\` from \`src/content/guide.ts\`. Links starting with / are pages of the site.`, '', md(GUIDE_LEAD), ''];
for (const section of GUIDE) {
  out.push(`## ${section.heading}`, '');
  for (const block of section.blocks) {
    if ('p' in block) out.push(md(block.p), '');
    else if ('list' in block) out.push(...block.list.map((item) => `- ${md(item)}`), '');
    else if ('steps' in block) out.push(...block.steps.map((item, i) => `${i + 1}. ${md(item)}`), '');
    else if ('table' in block) {
      out.push(`| ${block.table.head.join(' | ')} |`, `| ${block.table.head.map(() => '---').join(' | ')} |`, ...block.table.rows.map((row) => `| ${row.join(' | ')} |`), '');
    } else if ('example' in block) {
      const example = EXAMPLES.find((e) => e.id === block.example)!;
      out.push(`**${example.caption}**`, '', ...example.lines.map((line, i) => `> ${line}  \n> \`${example.beats[i]}\`  `), '');
    } else {
      const m = block.misfit;
      out.push(`> ${m.wrong}  \n> \`${m.wrongBeats}\``, '', md(m.why), '', `> ${m.right}  \n> \`${m.rightBeats}\``, '');
    }
  }
}
out.push('## Questions', '');
for (const item of GUIDE_FAQ) out.push(`**${item.question}** ${item.answer}`, '');
out.push('## Sources', '');
for (const source of SOURCES) {
  const url = source.kind === 'wikipedia' ? `https://en.wikipedia.org/wiki/${encodeURIComponent(source.title.replace(/ /g, '_'))}` : source.url!;
  out.push(`- [${source.title}](${url}), ${source.publisher}: ${source.note}`);
}
out.push('', `Last updated ${GUIDE_UPDATED}.`, '');

const glossary: string[] = [`# ${GLOSSARY_TITLE}`, '', `Made by \`npm run content\` from \`src/content/glossary.ts\`: ${GLOSSARY.reduce((n, g) => n + g.terms.length, 0)} terms.`, ''];
for (const group of GLOSSARY) {
  glossary.push(`## ${group.title}`, '', group.intro, '');
  for (const t of group.terms) glossary.push(`- **${t.term}**${t.also ? ` (${t.also})` : ''} \`#${termId(t.term)}\`: ${t.text}`);
  glossary.push('');
}
glossary.push('## The dictionary', '', `${DICTIONARY_CREDIT.text}`, '', `${DICTIONARY_CREDIT.copyright} It is used under ${DICTIONARY_CREDIT.licence}; the page prints the licence in full from \`${DICTIONARY_CREDIT.licenceFile}\`. Source: ${DICTIONARY_CREDIT.url}`, '');

mkdirSync(resolve(root, 'content'), { recursive: true });
writeFileSync(resolve(root, 'content/guide.md'), out.join('\n'));
writeFileSync(resolve(root, 'content/glossary.md'), glossary.join('\n'));
console.log(`content/guide.md: ${out.join(' ').split(/\s+/).length} words; content/glossary.md: ${GLOSSARY.reduce((n, g) => n + g.terms.length, 0)} terms`);
