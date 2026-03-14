# Next.js Debugging & Insight Tools — Reference

> Based on Next.js 16.1.6 · App Router · React · March 2026

> ⚠️ **Dev ≠ Production.** Performance numbers measured in `next dev` are meaningless — React runs in development mode (extra checks, no minification, no tree-shaking). Use dev tools to debug **logic and structure**, not to benchmark performance. For real performance data, use production instrumentation (Phase 4).

## Overview

| Phase                 | Command                         | What you're debugging                                                        |
| --------------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| **1 — Development**   | `next dev`                      | Logic, routing, component state, server errors, fetch calls                  |
| **2 — Build Process** | `next build`                    | What routes were generated, why pages are dynamic, what params were resolved |
| **3 — Build Output**  | `npx next experimental-analyze` | Bundle size, what's in your JS chunks                                        |
| **4 — Production**    | `next start` / deployed         | Real performance, real Web Vitals, server-side tracing                       |

## Table of Contents

1. [Phase 1 — Development (`next dev`)](#phase-1--development-next-dev)
   - [Default Log Routing](#default-log-routing)
   - [`logging.fetches`](#loggingfetches)
   - [`browserDebugInfoInTerminal`](#browserdebuginfointerminal)
   - [`next dev --inspect`](#next-dev---inspect)
   - [React DevTools — Three Separate Tools](#react-devtools--three-separate-tools)
   - [Next.js DevTools MCP](#nextjs-devtools-mcp)
   - [Chrome DevTools MCP](#chrome-devtools-mcp)

2. [Phase 2 — Build Process (`next build`)](#phase-2--build-process-next-build)
   - [`next build --debug`](#next-build---debug)
   - [`next build --debug-prerender`](#next-build---debug-prerender)
   - [`next build --debug-build-paths`](#next-build---debug-build-pathspath)
   - [`next build --profile`](#next-build---profile)

3. [Phase 3 — Build Output](#phase-3--build-output)
   - [`npx next experimental-analyze`](#npx-next-experimental-analyze)

4. [Phase 4 — Production](#phase-4--production)
   - [`instrumentation.ts` + OpenTelemetry](#instrumentationts--opentelemetry)
   - [`useReportWebVitals`](#usereportwebvitals)
   - [React DevTools in Production](#react-devtools-in-production)
   - [Generic Browser Tools](#generic-browser-tools)

5. [Suggested Project Setup](#suggested-project-setup)

6. [Quick Decision Guide](#quick-decision-guide)

---

## Phase 1 — Development (`next dev`)

### Default Log Routing

No flags or config needed. This is how Next.js routes output by default:

| Log type                                            | Where it appears |
| --------------------------------------------------- | ---------------- |
| Server Component logs / errors                      | CLI terminal     |
| Client Component logs / errors                      | Browser console  |
| Fetch logs (with `logging.fetches`)                 | CLI terminal     |
| Browser console (with `browserDebugInfoInTerminal`) | CLI terminal too |

---

### `logging.fetches`

Logs every `fetch()` call to the **terminal** during `next dev` **and** `next build`. Shows URL, method, cache status.

```js
// next.config.js
logging: {
  fetches: {
    fullUrl: true,   // show full URL (not truncated)
  },
},
```

---

### `browserDebugInfoInTerminal`

Forwards **browser console** output (`console.log`, errors, etc.) to the **terminal** as well.

```js
// next.config.js
browserDebugInfoInTerminal: true,
```

---

### `next dev --inspect`

Enables the **Node.js V8 inspector** so you can attach a debugger (Chrome DevTools, VS Code breakpoints, etc.) to the running server process.

```bash
next dev --inspect
```

- Opens a WebSocket on `ws://127.0.0.1:9229` by default
- Attach in Chrome via `chrome://inspect`
- Attach in VS Code via a `launch.json` entry with `"request": "attach"`
- Server-side breakpoint debugging only — not bundle analysis, not logs

---

### React DevTools — Three Separate Tools

The "React DevTools" label covers **three distinct tools** that work independently:

#### 1. Components Tab (browser extension)

Inspect the component tree, props, state, and hooks on any React site — yours or anyone else's. Works in **dev and production** (though component names may be minified in production).

No setup needed beyond installing the extension.

Install: [React DevTools on Chrome Web Store](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

#### 2. Profiler Tab (browser extension)

Record renders, see a flame graph, and rank components by render time. **Part of the same extension** as the Components tab.

| Environment            | Profiler tab                                              |
| ---------------------- | --------------------------------------------------------- |
| `next dev`             | ✅ Full profiling data                                    |
| `next build` (default) | ❌ Stripped by React for performance                      |
| `next build --profile` | ✅ Re-enabled (adds bundle overhead — temporary use only) |

#### 3. React Performance Tracks (Chrome Performance panel)

A **separate, built-in** feature in Chrome's Performance panel — no extension needed, and nothing to do with the Profiler tab above.

**Dev-only** (disabled in production). Just open Chrome DevTools → Performance → record a trace while `next dev` is running.

Adds React-specific lanes to the timeline:

| Track                 | What it shows                       |
| --------------------- | ----------------------------------- |
| **Scheduler**         | When React scheduled work           |
| **Components**        | When individual components rendered |
| **Server Components** | RSC fetch/render timing             |
| **Server Requests**   | Network requests initiated by RSCs  |

> Docs: https://react.dev/reference/dev-tools/react-performance-tracks

---

### Next.js DevTools MCP

Exposes your running `next dev` server's internals to AI coding agents (like GitHub Copilot) via the [Model Context Protocol](https://modelcontextprotocol.io).

> ⚠️ **Dev-only.** Connects to `next dev`. Has no access to production.

**Setup** — add to `.mcp.json` at the project root:

```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

Then start `next dev`. The MCP server auto-discovers and connects to the running instance.

**What agents can query:**

| Tool                      | What it returns                                               |
| ------------------------- | ------------------------------------------------------------- |
| `get_errors`              | Build errors, runtime errors, type errors from the dev server |
| `get_logs`                | Path to dev log file (browser console + server output)        |
| `get_page_metadata`       | Routes, components, rendering mode for a specific page        |
| `get_project_metadata`    | Project structure, config, dev server URL                     |
| `get_server_action_by_id` | Source file + function name for a Server Action by ID         |

---

### Chrome DevTools MCP

Connects an AI agent directly to a **Chrome browser** instance — giving it access to the DOM, console, network requests, and screenshots.

> ⚠️ **Not Next.js-aware.** This is a generic browser automation bridge. It does not know about App Router, RSCs, or Server Actions. Useful for inspecting what the browser sees, not what the server did.

**Setup** — add to `.mcp.json`:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

---

## Phase 2 — Build Process (`next build`)

### `next build --debug`

Enables **verbose build output**. Prints the routing rules that Next.js applies silently by default:

- **Redirects** (including the auto-generated trailing-slash redirect)
- **Rewrites**
- **Headers**

```bash
next build --debug
```

| Section     | Normal build | `--debug` build |
| ----------- | ------------ | --------------- |
| Route table | ✅           | ✅              |
| Redirects   | ❌ hidden    | ✅ shown        |
| Rewrites    | ❌ hidden    | ✅ shown        |
| Headers     | ❌ hidden    | ✅ shown        |

**Example output:**

```
Redirects
┌ source: /:path+/
├ destination: /:path+
└ permanent: true
```

That trailing-slash redirect is auto-generated by Next.js whenever `trailingSlash` is not explicitly set — you'd never know it's there without `--debug`.

---

### `next build --debug-prerender`

Prints detailed prerender tracing — which pages were statically generated vs. dynamically rendered and why. Useful when a page is unexpectedly dynamic.

```bash
next build --debug-prerender
```

---

### `next build --debug-build-paths=<path>`

Shows which dynamic params were generated for a specific route during `generateStaticParams`.

```bash
next build --debug-build-paths=/blog/[slug]
```

---

### `next build --profile`

Re-enables React profiling instrumentation in the production build. Lets the **React DevTools Profiler tab** work on a deployed site.

```bash
next build --profile
```

> **Temporary use only.** Adds overhead to production JS bundles. Build normally once debugging is done.

---

## Phase 3 — Build Output

### `npx next experimental-analyze`

Runs a bundle analysis and opens a **visual treemap** of your production JS bundle. No config required — reflects the actual production output.

```bash
npx next experimental-analyze
```

Use this to find:

- Unexpectedly large dependencies
- Code that should have been tree-shaken but wasn't
- Client chunks that could be split or lazy-loaded

---

## Phase 4 — Production

> ⚠️ React DevTools Performance Tracks and Next.js DevTools MCP do **not** work in production. The tools below are what you have.

### `instrumentation.ts` + OpenTelemetry

Next.js has first-class support for [OpenTelemetry](https://opentelemetry.io/) via `instrumentation.ts`. The right path for **server-side** production monitoring — traces, spans, custom metrics.

```ts
// instrumentation.ts  (project root)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./otel-setup'); // your OTel SDK bootstrap
  }
}
```

---

### `useReportWebVitals`

Built-in Next.js hook (`next/web-vitals`) — no plugin needed. Fires for every [Core Web Vital](https://web.dev/vitals/) (LCP, FID, CLS, etc.) **in production**. Forward the data to any analytics endpoint.

```tsx
// app/layout.tsx  (or a dedicated Client Component)
'use client';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric); // or POST to your analytics endpoint
  });
}
```

---

### React DevTools in Production

| Tool                     | Works in production?                                             |
| ------------------------ | ---------------------------------------------------------------- |
| Components tab           | ✅ Works — but component names may be minified                   |
| Profiler tab             | ❌ Stripped by default — use `next build --profile` to re-enable |
| React Performance Tracks | ❌ Dev-only                                                      |

The Components tab is useful for **client-side component inspection** even in production. Server Components are not visible — they only exist on the server.

---

### Generic Browser Tools

Standard browser DevTools work in production but have **no Next.js awareness**:

| Tool            | What it sees                                 |
| --------------- | -------------------------------------------- |
| Network tab     | HTTP requests (no RSC/Server Action context) |
| Performance tab | Paint, layout, scripting timings             |
| Lighthouse      | Accessibility, SEO, Core Web Vitals audit    |

These are useful for general HTTP/rendering profiling but cannot tell you anything about App Router internals, caching, or Server Components.

---

## Suggested Project Setup

Recommended `package.json` scripts:

```json
"scripts": {
  "dev": "next dev",
  "dev:inspect": "next dev --inspect",
  "debug": "next build --debug",
  "build": "next build",
  "start": "next start"
}
```

Recommended `next.config.js` additions for development:

```js
logging: {
  fetches: { fullUrl: true },   // log fetch URLs + cache status to terminal
},
// browserDebugInfoInTerminal: true,  // uncomment to mirror browser logs to terminal
```

Recommended `.mcp.json` at project root:

```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

---

## Quick Decision Guide

> "What tool do I reach for?"

| Goal                                                | Phase        | Tool                                               |
| --------------------------------------------------- | ------------ | -------------------------------------------------- |
| Set a breakpoint in server code                     | Dev          | `next dev --inspect` + attach debugger             |
| Inspect component tree / props / state              | Dev          | React DevTools → Components tab                    |
| Profile renders, find slow components               | Dev          | React DevTools → Profiler tab                      |
| See React render timing in a flame graph            | Dev          | Chrome Performance panel → React tracks            |
| See what fetch calls are made server-side           | Dev          | `logging.fetches` in `next.config.js`              |
| Mirror browser logs to terminal                     | Dev          | `browserDebugInfoInTerminal: true`                 |
| Ask AI agent about errors / routes / Server Actions | Dev          | Next.js DevTools MCP                               |
| Let AI agent inspect the browser DOM / console      | Dev          | Chrome DevTools MCP                                |
| See what redirects/rewrites are active              | Build        | `next build --debug`                               |
| See why a page is dynamic not static                | Build        | `next build --debug-prerender`                     |
| Trace which params were generated                   | Build        | `next build --debug-build-paths=/route/[param]`    |
| Analyze bundle size                                 | Build output | `npx next experimental-analyze`                    |
| Server-side tracing / performance spans             | Production   | `instrumentation.ts` + OpenTelemetry               |
| Client-side Core Web Vitals                         | Production   | `useReportWebVitals` (built-in, no plugin)         |
| Use React Profiler on a live site (temporarily)     | Production   | `next build --profile` (adds bundle overhead)      |
| General HTTP / paint / SEO audit                    | Production   | Browser DevTools: Network, Performance, Lighthouse |
