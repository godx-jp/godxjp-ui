---
name: godxjp-ui-design-handoff
description: BẮT BUỘC khi nhận một Claude Design handoff bundle (export từ claude.ai/design — README + chats/ + project/ HTML/CSS prototypes, vd .design/bundle/<name>/) và cần hiện thực hoá nó. Biến design thành SHOWCASE base trên @godxjp/ui ở preview 6008 (docs/) — KHÔNG bao giờ thêm vào ui framework. Áp theo kiểu "khung xương" (tái hiện ý đồ thị giác/UX bằng real component), không copy máy móc HTML prototype. Đọc TRƯỚC khi viết.
---

# Implementing a Claude Design handoff on @godxjp/ui — skeleton, not transcription

A Claude Design bundle (`claude.ai/design` export) is an **HTML/CSS/JS prototype**, not production
code. Your job is **not** to translate its markup line-by-line. It is to read the *intent*, lift the
*visual + interaction skeleton*, and **rebuild it with REAL `@godxjp/ui` components** as a **showcase**.

> **Mechanical = wrong.** A pixel-copy that hand-rolls `<div class="card">` to match the mock is a
> failure. The right output composes `Card`/`DataTable`/`PageShell`/`Badge`… so the showcase *is*
> how a consumer should actually build it. The prototype is the **target look**, godx-ui is the **means**.

## The hard boundary (read this twice)

- **Showcases live in `docs/` (preview at `:6008`), NEVER in `src/components/`.** They are
  compositions for humans + the MCP to learn from — adding them to the framework bloats every
  consumer's bundle. The framework stays lean; the showcase layer is where app patterns live.
- **Only real `@godxjp/ui` primitives.** No hand-rolled controls, no raw HTML re-creating a primitive
  (rule 29). If you're writing a styled `<div>` that looks like a Card, stop — use `Card`.
- **Tokens already exist.** The design's `colors_and_type.css` is *already* implemented as godx-ui's
  `src/tokens/foundation.css` (same SmartHR blue, wa-iro, M PLUS 2, densities). Never redeclare a
  token — consume `var(--…)` / the semantic utilities. If a token seems missing, it almost certainly
  exists under a different name; grep before inventing.

## Process

1. **Read the chats first** (`<bundle>/chats/*.md`) — they hold *what the user actually wants* and
   where they landed after iterating. The final HTML is the output; the chat is the intent.
2. **Read the bundle README + SKILL.md + `colors_and_type.css`** for the design DNA (below). Then the
   primary surface (`ui_kits/.../UI Kit.html`, the `project/*.html`) and follow its imports.
3. **Decompose each screen into a component shopping list.** For every visual block ask: *which
   godx-ui component is this?* (page chrome → `PageContainer`/`AppShell`/`Sidebar`/`Topbar`; a stat
   row → `ResponsiveGrid` + `StatCard`; a data grid → `DataTable`; a status pill → `Badge tone=…`;
   a filter row → `Form` inline + `Select`/`Input`; an empty state → `EmptyState`; a confirm →
   `AlertDialog`). Use the **`godxjp_ui_guide` MCP** / `list_primitives` to map, don't guess.
