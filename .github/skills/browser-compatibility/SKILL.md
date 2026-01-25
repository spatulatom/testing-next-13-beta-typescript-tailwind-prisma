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
   - [3B: Build Output (CI/CD)](#3b-build-output-cicd)
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
> # Example output: chrome 90, edge 90, firefox 88, safari 14
> ```
>
> Then use the output in tool commands. Store the resolved string in `EXPLICIT_BROWSERS` for reuse.
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

**Goal:** Discover what browsers your current build output supports—before changing anything.

> **We measure the finished product (build output), not source files.** Build output is the source of truth—it includes transpiled code and bundled dependencies.

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

```powershell
# STACK paths: vite → "dist/assets/**/*.js" | nextjs → ".next/static/chunks/**/*.js"
npx es-check es2020 "<BUILD_OUTPUT_JS_PATH>"
```

**Output:**

- ✅ Pass → ES2020-compatible (Chrome 80+, Safari 14+, Firefox 72+)
- ❌ Fail → Syntax exceeds ES2020; shows file/line

### Step 1.4: JS APIs

```powershell
# One-time install (reused in Phase 3)
npm install -D eslint eslint-plugin-compat

# Create minimal config for build output checking
# (Full config in Phase 3 if you proceed)
npx eslint --no-config-lookup --config <(echo '
import compat from "eslint-plugin-compat";
export default [{ files: ["**/*.js"], plugins: { compat }, rules: { "compat/compat": "warn" } }];
') "<BUILD_OUTPUT_JS_PATH>"
```

> **Note:** This requires `.browserslistrc` to exist (create temporarily or proceed to Phase 3 setup).
> **Alternative:** Skip this step in Phase 1; API checking is fully covered in Phase 3.

### Step 1.5: Document findings

**Create a findings file in the project root** by copying the template:

```powershell
# Copy template to project root (adjust path to skill location)
Copy-Item "<SKILL_PATH>/FINDINGS_TEMPLATE.md" "./browser-compat-findings.md"
```

> **For LLM agents:** Copy [FINDINGS_TEMPLATE.md](./FINDINGS_TEMPLATE.md) to the project root as `browser-compat-findings.md` and fill in the measurement results. Do NOT modify this skill file—write findings to the project's copy instead.

The template includes sections for:

- Resolved browser targets (which source was used)
- Build output paths
- Measurement results table
- Detailed tool output
- Gap analysis (Phase 2)
- Enforcement checklist (Phase 3)

---

## Phase 2: Decide

**Goal:** Compare measurements to your requirements and decide next steps.

### Step 2.1: Review gaps

| Issue                     | Minimum Browser | Your Target | Action                                     |
| ------------------------- | --------------- | ----------- | ------------------------------------------ |
| (e.g., Container Queries) | Chrome 105+     | Chrome 90+  | Remove feature / add fallback / accept gap |
| (e.g., structuredClone)   | Safari 15.4+    | Safari 14+  | Add polyfill / use alternative             |

### Step 2.2: Discover stack constraints

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

### Step 2.3: Decision checkpoint

- **All checks pass?** → Stop here. Document and move on.
- **Gaps exist but acceptable?** → Document accepted limitations.
- **Gaps must be fixed?** → Proceed to Phase 3.

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
> "browsers": ["chrome >= 90", "firefox >= 88", "safari >= 14", "edge >= 90"]
> ```
>
> To get current explicit values: `npx browserslist "baseline widely available"`

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

### 3B: Build Output (CI/CD)

Verify the final bundled output—catches issues from dependencies too.

**Why 3B matters:** Build output is the source of truth. It includes transpiled dependencies that 3A can't see.

> **STACK paths:**
>
> - `vite` → JS: `dist/assets/**/*.js`, CSS: `dist/assets/**/*.css`
> - `nextjs` → JS: `.next/static/chunks/**/*.js`, CSS: `.next/static/css/**/*.css`

#### 3B.1: CSS features → doiuse

Checks CSS features from all sources (your code + dependencies).

```powershell
# Use explicit browsers (doiuse doesn't support Baseline queries)
$EXPLICIT_BROWSERS = (npx browserslist "baseline widely available") -join ", "
npx doiuse --browsers "$EXPLICIT_BROWSERS" "<BUILD_OUTPUT_CSS_PATH>"
```

#### 3B.2: JS syntax → es-check

Verifies bundler transpiled correctly to target ES level.

```powershell
npx es-check es2020 "<BUILD_OUTPUT_JS_PATH>"
```

#### 3B.3: JS APIs → eslint-plugin-compat

Catches runtime APIs from dependencies (e.g., a library using `structuredClone()`).

Add build output to `eslint.config.mjs`:

```javascript
import compat from "eslint-plugin-compat";

export default [
  // 3A: Source code (from earlier)
  {
    files: ["src/**/*.{js,ts,jsx,tsx}", "app/**/*.{js,ts,jsx,tsx}"],
    plugins: { compat },
    rules: { "compat/compat": "warn" },
  },

  // 3B: Build output
  {
    files: ["<BUILD_OUTPUT_JS_PATH>"], // e.g., ".next/static/chunks/**/*.js"
    plugins: { compat },
    languageOptions: { ecmaVersion: 2022, sourceType: "module" },
    rules: { "compat/compat": "warn" },
  },
];
```

#### 3B.4: Add build verification script

Create a shell script for cross-platform browser resolution, or use explicit targets:

```json
{
  "scripts": {
    "lint:compat:build": "npm run build && npx doiuse --browsers 'chrome >= 90, firefox >= 88, safari >= 14, edge >= 90' '<BUILD_OUTPUT_CSS_PATH>' && npx es-check es2020 '<BUILD_OUTPUT_JS_PATH>' && eslint '<BUILD_OUTPUT_JS_PATH>'"
  }
}
```

> **Tip:** Replace the hardcoded browsers with the output of `npx browserslist "baseline widely available"` to stay current with Baseline definitions.
>
> **For dynamic resolution in CI**, create a helper script:
>
> ```javascript
> // scripts/get-browsers.js
> const { execSync } = require("child_process");
> const browsers = execSync("npx browserslist")
>   .toString()
>   .split("\n")
>   .filter(Boolean)
>   .join(", ");
> console.log(browsers);
> ```

#### 3B.5: Add CI gate

Create `.github/workflows/compat.yml`:

```yaml
name: Browser Compatibility
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npm run lint:compat:build
```

---

**Why both 3A and 3B?**

| Phase  | Target       | Catches                                 | Speed            |
| ------ | ------------ | --------------------------------------- | ---------------- |
| **3A** | Source code  | Your code issues                        | Instant (editor) |
| **3B** | Build output | Dependency issues + syntax verification | On build/CI      |

---

## Checklist

### Phase 1: Measure (build output)

- [ ] Resolve browser targets (check `.browserslistrc` → prompt → default to `baseline widely available`)
- [ ] Get explicit browser string: `npx browserslist "baseline widely available"`
- [ ] `npm run build`
- [ ] CSS features: `npx doiuse --browsers "<EXPLICIT_BROWSERS>" "<CSS_PATH>"`
- [ ] JS syntax: `npx es-check es2020 "<JS_PATH>"`
- [ ] JS APIs: (optional—covered fully in Phase 3)
- [ ] Copy `FINDINGS_TEMPLATE.md` to project root as `browser-compat-findings.md`
- [ ] Document findings in the copied file

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

### Phase 3B: Build output (CI/CD)

- [ ] CSS features: Add doiuse to script
- [ ] JS syntax: Add es-check to script
- [ ] JS APIs: Add build output to eslint config
- [ ] Add `lint:compat:build` script
- [ ] Add CI workflow
