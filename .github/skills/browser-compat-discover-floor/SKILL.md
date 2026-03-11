---
name: browser-compat-discover-floor
description: Discover how far back a project's shipped build output appears to work today across CSS features, JS syntax, and JS APIs. Use when a developer wants to answer: how much browser compatibility headroom does this build currently have?
license: MIT
metadata:
  author: project
  version: "1.0"
---

# Browser Compatibility: Discover Floor

Answer one question clearly: **how far back does this project's current shipped output appear to work today?**

This skill discovers an **observed floor**, not a promised contract.

---

## When to Use This Skill

Use this skill when a developer wants to:

- Learn how much incidental compatibility the current build has beyond its declared targets
- Compare actual support headroom before and after dependency or tooling changes
- Investigate whether the project could support older browsers than it currently claims
- Produce a standardized floor-discovery report for a project

Do **not** use this skill as the sole source of truth for what the project promises to support. That is the job of `browser-compat-verify-targets` and the project's declared contract.

---

## What This Skill Checks

- **CSS features** in emitted CSS
- **JS syntax** in emitted JS
- **JS APIs** referenced in emitted JS

## What This Skill Does Not Do

- Establish the project's browser support policy
- Guarantee future compatibility after dependencies or build settings change
- Replace enforcement setup

---

## Core Compatibility Model

Repeat these rules exactly in your reasoning:

1. **Build output is the source of truth.** Always build first and inspect emitted CSS and JS.
2. **CSS, JS syntax, and JS APIs are separate dimensions.** Discover their floors independently.
3. **Baseline is the preferred starting anchor.** If no explicit target exists, start from `baseline widely available`.
4. **Mobile browsers are mandatory.** Floor discovery must consider `and_chr`, `and_ff`, and `ios_saf` separately where browser families are tested.
5. **Observed floor is not a contract.** It is a snapshot of what this exact build appears to support today.

---

## Standard Output

Copy this skill's [FINDINGS_TEMPLATE.md](./FINDINGS_TEMPLATE.md) into the target project root as `browser-compat-discover-floor.md` and fill it in.

Keep the exact headings and tables. Replace placeholders only.

---

## Discovery Method

Use a **known anchor** and then move in the direction that reveals the boundary.

- If the starting anchor passes, move **downward** toward older support until first failure
- If the starting anchor fails, move **upward** toward newer support until first pass

This keeps the process practical and intuitive.

---

## Procedure

### Step 0: Resolve the build command

Use this priority order:

1. User-specified build command
2. `package.json#scripts.build`
3. Stop and ask if neither exists

### Step 1: Build fresh output

Run the build command and use the generated artifacts from that run.

### Step 2: Choose the discovery anchor

Resolve the initial anchor with this priority order:

1. User prompt
2. `.browserslistrc`
3. `package.json#browserslist`
4. Default: `baseline widely available`

If the anchor is Baseline syntax, resolve it to explicit browsers with:

```powershell
npx browserslist "baseline widely available"
```

Document the exact starting anchor.

### Step 3: Resolve output paths

Prefer these defaults when they match the project stack:

- `nextjs` -> JS: `.next/static/chunks/**/*.js`, CSS: `.next/static/css/**/*.css`
- `vite` -> JS: `dist/assets/**/*.js`, CSS: `dist/assets/**/*.css`

If the project is not clearly Next.js or Vite, inspect the build output and document the actual emitted JS and CSS paths used.

### Step 4: Discover the CSS floor profile

CSS floor discovery is **per browser family**, not one global number.

For each relevant browser family:

- `chrome`
- `and_chr`
- `firefox`
- `and_ff`
- `safari`
- `ios_saf`
- `edge`

Run `doiuse` on emitted CSS while varying only that browser family and keeping the other families fixed at the anchor.

Practical method:

1. Start from the anchor version for that family
2. If it passes, step older until first failure
3. If it fails, step newer until first pass
4. Refine around the boundary if needed

The last passing version is the **observed CSS floor** for that browser family.

### Step 5: Discover the JS syntax floor

JS syntax floor discovery is the cleanest case because syntax support maps well to ES levels.

Use `es-check` on emitted JS.

Practical method:

1. Choose an initial ES anchor
   - March 2026 Baseline anchor -> `es2023`
2. If that level passes, walk downward to older ES levels until first failure
3. If that level fails, walk upward to newer ES levels until first pass

Example sequence:

```powershell
npx es-check es2023 "<BUILD_OUTPUT_JS_PATH>"
npx es-check es2022 "<BUILD_OUTPUT_JS_PATH>"
npx es-check es2020 "<BUILD_OUTPUT_JS_PATH>"
npx es-check es2018 "<BUILD_OUTPUT_JS_PATH>"
```

The oldest passing ES level is the **observed JS syntax floor**.

### Step 6: Discover the JS API floor profile

JS API floor discovery is also **per browser family**, not one global number.

Run `eslint-plugin-compat` against emitted JS while varying one browser family at a time and keeping the others fixed at the anchor.

On Windows PowerShell, create a temporary flat config file per run if needed:

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

For each browser family:

1. Start from the anchor version
2. If it passes, step older until first failure
3. If it fails, step newer until first pass
4. Refine if needed

The last passing version is the **observed JS API floor** for that browser family.

### Step 7: Compute the overall observed floor summary

Summarize three things separately:

1. CSS floor profile by browser family
2. JS syntax floor as an ES level
3. JS API floor profile by browser family

Then state the **overall bottleneck profile**:

- the newest minimum browser versions required across CSS and JS APIs
- the oldest emitted syntax level that still passes

Do not compress everything into one misleading scalar if the dimensions differ.

### Step 8: Write the findings report

Copy this skill's template into the project root:

```powershell
Copy-Item "<SKILL_PATH>/FINDINGS_TEMPLATE.md" "./browser-compat-discover-floor.md"
```

Fill in the report exactly as structured.

### Step 9: Conclude clearly

End with a short warning:

- This floor is **observed**, not promised
- It may change after dependency, bundler, or config updates

If the goal is to turn this observed floor into an enforced policy, recommend `browser-compat-align-enforce`.

---

## Framework Notes

This skill is **framework-agnostic in principle** because it measures emitted browser code.

In practice, keep these common cases in mind:

- **Next.js** often already lowers syntax according to project browser targets
- **Vite** may require explicit `build.target` attention
- **Tailwind CSS v4** may create a harder CSS floor than the rest of the project

Document these as observations.
