# Cache Components Navigation Readiness Audit

This audit protects Cache Components navigation behavior as new routes and mutations are added. It records which routes are cached, dynamic, or streaming, which links must avoid prefetch reuse after mutations, and how to verify production behavior.

## Validation Baseline

- Audit date: 2026-05-31
- Next.js version used for validation: `16.2.6`
- Local docs checked first, per [AGENTS.md](AGENTS.md): `use-cache.md`, `link.md`, `instant-navigation.md`, `instant.md`, `cacheTag.md`, `updateTag.md`, `revalidateTag.md`, and `streaming.md` from `node_modules/next/dist/docs/`.
- Existing stale-prefetch lesson: [48.PREFETCH_STALE_BUG_EXPLAINED.md](48.PREFETCH_STALE_BUG_EXPLAINED.md)

## Latest Validation Results

- `npm run audit:cache-navigation`: passed for Next.js `16.2.6`.
- `npm run lint`: passed.
- `npm run test`: passed, 25 Vitest tests.
- `npm run build`: passed with Cache Components enabled; audited app routes emitted as Partial Prerendered (`◐`).
- `npm run start -- -p 3001`: production server started successfully.
- Production public-route smoke checks returned `200` for `/`, `/about`, `/edit-suggestions`, `/deep-galaxy`, `/halftone-waves`, and `/privacypolicy`.
- Authenticated mutation flows require a signed-in OAuth session; use the production checklist below for create post, add comment, heart, delete, and cross-route mutation checks.
- Attempted `unstable_instant = { prefetch: 'static' }` on `/about` and `/edit-suggestions`; build-time validation rejected it because shared `Nav` calls `auth()` and Auth.js reads request headers. Instant validation remains deferred until the shared auth shell is refactored or runtime samples are intentionally validated.

## Route Inventory

