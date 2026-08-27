---
name: Durable runtime replay failures
description: What to do when CodeExecution fails with a durable-runtime replay error instead of running your code.
---

When `CodeExecution` fails with `Error replaying durable ptc`, the sandbox
itself is wedged — the code is usually fine.

**Why:** the durable runtime records and replays callback results. Once replay
diverges, every retry of that block fails the same way, so iterating on the
code is wasted effort.

**How to apply:** do not debug the sandbox. If the work is plain scripting
(HTTP fetches, file writes, parsing) with no dependency on registered
callbacks, move it into a `.mjs` script under `scripts/` and run it with
`ShellExec`. Resolve paths from the repo root via `import.meta.url` so it
still works when invoked through `pnpm --filter`. Reserve `CodeExecution` for
work that genuinely needs the registered callbacks.
