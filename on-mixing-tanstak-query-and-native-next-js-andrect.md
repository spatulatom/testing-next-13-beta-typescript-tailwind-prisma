# Mixing TanStack Query with native Next.js patterns for CRUD

## Executive Summary

This project is **not doing something unusual** by combining TanStack Query with native Next.js patterns. What makes it interesting is that it is a **hybrid / transitional App Router codebase**: server components and cache helpers handle most read paths, route handlers handle writes, and TanStack Query is still used on client-heavy screens for cache coordination and mutations.[^1][^3][^4][^5][^7][^9][^10][^11][^12][^13]

That hybrid shape is pretty common in real apps, especially projects that evolved from the Next 13 beta era. It is also consistent with the repository’s own README, which explicitly says the app was migrated across major Next.js releases and “fully integrates” TanStack Query.[^16]

The main architectural smell is not “mixing” itself; it is **overlap**. This repo currently uses both React Query invalidation and Next.js path revalidation, and it keeps a global client provider at the root even for screens that do not obviously need it. Issue #36 is already pointing in the same direction: reduce client-only surface area, move eligible mutations to Server Actions, and keep TanStack Query only where it provides clear value.[^10][^11][^12][^13][^15][^24]

## Architecture Overview

```text
User browser
   │
   ├─ reads ──▶ Server Component page
   │            ├─ cached DB helper (`use cache` + `cacheLife`)
   │            └─ Prisma
   │
   ├─ interactive reads ──▶ Client Component
   │                        └─ TanStack Query `useQuery`
   │                           └─ app API route handler
   │                              └─ Prisma
   │
   └─ mutations ──▶ Client Component `useMutation` / fetch / axios
                    └─ Route Handler
                       ├─ Prisma write
                       ├─ `revalidatePath(...)`
                       └─ client-side `invalidateQueries(...)` / `router.refresh()`
```

This is a classic Next.js App Router split: server components for source-of-truth reads, client components for interactivity, and route handlers as the backend-for-frontend layer.[^17][^18]

## What this project is actually doing

### 1) Server-first reads on the public pages

The home page is a server component that fetches posts directly from Prisma through a cached helper. The helper uses `use cache`, and the page applies `cacheLife('max')`, which means the read path is intentionally server-centric and cache-aware.[^3][^4][^19][^21]

The single-post page follows the same pattern, but it opts out of caching with `unstable_noStore` in the helper, which makes sense for a detail view that should stay fresh.[^5][^6]

### 2) Client-side TanStack Query for user-specific CRUD UX

The authenticated “your posts” screen is the opposite: it uses a client component that fetches `/api/userposts` via `useQuery`, then deletes posts through `useMutation` and `axios.delete`.[^8][^9][^10][^14]

That is a valid use of TanStack Query because the screen benefits from local cache state, refetch coordination, and mutation invalidation. TanStack’s own docs describe query invalidation after successful mutations as the normal pattern.[^22]

### 3) Route handlers as the mutation boundary

The project’s writes are implemented as App Router route handlers: create post, add comment, delete post, and fetch current user posts all live under `app/api/...`.[^11][^12][^13][^14]

That matches Next.js’ route-handler model: they are the App Router equivalent of API routes, they use Web `Request`/`Response`, and they can be used anywhere under `app/` as long as they do not conflict with a page at the same segment.[^18]

## Where the patterns overlap

The overlap is most visible in the delete flow:

- the route handler deletes the row and calls `revalidatePath('/')`, which is a server-side cache invalidation primitive.[^13][^20]
- the client mutation also calls `queryClient.invalidateQueries({ queryKey: ['getAuthPosts'] })` and `router.refresh()`.[^10]

That is not broken, but it is **double bookkeeping**. It means the app is using both Next.js revalidation and TanStack Query invalidation to solve freshness for the same user action.[^10][^13][^20][^22]

## What Next.js docs say about this split

Next.js explicitly frames Server Components as the default and recommends them for data fetched from databases or APIs close to the source, while Client Components are for state, event handlers, browser APIs, and custom hooks.[^17]

Next.js also says Route Handlers are the App Router’s custom request handlers, not something you need to pair with Pages Router API routes, and that `revalidatePath` is available in Server Functions and Route Handlers.[^18][^20]

With Cache Components enabled, Next.js also encourages the `use cache` / `cacheLife` model for caching async functions and components, which is exactly what this repo uses on the home page.[^15][^19][^21]

## What TanStack Query docs say about this split

TanStack Query’s docs are also compatible with this hybrid model. They describe `invalidateQueries` in `onSuccess` as the standard way to refresh dependent data after a mutation.[^22]

For server rendering, TanStack’s SSR docs recommend creating the `QueryClient` inside the app lifecycle, usually with React state or a ref, so the cache is not accidentally shared and the SSR setup stays request-safe.[^23]

This repo’s `QueryWrapper` currently creates the `QueryClient` at module scope and mounts it globally from the root layout.[^1][^2] That is simple and common in older examples, but it is not the most SSR-disciplined TanStack pattern if the app keeps growing or if you later add query dehydration/prefetching.[^23]

## How uncommon is this mix?

**Short answer: it is not uncommon at all.**

