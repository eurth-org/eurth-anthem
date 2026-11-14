export const SOURCE: string;
export const TARGET: string;
export const SOURCE_SHA256: string;
export function parseEntry(line: string): { word: string; stress: string; tail: string; onset: string; rank: number } | null;
export function buildLexicon(source: string): { text: string; words: number; tails: number };
export function writeLexicon(): { text: string; words: number; tails: number };
