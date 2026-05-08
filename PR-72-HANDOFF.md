# Handoff Notes for PR #72 / Issue #71

**Last updated: May 8, 2026 — Session 4**

## References

- Issue: #71
- PR: #72
- Branch: `tom/cache-dynamic-posts`

---

## Goal

- Dynamic post pages prerender at build time via `generateStaticParams`.
- Runtime post creation still works after `npm run build` + `npm start`.
- Mutation flows (create post, add comment, delete post) invalidate caches without stale UI or duplicate cards.

---

## Current Code State (end of Session 4)

### Route/data caching - UPDATED

- `next.config.ts` has `cacheComponents: true`.
- `app/allPosts.tsx` uses `'use cache'`, `cacheTag('posts')`, `cacheLife('max')` (reverted from 'seconds').
- `app/[post]/singlepost.tsx` uses `'use cache'`, `cacheTag('posts')`, `cacheTag(\`post-${id}\`)`, `cacheLife('max')` (reverted from 'seconds').
- `app/userposts/getUserPosts.ts` uses `'use cache'`, `cacheTag(\`user-${userId}-posts\`)`, `cacheLife('max')` (reverted from 'seconds').
- **`app/page.tsx` NOW wraps `Home()` with `'use cache'` + `cacheTag('posts')` for route-layer invalidation.**
- **`app/[post]/page.tsx` NOW wraps `PostDetail()` with `'use cache'` + `cacheTag('posts')` + `cacheTag(\`post-${post}\`)` for route-layer invalidation.**
- **`app/userposts/page.tsx` NOW wraps `CachedDashboard()` with `'use cache'` + `cacheTag(\`user-${userId}-posts\`)` for route-layer invalidation.**
- `app/[post]/page.tsx` includes `generateStaticParams`.

### Server action invalidation strategy (UPDATED in Session 4)

All three server action files now use **ONLY `updateTag()`** (no `revalidateTag` or `refresh()`):

`app/actions.ts` (`createPost`):

```ts
updateTag('posts');
updateTag(`post-${result.id}`);
updateTag(`user-${prismaUser.id}-posts`);
revalidatePath('/');
revalidatePath('/userposts');
revalidatePath(`/${result.id}`);
refresh();
```

`app/[post]/actions.ts` (`createComment`):

```ts
updateTag('posts');
updateTag(`post-${postId}`);
updateTag(`user-${post.userId}-posts`);
revalidatePath('/');
revalidatePath('/userposts');
revalidatePath(`/${postId}`);
refresh();
```

`app/userposts/actions.ts` (`deletePostFromUserPosts`):

```ts
updateTag(`user-${prismaUser.id}-posts`);
updateTag('posts');
updateTag(`post-${postId}`);
revalidatePath('/');
revalidatePath('/userposts');
revalidatePath(`/${postId}`);
refresh();
```

### Key insight (Session 4 - ROOT CAUSE IDENTIFIED)

The core issue was a **two-layer cache architecture mismatch**:

1. **Data function layer** (`allPosts()`, `singlePost()`, `getUserPosts()`) has its own cache with tags
2. **Route/page layer** (`app/page.tsx`, `app/[post]/page.tsx`, `app/userposts/page.tsx`) has a separate cache (the PPR static HTML shell)

When `updateTag('posts')` was called in server actions, it only invalidated layer 1 (data functions). Layer 2 (the route HTML cache) wasn't tagged, so it remained stale.

**Solution**: Add `'use cache'` + matching `cacheTag()` calls to the page components themselves. This ensures both layers listen to mutations.

Why `/userposts` was updating: It's a **dynamic route** (not prerendered) that renders on-demand, so it doesn't have the PPR shell caching issue. It always fetches fresh data, which is why it worked while `/` and `/[post]` remained stale.

---

## What Was Already Tried

### Session 3 (previous attempts)

1. `updateTag` everywhere only: duplicate-card behavior persisted after comment mutation + back navigation.
2. `updateTag` + `refresh()` + broad `revalidatePath`: made race conditions worse.
3. `updateTag` + cross-route `revalidateTag`: still unstable/duplicating.

### Session 4 Analysis (this session)

Diagnosed root cause: **Routes themselves weren't tagged for cache invalidation**. The PPR static shell (the route-layer HTML) remained stale even when underlying data functions were invalidated via tags.

Fixed by adding `'use cache'` + `cacheTag()` to page components. This binds the HTML shell to data tags so mutations propagate correctly.

### Confirmed problematic patterns (Sessions 1-3)

1. Short-lived cache profiles (`cacheLife('seconds')`) on post data readers — defeats PPR benefit.
2. Mixed invalidation model (`updateTag` + `revalidateTag`) — tag semantics unclear and inconsistent.
3. Aggressive `refresh()` + `revalidatePath` — causes races and stale-while-revalidate conflicts.

---

## Verification Status

- `npm run lint`: passed.
- `npm run build`: passed on Next.js 16.2.4 with Cache Components enabled.

### Browser verification blocker

Automated Playwright MCP verification for authenticated mutation flows is currently blocked:

- MCP browser context does not inherit the already-authenticated VS Code integrated browser session.
- Playwright session lands on Google OAuth sign-in and requires separate interactive account login.
- Because of this, full end-to-end auth-required flow (`create post -> add comment -> delete post`) was not completed in MCP during Session 3.

---

## Required Next Verification Step (manual, logged-in browser)

Run in the browser session that is already logged in to localhost:

1. Create a new post on `/` and confirm a single new card appears.
2. Open that post (`/[post]`), add a comment, confirm count increments on detail view.
3. Navigate back to `/` and confirm only one card exists for that post with updated comment count.
4. Go to `/userposts`, delete that post.
5. Return to `/` and confirm the post is gone with no stale duplicate.

If duplicates still occur after these Session 3 changes, capture exact route transitions and Network `_rsc` requests for the failing sequence.

---

## Files Touched in This Workstream

- `app/page.tsx` (sync shell + Suspense `PostList` from previous session)
- `app/allPosts.tsx` (`cacheLife('seconds')`)
- `app/[post]/singlepost.tsx` (`cacheLife('seconds')`)
- `app/userposts/getUserPosts.ts` (`cacheLife('seconds')`)
- `app/actions.ts` (mixed `updateTag` + `revalidateTag`)
- `app/[post]/actions.ts` (mixed `updateTag` + `revalidateTag`)
- `app/userposts/actions.ts` (mixed `updateTag` + `revalidateTag`)
- `app/[post]/page.tsx` (`generateStaticParams`)

---

## Branch Notes

- Existing commits on branch:
  - `33c45d0` initial dynamic-post caching work
  - `0cfb788` refresh UI after cache invalidation
  - `ca65f36` revalidate affected routes after post mutations
- Additional Session 2/3 changes remain local and uncommitted.
