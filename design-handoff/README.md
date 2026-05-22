# Design handoff bundle

Source: Claude Design (claude.ai/design), artifact `f_fVulfKua5_cb0lbMwEMg`,
fetched 2026-05-16 via `https://api.anthropic.com/v1/design/h/...`.

Canonical visual reference for every @godxjp/ui primitive + shell.
Storybook stories must match the visual rendered by these HTML/JSX
mockups (pixel-perfect intent, not literal DOM copy).

## Layout

- `godx-admin/README.md` — handoff instructions from Claude Design
- `godx-admin/chats/chat[1-6].md` — conversation transcripts (intent)
- `godx-admin/project/` — HTML/JSX prototypes + CSS tokens
  - `tokens.css`, `tokens-ext.css` — the canonical design tokens
  - `ui-kit.jsx` — Icon set, Sparkline, Donut, Badge, Avatar helpers
  - `shell.jsx` — app shell (sidebar + topbar + main)
  - `design-canvas.jsx` — master design canvas (every screen on one page)
  - `me-shell.jsx`, `me-screens-{a,b,c}.jsx`, `me.css` — me-service shell
  - `console-shell.jsx`, `console-screens-{a,b}.jsx`, `console.css` — console
  - `chat-*.jsx`, `chat.html` — chat composition
  - `calendar-shell.jsx`, `calendar-data.jsx` — calendar app
  - `login-*.jsx`, `signin.html` — auth shells
  - `*.html` — render targets

## Workflow

1. Open `chats/chat6.md` last → see where the user landed.
2. Open `project/design-canvas.jsx` top-to-bottom → see the visual.
3. Pick a primitive → find its usage in design-canvas → match
   `src/styles/shell.css` + the primitive's source.
4. Verify via Storybook at `https://storybook.<publicDomain>/`
   (needs Playwright MCP for side-by-side; ask the user to
   `/mcp` reconnect if dead).
