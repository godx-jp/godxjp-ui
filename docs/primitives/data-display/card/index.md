---
title: Overview
lang: vi
---

Card — Primitive hiển thị dữ liệu — chỉ đọc, không nhập liệu.

## Khi nào dùng

- Dùng để trình bày thông tin đã có (số liệu, trạng thái, bảng, danh sách).
- Không thay thế form input — kết hợp với Data Entry khi cần chỉnh sửa.

## Import

```tsx
import {
  Card,
  CardAction,
  CardContent,
  CardCover,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
```

## Card — component chính

## Props hiển thị & cấu hình

| Prop       | Kiểu                 | Mặc định  | Mô tả                                    | Use case                                                                 |
| ---------- | -------------------- | --------- | ---------------------------------------- | ------------------------------------------------------------------------ |
| `children` | `ReactNode`          | —         | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert.          |
| `size`     | `default`, `compact` | `default` | Kích thước preset.                       | Button sm trong table; Card compact cho KPI row.                         |
| `accent`   | `CardAccent`         | —         | Prop `accent`.                           | Tham chiếu type trong source `src/props/` hoặc component.                |
| `variant`  | `CardVariant`        | —         | Biến thể giao diện semantic.             | Button/Badge/Alert — chọn tone phù hợp ngữ cảnh (primary, destructive…). |
| `density`  | `CardDensity`        | —         | Mật độ spacing (page hoặc table).        | PageContainer compact trên mobile; DataTable row height.                 |

## Props hành động (events & callbacks)

| Prop        | Kiểu                         | Mặc định | Mô tả                 | Use case                                |
| ----------- | ---------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick`   | `(e: MouseEvent) => void`    | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |
| `onKeyDown` | `(e: KeyboardEvent) => void` | —        | Phím bấm.             | Enter submit; Escape đóng dialog.       |

## Thuộc tính DOM & accessibility

| Prop         | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ------------ | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className`  | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`         | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |
| `role`       | `string` | —        | ARIA role.                     | Accessibility khi semantic HTML không đủ.           |
| `tabIndex`   | `number` | —        | Thứ tự focus keyboard.         | Custom interactive div.                             |
| `aria-label` | `string` | —        | Nhãn cho screen reader.        | Icon-only button không có text visible.             |

## Sub-components

### CardAction

Slot action góc header (menu, nút).

**Use case:** Pair với `CardHeader className="flex flex-row items-start justify-between"`.

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

### CardCover

Media full-bleed phía trên card — ảnh cover, banner.

**Use case:** Luôn là **child đầu tiên** của `Card`; header nằm dưới cover.

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

### CardDescription

Dòng mô tả phụ trong header.

**Use case:** StatCard: render `label` KPI; card thường: subtitle ngắn.

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

### CardFooter

Footer card — actions hoặc summary.

**Use case:** `separated`: border-top + band actions; `flush`: full-bleed action bar.

#### Props hiển thị & cấu hình

| Prop        | Kiểu        | Mặc định | Mô tả                                    | Use case                                                        |
| ----------- | ----------- | -------- | ---------------------------------------- | --------------------------------------------------------------- |
| `children`  | `ReactNode` | —        | Nội dung con render bên trong component. | Text, icon, hoặc component con — ví dụ label Badge, body Alert. |
| `separated` | `boolean`   | —        | Viền tách section (thường border-top).   | CardFooter action band Save/Cancel.                             |
| `flush`     | `boolean`   | —        | Full-bleed — bỏ padding ngang.           | CardContent: table; CardFooter: action bar sát mép.             |

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

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
