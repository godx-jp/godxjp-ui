# `@godxjp/ui` — Login design bundle snapshot

> **VISUAL CONTRACT REFERENCE ONLY.** These files are NOT in the build
> graph and MUST NOT be imported from production code. They exist as a
> frozen visual baseline so any agent/contributor implementing the
> login surface can verify their work against the operator-approved
> design.

## What this is

A handoff bundle from Claude Design (`claude.ai/design`) — the operator
mocked up 16 login screens in HTML/CSS/JSX using the wa-iro brand, then
exported the artefacts so a coding agent can recreate them inside
`services/identity-service/web/portal/` (production React + TypeScript).

Source plan: **gx cloud plan #11 "Login UI wa-iro design integration
(identity-portal redesign)"** at
gx cloud plan #11 (`godx-jp/godx-admin`).

Foundation plan: legacy filesystem **Plan #39** at
`docs/plans/done/plan-39-custom-login-ui.md`.

This README is committed as part of issue
[godx-jp/godx-admin#120](https://github.com/godx-jp/godx-admin/issues/120)
(plan #11 L17).

## Bundle provenance

| Field | Value |
|---|---|
| Origin | Claude Design (claude.ai/design) handoff API |
| Bundle hash IDs | `6zkdNb1Z7Co-6oRelycFTA` (signin.html-focused) · `ZhCK-lBrF356C7IzY0b1xQ` (login.html canvas) |
| API endpoint | `https://api.anthropic.com/v1/design/h/<hash>` |
| Captured | 2026-05-13 |
| Operator | info@famgia.com |
| Chat transcripts | chat1 (2026-05-08 product design system inception), chat2 (2026-05-09 PDCA detail screens), chat3 (2026-05-09 login + signin.html origin) |

The two hash IDs are alternate exports of the same 30-file tarball; only
the README preamble differs ("primary file" pointer). The files here
are extracted verbatim from the signin.html-focused export.

## File inventory

| File | What it contains |
|---|---|
| [`signin.html`](./signin.html) | Full-viewport functional sign-in app. State machine `email → password|passkey|sso → mfa → done` with crossfade transitions and Tweaks panel (theme/locale/brand swatch/method jump). Wires React 18 UMD CDN + the three JSX files below. |
| [`login.html`](./login.html) | Design canvas showing all 15 screens side-by-side as artboards (browser flow + device-side chromes + browser-side device auth + error states). Not a runtime page — a single design surface for review. |
| [`login-shell.jsx`](./login-shell.jsx) | i18n `L` object (ja/en/vi × ~50 keys) + `LoginShell` (centered card wrapper, mesh gradient bg, header GodxMark, footer secured text + locale picker) + `GodxMark` (logo + wordmark) + form primitives (`Field`, `TextInput`, `PrimaryBtn`, `GhostBtn`, `Divider`) + decorative `FakeQR` + SVG icons (Google, Microsoft, Fingerprint, Shield). |
| [`login-browser.jsx`](./login-browser.jsx) | `ScreenEmail`, `ScreenPassword`, `ScreenMFA`, `ScreenPasskey`, `ScreenSSO`, `ScreenSignedIn` — browser-flow screens. Each composes `LoginShell` + primitives from `login-shell.jsx`. |
| [`login-device.jsx`](./login-device.jsx) | Device-side chromes (`ScreenDevicePOS` Tauri, `ScreenDeviceKDS` dark, `ScreenDeviceCLI` terminal, `ScreenDeviceCompleted`) **out of scope for plan #11** + browser-side device-auth (`ScreenDeviceCodeEntry`, `ScreenDeviceAuthorize`, `ScreenDeviceApprovedBrowser`) **in scope** + error screens (`ScreenErrorExpired`, `ScreenErrorDenied`, `ScreenErrorWrongCode`) **in scope**. |
| [`tokens-snapshot.css`](./tokens-snapshot.css) | Frozen snapshot of `tokens-ext.css` (and references to base `tokens.css`) at 2026-05-13. Defines the wa-iro palette, layout surfaces (sidebar/topbar/surface-1/2/3), dark mode overrides, tenant overrides (godx/kintai/tempo/betoya), density variables. Use this as the authoritative visual contract — production code lives in [`src/tokens/tokens.css`](../../../tokens/tokens.css) and that file is the source of truth going forward. |

## Brand essentials

- **Primary accent**: 朱 vermilion `#eb6101` (OKLCH `66% 0.19 45`).
- **Decorative palette**: wa-iro (和色) — 朱/若竹/群青/山吹 as operator swatches; 藍/瑠璃/紺/萌葱/茜/臙脂/桜/墨/鼠 for charts + decoration. Never role-mapped.
- **Typography**: M PLUS 2 (Google Fonts) → Hiragino Sans → system Japanese stack.
- **Three weights only**: 400 (body), 500 (medium / heading default), 700 (bold emphasis). No 300 / 600 in production.
- **Line height**: 1.7 for JP body — 間 (ma) principle.
- **OKLCH chroma cap**: ≤ 0.18 for primary; ≤ 0.19 for accent. 渋み (shibumi).
- **Density modes**: compact 28px / default 32px / comfortable 44px (= `--touch-target-min` floor).
- **4px grid**: every spacing var is a 4px multiple.

## How to consume this snapshot

You SHOULD NOT `import` from this directory. The build system excludes
it (`package.json#files` allowlist does not include `src/components/login/`;
`tsup.config.ts` entry map does not reference any file here).

You SHOULD:

1. Open [`signin.html`](./signin.html) in a browser to see the
   functional flow (state machine + transitions).
2. Open [`login.html`](./login.html) in a browser to see all artboards
   side-by-side.
3. Read [`login-shell.jsx`](./login-shell.jsx) for the i18n `L` object
   keys and the primitive component shapes.
4. Read [`login-browser.jsx`](./login-browser.jsx) +
   [`login-device.jsx`](./login-device.jsx) for the per-screen
   compositions.
5. When implementing the production `.tsx` equivalents (plan #11 L15 +
   L16a-d + L6), match these files structurally + visually within the
   constraints: TypeScript strict, no `window.*` globals, primitives
   under `@godxjp/ui/components/login/`, pages under
   `services/identity-service/web/portal/src/routes/login/`.

## What's out of scope

The bundle includes device-side mockups (POS Tauri, KDS dark display,
CLI terminal, POS post-auth) — these are NOT Zitadel login pages and
are explicitly excluded from gx plan #11. They belong to:

- POS Tauri app → forge POS app (Plan #19 successor, not yet kicked off)
- KDS display → kitchen display service (future plan)
- CLI terminal output → `gx` CLI binary (Plan #37 owner)

Each owning project should snapshot the relevant `ScreenDevice*` JSX as
their own visual contract reference, parallel to this directory.

## Re-fetching the bundle

If you need to inspect the raw tarball:

```bash
# Either bundle hash works; same content.
curl -L https://api.anthropic.com/v1/design/h/6zkdNb1Z7Co-6oRelycFTA \
  -o /tmp/login-design.tar.gz
mkdir -p /tmp/login-design && tar -xzf /tmp/login-design.tar.gz -C /tmp/login-design
ls /tmp/login-design/godx-admin/
```

Files in this directory are a verbatim subset (login-related only) of
the tarball's `godx-admin/project/` directory.

## Audit trail

- 2026-05-08 chat1: operator inception of unified godx design system (kintai + admin tokens merged).
- 2026-05-09 chat2: PDCA detail + Issue detail screens added; QuickComposer pattern from Backlog.com.
- 2026-05-09 chat3: login + signin.html origin — Zitadel-style 15 screens designed.
- 2026-05-11: contributor shipped Plan #39 L3/L4/L5/L7/L8 (#820, #832, #833, #834, #835, #838) — backend logic correct but used hardcoded `slate/emerald` palette (default shadcn) instead of the design bundle.
- 2026-05-13: operator surfaced the divergence ("màu và design sai khác hoàn toàn so với yêu cầu"). Plan #11 created + this snapshot committed to lock the visual contract.

This file is part of the audit-trail discipline (`feedback_close_checklist_discipline` memory) — the visual contract is now in version control, not floating in Anthropic Claude Design cloud.
