# @godxjp/ui-mcp — architecture plan

## Goals

1. **Help consumer agents produce UI có gu** (good taste) on top of
   `@godxjp/ui`. The framework gives primitives; this MCP teaches
   the agent what DESIGN DECISIONS to make.

2. **Be token-efficient.** Don't dump 50KB of skill content every
   call. Lazy-load sections. Tools return metadata first; the agent
   drills down only into what's relevant.

3. **Work with BOTH Claude Code AND Codex CLI** — both use stdio MCP
   per the official spec; same `dist/index.js` binary works for
   both, only the config file differs.

## Token-efficiency strategy

### Problem
Naive MCP design — every tool returns Markdown blobs containing
everything about the topic — wastes context. A `get_skill name="soft"`
call returning 8 KB of body when the agent only needed the "vibe
archetypes" section is a 7 KB waste.

### Solution
**Two-tier API per skill:**

1. `list_*` — metadata only (id, title, 1-line tagline). ~10-30 bytes
   per entry. Use to DISCOVER what's available.

2. `get_*_section` — single section by id. ~500 byte — 3 KB max.
   Use AFTER the agent narrows down.

Plus a **task router**:

3. `route_task(task)` — natural language → small JSON pointer
   `{ skill, section, why }`. ~200 bytes. Agent then fetches the
   pointed section with one targeted call.

### Result
Average agent interaction: `list_skills` (200 bytes) + `route_task`
(300 bytes) + `get_skill_section` (2 KB) = ~2.5 KB total. Versus a
naive dump-everything call: 50+ KB.

## Skill catalog (13 sources synthesised)

From [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill):

| Skill | Topic | Use when… |
|---|---|---|
| `taste` | Senior UI/UX engineering baseline | Default — production app design |
| `soft` | Awwwards-tier high-end agency build ($150k+) | Premium agency brief — marketing site, hero pages |
| `minimalist` | Editorial workspace platform (Notion-like) | Document-style, warm monochrome, bento grids |
| `brutalist` | Swiss + military terminal | Data-heavy dashboards, declassified-blueprint feel |
| `gpt-tasteskill` | Editorial + advanced GSAP motion | Long-scroll marketing, AIDA flow, scroll choreography |
| `redesign` | Audit + upgrade existing UI | Refactoring an existing project — fix priority order |
| `output` | Full-output enforcement | Always — bans `// ...` patterns + skeleton handoffs |
| `imagegen-mobile` | Mobile app image direction | Pre-design phase — generating mockups |
| `imagegen-web` | Web reference image direction | Pre-design phase — landing page references |
| `image-to-code` | Image → working frontend | Visual brief → code (codex pattern) |
| `brandkit` | Brand guideline boards | Designing a brand identity board first |
| `stitch` | Semantic DESIGN.md generation | When pairing with Google Stitch |
| `taste-skill` | Senior engineer baseline | Catch-all foundation |

Plus framework-native modules:

| Module | Topic |
|---|---|
| `components` | Primitive catalog (~30 entries) |
| `prop-vocabulary` | Shared types (`SizeProp`, `ColorProp`, …) |
| `tokens` | Design tokens (color/spacing/typography/…) |
| `rules` | 34 cardinal rules from CLAUDE.md |
| `patterns` | 7 canonical code patterns (form/table/shell/…) |
| `accessibility` | WCAG 2.1 AA per primitive |
| `theme-axes` | data-theme / data-accent / data-density / data-font-size |
| `hooks` | useBreakpoint / useFormatters / useGodxConfig / … |
| `design-guidelines` | Visual hierarchy, spacing, motion |
| `design-thinking` | 11 taste principles (mobile-first, one-intent-per-screen, …) |
| `anti-ai-tells` | Specific AI slop patterns to avoid |
| `minimalism` | Editorial mode applied to framework primitives |
| `redesign-audit` | Project audit checklist |
| `output-quality` | Banned `// ...` patterns |
| `awwwards-mode` | Premium tier — Doppelrand, Variance Engine, Magnetic Hover |

## Tools (proposed)

### Discovery (small responses)
- `list_skills` — every external skill, 1-line each
- `list_modules` — every framework module
- `list_primitives` — every primitive (group + tagline)
- `list_patterns` — every pattern (1-line each)

### Drill-down (medium responses)
- `get_skill_section(skill, section)` — one section
- `get_primitive(name)` — full component API
- `get_pattern(name)` — full code snippet
- `get_rule(number)` — one cardinal rule
- `get_token(name)` — one token

### Task router (smallest response — pointer only)
- `route_task(task)` — task → `{ skill, section, why, see_also }`
- `suggest_primitive(use_case)` — already implemented

### Lint (one-shot critique)
- `lint_jsx(jsx)` — heuristic check, returns Markdown list of findings
- `audit_design(description)` — natural-language audit using redesign-skill checklist

## Claude Code + Codex setup

Both consume stdio MCP per the protocol. Config differs.

### Claude Code
`~/.claude.json` (user) or `.mcp.json` (project root):
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

### Codex CLI
`~/.codex/config.toml`:
```toml
[mcp_servers.godx-ui]
command = "npx"
args = ["@godxjp/ui-mcp"]
```

### Smoke test (both)
```sh
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | npx @godxjp/ui-mcp
```

## Implementation order

1. ✅ Bootstrap package + first 6 data modules (components, prop-vocab,
   tokens, rules, patterns + the 4 taste modules: design-guidelines,
   design-thinking, anti-ai-tells, minimalism, redesign-audit,
   output-quality, awwwards-mode, accessibility, theme-axes, hooks).

2. 🚧 (this iteration) Add remaining 5 skill summaries as compact
   metadata (taste, brutalist, gpt-tasteskill, brandkit, stitch).
   Add `list_skills` + `get_skill_section` + `route_task` tools.
   Add Codex CLI install instructions to README.

3. ⏳ (next iteration) Refactor large data modules into sections for
   on-demand drill-down. Reduce default tool response size to ≤ 3 KB.

## Constraints

- Read-only, zero filesystem access into consumer project, zero
  network — same as v0.1.0.
- Bundled-data approach (vs reading framework source at runtime) keeps
  it lightweight + version-pinned.
- Manual catalog updates when framework adds/removes primitives —
  document the parity expectation in README.
