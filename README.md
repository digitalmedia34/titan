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

## Optional parallel workflow: start a new project

Parallel work is an implementation option, not a shortcut around TITAN. Start every new project with the normal discovery, specification, architecture, and approval gates. Introduce workers only after the scope is understood and SOL has prepared implementation tasks that can be carried out independently.

### 1. Initialize TITAN and start discovery

Create or open the project directory, initialize TITAN as described in [Quick start](#quick-start), and open that directory in Codex, GitHub Copilot, or another supported coding environment. Ask SOL to begin discovery and describe the project in your own words:

```text
Start this project according to TITAN.

Idea:
<what you want to build, who it is for, and the problem it solves>
```

Follow `.titan/STATE.md`. Do not start parallel implementation during discovery. Complete and approve the project specification, architecture, and implementation baseline through the normal TITAN gates first.

### 2. Choose a small, ready set of independent tasks

Ask SOL to inspect the current repository and prepare a just-in-time plan. Only split ready implementation work across workers when tasks can safely proceed at the same time. A useful first run usually has two or three tasks; increase concurrency only when the work and review capacity justify it.

Give every worker a clear contract:

- one unique task ID and a short, concrete outcome;
- a specific `owns` list with no overlap between workers;
- relevant `readOnly` paths and required context;
- locked decisions and conditions that mean “stop and ask”;
- testable acceptance criteria and verification commands;
- `dependsOn` entries only when a task truly needs another task’s output.

Keep shared architecture, product decisions, and `.titan/STATE.md` under coordinator control. A worker should not broaden its assignment or edit another worker’s owned files. If the repository changes enough to invalidate a task contract, stop and have SOL revise the plan before restarting workers.

Save the contracts as a JSON file outside generated worker outputs, for example `parallel-tasks.json`:

```json
[
  {
    "id": "API-01",
    "title": "Implement the account API",
    "instructions": "Implement the approved account endpoints and their focused tests.",
    "owns": ["src/accounts/", "test/accounts/"],
    "readOnly": ["docs/ARCHITECTURE.md", "src/shared/"],
    "requiredContext": ["docs/PROJECT_SPEC.md", "docs/plans/accounts.md"],
    "lockedDecisions": ["Follow the approved API and authentication design"],
    "stopConditions": ["Stop if the current code conflicts with the approved design"],
    "acceptanceCriteria": ["Account API checks pass", "Only owned paths are changed"],
    "verificationCommands": [
      { "name": "account tests", "command": "npm", "args": ["test", "--", "test/accounts"] }
    ],
    "dependsOn": []
  },
  {
    "id": "WEB-01",
    "title": "Implement the account screens",
    "instructions": "Implement the approved account screens using the existing shared components.",
    "owns": ["src/account-pages/", "test/account-pages/"],
    "readOnly": ["src/shared/", "docs/ARCHITECTURE.md"],
    "requiredContext": ["docs/PROJECT_SPEC.md", "docs/plans/accounts.md"],
    "lockedDecisions": ["Use the approved interaction and visual brief"],
    "stopConditions": ["Stop if API behavior or UX intent is unclear"],
    "acceptanceCriteria": ["Screen checks pass", "Only owned paths are changed"],
    "dependsOn": []
  }
]
```

Treat this as a shape example: replace paths, commands, and criteria with ones that exist in your project. If the web work cannot proceed without API decisions or code, add a real dependency or run those tasks sequentially. Do not create artificial dependencies just to order workers.

### 3. Check the repository and worker adapters

Start from a clean, committed base so each worker branch has a known starting point. Review or commit your own changes first. The CLI requires Node.js 22.13 or later; TITAN initialization and the existing serial workflow retain their Node.js 18 support.

Install and authenticate the provider CLIs you plan to use. Check availability before launching a run:

```sh
node bin/titan.js parallel doctor --adapter codex --adapter-module ./src/adapters/index.js
node bin/titan.js parallel doctor --adapter copilot --adapter-module ./src/adapters/index.js
```

Codex and Copilot run under your signed-in user account. Git worktrees isolate project files and branches; they do not isolate credentials, network access, or external side effects. Copilot uses shell access and requires the explicit `--allow-copilot-shell` option. The generic process adapter is unsandboxed and requires `--allow-process-adapter`; only use it for commands you trust.

### 4. Run a bounded group of workers

From the repository root, choose a small concurrency limit and bounded retries. The default example uses Codex; use `--adapter copilot --allow-copilot-shell` for Copilot, or set an `adapter` on individual tasks when mixing providers.

```sh
node bin/titan.js parallel run \
  --tasks ./parallel-tasks.json \
  --adapter codex \
  --adapter-module ./src/adapters/index.js \
  --concurrency 2 \
  --max-attempts 2 \
  --task-timeout-ms 3600000 \
  --base-ref HEAD
```

The coordinator creates a separate Git branch and worktree for each task, schedules dependency-ready work up to the concurrency limit, records progress, and writes per-attempt logs. A dependent worker receives successful prerequisite commits in its worktree. Failed tasks are retried only within the configured bound and from a clean task base. The coordinator does not merge worker branches into the main checkout automatically.

Keep the run ID and task file. Use `parallel status` to inspect progress and `parallel resume` to continue an interrupted run with the same task file and repository. Successful tasks are skipped on resume; incomplete tasks continue within the allowed attempt count. Cancel a run with Ctrl+C when needed; running tasks are cancelled and pending tasks do not start. Inspect logs and retained worktrees before deciding how to continue.

### 5. Review and integrate as the coordinator

Parallel execution produces implementation work, not TITAN acceptance. For every successful worker:

1. Inspect its branch, commits, diff, and log against its contract and owned paths.
2. Run the task’s verification and any relevant security, data-integrity, accessibility, or user-flow checks.
3. Resolve conflicts and integrate reviewed branches in dependency order. Keep integration under human/coordinator control; do not accept a worker’s completion report as a substitute for checking its changes.
4. Run the combined project checks from the integration branch and verify cross-task behavior.
5. Update the active plan with evidence and follow the normal SOL review, approval, and module closure steps.

Keep worker branches and worktrees until their changes have been reviewed and integrated. Use `--cleanup-worktrees` only when clean worker checkouts can be removed safely; branches remain available. A successful parallel run is still only `IMPLEMENTED`, not `ACCEPTED` or deployed.

### Practical tips

- Parallelize file- or component-bounded tasks, not broad goals like “build the backend.”
- Assign different files or directories to each worker. Shared files, schemas, package manifests, and central state are common conflict points.
- Let one coordinator own architecture decisions, task contracts, integration, and updates to shared project state.
- Use verification commands that are deterministic, narrow, and safe to run repeatedly.
- Start with a mock demonstration if you want to learn the worktree lifecycle without launching provider agents: [`examples/parallel-three-workers.js`](examples/parallel-three-workers.js).
- Use the serial TITAN workflow when work is tightly coupled, requirements are still changing, or coordinating and reviewing the workers would cost more than doing the work sequentially.

For the full worker contract and coordinator rules, see [`docs/PARALLEL_WORK.md`](docs/PARALLEL_WORK.md). For all task fields, commands, resume behavior, adapters, logs, and worktree details, see [`docs/PARALLEL_CLI.md`](docs/PARALLEL_CLI.md).
