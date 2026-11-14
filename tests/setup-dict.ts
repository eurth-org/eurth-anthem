// Builds src/anthem/generated/lexicon.txt before the tests when it is missing or older than the
// dictionary or the tool that makes it.
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SOURCE, TARGET, writeLexicon } from '../tools/build-dict.mjs';

export default function setup(): void {
  const tool = fileURLToPath(new URL('../tools/build-dict.mjs', import.meta.url));
  const stale =
    !existsSync(TARGET) ||
    statSync(TARGET).mtimeMs < statSync(SOURCE).mtimeMs ||
    statSync(TARGET).mtimeMs < statSync(tool).mtimeMs;
  if (stale) writeLexicon();
}
