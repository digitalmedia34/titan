# TITAN

## Technical Intelligence, Tasking & AI Navigation

**Developed by NETELITE**

**TITAN** is a provider-neutral software development methodology with first-class support for Codex and GitHub Copilot, plus other capable AI coding environments, inside a structured project workflow.

Its purpose is simple:

TITAN is intended for experienced AI-assisted development users building medium and large web applications, with controlled progress across AI coding sessions and role handoffs.

> Use stronger reasoning where decisions matter, then hand clearly prepared work to efficient implementation models.

TITAN keeps the methodology **inside the repository** so AI coding sessions can quickly understand:

- where the project currently is;
- which TITAN role should work next;
- which documents must be read;
- which implementation plan is active;
- when a model must stop instead of improvising;
- when review, debugging, deployment, or human approval is required.

TITAN provides first-class support for Codex and GitHub Copilot while remaining independent of commercial model names.

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
- implementation models are given tasks that still require architectural reasoning;
- implementation models improvise when assumptions break;
- large plans become stale before later modules are reached;
- UI intent is under-specified;
- local test success is confused with real production verification;
- strong models are wasted on routine implementation work.

TITAN addresses these problems through explicit roles, repository state, gated phases, just-in-time planning, STOP rules, and targeted review.

---

## TITAN roles

### SOL
Reasoning role for:

- discovery;
- requirements clarification;
- architecture;
- implementation planning;
- complex debugging;
- high-risk review;
- deployment planning.

### LUNA
Implementation role for:

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

### Choosing AI models

SOL generally benefits from stronger reasoning, LUNA can use efficient implementation-focused models, and ASTRA benefits from independent high-quality reasoning. These are recommendations, not hardcoded identities; TITAN state controls roles and model choice is an implementation detail.

---

## Repository structure

```text
TITAN/
│
├── AGENTS.md
├── .github/
│   └── copilot-instructions.md
├── README.md
├── LICENSE
├── TITAN_START_HERE.md
├── TITAN_USER_GUIDE.md
├── TITAN_VERSION.md
├── package.json
│
├── bin/
│   └── titan.js
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

### Install with npm

Create or open the directory where you want to initialize your project:

```bash
mkdir my-project
cd my-project
```

Initialize TITAN:

```bash
npx -y @netelite/titan@latest
```
or

```bash
npx -y github:digitalmedia34/titan#main
```

TITAN adds its methodology files directly to the current directory. It is not installed as a runtime dependency of your application.

Then open the project directory in Codex, GitHub Copilot, or another supported AI coding environment. The environment should read `.github/copilot-instructions.md` when available, then follow `AGENTS.md`, `.titan/STATE.md`, and the active role instructions.

Start with:

```text
Start this project using the TITAN methodology.

Idea:
<describe the project in your own words>
```

The fresh TITAN setup begins in:

```text
PHASE: 01_DISCOVERY
EXPECTED_ROLE: SOL_DISCOVERY
ROLE_CAPABILITY: REASONING
```

SOL should therefore begin discovery instead of coding.

### Codex

Open the repository in Codex and send:

```text
Start this project according to the TITAN methodology.

Idea:
<describe the project in your own words>
```

Codex follows the role and next action declared in `.titan/STATE.md`. If the state later changes to `LUNA_IMPLEMENTER`, continue according to the active plan; changing the underlying model is optional.

### GitHub Copilot

Open the repository in an environment where GitHub Copilot repository instructions are available. Copilot reads `.github/copilot-instructions.md`, which directs it to the authoritative `AGENTS.md`, TITAN state, role file, and `READ_NEXT` documents.

Start with:

```text
Start this project according to the TITAN methodology.
Follow the role and next action specified by .titan/STATE.md.
```

For an existing project, preserve populated project documents and active plans. Merge TITAN methodology changes rather than replacing project-specific state or specifications.

### Manual installation

Alternatively, download the **TITAN Starter ZIP** from the GitHub Releases page and extract it into the root of your project.

---

## Everyday commands

In normal use, short instructions should often be enough:

```text
Continue according to TITAN.
Continue according to the active plan.
Approved. Continue.
Continue as the role specified by TITAN.
Review the blocker according to TITAN.
Move to the next module according to the Master Plan.
```

The repository should carry the detailed process.

## Usage examples

### Begin discovery

```text
Start the project according to TITAN.
The initial context is in docs/PROJECT_INTAKE.md.
```

The active state is `SOL_DISCOVERY` with `ROLE_CAPABILITY: REASONING`, so the AI should ask focused discovery questions and must not begin coding.

### Create an implementation plan

After the implementation baseline is approved, the state may identify a module for planning:

```text
Continue according to TITAN.
```

When `EXPECTED_ROLE: SOL_PLANNER`, SOL inspects the real repository and creates a just-in-time plan. A `DRAFT` plan must not be executed.

### Implement an approved plan

When state contains `EXPECTED_ROLE: LUNA_IMPLEMENTER`, `ROLE_CAPABILITY: IMPLEMENTATION`, and an active ready plan:

```text
Continue according to the active plan.
```

The LUNA role implements, tests, respects STOP checkpoints, and stops when the plan no longer matches reality. `SOL prepares; LUNA executes.`

### Handle a blocker

If implementation encounters a material conflict:

```text
Review the blocker according to TITAN.
```

The state should move to `SOL_REVIEWER` with `ROLE_CAPABILITY: REASONING`. The reviewer determines the root cause and next safe action rather than improvising.

### Request independent critical review

For unusually complex or risky decisions:

```text
Run the ASTRA critical review according to TITAN.
```

The state should identify `ASTRA_CRITICAL_REVIEW` with `ROLE_CAPABILITY: CRITICAL_REVIEW`. ASTRA challenges serious omissions and risks; USER and SOL decide which findings are accepted.

---

## Roles and model selection

Role transitions are mandatory; model switching is optional. `.titan/STATE.md` declares `EXPECTED_ROLE` and `ROLE_CAPABILITY`, and the active AI environment should assume that role. Users may switch models when beneficial, but commercial model names are not part of TITAN methodology.

GitHub Copilot reads `.github/copilot-instructions.md`, which points it to `AGENTS.md` and the TITAN state.

---

## Acknowledgements

TITAN was built with a lot of late nights, experiments, and persistence.

A special thank you to AlenM for being there throughout the journey and for the constant support and encouragement.

---

## Status

**TITAN v1.2.0** is the current release.

Version 1.2.0 adds first-class GitHub Copilot repository instructions, provider-neutral TITAN roles, role capability tracking, and optional model switching while preserving Codex compatibility and the existing methodology. See `TITAN_VERSION.md` for current changes and existing-project migration guidance.

The methodology should evolve from real project evidence, not from theoretical complexity.
