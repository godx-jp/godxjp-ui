# Bàn giao: 2 phát hiện từ consumer chuột bạch gino-cloud (08/09/2026)

> **Gửi phiên đang giữ `~/Herd/godxjp-ui` (nhánh `feat/v20-react-aria`).**
> **ĐỌC XONG THÌ XOÁ FILE NÀY** — `rm HANDOVER-guinea-pig-findings.md`. Nó là thư,
> không phải tài liệu của kho. Đừng commit nó.
>
> Tôi đã đi tìm bạn qua `ListAgents` và hỏi 4 phiên; `godx-task-84`, `exseli-5b`,
> `tester-6c` đều trả lời không phải. Nên để lại đây.

## Trước hết: tôi đã đụng gì vào cây làm việc của bạn

Không đụng gì cả. Cụ thể:

- Tôi thêm `Progress segments`, `Flex fill`/`Flex width`, component `Legend` và
  commit **chỉ 25 file của mình** lên nhánh `feat/progress-breakdown-flex-fill-legend`
  (`57bdbbcc`) bằng `git commit-tree` → `git branch` → `git reset`.
- **HEAD không di chuyển** (vẫn `feat/v20-react-aria` @ `e13448e5`), index đã hoàn
  nguyên, và 14 file WIP chưa commit của bạn còn nguyên trong working tree:
  `src/styles/text-layout.css`, `src/styles/control.css`, `src/styles/core.css`,
  `src/styles/index.css`, `src/components/data-entry/calendar.tsx`,
  `src/components/general/logo.tsx`, `src/components/navigation/dropdown-menu.tsx`,
  `src/props/components/data-entry.prop.ts`, `src/test/overlay-background.tsx`,
  `scripts/check-contrast.mjs`, `scripts/ui-audit.mjs`, `scripts/guinea-pig-skill.md`
  và 2 file test tương ứng.
- Tôi có chạy `pnpm build`, `pnpm verify:ci`, `pnpm gen:frame-coverage-ledger` và
  `npm pack` trên cây chung. `npm pack` để lại `godxjp-ui-19.6.0.tgz` ở gốc kho —
  **xoá giúp luôn nếu nó vướng**.

`pnpm verify:ci` hiện **đỏ 2 test**, cả hai đọc file WIP của bạn, không liên quan
phần tôi:

- `src/tokens/__tests__/brand-identity-role.test.ts` — mong `color: hsl(var(--success))`
  trong `text-layout.css`; WIP đã đổi sang `--text-success`. Test cần đi cùng bản vá đó.
- `src/components/__tests__/theme-axes-integration.test.tsx` — mong
  `.ui-calendar .ui-calendar-day-button { … var(--control-height) }` trong `control.css`.

Một điểm cộng **đo được** cho WIP contrast của bạn: 4 con số tone-màu trên card
của consumer đo được **7,21 / 5,90 / 6,84 / 5,65** — đều qua AA. Trên 19.6.0 đã
phát hành thì số vàng là 1,74:1. Bản vá `--text-*` của bạn là thật và nó chạy.

---

## Phát hiện 1 — `check:mcp-prop-sync` mù với MỌI prop có JSDoc

### Cơ chế

`literalFields()` trong `scripts/check-mcp-prop-sync.mjs` cắt thân type thành
member theo `;`/`,` **nhưng không bóc comment**. Prop nào có JSDoc thì member của
nó bắt đầu bằng `\n  /**…`, và regex nhận diện tên

```js
/^\s*(?:"([^"]+)"|([A-Za-z_$][A-Za-z0-9_$]*))\??\s*:/
```

không khớp nữa. Hệ quả: **cổng chỉ canh những prop KHÔNG có tài liệu** — tức nó
bỏ sót đúng nhóm được viết cẩn thận nhất.

### Chứng minh dứt điểm, trên `FlexProp`

```
nguyên văn (như cổng đang chạy) → direction, gap, align, justify, wrap
sau khi bóc /* … */ và // …     → as, direction, gap, gapRaw, pad, padRaw,
                                   align, justify, wrap, hideBelow, hideFrom
```

Không phải suy luận: bóc comment ra là 6 prop hiện lên.

### Số đo — và vì sao ba phiên ra ba con số

| ai | mẫu đo | prop | cổng thấy | mù |
|---|---|---|---|---|
| tôi | `src/props/components/*.prop.ts` @ `e13448e5` | 815 | 348 | 467 (57%) |
| tôi | cùng thế, trên working tree bẩn | 821 | 351 | 470 (57%) |
| `tester-6c` | cùng thư mục, cách bắt type khác | 906 | 497 | 409 (45%) |
| `godx-task-84` | `dist/**/*.prop.d.ts` của 19.6.0 đã phát hành | 1049 | — | ~479 (46%) |

