# Changelog

All notable changes to `@godxjp/ui` are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Chữ lỗi của `FormField` đọc tầng TÔ thay vì tầng CHỮ — 2,95:1 trên nền tối (#610).** Dòng
  `role="alert"` dưới một ô nhập là **câu duy nhất** nói cho người dùng biết vì sao ô bị từ chối, và
  trên màn đăng nhập là thứ duy nhất một người bị khoá ngoài đọc được. Nó được sơn bằng
  `text-destructive`, tức token **TÔ** `--destructive` — vốn được chỉnh cho một nhãn trắng nằm TRÊN
  nó, nên trên sống tối nó cố tình sáng. Đo trong Chromium trên
  `/isolate/layout-auth-recovery-examples-mfa-challenge?theme=dark`: **#be373e trên #21201c =
  2,95:1**, dưới sàn AA 4,5:1. Nay đọc tầng **CHỮ** (`text-error-strong` → `--text-error`):
  **5,52:1** tối và **7,21:1** sáng. Cùng một lượt sửa cho chín chỗ sơn giống hệt trong `Upload`,
  `BranchScopePicker` và dòng lỗi step-up của `Dialog`.

  `Alert`, `Text` và `Heading` đã đi qua tầng chữ từ trước, nên **cùng một `tone` đọc được trong
  một `Alert` và gần như vô hình ở dòng ngay bên dưới** — trong chính cái ô gây ra nó.

  **Vì sao cổng không bắt được:** danh sách `ROUTES` của `check:contrast` **chưa từng tải một route
  `ui-auth-shell` nào**, ở cả hai chủ đề. Nay thêm `/isolate/layout-auth-shell` và
  `/isolate/layout-auth-recovery-examples-mfa-challenge`, mỗi cái hai chủ đề, cộng một phép kiểm
  tất định `src/tokens/__tests__/error-text-tier.test.ts` (token + quét nguồn).

## [23.4.3] - 2026-09-12

Patch. Sáu bản sửa do consumer báo, một lối vào CSS mới, và hai chỗ lời khuyên của gói nói sai.

### Fixed

- **Vùng bấm nút bước `NumberInput` chỉ 24×13 trên con trỏ mịn (#506).** Dưới sàn 24×24 của WCAG 2.2
  SC 2.5.8, và **ngoại lệ Spacing cũng không cứu được**: nó đòi hai đường tròn đường kính 24px đặt
  tâm ở mỗi hộp KHÔNG giao nhau, mà tâm cách 20px thì giao. Nay **vẽ 24×13, bấm 24×26**, hai hộp
  chạm nhau chứ không ăn vào nhau — `::after` neo vào mép ngoài của từng nút.

  Đáng nói là **cổng cũ chính là thứ đóng băng lỗi này**: nó khẳng định "hình học desktop KHÔNG
  đổi", nên mọi bản sửa vùng bấm đều làm nó đỏ. Nay tách làm hai: phần **vẽ** không được dịch,
  phần **bấm** phải tới 24×24 — cộng thêm kiểm chồng lấn và kiểm ăn sang nút bên cạnh.

- **Nhánh `range` của `DatePicker` bỏ qua đúng bản sửa ấy (#609)** — `DateRangePicker` và
  `MonthPicker` vẫn dùng `className` khác nên không nhận `::after`. Nay **vẽ 20×20, bấm 24×24**.
  Phần vẽ không đổi: `--month-picker-icon-size` và `--control-inline-affix-icon-size` cùng giải về
  `--icon-size-md` = 1rem.

- **Tệp luật do gói sở hữu kẹt cứng ở dấu cũ (#513).** Bên ghi khoá theo **digest**, còn `ui-audit`
  khoá theo **version**, nên một tệp luật không đổi nội dung sẽ giữ dấu cũ vĩnh viễn — và thông báo
  lỗi bảo người dùng chạy lại đúng cái lệnh vừa không làm gì. Nay đóng dấu lại phần version khi
  digest đã khớp, giữ nguyên thiết kế digest-là-khoá-nội-dung.

- **`DraggablePanel`: nhãn không dịch được, bậc `width` chặn ở 28rem, và `bounds="viewport"` không
  kẹp lại khi cửa sổ đổi kích thước (#606 #607 #608).** `--draggable-panel-width-xl` trỏ vào
  `--centered-shell-width-md` = **46rem**, đúng bề rộng consumer đã tự nối tay.

### Added

- **Lối vào CSS thứ ba: `@godxjp/ui/styles/core-with-fallbacks` (#535)** — mang 6 khối `@font-face`
  chỉ có `local()` (đo: **0** `url(`, tức 0 byte mạng) mà **không** mang 729 lát woff2 (~11,7 MB).

  Vì sao là entry riêng chứ không nhét vào `core`: `core.css` đang hứa `@font-face` = **0**, và con
  số ấy là thứ consumer grep để tin nó. Thêm khối vào đó phá một lời hứa **đo được**, dù không tốn
  byte nào. `check:packed-public-contract` nay đo ngân sách font của cả ba lối vào trong tarball.

### Fixed — lời khuyên gói GHI VÀO consumer

`scripts/consumer-rule.md` và `scripts/guinea-pig-skill.md` được chép vào **mọi** consumer, nên sai
ở đó là sai khắp nơi. Câu "`CardBar` trong manifest có đúng một prop (`extra`)" đo lại là **6 prop**,
và luật vị trí nay nằm **trong chính catalog** — tức bằng chứng duy nhất cho cả tiêu đề "catalog chở
PROP, không chở LUẬT BỐ CỤC" đã hết đúng từ lâu mà không cổng nào thấy: `check:doc-prop-existence`
duyệt `docs/**` và `mcp/src/data/*.ts` nhưng **chưa bao giờ đọc `scripts/*.md`**.

Bổ sung ba chỗ thiếu: `Dialog`/`AlertDialog` nay là một họ với `variant`; luật **antd là chuẩn,
thiếu gì port 100%**; và 9 dòng nữa cho bảng "TRA, đừng dựng" — trong đó `Badge onRemove` chính là
#604, nơi consumer với sang `TagInput` vì không ai bảo họ có sẵn.

### Added

- **Entry thứ ba cho CSS: `@godxjp/ui/styles/core-with-fallbacks` (#535).** Bằng `styles/core` cộng
  đúng **6 khối `@font-face` `local()`-only** (metric-matched fallback của #475) và **không một lát
  woff2 nào** — `src` toàn `local()`, nên chi phí mạng so với `core` là **0 byte**. Dành cho
  consumer đã bỏ bundle font (đo được: **729 lát woff2, ~11,7 MB** trong `@godxjp/ui/styles` ở bản
  @fontsource hiện tại) nhưng tự cấp Noto Sans JP và vẫn muốn cửa sổ swap không đội hình.

  **Vì sao là entry thứ ba chứ không nhét vào `core`:** `core.css` đang hứa `@font-face` = **0**, và
  con số ấy là thứ consumer **grep** để tin nó (`grep -c '@font-face' dist/styles/core.css`). Thêm 6
  khối vào đó phá một lời hứa **đo được**, dù không tải byte nào. Sáu dòng cho một entry riêng rẻ
  hơn một lời hứa mất nghĩa.

  Entry mới **không** đụng `--font-sans-base` — `core` không chở mặt chữ thương hiệu nào, nên đặt
  tên một mặt chữ ở đó là nói dối. Consumer tự xếp `"Noto Sans JP Fallback"` ngay sau mặt chữ của
  mình.

  Sáu khối ấy nay ở `src/styles/font-fallbacks.css`, một nguồn duy nhất mà cả `fonts.css` lẫn
  `core-with-fallbacks.css` `@import` — trước đó chúng nằm thẳng trong `fonts.css`, và một bản chép
  thứ hai sẽ trôi khỏi các con số metric mà chỉ `check:font-fallback-metrics` (gate trình duyệt)
  mới bắt được, hàng tháng sau.

  `check:packed-public-contract` nay **đo** ngân sách font của cả ba entry trong chính tarball
  (`./styles` → 6 `@font-face` + có `@fontsource`; `./styles/core` → 0; `./styles/core-with-fallbacks`
  → 6, `local()`-only, không `@fontsource`), và consumer `npm install` thật giải được subpath mới
  qua `exports`.

  **Chưa giải:** 729 lát woff2 vẫn nặng nguyên với ai muốn dùng font kèm gói. #535 để mở.

## [23.4.2] - 2026-09-12

Patch. Sáu bản sửa do consumer báo, và bản vá dứt điểm cho thứ đã làm hai lần phát hành trước kẹt.

### Fixed

- **Index MCP lệch với gói (#605)** — `SkeletonRows` chỉ tồn tại như một `subPart` nên không ai tra
  được, và `search_components "filter"` không trả `Segmented`. Đo lại thì bốn tên còn lại **có**
  trong catalog đang phát hành; con số "93 primitive" mà người báo thấy là **#543 đang xảy ra ngoài
  đời** — agent của họ chạy một bản catalog khác với gói đã cài.
- **Badge trong Segmented tàng hình (#602)** — nền badge trùng **đúng** nền track, tỉ số **1,00:1**,
  nên số đếm biến mất ở mọi mục chưa chọn.
- **Không có primitive cho dải chip "điều kiện đang bật" (#604)** — `Badge` thiếu `onRemove`,
  `TagInput` thì sai ngữ nghĩa vì nó là một ô nhập. Port theo `Tag` của antd (`closable`/`onClose`).
- **DataTable rụng cột chỉ có một nấc (#603).**
- **Catalog MCP không biết version UI của consumer (#543)** — launcher nay truyền version thật vào;
  khi không có catalog tương thích thì tool trả **diagnostic** thay vì snippet của version khác.
- **#546** — consumer fixture cài từ tarball, không symlink `node_modules` của kho.

### Fixed — hạ tầng phát hành

- **Nhóm concurrency của các làn push nay khoá theo COMMIT, không theo ref.** `cancel-in-progress:
false` ở `23.4.1` là bản vá đầu và **chưa đủ**: GitHub vẫn tuần tự hoá một _group_, và một lần
  chạy đang **xếp hàng** vẫn bị huỷ khi có lần chạy mới vào cùng group. Nên trên một nhánh nhận
  merge dồn dập, **chỉ SHA cuối được phán xử**. Đo sau bản vá đầu: `47015e55` CANCELLED,
  `a22696ef` FAILURE, `52fb1cda` success — và cái FAILURE ở giữa chỉ tới được vì lần chạy trước nó
  không bao giờ chạy.

  `npm-publish.yml` fail-closed trên đúng SHA được tag, nên một lần chạy bị huỷ làm bản phát hành
  **không với tới được trong khi bảng điều khiển toàn xanh** — `23.4.0` kẹt hàng giờ vì đúng điều
  này. Khoá group theo `github.sha` thì mỗi commit có phán quyết riêng và không bao giờ bị kẻ đến
  sau huỷ. `pr-lane.yml` giữ nguyên huỷ, khoá theo số PR, vì ở đó huỷ là đúng.

## [23.4.1] - 2026-09-12

Patch. Hai bản sửa công cụ, và một câu trả lời có số đo cho nửa còn lại của #557.

### Fixed

- **`component-api-manifest.json` công bố prop chỉ vì tên nó xuất hiện trong CHÚ THÍCH (#586).**
  Máy sinh quyết định có công bố một prop kế thừa hay không bằng regex chạy trên **văn bản thô** của
  module. Tái hiện: thêm đúng một dòng chú thích vào `typography.tsx` nói component **KHÔNG** nhận
  `defaultValue`, `Text` mọc từ 33 lên 34 prop — chú thích phủ nhận prop, máy sinh công bố nó.

  Điều đó không dừng ở một tệp JSON: **tám script đọc manifest này**, và nó là thứ `get_component`
  kể cho agent. Một prop không tồn tại, được kể cho agent, sẽ được viết vào consumer rồi trả
  `undefined` lúc chạy. Không cổng nào bắt được — với prop ma nằm trong manifest thì
  `mcp-prop-sync`, `component-api-manifest`, `doc-prop-existence` đều **xanh**.

  Nay phép dò là **cấu trúc**: prop được tính khi implementation destructure nó, đọc nó khỏi binding
  props, hoặc **chuyển tiếp** nó qua `{...rest}` tới một đích được **nêu tên**. Kết quả: **137 prop
  ma bị gỡ, 0 prop thật bị mất.**

  Một bản thử trước đó (`bdd16035`) đã bị revert vì gỡ 138 prop mà thiếu phần phân loại, và kéo
  theo `PasswordInput.value` — prop có thật, vì `PasswordInput` viết `<Input {...props} />` nên
  `value` tới được một `<input>` thật.

- **`ui-audit` báo `hardcoded-currency` với mọi `${…}` trong template string (#601).** Một URL không
  phải là giá tiền. `¥{amount}` và `${price}円` vẫn báo đúng.

- **CI của làn push huỷ chính lần chạy mà bản phát hành cần.** `npm-publish.yml` fail-closed: nó đòi
  mọi check run phải `success` trên **đúng SHA** mà tag trỏ tới. Cả bốn làn push đều đặt
  `cancel-in-progress: true`, nên mỗi commit mới trên `main` huỷ lần chạy trước. Đo trên ba commit
  liên tiếp: `Docs lane`, `CI · release contract`, `CI · browser` xanh và `CI · code` **CANCELLED**
  ở cả ba. `23.4.0` không tag được, và **không có gì đỏ** — bản phát hành chỉ đơn giản là không với
  tới được. `pr-lane.yml` giữ nguyên cancel, vì ở đó huỷ là đúng.

### Đã đo và CỐ Ý không sửa

- **Nửa `Select` của #557.** Hồi quy tuyến tính trên số lựa chọn: **6,71µs mỗi `<option>` cộng
  196,4µs cố định**. Tức **82% chi phí mỗi instance không phụ thuộc số lựa chọn**, và ở 5 option thì
  `HiddenSelect` chỉ chiếm **18%**. Quy ra lưới 8.262 hàng của người báo: bỏ hẳn nó tiết kiệm
  **0,33 giây trên 24 giây — 1,4%**. Phần cố định là bộ máy `Select` của react-aria, không phải thứ
  gói này dựng.

  Một bản vá đi hướng đó đã lọt vào `main` và bị revert: nó sửa react-aria **bên trong
  `node_modules`** bằng cách khớp hash export đã minify, và tệp vá của nó không nằm trong `files[]`
  nên **mọi `npm install` sẽ `ERR_MODULE_NOT_FOUND`**. Nó cũng không kèm phép đo nào.

## [23.4.0] - 2026-09-12

Bản này là một câu trả lời cho một câu hỏi: **Ant Design là chuẩn, thiếu gì port 100%.** Luật ấy đã
nằm trong `docs/DESIGN-AUTHORITY.md` từ lâu — _"where antd names a capability, this library takes
antd's name and antd's semantics"_ — nhưng nó được đọc như lời khuyên. Chủ repo phát biểu lại nó
thành chuẩn (#569), và mọi thứ dưới đây là hệ quả.

### Added

- **`FloatButton`, `FloatButton.Group`, `FloatButton.BackTop`** (#558) — port từ chính tệp của
  antd 6.6.3 chứ không từ trí nhớ, gồm cả `content`/`description` với cách antd giải khi cả hai
  cùng truyền, quy tắc `individual` của Group, và `easeInOutCubic` 450ms của BackTop.
- **`Typography` trọn vẹn** (#580) — `Typography`, `Title`, `Paragraph`, `Link`, và
  `Typography.Text` **chính là** `Text` đang có chứ không phải một bản nghèo hơn đặt cạnh. `Text`
  đi từ 19 lên **33 prop**: `copyable` và `editable` đầy đủ, `ellipsis` với `expandable`/`symbol`/
  `onExpand`, cùng `mark` · `code` · `keyboard` · `italic` · `delete` · `underline` · `disabled`.
  Không prop cũ nào đổi tên, đổi mặc định hay đổi `data-*`.
- **Ant Design X đủ năm component** (#559): `Conversations` (#571), `Welcome` (#577), `Actions`
  (#584), `ThoughtChain` (#592), `Attachments` (#596). `Actions` vào nhóm `general`, `ThoughtChain`
  vào `data-display` — quyết định bằng cách đọc nhóm `feedback` hiện chứa gì (Alert, AlertDialog,
  Toast, Skeleton): nó nghĩa là _hệ thống nói với người dùng_, không phải _người dùng đưa phản hồi_.
- **`Card` nhận `tabList`** (#570) — `tabList`/`activeTabKey`/`defaultActiveTabKey`/`onTabChange`/
  `tabProps` giữ nguyên tên antd; `tabBarExtraContent` thành `extra` theo tiền lệ `TabsProp.extra`
  đã có, vì `left`/`right` không mirror được dưới RTL. Dải tab nằm **trong đầu thẻ**, nên thẻ và
  tab đọc thành một vật thể, và `CardContent flush` vẫn xuyên tới một `DataTable` trong tab.
- **`DraggablePanel`** (#560) — antd không có component này; thứ antd có là demo _Draggable Modal_
  dựng trên `react-draggable`, nên API lấy theo tên của thư viện ấy. **Không thêm dependency**:
  phần kéo dùng lại mẫu con trỏ mức window đã có sẵn trong `slider.tsx`.

### Changed

- **`Dialog` và `AlertDialog` nay là MỘT họ, vai trò là prop** (#567). Hai họ ấy xuất 26 thứ với
  **12 cặp trùng tên và 0 phần riêng của `AlertDialog`**, mà khác biệt thật chỉ là
  `role="alertdialog"` cộng `isDismissable={false}` — hai prop mà shell đã nhận sẵn. antd chỉ có
  một `Modal`. Nay `variant="destructive"` quyết định đồng thời vai trò ARIA, có đóng được bằng
  click ra ngoài hay không, và nhấn mạnh của nút chính.

  **12 export `AlertDialog*` KHÔNG bị xoá.** Xoá là breaking change cần bản major, và bộ test
  trình duyệt của consumer đang bám `getByRole('alertdialog')`. Chúng chạy đúng như cũ; `variant`
  là lối chuẩn, chúng là lối cũ, và quy tắc chọn nằm trong `docs/DESIGN-AUTHORITY.md`.

  Một lượt đếm trên **cả 272 export công khai** xác nhận đây là cặp trôi DUY NHẤT:
  `Skeleton.Avatar/Button/Input/Image/Node` trông y hệt hình dạng lỗi nhưng đó là tên antd đặt, tức
  đang tuân luật chứ không vi phạm.

### Fixed

- **`Conversations` thiếu `timestamp`** (#576) — port lấy 5 trong 6 trường của Ant X. Nó nhận
  **number**, không phải `ReactNode` như các trường khác, và vẽ qua `formatDate`: cùng một mốc thời
  gian phải đọc ra `2026/03/15` ở tenant Nhật và `15/03/2026` ở tenant Việt, mà một component tự
  định dạng ngày thì không làm được điều đó.
- Ba lần `main` đỏ vì tệp sinh ra để cũ (#587, #589, #597): catalog token, `CardTabItemProp` chưa
  export, và bảy token icon mới chưa đóng băng trong bảng.

## [23.3.0] - 2026-09-12

Minor, và lý do là **một mặc định thị giác đổi**: dấu hiệu focus bàn phím nay BẬT sẵn. Phần còn lại
là năm báo cáo của consumer, một lỗi hiệu năng đo được gấp 98 lần, và ba lớp cổng đã mù.

### Changed — có ảnh hưởng THỊ GIÁC

- **`--focus-outline` nay mặc định `1`: control vẽ dấu hiệu focus bàn phím khi Tab.** Trước đây
  mặc định `0`. Đảo lại vì một con số, không phải vì sở thích: đếm `data-focus-outline` trên bốn
  consumer thật thì chỉ `ql` đặt nó (3 tệp); `godx-task`, `godx-chat` và app platform **không đặt ở
  đâu cả** — tức ba trên bốn sản phẩm đang chạy không vẽ dấu hiệu focus nào, và đó không phải một
  lựa chọn, vì công tắc chỉ phát hiện được bằng cách đọc `foundation.css`.

  Thứ được bật cũng **không còn là thứ đã bị tắt**: trạng thái ON giờ là dấu hiệu FIELD một nét tóc
  1px (đo 5,05:1 sáng / 7,07:1 tối), không phải viền 3px từng bị phàn nàn.

  **Đường thoát:** `<html data-focus-outline="off">`. `"on"` vẫn giữ và vẫn nghĩa là bật, nên mọi
  consumer đã đặt nó dưới mặc định cũ không phải đổi gì.

### Added

- **`SkeletonForm columns fields`** — khung xương của một `Form columns={N}`, vẽ **cặp nhãn + ô**
  qua **chính `ResponsiveGrid`** mà `Form` dùng. Một giá trị `columns`, một thang bậc (#552).
- **`DatePicker triggerLabel`** — tên cho nút mở lịch. Mặc định giữ nguyên. Ba ô ngày trên một màn
  trước đây cho trình đọc màn hình ba nút trùng tên (WCAG 2.2 SC 2.4.6) (#551).

### Fixed

- **`DatePicker` đang đóng tốn gấp 98 lần một `<input type="date">` (#557).** Đo qua
  `react-dom/server`, 2.000 hàng mỗi lượt: **412,6µs** so với **4,2µs**. Mỗi instance ĐANG ĐÓNG dựng
  **12 `Intl.DateTimeFormat`, 1 `Intl.NumberFormat` và 183 `Date`**.

  Người báo đã xoá `Popover`/`PopoverContent` và thấy không đổi — vì DOM của popover chưa bao giờ là
  chi phí. `const panel = (<PopoverContent>…</PopoverContent>)` **DỰNG** cả cây, tức chạy hết mọi
  biểu thức con, rồi react-aria từ chối mount. Xoá chỗ mount thì phần dựng vẫn còn.

  Hai bản sửa: `src/lib/intl-cache.ts` nhớ formatter theo locale + options — áp ở **cả 17 chỗ dựng
  trên 11 tệp**, nên `Button`, `NumberInput`, `Toggle`, `ErrorSurface`, hai module chart,
  `translate()` và các helper tiền tệ đều hết dựng lại; và `DatePicker` chỉ dựng nhánh panel nó thật
  sự hiện. **Cộng lại: 412,6 → 121,1µs (−71%)**, Intl mỗi instance 13 → 0, `new Date()` 183 → 1.

  CHƯA SỬA: `Select` vẫn 280µs/hàng. Profile không có điểm nóng — nó là số lượng element của
  react-aria. #557 để mở cho phần đó.

- **`Swatch` trả lời `not found` một bản sau khi nó ra đời (#553)** — và không phải vì thiếu mục
  catalog. Một lần rebase hợp nhất đối tượng `Swatch` VÀO đối tượng `FeatureList` ngay sau nó, `name:`
  sau thắng, hai mục thành một. **Bốn lớp cùng xanh**: `mcp/` không được tệp nào typecheck (tsconfig
  gốc chỉ `["src"]`, còn TypeScript báo đúng lỗi này là `TS1117`); `check:mcp-catalog-coverage` dò
  chuỗi con; `check:mcp-catalog-completeness` viết lại logic tra cứu thay vì gọi nó; và 317 khẳng
  định của `catalog-integrity` soi những mục CÓ TỒN TẠI. Nay có `typecheck:mcp`, và một test gọi
  `get_component` thật cho cả 270 tên công khai.

- **`FormField colSpan` không có trần từ 40rem trở lên (#550).** `columns={4}` nở base 1 / sm 2 /
  md 3 / lg 4, nên ở 768px một ô `colSpan={4}` trong lưới 3 cột mọc thêm một track ngầm và mọi
  `minmax(0, 1fr)` tụt về **0px** — nhãn vỡ thành cột chữ dựng đứng, và không gì ném lỗi. #321 đã
  sửa đúng lỗi này ở bậc một cột rồi dừng lại; nay `span min(…)` chạy ở cả sm/md/lg.

- **`CardContent flush` không xuyên qua `tabs-panel` (#554).** Mọi mắt trong chuỗi tổ tiên ở
  padding-inline 0, đúng một mắt ở giữa giữ 16px — 32px bề rộng thẻ.

## [23.2.1] - 2026-09-12

Hai lỗi do một lượt review độc lập chỉ ra (#541, #542). Cả hai đều tái hiện được **trên bản đã phát
hành**, nên bản này tồn tại để đưa bản sửa ra registry chứ không phải để đợi lần phát hành tính
năng kế tiếp.

### Fixed

- **`postinstall` có thể xoá cấu hình của consumer (#541).** `readJson` trả `null` cho cả "không có
  tệp" lẫn "tệp không parse được", nên `readJson(path) ?? {}` đọc một `.mcp.json` hỏng thành một
  tệp rỗng rồi ghi đè lên — mọi MCP server khác của consumer biến mất, không ném lỗi, không cảnh
  báo, không bản lưu. `.claude/settings.json` chạy đúng dòng ấy, tức **hook của chính consumer**
  cũng nằm trong vùng rủi ro. Và `refreshBlock` đặt `tail = ""` khi thiếu marker đóng, nuốt sạch
  phần consumer viết dưới khối do gói quản lý.

  Một lỗi thứ ba không ai nêu: `writeFileSync` **không nguyên tử**. Một lần ngắt giữa chừng để lại
  tệp cụt, mà lần chạy sau đọc ra "hỏng" rồi ghi đè — **hai nửa tự nuôi nhau**. Mọi lần ghi nay đi
  qua tệp tạm rồi `rename`.

  Bảo đảm nay là cấu trúc chứ không phải một câu hứa trong chú thích: **một tệp đang tồn tại mà
  không đọc / không parse / không nhận dạng được thì KHÔNG BAO GIỜ bị ghi vào.** Gói để lại một tệp
  `.godxjp-ui-suggested` bên cạnh và nói ra, thay vì đoán một cấu hình nó không đọc nổi. Ba lý do
  từ chối được phân biệt — `not valid JSON`, `JSON, but not an object`, `unreadable`.

- **`ui-audit --changed` khai một tệp nó chưa hề mở (#542).** `changedFiles()` chọn theo
  `/\.(tsx|jsx)$/` trong khi `walk()` chỉ nhận `.tsx`/`.ts`. Một `.jsx` vừa đổi được chọn, **được
  đếm vào dòng tổng kết `across …` như đã quét**, rồi bị walker bỏ; nếu nó là thay đổi duy nhất thì
  lượt chạy in `no .tsx/.jsx changed on this branch` và thoát **0** — gọi đúng tên phần mở rộng vừa
  đổi. Đo với nội dung giống hệt nhau ở hai tệp: **2 lỗi trước, 4 lỗi sau**.

  Nay một hằng `SCANNABLE` duy nhất được cả bộ chọn lẫn walker đọc, nên chúng không lệch nhau lại
  được; dòng tổng kết dựng từ những tệp **thật sự đã mở**; và `isJsx` tính cả `.jsx` — quét tệp mà
  bỏ mọi luật JSX chỉ là cùng lỗi ấy ở dạng im hơn.

  Cùng tệp, cùng họ lỗi: một lệnh git **thất bại** trả về đúng cùng chuỗi rỗng với một lệnh thành
  công mà không tìm thấy gì, nên một clone không có `origin/main` cho ra một lượt chạy xanh sạch.
  Nay thoát **2** và nói phải làm gì.

## [23.2.0] - 2026-09-12

Bản này tồn tại vì một lý do đo được: **bốn issue đã sửa xong trên `main` vẫn bị mở lại**, và người
báo đúng — họ đo trên `23.1.0` của npm, nơi chưa bản sửa nào có mặt. Một bản vá chưa phát hành thì
với consumer là một bản vá không tồn tại. Nên trước khi kể tính năng, đây là bốn thứ mà **23.2.0 là
bản ĐẦU TIÊN chở chúng ra registry**: vùng bấm nút mở lịch `DatePicker` 20×20 → 24×24 (#507),
khoảng hở giữa hai hàng `Segmented` khi xuống dòng (#503), sáu bản sửa consumer mà 23.0.0 bỏ lại
(#506), và tệp luật do gói sở hữu hết ruỗng im lặng khi consumer đặt `ignore-scripts=true` (#513).

### Added

- **`Card` bắt kịp Ant Design 6:** `hoverable`, `borderless`, và `actions` (#522).
- **`Tabs` bắt kịp Ant Design 6:** `animated`, `indicator`, `moreIcon`, `onTabScroll` (#523).
- **`Skeleton`** — cổng từ Ant Design 6 lên đúng họ component đã có ở đây, thay vì dựng một nhánh
  riêng (#525).
- **`Swatch`** cho ô màu do người dùng chọn, cùng hai cửa thoát `hideBelowRaw` / `hideFromRaw` cho
  điểm gãy không nằm trên thang bậc tên (#527, #528).
- **`FeatureList`** (`included` / `excluded` / `limited`) và **`Thumbnail`** — hai hình dạng mà
  consumer không có nước đi hợp lệ nào: bản hand-roll trong issue cho **3 lỗi** `ui-audit`
  (`no-utility-layout`, hai `no-utility-spacing`). Glyph của `FeatureList` canh bằng ô `1lh` chứ
  không phải `align-items: baseline`: đo trên Chromium, sai số tâm ink là **−1,20px** với `1lh`, so
  với −3,60px cho `baseline` và −3,10px cho `align start` + `mt-0.5` — tức `baseline`, câu hỏi để
  ngỏ của người báo, là phương án TỆ HƠN thứ nó định thay (#529, #530).
- **`Sidebar`**: `footer` nhận `(collapsed) => ReactNode`, và `trailingIcon` cho glyph cuối hàng
  (#532).

### Fixed

- **Cả tầng token chuyển động được khai ở nơi gần như không gì đọc được nó** (#524). `--duration-*`,
  `--ease-*`, `--reveal-*`, `--activity-*` nằm trong `.ui-scale-fixed`; ở `:root` chúng đo ra chuỗi
  rỗng, mà một custom property rỗng làm khai báo dùng nó thành không hợp lệ và bị bỏ. Đo được: chấm
  `Activity` chạy `0s` trước, `1.4s` sau.
- **`Tabs` có prop `size` mà nó không làm gì**, và **`CardFooter` không xuống nổi đáy thẻ** (#531).
- `check:mcp-catalog-coverage` nay soi đúng bề mặt export thật, thay vì một danh sách viết tay
  (#526).
- Hai cổng mà các PR đã merge mỗi cái để dở một nửa, khiến `main` đỏ (#533).

### Docs

- `scripts/consumer-rule.md` — tệp mà gói GHI VÀO mọi consumer — chưa từng nhắc tới
  `@godxjp/ui/styles/core`, lối vào không kèm `@font-face`. Nó có thật, và nay có trong tệp (#535).
- Quy trình: CI là việc của GitHub Actions. Lệnh chạy toàn bộ bộ test tại máy đã bị gỡ khỏi skill
  chuột bạch và tài liệu quy trình.

### Added — `Sidebar` cân lại hai khe nằm trong dải thu gọn

- **`Sidebar footer` nhận `(collapsed) => ReactNode`, đúng hình của `brand`** (gh#516). Hai khe ở
  hai đầu của dải mà chỉ một khe biết mình đang thu gọn — và sự bất đối xứng ấy không có lý do nào
  ghi ở đâu cả, `brand` chỉ được làm trước. Với `footer` thì consumer **không có nước đi nào đúng**:
  tự đọc `collapsed` của mình thì `AppShell` đưa cùng một `Sidebar` sang drawer (drawer luôn mở
  hàng ra) nên chân trang thành một glyph trơ giữa drawer toàn chiều rộng; dựng `Sidebar` thứ hai
  cho `AppShell.mobileNav` thì chính cái override ấy tắt `railInDrawer`; không làm gì thì nội dung
  của dải mở chảy tràn trong dải 64px.

  Đo trên frame docs, cùng một node chân trang: **255×66 khi mở → 63×111 khi thu gọn**, tên người
  dùng gãy làm ba dòng trong hộp rộng 47px. Sau bản sửa, dạng hàm trả về một `Avatar`: **63×45**,
  `scrollWidth − clientWidth = 0`. Dạng `ReactNode` cũ chạy y nguyên; hàm trả `null` thì **không vẽ
  khung chân trang** (không kẻ, không đệm) thay vì để lại một dải trống có đường kẻ.

- **`SidebarItemProp.trailingIcon` — khe glyph ở đuôi hàng, tách khỏi khe đếm số** (gh#519). Mẫu
  "hàng ở chân sidebar mở ra một menu" cần ba phần: biểu tượng + tên + mũi tên `⌃⌄`. Phần thứ ba
  trước nay chỉ có thể nhét vào `badge`, mà `badge` là **viên thuốc đếm số**: `.sb-badge` vẽ bán
  kính `9999px`, nền `hsl(var(--secondary))`, và **không ghim cỡ SVG**.

  Đo lại trên `main` đúng bằng số của người báo lỗi: một `ChevronsUpDown` đặt vào `badge` ra
  **36×24**, `border-radius: 9999px`, nền `rgb(244, 243, 240)`, **SVG 24×24** — cạnh một biểu tượng
  dẫn đầu 16×16 trong cùng hàng 32px. Sau bản sửa, cùng glyph ấy qua `trailingIcon`: **hộp 16×16,
  SVG 16×16**, nền `rgba(0, 0, 0, 0)`, `border-radius: 0px`, hàng vẫn cao 32px.

  Không chọn "thêm một bậc cỡ cho `Badge`", vì cái sai không phải cỡ mà là **BỀ MẶT**: một viên
  thuốc vẽ nền và bo góc, một glyph thì không vẽ gì cả. Nhận **COMPONENT** giống `icon` (không phải
  `ReactNode`) — đó chính là thứ cho phép DS ghim cỡ; một lỗ `ReactNode` là cách `badge` đã để lọt
  SVG 24px. Ẩn ở dải thu gọn trên đúng luật đang ẩn `.sb-badge`, vì consumer đặt hàng chuyển
  workspace vào `footer` — nằm trong dải và **không** được dựng lại thành icon-only.

  Đặt tên `trailingIcon` chứ không phải `affix` như đề nghị trong issue: `trailing` đã là từ của DS
  cho khe đuôi của một hàng (`ListRow.trailing`), còn "affix" đang được dùng để mô tả chính
  `badge` ("Count/status affix") nên sẽ là một từ mang hai nghĩa.

### Added — hai primitive cho hai hình dạng consumer không viết ra được (gh#529, gh#530)

- **`FeatureList`** (gh#529) — một cột các CÂU, mỗi câu một glyph trạng thái dẫn đầu
  (`included` ✓ / `limited` − / `excluded` ✗), nhãn, và một mô tả mờ TỰ XUỐNG DÒNG. Ba component
  gần nhất đều không phải: `ListRow` là hàng THỰC THỂ một dòng (có đường kẻ giữa mọi hàng, có khe
  hành động cuối hàng, và nó cắt chữ chứ không xuống dòng), `Timeline` là rail sự kiện CÓ THỨ TỰ
  với đường nối và trạng thái done/current/pending — đó là thời gian, không phải sự bao gồm, và
  `Descriptions` là lưới thuật ngữ/giá trị, trong khi ở đây trạng thái CHÍNH LÀ giá trị và nó được
  VẼ. Nên trang tự dựng `<ul className="flex flex-col gap-2">`: đo bằng `ui-audit --consumer` trên
  đúng đoạn mã trong issue ra **3 lỗi** (`no-utility-layout`, `no-utility-spacing` ×2).

  **Lỗi thứ ba là cái đáng kể: `mt-0.5`.** 2px nằm DƯỚI `--space-1`, không bậc nào của thang đọc
  ra nó, và nó sai ngay khi cỡ chữ bên cạnh đổi. Ở đây glyph được cho một ô cao đúng MỘT HỘP DÒNG
  (`block-size: 1lh`) rồi canh giữa trong ô ấy, nên nó rơi vào dòng ĐẦU của một nhãn xuống ba dòng,
  ở mọi cỡ chữ và mọi mật độ, mà call site không có một con số nào. Đo trong Chromium (14px,
  `--line-height-body` 1.7, hộp dòng 23,80px, tâm quang học của dải cap ở 12,77px dưới đỉnh dòng),
  sai số có dấu của tâm MỰC của glyph:

  | cách làm                               | sai số      |
  | -------------------------------------- | ----------- |
  | ô cao 1lh, glyph canh giữa (bản này)   | **−1,20px** |
  | `align start` + `mt-0.5` (bản tự dựng) | −3,10px     |
  | `align start`, không nudge             | −5,10px     |
  | `align-items: baseline`                | −3,60px     |

  Nên **`baseline` không phải câu trả lời**, và nó còn tệ hơn chính 2px mà nó định thay: `<svg>` là
  phần tử thay thế, baseline của nó là mép dưới, nên canh baseline ném glyph lên cao gần một icon.
  Phần dư 1,20px cố ý để nguyên: 0,33px trong đó là do path bất đối xứng của Lucide trong viewBox
  24px, sai số theo HỘP chỉ 0,87px (dưới một pixel thiết bị ở 1×), và cách chữa duy nhất là viết
  lại đúng cái literal ngoài thang mà luật này sinh ra để xoá.

  Gói này **đã tự viết cùng số 2px ấy một lần rồi**: `--transfer-row-check-space-block-start:
0.125rem` mang y hệt lời chú "sit level with the first line's cap height rather than its box".
  Một con số ma đã vào design system hai lần — đó là bằng chứng nó đáng được quyết một lần.

  Trạng thái mang màu tầng MARK (sàn 3:1, `foundation.css`) chứ không phải tầng FILL:
  `included` → `--mark-success`, `limited` → `--mark-warning` (cách đọc xanh/hổ phách/xám mà một
  bảng tương thích dùng cho "hỗ trợ có điều kiện"). `excluded` **cố ý không** lấy màu destructive:
  một gói không kèm tính năng là một SỰ THẬT, không phải thất bại, và một cột dấu ✗ đỏ đọc thành
  một danh sách lỗi. Hình dạng glyph khác nhau cộng một từ `sr-only` qua `t()` (en/ja/vi) lo phần
  WCAG 1.4.1.

  **Không có prop cho số lượng** ("· 10.000 req/mo"). Viết
  `label={<>API calls <Text tone="muted" tabular>…</Text></>}` đã hợp lệ và đã sạch audit, nên một
  prop cho nó trượt câu hỏi 1 của `docs/WHAT-BELONGS-HERE.md` — consumer có nước đi.

- **`Thumbnail`** (gh#530) — ảnh có khung, CHIỀU CAO CỐ ĐỊNH và BỀ RỘNG THEO TỈ LỆ THẬT, cho một
  hàng ảnh chụp màn hình xuống dòng mà tỉ lệ mỗi tấm một khác. `AspectRatio` ràng một TỈ LỆ và ghi
  đè `width: 100%` sau `...style` (không sửa được từ call site), nên vài tỉ lệ khác nhau ép về một
  số thì hoặc letterbox hoặc cắt; `Avatar` là dấu định danh; `Card` chèn padding giữa khung và ảnh;
  `CardCover` là khe media BÊN TRONG một Card. Trong khi đó `no-hand-rolled-surface` chặn đúng
  `<img className="h-40 w-auto rounded-md border" />` — luật cấm hình dạng duy nhất chạy được mà
  catalog không có cái thay thế.

  Khung nằm ngay TRÊN `<img>`, không node bọc: một node bọc muốn ôm sát thì phải biết bề rộng ảnh,
  mà bề rộng ấy chưa tồn tại trước khi tải xong. Đo trong Chromium ở 1280px, bốn tỉ lệ thật
  (360×640 · 960×540 · 480×270 · 96×96) trên cùng một hàng: cao **160,00px cả bốn**, cùng một
  `top`, rộng lần lượt 90,88 · 282,88 · 282,88 · 160,00px — tỉ lệ hộp nội dung khớp tỉ lệ thật tới
  4 chữ số, tức khung sát ảnh, không dải letterbox; `scrollWidth` = `clientWidth` = 1280. Ở 393px,
  hàng `sm` và `md` vẫn giữ hai tấm trên một dòng (64/64 và 96/96, rộng 36,88 & 112,22 và 54,88 &
  169,11), khung vẫn sát ảnh, không tràn ngang.

  Ngoại lệ thành thật, đo được: ở 393px với `size="lg"`, một tấm 16:9 cần 284px trong khi cột chỉ
  còn 259px, nên `max-inline-size: 100%` kẹp lại và `object-fit: contain` để lộ dải 12,6px. Đó là
  đánh đổi có chủ ý — giữ chiều cao của dải và cho ảnh nguyên vẹn, thay vì để một tấm toàn cảnh
  kéo cả trang trượt ngang.

  `alt` **bắt buộc trong kiểu**, không có đường bỏ qua: ảnh trang trí truyền `alt=""` — chuỗi rỗng
  là một QUYẾT ĐỊNH của người viết, còn thiếu thuộc tính là một sơ suất không ai thấy (WCAG 1.1.1).
  Truyền thêm `width`/`height` thật của tệp thì trình duyệt biết tỉ lệ trước, và vì chiều cao đã cố
  định nên khung có bề rộng cuối cùng ngay từ lần vẽ đầu — hàng không nhảy trong lúc ảnh tải.

### Fixed

- **`Tabs size` nay có tác dụng ở dạng compound.** Tầng kích thước được tính trong `Tabs` và chỉ
  trao cho những trigger mà nhánh `items` tự dựng; một dải điều hướng buộc phải viết bằng
  `<TabsList><TabsTrigger>` thì prop ấy **không làm gì cả** — consumer đo được `data-size="sm"` trên
  root trong khi trigger vẫn vẽ `--tabs-trigger-padding-x-md`. Nay tầng đi qua `TabsFrameContext`,
  một định nghĩa dùng chung cho cả hai dạng.

- **`Card` trong lưới nay canh được footer xuống đáy, không cần utility.** `ResponsiveGrid` kéo mọi
  ô cao bằng hàng, nên thẻ ngắn có chỗ thừa — và một thẻ `display: block` tiêu chỗ thừa ấy thành
  khoảng trống DƯỚI footer: consumer đo hai nút trong cùng một hàng lệch nhau 40px, và đường duy
  nhất của họ là `className="flex h-full flex-col"`, thứ mà `ui-audit` chặn đúng. Nay thẻ là cột và
  footer nhận phần dôi. Đo sau bản sửa: hai thẻ nội dung dài ngắn khác nhau đặt footer ở cùng một
  toạ độ (1028 và 1028). Thẻ vừa đúng chiều cao nội dung thì không đổi một pixel nào.

### Fixed

- **Catalog MCP im lặng bỏ sót component đã phát hành, trong khi hai cổng canh nó đều xanh**
  (gh#526). Luật dành cho consumer đặt catalog làm **thẩm quyền duy nhất** trả lời "ở đây đã có
  gì" — nên một component tra không ra thì với agent kế tiếp là component KHÔNG TỒN TẠI, và nó
  dựng lại bằng tay. `StatusBadge`, `ServiceCatalogCta`, `OverlayPortalProvider` đang ở đúng chỗ
  đó. (`Tree`, cả nhà `Chat`, `Timeline`, `Transfer`, `Cascader`, `TreeSelect`, `QrCode` mà issue
  liệt kê thì các lần gộp gần đây đã bù xong; đo lại trên `main` trước khi sửa.)

  Hai cổng cũ không hỏng — chúng **không đo việc này**:

  - `check:mcp-orphans` suy ra **MỘT tên mỗi tệp**, bằng cách PascalCase hoá TÊN TỆP. `StatusBadge`
    nằm trong `badge.tsx`, nên cái tên duy nhất tệp ấy từng bị hỏi là `Badge` — đã có entry. Mọi
    export THỨ CẤP đều vô hình với nó, mà export thứ cấp là phần lớn bề mặt công khai: **133 trên
    276**.
  - `check:mcp-catalog-coverage` hỏi tên có xuất hiện Ở ĐÂU ĐÓ trong `mcp/src/data/*.ts` không,
    bằng `String.includes` — tức **khớp chuỗi con**. `Tree` là chuỗi con của `TreeSelect`, `Area`
    của `ScrollArea`. Qua được phép kiểm ấy gần như miễn phí, nên nó không thể có nghĩa "catalog
    đang mô tả bạn".

  Thêm **một** cổng, `check:mcp-catalog-completeness`, hỏi đúng câu mà luật consumer dựa vào:
  **`get_component` trả lời được cho tên này không?** Nó liệt kê mọi export PascalCase gọi được
  của từng subpath công khai trong `package.json#exports` và đòi mỗi tên hoặc là `name` của một
  entry, hoặc nằm trong `subParts` của **đúng một** entry. Không allowlist, không tính chuỗi con.
  Đã nối vào `verify:ci:static`; `check:gate-coverage` thấy nó qua `ci.yml`. Đột biến: gỡ entry
  `Timeline` → đỏ, nêu đúng tên; trả lại → xanh.

  Kèm theo đó:

  - `subParts` là trường mới trên `ComponentEntry` — nơi GHI LẠI quyết định "tên này được ghép vào
    cha", thay cho suy đoán theo cách viết. 133 tên được gán cho 33 entry.
  - `get_component name="CardCover"` không còn trả `not found. Use list_primitives to discover`
    cho một export đang phát hành — nó nói CardCover thuộc `Card` và chỉ sang đó. Đúng ca mà issue
    dựng lại: `AspectRatio` bảo đừng dựng lại `CardCover`, rồi catalog không tả nổi `CardCover`.
  - `search_components` tính điểm cả `subParts`, nên tìm "StatusBadge" ra `Badge`.
  - Bù ba entry thật: `ServiceCatalogCta` (ô CTA nét đứt khép lưới launcher) và
    `OverlayPortalProvider` (chuyển TOÀN BỘ overlay sang một container — thứ duy nhất một app nằm
    trong **shadow root** không thể làm bằng prop; `AppProvider` đã tả nó trong `related` mà
    catalog không có entry để mở ra). `StatusBadge` là **alias của `Badge`**, không phải component
    riêng, nên nó vào `subParts` của `Badge` chứ không có entry giả.
  - `./ui/time-input` trong `exports` trỏ vào một tệp không tồn tại từ 16.0.0, khi `TimeInput` bị
    gỡ vì trùng `TimePicker`. Cổng mới bắt được vì nó phải đi qua từng subpath; đã xoá.
  - `loadComponentInventory` (frame-harness) đòi `group:` phải là dòng NGAY SAU `name:`, và im
    lặng khi không phải. Trên `main` nó đã bỏ sót sẵn **4** entry (`FormRoot`, `FormFieldControl`,
    `FormFieldArray`, `useZodForm`); chèn thêm một trường vào giữa làm rơi tiếp 33 cái nữa —
    `Button`, `Card`, `Badge`, `Sidebar`, `Table` trong số đó — và báo cáo coverage tự sinh ra
    NHỎ ĐI mà không lỗi ở đâu cả. Đổi sang neo theo `name:` rồi đọc `group:` trong chính khối
    entry. Báo cáo lên lại 147 component.

- **Cả tầng motion chưa từng có giá trị ở `:root`.** `--duration-*`, `--ease-*`, `--reveal-*`,
  `--duration-loop`, `--activity-*` được khai báo **chỉ bên trong `.ui-scale-fixed`** — một class mà
  các shell chỉ gắn lên dải chrome (topbar của AppShell, thanh của CenteredShell). Mọi nơi đọc chúng
  thì nằm chỗ khác: `control.css`, `card-layout`, `navigation-layout`, `shell-layout`,
  `alert-layout`, `layout`, `motion.css` và một component.

  Đo trên một frame docs trước bản sửa: `getPropertyValue("--duration-fast")` ở `:root` trả về
  chuỗi **rỗng**, nên mọi khai báo đọc token ấy là khai báo không hợp lệ và bị trình duyệt bỏ. Các
  dấu của `Activity` đo được `animation-duration: 0s` — hiệu ứng chưa từng chạy lần nào. Sau khi
  chuyển tầng về `:root`: token phân giải đúng (`.15s`, `1.4s`, `10px`) và dấu `Activity` chạy
  `ui-activity-bounce` ở **1.4s**.

  Test ghim bằng văn bản CSS, vì khiếm khuyết nằm ở CHỖ KHAI BÁO và jsdom không phân giải cascade
  của custom property. Đột biến: đặt lại một token vào `.ui-scale-fixed` → đỏ.

### Added — `Swatch`: một mẫu màu CHỈ ĐỌC cho màu do người dùng chọn (gh#527)

Consumer lưu `primary_color` / `secondary_color` của tổ chức là mã màu **người dùng tự chọn**, rồi
cần vẽ nó thành một chấm 16px cạnh tên tổ chức. Không có nước đi nào hợp lệ: `Legend` chỉ nhận
`tone` — một tập ĐÓNG các vai ngữ nghĩa, `#c0392f` không bao giờ ánh xạ vào đó — `ColorPicker` là
ô NHẬP (vẽ một input disabled để hiển thị còn tệ hơn), `Badge` là con chip có nền pha và viền, đọc
ra như bấm được. Và tự vẽ `<span className="w-[10px] h-[10px] rounded-[2px] bg-[#c0392f]" />` thì
`ui-audit` chặn **ba lần một lúc** (`no-arbitrary-size`, `no-arbitrary-radius`, `no-arbitrary-hex`).
Nước cuối cùng còn lại là một dòng `ui-audit-disable` — tức là luật cấm mọi cách vẽ một thứ mà màn
hình bắt buộc phải vẽ.

`Swatch` là **một** phần tử, một prop bắt buộc: `<Swatch color={brand.primary_color} aria-label=… />`.

- **Màu là GIÁ TRỊ, không phải token** — đúng trục `Badge color` đã mở: nó đi vào `--swatch-color`
  nội tuyến trên phần tử, **không một mã hex nào vào stylesheet**, nên `no-arbitrary-hex` và
  `no-raw-palette-color` xanh vì cấu trúc chứ không phải vì được tha.
- **Tên đọc màn hình đến từ prop, không từ chữ nhìn thấy.** Có `aria-label` → `role="img"` và đọc
  đúng câu ấy; không có → `aria-hidden` (đúng luật của `Legend`), dành cho khi dòng chữ bên cạnh đã
  nói màu ấy là gì. Không có đường thứ ba nơi màu là vật mang nghĩa duy nhất (WCAG 1.4.1).
- **Vạch tóc là chức năng, không phải trang trí**: đo trên frame docs sáng, một mẫu `#ffffff` trên
  thẻ `rgb(253,253,252)` có tỉ số **1,02:1** — tức là biến mất — còn vòng inset `--border` đo
  **1,45:1**, đủ để thấy cạnh. Nó là vạch nghỉ chung của cả hệ, và chỉnh lại được qua
  `--swatch-border-color`. Nền tối thì ngược lại: chính ô trắng đo **16,3:1**.
- `forced-color-adjust: none`: ở đây màu CHÍNH LÀ nội dung, tô lại nó thành CanvasText không phải
  "tăng tương phản" mà là xoá sạch thông tin duy nhất mà dấu này mang.

Đo trong Chromium (frame `data-display-swatch`, 1024px): ô 16×16px, bo 2px, vòng
`rgb(215,212,209) 0 0 0 1px inset`, `background` đúng bằng giá trị truyền vào. Đột biến: đổi
`background: var(--swatch-color)` thành `hsl(var(--muted))` → test đỏ.

### Added — `Flex hideBelowRaw` / `hideFromRaw`: cửa thoát cho một điểm gãy ngoài thang (gh#528)

`gap` có `gapRaw`, `pad` có `padRaw`, bề rộng có `width` — cả ba đều để lại `data-*-raw` trên DOM
nên mỗi lần thoát ĐẾM ĐƯỢC. Trục điểm gãy là trục duy nhất chưa có cửa ấy: `hideBelow` chỉ nhận
`sm`/`md`/`lg`/`xl` (640/768/1024/1280), nên một thiết kế chốt hamburger ở **900px** không còn nước
nào ngoài `className="hidden min-[901px]:flex"` — thứ `ui-audit` chặn và **không đếm được**.

- Cùng hợp đồng với `gapRaw`: raw THẮNG bậc token (bậc khi ấy không phát attribute nào, nên hai
  luật không thể cùng khớp), và nó để lại `data-hide-below-raw` / `data-hide-from-raw`.
- Media query **không đọc được `var()`**, nên một bề rộng ngoài thang chỉ tới được CSS dưới dạng
  literal: component tự in ĐÚNG MỘT luật cho mỗi bề rộng, khoá theo chính giá trị ấy, và React gộp
  trùng theo `href`. Luật in ra cố ý **không nằm trong `@layer`** — `.ui-flex { display: flex }`
  nằm trong `@layer components`, mà khai báo ngoài layer thắng mọi khai báo trong layer bất kể độ
  đặc hiệu, nên cửa thoát không thể thua cascade vì thứ tự nạp stylesheet. `Flex` vẫn **không có
  hook nào**, nên nó vẫn là module SERVER.
- **Mối nối**: `hideBelowRaw` ẩn khi `width < N`, `hideFromRaw` ẩn khi `width >= N` — đúng cặp so
  sánh của bậc token, nên hai bên bù nhau khít. Đừng dùng `max-width` bao gồm: `<= N` ghép với
  `>= N` làm **cả hai** biến mất ở đúng N, chính cái lỗ 1px consumer đã đo trên cặp `max-[900px]:`
  tự dựng.

Đo trong Chromium (frame `layout-flex`, `hideBelowRaw={900}` + `hideFromRaw={900}`):
899px → `none` / `flex`; **900px → `flex` / `none`**; 901px → `flex` / `none`. Đúng một vùng hiện ở
mọi bề rộng. Đột biến: đổi `>=` thành `>` trong luật in ra → test mối nối đỏ.

### Added — `Card` khép ba khoảng trống thật so với Ant Design 6

Đọc thẳng `components/card/Card.tsx` và `components/card/style/index.ts` của antd (MIT) rồi port
LOGIC sang, không chép nguyên khối: ở đây họ `Card` là **hợp thành** (`CardHeader`/`CardContent`/
`CardFooter`), còn antd truyền `title`/`extra`/`cover`/`actions` bằng prop. Parity nghĩa là mọi
HÀNH VI của antd đều với tới được, không phải mọi tên prop đều tồn tại.

- **`Card hoverable`** (antd `hoverable`) — thẻ nâng lên `--card-hover-shadow` khi rê chuột, kèm
  con trỏ `pointer`. Trước đó `card-layout.css` **không có một dòng hover nào**, và
  `ServiceLauncherCard` — chỗ duy nhất có thể đã sở hữu ca "thẻ bấm được" — cũng không.

  Viết thành **định nghĩa lại `--card-shadow`**, không phải một `box-shadow` riêng, và đó mới là
  điểm chính: bề mặt thẻ vẽ `var(--card-shadow), var(--card-glow)`, còn luật
  `accentPlacement="perimeter"` liệt kê lại `var(--card-shadow)` phía sau vòng cảnh báo của nó —
  nên một luật hover TÔ box-shadow sẽ thắng ở cùng độ đặc hiệu và **xoá sạch vòng ấy** suốt lúc
  con trỏ còn đậu trên thẻ. Nâng một tầng lên biến số thì mọi luật đang hợp thành độ nổi lúc nghỉ
  đều hợp thành luôn độ nổi lúc hover. Đây là chỗ khác antd có chủ ý: upstream còn đặt
  `border-color: transparent` khi hover, ở đây thì không, vì nó sẽ mang theo cả rail `[data-accent]`.

  `hoverable` chỉ là TRÌNH BÀY: nó không thông báo gì và không gắn handler. Thẻ trông bấm được thì
  phải bấm được với mọi người — ghép một control thật vào, đừng đặt `onClick` trần lên div.

- **`Card variant="borderless"`** (antd `variant="borderless"`, tức `bordered={false}` đã khai tử)
  — bỏ viền, giữ nền. Bản kiểm parity 10/09 xếp `outline` là "superset" của trục này; **sai đúng ở
  điểm đó**: `outline` chỉ đụng `background`, viền hairline vẫn nguyên, nên "không viền" trước nay
  **không có cách nào viết ra**. Hai giá trị là ảnh gương của nhau và không cái nào thay được cái
  kia.

  Thẻ `borderless` có `accent` vẫn giữ rail ngữ nghĩa của nó: luật `[data-accent]` khai sau ở cùng
  độ đặc hiệu (0,2,0). Một tín hiệu trạng thái không được biến mất chỉ vì thẻ xin một cái khung
  khẽ hơn.

- **`CardFooter actions`** (antd `actions`) — N ô **RỘNG BẰNG NHAU** chia bởi kẻ dọc. Bản kiểm cũ
  xếp nó là "đã có qua `CardFooter separated`", nhưng `separated` dồn con về mép cuối theo bề rộng
  tự nhiên: đúng hình cho cặp Lưu/Huỷ, sai hình cho một dải chia ô. Upstream đặt
  `width: ${100 / actions.length}%` bằng style nội tuyến; `flex: 1 1 0` cho kết quả y hệt từ
  stylesheet nên không phải đếm con và **không có số đo nào rơi vào DOM** (luật #44).

  Tự đủ: nó tự kẻ đường trên và tự full-bleed, vì dải actions của antd không bao giờ khác thế — một
  hành vi antd, một prop, đúng lối `CardBar` đã đi. Kẻ dọc dùng `border-inline-start` nên dải tự
  soi gương dưới RTL.

### Fixed

- **Catalog MCP quảng cáo một prop `Card size` đã bị xoá từ 24/08/2026.** `check:mcp-prop-sync` chỉ
  canh một chiều — "mọi prop đã khai phải có trong catalog" — nên một prop chỉ còn trong catalog
  thì không cổng nào thấy. Agent tra MCP đúng quy trình vẫn đọc ra `size: "md" | "compact"` và viết
  mã theo. Đã gỡ, và `density` nay nói thẳng nó CHÍNH LÀ trục `size` của antd.

- Catalog ghi luôn **những prop antd mà họ Card trả lời bằng hợp thành** — `title`/`extra`, `cover`,
  `loading` (antd render một Skeleton, ở đây là `SkeletonRows` trong `CardContent solo`),
  `tabList`/`activeTabKey`/`onTabChange` (`Tabs` trong `CardContent tight flush`),
  `tabBarExtraContent` (`CardBar extra`), `type="inner"`, `Card.Grid`, `Card.Meta` — để lần sau
  không ai mở lại issue xin thêm prop cho thứ đã với tới được.

### Added — `Tabs` khép nốt bề mặt Ant Design 6

Bốn prop cuối còn thiếu, port thẳng từ mã nguồn antd / `@rc-component/tabs` chứ không suy từ tài liệu:

- `animated` (`boolean | { inkBar, tabPane }`) — chép từ `components/tabs/hooks/useAnimateConfig.ts`:
  `false` tắt cả hai, `true` **bật cả hai** (bản antd khác bản rc gốc ở đúng chỗ này), object thì
  gộp lên `{ inkBar: true }`. `tabPane` của antd hoá ra chỉ là một lượt **mờ dần** (`opacity: 0 → 1`,
  `components/tabs/style/motion.ts`), nên đây là bản port chứ không phải sáng tác. Cả hai công tắc
  còn tắt thêm dưới `prefers-reduced-motion` — antd không có vế này.
- `indicator` (`{ size, align }`) — hình học lấy từ `hooks/useIndicator.ts`. `align` giữ nguyên tên
  và giá trị của antd (đã là logic sẵn). `size` giữ tên antd nhưng đổi sang trục CÓ TÊN: antd nhận
  `number | (origin) => number`, hai thứ mà API này không nhận được; `full` là cả thẻ tab (mặc định
  của antd), `label` là hộp nội dung của thẻ. Đo trên Chromium, tab 142px: `full` → thanh 141px,
  `label` → 117px (= 141 − 2×12, đúng phần đệm ĐANG VẼ), `align="start"` → sát mép đầu, `"end"` →
  sát mép cuối; trục dọc cũng vậy (46px → 30px).
- `moreIcon` — glyph của nút `overflow="menu"`. Nút vẫn giữ `aria-label` của nó, nên một glyph tự
  chọn không bao giờ làm mất tên của control.
- `onTabScroll` — `{ direction: "start" | "end" }` thay cho `left | right | top | bottom` của antd.
  Hai trong bốn giá trị ấy chỉ là trục kia của cùng một sự kiện, và antd đọc chúng từ DẤU của một
  transform có biên bị lật khi RTL, nên cùng một cử chỉ báo ngược nhau giữa hai hướng viết.

**Không port, có lý do ghi lại**: `tabBarGutter` (khoảng hở giữa các tab là token của theme —
`--tabs-list-line-space-gap` / `--tabs-card-list-space-gap`; một con số pixel là hằng số, không phải
trục), `tabBarStyle` · `renderTabBar` · `classNames`/`styles` · `more.popupRender` (thuộc lớp "thay
markup đã dựng" mà `docs/DESIGN-AUTHORITY.md` từ chối đích danh), `destroyOnHidden` theo từng item
(đã là `forceRender`), và `keyboard` — prop này **không tồn tại** ở antd 6, `@rc-component/tabs`
liệt kê nó trong danh sách đã gỡ.

### Fixed

- Gạch chân `Tabs` (`line`) giờ THẬT SỰ có transition. Nó viết `var(--duration-fast)
var(--ease-standard)`, mà cả tầng motion — `--duration-*`, `--ease-*`, `--reveal-*` — chỉ được
  khai trong `.ui-scale-fixed` của `src/tokens/foundation.css`, **chưa bao giờ ở `:root`**. Đo trên
  Chromium: `getPropertyValue("--duration-fast")` ở `:root` trả về chuỗi rỗng, khai báo hỏng nên bị
  bỏ, và thanh gạch đo được `transition-duration: 0s` — một hiệu ứng chưa ai từng nhìn thấy. Hai
  khai báo motion của `Tabs` nay có giá trị dự phòng nên chạy ngay; **khuyết tật ở tầng token vẫn
  còn và ảnh hưởng toàn thư viện** (mọi `var(--duration-*)` / `var(--ease-*)` ngoài
  `.ui-scale-fixed`), cần một bản sửa riêng.

### Added

- **`Skeleton` phủ hết bề mặt `Skeleton` của Ant Design 6** — port từ `ant-design/components/skeleton/`
  (MIT), nối vào họ `Skeleton` đang có chứ không dựng một họ thứ hai bên cạnh. `Skeleton` vẫn là
  KHỐI trơn như cũ (mọi call site hiện tại không đổi một pixel nào), nay thêm hai prop của antd:

  - `active` — đổi nhịp đập đứng yên lấy vệt sáng chạy ngang. antd mặc định KHÔNG chuyển động, còn
    khối ở kho này xưa nay vẫn đập, nên mặc định giữ nguyên: `active` chọn cái ồn hơn trong hai
    chuyển động, không phải bật chuyển động lên.
  - `loading` — `false` thì vẽ `children` thay cho khối. Bỏ trống vẫn vẽ khối, đúng phép
    `loading || !("loading" in props)` của antd.

  Năm hình dạng của antd về làm năm preset — `SkeletonAvatar` · `SkeletonButton` · `SkeletonInput` ·
  `SkeletonNode` · `SkeletonImage` — cũng gọi được bằng lối viết antd (`Skeleton.Button`…). Mỗi
  preset lấy hộp từ tầng `--control-height`, đúng tầng mà control thật lấy: nút rộng **2 lần** chiều
  cao, ô nhập **5 lần**, node/ảnh vuông **3 lần** — chính các hệ số antd dùng. `size` đọc thang
  `xs|sm|md|lg` của kho, `shape` của nút đọc thang `default|pill|sharp` của `Button` (`pill` là
  `shape="round"` bên antd), `shape` của avatar đọc `circle|square` của `Avatar`.

  `SkeletonArticle` là hình dạng `<Skeleton>` của chính antd (avatar + dòng tiêu đề + đoạn văn) —
  cho một bình luận, một mục feed, một khối hồ sơ. Ma trận mặc định chép đúng antd, đo lại trong
  Chromium: không avatar → tiêu đề **38%**, ba dòng, dòng cuối **61%**; có avatar → **50%**, hai
  dòng; có tiêu đề mà không đoạn văn → avatar hoá **vuông**. `title`/`paragraph`/`avatar` nhận cả
  `boolean` lẫn object (`{ width }` · `{ rows, width }` · `{ size, shape }`), `width` dạng mảng đo
  từng dòng còn dạng đơn đo dòng CUỐI, số đọc là pixel. `round` bo viên mọi dòng.

  Bốn thứ của antd cố tình KHÔNG lấy, mỗi thứ một lý do đã ghi: `prefixCls`, `classNames` và
  `styles` (docs/DESIGN-AUTHORITY.md từ chối đích danh — kho này trả lời tầng ấy bằng token),
  `size` dạng số thô trên element (luật tiêu dùng #8: kích thước đến từ prop, không phải `w-[240px]`),
  và `shape="circle"` của nút (một nút chỉ-icon ở kho này là `size="icon"`; chỗ trống vuông là
  `SkeletonAvatar shape="square"`).

### Fixed

- **Không còn skeleton nào chạy dưới `prefers-reduced-motion: reduce`.** Nhịp đập của
  `.ui-skeleton-block` xưa nay không có cửa tắt — đo trong Chromium: **106/106** khối vẫn chạy khi
  người dùng đã xin dừng chuyển động (WCAG 2.2.2 / 2.3.3). Nay cả nhịp đập lẫn vệt sáng mới đều
  đứng, khối vẫn giữ nguyên mặt tô nên không mất gì.

### Đã đo được, chưa sửa ở đây

- **Cả tầng motion không với tới được từ `:root`.** `--duration-fast|base|slow`, `--ease-*`,
  `--reveal-*`, `--duration-loop` và `--activity-*` chỉ được khai bên trong `.ui-scale-fixed`
  (`src/tokens/foundation.css`), không có bản `:root` nào. Đo: `getPropertyValue("--duration-loop")`
  trên `documentElement` trả về chuỗi RỖNG, nên mọi `animation` shorthand mang nó đều hỏng ở thì
  computed-value — `.ui-activity-dot` tính ra `animation-name: none`, tức **chuyển động nền của
  `Activity` không chạy ở đâu cả**. Đây là lỗi tầng foundation, sửa nó làm chuyển động đổi trên toàn
  thư viện, nên nó được báo chứ không sửa kèm ở PR này; vệt sáng của Skeleton đọc
  `var(--duration-loop, 1400ms)` để vẽ đúng ngay hôm nay và tự đọc token lại khi tầng ấy được chữa.

## [23.1.0] - 2026-09-12

Bản này gần như toàn bộ đến từ báo cáo của consumer `gino-cloud` sau khi họ nâng 20.2.1 → 23.0.0 —
mười issue trong một ngày, mỗi cái kèm số đo. Và nó mang theo **sáu bản sửa mà 23.0.0 bỏ sót**, vì
23.0.0 được cắt từ `main` trong khi việc nằm ở `dev`.

### Sáu bản sửa 23.0.0 đã bỏ lại

`DataTable getRowLabel` (ô chọn từng hàng đọc lên là uuid), `FormField word-break: auto-phrase`
(「第8号」 ngắt giữa từ), vùng bấm và tên hai nút bước của `NumberInput`, đệm ô rỗng của
`DataTable`, và `AppDateFormat ymd`.

### Added

- `ui-audit --changed` — quét theo diff, nên thấy cả file sửa bằng shell, thứ hook không thấy.
- Mỗi phát hiện của `ui-audit` nói luôn primitive thay thế (21 luật đã khai).
- Luật `card-table-needs-flush`, và luật 10 trong `CONSUMER-RULES`.
- `Tabs` gập dải tab dọc thành ngang dưới 48rem — trước đó ở 393px dải tab rộng **0px**, không còn
  cách đổi tab trên điện thoại.

### Fixed

- Vòng tiêu điểm ở `Input`/`Checkbox`/`Radio`/`Switch` và panel `Tabs` không còn phụ thuộc thứ tự
  tầng CSS của consumer.
- `card-needs-content` hết báo sai với `<Card><Form><CardContent>`.
- Vùng bấm nút mở lịch `DatePicker`: 20×20 → **24×24**, phần vẽ không đổi.
- `Segmented` khi xuống hàng giữ đúng khoảng hở giữa hai hàng.
- Tệp luật do gói sở hữu hết mục ruỗng khi consumer đặt `ignore-scripts=true`.

### Changed — BREAKING đã ghi muộn

- `Radio` và mục `Segmented` không còn thuộc tính `role` (từ 23.0.0). Selector thay thế nằm trong
  mục `[Unreleased]` phía trên đã chuyển xuống đây.

### Fixed

- **Tệp luật do gói sở hữu không còn mục ruỗng trong im lặng.** `.ai/rules/godxjp-ui.md` mở đầu bằng
  lời hứa "bị GHI ĐÈ mỗi lần nâng cấp", nhưng consumer đặt `ignore-scripts=true` — một mặc định bảo
  mật hợp lý — thì postinstall không chạy và lời hứa ấy vỡ mà không ai biết: đo được ở một kho,
  tệp ghi **19.6.0** trong khi gói đã cài là **23.0.0**, lệch ba bản major. Agent đọc tệp ấy như
  luật hiện hành sẽ dựng theo component đã bị xoá, prop đã biến mất và thuộc tính `role` không còn.

  postinstall không tự chữa được — nó chính là thứ đã không chạy. `ui-audit` thì chạy, nên nay nó so
  dấu phiên bản trong tệp với phiên bản gói đang cài và báo `owned-rules-stale` kèm đúng một dòng
  lệnh để làm mới.

- **Gói thôi giành tệp với Prettier.** Thân tệp có bảng markdown căn cột; Prettier định dạng lại,
  digest đổi, lượt cài kế tiếp ghi đè ngược, `format:check` lại đỏ — vòng lặp không ai thắng. Nay
  postinstall tự thêm hai tệp ấy vào `.prettierignore` (idempotent), vì chúng là của gói.

### Changed — BREAKING, và lẽ ra phải có trong 23.0.0

- **`Radio` và mục `Segmented` không còn thuộc tính `role` trên phần tử được vẽ.** Hệ quả của việc
  rời Radix ở 23.0.0 cộng bản sửa vùng bấm (#487): vai trò nay là vai trò NGẦM của một `<input>`
  thật nằm bên trong. Cây accessibility không đổi, `getByRole` vẫn tìm thấy — nhưng mọi selector
  viết theo thuộc tính im lặng trả về **0**. Đo trên frame của kho này: **0 trên 10** radio và
  **0 trên 33** mục Segmented trả lời `[role="radio"]`.

  Đây là dạng hồi quy tệ nhất vì nó làm cổng XANH HƠN: một consumer đo được test a11y chuyển từ đỏ
  sang xanh ngay sau khi nâng lên 23.0.0, trong khi khiếm khuyết nó canh vẫn còn nguyên — luật chỉ
  đơn giản là hết nhìn thấy. 23.0.0 không ghi điều này ở đâu cả.

  Selector thay thế: `[data-slot="radio-group-item"]`, `[data-slot="segmented-item"]`,
  `[data-slot="checkbox"]` cho hộp được vẽ; hoặc locator theo vai trò tính được (`getByRole`,
  `internal:role=radio[name=…]` của Playwright) cho chính control. `Switch` không ảnh hưởng —
  react-aria khai `role="switch"` tường minh.

### Fixed

- **Nút mở lịch của `DatePicker` nay đủ sàn vùng bấm 24×24 mà KHÔNG to thêm một pixel nào.** Đo
  trên hồ sơ thiết bị cảm ứng thật (Pixel 5, 393px): phần vẽ 20×20, dưới sàn WCAG 2.2 SC 2.5.8, và
  consumer không có đường nào chữa — kích thước ấy không phải prop, không phải token, còn viết đè
  CSS thì `ui-audit` cấm, và cấm đúng. Nay một `::after` căn giữa mang vùng bấm lên
  `--touch-target-min`; phần vẽ vẫn đúng 20×20, đo lại sau bản sửa: vùng bấm **24×24**.

  Đo thêm hai thứ cùng báo cáo ấy, và cả hai đều KHÔNG phải lỗi: nút bước của `NumberInput` là
  **24×24** và ô ngày của lịch là **44×44** trên thiết bị cảm ứng — con số 24×13 và 32×32 trong báo
  cáo đến từ trình duyệt desktop thu hẹp còn 393px, nơi `@media (pointer: coarse)` không khớp.

### Added

- **`ui-audit --changed`** — quét đúng những gì nhánh này đụng vào, bất kể sửa bằng công cụ nào.
  Hook `PostToolUse` chỉ khớp `Write|Edit|MultiEdit`, nên agent sửa file qua shell (`sed -i`,
  heredoc, `cat >`) không bao giờ kích hoạt nó. Consumer đo thẳng: suốt một phiên dài, **mọi** lần
  sửa `.tsx` đều đi qua Bash và audit **không chạy lần nào**. Hook không vá được chuyện đó — lời
  gọi Bash không mang `file_path`. Một cái diff thì được.
- **Mỗi phát hiện nói luôn primitive thay thế** (`replacement`, in ra dòng `use: …`). 21 luật đã
  khai; trước đây người đọc phải hỏi catalog xem cái vừa viết nên thay bằng gì — một vòng hỏi đáp
  cho mỗi phát hiện, cộng một lần đoán xem phải tra cái gì.
- **Luật `card-table-needs-flush`** — `Card` mà toàn bộ thân là bảng thì bảng phải chạm mép trong
  của thẻ. `CardContent` mặc định đệm 16px trong khi mặt bảng tự vẽ viền, nên bảng thành hộp lồng
  trong hộp, và bảng rộng thì tràn hẳn ra ngoài thẻ (đo ở consumer: **−85px** và **−519px**). Luật
  cố ý hẹp: bảng phải là con TRỰC TIẾP, vì `<Flex>` bọc bộ lọc cùng bảng là thân hỗn hợp và ở đó
  đệm là đúng. Nó bắt được ngay một chỗ trong docs của chính thư viện.
- **Luật 10 trong `CONSUMER-RULES.md`** nói điều trên, và `SPACING.md` nay ghi rõ `flush` một mình
  là đủ — `tight` là núm khác, chỉnh dải header chứ không chỉnh mép thân.

### Fixed

- **`card-needs-content` không còn báo sai khi `<Card><Form><CardContent>`.** Đó là cách ghép DUY
  NHẤT đúng cho thẻ có nút submit ở `CardFooter`: thẻ `<form>` phải bọc cả thân lẫn footer, nếu
  không nút không submit được. Luật cũ đòi slot của Card phải là phần tử NGAY SAU, nên mọi lớp bọc
  hợp lệ đều bị tính là lỗi — 3 trên 5 phát hiện ở một consumer là sai, và đều nằm trên mã mới
  nhất của họ. Nay nó hỏi đúng ý định của luật: có `<CardContent>` nào trước `</Card>` của chính
  thẻ này không (đếm theo độ sâu, vì Card lồng được trong Card).
- **`Tabs tabPlacement="start"` / `"end"` tự gập ngang trên màn hẹp (#502).** Dải tab dọc và panel
  dùng CHUNG một trục inline, nên khi min-content của panel chiếm gần hết màn điện thoại thì dải bị
  ép về 0 — đo ở Chromium 393px với một khối 676px trong panel: dải rộng **8px, phần tab 0px**, tức
  không còn đường nào tới tab khác ngoài tab đang mở (WCAG 2.2 SC 2.1.1), kèm tràn ngang (SC
  1.4.10). Từ `--tabs-placement-responsive-breakpoint-width` (48rem) trở xuống, `start`/`end` gập
  thành `top`/`bottom` — **kể cả trục phím mũi tên**, vì gập bằng `@media` sẽ để một dải nằm ngang
  bị lái bởi ↑/↓. Ant Design gập đúng cặp ấy theo đúng cách ấy; chỗ khác duy nhất là nó đoán thiết
  bị qua user agent, còn ở đây là một câu hỏi về BỀ RỘNG, và là một núm theme (đặt `0px` để tắt
  hẳn). Trên ngưỡng gập, dải dọc thêm `flex-shrink: 0` — một panel tự cuộn được phần tràn của nó,
  một dải tab 0px thì không cuộn vào lại được.
- **`Segmented` khi xuống hàng: hai hàng không còn dính nhau (#503).** Track hứa 2px ở mọi mép
  ngoài, nhưng từ khi #480 cho phép `flex-wrap`, mép DUY NHẤT nó không giữ là mép giữa hai hàng: đo
  ở 393px, track hai hàng là 2 + 28 + 28 + 2, hai dòng nhãn cách nhau 4,2px trong khi mép ngoài cho
  4,1px. Nay hàng gập nhận `row-gap: var(--segmented-track-padding)` — cùng một khoảng thụt, trên
  cả hai trục. Bar một hàng không đổi một byte nào.
- **`SPACING.md` nói rõ: ruột của một control KHÔNG nằm trên thang cách của bố cục (#503).** Thang
  φ/8px là khoảng cách GIỮA các khối; ruột control dẫn xuất từ băng control (`--control-height`,
  `--control-padding-x`). 2px của `--segmented-track-padding` là cố ý và chịu lực: label =
  `--control-height − padding × 2`, nên track cao đúng một control và ngang hàng với `Input` cạnh
  nó; nâng lên 8px thì băng nhãn còn 16px cho cỡ chữ 14px. Trước đây doc và component nói hai đằng
  và consumer không có cách nào biết bên nào đúng.

## [23.0.0] - 2026-09-11

### Removed — BREAKING

- **Radix is gone.** `Select` và `Slider` chuyển sang `react-aria-components`; `ContextMenu`,
  `Menubar` và `NavigationMenu` bị XOÁ (không repo consumer nào dùng — đã đo trên 9 kho); `ScrollArea`
  cuộn bằng chính trình duyệt. Menu chuột phải nay là `DropdownMenu trigger={['contextMenu']}`, đúng
  cách antd làm với `Dropdown`. Consumer cài **0** gói `@radix-ui`, trước là 14.
- **axe bị gỡ khỏi kho.** 523 assertion, gate `check:frame-axe`, ba job "Per-frame axe" mỗi lần
  merge, ba gói axe, và nhóm luật axe trong `check:visual-audit` (tám nhóm còn lại giữ nguyên).
- Ba token `--menubar-*` đổi tên thành `--menu-*`; `ScrollBar` thành export rỗng; kiểu của
  `Slider range` theo antd nên `range={biếnBool}` đi cùng `onChange` không còn hợp lệ.

### Added

- **API của Ant Design 6** cho `Select` (options lồng nhau, `fieldNames`, `showSearch` dạng object,
  `mode="tags"`, `tokenSeparators`, `tagRender`, `labelInValue`, `popupRender`, `optionRender`…) và
  `Slider` (`range` dạng object, `marks`, `dots`, `included`, `reverse`, `step={null}`,
  `onChangeComplete`, `tooltip.formatter` cũng là `aria-valuetext`).
- `DropdownMenu trigger` — `click` / `hover` / `contextMenu`, kèm Shift+F10 cho bàn phím.
- Font dự phòng có chỉnh metric: CLS trang docs trên Linux **0,0389 → 0,0020**, macOS **0,2198 → 0,0004**.

### Fixed

- Ô chọn nhận được con trỏ ở đúng chỗ nó được vẽ (552 lỗi → 0).
- Dưới 900px, cả 30 trạng thái của AppShell về một cột (178 lỗi → 0).
- Nhãn `FormField` trỏ đúng id mà control đang mang.

### Changed

- **`Slider` rời `@radix-ui/react-slider`, sang `react-aria-components`, và mang API của antd 6.**
  Cùng nước đi đã làm với `Switch`, `Segmented`, `Radio` (#465). Hình dạng DOM đổi đúng theo cách
  đó: phần tử nhận tiêu điểm không còn là phần tử được tô.

  ```
  Radix:  <span role="slider" class="ui-slider-thumb" aria-valuenow="40">
  RAC:    <div class="ui-slider-thumb"><input type="range" value="40"></div>
  ```

  Giá trị nay là giá trị NATIVE của một `<input type="range">` (vai trò slider ngầm định), không
  còn là `aria-valuenow` viết tay — ARIA in HTML bảo đừng lặp lại thuộc tính native, và
  `getByRole("slider", { value: { now } })` của Testing Library chỉ đọc thuộc tính ARIA nên sẽ coi
  mọi slider native là "không có giá trị". Test trong kho đọc qua `slider-test-utils` (ARIA trước,
  native sau) — **14 ca hợp đồng thời Radix được viết và chạy XANH trên nền Radix TRƯỚC khi đổi**,
  rồi giữ nguyên chữ: `number[]` + `onValueChange` / `onValueCommit`, `min`/`max`/`step`,
  `disabled`, `orientation`, `dir`, `inverted`, `reverse`, `minStepsBetweenThumbs`, `marks`,
  `tooltip`, `name` → `name[]`, PageUp/PageDown và Shift+Arrow = 10 bước, một thumb ở `min` khi
  không truyền gì, và tên thumb từ `FormField` / `aria-labelledby`.

  **Thêm theo antd 6** (mỗi thứ một test): `value` / `defaultValue` là SỐ (mảng vẫn chạy);
  `onChange` / `onChangeComplete` (payload đi theo `range`: số khi không khai, mảng khi có);
  `step={null}` — chỉ dừng ở marks, `min`, `max`, cả bằng con trỏ (gần nhất) lẫn bằng phím (mark
  kế tiếp); `marks` dạng `{ style, label }`; `dots` theo marks khi `step={null}`; `range` dạng
  object — `editable` (bấm lên rail THÊM thumb, Delete/Backspace bớt, giữa `minCount` và
  `maxCount`), `draggableTrack` (kéo cả vệt, giữ nguyên khoảng cách); `vertical`; `disabled` dạng
  mảng cho từng thumb; `tooltip` với `open` / `placement` / `autoAdjustOverflow` / `formatter`.
  `tooltip.formatter` nay còn là **`aria-valuetext`** — mục P1 trong `docs/roadmap/
parity-audit-data-entry.md`: một slider ¥/%/件 trước đây đọc lên đúng một con số trần.

  **Hình học nằm ở thư viện này, không ở RAC, và đó là một quyết định có số.** RAC không có
  `reverse`/`inverted` (Radix có, antd có, và nó là API công khai của component này), không có
  `minStepsBetweenThumbs`, không có `step={null}`, và `pageSize` của nó là `(max − min)/10` chứ
  không phải 10 bước: với `min=0 max=10 step=2`, PageUp thời Radix nhảy **10**, RAC nhảy **2**.
  Mọi đường nhập của RAC suy ra hướng từ `useLocale()` và không có chỗ nào đảo. Nên phím và con trỏ
  bị chặn ở pha CAPTURE trên track (trước handler của RAC ở pha bubble) rồi đi qua MỘT hàm đặt giá
  trị. RAC vẫn giữ phần đắt nhất: trạng thái, `<input>` thật cho form và cho thao tác tăng/giảm của
  trình đọc màn hình, nhãn từng thumb, tiêu điểm, hover.

  **Vị trí là CSS logic, nên RTL và `reverse` không có nhánh mã thứ hai** — và điều đó sửa một lỗi
  im lặng: `.ui-slider-mark` xưa nay đặt `inset-inline-start` rồi `transform: translateX(-50%)`,
  mà ở RTL `inset-inline-start` đo từ mép phải còn `translateX` thì không lật, nên mọi nhãn marks
  lệch nguyên một bề rộng về sai phía. Nay marks/dots/bong bóng căn bằng **margin logic** hoặc bằng
  một neo rộng 0 với `justify-content: center` (một flex item tràn ra thì tràn đều hai bên, ở cả
  hai hướng đọc). Slider dọc (`orientation="vertical"`, `vertical`) lần đầu có CSS thật, kèm token
  `--slider-vertical-min-block-size` để nó không sập về 0 trong hộp không có chiều cao.

  **Hệ quả cần biết khi nâng cấp:**
  - `@radix-ui/react-slider` **biến mất khỏi `dependencies`** — consumer cài **5** gói Radix thay
    vì 6 (`check:radix-surface` đã re-baseline trong chính commit này).
  - `ref` nay là `HTMLDivElement` (Radix dựng `<span>`).
  - Slider `disabled` **không còn submit**: `<input disabled>` không vào FormData, còn input ẩn
    của Radix thì có. Thumb bị khoá nay cũng mờ đi — luật `--disabled-opacity` xưa nhắm
    `.ui-slider-thumb:disabled`, một selector không bao giờ khớp một `<span>`.
  - `onValueCommit` nay bắn **đúng một lần** cho mỗi phím (Radix bắn hai).
  - `range` giữ trong một biến boolean thì không dùng được `onChange` (kiểu union không biết trả
    số hay mảng) — dùng `onValueChange`, thứ luôn mang đủ mọi thumb.
  - KHÔNG port: `keyboard={false}` (gỡ thao tác bàn phím khỏi `role="slider"` là vi phạm WCAG
    2.1.1 — `parity-audit-data-entry.md` đã ghi WONT-PORT), `tooltip.getPopupContainer` (bong bóng
    nằm TRONG thumb, không portal, nên không có container để chọn), `classNames` / `styles` theo
    khe DOM (docs/WHAT-BELONGS-HERE.md xếp lỗ kiểu dáng tự do vào mục "không đáng"), và
    `focus()` / `blur()` trên ref.

### Removed

- **BREAKING — `ContextMenu`, `Menubar` và `NavigationMenu` bị xoá hẳn.** Ba component này là
  wrapper Radix mỏng và KHÔNG AI DÙNG: quét cả 9 kho đang phụ thuộc `@godxjp/ui`
  (admin-web-plan-047, godx-chat, godx-chat-sdk, godx-task, jovy-crm, mf, ql, tempo-admin,
  platform) — **0 tệp** import bất kỳ cái nào; trong chính kho này, thứ duy nhất import chúng là
  dòng re-export của `src/components/ui/index.tsx`. Đi theo chúng: 3 subpath export
  (`./ui/context-menu`, `./ui/menubar`, `./ui/navigation-menu`), **36 export** compound, 20 luật
  CSS trong `navigation-layout.css`, token `--navigation-menu-trigger-icon-size`, 3 entry catalog
  MCP, 3 trang docs, 5 tệp test và 3 gói `@radix-ui`.

  **Thay bằng gì.** Menu chuột phải: `DropdownMenu trigger={['contextMenu']}` — antd cũng không có
  component ContextMenu, nó diễn đạt đúng bằng giá trị này. Menubar: không có gì thay thế, và antd
  cũng không có thứ tương đương. Thanh menu NGANG: **chưa có gì** — nếu sau này cần, hình dạng để
  dựng là `Menu mode="horizontal"` của antd, và `overflowedIndicator` phải đi kèm ngay từ commit
  đầu (thiếu nó là lỗi WCAG 2.4.3 / 1.4.10, đúng thứ `NavigationMenu` đang thiếu khi bị xoá).

- **BREAKING — ba token `--menubar-*` đổi tên thành `--menu-*`**:
  `--menubar-item-hover-background` / `-foreground` → `--menu-item-hover-*`, và
  `--menubar-shortcut-font-size` → `--menu-shortcut-font-size`. Chúng chưa bao giờ là knob của
  riêng Menubar — `DropdownMenu` đọc đúng những token ấy cho hàng hover và cho phím tắt — tên cũ
  chỉ là di sản của component vừa bị xoá. Theme nào đang đặt tên cũ phải đổi; không kho consumer
  nào đang đặt chúng (đã quét).

- **BREAKING — `ScrollArea` bỏ `type` và `scrollHideDelay`, và `ScrollBar` không còn vẽ gì.**
  Cả hai prop là lịch trình HIỆN/ẨN của một thanh cuộn tự vẽ; thanh cuộn nay là của trình duyệt,
  nên không còn gì để lên lịch. `ScrollBar` vẫn export (không gãy biên dịch) nhưng trả `null`:
  trước đây GẮN nó là cách mở một trục, nay `orientation` là thứ duy nhất mở trục — một
  `<ScrollBar orientation="horizontal" />` còn sót lại sẽ IM LẶNG để trục ngang ở `hidden`, nên
  hãy đổi sang `orientation="both"`. Kèm theo: `ref` nay trỏ vào CHÍNH phần tử cuộn (trước nó trỏ
  vào gốc `overflow: hidden` không bao giờ cuộn — đó là lý do `viewportRef` ra đời; `viewportRef`
  vẫn còn và trỏ cùng một nút), thuộc tính nội bộ `[data-radix-scroll-area-viewport]` biến mất,
  và ba token thanh ray `--scroll-area-bar-size` / `-bar-padding` / `--scroll-area-thumb-radius`
  bị xoá — thay bằng `--scroll-area-scrollbar-width` (`thin`), `--scroll-area-thumb-color`,
  `--scroll-area-track-color`, `--scroll-area-scrollbar-space` (`scrollbar-gutter`).

### Added

- **`DropdownMenu` nhận `trigger` của Ant Design: `('click' | 'hover' | 'contextMenu')[]`**, mặc
  định `['click']` (antd mặc định `['hover']`; đổi mặc định sẽ biến mọi menu đang có thành thứ chỉ
  chuột mở được). `contextMenu` mở NGAY TẠI con trỏ và chặn menu của trình duyệt — đo trên
  Chromium: góc menu trùng con trỏ **0px theo cả hai trục** sau khi animation vào chỗ (đo giữa
  chừng animation sẽ thấy lệch đúng 8px của `slide-in-from-top-2`). Kèm theo là `disabled` (antd
  làm rỗng danh sách gesture), `mouseEnterDelay` (0.15) và `mouseLeaveDelay` (0.1) — tính bằng
  GIÂY như antd.

  **Bàn phím không bao giờ là nạn nhân của danh sách gesture.** `click`/`hover` giữ Enter / Space /
  ArrowDown; `contextMenu` được nối Shift+F10 và phím ContextMenu ngay trong component, vì
  react-aria trông chờ trình duyệt tự phát sự kiện `contextmenu` cho hai phím ấy — Windows/Linux
  có, macOS KHÔNG, nên nếu không nối thì trên Mac lối vào bằng bàn phím đơn giản là không tồn tại.
  Đây cũng là lý do ghi chú `trigger: ['hover'] = WONT-PORT` trong `docs/roadmap` (lập luận "hover
  là bẫy bàn phím") không còn đúng và đã được cập nhật.

  Một cái bẫy đã được đo và bịt: react-stately KHÔNG BAO GIỜ xoá `state.point`, nên sau một lần
  chuột phải, mọi lần mở bằng CLICK sau đó vẫn neo vào toạ độ con trỏ cũ. Nay điểm neo bị xoá ở
  pha CAPTURE của trigger, tức trước khi react-aria kịp mở menu ở pha bubble.

### Changed

- **`ScrollArea` viết lại trên nền cuộn NGUYÊN BẢN của trình duyệt, không còn Radix.** Ant Design
  không có ScrollArea vì antd để nền tảng cuộn; giờ đây cũng vậy: một phần tử `overflow: auto`,
  thanh cuộn tạo kiểu bằng `scrollbar-width` / `scrollbar-color` / `scrollbar-gutter` đọc từ
  token. Đo trên Chromium: `scrollbar-width: thin`, `scrollbar-color: rgb(215 212 209) /
transparent` — đúng `hsl(var(--border))` trên nền trong suốt.

  Gốc và viewport NHẬP LÀM MỘT, và chỗ tách đôi cũ là một lỗi thật: `.ui-cascader-list` /
  `.ui-tree-select-list` đặt `max-block-size` lên GỐC còn viewport đọc `height: 100%` — phần trăm
  trên chiều cao không xác định thì hoá `auto`, nên ruột tràn khỏi cái gốc `overflow: hidden` và bị
  CẮT thay vì cuộn. Luật `display: block !important` (bản vá cho `display: table` mà Radix ghi
  inline) cũng biến mất cùng Radix.

  Bốn chỗ dùng nội bộ đều đã đo lại trong trình duyệt thật: `ChatBubbleList` bám đáy lúc mở
  (scrollTop 244 = đáy 244) và KHÔNG kéo người đọc về khi có tin mới trong lúc họ đang đọc lịch sử
  (scrollTop giữ nguyên 0, nút "về tin mới nhất" hiện ra); `Transfer` cuộn dọc (hộp 120px / nội
  dung 618px); `TreeSelect` cuộn dọc (300px / 1010px); `Cascader` đổi sang `orientation="both"` và
  cuộn ngang được (dải cột 288px trong hộp 200px). Lưu ý nền tảng: macOS vẽ thanh cuộn dạng
  OVERLAY nên nó không chiếm chỗ trong bố cục và chỉ hiện lúc cuộn — thanh ray tự vẽ ngày trước
  hiện khi rê chuột trên mọi hệ điều hành.

- **`Select` rời `@radix-ui/react-select`, sang `react-aria-components`.** API công khai giữ NGUYÊN
  VĂN — `value` / `defaultValue` / `onValueChange`, `open`, `name`, `<SelectTrigger id>`,
  `<SelectValue placeholder>` — và component tự dịch sang cách viết của react-aria. Bộ kiểm đối
  chiếu chạy MỌI hình dạng đo được ở consumer (godx-task 17 tệp, ql 5) trên CẢ HAI nền: bản Radix
  chép nguyên văn ở `__tests__/radix-select.fixture.tsx` và bản đang phát hành. Nó được viết và chạy
  xanh TRƯỚC khi đổi nền, nên một ca đỏ sau đó nghĩa là consumer vỡ, không phải phép kiểm viết theo
  cách làm mới.

  Ba mặc định của react-aria bị ghi đè để giữ đúng hành vi Radix, mỗi cái đều có số đo:

  1. **Tên của trigger.** `useSelect` luôn ghi `aria-labelledby="<id ô giá trị> …"`, tức trigger bị
     đặt tên theo GIÁ TRỊ của nó, và một `<label htmlFor>` bên ngoài bị chôn mất — đúng cách 17 tệp
     godx-task và 283 truy vấn `getByRole("combobox", { name })` trong kho đang đặt tên. `ButtonContext`
     được cấp lại KHÔNG có `aria-labelledby`.
  2. **Vai trò.** react-aria dựng `<button aria-haspopup="listbox">`; Radix dựng `role="combobox"`,
     thứ mà test trình duyệt của ql đếm. Đặt qua `render`, nên nó có sẵn trong HTML SSR chứ không
     phải `setAttribute` sau hydrate.
  3. **Hộp thoại.** Popover modal của react-aria tự nhận `role="dialog"`; một listbox không phải một
     hộp thoại — cùng cách gỡ, cùng lý do như `dropdown-menu.tsx`.

  **Tiêu điểm lúc đóng** phải sửa tay: react-aria cố ý KHÔNG lấy tiêu điểm cho trigger bị bấm bằng
  CHUỘT, nên vùng tiêu điểm của nó ghi nhớ `<body>` và Escape ném người dùng lên đầu tài liệu. Nay
  trigger nhận tiêu điểm ở `pointerdown` (đúng việc Radix làm), kèm một phép kiểm hoãn một nhịp chỉ
  khôi phục khi tiêu điểm thật sự rơi về `<body>`. Cách thử đầu tiên — lật `preventFocusOnPress` —
  là SAI và đã bị bỏ: nó làm popup không mở được nữa (đo được: 34 test đỏ).

  Những chỗ DOM của react-aria khác thật sự, và test đã đổi theo (không phải đổi cho vừa nền mới):
  text của option nay còn nằm trong `<select>` native ẩn mà react-aria dựng cho autofill, nên bốn
  truy vấn `getByText` chuyển sang `getByRole("option")`; cái kẹp của gh#105 không còn gì để bắt vì
  fallback ấy là `position: fixed` và bị cắt còn 1px; sàn bề rộng popup chuyển từ một class utility
  của Radix sang `.ui-select-content` đọc `--trigger-width` của react-aria.

  `SelectScrollUpButton` / `SelectScrollDownButton` vẫn được export nhưng **không vẽ gì** (`@deprecated`):
  listbox của react-aria là vùng cuộn native, không có hai nút ấy. Cổng trình duyệt
  `check:data-entry-frame-runtime` nay đo đúng tính chất mà hai nút kia từng đại diện — danh sách có
  tràn thật và cuộn được thật — thay vì đòi hai khe DOM đã biến mất.

  `@radix-ui/react-select` chuyển sang `devDependencies` (chỉ test đối chiếu còn import), và
  `check:radix-surface` được chốt lại trong cùng commit: consumer cài **5** gói Radix thay vì 6.

### Added

- **`Select` bám sát Ant Design 6.** Một danh sách duy nhất dù call site viết kiểu nào: hàng phẳng,
  GROUP lồng của antd (`{ label, options }`), hay payload lạ đọc qua `fieldNames` — tất cả chuẩn hoá
  ở `src/lib/select-options.ts`, nên nhánh listbox thường và nhánh có tìm kiếm không thể hiểu khác
  nhau về "một option là gì".

  Thêm mới, mỗi prop một phép kiểm, và có mặt ở CẢ HAI nhánh khi prop ấy có nghĩa ở đó: `fieldNames`
  · group lồng trong `options` · `labelInValue` · `prefix` · `suffixIcon` (`null` gỡ hẳn chỉ báo) ·
  `placement` · `popupRender` · `listHeight` · `onPopupScroll` · `optionFilterProp` · `labelRender`
  cho listbox thường · dạng OBJECT của `showSearch` (`filterOption` — cả `false` lẫn thứ tự tham số
  `(input, option)` của antd — `optionFilterProp`, `filterSort`, `searchValue`, `onSearch`,
  `autoClearSearchValue`) · `mode="tags"` · `tokenSeparators` · `maxTagTextLength` · `tagRender`.

  **Chip trên trigger nhiều giá trị nay gỡ được từng cái.** Trigger của `mode="multiple"` /
  `"tags"` đổi từ `<button>` sang `<div role="combobox">`, vì nút ✕ trên chip là một `<button>` thật
  và `<button>` lồng trong `<button>` là HTML không hợp lệ — đó mới là lý do `tagRender` từng bị từ
  chối, không phải khẩu vị. `combobox` không phải vai trò "children presentational" (ARIA 1.2), nên
  nút bên trong hợp lệ và người dùng bàn phím Tab tới được từng ✕; Backspace trên trigger bỏ chip
  cuối. Trigger một giá trị vẫn là `<button>` như cũ.

  Một chỗ đáng nhớ: một run được DÁN vào thì đọc từ CLIPBOARD chứ không đọc từ ô nhập —
  `<input>` một dòng cắt CR/LF theo đúng thuật toán "value sanitization" của HTML, nên dấu tách
  `"\n"` không bao giờ sống sót để mà tách (đo được: `"a,b\nc"` tới nơi thành `"a,b"` + `"c"` dính
  liền). `TagInput` đọc clipboard vì đúng lý do đó, và nay cả hai tách bằng chung một
  `splitByTokenSeparators`.

  `placement` viết theo trục LOGIC (`bottomStart` / `topEnd`) — đúng ngoại lệ mà
  `docs/DESIGN-AUTHORITY.md` cho phép trước cách viết vật lý của antd. **`onChange` KHÔNG được thêm**:
  `onValueChange(value, option)` đã đúng chữ ký của antd, và một cách viết thứ hai cho cùng một trục
  chính là thứ `check:prop-vocabulary` sinh ra để chặn.

- **Manifest API nay nhìn thấy component có props kiểu HỢP (union).** `getPropertiesOfType` trên một
  union chỉ trả về phần GIAO, nên toàn bộ nửa data-driven của `Select` — `options`, `loadOptions`,
  `showSearch` và mọi prop antd treo trên đó — vắng mặt khỏi `component-api-manifest.json`, mà vắng
  mặt thì agent đọc thành "không tồn tại" (đúng lớp lỗi `pad`/`padRaw` trong `WHAT-BELONGS-HERE.md`).
  Generator nay duyệt từng nhánh của union rồi gộp: `Select` từ 16 prop lên **74**, và
  `check:doc-prop-existence` từ đây CHẤM được `Select` thay vì bỏ qua nó như một component bọc thư
  viện ngoài.

- **`Slider` rời `@radix-ui/react-slider`, sang `react-aria-components`, và mang API của antd 6.**
  Cùng nước đi đã làm với `Switch`, `Segmented`, `Radio` (#465). Hình dạng DOM đổi đúng theo cách
  đó: phần tử nhận tiêu điểm không còn là phần tử được tô.

  ```
  Radix:  <span role="slider" class="ui-slider-thumb" aria-valuenow="40">
  RAC:    <div class="ui-slider-thumb"><input type="range" value="40"></div>
  ```

  Giá trị nay là giá trị NATIVE của một `<input type="range">` (vai trò slider ngầm định), không
  còn là `aria-valuenow` viết tay — ARIA in HTML bảo đừng lặp lại thuộc tính native, và
  `getByRole("slider", { value: { now } })` của Testing Library chỉ đọc thuộc tính ARIA nên sẽ coi
  mọi slider native là "không có giá trị". Test trong kho đọc qua `slider-test-utils` (ARIA trước,
  native sau) — **14 ca hợp đồng thời Radix được viết và chạy XANH trên nền Radix TRƯỚC khi đổi**,
  rồi giữ nguyên chữ: `number[]` + `onValueChange` / `onValueCommit`, `min`/`max`/`step`,
  `disabled`, `orientation`, `dir`, `inverted`, `reverse`, `minStepsBetweenThumbs`, `marks`,
  `tooltip`, `name` → `name[]`, PageUp/PageDown và Shift+Arrow = 10 bước, một thumb ở `min` khi
  không truyền gì, và tên thumb từ `FormField` / `aria-labelledby`.

  **Thêm theo antd 6** (mỗi thứ một test): `value` / `defaultValue` là SỐ (mảng vẫn chạy);
  `onChange` / `onChangeComplete` (payload đi theo `range`: số khi không khai, mảng khi có);
  `step={null}` — chỉ dừng ở marks, `min`, `max`, cả bằng con trỏ (gần nhất) lẫn bằng phím (mark
  kế tiếp); `marks` dạng `{ style, label }`; `dots` theo marks khi `step={null}`; `range` dạng
  object — `editable` (bấm lên rail THÊM thumb, Delete/Backspace bớt, giữa `minCount` và
  `maxCount`), `draggableTrack` (kéo cả vệt, giữ nguyên khoảng cách); `vertical`; `disabled` dạng
  mảng cho từng thumb; `tooltip` với `open` / `placement` / `autoAdjustOverflow` / `formatter`.
  `tooltip.formatter` nay còn là **`aria-valuetext`** — mục P1 trong `docs/roadmap/
parity-audit-data-entry.md`: một slider ¥/%/件 trước đây đọc lên đúng một con số trần.

  **Hình học nằm ở thư viện này, không ở RAC, và đó là một quyết định có số.** RAC không có
  `reverse`/`inverted` (Radix có, antd có, và nó là API công khai của component này), không có
  `minStepsBetweenThumbs`, không có `step={null}`, và `pageSize` của nó là `(max − min)/10` chứ
  không phải 10 bước: với `min=0 max=10 step=2`, PageUp thời Radix nhảy **10**, RAC nhảy **2**.
  Mọi đường nhập của RAC suy ra hướng từ `useLocale()` và không có chỗ nào đảo. Nên phím và con trỏ
  bị chặn ở pha CAPTURE trên track (trước handler của RAC ở pha bubble) rồi đi qua MỘT hàm đặt giá
  trị. RAC vẫn giữ phần đắt nhất: trạng thái, `<input>` thật cho form và cho thao tác tăng/giảm của
  trình đọc màn hình, nhãn từng thumb, tiêu điểm, hover.

  **Vị trí là CSS logic, nên RTL và `reverse` không có nhánh mã thứ hai** — và điều đó sửa một lỗi
  im lặng: `.ui-slider-mark` xưa nay đặt `inset-inline-start` rồi `transform: translateX(-50%)`,
  mà ở RTL `inset-inline-start` đo từ mép phải còn `translateX` thì không lật, nên mọi nhãn marks
  lệch nguyên một bề rộng về sai phía. Nay marks/dots/bong bóng căn bằng **margin logic** hoặc bằng
  một neo rộng 0 với `justify-content: center` (một flex item tràn ra thì tràn đều hai bên, ở cả
  hai hướng đọc). Slider dọc (`orientation="vertical"`, `vertical`) lần đầu có CSS thật, kèm token
  `--slider-vertical-min-block-size` để nó không sập về 0 trong hộp không có chiều cao.

  **Hệ quả cần biết khi nâng cấp:**
  - `@radix-ui/react-slider` **biến mất khỏi `dependencies`** — consumer cài **5** gói Radix thay
    vì 6 (`check:radix-surface` đã re-baseline trong chính commit này).
  - `ref` nay là `HTMLDivElement` (Radix dựng `<span>`).
  - Slider `disabled` **không còn submit**: `<input disabled>` không vào FormData, còn input ẩn
    của Radix thì có. Thumb bị khoá nay cũng mờ đi — luật `--disabled-opacity` xưa nhắm
    `.ui-slider-thumb:disabled`, một selector không bao giờ khớp một `<span>`.
  - `onValueCommit` nay bắn **đúng một lần** cho mỗi phím (Radix bắn hai).
  - `range` giữ trong một biến boolean thì không dùng được `onChange` (kiểu union không biết trả
    số hay mảng) — dùng `onValueChange`, thứ luôn mang đủ mọi thumb.
  - KHÔNG port: `keyboard={false}` (gỡ thao tác bàn phím khỏi `role="slider"` là vi phạm WCAG
    2.1.1 — `parity-audit-data-entry.md` đã ghi WONT-PORT), `tooltip.getPopupContainer` (bong bóng
    nằm TRONG thumb, không portal, nên không có container để chọn), `classNames` / `styles` theo
    khe DOM (docs/WHAT-BELONGS-HERE.md xếp lỗ kiểu dáng tự do vào mục "không đáng"), và
    `focus()` / `blur()` trên ref.

### Added

- **`Select` bám sát Ant Design 6.** Một danh sách duy nhất dù call site viết kiểu nào: hàng phẳng,
  GROUP lồng của antd (`{ label, options }`), hay payload lạ đọc qua `fieldNames` — tất cả chuẩn hoá
  ở `src/lib/select-options.ts`, nên nhánh listbox thường và nhánh có tìm kiếm không thể hiểu khác
  nhau về "một option là gì".

  Thêm mới, mỗi prop một phép kiểm, và có mặt ở CẢ HAI nhánh khi prop ấy có nghĩa ở đó: `fieldNames`
  · group lồng trong `options` · `labelInValue` · `prefix` · `suffixIcon` (`null` gỡ hẳn chỉ báo) ·
  `placement` · `popupRender` · `listHeight` · `onPopupScroll` · `optionFilterProp` · `labelRender`
  cho listbox thường · dạng OBJECT của `showSearch` (`filterOption` — cả `false` lẫn thứ tự tham số
  `(input, option)` của antd — `optionFilterProp`, `filterSort`, `searchValue`, `onSearch`,
  `autoClearSearchValue`) · `mode="tags"` · `tokenSeparators` · `maxTagTextLength` · `tagRender`.

  **Chip trên trigger nhiều giá trị nay gỡ được từng cái.** Trigger của `mode="multiple"` /
  `"tags"` đổi từ `<button>` sang `<div role="combobox">`, vì nút ✕ trên chip là một `<button>` thật
  và `<button>` lồng trong `<button>` là HTML không hợp lệ — đó mới là lý do `tagRender` từng bị từ
  chối, không phải khẩu vị. `combobox` không phải vai trò "children presentational" (ARIA 1.2), nên
  nút bên trong hợp lệ và người dùng bàn phím Tab tới được từng ✕; Backspace trên trigger bỏ chip
  cuối. Trigger một giá trị vẫn là `<button>` như cũ.

  Một chỗ đáng nhớ: một run được DÁN vào thì đọc từ CLIPBOARD chứ không đọc từ ô nhập —
  `<input>` một dòng cắt CR/LF theo đúng thuật toán "value sanitization" của HTML, nên dấu tách
  `"\n"` không bao giờ sống sót để mà tách (đo được: `"a,b\nc"` tới nơi thành `"a,b"` + `"c"` dính
  liền). `TagInput` đọc clipboard vì đúng lý do đó, và nay cả hai tách bằng chung một
  `splitByTokenSeparators`.

  `placement` viết theo trục LOGIC (`bottomStart` / `topEnd`) — đúng ngoại lệ mà
  `docs/DESIGN-AUTHORITY.md` cho phép trước cách viết vật lý của antd. **`onChange` KHÔNG được thêm**:
  `onValueChange(value, option)` đã đúng chữ ký của antd, và một cách viết thứ hai cho cùng một trục
  chính là thứ `check:prop-vocabulary` sinh ra để chặn.

- **Manifest API nay nhìn thấy component có props kiểu HỢP (union).** `getPropertiesOfType` trên một
  union chỉ trả về phần GIAO, nên toàn bộ nửa data-driven của `Select` — `options`, `loadOptions`,
  `showSearch` và mọi prop antd treo trên đó — vắng mặt khỏi `component-api-manifest.json`, mà vắng
  mặt thì agent đọc thành "không tồn tại" (đúng lớp lỗi `pad`/`padRaw` trong `WHAT-BELONGS-HERE.md`).
  Generator nay duyệt từng nhánh của union rồi gộp: `Select` từ 16 prop lên **74**, và
  `check:doc-prop-existence` từ đây CHẤM được `Select` thay vì bỏ qua nó như một component bọc thư
  viện ngoài.

### Fixed

- **Ô chọn nay NHẬN được con trỏ ở đúng chỗ nó được vẽ.** `react-aria-components` vẽ control lên
  thẻ `<label>` và giấu `<input>` thật trong một span `VisuallyHidden` — 1px, bị cắt, ghim ở góc
  trên-trái của label — và hình học ấy là style NỘI TUYẾN. Nên mọi cú chạm vào ô vuông rơi vào
  label, còn vùng nhận sự kiện của input là một ô 13×13 ở một gốc toạ độ khác hẳn ô 16×16 trên màn
  hình. Đo trên `data-entry-checkbox` trước bản sửa: quét 49 điểm trên chính ô ấy, **0** điểm chạm
  tới input và 46 điểm chạm label; `check()` / `uncheck()` không `force` hết giờ với
  `<label data-slot="checkbox"> intercepts pointer events`. `force: true` thì qua — đúng dấu hiệu
  "control vẫn chạy, chỉ bị che", và cũng là lý do một bộ e2e vá bằng `force` giữ được CI xanh
  trong khi người dùng vẫn bấm vào ô mà không thấy gì xảy ra.

  Style nội tuyến chỉ `!important` mới thắng, nên thay vì đánh nhau với nó, **cái span ấy được
  thay**: prop `render` trao lại đúng cây DOM mà react-aria dựng, và `withOwnHitTarget`
  (`choice-hit-target.tsx`) đổi phần tử `VisuallyHidden` trong đó thành
  `<span class="ui-choice-input">` mà `control.css` trải kín ô. Bản thân `<input>` — props, ref,
  bàn phím, chỗ đứng trong cây a11y — không đổi một chữ. Áp cho `Checkbox`, `Radio` (cả thanh
  `optionType="button"`), `Switch` và `Segmented`, vì cả bốn dựng trên cùng bộ phận ấy.

  Sau bản sửa: input **14×14 đồng tâm trong ô 16×16** (switch 32×16 trong 36×20, segment phủ kín
  36×28), **936/936** điểm quét bên trong viền chạm tới input trên 26 checkbox của frame,
  `check()` / `uncheck()` không `force` trả về ngay, click chuột thật ở tâm VÀ ở vành viền đều lật
  đúng MỘT lần, Space vẫn lật, `data-focus-visible` vẫn nằm trên ô được vẽ. Ảnh chụp 12 control
  trước/sau: **11 giống nhau từng byte**, 1 (switch đang disabled) lệch tối đa **2/255** trên một
  kênh — làm tròn khi hợp nhất lớp dưới `opacity: .5`, không phải thay đổi thị giác.

  Cổng mới `check:choice-hit-target` (lane `ci-browser-full`, shard `interaction-semantics`) quét
  lưới, gọi `check()` / `uncheck()` không `force`, click chuột thật và gõ phím trên bốn frame,
  LTR và RTL. Đột biến: gỡ bản sửa → đỏ với **552 lỗi**, mở đầu bằng `input is off-centre by 6,6`.
  Kèm một test jsdom ghim CẤU TRÚC mà bản sửa dựa vào (input nằm trong `.ui-choice-input`, không
  mang style nội tuyến), để một bản nâng cấp react-aria đổi cây DOM sẽ đỏ chứ không im lặng.

- **Nhãn của `FormField` nay trỏ vào ĐÚNG cái id mà control đang mang.** Bản sao `cloneElement`
  luôn ưu tiên `id` của chính control — ghi đè nó sẽ làm hỏng một control tự đặt tên cho mình —
  nhưng handler click của nhãn lại tra `id` CỦA FIELD. Hai bên chỉ cần khác nhau một lần là nhãn
  không còn trỏ vào đâu nữa: với `<FormField label="認証コード"><InputOTP id="email-otp" …/></FormField>`
  — đúng hình dạng gh#477 mô tả — bấm vào nhãn xong `document.activeElement` vẫn là `<body>` (đo
  trên Chromium, frame `data-entry-input-otp`). Nay chỉ còn MỘT id, đọc một lần
  (`childProps.id ?? resolvedId`); cùng phép đo sau bản sửa trả về **`INPUT#email-otp`**. Đây là
  lỗi TIẾP CẬN độc lập với mọi test: nhãn không đưa được tiêu điểm, và nó không nằm ở riêng
  `InputOTP` — mọi control tự mang `id` đều dính.

- **`InputOTP` bỏ `style` khỏi kiểu, vì đó là prop DUY NHẤT nó không thể chuyển tiếp.** `input-otp`
  tự viết style của ô nhập và THAY THẾ hẳn thứ được truyền vào (đo: `style={{ color: "red" }}` để
  lại đúng `color: transparent` của thư viện), còn style của container thì hard-code — nên kiểu dữ
  liệu đang hứa một điều bản render không bao giờ giao. Nay trình biên dịch nói "không" thay vì
  render im lặng nuốt mất; phần tô của field vẫn tới được qua `className` / `containerClassName`
  và các token `--otp-*`.

  Còn `id` — thứ issue báo là "nhận trong kiểu rồi không render" — thì **vẫn luôn tới DOM**:
  `...props` đi thẳng vào `OTPInput`, và `input-otp` trải phần rest lên chính `<input>`. Đo lại
  trên `main` (và đọc lại bản dựng `20.2.1` mà consumer đang chạy, cùng một đường):
  `document.querySelector("#code")` trả về đúng ô nhập, `getByLabelText` tìm ra nó, tên khả truy
  cập đọc lên là `textbox "認証コード"`. Việc catalog MCP không liệt kê `id` cũng không nói lên điều
  gì: manifest chỉ chở prop kế thừa mang HÀNH VI (`inheritedBehavioralProps`), nên không một
  component nào trong 296 export có `id` trong danh sách. Một test mới đi qua từng prop còn lại —
  `id`, `name`, `title`, `dir`, `autoComplete`, `data-*`, `aria-describedby` — và đòi chúng có mặt
  trên `<input>`. Đột biến: gỡ bản sửa → 2 test đỏ, và `typecheck` đỏ với
  `TS2578: Unused '@ts-expect-error' directive`.

- **Dưới 900px, mọi trạng thái của `AppShell` mới thật sự về MỘT cột.** Bản reset một cột trong
  `@media (width <= 56.25rem)` liệt kê NĂM selector cho một ma trận BA MƯƠI trạng thái, và nó thua
  về độ đặc hiệu ngay ở trạng thái đầu tiên nó bỏ sót: `.app-root[data-topbar-span="full"]` không
  có trong danh sách, nên template hai vùng của bề ngang lớn sống sót xuống dưới breakpoint trong
  khi reset chỉ khai MỘT track — `main` rơi vào một track ngầm `auto` và co theo nội dung. Consumer
  (`godx-jp/id`) đo được **`main` 170px trong khung 720px**, các nút hành động của trang nằm ngoài
  mép phải. Mọi trạng thái có nav rail còn hỏng nặng hơn vì đúng lý do ấy:
  `[data-nav-rail][data-nav-rail-position="start"]` là (0,3,0), còn `[data-nav-rail]` của reset chỉ
  là (0,2,0).

  Nay mọi template NHIỀU cột nằm trong `@media (width > 56.25rem)`, nên bản reset không còn phải
  tranh đặc hiệu với ai và rút về đúng một selector `.app-root` — một trạng thái chưa ai nghĩ ra
  cũng vẫn rơi vào một cột. Đo trên frame mới `layout-app-shell-states` (MỘT AppShell mỗi URL):
  trước **178 lỗi, 44/60 cặp trạng thái × hướng** ở 320/390/720/900px; sau **0**. Ảnh chụp
  `grid-template-*` của 300 cặp trạng thái × bề ngang cho thấy phía rộng và chế độ
  `responsiveNavigation="docked"` KHÔNG đổi, trừ đúng một ô ma trận được sửa kèm: `sidebar="none"` +
  rail `bottom` + `topbarSpan="full"` chưa từng có luật `grid-template-areas` (bản `top` thì có),
  nên ở 1280px `main` là **579px tại x=701** và rail tràn 40px ra ngoài; nay `main` là **1280px tại
  x=0**.

  Cổng mới `check:app-shell-narrow-grid` (lane `ci-browser-full`, shard `interaction-semantics`) đi
  hết 30 trạng thái × LTR/RTL: ở 320/390/720/900px lưới phải còn đúng MỘT cột, `main` phải phủ kín
  bề ngang, trang không cuộn ngang và không phần tử nào nằm ngoài hai mép; ở 1280px số track của
  từng trạng thái phải giữ nguyên. Đột biến: trả CSS về bản cũ → đỏ ngay ở
  `ltr topbarSpan=full @720: 2 columns (156.609px 563.391px); main 563px at x=157`.

- **`AppDateFormat` có `ymd` (`yyyy/MM/dd`), và `ja` mặc định là nó.** Trục này xưa nay có ba giá
  trị và KHÔNG giá trị nào viết ra `2026/05/01`: `iso` dùng gạch ngang, hai dạng gạch chéo còn lại
  đặt ngày hoặc tháng lên trước. Một chứng từ nghiệp vụ Nhật (請求書, 申請書) viết `YYYY/MM/DD`,
  không bao giờ `YYYY-MM-DD`. Hệ quả đo được ở consumer: gino-cloud phải tự viết formatter ngày và
  ghi rõ đó là VÁ TẠM — tức chính luật số 1 của `docs/DATETIME.md` ("không bao giờ dùng
  `date-fns/format`, `toLocaleString`, hay cắt chuỗi ISO cho UI") bị phá bởi chính mặc định của gói
  này. Đây là dấu hiệu một TRỤC CÓ TÊN thiếu một giá trị, không phải consumer đòi thứ kỳ lạ: mọi
  nước đi còn lại đều bị chính tài liệu của gói cấm.

  CHỈ MẶC ĐỊNH DỊCH CHUYỂN. Lựa chọn đã lưu vẫn thắng (một người đã chọn `iso` giữ nguyên `iso` qua
  bản nâng cấp), `defaultDateFormat` vẫn ghim được bất kỳ giá trị nào, và `iso` vẫn nằm ngay trong
  `<DateFormatPicker />`. `ymd` xếp cạnh `iso` vì nó là dạng năm-trước còn lại.

  LƯU Ý CHO BACKEND: lựa chọn được gửi lên bằng header `x-date-format`, nên một backend đang
  whitelist `iso|dmy|mdy` sẽ thấy giá trị mới `ymd`.

  Nhãn cho ja/en/vi, cập nhật `docs/DATETIME.md` và catalog MCP (`defaultDateFormat`). `isAppDateFormat`
  nay đọc `APP_DATE_FORMATS` thay vì lặp lại union — một giá trị thêm vào danh sách mà quên guard sẽ
  bị loại khỏi storage rồi âm thầm reset. Test mới `date-format-ja-business.test.tsx` đi đầu-đến-cuối
  (bảng pattern + mặc định theo locale + `formatDate`), vì cả ba đều xanh riêng lẻ trong khi app vẫn
  in ra gạch ngang. Đột biến: trả `ja → iso` → đỏ 2; bỏ nhánh `ymd` khỏi bảng pattern (nó rơi vào
  `default:` nên KHÔNG ném lỗi, chỉ lặng lẽ in ra ISO) → đỏ 5.

### Fixed

- **`Segmented` 4 择 tràn ở 393px: KHÔNG tái hiện được trên `dev` — đã sửa từ #480, consumer phải
  nâng phiên bản.** Dựng lại đúng bố cục consumer báo (gino-cloud, màn 書類 · tab 書類様式 · bộ lọc
  制度): 4 lựa chọn, mỗi nhãn kèm `Badge as="span"` đếm số, nhãn 「すべて 133」「技能実習 82」
  「特定技能 51」「育成就労 0」, nằm trong `Flex gap="sm" align="center" wrap` → `CardContent` →
  `Card`, không có `ScrollArea`. Đo trên Chromium ở 320 / 360 / 393 / 412 / 768px, LTR và RTL: **0
  tràn, 0 cắt chữ, 0 cắt badge, trang không cuộn ngang** — trên `dev` track xuống 2 hàng và vừa khít.

  Bằng chứng cho chiều ngược lại, để "đã sửa rồi" không phải lời nói suông: gỡ đúng một dòng
  `flex-wrap: wrap` mà #480 thêm (tức trạng thái 20.2.1) rồi đo lại CÙNG bố cục ấy — ở **393px cả
  bốn nhãn bị cắt** và badge cuối **tràn 11,61px** khỏi track (consumer báo 11,8px và 2,6px; hai
  luật họ nêu, `label-truncated` và `text-edge-inset`, khớp cả hai). Ở 320px là 29,16px, 360px là
  19,55px.

  Điều đáng làm còn lại: giả thuyết "hàng `Flex wrap` mới là nguyên nhân" hợp lý đủ để đáng ĐO chứ
  không đáng suy luận, nên bố cục ấy nay là một frame thật —
  `docs/data-entry/segmented-in-filter-row.tsx` — và `check:segmented-wrap` chạy cả hai frame ở bốn
  bề rộng × hai chiều. (Nó KHÔNG phải nguyên nhân: bỏ `flex-wrap`, hộp khối và flex item hỏng y hệt
  nhau.) Đột biến: bỏ `flex-wrap: wrap`, chạy riêng frame mới → đỏ với đúng bốn nhãn bị cắt.

- **Hai nút bước của `NumberInput` chỉ cao 13px — dưới sàn 24×24 của WCAG 2.2 SC 2.5.8.** Đo trên
  Chromium (Playwright, `(pointer: coarse)` khớp): chuột — mặc định **24×13**, `lg` 24×15, `sm`
  24×11, `xs` 24×9; CẢM ỨNG — mặc định **24×19**, `lg` 24×21, tâm cách nhau 20/22px. Không cái nào
  đạt 24×24, và ngoại lệ Spacing của SC 2.5.8 cũng không cứu được: nó đòi hai đường tròn đường kính
  24px đặt tâm ở mỗi hộp KHÔNG giao nhau, mà cách 20px thì giao.

  Hai nút xếp CHỒNG trong ô, nên mỗi nút chỉ bằng nửa dải cao của control — 44px thì nửa là 22px,
  sửa kiểu gì cũng không tới 24. 48px thì tới đúng: bỏ khoảng thụt trang trí và khe 1px, nửa của 48
  là 24. Nên trên con trỏ thô, NumberInput lấy dải cao hơn một bậc qua token mới
  `--number-input-touch-height` (`--band-height-2xl`). Đo lại: cảm ứng, mặc định **24×19 → 24×24**
  (ô 44 → 48px), `lg` 24×21 → **24×24** (ô vốn đã 48px). `xs`/`sm` giữ nguyên dải người dùng chọn
  (15→18, 17→20): một consumer cố ý chọn control nhỏ trên màn cảm ứng là quyết định của họ, DS
  không lật.

  KHÔNG áp trên con trỏ tinh, và lý do được ghi lại chứ không mặc định: 24×13 trên desktop cũng
  dưới chuẩn, nhưng CÙNG chức năng có trên một control thừa sức đạt chuẩn — chính cái ô (cao 32px,
  rộng hết hàng) nhận ArrowUp/ArrowDown và nhận giá trị gõ vào. Kéo mọi NumberInput desktop lên
  48px để nhân đôi một affordance đã có đường đạt chuẩn là thay đổi lớn hơn thứ nó sửa.

  Cổng mới `check:number-input-step-target` (Chromium, shard `interaction-semantics`) đo cả hai loại
  con trỏ, xác nhận `(pointer: coarse)` thực sự khớp trước khi đo, và canh CẢ chiều ngược lại — hình
  học desktop không được nhúc nhích. Đột biến: hạ token về `--band-height-xl` → đỏ 2 (24×22); bỏ
  `@media (pointer: coarse)` → desktop nhảy lên 24×24 → đỏ 1.

- **Chữ phụ trợ của `FormField` ngắt dòng giữa từ tiếng Nhật.** Ngắt dòng CJK mặc định cho phép
  ngắt giữa gần như hai ký tự bất kỳ, nên một dòng helper tiếng Nhật bị cắt giữa từ ở gần như mọi
  bề rộng. Đo trên Chromium ở `/isolate/data-entry-form-field-index`, một helper ở bề rộng cột
  biểu mẫu, so từng ký tự:

  - 180px: mặc định 「監査報告は省令様式第8号で提｜出してください」 → `auto-phrase` 「…第8号で｜提出してください」
  - 220px: mặc định 「…第8号で提出してく｜ださい」 → `auto-phrase` 「…第8号で｜提出してください」
  - 120px: mặc định 「監査報告は省令様式｜第8号で提出してくだ｜さい」 → `auto-phrase` 「監査報告は｜省令様式第8号で｜提出してください」

  Helper và error nay mang class `ui-form-field-note` với `word-break: auto-phrase`. Chữ Latin không
  đổi (vẫn ngắt ở dấu cách — đo: "Attach the ministerial form before ｜ submitting the audit
  report."), và trình duyệt không biết giá trị này thì bỏ qua, giữ nguyên cách ngắt hôm nay.

  NÓI RÕ CÁI NÓ KHÔNG LÀM, vì số đo nói vậy chứ không phải tài liệu mong vậy: nó KHÔNG bảo đảm một
  thuật ngữ nghiệp vụ còn nguyên. Ở 140px `auto-phrase` vẫn tách 「省令様式第｜8号」, và ở 120px nó
  tách 「特定技能｜1号評価試験」 trong khi mặc định lại giữ nguyên. Một từ ghép là sự thật của NỘI
  DUNG; không thuộc tính nào đặt trên cả đoạn văn biết nó bắt đầu ở đâu. Cái thu được là: trường
  hợp THÔNG THƯỜNG thôi ngắt giữa từ, ở mọi bề rộng, cho mọi consumer.

  Test `form-field-note-breaking.test.tsx` ghim khai báo và ghim class có trên CẢ hai `<p>` (chúng
  dựng ở hai nhánh khác nhau của cùng một component — đúng chỗ một cái được style còn cái kia
  không). Cố ý KHÔNG ghim vị trí dòng: đó là bộ tách 文節 của trình duyệt, đổi theo phiên bản
  Chrome, và một cổng canh nó là cổng canh tệp dữ liệu của người khác. Đột biến: đổi khai báo về
  `normal` → đỏ 1; bỏ class khỏi node lỗi → đỏ 2.

- **Ô vòng đời của `DataTable` để nội dung của consumer dính sát mép bảng.** Ô chứa `empty` /
  `denied` / `error` có `padding: 0`, với lý do "`EmptyState` dựng sẵn đã tự mang đệm" — đúng với
  bản dựng sẵn, và sai với mọi hình dạng khác mà ba prop ấy nhận: cả ba đều nhận `ReactNode`, và
  `empty` thường được truyền thẳng một chuỗi. Đo trên Chromium ở
  `/isolate/data-display-data-table-index`: nút văn bản đầu tiên của một node lỗi do story tự
  truyền nằm cách mép trong của ô **0,00px**, trong khi `EmptyState` dựng sẵn ngay bên cạnh nằm ở
  **24px**; `empty="まだ登録がありません"` đo được **0/4,97px**. Consumer báo đúng hiện tượng này.

  Đệm nay nằm trên chính Ô — nơi nó áp cho MỌI hình dạng — và `EmptyState` dựng sẵn bỏ đệm riêng
  bên trong ô ấy để hai cái không cộng dồn. Số đo là số đo cũ của `EmptyState`, không phải con số
  mới: trạng thái dựng sẵn phải rơi đúng pixel cũ, và nó rơi đúng (**552,2/40,5px** trước và sau).
  Sau khi sửa, chuỗi trần và node của consumer cùng ở **24/40,5px**.

  Cổng mới `check:data-table-empty-inset` (Chromium, trong shard `interaction-semantics` của
  `ci-browser-full`) đo cả ba hình dạng và bắt chúng phải cùng một đệm — jsdom không có bố cục nên
  một test render thấy DOM y hệt ở cả hai phía. Story `#empty-plain-string` được thêm để cổng có
  đúng hình dạng consumer báo. Đột biến: trả `padding: 0` về ô → đỏ 3 (và in ra chính số 0/4,97px);
  bỏ luật khử trùng lặp → bản dựng sẵn nhảy xuống **80,5px** → đỏ 1.

- **Hai nút bước của `NumberInput` tên là 「増やす」/「減らす」, không nói chúng đổi ô nào.** Đếm trên
  Chromium ở `/isolate/data-entry-number-input`: **16 nút tên 「増やす」 và 16 nút tên 「減らす」** trên
  một trang mà mỗi ô đều có tên riêng (数量, 評価, 目標金額, 重量, 価格…). Hai nút này là
  `tabIndex={-1}` nên đây không phải chuyện thứ tự Tab: đó là thứ người dùng trình đọc màn hình
  nhận được khi liệt kê các nút — đúng nhóm người không nhìn thấy nút ấy nằm cạnh ô nào (WCAG
  2.4.6).

  Tên nay được ghép từ cái ĐÃ đặt tên cho Ô, nên không consumer nào phải truyền gì và không có prop
  mới: `aria-labelledby` khi một phần tử đặt tên (đúng thứ tự ưu tiên của chính ARIA — ô mang cả
  hai thì được đặt tên bởi phần tử), `aria-label` khi một chuỗi đặt tên, và giữ nguyên động từ trần
  khi không có gì cả. Đo lại cùng trang: **0 tên trùng**; 「数量 増やす」, 「評価 (1–5) 増やす」, …

  Thêm khoá `ui.numberInput.incrementField` / `decrementField` cho ja/en/vi. Test mới
  `number-input-stepper-name.test.tsx` phủ cả ba nhánh + thứ tự ưu tiên. Đột biến: trả về động từ
  trần → đỏ 4 test.

- **Ba bộ lọc của `FilterBar` đều xưng 「選択をクリア」.** Mỗi `Select` đều có nút ✕ và tên mặc định
  của nó là câu chung ấy. Tái hiện trên Chromium ở `/isolate/navigation-filter-bar` sau khi cho hai
  bộ lọc một giá trị: **hai nút, một tên**, không nút nào nói nó xoá bộ lọc nào (consumer báo ba nút
  trên màn của họ). Hàng chip ngay bên cạnh thì đã tự đặt tên theo chip của nó (`removeFilter`) —
  tức thanh lọc mâu thuẫn với chính nó.

  `Select` vốn ĐÃ có `clearLabel`; chỉ là thanh lọc chưa bao giờ truyền. Nay nó ghép từ nhãn của
  chính bộ lọc (khoá mới `navigation.filterBar.clearFilter`), và lùi về tên chung khi nhãn là một
  node chứ không phải chuỗi — vì tên sai còn tệ hơn tên chung. Đo lại:
  「ステータスの選択をクリア」/「Vai tròの選択をクリア」, **0 tên trùng**. Đột biến: bỏ `clearLabel` khỏi
  thanh lọc → đỏ.

- **Vùng chạm của `Button variant="bare"` là số đo DUY NHẤT không đi theo `MobileShell`.**
  `--button-bare-target-size: var(--control-height-xs)` khai ở `:root`, mà một alias của bậc thang
  viết ở đó thì được thay thế NGAY TẠI ĐÓ rồi kế thừa dưới dạng chiều dài đã đóng băng — đúng cái
  bẫy `--button-xs-height` mắc phải một lượt trước. Đo trên Chromium ở 393px,
  `/isolate/layout-mobile-shell`, đọc `getComputedStyle(button, "::after")` của một
  `.ui-button.ui-button--bare` THẬT trong shell thật: shell đưa `--control-height` lên 2.75rem và
  `--control-height-xs` tính lại đúng thành 36px, nhưng vùng chạm vẫn là `calc(calc(2rem * 1) -
calc(0.5rem * 1))` = **24×24**. 24px không phạm WCAG 2.2 SC 2.5.8 — nó LÀ cái sàn; vấn đề là
  trong một shell lấy cảm ứng làm tiền đề, vùng chạm lại là thứ duy nhất đứng yên.

  Nay token khai `initial` và `.ui-button--bare::after` đọc bậc thang sống làm giá trị dự phòng.
  Đo lại: trong shell **24×24 → 36×36**; ngoài shell **24×24 y nguyên**. Núm vẫn là núm ở cả hai
  tầng: đặt `--button-bare-target-size: 44px` trên shell → 44×44; đặt `40px` trên `:root` → 40×40.

  Ghim trong `mobile-shell-control-ladder.test.ts` cạnh trường hợp `--button-xs-height`. Đột biến:
  trả `var(--control-height-xs)` về `:root` → đỏ 2 test, và số đo trong shell tụt lại 24×24.

- **Mô tả token trong catalog MCP bị "chú thích gần nhất phía trên" cướp mất.** Generator gán cho
  mỗi token chú thích CSS gần nhất ở trên nó, và luật ấy KHÔNG CÓ ĐIỂM DỪNG — nên một chú thích đặt
  giữa nhóm trở thành mô tả của MỌI token phía sau, vượt cả dòng trống lẫn khối rule. Cái đã phát
  hành ra vì thế: ba token `--mobile-shell-safe-inset-*` mang ghi chú "430px — bề ngang logic lớn
  nhất mà máy cầm tay báo" vốn thuộc về `--mobile-shell-max-inline-size`; `--tabs-overflow-radius`
  và `--tabs-overflow-icon-size` mang ghi chú về KÍCH THƯỚC của nút overflow; `--button-count-min-width`
  được mô tả là "con trỏ nhấp nháy của OTP"; `--topbar-chip-icon-font-size` là một ghi chú về alpha
  của vòng tiêu điểm; `--control-height-compact`, `--control-height-default` và bốn
  `--textarea-padding-*` mang đoạn văn về viền cảnh báo màu hổ phách, cách đó hai khối rule. Agent
  đọc `get_component` được bảo rằng một núm padding là một quyết định tương phản WCAG — tệ hơn là
  không nói gì, vì nó đọc ra như một câu cụ thể.

  Luật mới, và cố ý là luật đơn giản nhất không thể sai: **một chú thích mô tả ĐÚNG khai báo ngay
  dưới nó**. Chú thích cuối dòng (`--x: initial; /* default = … */`) thuộc về dòng CỦA NÓ, không
  phải dòng sau — `legal-document.css` viết liền năm cái như vậy, đẩy xuống một dòng là sai ba.
  Token không có chú thích riêng nhận dòng tiêu đề của CHÍNH TỆP nó (`Badge component tokens.`),
  nên không mô tả nào rỗng.

  Hai luật "mềm hơn" đã được ĐO rồi bỏ. Cho chú thích làm tiêu đề nhóm và dừng ở dòng trống: giữ
  thêm 525 mô tả cụ thể, nhưng để lại đúng những lỗi cần sửa — `--mobile-shell-max-inline-size`
  đứng liền ba token safe-inset không có dòng trống, `--card-space-gap` liền năm token
  card-title/description. Phép thử "anh em" (cùng tên trừ đoạn cuối): chặn được phần lớn rò rỉ
  nhưng cắt mất các thang thật và vẫn để 485 token rơi về tiêu đề tệp — một luật khôn hơn cho gần
  đúng ngần ấy độ phủ.

  GIÁ PHẢI TRẢ, nói thẳng: 525/1364 token (38%) nay mang tiêu đề một dòng của tệp thay vì một tiêu
  đề nhóm. Một số tiêu đề nhóm ấy vốn đúng cho cả nhóm. Đường lấy lại nằm trong tay tác giả và hiện
  rõ trong diff: đưa chú thích xuống ngay trên token nó nói về. Diff của lần sinh lại: **867 mô tả
  đổi, 0 token thêm/bớt, 0 giá trị đổi, thứ tự y nguyên**.

  Luật tách ra `scripts/component-token-rules.mjs` (cùng kiểu với `token-scale-bypass-rules.mjs`)
  để test được bằng fixture: `component-token-description-scope.test.ts` ghim đúng những hình dạng
  đã sinh ra lỗi. Đột biến: trả về luật "chú thích gần nhất, mãi mãi" → đỏ 4 test; giao chú thích
  cuối dòng cho token kế tiếp → đỏ 1 test.

- **Catalog token của MCP không có cổng nào canh độ tươi — và cổng ấy đã nằm sẵn trong kho, không
  ai chạy được.** `scripts/gen-component-tokens.mjs` có chế độ `--check` từ lần sinh catalog đầu
  tiên, và MỌI tệp nó ghi ra đều in sẵn dòng ``Run `pnpm check:mcp-token-sync` `` ở đầu — nhưng
  script ấy chưa bao giờ tồn tại trong `package.json`, nên không workflow nào gọi được. Kết quả:
  `mcp/src/data/component-tokens.generated.ts` bị phát hiện ÔI trên `main` — thiếu
  `--progress-ring-*`, `--tabs-overflow-*`, `--tabs-list-line-space-gap`,
  `--mobile-shell-max-inline-size`, và vẫn kê `--segmented-item-height`, một token đã bị gỡ. Agent
  tra MCP xem Tabs có núm gì nhận câu trả lời từ một tệp không ai canh — đúng lớp lỗi đã đo được
  với `pad`/`padRaw` (agent theo đúng quy trình MCP-first kết luận "Flex chỉ có gap" rồi bỏ cuộc
  trước 21 finding).

  `scripts/gen-email-tokens.mjs` ở đúng tình trạng ấy (`check:email-token-sync`, được in ra trong
  chính output của nó, không có trong `package.json`) — nên đây là một LỚP chứ không phải một lần
  quên. Cả hai nay là `check:mcp-token-sync` / `check:email-token-sync`, nằm trong `verify`,
  `verify:static` và `verify:ci:static` cạnh các cổng catalog MCP khác; `check:gate-coverage` xác
  nhận 61/63 cổng có workflow chạy.

  `--check` nay còn NÓI RA cái gì lệch thay vì chỉ "stale": thêm / gỡ / đổi mặc định, kèm tên
  token. Đột biến: thêm một token vào tier → `+ 1 new token(s): --control-mutation-probe`; gỡ một
  token → `- 1 removed token(s)`; đổi giá trị → `~ 1 retuned default(s)`; cả ba exit 1.

  Cổng cho chính lớp lỗi này: `src/test/__tests__/generator-check-mode-wired.test.ts` — mọi
  `scripts/gen-*.mjs` có `--check` phải có một script `check:*` chạy nó, và mọi `pnpm check:…`
  mà generator in ra phải là script có thật. `check:gate-coverage` không thấy được lỗ này (nó soi
  các `check:*` ĐÃ CÓ so với workflow; một cổng chưa ai khai thì nó vô hình). Đột biến: xoá
  `check:mcp-token-sync` khỏi `package.json` — tức đúng trạng thái trên `main` — → đỏ hai test.

- **`Input` chưa bao giờ vẽ vòng tiêu điểm — một utility của Tailwind thắng cả tầng components.**
  `.ui-input` CÓ trong danh sách selector của `focus-ring.css`, nhưng `Input` tự mang theo
  `outline-none`; `@layer utilities` đứng sau `@layer components` nên thắng mọi độ đặc hiệu, và
  dấu tiêu điểm của chính gói này thua im lặng — không lỗi biên dịch, không test đỏ, không finding
  của audit. Đo trên Chromium, `/isolate/data-entry-input`, `<html data-focus-outline="on">` với
  `--focus-ring-weight: 2px`, bằng một phím **Tab thật** (đọc lại `document.activeElement` để
  chứng minh phím có tới trang): Button báo `outline: 2px solid rgb(0,113,189)`, Input cùng trang
  cùng công tắc báo `outline-style: none`. Consumer gino-cloud (20.2.1) chỉ còn cái viền 1px đổi
  màu và quầng α.11 ở **1,09:1** — dưới xa sàn 3:1 của SC 1.4.11 / 2.4.11.

  Cùng một thất bại có trên `Checkbox`, `Radio`, `Switch` (`outline-none`), panel của `Tabs`
  (`outline-none`), và nút đóng của `Dialog`/`Sheet` (`focus:outline-hidden`, thứ vẽ ra
  `outline: 2px solid transparent` — tệ hơn, vì `outline-width` khi ấy đọc ra `2px` và một phép đo
  chỉ lấy bề rộng sẽ báo "có vòng"). Gỡ hết; không phải thay bằng gì, vì `focus-ring.css` đã khai
  `outline` vô điều kiện trên chính những phần tử ấy và công tắc TẮT cho ra `0px`.

  `Radio` còn thiếu một nửa nữa: react-aria đặt tiêu điểm lên `<input>` ẩn nên `:focus-visible`
  không bao giờ khớp cái hộp được vẽ, và `.ui-radio[data-focus-visible]` — cái móc đã có sẵn cho
  `.ui-checkbox` / `.ui-switch` — chưa từng được thêm. Sau khi sửa, Radio có dấu như hai anh em.

  Đo lại, sáng / tối, công tắc BẬT / TẮT (`scripts/check-focus-ring-paint.mjs`, Tab thật):
  BẬT → `outline 2px solid`, offset `0px`, **5,04:1** (sáng) / **6,48:1** (tối) so với mặt nền
  vòng được vẽ lên — y hệt Button, control tham chiếu. TẮT → `outline-width: 0px` và `box-shadow`
  lúc có tiêu điểm **y nguyên** như lúc nghỉ (không cướp mất độ nổi của control).

  Hai cổng mới. `src/styles/__tests__/focus-ring-utility-defeat.test.ts` (chạy trong `pnpm test`):
  không class nào trong danh sách selector được đi kèm một utility tắt outline, ở mọi cách viết
  variant. `check:focus-ring-paint` (Chromium, trong `verify:browser`): nhấn Tab thật tới từng
  control, đo CẢ `outline` lẫn `box-shadow`, và bắt control phải dùng CÙNG DẠNG với control tham
  chiếu trên cùng bản build — nên nếu dấu tiêu điểm có ngày quay lại dạng box-shadow (như v19.4.2),
  cổng vẫn đúng thay vì báo nhầm "mất vòng". Đột biến: trả `outline-none` vào `Input` → cả hai đỏ.

- **`.ui-control-affix-action` và chín tab stop khác rơi về `outline: auto 1px` của Chrome.** Nút
  「選択をクリア」 của `Select` không có trong danh sách selector của `focus-ring.css`, nên nó không
  phải là "không có dấu" — nó mang dấu MẶC ĐỊNH CỦA TRÌNH DUYỆT, thứ công tắc `data-focus-outline`
  không tắt được và không theme nào chỉnh được. Đo trên `/isolate/data-entry-select`: ba tab stop
  như vậy trên một màn; consumer đếm được ba trên màn của họ.

  Một lượt quét bằng Tab thật qua cả 175 story tìm hết họ hàng còn thiếu. Thêm vào danh sách:
  `.ui-control-affix-action`, `.ui-control-inline-affix-action`, `.ui-search-input-clear`,
  `.ui-tag-input-remove`, `.ui-color-picker-input`, `.ui-upload-tile-add`,
  `.ui-upload-picture-empty`, `.ui-upload-dropzone`, `.ui-tabs-add`, `.ui-steps-control`,
  `.ui-carousel-previous`, `.ui-carousel-next`. Ba cái cuối là nửa còn thiếu của những họ đã có
  sẵn trong danh sách (`.ui-steps-inline-control`, `.ui-carousel-dot`) — một sự bất đối xứng,
  không phải một quyết định. Sau khi sửa: nút clear của Select báo `outline 2px solid`, **5,04:1**
  (sáng) / **6,48:1** (tối), và `0px` khi công tắc tắt.

  KHÔNG đưa vào, và lý do: hàng menu (`.ui-navigation-menu-link`, `.ui-menubar-item`,
  `.ui-dropdown-menu-item`) cố ý `outline: none` vì chúng dùng highlight `data-highlighted` — một
  affordance khác; các vùng cuộn và container (`.ui-data-table-scroll`, `.ui-master-detail-master`,
  `.ui-branch-scope-picker-list`, `.sb-product`, `.ui-breadcrumb-link`) không thuộc họ control và
  được báo lại cho chủ kho thay vì sửa lén trong một lượt vá vòng tiêu điểm.

- **Một field `status="warning"` không có dấu tiêu điểm nào cả.**
  `.ui-control[data-status="warning"]` gán `--focus-outline-color: var(--control-status-warning-border-color)`,
  mà token ấy đã là `hsl(var(--text-warning))` — tức một MÀU, không phải bộ ba. Dấu tiêu điểm được
  ghép bằng `hsl(var(--focus-outline-color) / …)`, nên nó lồng `hsl()` trong `hsl()`: khai báo
  không hợp lệ tại thời điểm tính giá trị và TOÀN BỘ shorthand `outline` rơi về giá trị khởi
  thuỷ. Đo trên Chromium ở `/isolate/data-entry-textarea`, ô 「警告状態」, công tắc BẬT:
  `outline-style: none`, `outline-width: 3px` (`medium`) — không một pixel nào. Nay
  `--control-status-warning-outline-color` mang đúng bộ ba (`var(--text-warning)`, không phải
  `--warning` ở 1,85:1 mà chính ghi chú token đã bác) và hai biến focus đọc nó: ô cảnh báo có
  `outline 1px solid`, **5,90:1** (sáng) / **11,41:1** (tối).

- **Tài liệu và catalog kê đúng cái núm mà chính kho này cấm: `--focus-ring-width`.** Từ khi vòng
  tiêu điểm có công tắc, `--focus-ring-width` là GIÁ TRỊ DẪN XUẤT —
  `calc(var(--focus-ring-weight) * var(--focus-outline))` — và `focus-ring-contrast.test.ts` làm đỏ
  build nếu một stylesheet nào gán thẳng vào nó. Nhưng `CUSTOMER-THEMING.md` vẫn gọi nó là núm độ
  dày, mặc định "2px", "ships on", và "`width: 0` tắt mọi vòng"; khối `:root` để DÁN NGUYÊN VĂN ở
  đầu tài liệu còn phát thẳng `--focus-ring-width: 2px`; `TOKENS.md` gọi nó là một bậc của thang
  `--stroke`; và catalog token của MCP — thứ agent đọc — lặp lại con số 2px. Đo trên Chromium: với
  công tắc TẮT, `--focus-ring-width: 2px` vẫn vẽ ra vòng 2px trên một Button có tiêu điểm — tức lời
  kê trong tài liệu đi vòng qua đúng cái công tắc mà test kia tồn tại để bảo vệ.

  Không thêm token nào, vì đã đủ: `data-focus-outline="on"` (công tắc), `--focus-ring-weight` (độ
  dày), `--focus-ring-offset` (khe), `--focus-ring-color` (màu). Đo lại cả bốn: bật công tắc →
  **1px** `rgb(0,113,189)`; `--focus-ring-weight: 2px` → **2px**; `--focus-ring-offset: 2px` →
  offset **2px**. Vòng MẢNH mà vẫn đạt chuẩn chính là `--focus-ring-weight: var(--stroke-md)`: 2px ở
  **5,05:1** (sáng) / **7,07:1** (tối) — qua cả sàn 3:1 của SC 1.4.11 lẫn vành 2px của SC 2.4.13.

  Cổng mới nằm ngay trong `focus-ring-contrast.test.ts`, cùng bất biến nhưng soi cái mà luật cũ
  không thấy: MỌI `--focus-ring-width:` trong `CUSTOMER-THEMING.md`, `TOKENS.md`,
  `DESIGN-AUTHORITY.md` và `mcp/src/data/tokens.ts` phải là chính định nghĩa dẫn xuất, không được là
  một phép gán. Nó bắt được ngay khối dán-nguyên-văn mà lượt sửa tay đã bỏ sót. Đột biến: trả
  `--focus-ring-width: 3px` vào ví dụ retune → đỏ.

- **Ô chọn hàng của `DataTable` bị đọc lên bằng UUID.** Tên truy cập của checkbox (và radio) chọn
  hàng là `selectRow: "行 {id} を選択"` điền bằng `row.id` — trên một bảng khoá theo UUID, trình đọc màn
  hình nói "行 3f2a9c1e-7b4d-4e8a-9c21-000000000000 を選択" cho MỌI hàng (gino-cloud phát hiện, tái hiện
  trên Chromium). Id là KHOÁ, không phải TÊN. Nay tên được lấy theo thứ tự: `aria-label` từ
  `rowSelection.getCheckboxProps` (vẫn thắng như cũ) → prop mới **`getRowLabel(row)`** → chữ của cột
  `priority: "primary"`, nếu không có thì của cột đầu tiên, khi giá trị ấy là chuỗi hay số → id, chỉ
  khi không còn gì khác gọi tên được hàng. Cùng bảng ấy sau khi sửa: "行 NGUYEN VAN AN0 を選択". Một
  consumer có cột đầu là tên (như gino-cloud) nhận tên người mà không phải sửa dòng nào; bảng nào có
  cột đầu là avatar, badge trạng thái hay id thì truyền `getRowLabel`.

  `getRowLabel` là một trục vocabulary (`GetRowLabelProp`, cạnh `GetRowIdProp`), có trong catalog MCP
  và manifest API. Test mới `data-table-row-label.test.tsx` bám role và tên truy cập: cột đầu, cột
  primary, accessor, fallback id, `getCheckboxProps` vẫn thắng, và radio.

- **Trong `MobileShell`, mọi control có `size` vẫn đứng trên thang DESKTOP.** Shell đặt
  `--control-height` thành 44px (bậc chạm), nhưng `--control-height-sm/-lg/-xs` là `calc()` trên
  `--control-height` khai ở `:root` — một `calc()` trên biến tuỳ biến được thay thế tại nơi nó ĐƯỢC
  KHAI rồi mới kế thừa, nên cả thang đóng băng theo 32px của gốc. Đo trên Chromium ở 393px, bên
  cạnh một Button mặc định 44px: `size="sm"` **28px**, `size="lg"` **36px** (nhỏ hơn cả mặc định),
  `size="xs"` **24px**, `icon-sm` **28px**, `icon-lg` **36px**, Input/Select `sm` **28px**, item
  Segmented `sm`/`lg` **24/32px** (gino-cloud phát hiện). Nay `.ui-mobile-shell` khai lại ba bậc
  ngay trên chính phần tử đổi tầng, đúng từng byte công thức của `:root` — cách `.ui-segmented` và
  `--mobile-shell-padding-inline` đã làm. Sau khi sửa: **40 / 48 / 36px**, icon-xs/sm/lg
  **36/40/48**, Input/Select `sm` **40**, Segmented `sm`/`lg` **36/44** — đúng thang mà một thiết
  bị con trỏ thô đã nhận từ `:root`.

  Cùng lỗi ấy lặp lại một tầng sâu hơn, và phép đo mới lộ ra: `--button-xs-height:
var(--control-height-xs)` là một alias khai ở `:root`, nên nó đông cứng ở 24px và `size="xs"` KHÔNG
  nhúc nhích dù mọi cỡ khác đã đổi. Nay token là `initial` và `.ui-button--xs` đọc
  `var(--button-xs-height, var(--control-height-xs))` — giá trị mặc định tính lại ngay tại nút, override
  vẫn thắng; đo lại: **36px**. Hệ quả phụ, đúng ý đồ đã ghim: trong một scope `density="compact"`,
  nút xs giờ ra đúng 22,08px mà bảng gh#324 vẫn khẳng định — trước đây trình duyệt thật cho 24px.
  Dòng `--button-xs-height` trong bảng "migration moved nothing" (`geometry-axis-scales.test.ts`) được
  chuyển sang đường mà nút thật sự vẽ: bốn con số giữ nguyên, nay nằm ở dòng `--control-height-xs`.

  Còn lại cùng hình dạng, CHƯA sửa vì không phải control có `size`: `--button-bare-target-size`,
  `--app-setting-picker-compact-control-height`, cỡ avatar của OrgSwitcher / AuthAccountSummary,
  `--range-timeline-*`, `--card-service-launcher-cta-min-height`, `--topbar-item-min-width`,
  `--avatar-square-size`.

  Test mới `mobile-shell-control-ladder.test.ts` ghim CHỖ KHAI chứ không ghim giá trị — một resolver
  thay thế lười ở lá sẽ ra 40px dù có sửa hay không. Đột biến: bỏ dòng `-lg`, lệch công thức `-sm`,
  trả nút xs về token trần — mỗi lần đỏ đúng khẳng định của nó.

- **Catalog token của MCP (`component-tokens.generated.ts`) được sinh lại — nó đã cũ từ trước.**
  Không cổng nào kiểm nó còn khớp nguồn không (`gen:component-tokens` không có `--check`), nên ba PR
  gần đây để lại: thiếu `--progress-ring-*` (4), `--tabs-overflow-*` (3), `--tabs-list-line-space-gap`,
  `--mobile-shell-max-inline-size`, và còn liệt kê `--segmented-item-height` đã bị gỡ. Mục Calendar ở
  trên cũng thêm một token mà chưa sinh lại. Kèm theo, một cái bẫy của generator đáng biết: nó gán
  cho MỖI token "chú thích gần nhất phía trên", nên một chú thích chèn giữa nhóm trở thành mô tả của
  mọi token sau nó — chú thích của token Calendar mới đã ghi đè mô tả của sáu token calendar khác
  cho tới khi nó được dời xuống cuối nhóm. Mô tả của các token Tabs và safe-inset của MobileShell
  đang bị ghi đè đúng kiểu ấy bởi các PR trước; chưa sửa ở đây.

- **`Calendar bordered`: chữ tiêu đề thứ dính sát đường kẻ.** Khi lưới được kẻ ô, ô tiêu đề thứ
  không có đệm theo trục khối, nên hộp dòng bắt đầu ngay dưới đường kẻ 1px phía trên — đo trên
  Chromium: chữ cách đường kẻ trên **1px**, cách đường kẻ dưới **2,19px**, tức một khoảng đệm nhỏ
  hơn cả bậc nhỏ nhất của thang khoảng cách (gino-cloud phát hiện). Nay ô tiêu đề của lưới CÓ KẺ lấy
  `padding-block: var(--calendar-bordered-weekday-padding-block)`, token mới mặc định
  `var(--space-1)` — một bậc có tên, nên service chỉnh thang khoảng cách thì nó đi theo. Sau khi
  sửa: **5px / 6,19px**, ô cao 22,19 → 30,19px. Lưới KHÔNG kẻ giữ nguyên: không có mép nào để chữ
  tựa vào, nên nó không cần đệm.

  Test mới `calendar-bordered-weekday-inset.test.ts` ghim quy tắc nào mang đệm, đệm đọc token nào,
  token là một bậc có tên, và tiêu đề không kẻ không bị đụng tới. Đột biến từng khẳng định một: bỏ
  dòng `padding-block`, đổi token thành `4px`, thêm đệm cho tiêu đề không kẻ — mỗi lần đúng một test đỏ.

- **`Segmented` bốn lựa chọn bị cắt chữ ở màn điện thoại — nay track XUỐNG DÒNG.** Catalog hứa
  Segmented dành cho 2–4 lựa chọn, nhưng track là `inline-flex` một hàng và item co lại kèm dấu
  lược, nên bốn lựa chọn có số đếm không sống nổi ở 393px. Đo trên Chromium (gino-cloud phát hiện):
  track **361px**, **cả bốn** nhãn bị cắt, và 「失踪・帰国 0」 chỉ còn thấy **9,1px** trong **25,1px**
  của badge số đếm — tức con số biến mất.

  Nay `.ui-segmented` là `flex-wrap: wrap`. Một flex container nhiều dòng xếp item theo bề rộng tự
  nhiên TRƯỚC khi co bất kỳ item nào, nên lựa chọn nào không chung hàng được thì xuống hàng sau
  NGUYÊN VẸN, còn một thanh vừa một hàng thì vẫn đúng một hàng. Sau khi sửa, cùng thanh ấy ở 393px:
  hai hàng (track cao 60px), **0** nhãn bị cắt, mọi badge hiện đủ **25,1 / 25,1px**; ở 1280px vẫn
  một hàng. Không cho item giãn ra lấp hàng, có lý do đo được: `<Flex direction="col">` mặc định
  kéo track rộng bằng cha (1198px ở 1280), nên `flex-grow` sẽ nới item của mọi Segmented trên
  desktop. `block` giữ nguyên phần chia ĐỀU (`flex: 1 1 0`) nên vẫn cắt — theo hợp đồng, và catalog
  nay nói thẳng điều đó.

  Catalog: dòng "track không có hành vi tràn" đã sai với mã, nay sửa; thêm use case "lọc trạng thái
  kèm số đếm" để truy vấn theo ý định ("filter … counts") tìm ra Segmented. Cổng mới
  `check:segmented-wrap` (lane `ci-browser-full`) đo frame ở 320/393/1280px, LTR và RTL: không nhãn
  nào bị cắt, không badge nào lọt khỏi item, không track nào tràn cha, trang không cuộn ngang, và
  mục `#four-with-counts` mới đúng một hàng ở 1280 / ít nhất hai ở màn điện thoại. Đột biến: xoá
  riêng dòng `flex-wrap` → cả cổng lẫn test đơn vị đều đỏ.

- **`font-display: swap` trên 729 `@font-face` không còn là toàn bộ ngân sách CLS của consumer.** Mọi
  face trong `@fontsource/noto-sans-jp` và `@fontsource/m-plus-2` đều là `swap`, và CSS **không**
  sửa được `font-display` của một face đã khai báo — nên consumer không có nước đi nào ngoài fork
  hoặc regex bản CSS đã build, đúng hai thứ luật consumer cấm. Đo tại `godx-jp/id`: font chỉ bắt đầu
  tải ở ~890ms, về ~1.1s, tức là SAU khi chữ đã vẽ bằng face dự phòng của hệ điều hành; cú swap sau
  đó dời bố cục **0,093–0,141** trên macOS và **0,4134** trên Linux runner. Chặn hẳn font: 0,000.
  Cache nóng: 0,000.

  Nay `styles/fonts.css` khai báo `"Noto Sans JP Fallback"` và đặt nó **ngay sau** face thương hiệu
  trong `--font-sans-base` / `--font-sans-vi`. Nó không tải gì cả: `src` toàn `local()`, và các
  descriptor ghi đè metric bẻ font máy sẵn có về đúng metric của Noto Sans JP. Một family, cắt theo
  `unicode-range`, vì hai hệ chữ cần hai cách đối xử ngược nhau:

  - **Latin/Việt → Arial, hoặc Liberation Sans** (trùng metric tuyệt đối: cùng advance, cùng metric
    dọc), nên MỘT bộ số đúng cho cả macOS, Windows lẫn Linux. `size-adjust` là advance của Noto Sans
    JP chia advance của Arial, đo bằng fontkit (bật kerning) trên đúng 402 chuỗi của
    `src/i18n/messages/en.json`: **103,02%** ở 400, **105,50%** ở 500 (Arial không có Medium nên 500
    đọc Regular), **101,50%** ở 700 so với Arial Bold.
  - **Nhật → face gothic của nền tảng**: Hiragino Sans (macOS), Yu Gothic / Meiryo (Windows), Noto
    Sans CJK JP (Linux desktop), IPAGothic (ảnh Playwright mà CI chạy trên đó). Kana, kanji và dấu
    câu toàn rộng đều là 1em ở mọi face vừa kể **và** ở Noto Sans JP, nên **không** `size-adjust` —
    co lại 3% là dời từng dòng tiếng Nhật.

  Metric dọc: Noto Sans JP là 1,16 / 0,288 / 0 em ở cả `hhea` lẫn OS/2 `win` (bit USE_TYPO_METRICS
  tắt, nên Chromium, Firefox và DirectWrite đều đọc đúng bộ ấy). Các `*-override` chép lại đúng bộ
  đó, chia cho `size-adjust` vì trình duyệt nhân ngược lại — nên hộp dòng cao y hệt trước và sau cú
  swap, kể cả với `line-height: normal`.

  Đo sau khi sửa, 486 hộp mỗi nền (3 weight × 3 cỡ của thang chữ × `line-height` 1.5 và `normal` ×
  Latin/Việt/Nhật/hỗn hợp), face dự phòng so với chính face thương hiệu: **0** đoạn văn xuống dòng
  khác, **0** hộp dòng lệch, tổng advance Latin **99,86–100,38%** trên macOS và **99,89–100,44%**
  trên Linux. Bản cũ: hộp dòng `line-height: normal` lệch **2px** ở **27/27** trường hợp trên Linux,
  đoạn văn lệch tới **35px**, nhãn sai trung bình **7,49%**. CLS đo trên preview đã build (cold
  cache, CPU throttle 4×, font trả chậm), trang `/` của docs trên Linux: **0,0389 → 0,0020**.

  Cổng mới `check:font-fallback-metrics` (lane `ci-browser` → `verify:browser`) đo chính phần
  RENDER: nó dựng cả hai ngăn xếp trong Chromium thật và đòi đoạn văn xuống dòng y hệt, hộp dòng cao
  y hệt, tiếng Nhật lệch dưới 1% và tổng advance Latin lệch dưới 1,5%. Nó chạy với
  `--font-render-hinting=none`, vì Chromium trên Linux làm tròn advance từng glyph về số nguyên CSS
  pixel (subpixel positioning tắt, và `deviceScaleFactor` không đổi được điều đó) — đo được: cùng
  một từ lệch tới 12% theo hướng này ở cỡ chữ này rồi lệch ngược lại ở cỡ kế tiếp. Đó là phần của
  bộ raster, không `size-adjust` nào chỉnh được, và tắt hinting tách đúng phần metric mà cổng này
  sở hữu. Đột biến: gỡ `size-adjust` → đỏ (hộp dòng lệch 1px, đoạn văn 3px); gỡ các `*-override` →
  đỏ (3px / 9px); gỡ chính family khỏi ngăn xếp → đỏ (đoạn văn lệch 18,7px, một chuỗi rộng 8,56%).

- **Tám gói `@radix-ui` không còn nằm trong `dependencies`.** `accordion`, `avatar`, `collapsible`,
  `label`, `separator`, `slot`, `toggle`, `toggle-group` — không component nào đang phát hành import
  chúng nữa; thứ duy nhất còn import là các test đối chiếu, dựng cây Radix cũ cạnh cây
  react-aria mới rồi đòi hai cây giống nhau. Chúng vẫn ở đó, trong `devDependencies`. Consumer nay
  cài **6** gói Radix thay vì 14, đúng bằng số component còn chạy trên Radix: `Select`, `Slider`,
  `ScrollArea`, `ContextMenu`, `Menubar`, `NavigationMenu`.

  `check:radix-surface` đã để lọt chuyện này vì nó coi mọi import là "đang dùng", kể cả import
  trong test. Nay nó chỉ tính file PHÁT HÀNH khi phán một gói trong `dependencies`, và đỏ với
  `TEST-ONLY DEPENDENCY` khi chỉ test còn giữ gói đó. Chạy bản gate mới trên `main` trước bản sửa:
  đỏ đúng 8 dòng.

- **`DataTable` rộng hơn khung của nó bị CẮT, không cuộn.** `.ui-data-table-surface` là
  `overflow: clip` (để `sticky` bám vào vùng cuộn thật), mà một hộp `clip` hẹp hơn bảng thì cắt
  bảng — phần tràn không bao giờ tới `.ui-data-table-scroll`, nên vùng ấy báo
  `scrollWidth === clientWidth`: không thanh cuộn, không vệt mờ, không lỗi. Đo trên Chromium, một
  bảng `selectable` trong `CardContent flush`: ở 1280px surface **938px**, bảng **1196px** — mất
  **258px** cột bên phải; ở 393px mất **556px**. Consumer (gino-cloud) phát hiện, không cổng nào.
  Trước đây chỉ `scroll.x` thoát được, vì nó ép cả surface lẫn bảng cùng một bề rộng.

  Nay surface là `min-inline-size: min-content`: không bao giờ hẹp hơn bảng. Bảng CÒN co được thì
  vẫn lấp khung và xuống dòng như cũ; bảng không co được nữa biến chính surface — viền và bo góc
  đi theo — thành thứ vùng cuộn cuộn, kèm vệt mờ ở mép cuối đã có sẵn. Sau khi sửa, cùng bảng ấy:
  surface = bảng = **1196px**, cắt **0**, cuộn được 258px (1280) / 837px (393). Sàn 640px ở màn
  hẹp chuyển xuống chính `<table>` (một `min-inline-size` chỉ giữ một giá trị) và vẫn tới được
  surface qua min-content của bảng; `scroll.x` nay chỉ đặt lên bảng vì cùng lý do.

  Cổng mới `check:data-table-overflow` (lane `ci-browser-full`, shard `interaction-semantics`) đo
  MỌI DataTable mặc định của frame index ở 320→1920px, LTR và RTL: bảng không bao giờ rộng hơn hộp
  nội dung của surface, trang không bao giờ cuộn ngang, và mục `#wide-overflow` mới (năm cột 240px
  trong khung 48rem) cuộn tới cột cuối được, vệt mờ bật lúc đầu và tắt ở cuối. Đột biến: trả CSS
  về bản cũ → đỏ ngay ở `ltr@320: cut 600px`.

- **`Segmented` không còn in `dir="ltr"` lên mọi call site.** Dòng `dir={direction}` là bản vá của
  thời RADIX: hồi ấy primitive đọc `dir` từ `DirectionProvider` của Radix, kho này không dựng cái
  nào, và nó không bao giờ nhìn `<html dir>` — nên phải trao hướng cho nó bằng tay. Sau khi
  `Segmented` chuyển sang `react-aria-components`, primitive đọc CHÍNH `useLocale()` ấy, nên phép
  trao tay thành thừa và thứ duy nhất nó còn làm là đóng băng một thuộc tính `dir` lên gốc của mọi
  Segmented. Gỡ đi: 19 test (10 hướng phím RTL + 9 của Segmented) vẫn xanh, và DOM sạch thuộc tính.

- **`check:doc-prop-existence` biến chính cận dưới của nó thành một API đầy đủ.** Nó nhận diện
  "component bọc primitive bên thứ ba" bằng `node_modules/.pnpm/` trong `declaredIn` — tức là bằng
  hình dạng thư mục của pnpm, chứ không phải bằng sự thật "khai báo này nằm NGOÀI gói". Ngay khi
  manifest chuyển sang ghi đường dẫn tương đối theo GÓI (để một worktree và CI nói cùng một điều),
  `.pnpm/` biến mất khỏi mọi mục, mọi wrapper thành "đã phân giải đầy đủ", và cổng đỏ với **21**
  phát hiện trên `<Select options>`, `<Calendar mode>`, `<Slider minStepsBetweenThumbs>` — toàn
  prop CÓ THẬT, và vắng mặt trong manifest theo đúng thiết kế. Nay nó khớp chính `node_modules/`,
  thứ sống sót qua mọi lần viết lại tiền tố; types của React là ngoại lệ duy nhất vì chúng CÓ được
  mở rộng. Số bỏ qua trở lại đúng **80**.

### Added

- **`Progress shape="ring"`** — CÙNG một meter, vẽ thành cung thay vì thanh. Cùng `value`, `tone`,
  `size` và cùng ARIA (`role="progressbar"` với `aria-valuenow` / `aria-valuetext`), vì nó là cùng
  một phép đo; chỉ `label` chuyển vào GIỮA vòng — và đó chính là lý do tồn tại của nó: một app bar
  điện thoại phải hiện "18 / 42 đã thực hiện" cạnh tiêu đề chỉ có một ô vuông, còn thanh cộng
  caption thì cần hai hàng chồng. Chọn nó khi CHỖ TRỐNG vuông, không phải khi con số quan trọng.

  Nó chỉ thuộc nhánh meter. Một vòng quanh `segments` là biểu đồ tròn — thứ đó là `PieChart donut`
  ở entry point charts: một part-to-whole theo DANH MỤC, có legend và tooltip, và trình đọc màn
  hình phải nghe nó là một hình ảnh chứ không phải một progressbar.

  Cung dùng `stroke-dasharray` trên `pathLength="100"`, nên **không chỗ nào trong component tính
  chu vi**: SVG được bảo rằng đường của nó dài đúng 100 đơn vị, nên độ dài nét CHÍNH LÀ phần trăm.
  Đo trên Chromium: hộp 44×44 (md) / 32×32 (sm), nét 3px, `getTotalLength()` ra đúng 100,
  `dash="43 100"` ở value=43.

  Cung đọc tầng **MARK**, đúng như thanh và các lát breakdown — không có chữ nào trên nó và chỗ
  màu dừng lại chính là con số, nên sàn 3:1 của WCAG 1.4.11 áp dụng. Đo cung so với track:
  **5,41–6,62** (sáng) và **4,52–8,59** (tối), trùng khít với số của thanh vì chúng đọc cùng token.
  Một giới hạn được ghi thẳng ra: `check:contrast` KHÔNG nhìn thấy nét SVG (ba lượt non-text của nó
  đọc `backgroundColor`), nên bề mặt này được ghim bằng test đọc token cộng với phép đo ở trên,
  không phải bằng cổng trình duyệt.

  `over` trên vòng không kẻ sọc — sọc chéo là cách vẽ của hình chữ nhật — nên tone destructive và
  `aria-valuetext` mang giá trị thật.

- **`PopoverContent width`** — `panel` (mặc định, `--popover-width` = 18rem) · `auto` (nội dung
  quyết định) · `trigger` (bằng neo). Đây là vế còn thiếu của `flush`. `flush` tồn tại vì zero
  padding bằng một utility trên `className` là hằng số tại chỗ gọi mà không theme nào retune được
  — chính luật Popover trong catalog nói thế. TRỤC ĐO NGANG có đúng cùng vấn đề và **không có
  prop nào**: panel rộng 18rem, nên bất cứ thứ gì tự mang bề rộng của nó — một `Calendar` hai
  tháng là ca làm lộ ra chuyện này — đều bị cắt trừ khi call site viết `className="w-auto"`. Lớp
  nội bộ `.ui-control-panel-flush` của chính thư viện xưa nay vẫn đặt CẢ HAI knob; đây là nửa
  công khai của nó.

### Fixed

- **Catalog kê đơn đúng thứ `ui-audit` cấm — 40 lỗi trong các trường MÃ.** `example` của một
  component và `code` của một pattern là chương trình mà agent DÁN nguyên văn. Mười bốn trong số
  đó chứa thứ audit chặn ở consumer: `<div className="flex flex-col gap-1.5">` + một `<label>`
  trần quanh `DatePicker`/`TimePicker`/`TreeSelect`/`Slider` (đúng thứ `bare-control-needs-formfield`
  bảo phải thay bằng `FormField`), `<div className="flex items-center gap-2">` quanh
  `Checkbox`/`Switch` (phải là `Field`), `<button type="submit">` trần, `rounded-md border` tự vẽ
  thay `Card`, `border-r` vật lý, `mr-1`/`ml-1` trên icon của `Button` (Button tự dãn khe icon),
  `¥` gõ tay thay `Intl.NumberFormat`, và ba `<Card>` anh em không có `<Flex>` ở giữa. Nay cả 27
  đoạn mã đều sạch.

- **`no-emoji-in-ui` gọi `©`, `®`, `™` là emoji.** Cả ba là `Emoji_Presentation=No` — dấu chữ
  in có trước emoji rất lâu và mặc định hiển thị dạng CHỮ. Không lý do nào trong thông điệp của
  chính luật chạm tới chúng: một dòng bản quyền không "vỡ trên Win/Linux" và không làm bẩn tên
  khả truy cập. Công thức `CenteredShell` của catalog bị bắt vì chữ `©` trong footer, và mọi
  consumer có footer cũng vậy. Kèm U+FE0F thì chúng đang cố tình xin hiển thị dạng emoji, nên
  cách viết ấy vẫn bị bắt.

### Changed

- **`audit:catalog-snippets` trở thành `check:catalog-snippets`, và đã nối vào `verify:ci:static`.**
  Bản cũ ném MỌI chuỗi có `className=` vào `ui-audit`, mỗi chuỗi ép thành một dòng: 74 phát hiện
  trên 57 entry, và nó bị để ngoài CI — đúng, vì phần lớn không phải lỗi. Hình dạng sai lầm đáng
  gọi tên: **nó đo nhầm thứ, và con số trông như thật.**

  Một trường MÃ (`example`, `code`) là chương trình → `ui-audit` là đúng thước, mỗi đoạn một tệp
  riêng nên số dòng của phát hiện trỏ đúng vào dòng trong công thức. Mọi trường còn lại là VĂN
  XUÔI viết cho người đọc, và văn xuôi trong catalog trích mã vì đúng một lý do: đối chiếu hình
  sai với hình đúng. Soi nó là soi các LỜI CẢNH BÁO. Văn xuôi nay bị hỏi một câu hẹp hơn và đúng
  hơn: _câu này có khuyên dùng một class mà consumer không được phép viết không?_ — hai điều kiện
  đều máy móc: class được trích phải TỰ NÓ trượt `ui-audit`, và câu không đánh dấu nó là hình
  không nên viết. Nhờ vậy `className="h-9 w-full"` trên một Skeleton (số đo của MỘT MÀN HÌNH) đi
  qua, còn `className='w-auto p-0'` trong một bullet DO của Calendar thì không — và đó là một lời
  kê đơn thật, trong chính catalog có luật cấm điều đó ở trục bên cạnh.

  `component-tokens.generated.ts` nằm ngoài phạm vi và có lý do: nó là đầu ra sinh tự động từ chú
  thích của các tệp token, nên chỗ sửa là tệp token, thứ `check:token-tiers` đã canh.

  Đếm trung thực sau khi sửa: **0** — 27 đoạn mã qua `ui-audit` như một consumer, 47 chuỗi văn
  xuôi không kê đơn class nào bị chặn. Phép thử đột biến: trả một utility vào trường mã → đỏ kèm
  đúng số dòng; cho một bullet DO kê `className='w-auto p-0'` → đỏ; cho nó kê `className='h-9 w-full'`
  → vẫn xanh.

### Added

- **`MobileShell width`** — trục mà `height` đã có còn `width` thì không. `"fill"` (mặc định, và
  là thứ shell vẫn làm) lấy trọn bề rộng được cấp; `"phone"` chặn ở
  `--mobile-shell-max-inline-size` (430px — bề rộng logic lớn nhất của lớp máy cầm tay hiện tại)
  rồi căn giữa cột. Đúng cùng một tình huống mà `height="fill"` đã gọi tên ở trục kia: một màn
  hình cầm tay được vẽ trên khung nhìn rộng hơn một cái điện thoại.

  Đo ở khung nhìn 1280px trước khi có trục này: `max-inline-size: none`, shell rộng **1232px** —
  một app cầm tay với bốn đích của tab bar trải hết màn hình. Sau: **430px**, lề trái 425px, tức
  là căn giữa. Bất đối xứng chính là lỗi ở đây; docs frame của chính shell cũng đang đọc trên
  desktop nên nay nó dùng `width="phone"`.

- **`Badge tabular`** — chữ số đều bề rộng, cho chip mang một CON SỐ nằm trong cột cùng các con
  số khác. Cùng trục mà `Text`, `TableCell`, `StatCard` đã có; chip là chỗ một con số hay rơi vào
  nhất lại không có — bất đối xứng, không phải một quyết định.

  **Đo trung thực: với bộ font gói này phát hành, `tabular-nums` không dời một pixel nào.**
  `"1111"` và `"0000"` đều chiếm **31,094px** ở cỡ 12,47px của chip, có hay không có
  `tabular-nums`, vì face được phân giải vốn đã cho chữ số một bề rộng. Thứ prop này mua là lời
  KHAI BÁO — nó sống sót khi một service đổi `--font-family-sans` sang face có chữ số tỉ lệ, đúng
  lý do `Text` mang trục ấy. Và nó gỡ một ràng buộc: nước đi hợp lệ đang có,
  `<Badge><Text size="xs" tabular>`, buộc call site phải biết bậc chữ của Badge là `xs` — token
  `--badge-font-size` của chính chip.

  Nó **không** phải cách sửa cho các chip KHÁC BỀ RỘNG trong một cột: `11` và `100` là hai và ba
  chữ số, nên là hai bề rộng dù face có làm gì. Đó là một measure tối thiểu trên chip, và nó
  thuộc về màn hình.

### Fixed

- **`Segmented size` không làm gì cả — cả ba bậc vẽ ra cùng một hộp.** Đo trên Chromium ở 1280px:
  `size="sm"`, `size="md"` và `size="lg"` đều ra track **65,72×32px** với item **28px**, giống
  nhau từng byte. Nguyên nhân không nằm ở `data-size` (nó CÓ đặt `--control-height` đúng: 28 / 32
  / 36px) mà ở chỗ `--segmented-item-height` được khai ở `:root` như một `calc()` trên
  `--control-height`. Một `calc()` trên biến tuỳ biến được THAY THẾ tại nơi nó ĐƯỢC KHAI, rồi giá
  trị đã thay thế mới đi xuống — nên nó bị đóng băng ở 32px của gốc và không scope nào bên dưới
  chạm tới được. Nay phép cộng ấy được soạn trên chính `.ui-segmented`, đúng cách
  `.ui-mobile-shell` đã làm với `--mobile-shell-padding-inline`.

  Hệ quả thứ hai, và là cái đắt hơn: một `Segmented` đặt trong `MobileShell` — nơi
  `--control-height` được scope thành `2,75rem` — vẫn vẽ item **28px**, tức là dưới sàn chạm 44px
  của luật #24, ngay trên đúng cái shell mà sàn ấy quan trọng nhất. Sau khi sửa: **44px**.

  `check:control-sizing` xanh suốt và nó đúng với phạm vi của nó: nó canh chiều cao control có
  DẪN XUẤT từ `--control-height` hay không, và ở đây thì có. Thứ nó không thấy được là chỗ phép
  dẫn xuất ấy được khai.

- **`Segmented vertical` + `block` bóp mỗi hàng xuống còn hộp dòng chữ.** `flex: 1 1 0` là một
  tuyên bố chia đều trên trục CHÍNH, mà trục chính của một dải dọc là trục khối — đúng chỗ
  `height` của item sống. Đo: **23,8px** mỗi hàng thay vì 28px, track tụt từ 88px xuống 75,39px.
  Nay luật ấy loại trừ hướng dọc; một cột vốn đã có bề rộng bằng nhau từ `align-items: stretch`
  của track.

- **Một hàng trong cột LÀ một control, nên nó cao trọn một control.** Phép trừ
  `− track padding × 2` tồn tại để một dải NGANG một hàng đo đúng bằng `--control-height` tổng
  thể, tức là ngang hàng với một `Input` bên cạnh; xếp chồng thì nó chỉ gọt mất mỗi mục tiêu chạm.
  Trong `MobileShell`: 40px → **44px** mỗi hàng.

- **`check:data-entry-touch-aria` ném lỗi ngay ở case ĐẦU TIÊN, nên 31 case sau nó chưa từng được
  đo.** Hai mục checkbox dùng `[role="checkbox"]` — một phép khớp thuộc tính CSS, chỉ tìm được
  phần tử VIẾT RA thuộc tính ấy. Checkbox của Radix có viết; bản `react-aria-components` mà thư
  viện chuyển sang ở v20 vẽ một `<input type="checkbox">` thật, vai trò checkbox là NGẦM ĐỊNH. Đo
  trên frame sau đợt chuyển: **0** phần tử khớp `[role="checkbox"]`, **26** khớp
  `input[type="checkbox"]`. Đích đúng là nhãn `[data-slot="checkbox"]` chứ không phải cái input
  (input là vật mang trạng thái bị ẩn, và chỉ báo nằm đè lên nó chặn con trỏ — chạm vào input thì
  timeout). Nay cổng chạy đủ **32** frame.

- **`data-entry-segmented` không có trong `check:data-entry-touch-aria`**, và ba prop được ghi tài
  liệu của chính nó (`size`, `vertical`, `block`) không có ví dụ render ở bất kỳ đâu. Đó là lý do
  `size` chết im lặng lâu đến thế. Frame nay có cả ba, và route đã vào danh sách của cổng.

- **Không cần prop mới cho "hiện ký hiệu ngắn, đọc tên dài".** `label` là `ReactNode`, và mục lấy
  tên khả truy cập từ NỘI DUNG của nó — nên `<span aria-hidden>○</span>` cộng
  `<VisuallyHidden>実施</VisuallyHidden>` cho ra một dải ○/△/× đọc lên thành "実施 / 要改善 /
  未実施". Kiểm bằng aria snapshot: `radio "実施" [checked]`. Đã ghi vào catalog và docs frame,
  vì thứ không ai tra được thì coi như không tồn tại.

- **`Legend` swatch và `Progress` fill đọc nhầm tầng tone — cả hai dưới sàn 1.4.11.** Một dấu
  MARK là hình mỏng mang nghĩa mà không có chữ nào trên nó. Trên một thanh tiến độ, **chỗ màu
  dừng lại CHÍNH LÀ số liệu**; trên một lát của dải `segments`, lát ấy chở phần của nó trong tổng
  thể mà không mang chữ nào. Đó đúng là "graphical object required to understand the content", nên
  sàn 3:1 áp dụng, và sắc 和色 thua.

  Hai bề mặt phải đi CÙNG NHAU: ô vuông của `Legend` là MẪU của thanh bên cạnh nó — một cái chìa
  khoá không cùng màu với thứ nó mở thì không còn là chìa khoá. Đo trên Chromium, trước → sau:
  swatch warning **1,74 → 5,90**, success **2,18 → 6,84** (nền sáng), destructive **2,95 → 5,52**
  (nền tối); segment warning **1,60 → 5,41**, success **2,00 → 6,28** (track sáng), destructive
  **2,42 → 4,52** (track tối). Tệ nhất sau khi sửa: **4,52:1**. `.ui-progress-bar` (meter và
  over-capacity) đọc cùng token với lát, nên một meter `warning` và một lát `warning` trên cùng
  màn hình vẫn là một màu.

- **`check:contrast` báo "AA sạch" trên một thanh ở 1,60:1** — và thêm route vào danh sách của nó
  KHÔNG sửa được điều đó. Ba lượt quét non-text của cổng đòi: ≤24px trên CẢ HAI trục (chấm tròn),
  hoặc một viền đúng MỘT phía (thanh rail). Một progress fill không thuộc kiểu nào: cao 8px
  (meter) hay 22px (lát) nhân với bề rộng tuỳ phần của nó, vẽ bằng background, không viền, không
  chữ. Nay có lượt **thin fill**: không con, không chữ, nền đục của riêng nó, trục ngắn trong
  khoảng [3px, 24px] — tổng quát hoá đúng hai lượt cũ (chấm mỏng cả hai trục, rail mỏng một trục)
  thay vì bắt theo tên class. Ngưỡng 3px giữ `Separator` ở ngoài, đúng như luật rail đã có.

  Kèm theo: placeholder tải nằm trong `[aria-busy="true"]` được loại khỏi CẢ BA lượt non-text.
  Skeleton là hình của nội dung CHƯA TỚI (đo được: 1,09:1 sáng, 1,33:1 tối, và cố ý như vậy) —
  1.4.11 miễn trừ trang trí thuần tuý. Phép thử là một sự thật ARIA, không phải một tên class.

- **`docs/showcase/acme-portal` vẽ thanh tiến độ trên một track gần đen.** Theme ấy trỏ
  `--secondary` sang màu NÚT navy, mà `--progress-track-background` mặc định là
  `hsl(var(--secondary))` — vốn là một sắc trung tính nhạt trong bảng gốc. Đo: 2,50 (success) /
  2,90 (warning) trên track navy. Gọi tên track là cách sửa — 6,49 / 5,59 sau đó — không phải kéo
  tầng token trở lại. Theme nào mượn `--secondary` cho việc khác đều nợ dòng này.

- **Hướng đọc chỉ tới được STYLESHEET, không tới được BÀN PHÍM.** `AppProvider` ghi
  `document.documentElement.dir` theo locale, và thế là lật mọi thuộc tính logic trong CSS. Nó
  không lật gì khác: React Aria lấy locale VÀ hướng từ `useLocale()`, thứ mà nếu không có
  `I18nProvider` sẽ rơi về `navigator.language` và **không bao giờ đọc `<html dir>`**; Radix đọc
  `dir` của riêng nó và mặc định `ltr`.

  Đo trong jsdom, đặt `document.documentElement.dir = "rtl"` rồi không làm gì thêm: ArrowLeft trên
  tab ĐẦU nhảy tới tab CUỐI (Tabs), và tới lựa chọn CUỐI (Segmented). Tức là duyệt LTR nguyên vẹn
  dưới một bố cục đã soi gương — phím mũi tên chỉ về mục kế tiếp trên màn hình lại chọn mục trước
  đó. Không cổng nào đỏ, vì không tệp nào có thêm một `margin-left`.

  Nay `AppProvider` bọc children trong `I18nProvider locale={locale}`. Đó cũng là bản vá cho một
  lỗi chẳng liên quan gì tới RTL: trước đó **mọi** primitive React Aria trong thư viện tự bản địa
  hoá theo ngôn ngữ của TRÌNH DUYỆT, nên một app tiếng Nhật chạy trên trình duyệt tiếng Anh nhận
  collation và định dạng số/ngày tiếng Anh ngay bên trong control của chính nó.

- **`Segmented` hứa "arrow-key traversal (RTL-aware)" trong docstring của chính nó và không có
  đường nào lấy được.** Nó dựng trên Radix RadioGroup, thứ đọc `dir` từ `DirectionProvider` của
  Radix — mà kho này không dựng cái nào — và `dir` cũng không phải prop công khai của
  `Segmented`. Nay nó đọc hướng từ cùng một `useLocale()` mà 13 primitive react-aria-components
  quanh nó đang đọc: MỘT nguồn sự thật cho cả hai nền, `AppProvider` cấp, call site không phải
  luồn gì cả.

### Removed — BREAKING

- **Bốn picker ngày gộp thành MỘT `DatePicker`. `DateRangePicker`, `MonthPicker` và
  `MonthRangePicker` bị GỠ, không có shim deprecated.**

  `DatePicker` vốn ĐÃ chở `picker?: "date"|"week"|"month"|"quarter"|"year"` và tự dựng lưới tháng
  bằng ĐÚNG những class CSS mà `MonthPicker` dùng — tức `<DatePicker picker="month"/>` và
  `<MonthPicker/>` là hai bản cài đặt của cùng một control trong cùng một gói. Vỏ của
  `MonthRangePicker`, `sharedKeyHandlers` và `innerInputClass` là bản chép từ `date-range-picker`,
  chép cả một lỗi chính tả trong chú thích.

  Cái giá của việc chép ấy đo được: **bốn hợp đồng mà `DatePicker` đã làm đúng và bản sao của nó
  thì không.** (1) `<MonthPicker disabled open>` mở popover trên một field đã chết — `DatePicker`
  chặn từ đầu bằng `!disabled && (openProp ?? internalOpen)`. (2) `fromYear`/`toYear` chỉ làm xám
  hai chevron; mọi ô trong lưới và mọi chuỗi gõ tay vẫn commit được giá trị ngoài biên. (3) Enter
  không được xử lý ở BA trong bốn file: gõ xong nhấn Enter thì không có gì xảy ra, panel vẫn mở, và
  trong `<form>` phím ấy rơi xuống submit. (4) `MonthPicker` submit `2026/03` — `/` không phải dấu
  phân cách ISO. Một sửa cho vòng open/close/commit phải làm bốn lần, và đo được là chưa lần nào làm đủ.

  Gỡ trọn: ba component, `src/components/ui/date-range-picker.tsx`, subpath export
  `@godxjp/ui/ui/date-range-picker`, ba `*Prop` trong registry, ba frame `docs/data-entry/`, ba
  entry catalog MCP, các dòng frame-id trong `check-data-entry-*` và `ci-browser-full.yml`.
  `check-mcp-pattern-imports.mjs` nay chặn import/JSX của cả ba y như đã chặn `TreeList`.
  Baseline `check:disclosure-duplication` hạ **61 → 46 machine part, 11 → 8 component** — cụm
  picker không thể tách lại mà không đỏ CI.

  **Chuyển đổi.** Hai trục, đều là tên của antd: `picker` là ĐỘ MỊN, `range` là LỰC LƯỢNG.

  | Cũ                      | Mới                                    |
  | ----------------------- | -------------------------------------- |
  | `<DateRangePicker …/>`  | `<DatePicker range …/>`                |
  | `<MonthPicker …/>`      | `<DatePicker picker="month" …/>`       |
  | `<MonthRangePicker …/>` | `<DatePicker range picker="month" …/>` |
  | `fromYear={2024}`       | `minDate={new Date(2024, 0, 1)}`       |
  | `toYear={2027}`         | `maxDate={new Date(2027, 11, 31)}`     |
  | `DateRangePickerProp`   | `DatePickerProp` (nhánh `range: true`) |

  **Ba va chạm tên prop được quyết định dứt khoát, lý do viết TRONG mã.**
  · `fromYear`/`toYear` biến mất: `minDate`/`maxDate` diễn đạt được nhiều hơn (biên ở mức ngày) và
  là tên antd; quan trọng hơn, chúng được thi hành ở CẢ HAI lối vào giá trị.
  · `order` giờ có MỘT nghĩa — "chuẩn hoá về thứ tự tăng dần" — hoán vị hai đầu của một `range` và
  sắp xếp một mảng `multiple`; đó là một bất biến nhìn qua hai hình dạng giá trị, không phải hai
  nghĩa. `MonthRangePicker` trước đây hoán vị vô điều kiện, không tắt được.
  · `inputReadOnly` theo nghĩa antd: chỉ đặt thuộc tính `readonly` lên input (giữ bàn phím ảo di
  động không bật lên) — **panel VẪN mở**. Hai month picker bắt nó từ chối mở, biến nó thành một
  `disabled` thứ hai và làm "chỉ chọn bằng lưới" không diễn đạt được nữa.

  **Giá trị submit nay là ISO-8601 đúng độ chính xác mà `picker` chọn**: `2026-03-01` cho
  `date`/`week`, `2026-03` cho `month` và `quarter`, `2026` cho `year`; `range` submit
  `${name}_from` / `${name}_to`. Ô hiển thị đọc cùng chuỗi ấy.

### Added

- **Hai khoảng trống P1 với Ant Design của `DatePicker` được lấp** — chính hai dòng mà
  `docs/roadmap/parity-audit-data-entry.md` §2.6 xếp P1, và đối chiếu lại với tài liệu THẬT của
  antd (ant.design/components/date-picker) chứ không dựa vào trí nhớ.

  · `defaultPickerValue` / `pickerValue` — panel mở ở kỳ nào, ĐỘC LẬP với giá trị. Không có nó thì
  "mở ở tháng đầu năm tài chính" hay "mở ở tháng của dòng đang sửa" không diễn đạt được: panel chỉ
  mở ở giá trị hoặc ở hôm nay. `defaultPickerValue` được ÁP LẠI mỗi lần mở — đúng câu chữ của antd
  ("will be reset when panel open") — nên nó không phải hoà giải gì với giá trị. Một anchor lái cả
  hai panel, nên `picker` mịn hay thô đều một nghĩa. antd KHÔNG tài liệu hoá `onPickerValueChange`
  nên không bịa ra.

  · `disabled` nhận thêm dạng tuple `[from, to]` khi có `range`, khoá MỘT đầu và để đầu kia sửa
  được (antd RangePicker `disabled`). "Ngày bắt đầu chốt theo hợp đồng, chỉ ngày kết thúc còn thương
  lượng" là một màn thật. Dạng scalar chỉ là tuple hai nửa bằng nhau nên không có nhánh mã thứ hai;
  đầu bị khoá giữ nguyên giá trị đã commit dù gõ hay chọn gì, và ✕ rút đi khi còn một đầu bị khoá
  vì xoá sẽ cuốn theo cả đầu ấy.

  Đối chiếu với antd cũng xác nhận hai quyết định va chạm ở trên bằng NGUỒN GỐC chứ không phải suy
  luận: `order` được antd định nghĩa là "auto order date when **multiple or range** selection" —
  đúng một nghĩa cho cả hai hình dạng giá trị; và `inputReadOnly` là "set readonly attribute of
  input tag (avoids virtual keyboard)" — không hề nói gì đến việc chặn panel.

### Fixed

- **Lưới `month`/`quarter`/`year` nay là một ARIA grid THẬT.** `role="grid"` đòi con `row` và một
  `row` đòi con `gridcell`; `MonthPicker` đặt role lên một div đầy button trần, mà axe gắn cờ
  `aria-required-children`. Test a11y của chính nó chưa bao giờ MỞ panel nên không ai thấy — lỗi
  thứ năm, lộ ra vì test a11y của `DatePicker` có mở. Hai lớp bọc dùng `display: contents` nên hình
  dạng 3 cột không đổi một pixel nào.

### Removed — BREAKING

- **`TreeList` bị GỠ, không có shim deprecated.** Nó là một `<ul>` phẳng mà `depth` chỉ lái
  `margin-inline-start`: không đóng/mở, không `role="tree"`, không bàn phím, không hợp đồng chọn.
  Nó chỉ TRÔNG như một cái cây. Trên màn thật nó đọc ra thành một chồng thẻ, vì mỗi nút là một
  hộp bo góc có viền riêng với tiêu đề chữ đơn cách; và blurb catalog của chính nó hứa một
  "chevron + package icon" mà component không hề vẽ.

  `Tree` (#439) đã thay nó và mạnh hơn hẳn: `treeData` lồng nhau, tam giác đóng/mở, roving
  tabindex theo WAI-ARIA APG, checkbox ba trạng thái, `loadData` bất đồng bộ,
  `variant="directory"`. Sau khi hai call site cuối trong godx-task chuyển sang `Tree`, quét cả
  bốn kho consumer (godx-task, godx-chat, ql, platform) còn **0 call site** — nên đây là gỡ một
  câu trả lời thứ hai cho câu hỏi đã có câu trả lời, không phải phá vỡ một bề mặt đang dùng.

  Gỡ trọn: component, `TreeListItem`/`TreeListProps`, barrel, test, frame `docs/data-display/`,
  entry catalog MCP, `TreeListProp` trong registry, năm token `--tree-item-*` và CSS
  `.ui-tree-item`. `check-mcp-pattern-imports.mjs` nay chặn import/JSX của `TreeList` y như đã
  chặn `Stack`/`Inline`.

  **Chuyển đổi.** Làm phẳng thành lồng nhau, rồi đặt tên cho cây:
  `id` → `value`, `title` → `label`, `depth` → lồng vào `children`, `badge`/`description` → gói
  trong `titleRender`, `active` → `defaultValue`/`value`. Luôn truyền `aria-label`. Một dàn ý
  THẬT SỰ tĩnh, không bao giờ mở, thì không phải cây — dùng `Descriptions` hoặc chồng `ListRow`.

### Added

- **`Tabs` — Ant Design 6 parity, read off ant.design and not off memory.** Four entries in
  antd's table had no spelling here at all, and one of them mattered on a real screen.

  - **`overflow`** (antd `more`) — `scroll` (default, today's behaviour) | `menu`. A tab strip
    that cannot handle more tabs than fit is broken on a real screen, and this library's
    consumers run Japanese labels wider than the English ones its own examples use. The strip
    already scrolled; what it had no affordance for was DISCOVERY. `menu` puts a named button
    beside the strip listing the tabs currently outside the scrollport.

    **It diverges from antd on purpose.** antd REMOVES the overflowing tabs from the bar; the
    WAI-ARIA APG tab pattern requires the tablist to own every tab, and a `display: none` tab
    cannot take roving focus — so re-homing them would delete the keyboard route along with the
    pixels. Here every tab stays in the strip and the menu is an ADDITIONAL pointer route. The
    name comes from the `overflow` vocabulary Toolbar already uses, not from antd's spelling.

  - **`onTabClick`** (antd `onTabClick`) — pointer activation carrying the DOM MouseEvent. NOT
    fired by the keyboard: under `activationMode="manual"` the arrow keys move focus without
    activating, so a key-driven "click" would be a fiction. Selection stays `onValueChange`.

  - **`closeIcon`** (antd `removeIcon`) — the strip-wide default glyph on `editable-card`'s
    remove shortcut. An item's own `closeIcon` still wins, which is antd's precedence.

  - **`items[].forceRender`** (antd `Tab.forceRender`) — mounts ONE panel up front and keeps it
    mounted, without switching the whole strip over with `destroyOnHidden={false}`.

  **Declined, with the reason, because that list is the argument for why this library is not a
  re-skin of antd:** `tabBarStyle` / `styles` (raw CSS at the call site — rule #45),
  `renderTabBar` (raw markup replacing the component — rule #46), `classNames` /
  `popupClassName` (open-ended class escape hatches; `className`/`listClassName`/
  `contentClassName` are the named ones this library offers), `more.popupRender` and `more`'s
  Dropdown passthrough (same), `animated` (motion is `--duration-*`/`--ease-*` plus
  `prefers-reduced-motion`, not a boolean), `indicator` (geometry — thickness, offset and colour
  are already `--tabs-indicator-*`), `onTabScroll` (hands back a PHYSICAL direction, which the
  logical-axis convention rules out), `items[].destroyOnHidden` (a second spelling of
  `forceRender` — rule #32), and the deprecated `tabPosition` /
  `destroyInactiveTabPane` pair.

- **`--tabs-list-line-space-gap`** — antd's `tabBarGutter`, as a token rather than a prop. The
  `line` strip's gutter was the Tailwind literal `gap-1` inside the base class list, so a
  service could only retune it by forking that list. The card strip already had
  `--tabs-card-list-space-gap`; the pill strip has no gutter by design. Default is a raw
  `0.25rem`, byte for byte what `gap-1` painted.

- **Trục thứ ba của tone: `--mark-*`.** Một tone được tô ba kiểu và mỗi kiểu bị chấm bằng một
  thước khác: FILL (`--success`) là nền đặc có chữ NẰM TRÊN nó; TEXT (`--text-success`) là chữ
  màu; MARK (mới) là một hình MỎNG mang nghĩa mà không có chữ nào trên nó — thanh viền
  `Card accent`, thanh viền `DataTable rowTone`. WCAG 1.4.11 đòi 3:1 cho loại thứ ba.

  Hai thanh viền ấy đang đọc tầng FILL, và đo trên Chromium thì `Card accent="warning"` ra
  **1,74:1** trên chính thẻ của nó, `accent="success"` ra **2,18:1** — dưới sàn. Sau khi chuyển
  tầng: sáu tone × hai nền × hai theme, tệ nhất **3,32:1**. Xem `docs/TOKENS.md`.

- **`Progress size`** — `sm` cho thanh chú thích một HÀNG thay vì là chủ đề của màn. Trước đó
  khổ dọc của dải `segments` bị ghim ở 22px, nên một thanh trong bảng đặt luôn chiều cao mọi
  hàng, và lối thoát duy nhất là CSS viết tay (thứ `ui-audit` cấm ở consumer).

- **`DataTable rowTone`** — trạng thái của TỪNG HÀNG, vẽ thành thanh viền đầu hàng + nền nhạt,
  dùng đúng sáu tên tone mà `Card accent` đã có. `rowClassName` không nói được điều này:
  `ui-audit` coi mọi prop có tên kết thúc bằng `className` là biểu thức class, nên một utility
  viền + một màu palette trong đó là hai lỗi. Không bao giờ là tín hiệu DUY NHẤT (WCAG 1.4.1).

- **`Select width` trên API hướng dữ liệu** (`options` / `loadOptions`). Luật 5 của
  `docs/CONSUMER-RULES.md` hứa `width="auto"` cho một Select ngoài form; điều đó đúng với API
  compound và SAI với API `options`, nên hai bộ lọc trên một hàng kéo hết chiều rộng rồi xếp
  chồng, và cách duy nhất là bọc mỗi cái trong `<Flex width={280}>`.

- **`FormField helperPlacement`** — `before` đặt dòng phụ GIỮA nhãn và ô nhập, cho biểu mẫu song
  ngữ cần người đọc thấy nó TRƯỚC khi trả lời. `labelAddon` không chở nổi (hàng inline không
  wrap, cỡ một chip), còn nhét vào `label` thì mất các fallback tên khi `label` không phải chuỗi.
  Chỉ đổi chỗ vẽ: helper giữ nguyên id và vẫn nằm trên `aria-describedby`.

- **`Steps` chuyển tiếp phần prop còn lại xuống `<ol>`.** Trước đó nó không chuyển gì, nên
  consumer không có tay nắm hợp lệ nào và bộ test trình duyệt của họ phải bám vào
  `.ui-steps-list > li[data-status]` — một class nội bộ và một data attribute nội bộ mà kho này
  đổi tên tuỳ ý. `type` cố tình KHÔNG chuyển tiếp: trên `<ol>` nó là kiểu đánh số.

- **`BadgeTone` được xuất từ barrel `data-display`.** Nó vốn được khai báo mà không xuất, nên
  import theo tên là lỗi `tsc` và consumer phải viết `NonNullable<BadgeProps["tone"]>`.
  `ProgressTone`, `LogoTone`, `CredentialRevealTone`, `ServiceLauncherStatusTone` đều đã xuất.

### Fixed

- **`<Form asChild columns={n}>` bỏ qua `columns` trong im lặng.** Nhánh không-asChild bọc
  children trong `ResponsiveGrid`; nhánh `asChild` dựng `children` và vứt `content` đi. Một biểu
  mẫu hai cột mượn thẻ `<form>` của app tụt xuống một cột — không lỗi, không cảnh báo, không
  than phiền kiểu. Nay lưới nằm BÊN TRONG phần tử được mượn, quanh các trường của nó.

- **`NumberInput suffix` vẽ ở vị trí của prefix.** `:first-of-type` / `:last-of-type` khớp theo
  KIỂU phần tử, mà các span bên trong control là prefix, suffix VÀ hai nút bước. Chỉ có suffix
  thì nó khớp `:first-of-type` và nhận inset đầu — đo ở control 1198px: `leftOffset` **12px**,
  đúng chỗ của prefix, nên `7日` đọc thành `日 … 7`; ô nhập còn trả luôn 32px đệm đầu cho một
  prefix không tồn tại. Có cả prefix lẫn suffix thì `:last-of-type` **không khớp gì cả** (span
  cuối là hai nút bước) và suffix rơi về `inset-inline-start: 0`. Nay đọc theo `data-slot`.

- **Tabs dọc bóp chết panel.** `tabPlacement="start"` khiến dải nút chiếm cả hàng: đo ở gốc
  1232px, dải **1133,72px (92%)** / panel **90,28px (7%)**, mỗi nút cao **105,52px**. Hai
  utility đặt sai trục — `w-full` trên list (khi gốc là HÀNG thì đó là cả hàng) và `flex-1` trên
  trigger (khi list là cột thì nó nở theo trục KHỐI). Sau: dải **85,92px (7%)** / panel
  **1138,08px (92%)**, nút **46,98px**.

- **`ListRow` giữ được `<li>` khi dùng `asChild`.** Trước đây `const Comp = asChild ? Slot : as`
  nên `as` bị bỏ im lặng: một danh sách LIÊN KẾT phải chọn giữa ngữ nghĩa `<ul>/<li>` và việc cả
  hàng là liên kết. Consumer nào cũng chọn cả hai bằng cách tự bọc mỗi hàng trong `<li>` hoặc
  `role="listitem"` — và làm thế thì mỗi hàng thành con DUY NHẤT của wrapper, nên luật đường kẻ
  `[data-slot="list-row"]:not(:last-child)` **không khớp lần nào**: cả danh sách dính liền, không
  lỗi, không cảnh báo, `ui-audit` vẫn xanh. Đo trên godx-task ở 20.0.0: ba hàng, cả ba
  `border-bottom-width: 0px`; năm màn hình của kho ấy đang mang một `border-b` viết tay để che.

  Nay `as` + `asChild` ĐI CÙNG NHAU: con giữ phần tử hàng, còn `as` lùi ra thành list item bọc
  ngoài — `<li data-slot="list-row-item"><a data-slot="list-row">`. Item mang đường kẻ thay cho
  hàng (hàng bên trong là `:last-child` nên luật cũ tự im). Đo lại trên cùng bố cục: 2 đường kẻ,
  hàng cuối trống, không nhân đôi. `asChild` đứng một mình không đổi gì.

## [20.0.0] - 2026-09-08

Bản major. Ba thay đổi PHÁ VỠ ở dưới; đọc chúng trước khi nâng.

### Removed — BREAKING

- **Radix không còn là nền của các primitive tương tác.** 13 component chuyển sang
  `react-aria-components`: Dialog, Sheet, DropdownMenu, Tabs, Popover, HoverCard, Tooltip,
  Checkbox, Toggle, Accordion, Collapsible, Label, Separator. `asChild` vẫn còn — kho tự dựng
  `Slot` của mình nên prop không đổi. Hành vi bàn phím của `Toggle` đổi thật (ba chỗ), và tiêu
  điểm quay về sau khi đóng Dialog/Sheet nay do FocusScope lo. Kho nào bám vào thuộc tính
  `data-*` của Radix hoặc import thẳng `@radix-ui/*` phải sửa.

- **`antd` bị gỡ khỏi devDependencies, cùng máy sinh màu của nó.** antd chưa bao giờ tới được
  bundle của consumer — nó là generator chạy lúc build, đẻ ra 20 màu dẫn xuất. **20 giá trị và
  20 TÊN token không đổi một byte nào**, nên không consumer nào phải sửa màu. Cái đổi là đường
  dẫn tệp: `tokens/antd.generated.css` → `tokens/derived.css`. Kho nào import thẳng tệp đó phải
  sửa đường dẫn; kho nào import `@godxjp/ui/styles` thì không phải làm gì.
  Thẩm quyền của 20 giá trị ấy chuyển từ "thuật toán sinh ra chúng" sang "bốn bộ đo chứng minh
  chúng đạt ngưỡng WCAG" — mạnh hơn chứ không yếu hơn, vì kho này đã phải ghi đè thuật toán bốn
  lần đúng ở chỗ nó nhất quán mà không tiếp cận được.

- **`--app-shell-rail-width` đổi tên thành `--app-shell-sidebar-collapsed-width`, KHÔNG có alias.**
  Tên cũ nghĩa là "bề rộng sidebar khi thu gọn" và đụng đầu với cột rail thật thêm ở bản này —
  hai token, cùng 4rem, cùng chữ "rail", nghĩa khác hẳn nhau. Một alias sẽ giải ra một bề rộng
  hợp lý dưới cả hai cách đọc rồi hỏng im lặng, đúng loại lỗi gói này chặn ở mọi chỗ khác.

### Added

- **`AppShell navRail` — cột điều hướng thứ ba** (hình dạng Slack/Teams: rail → sidebar → nội
  dung). Là một SLOT chứ không phải giá trị enum thứ tư, nên nó tổ hợp tự do với `topbarSpan`;
  cả bốn tổ hợp đều là hình dạng thật. Bề rộng `--app-shell-nav-rail-width` (3.5rem, cố ý khác
  4rem của sidebar-thu-gọn: bằng nhau thì hai cột dính thành một khối lúc sidebar gập). Là
  landmark riêng, có nhãn mặc định, và nội dung tự vào drawer ở ≤900px.
  Kèm **hợp đồng phạm vi**: rail = platform (đổi tổ chức, đổi app, thông báo, tin nhắn, sự kiện,
  cài đặt tổ chức) · sidebar = app · topbar = trang. Luật nằm trong tệp rule mà gói tự cài vào
  consumer.

- **`AppSettingToggle`** — một nút xoay vòng qua một setting có tập giá trị đóng
  (theme/density/fontSize/timeFormat), icon phản ánh GIÁ TRỊ hiện tại (Sun/Moon/Monitor), cho
  chỗ mà một `Select` không diễn đạt được.

- **`AppSettingPicker appearance="bar"`** — cùng bộ lược bỏ với `icon`, nhưng là một CELL của
  thanh bar: cao bằng bar, góc vuông theo `--topbar-item-radius`.

- **`Flex pad` / `padRaw`** (#408), **thang `gap` phơi đủ 10 bậc** (#401), **`Text link`** (#400),
  **`Calendar bordered` + trục `width`**, **`Button icon-xs`**.

### Fixed

- **Cell trong thanh bar không cao bằng thanh.** `.ui-topbar-item` luôn khai `align-self: stretch`,
  nhưng `.app-topbar-rail` và `.app-topbar-custom` không được bảo giãn nên rơi về chiều cao nội
  dung — mọi `align-self` bên dưới giãn vào một hộp 32px thay vì vào thanh 48px. Đo trên một
  consumer: mọi trigger 28–32px lơ lửng giữa thanh 48px, hover vẽ ra viên thuốc.

- **Drawer mobile giữ đúng hình dạng của vỏ mà nó thay thế.** Có rail thì drawer là HAI CỘT —
  rail hẹp, rồi danh sách mục — cùng thứ tự đọc với vỏ neo, nên ở 393px không phải học lại gì.
  Bản xếp chồng đặt rail lên trên với một dải trống ở giữa, và nó ép một lựa chọn mà không đáp án
  nào sống sót: giữ `collapsed` thì cả drawer là biểu tượng vô danh, bỏ `collapsed` thì bộ chuyển
  app của rail thành một danh sách rộng hết bề ngang, không phân biệt được với các mục bên dưới.

- **Drawer mobile thừa hưởng trạng thái thu gọn của desktop.** `collapsed` là câu trả lời của
  desktop (đổi nhãn lấy bề ngang trong cột neo); drawer không có sức ép đó và ở dưới breakpoint
  nó là điều hướng DUY NHẤT. Đo được: 6 biểu tượng vô danh, không một nhãn nào. Drawer nay tự
  khai nó là drawer và `Sidebar` bỏ qua `collapsed` ở đó.

- **`OrgSwitcher`**: trigger thu gọn đo được 44 × 32 trong khi token của nó tên là
  "44px — WCAG 2.2 AA touch floor" (luật `height` ở `@layer components` thua utility của
  `Button`); nay 44 × 44. Và `data-*` / `id` nay tới được trigger — trước đó bị nuốt, nên
  selector e2e của consumer rời ra trong im lặng.

- **`AppShell logo` bị `topbar` nuốt**: truyền `topbar` là logo biến mất, hai consumer không có
  thương hiệu suốt nhiều tháng. Dải logo còn tự đo sai chiều cao — `var(--topbar-height,
var(--control-height))` không bao giờ giải ra cái nào, vì fallback chỉ chạy khi biến KHÔNG
  ĐƯỢC KHAI, mà `--topbar-height` được khai là `auto`. Dải 28px cạnh thanh 48px, không viền dưới.

- **`check:mcp-prop-sync` mù với mọi prop CÓ tài liệu** — 460/1019 prop không được quét vì bộ
  quét không bóc chú thích trước. Mở mắt nó ra là bắt được ngay 16 mục catalog đã trôi khỏi mã.
  Cùng đợt: vá 5 + 12 lỗ khác tìm bằng phép thử đột biến trên 35/51 cổng.

### Changed

- Bộ agent-kit đi theo `npm update` chứ không dừng ở lần cài đầu, và tệp rule cho consumer nay
  so **digest nội dung** thay vì số phiên bản — sửa luật mà không phát hành thì trước đây không
  consumer nào nhận được, đo được: 1/3 kho nhận, 2/3 giữ bản cũ dưới một dấu đọc như đang mới.

## [19.6.0] - 2026-09-07

### Added

- **`Text link` (#400).** Cái móc "đây là một liên kết" cho chữ nằm trong nội dung chạy — tiêu đề
  issue trong ô bảng, tên trang trong danh sách, "xem tất cả" ở cuối hàng. Gạch chân khi rê chuột
  VÀ khi tiêu điểm bàn phím rơi vào, ở `--text-link-underline-offset`, kèm dấu tiêu điểm mà mọi
  phần tử tương tác khác đều vẽ. Nó là AFFORDANCE chứ không phải màu: `tone` vẫn giữ màu và chỉ đổi
  mặc định sang `primary`, nên `link tone="destructive"` đọc ra destructive mà vẫn gạch chân.
  Kèm `Text asChild` (Radix Slot) để đặt kiểu chữ LÊN chính thẻ mà router link dựng, và `as="a"`
  cùng bộ thuộc tính neo (`href`/`target`/`rel`/`download`). Token `--text-link-underline-offset`,
  `--text-link-underline-width`.

  Trước đó không có primitive nào cho việc này. `Button variant="link"` là một CONTROL —
  `.ui-button` mang `white-space: nowrap`, `flex-shrink: 0`, một bậc `--control-height` và đệm
  ngang — nên trong ô bảng nó không xuống dòng được và không chia được dòng của ô; một bên tiêu thụ
  đã phải viết `whitespace-normal` đè lên để gỡ đúng chỗ đó. Số còn lại viết
  `className="text-primary hover:underline"`, tức luật tiêu thụ 6 và 7 gộp trong một chuỗi — và
  `hover:` không bao giờ chạm tới người dùng bàn phím. Một ứng dụng, một lượt quét: 54 chỗ.

## [19.4.2] - 2026-09-07

### Fixed

- **Chữ mờ có biên tương phản thật.** `--muted-foreground` từ 42% xuống 39%. Ở 42% nó chỉ đạt
  4,63 trên chính `--muted`, tức vừa đủ ngưỡng mà không còn biên, nên mọi bề mặt đậm hơn nền
  trang một chút đều rơi xuống dưới chuẩn: 4,23 trên `--accent`, 4,28 trên nền alert tô
  destructive, 4,47 trên nền warning. Ba lỗi được báo riêng lẻ đều quy về một con số này.
- **Trạng thái lỗi đổi màu ở mọi lớp chrome.** `aria-invalid` trước đây chỉ đổi viền; vòng focus
  và vòng lúc trigger mở popup vẫn giữ màu thương hiệu. Nay chúng đọc `--destructive`, chỉ đổi
  màu nên bề rộng và độ mờ vẫn theo token chung. Gỡ luôn utility ring không sơn được gì ở Input,
  Select, Checkbox, Radio và Button.
- **Dấu bắt buộc của FormField** không còn rơi xuống dòng riêng khi nhãn ngắt dòng.
- **Chevron của pager đầy đủ** đúng cỡ icon; trước đây luật chỉ bắt dạng markup của pager gọn.
- **`AppSettingPicker appearance="icon"`** giữ ô vuông thay vì co còn 18px.
- **Khe chết 1 pixel ở đúng 900px**: thanh bên đã ẩn còn nút mở menu chưa hiện. Việc ẩn hiện nay
  do CSS sở hữu trọn vẹn, TSX không nhắc lại breakpoint nữa.
- **Cổng axe không còn báo thành công khi không nạp được trình duyệt** trên CI, và không còn bỏ
  đo lặng lẽ khi một khung đánh mất khai báo mở lớp phủ.
- **Khối sự kiện ngắn trong `TimelineGrid`** không còn đè lên nhau; sàn hiển thị nay tính bằng
  phút và là nguồn duy nhất cho cả CSS lẫn thuật toán xếp làn.

## [19.4.1] - 2026-09-06

### Changed

- **Cổng axe mở lớp phủ trước khi quét.** Trước đây nó chỉ nạp mỗi khung ở trạng thái mặc định
  rồi quét một lần, nên mọi luật chỉ tồn tại khi lớp phủ đang mở đều nằm ngoài tầm nhìn của cổng
  chứ không phải lọt lưới. Khung khai báo bước mở bằng `data-axe-open`; kết quả thành một scope
  thứ ba có allowlist riêng chỉ được phép co lại. Khai báo mà lớp phủ không hiện ra thì cổng báo
  lỗi chứ không im lặng bỏ qua.
- **Gate axe chia thành ba shard.** `AXE_SHARD=i/n` chia danh sách khung theo thứ tự ổn định. Đo
  tại chỗ: trọn bộ 164 khung mất 626 giây, một shard 55 khung mất 197 giây, nên đường găng còn
  khoảng 210 giây. Phép kiểm allowlist thừa chỉ chạy khi quét trọn bộ, và `--update-baseline` từ
  chối chạy dưới chế độ shard.
- **Dựng lại baseline axe không còn xoá phần ghi chú.** Mọi khoá cổng không sở hữu được chép
  nguyên văn và nêu tên trong log.
- Comment và chữ hiển thị trong tài liệu không còn mang số hiệu issue.

## [19.4.0] - 2026-09-06

### Added

- **`MobileShell`** (layout) — shell gốc cho ứng dụng cầm tay: thanh trạng thái, app bar, MỘT
  vùng cuộn, thanh hành động, tab bar. Gốc cao đúng một màn hình nên tài liệu không bao giờ cuộn
  và tab bar không trôi khi thanh địa chỉ thu lại; mọi băng tự đệm vùng an toàn của thiết bị.
  `height="viewport" | "fill"`. Tầng control trong shell là 44px vì app cầm tay là chạm trước.
- **`TimelineGrid`** (data-display) — lưới thời gian: trục giờ dọc, cột theo ngày, khối sự kiện
  đặt theo giờ bắt đầu và độ dài. Cửa sổ trục suy ra từ dữ liệu nên không lặng lẽ bỏ mất sự kiện;
  ca qua đêm bị cắt hình nhưng vẫn in đúng khoảng giờ; có xếp làn cho sự kiện chồng giờ.
- **`Flex` và `Badge` nhận `as`** với union đóng `"div" | "span"`, để chúng đặt được trong
  `<button>` mà không sinh HTML sai.
- **`GapProp` nhận `"none"`** cho `Flex` và `ResponsiveGrid`.
- **`TableCell` nhận `flush` và `indent`**, `PopoverContent` nhận `flush`.
- **`AuthShell` nhận `actions` và `measure="wide"`** cho trang đăng nhập có bố cục hai cột.

### Fixed

- **Nền bị ẩn khi lớp phủ mở không còn nhận tiêu điểm.** Select, DropdownMenu và ContextMenu ẩn
  phần còn lại của trang khỏi trình đọc màn hình nhưng vẫn để nền nhận tiêu điểm, nên axe báo
  `aria-hidden-focus`. Nay dùng `inert` gương theo dấu của Radix. Dialog, Sheet và Popover không
  đổi vì chúng vốn không có vi phạm.
- **Hàng bảng xếp chồng cao theo nội dung**, không còn giữ chiều cao hàng cố định nên ô không
  tràn khỏi khung thẻ.
- **Chữ phụ trong khối `TimelineGrid` đạt chuẩn tương phản** trên nền tô theo màu bên tiêu thụ.
- **Ví dụ trong `docs/` không còn dùng utility layout** mà bộ kiểm dành cho bên tiêu thụ cấm.

### Changed

- **CI: bốn shard test thật sự chia việc.** Lệnh cũ có dấu gạch trần nên cả bốn job chạy trọn bộ
  test, đo được 484 tệp mỗi job thay vì 121.
- **Cổng khoá phiên bản hai gói chạy ở làn chính.** Script `check:mcp-lockstep` trước đây được
  nhắc trong tài liệu nhưng KHÔNG tồn tại; kiểm tra chỉ chạy lúc phát hành, tức sau khi đã cắt
  tag. Đó là lý do một bản trước đây kẹt không publish được mà không ai thấy.
- **Guard fork cho `docs-lane.yml` và `ci-browser-full.yml`**, hai workflow nhận pull request và
  chạy trên runner tự host dùng chung.
- Comment trong `src`, `scripts`, `mcp` và `docs` chỉ nêu luật hiện hành; git history giữ quá khứ.

## [19.3.1] - 2026-09-06

### Fixed

- **`Badge color` degrades to the quiet chip, not the solid one (#349).** Both washes now name
  `--badge-tint-surface` first. A build that targets a browser without `color-mix` synthesises a
  fallback from the FIRST colour in the mix, and colour-first handed those browsers the solid
  chip the wash exists to avoid — with the surface's own label on it. Identical wherever
  `color-mix` is supported.

## [19.3.0] - 2026-09-06

### Added

- **`Badge color` (#349).** The record's OWN colour — a status an administrator coloured, an
  issue type, a tag — as a third axis beside `variant` (structure) and `tone` (meaning). The
  chip is WASHED rather than filled: `--badge-tint-fill` (18%) into `--badge-tint-surface`, the
  edge at `--badge-tint-edge` (45%), the label from `--badge-tint-foreground`. A solid chip has
  to choose a foreground and no choice clears WCAG AA for every colour a picker can produce
  (near-black and white measure equal at luminance 0.2029, both 4.15:1); washed, the worst case
  across the sRGB cube is 8.52:1 on both themes. No fill/tone utility is emitted in this mode,
  so the components-layer wash is reachable (the gh#260 layering trap).

## [19.2.0] - 2026-09-05

### Added

- **`CodeBlock` (#339).** A block of preformatted text in `data-display`: mono, muted surface,
  `wrap` (default on), `maxHeight` (`sm` / `md` / `lg` / `none`), `size` (`xs` / `sm`),
  `language`. Tokens `--code-block-*`. A block that can scroll is a tab stop with the focus ring.
- **`Prose` (#338).** Typography for rendered content (Markdown, CMS bodies) in `data-display`:
  styles descendant h1..h4, p, lists, blockquote, code, pre, table, a, img and hr from the tokens.
  `size` (`sm` / `md`), `imageSize` (`fit` / `original`). Tokens `--prose-*`; `pre` shares the
  CodeBlock knobs.
- **Calendar footer (#335).** `showToday` and `showClose` on Calendar, DatePicker and
  DateRangePicker (both off by default); `onClose` and a `footer` slot on Calendar. Today is
  disabled outside `startMonth` / `endMonth` or a `disabled` matcher. Tokens
  `--calendar-footer-space-gap`, `--calendar-footer-space-block-start`,
  `--calendar-footer-border-width`; strings `dataEntry.calendar.today` / `.close` (en, ja, vi).

### Fixed

- **Control tokens reach every control (#334).** `--control-border-width`, `--control-shadow`
  and `--disabled-opacity` now paint Textarea, SelectTrigger, MonthPicker, MonthRangePicker,
  DateRangePicker, TagInput and InputOTP, not only Input. The `border`, `shadow-sm` and
  `disabled:opacity-50` utilities that outranked them are gone from `controlTriggerClass` and
  `controlMultilineClass`; `.ui-control:disabled` owns the disabled affordance.
- **Invalid state paints on every control (#334).** Textarea, TagInput, Switch and the composite
  pickers honour `aria-invalid`.
- **Buttons show `cursor: pointer` (#334).**
- **TagInput sits on the control geometry (#334).** Height, radius, shadow, padding and font size
  read the `--control-*` tokens; its focus ring comes from `focus-ring.css` like every other field.
- **InputOTP rings read `--focus-ring-opacity` (#334).**
- **The whole of `control.css` is layered (#334).** The PasswordInput, InputOTP, Rating, TagInput
  and NumberInput block sat outside `@layer components` and outranked utilities.
- **`ErrorSurface` accepts any HTTP status (#336).** Unknown 4xx render as warning, unknown 5xx
  as destructive.
- **`PageContainer` footer keeps its bottom inset (#340).** `--page-footer-pad-block-end`.
- **`NumberInput` forwards `data-field` (#337).**

### Removed

- `controlFieldClass` (dead export), `--control-focus-ring-width` and the `--time-input-focus-ring-*`
  tokens and `.ui-time-input` rules (TimeInput no longer exists).

### Fixed

- **`scripts/ui-audit.mjs` cut its JSON report at 64 KB.** It called `process.exit()` on the
  line after writing the report; stdout to a pipe is asynchronous, so the process died with
  the pipe still draining. A consumer with 884 findings received 65,536 of 367,635 bytes and
  its JSON parse failed, which read as "the audit produced nothing" rather than as a
  truncation. The script sets `process.exitCode` now and lets the stream drain; the exit
  status is unchanged.

### Changed

- **`PageContainer` spaces its sections.** Every direct child of the page body gets
  `--page-body-gap` (the section step) above it. `--page-body-gap: 0`
  opts out.
- **One focus ring for every control.** `.ui-input`, `.ui-control-multiline` (Textarea) and
  `.ui-control-trigger` (Select / Cascader / TreeSelect triggers) join the single
  `focus-ring.css` list. All read `--focus-ring-width` /
  `--focus-ring-opacity` (2px, solid by default). Retune the two tokens, never per-control utilities.
- **Select rows are sized by the control layer.** `.ui-select-item` / `.ui-select-label` geometry
  moved from `navigation-layout.css` into `control.css`.
- **`styles/core`** — every component layer without the bundled fonts — is now the ONLY
  supported way to load less than `@godxjp/ui/styles`. Cherry-picking `*-layout.css` files is not supported.
- **`ui-audit` enforces the layout rules:** `no-utility-spacing`,
  `no-utility-layout` (error), `no-hand-rolled-surface`, `sibling-cards-need-flex` (warn), all
  `scope: "consumer"` (skipped when the library audits its own source; `--consumer` forces).
- **`visual-audit` measures geometry:** `css-layers-missing`, `control-height-mismatch`,
  `sibling-card-gap` (error), `row-content-starved` (warn).
- **`postinstall` installs the agent mandate** (CLAUDE.md block + `.claude/godxjp-ui-workflow.md`)
  by default; the PostToolUse / SessionStart hooks stay behind `npx @godxjp/ui init-agent`.

### Added

- **`SelectTrigger width="full" | "auto"`** — `auto` sizes the trigger to its label for a
  PageContainer `extra` slot, a toolbar or a footer row.
- **`Text` / `Heading` `weight="semibold"`** — an alias rendering at the canon's 500 step.
- **`docs/` ships in the package**, with **`docs/CONSUMER-RULES.md`** (ten rules) linked from the
  README and the mandate.
- **MCP patterns `page-sections` and `topbar-account-chip`**; the `PageContainer` catalog entry
  documents `children` spacing; `Select` documents `SelectTrigger width`.

- **`--centered-shell-bar-padding-x-compact`, `--centered-shell-main-padding-inline-compact`,
  `--centered-shell-footer-padding-inline-compact`** — the compact step of the horizontal
  page-inset axis for CenteredShell. They are separate inline-only knobs rather than a
  redefinition of the existing shorthands, so `--centered-shell-main-padding` and
  `--centered-shell-footer-padding` keep meaning all four sides.

### Changed

- **CenteredShell joins the horizontal page-inset axis (gh#330, applied to the shell it missed).**
  `--centered-shell-bar-padding-x` now defaults to `var(--space-page-x)` (24px) instead of
  `var(--space-4)` (16px), and the bar, main and footer all step to `--space-page-compact-x` at
  the page's own `(max-width: 720px)` line. gh#330 gave AppShell's horizontal row one owner and
  left this shell hard-coding the bar's inset while its own main and footer used a different
  value. Measured in Chromium on `/isolate/layout-centered-shell`, the bar's content sat at x=16
  and the column at x=24 — a constant **8px misalignment** at every width from 784px (the `md`
  tier, 46rem, plus the two 24px gutters, below which the column stops being centred and pins to
  the gutter) down to 320px. Now 24/24 at 784 · 760 · 721 and 16/16 at 720 · 700 · 390 · 320.

  The token comment claimed the bar mirrored `.app-topbar`'s inline padding; it had not since
  gh#330 moved that side onto `--space-page-x`, and that false claim was being shipped as the
  MCP catalog description for three tokens. A service that sets these knobs is unaffected above
  the step; below 720px the inline sides now come from the new compact knobs.

### Fixed

- **`check:visual-audit` could hang forever instead of failing (scripts/visual-audit-smoke.mjs).**
  Its 2-minute watchdog called `child.kill("SIGKILL")`, which signals the `node` child only and
  leaves the Chromium grandchild alive holding the inherited stdio pipes. `"close"` does not fire
  until the process has exited _and_ its stdio has ended, so the promise stayed pending and the
  gate hung rather than failing — the worst of the three outcomes, since a hang has no log to
  read. The child is now `detached` and the watchdog kills the whole process group, resolves the
  promise itself rather than waiting on the child to cooperate, and reports the timeout as its own
  failure instead of letting a truncated stdout surface as "did not emit valid JSON". Established
  sockets are dropped before `server.close()`, which would otherwise stay pending for the same
  reason.

## [19.1.0] - 2026-09-02

Published to npm as `@godxjp/ui@19.1.0` and `@godxjp/ui-mcp@19.1.0` (lockstep).
ADDITIVE ONLY — nothing is removed or renamed. `data-field` is inert, read-only metadata; the
native `name` is opt-in behind `<AppProvider emitFieldNames>` (default `false`); a consumer that
upgrades and changes nothing renders and submits exactly what it did on 19.0.0.

### Added

- **Field IDENTITY on every control — `data-field` always, native `name` opt-in** (#337) — a
  ported Japanese back office is driven by screen automation (RPA) as well as by people, and the
  rewrite silently took away the attributes that automation stands on. Measured by the customer on
  one screen (案件): `name` fell from **98 of 100** controls to **3 of 67**, and `id` from 82 to 42 —
  the 42 being text inputs only, with no select, radio or checkbox addressable at all. Their
  automation stops at cutover, which is why they filed it as 【切替可否に関わる】.

  This is not tool-chasing. `name` on a form control is basic HTML semantics, `data-field` is the
  industry-standard `data-testid` role under a name that says what it holds, and an id on a
  select/radio/checkbox is an accessibility requirement. The library's own e2e selectors get less
  brittle for the same reason.

  **`FormField` now injects the field's machine key onto its control**, resolved `field` → `name` →
  `id`. The new `field` prop exists for the case those diverge (`id="source_slip_field"` for
  `field="source_slip_id"`); it is needed rarely, because an app whose fields already carry
  column-named ids gets the attribute on every control **without editing a single call site** — in
  the Exseli port, 1,281 of 1,281 `<FormField>`s. A generated id is never used as a key: a `«r3»`
  token is not something anything outside React can be pointed at.

  The key travels the SAME route as the ARIA relationships (`pickFieldA11y` / `pickGroupFieldA11y`
  in `src/lib/field-a11y.ts`), so it lands on the semantic focus target of every control rather
  than a wrapper div, and a control added later inherits the behaviour instead of being forgotten.
  Verified in the DOM on Input, Textarea, NumberInput, Select (both APIs), SearchSelect,
  RadioGroup, CheckboxGroup, Checkbox, Switch, DatePicker, MonthPicker, TimePicker, the two range
  pickers, Cascader and TreeSelect.

  **NESTED controls too — `cloneElement` alone reaches 77%, and the acceptance condition is 100%.**
  Measured across the whole ported app: **322 of 1,410 controls (23%)** sit one level below their
  FormField, because the direct child is a `Flex` holding a from/to pair, a 年/月 combo, or a value
  beside a 「不明」 checkbox. `cloneElement` reaches exactly one level, so all 322 stopped on the
  wrapper `div`. FormField therefore also publishes the field through `FieldIdentityContext` and
  each control resolves its own key (`useFieldIdentity`) — the same mechanism `Select` already used
  to get past Radix's prop-swallowing root.

  A nested control's key is **its own `id`**, and that is a finding rather than a convention: of the
  322, **250 already carry a static id**, and the ambiguity a shared wrapper would create is already
  resolved at the call site (`search_billing_date_from` / `..._to`, `fax` / `fax_unknown`). So two
  controls can never end up sharing a key. The remaining **72 get nothing** — 48 have a computed id
  and 24 have none — because a fabricated key is worse than a missing one: automation binds to it
  and breaks silently on the next render. Those two groups are reported, not filled.

  Composites that own their own submit contract resolve the key themselves and hand it down, so the
  leaf resolver stands aside: `DatePicker` / `MonthPicker` keep `name` on the field they own rather
  than letting the `Input` they compose second-guess it, `Select`'s stays on the Radix native
  `<select>`, `SearchSelect`'s on its hidden input, and the range pickers keep their
  `${name}_from` / `${name}_to` split — now mirrored by `${field}_from` / `${field}_to`, which is
  the first time those two inputs have been addressable at all.

  **`name` is opt-in per app — `<AppProvider emitFieldNames>` (default `false`).** `data-field` is
  inert metadata; `name` decides what a native `<form>` submit sends. An app whose controls have
  never carried a `name` would start posting extra keys to its backend the moment it upgraded, and
  a package shared across services (omnify, dxs, exseli) may not make that decision for them. A
  `name` or `data-field` written on the control itself always wins over the injected one.

- **`Select` publishes the selected CODE as `data-value` on its trigger** (#337) — the trigger
  displays the option's LABEL (「東京本社」) while the row's value is `52`, and the only other place
  that code exists is Radix's `aria-hidden`, 1×1px native `<select>`. Reading it required either
  parsing the Japanese label or reaching into an element the customer reasonably described as
  invisible. Now on the visible element, in both the data-driven and compound APIs, tracking
  uncontrolled picks too, and omitted entirely while nothing is selected. **No DOM structure
  changed** — the hidden native `<select>` stays exactly as Radix renders it, which is what the
  customer asked for (「内部構造の変更までは求めません」).

## [19.0.0] - 2026-08-30

Published to npm as `@godxjp/ui@19.0.0` and `@godxjp/ui-mcp@19.0.0` (lockstep).
Upgrading from 18.x: see **[docs/MIGRATION-v19.md](docs/MIGRATION-v19.md)** — one removed prop,
four renamed tokens, and seven deliberate pixel-level changes that a pinned design will notice.

### Added

- **Icon size scale — the last geometric axis gets a name (gh#326).** `--icon-size-2xs` …
  `--icon-size-4xl` in `src/tokens/foundation.css`: 10 · 12 · 14 · 16 (`md`, the default) · 20 ·
  24 · 36 · 40 · 48 px. This names an EXISTING vocabulary rather than inventing one — 28 component
  tokens were declaring raw numbers, and between them they used exactly these nine values. It is a
  **fixed list, not a ratio scale** like `--font-size-*`, deliberately: 14/16 = 0.875 but
  20/16 = 1.25, so no single ratio generates the steps, and a stroked glyph that lands on half a
  pixel is a blurred glyph. The scale is NOT `--scaling`-multiplied; density is opted into by the
  tokens that want it (`calc(var(--icon-size-md) * var(--scaling))`, as `--control-icon-size`
  does). Documented in `docs/TOKENS.md` § Icon size and in the MCP token catalog.
- **A stated tier-1 / tier-2 boundary for icon sizing (gh#326).** Tier 1 = a value used in more
  than one place; it earns a step and a service retunes it once. Tier 2 = a value used in exactly
  one place (the 6px status dot); set that component's own `--*-icon-size` / `--*-glyph-size`
  token **at the call site** — `style={{ "--menu-icon-size": "6px" }}` or a `[data-…]`-scoped
  theme rule. An inline custom property wins by inheritance proximity, so tier 2 needs no
  `!important`, no `:root` override and no fork. `src/tokens/__tests__/icon-size-scale.test.ts`
  keeps that route open by asserting every icon rule reads its token through `var()`.
- `src/tokens/__tests__/css-token-resolve.ts` — resolves the token graph from the CSS source
  (cascade order read from `base.css`'s `@import` list, brace-walked selectors, `initial`
  fallthrough, injectable `--scaling`). jsdom applies no author cascade, so this is the only way
  to assert a token did not move.

- **`--page-header-min-block-size-chrome` — a band height for `PageContainer`'s chrome header
  (gh#331).** A document header is content-height, correctly: a title is as tall as the title is.
  Chrome is furniture, and furniture needs a band that things centre INTO — `AppShell` has had
  `--app-shell-bar-height` for exactly that, `PageContainer` had no equivalent, so a
  `headerScale="chrome"` band's vertical centre drifted with its own copy (measured in Chromium on
  `/isolate/layout-page-container`: 42.02px with an `extra` control, 40.38px without) and nothing in
  the page could be aligned to it. Default `auto` — the quiet state (rule #44): no floor,
  content-height, byte-identical to every page shipped before it, document AND chrome. **The
  band-height axis has ONE owner and it is `--app-shell-bar-height`** (`--centered-shell-bar-height`
  already reads it), so the one line a service writes to put its page chrome on the shell bar's band
  is `--page-header-min-block-size-chrome: var(--app-shell-bar-height)` — the band becomes 48px and
  the title column and `extra` both centre at y=24 regardless of copy length. It is not that value
  by default because a chrome `PageContainer` is not necessarily inside an `AppShell` (the canonical
  chat composition renders one inside a bordered region, a `SplitPane` pane, a `Card`), and a band
  that is not trying to line up with a bar has no business inheriting that bar's height. A MIN,
  never a height: a taller `extra` still fits instead of overflowing. The rule adds
  `justify-content: center` alongside it — a floor with top-packed content is dead air, not a
  centred band — and that declaration is inert while the knob is `auto`.

- **`check:token-scale-bypass` — a token that declares a raw number on an axis that already has a
  scale now fails CI (gh#332).** gh#324 measured a near-perfect correlation across every geometry
  token: an axis WITH a named scale stays disciplined (font-size 4% raw), an axis WITHOUT one is
  almost all raw numbers (width 91%). But a scale alone was not enough — four type tokens went
  around the most disciplined axis in the system, and `--sidebar-nav-item-font-size: 0.8125rem`
  put every sidebar nav row 13px off the type rhythm with nothing in CI to notice. The guard
  enforces only axes that have steps to write instead of a number — today font-size, padding, gap,
  margin, radius and (since gh#326) icon-size — and declares the rest (width, height, size, offset)
  with the reason each is still waiting, so switching one on later is a one-line change.
  It is a ratchet like the other value guards: `scripts/token-scale-bypass.baseline.json` records
  today's 55 bypasses by token name and may only shrink; a stale baseline fails too, so a cleanup
  cannot silently creep back. `src/tokens/components/email.css` is excluded with the reason
  recorded in the guard header — HTML email cannot read custom properties, so every value there
  must be a literal.
- **A sanctioned route to an off-grid value.** A literal keeps its place when the declaration (or
  the line above it) carries a block comment reading `scale-exempt: <reason>` — a real reason, 12
  characters or more. Every exemption honoured is PRINTED on a passing run, so the exceptions stay
  countable and reviewable instead of hiding in prose. This is the second tier gh#325's consumers
  asked for: named steps for the common case, plus a legitimate way to write the 6px status dot
  that will never be on any scale — no `!important`, no global token override, no fork.

- **`no-off-scale-token-value` — the consumer-facing half of the scale-bypass rule (gh#324).**
  `check:token-scale-bypass` (gh#332) reads this repo's own `src/tokens/**` and so teaches nobody
  building WITH the library. The static `ui-audit` CLI now carries the same rule for the one place
  an app can silently leave the scale: a design-system knob it overrides itself
  (`style={{ "--card-space-inset": "13px" }}`), which is the sanctioned per-instance override
  route. It is the token-override sibling of `no-arbitrary-spacing` / `-size` / `-typography` /
  `-radius`, which only see a raw number in a Tailwind class.
  - Only axes that HAVE named steps are flagged: space/padding/gap/margin, font-size, radius,
    icon-size. width, height, size and offset have no scale yet, so a number there is the only
    thing to write and is not a finding. The name pattern resolves an axis exactly the way the
    framework guard does (furthest-right wins, so `--x-space-offset` is an offset and
    `--x-font-size-width` is a width); it was checked name-for-name against all 982 published
    component tokens, with zero disagreement.
  - `var(--space-4)` and `calc(var(--radius) - 1px)` derive from a scale, `0` and the `1px` device
    hairline are steps of nothing, and `100%` / `1.5` are not lengths. None of them are findings.
  - It is a **warning**, not an error. The framework guard could ship as a hard gate because it had
    a ratchet baseline to stand on; a consumer repo has none, and the CLI exits non-zero on errors
    only. A warning is the honest analogue: agent guidance on a surface nobody has been linted on
    before.
- **`scale-exempt:` works in a consumer app too.** A rule may now declare its own in-place escape
  alongside the generic `ui-audit-disable-line <id>`. `no-off-scale-token-value` uses it: a value
  that is genuinely off the grid keeps its literal and carries a
  `/* scale-exempt: 6px status dot, below --space-1 */` block comment on that line or the one
  above, the same marker and the same 12-character minimum the framework guard honours. The point
  is that off-grid values are not forbidden, they are DECLARED — a catalogue that teaches "always a
  step" is exactly what turns a real exception into `!important` or a forked component. Documented
  in the MCP `list_audit_rules` catalogue, so an app-dev's agent reads the escape along with the
  rule.

- **Release trigger is now a git tag.** `.github/workflows/npm-publish.yml` fires on `push: tags: ["v*"]`.
  The pipeline is: merge to `main` → CI; push `vX.Y.Z` → release. `workflow_dispatch` is kept as the
  manual escape hatch and for `--adopt-staged` recovery. `scripts/release.mjs` gains
  `--tag vX.Y.Z`, which takes the target version from the tag and refuses if `package.json` does not
  already carry it — the version bump must be merged and CI-verified _before_ the tag is cut.
- **`verify-release-tag` preflight gate.** Before the first publish the release proves the tag names the
  version the manifests carry, points at the commit being released, and that the commit is an ancestor
  of `origin/main`. A tag for the target version that already claims a different commit refuses even on
  the non-tag paths. The release never creates, moves or force-writes a tag.
- **`verify-target-outranks-latest` preflight gate.** The target must be _strictly greater_ by semver
  than the published `latest` for both `@godxjp/ui` and `@godxjp/ui-mcp`. `assertFreshTargets` only ever
  refused re-publishing the _same_ version, so a release cut from a stale checkout could publish a
  _lower_ one and `PromoteUiLatest` would drag `latest` backwards, silently downgrading every consumer
  on a caret range. A first-ever publish (no `latest`) is unaffected; `--recovery` and `--adopt-staged`
  may re-drive a version that is already `latest`, but never a lower one.
- **`verify-commit-provenance` preflight gate.** The release requires a `success` CI check run on the
  exact SHA being published for every gate `verify:release` would have run (the map is
  `CI_PROOF_FOR_RELEASE_GATE` in `scripts/release-core.mjs`). Absence, an unfinished run, a `skipped`
  conclusion, a truncated page or any other red check on the same commit all refuse.
- `verify:publish-tree` script: `build && check:packed-public-contract && check:use-client &&
check:dist-tokens-resolve && check:mcp-lockstep` — the part of the publish tree a CI verdict on the
  commit cannot cover, because `dist/` is not in git.
- `--full-verify` flag (and a `full_verify` workflow input): re-run the whole `verify:release` locally
  instead of trusting CI's verdict. It only ever adds work.

- **`Activity` — the official ambient/looping motion primitive (`@godxjp/ui/general`, gh#313).** The
  loop counterpart to `Reveal`'s one-shot entrance: a continuous, unbounded "something is happening
  right now, elsewhere" mark (someone typing, a sync running, a response streaming, a recording
  live). Three marks — `dots` (the ellipsis convention), `pulse` (a breathing mark), `bar` (an
  indeterminate sweep) — on the standard `size` (`xs|sm|md|lg`) and `tone` ladders. It exists so a
  consumer never hand-rolls a looping `@keyframes` plus its own `prefers-reduced-motion` guard, and
  never reaches for `Skeleton` (which means _content is loading_ and hard-codes `aria-busy` +
  an unconditional `aria-live`) or `Button loading` (which means _this action is in flight_).
  - **`announce` defaults to `false`, and then emits no live region at all.** An ambient indicator
    flickers on and off with every socket event; a live region there re-announces continuously.
    `announce="polite"` wraps **only** the label in one `aria-live="polite" aria-atomic="true"`
    region, with the mark outside it and `aria-hidden`. No `aria-busy` is ever emitted; the
    indicator is not focusable and carries no role.
  - **Reduced motion is a designed frame, not an absence.** Under `prefers-reduced-motion: reduce`
    the loop is dropped and each mark falls back to a legible resting state — three solid dots, a
    solid pulse mark, a bar segment parked at the reading-start (a full track would read as
    "complete") — with the label still visible and no layout shift (WCAG 2.2 SC 2.3.3 / SC 2.2.2).
  - Copy stays consumer-owned: pass a `t()`-translated `label`, and pluralize "N people are typing"
    with your own `Intl.PluralRules`. The library ships no string for it.
- **`--duration-loop` (1400ms)** — the cycle member of the motion tier. `--duration-{fast,base,slow}`
  time a transition; a loop needs an interval, so every ambient affordance breathes at one rate.
- **Activity component tokens** (cardinal rule #45): `--activity-interval` (defaults to
  `--duration-loop`), `--activity-stagger-step` (160ms — the loop counterpart to
  `--reveal-stagger-step`), `--activity-mark-size`, `--activity-mark-offset` (the loop counterpart
  to `--reveal-distance`), `--activity-mark-rest-alpha`, `--activity-pulse-mark-size`,
  `--activity-gap`, `--activity-font-size-{xs,sm,md,lg}`,
  `--activity-bar-{width,height,radius,segment-width,track-alpha}`, and `--activity-color` —
  a role-mirror knob declared `initial` at `:root` with the role default at the call site, so a
  scoped `[data-tenant]` / `.dark` override of `--muted-foreground` still reaches the mark.
- Docs: `docs/general/activity.tsx` — a real channel screen with a typing affordance under the
  composer, plus every `variant` × `size` × `tone`, the `children`+`label` split, `announce`, and
  the reduced-motion contract.

- **`Separator` — a labelled variant (gh#308).** `label` now INTERRUPTS the rule, so a message
  stream's day divider and its "new messages" unread watermark finally have a primitive: the root
  becomes the three-cell grid `rule · label · rule`, and because "new messages" is content rather
  than decoration it flips `decorative` to `false` — a real `role="separator"` whose accessible name
  IS the label, with the visible node `aria-hidden` so the string is announced exactly once.
  `labelAlign` (`start | center | end`, the shared `TextAlignProp`) places the label by re-measuring
  a grid TRACK on the inline axis, so `start` and `end` swap under `dir="rtl"`; `tone`
  (`TextToneProp`) moves the rule AND the label together so an attention rule is never colour-only.
  Without a `label` the DOM, `data-slot="separator"` and `.ui-separator` are unchanged — an inert
  default, no migration. Consumers no longer have to misuse the auth-scoped `AuthDivider` or
  hand-roll a `<div>` grid of two `<span>` rules.
- **`--separator-*` component tokens** (`src/tokens/components/separator.css`) — `rule-size`,
  `rule-color`, `label-gap`, `label-inset`, `label-font-size`, `label-line-height`,
  `label-font-weight`, `label-color` plus `tone-{muted,primary,success,warning,destructive,info}-{rule,label}-color`.
  Every constant the labelled rule needs is now a documented knob (rules #44/#45); the defaults are
  the quietest state (one hairline, a muted `xs` label, no padding). Colour knobs and the two
  density-scaled spacing knobs are declared `initial` with the default at the call site, so a scoped
  `[data-tenant]` / `.dark` / `.ui-density-*` override actually reaches them.
- **`OrientationProp`** (`horizontal | vertical`) promoted into the shared prop vocabulary, so
  `orientation` means one thing across the library instead of being re-spelled per component file.
- **`SeparatorProp` / `SeparatorProps`** exported from `@godxjp/ui/layout` and registered in
  `src/props/registry.ts`.

- **Avatar `presence`** (gh#309) — a realtime reachability indicator on the mark itself:
  `presence="online | away | busy | offline"`, plus `presenceLabel` to override the wording. The
  prop ships the dot, its geometry tokens and a localized `sr-only` label together, so presence is
  never colour-only (WCAG 1.4.1): each value also has its own silhouette — `online` a filled disc,
  `away` a half-filled disc, `busy` a filled disc cut by a do-not-disturb bar, `offline` a hollow
  ring — which keeps the four apart in greyscale, for a deuteranope and under forced colors. Omit
  the prop for an entity with no presence concept (an organization mark, a capability medallion):
  no node and no attribute are emitted and the DOM is byte-identical to before. `presence="offline"`
  stays the different, positive statement "known to be unreachable", the same distinction `ListRow`
  draws between an omitted and a `false` `unread`. The dot carries no `aria-live` on purpose — a
  socket-fed roster of 40 marks resyncing would flood a screen reader, so announcing a _change_ is
  the consumer's call in the consumer's own live region.

  This replaces the hand-rolled `<span className="relative">` + absolutely-positioned
  `bg-green-500 ring-2 ring-background` wrapper, which could never be got right from outside the
  component: the dot's inset is a function of the mark's own `--avatar-*` radius/size tokens and of
  the root's clip, neither of which a page can read.

- **`--avatar-presence-{size,min-size,inset,ring-width,ring-color,stroke-width,bar-inline-size,bar-block-size,online-color,away-color,busy-color,offline-color}`**
  (gh#309, cardinal rules #44/#45) — every constant of the presence indicator is a documented knob.
  `--avatar-presence-size` is a **proportion** of the mark (default `30%`, floored by
  `--avatar-presence-min-size`), not a px step, so one value tracks every avatar the system paints:
  the `--control-height` box and its xs/sm/lg steps, `--avatar-square-size`,
  `--org-switcher-avatar-size`, `--upload-avatar-size`, a call site's own `size-12`, and the 36px
  `ListRow density="compact"` mark. `--avatar-presence-ring-color` and the four state colours are
  role-mirror knobs declared `initial` with the role default at the call site
  (`var(--knob, var(--role))`), so a scoped `[data-tenant]` / `.dark` override of `--background`,
  `--success`, `--warning`, `--destructive` or `--muted-foreground` reaches them instead of the ring
  freezing light-mode-white on a dark avatar.

- **`dataDisplay.avatar.presence.{online,away,busy,offline}`** in `en` / `ja` / `vi`.

- **`Textarea` — `autoGrow` (gh#310).** Opt-in auto-grow on the primitive: the box grows with its
  content between `minRows` and `maxRows`, and scrolls internally past the ceiling instead of
  pushing the page. Works controlled and uncontrolled, and re-measures on a paste, a programmatic
  value change, `form.reset()`, the `allowClear` ✕ and the end of an IME composition — not only on
  typing. Sizing is done in CSS by a hidden replica of the text (the replicated-content grid), so
  the component never writes `style.height`, never reads `scrollHeight` (no forced reflow per
  keystroke) and never moves `scrollTop`; the first paint is already the right height. Replaces the
  hand-rolled `onInput` + `style.height` workaround the MCP catalogue used to instruct consumers to
  write.
- **Textarea auto-grow tokens** — `--textarea-autogrow-line-height` (`initial`, read as
  `var(…, var(--line-height-normal))`), `--textarea-autogrow-min-height-rows` (1),
  `--textarea-autogrow-max-height-rows` (8) and `--textarea-autogrow-box-inset`, plus
  `--control-multiline-padding-block` (`--space-2`) for the multiline box's own block padding
  (rules #44/#45). Bounds are counted in TEXT ROWS so they survive a density change and a
  `--font-size-base` retheme; the floor is clamped up to `--control-height` so a resting one-row
  composer still lines up with the Input/Button beside it. Every default reproduces today's
  geometry when `autoGrow` is absent.

- **ScrollArea `viewportRef`** (#311) — a typed ref to the element that actually scrolls. The
  forwarded `ref` lands on the Radix `Root`, which is `overflow: hidden` and never scrolls, so
  `scrollTop`, `scrollHeight`, `scrollTo()` and a `scroll` listener had no public route at all. The
  only workarounds were `querySelector("[data-radix-scroll-area-viewport]")` — a Radix internal that
  a major bump renames silently and that matches the wrong node as soon as two ScrollAreas nest —
  or replacing the component with a raw `overflow-auto` div, which throws away the tokenized rail
  and the WCAG 2.1.1 tab stop.
- **ScrollArea `anchor="bottom"`** (#311) — bottom anchoring for a live stream (chat, log tail,
  streaming response, activity feed), with `anchorOffset` and `onAnchoredChange`. Default `"none"`
  keeps every existing ScrollArea byte-identical. The behaviour is deliberately _not_ "scroll to the
  bottom when content arrives" — that is the bug it replaces: the viewport mounts on the newest
  item, follows new content only while the reader is within `anchorOffset` of the bottom, and once
  they scroll up to read history nothing moves them again until they come back. Content inserted
  ABOVE the read position is compensated so the row under their eyes stays put; that compensation
  restores a recorded (anchor row, offset-from-top-edge) pair, which makes it idempotent with native
  CSS `overflow-anchor` and therefore a fallback for the two cases native anchoring does not cover
  (Safari, which does not implement scroll anchoring, and a scroller sitting at `scrollTop === 0`).
  Anchoring writes the scroll offset and nothing else: it never moves focus, never animates
  (`behavior: "instant"`, so a theme's `scroll-behavior: smooth` cannot turn it into motion —
  WCAG 2.3.3), and adds no `aria-live` region. `onAnchoredChange` exists so the consumer can render
  a real focusable "jump to newest" Button — the anchor must not be the only route back to new
  content.
- **`--scroll-area-anchor-offset`** (default `3rem`, #311) — the stickiness band, i.e. how close to
  the bottom still counts as "following the stream" (cardinal rule #45). The right distance is a
  function of the row height a service renders, and in rem it is still one row at 200% zoom. The
  `anchorOffset` prop overrides it per instance.

- **Toggle / ToggleGroupItem: the counter-pill vocabulary** (`count` / `overflowCount` /
  `showZero` / `countLabel`) — gh#312. `Button` owned the count and `Toggle` owned the pressed
  state, so a counted pressed chip (a faceted filter chip "Open 42", a counted segmented toggle, a
  reaction chip) had no primitive. `count` is now the SAME vocabulary `Button` defines, lifted
  verbatim, so a counted filter tab and a counted pressed chip read identically: the number is
  formatted with `Intl.NumberFormat` on the active locale, capped as `{overflowCount}+` above the
  cap (default 99, the cap itself locale-formatted), and `showZero` (default `true`) controls the 0
  case. The chip stays ONE `button[aria-pressed]` — one tab stop, one focus ring, one accessible
  name — so no `Badge` is ever nested inside a Toggle for a count. `countLabel` folds the count's
  unit into that name, which always resolves to "&lt;label&gt;, &lt;count&gt; &lt;unit&gt;"
  ("Unread, 12 items"; "thumbs up, 3 reactions" for an emoji chip whose name comes from
  `aria-label`). The count is announced exactly once and deliberately has no `aria-live`: a count
  driven by other people is not this control's status. On `ToggleGroupItem` the count is per item —
  `variant`/`size` still come from the group's context.
- **Toggle counter-pill + pressed-state tokens** (`src/tokens/components/toggle.css`, gh#312, rules
  #44/#45): `--toggle-count-min-width`, `--toggle-count-space-inline`, `--toggle-count-font-size`,
  `--toggle-count-radius`, `--toggle-count-gap` (quiet default `0`, additive to the toggle's own
  flex gap), `--toggle-count-background`, `--toggle-count-color`,
  `--toggle-pressed-count-background`, `--toggle-pressed-count-color`,
  `--toggle-pressed-border-color` and `--toggle-count-forced-outline-width`. The geometry knobs
  carry Button's exact counter values off the same primitive scale — a Toggle count set beside a
  Button count measures identically in a browser (12.47px · min-inline 16px · 4px inline padding ·
  pill radius · tabular-nums), and a token-parity test fails if either side moves alone. The COLOUR
  knobs are deliberately Toggle's own and are role-mirror knobs (`initial` at `:root`, role default
  at the call site): Toggle's pill sits on a surface that inverts when pressed, and Button's
  translucent-tint treatment cannot clear WCAG 1.4.3 AA over it (measured 3.82:1 at the xs step, and
  4.39:1 even at the lowest usable alpha). Toggle's pill uses opaque role fills that invert with the
  state instead — measured 5.04:1 pressed / 14.18:1 unpressed in light, 7.05:1 / 12.44:1 in dark.
- **`docs/data-entry/toggle-count.tsx`** — a real screen (ticket inbox) showing a faceted filter
  chip row driving a `DataTable`, a reaction row, a Toggle count beside a Button count, and the
  size × variant × pressed × disabled grid.

- `--table-flush-divider-width` (`src/tokens/components/table.css`) — the width of the ONE edge a
  full-bleed table keeps inside `<CardContent flush>`: the divider between a plain `CardHeader` and
  the first row. Default `var(--table-row-border-width)`. A theme sets it to `0` for a borderless
  full-bleed table, or heavier for a stronger band (cardinal rules #44/#45).

- `--switch-unchecked-background` (component token, `initial`, call-site default
  `hsl(var(--input))`) — the Switch's off-track fill is now its own knob, so a service can quieten
  it without dragging the `--input` control-boundary role back below the SC 1.4.11 floor
  (cardinal rule #45). Whatever it is set to still owes 3:1 against the page and against the
  thumb (`--background`).
- `src/tokens/__tests__/input-boundary-contrast.test.ts` — deterministic guard that recomputes the
  ratios straight from `foundation.css` for both themes across page / card / popover / muted /
  secondary / striped row / hovered row, fails below 3:1, and fails outright if `--input` and
  `--border` are ever given the same value again.

- **`--form-grid-row-gap`** — row rhythm between the rows of a `<Form columns={n}>` grid. Defaults
  to `--form-field-row-gap`, so the stacked and grid paths cannot drift; retune it alone only to
  give multi-column forms a looser row rhythm than stacked ones.
- **`--form-grid-column-gap`** — gutter between the columns of a `<Form columns={n}>` grid
  (cardinal rule #45; previously ResponsiveGrid's generic stack gap with no knob). Default keeps
  the historical 16px, so nothing moves unless a theme opts in.

- **`check-dist-tokens-resolve`** — the first guard that reads the SHIPPED artifact rather than
  the source. Two checks, no baseline, because a token that does not resolve does not exist:
  every custom property in `dist/` must sit inside a real rule body (the 122-dead-token shape),
  and every `var(--x)` without a fallback must resolve to one that survived (the `--space-9`
  shape, where two tokens referenced a rung `foundation.css` skips). It reports **1,189 live
  declarations across 46 shipped stylesheets and 0 dead**, and was proved against both bug shapes
  by reintroducing them and watching it name the file and line.
- **A shadcn-compatible registry, publishing the design language rather than the components
  (#316 Phase 5).** `@godxjp/theme` (the token system) and `@godxjp/styles` (the stylesheets it
  drives) resolve at `https://godx-jp.github.io/godxjp-ui/registry/{name}.json` through the
  existing Pages deploy — no new infrastructure. A consumer adds one line to their own
  `components.json` and runs `npx shadcn add @godxjp/theme`.
  **The 165 components are deliberately NOT published.** A registry is a copy-paste channel;
  copying them would fork a consumer's copy from the package, so they would stop receiving token
  and a11y fixes while carrying ~73k lines they did not write. The library is an npm package and
  stays one. What a registry is genuinely right for here is the half the package cannot hand you:
  `docs/showcase/acme-portal.tsx` reproduces an entire brand — gold and navy, Source Sans 3, a
  14px radius, tinted shadows — by configuring tokens alone, with no component edits. Tokens are
  values rather than logic, so a copied theme cannot drift into a broken component.
  The theme ships its CSS files verbatim instead of flattening them into `cssVars`: the system is
  layered on purpose and the density axis resolves through `calc(… * var(--scaling))`, so a
  flattened value map would compute that away and hand over a frozen snapshot that no longer
  answers to `--scaling` or a scoped `[data-tenant]`.

### Changed

- **A release may now proceed past a check that is red for a DECLARED reason (gh#333).** The
  provenance gate fail-closed on any red check on the commit, including ones outside its own
  required list — so the five `rendered-runtime` shards, which are failing on their own harness
  rather than on the library, blocked a release whose eight required checks were all green.
  `RELEASE_BLOCK_EXEMPT` names them with the reason, the same shape as the token guard's
  `scale-exempt:`: an exception has to be written down and defended, not achieved by quietly
  deleting a name from the required list. `REQUIRED_CI_CHECK_RUNS` is unchanged, any red check
  outside the exemption still blocks, and a test asserts both directions.

- **TypeScript 7 now judges the code, side by side with the 6 that `typescript-eslint` needs
  (gh#322).** The block was real but narrower than the issue recorded: `typescript-eslint@8.68.0`
  does not merely declare a conservative peer range, it **hard-throws** on TS >= 7 with a pointer
  to Microsoft's own side-by-side guidance. What made side-by-side viable here is a fact nobody
  had checked: this repo runs `tseslint.configs.recommended`, the NON-type-checked preset, with no
  `project` / `projectService` anywhere — so typescript-eslint is a syntactic parser here and
  touches none of the checker API the peer range exists to protect. The warning written into #322
  ("never force it — the type-aware rules will degrade silently") was sound in general and did not
  apply to this configuration.
  `typescript` stays 6.0.3, which is what typescript-eslint and tsup's `.d.ts` build resolve;
  TS 7.0.2 is installed as `typescript-7` and runs `typecheck` and `typecheck:docs`. Both
  compilers therefore run on every CI pass — 7 checks the source, 6 builds the shipped types — so
  "the codebase is ready for 7" stops being a one-off measurement and becomes a standing gate.
  `typecheck:ts6` remains for checking the version consumers actually resolve.
  Two attempts that did NOT work, recorded so nobody repeats them: raising `typescript` to 7
  outright breaks `pnpm lint` at load time, and pnpm `overrides` of the form
  `"typescript-eslint>typescript"` do not help, because `typescript` is a PEER of those packages
  and peers resolve from the importer, not through an override.

- **All 30 icon/glyph size declarations now read the scale (gh#326).** `--control-icon-size`,
  `--stat-card-icon-size`, `--upload-dropzone-icon-size`, `--sidebar-nav-icon-size` … every one.
  **No resolved value moved**: all 37 icon tokens verified identical at default, compact (.92),
  comfortable (1.08) density, inside `.ui-scale-fixed`, and inside a `.ui-density-*` subtree.
  Every existing token name is kept — nothing renamed, nothing deleted — so a theme overriding an
  old name is unaffected.
- **`--card-service-launcher-icon-glyph-size` no longer reads the spacing scale (gh#328).** It was
  `var(--space-5)` — a glyph size borrowing the SPACING axis, so a density retune moved it along
  an axis nobody chose. It is now `calc(var(--icon-size-lg) * var(--scaling))`: the right axis,
  and the `* var(--scaling)` preserves the density tracking its sibling `--card-service-launcher-icon-size`
  (which reads `--control-height-lg`) has. Resolved value unchanged at every density — a plain
  `var(--icon-size-lg)` would have silently frozen a glyph that used to breathe.

- **gh#327 is a false alarm; the `foundation.css` declaration must NOT be deleted.**
  `--control-icon-size` / `--control-icon-size-sm` at `foundation.css` are inside
  **`.ui-scale-fixed`**, not `:root`, so they never compete with `components/control.css`'s `:root`
  declarations and are not shadowed by import order. They are load-bearing: `.ui-scale-fixed` pins
  persistent chrome (the AppShell topbar, the search palette) to baseline density, and because
  `var(--scaling)` is substituted at the element that DECLARES a token, setting `--scaling: 1`
  alone cannot un-bake the `:root` values — every `--scaling`-derived token must be re-declared,
  which is exactly what that block does (`src/lib/__tests__/theme-tokens-css.test.ts` already
  guards the list). Deleting them would silently make the topbar track density.
  Recorded as an assertion so the deletion is not attempted again.
- **The shadowed-token sweep gh#327 asked for: two, neither on the icon axis.**
  `--banner-radius` (same value) and `--banner-border-width` (**different values** — `0` in
  `components/feedback.css:89`, `1px` in `components/banner.css:11`; `banner.css` is imported
  later and wins, so the `feedback.css` copies never apply). Left for the owner of those files;
  frozen in `icon-size-scale.test.ts` so a third cannot appear unnoticed.
- **Seven icon rules still bake a literal size and are unreachable from an app.**
  `[data-slot="alert-icon"]` 1.25rem · `[data-slot="badge-icon"]` 0.75rem ·
  `.ui-otp-separator-icon` 1rem · `.ui-menubar-sub-trigger-icon` 1rem ·
  `.ui-navigation-menu-trigger-icon` **0.9rem (14.4px, off-grid)** · `.tb-chip-icon`
  **1.125rem (18px, off-grid)** · `.tb-icon-btn svg` 1rem. No token exists for any of them, so
  tier 2 does not reach them at any price. Frozen as a shrink-only ratchet; fixing them needs new
  component tokens plus a `no-hardcoded-css-values` re-baseline.
- **Six more cross-axis reads on non-icon axes (gh#328's scan, outside this change).**
  `--button-count-min-width` and `--toggle-count-min-width` (`--space-4`),
  `--card-service-launcher-skeleton-title-width` (`--space-12`),
  `--card-service-launcher-skeleton-status-width` (`--space-10`), `--avatar-presence-min-size` and
  `--list-row-indicator-size` (`--space-2`). The last two are 8px INDICATOR dots — a different
  axis from icons, and evidence that a 6px dot belongs in tier 2, not on the icon scale.

- **The horizontal page-inset axis has ONE owner: the page gutter (gh#330). `AppShell`'s top bar
  MOVES.** `--app-shell-bar-inset` / `--app-shell-bar-inset-compact` named their own values
  (`--space-4` / `--space-3`) while the page named `--space-page-x` / `--space-page-compact-x`, and
  nothing reconciled them — even though the bar sits in the SAME grid track as `.app-main`, directly
  above the page. Re-measured in Chromium on `/isolate/layout-app-shell` before the change: the
  topbar's content edge at x=80 against the page header's at x=88 (1512px), and because the two
  sides also stepped at DIFFERENT breakpoints (shell 900px, page 720px) the error was not even
  constant — **8px at 1512, 12px between 720 and 900, 4px below 720**. A drift that changes with the
  viewport is one a consumer cannot correct by hand. The page gutter wins the axis (it is read by
  seven regions against the bar's one element; the bar is the side that must line up with the page;
  and moving the bar moves one element in one composition, where moving `--space-page-x` would move
  every page in every consumer app), so both knobs now read it and the compact step moved to the
  page's `(max-width: 720px)`. **Geometry moved on the bar only:** inline padding 16px → 24px
  (12px → 16px compact, and 12px → 24px between 720 and 900); the page did not move. After: 88/88,
  24/24, 16/16, 16/16 at 1512 / 880 / 700 / 390. The token NAMES are unchanged, so a theme that
  already overrides either keeps working and a bar that genuinely wants to sit tighter than its page
  still has its own knob. The docked-narrow `padding-inline` undo is gone with the old step — it
  existed only to cancel it, and a docked page tightens its own gutters at 720px too.
- **Three font-size tokens snapped onto the type scale (gh#329).** The type axis is the system's
  most disciplined and these went around it anyway, which is the point: a scale alone is not enough.
  `--sidebar-nav-item-font-size` `0.8125rem` → `var(--font-size-xs)` — 13px is not a step (the
  golden scale runs ≈11.1 · ≈12.5 · 14), so every nav row in the rail read off the system's type
  rhythm and stayed behind whenever a service retuned `--font-size-base`. **Geometry moves 0.53px**
  (13 → 12.4699px); nothing reflows — the row is a fixed 2rem with `align-items: center` and
  1.5 × 12.47 = 18.7px keeps the headroom 19.5px had (measured: row still 32px).
  `--auth-shell-divider-label-font-size` and `--auth-footer-text-font-size` `0.6875rem` →
  `var(--font-size-2xs)`: 11 was never a step, it was the ratio⁻² step (≈11.107px) rounded to a whole
  pixel and then written down as if it were. **Geometry moves 0.107px** on the label and 0.188px on
  the divider row (19 → 19.188px, measured), whose `calc(19 / 11)` line-height was always a ratio
  rather than a pin.
- **`--auth-shell-field-label-font-size` stays the literal `0.75rem`, now as a DECLARED tier-2
  exception (gh#329).** The issue asked whether this is merely a long way of writing
  `--font-size-xs`. It is not: the xs step is base/ratio ≈ 12.47px, not 12. The value is anchored
  outside the system — SCR-001 pins the email input at y=489, and 12.47px drifts the 18px label line
  box to 18.7px and pushes it off that anchor (the gh#263 regression). It now carries a
  `scale-exempt:` marker, which the scale-bypass guard honours and PRINTS, so the exception is
  declared once and stays visible instead of hiding in prose.

- **`check:token-scale-bypass` now runs in every verify chain, not only `verify:ci:static`
  (gh#332).** It was reachable from one of four, so `pnpm verify` locally could pass on a violation
  that CI then rejected — the exact gap that lets a red gate reach `main`. It now sits next to
  `check:token-tiers` in `verify`, `verify:static`, `verify:ci` and `verify:ci:static`
  (`verify:release` inherits it through `verify:static`). `verify:browser` is unchanged: it is the
  two Chromium gates alone, not a verify pass.

- **CD no longer re-runs the test suite CI just ran.** The publish job ran `pnpm run verify:release`
  (~25 guards + the whole vitest suite + the Chromium contrast/visual/axe gates) on a commit `main` CI
  had already proved green. It now runs `verify:publish-tree` and delegates the rest to
  `verify-commit-provenance`. The Playwright Chromium install is skipped unless `full_verify` is set.
- `applyTargetMetadata` is byte-preserving when the tree already carries the coordinated target
  metadata. On the tag path it writes nothing, so the packed tree is byte-identical to the CI-verified
  commit — which is what makes the provenance substitution sound rather than merely cheaper.
- `verify-publish-tree` (the step) requires a fully clean working tree on a tag-triggered release, not
  merely "only the two manifests changed".
- `actions/checkout` in the publish workflow now uses `fetch-depth: 0` and explicitly fetches
  `origin/main`, so the tag's ancestry can be proven; the `git push origin HEAD:main` step now runs
  only on the `workflow_dispatch` path (a tag release commits nothing).

`REQUIRED_CI_CHECK_RUNS` names GitHub **job** display names (steps do not produce check runs).
`ci.yml` now runs `check:frame-contracts` and `check:frame-coverage` as steps of its `static` job,
so all three are proven by the one "Build · typecheck · lint · guards" check run. A test parses the
workflow files and fails if any named job disappears or is renamed — so a CI refactor breaks a test
rather than blocking every release.

- **CI was running the same work several times per merge; the pipeline is now merge-then-tag.**
  Four separate duplications, each measured rather than guessed:
  `ci.yml` and `ci-browser.yml` triggered on **both** `pull_request` and `push: [main]`, so
  merging a PR paid for every job twice on the same commit. `release-integrity.yml` re-ran six
  gates — `pnpm build`, `check:packed-public-contract`, `check:mcp-lockstep`, `check:mcp-sync`,
  `check:mcp-orphans`, `check:mcp-pattern-imports` — that `verify:ci:static` had already run on
  the same commit; it now keeps only what nothing else does (build + test the MCP package, and
  prove the release command plan is executable). Inside `ci.yml`, `contracts` reinstalled and
  re-ran `preview:build` that `static` had just produced, and `coverage` paid a second install for
  one report-only artifact; both fold into `static`. And `preview-pages.yml` rebuilt the whole
  preview on every merge to publish a site nobody had asked for yet.
  The pipeline is now what it should always have been: **merge to `main` runs CI; creating a `v*`
  tag runs release and deploy.**
- **`CI · browser`'s five rendered-runtime shards all died on `preview server did not start
within 60s`.** They run in parallel on one self-hosted host, each cold-starting its own Vite dev
  server beside a full CI job. The three non-shard jobs passed, which is what identified it as
  contention rather than code. The budget is now 180s, tunable with `PREVIEW_START_TIMEOUT_MS`,
  and the message reports how long it actually waited instead of a hard-coded "60s".

- **CI and CD are separate workflows, and now say so in their names.** They always were separate
  files; what made the split look absent was a comment in `ci.yml` pointing at a `cd.yml` that
  does not exist. The Actions tab now reads `CI · code`, `CI · browser`, `CI · release contract`,
  `CD · publish to npm`, `CD · deploy preview to Pages`. The files keep their paths, so no run
  history is orphaned.

- **The test suite ran one file at a time. That single line was the hour.** `vitest.config.ts`
  carried `fileParallelism: false`, so 455 test files each built a fresh module graph and a fresh
  jsdom, in series, on a 10-core machine. The profile said so plainly: of 3409s, `import` was
  2267s (67%) and `environment` 544s (16%), while the assertions themselves were 275s — **8%**.
  Almost none of the wall clock was spent testing; it was spent rebuilding the world 455 times.
  The line arrived with the first v6 snapshot commit and carried no rationale, so it had been
  inherited rather than chosen — and it is the right setting only for a suite with cross-file
  state leakage, which a full parallel run proves this one does not have.
  Measured, same machine, same files: a 38-file slice went **323s → 90s**, and the full suite
  **3409s → 1168s** (57 min → 19.5 min) with **470 files / 3126 tests all passing**.
  CI gets the same win twice over: `verify:ci` was a single serial chain (build → 28 guards →
  the whole suite), so it is now two jobs that run side by side, and the suite is sharded across
  four more. `fail-fast: false` on the shards, because one red shard must not hide what the other
  three would have said.
- **`ci.yml` pointed at a `cd.yml` that does not exist.** Delivery has always been its own set of
  workflows — `npm-publish.yml`, `preview-pages.yml`, `release-integrity.yml` — so the split was
  real and only the comment was wrong, which made it look absent. Named them.

- **`CI (browser)` was unblocked, then pointed at the `swarm-pool` self-hosted runners.** The
  first move was to GitHub-hosted `ubuntu-latest`; the repo owner then chose the `swarm-pool`
  fleet, so every workflow now targets `[self-hosted, swarm-pool]`. The lesson from the old fleet
  is kept rather than re-learned: the Chromium step now DETECTS `apt-get` instead of assuming it,
  and Node is bootstrapped before `pnpm/action-setup` because self-hosted images often ship 18.
  The original diagnosis, unchanged:
  those jobs had been red for weeks because the hosts lack Chromium's shared libraries
  (`libnspr4`, `libnss3`, `libasound2`) and `--with-deps` could not install them there: it shells
  out to apt-get, which is absent, so the step died at exit 127 before the browser was even
  downloaded. On ubuntu-latest apt-get exists, so `--with-deps` is not merely safe, it is the call
  that installs them. Same reasoning `ci.yml` already carried — the fleet is heterogeneous and
  every failure it has produced so far was infrastructure, not code. The Node-18 bootstrap the
  self-hosted jobs needed is gone with it. All of these gates were run locally against an
  installed Chromium first, so the change is known to be green rather than hoped to be:
  `check:contrast` (11/11 routes), `check:visual-audit`, `check:frame-axe`, `check:button-icon-xs`,
  and `check:frame-geometry` — the last of which found a real WCAG 2.1.1 defect (gh#321).

- **`AuthDivider` is now a thin preset over `Separator label` (gh#308)**, not a parallel
  implementation. `.ui-auth-divider` no longer restates the grid or the rule — it only re-points
  Separator's `--separator-*` knobs at the `--auth-shell-divider-*` layer, so #263's canonical login
  geometry is unchanged while the coupling the issue reported is broken: a service retuning its
  login divider no longer retunes every day divider in its message streams. The hard-coded
  `height: 1px` on `.ui-auth-divider-rule` (a rule #44 violation) is gone with it. The public API,
  the `data-slot="auth-divider"` hook and the accessible-name contract are unchanged; the internal
  `.ui-auth-divider-rule` / `.ui-auth-divider-label` classes are replaced by
  `.ui-separator-rule` / `.ui-separator-label`.
- `.ui-separator` reads `--separator-rule-{size,color}` instead of the literal `1px` and a direct
  `hsl(var(--border))`. The defaults are those same values, so the plain rule is visually unchanged.

- **MCP catalogue — `Textarea`.** Removed the DON'T that told consumers "the component does not
  auto-resize; if you need auto-grow behaviour you must wire a custom `onInput` handler that adjusts
  `style.height` explicitly". It is replaced by the `autoGrow`/`minRows`/`maxRows` props, an
  explicit DON'T against the `scrollHeight` → `style.height` pattern (with the reasons: forced
  reflow, re-deriving the library's box model, freezing the height against density and tenant
  rethemes, and missing paste / IME / programmatic-reset / webfont-swap), and a composer DO. The
  entry's example also no longer passes `onValueChange` to a `Textarea` — a prop it never had.

- **Toggle: the pressed state is no longer carried by hue alone** (WCAG 1.4.1, gh#312). Beyond the
  chip's existing fill/label inversion, the pressed chip's border is now a documented token
  (`--toggle-pressed-border-color`, quiet by default), the counter pill inverts from a near-
  invisible chip to a solid one, and under `forced-colors: active` the pressed chip's border follows
  the system `Highlight` while its pill gains an outline — so the state survives greyscale, a
  deuteranope reader and a flattened palette.
- `ToggleProps` is now also exported as `ToggleProp`, and `ToggleGroupItem`'s props are exported as
  `ToggleGroupItemProp` / `ToggleGroupItemProps` (both registered in `src/props/registry.ts`).

- **Dependencies: everything that can move is on its latest, and the two that cannot are
  documented.** Landed: `@types/node` 22→26 · `globals` 15→17 ·
  `prettier-plugin-tailwindcss` 0.6→0.8 · `eslint` 9→10 (+ `@eslint/js`) · `jsdom` 29→30 ·
  `@testing-library/jest-dom` 6→7, plus 13 minor/patch bumps including React 19.2.8,
  `lucide-react` 1.37 and `zod` 4.5.
  **ESLint 10 needed one config change:** `eslint-plugin-react@7.37.5` (its latest) declares a
  peer range stopping at `^9.7` and crashes in `resolveBasedir` while probing the React version,
  so `settings.react.version` is pinned to `19.2` instead of `"detect"`. Revert to `"detect"` once
  the plugin ships ESLint 10 support — a pinned version drifts when React moves.
  **TypeScript 7 is held back by `typescript-eslint`**, which does not support the 7.0 API
  (upstream: typescript-eslint#10940, targeting TS ≥ 7.1). `tsc --noEmit` passes clean on 7.0 for
  both `src` and `docs`, so the codebase is ready and only the lint toolchain is not.
  **`@tanstack/react-table` 8.21 → 9.2 is done, and it is a migration, not a bump** — see below.
- **`@tanstack/react-table` 8.21 → 9.2 — migrated, with no change to DataTable's public API.**
  v9 is a rewrite of the type layer: features are explicit (a table carries only the state, options
  and row models it declares), every generic gained a `TFeatures` parameter, `useReactTable` became
  `useTable`, the `get*RowModel()` helpers became `create*RowModel()` factories registered as slots
  on the feature set, and render-time state reads moved from `table.getState()` to `table.state`.
  DataTable now declares its feature set once (`dataTableFeatures()`) — which is also the first
  honest inventory of what it supports; v8 only ever implied that list through which row-model
  helpers happened to be passed in.

  Two decisions are worth recording:

  - **The row-model factories are now registered unconditionally.** v8 disabled a stage by
    withholding its row model; v9 keys that off the `manual*` options, so `manualSorting` alone
    makes `getSortedRowModel()` return the pre-sorted rows. The one case with no v9 option behind
    it — a table with no pager, where v8 simply withheld the pagination row model — is expressed as
    `manualPagination: manualPagination || !paginationEngaged`, i.e. leave the rows unsliced.
  - **Consumers keep their own row types.** v9 constrains its row type to
    `RowData = Record<string, any> | Array<any>`, and an `interface` has no index signature, so a
    naive migration would break `DataTable<Order>` for every consumer whose row is an interface.
    An internal `T & Record<string, unknown>` bridge satisfies the constraint while staying a
    subtype of `T`, so `row.original`, `getRowId` and `onRowClick` still speak the consumer's type.
    The exported `ColumnDef<T>` was always this repo's own `ColumnDefProp<T>`, never TanStack's, so
    nothing in the public API moved. 112 DataTable tests pass unchanged.

  Also gone: the global `declare module "@tanstack/react-table"` augmentation of `ColumnMeta`,
  which used to add our `lean` key to **every** table in the consumer's app. v9's per-table
  `columnMeta` slot scopes it to DataTable and keeps it parameterised by the row type.

- **ESLint 10's `no-useless-assignment` found six dead initialisers**, each overwritten on every
  path: Rating's `next` (the switch's `default` returns, so the type also narrows to `number`),
  Dialog's `ok` (both the try and the catch assign), and `stopServer` / `captured` / `command` in
  three scripts. The `stopServer` no-ops were checked against their `catch` before removal — had
  the catch fallen through to a `finally`, that initialiser would have been load-bearing rather
  than dead.

### Changed (BREAKING)

- **Focus-ring knob dùng đuôi `-alpha`, không phải `-opacity`.** Bốn component token ra mắt ở
  18.15.x đặt tên lệch khỏi vocabulary của chính repo (`--alert-bg-alpha`,
  `--card-header-background-alpha`…) và không qua được `check:token-tiers` — gate này đã đỏ âm
  thầm trên `main` kể từ đó vì release đi tắt qua `pnpm verify`. Đổi tên cho khớp thay vì nới
  guard: thêm một từ đồng nghĩa thứ hai đúng là thứ cardinal rule #44/#45 muốn tránh.
  `--toggle-focus-ring-opacity` → `--toggle-focus-ring-alpha`,
  `--time-input-focus-ring-opacity` → `--time-input-focus-ring-alpha`,
  `--sidebar-user-focus-ring-opacity` → `--sidebar-user-focus-ring-alpha`,
  `--topbar-icon-focus-ring-opacity` → `--topbar-icon-focus-ring-alpha`.
  Theme nào đang set bốn tên cũ phải đổi; giá trị mặc định giữ nguyên nên không đổi hình ảnh.
  `--focus-ring-opacity` ở `foundation.css` là token nền tier khác và **không** đổi.

### Fixed

- **Two docs pages fetched their images from the public internet, and that is what had been
  reported as "infrastructure errors" for weeks (gh#333).** `docs/data-display/avatar.tsx` and
  `docs/data-display/card/index.tsx` loaded portraits from `picsum.photos`. The browser gates
  navigate with `waitUntil: "networkidle"`, so a request that never settles means the page never
  finishes loading and `page.goto` dies at 30s — both frames failed at EVERY viewport in both the
  axe and geometry sweeps. The tell was that the failures were not scattered: load scatters, and
  these hit the same two frames every time, at every width, in both gates. That is a property of
  the page, not of the machine. Measured after inlining them as `data:` URIs: card-index
  30s timeout -> 1.9s, avatar -> 1.0s, and zero requests leave the origin.
  `check:no-external-assets` now fails a docs page that would fetch across the network at render
  time. It matches only what the RENDERER blocks on — `src`, `poster`, CSS `url()`, `<link href>`
  — so an `<a href>` to `billing.example.com` is left alone, and Google Fonts on the three brand
  showcases is declared with its reason: the showcase exists to prove a consumer's design can be
  reproduced from tokens, and that design IS its typeface, while the request degrades fast instead
  of hanging.

- **The rendered-runtime gates stood their own preview server up, and none of the ways they tried
  worked on CI.** They spawned `vite --config …`, the DEV server, and polled for it; on a cold
  self-hosted runner, dependency optimisation plus on-demand compilation is not marginally slow,
  it is slower than any poll worth writing — which is why raising the budget 60s -> 180s changed
  nothing. Switching them to `vite preview` over a built output did not fix it either. The three
  browser gates that were always green (`frame-axe`, `frame-geometry`, `contrast`) had the answer
  the whole time: they call `frame-harness.ensurePreviewServer`. Rather than keep guessing which
  of the small differences mattered — a detached process group, an early reachability check, an
  explicit cwd — all four gates now call that function. One way to stand a preview up, and it is
  the one with a green record on this pool.
  Superseded detail, kept because it was the wrong turn worth remembering: Four gates spawned `vite --config preview/vite.config.ts` and polled for it; on a cold
  self-hosted runner, dependency optimisation plus on-demand compilation of the whole app is not
  marginally slow, it is structurally slower than any poll worth writing. That is why raising the
  budget from 60s to 180s changed nothing — the timeout was never the suspect, and the three
  browser gates that were always green (`frame-axe`, `frame-geometry`, `contrast`) had the answer
  in them all along: they build once and serve the output with `vite preview`. All four gates now
  do the same, and the workflow builds the preview before running them, so there is one way to
  stand a preview up and it is the one already proven on CI.

- **A CI gate was killing another job's preview server, and the failure surfaced everywhere but
  there.** `preview/scripts/kill-port.mjs` hard-coded `const PORT = 6008` and
  `check-layout-nav-frames.mjs` called it unconditionally, then bound 6008 itself — ignoring the
  `PREVIEW_PORT` its CI shard was given. On a self-hosted host where several browser jobs share a
  machine it SIGKILLed whatever held that port, which was another gate's server; the victim logged
  over a thousand `ERR_CONNECTION_REFUSED` against a server that no longer existed. That is the
  real reason the rendered-runtime shards were red, and it is why raising the startup timeout only
  treated the symptom. The port is now an argument, the gate owns its own, and every URL in it
  reads that port instead of a literal.
- **Five more icon rules were sizing glyphs with literals, invisible to the ratchet** because it
  recognised an icon by whether the selector contained the word "icon" — `.ui-otp-caret`,
  `.ui-accordion-chevron`, `.ui-carousel-arrow`, `.sb-product-caret svg`, `.tb-chip-caret svg`,
  plus a raw `--calendar-chevron-size`. The pattern now knows `caret|chevron|arrow`, with
  boundaries: a bare `/arrow/` matches inside `--n·arrow·`, so
  `.ui-page-container--narrow .ui-page-body { max-width: 42rem }` was briefly reported as an
  oversized icon, and a guard that cries wolf is one somebody eventually silences. Widening it
  also exposed that the token-name pattern had NOT been widened with the selector pattern, so
  `--accordion-chevron-size` was frozen in a table and invisible to the scanner reading it back.
  `.ui-combobox-caret` is left listed rather than tokenized: nothing renders `.ui-combobox-*`, so
  giving it a knob would document a capability the library does not have.

- Nothing. See "Investigated, no change needed" below — gh#327's reported dead code is not dead.

- **a11y: `Button size="xs"` was 20px tall, under WCAG 2.2 SC 2.5.8's 24x24 minimum target size
  (gh#316).** It read `calc(var(--control-height) - 0.75rem)` = 1.25rem while `size="icon-xs"`
  beside it read `--control-height-xs` = 1.5rem: the same tier name, two heights, 4px apart. The
  gap was recorded as a visual decision to make later; measuring it settled it as an accessibility
  one, because 20px fails the target-size minimum and the 24px sibling passes. The old value was
  also the exact shape this repo's own rule forbids — an ad-hoc `calc(var(--control-height) +/- length)`
  that silently re-derives a tier and drifts from its siblings — and, being a raw length rather
  than a `--scaling`-multiplied step, it did not move with density while the tier did.
  `--button-xs-height` now defaults to `--control-height-xs`. This IS a visible change on the most
  used component in the library (20px -> 24px) and it stays a knob: a service that wants the old
  box sets the token back.

- **a11y: `colSpan` on a one-column form grid collapsed a field to 0px and put its clear button
  out of reach (gh#321).** `FormField` set the span as an inline `grid-column: span N`. On a grid
  that is one column below its 40rem container query, that does not degrade to one column — per
  spec it FABRICATES an implicit second track, which auto-sizes to its content and leaves the real
  `minmax(0, 1fr)` track with the remainder: `0px 196px` inside a 212px grid at 320px. The field in
  the starved track rendered at zero width, and its Input's absolutely-positioned trailing affix
  (the clear button, `inset-inline-end: 8px` measured off a zero-width box) landed at `x = 2` while
  the frame began at `x = 20`, with nothing scrollable in between — focusable, invisible,
  unreachable (WCAG 2.1.1 / 2.4.7). `overflowX` was `false` throughout, which is exactly why no
  other gate saw it: the field does not overflow, it disappears.
  The span now travels as `--form-field-col-span` so the STYLESHEET decides where it is safe, and
  is applied from the same breakpoint at which ResponsiveGrid's second column appears — a test
  reads both files and fails if the two ever drift apart. Measured after the fix: 320 / 375 / 640 /
  768 resolve to a single track with every span `auto` and the button inside the frame; 1280
  resolves to `557px 557px` with `span 1 | span 1 | span 2`.
  Pre-existing, not from this batch — the identical measurement reproduces at `fe5f681`. It
  surfaced only because `check:frame-geometry` could finally run: its baseline predated the
  breakage, the same staleness that had hidden `DropdownMenuTrigger` in the API manifest.

- **a11y: the Button counter pill was below WCAG SC 1.4.3, in five combinations, not the two that
  were reported (gh#320).** The pill tinted itself translucently over whatever surface the button
  had (`bg-primary-foreground/15` on filled variants, `bg-foreground/8` on the outline family), so
  its contrast was a function of that surface rather than a property of the pill: `default` 3.88:1
  light, `destructive` 4.29:1 dark, and the outline family 4.32:1 light at rest, **3.64:1 light on
  hover**, 3.68:1 dark on hover — against the 4.5:1 small text requires. The two worst are HOVER
  states, which is why no screenshot sweep found them: `--accent` only exists under the cursor.
  The pill now uses the opaque role fills gh#312 validated on Toggle, so the ratio no longer
  depends on the variant or on hover. Each filled variant wears its own label pair SWAPPED
  (`default` 5.04:1 light / 7.07:1 dark, `destructive` 6.10 / 5.53, `secondary` 14.25 / 12.40),
  which makes the pill exactly as legible as the label beside it and impossible to make worse
  without making the button itself unreadable first — a promise a fixed colour could not keep
  across re-themes. The outline family reads `--foreground` on `--muted` (14.25 / 12.40), whose
  fill sits 1.09:1 against the button's own ground, so at rest a count still reads as quiet text
  rather than a badge (#44): the DIGITS got legible, the pill did not get loud.
  The other two translucent-over-variable-surface tints in the library were measured rather than
  assumed — the overlay header band (13.25–14.65:1) and the permission-matrix diff row (4.76:1 at
  its worst, on hover) — and both clear AA, so the counter pill was the only exposure.

- **`check:contrast` was auditing three routes that do not exist, and reporting them clean.**
  `/showcase/tiximax-portal` and `/showcase/tiximax-website` have been `acme-*` since the rename,
  and the Button page is `general-button-index`, not `general-button`. All three rendered a
  "not found" card — four legible words, which passes every contrast check there is — so the two
  brand re-theme showcases and the gh#199 dark-theme Button coverage this gate's own comment
  claims had silently not existed. The routes are corrected (and `futurelastic-web`, the dark-ground
  third brand, added), but the real fix is structural: the sweep now FAILS on a route that resolves
  to a not-found card. A sweep that cannot tell "nothing failed" from "nothing was there" is not
  evidence.

- **Two text-scanning audits were reporting on prose, and one demo shipped emoji.** The raw-palette
  audit counted `bg-green-500` where Avatar's presence block _explains_ the hand-rolled workaround
  the prop exists to replace, so a file with no debt was reported as having some — the same
  phantom-debt shape `check-no-hardcoded-geometry` was taught to avoid, and it now strips comments
  the same way (proved still to bite by putting the class back into real markup). The `docs`
  typography audit was right about the other 19: 21 em-dashes in Japanese product copy became
  middots per the repo's own standard, and the reaction-chip demo's 👍/🎉/👀 became lucide marks —
  emoji render at a size and weight the host font decides, which is the same reason this system
  bans emoji flags, and a counter pill has to stay legible beside the glyph.

- **Table/DataTable: a full-bleed table no longer doubles the card frame (gh#305).** The frame
  suppression inside `<CardContent flush>` now covers BOTH full-bleed surfaces in one rule —
  `.ui-data-table-surface` (DataTable's own frame) and `.ui-table-bordered` (`<Table bordered>`) —
  and it only ERASES widths, never repaints chrome. The previous shape (`border: 0` followed by a
  hard-coded `border-block-start: 1px solid …`) painted chrome unconditionally, which re-drew the
  line even where the card already had one.
- **Table/DataTable: the flush table's top divider is back in the canonical composition (gh#306).**
  The gh#306 repair had reached only `<Table bordered>`, so
  `<Card><CardContent flush><DataTable/></CardContent></Card>` still rendered a frameless surface
  and its header floated with no line under it (measured: `border-top-width: 0px`). The divider is
  now restored by an adjacent-sibling rule that fires only where the edge actually separates
  something: a plain `CardHeader` directly above the flush body. A banded header, a `CardBar`, a
  `DataTable.Toolbar` or a headerless card each already draw that line and no longer get a second
  hairline stacked on it. `SkeletonTable` is covered by the same contract, so the loading→loaded
  swap does not move a hairline.
- **Card: `flush` zeroes both block edges for every full-bleed body, not only one containing a
  `<table>` (gh#307).** The zero was gated on `:has(table)`, so a flush body of anything else (a
  file list, `ListRow` rows, a DataTable in its empty state) still took the generic body padding and
  floated off its header — measured at 18.4px on a consumer's 関連ファイル section against 0px for
  the flush table beside it. Guarding the `describedBody` pair with `:not([data-flush])` could not
  fix that (the padding came from the generic content rules) and its ACTION half additionally
  stripped the `padding-top: 0` those bodies used to get. The flush body now owns its block axis
  outright, and a plain header above ANY flush body supplies the gap from its own
  `--card-space-body-y`. `tight` and `solo` keep owning that axis themselves; a non-flush
  `CardContent` is unchanged.

- **a11y: `--input` no longer shares `--border`'s value — control boundaries now clear WCAG 2.2 SC 1.4.11 (gh#315).**
  A text field's 1px edge is the only thing that says "you may type here" (the field has no fill of
  its own and no shadow), and it measured **1.46:1** on `--background`/`--card` in light and
  **1.55:1 / 1.43:1** in dark — the one live WCAG failure a full DXS Platform sweep turned up.
  `--input` is now the CONTROL BOUNDARY role with its own value, held to 3:1 on every surface a
  control actually sits on: light `30 7% 53%` (`#90877f` — 3.47:1 on `--background`/`--card`/
  `--popover`, 3.18:1 on `--muted`/`--secondary`, 3.35:1 on a zebra row, 3.32:1 on a hovered row)
  and dark `45 6% 47%` (`#7f7b71` — 4.22:1 / 3.88:1 / 3.17:1 / 3.81:1 / 3.71:1). It also lifts the
  Switch's unchecked track from 1.46:1 to 3.47:1 against both the page and its own thumb, so "off"
  is finally a visible state. `--border` is deliberately UNCHANGED: table rules, card edges and
  section dividers are decorative chrome that SC 1.4.11 does not reach, and darkening them would
  make the dense JP grid roar. **Services re-theming neutrals must now move the two roles
  independently** — `--input: var(--border)` re-opens the bug.

- **Form `columns={n}` — one canonical row rhythm on both layout paths (gh#304).** The gh#295
  field rhythm is a per-field `margin-block-start`, and it reached the fields a `columns` Form lays
  out as ResponsiveGrid items — a spacing mechanism fighting a layout mechanism. The first item of
  row 1 has no preceding sibling and took no margin while its row-mates took the full one, so row
  1's columns started 12px apart, and every track then carried the margin on top of the grid's own
  gap (row pitch 89px against a 73px stack). Zeroing the margin on grid items levelled the columns
  but handed the rhythm to ResponsiveGrid's generic 16px stack gap, so a `columns={1}` form — and
  any `columns={n}` form once a narrow container collapses it to one column, i.e. every phone —
  still sat 16px apart where the identical fields without `columns` sat 12px. The grid's own
  `row-gap` now carries the form's rhythm, keyed on the grid HAVING FormField items rather than on
  where it sits, so `columns={1}` is pixel-identical to no `columns`, a hand-written
  `<ResponsiveGrid columns={2}>` of fields inside a `CardContent` (what a form with several titled
  Card sections has to write) matches `columns={2}` exactly, and every column count (1–4), LTR and
  RTL, wide and collapsed, resolves to the same 73px pitch. A card/tile grid inside a form has no
  FormField items and keeps ResponsiveGrid's stack gap.

- **`check:screen-reader-evidence` is green again — the `landmarks-page-structure` cohort listed an
  owner the library does not have.** `layout/page-header` entered the cohort in `0916c56`; there is
  no `PageHeader` export (page chrome lives on `PageContainer`, already listed one line above), so
  the gate had been failing on `unknown owner` ever since. Removed the stale line. This was the
  third of three gates that had been quietly red on `main`.
- **`preview/frame-coverage.ledger.json` — `DropdownMenuTrigger`'s ratchet floor raised by one
  reasoned-N/A.** The generator no longer infers `disabled` off the Radix `Trigger`, so `states`
  flipped from `untested` to `not-applicable:api-manifest` and the ratchet, correctly, refused it.
  Regenerating from a pristine checkout of the previous commit reproduces the same flip, so this is
  drift between the committed manifest and the current dependency graph, NOT coverage being
  deleted — the floor was raised for that one export rather than re-minting all 283 with
  `--reset-baseline`, which would have erased the ratchet's memory the day nine changes landed.

- **AlertDialog's close button was never pinned.** `DialogContent` sets
  `data-slot="dialog-close"`, which is the only selector that positions the overlay ✕;
  `AlertDialogContent` rendered a bare `<button>` without it, so the button stayed `position:
static` and fell inline after the children at full opacity instead of resting at
  `--dialog-close-rest-alpha`. It is opt-in there (`showCloseButton` defaults to `false`), which
  is why it went unnoticed.
- **DataTable's #319 rules were trapped in the responsive layer.** The same append mistake that
  killed 122 tokens hit a stylesheet too: the block targeted `table-layout.css`'s last `}`, which
  closes `@layer godxjp-ui-responsive` rather than ending it, so a dozen static rules landed in a
  layer reserved for container-query re-points. Four of them are now scoped through
  `.ui-data-table-root` — the last layer had been doing their cascade work, and demoting them bare
  would have shrunk the toolbar/pagination glyphs (`.ui-button svg` outranks a bare class) and
  re-rounded the loading chips (`.ui-skeleton-block` is imported later).
- **`--checkbox-checked-background` was completely dead.** Checkbox carried
  `data-[state=checked]:bg-primary` as a utility, and Tailwind v4 orders utilities after
  components, so it outranked `.ui-checkbox[data-state="checked"]` — a service overriding the
  token got no fill change at all. The utility is gone; the knob works.
- **SearchSelect's inner search field suppressed its focus outline, not just its ring.**
  Tokenizing it earlier in this same release turned a `focus-visible:ring-0` utility into
  `box-shadow: none; outline: none`, leaving keyboard users with no focus affordance inside the
  panel. Only the ring is suppressed now.
- **Three tests were not brittle but silently vacuous, found while driving utility assertions to
  zero.** `app-setting-picker` asserted `not.toHaveClass("sm:w-40")` for a class that no longer
  exists anywhere in `src/` — it could never fail. `badge-status` used
  `toContain("bg-primary")`, which `bg-primary/10` also satisfies, so the _soft_ pill would have
  passed the _solid fill_ test. `data-table-align` used `not.toHaveClass("text-end",
"text-center")`, and jest-dom's multi-name form asserts all are present, so negating it only
  required one to be missing — a cell wrongly carrying `text-end` passed. All three now assert
  data attributes, with a positive control where the assertion is a negative.
- **`check-token-tiers` would have missed the very bug it was written for, on a multi-line
  token.** Its brace walker read a declaration as `buffer.split("\n").pop()`, and this repo wraps
  long values onto the next line (`--shadow-md:` then the value). For such a token the walker read
  the VALUE line, which does not start with `--`, so a multi-line token stranded inside an
  `@media` block would have slipped straight through. It now reads the whole buffer; proved by
  planting a multi-line token in a conditional group and watching it fail.
- **`focus-ring-single-source` reported every `box-shadow: none` as a hand-written ring.** Its
  `/box-shadow:\s*(?!none)/` backtracks `\s*` to zero width, so the lookahead compared against
  `" none"` rather than `"none"` and matched. It now reads each declaration's value — suppressing
  a ring is the opposite of painting one, and the check could not tell them apart.
- **122 control tokens were silently dead for most of the v19 refactor.** Every token appended to
  `src/tokens/components/control.css` during #319 landed _after_ the closing brace of `:root` but
  _inside_ the trailing `@media (pointer: coarse)` block. A bare declaration in a conditional
  group rule is invalid CSS, so browsers dropped all of them: `--control-affix-*` ·
  `--control-inline-affix-*` · `--select-*` · `--cascader-*` · `--search-select-*` ·
  `--time-picker-*` · `--tree-select-*` · `--calendar-*` · `--transfer-*` · `--month-picker-*` ·
  `--button-xs-*` · `--input-file-button-*` resolved to nothing. Nothing caught it — the tier
  guard read the file line by line, the geometry ratchet only reads `.tsx`, and jsdom does not
  resolve the cascade — so `check-token-tiers` passed on a file where a third of the tokens did
  not exist. They are now in a plain `:root`, and `check-token-tiers` walks the brace structure so
  a declaration outside any rule fails the build with its line number and the at-rule it is
  trapped in.
- **`--space-9` never existed.** Two control tokens referenced it (`foundation.css` jumps
  `--space-8` → `--space-10`), so the inline room a trigger reserves for its affix resolved to
  nothing. Both now carry a raw `2.25rem`, matching the flat `pe-9` step they replaced.
- **Calendar day cells lost their padding reset to Button.** `.ui-button--default-size` is
  declared later in `control.css` than `.ui-calendar-day-button` and at equal specificity, so its
  block padding re-applied to a day cell. The calendar rule is now scoped to `.ui-calendar`.
- **`check-no-hardcoded-geometry` counted class lists written inside comments.** Card's
  `className="border-2"` explainer and Topbar's JSDoc `<Avatar className="rounded-md">` example
  were both reported as debt in files that have none. Comments are stripped before scanning.

### Added

- **#319 Phase 1 is complete: 608 hard-coded geometry/chrome literals → 0.** Every component in
  `src/components/` now expresses its box through tokens rather than Tailwind scale steps, so a
  service can retune density, measure and chrome without forking. The final wave covered Dialog,
  Alert, Sonner, UploadCropDialog, Label, Checkbox, Radio, Switch, FormField, Descriptions,
  BranchScopePicker, ServiceRolePanel, PageContainer, Table, AppShell and EmptyState. Dialog
  mirrors the `--sheet-*` chrome set rather than inventing a second shape; Sonner's icons became
  themeable despite living inside a library config object; `--empty-state-icon-size` and
  `--empty-state-icon-glyph-size` must move together or the glyph stops sitting centred in its
  medallion, so both are knobs.
- **`check-no-hardcoded-css-values`** — the geometry ratchet only ever read `.tsx`, so a literal
  pushed from a component into `src/styles/*.css` left the count looking clean while the debt was
  unchanged. It reads 0 in components and **121 across 11 stylesheets**; `shell-layout.css` alone
  holds 40. The clearest case is `.kbd`, where `font-size` is already a token while
  `padding: 1px 5px`, `border-radius: 4px` and `line-height: 1.2` sit beside it as literals.
  Percentages, viewport-relative units, `1px` hairlines, anything containing `var(…)`, and
  `@media`/`@container` conditions are deliberately not flagged — a percentage is proportional to
  its parent, so it is layout rather than a constant.
- **`check-no-inline-magic-numbers`** — a component can put a constant somewhere no theme can
  reach and no class-based guard can see. TreeSelect computed its depth indent as
  `` `${depth * 1.25 + 0.5}rem` `` inline. That one is fixed, so the guard lands at 0 and exists
  to keep it that way; `scale(${scale})` and other genuinely dynamic values are not flagged.
- **Test assertions on Tailwind utilities: 53 → 0.** Every one now asserts the contract — a
  `data-*` attribute, a semantic class, or the shipped CSS rule matched against the rendered node
  via `.matches()`. Three components gained the attribute the assertion needed, which makes the
  state themeable and assertable at once: DataTable emits `data-align` (only when a column asks
  for one), Descriptions emits `data-slot`/`data-columns`/`data-label-align`/`data-mono`, and Tabs
  emits `data-variant` on its root — the list deliberately collapses `card` → `default` (gh#248),
  so until now no node published which of the three variants the consumer chose.
- **`check-no-tailwind-class-assertions`** — a ratchet guard for tests that pin a Tailwind utility
  instead of the contract. Sixteen tests broke during this refactor without a single behaviour
  changing, and two were not merely brittle but wrong: `[class*="opacity-0"]` also matches
  `opacity-05`, and one called `dragLeave` while asserting nothing about it, so a dropzone stuck
  in the active state passed. DataTable is the proof this is avoidable — 24 test files, 112 cases,
  zero utility assertions, and it needed no changes when its chrome was tokenized.
- **Sonner no longer loses its theme when a consumer passes `style`.** `{...props}` was spread
  after `style={{…}}`, so any consumer `style` replaced the whole object and the toast rendered
  transparent. The two are merged now.
- **Tabs, Pagination, ScrollArea and InfiniteQueryState are token-themeable (#319) — 17 literals → 0.** Tabs' line variant carried its whole box on the component: `--tabs-root-gap` ·
  `--tabs-list-line-space-inset` · `--tabs-trigger-line-radius` ·
  `--tabs-trigger-line-padding-x` · `--tabs-trigger-line-padding-y`. Two of its literals were
  neither: `shadow-sm` duplicated the base trigger rule and `mt-0` was dead, so both are gone
  rather than tokenized. The root's `min-w-0` moved into the stylesheet instead of becoming a
  knob — a flexbox shrink floor is an idiom, not a constant a service should be able to reach.
  ScrollArea had no CSS rule at all: `--scroll-area-bar-size` (raw rem, because the Tailwind step
  it replaces is flat rather than density-scaled) · `--scroll-area-bar-padding` ·
  `--scroll-area-thumb-radius`. InfiniteQueryState gained
  `--query-load-more-space-block-start` / `--query-loading-more-space-block-start`.
  **Pagination's chevrons kept their `size-4` as a token-backed utility rather than moving to
  CSS**: `.ui-button--sm svg` sizes them at 0.875rem and Tailwind v4 orders utilities after
  components, so a components-layer rule would have silently shrunk both chevrons — the utility
  now reads `--pagination-icon-size`, whose default is `var(--control-icon-size)` — identical to
  the old `size-4` at default density, but it now tracks the density axis where the flat literal
  did not. That is the intended behaviour for a control glyph; it is a change only under
  compact/comfortable density.
- **PermissionMatrix is token-themeable (#319) — 9 literals → 0.** `.ui-permission-matrix` had
  existed as a bare hook with no CSS rule anywhere, so every constant lived on the component and a
  JA/VI service whose role names run longer than the English ones could not widen the label column
  without forking: `--permission-matrix-label-width` · `--permission-matrix-role-space-gap` ·
  `--permission-matrix-name-space-gap` · `--permission-matrix-cell-icon-size` ·
  `--permission-matrix-min-width`. The sticky column's rule is scoped through the matrix root
  because `[data-slot="table-head"]` sets its own background at the same specificity — unscoped it
  would win only by import order, which is not a property worth depending on.
- **Textarea's clear control now shares Input's affix (#319) — 9 literals → 0, 8 of them by reuse.**
  The two carried a byte-identical stack; Textarea now uses `.ui-control-inline-affix-action` and
  `.ui-control-inline-affix-icon`. Only one thing is genuinely its own:
  `--textarea-clear-inset-block-start`, because Input centres its affix on the field's single line
  and a textarea has no single line to centre on, so its control parks at the top-end corner.
- **Skeleton bars are token-themeable (#319) — 14 literals → 0.** Bar heights and fixed widths
  were literal, so a service could not match the loading state to its own type scale:
  `--skeleton-block-height` · `--skeleton-caption-height` · `--skeleton-title-height` ·
  `--skeleton-label-width` · `--skeleton-detail-value-max-width` · `--skeleton-stat-value-width` ·
  `--skeleton-stat-caption-width`. These carry RAW rem rather than `var(--space-N)` on purpose:
  the literals they replace are flat Tailwind steps, not density-scaled ones, so routing them
  through the spacing scale would have made the loading state track the density axis while the
  content it stands in for does not.
- **DatePicker and DateRangePicker are token-themeable (#319) — 22 literals → 0 across both — and
  three more shapes moved up to control level.** DatePicker parks the same clear+calendar affix
  pair TimePicker does, and DateRangePicker uses the same bordered two-input shell as
  MonthRangePicker, so the reserve, the shell and the flush calendar panel became shared:
  `--control-inline-affix-pair-space-inline-end` (a field with TWO inline affixes reserves more
  than one with a single) · `--control-composite-field-space-gap` (the box wrapping two inputs and
  a separator, now shared by all four range/picker fields so they cannot drift into four slightly
  different boxes) · `.ui-control-panel-flush` (a popover whose content owns its padding).
- **Input is token-themeable, and the inside-field affix is now shared (#319) — 15 literals → 0.**
  Input and TimePicker carried a byte-identical affix stack, so that became one control-level set:
  `--control-inline-affix-size` · `--control-inline-affix-icon-size` ·
  `--control-inline-affix-space-gap` · `--control-inline-affix-inset-inline` ·
  `--control-inline-affix-rest-alpha` · `--control-inline-affix-space-inline-end`. It stays
  SEPARATE from the overlay `--control-affix-*` pair that Select and SearchSelect park on top of a
  trigger: an affix sitting on the field's own surface rests heavier (0.7) than one floating over
  it (0.5), and collapsing the two would have flattened that. Input also gained
  `--input-file-button-*` for the browser-owned file button, and its disabled state now dims by
  `--disabled-opacity` rather than a literal `0.5`.
- **DataTable's remaining chrome is token-themeable (#319) — 17 literals → 0.** Its cell rhythm,
  column widths and action-collection tiers were already tokenized; what was left sat around
  them — the select column, sort glyphs, sticky-header layer, pagination text and the loading
  skeletons: `--table-select-column-width` · `--table-sort-icon-size` ·
  `--table-toolbar-icon-size` · `--table-pagination-*` · `--table-skeleton-*`. The skeleton
  shapes are named for what they stand in for (a checkbox square, a text line at cap height), so
  a service retuning `--table-cell-padding-y` can keep the loading state the same height as the
  loaded one instead of discovering the rows jump.
- **AppSettingPicker's per-kind widths are themeable (#319) — 18 literals → 0.** Each picker is
  sized to the longest value it can show — a timezone name is far wider than a theme name — but
  those widths were `sm:w-*` steps in a lookup table, so a service whose locale renders longer
  labels could not widen just the one that overflows. Width now comes from `data-kind` selecting
  `--app-setting-picker-{locale,timezone,date-format,time-format,theme,brand,density,font-size}-width`,
  with `--app-setting-picker-width-breakpoint` documenting where the trigger stops hugging its
  content. The inline variant also stopped repeating the chrome-less box as utilities —
  `.ui-app-setting-picker-inline` already declared every one of them — and the icon-only variant
  gained the matching rule it never had.
- **Button is token-themeable (#319) — 18 literals → 0.** Its `ui-button--*` classes already
  carried most of the box; what was left sat inside the cva variant strings and the count pill:
  `--button-xs-*` · `--button-icon-space-inline-{xs,sm,md,lg}` · `--button-space-block` ·
  `--button-count-*`. The base string also duplicated what `.ui-button` already declares, and
  `.ui-button:disabled` dimmed by a literal `0.5` rather than `--disabled-opacity` — both fixed.
  **Two things deliberately did NOT change.** `size="xs"` stays at
  `calc(var(--control-height) - 0.75rem)` (1.25rem) even though `size="icon-xs"` uses
  `--control-height-xs` (1.5rem): same tier name, 4px apart, and the xs form does not scale with
  `--scaling` while the tier does. That is a real inconsistency, but Button is the most-used
  component here, so this change only lifts the value into `--button-xs-height` — reconciling the
  two is a visual decision for #319 to make, not a side effect of tokenizing. And the icon-glyph
  rules stay Tailwind _utilities_ rather than moving into the components layer: Tailwind v4 orders
  utilities after components, so only a utility can out-rank a child's own `size-4`. They now read
  `--button-xs-icon-size` instead of a literal step, keeping both the precedence and the knob.
- **MonthPicker and MonthRangePicker share one token set (#319) — 35 literals → 0 across both.**
  They render the same year-nav + 3-column month grid and each held an identical copy of every
  literal, so the two could drift apart silently — the same failure DropdownMenu had against
  ContextMenu/Menubar. One set now drives both: `--month-picker-panel-space-inset` ·
  `--month-picker-grid-*` · `--month-picker-cell-space-inline` · `--month-picker-nav-*` ·
  `--month-picker-field-space-gap` · `--month-picker-icon-size` ·
  `--month-picker-separator-icon-size`. The nav's resting alpha defaults to
  `--calendar-nav-rest-alpha`, so retuning the calendar's chevrons keeps the month panel in step.
  The 3×4 grid shape stays hard-coded on purpose — twelve months only read as a calendar year in
  that arrangement, so it is layout, not a service knob.
- **Transfer is token-themeable (#319) — 21 literals → 0.** Pane height, header rhythm and row
  density were literal, so a service could not fit the panes to its own page grid or tighten the
  row for a dense admin screen without forking: `--transfer-pane-*` · `--transfer-header-*` ·
  `--transfer-search-space-inset` · `--transfer-list-space-inset` · `--transfer-row-*` ·
  `--transfer-empty-space-block` · `--transfer-actions-space-gap` ·
  `--transfer-action-icon-size`. The disabled search state moved from a `pointer-events-none
opacity-50` pair to `data-disabled` reading `--disabled-opacity`, so it dims by the same amount
  as every other disabled affordance in the system.
- **Sheet's inner chrome rhythm is token-themeable (#319) — 23 literals → 0.** `--sheet-pad-x/-y`
  already governed the panel inset, but the gaps INSIDE that chrome were literal, so a service
  could retune the sheet's outer padding and still be stuck with the header stack, the
  title/subtitle pair and the footer row: `--sheet-header-space-gap` ·
  `--sheet-title-block-space-gap` · `--sheet-title-row-space-gap` · `--sheet-extra-space-gap` ·
  `--sheet-footer-space-gap` · `--sheet-title-font-size` · `--sheet-description-font-size` ·
  `--sheet-body-space-block` · `--sheet-close-*` · `--sheet-shadow`. The header's reserved inline
  end and the close button's corner offset now derive from the same
  `--sheet-header-close-space-inline-end` / `--sheet-close-offset` pair, so they can no longer
  drift apart and let a long title slide under the ✕. Overlay and panel join `--overlay-z-index`
  instead of a private `z-50`.
- **Calendar is token-themeable (#319) — 24 literals → 0.** Day and weekday cells already sized
  from `--control-height` (a system tier decision that stays), but the frame around them — root
  inset, month gaps, nav offset, grid rhythm — was literal inside the react-day-picker
  `classNames` map, which is exactly the place a consumer cannot reach without replacing the
  whole map: `--calendar-space-inset` · `--calendar-month-space-gap` · `--calendar-caption-*` ·
  `--calendar-nav-*` · `--calendar-grid-space-block-start` · `--calendar-week-space-block-start`
  · `--calendar-weekday-*` · `--calendar-day-*` · `--calendar-chevron-size`. Every `classNames`
  slot still merges the caller's override exactly as before.
- **Steps is token-themeable (#319) — 25 literals → 0.** `--steps-inline-*` already covered the
  compact inline form; the main variant's marker, connector and text rhythm were still literal,
  so a service could not resize the dot, retighten the vertical run, or move the horizontal
  connector onto its own grid: `--steps-dot-*` · `--steps-marker-*` · `--steps-title-*` ·
  `--steps-vertical-*` · `--steps-horizontal-*` · `--steps-connector-*`. Step status, direction
  and title placement now drive the styling through data attributes rather than conditional
  class strings, so both ends of the horizontal connector move together when
  `--steps-connector-inset` is retuned instead of needing two hand-matched `calc()` literals.
- **TreeSelect is token-themeable (#319) — 25 literals → 0, and its depth indent is finally
  reachable.** The indent was a magic expression inline in JSX (`depth * 1.25 + 0.5` rem), so no
  theme could touch it at any price — the guard never even saw it, because it is not a Tailwind
  class. Depth now flows through `--tree-select-depth` on the row and the indent resolves as
  `--tree-select-depth-space-base + depth × --tree-select-depth-space-step`, so a dense service
  can tighten or flatten the tree without forking. Also `--tree-select-row-*` ·
  `--tree-select-toggle-*` · `--tree-select-list-max-height` · `--tree-select-empty-space-block`.
  Its clear control is centred against the whole field rather than laid out in a flex overlay, so
  it keeps its own rule while reading the shared `--control-affix-*` knobs.
- **TimePicker is token-themeable (#319) — 25 literals → 0.** Column height, panel width, row
  rhythm and the inline affix pair were all literal on the component, so a service could not
  shorten the scroll column or widen the panel for its own type scale without forking:
  `--time-picker-column-height` · `--time-picker-panel-width` (+ `-12h`, since a 12-hour layout
  adds an AM/PM column) · `--time-picker-heading-*` · `--time-picker-option-*` ·
  `--time-picker-footer-space-inset` · `--time-picker-affix-*`. Unlike Select and SearchSelect,
  TimePicker's affix sits INSIDE the field rather than overlaying it and carries two controls
  (clear + clock), so it keeps its own reserve and resting alpha instead of the shared overlay
  values — shared vocabulary where it fits, separate where it genuinely differs.
- **Select is token-themeable (#319) — 27 literals → 0, mostly by reusing what already existed.**
  Select's popup is the same surface ContextMenu/Menubar/DropdownMenu use, so its rows, label and
  separator join those shared rules rather than getting a fourth private copy; its trailing clear
  affix matched SearchSelect's calibration exactly, so it reads `--control-affix-*` with no
  scoping. Only three knobs are genuinely Select's own: `--select-content-max-height` ·
  `--select-scroll-button-space-block` · `--select-item-space-inline` (a listbox row has no
  leading icon column, so it takes a slightly wider inline inset to read level with a menu row
  that does). The popup also stops hard-coding `z-index: 50` and reads `--overlay-z-index`.
- **DropdownMenu joins the menu family (#319) — 29 literals → 0.** ContextMenu and Menubar were
  already converted and share one row-rhythm rule; DropdownMenu was the only Radix menu surface
  still carrying its whole box as Tailwind literals, so the three drifted apart silently. It now
  uses the same `.ui-*-item / -label / -separator / -shortcut` groups, and the row rhythm they
  share became knobs instead of a literal `2rem` in the stylesheet: `--menu-item-height` ·
  `--menu-item-radius` · `--menu-item-space-inline` · `--menu-item-space-gap` ·
  `--menu-item-font-size` · `--menu-item-inset-space-inline-start` · `--menu-indicator-*` ·
  `--menu-content-*` · `--menu-separator-*`. A service tunes menu density once for all three.
  DropdownMenu opens off a small trigger so it stays narrower — it scopes
  `--dropdown-content-min-width` (8rem) over the shared 10rem rather than forcing one width.
  The menu surfaces also stop hard-coding `z-index: 50` and read `--overlay-z-index`.
- **Cascader is token-themeable (#319) — 30 literals → 0.** Column widths, panel heights and both
  row rhythms were literals, so a service could not widen a column to fit longer JA labels or
  tighten the row without forking: `--cascader-column-min-width` ·
  `--cascader-columns-max-height` · `--cascader-list-max-height` · `--cascader-option-*` ·
  `--cascader-result-*` · `--cascader-empty-space-block`. Cascader parks a smaller affix closer
  to the edge than SearchSelect, so it scopes the shared `--control-affix-*` knobs rather than
  forcing one calibration on both — shared vocabulary, per-component values.
- **Purely visual checkboxes now pick up the shared disabled styling.** `.ui-checkbox:disabled`
  only matches form elements, so a checkbox rendered as a `<span>` (Cascader's `CheckboxVisual`)
  never matched it and repeated `cursor-not-allowed opacity-50` on the component instead. The
  rule now also matches `[data-disabled]`, and its alpha is `--disabled-opacity` rather than a
  hard-coded `0.5`.
- **SearchSelect is token-themeable, and the select-family trailing affix is now shared (#319).**
  37 literals → 0. Panel geometry was baked on as arbitrary values
  (`max-w-[min(32rem,calc(100vw-1.5rem))]`), so a service could not widen the panel or change its
  viewport inset without forking: `--search-select-panel-max-width` ·
  `--search-select-panel-viewport-inset` · `--search-select-list-space-inset` ·
  `--search-select-option-*` · `--search-select-status-*` · `--search-select-placeholder-space-block`.
  Select, SearchSelect and TagInput each repeated the same `end-2 size-6 rounded-sm opacity-50`
  affix stack, so that moved to ONE control-level set — `--control-affix-inset-inline-end` ·
  `--control-affix-action-size` · `--control-affix-action-radius` · `--control-affix-icon-size` ·
  `--control-affix-rest-alpha` · `--control-trigger-space-inline-end` — which Select and TagInput
  will adopt as they are converted.
- **Upload is token-themeable (#319) — 66 literals → 0, the worst file in the library.** All five
  variants (dropzone · button · picture · picture-card · avatar) baked their entire box onto the
  component, so a service could not resize the avatar, dial back the dropzone's 40px inset, or
  align the file row to its own grid without forking. 47 new knobs across six regions:
  `--upload-dropzone-*` · `--upload-tile-*` · `--upload-remove-*` · `--upload-picture-*` ·
  `--upload-avatar-*` · `--upload-draft-*` · `--upload-row-*`. Markup now carries semantic
  `.ui-upload-*` classes; state moved to data attributes (`data-drag-active`,
  `data-pending-delete`, `data-disabled`) so it is themeable and assertable.
  Radius defaults were verified against the built CSS (`rounded-lg` = `--radius`,
  `rounded-md` = `--radius / --radius-ratio`), so the look is unchanged — with **one deliberate
  normalization**: the "pending replace" chip used a bare `rounded`, which resolves to a flat
  `.25rem` and ignored the radius scale entirely (itself a rule #44 miss). It now follows the
  tile radius, a ~0.3px difference.
- **Tooltip + Popover are token-themeable (#316 Phase 1).** Both shipped their entire box as
  Tailwind literals on the component (`z-50 max-w-xs px-2 py-1 rounded-md text-xs shadow-md`,
  `w-72 p-4`), so a service theme could not retune tooltip density, popover width, or overlay
  stacking without forking the component — the gap cardinal rule #45 exists to close. New knobs:
  `--tooltip-max-width` · `--tooltip-space-inline` · `--tooltip-space-block` · `--tooltip-radius`
  · `--tooltip-font-size` · `--tooltip-shadow` · `--tooltip-background` ·
  `--tooltip-foreground` · `--tooltip-border-color` · `--popover-width` ·
  `--popover-space-inset` · `--popover-radius` · `--popover-shadow` ·
  `--popover-header-space-gap` · `--popover-header-font-size` ·
  `--popover-surface-{background,foreground,border-color}`. Colour knobs are declared `initial`
  with the role default at the call site, so a scoped `[data-tenant]`/`.dark` override still
  reaches the portaled node. **Defaults reproduce the previous look exactly** — nothing changes
  until a theme opts in.
- **`--overlay-z-index`** (semantic tier) — the ONE stacking layer for every portaled overlay.
  Tooltip, Popover, Select, DropdownMenu and Sheet each hard-coded `z-50`, so an app mounting the
  library under its own stacking context had to fight five literals. Stacking is a system
  decision, not a per-primitive one. Default `50`.
- **`scripts/audit-shadcn-overlap.mjs`** — đo giá trị thật của 47 component trùng tên shadcn/ui.
  Đếm hằng số hình học/chrome hard-code (thứ khiến service theme không chỉnh được), bỏ qua role
  utility vì chúng đã token-backed qua Tailwind v4 `@theme`. Kết quả khởi điểm: 45/47 đáng giữ,
  272 hằng số cần tokenize trên 23 component — xem `docs/AUDIT-shadcn-overlap.md` và #316.
- **`time-input` vào `componentPrefixes.control`** của `check-token-tiers` — thiếu sót thuần khiến
  `--time-input-focus-ring-*` không qua được guard.

### Removed

- **`Card` / `StatCard` `size` — a prop that never did anything.** It shipped in the v6 snapshot
  with EMPTY cva variants (`md: ""`, `compact: ""`) and emitted `data-size`, but no rule in
  `card-layout.css` ever matched that attribute, so `size="compact"` was inert at every density
  for its whole life — measured by a consumer as byte-identical geometry with and without it
  (none 54px/16px · tight 46px/12px · cozy 62px/20px). Meanwhile the props table listed it and
  the StatCard guidance told people to write it. Card sizing is `density` (tight 12px · base
  16px · cozy 20px), which is implemented and measured; a second sizing axis would only
  duplicate it, so the prop is gone rather than implemented. Consumers passing `size` get a type
  error and should drop it (or use `density="tight"` for the compact look it implied). Two tests
  that pinned the dead ATTRIBUTE — and so stayed green while the prop did nothing — were
  rewritten to pin the real axis.

### Added

- **`PageContainer` `headerScale="chrome"` — a page whose top row is CHROME, not a document
  title.** `.ui-page-title` was locked to `--page-title-font-size` (`--heading-h1`, 20px) with
  exactly one step down, `--page-title-font-size-compact`, inside `@media (max-width: 720px)` — a
  RESPONSIVE step for one document title, not an axis a consumer can steer; `density` never
  touched it. So a page whose first row is furniture rather than a headline — a chat channel, a
  mail thread, an IDE tab — had no legitimate way to make that row compact: measured in a consumer
  chat page at a 61px header band carrying a 24px channel name, against a design that budgeted the
  whole row at ~40px with the name at the `sm` step. On a surface where height is what the
  conversation needs, those 21px are real. `headerScale` asks what the row IS rather than how big
  it should be: `document` (the default) is every record, form, collection and report, byte-
  identical — no attribute is even emitted; `chrome` publishes `data-header-scale="chrome"` on the
  container and the `<h1>` takes `--page-title-font-size-chrome` at EVERY width. The compound
  selector out-ranks the bare `.ui-page-title` inside the 720px block deliberately: the compact
  DOCUMENT step is h2 (18px), _larger_ than the chrome step, so without that the band would swell
  on a phone — the responsive step itself is untouched and still governs every document page.
  Extending `variant="ghost"` instead was the alternative and was rejected: ghost is the quiet
  chrome WEIGHT (no divider, no header bottom pad, tighter title→body gap) and all seven ghost
  frames in `docs/layout/page-container.tsx` are ordinary document pages — a partner detail, three
  density samples, two member lists, the notification feed — whose `<h1>` is a headline; folding a
  type step into it would move all of them and conflate two questions. They compose instead:
  `headerScale="chrome" variant="ghost"` is the chat header. The heading stays an `<h1>` in both
  states — this moves a type step, never a heading level, so the screen-reader outline is
  unchanged. It also opens the page FLUSH with the frame. `.ui-page-container` pads every page with
  `--space-page-active-y` (24px, 16px below the 720px step), which is a document's top margin: a
  title needs air above it, a channel head does not — it IS the top edge. Measured on the same
  consumer chat screen at 1512×805, the design's channel head occupies y 0..47 while the app's
  identical-height head started at y 24, pushing the whole top chrome down 30px and taking the same
  30px off the transcript (design 617px of scroll viewport, app 587px). The band heights already
  matched; the page was simply floating inside its own shell. So `chrome` swaps the container's
  block-start padding for `--page-pad-block-start-chrome` — the same attribute, because "is this row
  a document title or the surface's own furniture" is ONE question and the type step and the flush
  edge are two consequences of its answer, not two props a call site would have to keep in lockstep.
  BLOCK-START only, and a longhand: `headerScale` names the HEADER, so the page's bottom edge stays
  `stickyFooter`'s, which zeroes `padding-block-end` for its own documented reason. The 720px step
  re-declares the TOKEN, never this padding, and the attribute selector out-ranks the base rule, so
  the flush edge holds identically at every width; a page that never passes `headerScale` emits no
  attribute and is geometrically byte-identical. Two further consequences of the SAME answer, found
  by measuring every element of the reference chat screen's top band against the app's, element by
  element: the left column matched to the pixel, the header did not. The SUBTITLE now takes
  `--page-subtitle-font-size-chrome` (`--font-size-2xs`, ~11px). It had been left at
  `--page-subtitle-font-size` on the reasoning that the token was already `--font-size-base`, the
  same step the chrome title takes, so nothing would be gained — but that equality IS the defect:
  a channel name and its purpose line rendering at one size is not a hierarchy, and the design puts
  the caption two steps down. Size also buys height, because it drives the line box at the inherited
  `--line-height-body`: 14px × 1.7 = 23.8px against 11px × 1.7 = 18.9px, so the band stops spending
  ~5px on a caption. Type only — line-height, colour and weight stay with the base rule, so a
  wrapped JA/VI purpose line keeps its rhythm. Its specificity is load-bearing in a way the title's
  is not quite: the 720px compact step declares `.ui-page-header .ui-page-subtitle`, ALREADY a
  compound selector, so the chrome rule wins only by carrying the container attribute on top of its
  own class. And the `extra` cluster now CENTRES on the bar (`align-self: center`) wherever the
  header row is a row (>=640px). `align-items: flex-start` there is right for a document — a
  Save/Publish group belongs on the first line of a tall `<h1>`, not beside its second — and wrong
  for a bar, which has no tall heading to align to. Measured, that was 8.65px: 28px icon buttons
  pinned at y=14 inside a 45.3px header row whose title block centred at y=22.65, which is what a
  reader sees, correctly, as "the icons are not centred". `align-self` on the extra box rather than
  `align-items` on the row, so the heading keeps the stretch it has today and the two alignments
  stay independent; scoped INSIDE the 640px block, because below it the row is a COLUMN, where the
  same declaration would centre `extra` sideways and release the full-width stretch the base rule
  gives it. `headerLayout="responsive-inline"` keeps its own flex-start under 640px: that
  arrangement exists to hold one compact control beside a wrapping title band, which is the
  document case again.
- **`--page-subtitle-font-size-chrome`** — the chrome SUBTITLE step, `var(--font-size-2xs)`
  (ratio⁻², ~11px), for the caption under a chrome top row: a channel's purpose line, a mail
  preview. A fourth knob beside `--page-subtitle-font-size` / `-compact` for the same reason the
  title step is a third one — those two are one document subtitle at two viewport sizes, this is a
  different kind of page and holds at every width. Read only when the prop is passed (rule #44); a
  service retunes the caption step here once rather than hanging a `text-*` utility on the subtitle
  at a call site, which would be invisible to the responsive step and put chrome typography back in
  the app.
- **`--page-title-font-size-chrome`** — the chrome title step, `var(--heading-h3)`
  (= `--font-size-base`, 14px), so the row reads as a label ON the surface rather than the page's
  headline. A deliberate THIRD knob beside `--page-title-font-size` / `-compact`: those two are one
  title at two viewport sizes, this is a different kind of page and holds at every width. Read only
  when the prop is passed (rule #44), so no existing page resolves it; a service retunes the chrome
  step here once instead of overriding `--page-title-font-size` at a call site, which would
  re-theme every page in the subtree and still lose to the 720px rule.
- **`--page-pad-block-start-chrome`** — the page's TOP inset under `headerScale="chrome"`, `0px`,
  so chrome opens on the frame's edge while a document page keeps `--space-page-active-y`. Flush is
  the quiet state for chrome (rule #44), and it is a knob rather than a literal so a service whose
  design grid wants its chrome to breathe writes `--page-pad-block-start-chrome: var(--space-2)`
  once in its theme instead of padding — or negative-margining — the page shell at the call site.
  Read only when the prop is passed, so no document page resolves it.
- **`AppShell` renders NO top bar when all four bar slots are omitted.** The grid reserved
  `--app-shell-bar-height` unconditionally, and with `topbar` undefined the shell fell back to a
  `.app-topbar-rail` holding `logo` — so a shell whose PAGE owns the top row (chat, mail, an IDE)
  got two stacked rows of chrome, measured in a consumer chat shell at ~48px bar + ~60px page
  header, over exactly the region that needs the height most. With `topbar`, `topbarLeft`,
  `topbarRight` and `logo` all `undefined` there is now no `<header class="app-topbar">` at all
  and the row is published as `data-topbar="none"` on `.app-root`, which collapses it to `auto`
  (0 in practice) in the default template, under `data-topbar-span="full"` — which re-declares
  areas only — and inside the narrow-width block, which must not restate the rows. One exception,
  deliberate: below the responsive breakpoint the docked sidebar is hidden and AppShell's own
  hamburger is the only route to navigation, so when a drawer exists the `<header>` is still
  rendered carrying that trigger alone, and CSS — not the row — keeps it off the wide layout. The
  trigger is `undefined`, not empty: `topbar={<></>}` or a conditional resolving to `null` still
  renders the header and still eats the row.
- **`SplitPane` closes its rail with `aside={null}` — without remounting `children`.** The aside
  column was rendered unconditionally, so a collapsible panel (a Slack thread, a Linear detail
  rail) forced the call site to drop the whole component when closed. That changes React tree
  depth, so `children` remount: measured in a consumer chat shell as a reader at `scrollTop 400`
  being thrown to 1522.5 on opening a thread. Keeping the component mounted with an empty aside
  was the only alternative and it leaves a blank 22rem column. Now `null` renders no `<aside>` and
  the grid falls to one column with no gap, while `.ui-split-pane-scope` / `.ui-split-pane` /
  `.ui-split-pane-main` stay put at the same depth — which is what lets React reuse the DOM node.
  `aside` stays REQUIRED so the call site is explicit about open vs closed. Also corrected in the
  catalog: the stacking threshold has been a container query on the pane's own width (48rem, and
  64rem for `lg`) since gh#165, not the `1080px` viewport media query still documented.
- **`PageContainer` `toolbar` — the missing page-chrome slot between the header and the body.**
  The shell owned the page header (title/subtitle/status/extra/breadcrumb) and the footer
  (`footer` + `stickyFooter`), but there was NO slot for a fixed strip in between — a filter bar,
  a status band, a chat channel's workflow rail. A page had to either put the strip inside
  `children`, where `fill` scrolls it away, or hand-lay `position: sticky` at the call site, which
  is exactly the "never hand-lay page chrome" the system forbids (and sticky is not even the same
  thing: content keeps flowing UNDER a pinned box, which is the half-sliced row every hand-rolled
  version produces). `toolbar` renders a `.ui-page-toolbar` band between the header and
  `.ui-page-body` as a `flex: none` sibling, so under `fill` — where the body IS the scroll
  viewport — it sits outside the scroller entirely. It shares the page gutters and the `measure`
  cap with the header and body from the same rules (that is what keeps the three bands flush at
  both edges), goes full-bleed under `variant="flush"` where `PageContainer.Inset` re-aligns its
  content, and emits NO element and no flex gap when the prop is omitted.
- **`--page-toolbar-pad-block` / `--page-toolbar-divider`** — the `toolbar` band's inset and
  bottom rule, both quiet by default (rule #44). The inset is `0`: the container's
  `--space-section-active` gap already spaces the band from the header and the body. The divider
  is declared `initial` and resolved at the CALL SITE as
  `var(--page-toolbar-divider, var(--page-header-divider))`, so one `--page-header-divider`
  opt-in rules the whole page chrome consistently, a scoped `[data-tenant]` / `.dark` override of
  it still reaches the band (a `:root` binding would freeze it), and
  `--page-toolbar-divider: none` silences just the band. `variant="ghost"` keeps both quiet.
- **`--page-toolbar-background` — the `toolbar` band had a rule knob and an inset knob but no
  GROUND knob.** The band that `toolbar` had just introduced could be spaced and ruled from a
  theme, but not painted, and the consuming design put its chat channel's workflow rail on
  `hsl(var(--card))` so the strip reads as chrome rather than as the top of the transcript. With
  no knob the call site's only route was `className="bg-card"` on the strip — the exact
  "never hand-lay page chrome" the system forbids — and, on being told to remove it, that project
  ended up with a band that is fully TRANSPARENT: worse than before the slot was patched in. The
  utility was never equivalent anyway: it paints the STRIP, so the colour stops at the content box
  instead of running the band's full page width (and full-bleed under `variant="flush"`), and it
  is invisible to a `[data-tenant]` re-theme. `--page-toolbar-background` defaults to
  `transparent`, so a page that never themes it is byte-identical (rule #44); it is bound at
  `:root` rather than `initial` — unlike the divider beside it — because its default is a plain
  CSS keyword and not another role token, so there is nothing for a scoped override to re-resolve
  and `initial` would only hide the default from anyone reading the token file. It is the
  `background` shorthand, so a gradient works as well as a colour. `variant="ghost"` silences the
  band's RULE and deliberately leaves the GROUND alone: ghost is the quiet chrome WEIGHT (rules
  and pads), and a chat page has to be able to be both quiet and painted.
- **`--page-toolbar-pad-block` stays `0` — re-examined when the ground knob landed, and kept.**
  The obvious follow-up was to give the band a small default inset off the space scale now that it
  can be painted. It is still `0`, for three reasons that all point the same way: a TRANSPARENT
  band has no inside for an inset to breathe, so the default would buy height and nothing else;
  the container's `--space-section-active` gap is already the one thing that spaces all three page
  bands, and a second source would double up on this one; and under `fill` every pixel of band
  height comes straight off the scroll viewport the slot exists to protect. What was actually
  missing was not a different default but the instruction, so the MCP catalog now says it in both
  directions: a theme that PAINTS or RULES the band sets `--page-toolbar-pad-block: var(--space-2)`
  in the SAME declaration, and a `py-1.5` at the call site is a DON'T — it pads the strip, never
  the band.
- **`SidebarItemProp.badgeTone` — a nav row's count had no way to say what it MEANS.** `.sb-badge`
  carried a single font-size knob and no colour knob at all, so a rail that has to tell "unread"
  from "mentions you" — every chat, mail and review queue does — could only push a
  `<Badge tone="destructive">` INSIDE `badge`. The row already wraps whatever it is given in its
  own pill, so that renders a pill inside a pill: measured at a 37.11x19.14 `.sb-badge` around a
  25.11x19.14 `<Badge>` with its own border. `badgeTone` is `"neutral"` (default) or
  `"destructive"`, an `Extract<>` subset of the shared `ToneProp` vocabulary rather than a new one
  (rule #23), and deliberately two values: a nav rail answers exactly one question about a count,
  "does this need me personally?", and a five-colour rail is decoration rather than information.
  Changing `badge` itself to `{ label, tone }` was the alternative and was rejected — it breaks
  every existing call site and turns a ReactNode slot into a union — while a token-only fix was
  rejected because it can only recolour EVERY badge in the rail, and the whole point is that two
  rows differ at the same time. The default emits no attribute at all (rule #44), so an existing
  rail renders the identical `<span class="sb-badge">` node; `destructive` adds
  `data-tone="destructive"` to that same node and swaps two colours, leaving min-width, radius,
  inline pad and font size on the shared base rule so a mention row and an unread row still line
  up in one column. It rides the library-composed row (gh#213), so `href`, `linkComponent` and
  `asChild` rows all carry it without touching their markup.
- **`--sidebar-badge-{background,foreground}` / `--sidebar-badge-destructive-{background,foreground}`**
  — the pill's colour, split into a resting pair and an emphasis pair. The resting defaults are the
  literals `.sb-badge` always carried (`hsl(var(--secondary))` fill, `hsl(var(--muted-foreground))`
  text), now reachable from a theme instead of frozen in the stylesheet; the `-destructive-` pair
  defaults to the canonical AA-checked `hsl(var(--destructive))` / `hsl(var(--destructive-foreground))`
  and is read ONLY by a row that passes `badgeTone="destructive"`. All four are declared `initial`
  with the role default resolved at the call site, so a scoped `[data-tenant]` / `.dark` override
  of the role still reaches the pill (docs/TOKENS.md · "Role-mirror knobs MUST be `initial`").
  Colour only — the pill's geometry stays shared, which is what a nested `<Badge>` could never
  promise.
- **`check:doc-prop-existence`** — a guard for the class of bug above, wired into `verify` and
  `verify:static`. `check:mcp-prop-sync` only checked that every declared prop is documented;
  nothing checked that every documented prop is declared, which is why examples could hand readers
  a prop that does not exist and stay green. Examples in `mcp/src/data/*.ts` are string literals
  and those in `docs/**/*.md` are fenced code, so no compiler can ever see them — the check is
  textual, reads `component-api-manifest.json` as the source of truth, and skips the 140
  components whose real surface comes from a third-party primitive (Radix, react-day-picker,
  embla) that the manifest lists only a lower bound for. That limit is printed on every run rather
  than left implicit. Verified by mutation: re-introducing `Button tone`, `Topbar product`, and
  `Form loading` each turns it red on its own.

### Changed

- **`PageContainer` `toolbar` sits FLUSH against the header and the body — chrome is attached,
  not a third page section.** `.ui-page-container` is a flex column with one `gap` between every
  band, which is right for a document page (header / body / footer are three separate blocks) and
  wrong for chrome. Measured on a consumer chat page at 1512×805: header 24/69 · band 85/134 ·
  body 150/685 — 16px of nothing on EACH side of the one element whose job is to divide. The band
  carries a ground (`--page-toolbar-background`) and a bottom rule, so floating it between two
  voids made the rule separate nothing and cost 32px of transcript on the surface where height is
  scarcest. The band now cancels the gap from ITSELF (`margin-block: calc(-1 * var(--page-band-gap))`),
  so the same page measures header 24/68 · band 68/109 · body 109/684 and the body keeps the 32px.
  `--page-band-gap` is internal plumbing, not a new theming knob: it is the ONE resolved number the
  container spaces by, introduced because three scopes re-decide that number (`variant="ghost"`
  swaps it for `--space-stack-md`, the 720px step and the `admin-collection` preset swap the
  section token underneath it) and a band that hard-coded `calc(-1 * var(--space-section-active))`
  would have been right in some of them and silently a few pixels wrong in the rest. Verified flush
  on both sides of the 720px step and under ghost / the preset / a retuned gap. A page that passes
  no `toolbar` is untouched — DOM and geometry byte-identical — and `--page-toolbar-pad-block` is
  unchanged at `0`, now the band's ONLY breathing room: a theme that paints or rules the band sets
  its inset there, and the band has no outside space left to tune. The band is also guarded against
  being the LAST child (`toolbar` with no `children`), where there is no gap under it to cancel and
  the negation would otherwise eat the page's own bottom padding.
  KNOWN AND DELIBERATELY LEFT: the 16px of SPACE between the body and the `footer` (its rule is a
  separate matter, fixed below). Measured on the same
  page — body ends 684, 16px of air, the footer's hairline at 700, its own 16px inset, composer at
  717 — that rule has equal air on both sides, so it reads as a separator rather than as a surface
  adrift, which was the toolbar's actual defect. `footer` is also the shared slot every form's
  Save/Cancel bar lands in, and its 16px is a plain `padding-top`, not a knob a service could turn
  back up; closing it is a separate decision with a far wider blast radius than one chrome band. A
  chat composer therefore still keeps 16px above it.

- **`variant="ghost"` no longer swallows an explicit `--page-header-divider`.**
  `.ui-page-container--ghost .ui-page-header` hard-set `border-bottom: none`, which threw away not
  just the nothing it meant to block but a rule the service had deliberately turned on — so page
  chrome could be opted into a divider and a ghost page would still refuse to draw it. This is the
  identical bug fixed on `.ui-page-toolbar` one release earlier, and it takes the identical cure:
  re-declare the property from the SAME knob with a `none` fallback,
  `border-bottom: var(--page-header-divider, none)`. Nothing inherits in, the opt-in passes through,
  and with the token at its default (`none`) the result is byte-identical to the hard-set version —
  verified in Chromium: a ghost page with `--page-header-divider: 1px solid hsl(var(--border))`
  measured `0px none` before and `1px solid` after, while the same page with the token unset is
  unchanged. Caught by a pixel diff against a consumer chat design, which carries TWO horizontal
  rules in the top chrome (channel head at y=47, work band at y=88) where the app rendered ONE
  (y=133) — the missing y=47 was this declaration. `padding-bottom: 0` in the same rule is
  UNTOUCHED and has its own guard: that half answers "how loud is this chrome", no token mediates
  it, and it is the half a quiet page actually wants.

- **`PageContainer`'s footer rule is a token now — `--page-footer-divider`.** The three page-chrome
  bands had drifted onto three different contracts: the header read `--page-header-divider`, the
  toolbar read `--page-toolbar-divider`, and the footer hard-copied
  `border-top: 1px solid hsl(var(--border))`, so a page could not turn it off at all. Measured on a
  consumer chat screen, where the composer lives in this slot and is itself a bordered `Card`: the
  shell's full-width rule landed directly above it as a SECOND line — a pixel diff against the
  design caught a 100%-wide rule at y=701 the design does not have. The literal moves into the
  fallback, `border-top: var(--page-footer-divider, 1px solid hsl(var(--border)))`, so an unset
  token is byte-identical to what the rule drew before and `--page-footer-divider: none` is the
  opt-out (verified in Chromium: `1px solid` → `0px none` with the token set, unchanged without).
  Declared `initial` at the semantic tier beside the other two, so a scoped `[data-tenant]` / `.dark`
  override still reaches it. It is the ONE chrome divider whose default is a RULE rather than
  silence, and that asymmetry is deliberate rather than an oversight: `footer` is the shared slot a
  form's Save/Cancel bar lands in, where the line separating the actions from the page content is
  the behaviour every existing page already depends on. Three bands, one contract: each rule is a
  knob resolved at the call site with a fallback, and none of them is a `border-*` utility at the
  call site.

- **Frame-coverage ledger: `Card.sizes` / `StatCard.sizes` reclassified** from
  `covered:prop-evidence:size` to `not-applicable:api-manifest`, and the issue #163 ratchet floor
  moved 65 → 63 covered cells. This is the one case where the floor going down is not a violation:
  those two cells recorded coverage of a prop that no longer exists. No untested cell was
  reclassified, and the reason is recorded in the ledger's own baseline note.

### Fixed

- **Documentation examples that used props the components do not have.** `patterns.ts` showed
  `<Button tone="destructive">` (Button has `variant`, not `tone` — `tone` exists only on
  `Text`/`Heading`), and three Topbar examples passed `product` / `productMenu` / `collapsed`
  when `Topbar` only accepts `start` / `center` / `end` / `children`. Copy-pasting any of them
  produced a type error. Rewritten against the real APIs.
- **Documentation examples that invented props outright.** `<Carousel autoplay={false}>` was
  described as "the default in the framework" — Carousel has no `autoplay` prop and never rotates
  on its own — and `<Form loading={{ kind: "skeleton" }}>` appeared twice, including as the whole
  basis of the "Skeleton for INIT, Spinner for ACTIVE" rule, though `Form` has never had a
  `loading` prop. Both rewritten to say what the components actually do.
- **`DescriptionsProp` had drifted from the component**: it described a long-gone `items` array
  API and was missing `layout` / `labelAlign` entirely (both of which the generated manifest
  already listed, and both of which the component has honoured for a long time). Synced to the
  real props, and `DescriptionsLayoutProp` is now re-exported from the vocabulary barrel.

### Fixed

- **Checkbox, Radio, Switch, Input and Select had NO visible focus ring** — the
  `:focus-visible` rule lived in the `components` layer while the controls also
  carry a Tailwind `shadow-xs` utility, and utilities outrank components: the
  composite `box-shadow` won and the ring slot resolved to `rgba(0,0,0,0) 0 0 0 0`.
  Measured in Chrome on the built stylesheet — before: ring slot transparent at
  0px; after: `rgb(0,119,199) 0 0 0 2px`. A WCAG 2.4.7 failure that had been
  invisible because the rule looked correct in the file. The ring now also feeds
  `--tw-ring-shadow`, so the utility's own composite paints it.

### Changed

- **Focus ring is now one global API instead of nine hand-written rules.** The
  ring had drifted into four incompatible shapes across six stylesheets — the
  token pair, the token pair with an ad-hoc `/ 0.45`, and two that hardcoded
  `3px` with `/ 0.35` and `/ 0.3`, bypassing `--focus-ring-width` entirely — plus
  Tailwind `ring-*` utilities written directly into eight components. Same state,
  four thicknesses, no single knob a service could retune, and any component that
  forgot the rule fell back to the browser's own blue (`rgb(0,95,204)`).

  Now: `src/styles/focus-ring.css` is the ONE definition, reading four tokens —
  `--focus-ring-width` / `-color` / `-opacity` / `-offset`. Override globally at
  `:root`, per component via a published knob (`--toggle-focus-ring-opacity`,
  `--rating-focus-ring-offset`, …), or per instance via inline style. Set
  `--focus-ring-width: 0` at any level to turn rings off — shipped ON, since
  removing the indicator fails WCAG 2.4.7. New components opt in with the
  `ui-focus-ring` / `ui-focus-ring-outline` class instead of writing CSS.

  Every existing ring keeps its measured appearance (Button 2px, Toggle 3px/0.35,
  TimeInput 3px/0.3, sidebar & topbar 2px/0.45, rating & accordion outline 2px
  with a 2px gap). Two tests hold the line: one fails if any stylesheet paints a
  `:focus-visible` ring outside the single source, one runs the shipped selector
  with `.matches()` against rendered DOM so a rule that selects nothing is caught.

### Fixed

- **`Pagination` page buttons clipped their own number, wore the browser's focus ring, and
  collapsed the strip near the edges** — three defects reported together from a consumer list of
  21,185 rows (1,060 pages), all measured in Chrome against the shipped stylesheet.
  1. `.ui-pagination-link` was a rigid square (`width: var(--control-height)`, no padding), so a
     label wider than one control-height was cropped by its own box: `12345678` needed 59.3px of
     text inside a 30px content box, and `1043` cleared a 32px box by 0.3px — clipped outright at
     the consumer's 29px density. The button now sizes the way Ant Design, MUI and shadcn do — a
     `min-width` floor for the rhythm plus `padding-inline` for the overflow (new
     `--pagination-page-padding-x`, deliberately `--space-1`: at `--space-2` a two-digit label came
     to 32.8px and pushed the common 1–2 digit buttons off square). One- and two-digit buttons stay
     exactly 32×32; `1043` → 39.7×32, `12345678` → 69.3×32. Height and the 4px item gap unchanged.
  2. No `:focus-visible` rule existed, so the browser painted its own — measured
     `outline: rgb(0, 95, 204) auto 1px`, a blue belonging to no theme and reading as a defect next
     to a teal brand. Page buttons now use the same ring as `.ui-button`
     (`box-shadow: 0 0 0 var(--focus-ring-width) hsl(var(--focus-ring-color, var(--ring)))`).
  3. `buildPageRange` derived its window straight from `current ± siblingCount` and let it collapse
     against the edges, so a 1,060-page list opened as `1 2 … 1060` — four controls with a wide dead
     gap, poor target size and no sense of scale. The window is now CLAMPED rather than shrunk
     (Ant Design / MUI behaviour), so the control count is constant wherever the current page sits:
     `1 2 3 4 5 … 1060` at the start, `1 … 499 500 501 … 1060` in the middle,
     `1 … 1056 1057 1058 1059 1060` at the end — 7 controls each. `buildPageRange` also gained a
     `boundaryCount` parameter (default 1) alongside the existing `siblingCount`; the public
     `Pagination` props are unchanged.

- **A filled picker lost its calendar/clock icon (gh#308)** — `Input`'s `allowClear` REPLACES the
  configured `trailingIcon` with the ✕ (one trailing icon, never two). That is right for a plain
  text field, but for a picker the calendar/clock icon is the ONLY visual sign that the field
  opens a picker at all: a consumer measured a filled `DatePicker` rendering just the clear
  button, so a filled date looked like an ordinary text box (clicking the field still opened the
  calendar — the affordance was invisible, not gone). `DatePicker`, `MonthPicker`,
  `DateRangePicker`, `MonthRangePicker` and `TimePicker` now render their own trailing cluster
  with the ✕ **beside** the trigger (input padding grows `pe-9` → `pe-14` only while both show).
  `Input` itself is untouched, so every other consumer keeps the one-icon rule — pinned by a test
  that asserts a plain `Input` still swaps its `trailingIcon` for the ✕.

### Fixed

- **The restored describedBody rule overrode flush content's zero padding (gh#307)** — the
  nested-`:has()` rewrite made the description half apply to `[data-flush]` content too,
  floating a flush table 18px off its header (measured: a described 関連ファイル section at
  content padding-top 18.4px vs its 備考 sibling at 0). Both halves of the pair now carry
  `:not([data-flush])`; a counter-case test pins that the selector skips flush content.

### Fixed

- **Two card-layout rules had never applied: nested `:has()` is spec-invalid (structural-selector
  sweep)** — Selectors 4 forbids `:has()` inside `:has()`, and Chrome drops the whole rule
  (`CSS.supports` = false, measured on Chrome 151) while the file looks correct — the same
  failure class as the headerAlign selector. Rewritten as valid rule pairs, so two documented
  behaviors now actually happen: a toolbar header (action, no description) removes the body's
  top padding (16px → 0), and a plain header over a tight body becomes symmetric (24/0 → 16/16).
  Consumers using those two card shapes shift by those pixels — that is the documented intent
  finally applying. The sweep added 34 tests that extract every structural selector from the
  shipped CSS and run `.matches()` on rendered DOM (`src/test/css-selector.ts`); the other 37
  rules all select what they claim.

- **gh#305's frame removal also erased the flush table's TOP divider (gh#306)** — the top edge
  meets the CardHeader area, not the card border, so dropping all four edges left the header
  band floating with no separating line (a rental detail's 出荷伝票一覧 section). The rule now
  keeps `border-block-start` and drops only the three edges that coincide with the card frame.

### Fixed

- **`Table bordered` flush inside a Card doubled the frame (gh#305)** — the card already frames
  its flush content, so the table's own outer border rendered two nested rounded frames
  (measured on a consumer detail section). `[data-slot="card-content"][data-flush]
.ui-table-bordered` now drops only the outer frame; the vertical column rules (the point of
  `bordered`, gh#274) and row rules are unchanged, and a bordered table outside a flush card
  keeps its frame. Tested by running the shipped selector with `.matches()` against rendered
  DOM (the 505f0e6 lesson).

### Fixed

- **`DataTable` `headerAlign="center"` selected nothing** (`505f0e6`) — the sort-indicator rule
  used `:not(:first-child)`, but a string header renders as a TEXT node, so the svg chevron IS
  the first element child and the negation excluded the exact node it targeted: the box was
  centered while the text inside stayed 8px off. Now `> :last-child`, correct for both
  `[text, svg]` and `[element, svg]` label shapes. The old CSS-string-reading tests stayed green
  through the breakage; the new test runs `.matches()` against a really rendered DOM.

### Added

- **`Upload` gains `triggerSize`** (`b52106c`) — the self-rendered trigger button could not be
  sized from the consumer, so it could not sit in a toolbar next to icon buttons. Accepts the
  Button size scale; icon sizes move the label to `aria-label` and render icon-only. Default
  unchanged.
- **`DataTable` columns gain `headerAlign`** (`6d7d210`) — align a header cell independently of
  its body cells (a numeric column whose heading should stay start-aligned, and the reverse).
  `align` alone keeps applying to both.

- **`SplitPane` gains `asideWidth="lg"` (30rem)** (`bffaf58`) — measured against the real
  Backlog reference: its fixed rail is 475px on project home/files, and the existing `md`
  (22rem = 352px) falls 123px short. `lg`'s container-query threshold is 64rem (not the 48rem
  of `sm`/`md`) so the main pane never ends up narrower than the rail. `sm`/`md` values are
  intentionally untouched.

### Fixed

- **`Form columns={n}`: the field-to-field row rhythm leaked into the grid (gh#304)** — the
  gh#295 rhythm rule (`.ui-form-field + .ui-form-field { margin-block-start }`) matches adjacent
  siblings ANYWHERE, including ResponsiveGrid items, where the grid's own `gap` already owns the
  rhythm. The margin double-spaced every row (track 29.4 → 40.5px at density tight) and broke
  column alignment: the FIRST field has no preceding sibling and no margin, so row 1's columns
  sat 11px apart — measured on every one of the consumer's 57 two-column search cards. Grid
  ITEMS now zero the margin (`.ui-responsive-grid > .ui-form-field + .ui-form-field`); fields
  merely stacked INSIDE one grid cell are not direct children and keep the rhythm. Measured
  after: both columns share one top per row (203/203, 247/247, …), pitch 55 → 44px.

## [18.14.0] - 2026-08-23

### Added

- **`FormErrors` + `Form errors` + `FormField name` — the server error bag gets a home for every
  message** — an Inertia app has endpoints whose Laravel validation errors attach to
  hidden/derived fields (`action_mode`, `page`, `source_slip_cd`…) that no visible field displays,
  so the user pressed save and saw NOTHING. `Form` now accepts the whole bag
  (`errors={form.errors}`); a `FormField name="…"` resolves its own message from the bag (an
  explicit `error` prop wins, arrays surface their first message — Laravel `$errors->first()`
  semantics) and CLAIMS its key in a reference-counted registry; `<FormErrors />` renders only the
  unclaimed remainder as an `Alert tone="destructive"` (role="alert", localized default title
  `dataEntry.formErrors.title`), and renders nothing while every entry is claimed. The consumer
  never maintains a per-page except-list — that is the point. `FormFieldControl` forwards its
  `name` on both paths, so `FormRoot`-driven fields claim their keys too. New vocabulary type
  `ErrorBagProp` (`Partial<Record<string, string | string[]>>`).

- **`FormErrorsProvider` — one bag over sibling Forms** — the standard consumer edit screen
  splits into several sibling Card+Form sections sharing ONE server bag, and a registry private
  to each `Form` would make `<FormErrors />` in section A repeat every message section B already
  claims. `Form` therefore provides the claim registry only when it carries its own `errors`; a
  Form WITHOUT the prop joins a surrounding `FormErrorsProvider` (new public export) so every
  section's `FormField name="…"` claims into the same registry and one `<FormErrors />` covers
  the whole screen. A nested Form WITH its own `errors` still starts a shadowing registry.
  New prop type `FormErrorsProviderProp`.

## [18.13.1] - 2026-08-23

### Fixed

- **`FormField`'s label now reaches every control NESTED under a composite wrapper (gh#303)** —
  `cloneElement` wires the field-a11y contract onto the single direct child only, so when that
  child was a layout wrapper (a `Flex` holding a range from/to pair, a 年/月 input+select combo)
  every control inside was left with no accessible name at all: an axe sweep of 92 real app
  screens measured `label` (critical, 46 nodes — the from/to `<input>`s) and `button-name`
  (critical — nameless Radix Select / SearchSelect `role=combobox` triggers). FormField now also
  publishes its label through `FieldNameContext` (`src/lib/field-a11y.ts`), and each control's
  semantic focus target — `Input`'s `<input>` (hence NumberInput, DatePicker and everything
  composed on it), `SelectTrigger`, `SearchSelect`'s trigger — adopts it as a LAST-RESORT
  accessible name. A control that already has a name (its own `aria-label`/`aria-labelledby`, or
  the one FormField cloned onto it as the direct child) keeps it untouched, so set a per-control
  `aria-label` when the halves should announce distinct names (開始日/終了日).

- **A named `Flex` renders `role="group"` instead of an invalid named bare div (gh#303)** — a
  role-less `<div>` may not carry naming attributes, and FormField legitimately lands
  `aria-label`/`aria-labelledby`/`aria-required` on a Flex that wraps a composite field (axe
  `aria-allowed-attr`, critical, 5 nodes on 4 real app screens). A Flex carrying a naming
  attribute with no explicit `role` now defaults to `role="group"` and keeps only the aria the
  group role allows — `aria-errormessage` folds into `aria-describedby`, widget-only
  `aria-required`/`aria-invalid` are dropped (the `pickGroupFieldA11y` policy). An explicit
  `role` prop opts out entirely (e.g. `DataTable.BulkActions`' `role="region"` is untouched).

## [18.13.0] - 2026-08-22

### Added

- **`Form` gains `asChild` (from the in-flight work committed as `Form: asChild, and a
label-column type token`)** — Inertia's `<Form action method>` and TanStack Form render their own
  `<form>`, and two form elements cannot nest, so a consumer had to choose between the router's
  submission handling and the design system's field layout: `FormField` reads its layout from
  `Form`'s context, and the only way to provide that context was to render a second form element.
  `asChild` keeps the context and hands the element back
  (`<Form asChild layout="horizontal" labelWidth={174}><InertiaForm …/></Form>`). Also adds
  `--form-label-font-size`, applied through `Label`'s own className because `Label` sets `text-sm`
  on the element itself, so a font-size inherited from an ancestor never reaches the text.

- **`ErrorSurface` accepts `400` (gh#301)** — the status union was `403 | 404 | 500 | 503`, so a
  Bad Request page (a CakePHP `BadRequestException` port, for instance: the launch parameters are
  invalid) could only be expressed by casting the status at the call site and hand-supplying
  `icon`/`tone`, since `STATUS_META` had no entry to derive them from. `400` now carries
  `TriangleAlert` + `tone="warning"` — this system's warning glyph, the same mark `Alert
tone="warning"` and the warning toast already use — because a malformed request is neither a
  miss (404), a refusal (403) nor a failure (500).

### Fixed

- **`PageContainer`'s header `extra` could not wrap, and starved the `<h1>` instead (gh#300)** —
  at `>=640px` the action slot was `width: auto` + `flex-shrink: 0`, i.e. frozen at the action
  group's max-content width, which is unbounded: an admin list header with 10–13 buttons asks for
  more room than the content column has. Because the box could not shrink, the `flex-wrap: wrap`
  it already declared never had a narrower width to wrap into, so the entire deficit was charged
  to `.ui-page-header-heading` (`min-w-0`) — the title collapsed to 0px and wrapped one CJK
  character per line while action buttons still overflowed the page. The `<=720px` escape hatch
  (`.ui-page-header-extra > .ui-flex { max-width: 100% }`) could not help either: a percentage
  resolved against a `fit-content` parent is circular. `extra` is now `flex-shrink: 1` +
  `min-inline-size: 0`, keeping its max-content base size — a header that already fits is
  byte-identical (measured: 1 and 4 button headers unchanged at 768/1024/1280/1456, and the whole
  `<640px` arrangement unchanged) — while a crowded one wraps its buttons and leaves the title a
  readable measure (768px/13 buttons: `<h1>` 0px · 21 lines with 2 buttons off-screen → 233px ·
  2 lines with none off-screen). Rejected alternative: pinning the heading with `flex: 0 0 auto`,
  which would have made a long title unable to yield space — the mirror image of the same bug.

## [18.12.20] - 2026-08-21

### Changed

- **Noto Sans JP is now the primary bundled face; M PLUS 2 is the fallback (product override,
  direct instruction)** — reverses the primary/fallback order the v18.12.0 bundle change set. Every
  locale's font stack (`--font-sans-base`, `--font-sans-vi`, and the email-safe
  `--email-font-family-sans`) now names Noto Sans JP first, M PLUS 2 second; both faces stay
  bundled, only the order flips. Before flipping, re-measured the historical #254 clipping
  guard (a tight line-height that sheared Vietnamese tone marks and Latin descenders) against
  real Chromium canvas ink extents for both faces at the sidebar nav's 0.8125rem — Noto Sans JP's
  worst-case ink (14.65px) stays under M PLUS 2's own worst case (15.38px) that the existing
  `--sidebar-nav-item-line-height: 1.5` token was validated against, so no regression there.

## [18.12.19] - 2026-08-21

### Changed

- **`AppSettingPicker`'s icon-only trigger drops its resting border/bg/shadow (gh#297)** — it
  reused `controlTriggerClass`'s form-input chrome (`border border-input bg-background shadow-sm`),
  meant for labeled Select triggers. In a shell topbar (`kind="locale"`, `appearance="icon"`, the
  canonical locale switcher — see `ShellFrame`) it sits beside ghost icon buttons (sidebar toggle,
  notifications, account menu) with no border at rest, so the bordered box read as an inconsistent
  outlier. Now `border-transparent bg-transparent shadow-none` at rest with a `hover:bg-accent`
  ghost hover, matching its siblings; the open-state ring (`data-[state=open]:border-ring`, from
  `controlTriggerClass`) and the focus-visible ring are untouched. Scoped to the icon appearance
  only — labeled/inline Select triggers (forms, settings rows) keep their input-like chrome.

## [18.12.18] - 2026-08-21

### Changed

- **Topbar search trigger fills the center slot by default (gh#296)** — product override, direct
  instruction. `.tb-search` was a fixed ~420px box (`--topbar-search-max-width: 26.25rem`),
  centered regardless of available room, leaving visible dead space before whatever sits in `end`
  (locale picker, notification bell, account menu) at normal desktop widths. `--topbar-search-max-width`
  now defaults to `none`; `.tb-search` is `width: 100%; max-width: var(--topbar-search-max-width)` —
  it fills the slot flush to `end` by default. A consumer wanting the old capped, centered look sets
  the token explicitly (e.g. back to `26.25rem`).

## [18.12.17] - 2026-08-21

### Fixed

- **Form's field-to-field row rhythm was structurally dead once a FormField nested through
  CardContent (gh#295)** — `.ui-form`'s rhythm was a flexbox `gap`, which only reaches DIRECT
  children. The real composition every Save-button form needs (`Form` wrapping `CardContent` +
  `CardFooter`, so the submit button stays inside the `<form>`) puts `FormField`s one level deeper
  as grandchildren, past `gap`'s reach — consecutive fields rendered with zero intentional
  spacing. Replaced with margin-based sibling spacing at two specificity tiers: `--form-block-gap`
  (unchanged `--space-4`) for a Form's own top-level blocks, and the new, more-specific
  `--form-field-row-gap` (`--space-3`, mirrors `--descriptions-row-gap` from gh#294) for
  field-to-field rhythm — this wins by CSS specificity whenever two `FormField`s are adjacent, at
  any DOM depth relative to `Form`. No more page-local `<Flex gap="md">` workaround needed around
  a FormField group.

## [18.12.16] - 2026-08-21

### Fixed

- **`.ui-data-table-surface` uses `overflow: clip`, not `hidden` — `stickyHeader` was a no-op
  (gh#291 family)** — `hidden` made the surface a scroll container between the real scroll region
  (`.ui-data-table-scroll`) and the table, so `stickyHeader`'s (default `true`) sticky context, and
  the pinned column's, anchored to a box that never scrolls — the header scrolled away with the
  body. `clip` preserves the same rounded-border clipping without becoming a scroll container, so
  sticky binds to the real scroll region (measured: `hidden` → thead moved 300px per 300px
  scrolled; `clip` → 1px).

### Added

- **`Descriptions` gains `labelAlign` + a themeable row-gap token (gh#294)** — mirrors `Form`'s own
  `labelAlign` contract exactly (same prop, same `text-align: end` mechanism, same vertical-only
  guard), so a `Descriptions` block can be told to align like a `Form`/`FormField` composed beside
  it. The row-to-row gap moves from a hardcoded `gap-y-3` utility to `--descriptions-row-gap`
  (default `var(--space-3)` — visually identical to the historical value); a consumer placing
  `Descriptions` next to a `Form` on one card retunes it to `var(--space-4)` to share the same
  rhythm. Both default to today's exact rendering — no existing consumer's output changes.
- **`FormField` gains `staticText` — a read-only VALUE row on the same `Form` (gh#294)** — for a
  field genuinely mixed into an otherwise-editable form (an immutable name/email row above an
  editable role `Select` on the same card), `<FormField label="…" staticText="…" />` renders plain
  text matching `Descriptions.Item`'s value typography byte-for-byte, skipping FormField's control
  a11y wiring entirely (there is no control to label). Because it's the same `FormField` reading
  the same `Form` context, it inherits `layout`/`labelAlign`/row-gap automatically — nothing to
  reconcile between two different components by hand. Mutually exclusive with `children`.

## [18.12.15] - 2026-08-21

### Fixed

- **`.app-sidebar` joins the ring-headroom contract (gh#291)** — same defect as the topbar in the
  other half of the shell: `overflow: hidden` with nav rows flush against the rail's inline edges
  clipped a focused row's ring on three sides. Now `overflow: clip` + `var(--focus-ring-clip-margin)`,
  joining the `@supports` Safari fallback.

### Added

- **`Table preset="stacked-record-collection"` restored (gh#293 — SCR-215)** — the canonical WIDE,
  heterogeneous record collection: a table whose columns/content cannot be squeezed into any fixed
  narrow-frame measure at all (an admin detail row with many disparate, free-text fields), as
  distinct from `action-collection`'s dense five/six-column queue. Below `collapseBelow` the
  `<thead>` hides and every `<tr>` becomes a bordered key-value card; each `TableCell`'s own new
  `label` prop renders inline above its value, taking over the accessible-name role the hidden
  `<th>` would otherwise carry. Above the step it renders as a byte-for-byte ordinary table. This
  preset previously shipped to npm (≤18.12.11) but was never committed to this repository's
  tracked history, so a later direct-local-publish from a checkout without it silently dropped the
  capability with no deprecation notice — restored here with the same container-query architecture
  as `action-collection` (measured against the table's own container, one step per canonical
  sm/md/lg/xl breakpoint) plus its own themeable card/label tokens
  (`--table-stacked-collection-*`).

## [18.12.14] - 2026-08-21

### Fixed

- **Topbar ring headroom actually applies — Chromium rejects calc() in overflow-clip-margin
  (gh#291 follow-up)** — 18.12.13 set the margin to `calc(2 * var(--focus-ring-width))`, which
  Chromium drops at parse time (even a literal `calc(2 * 2px)` is refused), silently degrading
  the headroom to 0 and clipping flush-edge rings harder than before. The value now lives in a
  dedicated plain-length token `--focus-ring-clip-margin: 4px` consumed as a bare `var()`,
  which Chromium honours (verified live: computed 4px, ring fully painted on all four edges).

## [18.12.13] - 2026-08-21

### Fixed

- **Topbar flush-edge focus ring no longer shaved on the clipped axis (gh#291 follow-up)** —
  the rails' `overflow-clip-margin` was `var(--focus-ring-width)` (2px) while focus/open rings
  paint up to 3px, so a control flush against a rail edge (the locale picker is the first child
  of `end`) lost 1px of ring on the left. Bar and rails now reserve
  `calc(2 * var(--focus-ring-width))`, and `.ui-topbar` itself gained the same margin so the
  last control's outer edge survives the bar-level clip too.

## [18.12.12] - 2026-08-21

### Fixed

- **Topbar no longer clips its controls' focus ring (gh#291)** — `.ui-topbar` used
  `overflow: hidden`, whose box hugs `--control-height` exactly, so the 2–3px outward
  focus ring of slot controls (AppSettingPicker, icon buttons, the user menu) was cut
  flat at top and bottom; the rails' `overflow-clip-margin` could not help because the
  parent had already swallowed the ring (and Safari does not implement clip-margin).
  Bar and rails now clip the horizontal axis only (`overflow-x: clip` +
  `overflow-y: visible` — a `hidden`/`visible` pair would compute to `auto` and still
  clip), keeping the shrink/truncation contract while the ring paints fully.

- **Page-size TRIGGER uses the shortest per-locale form (gh#290)** — the long unit on the
  control itself (「50 件/ページ」) took disproportionate space; the trigger now renders the new
  `pageSizeTrigger` string (ja 「50件」 / en "50 / page" / vi "50 / trang", the kintone
  treatment) while the menu keeps bare numbers (gh#289) and the ページサイズ aria-label stays.

- **Page-size menu is compact (gh#289)** — repeating the full localized unit on every dropdown
  row (「15 件/ページ」×4) was long and redundant; the menu now lists bare numbers while the
  TRIGGER keeps the localized unit (「20 件/ページ」), the MUI/kintone treatment.

- **ja: size-changer reads 「15 件/ページ」 (gh#288)** — the ja `pageSizeOption` was a literal of
  the EN "15 / page"; natural Japanese (and antd's ja_JP convention) uses the 件 counter.

- **Pagination size-changer no longer clips localized labels (gh#286)** — the trigger was a
  fixed `--pagination-size-width` (5.5rem, sized for the EN label) and the ja locale rendered
  「20 / ペ…」truncated. The trigger now sizes to its content (`w-max`); the token is demoted to
  a MIN width so short labels keep the control rhythm.

- **Horizontal Form defaults to a fixed, aligned label column (gh#284)** — the old
  `--form-label-width: max-content` sized each field's label column to its own label, so
  multi-column horizontal forms had controls starting at ragged x positions. The default is now
  `8rem`, mirroring `--descriptions-label-width` so edit forms and show pages share one optical
  grid; the `labelWidth` prop and the token still override per form/tenant.

- **Alert's default radius is now the Card radius (gh#282, gh#268 follow-up)** — an Alert almost
  always sits in the same page column as Cards, and the old `--radius-md` default (2 φ-steps
  smaller than `--card-radius`) read as mismatched corners that every tenant re-aligned by hand.
  `--alert-radius` now defaults to `var(--card-radius)`; override the token for a smaller radius.

- **Plain (non-searchable) Select honors `clearable` (gh#280)** — the plain branch dropped the
  prop entirely, so no clear affordance ever rendered despite the documented default-true
  contract. It now mirrors SearchSelect: while a CONTROLLED value is selected (and not
  disabled/readOnly) the chevron swaps for an X overlay that emits `onValueChange("", undefined)`;
  `clearable={false}` and uncontrolled selects keep the previous DOM byte-identical.

### Added

- **`check:mcp-catalog-coverage` release gate (gh#278)** — consumer audit found the published
  18.11.x MCP catalog denying components the package actually ships (`rbac-service-roles` said
  ServiceRolePanel / BranchScopePicker / PermissionMatrix "do not exist" while all three are real
  exports, and `get_component PageHeader` documented a standalone export that never shipped). The
  catalog entries were already fixed on main; this gate keeps them fixed: every public export in
  `component-api-manifest.json` must be discoverable somewhere in `mcp/src/data/*.ts`, and catalog
  prose may not carry existence-denial claims ("NO <Export>", "<Export> does not exist") for a
  shipped export. Wired into `verify` and `verify:static`.

- **Region focus ring is token-gated and OFF by default (gh#276)** — gh#271 gave
  `.app-main:focus-visible` the control-strength DS ring, but a 2px brand frame around the whole
  content region reads as a glitch to mouse-first users (`:focus-visible` promotes on any keypress
  after a click-focus). New tokens: `--region-focus-ring-width` (default `0` — no ring; a
  deliberate product tradeoff against WCAG 2.4.7 keyboard-scroll visibility) and
  `--region-focus-ring-color` (`initial` → resolves to the live focus-ring hue at the call site).
  Opt back in with one line: `--region-focus-ring-width: var(--focus-ring-width);`.

- **`Table bordered` prop (gh#274)** — draws the full cell grid: a 1px outer frame plus vertical
  rules between columns (horizontal row rules already come from TableRow). For tables carrying
  rowSpan/colSpan merged cells (permission matrices, 帳票-style grids) — without column rules the
  merge relationships are unreadable. Colour via the new `--table-border-color` component token
  (declared `initial`, resolving to the live `--border` role at the call site). Default `false`
  keeps the plain table byte-identical.

### Fixed

- **DataTable scroll-hint fade rendered unconditionally (gh#267)** — `.ui-data-table-scroll::after`
  was pure CSS with no overflow detection, so every table WITHOUT a `pin:'end'` column showed a
  permanent inline-end fade washing out its last column even when nothing scrolls. The component
  now measures the scroll box (scroll + ResizeObserver, RTL-safe) and stamps
  `.ui-data-table-has-overflow-end`; the fade only shows while the region overflows and is not
  scrolled to the inline-end.

### Added

- **`--alert-radius` component token (gh#268 — rule #45)** — Alert's corner radius was a
  hard-coded `--radius-md`; a full-width Alert sitting above a Card (`--card-radius`, 2 φ-steps
  larger) read as unsynchronized corners with no knob to align them. Default unchanged.

- **`AuthShell preset="registration"` (gh#256)** — the canonical SCR-002 sign-up measure: a
  22.5rem/360px form measure with a 15px inline gutter at 390 (card x=15, width=360, the same page
  rhythm as `preset="login"` so sign-in → sign-up never jumps on a phone). START-aligned like
  login — a registration card is the tallest surface in the hosted-identity set and a vertically
  centred tall card overflows ABOVE the scroll origin on a short viewport, putting its first field
  out of reach; start-aligned, a long form simply scrolls. The only preset with a
  footer-clearance knob of its own (`--auth-shell-registration-main-padding-block-end{,-mobile}`,
  3rem/2rem) so the legal/consent footer never sits flush against the submit button. The
  block-start offset is DERIVED from the canonical artboard (card y=284 at 1440x900, y=274 at
  390x844 = padding-block-start + 112px identity track + 20px stack gap), and the fixed identity
  track absorbs absent / one-line / wrapped two-line identity copy without moving the card anchor.
  Carries the full password registration form AND the pending-email confirmation state with no
  consumer geometry CSS. New tokens: `--auth-shell-registration-{card-max-width,
main-padding-block-start, main-padding-block-start-mobile, main-padding-inline,
main-padding-inline-mobile, main-padding-block-end, main-padding-block-end-mobile,
card-stack-gap, identity-slot-block-size}`. Worked screen:
  `docs/layout/auth-shell-registration.tsx`; visual contract:
  `scripts/auth-shell-registration-visual.mjs` (`pnpm test:visual:auth-registration`).
- **`SocialLinks` and `OrganizationChoiceList` are formally documented COMPOSITIONS (gh#256), not
  components.** Both fail the Framework-Component Test: the social/provider action row is
  `<AuthDivider label="…"/>` + a `Flex direction="col" gap="sm"` of real
  `Button variant="outline"` (which providers a product offers, in what order, and what consent
  they imply are product decisions the package must not invent; `disabled`/`loading` are the
  Button's own props). The organization choice list is `Card` > `CardContent flush` > a `<ul>` of
  `ListRow as="li"`, with its loading / empty / error / denied / disabled states drawn from
  existing exports (Skeleton rows, `EmptyState`, `Alert tone="destructive"` /
  `tone="warning"`, the Button's own `disabled`) — never bespoke markup. Both are catalogued in
  the MCP AuthShell entry and demonstrated with every state in
  `docs/layout/auth-shell-registration.tsx`.
- **`PermissionMatrix`, `BranchScopePicker`, `ServiceRolePanel` — the three canonical DXS RBAC
  composites are now REAL public exports** (gh#257, unblocking DXS platform#311). The decision
  followed the gh#251 ErrorSurface precedent: the permission-matrix showcase already proved the
  composition, but a consumer cannot import a docs page, so each canonical contract now has an
  importable home while staying a THIN formalized composition over existing primitives — no new
  interaction machinery, no new tokens, and NO platform domain data (roles, permissions, branches
  and grants all arrive via props).
  - `PermissionMatrix` (`@godxjp/ui/data-display`) — sticky-permission-column role × permission
    grid over the Table family + the tested `lib/permission-grid` helpers. Read-only ✓/— cells by
    default (shape + `sr-only`, never colour-only); `onGrantChange` switches to real `Checkbox`
    cells with `locked` roles and `readOnly` staying read-only; `compare`/`diffOnly` reuse the
    helper logic; lifecycle states use the DataTable #216 vocabulary and precedence
    (`loading` → `denied` → `error` → `empty`, with `onRetry` on the built-in error only).
  - `BranchScopePicker` (`@godxjp/ui/data-entry`) — the all-branches-vs-subset scope control as
    ONE controlled `{ mode, branchIds }` value (mode flips preserve `branchIds`), composed from
    `RadioGroup` + `CheckboxGroup` + `SearchInput` so keyboard and field-a11y come from the
    primitives. `error` stays FIELD VALIDATION (wired `aria-invalid`/`aria-errormessage`);
    collection reads use `listError`/`denied`/`loading`/`empty`; `readOnly` renders a static
    badge summary.
  - `ServiceRolePanel` (`@godxjp/ui/layout`) — role-collection ⇄ detail over `MasterDetail`
    (`rail="master"`; geometry stays token-owned: two tracks at 1440/1024, stacked at 390).
    Controlled selection triad with `aria-current` role rows, CLDR-pluralized member counts,
    `locked` system roles, and a built-in destructive `AlertDialog` — `onDeleteRole` fires only
    AFTER the user confirms; `readOnly` hides every mutating affordance; #216 lifecycle states.
  - The `docs/showcase/permission-matrix` header no longer teaches "not a framework component"
    (the exact wrong-guidance propagation gh#251 documented); it now points at the export and
    remains as the composed variant. New docs pages: `docs/data-display/permission-matrix.tsx`,
    `docs/data-entry/branch-scope-picker.tsx`, `docs/layout/service-role-panel.tsx`. Contract
    pinned by `src/components/__tests__/rbac-composites.test.tsx` (exports, state precedence,
    read-only/locked/editable semantics, destructive confirmation, basic keyboard, vi/ja/en keys).

### Fixed

- **DataTable no longer silently caps a plain table at 10 rows (gh#270)** — the internal
  TanStack pagination default (pageSize 10) sliced every `data`+`columns` table even when no
  `<DataTable.Pagination>` was composed and no pagination props were passed: rows 11+ were
  unreachable with no pager UI and no warning. Client pagination now engages ONLY when
  something drives it — a numbered `<DataTable.Pagination>` child (cursor mode is server
  paging and is never client-sliced), or controlled `pagination`/`onPaginationChange` state.
  A plain table renders every row.

- **AppShell content region no longer shows the browser default blue focus ring (gh#271)** —
  `.app-main` carries `tabindex="0"` (axe `scrollable-region-focusable`, dbad118) but had no
  `:focus-visible` style, so tabbing into the region drew the user-agent outline (blue in
  Chrome) around the entire content area. It now uses the design-system ring
  (`--focus-ring-width` / `--focus-ring-color`→`--ring`), INSET because `.app-main` is the
  shell's `contain: paint` clip boundary. The indicator stays visible — the region is
  keyboard-focusable and WCAG 2.4.7 requires focus to be shown.

- **Release staging dist-tags no longer accumulate on the registry.** Every release staged both
  packages under a per-version `godx-staging-${version}` dist-tag and planned a final
  `npm dist-tag rm` pair — but deleting a dist-tag needs npm DELETE rights the CI automation token
  does not have (and a human login is still OTP-gated), so the removal steps aborted every release
  and the tags piled up forever (`godx-staging-18.{7,8,9}.0` on both `@godxjp/ui` and
  `@godxjp/ui-mcp`). `scripts/release-core.mjs` now stages under the single constant, OVERWRITABLE
  `godx-staging` tag: each release overwrites the previous pointer, nothing accumulates, and no
  delete permission is ever needed. After a successful release `godx-staging` deliberately equals
  `latest` until the next release moves both. Pre-#266 recovery-state files (schemaVersion 2, with
  the versioned stageTag and the removal-progress flags) remain loadable and are normalised on
  validation. **One-time manual cleanup**: the six legacy tags already on the registry must be
  removed by a human with 2FA/OTP (command in godx-jp/godxjp-ui#266) — the script never creates
  versioned staging tags again.
- **`Table` / `DataTable` `preset="action-collection"` — a compact-tier legibility floor:
  `--table-action-collection-min-inline-size-compact` (dxs-platform/platform#680).** The preset's
  percentage budget is sized for ONE column per priority tier plus one free-text column: 24%
  primary + 22% secondary + 20% meta + a 2.75rem action measure. A queue that REPEATS a tier — two
  `secondary` columns, three `meta` columns, or a second unmarked column — asks for more than 100%,
  and under `table-layout: fixed` the surplus comes out of the COLUMNS rather than out of the
  table. Measured on a consumer's seven-column Japanese admin queue at 390: 名前 59 · 種別 54 ·
  支店 54 · シリアル番号 49 · 最終接続 49 · 状態 49 · 操作 44 in a 356px table, with シリアル番号
  and 最終接続 wrapping at TWO characters per line and a six-column sibling reaching ONE character
  per line in a 14px box. That is a WCAG 2.2 SC 1.4.10 Reflow (AA) failure — the content is present
  and unreadable — and the preset had no seam through which a consumer could say so.

  The new token is the measure below which the preset stops fitting the table to its container.
  Above the floor nothing changes. Below it the `overflow-x: auto` region the table already owns
  takes the overflow instead of the cells, which is the conformant outcome rather than a
  concession: SC 1.4.10 exempts "parts of the content which require two-dimensional layout for
  usage or meaning", and its own note names data tables as the example. A queue that scrolls
  horizontally inside its card conforms; a queue whose cells are one character wide does not.

  **Default `0`, so this is inert for every existing consumer** — a queue that fits its priority
  budget keeps fitting, at the same measures, with no scroll introduced. Nothing is hidden, no
  breakpoint is invented, and the table is byte-identical at 1440. Applies at all four collapse
  steps (`sm` / `md` / `lg` / `xl`).

- **`CommandPalette` — a real query accessor: `search` / `defaultSearch` / `onSearchChange`, plus
  `shouldFilter` (gh#412).** A server-backed result group could not learn what the user had typed:
  the palette exposed the open state and the groups, and nothing in between. The only route left was
  reaching into the internal `cmdk-input` element, which a consumer built, proved, and then reverted
  rather than ship — driving the palette through its own internals destabilised their empty-state
  contract test, because cmdk decides that node from a SCHEDULED count of the items that have
  registered in the DOM, so an async group populating a frame late flips it on and off. That was the
  right call, and this is the seam that makes it unnecessary. The pair follows the `SearchSelect`
  idiom (`search` + `onSearchChange`) and adds the uncontrolled half `SearchSelect` lacks: pass
  `search` to control the query, `defaultSearch` to seed it, or neither. `onSearchChange` fires on
  every keystroke either way, and once more with `defaultSearch` when the palette closes — the query
  has never survived a close (it used to fall out of the dialog unmounting cmdk), and now that it is
  a prop the palette says so out loud, so a controlled consumer can drop the result set it fetched
  for the abandoned query. `shouldFilter={false}` hands filtering to the consumer, which is what
  server-side search needs: without it every row the server already matched is scored a second time
  against the same string.
- **`CommandPalette` — a stated empty-state contract, and `shouldFilter={false}` changes who owns
  it (gh#412).** With `shouldFilter` (the default) nothing moves: cmdk owns the empty node, and it
  means "this palette holds items and the query matches none of them". With `shouldFilter={false}`
  the PALETTE owns it, derived synchronously from props — `labels.empty` renders when `groups`
  carries no items, and never while `loading` or `error` is set. cmdk's node cannot be trusted in
  that mode, because it counts DOM registrations on a scheduler rather than reading what the
  consumer knows; reading `groups` instead makes "did we render the empty state?" a pure function
  of that render's props, which is the thing a contract test can assert without racing. The
  practical rule, now documented on the component and in the MCP catalog: hold `loading` for the
  whole in-flight window — a request that has not answered yet is not an empty result. No new prop
  was needed to say it.

### Fixed

- **Controls that narrow viewports were hiding (WCAG 2.2 SC 2.1.1 / 2.4.7 / 1.4.10).** Found by the
  frame-geometry sweep across 154 frames × 8 widths, which now reports zero.
  - `Rating` laid its stars in a non-wrapping row. A 10-star scale needs ~276px of hit area; a
    320px viewport offers ~212 inside a card, so the last stars were painted outside the surface
    with nothing to scroll them into view — unclickable and invisible. The row now wraps, which is
    a no-op wherever it already fits.
  - `DataTable` on a **flush** `PageContainer` gave the whole page 16px of horizontal scroll at
    320/375/390. The scroll region bleeds by `-var(--space-page-active-x)` to cancel the page
    gutter and reach the page edges, but `.ui-page-container--flush .ui-page-body` zeroes that
    gutter — so the bleed escaped the page with nothing to clip it. Reset for a table sitting
    directly on a flush page, exactly as it already was inside a flush `CardContent`. A table
    inside a `Card` keeps its bleed: the card supplies the padding it compensates.
  - `Tabs`: the strip is a centred flex box that also scrolls, and plain `justify-content: center`
    splits the overflow across BOTH edges while `scrollLeft` only ever covers the trailing one —
    so at 320px the leading tab sat permanently outside the scrollport, reachable by no gesture.
    Now `safe center`, which falls back to start alignment exactly when it overflows and still
    centres whenever the tabs fit.

- **A compound `Select` under `FormField` had NO accessible name (WCAG 2.2 SC 4.1.2, critical).**
  `FormField` hands its label/helper/error wiring to a single child with `cloneElement`. In the
  compound API that child is `SelectPrimitive.Root` — a context-only component that renders no DOM
  — so `id` and every `aria-*` were silently dropped and never reached the trigger button. The
  visible value was not a fallback: the trigger is `role="combobox"`, which takes no accessible
  name from its content, so `<FormField label="担当拠点"><Select><SelectTrigger>…` shipped an
  anonymous combobox to assistive tech. axe reported `button-name` (critical) on every such
  trigger; the data-driven `<Select options>` API was unaffected because it forwards `aria-*` to
  the trigger explicitly. `Select` now routes the field-a11y contract — plus `id`, so
  label-click-to-focus resolves — through context to `SelectTrigger`, which also fixes a bare
  `<Select aria-label="…">` in compound form. Props set directly on `SelectTrigger` still win, and
  a trigger that states its own name (`aria-label`/`aria-labelledby`) keeps it whole rather than
  inheriting a competing `aria-labelledby`.

- **A `ResizablePanel` or fully disabled `Pagination` could scroll but not be reached by keyboard
  (WCAG 2.2 SC 2.1.1).** `react-resizable-panels` hardcodes `overflow: auto` on the nested div it
  applies our class to, and the pagination strip scrolls horizontally instead of wrapping. Tabbing
  to a focusable child normally scrolls such a region — but a panel holding only text, or a
  pagination bar whose every button is disabled, offers no focusable child, so the clipped content
  was unreachable without a pointer. Both now measure at runtime (size and content, kept in sync as
  either changes) and take `tabindex="0"` only in that case, so no redundant tab stop appears where
  the content is already reachable.

- **`--table-action-collection-font-size-compact` was dead at every width (gh#412).** Reported
  independently by two consumers. `Table` emits its type as a Tailwind utility
  (`<table class="… text-sm">`), and `utilities` outranks `@layer components` by LAYER ORDER — so
  the compact tier's `font-size:` re-point could never apply, however specific it was written. The
  documented token had no effect, and the measured consequence only ever showed up in Japanese: in
  the 390px frame the `action-collection` table is 356px, `primary` takes 24% ≈ 69px of content,
  and `タイムゾーン` at the effective 14px needs 84px — so the compact tier could not hold a 5–6
  character Japanese label and broke it toward one character per line (WCAG 2.2 SC 1.4.10). The
  whole compact tier — type AND the four column measures — now lives in `@layer
godxjp-ui-responsive`, declared after Tailwind in `styles/base.css` and therefore the LAST layer,
  so it outranks `utilities` and cannot be half-collapsed by a consumer utility on the table
  either. At `--font-size-xs` the same label needs ~62px and fits. No markup changed and no default
  moved; the token simply does what it always said it did.
- **`DataTable`'s default cell renderer no longer emits a bare text node into the `<td>`
  (gh#412).** Scalar values (and the `—` placeholder) render inside
  `<span data-slot="table-cell-text">`. A bare text node leaves the padded cell BOX as the only
  geometry anything can measure, and the cell's block padding inflates it — so a single unwrapped
  line reads as wrapped, which is exactly how a CJK one-character-per-line reflow check
  false-positives on a healthy cell (a consumer hit this and correctly fixed their side rather than
  weaken their detector). A column with a custom `render` is untouched.

### Changed

- **New cascade layer `godxjp-ui-responsive`, and the layer contract is now written down
  (cardinal rule #47, `docs/TOKENS.md`).** Declared immediately after `@import "tailwindcss"` in
  `styles/base.css`, so it is the last layer and outranks `utilities`. It is reserved for
  responsive re-points — `@container`/`@media` blocks that must beat a component's own static
  utility — and holds nothing else. The consumer half of the contract matters just as much and had
  never been stated: UNLAYERED app CSS outranks every layer, including this one, so an app must
  theme this package through TOKENS on a wrapper and must not write its own selectors against
  `[data-slot]` / `[data-priority]` internals. One that did killed the package's `@container`
  re-point at every width and rendered a column at 0px, wrapping one character per line. If an app
  genuinely must write such a rule, it belongs in `@layer components { … }`.

- **`Card accentPlacement="perimeter"` — a full attention border in a SEMANTIC tone (gh#12).**
  `accent` was documented and implemented as a leading-edge stripe (`border-inline-start` only), and
  the system's one perimeter — `variant="featured"` — hard-coded `--primary`. So a card that had to
  read as "action required" or "this failed" around its whole edge had exactly one route left: page
  CSS. The tone and its PLACEMENT are now two orthogonal props, and `perimeter` carries the same
  optical weight `featured` has (`--card-accent-perimeter-width` + `--card-accent-perimeter-ring-width`,
  1px + 1px) in the card's own accent colour. It also undoes the rail's slot-padding compensation,
  so switching placement never shifts the body text off the shell column — the failure mode of every
  hand-rolled `border-2` workaround. `edge` is the default and emits no attribute, so every existing
  accented Card keeps byte-identical DOM. `StatCard` forwards the prop for a KPI that needs the same
  treatment.
- **`Avatar appearance="tinted"` — the capability medallion (gh#12).** Canonical capability icons sit
  in a tinted rounded-square medallion. `EmptyState`'s icon plate is centred, `StatCard`'s is
  KPI-semantic, and `Avatar shape="square"` is a SOLID entity mark — so a left-aligned capability
  card had no equivalent and consumers rendered bare glyphs. The medallion is a _composition_
  (`Avatar` + a Lucide glyph, exactly as `docs/COMPOSITION-VS-COMPONENT.md` prescribes) and stays
  one: what the library owed it was the TINT, which had no token, forcing `hsl(var(--primary) / 0.1)`
  to be re-derived in page CSS. `appearance` is orthogonal to `shape`, so
  `shape="square" appearance="tinted"` is the canonical rounded square and a tinted circle costs the
  same one word. Retune with `--avatar-tinted-{background,foreground,glyph-size}`; the glyph rule is
  scoped to this appearance on purpose, since a global `.ui-avatar svg` would outrank the per-call-site
  icon classes existing avatars already carry.
- **`InputOTP align` + `--otp-container-align` (gh#12).** `.ui-otp-container` had no alignment of its
  own, and the container element belongs to `input-otp` — so the only thing a consumer could reach
  was a wrapping flex div, and every one of them wrote it. `align="center"` (the canonical auth
  challenge) is now a prop; the attribute lands on the hidden input and the container reads it back
  through `:has()`, the same mechanism this stylesheet already uses for the invalid and disabled
  states. `start` is the default and emits nothing.
- **`--otp-slot-inline-size` / `--otp-slot-block-size` — a per-AXIS code-field measure (gh#12).**
  `--otp-slot-size` stayed the square shorthand; the two new knobs win over it and fall back to it,
  so the chain (axis → square → `--control-height`) still resolves at the call site. A code field
  that is taller than it is wide was previously inexpressible from a token.
- **`AuthShell preset="device-authorization"` now owns its CODE FIELD (gh#12).** The preset owned the
  page measure but not its own subject: left on the generic square knob, two 4-slot
  `appearance="grouped"` boxes rendered **146×38** against a **112×54** artboard (4 × the canonical
  36px control tier + the 1px group border). The preset now hands the per-axis knobs
  `--auth-shell-device-otp-slot-{inline,block}-size` (27.5×52 per slot ⇒ 112×54 per group), as literal
  artboard lengths like every other measure in that file. Nothing else moves, and the generic
  `--otp-slot-size` default is untouched everywhere else.
- **`Steps separator="arrow"` + inline-emphasis tokens (gh#12).** The inline step row separated steps
  with a chevron (`›`) and marked the number with bold, where the canonical hosted-identity row uses
  an arrow (`→`) and an accent tint. A chevron reads "drill into"; an arrow reads "then", which is
  what a step row means — so the glyph is a prop, and the emphasis is two knobs
  (`--steps-inline-index-font-weight`, `--steps-inline-index-color`, plus
  `--steps-inline-separator-color`). Both glyphs flip under `dir="rtl"`. Defaults reproduce the
  existing row byte for byte.

- **`PageHeader` is now a real export (gh#255).** The page title band — breadcrumbs, `<h1>`,
  subtitle, a new `meta` status slot, `extra` actions, the `layout` arrangement and a `loading`
  pending state — was only reachable through `PageContainer`, so a surface that is NOT a whole page
  (a Sheet detail, a `MasterDetail` pane, a tab body) had to re-author `.ui-page-header` locally.
  Following the gh#251 post-mortem, the deciding question was not the Gate 0 verdict alone but
  whether the consumer can reach the geometry through PUBLIC routes: they could hand-build a header
  from `Breadcrumb` + `Heading` + `Flex`, but they could NOT get the token-owned row gaps, `extra`
  alignment, responsive arrangement or the `--page-header-divider` opt-in without copying package
  CSS — so it is exported. There is exactly ONE implementation: `PageContainer` now renders this
  component, and `page-header.test.tsx` pins the pre-gh#255 header DOM byte-for-byte so the
  extraction cannot have moved an existing page. `denied`/`error` are deliberately NOT states of the
  band — a title band for a resource the user may not see leaks its name, which is `ErrorSurface`'s
  whole-surface contract. `loading` keeps the `<h1>` in the heading outline wearing the library's own
  `ui-skeleton-block` skin (nesting Skeleton's `<div>` inside an `<h1>` is invalid HTML) with an
  sr-only accessible name, because a heading rendered as a bare decorative box is an EMPTY heading
  (axe `empty-heading`, WCAG 1.3.1); breadcrumbs and `extra` are not skeletonised, since they come
  from the route rather than the record.
- **`Banner` — the canonical page-level status strip (gh#255).** `Alert` locked to the new
  `variant="banner"`: square, edge-to-edge, ruled on the block-end edge only, measured by the new
  `--banner-*` tokens. Deliberately an ALIAS, not a second implementation — a banner and an inline
  alert are one object at two measures, so re-deriving the tone→role mapping, icon defaults, actions
  grid and dismiss control would be exactly the duplication this system forbids (the same reasoning
  that makes `FilterBar` an alias of `Toolbar`). `Banner.Title` IS `AlertTitle`, asserted by
  identity in `banner.test.tsx`, so a consumer can never mix two families in one strip.
- **`AuthShell preset="registration"` (gh#256)** — the 360px sign-up measure with a 15px inline
  gutter at 390px, matching `preset="login"` exactly so sign-in → sign-up never jumps on a phone.
  Two things make it structurally distinct rather than a re-skin of `login`, and both are pinned by
  tests: it is the ONLY start-aligned preset, because a sign-up card is the tallest surface in the
  hosted-identity set and a vertically CENTRED tall card overflows ABOVE the scroll origin on a
  short viewport, putting its first field permanently out of reach; and it is the only preset with
  its own footer-clearance knob, so the legal/consent footer never sits flush against the submit
  button at the end of a long scroll. Carries the full password form AND the pending-email state
  with no consumer geometry CSS.
- **A typed search/filter/chip/action/reset/result-count model on `FilterBar` (gh#258).** New
  `search`, `chips`, `onChipRemove`, `resultCount` and `actions` props, plus the `FilterBarChipProp`
  type. ORDER IS THE CONTRACT: DOM order is tab order, and the bar now decides it —
  search → filter groups → applied chips → result count → reset → actions, with reset before
  `actions` so "clear filters" never lands beside an unrelated primary action. `search` is a SLOT,
  so the control finally gets one token-owned measure (`--filter-bar-search-width`) across every
  list page instead of whatever width each page gave it. `chips` owns the chip lifecycle: a labelled
  group, a remove control named after THAT specific filter (a row of buttons all called "Remove" is
  unusable from a screen-reader's control list), no row at all when the array is empty, and NO
  remove control — rather than a disabled one, which is a dead tab stop — for a chip the user may
  not lift. `resultCount` renders in a polite live region formatted via `Intl.NumberFormat` + CLDR
  plurals, which is the accessibility point of the whole prop: a sighted user SEES the table change,
  and this is what tells everyone else. The bar still owns no filter state. Every region is opt-in
  and emits nothing when its prop is absent, so a bar built the old way is geometrically unchanged
  (pinned by a backwards-compatibility test).
- **Packed-consumer coverage for the new surface.** `check:packed-public-contract` now extracts
  `PageHeader`/`PageHeaderProp(s)` and `Banner`/`BannerProp(s)` from the real tarball, and gains a
  `./navigation` contract (`FilterBar`, `FilterBarGroup`, `Toolbar`, `ToolbarGroup`,
  `FilterBarChipProp`) that did not exist before — the navigation subpath had nothing pinning the
  names a list page imports. This is the gh#251 lesson applied preventively: the guard immediately
  caught that `FilterBarChipProp` was exported from `filter-bar.tsx` but never re-exported from the
  navigation barrel, so it would have been invisible to a consumer despite passing every
  source-level check.
- **`docs/CANONICAL-CONTRACTS.md`** — the formal per-name record of what the package ships for
  `PageHeader`, `Banner`, `SocialLinks`, `OrganizationChoiceList`, `ServiceRolePanel`,
  `BranchScopePicker`, `PermissionMatrix` and `FilterBar`, with the Gate 0 verdict, the
  "can the consumer reach it publicly?" follow-up that gh#251 taught us to ask, and — for a
  composition — the exact primitives, token knobs and state table.
- **New tokens.** `--page-header-meta-gap`, `--page-title-placeholder-{measure,block-size}`,
  `--page-subtitle-placeholder-{measure,block-size}` (gh#255 header band);
  `--banner-{radius,border-width,border-block-end-width,space-block,space-inline,space-inline-compact,dismiss-space-offset}`
  (gh#255 banner); `--auth-shell-registration-*` (gh#256);
  `--filter-bar-search-width`, `--filter-bar-chip-*`, `--filter-bar-count-*` (gh#258). The chip and
  count colour knobs are role-mirror knobs, declared `initial` at `:root` with the role default at
  the CALL SITE, so a scoped `[data-tenant]`/`.dark` override of `--muted`/`--muted-foreground`
  actually reaches them.

### Changed

- **⚠ VISIBLE IN EVERY TRANSACTIONAL EMAIL: the primary CTA grows 36px → 44px
  (`--email-cta-height`, dxs-platform/platform#559).** The email CTA mirrored `--control-height-lg`,
  and 36px clears WCAG 2.2 **SC 2.5.8** Target Size (Minimum, AA, 24×24) — which is why nothing
  downstream could see the problem. It does NOT clear **SC 2.5.5** Target Size (Enhanced, AAA,
  44×44), Apple HIG 44pt or Material 48dp. Email is a mobile-first, **touch-only** medium: no hover
  state, no precise pointer, and mail clients do not reliably offer zoom or a focus affordance, so
  the web's AA floor is the wrong bar. `--email-cta-height` and `--email-cta-line-height` (which
  must stay equal — an Outlook-safe button centres by line-height, not flexbox) are now **44px**,
  and the mirror to `--control-height-lg` is **deliberately broken**; the token comment says so, so
  the next reader does not "restore" it. The 44px floor is now asserted as a CONTRACT
  (`expect(EMAIL_CTA.heightPx).toBeGreaterThanOrEqual(44)`), not as a restatement of the current
  value — the previous test only checked `heightPx === EMAIL_CSS["--email-cta-height"]`, which is
  green for any number and is exactly how a consumer spec asserting the 44px floor got pinned to
  `EMAIL_CTA.heightPx` and silently lost it. The artboard test that pinned 36 was updated
  deliberately. **Kept in a MINOR** on purpose: no public name, prop or export changes, nothing is
  removed, the change only enlarges a touch target toward an accessibility floor, and the escape
  hatch is one public line — a service that must keep the old box sets `--email-cta-height` and
  `--email-cta-line-height` to `36px` in its own theme. Templates with a tightly measured CTA row
  will reflow by 8px.
- **⚠ 18.6.0 silently removed the Topbar CENTRE SLOT at 1100px and below — including on every phone.**
  The gh#244 collision fix introduced `@media (width <= 68.75rem) { .ui-topbar-center { display:
var(--topbar-center-compact-display) } }` with a default of `none`. Consumers whose global search
  trigger lives in `Topbar center` lost it at 901–1100px and downward **without changing a line of
  their own code** — a lockfile bump deleted a slot they depended on. **The default stays `none`**:
  the overlap it prevents (a full search trigger covering the start breadcrumb/title or the end
  utilities with a 16rem sidebar docked) is a real defect, and flipping a shipped default a second
  time would be worse than documenting it once. It is now stated as a decision instead of a
  side effect — the token comment, the MCP catalog's `center` prop description and a new Topbar usage
  rule all carry the warning and the opt-in:

  ```css
  :root {
    --topbar-center-compact-display: flex;
  } /* restore the slot at every width */
  ```

  Opt back in only once the centre content has a compact presentation of its own (an icon-only search
  trigger); otherwise move the trigger into `end` for compact widths. A page-local media query is the
  anti-pattern the knob replaces.

- **`variant="featured"` no longer hard-codes `--primary`.** Its edge and ring are now
  `--card-featured-border-color` (role-mirror `initial`, so the `--primary` default resolves at the
  call site and a scoped `[data-tenant]`/`.dark` override reaches it) and `--card-featured-ring-width`.
  Rendered output is unchanged. `featured` is now simply the brand-toned member of the same family as
  `accentPlacement="perimeter"`.
- **The Card accent colour is resolved once per tone into `--card-accent-color`**, consumed by both
  placements, so a rail and a perimeter can never drift apart. It is set on the element and is
  therefore NOT a service knob — retint the role (`--attention`, `--success`, …).
- **The `registration` preset's vertical geometry was invented, and is now derived and measured.**
  The first pass shipped `3rem` / `1.5rem` block-start offsets that were chosen rather than taken
  from the canonical artboard — the one thing every other preset in that file does carefully, citing
  exact artboard pixels. Measured in headless Chromium, the card landed **133px / 147px above** the
  canonical SCR-002 anchor. The offsets are now derived from the artboard quoted in the SCR-002
  acceptance review (card `y=284` at 1440x900, `y=274` at 390x844) through the column's own
  arithmetic — `card y = padding-block-start + identity slot + stack gap` — giving `9.5rem` /
  `8.875rem`; re-measured delta is **0.00px at both viewports**. The horizontal measure chosen in
  the first pass was already correct and is unchanged (360px card, 15px mobile gutter, centred at
  1440 — measured delta 0.00px).
- **`registration` gains the fixed identity track `login` already proved (`--auth-shell-registration-identity-slot-block-size`, 112px).**
  Without it the card rides on the identity block's own height — measured at 82.69px for one wrapped
  requester — so the canonical anchor above would have held for exactly one copy length and drifted
  for every other. With it, headless Chromium measures card `y=274` identically for absent, short
  and wrapped two-line requester copy. Applied to the identity element rather than through a grid
  row, so the preset does not constrain how many sections a page stacks.
- **The registration docs frame no longer passes a `brand` bar.** The canonical hosted-identity
  screens put the mark INSIDE the column as `AuthIdentity` and pass no top bar — the real DXS
  `Login.tsx` and `Register.tsx` both do exactly this. The frame passed one, which pushed the whole
  column down by the bar's measured 72px and made every offset read off that page wrong. This was
  what first looked like a 72px defect in the shipped `login` preset; `login` is correct, and the
  frame was lying. NOTE: `docs/layout/auth-shell.tsx` still demonstrates `preset="login"` WITH a
  brand bar and so mis-states that preset's anchor by the same 72px — left unchanged here because it
  is pre-existing and touching it would move visual baselines outside this issue's scope.

- **The banner's inline inset now steps down with the page gutter at 720px.** `--banner-space-inline`
  reads `--space-page-active-x` so a strip's text lines up with the page title, but that token steps
  down to the compact gutter on `.ui-page-container` ONLY. Custom properties inherit, so a banner
  rendered inside the container picked the compact value up for free — while the normal case, a
  banner mounted ABOVE the container or in `AppShell`, kept the 24px desktop gutter and sat 8px
  outside the page title at 390px. The new `--banner-space-inline-compact` knob applies the same
  step to the banner itself, so the alignment the token was introduced for actually holds on mobile.

- **`ServiceRolePanel`, `BranchScopePicker` and `PermissionMatrix` are formally documented as
  COMPOSITIONS, not components (gh#257).** All three fail the Framework-Component Test, and
  `BranchScopePicker` fails it twice over: a hierarchical multi-select with parent/child aggregation
  IS `TreeSelect`, so adding it would duplicate a primitive. The follow-up question is a clean
  "yes" — each is reachable from public primitives + tokens with no package CSS — and the one
  genuinely reusable part, the grant/diff data logic, already ships as the pure
  `@godxjp/ui/lib/permission-grid` util. Documented with every state gh#257 listed
  (read-only/locked, loading, empty, validation, error, permission-denied, destructive-confirmation)
  in the new `docs/showcase/service-role-scope.tsx`, plus a new MCP `rbac-service-roles` pattern so
  an agent asking for these names is taught the composition instead of inventing an API. Read-only
  is a `Badge` STATING the fact, never a disabled `Select` — a disabled control is a dead tab stop
  that implies "editable later".
- **`SocialLinks` and `OrganizationChoiceList` formally documented as compositions (gh#256)**, with
  their loading/empty/error/denied/disabled states, in `docs/layout/auth-shell-registration.tsx` and
  two new `AuthShell` MCP usage rules. The package deliberately does not own the provider row:
  which providers a product offers, in what order, and what consent they imply are product
  decisions.
- **MCP catalog corrections.** `Alert`'s `variant` was catalogued as
  `"default" | "destructive" | "warning" | "success"` — it has never been the colour axis (that is
  `tone`), and two `useCases` repeated the error. Both are fixed, and `variant` now documents the
  MEASURE axis it really is. The `PageContainer` usage rule that told agents about "the old
  PageHeader's prop names" was rewritten: there is now a real `PageHeader`, and leaving that string
  in place would have taught agents the exact kind of wrong thing gh#251 was filed about.

### Fixed

- **The AppShell drawer breakpoint was documented as `lg` (1024px) but has always fired at 900px
  (gh#259).** `shell-layout.css` said the docked sidebar "collapses out below `lg`", and the MCP
  catalog's `mobileNav` description and its AppShell usage rule said the same — while the shipped
  rule is `@media (width <= 56.25rem)` and the hamburger is `max-[900px]:inline-flex`. Between 900
  and 1024 an agent reading the catalog therefore built against a breakpoint that does not exist.
  `layout.prop.ts` was already correct. All three now name 900px / 56.25rem and point at the block
  comment that explains why it is the one canonical value. No behaviour change — this was always a
  documentation defect, but agents read the catalog, so it shipped wrong numbers into consumers.
- **The boxed `<Logo tone="success">` glyph inked its TEXT with the identity KNOCKOUT colour, failing
  WCAG 2.2 AA at 3.67:1.** `.ui-logo[data-tone="success"]` fell back to `--brand-foreground` for
  `color`, but `--brand-foreground` is not an ink — it tracks `--background` in both themes
  (light `60 33% 99%`, dark `48 9% 9%`) because `mark="godx"` punches its inner bar as an evenodd
  **hole** and the email mark has to paint that hole solid to match. As negative space it only owes
  SC 1.4.11's 3:1 (non-text) and clears it; as the ink under caller-supplied TEXT it owes SC 1.4.3's
  **4.5:1** — 14px bold is not "large text" (that needs 18.66px bold / 24px). Measured in headless
  Chromium across every branch of `docs/general/logo.tsx`: light `tone="success"` glyph
  `#fdfdfc` on `#009766` = **3.67:1 FAIL** (both the `md` and `lg` nodes), while light
  `tone="primary"` was 4.62:1, dark `tone="success"` 6.89:1 and dark `tone="primary"` 7.05:1 — all
  passing. The `tone="success"` boxed glyph now inks from the new
  **`--logo-identity-foreground`** (`48 9% 9%`, `#191815`), so light rises **3.67 → 4.74:1**. The ink
  is theme-INVARIANT — it is the same near-black spine the dark theme already resolved to — so
  **dark renders byte-identically at 6.89:1**, and the default untoned `tone="primary"` rendering is
  untouched. `--brand` / `--brand-foreground` are unchanged, so the canonical emerald, the `godx`
  vector mark and the email brand capsule (whose light inner bar must stay light to match the web
  mark's knockout hole) all keep their exact colours. This was NOT treated as a logotype exemption:
  `mark="glyph"` renders CALLER-supplied text in a tinted box — a generic boxed badge, not the GoDX
  identity artwork — so the `data-logotype` route the wordmark uses does not apply. Guarded by
  `src/tokens/__tests__/logo-identity-contrast.test.ts`, which resolves the real `var()` fallback
  chains out of the shipped CSS and asserts the measured ratio per tone per theme.

### Added

- **`Text` gains a public multi-line clamp: `clamp?: number`** (gh#261). `<Text as="p" size="sm"
tone="muted" clamp={2}>` limits a description to N lines with a trailing ellipsis — the
  token-owned form of the banned page-local `line-clamp-N` utility (rule #2), needed verbatim by
  the DXS service-catalog card ruling (dxs-platform/platform#427: description "clamped to 2
  lines" at 390px). The component emits `data-clamp` + an inline `--text-clamp` var; all styling
  lives in `text-layout.css` (`display: -webkit-box` + `-webkit-line-clamp`/`line-clamp:
var(--text-clamp)`), with the same `min-width: 0` flex-shrink contract as `truncate` (issue
  #114). Clamping is visual-only — the full text stays in the DOM and the accessible name.
  `clamp` and `truncate` are mutually exclusive: when both are set `clamp` wins and dev builds
  warn; an invalid `clamp` (< 1 / non-finite) is ignored with a dev warning and a fractional
  value is floored. Docs: `docs/general/typography.tsx` now renders a long Japanese description
  at `clamp={2}`.
- **FilterBar typed model (gh#258)** — `FilterBarProps` gains an optional, domain-neutral,
  consumer-controlled model: `search` (canonical SearchInput slot with the token-owned
  `--filter-bar-search-width`), `filters` (labelled Select filters whose visible caption is the
  control's REAL `<label htmlFor>` — `FilterBarFilterProp`), `chips` + `onChipRemove`
  (applied-filter chips as pure data: add = include, remove = `onChipRemove(value)`, clear-all =
  `onClear` — `FilterBarChipProp`), `actions` (trailing slot at the inline end), `resultCount`
  (localized CLDR-pluralized `role="status"` line; `0` is the visible empty state), `loading`
  (`aria-busy` strip), `disabled` (reaches every model-rendered control) and `error`
  (`role="alert"` line replacing the count). Canonical DOM = keyboard order:
  search → filters → children → reset → actions → chip removes. Presence of ANY model prop
  activates the model layout; **without one the legacy children-composition markup renders
  byte-identically** (children is now optional — a pure model usage needs none). New geometry
  knobs (rule #45): `--filter-bar-{search-width,filter-width,chip-gap,section-gap}`; under
  `overflow="scroll"` the reset+actions cluster stays pinned at the inline end exactly like the
  legacy clear button. i18n: `navigation.filterBar.{appliedFilters,removeFilter,resultCount}`
  in vi/en/ja. Guarded by
  `src/components/navigation/__tests__/filter-bar-typed-model.test.tsx` (slots + order, chip
  lifecycle, reset, localized plural count, keyboard order, loading/disabled/error, legacy
  path unchanged, vitest-axe 0 violations, compile-time `@ts-expect-error` contract).
- **`Banner` / `BannerProps` — the canonical DXS full-bleed attention strip** (gh#255,
  dxs-platform#311): exported from `@godxjp/ui/feedback` and pinned in the packed-artifact
  contract. It IS the Alert primitive with the structural axis fixed to the new
  `variant="banner"` (`AlertVariantProp` widened `"default" | "banner"`), so ONE implementation
  owns tone semantics + live-region politeness, the default per-tone icon (`icon`/`icon={false}`),
  `Banner.Title/Description/Content/Actions` slots, the built-in localized dismiss
  (`onDismiss`, last in DOM/focus order) and the ≥640px trailing-actions / <640px full-width
  wrapping behaviour. Strip geometry is token-owned via the new
  **`--banner-{radius,border-width,space-inset-block,space-inset-inline}`** component tokens
  (`src/tokens/components/banner.css`): square corners, a single tone-coloured hairline on the
  block-end edge, and an inline inset defaulting to the page gutter (`--space-page-active-x`).
  No DXS business behaviour — the app decides WHEN a banner shows; the package owns only
  presentation.
- **`PageContainer status` — the status/meta band of the canonical page-header contract**
  (gh#255): PageContainer's embedded header is formally the DXS `PageHeader` (deliberately NO
  separate export — a standalone header renderer is what produced the nested-header defect the
  platform audit flagged). `status` renders StatusBadge/meta content beside the `<h1>` on one
  wrapping row at the new semantic token **`--page-header-status-gap`** (default
  `--space-inline-sm`); on compact viewports or under a long JA/VI title the band wraps UNDER
  the title instead of clipping. A page that omits `status` keeps the exact historical DOM and
  geometry. Loading/error/denied stay compositions of existing exports (Skeleton in the slots;
  `ErrorSurface` replacing the page for 403/404/5xx; `Alert.QueryError`/`DataState` in-body) —
  documented on the MCP `PageContainer` entry.

- **`--logo-identity-foreground`** (`48 9% 9%`) — the ink the boxed `mark="glyph"` sets its TEXT in
  when it sits on the `--brand` identity fill. Deliberately NOT a role-mirror knob: its default is a
  real value rather than a role token, so there is no role to freeze and it is declared at `:root`
  instead of `initial` (the four existing role-mirror knobs — `--logo-success-background`,
  `--logo-success-foreground`, `--logo-godx-color`, `--logo-wordmark-color` — stay `initial` with
  their role defaults at the call site, unchanged). A service re-theming `--brand` to a DARK fill
  re-inverts the ink through the existing public knob `--logo-success-foreground`.

- **`EmptyState` `tone` never coloured the icon GLYPH — only the medallion tint varied.**
  `.ui-empty-state-icon` correctly reads `color: var(--empty-state-icon-foreground, hsl(var(--muted-foreground)))`
  and every `[data-tone]` rule re-points that token, but the component rendered the icon with a
  hard-coded utility `className="text-muted-foreground size-6"`. The utility out-specified the
  inherited colour, so the token was half-dead: measured in headless Chromium, the medallion tracked
  the tone (`success` `rgb(105,191,142)` · `warning` `rgb(250,183,0)` · `destructive` `rgb(184,40,48)`
  · `info` `rgb(77,109,179)`) while the svg stayed `rgb(112,110,102)` for **all five** tones. Dropping
  the colour utility (keeping `size-6`) lets the glyph inherit `currentColor`; after the fix the glyph
  equals the medallion token exactly for every tone, and the default `tone="muted"` still resolves to
  `rgb(112,110,102)` — the untoned rendering is **byte-identical**. No token changed: the knobs were
  already role-mirror `initial` at `:root` with the role default at the call site. The glyph stays
  `aria-hidden` and matches the shipped `Alert` tone-icon convention (raw role for the decorative
  glyph, contrast-tuned `--text-*` reserved for text), so SC 1.4.11 does not apply — measured
  `EmptyState` success 2.00:1 / warning 1.62:1 vs the existing `Alert` icons' 2.11:1 / 1.69:1 on the
  same ~12% tint. Guarded by `src/components/data-display/__tests__/empty-state-tone-glyph.test.tsx`.
- **`<ToggleGroup variant size>` never reached its items, and the default was off-union.**
  The group stamped `data-variant`/`data-size` on the ROOT only; `ToggleGroupItem` read just its own
  props and `.ui-toggle-group` consumed neither attribute, so `<ToggleGroup size="lg">` alone painted
  **nothing** — measured in headless Chromium, a group-only `data-size` of `sm`/`md`/`lg` all rendered
  the same unstyled **25.8px** item against real tiers of **28/32/36px**, forcing consumers to repeat
  the prop on every single item. Worse, the destructuring default was the literal `"default"`, which
  is **not** a member of the declared `sm | md | lg` union, so an unset group emitted
  `data-size="default"` — an invalid value for its own type. Fixed with the upstream shadcn React
  **context** pattern: the group provides `variant`/`size`, each item falls back to the context only
  where its own prop is unset, and the destructuring defaults were removed so an unset group emits no
  `data-size`/`data-variant` at all (the real default still comes from `toggleVariants`, applied per
  item). Measured after the fix, group-only sizing produces the correct real heights on **every**
  item — `sm` 28px · `md` 32px · `lg` 36px — and an explicit item prop still wins (a `size="lg"` item
  inside a `size="sm"` group measures 36px between two 28px siblings). Repeating the prop on every
  item — the only thing that worked before, and what the docs frames did — renders **identically**:
  group-only, item-only, and both-repeated all emit the same class string and the same 36px box.
  Guarded by `src/components/data-entry/__tests__/toggle-group-propagation.test.tsx`.
- **`size` was a silent no-op on `<Logo mark="godx" />` — the identity mark now honours every tier.**
  `.ui-logo[data-mark="godx"]` pinned `width`/`height` to `--logo-godx-size` at the SAME specificity
  as the `.ui-logo[data-size="…"]` rules (both 0,2,0) and sat later in `logo-layout.css`, so source
  order won: measured in headless Chromium, `xs` · `sm` · `md` · `lg` all rendered **32×32px**. The
  prop is public and did nothing — and the godx LOCKUP already scaled its wordmark per tier
  (12.47px → 17.65px from `xs` to `lg`), so a frozen mark visibly broke the mark↔wordmark proportion
  at `size="lg"`. A half-applied prop cannot honestly be documented as "inapplicable", so `size` was
  made real rather than typed away. The identity mark gets its own ramp,
  **`--logo-godx-size-{xs,sm,md,lg}` = 1.5 / 1.75 / 2 / 2.5rem** — one step above the `--logo-size-*`
  glyph box, because the artwork is a horizontal capsule inside a square viewBox and needs the extra
  box to read at the same optical weight. The per-tier rules are `[data-mark][data-size]` (0,3,0), so
  they out-rank both neighbours regardless of source order and the ordering bug cannot recur.
  Measured after the fix: **24 / 28 / 32 / 40px**, with `md` byte-identical to the old fixed 32px, so
  every existing default-size identity surface (`AuthIdentity`, the AuthShell brand bars,
  `CenteredShell` topbars) is unchanged. The **`--brand` colour contract is untouched**: the mark
  still resolves `hsl(var(--logo-godx-color, var(--brand)))` at the call site — `rgb(0,151,102)`
  `#009766` light, `rgb(0,184,124)` `#00b87c` dark, verified at every tier and in both themes.
  `src/components/general/__tests__/logo-size-cascade.test.ts` resolves the real cascade
  (specificity, then source order) over the shipped stylesheet and asserts a distinct winning box per
  tier — it reproduces the old one-value-for-all-tiers result on the pre-fix CSS, so a `toContain`-style
  guard could not have caught this.

- **The `/isolate/**` preview harness stopped wrapping shell stories in a SECOND `<main>`.**
  `preview/src/isolate-main.tsx` decided whether a story already owned the document landmarks from a
  HARDCODED story-id list (`ownsDocumentLandmarks`), while `preview/src/frame-main.tsx` had long since
  DETECTED an own `<main>` at runtime. The list drifted behind the catalog, so every shell story
  authored after it was written (the `AuthShell` presets, `CenteredShell`, `LegalDocumentShell`,
  `ErrorSurface` and the `AppShell` recipes under `docs/**/examples/`) rendered its own `<main>`
  INSIDE the harness's `<main>`. Measured in headless Chromium across all **152** isolate routes:
  **26 routes had two `<main>` landmarks and 25 of them carried real axe violations — 50
  `landmark-main-is-top-level` / `landmark-no-duplicate-main` nodes**, including
  `/isolate/layout-auth-shell-context`, `/isolate/layout-auth-shell-device`,
  `/isolate/layout-auth-recovery-index`, all four `layout-error-surface` routes and all five
  `layout-legal-document-shell` routes. A duplicated heuristic is how it drifted, so the duplicate is
  gone: both entry points now import ONE detector, **`preview/src/landmark-root.tsx`
  (`<LandmarkRoot>`)**, which probes its own subtree for a `main` / `role="main"` in a
  `useLayoutEffect` — synchronous after commit and BEFORE the browser paints, so the landmark is
  already correct on the first paint (no flash, no window for axe or a screenshot to observe the wrong
  tree) — and renders the real `<main>` TAG, never a `role="main"` div, only when the story does not
  own one. Re-measured after the fix: **152/152 isolate routes have exactly one `<main>`, 0 landmark
  violation nodes, 0 regressions** — the bare component showcases that legitimately rely on the
  harness supplying `<main>` are untouched. `/frame/**` is unaffected by construction and verified
  identical (`check:frame-axe` before and after: 0 preview-chrome violations, the same 19 component
  nodes across the same 6 frames), so `scripts/frame-axe.baseline.json` is deliberately left
  unchanged — this clears `/isolate` debt, not `/frame` debt.

### Changed

- **`--logo-godx-size` is now the identity mark's PIN, not its base.** It is declared `initial`
  (guaranteed-invalid) at `:root` with the per-tier default at the CALL SITE
  (`var(--logo-godx-size, var(--logo-godx-size-md))`), so it is inert by default and the `size` tiers
  apply. A service theme that sets it once still freezes the mark at that box on **every** tier —
  verified in-browser (`--logo-godx-size: 3rem` → 48px at `xs`/`sm`/`md`/`lg`) — while a single step
  is retuned through `--logo-godx-size-lg` and friends (`4rem` → 64px). Consumers that only _set_ the
  token are unaffected; a theme that _read_ `var(--logo-godx-size)` expecting `2rem` must read
  `--logo-godx-size-md` instead.

### Added

- **`AlertDialogRoot` — the compound alert-dialog was unassemblable from the public API; now it
  isn't.** `@godxjp/ui/feedback` shipped every compound PART (`AlertDialogTrigger`, `Portal`,
  `Overlay`, `Content`, `Header`, `Footer`, `Title`, `Description`, `Action`, `Cancel`) but no Root:
  the name `AlertDialog` is taken by the flat destructive-confirm preset, which internally composes
  `DialogHeader`, not `AlertDialogHeader`. Every one of those parts needs a Radix AlertDialog Root
  ancestor for context, so `AlertDialogHeader` could not be rendered anywhere by a consumer — the
  only working composition in the repo imported `@radix-ui/react-alert-dialog` directly, which a
  consumer must not do and a docs frame cannot do (`check:example-imports` allows only react /
  lucide-react / `@godxjp/ui`). `AlertDialogRoot` is the exact mirror of `DialogRoot`: a
  pass-through over `AlertDialogPrimitive.Root` stamped `data-slot="dialog"`, so focus trap, focus
  restoration and `role="alertdialog"` stay Radix-owned. Purely additive — the flat `AlertDialog`
  preset is untouched. `AlertDialogRoot > AlertDialogTrigger + AlertDialogPortal > AlertDialogOverlay
  - AlertDialogContent > AlertDialogHeader > AlertDialogTitle`now composes from the public API
alone, which also makes`AlertDialogHeader`'s seven-branch `tone`band reachable for the first
time; both are demonstrated in`docs/feedback/alert-dialog.tsx`and recorded in`component-case-evidence.json`. Catalogued in the MCP as its own entry (with the "prefer the flat
    preset" steer), and covered by trigger-open / cancel-and-Escape focus-restoration tests plus a
    vitest-axe sweep of both header forms.
- **Frame coverage (#163) — the `tone` and `size` contracts of the general + charts exports are now
  demonstrated, not assumed.** `docs/general/typography.tsx` gains a `Heading tone` card that
  renders all seven semantic tones on a real section heading; `docs/general/logo.tsx` gains a
  `tone` card that separates the two branches against the new `--brand` identity role
  (`tone="primary"` fills the boxed glyph from the action colour `--primary`, `tone="success"` from
  `--brand`) and records that `mark="godx"` is always drawn in `--brand` and always at
  `--logo-godx-size`, regardless of `tone`/`size`; a new `docs/charts/size-tiers.tsx` frame renders
  `LineChart` / `BarChart` / `AreaChart` / `PieChart` at every `size` tier (xs · sm · md · lg).
  `component-case-evidence.json` records the branches, so `Heading.tone`, `Text.tone`, `Text.size`,
  `Logo.tone`, `Logo.size`, `AreaChart.size`, `BarChart.size`, `LineChart.size`, `PieChart.size` and
  `CompactBarTrend.size` promote to `covered:prop-evidence` in the frame-coverage ledger.

- **Frame coverage (#163) — the data-display `variant` / `tone` / `size` / `density` / `shape`
  contracts are demonstrated at rest, not behind a toggle.** `docs/data-display/badge.tsx` gains a
  `StatusBadge` card that renders its four structural variants (on the tone-neutral `incomplete`
  key, so the variant is what changes), its three shapes and all eight tones; `empty-state.tsx`
  gains the remaining `tone` steps (warning · destructive · info · muted) and states `variant="page"`
  explicitly; `credential-reveal.tsx` splits Tone and Size into two cards and now renders
  `tone="warning"` plus every `size` tier (xs · sm · md · lg); `data-table/index.tsx` renders
  `density` compact / default / comfortable as three STATIC tables (the DensityToggle only proved
  them after a click); `list-row.tsx` gains a default-vs-compact contrast row; `stat-card.tsx`
  states `size="compact"` explicitly next to `size="md"`; `timeline.tsx` states `variant="icon"`
  explicitly. `component-case-evidence.json` records the branches, so `Badge`, `StatusBadge`,
  `Card`, `EmptyState`, `Timeline`, `Upload`, `CredentialReveal`, `Progress`, `StatCard`,
  `DataTable`, `ListRow` and `Avatar` promote 20 prop-shaped cells to `covered:prop-evidence`, and
  the `card` / `empty-state` / `progress` / `data-table` known gaps record the resolving evidence.

- **Frame coverage (#163) — the layout `variant` / `tone` / `density` contracts are demonstrated.**
  New `docs/layout/auth-shell-variants.tsx` frame renders `AuthShell` on its two orthogonal axes:
  `variant` (default · canonical) and `density` (comfortable · compact) are switched from one shell,
  because two stacked `AuthShell`s would duplicate the `banner` / `main` / `contentinfo` landmarks
  and fail axe by construction. `docs/layout/page-container.tsx` promotes its density comparison to
  a three-up row so `density="default"` is stated explicitly next to compact and comfortable.
  `docs/layout/error-surface/index.tsx` gains a `tone` card rendering all five semantic steps
  (muted · info · warning · destructive · success) on the statuses each one truthfully belongs to.
  `component-case-evidence.json` records the branches, so `AuthShell.variant`, `AuthShell.density`,
  `PageContainer.variant`, `PageContainer.density` and `ErrorSurface.tone` promote to
  `covered:prop-evidence` in the frame-coverage ledger.

- **`CenteredShell preset="public-landing"` + `Flex hideBelow` / `hideFrom` — the public landing
  page is now buildable from public exports and public tokens alone (#252).** SCR-007 was applying
  consumer CSS for shared shell decisions: a 67.5rem card measure, the shell main alignment, a
  global card-shadow kill inside the landing surface, a chromeless centred hero, a separate
  max-width header/footer wrapper, and media queries that hide public navigation below the tablet
  step and the wordmark + secondary action at mobile. Per `docs/COMPOSITION-VS-COMPONENT.md` a
  landing header / hero / section grid / legal footer FAILS the Framework-Component Test (it owns
  no behaviour and composes from `Card`/`Button`/`Text`/`Heading`/`Flex`/`ResponsiveGrid`), so
  there is deliberately **no `PublicLandingShell`** — instead the package now owns every piece of
  geometry that forced the page-local CSS. `preset="public-landing"` shares ONE measure
  (`--centered-shell-landing-max-width`, 67.5rem) between the header bar, the centred column and
  the footer — the bar/footer inline padding is `max(gutter, (100% - measure) / 2)`, so header
  content starts on exactly the column edge with no consumer wrapper — and owns the section rhythm
  between plain `<section>` elements, the flat public-surface card chrome
  (`--centered-shell-landing-card-shadow: none`, rule #44), the hero `h1` tier (it re-points
  `--heading-h1`, so a hero title stays a real `Heading level={1}`) and the 40rem compact step.
  `Flex hideBelow`/`hideFrom` replace the consumer's own media queries at the package's canonical
  breakpoint scale (sm 40rem · md 48rem · lg 64rem · xl 80rem, the `--master-detail-collapse-below`
  steps). Both defaults are provably inert: `preset="default"` and an unset `hideBelow` emit no
  attribute at all, and the stylesheets contain no `[data-preset="default"]` / bare
  `[data-hide-below]` selector (asserted in tests, the gh#231 contract). Measured in headless
  Chromium on `/showcase/public-landing`, LTR and RTL: **1440×900** column x=180 w=1080, bar 1440×48,
  h1 54px; **1024×900** column x=24 w=976; **390×844** column x=16 w=358, h1 33px, nav
  `display:none`, wordmark `display:none`; `documentElement.scrollWidth === clientWidth` (overflow 0)
  at all three widths in both directions, card `box-shadow: none`, zero console errors.

- **`Table preset="action-collection"` + `TableHead`/`TableCell` `priority` — a canonical
  responsive approval queue that fits 390px (#253).** The public Table kept its desktop intrinsic
  column widths, so a five-column approval queue (申請者 · 対象 · 理由 · 申請日時 · 操作) rendered
  1511px wide inside a 1182px card and scrolled horizontally — at 390 only the first two columns
  were in the initial frame. The preset replaces the SIZING model, not the markup: `table-layout:
fixed` plus token-owned column-PRIORITY measures (`--table-action-collection-*`, percentages so
  the ratio holds at any card width, with an absolute measure reserved for the row-action
  affordance so it can never be squeezed below its touch target), and cells wrap instead of forcing
  a scroll. There is **no display change, no role rewriting and no card transformation**, so
  `<table>/<thead>/<th scope>/<tr>/<td>` semantics, header association, `aria-sort` and
  screen-reader table navigation are byte-identical at 390 and at 1440. `collapseBelow` is measured
  against the table's OWN container (a container query), not the viewport, so a queue inside a
  master rail collapses before the page does. Measured in headless Chromium on
  `/showcase/table-approval-queue`, LTR and RTL: the table now fits its card exactly at every width
  (`scrollWidth === clientWidth`) — **1440** 1182px wide, columns 213/260/511/142/56; **1024** 766px
  wide, columns 138/169/312/92/56; **390** 388px wide, columns 93/85/88/78/44 with all five headers
  inside 1…389 — page overflow 0 everywhere, RTL mirrored, zero console errors. Defaults stay
  inert: `preset="default"` emits neither the attribute nor the container class, and the stylesheet
  has no `[data-preset="default"]` selector.

- **`DataTable preset="action-collection"` / `collapseBelow` + `ColumnDef.priority` — the same
  responsive approval-queue contract on the TanStack-driven table, and `--table-surface-min-inline-size`
  (#253, residual gap).** The `Table` half of #253 shipped without `DataTable`, so a queue driven
  through TanStack still scrolled sideways at 390: `.ui-data-table-surface` carried a hard-coded
  `min-w-[640px] sm:min-w-0` utility pair — the literal that forced the scroll, and exactly the kind
  of service-tunable constant rule #45 says must be a knob — and `ColumnDef` had no way to express a
  column priority. `DataTable` now forwards `preset`/`collapseBelow` to the table it renders and
  stamps `ColumnDef.priority` onto the column's `<th>` **and** every `<td>` (`meta.lean` is already
  this component's declared home for custom column options, so priority needed no second TanStack
  channel). It **reuses** the `Table` contract end to end — the same `--table-action-collection-*`
  tokens, the same `.ui-table-collection` container query, the same four priority steps; there is
  deliberately no parallel `--data-table-action-collection-*` family. The width floor is now
  `--table-surface-min-inline-size` (default `640px`, byte-identical to the old utility and
  deliberately px so it releases at exactly the px-based `sm` media query that clears it); the
  preset opts out of it entirely, because there the priority measures own the width. Measured in
  headless Chromium against `pnpm preview:build` on
  `/isolate/data-display-data-table-examples-approval-queue`, LTR and RTL: the table fits its card
  exactly at every width — **1440** 1182px, columns 212.8/260/511.4/141.8/56; **1024** 766px,
  columns 137.9/168.5/311.7/91.9/56; **390** 388px, columns 93.1/85.4/87.9/77.6/44 with all five
  headers inside 1…389 — `documentElement.scrollWidth === clientWidth` and
  `.ui-data-table-scroll` overflow 0 at all three widths in both directions, zero console errors.
  The default is provably inert: `preset="default"` emits no `data-preset` on the surface or the
  table, an unmarked column emits no `data-priority`, the surface's class list is exactly
  `ui-data-table-surface`, and the stylesheet contains neither `[data-preset="default"]` nor a bare
  `.ui-data-table-surface[data-preset]` selector (asserted in tests — the gh#231 contract). The same
  page with `preset` omitted still measures `min-inline-size: 640px` at 390 and `0` at 1024/1440.

- **`ErrorSurface` — the 403 / 404 / 500 / 503 exception surface is now a real, importable component
  (gh#251, reversing the gh#221 outcome).** #221 shipped this surface as a documentation-only
  composition pattern; #251 proved that wrong the only way that matters — a clean install of
  18.5.0 exposed no `ErrorSurface`, so DXS Platform was still composing `AuthShell` + a generic
  `Card` behind a consumer-local `.canonical-auth-card`. **A consumer cannot `import` a docs page.**
  `import { ErrorSurface } from "@godxjp/ui/layout"` now ships the whole contract:
  `mode` is the SHELL CONTRACT, not a skin — `"application"` (403/404) renders ONLY the surface
  block, i.e. what you put in the children of the `AppShell` the route already provides, so the
  sidebar/topbar/breadcrumb are PRESERVED and never reconstructed (a component cannot manufacture
  chrome from consumer-owned nav data — the one conclusion #221 got right, kept verbatim); and
  `"system"` (500/503) owns the whole page via `CenteredShell align="center"`, so package-owned
  geometry at 1440 / 1024 / 390 replaces every consumer `min-h-dvh` / flex-centring class / media
  query. `status` is the input that derives the icon (`ShieldAlert` · `SearchX` · `ServerCrash` ·
  `Wrench`) and tone (`warning` · `muted` · `destructive` · `warning`), both overridable.
  **Exactly one** recovery action stays structural: a single `action` slot, with extras dropped and
  a development-time error (never a throw — an exception on the exception page is how a 500 becomes
  a blank screen). `requestId`, `permission`, `organization` and
  `maintenance{start,end,timeZone,progress}` are semantic `<dt>`/`<dd>` metadata slots rather than
  prose, so the label↔value relation survives for a screen reader; the maintenance window is
  formatted by `Intl.DateTimeFormat(locale).formatRange()` from ISO-8601 instants + an IANA zone
  with the ISO value kept in `<time dateTime>`, and `progress` renders a labelled `Progress` meter
  named through `Intl.NumberFormat` percent style. The status code is announced as a phrase
  ("HTTP status 403"), never the cardinal number; `titleLevel` defaults per mode (`h2` under a
  `PageContainer` `h1`, `h1` on a system page). No state, no effects, no portals and no provider
  requirement, so it renders fully server-side (Inertia/SSR). Verified at **0 axe violations** for
  all four statuses in both shells, with metadata, and under `dir="rtl"`.

- **Packed-tarball consumer contract for `ErrorSurface` (gh#251).** Source-only checks are exactly
  what let the regression through, so `scripts/check-packed-public-contract.mjs` now pins
  `ErrorSurface` (+ `ErrorSurfaceProp`/`Props`/`MaintenanceProp`/`ModeProp`/`StatusProp` and
  `dist/components/layout/error-surface.{js,d.ts}`) in the `./layout` packed contract, and adds a
  fresh-consumer fixture that extracts the REAL tarball into an empty `node_modules`, runs a
  production Vite build importing `ErrorSurface` from `@godxjp/ui/layout`, then server-renders it
  with `react-dom/server` in BOTH modes and asserts the shipped contract from the packed runtime:
  the status code and its accessible phrase, exactly one action, the semantic metadata rows, the
  ISO-8601 `<time>`, the progress meter, and that `application` mode builds no page shell while
  `system` mode emits the centred column. It renders with no provider on purpose — an exception
  page must work when the app around it is already broken.

- **`--error-surface-*` component tokens.** `--error-surface-max-width` (32rem surface measure, both
  modes), `--error-surface-gap`, `--error-surface-padding-block` / `-padding-block-compact` (the
  desktop steps vs the 390 step), `--error-surface-brand-gap`, `--error-surface-meta-gap` /
  `-meta-row-gap` / `-meta-padding-block` and `--error-surface-progress-max-width`. Chrome is quiet
  by default (rule #44): `--error-surface-meta-border` is `none`, and a service opts in with
  `1px solid hsl(var(--border))`. The narrow step is a CONTAINER query at 30rem on the surface's own
  width (the SplitPane precedent, gh#165), so it compacts identically whether the squeeze came from
  a phone or from an expanded application sidebar. Catalogued in `mcp/src/data/tokens.ts`.

- **`@godxjp/ui/email` publishes the canonical M PLUS 2 stack, a mono face and the header lockup
  (gh#250).** `EMAIL_TYPOGRAPHY.fontFamily` now names the DXS canonical face first and documents its
  whole degradation path (`M PLUS 2` → Hiragino → Yu Gothic → Noto Sans JP → Meiryo → system UI →
  Arial → `sans-serif`); no email client honours `@font-face`, so the stack IS the fallback
  contract. New `EMAIL_TYPOGRAPHY.monoFontFamily` (`--email-font-family-mono`, mirrors
  `--font-family-mono`) sets invoice ids, masked card numbers, ISO-8601 dates and amounts, which the
  canonical card sets in mono and a template previously had to hand-type. Family names export
  SINGLE-quoted so the value drops into a double-quoted `style="…"` attribute unescaped, and
  `emailInlineStyle` now throws on a value containing `"` (it would close the attribute mid-tag)
  alongside the existing `var()`/`calc()` guards. New `--email-mark-gap` (8px) and
  `--email-wordmark-{font-size,font-weight}` (13px/700) publish the canonical header LOCKUP through
  `EMAIL_BRAND_MARK.gap` / `.wordmarkFontSize` / `.wordmarkFontWeight`, so a template stops guessing
  the mark-to-wordmark rhythm; in that pairing the mark is decorative (`label: ""`) and the wordmark
  carries the accessible name. Everything still derives from `src/tokens/`: no hex literal exists
  anywhere in `src/email/`, and the mark artwork remains byte-identical to
  `<Logo mark="godx" />`.

- **`Avatar shape="circle" | "square"` — a token-owned entity-header brand mark (gh#249).** The
  public API exposed only Avatar/AvatarImage/AvatarFallback, so an organization/service header could
  only render the round muted person avatar and a consumer had to reach for a forbidden
  `className="rounded-md bg-primary"` override. `shape="square"` is the semantic entity mark:
  compact rounded square on the brand surface, driven entirely by four new knobs —
  `--avatar-square-radius` (`--radius-lg`), `--avatar-square-size` (`--control-height`, so swapping
  shape never reflows a header) and the role-mirror pair `--avatar-square-background` /
  `--avatar-square-foreground`, declared `initial` with `hsl(var(--primary))` /
  `hsl(var(--primary-foreground))` resolved at the call site so a scoped `[data-tenant]`/`.dark`
  role override still reaches the mark. The brand fill is handed down through `--avatar-background`,
  so `AvatarFallback` picks it up with no extra rule and a service that wants a neutral square sets
  `--avatar-square-background` alone. Measured in Chromium at 1440 / 1024 / 390: square = 6px radius,
  32×32 box, `rgb(0,119,199)` on `rgb(253,253,252)` (**4.65:1**, WCAG AA); every circle avatar on the
  same page stayed 9999px / `rgb(244,243,240)` / `rgb(112,110,102)`. The default is inert — `circle`
  emits no attribute at all, so existing avatars keep their exact DOM and geometry. `shape` is
  registered as the `AvatarShapeProp` vocabulary (`AvatarProp` in `src/props`); the control
  `ShapeProp` (`default|pill|sharp`) is deliberately NOT reused — its `sharp` is `--radius-sharp: 0`
  and cannot express a rounded rect.

- **`ListRow density="compact"` — a token-owned compact inline-actions geometry (gh#246).** After
  the #224 overflow fix the row and its trailing cluster wrap, which removed the page-root overflow
  but left the canonical compact invitation composition unrepresentable through the public API: the
  12rem `--list-row-body-min-width` forced the trailing Buttons (and a history Badge + date) onto a
  second line inside the canonical 358px card. `density="compact"` lowers the geometry through four
  new knobs — `--list-row-compact-{padding-y,padding-x,gap,body-min-width}` (block `--space-2`,
  inline `--list-row-padding-x`, gap `--space-2`, threshold `6rem`); the three spacing knobs are
  `initial` with the density-scaled default at the call site, so a `.ui-density-*` subtree
  re-resolves them. Measured in Chromium on the preview: at 390px an invitation row goes from 126px
  tall with the actions wrapped to **62px with the Avatar, title and both Buttons inline**, and a
  history row (status Badge + ISO-8601 date in `trailing`) from 114px to **41px**, against the
  canonical 42px. At 1024 / 1440 the same rows are 62px / 40–41px. It only LOWERS thresholds: the
  row and the trailing cluster still wrap and the body is still clamped with `min(…, 100%)`, so a
  cluster that genuinely cannot fit (a 186px pair of bilingual labels in a 324px column) drops to
  its own line and `documentElement.scrollWidth === clientWidth` holds at 390 / 1024 / 1440 with
  long JA/EN/VI titles. Keyboard order and focus are unchanged.

- **Data-entry + query frames now demonstrate every `variant` / `size` / `shape` branch of
  `Upload`, `NumberInput`, `Switch` and `ButtonRefetch` (#163).** `docs/data-entry/switch.tsx`
  gained a `size · sm / md` card (the previous page only ever rendered the default row height), and
  `docs/query/button-refetch.tsx` gained `variant` (7), `size` (5 text tiers + 4 square icon tiers,
  each with its own `aria-label` since the icon-only form drops `label`) and `shape` (3) matrices,
  each card owning its own `useQuery` so the matrices never refetch in lockstep. `Upload`'s six
  variants and `NumberInput`'s four size tiers were already rendered and are now recorded.
  `component-case-evidence.json` records the branches, which promotes six previously `untested`
  cells of `preview/frame-coverage.ledger.json` to `covered:prop-evidence`. Verified headless at
  390 / 768 / 1280: no horizontal overflow, zero console errors/warnings, and
  `check:data-entry-frame-runtime` green across all eight widths.

- **Navigation + toggle frames now demonstrate every `variant` / `size` branch of `TabsList`,
  `ContextMenuItem`, `DropdownMenuItem`, `MenubarItem`, `Steps`, `Toggle`, `ToggleGroup`,
  `ToggleGroupItem` and `SelectTrigger` (#163).** The menu frames only ever rendered
  `variant="destructive"` implicitly against unnamed defaults (`docs/navigation/menubar.tsx` had no
  destructive item at all), so the two-branch item union was never drawn side by side; each menu now
  ends on an explicit `variant="default"` archive action next to the destructive delete.
  `docs/navigation/tabs.tsx` gained a hand-composed `TabsList variant` card (the `default` pill list
  and the `line` underline list) since the compound path previously only ever named `line`, and
  `docs/navigation/steps.tsx` gained a `size · md / sm` card (`size` drives the step title and
  description type scale; only `sm` had ever been rendered, inside the dot-style card).
  `docs/data-entry/toggle-group.tsx` gained `variant` (2) and `size` (3) cards, set on the group and
  its items together because `ToggleGroup` only stamps `data-variant` / `data-size` and each
  `ToggleGroupItem` carries its own visual variant; `docs/data-entry/select.tsx` now renders the
  default `SelectTrigger size="md"` next to the existing `sm` trigger. `Toggle` already rendered
  both unions and is now recorded. `component-case-evidence.json` records the branches, promoting
  twelve previously `untested` cells of `preview/frame-coverage.ledger.json` to
  `covered:prop-evidence`. Driven headless in Chromium: each menu opened and its
  `[role="menuitem"] data-variant` read back (`default` × 4-5, `destructive` × 1 per menu), no
  horizontal overflow and zero axe violations on all six touched frames at 320-1920, zero console
  errors, and `check:layout-nav-frames` still green (tabs keyboard, RTL ArrowLeft and axe).

- **Feedback / overlay frames now demonstrate every `tone` / `variant` branch of `Alert`,
  `AlertDialog`, `DialogHeader` and `SheetHeader` (#163).** `docs/feedback/alert.tsx` rendered only
  four of the seven `tone` branches, so `info`, `muted` and `neutral` were claimed by the copy and
  never drawn; the page now renders all seven in vocabulary order and spells out the single
  `variant="default"` branch. `docs/feedback/alert-dialog.tsx` only ever opened
  `variant="destructive"` dialogs and gained a neutral confirm card for the `default` branch (no
  header band, primary confirm button). `docs/feedback/dialog.tsx` and `docs/feedback/sheet.tsx`
  gained a header-tone card that re-opens ONE overlay per branch through the prop-driven
  `title`/`subtitle`/`extra` form, so all seven bands of the shared `overlayHeaderToneClass`
  contract are reachable without ever mounting two focus traps at once.
  `component-case-evidence.json` records the branches, promoting five previously `untested` cells
  of `preview/frame-coverage.ledger.json` to `covered:prop-evidence`. Driven headless in Chromium:
  every branch verified by its rendered `data-tone` and computed band colour (title colour constant
  at `rgb(36,35,30)` in all seven, confirming the band tints only the background), no horizontal
  overflow at 320–1920, and `check:provider-feedback-query-runtime` green with zero axe violations
  on `feedback-dialog`, `feedback-sheet` and `feedback-alert-dialog`. `AlertDialogHeader.tone`
  stays **UNTESTED**: `@godxjp/ui` exports the alert-dialog header/content/footer parts but no
  alert-dialog Root, so the compound form cannot be composed from the public API in a docs frame.

### Changed

- **⚠ DELIBERATE BRAND-COLOUR CORRECTION — the GoDX identity mark is now the canonical emerald,
  not the wakatake status green. New `--brand` / `--brand-foreground` semantic role (gh#250,
  finishing gh#214).** This IS a visible colour change on every surface that renders the identity
  mark; it is a correction, not a regression, and it should not be reverted as one. #214 shipped a
  brand mark "independent of `--primary`" — true, but it was bound to `--success`, the 若竹
  wakatake STATUS green (`#68be8d`). The canonical design system defines TWO distinct greens: the
  wakatake `--success` (which this package already matched almost exactly, and which is correct for
  status) and a separate identity green documented as "kept distinct from SmartHR primary". The
  package therefore rendered the mark at **`#69bf8e`** where canonical is **`#009766`** —
  **ΔE76 ≈ 17.5**, an obviously wrong brand colour rather than a subtle drift.
  `--brand` is now a first-class semantic role in `src/tokens/foundation.css`, declared in both
  `:root` and `.dark` exactly like the other roles: light **`160.5 100% 29.6%` = `#009766`**
  (`oklch(0.595 0.137 162.94)`; carried at one decimal because an integer `160 100% 30%` would drift
  to `#009966`), dark **`160.5 100% 36%` = `#00b87c`** — the SAME hue and chroma, lifted only in
  lightness so the mark reads off the warm near-black spine (6.9:1 on `--background`, 6.3:1 on
  `--card`). `--brand-foreground` is the on-fill pair (off-white light, near-black dark, mirroring
  `--success-foreground`). Verified in headless Chromium against a real preview build: the computed
  fill of `<Logo mark="godx" />` is `#009766` in light and `#00b87c` in dark, for the vector mark,
  the boxed `tone="success"` fill and the wordmark alike.
  **What visibly changes:** `<Logo mark="godx" />`, `<Logo tone="success" />` and the GoDX wordmark
  lockup (so `AuthIdentity`, the AuthShell brand bar and any `CenteredShell` topbar that renders
  them), plus `EMAIL_COLORS.brand` / `.brandForeground` and therefore `EMAIL_BRAND_MARK` in
  `@godxjp/ui/email`. **What does NOT change:** every status surface. `--success` is untouched in
  both themes — badges, alerts, progress fills, timeline done dots, password-strength segments, the
  sidebar presence dot and `tone="success"` text all keep the wakatake green. Nothing else in the
  library was using `--success` for identity.
  Mechanically, `--logo-godx-color`, `--logo-wordmark-color` and `--logo-success-{background,
foreground}` stay **role-mirror knobs**: still `initial` at `:root`, with the role default moved at
  the CALL SITE to `hsl(var(--logo-godx-color, var(--brand)))`, so a scoped `.dark` /
  `[data-tenant]` override of `--brand` still reaches the mark instead of freezing at `:root`.
  On the email side only the ROLE MAP moved (`EMAIL_COLOR_ROLES.brand → --brand`); the invariant
  that **no hex literal exists anywhere in `src/email/`** holds — the palette is still generated
  from `src/tokens/foundation.css` and converted HSL→hex at module load.
  Note the three same-sounding tokens are now explicitly disambiguated in the catalog: `--brand`
  (identity), `--brand-glow-*` (the decorative radial halo) and `--text-brand` / the Tailwind
  `text-brand` utility (the BLUE brand-numeral text slot). There is intentionally no `bg-brand`
  utility, because `--color-brand` is already taken by `--text-brand`; identity surfaces read
  `hsl(var(--brand))` directly in component CSS. The `Logo` wordmark also now carries
  `data-logotype`, the attribute `check:contrast` reads for the WCAG 2.2 SC 1.4.3 logotype
  exemption — brand-name artwork has no contrast minimum, and the library must not darken a
  brand's own colour to satisfy one. (Contrast improved regardless: the wordmark went from
  ~2.2:1 to 3.67:1 on the light surface, and the dark mark sits at 6.3:1.)
  Pinned by `src/tokens/__tests__/brand-identity-role.test.ts`, which asserts the identity reads
  `--brand` and never `--success`/`--primary`, that the status owners still read `--success`, and
  that the two greens stay visibly distinct.

- **Email base tokens reconciled with the SCR-302 canonical reference (gh#250).** Measured from
  `.design/DXS Email Templates.dc.html` and confirmed pixel-for-pixel against the 1440 reference
  raster, the email ramp was carrying the WEB scale rather than the canonical email one. Typography:
  title `20px/1.25` weight 700 → **`17px/1.7` weight 500** (a transactional title is calm, not
  bold), body line-height `1.7` → **`1.9`**, legal band `12px/1.5` → **`11px/1.8`**, mobile title
  `18px` → **`16px`** (it must never exceed the desktop title). Primary CTA: `44px` tall with `24px`
  inline padding and a `700` label → **`36px` (mirrors `--control-height-lg`), `16px` padding
  (`--space-4`), `500` label** — still clearing WCAG 2.2 SC 2.5.8 (24×24), and the mobile reflow
  still takes it full-bleed. Brand mark: the ARTWORK was already correct — byte-identical to
  `<Logo mark="godx" />` and to the canonical raster, contrary to the report of a differing glyph —
  but the rendered box was the 32px web box; it is now the canonical **22px** header box. The CTA
  colour pair is CONFIRMED, not changed: `EMAIL_COLORS.primary` / `primaryForeground` keep deriving
  from `--primary` / `--primary-foreground`, because pasting the canonical console's hex would break
  the no-drift guarantee that is the whole point of this export. The `--email-*` tokens, the
  `@godxjp/ui/email` export, the MCP catalog and the `foundation/email-tokens` specimen all move
  together; templates pinned to the old geometry should re-render against the specimen.

- **Restore the checked-in DXS hi-fi baseline across every shell and data surface** — AppShell and
  CenteredShell chrome now use the 48px reference height, flat card topbars, a warm muted main
  surface and the 1280px page boundary instead of the 52px translucent/blurred gradient treatment.
  Sidebar brand/navigation geometry now follows the compact 22px/13px reference rhythm and switches
  to its drawer at 900px. Cards return to the documented 10px radius with `shadow-sm`, compact page
  insets begin at 720px, and AuthShell/CenteredShell use the flat muted canvas. The bundled product
  face is now M PLUS 2 for ja/en/vi with Noto Sans JP as its CJK fallback. All new geometry remains
  exposed through component tokens so service themes can retune it without consumer CSS forks.

- **The `table-master-detail` showcase now composes `MasterDetail` instead of hand-rolled tracks
  (#223).** The "未選択の状態" card built its split from page-local geometry —
  `lg:flex-row lg:items-start` on a `Flex`, a `lg:w-56 lg:shrink-0` master column, `flex-1` on the
  detail panel and a pair of orientation-swapped `Separator`s — which is exactly the consumer-local
  track authoring #223 exists to delete, in the library's own copy-pasteable showcase. It is now a
  single `<MasterDetail rail="master" railWidth="compact" collapseBelow="md">`: `rail="master"`
  because the 一覧 is the LEADING fixed track and the detail surface is the fluid one (the inverse
  of the default `rail="detail"`), and `collapseBelow="md"` because the threshold is measured
  against the composition's own inline size rather than the viewport — inside a `Card` body at the
  1280px page boundary the old viewport-based `lg:` corresponds to a ~940px container, and `md`
  (48rem) is the tokenized step that keeps 1440 and 1024 side-by-side while 390 stacks. Measured in
  Chromium: the rail holds 300px at both 1440 (detail 1042px) and 1024 (detail 626px), the regions
  stack between 860 and 840 viewport px (container 778 → 758, i.e. the 768px token), and RTL mirrors
  the rail to the inline-end edge. The 224px rail also silently clipped the master table's 275px
  intrinsic width; the tokenized 300px `compact` track is the first one it fits in. The remaining
  two regions are deliberately NOT migrated: the Gmail-style split is user-draggable and belongs to
  `ResizablePanelGroup`, and the 狭幅レイアウト card is an always-stacked single-surface demo (flush
  table, hairline, padded detail) that `MasterDetail`, whose stacking is width-driven, should not
  impersonate.

### Fixed

- **`Tabs variant="line"` no longer keeps a ring around the SELECTED trigger — and the keyboard
  focus ring is finally its own state (gh#248).** `TabsTrigger` painted the selected state with
  `data-[state=active]:ring-1 ring-primary/25` for every variant, so the underline-only line variant
  still drew a card-like border no consumer could remove without a page-local override. Worse, both
  states used the same Tailwind `ring-*` utilities at equal specificity, so the 1px selected ring
  simply swallowed the 3px `focus-visible:ring-[3px]` keyboard ring. The selected ring is now scoped
  to the default/card lists (`group-data-[variant=default]/tabs-list:`), and the line indicator moved
  out of the `after:*` utilities into a token-owned rule reading
  `--tabs-indicator-{background,size,offset}` (`initial` → `hsl(var(--primary))`, 2px, offset 0).
  Measured in Chromium at 1440 / 1024 / 390 on `/frame/navigation-tabs`: a mouse-selected line tab
  now computes a **fully transparent box-shadow** plus a 2px `rgb(0,119,199)` bar, while a genuinely
  keyboard-focused one (Tab, then ArrowRight) computes `oklab(… / 0.5) 0 0 0 **3px**` plus
  `outline: solid 1px` — before the fix BOTH states computed the same `oklab(… / 0.25) 0 0 0 1px`.
  Default/card triggers are unchanged (1px ring + `shadow-sm`), the strips still scroll their own
  overflow at 390, and the console stayed clean. Two side fixes fall out: the `items` API now
  actually forwards `variant="line"` to its `TabsList` (previously it styled the list through
  `className`, leaving `data-variant="default"` so no line rule ever matched, and the underline was a
  duplicate hand-rolled `border-b-2 border-primary`), and the vertical rail uses logical
  `inset-inline-end` instead of the physical `after:-right-1`, so it flips under `dir="rtl"`
  (verified: `right:0` in LTR → `left:0` in RTL).

- **`DataTable.Pagination` now owns its own inset instead of declaring `padding-top` only
  (gh#236).** The footer ships as a self-contained slot and is usually dropped straight into the
  documented flush container (`<Card><CardContent flush><DataTable/>`), where no ancestor supplies
  padding — so the "rows per page" label and the page-size `Select` sat flush against the container
  edge and its closing border. Measured in Chromium on the preview at 1440 / 1024 / 390: computed
  padding was `7.36px 0 0 0` (numbered) / `8.64px 0 0 0` (cursor) and the label started at the
  container's own inline edge, 13px inside of the first column's text axis. It now declares
  `padding-block` + `padding-inline` from two new knobs, giving `7.36px 12px 7.36px 12px` /
  `8.64px 12px 8.64px 12px`, with the label at 36px against the first column's text at 37px (the
  1px table border) — on the same optical axis, with the block-end breathing room restored. The
  block value still differs per density scope, which is the point: both knobs are declared
  `initial` with their density-scaled defaults resolved at the call site, so a `.ui-density-*`
  subtree re-resolves them instead of freezing at `:root`. Consumer apps can drop their local
  `.ui-data-table-pagination` overrides.

- **`Sidebar` no longer shears descenders and Vietnamese tone marks off every nav label (gh#254).**
  `.sb-label` clips with `overflow: hidden` but declared no line-height, so it inherited
  `line-height: 1` from `.sb-nav-item` — and on a clipping element the line box IS the clip box, so
  a 1em box shorter than the font's ascent+descent destroyed everything below the baseline.
  Measured in Chromium against the bundled M PLUS 2 at the row's 0.8125rem, comparing canvas ink
  extents with the element's own clip box: **1.6–1.9px of glyph gone at `line-height: 1`**, fits
  from 1.2, 1.4px of headroom at 1.5. Downstream (DXS console) this silently misspelled the
  Japanese-first product's Vietnamese locale — "Dịch vụ" lost both tone marks and rendered as
  "Dich vu", "Phê duyệt truy cập" lost three — while the DOM text stayed correct, so no a11y or
  reflow gate could see it. The label now reads a new `--sidebar-nav-item-line-height` knob
  (default `1.5`) instead of inheriting: the row is a fixed `--sidebar-nav-item-height` with
  `align-items: center`, so 19.5px inside the 32px row grows only the centred text box — row
  height, icon alignment and gap are byte-identical. `.tb-chip-label` carried the same latent trap
  (clips, no own line-height, safe only because `.tb-chip` uses `font: inherit`) and is fixed in
  the same pass, and a guard now fails the build if ANY single-line clipping box in the shell
  inherits its line box.
- **Topbar now prevents center-slot collisions at compact desktop and mobile widths (#244).** At
  1100px and below, the optional center slot follows the public
  `--topbar-center-compact-display` contract (default `none`) before a full search trigger can
  cover the start breadcrumb/title or end utilities. The final start-slot item now owns a real
  shrink + ellipsis boundary. The interactive Topbar preview exercises long JA/EN/VI labels, and a
  Chromium gate records 1440/1024/390 geometry, focus, overflow and screenshots.

- **`CompactBarTrend` now has a Recharts-free public entry (#243).** Consumers that do not install
  the optional `recharts` peer can import from `@godxjp/ui/charts/compact-bar-trend` without Vite
  eagerly linking the peer-backed exports in `@godxjp/ui/charts`. The packed-public-contract gate
  now extracts the real tarball into a fresh consumer and runs a production Vite build with no
  `recharts` package present, so this regression cannot pass on source-only or text-only checks.

- **`check:frame-geometry` no longer reports a deliberately scrollable surface as a clipped
  control.** The sweep counted every focusable whose box sticks out of the frame, which is true of
  ALL content inside a scroll region — so a `DataTable` at 320px (`.ui-data-table-scroll`,
  scrollWidth 640 / clientWidth 244) and a `FilterBar overflow="scroll"` strip at 768px
  (`.ui-toolbar`, scrollWidth 768 / clientWidth 652) were flagged even though `overflowX` was
  false and every flagged control was focusable, scrollable into view and hit-tested clean —
  focusing the DataTable's sort button scrolls its region from scrollLeft 0 to 344 and lands it
  fully inside, and the one `FilterBar` trigger that stays put is 63% visible with its focus ring
  on screen because Chromium's `CenterIfNeeded` focus alignment never moves a partially visible
  target (reproduced on a synthetic scroller — browser behaviour, not a component defect; it
  clears 2.4.7 and 2.4.11 AA, which only forbids a fully obscured focus). Four such false
  positives (`layout-master-detail` @320/375/390, `navigation-filter-bar` @768) failed the
  gate. `clipped` now means what it says — _a control the user cannot bring into the frame_: an
  out-of-frame focusable is re-probed by scrolling ONLY its user-scrollable ancestors (computed
  `overflow: auto|scroll|overlay` with real scroll room — never `hidden`/`clip`) and counts as
  reachable when it lands fully inside, or when it is content wider than its own scroll viewport
  (a full table row) whose leading edge is inside. Scroll offsets are restored after each probe.
  Genuinely clipped controls still fail: verified that `data-entry-rating` @320,
  `foundation-density` @320/375 and the form examples keep every one of their counts because those
  controls have no scrollable ancestor at all, and `layout-page-container` keeps its real document
  overflow. The baseline was NOT regenerated — it is recorded on the canonical CI runner and may
  only shrink there.

- **`check:layout-nav-frames` is deterministic again — the roving-focus assertions now await the
  focus move instead of racing it.** The gate failed intermittently (and on `origin/main`
  reproducibly) with `LTR Tabs ArrowRight focus failed`. The product was never wrong: Radix
  `RovingFocusGroup` deliberately defers the arrow-key focus move out of the `keydown` handler
  (`setTimeout(() => focusFirst(candidateNodes))`), so the next trigger becomes
  `document.activeElement` ~10-25ms after `keyboard.press()` resolves — measured 8/8 in Chromium,
  always landing on the correct trigger, just later than the very next CDP round-trip. The harness
  read `document.activeElement` synchronously, so the gate passed or failed on scheduling luck. Both
  the LTR ArrowRight and the RTL ArrowLeft checks now poll the same assertion with a bounded wait
  and report the index that was actually focused on failure, and each tablist is first awaited until
  Radix has registered its focusable items (`[role="tablist"][tabindex="0"]`) so the key never lands
  on a not-yet-interactive strip. No assertion was weakened, retried away or removed.

### Added

- **`PageContainer` bounded page `measure` — one shared header+body measure, orthogonal to
  `variant` (#245, #247).** The new `measure="default" | "narrow" | "medium"` prop caps the page
  HEADER and the page BODY to a single token-owned measure, so a header `extra` action ends flush
  with the body surface instead of stranded at the page edge. This is the gap both consumer issues
  hit: `variant="narrow"` caps only `.ui-page-body` (header action left at x≈1416 at 1440), and
  because chrome and measure were the SAME variant axis, the quiet `variant="ghost"` rhythm a
  notification feed wants could not be combined with a bounded measure at all. `measure` is a third
  independent axis, so `variant="ghost" measure="medium" headerLayout="responsive-inline"` composes
  as the canonical quiet feed. New semantic tokens `--page-measure-narrow` (42rem) and
  `--page-measure-medium` (48rem) are OUTER measures — the package-owned page gutters sit inside the
  cap — so a service theme retunes both presets in one place and no consumer writes a page-local
  `max-width`. Measured in headless Chromium against the built stylesheet, emulating the AppShell
  main region (256px rail + the 80rem page boundary): `measure="medium"` renders a **720px** visible
  surface at **x=280..1000 at both 1440 and 1024**, with the header action's end edge landing on
  **x=1000**, exactly on the card edge; `measure="narrow"` renders 624px (x=280..904); at 390 nothing
  binds and the surface stays fluid at **358px** with the 16px compact gutter, while
  `headerLayout="responsive-inline"` still holds the action on the title row (x=198..374, 176px).
  RTL mirrors the whole measure to the inline-end edge (1440: body x=672..1440, card 696..1416).
  The cap is `max-inline-size`, never a width, and the footer is deliberately left uncapped because
  its border/background is page chrome when `stickyFooter` pins it. No new "quiet header" token was
  needed: `--page-header-divider` already defaults to `none` (cardinal rule #44) and `ghost` already
  drops the header's bottom pad. `measure="default"` is inert by construction — it emits
  `data-measure="default"`, which matches NO selector in the stylesheet (the gh#231
  `data-layout="stack"` precedent, asserted by a test), and every existing page measured
  `max-inline-size: none` on both bands in the browser.

- **PageContainer canonical Admin collection preset (#242).**
  `preset="admin-collection"` now owns the collection header-to-toolbar rhythm, 320px search
  measure, 32px control tier, compact table row/cell density and horizontal containment through
  service-themeable semantic tokens. Consumers set one page-level API instead of repeating field,
  row or breakpoint overrides. The responsive preview covers JA/EN/VI labels, keyboard focus and
  narrow horizontal table containment.

- **AppShell opt-in docked navigation below 900px (#242).** The new
  `responsiveNavigation="drawer" | "docked"` contract keeps the accessible drawer as the default,
  while approved narrow layouts can retain the same sidebar, footer/account region and active
  navigation in the token-sized shell grid. Docked mode suppresses the redundant drawer trigger;
  consumers no longer need page-local media queries to keep a canonical rail visible.

- **Device-authorization public primitives (#238).** `Steps type="inline"` renders the compact
  numbered auth progress row with localized process/finish/error/wait semantics;
  `InputOTPGroup appearance="grouped"` renders one outline per code group without replacing the
  real `input-otp` hidden input, paste, caret or keyboard behavior; and `AuthAccountSummary` owns
  the compact avatar/email/switch-action row with long-email truncation and responsive wrapping.
  All geometry is token-backed and the package adds no route, permission or mutation behavior.

- **`AuthShell preset="account-recovery"` — the token-owned SCR-008 password-recovery / sign-in-MFA
  panel measure (#233).** DXS Platform could only reach the canonical 432px recovery and MFA
  challenge panels through page-local geometry, because `variant="canonical"` owns a single 360px
  measure. A third named flow preset now owns both — the two canonical desktop panels share one
  width, so they share one preset: `--auth-shell-recovery-card-max-width` (27rem/432px),
  `--auth-shell-recovery-main-padding` (16px) and `--auth-shell-recovery-main-padding-mobile` (15px
  inline, so the panel renders `x=15, width=360` at 390). Measured in Chromium: panel `x=504, w=432`
  at 1440 and `x=296, w=432` at 1024 with a 382px content column; `x=15, w=360` with a 310px column
  at 390; no horizontal overflow at any of the three, and axe (wcag2a/2aa/21a/21aa/22aa) reports 0
  violations on all five docs pages at both 1440 and 390. Everything that existed before is
  untouched — the canonical 22.5rem Login measure, the 24rem un-preset shell, and the
  `device-authorization` / `context-selection` presets — and `preset` remains optional.
  **The panels themselves are deliberately NOT components.** Both failed Gate 0 of
  `docs/COMPOSITION-VS-COMPONENT.md` on C2/C3/C4/C7: the only real behaviour in the surface (paste,
  arrow keys, backspace, caret across six slots) already belongs to `InputOTP`, focus order is DOM
  order, and a `state="request | sent | new-password | expired"` prop would be the same
  screen-shaped grab-bag that `ErrorSurface`'s `mode` was rejected for — one prop swapping five
  incompatible bodies. So the package ships the measure and the tokens, and
  `docs/layout/auth-recovery/` pins the canonical body — a `Card` whose `CardHeader` holds the
  `CardTitle` and `CardDescription` INSIDE the bordered surface, over a `CardContent` > `AuthStack`
  carrying the notice (`Alert`), the fields, the `Button fullWidth` primary and a
  `Flex justify="between" wrap` fallback row — across all seven states
  (recovery request/sent/new-password/expired, MFA otp/recovery-code/passkey-failure) plus the
  error, loading and disabled paths. The surface is presentation-only: no route, no reset semantics,
  no OTP verification, no recovery-code consumption, no passkey authentication, no permissions.
  `AuthIdentity` is explicitly not used there (it always renders the hosted mark above the card) and
  `TwoFactorSetup` remains the enrollment dialog, never a sign-in challenge.
  **The 390 responsive contract is decided here, not traced.** The canonical 390 reference supplied
  with the issue is a desktop 2×2 composite that overflows and crops horizontally; it shows no
  mobile route and was not used. The documented contract instead reuses the canonical Login mobile
  gutter so Login → Recovery never makes the surface jump, keeps the OTP row at one 216px line
  inside the 310px column, keeps the primary action full-width, and lets the fallback row reflow to
  a stack purely on content — measured: the vi labels (222.4+206.4px) wrap at 432px while ja and en
  do not, and all three wrap at 360px, with no media query and no locale branch.

- **`--otp-slot-size` — the InputOTP slot box as its own knob (#233).** An auth panel can now widen
  the 6-slot challenge row without re-scoping `--control-height` on the card, which would also
  resize the submit button and every other input in it. It is declared `initial` with the tier as a
  call-site fallback (`var(--otp-slot-size, var(--control-height))`) — the tier-mirror form of the
  role-mirror rule in `docs/TOKENS.md`. That detail is not academic: the first implementation bound
  the knob to the tier at `:root` and headless Chromium caught the canonical auth shell's 36px slots
  silently collapsing to the frozen 32px `:root` tier. Default output is byte-identical and still
  density-aware; a service opts in with a named tier, never an ad-hoc `calc()` offset.

- **`QrCode` local-only SVG renderer (#205)** — adds a scanner-safe data-display primitive for
  TOTP enrollment, device pairing and other QR payloads that must never be sent to a third-party
  image service. The required localized `label` names the image without exposing its encoded value;
  `size` uses the shared `xs | sm | md | lg` vocabulary; a fixed four-module quiet zone, local SVG
  encoding, medium-or-better error correction and dark-on-light component tokens remain private
  reliability invariants. The API deliberately omits remote image/logo settings, raw colours,
  numeric sizing and inline style. Consumers compose it with `CredentialReveal` for a manual-key
  fallback inside one outer Card. Includes unit, SSR, secrecy and axe coverage plus a complete docs
  frame and MCP catalog entry.

- **`AlertDialog` gains typed-`challenge` + `stepUp` re-auth for the DangerConfirm recipe (#193)** —
  the destructive-confirm preset now covers high-stakes deletion end-to-end WITHOUT a new component
  (it already owned type-to-confirm + destructive tone + `pending`). New `challenge` prop is the
  semantic alias of `confirmPhrase` — the exact token to type (e.g. an org slug `acme-inc`) before
  the confirm button arms; a typed challenge forces the destructive tone and a soft danger header
  band. New `stepUp?: () => Promise<boolean> | boolean` runs an async passkey / 2FA re-auth gate
  BEFORE `onConfirm` fires: the confirm button shows a "Verifying…" state while it runs, a resolved
  `false` (or a throw) keeps the dialog open and announces the failure via a `role="alert"` region,
  and `onConfirm` only runs after step-up resolves truthy. Mirrors DXS SCR-203 (org delete by slug)
  and SCR-209 (refund with step-up); showcased in `docs/feedback/danger-confirm.tsx`. i18n keys
  `feedback.alert.verifying` / `feedback.alert.stepUpFailed` added for en/vi/ja.
- **Permission-matrix composition + `@godxjp/ui/lib/permission-grid` util (#194)** — a role ×
  permission RBAC grid (sticky first column, ✓/— cells, two-role COMPARE mode, 差分のみ / diff-only
  filter) requested by the DXS Platform Redesign. Per Gate 0 (`docs/COMPOSITION-VS-COMPONENT.md`) a
  permission matrix is a **composition pattern**, not a framework component (it fails C2/C3/C7 — the
  `Table` family + `Badge` + tokens already express it, and no consumer beyond RBAC admins pays its
  bundle cost), so it ships as the real-screen showcase `docs/showcase/permission-matrix.tsx` built
  from real primitives (sticky-column via the `Table` family exactly like `table-sticky-columns`;
  role pickers = `Select`; diff toggle = `Switch`; cells = `Badge` with shape-encoded ✓/— + sr-only
  state, never colour-only). The only genuinely reusable part — the grant/diff DATA logic — is added
  to the library as the pure, render-neutral, tested util **`@godxjp/ui/lib/permission-grid`**
  (`grantKey` / `hasGrant` / `rolesDifferOnPermission` / `visibleRows` / `countDifferences` /
  `countGrants`) so every consumer shares one source of truth. No new `src/components/` entry.
- **`CredentialReveal` — one-time secret display (#195)** — the GitHub/Stripe token-reveal pattern
  as a real `@godxjp/ui/data-display` primitive so consumers stop hand-rolling it. Shows an issued
  secret masked by default with a show/hide toggle (controlled boolean triad
  `revealed`/`defaultRevealed`/`onRevealedChange`), a copy button that writes to the clipboard and
  confirms via a `Check` swap + an `aria-live` announcement, an optional download-as-file button
  (`downloadable`/`downloadFileName`), a localized caution banner (`tone` warning/destructive/info,
  suppressible with `warning={null}`), and an optional `onAcknowledge` action to gate a paired
  Dialog's close. Re-blurs automatically when the `secret` prop changes; masks with a fixed-length
  dot string so the secret's real length never leaks. Composed only from real primitives
  (`Alert` · `Button` · `Text`); every string + `aria-label` is routed through `t()`
  (en/vi/ja). `size ∈ xs|sm|md|lg`. Ships a unit test and a `*.a11y.test.tsx` (0 axe violations).
- **OrgSwitcher recipe — sidebar organization/tenant switcher (#196)** — the Slack/Linear
  workspace-switcher requested by dxs-platform ships as a **composition pattern**, not a new
  framework component (GATE 0 Framework-Component Test: FAILs C2/C3/C4/C6/C7 — it owns no new
  behaviour, is fully expressible from existing primitives, and `Sidebar` already exposes the
  `brand`/`product` + `onProductClick` slot to host it). The current-org card at the top of the
  `Sidebar` opens a `Popover` containing a searchable `Command` list of organizations plus
  "create organization" / "join by invite code" footer actions — built entirely from real
  `@godxjp/ui` primitives (`Popover` · `Command` · `Button` · `Avatar` · `Text`). Added as a
  copy-pasteable showcase page (`docs/showcase/org-switcher.tsx`, registered in the showcase
  catalog) with behavioural (`org-switcher.test.tsx`) and axe (`org-switcher.a11y.test.tsx`)
  tests. The active org carries a visible Check **and** an sr-only status word (never
  colour-only); the trigger announces the current org; spacing is logical (RTL-safe).

- **`Toolbar` (the FilterBar) gains an opt-in `sticky` list-filter strip + is now catalogued
  (#197)** — the framework filter strip (`Toolbar` / `ToolbarGroup`, in
  `src/components/navigation/filter-bar.tsx`) takes a new positive-boolean `sticky` prop that pins
  the strip to the top of its scroll container while the list scrolls beneath it, closing the last
  gap that pushed consumers to hand-roll their own bar (DXS list screens SCR-107/202/208). Following
  Gate 0 (`docs/COMPOSITION-VS-COMPONENT.md`), a bespoke `<FilterBar filters=[…] chips …>` grab-bag
  component was rejected — it is composable today (C3 fail) from `Toolbar` + `SearchInput` + `Select`
  - `Badge` chips, so the pattern is documented as a real-screen recipe rather than a new component.
    New quiet-by-default theme knobs `--filter-bar-sticky-offset` (park below a topbar) and the
    role-mirror `--filter-bar-sticky-background` (`initial`, resolves to `--background`) let a service
    retune the pinned strip without forking CSS. The previously-uncatalogued `Toolbar` now has a
    `@godxjp/ui-mcp` entry (with the active-filter-chip recipe: a `Badge` label + a **sibling** icon
    `Button`, never nested) so agents stop re-implementing it. New `StickyProp` vocabulary type,
    registered.
- **Framework-agnostic form-state adapter + first-class Inertia binding (#190)** — `FormRoot` and
  `FormFieldControl` are no longer hard-coupled to react-hook-form. `FormRoot` now accepts EITHER
  `form` (the built-in RHF + Zod client path, unchanged) OR `adapter` — a small `FormStateAdapter`
  (`getValue`/`setValue`/`getError`/`isSubmitting`/optional `onBlur`/`getValues`) — so a
  server-driven form library plugs into the SAME auto-binding. `FormFieldControl` binds each field by
  `name` (value/onChange/error, with `aria-invalid` wired from the error slot) on either path, and a
  new `useFormSubmitting()` hook reads `isSubmitting` from whichever path is active (drives
  submit-button `loading`). New optional subpath **`@godxjp/ui/inertia`** ships `inertiaAdapter(form)`
  (wrap Inertia's `useForm`) and a lighter `useInertiaField(form, name)` helper. The core keeps
  **zero** dependency on `@inertiajs` — the Inertia shape is duck-typed — so formik / TanStack Form
  can implement the same contract. An Inertia page now binds a labelled, validated field with no
  manual `value`/`onChange`/`error`/`aria-invalid` wiring; server (FormRequest) errors surface on the
  right field and clear on edit.
- **`CenteredShell` — authenticated, no-sidebar, centred-column page shell (#189)** — the third
  layout shell, filling the gap between `AppShell` (which REQUIRES a sidebar — its padded topbar
  chrome is a grid area beside the nav rail) and `AuthShell` (the UNAUTHENTICATED root, a narrow
  ~24rem card centred vertically with no actions slot). CenteredShell gives a **padded top bar with
  real actions** (banner) reusing the same `.app-topbar` chrome (inline padding · border · backdrop)
  WITHOUT a sidebar, a scrollable `main` holding a **width-tiered centred column** (`width` =
  sm ~32rem · md ~46rem default · lg ~64rem, all wider than the auth card) that is top-aligned so
  sections flow + scroll, and an optional footer (contentinfo). A hosted "My Page" / account /
  standalone-settings page now needs **zero custom CSS** and never hand-rolls a bar (the bare
  `Topbar` ships no inset — the `.ui-topbar` zero-padding footgun). New tokens
  `--centered-shell-bar-height`, `--centered-shell-bar-padding-x`, `--centered-shell-main-padding`,
  `--centered-shell-footer-padding`, `--centered-shell-width-{sm,md,lg}` let a service retune the
  bar inset, block padding and each width tier without forking CSS.
- **Per-frame axe a11y gate real fixes (#157)** — the frame-axe baseline shrank from 101 allowlisted
  frames toward near-zero by fixing ROOT CAUSES, not re-baselining:
  - Every docs demo's top-level `CardTitle` now declares `level={2}` (was the library default
    `h3`), fixing the pervasive `h1 → h3` heading-order skip under `PageContainer`'s `<h1>` (91
    frames) — an AST codemod, nested Card-in-Card titles correctly kept the `h3` default.
  - `Pagination`, `Breadcrumb` (standalone + `PageContainer`'s built-in breadcrumb slot via new
    `breadcrumbAriaLabel`), and `Sidebar` gained an `aria-label` override prop so more than one
    instance on a page/view gets a distinguishable landmark name (`landmark-unique`, WCAG 2.4.1);
    `PageContainer`'s breadcrumb `aria-label` now routes through `t()` instead of a hardcoded
    English literal.
  - `FormField` now ALSO injects a redundant `aria-label` (mirroring the visible `label`, when it's
    plain text) alongside its `aria-labelledby` wiring — a belt-and-suspenders accessible-name path
    for every control it wraps.
  - Scrollable regions are now keyboard-reachable (`tabIndex={0}`, WCAG 2.1.1 / axe
    `scrollable-region-focusable`) without becoming landmarks: the `Table` primitive's overflow
    wrapper, the `DataTable` horizontal scroll region, and the `ScrollArea` viewport.
  - `Calendar` selected day now keeps `text-primary-foreground` on its ghost `<button>` through
    hover/focus, fixing dark-label-on-blue insufficient contrast on the selected date
    (`color-contrast`).
  - `DataTable`'s built-in empty state renders its message as plain text (`titleAs="p"`) instead of
    an `<h3>`, so a "no rows" status never injects a stray heading into the page outline
    (`heading-order`).
- **`Select`/`DataSelect`** (searchable mode — `showSearch`/`loadOptions`) now forwards controlled
  `open`/`onOpenChange`, controlled `search`/`onSearchChange`, `readOnly`, `size`, a `filterOption`
  override for the default client-side filter, and custom `renderError`/`renderLoadMore` slots to
  the underlying `SearchSelect` engine — previously silently dropped. `readOnly` mirrors the
  Input/NumberInput contract (value shown + submittable, no new pick, clear affordance hidden).
  (#175)
- **`SelectTrigger`** accepts `showIndicator` (default `true`) — set `false` to omit the built-in
  chevron disclosure indicator from the DOM entirely (not a CSS hide), for specialized triggers
  (icon-only, etc.) that render their own affordance, without reaching for consumer descendant CSS.
  (#175)
- `AppShell` now OWNS an accessible mobile navigation drawer below `lg`: a hamburger trigger in the
  topbar opens a focus-trapped `Sheet` (Esc + overlay close, focus returns to the trigger). New
  props `mobileNav` (defaults to the `sidebar` node — pass a tailored menu, or `null` to opt out),
  `mobileNavLabel`, `mobileNavOpen` and `onMobileNavOpenChange`. Hiding the sidebar without a
  reachable alternative is no longer the shell's behavior (#165).
- `Sidebar` items support real links without a nested interactive element: `SidebarItemProp.href`
  renders the row as an `<a>`, and `renderItem` now merges its returned element as the row via Slot
  (return a router `<Link>`) — no more `<button>`-wrapped custom content (#165).
- `Pagination` gains `hideOnSinglePage` (default `true`): the bar is hidden for zero items and for a
  single page; set `false` to opt in on one page (e.g. to keep `showTotal` visible). `total === 0`
  is always hidden (#153).
- **`CardTitle`** accepts a semantic heading `level` (`1`–`4`, default `3` — unchanged) and an
  `as` override (`h1`–`h4`/`p`/`div`) so consumers keep a valid document outline
  (`h1 → h2 → h3`, no skipped levels) without changing the title's token-driven size. Use `as="p"`
  when the card title is a styled label rather than a section heading. (#154)
- **`EmptyState`** accepts `titleLevel` (`1`–`4`, default `3` — unchanged) and `titleAs`
  (`h1`–`h4`/`p`/`div`) for the same reason: pick the level for outline position, not size, and use
  `titleAs="p"` for a compact/section empty state inside a section that already owns its heading.
  Coordinated with the existing `variant` (`page`/`section`/`compact`) and `tone` API. (#154, #144)
- **`DataTable` `ColumnDef.ariaLabel`** — a visually-empty action/selection column keeps a
  screen-reader header (e.g. "Actions"/"Select") rendered as an `sr-only` label inside its `<th>`,
  clearing the axe `empty-table-header` violation. DataTable now **dev-warns** when a rendered
  `<th>` has neither visible nor accessible text. Official DataTable examples set `ariaLabel` on
  their action columns. (#155)
- Shared forwarding contract `src/lib/field-a11y.ts` (`FieldA11yProps`, `pickFieldA11y`,
  `pickGroupFieldA11y`, `resolveFieldA11y`, `mergeAriaIds`) so the FormField relationship is wired
  consistently, not reinvented per control.
- FormField integration test asserting the **computed** accessible name / description / error for
  every custom control (`form-field-contract.a11y.test.tsx`), plus a `docs/data-entry/form-field`
  example demonstrating the contract, error timing and async server-validation + recovery.
- **`Table` `scrollable` prop (default `true`).** A standalone `Table` keeps owning its
  keyboard-reachable horizontal-scroll wrapper; pass `scrollable={false}` when an ancestor already
  provides the scroll region so the table does not add a redundant NESTED scroll container + a
  duplicate keyboard tab stop. `DataTable` now sets this (its `.ui-data-table-scroll` owns the
  overflow + tab stop).
- **`LegalDocumentShell` — the long-form legal/policy document surface (#222).** Terms of service,
  privacy policy, DPA, cookie policy, SLA and EULA screens were hand-rolled per app on consumer-only
  `.legal-*` CSS; the shell now owns that behaviour and renders semantic `article` / `nav` /
  `section` landmarks with REAL `<a href="#…">` anchors. It ships a readable measure and
  top-aligned document geometry; a **sticky contents rail** at ≥`56rem` of the shell's OWN width
  (a container query, not a viewport media query — the `SplitPane` precedent, #165), degrading below
  that to a static compact block between the header and the first section; an `IntersectionObserver`
  **scroll spy** marking the section at the reading line with `aria-current="location"` plus a
  leading marker and a heavier weight (never colour-only, WCAG 1.4.1); **hash deep links**
  (`#section-id` on arrival selects that section, and activating an entry rewrites the hash with
  `history.replaceState`, so the Back button is never hijacked); a scroll offset via
  `scroll-margin-block-start: var(--legal-document-scroll-offset)` instead of JS arithmetic; focus
  handoff to the target `<section tabIndex={-1}>` (`preventScroll`) with a visible ring; and an
  instant jump under `prefers-reduced-motion: reduce`. API: `title` · `sections: { id, title,
content }[]` · `version` · `effectiveDate` (**ISO 8601** in, `Intl.DateTimeFormat` out, inside
  `<time dateTime>`) · `summary` · `contentsLabel` · `activeSection` / `defaultActiveSection` /
  `onActiveSectionChange` · `documentNavigation` · `footerAction` · `id` · `className`, with `ref`
  forwarded to the container-query scope root. ALL legal text stays consumer-owned. Exported from
  `@godxjp/ui/layout`, with a complete `--legal-document-*` tier
  (`src/tokens/components/legal-document.css`) for measure, column gap, contents-rail
  geometry/typography, header/meta/section rhythm, body line height, scroll offset and footer gap —
  chrome quiet by default per rule #44 (`--legal-document-toc-border` /
  `--legal-document-header-border` / `--legal-document-footer-border` default to `none`) and every
  colour knob a role mirror declared `initial` with its role default at the call site (contents →
  `--muted-foreground`, active → `--foreground` on `--accent`, marker → `--primary`, meta/summary →
  `--muted-foreground`). i18n `layout.legalDocumentShell.{contents,version,effectiveDate}` in
  en/vi/ja, docs fixtures at true 1440×900 / 1024×900 / 390×844 plus a long JA/EN/VI wrapping
  fixture, and MCP catalog + token entries.
- **`CompactBarTrend` — a DEPENDENCY-FREE compact bar trend for dashboard summary cards (#218).**
  `@godxjp/ui/charts` previously offered only the recharts-backed `BarChart`, so a consumer whose
  policy forbids screen implementers from adding dependencies (the DXS Platform SCR-201 admin
  dashboard) had no framework option and fell back to a page-local grid with inline height
  calculations. `CompactBarTrend` closes that gap: N category/value pairs rendered as token-sized
  CSS marks with **no `recharts` peer at all**, muted bars plus ONE emphasized "current" bar
  (`emphasizedIndex`, negative counts from the end), an `xs|sm|md|lg` plot-height tier (`xs` =
  dashboard summary-card density), an optional `footer` activity slot rendered outside the
  `role="img"` graphic, a built-in empty state and locale-aware `Intl.NumberFormat` values.
  Accessibility reuses the shared chart frame — a `<figure>` + visible `<figcaption>`, a
  `role="img"` plot named by a localized one-line summary, and a visually-hidden per-category value
  list wired through `aria-describedby` (WCAG 1.1.1) in which the emphasized bar is annotated, so
  the highlight is never colour-only (WCAG 1.4.1). The graphic holds no focusable element, so there
  is no dead tab stop and no keyboard trap. Exported from `@godxjp/ui/charts`;
  `CompactBarTrendProp`/`CompactBarTrendProps` registered in the prop registry; i18n keys
  `chart.summaryTrend` and `chart.trendCurrent` (en/vi/ja).
- **`--chart-trend-*` component tokens (#218)** — new tier file `src/tokens/components/chart.css`.
  Every dimension and every fill of `CompactBarTrend` is a public knob so a service theme matches
  its own design grid without page-local CSS (rule #45):
  `--chart-trend-plot-height{,-xs,-sm,-md,-lg}` (3.5 / 5 / 7.5 / 10rem),
  `--chart-trend-bar-{gap,radius,max-width,min-height}`, `--chart-trend-bar-background` +
  `--chart-trend-bar-background-alpha` (role mirror, default `hsl(var(--muted-foreground) / .75)` —
  clears the 3:1 non-text contrast floor), `--chart-trend-bar-emphasis-background` (default
  `hsl(var(--primary))`), `--chart-trend-baseline-border` (QUIET by default per rule #44 — a service
  opts INTO a baseline rule) and `--chart-trend-{tick-gap,tick-font-size,footer-gap}`. The
  colour/border knobs are declared `initial` with the role default at the call site, so a scoped
  `[data-tenant]` / `.dark` override of the role reaches them.
- **`@godxjp/ui/email` — email-safe design-token contract for transactional templates (#227).** A
  new framework-neutral, React-free, dependency-free subpath export that gives Blade/Twig/MJML
  templates the values HTML email actually needs: literal `#rrggbb` and `px`. Exports
  `EMAIL_COLORS` / `EMAIL_COLORS_DARK` (surface · background · foreground · muted · mutedForeground
  · border · primary · primaryForeground · focus · brand · brandForeground), `EMAIL_SHELL` (the
  480px card geometry, its content column, insets, radius and the 480×407 canonical-invitation
  reference height), `EMAIL_TYPOGRAPHY`, `EMAIL_CTA`, `EMAIL_FOOTER`, `EMAIL_FOCUS`,
  `EMAIL_MOBILE`, the aggregate `EMAIL_TOKENS` / `EMAIL_TOKENS_JSON`, plus the helpers `hslToHex()`
  and `emailInlineStyle()` (which refuses `var()`/`calc()` — neither survives an email client).
- **Canonical GoDX brand mark as email-safe markup (#227).** `EMAIL_BRAND_MARK` and
  `emailBrandMarkSvg()` / `emailBrandMarkDataUri()` / `emailBrandMarkTableHtml()` render the emerald
  capsule PLUS its internal glyph — the same artwork `<Logo mark="godx" />` paints, at the same
  32×32 viewBox and with byte-identical path data (locked by a test). Three deliveries, none with an
  external or relative asset dependency: inline `<svg>`, a `data:` URL for `<img src>`, and a
  bulletproof `<table>` fallback. The pill-only mark is now a test failure. Ships with `--email-*`
  component tokens (`src/tokens/components/email.css`) for the 480px shell geometry, the email type
  ramp, the primary-CTA dimensions/radius/typography, the legal-footer typography and link spacing,
  the focus width and the mobile padding/reflow values — all literal px (email clients resolve
  neither `var()` nor `rem`), each naming the web token it mirrors — plus `pnpm gen:email-tokens` /
  `pnpm check:email-token-sync` (`scripts/gen-email-tokens.mjs`), which generate
  `src/email/tokens.generated.ts` from `src/tokens/foundation.css` and
  `src/tokens/components/email.css` and fail if it goes stale. The HSL→hex conversion runs at module
  load, so there is no hex literal anywhere in `src/email/` and the email palette cannot drift from
  the web palette. Docs page `docs/foundation/email-tokens.tsx`
  (`/isolate/foundation-email-tokens`) renders the real specimen document in an iframe at 480px and
  at a narrow mobile width; MCP gains four `--email-*` token entries and a `transactional-email`
  pattern (aliases `email-template`, `email-tokens`, `blade-email`, `html-email`).
- **`Sidebar linkComponent` — the framework-router row contract (#213).** Pass only the link ELEMENT
  TYPE; the library keeps composing every row (16px icon slot · label · badge ·
  `data-active`/`aria-current` · the icon-only collapsed rail and its tooltip name) and hands it to
  the link as `SidebarLinkProp.children`. It threads through all four row shapes — top-level leaves,
  submenu children, collapsed-rail leaves and the collapsed flyout's `menuitem` entries. A group
  TRIGGER stays a `<button>` (WAI-ARIA APG disclosure: it owns `aria-expanded`), but its row
  composition is now library-owned too, so a group with a `badge` finally renders one. Rows without
  an `href` keep the `<button>` + `onSelect(id)` shape. Companions:
  **`createSidebarLink(Link, hrefProp?)`** (`@godxjp/ui/layout`), a dependency-free adapter for any
  router link (`createSidebarLink(Link, "to")` for React Router / TanStack Router,
  `createSidebarLink(Link)` for Next.js) that falls back to an inert
  `<a role="link" aria-disabled="true">` for a row with no destination — the explicit `role` is
  required because an `<a>` without `href` has no implicit role, which would make the collapsed
  rail's `aria-label` a prohibited attribute and leave the row unnamed; **`inertiaSidebarLink(Link)`**
  (`@godxjp/ui/inertia`), the same adapter pre-bound to Inertia's `<Link href>` with still zero
  dependency on `@inertiajs/react` (duck-typed `InertiaLinkLike`); and **`SidebarItem asChild`**, a
  Radix-style element swap for hand-composed rows
  (`<SidebarItem item={item} asChild><Link to="/x" /></SidebarItem>` — write NO children, the
  library injects the composed icon, label and badge). New public types `SidebarLinkProp` /
  `SidebarLinkComponentProp`, registered in `src/props/registry.ts`.
- **`Sidebar` nav icon and label foregrounds are separately themeable (#228)** — the rail used to
  paint one `hsl(var(--muted-foreground))` on `.sb-nav-item`, so the Lucide SVG and the label shared
  the same low-contrast colour and a service could only match the canonical shell's darker 16px nav
  icons with page-local CSS or by re-tinting every muted text globally. New component tokens in
  `src/tokens/components/sidebar.css`, all declared `initial` with the role default at the call
  site: `--sidebar-nav-item-foreground`, `--sidebar-nav-item-hover-foreground` and
  `--sidebar-nav-item-disabled-foreground` for the row/label (top-level **and** sub rows), and
  `--sidebar-nav-icon-foreground` plus `--sidebar-nav-icon-hover-foreground` /
  `--sidebar-nav-icon-active-foreground` / `--sidebar-nav-icon-disabled-foreground` for `.sb-icon`
  (expanded rows, group triggers and the collapsed rail). Every default is byte-identical to the
  previous rendering (icons fall back to `currentColor` = the row colour; each state falls back to
  the base icon knob), so setting `--sidebar-nav-icon-foreground: hsl(var(--foreground))` alone is
  enough to get canonical icons beside muted labels. Colour only — icon size stays
  `--sidebar-nav-icon-size` (16px) and row geometry stays `--sidebar-nav-item-height` (32px) /
  `--sidebar-nav-item-gap` (10px) / `--sidebar-nav-item-padding-x`; the active row keeps
  `--sidebar-item-active-background` / `--sidebar-item-active-foreground`.
- **`Sheet` — responsive drawer / detail-panel contract (#215).** `SheetContent` gains
  `responsive?: "auto" | "side" | "bottom"`. `"auto"` renders the desktop side panel above
  `--sheet-responsive-breakpoint-width` and the mobile bottom sheet at/below it, so ONE `<Sheet>`
  serves both viewports with no page-local `useMediaQuery`; the resolved presentation is published
  as `data-side` (and the requested mode as `data-responsive`) on the panel. Focus trap, Escape and
  focus restoration are unchanged — it is the same Radix Dialog in both presentations. New
  **`useSheetResponsiveMode(responsive?)`** (`@godxjp/ui/feedback`) exposes the same decision to a
  composite that must swap a desktop surface for a mobile sheet, returning `"side" | "bottom"` off
  the one themeable breakpoint. New tokens **`--sheet-responsive-breakpoint-width`** (default
  `48rem` / 768px — the library's canonical mobile line, matching `useIsMobile`; read off `:root` at
  runtime because a CSS `@media` cannot resolve a custom property, accepting `px`/`rem`/`em`) and
  **`--sheet-bottom-max-height`** (default `85dvh`, capping the responsive BOTTOM presentation only
  — a plain `side="bottom"` sheet keeps its content-sized height), in the new tier file
  `src/tokens/components/sheet.css`. New public types `SheetResponsiveProp` and `SheetPresentation`.
- **`OrgSwitcherOrganization.badge` + `.badgeLabel` (#213)** — a status/plan slot rendered
  end-aligned in the expanded trigger and in each menu row, hidden in the collapsed rail. Because
  the trigger's accessible name comes from `labels.trigger`, a supplied `badgeLabel` is announced as
  an `aria-describedby` description and the badge node itself is marked presentational (WCAG 1.1.1 /
  1.4.1); `badgeLabel` is also a search keyword in the menu. Exposed as
  `[data-slot="org-switcher-badge"]` for theming.
- **AppShell rail-width, top-bar and mobile-nav knobs (#213, #211).** The docked rail and the
  icon-only collapsed rail were hard-coded `grid-template-columns` literals, so a service designing
  on a different grid (the recurring 255px request) had to fork `.app-root`; they are now
  `--app-shell-sidebar-width` (default `16rem`) and `--app-shell-rail-width` (default `4rem`). The
  bar's inline padding and slot gap were raw `--space-*` values and are now `--app-shell-bar-inset`
  (`var(--space-4)`), `--app-shell-bar-inset-compact` (`var(--space-3)`, applied below the 900px
  breakpoint) and `--app-shell-bar-gap` (`var(--space-3)`). `--app-shell-mobile-nav-inset` (default
  `var(--space-1)`) owns the inline inset of the mobile drawer's scrollable nav body — a service
  rendering a custom `mobileNav` node that wants the full sheet chrome inset sets
  `--app-shell-mobile-nav-inset: var(--space-6)` once in its theme instead of patching
  `[data-slot="sheet-body"]:has(.sb-root)` in app CSS. Rendering is unchanged.
- **Standalone `<Topbar>` box knobs (#213)** — `--topbar-height` (`auto`), `--topbar-inset` (`0px`)
  and `--topbar-gap` (`var(--space-2)`). The defaults are the quiet ones, so rendering is
  byte-identical to before they existed (inside AppShell the `.app-topbar` grid row still owns the
  height and inset). A service that mounts `Topbar` directly on a page now sizes it from the theme
  instead of an app-local class. `--topbar-gap` is both the gap BETWEEN the start/center/end
  clusters and the gap INSIDE each, so one knob re-rhythms the whole bar; the #226 shrink contract
  (`start` clips, `center` yields first, `end` stays anchored inline-end) is untouched.
- **Per-overlay scrim share knobs (#215)** — `--dialog-overlay-alpha` (60%),
  `--sheet-overlay-alpha` (40%) and `--app-shell-mobile-nav-alpha` (40%): the share of the shared
  `--overlay-background` each surface's backdrop uses, so a slide-in drawer keeps washing the page
  more lightly than a modal dialog while a single token retints them all.
- **AuthShell `preset` — a named flow MEASURE (#217, #220).** `"default" | "device-authorization" |
"context-selection"` (default `"default"`) owns the auth card's max-width plus the desktop and
  mobile page gutters through component tokens, so a consumer never overrides
  `--auth-shell-card-max-width` (or forks an `.auth-shell--wide` class) to hit a canonical artboard.
  `"device-authorization"` is a 380px card at 1440/1024 with a 5px inline page gutter at 390 (card
  x=5px, width=380px) (#220); `"context-selection"` is a 25rem card on desktop/tablet, edge-to-edge
  on mobile, plus a tokenized rhythm between the intro, the choice card and the trailing "remember"
  row (#217). It is orthogonal to `variant` — presets are applied AFTER it, so
  `variant="canonical" preset="device-authorization"` keeps the canonical control density and
  heading size and only re-measures the page. Adds the public vocabulary type
  **`AuthShellPresetProp`** (exported from `@godxjp/ui/layout`, registered in
  `src/props/registry.ts` and the MCP prop-vocabulary catalog), the preset tokens
  `--auth-shell-device-{card-max-width,main-padding,main-padding-mobile}` and
  `--auth-shell-context-{card-max-width,main-padding,main-padding-mobile,card-stack-gap}`, and two
  column knobs per rule #45: `--auth-shell-main-align` (block alignment of the auth column, default
  `center`) and `--auth-shell-card-stack-gap` (gap between the card slot's direct sections, default
  `0px` — quiet by default per rule #44; presets opt in). Evidence frames
  `docs/layout/auth-shell-device.tsx` and `docs/layout/auth-shell-context.tsx` (the latter including
  the `Card` + `CardContent flush` + `ListRow as="li"` organisation-choice composition) cover
  1440×900 · 1024×900 · 390×844.
- **`AppSettingPicker compact` (#217)** — boolean, default `false`. Re-tiers the trigger box to the
  official `--control-height-sm` tier and drops the picker's owned per-kind width, so a LABELLED
  trigger hugs its value. This is the supported auth/legal-footer locale switch
  (`<AppSettingPicker kind="locale" appearance="labeled" compact />`) for when the square icon-only
  default reads as a stray button and the full labelled trigger is too tall; no effect on
  `appearance="inline"` (already chrome-less). Adds
  `--app-setting-picker-compact-{control-height,padding-x,gap,font-size}`.
- **`Logo wordmark` — the mark + wordmark LOCKUP in one element (#214).** Replaces the hand-rolled
  `<span className="inline-flex items-center gap-2"><Logo/><Text/></span>` that every shell header
  and auth brand bar was repeating (rules #45/#46). The lockup root takes `ref` / `className` /
  `...props`; the mark becomes decorative and the wordmark text carries the accessible name, so the
  pair is announced once (`label` overrides the lockup name when needed). Omitting `wordmark`
  renders exactly the previous bare-mark markup — byte-identical, fully backward compatible. The
  package still ships **no wordmark ARTWORK**: the wordmark is typeset in the design-system display
  face, and a real logotype drops in later as an inline `<svg>` passed to `wordmark` with no API
  change. New tokens
  `--logo-wordmark-{gap,font-size-xs,font-size-sm,font-size-md,font-size-lg,font-weight,letter-spacing,font-family,color}`;
  `--logo-wordmark-font-family` defaults at the call site to `--font-family-display` and
  `--logo-wordmark-color` to `hsl(var(--foreground))`, or to the `--success` identity role on the
  `mark="godx"` / `tone="success"` lockup — **never `--primary`**, so an action-colour re-theme can
  never recolour the brand and a consumer needs zero page CSS for logo colour.
- **`brand="dxs"` — THE canonical DXS preset (#214).** A new `AppBrand` / `APP_BRANDS` value
  (`<AppProvider brand="dxs">` → `<html data-brand="dxs">`) that, unlike the per-vertical brand
  tints, binds both the palette AND the canonical hosted-identity SURFACE contract, so every surface
  matches the canonical artboards with no page CSS:
  `--auth-shell-{control-height,heading-size,card-max-width,main-padding}` are re-pointed at the
  `--auth-shell-canonical-*` measures (36px controls, 22.5rem card, 16px page inset, 15px below
  30rem). It invents no colour and no geometry — the palette is the shipped GodX Navy ramp
  (identical to `data-brand="brand"`) and every auth value is a `var()` reference to tokens already
  declared in `tokens/components/shell.css`. Ships alongside **`src/theme/dxs.canonical.css`** for
  stylesheet-only apps with no provider (`@import "@godxjp/ui/theme/dxs.canonical.css";` instead of
  `@godxjp/ui/styles`), which mirrors the `data-brand="dxs"` block at `:root` and is pinned against
  drift by `src/tokens/__tests__/dxs-canonical-theme.test.ts`. The `src/theme/` CSS tree was already
  copied into `dist/` by `copy-styles.mjs` but had no entry in the export map, so no consumer could
  import it — a **`"./theme/*": "./dist/theme/*"`** package export is now declared.
- **`AuthFooterProp` / `AuthIdentityProp` are registered public types (#214)** — both moved out of
  local `interface`s in the component files into the prop registry
  (`src/props/components/layout.prop.ts` + `src/props/registry.ts`) and are exported from
  `@godxjp/ui/layout` and `@godxjp/ui/props/components` (the `*Props` aliases are kept for
  back-compat). Both now accept **`className`**.
- **`DataTable` `error` / `denied` / `onRetry` (#216)** — the two lifecycle states the list-page
  contract was missing. `error={isError}` renders a built-in localized destructive `EmptyState`
  inside the table grid announced with `role="alert"` (plus a Retry button when `onRetry` is given);
  `denied={status === 403}` renders a localized warning state announced politely with **no** retry,
  because repeating a 403 cannot succeed. Either prop also accepts a node that replaces the built-in
  copy. Precedence is `loading` > `denied` > `error` > `empty` > rows, so exactly one state shows
  and a page never needs its own alert/forbidden block around the table.
- **FilterBar / Toolbar `overflow="wrap" | "scroll"` (#216)** — the responsive overflow strategy.
  `wrap` (default, unchanged) stacks below 640px then wraps onto extra rows; `scroll` keeps one
  bounded row at ≥640px that scrolls inline with the clear-all action sticky at the inline end, so a
  filter-heavy list page with long JA/EN/VI labels never grows a three-row strip that pushes the
  table below the fold. Below 640px `scroll` still stacks — a 390px viewport never hides a filter
  behind an invisible horizontal scroll. New token `--filter-bar-scroll-padding-y`
  (`src/tokens/components/navigation.css`, default `var(--space-1)`) reserves the scrollbar gutter
  so the inline scrollbar never overlaps the controls (rule #45; set `0` on overlay-scrollbar
  platforms), and the new `FilterBarOverflowProp` vocabulary type is registered.
- **FilterBarGroup / ToolbarGroup `controlId` (#216)** — when the group wraps a single control, its
  visible caption is rendered as that control's real `<label htmlFor>`, so the filter is named by
  the text the user can see (WCAG 2.5.3 label-in-name / 1.3.1). Without it the caption named only
  the group wrapper and a bare `Select` under it was nameless to a screen reader (axe
  `select-name`).
- **Canonical settings-section composition (#216)** — `docs/showcase/settings-account-sections.tsx`
  (identity · preference rows · billing handoff · danger zone), registered in the preview showcase
  gallery and built entirely from existing primitives with **zero new components**, plus the MCP
  pattern `settings-section-rows` (aliases `settings-section`, `settings-row`, `danger-zone`,
  `billing-handoff`, `preferences-rows`, `account-identity`). Gate 0 verdict: COMPOSITION PATTERN
  (fails C2/C3/C4/C7) — a danger zone is `Card accent="destructive"` + `ListRow` +
  `AlertDialog challenge`, needing no new component and no new token.
- **#216 browser verification at 1440 / 1024 / 390, and the demos it was missing.** The acceptance
  matrix was driven in headless Chromium against the built preview, and three gaps it exposed are
  now closed. `docs/data-display/badge.tsx` gains a **Billing lifecycle** card rendering
  `trialing` / `past_due` / `incomplete` / `canceled` (filled + outline) — the keys whose missing
  translations shipped as raw `status.*` text were previously demoed by nothing, so the regression
  was invisible in the preview. `docs/data-display/data-table/index.tsx` gains the
  `error` **without** `onRetry` case, so "Retry appears only when the consumer supplies it" is a
  visible state and not just a prop note. `docs/showcase/settings-account-sections.tsx` label-language
  Select now also drives the app locale (`useAppLocale().setLocale`), so the library's own `t()`
  chrome — the canonical `StatusBadge` above all — follows the page instead of leaving an English
  page wearing a Vietnamese status pill. New tests codify the measured behaviour so the next run
  needs no browser: `badge-status-billing.test.tsx` (localized label + canonical tone for all four
  billing keys in en/ja/vi, and a raw-`status.`-prefix guard), a `role="alert"`-is-an-inner-wrapper
  assertion in `data-table-states.test.tsx`, and `filter-bar-overflow-geometry.test.ts` pinning the
  CSS rules behind the scroll strip (nowrap + `overflow-x: auto` + non-shrinking groups + the
  sticky inline-end clear-all, all gated at `min-width: 640px`).
- **`ServiceLauncherCard` unavailable-state token hooks (#219)** — supplying `disabledReason` now
  marks the tile `data-unavailable`, and the medallion reads two new role-mirror knobs,
  `--card-service-launcher-unavailable-icon-background` and
  `--card-service-launcher-unavailable-icon-foreground` (both declared `initial`, defaulting at the
  call site to `--muted` / `--muted-foreground`). A service that must not launch no longer renders a
  brand-live medallion, and a consumer never needs page-local CSS to dim one. `disabledReason`
  remains purely descriptive — it never disables the action, which stays the consumer's `Button`
  prop, so the component still infers no access state. Backed by
  `service-launcher-card-responsive.test.tsx`, which pins the canonical 3 → 2 → 1 ladder to
  `ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}` and its 40/48/64rem container breakpoints (so
  the package, not the page, owns the grid tracks), the overflow contract for long JA/EN/VI titles
  and unbreakable hostname runs, the dashed catalog-CTA surface, the 36px medallion's
  `--control-height-lg` derivation, the role-mirror `initial` rule and tab order across a disabled
  tile — plus `service-launcher-card.types.test.ts`, which pins the public export surface and
  asserts the props carry no `href`/`entitlement`/`available`-style access field.
- **Error surface (403 / 404 / 500 / 503) as a composition pattern (#221)** — the requested
  `ErrorSurface` component FAILS the Framework-Component Test (C2/C3/C4), so `@godxjp/ui` ships the
  missing geometry plus the canonical recipe instead of a page-shaped component: see
  `docs/layout/error-surface/` (overview + `index.md` contract + four real screens —
  `examples/application-403`, `application-404`, `system-500`, `system-503`) and the MCP
  `error-pages` pattern (aliases `error-surface`, `403`, `404`, `500`, `503`, `exception-page`,
  incl. the Inertia/SSR exception pages), which the `CenteredShell` and `EmptyState` catalog entries
  now point at. The missing geometry is **`CenteredShell` `align`** (`"start" | "center"`, default
  `"start"`): `align="center"` centres the content column in the `100dvh` shell, giving a
  SYSTEM-level standalone surface (500 / 503 error page, maintenance notice) package-owned
  viewport-centred geometry at 1440 / 1024 / 390 with no consumer `min-h-dvh`, flex CSS, media query
  or `className`, while overflowing content still scrolls from the top so a long localized message
  is never clipped. New tokens `--centered-shell-column-offset-block` (default `0`; `align="center"`
  flips it to `auto` — quiet default per rule #44, so the top-aligned flowing page shape is
  unchanged for every existing consumer) and `--empty-state-description-max-width` (default `28rem`,
  previously hard-coded, so a service or locale retunes the JA/EN/VI copy measure without forking
  `.ui-empty-state-description`), plus the `CenteredShellAlignProp` vocabulary type exported from
  `@godxjp/ui/layout` and `@godxjp/ui/props`. Tests:
  `src/components/layout/__tests__/error-surface-pattern.test.tsx` (shell preservation,
  exactly-one-action, request-ID + `Intl` maintenance window in en/ja/vi, heading order, focus) and
  `error-surface-pattern.a11y.test.tsx` (0 axe violations for all four statuses in both shells).
- **`MasterDetail` `collapseBelow` / `detailId` and a tokenized stacking threshold (#223)** —
  `collapseBelow` (`"sm" | "md" | "lg" | "xl" | false`) is the per-instance stacking threshold,
  reusing the shared `BreakpointProp` vocabulary (`sm` 40rem · `md` 48rem · `lg` 64rem · `xl` 80rem;
  `false` never stacks); omit it to inherit the theme token
  **`--master-detail-collapse-below`** (default `40rem`), measured against the composition's own
  inline size, so a service theme retunes the breakpoint once globally instead of forking the layout
  CSS (rule #45). `detailId` names the detail region so master controls can point at it with
  `aria-controls` and the app can move focus to the new detail after a selection. The MCP catalog
  now documents `--master-detail-rail-{compact,standard}`, `--master-detail-gap` and
  `--master-detail-collapse-below` (all previously missing) plus `rail` / `collapseBelow` /
  `detailId` and the measured 1440 / 1024 / 390 geometry.
- **`ListRow` `overflow` and `unread` (#224, #225).** `overflow` (`"truncate" | "wrap"`, default
  `"truncate"`) is semantic control over how a title/description longer than the row resolves;
  `wrap` renders multi-line text and applies `overflow-wrap: anywhere`, so an unbroken JA/EN/VI
  token can no longer widen the row (#224). `unread` (boolean, optional) is semantic read/unread
  state for notification rows, rendering a compact indicator dot in its own gutter with localized
  `sr-only` text ("Unread"/"Read", never colour alone — WCAG 1.4.1) plus the tokenized unread
  surface; omit the prop entirely for rows with no read state, and pass `false` for a read row so
  its title keeps the same optical axis (#225). New i18n keys `dataDisplay.listRow.unread` /
  `dataDisplay.listRow.read` in en/ja/vi, and new component tokens in
  `src/tokens/components/list-row.css`:
  `--list-row-body-min-width` (default `12rem` — the inline size the content column keeps before the
  trailing actions wrap to their own line, clamped `min(…, 100%)` at the call site so a narrow
  container is never widened by the knob), `--list-row-trailing-gap` (default `var(--space-2)`),
  `--list-row-read-background` (`initial`; documented default `transparent`),
  `--list-row-unread-background` (`initial`; documented default `hsl(var(--muted))` — `--muted`
  rather than `--accent` keeps the xs muted description line at WCAG AA on the emphasized surface,
  4.63:1 light / 5.47:1 dark vs 4.23:1 for `--accent`), `--list-row-indicator-color` (`initial`;
  documented default `hsl(var(--primary))`) and `--list-row-indicator-size` (default
  `var(--space-2)`). The three colour knobs are role mirrors: `initial` at `:root`, role default at
  the call site.
- **Preview contract ledger + CI gate (#163).** `preview/frame-coverage.ledger.json` now links every
  public export and compound subcomponent (273) to its `/frame` route and declares 14 contract
  dimensions per export — variants · tones · sizes · shapes · density · controlled/uncontrolled
  ownership · disabled/read-only/loading/empty/error/success · async retry/cancel/offline ·
  responsive · RTL · long/localized content · keyboard/focus · accessible name/description/error ·
  reduced motion/forced colors/200% zoom/coarse touch. Every cell is exactly one of `covered` (an
  executed case proves it), `untested` (**not a pass**) or `not-applicable` with a written reason;
  the schema is `frame-coverage.ledger.schema.json`. `pnpm gen:frame-coverage-ledger`
  (`scripts/gen-frame-coverage-ledger.mjs`) generates the ledger from the real public surface —
  component barrels, `component-api-manifest.json` and `component-case-evidence.json` — never a
  hand-list, with `--reset-baseline` re-minting the ratchet floor.
  `pnpm check:frame-coverage-ledger` (`scripts/check-frame-coverage-ledger.mjs`, wired into
  `check:frame-contracts`) fails for a public export with no frame, an unclassified dimension, a
  hand-written verdict no evidence supports, a deleted or unwired frame-runtime gate, and a growing
  geometry-overflow or axe baseline; strictness is **ratchet-based**, so the pre-existing UNTESTED
  backlog is recorded as a baseline and only regression fails the build.
  `mcp/src/data/frame-coverage.generated.ts` and the `get_frame_coverage` MCP tool expose it, and
  every `get_component` response now ends with a coverage block naming the UNTESTED dimensions, so a
  consuming agent can never mistake a happy-path example for a support claim.
  `docs/FRAME-COVERAGE-LEDGER.md` documents the ledger, the two promotion routes and the ratchet.
  The honest state at authoring time is 273 exports × 14 dimensions = 3822 cells: 6 covered · 2141
  UNTESTED · 1675 reasoned N/A (0.2%) — authoring the frame cases remains an epic; this change only
  makes the true state visible and non-regressible.
- **Screen-reader evidence infrastructure (#171)** — evidence record schema v3 for real
  VoiceOver/NVDA runs. `screen-reader-evidence.json` now encodes the seven owner cohorts named in
  #171 (`landmarks-page-structure`, `native-form-controls`, `selection-composites`, `overlays`,
  `navigation-composites`, `data-structures`, `live-async-feedback`), mapping 87 owners to exactly
  one cohort each, plus the per-cohort `requiredPhases` an announcement transcript must cover. A
  **reviewed not-applicable registry** (`policy.notApplicable`) records the attributed, reasoned
  waiver (`reason` ≥ 40 chars, `reviewedBy`, `reviewedIn`, `reviewedAt`) required before a
  static/decorative export may leave `screenReader: untested` as `not-applicable`.
  `audit-evidence/screen-reader/` is the drop directory for human-recorded AT speech artifacts, and
  `src/screen-reader-evidence.test.ts` pins the gate with 16 tests — including that the committed
  ledger still reports `screenReader.pass === 0`. No export was promoted: producing the transcripts
  requires a person driving VoiceOver on macOS and NVDA on Windows in `ja-JP` and `vi-VN`, and
  nothing here fabricates or infers one.
- **Font-bundle cascade regression test (#210)** — `src/styles/__tests__/font-bundle-cascade.test.ts`
  flattens the real `@import` graph in source order and asserts the **winning** `:root`
  `--font-sans-base` / `--font-sans-vi` declaration is the bundled M PLUS 2 stack (plus: `fonts.css`
  is imported after `base.css`, both declarations stay unlayered, the `@fontsource` imports match
  the documented faces, and `dist/styles/index.css` keeps the same order when a build is present).
- **`pnpm check:release-plan` — no-network release-transition guard (#230).**
  `scripts/check-release-command-plan.mjs` plans the next patch/minor/major release, asserts no
  publish precedes any gate, and packs the **post-bump** manifests to prove both artifacts carry the
  target version and compatibility fields. Wired into `.github/workflows/release-integrity.yml`,
  whose existing packed-artifact check only ever saw the pre-bump manifests. `node
scripts/release.mjs --metadata-plan` now also prints the ordered `commands` array alongside the
  packed metadata.

### Changed

- `Pagination` is now ONE horizontal row on desktop and never wraps — `.ui-pagination` drops
  `flex-wrap: wrap`; the page-number strip scrolls horizontally on overflow and the total label
  truncates. Use `simple` for the intentional compact mobile form (#153).
- `ResponsiveGrid` and `SplitPane` now OWN their query container (`container-type: inline-size`) and
  use container queries, so they respond to the width available to the component instead of the
  viewport or an undeclared ancestor `container-type`. `SplitPane`'s split threshold moved from a
  `1080px` viewport media query to a `48rem` container query; `ResponsiveGrid` thresholds are
  `40rem / 48rem / 64rem` container widths (#165).
- `Sidebar` group expansion is route-synchronized: a group opens whenever `activeId` moves to one of
  its children, revealing the newly-active child after navigation (was a mount-only `defaultOpen`)
  (#165).
- `AppSettingPicker` `appearance="labeled"` no longer forces `w-full` below `640px` — it hugs its
  content (`w-auto max-w-full`) on narrow screens and takes its per-kind fixed width from `sm` up, so
  it fits a topbar. Pass `className="w-full"` for a full-width form field (#165).
- **BEHAVIOUR CHANGE — `MasterDetail` now ships the canonical fluid-list + fixed-detail-rail
  composition (#223).** The first cut inverted the tracks: it pinned the MASTER to 300/320px and let
  the detail run fluid, which cannot express the 1fr/320px composition the Teams screen (SCR-110)
  asks for. A new controlled-vocabulary prop **`rail` (`"master" | "detail"`, default `"detail"`)**
  picks which region keeps the fixed track, so the DEFAULT track order is inverted relative to the
  previous behaviour; `rail="master"` restores the leading navigator rail. `master` stays first in
  DOM order either way, so the stacked (mobile) order is always list-then-detail. Changing the
  default is safe: `MasterDetail` has never been published (the `18.4.0` tarball predates it, see
  #229).
- **`MasterDetail`'s collapse breakpoint is a real token instead of a hard-coded `40rem` (#223).** A
  media/container query CONDITION cannot read a `var()`, so the responsive decision moved off
  `@container master-detail (min-width: 40rem)` and onto a flex-basis threshold
  (`calc((var(--master-detail-collapse-below) - 100%) * 999)`), where a `var()` DOES resolve. The
  semantics are unchanged — the threshold is measured against the composition's OWN inline size,
  never the viewport — but rule #45 now holds: a theme retunes it once globally and `collapseBelow`
  overrides it per instance. The component no longer wraps itself in a `container-type: inline-size`
  scope element, and the block is physical-property free (RTL flips with the writing direction).
  `MasterDetail` also wires the selection semantics it can honestly own: selection and keyboard
  behaviour stay with the caller's controls (only the caller knows whether the master is a listbox,
  a tablist or toggle buttons), but the detail region now takes `detailId` and carries
  `tabIndex={-1}`.
- **BEHAVIOUR CHANGE — `OrgSwitcher responsive="auto"` now flips popover → bottom Sheet at
  `--sheet-responsive-breakpoint-width` (768px default) instead of a hard-coded
  `(max-width: 390px)` (#215, #213).** Behaviour is unchanged at the acceptance viewports (1440/1024
  = popover, 390 = sheet), but between 391px and 768px the switcher now prefers the focus-trapped
  bottom sheet over a 16rem popover. The threshold is themeable for the first time;
  `--org-switcher-sheet-max-height` remains authoritative for that surface. `SheetContent` itself
  defaults to `responsive="side"`, so existing usage — including the AppShell mobile nav drawer,
  which must stay a leading-edge drawer at 390px — is byte-for-byte unaffected.
- **`Sidebar.renderItem` is deprecated in favour of `linkComponent` / `asChild` (#213).**
  `renderItem` handed the consumer a className plus active state and left the row CONTENT to them,
  so a `<Link>{item.label}</Link>` legitimately dropped every icon and badge — the reported
  production regression. It is still fully supported and still takes precedence over
  `linkComponent`, so upgrading is never a surprise. `SidebarRenderItemProp` now carries
  **`children`** (the library-composed row content), so an existing consumer that spreads `rowProps`
  onto its element gets the canonical row (icon + label + badge) back with no code change. The
  internal class names `sb-icon` / `sb-label` / `sb-badge` are NOT a public contract and no longer
  appear in any library doc or test as consumer-authored markup. Collapsed-flyout entries now render
  through the shared row composition too, so a submenu child's `badge` appears in the flyout and
  disabled children expose `aria-disabled`.
- **`ServiceLauncherCard` renders `disabledReason` above the action, as prose (#219).** The reason
  previously sat AFTER the launch button and inherited the mono metadata treatment. A disabled
  control announces nothing about _why_, so the explanation must precede it in DOM order (WCAG 2.2 ·
  1.3.2), and a localized JA/VI sentence must not be set in monospace. `metadata` (hostname · plan)
  remains the only mono line, driven by `--card-service-launcher-metadata-*`; the reason now uses
  the description prose knobs. The MCP catalog is corrected alongside it: every
  `--card-service-launcher-*` token was being documented with StatCard's medallion comment (the
  generator attributes the nearest preceding CSS comment), so the block is now commented per knob,
  and the entry documents that `ResponsiveGrid` owns the 3 → 2 → 1 layout, that `metadata` is
  machine identifiers only, and that the component exposes no entitlement/URL prop.
- **`Topbar` slots clip with `overflow: clip`, not `hidden` (#226).** `.ui-topbar-start` /
  `.ui-topbar-center` / `.ui-topbar-end` each clip their own overflow, so an over-long label is cut
  inside its cluster instead of spilling over a sibling. `clip` is deliberate: an `overflow: hidden`
  box is still a scroll container, so focusing a clipped control would scroll the slot and shove its
  leading content out of view. `overflow-clip-margin: var(--focus-ring-width)` keeps the focus ring
  of an edge control paintable (WCAG 2.4.11 / 2.4.13) — no new token, it reads the existing knob.
- **`ChartFrame` (the internal chart chrome) gained `size`, `footer` and an optional `height`
  (#218).** `height` is now optional so a CSS-drawn chart can size its plot from a token tier
  (`size` → `data-size` → `--*-plot-height`) instead of an inline pixel box, and `footer` renders
  below the plot but OUTSIDE the `role="img"` canvas so interactive footer content stays reachable.
  A `ref` is forwarded to the `<figure>`. The recharts-backed `LineChart` / `BarChart` / `AreaChart`
  / `PieChart` still pass a measured `height` and are unchanged.
- **`AuthFooter` keys its items by slot name instead of the array index (#214)** — toggling the
  optional `locale` slot no longer re-keys the following items and remounts the consumer's real link
  or locale control. Each item also carries
  `data-slot="auth-legal-footer-{product|terms|privacy|locale}"`.
- **Role-mirror fix for the identity mark (#214)** — `--logo-success-background`,
  `--logo-success-foreground` and `--logo-godx-color` are now declared `initial` at `:root` with the
  role default at the CALL SITE (`hsl(var(--logo-godx-color, var(--success)))`), per docs/TOKENS.md
  · "Role-mirror knobs MUST be `initial`". Same rendered default; a scoped `.dark` / `[data-tenant]`
  override of `--success` now actually reaches the identity mark instead of freezing at the `:root`
  value.
- `AuthShell`'s `main` now reads `justify-content: var(--auth-shell-main-align)` instead of a
  literal `center` (same rendered default), and `scripts/check-token-tiers.mjs` accepts `align` as a
  component-token property suffix and registers the `app-setting-picker` prefix under the
  `navigation` token file (#217, #220).
- **MCP catalog accuracy across the shell surfaces (#214, #217, #220).** `AuthShell` now documents
  `variant`, `preset`, `density` and `className` (previously only its three slots); `Logo` documents
  `wordmark` plus the already-shipping `mark` (`"glyph" | "godx"`, the canonical GoDX identity mark)
  and `tone` — their absence from the catalog is why consumers believed the identity mark was not
  exposed; `AppSettingPicker`'s `appearance` union is corrected to include `"inline"` and its
  kind-dependent default is spelled out; `AuthFooter` and `AuthIdentity` document `className`, their
  registered public types and their token knobs; `AppProvider.brand` documents the `"dxs"` value and
  the theme-file entry point. `mcp/src/data/tokens.ts` gains the `--logo-godx-*` /
  `--logo-wordmark-*` entries and a `data-brand="dxs"` preset entry; `src/test/theme-globals.ts`
  mirrors the new `dxs` palette for the story/preview toolbar; `docs/general/logo.tsx` gains a
  "Wordmark lockup" card (GoDX lockup, sized lockup, boxed-glyph lockup, `label` override).
- `.ui-centered-shell-column` reads `--centered-shell-column-offset-block` and
  `.ui-empty-state-description` reads `--empty-state-description-max-width`; both defaults preserve
  the previous rendering byte-for-byte (#221).
- **Documented the load-bearing CSS import order (#210).** `styles/fonts` MUST come **after**
  `styles/base` on the per-layer setup (same specificity → later import wins). Stated in
  `src/styles/index.css`, `src/styles/fonts.css`, `src/styles/base.css`, `src/tokens/foundation.css`,
  `README.md` and `docs/CUSTOMER-THEMING.md`, and shown in the per-layer import examples.
- **Corrected the bundled-face docs to match the code (#210).** The token docs claimed the opt-in
  `@godxjp/ui/styles/fonts` fills `--font-sans-base` with bundled **Noto Sans JP**; it actually sets
  **M PLUS 2** as the primary face (including the Vietnamese coverage) with **Noto Sans JP** as the
  CJK fallback. Fixed in `mcp/src/data/tokens.ts` (`--font-sans-base` and
  `--font-sans-{ja,ko,vi,zh-hans,zh-hant}`), `README.md` and `docs/CUSTOMER-THEMING.md`, which also
  now note the **v16 → v18 bundle change** (v16: Noto Sans JP + Montserrat; v18: M PLUS 2 + Noto
  Sans JP) so a consumer whose spec named the v16 faces can notice.
- `scripts/check-frame-coverage.mjs` accepts `--allow-missing-frames` (the default behaviour and its
  stdout contract are unchanged, so the #171 screen-reader gate is unaffected) and now reports
  `hasFrame` / `missingFrames`; `scripts/frame-coverage.mjs` reads the v2 ledger, rolling the 14
  dimensions up to the nine FRAME-COVERAGE-STANDARD axes, so `docs/FRAME-COVERAGE-REPORT.md` shows
  reasoned N/A instead of a uniform blank (#163).
- **The screen-reader evidence gate got materially stricter (#171).**
  `scripts/check-screen-reader-evidence.mjs` now additionally rejects: a `screenReader: pass` whose
  owner is not cohort-mapped; a record without `entryCommand` or a structured `steps[]` transcript
  (`phase` + `command` + `announced`); a passing record whose phases do not cover its cohort's
  `requiredPhases` (this is what makes error/help/required/invalid mandatory for form owners and
  loading/success/error/recovery mandatory for live/async owners); an unknown journey phase; a
  ledger `not-applicable` without a reviewed waiver; an orphan or pre-approved waiver; and any
  attempt to waive an interactive cohort owner. Baseline cohorts and their phases are hard-coded so
  policy can be extended but never weakened. `screen-reader-evidence.schema.json` is bumped to
  `schemaVersion: 3` with `policy.cohorts`, `policy.notApplicable`, `records[].entryCommand`,
  `records[].steps[]` and a shared `$defs.journeyPhase` enum, and
  `docs/SCREEN-READER-EVIDENCE.md` adds the cohort registry table, the reviewed-N/A rules, the v3
  record example and a "where the human contributor puts the run" checklist.

### Fixed

- **Destructive `Button` now clears WCAG AA contrast with margin, on every surface (#199).** The dark
  default sat at **4.54:1** — right on the AA floor — and its hover/active states drifted _lighter_
  (52%→58%→64% L), cutting contrast against the light label further; downstream (`gino-cloud`) axe
  measured a destructive action at 4.12:1. Two root causes fixed:
  - **Hover/active were an alpha fill** (`hsl(var(--destructive) / 0.9)`), which composites with
    whatever surface sits behind the button — a lighter `Card`/`AlertDialog` vs the page — so the
    effective colour and its contrast drifted per context. They now read the **solid**
    `--destructive-hover` / `--destructive-active` tokens (backdrop-independent), wired once in
    `control.css` (the duplicate Tailwind `hover:bg-destructive/90` was removed from `Button`).
  - **Dark fill palette retuned**: base 52%→48% L, on-fill text lifted to pure white, states now go
    _darker_ (48%→43%→38%) — default is now **5.52:1**, hover/active higher, both themes ≥5.5:1.
    Error TEXT on dark surfaces already uses `--text-error`, so this fill change does not touch it.
  - Guarded by a deterministic token test (`destructive-contrast.test.ts`, both themes ×
    default/hover/active) and `check:contrast` now audits the destructive Button + AlertDialog
    actions in **dark** theme too (it previously only covered default-theme text — the gap that let
    this slip).
- **`DataTable` no longer nests a redundant horizontal-scroll region (narrow-width geometry).**
  `DataTable` already owns a keyboard-reachable horizontal scroller (`.ui-data-table-scroll`), but
  the inner `Table` primitive was wrapping the `<table>` in a SECOND `overflow-auto` +
  `tabIndex={0}` box — a double scroll container and a duplicate keyboard tab stop for one table. At
  narrow widths (< `sm`, where the surface keeps its `min-w-[640px]`) that inner focusable extended
  past the viewport and was flagged as a clipped control by the frame-geometry sweep. `DataTable`
  now renders `<Table scrollable={false}>`, so a single scroll region owns the overflow. Fixes the
  `query-button-refetch` and `query-data-state` geometry regressions at 320/375/390.
- **AppShell demo topbar no longer overflows a narrow (mobile) viewport.** The `docs/layout`
  AppShell example composed a topbar whose entity switcher and search control could not shrink,
  forcing horizontal page scroll at 320/375/390. The example now demonstrates the correct
  responsive composition: the entity switcher collapses to an icon-only control (label truncates
  from `sm` up), the search control collapses to an icon-only trigger below `sm`, and the
  decorative brand mark is hidden on the narrowest widths — each keeping its accessible name via
  `aria-label`. Fixes the `layout-app-shell` geometry regression at 320/375/390.
- **`Tabs` fallback selection no longer targets a disabled first item (#175).** When Tabs owns the
  initial selection — no `value`, and no `defaultValue` naming an existing ENABLED item (missing,
  unknown, or itself disabled) — it now resolves to the first item that is NOT `disabled`, instead
  of blindly picking `items[0]`. Selects nothing when every item is disabled. Covered for both the
  uncontrolled (`defaultValue`) and controlled (`value`/`onValueChange` starting unset) shapes.
- **Horizontal `TabsList` no longer clips/overflows long localized labels in a narrow container
  (#175).** The list is now width-bounded (`min-w-0 max-w-full`) and scrolls its own horizontal
  overflow (hidden scrollbar, still swipeable/keyboard-reachable) instead of forcing its container
  wider or hiding overflow content. Orientation-gated (`data-[orientation=horizontal]:…`) so the
  vertical side-rail layout is unaffected.
- **`Tabs` / `TabsList` — the active tab can no longer be scrolled out of view by a responsive
  resize (#204).** The horizontal tab strip owns its overflow scroll (#175) but used to keep (or
  shift) its internal scroll offset across a 1440 → 1024 → 390 resize or route re-render, stranding
  the ACTIVE — typically FIRST — trigger completely outside the visible strip while it still
  reported `data-state="active"` / `aria-selected="true"`. `TabsList` now observes its own size
  (`ResizeObserver`) and its triggers' `data-state` (`MutationObserver`) and re-pins the trigger
  that must stay reachable with `scrollIntoView({ block: "nearest", inline: "nearest" })`. The
  correction only runs when the target is not already fully inside the scrollport, so it never
  fights a deliberate manual/touch scroll, a click, or arrow-key roving focus; under
  `activationMode="manual"` the FOCUSED trigger wins over the selected one so keyboard users are
  never stranded. Resize corrections are instant and `prefers-reduced-motion: reduce` downgrades
  selection-change corrections to an instant jump. Works for the first and last trigger, in RTL, and
  on the vertical rail — `inline: "nearest"` plus physical-rect geometry means there is no direction
  branch. A forwarded `ref` on `TabsList` is composed (not replaced), so object and callback refs
  keep receiving the tablist node.
- **FormField a11y contract no longer silently dropped by custom controls (#164).** Every
  data-entry control now accepts and FORWARDS the injected accessible name (`aria-labelledby`),
  description (`aria-describedby`) and validation (`aria-errormessage` / `aria-invalid` /
  `aria-required`) onto its real semantic focus target instead of ignoring them:
  - Focus-target controls forward the full contract onto the input/combobox trigger — `NumberInput`,
    `SearchInput`, `ColorPicker`, `DatePicker`, `MonthPicker`, `TimePicker`, `Cascader`,
    `TreeSelect` (Select/SearchSelect already did).
  - Popup controls expose the complete APG combobox relationship: `MonthPicker` is now a
    `role="combobox"` (matching Date/TimePicker); `Cascader` / `TreeSelect` / the pickers add
    `aria-haspopup` + `aria-controls` pointing at their popup.
  - Group controls expose group-level semantics: `RadioGroup` (`role="radiogroup"`) forwards the
    full validation set; `CheckboxGroup`, `DateRangePicker` / `MonthRangePicker` (two inputs) and
    `Transfer` are `role="group"` named by the FormField label, with the error folded into
    `aria-describedby` (widget-only `aria-invalid`/`aria-errormessage` are invalid on a group per
    ARIA 1.2). `Upload` forwards the label/description onto its native `<input type="file">`.
- **BEHAVIOUR CHANGE — the all-in-one `@godxjp/ui/styles` entry now actually applies the bundled
  fonts (#210).** The entry imported `styles/fonts.css` **before** `styles/base.css` →
  `tokens/base.css` → `tokens/foundation.css`. Both declare `--font-sans-base` on `:root` unlayered
  at identical specificity (0,1,0), so foundation's font-agnostic system stack always won and the
  bundled-font opt-in was permanently dead — every all-in-one consumer downloaded ~800 KB of
  `@font-face` (74% of the dev stylesheet, 85% of the production gzip) that could never render.
  `fonts.css` is now imported **after** the token layers, so an all-in-one consumer's type will
  visibly change to the bundled M PLUS 2 face. This is the unfinished half of #130.
- **AppShell's mobile drawer no longer double-pads the Sidebar (#211).** Below `lg` the drawer's
  `SheetBody` applied the generic 24px sheet chrome inset (`--sheet-pad-x`) on top of the `Sidebar`'s
  own 8px `--sidebar-nav-scroll-padding`, so every nav row sat ~32px from the drawer edge — on a
  ~293px drawer that crams the nav into a ~228px column. AppShell now renders `mobileNav` in a Sheet
  body whose inline inset is the new `--app-shell-mobile-nav-inset` token (default `var(--space-1)`
  = 4px), so the nav owns its own inset and stays edge-to-edge. The body's full-bleed
  `-mx-[var(--sheet-pad-x)]` pull-out and its vertical scroll padding are unchanged.
- **BEHAVIOUR CHANGE — one AppShell breakpoint, and the footer survives on mobile (#213).** A
  duplicate `@media (max-width: 768px)` block restructured `.app-root` a second time, disagreeing
  with the canonical 900px rule: between 768 and 900 the sidebar was hidden while the grid still
  reserved a sidebar track. It also dropped the `"footer"` grid area and set
  `.app-footer { display: none }` — silently deleting whatever a consumer passed to `AppShell`'s
  `footer` slot on a phone — and re-declared the grid rows with a `3rem` literal that overrode
  `--app-shell-bar-height` below 768px only. The shell now restructures at exactly one breakpoint
  (900px / 56.25rem, matching `max-[900px]:inline-flex` on the drawer trigger in `app-shell.tsx`),
  and the footer row and the bar-height token hold at every width — so a consumer-supplied footer is
  now VISIBLE on mobile where it previously vanished. The remaining 768px rule is topbar chip/search
  density only and no longer touches `.app-root`.
- **`--overlay-background` actually works now (#215).** It was documented (and released in v17) as
  "the single backdrop colour shared by EVERY overlay", but nothing consumed it — Dialog, Sheet and
  the AppShell mobile drawer each carried a private literal, and `TwoFactorSetup` re-stated
  `rgb(0 0 0 / .3)` at a higher specificity, so setting the token had **zero effect anywhere**. The
  three per-overlay knobs (`--dialog-overlay-background`, `--sheet-overlay-background`,
  `--app-shell-mobile-nav-background`) are now declared `initial` at `:root` with the default
  resolved at the CALL SITE as a share of `--overlay-background`, per the role-mirror rule in
  `docs/TOKENS.md` — so a scoped `[data-tenant]` / `.dark` override reaches the portaled overlay
  instead of freezing at `:root`. Every default is byte-identical (dialog `0.3`, sheet + drawer
  `0.2` black), and setting a `*-overlay-background` knob directly still wins outright. (Reaching a
  _portaled_ overlay under a `[data-tenant]` scope still requires the tenant attribute on the portal
  container, as documented in `docs/CUSTOMER-THEMING.md`.)
- **Overlay animations honour `prefers-reduced-motion` (#215, WCAG 2.3.3 / 2.2.2).** Dialog,
  AlertDialog, CommandPalette, Sheet and Popover enter/exit animations (fade + zoom + slide) were
  ungated. They are now killed under `prefers-reduced-motion: reduce` — the overlay still appears
  and disappears instantly, so the open/closed state stays unambiguous; only the motion is removed.
  The gate is deliberately **unlayered**: Tailwind v4 emits `animate-in` / `slide-in-from-*` into
  `@layer utilities`, which beats any rule inside `@layer components` regardless of specificity, so
  a gate written in the components layer is dead code. The pre-existing AppShell mobile-drawer gate
  had exactly that bug and is fixed the same way.
- **`Sidebar`'s collapsed rail and submenu group children never received `renderItem` at all
  (#213)** — a consumer's router `<Link>` silently reverted to a `<button>` + `onSelect` there. Both
  now take the router link via `linkComponent`.
- **`Sidebar` no longer crashes on an icon-less nav item (#228).** `SidebarItem` rendered `item.icon`
  unguarded, so untyped/API-driven data without an `icon` threw
  `Element type is invalid… got: undefined` and took down the whole shell (all four row shapes: leaf
  button, `href` anchor, group trigger, collapsed rail). The icon slot is now always rendered and
  only fills in when an icon is supplied, so the row keeps its 32px height, 10px icon↔label gap and
  label column. `icon` remains **required** in `SidebarItemProp` — this is a runtime safety net, not
  an API loosening.
- **`Topbar` — explicit shrink contract, no horizontal document overflow (#226).** Intrinsic-width
  slot content (a long tenant/brand string in `start`, a fixed-width search trigger in `center`) no
  longer pushes the `end` cluster past the bar and out of the viewport, and no longer leaks a
  horizontal document scroll. `.ui-topbar` gains `max-width: 100%` so the bar never exceeds its
  `AppShell` grid/flex allocation; `.ui-topbar-start` is pinned to `flex: 0 1 auto` and absorbs the
  overflow while `.ui-topbar-center` (`flex-basis: 0`) yields its whole box first; `.ui-topbar-end`
  is now `flex: 0 0 auto` so the locale picker / user menu keep their natural width anchored
  inline-end. Verified in a headless browser at 390 / 1024 / 1440 px (LTR + RTL):
  `document.documentElement.scrollWidth === clientWidth` and the last `end` control stays fully
  inside the bar at every width; the 1440 px desktop composition and the 390 px drawer composition
  are unchanged.
- **`ListRow` no longer forces page-root overflow (#224)** with a long title plus two trailing
  Buttons at responsive viewports. The row is now `min-inline-size: 0` + `flex-wrap: wrap`, the
  content column shrinks to `min(var(--list-row-body-min-width), 100%)` (logical `min-inline-size`,
  replacing the physical `min-width: 0`), and the trailing slot wraps (`flex-wrap: wrap`,
  `max-inline-size: 100%`, `gap: var(--list-row-trailing-gap)`) instead of pushing the row wider
  than its container. Keyboard order and visible focus are unchanged (DOM order, no tabindex).
  Consumers must no longer add one-off `min-width`/wrapping CSS.
- **`StatusBadge` billing statuses had no localized label (#216).** `trialing`, `past_due`,
  `incomplete` and `canceled` are in the shared `STATUS_MAP` but were missing from `en`/`ja`/`vi`,
  so `<StatusBadge status="trialing" />` rendered the raw i18n key. Labels added in all three
  locales.
- **Release: no publish can outrun the coordinated bump or an MCP gate (#230).**
  `scripts/release.mjs` is now a thin executor — the entire side-effecting command sequence is
  produced by pure, exportable planners in `scripts/release-core.mjs` (`planReleaseCommands` /
  `releaseCommandForStep` / `assertReleaseCommandPlan` / `assertPreflightOrder`), and the step
  machine itself runs through `createReleaseRuntime`, whose only effects are two injected primitives
  (`run` / `capture`). The coordinated target version plus **both** compatibility fields
  (`godxUiMcp`, `godxUiCompatibility`) are written first, then `verify:release`, MCP
  install/build/test, lockstep and the packed manifests of **both** tarballs are verified at that
  target version — every one of them before the first `npm publish`. A publish descriptor is refused
  outright unless it names a tarball produced by the preflight pack, and `npm version` can no longer
  appear in a plan at all.
- **`AuthShell`'s compact block-padding knob now actually reaches `CardContent` (#232).**
  `--auth-shell-card-padding-block-compact` was documented as the public knob for the canonical
  Login card's height, but it was wired only to `--card-space-body-y` — the header↔body gap — while
  the rendered body took BOTH of its block edges (and its inline column) from the single
  `--card-space-inset`. Setting the knob therefore made the card marginally _taller_ instead of
  shorter, and a headerless (`solo`) body ignored it entirely: measured on the official build,
  `--auth-shell-card-padding-block-compact: 14px` left `[data-slot="card-content"]` computing
  `padding: 24px`. Platform had to bridge it with a consumer selector on `[data-slot="card-content"]`
  — precisely the fork rules #44/#45 exist to prevent. The two card axes are now separate knobs:
  `--card-space-inset` is inline-only, and the new **`--card-space-shell-y`** owns every block shell
  edge (a plain header's top, a `solo` body's top, the terminal slot's bottom). It is declared
  `initial`, so its default re-resolves at the CALL SITE to `--card-space-inset` — every existing
  card, including `density="tight|cozy"` (which re-declares it `initial` so an explicit per-instance
  density still beats an ambient shell override), renders byte-identically. On the compact auth card
  the three axes are now bound one-to-one: `--auth-shell-compact-card-inset` → inline column,
  `--auth-shell-card-padding-block-compact` → `--card-space-shell-y`, and the new
  `--auth-shell-card-body-gap-compact` → `--card-space-body-y` (the header↔body gap the block knob
  used to be mis-wired to, kept at its 12px rhythm). Measured in headless Chromium at 1440×900 and
  390×844, identical at both: default `12px 24px 24px` before and after (card 279.5px); with the
  knob at 14px `12px 24px 24px` → `12px 24px 14px` (card 281.5px → 259.5px); with the knob at 14px
  and the inset at 20px `14px 20px 20px` → `12px 20px 14px`; a `solo` body with the knob at 14px
  `24px` → `14px 24px`. Consumers can drop the bridge selector.

- **Token-owned bounded `MasterDetail` rail + a 390px inline `PageContainer` header (#231)** — two
  responsive contracts a consumer could previously only reach with local CSS. `MasterDetail` gains
  `masterViewport?: "auto" | "compact" | "standard"` (default `"auto"`, i.e. today's unbounded
  behaviour, and `auto` deliberately matches NO selector in the stylesheet). The presets cap the
  master region's block size from the new semantic tokens
  `--master-detail-master-viewport-compact` (20rem/320px) and `-standard` (28rem/448px) and scroll
  the collection INSIDE the region; `--master-detail-master-viewport-inset` (default `--space-1`)
  reserves focus-ring room, because an overflow container clips both axes, and doubles as the
  region's `scroll-padding-block`. The bounded region carries `tabIndex={0}` so it is reachable and
  scrollable by keyboard alone (WCAG 2.1.1 / axe `scrollable-region-focusable`) while staying an
  ordinary tab stop — Tab and Shift+Tab walk straight through it. `PageContainer` gains
  `headerLayout?: "stack" | "responsive-inline"` (default `"stack"` — the historical arrangement,
  which likewise matches no selector). Below the 640px step `responsive-inline` keeps `extra`
  beside the title band at the new `--page-header-extra-measure` (11rem/176px) and lets the
  title/subtitle wrap into what is left; at ≥640px both arrangements resolve to the identical row,
  so nothing changes on desktop. No raw pixel props exist by design — a service theme retunes the
  tokens. Measured in headless Chromium against the built preview: with a 60-row collection at
  390px the master is 2,156px tall and the detail lands at y=3,244 on `auto`, versus a 320px master
  (scrollHeight 2,164, `overflow-y: auto`) and the detail at y=1,408 on `compact` — 1,836px higher —
  and 448px/y=1,536 on `standard`; at 1440 and 1024 the master is 2,156px on `auto` and 320/448px
  bounded, with the 320px detail rail unmoved at x=1096/x=680. Focusing the bounded region and
  pressing PageDown then ArrowDown scrolled it 0 → 273 → 313px, and Tab moved focus out to the
  first row. For the header at 390px, `stack` puts the search at x=16/y=header+81 (a full-width
  358px line under the subtitle) while `responsive-inline` puts it at x=198/y=header, 176px wide;
  RTL mirrors it to x=16 with the title band at x=204, and both frames report 0 axe violations at
  1440/1024/390.

## [17.0.0] - 2026-07-12

> **BREAKING (major):** `Flex` now defaults to `direction="row"` (was `col`). Any `<Flex>` that
> relied on the implicit vertical stack must add `direction="col"`. See the migration note below.
> This release also ships as one train with `@godxjp/ui-mcp@17.0.0` (release-lockstep, #140).

### Changed

- **BREAKING:** `Flex` now defaults to the CSS-standard `row`. Existing implicit vertical uses must
  migrate to `direction="col"`; omit `direction` only when a row is intended.
- `DataState` distinguishes disabled/unstarted queries from active loading through `fetchStatus`,
  adds a `prerequisite` slot, and no longer enables generic Retry by default.
- `DataState` / `Alert.QueryError` now classify errors by cause (`classifyQueryError`): Retry is
  offered only for transient/network/5xx failures; a 401/expired token routes to session renewal
  via the new `DataState` `onAuthError` prop (and `Alert.QueryError` `onAuthAction`); 403/404/422
  present a cause-aware message with no blind retry. The user-facing detail is now a localized,
  cause-specific message — the raw backend/token/stack text is no longer shown by default (pass a
  custom `errorRenderer` for a domain-specific message).
- `DataState` preserves existing content during a background refetch (with a polite `sr-only` busy
  status) instead of flashing the skeleton over resolved data.
- Static data-driven `Select` disables itself when it has no options, preventing blank popovers.
- Async data-driven `Select` (`loadOptions`) now treats loading / no-options / error as distinct
  states: a rejected loader no longer leaks an unhandled promise rejection nor masquerades as
  "no results" — it shows its own error affordance, and the empty/error rows render as a disabled
  option row (never a blank surface). The open panel carries `aria-busy` while fetching (gh#138).

  **Migration:** consumers that relied on `DataState`/`Alert.QueryError` always showing a Retry
  button or the raw error message must opt in per cause — set `showRetry` (transient still retries
  automatically), pass `onAuthError` for 401 recovery, or supply `errorRenderer` to render a
  bespoke message. Disabled queries (`enabled:false`) should be given a `prerequisite` slot.

### Added

- **`check:no-consumer-coupling` CI gate** — enforces that `@godxjp/ui` stays an international,
  consumer-agnostic library: it fails when library source (`src/`, `mcp/`, `docs/`, stories,
  examples) names a specific downstream consumer/product (`kintai`, `tempo`, `tiximax`,
  `umbrella`, `chat-prod`, …) or consumer infra domain (`id.godx.jp`, `apigw.godx.jp`,
  `<slug>-prod.godx.jp`, …), and when component source bakes in a locale/currency/timezone
  literal (`'¥'`, `'JPY'`, `'ja-JP'`, `'Asia/Tokyo'`) that should go through Intl/CLDR. The
  library's OWN identity (`@godxjp/ui`, `godxjp-ui`) is never flagged. Pre-existing references
  (origin-design lineage comments + customer-theming showcases) are recorded in a per-file
  baseline (`scripts/no-consumer-coupling.baseline.json`) so the gate only fails on NEW coupling;
  the baseline may only shrink. Wired into `verify` / `verify:release`.
- **`Reveal`** (general) — the official entrance-motion primitive (staggered fade-up). Reads the DS
  motion tokens (`--duration-slow`, `--ease-emphasized`, `--reveal-distance`, the new
  `--reveal-stagger-step`), staggers via a controlled ordinal `delay` (`0..6`, an index into the
  motion ladder — never a raw ms), supports `asChild`, and honours `prefers-reduced-motion` (no
  animation, content stays visible, no layout shift). Replaces consumers' hand-rolled
  `@keyframes` + `.app-reveal`/`.d1..d6`.
- **`AuthShell`** (layout) — centred auth/login page shell: `brand` bar (top) + centred `main`
  (card) + `footer`, over `min-h-dvh`, scoping the comfortable control tier (44px, WCAG touch floor)
  and a larger auth heading via `--auth-shell-*` tokens. Replaces consumers' `.auth-shell-*` /
  `.ui-auth-scope` classes.
- `--reveal-stagger-step` (60ms) primitive motion token — one step of the `Reveal` stagger ladder.
- `EmptyState` `tone` prop (`muted` | `success` | `warning` | `destructive` | `info`, default
  `muted`) — tints the icon medallion from the matching role token, so a consumer never hand-rolls a
  `.ui-success-state` class to scope `--empty-state-icon-*`.
- `classifyQueryError` / `isRetryableQueryError` (exported from `@godxjp/ui/query`) — cause
  classification (`auth` | `forbidden` | `notFound` | `validation` | `transient` | `unknown`) for
  branching custom error UIs and structured logging.
- `AppSettingPicker` `appearance` prop (`"labeled" | "icon"`, default `"labeled"`). `appearance="icon"`
  is a supported, first-class icon-only topbar trigger (e.g. a globe locale switcher): it structurally
  drops the value text and the picker's owned trigger width, hides the chevron, and squares the box to
  the density-aware `--control-height` tap target — no descendant-selector CSS overrides. The localized
  `aria-label` is always applied, so an icon-only trigger can never ship without an accessible name;
  menu options keep their localized names (gh#148).
- `EmptyState` `page`, `section`, and `compact` variants for context-appropriate visual weight.
- `Select` / `SearchSelect` `errorMessage` prop — overrides the localized default shown when an
  async `loadOptions` rejects. Paired with a new `dataEntry.searchSelect.error` i18n key (en/vi/ja).
- MCP patterns for responsive settings, async/table state, organization membership/invitations,
  and signed-in account recovery, plus lockstep UI compatibility metadata.
- **Release lockstep (#140):** `@godxjp/ui` and `@godxjp/ui-mcp` now carry mutual compatibility
  metadata (`godxUiMcp` ↔ `godxUiCompatibility`) enforced by `check:mcp-lockstep` (wired into
  `verify` / `verify:release` and a new `release-integrity` CI workflow that also re-checks the
  packed tarball manifests). `scripts/release.mjs` refuses a ui-only bump, refreshes the compat
  fields, and fail-closes on the lockstep check before committing. New `check_compatibility` MCP
  tool returns an actionable match/mismatch verdict for a consumer's installed `@godxjp/ui` version.

### Fixed

- Runtime visual audit (`scripts/visual-audit.mjs`) is now compatible with the current Playwright +
  `@axe-core/playwright` (gh#139). It creates an explicit `browser.newContext()` → `context.newPage()`
  (older `browser.newPage()` threw _"Please use browser.newContext()"_), guarantees page/context/browser
  cleanup on both success and failure, and `--format json` **always** emits valid JSON — even on
  bootstrap failure (missing peers, no URL, browser won't launch) — with a `status` (`ok`·`partial`·
  `error`) that separates infrastructure `errors[]` from product `findings[]`, so a tool failure can
  never be misread as "zero violations". The tested peer range is documented in the README and the MCP
  `list_visual_checks` command (`playwright >=1.55 <2`, `@axe-core/playwright >=4.10 <5`,
  `axe-core >=4.10 <5`). Adds `pnpm check:visual-audit` — a CI smoke test that serves a fixture page
  tripping all five runtime rule families and asserts each executes (Chromium launch, context, Axe
  injection) — wired into `verify:release`.

## [16.7.2] - 2026-06-30

### Fixed

- **Components now work in Next.js App Router Server Components** (gh#128). The compiled `dist`
  shipped no `"use client"` directive, so importing a client component into the RSC server graph
  (e.g. an SSG page that also exports `generateMetadata` and therefore can't be `"use client"`
  itself) failed `next build` with `TypeError: createContext is not a function` — `i18n/use-translation`
  runs `createContext` at module top-level and `Button` calls the `useTranslation` hook. The build
  now stamps `"use client"` onto every client module in `dist` (the `tsup` build is `bundle: false`,
  so dist mirrors src 1:1; a new `scripts/add-use-client.mjs` post-build step detects client modules
  from source — `createContext` / hook calls / client-only deps, plus `.tsx` wrappers that render a
  client child — and prepends the directive). `import { Button } from "@godxjp/ui/..."` now works
  directly inside a Server Component, like shadcn/MUI/Radix; no consumer `'use client'` boundary
  shim needed. Pure modules (`lib/utils`'s `cn`, `lib/datetime`, `props/**`, tokens) and `.ts`
  re-export barrels stay SERVER, so their non-component exports remain usable from an RSC. Guarded by
  `check:use-client` in `verify:release`.

## [16.7.1] - 2026-06-30

### Added

- **`--button-radius` control token** (gh#124). The button corner radius was locked to the shared
  `--control-radius` (`shape="default"`), so a brand theme could not give inputs and buttons
  different radii. `--button-radius` (default `var(--radius-md)`, preserving the historical look)
  makes the button radius themeable INDEPENDENTLY of inputs/controls.
- **`.ui-control` / `.ui-control-multiline` surface tokens** — `--control-font-size`
  (default `var(--font-size-base)`), `--control-border-width` (default `1px`), `--control-shadow`
  (default `var(--shadow-xs)`). Font size, border width and resting shadow of every control surface
  are now themeable in one place instead of each component hard-coding Tailwind utilities.

### Changed

- **Form controls honor `--control-radius`.** `Input`/`PasswordInput`, the Select/Cascader/TreeSelect
  trigger (`controlTriggerClass`), `Textarea` (`controlMultilineClass`), `controlFieldClass`, and the
  Date/Month range pickers used hard-coded `rounded-md` / `rounded-lg` and so ignored the
  `--control-radius` knob. They now use `rounded-[var(--control-radius)]`. Defaults are unchanged
  (`--radius-lg === var(--radius) === --control-radius`); `Input` shifts from `--radius-md` to
  `--control-radius` so all bordered controls share one themeable radius.
- `.ui-control` now drives border width + resting shadow from the new tokens; the redundant inline
  `border` / `shadow-xs` / `px-3` / `py-1` / `text-sm` utilities were dropped from `Input`.

## [16.7.0] - 2026-06-29

### Added

- **`Input` / `PasswordInput` `leadingIcon` (prefix slot)** (gh#119). Only a `trailingIcon` slot
  existed, and `PasswordInput`'s trailing slot is the built-in reveal toggle — so a leading mail /
  lock affordance (the common auth pattern) was impossible. `leadingIcon` adds a decorative
  (`aria-hidden`, `pointer-events-none`) start slot with `ps-9` padding that coexists with
  `trailingIcon` and `allowClear`; `PasswordInput` inherits it (lock leading + eye trailing).
- **`Badge` brand `primary` tone** (gh#120). A SOFT brand pill (`border-primary/30 bg-primary/10`
  with the new AA-strong `text-primary-strong`), the dashboard "role pill". Scoped to `BadgeTone`
  so the shared status-only `ToneProp` (Alert/Dialog/Sheet) is unchanged; a SOLID brand fill stays
  on `variant="default"`.
- **`Heading` `weight` prop** (gh#121). Render a semantic, emphasised `<h1..h4>` at `bold` without
  dropping to `Text weight="bold"`. Defaults to `medium` (no visual regression); the heading-scoped
  weight selectors outrank the base heading rule.
- **Brand spotlight — `.ui-brand-glow` utility + `--brand-glow*` tokens** (gh#122). A token-driven
  radial brand halo for hero / auth backdrops, replacing a hand-authored `radial-gradient`. Apply to
  an `aria-hidden` layer; decorative (`pointer-events:none`); retint (`--brand-glow-color`), soften
  (`--brand-glow-alpha`), resize (`--brand-glow-size`) or reposition (`--brand-glow-position`) with
  no markup change.
- **AA-strong brand text token `--text-primary` → `text-primary-strong`** (`--color-primary-strong`),
  completing the `text-*-strong` family. Plain `text-primary` on the soft primary tint is only
  4.04:1 in light; the strong token clears WCAG AA (6.06:1 light · 6.08:1 dark).

## [16.6.0] - 2026-06-29

### Fixed

- **Scoped role overrides now reach EVERY component token (the `:root` freeze bug).** A component
  token that pre-resolved a role at `:root` — e.g. `--card-background: var(--card)`,
  `--table-header-background: hsl(var(--muted))`, `--checkbox-checked-background: hsl(var(--primary))`,
  `--avatar-background`, `--sidebar-item-active-*`, the timeline/tree/progress/slider/switch fills,
  the stat-card medallion, `--focus-ring-color: var(--ring)` … — **froze at the `:root` value**: CSS
  substitutes the `var()` at the declaring element, so a scoped `[data-tenant]`/`.dark` override of
  the _role_ (`--card`, `--muted`, `--primary`, `--ring`) never reached the component token. This
  silently broke token-only re-theming for every component; it only became _visible_ under a DARK
  scoped theme (a frozen light card under white text → invisible), which is why earlier light
  re-themes never caught it. Each such token is now a **quiet opt-in knob** declared `initial`, with
  the role default moved to the call site as `var(--knob, <role>)` — so the default re-resolves live
  under any scope while an explicit theme override of the knob still wins. ~33 tokens across card /
  table / control / data-display / feedback / list-row / navigation / shell / foundation. All
  default-theme output is byte-identical (verified); scoped dark/brand themes now recolour correctly.
  The new `check:contrast` route `/showcase/futurelastic-web` (a fully DARK token-only brand) is the
  regression guard.

### Added

- **FUTURELASTIC dark-website showcase** (`/showcase/futurelastic-web`) — a token-only rebuild of a
  second Claude Design handoff, deliberately the opposite of the admin/light work: dark-mode default,
  gold-on-Urushi (Kiniro), Sora display 80px + Be Vietnam Pro body, hero/CTA gold glow, 6-col bento,
  stats band, footer. Built from real primitives + a `[data-tenant="futurelastic"]` token block only —
  **zero new framework components** (every marketing section fails the Framework-Component Test → it is
  composition). Exists to prove the token model reproduces a wholly different DARK brand from
  configuration alone, and it surfaced the `:root` freeze bug above.

## [16.5.0] - 2026-06-29

### Fixed

- **Coloured status TEXT now clears WCAG AA on white.** The light wa-iro semantics (若竹 success,
  山吹 warning, 群青 info) failed AA 4.5:1 as small coloured text (a `StatCard` delta, an outline
  `Badge` label, an `Alert` title). New darker `--text-{success,warning,info,error}` tokens (light
  on the dark theme) drive a `text-{success,warning,info,error}-strong` utility; the status TEXT now
  reads those while the badge/bar/icon FILLS keep the brighter role colour. Gated by `check:contrast`
  on the default-theme pages too.
- **Outline/ghost `Button` text could vanish on a dark scoped region.** `.ui-button--outline` /
  `--ghost` never set their own text colour, so they inherited `body`'s computed dark colour and went
  near-invisible on an on-navy hero/region (contrast ~1.1:1). They now set
  `color: hsl(var(--foreground))` explicitly, so the label always reads the scoped foreground.
- **Table header text could go invisible when a brand set a dark `--secondary`.** The header band was
  `background: --secondary` + `color: --muted-foreground` (independent), so a navy-secondary brand got
  dark text on a dark band. The band is now decoupled into `--table-header-background` /
  `--table-header-foreground` (defaults `--muted` / `--muted-foreground` — `--secondary` == `--muted`
  in the default theme, so byte-identical), themed together to keep contrast.

### Added

- **`check:contrast` — a browser-rendered WCAG 2.2 AA text-contrast gate** (`scripts/check-contrast.mjs`,
  wired into `verify:release`). jsdom/axe-in-vitest can't see colour, so dark-on-dark scoped-region
  bugs slipped every static check; this renders pages in Chromium, computes the effective background
  behind every text node, and fails below 4.5:1 (3:1 for large text). Logotypes (`[data-logotype]`)
  and disabled text are exempt (WCAG). Skips gracefully where no browser is available. (Surfaced — and
  these now pass — the outline-button and table-header bugs above.)
- **Composition pattern vs framework component — a hard decision gate.** New
  `docs/COMPOSITION-VS-COMPONENT.md` defines the two concepts and the **Framework-Component Test**
  (7 criteria, all must pass) that now gates every `src/components/` addition: it is **Gate 0** of the
  `godxjp-ui-component` skill and **cardinal rule #46** in CLAUDE.md. Marketing Hero/Navbar/Footer,
  page layouts and icon medallions FAIL the test → they are compositions built from existing
  primitives + tokens, never framework components.
- **Marketing display-type + dual-font tier (opt-in, enterprise defaults unchanged).** `--font-size-3xl/
-4xl/-5xl` (wired to `text-3xl/-4xl/-5xl` utilities via `--font-size-display` + a bolder ramp),
  `--font-weight-black` (800), and a dual-font split — `--font-family-display` (headings) +
  `--font-family-body` (prose), both defaulting to `--font-family-sans`. Lets a marketing surface
  reach a bold landing-page look from tokens; the dxs-kintai admin scale stays small by design.
- **`Sidebar` main nav-item active is themeable** — `--sidebar-item-active-background` /
  `--sidebar-item-active-foreground` (defaults = the hover look), so a service brands the selected
  row (e.g. a gold tint + gold text on a navy sidebar) without forking CSS.
- **`StatCard` gains an optional `icon` medallion** (see its own entry above).
- **Two TIXIMAX showcases proving 100% token-fidelity from a Claude Design** — `tiximax-portal`
  (admin portal: navy sidebar via role-scoping, gold CTA + glow, stat medallions) and
  `tiximax-website` (marketing landing: navy hero + gold glow, services/steps/routes, CTA, footer) —
  both rebuilt from token configuration + real primitives only, no new framework components.

- **Component colour-extensibility slots — every component is now token-themeable, no new colour
  codes.** A repo-wide audit found surfaces whose colour was baked or only role-default; each now
  reads a token so a service retints/glows/tints/gradients it from the token layer alone (opt-in,
  quiet by default, reads existing semantic roles). All defaults are byte-identical — verified in a
  browser. Highlights:
  - **Opt-in depth slots** (default invisible): `--card-glow` + `--card-tint`, `--dialog-content-glow`
    (raised dialog/sheet panel), `--avatar-tint`, brand glow layered on floating menus
    (context-menu / menubar / navigation-menu content), and `--sidebar-gradient` / `--topbar-gradient`
    brand-chrome washes.
  - **Tokenised role-colours** (default = the previous value, so appearance is unchanged): the
    checked/on fills (`--checkbox-checked-background`, `--switch-checked-background`,
    `--toggle-on-background`, `--slider-track-background`, `--slider-range-background`); table row
    states (`--table-row-striped/hover/selected-background`); `--progress-track-background` /
    `--progress-fill-background`; timeline accents (`--timeline-dot-done/current-background`,
    `--timeline-line-completed-background`); `--tree-item-active-border/-background`;
    `--avatar-background`; `--skeleton-background`; `--empty-state-icon-foreground/-tint`;
    `--menubar-item-hover-background/-foreground`; `--sidebar-item-active-color/-tint`.
  - The token-tier guard now accepts `glow` / `tint` / `gradient` as component-token property
    suffixes. See `docs/roadmap/color-extensibility.md` for the full map (implemented slots +
    the prop-tier roadmap for states still set via a fixed `tone`/`variant` vocabulary).

### Changed

- **Scoped / multi-tenant theming now works for colours and radius.** The `@theme` block in
  `styles/index.css` is now `@theme inline`, so Tailwind inlines each expression (e.g.
  `hsl(var(--primary))`) directly into every colour/radius utility instead of freezing it as
  `var(--color-primary)` computed once at `:root`. A scoped `[data-tenant]{ --primary: … }` override
  now re-resolves at the element, so `bg-primary` and friends retint inside the subtree. Single-brand
  `:root` theming is unchanged, and the `--color-*` / `--radius-*` vars are still emitted for any
  code reading them directly. (See `docs/CUSTOMER-THEMING.md` for the scoped caveats.)
- **Every focus ring is now token-driven.** All `:focus-visible` / `:focus-within` rings across
  controls, the shell, data-entry and data-display read `--focus-ring-color` (and
  `--focus-ring-width`) directly, so one override retints/resizes them all — even scoped under
  `[data-tenant]`. Default appearance is unchanged.
- **The modal scrim is now a single token.** Dialog, AlertDialog, Sheet and Drawer backdrops read
  the shared `--overlay-background` (was a baked `rgb(0 0 0 / .5)` / `bg-black/50`).

### Added

- **Global brand-depth tokens — all opt-in, all quiet by default** (cardinal rules #44/#45), so a
  service configures them from the token layer with no component change:
  - `--shadow-glow` — a coloured glow halo layered on the primary CTA's resting shadow (default
    invisible).
  - `--focus-ring-color` / `--focus-ring-width` — the hue and thickness of every keyboard-focus
    ring.
  - `--gradient-hero` / `--gradient-glow` / `--gradient-brand` — opt-in decorative fills (default
    `none`); `--gradient-hero` paints the `PageContainer` header, `--gradient-glow` the `AppShell`
    content area.
  - `--card-shadow` — resting elevation for every `Card` (default `none`; set to e.g.
    `var(--shadow-sm)` to lift all cards).
  - `--overlay-background` — the shared scrim colour for all overlays.

## [16.4.0] - 2026-06-28

### Changed

- **Default sans font is now Noto Sans JP; the Vietnamese locale uses Montserrat.** The bundled
  `@fontsource/m-plus-2` is replaced by `@fontsource/noto-sans-jp` (default, JA + Latin) and
  `@fontsource/montserrat` (incl. its `vietnamese` subset). `--font-family-sans` leads with Noto
  Sans JP; a `:root:lang(vi)` rule in `styles/index.css` swaps it to Montserrat. AppProvider now
  reflects the locale on `<html lang>` (previously only `dir`), which drives the swap — so a
  `vi` app renders Montserrat (with Noto Sans JP retained as the JP fallback), every other locale
  renders Noto Sans JP. The browser only downloads the subset files the rendered text needs.

### Added

- **`Descriptions` gains a `layout` prop** (`"vertical" | "horizontal"`, default `vertical` — no
  change to existing usages). `horizontal` places the label BESIDE the value in a token-aligned
  label column (the detail-row look, mirroring `<Form layout>`), tunable via the new
  `--descriptions-label-width` token. `dt`/`dd` semantics are preserved in both layouts.

## [16.2.2] - 2026-06-27

### Added

- **`<Table>` now sets `data-slot="table"`** on its root (its `<th>`/`<td>` already had
  `table-head`/`table-cell` slots — the root was the lone slotless element). The card
  header-above-flush-table rule now targets `[data-slot="table"]` instead of the raw `table`
  element, matching the data-slot convention used everywhere else.
- **Detailed Card spacing-token docs** — each `--card-space-*` token now carries an individual,
  themeable description (surfaced via the MCP `get_tokens`), plus a "Border-aware vertical padding"
  section in `docs/TOKENS.md` and token guidance in the Card MCP entry explaining the
  divided-band (`--card-space-divided-y`) vs plain-flow padding model and `--card-accent-rail-width`.

### Fixed

- **A header above a flush full-bleed table had no bottom gap.** A non-banded `CardHeader` zeroes
  its own bottom padding and leans on the body's top padding for the gap — but a `CardContent flush`
  with a `<table>` zeroes that too, so the title/subtitle butted directly against the table header
  row (a big inset above the title, ~0 below the subtitle). The header now supplies its own bottom
  gap (`--card-space-body-y`) in that case, matching the top inset for a balanced header block.

### Added

- **`--card-space-divided-y` token** — one border-aware knob for the vertical padding of a Card
  section that carries a divider border (a `banded` header, a `separated` footer). A divided band
  reads as its own region, so it pads SYMMETRICALLY top+bottom — distinct from a plain header that
  flows into the body (top inset, no bottom). The banded header and separated footer now share this
  token, so a theme tunes the band rhythm in one place instead of forking per-slot CSS.

### Fixed

- **A `banded` header below a `CardCover` lost its symmetric padding.** The cover rule forced
  `padding-top: --card-space-body-y` on any header under the media, which combined with the banded
  band's `--card-space-divided-y` bottom to give an uneven 16/8 band. The cover top-gap now applies
  only to NON-banded headers, so a banded header stays a symmetric divider band wherever it sits.

### Fixed

- **Card accent stripe was a 1px hairline instead of the 6px token.** The Card applied a Tailwind
  `border` utility (utilities layer) whose `border-left-width:1px` beat the components-layer
  `[data-accent]` rail-width rule, so only the accent COLOUR showed (a thin blue line). The base
  border width now lives in the components-layer CSS, so the `--card-accent-rail-width` (6px)
  override wins — while a consumer `className="border-2"` still overrides it as before.
- **In-panel search boxes double-bordered.** `Cascader`/`TreeSelect` wrapped `CommandInput` (which
  already draws one bottom separator + inline padding) in an extra `border-b p-2` box, and
  `SearchSelect` used a fully-bordered `Input` inside the dropdown. All three now render the search
  field FLUSH — one bottom separator, no nested box, tighter padding.

### Added

- **`Input` gains a `trailingIcon` prop** that encapsulates the "one trailing icon at a time"
  rule: pass a trailing affordance (e.g. a calendar/clock popover trigger) and, when `allowClear`
  is on and the field holds a value, the clear ✕ REPLACES that icon — never both. This is now the
  shared mechanism `DatePicker`/`TimePicker` use for their open trigger.

### Changed

- **Every clearable picker/combobox now shows ONE trailing icon, not two.** Previously a filled
  `DatePicker`/`TimePicker`/`DateRangePicker`/`MonthPicker`/`MonthRangePicker`/`Cascader`/
  `SearchSelect` rendered the clear ✕ AND the calendar/clock/chevron side by side. Now the clear ✕
  replaces the trigger icon while a value is set; the field itself (click / ArrowDown) still opens
  the panel, and the trigger icon returns when the field is empty. `DatePicker`/`TimePicker` were
  refactored onto the new `Input.trailingIcon`; the others apply the same rule inline.

### Removed

- **BREAKING — removed `TimeInput`** (and the `TimeInputProps` type + the `@godxjp/ui/data-entry`
  export). It duplicated `TimePicker`, which already wraps the same typeable canonical `HH:mm`
  `<input>` and adds the scroll-column popover. Migrate
  `<TimeInput value … onValueChange … step={15} />` →
  `<TimePicker value … onValueChange … minuteStep={15} />` (the `step` prop becomes `minuteStep`).

### Fixed

- **`TimePicker` showed two trailing icons at once.** When a value was set it rendered BOTH a clear
  (×) and the clock trigger side by side (`pe-16`). Now a single trailing slot: the clear replaces
  the clock when there is a value (the field itself / ArrowDown still opens the panel), and the
  clock returns when empty (`pe-10`). The popover anchors to the field via `PopoverAnchor`.
- **Menu separators rendered as tall gray blocks.** `.ui-context-menu-content > div` (specificity
  0,1,1) was bundled into the item-sizing rule, so it overrode the `.ui-context-menu-separator`
  (0,1,0) `height:1px` — the separator filled its 2rem item box with the border colour. The same
  catch-all also squashed `ContextMenuRadioGroup`. Removed the `> div` selector (every menu part
  already carries its own class). DropdownMenu/Select use the `h-px` utility and were unaffected.
- **`SkeletonTable` double-bordered inside a flush `CardContent`.** It kept its own border + radius
  while its real-data counterpart `DataTable` (`.ui-data-table-surface`) is stripped to borderless
  in `[data-flush]`. Added the matching flush rule for `.ui-skeleton-table` so the loading
  placeholder and the table it swaps for sit identically (the Card supplies the single border).

## [15.0.1] - 2026-06-27

### Fixed

- **`.ui-stack-xs` was a row, not a column.** Unlike `.ui-stack-sm/md/lg`, the xs size only set
  `display:flex` + `gap` and never `flex-direction:column`, so every `gap="xs"` stack (`Stack`,
  `ToolbarGroup`) laid out horizontally. CJK `ToolbarGroup` labels (ステータス, 会計期間…) got
  squeezed and wrapped vertically. Added the missing `flex-direction:column`. (`Flex` was
  unaffected — it uses `.ui-flex-gap-*`, gap-only.)
- **ResizablePanel docs/examples passed numeric sizes that render as PIXELS.** In
  react-resizable-panels v4 a bare `number` is pixels and a `string` is the unit, so
  `defaultSize={35}` produced a 35px sliver instead of 35%. Switched the example pages
  (`docs/layout/resizable-panel`, `docs/showcase/table-master-detail`) to percentage strings
  (`defaultSize="35%"`) and corrected the MCP catalog prop types/usage (`string | number`,
  number = px) so consumers are told the v4 rule.
- **Pagination page-size `Select` rendered full-width.** `SelectTrigger`'s baked `w-full`
  (utilities layer) beat the `.ui-pagination-size-trigger` width (components layer); the trigger
  now also carries `w-[var(--pagination-size-width)]` so tailwind-merge drops `w-full`.
- **Dead CSS removed:** the orphaned `.ui-filter-bar/.ui-filter-group/.ui-filter-label/
.ui-filter-clear` aliases left over from the FilterBar→Toolbar rename (no references remained).

## [15.0.0]

### Removed

- **BREAKING — removed `DataGrid` and the `@godxjp/ui/data-grid` subpath.** Its full TanStack
  feature set has been merged into the one `DataTable` (see Changed). Migrate
  `import { DataGrid } from "@godxjp/ui/data-grid"` → `import { DataTable } from "@godxjp/ui/data-display"`
  and rewrite the compound parts (`DataGrid.Toolbar/.Search/.ViewOptions/.DensityToggle/.BulkActions/.Content/.Pagination`)
  to `DataTable.*`. Columns move from TanStack `ColumnDef` (`accessorKey`/`cell`/`meta.label`) to the
  lean `ColumnDef` (`key`/`header`/`render`/`sortable`/`enableHiding`).
- **BREAKING — removed `DataTable` (+ `ColumnDef`/`Density`) from the `@godxjp/ui/admin` barrel.**
  `DataTable` is now TanStack-powered, so re-exporting it from the runtime-neutral root/admin barrel
  would leak `@tanstack/react-table` into the core (check-core-isolation). Import it from
  `@godxjp/ui/data-display` instead.
- **BREAKING — removed `Logo`.** It overlapped `Avatar` (both render a glyph in a box); use `Avatar` for entity/brand marks.

### Changed

- **BREAKING — `DataTable` is now the one TanStack-powered table** (the former `DataGrid` merged in).
  It keeps the lean `data` + `columns` (lean `ColumnDef`) API for the common case — the existing
  `<DataTable data columns … />` usages are unchanged — and adds the full grid chrome as compound
  parts: `DataTable.Search` (global filter), `DataTable.ViewOptions` (column show/hide), and a
  numbered page-size form of `DataTable.Pagination` (`pageSizeOptions`, distinct from the existing
  cursor `cursor`/`hasMore`/`onChange` form), alongside the existing
  `Toolbar/SelectAll/BulkActions/DensityToggle/Content`. Sorting/filtering/visibility/pagination/
  selection are now driven by `@tanstack/react-table` internally — client-side by default, or
  server-side via the `sort`/`globalFilter`/`pagination`/`columnVisibility` state + `manual*` flags.
  `DataTable.BulkActions` now also accepts a `(count) => node` render-prop (the former `DataGrid`
  form) in addition to ReactNode children. Two minor behaviour changes: a `sortable` column with NO
  controlled `sort`/`onSortChange` now sorts CLIENT-SIDE (was a no-op); the default `density` step is
  unchanged (compact) for the lean path. `@tanstack/react-table` moved from an optional peer to a
  direct dependency.
- **BREAKING — `Topbar` is now a PURE SLOT bar; the baked chrome is gone.** The library was
  dictating header CONTENT (a product-switcher chip with an always-on dropdown caret, a search box,
  a notification bell, a sidebar toggle, a tweaks button) — which is the consumer's job, and the
  source of the "dead dropdown with nothing to choose" and every app's header looking different.
  `Topbar` now exposes only `start` / `center` / `end` (+ `children` escape hatch) and owns ONLY the
  bar layout. Compose the brand (`Avatar`), sidebar toggle, search trigger, settings pickers
  (`AppSettingPicker`), notifications and user menu yourself and drop them into a slot — a control
  exists ONLY because you placed it. Removed props: `product`, `project`, `productMenu`, `projectMenu`,
  `projectPlaceholder`, `onProductOpen`, `onProjectOpen`, `onSearchOpen`, `onTweaksOpen`, `collapsed`,
  `onToggleCollapsed`, `rightSlot`, `unread`, `searchPlaceholder`, `onNotificationsOpen`, `user`; and
  the `TopbarProduct`/`TopbarProject` types. `AppShell` (already slot-based) is unchanged; `Sidebar`'s
  brand header now renders its dropdown caret ONLY when `onProductClick` is wired (use the `brand`
  slot for a fully custom header).

### Added

- **`DataTable.Search` / `DataTable.ViewOptions` and numbered `DataTable.Pagination`** — the merged
  former-`DataGrid` chrome, now on the one `DataTable`. New optional column field `enableHiding`
  (default true) lists a column in the `ViewOptions` "set view" menu; set false to keep a key/actions
  column always visible. New optional props `globalFilter`/`onGlobalFilterChange`,
  `pagination`/`onPaginationChange`/`rowCount`, `columnVisibility`/`onColumnVisibilityChange`, and
  `manualSorting`/`manualFiltering`/`manualPagination` for server-driven grids.
- **`ListRow` — single-line entity-row surface for short lists inside a Card** (#113). Leading
  (icon/Avatar) · title/description · trailing action, with tokenized border/radius/padding
  (`--list-row-*`) and a quiet auto divider between stacked rows (last row leaves the Card border).
  Replaces the `flex items-center justify-between border-b py-3` hand-roll repeated across account
  pages (sessions / API tokens / linked accounts / passkeys / MFA / invitations) — DataTable is too
  heavy for a 2–8 item list and a Card-per-row would be card-in-card. Use in `<CardContent flush>`.
- **Motion token tier** (#112) — `--duration-{fast,base,slow}` (150/250/500ms),
  `--ease-{standard,emphasized,decelerate,accelerate}`, and `--reveal-distance` (10px) in the
  foundation tier, so enter/transition animations read a token instead of a hard-coded `0.5s` /
  `cubic-bezier(0.32,0.72,0,1)` / `translateY(10px)` (cardinal rule #2 — tokens, not literals).
  A service retunes motion globally by overriding these; consumers honour `prefers-reduced-motion`
  at the call site.
- **`Button` `fullWidth` prop** (#111) — spans the container (`width:100%`) instead of sizing to
  content, so stacked auth / dialog-footer actions use the prop form instead of `className="w-full"`
  (cardinal rule #42: props before utilities). Sets `data-full-width` for styling hooks.
- **Agent forcing-kit — the godxjp-ui workflow is now enforced by the harness, not the agent's goodwill.**
  Installing `@godxjp/ui` auto-registers the `godx-ui` MCP in the consumer's `.mcp.json`
  (`scripts/postinstall.mjs`, non-destructive, skipped in CI / the library's own repo). `npx
@godxjp/ui init-agent` scaffolds the full kit: a Claude Code **PostToolUse hook**
  (`scripts/audit-hook.mjs`) that runs the static audit on every `.tsx` Write/Edit and feeds the
  findings straight back to the agent (it cannot skip the audit), a **SessionStart** hook that
  injects the workflow mandate (`.claude/godxjp-ui-workflow.md`), and the optional pre-commit/CI
  snippets. New \`bin\` (\`godxjp-ui\`) exposes \`init-agent\` / \`audit\` / \`visual-audit\`. The static
  audit now accepts file paths (incl. absolute) so the per-edit hook can target one file.
- **New audit rule \`bare-control-needs-formfield\`** (warn) — catches a bare \`<Label>\`/\`<label>\`
  paired with a text control that skipped \`<FormField>\` (the cramped-login-form failure mode that
  previously passed the audit when it used capitalized \`<Input>\` instead of raw \`<input>\`). Cites
  WCAG 1.3.1 / 3.3.2 + cardinal rule 227.
- **Runtime VISUAL audit (\`scripts/visual-audit.mjs\`) — Playwright + axe-core over the running app.**
  The counterpart to the static source audit: drives a real browser and catches what regex can't —
  axe-core WCAG/ARIA violations (incl. colour contrast), target size < 24×24 (WCAG 2.5.8), the OKLCH
  chroma of a rendered accent (dxs-kintai 渋み ≤ 0.18), emoji that reached the DOM (Unicode UTS #51),
  and a mis-laid-out notification banner (Alert anatomy). Warnings by default; `--strict` for a CI
  gate. `playwright` + `@axe-core/playwright` are OPTIONAL peer deps (the static audit and the library
  stay browser-free). Decision logic is a pure, unit-tested module (`scripts/visual-audit-rules.mjs`).
  Surfaced by the new MCP **`list_visual_checks`** tool (kept separate from the static
  `list_audit_rules` so neither tool — nor the dependency footprint — gets heavy).
- **Local UI-audit now enforces international a11y/i18n/RTL standards (warnings, non-blocking).**
  `scripts/ui-audit.mjs` gained 10 standards-cited rules so a consumer agent can self-correct
  BEFORE a visual review: `no-emoji-in-ui` / `no-emoji-flag` (Unicode UTS #51, ISO 3166-1,
  `Intl.DisplayNames`), `no-physical-direction` (W3C CSS Logical Properties — use `ms-/me-/ps-/pe-`,
  `start-/end-`, `text-start/end`), `icon-button-needs-name` / `img-needs-alt` / `no-positive-tabindex`
  / `hand-rolled-close-glyph` (WCAG 2.2 + WAI-ARIA APG), `hardcoded-currency` (ISO 4217,
  `Intl.NumberFormat`), `raw-intl-date` (ISO 8601 + IANA tz, `Intl.DateTimeFormat`), and
  `no-em-dash-in-copy` (dxs-kintai typography). Each finding prints the `standard:` it enforces;
  a new `--rules` flag prints the rule catalog as JSON (the single source of truth).
- **MCP `list_audit_rules` tool** surfaces the audit catalog (id · severity · category · standard ·
  fix + the run command) so an agent knows what the local audit checks and that it should run it
  before any visual pass. Backed by `mcp/src/data/audit-rules.ts`, kept in sync with the CLI by the
  new `scripts/check-audit-sync.mjs` guard (`pnpm check:audit-sync`, wired into `verify`).
- **Anti-AI-tells**: added `Emoji in product UI`, `Oversaturated brand accent`, and
  `Stacked notification banner (misplaced alert controls)`; the `Alert` catalog entry now states its
  fixed anatomy (single leading tone icon · `Alert.Actions` trailing-right · `onDismiss` × top-right
  · one horizontal row, never a vertical stack).

### Fixed

- **`Text`/`Heading` `truncate` now ellipsises inside a flex row without the consumer adding
  `min-w-0`** (#114) — the truncate rule was missing `min-width: 0`, so a `<Text truncate>` flex
  child still pushed past its track. The documented flex-truncate idiom now works from the prop alone.
- **FormField collapsed to its content width inside a flex column (short inputs).**
  `.ui-form-field` carried `align-self: start` (to keep fields top-aligned across a
  `ResponsiveGrid` row) but no explicit inline size. In a grid parent that only affects the
  block axis, so width filled via the column. But the `<Form>` container itself is a flex
  column (`.ui-form`), and any `<Flex direction="col">` is too — there `align-self` governs the
  **inline** axis, so a field shrank to its widest content (a helper-less `Input` collapsed to
  its ~20ch default, e.g. login forms rendering "ngắn tũn" half-width inputs). Fixed by giving
  `.ui-form-field` `inline-size: 100%`, mirroring Ant Design's Form.Item (vertical → width:100%):
  a field now fills its container in **any** parent — `<Form>`, a `ResponsiveGrid` cell, a bare
  flex column, or a plain block — while `layout="inline"` stays content-width (compact,
  side-by-side). `align-self: start` is retained for block-axis row top-alignment.

- **Alert: bare `AlertTitle` + `AlertDescription` split into side-by-side columns at ≥sm.**
  `alert-body` unconditionally switched to `flex-direction: row; justify-content: space-between`
  at the sm breakpoint — a layout meant only for pushing `AlertActions` to the end — so the
  canonical catalog example, `AlertQueryError`, and the docs page all rendered the title in a
  narrow left column with the description floating right. The row (now a `text | actions` grid)
  only activates via `:has(> [data-slot="alert-actions"])`; without actions the body always
  stacks. Catalog usage notes updated to match. (#106)
- **npm package: component utility classes were never emitted in consumers.** `styles/index.css`
  declared `@source "../**/*.{tsx,ts}"`, but the published package ships compiled JS only — the
  glob matched nothing, so Tailwind dropped every utility referenced solely inside library
  components (unstyled/transparent popovers and selects; an opened `Select` froze the whole page
  because the Radix scroll-lock's `pointer-events-auto` escape hatch was missing). The glob now
  also scans `.js`, which resolves to the package's own `dist` when installed from npm. Consumers
  no longer need the `@source ".../node_modules/@godxjp/ui/dist"` workaround.

### Changed

- `PageContainer` header no longer draws a bottom divider by default. The rule was hard-coded
  (`border-bottom: 1px solid`) with no off switch short of `variant="ghost"`. It is now driven
  by the new semantic token `--page-header-divider` (default `none`); a service theme opts back
  in with `--page-header-divider: 1px solid hsl(var(--border));`. `variant="ghost"` still forces
  it off regardless of the token.
- `PageContainer` header vertical rhythm is now balanced: the header's bottom pad is the new
  semantic token `--page-header-pad-bottom`, defaulting to
  `calc(--space-page-active-y − --space-section-active)` so the title→body distance equals the
  page's top padding (24/24 instead of the old 24 above / 32 below when there is no subtitle).
- Horizontal `Form` label geometry is theme-tunable: new component tokens `--form-label-width`
  (default `max-content`; previously only reachable via the `labelWidth` prop) and
  `--form-label-gap` (default 16px; previously hard-coded `--space-4`). A service theme sets them
  once to match its design grid; the `labelWidth` prop still wins per form/field.
- Two new cardinal rules distilled from real service consumption: **#44 Chrome is a token,
  default quiet** (no hard-coded dividers/chrome in `src/styles/*.css`; quietest default, theme
  opt-in) and **#45 Every service-tunable constant gets a knob** (design-grid geometry like label
  widths/gaps must be a documented component token, not prop-only or hard-coded). `CLAUDE.md`
  gains the matching add-a-token checklist and the local-link (`file:`) dev workflow.

### Added

- `SearchSelect` / data-driven `Select` options gain an `icon` field (avatar / flag / lucide node).
  It renders before the label in the option rows AND on the trigger once selected — so a picked
  account/person/country shows its icon at rest, not just plain label text. No `renderOption` needed
  for the common icon-with-label case.
- `SearchSelect` / `Select` also gain a `selectedIcon` prop — the trigger counterpart of
  `selectedLabel`: it shows a leading icon for an async preset value whose option page hasn't loaded
  yet (e.g. an edit form pre-filled from the server), so the avatar/flag shows at rest.
- `Button` `count` gains Ant-Badge-parity `overflowCount` (default 99 → renders `99+`) and `showZero`
  (default `true`; pass `false` to hide the pill when the count is 0).
- `SearchSelect` / `Select` gain a `labelRender` prop (Ant Design) — fully customize the SELECTED
  value shown on the trigger (avatar + name + role badge, etc.); the placeholder still shows when
  empty. Receives `{ value, label, option }` (option is undefined for an unloaded async preset).

### Fixed

- `Toaster` (sonner) rendered fully transparent: it forwarded the color tokens unwrapped
  (`--normal-bg: var(--popover)`), but the framework tokens are raw HSL triplets consumed as
  `hsl(var(--token))` — sonner used the bare triplet as a CSS color, which is invalid, so the
  toast had no background/text/border. The bridge vars now wrap with `hsl()`.

## [13.6.0]

### Added

- `Button` gains a `count` prop — a trailing borderless counter pill for filter tabs / segmented
  toggles (e.g. "Chờ bay 18"). Formatted with `Intl.NumberFormat` in the active locale and styled per
  variant (translucent foreground on filled, muted fill on light), so you never nest a bordered
  `Badge` inside a bordered `Button` (which double-borders). Renders `0`; ignored under `asChild`.
- Inline clear (✕) for value-holding pickers: `DatePicker`, `DateRangePicker` and `TimePicker` gain
  an `allowClear` prop (default `true`) rendering an inline ✕ on the trigger that resets the value —
  consistent with the existing `Cascader` / `TreeSelect` affordance.
- `Input` and `Textarea` gain an opt-in `allowClear` prop (+ `onClear`) — an inline ✕ that clears the
  field while it holds text, working for both controlled and uncontrolled usage. Off by default, so
  existing inputs are unchanged.
- `SearchSelect` now exposes its clear control as an inline ✕ on the trigger (replacing the in-dropdown
  "clear" row), so a selection can be cleared without opening the list.

### Changed

- `TagInput` chips now sit on an 8px (`--space-2`) flex rhythm instead of relying on collapsed inline
  whitespace, fixing chips that rendered too close together.

## [12.1.0]

### Changed

- `SheetFooter` is now a pinned, full-bleed-bordered action bar with RIGHT-aligned actions (Ant Design
  Drawer footer) instead of stacked full-width buttons; `DialogFooter`/`AlertDialogFooter` right-align
  their actions too. Put a destructive / clear / reset action far-left with `className="mr-auto"`.
  New cardinal rule #41 "Drawer & dialog footer layout".

## [12.0.3]

### Fixed

- `SelectTrigger` is now full-width by default (`w-full`, matching the shadcn standard) instead of
  `w-fit`, so a `Select` inside a form / `FormField` fills the field like `Input`/`Textarea` (it was
  content-width, leaving ragged, misaligned forms). Inline/toolbar selects stay compact because their
  container constrains the width.

## [12.0.2]

### Fixed

- Interactive controls (input / select / button / date-picker, and DataTable rows) now keep a ≥44px
  tap target on touch devices via `@media (pointer: coarse)` — honouring the ≥44px touch-target rule
  (#24) regardless of density. Desktop (fine pointer) keeps the compact heights.

## [12.0.1]

### Fixed

- `Toolbar` / `ToolbarGroup` label is now vertically centered against its control â `.ui-toolbar-label`
  was a top-aligned block stretched to the control height, so filter labels sat above the input's
  vertical center.
- `CardContent flush` now zeroes vertical padding (not only `padding-bottom`) when it contains a
  `DataTable`, so a full-bleed table sits flush to the card's top edge (removes the empty band above
  the header row).

## [11.0.1]

### Changed

- `ui-audit` is now comment/doc-aware: it strips comments before scanning (so a JSDoc that says
  "Never a raw <input>" is not flagged), scopes the status-vs-variant rule to `Badge`/`Tag`/`StatCard`
  (Button/Alert/DropdownMenuItem use `variant` legitimately), and supports
  `ui-audit-disable-line|next-line <rule>` suppression directives â eliminating false positives while
  still catching real violations.

## [11.0.0]

International-standardization release: i18n (Intl/CLDR), accessibility (WAI-ARIA APG + WCAG 2.2 AA),
RTL, and a consolidated controlled-vocabulary API. See `docs/roadmap/international-standardization.md`.

### BREAKING

- Removed `Combobox`; use `Select` with `showSearch` (client filter) â same capability.
- Removed `SearchSelect` from the public API; it is now `Select`'s internal engine. Use
  `Select` with `showSearch` / `loadOptions`. Public option/load types are exported as
  `SelectOption` / `SelectLoadParams` / `SelectLoadResult`.
- Removed `CountrySelect`; build a country picker from `Select` + `Intl.DisplayNames` (see the
  `docs/data-entry/country-picker-recipe`).
- Removed `ChoiceField`; use `Field` (it was only an alias).
- Removed `LocalePicker`, `TimezonePicker`, `DateFormatPicker`, `TimeFormatPicker`; use the single
  `AppSettingPicker kind="locale" | "timezone" | "dateFormat" | "timeFormat"`.
- `Steps`: `current` â `value`, `initial` â `defaultValue`, `onChange` â `onValueChange`;
  `StepItem.subTitle` â `subtitle`, `StepItem.content` â `description`.
- `Pagination`: `current` â `value`, `onChange` â `onValueChange` (handler signature unchanged).
- `size` value `"default"` â `"md"` on `Switch`, `Steps`, `Select` (trigger), `Toggle`, `Card`
  (`Button` is unchanged â its `ButtonSizeProp` documents `"default"`).
- `SearchInput`: prop `onDebouncedChange` â `onSearchChange`.
- `Tabs`: `onValueChange` callback parameter renamed `key` â `value` (type-only).

### Added

- `AppSettingPicker` â one provider-bound `Select` for any single `AppProvider` setting (`kind`).
- Full internationalization: locale-correct number/currency/bytes via `Intl.NumberFormat`, CLDR
  plurals via `Intl.PluralRules`, country/language names via `Intl.DisplayNames`, `<html dir>` from
  the active locale (RTL-ready logical CSS), 12h hour-cycle in `TimePicker`.
- Accessibility pass across every composite (roles, keyboard, focus, labels, â¥24px targets) plus
  `vitest-axe` coverage; `DatePicker` / `DateRangePicker` gain uncontrolled `defaultValue`;
  `AppSettingPicker` forwards `ref` + accepts `name`.
- A mandatory `godxjp-ui-component` discipline skill; the prop-vocabulary guard now scans
  `src/components/**` so no public prop type escapes governance.

## [7.0.0]

### BREAKING

- Removed `ScanPanel`; migrate scan/upload placeholders to `EmptyState`, `Skeleton`, or a product-specific upload surface.
- Removed `CodeBadge`; migrate typed code chips to `Badge` with consumer-owned prefix/icon content.
- Removed `ShellApp`; compose production shells with `AppShell`, `Sidebar`, `Topbar`, and `Breadcrumb`.
- Removed `Menu`; use `Sidebar` directly for persistent left-rail navigation.
- Removed `MobileFrame`; use app/page layout primitives instead of the phone-frame wrapper.
- Renamed `KeyValueGrid` to `Descriptions`; migrate `KeyValueGrid.Item` to `Descriptions.Item`.
- Renamed `ProgressMeter` to `Progress`; import `Progress` from `@godxjp/ui/data-display`.
- Renamed `CardStat` to `StatCard`; keep rendering it directly in grids, not wrapped in `Card`.
- Merged `StatusBadge` into `Badge`; migrate `tone` to `variant`, use `status` for lifecycle mapping, and pass `icon={null}` for tier/category chips.
- Merged `TabsItems` into `Tabs`; pass `items={[{ value, label, content }]}` to `Tabs`.
- Merged `SwitchField` into `ChoiceField` + `Switch`; wrap `<Switch name="..." />` in `<ChoiceField id label description>`.
- `Sheet` is unchanged; a future `Drawer` will be a distinct bottom-sheet primitive.

### Added

- Added `Avatar`, `Separator`, base `Skeleton`, `Toggle`, `ToggleGroup`, `AspectRatio`, and `Progress`.

### Tooling (monorepo â repo-internal, not shipped to consumers)

- **Reverse drift guard** (`pnpm check:mcp-orphans`, `scripts/check-mcp-orphans.mjs`). The complement
  of the sync guard: every PUBLIC primary component must HAVE a `@godxjp/ui-mcp` catalog entry, else
  CI fails â so the catalog can't silently rot as new components ship (an uncatalogued component is
  one an agent searches for, doesn't find, and hand-rolls). Wired into `verify` + `verify:release`.
  Filling the 36 components it caught brought `@godxjp/ui-mcp` to **0.7.0**; **0.8.0** then enriched
  the remaining 44 core entries, so all **85 entries** now carry usage (DO/DON'T) / use-cases /
  related guidance â `get_component` fully teaches every component, not just lists its props.
- **MCPâlibrary drift guard** (`pnpm check:mcp-sync`, `scripts/check-mcp-sync.mjs`). Fails CI
  if a component catalogued in `@godxjp/ui-mcp` (`mcp/src/data/components.ts`) names a component
  the library no longer exports (rename/removal â stale agent guidance). Wired into `verify` and
  `verify:release`. The lib and the MCP stay **separate published packages** (browser dep vs Node
  server â merging would force the MCP SDK into every consumer bundle); this keeps them honest.
- **Coordinated release** (`pnpm release`, `scripts/release.mjs`). `pnpm release --ui <bump>
--mcp <bump>` publishes `@godxjp/ui` and/or `@godxjp/ui-mcp` in lockstep (refuses a dirty tree,
  runs `verify:release`, bumps, publishes, commits) so the two packages are never published out
  of step by hand. Independent version lines (ui 6.x, mcp 0.x); only the _act_ is coordinated.

## [6.12.0] - 2026-06-02

### Changed

- **`godxjp-ui-audit` (the `ui:audit` checker) now catches more consumer mistakes:** raw `<input>`
  and `<button>` (were missing â only `<select>`/`<table>`/`<textarea>` were checked), hand-rolled
  `<Card className="p-4">` padding, and â via a new whole-file structural check â a bare `<Card>`
  whose body is not wrapped in `<CardContent>` (renders flush). New rule ids: `no-raw-input`,
  `no-raw-button`, `card-manual-padding`, `card-needs-content`.

## [6.11.0] - 2026-06-01

### Changed

- **One `Select` for every single-select (Ant-style).** `Select` is now polymorphic: keep using
  the compound API (`<Select><SelectTrigger/><SelectContent><SelectItem/></Select>`) for full
  control, OR pass `options` / `loadOptions` for a data-driven select. `showSearch` toggles a
  searchable combobox (the `SearchSelect` engine â async + infinite scroll) vs a plain no-search
  Radix listbox; both support optgroup grouping and `renderOption`. Fully backward-compatible â
  existing compound usage is unchanged.
- **`SearchSelect` is deprecated** in favour of `<Select options showSearch>` (it remains the
  engine behind it and is still exported). `Autocomplete` likewise stays a deprecated wrapper.
  So the family is now: **`Select`** (everything) Â· `SearchSelect`/`Autocomplete` (deprecated
  aliases).

## [6.10.0] - 2026-06-01

### Changed

- **`SearchSelect` now supersedes `Autocomplete`.** It accepts EITHER a static `options` array
  (client-side filter) OR async `loadOptions`, so it covers both small static lists and remote
  datasets. Added a `renderOption` prop for custom per-option rendering (Ant-Design style).
  Option labels are no longer bold (normal weight); group headings use the standard
  muted-foreground tone (same as command-group headings).
- **`Autocomplete` is deprecated** â reimplemented as a thin wrapper over `SearchSelect` (static
  options) so there is a single combobox implementation. Its API is unchanged.

### Props

- Added `EmptyMessageProp` to the vocabulary (shared by `SearchSelect` + `Autocomplete`).
- De-duplicated the inline `name: string` concept across data-entry props to the vocabulary
  `NameProp`. Registered `SearchSelect*` + `EmptyMessageProp` in the props registry.

## [6.9.0] - 2026-06-01

### Added

- **`SearchSelect`** (`@godxjp/ui/data-entry`) â an async, searchable single-select combobox.
  Unlike `Autocomplete` (static options), it loads options REMOTELY via a `loadOptions({ query,
page })` fetcher with a debounced search box, infinite-scroll pagination, and loading/empty
  states. Options support **optgroup-style grouping** (`option.group` renders a heading) and a
  `sublabel`. Data-agnostic (REST/GraphQL/cached client), form-submittable via `name`,
  e2e-testable via `data-testid` (+ `${data-testid}-option-${value}` per option).

## [6.8.0] - 2026-06-01

### Added

- **`Topbar` `productMenu` / `projectMenu`.** Pass a `DropdownMenuContent` to turn the
  product (or project) chip into a real dropdown switcher â e.g. an active-entity picker â
  instead of just firing `onProductOpen`.

### Changed

- **`Topbar` project chip is hidden when unused.** It now only renders when `project` or
  `projectMenu` is set, so apps that don't use it no longer get a dead "Pick project"
  placeholder.

## [6.7.0] - 2026-06-01

### Added

- **`Tooltip`** (`@godxjp/ui/feedback`) â a portaled, self-contained Radix tooltip
  (`Tooltip` / `TooltipTrigger` / `TooltipContent`, plus an optional `TooltipProvider`).
  No app-level provider required; controllable via `open`/`onOpenChange`.

### Changed

- **Sidebar collapsed rail interaction.** Hovering (or focusing) a collapsed item now shows
  its label as a **tooltip**; **clicking** a group opens its submenu as a portaled menu (a leaf
  navigates). Previously both opened on hover, which conflated the tooltip and the menu.

## [6.6.0] - 2026-06-01

### Fixed

- **Sidebar collapsed flyout no longer clipped.** The hover/focus flyout (label tooltip for
  leaves, submenu for groups) now renders through a portaled Radix `Popover` to the page root,
  so it escapes the sidebar's `overflow:hidden` instead of being cut off. It also opens reliably
  on hover and keyboard focus.
- **Sidebar rows are full width.** `.sb-nav-item` is now `width:100%`, so a collapsible group
  trigger (nested inside the `Collapsible` wrapper) fills the rail and its chevron sits flush at
  the right edge â matching flat rows.

## [6.5.0] - 2026-06-01

### Fixed

- **`DataTable` now renders its empty + loading states.** The `empty` and `loading` props
  were declared but never used, so a table with no rows showed a bare header. An empty
  `data` now renders a built-in `EmptyState` (or the custom `empty` node if provided), and
  `loading` renders a loading row â both spanning all columns. No page-level
  `data.length === 0 ? <EmptyState/> : <DataTable/>` guard is needed anymore.

### Added

- `dataTable.empty` / `dataTable.loading` i18n strings (en/ja/vi).

## [6.4.0] - 2026-06-01

### Added

- **`Sidebar` submenus.** `SidebarItem` now accepts `children` â a nested item renders a
  collapsible group (Radix `Collapsible`) using the existing `sb-nav-group-trigger` /
  `sb-chevron` / `sb-nav-sub` / `sb-nav-item--sub` design. The **parent reads active when any
  descendant is active** and the group auto-opens to reveal the active child.
- **Collapsed-rail flyout tooltips.** When the sidebar is collapsed, hovering (or keyboard-
  focusing) a leaf shows its label as a flyout tooltip, and a group reveals its submenu as a
  flyout menu â so collapsed items are identifiable and reachable. Replaces the native `title`
  attribute; no new dependency.

## [6.3.0] - 2026-06-01

### Changed

- **`DatePicker`, `TimePicker`, `DateRangePicker` are now WAI-ARIA combobox inputs.**
  The value lives on a real, typeable `<input>` (ISO-8601 `yyyy-MM-dd` for the date
  pickers, canonical 24h `HH:mm` for `TimePicker`) instead of a button-only popover.
  This makes the controls **form-submittable**, screen-reader friendly, and natively
  **e2e-testable by filling the input** â no hidden mirror elements. The calendar /
  time-column / range popover remains as the visual affordance and stays in sync with
  typing. Prop APIs are backward-compatible (same `value` / `onChange`); the rendered
  element changes from a `<button>` to an `<input>`, so consumers asserting the old
  button text should target the input value instead.

### Added

- **`name` prop** on `DatePicker`, `TimePicker`, and `DateRangePicker` for native form
  submission. `DateRangePicker` emits `${name}_from` / `${name}_to` ISO fields.
- **`toIsoDate(date)`** in `@godxjp/ui` datetime helpers â formats a calendar `Date` to
  an ISO-8601 `yyyy-MM-dd` string from its local Y/M/D.

## [6.2.0] - 2026-06-01

### Added

- **`ColumnDef.hiddenOnMobile`** â a `DataTable` column can now be hidden below
  the `md` breakpoint (`hidden md:table-cell`), keeping mobile tables readable.
- **`StatCard.inverse`** + **sign-aware delta tone** â a `delta` starting with
  `+` renders in the success tone and `-` / `â` in the destructive tone;
  `inverse` flips that for metrics where lower is better.
- **`DataTable` horizontal scroll-fade** â a subtle gradient affordance appears
  at the scroll edge so it's clear the table scrolls horizontally.

### Changed

- **Empty `DataTable` headers auto-hide.** A column whose `header` is empty
  (an icon / action column) no longer paints the grey header band â its header
  cell is transparent (`[data-slot="table-head"][data-empty]`), so the empty
  header visually disappears instead of showing a blank grey block.
- Internal refinements to `AppProvider` and `ResponsiveGrid`; added regression
  tests for `Card`/`DataTable`.

## [6.1.2] - 2026-05-31

### Fixed

- **`DataTable` cells default to `white-space: nowrap`.** A narrow column could
  collapse CJK cell text to one character per line; cells now stay on one line
  and the existing `overflow-x: auto` scroll container scrolls instead of
  crushing. A column that needs wrapping opts in with a `whitespace-normal`
  class on `col.width`.

## [6.1.1] - 2026-05-31

### Fixed

- **`StatusBadge` / `Badge` never wrap their label** (`white-space: nowrap`),
  especially inside narrow `DataTable` cells (status / scope columns).

## [6.1.0] - 2026-05-31

### Added

- **`StatusBadge` `tone` + `icon` override props** (escape hatch). `tone`
  (`success` | `warning` | `destructive` | `info` | `neutral`) overrides the
  auto-resolved colour for localized labels and categorical tiers that aren't
  in the built-in English lifecycle map; `icon={null}` hides the glyph (for
  tier / category badges). Exports `StatusBadgeTone`. Backward compatible.

[Unreleased]: https://github.com/godx-jp/godxjp-ui/compare/v6.12.0...HEAD
[6.12.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.11.0...v6.12.0
[6.11.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.10.0...v6.11.0
[6.10.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.9.0...v6.10.0
[6.9.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.8.0...v6.9.0
[6.8.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.7.0...v6.8.0
[6.7.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.6.0...v6.7.0
[6.6.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.5.0...v6.6.0
[6.5.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.4.0...v6.5.0
[6.4.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.3.0...v6.4.0
[6.3.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.2.0...v6.3.0
[6.2.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.1.2...v6.2.0
[6.1.2]: https://github.com/godx-jp/godxjp-ui/compare/v6.1.1...v6.1.2
[6.1.1]: https://github.com/godx-jp/godxjp-ui/compare/v6.1.0...v6.1.1
[6.1.0]: https://github.com/godx-jp/godxjp-ui/compare/v6.0.2...v6.1.0
