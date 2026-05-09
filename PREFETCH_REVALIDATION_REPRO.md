# Prefetch + Revalidation Issue - Minimal Reproduction Guide

**Date Created:** May 9, 2026  
**Issue Context:** PR #72 (Cache Components with Dynamic Posts)  
**Repository Reference:** https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma/pull/72

---

## Problem Statement

When using Next.js Cache Components with prefetch enabled, prefetched RSC payloads may not refresh after `updateTag()` invalidation. Setting `prefetch={false}` on navigation links works around the issue, but according to Next.js docs, invalidations should silently refresh associated prefetches.

**Docs Reference:** https://nextjs.org/docs/app/guides/prefetching#prefetching-optimizations

> "Data invalidations (`revalidateTag`, `revalidatePath`) silently refresh associated prefetches"

---

## Expected Behavior

1. Page is cached with `'use cache'` + `cacheTag('posts')`
2. Data fetcher has `cacheTag('posts')`
3. User creates a post → server action calls `updateTag('posts')`
4. User navigates via prefetched link to list page
5. **Expected:** Fresh data appears (prefetch payload was invalidated and re-fetched)
6. **Actual:** Stale data appears (prefetch returned cached payload)

---

## Actual Behavior (Bug Observed)

- Prefetch caches the RSC payload at build/initial-request time
- `updateTag('posts')` invalidates data cache but not prefetch cache
- On navigation, browser serves stale prefetched RSC payload
- **Workaround found:** `prefetch={false}` forces fresh request on click

---

## Reproduction Steps

### Setup (in a fresh Next.js repo)

```bash
npm create next-app@latest repro-prefetch-revalidation --typescript --app
cd repro-prefetch-revalidation
npm install prisma @prisma/client
```

### 1. Initialize Database

**`prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Post {
  id    Int     @id @default(autoincrement())
  title String
  slug  String  @unique
  count Int     @default(0)
  createdAt DateTime @default(now())
}
```

**`.env.local`:**

```
DATABASE_URL="file:./dev.db"
```

```bash
npx prisma migrate dev --name init
npx prisma db seed  # Creates 1 seed post with slug "post-1"
```

**`prisma/seed.ts`:**

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.post.create({
    data: {
      title: 'Post 1',
      slug: 'post-1',
      count: 0,
    },
  });
}

main();
```

### 2. Create Data Fetcher

**`app/allPosts.tsx`:**

```tsx
import { cacheTag, cacheLife } from 'next/cache';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function allPosts() {
  'use cache';
  cacheTag('posts');
  cacheLife('max');

  console.log('[allPosts] Fetching posts from DB');

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return posts;
}
```

### 3. Create List Page (cached + tagged)

**`app/page.tsx`:**

```tsx
import Link from 'next/link';
import { cacheTag } from 'next/cache';
import allPosts from './allPosts';

export default async function Home() {
  'use cache';
  cacheTag('posts');

  const posts = await allPosts();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Posts</h1>
      <button style={{ marginBottom: '20px' }}>
        <Link href="/create">Create Post</Link>
      </button>

      <ul>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: '10px' }}>
            <Link href={`/posts/${post.slug}`}>
              {post.title} (count: {post.count})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4. Create Detail Page (cached + tagged)

**`app/posts/[slug]/page.tsx`:**

```tsx
import Link from 'next/link';
import { cacheTag, cacheLife } from 'next/cache';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function PostDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  'use cache';
  const { slug } = await params;
  cacheTag('posts');
  cacheTag(`post-${slug}`);
  cacheLife('max');

  console.log(`[PostDetail] Fetching post: ${slug}`);

  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>{post.title}</h1>
      <p>Count: {post.count}</p>
      <button style={{ marginBottom: '20px' }}>
        <Link href="/">Back to Posts</Link>
      </button>
      <button onClick={() => {}}>Increment Count</button>
    </div>
  );
}
```

### 5. Create Post Form (with updateTag)

