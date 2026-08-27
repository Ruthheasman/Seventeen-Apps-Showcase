---
name: Trusting testing-subagent failure reports
description: When a UI testing subagent reports a regression you cannot explain from the code, instrument before you re-run.
---

## A failure report is a claim about a build, not about the code

A long-lived testing subagent keeps its own browser. Its report describes
whatever bundle that browser had at click time, which is not necessarily the
code you just wrote — a missed HMR update or a context opened before your edit
is enough to produce a confident, detailed, entirely stale failure.

**Why:** a testing subagent reported the same interaction regression twice
across two rounds, including after the fix that resolved it. Both reports were
specific and plausible. Re-reading the handler each time found nothing, because
nothing was wrong.

**How to apply:** when a reported failure contradicts a careful read of the
code, do not re-run the same pass and do not start rewriting the handler.
Instead:

1. Add a temporary `console.log` at the decision point, printing the inputs the
   branch actually turns on (the event's index, the current state, any guard
   flag).
2. Ask for a **fresh browser context with a hard reload**, and demand the raw
   evidence verbatim — the console lines in order, the attribute values before
   and after, and `document.elementFromPoint` at the click coordinates to prove
   which element is really under the cursor.
3. Insist on all of it even if the run looks broken early; a subagent that
   stops at the first failure hides the data that would explain it.
4. Remove the instrumentation once the question is settled.

One instrumented round trip settles what several clean re-runs cannot. Framing
the request as "report the facts, not a pass/fail" is what makes the difference
— the same subagent that twice concluded "still broken" produced the log lines
proving it worked as soon as it was asked for raw output.
