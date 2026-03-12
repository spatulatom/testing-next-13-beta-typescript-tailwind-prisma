---
name: browser-compatibility
description: Complete workflow for browser compatibility verification — discover build targets, add real-time linting for JavaScript APIs and CSS features, and validate build output.
disable-model-invocation: true
license: MIT
metadata:
  author: Your Organization
  version: '3.0'
---

# Browser Compatibility Verification Guide

**Version:** 3.0 | **Last Updated:** January 2026

---

## Table of Contents

1. [Parameters](#parameters)
2. [Goal](#goal)
3. [Three Dimensions of Compatibility](#three-dimensions-of-compatibility)
4. [Phase 1: Measure](#phase-1-measure)
   - [Step 1.1: Build the project](#step-11-build-the-project)
   - [Step 1.2: CSS features](#step-12-css-features)
   - [Step 1.3: JS syntax](#step-13-js-syntax)
   - [Step 1.4: JS APIs](#step-14-js-apis)
   - [Step 1.5: Document findings](#step-15-document-findings)
5. [Phase 2: Decide](#phase-2-decide)
   - [Step 2.1: Review gaps](#step-21-review-gaps)
   - [Step 2.2: Check build tool configuration](#step-22-check-build-tool-configuration)
   - [Step 2.3: Discover hardcoded compiler targets](#step-23-discover-hardcoded-compiler-targets)
   - [Step 2.4: Decision checkpoint](#step-24-decision-checkpoint)
6. [Phase 3: Enforce (Optional)](#phase-3-enforce-optional)
   - [Step 3.0: Install tools](#step-30-install-tools-shared-by-3a-and-3b)
   - [3A: Development (Source Code)](#3a-development-source-code)
     - [3A.1: CSS features → Stylelint](#3a1-css-features--stylelint)
     - [3A.2: JS syntax → Not needed](#3a2-js-syntax--not-needed)
     - [3A.3: JS APIs → ESLint](#3a3-js-apis--eslint)
     - [3A.4: Verify editor integration](#3a4-verify-editor-integration)
     - [3A.5: Add development script](#3a5-add-development-script)
   - [3B: Build Output (Repeatable npm Scripts)](#3b-build-output-repeatable-npm-scripts)
7. [Checklist](#checklist)
   - [Phase 1: Measure](#phase-1-measure-build-output)
   - [Phase 2: Decide](#phase-2-decide-1)
   - [Phase 3A: Development](#phase-3a-development-source-code)
   - [Phase 3B: Build output](#phase-3b-build-output-repeatable-npm-scripts)

---

## Parameters

```
STACK: nextjs | vite | other
```

> **For LLM agents — Target Browser Resolution:**
>
> Resolve `TARGET_BROWSERS` using this priority order:
>
> 1. **User prompt** — If user specifies targets in their prompt (e.g., "check for Chrome 100+"), use those. Explicit intent has highest priority.
> 2. **Project config** — Check for existing `.browserslistrc` or `package.json#browserslist`. If found, use those values.
> 3. **Default** — Fall back to `baseline widely available` (features supported in all core browsers for 30+ months).
>
> **Important:** Document which source was used. If no config existed and you create `.browserslistrc`, record that it was **created** (not found).
>
> **⚠️ CRITICAL — Desktop vs Mobile Browsers:**
>
> Browser compatibility tools treat **desktop and mobile as separate browsers**:
>
> - Desktop: `chrome`, `firefox`, `safari`, `edge`
> - Mobile: `and_chr` (Android Chrome), `and_ff` (Android Firefox), `ios_saf` (iOS Safari)
>
> **Rules for LLM agents:**
>
> 1. **User prompt mentions browsers** → Always assume BOTH desktop AND mobile. If user says "Chrome 115+", include both `chrome >= 115` AND `and_chr >= 115`.
> 2. **Project config found** → Check if mobile browsers are listed. If missing, ADD them (e.g., if only `safari` is listed, add `ios_saf` with same version).
> 3. **Creating explicit lists** → Always include: `chrome`, `and_chr`, `firefox`, `and_ff`, `safari`, `ios_saf`, `edge`.
>
> **Why this matters:** Some CSS features work on desktop Safari but NOT on iOS Safari (e.g., `resize` property). Missing mobile browsers = incomplete compatibility checks.
>
> **Baseline options** (Browserslist syntax):
>
> - `baseline widely available` — Conservative, 30+ months of support (recommended default)
> - `baseline newly available` — Cutting-edge, just reached all browsers
> - `baseline 2024` — All features from Baseline 2024 and earlier
> - Add `with downstream` to include Chromium-based browsers (Opera, Samsung, etc.)
>
> **Getting explicit browser strings** (required for `doiuse` and `es-check`):
>
> ```powershell
> # Run this to convert Baseline query to explicit browser versions
> npx browserslist "baseline widely available"
> # Example output includes BOTH desktop and mobile:
> # chrome 115, and_chr 115, firefox 115, and_ff 115, safari 16.4, ios_saf 16.4, edge 115
> ```
>
> Then use the output in tool commands. Store the resolved string in `EXPLICIT_BROWSERS` for reuse.
>
> **Note:** The output includes mobile browsers (`and_chr`, `and_ff`, `ios_saf`). When creating manual browser lists, always include these mobile identifiers.
>
> **Common build-output path examples — not guarantees:**
>
> - `nextjs` often emits JS under `.next/static/chunks/**/*.js`; CSS may be under `.next/static/css/**/*.css` or `.next/static/chunks/**/*.css` depending on bundler/runtime
> - `vite` often emits JS/CSS under `dist/assets/**/*.{js,css}`
> - `other` stacks (Astro, SvelteKit, Webpack, custom builds, etc.) must be inspected directly after build
>
> **Rule:** treat these as starting examples only. Always inspect the actual build output and record the real emitted JS/CSS paths you audited.
>
> **Declared target vs effective floor per dimension:**
>
> `TARGET_BROWSERS` is your _declared_ intent. But each dimension has its own _effective_ floor, which may be higher:
>
> | Dimension        | Effective floor controlled by                                                                                                         |
> | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
> | **CSS features** | PostCSS/Autoprefixer (follows browserslist) **or** hardcoded tool floors (e.g., Tailwind v4 forces Safari 16.4+ regardless of config) |
> | **JS syntax**    | SWC/Babel transpilation target (Next.js reads browserslist; Vite/esbuild uses its own `target`)                                       |
> | **JS APIs**      | Polyfills you explicitly include — no tool handles this automatically                                                                 |
>
> **Rule:** Your overall browser support claim is the most restrictive floor across all three dimensions. When dimensions diverge, document each separately and report the limiting one clearly.
>
> **Example of divergence:** Tailwind v4 locks CSS to Safari 16.4+, but your SWC config targets ES2020 (Safari 14+) for JS. Result: your effective floor is Safari 16.4+ (CSS wins). Claiming Safari 14+ support would be wrong.
>
> Phase 2 will surface these constraints — compare them per dimension, not just overall.

---

## Goal

Given a project (fresh or existing), answer: **"What browsers can this project's shipped code run in today?"**

**Approach:** Measure first, decide second, enforce only if needed.

| Phase                       | Action                                | Outcome                                          |
| --------------------------- | ------------------------------------- | ------------------------------------------------ |
| **1. Measure**              | Run quick audits on build output      | Know what syntax/CSS your build already supports |
| **2. Decide**               | Compare findings to `TARGET_BROWSERS` | Document gaps or accept current state            |
| **3. Enforce** _(optional)_ | Add linters + CI gates                | Get real-time feedback, block regressions        |

**Key insight:** Build tools produce the shipped code. Linters/checkers only influence output when you act on their findings.

---

## Three Dimensions of Compatibility

Browser compatibility has three distinct dimensions. **We always check in this order: CSS → JS syntax → JS APIs.**

| #   | Dimension        | What it is                   | Examples                                               | Tool                   | Risk if unsupported            |
| --- | ---------------- | ---------------------------- | ------------------------------------------------------ | ---------------------- | ------------------------------ |
| 1   | **CSS features** | Properties, values, at-rules | `@layer`, `container-queries`, CSS nesting             | `doiuse` / Stylelint   | Visual breakage                |
| 2   | **JS syntax**    | Language grammar             | `?.`, `??`, `#private`, arrow functions                | `es-check`             | Parse error (page won't load)  |
| 3   | **JS APIs**      | Runtime functions/objects    | `fetch()`, `structuredClone()`, `IntersectionObserver` | `eslint-plugin-compat` | Runtime error (feature breaks) |

**Key insight:**

- **JS syntax** → Build tools transpile automatically (e.g., `obj?.prop` → `obj && obj.prop`)
- **JS APIs** → Run as-is in browser. If missing, you get a runtime error. Must check explicitly.
- **CSS features** → Some tools (PostCSS) can add fallbacks; others (Tailwind v4) have hardcoded targets.

> **To support older browsers with unsupported APIs, you must:** avoid the API, add a polyfill (e.g., `core-js`), or accept the higher browser floor.

---

## Phase 1: Measure

**Goal:** Validate that your build output works in TARGET_BROWSERS.

⚠️ **FINDINGS MUST USE TEMPLATE:** All results go into `browser-compat-findings.md` using the exact structure from [FINDINGS_TEMPLATE.md](./FINDINGS_TEMPLATE.md). Do not create custom formats.

> **Phase 1 scope is build output only.** Do not use source files, editor diagnostics, or dev-server-only artifacts as Phase 1 evidence. Every finding in this phase must come from emitted JS/CSS assets produced by the build.

> **Philosophy:** We target `baseline widely available` as our guaranteed floor. If the build supports older browsers, that's a bonus—not a goal. Chasing ancient browser support has diminishing returns.

> **We measure the finished product (build output), not source files.** Build output is the source of truth—it includes transpiled code and bundled dependencies.

> **What Phase 1 actually does:**
>
> - **CSS features + JS APIs:** Validate against TARGET_BROWSERS (pass/fail). These tools require a browser list upfront—discovering the absolute minimum would require testing every browser version combination (impractical).
> - **JS syntax:** Discover the actual ES floor. Testing ES levels is linear (ES2023 → ES2022 → ES2020), so discovery is cheap. This gives bonus insight into backward compatibility headroom.

### Step 1.1: Build the project

```powershell
npm run build
```

### Step 1.2: CSS features

```powershell
# First, resolve explicit browser string (if using Baseline)
$EXPLICIT_BROWSERS = (npx browserslist "baseline widely available") -join ", "

# Use the real emitted CSS path you discovered after build.
# Example paths only: vite → "dist/assets/**/*.css" | nextjs → ".next/static/css/**/*.css"
npx doiuse --browsers "$EXPLICIT_BROWSERS" "<BUILD_OUTPUT_CSS_PATH>"
```

> **Note:** `doiuse` doesn't support Baseline queries directly—you must resolve to explicit browsers first.

> **Secondary emitted-CSS method — Lightning CSS:**
>
> If `doiuse` fails because it cannot parse the emitted CSS, try Lightning CSS on the emitted CSS files directly. This is still a build-output check, not a source-level fallback.
>
> ```powershell
> # Install once if needed
> npm install -D lightningcss-cli
>
> # Run this per emitted CSS file. If .browserslistrc exists, --browserslist will load it.
> # Otherwise use --targets "baseline widely available" or your explicit query.
> npx lightningcss "<BUILD_OUTPUT_CSS_FILE>" --browserslist -o "<TEMP_OUTPUT_CSS_FILE>"
> ```
>
> **How to interpret Lightning CSS results:**
>
> - If Lightning CSS **cannot parse** the emitted CSS, keep the CSS result as ⚠️ Inconclusive.
> - If Lightning CSS **parses and lowers syntax/adds fallbacks**, record that as secondary emitted-CSS evidence that some modern syntax can be compiled for the selected targets.
> - If Lightning CSS **parses with little or no output change**, do **not** treat that as a full compatibility pass. Lightning CSS is primarily a parser/transpiler, not a complete unsupported-feature reporter like `doiuse`.
> - Use Lightning CSS to supplement Phase 1 evidence, not to replace the compatibility judgment model entirely.

> ⚠️ **Tailwind v4 limitation:** If the project uses Tailwind v4, `doiuse` will **crash with a parse error** (`CssSyntaxError: Unclosed block`) before doing any browser comparison. This happens **regardless of what browsers you pass via `--browsers`** — the failure is caused by doiuse's bundled PostCSS being too old to parse Tailwind v4's `@layer properties { @supports (...) { } }` syntax. Changing targets will not fix it.
>
> **If `doiuse` crashes:**
>
> 1. Mark the CSS check as ⚠️ Inconclusive in the findings file
> 2. Try Lightning CSS on the emitted CSS as a **secondary** Phase 1 method if you want additional build-output evidence
> 3. Document Tailwind v4's known hardcoded browser floors in Phase 2.1 instead (Safari 16.4+, Chrome 111+, Firefox 128+)
> 4. For ongoing CSS checks (Phase 3A), use `stylelint` + `stylelint-no-unsupported-browser-features` instead of doiuse
>
> **Important:** Do not silently replace a build-output CSS check with a source-level check in Phase 1. If you try another tool, it must analyze the emitted CSS files directly. If no reliable emitted-CSS tool is available, keep the result as ⚠️ Inconclusive and explain why.

> **Important:** Even when Lightning CSS succeeds, Phase 2 must still consider framework/tool hardcoded floors. A successful transform is supportive evidence, not a guarantee that the stack officially supports browsers below its stated minimum.

**Output:** Lists unsupported features, e.g.: `CSS Container Queries not supported by: Chrome < 105`

### Step 1.3: JS syntax

> **Note:** `es-check` doesn't map to Browserslist or Baseline directly. You need to determine the appropriate ES level.
>
> **For LLM agents — ES level calculation:**
>
> 1. Calculate baseline ES year: `current year - 2.5` (round down, be conservative)
>    - Example: January 2026 → 2026 - 2.5 = 2023.5 → **ES2023**
>    - Example: January 2028 → 2028 - 2.5 = 2025.5 → **ES2025**
> 2. Test from that level, then continue testing older levels to find actual support floor
> 3. Use your current knowledge to map ES levels → browser versions (don't rely on hardcoded tables)

```powershell
# Use the real emitted JS path you discovered after build.
# Example paths only: vite → "dist/assets/**/*.js" | nextjs → ".next/static/chunks/**/*.js"

# Test baseline level first (calculated from current year - 2.5)
npx es-check es2023 "<BUILD_OUTPUT_JS_PATH>"  # Replace with calculated baseline

# Then test older levels to discover actual support floor
npx es-check es2022 "<BUILD_OUTPUT_JS_PATH>"
npx es-check es2020 "<BUILD_OUTPUT_JS_PATH>"
npx es-check es2018 "<BUILD_OUTPUT_JS_PATH>"
```

**Interpretation:**

- First, confirm baseline passes (e.g., ES2023 ✅)
- Then find the **oldest passing level** — that's your actual support floor
- Example: "Build passes ES2023 ✅, ES2022 ✅, ES2020 ✅, fails ES2018 ❌ → Actual floor: ES2020"
- Report the backward compatibility headroom beyond baseline

**Reference — ES levels (as of 2026, verify with current knowledge):**

| ES Level | Approx Min Chrome | Approx Min Safari |
| -------- | ----------------- | ----------------- |
| ES2023   | 110+              | 16.4+             |
| ES2022   | 94+               | 15+               |
| ES2020   | 80+               | 14+               |

### Step 1.4: JS APIs

Unlike JS syntax (which bundlers transpile), JS APIs run as-is in the browser. Skipping this check means runtime errors in older browsers will go undetected.

```powershell
# Install eslint-plugin-compat (required for this check; also reused in Phase 3 if implemented)
npm install -D eslint eslint-plugin-compat

# Create .browserslistrc if it doesn't exist (required for eslint-plugin-compat to work)
echo "baseline widely available" > .browserslistrc

# Check build output for incompatible APIs (Bash/Unix/macOS)
npx eslint --no-config-lookup --config <(echo '
import compat from "eslint-plugin-compat";
export default [{ files: ["**/*.js"], plugins: { compat }, rules: { "compat/compat": "warn" } }];
') "<BUILD_OUTPUT_JS_PATH>"

# Windows PowerShell alternative (process substitution doesn't work)
@"
import compat from "eslint-plugin-compat";
export default [{
  files: ["<BUILD_OUTPUT_JS_PATH>"],
  plugins: { compat },
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
  rules: { "compat/compat": "warn" }
}];
"@ | Out-File -Encoding utf8 "eslint.compat-check.mjs"
npx eslint --config eslint.compat-check.mjs "<BUILD_OUTPUT_JS_PATH>"
Remove-Item eslint.compat-check.mjs
```

> **Note:** This checks runtime APIs (e.g., `structuredClone()`, `fetch()`) that would fail in older browsers. Unlike syntax (which causes parse errors), API issues cause runtime errors — catching them early is valuable.
>
> **For LLM agents on Windows:** The Bash `<(echo ...)` syntax fails in PowerShell. Use the Windows alternative above: create temp file → run eslint → delete temp file. Both approaches produce identical results.

### Step 1.5: Document findings

**Copy the template and fill in measurements.** Do not create a custom report format.

```powershell
# Copy template to project root (adjust path to skill location)
Copy-Item "<SKILL_PATH>/FINDINGS_TEMPLATE.md" "./browser-compat-findings.md"
```

> **For LLM agents — TEMPLATE REQUIREMENT:**
>
> 1. Copy [FINDINGS_TEMPLATE.md](./FINDINGS_TEMPLATE.md) to `browser-compat-findings.md` in project root
> 2. **Only** replace placeholder values (e.g., `<PROJECT_NAME>`, `✅ / ❌`) with your actual measurements
> 3. Keep structure, headings, tables, and section order exactly as shown in the template
> 4. Do NOT customize, reorganize, or rename sections
> 5. Fill Phase 1 using the actual emitted JS/CSS paths you audited, even if they differ from the common Next.js/Vite examples in the template
>
> **Why:** Consistent structure allows comparison across projects. Any deviation breaks this.

The template sections (keep this order):

1. Header (Project, Date, Target Browsers)
2. Phase 1: Pre-existing Config table → Resolution table → Build Output Paths → Measurement Results → Detailed Issues
3. Phase 2: Gap Analysis → Stack Constraints → Decision Checkpoint
4. Phase 3: Enforcement checklists
5. Summary (optional, at bottom)

---

## Phase 2: Decide

**Goal:** Compare measurements to your requirements and decide next steps.

### Step 2.1: Review gaps

| Issue                     | Minimum Browser | Your Target | Action                                     |
| ------------------------- | --------------- | ----------- | ------------------------------------------ |
| (e.g., Container Queries) | Chrome 105+     | Chrome 90+  | Remove feature / add fallback / accept gap |
| (e.g., structuredClone)   | Safari 15.4+    | Safari 14+  | Add polyfill / use alternative             |

### Step 2.2: Check build tool configuration

Determine whether your build tools respect `.browserslistrc` or have their own targets:

| Tool                      | Respects browserslist? | How to configure                                 | Notes                                             |
| ------------------------- | ---------------------- | ------------------------------------------------ | ------------------------------------------------- |
| **Next.js**               | ✅ Yes                 | `.browserslistrc` or `package.json#browserslist` | Uses for JS transpilation                         |
| **Vite**                  | ⚠️ Partial             | `build.target` in `vite.config.js`               | CSS: via PostCSS; JS: uses esbuild/rollup targets |
| **PostCSS/Autoprefixer**  | ✅ Yes                 | `.browserslistrc`                                | Adds vendor prefixes                              |
| **Babel**                 | ✅ Yes                 | `@babel/preset-env` reads browserslist           | If used directly                                  |
| **esbuild**               | ❌ No                  | `target` option (e.g., `es2020`, `chrome100`)    | Doesn't read browserslist                         |
| **SWC** (Next.js default) | ⚠️ Partial             | Next.js passes browserslist to SWC               | Direct SWC use needs manual config                |

> **For LLM agents:** Check project's build config files (`next.config.js`, `vite.config.js`, `babel.config.js`) to understand what controls transpilation. Document findings.

### Step 2.3: Discover hardcoded compiler targets

**These override your declared target and cannot be changed by `.browserslistrc`.** Check each dimension:

**CSS dimension — check for tools with hardcoded floors:**

```powershell
# Check for Tailwind v4 (has hardcoded CSS targets)
npm ls tailwindcss | Select-String "tailwindcss@4"
```

**Known CSS constraints** (verify versions — these change as tools evolve):

| Tool                | Hardcoded Floor (as of Jan 2026)        | Impact                                                           |
| ------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| **Tailwind CSS v4** | Safari 16.4+, Chrome 111+, Firefox 128+ | CSS won't work in older browsers regardless of `.browserslistrc` |

**JS syntax dimension — check transpiler config:**

```powershell
# Next.js: SWC reads browserslist — check what your .browserslistrc resolves to
npx browserslist   # shows which browsers SWC targets

# Vite: esbuild has its own target — check vite.config.js
Get-Content vite.config.js | Select-String "target"
```

> **esbuild/Vite note:** `build.target` in `vite.config.js` overrides browserslist for JS. If set (e.g., `target: 'es2020'`), that is your JS syntax floor — browserslist has no effect on it.

**JS API dimension — no automatic floor:**

APIs are not transpiled. Your effective JS API floor is determined by which polyfills you ship. If you ship none, the floor is whatever `baseline widely available` browsers all support natively.

> **LLM note:** Compare all three effective floors. The most restrictive one is your real support floor. If one dimension is significantly higher than the others (e.g., Tailwind forcing CSS to Safari 16.4+ while JS supports Safari 14+), flag this explicitly in findings — it's the key constraint to communicate to the user.

### Step 2.4: Decision checkpoint

- **All checks pass?** → Stop here. Document and move on.
- **Gaps exist but acceptable?** → Document accepted limitations.
- **Gaps must be fixed?** → Proceed to Phase 3.

> **For LLM agents — STOP AND ASK:**
>
> Before proceeding to Phase 3, **present findings to the user** and ask for explicit decisions on all of these points:
>
> 1. **Support claim:** Which browser target should the project actually claim and enforce now?
>    - Keep the original `TARGET_BROWSERS`
>    - Adopt the measured effective floor from Phase 1/2
>    - Choose a new custom target
> 2. **Gap handling:** For each Phase 1/2 failure, warning, or inconclusive result, should it be fixed now, accepted/documented, or deferred to follow-up work?
> 3. **Phase 3A scope:** Should source-level enforcement be configured in the editor/linting flow? If yes, which target should 3A enforce: declared target, effective floor, or a custom target?
> 4. **Phase 3B scope:** Should repeatable build-output checks be configured? If yes, which dimensions should be added: CSS, JS syntax, JS APIs? Omit any dimension that is not technically reliable on this stack.
> 5. **Hardcoded floor conflicts:** If the stack has non-negotiable floors higher than the desired target, should the project raise its support claim, change tooling/code to meet the lower target, or keep the mismatch documented for now?
>
> The real decision after Phase 2 is **not just whether to run Phase 3**. It is whether to:
>
> - keep or revise the support claim,
> - fix or accept discovered gaps,
> - and choose what Phase 3 should actually enforce.
>
> **Only proceed to Phase 3 if the user confirms.** Phase 3 installs additional dev dependencies and modifies config files.

---

## Phase 3: Enforce (Optional)

**Goal:** Get ongoing feedback—both during development and before deployment.

> **Same three dimensions, different targets.** We check CSS → JS syntax → JS APIs in both 3A (source) and 3B (build output).

> **For LLM agents:** If `browser-compat-findings.md` doesn't exist in the project root, create it first by copying [FINDINGS_TEMPLATE.md](./FINDINGS_TEMPLATE.md). Update the "Phase 3" section of the findings file as you complete each step—especially 3B results, which may reveal new dependency issues not found in Phase 1.

### Step 3.0: Install tools (shared by 3A and 3B)

```powershell
# Skip if already installed in Phase 1
npm install -D eslint eslint-plugin-compat stylelint stylelint-no-unsupported-browser-features
```

> **ESLint version check:** Projects using ESLint 9+ need `eslint.config.mjs` (flat config). ESLint 8 and earlier use `.eslintrc.json`. Check with `npx eslint --version`. If migrating, run `npx @eslint/migrate-config .eslintrc.json`.

Create `.browserslistrc` at project root:

```
# Use project's existing config, or Baseline as default
baseline widely available
```

> **Baseline alternatives:**
>
> - `baseline newly available` — cutting-edge features
> - `baseline 2024` — yearly feature set
> - Or explicit: `chrome >= 90, firefox >= 88, safari >= 14, edge >= 90`

> ⚠️ **Tool quirk:** `eslint-plugin-compat` ignores `settings.browsers` in eslint.config.mjs—must use `.browserslistrc`.

---

### 3A: Development (Source Code)

Real-time warnings in your editor as you write code.

> **Why Lightning CSS is not part of 3A:** Lightning CSS operates on CSS files passed through a build/transform step. It is useful as a build-output or build-pipeline check, but it is not an editor-time unsupported-feature warning system like Stylelint.

#### 3A.1: CSS features → Stylelint

Create `.stylelintrc.json`:

```json
{
  "plugins": ["stylelint-no-unsupported-browser-features"],
  "rules": {
    "plugin/no-unsupported-browser-features": [
      true,
      {
        "browsers": ["baseline widely available"],
        "severity": "warning"
      }
    ]
  }
}
```

> ⚠️ **Tool quirk:** VS Code Stylelint extension ignores `.browserslistrc`; must specify `browsers` inline.
>
> **Alternative explicit syntax** (if Baseline query not supported by your Stylelint version):
>
> ```json
> "browsers": [
>   "chrome >= 115",
>   "and_chr >= 115",
>   "firefox >= 115",
>   "and_ff >= 115",
>   "safari >= 16.4",
>   "ios_saf >= 16.4",
>   "edge >= 115"
> ]
> ```
>
> **⚠️ CRITICAL for LLM agents:** When creating explicit browser lists, **you MUST include mobile browsers**:
>
> - Desktop: `chrome`, `firefox`, `safari`, `edge`
> - Mobile: `and_chr` (Android Chrome), `and_ff` (Android Firefox), `ios_saf` (iOS Safari)
>
> Without mobile browsers, compatibility checks are incomplete. For example, `resize` property works on desktop Safari but NOT on iOS Safari — missing `ios_saf` means this issue won't be detected!
>
> To get current explicit values: `npx browserslist "baseline widely available"` — scan output for `and_chr`, `and_ff`, `ios_saf` and include them all.

#### 3A.2: JS syntax → Not needed

No dev-time check required, and none is possible. During development you write TypeScript/JSX — there is no compiled `.js` output to check ES level against. `es-check` only works on real build output (after `npm run build`). Syntax verification belongs exclusively in 3B/CI.

> **Why `es-check` still matters in 3B:** It is not primarily a check on _your_ code — it is a **dependency regression gate**. Next.js/SWC transpiles your source correctly, but packages in `node_modules/` are bundled as-is (not re-transpiled). A dependency that ships pre-compiled ES2022+ code in its `dist/` will silently raise your bundle's syntax floor after `npm update`. `es-check` on build output in CI is the only way to catch this before users do.

#### 3A.3: JS APIs → ESLint

Create/update `eslint.config.mjs`:

```javascript
import compat from 'eslint-plugin-compat';

export default [
  // Source code checking (dev-time)
  {
    files: ['src/**/*.{js,ts,jsx,tsx}', 'app/**/*.{js,ts,jsx,tsx}'],
    plugins: { compat },
    rules: {
      'compat/compat': 'warn',
    },
  },
];
```

#### 3A.4: Verify editor integration

1. Install VS Code extensions: **ESLint**, **Stylelint**
2. Open a file with incompatible code (e.g., use `structuredClone()`)
3. Confirm warning appears in editor

#### 3A.5: Add development script

```json
{
  "scripts": {
    "lint:compat": "eslint . && stylelint \"**/*.css\""
  }
}
```

Run `npm run lint:compat` before commits.

---

---

### 3B: Build Output (Repeatable npm Scripts)

Add npm scripts to re-run Phase 1 checks on demand.

**Why 3B matters:** Phase 1 measurements become stale as dependencies update. Repeatable scripts let you verify build output anytime.

> **For LLM agents:** After completing Phase 1, add npm scripts based on your findings:
>
> 1. Use the browser targets you discovered (or `baseline widely available`)
> 2. Use the ES level floor you found (e.g., ES2022)
> 3. Use the actual emitted build-output paths discovered in Phase 1, not assumed framework defaults
>
> Keep it simple — just inline the commands directly in package.json:

```json
{
  "scripts": {
    "compat:css": "npx doiuse --browsers \"baseline widely available\" \".next/static/**/*.css\"",
    "compat:css:lightning": "<lightningcss command or script over emitted CSS files>",
    "compat:syntax": "npx es-check es2022 \".next/static/chunks/**/*.js\"",
    "compat:apis": "npx eslint --config eslint.compat-check.mjs \".next/static/chunks/**/*.js\""
  }
}
```

> **Adjust for your project:**
>
> - Replace `es2022` with the ES floor discovered in Phase 1.3
> - Replace paths for vite: `dist/assets/**/*.js`, `dist/assets/**/*.css`
> - Replace browser query if project uses explicit targets instead of Baseline
> - If `doiuse` is unreliable on emitted CSS for your stack, add an optional Lightning CSS-based script that attempts to parse/transform each emitted CSS file directly

> ⚠️ **Tailwind v4 — `compat:css` may be unreliable.** `doiuse` crashes on Tailwind v4 build output with the same parse error as in Phase 1. For Tailwind v4 projects:
>
> - Keep `compat:css` only if `doiuse` actually works on the emitted CSS for your stack
> - Otherwise add an optional `compat:css:lightning` script as a secondary emitted-CSS parse/transform check
> - Do **not** treat `compat:css:lightning` as equivalent to a full compatibility pass; it is supporting evidence only
> - Keep **Phase 3A stylelint** for source-level feedback regardless
> - Document any remaining emitted-CSS uncertainty in the findings file Phase 3 section

---

**Why both 3A and 3B?**

| Phase  | Target       | Catches                                 | Speed            |
| ------ | ------------ | --------------------------------------- | ---------------- |
| **3A** | Source code  | Your code issues                        | Instant (editor) |
| **3B** | Build output | Dependency issues + syntax verification | On build/CI      |

---

## Checklist

### Phase 1: Measure (build output)

- [ ] Resolve browser targets (check prompt → `.browserslistrc` → default to `baseline widely available`)
- [ ] Get explicit browser string: `npx browserslist "baseline widely available"`
- [ ] `npm run build`
- [ ] CSS features: `npx doiuse --browsers "<EXPLICIT_BROWSERS>" "<CSS_PATH>"`
- [ ] If `doiuse` cannot parse emitted CSS, optionally run Lightning CSS on emitted CSS files as a secondary build-output check
- [ ] JS syntax: Test ES levels (es2023 → es2022 → es2020) to find build floor
- [ ] JS APIs: `npx eslint` with eslint-plugin-compat on build output
- [ ] Copy `FINDINGS_TEMPLATE.md` to project root as `browser-compat-findings.md`
- [ ] Document findings in the copied file (follow template exactly)

### Phase 2: Decide

- [ ] Compare findings to TARGET_BROWSERS
- [ ] Note hard constraints (e.g., Tailwind v4)
- [ ] Decision: accept / fix / enforce

### Phase 3A: Development (source code)

- [ ] Create `.browserslistrc` (use `baseline widely available` or project-specific targets)
- [ ] Install tools: `npm i -D eslint eslint-plugin-compat stylelint stylelint-no-unsupported-browser-features`
- [ ] CSS features: Configure `.stylelintrc.json`
- [ ] JS syntax: _(not needed—bundler handles)_
- [ ] JS APIs: Configure `eslint.config.mjs`
- [ ] Verify editor warnings work
- [ ] Add `lint:compat` script

### Phase 3B: Build output (repeatable npm scripts)

- [ ] Add `compat:css` script (doiuse with target browsers)
- [ ] If `compat:css` is unreliable for emitted CSS on this stack, optionally add `compat:css:lightning` as a secondary emitted-CSS parse/transform check
- [ ] Add `compat:syntax` script (es-check with discovered ES floor)
- [ ] Add `compat:apis` script (eslint-plugin-compat on build output)
