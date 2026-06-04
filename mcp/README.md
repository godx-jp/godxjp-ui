# @godxjp/ui-mcp

Model Context Protocol server for [`@godxjp/ui`](https://github.com/godx-jp/godxjp-ui).
Gives **Claude Code**, **Codex CLI**, **Cursor**, **Cline**, **Continue**, or any
MCP-aware agent live access to:

- 30+ component catalog (props, types, defaults, examples)
- 14 shared prop-vocabulary types (`SizeProp`, `ColorProp`, `LoadingProp`, …)
- 48 design tokens (color / spacing / typography / radius / breakpoint / density / motion)
- 34 cardinal rules from `CLAUDE.md`
- 7 canonical copy-paste-ready patterns (sign-up, settings, data-table, …)
- 12 taste / design skills (taste / soft / minimalist / brutalist / gpt-tasteskill /
  redesign / output / brandkit / stitch / imagegen-mobile / imagegen-web / image-to-code)
- 20+ anti-AI-tell patterns to AVOID + their fixes
- 50+ redesign-audit checks across 9 categories
- heuristic JSX linter (raw HTML / wrong vocab / banned default fonts / …)

**Token-efficient design:** discovery tools return small metadata; agents
drill into ONE section at a time via `get_skill_section`. Average
interaction: ~2.5 KB vs. 50+ KB for naive dump-everything servers.

Read-only, zero filesystem access into consumer projects, zero network,
zero shell. Safe to mount.

---

## Install

```sh
npm install --save-dev @godxjp/ui-mcp
```

Or run via `npx` without installing:

```sh
npx @godxjp/ui-mcp
```

---

## Configure your agent

### Claude Code

`~/.claude.json` (user-level) or `.mcp.json` at project root:

```json
{
  "mcpServers": {
    "godx-ui": {
      "command": "npx",
      "args": ["@godxjp/ui-mcp"]
    }
  }
}
```

Restart Claude Code. The 14 tools appear under `mcp__godx_ui__*`.

### Codex CLI

`~/.codex/config.toml`:

```toml
[mcp_servers.godx-ui]
command = "npx"
args = ["@godxjp/ui-mcp"]
```

Codex picks it up on next session start. Tools accessible via the
standard Codex tool-call protocol.

### Cursor

`.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "godx-ui": {
      "command": "npx",
      "args": ["@godxjp/ui-mcp"]
    }
  }
}
```

### Cline (VS Code)

`cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "godx-ui": {
      "command": "npx",
      "args": ["@godxjp/ui-mcp"],
      "disabled": false
    }
  }
}
```

### Continue.dev

`~/.continue/config.yaml`:

```yaml
mcpServers:
  - name: godx-ui
    command: npx
    args: ["@godxjp/ui-mcp"]
```

---

## How to use it well (token-efficient pattern)

Start with discovery, then drill in. Don't ask for everything at once.

```
Agent: "I want to design a premium agency landing page hero."

Step 1 — route the task (tiny response):
  → route_task task="premium agency landing page hero"
  ← { skill: "soft", section: "vibe-archetypes", why: "Premium tier — pick a Vibe + Layout archetype.", alsoSee: ["soft/layout-archetypes", "soft/double-bezel"] }

Step 2 — fetch the relevant section (small):
  → get_skill_section skill="soft" section="vibe-archetypes"
  ← (2 KB of Ethereal Glass / Editorial Luxury / Soft Structuralism)

Step 3 — fetch the pattern (medium):
  → get_pattern name="app-shell"
  ← (copy-paste-ready code)
```

Total: ~3 KB. Versus naive "give me everything about @godxjp/ui" = 50+ KB.

---

## Tools (14)

### Discovery (small responses — start here)

| Tool                   | Returns                                                      | Size   |
| ---------------------- | ------------------------------------------------------------ | ------ |
| `list_skills`          | 12 taste/design skills + section ids                         | ~1 KB  |
| `list_primitives`      | All components, grouped + tagline. Optional `group` filter.  | ~3 KB  |
| `list_patterns`        | 7 canonical patterns + taglines                              | ~500 B |
| `list_anti_ai_tells`   | 20+ AI-tell patterns. Optional `category` filter.            | ~2 KB  |
| `list_redesign_checks` | 50+ audit checks + fix priority. Optional `category` filter. | ~5 KB  |

### Drill-down (medium responses — after discovery)

| Tool                | Returns                           | Size            |
| ------------------- | --------------------------------- | --------------- |
| `get_skill_section` | ONE section of ONE skill          | ~2 KB           |
| `get_component`     | Full API for one component        | ~2 KB           |
| `get_pattern`       | Full code snippet for one pattern | ~3 KB           |
| `get_rule`          | One cardinal rule (or all 34)     | ~500 B / ~10 KB |
| `get_vocab`         | One vocab type (or all 14)        | ~500 B / ~3 KB  |
| `get_tokens`        | Tokens (optionally by category)   | ~5 KB           |

### Task routing (smallest — pointer only)

| Tool                | Returns                                                        | Size   |
| ------------------- | -------------------------------------------------------------- | ------ |
| `route_task`        | `{ skill, section, why, alsoSee }` for a natural-language task | ~300 B |
| `suggest_primitive` | Use case → recommended primitive + rationale                   | ~500 B |
| `search_components` | Fuzzy-search by name / tagline / prop                          | ~1 KB  |

### Lint (one-shot critique)

| Tool       | Returns                                                  | Size  |
| ---------- | -------------------------------------------------------- | ----- |
| `lint_jsx` | Heuristic findings (raw `<button>` / wrong vocab / etc.) | ~1 KB |

---

## Skills bundled (12)

Synthesised from [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)

- framework-native design knowledge:

| Skill             | When to use                                                 |
| ----------------- | ----------------------------------------------------------- |
| `taste`           | Default — production app screen baseline                    |
| `soft`            | Premium agency / Awwwards-tier ($150k brief)                |
| `minimalist`      | Editorial workspace (Notion-like) — warm monochrome + bento |
| `brutalist`       | Data-heavy dashboards, declassified-blueprint feel          |
| `gpt-tasteskill`  | Long-scroll marketing, GSAP ScrollTrigger choreography      |
| `redesign`        | Auditing + upgrading EXISTING project                       |
| `output`          | Always — bans `// ...` / `// TODO` patterns                 |
| `brandkit`        | Brand identity boards before screens                        |
| `stitch`          | Generate DESIGN.md for Google Stitch / similar generators   |
| `imagegen-mobile` | Pre-code phase — mobile app screen mockups                  |
| `imagegen-web`    | Pre-code phase — landing page section images                |
| `image-to-code`   | Visual brief → working frontend code                        |

---

## Example interactions

> **User:** "How do I build a sign-up form with @godxjp/ui?"
>
> **Agent:** calls `get_pattern name="registration-form"` → returns the full Card + Form + zod schema snippet.

> **User:** "What's the difference between Table and DataTable?"
>
> **Agent:** calls `get_component name="Table"` + `get_component name="DataTable"`. Returns both APIs with comparison.

> **User:** "I want to design a premium agency hero — what should I do?"
>
> **Agent:** calls `route_task task="premium agency hero design"` → routed to `soft/vibe-archetypes`. Calls `get_skill_section skill="soft" section="vibe-archetypes"`. Picks Ethereal Glass + Editorial Split layout. Returns finished concept.

> **User:** "Audit this UI for me: \[paste JSX\]"
>
> **Agent:** calls `lint_jsx jsx="..."` → returns heuristic findings. Then `list_redesign_checks` for deeper categories.

> **User:** "What's banned by rule 34?"
>
> **Agent:** calls `get_rule number=34` → returns the rule body.

---

## Resources

| URI                           | Format   | Purpose            |
| ----------------------------- | -------- | ------------------ |
| `godx-ui://components`        | JSON     | Full catalog       |
| `godx-ui://components/{name}` | Markdown | One component      |
| `godx-ui://prop-vocabulary`   | JSON     | Shared vocab       |
| `godx-ui://tokens`            | JSON     | All tokens         |
| `godx-ui://tokens/{category}` | JSON     | Tokens by category |
| `godx-ui://rules`             | Markdown | All 34 rules       |
| `godx-ui://rules/{number}`    | Markdown | One rule           |
| `godx-ui://patterns`          | JSON     | Pattern index      |
| `godx-ui://patterns/{name}`   | Markdown | One pattern        |

---

## Develop locally

```sh
pnpm install
pnpm dev           # tsup --watch
pnpm inspect       # MCP inspector (https://github.com/modelcontextprotocol/inspector)
pnpm type-check
```

Test directly via stdio:

```sh
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_skills","arguments":{}}}' | node dist/index.js
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"route_task","arguments":{"task":"design a sign-up form"}}}' | node dist/index.js
```

---

## Architecture

See `PLAN.md` for the full design decisions:

- Token-efficient two-tier API (`list_*` then `get_*_section`)
- Skill catalog mapped to `data/skills-index.ts` (compact metadata)
- Full skill bodies stored in dedicated `data/*.ts` files (lazy-fetched)
- Heuristic task router (`route_task`) — keyword match for v1; embedding-based for v2

---

## License

Apache-2.0
