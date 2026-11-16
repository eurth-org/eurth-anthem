// Every batch of the phrase bank, in the order they were written.

import { core } from './core.ts';
import { mountains } from './mountains.ts';
import { sea } from './sea.ts';
import type { BatchSource } from './types.ts';

export const BATCHES: readonly BatchSource[] = [core, sea, mountains];
