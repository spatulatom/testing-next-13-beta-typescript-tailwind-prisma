---
name: browser-compat-align-enforce
description: Align a project's browser support contract with its build pipeline, static feedback, and build-output verification. Use when a developer wants the project to consistently target a chosen browser support policy and stop drifting.
license: MIT
metadata:
  author: project
  version: "1.0"
---

# Browser Compatibility: Align and Enforce

Answer one question clearly: **how do we make this project consistently target a chosen browser support contract and keep it from drifting?**

This skill is about **alignment first, enforcement second**.

---

## When to Use This Skill

Use this skill when a developer wants to:

- Apply or standardize browser targets across an existing project
- Fix misalignment between Browserslist, bundler targets, generated output, and static feedback
- Add ongoing browser-compat feedback and repeatable checks
- Turn a declared browser policy into a practical build and verification workflow

Do **not** use this skill when the only goal is to inspect current support. Use `browser-compat-verify-targets` first.

---

## What This Skill Changes

- Browser contract configuration
- Build pipeline target configuration
- Static feedback tooling for CSS and JS APIs
- Repeatable build-output verification scripts

## What This Skill Does Not Do

- Treat incidental compatibility as a required contract unless the user explicitly chooses that
- Replace build-output verification with source-only linting
- Assume every framework resolves targets the same way

---

## Core Compatibility Model

Repeat these rules exactly in your reasoning:

1. **Build output is the source of truth.** Always verify emitted CSS and JS after changes.
2. **CSS, JS syntax, and JS APIs are separate dimensions.** Align each dimension using the right mechanism.
3. **Baseline is the preferred default contract language.** If no explicit target exists, default to `baseline widely available`.
4. **Mobile browsers are mandatory.** Browser resolution must include `and_chr`, `and_ff`, and `ios_saf`.
5. **Authority differs by dimension.** Build config has primary authority over syntax and some CSS transforms. JS APIs usually need static feedback because bundlers do not downgrade runtime Web APIs.

---

## Standard Output

Copy this skill's [FINDINGS_TEMPLATE.md](./FINDINGS_TEMPLATE.md) into the target project root as `browser-compat-align-enforce.md` and fill it in.

Keep the exact headings and tables. Replace placeholders only.

---

## Procedure

### Step 0: Resolve the desired contract

Resolve `DESIRED_CONTRACT` using this priority order:

1. User prompt
2. `.browserslistrc`
3. `package.json#browserslist`
4. Default: `baseline widely available`

If the contract is Baseline syntax, resolve it to explicit browsers with:

```powershell
npx browserslist "baseline widely available"
```

Store that result as `EXPLICIT_BROWSERS`.

Also derive a syntax target representation for the build tool:

- Example Baseline anchor for March 2026 -> `es2023`
- If the tool expects browser targets instead of ES levels, use tool-native syntax and document it

### Step 1: Establish the current state

Prefer invoking `browser-compat-verify-targets` first.

If that skill is not available in the current workflow, reproduce its equivalent steps here:

1. Resolve the build command
2. Build fresh output
3. Verify emitted CSS, JS syntax, and JS APIs against the desired contract

This skill should begin from real build-output data, not assumptions.

### Step 2: Detect misalignment and hard constraints

Inspect relevant configuration and dependencies, including where present:

- `.browserslistrc`
- `package.json#browserslist`
- `next.config.*`
- `vite.config.*`
- Babel config
- PostCSS config
- direct `esbuild` or `swc` config
- Tailwind version

Record two things separately:

1. **Misalignment** -> the project declares one contract but tools are configured differently
2. **Hard constraints** -> dependencies or tools impose a stricter floor than the desired contract

Known example:

- **Tailwind CSS v4** may impose a harder CSS floor than the declared contract

### Step 3: Compute the effective enforceable contract

Keep these values distinct:

- `DESIRED_CONTRACT` -> what the team wants
- `EFFECTIVE_CONTRACT` -> what can actually be enforced today given hard constraints

If the project has conflicting support settings across tools, do **not** treat that as three valid contracts. Treat it as misalignment.

If a hard constraint is stricter than the desired contract, raise the effective contract conservatively and document why.

### Step 4: Align the build pipeline

Make the build pipeline honor the effective contract.

Common guidance:

- **Next.js** -> align `.browserslistrc` or `package.json#browserslist` for transpilation-related behavior
- **Vite** -> align Browserslist-style policy for shared tooling and align `build.target` for emitted syntax
- **Direct Babel / esbuild / SWC** -> set explicit targets in the tool's own format

Do not assume one config file controls every tool.

### Step 5: Add static feedback where it matters

Add preventive feedback for developers, but do not confuse feedback with proof.

#### CSS features

Use `stylelint-no-unsupported-browser-features` for authoring feedback.

Prefer inline browser targets when the extension or plugin ignores `.browserslistrc`.

#### JS syntax

Do **not** rely on source-level browser linting as the primary control.

Prefer the build target as the authority, then verify emitted JS with `es-check`.

#### JS APIs

Use `eslint-plugin-compat` because transpilers usually do not downgrade runtime Web APIs.

This is the main preventive control for browser API compatibility during development.

### Step 6: Add build-output verification gates

Add repeatable scripts that re-check emitted assets after a build.

Typical script set:

- `compat:css`
- `compat:syntax`
- `compat:apis`
- optional `compat:check` to run build plus all three checks

Use the resolved contract for CSS and JS APIs, and the derived syntax target for `es-check`.

### Step 7: Rebuild and re-verify

Run a fresh build and then re-run `browser-compat-verify-targets` or its equivalent verification steps.

The project is not aligned until the emitted output passes.

### Step 8: Conclude clearly

End with one of these outcomes:

- `Aligned` -> desired and effective contract now match and verification passes
- `Aligned with constraint` -> verification passes, but a hard floor forced a stricter effective contract
- `Not aligned` -> configuration or output still misses the effective contract

If the user wants to preserve extra incidental headroom beyond the effective contract, recommend `browser-compat-discover-floor` as a separate decision aid.

---

## Framework Notes

This skill is **framework-agnostic in principle**, but it should be practical for common stacks.

Keep these common cases in mind:

- **Next.js** often hides most syntax lowering behind its own build pipeline
- **Vite** often needs an explicit `build.target` decision
- **Tailwind CSS v4** can raise the effective CSS floor regardless of declared policy

Prefer pragmatic, stack-aware alignment over fake neutrality.
