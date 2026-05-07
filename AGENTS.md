---
description: Next.js work flow — read local docs first, avoid MCP tools unless strictly necessary
applyTo: '**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.mjs'
priority: critical
---

<!-- BEGIN:nextjs-agent-rules -->

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`.
Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

## ⚠️ ENFORCEMENT RULE (Survives Next.js updates)

**For ANY Next.js work (new features, migrations, debugging, API questions):**

1. **First**: Read the relevant doc from `node_modules/next/dist/docs/` (LOCAL source of truth)
2. **Only then**: If the docs don't answer your question, you may use nextjs-devtools MCP tools
3. **Never**: Use MCP as a shortcut — training data is outdated, local docs are authoritative

**Why:**

- Docs in your repo are the actual version you're running
- MCP tools are for diagnostics AFTER checking docs, not as primary source
- Token efficiency: docs are faster than MCP queries

**Examples:**

- ❌ "What's the API for `generateStaticParams`?" → Read `/docs/app/api-reference/functions/generate-static-params`
- ✅ "Runtime error in PPR route?" → Check error, then use MCP to diagnose
