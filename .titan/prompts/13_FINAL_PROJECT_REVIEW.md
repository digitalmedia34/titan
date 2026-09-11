# Prompt — Final Project Review

Use with role: `SOL_REVIEWER`

Trace MVP/MUST criteria to implementation and actual verification evidence. Required FAIL/NOT_RUN prevents readiness; list each missing check and consequence as blocking. Local readiness does not mean production verification or authorize deployment.

```text
The application is functionally implemented.

Perform a final system review of the entire project before production
sign-off.

Check:

1. PROJECT_SPEC against the real implementation;
2. whether all MVP/MUST requirements are complete;
3. permissions;
4. security;
5. data integrity;
6. lifecycle processes;
7. edge cases;
8. audit requirements where applicable;
9. errors and failure behavior;
10. responsive/mobile behavior;
11. test coverage;
12. build/deployment readiness;
13. unnecessary debug/dev artifacts;
14. open TODO/FIXME items;
15. documentation;
16. backup/restore assumptions;
17. production smoke tests that will be required.

Do not propose new product features.

Separate findings into:

BLOCKING
NON_BLOCKING
FUTURE_IMPROVEMENT

Finish with:

READY FOR PRODUCTION

or:

NOT READY FOR PRODUCTION
```
