# Next.js Documentation Lookup Instructions

**Next.js 16.1.6** · Docs synced March 4, 2026

> ⚠️ **THIS PROJECT USES APP ROUTER ONLY.** There is no `pages/` directory. All source code lives under `app/`. Always use `01-app/` doc paths. Never use `02-pages/` paths.

## CRITICAL: Use Local .next-docs Files for Maximum Efficiency

**Default to reading local documentation files for Next.js concepts, APIs, and best-practice lookups.**

### Required Workflow for Next.js Questions:

1. **Check the index below** to find the relevant `.mdx` file path
2. **Construct the full local path**: `.next-docs/{path-from-index}`
3. **Use the available file-reading tool to read the documentation.**
4. **Start with a small range** (e.g., lines 1-100) to check headers and structure
5. **Read more lines if needed** based on what you find

### Path Construction Examples:

- For `cacheLife` function → `.next-docs/01-app/03-api-reference/04-functions/cacheLife.mdx`
- For `use cache` directive → `.next-docs/01-app/03-api-reference/01-directives/use-cache.mdx`
- For Cache Components guide → `.next-docs/01-app/01-getting-started/06-cache-components.mdx`
- For v16 upgrade guide → `.next-docs/01-app/02-guides/upgrading/version-16.mdx`

### Why Local Files?

✅ **More efficient** - precise control over how much context to load  
✅ **Progressive loading** - read headers first, dive deeper as needed  
✅ **Predictable size** - know exact token cost before loading  
✅ **No network overhead** - instant access

### When to Use Next.js DevTools MCP Tools:

⚠️ Use Next.js DevTools MCP tools when the answer depends on the running application, for example:

- Debugging a RUNNING Next.js dev server
- Getting real-time errors, routes, or build diagnostics
- The user explicitly asks to check the running application
- Inspecting page metadata, server actions, logs, or other live runtime state
- Runntime-aware diagnostics that require context beyond static documentation when live app context matters

✅ For implementation tasks that touch a running app, prefer a runtime-first flow:

- Use local `.next-docs` for API/concept lookup.
- Use Next.js DevTools MCP (`nextjs_index` / `nextjs_call`) to verify routes, errors, and live behavior before and after changes.

**Do not default to Next.js DevTools MCP tools for static documentation lookups unless explicitly asked or needed for runtime verification.**

### Plans

- In `[[PLAN]]` mode, end each plan response with a list of unresolved questions. Keep questions extremely concise; grammar can be minimal.

### Autopilot Mode (Copilot CLI only)

- When in `[[AUTOPILOT]]` mode, assume 6 iterations: apply `--max-autopilot-continues 6` as a safety cap.

### Permission Gate (Git + GitHub)

- Default to **read-only** repo operations for Git/GitHub.
- Do **not** run `git commit`, `git push`, create/switch branches, open/update PRs, create/edit/close issues, or tick issue checkboxes unless explicitly asked by the user to do so.
- For GitHub work, remember that both **GitHub MCP** and **GitHub CLI (`gh`)** may be available:
  - Prefer **GitHub MCP** for read/search/list/fetch workflows.
  - Prefer **`gh` CLI** for authenticated write operations when explicitly asked by the user (for example: creating issues, editing issues, opening PRs), especially if MCP is read-only in the current session.
  - Before write operations with `gh`, check authentication with `gh auth status`.

### GitHub Issues

- Write issues as: overarching description + numbered `Progress Checklist`.
- Overarching description must be 1-3 sentences explaining problem, goal, and why it matters.
- Keep the top-level checklist short: default to 3-5 items and do not exceed 5 unless the user explicitly asks for it.
- Top-level checklist items should usually be large enough to map to a meaningful deliverable or commit when practical so then the whole Github Issue could be mapped to 3-5 commits.
- Prefer grouping related work into a single meaningful milestone with subpoints instead of creating long flat lists.
- Use plain-text status markers only: `☐` pending, `✅` done (do not use GitHub task checkboxes).
- Add a short subpoint or subpoints (`- ...`) when useful for context; use them to capture scope, constraints, or smaller tasks.
- Subpoints are notes only (never ticked).
- Do not nest deeper than one subpoint level.
- When a plan would need more than 5 top-level items, either regroup it into broader milestones or split it into multiple issues.
- **Important:** Only change status markers when explicitly asked by the user.

