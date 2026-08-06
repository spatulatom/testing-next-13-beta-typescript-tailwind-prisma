# The Schema as Raw PostgreSQL

This is what `prisma/schema.prisma` would look like if it were written by hand as plain SQL, plus copy-paste-ready queries for the things the app actually does.

Notes on the translation:

- Prisma's `@default(cuid())` has **no** Postgres equivalent — cuids are generated in JS. In raw SQL you either generate the id in your app code or switch to `gen_random_uuid()` (shown below, from the built-in `pgcrypto`/PG13+ core).
- `@updatedAt` is also Prisma-side magic. In raw SQL it needs a trigger (included).
- Prisma model names are singular and PascalCase, and it quotes them. Raw SQL convention is usually `snake_case` plural — the DDL below keeps Prisma's exact names so it stays a true 1:1 mirror and you could point Prisma at it unchanged.

---

## 1. Schema (DDL)

```sql
-- =========================================
-- Users
-- =========================================
CREATE TABLE "User" (
  "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"          TEXT,
  "email"         TEXT UNIQUE,
  "emailVerified" TIMESTAMP(3),
  "image"         TEXT
);

-- =========================================
-- Posts
-- =========================================
CREATE TABLE "Post" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "title"     TEXT    NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "userId"    TEXT    NOT NULL,

  CONSTRAINT "Post_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- =========================================
-- Hearts (likes) — one per user per post
-- =========================================
CREATE TABLE "Heart" (
  "id"     TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,

  CONSTRAINT "Heart_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Heart_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT "Heart_postId_userId_key" UNIQUE ("postId", "userId")
);

-- =========================================
-- Comments
-- =========================================
CREATE TABLE "Comment" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title"     TEXT NOT NULL,
  "postId"    TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Comment_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Comment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- =========================================
-- NextAuth: Account
-- =========================================
CREATE TABLE "Account" (
  "id"                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"            TEXT NOT NULL,
  "type"              TEXT NOT NULL,
  "provider"          TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token"     TEXT,
  "access_token"      TEXT,
  "expires_at"        INTEGER,
  "token_type"        TEXT,
  "scope"             TEXT,
  "id_token"          TEXT,
  "session_state"     TEXT,

  CONSTRAINT "Account_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT "Account_provider_providerAccountId_key"
    UNIQUE ("provider", "providerAccountId")
);

-- =========================================
-- NextAuth: Session
-- =========================================
CREATE TABLE "Session" (
  "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId"       TEXT NOT NULL,
  "expires"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================================
-- NextAuth: VerificationToken
-- =========================================
CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token"      TEXT NOT NULL UNIQUE,
  "expires"    TIMESTAMP(3) NOT NULL,

  CONSTRAINT "VerificationToken_identifier_token_key"
    UNIQUE ("identifier", "token")
);
```

### The `@updatedAt` trigger

Prisma sets `updatedAt` from the client. Without Prisma you want the database to do it:

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Post_set_updated_at"
BEFORE UPDATE ON "Post"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### Teardown

```sql
DROP TABLE IF EXISTS
  "VerificationToken", "Session", "Account",
  "Comment", "Heart", "Post", "User"
CASCADE;
```

---

## 2. Prisma ↔ SQL cheat sheet

