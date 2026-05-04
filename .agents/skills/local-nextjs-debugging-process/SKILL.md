---
name: local-nextjs-debugging-process
description: Phase-based workflow for debugging Next.js 16+ apps across development, build, build output, and production. Use when investigating route behavior, Suspense or loading fallbacks, hydration mismatches, server or browser log confusion, PPR or cache behavior, or when a human or agent needs a disciplined Next.js debugging sequence instead of ad hoc tool hopping.
disable-model-invocation: true
---

# Next.js Debugging Process

Use this skill to move through a Next.js debugging investigation in the right order, with the right source of truth for each question.

**High-level summary:** Start in Phase 1 (`next dev`) to observe live behavior. If the symptom is unexplained, escalate to Phase 2 (`next build`) to check route classification. If classification looks correct, inspect Phase 3 (emitted build files) for what bytes were actually delivered. Only move to Phase 4 (production) for issues that cannot be reproduced locally. Always move through phases in order; do not skip.

This skill follows a four-phase model:

| Phase | Environment  | Main question                                        |
| ----- | ------------ | ---------------------------------------------------- |
| 1     | `next dev`   | What is the app doing right now?                     |
| 2     | `next build` | How is Next.js classifying and generating the route? |
| 3     | Build output | What bytes did the build actually emit?              |
| 4     | Production   | What happens under real runtime and real telemetry?  |

## When to Use

- User asks to debug a Next.js route, page, layout, action, loading state, hydration issue, or cache behavior
- User wants to know which Next.js debugging tool to use next
- A human and an agent need a shared investigation workflow
- The same symptom appears to show up differently in terminal, browser, dev overlay, MCP logs, or built output
- A route looks static but still shows `Loading...`, a Suspense fallback, or deferred HTML markers

## Hard Rules

### Investigation Constraints

- Start from the symptom, then choose the phase. Do not start from a favorite tool.
- Distinguish log origin from log surface.
- Always escalate one phase at a time (dev → build → build output → production) without skipping any phase, even if the issue seems clear earlier.
- State the likely fix, not just the diagnosis.
- Record evidence in a shared note using [templates/debugging-note-template.md](./templates/debugging-note-template.md) when the investigation spans multiple steps.

### Development Constraints

- Treat `next dev` as logic and structure debugging, not as a performance benchmark. Do not use `next dev` timings as real performance evidence.
- React DevTools Profiler and Chrome Performance panel React tracks are valid for identifying relative render cost and bottlenecks during development, but their timings must not be treated as production performance benchmarks.
- Do not assume Chrome Network Preview reflects post-script or post-hydration content.
- Do not treat Next.js DevTools MCP `get_logs` as equivalent to the live terminal.

### Build Constraints

- Use built files in `.next/` as the source of truth when the question is about delivered HTML.
- Do not assume `0 dynamic holes` means there is no Suspense fallback.
- Do not call something a PPR issue until route classification and emitted HTML support that claim.
- Do not jump to production before checking whether the local build already explains the behavior.

## Core Mental Model

Three layers are easy to confuse:

| Layer                   | What it answers               | Typical tools                                                            |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| Docs and guidance       | What should happen            | Next.js docs, internal notes, this skill                                 |
| Live runtime inspection | What the running app is doing | Next.js DevTools MCP, React DevTools, browser tools, `next-browser`      |
| Build truth             | What Next.js emitted          | `next build --debug*`, `.next/server/app/*.html`, `experimental-analyze` |

Use live tools for symptoms. Use build tools for classification. Use emitted files for proof.

## Debugging Flow

### Step 1: Classify the question

Pick the narrowest question first:

- Logic, routing, fetches, server errors, component state, hydration mismatch: Phase 1
- Static versus dynamic, redirects, rewrites, prerender classification, generated params: Phase 2
- What HTML or chunks were actually emitted: Phase 3
- Real Web Vitals, tracing, production-only runtime behavior: Phase 4

### Step 2: Phase 1, development first

Use `next dev` to debug live behavior.

#### Server and terminal checks

- Default log routing: server logs in terminal, client logs in browser
- `logging.fetches` when you need server-side fetch visibility
- `logging.browserToTerminal` when terminal-side browser warnings and errors matter
- `next dev --inspect` for server breakpoints
- Built-in Server Function logging for action execution timing and source
- Dev server lock file when duplicate dev servers are suspected

#### Browser and overlay checks

- Hydration diff overlay for client versus server mismatches
- Error cause chains in the Next.js error overlay
- React DevTools Components tab for tree, props, state, and hooks
- React DevTools Profiler tab for render cost in development only
- Chrome Performance panel React tracks for render timing lanes in development only

#### Agent-aware live tools

- Next.js DevTools MCP for errors, route metadata, project metadata, and server-action lookup
- Chrome DevTools MCP for DOM, console, network, and screenshots when browser evidence matters
- `next-browser` for React tree, PPR shell, screenshots, network, and structured live diagnostics when available

#### Phase 1 checkpoint

Stop and summarize:

- What is the symptom?
- Which runtime surface showed it?
- Is this a live behavior question or a build classification question?

If the symptom is explained here, fix it here. If not, escalate.

### Step 3: Phase 2, inspect the build process

Use build flags when the question is about how Next.js classified or generated the route.

#### Route and config visibility

```bash
next build --debug
```

Use this for redirects, rewrites, and headers that are otherwise easy to miss.

#### Static or dynamic classification

```bash
next build --debug-prerender
```

Use this when a page is unexpectedly static, dynamic, or partially prerendered.

#### Generated params for dynamic routes

```bash
next build --debug-build-paths=/blog/[slug]
```

