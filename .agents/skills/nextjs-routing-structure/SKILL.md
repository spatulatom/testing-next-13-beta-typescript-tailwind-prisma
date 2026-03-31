---
name: nextjs-routing-structure
description: "Opinionated Next.js App Router folder structure and project organization. Use when: setting up a new Next.js project, reorganizing an existing project's folders, deciding where to put components/utils/types, auditing folder structure for clarity, resolving 'where should this file go' questions."
argument-hint: 'Describe the project or reorganization goal'
---

# Next.js App Router Folder Structure

Opinionated conventions for organizing Next.js App Router projects so that any developer can immediately distinguish routes from application code.

## Core Principle

> `app/` is for routing. Everything else goes outside.

A folder inside `app/` should only exist if it contributes to a URL. All shared application code — components, utilities, types — lives at the project root in clearly named folders.

This follows **Strategy 1** from the [Next.js Project Structure docs](https://nextjs.org/docs/app/getting-started/project-structure#store-project-files-outside-of-app) and matches `vercel/commerce`, the canonical App Router reference.

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

### Rule 2: Shared UI → `components/`

Components used by **2 or more routes** live in `components/` at the project root.

Organize by **UI domain or feature** — what the component _is_ — not by route name.

Example for a blog/social app:

```
components/
  navigation/     ← nav bars, menus, breadcrumbs
  posts/          ← post cards, comment threads
  auth/           ← login forms, user menus
  providers/      ← React context providers
  ui/             ← generic primitives (buttons, modals, inputs)
```

Example for an e-commerce app:

```
components/
  layout/         ← header, footer, sidebar
  cart/           ← cart drawer, line items
  product/        ← product cards, galleries
  providers/      ← React context providers
  ui/             ← generic primitives
```

The exact subfolder names depend on your project's domain. The principle is: name after _what it is_, not _which route uses it_.

Do NOT mirror the route structure (no `components/home/`, `components/about/`). The moment you name a folder after a route, you create a redundant shadow of `app/` that breaks when a component gets shared.

### Rule 3: Route-specific components → colocate with `_components/`

Components used by **exactly 1 route** stay colocated inside that route using a `_components/` private folder:

```
app/[slug]/
  page.tsx
  loading.tsx
  _components/
    DetailView.tsx
```

The `_` prefix opts the folder out of Next.js routing. Without it, a folder like `components/` inside a route _technically_ wouldn't be routable (no `page.tsx`), but visually it's ambiguous — it could be mistaken for a nested route. The underscore removes all doubt: `_components/` clearly signals "helper components, not a route."

**Promotion rule**: When a colocated component starts being used by a second route, move it to `components/`.

### Rule 4: Application code → `lib/`

Non-component, non-UI code lives in `lib/` at the project root. Use a **hybrid flat + subfolder** approach (matching `vercel/commerce` and `nextjs/saas-starter`):

- **Generic, small helpers** → flat files directly in `lib/`
- **Domain-specific logic** with 2+ related files → subfolder

Example for a SaaS app:

```
lib/
  utils.ts         ← generic helpers, flat
  constants.ts     ← shared constants, flat
  auth/            ← grouped: session, middleware, tokens
  db/              ← grouped: queries, migrations
  payments/        ← grouped: Stripe integration
```

Example for a content app:

```
lib/
  utils.ts         ← generic helpers, flat
  cache/           ← grouped: server-side cache helpers
  actions/         ← grouped: server actions
```

The subfolder threshold is practical: once a concern has 2-3+ related files, group them. A single `utils.ts` doesn't need its own folder.

### Rule 5: Tooling config stays at project root

Files that frameworks or tools expect at the root by convention do not move. Common examples:

```
next.config.js       ← Next.js
tsconfig.json        ← TypeScript
tailwind.config.js   ← Tailwind (if used)
auth.js              ← NextAuth (if used)
prisma/              ← Prisma schema + client (if used)
```

The general rule: if an external tool needs to find the file at a conventional path, keep it there.

### Rule 6: Types stay at root

`types/` stays at the project root. It is already outside `app/` and universally understood.

### Rule 7: `_` prefix — only meaningful inside `app/`

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
│   ├── [slug]/               ← dynamic route
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── _components/      ← route-specific, private
│   ├── dashboard/            ← static route
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── api/                  ← API routes
│       └── ...
├── components/               ← SHARED UI (by domain)
│   ├── <domain-a>/           ← e.g. navigation, cart, posts
│   ├── <domain-b>/
│   ├── providers/
│   └── ui/
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
2. Create `components/` for shared UI, organized by domain
3. Create `lib/` for utilities and helpers
4. Create `types/` for TypeScript definitions
5. Colocate route-specific components in `app/[route]/_components/`

### For an existing project

1. Audit `app/`: identify all non-routing files and folders
2. Move shared components → `components/` (organize by domain)
3. Move utilities → `lib/`
4. Rename colocated private folders to `_components/` for consistency
5. Update all import paths
6. Run build to verify no broken imports

### Decision: where does this file go?

```
Is it a Next.js file convention (page, layout, route, loading, error)?
  → YES: app/[route]/
  → NO: continue

Is it a React component?
  → Used by 1 route only?  → app/[route]/_components/
  → Used by 2+ routes?     → components/
  → NO: continue

Is it a utility, helper, server action, or data function?
  → lib/

Is it a TypeScript type/interface?
  → types/

Is it framework/tooling config?
  → project root
```

## References

- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [vercel/commerce](https://github.com/vercel/commerce) — canonical example of Strategy 1 (e-commerce)
- [nextjs/saas-starter](https://github.com/nextjs/saas-starter) — official SaaS template

## Note

This skill captures opinionated conventions derived from the Next.js docs, Vercel reference repos, and practical experience. The exact subfolder names, tooling files, and domain groupings will vary per project — the _rules and decision framework_ are what stays constant.
