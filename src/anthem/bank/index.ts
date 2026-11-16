// Every batch of the phrase bank, in the order they were written.

import { core } from './core.ts';
import { freedom } from './freedom.ts';
import { mountains } from './mountains.ts';
import { sea } from './sea.ts';
import type { BatchSource } from './types.ts';
import { unity } from './unity.ts';

export const BATCHES: readonly BatchSource[] = [core, sea, mountains, freedom, unity];
