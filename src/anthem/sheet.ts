// The lyric sheet: the anthem laid out like a page of a hymn book, as an SVG string, in each of
// the suite's picture sizes. The title, whose anthem it is, the metre and the rhyme scheme, then
// the stanzas, each under its heading, the chorus in bold.
//
// Small pictures can't hold a long anthem at a size anyone can read. So the sheet shows as many
// stanzas as fit at a readable size, always starting with the first verse and the chorus, and
// says so when it leaves some out.
//
// Text is measured by a function passed in, so the page can measure with the real fonts; without
// one, widths are estimated on the careful side. Colours come in as a palette, so the page can
// hand over the theme's own.

import { stanzaMetre } from './describe.ts';
import { cleanSettings, type Anthem, type Settings, type Stanza } from './generate.ts';
import { METRES, schemeFor } from './metre.ts';

export interface SheetSize {
  id: string;
  label: string;
  width: number;
  height: number;
}

/** The suite's picture sizes, as the handbook lists them. */
export const SHEET_SIZES: readonly SheetSize[] = [
  { id: 'preview', label: 'Link preview', width: 1200, height: 630 },
  { id: 'square', label: 'Square', width: 1080, height: 1080 },
  { id: 'portrait', label: 'Portrait', width: 1080, height: 1350 },
  { id: 'story', label: 'Story', width: 1080, height: 1920 },
  { id: 'pin', label: 'Pin', width: 1000, height: 1500 },
  { id: 'wide', label: 'Wide', width: 1600, height: 900 },
];

export interface Palette {
  paper: string;
  ink: string;
  muted: string;
  accent: string;
}

/** Night, the suite's dark theme. The page passes the theme in use. */
export const NIGHT: Palette = { paper: '#002b36', ink: '#fcf6e1', muted: '#bac1b5', accent: '#2698d4' };
export const LIGHT: Palette = { paper: '#ffffff', ink: '#222222', muted: '#545454', accent: '#2698d4' };

export type Measure = (text: string, size: number, bold: boolean) => number;

/** A careful guess at a line's width in a plain sans-serif: a little wide rather than narrow. */
export const estimateWidth: Measure = (text, size, bold) => {
  let units = 0;
  for (const ch of text) {
    if (ch === ' ') units += 0.27;
    else if ("iljI.,;:!'|".includes(ch)) units += 0.27;
    else if ('ftr-()“”‘’"'.includes(ch)) units += 0.36;
    else if ('mwMW'.includes(ch)) units += 0.86;
    else if (/\p{Lu}/u.test(ch)) units += 0.67;
    else units += 0.54;
  }
  return units * size * (bold ? 1.06 : 1) * 1.03;
};

export interface SheetText {
  text: string;
  x: number;
  /** The baseline. */
  y: number;
  size: number;
  bold: boolean;
  fill: string;
  /** Capitals with a little air between them, for headings. */
  spaced: boolean;
  width: number;
}

export interface SheetLayout {
  size: SheetSize;
  texts: SheetText[];
  /** A short rule under the title. */
  rule: { x: number; y: number; width: number; height: number };
  /** Which stanzas are on the sheet, by their place in the anthem. */
  shown: number[];
  /** The size of the lyric lines. */
  lineSize: number;
  columns: number;
}

export interface SheetOptions {
  size: SheetSize;
  palette?: Palette;
  measure?: Measure;
  /** A line at the foot, usually where the anthem was made. */
  footer?: string;
}

const heading = (stanza: Stanza, verse: number) => (stanza.type === 'chorus' ? 'Chorus' : `Verse ${verse}`);

/** The stanzas to try, most first: everything, then one fewer from the end each time. */
function candidates(anthem: Anthem): number[][] {
  const all = anthem.stanzas.map((_, i) => i);
  const out: number[][] = [];
  for (let n = all.length; n >= 1; n -= 1) out.push(all.slice(0, n));
  return out;
}

