# Prompt — SOL System Architecture

Use with role: `SOL_ARCHITECT`

```text
Based on the approved docs/PROJECT_SPEC.md, create the technical
architecture for the project.

The goal is the simplest maintainable architecture that reliably
satisfies the specification.

Define:

1. stack;
2. main models/entities;
3. relationships;
4. key statuses and lifecycle;
5. permissions approach;
6. main services and responsibilities;
7. where DB transactions are required;
8. file/media approach if relevant;
9. background/cron/queue needs only if genuinely required;
10. audit approach;
11. reporting approach;
12. testing strategy;
13. deployment assumptions;
14. main technical risks.

Do not overengineer.

Do not introduce a pattern, dependency, or service layer merely because
it exists.

Prefer framework capabilities and the least complex solution that is
still sufficiently robust.

Do not create detailed coding tasks for every module yet.

Save the result to:

docs/ARCHITECTURE.md
```

Then decide whether an ASTRA challenge review has enough expected value to justify using it. Do not invoke ASTRA automatically.
