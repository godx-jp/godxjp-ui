# @godxjp/ui

> **Tệp do gói `@godxjp/ui` sở hữu**, ghi lại mỗi lần chạy `npx godxjp-ui sync-rules`. Đừng sửa ở
> đây — luật riêng của kho thuộc về một tệp khác trong `.ai/rules/`.

Danh sách kiểm bắn mỗi lần chạm một tệp UI. Luật đầy đủ: `docs/CONSUMER-RULES.md`.

## Styles và theme

```css
@import "@godxjp/ui/styles"; /* or: import "@godxjp/ui/styles.css" — no Tailwind needed */
```

Fonts are opt-in (`@godxjp/ui/styles/fonts.css`, after the styles import). Never cherry-pick
`*-layout.css` layers. The default `--primary` is a neutral placeholder: set `--primary` once in
your theme, or import a preset (`@godxjp/ui/themes/godx.css`). Details: `docs/CUSTOMER-THEMING.md`.

## Screen composition (ui-audit không thấy những lỗi này)

- Most sections are a `Heading` + content, NOT a `Card`. A Card is for a genuinely separate
  surface (a table, a form block), never a frame around every section.
- No `subtitle` that restates the `title`. Leave it out unless it adds a fact.
- Filters sit ABOVE the table they filter, never after it.
- KPI tiles (`StatCard`) only on dashboards, 3–4 at most. A list page opens with its list.
- `EmptyState` = one sentence + one action. Inside a Card it has no icon.
- `Alert` only for something the user must act on now; not a page decoration.
- Tiers / categories / roles render in ONE neutral tone (`<Badge variant="outline">`); colour
  is for status.
- Vary spacing by level: `xs` inside a group, `sm` within a row, `md` between items, `lg`
  between blocks. One gap everywhere reads as generated.

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

| Cần                                                              | Đã có                                                                              |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| đường kẻ chạm mép Card                                           | `<CardContent flush>`                                                              |
| header có kẻ khi thân là danh sách flush                         | `<CardHeader banded>`                                                              |
| một hàng LÀ liên kết (thay cho nút rời)                          | `<ListRow asChild>`                                                                |
| kẻ ô từng ngày trong lịch                                        | `<Calendar bordered>`                                                              |
| dải giữa hai vùng, tự kẻ theo VỊ TRÍ                             | `<CardBar>` (`border` để ép khi xếp chồng)                                         |
| chip "điều kiện đang bật" có dấu × để bỏ                         | `<Badge onRemove>` — KHÔNG phải `Select mode="tags"`                               |
| dải tab nằm TRONG đầu Card                                       | `<Card tabList activeTabKey onTabChange>`                                          |
| tiêu đề / đoạn văn / liên kết trong văn bản                      | `<Heading level>` · `<Text as="p">` · `<Link>`                                     |
| nút nổi góc màn (quay lên đầu, hành động nhanh)                  | `<FloatButton>`                                                                    |
| khung xương của một FORM khi đang tải                            | `<SkeletonForm>`                                                                   |
| ô màu chỉ để xem, màu do NGƯỜI DÙNG chọn                         | `<Swatch>`                                                                         |
| danh sách "có gì trong gói này"                                  | `<FeatureList>`                                                                    |
| panel kéo giãn được (chia đôi màn)                               | `<DraggablePanel>`                                                                 |
| màn hội thoại AI                                                 | `<Welcome>` · `<Conversations>` · `<Attachments>` · `<ThoughtChain>` · `<Actions>` |
| một glyph lucide đứng một mình (trong `Text`, ô bảng, thẻ `<a>`) | `<Icon as={Lock} size="sm">` — KHÔNG phải `size-4` hay `size={16}`                 |

Lỗi không phải "đoán sai tên prop" mà là **cho rằng nó không tồn tại nên không
hỏi**.

## `AppProvider` là bắt buộc — thiếu nó, chuỗi của kit không theo ngôn ngữ của app

Mount `<AppProvider defaultLocale="ja">` MỘT lần ở gốc app. Thiếu nó, chuỗi của chính kit (nút
đóng/hủy/xóa của dialog, upload, badge đếm, nhãn picker) rơi về locale nghỉ — `<html lang>` nếu
locale đó đã đăng ký, không thì `en` — và picker rơi về UTC (gh#1005). Bản dev
giờ cảnh báo MỘT lần khi component của kit render ngoài provider. Không mount được provider thì gọi
`syncI18nLocale(locale, fallback)` lúc khởi động.

## Form: `Form` bọc `FormField`, bề rộng theo nội dung, form dài là PAGE

godx-mailer dính bốn lỗi form trong một ngày, cả bốn đều là kit ĐÃ CÓ đồ đúng
(gh#998). Giờ ui-audit chặn:

| Sai                                                         | Đúng                                                                                            | rule                   |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------- |
| ≥2 `FormField` không có `Form`, hoặc xếp hàng bằng `<Flex>` | `<Form layout="horizontal" labelWidth controlWidth>`; hàng = `<Flex attached>` / `Form columns` | `formfield-needs-form` |
| ≥3 `FormField` trong `DialogBody`                           | page riêng (route riêng)                                                                        | `dialog-form-too-big`  |
| `Select` hai lựa chọn kéo full width                        | `controlWidth` trên field hoặc một lần trên `Form`                                              | `select-width-hint`    |

Ca kit không diễn đạt được thì **mở issue ở godx-jp/godxjp-ui**, tạm dùng cách
hợp lệ gần nhất kèm `// TODO(godxjp-ui#<n>)` — không tự chế.

## Xác nhận nguy hiểm: `Dialog variant="destructive"`

```tsx
<DialogContent variant="destructive">   {/* không dùng họ AlertDialog* — lối cũ */}
```

Một prop: `role="alertdialog"`, click ra ngoài không đóng, nút chính nhấn mạnh destructive.
Thiếu prop thì mở issue kèm tên antd của nó (`docs/DESIGN-AUTHORITY.md`), đừng tự đặt tên.

## Luật bố cục: hỏi `get_component` trước

`usage`/`description` thường nói cả luật vị trí (vd. `CardBar` tự kẻ theo vị trí, `border` để
ép). Khi catalog im lặng thì mới đọc `node_modules/@godxjp/ui/src/styles/*-layout.css`.

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
