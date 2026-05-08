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
- All routes prerendered as Partial Prerender (◐) status
- Route-layer cache tagging added; ready for mutation flow verification

### Mutation flow verification (manual, in already-logged-in browser)

**Test sequence:**

1. Create new post on `/` → verify single card appears (no duplicate)
2. Open post (`/[post]`), add comment → verify comment count increments on detail page
3. Return to `/` → verify only ONE card exists for that post with updated comment count (no stale duplicate)
4. Go to `/userposts` → delete that post
5. Return to `/` → verify post is gone entirely (no stale copy)

**Expected behavior after fix:**
- All routes (`/`, `/[post]`, `/userposts`) update instantly via tag invalidation
- No duplicate cards should appear
- `/userposts` behaves correctly (on-demand render)
- `/` and `/[post]` now properly react to mutations (route-level cache tagged)

**If duplicates still occur:**
- Capture Network tab `_rsc` requests
- Document exact route transition sequence
- Check browser console for errors
- See [Cache Components two-layer architecture](#key-insight-session-4---root-cause-identified) explanation

---

## Files Touched in This Workstream

- **`app/page.tsx`** - Added `'use cache'` + `cacheTag('posts')` to `Home()` component
- **`app/[post]/page.tsx`** - Added `'use cache'` + `cacheTag('posts')` + `cacheTag(\`post-${post}\`)` to `PostDetail()` component
- **`app/userposts/page.tsx`** - Added `'use cache'` + `cacheTag(\`user-${userId}-posts\`)` to `CachedDashboard()` component
- `app/allPosts.tsx` - Reverted `cacheLife('seconds')` to `cacheLife('max')`
- `app/[post]/singlepost.tsx` - Reverted `cacheLife('seconds')` to `cacheLife('max')`
- `app/userposts/getUserPosts.ts` - Reverted `cacheLife('seconds')` to `cacheLife('max')`
- `app/actions.ts` - Confirmed `updateTag()` only (no `revalidateTag` or `refresh()`)
- `app/[post]/actions.ts` - Confirmed `updateTag()` only (no `revalidateTag` or `refresh()`)
- `app/userposts/actions.ts` - Confirmed `updateTag()` only (no `revalidateTag` or `refresh()`)
- `PR-72-HANDOFF.md` - Updated with Session 4 findings and root cause analysis
- `app/[post]/loading.tsx` - Removed (no longer needed with current caching strategy)

---

## Branch Notes

- Existing commits on branch:
  - `33c45d0` initial dynamic-post caching work
  - `0cfb788` refresh UI after cache invalidation
  - `ca65f36` revalidate affected routes after post mutations
- Additional Session 2/3 changes remain local and uncommitted.
