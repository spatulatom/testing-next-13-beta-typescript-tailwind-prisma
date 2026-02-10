# Next.js Documentation Lookup Instructions

**Next.js 15.0** · Docs synced February 10, 2025

## CRITICAL: Use Local .next-docs Files for Maximum Efficiency

**ALWAYS prefer reading local documentation files over using MCP tools.**

### Required Workflow for Next.js Questions:

1. **Check the index below** to find the relevant `.mdx` file path
2. **Construct the full local path**: `.next-docs/{path-from-index}`
3. **Use `read_file` tool** to read the documentation
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

### When to Use MCP Tools:

⚠️ Only use `nextjs_index` / `nextjs_call` MCP tools when:

- Debugging a RUNNING Next.js dev server
- Getting real-time errors, routes, or build diagnostics
- The user explicitly asks to check the running application

**Do NOT use MCP `nextjs_docs` tool** - use local files instead.

---

<!-- NEXT-AGENTS-MD-START --><!-- NEXT-AGENTS-MD-END -->