Example:

## Progress Checklist

✅ = Completed, ☐ = Pending

1. ✅ Implement login validation
   - Add server-side validation for missing/invalid credentials.
2. ☐ Reproduce mobile login bug
   - Bug occurs when password field is empty on mobile Safari.
   - Added test case to confirm fix.
3. ☐ Add regression test
   - Cover invalid token and empty password cases.

### Git Branching

- When creating branches, prefix them with `tom/` to indicate they came from me.

---

<!-- NEXT-AGENTS-MD-START -->[Next.js Docs Index]|root: ./.next-docs|STOP. What you remember about Next.js is WRONG for this project. Always search docs and read before any task.|THIS IS AN APP ROUTER PROJECT — only use 01-app/ doc paths. Never use 02-pages/ paths.|If docs missing, run this command first: npx @next/codemod agents-md --output .github/copilot-instructions.md|01-app:{04-glossary.mdx}|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx,03-layouts-and-pages.mdx,04-linking-and-navigating.mdx,05-server-and-client-components.mdx,06-cache-components.mdx,07-fetching-data.mdx,08-updating-data.mdx,09-caching-and-revalidating.mdx,10-error-handling.mdx,11-css.mdx,12-images.mdx,13-fonts.mdx,14-metadata-and-og-images.mdx,15-route-handlers.mdx,16-proxy.mdx,17-deploying.mdx,18-upgrading.mdx}|01-app/02-guides:{analytics.mdx,authentication.mdx,backend-for-frontend.mdx,caching.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,data-security.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,json-ld.mdx,lazy-loading.mdx,local-development.mdx,mcp.mdx,mdx.mdx,memory-usage.mdx,multi-tenant.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,prefetching.mdx,production-checklist.mdx,progressive-web-apps.mdx,public-static-pages.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,single-page-applications.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx,videos.mdx}|01-app/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|01-app/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|01-app/02-guides/upgrading:{codemods.mdx,version-14.mdx,version-15.mdx,version-16.mdx}|01-app/03-api-reference:{07-edge.mdx,08-turbopack.mdx}|01-app/03-api-reference/01-directives:{use-cache-private.mdx,use-cache-remote.mdx,use-cache.mdx,use-client.mdx,use-server.mdx}|01-app/03-api-reference/02-components:{font.mdx,form.mdx,image.mdx,link.mdx,script.mdx}|01-app/03-api-reference/03-file-conventions/01-metadata:{app-icons.mdx,manifest.mdx,opengraph-image.mdx,robots.mdx,sitemap.mdx}|01-app/03-api-reference/03-file-conventions:{default.mdx,dynamic-routes.mdx,error.mdx,forbidden.mdx,instrumentation-client.mdx,instrumentation.mdx,intercepting-routes.mdx,layout.mdx,loading.mdx,mdx-components.mdx,not-found.mdx,page.mdx,parallel-routes.mdx,proxy.mdx,public-folder.mdx,route-groups.mdx,route-segment-config.mdx,route.mdx,src-folder.mdx,template.mdx,unauthorized.mdx}|01-app/03-api-reference/04-functions:{after.mdx,cacheLife.mdx,cacheTag.mdx,connection.mdx,cookies.mdx,draft-mode.mdx,fetch.mdx,forbidden.mdx,generate-image-metadata.mdx,generate-metadata.mdx,generate-sitemaps.mdx,generate-static-params.mdx,generate-viewport.mdx,headers.mdx,image-response.mdx,next-request.mdx,next-response.mdx,not-found.mdx,permanentRedirect.mdx,redirect.mdx,refresh.mdx,revalidatePath.mdx,revalidateTag.mdx,unauthorized.mdx,unstable_cache.mdx,unstable_noStore.mdx,unstable_rethrow.mdx,updateTag.mdx,use-link-status.mdx,use-params.mdx,use-pathname.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,use-selected-layout-segment.mdx,use-selected-layout-segments.mdx,userAgent.mdx}|01-app/03-api-reference/05-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,appDir.mdx,assetPrefix.mdx,authInterrupts.mdx,basePath.mdx,browserDebugInfoInTerminal.mdx,cacheComponents.mdx,cacheHandlers.mdx,cacheLife.mdx,compress.mdx,crossOrigin.mdx,cssChunking.mdx,devIndicators.mdx,distDir.mdx,env.mdx,expireTime.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,htmlLimitedBots.mdx,httpAgentOptions.mdx,images.mdx,incrementalCacheHandlerPath.mdx,inlineCss.mdx,isolatedDevBuild.mdx,logging.mdx,mdxRs.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactCompiler.mdx,reactMaxHeadersLength.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,sassOptions.mdx,serverActions.mdx,serverComponentsHmrCache.mdx,serverExternalPackages.mdx,staleTimes.mdx,staticGeneration.mdx,taint.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,turbopackFileSystemCache.mdx,typedRoutes.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,viewTransition.mdx,webVitalsAttribution.mdx,webpack.mdx}|01-app/03-api-reference/05-config:{02-typescript.mdx,03-eslint.mdx}|01-app/03-api-reference/06-cli:{create-next-app.mdx,next.mdx}|02-pages/01-getting-started:{01-installation.mdx,02-project-structure.mdx,04-images.mdx,05-fonts.mdx,06-css.mdx,11-deploying.mdx}|02-pages/02-guides:{analytics.mdx,authentication.mdx,babel.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,lazy-loading.mdx,mdx.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,post-css.mdx,preview-mode.mdx,production-checklist.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx}|02-pages/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|02-pages/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|02-pages/02-guides/upgrading:{codemods.mdx,version-10.mdx,version-11.mdx,version-12.mdx,version-13.mdx,version-14.mdx,version-9.mdx}|02-pages/03-building-your-application/01-routing:{01-pages-and-layouts.mdx,02-dynamic-routes.mdx,03-linking-and-navigating.mdx,05-custom-app.mdx,06-custom-document.mdx,07-api-routes.mdx,08-custom-error.mdx}|02-pages/03-building-your-application/02-rendering:{01-server-side-rendering.mdx,02-static-site-generation.mdx,04-automatic-static-optimization.mdx,05-client-side-rendering.mdx}|02-pages/03-building-your-application/03-data-fetching:{01-get-static-props.mdx,02-get-static-paths.mdx,03-forms-and-mutations.mdx,03-get-server-side-props.mdx,05-client-side.mdx}|02-pages/03-building-your-application/06-configuring:{12-error-handling.mdx}|02-pages/04-api-reference:{06-edge.mdx,08-turbopack.mdx}|02-pages/04-api-reference/01-components:{font.mdx,form.mdx,head.mdx,image-legacy.mdx,image.mdx,link.mdx,script.mdx}|02-pages/04-api-reference/02-file-conventions:{instrumentation.mdx,proxy.mdx,public-folder.mdx,src-folder.mdx}|02-pages/04-api-reference/03-functions:{get-initial-props.mdx,get-server-side-props.mdx,get-static-paths.mdx,get-static-props.mdx,next-request.mdx,next-response.mdx,use-params.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,userAgent.mdx}|02-pages/04-api-reference/04-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,assetPrefix.mdx,basePath.mdx,bundlePagesRouterDependencies.mdx,compress.mdx,crossOrigin.mdx,devIndicators.mdx,distDir.mdx,env.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,httpAgentOptions.mdx,images.mdx,isolatedDevBuild.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,serverExternalPackages.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,webVitalsAttribution.mdx,webpack.mdx}|02-pages/04-api-reference/04-config:{01-typescript.mdx,02-eslint.mdx}|02-pages/04-api-reference/05-cli:{create-next-app.mdx,next.mdx}|03-architecture:{accessibility.mdx,fast-refresh.mdx,nextjs-compiler.mdx,supported-browsers.mdx}|04-community:{01-contribution-guide.mdx,02-rspack.mdx}<!-- NEXT-AGENTS-MD-END -->
