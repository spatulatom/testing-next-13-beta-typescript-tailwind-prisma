---
name: local-skill-flags-cheatsheet
description: "Analyze a SKILL.md file and classify its frontmatter flags as open-standard (agentskills.io) or VS Code Copilot-specific. Then offer to rewrite the frontmatter in one of three modes: standard-only, VS Code-only, or combined. Use when: reviewing skill flags, auditing a SKILL.md, choosing which flags to keep, understanding which flags work across agents vs VS Code only."
disable-model-invocation: true
---

# Skill Flags Cheatsheet

## Purpose

Classify frontmatter flags in a `SKILL.md` as either open-standard or VS Code Copilot-specific, then offer to rewrite in the user's preferred mode.

---

## Part 1 — Open Standard Flags (agentskills.io)

Reference: https://agentskills.io/specification

These flags are part of the portable Agent Skills open standard. Every skills-compatible agent (GitHub Copilot, Claude Code, Cursor, Goose, Kiro, OpenCode, etc.) is expected to respect or at least safely ignore them.

| Flag            | Required | Notes                                                                                                                                                                       |
| --------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`          | **Yes**  | Lowercase, hyphens only, max 64 chars. Must match parent directory name exactly. Silent failure if mismatched.                                                              |
| `description`   | **Yes**  | Max 1024 chars. Should describe _what the skill does_ AND _when to use it_. This is the agent's only signal for auto-discovery — write it like a search query, not a title. |
| `license`       | No       | License name or path to bundled license file (e.g. `Apache-2.0`, `LICENSE.txt`).                                                                                            |
| `compatibility` | No       | Max 500 chars. Declare environment requirements or intended agent. E.g. `Requires Python 3.14+` or `Designed for VS Code Copilot`.                                          |
| `metadata`      | No       | Arbitrary key-value map. Intended extension point for agent-specific extras. E.g. `metadata: { author: "me", version: "1.0" }`.                                             |
| `allowed-tools` | No       | Space-separated pre-approved tools. **Experimental** — support varies by agent. E.g. `allowed-tools: Bash(git:*) Read`.                                                     |

### Progressive disclosure (open standard)

The spec defines three loading stages:

1. **Discovery** (~100 tokens): agent reads `name` + `description` only at startup for all skills
2. **Activation**: full `SKILL.md` body loads when the skill is triggered
3. **Execution**: referenced files load on demand only when the body references them

Keep `SKILL.md` body under 500 lines / 5000 tokens. Move detailed content to referenced files.

---

## Part 2 — VS Code Copilot-Specific Flags

Reference: https://code.visualstudio.com/docs/copilot/customization/agent-skills

These flags are **not** in the open standard. VS Code Copilot reads them. Other agents silently ignore them (they are unknown YAML keys and cause no errors).

| Flag                       | Default | Notes                                                                                                                                      |
| -------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `user-invocable`           | `true`  | Controls whether the skill appears as a `/` slash command in chat. Set to `false` to hide from the menu while still allowing auto-loading. |
| `disable-model-invocation` | `false` | Controls whether the model can auto-load the skill based on relevance. Set to `true` to require explicit `/skill-name` invocation only.    |
| `argument-hint`            | —       | Hint text shown in the chat input when the skill is invoked as a slash command. E.g. `[test file] [options]`.                              |

### The four combinations

| `user-invocable` | `disable-model-invocation` | In `/` menu? | Auto-loaded? | Best for                                                 |
| ---------------- | -------------------------- | ------------ | ------------ | -------------------------------------------------------- |
| _(omitted)_      | _(omitted)_                | Yes          | Yes          | General-purpose skills                                   |
| `false`          | _(omitted)_                | **No**       | Yes          | Background/reference skills (e.g. `next-best-practices`) |
| _(omitted)_      | `true`                     | Yes          | **No**       | On-demand workflows you control                          |
| `false`          | `true`                     | No           | No           | Effectively disabled                                     |

### Token / cognitive overhead note

At discovery time the model reads every skill's `name` + `description` to decide relevance. Skills with `disable-model-invocation: true` are excluded from that pass — their descriptions never enter context unless you invoke them. For local workflow skills this is the right default: you know when to reach for them; the model does not need to guess.

---

## Part 3 — Analysis Procedure

When the user asks to analyze a `SKILL.md`:

### Step 1 — Read the file

Read the SKILL.md the user points to (or the currently open file if none is specified).

### Step 2 — Classify each frontmatter field

Produce a table with three columns:

| Field                      | Value | Category                      |
| -------------------------- | ----- | ----------------------------- |
| `name`                     | ...   | Open standard — required      |
| `description`              | ...   | Open standard — required      |
| `user-invocable`           | ...   | VS Code Copilot only          |
| `disable-model-invocation` | ...   | VS Code Copilot only          |
| `argument-hint`            | ...   | VS Code Copilot only          |
| `license`                  | ...   | Open standard — optional      |
| `compatibility`            | ...   | Open standard — optional      |
| `metadata`                 | ...   | Open standard — optional      |
| `allowed-tools`            | ...   | Open standard — experimental  |
| _(any unknown field)_      | ...   | Non-standard / agent-specific |

### Step 3 — Present three rewrite modes

After the table, ask the user which mode they want:

> **Choose a rewrite mode:**
>
> **1. Standard only** — keep `name`, `description`, and any open-standard optional fields. Remove all VS Code-specific flags. Fully portable across all agents.
>
> **2. VS Code only** — keep standard required fields plus add/keep `user-invocable`, `disable-model-invocation`, `argument-hint` as needed. Best for skills used exclusively in VS Code Copilot.
>
> **3. Combined** — keep everything. Standard fields provide portability; VS Code flags add control in Copilot. Other agents silently ignore the VS Code fields. Note: `metadata` is the spec-intended way to add agent-specific extras portably, but top-level VS Code flags work fine in practice.

### Step 4 — Rewrite

Apply the chosen mode and write the updated frontmatter back to the file.

---

## Quick Decision Guide

```
Is this skill used only in VS Code Copilot?
  Yes → use VS Code flags freely (Mode 2 or 3)
  No  → stick to open standard (Mode 1); use `compatibility` to signal intent

Should the model auto-load this skill?
  Yes → omit disable-model-invocation (or set false)
  No  → disable-model-invocation: true

Should it appear in the / slash menu?
  Yes → omit user-invocable (or set true)
  No  → user-invocable: false

Is it a local workflow skill only you invoke?
  → disable-model-invocation: true, keep user-invocable default (true)
```
