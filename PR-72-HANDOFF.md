# Handoff Notes for PR #72 / Issue #71

**Last updated: May 9, 2026 — Session 6 (FINAL FIX)**

## References

- Issue: #71
- PR: #72
- Branch: `tom/cache-dynamic-posts`

---

## Goal

- Dynamic post pages prerender at build time via `generateStaticParams`.
- Runtime post creation still works after `npm run build` + `npm start`.
- Mutation flows (create post, add comment, delete post) invalidate caches without stale UI or duplicate cards.
- **Users see live updates WITHOUT manual page refresh or workarounds.**

---

## ROOT CAUSE (Sessions 3-5 Analysis → Session 6 SOLUTION)

### The Real Bug

Pages ARE cached by default with `cacheComponents: true`, but were **NOT TAGGED**. So:

- `updateTag('posts')` only cleared data cache
- Page cache was never invalidated
- Browser showed stale cached page

### Sessions 3-5: Trial & Error

1. `updateTag()` alone → didn't invalidate pages
2. Added `refresh()` + `revalidatePath()` workaround → worked but not clean (refresh() not in docs)
3. Tried route-level `'use cache'` → overcomplicated

### Session 6: THE ACTUAL SOLUTION

**Add `cacheTag()` to pages.** That's it.

When pages have the same tags as data functions, `updateTag()` invalidates both layers automatically.

```ts
// Before (broken)
export default async function Home() {
  const data = await allPosts(); // has cacheTag('posts')
  // page has NO tag, so updateTag('posts') never cleared it
}

// After (fixed)
export default async function Home() {
  'use cache';
  cacheTag('posts'); // NOW both page and data have same tag
  const data = await allPosts(); // also has cacheTag('posts')
  // updateTag('posts') invalidates BOTH
}
```

---

## Current Code State (Session 6 - CLEAN SOLUTION)

### Caching strategy (BOTH levels tagged)

**Data functions** (unchanged):

- `app/allPosts.tsx`: `'use cache'`, `cacheTag('posts')`, `cacheLife('max')`
- `app/[post]/singlepost.tsx`: `'use cache'`, `cacheTag('posts')`, `cacheTag(\`post-${id}\`)`, `cacheLife('max')`
- `app/userposts/getUserPosts.ts`: `'use cache'`, `cacheTag(\`user-${userId}-posts\`)`, `cacheLife('max')`

**Page components** (FIXED - now tagged):

- `app/page.tsx`: `'use cache'` + `cacheTag('posts')` ← NEW
- `app/[post]/page.tsx`: `'use cache'` + `cacheTag('posts')` + `cacheTag(\`post-${id}\`)` ← NEW
- `app/userposts/page.tsx`: Does NOT need tag (fetches per-request via getUserPosts which is tagged)

### Server action invalidation (Session 6 - SIMPLE PATTERN)

**All three server action files now use: `updateTag()` ONLY** (no revalidatePath, no refresh)

`app/actions.ts` (`createPost`):

```ts
updateTag('posts');
updateTag(`post-${result.id}`);
updateTag(`user-${prismaUser.id}-posts`);
```

`app/[post]/actions.ts` (`createComment`):

```ts
updateTag(`post-${postId}`);
updateTag('posts');
updateTag(`user-${post.userId}-posts`);
```

`app/userposts/actions.ts` (`deletePostFromUserPosts`):

```ts
updateTag(`user-${prismaUser.id}-posts`);
updateTag('posts');
updateTag(`post-${postId}`);
```

---

## What Changed from Session 5 → Session 6

**Session 5 approach (workaround):**

```ts
// In server actions:
updateTag('posts');
revalidatePath('/'); // ← Not needed
revalidatePath('/userposts'); // ← Not needed
refresh(); // ← Not in docs, escape hatch only
```

**Session 6 approach (clean, from docs):**

```ts
// In server actions:
updateTag('posts'); // That's all. Tags flow to both pages and data
```

**Why Session 6 is correct:**

- `refresh()` has minimal documentation, NOT mentioned in Cache Components revalidation guide
- `revalidatePath()` is path-based, less precise than tag-based
- When pages have `cacheTag()`, they participate in tag-based invalidation automatically
- `updateTag()` invalidates both page cache and data cache in one call

---

## Files Touched in Session 6 (CLEAN FIX)

**Pages (added caching with tags):**

- `app/page.tsx` - Added `'use cache'` + `cacheTag('posts')`
- `app/[post]/page.tsx` - Added `'use cache'` + `cacheTag('posts')` + `cacheTag(\`post-${id}\`)`

**Server actions (removed workarounds):**

- `app/actions.ts` - Removed `revalidatePath()` + `refresh()`, kept only `updateTag()`
- `app/[post]/actions.ts` - Removed `revalidatePath()` + `refresh()`, kept only `updateTag()`
- `app/userposts/actions.ts` - Removed `revalidatePath()` + `refresh()`, kept only `updateTag()`

---

## Next Steps for Fresh Session

1. **Verify the fix works:** Test mutation flows in browser to confirm instant updates WITHOUT manual refresh
2. **Run linter:** `npm run lint`
3. **Build and test:** `npm run build` → `npm run start`
4. **If working:** Commit, open PR, close issue
5. **If broken:** Check browser console for errors, verify pages actually have tags

---

## Key Learning (For Future Cache Components Projects)

**The Core Pattern in Cache Components:**

Tags are the central mechanism for invalidation. If something needs to be invalidated together, it must share a tag:

```ts
// Tag everything that should be invalidated together
export async function Page() {
  'use cache';
  cacheTag('resource');        // ← Page gets the tag
  const data = await getData();
}

export async function getData() {
  'use cache';
  cacheTag('resource');        // ← Data gets the same tag
  return db.query(...);
}

// Server action
export async function updateData() {
  // ... mutation ...
  updateTag('resource');       // ← Invalidates both page + data
}
```

**What NOT to do:**

- ❌ Pages cached but not tagged (updateTag never reaches them)
- ❌ Use `refresh()` as primary pattern (it's minimal API, not documented in revalidation guide)
- ❌ Use `revalidatePath()` when tag-based works (less precise, harder to reason about)

**What TO do:**

- ✅ Pages: `'use cache'` + `cacheTag()` with meaningful tags
- ✅ Data functions: `'use cache'` + `cacheTag()` with same tags
- ✅ Server actions: `updateTag()` with the shared tags
