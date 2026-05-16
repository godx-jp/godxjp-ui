# Design intent — godx unified design system

North-star synthesis of 6 Claude-Design chats + the HTML/CSS prototypes
under `godx-admin/project/`. Implementation agents: this is what the
user actually wants Storybook (and every consuming SPA) to look and feel
like. If a story doesn't reflect the items in "Implementation priorities"
below, it's wrong, regardless of whether code "compiles."

User's framing complaint (repeat verbatim, paraphrased across chats):
> "hiện tại đang ko đồng bộ về phong cách design, rules, design system,...
> hãy triển khai làm sao đồng bộ design system trên toàn hệ thống!!!!
> có quy chuẩn có rules rõ ràng!! mình sẽ dùng cho toàn bộ service
> trong hệ sinh thái của mình!!"
>
> "design guide line phải đồng bộ với toàn bộ hệ thống hiện tại nhé"
>
> "đứng trên trải nghiệm người dùng 30 năm phát triển được ko?!"

The user is shipping ONE design language across `godx-admin`,
`console`, `me`, `chat`, `signin/device`, `calendar`, plus every per-
tenant product (kintai / tempo / betoya / godx). Drift between
services destroys the platform feel — that is the bug Storybook must
not reproduce.

---

## Chat 1 — Unified shell + Gantt + quick switcher
File: `chats/chat1.md`. Started 2026-05-08.

### Topic
Bootstrap the umbrella design system from `godx-admin` + `dxs-kintai`.
Output prototype: `godx-unified.html`. Surfaces in scope: Dashboard,
Workspace (Wiki / Issues / PDCA plans / Ideas / Gantt), Code browser +
PR-lite, AI Agent platform (Skills / Tools / Agents / Sessions), Dev
panel (tmux / code-server / Mailpit / DB per dev), Domain pool /
Caddy, Login. Locale lead: **JA**.

### Ratified decisions
- Design philosophy named, written into `tokens.css`:
  **渋み (shibumi) / 間 (ma) / 簡素 (kanso)**.
  Concretely: `OKLCH chroma ≤ 0.18`, body `line-height: 1.7`, exactly
  **3 font weights** — 400 / 500 / 700.
- Font stack pinned to **M PLUS 2** + JP system fallback (Hiragino,
  Yu Gothic, Noto Sans JP, Meiryo).
- `tokens.css` is the single source-of-truth. Tenant override ONLY
  through `--primary` / `--ring` / `--foreground` (and `--brand`).
  Tenants in repo: `godx`, `kintai`, `tempo`, `betoya`. Tenant switch
  is a `[data-tenant="…"]` attribute on `<html>`.
- 5 signal colors (NEVER role-mapped beyond their semantic):
  茜 akane (destructive) / 朱 shu (attention) / 山吹 yamabuki (warning)
  / 若竹 wakatake (success) / 群青 gunjo (info).
- 13 wa-iro decorative palette (`--wa-ai` … `--wa-sumi`) reserved for
  charts / decoration / lane swatches — never for primary roles.
- **4px grid hard rule.** Three density modes: compact `28px` /
  default `32px` / comfortable `44px` (`--density-element`).
- **No emoji in product UI.** Lucide stroke 1.5, `currentColor`.
- Red reserved for destructive only.
- Shell grid: `app-root` with `grid-template-areas` (sidebar + topbar
  + main). Sidebar collapsed width `64px`, expanded `256px`.
- Topbar has a **product chip** (logo + name + ▾) AND a **project
  chip** (kind icon + mono name + ▾) — both open dropdowns:
  product picker (~280px, search + 5 products + role + project count
  + ✓ on active) and project picker (~420px, search across products,
  "最近" recent section, grouped by product, row shows kind chip
  (API/Web/Desktop…), stack, devs, last commit, issue/PR badges).
  Cross-product project switch auto-flips tenant.
