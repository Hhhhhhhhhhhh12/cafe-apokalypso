# Workflow

## Agent Roles

### ChatGPT

Used for concept development, task decomposition, prompt writing, review, and documentation updates.

### Claude Code

Used for:
- creating and maintaining repository structure
- turning design decisions into documentation
- architecture planning
- large refactoring passes
- reviewing consistency across docs and source files

Claude Code should not invent new core design directions unless explicitly asked.

### Codex

Used for:
- implementing focused issues
- writing and updating tests
- fixing bugs
- creating UI components
- improving TypeScript types
- performing small-to-medium refactors

Codex should work issue by issue and keep changes reviewable.

## GitHub

GitHub is the control layer.

Use Issues for concrete tasks.
Use Projects for planning and status.
Use Pull Requests or commit groups for reviewable changes.
Use GitHub Actions as soon as code exists.

## Rule

Do not add a third coding AI agent during early MVP development. Prefer clearer issues, better acceptance criteria, and automated checks over more agents.