Use this when debugging `generateStaticParams` output.

#### Profiling builds

```bash
next build --profile
```

Use only temporarily when you need React Profiler support in a production build.

#### Phase 2 checkpoint

Record the route classification before making framework claims:

- `○` static
- `◐` partial prerender
- dynamic route output when server work is required

If the classification already explains the symptom, fix the code. If the symptom still conflicts with expectations, inspect emitted files.

### Step 4: Phase 3, inspect emitted build output

Use emitted files when the question is what the browser actually received.

#### Delivered HTML

Inspect the built HTML directly under `.next/server/app/`.

Typical questions answered here:

- Did the build bake in a Suspense fallback?
- Does the HTML contain `<!--$?-->` deferred boundary markers?
- Is the real content parked in a hidden streamed block?

#### Bundle and import analysis

```bash
npx next experimental-analyze
```

Use this when the issue is chunk size, unexpected client bundle content, or import-chain explanation.

#### Phase 3 checkpoint

If the built file contains the fallback, the build produced it. That is stronger evidence than browser Preview interpretations or phase-1 assumptions.

### Step 5: Phase 4, production-only questions

Use production tools only for production questions:

- `instrumentation.ts` plus OpenTelemetry for server traces and spans
- `next start --inspect` for debugger attachment to the production server
- `useReportWebVitals` for real browser vitals collection
- Browser DevTools for generic network, paint, and performance inspection

Do not use production telemetry to answer a question that phase 2 or phase 3 could already settle locally.

## Investigation Recipes

### Recipe: Route looks static but Preview only shows `Loading...`

Work this in order:

1. In development, inspect the route with `next-browser ppr unlock` or equivalent live tools.
2. Run `next build --debug-prerender` and record whether the route is `○`, `◐`, or dynamic.
3. Inspect `.next/server/app/<route>.html`.
4. If you see `<!--$?-->`, inspect source for an `async` Server Component inside `<Suspense>` or a `'use cache'` boundary.
5. If the component is `async` without real awaited work, remove `async` and validate again.

Interpretation rules:

- Chrome Preview does not execute the swapping script, so it may legitimately show the fallback only.
- `0 dynamic holes` does not prove there is no Suspense boundary.
- `○` plus `<!--$?-->` strongly points to unnecessary `async` or another deferred boundary in a static route.
- `◐` plus `<!--$?-->` points toward PPR or cache-driven deferred work.

### Recipe: Same log appears in terminal and browser-facing tooling

1. Check whether the log origin is `Server` or `Browser`.
2. Check whether Next.js is surfacing that same event in multiple views.
3. Verify whether you are looking at the live terminal, browser console, or aggregated dev log.

Rule:

- A server-originated log may appear in browser-facing tooling during development without implying that the browser executed the server code.

### Recipe: Hydration mismatch

1. Use the error overlay diff first.
2. Identify what differs between server and client renders.
3. Check for client-only values during render, unstable timestamps, random values, browser APIs during SSR, or conditional markup drift.
4. Only after that, inspect broader routing or cache behavior.

### Recipe: Unexpectedly dynamic route

1. Run `next build --debug-prerender`.
2. Check for `cookies()`, `headers()`, uncached fetches, draft mode, or per-request reads.
3. If using Cache Components, inspect `'use cache'`, `cacheTag()`, `cacheLife()`, and dynamic holes.
4. Verify whether the route is truly dynamic or only contains a deferred boundary.

## Human and Agent Working Agreement

When collaborating across multiple steps, keep each pass in this shape:

1. Symptom
2. Phase chosen
3. Tool used
4. Raw evidence
5. Interpretation
6. Next discriminating check
7. Fix
8. Validation

Use [templates/debugging-note-template.md](./templates/debugging-note-template.md) if the investigation spans more than one tool or one session.

## Quick Tool Selector

| Goal                                              | Best first tool                      |
| ------------------------------------------------- | ------------------------------------ |
| Inspect current errors or route metadata          | Next.js DevTools MCP                 |
| Inspect DOM, browser console, or network          | Chrome DevTools MCP                  |
| Inspect React tree or PPR shell in dev            | `next-browser`                       |
| See fetches in server work                        | `logging.fetches`                    |
| Attach a server debugger in development           | `next dev --inspect`                 |
| Explain route classification                      | `next build --debug-prerender`       |
| Explain redirects, rewrites, headers              | `next build --debug`                 |
| See generated params for a route                  | `next build --debug-build-paths=...` |
| Verify emitted HTML fallback or streaming markers | inspect `.next/server/app/*.html`    |
| Analyze bundle output                             | `npx next experimental-analyze`      |
| Measure real production vitals                    | `useReportWebVitals`                 |

## Golden Examples

### Wrong conclusion

`next-browser` says there are `0 dynamic holes`, so the route cannot contain a `Loading...` fallback.

Why it is wrong:

- PPR dynamic holes and Suspense fallback boundaries are not the same question.

### Better conclusion

`next-browser` says there are `0 dynamic holes`, but `.next/server/app/<route>.html` still contains `<!--$?-->` and the route is `○` in `next build --debug-prerender`; inspect source for unnecessary `async` inside `<Suspense>`.

### Wrong conclusion

Chrome Preview shows only `Loading...`, so production is broken.

Why it is wrong:

- Preview renders raw response bytes without the script swap.

### Better conclusion

Preview shows the fallback because the built HTML shipped a deferred Suspense boundary; the fix is in source structure, not in the Preview panel.

## References

- [31.nextjs-debugging-reference.md](../../../31.nextjs-debugging-reference.md)
- [templates/debugging-note-template.md](./templates/debugging-note-template.md)
