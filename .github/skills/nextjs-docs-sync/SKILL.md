---
name: nextjs-docs-sync
description: Use when the user upgraded, updated, or bumped their Next.js version, or ran npm update/install for next. Syncs local .next-docs documentation and the copilot-instructions.md docs index to match the newly installed Next.js version.
license: MIT
metadata:
  author: project
  version: '1.1'
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
   npx @next/codemod@canary agents-md --output .github/copilot-instructions.md
   ```

   **CRITICAL:** Use `@next/codemod@canary` (not the stable version). The `agents-md` transform is only available in the canary release as of February 2026.

   This command:
   - Detects the installed Next.js version automatically
   - Downloads version-matched docs to `.next-docs/` directory
   - Updates/injects the compressed 8KB docs index into `copilot-instructions.md`

   Expected output: `✓ Updated .github/copilot-instructions.md (X KB → Y KB)`

5. **Update version header:**

   **IMPORTANT:** The codemod updates the compressed docs index but doesn't modify the custom version header at the top of the file. You must update it manually.

   Read the current header (lines 1-5) of `.github/copilot-instructions.md` and update ONLY the version number and date on line 3.

   Use `replace_string_in_file` with precise context:

   ```
   # Next.js Documentation Lookup Instructions

   **Next.js [OLD_VERSION]** · Docs synced [OLD_DATE]

   ## CRITICAL: Use Local .next-docs Files for Maximum Efficiency
   ```

   Replace with:

   ```
   # Next.js Documentation Lookup Instructions

   **Next.js [NEW_VERSION]** · Docs synced [CURRENT_DATE]

   ## CRITICAL: Use Local .next-docs Files for Maximum Efficiency
   ```

   Where:
   - `[NEW_VERSION]` = installed Next.js version from step 1 (e.g., "16.1.6")
   - `[CURRENT_DATE]` = today's date in format "Month DD, YYYY" (e.g., "February 10, 2026")

   ⚠️ **Do NOT modify any other content.** Only update line 3.

## Troubleshooting

**Error: "Invalid transform choice"**

- You're using `@next/codemod` instead of `@next/codemod@canary`
- The `agents-md` transform is only in the canary version
- Fix: Add `@canary` to the command

**Command hangs or prompts for input:**

- The command might be waiting for user input (version confirmation or file selection)
- The `--output` flag should prevent prompts, but if it happens:
  - Provide the version when prompted (should auto-detect)
  - Choose "Custom..." and enter `.github/copilot-instructions.md`

**Version header not updated after codemod:**

- This is expected behavior
- The codemod only updates the compressed docs index (between `<!-- NEXT-AGENTS-MD-START -->` and `<!-- NEXT-AGENTS-MD-END -->` markers)
- You must manually update line 3 with the version and date as described in step 5
