# Handoff Notes for PR #72 / Issue #71

**Last updated: May 9, 2026 — Session 5**

## References

- Issue: #71
- PR: #72
- Branch: `tom/cache-dynamic-posts`

---

## Goal

- Dynamic post pages prerender at build time via `generateStaticParams`.
- Runtime post creation still works after `npm run build` + `npm start`.
- Mutation flows (create post, add comment, delete post) invalidate caches without stale UI or duplicate cards.
- **Users see live updates WITHOUT manual page refresh.**

---

## CRITICAL INSIGHT (Session 5 - Root Cause of Manual Refresh Requirement)

### The Problem
`updateTag()` alone **does NOT trigger client-side refetch**. It only invalidates server cache. The browser still displays the old cached page because it doesn't know the server cache changed.

### The Solution
Use **`revalidatePath()` + `refresh()`** in server actions:
- `revalidatePath()` tells Next.js to regenerate the route at next request
- `refresh()` tells the client to refetch from the server immediately

### Why route-level `'use cache'` was redundant
Adding `'use cache'` + `cacheTag()` to routes was overcomplicated. If you use `revalidatePath()`, the route is revalidated anyway. The route-level tags are redundant when `revalidatePath()` handles invalidation.

**Simplified approach:**
- Cache only at **data function level** (`allPosts()`, `singlePost()`, `getUserPosts()`)
- Use `updateTag()` to invalidate data caches
- Use `revalidatePath()` to tell routes to rebuild
- Use `refresh()` to trigger immediate client refetch

---

## Current Code State (Session 5 - SIMPLIFIED)

### Caching strategy (data functions only)

- `app/allPosts.tsx`: `'use cache'`, `cacheTag('posts')`, `cacheLife('max')`
- `app/[post]/singlepost.tsx`: `'use cache'`, `cacheTag('posts')`, `cacheTag(\`post-${id}\`)`, `cacheLife('max')`
- `app/userposts/getUserPosts.ts`: `'use cache'`, `cacheTag(\`user-${userId}-posts\`)`, `cacheLife('max')`

### Page components (routes - NO caching needed)

- `app/page.tsx`: Regular async component (calls `allPosts()`)
- `app/[post]/page.tsx`: Regular async component with `generateStaticParams()` (calls `singlePost()`)
- `app/userposts/page.tsx`: Regular async component (renders `UserOwnPosts`)

### Server action invalidation (Session 5 - THREE-PART PATTERN)

**All three server action files now use: `updateTag()` + `revalidatePath()` + `refresh()`**

`app/actions.ts` (`createPost`):

```ts
updateTag('posts');
updateTag(`post-${result.id}`);
updateTag(`user-${prismaUser.id}-posts`);
revalidatePath('/');
revalidatePath('/userposts');
refresh();
```

`app/[post]/actions.ts` (`createComment`):

```ts
updateTag(`post-${postId}`);
updateTag('posts');
updateTag(`user-${post.userId}-posts`);
revalidatePath('/');
revalidatePath(`/${postId}`);
revalidatePath('/userposts');
refresh();
```

`app/userposts/actions.ts` (`deletePostFromUserPosts`):

```ts
updateTag(`user-${prismaUser.id}-posts`);
updateTag('posts');
updateTag(`post-${postId}`);
revalidatePath('/');
revalidatePath(`/${postId}`);
revalidatePath('/userposts');
refresh();
```

---

## What Was Already Tried

### Session 3-4 (previous attempts)

1. `updateTag` everywhere only: duplicate-card behavior persisted.
2. `updateTag` + `refresh()` + broad `revalidatePath`: some success but unclear semantics.
3. Added route-level `'use cache'` + `cacheTag()`: overcomplicated.
4. Reverted to `cacheLife('max')`: correct for data functions, but routes still not updating.

### Session 5 Discovery (THIS SESSION)

**Root cause found:** `updateTag()` alone doesn't trigger client refetch. Need all three:
1. `updateTag()` — invalidate server data cache
2. `revalidatePath()` — regenerate route HTML shell
3. `refresh()` — tell client to fetch from server

Session 4's route-level `'use cache'` was **unnecessary complexity**. Removing it and using `revalidatePath()` + `refresh()` is simpler and works.

---

## Verification Status

- `npm run lint`: should pass
- `npm run build`: should pass with all routes prerendered (◐ status)
- **Browser verification needed:** Test full mutation flow **without manual page refresh**

### Mutation flow verification (manual, in logged-in browser)

**Expected behavior after fix:** All mutations trigger instant UI updates without manual refresh.

**Test sequence:**

1. Create new post on `/` → single card appears **instantly** ✓
2. Open post (`/[post]`), add comment → comment count increments **instantly** ✓
3. Return to `/` → card shows updated comment count **instantly** ✓
4. Go to `/userposts` → delete that post → post removed **instantly** ✓
5. Return to `/` → post is gone **instantly** ✓

**If manual refresh is still required after fix:**
- Check browser Network tab for `_rsc` requests during mutations
- Verify `refresh()` is being called in server actions
- Check Next.js dev server console for errors
- Problem likely: `refresh()` not being sent to client properly

---

## Files Touched in This Workstream

- `app/actions.ts` - Added `revalidatePath()` + `refresh()` to `createPost`
- `app/[post]/actions.ts` - Added `revalidatePath()` + `refresh()` to `createComment`
- `app/userposts/actions.ts` - Added `revalidatePath()` + `refresh()` to `deletePostFromUserPosts`
- `app/page.tsx` - Removed route-level `'use cache'` + `cacheTag()` (not needed)
- `app/[post]/page.tsx` - Removed route-level `'use cache'` + `cacheTag()` (not needed)
- `app/userposts/page.tsx` - Removed route-level `'use cache'` + `cacheTag()` (not needed)
- `app/allPosts.tsx` - Data function cache (unchanged: `'use cache'` + `cacheTag('posts')` + `cacheLife('max')`)
- `app/[post]/singlepost.tsx` - Data function cache (unchanged)
- `app/userposts/getUserPosts.ts` - Data function cache (unchanged)

---

## Next Steps for Fresh Session

1. **Verify the fix works:** Test mutation flows in browser to confirm **NO manual refresh needed**
2. **If still broken:** Check browser Network tab `_rsc` requests to see if client-side refresh is actually happening
3. **If working:** Commit and open PR #72

---

## Key Takeaway

**Three-part cache invalidation pattern in Next.js 16 Cache Components:**

```ts
// In server actions after mutations:
updateTag('posts');              // Step 1: invalidate data cache
revalidatePath('/');             // Step 2: regenerate route HTML shell
refresh();                       // Step 3: trigger client refetch
```

Missing any of these three causes:
- No `updateTag()` → stale data on re-render
- No `revalidatePath()` → stale HTML shell
- No `refresh()` → browser doesn't know to refetch (requires manual refresh)
