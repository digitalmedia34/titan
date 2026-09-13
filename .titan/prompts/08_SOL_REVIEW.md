# Prompt — SOL Review

Use with role: `SOL_REVIEWER`

Inspect the acceptance-to-verification evidence in the active plan. Required FAIL or NOT_RUN cannot become PASS_WITH_NOTES. Apply WORKFLOW's state transitions after the review: accept only when criteria and gates are satisfied; for repairs amend the active plan, preserve completed evidence, mark READY only when executable, and require re-review. If SOL must retain implementation, record the proposed bounded takeover scope and verification before changing roles.

This review is application-code-read-only. Inspect the implementation and run existing non-destructive checks as needed, but do not modify application code/tests, implement a fix provisionally, or implement and revert to validate the review. Put required changes and missing tests in the repair plan for LUNA. If the result is `SOL_TAKEOVER`, first move from `SOL_REVIEWER` to `SOL_DEBUGGER` (or another explicitly assigned SOL repair/implementation role) and record the bounded scope. SOL may then modify and test application code within that new task; it must not implement while still acting as `SOL_REVIEWER`.

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
