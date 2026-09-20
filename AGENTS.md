# godx-ui agent instructions

**Two audiences. Pick yours before reading further — they have opposite rules.**

---

## A. You are BUILDING this library (editing this repository)

Read and follow [CLAUDE.md](CLAUDE.md). It is the shared instruction source for all agents,
including the Platform consumer development loop, local acceptance, asynchronous CI, and framework
component requirements.

---

## B. You are USING this library in someone else's app

You are the common case, and nothing in CLAUDE.md applies to you. Everything you need is published.

**If your client can run a process** — Claude Code, Codex CLI, Cursor, any MCP client:

```bash
npx @godxjp/ui sync-rules      # writes .mcp.json, CLAUDE.md and .ai/rules for the consumer repo
```

That wires the MCP server (`@godxjp/ui-mcp`), which is searchable, version-locked to the package
on disk, and far cheaper in tokens than fetching JSON. Ask it `search_components`,
`get_component`, `get_tokens`, `get_rule`, `list_anti_ai_tells`.

**If your client can only fetch URLs** — ChatGPT on the web, Claude.ai, anything without a local
process — the same catalog is published as static files. Start here, it is self-contained:

```
https://raw.githubusercontent.com/godx-jp/godxjp-ui/main/agent/START-HERE.md
```

Pasteable bootstrap:

> Read https://raw.githubusercontent.com/godx-jp/godxjp-ui/main/agent/START-HERE.md and follow it.
> Then fetch .../agent/components-index.json to choose components, and .../agent/components.json
> for the props of the ones you chose. Tell me which catalog version you read.

**Pin to your installed version.** Every URL above tracks `main`. Swap `main` for the tag that
matches the `@godxjp/ui` in your `package.json` — `.../v28.4.0/agent/...` — because a catalog
newer than your package describes props you do not have, an older one hides props you do, and
neither says so.

Files: [`agent/`](agent/) · entry [`agent/llms.txt`](agent/llms.txt) · manifest
[`agent/index.json`](agent/index.json)
