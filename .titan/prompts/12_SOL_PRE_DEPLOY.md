# Prompt — SOL Pre-Deploy

Use with role: `SOL_DEPLOY`

```text
The project/module is ready for production deployment.

Inspect the real current project state and create a safe deployment plan
for the actual production environment.

Check:

- backup;
- DB migrations;
- environment changes;
- secrets/APP_KEY equivalents;
- dependencies;
- package/composer/npm steps;
- build;
- storage;
- permissions;
- symlinks;
- cache;
- queue/cron if relevant;
- web server/runtime requirements;
- possible downtime;
- rollback;
- production smoke tests;
- real integration checks.

Do not assume that local PASS automatically means production PASS.

Write the steps in exact execution order.

Clearly mark every step that may affect existing data or system
availability.
```

Actual production deployment remains behind the USER gate unless explicitly delegated.
