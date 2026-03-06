# Universal LLM Agent Instructions: Vite + Tailwind CSS v4

**Structured using the 8-Category Prompt Engineering Framework**

---

## Table of Contents

- [Quick Reference (Cheat Sheet)](#quick-reference-cheat-sheet)
- [0. Execution Contract (Meta-Layer)](#0-execution-contract-meta-layer)
- [1. Goal](#1-goal)
- [2. Context](#2-context)
- [3. Constraints](#3-constraints)
  - [3.1. Utility-First HTML](#31-utility-first-html)
  - [3.2. Tailwind v4 Tokens](#32-tailwind-v4-tokens)
  - [3.3. Arbitrary Values Prohibition](#33-arbitrary-values-prohibition)
  - [3.4. Semantic HTML5 Structure](#34-semantic-html5-structure)
  - [3.5. Accessibility Requirements](#35-accessibility-requirements)
  - [3.6. Height & Dimension Rules](#36-height--dimension-rules)
  - [3.7. CSS Architecture](#37-css-architecture)
- [4. Procedure](#4-procedure)
  - [4.1. The 4-Stage Development Workflow](#41-the-4-stage-development-workflow)
  - [4.2. MCP Server Usage Strategy](#42-mcp-server-usage-strategy)
  - [4.3. Token Decision Procedure](#43-token-decision-procedure)
  - [4.4. Figma-to-Tailwind Translation](#44-figma-to-tailwind-translation)
  - [4.5. Self-Correction Protocol](#45-self-correction-protocol)
- [5. Output Contract](#5-output-contract)
- [6. Examples](#6-examples)
  - [6.1. Utility-First vs Custom Classes](#61-utility-first-vs-custom-classes)
  - [6.2. Tailwind v4 Tokens](#62-tailwind-v4-tokens)
  - [6.3. Arbitrary Values Anti-Patterns](#63-arbitrary-values-anti-patterns)
  - [6.4. Semantic HTML Structure](#64-semantic-html-structure)
  - [6.5. Contact Information](#65-contact-information)
  - [6.6. Height & Layout Patterns](#66-height--layout-patterns)
- [7. Checklist](#7-checklist)
  - [7.1. Pre-Flight Checklist](#71-pre-flight-checklist)
  - [7.2. Implementation Checklist](#72-implementation-checklist)
  - [7.3. Height Audit Checklist](#73-height-audit-checklist)

---

## Quick Reference (Cheat Sheet)

> **Note:** This condensed reference is for quick lookup. All rules are fully documented in their respective category sections below.

### 🚨 Most Violated Rules

| ❌ **VIOLATION**                   | ✅ **CORRECT APPROACH**                                       | **See Section** |
| ---------------------------------- | ------------------------------------------------------------- | --------------- |
| `<div class="hero-section">`       | `<div class="bg-brand-primary text-text-light px-4 py-12">`   | §3.1            |
| `text-md` (INVALID CLASS!)         | `text-sm`, `text-base`, `text-lg`, etc.                       | §3.3            |
| `min-h-[200px]` or `min-h-[250px]` | `min-h-48` or `min-h-64` (Tailwind scale)                     | §3.3            |
| `top-[554px]` or `left-[343px]`    | `flex items-center justify-center`                            | §3.3            |
| `:root { --color-primary: #000; }` | `@theme { --color-brand-primary: #000; }`                     | §3.2            |
| `h-[500px]` or `h-screen` (fixed)  | `min-h-screen` or `py-16` (flexible height)                   | §3.6            |
| Missing `<header>` and `<main>`    | Always use semantic HTML5 structure                           | §3.4            |
| `<p>Zadzwoń: 696 482 661</p>`      | `<a href="tel:+48696482661" aria-label="...">696 482 661</a>` | §3.5            |
| Missing `alt` attributes           | All images need descriptive `alt` text                        | §3.5            |

### ⚡ Critical Decision Points

| **WHEN YOU SEE THIS** | **ASK YOURSELF**                           | **ACTION**                                  |
| --------------------- | ------------------------------------------ | ------------------------------------------- |
| About to type `[...]` | "Am I copying pixels from Figma?"          | If YES → STOP. Use flexbox/grid instead     |
| Writing a CSS class   | "Can I use 3 or fewer Tailwind utilities?" | If YES → Use utilities in HTML directly     |
| About to type `h-`    | "Is this a content section or image?"      | Content → `min-h-*`; Image → See §4.4       |
| Adding a color        | "Is this a color?"                         | ALWAYS token, NEVER arbitrary value         |
| Writing phone number  | "Should this be clickable?"                | YES → Use `<a href="tel:...">`, NEVER `<p>` |

### 📱 Asset Organization (By Stage)

| **STAGE**         | **IMAGE LOCATION**        | **EXAMPLE PATH**                          |
| ----------------- | ------------------------- | ----------------------------------------- |
| Stage 1 (Mobile)  | `/public/images/mobile/`  | `<img src="/images/mobile/hero-bg.png">`  |
| Stage 1 (Shared)  | `/public/images/shared/`  | `<img src="/images/shared/logo.svg">`     |
| Stage 3 (Desktop) | `/public/images/desktop/` | `<img src="/images/desktop/hero-bg.png">` |

---

## 0. Execution Contract (Meta-Layer)

> **Purpose:** This section defines the standard workflow for EVERY task. Consult this FIRST before starting any work.

### Default Workflow

1. **Identify Stage** → Check `CURRENT_STAGE` in Context (§2) to determine mobile vs desktop focus
2. **Extract Design** → Call Figma MCP with stage-appropriate `dirForAssetWrites` parameter
3. **Implement** → Build using Tailwind utilities first; create tokens ONLY for colors and brand elements
4. **Validate** → Run `npm run dev`; if `CHROME_MCP_ENABLED: true`, validate with Chrome MCP
5. **Report** → Provide response per Output Contract (§5)

### Priority Order (Conflict Resolution)

When two rules conflict, follow this hierarchy:

```
Accessibility > Semantic HTML > Design Tokens > Pixel Perfection
```

### When to Stop and Ask

- Design intent is ambiguous (e.g., unclear spacing, missing mobile/desktop variant)
- Implementation requires violating a Constraint (§3)
- User request contradicts established project patterns
- Multiple valid approaches exist with significant trade-offs

### Standard Inputs Expected

- Target page/section to implement
- Current stage (1-4)
- Figma frame reference (if applicable)

### Validation Requirements

Before marking any task complete:

- Zero arbitrary values in HTML (except documented exceptions)
- All sections have accessible names
- Semantic HTML5 structure verified
- Build passes without errors

---

## 1. Goal

> **Purpose:** Outcome-based success criteria. These define WHAT to achieve, not HOW.

Ship a production-ready website that is:

- **Visually Faithful** — Matches Figma design intent (not pixel-perfect copying)
- **WCAG AA Compliant** — Meets accessibility standards for color contrast, keyboard navigation, screen readers
- **Semantically Structured** — Proper HTML5 landmarks (`<header>`, `<main>`, `<footer>`, `<section>`, `<nav>`)
- **Fully Responsive** — Works fluidly from 320px to 2000px+ viewports
- **Utility-First** — Built with Tailwind v4 methodology; minimal custom CSS

---

## 2. Context

> **Purpose:** Facts about the environment, tools, and capabilities. These are declarations, not rules.

### 2.1. Available Configuration Options

```yaml
# Design System Options
DESIGN_TOOL: "Figma" | "Sketch" | "Adobe XD" | "Static Images"
DESIGN_MOBILE_WIDTH: 375
DESIGN_DESKTOP_WIDTH: 1440
DESIGN_FRAME_STRUCTURE: "frames" | "semantic-names" | "artboards"

# MCP Servers Options
FIGMA_MCP_URL: "http://127.0.0.1:3845/mcp"
CHROME_MCP_ENABLED: true | false

# Asset Management Options
DOWNLOAD_ASSETS: true | false

# Project Settings Options
PRIMARY_LANGUAGE: "en" | "pl" | "es" | "fr" | "de" | "it" | etc.
CONTENT_TYPE: "landing-page" | "multi-page" | "blog" | "e-commerce"
WORKFLOW_APPROACH: "staged-approval"
CURRENT_STAGE: "1" | "2" | "3" | "4"
```

### 2.2. Current Project Settings

```yaml
# Current Project Configuration
DESIGN_TOOL: "Figma"
DESIGN_MOBILE_WIDTH: 375
DESIGN_DESKTOP_WIDTH: 1440
DESIGN_FRAME_STRUCTURE: "frames"
DESIGN_MOBILE_URL: "https://www.figma.com/design/5IL7P5KfxW2xLt8wsrxrUf/osteo-v3?node-id=538-82&m=dev"
DESIGN_DESKTOP_URL: "https://www.figma.com/design/5IL7P5KfxW2xLt8wsrxrUf/osteo-v3?node-id=538-3&m=dev"
FIGMA_MCP_URL: "http://127.0.0.1:3845/mcp"
CHROME_MCP_ENABLED: true
DOWNLOAD_ASSETS: true
PRIMARY_LANGUAGE: "pl"
CONTENT_TYPE: "landing-page"
WORKFLOW_APPROACH: "staged-approval"
CURRENT_STAGE: "3"
CSS_FRAMEWORK: "tailwind-v4"
BUILD_TOOL: "vite"
JS_FRAMEWORK: "vanilla"
```

### 2.3. MCP Server Availability

| **SERVER**     | **PURPOSE**                                          | **AVAILABLE** |
| -------------- | ---------------------------------------------------- | ------------- |
| **Figma MCP**  | Design extraction, asset downloads, frame comparison | ALL STAGES    |
| **Chrome MCP** | Implementation validation, accessibility testing     | ALL STAGES    |

**Critical:** Figma MCP REQUIRES `dirForAssetWrites` parameter for asset downloads.

---

## 3. Constraints

> **Purpose:** Invariants that MUST remain true. These restrict the solution space.

### 3.1. Utility-First HTML

**MUST:** Style elements by composing Tailwind utility classes in the `class="..."` attribute.

**NEVER:** Create custom CSS classes for styling that can be achieved with utilities.

**Rule:** Only create a component class (`@layer components`) if:

- Pattern requires 5+ utility classes AND
- Pattern is repeated 3+ times in HTML

### 3.2. Tailwind v4 Tokens

**MUST:** Define all design tokens in the `@theme` directive in `src/style.css`.

**MUST:** Use generated utility classes from tokens in HTML (e.g., `bg-brand-primary`).

**NEVER:** Use `:root` CSS variables for design tokens.

**NEVER:** Use inline `style="var(--token)"` — this bypasses utility-first methodology.

**MUST:** ALL colors be defined as tokens. No arbitrary color values in HTML.

### 3.3. Arbitrary Values Prohibition

**NEVER:** Use arbitrary values (`[...]`) for:

- Positioning: `top-[554px]`, `left-[343px]` → Use flexbox/grid
- Min-heights: `min-h-[200px]`, `min-h-[250px]` → Use `min-h-48`, `min-h-64`
- Widths: `w-[343px]`, `w-[150px]` → Use `max-w-sm`, `w-36`
- Font sizes: `text-[17px]` → Use `text-base`, `text-lg`

**CRITICAL:** `text-md` IS NOT A VALID TAILWIND CLASS. Use: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, etc.

**Allowed exceptions:**

- Brand-specific values defined as tokens in `@theme`
- One-off layout requirements documented in code comments

### 3.4. Semantic HTML5 Structure

**MUST:** Structure every page with:

- Single `<header>` containing `<nav aria-label="...">`
- Single `<main>` wrapping all content sections
- `<section aria-label="...">` for each content area
- `<h1 class="sr-only">` for SEO + visible `<h2>` headings
- Single `<footer>` element

**MUST:** Use `<address class="not-italic">` for physical addresses, not `<div>` or `<p>`.

### 3.5. Accessibility Requirements

**MUST:** Every `<section>` element have an accessible name via:

- Preferred: Visible heading (`<h2>`, `<h3>`, etc.) inside the section
- Alternative: `aria-label="Descriptive name"` if no visible heading

**MUST:** All images have `alt` attributes:

- Informative images: Descriptive `alt` text
- Decorative images: `alt="" aria-hidden="true"`

**MUST:** Phone numbers use `<a href="tel:+48XXXXXXXXX">` with `aria-label="Call [full number]"`.

**MUST:** External links include `target="_blank" rel="noopener noreferrer"`.

**MUST:** Interactive elements have minimum touch target of 44×44px on mobile.

### 3.6. Height & Dimension Rules

**MUST:** Use `min-h-*` (not `h-*`) for all content sections to allow content growth.

**NEVER:** Use fixed `h-screen` for content sections — content may overflow.

**Allowed fixed heights (`h-*`):**

- Navigation bars: `<nav class="h-16">`
- Logos/icons: `<img class="w-12 h-12">` (prevent CLS)
- Image containers: `<div class="h-64">` with `object-cover`
- Decorative elements: `<div class="h-1">` (dividers)

### 3.7. CSS Architecture

**MUST:** Keep `@layer components` under 50 lines total.

**MUST:** Place all design tokens in `@theme` directive.

**MUST:** Follow this `src/style.css` structure:

```css
@import "tailwindcss";

@theme {
  /* Design tokens here */
}

@layer base {
  /* Minimal base resets only */
}

@layer components {
  /* Only patterns repeated 3+ times with 5+ utilities */
}
```

---

## 4. Procedure

> **Purpose:** Step-by-step instructions, decision trees, and workflows. These show HOW to execute work.

### 4.1. The 4-Stage Development Workflow

Follow this sequential process. Do not proceed to the next stage without explicit user approval.

#### Stage 1: Mobile Overall Design

**Goal:** Implement complete mobile layout at `{DESIGN_MOBILE_WIDTH}px`.

**Actions:**

1. Call Figma MCP for mobile design data with `dirForAssetWrites: "/public/images/mobile/"`
2. Download shared assets to `/public/images/shared/`
3. Implement mobile-first HTML with Tailwind utilities
4. If `CHROME_MCP_ENABLED: true`: Validate against Figma design

**Deliverable:** Mobile experience that is visually faithful, WCAG AA compliant, and semantically structured.

#### Stage 2: Mobile Component Refinement

**Goal:** Perfect each section of mobile design.

**Actions:**

1. If new session: Re-extract mobile design from Figma MCP
2. Perform frame-by-frame comparison
3. Validate across 320-768px viewports
4. Use Chrome MCP for accessibility compliance

**Validation Criteria:**

- ✅ Each section matches corresponding Figma frame
- ✅ Spacing, typography, alignment consistent
- ✅ No layout breaks between 320-768px
- ✅ Zero arbitrary values in HTML

**Deliverable:** Pixel-perfect-ish mobile experience with WCAG AA compliance.

#### Stage 3: Desktop Overall Design

**Goal:** Adapt layout for tablet and desktop at `{DESIGN_DESKTOP_WIDTH}px`.

**Actions:**

1. Call Figma MCP for desktop design data with `dirForAssetWrites: "/public/images/desktop/"`
2. Add responsive breakpoint utilities (`md:`, `lg:`, `xl:`)
3. If `CHROME_MCP_ENABLED: true`: Validate desktop adaptation

**Deliverable:** Responsive layout working fluidly from mobile to desktop.

#### Stage 4: Desktop Component Refinement

**Goal:** Fine-tune desktop experience details.

**Actions:**

1. If new session: Re-extract desktop design from Figma MCP
2. Perform frame-by-frame comparison
3. Validate across 768px-2000px+ viewports
4. Use Chrome MCP for final validation

**Validation Criteria:**

- ✅ Each section matches corresponding Figma frame
- ✅ No layout breaks between 768px-2000px+
- ✅ WCAG AA compliance maintained
- ✅ Zero arbitrary values in HTML

**Deliverable:** Production-ready, fully responsive, WCAG AA compliant website.

### 4.2. MCP Server Usage Strategy

#### Implementation Stages (1 & 3)

```
1. Figma MCP → Extract design + download assets (REQUIRED)
2. Code → Implement with Tailwind utilities
3. Figma MCP → Frame comparison for accuracy
4. Chrome MCP → Validate implementation
5. Iterate → Refine based on feedback
```

#### Refinement Stages (2 & 4)

```
1. Figma MCP → Re-extract if new session OR frame comparison
2. Chrome MCP → Validate current quality
3. Code → Fine-tune with utilities
4. Figma MCP → Compare refined sections
5. Chrome MCP → Final validation
```

### 4.3. Token Decision Procedure

Use this decision tree when encountering a design value:

```
STEP 1: Is this a COLOR?
  ├─ YES → ALWAYS create token in @theme (no exceptions)
  └─ NO → Continue to STEP 2

STEP 2: Is this a BRAND element (logo size, specific spacing)?
  ├─ YES → Create token in @theme
  └─ NO → Continue to STEP 3

STEP 3: Does exact value exist in Tailwind scale?
  ├─ YES → Use Tailwind utility directly
  └─ NO → Continue to STEP 4

STEP 4: Is this value repeated 3+ times?
  ├─ YES → Create token in @theme
  └─ NO → Use CLOSEST Tailwind utility (embrace the difference)
```

**Tailwind Spacing Scale Reference:**
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px

**Min-Height Scale Reference:**

- `min-h-48` = 192px (use for ~200px)
- `min-h-64` = 256px (use for ~250px)
- `min-h-96` = 384px (exact match)

### 4.4. Figma-to-Tailwind Translation

**Cardinal Rule:** Treat Figma as a visual reference, NOT code to copy.

| **Figma Shows**                  | **❌ DON'T Copy**     | **✅ DO Instead**              |
| -------------------------------- | --------------------- | ------------------------------ |
| `position: absolute; top: 554px` | `top-[554px]`         | `flex flex-col justify-center` |
| `width: 343px`                   | `w-[343px]`           | `max-w-sm` (384px)             |
| `height: 500px`                  | `h-[500px]`           | `min-h-screen` or `py-16`      |
| `margin-top: 44px`               | `mt-[44px]`           | `mt-11` (2.75rem = 44px)       |
| `padding: 12px 36px`             | `px-[36px] py-[12px]` | `px-9 py-3`                    |

**Element Dimension Strategy:**

| **Element Type**    | **Width Strategy**            | **Height Strategy**                  |
| ------------------- | ----------------------------- | ------------------------------------ |
| Content sections    | `w-full` + `max-w-*` + `px-*` | `min-h-*` or `py-*` (content-driven) |
| Cards               | Grid/flex child sizing        | `min-h-*` or auto                    |
| Images (responsive) | `w-full` or percentage        | `h-auto` or `aspect-*`               |
| Images (fixed)      | `w-*` utility                 | `h-*` utility (prevent CLS)          |
| Icons/logos         | `w-*` + `h-*` utilities       | Match width for aspect ratio         |
| Buttons             | `px-*` (content-driven)       | `py-*` + `min-h-*` (touch target)    |

### 4.5. Self-Correction Protocol

**Trigger:** Before submitting ANY code, perform this mental check:

#### Arbitrary Value Pause

The instant you type `[` in a class attribute — STOP and ask:

1. "Am I copying pixel positions from Figma?"
   - If YES → Rebuild with flexbox/grid
2. "Is this for absolute positioning?"
   - If YES → Can I use flexbox/grid? (99% answer is YES)
3. "Does this exact value appear 3+ times?"
   - If NO → Use closest Tailwind utility
   - If YES → Create a token
4. "Is this a `min-h-[...]` value?"
   - If YES → FORBIDDEN. Use `min-h-48`, `min-h-64`, `min-h-96`

#### Violation Detection Triggers

| **If you notice...**                | **STOP and...**                          |
| ----------------------------------- | ---------------------------------------- |
| `class="hero-section"` or similar   | Replace with Tailwind utilities          |
| `min-h-[` anywhere                  | Use Tailwind min-h scale                 |
| `text-md` anywhere                  | INVALID! Use `text-base`, `text-lg`, etc |
| `h-screen` on content section       | Change to `min-h-screen`                 |
| Phone number in `<p>` or `<span>`   | Change to `<a href="tel:...">`           |
| `<div>` containing address          | Change to `<address>`                    |
| `<section>` without accessible name | Add heading or `aria-label`              |

---

## 5. Output Contract

> **Purpose:** Defines what the agent MUST deliver/report in every response.

### After Each Task, Report:

1. **Files Changed**
   - List each file with brief description of changes
   - Format: `- [filename](path): description`

2. **Commands Run**
   - Dev server: `npm run dev`
   - Validation results (pass/fail)

3. **Validation Status**
   - Checklist items verified (reference §7)
   - Any WCAG issues found/resolved

4. **Follow-ups Needed**
   - Unresolved issues
   - Questions requiring user input
   - Recommended next steps

5. **Screenshots/MCP Results** (if `CHROME_MCP_ENABLED: true`)
   - Chrome MCP validation output
   - Visual comparison notes

### Response Format Template

```markdown
## Changes Made

- [index.html](index.html): Added hero section with semantic structure
- [src/style.css](src/style.css): Added brand color tokens

## Validation

- ✅ Build passed
- ✅ Zero arbitrary values
- ✅ All sections have accessible names
- ⚠️ [Issue description if any]

## Follow-ups

- [Any questions or next steps]
```

---

## 6. Examples

> **Purpose:** Concrete ❌ WRONG / ✅ CORRECT patterns to imitate or avoid.

### 6.1. Utility-First vs Custom Classes

**❌ WRONG — Custom CSS class:**

```html
<section class="hero-section">
  <h1 class="main-title">Your Hero Title</h1>
</section>
```

**✅ CORRECT — Tailwind utilities:**

```html
<section
  class="bg-brand-primary flex flex-col items-center gap-6 px-4 py-12 text-white"
>
  <h1 class="text-hero-title text-center font-bold">Your Hero Title</h1>
</section>
```

### 6.2. Tailwind v4 Tokens

**❌ WRONG — Using :root variables:**

```css
:root {
  --color-primary: #0192bc;
}
```

```html
<div style="background-color: var(--color-primary)">...</div>
```

**✅ CORRECT — Using @theme directive:**

```css
@theme {
  --color-brand-primary: #0192bc;
}
```

```html
<div class="bg-brand-primary">...</div>
```

### 6.3. Arbitrary Values Anti-Patterns

**❌ WRONG — Copying Figma positions:**

```html
<div class="absolute top-[554px] left-1/2">Text</div>
<h1 class="absolute top-[588px] left-1/2">Title</h1>
```

**✅ CORRECT — Semantic flexbox layout:**

```html
<section
  class="flex min-h-screen flex-col items-center justify-center space-y-4 px-4"
>
  <div class="space-y-4 text-center">
    <p>Text</p>
    <h1>Title</h1>
  </div>
</section>
```

**❌ WRONG — Arbitrary min-height:**

```html
<div class="min-h-[200px] md:min-h-[250px]"></div>
```

**✅ CORRECT — Tailwind scale:**

```html
<div class="min-h-48 md:min-h-60">
  <!-- min-h-48 = 192px (4% difference from 200px - acceptable!) -->
</div>
```

**❌ WRONG — Invalid text-md class:**

```html
<p class="text-md">Some text</p>
```

**✅ CORRECT — Valid text size:**

```html
<p class="text-base">Some text</p>
<!-- Or text-sm, text-lg, text-xl, etc. -->
```

### 6.4. Semantic HTML Structure

**❌ WRONG — No semantic landmarks:**

```html
<body>
  <div class="nav">...</div>
  <section>...</section>
  <section>...</section>
  <div class="footer">...</div>
</body>
```

**✅ CORRECT — Full semantic structure:**

```html
<body>
  <header>
    <nav aria-label="Main navigation">...</nav>
  </header>
  <main>
    <h1 class="sr-only">Page Title for SEO</h1>
    <section aria-label="Hero">
      <h2>Visible Heading</h2>
      ...
    </section>
    <section aria-label="Services">
      <h2>Our Services</h2>
      ...
    </section>
  </main>
  <footer>...</footer>
</body>
```

### 6.5. Contact Information

**❌ WRONG — Non-interactive contact info:**

```html
<div>
  <p class="font-bold">Adres:</p>
  <p>ul. Główna 1, Wrocław</p>
  <p>telefon: 696 482 661</p>
</div>
```

**✅ CORRECT — Interactive and semantic:**

```html
<address class="space-y-2 text-base not-italic">
  <p class="font-bold">Adres:</p>
  <p>ul. Główna 1, Wrocław</p>
  <p>
    telefon:
    <a
      href="tel:+48696482661"
      class="hover:text-brand-primary underline"
      aria-label="Zadzwoń pod numer 696 482 661"
    >
      696 482 661
    </a>
  </p>
</address>
```

### 6.6. Height & Layout Patterns

**❌ WRONG — Fixed h-screen on content:**

```html
<!-- DANGEROUS: Content will be cut off if it exceeds viewport -->
<section class="h-screen">
  <h1>Long Title</h1>
  <p>Very long content that might exceed screen height...</p>
</section>
```

**✅ CORRECT — Flexible min-h-screen:**

```html
<!-- SAFE: Section grows if content exceeds viewport -->
<section class="min-h-screen">
  <h1>Long Title</h1>
  <p>Very long content that can safely expand...</p>
</section>
```

**✅ ALLOWED — Fixed height for specific elements:**

```html
<!-- Navigation with known fixed height -->
<nav class="h-16">...</nav>

<!-- Logo/icon with fixed dimensions (prevents CLS) -->
<img class="h-12 w-12" src="/images/logo.svg" alt="Company Logo" />

<!-- Image container with aspect ratio -->
<div class="h-64 w-full">
  <img class="h-full w-full object-cover" src="..." alt="..." />
</div>

<!-- Decorative divider -->
<div class="h-1 w-full bg-gray-200"></div>
```

---

## 7. Checklist

> **Purpose:** Verification steps to confirm work is complete. This is the "definition of done."

### 7.1. Pre-Flight Checklist

**Before writing ANY code, verify:**

- [ ] Read and understood Execution Contract (§0)
- [ ] Checked `CURRENT_STAGE` in Context (§2.2)
- [ ] Checked `CHROME_MCP_ENABLED` status
- [ ] Understand difference between `min-h-48` and `min-h-[200px]`
- [ ] Know that `text-md` is INVALID

**❌ If you write `min-h-[` or `text-md` anywhere → You skipped this checklist!**

### 7.2. Implementation Checklist

**After implementing, verify ALL items:**

#### Semantic Structure

- [ ] Single `<header>` with `<nav aria-label="...">`
- [ ] Single `<main>` wrapping all content
- [ ] Each `<section>` has accessible name (heading or `aria-label`)
- [ ] `<h1 class="sr-only">` present for SEO
- [ ] Single `<footer>` element

#### Accessibility

- [ ] All images have appropriate `alt` attributes
- [ ] Phone numbers use `<a href="tel:...">` with `aria-label`
- [ ] Addresses use `<address>` element
- [ ] External links have `target="_blank" rel="noopener noreferrer"`
- [ ] Touch targets minimum 44×44px on mobile
- [ ] Color contrast meets WCAG AA (4.5:1 for text)

#### Utility-First Compliance

- [ ] Zero arbitrary values in HTML (except documented exceptions)
- [ ] No `min-h-[...]` patterns
- [ ] No `text-md` (invalid class)
- [ ] No custom CSS classes for simple styling
- [ ] All colors are tokens (no arbitrary colors)

#### Height Strategy

- [ ] Content sections use `min-h-*`, not `h-*`
- [ ] No `h-screen` on content sections (use `min-h-screen`)
- [ ] Fixed `h-*` only on: nav bars, logos, image containers, decorative elements

#### Build & Validation

- [ ] `npm run dev` runs without errors
- [ ] No console errors in browser
- [ ] Responsive from 320px to 2000px+

### 7.3. Height Audit Checklist

**Mandatory audit for every `h-` class:**

For each `h-*` or `h-[*]` in HTML, verify it belongs to an allowed category:

| **Category**        | **Allowed Pattern**    | **Example**               |
| ------------------- | ---------------------- | ------------------------- |
| Navigation          | `h-14`, `h-16`, `h-20` | `<nav class="h-16">`      |
| Logos/Icons         | `h-8` to `h-16`        | `<img class="h-12 w-12">` |
| Image containers    | `h-48`, `h-64`, `h-96` | `<div class="h-64">`      |
| Decorative elements | `h-px`, `h-0.5`, `h-1` | `<div class="h-1">`       |

**If `h-*` doesn't fit these categories → Change to `min-h-*` or use padding**

---

## Appendix: CSS File Template

For reference, `src/style.css` should follow this structure:

```css
@import "tailwindcss";

/* ============================================
   DESIGN TOKENS (from Figma)
   ============================================ */
@theme {
  /* Colors - MUST define ALL colors here */
  --color-brand-primary: #0192bc;
  --color-brand-secondary: #005f7f;
  --color-text-primary: #1a1a1a;
  --color-text-light: #ffffff;
  --color-bg-light: #f5f5f5;

  /* Typography - if custom font sizes needed */
  --font-size-hero-title: 2.5rem;

  /* Spacing - only for brand-specific values */
  --spacing-section: 4rem;
}

/* ============================================
   BASE LAYER (minimal resets only)
   ============================================ */
@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply text-text-primary;
  }
}

/* ============================================
   COMPONENTS (only if 5+ utilities, 3+ uses)
   Keep under 50 lines total!
   ============================================ */
@layer components {
  /* Example: Only add if truly needed
  .btn-primary {
    @apply bg-brand-primary text-white px-6 py-3 rounded-lg 
           font-semibold hover:bg-brand-secondary 
           transition-colors duration-200;
  }
  */
}
```

---

_Document Version: 9.0 — Restructured using 8-Category Prompt Engineering Framework_
_Based on: copilot-instructions8.md + prompt-engineering-discussion.md Part 1_
