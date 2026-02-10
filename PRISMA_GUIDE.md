# Prisma Setup Guide for This Project

## Table of Contents

- [Overview](#overview)
- [The Three Prisma Packages](#the-three-prisma-packages)
- [Why Version Sync Matters](#why-version-sync-matters)
- [Understanding `prisma generate`](#understanding-prisma-generate)
- [Development vs Production Workflow](#development-vs-production-workflow)
- [The Adapter Pattern (Why We Use It)](#the-adapter-pattern-why-we-use-it)
- [Next.js Config for Turbopack](#nextjs-config-for-turbopack)
- [Common Issues & Solutions](#common-issues--solutions)
- [Quick Reference Commands](#quick-reference-commands)

---

## Overview

This project uses **Prisma 7.3.0** as the ORM (Object-Relational Mapping) tool for PostgreSQL database access. Prisma works differently than most npm packages because it generates custom TypeScript code based on your database schema.

**Current versions (all synced):**

- `prisma@7.3.0` (CLI tool - devDependencies)
- `@prisma/client@7.3.0` (Runtime library - dependencies)
- `@prisma/adapter-pg@7.3.0` (PostgreSQL adapter - dependencies)

---

## The Three Prisma Packages

### 1. `prisma` (CLI Tool)

- **Location:** `devDependencies`
- **Purpose:** Developer tooling for database operations
- **Used for:**
  - Running migrations: `npx prisma migrate dev`
  - Generating client code: `npx prisma generate`
  - Opening Prisma Studio: `npx prisma studio`
  - Database introspection: `npx prisma db pull`
- **NOT needed in production** (only during development and build time)

### 2. `@prisma/client` (Runtime Library)

- **Location:** `dependencies`
- **Purpose:** The actual code your application imports and uses
- **Example usage:**
  ```typescript
  import prisma from './prisma/client';
  const posts = await prisma.post.findMany();
  ```
- **Important:** This package is a **template** that gets filled with your schema-specific code by `prisma generate`

### 3. `@prisma/adapter-pg` (PostgreSQL Adapter)

- **Location:** `dependencies`
- **Purpose:** Connects Prisma Client to PostgreSQL using native `pg` driver
- **Benefits:**
  - Better for serverless/edge environments (Vercel, Cloudflare Workers)
  - Improved connection pooling
  - More efficient than Prisma's default query engine in certain scenarios
- **Used in:** `prisma/client.ts`
  ```typescript
  import { PrismaPg } from '@prisma/adapter-pg';
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  ```

---

## Why Version Sync Matters

**All three packages MUST be at the same version!**

### What Happens with Mismatched Versions:

```
❌ Bad: Version mismatch
prisma@7.3.0          → Generates code for v7.3.0
@prisma/client@7.2.0  → Expects code for v7.2.0
Result: Missing files like 'query_compiler_fast_bg.js'
```

```
✅ Good: Versions synced
prisma@7.3.0          → Generates code for v7.3.0
@prisma/client@7.3.0  → Expects code for v7.3.0
@prisma/adapter-pg@7.3.0
Result: Everything works!
```

### Error Signs of Version Mismatch:

- `Cannot find module './query_compiler_fast_bg.js'`
- `PrismaClientKnownRequestError`
- Runtime type errors
- Build failures

---

## Understanding `prisma generate`

### What It Does:

1. Reads your `prisma/schema.prisma` file
2. Generates TypeScript types and query methods
3. Creates code in `node_modules/.prisma/client/`
4. Populates `node_modules/@prisma/client/` with your schema-specific code

### Generated Output Includes:

- Type definitions for your models (`Post`, `User`, `Comment`, etc.)
- Type-safe query methods (`.findMany()`, `.create()`, `.update()`, etc.)
- Relation helpers
- Native database binaries for your platform

### Why It's Different from Normal npm Packages:

**Normal Package (e.g., lodash):**

```
npm install lodash → Downloads pre-built code → Ready to use ✓
```

**Prisma Client:**

```
npm install @prisma/client → Downloads empty template
↓
prisma generate → Reads YOUR schema.prisma → Generates YOUR types ✓
```

**Key Point:** The generated code is project-specific and created at install time, not downloaded from npm!

---

## Development vs Production Workflow

### Development (Your Machine):

**Initial Setup:**

```bash
npm install              # Installs all packages
# postinstall hook runs: prisma generate (auto)
npm run dev             # Start dev server
```

**When You Change `schema.prisma`:**

```bash
npx prisma migrate dev  # Updates database + runs generate automatically
# OR manually:
npx prisma generate     # Just regenerate types without DB changes
```

**You DON'T need to run `prisma generate` every time you start dev server!**

---

### Production/CI/CD (Vercel, GitHub Actions, etc.):

**What Happens:**

```bash
git clone your-repo     # Fresh start, no node_modules
npm install             # Installs packages
# postinstall hook runs: prisma generate (creates your types)
npm run build           # Builds Next.js
npm start               # Runs production server
```

**Why `postinstall` Hook:**

- CI/CD starts with empty `node_modules/`
- After `npm install`, Prisma Client is installed but not generated
- `postinstall` script auto-runs `prisma generate` after every `npm install`
- This ensures client is always ready before `npm run build`

**Our package.json:**

```json
{
  "scripts": {
    "postinstall": "prisma generate", // ← Auto-generates after npm install
    "build": "next build" // ← Simple! No manual generate needed
  }
}
```

---

## The Adapter Pattern (Why We Use It)

### Traditional Prisma Setup:

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

- Uses Prisma's default query engine
- Works fine for traditional servers

### Our Adapter Setup:

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
```

### Benefits:

1. **Better for Serverless** (Vercel, AWS Lambda)
2. **Connection Pooling** - Reuses database connections efficiently
3. **Edge Runtime Compatible** - Works with Vercel Edge Functions
4. **Native PostgreSQL Driver** - Uses battle-tested `pg` package

### When to Use Adapter Pattern:

- ✅ Deploying to Vercel
- ✅ Serverless environments
- ✅ High-traffic applications
- ✅ Need connection pooling
- ❌ Simple apps with low traffic (traditional setup is fine)

---

## Next.js Config for Turbopack

### Required Configuration:

**File:** `next.config.js`

```javascript
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // ... other config
};
```

### Why This Is Required:

**Problem:** Turbopack (Next.js 16's new bundler) tries to bundle all server code, including Prisma.

**Issue:** Prisma Client contains:

- Native binaries (`.node` files)
- WebAssembly modules
- Dynamic imports
- These can't be bundled like regular JavaScript

**Solution:** `serverExternalPackages` tells Turbopack:

> "Don't bundle these packages - use them directly from node_modules"

**Without this config:**

```
✗ Error: Cannot find module './query_compiler_fast_bg.js'
✗ Native binaries not found
✗ Runtime errors
```

**With this config:**

```
✓ Prisma used as-is from node_modules
✓ Native binaries found correctly
✓ Everything works!
```

---

## Common Issues & Solutions

### Issue 1: "Cannot find module './query_compiler_fast_bg.js'"

**Cause:** Version mismatch or missing generation

**Solution:**

```bash
# Sync all versions
npm install @prisma/client@7.3.0 @prisma/adapter-pg@7.3.0 -D prisma@7.3.0

# Clean regenerate
npx rimraf node_modules/.prisma
npx prisma generate
```

---

### Issue 2: Types Not Updating After Schema Change

**Cause:** Forgot to regenerate after modifying `schema.prisma`

**Solution:**

```bash
npx prisma migrate dev  # Updates DB + regenerates
# OR
npx prisma generate     # Just regenerates types
```

---

### Issue 3: Build Fails in CI/CD

**Cause:** Prisma Client not generated before build

**Solution:** Ensure `postinstall` hook exists in `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

---

### Issue 4: Turbopack Bundling Errors

**Cause:** Missing `serverExternalPackages` config

**Solution:** Add to `next.config.js`:

```javascript
serverExternalPackages: ['@prisma/client', 'prisma'];
```

---

## Quick Reference Commands

### Daily Development:

```bash
npm run dev                 # Start dev server (generates client on install)
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create + apply migration
```

### Schema Changes:

```bash
# After editing schema.prisma:
npx prisma migrate dev --name description_of_change
```

### Fresh Start (Troubleshooting):

```bash
# Full clean reinstall
rm -rf node_modules .next node_modules/.prisma
npm install
npx prisma generate
npm run dev
```

### Production Build:

```bash
npm install    # postinstall hook runs prisma generate
npm run build  # Builds Next.js
npm start      # Starts production server
```

### Check Versions:

```bash
npm ls prisma
npm ls @prisma/client
npm ls @prisma/adapter-pg
```

### Update All Prisma Packages:

```bash
npm install @prisma/client@latest @prisma/adapter-pg@latest -D prisma@latest
npx prisma generate
```

---

## Files Structure Reference

```
project-root/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── client.ts              # Custom Prisma Client with adapter
│   └── migrations/            # Database migrations
├── node_modules/
│   ├── .prisma/
│   │   └── client/            # Generated Prisma Client code (DO NOT COMMIT)
│   ├── @prisma/client/        # Populated by prisma generate
│   ├── @prisma/adapter-pg/    # PostgreSQL adapter
│   └── prisma/                # CLI tool
├── next.config.js             # serverExternalPackages config
└── package.json               # postinstall hook
```

**Important:** Never commit `node_modules/.prisma/` - it's generated per environment!

---

**Last Updated:** February 10, 2026  
**Prisma Version:** 7.3.0  
**Next.js Version:** 16.1.4
