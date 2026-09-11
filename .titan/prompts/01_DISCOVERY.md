# Prompt — Project Discovery / Brainstorming

Use with role: `SOL_DISCOVERY`

```text
I want to start a new web application project.

Do not start coding yet and do not immediately create the final technical
architecture.

First, run a detailed brainstorming/discovery session with me so we can
clearly understand:

- the business problem;
- users and roles;
- main workflows;
- lifecycle of key processes;
- business rules;
- permissions and restrictions;
- edge cases;
- failure scenarios;
- required records/data;
- reports;
- administration;
- audit requirements where relevant;
- responsive/mobile needs;
- MVP scope;
- what should not be part of the project.

Do not automatically accept my assumptions.

If you see a contradiction, unnecessary complexity, a missed problem, a
better simpler approach, or a feature that probably does not belong in
the MVP, say so clearly.

Ask questions in logical groups. Do not turn discovery into an endless
questionnaire and do not move into implementation details before the
business process is sufficiently clear.

Work in two modes:

1. DIVERGENCE — explore the problem, scenarios, and alternatives.
2. CONVERGENCE — narrow the system to what should actually be built.

When discovery is mature enough, summarize:

1. what we have definitely decided;
2. what is still undecided;
3. the main risks;
4. what you recommend for the MVP;
5. what you recommend deferring.

Do not create detailed LUNA tasks yet.
```

After discovery, update `.titan/STATE.md` to the USER gate for functional specification.

Persist a concise discovery summary in `docs/PROJECT_INTAKE.md` after meaningful decisions and before a pause or handoff: CONFIRMED, OPEN DECISIONS, PROPOSED MVP, DEFERRED, and NEXT DISCOVERY FOCUS. Update the summary, not a conversation transcript. USER input remains optional; SOL maintains the summary even when the idea was given in chat.

At the discovery gate use PHASE_STATUS: WAITING, GATE: DISCOVERY_EXIT, WAITING_FOR: USER_APPROVAL. On approval move to 02_FUNCTIONAL_SPEC with SOL_ARCHITECT and the functional-spec prompt in READ_NEXT; clear the resolved gate and wait.