- Quick-switcher pattern is **mandatory** ("phải có cái dropdown để
  switch project nhanh"); top-of-shell, not buried inside a product.
- Tweaks toolbar (global): density · theme (light/dark) · tenant
  switch · locale (ja/en/vi) · sidebar collapse · ⌘K command palette.
- Gantt v2 inside Workspace tab "ガント": 8-week horizon, sprint
  band, 4 swimlanes color-coded from wa-iro, today line as label
  pill, milestone diamonds with label, dependency arrows (SVG, FS),
  selectable bars open a 280px right-side detail panel, resource
  utilization heatmap at bottom (transparent / wakatake / yamabuki /
  shu for 0/1/2/3+ load), blocked = diagonal stripe pattern.
- Bug fixes the user demanded that became rules:
  - Collapsed sidebar: logo MUST stay centered (flex children hidden,
    not just visually muted).
  - No flicker. Single source of truth — derive product from
    `tweaks.tenant` via `useMemo`, no bidirectional `useEffect`.
  - Pulse animation `2s` (not 1.5s), respect `prefers-reduced-motion`.

### Rejected
- Inline screenshots / browser rendering for review.
- Two-way sync `tweaks.tenant ↔ product` via `useState + useEffect`
  (caused infinite re-render loop — banned pattern).
- Multi-variation design exploration ("1 design chính, không cần
  variation").

### End state
`godx-unified.html` shipped with 7 surfaces + a "ガイド" (design system
guide) sidebar entry that includes an adoption-tracker per product.
Topbar quick-switcher pattern locked. Gantt v2 in Workspace.

---

## Chat 2 — PDCA + Issue detail + auth flow
File: `chats/chat2.md`. Started 2026-05-09.

### Topic
Detail screens for `PDCA計画` and `Issue` inside the workspace;
auth screens (Zitadel-shaped) for browser + device flows.

### Ratified decisions
- **Issue detail** layout: 4 tabs `会話 / チェックリスト / コード変更 /
  履歴`. Markdown body (mini renderer: h2, lists, task lists,
  blockquote, inline code). Sidebar: assignee, reviewers, labels,
  milestone, sprint, points, ブロック関係, link "所属 PDCA".
- **Sticky QuickComposer** at footer of the issue page (Backlog.com-
  inspired). Two states:
  - Collapsed (`52px`): avatar + issue ID + placeholder "コメントを
    追加…" + status chip + priority chip. Keyboard `C` opens it.
  - Expanded (on input focus): Write/Preview toggle, markdown
    toolbar (B / I / </> / link / list / quote), textarea with max-
    height, **3 pill selectors** with popover dropdowns —
    ステータス (5 statuses with dot color) / 担当者 (avatar list) /
    優先度 (P0–P3 with dot color). Changed pill = orange glow border
    + badge "↻ 送信時に変更を反映" near submit. `⌘+Enter` submits.
    `Esc` cancels. Empty + `Esc` resets pills to default. Click-
    outside closes popover but keeps composer open if text exists.
  - Uses `position: sticky; bottom: 0; backdrop-filter: blur`.
- **PDCA plan detail** layout: header with phase + health badges,
  4-step PDCA cycle visualizer with arrows (click = switch phase).
  Per-phase content:
  - Plan: hypothesis box, success metrics table, risks.
  - Do: linked tasks (clickable → Issue Detail), decision log.
  - Check: 4 KPI tiles + 14-day SVG sparkline with target/baseline
    lines, 振り返り.
  - Act: ADOPT / TRY / DROP / PARK adoption cards, next-cycle
    preview.
- PDCA must read as a **loop**, not linear (user emphasized: "PDCA là
  vòng lặp liên tục"):
  - **系譜 (Lineage) strip** at top: `由来 · 前サイクル ← 現在 →
    派生 · 次世代` with curved dashed connectors.
  - Each TRY / PARK in Act phase has explicit link to its child PDCA
    or `+ 起票` CTA.
  - Sidebar 系譜 vertical tree (parent → current → children) with
    "世代: 第N世代" label.
- Cross-link wiring (mandatory): Plans page card → Plan Detail;
  Kanban card → Issue Detail; Plan Detail "関連タスク" row → Issue
  Detail; Issue Detail "所属 PDCA" → Plan Detail; breadcrumb back-
  arrow on both.
- **Auth flow** (Zitadel-shaped, godx wa-iro skinned):
  - Centered card `480px`, godx wordmark + footer
    "Secured by Zitadel".
  - Identity chip above password/MFA to switch user.
  - 6-box OTP input. Passkey radar pulse. SSO buttons (Google / MS).
  - Device-side: POS shown as Tauri window chrome with traffic-
    lights; KDS shown full-bleed dark for visibility from far;
    CLI shown as terminal `godx auth login` with poll spinner.
  - 8-character device code `ABCD-EFGH` shown as monospace tiles +
    QR + countdown (`4:32 残`).
  - Authorize browser side: 8 boxes (1 active with glow), device
    card with hostname + GPS + local-network badge, scope checklist
    (read/write granted, admin not included).
  - Three error states: code expired / denied / wrong code — each
    with own icon + meta info + primary/secondary action.
- Tweaks for auth: theme, density, locale (ja/en/vi all switch text
  atomically), 4-swatch brand picker 朱 / 若竹 / 群青 / 山吹.
- Real working pages (state machine + crossfade transitions):
  `signin.html` (Email → Password → 2FA → redirect to unified) and
  `device.html` (Enter code → Review & approve → Approved →
  redirect). Logout from unified returns to `signin.html`. Closed
  loop.

### Rejected
- Inline non-sticky composer on issue page (user: "phần comment được
  cố định ở footer ý!! cho ngắn height thôi !! khi nào mà focus on
  input thì mình mới phóng to nó ra").
- Linear PDCA visualization with one-way arrows.
- Mocking auth as visual-only artboards without a working state
  machine (user: "chưa có trang login cho web app à??").

### End state
`screens-detail.jsx` ships PDCA Detail (with 系譜 lineage) + Issue
Detail (with sticky 3-pill QuickComposer). `login.html` is a 15-
artboard design canvas. `signin.html` + `device.html` are real state-
machine pages wired to `godx-unified.html`.

---

## Chat 3 — Chat service (Slack-shaped, godx-skinned)
File: `chats/chat3.md`. Started 2026-05-13.

### Topic
A chat product: full Slack-shaped workspace + a floating-button
plugin embeddable into every other godx service (kintai / tempo /
betoya). Output: `chat.html` (design canvas, 4 artboards).

### Ratified decisions
- Tone: **"Đúng hệ Godx — restrained, kanso, info-dense."** Not a
  Slack clone — original visual.
- **Full workspace** layout:
  - **Workspace rail** (`60px`, far left) — switches between
    `godx / kintai / tempo / betoya`, badge for unread count per
    workspace.
  - **Channel sidebar** (`280px`) — quick filters
    `Unread / Mention / Threads / Saved / Drafts`, then sections
    `Kênh / DM / Apps` (collapsible).
  - **Channel header** — topic, member chips, actions: Huddle (voice
    UI placeholder), Video, Pin, Saved, Members.
  - **Message list** — grouped by user, hover actions (react / reply
    / save / mention / more), mention chips, inline code & bold,
    image + file attachments, reactions, thread preview, typing
    indicator.
  - **Composer** — markdown toolbar, slash-command hint, attach /
    mention / emoji / quick-action, keyboard hints.
  - **Thread panel** (`380px`, toggleable) — parent + replies +
    thread composer.
- **Plugin floating button** (Intercom-shaped, NOT a Slack copy):
  - Default popup width `~400px` (Intercom-style "Window" variant).
  - Three popup style variants: `window` / `drawer` (side) /
    `fullscreen`.
  - Float button position: any of 4 corners.
  - Unread badge animation can be toggled off.
  - Mini popup is a **plugin**, NOT the full product — clicking
    "Open full" jumps to the host service's chat page.
- **Notification settings** screen: DND banner (30m / 1h / "Đến
  sáng"), notification level (All / Mention / Nothing), thread
  follow rule, keyword interests, per-channel override, Desktop /
  Mobile push / Sound / Badge / Email switches, schedule (24/7 or
  work hours), timezone, weekdays.
- Tweaks panel mandatory for chat too: density / theme / show-hide
  thread panel / popup style / float button position / pulse on-off
  / tenant for plugin demo.
- Locale: mix VI + JP depending on chosen locale (chat is more
  bilingual than admin/console which lean JP).

### Rejected
- Copying Slack UI verbatim ("không sao chép UI của Slack — channel
  rail + workspace rail + bubble icon là thiết kế gốc").
- Multiple layout variations (`variations_layout: 1`).

### End state
`chat.html` has 4 artboards: full workspace, notification settings,
floating plugin demo over a tenant background, popup variants.
Followup queue (not built): channel detail / member list panel, DM
typing & read receipts, mobile breakpoint, context-aware chat
(attached to order/shift/task).

---

## Chat 4 — Console (Org / Branches / Brands / Members / Billing)
File: `chats/chat4.md`. Started 2026-05-13.

### Topic
Organization admin console — user manages Org, Branches, Brands,
subscribed services, teams, members, billing. Sits at the layer
above per-product (kintai etc.) admin.

### Ratified decisions
- Reuses `tokens.css` + `tokens-ext.css` — **no new design tokens**.
  Sidebar `220px` / topbar `56px` to match peer surfaces.
- Sidebar structure (per reference image the user pasted): Dashboard
  → Organization (Overview / Branches / Brands / Members / Teams /
  Service Access / Settings) → Services → Billing
  (Manage / Invoices).
- Dashboard layout: welcome + **Your Products** + **Products to
  Try** + **Your Statistics** (3 panel pattern repeated across me /
  console).
- Branches table: brand filter, mixes JP + VN locations (Famgia +
  Betoya + Vietnam).
- Members table: CSV upload + invite button.
- Teams: card grid (not table).
- Service Access: matrix `team × service`, per-row role / permission
  toggles.
- Settings: General / SSO / Locale / Danger Zone.
- Billing Manage: plan / seats / payment / current-month line items
  with **10% JP tax** shown explicitly.
- Invite Members: **3-step modal** flow — recipients → role /
  branches / teams / services → review.
- Tweaks panel mandatory: theme / density / locale / sidebar /
  brand color + jump-to-screen + "open Invite modal" shortcut.

### Rejected
- No explicit rejections (user accepted single-pass output).

### End state
`console.html` shipped with all sub-pages, mock data covers Famgia +
Betoya, 11 branches (JP+VN), 5 services, 17 members, 7 teams.

---

## Chat 5 — `me.domain.com` personal portal
File: `chats/chat5.md`. Started 2026-05-16.

### Topic
Personal/portable user portal — 1 user across the whole platform,
membership in orgs is invite-or-self-register; user keeps access to
their history (e.g. payslips) **even after leaving an org**
(SmartHR-style portability).

### Ratified decisions
- Sidebar 6 groups:
  1. **マイページ** — personal dashboard: hero with avatar, name
     kanji + furigana, invitation banner, grid of member orgs,
     latest payslip, activity log.
  2. **Account** — プロフィール / 連絡先 / 本人確認 (My Number,
     eKYC, ID documents).
  3. **Memberships** — 所属組織 (tabs: active + **退職済み**) and
     招待 (pending invites).
  4. **Records** — 給与明細 / 源泉徴収票 / 勤怠履歴 (cross-org;
     includes past employers).
  5. **Connections** — 連携サービス + 外部アカウント (Google /
     Apple / LINE).
  6. **Settings** — プライバシー (matrix grant per-org per-field) /
     セキュリティ (2FA, sessions) / 通知 / 環境設定.
- **SmartHR-style portability** is the load-bearing UX promise:
  - Past organizations remain in `所属組織` under tab `退職済み`
    badged "履歴のみ"; payslip page still shows old payroll (e.g.
    Acme Holdings 2019).
  - 給与明細 page groups by year, with bar chart, per-employer
    filter (incl. past).
  - 源泉徴収票 lists current + 退職組織 docs (archived tag).
  - Privacy matrix has columns = organizations (incl. past) and
    rows = PII fields. User sees that an ex-employer can read only
    `name / email / birthDate` to retain tax history; other fields
    are revoked.
- Page chrome reuses `console.css` exactly — same sidebar `220px` /
  topbar `56px` / spacing / font / leading `1.7` / OKLCH palette /
  badge/table/chip patterns. `me.css` only overrides what's
  genuinely new: hero personal block, invite banner (`朱` shu),
  privacy matrix cell, switch toggle.
- **No new icons** outside the design system (Lucide, stroke 1.5,
  `currentColor` — locked).
- Tweaks: theme / density / locale / tenant + screen-jump + toggle
  invitations + simulate "未所属" empty-state user.
- Verifier fixes locked as rules: `white-space: nowrap` for context
  labels, user name, user email; payslip toolbar may wrap to
  multiple lines BUT pills within each segment must not wrap.

### Rejected
- A brand-new design language for `me`. The user's request: "design
  guide line phải đồng bộ với toàn bộ hệ thống hiện tại nhé."
- Treating past employers as deleted/hidden data.

### End state
`me.html` + `me-shell.jsx` + `me-screens-{a,b,c}.jsx` + `me-data.jsx`
+ `me-icons.jsx` + `me.css` cover 15 screens. Adoption-tracker entry
expected for `me-service`.

---

## Chat 6 — Calendar (Google-shape)
File: `chats/chat6.md`. Started 2026-05-16.

### Topic
A calendar service ("dịch vụ như google calendar"). Files exist in
`project/`: `calendar-shell.jsx`, `calendar-data.jsx`. Build was
not finished in this chat — the transcript was cut off after the
ask ("xong chưa") and an empty assistant turn.

### Ratified decisions
- Scaffolding files exist (shell + data) — implementation may
  reuse the same `tokens.css` / shell pattern as `me` / `console`
  / `unified`.

### Rejected
- (Nothing explicit in this chat.)

### End state
**Incomplete.** Implementation agents should NOT treat this as a
locked spec; treat `calendar-shell.jsx` / `calendar-data.jsx` as
work-in-progress scaffolding. If implementing, confirm scope first.

---

## Cross-cutting ratified rules (consolidated from all 6 chats + README)

- **Design philosophy** (from `tokens.css` header — load-bearing,
  not decoration): 渋み (shibumi, restrained) / 間 (ma, breathing
  room) / 簡素 (kanso, simplicity).
- **Color model**: OKLCH only. Primary chroma ≤ 0.18. Five role
  colors map to wa-iro hue centers (akane / shu / yamabuki /
  wakatake / gunjo). 13-color decorative wa-iro palette is for
  charts and accents — never role-mapped.
- **Type**: M PLUS 2 + JP fallback. Three weights only — 400 / 500 /
  700. Base body 14px (`--text-base`), body line-height 1.7,
  heading line-height tight. Heading sizes intentionally small
  (h1 = 20px, h2 = 18px, h3 = 14px) — info-dense JP enterprise.
- **Spacing**: 4px grid. Three density modes (compact 28 / default
  32 / comfortable 44). Touch target min 44px (Digital Agency
  hard rule).
- **Radius**: base `6px` (`--radius`), full = pill. No oversized
  pill primaries.
- **Shape**: low elevation. Shadow tokens `--shadow-sm` through
  `--shadow-2xl`, but card defaults are flat with `1px` border.
- **Motion**: `150 / 200 / 300 / 500ms` durations + 3 easings.
  Pulse / radar animations respect `prefers-reduced-motion`.
- **Icons**: Lucide, stroke 1.5, `currentColor`. **No emoji in
  product UI.**
- **Dark mode**: per `tokens-ext.css` — same hue centers, lightened
  primaries (`oklch(70% 0.13 …)`). Sidebar slightly darker than
  body; active sidebar item uses tinted primary.
- **Tenant theming**: `[data-tenant="…"]` on `<html>`. Tenants in
  repo: `godx / kintai / tempo / betoya`. Tenant ONLY overrides
  `--primary` / `--ring` / `--foreground` / `--brand`. No tenant
  rewrites typography, spacing, density, or layout.
- **Shell anatomy** (all surfaces share it):
  - Sidebar 220–256px expanded, 64px collapsed. Logo MUST stay
    centered when collapsed.
  - Topbar 48–56px. Carries product chip + project chip with
    dropdown quick-switchers, ⌘K, locale + density + theme tweaks.
  - Main grid via `grid-template-areas`.
- **Quick-switcher** at topbar is required on every shell — product
  picker (~280px) + project picker (~420px with cross-product
  search + "最近" section + per-row metadata kind chip / stack /
  devs / last commit / issue+PR badges). Cross-product switch
  auto-flips tenant.
- **Tweaks panel** present on every prototype: theme · density ·
  locale (ja/en/vi) · tenant · sidebar collapse · screen-jump.
  In implementation this is the Storybook controls layer.
- **Locale**: JA leads admin/console/me; chat is JA+VI mix; auth
  is full ja/en/vi triplet. All UI strings switch atomically when
  locale changes.
- **Banned patterns** (each cited verbatim or reconstructed from
  user/verifier corrections):
  - Two-way `useState ↔ useEffect` sync (flicker source).
  - Emoji in product UI.
  - Red outside destructive.
  - Slack/Linear/etc copy-paste UI.
  - Past-data hiding (the user explicitly wants ex-org history
    visible — see chat 5).
  - Hard-coded tenant accents in components — must come from
    `--primary` / `--brand` token.
  - Marketing speak in copy ("powerful", "enterprise-grade", etc.,
    per `CLAUDE.md` rule 9).

---

## Implementation priorities

**Top 10 visual properties every Storybook story MUST reflect** so the
storybook actually feels like "the design system" instead of a
generic component-library default. The user's grievance: Storybook
"looks completely different from the design." These are the things
that fix that.

1. **Font + leading + weights**: M PLUS 2 (load it!), body 14px,
   line-height 1.7, only 3 weights (400 / 500 / 700). If a story
   renders in Inter or system-ui at line-height 1.5, it is wrong
   on sight.
2. **OKLCH palette + tenant attribute**: stories must wrap in a
   container that sets `[data-tenant="godx|kintai|tempo|betoya"]`
   on the document or root, and `[data-theme="light|dark"]`.
   Default `godx` + `light`. Storybook globals = tenant + theme +
   density.
3. **Density modes via attribute, not prop**: `[data-density=
   "compact|default|comfortable"]` on root. Stories show all 3
   in the controls so reviewers can see 28 / 32 / 44 px element
   heights.
4. **4px grid + small headings**: h1 = 20px, h2 = 18px, h3 = 14px.
   Page titles do not balloon to 32px. If a story page title
   reads bigger than its body by more than ~1.4×, it broke the
   info-dense rule.
5. **Warm off-white background, warm off-black text**:
   `oklch(99% 0.002 60)` body, `oklch(20% 0.006 60)` text — NOT
   pure white / pure black. Pure-white background screams
   "default Storybook" to the user.
6. **Wa-iro accents only via role tokens**: success badge is
   wakatake (`--success`), warning is yamabuki, attention is shu,
   destructive is akane, info is gunjo. Never raw hex; never blue
   for success.
7. **Lucide stroke 1.5, no emoji**: icon stories use Lucide with
   `stroke-width: 1.5` and `currentColor`. An emoji in a button is
   an instant fail.
8. **Flat-ish elevation**: cards default to `1px` border with
   `--border` + `--card` bg; shadows only on popovers / dropdowns
   / dialogs. Heavy material-style elevation = wrong.
9. **Shell preview stories**: every shell composition story renders
   the full sidebar (with collapsed/expanded variant) + topbar
   (with product chip + project chip dropdowns) + tweaks panel
   surface, in light AND dark. Without that, the design language
   is invisible.
10. **Pattern primitives from the prototypes**: badge with status
    dot, 3-pill QuickComposer pattern (Backlog-style), KPI tile +
    sparkline, Gantt swimlane bar (progress fill + diagonal-stripe
    blocked state + milestone diamond + today pill), dependency
    arrow (SVG, FS), invite modal 3-step pattern, privacy matrix
    cell (per-org × per-field toggle), 6-box OTP, 8-tile device
    code, identity chip (switch-user above password), ADOPT/TRY/
    DROP/PARK adoption card. Each appears as its own Storybook
    story under `stories/patterns/` or `stories/shell/` — these
    are what tell a reviewer "yes, this is godx."

If a Storybook PR adds a primitive that satisfies the docs/code
contract but visually fails any one of the 10 above, the design
system is regressing. The submodule cardinal rules
(`libs/ts/godxjp-ui/CLAUDE.md`) already require paired stories +
token-only utilities + Radix; this INTENT layers on top to ensure
those stories look like the prototypes the user actually signed
off on.