/** Where everything goes. The SVG is drawn from this, and the tests check it. */
export function layoutSheet(anthem: Anthem, rawSettings: Settings, options: SheetOptions): SheetLayout {
  const settings = cleanSettings(rawSettings);
  const { size } = options;
  const palette = options.palette ?? NIGHT;
  const measure = options.measure ?? estimateWidth;
  const { width, height } = size;
  const margin = Math.round(Math.min(width, height) * 0.075);
  const inner = width - margin * 2;
  const verseNumbers = anthem.stanzas.map((stanza, i) => anthem.stanzas.slice(0, i + 1).filter((st) => st.type === 'verse').length);
  const totalVerses = anthem.stanzas.filter((st) => st.type === 'verse').length;

  const whose = settings.country === '' ? 'A national anthem' : `National anthem of ${settings.country}`;
  const metre = settings.metre === 'free' ? 'free verse' : METRES[settings.metre].label;
  const sub = `${whose} · ${metre} · ${schemeFor(settings.metre, settings.scheme)}`;
  const footer = options.footer ?? '';

  // Sizes hang off the lyric line's size, s.
  const floor = width * 0.021;
  const ceiling = width * 0.04;
  const plan = (shown: number[], columns: number, s: number) => {
    const gap = s * 1.1;
    const columnWidth = (inner - gap * 1.5 * (columns - 1)) / columns;
    const titleSize = Math.min(s * 1.7, (s * 1.7 * inner) / Math.max(inner, measure(anthem.title, s * 1.7, true)));
    const subSize = Math.min(s * 0.62, (s * 0.62 * inner) / Math.max(inner, measure(sub, s * 0.62, false)));
    const head = titleSize * 1.15 + subSize * 1.9 + s * 1.2;
    const stanzaHeight = s * 0.6 * 1.9 + 4 * s * 1.42;
    const perColumn = Math.ceil(shown.length / columns);
    const note = shown.length < anthem.stanzas.length ? s * 0.62 * 1.8 : 0;
    const foot = footer === '' ? 0 : s * 0.55 * 2.2;
    const tall = head + perColumn * stanzaHeight + (perColumn - 1) * gap + note + foot;
    const widest = Math.max(
      ...shown.flatMap((i) => anthem.stanzas[i]!.lines.map((line) => measure(line.text, s, anthem.stanzas[i]!.type === 'chorus'))),
      0,
    );
    return { gap, columnWidth, titleSize, subSize, head, stanzaHeight, perColumn, note, foot, tall, widest };
  };
  const fits = (shown: number[], columns: number, s: number) => {
    const p = plan(shown, columns, s);
    return p.tall <= height - margin * 2 && p.widest <= p.columnWidth;
  };

  let chosen: { shown: number[]; columns: number; s: number } | null = null;
  for (const shown of candidates(anthem)) {
    // Two columns only where the sheet is wider than tall and there is more than one stanza.
    const columnChoices = width > height * 1.2 && shown.length > 1 ? [2, 1] : [1];
    let best: { columns: number; s: number } | null = null;
    for (const columns of columnChoices) {
      // The largest size that fits, by halving.
      if (!fits(shown, columns, floor)) continue;
      let low = floor;
      let high = ceiling;
      for (let i = 0; i < 18; i += 1) {
        const mid = (low + high) / 2;
        if (fits(shown, columns, mid)) low = mid;
        else high = mid;
      }
      if (!best || low > best.s) best = { columns, s: low };
    }
    if (best) {
      chosen = { shown, ...best };
      break;
    }
  }
  if (!chosen) {
    // Even one stanza is too much at a readable size (a very long typed line, say): show the
    // first verse as large as it will go.
    let s = floor;
    const shown = [0];
    for (let i = 0; i < 40 && s > 6 && !fits(shown, 1, s); i += 1) s *= 0.93;
    chosen = { shown, columns: 1, s };
  }

  const { shown, columns, s } = chosen;
  const p = plan(shown, columns, s);
  const texts: SheetText[] = [];
  const put = (text: string, x: number, y: number, fontSize: number, bold: boolean, fill: string, spaced = false) => {
    const shownText = spaced ? text.toUpperCase() : text;
    texts.push({ text: shownText, x: Math.round(x), y: Math.round(y), size: Math.round(fontSize * 10) / 10, bold, fill, spaced, width: measure(shownText, fontSize, bold) * (spaced ? 1.12 : 1) });
  };

  // The block is centred between the top and bottom margins.
  let y = margin + Math.max(0, (height - margin * 2 - p.tall) / 2);
  y += p.titleSize;
  put(anthem.title, margin, y, p.titleSize, true, palette.ink);
  y += p.subSize * 1.9;
  put(sub, margin, y, p.subSize, false, palette.muted);
  const rule = { x: margin, y: Math.round(y + s * 0.45), width: Math.round(s * 3), height: Math.max(2, Math.round(s * 0.09)) };
  const top = y + s * 1.2;

  shown.forEach((stanzaIndex, n) => {
    const stanza = anthem.stanzas[stanzaIndex]!;
    const column = Math.floor(n / p.perColumn);
    const row = n % p.perColumn;
    const x = margin + column * (p.columnWidth + p.gap * 1.5);
    let lineY = top + row * (p.stanzaHeight + p.gap) + s * 0.6;
    const own = stanza.type === 'chorus' && settings.metre !== 'free' && stanzaMetre(stanza) !== METRES[settings.metre].label ? ` · ${stanzaMetre(stanza)}` : '';
    put(`${heading(stanza, verseNumbers[stanzaIndex]!)}${own}`, x, lineY, s * 0.6, true, palette.muted, true);
    lineY += s * 0.6 * 0.9;
    for (const line of stanza.lines) {
      lineY += s * 1.42;
      put(line.text, x, lineY, s, stanza.type === 'chorus', palette.ink);
    }
  });

  let footY = top + p.perColumn * p.stanzaHeight + (p.perColumn - 1) * p.gap;
  if (p.note > 0) {
    footY += p.note;
    put(leftOut(anthem, shown, totalVerses), margin, footY, s * 0.62, false, palette.muted);
  }
  if (footer !== '') put(footer, margin, height - margin, s * 0.55, true, palette.accent);

  return { size, texts, rule, shown, lineSize: s, columns };
}

