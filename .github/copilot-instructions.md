# Next.js Documentation Lookup Instructions

**Next.js 15.1.6** · Docs synced March 4, 2026

> ⚠️ **THIS PROJECT USES APP ROUTER ONLY.** There is no `pages/` directory. All source code lives under `app/`. Always use `01-app/` doc paths. Never use `02-pages/` paths.

## CRITICAL: Use Local .next-docs Files for Maximum Efficiency

**Default to reading local documentation files for Next.js concepts, APIs, and best-practice lookups.**

### Required Workflow for Next.js Questions:

1. **Check the index below** to find the relevant `.mdx` file path
2. **Construct the full local path**: `.next-docs/{path-from-index}`
3. **Use the available file-reading tool to read the documentation.**
4. **Start with a small range** (e.g., lines 1-100) to check headers and structure
5. **Read more lines if needed** based on what you find

### Path Construction Examples:

- For `cacheLife` function → `.next-docs/01-app/03-api-reference/04-functions/cacheLife.mdx`
- For `use cache` directive → `.next-docs/01-app/03-api-reference/01-directives/use-cache.mdx`
- For Cache Components guide → `.next-docs/01-app/01-getting-started/06-cache-components.mdx`
- For v16 upgrade guide → `.next-docs/01-app/02-guides/upgrading/version-16.mdx`

### Why Local Files?

✅ **More efficient** - precise control over how much context to load  
✅ **Progressive loading** - read headers first, dive deeper as needed  
✅ **Predictable size** - know exact token cost before loading  
✅ **No network overhead** - instant access

### When to Use Next.js DevTools MCP Tools:

⚠️ Use Next.js DevTools MCP tools when the answer depends on the running application, for example:

- Debugging a RUNNING Next.js dev server
- Getting real-time errors, routes, or build diagnostics
- The user explicitly asks to check the running application
- Inspecting page metadata, server actions, logs, or other live runtime state
- Runntime-aware diagnostics that require context beyond static documentation when live app context matters

✅ For implementation tasks that touch a running app, prefer a runtime-first flow:

- Use local `.next-docs` for API/concept lookup.
- Use Next.js DevTools MCP (`nextjs_index` / `nextjs_call`) to verify routes, errors, and live behavior before and after changes.

**Do not default to Next.js DevTools MCP tools for static documentation lookups unless explicitly asked or needed for runtime verification.**

### Plans

- In `[[PLAN]]` mode, end each plan response with a list of unresolved questions. Keep questions extremely concise; grammar can be minimal.

### Autopilot Mode (Copilot CLI only)

- When in `[[AUTOPILOT]]` mode, assume 6 iterations: apply `--max-autopilot-continues 6` as a safety cap.

### Permission Gate (Git + GitHub)

- Default to **read-only** repo operations for Git/GitHub.
- Do **not** run `git commit`, `git push`, create/switch branches, open/update PRs, create/edit/close issues, or tick issue checkboxes unless explicitly asked by the user to do so.
- For GitHub work, remember that both **GitHub MCP** and **GitHub CLI (`gh`)** may be available:
  - Prefer **GitHub MCP** for read/search/list/fetch workflows.
  - Prefer **`gh` CLI** for authenticated write operations when explicitly asked by the user (for example: creating issues, editing issues, opening PRs), especially if MCP is read-only in the current session.
  - Before write operations with `gh`, check authentication with `gh auth status`.

### GitHub Issues

- Write issues as: overarching description + numbered `Progress Checklist`.
- Overarching description must be 1-3 sentences explaining problem, goal, and why it matters.
- Keep the top-level checklist short: default to 3-5 items and do not exceed 5 unless the user explicitly asks for it.
- Top-level checklist items should usually be large enough to map to a meaningful deliverable or commit when practical so then the whole Github Issue could be mapped to 3-5 commits.
- Prefer grouping related work into a single meaningful milestone with subpoints instead of creating long flat lists.
- Use plain-text status markers only: `☐` pending, `✅` done (do not use GitHub task checkboxes).
- Add a short subpoint or subpoints (`- ...`) when useful for context; use them to capture scope, constraints, or smaller tasks.
- Subpoints are notes only (never ticked).
- Do not nest deeper than one subpoint level.
- When a plan would need more than 5 top-level items, either regroup it into broader milestones or split it into multiple issues.
- **Important:** Only change status markers when explicitly asked by the user.

Example:

## Progress Checklist

✅ = Completed, ☐ = Pending

1. ✅ Implement login validation
   - Add server-side validation for missing/invalid credentials.
2. ☐ Reproduce mobile login bug
   - Bug occurs when password field is empty on mobile Safari.
   - Added test case to confirm fix.
3. ☐ Add regression test
   - Cover invalid token and empty password cases.

### Git Branching

- When creating branches, prefix them with `tom/` to indicate they came from me.

---

> ⚠️ **APP ROUTER ONLY** — No `pages/` directory exists. All code is under `app/`. Only use `01-app/` doc paths. Never use `02-pages/` paths.

<!-- NEXT-AGENTS-MD-START --><!-- NEXT-AGENTS-MD-END -->
