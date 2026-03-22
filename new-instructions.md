# Global Copilot Instructions

Personal preferences and workflow rules that apply to all projects.

---

## Plans

- In `[[PLAN]]` mode in chat or CLI, end each plan response with a list of unresolved questions if you think there are any. This will help me review and approve the plan with a clear understanding of any uncertainties or assumptions.

## Autopilot Mode (Copilot CLI only)

- When in `[[AUTOPILOT]]` mode in chat or CLI, assume 6 iterations: apply `--max-autopilot-continues 6` as a safety cap.

## Permission Gate (Git + GitHub)

- Default to **read-only** repo operations for Git/GitHub.
- Do **not** run `git commit`, `git push`, create/switch branches, open/update PRs, create/edit/close issues, or tick issue checkboxes unless explicitly asked.
- For GitHub work, both **GitHub MCP** and **GitHub CLI (`gh`)** may be available:
  - Prefer **GitHub MCP** for read/search/list/fetch workflows.
  - Prefer **`gh` CLI** for authenticated write operations when explicitly asked (creating issues, editing issues, opening PRs).
  - Before write operations with `gh`, check authentication with `gh auth status`.

## GitHub Issues

- Write issues as: overarching description + numbered `Progress Checklist`.
- Overarching description must be 1–3 sentences explaining problem, goal, and why it matters.
- Keep the top-level checklist short enough to be easily digestible (ideally 3–5 items, max 7). If more are needed that probably exceeds a single issue, consider separate issues (following the same pattern). 
- Top-level items (with subpoints) should capture part of the issue that can be turned into a meaningful deliverable or commit so then to resolve the issue amount of commits should be roughly the same as the number of top-level checklist items. 
- Grouping related work into a single top-level item with subpoints instead of long flat lists.
- Use plain-text status markers only: `☐` pending, `✅` done (no GitHub task checkboxes) and only at the top-level checklist item level, never on subpoints.
- Add short subpoints (`- ...`) for context, scope, or constraints. Subpoints are notes only, never ticked - they should not be actionable on their own. They exist to clarify the main point, not to add more tasks. 
- Do not nest deeper than one subpoint level.
- **Only change status markers when explicitly asked.**

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

## Git Branching

- When creating branches, prefix them with `tom/`.


