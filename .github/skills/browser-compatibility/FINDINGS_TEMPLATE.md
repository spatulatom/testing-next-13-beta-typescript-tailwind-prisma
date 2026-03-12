# Browser Compatibility Findings

<!--
  LLM AGENTS: DO NOT MODIFY THIS STRUCTURE
  - Keep all headings, tables, and section order exactly as shown
  - Only replace placeholder text (e.g., <PROJECT_NAME>, ✅ / ❌) with actual values
  - Consistent structure enables comparison across projects
-->

**Project:** `<PROJECT_NAME>`  
**Date:** `<DATE>`  
**Target Browsers:** `<TARGET_BROWSERS or "baseline widely available">`

---

## Table of Contents

- [Phase 1: Measurement Results](#phase-1-measurement-results)
  - [Pre-existing Browser Config](#pre-existing-browser-config)
  - [Resolution](#resolution)
  - [Build Output Paths](#build-output-paths)
  - [1.1 CSS Features](#11-css-features)
  - [1.2 JS Syntax](#12-js-syntax)
  - [1.3 JS APIs](#13-js-apis)
- [Phase 2: Decision](#phase-2-decision)
  - [2.1 CSS Features — Gap Analysis](#21-css-features--gap-analysis)
  - [2.2 JS Syntax — Gap Analysis](#22-js-syntax--gap-analysis)
  - [2.3 JS APIs — Gap Analysis](#23-js-apis--gap-analysis)
  - [Decision Checkpoint](#decision-checkpoint)
- [Phase 3: Enforcement](#phase-3-enforcement-if-implemented)
  - [3A: Development Tools](#3a-development-tools-configured)
  - [3B: Repeatable npm Scripts](#3b-repeatable-npm-scripts-added)
- [Summary](#summary-optional)

---

## Phase 1: Measurement Results

### Pre-existing Browser Config

> Document what existed **before** running this skill (not what was created during analysis).

| Source (in priority order)   | Found? | Value (if found) |
| ---------------------------- | ------ | ---------------- |
| User-specified in prompt?    | ❌ No  | —                |
| `.browserslistrc` existed?   | ❌ No  | —                |
| `package.json#browserslist`? | ❌ No  | —                |

### Resolution

| Decision                       | Value                                      |
| ------------------------------ | ------------------------------------------ |
| **Source used**                | (Prompt / `.browserslistrc` / Default)     |
| **Resolved targets**           | (e.g., chrome 115+, safari 16.4+, ...)     |
| **Explicit browser string**    | (output of `npx browserslist`)             |
| **Created `.browserslistrc`?** | ✅ Yes / ❌ No (if created, note it's new) |

### Build Output Paths

> **Reference paths (not filled in — delete rows that don't apply):**
>
> | Stack   | JS Path                       | CSS Path                    |
> | ------- | ----------------------------- | --------------------------- |
> | Next.js | `.next/static/chunks/**/*.js` | `.next/static/css/**/*.css` |
> | Vite    | `dist/assets/**/*.js`         | `dist/assets/**/*.css`      |

| Stack    | JS Path            | CSS Path            |
| -------- | ------------------ | ------------------- |
| **Used** | `<ACTUAL_JS_PATH>` | `<ACTUAL_CSS_PATH>` |

---

### 1.1 CSS Features

**Tool:** doiuse (or stylelint if doiuse fails — see note below)  
**Command:** `npx doiuse --browsers "<EXPLICIT_BROWSERS>" "<CSS_PATH>"`  
**Passes target?** ✅ Pass / ⚠️ Warnings / ❌ Fail / ⚠️ Inconclusive (tool error)

> ⚠️ **Tailwind v4 note:** `doiuse` crashes on Tailwind v4 build output regardless of browser targets. The failure is a **parse error**, not a compatibility result — doiuse's bundled PostCSS is too old to parse Tailwind v4's `@layer properties { @supports (...) { } }` syntax. Changing `--browsers` does not help. If the project uses Tailwind v4, expect a `CssSyntaxError: Unclosed block` at line 1. In that case:
>
> - Mark result as ⚠️ Inconclusive
> - Document Tailwind v4's known hardcoded floors in Phase 2.1 instead
> - Use `stylelint` + `stylelint-no-unsupported-browser-features` for ongoing CSS checks (Phase 3A)

```
<paste doiuse output here, or document the parse error>
```

---

### 1.2 JS Syntax

**Tool:** es-check  
**Command:** `npx es-check es20XX "<JS_PATH>"`  
**Baseline ES target:** ES20XX (calculated: current year − 2.5, e.g. 2026 → ES2023)  
**Passes target?** ✅ Pass / ❌ Fail

> **Note:** This check is primarily a **dependency regression gate**, not a check on your own code. The build tool (SWC/esbuild) transpiles your source correctly, but `node_modules/` packages are bundled as-is. A dependency shipping pre-compiled ES2022+ syntax will silently raise the floor after `npm update`. No dev-time equivalent exists — `es-check` requires compiled `.js` files, so it belongs in 3B/CI only.

#### Floor Discovery

> Test from baseline downward to find the oldest level that still passes. The first failing level reveals what syntax the build uses.

| ES Level          | Result  | Min Browsers (approx)               | Notes                       |
| ----------------- | ------- | ----------------------------------- | --------------------------- |
| ES20XX (baseline) | ✅ / ❌ | Chrome XX+, Firefox XX+, Safari XX+ | Required baseline           |
| ES20XX            | ✅ / ❌ | Chrome XX+, Firefox XX+, Safari XX+ |                             |
| ES20XX            | ✅ / ❌ | Chrome XX+, Firefox XX+, Safari XX+ |                             |
| ES20XX            | ✅ / ❌ | —                                   | First failing level (floor) |

**Actual support floor:** ES20XX — oldest level that passes (set by `<syntax feature, e.g. private class fields #>`)  
**Backward compatibility headroom:** X ES levels / ~X years beyond baseline

```
<paste es-check failure output here if needed>
```

---

### 1.3 JS APIs

**Tool:** eslint-plugin-compat  
**Command:** `npx eslint --config eslint.compat-check.mjs "<JS_PATH>"` (temp config file; reads `.browserslistrc` for targets)  
**Passes target?** ✅ Pass / ⚠️ Warnings / ❌ Fail

```
<paste eslint output here>
```

---

## Phase 2: Decision

### 2.1 CSS Features — Gap Analysis

**Stack hardcoded constraints (CSS dimension):**

| Tool/Dependency     | Hardcoded Floor                         | Overrides `.browserslistrc`? | Impact                               |
| ------------------- | --------------------------------------- | ---------------------------- | ------------------------------------ |
| (e.g., Tailwind v4) | Safari 16.4+, Chrome 111+, Firefox 128+ | ✅ Yes                       | CSS won't work in older browsers     |
| (e.g., PostCSS)     | Follows `.browserslistrc`               | ❌ No                        | Adds vendor prefixes per your target |

**Gaps vs. target:**

| Issue                     | Minimum Browser | Your Target | Action                                     |
| ------------------------- | --------------- | ----------- | ------------------------------------------ |
| (e.g., Container Queries) | Chrome 105+     | Chrome 90+  | Remove feature / add fallback / accept gap |
| (none found)              | —               | —           | —                                          |

---

### 2.2 JS Syntax — Gap Analysis

**Stack hardcoded constraints (JS syntax dimension):**

| Tool/Dependency        | Target / Floor                   | Overrides `.browserslistrc`? | Impact                             |
| ---------------------- | -------------------------------- | ---------------------------- | ---------------------------------- |
| Next.js / SWC          | Reads `.browserslistrc`          | ❌ No                        | Transpiles to your declared target |
| (e.g., Vite / esbuild) | `build.target` in vite.config.js | ✅ Yes                       | browserslist ignored for JS syntax |

**Gaps vs. target:**

| Issue                        | Actual Floor | Your Target         | Action                          |
| ---------------------------- | ------------ | ------------------- | ------------------------------- |
| (e.g., private class fields) | ES2022       | ES2020 (Chrome 80+) | Accept — dependency uses ES2022 |
| (none found)                 | —            | —                   | —                               |

---

### 2.3 JS APIs — Gap Analysis

**Stack hardcoded constraints (JS API dimension):**

> JS APIs are never transpiled. Your effective API floor equals the oldest browser where all used APIs are natively available, or where you ship polyfills.

| Polyfill / Alternative | Covers          | Shipped? |
| ---------------------- | --------------- | -------- |
| `core-js`              | Various ES APIs | ✅ / ❌  |
| (none)                 | —               | —        |

**Gaps vs. target:**

| Issue                       | Minimum Browser | Your Target | Action                         |
| --------------------------- | --------------- | ----------- | ------------------------------ |
| (e.g., `structuredClone()`) | Safari 15.4+    | Safari 14+  | Add polyfill / use alternative |
| (none found)                | —               | —           | —                              |

---

### Decision Checkpoint

- [ ] **All checks pass** → Stop here, no enforcement needed
- [ ] **Gaps exist but acceptable** → Document limitations below
- [ ] **Gaps must be fixed** → Proceed to Phase 3

**Accepted Limitations (if any):**

- **Next Steps:**

- ***

## Phase 3: Enforcement (if implemented)

### 3A: Development Tools Configured

- [ ] `.browserslistrc` created
- [ ] `.stylelintrc.json` configured
- [ ] `eslint.config.mjs` configured
- [ ] Editor integration verified
- [ ] `lint:compat` script added

### 3B: Repeatable npm Scripts Added

> Based on Phase 1 findings, add npm scripts to re-run checks on demand.

| Script          | Command                                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `compat:css`    | `<doiuse command>` — ⚠️ **Tailwind v4:** omit this script; build output cannot be checked (parse error); Phase 3A stylelint is the only CSS check available |
| `compat:syntax` | `<es-check command with discovered ES floor>`                                                                                                               |
| `compat:apis`   | `<eslint-plugin-compat command on build path>`                                                                                                              |

---

## Summary (Optional)

**Overall Status:** ✅ Pass / ⚠️ Acceptable with limitations / ❌ Needs fixes

| Dimension    | Result  | Effective Floor                   |
| ------------ | ------- | --------------------------------- |
| CSS features | ✅ / ⚠️ | (e.g., Safari 16.4+)              |
| JS syntax    | ✅ / ❌ | (e.g., ES2022 / Chrome 94+)       |
| JS APIs      | ✅ / ⚠️ | (e.g., baseline widely available) |

**Key Findings:**

- **Recommendations:**

- ***

  **Generated by:** browser-compatibility skill
