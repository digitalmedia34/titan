# TITAN

NAME: Technical Intelligence, Tasking & AI Navigation  
VERSION: 1.1.0
DEVELOPED_BY: NETELITE
STATUS: Released
TARGET: OpenAI Codex workflows  
PRIMARY_FLOW: USER → SOL → LUNA  
OPTIONAL_CRITICAL_REVIEW: ASTRA  
OPTIONAL_IMPLEMENTATION: weaker GPT models for low-risk, tightly specified work

Core principle:

> Strong reasoning prepares the work; the implementation model executes a clear, current, testable plan.

## 1.1.0 changes

- Application-code-read-only boundaries for SOL architecture, planning, and review roles.
- Protection against provisional implementation and implement-and-revert behavior during planning/review.
- A formal `SOL_TAKEOVER` transition before SOL modifies application code.
- Explicit SOL debugging/repair write access after a recorded workflow transition.
- Clear SOL → LUNA plan detail: WHAT / WHERE / WHY / CONSTRAINTS / HOW TO VERIFY.
- Line-by-line implementation remains with LUNA unless exact code is required for correctness, compatibility, security, or an approved interface.

## 1.0.2 changes

- Explicit plan lifecycle, readiness, review ownership, and state transitions.
- Persistent discovery summaries in PROJECT_INTAKE.
- STANDARD and SHORT plans for proportionate work within medium/large projects.
- Acceptance criteria linked to actual PASS / FAIL / NOT_RUN evidence.
- Clarified audience: experienced Codex users building medium and large web applications.

Existing projects: merge methodology changes without replacing populated STATE, intake, specifications, or active plans. Add readiness/review/evidence fields to active plans before resuming. The initializer remains for fresh installation and refuses existing target paths.
