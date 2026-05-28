---
title: Overview
lang: vi
---

Nút hành động chính — submit form, mở dialog, navigate.

## Khi nào dùng

- Một primary action rõ ràng mỗi vùng (PageContainer `extra`).
- `destructive` chỉ cho hành động không hoàn tác — kèm DialogConfirm.
- `ghost`/`link` cho action phụ trong table row.

## Import

```tsx
import { Button } from "@godxjp/ui/general";
```

## Props hiển thị & cấu hình

| Prop       | Kiểu                                                                 | Mặc định | Mô tả                                                    | Use case                                                                 |
| ---------- | -------------------------------------------------------------------- | -------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| `variant`  | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`    | —        | Biến thể giao diện semantic.                             | Button/Badge/Alert — chọn tone phù hợp ngữ cảnh (primary, destructive…). |
| `size`     | `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg` | —        | Kích thước preset.                                       | Button sm trong table; Card compact cho KPI row.                         |
| `asChild`  | `boolean`                                                            | —        | Radix polymorphism — merge props vào child thay wrapper. | Button asChild + Link router — giữ semantics `<a>`.                      |
| `disabled` | `boolean`                                                            | —        | Vô hiệu hóa tương tác.                                   | Chưa đủ điều kiện submit; đang pending API.                              |

## Props hành động (events & callbacks)

| Prop      | Kiểu                                         | Mặc định | Mô tả                 | Use case                                |
| --------- | -------------------------------------------- | -------- | --------------------- | --------------------------------------- |
| `onClick` | `React.MouseEventHandler<HTMLButtonElement>` | —        | Xử lý khi user click. | Button submit; row click; dismiss icon. |

## Ghi chú

- Props có tiền tố `on` là **callbacks** — gắn handler để phản hồi user.
- Sub-components compose theo thứ tự trong demo — không dùng lẻ ngoài family trừ khi API cho phép.
- Các prop DOM khác (không liệt kê) vẫn hỗ trợ qua spread HTML attributes.
- Demo live bên dưới minh họa variants/states; **View code** để copy snippet.
