---
name: nextjs-docs-sync
description: Use when the user upgraded, updated, or bumped their Next.js version, or ran npm update/install for next. Syncs local .next-docs documentation and the copilot-instructions.md docs index to match the newly installed Next.js version.
license: MIT
metadata:
  author: project
  version: '1.0'
  reference: https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
---

# Next.js Documentation Sync

Resync local `.next-docs/` files and the copilot-instructions.md docs index after a Next.js version upgrade.

> **Why a skill?** The agents-md docs index in copilot-instructions.md gives the agent version-matched Next.js documentation on every turn (see [reference](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals)). This skill ensures that index stays current after upgrades — a rare event that doesn't justify always-on instruction weight.

## When This Applies

- User says they upgraded, updated, or bumped Next.js
- User ran `npm update`, `npm install next@latest`, or similar
- Installed `next` version (in `package.json` or via `npm list next`) differs from the version in `.github/copilot-instructions.md` header

## Procedure

1. **Check installed version:**

   ```bash
   npm list next
   ```

2. **Check documented version:**
   Read line 3 of `.github/copilot-instructions.md` — it contains the version string, e.g. `**Next.js 16.1.6**`.

3. **Compare:** If versions match, no action needed. If they differ, continue.

4. **Run the sync command:**

   ```bash
   npx @next/codemod agents-md --output .github/copilot-instructions.md
   ```

   This downloads version-matched docs to `.next-docs/` and updates the compressed index in `copilot-instructions.md`.

5. **Verify:** Confirm the version in the `copilot-instructions.md` header now matches the installed version. If the codemod didn't update the header line, update it manually to match.
