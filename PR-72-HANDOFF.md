# Handoff Notes for PR #72 / Issue #71

**Last updated: May 8, 2026 — Session 2**

This document is a live handoff. It has been rewritten to reflect the full state of investigation across two sessions. Do not attempt any strategy already listed as "tried and failed" below.

## References

- Issue: #71
- PR: #72
- Branch: `tom/cache-dynamic-posts`

---

## Goal

- Dynamic post pages prerendered at build time via `generateStaticParams`.
- Newly created posts work at runtime after `npm run build` + `npm start`.
- After any mutation (create post, add comment, delete post), all affected views update correctly with no duplicate content and no stale data.

---

## Current Code State (as of end of Session 2)

### `app/page.tsx`

Refactored to a **synchronous shell** with an async `PostList` component inside `<Suspense>`:

```tsx
export default function Home() {          // synchronous - no async
  return (
    <div>
      ...static heading/description...
      <AddPost />
      <Suspense fallback={<p>Loading posts...</p>}>
        <PostList />                        // async data fetch here
      </Suspense>
    </div>
  );
}

async function PostList() {               // fetches allPosts()
  ...
}
```

Rationale: Suspense boundary was intended to give React a clean slot for RSC updates instead of mounting a parallel tree. **Did not fix the duplicate problem.**

### `app/actions.ts` — `createPost`

```ts
updateTag('posts');
updateTag(`post-${result.id}`);
updateTag(`user-${prismaUser.id}-posts`);
// NO revalidatePath, NO refresh
```

### `app/[post]/actions.ts` — `createComment`

```ts
updateTag('posts');
updateTag(`post-${postId}`);
updateTag(`user-${post.userId}-posts`);
// NO revalidatePath, NO refresh
```

### `app/userposts/actions.ts` — `deletePostFromUserPosts`

```ts
updateTag(`user-${prismaUser.id}-posts`);
updateTag('posts');
updateTag(`post-${postId}`);
// NO revalidatePath, NO refresh
```

### `app/allPosts.tsx` — tagged `'use cache'` function

```ts
'use cache';
cacheLife('max');
cacheTag('posts');
// queries all posts with user + comments + hearts
```

### `app/[post]/singlepost.tsx` — tagged `'use cache'` function

```ts
'use cache';
cacheLife('max');
cacheTag('posts');
cacheTag(`post-${id}`);
```

### `app/userposts/getUserPosts.ts` — tagged `'use cache'` function

```ts
'use cache';
cacheLife('max');
cacheTag(`user-${userId}-posts`);
```

---

## The Core Bug (confirmed, not fixed)

**Symptom:** After adding a comment to a post and navigating back to `/`, the homepage shows **two copies** of the affected post card — one with the old comment count (e.g. "Comments: 0") and one with the updated count ("Comments: 1").

**Root cause confirmed from official Next.js 16 `cacheComponents` docs:**

> _Next.js uses React's `<Activity>` component to preserve component state during client-side navigation. Rather than unmounting the previous route when you navigate away, Next.js sets the Activity mode to `"hidden"`. When you navigate back, the previous route reappears with its state intact._

When the user navigates from `/` to `/[post]`, the homepage is **kept alive in the DOM as a hidden `<Activity>`**. When a Server Action runs (`createComment`) and `updateTag` expires the data cache, Next.js sends a fresh RSC update for the current page `/[post]` — but also re-fetches `/` (via prefetch links). This fresh RSC update for `/` arrives while the hidden Activity still holds the old DOM tree. React mounts the new RSC payload **alongside** the preserved hidden tree instead of replacing it. When Activity makes `/` visible again, both trees render simultaneously → duplicate post cards.

---

## What Was Tried and Failed (do not retry these)

### 1. `updateTag` only

Tried in Session 2. Still shows duplicates. Data cache expires but Activity preserved DOM still contains old content.

### 2. `updateTag` + `refresh()` + `revalidatePath` on all routes

Tried in Session 1. Made the bug **worse** — `refresh()` fires a concurrent RSC fetch for the current page on top of the normal Server Action re-render → three-way race condition producing even more duplicates.

### 3. `updateTag` + `revalidatePath` on cross-routes only (no `refresh()`)

Tried in Session 2. Multiple variations:

- `createPost` on `/`: adding `revalidatePath('/userposts')` broke the SA auto-render of the current page (SA's own re-render raced with `revalidatePath`'s re-render of the "all visited pages" set)
- `createComment` on `/[post]`: adding `revalidatePath('/')` + `revalidatePath('/userposts')` still produced duplicates

### 4. Synchronous `Home` shell + async `PostList` in `<Suspense>`

