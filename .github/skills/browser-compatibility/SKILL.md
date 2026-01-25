---
name: browser-compatibility
description: Complete workflow for browser compatibility verification - discover build targets, add real-time linting for JavaScript APIs and CSS features, and validate build output. Use when setting up eslint-plugin-compat, Stylelint, browserslist configuration, troubleshooting compatibility issues, or implementing CI/CD browser checks.
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
5. [Phase 2: Decide](#phase-2-decide)
6. [Phase 3: Enforce (Optional)](#phase-3-enforce-optional)
   - [3A: Development (Source Code)](#3a-development-source-code)
   - [3B: Build Output (CI/CD)](#3b-build-output-cicd)
7. [Checklist](#checklist)

---

## Parameters

```
TARGET_BROWSERS:
  chrome >= 80
  firefox >= 75
  safari >= 13
  edge >= 80

STACK: nextjs | vite
```

> **⚠️ SINGLE SOURCE OF TRUTH:** All browser targets in this document reference `TARGET_BROWSERS` above.
> **To change targets:** Update only the Parameters section. All commands use `$TARGET_BROWSERS` as a placeholder.
>
> **For LLM agents:**
>
> - `TARGET_BROWSERS` = your **desired** minimum browser support. Convert to tool-specific formats as needed.
> - `STACK` = determines file paths for build output (`nextjs` → `.next/`, `vite` → `dist/`).
>
> **Format conversions:**
>
> - `.browserslistrc` / `package.json#browserslist` → one per line or JSON array
> - Vite `build.target` → `["chrome94", "firefox103", "safari15.4"]`
> - Stylelint `browsers` → `["chrome >= 94", "firefox >= 103", "safari >= 15.4", "edge >= 94"]`
>
> **Defaults rationale:** Modern browsers with ES2022 support (late 2021/early 2022), covers 97%+ of users. Aligns with React 19 / Next.js 16 defaults. Adjust per project analytics.
>
> **Note:** Some stack dependencies (e.g., Tailwind v4) have hardcoded browser floors higher than TARGET_BROWSERS. Phase 2 will surface these—the flow stays independent of any specific tool's constraints.

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
# STACK paths: vite → "dist/assets/**/*.css" | nextjs → ".next/static/css/**/*.css"
npx doiuse --browsers "$TARGET_BROWSERS" "<BUILD_OUTPUT_CSS_PATH>"
```

> Replace `$TARGET_BROWSERS` with comma-separated list from Parameters: `"chrome >= 94, firefox >= 103, safari >= 15.4, edge >= 94"`

**Output:** Lists unsupported features, e.g.: `CSS Container Queries not supported by: Chrome < 105`

### Step 1.3: JS syntax

```powershell
# STACK paths: vite → "dist/assets/**/*.js" | nextjs → ".next/static/chunks/**/*.js"
npx es-check es2022 "<BUILD_OUTPUT_JS_PATH>"
```

**Output:**

- ✅ Pass → ES2022-compatible (Chrome 94+, Safari 15+, Firefox 90+) - includes private class fields
- ❌ Fail → Syntax exceeds ES2022; shows file/line

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

| Dimension       | Tool                 | Result             | Meets TARGET_BROWSERS? |
| --------------- | -------------------- | ------------------ | ---------------------- |
| 1. CSS features | doiuse               | (e.g., 2 warnings) | ✅ / ⚠️ list issues    |
| 2. JS syntax    | es-check             | (e.g., ES2020 ✅)  | ✅ / ❌                |
| 3. JS APIs      | eslint-plugin-compat | (e.g., 1 warning)  | ✅ / ⚠️ list issues    |

---

## Phase 2: Decide

**Goal:** Compare measurements to your requirements and decide next steps.

### Step 2.1: Review gaps

| Issue                     | Minimum Browser | Your Target  | Action                                     |
| ------------------------- | --------------- | ------------ | ------------------------------------------ |
| (e.g., Container Queries) | Chrome 105+     | Chrome 94+   | Remove feature / add fallback / accept gap |
| (e.g., Private fields #)  | Safari 15+      | Safari 15.4+ | ✅ Already supported                       |

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

### Step 3.0: Install tools (shared by 3A and 3B)

```powershell
# Skip if already installed in Phase 1
npm install -D eslint eslint-plugin-compat stylelint stylelint-no-unsupported-browser-features
```

Create `.browserslistrc` at project root:

```
# Copy TARGET_BROWSERS from Parameters section (one per line)
chrome >= 94
firefox >= 103
safari >= 15.4
edge >= 94
```

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
        "browsers": "$TARGET_BROWSERS",
        "severity": "warning"
      }
    ]
  }
}
```

> Replace `$TARGET_BROWSERS` with array from Parameters: `["chrome >= 94", "firefox >= 103", "safari >= 15.4", "edge >= 94"]`

> ⚠️ **Tool quirk:** VS Code Stylelint extension ignores `.browserslistrc`; use inline `browsers` array as shown.

#### 3A.2: JS syntax → Not needed

No dev-time check required. Build tools (Vite/Next.js) transpile syntax automatically based on their target config. Syntax is verified on build output in 3B.

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
npx doiuse --browsers "$TARGET_BROWSERS" "<BUILD_OUTPUT_CSS_PATH>"
```

#### 3B.2: JS syntax → es-check

Verifies bundler transpiled correctly to target ES level.

```powershell
npx es-check es2022 "<BUILD_OUTPUT_JS_PATH>"
```

#### 3B.3: JS APIs → eslint-plugin-compat

Catches runtime APIs from dependencies (e.g., a library using `structuredClone()`).

Add build output to `eslint.config.mjs`:

```javascript
import compat from 'eslint-plugin-compat';

export default [
  // 3A: Source code (from earlier)
  {
    files: ['src/**/*.{js,ts,jsx,tsx}', 'app/**/*.{js,ts,jsx,tsx}'],
    plugins: { compat },
    rules: { 'compat/compat': 'warn' },
  },

  // 3B: Build output
  {
    files: ['<BUILD_OUTPUT_JS_PATH>'], // e.g., ".next/static/chunks/**/*.js"
    plugins: { compat },
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    rules: { 'compat/compat': 'warn' },
  },
];
```

#### 3B.4: Add build verification script

```json
{
  "scripts": {
    "lint:compat:build": "npm run build && npx doiuse --browsers '$TARGET_BROWSERS' '<BUILD_OUTPUT_CSS_PATH>' && npx es-check es2022 '<BUILD_OUTPUT_JS_PATH>' && eslint '<BUILD_OUTPUT_JS_PATH>'"
  }
}
```

> Replace `$TARGET_BROWSERS` with comma-separated string from Parameters

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
        with: { node-version: '20' }
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

- [ ] `npm run build`
- [ ] CSS features: `npx doiuse --browsers "$TARGET_BROWSERS" "<CSS_PATH>"` (use comma-separated list)
- [ ] JS syntax: `npx es-check es2022 "<JS_PATH>"`
- [ ] JS APIs: (optional—covered fully in Phase 3)
- [ ] Document findings in table

### Phase 2: Decide

- [ ] Compare findings to TARGET_BROWSERS
- [ ] Note hard constraints (e.g., Tailwind v4)
- [ ] Decision: accept / fix / enforce

### Phase 3A: Development (source code)

- [ ] Create `.browserslistrc`
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
