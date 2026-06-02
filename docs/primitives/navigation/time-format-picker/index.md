---
title: TimeFormatPicker
lang: vi
---

TimeFormatPicker — Primitive điều hướng — menu, tab, breadcrumb, phân trang.

## Khi nào dùng

- PageHeader + Breadcrumb cho context trang.
- Tabs khi chia nội dung cùng entity.

## Import

```tsx
import { TimeFormatPicker } from "@godxjp/ui/navigation";
```

## Props hiển thị & cấu hình

| Prop       | Kiểu            | Mặc định | Mô tả                   | Use case                                               |
| ---------- | --------------- | -------- | ----------------------- | ------------------------------------------------------ |
| `disabled` | `boolean`       | —        | Vô hiệu hóa tương tác.  | Chưa đủ điều kiện submit; đang pending API.            |
| `value`    | `AppTimeFormat` | —        | Giá trị hiển thị chính. | StatCard: số KPI; Select controlled: option đang chọn. |

## Props hành động (events & callbacks)

| Prop       | Kiểu                                  | Mặc định | Mô tả                             | Use case                                   |
| ---------- | ------------------------------------- | -------- | --------------------------------- | ------------------------------------------ |
| `onChange` | `(timeFormat: AppTimeFormat) => void` | —        | Xử lý khi giá trị input thay đổi. | Controlled Input/Select — sync state form. |

## Thuộc tính DOM & accessibility

| Prop        | Kiểu     | Mặc định | Mô tả                          | Use case                                            |
| ----------- | -------- | -------- | ------------------------------ | --------------------------------------------------- |
| `className` | `string` | —        | CSS class bổ sung trên root.   | Fine-tune layout; tránh override token trừ khi cần. |
| `id`        | `string` | —        | DOM id — liên kết label/input. | FormField `htmlFor` + Input `id`.                   |

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
