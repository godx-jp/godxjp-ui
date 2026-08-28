# Audit — 47 component trùng shadcn/ui

> Sinh bởi `scripts/audit-shadcn-overlap.mjs`. Chạy lại: `node scripts/audit-shadcn-overlap.mjs`
> Ngày: 2026-08-28 · Đối chiếu catalog shadcn/ui (57 component)

## Câu hỏi

Base trên shadcn thì component **trùng tên** còn giá trị gì? Giữ cái nào, bỏ cái nào?

## Phương pháp

Giá trị của tầng godxjp **không** nằm ở "component có tồn tại" — mà ở **hợp đồng** nó ký:
token-themeable (rule #44/#45) · a11y contract có test axe · i18n · controlled vocabulary.

Nên trục đo là: **còn bao nhiêu hằng số hình học/chrome hard-code** — thứ khiến service
theme *không* chỉnh được. Utility role (`bg-primary`, `text-muted-foreground`) KHÔNG tính
là vi phạm (chúng đã token-backed qua Tailwind v4 `@theme`). Chỉ tính literal scale:
`px-2`, `max-w-xs`, `rounded-md`, `z-50`, `h-7`…

## Kết quả tổng

| | |
|---|---|
| Component trùng shadcn | **47** |
| Đáng giữ | **45** (96%) |
| Thực sự mỏng, cần quyết định | **2** |
| **Hằng số hard-code cần tokenize** | **272** |
| Component đã sạch hợp đồng | **22** |
| Component còn nợ hợp đồng | **23** |

**Kết luận: gần như không có gì đáng xoá.** Vấn đề không phải "trùng shadcn nên thừa" —
mà là **23/47 chưa hoàn thành hợp đồng token**, nên chúng *đang* chỉ ngang shadcn.
Hoàn thành 272 điểm đó chính là cách "tăng giá trị".

---

## A. GIỮ NGUYÊN — đã hoàn thiện hợp đồng (22)

0 hằng số hard-code. Đây là chuẩn để nhóm B noi theo.

| Component | hard | LOC | token | ui-* | cases | axe | — |
|---|---|---|---|---|---|---|---|
| `accordion` | 0 | 54 | 1 | 6 | 5 | 1 |  |
| `aspect-ratio` | 0 | 19 | 0 | 1 | 3 | 1 |  |
| `avatar` | 0 | 57 | 9 | 3 | 13 | 2 |  |
| `badge` | 0 | 170 | 5 | 0 | 17 | 1 |  |
| `breadcrumb` | 0 | 50 | 1 | 5 | 4 | 1 |  |
| `carousel` | 0 | 278 | 1 | 10 | 13 | 1 |  |
| `command` | 0 | 80 | 12 | 8 | 19 | 1 |  |
| `context-menu` | 0 | 172 | 0 | 15 | 9 | 1 |  |
| `field` | 0 | 23 | 1 | 5 | 59 | 5 |  |
| `form` | 0 | 110 | 5 | 2 | 149 | 6 |  |
| `hover-card` | 0 | 52 | 0 | 1 | 4 | 1 |  |
| `input-otp` | 0 | 95 | 0 | 7 | 16 | 1 |  |
| `menubar` | 0 | 164 | 3 | 15 | 9 | 1 |  |
| `navigation-menu` | 0 | 102 | 0 | 8 | 4 | 1 |  |
| `progress` | 0 | 49 | 3 | 4 | 8 | 1 |  |
| `resizable` | 0 | 64 | 0 | 3 | 4 | 1 |  |
| `separator` | 0 | 21 | 0 | 1 | 5 | 1 |  |
| `sidebar` | 0 | 577 | 35 | 0 | 70 | 2 |  |
| `slider` | 0 | 61 | 4 | 4 | 16 | 1 |  |
| `toggle` | 0 | 42 | 4 | 6 | 29 | 3 |  |
| `toggle-group` | 0 | 74 | 0 | 1 | 11 | 2 |  |
| `typography` | 0 | 99 | 0 | 2 | 13 | 1 |  |

## B. GIỮ + PHẢI TOKENIZE (23) — trọng tâm v19

Mỗi hằng số dưới đây là một chỗ service theme **không** chỉnh được. Sắp theo mức nợ.

| Component | hard | LOC | token | ui-* | cases | axe | Ví dụ vi phạm |
|---|---|---|---|---|---|---|---|
| `select` | 29 | 452 | 0 | 0 | 152 | 5 | w-full gap-2 size-4 opacity-50 |
| `dropdown-menu` | 29 | 191 | 0 | 0 | 5 | 1 | px-2 py-1.5 ps-8 text-sm |
| `calendar` | 28 | 121 | 0 | 0 | 7 | 1 | w-fit p-3 gap-4 w-full |
| `sheet` | 28 | 324 | 7 | 0 | 19 | 2 | inset-0 z-50 shadow-lg h-full |
| `data-table` | 19 | 1304 | 0 | 26 | 112 | 6 | size-4 top-0 z-10 w-10 |
| `button` | 19 | 156 | 2 | 16 | 26 | 1 | py-2 px-3 gap-1 px-2 |
| `input` | 17 | 172 | 0 | 1 | 98 | 6 | w-full min-w-0 h-7 border-0 |
| `date-picker` | 15 | 203 | 0 | 0 | 19 | 0 | pe-14 gap-1 size-5 rounded-sm |
| `skeleton` | 15 | 98 | 5 | 13 | 8 | 1 | h-4 h-3 h-7 w-24 |
| `tabs` | 11 | 199 | 5 | 0 | 76 | 2 | min-w-0 gap-2 h-auto w-full |
| `textarea` | 10 | 105 | 0 | 0 | 16 | 1 | w-full pe-9 end-2 top-2 |
| `popover` | 7 | 63 | 1 | 0 | 5 | 1 | z-50 w-72 p-4 rounded-md |
| `scroll-area` | 7 | 45 | 0 | 0 | 4 | 1 | size-full h-full w-2.5 p-px |
| `tooltip` | 7 | 51 | 0 | 0 | 6 | 1 | z-50 w-fit max-w-xs px-2 |
| `dialog` | 6 | 540 | 10 | 4 | 47 | 3 | size-4 min-w-0 text-sm |
| `table` | 5 | 183 | 41 | 5 | 169 | 8 | w-full text-sm border-0 |
| `label` | 5 | 26 | 0 | 0 | 19 | 1 | text-sm leading-none opacity-70 gap-2 |
| `alert` | 5 | 236 | 7 | 1 | 29 | 2 | opacity-100 size-4 min-w-0 |
| `sonner` | 5 | 59 | 0 | 0 | 8 | 1 | size-4 |
| `pagination` | 2 | 292 | 5 | 15 | 51 | 2 | size-4 |
| `card` | 1 | 306 | 44 | 6 | 122 | 6 | border-2 |
| `checkbox` | 1 | 31 | 4 | 3 | 23 | 2 | opacity-50 |
| `switch` | 1 | 46 | 13 | 2 | 34 | 4 | opacity-50 |

## C. MỎNG — cần quyết định (2)

| Component | hard | LOC | token | ui-* | cases | axe | — |
|---|---|---|---|---|---|---|---|
| `collapsible` | 0 | 6 | 0 | 0 | 5 | 1 |  |
| `alert-dialog` | 0 | 0 | 0 | 0 | 7 | 1 |  |

- `collapsible` — 5 LOC re-export thuần Radix, **zero value-add**. Giữ làm barrel cho API
  nhất quán, hoặc bỏ khỏi public surface. Chi phí bảo trì ~0 → khuyến nghị **giữ**.
- `alert-dialog` — alias re-export của `feedback/dialog`. Hợp lệ, **giữ**.

## Việc cần làm (v19)

1. Với mỗi component nhóm B: chuyển literal → component token theo
   `docs/TOKENS.md` · Add-a-token checklist (5 bước, đúng thứ tự).
2. Thêm guard `scripts/check-no-hardcoded-geometry.mjs` để 272 → 0 và **không tái phát**.
3. Cập nhật `mcp/src/data/tokens.ts` + rebuild MCP cho mỗi token mới.
