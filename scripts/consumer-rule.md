# @godxjp/ui

> **Tệp này do gói `@godxjp/ui` sở hữu.** Nội dung được ghi lại khi luật trong gói đổi (thường
> qua postinstall sau `npm i`, trừ khi `.npmrc` có `ignore-scripts=true`). Khi đó chạy
> `npx @godxjp/ui sync-rules`. Dấu `<!-- godxjp-ui:version -->` luôn được đồng bộ với phiên bản
> gói đang cài — kể cả khi thân tệp không đổi giữa hai bản.
> Đừng sửa ở đây — luật của riêng kho thuộc về một tệp khác trong `.ai/rules/`,
> và index sẽ nạp cả hai. (Khác với `.claude/skills/.../SKILL.md`, nơi mục §8
> trở đi là của kho và được giữ lại.)

Đây là **danh sách kiểm** bắn mỗi lần chạm một tệp UI. Lý do đầy đủ nằm ở
`docs/CONSUMER-RULES.md` (10 luật) và, với kho chuột bạch, ở
`.claude/skills/godx-ui-guinea-pig/SKILL.md`.

## Nạp style: BA lối vào, và hai lối sau không chở font

```css
@import "@godxjp/ui/styles"; /* mọi layer + Noto Sans JP / M PLUS 2 đóng gói sẵn */
@import "@godxjp/ui/styles/core"; /* CÙNG các layer ấy, KHÔNG một @font-face nào */
@import "@godxjp/ui/styles/core-with-fallbacks"; /* core + 6 khối local()-only, vẫn 0 byte mạng */
```

Chọn `core` khi kho tự lo mặt chữ, hoặc khi không muốn chở font: `@fontsource` cắt
Noto Sans JP thành hàng trăm lát `unicode-range`, và trình duyệt chỉ biết cần lát nào
SAU khi đã dựng bố cục — một consumer đo được **737 lát / 13 MB**, gấp bảy lần toàn bộ
JavaScript của họ, cộng ~8 vòng tải mỗi lần chuyển màn.

Lối thứ ba dành cho kho **tự cấp Noto Sans JP** (next/font, self-host) mà vẫn muốn cửa
sổ swap không đội hình: nó chở đúng 6 `@font-face` metric-matched, `src` toàn `local()`
nên **không tải byte nào**. Nhớ tự xếp tên họ chữ ngay sau mặt chữ của bạn:
`--font-sans-base: "Noto Sans JP", "Noto Sans JP Fallback", system-ui, sans-serif;`

`core` giữ `@font-face` = **0** và đó là lời hứa đo được —
`grep -c '@font-face' node_modules/@godxjp/ui/dist/styles/core.css` → `0`. Vì vậy các
fallback nằm ở entry riêng chứ không nhét vào `core`.

Không lối nào trong ba là cherry-pick: cả ba đều được hỗ trợ và thứ tự layer vẫn nguyên
vẹn. Cherry-pick từng layer riêng lẻ thì vẫn cấm — đó là thứ làm vỡ hợp đồng thứ tự,
không phải việc chọn lối vào.

## Bố cục chuẩn của platform: BA CỘT, và ba cột là BA PHẠM VI

Vỏ mặc định của mọi app trên platform là ba cột, dựng bằng một `AppShell`:

```
navRail (3.5rem) │ sidebar (16rem) │ content
```

Không tự dựng ba cột bằng cách nhét hai cột vào một khe `sidebar` rồi nới
`--app-shell-sidebar-width`. Hai bẫy đã đo được: `Sidebar` render
`.sb-root { display: contents }` nên hai `Sidebar` đặt cạnh nhau **tan vào một
flex row** và cùng co về 0; và nới token dùng chung khiến mép nội dung **nhảy
64px giữa các route**. `navRail` sở hữu track riêng nên không cần cả hai.

**Đặt một control vào cột nào là câu hỏi về PHẠM VI, không phải về chỗ trống:**

