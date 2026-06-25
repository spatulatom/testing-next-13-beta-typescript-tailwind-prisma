---
name: local-nextjs-agents-md-setup
description: 'ONLY use when the user explicitly asks about setting up AGENTS.md or Next.js AI agent docs. This guide exclusively covers three scenarios: new project, existing project on Next.js 16.2+, and existing project on Next.js below 16.2. Also explains what happens in each scenario when Next.js is later updated.'
disable-model-invocation: true
---

# Next.js AGENTS.md Setup Guide

Reference for setting up `AGENTS.md` and bundled docs for AI coding agents across all three project scenarios. Always confirm which scenario applies before advising.

## Table of Contents

1. [Decision tree](#decision-tree)
2. [Scenario 1: New Project](#scenario-1-new-project)
3. [Scenario 2: Existing Project — Next.js 16.2+](#scenario-2-existing-project--nextjs-162)
4. [Scenario 3: Existing Project — Next.js 16.1 or Earlier](#scenario-3-existing-project--nextjs-161-or-earlier)
5. [How to verify bundled docs after updates](#how-to-verify-bundled-docs-after-updates)
   - [What is true](#what-is-true)
   - [What timestamps can and cannot prove](#what-timestamps-can-and-cannot-prove)
   - [Recommended trust model](#recommended-trust-model)
   - [`npm install` vs `npm ci`](#npm-install-vs-npm-ci)
   - [Practical recommendation](#practical-recommendation)
6. [Manual verification of public docs vs GitHub](#manual-verification-of-public-docs-vs-github)
   - [The issue we ran into](#the-issue-we-ran-into)
   - [What actually works](#what-actually-works)
   - [Recommended manual verification flow](#recommended-manual-verification-flow)
7. [Summary Table](#summary-table)
8. [Key Concept](#key-concept)

## Decision tree

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
- `node_modules/next/` is replaced → docs at `node_modules/next/dist/docs/` update automatically and stay version-matched to the installed `next` package
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

- Same as Scenario 1 — updating the `next` package automatically updates the docs and keeps them version-matched to the installed package
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

## How to verify bundled docs after updates

This section addresses a common concern in Scenario 1 and Scenario 2: "How do I know the docs in `node_modules/next/dist/docs/` are really current after a Next.js update?"

### What is true

- In Next.js `16.2+`, the docs under `node_modules/next/dist/docs/` are bundled inside the published `next` package.
- If the installed `next` package version changes, the local bundled docs are refreshed to the docs shipped with that exact package version.
- That does **not** mean the docs text necessarily changed between two versions. A patch or minor release can ship identical docs content.

### What timestamps can and cannot prove

- File timestamps can show that files in `node_modules` were written to disk at some point.
- File timestamps cannot reliably prove that the docs content changed upstream.
- File timestamps also cannot reliably prove that a rewrite happened specifically because of a Next.js upgrade. A reinstall, lockfile change, `npm audit fix`, or deleting `node_modules` can also rewrite the package on disk.

### Recommended trust model

Use these checks in order:

1. **Version check**: confirm the installed `next` version in `node_modules/next/package.json`.
2. **Clean reinstall when unsure**: prefer `npm ci` when you want a fresh, exact reinstall from the lockfile.
3. **Hash comparison when you need proof of content change**: compare file hashes before and after an update.

Important limitation:

- Running shell commands **now** can tell you the **current installed version** and the **current files on disk**.
- Running shell commands **now** cannot tell you exactly **when** the version changed unless you already captured a previous state to compare against.
- In other words, a current version check proves present state, not historical transition.
- If you need to prove that a version changed across an update, record a before/after snapshot such as the version string, hashes, or a lockfile diff.

### `npm install` vs `npm ci`

- Use `npm install` for normal dependency work, upgrades, or when you expect the lockfile to change.
- Use `npm ci` when you want a strict, clean reinstall from `package-lock.json`.
- `npm ci` deletes `node_modules` automatically and installs exactly what is locked.
- `npm install` is more flexible; `npm ci` is better for proving there is no stale local package state.

### Practical recommendation

If the goal is "make sure my local bundled docs are fresh and version-matched," the best sanity check is:

```bash
npm ci
```

Then confirm the installed version:

```powershell
Get-Content node_modules/next/package.json | Select-String '"version"'
```

This confirms what version is installed **right now**. By itself, it does **not** prove when the version changed or whether the change happened in the most recent install unless you compare it to a previously recorded value.

If the goal is "prove the docs content itself changed between two versions," timestamps are not enough. Use before/after hashes instead:

```powershell
Get-ChildItem node_modules/next/dist/docs -Recurse -File |
  Get-FileHash -Algorithm SHA256 |
  Sort-Object Path |
  Format-List Path, Hash
```

This only becomes meaningful when compared across two snapshots.

---

## Manual verification of public docs vs GitHub

This section covers a separate problem from local bundled-doc verification: checking whether a page you see in the GitHub `docs/` tree should exist on `nextjs.org/docs`.

### The issue we ran into

Manual verification can fail in two common ways:

1. A page exists in `vercel/next.js/tree/canary/docs`, but does **not** exist on `nextjs.org/docs`.
2. A commit diff can make a page look public even though the file metadata marks it as unpublished.

What failed:

- Comparing the public site directly against the `canary` branch alone.
- Assuming that if a file exists under `docs/`, it must already be live on the website.
- Looking only at the normal GitHub commit diff, which may hide unchanged frontmatter.

### What actually works

Use these checks in order:

1. **Check the file metadata in GitHub, not just the changed hunk.**
2. **Compare public docs against the correct stable release tag, not against `canary`, unless you explicitly want unreleased docs.**

#### 1. Check frontmatter metadata with rich diff or full file view

When inspecting a docs commit, use **Display the rich diff** or open the full file view. Then inspect the frontmatter at the top of the page.

What to verify:

- Confirm whether the page includes `version: draft`.
- If `version: draft` is present, the page can exist in the repo but still be absent from `nextjs.org/docs`.
- If the normal diff does not show the frontmatter, that does **not** mean the page lacks draft metadata. It may simply mean the commit did not change that line.

Practical rule:

- A docs file being present in GitHub is **not** enough to prove it is public.
- First verify that the file metadata does **not** mark it as draft.

#### 2. Pick the correct GitHub reference before comparing with the website

The main docs branch you will usually browse is `canary`, but that is the moving development branch, not the stable public snapshot.

For public-site comparison:

- Use `canary` only when you want to inspect unreleased docs work.
- Use the latest stable **tag** when you want to compare against the actual live docs website.

How to do it:

1. Check the live docs version on `nextjs.org/docs` or `https://nextjs.org/docs/llms.txt`.
2. Take that version number, for example `16.2.9`.
3. Open the matching GitHub tag, for example:
   - `https://github.com/vercel/next.js/tree/v16.2.9/docs`

Important clarification:

- There is not a separate always-obvious "stable docs branch" you should rely on for this workflow.
- The reliable stable snapshot is the release **tag** such as `v16.2.9`.
- So when comparing the website to GitHub, the correct question is usually not "which stable branch?" but "which stable tag matches the live docs version?"

### Recommended manual verification flow

When a page appears in GitHub but not on the public website:

1. Open the full file or rich diff and inspect frontmatter.
2. Check whether `version: draft` is present.
3. Confirm the live docs version from `nextjs.org/docs` or `/docs/llms.txt`.
4. Compare against the matching release tag, not `canary`.
5. Only after those checks conclude that the page is missing, renamed, unpublished, or unreleased.

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
