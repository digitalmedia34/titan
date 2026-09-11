# Prompt — Integration Checkpoint

Use with role: `SOL_REVIEWER`

```text
Review the completed related modules as one functional system.

Do not evaluate them only as isolated features.

Check:

- whether relationships between modules work correctly;
- whether business logic is duplicated or contradictory;
- whether lifecycle/status handling is inconsistent;
- whether permission/security gaps exist;
- whether a data-integrity problem exists;
- whether regressions exist between modules;
- whether planned future modules are still supported by the current
  architecture;
- whether there is technical debt that is cheap to fix now but expensive
  to postpone.

Do not recommend cosmetic refactors.

Finish with:

CHECKPOINT PASS

or:

CHECKPOINT REPAIR REQUIRED
```