| Cột       | Phạm vi                                                       | Chứa gì                                                                                     |
| --------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `navRail` | **platform** — đúng với cả tổ chức, sống sót qua việc đổi app | đổi tổ chức · đổi app · thông báo · tin nhắn · sự kiện · cài đặt tổ chức · lối tắt liên-app |
| `sidebar` | **app** — của riêng app đang mở                               | mục/kênh/route của chính app này                                                            |
| `topbar`  | **trang** — bạn đang ở đâu, làm được gì ở đây                 | breadcrumb · hành động của trang · menu tài khoản                                           |

Hai luật phủ định, và chúng làm được việc:

- Điều hướng của app **không bao giờ** vào rail. Một rail lặp lại mục của
  sidebar là dải chrome thứ hai mang thứ hạng của dải thứ nhất, chỉ dựng đứng.
- Công tắc cấp platform **không bao giờ** vào sidebar — đổi app xong nó biến
  mất, trong khi nó vẫn phải ở đó.
- Đích nào hợp cả hai thì thuộc **rail**: nó sống sót qua việc đổi app.

`sidebarCollapsed` chỉ gập cột `sidebar`; rail giữ nguyên bề rộng, nên đích cấp
platform vẫn với tới được lúc gập. Đừng dựng lại hành vi này bằng CSS của kho.

Bề rộng rail là token `--app-shell-nav-rail-width` — kho nào muốn rail rộng kiểu
Slack thì đặt lại **một dòng**, không fork `.app-nav-rail`.

## Trước khi viết bố cục: TRA, đừng dựng

Hỏi MCP `godxjp-ui` (`search_components`, `get_component`). Đo được trong một
ngày: năm thứ cần đều ĐÃ CÓ và vẫn bị dựng lại bằng thứ khác —

| Cần                                             | Đã có                                                                              |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| đường kẻ chạm mép Card                          | `<CardContent flush>`                                                              |
| header có kẻ khi thân là danh sách flush        | `<CardHeader banded>`                                                              |
| một hàng LÀ liên kết (thay cho nút rời)         | `<ListRow asChild>`                                                                |
| kẻ ô từng ngày trong lịch                       | `<Calendar bordered>`                                                              |
| dải giữa hai vùng, tự kẻ theo VỊ TRÍ            | `<CardBar>` (`border` để ép khi xếp chồng)                                         |
| chip "điều kiện đang bật" có dấu × để bỏ        | `<Badge onRemove>` — KHÔNG phải `TagInput`                                         |
| dải tab nằm TRONG đầu Card                      | `<Card tabList activeTabKey onTabChange>`                                          |
| tiêu đề / đoạn văn / liên kết trong văn bản     | `<Title>` · `<Paragraph>` · `<Link>` (`Text` 33 prop)                              |
| nút nổi góc màn (quay lên đầu, hành động nhanh) | `<FloatButton>`                                                                    |
| khung xương của một FORM khi đang tải           | `<SkeletonForm>`                                                                   |
| ô màu chỉ để xem, màu do NGƯỜI DÙNG chọn        | `<Swatch>`                                                                         |
| ảnh đại diện của một tệp / bản xem trước        | `<Thumbnail>`                                                                      |
| danh sách "có gì trong gói này"                 | `<FeatureList>`                                                                    |
| panel kéo giãn được (chia đôi màn)              | `<DraggablePanel>`                                                                 |
| màn hội thoại AI                                | `<Welcome>` · `<Conversations>` · `<Attachments>` · `<ThoughtChain>` · `<Actions>` |

Lỗi không phải "đoán sai tên prop" mà là **cho rằng nó không tồn tại nên không
hỏi**.

## Dialog và AlertDialog là MỘT họ — `variant` là lối chuẩn

Đừng với tay sang 12 export `AlertDialog*` nữa. Chúng **vẫn chạy y như cũ** (gỡ
là breaking change) nhưng là **LỐI CŨ**: đo được 26 export với **12 cặp trùng
tên** và **0** phần chỉ `AlertDialog` mới có. antd — thẩm quyền bề mặt prop của
gói này — chỉ có MỘT `Modal`, và mức nguy hiểm ở đó là một PROP.

```tsx
<DialogContent variant="destructive">   {/* thay cho <AlertDialogContent> */}
```

