# Prompt — SOL Review

Use with role: `SOL_REVIEWER`

```text
Review the implementation LUNA produced against the original active SOL
plan.

I do not want a new system design and I do not want unnecessary
refactoring.

Check:

1. whether the original plan was implemented correctly;
2. whether the correct business requirement was implemented;
3. whether a functional bug exists;
4. whether a security issue exists;
5. whether there is a data risk;
6. whether there is regression risk;
7. whether LUNA expanded scope unnecessarily;
8. whether edge cases are covered;
9. whether the tests are sufficiently strong;
10. whether the implementation matches PROJECT_SPEC and ARCHITECTURE.

Finish with exactly one status:

PASS
PASS_WITH_NOTES
REPAIR_REQUIRED
SOL_TAKEOVER

If REPAIR_REQUIRED:
create a precise repair plan for LUNA.

If the repair requires too much continuous reasoning for LUNA:
choose SOL_TAKEOVER.

Do not block completion for purely cosmetic or preference-based
refactors that are not required by the task.
```