Tried in Session 2. Still shows duplicates. The Suspense boundary did not prevent Activity from mounting a parallel RSC tree alongside the preserved DOM.

---

## What Has NOT Been Tried Yet

### A. `'use cache'` on `PostList` component directly

The `PostList` async component in `app/page.tsx` is currently **not** a `use cache` component — it calls `allPosts()` which is cached, but the component itself is not. Making `PostList` itself a `'use cache'` component with `cacheTag('posts')` might change how React handles Activity rehydration vs. cache hit behavior.

### B. `revalidateTag` instead of `updateTag`

The docs describe `revalidateTag` as stale-while-revalidate (background refresh), whereas `updateTag` immediately expires. It's possible the Activity + immediate expiry combination is what triggers the concurrent render. `revalidateTag('posts', 'max')` (with the profile) might avoid the race by letting Activity restore the old content while fresh content loads in the background without a parallel mount.

### C. Investigating `_rsc` request failures

Every navigation produces a batch of `net::ERR_ABORTED` RSC requests. These are visible in server logs and browser events. It's not confirmed whether these aborted requests are the **source** of the duplicate (aborted old request + successful new request both applying) or just normal prefetch cancellation. Worth capturing the network tab to see exactly which requests complete vs. abort.

### D. Disabling `<Activity>` preservation for `/`

The `preserving-ui-state.md` doc mentions _"Opt-out strategies are being considered"_ but none are available yet. However, there may be a way to force `/` to re-render fresh on every navigation by making its data access dynamic (not cached), avoiding the Activity preserved DOM problem entirely. This would mean trading cached performance for correctness, acceptable as a fallback.

### E. The `unstable_instant` export

The `instant-navigation.md` doc mentions `export const unstable_instant = { prefetch: 'static' }` on routes to validate caching structure. This might expose whether the Suspense boundaries are positioned correctly for the Cache Components model.

### F. Checking whether `allPosts` with `cacheLife('max')` is the problem

With `cacheLife('max')` the stale window is 5 minutes, meaning the Activity-preserved DOM could be up to 5 minutes stale when Activity restores it. It's worth trying `cacheLife('seconds')` (0 stale, 1s revalidate) on `allPosts` — the docs say short-lived caches (`expire < 5 min`) are **excluded from prerenders** and become dynamic holes instead. This would mean `/` streams `PostList` fresh on every visit, bypassing the Activity stale-content problem.

---

## Recommended Starting Point for Session 3

**Try option F first — it's the lowest-risk change and most directly targets the Activity stale content problem:**

In `app/allPosts.tsx`, change:

```ts
cacheLife('max');
```

to:

```ts
cacheLife('seconds'); // 0 stale, 1s revalidate, 60s expire → excluded from prerender → dynamic hole
```

This makes `PostList` a truly dynamic component that always fetches fresh data, which means Activity restoring `/` will stream the updated content rather than preserving a stale snapshot. The trade-off is no build-time caching of the post list — acceptable for a chat room that mutates frequently.

If that fixes the homepage duplicate, apply the same fix to `singlepost.tsx` if the post detail page shows the same issue.

**Clean test sequence to confirm fix:**

```
npm run build
npm start
# 1. Navigate to http://localhost:3000
# 2. Create a post — confirm count increments, 1 copy only
# 3. Click the post → navigate to /[post]
# 4. Add a comment — confirm Comments: 1 on detail page
# 5. Click Home — confirm ONLY ONE copy of the post with Comments: 1
# 6. Navigate to /userposts
# 7. Delete the post
# 8. Click Home — confirm post is gone (no stale copy)
```

---

## Files Touched

- `app/page.tsx` — restructured to sync shell + `<Suspense><PostList /></Suspense>`
- `app/actions.ts` — `updateTag` only
- `app/[post]/actions.ts` — `updateTag` only
- `app/userposts/actions.ts` — `updateTag` only
- `app/allPosts.tsx` — `'use cache'` + `cacheTag('posts')` + `cacheLife('max')`
- `app/[post]/singlepost.tsx` — `'use cache'` + `cacheTag('posts', \`post-${id}\`)`+`cacheLife('max')`
- `app/userposts/getUserPosts.ts` — `'use cache'` + `cacheTag(\`user-${userId}-posts\`)`+`cacheLife('max')`
- `app/[post]/page.tsx` — has `generateStaticParams`

## Commits on Branch

- `33c45d0` - initial dynamic-post caching work
- `0cfb788` - refresh UI after cache invalidation
- `ca65f36` - revalidate affected routes after post mutations
- (uncommitted local changes from Session 2: page.tsx refactor, removal of refresh/revalidatePath from all actions)
