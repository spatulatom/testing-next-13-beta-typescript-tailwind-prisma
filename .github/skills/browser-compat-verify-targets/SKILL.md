---
name: browser-compat-verify-targets
description: Verify that a project's shipped build output meets its declared browser support contract across CSS features, JS syntax, and JS APIs. Use when a developer wants to answer: does this project support the browsers we want?
license: MIT
metadata:
  author: project
  version: "1.0"
---

# Browser Compatibility: Verify Targets

Answer one question clearly: **does this project's shipped output meet its declared browser support contract?**

This skill verifies **build output**, not authoring source files.

---

## When to Use This Skill

Use this skill when a developer wants to:

- Check whether the current project supports the browsers it intends to support
- Audit a fresh or existing project before making browser support changes
- Validate a build after changing config, dependencies, or browser targets
- Produce a standardized compatibility report for a project

Do **not** use this skill to discover extra incidental compatibility beyond the declared target. That is the job of `browser-compat-discover-floor`.

---

## What This Skill Checks

- **CSS features** in emitted CSS
- **JS syntax** in emitted JS
- **JS APIs** referenced in emitted JS

## What This Skill Does Not Check

- Source-only authoring code as the final authority
- Historical or accidental compatibility beyond the declared contract
- Ongoing linting or CI enforcement setup

---

## Core Compatibility Model

Repeat these rules exactly in your reasoning:

1. **Build output is the source of truth.** Always build first and inspect emitted CSS and JS.
2. **CSS, JS syntax, and JS APIs are separate dimensions.** Measure them independently.
3. **Baseline is the preferred default contract language.** If no explicit target exists, use `baseline widely available`.
4. **Mobile browsers are mandatory.** Browser resolution must include `and_chr`, `and_ff`, and `ios_saf` alongside desktop browsers.
5. **Tooling authority differs by dimension.** Syntax is mainly controlled by the build pipeline. JS APIs usually require static analysis and developer discipline. Final proof still comes from build output.

---

## Standard Output

Copy this skill's [FINDINGS_TEMPLATE.md](./FINDINGS_TEMPLATE.md) into the target project root as `browser-compat-verify-targets.md` and fill it in.

Keep the exact headings and tables. Replace placeholders only.

---

## Procedure

### Step 0: Resolve the target contract

Resolve `TARGET_BROWSERS` using this priority order:

1. User prompt
2. `.browserslistrc`
3. `package.json#browserslist`
4. Default: `baseline widely available`

Record which source was used.

If the resolved contract mentions desktop browsers only, expand it to include mobile equivalents:

- `chrome` -> `and_chr`
- `firefox` -> `and_ff`
- `safari` -> `ios_saf`

If the contract is Baseline syntax, resolve it to an explicit browser string:

```powershell
npx browserslist "baseline widely available"
```

Store that result as `EXPLICIT_BROWSERS` and document it.

### Step 1: Resolve the build command

Use this priority order:

1. User-specified build command
2. `package.json#scripts.build`
3. Stop and ask if neither exists

Do not inspect stale output unless the user explicitly asks for a no-build audit.

### Step 2: Build fresh output

Run the resolved build command and use the generated artifacts from that run.

### Step 3: Resolve output paths

Prefer these defaults when they match the project stack:

- `nextjs` -> JS: `.next/static/chunks/**/*.js`, CSS: `.next/static/css/**/*.css`
- `vite` -> JS: `dist/assets/**/*.js`, CSS: `dist/assets/**/*.css`

If the project is not clearly Next.js or Vite, inspect the build output and document the actual emitted JS and CSS paths used. Do not guess silently.

### Step 4: Verify CSS features against the target contract

Run `doiuse` on emitted CSS using the explicit browser string:

```powershell
npx doiuse --browsers "$EXPLICIT_BROWSERS" "<BUILD_OUTPUT_CSS_PATH>"
```

Interpretation:

- No warnings -> CSS meets the declared contract
- Warnings -> emitted CSS requires newer browsers than the contract for at least one feature

### Step 5: Verify JS syntax against the target contract

This skill does **not** discover the lowest passing syntax floor. It verifies only the minimum syntax level required by the declared contract.

Derive `REQUIRED_ES_LEVEL` as follows:

1. If the project already exposes a concrete JS target used by the bundler, prefer that and document it
2. If the contract is `baseline widely available`, use the conservative Baseline anchor for the current year
   - March 2026 -> `es2023`
3. If the contract is an explicit browser list, choose the conservative ES level compatible with the oldest target browsers and document the reasoning

Then run:

```powershell
npx es-check <REQUIRED_ES_LEVEL> "<BUILD_OUTPUT_JS_PATH>"
```

Interpretation:

- Pass -> emitted JS syntax is acceptable for the declared contract
- Fail -> the build emits syntax too new for the declared contract

### Step 6: Verify JS APIs against the target contract

JS APIs are different from syntax: bundlers usually do not downgrade runtime Web APIs.

Run `eslint-plugin-compat` against emitted JS. On Windows PowerShell, create a temporary flat config file:

```powershell
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

Interpretation:

- No warnings -> emitted JS APIs meet the declared contract
- Warnings -> emitted runtime APIs require newer browsers or polyfills

### Step 7: Write the findings report

Copy this skill's template into the project root:

```powershell
Copy-Item "<SKILL_PATH>/FINDINGS_TEMPLATE.md" "./browser-compat-verify-targets.md"
```

Fill in the report exactly as structured.

### Step 8: Conclude clearly

End with one of these outcomes:

- `Pass` -> all three dimensions meet the declared contract
- `Pass with gaps` -> gaps exist but are accepted and documented
- `Fail` -> one or more dimensions miss the declared contract

If the project needs alignment or ongoing enforcement, recommend `browser-compat-align-enforce`.

---

## Framework Notes

This skill is **framework-agnostic in principle** because it validates emitted browser code.

In practice, keep these common cases in mind:

- **Next.js** commonly respects Browserslist for JS transpilation
- **Vite** often needs separate attention for `build.target`
- **Tailwind CSS v4** may impose a harder CSS floor than the declared browser contract

Document these as findings, not assumptions.
