# @godxjp/ui-mcp

Model Context Protocol server for [`@godxjp/ui`](https://github.com/godx-jp/godxjp-ui).
Gives Claude / Cursor / Cline / any MCP-aware agent live access to:

- the full component catalog (~ 30 primitives + composites + shells)
- the shared prop vocabulary (`SizeProp`, `ColorProp`, `LoadingProp`, …)
- design tokens (color / spacing / typography / radius / breakpoint / density)
- the 34 cardinal rules from `CLAUDE.md`
- 7 canonical copy-paste-ready patterns (sign-up form, settings page,
  data table, danger zone, app shell, filter bar, loading states)
- a heuristic JSX linter that catches the most common rule violations
  (raw `<button>` / `<input>`, `"error"` instead of `"destructive"`,
  Storybook source rule 34, …)

Read-only, zero filesystem access into consumer projects, no network,
no shell. Safe to mount.

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

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

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

Restart Claude Desktop. The 10 tools appear in the model's tool palette.

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

Add via the Cline settings UI, or `cline_mcp_settings.json`:

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

## Tools

| Tool | Purpose |
|---|---|
| `list_primitives` | List every primitive / composite / shell, grouped. Optional `group` filter. |
| `get_component` | Full API for one component — props, types, default, example, story + doc paths, cardinal rules. |
| `search_components` | Fuzzy-search by name / tagline / prop. |
| `get_prop_vocabulary` | Read shared vocab types (`SizeProp`, `StatusProp`, `ColorProp`, `LoadingProp`, …). |
| `get_tokens` | Read design tokens. Optional `category` filter. |
| `get_cardinal_rules` | The 34 binding rules. Optional `number`. |
| `list_patterns` | List code patterns (registration-form, settings-page, data-table, …). |
| `get_pattern` | Fetch one pattern — copy-paste-ready snippet. |
| `suggest_primitive` | "How do I X?" → recommended primitive(s) + rationale. |
| `lint_jsx` | Heuristic check for the most common rule violations. |

## Resources

| URI | Format | Purpose |
|---|---|---|
| `godx-ui://components` | JSON | Full catalog |
| `godx-ui://components/{name}` | Markdown | One component |
| `godx-ui://prop-vocabulary` | JSON | Shared vocab |
| `godx-ui://tokens` | JSON | All tokens |
| `godx-ui://tokens/{category}` | JSON | Tokens by category |
| `godx-ui://rules` | Markdown | All 34 rules |
| `godx-ui://rules/{number}` | Markdown | One rule |
| `godx-ui://patterns` | JSON | Pattern index |
| `godx-ui://patterns/{name}` | Markdown | One pattern |

---

## Example agent prompts

Once mounted, the agent can answer questions like:

> "Show me how to build a sign-up form with @godxjp/ui"

→ agent calls `get_pattern name="registration-form"` → returns copy-paste code

> "What's the difference between Table and DataTable?"

→ agent calls `get_component name="Table"` + `get_component name="DataTable"`

> "I need to confirm a destructive delete — what primitive should I use?"

→ agent calls `suggest_primitive use_case="confirm a destructive delete"`
→ returns `Pattern 'confirm-destructive'` + Dialog suggestion

> "Lint this JSX for me: `<Tag color='error'>失敗</Tag>`"

→ agent calls `lint_jsx jsx="<Tag color='error'>失敗</Tag>"`
→ returns `Tag color="error" was renamed to "destructive" (v5.0, PR #60).`

---

## Develop locally

```sh
pnpm install
pnpm dev           # tsup --watch
pnpm inspect       # opens @modelcontextprotocol/inspector against dist/index.js
pnpm type-check
```

Test directly via stdio:

```sh
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js
```

---

## How the data is sourced

This package bundles a **hand-curated** catalog (not auto-generated
from the framework source). Each `src/data/*.ts` file is the source of
truth for that catalog. To keep parity after a primitive is added /
renamed / removed in `@godxjp/ui`, update the corresponding entry here
in the same PR.

The MCP server reads ONLY its bundled data — no filesystem reads into
the consumer project, no network calls. Mount it with confidence.

---

## License

Apache-2.0
