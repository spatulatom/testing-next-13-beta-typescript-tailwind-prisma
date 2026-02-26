# Prisma Guide (Next.js 16 + Turbopack + Vercel)

Last updated: February 26, 2026

## Table of contents

- [Why this guide exists](#why-this-guide-exists)
- [TL;DR](#tldr)
- [The mental model: build-time vs runtime](#the-mental-model-build-time-vs-runtime)
- [Why Prisma is special](#why-prisma-is-special)
- [Webpack vs Turbopack (practical difference for Prisma)](#webpack-vs-turbopack-practical-difference-for-prisma)
- [Project standards in this repo](#project-standards-in-this-repo)
- [Vercel deployment lifecycle with Prisma](#vercel-deployment-lifecycle-with-prisma)
- [Real-world issue triage (what failed?)](#real-world-issue-triage-what-failed)
- [Version policy for this repo](#version-policy-for-this-repo)
- [Commands we use](#commands-we-use)
- [Quick checklist before opening a bug](#quick-checklist-before-opening-a-bug)
- [Repository references](#repository-references)

## Why this guide exists

Prisma can look like a normal npm package, but it is not just plain JavaScript at runtime. It combines generated client code, dynamic loading, and platform-specific artifacts. That is the core reason bundler behavior matters.

This guide explains exactly:

- What happens with Webpack vs Turbopack
- What happens locally vs on Vercel
- Which issues are real Prisma/bundling issues vs unrelated warnings
- What config and coding patterns we standardize on in this repo

---

## TL;DR

- Prisma should run on the Node.js server runtime, not in client bundles.
- Bundling server code is fine, but Prisma packages often need to stay externalized.
- In Next.js 16, Prisma packages are already on Next’s auto externalization list, but we keep explicit config for clarity.
- Vercel does not bundle at request time. Bundling happens during build.
- Runtime warnings from `pg` SSL modes are database connection-string issues, not Turbopack bundling failures.

---

## The mental model: build-time vs runtime

### Build-time (local `next build` or Vercel build)

Next compiles server and client code into deployable output. This is where Webpack or Turbopack does module analysis and bundling decisions.

### Runtime (local `next dev` requests, or Vercel serverless/node function execution)

The built server output is executed. If a dependency was externalized, Node resolves it from `node_modules` at runtime.

Important: Vercel is not re-bundling Prisma on each request. Any bundling decision already happened during build.

---

## Why Prisma is special

Prisma usage in app code often looks like normal imports, but runtime behavior is different:

- Prisma Client is generated from `prisma/schema.prisma`
- The runtime may rely on dynamic resolution and non-trivial package internals
- Adapter + database driver behavior introduces runtime-only concerns

Because of this, treating Prisma exactly like a pure ESM utility package can break in certain bundling paths.

---

## Webpack vs Turbopack (practical difference for Prisma)

### Webpack (historically)

- More mature compatibility surface for older server-bundling patterns
- Some projects “just worked” without explicit config
- Less obvious when a package should have been explicitly externalized

### Turbopack (current default in Next 16)

- Faster and stricter module graph handling
- More likely to surface boundary issues early (server/client/runtime assumptions)
- Better to be explicit about external packages and server-only imports

### What this means for us

Turbopack is not “wrong” with Prisma. It is exposing constraints that were easier to miss before. Our approach is to make server boundaries and externalization explicit.

---

## Project standards in this repo

### 1) Keep Prisma externalized for server execution clarity

In `next.config.js` we keep:

- `serverExternalPackages: ['@prisma/client', 'prisma']`

Notes:

- In Next.js 16, these packages are already in Next’s auto opt-out list.
- We still keep explicit config because it documents intent and avoids ambiguity during upgrades.

### 2) Keep Prisma usage server-only

Allowed:

- Route Handlers
- Server Components
- Server Actions
- Shared server utilities

Avoid:

- Client Components
- Browser-only modules

### 3) Use type-only Prisma imports in shared/component files

If only types are needed, use `import type` so no runtime Prisma dependency can accidentally leak into bundles.

### 4) Ensure client generation in all environments

`package.json` keeps:

- `postinstall: prisma generate`

This protects local fresh installs, CI, and Vercel builds.

---

## Vercel deployment lifecycle with Prisma

1. Install dependencies (`npm install`)
2. Run `postinstall` -> `prisma generate`
3. Build app (`next build`) with Turbopack/Next build pipeline
4. Deploy built output
5. Handle requests in Node runtime

If Prisma is externalized, server runtime loads it via Node resolution from installed dependencies.

---

## Real-world issue triage (what failed?)

Use this matrix before assuming “Turbopack Prisma bug”.

### A) Runtime warning mentions SSL mode semantics (`pg`)

Likely cause:

- Connection string parameter choice, not bundling

Fix:

- Use `sslmode=verify-full` (or explicitly opt into libpq-compatible behavior if intended)

### B) Error: Prisma module not found / generated artifacts missing

Likely cause:

- `prisma generate` not run in environment
- Version mismatch among `prisma`, `@prisma/client`, `@prisma/adapter-pg`

Fix:

- Sync versions
- Run clean generate
- Ensure `postinstall` hook exists

### C) Error appears only when file becomes client-side

Likely cause:

- Prisma runtime import leaked into client graph

Fix:

- Move runtime Prisma code to server-only module
- Keep client/shared files on type-only imports

### D) Edge runtime route tries to use Node-only Prisma path

Likely cause:

- Runtime mismatch (Edge vs Node expectations)

Fix:

- Use Node runtime for Prisma-backed handlers/components, or use a supported edge strategy

---

## Version policy for this repo

Keep these synchronized:

- `prisma`
- `@prisma/client`
- `@prisma/adapter-pg`

Mismatch symptoms can include missing generated files, runtime import failures, or odd adapter behavior.

---

## Commands we use

### Normal development

- `npm run dev`
- `npx prisma studio`
- `npx prisma migrate dev`

### After schema changes

- `npx prisma migrate dev --name your_change_name`

### Repair generated client issues

- `npx rimraf node_modules/.prisma`
- `npx prisma generate`

### Validate dependency versions

- `npm ls prisma`
- `npm ls @prisma/client`
- `npm ls @prisma/adapter-pg`

---

## Quick checklist before opening a bug

- Are Prisma packages version-synced?
- Did `prisma generate` run in this environment?
- Is Prisma runtime code only in server paths?
- Are Prisma type imports type-only where appropriate?
- Is `serverExternalPackages` set (even if auto-covered by Next)?
- Is the observed message actually a DB/connection warning instead of a bundling error?

---

## Repository references

- Prisma client setup: `prisma/client.ts`
- Prisma schema: `prisma/schema.prisma`
- Next config: `next.config.js`
- Package scripts/deps: `package.json`

This document should be updated whenever:

- Prisma major/minor versions change
- Next.js major versions change
- Runtime target strategy changes (Node vs Edge)
- Deployment platform behavior changes
