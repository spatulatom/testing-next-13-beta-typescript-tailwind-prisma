---
name: local-nextjs-agents-md-setup
description: "ONLY use when the user explicitly asks about setting up AGENTS.md or Next.js AI agent docs. This guide exclusively covers three scenarios: new project, existing project on Next.js 16.2+, and existing project on Next.js below 16.2. Also explains what happens in each scenario when Next.js is later updated."
disable-model-invocation: true
---

# Next.js AGENTS.md Setup Guide

Reference for setting up `AGENTS.md` and bundled docs for AI coding agents across all three project scenarios. Always confirm which scenario applies before advising.

**Decision tree — identify the scenario first:**

1. Is this a **new project**? → Use **Scenario 1**.
2. Is this an **existing project on Next.js 16.2+**? → Use **Scenario 2**.
3. Is this an **existing project on Next.js 16.1 or earlier**? → Use **Scenario 3**.

**Official resources:**

- [Next.js AI Coding Agents guide](https://nextjs.org/docs/app/guides/ai-agents)
- [Next.js 16.2 blog post: AI-ready project setup](https://nextjs.org/blog/next-16-2-ai#ai-ready-project-setup)

---

## Scenario 1: New Project

**Command:**

```bash
npx create-next-app@canary
```

`create-next-app` generates both `AGENTS.md` and `CLAUDE.md` automatically. No extra steps needed.

To skip generating agent files:

```bash
npx create-next-app@canary --no-agents-md
```

**Where docs live:** `node_modules/next/dist/docs/`

**On future Next.js updates:**

- Run `npm install next@latest` (or equivalent)
- `node_modules/next/` is replaced → docs at `node_modules/next/dist/docs/` update automatically
- `AGENTS.md` never needs to change — it points to the path, not specific content

---

## Scenario 2: Existing Project — Next.js 16.2+

**Steps:**
Add these two files to the project root manually:

`AGENTS.md`:

```md
<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`.
Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->
```

`CLAUDE.md` (for Claude Code users — avoids duplicating content):

```md
@AGENTS.md
```

**Where docs live:** `node_modules/next/dist/docs/`

**On future Next.js updates:**

- Same as Scenario 1 — updating the `next` package automatically updates the docs
- `AGENTS.md` does not need to be touched
- The `<!-- BEGIN:nextjs-agent-rules --> ... <!-- END:nextjs-agent-rules -->` markers allow Next.js to update the managed section automatically in future tooling, without touching anything written outside those markers

---

## Scenario 3: Existing Project — Next.js 16.1 or Earlier

**Steps:**
Run the official codemod:

```bash
npx @next/codemod@latest agents-md
```

This does two things:

1. Copies the bundled docs to `.next-docs/` at the project root (a snapshot)
2. Generates `AGENTS.md` and `CLAUDE.md` pointing to `.next-docs/` instead of `node_modules/`

**Where docs live:** `.next-docs/` (project root — committed to the repo)

**On future Next.js updates:**

- **Docs do NOT auto-update** — `.next-docs/` is a static snapshot, not a live path inside `node_modules/`
- After each Next.js upgrade, re-run the codemod to refresh the snapshot:
  ```bash
  npx @next/codemod@latest agents-md
  ```
- If you upgrade to 16.2+, consider switching to Scenario 2: delete `.next-docs/`, update `AGENTS.md` to point to `node_modules/next/dist/docs/`, and enjoy automatic updates going forward

---

## Summary Table

| Scenario                  | Docs location                  | Auto-updates on `npm install next@latest`? | Action needed on update                     |
| ------------------------- | ------------------------------ | ------------------------------------------ | ------------------------------------------- |
| New project (any version) | `node_modules/next/dist/docs/` | Yes                                        | None                                        |
| Existing — 16.2+          | `node_modules/next/dist/docs/` | Yes                                        | None                                        |
| Existing — 16.1 and below | `.next-docs/` (project root)   | **No**                                     | Re-run `npx @next/codemod@latest agents-md` |

---

## Key Concept

`AGENTS.md` is just a pointer — its value is that it redirects AI agents away from stale training data toward version-matched docs. The docs themselves live wherever the scenario puts them. The path never changes per scenario, so `AGENTS.md` written once stays correct indefinitely (for 16.2+ projects).
