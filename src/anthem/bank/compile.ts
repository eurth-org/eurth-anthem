// Compiles the batches as written into the bank the generator uses, and checks them on the way:
// every phrase against its class's rhythm, every template against its line's metre, every word
// against the dictionary. The compiled bank carries each ending's rhyme, so writing an anthem
// needs no dictionary.

import type { Lexicon, Pron } from '../lexicon.ts';
import { KIND_PATTERN, LINE_KINDS, type LineKind } from '../metre.ts';
import { lineEnd } from '../rhyme.ts';
import { fitLine, scanLine, sits, type Overrides, type WordScan } from '../scan.ts';
import {
  MOOD_IDS,
  NAME_SHAPES,
  ROLES,
  type Bank,
  type BatchSource,
  type End,
  type Item,
  type MoodId,
  type Part,
  type Register,
  type Role,
  type SlotClass,
  type Template,
  type TitleTemplate,
} from './types.ts';

export interface Compiled {
  bank: Bank;
  /** What is wrong with the batches, one sentence each. Empty when all is well. */
  problems: string[];
}

interface Tags {
  text: string;
  themes: string[];
  moods: MoodId[];
  reg: Register | null;
  to: string | null;
  chorus: 'only' | 'never' | 'any';
  bad: string[];
}

function readTags(raw: string): Tags {
  const tags: Tags = { text: '', themes: [], moods: [], reg: null, to: null, chorus: 'any', bad: [] };
  const words: string[] = [];
  for (const token of raw.trim().split(/\s+/)) {
    if (token.startsWith('#') && token.length > 1) tags.themes.push(token.slice(1));
    else if (token.startsWith('@')) {
      if ((MOOD_IDS as readonly string[]).includes(token.slice(1))) tags.moods.push(token.slice(1) as MoodId);
      else tags.bad.push(token);
    } else if (token === '&thee' || token === '&you') tags.reg = token.slice(1) as Register;
    else if (token.startsWith('>') && token.length > 1) tags.to = token.slice(1);
    else if (token === '+chorus') tags.chorus = 'only';
    else if (token === '-chorus') tags.chorus = 'never';
    else if (/^[#@&>+]/.test(token)) tags.bad.push(token);
    else words.push(token);
  }
  tags.text = words.join(' ');
  return tags;
}

/** The rhythm a class id promises: "gift.Sw" is "Sw". */
export function classPattern(id: string): string | null {
  const pattern = id.slice(id.lastIndexOf('.') + 1);
  return /^[Sw]{1,7}$/.test(pattern) && id.includes('.') ? pattern : null;
}

function runtimeKind(id: string): 'name' | 'place' | null {
  if (id.startsWith('name.')) return 'name';
  if (id.startsWith('place.')) return 'place';
  return null;
}

function toEnd(words: readonly WordScan[], choice: readonly Pron[], pattern: string): End | null {
  const end = lineEnd(words, choice, pattern);
  return end ? { key: end.key, onset: end.onset, word: end.word, weak: end.weak } : null;
}

const OPEN_AFTER = new Set(['the', 'our', 'thy', 'your']);

function splitParts(text: string): (string | { cls: string })[] {
  const out: (string | { cls: string })[] = [];
  let at = 0;
  for (const m of text.matchAll(/\{([^}]+)\}/g)) {
    if (m.index > at) out.push(text.slice(at, m.index));
    out.push({ cls: m[1]! });
    at = m.index + m[0].length;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}

export function compileBank(batches: readonly BatchSource[], lex: Lexicon): Compiled {
  const problems: string[] = [];
  const classes: Record<string, SlotClass> = {};
  const templates: Template[] = [];
  const titles: TitleTemplate[] = [];
  const own: Record<string, string> = {};
  for (const batch of batches) Object.assign(own, batch.own ?? {});
  const overrides: Overrides = own;

  const scan = (text: string, where: string): WordScan[] => {
    const words = scanLine(text, lex, overrides);
    for (const w of words) {
      if (w.source === 'guess') problems.push(`${where}: "${w.text}" isn't in the dictionary; give its stress in the batch's own list.`);
    }
    return words;
  };

  for (const shape of NAME_SHAPES) {
    for (const kind of ['name', 'place'] as const) {
      const id = `${kind}.${shape}`;
      classes[id] = { id, pattern: shape, items: [], runtime: kind };
    }
  }

  // Classes first, across all batches, so a template may use a class a later batch adds to.
  for (const batch of batches) {
    for (const [id, list] of Object.entries(batch.classes)) {
      const pattern = classPattern(id);
      if (!pattern) {
        problems.push(`${batch.id}: class "${id}" must end in its rhythm, like "gift.Sw".`);
        continue;
      }
      if (runtimeKind(id)) {
        problems.push(`${batch.id}: class "${id}" is filled when the anthem is written and takes no phrases.`);
        continue;
      }
      const cls = (classes[id] ??= { id, pattern, items: [], runtime: null });
      const canEnd = pattern.endsWith('S') || pattern.endsWith('Sw');
      for (const raw of list.split(',')) {
        if (raw.trim() === '') continue;
        const tags = readTags(raw);
        const where = `${batch.id}: "${tags.text}" in ${id}`;
        for (const bad of tags.bad) problems.push(`${where}: unknown tag ${bad}.`);
        if (tags.to || tags.chorus !== 'any') problems.push(`${where}: a phrase takes only # @ & tags.`);
        if (cls.items.some((item) => item.text === tags.text)) {
          problems.push(`${where}: listed twice.`);
          continue;
        }
        const words = scan(tags.text, where);
        const fit = fitLine(words, pattern);
        if (!fit.ok) {
          const why = fit.problem?.kind === 'count' ? `it has ${fit.problem.have} syllables, not ${fit.problem.want}` : 'its stress falls on a weak beat';
          problems.push(`${where}: doesn't fit ${pattern}: ${why}.`);
          continue;
        }
        cls.items.push({
          text: tags.text,
          themes: tags.themes,
          moods: tags.moods,
          reg: tags.reg,
          batch: batch.id,
          end: canEnd ? toEnd(words, fit.choice, pattern) : null,
        });
      }
    }
  }

  const toParts = (text: string, where: string): Part[] | null => {
    const parts: Part[] = [];
    let ok = true;
    let before = '';
    for (const piece of splitParts(text)) {
      if (typeof piece === 'string') {
        parts.push({ lit: piece });
        before = piece;
        continue;
      }
      if (!classes[piece.cls]) {
        problems.push(`${where}: there is no class "${piece.cls}".`);
        ok = false;
        continue;
      }
      const lastWord = before.trim().split(/\s+/).pop()?.toLowerCase() ?? '';
      parts.push({ cls: piece.cls, open: piece.cls.startsWith('ground.') && /\s$/.test(before) && OPEN_AFTER.has(lastWord) });
      before = '';
    }
    return ok ? parts : null;
  };

  for (const batch of batches) {
    batch.templates.forEach((raw, index) => {
      const bar = raw.indexOf('|');
      const head = raw.slice(0, bar).trim().split(/\s+/);
      const where = `${batch.id}: template "${raw}"`;
      const role = head[0] as Role;
      const kind = head[1] as LineKind;
      if (bar === -1 || head.length !== 2 || !ROLES.includes(role) || !LINE_KINDS.includes(kind)) {
        problems.push(`${where}: must read "role kind | text".`);
        return;
      }
      const tags = readTags(raw.slice(bar + 1));
      for (const bad of tags.bad) problems.push(`${where}: unknown tag ${bad}.`);
      const parts = toParts(tags.text, where);
      if (!parts) return;

      // Lay the words and slots along the line's beats.
      const pattern = KIND_PATTERN[kind];
      type Step = { word: WordScan } | { cls: SlotClass };
      const steps: Step[] = [];
      for (const part of parts) {
        if ('lit' in part) for (const word of scan(part.lit, where)) steps.push({ word });
        else steps.push({ cls: classes[part.cls]! });
      }
      const chosen: (Pron | null)[] = [];
      const walk = (i: number, at: number): boolean => {
        if (i === steps.length) return at === pattern.length;
        const step = steps[i]!;
        if ('cls' in step) {
          const want = step.cls.pattern;
          if (pattern.slice(at, at + want.length) !== want) return false;
          chosen[i] = null;
          return walk(i + 1, at + want.length);
        }
        for (const pron of step.word.prons) {
          if (!sits(pron, at, pattern)) continue;
          chosen[i] = pron;
          if (walk(i + 1, at + pron.stress.length)) return true;
        }
        return false;
      };
      if (!walk(0, 0)) {
        problems.push(`${where}: doesn't fit ${kind} (${pattern}).`);
        return;
      }

      const names = parts.flatMap((p) => ('cls' in p && classes[p.cls]!.runtime === 'name' ? [p.cls] : []));
      const places = parts.flatMap((p) => ('cls' in p && classes[p.cls]!.runtime === 'place' ? [p.cls] : []));
      if (new Set(names).size > 1) {
        problems.push(`${where}: uses two different name shapes.`);
        return;
      }

      // What the line ends on.
      let endCls: string | null = null;
      let endLit: End | null = null;
      const lastStep = steps[steps.length - 1]!;
      if ('cls' in lastStep) {
        const p = lastStep.cls.pattern;
        if (!(p.endsWith('S') || p.endsWith('Sw')) || (pattern.endsWith('w') && p.length < 2)) {
          problems.push(`${where}: the last slot can't carry the rhyme.`);
          return;
        }
        endCls = lastStep.cls.id;
      } else {
        const tailWords: WordScan[] = [];
        const tailProns: Pron[] = [];
        for (let i = steps.length - 1; i >= 0 && tailWords.length < 2; i -= 1) {
          const step = steps[i]!;
          if ('cls' in step) break;
          tailWords.unshift(step.word);
          tailProns.unshift(chosen[i]!);
        }
        endLit = toEnd(tailWords, tailProns, pattern);
        if (!endLit && pattern.endsWith('w') && tailProns[tailProns.length - 1]!.stress.length === 1 && tailWords.length < 2) {
          problems.push(`${where}: a line may not end in one weak word straight after a slot.`);
          return;
        }
      }

      templates.push({
        id: `${batch.id}:${index}`,
        role,
        kind,
        parts,
        source: raw,
        themes: tags.themes,
        moods: tags.moods,
        reg: tags.reg,
        to: tags.to,
        chorus: tags.chorus,
        batch: batch.id,
        nameCls: names[0] ?? null,
        placeCls: places,
        endCls,
        endLit,
      });
    });

    for (const raw of batch.titles ?? []) {
      const tags = readTags(raw);
      const where = `${batch.id}: title "${raw}"`;
      const parts: (Part | { name: true })[] = [];
      let ok = true;
      for (const piece of splitParts(tags.text)) {
        if (typeof piece === 'string') parts.push({ lit: piece });
        else if (piece.cls === 'name') parts.push({ name: true });
        else if (!classes[piece.cls] || classes[piece.cls]!.runtime) {
          problems.push(`${where}: there is no class "${piece.cls}" a title can use.`);
          ok = false;
        } else parts.push({ cls: piece.cls, open: false });
      }
      if (ok) titles.push({ parts, themes: tags.themes, batch: batch.id });
    }
  }

  for (const cls of Object.values(classes)) {
    if (!cls.runtime && cls.items.length === 0) problems.push(`class "${cls.id}" has no phrases.`);
  }

  return {
    bank: {
      classes,
      templates,
      titles,
      batches: batches.map((b) => ({ id: b.id, title: b.title, reviewed: b.reviewed })),
    },
    problems,
  };
}

/** The same batches without the ones Stijn hasn't reviewed: what a launch build ships. */
export function reviewedOnly(batches: readonly BatchSource[]): BatchSource[] {
  return batches.filter((b) => b.reviewed);
}
