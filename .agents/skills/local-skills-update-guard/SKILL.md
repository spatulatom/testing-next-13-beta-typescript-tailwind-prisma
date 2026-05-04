---
name: local-skills-update-guard
description: Run the correct npx skills add commands to reinstall every remote (non-local) skill one by one from its upstream source. Use when the user wants to refresh all remote skills so VS Code diffs reveal what changed upstream.
disable-model-invocation: true
---

# Skills Update Guard

## Purpose

Reinstall every remote skill one by one so that VS Code's source control diff view shows exactly what changed upstream. There is no `npm outdated`-equivalent for skills — the diff view is the only review tool, and that is intentional. The human reviewer decides what to keep or revert after inspecting the diffs.

## Key Definitions

**Local skills** — directories under `.agents/skills` whose name starts with `local-`. Maintained manually in this repo. Never touch these with `npx skills`.

**Remote skills** — all other skill directories. Installed from GitHub and can be reinstalled from source.

## Hard Rules

- Never run any `npx skills` command on a `local-` skill.
- Never run a bare `npx skills update` with no skill name — it reinstalls all tracked skills in one shot and skips the one-by-one workflow.
- Always use `--skill <name>` when the source is a collection repo (multiple skills in one GitHub repo).
- **Never use `-y`** — it auto-accepts all defaults and will create an unwanted `.claude/` folder.
- Do not attempt to programmatically diff remote vs local content before running the commands. Just reinstall and let VS Code show the diffs.

## Prompt Sequence (3 Enters per skill)

Every `npx skills add` install shows exactly 3 prompts in this fixed order:

1. **Agent selector** — the Additional agents list appears. **Do not press Space on anything.** Claude Code is unselected by default and must stay that way. Press Enter immediately to confirm Universal targets only.
2. **Installation scope** — "Project" is already selected. Press Enter.
3. **Proceed with installation?** — "Yes" is already selected. Press Enter.

That's 3 Enters × 6 skills = 18 Enters total for a full refresh. If a `.claude/` folder appears accidentally, remove it: `Remove-Item .claude -Recurse -Force`.

## Process

### Step 1: Read skills-lock.json

Read `skills-lock.json`. For each entry collect:

- key = skill name
- `source` = GitHub repo slug (e.g. `vercel-labs/next-skills`)
- `skillPath` = path within that repo to SKILL.md (present for collection repos)

### Step 2: Reinstall every remote skill one by one

Run one command per skill. Use `--skill <name>` when the source is a collection repo (i.e. `skillPath` is set or the repo name does not match the skill name).

**Current skills in this repo — commands to run:**

```bash
# vercel-labs/next-skills  (collection repo — use --skill)
npx skills add vercel-labs/next-skills --skill next-best-practices
npx skills add vercel-labs/next-skills --skill next-cache-components
npx skills add vercel-labs/next-skills --skill next-upgrade

# vercel-labs/next-browser  (single-skill repo — no --skill flag)
npx skills add vercel-labs/next-browser

# vercel-labs/agent-skills  (collection repo — use --skill)
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add vercel-labs/agent-skills --skill vercel-react-view-transitions
```

Run these commands sequentially. For each one follow the 3-prompt sequence described above (see "Prompt Sequence"). The Universal `.agents/skills` row is always included automatically — never select anything extra.

### Step 3: Human reviews diffs in VS Code

After all commands complete, open the Source Control panel in VS Code. Any files that changed will appear as modified. Review each diff to decide whether the upstream change is desirable. Revert individual files if needed.

### Step 4: Adding a new remote skill in the future

When adding a skill from a collection repo, always name it explicitly:

```bash
npx skills add owner/repo --skill <skill-name>
```

For a single-skill repo:

```bash
npx skills add owner/repo
```

## Quick Reference

| Goal                                         | Command                                    |
| -------------------------------------------- | ------------------------------------------ |
| Reinstall one skill from a collection repo   | `npx skills add owner/repo --skill <name>` |
| Reinstall one skill from a single-skill repo | `npx skills add owner/repo`                |
| Remove an accidentally added skill           | `npx skills remove <name> -y`              |
| See what is currently installed              | `npx skills list`                          |
| Remove accidental `.claude/` folder          | `Remove-Item .claude -Recurse -Force`      |
