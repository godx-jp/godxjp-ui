---
title: AlertDialog
lang: vi
---

Dialog xác nhận với cấu trúc mặc định và hành vi confirm.

## Khi nào dùng

- Controlled `open` + `onOpenChange` — mở từ Button parent.
- `onConfirm` async + `pending` — chặn double submit.
- `confirmPhrase` cho delete tenant / dữ liệu nhạy cảm.

## Import

```tsx
import { AlertDialog } from "@godxjp/ui/feedback";
```

## Props hiển thị & cấu hình

| Prop                | Kiểu                     | Mặc định     | Mô tả                                               | Use case                                                                 |
| ------------------- | ------------------------ | ------------ | --------------------------------------------------- | ------------------------------------------------------------------------ |
| `open`              | `boolean`                | **bắt buộc** | Trạng thái mở (controlled).                         | Dialog/Sheet/Popover — bind với state `useState`.                        |
| `title`             | `ReactNode`              | **bắt buộc** | Tiêu đề chính.                                      | Dialog/PageHeader/EmptyState — dòng heading nổi bật nhất.                |
| `description`       | `ReactNode`              | —            | Nội dung mô tả chi tiết.                            | Dialog/EmptyState/Alert — body text giải thích.                          |
| `confirmLabel`      | `ReactNode`              | —            | Nhãn nút xác nhận.                                  | AlertDialog: đổi "OK" → "Xóa vĩnh viễn".                                 |
| `cancelLabel`       | `ReactNode`              | —            | Nhãn nút hủy.                                       | AlertDialog: "Hủy" / "Quay lại".                                         |
| `variant`           | `default`, `destructive` | —            | Biến thể giao diện semantic.                        | Button/Badge/Alert — chọn tone phù hợp ngữ cảnh (primary, destructive…). |
| `confirmPhrase`     | `string`                 | —            | Chuỗi user phải gõ để xác nhận hành động nguy hiểm. | Xóa tenant, xóa dữ liệu production — friction kiểu GitHub.               |
| `keepOpenOnConfirm` | `boolean`                | —            | Giữ dialog mở sau khi confirm.                      | Multi-step confirm hoặc chờ parent đóng.                                 |
| `pending`           | `boolean`                | —            | Đang xử lý — disable nút, hiện spinner.             | AlertDialog onConfirm async; MutationFeedback.                            |

## Props hành động (events & callbacks)

| Prop           | Kiểu                          | Mặc định     | Mô tả                                | Use case                                                         |
| -------------- | ----------------------------- | ------------ | ------------------------------------ | ---------------------------------------------------------------- |
| `onOpenChange` | `(open: boolean) => void`     | **bắt buộc** | Callback khi panel mở/đóng thay đổi. | Dialog/Sheet/Popover — sync `open` state; reset form khi đóng.   |
| `onConfirm`    | `() => void`, `Promise<void>` | **bắt buộc** | Xử lý khi user xác nhận.             | AlertDialog — gọi API delete/submit; có thể async + `pending`. |
| `onClick`      | `(e: MouseEvent) => void`     | —            | Xử lý khi user click.                | Button submit; row click; dismiss icon.                          |
| `onKeyDown`    | `(e: KeyboardEvent) => void`  | —            | Phím bấm.                            | Enter submit; Escape đóng dialog.                                |

## Thuộc tính DOM & accessibility

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
