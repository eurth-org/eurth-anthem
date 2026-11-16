// Makes the pictures that aren't drawn by hand, with the Chrome on this machine: the favicon,
// the home-screen icons and the sharing image. Run it after changing the sharing image or the
// first example, and commit what it writes to public/:  npm run images
import { makeImages, sharingImage } from '@eurth/style/images';
import { createServer } from 'vite';
import { site } from '../eurth.config.mjs';

// The lyric sheet on the sharing image comes from the same code as the site (Vite reads TypeScript).
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { EXAMPLES } = await vite.ssrLoadModule('/src/anthem/examples.ts');
  const { LIGHT, sheetSvg } = await vite.ssrLoadModule('/src/anthem/sheet.ts');
  const first = EXAMPLES[0];
  // A sheet of paper on the Night ground: the title, the first verse and the chorus.
  const anthem = { ...first.anthem, stanzas: first.anthem.stanzas.slice(0, 2) };
  const sheet = sheetSvg(anthem, first.settings, { size: { id: 'sharing', label: 'Sharing image', width: 832, height: 1068 }, palette: LIGHT });
  const art = `<div style="border-radius:12px;overflow:hidden;display:flex">${sheet.replace('<svg ', '<svg style="display:block;width:100%;height:auto" ')}</div>`;
  const made = await makeImages({ sharing: [{ file: 'og.png', html: sharingImage({ site, art }) }] });
  console.log(`Made ${made.map((file) => `public/${file}`).join(', ')}`);
} finally {
  await vite.close();
}
