# Prompt — LUNA UI/UX Task

Use with role: `LUNA_IMPLEMENTER`

A clear UI brief is required for non-trivial visual changes.

Record the brief's required checks as PASS / FAIL / NOT_RUN with concrete evidence, including relevant keyboard/accessibility behavior. If required browser verification is unavailable, report NOT_RUN and its consequence instead of claiming visual completion; follow the workflow prerequisite/blocker rule.

```text
Implement the UI/UX change according to the active UI brief.

Before making changes:

1. locate the exact element;
2. inspect the existing HTML/template;
3. inspect the CSS controlling it;
4. inspect JavaScript only if relevant.

Change only what is necessary.

Pay special attention to:

DO NOT CHANGE.

Verify every viewport/breakpoint variant named in the brief.

If the request contains a material visual ambiguity with two or more
substantially different interpretations, do not perform a broad redesign
based on your own preference.

If browser/screenshot verification is available in the environment,
use it.

At the end, report:

- what changed;
- what was intentionally left untouched;
- desktop result;
- mobile result;
- any remaining visual ambiguity.
```
