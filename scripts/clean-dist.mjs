// Removes dist/ so a renamed or deleted source file cannot leave stale output
// in the next build or tarball.
import { rmSync } from 'node:fs';

rmSync(new URL('../dist', import.meta.url), { recursive: true, force: true });