**`app/create/page.tsx`:**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const slug = `post-${Date.now()}`;

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug }),
    });

    if (res.ok) {
      setTitle('');
      router.push('/');
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Create Post</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          required
          style={{ padding: '8px', marginRight: '8px' }}
        />
        <button type="submit">Create</button>
      </form>
      <br />
      <Link href="/">Back</Link>
    </div>
  );
}
```

### 6. Create API Route (calls updateTag)

**`app/api/posts/route.ts`:**

```ts
import { updateTag } from 'next/cache';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { title, slug } = await req.json();

  console.log('[API] Creating post:', title);

  const post = await prisma.post.create({
    data: { title, slug, count: 0 },
  });

  // Invalidate caches
  updateTag('posts');
  updateTag(`post-${slug}`);

  return NextResponse.json(post);
}
```

---

## Test Procedure

### Setup & Build

```bash
npm run build
npm start
```

### Test 1: WITH Prefetch (Default Behavior)

1. Open browser → http://localhost:3000 (home page with post list)
2. **Note the console output:** `[allPosts] Fetching posts from DB`
3. Click "Create Post"
4. Enter title: "Test Post 123"
5. Click "Create"
6. **Should redirect to home** and show new post
7. **CHECK CONSOLE:** Do you see `[allPosts] Fetching posts from DB` again?
   - ✅ **Expected:** Yes (fresh fetch, prefetch invalidated)
   - ❌ **Bug:** No (stale prefetch served)

### Test 2: WITH `prefetch={false}` (Workaround)

**Modify `app/page.tsx`:**

```tsx
// Change the Link to have prefetch={false}
<Link href="/create" prefetch={false}>
  Create Post
</Link>
```

**Then in `app/posts/[slug]/page.tsx`:**

```tsx
<Link href="/" prefetch={false}>
  Back to Posts
</Link>
```

Repeat Test 1 steps. **Expected:** Console shows fresh fetch now.

---

## Related Documentation

- **Next.js Prefetching Guide:** https://nextjs.org/docs/app/guides/prefetching
- **Cache Components (use cache):** https://nextjs.org/docs/app/api-reference/directives/use-cache
- **cacheTag():** https://nextjs.org/docs/app/api-reference/functions/cacheTag
- **updateTag():** https://nextjs.org/docs/app/api-reference/functions/updateTag
- **How Revalidation Works:** https://nextjs.org/docs/app/guides/how-revalidation-works

---

## Original PR & Discussion

**PR #72 (Cache Components with Dynamic Posts):**  
https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma/pull/72

**Issue #71 (Original Issue):**  
https://github.com/spatulatom/testing-next-13-beta-typescript-tailwind-prisma/issues/71

**Workaround Applied:** Set `prefetch={false}` on navigation links to prevent stale cached payloads.

---

## Expected Next.js Behavior (Per Docs)

From https://nextjs.org/docs/app/guides/prefetching#prefetching-optimizations:

> When PPR is enabled, a page is divided into a static shell and a streamed dynamic section:
>
> - The shell, which can be prefetched, streams immediately
> - Uncached data streams when ready
> - **Data invalidations (`revalidateTag`, `revalidatePath`) silently refresh associated prefetches**

**Current Observation:** Prefetch payloads do NOT appear to refresh after `updateTag()` in standard setup.

---

## What to Report (Issue Template)

**Title:** Prefetched RSC payloads not refreshed after `updateTag()` invalidation

**Description:**

When using Cache Components with `'use cache'` + `cacheTag()` on both pages and data fetchers, calling `updateTag()` in a server action does not invalidate prefetched RSC payloads. Subsequent navigation via prefetched Link returns stale data. Setting `prefetch={false}` works around the issue but contradicts docs stating invalidations should refresh prefetches.

**Steps to Reproduce:**

1. Create cached page with `'use cache'` + `cacheTag('posts')`
2. Create data fetcher with `'use cache'` + `cacheTag('posts')`
3. Create server action that calls `updateTag('posts')`
4. Trigger mutation and navigate via prefetched Link
5. Observe: Stale data shown; console shows no fresh fetch

**Expected:** Fresh fetch after `updateTag()` invalidation
**Actual:** Stale prefetch payload served

**Workaround:** `prefetch={false}` forces fresh request

---

## Quick Reference: Files to Create

```
repro-prefetch-revalidation/
├── prisma/
│   ├── schema.prisma        (model definition)
│   └── seed.ts              (initial data)
├── app/
│   ├── page.tsx             (home - cached + tagged)
│   ├── allPosts.tsx         (data fetcher - cached + tagged)
│   ├── create/
│   │   └── page.tsx         (form page)
│   ├── posts/
│   │   └── [slug]/
│   │       └── page.tsx     (detail - cached + tagged)
│   └── api/
│       └── posts/
│           └── route.ts     (API endpoint - calls updateTag)
├── .env.local               (DATABASE_URL)
└── package.json             (with prisma added)
```

---

## Notes for Fresh Repository

- Use **Next.js latest stable** (or canary for latest Cache Components features)
- Enable `cacheComponents: true` in `next.config.ts`
- Seed DB with at least one post before first build
- Run `npm run build && npm start` to test with production cache behavior
- Monitor console logs for `[allPosts]` and `[PostDetail]` to see if DB is queried on each navigation

---

**Last Updated:** May 9, 2026
