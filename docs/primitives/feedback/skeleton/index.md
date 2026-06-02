---
title: Skeleton
lang: vi
---

Skeleton — Primitive phản hồi — thông báo, xác nhận, trạng thái tải.

## Khi nào dùng

- Alert/Toast cho thông báo không chặn luồng.
- Dialog/Sheet cho hành động cần xác nhận hoặc form modal.

## Import

```tsx
import { Skeleton, SkeletonCard, SkeletonDetail, SkeletonRows, SkeletonTable } from "@godxjp/ui/feedback";
```

## Components

### Skeleton

Skeleton block cơ bản.

**Use case:** Loading placeholder một dòng hoặc một khối tùy chỉnh.

### SkeletonCard

Skeleton layout card.

**Use case:** Loading thay Card thật.

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

### SkeletonDetail

Skeleton trang detail.

**Use case:** KeyValue + sections loading.

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

### SkeletonRows

Skeleton nhiều dòng.

**Use case:** List loading.

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

### SkeletonTable

Skeleton bảng.

**Use case:** Loading DataTable.

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