4. **Identify GAPS** — blocks no existing component (or prop/variant) can express.
   - First try: **extend** — can an existing component take one more `variant`/`size`/`tone`/slot?
   - Genuine gap or unclear: run **`/debate`** ("new component vs. new variant on `<X>` vs.
     app-level composition") and converge on an ADR before building. **Never silently invent.**
   - The fix for a gap is *still a showcase composition or an upstream component change* — never a
     bespoke one-off baked into the showcase page.
5. **Build the showcase** in `docs/<group-or-recipes>/<screen>.tsx` per the **`godxjp-ui-example-page`**
   skill (completeness, real states, tokens, a11y). Recreate the *look*, not the prototype's DOM.
6. **Verify** at `:6008/isolate/<id>` (390/768/1280), console clean, `pnpm typecheck` + `pnpm audit`.
7. **Make it MCP-discoverable** — register the showcase so `godxjp_ui_guide` can serve it as a
   pattern (so future consumers get "here's how a real kintai dashboard is built", not just atoms).

## Tables are first-class (DataTable matters most)

Enterprise 勤怠/admin design lives in tables. A handoff implementation MUST showcase the **table
family broadly**, each as its own demo: default list · **compact (kintone-density)** · filter bar +
bulk-action toolbar · sticky header + horizontal scroll (`min-w-[…]`) · row selection + batch ·
status-cell (`Badge tone`) · sortable/paginated · expandable / tree rows · empty + loading
(`Skeleton`) + error states · numeric columns with `tabular-nums`. If `DataTable` can't express one,
that's a `/debate` candidate (Rule #4).

## Design DNA to apply as the skeleton (dxs-kintai)

These are the *rules that survive* when you drop the prototype's markup — apply them, not the divs:

- **渋み (shibumi)** restraint — primary chroma ≤ 0.18; `--primary` is the single most-important
  action + brand surfaces only, **never status**. No saturated brand, no gradients, no pill cards.
- **間 (ma)** breathing — body **14px / 1.7** (never 16/1.5); `tabular-nums` on numeric columns.
- **簡素 (kanso)** simplicity — **three weights** 400/500/700; **headings stay small** (h1 = 20px,
  not 32) — JP enterprise is dense, big headings waste 間.
- **Color signaling is fixed-mapping** — success 若竹 · warning 山吹 · info 群青 · **attention 朱
  (prefer over red for non-destructive: 遅刻/lateness)** · danger 茜 (destructive only). Wa-iro is
  decorative (charts/tags/tenant) — **never** remap to a semantic role.
- **Density up front** — compact 28px (heavy tables) · default 32px · comfortable 44px (login/mobile,
  44px touch floor). Set on the container; don't mix mid-page.
- **Cards: 1px border, no shadow at rest**; shadows only on popover (md) / dialog (xl). Radius 6px.
- **Copy: quiet & factual** — 「承認しました」 not 「承認に成功しました🎉」. Empty state = one calm
  sentence, no illustration. **No emoji in product UI.** Mixed JP/EN/VI is normal; never hardcode —
  i18n keys. ASCII quotes in code-like labels.
- **Multi-tenant** — tenants override only `--primary`/`--ring`/`--foreground` (`data-tenant="betoya"`
  → VN green). Semantic colors stay shared (a "rejected" badge means the same everywhere).
- **Icons** — `lucide-react`, stroke 1.5, `currentColor`, sized by context (14 table / 16 nav / 18
  button / 20 header). Never decorative fills.

## Checklist before calling a handoff "implemented"

- [ ] Read chats (intent) + README/SKILL/tokens (DNA) before any code
- [ ] Each screen mapped to real godx-ui components (MCP-checked) — zero hand-rolled primitives
- [ ] Every gap resolved by extend-or-`/debate`+ADR — nothing silently invented, nothing added to `src/components`
- [ ] Tables showcased broadly (≥ the variants above); DataTable is the centerpiece
- [ ] Tokens consumed, never redeclared; DNA rules applied (density, color signaling, small headings, 14/1.7, no emoji)
- [ ] Built per `godxjp-ui-example-page` (states/props/a11y complete); verified at :6008 390/768/1280; typecheck + audit clean
- [ ] Showcase registered so the MCP can serve it as a pattern to consumers

## Layout hygiene — responsive, no fades, no dead space (BẮT BUỘC)

Ba lỗi showcase hay gặp nhất — chặn từ gốc:

1. **CẤM fade/scrim trang trí ở mép.** Nội dung kết thúc bằng `border` 1px sạch, KHÔNG bao
   giờ gradient / `mask-image` mờ dần ở đáy hay cạnh. Fade đọc ra như AI-slop và che mất dữ
   liệu. Tín hiệu cuộn = scrollbar thật hoặc sticky header — không phải lớp veil gradient.

2. **CẤM khoảng trống chết — pane co theo nội dung, cột canh đều.** Trong split / master-detail
   / grid, pane ngắn KHÔNG được để lại khoảng trống xám cao. Dùng `items-start` để list ngắn
   không bị kéo giãn; cho pane `h-fit` / chiều cao theo nội dung; hoặc lấp bằng `EmptyState` đàng
   hoàng — tuyệt đối không để mảng xám rỗng. Canh chiều cao theo nội dung, không theo overflow
   của sibling cao nhất.

3. **Quy tắc đa cột responsive — mobile-first, LUÔN LUÔN.** Mọi khối nhiều cột (grid key-value,
   master-detail, grid card) **mặc định 1 cột**, chỉ thêm cột ở `md:`/`lg:` VÀ chỉ khi mỗi cột
   giữ được chữ thân ≥ 14px với bề rộng đủ (≥ ~280px/cột).
   - Key-value detail: `grid-cols-1 md:grid-cols-2` — KHÔNG nhồi chữ bé vào 2 cột hẹp.
   - Master-detail: mobile thì xếp dọc (list rồi detail) hoặc detail thành `Sheet`/`Drawer`;
     đặt cạnh nhau chỉ từ `lg`. Test 390 / 768 / 1280 — nếu chữ phải co lại để vừa 2 cột → về 1 cột.

Đây là dạng thực thi của Rule #1 (mobile-first) + 間 (thoáng nhưng không rỗng).

4. **Padding trang + gutter giữa các khối có viền — CẤM dán sát.** Nội dung KHÔNG bao giờ sát
   mép viewport hay sát viền sibling. `PageContainer`/`PageContent` cấp padding nhất quán (mặc
   định, không để 0); các `Card`/section cách nhau bằng `Stack gap` (≥ token). **Hai bề mặt có
   viền KHÔNG được chạm nhau** — luôn có khoảng thở (間). Header band tách khỏi content bằng gap,
   không phải viền-dính-viền. Thấy 2 border kề sát hoặc nội dung sát mép = thiếu padding/gap → sửa
   ngay. Mọi page bọc `PageContainer` (đừng tự đặt padding cấp page lung tung).

5. **CẤM title/header tràn dòng xấu.** Heading/label ngắn (section title, KPI label, `Badge`, tên
   cột, nút) giữ **MỘT dòng** — `whitespace-nowrap` + `shrink-0`, cho đủ chỗ. Nếu một hàng header
   không vừa thì **xuống hàng CẢ CỤM** (`flex-col` ở mobile, `sm:flex-row`), KHÔNG để từng nhãn gãy
   giữa chừng kiểu "Showcase\n(1)". Giá trị dài thực sự → `truncate` + title tooltip; tiêu đề 1–2 từ
   KHÔNG bao giờ được vỡ nhiều dòng. Số/nhãn cố định dùng `tabular-nums` + nowrap. Header 2 phần
   (tiêu đề ↔ phụ đề/meta) ở hẹp thì stack dọc, không nhồi `justify-between` để cả hai cùng gãy.
