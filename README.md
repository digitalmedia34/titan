# TITAN

## Technical Intelligence, Tasking & AI Navigation

**Developed by NETELITE**

**TITAN** is a Codex-native software development methodology for working with **ASTRA, SOL, LUNA, and weaker GPT coding models** inside a structured project workflow.

Its purpose is simple:

> Use stronger reasoning where decisions matter, then hand clearly prepared work to efficient implementation models.

TITAN keeps the methodology **inside the repository** so Codex sessions can quickly understand:

- where the project currently is;
- which model/role should work next;
- which documents must be read;
- which implementation plan is active;
- when a model must stop instead of improvising;
- when review, debugging, deployment, or human approval is required.

TITAN is designed specifically for a Codex workflow built around ASTRA, SOL, LUNA, and weaker GPT models. It is not intended to be a generic methodology for unrelated AI ecosystems.

---

## Core workflow

```text
USER IDEA
↓
SOL DISCOVERY / BRAINSTORMING
↓
PROJECT SPECIFICATION
↓
SOL ARCHITECTURE
↓
[OPTIONAL ASTRA CRITICAL REVIEW]
↓
USER + SOL BASELINE
↓
MASTER DEVELOPMENT PLAN
↓
SOL JUST-IN-TIME PLAN FOR LUNA
↓
LUNA IMPLEMENTATION
↓
TESTS
↓
STOP / REVIEW / NEXT MODULE
↓
FINAL REVIEW
↓
DEPLOYMENT
↓
PRODUCTION VERIFICATION
```

The key operating rule is:

> **SOL prepares; LUNA executes.**

Detailed implementation plans are created **just in time**, when a module is actually ready to be built and after SOL inspects the current repository state.

---

## Why TITAN exists

Long AI-assisted software projects often fail for predictable reasons:

- project context gets lost across sessions;
- weaker models are given tasks that still require architectural reasoning;
- implementation models improvise when assumptions break;
- large plans become stale before later modules are reached;
- UI intent is under-specified;
- local test success is confused with real production verification;
- strong models are wasted on routine implementation work.

TITAN addresses these problems through explicit roles, repository state, gated phases, just-in-time planning, STOP rules, and targeted review.

---

## Model responsibilities

### SOL
Primary reasoning model for:

- discovery;
- requirements clarification;
- architecture;
- implementation planning;
- complex debugging;
- high-risk review;
- deployment planning.

### LUNA
Primary implementation model for:

- well-defined feature implementation;
- CRUD;
- validation;
- controllers and services;
- Blade/UI work with a clear brief;
- JavaScript/CSS;
- tests;
- routine fixes and refactors.

### ASTRA
Optional critical reviewer for:

- unusually complex projects;
- foundational architecture decisions;
- high-risk data/security decisions;
- expensive-to-reverse choices.

### Weaker GPT models
May be used only when the task is:

- tightly specified;
- low risk;
- easy to verify;
- free of important architectural decisions.

---

## Repository structure

```text
TITAN/
│
├── AGENTS.md
├── README.md
├── TITAN_START_HERE.md
├── TITAN_USER_GUIDE.md
├── TITAN_VERSION.md
│
├── .titan/
│   ├── STATE.md
│   ├── WORKFLOW.md
│   │
│   ├── roles/
│   │   ├── ASTRA.md
│   │   ├── SOL.md
│   │   └── LUNA.md
│   │
│   ├── prompts/
│   │   ├── 01_DISCOVERY.md
│   │   ├── 02_FUNCTIONAL_SPEC.md
│   │   ├── 03_SOL_ARCHITECTURE.md
│   │   ├── 04_ASTRA_CRITICAL_REVIEW.md
│   │   ├── 05_MASTER_PLAN.md
│   │   ├── 06_SOL_PLAN_FOR_LUNA.md
│   │   ├── 07_LUNA_IMPLEMENT.md
│   │   ├── 08_SOL_REVIEW.md
│   │   ├── 09_INTEGRATION_CHECKPOINT.md
│   │   ├── 10_SOL_DEBUG.md
│   │   ├── 11_LUNA_UI_TASK.md
│   │   ├── 12_SOL_PRE_DEPLOY.md
│   │   └── 13_FINAL_PROJECT_REVIEW.md
│   │
│   └── templates/
│       ├── UI_BRIEF.md
│       ├── DECISION_TEMPLATE.md
│       └── MODULE_PLAN_TEMPLATE.md
│
└── docs/
    ├── PROJECT_INTAKE.md
    ├── PROJECT_SPEC.md
    ├── ARCHITECTURE.md
    ├── MASTER_PLAN.md
    ├── DECISIONS.md
    ├── STATUS.md
    └── plans/
        └── .gitkeep
```

---

## Quick start

1. Copy the TITAN starter files into the root of a new Codex project/repository.
2. Open the repository in Codex.
3. Select **SOL**.
4. Start with:

```text
Start this project using the TITAN methodology.

Idea:
<describe the project in your own words>
```

The fresh starter begins in:

```text
PHASE: 01_DISCOVERY
EXPECTED_ROLE: SOL_DISCOVERY
```

SOL should therefore begin discovery instead of coding.

---

## Everyday commands

In normal use, short instructions should often be enough:

```text
Continue according to TITAN.
Continue according to the active plan.
Approved. Continue.
I switched to LUNA. Continue according to the active plan.
I switched to SOL. Review the blocker according to TITAN.
Move to the next module according to the Master Plan.
```

The repository should carry the detailed process.

---

## Important limitation

TITAN does **not** automatically switch models.

`.titan/STATE.md` declares the expected role/model and next action. The USER performs the actual model switch in Codex.

---

## Status

**TITAN v1.0** is the first public operational baseline of the methodology.

The methodology should evolve from real project evidence, not from theoretical complexity.
