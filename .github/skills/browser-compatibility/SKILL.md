---
name: browser-compatibility
description: Complete workflow for browser compatibility verification - discover build targets, add real-time linting for JavaScript APIs and CSS features, and validate build output. Use when setting up eslint-plugin-compat, Stylelint, browserslist configuration, troubleshooting compatibility issues, or implementing CI/CD browser checks.
license: MIT
metadata:
  author: Your Organization
  version: "3.0"
---

# Browser Compatibility Verification Guide

**Version:** 3.0 | **Last Updated:** January 2026

---

## Table of Contents

1. [Parameters](#parameters)
2. [Goal](#goal)
3. [Three Dimensions of Compatibility](#three-dimensions-of-compatibility)
4. [Phase 1: Measure](#phase-1-measure)
5. [Phase 2: Decide](#phase-2-decide)
6. [Phase 3: Enforce (Optional)](#phase-3-enforce-optional)
   - [3A: Development (Source Code)](#3a-development-source-code)
   - [3B: Build Output (Repeatable npm Scripts)](#3b-build-output-repeatable-npm-scripts)
7. [Checklist](#checklist)

---

## Parameters

```
STACK: nextjs | vite
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
> **STACK paths:**
>
> - `nextjs` → JS: `.next/static/chunks/**/*.js`, CSS: `.next/static/css/**/*.css`
> - `vite` → JS: `dist/assets/**/*.js`, CSS: `dist/assets/**/*.css`
>
> **Note:** Some dependencies (e.g., Tailwind v4) have hardcoded browser floors higher than your targets. Phase 2 will surface these.

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

# STACK paths: vite → "dist/assets/**/*.css" | nextjs → ".next/static/css/**/*.css"
npx doiuse --browsers "$EXPLICIT_BROWSERS" "<BUILD_OUTPUT_CSS_PATH>"
```

> **Note:** `doiuse` doesn't support Baseline queries directly—you must resolve to explicit browsers first.

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
# STACK paths: vite → "dist/assets/**/*.js" | nextjs → ".next/static/chunks/**/*.js"

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

**Create a findings file in the project root** by copying the template:

```powershell
# Copy template to project root (adjust path to skill location)
Copy-Item "<SKILL_PATH>/FINDINGS_TEMPLATE.md" "./browser-compat-findings.md"
```

> **For LLM agents — STRICT TEMPLATE REQUIREMENT:**
>
> 1. Read [FINDINGS_TEMPLATE.md](./FINDINGS_TEMPLATE.md) first
> 2. Copy it to the project root as `browser-compat-findings.md`
> 3. **Keep the exact same structure, headings, and table formats**
> 4. Only replace placeholder text (e.g., `<PROJECT_NAME>`, `✅ / ❌`) with actual values
> 5. Do NOT reorganize sections, rename headings, or create custom formats
> 6. Do NOT modify the skill files
>
> **Why:** Consistent structure enables comparison across projects. Custom formats break this.

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

### Step 2.3: Discover stack constraints

Check if any dependencies have hardcoded browser floors higher than TARGET_BROWSERS:

```powershell
# Check for Tailwind v4 (has hardcoded targets)
npm ls tailwindcss | Select-String "tailwindcss@4"
```

**Known constraints** (update as tools evolve):

| Tool                | Hardcoded Floor (as of Jan 2026)        | Impact if TARGET_BROWSERS is lower                         |
| ------------------- | --------------------------------------- | ---------------------------------------------------------- |
| **Tailwind CSS v4** | Safari 16.4+, Chrome 111+, Firefox 128+ | CSS won't work in older browsers regardless of your config |

> **LLM note:** If new tools with hardcoded targets are discovered, add them here. The flow is constraint-agnostic—just document what you find.

### Step 2.4: Decision checkpoint

- **All checks pass?** → Stop here. Document and move on.
- **Gaps exist but acceptable?** → Document accepted limitations.
- **Gaps must be fixed?** → Proceed to Phase 3.

> **For LLM agents — STOP AND ASK:**
>
> Before proceeding to Phase 3, **present findings to the user** and ask:
>
> 1. Summarize what was found (pass/fail for CSS, JS syntax, JS APIs)
> 2. List any gaps between current support and TARGET_BROWSERS
> 3. Ask: _"Would you like me to set up enforcement (linting + CI scripts) to catch future compatibility issues? This is optional but recommended if gaps were found."_
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

No dev-time check required. Build tools (Vite/Next.js) transpile syntax automatically based on their target config. Syntax is verified on build output in 3B.

#### 3A.3: JS APIs → ESLint

Create/update `eslint.config.mjs`:

```javascript
import compat from "eslint-plugin-compat";

export default [
  // Source code checking (dev-time)
  {
    files: ["src/**/*.{js,ts,jsx,tsx}", "app/**/*.{js,ts,jsx,tsx}"],
    plugins: { compat },
    rules: {
      "compat/compat": "warn",
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
> 3. Use the correct STACK paths (nextjs vs vite)
>
> Keep it simple — just inline the commands directly in package.json:

```json
{
  "scripts": {
    "compat:css": "npx doiuse --browsers \"baseline widely available\" \".next/static/**/*.css\"",
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
- [ ] Add `compat:syntax` script (es-check with discovered ES floor)
- [ ] Add `compat:apis` script (eslint-plugin-compat on build output)
