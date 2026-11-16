// Every batch of the phrase bank, in the order they were written.

import { chorus } from './chorus.ts';
import { core } from './core.ts';
import { crown } from './crown.ts';
import { faith } from './faith.ts';
import { freedom } from './freedom.ts';
import { labour } from './labour.ts';
import { last } from './last.ts';
import { more } from './more.ts';
import { mountains } from './mountains.ts';
import { sea } from './sea.ts';
import type { BatchSource } from './types.ts';
import { unity } from './unity.ts';

export const BATCHES: readonly BatchSource[] = [core, sea, mountains, freedom, unity, faith, labour, crown, more, chorus, last];
