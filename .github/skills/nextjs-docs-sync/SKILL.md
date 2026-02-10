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

5. **Update version header (only if codemod succeeded OR user gave permission):**

   **CRITICAL: Use `replace_string_in_file` with precise context to update ONLY the version and date.**

   Read line 3 of `.github/copilot-instructions.md` to get the current header line.

   Replace the old string (including surrounding context for safety):

   ```
   # Next.js Documentation Lookup Instructions

   **Next.js X.Y.Z** · Docs synced Month DD, YYYY

   ## CRITICAL: Use Local .next-docs Files for Maximum Efficiency
   ```

   With the new string (update ONLY version and date, keep everything else identical):

   ```
   # Next.js Documentation Lookup Instructions

   **Next.js [NEW_VERSION]** · Docs synced [CURRENT_DATE]

   ## CRITICAL: Use Local .next-docs Files for Maximum Efficiency
   ```

   Where:
   - `[NEW_VERSION]` = installed Next.js version from step 1
   - `[CURRENT_DATE]` = today's date in format: "Month DD, YYYY" (e.g., "February 10, 2026")

   ⚠️ **WARNING:** Do NOT modify any other content in the file. Only update the version number and date in line 3.

6. **If codemod command fails:**

   **STOP. Do NOT automatically update the header.**

   Instead, ask the user:

   > "The `agents-md` codemod is not available. Since you upgraded from version X.Y.Z to [NEW_VERSION], would you like me to manually update just the version header in `.github/copilot-instructions.md`?
   >
   > For patch updates (X.Y.Z → X.Y.W), the documentation is typically compatible. For minor/major updates, the documentation index may be outdated."

   **Only proceed with the header update from step 5 if the user explicitly confirms.**

   Never update the header without user permission.
