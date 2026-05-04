---
name: local-skill-manual-update
description: "Print the npx reinstall command for every remote skill so the user can run them one by one in the terminal. Use when: updating skills, refreshing remote skills, reinstalling skills manually, checking what skills are installed."
disable-model-invocation: true
---

# Local Skill Manual Update

## Procedure

1. Read `skills-lock.json` from the workspace root.
2. For each entry in `skills.`, skip any whose key starts with `local-`.
3. For each remaining entry, build the command:
   - If the entry has a `skillPath` field → `npx skills add <source> --skill <key>`
   - If it does not → `npx skills add <source>`
4. Output each command in its own fenced `sh` code block (see format below). Do **not** run the commands — just print them. VS Code renders a "Run in Terminal" button on every `sh` block, so the user can click instead of copy-pasting.

## Output Format

Use this exact structure — one heading + one `sh` block per command:

```
Remote skills — click ▶ Run in Terminal beside each block (one at a time):

**1. next-best-practices**
\`\`\`sh
npx skills add <source> --skill <key>
\`\`\`

**2. next-browser**
\`\`\`sh
npx skills add <source> --skill <key>
\`\`\`
```

After the list, add this reminder:

> Each command shows 3 prompts. Press Enter three times (agent selector → installation scope → proceed). Do not select any extra agents. Review diffs in the Source Control panel when done.