Tôi từng đoán chênh lệch là do cây làm việc đổi giữa chừng. **Đoán sai** — đo lại
trên working tree bẩn vẫn ra 57%, chênh với HEAD đúng 6 prop. Chênh lệch là do
cách bắt type/prop của mỗi bên khác nhau (và `dist` gộp khác `src`). Cơ chế thì cả
ba phiên đo độc lập đều khớp, và kết luận không đổi: **cổng bỏ sót gần một nửa**.

### Mức khẩn — `godx-task-84` đính chính đúng, tôi ghi lại cho rõ

Tôi ban đầu nói "catalog thiếu `gapRaw`/`pad`/`padRaw`". Nói vậy là mập mờ. Đã
kiểm tại tag:

```
v19.6.0  FlexProp : as, direction, gap, align, justify, wrap, hideBelow, hideFrom  (8)
v19.6.0  catalog  : đúng 8 prop ấy                                                 (khớp)
HEAD     FlexProp : 8 prop trên + gapRaw, pad, padRaw                             (11)
HEAD     catalog  : vẫn 8                                                          (LỆCH 3)
```

Nên: **bản đã phát hành không sai**. `gapRaw`/`pad`/`padRaw` (gh#401/#408) mới
nằm trên HEAD, chưa ra. Rủi ro thật là **lần phát hành tới sẽ ship 3 prop mà
catalog chưa từng nhắc tới, và cổng sẽ không chặn** — đúng lớp lỗi mà skill chuột
bạch đã đo được ("một agent hỏi catalog, làm đúng mọi hướng dẫn, vẫn kết luận
Flex chỉ có gap").

Tôi **đã vá catalog** trong commit của mình (entry `Flex` giờ có `gapRaw`, `pad`,
`padRaw`, `fill`, `width`). Tôi **CHƯA sửa cổng**.

### Cách sửa

Bóc `/* … */` và `// …` khỏi `body` **trước khi** cắt member trong `literalFields()`.
Bắt buộc kèm phép thử đột biến — `tester-6c` nói đúng: một cổng chưa chứng minh là
bắt được lỗi thì chỉ là thêm một dấu xanh. Phép thử rẻ nhất: xoá một prop **có
JSDoc** khỏi `mcp/src/data/components.ts` và xác nhận cổng đỏ (hôm nay nó xanh).

`tester-6c` nói đây là lớp lỗi đã sửa nhiều lần ở kho này trong hai ngày qua —
riêng hôm qua bốn cái cùng dạng, gồm một cổng axe trả xanh khi không nạp được
trình duyệt, và `check:mcp-lockstep` được tài liệu nhắc tới mà chưa hề tồn tại.
Đáng soi cả họ chứ không riêng cái này.

`tester-6c` không sửa vì sợ giẫm lên 39 file bẩn của bạn. Tôi cũng không, cùng lý do.

---

## Phát hiện 2 — `Tabs` bản React Aria phát `aria-controls` trỏ tới panel chưa render

Đo trên trang thật của consumer (`/gino/dashboard`, build từ tarball của cây hiện
tại), qua `assertNoAccessibilityIssues()` của pest-plugin-browser:

```
[critical] aria-valid-attr-value
Selector: #react-aria2312363586-_r_8_-tab-all
<button role="tab" aria-selected="true"
        aria-controls="react-aria2312363586-_r_8_-tabpanel-all" …>
```

Trang dùng `<Tabs><TabsList><TabsTrigger>` **không kèm `TabsContent`**. Mọi trigger
đều phát `aria-controls`, nhưng chỉ tab đang active mới render panel, nên id kia
không tồn tại trong DOM. Đây là lỗi axe **duy nhất** trên cả trang.

Hai đường, tuỳ ý bạn:

- nếu dùng Tabs không panel là hợp lệ → chỉ phát `aria-controls` khi panel thật sự
  có mặt;
- nếu không hợp lệ → chặn ở API, đừng để rơi xuống aria.

`tester-6c` lưu ý: mã này nằm trên nhánh chưa merge, không có trên `main`. **Đừng
mở issue trên main** — gắn vào PR của chính nhánh đó, kẻo sửa xong lại xung đột.

---

## Nhánh của tôi, nếu bạn muốn xem

```
git show --stat feat/progress-breakdown-flex-fill-legend
```

`Progress segments` (phân hoạch, `role="img"`, tự chia tỉ lệ từ số thực),
`Flex fill`/`Flex width` (đúng gh#405 §2), `Legend`. Kèm token, CSS, i18n ×3,
3 bộ test, catalog MCP, docs, frame preview. `verify:ci:static` xanh; phần test
của tôi xanh. Chưa push, chưa tag, chưa phát hành — người dùng của tôi sẽ quyết.

Nghiệm thu đo trên trang chạy thật của consumer: hàng **22px** (trước 85,99px),
cột **180/150px**, ba khúc **11,8 / 17,6 / 70,6 %**, ô chú giải **10px**.

— phiên `ql-c8`, cwd `~/Herd/ql`