This hybrid shows up a lot in real-world Next.js apps, especially codebases that started before the App Router settled and were later modernized. The ecosystem has many public examples that pair Next.js with TanStack Query, including starter and sample repos such as [hey-api/openapi-ts](https://github.com/hey-api/openapi-ts), [daveyplate/better-auth-nextjs-starter](https://github.com/daveyplate/better-auth-nextjs-starter), [zenstackhq/sample-todo-nextjs-tanstack](https://github.com/zenstackhq/sample-todo-nextjs-tanstack), and [Bluzzi/Next-Server-Actions](https://github.com/Bluzzi/Next-Server-Actions).[^25]

So the combination itself is mainstream. What is **less** common in newer greenfield apps is the exact shape of this repo’s implementation: a root-level client provider, client fetches for CRUD, route-handler revalidation, and server-component caching all living side by side. Modern teams usually pick **one primary freshness model per screen** and keep React Query for places where it clearly earns its keep.[^10][^11][^13][^17][^22][^23]

## How this repo compares to a modern Next.js default

| Area              | Current repo                              | Modern preference                                               |
| ----------------- | ----------------------------------------- | --------------------------------------------------------------- |
| Read pages        | Server components + cached Prisma helpers | Same                                                            |
| Mutation writes   | Route handlers + client fetch/axios       | Server Actions or route handlers, but not both if one is enough |
| Client cache      | TanStack Query on user posts screen       | Keep only where local cache/optimistic updates help             |
| Revalidation      | `revalidatePath('/')` on writes           | Prefer one clear invalidation path per screen                   |
| App-wide provider | Global `QueryWrapper` in root layout      | Narrow provider scope if only some routes need it               |

The repo is already partially aligned with modern Next.js guidance because its public reads are server-first and cache-aware.[^3][^4][^5][^6][^15][^19][^21]

## Practical recommendation

If the goal is to reduce complexity, I would treat TanStack Query as a **scoped tool**, not the default CRUD layer:

- keep server components + cached helpers for read-heavy pages;
- keep route handlers or Server Actions for writes, but avoid duplicating freshness logic in both the client and server unless there is a real UX reason;
- keep TanStack Query on screens that genuinely benefit from client caching, optimistic updates, or background refetching;
- move the query provider lower in the tree if only part of the app needs it;
- if SSR hydration becomes important, initialize `QueryClient` the way TanStack recommends, inside the app lifecycle rather than as a module singleton.[^2][^23]

That direction also lines up with issue #36, which explicitly calls for reducing client-only surface area and reassessing where TanStack Query still adds value.[^24]

## Confidence Assessment

**High confidence**

- The repo definitely mixes server components, route handlers, and TanStack Query.[^1][^2][^3][^4][^5][^6][^8][^9][^10][^11][^12][^13][^14]
- The project’s docs and config show a deliberate migration toward newer Next.js patterns, including Cache Components.[^15][^16]
- Issue #36 is directly about reducing client-only patterns and narrowing TanStack Query usage.[^24]

**Medium confidence**

- The current provider layout is acceptable for the project today, but would be a stronger SSR/hydration story if QueryClient were created per app lifecycle as TanStack recommends.[^23]
- The “how uncommon” question is best answered qualitatively: the combo is common, but the exact implementation style is more migration-era than greenfield-era.[^25]

## Footnotes

[^1]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\app\\layout.tsx:21-61`

[^2]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\components\\providers\\QueryWrapper.tsx:1-20`

[^3]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\app\\page.tsx:8-96`

[^4]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\lib\\cache\\allPosts.tsx:1-34`

[^5]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\app\\[post]\\page.tsx:11-65`

[^6]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\lib\\cache\\singlepost.tsx:1-40`

[^7]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\components\\posts\\AddComment.tsx:1-117`

[^8]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\app\\userposts\\page.tsx:11-24`

[^9]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\components\\posts\\UserOwnPosts.tsx:1-67`

[^10]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\components\\posts\\DeletePost.tsx:1-107`

[^11]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\app\\api\\(home-page)\\addpost\\route.tsx:1-171`

[^12]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\app\\api\\(post-page)\\addcomment\\route.ts:1-109`

[^13]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\app\\api\\(userposts-page)\\deletepost\\[id]\\route.tsx:1-80`

[^14]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\app\\api\\(userposts-page)\\userposts\\route.ts:1-45`

[^15]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\next.config.ts:1-33`

[^16]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\README.md:20-24,57-60`

[^17]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\.next-docs\\01-app\\01-getting-started\\05-server-and-client-components.mdx:11-31,174-182`

[^18]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\.next-docs\\01-app\\01-getting-started\\15-route-handlers.mdx:15-31,49-51,87-145`

[^19]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\.next-docs\\01-app\\01-getting-started\\08-caching.mdx:15-18,42-51,67-98,129-145`

[^20]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\.next-docs\\01-app\\03-api-reference\\04-functions\\revalidatePath.mdx:6-17,83-129`

[^21]: `D:\\projects\\testing-next-13-beta-typescript-tailwind-prisma\\.next-docs\\01-app\\03-api-reference\\04-functions\\cacheLife.mdx:14-18,40-78`

[^22]: TanStack Query docs, [Invalidating Queries from Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations)

[^23]: TanStack Query docs, [Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)

[^24]: GitHub issue, [spatulatom/testing-next-13-beta-typescript-tailwind-prisma#36](https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma/issues/36)

[^25]: Public ecosystem examples: [hey-api/openapi-ts](https://github.com/hey-api/openapi-ts), [daveyplate/better-auth-nextjs-starter](https://github.com/daveyplate/better-auth-nextjs-starter), [zenstackhq/sample-todo-nextjs-tanstack](https://github.com/zenstackhq/sample-todo-nextjs-tanstack), [Bluzzi/Next-Server-Actions](https://github.com/Bluzzi/Next-Server-Actions)