Một prop ấy quyết định ba thứ đi cùng nhau: `role="alertdialog"`, click ra ngoài
KHÔNG đóng, nút chính nhấn mạnh destructive (và ✕ mặc định tắt). Esc VẪN đóng —
y như `AlertDialogContent` trước nay. Đặt `variant` ở `DialogRoot` thì cả cây kế
thừa.

## antd là CHUẨN — thiếu gì thì port 100%, đừng tự thiết kế

`docs/DESIGN-AUTHORITY.md` của gói: **nơi antd đặt tên cho một năng lực, gói này
lấy nguyên tên và nguyên ngữ nghĩa của antd.** Một năng lực còn thiếu được port
từ antd **100% TRƯỚC** — tên, prop, ngữ nghĩa — rồi mới cải tiến. Không thiết kế
lại trước, không port một nửa.

Nghĩa là với consumer: thấy thiếu prop thì **mở issue kèm tên antd của nó**
(`sorter`, `closable`, `okType`…), đừng đề xuất một cái tên mới và đừng tự vẽ
lại bằng class tiện ích. Ba trục cố ý lệch khỏi antd đều đã ghi lý do trong
DESIGN-AUTHORITY (logical thay cho `left/right`, từ vựng giá trị của gói này,
`density` thay cho `size`) — lệch thêm thì phải viết ra ở đó.

## Catalog giờ chở CẢ luật bố cục — nhưng phải hỏi mới có

Mục này từng nói "catalog chở PROP, không chở LUẬT BỐ CỤC", với `CardBar` làm
bằng chứng: một prop (`extra`), không dòng nào nói nó tự kẻ theo vị trí. **Bằng
chứng ấy đã hết đúng.** `CardBar` nay có 6 prop, trong đó `border` (`"none" |
"block-start" | "block-end" | "both"`) ép được đường kẻ khi xếp chồng, và cả
`Card` lẫn `CardBar` trong catalog đều nói ra luật vị trí (đầu: kẻ dưới · cuối:
kẻ trên · giữa: cả hai).

Nên luật hiện hành là: **hỏi `get_component` trước** — nay nó thường trả lời cả
hình dạng lẫn luật. Còn khi `usage`/`description` im lặng về bố cục thì mới mở
`node_modules/@godxjp/ui/src/styles/*-layout.css` của component ấy ra đọc; chú
thích trong đó vẫn là bản đầy đủ nhất.

## Card không lồng Card

Một `<Card>` trong `<Card>` cho hai mép bo cách nhau 16px và hai lớp padding
chồng lên. Cần viền cho thứ bên trong thì tìm trục của chính nó
(`Calendar bordered`), đừng bọc thêm một mặt phẳng nữa.

Cùng lý do: đừng xếp `<Alert>` thành danh sách trong Card — mỗi Alert là một mặt
phẳng, và `Alert` còn phát `role="alert"` nên cả danh sách sẽ tự đọc to lên khi
tải trang. Danh sách là `ListRow`.

## Màu chữ đọc tầng CHỮ, không đọc tầng TÔ

`--success/--warning/--info/--destructive` là màu **TÔ** (nền badge, thanh, viền
alert). Chữ đọc `--text-success/-warning/-info/-error`.

Đo được: `Text tone="warning"` đọc nhầm tầng cho **1,74:1**; đúng tầng cho
**5,90:1**. Cùng `tone` ấy trong `Badge` vẫn đạt 5,52:1 — nên cùng một prop
hiện đọc được ở chỗ này và không đọc được ở chỗ kia, trên cùng một màn hình.

## Audit xanh ≠ chạy đúng

`ui-audit` xanh chỉ nghĩa là **không có gì cấm** bạn. Đo được: một consumer viết
`modifiers` + `modifiersClassNames` cho màu cuối tuần — audit xanh, tsc xanh,
build xanh, và **số màu chữ trên cả lưới vẫn là 1**, vì class rơi vào `<td>` còn
`<button>` tự đặt màu.

Một API chết im lặng trông y hệt một API đang chạy. **Mở trang và đo** mới biết.
