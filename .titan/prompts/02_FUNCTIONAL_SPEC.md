# Prompt — Functional Specification

Use with role: `SOL_ARCHITECT`

```text
Based on the completed discovery session, create the final functional
specification for the project.

The document must clearly define:

1. application purpose;
2. users and roles;
3. modules;
4. main workflows;
5. lifecycle of key entities/processes;
6. business rules;
7. permissions;
8. edge cases;
9. failure behavior;
10. audit requirements where needed;
11. reports;
12. MVP scope;
13. explicit OUT OF SCOPE;
14. known risks;
15. open decisions.

Do not create a detailed implementation plan yet.

Do not add features that were not agreed during discovery.

If something is still undecided, mark it as OPEN DECISION instead of
silently assuming an answer.

Save the result to:

docs/PROJECT_SPEC.md
```

After USER approval, `docs/PROJECT_SPEC.md` becomes the business/functional baseline.

Read the saved discovery summary in `docs/PROJECT_INTAKE.md` alongside current USER decisions. Resolve contradictions explicitly. After baseline approval, intake remains a historical discovery record rather than a second maintained specification.
