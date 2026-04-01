---
name: nextjs-routing-structure
description: "Opinionated Next.js App Router folder structure and project organization. Use when: setting up a new Next.js project, reorganizing an existing project's folders, deciding where to put components/utils/types, auditing folder structure for clarity, resolving 'where should this file go' questions."
disable-model-invocation: true
---

# Next.js App Router Folder Structure

Opinionated conventions for organizing Next.js App Router projects so that routes stay separate from application code. The guidance below follows the Next.js project-structure recommendation to store project files outside of app, and the examples are illustrative rather than prescriptive.

## Core Principle

> `app/` is for routing. Everything else goes outside.

A folder inside `app/` should only exist if it contributes to a URL or is one of the supported Next.js file conventions. All shared application code — components, utilities, types — lives outside `app/` in clearly named folders.

This follows **Strategy 1** from the [Next.js Project Structure docs](https://nextjs.org/docs/app/getting-started/project-structure#store-project-files-outside-of-app) and matches common App Router reference projects such as `vercel/commerce`.

## Rules

### Rule 1: `app/` = routing only

`app/` should contain **only** Next.js file conventions:

| File            | Purpose                     |
| --------------- | --------------------------- |
| `page.tsx`      | Route page                  |
| `layout.tsx`    | Layout wrapper              |
| `loading.tsx`   | Streaming/Suspense skeleton |
| `error.tsx`     | Error boundary              |
| `not-found.tsx` | 404 UI                      |
| `route.ts`      | API endpoint                |
| `template.tsx`  | Re-rendered layout          |
| `default.tsx`   | Parallel route fallback     |
| `globals.css`   | Global styles (root only)   |

If a file is not in this list, it does not belong directly in `app/`.

### Rule 2: All UI → `components/`

**All** React components — whether used by one route or many — live in `components/` at the project root.

Use a **hybrid flat + subfolder** approach:

- **Standalone components** → flat files directly in `components/`
- **2-3+ related components** → group in a subfolder for that UI feature or concern

Organize subfolders by **feature** or UI concern — what the component is for — not by route name.

Examples only, for illustration:

```
components/
  navigation/     ← nav bars, menus, breadcrumbs (4 related files)
  posts/          ← post cards, comment threads (5+ related files)
  providers/      ← React context providers
  ui/             ← generic primitives (buttons, modals, inputs)
```

Another example:

```
components/
  layout/         ← header, footer, sidebar
  cart/           ← cart drawer, line items
  product/        ← product cards, galleries
  providers/      ← React context providers
  ui/             ← generic primitives
```

The exact subfolder names depend on your project's features. The principle is: name after _what it is_, not _which route uses it_.

Do NOT mirror the route structure (no `components/home/`, `components/about/`). The moment you name a folder after a route, you create a redundant shadow of `app/` that breaks when a component gets shared.

### Rule 3: Application code → `lib/`

Non-component, non-UI code lives in `lib/` at the project root. Use a **hybrid flat + subfolder** approach:

- **Generic, small helpers** → flat files directly in `lib/`
- **Domain-specific logic** with 2+ related files → subfolder

Examples only:

```
lib/
  utils.ts         ← generic helpers, flat
  constants.ts     ← shared constants, flat
  auth/            ← grouped: session, middleware, tokens
  db/              ← grouped: queries, migrations
  payments/        ← grouped: Stripe integration
```

Another example:

```
lib/
  utils.ts         ← generic helpers, flat
  cache/           ← grouped: server-side cache helpers
  actions/         ← grouped: server actions
```

The subfolder threshold is practical: once a concern has 2-3+ related files, group them. A single `utils.ts` doesn't need its own folder.

### Rule 4: Tooling config stays at project root

Files that frameworks or tools expect at the root by convention do not move. Common examples:

```
next.config.js       ← Next.js
tsconfig.json        ← TypeScript
tailwind.config.js   ← Tailwind (if used)
auth.js              ← NextAuth (if used)
prisma/              ← Prisma schema + client (if used)
```

The general rule: if an external tool needs to find the file at a conventional path, keep it there. These are examples, not a fixed list.

### Rule 5: Types stay at root

`types/` stays at the project root. It is already outside `app/` and universally understood.

### Rule 6: `_` prefix — only meaningful inside `app/`

- Inside `app/`: `_folderName` opts the folder out of the router (Next.js behavior)
- Outside `app/`: `_` has zero special meaning to Next.js — unnecessary

Do not prefix folders outside `app/` with underscores.

## Target Structure

Generic skeleton — adapt folder names to your project's domain:

```
project-root/
├── app/                      ← ROUTING ONLY
│   ├── page.tsx              ← /
│   ├── layout.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── globals.css
│   ├── [slug]/               ← dynamic route example
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── dashboard/            ← static route example
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── api/                  ← API routes
│       └── ...
├── components/               ← ALL UI (by feature)
│   ├── <feature-a>/          ← example UI feature folder
│   ├── <feature-b>/
│   ├── providers/
│   ├── ui/
│   └── StandaloneWidget.tsx  ← flat file for standalone components
├── lib/                      ← UTILITIES & HELPERS
│   ├── utils.ts
│   └── ...
├── types/                    ← TYPE DEFINITIONS
├── public/                   ← STATIC ASSETS
├── next.config.js            ← TOOLING CONFIG
└── ...                       ← other tooling (prisma/, auth.js, etc.)
```

## Procedure

### For a new project

1. Create `app/` with only routing files
2. Create `components/` for all UI, organized by feature
3. Create `lib/` for utilities and helpers
4. Create `types/` for TypeScript definitions

### For an existing project

1. Audit `app/`: identify all non-routing files and folders
2. Move all components → `components/` (organize by feature)
3. Move utilities → `lib/`
4. Update all import paths
5. Run build to verify no broken imports

### Decision: where does this file go?

```
Is it a Next.js file convention (page, layout, route, loading, error)?
  → YES: app/[route]/
  → NO: continue

Is it a React component?
  → components/ (subfolder by feature, or flat if standalone)

Is it a utility, helper, server action, or data function?
  → lib/

Is it a TypeScript type/interface?
  → types/

Is it framework/tooling config?
  → project root
```

## References

- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure#store-project-files-outside-of-app) — official guidance with Strategy 1 recommendation
- [vercel/commerce](https://github.com/vercel/commerce) — example of Strategy 1 (e-commerce)
- [shadcn/taxonomy](https://github.com/shadcn-ui/taxonomy) — example App Router reference with flat + grouped components
- [cal.com](https://github.com/calcom/cal.com) — example large-scale App Router project with feature modules
- [nextjs/saas-starter](https://github.com/vercel/nextjs/saas-starter) — example SaaS template

## Note

This skill captures opinionated conventions derived from the Next.js docs, reference repos, and practical experience. The exact subfolder names, tooling files, and domain groupings will vary per project — the rules and decision framework are what stays constant.