| Route | Data shape | Runtime APIs | Cached readers and tags | Mutation writers | Boundary / shell behavior | Prefetch policy | Instant navigation eligibility | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Feed list with pagination, sorting, comments, hearts, and current-user heart state | `auth()` and `searchParams` are read in `HomeWithSession` before rendering cached data | `app/allPosts.tsx` uses `use cache` and `cacheTag('posts')`; `feedQuery` is serializable | `createPost`, `createComment`, `toggleHeart`, `deletePostFromUserPosts` all call `updateTag('posts')` | Page wraps session/query work in Suspense fallback `Loading posts...`; controls have local Suspense fallbacks | Keep `prefetch={false}` on Home links because every mutation can change the feed | Not enabled; mutation consistency is higher priority than instant prefetch reuse | Covered by `npm run audit:cache-navigation`; verify mutation flows in production build |
| `/[post]` | Post detail with comments, hearts, author, and current-user heart state | `params` is resolved before `PostDetailWithSession`; `auth()` stays outside cached detail component | `singlePost(id)` and `CachedPostDetail` use `use cache`, `cacheTag('posts')`, and `cacheTag(`post-${id}`) | `createComment` and `toggleHeart` call `updateTag(`post-${postId}`)` and `updateTag('posts')`; delete calls `updateTag(`post-${postId}`)` | Detail body is inside Suspense fallback `Loading post...`; `generateStaticParams` covers existing posts | Keep `prefetch={false}` on feed post detail links | Not enabled; details are mutation-sensitive after comments/hearts/deletes | Covered by `npm run audit:cache-navigation`; verify post/comment/heart/delete flows in production build |
| `/userposts` | Authenticated user's posts and comments | `auth()` redirects before cached user-specific lookup; `UserOwnPosts` reads auth before calling cached data | `getCachedUserPosts(userId)` uses `use cache` and `cacheTag(`user-${userId}-posts`)` | create, comment, heart, and delete actions update affected user-post tags | Page wraps auth layer in Suspense fallback `Loading...` | Keep `prefetch={false}` on User's Posts links | Not enabled; route is auth and mutation sensitive | Covered by `npm run audit:cache-navigation`; verify authenticated production flows manually |
| `/about` | Static read-only project information | Page body has none; shared root `Nav` calls `auth()` | None needed | None | Page body is shell-ready, but the shared nav is request-bound | Default prefetch is allowed | Evaluated; not enabled because build-time `unstable_instant` validation surfaced Auth.js header reads from shared `Nav` | Covered by `npm run audit:cache-navigation`; revisit after auth nav shell refactor or validated runtime samples |
| `/edit-suggestions` | Static read-only placeholder | Page body has none; shared root `Nav` calls `auth()` | None needed | None | Page body is shell-ready, but the shared nav is request-bound | Default prefetch is allowed | Evaluated; not enabled because build-time `unstable_instant` validation surfaced Auth.js header reads from shared `Nav` | Covered by `npm run audit:cache-navigation`; revisit after auth nav shell refactor or validated runtime samples |
| `/deep-galaxy` | Experimental visual route with an async child under Suspense | No request-time API in the route file | None in route file | None | Page shell renders heading immediately and streams `Ssr` behind `Galaxy is loading...` | Default prefetch is acceptable while read-only | Candidate only after production shell inspection; not enabled in this pass | Covered by route inventory; inspect production shell before enabling instant validation |
| `/halftone-waves` | Experimental visual route with request-bound timestamp/random ID | `headers()` and `delay(1000)` are awaited before JSX is returned | None | None | Request-bound work happens before the returned Suspense boundary, so the route is not instant-ready as written | Default prefetch is acceptable while read-only | Not eligible until request-time work moves behind a local Suspense boundary or is cached appropriately | Covered by route inventory; do not add instant validation yet |
| `/privacypolicy` | Static read-only legal copy | None | None needed | None | Static page content | Default prefetch is allowed | Candidate, but not part of the first instant-navigation pass | Covered by route inventory |

## Cache Components Navigation Rules

- Cached database readers must use `use cache` and assign tags with `cacheTag()` inside the cached scope.
- Server Actions that need read-your-own-writes must call `updateTag()` for every affected reader tag before returning success.
- Use `revalidateTag(tag, 'max')` for stale-while-revalidate cases such as webhooks, background updates, or non-immediate content freshness.
- Keep `auth()`, `cookies()`, `headers()`, and `searchParams` outside normal `use cache` scopes. Pass serializable runtime values into cached functions or components when they are part of the cache key.
- Keep `prefetch={false}` on mutation-sensitive links until a production build proves default prefetch cannot serve a stale prefetched payload after mutation.
- Validate navigation behavior with `next build` and `next start`. `next dev` is not enough because Link prefetching is production-only.
- Only add `unstable_instant = { prefetch: 'static' }` to routes where the full shared-layout entry shell is valid at build time. In this app, read-only page bodies are candidates, but the current shared auth nav keeps them out of the first instant-navigation pass.

## Production Mutation Flow Checklist

Run these checks against a production build:

```bash
npm run build
npm run start
node -p "require('next/package.json').version"
npm run audit:cache-navigation
```

Record the exact Next.js version with the results.

- Create post: create a uniquely titled post, navigate away and back to `/`, and confirm the feed shows it without hard reload.
- Add comment: open a post, add a comment, navigate to `/`, `/[post]`, and `/userposts`, and confirm comment counts/details are fresh.
- Heart: toggle a heart, navigate between `/`, `/[post]`, and `/userposts`, and confirm counts and current-user state stay fresh.
- Delete post: delete from `/userposts`, navigate to `/`, and confirm the deleted post is gone; visiting the old detail route must not serve stale data.
- Cross-route navigation: repeat the flows through the existing nav and card links that intentionally use `prefetch={false}`.
- Stale capture: if any route serves stale data, record the source route, destination route, action, link used, and whether a hard reload fixes it.

## Automated Coverage

`npm run audit:cache-navigation` performs source-level checks for the current policy:

- `cacheComponents: true` remains enabled.
- Mutation-sensitive Home, User's Posts, and post-detail links retain `prefetch={false}`.
- Cached readers keep their expected `cacheTag()` calls.
- Server Actions keep the matching `updateTag()` calls.
- Read-only instant-navigation candidates remain documented as not enabled while shared auth nav validation is unresolved.
- The audit continues to record the installed Next.js version.

This script complements production-build testing; it does not replace manual authenticated mutation checks.