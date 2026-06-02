---
title: Card Stat
lang: vi
---

Tile KPI compact — label + value + hint/delta.

## Khi nào dùng

- Dashboard ops: đơn hôm nay, SLA, backlog.
- `delta` cho xu hướng (+/-) so kỳ trước.
- `size="compact"` mặc định — xếp hàng KPI.

## Import

```tsx
import { Badge, StatCard } from "@godxjp/ui/data-display";
```

## StatCard — component chính

## Props hiển thị & cấu hình

| Prop     | Kiểu                 | Mặc định     | Mô tả                                                                    | Use case                                               |
| -------- | -------------------- | ------------ | ------------------------------------------------------------------------ | ------------------------------------------------------ |
| `label`  | `ReactNode`          | **bắt buộc** | Nhãn mô tả — thường là dòng phụ, font nhỏ.                               | StatCard: tên chỉ số KPI; FormField: tên field.        |
| `value`  | `ReactNode`          | **bắt buộc** | Giá trị hiển thị chính.                                                  | StatCard: số KPI; Select controlled: option đang chọn. |
| `hint`   | `ReactNode`          | —            | Gợi ý phụ dưới giá trị chính.                                            | StatCard: so sánh kỳ trước, đơn vị, context thêm.      |
| `delta`  | `ReactNode`          | —            | Thay đổi tương đối (±%) hiển thị cạnh value.                             | KPI tăng/giảm — ví dụ `+12%` màu success.              |
| `layout` | `stacked`, `inline`  | —            | KPI layout: stacked = design default, inline = label left / value right. | Xem demo và source component để biết ngữ cảnh cụ thể.  |
| `align`  | `start`, `end`       | —            | Align the metric group.                                                  | Xem demo và source component để biết ngữ cảnh cụ thể.  |
| `size`   | `default`, `compact` | `default`    | Kích thước preset.                                                       | Button sm trong table; Card compact cho KPI row.       |

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

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
