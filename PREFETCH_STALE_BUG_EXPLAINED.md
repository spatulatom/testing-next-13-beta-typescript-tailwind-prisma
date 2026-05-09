# Prefetch + Revalidation Bug Explained

This note explains what happened, why it was confusing, how to reproduce it, and how to avoid it in future work.

## Short Answer

Yes, your intuition is close.

- Next.js Link prefetch is usually on by default in production.
- A prefetched RSC payload for `/` can exist before you run a mutation.
- After mutation, `updateTag("items")` should make the next navigation fresh.
- In the bug scenario, navigation can still use an older prefetched payload once, so you see stale UI until reload.
- With `prefetch={false}`, click navigation fetches on demand, so it more reliably shows fresh data.

## What We Know vs What We Infer

### Proven by production testing

- Stale result reproduced on Next.js `16.2.4` in production mode.
- Same reduced repro did not show stale on `16.2.6` during local production tests.
- `prefetch={false}` on the Home link removed the stale behavior in the tested flow.

### Strong inference (most likely mechanism)

- A prefetched client-side route payload and tag invalidation refresh are not always perfectly synchronized in this edge case.
- The shared layout had a suspending nav with fallback and resolved states, which increases timing complexity around which nav state is clicked and which prefetched entry is used.
- Result: one navigation can consume a stale prefetched payload before fresh payload replacement wins.

## Why This Feels Wrong

You are right: by docs intent, invalidation and prefetch refresh should align.

- `updateTag()` is documented for read-your-own-writes.
- Prefetch docs state invalidations should refresh associated prefetches.

So stale after mutation is not expected behavior. That is why this was treated as a framework bug report, not app misuse.

## Mental Model (Simple)

Think of two caches involved in navigation:

1. Server/data cache (tagged with `cacheTag`)
2. Client prefetched route payload cache (for Link navigation)

Mutation calls `updateTag("items")` and invalidates server-tagged data immediately.

Expected: client prefetched payload for `/` is refreshed before click navigation uses it.

Observed in the repro edge case: click can still consume old prefetched payload once.

## Reproduce (Production Only)

Use the reduced repro app and run:

```bash
npm install
npm run build
npm run start
```

Flow:

1. Open `/`
2. Confirm nav status shows default prefetch mode
3. Create item
4. Open item
5. Add comment
6. Click top Home link
7. Observe possible stale row (`0 comments`) until hard reload

Control check:

- Set `NEXT_PUBLIC_DISABLE_HOME_PREFETCH=1`
- Build/start again
- Repeat flow
- Expected fresh row after navigation

## Why `prefetch={false}` Helped

When prefetch is disabled on that link, Next fetches route data at click time instead of reusing preloaded route payload.

That narrows or removes the race window where stale prefetched payload can be consumed.

## How To Avoid This In Future

For mutation-sensitive navigation paths (create/edit/delete -> navigate to list):

1. Disable prefetch on critical links (`prefetch={false}`)
2. Keep tag strategy consistent (`cacheTag` on readers, `updateTag` on writers)
3. Validate in production builds (`next build && next start`), not only `next dev`
4. Prefer one clear navigation target after mutation (reduce duplicate competing link states in complex layouts)
5. Keep a version matrix in notes when behavior changes across Next versions

## Team Rule Of Thumb

- Read-heavy static routes: default prefetch is great.
- Post-mutation consistency-critical routes: prefer `prefetch={false}` unless you have verified no stale transition in production.

## Debug Checklist

If stale shows up again:

1. Confirm route has `use cache` + correct `cacheTag`
2. Confirm mutation action calls `updateTag` for the same tag
3. Re-test in production build
4. Toggle `prefetch={false}` to isolate prefetch involvement
5. Clear `.next` when route structure changes to avoid stale generated types
6. Record exact Next version and result matrix

## Bottom Line

You were not imagining it. The behavior looked like prefetch and invalidation getting briefly out of sync in a specific timing/layout scenario. Disabling prefetch on that critical navigation path is a practical and valid mitigation until framework behavior is fully consistent across versions.