| Prisma | Raw SQL |
| --- | --- |
| `@id` | `PRIMARY KEY` |
| `@unique` | `UNIQUE` |
| `@@unique([a, b])` | `UNIQUE (a, b)` — composite |
| `String?` | `TEXT` (nullable) |
| `String` | `TEXT NOT NULL` |
| `@default(now())` | `DEFAULT CURRENT_TIMESTAMP` |
| `@default(false)` | `DEFAULT false` |
| `@default(cuid())` | *nothing* — app-generated, or `gen_random_uuid()::text` |
| `@updatedAt` | `BEFORE UPDATE` trigger |
| `@db.Text` | `TEXT` (already the default here) |
| `@relation(... onDelete: Cascade)` | `FOREIGN KEY ... ON DELETE CASCADE` |
| `onDelete` omitted | `ON DELETE RESTRICT` (Prisma's default for required relations) |
| `posts Post[]` | *nothing* — the FK on the child side is the whole relation |

That last row is the big conceptual one: **relation fields are not columns.** `User.posts` exists only in Prisma's type layer; in SQL the relationship lives entirely in `Post."userId"`.

---

## 3. Queries

### Feed: published posts with author, heart count, comment count

Prisma:

```ts
prisma.post.findMany({
  where: { published: true },
  include: { user: true, _count: { select: { hearts: true, comments: true } } },
  orderBy: { createdAt: 'desc' },
});
```

SQL:

```sql
SELECT
  p."id",
  p."title",
  p."createdAt",
  u."name"  AS author_name,
  u."image" AS author_image,
  COUNT(DISTINCT h."id") AS heart_count,
  COUNT(DISTINCT c."id") AS comment_count
FROM "Post" p
JOIN "User"    u ON u."id" = p."userId"
LEFT JOIN "Heart"   h ON h."postId" = p."id"
LEFT JOIN "Comment" c ON c."postId" = p."id"
WHERE p."published" = true
GROUP BY p."id", u."name", u."image"
ORDER BY p."createdAt" DESC
LIMIT 20;
```

> `COUNT(DISTINCT ...)` matters here: joining two one-to-many tables at once multiplies rows. Without `DISTINCT` a post with 3 hearts and 4 comments reports 12 of each.

A cleaner alternative that avoids the fan-out entirely — subqueries:

```sql
SELECT
  p."id",
  p."title",
  u."name" AS author_name,
  (SELECT COUNT(*) FROM "Heart"   h WHERE h."postId" = p."id") AS heart_count,
  (SELECT COUNT(*) FROM "Comment" c WHERE c."postId" = p."id") AS comment_count
FROM "Post" p
JOIN "User" u ON u."id" = p."userId"
WHERE p."published" = true
ORDER BY p."createdAt" DESC;
```

### One post with its comments and commenters

```sql
SELECT
  c."id",
  c."title",
  c."createdAt",
  u."name"  AS commenter_name,
  u."image" AS commenter_image
FROM "Comment" c
JOIN "User" u ON u."id" = c."userId"
WHERE c."postId" = $1
ORDER BY c."createdAt" ASC;
```

### Did *this* user heart *this* post?

```sql
SELECT EXISTS (
  SELECT 1 FROM "Heart"
  WHERE "postId" = $1 AND "userId" = $2
) AS hearted;
```

### Toggle a heart

Add — the composite unique makes double-hearting a no-op:

```sql
INSERT INTO "Heart" ("id", "postId", "userId")
VALUES (gen_random_uuid()::text, $1, $2)
ON CONFLICT ("postId", "userId") DO NOTHING
RETURNING "id";
```

Remove:

```sql
DELETE FROM "Heart"
WHERE "postId" = $1 AND "userId" = $2;
```

True toggle in one round trip:

```sql
WITH removed AS (
  DELETE FROM "Heart"
  WHERE "postId" = $1 AND "userId" = $2
  RETURNING 1
)
INSERT INTO "Heart" ("id", "postId", "userId")
SELECT gen_random_uuid()::text, $1, $2
WHERE NOT EXISTS (SELECT 1 FROM removed)
RETURNING 'added' AS action;
```

### Create a post

```sql
INSERT INTO "Post" ("id", "title", "published", "userId")
VALUES (gen_random_uuid()::text, $1, $2, $3)
RETURNING "id", "createdAt";
```

### Publish / unpublish

```sql
UPDATE "Post"
SET "published" = NOT "published"
WHERE "id" = $1 AND "userId" = $2   -- ownership check baked into the WHERE
RETURNING "published";
```

### Delete a post

Hearts and comments disappear with it via `ON DELETE CASCADE` — no manual cleanup:

```sql
DELETE FROM "Post" WHERE "id" = $1 AND "userId" = $2;
```

### A user's own posts, drafts included

```sql
SELECT "id", "title", "published", "createdAt", "updatedAt"
FROM "Post"
WHERE "userId" = $1
ORDER BY "updatedAt" DESC;
```

### Most-hearted posts

```sql
SELECT p."id", p."title", COUNT(h."id") AS hearts
FROM "Post" p
LEFT JOIN "Heart" h ON h."postId" = p."id"
WHERE p."published" = true
GROUP BY p."id"
ORDER BY hearts DESC, p."createdAt" DESC
LIMIT 10;
```

### NextAuth: session lookup

The query the adapter runs on essentially every request:

```sql
SELECT
  s."sessionToken", s."expires",
  u."id", u."name", u."email", u."image"
FROM "Session" s
JOIN "User" u ON u."id" = s."userId"
WHERE s."sessionToken" = $1
  AND s."expires" > NOW();
```

### NextAuth: find user by OAuth account

```sql
SELECT u.*
FROM "User" u
JOIN "Account" a ON a."userId" = u."id"
WHERE a."provider" = $1
  AND a."providerAccountId" = $2;
```

### Housekeeping: expired sessions and tokens

```sql
DELETE FROM "Session"           WHERE "expires" < NOW();
DELETE FROM "VerificationToken" WHERE "expires" < NOW();
```

---

## 4. Indexes worth adding

Prisma creates indexes for `@id`, `@unique`, and `@@unique` — but **not** for plain foreign keys (Postgres doesn't either). Every one of these columns is used in a `WHERE` or `JOIN` above:

```sql
CREATE INDEX "Post_userId_idx"    ON "Post"("userId");
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX "Heart_userId_idx"   ON "Heart"("userId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- feed ordering
CREATE INDEX "Post_published_createdAt_idx"
  ON "Post"("published", "createdAt" DESC);
```

`"Heart"` needs no `postId` index — the `("postId", "userId")` unique constraint's index already covers leading-column lookups on `postId`.

---

## 5. Running these against the existing Prisma setup

You don't have to abandon Prisma to use any of this:

```ts
// Typed, parameterized — the $1/$2 placeholders above map to the template slots
const rows = await prisma.$queryRaw<{ id: string; title: string }[]>`
  SELECT "id", "title" FROM "Post" WHERE "userId" = ${userId}
`;

// For writes with no rows returned
await prisma.$executeRaw`DELETE FROM "Heart" WHERE "postId" = ${postId}`;
```

Use the tagged-template form (`` $queryRaw`...` ``), not `$queryRawUnsafe` — the tagged version parameterizes interpolated values instead of concatenating them into the string.