/** What a sheet that leaves stanzas out says about it: "Verse 1 and the chorus, of 3 verses." */
function leftOut(anthem: Anthem, shown: number[], totalVerses: number): string {
  const verses = shown.filter((i) => anthem.stanzas[i]!.type === 'verse').length;
  const chorus = shown.some((i) => anthem.stanzas[i]!.type === 'chorus');
  const part = verses === 1 ? 'Verse 1' : `Verses 1 to ${verses}`;
  return `${part}${chorus ? ' and the chorus' : ''}, of ${totalVerses} verses.`;
}

const xml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FONT = 'system-ui, Arial, sans-serif';

/** The sheet in words, for the picture's alt text. */
export function sheetAlt(anthem: Anthem, rawSettings: Settings, layout: SheetLayout): string {
  const settings = cleanSettings(rawSettings);
  const whose = settings.country === '' ? 'a national anthem' : `the national anthem of ${settings.country}`;
  const all = layout.shown.length === anthem.stanzas.length;
  return `Lyric sheet of “${anthem.title}”, ${whose}${all ? '' : ': the first part of the words'}.`;
}

/** The lyric sheet as an SVG picture. */
export function sheetSvg(anthem: Anthem, settings: Settings, options: SheetOptions): string {
  const palette = options.palette ?? NIGHT;
  const layout = layoutSheet(anthem, settings, options);
  const { width, height } = layout.size;
  const lines = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="sheet-title sheet-desc">`,
    `<title id="sheet-title">${xml(anthem.title)}</title>`,
    `<desc id="sheet-desc">${xml(sheetAlt(anthem, settings, layout))}</desc>`,
    `<rect width="${width}" height="${height}" fill="${xml(palette.paper)}"/>`,
    `<rect x="${layout.rule.x}" y="${layout.rule.y}" width="${layout.rule.width}" height="${layout.rule.height}" fill="${xml(palette.accent)}"/>`,
  ];
  for (const t of layout.texts) {
    const spacing = t.spaced ? ` letter-spacing="${Math.round(t.size * 0.8) / 10}"` : '';
    lines.push(`<text x="${t.x}" y="${t.y}" font-family="${FONT}" font-size="${t.size}" font-weight="${t.bold ? 700 : 400}" fill="${xml(t.fill)}"${spacing}>${xml(t.text)}</text>`);
  }
  lines.push('</svg>');
  return lines.join('\n') + '\n';
}
