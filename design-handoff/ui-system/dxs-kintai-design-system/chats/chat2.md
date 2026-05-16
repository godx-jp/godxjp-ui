# Card Pattern Designs

_Started 2026-05-08 05:55 UTC_

---

## User

thêm giúp mình nhiều pattern cho card nhé hiện tại card chỉ có đúng 1 loại à thêm nhiều vào

## Assistant

_[tool: list_files]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: write_file]_

Mình hiểu rồi — hiện preview card chỉ có 1 KPI variant. Mình sẽ làm lại `comp-card.html` thành một bộ pattern card đầy đủ cho dxs-kintai (giữ đúng rule: 1px border, không shadow at rest, 6px radius, mixed JP/VI copy, prefer 朱 over 茜).

_[tool: done]_

_[tool: fork_verifier_agent]_

Đã thêm 12 pattern card cho `preview/comp-card.html`, giữ đúng rule design system (1px border, no shadow at rest, semantic colors qua `color-mix`, không tạo màu mới):

1. **Stat / KPI** — đơn / có delta / so sánh kép
2. **Staff** — avatar + role + status dot (kèm tenant Vietnamese staff)
3. **Shift** — accent-left primary / attention cho slot chưa được gán
4. **Approval** — header / body / footer chuẩn `.flush` + `.ch / .cb / .cf`
5. **Notice** — 3 cấp info / attention / success, accent-left + icon
6. **Empty state** — một câu calm, không illustration
7. **Action card** — punch-in CTA (comfortable density, 48px touch)
8. **List card** — header + rows + see-all footer
9. **Settings row** — title + description + toggle/select
10. **Data list** — label–value (default + muted-bg variant)
11. **Calendar day** — mini grid 7 ngày, có today / 未割当 / 公休
12. **Chart card** — bars + legend footer

Tất cả dùng chung 1 atom `.card` + modifier (`.tight / .flush / .muted-bg / .outline-only / .accent-{primary,attention,success,warning,info}`), nên thêm pattern mới sau này chỉ là phối lại — không cần CSS riêng.

## User

hãy thiết kế luôn fullset của table trong trang list crud được ko? filter,search,sort,display ẩn hiện các cột nào, tìm kiếm chi tiết, import export, pagination, được ko? rồi kể cả các thể loại như expand row(kiểu như detail của 1 row) hay toàn bộ khả năng mà trong trang list có thể có, à cả editable row nữa... nhiều lắm

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: write_file]_

Mình hiểu rồi — đây sẽ là một bộ table system lớn. Mình sẽ cover tất cả những gì bạn liệt kê + một số pattern table CRUD enterprise hay gặp khác (sticky col, grouped row, row states, saved view, density, empty/loading/error...). Giữ trong 1 file `comp-table.html` cho đỡ phân mảnh.

_[tool: done]_

## Assistant

_[tool: fork_verifier_agent]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Đã rebuild `preview/comp-table.html` thành full table system cho trang CRUD list — 13 sections, tất cả share chung 1 atom `.tbl-shell` (1px border, 6px radius, no shadow):

1. **Assembled list page** — view tabs · toolbar (search + ⌘K + density + columns + import/export + primary CTA) · active filter chip bar · table · footer totals · pagination
2. **Bulk actions** — selection mode thay thế toolbar, "select all 1,284" affordance, destructive tách riêng
3. **Column manager** — drag-reorder, lock cột bắt buộc, search, density popover, "N / M 表示中"
4. **Advanced filter** — multi-condition AND/OR, value type tự đổi theo field, "適用 (推定 N 件)", save-as-view
5. **Sort & resize** — single + multi-sort (số thứ tự 1/2/3), resize handle 4px
6. **Expand row** — inline detail panel với border-left 3px primary
7. **Editable row** — row-level commit, dirty-dot, frozen confirmed rows, footer "未保存" persistent
8. **Grouped + tree rows** — group header với count + sum, indent 14px/level, twirl ▶
9. **Sticky columns** — first col (識別子) + last col (操作), shadow inset để tách
10. **Pagination · 3 variants** — numbered / load-more / cursor (jump-to-month) + rule chọn loại nào
11. **Import / Export** — stepper 4 bước, validation preview kèm error rows, SHIFT-JIS detect, UTF-8 BOM default
12. **Density · 3 modes** — compact 28 / cozy 36 / comfortable 48
13. **States** — filter-empty vs truly-empty (copy + CTA khác nhau), skeleton loading, error có code + req-id

Tất cả row states (`hover · selected · is-new · is-error · is-editing · disabled · expanded · group-row`) chỉ đổi `background` qua `color-mix(...semantic..., var(--card))` — không invent màu mới. Numeric cells đều `tabular-nums` + right-aligned, header sort indicator align cùng cell content.

## User

Regenerate "Components · Table": chưa thân thiện cho responsive , khi màn hình nhỏ các nút, tabs chữ đang bị kéo 2 dòng gây lệch height break design

## Assistant

_[tool: str_replace_edit]_

Đúng — toolbar/tabs/buttons cần `white-space: nowrap` + `flex-shrink: 0`, và row container cần `flex-wrap` với `row-gap` để khi xuống dòng vẫn giữ đúng height. View tabs nên horizontal-scroll thay vì wrap.

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_to_user]_

Đã fix responsive cho comp-table:

**Atom-level (mọi child không bao giờ wrap/co):**
- `.tbtn`, `.fchip`, `.pgn button`, `.tbl-views .tab`, `.tbl-bulk count/all`, `.tbl-footer .totals span` → `white-space: nowrap` + `flex-shrink: 0` + `line-height: 1`
- Toolbar buttons giờ giữ đúng 28px height ở mọi width

**Container-level (cho phép wrap thành nhiều dòng nhưng giữ height từng item):**
- `.tbl-toolbar`, `.tbl-bulk`, `.tbl-pagination`, `.tbl-footer`, `.adv-filter .hd / .ft` → `flex-wrap: wrap` + `row-gap: 6px`
- `.tbl-search` → `flex: 1 1 200px; min-width: 160px` (co được nhưng có sàn, không bao giờ dí thành 0)

**View tabs riêng (đặc biệt):**
- `flex-wrap: nowrap` + `overflow-x: auto` + scrollbar ẩn → khi nhiều tab, scroll ngang thay vì wrap (giữ height 38px tuyệt đối)

**Layout grids:**
- 2-col / 3-col internal grids (sections ③, ⑪, ⑫, ⑬) đeo class `.responsive-2 / .responsive-3` → collapse về 1 cột ở ≤ 680px
- Expand-row detail grid (4 cột) → 2 cột ở ≤ 680px → 1 cột ở ≤ 480px
- Advanced filter `.cond` → re-grid bằng `grid-template-areas` ở ≤ 640px: row trên = conj/field/op/x, row dưới = value full-width

Bây giờ ở mọi viewport width, không có button/tab/chip nào bị wrap text → không vỡ height nữa.

