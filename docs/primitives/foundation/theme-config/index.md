---
title: Theme Config
lang: vi
---

ThemeConfig — primitive UI từ @godxjp/ui.

## Khi nào dùng

- Xem demo live bên dưới để biết variants và states hỗ trợ.

## Import

```tsx
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Inline,
  Stack,
} from "@godxjp/ui/layout";
```

## Components

### Badge

Badge — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### Card

Card — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu                 | Mặc định  | Mô tả                                    | Use case                                                                 |
| ---------- | -------------------- | --------- | ---------------------------------------- | ------------------------------------------------------------------------ |
| `children` | `ReactNode`          | —         | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert.          |
| `size`     | `default`, `compact` | `default` | Kích thước preset.                       | Button sm trong table; Card compact cho KPI row.                         |
| `accent`   | `CardAccent`         | —         | Prop `accent`.                           | Tham chiếu type trong source `src/props/` hoặc component.                |
| `variant`  | `CardVariant`        | —         | Biến thể giao diện semantic.             | Button/Badge/Alert — chọn tone phù hợp ngữ cảnh (primary, destructive…). |
| `density`  | `CardDensity`        | —         | Mật độ spacing (page hoặc table).        | PageContainer compact trên mobile; DataTable row height.                 |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### CardContent

Body chính của card.

**Use case:** `flush`: table full-bleed; `solo`: không header phía trên; `tight`: sát header/tabs.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                           | Use case                                                        |
| ---------- | ----------- | -------- | ----------------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component.        | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |
| `flush`    | `boolean`   | —        | Full-bleed — bỏ padding ngang.                  | CardContent: table; CardFooter: action bar sát mép.             |
| `tight`    | `boolean`   | —        | Không gap sau header.                           | CardContent sát tabs/toolbar.                                   |
| `solo`     | `boolean`   | —        | Không có header phía trên — padding top đầy đủ. | StatCard, KPI tile chỉ có body.                                 |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### CardHeader

Vùng header card — title, description, actions.

**Use case:** `banded={true}`: nền muted + border-bottom như section band.

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |
| `banded`   | `boolean`   | —        | Header/footer có nền muted + viền band.  | CardHeader/CardFooter — tách section rõ ràng.                   |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### CardTitle

Heading `<h3>` trong card.

**Use case:** Tiêu đề card; StatCard dùng cho số KPI (`text-2xl`).

#### Props hiển thị & cấu hình

| Prop       | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ---------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children` | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |

#### Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

#### Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

### Badge

Badge — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

Không có props trong nhóm này.

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### Button

Button — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop       | Kiểu                                                                 | Mặc định | Mô tả                                                    | Use case                                                                 |
| ---------- | -------------------------------------------------------------------- | -------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| `variant`  | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`    | —        | Biến thể giao diện semantic.                             | Button/Badge/Alert — chọn tone phù hợp ngữ cảnh (primary, destructive…). |
| `size`     | `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg` | —        | Kích thước preset.                                       | Button sm trong table; Card compact cho KPI row.                         |
| `asChild`  | `boolean`                                                            | —        | Radix polymorphism — merge props vào child thay wrapper. | Button asChild + Link router — giữ semantics `<a>`.                      |
| `disabled` | `boolean`                                                            | —        | Vô hiệu hóa tương tác.                                   | Chưa đủ điều kiện submit; đang pending API.                              |

#### Props hành động (events & callbacks)

| Prop      | Kiểu                                         | Mặc định | Mô tả                 | Use case                                |
| --------- | -------------------------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick` | `React.MouseEventHandler<HTMLButtonElement>` | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |

### Inline

Inline — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop  | Kiểu                   | Mặc định | Mô tả                                   | Use case                                   |
| ----- | ---------------------- | -------- | --------------------------------------- | ------------------------------------------ |
| `gap` | `xs`, `sm`, `md`, `lg` | —        | Khoảng cách giữa items (token spacing). | Stack vertical gap; Inline horizontal gap. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

### Stack

Stack — phần con của compound primitive.

**Use case:** Import cùng package với component cha; compose theo thứ tự trong demo.

#### Props hiển thị & cấu hình

| Prop  | Kiểu                         | Mặc định | Mô tả                                   | Use case                                   |
| ----- | ---------------------------- | -------- | --------------------------------------- | ------------------------------------------ |
| `gap` | `xs`, `sm`, `md`, `lg`, `xl` | —        | Khoảng cách giữa items (token spacing). | Stack vertical gap; Inline horizontal gap. |

#### Props hành động (events & callbacks)

Không có props trong nhóm này.

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
